/**
 * Lists and deletes S3 objects for Radar VPO plus matching FileAsset rows.
 *
 * Only touches known project prefixes to avoid wiping unrelated bucket content:
 *   promotions/, courses/, news/
 *
 * Usage:
 *   npx tsx scripts/cleanup-s3-assets.ts              # dry-run list
 *   npx tsx scripts/cleanup-s3-assets.ts --confirm    # delete objects + DB rows
 *   npx tsx scripts/cleanup-s3-assets.ts --prefix promotions/
 *
 * Env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
 * Optional: AWS_S3_ENDPOINT, AWS_S3_FORCE_PATH_STYLE, AWS_S3_PUBLIC_BASE_URL
 */
import { PrismaClient } from '@prisma/client';
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

const confirm = process.argv.includes('--confirm');
const prefixArg = process.argv.find((arg) => arg.startsWith('--prefix='));
const DEFAULT_PREFIXES = ['promotions/', 'courses/', 'news/'];
const prefixes = prefixArg ? [prefixArg.replace('--prefix=', '')] : DEFAULT_PREFIXES;

function createS3Client() {
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || process.env.S3_REGION || 'auto';
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT;
  const forcePathStyle = process.env.AWS_S3_FORCE_PATH_STYLE || process.env.S3_FORCE_PATH_STYLE;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing S3 configuration. Set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
    );
  }

  return {
    bucket,
    client: new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: forcePathStyle === 'true',
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

async function listPrefix(client: S3Client, bucket: string, prefix: string) {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const item of response.Contents || []) {
      if (item.Key) keys.push(item.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function main() {
  const prisma = new PrismaClient();
  const { client, bucket } = createS3Client();

  try {
    await prisma.$connect();

    const keysByPrefix: Record<string, string[]> = {};
    for (const prefix of prefixes) {
      keysByPrefix[prefix] = await listPrefix(client, bucket, prefix);
    }

    const allKeys = [...new Set(Object.values(keysByPrefix).flat())];
    const dbAssets = await prisma.fileAsset.findMany({
      where: {
        OR: [
          { s3Key: { in: allKeys } },
          ...prefixes.map((prefix) => ({ s3Key: { startsWith: prefix } })),
        ],
        status: { not: 'deleted' },
      },
      select: { id: true, s3Key: true, entityType: true, entityId: true },
    });

    const summary = {
      mode: confirm ? 'confirm' : 'dry-run',
      bucket,
      prefixes,
      objectCount: allKeys.length,
      keys: allKeys,
      fileAssetCount: dbAssets.length,
      fileAssets: dbAssets,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (!confirm) {
      console.log('\nDry-run only. Re-run with --confirm to delete listed objects and mark DB assets deleted.');
      return;
    }

    let deletedObjects = 0;
    const s3Errors: string[] = [];

    for (const key of allKeys) {
      try {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        deletedObjects += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        s3Errors.push(`${key}: ${message}`);
      }
    }

    let updatedAssets = 0;
    for (const asset of dbAssets) {
      await prisma.fileAsset.update({
        where: { id: asset.id },
        data: {
          status: 'deleted',
          deletedAt: new Date(),
          url: null,
        },
      });
      updatedAssets += 1;
    }

    console.log(
      JSON.stringify(
        {
          deletedObjects,
          updatedAssets,
          s3Errors,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

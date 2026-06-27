/**
 * Safe database cleanup for Radar VPO.
 *
 * Keeps only the 10 most recent promotions (by updatedAt) and removes older ones
 * with their related documents, units and favorites (Prisma cascades).
 * Also removes orphan FileAsset rows whose parent promotion no longer exists.
 *
 * Usage:
 *   npx tsx scripts/cleanup-db.ts           # dry-run (default)
 *   npx tsx scripts/cleanup-db.ts --confirm # execute deletes
 *
 * Does NOT delete users, purchases, course access, services or configuration.
 */
import { PrismaClient } from '@prisma/client';
import {
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const KEEP_PROMOTIONS = 10;
const confirm = process.argv.includes('--confirm');

function createS3Client() {
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || process.env.S3_REGION || 'auto';
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT;
  const forcePathStyle = process.env.AWS_S3_FORCE_PATH_STYLE || process.env.S3_FORCE_PATH_STYLE;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    return { client: null as S3Client | null, bucket: null as string | null };
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

async function deleteS3Key(
  client: S3Client | null,
  bucket: string | null,
  key: string,
) {
  if (!client || !bucket || !key) return { deleted: false, skipped: true };
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return { deleted: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { deleted: false, skipped: false, error: message };
  }
}

async function main() {
  const prisma = new PrismaClient();
  const { client: s3, bucket } = createS3Client();

  try {
    await prisma.$connect();

    const allPromotions = await prisma.promotion.findMany({
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, title: true, status: true, updatedAt: true },
    });

    const keep = allPromotions.slice(0, KEEP_PROMOTIONS);
    const remove = allPromotions.slice(KEEP_PROMOTIONS);
    const keepIds = new Set(keep.map((item) => item.id));

    const orphanPromotionAssets = await prisma.fileAsset.findMany({
      where: {
        entityType: 'promotion',
        entityId: { notIn: [...keepIds] },
        status: { not: 'deleted' },
      },
      select: { id: true, s3Key: true, entityId: true, originalName: true },
    });

    const summary = {
      mode: confirm ? 'confirm' : 'dry-run',
      promotions: {
        total: allPromotions.length,
        keep: keep.length,
        remove: remove.length,
        kept: keep.map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          updatedAt: item.updatedAt.toISOString(),
        })),
        toDelete: remove.map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          updatedAt: item.updatedAt.toISOString(),
        })),
      },
      orphanPromotionAssets: orphanPromotionAssets.length,
      s3Configured: Boolean(s3 && bucket),
    };

    console.log(JSON.stringify(summary, null, 2));

    if (!confirm) {
      console.log('\nDry-run only. Re-run with --confirm to apply deletes.');
      return;
    }

    let deletedPromotions = 0;
    let deletedAssets = 0;
    const s3Errors: string[] = [];

    for (const promotion of remove) {
      const documents = await prisma.promotionDocument.findMany({
        where: { promotionId: promotion.id },
        select: { fileAssetId: true },
      });

      const assetIds = documents
        .map((document) => document.fileAssetId)
        .filter((id): id is string => Boolean(id));

      if (assetIds.length > 0) {
        const assets = await prisma.fileAsset.findMany({
          where: { id: { in: assetIds } },
          select: { id: true, s3Key: true },
        });

        for (const asset of assets) {
          const result = await deleteS3Key(s3, bucket, asset.s3Key);
          if (result.error) s3Errors.push(`${asset.s3Key}: ${result.error}`);
          await prisma.fileAsset.update({
            where: { id: asset.id },
            data: { status: 'deleted', deletedAt: new Date() },
          });
          deletedAssets += 1;
        }
      }

      await prisma.promotion.delete({ where: { id: promotion.id } });
      deletedPromotions += 1;
    }

    const remainingOrphans = await prisma.fileAsset.findMany({
      where: {
        entityType: 'promotion',
        status: { not: 'deleted' },
      },
      select: { id: true, entityId: true, s3Key: true },
    });

    let cleanedOrphans = 0;
    for (const asset of remainingOrphans) {
      const parent = await prisma.promotion.findUnique({
        where: { id: asset.entityId },
        select: { id: true },
      });
      if (parent) continue;

      const result = await deleteS3Key(s3, bucket, asset.s3Key);
      if (result.error) s3Errors.push(`${asset.s3Key}: ${result.error}`);
      await prisma.fileAsset.update({
        where: { id: asset.id },
        data: { status: 'deleted', deletedAt: new Date() },
      });
      cleanedOrphans += 1;
    }

    const finalPromotionCount = await prisma.promotion.count();

    console.log(
      JSON.stringify(
        {
          deletedPromotions,
          deletedAssets,
          cleanedOrphanPromotionAssets: cleanedOrphans,
          finalPromotionCount,
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

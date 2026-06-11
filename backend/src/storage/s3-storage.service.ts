import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService {
  readonly bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
  private readonly publicBaseUrl =
    process.env.AWS_S3_PUBLIC_BASE_URL || process.env.S3_PUBLIC_BASE_URL;
  private readonly client: S3Client | null;

  constructor() {
    const accessKeyId =
      process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey =
      process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || process.env.S3_REGION || 'auto';
    const endpoint = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT;
    const forcePathStyle =
      process.env.AWS_S3_FORCE_PATH_STYLE || process.env.S3_FORCE_PATH_STYLE;

    if (!this.bucket || !accessKeyId || !secretAccessKey) {
      this.client = null;
      return;
    }

    this.client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: forcePathStyle === 'true',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(params: {
    folder: string;
    fileName: string;
    contentType: string;
    content: Buffer;
  }): Promise<{ key: string; url: string }> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Configure AWS_* or S3_* variables.',
      );
    }

    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const key = `${params.folder}/${Date.now()}-${safeName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.content,
        ContentType: params.contentType,
      }),
    );

    const url = this.publicBaseUrl
      ? `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`
      : this.buildFallbackUrl(key);

    return { key, url };
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Configure AWS_* or S3_* variables.',
      );
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedReadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Configure AWS_* or S3_* variables.',
      );
    }

    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  private buildFallbackUrl(key: string) {
    const endpoint = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT;
    if (endpoint) {
      return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }
    const region = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}

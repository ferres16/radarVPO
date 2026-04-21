import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageService {
  private readonly bucket = process.env.S3_BUCKET;
  private readonly publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  private readonly client: S3Client | null;

  constructor() {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const region = process.env.S3_REGION || 'auto';
    const endpoint = process.env.S3_ENDPOINT;

    if (!this.bucket || !accessKeyId || !secretAccessKey || !endpoint) {
      this.client = null;
      return;
    }

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
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
        'S3 storage is not configured. Configure S3_* variables.',
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
      : `${process.env.S3_ENDPOINT?.replace(/\/$/, '')}/${this.bucket}/${key}`;

    return { key, url };
  }
}

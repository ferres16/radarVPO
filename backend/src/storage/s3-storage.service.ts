import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
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
    /** Si true, intenta ACL public-read (puede fallar si el bucket tiene ACLs desactivadas). */
    isPublic?: boolean;
  }): Promise<{ key: string; url: string }> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Configure AWS_* or S3_* variables.',
      );
    }

    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const key = `${params.folder}/${Date.now()}-${safeName}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: params.content,
          ContentType: params.contentType,
          ...(params.isPublic ? { ACL: 'public-read' as const } : {}),
        }),
      );
    } catch (error) {
      // Reintento sin ACL si el bucket usa Object Ownership (ACLs disabled).
      const err = error as { name?: string; Code?: string; message?: string };
      const aclBlocked =
        params.isPublic &&
        (err.Code === 'AccessControlListNotSupported' ||
          err.name === 'AccessControlListNotSupported' ||
          /ACL/i.test(err.message || ''));
      if (aclBlocked) {
        this.logger.warn(
          `PutObject ACL public-read not supported for ${key}; uploading without ACL`,
        );
        try {
          await this.client.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: key,
              Body: params.content,
              ContentType: params.contentType,
            }),
          );
        } catch (retryError) {
          this.logS3Error('PutObject', key, retryError);
          throw retryError;
        }
      } else {
        this.logS3Error('PutObject', key, error);
        throw error;
      }
    }

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

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logS3Error('DeleteObject', key, error);
      throw error;
    }
  }

  async getSignedReadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Configure AWS_* or S3_* variables.',
      );
    }

    try {
      return await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
        { expiresIn: expiresInSeconds },
      );
    } catch (error) {
      this.logS3Error('GetSignedUrl', key, error);
      throw error;
    }
  }

  /** Lee el objeto completo (para proxy de PDF en línea, sin descarga). */
  async getObjectBuffer(key: string): Promise<{
    body: Buffer;
    contentType?: string;
    contentLength?: number;
  }> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'S3 storage is not configured. Configure AWS_* or S3_* variables.',
      );
    }

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const bytes = await response.Body?.transformToByteArray();
      if (!bytes) {
        throw new InternalServerErrorException('Empty S3 object body');
      }
      return {
        body: Buffer.from(bytes),
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch (error) {
      this.logS3Error('GetObject', key, error);
      throw error;
    }
  }

  private buildFallbackUrl(key: string) {
    const endpoint = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT;
    if (endpoint) {
      return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }
    const region =
      process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  private logS3Error(operation: string, key: string, error: unknown) {
    const err = error as {
      name?: string;
      Code?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number; requestId?: string };
    };
    this.logger.error(
      JSON.stringify({
        operation,
        bucket: this.bucket,
        key,
        error: err.name || err.Code || 'S3Error',
        message: err.message,
        statusCode: err.$metadata?.httpStatusCode,
        requestId: err.$metadata?.requestId,
      }),
    );
  }
}

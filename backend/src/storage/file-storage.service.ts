import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FileAsset, FileEntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3StorageService } from './s3-storage.service';

const DEFAULT_MAX_FILE_SIZE = 25 * 1024 * 1024;
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/quicktime',
];

type UploadFileParams = {
  entityType: FileEntityType;
  entityId: string;
  file: Express.Multer.File;
  folder: string;
  isPublic: boolean;
  uploadedByUserId?: string;
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
};

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3StorageService,
  ) {}

  async uploadFile(params: UploadFileParams) {
    this.validateFile(params.file, {
      allowedMimeTypes: params.allowedMimeTypes,
      maxSizeBytes: params.maxSizeBytes,
    });

    const upload = await this.s3.upload({
      folder: params.folder,
      fileName: params.file.originalname,
      contentType: params.file.mimetype,
      content: params.file.buffer,
    });

    try {
      return await this.prisma.fileAsset.create({
        data: {
          entityType: params.entityType,
          entityId: params.entityId,
          fileName: this.fileNameFromKey(upload.key),
          originalName: params.file.originalname,
          mimeType: params.file.mimetype,
          size: params.file.size,
          s3Key: upload.key,
          s3Bucket: this.s3.bucket || '',
          url: params.isPublic ? upload.url : null,
          isPublic: params.isPublic,
          uploadedByUserId: params.uploadedByUserId,
        },
      });
    } catch (error) {
      await this.s3.delete(upload.key).catch((deleteError: unknown) => {
        this.logger.error(
          `Uploaded object ${upload.key} could not be cleaned after DB failure`,
          deleteError instanceof Error ? deleteError.stack : undefined,
        );
      });
      throw error;
    }
  }

  async listForEntity(entityType: FileEntityType, entityId: string) {
    return this.prisma.fileAsset.findMany({
      where: { entityType, entityId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAccessibleUrl(assetId: string, canAccess: boolean) {
    const asset = await this.prisma.fileAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.status !== 'active') {
      throw new NotFoundException('File not found');
    }

    if (asset.isPublic) {
      return { url: asset.url, expiresAt: null };
    }

    if (!canAccess) {
      throw new ForbiddenException('Access denied');
    }

    const expiresInSeconds = Number(process.env.S3_SIGNED_URL_TTL_SECONDS || 900);
    const url = await this.s3.getSignedReadUrl(asset.s3Key, expiresInSeconds);
    return {
      url,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    };
  }

  async deleteAsset(assetId: string) {
    const asset = await this.prisma.fileAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('File not found');
    }

    if (asset.status === 'deleted') {
      return asset;
    }

    return this.deleteAssetRecord(asset);
  }

  async deleteAssetsForEntity(entityType: FileEntityType, entityId: string) {
    const assets = await this.prisma.fileAsset.findMany({
      where: { entityType, entityId, status: { not: 'deleted' } },
      orderBy: { createdAt: 'asc' },
    });

    const deleted = [];
    for (const asset of assets) {
      deleted.push(await this.deleteAssetRecord(asset));
    }
    return deleted;
  }

  async deleteAssetsByIds(assetIds: string[]) {
    if (assetIds.length === 0) {
      return [];
    }

    const assets = await this.prisma.fileAsset.findMany({
      where: { id: { in: assetIds }, status: { not: 'deleted' } },
      orderBy: { createdAt: 'asc' },
    });

    const deleted = [];
    for (const asset of assets) {
      deleted.push(await this.deleteAssetRecord(asset));
    }
    return deleted;
  }

  async retryFailedDeletion(assetId: string) {
    const asset = await this.prisma.fileAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.status !== 'delete_failed') {
      throw new NotFoundException('Failed file deletion not found');
    }

    return this.deleteAssetRecord(asset);
  }

  private async deleteAssetRecord(asset: FileAsset) {
    try {
      await this.s3.delete(asset.s3Key);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown S3 deletion error';
      this.logger.error(`Could not delete S3 object ${asset.s3Key}: ${message}`);
      await this.prisma.fileAsset.update({
        where: { id: asset.id },
        data: {
          status: 'delete_failed',
          deleteError: message,
        },
      });
      throw new InternalServerErrorException(
        'File could not be deleted from S3. It was queued for retry.',
      );
    }

    return this.prisma.fileAsset.update({
      where: { id: asset.id },
      data: {
        status: 'deleted',
        deletedAt: new Date(),
        deleteError: null,
      },
    });
  }

  private validateFile(
    file: Express.Multer.File | undefined,
    options: { allowedMimeTypes?: string[]; maxSizeBytes?: number },
  ) {
    if (!file?.buffer || !file.originalname) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes =
      options.allowedMimeTypes?.length
        ? options.allowedMimeTypes
        : this.allowedMimeTypesFromEnv();
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxSizeBytes =
      options.maxSizeBytes ||
      Number(process.env.MAX_FILE_SIZE_BYTES || DEFAULT_MAX_FILE_SIZE);
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File is too large');
    }
  }

  private allowedMimeTypesFromEnv() {
    const configured = process.env.ALLOWED_FILE_MIME_TYPES?.split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return configured?.length ? configured : DEFAULT_ALLOWED_MIME_TYPES;
  }

  private fileNameFromKey(key: string) {
    return key.split('/').pop() || key;
  }
}

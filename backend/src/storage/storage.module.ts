import { Module } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { S3StorageService } from './s3-storage.service';

@Module({
  providers: [S3StorageService, FileStorageService],
  exports: [S3StorageService, FileStorageService],
})
export class StorageModule {}

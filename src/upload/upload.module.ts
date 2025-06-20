import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileStorageFactory } from '../factories/file-storage.factory';
import { LocalFileStorageService } from '../services/local-file-storage.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [MulterModule.register({})],
  controllers: [UploadController],
  providers: [LocalFileStorageService, FileStorageFactory],
})
export class UploadModule {}

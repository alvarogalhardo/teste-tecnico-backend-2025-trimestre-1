import { Module } from '@nestjs/common';
import { LocalFileStorageService } from '../services/local-file-storage.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [
    {
      provide: 'FILE_STORAGE',
      useClass: LocalFileStorageService,
    },
  ],
})
export class UploadModule {}

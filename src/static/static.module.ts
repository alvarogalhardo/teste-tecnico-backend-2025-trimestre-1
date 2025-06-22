import { Module } from '@nestjs/common';
import { FileStorageFactory } from '../factories/file-storage.factory';
import { LocalFileStorageService } from '../services/local-file-storage.service';
import { StaticController } from './static.controller';

@Module({
  controllers: [StaticController],
  providers: [LocalFileStorageService, FileStorageFactory],
})
export class StaticModule {}

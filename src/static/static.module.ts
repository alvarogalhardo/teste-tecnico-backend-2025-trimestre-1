import { Module } from '@nestjs/common';
import { FileStorageFactory } from '../factories/file-storage.factory';
import { LocalFileStorageService } from '../services/local-file-storage.service';
import { MemoryCacheService } from '../services/memory-cache.service';
import { StaticController } from './static.controller';

@Module({
  controllers: [StaticController],
  providers: [
    LocalFileStorageService,
    FileStorageFactory,
    {
      provide: 'CACHE_SERVICE',
      useClass: MemoryCacheService,
    },
  ],
})
export class StaticModule {}

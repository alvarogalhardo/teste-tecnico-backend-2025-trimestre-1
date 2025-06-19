import { Module } from '@nestjs/common';
import { LocalFileStorageService } from '../services/local-file-storage.service';
import { MemoryCacheService } from '../services/memory-cache.service';
import { StaticController } from './static.controller';

@Module({
  controllers: [StaticController],
  providers: [
    {
      provide: 'FILE_STORAGE',
      useClass: LocalFileStorageService,
    },
    {
      provide: 'CACHE_SERVICE',
      useClass: MemoryCacheService,
    },
  ],
})
export class StaticModule {}

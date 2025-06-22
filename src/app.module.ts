import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { StaticModule } from './static/static.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            createKeyv(process.env.REDIS_URL || 'redis://localhost:6379'),
          ],
          ttl: 60000, // 60s
        };
      },
    }),
    UploadModule,
    StaticModule,
  ],
})
export class AppModule {}

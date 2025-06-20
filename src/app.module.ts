import { Module } from '@nestjs/common';
import { StaticModule } from './static/static.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [UploadModule, StaticModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticModule } from './static/static.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [UploadModule, StaticModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

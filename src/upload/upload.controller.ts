import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Cache } from 'cache-manager';
import {
  FileStorageFactory,
  StorageType,
} from '../factories/file-storage.factory';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly fileStorageFactory: FileStorageFactory,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Post('video')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(mp4|avi|mov|wmv|flv|webm|mkv)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    file: Express.Multer.File,
    @Body('storageType') storageType?: string,
  ): Promise<void> {
    const storage = (storageType as StorageType) || StorageType.LOCAL;
    const fileStorage = this.fileStorageFactory.create(storage);

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname || 'video'}`;

    await this.cacheManager.set(fileName, file.buffer, 60000); // 60s

    await fileStorage.saveFile(fileName, file.buffer);

    console.log(
      `Video uploaded successfully: ${fileName} using ${storage} storage`,
    );
    return;
  }
}

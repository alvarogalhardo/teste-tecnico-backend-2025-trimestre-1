import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FileStorageFactory,
  StorageType,
} from '../factories/file-storage.factory';

@Controller('upload')
export class UploadController {
  constructor(private readonly fileStorageFactory: FileStorageFactory) {}

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
  ) {
    const storage = (storageType as StorageType) || StorageType.LOCAL;
    const fileStorage = this.fileStorageFactory.create(storage);

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname || 'video'}`;

    await fileStorage.saveFile(fileName, file.buffer);

    console.log(
      `Video uploaded successfully: ${fileName} using ${storage} storage`,
    );

    return;
  }
}

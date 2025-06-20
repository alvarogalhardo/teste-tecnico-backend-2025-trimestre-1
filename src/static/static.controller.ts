import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import {
  FileStorageFactory,
  StorageType,
} from '../factories/file-storage.factory';
import { CacheInterface } from '../interfaces/cache.interface';

@Controller('static')
export class StaticController {
  constructor(
    private readonly fileStorageFactory: FileStorageFactory,
    @Inject('CACHE_SERVICE') private readonly cache: CacheInterface,
  ) {}

  @Get('video/:filename')
  async getVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    const fileStorage = this.fileStorageFactory.create(StorageType.LOCAL);

    if (!fileStorage.fileExists(filename)) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    let fileBuffer = await this.cache.get(filename);

    if (!fileBuffer) {
      fileBuffer = await fileStorage.getFile(filename);

      if (!fileBuffer) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      await this.cache.set(filename, fileBuffer, 60);
    }

    const mimeType = this.getMimeType(filename);

    res.set({
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=60',
    });

    if (range) {
      this.handleRangeRequest(range, fileBuffer, res);
    } else {
      this.handleFullFileRequest(fileBuffer, res);
    }
  }

  private handleRangeRequest(
    range: string,
    fileBuffer: Buffer,
    res: Response,
  ): void {
    const fileSize = fileBuffer.length;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).send('Range Not Satisfiable');
      return;
    }

    res.status(HttpStatus.PARTIAL_CONTENT);
    res.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunkSize.toString(),
    });

    const chunk = fileBuffer.slice(start, end + 1);
    res.send(chunk);
  }

  private handleFullFileRequest(fileBuffer: Buffer, res: Response): void {
    res.status(HttpStatus.OK);
    res.set({
      'Content-Length': fileBuffer.length.toString(),
    });
    res.send(fileBuffer);
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

import { CACHE_MANAGER } from '@nestjs/cache-manager';
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
import { Cache } from 'cache-manager';
import { Response } from 'express';
import * as path from 'path';
import {
  FileStorageFactory,
  StorageType,
} from '../factories/file-storage.factory';

@Controller('static')
export class StaticController {
  constructor(
    private readonly fileStorageFactory: FileStorageFactory,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get('video/:filename')
  async getVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    const fileStorage = this.fileStorageFactory.create(StorageType.LOCAL);

    let fileBuffer = await this.cacheManager.get<Buffer>(filename);

    if (!fileBuffer) {
      if (!fileStorage.fileExists(filename)) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      const file = await fileStorage.getFile(filename);

      if (!file) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      fileBuffer = file;

      await this.cacheManager.set(filename, fileBuffer, 60000);
    }

    const mimeType = this.getMimeType(filename);
    const fileSize = fileBuffer.length;

    res.set({
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=60',
      'Content-Length': fileSize.toString(),
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

    // Parse do header Range: "bytes=start-end"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.status(416); // Range Not Satisfiable
      res.set({
        'Content-Range': `bytes */${fileSize}`,
      });
      res.send('Range Not Satisfiable');
      return;
    }

    const chunkSize = end - start + 1;
    const chunk = fileBuffer.slice(start, end + 1);

    res.status(HttpStatus.PARTIAL_CONTENT);
    res.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunkSize.toString(),
    });

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

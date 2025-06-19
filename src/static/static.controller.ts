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
import { CacheInterface } from '../interfaces/cache.interface';
import { FileStorageInterface } from '../interfaces/file-storage.interface';

@Controller('static')
export class StaticController {
  constructor(
    @Inject('FILE_STORAGE') private readonly fileStorage: FileStorageInterface,
    @Inject('CACHE_SERVICE') private readonly cache: CacheInterface,
  ) {}

  @Get('video/:filename')
  async getVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    // Verificar se o arquivo existe
    if (!(await this.fileStorage.fileExists(filename))) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Tentar obter do cache primeiro
    let fileBuffer = await this.cache.get(filename);

    if (!fileBuffer) {
      // Se não está em cache, ler do sistema de arquivos
      fileBuffer = await this.fileStorage.getFile(filename);

      if (!fileBuffer) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      // Adicionar ao cache com TTL de 60s
      await this.cache.set(filename, fileBuffer, 60);
    }

    const fileSize = fileBuffer.length;
    const mimeType = this.getMimeType(filename);

    // Definir headers básicos
    res.set({
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=60',
    });

    if (range) {
      // Processar Range request para streaming
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
    } else {
      // Retornar arquivo completo
      res.status(HttpStatus.OK);
      res.set({
        'Content-Length': fileSize.toString(),
      });
      res.send(fileBuffer);
    }
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

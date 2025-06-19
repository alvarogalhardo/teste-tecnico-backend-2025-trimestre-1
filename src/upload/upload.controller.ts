import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageInterface } from '../interfaces/file-storage.interface';

@Controller('upload')
export class UploadController {
  constructor(
    @Inject('FILE_STORAGE') private readonly fileStorage: FileStorageInterface,
  ) {}

  @Post('video')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Validar tipo de arquivo (vídeo)
    const videoMimeTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
    ];

    if (!file.mimetype || !videoMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Arquivo deve ser um vídeo válido');
    }

    // Validar tamanho máximo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (!file.size || file.size > maxSize) {
      throw new BadRequestException('Arquivo deve ter no máximo 10MB');
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname || 'video'}`;

    // Salvar arquivo usando o serviço de armazenamento
    if (file.buffer) {
      await this.fileStorage.saveFile(fileName, file.buffer);
    } else {
      throw new BadRequestException('Erro ao processar o arquivo');
    }

    console.log(`Video uploaded successfully: ${fileName}`);

    // Retorna 204 (No Content) em caso de sucesso
    return;
  }
}

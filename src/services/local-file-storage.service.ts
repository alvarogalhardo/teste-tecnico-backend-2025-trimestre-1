import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FileStorageInterface } from '../interfaces/file-storage.interface';

@Injectable()
export class LocalFileStorageService implements FileStorageInterface {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Criar diretório de uploads se não existir
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(filename: string, data: Buffer): Promise<void> {
    const filePath = path.join(this.uploadsDir, filename);
    await fs.promises.writeFile(filePath, data);
  }

  async getFile(filename: string): Promise<Buffer | null> {
    const filePath = path.join(this.uploadsDir, filename);

    if (!(this.fileExists(filename))) {
      return null;
    }

    return await fs.promises.readFile(filePath);
  }

  fileExists(filename: string): boolean {
    const filePath = path.join(this.uploadsDir, filename);
    return fs.existsSync(filePath);
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, filename);

    if (await this.fileExists(filename)) {
      await fs.promises.unlink(filePath);
    }
  }
}

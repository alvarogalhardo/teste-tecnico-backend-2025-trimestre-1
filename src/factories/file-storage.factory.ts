import { Injectable } from '@nestjs/common';
import { FileStorageInterface } from '../interfaces/file-storage.interface';
import { LocalFileStorageService } from '../services/local-file-storage.service';

export enum StorageType {
  LOCAL = 'local',
}

@Injectable()
export class FileStorageFactory {
  constructor(private readonly localStorage: LocalFileStorageService) {}

  create(type: StorageType): FileStorageInterface {
    switch (type) {
      case StorageType.LOCAL:
        return this.localStorage;
      default:
        throw new Error(`Storage type not supported`);
    }
  }
}

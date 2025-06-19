export interface FileStorageInterface {
  saveFile(filename: string, data: Buffer): Promise<void>;
  getFile(filename: string): Promise<Buffer | null>;
  fileExists(filename: string): boolean;
  deleteFile(filename: string): Promise<void>;
}

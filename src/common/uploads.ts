import { join, resolve } from 'path';

export function getUploadsRoot(): string {
  const configuredDirectory = process.env.UPLOADS_DIR?.trim();

  return configuredDirectory
    ? resolve(configuredDirectory)
    : join(process.cwd(), 'uploads');
}

export function getUploadPath(...segments: string[]): string {
  return join(getUploadsRoot(), ...segments);
}

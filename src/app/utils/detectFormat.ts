import type { InputFormat } from '../types';

/**
 * Detects the input format from a file's MIME type
 */
export function detectInputFormat(file: File): InputFormat | null {
  const type = file.type.toLowerCase();

  if (type === 'image/png') {
    return 'png';
  }

  if (type === 'image/jpeg' || type === 'image/jpg') {
    return 'jpg';
  }

  return null;
}

/**
 * Checks if a file is a valid image format
 */
export function isValidImageFormat(file: File): boolean {
  return detectInputFormat(file) !== null;
}

/**
 * Gets the file extension for an output format
 */
export function getOutputExtension(format: string): string {
  switch (format) {
    case 'png':
      return '.png';
    case 'mozjpg':
      return '.jpg';
    case 'webp':
      return '.webp';
    default:
      return '';
  }
}

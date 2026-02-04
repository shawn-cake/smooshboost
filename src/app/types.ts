// Input format detected from file MIME type
export type InputFormat = 'png' | 'jpg';

// Output format user selects
export type OutputFormat = 'png' | 'mozjpg' | 'webp';

// Format mode: match input format or convert all to a specific format
export type FormatMode = 'match' | 'convert';

// Compression engine used
export type CompressionEngine = 'tinypng' | 'oxipng' | 'mozjpeg' | 'webp';

// Processing status
export type ImageStatus = 'queued' | 'compressing' | 'complete' | 'error';

// Core image item in the queue
export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  inputFormat: InputFormat;
  outputFormat: OutputFormat;
  status: ImageStatus;
  engine: CompressionEngine | null;
  thumbnail: string | null;
  compressedBlob: Blob | null;
  compressedSize: number | null;
  error: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Compression result
export interface CompressionResult {
  blob: Blob;
  size: number;
  engine: CompressionEngine;
}

// Savings calculation
export interface Savings {
  percentage: number;
  savedBytes: number;
  originalSize: number;
  compressedSize: number;
}

// Format option for selector
export interface FormatOption {
  value: OutputFormat;
  label: string;
  description: string;
}

// Error types for consistent handling
export type CompressionErrorType =
  | 'file_too_large'
  | 'invalid_format'
  | 'batch_limit_exceeded'
  | 'compression_failed'
  | 'network_error';

export interface CompressionError {
  type: CompressionErrorType;
  message: string;
  filename?: string;
}

// Validation constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_BATCH_SIZE = 10;
export const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// Format options for the selector (no descriptions - keep it clean)
export const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'png',
    label: 'PNG',
    description: '',
  },
  {
    value: 'mozjpg',
    label: 'JPG',
    description: '',
  },
  {
    value: 'webp',
    label: 'WebP',
    description: '',
  },
];

/**
 * Maps input format to the matching output format
 * JPG input -> MozJPG output (optimized JPEG)
 * PNG input -> PNG output (optimized PNG)
 */
export function getMatchingOutputFormat(inputFormat: InputFormat): OutputFormat {
  return inputFormat === 'jpg' ? 'mozjpg' : 'png';
}

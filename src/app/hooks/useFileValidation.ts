import { useCallback } from 'react';
import type { ValidationResult } from '../types';
import { MAX_FILE_SIZE, MAX_BATCH_SIZE, VALID_MIME_TYPES } from '../types';
import { formatBytes } from '../utils';

/**
 * Magic bytes for supported image formats
 * PNG: 89 50 4E 47 0D 0A 1A 0A (8 bytes)
 * JPEG: FF D8 FF (3 bytes)
 * WebP: 52 49 46 46 (RIFF) + 57 45 42 50 (WEBP) at bytes 8-11
 */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

/**
 * Validates file magic bytes to ensure it's a real image
 */
async function validateMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for PNG magic bytes
    const isPNG = PNG_MAGIC.every((byte, i) => bytes[i] === byte);
    if (isPNG) return true;

    // Check for JPEG magic bytes
    const isJPEG = JPEG_MAGIC.every((byte, i) => bytes[i] === byte);
    if (isJPEG) return true;

    // Check for WebP magic bytes (RIFF header at 0-3, WEBP at 8-11)
    const isRIFF = RIFF_MAGIC.every((byte, i) => bytes[i] === byte);
    const isWEBP = WEBP_MAGIC.every((byte, i) => bytes[i + 8] === byte);
    if (isRIFF && isWEBP) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Hook for validating files before upload
 */
export function useFileValidation() {
  /**
   * Validates a single file (synchronous checks only)
   */
  const validateFileSync = useCallback((file: File): ValidationResult => {
    const errors: string[] = [];

    // Check file type (MIME type - fast but can be spoofed)
    if (!VALID_MIME_TYPES.includes(file.type)) {
      errors.push(`"${file.name}" is not a valid image format (PNG, JPG, or WebP only)`);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `"${file.name}" exceeds the ${formatBytes(MAX_FILE_SIZE)} size limit`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, []);

  /**
   * Validates a single file with magic byte verification (async)
   */
  const validateFile = useCallback(
    async (file: File): Promise<ValidationResult> => {
      const errors: string[] = [];

      // Run synchronous checks first
      const syncResult = validateFileSync(file);
      errors.push(...syncResult.errors);

      // If sync checks passed, verify magic bytes
      if (syncResult.valid) {
        const validMagicBytes = await validateMagicBytes(file);
        if (!validMagicBytes) {
          errors.push(
            `"${file.name}" appears to be corrupted or is not a valid image file`
          );
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [validateFileSync]
  );

  /**
   * Validates a batch of files (checks batch limit only, sync)
   */
  const validateBatch = useCallback(
    (files: File[], existingCount: number): ValidationResult => {
      const errors: string[] = [];

      // Check batch limit
      const totalCount = existingCount + files.length;
      if (totalCount > MAX_BATCH_SIZE) {
        const remaining = MAX_BATCH_SIZE - existingCount;
        errors.push(
          `Batch limit exceeded. You can add ${remaining} more image${remaining !== 1 ? 's' : ''} (max ${MAX_BATCH_SIZE})`
        );
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    []
  );

  /**
   * Filters valid files from a list with magic byte verification (async)
   */
  const filterValidFiles = useCallback(
    async (files: File[]): Promise<{ valid: File[]; errors: string[] }> => {
      const valid: File[] = [];
      const errors: string[] = [];

      // Validate all files in parallel for better performance
      const validationResults = await Promise.all(
        files.map(async (file) => ({
          file,
          result: await validateFile(file),
        }))
      );

      for (const { file, result } of validationResults) {
        if (result.valid) {
          valid.push(file);
        } else {
          errors.push(...result.errors);
        }
      }

      return { valid, errors };
    },
    [validateFile]
  );

  return {
    validateFile,
    validateFileSync,
    validateBatch,
    filterValidFiles,
    MAX_FILE_SIZE,
    MAX_BATCH_SIZE,
  };
}

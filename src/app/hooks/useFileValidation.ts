import { useCallback } from 'react';
import type { ValidationResult } from '../types';
import { MAX_FILE_SIZE, MAX_BATCH_SIZE, VALID_MIME_TYPES } from '../types';
import { formatBytes } from '../utils';

/**
 * Hook for validating files before upload
 */
export function useFileValidation() {
  /**
   * Validates a single file
   */
  const validateFile = useCallback((file: File): ValidationResult => {
    const errors: string[] = [];

    // Check file type
    if (!VALID_MIME_TYPES.includes(file.type)) {
      errors.push(`"${file.name}" is not a valid image format (PNG or JPG only)`);
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
   * Validates a batch of files
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

      // Validate each file
      for (const file of files) {
        const fileResult = validateFile(file);
        errors.push(...fileResult.errors);
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [validateFile]
  );

  /**
   * Filters valid files from a list
   */
  const filterValidFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const result = validateFile(file);
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
    validateBatch,
    filterValidFiles,
    MAX_FILE_SIZE,
    MAX_BATCH_SIZE,
  };
}

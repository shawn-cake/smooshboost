import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileValidation } from './useFileValidation';

/**
 * Helper to create a File with specific magic bytes
 */
function createFileWithMagicBytes(
  name: string,
  mimeType: string,
  magicBytes: number[]
): File {
  const buffer = new Uint8Array(magicBytes);
  return new File([buffer], name, { type: mimeType });
}

// Magic byte constants for testing (padded to 12 bytes minimum for slice operation)
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00];
const JPEG_MAGIC = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
// WebP: RIFF at 0-3, file size at 4-7, WEBP at 8-11
const WEBP_MAGIC = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];

describe('useFileValidation', () => {
  describe('validateFileSync', () => {
    it('should accept valid PNG file', () => {
      const { result } = renderHook(() => useFileValidation());
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      const validation = result.current.validateFileSync(file);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should accept valid JPEG file', () => {
      const { result } = renderHook(() => useFileValidation());
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const validation = result.current.validateFileSync(file);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should accept valid WebP file', () => {
      const { result } = renderHook(() => useFileValidation());
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      
      const validation = result.current.validateFileSync(file);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject unsupported file types', () => {
      const { result } = renderHook(() => useFileValidation());
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      
      const validation = result.current.validateFileSync(file);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain('not a valid image format');
    });

    it('should reject files exceeding size limit', () => {
      const { result } = renderHook(() => useFileValidation());
      // Create a file larger than 5MB
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      
      const validation = result.current.validateFileSync(file);
      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('exceeds');
    });
  });

  describe('validateFile (async with magic bytes)', () => {
    /**
     * Helper to create a file with proper magic bytes that works in jsdom
     * Uses ArrayBuffer directly for better compatibility
     */
    function createValidFile(name: string, mimeType: string, magicBytes: number[]): File {
      const buffer = new ArrayBuffer(magicBytes.length);
      const view = new Uint8Array(buffer);
      magicBytes.forEach((byte, i) => { view[i] = byte; });
      return new File([buffer], name, { type: mimeType });
    }

    it('should accept PNG with valid magic bytes', async () => {
      const { result } = renderHook(() => useFileValidation());
      // Use Uint8Array directly in File constructor
      const bytes = new Uint8Array(PNG_MAGIC);
      const file = new File([bytes], 'test.png', { type: 'image/png' });

      const validation = await result.current.validateFile(file);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should accept JPEG with valid magic bytes', async () => {
      const { result } = renderHook(() => useFileValidation());
      const bytes = new Uint8Array(JPEG_MAGIC);
      const file = new File([bytes], 'test.jpg', { type: 'image/jpeg' });

      const validation = await result.current.validateFile(file);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should accept WebP with valid magic bytes', async () => {
      const { result } = renderHook(() => useFileValidation());
      const bytes = new Uint8Array(WEBP_MAGIC);
      const file = new File([bytes], 'test.webp', { type: 'image/webp' });

      const validation = await result.current.validateFile(file);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject file with spoofed MIME type (wrong magic bytes)', async () => {
      const { result } = renderHook(() => useFileValidation());
      // File claims to be PNG but has wrong magic bytes (12 bytes of zeros)
      const invalidBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const file = new File([invalidBytes], 'fake.png', { type: 'image/png' });

      const validation = await result.current.validateFile(file);
      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('corrupted or is not a valid image');
    });
  });

  describe('validateBatch', () => {
    it('should accept batch within limit', () => {
      const { result } = renderHook(() => useFileValidation());
      const files = Array(5).fill(null).map((_, i) => 
        new File(['test'], `test${i}.png`, { type: 'image/png' })
      );
      
      const validation = result.current.validateBatch(files, 0);
      expect(validation.valid).toBe(true);
    });

    it('should reject batch exceeding limit', () => {
      const { result } = renderHook(() => useFileValidation());
      const files = Array(25).fill(null).map((_, i) => 
        new File(['test'], `test${i}.png`, { type: 'image/png' })
      );
      
      const validation = result.current.validateBatch(files, 0);
      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('Batch limit exceeded');
    });

    it('should consider existing count when validating batch', () => {
      const { result } = renderHook(() => useFileValidation());
      const files = Array(5).fill(null).map((_, i) => 
        new File(['test'], `test${i}.png`, { type: 'image/png' })
      );
      
      // Already have 18 images, adding 5 more would exceed 20
      const validation = result.current.validateBatch(files, 18);
      expect(validation.valid).toBe(false);
    });
  });
});


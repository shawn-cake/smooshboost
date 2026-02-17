import { describe, it, expect } from 'vitest';
import { 
  VALID_MIME_TYPES, 
  getMatchingOutputFormat,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
} from './types';
import type { InputFormat } from './types';

describe('VALID_MIME_TYPES', () => {
  it('should include image/png', () => {
    expect(VALID_MIME_TYPES).toContain('image/png');
  });

  it('should include image/jpeg', () => {
    expect(VALID_MIME_TYPES).toContain('image/jpeg');
  });

  it('should include image/jpg', () => {
    expect(VALID_MIME_TYPES).toContain('image/jpg');
  });

  it('should include image/webp', () => {
    expect(VALID_MIME_TYPES).toContain('image/webp');
  });

  it('should have exactly 4 valid MIME types', () => {
    expect(VALID_MIME_TYPES).toHaveLength(4);
  });

  it('should not include unsupported formats like gif', () => {
    expect(VALID_MIME_TYPES).not.toContain('image/gif');
  });
});

describe('getMatchingOutputFormat', () => {
  it('should map png input to png output', () => {
    expect(getMatchingOutputFormat('png')).toBe('png');
  });

  it('should map jpg input to mozjpg output', () => {
    expect(getMatchingOutputFormat('jpg')).toBe('mozjpg');
  });

  it('should map webp input to webp output', () => {
    expect(getMatchingOutputFormat('webp')).toBe('webp');
  });

  it('should handle all InputFormat values', () => {
    const inputFormats: InputFormat[] = ['png', 'jpg', 'webp'];
    
    inputFormats.forEach((format) => {
      const result = getMatchingOutputFormat(format);
      expect(result).toBeDefined();
      expect(['png', 'mozjpg', 'webp']).toContain(result);
    });
  });
});

describe('Constants', () => {
  it('should have MAX_FILE_SIZE of 5MB', () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it('should have MAX_BATCH_SIZE of 20', () => {
    expect(MAX_BATCH_SIZE).toBe(20);
  });
});


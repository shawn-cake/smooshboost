import { describe, it, expect } from 'vitest';
import {
  VALID_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  FORMAT_OPTIONS,
} from './types';

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

describe('FORMAT_OPTIONS', () => {
  it('should offer png, mozjpg, and webp outputs', () => {
    expect(FORMAT_OPTIONS.map((opt) => opt.value)).toEqual([
      'png',
      'mozjpg',
      'webp',
    ]);
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

import { describe, it, expect } from 'vitest';
import { detectInputFormat, isValidImageFormat, getOutputExtension } from './detectFormat';

describe('detectInputFormat', () => {
  it('should detect PNG format', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    expect(detectInputFormat(file)).toBe('png');
  });

  it('should detect JPEG format (image/jpeg)', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    expect(detectInputFormat(file)).toBe('jpg');
  });

  it('should detect JPEG format (image/jpg)', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpg' });
    expect(detectInputFormat(file)).toBe('jpg');
  });

  it('should detect WebP format', () => {
    const file = new File([''], 'test.webp', { type: 'image/webp' });
    expect(detectInputFormat(file)).toBe('webp');
  });

  it('should return null for unsupported formats', () => {
    const file = new File([''], 'test.gif', { type: 'image/gif' });
    expect(detectInputFormat(file)).toBeNull();
  });

  it('should return null for non-image files', () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    expect(detectInputFormat(file)).toBeNull();
  });

  it('should handle uppercase MIME types', () => {
    // Create a file and manually check case-insensitivity
    const file = new File([''], 'test.webp', { type: 'IMAGE/WEBP' });
    expect(detectInputFormat(file)).toBe('webp');
  });
});

describe('isValidImageFormat', () => {
  it('should return true for PNG', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    expect(isValidImageFormat(file)).toBe(true);
  });

  it('should return true for JPEG', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    expect(isValidImageFormat(file)).toBe(true);
  });

  it('should return true for WebP', () => {
    const file = new File([''], 'test.webp', { type: 'image/webp' });
    expect(isValidImageFormat(file)).toBe(true);
  });

  it('should return false for unsupported formats', () => {
    const file = new File([''], 'test.gif', { type: 'image/gif' });
    expect(isValidImageFormat(file)).toBe(false);
  });
});

describe('getOutputExtension', () => {
  it('should return .png for png format', () => {
    expect(getOutputExtension('png')).toBe('.png');
  });

  it('should return .jpg for mozjpg format', () => {
    expect(getOutputExtension('mozjpg')).toBe('.jpg');
  });

  it('should return .webp for webp format', () => {
    expect(getOutputExtension('webp')).toBe('.webp');
  });

  it('should return empty string for unknown format', () => {
    expect(getOutputExtension('unknown')).toBe('');
  });
});


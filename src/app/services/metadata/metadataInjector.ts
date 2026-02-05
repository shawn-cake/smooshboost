import type {
  MetadataOptions,
  AppliedMetadata,
  OutputFormat,
} from '../../types';
import { FORMAT_CAPABILITIES } from '../../types';
import { injectJpgMetadata } from './jpgMetadata';
import { injectPngMetadata } from './pngMetadata';
import { injectWebpMetadata } from './webpMetadata';

export interface MetadataInjectionResult {
  blob: Blob;
  applied: AppliedMetadata;
  warnings: string[];
}

/**
 * Maximum character limits for metadata fields
 * Based on IPTC/XMP standards and SEO best practices
 */
const METADATA_LIMITS = {
  title: 100, // IPTC recommends 64, Google indexes ~70, generous at 100
  description: 500, // IPTC allows 2000, SEO recommends 150-160, generous at 500
  copyright: 200, // No standard, 200 is plenty for any notice
  author: 150, // Handles long business/photographer names
};

/**
 * Sanitizes a text string for safe metadata injection
 * - Removes control characters (except newlines/tabs in descriptions)
 * - Trims whitespace
 * - Enforces maximum length
 */
function sanitizeText(
  text: string,
  maxLength: number,
  allowNewlines = false
): string {
  let sanitized = text;

  // Remove control characters (0x00-0x1F, 0x7F)
  // Optionally preserve newlines (0x0A) and tabs (0x09) for descriptions
  if (allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ' ');
  }

  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/  +/g, ' ');

  // Trim and enforce length limit
  return sanitized.trim().slice(0, maxLength);
}

/**
 * Sanitizes all text fields in metadata options
 */
function sanitizeMetadataOptions(options: MetadataOptions): MetadataOptions {
  return {
    ...options,
    copyright: {
      text: sanitizeText(options.copyright.text, METADATA_LIMITS.copyright),
      author: sanitizeText(options.copyright.author, METADATA_LIMITS.author),
    },
    titleDesc: {
      title: sanitizeText(options.titleDesc.title, METADATA_LIMITS.title),
      description: sanitizeText(
        options.titleDesc.description,
        METADATA_LIMITS.description,
        true // Allow newlines in descriptions
      ),
    },
  };
}

/**
 * Validate metadata options against format capabilities
 * Returns warnings for unsupported metadata types
 */
export function validateMetadataForFormat(
  options: MetadataOptions,
  format: OutputFormat
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const normalizedFormat = format === 'mozjpg' ? 'jpg' : format;
  const capabilities = FORMAT_CAPABILITIES[normalizedFormat];

  if (!capabilities) {
    warnings.push(`Unknown format: ${format}`);
    return { valid: true, warnings };
  }

  // Check GPS capability
  if (
    options.geoTagEnabled &&
    options.geoTag.latitude !== null &&
    options.geoTag.longitude !== null &&
    !capabilities.geoTag
  ) {
    warnings.push(
      `GPS coordinates are not supported in ${format.toUpperCase()} format. Consider using JPG or WebP.`
    );
  }

  return { valid: true, warnings };
}

/**
 * Check if any metadata is enabled and has values
 */
export function hasMetadataToInject(options: MetadataOptions): boolean {
  if (
    options.geoTagEnabled &&
    options.geoTag.latitude !== null &&
    options.geoTag.longitude !== null
  ) {
    return true;
  }

  if (options.copyrightEnabled && options.copyright.text.trim()) {
    return true;
  }

  if (
    options.titleDescEnabled &&
    (options.titleDesc.title.trim() || options.titleDesc.description.trim())
  ) {
    return true;
  }

  return false;
}

/**
 * Inject metadata into an image blob based on its format
 * Routes to appropriate format-specific handler
 */
export async function injectMetadata(
  blob: Blob,
  format: OutputFormat,
  options: MetadataOptions
): Promise<MetadataInjectionResult> {
  const normalizedFormat = format === 'mozjpg' ? 'jpg' : format;

  // Validate and collect warnings
  const { warnings } = validateMetadataForFormat(options, format);

  // If no metadata enabled, return original blob
  if (!hasMetadataToInject(options)) {
    return {
      blob,
      applied: {
        geoTag: null,
        copyright: null,
        title: null,
        description: null,
      },
      warnings,
    };
  }

  // Sanitize text fields before injection
  const sanitizedOptions = sanitizeMetadataOptions(options);

  try {
    switch (normalizedFormat) {
      case 'jpg': {
        const result = await injectJpgMetadata(blob, sanitizedOptions);
        return { ...result, warnings };
      }

      case 'png': {
        const result = await injectPngMetadata(blob, sanitizedOptions);
        return {
          blob: result.blob,
          applied: result.applied,
          warnings: [...warnings, ...result.warnings],
        };
      }

      case 'webp': {
        const result = await injectWebpMetadata(blob, sanitizedOptions);
        return { ...result, warnings };
      }

      default:
        // Unknown format - return original with warning
        warnings.push(`Metadata injection not supported for format: ${format}`);
        return {
          blob,
          applied: {
            geoTag: null,
            copyright: null,
            title: null,
            description: null,
          },
          warnings,
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to inject metadata: ${errorMessage}`);
  }
}

/**
 * Get default metadata options
 */
export function getDefaultMetadataOptions(): MetadataOptions {
  return {
    geoTagEnabled: false,
    geoTag: {
      mapsLink: '',
      address: '',
      latitude: null,
      longitude: null,
    },
    copyrightEnabled: false,
    copyright: {
      text: '',
      author: '',
    },
    titleDescEnabled: false,
    titleDesc: {
      title: '',
      description: '',
    },
  };
}


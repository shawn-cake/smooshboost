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

  try {
    switch (normalizedFormat) {
      case 'jpg': {
        const result = await injectJpgMetadata(blob, options);
        return { ...result, warnings };
      }

      case 'png': {
        const result = await injectPngMetadata(blob, options);
        return {
          blob: result.blob,
          applied: result.applied,
          warnings: [...warnings, ...result.warnings],
        };
      }

      case 'webp': {
        const result = await injectWebpMetadata(blob, options);
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


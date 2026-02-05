// Input format detected from file MIME type
export type InputFormat = 'png' | 'jpg';

// Output format user selects
export type OutputFormat = 'png' | 'mozjpg' | 'webp';

// Format mode: match input format or convert all to a specific format
export type FormatMode = 'match' | 'convert';

// Compression engine used
export type CompressionEngine = 'tinypng' | 'oxipng' | 'mozjpeg' | 'webp';

// Workflow mode: determines which phases are active
export type WorkflowMode = 'smoosh-boost' | 'smoosh-only' | 'boost-only';

// Processing status - updated to include compressed state (awaiting boost)
export type ImageStatus =
  | 'queued'
  | 'compressing'
  | 'compressed' // Awaiting Boost phase
  | 'boosting'
  | 'complete'
  | 'error';

// Boost phase status
export type BoostStatus =
  | 'pending' // Not yet boosted
  | 'boosting' // Currently injecting metadata
  | 'boosted' // Metadata successfully applied
  | 'boost-skipped' // User skipped Boost phase
  | 'boost-failed'; // Metadata injection failed

// Geo-tag coordinates
export interface GeoTag {
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;
  source?: 'manual' | 'maps-link' | 'places-api';
}

// Applied metadata (what was actually injected)
export interface AppliedMetadata {
  geoTag: GeoTag | null;
  copyright: string | null;
  title: string | null;
  description: string | null;
}

// Metadata options (user input configuration)
export interface MetadataOptions {
  geoTagEnabled: boolean;
  geoTag: {
    mapsLink: string;
    latitude: number | null;
    longitude: number | null;
    address?: string;
  };
  copyrightEnabled: boolean;
  copyright: {
    text: string;
    author: string;
  };
  titleDescEnabled: boolean;
  titleDesc: {
    title: string;
    description: string;
  };
}

// Default metadata options
export const DEFAULT_METADATA_OPTIONS: MetadataOptions = {
  geoTagEnabled: false,
  geoTag: {
    mapsLink: '',
    latitude: null,
    longitude: null,
    address: '',
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

// Metadata application mode
export type MetadataApplicationMode = 'apply-to-all' | 'per-image';

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
  // Boost phase fields
  boostStatus: BoostStatus;
  boostError: string | null;
  finalBlob: Blob | null; // After metadata injection
  metadata: AppliedMetadata | null;
  metadataWarnings: string[];
  // Per-image metadata options
  metadataOptions: MetadataOptions;
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

export type BoostErrorType =
  | 'metadata_injection_failed'
  | 'geocoding_failed'
  | 'geocoding_parse_failed'
  | 'coordinate_out_of_range';

export type WarningType = 'metadata_format_unsupported';

export interface CompressionError {
  type: CompressionErrorType;
  message: string;
  filename?: string;
}

// Format capabilities for metadata injection
export interface FormatCapabilities {
  geoTag: boolean;
  copyright: boolean;
  titleDesc: boolean;
}

export const FORMAT_CAPABILITIES: Record<string, FormatCapabilities> = {
  jpg: { geoTag: true, copyright: true, titleDesc: true },
  mozjpg: { geoTag: true, copyright: true, titleDesc: true },
  png: { geoTag: false, copyright: true, titleDesc: true },
  webp: { geoTag: true, copyright: true, titleDesc: true },
};

// Metadata summary statistics
export interface MetadataSummary {
  geoTaggedCount: number;
  copyrightCount: number;
  titleCount: number;
}

// Validation constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_BATCH_SIZE = 20;
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

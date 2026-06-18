// ── Messages FROM sandbox TO UI ──

export interface SelectionUpdateMsg {
  type: 'SELECTION_UPDATE';
  count: number;
}

// Format the user picked in the UI. JPG/PNG export directly from Figma;
// WEBP exports a lossless PNG from Figma that the UI transcodes to WebP.
export type OutputFormat = 'JPG' | 'PNG' | 'WEBP';

export interface ExportedFile {
  name: string;
  data: number[]; // Uint8Array serialized as number[]
  // MIME of the bytes Figma actually produced (PNG for both PNG and WEBP targets).
  type: 'image/png' | 'image/jpeg';
  // The format the user requested — drives which codec the UI runs.
  targetFormat: OutputFormat;
  // Future Boost-phase: per-file metadata would be added here, e.g.:
  //   metadata?: {
  //     geoTag?: { latitude: number; longitude: number };
  //     copyright?: string;
  //     title?: string;
  //     description?: string;
  //   }
}

export interface ExportReadyMsg {
  type: 'EXPORT_READY';
  files: ExportedFile[];
}

// ── Messages FROM UI TO sandbox ──

export interface ExportRequestMsg {
  type: 'EXPORT_REQUEST';
  format: OutputFormat;
  scale: number;
  // Future Boost-phase: metadata options would be added here, e.g.:
  //   metadata?: { ... }
}

// ── Compression result for UI display ──

export interface CompressionResultItem {
  originalName: string;
  originalSize: number;
  compressedData: ArrayBuffer;
  compressedSize: number;
  mimeType: string;
  extension: string;
  engine: 'mozjpeg' | 'tinypng' | 'oxipng' | 'webp';
}

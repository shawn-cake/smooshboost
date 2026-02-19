// ── Messages FROM sandbox TO UI ──

export interface SelectionUpdateMsg {
  type: 'SELECTION_UPDATE';
  count: number;
}

export interface ExportedFile {
  name: string;
  data: number[]; // Uint8Array serialized as number[]
  type: 'image/png' | 'image/jpeg';
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
  format: 'JPG' | 'PNG';
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
  engine: 'mozjpeg' | 'tinypng' | 'oxipng';
}

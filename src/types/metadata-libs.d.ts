declare module 'piexifjs' {
  interface ExifObj {
    '0th': Record<number, unknown>;
    Exif: Record<number, unknown>;
    GPS: Record<number, unknown>;
    '1st': Record<number, unknown>;
    thumbnail: string | null;
  }

  interface GPSIFD {
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
    GPSAltitude: number;
    GPSAltitudeRef: number;
  }

  interface ImageIFD {
    Copyright: number;
    Artist: number;
    ImageDescription: number;
    DocumentName: number;
    XPTitle: number;
  }

  const piexif: {
    load(dataUrl: string): ExifObj;
    dump(exifObj: ExifObj): string;
    insert(exifBytes: string, dataUrl: string): string;
    GPSIFD: GPSIFD;
    ImageIFD: ImageIFD;
  };

  export default piexif;
}

declare module 'png-chunks-encode' {
  interface PngChunk {
    name: string;
    data: Uint8Array;
  }

  function encode(chunks: PngChunk[]): Uint8Array;
  export default encode;
}

declare module 'png-chunks-extract' {
  interface PngChunk {
    name: string;
    data: Uint8Array;
  }

  function extract(data: Uint8Array): PngChunk[];
  export default extract;
}

declare module 'png-chunk-text' {
  interface TextChunk {
    name: string;
    data: Uint8Array;
  }

  const text: {
    encode(keyword: string, text: string): TextChunk;
    decode(chunk: TextChunk): { keyword: string; text: string };
  };

  export default text;
}


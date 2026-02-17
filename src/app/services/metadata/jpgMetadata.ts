import piexif from 'piexifjs';
import type { GeoTag, AppliedMetadata, MetadataOptions } from '../../types';

/**
 * Convert decimal degrees to degrees/minutes/seconds format for EXIF
 */
function decimalToDMS(
  decimal: number
): [[number, number], [number, number], [number, number]] {
  const degrees = Math.floor(decimal);
  const minutesDecimal = (decimal - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60 * 100);

  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ];
}

/**
 * Convert data URL back to Blob
 */
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Inject all metadata into a JPG/MozJPG image
 */
export async function injectJpgMetadata(
  blob: Blob,
  options: MetadataOptions
): Promise<{ blob: Blob; applied: AppliedMetadata }> {
  const applied: AppliedMetadata = {
    geoTag: null,
    copyright: null,
    title: null,
    description: null,
  };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;

        // Try to load existing EXIF, or start fresh
        let exifObj: ReturnType<typeof piexif.load>;
        try {
          exifObj = piexif.load(dataUrl);
        } catch {
          // No EXIF data, create empty structure
          exifObj = { '0th': {}, Exif: {}, GPS: {}, '1st': {}, thumbnail: null };
        }

        // Ensure required objects exist
        exifObj['0th'] = exifObj['0th'] || {};
        exifObj.GPS = exifObj.GPS || {};

        // Inject GPS coordinates
        if (
          options.geoTagEnabled &&
          options.geoTag.latitude !== null &&
          options.geoTag.longitude !== null
        ) {
          const latDMS = decimalToDMS(Math.abs(options.geoTag.latitude));
          const lngDMS = decimalToDMS(Math.abs(options.geoTag.longitude));

          exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] =
            options.geoTag.latitude >= 0 ? 'N' : 'S';
          exifObj.GPS[piexif.GPSIFD.GPSLatitude] = latDMS;
          exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] =
            options.geoTag.longitude >= 0 ? 'E' : 'W';
          exifObj.GPS[piexif.GPSIFD.GPSLongitude] = lngDMS;

          applied.geoTag = {
            latitude: options.geoTag.latitude,
            longitude: options.geoTag.longitude,
            address: options.geoTag.address || undefined,
          };
        }

        // Inject copyright (only to Copyright field)
        if (options.copyrightEnabled && options.copyright.text) {
          exifObj['0th'][piexif.ImageIFD.Copyright] = options.copyright.text;
          applied.copyright = options.copyright.text;
        }

        // Inject author/artist (separate field)
        if (options.copyrightEnabled && options.copyright.author) {
          exifObj['0th'][piexif.ImageIFD.Artist] = options.copyright.author;
        }

        // Inject title and description
        if (options.titleDescEnabled) {
          if (options.titleDesc.description) {
            exifObj['0th'][piexif.ImageIFD.ImageDescription] =
              options.titleDesc.description;
            applied.description = options.titleDesc.description;
          }
          if (options.titleDesc.title) {
            // Use DocumentName for title (widely supported)
            exifObj['0th'][piexif.ImageIFD.DocumentName] =
              options.titleDesc.title;
            applied.title = options.titleDesc.title;
          }
        }

        // Dump EXIF and insert into image
        const exifBytes = piexif.dump(exifObj);
        const newDataUrl = piexif.insert(exifBytes, dataUrl);
        const newBlob = dataURLtoBlob(newDataUrl);

        resolve({ blob: newBlob, applied });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Build EXIF data for WebP (returns raw bytes that can be injected)
 */
export function buildExifBytes(options: {
  geoTag?: GeoTag;
  copyright?: string;
  author?: string;
  title?: string;
  description?: string;
}): Uint8Array {
  const exifObj: ReturnType<typeof piexif.load> = {
    '0th': {},
    Exif: {},
    GPS: {},
    '1st': {},
    thumbnail: null,
  };

  if (options.copyright) {
    exifObj['0th'][piexif.ImageIFD.Copyright] = options.copyright;
  }

  if (options.author) {
    exifObj['0th'][piexif.ImageIFD.Artist] = options.author;
  }

  if (options.title) {
    exifObj['0th'][piexif.ImageIFD.DocumentName] = options.title;
  }

  if (options.description) {
    exifObj['0th'][piexif.ImageIFD.ImageDescription] = options.description;
  }

  if (options.geoTag) {
    const latDMS = decimalToDMS(Math.abs(options.geoTag.latitude));
    const lngDMS = decimalToDMS(Math.abs(options.geoTag.longitude));

    exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] =
      options.geoTag.latitude >= 0 ? 'N' : 'S';
    exifObj.GPS[piexif.GPSIFD.GPSLatitude] = latDMS;
    exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] =
      options.geoTag.longitude >= 0 ? 'E' : 'W';
    exifObj.GPS[piexif.GPSIFD.GPSLongitude] = lngDMS;
  }

  const exifBytes = piexif.dump(exifObj);
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(exifBytes.length);
  for (let i = 0; i < exifBytes.length; i++) {
    bytes[i] = exifBytes.charCodeAt(i);
  }
  return bytes;
}


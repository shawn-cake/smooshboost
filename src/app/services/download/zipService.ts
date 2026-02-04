import JSZip from 'jszip';
import type { ImageItem } from '../../types';
import { getOutputFilename, downloadBlob } from '../../utils';

/**
 * Generates a unique filename by appending -1, -2, etc. if needed
 */
function getUniqueFilename(filename: string, usedNames: Set<string>): string {
  if (!usedNames.has(filename)) {
    return filename;
  }

  // Split into base name and extension
  const lastDotIndex = filename.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.slice(lastDotIndex) : '';

  // Find unique suffix
  let counter = 1;
  let uniqueName = `${baseName}-${counter}${extension}`;
  while (usedNames.has(uniqueName)) {
    counter++;
    uniqueName = `${baseName}-${counter}${extension}`;
  }

  return uniqueName;
}

/**
 * Formats a date like Mac screenshots: "SmooshBoost 2026-02-03 at 10.17.43 PM"
 */
function formatZipFilename(): string {
  const now = new Date();

  // Date part: YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}-${month}-${day}`;

  // Time part: h.mm.ss AM/PM
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const timePart = `${hours}.${minutes}.${seconds} ${ampm}`;

  return `SmooshBoost ${datePart} at ${timePart}.zip`;
}

/**
 * Creates a ZIP file from completed images and triggers download
 */
export async function downloadAsZip(images: ImageItem[]): Promise<void> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  console.log(`[ZIP] Input images: ${images.length}`);
  images.forEach((img, i) => {
    console.log(`[ZIP] Image ${i}: ${img.name}, status=${img.status}, hasBlob=${!!img.compressedBlob}, blobSize=${img.compressedBlob?.size || 0}`);
  });

  // Filter to only completed images with blobs
  const completedImages = images.filter(
    (img) => img.status === 'complete' && img.compressedBlob
  );

  console.log(`[ZIP] Completed images with blobs: ${completedImages.length}`);

  if (completedImages.length === 0) {
    throw new Error('No completed images to download');
  }

  // Add each image to the ZIP with unique filenames
  for (const image of completedImages) {
    if (image.compressedBlob) {
      const baseFilename = getOutputFilename(image.name, image.outputFormat);
      const uniqueFilename = getUniqueFilename(baseFilename, usedNames);
      usedNames.add(uniqueFilename);

      console.log(`[ZIP] Adding: ${uniqueFilename} (${image.compressedBlob.size} bytes)`);
      zip.file(uniqueFilename, image.compressedBlob);
    }
  }

  // Generate the ZIP file
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  // Generate filename matching Mac screenshot format
  const filename = formatZipFilename();

  // Trigger download
  downloadBlob(content, filename);
}

/**
 * Downloads a single compressed image
 */
export function downloadSingleImage(image: ImageItem): void {
  if (!image.compressedBlob) {
    throw new Error('No compressed image to download');
  }

  const filename = getOutputFilename(image.name, image.outputFormat);
  downloadBlob(image.compressedBlob, filename);
}

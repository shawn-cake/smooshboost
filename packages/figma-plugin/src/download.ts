import JSZip from 'jszip';
import type { CompressionResultItem } from './types';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingle(item: CompressionResultItem): void {
  const blob = new Blob([item.compressedData], { type: item.mimeType });
  // Replace original extension with the correct one
  const name = item.originalName.replace(/\.[^.]+$/, '') + item.extension;
  triggerDownload(blob, name);
}

export async function downloadAsZip(
  items: CompressionResultItem[]
): Promise<void> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of items) {
    let name = item.originalName.replace(/\.[^.]+$/, '') + item.extension;
    // Handle duplicate filenames
    let baseName = name;
    let counter = 1;
    while (usedNames.has(name)) {
      const dotIdx = baseName.lastIndexOf('.');
      name =
        baseName.substring(0, dotIdx) +
        `-${counter}` +
        baseName.substring(dotIdx);
      counter++;
    }
    usedNames.add(name);
    zip.file(name, item.compressedData);
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const now = new Date();
  const timestamp = now
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(/[/,]/g, '-')
    .replace(/\s+/g, '-');

  triggerDownload(blob, `SmooshBoost-${timestamp}.zip`);
}

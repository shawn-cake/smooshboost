/**
 * Smoosh Figma Plugin — UI Entry Point
 *
 * Runs inside the plugin UI iframe (has DOM access).
 * Handles messages from the sandbox, drives compression, and renders results.
 */

import type {
  SelectionUpdateMsg,
  ExportReadyMsg,
  ExportedFile,
  CompressionResultItem,
} from './types';
import { compressJpeg, compressPng, compressWebp } from './compression';
import { downloadSingle, downloadAsZip } from './download';

/**
 * Decode encoded image bytes (PNG/JPEG) to raw RGBA ImageData using the
 * iframe's canvas. Used to feed the WebP encoder, which needs raw pixels.
 */
async function bytesToImageData(bytes: ArrayBuffer, mime: string): Promise<ImageData> {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to decode exported image'));
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ── DOM references ───────────────────────────────────────────────────

const formatSelect = document.getElementById('format-select') as HTMLSelectElement;
const scaleSelect = document.getElementById('scale-select') as HTMLSelectElement;
const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;

const statusLine = document.getElementById('status-line') as HTMLElement;
const progressArea = document.getElementById('progress-area') as HTMLElement;
const progressBar = document.getElementById('progress-bar') as HTMLElement;
const progressText = document.getElementById('progress-text') as HTMLElement;

const resultsList = document.getElementById('results-list') as HTMLElement;
const downloadBar = document.getElementById('download-bar') as HTMLElement;
const downloadSummary = document.getElementById('download-summary') as HTMLElement;
const downloadAllBtn = document.getElementById('download-all-btn') as HTMLButtonElement;

// ── State ────────────────────────────────────────────────────────────

let selectionCount = 0;
let compressionResults: CompressionResultItem[] = [];
// While true, the status line shows operational status ("Compressing…",
// "Done! …") and selection changes don't overwrite it.
let processing = false;

// ── Helpers ──────────────────────────────────────────────────────────

function setStatus(text: string): void {
  statusLine.textContent = text;
}

function showProgress(show: boolean): void {
  progressArea.style.display = show ? 'block' : 'none';
}

function updateProgress(current: number, total: number): void {
  const pct = Math.round((current / total) * 100);
  progressBar.style.width = `${pct}%`;
  progressText.textContent = `Compressing ${current}/${total}…`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Inline icons (no icon font available in the plugin sandbox)
const DOWNLOAD_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
const TRASH_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';

function engineLabel(engine: string): string {
  switch (engine) {
    case 'mozjpeg':
      return 'MozJPEG';
    case 'tinypng':
      return 'TinyPNG';
    case 'oxipng':
      return 'OxiPNG';
    case 'webp':
      return 'WebP';
    default:
      return engine;
  }
}

// ── UI update helpers ────────────────────────────────────────────────

function updateSelectionUI(): void {
  exportBtn.disabled = processing || selectionCount === 0;
  // Don't clobber an in-progress / completion message with the selection count.
  if (processing) return;
  statusLine.textContent =
    selectionCount === 0
      ? 'No exportable layers selected'
      : `${selectionCount} layer${selectionCount > 1 ? 's' : ''} selected`;
}

// Status summary for the current set of compressed files. Reused after a run
// completes and after a row is removed, so the count stays accurate.
function refreshCompletionStatus(): void {
  const totalSaved = compressionResults.reduce(
    (acc, r) => acc + (r.originalSize - r.compressedSize),
    0
  );
  setStatus(
    `Done! ${compressionResults.length} file${compressionResults.length > 1 ? 's' : ''} compressed, ${formatBytes(totalSaved)} saved`
  );
}

function renderResults(): void {
  resultsList.innerHTML = '';

  for (let i = 0; i < compressionResults.length; i++) {
    const item = compressionResults[i];
    const savings = item.originalSize - item.compressedSize;
    const pct = item.originalSize > 0 ? Math.round((savings / item.originalSize) * 100) : 0;
    const name = item.originalName.replace(/\.[^.]+$/, '') + item.extension;

    const row = document.createElement('div');
    row.className = 'result-row';

    row.innerHTML = `
      <div class="result-info">
        <span class="result-name" title="${name}">${name}</span>
        <span class="result-meta">
          ${formatBytes(item.originalSize)} → ${formatBytes(item.compressedSize)}
          <strong>(−${pct}%)</strong>
          via ${engineLabel(item.engine)}
        </span>
      </div>
      <div class="result-actions">
        <button class="btn-icon download-single" data-index="${i}" title="Download">${DOWNLOAD_ICON}</button>
        <button class="btn-icon remove-single" data-index="${i}" title="Remove from batch">${TRASH_ICON}</button>
      </div>
    `;

    resultsList.appendChild(row);
  }

  // Attach download handlers
  resultsList.querySelectorAll('.download-single').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).dataset.index || '0', 10);
      downloadSingle(compressionResults[idx]);
    });
  });

  // Attach remove handlers — lets you drop an accidentally-included layer
  // before downloading the batch.
  resultsList.querySelectorAll('.remove-single').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).dataset.index || '0', 10);
      compressionResults.splice(idx, 1);
      renderResults();
      if (compressionResults.length > 0) {
        refreshCompletionStatus();
      } else {
        setStatus('No compressed files — select layers and Export & Smoosh');
      }
    });
  });

  // Show download bar with summary if there are results
  if (compressionResults.length > 0) {
    const totalOriginal = compressionResults.reduce((a, r) => a + r.originalSize, 0);
    const totalCompressed = compressionResults.reduce((a, r) => a + r.compressedSize, 0);
    const totalSaved = totalOriginal - totalCompressed;
    const totalPct = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
    downloadSummary.innerHTML =
      `${compressionResults.length} file${compressionResults.length > 1 ? 's' : ''} · <strong>${formatBytes(totalSaved)} saved (−${totalPct}%)</strong>`;
    downloadBar.style.display = 'flex';
  } else {
    downloadBar.style.display = 'none';
  }
}

// ── Compression pipeline ─────────────────────────────────────────────

async function handleExportReady(files: ExportedFile[]): Promise<void> {
  compressionResults = [];
  resultsList.innerHTML = '';
  downloadBar.style.display = 'none';
  showProgress(true);
  setStatus('Compressing…');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    updateProgress(i + 1, files.length);

    const originalBytes = new Uint8Array(file.data).buffer;
    const originalSize = originalBytes.byteLength;

    try {
      let compressedData: ArrayBuffer;
      let mimeType: string;
      let extension: string;
      let engine: 'mozjpeg' | 'tinypng' | 'oxipng' | 'webp';

      if (file.targetFormat === 'WEBP') {
        // WebP path — Figma exported a lossless PNG; decode to pixels then
        // encode WebP entirely client-side.
        const imageData = await bytesToImageData(originalBytes, file.type);
        compressedData = await compressWebp(imageData);
        mimeType = 'image/webp';
        extension = '.webp';
        engine = 'webp';
      } else if (file.targetFormat === 'JPG') {
        compressedData = await compressJpeg(originalBytes);
        mimeType = 'image/jpeg';
        extension = '.jpg';
        engine = 'mozjpeg';
      } else {
        // PNG path — TinyPNG first, fallback to OxiPNG
        const result = await compressPng(originalBytes);
        compressedData = result.data;
        engine = result.engine;
        mimeType = 'image/png';
        extension = '.png';
      }

      compressionResults.push({
        originalName: file.name,
        originalSize,
        compressedData,
        compressedSize: compressedData.byteLength,
        mimeType,
        extension,
        engine,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const errStack = err instanceof Error && err.stack ? err.stack : '';
      console.error(`[Smoosh] Failed to compress ${file.name}:`, err);
      setStatus(`Error compressing ${file.name}: ${errMsg}`);
      // Render error visibly in results area
      const errEl = document.createElement('div');
      errEl.style.cssText = 'padding:8px 10px;font-size:10px;color:#F87171;font-family:monospace;white-space:pre-wrap;word-break:break-all;';
      errEl.textContent = `[compress error] ${file.name}: ${errMsg}\n${errStack}`;
      resultsList.appendChild(errEl);
    }
  }

  showProgress(false);

  if (compressionResults.length > 0) {
    renderResults();
    refreshCompletionStatus();
  } else {
    setStatus('Compression failed for all files');
  }

  // Done — release the status line and re-enable export.
  processing = false;
  exportBtn.disabled = selectionCount === 0;
  exportBtn.textContent = 'Export & Smoosh';
}

// ── Message handler ──────────────────────────────────────────────────

// Use addEventListener (not window.onmessage assignment) to avoid
// overwriting any handler Figma's UI shell may have set.
window.addEventListener('message', (event: MessageEvent) => {
  const msg = event.data?.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'SELECTION_UPDATE': {
      const update = msg as SelectionUpdateMsg;
      selectionCount = update.count;
      updateSelectionUI();
      break;
    }

    case 'EXPORT_READY': {
      const ready = msg as ExportReadyMsg;
      handleExportReady(ready.files);
      break;
    }
  }
});

// ── Export button ────────────────────────────────────────────────────

exportBtn.addEventListener('click', () => {
  if (selectionCount === 0) return;

  processing = true;
  exportBtn.disabled = true;
  exportBtn.textContent = 'Exporting…';
  setStatus(`Exporting ${selectionCount} layer${selectionCount > 1 ? 's' : ''}…`);

  // Clear previous results
  resultsList.innerHTML = '';
  downloadBar.style.display = 'none';
  compressionResults = [];

  parent.postMessage(
    {
      pluginMessage: {
        type: 'EXPORT_REQUEST',
        format: formatSelect.value,
        scale: parseFloat(scaleSelect.value),
      },
    },
    '*'
  );
});

// ── Download All button ──────────────────────────────────────────────

downloadAllBtn.addEventListener('click', () => {
  if (compressionResults.length === 0) return;

  if (compressionResults.length === 1) {
    downloadSingle(compressionResults[0]);
  } else {
    downloadAsZip(compressionResults);
  }
});

// ── Init ─────────────────────────────────────────────────────────────

updateSelectionUI();

// Tell the sandbox we're ready so it can send the current selection count
parent.postMessage({ pluginMessage: { type: 'UI_READY' } }, '*');

// Debug: confirm the script actually ran to completion
console.log('[Smoosh UI] Initialised, UI_READY sent');

/**
 * SmooshBoost Figma Plugin — UI Entry Point
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
import { compressJpeg, compressPng } from './compression';
import { downloadSingle, downloadAsZip } from './download';

// ── DOM references ───────────────────────────────────────────────────

const selectionLabel = document.getElementById('selection-label') as HTMLElement;
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

function engineLabel(engine: string): string {
  switch (engine) {
    case 'mozjpeg':
      return 'MozJPEG';
    case 'tinypng':
      return 'TinyPNG';
    case 'oxipng':
      return 'OxiPNG';
    default:
      return engine;
  }
}

// ── UI update helpers ────────────────────────────────────────────────

function updateSelectionUI(): void {
  if (selectionCount === 0) {
    selectionLabel.textContent = 'No exportable frames selected';
    exportBtn.disabled = true;
  } else {
    selectionLabel.textContent = `${selectionCount} frame${selectionCount > 1 ? 's' : ''} selected`;
    exportBtn.disabled = false;
  }
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
      <button class="btn-small download-single" data-index="${i}">↓</button>
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
      let engine: 'mozjpeg' | 'tinypng' | 'oxipng';

      if (file.type === 'image/jpeg') {
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
      console.error(`[SmooshBoost] Failed to compress ${file.name}:`, err);
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
    const totalSaved = compressionResults.reduce(
      (acc, r) => acc + (r.originalSize - r.compressedSize),
      0
    );
    setStatus(
      `Done! ${compressionResults.length} file${compressionResults.length > 1 ? 's' : ''} compressed, ${formatBytes(totalSaved)} saved`
    );
    renderResults();
  } else {
    setStatus('Compression failed for all files');
  }

  // Re-enable export button
  exportBtn.disabled = false;
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

  exportBtn.disabled = true;
  exportBtn.textContent = 'Exporting…';
  setStatus(`Exporting ${selectionCount} frame${selectionCount > 1 ? 's' : ''}…`);

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
setStatus('Ready — waiting for selection data…');

// Tell the sandbox we're ready so it can send the current selection count
parent.postMessage({ pluginMessage: { type: 'UI_READY' } }, '*');

// Debug: confirm the script actually ran to completion
console.log('[SmooshBoost UI] Initialised, UI_READY sent');

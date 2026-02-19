import { useEffect } from 'react';

/**
 * Shape of a single file entry in the Figma plugin message.
 *
 * Future Boost-phase fields (per-file metadata options such as geo-tag
 * coordinates, copyright text, title/description) would be added here
 * as optional properties — e.g.:
 *   metadata?: {
 *     geoTag?: { latitude: number; longitude: number };
 *     copyright?: string;
 *     title?: string;
 *     description?: string;
 *   }
 */
interface FigmaPluginFileEntry {
  name: string;
  data: number[];
  type: 'image/png' | 'image/jpeg';
  // Future: metadata?: { ... }
}

/**
 * Shape of the postMessage payload sent from the Figma plugin UI shell.
 *
 * Future top-level fields (e.g. batch-wide boost settings, workflow
 * mode overrides) would be added alongside `files` without changing
 * the existing contract:
 *   batchMetadata?: { ... }
 */
interface FigmaPluginMessage {
  type: 'FIGMA_PLUGIN_FILES';
  files: FigmaPluginFileEntry[];
  // Future: batchMetadata?: { ... }
}

function isFigmaPluginMessage(data: unknown): data is FigmaPluginMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as Record<string, unknown>;
  return (
    msg.type === 'FIGMA_PLUGIN_FILES' &&
    Array.isArray(msg.files) &&
    msg.files.length > 0
  );
}

/**
 * Listens for postMessage events from the Figma plugin and converts
 * incoming file data into File objects, then delegates to the same
 * handler used by drag-and-drop / file picker uploads.
 *
 * No new queue logic is introduced — the callback should be the
 * existing handleFilesSelected (or equivalent) from App.tsx.
 */
export function useFigmaPluginReceiver(
  onFilesReceived: (files: File[]) => void
) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!isFigmaPluginMessage(event.data)) return;

      const files = event.data.files.map((f) => {
        const bytes = new Uint8Array(f.data);
        const blob = new Blob([bytes], { type: f.type });
        return new File([blob], f.name, { type: f.type });
      });

      onFilesReceived(files);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onFilesReceived]);
}

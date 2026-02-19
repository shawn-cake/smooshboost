import { useEffect, useRef } from 'react';

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
 * Converts raw plugin file entries into File objects.
 */
function toFiles(entries: FigmaPluginFileEntry[]): File[] {
  return entries.map((f) => {
    const bytes = new Uint8Array(f.data);
    const blob = new Blob([bytes], { type: f.type });
    return new File([blob], f.name, { type: f.type });
  });
}

/**
 * Listens for file data from the Figma plugin and converts it into
 * File objects, then delegates to the same handler used by drag-and-drop
 * or file picker uploads.
 *
 * Supports two delivery mechanisms:
 *   1. MessageChannel port — the plugin UI transfers a port via
 *      FIGMA_PLUGIN_PORT_INIT, then sends files over that port.
 *      This bypasses cross-origin restrictions in Figma's sandbox.
 *   2. Direct postMessage (fallback) — for non-Figma contexts or
 *      future integrations.
 *
 * No new queue logic is introduced — the callback should be the
 * existing handleFilesSelected (or equivalent) from App.tsx.
 */
export function useFigmaPluginReceiver(
  onFilesReceived: (files: File[]) => void
) {
  const portRef = useRef<MessagePort | null>(null);

  useEffect(() => {
    function handleWindowMessage(event: MessageEvent) {
      // ── Port handshake from Figma plugin UI shell ──
      if (
        event.data &&
        event.data.type === 'FIGMA_PLUGIN_PORT_INIT' &&
        event.ports &&
        event.ports.length > 0
      ) {
        // Store the transferred port and listen for files on it
        const port = event.ports[0];
        portRef.current = port;

        port.onmessage = (portEvent: MessageEvent) => {
          if (!isFigmaPluginMessage(portEvent.data)) return;
          onFilesReceived(toFiles(portEvent.data.files));

          // ACK back through the port
          port.postMessage({ type: 'FIGMA_PLUGIN_FILES_ACK' });
        };

        return;
      }

      // ── Direct postMessage fallback ──
      if (!isFigmaPluginMessage(event.data)) return;
      onFilesReceived(toFiles(event.data.files));

      // ACK back via event.source if available
      if (event.source && typeof (event.source as Window).postMessage === 'function') {
        (event.source as Window).postMessage(
          { type: 'FIGMA_PLUGIN_FILES_ACK' },
          event.origin || '*'
        );
      }
    }

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
      if (portRef.current) {
        portRef.current.close();
        portRef.current = null;
      }
    };
  }, [onFilesReceived]);
}

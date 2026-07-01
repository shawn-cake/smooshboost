// Smoosh Figma Plugin — Sandbox Script
// Runs in the Figma sandbox (no DOM access, no browser APIs).

// Almost every SceneNode supports exportAsync(), so we accept any visible
// node the user selected — frames, components, groups, rectangles, vectors,
// images, text, etc. We only drop hidden nodes (they'd export blank).
function getExportableSelection(): SceneNode[] {
  return figma.currentPage.selection.filter(
    (node) => node.visible !== false && typeof (node as SceneNode & {
      exportAsync?: unknown;
    }).exportAsync === 'function'
  );
}

function sendSelectionUpdate(): void {
  const count = getExportableSelection().length;
  figma.ui.postMessage({ type: 'SELECTION_UPDATE', count });
}

// Show the plugin UI
figma.showUI(__html__, { width: 560, height: 500 });

// Send initial selection after a short delay so the UI JS bundle has time to
// parse and attach its onmessage listener (~900 KB IIFE).
setTimeout(() => sendSelectionUpdate(), 200);

// Track selection changes
figma.on('selectionchange', () => {
  sendSelectionUpdate();
});

// Handle messages from the plugin UI
figma.ui.onmessage = async (msg: {
  type: string;
  format?: 'JPG' | 'PNG' | 'WEBP';
  scale?: number;
}) => {
  // UI signals it has finished loading — send current selection immediately
  if (msg.type === 'UI_READY') {
    sendSelectionUpdate();
    return;
  }

  if (msg.type !== 'EXPORT_REQUEST') return;

  const format = msg.format || 'WEBP';
  const scale = msg.scale || 2;
  const nodes = getExportableSelection();

  if (nodes.length === 0) {
    figma.notify('No layers selected');
    return;
  }

  // Figma can't emit WebP, so WebP targets export a lossless PNG that the UI
  // transcodes. JPG/PNG export directly in their final format.
  const figmaFormat: 'PNG' | 'JPG' = format === 'JPG' ? 'JPG' : 'PNG';
  const extension = figmaFormat === 'JPG' ? '.jpg' : '.png';
  const mime: 'image/png' | 'image/jpeg' =
    figmaFormat === 'JPG' ? 'image/jpeg' : 'image/png';

  const files: Array<{
    name: string;
    data: number[];
    type: 'image/png' | 'image/jpeg';
    targetFormat: 'JPG' | 'PNG' | 'WEBP';
  }> = [];

  for (const node of nodes) {
    try {
      const bytes = await (node as SceneNode & {
        exportAsync: (settings: ExportSettings) => Promise<Uint8Array>;
      }).exportAsync({
        format: figmaFormat,
        constraint: { type: 'SCALE', value: scale },
      });

      files.push({
        name: node.name + extension,
        data: Array.from(bytes),
        type: mime,
        targetFormat: format,
      });
    } catch (err) {
      figma.notify(`Failed to export "${node.name}"`);
    }
  }

  if (files.length > 0) {
    figma.ui.postMessage({ type: 'EXPORT_READY', files });
  }
};

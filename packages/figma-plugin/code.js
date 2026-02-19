"use strict";
// SmooshBoost Figma Plugin — Sandbox Script
// Runs in the Figma sandbox (no DOM access, no browser APIs).
const EXPORTABLE_TYPES = ['FRAME', 'COMPONENT', 'GROUP'];
function getExportableSelection() {
    return figma.currentPage.selection.filter((node) => EXPORTABLE_TYPES.includes(node.type));
}
function sendSelectionUpdate() {
    const count = getExportableSelection().length;
    figma.ui.postMessage({ type: 'SELECTION_UPDATE', count });
}
// Show the plugin UI
figma.showUI(__html__, { width: 580, height: 180 });
// Send initial selection count
sendSelectionUpdate();
// Track selection changes
figma.on('selectionchange', () => {
    sendSelectionUpdate();
});
// Handle messages from the plugin UI
figma.ui.onmessage = async (msg) => {
    if (msg.type !== 'EXPORT_REQUEST')
        return;
    const format = msg.format || 'JPG';
    const scale = msg.scale || 2;
    const nodes = getExportableSelection();
    if (nodes.length === 0) {
        figma.notify('No frames selected');
        return;
    }
    const extension = format === 'PNG' ? '.png' : '.jpg';
    const mime = format === 'PNG' ? 'image/png' : 'image/jpeg';
    const files = [];
    for (const node of nodes) {
        try {
            const bytes = await node.exportAsync({
                format,
                constraint: { type: 'SCALE', value: scale },
            });
            files.push({
                name: node.name + extension,
                data: Array.from(bytes),
                type: mime,
            });
        }
        catch (err) {
            figma.notify(`Failed to export "${node.name}"`);
        }
    }
    if (files.length > 0) {
        // Future Boost-phase: per-file metadata would be attached to each
        // entry in the files array here before sending to the UI.
        figma.ui.postMessage({ type: 'EXPORT_READY', files });
    }
};

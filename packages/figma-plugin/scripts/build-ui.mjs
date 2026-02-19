/**
 * Bundles src/ui.ts into an IIFE string and injects it into ui-template.html,
 * producing the final ui.html that Figma loads.
 */
import { buildSync } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Bundle ui.ts → IIFE string ──────────────────────────────────────

const result = buildSync({
  entryPoints: [resolve(root, 'src/ui.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  write: false,
  // No @jsquash imports — compression.ts uses embedded JS source strings
  // evaluated at runtime via new Function(), so esbuild never sees the
  // emscripten factories. No define/external overrides needed.
});

const jsBundle = result.outputFiles[0].text;
console.log(`  JS bundle: ${(jsBundle.length / 1024).toFixed(0)} KB`);

// ── Inject into HTML template ────────────────────────────────────────

const templatePath = resolve(root, 'ui-template.html');
const template = readFileSync(templatePath, 'utf8');

const html = template.replace(
  '<!-- INJECT_JS -->',
  `<script>\n${jsBundle}\n</script>`
);

const outPath = resolve(root, 'ui.html');
writeFileSync(outPath, html);
console.log(`  Wrote ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);

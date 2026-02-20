/**
 * Bundles src/ui.ts into an IIFE string and injects it into ui-template.html,
 * producing the final ui.html that Figma loads.
 *
 * Also reads the @jsquash codec JS files (emscripten factories + oxipng
 * wasm-bindgen) and injects them as separate <script> tags that assign
 * factory functions to window.__smoosh_*. This avoids:
 *   - esbuild bundling the emscripten code (crashes on module evaluation)
 *   - new Function() / eval() (blocked by Figma's CSP)
 */
import { buildSync } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Prepare codec <script> blocks ───────────────────────────────────
//
// Each emscripten factory (mozjpeg_dec.js, mozjpeg_enc.js) looks like:
//   var Module = (() => { var _scriptDir = import.meta.url; return (function(moduleArg = {}) { ... }); })();
//   export default Module;
//
// We transform them into:
//   window.__smoosh_mozjpeg_dec = (() => { var _scriptDir = "data:text/javascript,"; return (function(moduleArg = {}) { ... }); })();
//
// The oxipng codec (squoosh_oxipng.js) uses wasm-bindgen exports. We
// strip ES module syntax and assign the namespace to window.__smoosh_oxipng.

function buildMozjpegScript(source, globalName) {
  let code = source;
  // Replace import.meta.url with a variable reference (NOT a string literal).
  // The original source has both reads (`var _scriptDir = import.meta.url`)
  // and writes (`import.meta.url = "https://localhost"` in CloudFlare/Node
  // polyfill blocks). Using a variable avoids "assignment to string" errors.
  code = code.replace(/import\.meta\.url/g, '__smoosh_meta_url');
  // Replace `var Module =` with `window.${globalName} =`
  code = code.replace(/^var Module\s*=/m, `window.${globalName} =`);
  // Remove the ES module export line
  code = code.replace(/export\s+default\s+Module\s*;?\s*$/, '');
  // Prepend the variable declaration
  return `var __smoosh_meta_url = "data:text/javascript,";\n${code}`;
}

function buildOxipngScript(source) {
  let code = source;
  // Replace import.meta.url with a variable (same reason as above)
  code = code.replace(/import\.meta\.url/g, '__smoosh_meta_url');
  // Strip ES module export syntax
  code = code.replace(/^export\s+default\s+__wbg_init\s*;?\s*$/m, '');
  code = code.replace(/^export\s*\{\s*initSync\s*\}\s*;?\s*$/m, '');
  code = code.replace(/^export\s+function\s+/gm, 'function ');
  code = code.replace(/^export\s+function\s*\*/gm, 'function* ');
  // Wrap in IIFE with variable declaration at top
  return `(function() {\nvar __smoosh_meta_url = "data:text/javascript,";\n${code}\nwindow.__smoosh_oxipng = { optimise, optimise_raw, initSync };\n})();`;
}

const mozjpegDecSrc = readFileSync(
  resolve(root, 'node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.js'), 'utf8'
);
const mozjpegEncSrc = readFileSync(
  resolve(root, 'node_modules/@jsquash/jpeg/codec/enc/mozjpeg_enc.js'), 'utf8'
);
const oxipngSrc = readFileSync(
  resolve(root, 'node_modules/@jsquash/oxipng/codec/pkg/squoosh_oxipng.js'), 'utf8'
);

const codecScripts = [
  { name: 'mozjpeg_dec', code: buildMozjpegScript(mozjpegDecSrc, '__smoosh_mozjpeg_dec') },
  { name: 'mozjpeg_enc', code: buildMozjpegScript(mozjpegEncSrc, '__smoosh_mozjpeg_enc') },
  { name: 'oxipng',      code: buildOxipngScript(oxipngSrc) },
];

let codecTags = '';
for (const { name, code } of codecScripts) {
  codecTags += `\n<!-- Codec: ${name} -->\n<script>\n${code}\n</script>\n`;
  console.log(`  Codec ${name}: ${(code.length / 1024).toFixed(0)} KB`);
}

// ── Bundle ui.ts → IIFE string ──────────────────────────────────────

const result = buildSync({
  entryPoints: [resolve(root, 'src/ui.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  write: false,
});

const jsBundle = result.outputFiles[0].text;
console.log(`  JS bundle: ${(jsBundle.length / 1024).toFixed(0)} KB`);

// ── Read logo SVG ───────────────────────────────────────────────────

const logoPath = resolve(root, '../../src/assets/logo.svg');
const logoSvg = readFileSync(logoPath, 'utf8');
console.log(`  Logo SVG: ${(logoSvg.length / 1024).toFixed(1)} KB`);

// ── Inject into HTML template ────────────────────────────────────────

const templatePath = resolve(root, 'ui-template.html');
const template = readFileSync(templatePath, 'utf8');

let html = template;

// Inject logo SVG into header and empty state
html = html.replace('<!-- INJECT_LOGO -->', logoSvg);
html = html.replace('<!-- INJECT_LOGO_EMPTY -->', logoSvg);

// Inject codec scripts before the main bundle placeholder
html = html.replace(
  '<!-- INJECT_CODECS -->',
  codecTags
);

// Inject main bundle
html = html.replace(
  '<!-- INJECT_JS -->',
  `<script>\n${jsBundle}\n</script>`
);

const outPath = resolve(root, 'ui.html');
writeFileSync(outPath, html);
console.log(`  Wrote ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);

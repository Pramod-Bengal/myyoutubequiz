import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'video', 'index.js');
const OUT_DIR = path.join(ROOT, 'server', 'remotion-bundle');

await bundle({ entryPoint: ENTRY, outDir: OUT_DIR });
console.log(`Pre-bundled Remotion video to ${OUT_DIR}`);

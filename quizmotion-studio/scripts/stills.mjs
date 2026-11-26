// Dev helper: render single frames as JPEGs to check the design.
// usage: node scripts/stills.mjs <outDir> <frame> [frame ...]
import fs from 'node:fs';
import path from 'node:path';
import { renderStillFrame } from '../server/renderer.js';
import { DEFAULT_PROPS } from '../src/video/theme.js';

const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const props = process.env.PROPS ? JSON.parse(process.env.PROPS) : DEFAULT_PROPS;
for (const fr of frames) {
  const out = path.join(outDir, `f${String(fr).padStart(4, '0')}.jpg`);
  await renderStillFrame({ props, frame: Number(fr), outputLocation: out });
  console.log('wrote', out);
}

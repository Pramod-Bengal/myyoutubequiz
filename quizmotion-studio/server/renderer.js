import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'video', 'index.js');
const COMPOSITION_ID = 'QuizVideo';

// Use the Chrome that is already on the machine when there is one (no big download).
// Set CHROME_PATH to force a specific browser. If none is found, Remotion downloads its own.
function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

const browserExecutable = findBrowser();
const browserOptions = browserExecutable
  ? { browserExecutable, chromeMode: 'chrome-for-testing' }
  : {};

let bundlePromise = null;
export function getBundle(onProgress) {
  // The bundle only depends on the source code, so build it once and reuse it for every video.
  if (!bundlePromise) {
    bundlePromise = bundle({ entryPoint: ENTRY, onProgress: (p) => onProgress?.(p / 100) }).catch((err) => {
      bundlePromise = null;
      throw err;
    });
  }
  return bundlePromise;
}

export async function renderQuizVideo({ props, outputLocation, onStage, onProgress, frameRange }) {
  onStage?.('bundling');
  const serveUrl = await getBundle((p) => onProgress?.(p * 0.08));

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps: props,
    ...browserOptions,
  });

  // Hard guarantee: 1080x1920, 30 fps, 1800 frames = 60.000 s
  if (composition.width !== 1080 || composition.height !== 1920 || composition.durationInFrames !== 1800) {
    throw new Error('Composition is not 1080x1920 / 1800 frames. Refusing to render.');
  }

  onStage?.('rendering');
  const tmp = outputLocation.replace(/\.mp4$/, '.part.mp4'); // never expose half-written files
  await renderMedia({
    composition,
    serveUrl,
    inputProps: props,
    codec: 'h264',
    pixelFormat: 'yuv420p',
    colorSpace: 'bt709', // tagged BT.709 so every player and YouTube show the same colours
    frameRange, // undefined = the whole 60 s (only tests pass a short range)
    crf: 18,
    x264Preset: 'veryfast',
    outputLocation: tmp,
    concurrency: Math.max(1, Math.min(4, os.cpus().length - 1)),
    overwrite: true,
    ...browserOptions,
    onProgress: ({ progress, stitchStage }) => {
      if (stitchStage === 'muxing' || progress >= 0.999) onStage?.('encoding');
      onProgress?.(0.08 + progress * 0.92);
    },
  });
  fs.renameSync(tmp, outputLocation);
  return outputLocation;
}

// Used by scripts/stills.mjs to look at single frames while developing.
export async function renderStillFrame({ props, frame, outputLocation }) {
  const serveUrl = await getBundle();
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps: props, ...browserOptions });
  await renderStill({
    composition,
    serveUrl,
    inputProps: props,
    frame,
    output: outputLocation,
    imageFormat: 'jpeg',
    jpegQuality: 92,
    ...browserOptions,
  });
}

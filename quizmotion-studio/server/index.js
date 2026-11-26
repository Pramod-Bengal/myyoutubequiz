import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { ROOT, renderQuizVideo } from './renderer.js';
import { formToProps, validateForm } from '../src/video/props.js';

const PORT = Number(process.env.PORT) || 5174;
const RENDER_DIR = path.join(ROOT, 'server', 'renders');
const DIST_DIR = path.join(ROOT, 'dist');
const MAX_QUEUE = 5;
const KEEP_MS = 2 * 60 * 60 * 1000; // delete videos after 2 hours

fs.mkdirSync(RENDER_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

/* ---------------- job queue (one render at a time) ---------------- */
const jobs = new Map();
let chain = Promise.resolve();

function publicJob(job) {
  return {
    id: job.id,
    status: job.status, // queued | bundling | rendering | encoding | done | error
    progress: Number(job.progress.toFixed(4)),
    error: job.error,
    videoUrl: job.status === 'done' ? `/api/videos/${job.id}` : null,
    downloadUrl: job.status === 'done' ? `/api/videos/${job.id}/download` : null,
  };
}

async function runJob(job) {
  try {
    job.status = 'bundling';
    await renderQuizVideo({
      props: job.props, // answer 3 is already stripped here
      outputLocation: job.file,
      onStage: (s) => (job.status = s),
      onProgress: (p) => (job.progress = Math.max(job.progress, Math.min(1, p))),
    });
    job.progress = 1;
    job.status = 'done';
  } catch (err) {
    console.error(`[render ${job.id}]`, err);
    job.status = 'error';
    job.error = 'Rendering failed on the server. ' + String(err?.message || err).slice(0, 300);
  }
}

app.post('/api/render', (req, res) => {
  const errors = validateForm(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const waiting = [...jobs.values()].filter((j) => ['queued', 'bundling', 'rendering', 'encoding'].includes(j.status));
  if (waiting.length >= MAX_QUEUE) return res.status(429).json({ error: 'Server is busy. Please try again in a minute.' });

  const id = crypto.randomUUID();
  const job = {
    id,
    status: 'queued',
    progress: 0,
    error: null,
    createdAt: Date.now(),
    file: path.join(RENDER_DIR, `${id}.mp4`),
    // The 3rd answer is stored with the job record only. It is never part of `props`.
    inputs: { ...req.body },
    props: formToProps(req.body),
  };
  jobs.set(id, job);
  chain = chain.then(() => runJob(job));
  res.status(202).json({ jobId: id });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found (it may have expired).' });
  res.json(publicJob(job));
});

const UUID = /^[0-9a-f-]{36}$/;
function doneFile(req, res) {
  const job = UUID.test(req.params.id) ? jobs.get(req.params.id) : null;
  if (!job || job.status !== 'done' || !fs.existsSync(job.file)) {
    res.status(404).json({ error: 'Video not found (it may have expired).' });
    return null;
  }
  return job.file;
}

// Inline playback (supports seeking via Range requests)
app.get('/api/videos/:id', (req, res) => {
  const file = doneFile(req, res);
  if (file) res.type('video/mp4').sendFile(file);
});

// Download button
app.get('/api/videos/:id/download', (req, res) => {
  const file = doneFile(req, res);
  if (file) res.download(file, 'QuizMotion-Short.mp4');
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

/* ---------------- production: serve the built website ---------------- */
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

/* ---------------- cleanup ---------------- */
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > KEEP_MS && (job.status === 'done' || job.status === 'error')) {
      fs.rm(job.file, { force: true }, () => {});
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000).unref();

app.listen(PORT, () => {
  console.log(`QuizMotion render server  ->  http://localhost:${PORT}`);
});

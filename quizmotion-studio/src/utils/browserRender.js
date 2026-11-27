import { C, FPS, LABELS, SCENE_FRAMES, TL, TOTAL_FRAMES } from '../video/theme.js';
import { MUSIC_OPTIONS, formToProps } from '../video/props.js';

const W = 720;
const H = 1280;
const S = W / 1080; // scale factor from 1080x1920 coordinates

function wrapText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawScene(ctx, frame, props) {
  const sceneIdx = Math.min(2, Math.floor(frame / SCENE_FRAMES));
  const f = frame - sceneIdx * SCENE_FRAMES;
  const q = props.questions[sceneIdx] || { question: '', answer: '' };
  const isLast = sceneIdx === 2;

  // 1. Background
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, '#060920');
  bg.addColorStop(0.52, '#0E1240');
  bg.addColorStop(1, '#1B0F4D');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Ambient orbs
  const orb1 = ctx.createRadialGradient(W * 0.2, H * 0.22 + Math.sin(frame / 70) * 40, 10, W * 0.2, H * 0.22, 420);
  orb1.addColorStop(0, 'rgba(139,61,255,0.42)');
  orb1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, W, H);

  const orb2 = ctx.createRadialGradient(W * 0.85, H * 0.6 + Math.cos(frame / 60) * 50, 10, W * 0.85, H * 0.6, 380);
  orb2.addColorStop(0, 'rgba(60,255,184,0.22)');
  orb2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(201,184,255,0.045)';
  ctx.lineWidth = 1;
  const gridStep = 72;
  const gridOff = (frame * 0.5) % gridStep;
  for (let x = 0; x < W; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = gridOff; y < H; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Fade out end of Scene 2
  const sceneAlpha = sceneIdx === 1 && f >= 586 ? Math.max(0, 1 - (f - 586) / 14) : 1;
  ctx.save();
  ctx.globalAlpha = sceneAlpha;

  // 2. Header pill + progress dots
  ctx.save();
  ctx.font = `700 ${28}px "Noto Sans Kannada", "Sora", sans-serif`;
  const titleW = Math.min(W - 80, ctx.measureText(props.title).width + 80);
  const pillX = (W - titleW) / 2;
  roundRect(ctx, pillX, 74, titleW, 54, 27);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,184,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = C.mint;
  ctx.beginPath();
  ctx.arc(pillX + 28, 101, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.lavenderSoft;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(props.title, W / 2 + 10, 102, titleW - 56);

  // Scene dots
  for (let i = 0; i < 3; i++) {
    const dw = i === sceneIdx ? 60 : 20;
    const dx = W / 2 - 58 + i * 36 + (i > sceneIdx ? 20 : 0);
    roundRect(ctx, dx, 144, dw, 9, 5);
    ctx.fillStyle = i <= sceneIdx ? C.mint : 'rgba(255,255,255,0.2)';
    ctx.fill();
  }
  ctx.restore();

  // 3. Question Badge
  ctx.save();
  const badgeW = 240;
  roundRect(ctx, (W - badgeW) / 2, 194, badgeW, 64, 32);
  const bGrad = ctx.createLinearGradient((W - badgeW) / 2, 194, (W + badgeW) / 2, 258);
  bGrad.addColorStop(0, C.purple);
  bGrad.addColorStop(1, C.purpleDeep);
  ctx.fillStyle = bGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,184,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = C.mint;
  ctx.beginPath();
  ctx.arc((W - badgeW) / 2 + 34, 226, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.navy;
  ctx.font = '900 34px "Sora", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(sceneIdx + 1), (W - badgeW) / 2 + 34, 227);

  ctx.fillStyle = '#fff';
  ctx.font = '800 34px "Noto Sans Kannada", sans-serif';
  ctx.fillText(LABELS.question, W / 2 + 26, 227);
  ctx.restore();

  // 4. Question Card
  ctx.save();
  const cardX = 54;
  const cardY = 276;
  const cardW = W - 108;
  const cardH = 340;
  roundRect(ctx, cardX, cardY, cardW, cardH, 38);
  const cGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cGrad.addColorStop(0, 'rgba(255,255,255,0.12)');
  cGrad.addColorStop(1, 'rgba(139,61,255,0.16)');
  ctx.fillStyle = cGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(201,184,255,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '800 42px "Noto Sans Kannada", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const qLines = wrapText(ctx, q.question, cardW - 72);
  const lineH = 62;
  const startY = cardY + cardH / 2 - ((qLines.length - 1) * lineH) / 2;
  qLines.forEach((ln, idx) => ctx.fillText(ln, W / 2, startY + idx * lineH));
  ctx.restore();

  // 5. Countdown Ring (frames 120..420) or waiting state
  const stageY = 1250 * S;
  if (f < TL.reveal + 12) {
    const t = f - TL.countStart;
    const started = f >= TL.countStart;
    const idx = Math.min(9, Math.max(0, Math.floor(t / TL.perNumber)));
    const n = 10 - idx;
    const elapsed = Math.min(1, Math.max(0, t / (TL.countEnd - TL.countStart)));
    const numColor = n > 6 ? C.mint : n > 3 ? C.lavender : '#C79BFF';
    const r = 138;

    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, stageY, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 16;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W / 2, stageY, r, -Math.PI / 2 + Math.PI * 2 * elapsed, -Math.PI / 2 + Math.PI * 2);
    ctx.strokeStyle = numColor;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (started && f < TL.reveal) {
      ctx.fillStyle = numColor;
      ctx.font = '900 164px "Sora", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), W / 2, stageY + 6);
    }
    ctx.restore();
  }

  // 6. Answer Reveal (Q1, Q2) or Comment CTA (Q3)
  if (f >= TL.reveal) {
    if (!isLast && q.answer) {
      ctx.save();
      const aw = W - 120;
      const ah = 240;
      roundRect(ctx, 60, stageY - ah / 2, aw, ah, 42);
      ctx.fillStyle = 'rgba(60,255,184,0.18)';
      ctx.fill();
      ctx.strokeStyle = C.mint;
      ctx.lineWidth = 3;
      ctx.stroke();

      roundRect(ctx, W / 2 - 140, stageY - ah / 2 + 24, 280, 48, 24);
      ctx.fillStyle = C.mint;
      ctx.fill();
      ctx.fillStyle = C.navy;
      ctx.font = '800 28px "Noto Sans Kannada", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(LABELS.correct, W / 2, stageY - ah / 2 + 49);

      ctx.fillStyle = C.mint;
      ctx.font = '900 58px "Noto Sans Kannada", sans-serif';
      ctx.fillText(q.answer, W / 2, stageY + 34, aw - 60);
      ctx.restore();
    } else if (isLast) {
      ctx.save();
      ctx.fillStyle = C.mint;
      ctx.font = '900 56px "Noto Sans Kannada", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(LABELS.yourAnswer, W / 2, stageY - 50, W - 80);

      roundRect(ctx, 70, stageY + 40, W - 140, 82, 41);
      ctx.fillStyle = C.purple;
      ctx.fill();
      ctx.strokeStyle = C.mint;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '800 30px "Noto Sans Kannada", sans-serif';
      ctx.fillText(LABELS.comment, W / 2, stageY + 82, W - 180);
      ctx.restore();
    }
  }

  ctx.restore();

  // 7. Single-use Wipe between Q1 -> Q2
  if (sceneIdx === 0 && f >= 566) {
    const p = Math.min(1, (f - 566) / 28);
    const y = (1 - p) * H;
    ctx.fillStyle = '#0d1033';
    ctx.fillRect(0, y, W, H);
    ctx.fillStyle = C.mint;
    ctx.fillRect(0, y, W, 5);
  } else if (sceneIdx === 1 && f < 30) {
    const p = Math.min(1, f / 28);
    const y = -p * H;
    ctx.fillStyle = '#0d1033';
    ctx.fillRect(0, y, W, H);
    ctx.fillStyle = C.mint;
    ctx.fillRect(0, y + H - 5, W, 5);
  }
}

export async function renderInBrowser(form, onProgress) {
  const props = formToProps(form);
  const track = MUSIC_OPTIONS.find((m) => m.id === props.music);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream(FPS);
  let audioCtx = null;
  let audioSource = null;

  if (track?.file) {
    try {
      const res = await fetch(`/${track.file}`);
      const buf = await res.arrayBuffer();
      audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const decoded = await audioCtx.decodeAudioData(buf);
      const dest = audioCtx.createMediaStreamDestination();
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = decoded;
      audioSource.connect(dest);
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      /* proceed without audio if decode fails */
    }
  }

  const hasAudio = stream.getAudioTracks().length > 0;
  const candidates = hasAudio
    ? [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ]
    : ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  const mime = candidates.find((m) => MediaRecorder.isTypeSupported(m));
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 3_500_000 } : undefined);
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      audioCtx?.close().catch(() => {});
      const type = mime?.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type });
      const url = URL.createObjectURL(blob);
      resolve({ videoUrl: url, downloadUrl: url, filename: `QuizMotion-Short.${ext}` });
    };
  });

  drawScene(ctx, 0, props);
  recorder.start(500);
  if (audioSource) audioSource.start(0);

  const startMs = performance.now();
  const totalMs = (TOTAL_FRAMES / FPS) * 1000;

  return new Promise((resolve) => {
    const step = () => {
      const elapsed = performance.now() - startMs;
      const frame = Math.min(TOTAL_FRAMES - 1, Math.floor((elapsed / 1000) * FPS));
      drawScene(ctx, frame, props);
      onProgress?.(Math.min(0.99, elapsed / totalMs));

      if (elapsed < totalMs) {
        requestAnimationFrame(step);
      } else {
        recorder.stop();
        done.then(resolve);
      }
    };
    requestAnimationFrame(step);
  });
}

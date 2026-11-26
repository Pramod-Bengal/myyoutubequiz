import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const SAMPLE_RATE = 22050;
const DURATION = 60;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION;

function writeWav(filename, left, right) {
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = TOTAL_SAMPLES * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    buffer.writeInt16LE(Math.round(left[i] * 32767), offset);
    buffer.writeInt16LE(Math.round(right[i] * 32767), offset + 2);
    offset += 4;
  }

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), buffer);
}

function clockAndSfx(st, sceneIdx, sigL, sigR) {
  if (st >= 4.0 && st < 14.0) {
    const countT = st - 4.0;
    const secIdx = Math.floor(countT);
    const tickT = countT - secIdx;
    const isUrgent = secIdx >= 7;

    if (tickT < 0.09) {
      const clickEnv = Math.exp(-tickT * 145);
      const bodyEnv = Math.exp(-tickT * 52);
      const tickClick =
        (Math.sin(2 * Math.PI * 2400 * tickT) * 0.55 + Math.sin(2 * Math.PI * 3900 * tickT) * 0.45) *
        clickEnv *
        0.28;
      const tickBody = Math.sin(2 * Math.PI * (isUrgent ? 1150 : 880) * tickT) * bodyEnv * 0.22;
      sigL += tickClick + tickBody;
      sigR += tickClick + tickBody;
    }
    if (isUrgent && tickT >= 0.5 && tickT < 0.57) {
      const tockT = tickT - 0.5;
      const tock = Math.sin(2 * Math.PI * 1850 * tockT) * Math.exp(-tockT * 160) * 0.14;
      sigL += tock;
      sigR += tock;
    }
  }

  if (st >= 0.5 && st < 1.3) {
    const qt = st - 0.5;
    const qe = Math.exp(-qt * 6.5) * Math.min(1, qt / 0.008);
    const qChime = (Math.sin(2 * Math.PI * 659.25 * qt) * 0.6 + Math.sin(2 * Math.PI * 987.77 * qt) * 0.4) * qe * 0.11;
    sigL += qChime;
    sigR += qChime;
  }

  if (st >= 14.0 && st < 15.6) {
    const rt = st - 14.0;
    const notes = sceneIdx === 2 ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [523.25, 659.25, 783.99, 1046.5];
    for (let n = 0; n < notes.length; n++) {
      const nt = rt - n * 0.045;
      if (nt >= 0) {
        const ne = Math.exp(-nt * 4.2) * Math.min(1, nt / 0.006);
        const chime = Math.sin(2 * Math.PI * notes[n] * nt) * ne * 0.095;
        sigL += chime * (n % 2 === 0 ? 0.65 : 0.35);
        sigR += chime * (n % 2 === 0 ? 0.35 : 0.65);
      }
    }
  }
  return [sigL, sigR];
}

function generateModern() {
  const left = new Float32Array(TOTAL_SAMPLES);
  const right = new Float32Array(TOTAL_SAMPLES);
  const prog = [
    { bass: 87.31, chord: [174.61, 220.0, 261.63, 329.63], arp: [349.23, 440.0, 523.25, 659.25] },
    { bass: 98.0, chord: [196.0, 246.94, 293.66, 329.63], arp: [392.0, 493.88, 587.33, 659.25] },
    { bass: 82.41, chord: [164.81, 196.0, 246.94, 293.66], arp: [329.63, 392.0, 493.88, 587.33] },
    { bass: 110.0, chord: [220.0, 261.63, 329.63, 392.0, 493.88], arp: [440.0, 523.25, 659.25, 783.99] },
  ];
  let seed = 9876543;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const sceneIdx = Math.min(2, Math.floor(t / 20));
    const st = t - sceneIdx * 20;
    const barIdx = Math.floor(t / 2.0);
    const barT = t % 2.0;
    const beatIdx = Math.floor(t / 0.5);
    const beatT = t % 0.5;
    const cur = prog[barIdx % prog.length];
    const isCountdown = st >= 4.0 && st < 14.0;
    const isReveal = st >= 14.0;

    let sigL = 0;
    let sigR = 0;

    const bassEnv = Math.exp(-beatT * 2.4) * Math.min(1, beatT / 0.08);
    const sub = (Math.sin(2 * Math.PI * cur.bass * t) * 0.24 + Math.sin(2 * Math.PI * cur.bass * 2 * t) * 0.06) * bassEnv;
    sigL += sub;
    sigR += sub;

    const padLevel = isCountdown ? 0.032 : isReveal ? 0.068 : 0.045;
    const padPump = 0.55 + 0.45 * Math.min(1, beatT / 0.14);
    for (let c = 0; c < cur.chord.length; c++) {
      const f = cur.chord[c];
      const det = c % 2 === 0 ? 1.002 : 0.998;
      const s1 = Math.sin(2 * Math.PI * f * t);
      const s2 = Math.sin(2 * Math.PI * f * det * t);
      sigL += (s1 * 0.65 + s2 * 0.35) * padLevel * padPump;
      sigR += (s2 * 0.65 + s1 * 0.35) * padLevel * padPump;
    }

    if (!isCountdown) {
      const stepIdx = Math.floor(barT / 0.25);
      const stepT = barT % 0.25;
      const arpF = cur.arp[stepIdx % cur.arp.length];
      const arpEnv = Math.exp(-stepT * 13.0) * Math.min(1, stepT / 0.005);
      const pluck = (Math.sin(2 * Math.PI * arpF * t) * 0.78 + Math.sin(2 * Math.PI * arpF * 2 * t) * 0.22) * arpEnv * (isReveal ? 0.16 : 0.09);
      const pan = stepIdx % 2 === 0 ? -0.3 : 0.3;
      sigL += pluck * (0.5 - pan * 0.5);
      sigR += pluck * (0.5 + pan * 0.5);
    }

    if ((isReveal || beatIdx % 2 === 0) && beatT < 0.16) {
      const kf = 42 + 95 * Math.exp(-beatT * 40);
      const k = Math.sin(2 * Math.PI * kf * beatT) * Math.exp(-beatT * 20) * Math.min(1, beatT / 0.003) * (isCountdown ? 0.16 : 0.24);
      sigL += k;
      sigR += k;
    }
    if (isReveal) {
      const offT = (t + 0.25) % 0.5;
      if (offT < 0.05) {
        const hat = (rand() * 2 - 1) * Math.exp(-offT * 85) * 0.045;
        sigL += hat * 0.85;
        sigR += hat * 1.15;
      }
    }

    [sigL, sigR] = clockAndSfx(st, sceneIdx, sigL, sigR);
    const master = Math.min(1, t / 0.4) * Math.min(1, (DURATION - t) / 1.5) * 0.92;
    left[i] = Math.max(-0.95, Math.min(0.95, sigL * master));
    right[i] = Math.max(-0.95, Math.min(0.95, sigR * master));
  }
  writeWav('bgm.wav', left, right);
}

function generateLofi() {
  const left = new Float32Array(TOTAL_SAMPLES);
  const right = new Float32Array(TOTAL_SAMPLES);
  const chords = [
    { bass: 73.42, pad: [220.0, 261.63, 329.63, 392.0], bell: [523.25, 659.25, 587.33, 440.0] },
    { bass: 98.0, pad: [196.0, 246.94, 293.66, 349.23], bell: [493.88, 587.33, 523.25, 392.0] },
    { bass: 65.41, pad: [164.81, 196.0, 246.94, 293.66], bell: [392.0, 493.88, 440.0, 329.63] },
    { bass: 82.41, pad: [196.0, 246.94, 329.63, 392.0], bell: [440.0, 523.25, 493.88, 392.0] },
  ];
  let seed = 424242;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const sceneIdx = Math.min(2, Math.floor(t / 20));
    const st = t - sceneIdx * 20;
    const isCountdown = st >= 4.0 && st < 14.0;
    const isReveal = st >= 14.0;
    const barT = t % 2.5;
    const barIdx = Math.floor(t / 2.5);
    const beatT = t % (2.5 / 4);
    const cur = chords[barIdx % chords.length];

    let sigL = 0;
    let sigR = 0;
    const chordEnv = Math.min(1, barT / 0.04) * Math.exp(-barT * 0.45);
    const level = isCountdown ? 0.036 : isReveal ? 0.072 : 0.052;
    for (let c = 0; c < cur.pad.length; c++) {
      const f = cur.pad[c];
      const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 3.5 * t + c);
      const tone = Math.sin(2 * Math.PI * f * t) * 0.8 + Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-barT * 4) * 0.2;
      sigL += tone * chordEnv * level * trem * (c % 2 === 0 ? 1.1 : 0.9);
      sigR += tone * chordEnv * level * trem * (c % 2 === 0 ? 0.9 : 1.1);
    }

    const bass = Math.sin(2 * Math.PI * cur.bass * t) * Math.min(1, beatT / 0.02) * Math.exp(-beatT * 2.1) * 0.22;
    sigL += bass;
    sigR += bass;

    if (isReveal) {
      const stepIdx = Math.floor(barT / (2.5 / 4));
      const stepT = barT % (2.5 / 4);
      const mf = cur.bell[stepIdx % cur.bell.length];
      const mel = Math.sin(2 * Math.PI * mf * t) * Math.min(1, stepT / 0.008) * Math.exp(-stepT * 5.5) * 0.11;
      sigL += mel * 0.8;
      sigR += mel * 1.2;
    }

    if (beatT < 0.14 && (Math.floor(t / (2.5 / 4)) % 2 === 0 || isReveal)) {
      const kf = 40 + 60 * Math.exp(-beatT * 30);
      const k = Math.sin(2 * Math.PI * kf * beatT) * Math.exp(-beatT * 18) * 0.18;
      sigL += k;
      sigR += k;
    }

    if (rand() > 0.997) {
      const cr = (rand() * 2 - 1) * 0.025;
      sigL += cr;
      sigR -= cr;
    }

    [sigL, sigR] = clockAndSfx(st, sceneIdx, sigL, sigR);
    const master = Math.min(1, t / 0.4) * Math.min(1, (DURATION - t) / 1.5) * 0.92;
    left[i] = Math.max(-0.95, Math.min(0.95, sigL * master));
    right[i] = Math.max(-0.95, Math.min(0.95, sigR * master));
  }
  writeWav('bgm-lofi.wav', left, right);
}

function generateEnergetic() {
  const left = new Float32Array(TOTAL_SAMPLES);
  const right = new Float32Array(TOTAL_SAMPLES);
  const prog = [
    { bass: 98.0, arp: [392.0, 493.88, 587.33, 783.99, 587.33, 493.88] },
    { bass: 82.41, arp: [329.63, 493.88, 659.25, 783.99, 659.25, 493.88] },
    { bass: 130.81, arp: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25] },
    { bass: 110.0, arp: [440.0, 554.37, 659.25, 880.0, 659.25, 554.37] },
  ];
  let seed = 777111;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const sceneIdx = Math.min(2, Math.floor(t / 20));
    const st = t - sceneIdx * 20;
    const isCountdown = st >= 4.0 && st < 14.0;
    const isReveal = st >= 14.0;
    const barLen = 1.875;
    const barIdx = Math.floor(t / barLen);
    const barT = t % barLen;
    const beatLen = barLen / 4;
    const beatT = t % beatLen;
    const cur = prog[barIdx % prog.length];

    let sigL = 0;
    let sigR = 0;

    const bassDiv = isCountdown ? beatLen : beatLen / 2;
    const bassT = t % bassDiv;
    const bassEnv = Math.min(1, bassT / 0.005) * Math.exp(-bassT * 7.5);
    const saw = Math.sin(2 * Math.PI * cur.bass * t) * 0.7 + Math.sin(2 * Math.PI * cur.bass * 2 * t) * 0.22 + Math.sin(2 * Math.PI * cur.bass * 3 * t) * 0.08;
    const bassVal = saw * bassEnv * (isCountdown ? 0.16 : 0.24);
    sigL += bassVal;
    sigR += bassVal;

    const stepLen = barLen / 8;
    const stepIdx = Math.floor(barT / stepLen);
    const stepT = barT % stepLen;
    const af = cur.arp[stepIdx % cur.arp.length];
    const arpWave = (Math.sin(2 * Math.PI * af * t) * 0.7 + Math.sin(2 * Math.PI * af * 2 * t) * 0.3) * Math.min(1, stepT / 0.004) * Math.exp(-stepT * 12) * (isCountdown ? 0.045 : isReveal ? 0.16 : 0.1);
    const pan = stepIdx % 2 === 0 ? -0.35 : 0.35;
    sigL += arpWave * (0.5 - pan * 0.5);
    sigR += arpWave * (0.5 + pan * 0.5);

    if (beatT < 0.15 && (!isCountdown || Math.floor(t / beatLen) % 2 === 0)) {
      const kf = 46 + 115 * Math.exp(-beatT * 42);
      const k = Math.sin(2 * Math.PI * kf * beatT) * Math.exp(-beatT * 22) * (isCountdown ? 0.15 : 0.25);
      sigL += k;
      sigR += k;
    }

    if (isReveal) {
      const offT = (t + beatLen / 2) % beatLen;
      if (offT < 0.045) {
        const hat = (rand() * 2 - 1) * Math.exp(-offT * 90) * 0.05;
        sigL += hat * 0.9;
        sigR += hat * 1.1;
      }
    }

    [sigL, sigR] = clockAndSfx(st, sceneIdx, sigL, sigR);
    const master = Math.min(1, t / 0.4) * Math.min(1, (DURATION - t) / 1.5) * 0.9;
    left[i] = Math.max(-0.95, Math.min(0.95, sigL * master));
    right[i] = Math.max(-0.95, Math.min(0.95, sigR * master));
  }
  writeWav('bgm-energetic.wav', left, right);
}

generateModern();
generateLofi();
generateEnergetic();
console.log('Generated all 3 background music tracks in public/');

// Shared constants for the 60-second quiz video.
// Everything is frame-based: 30 fps x 60 s = 1800 frames, 3 scenes x 600 frames (20 s).

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const SCENE_FRAMES = 600;
export const TOTAL_FRAMES = SCENE_FRAMES * 3; // 1800 = exactly 60 seconds

export const C = {
  navy: '#070A22',
  navy2: '#0E1238',
  mint: '#3CFFB8',
  mintDeep: '#12C98A',
  purple: '#8B3DFF',
  purpleDeep: '#5B1FD1',
  purpleSoft: '#B98CFF',
  lavender: '#C9B8FF',
  lavenderSoft: '#E7DEFF',
  white: '#F7F4FF',
};

export const FONT = '"Noto Sans Kannada", "Noto Sans", system-ui, sans-serif';

// All on-screen Kannada labels live here.
export const LABELS = {
  question: 'ಪ್ರಶ್ನೆ',
  correct: 'ಸರಿಯಾದ ಉತ್ತರ',
  yourAnswer: 'ನಿಮ್ಮ ಉತ್ತರ ಏನು?',
  comment: 'ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಕಾಮೆಂಟ್ ಮಾಡಿ!',
};

// Timeline inside one 20-second scene (local frames)
export const TL = {
  enter: 16, // question starts to appear (after the transition wipe clears)
  countStart: 120, // 4.0 s -> countdown "10" appears (4s to read the question)
  perNumber: 30, // 1 s per number
  countEnd: 420, // 14.0 s -> countdown finished (10 numbers x 30 frames)
  reveal: 420, // 14.0 s -> answer reveal (Q1, Q2) / comment call-to-action (Q3)
  exit: 566, // transition wipe / closing iris starts
};

export const DEFAULT_PROPS = {
  title: 'ಕನ್ನಡ ರಸಪ್ರಶ್ನೆ',
  questions: [
    { question: 'ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?', answer: 'ಬೆಂಗಳೂರು' },
    { question: 'ಜೋಗ ಜಲಪಾತ ಯಾವ ನದಿಯಲ್ಲಿದೆ?', answer: 'ಶರಾವತಿ' },
    { question: 'ಕನ್ನಡಕ್ಕೆ ಮೊದಲ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ತಂದುಕೊಟ್ಟವರು ಯಾರು?' },
  ],
};

// Pick a font size from the text length so long Kannada text still fits.
// tiers: [[maxCodePoints, fontSize], ...] ordered from short to long.
export function fitSize(text, tiers) {
  const len = [...String(text || '')].length;
  for (const [max, size] of tiers) {
    if (len <= max) return size;
  }
  return tiers[tiers.length - 1][1];
}

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

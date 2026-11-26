// Shared by the website AND the render server (plain JS, no JSX / CSS).
// This is the single place where form input becomes video input.
//
// IMPORTANT: the third answer is accepted as form input but is deliberately
// dropped here, so it can never reach the video composition.

export const LIMITS = { title: 80, question: 170, answer: 100 };

export const MUSIC_OPTIONS = [
  { id: 'modern', label: 'Modern Pop', desc: 'Future-pop + clock ticks', file: 'bgm.wav' },
  { id: 'lofi', label: 'Chill Lo-Fi', desc: 'Warm Rhodes + clock ticks', file: 'bgm-lofi.wav' },
  { id: 'energetic', label: 'Energetic Synth', desc: 'Upbeat 128 BPM + clock', file: 'bgm-energetic.wav' },
  { id: 'none', label: 'No Music', desc: 'Silent video', file: null },
];

const MUSIC_IDS = new Set(MUSIC_OPTIONS.map((m) => m.id));
const cleanMusic = (v) => (MUSIC_IDS.has(v) ? v : 'modern');

const clean = (value, max) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

export function sanitizeProps(input) {
  const qs = Array.isArray(input?.questions) ? input.questions : [];
  const at = (i) => qs[i] || {};
  return {
    title: clean(input?.title, LIMITS.title) || 'ಕನ್ನಡ ರಸಪ್ರಶ್ನೆ',
    music: cleanMusic(input?.music),
    questions: [
      { question: clean(at(0).question, LIMITS.question), answer: clean(at(0).answer, LIMITS.answer) },
      { question: clean(at(1).question, LIMITS.question), answer: clean(at(1).answer, LIMITS.answer) },
      // Question 3: question text ONLY. No answer field exists for it.
      { question: clean(at(2).question, LIMITS.question) },
    ],
  };
}

// form = { title, q1, a1, q2, a2, q3, a3, music }
export function formToProps(form) {
  return sanitizeProps({
    title: form?.title,
    music: form?.music,
    questions: [
      { question: form?.q1, answer: form?.a1 },
      { question: form?.q2, answer: form?.a2 },
      { question: form?.q3 }, // form.a3 intentionally ignored
    ],
  });
}

export const FIELD_LABELS = {
  title: 'Video Title',
  q1: 'Question 1',
  a1: 'Answer 1',
  q2: 'Question 2',
  a2: 'Answer 2',
  q3: 'Question 3',
  a3: 'Answer 3',
};

// Returns a list of human-readable problems (empty list = OK).
export function validateForm(form) {
  const errors = [];
  for (const key of Object.keys(FIELD_LABELS)) {
    if (!clean(form?.[key], 1000)) errors.push(`${FIELD_LABELS[key]} is required.`);
  }
  return errors;
}

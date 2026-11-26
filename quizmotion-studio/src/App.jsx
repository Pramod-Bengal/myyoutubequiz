import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import { useRender } from './hooks/useRender.js';
import { LIMITS, MUSIC_OPTIONS, formToProps, validateForm } from './video/props.js';

// The 7 inputs: Video Title + (Question, Answer) x 3, plus background music choice.
const SAMPLE = {
  title: 'ಕನ್ನಡ ರಸಪ್ರಶ್ನೆ',
  q1: 'ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?',
  a1: 'ಬೆಂಗಳೂರು',
  q2: 'ಜೋಗ ಜಲಪಾತ ಯಾವ ನದಿಯಲ್ಲಿದೆ?',
  a2: 'ಶರಾವತಿ',
  q3: 'ಕನ್ನಡಕ್ಕೆ ಮೊದಲ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ತಂದುಕೊಟ್ಟವರು ಯಾರು?',
  a3: 'ಕುವೆಂಪು',
  music: 'modern',
};
const TEXT_FIELDS = ['title', 'q1', 'a1', 'q2', 'a2', 'q3', 'a3'];
const EMPTY = { ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, ''])), music: 'modern' };
const STORE_KEY = 'quizmotion-form-v1';

function loadForm() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && typeof saved === 'object') return { ...SAMPLE, ...saved };
  } catch {
    /* ignore */
  }
  return SAMPLE;
}

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export default function App() {
  const [form, setForm] = useState(loadForm);
  const { state: render, start, busy } = useRender();

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const problems = useMemo(() => validateForm(form), [form]);
  const filledCount = TEXT_FIELDS.length - problems.length;

  // Preview: empty fields fall back to the sample text so the phone is never blank.
  const debounced = useDebounced(form, 350);
  const previewProps = useMemo(() => {
    const filled = {
      ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, debounced[k]?.trim() ? debounced[k] : SAMPLE[k]])),
      music: debounced.music || SAMPLE.music,
    };
    return formToProps(filled);
  }, [debounced]);

  const stale = render.status === 'done' && render.snapshot !== JSON.stringify(form);

  return (
    <>
      <nav className="nav">
        <div className="container nav-in">
          <a className="logo" href="#top">
            <span className="logo-mark" aria-hidden="true" />
            QuizMotion <b>Studio</b>
          </a>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a className="nav-cta" href="#studio">
              Open studio
            </a>
          </div>
        </div>
      </nav>

      <Hero />
      <HowItWorks />

      <section className="section studio" id="studio">
        <div className="container">
          <div className="studio-head">
            <motion.div
              className="section-head"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="eyebrow">
                <i /> The studio
              </span>
              <h2>Create your quiz video</h2>
              <p className="lead small">
                Auto-saved locally as you type. Preview updates live on the right.
              </p>
            </motion.div>

            <div className="studio-status" aria-live="polite">
              <div className="studio-dots" aria-hidden="true">
                {TEXT_FIELDS.map((k) => (
                  <span key={k} className={form[k]?.trim() ? 'ok' : ''} />
                ))}
              </div>
              <span>
                <b>{filledCount}/{TEXT_FIELDS.length}</b> fields ready
              </span>
            </div>
          </div>

          <div className="studio-grid">
            <div className="form">
              <motion.section
                className="qcard titlecard"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <label className="field">
                  <div className="label-row">
                    <span className="label">Video Title</span>
                    <span className="count">
                      {form.title.length}/{LIMITS.title}
                    </span>
                  </div>
                  <input
                    lang="kn"
                    type="text"
                    maxLength={LIMITS.title}
                    value={form.title}
                    onChange={(e) => set('title')(e.target.value)}
                    placeholder="ಉದಾ: ಕನ್ನಡ ಸಾಮಾನ್ಯ ಜ್ಞಾನ ರಸಪ್ರಶ್ನೆ"
                    spellCheck={false}
                  />
                  <span className="hint">Shown at the top of every scene in the video.</span>
                </label>

                <div className="field music-field">
                  <div className="label-row">
                    <span className="label">Background Music</span>
                    <span className="hint">Synced with 10→1 clock ticks</span>
                  </div>
                  <div className="music-grid" role="radiogroup" aria-label="Background Music">
                    {MUSIC_OPTIONS.map((m) => {
                      const active = (form.music || 'modern') === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          className={`music-opt ${active ? 'on' : ''}`}
                          onClick={() => set('music')(m.id)}
                        >
                          <b>{m.label}</b>
                          <small>{m.desc}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              {[1, 2, 3].map((n) => (
                <QuestionCard
                  key={n}
                  n={n}
                  question={form[`q${n}`]}
                  answer={form[`a${n}`]}
                  onQuestion={set(`q${n}`)}
                  onAnswer={set(`a${n}`)}
                  hiddenAnswer={n === 3}
                />
              ))}

              <div className="form-actions">
                <button className="link-btn" type="button" onClick={() => setForm(EMPTY)}>
                  Clear all fields
                </button>
                <button className="link-btn" type="button" onClick={() => setForm(SAMPLE)}>
                  Restore sample quiz
                </button>
              </div>
            </div>

            <PreviewPanel
              previewProps={previewProps}
              render={render}
              busy={busy}
              canGenerate={problems.length === 0}
              problems={problems}
              stale={stale}
              onGenerate={() => start(form)}
            />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <span>QuizMotion Studio</span>
          <span>React · Framer Motion · Remotion · Express</span>
        </div>
      </footer>
    </>
  );
}

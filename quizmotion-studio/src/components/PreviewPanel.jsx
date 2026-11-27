import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Player } from '@remotion/player';
import { QuizVideo } from '../video/QuizVideo.jsx';
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from '../video/theme.js';

const JUMPS = [
  { label: 'Q1', sec: 0 },
  { label: 'Q1 answer', sec: 14 },
  { label: 'Q2', sec: 20 },
  { label: 'Q2 answer', sec: 34 },
  { label: 'Q3', sec: 40 },
  { label: 'Finale', sec: 54 },
];

const STAGE_TEXT = {
  queued: 'Waiting for the render server…',
  bundling: 'Preparing the video engine…',
  rendering: 'Rendering your 60-second video…',
  encoding: 'Encoding the H.264 MP4…',
};

export default function PreviewPanel({ previewProps, render, busy, canGenerate, problems, onGenerate, stale }) {
  const playerRef = useRef(null);
  const [tab, setTab] = useState('live'); // live | mp4
  const [activeJump, setActiveJump] = useState(null);
  const done = render.status === 'done';

  // When a new MP4 is ready, show it straight away.
  useEffect(() => {
    if (done) setTab('mp4');
  }, [done, render.videoUrl]);

  const jump = (label, sec) => {
    setActiveJump(label);
    setTab('live');
    requestAnimationFrame(() => {
      playerRef.current?.seekTo(Math.round(sec * FPS));
      playerRef.current?.play();
    });
  };

  const pct = Math.round(render.progress * 100);

  return (
    <aside className="preview">
      <div className="preview-head">
        <div className="preview-title">
          <span className="live-dot" aria-hidden="true" />
          <h3>{tab === 'mp4' && done ? 'Rendered output' : 'Live preview'}</h3>
        </div>
        {done && (
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'live'} className={tab === 'live' ? 'on' : ''} onClick={() => setTab('live')}>
              {tab === 'live' && <motion.span layoutId="previewTabPill" className="tab-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <span style={{ position: 'relative', zIndex: 1 }}>Live</span>
            </button>
            <button role="tab" aria-selected={tab === 'mp4'} className={tab === 'mp4' ? 'on' : ''} onClick={() => setTab('mp4')}>
              {tab === 'mp4' && <motion.span layoutId="previewTabPill" className="tab-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <span style={{ position: 'relative', zIndex: 1 }}>MP4</span>
            </button>
          </div>
        )}
      </div>

      <div className="phone">
        <div className="phone-screen">
          {tab === 'mp4' && done ? (
            <video key={render.videoUrl} src={render.videoUrl} controls playsInline loop autoPlay />
          ) : (
            <Player
              ref={playerRef}
              component={QuizVideo}
              inputProps={previewProps}
              durationInFrames={TOTAL_FRAMES}
              fps={FPS}
              compositionWidth={WIDTH}
              compositionHeight={HEIGHT}
              initialFrame={100}
              controls
              loop
              clickToPlay
              acknowledgeRemotionLicense
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
      </div>

      <div className="jumps" aria-label="Jump to a moment in the preview">
        {JUMPS.map((j) => (
          <motion.button
            key={j.label}
            className={`chip ${activeJump === j.label && tab === 'live' ? 'active' : ''}`}
            onClick={() => jump(j.label, j.sec)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          >
            {j.label}
          </motion.button>
        ))}
      </div>

      <p className="meta">1080 × 1920 · 9:16 · 30 fps · 60 s · H.264 MP4</p>

      <motion.button
        className="btn btn-primary btn-block"
        onClick={onGenerate}
        disabled={busy || !canGenerate}
        whileHover={!busy && canGenerate ? { scale: 1.02 } : undefined}
        whileTap={!busy && canGenerate ? { scale: 0.98 } : undefined}
      >
        {busy ? 'Rendering…' : done ? 'Generate again' : 'Generate Video'}
      </motion.button>

      {!canGenerate && !busy && problems.length > 0 && (
        <p className="note warn">Fill in every field first: {problems.length} missing.</p>
      )}

      <AnimatePresence initial={false}>
        {busy && (
          <motion.div
            key="progress"
            className="progress"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="progress-row">
              <span>{STAGE_TEXT[render.status] || 'Working…'}</span>
              <b>{pct}%</b>
            </div>
            <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <motion.div className="bar-fill" animate={{ width: `${Math.max(3, pct)}%` }} transition={{ ease: 'easeOut', duration: 0.5 }} />
              <span className="bar-shine" />
            </div>
            <small>Generating your 60-second video…</small>
          </motion.div>
        )}

        {render.status === 'error' && (
          <motion.p key="err" className="note error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {render.error}
          </motion.p>
        )}

        {done && (
          <motion.div key="done" className="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.a
              className="btn btn-mint btn-block"
              href={render.downloadUrl}
              download={render.filename || 'QuizMotion-Short.mp4'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download Video ({render.filename?.endsWith('.webm') ? 'WEBM' : 'MP4'})
            </motion.a>
            {stale && <p className="note warn">You changed the quiz after rendering. Press “Generate again” to update the MP4.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

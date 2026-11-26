import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay: 0.08 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
});

function PhoneTeaser() {
  const [n, setN] = useState(10);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v <= 1 ? 10 : v - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="teaser"
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="teaser-float"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.02, rotateY: -3, rotateX: 2 }}
      >
        <div className="teaser-phone">
          <div className="teaser-notch" aria-hidden="true" />
          <div className="teaser-pill">ಕನ್ನಡ ರಸಪ್ರಶ್ನೆ</div>
          <div className="teaser-card">ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?</div>
          <div className="teaser-ring">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" className="ring-track" />
              <motion.circle
                key={n === 10 ? 'reset' : 'run'}
                cx="60"
                cy="60"
                r="52"
                className="ring-run"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: n === 10 ? 1 : (n - 1) / 10 }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </svg>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={n}
                className="teaser-num"
                initial={{ scale: 1.55, opacity: 0, filter: 'blur(4px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 0.65, opacity: 0, filter: 'blur(4px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {n}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="teaser-footer">
            <span>Scene 1 / 3</span>
            <b>9:16 Shorts</b>
          </div>
        </div>
      </motion.div>
      <span className="orb orb-a" />
      <span className="orb orb-b" />
    </motion.div>
  );
}

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="container hero-grid">
        <div>
          <motion.span className="eyebrow" {...fade(0)}>
            <i /> For YouTube Shorts · 100% Kannada
          </motion.span>
          <motion.h1 {...fade(1)}>
            Turn <span className="grad">3 questions</span> into a 60-second animated quiz video.
          </motion.h1>
          <motion.p className="lead" {...fade(2)}>
            Type your Kannada questions, preview the motion graphics in real time, and export a ready-to-upload MP4 with
            countdown timers, answer reveals, and a comment-bait finale.
          </motion.p>
          <motion.div className="hero-actions" {...fade(3)}>
            <motion.a
              className="btn btn-primary"
              href="#studio"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            >
              Start creating
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
            <motion.a
              className="btn btn-ghost"
              href="#how"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            >
              How it works
            </motion.a>
          </motion.div>
          <motion.ul className="specs" {...fade(4)}>
            <li>1080 × 1920</li>
            <li>9:16 Vertical</li>
            <li>Exactly 60 s</li>
            <li>H.264 MP4</li>
          </motion.ul>
        </div>
        <PhoneTeaser />
      </div>
    </header>
  );
}

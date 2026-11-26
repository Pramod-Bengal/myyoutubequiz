import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    tag: 'Input',
    title: 'Type your quiz',
    text: 'Add a title, three Kannada questions, and their answers. Works with any Kannada keyboard or Google Input Tools.',
  },
  {
    n: '02',
    tag: 'Preview',
    title: 'Watch live motion',
    text: 'The studio phone on the right renders your 60-second composition live while you type. Jump to any beat instantly.',
  },
  {
    n: '03',
    tag: 'Export',
    title: 'Render & download',
    text: 'Press Generate Video. The server renders a crisp 1080×1920 H.264 MP4 ready for YouTube Shorts.',
  },
];

const SEGMENTS = [
  { time: '0–20 s', pct: '33%', desc: 'Question 1 · countdown 10→1 · answer reveal' },
  { time: '20–40 s', pct: '66%', desc: 'Question 2 · countdown 10→1 · answer reveal' },
  { time: '40–60 s', pct: '100%', desc: 'Question 3 · countdown 10→1 · “ನಿಮ್ಮ ಉತ್ತರ ಏನು?” · finale', last: true },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="container">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">
            <i /> Workflow
          </span>
          <h2>Three steps. Broadcast-grade output.</h2>
        </motion.div>

        <div className="steps">
          {STEPS.map((s, i) => (
            <motion.article
              key={s.n}
              className="step"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5 }}
            >
              <div className="step-top">
                <span className="step-n">{s.n}</span>
                <span className="step-tag">{s.tag}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="timeline"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {SEGMENTS.map((seg, i) => (
            <div key={seg.time} className={`tl-seg ${seg.last ? 'tl-last' : ''}`}>
              <div className="tl-head">
                <b>{seg.time}</b>
                <small style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>Scene {i + 1}</small>
              </div>
              <div className="tl-bar">
                <motion.i
                  initial={{ width: 0 }}
                  whileInView={{ width: seg.pct }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span>{seg.desc}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

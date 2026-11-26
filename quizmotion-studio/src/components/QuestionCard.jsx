import React from 'react';
import { motion } from 'framer-motion';
import { LIMITS } from '../video/props.js';

const SCENE_TIMES = ['0–20 s', '20–40 s', '40–60 s'];

export default function QuestionCard({ n, question, answer, onQuestion, onAnswer, hiddenAnswer = false }) {
  const ready = question.trim().length > 0 && answer.trim().length > 0;
  const qNear = question.length >= LIMITS.question * 0.85;
  const aNear = answer.length >= LIMITS.answer * 0.85;

  return (
    <motion.section
      className={`qcard ${hiddenAnswer ? 'qcard-last' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="qcard-top">
        <div className="qcard-top-left">
          <span className="qnum">{n}</span>
          <div>
            <h3>Question {n}</h3>
            <small>Video seconds {SCENE_TIMES[n - 1]}</small>
          </div>
        </div>
        <span className={`qcheck ${ready ? '' : 'pending'}`}>{ready ? 'Ready' : 'Needs input'}</span>
      </div>

      <label className="field">
        <div className="label-row">
          <span className="label">Question {n} (Kannada)</span>
          <span className={`count ${qNear ? 'near' : ''}`}>
            {question.length}/{LIMITS.question}
          </span>
        </div>
        <textarea
          lang="kn"
          rows={3}
          maxLength={LIMITS.question}
          value={question}
          onChange={(e) => onQuestion(e.target.value)}
          placeholder="ಇಲ್ಲಿ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ…"
          spellCheck={false}
        />
      </label>

      <label className="field">
        <div className="label-row">
          <span className="label">
            Answer {n} (Kannada)
            {hiddenAnswer && (
              <em className="badge-lock">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.4" />
                  <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                Never shown in video
              </em>
            )}
          </span>
          {!hiddenAnswer && (
            <span className={`count ${aNear ? 'near' : ''}`}>
              {answer.length}/{LIMITS.answer}
            </span>
          )}
        </div>
        <input
          lang="kn"
          type="text"
          maxLength={LIMITS.answer}
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="ಇಲ್ಲಿ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ…"
          spellCheck={false}
        />
        {hiddenAnswer && (
          <span className="hint">
            Saved with your quiz for your own reference. The video asks viewers to answer in the comments instead.
          </span>
        )}
      </label>
    </motion.section>
  );
}

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { TL, clamp } from './theme.js';
import {
  AnswerReveal,
  Closing,
  CommentCTA,
  CountdownRing,
  Header,
  QuestionBadge,
  QuestionCard,
  Wipe,
} from './pieces.jsx';

// One 20-second scene (600 frames):
//   0-30     transition wipe clears (scenes 2 and 3)
//   16-60    header, badge and question animate in
//   60-360   animated countdown 10 -> 1
//   360-566  Q1/Q2: correct answer reveal      Q3: "ನಿಮ್ಮ ಉತ್ತರ ಏನು?" + comment call-to-action
//   566-600  Q1/Q2: wipe into next scene       Q3: closing effect + iris close
export const Scene = ({ index, title, question, answer, isLast }) => {
  const f = useCurrentFrame();
  // Only questions 1 and 2 ever receive an answer; the last scene never does.
  const showAnswer = !isLast && typeof answer === 'string';
  const dim = interpolate(f, [TL.reveal, TL.reveal + 20], [1, 0.88], clamp);
  // Subtle fade-out at the end of Scene 2 so Scene 3 enters cleanly without repeating the Wipe.
  const sceneFade = index === 1 ? interpolate(f, [586, 600], [1, 0], clamp) : 1;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: sceneFade }}>
      <Header title={title} index={index} f={f} />
      <QuestionBadge n={index + 1} f={f} />
      <QuestionCard text={question} f={f} dim={dim} />

      {f < TL.reveal + 16 && <CountdownRing f={f} />}

      {showAnswer && <AnswerReveal f={f} answer={answer} />}
      {isLast && <CommentCTA f={f} />}
      {isLast && <Closing f={f} />}

      {index === 1 && <Wipe f={f} mode="uncover" />}
      {index === 0 && <Wipe f={f} mode="cover" />}
    </AbsoluteFill>
  );
};

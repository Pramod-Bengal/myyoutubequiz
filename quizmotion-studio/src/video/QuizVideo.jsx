import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Background } from './Background.jsx';
import { Scene } from './Scene.jsx';
import { useKannadaFonts } from './fonts.js';
import { C, FONT, SCENE_FRAMES, TOTAL_FRAMES, clamp } from './theme.js';
import { MUSIC_OPTIONS, sanitizeProps } from './props.js';

// The whole 60-second video. Used by the website preview (Remotion Player)
// and by the server (Remotion renderer) - so preview and MP4 are identical.
export const QuizVideo = (props) => {
  useKannadaFonts();
  const frame = useCurrentFrame();
  const { title, music, questions } = sanitizeProps(props);
  const track = MUSIC_OPTIONS.find((m) => m.id === music);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: C.navy, color: '#fff' }}>
      {track?.file && (
        <Audio
          key={track.file}
          src={staticFile(track.file)}
          volume={(f) => interpolate(f, [0, 20, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 0.65, 0.65, 0], clamp)}
        />
      )}
      <Background frame={frame} />
      {questions.map((q, i) => (
        <Sequence key={i} from={i * SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
          <Scene
            index={i}
            title={title}
            question={q.question}
            answer={i < 2 ? q.answer : undefined}
            isLast={i === 2}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

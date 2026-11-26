import React from 'react';
import { Composition } from 'remotion';
import { QuizVideo } from './QuizVideo.jsx';
import { DEFAULT_PROPS, FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from './theme.js';

export const RemotionRoot = () => (
  <Composition
    id="QuizVideo"
    component={QuizVideo}
    durationInFrames={TOTAL_FRAMES} // 1800 frames @ 30 fps = exactly 60 s
    fps={FPS}
    width={WIDTH} // 1080
    height={HEIGHT} // 1920  (9:16)
    defaultProps={DEFAULT_PROPS}
  />
);

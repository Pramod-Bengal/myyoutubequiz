import '@fontsource/noto-sans-kannada/500.css';
import '@fontsource/noto-sans-kannada/700.css';
import '@fontsource/noto-sans-kannada/800.css';
import '@fontsource/noto-sans-kannada/900.css';
import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

// Holds the render until the Kannada font is really loaded, so no frame is ever
// drawn with a fallback font (this is what makes Kannada render correctly in the MP4).
export function useKannadaFonts() {
  const [handle] = useState(() => delayRender('Loading Noto Sans Kannada'));
  useEffect(() => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      continueRender(handle);
    };
    const sample = 'ಕನ್ನಡ ಪ್ರಶ್ನೆ ಉತ್ತರ ಕ್ಷ ಜ್ಞ 0123456789 ?!';
    Promise.all(
      ['500', '700', '800', '900'].map((w) => document.fonts.load(`${w} 48px "Noto Sans Kannada"`, sample)),
    ).then(finish, finish);
  }, [handle]);
}

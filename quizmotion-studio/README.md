# QuizMotion Studio

One-page website that turns **3 Kannada questions** into a real **60-second, 1080×1920 (9:16) H.264 MP4** for YouTube Shorts.

- **Website:** React + Vite + Framer Motion (live preview with the Remotion Player)
- **Video engine:** Remotion (the exact same composition drives the preview and the MP4)
- **Backend:** Express – validates the form, queues one render at a time, reports progress, serves the MP4
- **Kannada font:** Noto Sans Kannada (bundled via `@fontsource`, no internet needed at render time)

## Quick start (beginner friendly)

Requirements: **Node.js 20+** and **Google Chrome** installed.

```bash
npm install
npm run dev
```

Open http://localhost:5173 , fill in the form, press **Generate Video**, then **Download Video (MP4)**.
A render takes a few minutes (it draws all 1800 frames). Keep the page open.

### Production style (one server, one port)

```bash
npm start        # builds the website, then serves site + API on http://localhost:5174
```

### Chrome

The server uses the Chrome already on your computer. If it is in an unusual place, set it:

```bash
CHROME_PATH="/path/to/chrome" npm run dev
```

If no Chrome is found, Remotion downloads its own browser the first time you render.

## Video structure (exactly 60 s)

| Time | Content |
|------|---------|
| 0–20 s | Question 1 → countdown 10→1 → animated correct-answer reveal → wipe transition |
| 20–40 s | Question 2 → countdown 10→1 → animated correct-answer reveal → wipe transition |
| 40–60 s | Question 3 → countdown 10→1 → **no answer** → “ನಿಮ್ಮ ಉತ್ತರ ಏನು?” + “ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಕಾಮೆಂಟ್ ಮಾಡಿ!” → closing effect |

Answer 3 is accepted as a form input but is removed in `src/video/props.js` before anything reaches the video, so it can never be drawn.

## Project layout

```
server/index.js        Express API (POST /api/render, GET /api/jobs/:id, GET /api/videos/:id[/download])
server/renderer.js     Remotion bundle + H.264 render (CRF 18, yuv420p, BT.709)
src/video/             The video: theme.js (timing/colours/labels), Scene.jsx, pieces.jsx, Background.jsx
src/video/props.js     Shared validation + "strip answer 3" logic (website AND server)
src/App.jsx            Page, form, state
src/components/        Hero, HowItWorks, QuestionCard, PreviewPanel
src/hooks/useRender.js Start a job and poll progress
scripts/stills.mjs     Dev helper: render single frames, e.g. node scripts/stills.mjs out 100 400
```

## Customising

- Colours, timings and Kannada labels: `src/video/theme.js`
- Edit the video visually with Remotion Studio: `npm run studio`
- Rendered files are kept 2 hours in `server/renders/`, then deleted.

## Notes

- The video has no audio track (Shorts allow silent videos). Add music in the YouTube app if you like.
- Remotion is free for individuals and small teams; larger companies need a Remotion company license (https://remotion.dev/license).
- Text limits: title 80, question 170, answer 100 characters.

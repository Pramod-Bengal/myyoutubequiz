import { useCallback, useEffect, useRef, useState } from 'react';
import { renderInBrowser } from '../utils/browserRender.js';

const IDLE = { status: 'idle', progress: 0, videoUrl: null, downloadUrl: null, filename: null, error: null, snapshot: null };

async function readJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: `Server returned an unexpected response (HTTP ${res.status}).`,
      _nonJson: true,
    };
  }
}

// Talks to the render server: start a job, then poll it until the MP4 is ready.
// If the server is memory-constrained (e.g. Render Free tier 502), falls back to in-browser rendering.
export function useRender() {
  const [state, setState] = useState(IDLE);
  const timer = useRef(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const fallbackToBrowser = useCallback(async (form, snapshot, audioCtx) => {
    if (!alive.current) {
      audioCtx?.close().catch(() => {});
      return;
    }
    setState((s) => ({ ...s, status: 'rendering', progress: 0.02, error: null }));
    try {
      const result = await renderInBrowser(
        form,
        (p) => {
          if (alive.current) setState((s) => ({ ...s, status: 'rendering', progress: p }));
        },
        audioCtx,
      );
      if (!alive.current) return;
      setState({
        status: 'done',
        progress: 1,
        videoUrl: result.videoUrl,
        downloadUrl: result.downloadUrl,
        filename: result.filename,
        error: null,
        snapshot,
      });
    } catch (err) {
      audioCtx?.close().catch(() => {});
      if (alive.current) {
        setState({ ...IDLE, status: 'error', error: err?.message || 'Browser rendering failed.' });
      }
    }
  }, []);

  const poll = useCallback(
    (jobId, form, snapshot, audioCtx) => {
      let retries = 0;
      const tick = async () => {
        try {
          const res = await fetch(`/api/jobs/${jobId}`);
          const job = await readJsonSafe(res);
          if (!alive.current) {
            audioCtx?.close().catch(() => {});
            return;
          }
          if (!res.ok) {
            if (res.status >= 500 && retries < 1) {
              retries += 1;
              timer.current = setTimeout(tick, 1200);
              return;
            }
            if (res.status >= 500 || job._nonJson) {
              await fallbackToBrowser(form, snapshot, audioCtx);
              return;
            }
            throw new Error(job.error || 'Lost track of the render job.');
          }
          retries = 0;

          if (job.status === 'error') {
            audioCtx?.close().catch(() => {});
            setState({ ...IDLE, status: 'error', error: job.error || 'Rendering failed.' });
            return;
          }
          if (job.status === 'done') {
            audioCtx?.close().catch(() => {});
            setState({
              status: 'done',
              progress: 1,
              videoUrl: job.videoUrl,
              downloadUrl: job.downloadUrl,
              filename: 'QuizMotion-Short.mp4',
              error: null,
              snapshot,
            });
            return;
          }
          setState((s) => ({ ...s, status: job.status, progress: job.progress }));
          timer.current = setTimeout(tick, 800);
        } catch {
          if (alive.current) await fallbackToBrowser(form, snapshot, audioCtx);
        }
      };
      tick();
    },
    [fallbackToBrowser],
  );

  const start = useCallback(
    async (form) => {
      clearTimeout(timer.current);
      // Unlock AudioContext synchronously during the user click gesture so browser fallback always has audio.
      let audioCtx = null;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          audioCtx = new AC();
          if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
        }
      } catch {
        /* ignore */
      }

      const snapshot = JSON.stringify(form);
      setState({ ...IDLE, status: 'queued', snapshot });
      try {
        const res = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await readJsonSafe(res);
        if (!res.ok) {
          if (res.status >= 500 || data._nonJson) {
            await fallbackToBrowser(form, snapshot, audioCtx);
            return;
          }
          audioCtx?.close().catch(() => {});
          throw new Error(data.error || 'Could not start rendering.');
        }
        poll(data.jobId, form, snapshot, audioCtx);
      } catch (err) {
        if (err instanceof TypeError) {
          await fallbackToBrowser(form, snapshot, audioCtx);
          return;
        }
        audioCtx?.close().catch(() => {});
        setState({ ...IDLE, status: 'error', error: err.message });
      }
    },
    [poll, fallbackToBrowser],
  );

  const busy = ['queued', 'bundling', 'rendering', 'encoding'].includes(state.status);
  return { state, start, busy };
}

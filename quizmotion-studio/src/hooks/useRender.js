import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE = { status: 'idle', progress: 0, videoUrl: null, downloadUrl: null, error: null, snapshot: null };

// Talks to the render server: start a job, then poll it until the MP4 is ready.
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

  const poll = useCallback((jobId, snapshot) => {
    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const job = await res.json();
        if (!alive.current) return;
        if (!res.ok) throw new Error(job.error || 'Lost track of the render job.');

        if (job.status === 'error') {
          setState({ ...IDLE, status: 'error', error: job.error || 'Rendering failed.' });
          return;
        }
        if (job.status === 'done') {
          setState({
            status: 'done',
            progress: 1,
            videoUrl: job.videoUrl,
            downloadUrl: job.downloadUrl,
            error: null,
            snapshot,
          });
          return;
        }
        setState((s) => ({ ...s, status: job.status, progress: job.progress }));
        timer.current = setTimeout(tick, 800);
      } catch (err) {
        if (alive.current) setState({ ...IDLE, status: 'error', error: err.message });
      }
    };
    tick();
  }, []);

  const start = useCallback(
    async (form) => {
      clearTimeout(timer.current);
      const snapshot = JSON.stringify(form);
      setState({ ...IDLE, status: 'queued', snapshot });
      try {
        const res = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not start rendering.');
        poll(data.jobId, snapshot);
      } catch (err) {
        const offline = err instanceof TypeError;
        setState({
          ...IDLE,
          status: 'error',
          error: offline
            ? 'Cannot reach the render server. Start the project with "npm run dev" and try again.'
            : err.message,
        });
      }
    },
    [poll],
  );

  const busy = ['queued', 'bundling', 'rendering', 'encoding'].includes(state.status);
  return { state, start, busy };
}

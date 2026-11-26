import React from 'react';
import { Easing, interpolate, random, spring } from 'remotion';
import { C, FONT, FPS, TL, clamp, fitSize, LABELS } from './theme.js';

const sp = (frame, config) => spring({ frame: Math.max(0, frame), fps: FPS, config });
const STAGE_Y = 1250; // vertical centre of the countdown / answer area

/* ------------------------------------------------------------------ */
/* Scene transition: sleek dark glass veil with a glowing mint-purple accent edge. */
/* Shown only once (Q1 -> Q2). Last frame of "cover" and first frame of "uncover" match. */
export const Wipe = ({ f, mode }) => {
  const isCover = mode === 'cover';
  const y = isCover
    ? interpolate(f, [566, 594], [100, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) })
    : interpolate(f, [2, 30], [0, -100], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  if (isCover && y >= 100) return null;
  if (!isCover && y <= -100) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 55,
        transform: `translateY(${y}%)`,
        background: 'linear-gradient(170deg, #050714 0%, #0d1033 55%, #170d40 100%)',
        boxShadow: isCover
          ? `0 -24px 80px rgba(139, 61, 255, 0.55), 0 -4px 24px rgba(60, 255, 184, 0.45)`
          : `0 24px 80px rgba(139, 61, 255, 0.55), 0 4px 24px rgba(60, 255, 184, 0.45)`,
      }}
    >
      {/* crisp glowing leading edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          [isCover ? 'top' : 'bottom']: 0,
          height: 6,
          background: `linear-gradient(90deg, ${C.purple}, ${C.mint}, ${C.purple})`,
          boxShadow: `0 0 28px ${C.mint}, 0 0 60px ${C.purple}`,
        }}
      />
      {/* subtle center radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(60,255,184,0.12) 0%, rgba(139,61,255,0.16) 35%, transparent 70%)',
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
export const Header = ({ title, index, f }) => {
  const p = sp(f - TL.enter, { damping: 14, stiffness: 120 });
  return (
    <div
      style={{
        position: 'absolute',
        top: 112,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * -70}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: '6px 46px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(201,184,255,0.35)',
          color: C.lavenderSoft,
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <span
          style={{
            flex: 'none',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: C.mint,
            boxShadow: `0 0 18px ${C.mint}`,
          }}
        />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === index ? 92 : 30,
              height: 14,
              borderRadius: 7,
              background: i <= index ? `linear-gradient(90deg, ${C.mint}, ${C.purple})` : 'rgba(255,255,255,0.2)',
              boxShadow: i === index ? `0 0 20px ${C.mint}88` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* Words pop in one after another (works for any wrapping). */
export const Words = ({ text, f, start, stagger = 3, style }) =>
  String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      const p = sp(f - start - i * stagger, { damping: 14, stiffness: 170, mass: 0.7 });
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            marginRight: '0.26em',
            opacity: Math.min(1, p),
            transform: `translateY(${(1 - p) * 46}px) scale(${0.82 + 0.18 * p})`,
            ...style,
          }}
        >
          {w}
        </span>
      );
    });

export const QuestionBadge = ({ n, f }) => {
  const p = sp(f - TL.enter - 4, { damping: 12, stiffness: 150 });
  return (
    <div
      style={{
        position: 'absolute',
        top: 292,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(1, p),
        transform: `scale(${0.6 + 0.4 * p})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '4px 44px 4px 14px',
          borderRadius: 999,
          background: `linear-gradient(90deg, ${C.purple}, ${C.purpleDeep})`,
          boxShadow: `0 0 50px ${C.purple}99`,
          border: `2px solid ${C.lavender}88`,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.mint}, ${C.mintDeep})`,
            color: C.navy,
            fontWeight: 900,
            fontSize: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {n}
        </div>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 56, lineHeight: 1.8 }}>{LABELS.question}</div>
      </div>
    </div>
  );
};

export const QuestionCard = ({ text, f, dim = 1 }) => {
  const size = fitSize(text, [
    [26, 88],
    [48, 76],
    [78, 66],
    [112, 58],
    [1e9, 50],
  ]);
  const p = sp(f - TL.enter - 2, { damping: 15, stiffness: 120 });
  const floatY = f > TL.enter + 20 ? Math.sin((f - TL.enter) / 28) * 6 : 0;
  const sheenP = interpolate(f, [TL.enter + 18, TL.enter + 48], [-35, 135], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: 410,
        width: 920,
        height: 520,
        borderRadius: 56,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.13), rgba(139,61,255,0.16))',
        border: `2.5px solid ${C.lavender}66`,
        boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 80px ${C.purple}44, inset 0 2px 0 rgba(255,255,255,0.22)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 56px',
        textAlign: 'center',
        opacity: Math.min(1, p) * dim,
        transform: `translateY(${(1 - p) * 120 + floatY}px) scale(${dim < 1 ? 0.97 + 0.03 * ((dim - 0.85) / 0.15) : 1})`,
      }}
    >
      {sheenP > -35 && sheenP < 135 && (
        <div
          style={{
            position: 'absolute',
            top: -40,
            bottom: -40,
            left: `${sheenP}%`,
            width: 140,
            transform: 'skewX(-22deg)',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 34,
          fontSize: 190,
          fontWeight: 900,
          color: C.purple,
          opacity: 0.3,
          lineHeight: 1,
        }}
      >
        ?
      </div>
      <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.62, color: '#fff', zIndex: 2 }}>
        <Words text={text} f={f} start={TL.enter + 8} stagger={3} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Countdown 10 -> 1 inside a shrinking neon ring. */
export const CountdownRing = ({ f }) => {
  const { countStart, perNumber, countEnd, reveal } = TL;
  const size = 480;
  const r = 208;
  const circ = 2 * Math.PI * r;

  const appear = sp(f - (countStart - 28), { damping: 13, stiffness: 110 });
  const t = f - countStart;
  const idx = Math.min(9, Math.max(0, Math.floor(t / perNumber)));
  const n = 10 - idx;
  const local = Math.max(0, t - idx * perNumber);
  const started = f >= countStart;

  const numIn = sp(local, { damping: 10, stiffness: 210, mass: 0.6 });
  const numScale = started ? interpolate(numIn, [0, 1], [1.9, 1]) : 0.8;
  const numOpacity = started ? interpolate(local, [0, 3, 23, 29], [0, 1, 1, 0.35], clamp) : 0;
  const elapsed = Math.min(1, Math.max(0, t / (countEnd - countStart)));
  const exit = interpolate(f, [reveal, reveal + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  const danger = n <= 3;
  const numColor = n > 6 ? C.mint : n > 3 ? C.lavender : '#C79BFF';
  const pulse = started && danger ? 1 + 0.035 * Math.sin((local / perNumber) * Math.PI) : 1;
  const rippleP = started ? interpolate(local, [0, 20], [0, 1], clamp) : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: STAGE_Y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity: Math.min(1, appear) * (1 - exit),
        transform: `scale(${(0.5 + 0.5 * appear) * (1 - exit * 0.4) * pulse})`,
      }}
    >
      {/* expanding ripple on every new number */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `5px solid ${numColor}`,
          opacity: 0.55 * (1 - rippleP),
          transform: `scale(${1 + rippleP * 0.45})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 36,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,61,255,0.35), rgba(14,18,56,0.7) 70%)',
          boxShadow: `inset 0 0 60px ${C.purple}55`,
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', inset: 0, filter: `drop-shadow(0 0 22px ${numColor}88)` }}
      >
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.mint} />
            <stop offset="100%" stopColor={C.purple} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={24} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={24}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * elapsed}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = ((i * 36 - 90) * Math.PI) / 180;
          const lit = i >= idx;
          return (
            <circle
              key={i}
              cx={size / 2 + Math.cos(a) * 238}
              cy={size / 2 + Math.sin(a) * 238}
              r={lit ? 7 : 4}
              fill={lit ? C.mint : 'rgba(255,255,255,0.25)'}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 270,
          fontWeight: 900,
          color: numColor,
          textShadow: `0 0 50px ${numColor}aa`,
          opacity: numOpacity,
          transform: `scale(${numScale})`,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {n}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
export const Confetti = ({ f, start, count = 48, cx = 540, cy = STAGE_Y, power = 1, life = 110, seed = 1, spread = 1.5 }) => {
  const frames = f - start;
  if (frames < 0) return null;
  const t = frames / FPS;
  const colors = [C.mint, C.purple, C.lavender, '#ffffff', C.purpleSoft];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const r = (k) => random(`cf-${seed}-${i}-${k}`);
        const angle = -Math.PI / 2 + (r(1) - 0.5) * Math.PI * spread;
        const speed = (520 + r(2) * 950) * power;
        const x = cx + Math.cos(angle) * speed * t;
        const y = cy + Math.sin(angle) * speed * t + 0.5 * 1700 * t * t;
        const spin = r(3) * 360 + t * (220 + r(4) * 520) * (r(5) > 0.5 ? 1 : -1);
        const w = 14 + r(6) * 18;
        const h = w * (0.4 + r(7) * 0.6);
        const opacity = interpolate(frames, [life - 24, life], [1, 0], clamp);
        if (opacity <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              background: colors[Math.floor(r(9) * colors.length)],
              borderRadius: r(8) > 0.7 ? '50%' : 3,
              transform: `rotate(${spin}deg) rotateX(${t * 380}deg)`,
              opacity,
              zIndex: 40,
            }}
          />
        );
      })}
    </>
  );
};

const Shockwave = ({ lf, delay = 0, color = C.mint, cy = STAGE_Y }) => {
  const p = interpolate(lf - delay, [0, 38], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (lf - delay < 0 || p >= 1) return null;
  const s = 480 * (0.5 + p * 2.6);
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - s / 2,
        top: cy - s / 2,
        width: s,
        height: s,
        borderRadius: '50%',
        border: `${14 * (1 - p) + 2}px solid ${color}`,
        opacity: 1 - p,
        boxShadow: `0 0 50px ${color}`,
      }}
    />
  );
};

/* Answer reveal for questions 1 and 2. */
export const AnswerReveal = ({ f, answer }) => {
  const lf = f - TL.reveal;
  if (lf < 0) return null;
  const size = fitSize(answer, [
    [10, 150],
    [20, 118],
    [36, 92],
    [60, 72],
    [1e9, 58],
  ]);
  const pop = sp(lf - 8, { damping: 11, stiffness: 130, mass: 0.9 });
  const label = sp(lf - 2, { damping: 12, stiffness: 160 });
  const text = sp(lf - 14, { damping: 9, stiffness: 150, mass: 0.8 });
  const glow = 0.6 + 0.4 * Math.sin(lf / 7);
  const flash = interpolate(lf, [0, 4, 22], [0, 0.85, 0], clamp);
  const rayOpacity = interpolate(lf, [0, 20, 190], [0, 0.9, 0.45], clamp);
  const shinePhase = (lf - 34) % 96;
  const shineX = lf >= 34 && shinePhase < 30 ? interpolate(shinePhase, [0, 30], [-40, 140], clamp) : null;

  return (
    <>
      {/* flash */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: STAGE_Y - 700,
          height: 1400,
          background: `radial-gradient(circle at 50% 50%, ${C.mint}, rgba(60,255,184,0) 55%)`,
          opacity: flash,
        }}
      />
      {/* rotating light rays */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 800,
          top: STAGE_Y - 800,
          width: 1600,
          height: 1600,
          borderRadius: '50%',
          background: `repeating-conic-gradient(from 0deg, ${C.mint}30 0deg 7deg, transparent 7deg 24deg)`,
          WebkitMaskImage: 'radial-gradient(circle, black 8%, transparent 62%)',
          maskImage: 'radial-gradient(circle, black 8%, transparent 62%)',
          opacity: rayOpacity,
          transform: `rotate(${lf * 0.35}deg)`,
        }}
      />
      <Shockwave lf={lf} />
      <Shockwave lf={lf} delay={7} color={C.purple} />
      <Shockwave lf={lf} delay={14} color={C.lavender} />
      <Confetti f={f} start={TL.reveal + 2} count={56} />

      <div
        style={{
          position: 'absolute',
          left: 540,
          top: STAGE_Y,
          width: 900,
          transform: `translate(-50%, -50%) scale(${0.35 + 0.65 * pop})`,
          opacity: Math.min(1, pop * 1.4),
          borderRadius: 64,
          overflow: 'hidden',
          background: `linear-gradient(135deg, rgba(60,255,184,0.22), rgba(139,61,255,0.34))`,
          border: `4px solid ${C.mint}`,
          boxShadow: `0 0 ${60 + glow * 60}px ${C.mint}88, inset 0 0 60px ${C.mint}22`,
          padding: '38px 40px 46px',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            padding: '2px 36px 2px 14px',
            borderRadius: 999,
            background: C.mint,
            color: C.navy,
            fontWeight: 800,
            fontSize: 48,
            lineHeight: 1.8,
            opacity: Math.min(1, label),
            transform: `translateY(${(1 - label) * -30}px)`,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill={C.navy} />
            <path
              d="M14 27 L23 36 L39 17"
              fill="none"
              stroke={C.mint}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="48"
              strokeDashoffset={48 * (1 - Math.min(1, interpolate(lf, [6, 22], [0, 1], clamp)))}
            />
          </svg>
          {LABELS.correct}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: size,
            fontWeight: 900,
            lineHeight: 1.6,
            color: C.mint,
            textShadow: `0 0 ${30 + glow * 30}px ${C.mint}99, 0 4px 0 ${C.purpleDeep}`,
            opacity: Math.min(1, text),
            transform: `scale(${0.7 + 0.3 * text})`,
          }}
        >
          {answer}
        </div>
        {shineX !== null && (
          <div
            style={{
              position: 'absolute',
              top: -40,
              bottom: -40,
              left: `${shineX}%`,
              width: 140,
              transform: 'skewX(-22deg)',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
            }}
          />
        )}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Question 3: no answer. Comment call-to-action instead. */
export const CommentCTA = ({ f }) => {
  const lf = f - TL.reveal;
  if (lf < 0) return null;
  const bubble = sp(lf - 34, { damping: 9, stiffness: 140, mass: 0.8 });
  const pill = sp(lf - 52, { damping: 11, stiffness: 140 });
  const bob = Math.sin(lf / 9) * 10;
  const pillPulse = 1 + 0.035 * Math.sin(lf / 6);
  const headlineGlow = 0.6 + 0.4 * Math.sin(lf / 8);
  const words = LABELS.yourAnswer.split(' ');

  return (
    <>
      <Shockwave lf={lf} cy={1120} />
      <Shockwave lf={lf} delay={8} color={C.purple} cy={1120} />
      <div
        style={{
          position: 'absolute',
          left: 70,
          width: 940,
          top: 1010,
          textAlign: 'center',
          fontSize: 100,
          fontWeight: 900,
          lineHeight: 1.6,
          color: '#fff',
          textShadow: `0 0 ${30 + headlineGlow * 30}px ${C.purple}, 0 0 14px ${C.purple}aa`,
          zIndex: 10,
        }}
      >
        {words.map((w, i) => {
          const p = sp(lf - 8 - i * 6, { damping: 10, stiffness: 150, mass: 0.7 });
          const last = i === words.length - 1;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.26em',
                color: last ? C.mint : '#fff',
                opacity: Math.min(1, p),
                transform: `translateY(${(1 - p) * 70}px) scale(${0.6 + 0.4 * p})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* speech bubble with typing dots */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 95,
          top: 1260 + bob,
          width: 190,
          height: 160,
          opacity: Math.min(1, bubble),
          transform: `scale(${0.3 + 0.7 * bubble}) rotate(${Math.sin(lf / 12) * 4}deg)`,
          filter: `drop-shadow(0 0 26px ${C.mint}99)`,
          zIndex: 10,
        }}
      >
        <svg width="190" height="160" viewBox="0 0 190 160">
          <path
            d="M30 8 H160 A24 24 0 0 1 184 32 V92 A24 24 0 0 1 160 116 H88 L48 150 V116 H30 A24 24 0 0 1 6 92 V32 A24 24 0 0 1 30 8 Z"
            fill={C.mint}
          />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={63 + i * 32} cy={62 + Math.sin(lf / 5 - i * 1.1) * -9} r="11" fill={C.navy} />
          ))}
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 70,
          width: 940,
          top: 1450,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(1, pill),
          transform: `scale(${(0.5 + 0.5 * pill) * pillPulse})`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '8px 52px',
            borderRadius: 70,
            textAlign: 'center',
            background: `linear-gradient(90deg, ${C.purple}, ${C.purpleDeep})`,
            border: `4px solid ${C.mint}`,
            boxShadow: `0 0 60px ${C.purple}cc`,
            color: '#fff',
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.75,
          }}
        >
          {LABELS.comment}
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Closing effect for the last scene: neon rings, sparkles, confetti fountains, then an iris close. */
const Sparkle = ({ x, y, size, phase, f, color }) => {
  const s = Math.max(0, Math.sin(f / 7 + phase));
  if (s <= 0.02) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, opacity: s, transform: `scale(${s}) rotate(${f * 2}deg)`, zIndex: 35 }}
    >
      <path d="M0 -48 C4 -12 12 -4 48 0 C12 4 4 12 0 48 C-4 12 -12 4 -48 0 C-12 -4 -4 -12 0 -48 Z" fill={color} />
    </svg>
  );
};

export const Closing = ({ f }) => {
  const START = 500;
  const lf = f - START;
  const R = interpolate(f, [566, 598], [1500, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ringColors = [C.mint, C.purple, C.lavender, C.mint];

  return (
    <>
      {lf >= 0 &&
        ringColors.map((color, k) => {
          const p = interpolate(lf - k * 11, [0, 60], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
          if (lf - k * 11 < 0 || p >= 1) return null;
          const s = 300 + p * 2300;
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 540 - s / 2,
                top: 960 - s / 2,
                width: s,
                height: s,
                borderRadius: '50%',
                border: `${10 * (1 - p) + 2}px solid ${color}`,
                opacity: 0.9 * (1 - p),
                boxShadow: `0 0 40px ${color}`,
                zIndex: 30,
              }}
            />
          );
        })}

      {lf >= -10 &&
        Array.from({ length: 22 }).map((_, i) => {
          const r = (k) => random(`sp-${i}-${k}`);
          return (
            <Sparkle
              key={i}
              f={f}
              x={80 + r(1) * 920}
              y={160 + r(2) * 1400}
              size={40 + r(3) * 70}
              phase={r(4) * 6.28}
              color={[C.mint, C.lavender, '#ffffff', C.purpleSoft][Math.floor(r(5) * 4)]}
            />
          );
        })}

      <Confetti f={f} start={START + 6} count={40} cx={150} cy={1760} power={1.15} seed={11} spread={0.9} life={80} />
      <Confetti f={f} start={START + 6} count={40} cx={930} cy={1760} power={1.15} seed={12} spread={0.9} life={80} />

      {/* iris close */}
      {f >= 566 && f < 598 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - R,
            top: 960 - R,
            width: 2 * R,
            height: 2 * R,
            borderRadius: '50%',
            border: `8px solid ${C.mint}`,
            boxShadow: `0 0 60px ${C.mint}, inset 0 0 60px ${C.purple}`,
            zIndex: 61,
          }}
        />
      )}
      {f >= 566 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background:
              f >= 598
                ? C.navy
                : `radial-gradient(circle at 540px 960px, rgba(7,10,34,0) ${R}px, ${C.navy} ${R + 3}px)`,
          }}
        />
      )}
    </>
  );
};

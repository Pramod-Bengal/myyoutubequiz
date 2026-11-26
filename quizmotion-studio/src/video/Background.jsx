import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { C, HEIGHT, WIDTH } from './theme.js';

const PARTICLE_COLORS = [C.mint, C.lavender, C.purpleSoft, '#ffffff'];

// Continuous background for the whole 60 s: drifting gradient, glow orbs, moving grid, rising particles.
export const Background = ({ frame }) => {
  const angle = 155 + Math.sin(frame / 110) * 22;

  const orbs = [
    { c: 'rgba(139,61,255,0.60)', x: 200 + Math.sin(frame / 70) * 170, y: 380 + Math.cos(frame / 90) * 150, s: 1200 },
    { c: 'rgba(60,255,184,0.30)', x: 920 + Math.cos(frame / 80) * 150, y: 1120 + Math.sin(frame / 60) * 210, s: 1100 },
    { c: 'rgba(201,184,255,0.30)', x: 280 + Math.sin(frame / 100 + 2) * 210, y: 1680 + Math.cos(frame / 70) * 130, s: 1200 },
  ];

  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${angle}deg, #060920 0%, #0E1240 52%, #1B0F4D 100%)`, overflow: 'hidden' }}
    >
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: o.x - o.s / 2,
            top: o.y - o.s / 2,
            width: o.s,
            height: o.s,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.c} 0%, rgba(0,0,0,0) 62%)`,
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,184,255,0.055) 2px, transparent 2px), linear-gradient(90deg, rgba(201,184,255,0.055) 2px, transparent 2px)',
          backgroundSize: '108px 108px',
          backgroundPosition: `0px ${(frame * 0.7) % 108}px`,
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 25%, transparent 78%)',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 25%, transparent 78%)',
        }}
      />

      {Array.from({ length: 34 }).map((_, i) => {
        const r = (k) => random(`bg-${i}-${k}`);
        const speed = 0.7 + r(1) * 1.6;
        const y = (((r(2) * HEIGHT - frame * speed) % HEIGHT) + HEIGHT) % HEIGHT;
        const x = r(3) * WIDTH + Math.sin(frame / 38 + i) * 28;
        const size = 5 + r(4) * 11;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: PARTICLE_COLORS[Math.floor(r(5) * PARTICLE_COLORS.length)],
              opacity: 0.2 + r(6) * 0.45,
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(2,3,14,0.55) 100%)' }}
      />
    </AbsoluteFill>
  );
};

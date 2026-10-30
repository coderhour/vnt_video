import type React from 'react';
import { Easing, interpolate, spring } from 'remotion';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0→1 over `dur` frames from `start`, eased. */
export const ease = (f: number, start: number, dur = 15) =>
  interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });

/** Springy 0→1 (overshoots a little) from `start`. */
export const pop = (f: number, start: number, fps = 30) =>
  spring({ frame: f - start, fps, config: { damping: 13, stiffness: 160 } });

export const fadeUp = (f: number, start: number, dur = 14): React.CSSProperties => {
  const p = ease(f, start, dur);
  return { opacity: p, transform: `translateY(${(1 - p) * 24}px)` };
};

/** 1 until `start`, then fades to `to`. */
export const fadeTo = (f: number, start: number, to = 0, dur = 12) => 1 - ease(f, start, dur) * (1 - to);

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Seeded PRNG (deterministic renders). */
export const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

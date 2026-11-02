import { createContext, useContext } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { pop, range } from './anim';
import { NUNITO } from './fonts';
import { C } from './theme';

export type Pt = [number, number];

/** Grid coords → pixels. */
export const makeGrid = (ox: number, oy: number, unit: number) => (p: Pt): Pt => [ox + p[0] * unit, oy + p[1] * unit];

/** Square inside the k×k box at (bx, by) whose corners sit `a` steps along each side.
 * a = 0 is the box itself; a = 1…k-1 are the tilted squares that fit snugly in it. */
export const boxSquare = (bx: number, by: number, k: number, a = 0): Pt[] => [
  [bx + a, by],
  [bx + k, by + a],
  [bx + k - a, by + k],
  [bx, by + k - a],
];

/** Every top-left corner where a k×k box fits in a grid of `cols` × `rows` dots. */
export const boxSpots = (cols: number, rows: number, k: number): Pt[] =>
  range(rows - k).flatMap((y) => range(cols - k).map((x): Pt => [x, y]));

export const Dots: React.FC<{ cols: number; rows: number; at: (p: Pt) => Pt; start?: number; r?: number }> = ({
  cols,
  rows,
  at,
  start,
  r = 10,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <g>
      {range(rows).flatMap((y) =>
        range(cols).map((x) => {
          const s = start === undefined ? 1 : pop(f, start + (y * cols + x) * 2, fps);
          const [cx, cy] = at([x, y]);
          return <circle key={`${x}-${y}`} cx={cx} cy={cy} r={r * s} fill={C.ink} />;
        }),
      )}
    </g>
  );
};

/** Closed polygon that draws itself on as `progress` goes 0→1. Dashed outlines fade in instead. */
export const Poly: React.FC<{
  pts: Pt[];
  progress?: number;
  color: string;
  width?: number;
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
  dashed?: boolean;
}> = ({ pts, progress = 1, color, width = 7, fill, fillOpacity = 0.16, opacity = 1, dashed = false }) => {
  if (progress <= 0 || opacity <= 0) return null;
  const d = `M ${pts.map((p) => p.join(' ')).join(' L ')} Z`;
  return (
    <g opacity={dashed ? opacity * progress : opacity}>
      {fill && <path d={d} fill={fill} opacity={fillOpacity * Math.min(1, progress * 1.4)} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={dashed ? '0.02 0.018' : 1}
        strokeDashoffset={dashed ? 0 : 1 - progress}
      />
    </g>
  );
};

/** Arrow from a to b with a label, for "one across, one up". */
export const Step: React.FC<{ a: Pt; b: Pt; label: string; color: string; opacity: number; dx?: number; dy?: number }> = ({
  a,
  b,
  label,
  color,
  opacity,
  dx = 0,
  dy = 0,
}) => {
  if (opacity <= 0) return null;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => [b[0] - 18 * Math.cos(ang + s), b[1] - 18 * Math.sin(ang + s)].join(' ');
  return (
    <g opacity={opacity} stroke={color} strokeWidth={5} strokeLinecap="round" fill="none">
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <path d={`M ${head(0.5)} L ${b[0]} ${b[1]} L ${head(-0.5)}`} />
      <text
        x={(a[0] + b[0]) / 2 + dx}
        y={(a[1] + b[1]) / 2 + dy}
        fill={color}
        stroke="none"
        fontFamily={NUNITO}
        fontWeight={800}
        fontSize={40}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </g>
  );
};

export const XMark: React.FC<{ at: Pt; size?: number; opacity: number }> = ({ at, size = 60, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={C.red} strokeWidth={14} strokeLinecap="round">
      <line x1={at[0] - size / 2} y1={at[1] - size / 2} x2={at[0] + size / 2} y2={at[1] + size / 2} />
      <line x1={at[0] + size / 2} y1={at[1] - size / 2} x2={at[0] - size / 2} y2={at[1] + size / 2} />
    </g>
  );

/** Stage size in px; the vertical short frame provides 1080×1920. */
export const StageSize = createContext<[number, number]>([1920, 1080]);

export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [w, h] = useContext(StageSize);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {children}
    </svg>
  );
};

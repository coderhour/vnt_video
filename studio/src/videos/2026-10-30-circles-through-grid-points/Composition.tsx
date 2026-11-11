import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, XMark, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-30-circles-through-grid-points';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates: the 9 points (x, y), x, y in {0, 1, 2}, y grows UP) ----------

export const ALL9: Pt[] = range(3).flatMap((y) => range(3).map((x): Pt => [x, y]));
const MID: Pt = [1, 1];
const EDGE8 = ALL9.filter((p) => !(p[0] === 1 && p[1] === 1));

/** Exact circle through three grid points (same formula as verify.py). */
const circum = (a: Pt, b: Pt, c: Pt) => {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (d === 0) throw new Error('collinear');
  const a2 = a[0] ** 2 + a[1] ** 2;
  const b2 = b[0] ** 2 + b[1] ** 2;
  const c2 = c[0] ** 2 + c[1] ** 2;
  const ux = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
  const uy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
  return { c: [ux, uy] as Pt, r: Math.hypot(a[0] - ux, a[1] - uy) };
};

/** Marked points that lie on the circle through pts[0..2]. */
const onCircle = (pts: Pt[], marks: Pt[] = ALL9) => {
  const { c, r } = circum(pts[0], pts[1], pts[2]);
  return marks.filter((p) => Math.abs(Math.hypot(p[0] - c[0], p[1] - c[1]) - r) < 1e-9);
};

/** Quarter turn about the middle point. */
const rot = (p: Pt): Pt => [2 - p[1], p[0]];
const rots = (pts: Pt[]) => range(4).map((k) => pts.map((p) => range(k).reduce((q) => rot(q), p)));

// The 14 four-point circles, as polygons (corners in order around the shape).
export const SMALL: Pt[][] = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]] as Pt[]);
const BIG: Pt[] = [[0, 0], [2, 0], [2, 2], [0, 2]];
const TILTED: Pt[] = [[1, 0], [2, 1], [1, 2], [0, 1]];
const RECTS: Pt[][] = [
  [[0, 0], [2, 0], [2, 1], [0, 1]],
  [[0, 1], [2, 1], [2, 2], [0, 2]],
  [[0, 0], [1, 0], [1, 2], [0, 2]],
  [[1, 0], [2, 0], [2, 2], [1, 2]],
];
const TRAPS: Pt[][] = rots([[0, 0], [0, 1], [1, 2], [2, 2]]);
export const FOUR: Pt[][] = [...SMALL, BIG, TILTED, ...RECTS, ...TRAPS];
export const SHAPE_COLOR = (i: number) => (i < 6 ? C.primary : i < 10 ? C.blue : C.violet);

// The 20 three-point circles in four families.
const uniq = (sets: Pt[][]) => {
  const key = (s: Pt[]) => s.map((p) => p.join(',')).sort().join(' ');
  return sets.filter((s, i) => sets.findIndex((t) => key(t) === key(s)) === i);
};
const FAMILIES: Pt[][][] = [
  rots([[0, 0], [1, 1], [2, 0]]), // corner, middle, next corner
  rots([[0, 0], [0, 2], [2, 1]]), // two corners of one side + middle of the far side
  rots([[0, 0], [1, 2], [2, 1]]), // corner + its two knight's-move points
  uniq([...rots([[0, 2], [1, 1], [1, 0]]), ...rots([[2, 2], [1, 1], [1, 0]])]), // corner, middle, middle of a side away from it
];
const FAM_COLOR = [C.primary, C.blue, C.violet, C.amber];

// Guard: every drawn circle really passes through exactly the points we claim (throws at render if not).
FOUR.forEach((s) => {
  if (onCircle(s).length !== 4) throw new Error(`not a 4-point circle: ${JSON.stringify(s)}`);
});
FAMILIES.forEach((fam, i) => {
  if (fam.length !== [4, 4, 4, 8][i]) throw new Error(`family ${i} has ${fam.length}`);
  fam.forEach((s) => {
    if (onCircle(s).length !== 3) throw new Error(`not a 3-point circle: ${JSON.stringify(s)}`);
  });
});
// Variant: without the middle point, the 10 four-point circles that avoid it.
const FOUR8 = FOUR.filter((s) => !s.some((p) => p[0] === 1 && p[1] === 1));
if (FOUR8.length !== 10 || FOUR8.some((s) => onCircle(s, EDGE8).length !== 4)) throw new Error('variant');
if (SMALL.some((s) => onCircle(s, EDGE8).length !== 3)) throw new Error('variant small');

// ---------- drawing helpers ----------

export type G = { at: (p: Pt) => Pt; unit: number };
/** Grid whose middle point (1, 1) sits at pixel (cx, cy). */
export const grid = (cx: number, cy: number, unit: number): G => ({ at: (p) => [cx + (p[0] - 1) * unit, cy - (p[1] - 1) * unit], unit });

export const Dots: React.FC<{ g: G; pts?: Pt[]; r?: number; start?: number }> = ({ g, pts = ALL9, r = 11, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <g>
      {pts.map((p, i) => {
        const s = start === undefined ? 1 : pop(f, start + i * 2, fps);
        const [x, y] = g.at(p);
        return <circle key={i} cx={x} cy={y} r={r * s} fill={C.ink} />;
      })}
    </g>
  );
};

/** The circle through the first three points of `pts`, drawing itself on as progress goes 0→1. */
export const Circ: React.FC<{ g: G; pts: Pt[]; color: string; progress?: number; opacity?: number; width?: number; fill?: boolean }> = ({ g, pts, color, progress = 1, opacity = 1, width = 7, fill }) => {
  if (progress <= 0 || opacity <= 0) return null;
  const { c, r } = circum(pts[0], pts[1], pts[2]);
  const [x, y] = g.at(c);
  return (
    <g opacity={opacity}>
      {fill && <circle cx={x} cy={y} r={r * g.unit} fill={color} opacity={0.07 * progress} />}
      <circle cx={x} cy={y} r={r * g.unit} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
    </g>
  );
};

export const Rings: React.FC<{ g: G; pts: Pt[]; color: string; opacity: number; r?: number }> = ({ g, pts, color, opacity, r = 24 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      {pts.map((p, i) => {
        const [x, y] = g.at(p);
        return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={6} />;
      })}
    </g>
  );

/** Straight line through collinear points a…b, stretched a little past both ends. */
const Line: React.FC<{ g: G; a: Pt; b: Pt; color: string; progress: number; opacity?: number; dashed?: boolean }> = ({ g, a, b, color, progress, opacity = 1, dashed }) => {
  if (progress <= 0 || opacity <= 0) return null;
  const [x1, y1] = g.at([a[0] - (b[0] - a[0]) * 0.12, a[1] - (b[1] - a[1]) * 0.12]);
  const [x2, y2] = g.at([b[0] + (b[0] - a[0]) * 0.12, b[1] + (b[1] - a[1]) * 0.12]);
  return (
    <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * progress} y2={y1 + (y2 - y1) * progress} stroke={color} strokeWidth={8} strokeLinecap="round" opacity={opacity} strokeDasharray={dashed ? '6 18' : undefined} />
  );
};

/** One shape at a time, stepping through `items` (no in-between frames), with faint ghosts left behind. */
const Cycle: React.FC<{ n: number; start: number; end: number; draw: (i: number, ghost: boolean) => React.ReactNode; ghosts?: boolean; opacity?: number }> = ({ n, start, end, draw, ghosts = true, opacity = 1 }) => {
  const f = useCurrentFrame();
  if (f < start || opacity <= 0) return null;
  const i = cycleIndex(f, start, end, n);
  const step = (end - start) / n;
  return (
    <g opacity={opacity}>
      {ghosts && range(i).map((j) => <g key={j} opacity={0.22}>{draw(j, true)}</g>)}
      <g key={i} opacity={ease(f, start + i * step, 8)}>{draw(i, false)}</g>
    </g>
  );
};
const cycleIndex = (f: number, start: number, end: number, n: number) => Math.min(n - 1, Math.max(0, Math.floor((f - start) / ((end - start) / n))));
const cycleCount = (f: number, start: number, end: number, n: number) => (f < start ? 0 : cycleIndex(f, start, end, n) + 1);

const Counter: React.FC<{ x: number; y: number; n: number; color: string; opacity: number; size?: number }> = ({ x, y, n, color, opacity, size = 64 }) =>
  opacity <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 900, color, opacity }}>×{n}</div>;

/** Label on the left, maths on the right. */
const Row: React.FC<{ x: number; y: number; label: string; tex: string; color?: string; style: React.CSSProperties; strong?: boolean; labelW?: number; size?: number }> = ({ x, y, label, tex, color = C.ink, style, strong, labelW = 340, size }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', ...style }}>
    {label && <div style={{ width: labelW, fontSize: 42, fontWeight: 800, color }}>{label}</div>}
    <Tex tex={tex} size={size ?? (strong ? 64 : 58)} color={strong ? C.green : C.ink} />
  </div>
);

/** A shape and its circle, as drawn in the hunt and the variant. */
const shapeWithCircle = (g: G, list: Pt[][], color: (i: number) => string) => (i: number, ghost: boolean) => (
  <>
    <Poly pts={list[i].map(g.at)} color={color(i)} width={ghost ? 4 : 7} fill={ghost ? undefined : color(i)} fillOpacity={0.1} />
    {!ghost && <Circ g={g} pts={list[i]} color={color(i)} width={6} />}
  </>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = grid(720, 500, 140);
  const shows: [Pt[], string][] = [
    [SMALL[0], C.primary],
    [FAMILIES[1][0], C.violet],
    [BIG, C.blue],
    [FAMILIES[2][1], C.amber],
  ];
  const more = at(scene, 1, 0.55);
  return (
    <>
      <Text x={960} y={110} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        How many circles?
      </Text>
      <Stage>
        {shows.map(([pts, color], i) => {
          const s = 25 + i * 24;
          return (
            <g key={i}>
              <Circ g={g} pts={pts} color={color} width={6} progress={ease(f, s, 22)} />
              <Rings g={g} pts={onCircle(pts)} color={color} r={20} opacity={ease(f, s, 10) * fadeTo(f, s + 24)} />
            </g>
          );
        })}
        <Dots g={g} start={0} />
      </Stage>
      <Text x={1480} y={300} w={460} size={110} weight={900} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.1)), textDecoration: f > more ? 'line-through' : 'none' }}>
        76?
      </Text>
      <Text x={1480} y={460} w={560} size={66} weight={900} color={C.violet} align="center" style={fadeUp(f, more)}>
        Much smaller!
      </Text>
      <div style={{ position: 'absolute', left: 1330, top: 620, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['20', '34', '48', '62', '76'];

/** Grid with axis numbers 0, 1, 2 (maths style: y up). */
const Axes: React.FC<{ g: G; opacity: number }> = ({ g, opacity }) => (
  <g opacity={opacity} fontFamily={NUNITO} fontWeight={800} fontSize={48} fill={C.muted} textAnchor="middle" dominantBaseline="middle">
    {range(3).map((i) => {
      const [x] = g.at([i, 0]);
      const [, y] = g.at([0, i]);
      const [x0, y0] = g.at([0, 0]);
      return (
        <g key={i}>
          <text x={x} y={y0 + 88}>{i}</text>
          <text x={x0 - 70} y={y}>{i}</text>
        </g>
      );
    })}
    <text x={g.at([2.6, 0])[0] + 20} y={g.at([0, 0])[1] + 88} fontStyle="italic" fill={C.ink}>x</text>
    <text x={g.at([0, 0])[0] - 70} y={g.at([0, 2.6])[1] - 20} fontStyle="italic" fill={C.ink}>y</text>
  </g>
);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = grid(1500, 400, 140);
  const pulse = (start: number) => 1 + 0.25 * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - start) / 20)));
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1000, background: C.card, borderRadius: 32, padding: '40px 48px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        The <Mark on={at(scene, 1, 0.1)}>9 points (<i>x</i>, <i>y</i>)</Mark> with each of <i>x</i> and <i>y</i> equal to <Mark on={at(scene, 1, 0.45)}>0, 1 or 2</Mark> are marked.{' '}
        <Mark on={at(scene, 2, 0.05)}>How many different circles</Mark> pass through <Mark on={at(scene, 2, 0.5)}>at least three</Mark> of the marked points?
      </div>
      <Choices x={130} y={660} items={CHOICES.map((c) => <span key={c} style={{ fontSize: 52 }}>{c}</span>)} start={(i) => at(scene, 3, 0.1 + i * 0.15)} />
      <Stage>
        <Axes g={g} opacity={ease(f, at(scene, 1, 0.45), 12)} />
        <g style={{ transformOrigin: '1500px 400px', transform: `scale(${pulse(at(scene, 1, 0.75))})` }}>
          <Dots g={g} start={6} />
        </g>
        <Circ g={g} pts={FAMILIES[2][0]} color={C.violet} progress={ease(f, at(scene, 2, 0.3), 22)} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = grid(470, 480, 150);
  const tri: Pt[] = FAMILIES[2][0];
  const row: Pt[] = [[0, 1], [1, 1], [2, 1]];
  const sq = SMALL[3];
  const out1 = fadeTo(f, at(scene, 3));
  const out2 = fadeTo(f, at(scene, 4));
  return (
    <>
      <Stage>
        <g opacity={out1}>
          <Rings g={g} pts={tri} color={C.amber} opacity={ease(f, at(scene, 1, 0.4), 10)} />
          <Poly pts={tri.map(g.at)} color={C.amber} width={4} dashed progress={ease(f, at(scene, 1, 0.6), 10)} />
          <Circ g={g} pts={tri} color={C.violet} progress={ease(f, at(scene, 2, 0.2), 24)} />
        </g>
        <g opacity={ease(f, at(scene, 3), 8) * out2}>
          <Rings g={g} pts={row} color={C.red} opacity={1} />
          <Line g={g} a={row[0]} b={row[2]} color={C.red} progress={ease(f, at(scene, 3, 0.15), 14)} />
          <XMark at={[g.at([1, 1.6])[0], g.at([1, 1.6])[1]]} size={70} opacity={ease(f, at(scene, 3, 0.6), 8)} />
        </g>
        <g opacity={ease(f, at(scene, 4, 0.3), 10)}>
          <Poly pts={sq.map(g.at)} color={C.primary} width={5} fill={C.primary} fillOpacity={0.1} />
          <Circ g={g} pts={sq} color={C.primary} progress={ease(f, at(scene, 4, 0.35), 20)} />
          <Rings g={g} pts={sq} color={C.primary} opacity={ease(f, at(scene, 4, 0.5), 10)} r={22} />
        </g>
        <Dots g={g} />
      </Stage>
      <Check x={980} y={250} start={at(scene, 2, 0.5)}>
        <span style={{ fontSize: 48 }}>3 points not on a line → 1 circle</span>
      </Check>
      <div style={{ position: 'absolute', left: 980, top: 360, display: 'flex', alignItems: 'center', gap: 22, fontSize: 48, fontWeight: 800, ...fadeUp(f, at(scene, 3, 0.7)) }}>
        <div style={{ width: 54, height: 54, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</div>
        <span>3 points on a line → <span style={{ color: C.red }}>no circle</span></span>
      </div>
      <Check x={980} y={470} start={at(scene, 4, 0.55)}>
        <span style={{ fontSize: 48 }}>
          Some circles hit <span style={{ color: C.primary }}>4 points</span>
        </span>
      </Check>
      <Check x={980} y={580} start={at(scene, 4, 0.75)}>
        <span style={{ fontSize: 48 }}>
          Each <Mark on={at(scene, 4, 0.85)}>different</Mark> circle counts once
        </span>
      </Check>
    </>
  );
};

const makePause = (pts: Pt[], seconds: number, prompt: string, hollowMid: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const g = grid(470, 400, 140);
  const [mx, my] = g.at(MID);
  return (
    <>
      <Stage>
        {hollowMid && <circle cx={mx} cy={my} r={14} fill="none" stroke={C.muted} strokeWidth={4} strokeDasharray="5 6" />}
        <Dots g={g} pts={pts} />
      </Stage>
      <Text x={470} y={640} w={760} size={48} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} />
    </>
  );
};

// Solution 1 shares one grid position across its scenes.
const G1 = grid(450, 480, 150);
const PANEL = 900;

const SAMPLE: Pt[][] = [FAMILIES[0][0], FAMILIES[2][3], SMALL[1], FAMILIES[3][2], TRAPS[1].slice(0, 3), FAMILIES[1][2]];
const LINES: [Pt, Pt][] = [
  [[0, 0], [2, 0]], [[0, 1], [2, 1]], [[0, 2], [2, 2]],
  [[0, 0], [0, 2]], [[1, 0], [1, 2]], [[2, 0], [2, 2]],
  [[0, 0], [2, 2]], [[0, 2], [2, 0]],
];

const Triples: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pick = [at(scene, 1, 0.05), at(scene, 3)] as const;
  const lines = [at(scene, 4, 0.2), at(scene, 4, 0.9)] as const;
  const nLines = cycleCount(f, lines[0], lines[1], 8);
  const linesOut = fadeTo(f, at(scene, 6), 0.15);
  return (
    <>
      <Pill x={PANEL} y={160} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.3)), fontSize: 40 }}>
        Plan: count groups of 3, then fix the repeats
      </Pill>
      <Stage>
        <Cycle
          n={SAMPLE.length}
          start={pick[0]}
          end={pick[1]}
          ghosts={false}
          opacity={fadeTo(f, pick[1])}
          draw={(i) => (
            <>
              <Poly pts={SAMPLE[i].map(G1.at)} color={C.amber} width={6} fill={C.amber} fillOpacity={0.15} />
              <Rings g={G1} pts={SAMPLE[i]} color={C.amber} opacity={1} />
            </>
          )}
        />
        <g opacity={linesOut}>
          {LINES.map(([a, b], i) => (
            <Line key={i} g={G1} a={a} b={b} color={C.red} progress={i < nLines ? ease(f, lines[0] + (i * (lines[1] - lines[0])) / 8, 8) : 0} opacity={0.85} />
          ))}
        </g>
        <Dots g={G1} />
      </Stage>
      <Counter x={720} y={150} n={nLines} color={C.red} size={56} opacity={ease(f, lines[0], 8) * fadeTo(f, at(scene, 5))} />
      <div style={{ position: 'absolute', left: PANEL, top: 270, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap' }}>
        <div style={fadeUp(f, at(scene, 2, 0.1))}>
          <Tex tex={'\\dfrac{9\\times 8\\times 7}{3\\times 2\\times 1}'} size={64} />
        </div>
        <div style={fadeUp(f, at(scene, 3, 0.2))}>
          <Tex tex="= 84" size={64} />
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 3, 0.4)) }}>groups of 3</div>
      </div>
      <Row x={PANEL} y={480} label="On one line" tex="8" color={C.red} style={fadeUp(f, at(scene, 4, 0.92))} />
      <Row x={PANEL} y={575} label="Not on a line" tex="84 - 8 = 76" style={fadeUp(f, at(scene, 5, 0.3))} />
      <Text x={PANEL} y={680} w={900} size={64} weight={900} style={fadeUp(f, at(scene, 6, 0.3))}>
        76 circles<span style={{ color: C.amber }}>?</span>
      </Text>
    </>
  );
};

const Mini: React.FC<{ cx: number; cy: number; unit: number; shape?: Pt[]; circle?: Pt[]; color?: string; hi?: Pt[]; out?: Pt; dots?: Pt[] }> = ({ cx, cy, unit, shape, circle, color = C.primary, hi = [], out, dots = ALL9 }) => {
  const g = grid(cx, cy, unit);
  return (
    <g>
      {shape && <Poly pts={shape.map(g.at)} color={color} width={3} fill={color} fillOpacity={0.12} />}
      {circle && <Circ g={g} pts={circle} color={color} width={4} />}
      <Dots g={g} pts={dots} r={Math.max(5, unit / 9)} />
      {hi.map((p, i) => {
        const [x, y] = g.at(p);
        return <circle key={i} cx={x} cy={y} r={unit / 3.2} fill="none" stroke={C.amber} strokeWidth={4} />;
      })}
      {out && <XMark at={g.at(out)} size={unit / 2.5} opacity={1} />}
    </g>
  );
};

const Repeat: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sq = SMALL[0];
  const minis = range(4).map((k) => at(scene, 2, 0.1 + k * 0.2));
  return (
    <>
      <Stage>
        <Poly pts={sq.map(G1.at)} color={C.primary} width={6} fill={C.primary} fillOpacity={0.12} progress={ease(f, at(scene, 0, 0.4), 16)} />
        <Circ g={G1} pts={sq} color={C.primary} progress={ease(f, at(scene, 1, 0.1), 24)} />
        <Rings g={G1} pts={sq} color={C.primary} opacity={ease(f, at(scene, 1, 0.5), 10)} />
        <Dots g={G1} />
        {range(4).map((k) => (
          <g key={k} opacity={ease(f, minis[k], 12)}>
            <Mini cx={1010 + k * 255} cy={430} unit={70} circle={sq} hi={sq.filter((_, j) => j !== k)} out={sq[k]} />
          </g>
        ))}
      </Stage>
      <Text x={880} y={180} w={980} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.05))}>
        Leave out one corner each time:
      </Text>
      <Text x={880} y={620} w={1000} size={60} weight={900} style={fadeUp(f, at(scene, 3, 0.2))}>
        1 circle, counted <span style={{ color: C.red }}>4 times!</span>
      </Text>
    </>
  );
};

const G2 = grid(470, 470, 135);

const Hunt: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rect = RECTS[0];
  const demoOut = fadeTo(f, at(scene, 3));
  const smallC = [at(scene, 3, 0.1), at(scene, 3, 0.9)] as const;
  const bigC = [at(scene, 4, 0.1), at(scene, 4, 0.9)] as const;
  const rectC = [at(scene, 5, 0.1), at(scene, 5, 0.9)] as const;
  const trapDemo = at(scene, 6, 0.3);
  const trapC = [at(scene, 8, 0.1), at(scene, 8, 0.9)] as const;
  const end = at(scene, 9, 0.1);
  const flash = at(scene, 10, 0.05);
  const [tcx, tcy] = G2.at([1.5, 0.5]);
  const [cx, cy] = G2.at([1, 0.5]);
  const t = TRAPS[0];
  const tick = (a: Pt, b: Pt) => {
    const [x1, y1] = G2.at(a);
    const [x2, y2] = G2.at(b);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const nx = (-(y2 - y1) / len) * 16;
    const ny = ((x2 - x1) / len) * 16;
    return <line x1={mx - nx} y1={my - ny} x2={mx + nx} y2={my + ny} stroke={C.violet} strokeWidth={6} strokeLinecap="round" />;
  };
  const sqCount = f < bigC[0] ? cycleCount(f, smallC[0], smallC[1], 4) : 4 + cycleCount(f, bigC[0], bigC[1], 2);
  return (
    <>
      <Pill x={PANEL} y={160} color={C.violet} style={fadeUp(f, at(scene, 0, 0.4))}>
        Circles through 4 points
      </Pill>
      <Stage>
        {/* L1–L2: why a rectangle always has a circle */}
        <g opacity={ease(f, at(scene, 1), 10) * demoOut}>
          <Poly pts={rect.map(G2.at)} color={C.blue} width={6} fill={C.blue} fillOpacity={0.1} />
          <Line g={G2} a={rect[0]} b={rect[2]} color={C.ink} progress={ease(f, at(scene, 1, 0.3), 14)} opacity={0.5} dashed />
          <Line g={G2} a={rect[1]} b={rect[3]} color={C.ink} progress={ease(f, at(scene, 1, 0.45), 14)} opacity={0.5} dashed />
          <g opacity={ease(f, at(scene, 2, 0.1), 10)}>
            {rect.map((p, i) => {
              const [x, y] = G2.at(p);
              return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.amber} strokeWidth={7} strokeLinecap="round" />;
            })}
            <circle cx={cx} cy={cy} r={12} fill={C.amber} />
          </g>
          <Circ g={G2} pts={rect} color={C.blue} progress={ease(f, at(scene, 2, 0.55), 22)} />
        </g>
        <Cycle n={4} start={smallC[0]} end={smallC[1]} draw={shapeWithCircle(G2, SMALL, () => C.primary)} opacity={fadeTo(f, bigC[0])} />
        <Cycle n={2} start={bigC[0]} end={bigC[1]} draw={shapeWithCircle(G2, [BIG, TILTED], () => C.primary)} opacity={fadeTo(f, rectC[0])} />
        <Cycle n={4} start={rectC[0]} end={rectC[1]} draw={shapeWithCircle(G2, RECTS, () => C.blue)} opacity={fadeTo(f, at(scene, 6))} />
        {/* L6: the trapezoid; its two short sides (one up, one across) are equal and get tick marks.
            L7: it is symmetric about the line x + y = 2, and the circle's centre (3/2, 1/2) sits on that line. */}
        <g opacity={ease(f, at(scene, 6, 0.1), 10) * fadeTo(f, trapC[0])}>
          <Poly pts={t.map(G2.at)} color={C.violet} width={7} fill={C.violet} fillOpacity={0.12} progress={ease(f, at(scene, 6, 0.1), 16)} />
          <g opacity={ease(f, trapDemo + 20, 10)}>
            {tick(t[0], t[1])}
            {tick(t[2], t[3])}
          </g>
          <Line g={G2} a={[0, 2]} b={[2, 0]} color={C.ink} progress={ease(f, at(scene, 7, 0.05), 14)} opacity={0.55} dashed />
          <g opacity={ease(f, at(scene, 7, 0.45), 10)}>
            {t.map((p, i) => {
              const [x, y] = G2.at(p);
              return <line key={i} x1={tcx} y1={tcy} x2={x} y2={y} stroke={C.amber} strokeWidth={6} strokeLinecap="round" />;
            })}
            <circle cx={tcx} cy={tcy} r={12} fill={C.amber} />
          </g>
          <Circ g={G2} pts={t} color={C.violet} progress={ease(f, at(scene, 7, 0.6), 20)} />
        </g>
        <Cycle n={4} start={trapC[0]} end={trapC[1]} ghosts={false} draw={shapeWithCircle(G2, TRAPS, () => C.violet)} opacity={fadeTo(f, end)} />
        <g opacity={fadeTo(f, flash)}>
          <Dots g={G2} />
        </g>
        {/* L10: every four-point circle again: none of them reaches a fifth dot */}
        {FOUR.map((sq4, i) => {
          const x = 120 + (i % 7) * 113;
          const y = 330 + Math.floor(i / 7) * 230;
          return (
            <g key={i} opacity={ease(f, flash + i * 2, 8)}>
              <Mini cx={x} cy={y} unit={24} shape={sq4} circle={sq4} color={SHAPE_COLOR(i)} />
            </g>
          );
        })}
      </Stage>
      <Counter x={740} y={150} n={sqCount} color={C.primary} size={56} opacity={ease(f, smallC[0], 8) * fadeTo(f, rectC[0])} />
      <Counter x={740} y={150} n={cycleCount(f, rectC[0], rectC[1], 4)} color={C.blue} size={56} opacity={ease(f, rectC[0], 8) * fadeTo(f, at(scene, 6))} />
      <Counter x={740} y={150} n={cycleCount(f, trapC[0], trapC[1], 4)} color={C.violet} size={56} opacity={ease(f, trapC[0], 8) * fadeTo(f, end)} />
      <Row x={PANEL} y={270} label="Squares" tex={f < bigC[0] ? '4' : '4 + 1 + 1 = 6'} color={C.primary} style={fadeUp(f, smallC[1])} />
      <Row x={PANEL} y={365} label="Rectangles" tex="4" color={C.blue} style={fadeUp(f, rectC[1])} />
      <Row x={PANEL} y={460} label="Trapezoids" tex="4" color={C.violet} style={fadeUp(f, trapC[1])} />
      <div style={{ position: 'absolute', left: PANEL, top: 555, width: 760, height: 5, background: C.line, ...fadeUp(f, at(scene, 8, 0.97)) }} />
      <Row x={PANEL} y={580} label="4-point circles" tex="6 + 4 + 4 = 14" strong style={fadeUp(f, at(scene, 8, 0.97))} />
      <Check x={PANEL} y={700} start={at(scene, 10, 0.6)}>
        <span style={{ fontSize: 48 }}>No circle hits 5 points</span>
      </Check>
    </>
  );
};

/** 14 small tiles, one per four-point circle. Unit 30 px, spaced 150 px. */
const TILE = { x0: 150, y0: 270, dx: 140, dy: 225, unit: 30 };
const tilePos = (i: number): Pt => [TILE.x0 + (i % 7) * TILE.dx, TILE.y0 + Math.floor(i / 7) * TILE.dy];

const Tiles: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      {FOUR.map((s, i) => {
        const [x, y] = tilePos(i);
        return (
          <g key={i} opacity={ease(f, start + i * 3, 10)}>
            <Mini cx={x} cy={y} unit={TILE.unit} shape={s} circle={s} color={SHAPE_COLOR(i)} />
          </g>
        );
      })}
    </Stage>
  );
};

const Fix: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fixAt = at(scene, 0, 0.7);
  return (
    <>
      <Tiles start={0} />
      {FOUR.map((_, i) => {
        const [x, y] = tilePos(i);
        const fixed = f >= fixAt + i * 2;
        return (
          <div key={i} style={{ position: 'absolute', left: x - 60, top: y + 82, width: 120, textAlign: 'center', fontSize: 48, fontWeight: 900, color: fixed ? C.green : C.red, ...fadeUp(f, at(scene, 0, 0.4) + i * 2, 10) }}>
            ×{fixed ? 1 : 4}
          </div>
        );
      })}
      <Text x={1110} y={200} w={790} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.2))}>
        14 circles, each counted 4 times
      </Text>
      <Text x={1110} y={300} w={790} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.6))}>
        Remove 3 extra copies of each
      </Text>
      <div style={{ position: 'absolute', left: 1110, top: 410, ...fadeUp(f, at(scene, 1, 0.2)) }}>
        <Tex tex="14 \times 3 = 42" size={62} />
      </div>
      <div style={{ position: 'absolute', left: 1110, top: 510, ...fadeUp(f, at(scene, 2, 0.2)) }}>
        <Tex tex="76 - 42 = 34" size={66} color={C.green} />
      </div>
      <Answer x={1300} y={720} value="34" chime={CHIME} start={at(scene, 2, 0.97)} />
      <Confetti x={1300} y={720} start={at(scene, 2, 0.97)} seed={5} />
      <Pill x={1470} y={690} color={C.green} style={{ ...fadeUp(f, at(scene, 3, 0.6)), fontSize: 48 }}>
        Choice B
      </Pill>
    </>
  );
};

const Chip: React.FC<{ x: number; y: number; color: string; opacity?: number }> = ({ x, y, color, opacity = 1 }) => (
  <rect x={x - 13} y={y - 13} width={26} height={26} rx={6} fill={color} opacity={opacity} />
);

const Piles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ringsOne = at(scene, 2, 0.75);
  const ringsTwo = at(scene, 3, 0.6);
  const card = (x: number, title: string, color: string, start: number) => (
    <div style={{ position: 'absolute', left: x, top: 260, width: 820, height: 520, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 48, fontWeight: 900, color }}>{title}</div>
    </div>
  );
  return (
    <>
      <Text x={960} y={160} w={1400} size={54} weight={900} align="center" style={fadeUp(f, at(scene, 0, 0.2))}>
        76 groups of three, in two piles
      </Text>
      {card(100, 'Pile one', C.violet, at(scene, 1))}
      {card(1000, 'Pile two', C.primary, at(scene, 3))}
      <Stage>
        {/* pile one: 14 clusters of 4 groups */}
        {range(14).map((i) => {
          const x = 190 + (i % 7) * 105;
          const y = 420 + Math.floor(i / 7) * 115;
          const s = ease(f, at(scene, 2, 0.05) + i * 3, 8);
          return (
            <g key={i} opacity={s}>
              {range(4).map((k) => (
                <Chip key={k} x={x - 15 + (k % 2) * 30} y={y - 15 + Math.floor(k / 2) * 30} color={C.violet} />
              ))}
              <circle cx={x} cy={y} r={44} fill="none" stroke={C.violet} strokeWidth={5} opacity={ease(f, ringsOne + i * 2, 8)} />
            </g>
          );
        })}
        {/* pile two: 20 single groups */}
        {range(20).map((i) => {
          const x = 1090 + (i % 10) * 72;
          const y = 420 + Math.floor(i / 10) * 115;
          return (
            <g key={i} opacity={ease(f, at(scene, 3, 0.2) + i * 2, 8)}>
              <Chip x={x} y={y} color={C.primary} />
              <circle cx={x} cy={y} r={28} fill="none" stroke={C.primary} strokeWidth={5} opacity={ease(f, ringsTwo + i * 2, 8)} />
            </g>
          );
        })}
      </Stage>
      <div style={{ position: 'absolute', left: 140, top: 640, display: 'flex', gap: 40, alignItems: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.5)) }}>
        <Tex tex="14 \times 4 = 56" size={58} />
        <span style={{ fontSize: 44, fontWeight: 800 }}>groups</span>
      </div>
      <div style={{ position: 'absolute', left: 140, top: 715, fontSize: 48, fontWeight: 900, color: C.violet, ...fadeUp(f, ringsOne) }}>
        → only 14 circles
      </div>
      <div style={{ position: 'absolute', left: 1040, top: 640, fontSize: 48, fontWeight: 800, ...fadeUp(f, at(scene, 3, 0.3)) }}>
        20 groups
      </div>
      <div style={{ position: 'absolute', left: 1040, top: 715, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, ringsTwo) }}>
        → 20 circles, 3 points each
      </div>
    </>
  );
};

/** Bounding box (maths units) of the grid plus the circles of `sets`. */
const bbox = (sets: Pt[][]) => {
  let [x0, x1, y0, y1] = [0, 2, 0, 2];
  sets.forEach((s) => {
    const { c, r } = circum(s[0], s[1], s[2]);
    x0 = Math.min(x0, c[0] - r);
    x1 = Math.max(x1, c[0] + r);
    y0 = Math.min(y0, c[1] - r);
    y1 = Math.max(y1, c[1] + r);
  });
  return { x0, x1, y0, y1 };
};

// All four family cards share one scale. Families 1–3 keep their grid still (box = all members);
// family 4's circles reach far out on every side, so its grid is re-centred for each member.
const FAM_U = 86;
const FAM_TOP = 165;
const FAM_H = 470;
const famBoxes = FAMILIES.map((fam, i) => (i < 3 ? fam.map(() => bbox(fam)) : fam.map((s) => bbox([s]))));
const FAM_W = famBoxes.map((bs) => Math.max(330, Math.max(...bs.map((b) => b.x1 - b.x0)) * FAM_U + 50));
const FAM_X = (() => {
  const total = FAM_W.reduce((a, w) => a + w, 0) + 3 * 30;
  let x = (1920 - total) / 2;
  return FAM_W.map((w) => {
    const here = x;
    x += w + 30;
    return here;
  });
})();

const Families: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const spans: [number, number][] = [
    [at(scene, 1, 0.15), at(scene, 1, 0.85)],
    [at(scene, 2, 0.15), at(scene, 2, 0.85)],
    [at(scene, 3, 0.15), at(scene, 3, 0.85)],
    [at(scene, 4, 0.2), at(scene, 5, 0.9)],
  ];
  return (
    <>
      {FAMILIES.map((fam, i) => {
        const n = cycleCount(f, spans[i][0], spans[i][1], fam.length);
        return (
          <div key={i} style={{ position: 'absolute', left: FAM_X[i], top: FAM_TOP, width: FAM_W[i], height: FAM_H, background: C.card, borderRadius: 28, boxShadow: '0 6px 24px rgba(30,40,80,0.06)', ...fadeUp(f, at(scene, 0, 0.3) + i * 5) }}>
            <div style={{ position: 'absolute', left: 26, top: 14, fontSize: 40, fontWeight: 900, color: FAM_COLOR[i] }}>Family {i + 1}</div>
            <div style={{ position: 'absolute', right: 26, top: 6, fontSize: 52, fontWeight: 900, color: FAM_COLOR[i], opacity: n > 0 ? 1 : 0 }}>×{n}</div>
          </div>
        );
      })}
      <Stage>
        {FAMILIES.map((fam, i) => {
          const k = cycleIndex(f, spans[i][0], spans[i][1], fam.length);
          const started = f >= spans[i][0];
          const bx = famBoxes[i][k];
          const cx = FAM_X[i] + FAM_W[i] / 2;
          const cy = FAM_TOP + 95 + (FAM_H - 110) / 2;
          const g = grid(cx + (1 - (bx.x0 + bx.x1) / 2) * FAM_U, cy - (1 - (bx.y0 + bx.y1) / 2) * FAM_U, FAM_U);
          const stepStart = spans[i][0] + (k * (spans[i][1] - spans[i][0])) / fam.length;
          return (
            <g key={i} opacity={ease(f, at(scene, 0, 0.3) + i * 5, 14)}>
              {started && (
                <g key={k} opacity={ease(f, stepStart, 8)}>
                  <Poly pts={fam[k].map(g.at)} color={FAM_COLOR[i]} width={3} fill={FAM_COLOR[i]} fillOpacity={0.15} />
                  <Circ g={g} pts={fam[k]} color={FAM_COLOR[i]} width={5} progress={ease(f, stepStart, 12)} />
                  <Rings g={g} pts={fam[k]} color={FAM_COLOR[i]} opacity={1} r={20} />
                </g>
              )}
              <Dots g={g} r={8} />
            </g>
          );
        })}
      </Stage>
      <div style={{ position: 'absolute', left: 140, top: 665, ...fadeUp(f, at(scene, 6, 0.1)) }}>
        <Tex tex="4 + 4 + 4 + 8 = 20" size={60} />
      </div>
      <div style={{ position: 'absolute', left: 790, top: 665, ...fadeUp(f, at(scene, 7, 0.2)) }}>
        <Tex tex="14 + 20 = 34" size={64} color={C.green} />
      </div>
      <Pill x={1290} y={676} color={C.primary} style={{ ...fadeUp(f, at(scene, 7, 0.75)), fontSize: 38, whiteSpace: 'nowrap' }}>
        Great for double-checking!
      </Pill>
    </>
  );
};

const NOTES: { tex?: string; text: string }[] = [
  { text: 'forgot the 14 four-point circles' },
  { text: '' },
  { tex: '76 - 2 \\times 14', text: 'removed only 2 copies' },
  { tex: '76 - 14', text: 'removed only 1 copy' },
  { text: 'never fixed the repeats' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 4, 0.1), Infinity, at(scene, 3, 0.1), at(scene, 2, 0.1), at(scene, 1, 0.1)];
  return (
    <>
      <div style={{ position: 'absolute', left: 135, top: 170, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 1 && f >= at(scene, 4, 0.9);
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 300, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 200, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted }}>{'ABCDE'[i]}</div>
                <div style={{ fontSize: 100, fontWeight: 900, color: wrong ? C.red : right ? C.green : C.ink, lineHeight: 1 }}>{c}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i].text && (
                <div style={{ marginTop: 22, textAlign: 'center', ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i].tex && <Tex tex={NOTES[i].tex!} size={50} color={C.red} />}
                  <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{NOTES[i].text}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 310, top: 660, width: 1300, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '24px 40px', fontSize: 52, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.2)) }}>
        Did I count any circle more than once?
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = grid(1420, 420, 150);
  const [mx, my] = g.at(MID);
  const gone = ease(f, at(scene, 0, 0.35), 14);
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>Your turn!</Pill>
      <Text x={120} y={300} w={900} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.4))}>
        Take away the middle point: <span style={{ color: C.violet }}>8 points</span> left.
      </Text>
      <Text x={120} y={480} w={900} size={50} weight={700} style={fadeUp(f, at(scene, 1, 0.1))}>
        How many different circles pass through at least three of these 8 points?
      </Text>
      <Stage>
        <circle cx={mx} cy={my} r={16} fill="none" stroke={C.muted} strokeWidth={4} strokeDasharray="5 6" opacity={gone} />
        <circle cx={mx} cy={my} r={11 * (1 - gone)} fill={C.ink} />
        <Dots g={g} pts={EDGE8} start={4} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = grid(440, 470, 140);
  const VP = 860;
  const sides: [Pt, Pt][] = LINES.slice(0, 6).filter((l) => !(l[0][0] === 1 || l[0][1] === 1));
  const smallAt = at(scene, 4, 0.5);
  const tenC = [at(scene, 5, 0.1), at(scene, 5, 0.9)] as const;
  const r = (i: number, t = 0.2) => fadeUp(f, at(scene, i, t));
  const [mx, my] = g.at(MID);
  return (
    <>
      <Stage>
        <circle cx={mx} cy={my} r={16} fill="none" stroke={C.muted} strokeWidth={4} strokeDasharray="5 6" />
        <g opacity={fadeTo(f, at(scene, 4))}>
          {sides.map(([a, b], i) => (
            <Line key={i} g={g} a={a} b={b} color={C.red} progress={ease(f, at(scene, 2, 0.05) + i * 8, 10)} opacity={0.85} />
          ))}
          <g opacity={ease(f, at(scene, 2, 0.5), 10)}>
            <Line g={g} a={[0, 0]} b={[2, 2]} color={C.muted} progress={1} dashed />
            <Line g={g} a={[0, 2]} b={[2, 0]} color={C.muted} progress={1} dashed />
          </g>
        </g>
        <g opacity={ease(f, smallAt, 12) * fadeTo(f, tenC[0])}>
          {SMALL.map((s, i) => (
            <g key={i}>
              <Circ g={g} pts={s} color={C.primary} width={5} progress={ease(f, smallAt + i * 6, 14)} />
            </g>
          ))}
        </g>
        <Cycle n={10} start={tenC[0]} end={tenC[1]} ghosts={false} draw={shapeWithCircle(g, FOUR8, (i) => SHAPE_COLOR(FOUR.indexOf(FOUR8[i])))} opacity={fadeTo(f, at(scene, 6, 0.3), 0.25)} />
        <Dots g={g} pts={EDGE8} />
      </Stage>
      <Counter x={690} y={150} n={cycleCount(f, tenC[0], tenC[1], 10)} color={C.violet} size={56} opacity={ease(f, tenC[0], 8)} />
      <div style={{ position: 'absolute', left: VP, top: 150, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', ...r(1, 0.1) }}>
        <Tex tex={'\\dfrac{8\\times 7\\times 6}{3\\times 2\\times 1} = 56'} size={58} />
        <span style={{ fontSize: 42, fontWeight: 800, color: C.muted }}>groups</span>
      </div>
      <Row x={VP} y={330} label="On one line" tex="4" color={C.red} style={r(2, 0.4)} labelW={330} />
      <Row x={VP} y={415} label="Not on a line" tex="56 - 4 = 52" style={r(3, 0.3)} labelW={330} />
      <Text x={VP} y={505} w={760} size={42} weight={800} color={C.primary} style={r(4, 0.6)}>
        Small-square circles: 3 points now, already count once
      </Text>
      <Row x={VP} y={625} label="4-point circles" tex="10" color={C.violet} style={r(5, 0.9)} labelW={330} />
      <div style={{ position: 'absolute', left: VP, top: 715, display: 'flex', gap: 60, whiteSpace: 'nowrap' }}>
        <div style={r(6, 0.05)}>
          <Tex tex="10 \times 3 = 30" size={58} />
        </div>
        <div style={r(6, 0.6)}>
          <Tex tex="52 - 30 = 22" size={62} color={C.green} />
        </div>
      </div>
      <Answer x={1720} y={300} value="22" chime={CHIME} start={at(scene, 6, 0.97)} />
      <Confetti x={1720} y={300} start={at(scene, 6, 0.97)} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const g = grid(1500, 450, 120);
  return (
    <>
      <div style={{ position: 'absolute', left: 140, top: 160, width: 1640, height: 600, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1000, fontSize: 56, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          3 points not on a line make 1 circle. Count the groups of 3.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 330, width: 1000, fontSize: 52, fontWeight: 900, color: C.violet, lineHeight: 1.25, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Then fix the repeats: a 4-point circle was counted 4 times, so remove 3 copies.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 2, 0.3), 14) * cardOut}>
          <Poly pts={SMALL[0].map(g.at)} color={C.violet} width={5} fill={C.violet} fillOpacity={0.1} />
          <Circ g={g} pts={SMALL[0]} color={C.violet} progress={ease(f, at(scene, 2, 0.3), 20)} />
          <Rings g={g} pts={SMALL[0]} color={C.violet} opacity={1} r={20} />
          <Dots g={g} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} text="Keep counting!" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(ALL9, 10, 'How many different circles?', false),
  triples: Triples,
  repeat: Repeat,
  hunt: Hunt,
  fix: Fix,
  piles: Piles,
  families: Families,
  traps: Traps,
  variant: Variant,
  try2: makePause(EDGE8, 12, '8 points. How many circles?', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 5" /> : null;

// YouTube thumbnail (`2026-10-30-circles-through-grid-points-thumb`, render.sh → poster.jpg): the 3×3 dots with a few circles through them, no count.
export const Thumb: React.FC = () => {
  const g = grid(340, 320, 150);
  return (
    <ThumbFrame chip="AMC 10 Practice" lines={['Think it\'s', <span style={{ color: C.red }}>76?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <Circ g={g} pts={BIG} color={C.blue} width={9} />
        <Circ g={g} pts={TILTED} color={C.violet} width={9} />
        <Circ g={g} pts={[[0, 0], [1, 1], [2, 0]]} color={C.primary} width={9} />
        <Dots g={g} r={17} />
      </svg>
    </ThumbFrame>
  );
};

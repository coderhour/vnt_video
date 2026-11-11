import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, XMark, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-30-staircase-rectangles';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- staircase geometry ----------
// Cells are (col, row), both from 1: col counts from the LEFT, row from the BOTTOM (same as verify.py).
// The question's staircase has rows of 5, 4, 3, 2, 1 from the bottom up, lined up on the left,
// so cell (c, r) is inside a staircase of size n when c + r <= n + 1.

type Map = { ox: number; base: number; u: number; n: number };
/** Lattice point (x across, y up) → pixels. */
const px = (m: Map, x: number, y: number): Pt => [m.ox + x * m.u, m.base - y * m.u];
/** Centre of cell (c, r). */
const mid = (m: Map, c: number, r: number): Pt => px(m, c - 0.5, r - 0.5);
/** Corners of the block of cells c1..c2 × r1..r2. */
const block = (m: Map, c1: number, c2: number, r1: number, r2: number): Pt[] => [
  px(m, c1 - 1, r1 - 1),
  px(m, c2, r1 - 1),
  px(m, c2, r2),
  px(m, c1 - 1, r2),
];
const cells = (n: number) => range(n).flatMap((r) => range(n - r).map((c): [number, number] => [c + 1, r + 1]));

const Stair: React.FC<{ m: Map; start?: number; opacity?: number }> = ({ m, start, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {cells(m.n).map(([c, r], i) => {
        const s = start === undefined ? 1 : ease(f, start + i * 2, 10);
        const [x, y] = px(m, c - 1, r);
        return <rect key={i} x={x} y={y} width={m.u} height={m.u} fill={C.card} stroke={C.ink} strokeWidth={4} opacity={s} />;
      })}
    </g>
  );
};

const Cell: React.FC<{ m: Map; c: number; r: number; color: string; opacity?: number; fill?: number; inset?: number }> = ({ m, c, r, color, opacity = 1, fill = 0.45, inset = 6 }) => {
  if (opacity <= 0) return null;
  const [x, y] = px(m, c - 1, r);
  return <rect x={x + inset} y={y + inset} width={m.u - 2 * inset} height={m.u - 2 * inset} rx={8} fill={color} opacity={opacity * fill} />;
};

const Lbl: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number; anchor?: 'middle' | 'start' }> = ({ p, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** Which of n evenly spaced steps between start and end is showing (discrete: no in-between frames). */
const stepAt = (f: number, start: number, end: number, n: number) => Math.min(n - 1, Math.floor(Math.max(0, f - start) / ((end - start) / n)));

const slideN = (f: number, s: number, e: number, n: number) => stepAt(f, s, e, n) + 1;

/** A rectangle that jumps from spot to spot (never through in-between positions). */
const Hop: React.FC<{ m: Map; spots: [number, number, number, number][]; start: number; end: number; color: string; opacity?: number }> = ({ m, spots, start, end, color, opacity = 1 }) => {
  const f = useCurrentFrame();
  if (f < start || opacity <= 0) return null;
  const i = stepAt(f, start, end, spots.length);
  const step = (end - start) / spots.length;
  const [c1, c2, r1, r2] = spots[i];
  return (
    <g opacity={opacity * ease(f, start + i * step, 5)}>
      <Poly pts={block(m, c1, c2, r1, r2)} color={color} width={9} fill={color} fillOpacity={0.3} />
    </g>
  );
};

const Counter: React.FC<{ x: number; y: number; n: number; color: string; opacity: number }> = ({ x, y, n, color, opacity }) =>
  opacity <= 0 ? null : <div style={{ position: 'absolute', left: x, top: y, fontSize: 64, fontWeight: 900, color, opacity }}>×{n}</div>;

/** Label + maths row (like lib's Row, with a settable label width). */
const Row: React.FC<{ x: number; y: number; label: string; tex: string; color?: string; style: React.CSSProperties; strong?: boolean; lw?: number; size?: number }> = ({ x, y, label, tex, color = C.ink, style, strong, lw = 260, size }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 28, whiteSpace: 'nowrap', ...style }}>
    <div style={{ width: lw, fontSize: 40, fontWeight: 800, color }}>{label}</div>
    <Tex tex={tex} size={size ?? (strong ? 62 : 56)} color={strong ? C.green : C.ink} />
  </div>
);

const Rule: React.FC<{ x: number; y: number; w: number; style: React.CSSProperties }> = ({ x, y, w, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 5, background: C.line, ...style }} />
);

// The working staircase for most scenes: 104 px cells, bottom-left corner at (330, 790).
const M: Map = { ox: 330, base: 790, u: 104, n: 5 };
const PANEL = 1010;
const COLORS = [C.primary, C.violet, C.blue, C.amber, C.red];

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m: Map = { ox: 720, base: 790, u: 100, n: 5 };
  const shown: [number, number, number, number, string][] = [
    [1, 1, 1, 1, C.primary],
    [1, 4, 2, 2, C.violet],
    [1, 2, 1, 3, C.blue],
    [2, 3, 1, 3, C.amber],
  ];
  const s0 = at(scene, 1, 0.05);
  const s1 = at(scene, 1, 0.6);
  const i = stepAt(f, s0, s1, shown.length);
  const more = at(scene, 1, 0.62);
  const [c1, c2, r1, r2, col] = shown[i];
  return (
    <>
      <Text x={960} y={110} w={1400} size={84} weight={900} align="center" style={fadeUp(f, 0)}>
        How many rectangles?
      </Text>
      <Stage>
        <Stair m={m} start={6} />
        {f >= s0 && <Poly key={i} pts={block(m, c1, c2, r1, r2)} color={col} width={9} fill={col} fillOpacity={0.3} progress={ease(f, s0 + i * ((s1 - s0) / shown.length), 10)} />}
      </Stage>
      <Text x={1520} y={330} w={420} size={110} weight={900} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.3)), textDecoration: f > more ? 'line-through' : 'none' }}>
        15?
      </Text>
      <Text x={1520} y={480} w={420} size={80} weight={900} color={C.violet} align="center" style={fadeUp(f, more)}>
        MORE!
      </Text>
      <div style={{ position: 'absolute', left: 300, top: 420, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['15', '35', '55', '70', '75'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m: Map = { ox: 1250, base: 760, u: 92, n: 5 };
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1000, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 48, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        The staircase shown is made of <Mark2 on={at(scene, 1, 0.1)}>{'15 unit squares'}</Mark2> in{' '}
        <Mark2 on={at(scene, 1, 0.5)}>rows of 5, 4, 3, 2, 1</Mark2>. <Mark2 on={at(scene, 2, 0.1)}>How many rectangles of any size</Mark2> are in the
        figure? <Mark2 on={at(scene, 3, 0.3)}>(Squares count as rectangles.)</Mark2>
      </div>
      <Choices48 x={120} y={700} items={CHOICES} start={(i) => at(scene, 4, 0.12 + i * 0.17)} />
      <Stage>
        <Stair m={m} start={4} />
        {range(5).map((k) => (
          <Lbl key={k} p={[px(m, 5 - k, 0)[0] + 40, mid(m, 1, k + 1)[1]]} text={`${5 - k}`} color={C.primary} opacity={ease(f, at(scene, 1, 0.5 + k * 0.08), 10)} />
        ))}
      </Stage>
    </>
  );
};

/** lib's Choices at 48px (answer choices are maths). */
const Choices48: React.FC<{ x: number; y: number; start: (i: number) => number; items: string[] }> = ({ x, y, start, items }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {items.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '12px 26px', fontSize: 48, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
          <span style={{ color: C.muted, fontSize: 32, marginRight: 12 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};

/** Highlighter sweep (lib's Mark, re-declared so text keeps its weight here). */
const Mark2: React.FC<{ on: number; children: React.ReactNode }> = ({ on, children }) => {
  const f = useCurrentFrame();
  const p = ease(f, on, 18);
  return (
    <span style={{ backgroundImage: `linear-gradient(${C.primarySoft}, ${C.primarySoft})`, backgroundSize: `${p * 100}% 100%`, backgroundRepeat: 'no-repeat', borderRadius: 8, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '0 4px', fontWeight: p > 0 ? 800 : 600 }}>
      {children}
    </span>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const show = (line: number, until: number) => ease(f, at(scene, line, 0.2), 14) * fadeTo(f, at(scene, until), 0);
  return (
    <>
      <Stage>
        <Stair m={M} />
        <Poly pts={block(M, 2, 2, 3, 3)} color={C.primary} width={9} fill={C.primary} fillOpacity={0.3} progress={ease(f, at(scene, 2, 0.4), 12)} opacity={fadeTo(f, at(scene, 3))} />
        <Poly pts={block(M, 1, 4, 2, 2)} color={C.violet} width={9} fill={C.violet} fillOpacity={0.3} progress={ease(f, at(scene, 3, 0.4), 14)} opacity={fadeTo(f, at(scene, 4))} />
        <Poly pts={block(M, 1, 3, 1, 3)} color={C.blue} width={9} fill={C.blue} fillOpacity={0.3} progress={ease(f, at(scene, 4, 0.3), 14)} opacity={fadeTo(f, at(scene, 5))} />
        <g opacity={show(5, 6)}>
          <Poly pts={block(M, 3, 5, 1, 2)} color={C.red} width={8} dashed />
          <XMark at={mid(M, 5, 2)} opacity={ease(f, at(scene, 5, 0.55), 8)} />
        </g>
      </Stage>
      <Check x={PANEL} y={250} start={at(scene, 1, 0.3)}>A solid block of squares</Check>
      <Check x={PANEL} y={350} start={at(scene, 4, 0.5)}>Any size</Check>
      <Check x={PANEL} y={450} start={at(scene, 5, 0.3)}>Stays inside the stairs</Check>
      <Check x={PANEL} y={550} start={at(scene, 6, 0.6)}>Each one counted once</Check>
    </>
  );
};

const makePause = (n: number, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const u = n === 5 ? 92 : 80;
  const m: Map = { ox: 470 - (n * u) / 2, base: 700, u, n };
  return (
    <>
      <Stage>
        <Stair m={m} />
      </Stage>
      <Text x={470} y={730} w={760} size={44} weight={800} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} />
    </>
  );
};

/** Terms of a sum that appear one by one. */
const Terms: React.FC<{ x: number; y: number; terms: [string, number][]; size?: number; pos?: 'absolute' | 'relative' }> = ({ x, y, terms, size = 60, pos = 'absolute' }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: pos, left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
      {terms.map(([t, s], i) => (
        <span key={i} style={fadeUp(f, s, 10)}>
          <Tex tex={t} size={size} />
        </span>
      ))}
    </div>
  );
};

const TRI = [15, 10, 6, 3, 1]; // a strip of 5, 4, 3, 2, 1 holds this many rectangles

const Flat: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const strip = (len: number): [number, number, number, number][] => range(6 - len).map((c) => [c + 1, c + len, 1, 1]);
  const hops: [number, number, number, number, number][] = [
    // len, line, from, to (fractions)
    [1, 3, 0.15, 0.95],
    [2, 4, 0.15, 0.95],
    [3, 5, 0.02, 0.3],
    [4, 5, 0.36, 0.62],
    [5, 5, 0.7, 0.95],
  ].map(([len, line, a, b]) => [len, L(line, a), L(line, b), line, b] as [number, number, number, number, number]);
  const counterOut = fadeTo(f, L(6));
  const active = hops.findIndex(([, s, e]) => f >= s && f < e + 12);
  const termAt = [L(3, 0.95), L(4, 0.95), L(5, 0.3), L(5, 0.62), L(5, 0.95)];
  return (
    <>
      <Stage>
        <Stair m={M} />
        <Poly pts={block(M, 1, 5, 1, 1)} color={C.amber} width={10} opacity={ease(f, L(2, 0.2), 10) * fadeTo(f, L(3, 0.1))} />
        {hops.map(([len, s, e], i) => (
          <Hop key={i} m={M} spots={strip(len)} start={s} end={e} color={COLORS[i]} opacity={fadeTo(f, e + 12, 0, 6)} />
        ))}
        {/* L6–L7: how many each row holds */}
        {TRI.map((t, k) => (
          <Lbl key={k} p={[px(M, 5 - k, 0)[0] + 24, mid(M, 1, k + 1)[1]]} anchor="start" text={`${t}`} color={C.primary} size={56} opacity={ease(f, k === 0 ? L(6, 0.9) : L(7, 0.35 + (k - 1) * 0.16), 10)} />
        ))}
      </Stage>
      {active >= 0 && <Counter x={880} y={600} n={stepAt(f, hops[active][1], hops[active][2], 6 - hops[active][0]) + 1} color={COLORS[active]} opacity={counterOut} />}
      <Pill x={PANEL} y={170} color={C.primary} style={fadeUp(f, L(1, 0.3))}>One row tall</Pill>
      <Text x={PANEL} y={290} w={800} size={40} weight={800} color={C.muted} style={fadeUp(f, L(2, 0.3))}>
        Bottom row: strips of length 1, 2, 3, 4, 5
      </Text>
      <Terms x={PANEL} y={360} terms={[['5', termAt[0]], ['+\\,4', termAt[1]], ['+\\,3', termAt[2]], ['+\\,2', termAt[3]], ['+\\,1', termAt[4]], ['=\\,15', L(6, 0.85)]]} />
      <Rule x={PANEL} y={500} w={800} style={fadeUp(f, L(8))} />
      <Row x={PANEL} y={530} label="1 row tall" tex="15+10+6+3+1 = 35" strong size={48} lw={170} style={fadeUp(f, L(8, 0.2))} />
    </>
  );
};

const Tall: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  // L4–L7: bands h rows tall, one at a time; band with top row `top` is (6 - top) wide.
  const bands = (h: number, line: number) => {
    const tops = range(6 - h).map((k) => h + k);
    const s = L(line, 0.08);
    const e = L(line, 0.6);
    if (f < s || f >= L(line + 1)) return null;
    const i = stepAt(f, s, e, tops.length);
    const top = tops[i];
    return (
      <g key={h} opacity={ease(f, s + i * ((e - s) / tops.length), 6) * fadeTo(f, L(line + 1) - 8, 0, 8)}>
        <Poly pts={block(M, 1, 6 - top, top - h + 1, top)} color={COLORS[h - 1]} width={9} fill={COLORS[h - 1]} fillOpacity={0.3} />
        <Lbl p={[px(M, 6 - top, 0)[0] + 24, mid(M, 1, top)[1]]} anchor="start" text={`${6 - top} wide`} color={COLORS[h - 1]} size={48} />
      </g>
    );
  };
  const rows: [string, string, number][] = [
    ['2 rows tall', '10+6+3+1 = 20', L(4, 0.85)],
    ['3 rows tall', '6+3+1 = 10', L(5, 0.7)],
    ['4 rows tall', '3+1 = 4', L(6, 0.7)],
    ['5 rows tall', '1', L(7, 0.5)],
  ];
  return (
    <>
      <Stage>
        <Stair m={M} />
        {/* L1: a 2-tall rectangle can't reach column 5 */}
        <g opacity={ease(f, L(1, 0.3), 10) * fadeTo(f, L(2))}>
          <Poly pts={block(M, 4, 5, 1, 2)} color={C.red} width={8} dashed />
          <XMark at={mid(M, 5, 2)} opacity={ease(f, L(1, 0.65), 8)} />
        </g>
        {/* L2–L3: the bottom two rows act like a strip of 4 */}
        <g opacity={ease(f, L(2, 0.2), 12) * fadeTo(f, L(4))}>
          <Poly pts={block(M, 1, 4, 1, 2)} color={C.violet} width={9} fill={C.violet} fillOpacity={0.3} />
          <Poly pts={block(M, 1, 4, 2, 2)} color={C.amber} width={10} opacity={ease(f, L(3, 0.5), 10)} />
          <Lbl p={[px(M, 4, 0)[0] + 24, mid(M, 1, 2)[1] - 70]} anchor="start" text="4 wide" color={C.violet} size={52} />
        </g>
        {[2, 3, 4, 5].map((h) => bands(h, h + 2))}
      </Stage>
      <Text x={PANEL} y={290} w={840} size={48} weight={900} color={C.amber} style={{ ...fadeUp(f, L(3, 0.2)), opacity: ease(f, L(3, 0.2), 14) * fadeTo(f, L(4) - 10, 0, 10) }}>
        A band is only as wide as its TOP row
      </Text>
      {/* L2 on: what each strip width holds (from the flat scene) */}
      <div style={{ position: 'absolute', left: 730, top: 245, fontSize: 48, fontWeight: 900, lineHeight: 1.0, color: C.primary, ...fadeUp(f, L(2, 0.5)), opacity: ease(f, L(2, 0.5), 14) * fadeTo(f, L(8, 0.85)) }}>
        {['Strip:', '4 → 10', '3 → 6', '2 → 3', '1 → 1'].map((t) => (
          <div key={t}>{t}</div>
        ))}
      </div>
      <Row x={PANEL} y={190} label="1 row tall" tex="35" color={C.muted} lw={210} style={{}} />
      <div style={{ position: 'absolute', left: PANEL, top: 280, display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ width: 210, fontSize: 40, fontWeight: 800, color: COLORS[1], ...fadeUp(f, L(4, 0.5)) }}>2 rows tall</div>
        <Terms x={0} y={0} pos="relative" terms={[['10', L(4, 0.55)], ['+\\,6', L(4, 0.66)], ['+\\,3', L(4, 0.76)], ['+\\,1', L(4, 0.85)], ['=\\,20', L(4, 0.93)]]} size={56} />
      </div>
      {rows.slice(1).map(([label, tex, s], j) => [j + 1, label, tex, s] as const).map(([i, label, tex, s]) => (
        <Row key={label} x={PANEL} y={280 + i * 90} label={label} tex={tex} color={COLORS[i + 1]} lw={210} style={fadeUp(f, s)} />
      ))}
      <Rule x={PANEL} y={650} w={820} style={fadeUp(f, L(8))} />
      <Row x={PANEL} y={675} label="All" tex="35+20+10+4+1" strong size={52} lw={80} style={fadeUp(f, L(8, 0.15))} />
      {/* "= 70" waits for "That's seventy" at the end of the line */}
      <Row x={PANEL} y={675} label="" tex="\phantom{35+20+10+4+1} = 70" strong size={52} lw={80} style={fadeUp(f, L(8, 0.85))} />
      <Answer x={850} y={330} value="70" chime={CHIME} start={L(8, 0.97)} />
      <Confetti x={850} y={330} start={L(8, 0.97)} seed={7} />
    </>
  );
};

/** Row numbers (left, counted from the bottom) and column numbers (below). */
const Axes: React.FC<{ m: Map; opacity: number }> = ({ m, opacity }) => (
  <>
    {range(m.n).map((k) => (
      <Lbl key={`r${k}`} p={[m.ox - 34, mid(m, 1, k + 1)[1]]} text={`${k + 1}`} color={C.muted} size={48} opacity={opacity} />
    ))}
    {range(m.n).map((k) => (
      <Lbl key={`c${k}`} p={[mid(m, k + 1, 1)[0], m.base + 26]} text={`${k + 1}`} color={C.muted} size={48} opacity={opacity} />
    ))}
  </>
);

/** The column×row number in each cell. */
const Products: React.FC<{ m: Map; start: number; size?: number; color?: (c: number) => string }> = ({ m, start, size = 52, color }) => {
  const f = useCurrentFrame();
  return (
    <>
      {cells(m.n).map(([c, r], i) => (
        <Lbl key={i} p={mid(m, c, r)} text={`${c * r}`} size={size} color={color ? color(c) : C.ink} opacity={ease(f, start + i * 2, 8)} />
      ))}
    </>
  );
};

/** Column sum label above column c, and a soft highlight of the column. */
const ColSum: React.FC<{ m: Map; c: number; sum: number; start: number; color: string }> = ({ m, c, sum, start, color }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 10);
  if (o <= 0) return null;
  const h = m.n + 1 - c;
  return (
    <g opacity={o}>
      <Poly pts={block(m, c, c, 1, h)} color={color} width={8} fill={color} fillOpacity={0.12} />
      <rect x={mid(m, c, 1)[0] - 50} y={px(m, 0, h)[1] - 84} width={100} height={62} rx={31} fill={color} />
      <text x={mid(m, c, 1)[0]} y={px(m, 0, h)[1] - 53} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={48} textAnchor="middle" dominantBaseline="central">{sum}</text>
    </g>
  );
};

const Corner: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // Indices below are the script's line numbers before L1 and L2 were merged: line i >= 3 is now i - 1.
  const L = (i: number, t = 0) => at(scene, i >= 3 ? i - 1 : i, t);
  // L5: the bottom-left square hops through the 6 cells of the 3 × 2 block.
  const spots: [number, number][] = [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2]]; // our own square last
  const h0 = L(5, 0.02);
  const h1 = L(5, 0.6);
  const hi = stepAt(f, h0, h1, 6);
  const tableIn = L(7, 0.55);
  const pickOut = fadeTo(f, tableIn - 6, 0, 8);
  const legendOut = fadeTo(f, L(7));
  const colSums = [15, 20, 18, 12, 5];
  const colAt = [L(8, 0.85), L(9, 0.85), L(10, 0.3), L(10, 0.6), L(10, 0.88)];
  const colRows: [string, string][] = [
    ['Col 1', '1+2+3+4+5 = 15'],
    ['Col 2', '2+4+6+8 = 20'],
    ['Col 3', '3+6+9 = 18'],
    ['Col 4', '4+8 = 12'],
    ['Col 5', '5'],
  ];
  return (
    <>
      <Stage>
        <Stair m={M} />
        <Axes m={M} opacity={ease(f, L(3, 0.2), 12)} />
        {/* L1–L2: an example rectangle and its two corner squares */}
        <g opacity={ease(f, L(1, 0.1), 12) * fadeTo(f, L(3))}>
          <Poly pts={block(M, 2, 4, 1, 2)} color={C.ink} width={8} />
          <Cell m={M} c={4} r={2} color={C.violet} opacity={ease(f, L(1, 0.35), 10)} />
          <Cell m={M} c={2} r={1} color={C.amber} opacity={ease(f, L(1, 0.75), 10)} />
        </g>
        {/* L3–L6: top-right at (3, 2) */}
        <g opacity={pickOut}>
          <Poly pts={block(M, 1, 3, 1, 2)} color={C.amber} width={6} dashed opacity={ease(f, L(4, 0.45), 10)} />
          <Cell m={M} c={3} r={2} color={C.violet} opacity={ease(f, L(3, 0.4), 10)} />
          {f >= h0 &&
            spots.slice(0, hi + 1).map(([c, r], j) => <Cell key={j} m={M} c={c} r={r} color={C.amber} fill={j === hi ? 0.75 : 0.3} inset={22} />)}
          {f >= h0 && <Poly key={hi} pts={block(M, spots[hi][0], 3, spots[hi][1], 2)} color={C.ink} width={9} progress={ease(f, h0 + hi * ((h1 - h0) / 6), 8)} opacity={fadeTo(f, h1 + 15)} />}
          <Lbl p={mid(M, 3, 2)} text="6" size={60} color={C.violet} opacity={ease(f, L(5, 0.7), 10)} />
          {/* L6: everything below-left of a cell is inside the stairs */}
          <Poly pts={block(M, 1, 3, 1, 2)} color={C.green} width={10} opacity={ease(f, L(6, 0.4), 10)} />
        </g>
        <Products m={M} start={tableIn} color={(c) => (f >= colAt[c - 1] ? COLORS[c - 1] : C.ink)} />
        {colSums.map((s, i) => (
          <ColSum key={i} m={M} c={i + 1} sum={s} start={colAt[i]} color={COLORS[i]} />
        ))}
      </Stage>
      <Counter x={880} y={600} n={hi + 1} color={C.amber} opacity={f >= h0 ? fadeTo(f, L(6)) : 0} />
      <Pill x={PANEL} y={150} color={C.violet} style={{ ...fadeUp(f, L(0, 0.5)), opacity: ease(f, L(0, 0.5), 14) * legendOut }}>The corner trick</Pill>
      <div style={{ opacity: legendOut }}>
        <Legend y={280} color={C.violet} start={L(1, 0.35)}>top-right square</Legend>
        <Legend y={370} color={C.amber} start={L(1, 0.75)}>bottom-left square</Legend>
        <Text x={PANEL} y={470} w={820} size={48} weight={800} style={fadeUp(f, L(3, 0.4))}>
          Top-right: column 3, row 2
        </Text>
        <Terms x={PANEL} y={560} terms={[['3 \\times 2', L(5, 0.15)], ['=\\, 6', L(5, 0.6)]]} />
        <Text x={PANEL} y={660} w={820} size={44} weight={800} color={C.green} style={fadeUp(f, L(6, 0.4))}>
          Below-left of any square: all inside!
        </Text>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 160, opacity: ease(f, L(7, 0.2), 12) * fadeTo(f, L(8)) }}>
        <Tex tex="\text{number} = \text{column} \times \text{row}" size={56} />
      </div>
      {colRows.map(([label, tex], i) => (
        <Row key={label} x={PANEL} y={190 + i * 85} label={label} tex={tex} color={COLORS[i]} lw={120} size={52} style={fadeUp(f, colAt[i])} />
      ))}
      <Rule x={PANEL} y={630} w={840} style={fadeUp(f, L(11))} />
      <Row x={PANEL} y={655} label="All" tex="15+20+18+12+5 = 70" strong size={52} lw={80} style={fadeUp(f, L(11, 0.15))} />
      <Answer x={850} y={320} value="70" chime={CHIME} start={L(11, 0.97)} />
      <Pill x={PANEL} y={760} color={C.amber} style={{ ...fadeUp(f, L(12, 0.5)), fontSize: 40 }}>Tall stairs? Fill in a times table!</Pill>
    </>
  );
};

const Legend: React.FC<{ y: number; color: string; start: number; children: React.ReactNode }> = ({ y, color, start, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, display: 'flex', alignItems: 'center', gap: 24, fontSize: 48, fontWeight: 800, ...fadeUp(f, start) }}>
      <div style={{ width: 60, height: 60, borderRadius: 10, background: color, opacity: 0.6 }} />
      {children}
    </div>
  );
};

const NOTES = ['Only the unit squares', 'Only the flat strips', 'Thin strips only: 35 + 35 − 15', '', 'Too many: some stick out!'];

const TRAP: Map = { ox: 1500, base: 805, u: 50, n: 5 };

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.1), at(scene, 2, 0.1), at(scene, 3, 0.1), Infinity, at(scene, 4, 0.1)];
  return (
    <>
      <div style={{ position: 'absolute', left: 135, top: 200, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 3;
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 300, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 210, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted }}>{'ABCDE'[i]}</div>
                <div style={{ fontSize: 100, fontWeight: 900, color: wrong ? C.red : right ? C.green : C.ink, lineHeight: 1 }}>{c}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 24, fontSize: 36, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 135, top: 660, width: 1150, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '26px 40px', fontSize: 50, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.75)) }}>
        Sort by size → check each one stays inside!
      </div>
      {/* L4: the 75 trap, the bottom two-row band stretched to five wide */}
      <Stage>
        <g opacity={ease(f, at(scene, 4, 0.25), 12)}>
          <Stair m={TRAP} />
          <Poly pts={block(TRAP, 1, 5, 1, 2)} color={C.red} width={6} dashed />
          <Hop m={TRAP} spots={range(5).map((k) => [k + 1, 5, 1, 2] as [number, number, number, number])} start={at(scene, 4, 0.45)} end={at(scene, 4, 0.95)} color={C.red} />
          <XMark at={mid(TRAP, 5, 2)} size={34} opacity={ease(f, at(scene, 4, 0.4), 8)} />
          <Lbl p={[TRAP.ox + 5 * TRAP.u + 60, mid(TRAP, 1, 1)[1] - 20]} text={`+${slideN(f, at(scene, 4, 0.45), at(scene, 4, 0.95), 5)}`} color={C.red} size={60} opacity={ease(f, at(scene, 4, 0.45), 8)} />
        </g>
      </Stage>
    </>
  );
};

const M6: Map = { ox: 1180, base: 790, u: 88, n: 6 };

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={190} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Text x={120} y={310} w={900} size={56} weight={900} style={fadeUp(f, at(scene, 1, 0.2))}>
        Rows of 6, 5, 4, 3, 2, 1
      </Text>
      <Text x={120} y={420} w={900} size={52} weight={700} style={fadeUp(f, at(scene, 2, 0.1))}>
        How many rectangles are in this staircase?
      </Text>
      <Pill x={120} y={600} color={C.amber} style={fadeUp(f, at(scene, 3))}>Use the corner trick!</Pill>
      <Stage>
        <Stair m={M6} start={6} />
      </Stage>
    </>
  );
};

const MV: Map = { ox: 300, base: 790, u: 90, n: 6 };
const VP = 960;

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const colSums = [21, 30, 30, 24, 15, 6];
  const colAt = [0.3, 0.43, 0.55, 0.67, 0.82, 0.93].map((t) => L(1, t)); // "Add each column: 21, 30, 30, 24, 15, 6"
  const colRows: [string, string][] = [
    ['Col 1', '1+2+3+4+5+6 = 21'],
    ['Col 2', '2+4+6+8+10 = 30'],
    ['Col 3', '3+6+9+12 = 30'],
    ['Col 4', '4+8+12 = 24'],
    ['Col 5', '5+10 = 15'],
    ['Col 6', '6'],
  ];
  const vc = [...COLORS, C.green];
  return (
    <>
      <Stage>
        <Stair m={MV} />
        <Axes m={MV} opacity={ease(f, L(0, 0.3), 12)} />
        <Products m={MV} start={L(0, 0.4)} size={48} color={(c) => (f >= colAt[c - 1] ? vc[c - 1] : C.ink)} />
        {colSums.map((s, i) => (
          <ColSum key={i} m={MV} c={i + 1} sum={s} start={colAt[i]} color={vc[i]} />
        ))}
      </Stage>
      {colRows.map(([label, tex], i) => (
        <Row key={label} x={VP} y={150 + i * 80} label={label} tex={tex} color={vc[i]} lw={110} size={48} style={fadeUp(f, colAt[i])} />
      ))}
      <Rule x={VP} y={645} w={880} style={fadeUp(f, L(2))} />
      <Row x={VP - 28} y={665} label="" tex="21+30+30+24+15+6" strong size={48} lw={0} style={fadeUp(f, L(2, 0.1))} />
      <Row x={VP - 28} y={665} label="" tex="\phantom{21+30+30+24+15+6} = 126" strong size={48} lw={0} style={fadeUp(f, L(2, 0.85))} />
      <Answer x={790} y={310} value="126" chime={CHIME} start={L(2, 0.97)} />
      <Confetti x={790} y={310} start={L(2, 0.97)} seed={11} />
      <Pill x={VP} y={770} color={C.primary} style={{ ...fadeUp(f, L(3, 0.1)), fontSize: 36 }}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const m: Map = { ox: 1260, base: 640, u: 76, n: 5 };
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 560, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 150, width: 940, fontSize: 60, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 0, 0.5)) }}>
          A rectangle is pinned down by its <span style={{ color: C.violet }}>top-right</span> and <span style={{ color: C.amber }}>bottom-left</span> squares.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 390, width: 940, fontSize: 48, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 2, 0.2)) }}>
          Count the choices for each corner, then add.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 0, 0.7), 14) * cardOut}>
          <Stair m={m} />
          <Poly pts={block(m, 1, 3, 2, 3)} color={C.ink} width={7} />
          <Cell m={m} c={3} r={3} color={C.violet} />
          <Cell m={m} c={1} r={2} color={C.amber} />
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
  try1: makePause(5, 10, 'How many rectangles?'),
  flat: Flat,
  tall: Tall,
  corner: Corner,
  traps: Traps,
  variant: Variant,
  try2: makePause(6, 8, 'Rows of 6 down to 1. How many rectangles?'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

// YouTube thumbnail (`2026-10-30-staircase-rectangles-thumb`, render.sh → poster.jpg): the 15-square staircase, no count.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Think it's", <span style={{ color: C.red }}>15?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      <Stair m={{ ox: 55, base: 600, u: 112, n: 5 }} />
    </svg>
  </ThumbFrame>
);

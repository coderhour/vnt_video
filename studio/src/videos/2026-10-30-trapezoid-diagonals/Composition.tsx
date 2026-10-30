import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-trapezoid-diagonals';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates, y up; A top-left, B top-right, C bottom-right, D bottom-left) ----------

type Geo = { A: Pt; B: Pt; C: Pt; D: Pt; E: Pt; u: number };

/** Trapezoid with AB = top, DC = bottom, height h; D at the origin, A shifted right by `shift`. Pixel coords. */
const mk = (top: number, bottom: number, h: number, shift: number, ox: number, oy: number, u: number): Geo => {
  const m = (x: number, y: number): Pt => [ox + x * u, oy - y * u];
  const t = top / (top + bottom); // AE : EC = top : bottom
  return {
    A: m(shift, h),
    B: m(shift + top, h),
    C: m(bottom, 0),
    D: m(0, 0),
    E: m(shift + t * (bottom - shift), h * (1 - t)),
    u,
  };
};

const TOPC = C.amber;
const BOTC = C.blue;
const LEFTC = C.primary;
const RIGHTC = C.violet;
const HEX = { amber: '#f59f0a', blue: '#3c83f6', primary: '#0cc281', violet: '#7b61ff' };

const tris = (g: Geo) => ({
  top: [g.A, g.B, g.E] as Pt[],
  bottom: [g.D, g.C, g.E] as Pt[],
  left: [g.A, g.D, g.E] as Pt[],
  right: [g.B, g.C, g.E] as Pt[],
});
const COLORS = { top: TOPC, bottom: BOTC, left: LEFTC, right: RIGHTC };
type Key = keyof typeof COLORS;
const KEYS: Key[] = ['top', 'bottom', 'left', 'right'];

const centroid = (p: Pt[]): Pt => [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const add = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy];

// ---------- drawing helpers ----------

const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 48, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

type Fills = Partial<Record<Key, number>>;
type Vals = Partial<Record<Key, string>>;

/** The trapezoid, its diagonals, the four triangle fills and optional area labels. */
const Trap: React.FC<{
  g: Geo;
  draw?: number; // outline progress
  diag?: number; // diagonals progress
  fills?: Fills;
  vals?: Vals;
  valOp?: Fills;
  letters?: number;
  sides?: [string, string] | null;
  sidesOp?: number;
  eLabel?: number;
  valSize?: number;
}> = ({ g, draw = 1, diag = 1, fills = {}, vals = {}, valOp = {}, letters = 1, sides = null, sidesOp = 1, eLabel = 1, valSize = 56 }) => {
  const T = tris(g);
  const out = [g.A, g.B, g.C, g.D];
  const L = (p: Pt, dx: number, dy: number, s: string) => <Label p={add(p, dx, dy)} text={s} opacity={letters} size={52} />;
  return (
    <>
      {KEYS.map((k) => (
        <Poly key={k} pts={T[k]} color={COLORS[k]} width={0} fill={COLORS[k]} fillOpacity={0.38} opacity={fills[k] ?? 0} />
      ))}
      <Poly pts={out} color={C.ink} width={6} progress={draw} />
      {[[g.A, g.C], [g.B, g.D]].map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ink} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - diag} />
      ))}
      {KEYS.map((k) => (vals[k] ? <Label key={k} p={centroid(T[k])} text={vals[k]!} color={COLORS[k]} size={valSize} opacity={valOp[k] ?? 1} /> : null))}
      {L(g.A, -30, -30, 'A')}
      {L(g.B, 30, -30, 'B')}
      {L(g.C, 30, 32, 'C')}
      {L(g.D, -30, 32, 'D')}
      <Label p={add(g.E, -50, 0)} text="E" size={52} opacity={eLabel * diag} />
      {sides && (
        <>
          <Label p={add(mid(g.A, g.B), 0, -36)} text={sides[0]} color={C.ink} size={52} opacity={sidesOp} />
          <Label p={add(mid(g.D, g.C), 0, 48)} text={sides[1]} color={C.ink} size={52} opacity={sidesOp} />
        </>
      )}
    </>
  );
};

/** Equal-angle arcs: `n` nested arcs at v between the rays towards p and q. */
const Arc: React.FC<{ v: Pt; p: Pt; q: Pt; r: number; n: number; color: string; opacity: number }> = ({ v, p, q, r, n, color, opacity }) => {
  if (opacity <= 0) return null;
  const a1 = Math.atan2(p[1] - v[1], p[0] - v[0]);
  const a2 = Math.atan2(q[1] - v[1], q[0] - v[0]);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const sweep = d > 0 ? 1 : 0;
  return (
    <g opacity={opacity} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
      {range(n).map((k) => {
        const rr = r + k * 13;
        return <path key={k} d={`M ${v[0] + rr * Math.cos(a1)} ${v[1] + rr * Math.sin(a1)} A ${rr} ${rr} 0 0 ${sweep} ${v[0] + rr * Math.cos(a2)} ${v[1] + rr * Math.sin(a2)}`} />;
      })}
    </g>
  );
};

const Seg: React.FC<{ a: Pt; b: Pt; color: string; opacity: number; width?: number; dashed?: boolean }> = ({ a, b, color, opacity, width = 12, dashed }) =>
  opacity <= 0 ? null : <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} strokeDasharray={dashed ? '14 12' : undefined} />;

/** Vertical bracket at x from y1 to y2 (pixels) with a label to the side. */
const VBrace: React.FC<{ x: number; y1: number; y2: number; color: string; opacity: number; label: string; side?: 1 | -1 }> = ({ x, y1, y2, color, opacity, label, side = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${x - 12 * side} ${y1} L ${x} ${y1} L ${x} ${y2} L ${x - 12 * side} ${y2}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label p={[x + 44 * side, (y1 + y2) / 2]} text={label} color={color} size={54} />
    </g>
  );

const PANEL = 950;

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number }> = ({ x, y, w, h, start }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

// Main figure (left side) used by most scenes.
const G = mk(6, 10, 6, 1.5, 120, 730, 72);
const SIDES: [string, string] = ['6', '10'];

// ---------- scenes ----------

/** Right-angle mark at foot F, between the direction `along` and the direction towards `up`. */
const RightMark: React.FC<{ F: Pt; along: Pt; up: Pt; opacity: number }> = ({ F, along, up, opacity }) => {
  if (opacity <= 0) return null;
  const n = (p: Pt): Pt => { const l = Math.hypot(p[0], p[1]); return [p[0] / l, p[1] / l]; };
  const a = n(along);
  const u = n(up);
  const k = 26;
  return <path d={`M ${F[0] + a[0] * k} ${F[1] + a[1] * k} L ${F[0] + (a[0] + u[0]) * k} ${F[1] + (a[1] + u[1]) * k} L ${F[0] + u[0] * k} ${F[1] + u[1] * k}`} stroke={C.ink} strokeWidth={5} fill="none" opacity={opacity} />;
};

/** Foot of the perpendicular from p to the line a–b. */
const foot = (p: Pt, a: Pt, b: Pt): Pt => {
  const d: Pt = [b[0] - a[0], b[1] - a[1]];
  const t = ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2);
  return [a[0] + t * d[0], a[1] + t * d[1]];
};

/** Label next to the middle of a–b, pushed to the side away from `from`. */
const sideLabel = (a: Pt, b: Pt, from: Pt, off: number, t = 0.5): Pt => {
  const m: Pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let n: Pt = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  if (n[0] * (m[0] - from[0]) + n[1] * (m[1] - from[1]) < 0) n = [-n[0], -n[1]];
  return [m[0] + n[0] * off, m[1] + n[1] * off];
};

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mk(6, 10, 6, 1.5, 560, 800, 80);
  const one = ease(f, at(scene, 1, 0.1), 14);
  const rest = ease(f, at(scene, 1, 0.75), 16);
  return (
    <>
      <Text x={960} y={110} w={1500} size={76} weight={900} align="center" style={fadeUp(f, 0)}>
        4 triangles, 1 known area
      </Text>
      <Stage>
        <Trap g={g} draw={ease(f, 6, 20)} diag={ease(f, at(scene, 0, 0.45), 20)} fills={{ top: one, bottom: rest, left: rest, right: rest }} vals={{ top: 'known', bottom: '?', left: '?', right: '?' }} valOp={{ top: one, bottom: rest, left: rest, right: rest }} valSize={64} letters={ease(f, 20, 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 1400, top: 380, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 84, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CHOICES = ['34', '49', '54', '64', '68'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mk(6, 10, 6, 1.5, 1150, 700, 64);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 900, background: C.card, borderRadius: 32, padding: '36px 48px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        In trapezoid ABCD, <Mark on={at(scene, 1, 0.3)}>AB ∥ DC</Mark>. <Mark on={at(scene, 2, 0.1)}>AB = 6</Mark> and <Mark on={at(scene, 2, 0.5)}>DC = 10</Mark>. The diagonals cross at E. <Mark on={at(scene, 3, 0.4)}>Triangle ABE has area 9.</Mark>{' '}
        <Mark on={at(scene, 4, 0.2)}>What is the area of the trapezoid?</Mark>
      </div>
      <div style={{ position: 'absolute', left: 100, top: 720, display: 'flex', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 5, 0.15 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '10px 24px', fontSize: 56, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 48, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <Trap g={g} draw={ease(f, 8, 20)} diag={ease(f, at(scene, 3, 0.05), 20)} fills={{ top: ease(f, at(scene, 3, 0.4), 14) }} vals={{ top: '9' }} valOp={{ top: ease(f, at(scene, 3, 0.7), 10) }} sides={SIDES} sidesOp={ease(f, at(scene, 2, 0.2), 10)} letters={ease(f, 14, 10)} />
        {/* parallel marks on AB and DC */}
        <g opacity={ease(f, at(scene, 1, 0.5), 10)} stroke={C.blue} strokeWidth={6} strokeLinecap="round" fill="none">
          {[[g.A[0] * 0.75 + g.B[0] * 0.25, g.A[1]], [g.D[0] * 0.75 + g.C[0] * 0.25, g.D[1]]].map((p, i) => <path key={i} d={`M ${p[0] - 8} ${p[1] - 16} l 16 16 l -16 16`} />)}
        </g>
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const names: [Key, string][] = [['top', 'top'], ['bottom', 'bottom'], ['left', 'left'], ['right', 'right']];
  const fl = (i: number) => ease(f, at(scene, 1, 0.3 + i * 0.15), 12);
  return (
    <>
      <Stage>
        <Trap g={G} sides={SIDES} fills={{ top: fl(0), bottom: fl(1), left: fl(2), right: fl(3) }} vals={{ top: '9' }} valOp={{ top: ease(f, at(scene, 2, 0.15), 10) }} />
      </Stage>
      <Check x={PANEL} y={190} start={at(scene, 0, 0.3)}>AB = 6 and DC = 10</Check>
      <Check x={PANEL} y={280} start={at(scene, 0, 0.7)}>Top triangle = 9</Check>
      <Text x={PANEL} y={400} w={900} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 1, 0.1))}>
        4 triangles:
      </Text>
      <div style={{ position: 'absolute', left: PANEL, top: 470, display: 'flex', gap: 18, flexWrap: 'wrap', width: 960 }}>
        {names.map(([k, n], i) => (
          <div key={k} style={{ ...fadeUp(f, at(scene, 1, 0.3 + i * 0.15)), background: COLORS[k], color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 42, fontWeight: 900 }}>
            {n}
          </div>
        ))}
      </div>
      <Pill x={PANEL} y={600} color={C.green} style={{ ...fadeUp(f, at(scene, 2, 0.5)), fontSize: 42 }}>
        Goal: add all 4 areas
      </Pill>
    </>
  );
};

const makePause = (seconds: number, prompt: string, top: number, bottom: number, shift: number, unit: number, area: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const g = mk(top, bottom, 6, shift, 170, 740, unit);
  return (
    <>
      <Stage>
        <Trap g={g} fills={{ top: 1 }} vals={{ top: area }} sides={[String(top), String(bottom)]} />
      </Stage>
      <Text x={120} y={140} w={1000} size={46} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} />
    </>
  );
};

const Similar: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G;
  const z1 = ease(f, at(scene, 1, 0.35), 12); // Z: angles at B and D
  const z2 = ease(f, at(scene, 2, 0.3), 12); // the other Z: angles at A and C
  const z3 = ease(f, at(scene, 3, 0.45), 12); // angles at E
  const ratio = ease(f, at(scene, 5, 0.5), 10);
  const zpath = (pts: Pt[], color: string, o: number) => (
    <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')}`} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={o * 0.45} />
  );
  return (
    <>
      <Stage>
        <Trap g={g} fills={{ top: ease(f, at(scene, 0, 0.3), 14), bottom: ease(f, at(scene, 0, 0.7), 14) }} sides={SIDES} sidesOp={ratio} eLabel={1 - z3} />
        {zpath([g.A, g.B, g.D, g.C], C.red, z1 * fadeTo(f, at(scene, 2, 0.05), 0))}
        {zpath([g.B, g.A, g.C, g.D], C.green, z2 * fadeTo(f, at(scene, 3, 0.05), 0))}
        <Arc v={g.B} p={g.A} q={g.D} r={90} n={1} color={C.red} opacity={z1} />
        <Arc v={g.D} p={g.C} q={g.B} r={90} n={1} color={C.red} opacity={z1} />
        <Arc v={g.A} p={g.B} q={g.C} r={90} n={2} color={C.green} opacity={z2} />
        <Arc v={g.C} p={g.D} q={g.A} r={90} n={2} color={C.green} opacity={z2} />
        <Arc v={g.E} p={g.A} q={g.B} r={52} n={3} color={C.ink} opacity={z3} />
        <Arc v={g.E} p={g.C} q={g.D} r={52} n={3} color={C.ink} opacity={z3} />
      </Stage>
      <Pill x={PANEL} y={160} color={C.red} style={{ ...fadeUp(f, at(scene, 1, 0.3)), fontSize: 38 }}>Z shape: equal angles</Pill>
      <Pill x={PANEL} y={240} color={C.green} style={{ ...fadeUp(f, at(scene, 2, 0.3)), fontSize: 38 }}>Another Z, other diagonal</Pill>
      <Pill x={PANEL} y={320} color={C.ink} style={{ ...fadeUp(f, at(scene, 3, 0.45)), fontSize: 38 }}>Opposite angles at E</Pill>
      <Eq y={400} start={at(scene, 4, 0.1)} color={C.violet} size={50} tex={'\\triangle ABE \\sim \\triangle CDE'} />
      <Text x={PANEL} y={490} w={900} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 4, 0.4))}>
        Same angles = same shape
      </Text>
      <Eq y={575} start={at(scene, 5, 0.5)} tex={'6 : 10'} />
      <Eq y={575} x={1200} start={at(scene, 6, 0.1)} tex={'= 3 : 5'} />
      <Eq y={680} start={at(scene, 6, 0.55)} color={C.green} size={50} tex={'\\text{scale} = \\dfrac{5}{3}'} />
    </>
  );
};

const Bottom: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G;
  const ex = g.E[0];
  const bases = ease(f, at(scene, 1, 0.1), 12);
  const heights = ease(f, at(scene, 1, 0.55), 12);
  const back = ease(f, at(scene, 3, 0.3), 10);
  const hOp = heights * (1 - back);
  return (
    <>
      <Stage>
        <Trap g={g} fills={{ top: 1, bottom: 1 }} vals={{ top: '9', bottom: '25' }} valOp={{ top: Math.max(1 - heights, back), bottom: ease(f, at(scene, 3, 0.5), 10) }} sides={SIDES} />
        <Seg a={g.A} b={g.B} color={TOPC} opacity={bases} />
        <Seg a={g.D} b={g.C} color={BOTC} opacity={bases} />
        <Seg a={g.E} b={[ex, g.A[1]]} color={C.ink} dashed width={6} opacity={hOp} />
        <Seg a={g.E} b={[ex, g.D[1]]} color={C.ink} dashed width={6} opacity={hOp} />
        <Label p={[ex + 36, (g.E[1] + g.A[1]) / 2 + 6]} text="h" color={TOPC} size={52} opacity={hOp} />
        <Label p={[ex + 135, g.E[1] + 0.72 * (g.D[1] - g.E[1])]} text="5/3 × h" color={BOTC} size={48} opacity={ease(f, at(scene, 1, 0.8), 10) * (1 - back)} />
      </Stage>
      <Pill x={PANEL} y={165} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.3)), fontSize: 38 }}>What happens to the area?</Pill>
      <Eq y={245} start={at(scene, 1, 0.1)} size={50} tex={'\\text{base} \\times \\dfrac{5}{3}'} />
      <Eq y={245} x={1360} start={at(scene, 1, 0.55)} size={50} tex={'\\text{height} \\times \\dfrac{5}{3}'} />
      <Eq y={395} start={at(scene, 2, 0.2)} color={C.violet} size={50} tex={'\\text{area} \\times \\dfrac{5}{3} \\times \\dfrac{5}{3}'} />
      <Eq y={535} start={at(scene, 2, 0.7)} color={C.violet} size={50} tex={'= \\text{area} \\times \\dfrac{25}{9}'} />
      <Eq y={690} start={at(scene, 3, 0.1)} size={58} color={C.blue} tex={'9 \\times \\dfrac{25}{9} = 25'} />
    </>
  );
};

const Sides: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G;
  const F = foot(g.B, g.A, g.C);
  const F2 = foot(g.A, g.B, g.D);
  const dirAC: Pt = [g.C[0] - g.A[0], g.C[1] - g.A[1]];
  const dirBD: Pt = [g.D[0] - g.B[0], g.D[1] - g.B[1]];
  const first = fadeTo(f, at(scene, 5, 0.05), 0.15);
  const second = ease(f, at(scene, 5, 0.1), 12);
  const same = ease(f, at(scene, 2, 0.1), 12);
  const match = ease(f, at(scene, 3, 0.2), 10);
  const parts = ease(f, at(scene, 3, 0.55), 10) * fadeTo(f, at(scene, 5, 0.05), 0);
  const ecColor = f >= at(scene, 3, 0.2) ? BOTC : RIGHTC;
  return (
    <>
      <Stage>
        <Trap
          g={g}
          fills={{ top: 1, bottom: 1, right: ease(f, at(scene, 0, 0.3), 14), left: second }}
          vals={{ top: '9', bottom: '25', right: '15', left: '15' }}
          valOp={{ top: 1, bottom: fadeTo(f, at(scene, 3, 0.2), 0), right: ease(f, at(scene, 4, 0.9), 10), left: ease(f, at(scene, 5, 0.9), 10) }}
          sides={SIDES}
          sidesOp={0}
        />
        {/* right triangle: shared corner B, bases AE and EC on diagonal AC, one height from B */}
        <g opacity={first}>
          <circle cx={g.B[0]} cy={g.B[1]} r={24} fill="none" stroke={C.ink} strokeWidth={6} opacity={ease(f, at(scene, 1, 0.3), 10)} />
          <Seg a={g.A} b={g.E} color={TOPC} opacity={ease(f, at(scene, 1, 0.55), 10)} />
          <Seg a={g.E} b={g.C} color={ecColor} opacity={ease(f, at(scene, 1, 0.75), 10)} />
          <Seg a={g.B} b={F} color={C.ink} dashed width={6} opacity={same} />
          <RightMark F={F} along={dirAC} up={[g.B[0] - F[0], g.B[1] - F[1]]} opacity={same} />
        </g>
        {/* the matching pairs of the two copies: AE with CE, BE with DE */}
        <Seg a={g.B} b={g.E} color={TOPC} opacity={match * (1 - second)} />
        <Seg a={g.E} b={g.D} color={BOTC} opacity={match * (1 - second)} />
        <g opacity={parts}>
          <Label p={sideLabel(g.A, g.E, g.B, 58, 0.35)} text="3 parts" color={TOPC} size={48} />
          <Label p={sideLabel(g.E, g.C, g.B, 58, 0.6)} text="5 parts" color={BOTC} size={48} />
        </g>
        {/* left triangle: shared corner A, bases BE and ED on diagonal BD */}
        <g opacity={second}>
          <circle cx={g.A[0]} cy={g.A[1]} r={24} fill="none" stroke={C.ink} strokeWidth={6} />
          <Seg a={g.B} b={g.E} color={TOPC} opacity={1} />
          <Seg a={g.E} b={g.D} color={LEFTC} opacity={1} />
          <Seg a={g.A} b={F2} color={C.ink} dashed width={6} opacity={1} />
          <RightMark F={F2} along={dirBD} up={[g.A[0] - F2[0], g.A[1] - F2[1]]} opacity={1} />
          <Label p={sideLabel(g.B, g.E, g.A, 58, 0.35)} text="3 parts" color={TOPC} size={48} />
          <Label p={sideLabel(g.E, g.D, g.A, 58, 0.6)} text="5 parts" color={LEFTC} size={48} />
        </g>
      </Stage>
      <Pill x={PANEL} y={165} color={C.ink} style={{ ...fadeUp(f, at(scene, 2, 0.1)), fontSize: 38 }}>Same height</Pill>
      <Eq y={255} start={at(scene, 2, 0.55)} size={50} tex={'\\text{area ratio} = \\text{base ratio}'} />
      <Eq y={355} start={at(scene, 3, 0.55)} color={C.ink} tex={'AE : EC = 3 : 5'} />
      <Eq y={470} start={at(scene, 4, 0.55)} size={62} color={RIGHTC} tex={'\\text{right: } 9 \\times \\dfrac{5}{3} = 15'} />
      <Eq y={640} start={at(scene, 5, 0.5)} size={62} color={LEFTC} tex={'\\text{left: } 9 \\times \\dfrac{5}{3} = 15'} />
    </>
  );
};

const Total1: SceneComponent = ({ scene }) => {
  const done = at(scene, 1, 0.97);
  return (
    <>
      <Stage>
        <Trap g={G} fills={{ top: 1, bottom: 1, left: 1, right: 1 }} vals={{ top: '9', bottom: '25', left: '15', right: '15' }} sides={SIDES} sidesOp={0} />
      </Stage>
      <Eq y={250} start={at(scene, 0, 0.35)} size={70} tex={`{\\color{${HEX.amber}}9} + {\\color{${HEX.blue}}25} + {\\color{${HEX.primary}}15} + {\\color{${HEX.violet}}15}`} />
      <Eq y={400} start={at(scene, 1, 0.15)} size={96} color={C.green} tex={'= 64'} />
      <Boxed x={PANEL - 30} y={395} w={400} h={140} start={at(scene, 1, 0.4)} />
      <Answer x={1700} y={620} value="D" chime={CHIME} start={done} />
      <Confetti x={1700} y={620} start={done} seed={7} />
    </>
  );
};

const Height: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G;
  const ex = g.E[0];
  const aOp = fadeTo(f, at(scene, 4, 0.0), 0);
  return (
    <>
      <Stage>
        <Trap g={g} fills={{ top: 1, bottom: ease(f, at(scene, 2, 0.1), 12) }} vals={{ top: '9' }} valOp={{ top: fadeTo(f, at(scene, 1, 0.55), 0) }} sides={SIDES} />
        <Seg a={g.E} b={[ex, g.A[1]]} color={C.ink} dashed width={6} opacity={ease(f, at(scene, 1, 0.6), 10)} />
        <Label p={[ex + 34, (g.E[1] + g.A[1]) / 2]} text="3" color={TOPC} size={54} opacity={ease(f, at(scene, 1, 0.75), 10)} />
        <Seg a={g.E} b={[ex, g.D[1]]} color={C.ink} dashed width={6} opacity={ease(f, at(scene, 2, 0.6), 10)} />
        <Label p={[ex + 34, (g.E[1] + g.D[1]) / 2]} text="5" color={BOTC} size={54} opacity={ease(f, at(scene, 2, 0.8), 10)} />
        <VBrace x={g.D[0] - 22} y1={g.A[1]} y2={g.D[1]} color={C.green} opacity={ease(f, at(scene, 3, 0.4), 12)} label="8" side={-1} />
      </Stage>
      <div style={{ opacity: aOp }}>
        <Eq y={150} start={at(scene, 0, 0.4)} tex={'\\text{top: base } 6,\\ \\text{area } 9'} size={50} />
        <Eq y={225} start={at(scene, 1, 0.1)} tex={'\\dfrac{1}{2} \\times 6 \\times h = 9'} />
        <Eq y={375} start={at(scene, 1, 0.65)} color={TOPC} tex={'h = 3'} />
        <Eq y={475} start={at(scene, 2, 0.4)} color={BOTC} tex={'3 \\times \\dfrac{5}{3} = 5'} />
        <Eq y={640} start={at(scene, 3, 0.2)} size={70} color={C.green} tex={'3 + 5 = 8'} />
      </div>
      <Eq y={170} start={at(scene, 4, 0.3)} size={50} tex={'\\text{area} = \\dfrac{\\text{top} + \\text{bottom}}{2} \\times \\text{height}'} />
      <Eq y={330} start={at(scene, 5, 0.05)} tex={'6 + 10 = 16'} />
      <Eq y={430} start={at(scene, 5, 0.38)} tex={'\\dfrac{16}{2} = 8'} />
      <Eq y={570} start={at(scene, 5, 0.7)} size={66} color={C.green} tex={'8 \\times 8 = 64'} />
      <Answer x={1700} y={720} value="✓" chime={CHIME} start={at(scene, 5, 0.97)} />
      <Pill x={PANEL} y={760} color={C.amber} style={{ ...fadeUp(f, at(scene, 6, 0.45)), fontSize: 36 }}>Fast, and a great double-check</Pill>
    </>
  );
};

// Trap cards: which triangles each answer adds up.
const ALL: Fills = { top: 1, bottom: 1, left: 1, right: 1 };
const TRAP_FILL: Fills[] = [{ top: 1, bottom: 1 }, { top: 1, bottom: 1, right: 1 }, ALL, ALL, ALL];
const NOTES = ['9+25', '9+25+15', '9+15+15+15', '', '9+25+17+17'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.1), at(scene, 2, 0.1), at(scene, 3, 0.1), Infinity, at(scene, 4, 0.1)];
  const noteAt = [wrongAt[0], wrongAt[1], wrongAt[2], Infinity, at(scene, 5, 0.05)];
  const rightAt = at(scene, 5, 0.9);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 140, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 3 && f >= rightAt;
          const border = wrong ? C.red : right ? C.green : 'transparent';
          const mg = mk(6, 10, 6, 1.5, 35, 225, 24);
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 380, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: C.muted, marginTop: 6, lineHeight: 1.1 }}>{'ABCDE'[i]}</div>
                <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.1, color: wrong ? C.red : right ? C.green : C.ink }}>{c}</div>
                <svg width={280} height={230} viewBox="0 0 300 250" style={{ overflow: 'visible' }}>
                  <Trap g={mg} fills={f >= wrongAt[i] || right ? TRAP_FILL[i] : {}} letters={0} eLabel={0} />
                </svg>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 14, fontSize: 48, fontWeight: 800, textAlign: 'center', lineHeight: 1.15, color: C.red, whiteSpace: 'nowrap', ...fadeUp(f, noteAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 200, top: 610, width: 1500, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 80, ...fadeUp(f, at(scene, 5, 0.1)) }}>
        <Tex tex={'(9 + 25) \\div 2 = 17'} size={52} color={C.red} />
        <span style={{ opacity: ease(f, at(scene, 5, 0.45), 10) }}>
          <Tex tex={'9 \\times \\dfrac{5}{3} = 15'} size={52} color={C.green} />
        </span>
      </div>
      <div style={{ position: 'absolute', left: 360, top: 745, width: 1200, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '14px 30px', fontSize: 40, fontWeight: 900, ...fadeUp(f, at(scene, 6, 0.3)) }}>
        Count every piece. Square the scale!
      </div>
    </>
  );
};

const GV = mk(4, 8, 6, 1, 1130, 740, 70);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={190} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Text x={120} y={310} w={900} size={56} weight={900} style={fadeUp(f, at(scene, 1, 0.1))}>
        Top = 4, bottom = 8
      </Text>
      <Text x={120} y={410} w={900} size={52} weight={800} color={TOPC} style={fadeUp(f, at(scene, 2, 0.1))}>
        Top triangle = 4
      </Text>
      <Text x={120} y={510} w={900} size={48} weight={700} style={fadeUp(f, at(scene, 2, 0.5))}>
        Area of the whole trapezoid?
      </Text>
      <Stage>
        <Trap g={GV} draw={ease(f, at(scene, 0, 0.3), 20)} diag={ease(f, at(scene, 0, 0.5), 20)} sides={['4', '8']} sidesOp={ease(f, at(scene, 1, 0.2), 10)} fills={{ top: ease(f, at(scene, 2, 0.1), 12) }} vals={{ top: '4' }} valOp={{ top: ease(f, at(scene, 2, 0.2), 10) }} letters={ease(f, at(scene, 0, 0.5), 10)} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mk(4, 8, 6, 1, 150, 740, 70);
  const ex = g.E[0];
  const done = at(scene, 3, 0.97);
  const out = fadeTo(f, at(scene, 4, 0.0), 0);
  return (
    <>
      <Stage>
        <Trap
          g={g}
          fills={{ top: 1, bottom: ease(f, at(scene, 1, 0.5), 12), left: ease(f, at(scene, 2, 0.4), 12), right: ease(f, at(scene, 2, 0.4), 12) }}
          vals={{ top: '4', bottom: '16', left: '8', right: '8' }}
          valOp={{ top: out, bottom: ease(f, at(scene, 1, 0.9), 10) * out, left: ease(f, at(scene, 2, 0.8), 10) * out, right: ease(f, at(scene, 2, 0.8), 10) * out }}
          sides={['4', '8']}
        />
        <Seg a={g.E} b={[ex, g.A[1]]} color={C.ink} dashed width={6} opacity={ease(f, at(scene, 4, 0.5), 10)} />
        <Label p={[ex + 34, (g.E[1] + g.A[1]) / 2]} text="2" color={TOPC} size={54} opacity={ease(f, at(scene, 4, 0.7), 10)} />
        <Seg a={g.E} b={[ex, g.D[1]]} color={C.ink} dashed width={6} opacity={ease(f, at(scene, 5, 0.1), 10)} />
        <Label p={[ex + 34, (g.E[1] + g.D[1]) / 2]} text="4" color={BOTC} size={54} opacity={ease(f, at(scene, 5, 0.3), 10)} />
        <VBrace x={g.D[0] - 22} y1={g.A[1]} y2={g.D[1]} color={C.green} opacity={ease(f, at(scene, 5, 0.7), 12)} label="6" side={-1} />
      </Stage>
      <div style={{ opacity: out }}>
        <Eq y={160} start={at(scene, 0, 0.3)} tex={'4 : 8 = 1 : 2'} />
        <Eq y={160} x={1380} start={at(scene, 0, 0.6)} color={C.violet} tex={'\\text{scale} = 2'} />
        <Eq y={260} start={at(scene, 1, 0.2)} tex={'2 \\times 2 = 4'} />
        <Eq y={360} start={at(scene, 1, 0.6)} color={C.blue} tex={'4 \\times 4 = 16'} />
        <Eq y={460} start={at(scene, 2, 0.2)} color={C.primary} tex={'\\text{each side: } 4 \\times 2 = 8'} />
        <Eq y={580} start={at(scene, 3, 0.1)} size={62} color={C.ink} tex={`{\\color{${HEX.amber}}4} + {\\color{${HEX.blue}}16} + {\\color{${HEX.primary}}8} + {\\color{${HEX.violet}}8}`} />
        <Eq y={690} start={at(scene, 3, 0.85)} size={80} color={C.green} tex={'= 36'} />
      </div>
      <Eq y={160} start={at(scene, 4, 0.1)} tex={'\\dfrac{1}{2} \\times 4 \\times h = 4'} />
      <Eq y={160} x={1480} start={at(scene, 4, 0.6)} color={TOPC} tex={'h = 2'} />
      <Eq y={325} start={at(scene, 5, 0.25)} color={BOTC} tex={'\\text{bottom height} = 4'} />
      <Eq y={415} start={at(scene, 5, 0.7)} color={C.green} tex={'2 + 4 = 6'} />
      <Eq y={500} start={at(scene, 6, 0.1)} tex={'4 + 8 = 12'} />
      <Eq y={580} start={at(scene, 6, 0.4)} tex={'\\dfrac{12}{2} = 6'} />
      <Eq y={715} start={at(scene, 6, 0.65)} size={64} color={C.green} tex={'6 \\times 6 = 36'} />
      <Answer x={1730} y={600} value="36" chime={CHIME} start={done} />
      <Confetti x={1730} y={600} start={done} seed={11} />
      <Pill x={1100} y={800} color={C.primary} style={{ ...fadeUp(f, at(scene, 7, 0.2)), fontSize: 36 }}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const g = mk(6, 10, 6, 1.5, 1150, 700, 64);
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 170, width: 1680, height: 600, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 900, fontSize: 52, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          The diagonals cut a trapezoid into 4 triangles.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 300, width: 900, fontSize: 48, fontWeight: 800, color: C.blue, ...fadeUp(f, at(scene, 1, 0.55)) }}>
          Top and bottom are copies.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 410, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.15)) }}>
          <Tex tex={'\\text{length} \\times \\text{scale}'} size={54} color={C.violet} />
        </div>
        <div style={{ position: 'absolute', left: 70, top: 500, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.55)) }}>
          <Tex tex={'\\text{area} \\times \\text{scale} \\times \\text{scale}'} size={54} color={C.violet} />
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.3), 14) * cardOut}>
          <Trap g={g} fills={{ top: ease(f, at(scene, 1, 0.4), 12), bottom: ease(f, at(scene, 1, 0.65), 12), left: ease(f, at(scene, 1, 0.5), 12), right: ease(f, at(scene, 1, 0.5), 12) }} letters={0} eLabel={0} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'What is the area of the trapezoid?', 6, 10, 1.5, 66, '9'),
  similar: Similar,
  bottom: Bottom,
  sides: Sides,
  total1: Total1,
  height: Height,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'Top 4, bottom 8, top triangle 4. Whole area?', 4, 8, 1, 70, '4'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';
import { interpolate } from 'remotion';

export const SLUG = '2026-10-31-seven-point-star';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const TIP = C.violet;
export const TURN = '#14a64a'; // darker green, readable as text
const PANEL = 930;
const LETTERS = 'ABCDEFG';
const TAU = Math.PI * 2;

// ---------- geometry: n points on a circle, A at the top, counterclockwise (maths, y up) ----------

type G = { n: number; k: number; cx: number; cy: number; R: number };
export const mkG = (cx: number, cy: number, R: number, n = 7, k = 2): G => ({ n, k, cx, cy, R });
export const pt = (g: G, i: number, extra = 0): Pt => {
  const m = ((i % g.n) + g.n) % g.n;
  const th = ((90 + (m * 360) / g.n) * Math.PI) / 180;
  return [g.cx + (g.R + extra) * Math.cos(th), g.cy - (g.R + extra) * Math.sin(th)];
};
const wrap = (a: number) => {
  while (a > Math.PI) a -= TAU;
  while (a <= -Math.PI) a += TAU;
  return a;
};
const ang = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const polar = (c: Pt, r: number, a: number): Pt => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
const arcD = (c: Pt, r: number, a1: number, diff: number, sector: boolean) => {
  const p1 = polar(c, r, a1);
  const p2 = polar(c, r, a1 + diff);
  const arc = `A ${r} ${r} 0 ${Math.abs(diff) > Math.PI ? 1 : 0} ${diff > 0 ? 1 : 0} ${p2.join(' ')}`;
  return sector ? `M ${c.join(' ')} L ${p1.join(' ')} ${arc} Z` : `M ${p1.join(' ')} ${arc}`;
};
export const vert = (g: G, j: number) => (((j * g.k) % g.n) + g.n) % g.n; // j-th vertex of the walk
export const lapOf = (p: number, g: G) => Math.max(1, Math.ceil((p * g.k) / g.n - 1e-6));
export const arcOp = (p: number, m: number) => Math.min(1, Math.max(0, (p - (m - 0.03)) / 0.12));

// ---------- SVG pieces ----------

export const T: React.FC<{ x: number; y: number; size?: number; color?: string; op?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; children: React.ReactNode }> = ({
  x, y, size = 48, color = C.ink, op = 1, anchor = 'middle', weight = 800, children,
}) =>
  op <= 0 ? null : (
    <text x={x} y={y} fontFamily={NUNITO} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} dominantBaseline="central" opacity={op} stroke={C.bg} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">
      {children}
    </text>
  );

export const Base: React.FC<{ g: G; op?: number; letters?: number; dots?: number; size?: number; disc?: boolean; off?: number }> = ({ g, op = 1, letters = 0, dots = 1, size = 56, disc = true, off = 64 }) => (
  <g opacity={op}>
    {disc && <circle cx={g.cx} cy={g.cy} r={g.R} fill={C.card} stroke="#c9cedb" strokeWidth={5} />}
    {range(g.n).map((i) => {
      const [x, y] = pt(g, i);
      return <circle key={i} cx={x} cy={y} r={11 * dots} fill={C.ink} />;
    })}
    {g.n === 7 &&
      range(7).map((i) => {
        const [x, y] = pt(g, i, off);
        return <T key={i} x={x} y={y} size={size} op={letters}>{LETTERS[i]}</T>;
      })}
  </g>
);

/** The walk's lines, drawn one after another as p goes 0→n. */
export const Chords: React.FC<{ g: G; p: number; color?: string; width?: number; op?: number; dash?: boolean }> = ({ g, p, color = C.ink, width = 7, op = 1, dash = false }) => (
  <g opacity={op} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash ? '14 14' : undefined}>
    {range(g.n).map((j) => {
      const fr = Math.min(1, Math.max(0, p - j));
      if (fr <= 0) return null;
      const a = pt(g, vert(g, j));
      const b = pt(g, vert(g, j + 1));
      return <line key={j} x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * fr} y2={a[1] + (b[1] - a[1]) * fr} />;
    })}
  </g>
);

/** Tip angle at vertex v: the wedge between the two star lines. */
const tipGeo = (g: G, v: number) => {
  const V = pt(g, v);
  const a1 = ang(V, pt(g, v + g.k));
  const diff = wrap(ang(V, pt(g, v - g.k)) - a1);
  return { V, a1, diff };
};
export const TipArc: React.FC<{ g: G; v: number; r?: number; op?: number; label?: string; labelR?: number; size?: number }> = ({ g, v, r = 52, op = 1, label, labelR, size = 48 }) => {
  if (op <= 0) return null;
  const { V, a1, diff } = tipGeo(g, v);
  const lp = polar(V, labelR ?? r + 44, a1 + diff / 2);
  return (
    <g opacity={op}>
      <path d={arcD(V, r, a1, diff, true)} fill={TIP} fillOpacity={0.28} stroke={TIP} strokeWidth={5} strokeLinejoin="round" />
      {label && <T x={lp[0]} y={lp[1]} size={size} color={TIP}>{label}</T>}
    </g>
  );
};

/** Turn at vertex v: from the straight-on direction to the new direction (green), with the dashed straight-on line. */
export const TurnArc: React.FC<{ g: G; v: number; r?: number; op?: number; label?: string; ext?: boolean; size?: number }> = ({ g, v, r = 52, op = 1, label, ext = true, size = 48 }) => {
  if (op <= 0) return null;
  const V = pt(g, v);
  const aIn = ang(pt(g, v - g.k), V);
  const diff = wrap(ang(V, pt(g, v + g.k)) - aIn);
  const e = polar(V, 120, aIn);
  const lp = polar(V, r + 48, aIn + diff / 2);
  return (
    <g opacity={op}>
      {ext && <line x1={V[0]} y1={V[1]} x2={e[0]} y2={e[1]} stroke={TURN} strokeWidth={5} strokeDasharray="10 10" strokeLinecap="round" />}
      <path d={arcD(V, r, aIn, diff, false)} fill="none" stroke={TURN} strokeWidth={9} strokeLinecap="round" />
      {label && <T x={lp[0]} y={lp[1]} size={size} color={TURN}>{label}</T>}
    </g>
  );
};

/** Pencil with a heading arrow. Tip at (x, y), heading in radians (screen). */
const Pencil: React.FC<{ x: number; y: number; heading: number; op?: number; s?: number }> = ({ x, y, heading, op = 1, s = 0.8 }) => {
  if (op <= 0) return null;
  const deg = (heading * 180) / Math.PI;
  return (
    <g opacity={op} transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${deg})`}>
        <line x1={6} y1={0} x2={64} y2={0} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
        <path d="M 52 -16 L 72 0 L 52 16" fill="none" stroke={C.amber} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform={`rotate(${deg}) translate(-4 -34) scale(${s})`}>
        <rect x={-190} y={-15} width={30} height={30} rx={6} fill="#f48fb1" />
        <rect x={-162} y={-15} width={12} height={30} fill="#c0c6d4" />
        <rect x={-152} y={-15} width={118} height={30} fill={C.amber} />
        <rect x={-152} y={-4} width={118} height={8} fill="#f7c955" />
        <polygon points="0,0 -36,-15 -36,15" fill="#f3d9a4" />
        <polygon points="0,0 -13,-5.5 -13,5.5" fill={C.ink} />
      </g>
    </g>
  );
};

const pencilAt = (g: G, p: number) => {
  const pp = Math.min(g.n, Math.max(0, p));
  const j = Math.min(g.n - 1, Math.floor(pp));
  const fr = pp - j;
  const a = pt(g, vert(g, j));
  const b = pt(g, vert(g, j + 1));
  const h = (i: number) => ang(pt(g, vert(g, i)), pt(g, vert(g, i + 1)));
  let heading = h(j);
  const m = Math.round(pp);
  const d = pp - m;
  if (m >= 1 && m <= g.n - 1 && Math.abs(d) < 0.07) {
    const t = (d + 0.07) / 0.14;
    const s = t * t * (3 - 2 * t);
    heading = h(m - 1) + wrap(h(m) - h(m - 1)) * s;
  }
  return { x: a[0] + (b[0] - a[0]) * fr, y: a[1] + (b[1] - a[1]) * fr, heading };
};

export const Walker: React.FC<{ g: G; p: number; op?: number; fin?: number }> = ({ g, p, op = 1, fin = 0 }) => {
  const { x, y, heading } = pencilAt(g, p);
  let hd = heading;
  if (fin > 0) {
    const h6 = ang(pt(g, vert(g, g.n - 1)), pt(g, vert(g, g.n)));
    const h0 = ang(pt(g, vert(g, 0)), pt(g, vert(g, 1)));
    const t = Math.min(1, fin);
    hd = h6 + wrap(h0 - h6) * (t * t * (3 - 2 * t));
  }
  return <Pencil x={x} y={y} heading={hd} op={op} />;
};

/** Pie at the centre that fills once per lap. */
export const LapPie: React.FC<{ g: G; p: number; op?: number; r?: number }> = ({ g, p, op = 1, r = 34 }) => {
  if (op <= 0) return null;
  const lap = lapOf(p, g);
  const fr = Math.min(1, Math.max(0, (p * g.k) / g.n - (lap - 1)));
  const c: Pt = [g.cx, g.cy];
  return (
    <g opacity={op}>
      <circle cx={c[0]} cy={c[1]} r={r} fill={C.card} stroke={C.line} strokeWidth={5} />
      {fr >= 0.999 ? <circle cx={c[0]} cy={c[1]} r={r} fill={TURN} fillOpacity={0.5} /> : fr > 0 && <path d={arcD(c, r, -Math.PI / 2, -fr * TAU, true)} fill={TURN} fillOpacity={0.5} />}
      <circle cx={c[0]} cy={c[1]} r={5} fill={C.ink} />
    </g>
  );
};

const LapPill: React.FC<{ x: number; y: number; lap: number; op?: number }> = ({ x, y, lap, op = 1 }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, opacity: op, background: C.card, borderRadius: 999, padding: '6px 32px', fontSize: 54, fontWeight: 900, color: TURN, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', border: `4px solid ${TURN}` }}>
      lap {lap}
    </div>
  );

// ---------- panel helpers ----------

const Eq: React.FC<{ x?: number; y: number; parts: { tex: string; start: number }[]; size?: number; color?: string; op?: number }> = ({ x = PANEL, y, parts, size = 54, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', opacity: op }}>
      {parts.map((p, i) => (
        <span key={i} style={{ ...fadeUp(f, p.start) }}>
          <Tex tex={p.tex} size={size} color={color} />
        </span>
      ))}
    </div>
  );
};
const E1 = (tex: string, start: number) => [{ tex, start }];

/** Answer badge (own copy: the shared one's 120 px text overflows "540°"). */
const Answer: React.FC<{ x: number; y: number; value: string; start: number; chime: string }> = ({ x, y, value, start, chime }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={chime} volume={0.3} />
      </Sequence>
      {sc > 0 && (
        <div style={{ position: 'absolute', left: x - 120, top: y - 120, width: 240, height: 240, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 900, transform: `scale(${sc})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};

const Choices: React.FC<{ x: number; y: number; start: (i: number) => number; items: React.ReactNode[] }> = ({ x, y, start, items }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 14 }}>
      {items.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 18px', fontSize: 48, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
          <span style={{ color: C.muted, fontSize: 48, marginRight: 10 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

export const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
export const cT = (t: string) => col(TIP, t);
export const cU = (t: string) => col(TURN, t);
export const DEG = '^\\circ';

export const linear = (f: number, a: number, b: number, v0: number, v1: number) => interpolate(f, [a, Math.max(a + 1, b)], [v0, v1], clamp);

// the main figure for most scenes (left half)
const FG = mkG(500, 515, 265);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mkG(520, 500, 270);
  const p0 = linear(f, at(scene, 0, 0.05), at(scene, 0, 0.5), 0, 7);
  const tipOp = (v: number) => ease(f, at(scene, 0, 0.5 + v * 0.06), 8) * (1 - 0.65 * ease(f, at(scene, 1), 10));
  const walkP = linear(f, at(scene, 1, 0.12), at(scene, 1, 0.95), 0, 7);
  const walkOp = ease(f, at(scene, 1), 8) * fadeTo(f, at(scene, 2), 0, 10);
  return (
    <>
      <Stage>
        <Base g={g} />
        <Chords g={g} p={p0} />
        {range(7).map((v) => <TipArc key={v} g={g} v={v} r={50} op={tipOp(v)} />)}
        <Chords g={g} p={walkP} color={C.primary} width={10} op={walkOp} />
        <Walker g={g} p={walkP} op={walkOp} />
      </Stage>
      <div style={{ position: 'absolute', left: 1000, top: 250, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.55)) }}>
        <Tex tex={`\\text{sum of the 7 tips} = \\,?`} size={64} color={TIP} />
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 520, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const QSENT = [
  'Seven points are evenly spaced on a circle.',
  'A star is drawn by joining each point to the second point after it, going around the circle.',
];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mkG(1440, 490, 235);
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const pts = ease(f, at(scene, 1, 0.1), 14);
  const p = linear(f, at(scene, 2, 0.45), at(scene, 2, 0.93), 0, 7);
  const glow = 1 + 0.18 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 3, 0.5)) / 50)) * Math.PI);
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 140, width: 900, background: C.card, borderRadius: 30, padding: '26px 40px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>{QSENT[0]} </span>
        <span style={s(2)}>{QSENT[1]} </span>
        <span style={s(3)}>
          What is the sum, in degrees, of the seven angles at the <Mark on={at(scene, 3, 0.45)}>tips of the star</Mark>?
        </span>
      </div>
      <Choices x={50} y={650} start={(i) => at(scene, 4, 0.25 + i * 0.1)} items={['180', '360', '540', '720', '900'].map((c) => <Tex key={c} tex={c} size={52} />)} />
      <Stage>
        <Base g={g} dots={pts} letters={pts} op={pts} />
        <Chords g={g} p={p} />
        {range(7).map((v) => <TipArc key={v} g={g} v={v} r={50 * glow} op={ease(f, at(scene, 3, 0.1 + v * 0.05), 8)} />)}
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = FG;
  const hopP = ease(f, at(scene, 0, 0.08), 26);
  const Rr = g.R + 105;
  const a0 = Math.PI / 2; // A, maths
  const a1 = a0 + hopP * ((2 * Math.PI * 2) / 7);
  const sp = (a: number): Pt => [g.cx + Rr * Math.cos(a), g.cy - Rr * Math.sin(a)];
  const e = sp(a1);
  const tan = Math.atan2(-Math.cos(a1), -Math.sin(a1)); // screen direction of travel (ccw in maths)
  const hd = (s: number) => polar(e, 30, tan + Math.PI + s).join(' ');
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={7} />
        {hopP > 0 && (
          <g stroke={C.amber} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={`M ${sp(a0).join(' ')} A ${Rr} ${Rr} 0 0 0 ${e.join(' ')}`} />
            <path d={`M ${hd(0.5)} L ${e.join(' ')} L ${hd(-0.5)}`} />
          </g>
        )}
        {(() => {
          const lp = sp(a0 + (2 * Math.PI * 1) / 7);
          const q: Pt = [g.cx + (Rr + 75) * Math.cos(a0 + TAU / 7), g.cy - (Rr + 75) * Math.sin(a0 + TAU / 7)];
          return <T x={q[0] - 20} y={q[1] - 30} size={48} color="#c27d00" op={ease(f, at(scene, 0, 0.3), 10)}>skips B</T>;
        })()}
        {range(7).map((v) => <TipArc key={v} g={g} v={v} r={52} op={ease(f, at(scene, 1, 0.1 + v * 0.07), 8)} label={v === 0 ? 'tip' : undefined} labelR={105} size={48} />)}
      </Stage>
      <Eq y={130} size={52} parts={E1(`A\\to C\\to E\\to G\\to`, at(scene, 0, 0.55))} />
      <Eq y={210} size={52} parts={E1(`B\\to D\\to F\\to A`, at(scene, 0, 0.7))} />
      <Eq y={340} size={54} color={TIP} parts={E1(`\\text{all 7 tips are the same size}`, at(scene, 1, 0.3))} />
      <Eq y={450} size={62} parts={E1(`7\\text{ tips: total} = \\,?`, at(scene, 2, 0.2))} />
    </>
  );
};

const Pause: React.FC<{ scene: Scene; k: number; seconds: number; text: string }> = ({ scene, k, seconds, text }) => {
  const f = useCurrentFrame();
  const g = mkG(430, 500, 245, 7, k);
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={7} />
      </Stage>
      <div style={{ position: 'absolute', left: 870, top: 220, width: 560, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1680} y={500} tick={TICK} />
    </>
  );
};

const Slices: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = FG;
  const O: Pt = [g.cx, g.cy];
  const star = 1 - 0.7 * ease(f, at(scene, 1), 14);
  const rad = (i: number) => ease(f, at(scene, 1, 0.05 + i * 0.07), 10);
  const gone = 1 - ease(f, at(scene, 3), 12); // the seven slices go away when we zoom on A
  const sOp = ease(f, at(scene, 1, 0.55), 12) * gone;
  const rd = (i: number) => ease(f, at(scene, 4, 0.04 + i * 0.1), 12); // radii OA, OC, OF
  const focus = ease(f, at(scene, 3), 14);
  const dimOther = 1 - 0.78 * focus;
  const ringP = pop(f, at(scene, 3, 0.4), 30);
  const triAC = ease(f, at(scene, 4, 0.15), 14);
  const A = pt(g, 0);
  const aOA = ang(O, A);
  const aOC = ang(O, pt(g, 2));
  const aOF = ang(O, pt(g, 5));
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        {/* the star, then only the two lines at A */}
        <Chords g={g} p={7} op={star * dimOther} />
        {focus > 0 && (
          <g opacity={focus} stroke={C.ink} strokeWidth={9} strokeLinecap="round">
            <line x1={A[0]} y1={A[1]} x2={pt(g, 2)[0]} y2={pt(g, 2)[1]} />
            <line x1={A[0]} y1={A[1]} x2={pt(g, 5)[0]} y2={pt(g, 5)[1]} />
          </g>
        )}
        {/* triangle OAC */}
        {triAC > 0 && <path d={`M ${O.join(' ')} L ${A.join(' ')} L ${pt(g, 2).join(' ')} Z`} fill={C.primary} fillOpacity={0.22 * triAC} />}
        {/* seven radii */}
        {range(7).map((i) => {
          const o = rad(i) * gone;
          const q = pt(g, i);
          return o > 0 && <line key={i} x1={O[0]} y1={O[1]} x2={O[0] + (q[0] - O[0]) * rad(i)} y2={O[1] + (q[1] - O[1]) * rad(i)} stroke="#7a8296" strokeWidth={5} opacity={o} strokeLinecap="round" />;
        })}
        {[0, 2, 5].map((i, n) => {
          const q = pt(g, i);
          const p = rd(n);
          return p > 0 && <line key={`r${i}`} x1={O[0]} y1={O[1]} x2={O[0] + (q[0] - O[0]) * p} y2={O[1] + (q[1] - O[1]) * p} stroke={C.primary} strokeWidth={8} strokeLinecap="round" />;
        })}
        {/* one slice angle s each */}
        {range(7).map((i) => {
          const a1 = ang(O, pt(g, i));
          const d = wrap(ang(O, pt(g, i + 1)) - a1);
          const mid = polar(O, 100, a1 + d / 2);
          return (
            <g key={i} opacity={rad(i) * sOp}>
              <path d={arcD(O, 62, a1, d, false)} stroke={C.primary} strokeWidth={6} fill="none" strokeLinecap="round" />
              <T x={mid[0]} y={mid[1]} size={56} color={TURN}>s</T>
            </g>
          );
        })}
        {/* 2s at the centre of triangle OAC */}
        {triAC > 0 && (() => {
          const d = wrap(aOC - aOA);
          const mid = polar(O, 134, aOA + d / 2);
          return (
            <g opacity={triAC}>
              <path d={arcD(O, 96, aOA, d, false)} stroke={TURN} strokeWidth={9} fill="none" strokeLinecap="round" />
              <T x={mid[0]} y={mid[1]} size={56} color={TURN}>2s</T>
            </g>
          );
        })()}
        {focus > 0 && <circle cx={A[0]} cy={A[1]} r={46 + 14 * (1 - ringP)} fill="none" stroke={TIP} strokeWidth={7} opacity={focus * 0.9} />}
        {focus > 0 && <TipArc g={g} v={0} r={62} op={focus} />}
        <circle cx={O[0]} cy={O[1]} r={9} fill={C.ink} opacity={ease(f, at(scene, 0, 0.5), 10)} />
        <T x={O[0] + 36} y={O[1] + 42} size={52} op={ease(f, at(scene, 0, 0.5), 10) * (1 - ease(f, at(scene, 1), 10))}>O</T>
      </Stage>
      <Eq y={170} size={66} color={TURN} parts={E1(`7s = 360${DEG}`, at(scene, 2, 0.25))} />
      <div style={{ position: 'absolute', left: PANEL, top: 330, width: 900, fontSize: 44, fontWeight: 700, color: C.muted, ...fadeUp(f, at(scene, 1, 0.5)) }}>s = one slice angle at the center</div>
      <div style={{ position: 'absolute', left: PANEL, top: 450, width: 900, fontSize: 46, fontWeight: 800, color: C.ink, ...fadeUp(f, at(scene, 3, 0.4)) }}>
        The tip at A: <span style={{ color: TIP }}>lines to C and F</span>
      </div>
    </>
  );
};

const Triangle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = FG;
  const O: Pt = [g.cx, g.cy];
  const A = pt(g, 0);
  const Cc = pt(g, 2);
  const F = pt(g, 5);
  const aOA = ang(O, A);
  const showTri = ease(f, at(scene, 0), 12);
  const triAF = ease(f, at(scene, 3, 0.15), 14);
  const baseL = ease(f, at(scene, 2, 0.2), 12); // base angles of OAC
  const baseR = ease(f, at(scene, 4, 0.2), 12);
  const tipOp = ease(f, at(scene, 5, 0.4), 12);
  const sevenStart = at(scene, 6);
  const clean = ease(f, sevenStart, 14); // fade the construction, show seven tips
  const con = 1 - clean;
  const tick = (a: Pt, b: Pt, op: number) => {
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const d = ang(a, b) + Math.PI / 2;
    const p1 = polar(m, 14, d);
    const p2 = polar(m, -14, d);
    return <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={C.ink} strokeWidth={7} strokeLinecap="round" opacity={op} />;
  };
  // base angle arcs at A and C (triangle OAC) and at A (triangle OAF)
  const baseArc = (V: Pt, P1: Pt, P2: Pt, r: number, label: string, op: number, lr: number, out?: Pt) => {
    if (op <= 0) return null;
    const a1 = ang(V, P1);
    const d = wrap(ang(V, P2) - a1);
    const lp = out ?? polar(V, lr, a1 + d / 2);
    const from = polar(V, r, a1 + d / 2);
    return (
      <g opacity={op}>
        <path d={arcD(V, r, a1, d, true)} fill={TURN} fillOpacity={0.3} stroke={TURN} strokeWidth={5} strokeLinejoin="round" />
        {out && <line x1={from[0]} y1={from[1]} x2={out[0] + (out[0] < V[0] ? 60 : -60)} y2={out[1] + 24} stroke={TURN} strokeWidth={4} />}
        <T x={lp[0]} y={lp[1]} size={52} color={TURN}>{label}</T>
      </g>
    );
  };
  const dC = wrap(ang(O, Cc) - aOA);
  const dF = wrap(ang(O, F) - aOA);
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={7} op={0.3} />
        <g opacity={con}>
          <path d={`M ${O.join(' ')} L ${A.join(' ')} L ${Cc.join(' ')} Z`} fill={C.primary} fillOpacity={0.2 * showTri} />
          <path d={`M ${O.join(' ')} L ${A.join(' ')} L ${F.join(' ')} Z`} fill={C.blue} fillOpacity={0.2 * triAF} />
          <g stroke="#7a8296" strokeWidth={5} opacity={showTri} strokeLinecap="round">
            {[A, Cc].map((q, i) => <line key={i} x1={O[0]} y1={O[1]} x2={q[0]} y2={q[1]} />)}
          </g>
          <g stroke="#7a8296" strokeWidth={5} opacity={triAF} strokeLinecap="round">
            <line x1={O[0]} y1={O[1]} x2={F[0]} y2={F[1]} />
          </g>
          <g stroke={C.ink} strokeWidth={9} strokeLinecap="round" opacity={showTri}>
            <line x1={A[0]} y1={A[1]} x2={Cc[0]} y2={Cc[1]} />
            <line x1={A[0]} y1={A[1]} x2={F[0]} y2={F[1]} opacity={triAF} />
          </g>
          {tick(O, A, showTri)}
          {tick(O, Cc, showTri)}
          {/* 2s centre arcs */}
          <g opacity={showTri * 0.9}>
            <path d={arcD(O, 92, aOA, dC, false)} stroke={TURN} strokeWidth={8} fill="none" />
            <T x={polar(O, 134, aOA + dC / 2)[0]} y={polar(O, 134, aOA + dC / 2)[1]} size={56} color={TURN}>2s</T>
          </g>
          <g opacity={triAF}>
            <path d={arcD(O, 92, aOA, dF, false)} stroke={C.blue} strokeWidth={8} fill="none" />
            <T x={polar(O, 134, aOA + dF / 2)[0]} y={polar(O, 134, aOA + dF / 2)[1]} size={56} color={C.blue}>2s</T>
          </g>
          {tick(O, F, triAF)}
          {baseArc(A, O, Cc, 56, '90 − s', baseL, 112, [A[0] - 160, A[1] - 8])}
          {baseArc(Cc, A, O, 56, '90 − s', baseL, 108)}
          {baseArc(A, F, O, 56, '90 − s', baseR, 112, [A[0] + 160, A[1] - 8])}
          {tipOp > 0 && <TipArc g={g} v={0} r={92} op={tipOp * con} label="tip" labelR={150} size={48} />}
        </g>
        {range(7).map((v) => <TipArc key={v} g={g} v={v} r={52} op={clean * ease(f, sevenStart + 3 + v * 4, 8)} />)}
        <circle cx={O[0]} cy={O[1]} r={8} fill={C.ink} />
      </Stage>
      <Text x={1500} y={125} w={400} size={46} weight={800} color={C.muted} style={fadeUp(f, 0)}>
        <Tex tex={`7s = 360${DEG}`} size={46} color={C.muted} />
      </Text>
      <Eq y={125} size={52} parts={E1(`OA = OC`, at(scene, 0, 0.55))} />
      <Eq y={200} size={52} parts={E1(`180 - 2s`, at(scene, 1, 0.45))} />
      <Eq y={280} size={52} parts={E1(`\\dfrac{180 - 2s}{2} = ${cU('90 - s')}`, at(scene, 2, 0.1))} />
      <Eq y={400} size={52} op={1 - 0.7 * ease(f, at(scene, 11), 12)} parts={E1(`(${cU('90 - s')}) + (${cU('90 - s')}) = ${cT('180 - 2s')}`, at(scene, 5, 0.4))} />
      <Eq y={485} size={52} parts={[{ tex: `7\\times(180 - 2s)`, start: at(scene, 6, 0.2) }, { tex: `\\;=\\; 7\\times 180 - 14s`, start: at(scene, 6, 0.6) }]} op={1 - 0.88 * ease(f, at(scene, 11), 12)} />
      <Eq y={565} size={52} parts={E1(`=\\; 1260 - 14s`, at(scene, 7, 0.45))} op={1 - 0.88 * ease(f, at(scene, 11), 12)} />
      <Eq y={645} size={52} parts={[{ tex: `14s = 2\\times 7s`, start: at(scene, 8, 0.4) }, { tex: `\\;=\\; 2\\times 360 = 720`, start: at(scene, 9, 0.35) }]} op={1 - 0.88 * ease(f, at(scene, 11), 12)} />
      <Eq y={735} size={62} color={C.green} parts={E1(`1260 - 720 = 540`, at(scene, 10, 0.6))} />
      <Answer x={1700} y={590} value={`540°`} start={at(scene, 11, 0.88)} chime={CHIME} />
      <Pill x={1610} y={735} color={C.green} style={{ fontSize: 44, ...fadeUp(f, at(scene, 11, 0.88)) }}>Choice C</Pill>
    </>
  );
};

const Pencil1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = FG;
  const p = f < at(scene, 4, 0.02) ? linear(f, at(scene, 1, 0.08), at(scene, 1, 0.92), 0, 1.15) : linear(f, at(scene, 4, 0.04), at(scene, 4, 0.78), 1.15, 7);
  const fin = linear(f, at(scene, 4, 0.8), at(scene, 4, 0.95), 0, 1); // the last turn, at A
  const pencilOp = ease(f, at(scene, 0, 0.3), 12);
  const labelOn = f < at(scene, 4, 0.1) ? ease(f, at(scene, 2, 0.15), 10) : 0;
  const lapOp = ease(f, at(scene, 4, 0.02), 10);
  const lap = lapOf(p, g);
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={7} color={C.muted} width={5} op={0.4} dash />
        <Chords g={g} p={p} color={C.ink} width={8} />
        <LapPie g={g} p={p} op={lapOp} r={36} />
        {range(7).map((m0) => {
          const m = m0 + 1; // arrival at vertex m of the walk (m=7 is back at A)
          const v = vert(g, m);
          const o = m === 7 ? fin : arcOp(p, m);
          if (m === 1) {
            return (
              <g key={m}>
                <TurnArc g={g} v={v} r={56} op={o} label={labelOn > 0 ? 'turn' : undefined} />
                <TipArc g={g} v={v} r={56} op={o * ease(f, at(scene, 2, 0.05), 10)} label={labelOn > 0 ? 'tip' : undefined} labelR={118} size={48} />
              </g>
            );
          }
          return (
            <g key={m}>
              <TurnArc g={g} v={v} r={m === 7 ? 56 : 38} op={m === 7 ? o : o * 0.9} ext={m === 7} />
              <TipArc g={g} v={v} r={m === 7 ? 56 : 44} op={m === 7 ? o : o * 0.9} />
            </g>
          );
        })}
        <Walker g={g} p={p} op={pencilOp} fin={fin} />
      </Stage>
      <LapPill x={PANEL} y={140} lap={lap} op={lapOp} />
      <Eq y={300} size={58} parts={E1(`${cT('\\text{tip}')} + ${cU('\\text{turn}')} = 180${DEG}`, at(scene, 2, 0.4))} />
      <Eq y={400} size={56} parts={E1(`7\\times 2 = 14\\text{ slices} = 2\\text{ laps}`, at(scene, 3, 0.5))} />
      <Eq y={520} size={64} color={C.ink} parts={E1(`2\\times 360${DEG} = 720${DEG}`, at(scene, 5, 0.45))} />
      <div style={{ position: 'absolute', left: PANEL, top: 630, width: 900, fontSize: 44, fontWeight: 700, color: TURN, ...fadeUp(f, at(scene, 5, 0.55)) }}>total turning of the pencil</div>
    </>
  );
};

const Pencil2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = FG;
  const hl = 1 + 0.06 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 3, 0.7)) / 30)) * Math.PI);
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={7} color={C.ink} width={7} />
        {range(7).map((v) => <TurnArc key={`u${v}`} g={g} v={v} r={38} ext={false} op={ease(f, at(scene, 0, 0.2 + v * 0.05), 8)} />)}
        {range(7).map((v) => <TipArc key={`t${v}`} g={g} v={v} r={44} op={ease(f, at(scene, 0, 0.2 + v * 0.05), 8)} />)}
        <LapPie g={g} p={7} r={36} />
      </Stage>
      <Eq y={150} size={56} parts={E1(`${cT('\\text{tip}')} + ${cU('\\text{turn}')} = 180${DEG}`, at(scene, 0, 0.4))} />
      <Eq y={250} size={56} parts={E1(`7\\times 180${DEG} = 1260${DEG}`, at(scene, 1, 0.5))} />
      <Eq y={350} size={56} color={TURN} parts={E1(`\\text{turns} = 720${DEG}`, at(scene, 2, 0.35))} />
      <Eq y={450} size={62} color={C.green} parts={E1(`\\text{tips} = 1260 - 720 = 540`, at(scene, 3, 0.4))} />
      <div style={{ position: 'absolute', left: PANEL, top: 600, background: C.violet, color: '#fff', borderRadius: 28, padding: '14px 36px', fontSize: 44, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.5)), transform: `scale(${hl})`, transformOrigin: 'left center' }}>
        Pencil walk: count the laps
      </div>
    </>
  );
};

const TRAPS: { letter: string; value: string; note: string; ok?: boolean }[] = [
  { letter: 'A', value: '180', note: 'the 5-point star’s total' },
  { letter: 'B', value: '360', note: 'one full turn' },
  { letter: 'C', value: '540', note: 'the answer', ok: true },
  { letter: 'D', value: '720', note: 'the turns, not the tips' },
  { letter: 'E', value: '900', note: 'an ordinary 7-sided shape' },
];
// which line shows each wrong choice's note
const TRAP_LINE: Record<string, number> = { A: 1, E: 2, D: 4, B: 5 };

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vis = (a: number, b: number) => ease(f, at(scene, a), 10) * (1 - ease(f, at(scene, b), 10)); // visible from line a until line b
  const g5 = mkG(430, 470, 215, 5, 2);
  const g7s = mkG(430, 470, 215, 7, 2);
  const g7p = mkG(430, 470, 215, 7, 1);
  const draw = (i: number) => linear(f, at(scene, i, 0.12), at(scene, i, 0.6), 0, 7);
  return (
    <>
      <Fade op={vis(1, 2)}>
        <Stage>
          <Base g={g5} />
          <Chords g={g5} p={draw(1)} />
          {range(5).map((v) => <TipArc key={v} g={g5} v={v} r={50} op={ease(f, at(scene, 1, 0.55 + v * 0.05), 8)} />)}
        </Stage>
        <Text x={430} y={730} w={700} size={52} align="center" style={fadeUp(f, at(scene, 1, 0.7))}><Tex tex={`5\\text{ tips: } 180${DEG}`} size={56} color={TIP} /></Text>
      </Fade>
      <Fade op={vis(2, 4)}>
        <Stage>
          <Base g={g7p} />
          <Chords g={g7p} p={draw(2)} />
        </Stage>
        <Text x={430} y={730} w={700} size={52} align="center" style={fadeUp(f, at(scene, 2, 0.7))}><Tex tex={`\\text{7 sides: } 900${DEG}`} size={56} /></Text>
      </Fade>
      <Fade op={vis(4, 5)}>
        <Stage>
          <Base g={g7s} />
          <Chords g={g7s} p={7} />
          {range(7).map((v) => <TurnArc key={v} g={g7s} v={v} r={46} ext={false} op={ease(f, at(scene, 4, 0.3 + v * 0.05), 8)} />)}
        </Stage>
        <Text x={430} y={730} w={700} size={52} align="center" style={fadeUp(f, at(scene, 4, 0.7))}><Tex tex={`\\text{turns} = 720${DEG}`} size={56} color={TURN} /></Text>
      </Fade>
      <Fade op={vis(5, 7)}>
        <Stage>
          <Base g={g7p} />
          <Chords g={g7p} p={7} />
          {range(7).map((v) => <TurnArc key={v} g={g7p} v={v} r={46} ext={false} op={ease(f, at(scene, 5, 0.2 + v * 0.05), 8)} />)}
          <LapPie g={g7p} p={7} r={34} />
        </Stage>
        <Text x={430} y={730} w={700} size={52} align="center" style={fadeUp(f, at(scene, 5, 0.7))}><Tex tex={`\\text{one lap} = 360${DEG}`} size={56} color={TURN} /></Text>
      </Fade>
      <Fade op={ease(f, at(scene, 7), 10)}>
        <div style={{ position: 'absolute', left: 120, top: 330, width: 700, background: C.card, borderRadius: 30, padding: '30px 40px', fontSize: 52, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.08)', borderLeft: `12px solid ${C.primary}` }}>
          Don’t reuse a rule from a different shape. <span style={{ color: C.primary }}>Check it!</span>
        </div>
      </Fade>
      {TRAPS.map((t, i) => {
        const noteLine = TRAP_LINE[t.letter];
        const appear = at(scene, 0, 0.2 + i * 0.12);
        const noteOp = t.ok ? ease(f, at(scene, 0, 0.8), 10) : noteLine === undefined ? 0 : ease(f, at(scene, noteLine, 0.1), 10);
        const bad = !t.ok && noteOp > 0;
        return (
          <div key={t.letter} style={{ position: 'absolute', left: PANEL, top: 140 + i * 118, width: 940, height: 98, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 28, background: C.card, borderRadius: 24, padding: '0 34px', borderLeft: `14px solid ${t.ok ? C.green : bad ? C.red : C.line}`, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, appear) }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: C.muted, width: 48 }}>{t.letter}</span>
            <Tex tex={t.value} size={56} color={t.ok ? C.green : bad ? C.red : C.ink} />
            <span style={{ fontSize: 40, fontWeight: 800, color: t.ok ? C.green : C.red, opacity: noteOp, marginLeft: 12, whiteSpace: 'nowrap' }}>{t.ok ? '✓ ' : '✗ '}{t.note}</span>
          </div>
        );
      })}
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mkG(500, 505, 250, 7, 3);
  const p = linear(f, at(scene, 0, 0.5), at(scene, 0, 0.97), 0, 7);
  const tip = (v: number) => ease(f, at(scene, 1, 0.1 + v * 0.07), 8);
  return (
    <>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={p} />
        {range(7).map((v) => <TipArc key={v} g={g} v={v} r={60} op={tip(v)} />)}
      </Stage>
      <Eq y={140} size={52} parts={E1(`A\\to D\\to G\\to C\\to`, at(scene, 0, 0.6))} />
      <Eq y={220} size={52} parts={E1(`F\\to B\\to E\\to A`, at(scene, 0, 0.75))} />
      <div style={{ position: 'absolute', left: PANEL, top: 330, fontSize: 46, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 0, 0.8)) }}>each point to the 3rd point after it</div>
      <Eq y={450} size={62} parts={E1(`7\\text{ tips: total} = \\,?`, at(scene, 1, 0.4))} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = mkG(500, 505, 250, 7, 3);
  const p = linear(f, at(scene, 0, 0.3), at(scene, 1, 0.95), 0, 7);
  const lap = lapOf(p, g);
  const Ra = (y: number, tex: string, start: number, color = C.ink, size = 54) => <Eq y={y} size={size} color={color} parts={E1(tex, start)} />;
  return (
    <>
      <Stage>
        <Base g={g} letters={1} off={76} />
        <Chords g={g} p={7} color={C.muted} width={5} op={0.4} dash />
        <Chords g={g} p={p} color={C.ink} width={8} />
        <LapPie g={g} p={p} r={30} />
        {range(7).map((m0) => <TipArc key={`t${m0}`} g={g} v={vert(g, m0 + 1)} r={50} op={arcOp(p, m0 + 1) * 0.9} />)}
        {range(7).map((m0) => <TurnArc key={`u${m0}`} g={g} v={vert(g, m0 + 1)} r={32} ext={false} op={arcOp(p, m0 + 1) * 0.9} />)}
        <Walker g={g} p={p} op={ease(f, at(scene, 0), 10) * (1 - ease(f, at(scene, 2), 10))} />
      </Stage>
      <LapPill x={PANEL} y={140} lap={lap} op={ease(f, at(scene, 0, 0.2), 10)} />
      {Ra(270, `7\\times 3 = 21\\text{ slices}`, at(scene, 0, 0.6))}
      {Ra(360, `21\\text{ slices} = 3\\text{ laps}`, at(scene, 1, 0.4))}
      {Ra(450, `3\\times 360${DEG} = 1080${DEG}`, at(scene, 2, 0.55), TURN)}
      {Ra(540, `7\\times 180${DEG} = 1260${DEG}`, at(scene, 3, 0.5))}
      {Ra(640, `1260 - 1080 = 180`, at(scene, 4, 0.3), C.green, 62)}
      <Answer x={1700} y={420} value={`180°`} start={at(scene, 4, 0.9)} chime={CHIME} />
      <div style={{ position: 'absolute', left: PANEL, top: 740, background: C.violet, color: '#fff', borderRadius: 28, padding: '12px 34px', fontSize: 42, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.25)) }}>
        pointier tips, smaller total
      </div>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = FG;
  const out = fadeTo(f, at(scene, 3), 0, 12);
  return (
    <>
      <Fade op={out}>
        <Stage>
          <Base g={g} letters={1} />
          <Chords g={g} p={7} color={C.muted} width={5} op={0.4} dash />
          <Chords g={g} p={7} width={8} op={ease(f, at(scene, 0, 0.3), 12)} />
          <TurnArc g={g} v={vert(g, 1)} r={58} label="turn" op={ease(f, at(scene, 1, 0.1), 12)} />
          <TipArc g={g} v={vert(g, 1)} r={58} label="tip" labelR={120} op={ease(f, at(scene, 1, 0.1), 12)} />
          <LapPie g={g} p={7} r={36} op={ease(f, at(scene, 2), 12)} />
        </Stage>
        <Text x={PANEL} y={150} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <Eq y={270} size={60} parts={E1(`${cT('\\text{tip}')} + ${cU('\\text{turn}')} = 180${DEG}`, at(scene, 1, 0.45))} />
        <Eq y={400} size={60} parts={E1(`${cU('\\text{turns}')} = \\text{laps}\\times 360${DEG}`, at(scene, 2, 0.4))} />
      </Fade>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: ({ scene }) => <Pause scene={scene} k={2} seconds={10} text="What is the sum of the seven tip angles?" />,
  slices: Slices,
  triangle: Triangle,
  pencil: Pencil1,
  pencil2: Pencil2,
  traps: Traps,
  variant: Variant,
  try2: ({ scene }) => <Pause scene={scene} k={3} seconds={12} text="Join each point to the 3rd point after it. What do the seven tips add up to?" />,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

// YouTube thumbnail (`2026-10-31-seven-point-star-thumb`, render.sh → poster.jpg): the trap + the star with its seven tip angles marked, no answer.
export const Thumb: React.FC = () => {
  const g = mkG(340, 322, 268);
  return (
    <ThumbFrame chip="AMC 8 Practice" lines={["Think it's", <span style={{ color: C.red }}>180?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <Base g={g} />
        <Chords g={g} p={7} />
        {range(7).map((v) => <TipArc key={v} g={g} v={v} r={70} />)}
      </svg>
    </ThumbFrame>
  );
};

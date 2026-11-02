import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-centroid-parallel';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (screen px, y down) ----------

export type Tri = { A: Pt; B: Pt; C: Pt; M: Pt; L: Pt; P: Pt; G: Pt; E: Pt; F: Pt };
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const add = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy];
export const mkTri = (A: Pt, B: Pt, Cc: Pt): Tri => ({
  A, B, C: Cc,
  M: lerp(B, Cc, 0.5),
  L: lerp(A, Cc, 0.5),
  P: lerp(A, B, 0.5),
  G: [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3],
  E: lerp(A, B, 2 / 3),
  F: lerp(A, Cc, 2 / 3),
});
const T = mkTri([490, 212], [140, 790], [1040, 790]);
const V = mkTri([660, 225], [170, 790], [1010, 790]);
const PANEL = 1150;

// ---------- drawing helpers ----------

export const Lab: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={9}>
      {text}
    </text>
  );

export const Ln: React.FC<{ a: Pt; b: Pt; color?: string; width?: number; p?: number; dashed?: boolean; opacity?: number }> = ({ a, b, color = C.ink, width = 5, p = 1, dashed, opacity = 1 }) =>
  p <= 0 || opacity <= 0 ? null : dashed ? (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="14 12" opacity={opacity} />
  ) : (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={opacity} />
  );

export const Dot: React.FC<{ p: Pt; color?: string; r?: number; opacity?: number }> = ({ p, color = C.ink, r = 10, opacity = 1 }) => (opacity <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill={color} opacity={opacity} />);

/** n small equal-mark strokes across segment a-b at fraction t. */
const Tk: React.FC<{ a: Pt; b: Pt; t?: number; n?: number; color?: string; opacity: number; len?: number }> = ({ a, b, t = 0.5, n = 1, color = C.ink, opacity, len = 15 }) => {
  if (opacity <= 0) return null;
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u: Pt = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  const nn: Pt = [-u[1], u[0]];
  const m = lerp(a, b, t);
  return (
    <g opacity={opacity} stroke={color} strokeWidth={6} strokeLinecap="round">
      {range(n).map((k) => {
        const o = (k - (n - 1) / 2) * 14;
        const c: Pt = [m[0] + u[0] * o, m[1] + u[1] * o];
        return <line key={k} x1={c[0] - nn[0] * len} y1={c[1] - nn[1] * len} x2={c[0] + nn[0] * len} y2={c[1] + nn[1] * len} />;
      })}
    </g>
  );
};

/** Parallel chevron(s) at fraction t of a-b. */
const Chev: React.FC<{ a: Pt; b: Pt; t: number; color: string; opacity: number; n?: number }> = ({ a, b, t, color, opacity, n = 1 }) => {
  if (opacity <= 0) return null;
  const m = lerp(a, b, t);
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${m[0]} ${m[1]}) rotate(${ang})`} opacity={opacity} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {range(n).map((k) => (
        <path key={k} d={`M ${-10 + (k - (n - 1) / 2) * 22} -16 L ${8 + (k - (n - 1) / 2) * 22} 0 L ${-10 + (k - (n - 1) / 2) * 22} 16`} />
      ))}
    </g>
  );
};

const Fill: React.FC<{ pts: Pt[]; color: string; opacity: number; fo?: number; stroke?: number }> = ({ pts, color, opacity, fo = 0.34, stroke = 0 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')} Z`} fill={color} fillOpacity={fo} stroke={stroke ? color : 'none'} strokeWidth={stroke} strokeLinejoin="round" />
    </g>
  );

/** Open polyline highlight (e.g. a Z shape). */
const Zig: React.FC<{ pts: Pt[]; color: string; opacity: number; width?: number }> = ({ pts, color, opacity, width = 18 }) =>
  opacity <= 0 ? null : (
    <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')}`} stroke={color} strokeWidth={width} strokeOpacity={0.3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
  );

/** Angle arc at vertex V between rays towards p1 and p2. */
const Arc: React.FC<{ v: Pt; p1: Pt; p2: Pt; r: number; color: string; opacity: number }> = ({ v, p1, p2, r, color, opacity }) => {
  if (opacity <= 0) return null;
  const a1 = Math.atan2(p1[1] - v[1], p1[0] - v[0]);
  const a2 = Math.atan2(p2[1] - v[1], p2[0] - v[0]);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d <= -Math.PI) d += 2 * Math.PI;
  const s: Pt = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)];
  const e: Pt = [v[0] + r * Math.cos(a2), v[1] + r * Math.sin(a2)];
  const wedge = `M ${v[0]} ${v[1]} L ${s[0]} ${s[1]} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e[0]} ${e[1]} Z`;
  return (
    <g opacity={opacity}>
      <path d={wedge} fill={color} fillOpacity={0.3} />
      <path d={`M ${s[0]} ${s[1]} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e[0]} ${e[1]}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

const RightAngle: React.FC<{ at: Pt; u: Pt; v: Pt; opacity: number; k?: number }> = ({ at: p, u, v, opacity, k = 30 }) =>
  opacity <= 0 ? null : (
    <path d={`M ${p[0] + u[0] * k} ${p[1] + u[1] * k} L ${p[0] + (u[0] + v[0]) * k} ${p[1] + (u[1] + v[1]) * k} L ${p[0] + v[0] * k} ${p[1] + v[1] * k}`} stroke={C.ink} strokeWidth={5} fill="none" opacity={opacity} />
  );

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const TexAt: React.FC<{ x: number; y: number; tex: string; size?: number; color?: string; opacity: number }> = ({ x, y, tex, size = 48, color = C.ink, opacity }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(0, -50%)', whiteSpace: 'nowrap', opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

/** Triangle outline + labels A B C, drawn on as `draw` goes 0..1. */
export const Outline: React.FC<{ g: Tri; draw?: number }> = ({ g, draw = 1 }) => (
  <>
    <Poly pts={[g.A, g.B, g.C]} color={C.ink} width={6} progress={draw} />
    <Lab p={add(g.A, 0, -44)} text="A" opacity={draw} />
    <Lab p={add(g.B, -44, 14)} text="B" opacity={draw} />
    <Lab p={add(g.C, 44, 14)} text="C" opacity={draw} />
  </>
);

/** The three dashed medians. */
export const Meds: React.FC<{ g: Tri; am?: number; bl?: number; cp?: number; color?: string; width?: number }> = ({ g, am = 1, bl = 1, cp = 1, color = C.muted, width = 5 }) => (
  <>
    <Ln a={g.A} b={g.M} p={am} dashed color={color} width={width} />
    <Ln a={g.B} b={g.L} p={bl} dashed color={color} width={width} />
    <Ln a={g.C} b={g.P} p={cp} dashed color={color} width={width} />
  </>
);

/** Label beside AC / AB, pushed outside. */
export const outAC = (g: Tri, t: number, off = 52): Pt => {
  const d: Pt = [g.C[0] - g.A[0], g.C[1] - g.A[1]];
  const l = Math.hypot(d[0], d[1]);
  const p = lerp(g.A, g.C, t);
  return [p[0] + (d[1] / l) * off, p[1] - (d[0] / l) * off];
};
export const outAB = (g: Tri, t: number, off = 52): Pt => {
  const d: Pt = [g.B[0] - g.A[0], g.B[1] - g.A[1]];
  const l = Math.hypot(d[0], d[1]);
  const p = lerp(g.A, g.B, t);
  return [p[0] - (d[1] / l) * off, p[1] + (d[0] / l) * off];
};

const Glow: React.FC<{ p: Pt; r: number; opacity: number }> = ({ p, r, opacity }) =>
  opacity <= 0 ? null : (
    <>
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor={C.amber} stopOpacity={0.85} />
          <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={p[0]} cy={p[1]} r={r} fill="url(#glow)" opacity={opacity} />
    </>
  );

const Badge: React.FC<{ p: Pt; text: string; color?: string; opacity?: number }> = ({ p, text, color = C.violet, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={p[0]} cy={p[1]} r={text.length > 1 ? 40 : 34} fill={color} />
      <text x={p[0]} y={p[1] + 2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={text.length > 1 ? 46 : 48} textAnchor="middle" dominantBaseline="middle">
        {text}
      </text>
    </g>
  );

const GoalChip: React.FC<{ y: number; start: number; tex: string }> = ({ y, start, tex }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, background: C.card, borderRadius: 24, padding: '8px 36px', boxShadow: '0 6px 24px rgba(30,40,80,0.08)', border: `5px solid ${C.green}`, ...fadeUp(f, start) }}>
      <Tex tex={tex} size={56} />
    </div>
  );
};

const AnswerChip: React.FC<{ x: number; y: number; start: number; text: string }> = ({ x, y, start, text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 190, top: y - 70, width: 380, height: 140, borderRadius: 40, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {text}
        </div>
      )}
      <Confetti x={x} y={y} start={start} seed={16} />
    </>
  );
};

const bump = (f: number, s: number, hold = 30) => ease(f, s, 8) * (1 - ease(f, s + hold, 12));

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const glow = ease(f, at(scene, 1, 0.1), 20);
  const pulse = 1 + 0.12 * Math.sin(f / 5);
  return (
    <>
      <Text x={1500} y={190} w={700} size={72} weight={900} align="center" style={fadeUp(f, 0)}>
        Three lines.
        <br />
        One point.
      </Text>
      <Text x={1500} y={440} w={700} size={50} weight={800} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        A secret hides here...
      </Text>
      <Stage>
        <Outline g={g} draw={ease(f, 4, 22)} />
        <Meds g={g} am={ease(f, 12, 22)} bl={ease(f, 22, 22)} cp={ease(f, 32, 22)} color={C.ink} />
        <Glow p={g.G} r={110 * pulse} opacity={glow} />
        <Dot p={g.G} color={C.amber} r={16} opacity={glow} />
      </Stage>
      <div style={{ position: 'absolute', left: 1200, top: 600, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['8', '12', '16', '18', '20'];

/** Bank figure: ABC, dashed medians, G, EF, E and F, and 24. */
const BankFig: React.FC<{ g: Tri; draw: number; meds: number; gOp: number; efOp: number; twenty4?: string; yellow?: number }> = ({ g, draw, meds, gOp, efOp, twenty4 = C.ink }) => (
  <>
    <Outline g={g} draw={draw} />
    <Meds g={g} am={meds} bl={meds} cp={meds} />
    <Ln a={g.E} b={g.F} p={efOp} color={C.violet} width={7} />
    <Dot p={g.E} color={C.violet} opacity={efOp} />
    <Dot p={g.F} color={C.violet} opacity={efOp} />
    <Lab p={add(outAB(g, 2 / 3, 52), 0, 0)} text="E" color={C.violet} opacity={efOp} />
    <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} opacity={efOp} />
    <Dot p={g.G} opacity={gOp} />
    <Lab p={add(g.G, -30, 44)} text="G" opacity={gOp} />
    <Lab p={[905, 828]} text="24" color={twenty4} opacity={draw} />
  </>
);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const med = bump(f, at(scene, 2, 0.5), 60);
  return (
    <>
      <div style={{ position: 'absolute', left: PANEL, top: 120, width: 730, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 40, fontWeight: 600, lineHeight: 1.42, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        In triangle ABC, <Mark on={at(scene, 1, 0.55)}>BC = 24.</Mark> <Mark on={at(scene, 2, 0.2)}>The three medians meet at G.</Mark> A median joins a corner to the middle of the opposite side. <Mark on={at(scene, 3, 0.4)}>A segment through G, parallel to BC, has ends E and F on the other two sides.</Mark> <Mark on={at(scene, 4, 0.2)}>How long is EF?</Mark>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 700, display: 'flex', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 5, 0.25 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '10px 20px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 36, marginRight: 8 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <BankFig g={g} draw={ease(f, 6, 22)} meds={ease(f, at(scene, 2, 0.15), 24)} gOp={ease(f, at(scene, 2, 0.3), 10)} efOp={ease(f, at(scene, 3, 0.2), 20)} twenty4={f >= at(scene, 1, 0.55) ? C.primary : C.ink} />
        <Ln a={g.A} b={g.M} color={C.blue} width={9} opacity={med} />
        <Dot p={g.M} color={C.blue} r={13} opacity={med} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const bc = bump(f, at(scene, 1, 0.1), 200);
  const par = ease(f, at(scene, 1, 0.5), 10);
  const q = ease(f, at(scene, 2, 0.2), 12);
  const m = lerp(g.A, g.G, 0.5);
  return (
    <>
      <Stage>
        <Outline g={g} />
        <Meds g={g} />
        <Ln a={g.B} b={g.C} color={C.primary} width={11} opacity={bc} />
        <Ln a={g.E} b={g.F} color={C.violet} width={7} />
        <Dot p={g.E} color={C.violet} />
        <Dot p={g.F} color={C.violet} />
        <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} />
        <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} />
        <Dot p={g.G} />
        <Lab p={add(g.G, -30, 44)} text="G" />
        <Lab p={[905, 828]} text="24" color={f >= at(scene, 1, 0.1) ? C.primary : C.ink} />
        <Chev a={g.B} b={g.C} t={0.2} n={2} color={C.violet} opacity={par} />
        <Chev a={g.E} b={g.F} t={0.2} n={2} color={C.violet} opacity={par} />
        {q > 0 && (
          <g opacity={q}>
            <Ln a={g.A} b={g.G} color={C.violet} width={9} />
            <circle cx={m[0] - 46} cy={m[1]} r={34} fill={C.violet} />
            <text x={m[0] - 46} y={m[1] + 2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={48} textAnchor="middle" dominantBaseline="middle">
              ?
            </text>
          </g>
        )}
      </Stage>
      <Text x={PANEL} y={150} w={700} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 0, 0.2))}>
        What we know
      </Text>
      <div style={{ position: 'absolute', left: PANEL, top: 240, display: 'flex', alignItems: 'center', gap: 22, fontSize: 48, fontWeight: 800, ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Tex tex={'BC = 24'} size={56} />
      </div>
      <Eq y={350} start={at(scene, 1, 0.5)} color={C.violet} tex={'EF \\parallel BC'} />
      <Eq y={460} start={at(scene, 1, 0.75)} tex={'EF \\text{ passes through } G'} size={50} />
      <GoalChip y={620} start={at(scene, 2, 0.3)} tex={'\\text{How far down is } G\\,?'} />
    </>
  );
};

const makePause = (seconds: number, prompt: string, vari: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const g = vari ? V : T;
  return (
    <>
      <Stage>
        <Outline g={g} />
        <Meds g={g} />
        <Ln a={g.E} b={g.F} color={C.violet} width={7} />
        <Dot p={g.E} color={C.violet} />
        <Dot p={g.F} color={C.violet} />
        <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} />
        <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} />
        <Dot p={g.G} />
        <Lab p={add(g.G, -30, 44)} text="G" />
        {vari ? (
          <>
            <Ln a={g.P} b={g.L} color={C.amber} width={8} />
            <Lab p={[g.G[0] + 120, 470]} text="21" color={C.amber} />
            <Badge p={[g.G[0] - 140, g.G[1]]} text="?" />
          </>
        ) : (
          <Lab p={[905, 828]} text="24" />
        )}
      </Stage>
      <Text x={PANEL - 20} y={125} w={720} size={40} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} />
    </>
  );
};

const Midline: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const ml = ease(f, at(scene, 1, 0.1), 18);
  const s = 1 - 0.5 * ease(f, at(scene, 2, 0.2), Math.round(scene.lines[2].frames * 0.55));
  const cp = ease(f, at(scene, 2, 0.1), 8) * (1 - 0 * s);
  const Ap = lerp(g.C, g.A, s);
  const Bp = lerp(g.C, g.B, s);
  const par = ease(f, at(scene, 3, 0.15), 10);
  const mOp = ease(f, at(scene, 0, 0.45), 10);
  const lOp = ease(f, at(scene, 0, 0.8), 10);
  return (
    <>
      <Stage>
        <Fill pts={[g.C, Ap, Bp]} color={C.violet} opacity={cp} fo={0.22} stroke={7} />
        <Outline g={g} />
        <Tk a={g.B} b={g.M} opacity={mOp} />
        <Tk a={g.M} b={g.C} opacity={mOp} />
        <Tk a={g.A} b={g.L} n={2} opacity={lOp} />
        <Tk a={g.L} b={g.C} n={2} opacity={lOp} />
        <Dot p={g.M} opacity={mOp} />
        <Lab p={add(g.M, 0, 38)} text="M" opacity={mOp} />
        <Dot p={g.L} opacity={lOp} />
        <Lab p={outAC(g, 0.5, 48)} text="L" opacity={lOp} />
        <Ln a={g.M} b={g.L} p={ml} color={C.violet} width={9} />
        <Chev a={g.L} b={g.M} t={0.5} color={C.violet} opacity={par} />
        <Chev a={g.A} b={g.B} t={0.5} color={C.violet} opacity={par} />
        <Dot p={Ap} color={C.violet} r={13} opacity={cp} />
        <Dot p={Bp} color={C.violet} r={13} opacity={cp} />
      </Stage>
      <Text x={PANEL} y={150} w={700} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 2, 0.1))}>
        Shrink to half size, toward C
      </Text>
      <Text x={PANEL} y={230} w={700} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 2, 0.75))}>
        A lands on L, B lands on M
      </Text>
      <Eq y={420} start={at(scene, 3, 0.35)} color={C.violet} size={52} tex={'ML = \\dfrac{1}{2}AB,\\ ML \\parallel AB'} />
    </>
  );
};

const Bowtie: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const med = ease(f, at(scene, 0, 0.1), 20);
  const big = ease(f, at(scene, 1, 0.1), 14);
  const small = ease(f, at(scene, 1, 0.6), 14);
  const z1 = ease(f, at(scene, 2, 0.1), 14) * fadeTo(f, at(scene, 3, 0.0), 0.0);
  const z1k = ease(f, at(scene, 2, 0.1), 14);
  const z2 = ease(f, at(scene, 3, 0.1), 14);
  const half = ease(f, at(scene, 4, 0.15), 14);
  const lab = ease(f, at(scene, 5, 0.3), 10);
  void z1;
  return (
    <>
      <Stage>
        <Fill pts={[g.G, g.A, g.B]} color={C.violet} opacity={big} fo={0.2} />
        <Fill pts={[g.G, g.M, g.L]} color={C.amber} opacity={small} fo={0.4} />
        <Zig pts={[g.B, g.A, g.M, g.L]} color={C.violet} opacity={z1k * fadeTo(f, at(scene, 3, 0.0), 0.35)} />
        <Zig pts={[g.A, g.B, g.L, g.M]} color={C.amber} opacity={z2} />
        <Outline g={g} />
        <Ln a={g.M} b={g.L} color={C.ink} width={6} />
        <Ln a={g.A} b={g.M} p={med} color={C.blue} width={8} />
        <Ln a={g.B} b={g.L} p={med} color={C.blue} width={8} />
        <Dot p={g.M} />
        <Dot p={g.L} />
        <Dot p={g.G} r={13} opacity={med} />
        <Lab p={add(g.M, 0, 38)} text="M" />
        <Lab p={outAC(g, 0.5, 48)} text="L" />
        <Lab p={add(g.G, -30, 44)} text="G" opacity={med} />
        <Arc v={g.A} p1={g.B} p2={g.M} r={90} color={C.violet} opacity={z1k} />
        <Arc v={g.M} p1={g.L} p2={g.A} r={90} color={C.violet} opacity={z1k} />
        <Arc v={g.B} p1={g.A} p2={g.L} r={110} color={C.amber} opacity={z2} />
        <Arc v={g.L} p1={g.M} p2={g.B} r={90} color={C.amber} opacity={z2} />
        <Lab p={[g.A[0] - 14, 405]} text="2" color={C.violet} size={56} opacity={lab} />
        <Lab p={[g.G[0] - 30, 693]} text="1" color={C.violet} size={56} opacity={lab} />
        <Chev a={g.A} b={g.B} t={0.5} color={C.ink} opacity={z1k} />
        <Chev a={g.L} b={g.M} t={0.5} color={C.ink} opacity={z1k} />
      </Stage>
      <Text x={PANEL} y={110} w={700} size={40} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.1))}>
        big end <span style={{ color: C.violet }}>GAB</span> · small end <span style={{ color: C.amber }}>GML</span>
      </Text>
      <Eq y={195} start={at(scene, 2, 0.5)} color={C.violet} size={50} tex={'\\angle BAM = \\angle LMA'} />
      <Eq y={295} start={at(scene, 3, 0.5)} color={C.amber} size={50} tex={'\\angle ABL = \\angle MLB'} />
      <Pill x={PANEL} y={400} color={C.amber} style={{ ...fadeUp(f, at(scene, 4, 0.25)), fontSize: 44 }}>
        {'GML is a ½-size copy of GAB'}
      </Pill>
      <Eq y={520} start={at(scene, 5, 0.4)} size={58} tex={'AG : GM = 2 : 1'} />
      <Eq y={650} start={at(scene, 6, 0.4)} size={62} color={C.green} tex={'AG = \\dfrac{2}{3}AM'} />
      <div style={{ opacity: half * 0 }} />
    </>
  );
};

const Ef: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const s0 = at(scene, 1, 0.15);
  const s = 1 - (1 / 3) * ease(f, s0, at(scene, 2, 0.65) - s0);
  const Bp = lerp(g.A, g.B, s);
  const Cp = lerp(g.A, g.C, s);
  const Mp = lerp(g.A, g.M, s);
  const aef = bump(f, at(scene, 0, 0.3), at(scene, 1, 0.1) - at(scene, 0, 0.3));
  const cp = ease(f, s0, 10);
  const fin = at(scene, 4, 0.97);
  return (
    <>
      <Stage>
        <Fill pts={[g.A, g.E, g.F]} color={C.green} opacity={aef} fo={0.3} />
        <Fill pts={[g.A, Bp, Cp]} color={C.violet} opacity={cp} fo={0.16} stroke={7} />
        <Outline g={g} />
        <Ln a={g.A} b={g.M} p={1} dashed color={C.muted} />
        <Ln a={g.E} b={g.F} color={C.violet} width={8} />
        <Dot p={g.E} color={C.violet} />
        <Dot p={g.F} color={C.violet} />
        <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} />
        <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} />
        <Dot p={g.G} />
        <Lab p={add(g.G, -30, 44)} text="G" />
        <Dot p={g.M} opacity={1 - cp} />
        <Lab p={add(g.M, 0, 38)} text="M" opacity={1 - cp} />
        <Dot p={Mp} color={C.violet} r={14} opacity={cp} />
        <Lab p={add(Mp, 40, -2)} text="M" color={C.violet} opacity={cp * (1 - ease(f, at(scene, 2, 0.8), 8))} />
        <Lab p={[905, 828]} text="24" />
        <Lab p={add(g.G, 0, -1)} text="" />
      </Stage>
      <Eq y={130} start={at(scene, 0, 0.5)} size={52} tex={'\\triangle AEF \\sim \\triangle ABC'} />
      <Text x={PANEL} y={225} w={700} size={42} weight={800} color={C.violet} style={fadeUp(f, at(scene, 1, 0.1))}>
        shrink toward A until BC sits on EF
      </Text>
      <Eq y={330} start={at(scene, 3, 0.5)} size={62} color={C.violet} tex={'\\text{scale} = \\dfrac{2}{3}'} />
      <Eq y={520} start={at(scene, 4, 0.3)} size={62} color={C.green} tex={'\\dfrac{2}{3}\\times 24 = 16'} />
      <AnswerChip x={1500} y={690} start={fin} text="C: 16" />
    </>
  );
};

const Areas: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const PX = 1300;
  const foot: Pt = [g.A[0], 790];
  const hOp = ease(f, at(scene, 2, 0.25), 12) * fadeTo(f, at(scene, 3, 0.0));
  const mOp = ease(f, at(scene, 1, 0.2), 12);
  const lOp = ease(f, at(scene, 5, 0.1), 12);
  const abm = ease(f, at(scene, 3, 0.2), 12) * fadeTo(f, at(scene, 3, 0.62));
  const gbm = ease(f, at(scene, 3, 0.65), 12) * fadeTo(f, at(scene, 4, 0.0));
  const abg4 = ease(f, at(scene, 4, 0.1), 12) * fadeTo(f, at(scene, 5, 0.0));
  const abg5 = ease(f, at(scene, 5, 0.2), 12) * fadeTo(f, at(scene, 6, 0.0));
  const three = ease(f, at(scene, 6, 0.1), 14);
  const gbc = ease(f, at(scene, 7, 0.1), 12);
  const ruler = ease(f, at(scene, 7, 0.3), 16);
  const ef = ease(f, at(scene, 7, 0.5), 16);
  const RX = 1090;
  const yA = g.A[1];
  const yG = g.G[1];
  const yB = 790;
  return (
    <>
      <Stage>
        {/* halves of the median AM */}
        <Fill pts={[g.A, g.B, g.M]} color={C.violet} opacity={abm} fo={0.28} />
        <Fill pts={[g.A, g.C, g.M]} color={C.amber} opacity={abm} fo={0.28} />
        <Fill pts={[g.G, g.B, g.M]} color={C.violet} opacity={gbm} fo={0.4} />
        <Fill pts={[g.G, g.C, g.M]} color={C.amber} opacity={gbm} fo={0.4} />
        <Fill pts={[g.A, g.B, g.G]} color={C.violet} opacity={abg4} fo={0.32} />
        <Fill pts={[g.A, g.C, g.G]} color={C.amber} opacity={abg4} fo={0.32} />
        <Fill pts={[g.A, g.B, g.G]} color={C.violet} opacity={abg5} fo={0.32} />
        <Fill pts={[g.B, g.C, g.G]} color={C.blue} opacity={abg5} fo={0.32} />
        <Fill pts={[g.A, g.B, g.G]} color={C.violet} opacity={three * (1 - 0.65 * gbc)} fo={0.34} />
        <Fill pts={[g.B, g.C, g.G]} color={C.amber} opacity={three * (1 - 0)} fo={0.34} />
        <Fill pts={[g.A, g.C, g.G]} color={C.primary} opacity={three * (1 - 0.65 * gbc)} fo={0.34} />
        <Outline g={g} />
        <Ln a={g.A} b={g.M} dashed color={C.muted} width={5} opacity={1} />
        <Ln a={g.B} b={g.L} dashed color={C.muted} width={5} opacity={lOp} />
        <Dot p={g.M} opacity={mOp} />
        <Lab p={add(g.M, 0, 38)} text="M" opacity={mOp} />
        <Tk a={g.B} b={g.M} opacity={mOp * ease(f, at(scene, 2, 0.0), 8)} />
        <Tk a={g.M} b={g.C} opacity={mOp * ease(f, at(scene, 2, 0.0), 8)} />
        <Dot p={g.L} opacity={lOp} />
        <Lab p={outAC(g, 0.5, 48)} text="L" opacity={lOp} />
        <Dot p={g.G} opacity={ease(f, at(scene, 3, 0.65), 8)} r={12} />
        <Lab p={add(g.G, -30, 44)} text="G" opacity={ease(f, at(scene, 3, 0.65), 8)} />
        {/* height of A */}
        <Ln a={g.A} b={foot} dashed color={C.ink} width={5} opacity={hOp} />
        <RightAngle at={foot} u={[1, 0]} v={[0, -1]} opacity={hOp} />
        <Lab p={[g.A[0] - 30, 440]} text="h" size={52} opacity={hOp} />
        {/* ruler */}
        <g opacity={ruler}>
          <line x1={RX} y1={yA} x2={RX} y2={yB} stroke={C.ink} strokeWidth={4} />
          {[yA, yG, yB].map((y) => (
            <line key={y} x1={RX - 18} y1={y} x2={RX + 18} y2={y} stroke={C.ink} strokeWidth={5} />
          ))}
          <line x1={RX + 14} y1={yA + 3} x2={RX + 14} y2={yG - 3} stroke={C.violet} strokeWidth={10} strokeLinecap="round" />
          <line x1={RX + 14} y1={yG + 3} x2={RX + 14} y2={yB - 3} stroke={C.amber} strokeWidth={10} strokeLinecap="round" />
          <line x1={g.A[0]} y1={yA} x2={RX} y2={yA} stroke={C.muted} strokeWidth={3} strokeDasharray="8 8" />
        </g>
        <Ln a={g.E} b={g.F} color={C.violet} width={8} opacity={ef} />
        <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} opacity={ef} />
        <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} opacity={ef} />
        <Fill pts={[g.B, g.C, g.G]} color={C.amber} opacity={gbc * (1 - three) * 0} fo={0.3} />
      </Stage>
      <TexAt x={RX + 34} y={(yA + yG) / 2} tex={'\\dfrac{2}{3}h'} color={C.violet} size={48} opacity={ruler} />
      <TexAt x={RX + 34} y={(yG + yB) / 2} tex={'\\dfrac{1}{3}h'} color={C.amber} size={48} opacity={ruler} />
      <Text x={PX} y={112} w={560} size={40} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.2)), opacity: ease(f, at(scene, 1, 0.2), 12) * fadeTo(f, at(scene, 2, 0.0)) }}>
        AM: a median
      </Text>
      <div style={{ opacity: fadeTo(f, at(scene, 9, 0.05)) }}>
      <Eq x={PX} y={112} start={at(scene, 3, 0.35)} size={48} tex={'[ABM] = [ACM]'} />
      <Eq x={PX} y={197} start={at(scene, 3, 0.8)} size={48} tex={'[GBM] = [GCM]'} />
      <Eq x={PX} y={282} start={at(scene, 4, 0.5)} size={48} color={C.violet} tex={'[ABG] = [ACG]'} />
      <Eq x={PX} y={367} start={at(scene, 5, 0.6)} size={48} color={C.violet} tex={'[ABG] = [BCG]'} />
      <Eq x={PX} y={455} start={at(scene, 7, 0.15)} size={48} color={C.amber} tex={'[GBC] = \\dfrac{1}{3}[ABC]'} />
      <Eq x={PX} y={565} start={at(scene, 7, 0.65)} size={48} color={C.amber} tex={'h_G = \\dfrac{1}{3}h'} />
      <Eq x={PX} y={700} start={at(scene, 8, 0.55)} size={48} color={C.green} tex={'EF = \\dfrac{2}{3}\\times 24 = 16'} />
      </div>
      <Pill x={PX - 20} y={330} color={C.primary} style={{ ...fadeUp(f, at(scene, 9, 0.3)), whiteSpace: 'normal', width: 560, textAlign: 'center', borderRadius: 40, fontSize: 48, opacity: ease(f, at(scene, 9, 0.3), 12) }}>
        Best for: areas, or a double-check
      </Pill>
      <div style={{ opacity: 0 * gbc }} />
    </>
  );
};

const levelY = (k: number) => T.A[1] + (T.M[1] - T.A[1]) * k; // k of the way down the median

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const stops: [number, number][] = [
    [at(scene, 1, 0.1), 404.7],
    [at(scene, 2, 0.1), 501],
    [at(scene, 3, 0.1), 645.5],
    [at(scene, 4, 0.1), 693.7],
    [at(scene, 5, 0.3), g.G[1]],
  ];
  let y = g.G[1];
  for (const [s, ty] of stops) y = y + (ty - y) * ease(f, s, 22);
  const t = (y - g.A[1]) / (g.B[1] - g.A[1]);
  const E = lerp(g.A, g.B, t);
  const F = lerp(g.A, g.C, t);
  const flipped = bump(f, at(scene, 1, 0.1), at(scene, 2, 0.0) - at(scene, 1, 0.1));
  const ghost = lerp(g.A, g.M, 1 / 3);
  const mid = bump(f, at(scene, 2, 0.4), at(scene, 3, 0.0) - at(scene, 2, 0.4));
  const trueG = ease(f, at(scene, 5, 0.3), 12);
  const lines = (i: number) => (f >= stops[i][0] && f < (stops[i + 1]?.[0] ?? 1e9) ? 1 : 0);
  const colr = f >= at(scene, 5, 0.3) ? C.green : C.red;
  const row = (i: number, yy: number, label: string, tex: string, start: number) => (
    <div key={i} style={{ position: 'absolute', left: PANEL, top: yy, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <div style={{ background: C.red, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 44, fontWeight: 900, minWidth: 130, textAlign: 'center' }}>{label}</div>
      <Tex tex={tex} size={50} />
    </div>
  );
  void lines;
  return (
    <>
      <Stage>
        <Outline g={g} />
        <Meds g={g} am={1} bl={1} cp={1} />
        <Lab p={[905, 828]} text="24" />
        <Ln a={E} b={F} color={colr} width={8} opacity={ease(f, at(scene, 0, 0.7), 12)} />
        <Dot p={E} color={colr} opacity={ease(f, at(scene, 0, 0.7), 12)} />
        <Dot p={F} color={colr} opacity={ease(f, at(scene, 0, 0.7), 12)} />
        <Dot p={g.G} opacity={1 - ease(f, at(scene, 1, 0.1), 8) * (1 - trueG)} />
        <Lab p={add(g.G, -30, 44)} text="G" opacity={1 - ease(f, at(scene, 1, 0.1), 8) * (1 - trueG)} />
        {/* trap 8: 2 and 1 swapped */}
        <g opacity={flipped}>
          <circle cx={ghost[0]} cy={ghost[1]} r={20} fill="none" stroke={C.red} strokeWidth={7} strokeDasharray="8 7" />
          <Lab p={[ghost[0] - 40, (g.A[1] + ghost[1]) / 2]} text="1" color={C.red} size={52} />
          <Lab p={[ghost[0] - 40, (ghost[1] + g.M[1]) / 2]} text="2" color={C.red} size={52} />
        </g>
        {/* trap 12: the middles */}
        <g opacity={mid}>
          <Dot p={g.P} color={C.red} r={13} />
          <Dot p={g.L} color={C.red} r={13} />
        </g>
        <g opacity={trueG}>
          <Lab p={[g.A[0] - 30, (g.A[1] + g.G[1]) / 2]} text="2" color={C.green} size={52} />
          <Lab p={[g.G[0] - 50, (g.G[1] + g.M[1]) / 2 + 10]} text="1" color={C.green} size={52} />
          <circle cx={g.G[0]} cy={g.G[1]} r={26} fill="none" stroke={C.green} strokeWidth={8} />
        </g>
      </Stage>
      {row(0, 100, 'A  8', '\\dfrac{1}{3}\\times 24 = 8', at(scene, 1, 0.3))}
      {row(1, 240, 'B  12', '\\dfrac{1}{2}\\times 24 = 12', at(scene, 2, 0.3))}
      {row(2, 380, 'D  18', '\\dfrac{3}{4}\\times 24 = 18', at(scene, 3, 0.35))}
      {row(3, 520, 'E  20', '\\dfrac{5}{6}\\times 24 = 20', at(scene, 4, 0.35))}
      <div style={{ position: 'absolute', left: PANEL, top: 670, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap', background: C.card, border: `5px solid ${C.green}`, borderRadius: 24, padding: '8px 26px', boxShadow: '0 6px 24px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 5, 0.45)) }}>
        <div style={{ background: C.green, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 44, fontWeight: 900 }}>C  16</div>
        <Tex tex={'\\dfrac{2}{3}\\times 24 = 16'} size={50} />
      </div>
      <div style={{ display: 'none' }}>{levelY(0)}</div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = V;
  return (
    <>
      <Stage>
        <Outline g={g} draw={ease(f, 4, 22)} />
        <Meds g={g} am={ease(f, 10, 22)} bl={ease(f, 16, 22)} cp={ease(f, 22, 22)} />
        <Ln a={g.P} b={g.L} p={ease(f, at(scene, 1, 0.15), 16)} color={C.amber} width={8} />
        <Dot p={g.P} color={C.amber} opacity={ease(f, at(scene, 1, 0.1), 8)} />
        <Dot p={g.L} color={C.amber} opacity={ease(f, at(scene, 1, 0.1), 8)} />
        <Lab p={[g.G[0] + 120, 470]} text="21" color={C.amber} opacity={ease(f, at(scene, 1, 0.7), 10)} />
        <Dot p={g.G} opacity={ease(f, at(scene, 2, 0.1), 10)} />
        <Lab p={add(g.G, -30, 44)} text="G" opacity={ease(f, at(scene, 2, 0.1), 10)} />
        <Ln a={g.E} b={g.F} p={ease(f, at(scene, 2, 0.2), 18)} color={C.violet} width={7} />
        <Dot p={g.E} color={C.violet} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Dot p={g.F} color={C.violet} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Badge p={[g.G[0] - 140, g.G[1]]} text="?" opacity={ease(f, at(scene, 2, 0.6), 10)} />
      </Stage>
      <Text x={PANEL} y={120} w={700} size={44} weight={900} color={C.muted} style={fadeUp(f, 0)}>
        A new triangle
      </Text>
      <Eq y={210} start={at(scene, 1, 0.5)} color={C.amber} size={52} tex={'\\text{middle segment} = 21'} />
      <GoalChip y={340} start={at(scene, 2, 0.6)} tex={'EF = \\,?'} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = V;
  const fin = at(scene, 2, 0.97);
  const bc = ease(f, at(scene, 0, 0.6), 10);
  return (
    <>
      <Stage>
        <Outline g={g} />
        <Meds g={g} />
        <Ln a={g.P} b={g.L} color={C.amber} width={8} />
        <Dot p={g.P} color={C.amber} />
        <Dot p={g.L} color={C.amber} />
        <Lab p={[g.G[0] + 120, 470]} text="21" color={C.amber} />
        <Ln a={g.B} b={g.C} color={C.primary} width={11} opacity={bc} />
        <Lab p={[g.M[0] + 220, 828]} text="42" color={C.primary} opacity={bc} />
        <Ln a={g.E} b={g.F} color={C.violet} width={7} />
        <Dot p={g.E} color={C.violet} />
        <Dot p={g.F} color={C.violet} />
        <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} />
        <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} />
        <Dot p={g.G} />
        <Lab p={add(g.G, -30, 44)} text="G" />
        <Badge p={[g.G[0] - 140, g.G[1]]} text="28" color={C.green} opacity={ease(f, at(scene, 2, 0.97), 10)} />
      </Stage>
      <Eq y={130} start={at(scene, 0, 0.45)} size={56} color={C.amber} tex={'BC = 2\\times 21 = 42'} />
      <Eq y={260} start={at(scene, 1, 0.5)} size={56} tex={'EF = \\dfrac{2}{3}\\,BC'} />
      <Eq y={440} start={at(scene, 2, 0.2)} size={58} color={C.green} tex={'EF = \\dfrac{2}{3}\\times 42 = 28'} />
      <AnswerChip x={1500} y={640} start={fin} text="28" />
      <Pill x={PANEL + 60} y={740} color={C.primary} style={{ ...fadeUp(f, at(scene, 3, 0.3)), fontSize: 44 }}>
        Amazing work!
      </Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const out = fadeTo(f, at(scene, 3, 0));
  const tk = ease(f, at(scene, 1, 0.3), 12);
  const ef = ease(f, at(scene, 2, 0.3), 16);
  const L2 = (p: Pt, text: string) => <Lab p={p} text={text} color={C.green} size={52} opacity={tk} />;
  return (
    <>
      <div style={{ opacity: out }}>
        <Stage>
          <Outline g={g} draw={ease(f, 0, 18)} />
          <Meds g={g} am={ease(f, 8, 22)} bl={ease(f, 16, 22)} cp={ease(f, 24, 22)} color={C.ink} />
          <Ln a={g.E} b={g.F} p={ef} color={C.violet} width={8} />
          <Dot p={g.E} color={C.violet} opacity={ef} />
          <Dot p={g.F} color={C.violet} opacity={ef} />
          <Lab p={outAB(g, 2 / 3, 52)} text="E" color={C.violet} opacity={ef} />
          <Lab p={outAC(g, 2 / 3, 52)} text="F" color={C.violet} opacity={ef} />
          <Dot p={g.G} r={14} opacity={ease(f, 30, 10)} />
          {L2([483, 405], '2')}
          {L2([531, 693], '1')}
          {L2([331, 656], '2')}
          {L2([644, 511], '1')}
          {L2([782, 732], '2')}
          {L2([451, 510], '1')}
        </Stage>
        <Text x={PANEL} y={105} w={700} size={48} weight={900} color={C.primary} style={fadeUp(f, 4)}>
          The big idea
        </Text>
        <Text x={PANEL} y={195} w={700} size={48} weight={800} style={fadeUp(f, at(scene, 1, 0.2))}>
          G splits each median <span style={{ color: C.green }}>2 : 1</span>, the long part at the corner.
        </Text>
        <Eq y={395} start={at(scene, 1, 0.6)} size={58} color={C.green} tex={'AG = \\dfrac{2}{3}\\,AM'} />
        <Text x={PANEL} y={545} w={700} size={48} weight={800} color={C.violet} style={fadeUp(f, at(scene, 2, 0.2))}>
          A parallel through G:
        </Text>
        <Eq y={615} start={at(scene, 2, 0.4)} size={58} color={C.violet} tex={'EF = \\dfrac{2}{3}\\,BC'} />
      </div>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'BC = 24. EF is parallel to BC and passes through G. Find EF.', false),
  midline: Midline,
  bowtie: Bowtie,
  ef: Ef,
  areas: Areas,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'The segment joining the middles of AB and AC is 21. EF passes through G, parallel to BC. Find EF.', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

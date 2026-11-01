import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-bisector-parallel';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

type Pt = [number, number];

// ---------- geometry (maths coordinates, y up; mapped to the screen with y flipped) ----------

type Geo = { B: Pt; C: Pt; A: Pt; F: Pt; topL: number; topR: number };

/** Same formula as verify.py solve(): F = bisector of angle B meets the line through A parallel to BC. */
const solve = (B: Pt, Cc: Pt, A: Pt): Pt => {
  const dAB = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const dCB = Math.hypot(Cc[0] - B[0], Cc[1] - B[1]);
  const dx = (A[0] - B[0]) / dAB + (Cc[0] - B[0]) / dCB;
  const dy = (A[1] - B[1]) / dAB + (Cc[1] - B[1]) / dCB;
  const t = (A[1] - B[1]) / dy;
  return [B[0] + t * dx, B[1] + t * dy];
};

const MB: Pt = [0, 0];
const MC: Pt = [12, 0];
const MA: Pt = [6, 8];
const MAIN: Geo = { B: MB, C: MC, A: MA, F: solve(MB, MC, MA), topL: 2, topR: 18 };

const VB: Pt = [0, 0];
const VC: Pt = [10, 0];
const VA: Pt = [3.4, Math.sqrt(49 - 3.4 * 3.4)];
const VF = solve(VB, VC, VA);
const VAR: Geo = { B: VB, C: VC, A: VA, F: VF, topL: 0.6, topR: 13.4 };

const G10: Pt = [10, 0];
const FOOT: Pt = [6, 0];
const MIDAB: Pt = [3, 4];

const plane = (ox: number, oy: number, u: number) => (p: Pt): Pt => [ox + p[0] * u, oy - p[1] * u];
type PF = (p: Pt) => Pt;

const deg = (a: Pt, b: Pt) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; // maths angle a→b

const sub = (p: number, i: number, n: number) => Math.max(0, Math.min(1, p * n - i));
const pulse = (f: number, start: number, dur = 36) => Math.sin(Math.max(0, Math.min(1, (f - start) / dur)) * Math.PI);
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ---------- SVG primitives (take screen points) ----------

const Seg: React.FC<{ a: Pt; b: Pt; color?: string; w?: number; p?: number; op?: number; dash?: boolean }> = ({ a, b, color = C.ink, w = 7, p = 1, op = 1, dash = false }) =>
  p <= 0 || op <= 0 ? null : (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke={color} strokeWidth={w} strokeLinecap={dash ? 'butt' : 'round'} strokeDasharray={dash ? '16 12' : undefined} opacity={op} />
  );

const Dot: React.FC<{ p: Pt; r?: number; color?: string; op?: number }> = ({ p, r = 13, color = C.ink, op = 1 }) =>
  op <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r * Math.min(1, op * 1.2)} fill={color} opacity={op} stroke={C.bg} strokeWidth={3} />;

const Lbl: React.FC<{ p: Pt; t: string; color?: string; size?: number; op?: number; s?: number }> = ({ p, t, color = C.ink, size = 54, op = 1, s = 1 }) =>
  op <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={op} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={9} strokeLinejoin="round" transform={s === 1 ? undefined : `translate(${p[0]} ${p[1]}) scale(${s}) translate(${-p[0]} ${-p[1]})`}>
      {t}
    </text>
  );

/** Point on the side of segment a-b that faces away from `away`, `off` px from the midpoint. */
const outPt = (a: Pt, b: Pt, away: Pt, off: number, t = 0.5): Pt => {
  const m = lerp(a, b, t);
  let nx = -(b[1] - a[1]);
  let ny = b[0] - a[0];
  const n = Math.hypot(nx, ny);
  nx /= n;
  ny /= n;
  if ((m[0] - away[0]) * nx + (m[1] - away[1]) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  return [m[0] + nx * off, m[1] + ny * off];
};

const Tick: React.FC<{ a: Pt; b: Pt; n?: number; color?: string; op?: number; t?: number }> = ({ a, b, n = 1, color = C.ink, op = 1, t = 0.5 }) => {
  if (op <= 0) return null;
  const m = lerp(a, b, t);
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / d;
  const uy = (b[1] - a[1]) / d;
  const nx = -uy;
  const ny = ux;
  return (
    <g opacity={op} stroke={color} strokeWidth={7} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const c: Pt = [m[0] + ux * (i - (n - 1) / 2) * 16, m[1] + uy * (i - (n - 1) / 2) * 16];
        return <line key={i} x1={c[0] - nx * 18} y1={c[1] - ny * 18} x2={c[0] + nx * 18} y2={c[1] + ny * 18} />;
      })}
    </g>
  );
};

/** Parallel-line chevrons (>>) on a segment. */
const Chev: React.FC<{ a: Pt; b: Pt; t?: number; color?: string; op?: number }> = ({ a, b, t = 0.5, color = C.amber, op = 1 }) => {
  if (op <= 0) return null;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / d;
  const uy = (b[1] - a[1]) / d;
  const m = lerp(a, b, t);
  const one = (k: number) => {
    const q: Pt = [m[0] + ux * k, m[1] + uy * k];
    return `M ${q[0] - ux * 20 - uy * 20} ${q[1] - uy * 20 + ux * 20} L ${q[0]} ${q[1]} L ${q[0] - ux * 20 + uy * 20} ${q[1] - uy * 20 - ux * 20}`;
  };
  return <path d={`${one(-12)} ${one(14)}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
};

/** Angle arc at screen vertex v from maths angle a0 up to a1 (degrees, a1 > a0), optional wedge fill and label. */
const Arc: React.FC<{ v: Pt; a0: number; a1: number; r: number; color?: string; op?: number; w?: number; fill?: string; fillOp?: number; label?: string; lr?: number; lcolor?: string; p?: number; s?: number }> = ({
  v, a0, a1, r, color = C.violet, op = 1, w = 8, fill, fillOp = 0.25, label, lr, lcolor, p = 1, s = 1,
}) => {
  if (op <= 0 || p <= 0) return null;
  const pt = (a: number, rr: number): Pt => [v[0] + rr * Math.cos((a * Math.PI) / 180), v[1] - rr * Math.sin((a * Math.PI) / 180)];
  const s0 = pt(a0, r);
  const s1 = pt(a1, r);
  const arc = `A ${r} ${r} 0 0 0 ${s1[0]} ${s1[1]}`;
  const am = (a0 + a1) / 2;
  return (
    <g opacity={op}>
      {fill && <path d={`M ${v[0]} ${v[1]} L ${s0[0]} ${s0[1]} ${arc} Z`} fill={fill} opacity={fillOp} />}
      <path d={`M ${s0[0]} ${s0[1]} ${arc}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {label && p > 0.7 && <Lbl p={pt(am, lr ?? r + 56)} t={label} color={lcolor ?? color} size={70} s={s} />}
    </g>
  );
};

// ---------- the main figure ----------

type FigP = {
  P: PF; g: Geo; tri?: number; top?: number; bis?: number; lens?: [number, number, number]; txt?: [string, string, string];
  pts?: { A?: number; B?: number; C?: number; F?: number }; bisColor?: string; dim?: number;
};

const Fig: React.FC<FigP> = ({ P, g, tri = 1, top = 1, bis = 1, lens = [0, 0, 0], txt = ['10', '10', '12'], pts = {}, bisColor = C.violet }) => {
  const { A, B, C: Cc, F } = g;
  const pA = P(A);
  const pB = P(B);
  const pC = P(Cc);
  const pF = P(F);
  const tl = P([g.topL, A[1]]);
  const tr = P([g.topR, A[1]]);
  const po = { A: 1, B: 1, C: 1, F: 1, ...pts };
  const cen: Pt = [(pA[0] + pB[0] + pC[0]) / 3, (pA[1] + pB[1] + pC[1]) / 3];
  const lo = 54;
  return (
    <g>
      <Seg a={pA} b={pB} p={sub(tri, 0, 3)} />
      <Seg a={pB} b={pC} p={sub(tri, 1, 3)} />
      <Seg a={pC} b={pA} p={sub(tri, 2, 3)} />
      <Seg a={tl} b={tr} p={top} />
      <Seg a={pB} b={pF} p={bis} color={bisColor} w={7} />
      <Lbl p={outPt(pA, pB, cen, 70)} t={txt[0]} op={lens[0]} />
      <Lbl p={outPt(pC, pA, cen, lo, 0.22)} t={txt[1]} op={lens[1]} />
      <Lbl p={outPt(pB, pC, cen, lo)} t={txt[2]} op={lens[2]} />
      <Lbl p={[pA[0], pA[1] - 52]} t="A" op={po.A * tri} />
      <Lbl p={[pB[0] - 44, pB[1] + 40]} t="B" op={po.B * tri} />
      <Lbl p={[pC[0] + 44, pC[1] + 40]} t="C" op={po.C * tri} />
      <Lbl p={[pF[0], pF[1] - 52]} t="F" op={po.F} />
    </g>
  );
};

/** Equal-x arcs: at B (both halves) and at F, each with its own opacity/progress. */
const XArcs: React.FC<{ P: PF; g: Geo; r: number; b?: number; f?: number; bp?: number; fp?: number; fcolor?: string; s?: number; nl?: boolean }> = ({ P, g, r, b = 1, f = 1, bp = 1, fp = 1, fcolor = C.violet, s = 1, nl = false }) => {
  const pB = P(g.B);
  const pF = P(g.F);
  const aBF = deg(g.B, g.F);
  const aBA = deg(g.B, g.A);
  const aFB = 180 + aBF;
  return (
    <g>
      <Arc v={pB} a0={aBF} a1={aBA} r={r} op={b} p={bp} label={nl ? undefined : "x"} s={s} />
      <Arc v={pB} a0={0} a1={aBF} r={r} op={b} p={bp} label={nl ? undefined : "x"} s={s} />
      <Arc v={pF} a0={180} a1={aFB} r={r} op={f} p={fp} label={nl ? undefined : "x"} color={fcolor} s={s} />
    </g>
  );
};

const ZPath: React.FC<{ P: PF; g: Geo; p: number; op?: number }> = ({ P, g, p, op = 1 }) => {
  if (p <= 0 || op <= 0) return null;
  const pts = [P([g.A[0] - 0.3, g.A[1]]), P(g.F), P(g.B), P([g.C[0] + 0.3, 0])];
  return <path d={`M ${pts.map((q) => q.join(' ')).join(' L ')}`} fill="none" stroke={C.amber} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.42 * op} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
};

const Glow: React.FC<{ a: Pt; b: Pt; op: number; color?: string }> = ({ a, b, op, color = C.amber }) => <Seg a={a} b={b} color={color} w={24} op={0.42 * op} />;

// ---------- html helpers ----------

const Eq: React.FC<{ x: number; y: number; start: number; tex: string; size?: number }> = ({ x, y, start, tex, size = 58 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; start: number; color?: string; op?: number; size?: number; children: React.ReactNode }> = ({ x, y, w, start, color = C.primary, op = 1, size = 46, children }) => {
  const f = useCurrentFrame();
  const st = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '12px 30px', fontSize: size, fontWeight: 800, lineHeight: 1.3, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...st, opacity: (st.opacity as number) * op }}>
      {children}
    </div>
  );
};

const NW: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ whiteSpace: 'nowrap' }}>{children}</span>;

const TexI: React.FC<{ t: string; s?: number }> = ({ t, s = 46 }) => <Tex tex={t} size={s} />;

const QBox: React.FC<{ x: number; y: number; w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 30, padding: '26px 40px', fontSize: 44, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

const CHOICES = ['5', '6', '8', '10', '12'];

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(220, 700, 50);
  const g = MAIN;
  const e1 = at(scene, 1);
  const L0 = at(scene, 0);
  const drawn = ease(f, 6, L0 + (at(scene, 1) - L0) * 0.6 - 6);
  const glow = ease(f, e1 + 4, 14);
  const dim = ease(f, e1, 12);
  const pl = pulse(f, e1 + 10, 50);
  return (
    <>
      <Stage>
        <polygon points={[g.A, g.B, g.F].map((q) => P(q).join(',')).join(' ')} fill={C.primary} opacity={0.25 * glow * (0.7 + 0.3 * pl)} />
        <Fig P={P} g={g} tri={sub(drawn, 0, 2)} top={sub(drawn, 0.7, 2.2)} bis={sub(drawn, 1.2, 4)} lens={[ease(f, at(scene, 0, 0.7), 10), ease(f, at(scene, 0, 0.8), 10) * (1 - 0.7 * dim), ease(f, at(scene, 0, 0.9), 10) * (1 - 0.7 * dim)]} pts={{ F: ease(f, at(scene, 0, 0.8), 10) }} />
      </Stage>
      <div style={{ position: 'absolute', left: 1300, top: 330, ...fadeUp(f, at(scene, 2, 0.15)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(990, 770, 48);
  const g = MAIN;
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const A = P(g.A);
  const B = P(g.B);
  const Cc = P(g.C);
  const h1 = ease(f, at(scene, 1, 0.2), 10) * fadeTo(f, at(scene, 1, 0.55), 0, 10);
  const h2 = ease(f, at(scene, 1, 0.65), 10) * fadeTo(f, at(scene, 2), 0, 10);
  const hAF = pulse(f, at(scene, 4, 0.45), 40);
  return (
    <>
      <QBox x={60} y={130} w={880} style={{ opacity: ease(f, at(scene, 1) - 4, 10), minHeight: 360 }}>
        <span style={s(1)}>
          Triangle <TexI t="ABC" /> has <TexI t="AB = AC = 10" /> and <TexI t="BC = 12" />.{' '}
        </span>
        <span style={s(2)}>
          A line through <TexI t="A" /> is parallel to <TexI t="BC" />.{' '}
        </span>
        <span style={s(3)}>
          The bisector of <TexI t="\angle ABC" /> meets this line at <TexI t="F" />.{' '}
        </span>
        <span style={s(4)}>
          What is <Mark on={at(scene, 4, 0.3)}><TexI t="AF" /></Mark>?
        </span>
      </QBox>
      <div style={{ position: 'absolute', left: 60, top: 600, display: 'flex', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 5, 0.12 + i * 0.1), 10), background: C.card, borderRadius: 18, padding: '12px 26px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 36, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <Glow a={A} b={B} op={h1} />
        <Glow a={A} b={Cc} op={h1} />
        <Glow a={B} b={Cc} op={h2} />
        <Glow a={A} b={P(g.F)} op={hAF} />
        <Fig
          P={P}
          g={g}
          tri={ease(f, at(scene, 1), 40)}
          top={ease(f, at(scene, 2, 0.1), 24)}
          bis={ease(f, at(scene, 3, 0.1), 24)}
          lens={[ease(f, at(scene, 1, 0.45), 10), ease(f, at(scene, 1, 0.45), 10), ease(f, at(scene, 1, 0.8), 10)]}
          pts={{ F: ease(f, at(scene, 3, 0.7), 10) }}
        />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(330, 740, 60);
  const g = MAIN;
  const pA = P(g.A);
  const pF = P(g.F);
  const c0 = ease(f, at(scene, 0, 0.35), 12);
  const hl = pulse(f, at(scene, 2, 0.35), 50);
  const q = ease(f, at(scene, 2, 0.4), 10);
  const topL = P([g.topL, 8]);
  const topR = P([g.topR, 8]);
  return (
    <Stage>
      <Glow a={topL} b={topR} op={c0 * fadeTo(f, at(scene, 1), 0.3, 10)} />
      <Glow a={P([0, 0])} b={P([12, 0])} op={c0 * fadeTo(f, at(scene, 1), 0.3, 10)} />
      <Glow a={pA} b={pF} op={hl} color={C.green} />
      <Fig P={P} g={g} lens={[1, 1, 1]} />
      <Chev a={P([6, 8])} b={P([16, 8])} t={0.75} op={c0} />
      <Chev a={P([0, 0])} b={P([12, 0])} t={0.5} op={c0} />
      <XArcs nl P={P} g={g} r={110} b={ease(f, at(scene, 1, 0.45), 14)} f={0} bp={ease(f, at(scene, 1, 0.45), 14)} />
      <Lbl p={[(pA[0] + pF[0]) / 2, pA[1] - 80]} t="?" color={C.green} size={90} op={q} s={1 + 0.2 * hl} />
    </Stage>
  );
};

const QTEXT: React.ReactNode = (
  <>
    Triangle <TexI t="ABC" /> has <TexI t="AB = AC = 10" /> and <NW><TexI t="BC = 12" />.</NW> A line through <TexI t="A" /> is parallel to <NW><TexI t="BC" />.</NW> The bisector of <TexI t="\angle ABC" /> meets this line at <NW><TexI t="F" />.</NW> What is <NW><TexI t="AF" />?</NW>
  </>
);
const QTEXT2: React.ReactNode = (
  <>
    Triangle <TexI t="ABC" /> has <TexI t="AB = 7" />, <TexI t="AC = 9" /> and <NW><TexI t="BC = 10" />.</NW> A line through <TexI t="A" /> is parallel to <NW><TexI t="BC" />.</NW> The bisector of <TexI t="\angle ABC" /> meets this line at <NW><TexI t="F" />.</NW> What is <NW><TexI t="AF" />?</NW>
  </>
);

const makePause = (seconds: number, text: React.ReactNode, g: Geo, txt: [string, string, string]): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(150, 755, 32);
  return (
    <>
      <QBox x={60} y={130} w={1190} style={fadeUp(f, 6)}>{text}</QBox>
      <Stage>
        <g opacity={0.92}>
          <Fig P={P} g={g} lens={[1, 1, 1]} txt={txt} />
        </g>
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1620} y={520} tick={TICK} />
    </>
  );
};

const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(100, 740, 48);
  const g = MAIN;
  const pB = P(g.B);
  const pF = P(g.F);
  const aBF = deg(g.B, g.F);
  const z = ease(f, at(scene, 2, 0.1), at(scene, 2, 0.6) - at(scene, 2, 0.1));
  const wedge = ease(f, at(scene, 2, 0.65), 12) * fadeTo(f, at(scene, 3, 0.35), 0, 12);
  const wp = pulse(f, at(scene, 2, 0.65), 40);
  const zOp = fadeTo(f, at(scene, 3, 0.9), 0.35, 14);
  const xs = (i: number, t: number) => pop(f, at(scene, i, t));
  return (
    <>
      <Stage>
        <ZPath P={P} g={g} p={z} op={zOp} />
        <Fig P={P} g={g} lens={[1, 1, 1]} />
        <XArcs
          P={P}
          g={g}
          r={95}
          b={ease(f, at(scene, 1, 0.3), 8)}
          bp={ease(f, at(scene, 1, 0.3), 16)}
          f={ease(f, at(scene, 3, 0.35), 8)}
          fp={ease(f, at(scene, 3, 0.35), 16)}
          s={1 + 0.15 * pulse(f, at(scene, 1, 0.45), 20)}
        />
        <Arc v={pB} a0={0} a1={aBF} r={95} color={C.amber} w={9} op={wedge * (0.6 + 0.4 * wp)} fill={C.amber} fillOp={0.35} />
        <Arc v={pF} a0={180} a1={180 + aBF} r={95} color={C.amber} w={9} op={wedge * (0.6 + 0.4 * wp)} fill={C.amber} fillOp={0.35} />
      </Stage>
      <Eq x={1030} y={190} start={at(scene, 1, 0.4)} tex={'\\angle ABF = {\\color{#7b61ff}x}'} />
      <Eq x={1030} y={310} start={at(scene, 1, 0.7)} tex={'\\angle FBC = {\\color{#7b61ff}x}'} />
      <Pill x={1030} y={450} color={C.amber} style={{ ...fadeUp(f, at(scene, 2, 0.2)), fontSize: 48 }}>
        Z shape: BF crosses both lines
      </Pill>
      <Eq x={1030} y={600} start={at(scene, 3, 0.55)} tex={'\\angle AFB = {\\color{#7b61ff}x}'} />
      <div style={{ position: 'absolute', left: 1030 + 560, top: 612, fontSize: 52, fontWeight: 900, color: C.green, opacity: ease(f, at(scene, 3, 0.8), 10), transform: `scale(${xs(3, 0.8)})` }}>✓</div>
    </>
  );
};

const Isosceles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(330, 740, 60);
  const g = MAIN;
  const pA = P(g.A);
  const pB = P(g.B);
  const pF = P(g.F);
  const fill = ease(f, at(scene, 0, 0.1), 18);
  const tk = ease(f, at(scene, 1, 0.5), 10);
  const sl = ease(f, at(scene, 2, 0.25), at(scene, 2, 0.8) - at(scene, 2, 0.25));
  const abL = outPt(pA, pB, P([6, 0]), 70);
  const afL: Pt = [(pA[0] + pF[0]) / 2, pA[1] - 54];
  const mv: Pt = [abL[0] + (afL[0] - abL[0]) * sl, abL[1] + (afL[1] - abL[1]) * sl - Math.sin(sl * Math.PI) * 120];
  const gl = pulse(f, at(scene, 0, 0.45), 40);
  const chipOp = ease(f, at(scene, 3, 0.8), 10);
  return (
    <>
      <Stage>
        <polygon points={[pA, pB, pF].map((q) => q.join(',')).join(' ')} fill={C.primary} opacity={0.22 * fill} />
        <Fig P={P} g={g} lens={[0, 0.25, 0.25]} />
        <XArcs P={P} g={g} r={115} b={ease(f, 0, 10)} f={ease(f, 0, 10)} s={1 + 0.18 * gl} />
        <Tick a={pA} b={pB} op={tk} color={C.primary} />
        <Tick a={pA} b={pF} op={tk} color={C.primary} />
        <Lbl p={abL} t="10" color={C.ink} op={1} />
        <Lbl p={mv} t="10" color={C.primary} op={sl > 0 ? 1 : 0} />
      </Stage>
      <Text x={1650} y={290} w={300} size={64} weight={900} align="center" style={{ opacity: ease(f, at(scene, 3, 0.1), 10) }}>
        AF =
      </Text>
      <Answer x={1650} y={500} value="10" start={at(scene, 3, 0.8)} chime={CHIME} />
      <div style={{ position: 'absolute', left: 1530, top: 700, background: C.green, color: '#fff', borderRadius: 18, padding: '10px 36px', fontSize: 56, fontWeight: 900, opacity: chipOp }}>
        <span style={{ opacity: 0.8, fontSize: 40, marginRight: 14 }}>D</span>10
      </div>
    </>
  );
};

const Rhombus: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(330, 740, 60);
  const g = MAIN;
  const pA = P(g.A);
  const pB = P(g.B);
  const pG = P(G10);
  const S = P(g.F); // the spot ten along the top line from A (it IS F, but only named at the end)
  const gOp = ease(f, at(scene, 1, 0.3), 10);
  const bgOp = ease(f, at(scene, 1, 0.45), 12);
  const sOp = ease(f, at(scene, 2, 0.3), 10);
  const asOp = ease(f, at(scene, 2, 0.45), 12);
  const gsP = ease(f, at(scene, 3, 0.15), at(scene, 3, 0.6) - at(scene, 3, 0.15));
  const fillOp = ease(f, at(scene, 3, 0.6), 16);
  const par = ease(f, at(scene, 3, 0.75), 10);
  const tk = ease(f, at(scene, 5, 0.15), 10);
  const gsL = ease(f, at(scene, 5, 0.3), 10);
  const diag = ease(f, at(scene, 6, 0.05), at(scene, 6, 0.45) - at(scene, 6, 0.05));
  const ar = ease(f, at(scene, 6, 0.5), 14);
  const bis = ease(f, at(scene, 7, 0.1), at(scene, 7, 0.45) - at(scene, 7, 0.1));
  const fl = ease(f, at(scene, 7, 0.6), 8);
  const aBF = deg(g.B, g.F);
  const aBA = deg(g.B, g.A);
  const pulseS = pulse(f, at(scene, 2, 0.3), 36);
  return (
    <>
      <Stage>
        <polygon points={[pA, pB, pG, S].map((q) => q.join(',')).join(' ')} fill={C.primary} opacity={0.2 * fillOp} />
        <Glow a={pB} b={pG} op={bgOp * fadeTo(f, at(scene, 3), 0.25, 12)} />
        <Glow a={pA} b={S} op={asOp * fadeTo(f, at(scene, 3), 0.25, 12)} />
        <Fig P={P} g={g} bis={0} lens={[1, 0, 0]} pts={{ F: 0 }} />
        <Seg a={S} b={pG} p={gsP} />
        <Chev a={pA} b={S} t={0.5} op={par * fadeTo(f, at(scene, 5), 0, 10)} />
        <Chev a={pB} b={pG} t={0.5} op={par * fadeTo(f, at(scene, 5), 0, 10)} />
        <Dot p={pG} op={gOp} color={C.amber} />
        <Lbl p={[pG[0], pG[1] + 54]} t="G" op={gOp} />
        <Lbl p={[(pB[0] + pG[0]) / 2, pB[1] + 62]} t="10" op={bgOp} />
        <Dot p={S} op={sOp} color={C.amber} r={13 + 5 * pulseS} />
        <Lbl p={[(pA[0] + S[0]) / 2, pA[1] - 56]} t="10" op={asOp} />
        <Tick a={pA} b={pB} op={tk} color={C.primary} />
        <Tick a={pB} b={pG} op={tk} color={C.primary} />
        <Tick a={pG} b={S} op={tk} color={C.primary} />
        <Tick a={pA} b={S} op={tk} color={C.primary} />
        <Lbl p={outPt(pG, S, pB, 54)} t="10" op={gsL} />
        <Seg a={pB} b={S} p={diag} dash color={C.ink} w={6} op={fadeTo(f, at(scene, 7, 0.3), 0.0, 10)} />
        <Arc v={pB} a0={aBF} a1={aBA} r={115} op={ar} p={ar} label="x" fill={C.violet} fillOp={0.2} />
        <Arc v={pB} a0={0} a1={aBF} r={115} op={ar} p={ar} label="x" fill={C.violet} fillOp={0.2} />
        <Seg a={pB} b={S} p={bis} color={C.violet} w={9} />
        <Lbl p={[S[0], S[1] - 56]} t="F" op={fl} s={1 + 0.2 * pulse(f, at(scene, 7, 0.6), 20)} />
      </Stage>
      <Pill x={1460} y={520} color={C.primary} style={{ ...fadeUp(f, at(scene, 5, 0.75)), fontSize: 54, opacity: ease(f, at(scene, 5, 0.75), 10) * fadeTo(f, at(scene, 8), 0, 10) }}>
        Rhombus!
      </Pill>
      <Card x={1460} y={290} w={420} start={at(scene, 8, 0.1)} color={C.violet}>
        bisector + parallel line
        <br />
        <span style={{ color: C.green }}>→ isosceles triangle</span>
      </Card>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(300, 700, 44);
  const g = MAIN;
  const pA = P(g.A);
  const pB = P(g.B);
  const pC = P(g.C);
  const pF = P(g.F);
  const pM = P(FOOT);
  const pN = P(MIDAB);
  const act = (i: number) => ease(f, at(scene, i), 10);
  const gone = (i: number) => fadeTo(f, at(scene, i), 0, 10);
  const chipRed = [at(scene, 4), at(scene, 1), at(scene, 3), -1, at(scene, 2)]; // choices A..E
  const chipState = (i: number) => {
    if (i === 3) return ease(f, at(scene, 5), 10);
    return chipRed[i] >= 0 ? -ease(f, chipRed[i], 10) : 0;
  };
  const alt = ease(f, at(scene, 3, 0.15), 18);
  const l1 = act(1) * gone(2);
  const l2 = act(2) * gone(3);
  const l3 = act(3) * gone(4);
  const l4 = act(4) * gone(5);
  const l5 = act(5);
  const rs = 26;
  const reasons: [number, React.ReactNode, string][] = [
    [1, <>B: <b style={{ color: C.red }}>6</b> is half of <TexI t="BC" /></>, C.red],
    [2, <>E: <b style={{ color: C.red }}>12</b> is <TexI t="BC" /> itself</>, C.red],
    [3, <>C: <b style={{ color: C.red }}>8</b> is the height</>, C.red],
    [4, <>A: <b style={{ color: C.red }}>5</b> is half of <TexI t="AB" /></>, C.red],
    [5, <>D: <b style={{ color: C.green }}>10</b>. Look for the isosceles triangle!</>, C.green],
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 230, top: 120, display: 'flex', gap: 22, opacity: ease(f, at(scene, 0, 0.3), 10) }}>
        {CHOICES.map((c, i) => {
          const st = chipState(i);
          const red = Math.max(0, -st);
          const grn = Math.max(0, st);
          return (
            <div key={c} style={{ background: grn > 0 ? C.green : red > 0 ? `rgba(239,67,67,${0.12 + 0.1 * red})` : C.card, color: grn > 0 ? '#fff' : C.ink, border: `4px solid ${red > 0 ? C.red : grn > 0 ? C.green : 'transparent'}`, borderRadius: 18, padding: '10px 28px', fontSize: 58, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', transform: `scale(${1 + 0.1 * grn})` }}>
              <span style={{ opacity: 0.6, fontSize: 38, marginRight: 12 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      <Stage>
        <polygon points={[pA, pB, pF].map((q) => q.join(',')).join(' ')} fill={C.primary} opacity={0.2 * l5} />
        <polygon points={[pA, pB, pM].map((q) => q.join(',')).join(' ')} fill={C.blue} opacity={0.2 * l3 * alt} />
        <Glow a={pB} b={pM} op={l1} />
        <Glow a={pB} b={pC} op={l2} />
        <Glow a={pA} b={pN} op={l4} />
        <Glow a={pA} b={pF} op={l5} color={C.green} />
        <Fig P={P} g={g} lens={[1, 0.25, 0]} />
        <Dot p={pM} op={Math.max(l1, l3)} color={C.amber} />
        <Lbl p={[(pB[0] + pM[0]) / 2, pB[1] + 62]} t="6" op={l1} />
        <Lbl p={[(pB[0] + pC[0]) / 2, pB[1] + 62]} t="12" op={l2} />
        <Seg a={pA} b={pM} dash p={alt} color={C.blue} w={7} op={l3} />
        <path d={`M ${pM[0] - rs} ${pM[1]} L ${pM[0] - rs} ${pM[1] - rs} L ${pM[0]} ${pM[1] - rs}`} fill="none" stroke={C.blue} strokeWidth={5} opacity={l3 * alt} />
        <Lbl p={[pM[0] + 36, (pA[1] + pM[1]) / 2]} t="8" color={C.blue} op={l3 * alt} />
        <Dot p={pN} op={l4} color={C.amber} />
        <Lbl p={outPt(pA, pN, pC, 46)} t="5" op={l4} />
        <Tick a={pA} b={pB} op={l5} color={C.primary} />
        <Tick a={pA} b={pF} op={l5} color={C.primary} />
      </Stage>
      {reasons.map(([i, node, col]) => (
        <Card key={i} x={1280} y={330} w={600} start={at(scene, i, 0.1)} color={col} op={gone(i + 1)}>
          {node}
        </Card>
      ))}
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(300, 760, 62);
  const g = VAR;
  const pA = P(g.A);
  const pF = P(g.F);
  const q = ease(f, at(scene, 3, 0.3), 10);
  const hl = pulse(f, at(scene, 3, 0.3), 50);
  return (
    <>
      <Stage>
        <Glow a={pA} b={pF} op={hl} color={C.green} />
        <Fig
          P={P}
          g={g}
          txt={['7', '9', '10']}
          tri={ease(f, at(scene, 0, 0.1), 40)}
          lens={[ease(f, at(scene, 1, 0.3), 10), ease(f, at(scene, 1, 0.55), 10), ease(f, at(scene, 1, 0.8), 10)]}
          top={ease(f, at(scene, 2, 0.1), 24)}
          bis={ease(f, at(scene, 2, 0.45), 24)}
          pts={{ F: ease(f, at(scene, 2, 0.85), 10) }}
        />
        <Lbl p={[(pA[0] + pF[0]) / 2, pA[1] - 86]} t="?" color={C.green} size={90} op={q} s={1 + 0.2 * hl} />
      </Stage>
      <Pill x={1500} y={330} color={C.violet} style={{ ...fadeUp(f, at(scene, 3, 0.4)), fontSize: 60 }}>
        AF = ?
      </Pill>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(300, 760, 62);
  const g = VAR;
  const pA = P(g.A);
  const pB = P(g.B);
  const pF = P(g.F);
  const z = ease(f, at(scene, 1, 0.05), at(scene, 1, 0.5) - at(scene, 1, 0.05));
  const zOp = fadeTo(f, at(scene, 2, 0.1), 0, 12);
  const fill = ease(f, at(scene, 2, 0.05), 16);
  const tk = ease(f, at(scene, 2, 0.5), 10);
  const grey = ease(f, at(scene, 4, 0.1), 14);
  return (
    <>
      <Stage>
        <polygon points={[pA, pB, pF].map((q) => q.join(',')).join(' ')} fill={C.primary} opacity={0.22 * fill} />
        <ZPath P={P} g={g} p={z} op={zOp} />
        <Fig P={P} g={g} txt={['7', '9', '10']} lens={[1, 1 - 0.75 * grey, 1 - 0.75 * grey]} />
        <XArcs
          P={P}
          g={g}
          r={105}
          b={ease(f, at(scene, 0, 0.35), 8)}
          bp={ease(f, at(scene, 0, 0.35), 16)}
          f={ease(f, at(scene, 1, 0.6), 8)}
          fp={ease(f, at(scene, 1, 0.6), 16)}
        />
        <Tick a={pA} b={pB} op={tk} color={C.primary} />
        <Tick a={pA} b={pF} op={tk} color={C.primary} />
      </Stage>
      <Text x={1500} y={290} w={300} size={64} weight={900} align="center" style={{ opacity: ease(f, at(scene, 3, 0.1), 10) }}>
        AF =
      </Text>
      <Answer x={1650} y={500} value="7" start={at(scene, 3, 0.75)} chime={CHIME} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = plane(100, 720, 50);
  const g = MAIN;
  const pA = P(g.A);
  const pB = P(g.B);
  const pF = P(g.F);
  const fadeOut = fadeTo(f, at(scene, 3), 0, 14);
  return (
    <>
      <Stage>
        <polygon points={[pA, pB, pF].map((q) => q.join(',')).join(' ')} fill={C.primary} opacity={0.22} />
        <Fig P={P} g={g} />
        <XArcs P={P} g={g} r={100} b={1} f={1} />
        <Tick a={pA} b={pB} color={C.primary} />
        <Tick a={pA} b={pF} color={C.primary} />
      </Stage>
      <div style={{ opacity: fadeOut }}>
        <Pill x={1070} y={140} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.3)), fontSize: 54 }}>
          The big idea
        </Pill>
        <Card x={1070} y={270} w={800} start={at(scene, 1, 0.2)} color={C.amber}>
          Parallel lines: Z angles are equal
        </Card>
        <Card x={1070} y={450} w={800} start={at(scene, 2, 0.1)} color={C.violet}>
          Bisector + parallel line: look for a triangle with two equal angles
        </Card>
        <Card x={1070} y={680} w={810} start={at(scene, 2, 0.7)} color={C.green} size={40}>
          Two equal angles → two equal sides
        </Card>
      </div>
      <div style={{ position: 'absolute', left: 1070, width: 800, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 140, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 58, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={1470} y={400} start={at(scene, 3, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, QTEXT, MAIN, ['10', '10', '12']),
  chase: Chase,
  isosceles: Isosceles,
  rhombus: Rhombus,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, QTEXT2, VAR, ['7', '9', '10']),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-cevian-area-ratio-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- mixed maths + hanzi (hanzi never go inside KaTeX, whose \text font is serif) ----------

type Part = string | { z: string; c?: string };
const Z: React.FC<{ p: Part[] | string; size: number; color?: string }> = ({ p, size, color = C.ink }) =>
  typeof p === 'string' ? (
    <Tex tex={p} size={size} color={color} />
  ) : (
    <span style={{ whiteSpace: 'nowrap', color }}>
      {p.map((x, i) =>
        typeof x === 'string' ? (
          <Tex key={i} tex={x} size={size} color={color} />
        ) : (
          <span key={i} style={{ fontFamily: ZH_FONT, fontSize: size * 0.9, fontWeight: 800, color: x.c ?? color, margin: '0 0.12em' }}>{x.z}</span>
        ),
      )}
    </span>
  );
const z = (t: string): Part => ({ z: t });
const PAUSE_LABEL = <span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>;

// ---------- geometry (bank SVG coordinates, scaled uniformly; screen y down) ----------

type Bk = [number, number];
const S = 3.2;
type Geo = { A: Pt; B: Pt; C: Pt; D: Pt; E: Pt; P: Pt; F: Pt };
const mk = (ox: number, oy: number, E: Bk, P: Bk, F: Bk): Geo => {
  const m = (p: Bk): Pt => [ox + (p[0] - 32) * S, oy + (p[1] - 32) * S];
  return { A: m([98, 32]), B: m([32, 208]), C: m([252, 208]), D: m([142, 208]), E: m(E), P: m(P), F: m(F) };
};
const E0: Bk = [200.667, 149.333];
const P0: Bk = [133.2, 172.8];
const F0: Bk = [226.333, 178.667];
const E1: Bk = [213.5, 164];
const P1: Bk = [135.714, 182.857];
const F1: Bk = [232.75, 186];
export const main = (ox = 150, oy = 200) => mk(ox, oy, E0, P0, F0);
const variant = (ox = 150, oy = 200) => mk(ox, oy, E1, P1, F1);

export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const add = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy];
export const cen = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
const foot = (p: Pt, a: Pt, b: Pt): Pt => {
  const d: Pt = [b[0] - a[0], b[1] - a[1]];
  const t = ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2);
  return [a[0] + t * d[0], a[1] + t * d[1]];
};
/** Unit vector pointing outside the triangle, normal to AC. */
const OUT: Pt = [176 / Math.hypot(154, 176), -154 / Math.hypot(154, 176)];

// ---------- drawing helpers ----------

export const Lab: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
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
export const Tk: React.FC<{ a: Pt; b: Pt; t?: number; n?: number; color?: string; opacity: number; len?: number }> = ({ a, b, t = 0.5, n = 1, color = C.ink, opacity, len = 15 }) => {
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

/** Parallel chevron at fraction t of a-b. */
const Chev: React.FC<{ a: Pt; b: Pt; t: number; color: string; opacity: number }> = ({ a, b, t, color, opacity }) => {
  if (opacity <= 0) return null;
  const m = lerp(a, b, t);
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${m[0]} ${m[1]}) rotate(${ang})`} opacity={opacity} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -10 -16 L 8 0 L -10 16" />
    </g>
  );
};

export const Fill: React.FC<{ pts: Pt[]; color: string; opacity: number; fo?: number; stroke?: number }> = ({ pts, color, opacity, fo = 0.34, stroke = 0 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')} Z`} fill={color} fillOpacity={fo} stroke={stroke ? color : 'none'} strokeWidth={stroke} strokeLinejoin="round" />
    </g>
  );

/** Base figure: outline, D, E, the two cevians, P and the shaded ABP. */
export const Fig: React.FC<{
  g: Geo;
  draw?: number;
  dOp?: number;
  eOp?: number;
  ad?: number;
  be?: number;
  pOp?: number;
  shade?: number;
}> = ({ g, draw = 1, dOp = 1, eOp = 1, ad = 1, be = 1, pOp = 1, shade = 1 }) => (
  <>
    <Fill pts={[g.A, g.B, g.P]} color={C.primary} opacity={shade} fo={0.3} />
    <Poly pts={[g.A, g.B, g.C]} color={C.ink} width={6} progress={draw} />
    <Ln a={g.A} b={g.D} p={ad} />
    <Ln a={g.B} b={g.E} p={be} />
    <Dot p={g.D} opacity={dOp} />
    <Dot p={g.E} opacity={eOp} />
    <Dot p={g.P} opacity={pOp} />
    <Lab p={add(g.A, 0, -42)} text="A" opacity={draw} />
    <Lab p={add(g.B, -36, 28)} text="B" opacity={draw} />
    <Lab p={add(g.C, 36, 28)} text="C" opacity={draw} />
    <Lab p={add(g.D, 0, 46)} text="D" opacity={dOp} />
    <Lab p={add(g.E, 42, -8)} text="E" opacity={eOp} />
    <Lab p={add(g.P, 40, -26)} text="P" opacity={pOp} />
  </>
);

/** Equal-mark ticks on BD and DC. */
export const MidTicks: React.FC<{ g: Geo; op: number; color?: string }> = ({ g, op, color = C.ink }) => (
  <>
    <Tk a={g.B} b={g.D} opacity={op} color={color} />
    <Tk a={g.D} b={g.C} opacity={op} color={color} />
  </>
);

/** Equal steps along AC: `n` parts. */
export const StepTicks: React.FC<{ g: Geo; n: number; op: number; color?: string }> = ({ g, n, op, color = C.ink }) => (
  <>
    {range(n - 1).map((k) => (
      <Tk key={k} a={g.A} b={g.C} t={(k + 1) / n} opacity={op} color={color} len={13} />
    ))}
  </>
);

/** Label beside AC at fraction t, pushed `off` px outside. */
export const AcLab = (g: Geo, t: number, off = 62): Pt => add(lerp(g.A, g.C, t), OUT[0] * off, OUT[1] * off);

const PANEL = 1000;

const Eq: React.FC<{ y: number; tex: string | Part[]; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const RightBox: React.FC<{ F: Pt; along: Pt; to: Pt; up: Pt; opacity: number }> = ({ F, along, to, up, opacity }) => {
  if (opacity <= 0) return null;
  const n = (a: Pt, b: Pt): Pt => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
  const u = n(along, to);
  const v = n(F, up);
  const k = 28;
  return <path d={`M ${F[0] + u[0] * k} ${F[1] + u[1] * k} L ${F[0] + (u[0] + v[0]) * k} ${F[1] + (u[1] + v[1]) * k} L ${F[0] + v[0] * k} ${F[1] + v[1] * k}`} stroke={C.ink} strokeWidth={5} fill="none" opacity={opacity} />;
};

export const bump = (f: number, s: number, hold = 30) => ease(f, s, 8) * (1 - ease(f, s + hold, 12));

const GoalChip: React.FC<{ y: number; start: number }> = ({ y, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, background: C.card, borderRadius: 24, padding: '8px 36px', boxShadow: '0 6px 24px rgba(30,40,80,0.08)', border: `5px solid ${C.green}`, ...fadeUp(f, start) }}>
      <Z p={[z('目标：'), '[ABP] = ?']} size={56} />
    </div>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main(300, 190);
  return (
    <>
      <Text x={1450} y={200} w={760} size={72} weight={900} align="center" style={fadeUp(f, 0)}>
        两条线交在哪里？
      </Text>
      <Stage>
        <Fill pts={[g.A, g.B, g.D]} color={C.amber} opacity={bump(f, at(scene, 1, 0.1), 50)} fo={0.25} stroke={6} />
        <Fig g={g} draw={ease(f, 6, 22)} dOp={ease(f, 20, 10)} eOp={ease(f, 22, 10)} ad={ease(f, 24, 22)} be={ease(f, 34, 22)} pOp={ease(f, at(scene, 0, 0.7), 10)} shade={ease(f, at(scene, 0, 0.8), 16)} />
      </Stage>
      <div style={{ position: 'absolute', left: 1200, top: 480, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CHOICES = ['15', '20', '24', '30', '40'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main(1010, 190);
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 150, width: 850, minHeight: 330, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        三角形 ABC 的<Mark on={at(scene, 0, 0.5)}>面积是 60</Mark>。<Mark on={at(scene, 1, 0.3)}>D 是 BC 的中点。</Mark><Mark on={at(scene, 2, 0.3)}>E 在 AC 上，<span style={{ whiteSpace: 'nowrap' }}>AE : EC = 2 : 1。</span></Mark>线段 AD 和 BE 相交于点 P。<Mark on={at(scene, 3, 0.55)}>涂色的三角形 ABP 面积是多少？</Mark>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 700, display: 'flex', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 4, 0.2 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '10px 22px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 48, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <Fig g={g} draw={ease(f, 8, 20)} dOp={ease(f, at(scene, 1, 0.3), 10)} eOp={ease(f, at(scene, 2, 0.4), 10)} ad={ease(f, at(scene, 3, 0.1), 18)} be={ease(f, at(scene, 3, 0.25), 18)} pOp={ease(f, at(scene, 3, 0.45), 10)} shade={ease(f, at(scene, 3, 0.75), 16)} />
        <MidTicks g={g} op={ease(f, at(scene, 1, 0.5), 10)} />
        <StepTicks g={g} n={3} op={ease(f, at(scene, 2, 0.5), 10)} />
        <Lab p={AcLab(g, 1 / 3)} text="2" color={C.violet} opacity={ease(f, at(scene, 2, 0.75), 10)} />
        <Lab p={AcLab(g, 5 / 6)} text="1" color={C.violet} opacity={ease(f, at(scene, 2, 0.85), 10)} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  // a "?" marker that wanders along AD and settles
  const k = ease(f, at(scene, 2, 0.05), 40);
  const wob = Math.sin(k * Math.PI * 2.5) * (1 - k) * 0.25;
  const t = 0.35 + 0.45 * k + wob;
  const m = lerp(g.A, g.D, t);
  const mo = ease(f, at(scene, 2, 0.05), 8);
  return (
    <>
      <Stage>
        <Fig g={g} />
        <MidTicks g={g} op={1} color={ease(f, at(scene, 1, 0.1), 8) > 0 ? C.primary : C.ink} />
        <StepTicks g={g} n={3} op={1} color={ease(f, at(scene, 1, 0.5), 8) > 0 ? C.primary : C.ink} />
        <Lab p={AcLab(g, 1 / 3)} text="2" color={C.violet} opacity={ease(f, at(scene, 1, 0.75), 10)} />
        <Lab p={AcLab(g, 5 / 6)} text="1" color={C.violet} opacity={ease(f, at(scene, 1, 0.85), 10)} />
        {mo > 0 && (
          <g opacity={mo}>
            <circle cx={m[0]} cy={m[1]} r={34} fill={C.violet} />
            <text x={m[0]} y={m[1] + 2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={48} textAnchor="middle" dominantBaseline="middle">
              ?
            </text>
          </g>
        )}
      </Stage>
      <Text x={PANEL} y={150} w={800} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 0, 0.2))}>
        已知条件
      </Text>
      <Check x={PANEL} y={240} start={at(scene, 1, 0.1)}>BD = DC</Check>
      <Check x={PANEL} y={340} start={at(scene, 1, 0.5)}>AC 分成相等的 3 份</Check>
      <Text x={PANEL + 80} y={410} w={800} size={40} weight={700} color={C.muted} style={fadeUp(f, at(scene, 1, 0.8))}>
        2 份靠近 A，1 份靠近 C
      </Text>
      <Text x={PANEL} y={500} w={800} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 2, 0.15))}>
        难点：P 在 AD 上的什么位置？
      </Text>
      <GoalChip y={600} start={at(scene, 2, 0.55)} />
    </>
  );
};

const makePause = (seconds: number, prompt: string, vari: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const g = vari ? variant() : main();
  return (
    <>
      <Stage>
        <Fig g={g} />
        <MidTicks g={g} op={1} />
        <StepTicks g={g} n={vari ? 4 : 3} op={1} />
      </Stage>
      <Text x={PANEL - 40} y={115} w={900} size={40} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1400} y={530} tick={TICK} label={PAUSE_LABEL} />
    </>
  );
};

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  const demoOut = fadeTo(f, at(scene, 3, 0.0));
  const dop = ease(f, at(scene, 1, 0.05), 14) * demoOut;
  // demo: apex Q above a base line; two bases 2 : 1
  const Q: Pt = [1280, 290];
  const L0: Pt = [1000, 530];
  const L1: Pt = [1400, 530];
  const L2: Pt = [1600, 530];
  const hOp = ease(f, at(scene, 1, 0.6), 12) * demoOut;
  const ratio = ease(f, at(scene, 2, 0.1), 12) * demoOut;
  const hf = foot(g.A, g.B, g.C);
  const half = ease(f, at(scene, 3, 0.25), 14);
  return (
    <>
      <Stage>
        <Fill pts={[g.A, g.B, g.D]} color={C.violet} opacity={half} />
        <Fill pts={[g.A, g.D, g.C]} color={C.amber} opacity={half} />
        <Fig g={g} be={0} eOp={0} pOp={0} shade={0} />
        <MidTicks g={g} op={ease(f, at(scene, 3, 0.2), 8)} />
        <Lab p={add(cen([g.A, g.B, g.D]), -38, 0)} text="30" color={C.violet} size={56} opacity={ease(f, at(scene, 3, 0.65), 10)} />
        <Lab p={cen([g.A, g.D, g.C])} text="30" color={C.amber} size={56} opacity={ease(f, at(scene, 3, 0.75), 10)} />
        <Ln a={g.A} b={hf} dashed color={C.ink} width={5} opacity={ease(f, at(scene, 3, 0.4), 10)} />
        <g opacity={dop}>
          <Fill pts={[Q, L0, L1]} color={C.violet} opacity={1} fo={0.3} stroke={5} />
          <Fill pts={[Q, L1, L2]} color={C.amber} opacity={1} fo={0.3} stroke={5} />
          <Ln a={[960, 530]} b={[1640, 530]} width={5} />
          <Lab p={add(Q, 0, -44)} text="Q" />
        </g>
        <Ln a={Q} b={[Q[0], L0[1]]} dashed color={C.ink} width={6} opacity={hOp} />
        <Lab p={[Q[0] + 26, 410]} text="h" color={C.ink} opacity={hOp} />
        <Lab p={[1200, 590]} text="底 2" color={C.violet} size={44} opacity={ratio} />
        <Lab p={[1500, 590]} text="底 1" color={C.amber} size={44} opacity={ratio} />
      </Stage>
      <Text x={PANEL} y={110} w={800} size={44} weight={900} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.1)), opacity: dop }}>
        顶点相同，底边在同一条直线上
      </Text>
      <div style={{ position: 'absolute', left: PANEL, top: 650, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.15)), opacity: ratio }}>
        <Z p={[z('面积之比'), '=', z('底边之比')]} size={56} color={C.violet} />
      </div>
      <Eq y={200} start={at(scene, 3, 0.55)} size={56} tex={'[ABD] = [ADC] = \\dfrac{60}{2} = 30'} />
      <Text x={PANEL} y={360} w={800} size={40} weight={700} color={C.muted} style={fadeUp(f, at(scene, 3, 0.45))}>
        从 A 出发的高相同，底边相等
      </Text>
    </>
  );
};

const Pieces: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  const R = {
    abp: [g.A, g.B, g.P],
    bpd: [g.B, g.D, g.P],
    cpd: [g.C, g.D, g.P],
    cpe: [g.C, g.E, g.P],
    ape: [g.A, g.P, g.E],
  };
  const out = ease(f, at(scene, 0, 0.6), 14);
  const eq = ease(f, at(scene, 1, 0.4), 12);
  const two = ease(f, at(scene, 2, 0.5), 12);
  const lab = ease(f, at(scene, 3, 0.4), 12);
  return (
    <>
      <Stage>
        <Fig g={g} />
        <Ln a={g.C} b={g.P} p={ease(f, 8, 22)} dashed color={C.blue} width={7} />
        {Object.values(R).map((p, i) => (
          <path key={i} d={`M ${p.map((q) => q.join(' ')).join(' L ')} Z`} fill="none" stroke="#9aa3b5" strokeWidth={4} strokeLinejoin="round" opacity={out} />
        ))}
        <Fill pts={R.bpd} color={C.violet} opacity={eq} />
        <Fill pts={R.cpd} color={C.violet} opacity={eq} />
        <Fill pts={R.cpe} color={C.amber} opacity={two} />
        <Fill pts={R.ape} color={C.blue} opacity={two} />
        <MidTicks g={g} op={eq} color={C.violet} />
        <StepTicks g={g} n={3} op={two} color={C.ink} />
        <Lab p={AcLab(g, 1 / 3)} text="2" color={C.violet} opacity={two} />
        <Lab p={AcLab(g, 5 / 6)} text="1" color={C.violet} opacity={two} />
        <Lab p={add(cen(R.abp), -8, 0)} text="?" color={C.primary} size={64} />
        <Lab p={add(cen(R.bpd), 0, 4)} text="x" color={C.violet} size={56} opacity={eq} />
        <Lab p={cen(R.cpd)} text="x" color={C.violet} size={56} opacity={eq} />
        <Lab p={cen(R.cpe)} text="y" color={C.amber} size={56} opacity={lab} />
        <Lab p={cen(R.ape)} text="2y" color={C.blue} size={56} opacity={lab} />
      </Stage>
      <Text x={PANEL} y={150} w={800} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 1, 0.05))}>
        顶点都是 P，底边相等
      </Text>
      <Eq y={230} start={at(scene, 1, 0.5)} color={C.violet} tex={'[BPD] = [CPD] = x'} />
      <Text x={PANEL} y={360} w={850} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 2, 0.05))}>
        顶点都是 P，AE 是 EC 的两倍
      </Text>
      <Eq y={440} start={at(scene, 3, 0.1)} color={C.amber} tex={'[CPE] = y'} />
      <Eq y={540} start={at(scene, 3, 0.45)} color={C.blue} tex={'[APE] = 2y'} />
    </>
  );
};

const Equations: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  const adc = ease(f, at(scene, 0, 0.05), 12) * (1 - ease(f, at(scene, 2, 0), 12));
  const bec = ease(f, at(scene, 2, 0.1), 12);
  const hb = foot(g.B, g.A, g.C);
  return (
    <>
      <Stage>
        <Fill pts={[g.A, g.D, g.C]} color={C.amber} opacity={adc} fo={0.18} stroke={8} />
        <Fill pts={[g.B, g.E, g.C]} color={C.blue} opacity={bec} fo={0.14} stroke={8} />
        <Fig g={g} />
        <Ln a={g.C} b={g.P} dashed color={C.blue} width={7} />
        <StepTicks g={g} n={3} op={1} />
        <MidTicks g={g} op={1} />
        <Ln a={g.B} b={hb} dashed color={C.ink} width={5} opacity={ease(f, at(scene, 2, 0.6), 10)} />
        <RightBox F={hb} along={g.A} to={g.C} up={g.B} opacity={ease(f, at(scene, 2, 0.6), 10)} />
        <Lab p={add(lerp(g.B, hb, 0.22), 40, -30)} text="h" color={C.ink} size={48} opacity={ease(f, at(scene, 2, 0.7), 10)} />
        <Lab p={add(cen([g.B, g.D, g.P]), 0, 4)} text="x" color={C.violet} size={56} />
        <Lab p={cen([g.C, g.D, g.P])} text="x" color={C.violet} size={56} />
        <Lab p={cen([g.C, g.E, g.P])} text="y" color={C.amber} size={56} />
        <Lab p={add(cen([g.A, g.P, g.E]), 42, 0)} text="2y" color={C.blue} size={56} />
        <Lab p={add(cen([g.A, g.B, g.P]), -8, 0)} text="?" color={C.primary} size={64} />
      </Stage>
      <Eq y={150} start={at(scene, 0, 0.35)} tex={'[ADC] = x + y + 2y = 30'} />
      <Eq y={260} start={at(scene, 1, 0.3)} size={64} color={C.green} tex={'x + 3y = 30'} />
      <Eq y={420} start={at(scene, 3, 0.1)} tex={'[BEC] = \\dfrac{1}{3} \\times 60 = 20'} />
      <Eq y={565} start={at(scene, 3, 0.7)} tex={'[BEC] = x + x + y'} />
      <Eq y={690} start={at(scene, 4, 0.3)} size={64} color={C.green} tex={'2x + y = 20'} />
    </>
  );
};

const Solve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  const sw = ease(f, at(scene, 2, 0.55), 12);
  const fin = at(scene, 3, 0.97);
  const check = ease(f, at(scene, 4, 0.0), 12);
  const rows = fadeTo(f, at(scene, 4, 0.0));
  const swap = ease(f, at(scene, 0, 0.5), 10);
  const badgeOp = fadeTo(f, at(scene, 4, 0.6));
  const lab = (p: Pt[], a: string, b: string, color: string, dy = 0) => (
    <>
      <Lab p={add(cen(p), 0, dy)} text={a} color={color} size={56} opacity={1 - sw} />
      <Lab p={add(cen(p), 0, dy)} text={b} color={color} size={56} opacity={sw} />
    </>
  );
  const ans = ease(f, at(scene, 3, 0.8), 12);
  return (
    <>
      <Stage>
        <Fill pts={[g.A, g.B, g.E]} color={C.green} opacity={check} fo={0.14} stroke={8} />
        <Fig g={g} />
        <Ln a={g.C} b={g.P} dashed color={C.blue} width={7} />
        {lab([g.B, g.D, g.P], 'x', '6', C.violet, 4)}
        {lab([g.C, g.D, g.P], 'x', '6', C.violet)}
        {lab([g.C, g.E, g.P], 'y', '8', C.amber)}
        {lab([g.A, g.P, g.E], '2y', '16', C.blue)}
        <Lab p={add(cen([g.A, g.B, g.P]), -8, 0)} text="?" color={C.primary} size={64} opacity={1 - ans} />
        <Lab p={add(cen([g.A, g.B, g.P]), -8, 0)} text="24" color={C.green} size={64} opacity={ans} />
      </Stage>
      <div style={{ opacity: rows }}>
        <Eq y={150} start={at(scene, 0, 0.1)} opacity={1 - swap} tex={'x + 3y = 30'} />
        <Eq y={150} start={at(scene, 0, 0.55)} opacity={swap} tex={'2x + 6y = 60'} />
        <Pill x={PANEL + 450} y={160} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.5)), fontSize: 40 }}>{'\u00d7 2'}</Pill>
        <Eq y={250} x={PANEL - 55} start={at(scene, 1, 0.15)} tex={'-'} />
        <Eq y={250} start={at(scene, 1, 0.0)} tex={'2x + \\phantom{6}y = 20'} />
        <div style={{ position: 'absolute', left: PANEL - 10, top: 350, width: 380, height: 5, background: C.ink, borderRadius: 3, ...fadeUp(f, at(scene, 1, 0.6)) }} />
        <Eq y={360} start={at(scene, 1, 0.65)} color={C.violet} tex={'5y = 40'} />
        <Eq y={470} start={at(scene, 2, 0.05)} tex={'y = 8'} />
        <Eq y={570} start={at(scene, 2, 0.35)} tex={'2x + 8 = 20 \\Rightarrow x = 6'} />
        <Eq y={660} start={at(scene, 3, 0.45)} size={58} color={C.green} tex={'[ABP] = 30 - 6'} />
        <Eq y={660} x={PANEL + 505} start={at(scene, 3, 0.82)} size={58} color={C.green} tex={'= 24'} />
      </div>
      <div style={{ opacity: badgeOp }}>
        <Pill x={PANEL} y={745} color={C.green} style={{ ...fadeUp(f, fin), fontSize: 42 }}>答案 C</Pill>
        <Answer x={1790} y={500} value="24" chime={CHIME} start={fin} />
        <Confetti x={1790} y={500} start={fin} seed={5} />
      </div>
      <Eq y={150} start={at(scene, 4, 0.2)} tex={'[ABP] + [APE] = [ABE]'} />
      <Eq y={270} start={at(scene, 4, 0.55)} color={C.green} tex={'24 + 16 = 40 = \\dfrac{2}{3} \\times 60'} />
    </>
  );
};

const Parallel: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  // line 1 = the rule (side demo), line 2 = draw DF, 3 = halves, 4 = steps, 5 = PE parallel DF, 6 = 4/5, 7 = 24, 8 = best for
  const T: Pt = [1350, 170];
  const Lb: Pt = [1050, 430];
  const Rb: Pt = [1650, 430];
  const Lp = lerp(T, Lb, 0.4);
  const Rp = lerp(T, Rb, 0.4);
  const demo = ease(f, at(scene, 1, 0.05), 12) * fadeTo(f, at(scene, 2, 0.5));
  const demoLine = ease(f, at(scene, 1, 0.45), 14);
  const demoLab = ease(f, at(scene, 1, 0.75), 10);
  const df = ease(f, at(scene, 2, 0.3), 22);
  const fl = ease(f, at(scene, 2, 0.8), 10);
  const sim = ease(f, at(scene, 3, 0.1), 14) * fadeTo(f, at(scene, 5, 0.0));
  const eqf = ease(f, at(scene, 3, 0.75), 10);
  const steps = ease(f, at(scene, 4, 0.1), 10);
  const adf = ease(f, at(scene, 5, 0.1), 14) * fadeTo(f, at(scene, 6, 0.0));
  const abd = ease(f, at(scene, 6, 0.3), 14);
  const fin = at(scene, 7, 0.97);
  const gone = fadeTo(f, at(scene, 6, 0.0));
  const stepLab = (a: number, b: number, text: string) => <Lab p={AcLab(g, (a + b) / 2, 120)} text={text} color={C.violet} opacity={steps} />;
  return (
    <>
      <Stage>
        <g opacity={demo}>
          <Poly pts={[T, Lb, Rb]} color={C.ink} width={6} />
          <Ln a={Lp} b={Rp} color={C.violet} width={7} p={demoLine} />
          <Chev a={Lp} b={Rp} t={0.5} color={C.violet} opacity={demoLine} />
          <Chev a={Lb} b={Rb} t={0.5} color={C.violet} opacity={demoLine} />
          <Lab p={add(lerp(T, Lp, 0.5), -40, 0)} text="2" color={C.violet} size={48} opacity={demoLab} />
          <Lab p={add(lerp(Lp, Lb, 0.5), -40, 0)} text="3" color={C.violet} size={48} opacity={demoLab} />
          <Lab p={add(lerp(T, Rp, 0.5), 40, 0)} text="2" color={C.violet} size={48} opacity={demoLab} />
          <Lab p={add(lerp(Rp, Rb, 0.5), 40, 0)} text="3" color={C.violet} size={48} opacity={demoLab} />
        </g>
        <Fill pts={[g.C, g.B, g.E]} color={C.amber} opacity={sim} fo={0.24} />
        <Fill pts={[g.C, g.D, g.F]} color={C.violet} opacity={sim} fo={0.34} />
        <Fill pts={[g.A, g.D, g.F]} color={C.violet} opacity={adf} fo={0.2} stroke={7} />
        <Fill pts={[g.A, g.B, g.D]} color={C.amber} opacity={abd} fo={0.2} />
        <Fig g={g} />
        <Ln a={g.D} b={g.F} p={df} dashed color={C.violet} width={7} />
        <Dot p={g.F} opacity={fl} color={C.violet} />
        <Lab p={add(g.F, -14, 52)} text="F" color={C.violet} opacity={fl} />
        <Chev a={g.D} b={g.F} t={0.5} color={C.violet} opacity={ease(f, at(scene, 2, 0.95), 8)} />
        <Chev a={g.B} b={g.E} t={0.5} color={C.violet} opacity={ease(f, at(scene, 2, 0.95), 8)} />
        <MidTicks g={g} op={ease(f, at(scene, 3, 0.3), 8)} />
        <Tk a={g.E} b={g.F} t={0.5} n={2} opacity={eqf} color={C.violet} />
        <Tk a={g.F} b={g.C} t={0.5} n={2} opacity={eqf} color={C.violet} />
        {range(5).map((k) => (
          <Tk key={k} a={g.A} b={g.C} t={(k + 1) / 6} opacity={steps} len={13} color={C.violet} />
        ))}
        {stepLab(0, 4 / 6, '4')}
        {stepLab(4 / 6, 5 / 6, '1')}
        {stepLab(5 / 6, 1, '1')}
        <Chev a={g.P} b={g.E} t={0.5} color={C.violet} opacity={ease(f, at(scene, 5, 0.5), 8)} />
        <Chev a={g.D} b={g.F} t={0.2} color={C.violet} opacity={ease(f, at(scene, 5, 0.5), 8)} />
      </Stage>
      <Text x={PANEL} y={480} w={880} size={44} weight={800} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.75)), opacity: ease(f, at(scene, 1, 0.75), 12) * fadeTo(f, at(scene, 2, 0.5)) }}>
        平行线：两条边上的比相同
      </Text>
      <Eq y={150} start={at(scene, 3, 0.55)} size={50} opacity={gone} tex={'CD = \\dfrac{1}{2}\\,CB'} />
      <Eq y={275} start={at(scene, 4, 0.15)} size={50} color={C.violet} opacity={gone} tex={'AE : EF : FC = 4 : 1 : 1'} />
      <Eq y={400} start={at(scene, 5, 0.7)} size={54} color={C.violet} tex={'AP : PD = AE : EF = 4 : 1'} />
      <Eq y={150} start={at(scene, 6, 0.1)} size={56} opacity={1 - gone} tex={'AP = \\dfrac{4}{5}\\,AD'} />
      <Eq y={470} start={at(scene, 6, 0.55)} size={52} tex={'[ABP] = \\dfrac{4}{5}\\,[ABD]'} />
      <Eq y={585} start={at(scene, 7, 0.1)} size={58} color={C.green} tex={'\\dfrac{4}{5} \\times 30'} />
      <Eq y={585} x={PANEL + 280} start={at(scene, 7, 0.7)} size={58} color={C.green} tex={'= 24'} />
      <Answer x={1790} y={600} value="24" chime={CHIME} start={fin} />
      <Confetti x={1790} y={600} start={fin} seed={8} />
      <Pill x={PANEL} y={755} color={C.primary} style={{ ...fadeUp(f, at(scene, 8, 0.2)), fontSize: 40 }}>适合：求一条线上的比</Pill>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = main();
  const M = lerp(g.A, g.D, 0.5);
  const G23 = lerp(g.A, g.D, 2 / 3);
  const abd = ease(f, at(scene, 1, 0.2), 12) * fadeTo(f, at(scene, 2, 0.0));
  const abe = ease(f, at(scene, 2, 0.2), 12) * fadeTo(f, at(scene, 3, 0.0));
  const ghost1 = ease(f, at(scene, 3, 0.3), 10) * fadeTo(f, at(scene, 4, 0.3));
  const fix = ease(f, at(scene, 4, 0.4), 12) * fadeTo(f, at(scene, 5, 0.0));
  const ghost2 = ease(f, at(scene, 5, 0.3), 10);
  const row = (i: number, y: number, label: string, tex: string, start: number) => (
    <div key={i} style={{ position: 'absolute', left: PANEL, top: y, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <div style={{ background: C.red, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 44, fontWeight: 900, minWidth: 130, textAlign: 'center' }}>{label}</div>
      <Tex tex={tex} size={46} />
    </div>
  );
  const ghost = (p: Pt, o: number, text: string) =>
    o <= 0 ? null : (
      <g opacity={o}>
        <circle cx={p[0]} cy={p[1]} r={22} fill="none" stroke={C.red} strokeWidth={7} strokeDasharray="8 7" />
        <Lab p={add(p, 135, -6)} text={text} color={C.red} size={48} />
      </g>
    );
  return (
    <>
      <Stage>
        <Fill pts={[g.A, g.B, g.D]} color={C.red} opacity={abd} fo={0.22} />
        <Fill pts={[g.A, g.B, g.E]} color={C.red} opacity={abe} fo={0.22} />
        <Fig g={g} />
        {ghost(G23, ghost1, '2 : 1?')}
        {ghost(M, ghost2, '中点？')}
        <g opacity={fix}>
          <circle cx={g.P[0]} cy={g.P[1]} r={26} fill="none" stroke={C.green} strokeWidth={8} />
          <Lab p={add(lerp(g.A, g.P, 0.5), -64, 0)} text="4" color={C.green} size={50} />
          <Lab p={add(lerp(g.P, g.D, 0.5), 52, 4)} text="1" color={C.green} size={50} />
        </g>
      </Stage>
      {row(0, 110, 'D  30', '\\dfrac{1}{2} \\times 60 = 30', at(scene, 1, 0.3))}
      {row(1, 235, 'E  40', '\\dfrac{2}{3} \\times 60 = 40', at(scene, 2, 0.3))}
      {row(2, 360, 'B  20', '\\dfrac{2}{3} \\times 30 = 20', at(scene, 3, 0.55))}
      <Eq y={490} start={at(scene, 4, 0.5)} size={54} color={C.green} tex={['AD', z('上：'), 'AP : PD = 4 : 1']} />
      {row(3, 575, 'A  15', '\\dfrac{1}{2} \\times 30 = 15', at(scene, 5, 0.55))}
      <div style={{ position: 'absolute', left: PANEL, top: 710, background: C.card, border: `5px solid ${C.green}`, borderRadius: 24, padding: '12px 30px', fontSize: 44, fontWeight: 900, boxShadow: '0 6px 24px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 6, 0.3)) }}>
        每条线都有自己的比。
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = variant();
  return (
    <>
      <Stage>
        <Fig g={g} draw={ease(f, 4, 20)} dOp={ease(f, 20, 10)} eOp={ease(f, at(scene, 1, 0.4), 10)} ad={ease(f, 14, 20)} be={ease(f, at(scene, 1, 0.5), 18)} pOp={ease(f, at(scene, 1, 0.8), 10)} shade={ease(f, at(scene, 2, 0.2), 14)} />
        <MidTicks g={g} op={ease(f, at(scene, 1, 0.1), 10)} />
        <StepTicks g={g} n={4} op={ease(f, at(scene, 1, 0.6), 10)} />
        <Lab p={AcLab(g, 3 / 8)} text="3" color={C.violet} opacity={ease(f, at(scene, 1, 0.8), 10)} />
        <Lab p={AcLab(g, 7 / 8)} text="1" color={C.violet} opacity={ease(f, at(scene, 1, 0.85), 10)} />
      </Stage>
      <Text x={PANEL} y={120} w={800} size={44} weight={900} color={C.muted} style={fadeUp(f, 0)}>
        一个新的三角形
      </Text>
      <Eq y={200} start={at(scene, 0, 0.55)} tex={'[ABC] = 84'} />
      <Eq y={310} start={at(scene, 1, 0.1)} tex={'BD = DC'} />
      <Eq y={420} start={at(scene, 1, 0.55)} tex={'AE : EC = 3 : 1'} />
      <GoalChip y={560} start={at(scene, 2, 0.3)} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = variant();
  const df = ease(f, at(scene, 0, 0.3), 22);
  const steps = ease(f, at(scene, 1, 0.1), 10);
  const fin = at(scene, 3, 0.97);
  const abd = ease(f, at(scene, 2, 0.3), 14);
  return (
    <>
      <Stage>
        <Fill pts={[g.A, g.B, g.D]} color={C.amber} opacity={abd} fo={0.2} />
        <Fig g={g} />
        <Ln a={g.D} b={g.F} p={df} dashed color={C.violet} width={7} />
        <Dot p={g.F} color={C.violet} opacity={ease(f, at(scene, 0, 0.8), 10)} />
        <Lab p={add(g.F, -14, 52)} text="F" color={C.violet} opacity={ease(f, at(scene, 0, 0.8), 10)} />
        <Chev a={g.D} b={g.F} t={0.5} color={C.violet} opacity={ease(f, at(scene, 0, 0.9), 8)} />
        <Chev a={g.B} b={g.E} t={0.5} color={C.violet} opacity={ease(f, at(scene, 0, 0.9), 8)} />
        <MidTicks g={g} op={1} />
        <Tk a={g.E} b={g.F} t={0.5} n={2} opacity={ease(f, at(scene, 0, 0.95), 8)} color={C.violet} />
        <Tk a={g.F} b={g.C} t={0.5} n={2} opacity={ease(f, at(scene, 0, 0.95), 8)} color={C.violet} />
        {range(7).map((k) => (
          <Tk key={k} a={g.A} b={g.C} t={(k + 1) / 8} opacity={steps} len={13} color={C.violet} />
        ))}
        <Lab p={AcLab(g, 3 / 8, 120)} text="6" color={C.violet} opacity={steps} />
        <Lab p={AcLab(g, 13 / 16, 120)} text="1" color={C.violet} opacity={steps} />
        <Lab p={AcLab(g, 15 / 16, 120)} text="1" color={C.violet} opacity={steps} />
      </Stage>
      <Eq y={130} start={at(scene, 1, 0.3)} size={54} color={C.violet} tex={'AP : PD = AE : EF = 6 : 1'} />
      <Eq y={240} start={at(scene, 1, 0.7)} size={56} tex={'AP = \\dfrac{6}{7}\\,AD'} />
      <Eq y={385} start={at(scene, 2, 0.15)} size={56} tex={'[ABD] = \\dfrac{84}{2} = 42'} />
      <Eq y={540} start={at(scene, 3, 0.1)} size={58} color={C.green} tex={'\\dfrac{6}{7} \\times 42'} />
      <Eq y={540} x={PANEL + 280} start={at(scene, 3, 0.8)} size={58} color={C.green} tex={'= 36'} />
      <Answer x={1730} y={700} value="36" chime={CHIME} start={fin} />
      <Confetti x={1730} y={700} start={fin} seed={11} />
      <Pill x={PANEL} y={700} color={C.primary} style={{ ...fadeUp(f, fin), fontSize: 44 }}>太棒了！</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3, 0));
  const t1 = ease(f, at(scene, 2, 0.2), 14) * cardOut;
  const t2 = ease(f, at(scene, 2, 0.55), 14) * cardOut;
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, height: 640, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 40, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 120, width: 1540, fontSize: 52, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.55)) }}>
          先求出交点把每条线分成了什么比，再用这个分数去乘一个更大三角形的面积。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 255, fontSize: 42, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 2, 0.1)) }}>两个工具</div>
      </div>
      <Stage>
        <g opacity={t1}>
          <Fill pts={[[330, 520], [190, 700], [450, 700]]} color={C.violet} opacity={1} fo={0.3} stroke={5} />
          <Fill pts={[[330, 520], [450, 700], [570, 700]]} color={C.amber} opacity={1} fo={0.3} stroke={5} />
          <Ln a={[330, 520]} b={[330, 700]} dashed color={C.ink} width={5} />
        </g>
        <g opacity={t2}>
          <Poly pts={[[1000, 520], [880, 700], [1200, 700]]} color={C.ink} width={6} />
          <Ln a={[940, 610]} b={[1100, 610]} color={C.violet} width={7} dashed />
        </g>
      </Stage>
      <Text x={380} y={725} w={560} size={40} weight={800} color={C.violet} align="center" style={{ opacity: t1 }}>
        同高三角形
      </Text>
      <Text x={1040} y={725} w={560} size={40} weight={800} color={C.violet} align="center" style={{ opacity: t2 }}>
        一条平行线
      </Text>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, '三角形 ABC 面积是 60，求 ABP 的面积。', false),
  rule: Rule,
  pieces: Pieces,
  equations: Equations,
  solve: Solve,
  parallel: Parallel,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, '面积 84，AE : EC = 3 : 1，求 ABP 的面积。', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

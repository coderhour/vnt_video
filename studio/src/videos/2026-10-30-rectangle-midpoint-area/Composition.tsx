import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-rectangle-midpoint-area';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates, y up) ----------
// A = (0, 0) bottom-left, B = (W, 0) bottom-right, C = (W, H) top-right, D = (0, H) top-left,
// M on the top side with MC = cm. P = where AC meets BM. Same set-up as verify.py.

type Geo = { W: number; H: number; cm: number; A: Pt; B: Pt; C: Pt; D: Pt; M: Pt; P: Pt };
const geo = (W: number, H: number, cm: number): Geo => {
  const t = W / (W + cm); // AP / AC (PAB is W / cm times PCM)
  return { W, H, cm, A: [0, 0], B: [W, 0], C: [W, H], D: [0, H], M: [W - cm, H], P: [t * W, t * H] };
};
const Q = geo(12, 8, 6); // the question: P = (8, 16/3)
const V = geo(15, 8, 5); // the variant:  P = (45/4, 6)

/** Maths coords → pixels: (ox, oy) is A on screen, `unit` px per 1. */
const plane = (ox: number, oy: number, unit: number) => (p: Pt): Pt => [ox + p[0] * unit, oy - p[1] * unit];
type Map = (p: Pt) => Pt;

// The working figure used by most scenes: 54 px per unit, A at (150, 780) → rectangle 648 × 432.
const MQ = plane(150, 780, 54);
const PANEL = 960;

// ---------- small drawing helpers ----------

const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 48, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

const Seg: React.FC<{ a: Pt; b: Pt; color: string; width?: number; opacity?: number; progress?: number; dash?: string }> = ({ a, b, color, width = 6, opacity = 1, progress = 1, dash }) =>
  opacity <= 0 || progress <= 0 ? null : (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * progress} y2={a[1] + (b[1] - a[1]) * progress} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} opacity={opacity} />
  );

/** Angle arc at vertex v between the rays to u1 and u2 (pixels). `n` = number of arcs. */
const Arc: React.FC<{ v: Pt; u1: Pt; u2: Pt; r?: number; color: string; opacity: number; n?: number }> = ({ v, u1, u2, r = 40, color, opacity, n = 1 }) => {
  if (opacity <= 0) return null;
  const a1 = Math.atan2(u1[1] - v[1], u1[0] - v[0]);
  let d = Math.atan2(u2[1] - v[1], u2[0] - v[0]) - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d <= -Math.PI) d += 2 * Math.PI;
  const a2 = a1 + d;
  return (
    <g opacity={opacity} stroke={color} strokeWidth={5} fill="none">
      {Array.from({ length: n }, (_, k) => {
        const R = r + k * 11;
        return <path key={k} d={`M ${v[0] + R * Math.cos(a1)} ${v[1] + R * Math.sin(a1)} A ${R} ${R} 0 0 ${d > 0 ? 1 : 0} ${v[0] + R * Math.cos(a2)} ${v[1] + R * Math.sin(a2)}`} />;
      })}
    </g>
  );
};

/** Little ">" arrow halfway along a side, to mark parallel sides. */
const ParallelMark: React.FC<{ a: Pt; b: Pt; color: string; opacity: number; at?: number }> = ({ a, b, color, opacity, at = 0.5 }) => {
  if (opacity <= 0) return null;
  const [mx, my] = [a[0] + (b[0] - a[0]) * at, a[1] + (b[1] - a[1]) * at];
  return (
    <g opacity={opacity} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${mx - 14} ${my - 14} L ${mx + 4} ${my} L ${mx - 14} ${my + 14}`} />
      <path d={`M ${mx + 4} ${my - 14} L ${mx + 22} ${my} L ${mx + 4} ${my + 14}`} />
    </g>
  );
};

/** Bracket along a vertical span (pixels), on the right, with an HTML maths label. */
const VBrace: React.FC<{ x: number; y1: number; y2: number; color: string; opacity: number }> = ({ x, y1, y2, color, opacity }) =>
  opacity <= 0 ? null : (
    <path d={`M ${x - 12} ${y1 + 4} L ${x} ${y1 + 4} L ${x} ${y2 - 4} L ${x - 12} ${y2 - 4}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
  );

/** HTML maths placed with its centre (or left edge) at a pixel point. */
const TexAt: React.FC<{ p: Pt; tex: string; size?: number; color?: string; opacity?: number; left?: boolean }> = ({ p, tex, size = 50, color = C.ink, opacity = 1, left }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: left ? 'translate(0, -50%)' : 'translate(-50%, -50%)', whiteSpace: 'nowrap', opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

/** A maths line on the right panel. */
const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** The rectangle with its diagonal, BM and the shaded region. Goes inside a <Stage>. */
const Figure: React.FC<{
  g: Geo; m: Map; draw?: number; lines?: number; shade?: number; shadeColor?: string; letters?: number; dims?: number; half?: number; letterSize?: number; children?: React.ReactNode;
}> = ({ g, m, draw = 1, lines = 1, shade = 1, shadeColor = C.primary, letters = 1, dims = 1, half = 0, letterSize = 48, children }) => {
  const rect: Pt[] = [g.A, g.B, g.C, g.D];
  const off = letterSize * 0.75;
  const [ax, ay] = m(g.A);
  const [cx, cy] = m(g.C);
  return (
    <>
      <Poly pts={rect.map(m)} color={C.ink} width={6} fill={C.card} fillOpacity={1} progress={draw} />
      <Poly pts={[g.A, g.P, g.M, g.D].map(m)} color={shadeColor} width={0} fill={shadeColor} fillOpacity={0.3} opacity={shade} />
      <Seg a={m(g.A)} b={m(g.C)} color={C.ink} width={5} progress={lines} />
      <Seg a={m(g.B)} b={m(g.M)} color={C.ink} width={5} progress={lines} />
      {children}
      <g opacity={letters}>
        <Label p={[ax - off, ay + off * 0.8]} text="A" size={letterSize} />
        <Label p={[cx + off, ay + off * 0.8]} text="B" size={letterSize} />
        <Label p={[cx + off, cy - off * 0.8]} text="C" size={letterSize} />
        <Label p={[ax - off, cy - off * 0.8]} text="D" size={letterSize} />
        <Label p={[m(g.M)[0], cy - off * 0.9]} text="M" size={letterSize} />
        <g opacity={lines >= 1 ? 1 : 0}>
          <Label p={[m(g.P)[0] + off * 1.05, m(g.P)[1] + 2]} text="P" size={letterSize} />
          <circle cx={m(g.P)[0]} cy={m(g.P)[1]} r={8} fill={C.ink} />
        </g>
        <circle cx={m(g.M)[0]} cy={m(g.M)[1]} r={8} fill={C.ink} />
      </g>
      <g opacity={dims}>
        <Label p={[(ax + cx) / 2, ay + off * 0.9]} text={String(g.W)} size={letterSize} color={C.muted} />
        <Label p={[ax - off * 0.95, (ay + cy) / 2]} text={String(g.H)} size={letterSize} color={C.muted} />
      </g>
      <g opacity={half}>
        <Label p={[(ax + m(g.M)[0]) / 2, cy - off * 0.8]} text={String(g.W - g.cm)} size={letterSize} color={C.violet} />
        <Label p={[(m(g.M)[0] + cx) / 2, cy - off * 0.8]} text={String(g.cm)} size={letterSize} color={C.violet} />
      </g>
    </>
  );
};

/** The two similar triangles: PCM (top, red) and PAB (bottom, blue). */
const TOP = (g: Geo): Pt[] => [g.P, g.C, g.M];
const BOT = (g: Geo): Pt[] => [g.P, g.A, g.B];

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(560, 800, 50);
  const strike = at(scene, 1, 0.55);
  const piece = at(scene, 2, 0.4);
  return (
    <>
      <Text x={960} y={130} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        What's the shaded area?
      </Text>
      <Stage>
        <Figure g={Q} m={m} draw={ease(f, 6, 18)} lines={ease(f, 16, 16)} shade={ease(f, 26, 14)} dims={0} letterSize={44} />
        <Poly pts={TOP(Q).map(m)} color={C.amber} width={6} fill={C.amber} fillOpacity={0.45} opacity={ease(f, piece, 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 1330, top: 380, fontSize: 96, fontWeight: 900, color: C.red, ...fadeUp(f, at(scene, 1, 0.2)) }}>
        <span style={{ textDecoration: f > strike ? 'line-through' : 'none' }}>48?</span>
      </div>
      <Text x={1330} y={510} w={480} size={48} weight={900} color={C.amber} style={fadeUp(f, piece + 6)}>
        a piece was forgotten!
      </Text>
      <div style={{ position: 'absolute', left: 150, top: 470, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CHOICES = ['40', '44', '48', '52', '56'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(1290, 650, 40); // 480 × 320
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 170, width: 1040, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        Rectangle <i>ABCD</i> is <Mark on={at(scene, 1, 0.25)}>12 by 8</Mark>, and <i>M</i> is the <Mark on={at(scene, 1, 0.65)}>midpoint of <i>CD</i></Mark>. Diagonal <i>AC</i> meets <i>BM</i> at{' '}
        <Mark on={at(scene, 2, 0.6)}><i>P</i></Mark>. What is the <Mark on={at(scene, 3, 0.4)}>area of the shaded region <i>APMD</i></Mark>?
      </div>
      <Choices x={90} y={650} items={CHOICES.map((c) => <Tex key={c} tex={c} size={54} />)} start={(i) => at(scene, 4, 0.1 + i * 0.12)} />
      <Stage>
        <Figure g={Q} m={m} draw={ease(f, 8, 18)} lines={ease(f, at(scene, 2, 0.2), 20)} shade={ease(f, at(scene, 3, 0.3), 14)} letters={ease(f, 20, 12)} dims={ease(f, at(scene, 1, 0.3), 10)} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const go = at(scene, 0, 0.3);
  const dots: Pt[] = [Q.A, Q.B, Q.C, Q.D];
  const corners = [Q.A, Q.P, Q.M, Q.D];
  return (
    <>
      <Stage>
        <Figure g={Q} m={MQ} half={ease(f, at(scene, 1, 0.4), 10)} shade={0.35 + 0.65 * ease(f, at(scene, 2, 0.1), 12)} />
        {dots.map((p, i) => {
          const s = ease(f, go + i * 14, 8) * fadeTo(f, go + i * 14 + 14, 0);
          return s > 0 ? <circle key={i} cx={MQ(p)[0]} cy={MQ(p)[1]} r={26} fill="none" stroke={C.violet} strokeWidth={6} opacity={s} /> : null;
        })}
        {corners.map((p, i) => {
          const s = ease(f, at(scene, 2, 0.3 + i * 0.12), 8);
          return s > 0 ? <circle key={i} cx={MQ(p)[0]} cy={MQ(p)[1]} r={22} fill="none" stroke={C.primary} strokeWidth={6} opacity={s} /> : null;
        })}
        <Label p={MQ([3.2, 6.2])} text="?" size={110} color={C.primary} opacity={ease(f, at(scene, 3, 0.3), 12)} />
      </Stage>
      <Check x={PANEL} y={220} start={at(scene, 0, 0.1)}>Rectangle 12 by 8</Check>
      <Check x={PANEL} y={320} start={at(scene, 1, 0.3)}>
        <span>
          <i>M</i> in the middle: 6 and 6
        </span>
      </Check>
      <Check x={PANEL} y={420} start={at(scene, 2, 0.1)}>
        <span>
          Shaded: <i>A</i>, <i>P</i>, <i>M</i>, <i>D</i>
        </span>
      </Check>
      <Text x={PANEL} y={560} w={880} size={48} weight={800} color={C.violet} style={fadeUp(f, at(scene, 3, 0.2))}>
        Not a rectangle, not a triangle… so how?
      </Text>
    </>
  );
};

const makePause = (g: Geo, seconds: number, prompt: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const unit = g.W === 12 ? 48 : 42;
  const m = plane(150, 790, unit);
  return (
    <>
      <Stage>
        <Figure g={g} m={m} half={1} />
      </Stage>
      <Text x={110} y={150} w={820} size={48} align="left" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} />
    </>
  );
};

const Big: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tri = ease(f, at(scene, 1, 0.2), 16);
  const cut = ease(f, at(scene, 3, 0.55), 12);
  return (
    <>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.4))}>Big triangle − small triangle</Pill>
      <Stage>
        <Figure g={Q} m={MQ} shade={1 - tri * 0.7} />
        <Poly pts={[Q.A, Q.C, Q.D].map(MQ)} color={C.violet} width={8} fill={C.violet} fillOpacity={0.22} progress={tri} />
        <Poly pts={TOP(Q).map(MQ)} color={C.red} width={6} fill={C.red} fillOpacity={0.35} opacity={cut} />
      </Stage>
      <Eq y={310} start={at(scene, 1, 0.4)} color={C.violet} tex="ACD = \text{half the rectangle}" />
      <Eq y={410} start={at(scene, 2, 0.15)} tex="12 \times 8 = 96" />
      <Eq y={500} start={at(scene, 2, 0.6)} color={C.violet} tex="\dfrac{96}{2} = 48" />
      <Eq y={650} start={at(scene, 3, 0.6)} size={58} tex="APMD = 48 - {\color{#ef4343}PCM}" />
    </>
  );
};

/** Similar-triangle overlays on the main figure. */
const SimilarMarks: React.FC<{ g: Geo; m: Map; tri: number; angles: number; heights: number; parts: number}> = ({ g, m, tri, angles, heights, parts }) => {
  const [P, Cc, M, A, B] = [m(g.P), m(g.C), m(g.M), m(g.A), m(g.B)];
  const bx = m(g.C)[0] + 30;
  return (
    <>
      <Poly pts={TOP(g).map(m)} color={C.red} width={6} fill={C.red} fillOpacity={0.3} opacity={tri} />
      <Poly pts={BOT(g).map(m)} color={C.blue} width={6} fill={C.blue} fillOpacity={0.22} opacity={tri} />
      <ParallelMark a={M} b={Cc} color={C.amber} opacity={angles} at={0.72} />
      <ParallelMark a={A} b={B} color={C.amber} opacity={angles} at={0.25} />
      <Arc v={Cc} u1={M} u2={P} color={C.amber} opacity={angles} r={52} />
      <Arc v={A} u1={B} u2={P} color={C.amber} opacity={angles} r={70} />
      <Arc v={M} u1={Cc} u2={P} color={C.violet} opacity={angles} r={40} n={2} />
      <Arc v={B} u1={A} u2={P} color={C.violet} opacity={angles} r={56} n={2} />
      <Seg a={P} b={[P[0], Cc[1]]} color={C.red} width={6} dash="12 10" opacity={heights} />
      <Seg a={P} b={[P[0], A[1]]} color={C.blue} width={6} dash="12 10" opacity={heights} />
      <Seg a={P} b={[bx, P[1]]} color={C.muted} width={3} dash="8 8" opacity={parts} />
      <VBrace x={bx} y1={Cc[1]} y2={P[1]} color={C.red} opacity={parts} />
      <VBrace x={bx} y1={P[1]} y2={A[1]} color={C.blue} opacity={parts} />
    </>
  );
};

const Similar: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tri = ease(f, at(scene, 0, 0.1), 12);
  const bot = ease(f, at(scene, 1, 0.1), 12);
  const angles = ease(f, at(scene, 2, 0.15), 14);
  const heights = ease(f, at(scene, 3, 0.55), 12);
  const parts = ease(f, at(scene, 4, 0.3), 12);
  const vals = ease(f, at(scene, 5, 0.2), 12);
  const bx = MQ(Q.C)[0] + 30;
  const P = MQ(Q.P);
  return (
    <>
      <Stage>
        <Figure g={Q} m={MQ} shade={0.25} dims={0} />
        <Poly pts={TOP(Q).map(MQ)} color={C.red} width={6} fill={C.red} fillOpacity={0.3} opacity={tri} />
        <Poly pts={BOT(Q).map(MQ)} color={C.blue} width={6} fill={C.blue} fillOpacity={0.22} opacity={bot} />
        <SimilarMarks g={Q} m={MQ} tri={0} angles={angles} heights={heights} parts={parts} />
        <Label p={[(MQ(Q.M)[0] + MQ(Q.C)[0]) / 2, MQ(Q.C)[1] - 36]} text="6" color={C.red} opacity={tri} />
        <Label p={[(MQ(Q.A)[0] + MQ(Q.B)[0]) / 2, MQ(Q.A)[1] + 36]} text="12" color={C.blue} opacity={bot} />
        <Label p={[MQ(Q.A)[0] - 40, (MQ(Q.A)[1] + MQ(Q.D)[1]) / 2]} text="8" color={C.muted} opacity={parts} />
      </Stage>
      <TexAt p={[bx + 22, (MQ(Q.C)[1] + P[1]) / 2]} left tex={vals > 0 ? '\\dfrac{8}{3}' : '1'} color={C.red} size={vals > 0 ? 48 : 52} opacity={parts} />
      <TexAt p={[bx + 22, (P[1] + MQ(Q.A)[1]) / 2]} left tex={vals > 0 ? '\\dfrac{16}{3}' : '2'} color={C.blue} size={vals > 0 ? 48 : 52} opacity={parts} />
      <Eq y={170} start={at(scene, 0, 0.3)} color={C.red} tex="PCM: \text{ base } 6, \text{ height } ?" />
      <Eq y={260} start={at(scene, 1, 0.35)} color={C.blue} tex="PAB: \text{ base } 12" />
      <Text x={PANEL} y={350} w={900} size={44} weight={800} color={C.amber} style={fadeUp(f, at(scene, 2, 0.3))}>
        <span style={{ whiteSpace: 'nowrap' }}>Parallel sides → same angles → similar</span>
      </Text>
      <Eq y={430} start={at(scene, 3, 0.2)} tex="6 = \text{half of } 12 \;\Rightarrow\; \text{half as tall}" />
      <Eq y={525} start={at(scene, 4, 0.3)} tex="8 = {\color{#ef4343}1 \text{ part}} + {\color{#3c83f6}2 \text{ parts}}" />
      <Eq y={630} start={at(scene, 5, 0.1)} size={58} tex="1 \text{ part} = \dfrac{8}{3}" color={C.red} />
    </>
  );
};

const Subtract: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 2, 0.97);
  const P = MQ(Q.P);
  return (
    <>
      <Stage>
        <Figure g={Q} m={MQ} dims={0} shade={ease(f, at(scene, 2, 0.4), 12)} shadeColor={C.green} />
        <Poly pts={TOP(Q).map(MQ)} color={C.red} width={6} fill={C.red} fillOpacity={0.3} opacity={fadeTo(f, at(scene, 2, 0.4), 0.4)} />
        <Seg a={P} b={[P[0], MQ(Q.C)[1]]} color={C.red} width={6} dash="12 10" />
        <Label p={[(MQ(Q.M)[0] + MQ(Q.C)[0]) / 2, MQ(Q.C)[1] - 36]} text="6" color={C.red} />
        <Seg a={P} b={[MQ(Q.C)[0] + 30, P[1]]} color={C.muted} width={3} dash="8 8" />
        <VBrace x={MQ(Q.C)[0] + 30} y1={MQ(Q.C)[1]} y2={P[1]} color={C.red} opacity={1} />
      </Stage>
      <TexAt p={[MQ(Q.C)[0] + 52, (MQ(Q.C)[1] + P[1]) / 2]} left tex="\dfrac{8}{3}" color={C.red} size={48} opacity={1} />
      <Eq y={170} start={at(scene, 0, 0.3)} tex="\text{area} = \dfrac{\text{base} \times \text{height}}{2}" />
      <Eq y={320} start={at(scene, 1, 0.1)} tex="6 \times \dfrac{8}{3} = 16" />
      <Eq y={450} start={at(scene, 1, 0.6)} color={C.red} tex="PCM = \dfrac{16}{2} = 8" />
      <Eq y={600} start={at(scene, 2, 0.15)} size={66} color={C.green} tex="48 - 8 = 40" />
      <Answer x={1640} y={640} value="A" chime={CHIME} start={done} />
      <Confetti x={1640} y={640} start={done} seed={5} />
    </>
  );
};

const Split: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cut = ease(f, at(scene, 0, 0.5), 16);
  const two = ease(f, at(scene, 1, 0.15), 12);
  const amc = ease(f, at(scene, 3, 0.3), 12) * fadeTo(f, at(scene, 10), 0.4);
  const ratio = ease(f, at(scene, 5, 0.2), 12);
  const outro = fadeTo(f, at(scene, 9, 0.05), 0);
  const heightOn = ease(f, at(scene, 6, 0.5), 12) * fadeTo(f, at(scene, 8), 0);
  const baseOn = ease(f, at(scene, 7, 0.3), 12) * fadeTo(f, at(scene, 9), 0);
  // Foot of the perpendicular from M to AC (the shared height of APM and AMC).
  const tq = (Q.M[0] * Q.C[0] + Q.M[1] * Q.C[1]) / (Q.C[0] ** 2 + Q.C[1] ** 2);
  const foot = MQ([Q.C[0] * tq, Q.C[1] * tq]);
  const [A, P, M, Cc] = [MQ(Q.A), MQ(Q.P), MQ(Q.M), MQ(Q.C)];
  // Tick marks: AC cut into 3 equal parts (P at 2 of them).
  const thirds = [1, 2].map((k): Pt => MQ([(Q.C[0] * k) / 3, (Q.C[1] * k) / 3]));
  const dir = [Cc[0] - A[0], Cc[1] - A[1]];
  const len = Math.hypot(dir[0], dir[1]);
  const nrm: Pt = [(-dir[1] / len) * 16, (dir[0] / len) * 16];
  return (
    <>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Cut along AM</Pill>
      <Stage>
        <Figure g={Q} m={MQ} shade={1 - two} dims={0} />
        <Poly pts={[Q.A, Q.D, Q.M].map(MQ)} color={C.primary} width={0} fill={C.primary} fillOpacity={0.35} opacity={two} />
        <Poly pts={[Q.A, Q.P, Q.M].map(MQ)} color={C.violet} width={0} fill={C.violet} fillOpacity={0.3} opacity={two} />
        <Poly pts={[Q.A, Q.M, Q.C].map(MQ)} color={C.violet} width={7} dashed opacity={amc} />
        <Seg a={A} b={M} color={C.ink} width={6} progress={cut} />
        <Label p={[(MQ(Q.D)[0] + M[0]) / 2, Cc[1] - 36]} text="6" color={C.primary} opacity={ease(f, at(scene, 2, 0.2), 10)} />
        <Label p={[A[0] - 40, (A[1] + Cc[1]) / 2]} text="8" color={f >= at(scene, 4, 0.4) && f < at(scene, 5) ? C.violet : C.primary} opacity={ease(f, at(scene, 2, 0.2), 10)} />
        <Label p={[(M[0] + Cc[0]) / 2, Cc[1] - 36]} text="6" color={C.violet} opacity={ease(f, at(scene, 4, 0.15), 10)} />
        <Seg a={A} b={MQ(Q.D)} color={C.violet} width={9} opacity={ease(f, at(scene, 4, 0.4), 10) * fadeTo(f, at(scene, 5), 0)} />
        <g opacity={ratio}>
          {thirds.map((t, i) => (
            <line key={i} x1={t[0] - nrm[0]} y1={t[1] - nrm[1]} x2={t[0] + nrm[0]} y2={t[1] + nrm[1]} stroke={C.amber} strokeWidth={6} strokeLinecap="round" />
          ))}
          <Seg a={A} b={P} color={C.amber} width={9} opacity={0.8} />
        </g>
        <Seg a={P} b={Cc} color={C.violet} width={9} opacity={baseOn * 0.8} />
        <Seg a={M} b={foot} color={C.violet} width={5} dash="12 10" opacity={heightOn} />
        <Label p={[(M[0] + foot[0]) / 2 + 28, (M[1] + foot[1]) / 2 - 4]} text="h" color={C.violet} opacity={heightOn} />
      </Stage>
      <div style={{ opacity: outro }}>
        <Eq y={250} size={50} start={at(scene, 2, 0.3)} color={C.primary} tex="ADM: \; 6 \times 8 = 48, \;\; 48 \div 2 = 24" />
        <Eq y={350} start={at(scene, 4, 0.3)} color={C.violet} tex="AMC: \; 6 \times 8 \div 2 = 24" />
        <Eq y={440} start={at(scene, 5, 0.5)} color={C.amber} tex="AP = \dfrac{2}{3} \text{ of } AC" />
        <Eq y={580} start={at(scene, 8, 0.1)} color={C.violet} tex="APM = \dfrac{2}{3} \times 24 = 16" />
        <Eq y={735} start={at(scene, 8, 0.55)} size={60} color={C.green} tex="24 + 16 = 40" />
      </div>
      <div style={{ opacity: ease(f, at(scene, 9, 0.2), 12) }}>
        <div style={{ position: 'absolute', left: PANEL, top: 300, width: 860, background: C.card, borderRadius: 24, padding: '20px 30px', fontSize: 42, fontWeight: 800, boxShadow: '0 6px 20px rgba(30,40,80,0.07)' }}>
          <span style={{ color: C.violet }}>Subtract:</span> a big triangle is easy to see
        </div>
      </div>
      <div style={{ opacity: ease(f, at(scene, 10, 0.1), 12) }}>
        <div style={{ position: 'absolute', left: PANEL, top: 450, width: 860, background: C.card, borderRadius: 24, padding: '20px 30px', fontSize: 42, fontWeight: 800, boxShadow: '0 6px 20px rgba(30,40,80,0.07)' }}>
          <span style={{ color: C.primary }}>Split:</span> a point cuts a line into known parts
        </div>
      </div>
    </>
  );
};

// Trap cards: which region each wrong choice actually measured.
const Mini: React.FC<{ kind: number; on: number }> = ({ kind, on }) => {
  const m = plane(16, 186, 22); // 264 × 176 inside a 300 × 210 svg
  const g = Q;
  const rest: Pt[][] = [BOT(g), [g.P, g.B, g.C], TOP(g)];
  return (
    <svg width={300} height={210} viewBox="0 0 300 210">
      <Poly pts={[g.A, g.B, g.C, g.D].map(m)} color={C.ink} width={3} fill={C.card} fillOpacity={1} />
      {kind === 0 && <Poly pts={[g.A, g.P, g.M, g.D].map(m)} color={C.green} width={0} fill={C.green} fillOpacity={0.45 * on} />}
      {kind === 2 && (
        <>
          <Poly pts={[g.A, g.C, g.D].map(m)} color={C.red} width={0} fill={C.red} fillOpacity={0.3 * on} />
          <Poly pts={TOP(g).map(m)} color={C.red} width={3} fill={C.red} fillOpacity={0.5 * on} />
        </>
      )}
      {kind === 1 && (
        <>
          <Poly pts={[g.A, g.P, g.M, g.D].map(m)} color={C.red} width={0} fill={C.red} fillOpacity={0.3 * on} />
          <Poly pts={[g.P, g.C, [9, 8] as Pt].map(m)} color={C.red} width={0} fill={C.red} fillOpacity={0.35 * on} />
        </>
      )}
      {kind === 4 && rest.map((r, i) => <Poly key={i} pts={r.map(m)} color={C.red} width={0} fill={C.red} fillOpacity={(0.2 + i * 0.12) * on} />)}
      {kind === 3 && <Poly pts={[g.A, g.C, g.D].map(m)} color={C.red} width={4} dashed opacity={on} />}
      <line x1={m(g.A)[0]} y1={m(g.A)[1]} x2={m(g.C)[0]} y2={m(g.C)[1]} stroke={C.ink} strokeWidth={2.5} />
      <line x1={m(g.B)[0]} y1={m(g.B)[1]} x2={m(g.M)[0]} y2={m(g.M)[1]} stroke={C.ink} strokeWidth={2.5} />
    </svg>
  );
};

const NOTES = ['', 'took off half', 'kept the corner', 'too big', 'the unshaded part'];
const TRAP_TEX = ['', '48 - 4 = 44', '48 - 0 = 48', '52 > 48', '96 - 40 = 56'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // choice index → line where it is explained (C, B, E, D in that order)
  const lineOf: Record<number, number> = { 2: 0, 1: 1, 4: 2, 3: 3 };
  const cur = [0, 1, 2, 3, 4].findIndex((i) => i in lineOf && f >= at(scene, lineOf[i]) && f < at(scene, lineOf[i] + 1));
  const habit = at(scene, 4);
  return (
    <>
      <div style={{ position: 'absolute', left: 115, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const start = i === 0 ? habit : at(scene, lineOf[i], 0.05);
          const shown = f >= start;
          const right = i === 0;
          const border = !shown ? 'transparent' : right ? C.green : C.red;
          const on = ease(f, start, 12);
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 380, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative', opacity: cur >= 0 && cur !== i && !(f >= habit) ? 0.55 : 1 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: C.muted, marginTop: 8, lineHeight: 1.1 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 100, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={64} color={!shown ? C.ink : right ? C.green : C.red} />
                </div>
                <Mini kind={i} on={on} />
                {shown && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: right ? C.green : C.red, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {right ? '✓' : '✗'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 14, fontSize: 34, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, color: C.red, ...fadeUp(f, start + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', opacity: cur === i ? ease(f, at(scene, lineOf[i], 0.3), 10) : 0 }}>
          <Tex tex={TRAP_TEX[i]} size={60} color={C.red} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 410, top: 660, width: 1100, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '18px 40px', fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.3)) }}>
        After you subtract, check what's left!
      </div>
    </>
  );
};

const MV = plane(1150, 700, 42); // variant figure on the right: 630 × 336

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={110} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>Your turn!</Pill>
      <Text x={110} y={280} w={900} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        Rectangle 15 by 8
      </Text>
      <Text x={110} y={380} w={920} size={48} weight={700} style={fadeUp(f, at(scene, 1, 0.1))}>
        <i>M</i> is on <i>CD</i> with <b style={{ color: C.violet }}>MC = 5</b>. Diagonal <i>AC</i> meets <i>BM</i> at <i>P</i>.
      </Text>
      <Text x={110} y={560} w={920} size={52} weight={900} color={C.primary} style={fadeUp(f, at(scene, 2, 0.1))}>
        Area of the shaded APMD?
      </Text>
      <Stage>
        <Figure
          g={V}
          m={MV}
          draw={ease(f, at(scene, 0, 0.4), 18)}
          lines={ease(f, at(scene, 1, 0.5), 18)}
          shade={ease(f, at(scene, 2, 0.2), 12)}
          letters={ease(f, at(scene, 0, 0.6), 10)}
          dims={ease(f, at(scene, 0, 0.6), 10)}
          half={ease(f, at(scene, 1, 0.3), 10)}
        />
      </Stage>
    </>
  );
};

const MV2 = plane(150, 770, 44); // variant working figure: 660 × 352

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 8, 0.97);
  const ap = ease(f, at(scene, 6, 0.15), 12);
  const quarters = [1, 2, 3].map((k): Pt => MV2([(V.C[0] * k) / 4, (V.C[1] * k) / 4]));
  const vd = [MV2(V.C)[0] - MV2(V.A)[0], MV2(V.C)[1] - MV2(V.A)[1]];
  const vl = Math.hypot(vd[0], vd[1]);
  const vn: Pt = [(-vd[1] / vl) * 16, (vd[0] / vl) * 16];
  const sim = ease(f, at(scene, 0, 0.2), 12);
  const parts = ease(f, at(scene, 2, 0.3), 12);
  const vals = ease(f, at(scene, 2, 0.7), 10);
  const big = ease(f, at(scene, 4, 0.1), 12) * fadeTo(f, at(scene, 5), 0);
  const split = ease(f, at(scene, 5, 0.1), 12);
  const bx = MV2(V.C)[0] + 30;
  const P = MV2(V.P);
  const first = fadeTo(f, at(scene, 5, 0.05), 0);
  return (
    <>
      <Stage>
        <Figure g={V} m={MV2} shade={1 - split} half={1 - split} dims={1} letterSize={46} />
        <SimilarMarks g={V} m={MV2} tri={sim * (1 - split)} angles={0} heights={parts * (1 - split)} parts={parts * (1 - split)} />
        <Poly pts={[V.A, V.C, V.D].map(MV2)} color={C.violet} width={7} fill={C.violet} fillOpacity={0.15} opacity={big} />
        <Poly pts={[V.A, V.D, V.M].map(MV2)} color={C.primary} width={0} fill={C.primary} fillOpacity={0.35} opacity={split} />
        <Poly pts={[V.A, V.P, V.M].map(MV2)} color={C.violet} width={0} fill={C.violet} fillOpacity={0.3} opacity={split} />
        <Poly pts={[V.A, V.M, V.C].map(MV2)} color={C.violet} width={6} dashed opacity={ease(f, at(scene, 5, 0.6), 10)} />
        <Seg a={MV2(V.A)} b={MV2(V.M)} color={C.ink} width={5} opacity={split} />
        <g opacity={ap}>
          {quarters.map((t, i) => (
            <line key={i} x1={t[0] - vn[0]} y1={t[1] - vn[1]} x2={t[0] + vn[0]} y2={t[1] + vn[1]} stroke={C.amber} strokeWidth={6} strokeLinecap="round" />
          ))}
          <Seg a={MV2(V.A)} b={P} color={C.amber} width={9} opacity={0.8} />
        </g>
      </Stage>
      <TexAt p={[bx + 22, (MV2(V.C)[1] + P[1]) / 2]} left tex={vals > 0 ? '2' : '1'} color={C.red} size={52} opacity={parts * (1 - split)} />
      <TexAt p={[bx + 22, (P[1] + MV2(V.A)[1]) / 2]} left tex={vals > 0 ? '6' : '3'} color={C.blue} size={52} opacity={parts * (1 - split)} />
      <div style={{ opacity: first }}>
        <Eq y={160} start={at(scene, 0, 0.3)} tex="{\color{#ef4343}5} : {\color{#3c83f6}15} = 1 : 3" />
        <Eq y={245} start={at(scene, 2, 0.2)} tex="8 = 1 + 3 \text{ parts}, \; 1 \text{ part} = 2" />
        <Eq y={335} start={at(scene, 3, 0.3)} color={C.red} tex="PCM = 5 \times 2 \div 2 = 5" />
        <Eq y={425} start={at(scene, 4, 0.2)} color={C.violet} tex="ACD = 15 \times 8 \div 2 = 60" />
        <Eq y={535} start={at(scene, 4, 0.7)} size={64} color={C.green} tex="60 - 5 = 55" />
      </div>
      <Eq y={160} start={at(scene, 5, 0.3)} color={C.primary} tex="ADM = 10 \times 8 \div 2 = 40" />
      <Eq y={255} start={at(scene, 5, 0.7)} color={C.violet} tex="AMC = 5 \times 8 \div 2 = 20" />
      <Eq y={355} start={at(scene, 6, 0.2)} color={C.amber} tex="AP = \dfrac{3}{4} \text{ of } AC" />
      <Eq y={505} start={at(scene, 7, 0.3)} color={C.violet} tex="APM = \dfrac{3}{4} \times 20 = 15" />
      <Eq y={665} start={at(scene, 8, 0.2)} size={64} color={C.green} tex="40 + 15 = 55" />
      <Answer x={1720} y={600} value="55" chime={CHIME} start={done} />
      <Confetti x={1720} y={600} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const m = plane(1230, 640, 36); // 432 × 288
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 160, width: 1600, height: 620, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 880, fontSize: 56, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Lines cross? Look for <span style={{ color: C.red }}>similar triangles</span> to find the point.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 380, width: 880, fontSize: 52, fontWeight: 800, color: C.violet, lineHeight: 1.25, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Then take a big triangle, and subtract the piece you don't want.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.4), 14) * cardOut}>
          <Figure g={Q} m={m} letterSize={40} dims={0} shade={0.6} />
          <Poly pts={TOP(Q).map(m)} color={C.red} width={4} fill={C.red} fillOpacity={0.3} />
          <Poly pts={BOT(Q).map(m)} color={C.blue} width={4} fill={C.blue} fillOpacity={0.2} />
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
  try1: makePause(Q, 10, <>Rectangle 12 by 8, <i>M</i> the midpoint of <i>CD</i>. Area of the shaded <i>APMD</i>?</>),
  big: Big,
  similar: Similar,
  subtract: Subtract,
  split: Split,
  traps: Traps,
  variant: Variant,
  try2: makePause(V, 12, <>Rectangle 15 by 8, <b style={{ color: C.violet }}>MC = 5</b>. Area of the shaded <i>APMD</i>?</>),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

/** Captions: non-breaking hyphens inside number words ("forty-eight") so they never split across lines. */
const nbsp = (t: Timeline): Timeline => ({
  ...t,
  scenes: t.scenes.map((s) => ({ ...s, lines: s.lines.map((l) => ({ ...l, caption: l.caption.replace(/(?<=[a-z])-(?=[a-z])/g, '\u2011') })) })),
});

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline: raw }) => {
  const timeline = raw ? nbsp(raw) : null;
  return timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

};

import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Countdown } from '../../lib/PauseCard';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Poly, Stage, Step, type Pt } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { SignOff } from '../../lib/Brand';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-29-triangle-in-square-zh';
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

// ---------- geometry (unit square, maths coordinates) ----------
// The square's bottom-left corner is (0, 0) and y grows UPWARD (maths style), so on screen the pinned
// corner is bottom-left, the "gap on the right side" goes up from the bottom-right corner, and the
// "gap along the top" goes right from the top-left corner. Narration directions follow this picture.

export const R3 = Math.sqrt(3);
export const T = 2 - R3; // the gap x, about 0.268
export const D2R = Math.PI / 180;

/** Maths coords → pixels: (ox, oy) is the square's bottom-left corner on screen, `unit` px per 1. */
export const plane = (ox: number, oy: number, unit: number) => (p: Pt): Pt => [ox + p[0] * unit, oy - p[1] * unit];

/** Equilateral triangle with a vertex at the corner, one side `a` degrees above the bottom edge. */
export const tri = (a: number, s: number): Pt[] => [
  [0, 0],
  [s * Math.cos(a * D2R), s * Math.sin(a * D2R)],
  [s * Math.cos((a + 60) * D2R), s * Math.sin((a + 60) * D2R)],
];

/** The biggest side that still fits at angle a (0…30): same formula as verify.py. */
export const fitSide = (a: number) => Math.min(1 / Math.cos(a * D2R), 1 / Math.sin((a + 60) * D2R));

export const SQ: Pt[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
export const BEST: Pt[] = [[0, 0], [1, T], [T, 1]];
export const FLAT = tri(0, 1);
const LONG_R: Pt[] = [[0, 0], [1, 0], [1, T]]; // right triangle under the bottom side
const LONG_T: Pt[] = [[0, 0], [T, 1], [0, 1]]; // right triangle beside the left side
const CORNER: Pt[] = [[1, T], [1, 1], [T, 1]];

// The working square used by most scenes: 560 px, bottom-left at (200, 790).
const P = plane(200, 790, 560);
const PANEL = 880;

// ---------- small drawing helpers ----------

export const Square: React.FC<{ at: (p: Pt) => Pt; progress?: number; opacity?: number; fill?: boolean }> = ({ at: m, progress = 1, opacity = 1, fill = true }) => (
  <Poly pts={SQ.map(m)} color={C.ink} width={6} fill={fill ? C.card : undefined} fillOpacity={1} progress={progress} opacity={opacity} />
);

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 40, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** Bracket along a side of the square, from a to b (pixels), pushed out by (dx, dy). */
const Brace: React.FC<{ a: Pt; b: Pt; dx: number; dy: number; color: string; opacity: number; label: string }> = ({ a, b, dx, dy, color, opacity, label }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${a[0] + dx * 0.4} ${a[1] + dy * 0.4} L ${a[0] + dx} ${a[1] + dy} L ${b[0] + dx} ${b[1] + dy} L ${b[0] + dx * 0.4} ${b[1] + dy * 0.4}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label p={[(a[0] + b[0]) / 2 + dx * 2.1, (a[1] + b[1]) / 2 + dy * 2.1]} text={label} color={color} size={52} />
    </g>
  );

export const Ring: React.FC<{ p: Pt; color: string; opacity: number }> = ({ p, color, opacity }) =>
  opacity <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={24} fill="none" stroke={color} strokeWidth={6} opacity={opacity} />;

/** Equal-side tick marks on each side of a triangle. */
export const Ticks: React.FC<{ pts: Pt[]; color: string; opacity: number }> = ({ pts, color, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={color} strokeWidth={6} strokeLinecap="round">
      {pts.map((a, i) => {
        const b = pts[(i + 1) % 3];
        const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const [nx, ny] = [(-(b[1] - a[1]) / len) * 16, ((b[0] - a[0]) / len) * 16];
        return <line key={i} x1={mx - nx} y1={my - ny} x2={mx + nx} y2={my + ny} />;
      })}
    </g>
  );

/** A maths line on the right panel. */
const Eq: React.FC<{ y: number; tex: string | Part[]; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Green box around a key result. */
const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; opacity?: number }> = ({ x, y, w, h, start, opacity = 1 }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) * opacity }} />;
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(760, 800, 500);
  const big = at(scene, 1, 0.6);
  return (
    <>
      <Text x={960} y={110} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        能放下多大的三角形？
      </Text>
      <Stage>
        <Square at={m} progress={ease(f, 6, 18)} />
        <Poly pts={FLAT.map(m)} color={C.primary} fill={C.primary} progress={ease(f, at(scene, 1, 0.05), 18)} opacity={fadeTo(f, big + 20, 0.35)} />
        <Poly pts={BEST.map(m)} color={C.violet} fill={C.violet} width={8} progress={ease(f, big, 18)} />
      </Stage>
      <Text x={1330} y={600} w={500} size={52} weight={900} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.1)), textDecoration: f > big ? 'line-through' : 'none' }}>
        平放？
      </Text>
      <Text x={1330} y={440} w={520} size={64} weight={900} color={C.violet} style={fadeUp(f, big + 10)}>
        斜着放：更大！
      </Text>
      <div style={{ position: 'absolute', left: 230, top: 560, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CHOICES = ['\\frac{\\sqrt{3}}{4}', '\\frac{3\\sqrt{2}-\\sqrt{6}}{4}', '2\\sqrt{3}-3', '\\frac{\\sqrt{3}}{3}', '\\frac{\\sqrt{3}}{2}'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(1400, 700, 400);
  const small = tri(20, 0.6).map(([x, y]): Pt => [x + 0.28, y + 0.12]);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1000, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 48, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        一个正方形，<Mark on={at(scene, 1, 0.3)}>边长为 1</Mark>。<Mark on={at(scene, 2, 0.1)}>能放进这个正方形里</Mark>的
        <Mark on={at(scene, 2, 0.45)}>最大等边三角形</Mark>，面积是多少？
      </div>
      <Choices x={100} y={600} items={CHOICES.map((c) => <Tex key={c} tex={c} size={54} />)} start={(i) => at(scene, 4, 0.1 + i * 0.12)} />
      <Stage>
        <Square at={m} progress={ease(f, 8, 18)} />
        <Label p={[m([0.5, 0])[0], m([0, 0])[1] + 44]} text="1" opacity={ease(f, at(scene, 1, 0.4), 10)} />
        <Label p={[m([1, 0])[0] + 40, m([0, 0.5])[1]]} text="1" opacity={ease(f, at(scene, 1, 0.4), 10)} />
        <Poly pts={small.map(m)} color={C.violet} fill={C.violet} progress={ease(f, at(scene, 3, 0.1), 16)} />
        <Ticks pts={small.map(m)} color={C.violet} opacity={ease(f, at(scene, 3, 0.45), 10)} />
      </Stage>
      <Text x={1600} y={210} w={420} size={38} weight={800} color={C.violet} align="center" style={fadeUp(f, at(scene, 3, 0.5))}>
        3 条边相等
      </Text>
    </>
  );
};

/** The part of the square outside a triangle (even-odd fill). */
export const Outside: React.FC<{ tri: Pt[]; at: (p: Pt) => Pt; color: string; opacity: number }> = ({ tri: t, at: m, color, opacity }) => {
  const d = (pts: Pt[]) => `M ${pts.map((p) => m(p).join(' ')).join(' L ')} Z`;
  return opacity <= 0 ? null : <path d={`${d(SQ)} ${d(t)}`} fill={color} fillRule="evenodd" opacity={opacity} />;
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const apex = P(FLAT[2]);
  return (
    <>
      <Stage>
        <Square at={P} />
        <Outside tri={FLAT} at={P} color={C.amber} opacity={0.22 * ease(f, at(scene, 4, 0.3), 16)} />
        <Poly pts={FLAT.map(P)} color={C.primary} fill={C.primary} progress={ease(f, at(scene, 2, 0.05), 18)} />
        <Label p={[P([0.5, 0])[0], P([0, 0])[1] + 44]} text="1" color={C.primary} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Step a={[apex[0], apex[1] - 6]} b={[apex[0], P([0, 1])[1] + 8]} label="" color={C.amber} opacity={ease(f, at(scene, 4, 0.5), 10)} />
        <Label p={[apex[0] + 150, apex[1] - 40]} text="空余的地方" color={C.amber} size={38} opacity={ease(f, at(scene, 4, 0.5), 10)} />
      </Stage>
      <Check x={PANEL} y={220} start={at(scene, 1, 0.05)}>3 条边相等</Check>
      <Check x={PANEL} y={310} start={at(scene, 1, 0.45)}>每个顶点都在正方形里</Check>
      <Check x={PANEL} y={400} start={at(scene, 1, 0.8)}>尽量大</Check>
      <div style={{ position: 'absolute', left: PANEL, top: 520, display: 'flex', alignItems: 'center', gap: 28, ...fadeUp(f, at(scene, 2, 0.7)) }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.primary }}>平放：</div>
        <Z p={[z('面积'), '= \\frac{\\sqrt{3}}{4}']} size={58} />
      </div>
      <Text x={PANEL} y={640} w={900} size={48} weight={800} style={fadeUp(f, at(scene, 3, 0.1))}>
        <Tex tex="\approx 0.433" size={54} /> <span style={{ color: C.muted }}>约占正方形的 43%</span>
      </Text>
    </>
  );
};

const makePause = (side: number, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(200, 740, 500);
  return (
    <>
      <Stage>
        <Square at={m} />
        <Label p={[m([0.5, 0])[0], 740 + 44]} text={String(side)} />
        <Label p={[m([1, 0])[0] + 40, m([0, 0.5])[1]]} text={String(side)} />
      </Stage>
      <Text x={450} y={150} w={760} size={44} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

/** Side vs angle graph for the turn: x 0…30°, side 1.00…1.04. */
const G = { x0: 1000, x1: 1700, y0: 690, y1: 330, s0: 1, s1: 1.04 };
const gx = (a: number) => G.x0 + ((G.x1 - G.x0) * a) / 30;
const gy = (s: number) => G.y0 - ((G.y0 - G.y1) * (s - G.s0)) / (G.s1 - G.s0);

const Turn: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // L1–L3: sweep 0 → 30°; L4: come back to the peak at 15°.
  const sweep = [at(scene, 1, 0.5), at(scene, 3, 0.95)] as const;
  const back = at(scene, 4, 0.05);
  const a = f < back ? interpolate(f, sweep, [0, 30], clamp) : interpolate(f, [back, back + 40], [30, 15], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const s = fitSide(a);
  const pts = tri(a, s);
  const graph = ease(f, at(scene, 2), 14);
  const drawn = f >= back ? 30 : a;
  const curve = [...range(Math.floor(drawn) + 1), drawn].map((v) => `${gx(v)} ${gy(fitSide(v))}`).join(' L ');
  const peak = ease(f, at(scene, 4, 0.6), 12);
  const touch = ease(f, at(scene, 5, 0.45), 12);
  return (
    <>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.4))}>按住一个角，再转动</Pill>
      <Stage>
        <Square at={P} />
        <line x1={P([0, 0])[0]} y1={P([0, 0])[1]} x2={P([1, 1])[0]} y2={P([1, 1])[1]} stroke={C.muted} strokeWidth={4} strokeDasharray="14 12" opacity={ease(f, at(scene, 5, 0.1), 12)} />
        <Poly pts={pts.map(P)} color={C.violet} fill={C.violet} width={8} progress={ease(f, at(scene, 0, 0.6), 16)} />
        <circle cx={P([0, 0])[0]} cy={P([0, 0])[1]} r={18} fill={C.amber} opacity={ease(f, at(scene, 1, 0.1), 10)} />
        <Ring p={P(BEST[1])} color={C.green} opacity={touch} />
        <Ring p={P(BEST[2])} color={C.green} opacity={touch} />
        <g opacity={graph}>
          <line x1={G.x0} y1={G.y0} x2={G.x1 + 20} y2={G.y0} stroke={C.ink} strokeWidth={4} />
          <line x1={G.x0} y1={G.y0} x2={G.x0} y2={G.y1 - 20} stroke={C.ink} strokeWidth={4} />
          {[0, 15, 30].map((v) => <Label key={v} p={[gx(v), G.y0 + 36]} text={`${v}°`} size={40} color={C.muted} />)}
          <Label p={[G.x0 - 70, gy(1)]} text="1.00" size={40} color={C.muted} />
          <Label p={[G.x0 - 80, gy(1.035)]} text="1.035" size={40} color={C.muted} opacity={peak} />
          <path d={`M ${curve}`} fill="none" stroke={C.violet} strokeWidth={6} strokeLinejoin="round" />
          <line x1={gx(15)} y1={G.y0} x2={gx(15)} y2={gy(fitSide(15))} stroke={C.green} strokeWidth={4} strokeDasharray="10 8" opacity={peak} />
          <circle cx={gx(a)} cy={gy(s)} r={14} fill={C.violet} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: PANEL, top: 270, display: 'flex', gap: 60, fontSize: 46, fontWeight: 900, opacity: graph }}>
        <div>
          角度 <span style={{ color: C.amber, display: 'inline-block', width: 110 }}>{Math.round(a)}°</span>
        </div>
        <div>
          边长 <span style={{ color: C.violet }}>{s.toFixed(3)}</span>
        </div>
      </div>
      <Pill x={1420} y={262} color={C.green} style={{ ...fadeUp(f, at(scene, 4, 0.65)), fontSize: 36 }}>15° 时最大</Pill>
      <Text x={PANEL} y={770} w={900} size={38} weight={800} color={C.green} style={fadeUp(f, at(scene, 5, 0.5))}>
        对称：两个顶点碰到两条边
      </Text>
    </>
  );
};

/** The balanced triangle with its gap labels; shared by the set-up and solving scenes. */
const BestFigure: React.FC<{ scene: Scene; gapsAt: [number, number]; xLabel?: string; long?: number; corner?: number }> = ({ gapsAt, xLabel = 'x', long = 0, corner = 0 }) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <Square at={P} />
      <Poly pts={LONG_R.map(P)} color={C.violet} width={0} fill={C.violet} fillOpacity={0.25} opacity={long} />
      <Poly pts={CORNER.map(P)} color={C.blue} width={0} fill={C.blue} fillOpacity={0.25} opacity={corner} />
      <Poly pts={BEST.map(P)} color={C.ink} width={8} />
      <Poly pts={[BEST[0], BEST[1]].map(P)} color={C.violet} width={12} opacity={long} />
      <Poly pts={[BEST[1], BEST[2]].map(P)} color={C.blue} width={12} opacity={corner} />
      <Brace a={P([1, 0])} b={P([1, T])} dx={22} dy={0} color={C.amber} opacity={ease(f, gapsAt[0], 10)} label={xLabel} />
      <Brace a={P([0, 1])} b={P([T, 1])} dx={0} dy={-22} color={C.amber} opacity={ease(f, gapsAt[1], 10)} label={xLabel} />
      <Label p={[P([0.5, 0])[0], P([0, 0])[1] + 44]} text="1" color={C.violet} opacity={long} />
      <Brace a={P([1, T])} b={P([1, 1])} dx={22} dy={0} color={C.blue} opacity={corner} label="" />
      <Label p={P([0.85, (1 + T) / 2])} text="1 − x" color={C.blue} size={48} opacity={corner} />
      <Brace a={P([T, 1])} b={P([1, 1])} dx={0} dy={-22} color={C.blue} opacity={corner} label="" />
      <Label p={[P([(1 + T) / 2, 0])[0], P([0, 1])[1] - 62]} text="1 − x" color={C.blue} size={48} opacity={corner} />
    </Stage>
  );
};

const Setup: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const long = ease(f, at(scene, 3, 0.1), 14) * fadeTo(f, at(scene, 5), 0.35);
  const corner = ease(f, at(scene, 5, 0.3), 14);
  return (
    <>
      <BestFigure scene={scene} gapsAt={[at(scene, 1, 0.5), at(scene, 2, 0.55)]} long={long} corner={corner} />
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>求出准确大小</Pill>
      <Eq y={300} start={at(scene, 4, 0.35)} color={C.violet} tex={[z('边长²'), ' = 1^2 + x^2 = 1 + x^2']} />
      <Eq y={420} start={at(scene, 6, 0.3)} color={C.blue} tex={[z('边长²'), ' = 2(1-x)^2']} />
      <Eq y={580} start={at(scene, 7, 0.3)} size={64} tex="1 + x^2 = 2(1-x)^2" />
      <Boxed x={PANEL - 24} y={562} w={680} h={118} start={at(scene, 7, 0.5)} />
    </>
  );
};

const Solve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows: [number, string | Part[]][] = [
    [at(scene, 0, 0.0), '1 + x^2 = 2(1-x)^2'],
    [at(scene, 0, 0.45), '1 + x^2 = 2 - 4x + 2x^2'],
    [at(scene, 1, 0.1), 'x^2 - 4x + 1 = 0'],
    [at(scene, 2, 0.35), 'x^2 - 4x + 4 = 3 \\quad {\\color{#f59f0a}(+3)}'],
    [at(scene, 3, 0.1), '(x-2)^2 = 3'],
    [at(scene, 4, 0.3), ['x = 2 + \\sqrt{3}', z('或'), '2 - \\sqrt{3}']],
  ];
  const reject = at(scene, 5, 0.1);
  return (
    <>
      <BestFigure scene={scene} gapsAt={[0, 0]} />
      <Eq y={150 + 4 * 86 + 6} x={1260} start={at(scene, 3, 0.3)} size={42} color={C.muted} tex={[z('因为'), '(x-2)^2 = x^2 - 4x + 4']} />
      {rows.map(([start, tex], i) => (
        <Eq key={i} y={150 + i * 86} start={start} size={52} tex={tex} />
      ))}
      <div style={{ position: 'absolute', left: PANEL, top: 690, display: 'flex', gap: 50, alignItems: 'center', ...fadeUp(f, reject) }}>
        <div style={{ color: C.red, fontSize: 44, fontWeight: 900, textDecoration: 'line-through' }}>
          <Tex tex="2 + \sqrt{3} \approx 3.7" size={50} color={C.red} />
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.red }}>比正方形还大！</div>
      </div>
      <Eq y={760} start={at(scene, 5, 0.55)} size={60} color={C.green} tex="x = 2 - \sqrt{3} \approx 0.268" />
    </>
  );
};

const Area1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 4, 0.97);
  return (
    <>
      <Stage>
        <Square at={P} />
        <Poly pts={BEST.map(P)} color={C.violet} fill={C.violet} fillOpacity={0.3} width={8} />
      </Stage>
      <Eq y={170} start={at(scene, 0, 0.5)} tex={[z('边长²'), ' = 1 + x^2']} />
      <Eq y={265} start={at(scene, 1, 0.1)} size={48} color={C.muted} tex="x^2 = (2-\sqrt{3})^2 = 7 - 4\sqrt{3}" />
      <Eq y={350} start={at(scene, 1, 0.6)} tex={[z('边长²'), ' = 8 - 4\\sqrt{3}']} />
      <Eq y={450} start={at(scene, 2, 0.4)} tex={[z('面积'), '= \\frac{\\sqrt{3}}{4} \\times', z('边长²')]} />
      <Eq y={570} start={at(scene, 3, 0.1)} tex="\frac{\sqrt{3}}{4}(8 - 4\sqrt{3}) = 2\sqrt{3} - \frac{4 \times {\color{#f59f0a}3}}{4}" />
      <Pill x={1440} y={462} color={C.amber} style={{ ...fadeUp(f, at(scene, 3, 0.3)), fontSize: 36 }}>√3 × √3 = 3</Pill>
      <Eq y={690} start={at(scene, 4, 0.5)} size={66} color={C.green} tex={[z('面积'), '= 2\\sqrt{3} - 3']} />
      <Text x={PANEL} y={770} w={760} size={44} weight={800} style={fadeUp(f, at(scene, 5, 0.1))}>
        ≈ 0.464，约 46% <span style={{ color: C.primary }}>&gt; 43%</span>
      </Text>
      <Answer x={1770} y={700} value="C" chime={CHIME} start={done} />
      <Confetti x={1770} y={700} start={done} seed={5} />
    </>
  );
};

const Cut: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cutP = ease(f, at(scene, 2, 0.3), 20);
  const push = (pts: Pt[], d: Pt) => pts.map(([x, y]): Pt => [x + d[0] * cutP * 0.06, y + d[1] * cutP * 0.06]);
  const whole = ease(f, at(scene, 1, 0.2), 14);
  const hiLong = ease(f, at(scene, 3, 0.1), 10) * fadeTo(f, at(scene, 4), 0.5);
  const hiCorner = ease(f, at(scene, 4, 0.1), 10);
  return (
    <>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.4))}>切掉 3 个角</Pill>
      <Stage>
        <Poly pts={SQ.map(P)} color={C.ink} width={6} fill={C.primary} fillOpacity={0.12 * whole * (1 - cutP)} />
        <g opacity={cutP > 0 ? 1 : 0}>
          <Poly pts={push(LONG_R, [0.4, -1]).map(P)} color={C.amber} width={5} fill={C.amber} fillOpacity={0.15 + 0.25 * hiLong} />
          <Poly pts={push(LONG_T, [-1, 0.4]).map(P)} color={C.amber} width={5} fill={C.amber} fillOpacity={0.15 + 0.25 * hiLong} />
          <Poly pts={push(CORNER, [1, 1]).map(P)} color={C.blue} width={5} fill={C.blue} fillOpacity={0.15 + 0.25 * hiCorner} />
        </g>
        <Poly pts={BEST.map(P)} color={C.violet} width={8} fill={C.violet} fillOpacity={0.25 * cutP} />
        <Label p={P([0.62, 0.07])} text="x/2" color={C.amber} size={48} opacity={hiLong > 0 ? ease(f, at(scene, 3, 0.55), 10) : 0} />
        <Label p={P([0.07, 0.62])} text="x/2" color={C.amber} size={48} opacity={hiLong > 0 ? ease(f, at(scene, 3, 0.55), 10) : 0} />
        <Label p={P([0.8, 0.84])} text="1 − x" color={C.blue} size={46} opacity={hiCorner} />
      </Stage>
      <Eq y={280} start={at(scene, 1, 0.3)} tex={[z('正方形'), '= 1']} />
      <Eq y={370} start={at(scene, 3, 0.65)} color={C.amber} tex="\tfrac{x}{2} + \tfrac{x}{2} = x" />
      <Eq y={460} start={at(scene, 4, 0.4)} color={C.blue} tex={[z('角上'), '= \\tfrac{(1-x)^2}{2}']} />
      <Eq y={550} start={at(scene, 5, 0.35)} color={C.blue} tex="= \tfrac{(\sqrt{3}-1)^2}{2} = \tfrac{4 - 2\sqrt{3}}{2} = 2 - \sqrt{3}" />
      <Eq y={640} start={at(scene, 6, 0.3)} color={C.amber} tex={['x = 2 - \\sqrt{3}', z('（一样！）')]} />
      <Eq y={745} start={at(scene, 7, 0.4)} size={60} color={C.green} tex="1 - 2(2 - \sqrt{3}) = 2\sqrt{3} - 3" />
      <Pill x={1360} y={170} color={C.amber} style={{ ...fadeUp(f, at(scene, 8, 0.45)), fontSize: 36 }}>很适合用来验算！</Pill>
    </>
  );
};

// Trap pictures in a mini unit square: A flat (fits, smaller), C best, D 1 tall (too wide), E side = diagonal.
const TRAP_SHAPES: (Pt[] | null)[] = [
  FLAT,
  null,
  BEST,
  [[0.5 - 1 / R3, 0], [0.5 + 1 / R3, 0], [0.5, 1]],
  [[0, 0], [1, 1], [0.5 - R3 / 2, 0.5 + R3 / 2]],
];
const NOTES = ['平放，边长 1\n放得下，但更小', '忘了把边长平方', '', '高为 1\n底边太宽', '边长 = 对角线\n伸出去了'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.1), at(scene, 2, 0.1), Infinity, at(scene, 3, 0.1), at(scene, 4, 0.1)];
  const m = plane(80, 230, 140);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 2 && f >= at(scene, 5);
          const border = wrong ? C.red : right ? C.green : 'transparent';
          const shape = TRAP_SHAPES[i];
          const out = i >= 3;
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 420, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 18 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 110, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={50} color={wrong ? C.red : right ? C.green : C.ink} />
                </div>
                <svg width={250} height={250} viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
                  <Poly pts={SQ.map(m)} color={C.ink} width={4} />
                  {shape && (
                    <Poly pts={shape.map(m)} color={out ? C.red : right ? C.green : C.primary} width={5} fill={out ? C.red : right ? C.green : C.primary} fillOpacity={0.2} />
                  )}
                  {i === 0 && <Poly pts={BEST.map(m)} color={C.green} width={3} dashed />}
                  {i === 1 && (
                    <foreignObject x={0} y={95} width={300} height={110}>
                      <div style={{ textAlign: 'center' }}>
                        <Tex tex="\tfrac{\sqrt{3}}{4} \times (\sqrt{6}-\sqrt{2})" size={34} color={C.red} />
                      </div>
                    </foreignObject>
                  )}
                </svg>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700, textAlign: 'center', lineHeight: 1.25, whiteSpace: 'pre-line', ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 460, top: 690, width: 1000, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.3)) }}>
        一定要检查是不是真的放得下！
      </div>
    </>
  );
};

const P2 = plane(1150, 760, 260); // side-2 square: 520 px

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={190} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>轮到你了！</Pill>
      <Text x={120} y={310} w={900} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        一个边长为 2 的正方形
      </Text>
      <Text x={120} y={420} w={900} size={48} weight={700} style={fadeUp(f, at(scene, 1, 0.1))}>
        能放进它里面的最大等边三角形，<br />面积是多少？
      </Text>
      <Pill x={120} y={620} color={C.amber} style={fadeUp(f, at(scene, 2, 0.2))}>按住一个角，找出空隙！</Pill>
      <Stage>
        <Poly pts={SQ.map((p) => P2([p[0] * 2, p[1] * 2]))} color={C.ink} width={6} fill={C.card} fillOpacity={1} progress={ease(f, at(scene, 0, 0.4), 18)} />
        <Label p={[P2([1, 0])[0], 760 + 44]} text="2" opacity={ease(f, at(scene, 0, 0.6), 10)} />
        <Label p={[P2([2, 0])[0] + 40, P2([0, 1])[1]]} text="2" opacity={ease(f, at(scene, 0, 0.6), 10)} />
        <circle cx={P2([0, 0])[0]} cy={P2([0, 0])[1]} r={16} fill={C.amber} opacity={ease(f, at(scene, 2, 0.3), 10)} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(200, 790, 280); // side 2 → 560 px, same size as before
  const U = 4 - 2 * R3;
  const first = fadeTo(f, at(scene, 5), 0);
  const done = at(scene, 7, 0.97);
  const sq2 = SQ.map(([x, y]): Pt => [x * 2, y * 2]);
  return (
    <>
      <Stage>
        <Poly pts={sq2.map(m)} color={C.ink} width={6} fill={C.card} fillOpacity={1} />
        <g opacity={ease(f, at(scene, 5, 0.6), 14)}>
          <Poly pts={([[0, 0], [2, 0], [2, U]] as Pt[]).map(m)} color={C.amber} width={4} fill={C.amber} fillOpacity={0.3} />
          <Poly pts={([[0, 0], [U, 2], [0, 2]] as Pt[]).map(m)} color={C.amber} width={4} fill={C.amber} fillOpacity={0.3} />
          <Poly pts={([[2, U], [2, 2], [U, 2]] as Pt[]).map(m)} color={C.blue} width={4} fill={C.blue} fillOpacity={0.3} />
        </g>
        <Poly pts={([[0, 0], [2, U], [U, 2]] as Pt[]).map(m)} color={C.violet} width={8} fill={C.violet} fillOpacity={0.2} />
        <Brace a={m([2, 0])} b={m([2, U])} dx={22} dy={0} color={C.amber} opacity={ease(f, at(scene, 0, 0.4), 10)} label="x" />
        <Brace a={m([0, 2])} b={m([U, 2])} dx={0} dy={-22} color={C.amber} opacity={ease(f, at(scene, 0, 0.4), 10)} label="x" />
        <Label p={[m([1, 0])[0], 790 + 44]} text="2" />
        <Label p={[m([0, 0])[0] - 40, m([0, 1])[1]]} text="2" />
      </Stage>
      <Eq y={170} start={at(scene, 1, 0.3)} color={C.violet} opacity={first} tex={[z('边长²'), ' = 4 + x^2']} />
      <Eq y={260} start={at(scene, 2, 0.3)} color={C.blue} opacity={first} tex={[z('边长²'), ' = 2(2-x)^2']} />
      <Eq y={350} start={at(scene, 3, 0.1)} opacity={first} tex="x^2 - 8x + 4 = 0" />
      <Eq y={440} start={at(scene, 3, 0.55)} opacity={first} tex="(x-4)^2 = 12 \quad {\color{#f59f0a}(+12)}" />
      <Eq y={530} start={at(scene, 4, 0.3)} color={C.green} opacity={first} tex="x = 4 - 2\sqrt{3}" />
      <Eq y={170} start={at(scene, 5, 0.3)} tex={[z('正方形'), '= 4']} />
      <Eq y={260} start={at(scene, 6, 0.1)} color={C.amber} tex={[z('两个长的'), '= 2x = 8 - 4\\sqrt{3}']} />
      <Eq y={350} start={at(scene, 6, 0.55)} size={48} color={C.blue} tex={[z('角上'), '= \\tfrac{(2-x)^2}{2} = \\tfrac{(2\\sqrt{3}-2)^2}{2} = 8 - 4\\sqrt{3}']} />
      <Eq y={450} start={at(scene, 7, 0.62)} size={56} color={C.green} tex="4 - 2(8 - 4\sqrt{3}) = 8\sqrt{3} - 12" />
      <Eq y={550} start={at(scene, 8, 0.2)} tex="= 4 \times (2\sqrt{3} - 3)" />
      <Pill x={PANEL} y={660} color={C.amber} style={{ ...fadeUp(f, at(scene, 8, 0.75)), fontSize: 38 }}>边长 ×2 → 面积 ×4</Pill>
      <Answer x={1780} y={720} value="✓" chime={CHIME} start={done} />
      <Confetti x={1780} y={720} start={done} seed={11} />
      <Pill x={1400} y={555} color={C.primary} style={{ ...fadeUp(f, at(scene, 9, 0.1)), fontSize: 34 }}>太棒了！</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const m = plane(1290, 650, 380);
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 560, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 150, width: 920, fontSize: 60, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          把它推到角里，<br />再转到对称的位置。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 380, width: 920, fontSize: 50, fontWeight: 800, color: C.violet, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          然后，用边长相等列出一个方程。
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.4), 14) * cardOut}>
          <Square at={m} />
          <line x1={m([0, 0])[0]} y1={m([0, 0])[1]} x2={m([1, 1])[0]} y2={m([1, 1])[1]} stroke={C.muted} strokeWidth={4} strokeDasharray="12 10" />
          <Poly pts={BEST.map(m)} color={C.violet} fill={C.violet} width={8} />
          <circle cx={m([0, 0])[0]} cy={m([0, 0])[1]} r={14} fill={C.amber} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(1, 10, '最大的等边三角形，面积是多少？'),
  turn: Turn,
  setup: Setup,
  solve: Solve,
  area1: Area1,
  cut: Cut,
  traps: Traps,
  variant: Variant,
  try2: makePause(2, 12, '边长 2：最大等边三角形的面积？'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第5级" font={ZH_FONT} /> : null;

import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Stage, type Pt } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-root-sum-floor';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const FLOOR = C.primary;
const CEIL = C.violet;
const DARK_GREEN = '#079a66';

// ---------- maths strings ----------
const SUM100 = '\\dfrac1{\\sqrt1}+\\dfrac1{\\sqrt2}+\\dfrac1{\\sqrt3}+\\cdots+\\dfrac1{\\sqrt{100}}';
const SUM10K = '\\dfrac1{\\sqrt1}+\\dfrac1{\\sqrt2}+\\cdots+\\dfrac1{\\sqrt{10000}}';
const CHOICE_TEX = ['10', '17', '18', '19', '20'];

// ---------- small helpers ----------

const Parts: React.FC<{ x: number; y: number; parts: [number, string, string?][]; size?: number; opacity?: number; center?: boolean; gap?: number }> = ({
  x, y, parts, size = 52, opacity = 1, center = false, gap = 16,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center', gap, whiteSpace: 'nowrap', opacity }}>
      {parts.map(([start, tex, color], i) => (
        <div key={i} style={fadeUp(f, start)}>
          <Tex tex={tex} size={size} color={color ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ start, tex, color, ...rest }) => (
  <Parts {...rest} parts={[[start, tex, color]]} />
);

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; color?: string }> = ({ x, y, w, h, start, color = FLOOR }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; opacity?: number }> = ({ x, y, start, color, children, size = 40, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return <div style={{ position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>{children}</div>;
};

/** Maths label centred on (x, y). */
const Lbl: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; anchor?: 'center' | 'right' | 'left'; opacity?: number; dy?: number }> = ({
  x, y, tex, start, size = 52, color = C.ink, anchor = 'center', opacity = 1, dy = 0,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12) * opacity;
  if (p <= 0) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  return (
    <div style={{ position: 'absolute', left: x, top: y + dy, transform: `translate(${tx}, -50%)`, opacity: p, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** A horizontal wall (floor or ceiling) that slides from y0 to y1. */
const Wall: React.FC<{ y0: number; y1: number; start: number; dur?: number; color: string; x1?: number; x2?: number; label?: string; labelTex?: string; labelAbove?: boolean; opacity?: number; labelX?: number }> = ({
  y0, y1, start, dur = 24, color, x1 = 140, x2 = 1780, label, labelTex, labelAbove = false, opacity = 1, labelX,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, start, dur);
  if (p <= 0) return null;
  const y = y0 + (y1 - y0) * p;
  return (
    <div style={{ opacity: Math.min(1, p * 3) * opacity }}>
      <div style={{ position: 'absolute', left: x1, top: y - 6, width: x2 - x1, height: 12, borderRadius: 6, background: color }} />
      {label && (
        <div style={{ position: 'absolute', left: x2 - 360, width: 360, textAlign: 'right', top: labelAbove ? y - 62 : y + 14, fontSize: 44, fontWeight: 900, color }}>{label}</div>
      )}
      {labelTex && (
        <div style={{ position: 'absolute', left: labelX ?? x1 + 10, top: labelAbove ? y - 80 : y + 8 }}>
          <Tex tex={labelTex} size={64} color={color} />
        </div>
      )}
    </div>
  );
};

const Pt2 = (X0: number, Y0: number, U: number) => (x: number, y: number): Pt => [X0 + x * U, Y0 - y * U];

const poly = (pts: Pt[]) => `M ${pts.map((p) => p.join(' ')).join(' L ')} Z`;

// ---------- Scene: intro ----------

const Calculator: React.FC<{ x: number; y: number; opacity: number; cross: number }> = ({ x, y, opacity, cross }) => (
  <g opacity={opacity} transform={`translate(${x - 90} ${y})`}>
    <rect width={180} height={250} rx={24} fill={C.card} stroke={C.muted} strokeWidth={8} />
    <rect x={20} y={22} width={140} height={54} rx={10} fill={C.line} />
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={42 + c * 48} cy={112 + r * 44} r={13} fill={C.muted} />))}
    <circle cx={42} cy={226} r={13} fill={C.muted} />
    <circle cx={138} cy={226} r={13} fill={C.muted} />
    <g opacity={cross} stroke={C.red} strokeWidth={16} strokeLinecap="round">
      <line x1={-30} y1={-20} x2={210} y2={270} />
      <line x1={210} y1={-20} x2={-30} y2={270} />
    </g>
  </g>
);

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const type = ease(f, 6, at(scene, 0, 0.8));
  const calcOut = fadeTo(f, at(scene, 2), 0, 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center' }}>
        <div style={{ clipPath: `inset(0 ${(1 - type) * 100}% 0 0)`, whiteSpace: 'nowrap' }}>
          <Tex tex={SUM100} size={66} />
        </div>
      </div>
      <Stage>
        <Calculator x={960} y={540} opacity={ease(f, at(scene, 1, 0.1), 12) * calcOut} cross={ease(f, at(scene, 1, 0.55), 10)} />
      </Stage>
      <Wall y0={1000} y1={470} start={at(scene, 2, 0.15)} dur={30} color={FLOOR} label="floor" />
      <Wall y0={-40} y1={235} start={at(scene, 2, 0.15)} dur={30} color={CEIL} label="ceiling" labelAbove />
      <div style={{ position: 'absolute', left: 200, top: 640, ...fadeUp(f, at(scene, 2, 0.5)), opacity: ease(f, at(scene, 2, 0.5), 12) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 72, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = [at(scene, 1, 0.3), at(scene, 1, 0.5), at(scene, 1, 0.65), at(scene, 1, 0.85)];
  return (
    <>
      <Pill x={100} y={140} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>
        Question
      </Pill>
      <div style={{ position: 'absolute', left: 100, top: 230, width: 1720, background: C.card, borderRadius: 32, padding: '36px 52px', fontSize: 52, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        <div>
          What is the{' '}
          <Mark on={at(scene, 2, 0.15)}>greatest whole number less than or equal to</Mark>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, whiteSpace: 'nowrap' }}>
          <Mark on={t[0]}><Tex tex="\dfrac1{\sqrt1}" size={60} /></Mark>
          <Mark on={t[1]}><Tex tex="+\dfrac1{\sqrt2}" size={60} /></Mark>
          <Mark on={t[2]}><Tex tex="+\cdots+" size={60} /></Mark>
          <Mark on={t[3]}><Tex tex="\dfrac1{\sqrt{100}}" size={60} /></Mark>
          <span style={{ marginLeft: 6 }}>?</span>
        </div>
      </div>
      <Choices x={170} y={600} items={CHOICE_TEX.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // number line n .. n+1
  const nl = ease(f, at(scene, 1, 0), 12) * fadeTo(f, at(scene, 2, 0.02), 0, 12);
  const nx = 560, mx = 1360, ny = 470;
  const dotX = nx + (mx - nx) * 0.62;
  // 0 .. 100 line
  const lx = (v: number) => 220 + v * 15;
  const ly = 700;
  const win = ease(f, at(scene, 3, 0.1), 20);
  return (
    <>
      <Text x={960} y={150} w={1700} size={60} weight={900} align="center" style={{ ...fadeUp(f, 4), opacity: ease(f, 4, 12) * fadeTo(f, at(scene, 2, 0.02), 0, 12) }}>
        Goal: round the sum <span style={{ color: FLOOR }}>DOWN</span> to a whole number.
      </Text>
      <Stage>
        <g opacity={nl}>
          <line x1={380} y1={ny} x2={1540} y2={ny} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={nx} y1={ny - 24} x2={nx} y2={ny + 24} stroke={C.ink} strokeWidth={6} />
          <line x1={mx} y1={ny - 24} x2={mx} y2={ny + 24} stroke={C.ink} strokeWidth={6} />
          <circle cx={dotX} cy={ny} r={20} fill={CEIL} />
          <text x={dotX} y={ny - 46} textAnchor="middle" fontSize={44} fontWeight={900} fill={CEIL}>sum</text>
          <g opacity={ease(f, at(scene, 1, 0.55), 14)} stroke={FLOOR} strokeWidth={8} fill="none" strokeLinecap="round">
            <path d={`M ${dotX - 14} ${ny + 40} Q ${(dotX + nx) / 2} ${ny + 150} ${nx + 6} ${ny + 56}`} />
            <path d={`M ${nx + 4} ${ny + 80} L ${nx + 6} ${ny + 56} L ${nx + 30} ${ny + 64}`} />
          </g>
        </g>
        {/* 0..100 line */}
        <g opacity={ease(f, at(scene, 3, 0), 12)}>
          <line x1={lx(0)} y1={ly} x2={lx(100)} y2={ly} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <rect x={lx(10)} y={ly - 36} width={(lx(100) - lx(10)) * win} height={72} rx={14} fill={C.red} opacity={0.22} />
          {[0, 10, 100].map((v) => (
            <line key={v} x1={lx(v)} y1={ly - 22} x2={lx(v)} y2={ly + 22} stroke={C.ink} strokeWidth={6} />
          ))}
        </g>
      </Stage>
      <Lbl x={nx} y={ny - 70} tex="n" start={at(scene, 1, 0.2)} opacity={fadeTo(f, at(scene, 2, 0.02), 0, 12)} />
      <Lbl x={mx} y={ny - 70} tex="n+1" start={at(scene, 1, 0.2)} opacity={fadeTo(f, at(scene, 2, 0.02), 0, 12)} />
      <Tag x={dotX - 100} y={ny + 130} start={at(scene, 1, 0.6)} color={FLOOR} size={44} opacity={fadeTo(f, at(scene, 2, 0.02), 0, 12)}>
        <span style={{ marginLeft: -220 }}>round down</span>
      </Tag>
      <Eq x={0} y={170} center start={at(scene, 2, 0.12)} size={60} tex="\dfrac1{10}\le\dfrac1{\sqrt k}\le 1" />
      <Eq x={0} y={370} center start={at(scene, 2, 0.55)} size={58} tex="100\times\dfrac1{10}=10\ \le\ \text{sum}\ \le\ 100\times 1=100" />
      <Lbl x={lx(0)} y={ly + 70} tex="0" start={at(scene, 3, 0)} />
      <Lbl x={lx(10)} y={ly + 70} tex="10" start={at(scene, 3, 0)} />
      <Lbl x={lx(100)} y={ly + 70} tex="100" start={at(scene, 3, 0)} />
      <Tag x={lx(55) - 150} y={ly - 130} start={at(scene, 3, 0.4)} color={C.red} size={56}>
        too wide!
      </Tag>
    </>
  );
};

// ---------- Scene: pauses ----------

const makePause = (tex: string, withChoices: boolean, seconds: number, prompt: string, size: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={130} y={200} start={4} size={size} tex={tex} />
      <Text x={130} y={withChoices ? 380 : 400} w={1000} size={44} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      {withChoices && <Choices x={130} y={560} items={CHOICE_TEX.map((c) => <Tex key={c} tex={c} size={56} />)} start={() => 8} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} />
    </>
  );
};

// ---------- The "grow a square" figure (used for the floor and for the ceiling) ----------
// Drawn to scale for one real case: inner side sqrt2 (1.414), outer side sqrt3 (1.732).

const U = 280;
const GX = 250;
const GY = 810;
const A_SIDE = Math.SQRT2;
const B_SIDE = Math.sqrt(3);
const g2p = Pt2(GX, GY, U);

type GrowCues = { inner: number; outer: number; strip: number; split: number };
type GrowLabels = { inner: string; innerArea: string; outer: string; outerArea: string; gap: string; right: string; top: string };

const GrowFig: React.FC<{ cues: GrowCues; labels: GrowLabels; color: string; darkColor: string; areaOne: number }> = ({ cues, labels, color, darkColor, areaOne }) => {
  const f = useCurrentFrame();
  const a = A_SIDE, b = B_SIDE;
  const innerP = ease(f, cues.inner, 18);
  const grow = ease(f, cues.outer, 30);
  const s = a + (b - a) * grow;
  const stripP = ease(f, cues.strip, 16);
  const sp = ease(f, cues.split, 24);
  const splitting = f >= cues.split;
  const inner: Pt[] = [g2p(0, 0), g2p(a, 0), g2p(a, a), g2p(0, a)];
  const outer: Pt[] = [g2p(0, 0), g2p(s, 0), g2p(s, s), g2p(0, s)];
  const dxp = sp * 34, dyp = sp * 34;
  const rightRect: Pt[] = [g2p(a, 0), g2p(b, 0), g2p(b, a), g2p(a, a)].map(([x, y]) => [x + dxp, y] as Pt);
  const topRect: Pt[] = [g2p(0, a), g2p(b, a), g2p(b, b), g2p(0, b)].map(([x, y]) => [x, y - dyp] as Pt);
  const Lshape: Pt[] = [g2p(a, 0), g2p(b, 0), g2p(b, b), g2p(0, b), g2p(0, a), g2p(a, a)];
  const topY = GY - b * U;
  const bx = GX + b * U;
  return (
    <>
      <Stage>
        {innerP > 0 && (
          <path d={poly(inner)} fill={C.blue} fillOpacity={0.14 * innerP} stroke={C.blue} strokeWidth={7} strokeLinejoin="round" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - innerP} />
        )}
        {grow > 0 && !splitting && <path d={poly(outer)} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />}
        {stripP > 0 && !splitting && <path d={poly(Lshape)} fill={color} fillOpacity={0.4 * stripP} stroke={color} strokeWidth={5} strokeLinejoin="round" />}
        {splitting && (
          <>
            <path d={poly(rightRect)} fill={color} fillOpacity={0.45} stroke={color} strokeWidth={6} strokeLinejoin="round" />
            <path d={poly(topRect)} fill={darkColor} fillOpacity={0.45} stroke={darkColor} strokeWidth={6} strokeLinejoin="round" />
          </>
        )}
        {/* thickness bracket on the right of the top strip */}
        {stripP > 0 && (
          <g opacity={stripP * fadeTo(f, cues.split, 0, 10)} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none">
            <path d={`M ${bx + 24} ${topY} L ${bx + 40} ${topY} L ${bx + 40} ${GY - A_SIDE * U} L ${bx + 24} ${GY - A_SIDE * U}`} />
          </g>
        )}
      </Stage>
      <Lbl x={GX - 24} y={GY - (a * U) / 2} anchor="right" tex={labels.inner} start={cues.inner + 4} />
      <Lbl x={GX + (a * U) / 2} y={GY - (a * U) / 2} tex={labels.innerArea} start={cues.inner + 8} color={C.blue} />
      <Lbl x={GX + (b * U) / 2} y={topY - 54} tex={labels.outer} start={cues.outer + 12} dy={-sp * dyp} />
      <Lbl x={bx + 60} y={(topY + GY - A_SIDE * U) / 2} anchor="left" tex={labels.gap} start={cues.strip + 4} color={color} opacity={fadeTo(f, cues.split, 0, 10)} />
      <Lbl x={bx + 50} y={470} anchor="left" tex={labels.outerArea} start={cues.outer + 20} opacity={fadeTo(f, cues.split, 0, 10)} />
      <Lbl x={bx + 50} y={540} anchor="left" tex={areaOne === 1 ? '\\text{area}=1' : ''} start={cues.strip + 6} color={color} opacity={fadeTo(f, cues.split, 0, 10)} />
      {splitting && <Lbl x={bx + 50 + sp * 34 + 20} y={GY - (a * U) / 2} anchor="left" tex={labels.right} start={cues.split + 10} color={color} />}
    </>
  );
};

// ---------- Scene: grow ----------

const GROW_LABELS: GrowLabels = {
  inner: '\\sqrt k',
  innerArea: 'k',
  outer: '\\sqrt{k+1}',
  outerArea: '\\text{area }k{+}1',
  gap: 'g',
  right: '\\sqrt k',
  top: '\\sqrt{k+1}',
};

const Grow: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cues: GrowCues = { inner: at(scene, 1, 0.05), outer: at(scene, 2, 0.35), strip: at(scene, 3, 0.1), split: at(scene, 4, 0.1) };
  const px = 1090;
  return (
    <>
      <Tag x={780} y={150} start={at(scene, 1, 0.05)} color={C.muted} size={36}>
        drawn for k = 2
      </Tag>
      <GrowFig cues={cues} labels={GROW_LABELS} color={FLOOR} darkColor={DARK_GREEN} areaOne={1} />
      <Parts x={px} y={150} size={52} parts={[[at(scene, 3, 0.35), '(k+1)-k=1']]} />
      <Parts x={px} y={240} size={52} parts={[[at(scene, 3, 0.7), 'g=\\sqrt{k+1}-\\sqrt k', FLOOR]]} />
      <Parts x={px} y={330} size={50} parts={[[at(scene, 5, 0.2), '1=g\\sqrt k+g\\sqrt{k+1}']]} />
      <Parts x={px} y={410} size={50} parts={[[at(scene, 5, 0.45), '>\\; g\\cdot 2\\sqrt k']]} />
      <Pill x={px + 400} y={425} color={C.red} style={{ ...fadeUp(f, at(scene, 5, 0.4)), fontSize: 38 }}>
        MORE
      </Pill>
      <Tag x={px + 340} y={545} start={at(scene, 6, 0.1)} color={C.amber} size={48}>÷ √k</Tag>
      <Parts x={px} y={500} size={52} parts={[[at(scene, 6, 0.15), '2g<\\dfrac1{\\sqrt k}']]} />
      <Eq x={px} y={675} start={at(scene, 6, 0.55)} size={50} color={FLOOR} tex="\dfrac1{\sqrt k}>2\left(\sqrt{k+1}-\sqrt k\right)" />
      <Boxed x={px - 20} y={645} w={790} h={180} start={at(scene, 6, 0.55)} />
    </>
  );
};

// ---------- Scene: floor (nested squares) ----------

const NU = 110;
const NX = 250;
const NY = 810;
const nP = Pt2(NX, NY, 1);
const SIDES = [1, 2, 3, 4, 5, 6].map((k) => NU * Math.sqrt(k));
const BIG = 470;

const NestFig: React.FC<{ scene: Parameters<SceneComponent>[0]['scene'] }> = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = SIDES.map((_, i) => at(scene, 0, 0.12 + i * 0.1));
  const bigStart = at(scene, 0, 0.78);
  const dots = ease(f, at(scene, 0, 0.7), 12);
  const band = (s0: number, s1: number): Pt[] => [nP(s0, 0), nP(s1, 0), nP(s1, s1), nP(0, s1), nP(0, s0), nP(s0, s0)];
  const bracketP = ease(f, at(scene, 1, 0.15), 18);
  const curK = SIDES.reduce((acc, _, i) => (f >= starts[i] ? i + 1 : acc), 0);
  return (
    <>
      <Stage>
        {SIDES.map((s, i) => {
          const p = ease(f, starts[i], 14);
          if (p <= 0) return null;
          if (i === 0) return <path key={i} d={poly([nP(0, 0), nP(s, 0), nP(s, s), nP(0, s)])} fill={C.blue} fillOpacity={0.14} stroke={C.ink} strokeWidth={5} opacity={p} />;
          return <path key={i} d={poly(band(SIDES[i - 1], s))} fill={FLOOR} fillOpacity={(i % 2 ? 0.55 : 0.22) * p} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" opacity={p} />;
        })}
        {ease(f, bigStart, 18) > 0 && (
          <path d={poly(band(SIDES[5], BIG))} fill={FLOOR} fillOpacity={0.22 * ease(f, bigStart, 18)} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" opacity={ease(f, bigStart, 18)} />
        )}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={nP(SIDES[5] + 56 + i * 40, 0)[0]} cy={nP(0, SIDES[5] + 56 + i * 40)[1]} r={8} fill={C.ink} opacity={dots} transform="" />
        ))}
        {/* vertical bracket: side from sqrt1 to sqrt101 */}
        <g opacity={bracketP} stroke={FLOOR} strokeWidth={7} strokeLinecap="round" fill="none">
          <path d={`M ${NX - 18} ${NY - SIDES[0]} L ${NX - 36} ${NY - SIDES[0]} L ${NX - 36} ${NY - BIG} L ${NX - 18} ${NY - BIG}`} />
        </g>
      </Stage>
      <Lbl x={NX + SIDES[0] / 2} y={NY - SIDES[0] / 2} tex="\sqrt1" start={starts[0] + 4} size={48} />
      <Lbl x={NX + BIG / 2} y={NY - BIG - 52} tex="\sqrt{101}" start={bigStart + 8} />
      {curK > 0 && curK < 7 && f < bigStart && (
        <div style={{ position: 'absolute', left: 830, top: 330 }}>
          <Tex tex={`\\text{side }\\sqrt{${curK}}`} size={56} color={FLOOR} />
        </div>
      )}
      <Tag x={NX + 14} y={NY - BIG + 12} start={at(scene, 0, 0.8)} color={C.muted} size={32}>
        (not to scale)
      </Tag>
    </>
  );
};

const FloorScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const px = 820;
  return (
    <>
      <NestFig scene={scene} />
      <Eq x={0} y={140} center start={at(scene, 2, 0.05)} size={50} tex="2(\sqrt2-\sqrt1)+2(\sqrt3-\sqrt2)+\cdots+2(\sqrt{101}-\sqrt{100})" />
      <Eq x={px} y={340} start={at(scene, 1, 0.25)} size={56} tex="\text{all gaps}=\sqrt{101}-1" />
      <Eq x={px} y={450} start={at(scene, 2, 0.5)} size={56} tex="\text{sum}>2\left(\sqrt{101}-1\right)" />
      <Parts x={px} y={560} size={56} parts={[[at(scene, 3, 0.1), '10^2=100<101'], [at(scene, 3, 0.55), '\\text{so }\\sqrt{101}>10']]} />
      <Eq x={px} y={655} start={at(scene, 4, 0.1)} size={58} color={FLOOR} tex="\text{sum}>2(10-1)\phantom{=18}" />
      <Eq x={px} y={655} start={at(scene, 4, 0.6)} size={58} color={FLOOR} tex="\phantom{\text{sum}>2(10-1)}=18" />
      <Boxed x={px - 20} y={640} w={740} h={100} start={at(scene, 4, 0.5)} />
      <Wall y0={1000} y1={800} start={at(scene, 4, 0.55)} color={FLOOR} x1={820} x2={1820} dur={28} labelTex="18" labelAbove labelX={1700} />
    </>
  );
};

// ---------- Scene: ceiling ----------

const CEIL_LABELS: GrowLabels = {
  inner: '\\sqrt{k-1}',
  innerArea: 'k-1',
  outer: '\\sqrt k',
  outerArea: '\\text{area }k',
  gap: 'h',
  right: '\\sqrt{k-1}',
  top: '\\sqrt k',
};

const CeilingScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cues: GrowCues = { inner: at(scene, 0, 0.55), outer: at(scene, 0, 0.8), strip: at(scene, 1, 0.5), split: at(scene, 2, 0.25) };
  const px = 1090;
  const figOut = fadeTo(f, at(scene, 4, 0.02), 0, 14);
  const l4Out = fadeTo(f, at(scene, 5, 0.02), 0, 14);
  return (
    <>
      <div style={{ opacity: figOut }}>
        <Tag x={780} y={150} start={cues.inner} color={C.muted} size={36}>
          drawn for k = 3
        </Tag>
        <GrowFig cues={cues} labels={CEIL_LABELS} color={CEIL} darkColor="#5b43d9" areaOne={1} />
        <Parts x={px} y={150} size={52} parts={[[at(scene, 1, 0.65), 'k-(k-1)=1']]} />
        <Parts x={px} y={240} size={52} parts={[[at(scene, 2, 0.5), 'h=\\sqrt k-\\sqrt{k-1}', CEIL]]} />
        <Parts x={px} y={330} size={50} parts={[[at(scene, 3, 0.1), '1=h\\sqrt{k-1}+h\\sqrt k']]} />
        <Parts x={px} y={410} size={50} parts={[[at(scene, 3, 0.3), '<2h\\sqrt k']]} />
        <Parts x={px} y={500} size={52} parts={[[at(scene, 3, 0.6), '\\dfrac1{\\sqrt k}<2h']]} />
        <Eq x={px} y={675} start={at(scene, 3, 0.85)} size={50} color={CEIL} tex="\dfrac1{\sqrt k}<2\left(\sqrt k-\sqrt{k-1}\right)" />
        <Boxed x={px - 20} y={645} w={800} h={180} start={at(scene, 3, 0.85)} color={CEIL} />
      </div>
      <div style={{ opacity: l4Out }}>
        <Eq x={0} y={250} center start={at(scene, 4, 0.2)} size={60} tex="\dfrac1{\sqrt1}=1\;<\;2\left(\sqrt1-\sqrt0\right)=2" />
        <Tag x={1450} y={400} start={at(scene, 4, 0.7)} color={C.red} size={52}>
          too loose
        </Tag>
      </div>
      <Eq x={0} y={185} center start={at(scene, 5, 0.1)} size={62} tex="\underbrace{1}_{\text{keep}}+\underbrace{\dfrac1{\sqrt2}+\cdots+\dfrac1{\sqrt{100}}}_{\text{squeeze these 99}}" />
      <Eq x={0} y={565} center start={at(scene, 6, 0.1)} size={48} tex="2(\sqrt2-\sqrt1)+2(\sqrt3-\sqrt2)+\cdots+2(\sqrt{100}-\sqrt{99})" />
      <Eq x={0} y={655} center start={at(scene, 6, 0.55)} size={54} tex="=2(\sqrt{100}-\sqrt1)=2(10-1)" />
      <Eq x={0} y={755} center start={at(scene, 7, 0.1)} size={62} color={CEIL} tex="\text{sum}<1+2\cdot 9=19" />
      <Wall y0={-40} y1={150} start={at(scene, 7, 0.25)} color={CEIL} x1={140} x2={1780} dur={28} labelTex="19" />
    </>
  );
};

// ---------- Scene: reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lx = (v: number) => 300 + (v - 17) * 440;
  const ly = 560;
  const slide = ease(f, at(scene, 2, 0.45), 28);
  const dot = 18.25 + (18.59 - 18.25) * slide;
  const done = at(scene, 1, 0.93);
  const dotIn = ease(f, at(scene, 0, 0.5), 12);
  return (
    <>
      <Eq x={0} y={170} center start={at(scene, 0, 0.55)} size={78} tex="18<\text{sum}<19" />
      <Stage>
        <line x1={lx(17)} y1={ly} x2={lx(20)} y2={ly} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {[17, 18, 19, 20].map((v) => (
          <line key={v} x1={lx(v)} y1={ly - 20} x2={lx(v)} y2={ly + 20} stroke={C.ink} strokeWidth={6} />
        ))}
        <rect x={lx(18)} y={ly - 16} width={ease(f, 8, 20) * 0 + (lx(19) - lx(18))} height={32} fill={C.amber} opacity={0.22 * dotIn} />
        <line x1={lx(18)} y1={ly - 150} x2={lx(18)} y2={ly + 10} stroke={FLOOR} strokeWidth={10} opacity={ease(f, at(scene, 0, 0.1), 14)} />
        <line x1={lx(19)} y1={ly - 150} x2={lx(19)} y2={ly + 10} stroke={CEIL} strokeWidth={10} opacity={ease(f, at(scene, 0, 0.3), 14)} />
        <circle cx={lx(dot)} cy={ly} r={22} fill={C.amber} opacity={dotIn} />
      </Stage>
      {[17, 18, 19, 20].map((v) => (
        <Lbl key={v} x={lx(v)} y={ly + 70} tex={`${v}`} start={4} size={56} color={v === 18 ? FLOOR : v === 19 ? CEIL : C.ink} />
      ))}
      <Tag x={lx(18) - 150} y={ly - 215} start={at(scene, 0, 0.1)} color={FLOOR} size={44}>floor</Tag>
      <Tag x={lx(19) - 40} y={ly - 215} start={at(scene, 0, 0.3)} color={CEIL} size={44}>ceiling</Tag>
      <Tag x={lx(dot) - 40} y={ly - 110} start={at(scene, 0, 0.55)} color={C.amber} size={44}>sum</Tag>
      <Pill x={1440} y={400} color={C.green} style={{ ...fadeUp(f, done), fontSize: 52 }}>
        Choice C
      </Pill>
      <Answer x={1560} y={260} value="18" chime={CHIME} start={done} />
      <Confetti x={1560} y={260} start={done} seed={7} />
      <Parts x={0} y={730} center size={72} parts={[[at(scene, 2, 0.3), '\\text{sum}\\approx 18.59', C.amber]]} />
    </>
  );
};

// ---------- Scene: algebra ----------

const Algebra: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const clear = fadeTo(f, at(scene, 5, 0.04), 0, 14);
  const c1 = f >= at(scene, 5, 0.4);
  const c2 = f >= at(scene, 5, 0.6);
  const c3 = f >= at(scene, 5, 0.8);
  const x = (on: boolean, t: string, col: string) => (on ? `{\\color{${col}}\\cancel{${t}}}` : t);
  const tele = `(${x(c1, '\\sqrt2', C.red)}-\\sqrt1)+(${x(c2, '\\sqrt3', C.amber)}-${x(c1, '\\sqrt2', C.red)})+(${x(c3, '\\sqrt4', C.blue)}-${x(c2, '\\sqrt3', C.amber)})+\\cdots+(\\sqrt{101}-${x(c3, '\\sqrt{100}', C.blue)})`;
  return (
    <>
      <div style={{ opacity: clear }}>
        <Eq x={120} y={150} start={at(scene, 1, 0.3)} size={58} tex="\left(\sqrt{k+1}-\sqrt k\right)\left(\sqrt{k+1}+\sqrt k\right)" />
        <Eq x={120} y={285} start={at(scene, 2, 0.15)} size={58} tex="=(k+1)-k=1" />
        <Tag x={800} y={300} start={at(scene, 2, 0.4)} color={C.amber} size={44}>
          difference of squares
        </Tag>
        <Eq x={120} y={395} start={at(scene, 3, 0.2)} size={58} tex="\sqrt{k+1}-\sqrt k=\dfrac1{\sqrt{k+1}+\sqrt k}" />
        <Eq x={120} y={580} start={at(scene, 4, 0.1)} size={58} tex="\sqrt{k+1}+\sqrt k>2\sqrt k" />
        <Eq x={120} y={695} start={at(scene, 4, 0.5)} size={54} color={FLOOR} tex="2\left(\sqrt{k+1}-\sqrt k\right)<\dfrac{2}{2\sqrt k}=\dfrac1{\sqrt k}" />
      </div>
      <Eq x={0} y={230} center start={at(scene, 5, 0.06)} size={50} tex={tele} />
      <Eq x={0} y={400} center start={at(scene, 5, 0.9)} size={64} color={FLOOR} tex="=\sqrt{101}-\sqrt1" />
      <Eq x={0} y={520} center start={at(scene, 5, 0.97)} size={60} color={FLOOR} tex="\text{so sum}>2\left(\sqrt{101}-1\right)\text{: same floor}" />
      <Pill x={560} y={700} color={C.violet} style={{ ...fadeUp(f, at(scene, 6, 0.55)), fontSize: 52 }}>
        Test day: a few lines
      </Pill>
    </>
  );
};

// ---------- Scene: traps ----------

const CARD_TEX = [
  '\\begin{gathered}100\\times\\dfrac1{10}\\\\=10\\end{gathered}',
  '\\begin{gathered}17<18\\\\<\\text{sum}\\end{gathered}',
  '\\begin{gathered}18<\\text{sum}\\\\<19\\end{gathered}',
  '\\text{sum}<19',
  '\\begin{gathered}2\\sqrt{100}\\\\=20\\end{gathered}',
];
const NOTES = ['True, but only a weak floor', 'Too small. The floor beats it', '', 'Ceiling is not the answer', 'Forgot to subtract'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.3), at(scene, 2, 0.1), Infinity, at(scene, 3, 0.3), at(scene, 4, 0.3)];
  const formAt = [at(scene, 1, 0.55), at(scene, 2, 0.35), at(scene, 5, 0.5), at(scene, 3, 0.55), at(scene, 4, 0.55)];
  const habit = at(scene, 5, 0.2);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICE_TEX.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 2 && f >= habit + 40;
          const border = wrong ? C.red : ok ? C.green : 'transparent';
          const col = wrong ? C.red : ok ? C.green : C.ink;
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 6 + i * 6, 12) }}>
              <div style={{ height: 380, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 14 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 110, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={68} color={col} />
                </div>
                <div style={{ height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, formAt[i]) }}>
                  {i === 3 && (
                    <svg width={220} height={50} style={{ opacity: ease(f, at(scene, 3, 0.4), 14) }}>
                      <line x1={10} y1={8} x2={210} y2={8} stroke={CEIL} strokeWidth={10} strokeLinecap="round" />
                      <circle cx={110} cy={36} r={11} fill={C.amber} />
                    </svg>
                  )}
                  <Tex tex={CARD_TEX[i]} size={52} color={col} />
                </div>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 14, fontSize: 34, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, color: C.red, ...fadeUp(f, wrongAt[i] + 8) }}>{NOTES[i]}</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', ...fadeUp(f, habit) }}>
        <div style={{ background: C.primary, color: '#fff', borderRadius: 28, padding: '12px 44px', fontSize: 50, fontWeight: 900 }}>
          <span style={{ color: '#fff' }}>Floor</span> AND <span style={{ color: '#e6deff' }}>ceiling</span>
        </div>
      </div>
    </>
  );
};

// ---------- Scene: variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>
        Your turn!
      </Pill>
      <Eq x={0} y={340} center start={at(scene, 1, 0.1)} size={70} tex={SUM10K} />
      <Text x={960} y={560} w={1600} size={54} weight={900} align="center" style={fadeUp(f, at(scene, 2, 0.15))}>
        Greatest whole number <Tex tex="\le" size={54} /> the sum?
      </Text>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 4, 0.93);
  return (
    <>
      <Eq x={120} y={160} start={at(scene, 0, 0.15)} size={54} tex="\text{sum}>2\left(\sqrt{10001}-1\right)" />
      <Eq x={120} y={280} start={at(scene, 0, 0.65)} size={54} tex="\sqrt{10001}>100" />
      <Eq x={120} y={400} start={at(scene, 1, 0.25)} size={58} color={FLOOR} tex="\text{sum}>2(100-1)=2\cdot 99\phantom{=198}" />
      <Eq x={120} y={400} start={at(scene, 1, 0.68)} size={58} color={FLOOR} tex="\phantom{\text{sum}>2(100-1)=2\cdot 99}=198" />
      <Eq x={120} y={540} start={at(scene, 2, 0.45)} size={54} tex="\text{sum}<1+2\left(\sqrt{10000}-1\right)" />
      <Eq x={120} y={670} start={at(scene, 3, 0.2)} size={58} color={CEIL} tex="=1+2\cdot 99=1+198=199" />
      <Answer x={1600} y={470} value="198" chime={CHIME} start={done} />
      <Confetti x={1600} y={470} start={done} seed={9} />
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0.02);
  const card1Out = fadeTo(f, l1, 0, 12);
  const out2 = fadeTo(f, at(scene, 2, 0.02), 0, 12);
  return (
    <>
      <div style={{ opacity: card1Out }}>
        <div style={{ position: 'absolute', left: 100, top: 190, width: 1720, height: 420, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) }} />
        <Text x={160} y={220} w={800} size={44} color={C.primary} weight={900} style={fadeUp(f, 4)}>The big idea</Text>
        <Eq x={0} y={320} center start={at(scene, 0, 0.3)} size={58} tex="{\color{#0cc281}2\left(\sqrt{k+1}-\sqrt k\right)}<\dfrac1{\sqrt k}<{\color{#7b61ff}2\left(\sqrt k-\sqrt{k-1}\right)}" />
        <Tag x={0} y={490} start={at(scene, 0, 0.7)} color={C.amber} size={52}>
          <div style={{ width: 1920, textAlign: 'center' }}>Add them up: the middle cancels!</div>
        </Tag>
      </div>
      <div style={{ opacity: out2 }}>
        <Wall y0={1000} y1={470} start={l1} dur={24} color={FLOOR} x1={400} x2={1520} labelTex="n" />
        <Wall y0={-40} y1={290} start={l1} dur={24} color={CEIL} x1={400} x2={1520} labelTex="n+1" labelAbove={false} />
        <Stage>
          <circle cx={960} cy={380} r={24} fill={C.amber} opacity={ease(f, l1 + 24, 10)} />
        </Stage>
        <Tag x={1000} y={345} start={l1 + 28} color={C.amber} size={44}>sum</Tag>
        <Tag x={0} y={560} start={at(scene, 1, 0.5)} color={C.ink} size={56}>
          <div style={{ width: 1920, textAlign: 'center' }}>floor and ceiling one apart: that gives the <span style={{ color: FLOOR }}>whole number</span></div>
        </Tag>
      </div>
      <SignOff start={at(scene, 2, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(SUM100, true, 10, 'What is the greatest whole number that is at most this sum?', 52),
  grow: Grow,
  floor: FloorScene,
  ceiling: CeilingScene,
  reveal: Reveal,
  algebra: Algebra,
  traps: Traps,
  variant: Variant,
  try2: makePause(SUM10K, false, 12, 'Hint: floor AND ceiling!', 52),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-01-root-sum-floor-thumb`, render.sh -> poster.jpg): the trap + the sum of 100 root fractions, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={['Think it\u2019s', <span style={{ color: C.red }}>19?</span>]}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <Tex tex={'\\dfrac{1}{\\sqrt{1}}+\\dfrac{1}{\\sqrt{2}}'} size={68} />
      <Tex tex={'+\\dfrac{1}{\\sqrt{3}}+\\cdots'} size={68} />
      <Tex tex={'+\\dfrac{1}{\\sqrt{100}}'} size={68} color={C.primary} />
    </div>
  </ThumbFrame>
);

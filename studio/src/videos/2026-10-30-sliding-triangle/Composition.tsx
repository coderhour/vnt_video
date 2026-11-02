import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent } from '../../lib/Explainer';
import type { Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-sliding-triangle';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GRAY = '#8e95a5';
const PANEL = 950;

// ---------- drawing helpers ----------

type Mapper = (x: number, y: number) => Pt; // maths coords (y up) -> pixels
export const mkP = (ox: number, oy: number, u: number): Mapper => (x, y) => [ox + x * u, oy - y * u];

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 48, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

export const Seg: React.FC<{ a: Pt; b: Pt; color: string; opacity?: number; width?: number; dashed?: boolean; progress?: number }> = ({ a, b, color, opacity = 1, width = 12, dashed, progress = 1 }) =>
  opacity <= 0 || progress <= 0 ? null : (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * progress} y2={a[1] + (b[1] - a[1]) * progress} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} strokeDasharray={dashed ? '14 12' : undefined} />
  );

export const Dot: React.FC<{ p: Pt; color: string; opacity?: number; r?: number }> = ({ p, color, opacity = 1, r = 13 }) =>
  opacity <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill={color} opacity={opacity} />;

const gap = (t: string) => 18 + t.length * 17;

/** Horizontal dimension bar with end ticks and a centred label. */
const DimH: React.FC<{ x1: number; x2: number; y: number; label: string; color?: string; opacity?: number }> = ({ x1, x2, y, label, color = C.ink, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${x1} ${y - 12} L ${x1} ${y + 12} M ${x1} ${y} L ${(x1 + x2) / 2 - gap(label)} ${y} M ${(x1 + x2) / 2 + gap(label)} ${y} L ${x2} ${y} M ${x2} ${y - 12} L ${x2} ${y + 12}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Label p={[(x1 + x2) / 2, y]} text={label} color={color} />
    </g>
  );

/** Vertical dimension bar with end ticks and a centred label. */
const DimV: React.FC<{ x: number; y1: number; y2: number; label: string; color?: string; opacity?: number }> = ({ x, y1, y2, label, color = C.ink, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${x - 12} ${y1} L ${x + 12} ${y1} M ${x} ${y1} L ${x} ${(y1 + y2) / 2 + Math.sign(y1 - y2) * 36} M ${x} ${(y1 + y2) / 2 - Math.sign(y1 - y2) * 36} L ${x} ${y2} M ${x - 12} ${y2} L ${x + 12} ${y2}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Label p={[x, (y1 + y2) / 2]} text={label} color={color} />
    </g>
  );

export const RightMark: React.FC<{ p: Pt; opacity: number; k?: number }> = ({ p, opacity, k = 30 }) =>
  opacity <= 0 ? null : <path d={`M ${p[0] + k} ${p[1]} L ${p[0] + k} ${p[1] - k} L ${p[0]} ${p[1] - k}`} stroke={C.ink} strokeWidth={5} fill="none" opacity={opacity} />;

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

// ---------- the figure ----------

type FigProps = {
  P: Mapper;
  b?: number; // base leg of T
  h?: number; // left leg of T
  d?: number; // final slide
  slide?: number; // current slide of the copy
  drawT?: number;
  drawC?: number;
  tFill?: number; // light fill on T
  cFill?: number; // light fill on C
  cOp?: number; // opacity of C's outline
  shade?: number;
  ov?: number;
  strip?: number;
  stripColor?: string;
  labels?: { b?: number; h?: number; d?: number; dim?: number };
  barY?: number; // pixel offset of the 12-bar under the base
  children?: React.ReactNode;
};

const geo = (b: number, h: number, d: number) => {
  const oh = (h * (b - d)) / b; // overlap height at x = d
  return { oh };
};

export const Fig: React.FC<FigProps> = ({ P, b = 12, h = 9, d = 4, slide, drawT = 1, drawC = 1, tFill = 0, cFill = 0.1, cOp = 1, shade = 0, ov = 0, strip = 0, stripColor = C.violet, labels = {}, barY = 100, children }) => {
  const s = slide ?? d;
  const { oh } = geo(b, h, d);
  const T: Pt[] = [P(0, 0), P(b, 0), P(0, h)];
  const Cp: Pt[] = [P(s, 0), P(s + b, 0), P(s, h)];
  const O: Pt[] = [P(d, 0), P(b, 0), P(d, oh)];
  const SH: Pt[] = [P(b, 0), P(b + d, 0), P(d, h), P(d, oh)];
  const L: Pt[] = [P(0, 0), P(d, 0), P(d, oh), P(0, h)];
  const base = P(0, 0)[1];
  return (
    <>
      <Poly pts={T} color={C.blue} width={0} fill={C.blue} fillOpacity={0.3} opacity={tFill} />
      <Poly pts={Cp} color={C.blue} width={0} fill={C.blue} fillOpacity={0.3} opacity={cFill * (drawC > 0 ? 1 : 0)} />
      <Poly pts={SH} color={GRAY} width={0} fill={GRAY} fillOpacity={0.5} opacity={shade} />
      <Poly pts={L} color={stripColor} width={0} fill={stripColor} fillOpacity={0.4} opacity={strip} />
      <Poly pts={O} color={C.primary} width={0} fill={C.primary} fillOpacity={0.45} opacity={ov} />
      <g opacity={cOp}>
        <Poly pts={Cp} color={C.ink} width={6} progress={drawC} />
      </g>
      <Poly pts={T} color={C.ink} width={6} progress={drawT} />
      <DimH x1={P(0, 0)[0]} x2={P(b, 0)[0]} y={base + barY} label={String(b)} opacity={(labels.b ?? 0) * (labels.dim ?? 1)} />
      <DimV x={P(0, 0)[0] - 56} y1={P(0, 0)[1]} y2={P(0, h)[1]} label={String(h)} opacity={labels.h ?? 0} />
      <DimH x1={P(0, 0)[0]} x2={P(d, 0)[0]} y={base + barY - 56} label={String(d)} opacity={labels.d ?? 0} />
      {children}
    </>
  );
};

// Main figure (left side) used by most scenes.
const P1 = mkP(150, 700, 46);
const ALL = { b: 1, h: 1, d: 1 };

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(200, 690, 52);
  const slide = 4 * ease(f, at(scene, 0, 0.6), 36);
  const shade = ease(f, at(scene, 1, 0.1), 14);
  return (
    <>
      <Text x={960} y={110} w={1500} size={72} weight={900} align="center" style={fadeUp(f, 0)}>
        Slide a triangle. How much sticks out?
      </Text>
      <Stage>
        <Fig P={P} slide={slide} drawT={ease(f, 6, 24)} drawC={ease(f, at(scene, 0, 0.35), 8)} cFill={ease(f, at(scene, 0, 0.35), 8) * 0.8} shade={shade}>
          <Label p={P(11.6, 2.4)} text="?" color={C.ink} size={96} opacity={ease(f, at(scene, 1, 0.45), 10)} />
        </Fig>
      </Stage>
      <div style={{ position: 'absolute', left: 1180, top: 400, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['18', '24', '27', '28', '30'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: PANEL, top: 140, width: 880, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        A right triangle has <Mark on={at(scene, 0, 0.5)}>legs 12 and 9</Mark>. It is copied, and the copy is <Mark on={at(scene, 1, 0.5)}>slid 4 to the right</Mark>, as shown. What is the area of <Mark on={at(scene, 2, 0.3)}>the shaded part</Mark> of the copy, the part that does not overlap the original?
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 690, display: 'flex', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 3, 0.15 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '8px 18px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
            <span style={{ color: C.muted, fontSize: 46, marginRight: 8 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <Fig P={P1} drawT={ease(f, 6, 20)} drawC={ease(f, 16, 20)} cFill={ease(f, 30, 10)} shade={ease(f, at(scene, 2, 0.3), 12)} labels={{ b: ease(f, at(scene, 0, 0.5), 10), h: ease(f, at(scene, 0, 0.6), 10), d: ease(f, at(scene, 1, 0.5), 10) }} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  const legs = ease(f, at(scene, 1, 0.1), 12);
  const pulse = 0.5 + 0.5 * Math.sin(Math.max(0, f - at(scene, 3, 0.1)) / 5);
  const g3 = ease(f, at(scene, 3, 0.1), 12);
  return (
    <>
      <Stage>
        <Fig P={P} shade={0.35 + 0.65 * g3 * (0.7 + 0.3 * pulse)} labels={ALL}>
          <Seg a={P(0, 0)} b={P(12, 0)} color={C.blue} opacity={legs * fadeTo(f, at(scene, 2, 0), 0.3)} progress={legs} />
          <Seg a={P(0, 0)} b={P(0, 9)} color={C.amber} opacity={legs * fadeTo(f, at(scene, 2, 0), 0.3)} progress={legs} />
          <RightMark p={P(0, 0)} opacity={ease(f, at(scene, 1, 0.6), 10)} />
          <Seg a={P(0, 0)} b={P(4, 0)} color={C.green} opacity={ease(f, at(scene, 2, 0.1), 10)} progress={ease(f, at(scene, 2, 0.1), 16)} width={10} />
        </Fig>
      </Stage>
      <Check x={PANEL} y={190} start={at(scene, 1, 0.2)}>Legs 12 and 9, square corner</Check>
      <Check x={PANEL} y={290} start={at(scene, 2, 0.2)}>Copy slides 4 along the base</Check>
      <Text x={PANEL} y={430} w={900} size={44} weight={900} color={C.muted} style={fadeUp(f, at(scene, 3, 0.1))}>
        Goal: the shaded part (gray)
      </Text>
      <div style={{ position: 'absolute', left: PANEL, top: 510, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 3, 0.4)) }}>
        <Tex tex={'\\text{shaded} = \\text{copy} - \\text{overlap}'} size={54} />
      </div>
    </>
  );
};

const makePause = (seconds: number, prompt: string, b: number, h: number, d: number, u: number, oy: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(130, oy, u);
  return (
    <>
      <Stage>
        <Fig P={P} b={b} h={h} d={d} shade={1} labels={ALL} barY={90}>
          <Label p={P(b + d * 0.45, h * 0.12)} text="?" size={90} />
        </Fig>
      </Stage>
      <Text x={PANEL} y={150} w={880} size={46} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1400} y={560} tick={TICK} />
    </>
  );
};

const Whole: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  return (
    <>
      <Stage>
        <Fig P={P} cFill={ease(f, at(scene, 1, 0.1), 12) * 2.2 + 0.1} labels={ALL}>
          <Label p={P(7.4, 2.0)} text="54" color={C.blue} size={72} opacity={ease(f, at(scene, 2, 0.5), 10)} />
        </Fig>
      </Stage>
      <Eq y={230} start={at(scene, 1, 0.5)} tex={'\\dfrac{1}{2} \\times 12 \\times 9'} />
      <Eq y={350} start={at(scene, 2, 0.15)} color={C.blue} size={70} tex={'= 54'} />
    </>
  );
};

const Overlap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  const ovp = ease(f, at(scene, 0, 0.2), 14);
  const side = ease(f, at(scene, 3, 0.1), 12);
  const mini = ease(f, at(scene, 4, 0.3), 14);
  const Pm = mkP(1030, 400, 20); // small T at the right
  const bar8 = ease(f, at(scene, 2, 0.55), 12);
  return (
    <>
      <Stage>
        <Fig P={P} cFill={0.1} ov={ovp} labels={{ b: 1, h: 1, d: 1 }}>
          <RightMark p={P(4, 0)} opacity={ease(f, at(scene, 1, 0.3), 10)} />
          <Dot p={P(4, 0)} color={C.primary} opacity={ease(f, at(scene, 1, 0.6), 10)} />
          <DimH x1={P(4, 0)[0]} x2={P(12, 0)[0]} y={P(0, 0)[1] + 44} label="8" color={C.green} opacity={bar8} />
          <Seg a={P(4, 6)} b={P(12, 0)} color={C.violet} opacity={side} width={14} progress={side} />
          <Seg a={P(4, 0)} b={P(4, 6)} color={C.red} opacity={ease(f, at(scene, 6, 0.2), 10)} width={12} progress={ease(f, at(scene, 6, 0.2), 14)} />
          <Label p={P(5.1, 2.4)} text="6" color={C.red} opacity={ease(f, at(scene, 6, 0.7), 10)} size={56} />
          <Label p={P(6.7, 1.2)} text="24" color={C.green} size={70} opacity={ease(f, at(scene, 7, 0.6), 10)} />
        </Fig>
        {/* small T and O side by side */}
        <g opacity={mini}>
          <Poly pts={[Pm(0, 0), Pm(12, 0), Pm(0, 9)]} color={C.ink} width={5} fill={C.blue} fillOpacity={0.2} />
          <Poly pts={[Pm(0, 0), Pm(8, 0), Pm(0, 6)]} color={C.green} width={5} fill={C.primary} fillOpacity={0.45} />
          <Label p={Pm(10, -2)} text="12" size={48} />
          <Label p={Pm(4, -2)} text="8" size={48} color={C.green} opacity={ease(f, at(scene, 5, 0.2), 10)} />
          <Label p={Pm(-2.2, 7.6)} text="9" size={48} />
          <Label p={Pm(-2.2, 3)} text="6" size={48} color={C.red} opacity={ease(f, at(scene, 6, 0.6), 10)} />
        </g>
      </Stage>
      <Eq y={130} start={at(scene, 2, 0.5)} color={C.green} tex={'12 - 4 = 8'} />
      <div style={{ position: 'absolute', left: PANEL, top: 470, width: 520, fontSize: 40, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 4, 0.7)) }}>same angles, smaller</div>
      <Eq y={215} x={1400} start={at(scene, 5, 0.45)} color={C.violet} tex={'\\dfrac{8}{12} = \\dfrac{2}{3}'} />
      <Eq y={385} x={1400} start={at(scene, 6, 0.3)} color={C.red} tex={'\\dfrac{2}{3} \\times 9 = 6'} />
      <Eq y={600} start={at(scene, 7, 0.3)} color={C.green} size={62} tex={'\\dfrac{1}{2} \\times 8 \\times 6 = 24'} />
    </>
  );
};

const Total1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  const done = at(scene, 1, 0.97);
  const hl = ease(f, at(scene, 1, 0.2), 12);
  return (
    <>
      <Stage>
        <Fig P={P} ov={1} shade={ease(f, at(scene, 0, 0.5), 12)} labels={ALL}>
          <Label p={P(6.7, 1.2)} text="24" color={C.green} size={70} />
          <Label p={P(13, 1.2)} text="30" color={C.ink} size={64} opacity={ease(f, done, 10)} />
        </Fig>
      </Stage>
      <Eq y={190} start={at(scene, 0, 0.2)} size={72} tex={`{\\color{${'#3c83f6'}}54} - {\\color{${'#0cc281'}}24}`} />
      <Eq y={190} x={1250} start={at(scene, 0, 0.8)} size={72} tex={'= 30'} />
      <div style={{ position: 'absolute', left: PANEL, top: 360, display: 'flex', gap: 14 }}>
        {CHOICES.map((c, i) => {
          const win = i === 4 && hl > 0.5;
          return (
            <div key={c} style={{ background: win ? C.green : C.card, color: win ? '#fff' : C.ink, borderRadius: 18, padding: '8px 18px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap', opacity: win ? 1 : 1 - 0.5 * hl }}>
              <span style={{ color: win ? '#fff' : C.muted, fontSize: 46, marginRight: 8 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      <Answer x={1600} y={640} value="E" chime={CHIME} start={done} />
      <Confetti x={1600} y={640} start={done} seed={7} />
    </>
  );
};

const Strip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  const dimC = ease(f, at(scene, 0, 0.3), 14);
  const tf = ease(f, at(scene, 0, 0.4), 14);
  const ovp = ease(f, at(scene, 1, 0.1), 12);
  const same = ease(f, at(scene, 2, 0.1), 12);
  const lOnly = ease(f, at(scene, 3, 0.1), 12);
  const q = ease(f, at(scene, 4, 0.5), 10);
  const six = ease(f, at(scene, 6, 0.75), 10);
  const big = ease(f, at(scene, 5, 0.1), 12);
  const small = ease(f, at(scene, 5, 0.55), 14);
  const bigOut = 1 - small;
  const A: Pt = P(0, 9);
  return (
    <>
      <Stage>
        <Fig P={P} cOp={1 - 0.75 * dimC} cFill={0.1 * (1 - dimC)} tFill={tf * 0.9} ov={ovp} strip={same * (1 - 0.0)} shade={same * (1 - lOnly * 0.7)} labels={{ b: 1, h: 1, d: lOnly }}>
          <Seg a={P(4, 0)} b={P(4, 6)} color={C.violet} width={12} opacity={q} progress={q} />
          <Label p={P(4.7, 3)} text="?" color={C.violet} size={64} opacity={q * (1 - six)} />
          <Label p={P(4.7, 3)} text="6" color={C.violet} size={64} opacity={six} />
          {/* long side: 12 across, 9 down, then 4 across, 3 down */}
          <g opacity={big * bigOut}>
            <Seg a={A} b={P(12, 9)} color={C.blue} width={8} progress={big} />
            <Seg a={P(12, 9)} b={P(12, 0.5)} color={C.amber} width={8} progress={ease(f, at(scene, 5, 0.3), 14)} />
            <Label p={P(6, 9.8)} text="12" color={C.blue} size={52} />
            <Label p={P(12.9, 4.5)} text="9" color={C.amber} size={52} />
          </g>
          <g opacity={small}>
            <Seg a={A} b={P(4, 9)} color={C.blue} width={10} progress={small} />
            <Seg a={P(4, 9)} b={P(4, 6)} color={C.amber} width={10} progress={ease(f, at(scene, 5, 0.75), 10)} />
            <Label p={P(2, 9.8)} text="4" color={C.blue} size={52} />
            <Label p={P(4.9, 7.5)} text="3" color={C.amber} size={52} opacity={ease(f, at(scene, 5, 0.85), 10)} />
          </g>
        </Fig>
      </Stage>
      <Text x={PANEL} y={150} w={900} size={44} weight={800} color={C.blue} style={fadeUp(f, at(scene, 1, 0.3))}>
        Original = 54, loses the same 24
      </Text>
      <div style={{ position: 'absolute', left: PANEL, top: 250, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, at(scene, 2, 0.3)) }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 26px', fontSize: 42, fontWeight: 900 }}>left-over</div>
        <div style={{ fontSize: 80, fontWeight: 900 }}>=</div>
        <div style={{ background: GRAY, color: '#fff', borderRadius: 999, padding: '8px 26px', fontSize: 42, fontWeight: 900 }}>shaded</div>
      </div>
      <Text x={PANEL} y={360} w={900} size={40} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.6))}>
        same size (not the same shape!)
      </Text>
      <Eq y={500} start={at(scene, 5, 0.5)} color={C.amber} tex={'\\dfrac{9}{12} = \\dfrac{3}{4}'} />
      <Eq y={680} start={at(scene, 6, 0.3)} color={C.violet} size={70} tex={'9 - 3 = 6'} />
    </>
  );
};

const StripArea: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  const done = at(scene, 3, 0.35);
  return (
    <>
      <Stage>
        <Fig P={P} cOp={0.25} cFill={0} tFill={0} strip={1} ov={0} shade={0.4} labels={{ b: 0, h: 1, d: 1 }}>
          <Seg a={P(4, 0)} b={P(4, 6)} color={C.violet} width={12} opacity={ease(f, at(scene, 0, 0.5), 10)} />
          <Label p={P(4.7, 3)} text="6" color={C.violet} size={56} opacity={ease(f, at(scene, 0, 0.5), 10)} />
          <DimH x1={P(0, 0)[0]} x2={P(4, 0)[0]} y={P(0, 0)[1] + 44} label="4" color={C.violet} opacity={ease(f, at(scene, 0, 0.7), 10)} />
        </Fig>
      </Stage>
      <Text x={PANEL} y={140} w={900} size={44} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>
        A trapezoid: sides 9 and 6, width 4
      </Text>
      <Eq y={235} start={at(scene, 1, 0.3)} size={50} color={C.violet} tex={'\\text{area} = \\dfrac{\\text{side} + \\text{side}}{2} \\times \\text{width}'} />
      <Eq y={370} start={at(scene, 2, 0.1)} tex={'9 + 6 = 15'} />
      <Eq y={455} start={at(scene, 2, 0.4)} tex={'15 \\div 2 = 7.5'} />
      <Eq y={545} start={at(scene, 2, 0.7)} color={C.violet} size={70} tex={'7.5 \\times 4 = 30'} />
      <Check x={PANEL} y={665} start={done}>Same answer: 30</Check>
      <Pill x={PANEL} y={760} color={C.amber} style={{ ...fadeUp(f, at(scene, 3, 0.7)), fontSize: 42 }}>Strip easier to see? Use this way</Pill>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = P1;
  const wrongAt = [at(scene, 3, 0.1), at(scene, 1, 0.1), at(scene, 2, 0.1), at(scene, 5, 0.1), Infinity];
  const o24 = ease(f, at(scene, 1, 0.1), 12);
  const tri18 = ease(f, at(scene, 3, 0.3), 14);
  const miss = ease(f, at(scene, 4, 0.2), 12);
  const drop = ease(f, at(scene, 5, 0.3), 14);
  const marks = ease(f, at(scene, 6, 0.5), 12);
  const t18 = Math.max(0, tri18) * (1 - ease(f, at(scene, 5, 0.1), 10));
  return (
    <>
      <Stage>
        <Fig P={P} cFill={0.1} ov={o24} shade={0.35 * (1 - o24)} labels={ALL}>
          <Poly pts={[P(0, 0), P(4, 0), P(0, 9)]} color={C.red} width={7} dashed progress={tri18} opacity={1 - ease(f, at(scene, 5, 0.1), 10)} />
          <Poly pts={[P(4, 0), P(4, 6), P(0, 9)]} color={C.red} width={0} fill={C.red} fillOpacity={0.35} opacity={miss * (1 - ease(f, at(scene, 5, 0.1), 10))} />
          <Seg a={P(4, 0)} b={P(4, 6)} color={C.amber} width={12} opacity={miss * (1 - ease(f, at(scene, 5, 0.1), 10))} progress={miss} />
          <Label p={P(2.4, 1.6)} text="gap" color={C.red} size={48} opacity={t18 * miss} />
          <Seg a={P(0, 9)} b={P(4, 5)} color={C.red} width={7} dashed opacity={drop} progress={drop} />
          <Dot p={P(4, 6)} color={C.green} opacity={marks} />
          <Dot p={P(4, 5)} color={C.red} opacity={marks} />
          <Label p={P(5.0, 6.8)} text="6" color={C.green} size={56} opacity={marks} />
          <Label p={P(5.4, 3.9)} text="5" color={C.red} size={56} opacity={marks} />
        </Fig>
      </Stage>
      <div style={{ position: 'absolute', left: PANEL, top: 135, display: 'flex', gap: 14 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          return (
            <div key={c} style={{ background: wrong ? 'rgba(239,67,67,0.12)' : C.card, border: `4px solid ${wrong ? C.red : 'transparent'}`, color: wrong ? C.red : C.ink, borderRadius: 18, padding: '4px 16px', fontSize: 52, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <span style={{ fontSize: 44, marginRight: 8, opacity: 0.7 }}>{'ABCDE'[i]}</span>
              {c}
              
            </div>
          );
        })}
      </div>
      <Eq y={235} start={at(scene, 1, 0.3)} color={C.red} size={52} tex={'24 = \\text{the overlap}'} />
      <Eq y={320} start={at(scene, 2, 0.3)} color={C.red} size={52} tex={'54 \\div 2 = 27'} />
      <Text x={1400} y={325} w={460} size={46} weight={900} color={C.red} style={fadeUp(f, at(scene, 2, 0.6))}>not half!</Text>
      <Eq y={405} start={at(scene, 3, 0.4)} color={C.red} size={52} tex={'\\dfrac{1}{2} \\times 4 \\times 9 = 18'} />
      <Text x={PANEL} y={525} w={900} size={44} weight={900} color={C.red} style={fadeUp(f, at(scene, 5, 0.4))}>4 across, 4 down (not 3)</Text>
      <Eq y={590} start={at(scene, 6, 0.1)} color={C.red} size={52} tex={'\\dfrac{9 + 5}{2} \\times 4 = 28'} />
      <Pill x={PANEL} y={770} color={C.primary} style={{ ...fadeUp(f, at(scene, 7, 0.3)), fontSize: 38 }}>What is shaded? Check every height.</Pill>
    </>
  );
};

// ---------- variant ----------

const PV = mkP(140, 640, 52);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={PANEL} y={190} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Text x={PANEL} y={300} w={900} size={52} weight={900} style={fadeUp(f, at(scene, 1, 0.3))}>
        Legs 10 and 5
      </Text>
      <Text x={PANEL} y={390} w={900} size={52} weight={800} color={C.blue} style={fadeUp(f, at(scene, 2, 0.1))}>
        Slide 4 to the right
      </Text>
      <Text x={PANEL} y={490} w={900} size={48} weight={700} style={fadeUp(f, at(scene, 2, 0.5))}>
        Area of the shaded part?
      </Text>
      <Stage>
        <Fig P={PV} b={10} h={5} d={4} drawT={ease(f, at(scene, 0, 0.3), 20)} drawC={ease(f, at(scene, 0, 0.6), 20)} cFill={ease(f, at(scene, 0, 0.8), 10)} shade={ease(f, at(scene, 2, 0.5), 12)} labels={{ b: ease(f, at(scene, 1, 0.1), 10), h: ease(f, at(scene, 1, 0.4), 10), d: ease(f, at(scene, 2, 0.1), 10) }} barY={90} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = PV;
  const done = at(scene, 4, 0.97);
  const out = fadeTo(f, at(scene, 5, 0.0), 0);
  const stripOn = ease(f, at(scene, 5, 0.0), 12);
  return (
    <>
      <Stage>
        <Fig P={P} b={10} h={5} d={4} cFill={ease(f, at(scene, 0, 0.3), 10) * 1.5 + 0.1} ov={ease(f, at(scene, 1, 0.1), 12)} strip={stripOn} shade={0.3 + 0.2 * (1 - stripOn)} labels={{ b: 1, h: 1, d: 1 }} barY={90}>
          <Label p={P(6.3, 0.9)} text="25" color={C.blue} size={60} opacity={ease(f, at(scene, 0, 0.8), 10) * (1 - ease(f, at(scene, 1, 0.1), 10))} />
          <Label p={P(6.4, 0.95)} text="9" color={C.green} size={64} opacity={ease(f, at(scene, 3, 0.7), 10) * out} />
          <Label p={P(3.4, 1.5)} text="3" color={C.red} size={56} opacity={ease(f, at(scene, 2, 0.6), 10) * out} />
          <Label p={P(3.4, 1.5)} text="3" color={C.violet} size={56} opacity={ease(f, at(scene, 5, 0.6), 10)} />
          <Label p={P(-0.9, 2.5)} text="" opacity={0} />
          <Seg a={P(4, 0)} b={P(4, 3)} color={C.violet} width={12} opacity={ease(f, at(scene, 5, 0.3), 10)} />
          <DimH x1={P(4, 0)[0]} x2={P(10, 0)[0]} y={P(0, 0)[1] + 34} label="6" color={C.green} opacity={ease(f, at(scene, 1, 0.1), 10) * out} />
          <Label p={P(-0.7, 2.5)} text="" opacity={0} />
        </Fig>
      </Stage>
      <div style={{ opacity: out }}>
        <Eq y={115} start={at(scene, 0, 0.5)} size={52} tex={'\\dfrac{1}{2} \\times 10 \\times 5 = 25'} color={C.blue} />
        <Eq y={285} start={at(scene, 1, 0.1)} size={52} tex={'10 - 4 = 6'} color={C.green} />
        <Eq y={255} x={1330} start={at(scene, 1, 0.55)} size={52} tex={'\\dfrac{6}{10} = \\dfrac{3}{5}'} color={C.violet} />
        <Eq y={410} start={at(scene, 2, 0.2)} size={52} tex={'\\dfrac{3}{5} \\times 5 = 3'} color={C.red} />
        <Eq y={565} start={at(scene, 3, 0.2)} size={52} tex={'\\dfrac{1}{2} \\times 6 \\times 3 = 9'} color={C.green} />
        <Eq y={705} start={at(scene, 4, 0.2)} size={70} tex={'25 - 9'} />
        <Eq y={705} x={1200} start={at(scene, 4, 0.85)} size={70} tex={'= 16'} />
      </div>
      <Eq y={140} start={at(scene, 6, 0.0)} size={64} tex={'5 + 3 = 8'} color={C.violet} />
      <Eq y={235} start={at(scene, 6, 0.3)} size={64} tex={'\\dfrac{8}{2} = 4'} color={C.violet} />
      <Eq y={390} start={at(scene, 6, 0.6)} size={64} tex={'4 \\times 4 = 16'} color={C.violet} />
      <Check x={PANEL} y={540} start={at(scene, 6, 0.9)}>It matches!</Check>
      <Answer x={1680} y={700} value="16" chime={CHIME} start={done} />
      <Confetti x={1680} y={700} start={at(scene, 7, 0.1)} seed={11} />
      <Pill x={PANEL} y={800} color={C.primary} style={{ ...fadeUp(f, at(scene, 7, 0.2)), fontSize: 44 }}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const P = mkP(1160, 640, 32);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 150, width: 1720, height: 650, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 60, top: 40, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 60, top: 130, width: 940, fontSize: 52, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.5)) }}>
          Slide a triangle along its base: the overlap is a smaller copy.
        </div>
        <div style={{ position: 'absolute', left: 60, top: 400, width: 940, fontSize: 52, fontWeight: 900, lineHeight: 1.25, color: C.violet, ...fadeUp(f, at(scene, 2, 0.15)) }}>
          Whole − overlap = left over.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 0, 0.8), 14) * cardOut}>
          <Fig P={P} cFill={0.1} ov={ease(f, at(scene, 1, 0.6), 14)} shade={ease(f, at(scene, 2, 0.3), 12)} labels={{}} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'What is the area of the shaded part?', 12, 9, 4, 46, 700),
  whole: Whole,
  overlap: Overlap,
  total1: Total1,
  strip: Strip,
  'strip-area': StripArea,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'Legs 10 and 5, slide 4 right. Area of the shaded part?', 10, 5, 4, 52, 640),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

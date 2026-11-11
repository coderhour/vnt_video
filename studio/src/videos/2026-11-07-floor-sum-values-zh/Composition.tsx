import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Stage, type Pt } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-07-floor-sum-values-zh';
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

export const G1 = '#8a8a8a'; // floor x
export const G2 = C.violet; // floor 2x
export const G3 = C.primary; // floor 3x
const G4 = C.blue; // floor 4x (variant)
export const TOT = '#333333';
export const OK = C.green;
export const BAD = C.red;

export const F1 = '\\lfloor x\\rfloor';
export const F2 = '\\lfloor 2x\\rfloor';
export const F3 = '\\lfloor 3x\\rfloor';
const F4 = '\\lfloor 4x\\rfloor';
export const CHOICES = ['667', '668', '670', '750', '834'];

// ---------- helpers ----------

const Parts: React.FC<{ x: number; y: number; parts: [number, string | Part[], string?][]; size?: number; center?: boolean; gap?: number; opacity?: number }> = ({
  x, y, parts, size = 52, center = false, gap = 6, opacity = 1,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center', gap, whiteSpace: 'nowrap', opacity }}>
      {parts.map(([start, tex, color], i) => (
        <div key={i} style={fadeUp(f, start)}>
          <Z p={tex} size={size} color={color ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

const Eq: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ start, tex, color, ...rest }) => (
  <Parts {...rest} parts={[[start, tex, color]]} />
);

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; opacity?: number }> = ({ x, y, start, color, children, size = 40, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return <div style={{ position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>{children}</div>;
};

/** Maths label centred on (x, y). */
export const Lbl: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; anchor?: 'center' | 'right' | 'left'; opacity?: number; pops?: boolean }> = ({
  x, y, tex, start, size = 48, color = C.ink, anchor = 'center', opacity = 1, pops = false,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 10) * opacity;
  if (p <= 0) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  const sc = pops ? 0.6 + 0.4 * Math.min(1.15, pop(f, start, 30)) : 1;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%) scale(${sc})`, opacity: p, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; color?: string }> = ({ x, y, w, h, start, color = C.primary }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; start: number; color?: string; fill?: string; children?: React.ReactNode; opacity?: number; pad?: number }> = ({
  x, y, w, h, start, color, fill = C.card, children, opacity = 1, pad = 0,
}) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', padding: pad, background: fill, borderRadius: 22, border: color ? `5px solid ${color}` : undefined, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      {children}
    </div>
  );
};

// ---------- staircase graph pieces (SVG, pixel coords) ----------

export type Mapper = (x: number, y: number) => Pt;
export const mk = (ox: number, oy: number, ux: number, uy: number): Mapper => (x, y) => [ox + x * ux, oy - y * uy];

export const Axes: React.FC<{ g: Mapper; xmax: number; ymax: number; xticks: number[]; start?: number; opacity?: number }> = ({ g, xmax, ymax, xticks, start = -100, opacity = 1 }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 14) * opacity;
  const [x0, y0] = g(0, 0);
  const [x1] = g(xmax, 0);
  const [, y1] = g(0, ymax);
  return (
    <g opacity={o} stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none">
      <line x1={x0 - 10} y1={y0} x2={x1} y2={y0} />
      <path d={`M ${x1 - 18} ${y0 - 12} L ${x1} ${y0} L ${x1 - 18} ${y0 + 12}`} />
      <line x1={x0} y1={y0 + 10} x2={x0} y2={y1} />
      <path d={`M ${x0 - 12} ${y1 + 18} L ${x0} ${y1} L ${x0 + 12} ${y1 + 18}`} />
      {xticks.map((x) => (
        <line key={x} x1={g(x, 0)[0]} y1={y0 - 10} x2={g(x, 0)[0]} y2={y0 + 10} />
      ))}
    </g>
  );
};

/** One step: horizontal segment drawn left to right, filled dot at the left end, hollow dot at the right end. */
export const Seg: React.FC<{ a: Pt; b: Pt; start: number; dur?: number; color: string; w?: number; r?: number; opacity?: number; hollow?: boolean }> = ({
  a, b, start, dur = 16, color, w = 10, r = 13, opacity = 1, hollow = true,
}) => {
  const f = useCurrentFrame();
  const e = ease(f, start, dur);
  if (e <= 0 || opacity <= 0) return null;
  const x2 = a[0] + (b[0] - a[0]) * e;
  const pa = Math.min(1.1, pop(f, start, 30));
  const pb = hollow && e >= 1 ? Math.min(1.1, pop(f, start + dur, 30)) : 0;
  return (
    <g opacity={opacity}>
      <line x1={a[0]} y1={a[1]} x2={x2} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="butt" />
      <circle cx={a[0]} cy={a[1]} r={r * pa} fill={color} />
      {pb > 0 && <circle cx={b[0]} cy={b[1]} r={r * pb} fill={C.bg} stroke={color} strokeWidth={w * 0.6} />}
    </g>
  );
};

/** Faint dashed vertical for a jump (never a solid riser). */
export const Vert: React.FC<{ a: Pt; b: Pt; start: number; color?: string; opacity?: number; w?: number }> = ({ a, b, start, color = C.muted, opacity = 0.7, w = 4 }) => {
  const f = useCurrentFrame();
  const e = ease(f, start, 14) * opacity;
  if (e <= 0) return null;
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeDasharray="10 10" opacity={e} />;
};

// steps of the total f(x) = floor x + floor 2x + floor 3x
export type S3 = [number, number, number];
export const T1: S3[] = [[0, 1 / 3, 0], [1 / 3, 1 / 2, 1], [1 / 2, 2 / 3, 2], [2 / 3, 1, 3]];
export const T2: S3[] = [[1, 4 / 3, 6], [4 / 3, 3 / 2, 7], [3 / 2, 5 / 3, 8], [5 / 3, 2, 9]];
export const fval = (x: number) => Math.floor(x) + Math.floor(2 * x) + Math.floor(3 * x);

export const SegList: React.FC<{ g: Mapper; steps: S3[]; start: (i: number) => number; color?: string; w?: number; r?: number; opacity?: number; dy?: number; dur?: number }> = ({
  g, steps, start, color = TOT, w = 12, r = 15, opacity = 1, dy = 0, dur = 14,
}) => (
  <>
    {steps.map(([x0, x1, v], i) => {
      const a = g(x0, v), b = g(x1, v);
      return <Seg key={i} a={[a[0], a[1] + dy]} b={[b[0], b[1] + dy]} start={start(i)} color={color} w={w} r={r} opacity={opacity} dur={dur} />;
    })}
  </>
);

/** Row of remainder cells; green = makeable, red = skipped. */
export const Strip: React.FC<{ x: number; y: number; n: number; good: number[]; start: number; cell?: number; gap?: number; label?: string; labelStart?: number }> = ({
  x, y, n, good, start, cell = 72, gap = 8, label, labelStart,
}) => {
  const f = useCurrentFrame();
  const fs = Math.max(48, Math.round(cell * 0.62));
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: x + i * (cell + gap), top: y, width: cell, height: cell, borderRadius: 16, background: good.includes(i) ? OK : BAD, color: '#fff', fontSize: fs, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, start + i * 3, 10) }}>
          {i}
        </div>
      ))}
      {label && <Lbl x={x} y={y + cell + 48} tex={label} start={labelStart ?? start} anchor="left" color={C.ink} />}
    </>
  );
};

// ---------- Scene: intro ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 1, 0), 0, 12);
  const cols = [420, 960, 1500];
  const names = ['这个数', '两倍', '三倍'];
  const xs = ['x', '2x', '3x'];
  const fl = [F1, F2, F3];
  const cl = [G1, G2, G3];
  const bs = [0.08, 0.4, 0.55];
  const cs = [0.3, 0.52, 0.64];
  return (
    <>
      <div style={{ opacity: out }}>
        {cols.map((cx, i) => (
          <div key={i}>
            <Text x={cx} y={130} w={340} size={42} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, bs[i]))}>{names[i]}</Text>
            <Card x={cx - 170} y={190} w={340} h={120} start={at(scene, 0, bs[i])}>
              <Tex tex={xs[i]} size={66} />
            </Card>
            <Stage>
              <g opacity={ease(f, at(scene, 0, cs[i]), 12)} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
                <line x1={cx} y1={325} x2={cx} y2={400} />
                <path d={`M ${cx - 14} ${386} L ${cx} ${402} L ${cx + 14} ${386}`} />
              </g>
            </Stage>
            <Text x={cx + 28} y={338} w={300} size={36} weight={800} color={C.muted} style={{ opacity: ease(f, at(scene, 0, cs[i]), 12) }}>向下取整</Text>
            <Card x={cx - 150} y={420} w={300} h={110} start={at(scene, 0, cs[i])} color={cl[i]}>
              <Tex tex={fl[i]} size={62} color={cl[i]} />
            </Card>
          </div>
        ))}
        <Parts x={0} y={620} center size={64} parts={[[at(scene, 0, 0.82), `${F1}+${F2}+${F3}`]]} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontSize: 260, fontWeight: 900, color: C.ink, opacity: ease(f, at(scene, 1, 0.05), 12) * fadeTo(f, at(scene, 2, 0), 0, 12) }}>1000</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: ease(f, at(scene, 1, 0.68), 8) * fadeTo(f, at(scene, 2, 0), 0, 12), transform: `rotate(-6deg) scale(${1.4 - 0.4 * ease(f, at(scene, 1, 0.68), 8)})` }}>
        <span style={{ display: 'inline-block', border: `10px solid ${BAD}`, color: BAD, borderRadius: 24, padding: '8px 40px', fontSize: 84, fontWeight: 900 }}>凑不出</span>
      </div>
      <Text x={960} y={330} w={1700} size={90} weight={900} align="center" style={{ ...fadeUp(f, at(scene, 2, 0.05)), opacity: ease(f, at(scene, 2, 0.05), 12) }}>
        哪些数<span style={{ color: C.primary }}>能</span>凑出来？
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: ease(f, at(scene, 2, 0.4), 12), transform: `translateY(${(1 - ease(f, at(scene, 2, 0.4), 12)) * 24}px)` }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={100} y={130} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>题目</Pill>
      <div style={{ position: 'absolute', left: 100, top: 220, width: 1720, background: C.card, borderRadius: 32, padding: '30px 52px', fontSize: 52, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
          在
          <Mark on={at(scene, 1, 0.55)}><Tex tex="1\le n\le 1000" size={56} /></Mark>
          的整数中，有多少个能写成
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 20, whiteSpace: 'nowrap' }}>
          <div style={fadeUp(f, at(scene, 1, 0.9))}><Tex tex={`n=${F1}`} size={66} color={G1} /></div>
          <div style={fadeUp(f, at(scene, 2, 0.38))}><Tex tex={`+${F2}`} size={66} color={G2} /></div>
          <div style={fadeUp(f, at(scene, 2, 0.62))}><Tex tex={`+${F3}`} size={66} color={G3} /></div>
        </div>
        <div style={{ marginTop: 14, fontSize: 44, color: C.muted, ...fadeUp(f, at(scene, 2, 0.8)) }}>
          其中 <Tex tex="x" size={50} /> 是某个实数？
        </div>
      </div>
      <Choices x={170} y={650} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nx0 = 1000, ux = 380, ny = 410; // number line: 3 at nx0, 4 at nx0+ux
  const dotX = nx0 + ux * 0.5;
  return (
    <>
      <Card x={150} y={120} w={1620} h={100} start={at(scene, 0, 0.1)} color={C.primary}>
        <Tex tex="\lfloor\ \rfloor" size={64} />
        <span style={{ fontSize: 50, fontWeight: 800, marginLeft: 24 }}>向下取整 = 把数往<span style={{ color: C.primary }}>下</span>取成整数</span>
      </Card>
      <Parts x={150} y={320} size={64} parts={[[at(scene, 1, 0.08), '\\left\\lfloor \\dfrac72 \\right\\rfloor=3']]} />
      <Parts x={150} y={560} size={64} parts={[[at(scene, 1, 0.65), '\\lfloor 5\\rfloor=5']]} />
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.1), 12)} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
          <line x1={nx0 - 80} y1={ny} x2={nx0 + ux + 80} y2={ny} />
          <line x1={nx0} y1={ny - 20} x2={nx0} y2={ny + 20} />
          <line x1={nx0 + ux} y1={ny - 20} x2={nx0 + ux} y2={ny + 20} />
        </g>
        <circle cx={dotX} cy={ny} r={18} fill={C.violet} opacity={ease(f, at(scene, 1, 0.15), 10)} />
        <g opacity={ease(f, at(scene, 1, 0.4), 14)} stroke={C.primary} strokeWidth={8} fill="none" strokeLinecap="round">
          <path d={`M ${dotX - 12} ${ny + 44} Q ${(dotX + nx0) / 2} ${ny + 130} ${nx0 + 8} ${ny + 56}`} />
          <path d={`M ${nx0 + 6} ${ny + 84} L ${nx0 + 8} ${ny + 56} L ${nx0 + 32} ${ny + 66}`} />
        </g>
      </Stage>
      <Lbl x={nx0} y={ny - 56} tex="3" start={at(scene, 1, 0.1)} />
      <Lbl x={nx0 + ux} y={ny - 56} tex="4" start={at(scene, 1, 0.1)} />
      <Lbl x={dotX} y={ny + 150} tex="\dfrac72" start={at(scene, 1, 0.15)} color={C.violet} />
      <Parts x={150} y={680} size={50} parts={[[at(scene, 2, 0.1), 'x'], [at(scene, 2, 0.1), '\\to'], [at(scene, 2, 0.3), `${F1},\\ ${F2},\\ ${F3}`], [at(scene, 2, 0.6), ['\\to', z('相加')]]]} gap={16} />
      <Tag x={150} y={760} start={at(scene, 2, 0.75)} color={C.primary} size={44}>1 到 1000 中，哪些总和能凑出来？</Tag>
      <Parts x={1050} y={680} size={52} parts={[[at(scene, 3, 0.35), ['x<0\\ \\Rightarrow', z('总和'), '<0'], BAD]]} />
      <Tag x={1050} y={760} start={at(scene, 3, 0.6)} color={C.ink} size={44}>所以从 x = 0 开始看</Tag>
    </>
  );
};

// ---------- pauses ----------

const makePause = (tex: string, rangeTex: string, withChoices: boolean, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={100} y={190} start={4} size={60} tex={tex} />
      <Parts x={100} y={360} size={56} parts={[[6, 'n:\\ ' + rangeTex]]} />
      <Text x={100} y={460} w={1000} size={44} color={C.muted} style={fadeUp(f, 8)}>{withChoices ? '能凑出几个？选一个答案。' : '能凑出几个 n？'}</Text>
      {withChoices && <Choices x={100} y={580} items={CHOICES.map((c) => <Tex key={c} tex={c} size={52} />)} start={() => 10} />}
      <Countdown scene={scene} seconds={seconds} x={1530} y={560} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// ---------- Scene: steps (staircase on [0,1)) ----------

const X1 = ((): Mapper => mk(250, 700, 1100, 150))();
const X1TICKS = [0, 1 / 3, 1 / 2, 2 / 3, 1];
const X1TEX = ['0', '\\dfrac13', '\\dfrac12', '\\dfrac23', '1'];

const Steps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = X1;
  const L = (i: number, t = 0) => at(scene, i, t);
  const partFade = fadeTo(f, L(3, 0), 0.28, 14);
  const hi = (x: number, t: number, c = C.amber) => (
    <rect x={g(x, 0)[0] - 36} y={g(0, 0)[1] + 28} width={72} height={104} rx={14} fill={c} opacity={0.22 * ease(f, t, 10)} />
  );
  return (
    <>
      <Stage>
        <Axes g={g} xmax={1.08} ymax={3.4} xticks={X1TICKS} start={L(0, 0.1)} />
        {hi(1 / 2, L(1, 0.7))}
        {hi(1 / 3, L(2, 0.35))}
        {hi(2 / 3, L(2, 0.7))}
        {/* floor x: grey */}
        <SegList g={g} steps={[[0, 1, 0]]} start={() => L(1, 0.12)} color={G1} w={9} r={10} opacity={partFade} dy={-26} />
        {/* floor 2x: purple */}
        <SegList g={g} steps={[[0, 1 / 2, 0], [1 / 2, 1, 1]]} start={(i) => L(1, 0.5 + i * 0.28)} color={G2} w={9} r={10} opacity={partFade} dy={-13} />
        {/* floor 3x: green */}
        <SegList g={g} steps={[[0, 1 / 3, 0], [1 / 3, 2 / 3, 1], [2 / 3, 1, 2]]} start={(i) => L(2, 0.2 + i * 0.22)} color={G3} w={9} r={10} opacity={partFade} />
        {/* total */}
        <SegList g={g} steps={T1} start={(i) => L(3, 0.25 + i * 0.14)} />
        {T1.slice(1).map(([x0, , v], i) => (
          <Vert key={i} a={g(x0, v - 1)} b={g(x0, v)} start={L(3, 0.3 + (i + 1) * 0.14)} />
        ))}
      </Stage>
      {X1TICKS.map((x, i) => (
        <Lbl key={i} x={g(x, 0)[0]} y={g(0, 0)[1] + 92} tex={X1TEX[i]} start={L(0, 0.2)} />
      ))}
      {[0, 1, 2, 3].map((v) => (
        <Lbl key={v} x={g(0, 0)[0] - 28} y={g(0, v)[1]} tex={String(v)} start={L(0, 0.2)} anchor="right" />
      ))}
      {T1.map(([x0, x1, v], i) => (
        <Lbl key={i} x={g((x0 + x1) / 2, 0)[0]} y={g(0, v)[1] - 52} tex={String(v)} start={L(3, 0.25 + i * 0.14)} pops />
      ))}
      {/* legend */}
      <Parts x={1470} y={190} size={58} parts={[[L(1, 0.12), F1, G1]]} />
      <Parts x={1470} y={280} size={58} parts={[[L(1, 0.5), F2, G2]]} />
      <Parts x={1470} y={370} size={58} parts={[[L(2, 0.2), F3, G3]]} />
      <Parts x={1470} y={470} size={58} parts={[[L(3, 0.2), ['f(x)=', z('总和')], TOT]]} />
      {/* L4: +1 tags */}
      {[1 / 3, 1 / 2, 2 / 3].map((x, i) => (
        <Lbl key={i} x={g(x, 0)[0] + 30} y={g(0, i + 0.5)[1]} tex="+1" start={L(4, 0.1 + i * 0.12)} color={OK} anchor="left" />
      ))}
      <Tag x={1380} y={580} start={L(4, 0.45)} color={OK} size={42}>
        <span style={{ marginRight: 12 }}>&#10003;</span>一个都没漏&hellip;&hellip;暂时
      </Tag>
    </>
  );
};

// ---------- Scene: jump (0..2) ----------

const J = ((): Mapper => mk(250, 760, 550, 50))();
const JTICKS = [0, 1, 2];

const PanelRow: React.FC<{ y: number; bare: string; full: string; color: string; start: number; swap: number; size?: number; opacity?: number }> = ({ y, bare, full, color, start, swap, size = 54, opacity = 1 }) => {
  const f = useCurrentFrame();
  return <Parts x={1430} y={y} size={size} opacity={opacity} parts={[[start, f >= swap ? full : bare, color]]} />;
};

const Jump: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = J;
  const L = (i: number, t = 0) => at(scene, i, t);
  const panelOut = fadeTo(f, L(4, 0), 0, 14);
  // marker slides along the 0..1 staircase, only ever sitting on valid values
  const mp = ease(f, L(0, 0.08), Math.round(scene.lines[0].frames * 0.55));
  const mx = 0.03 + mp * 0.94;
  const mPos = g(mx, fval(mx));
  const mOpacity = ease(f, L(0, 0.05), 6) * (1 - ease(f, L(0, 0.68), 6));
  const flash = (t0: number) => ease(f, L(0, t0), 14);
  const ghost = ease(f, L(3, 0.45), 14);
  return (
    <>
      <Stage>
        <Axes g={g} xmax={2.2} ymax={13.3} xticks={JTICKS} />
        <SegList g={g} steps={T1} start={() => -100} w={11} r={14} />
        {T1.slice(1).map(([x0, , v], i) => <Vert key={i} a={g(x0, v - 1)} b={g(x0, v)} start={-100} />)}
        {/* marker */}
        {mOpacity > 0 && <circle cx={mPos[0]} cy={mPos[1]} r={20} fill={C.amber} opacity={mOpacity} />}
        {/* flash at x = 1 */}
        {[G1, G2, G3].map((c, i) => {
          const e = flash(0.7 + i * 0.04);
          const fo = 1 - ease(f, L(1, 0.2), 10);
          return e > 0 ? <circle key={i} cx={g(1, 0)[0]} cy={g(0, 0)[1]} r={14 + e * (26 + i * 12)} fill="none" stroke={c} strokeWidth={8} opacity={(1 - e * 0.35) * fo} /> : null;
        })}
        {/* the leap 3 -> 6 */}
        <rect x={g(1, 0)[0] - 3} y={g(0, 6)[1]} width={0} height={0} />
        <Vert a={g(1, 3)} b={g(1, 6)} start={L(2, 0.3)} color={BAD} opacity={0.95} w={6} />
        {/* ghost copy of the first staircase on 1..2 */}
        {ghost > 0 && f < L(4, 0.05) + 40 && T1.map(([x0, x1, v], i) => (
          <line key={i} x1={g(x0 + 1, v + 6)[0]} y1={g(0, v + 6)[1]} x2={g(x1 + 1, v + 6)[0]} y2={g(0, v + 6)[1]} stroke={TOT} strokeWidth={11} opacity={0.22 * ghost * (1 - ease(f, L(4, 0.05), 20))} />
        ))}
        {/* second unit, solid */}
        <Seg a={g(1, 6)} b={g(1, 6)} start={L(1, 0.5)} hollow={false} color={TOT} r={15} w={11} />
        <SegList g={g} steps={T2} start={(i) => L(4, 0.05 + i * 0.13)} w={11} r={14} />
        {T2.slice(1).map(([x0, , v], i) => <Vert key={i} a={g(x0, v - 1)} b={g(x0, v)} start={L(4, 0.1 + (i + 1) * 0.13)} />)}
        <Vert a={g(2, 9)} b={g(2, 12)} start={L(4, 0.72)} color={BAD} opacity={0.95} w={6} />
        <Seg a={g(2, 12)} b={g(2.08, 12)} start={L(4, 0.74)} hollow={false} color={TOT} w={11} r={15} dur={8} />
        {/* skipped marks on the y axis */}
        {[[4, L(2, 0.67)], [5, L(2, 0.7)], [10, L(4, 0.82)], [11, L(4, 0.86)]].map(([v, t]) => (
          <g key={v} opacity={ease(f, t, 10)} stroke={BAD} strokeWidth={7} strokeLinecap="round">
            <line x1={g(0, v)[0] - 14} y1={g(0, v)[1] - 14} x2={g(0, v)[0] + 14} y2={g(0, v)[1] + 14} />
            <line x1={g(0, v)[0] + 14} y1={g(0, v)[1] - 14} x2={g(0, v)[0] - 14} y2={g(0, v)[1] + 14} />
          </g>
        ))}
      </Stage>
      {/* axis labels */}
      <Lbl x={g(1, 0)[0]} y={g(0, 0)[1] + 52} tex="1" start={-100} />
      <Lbl x={g(2, 0)[0]} y={g(0, 0)[1] + 52} tex="2" start={-100} />
      <Lbl x={g(0, 0)[0] - 28} y={g(0, 0)[1]} tex="0" start={-100} anchor="right" />
      <Lbl x={g(0, 3)[0] - 28} y={g(0, 3)[1]} tex="3" start={-100} anchor="right" />
      <Lbl x={g(0, 6)[0] - 28} y={g(0, 6)[1]} tex="6" start={L(1, 0.6)} anchor="right" />
      <Lbl x={g(0, 9)[0] - 28} y={g(0, 9)[1]} tex="9" start={L(4, 0.5)} anchor="right" />
      <Lbl x={g(0, 12)[0] - 28} y={g(0, 12)[1]} tex="12" start={L(4, 0.72)} anchor="right" />
      {[[4, L(2, 0.67)], [5, L(2, 0.7)], [10, L(4, 0.82)], [11, L(4, 0.86)]].map(([v, t]) => (
        <Lbl key={v} x={g(0, v)[0] - 28} y={g(0, v)[1]} tex={String(v)} start={t} anchor="right" color={BAD} />
      ))}
      {T2.map(([x0, x1, v], i) => (
        <Lbl key={v} x={g((x0 + x1) / 2, 0)[0]} y={g(0, v)[1] - 40} tex={String(v)} start={L(4, 0.08 + i * 0.13)} pops />
      ))}
      <Tag x={g(0, 0)[0] + 40} y={g(0, 4.5)[1] - 28} start={L(2, 0.74)} color={BAD} size={46}>跳过了！</Tag>
      <Lbl x={g(1, 0)[0] + 28} y={g(0, 4.5)[1]} tex="+3" start={L(2, 0.5)} anchor="left" color={BAD} size={56} />
      {/* right panel */}
      <PanelRow y={160} bare={F1} full={`${F1}=1`} color={G1} start={L(0, 0.78)} swap={L(1, 0.18)} opacity={panelOut} />
      <PanelRow y={240} bare={F2} full={`${F2}=2`} color={G2} start={L(0, 0.82)} swap={L(1, 0.4)} opacity={panelOut} />
      <PanelRow y={320} bare={F3} full={`${F3}=3`} color={G3} start={L(0, 0.86)} swap={L(1, 0.62)} opacity={panelOut} />
      <Parts x={1430} y={410} size={56} opacity={panelOut} parts={[[L(1, 0.84), '1+2+3=6', TOT]]} />
      <Tag x={1430} y={110} start={L(0, 0.78)} color={C.amber} size={42} opacity={panelOut}>x = 1 时</Tag>
      <Eq x={1360} y={520} size={48} start={L(3, 0.15)} tex="f(x+1)=f(x)+6" opacity={panelOut} />
      <Parts x={1360} y={610} size={50} opacity={panelOut} parts={[[L(3, 0.1), '+1', G1], [L(3, 0.1), '+2', G2], [L(3, 0.1), '+3', G3]]} gap={36} />
      <Strip x={1380} y={560} n={6} good={[0, 1, 2, 3]} start={L(5, 0.2)} label="\div 6" labelStart={L(5, 0.15)} />
    </>
  );
};

// ---------- Scene: count ----------

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const stripY = 150 + (560 - 150) * (1 - ease(f, 0, 22));
  const cards: { x: number; w: number; tex: string; chip4: string; chip5: string }[] = [
    { x: 150, w: 270, tex: '1\\!-\\!6', chip4: '4', chip5: '5' },
    { x: 450, w: 300, tex: '7\\!-\\!12', chip4: '10', chip5: '11' },
    { x: 780, w: 110, tex: '\\cdots', chip4: '\\cdots', chip5: '\\cdots' },
    { x: 920, w: 360, tex: '991\\!-\\!996', chip4: '994', chip5: '995' },
  ];
  return (
    <>
      <Parts x={150} y={235} size={66} parts={[[L(0, 0.35), '1000=6\\times166+4']]} />
      <Strip x={1380} y={stripY} n={6} good={[0, 1, 2, 3]} start={-100} label="\div 6" labelStart={-100} />
      {cards.map((c, i) => (
        <div key={i}>
          <Card x={c.x} y={330} w={c.w} h={90} start={L(1, 0.12 + i * 0.1)}>
            <Tex tex={c.tex} size={52} />
          </Card>
          <Card x={c.x} y={435} w={c.w} h={62} start={L(1, 0.3 + i * 0.1)} fill="rgba(239,67,67,0.14)" color={BAD}>
            <Tex tex={c.chip4} size={50} color={BAD} />
          </Card>
          <Card x={c.x} y={510} w={c.w} h={62} start={L(3, 0.2 + i * 0.1)} fill="rgba(239,67,67,0.14)" color={BAD}>
            <Tex tex={c.chip5} size={50} color={BAD} />
          </Card>
        </div>
      ))}
      <Card x={1310} y={330} w={250} h={90} start={L(2, 0.2)} fill="rgba(239,67,67,0.14)" color={BAD}>
        <Tex tex="1000" size={56} color={BAD} />
      </Card>
      <Stage>
        <path d="M 150 595 L 150 615 L 1280 615 L 1280 595" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(f, L(1, 0.78), 14)} />
      </Stage>
      <Tag x={565} y={628} start={L(1, 0.8)} color={C.ink} size={44}>166 组</Tag>
      <Parts x={1310} y={440} size={56} opacity={fadeTo(f, L(2, 0.2), 0, 10)} parts={[[L(1, 0.85), '166', BAD]]} />
      <Parts x={1310} y={440} size={56} opacity={ease(f, L(2, 0.25), 10)} parts={[[L(2, 0.35), '166+1=167', BAD]]} />
      <Parts x={1310} y={530} size={56} parts={[[L(3, 0.7), '166', BAD]]} />
      <Parts x={150} y={720} size={68} parts={[[L(4, 0.3), '167+166=333']]} />
      <Pill x={820} y={728} color={BAD} style={{ ...fadeUp(f, L(4, 0.6)), fontSize: 42 }}>凑不出</Pill>
    </>
  );
};

// ---------- Scene: reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const land = at(scene, 0, 0.58);
  const s = Math.min(1.15, pop(f, land, 30));
  return (
    <>
      <Parts x={150} y={300} size={110} parts={[[4, '1000-333=']]} />
      <div style={{ position: 'absolute', left: 1000, top: 250, fontSize: 190, fontWeight: 900, color: OK, transform: `scale(${s}) translateY(-30px)`, transformOrigin: 'left center', opacity: ease(f, land, 6) }}>667</div>
      <Answer x={960} y={650} value="A" start={at(scene, 0, 0.92)} chime={CHIME} />
      
    </>
  );
};

// ---------- Scene: rows ----------

const Rows: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const cw = 130, ch = 66, gx = 150, gap = 8;
  const rowY = [190, 265, 340, 415];
  const lastFullY = 540, shortY = 625;
  const good = [0, 1, 2, 5]; // columns 1,2,3,6
  const cell = (r: number, c: number, y: number, start: number, mode: 'neutral' | 'color', n: number) => {
    const isGood = good.includes(c);
    const colored = mode === 'color';
    return (
      <div key={`${r}-${c}`} style={{ position: 'absolute', left: gx + c * (cw + gap), top: y, width: cw, height: ch, boxSizing: 'border-box', borderRadius: 14, background: colored ? (isGood ? 'rgba(33,196,93,0.2)' : 'rgba(239,67,67,0.16)') : C.card, border: `4px solid ${colored ? (isGood ? OK : BAD) : C.line}`, fontSize: 48, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colored && !isGood ? BAD : C.ink, ...fadeUp(f, start, 10) }}>
        {n}
        {colored && !isGood && <svg width={cw} height={ch} style={{ position: 'absolute', left: -4, top: -4 }}><line x1={14} y1={ch - 10} x2={cw - 14} y2={10} stroke={BAD} strokeWidth={5} strokeLinecap="round" /></svg>}
      </div>
    );
  };
  const out = fadeTo(f, L(1, 0), 0, 10);
  return (
    <>
      <Text x={950} y={118} w={900} size={52} weight={900} color={C.primary} align="center" style={{ ...fadeUp(f, L(0, 0.2)), opacity: ease(f, L(0, 0.2), 12) * out }}>数一数能凑出的数</Text>
      {rowY.map((y, r) => Array.from({ length: 6 }, (_, c) => cell(r, c, y, L(1, 0.05 + r * 0.12), 'color', 6 * r + c + 1)))}
      <Tag x={1070} y={190} start={L(1, 0.6)} color={C.ink} size={44}>每行 <span style={{ color: OK }}>4 &#10003;</span>  <span style={{ color: BAD }}>2 &#10007;</span></Tag>
      <Text x={470} y={478} w={200} size={56} weight={900} color={C.muted} align="center" style={fadeUp(f, L(2, 0.05))}>&#8942;</Text>
      {Array.from({ length: 6 }, (_, c) => cell(165, c, lastFullY, L(2, 0.15), 'color', 996 - 5 + c))}
      <Stage>
        <path d={`M ${gx + 6 * (cw + gap) + 14} ${rowY[0]} L ${gx + 6 * (cw + gap) + 34} ${rowY[0]} L ${gx + 6 * (cw + gap) + 34} ${lastFullY + ch} L ${gx + 6 * (cw + gap) + 14} ${lastFullY + ch}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(f, L(2, 0.5), 14)} />
      </Stage>
      <Tag x={1070} y={330} start={L(2, 0.55)} color={C.ink} size={44}>166 行</Tag>
      <Parts x={1070} y={400} size={56} parts={[[L(2, 0.6), '6\\times166=996']]} />
      <Parts x={1070} y={500} size={56} parts={[[L(3, 0.45), '166\\times4=664', OK]]} />
      {[0, 1, 2, 3].map((c) => cell(166, c, shortY, L(4, 0.35 + c * 0.1), f >= L(5, 0.1) ? 'color' : 'neutral', 997 + c))}
      {[0, 1, 2, 3].map((c) => (
        <Tag key={c} x={gx + c * (cw + gap) + 30} y={shortY + 70} start={L(5, 0.3 + c * 0.08)} color={c < 3 ? OK : BAD} size={36}>余 {c + 1}</Tag>
      ))}
      <Parts x={1070} y={625} size={60} parts={[[L(6, 0.3), '664+3=667', OK]]} />
      <Pill x={1540} y={635} color={OK} style={{ ...fadeUp(f, L(6, 0.7)), fontSize: 38 }}>答案一样！</Pill>
      <Text x={1070} y={730} w={780} size={40} weight={800} color={C.muted} style={fadeUp(f, L(7, 0.35))}>适用：结尾比较麻烦的时候</Text>
    </>
  );
};

// ---------- Scene: traps ----------

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const traps: { letter: string; val: string; tex: string; note: string }[] = [
    { letter: 'B', val: '668', tex: '1000-2\\times166=668', note: '忘了 1000 也凑不出' },
    { letter: 'C', val: '670', tex: '1000-2\\times165=670', note: '数到 990 就停了' },
    { letter: 'D', val: '750', tex: '1000\\times3\\div4=750', note: '不是 4 跳 1，是 6 跳 2' },
    { letter: 'E', val: '834', tex: '1000-166=834', note: '每组只跳过 1 个' },
  ];
  return (
    <>
      <Pill x={560} y={48} color={BAD} style={{ ...fadeUp(f, L(0, 0.3)), fontSize: 32, padding: '6px 24px' }}>错误答案 = 陷阱</Pill>
      {traps.map((t, i) => (
        <div key={i}>
          <Card x={100} y={130 + i * 138} w={1720} h={122} start={L(i + 1, 0.15)} fill="rgba(239,67,67,0.09)" color={BAD}>
            <div style={{ position: 'absolute', left: 30, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 52, fontWeight: 900, color: BAD }}>{t.letter} · {t.val}</div>
            <div style={{ position: 'absolute', left: 400, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}><Tex tex={t.tex} size={54} /></div>
            <div style={{ position: 'absolute', left: 1130, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 40, fontWeight: 800, color: BAD }}>{t.note}</div>
          </Card>
        </div>
      ))}
      <Card x={100} y={700} w={1720} h={110} start={L(5, 0.25)} fill={C.primarySoft} color={C.primary}>
        <span style={{ fontSize: 48, fontWeight: 900 }}>好习惯：注意大的跳跃，最后一个数单独检查。</span>
      </Card>
    </>
  );
};

// ---------- Scene: variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={100} y={140} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.2)), fontSize: 44 }}>轮到你了！</Pill>
      <div style={{ position: 'absolute', left: 100, top: 260, ...fadeUp(f, at(scene, 1, 0.1)), whiteSpace: 'nowrap' }}>
        <Tex tex={`n=${F1}+${F2}+`} size={84} />
        <span style={{ background: 'rgba(60,131,246,0.16)', borderRadius: 14, padding: '0 10px' }}><Tex tex={F4} size={84} color={G4} /></span>
      </div>
      <Parts x={100} y={480} size={76} parts={[[at(scene, 2, 0.1), '1\\le n\\le 100']]} />
      <Tag x={100} y={620} start={at(scene, 2, 0.5)} color={C.primary} size={64}>有多少个？</Tag>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const V = ((): Mapper => mk(250, 690, 1100, 75))();
const V4: S3[] = [[0, 1 / 4, 0], [1 / 4, 1 / 2, 1], [1 / 2, 3 / 4, 3], [3 / 4, 1, 4]];

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = V;
  const L = (i: number, t = 0) => at(scene, i, t);
  const out = fadeTo(f, L(4, 0), 0, 14);
  const cs = [L(0, 0.2), L(0, 0.6), L(1, 0.5), L(2, 0.2)];
  return (
    <>
      <Stage>
        <Axes g={g} xmax={1.08} ymax={7.4} xticks={[0, 0.25, 0.5, 0.75, 1]} start={L(0, 0.05)} opacity={out} />
        <g opacity={out}>
          <Seg a={g(0, 0)} b={g(0.25, 0)} start={cs[0]} color={TOT} w={12} r={15} />
          <Seg a={g(0.25, 1)} b={g(0.5, 1)} start={cs[1]} color={TOT} w={12} r={15} />
          <Seg a={g(0.5, 3)} b={g(0.75, 3)} start={L(1, 0.55)} color={TOT} w={12} r={15} />
          <Seg a={g(0.75, 4)} b={g(1, 4)} start={L(2, 0.1)} color={TOT} w={12} r={15} />
          <Seg a={g(1, 7)} b={g(1.07, 7)} start={L(2, 0.74)} color={TOT} w={12} r={15} hollow={false} dur={8} />
          <Vert a={g(0.25, 0)} b={g(0.25, 1)} start={cs[1]} />
          <Vert a={g(0.5, 1)} b={g(0.5, 3)} start={L(1, 0.5)} color={BAD} opacity={0.95} w={6} />
          <Vert a={g(0.75, 3)} b={g(0.75, 4)} start={L(2, 0.1)} />
          <Vert a={g(1, 4)} b={g(1, 7)} start={L(2, 0.7)} color={BAD} opacity={0.95} w={6} />
          {[2, 5, 6].map((v, i) => (
            <g key={v} opacity={ease(f, v === 2 ? L(1, 0.8) : L(2, 0.72 + i * 0.08), 10)} stroke={BAD} strokeWidth={7} strokeLinecap="round">
              <line x1={g(0, v)[0] - 14} y1={g(0, v)[1] - 14} x2={g(0, v)[0] + 14} y2={g(0, v)[1] + 14} />
              <line x1={g(0, v)[0] + 14} y1={g(0, v)[1] - 14} x2={g(0, v)[0] - 14} y2={g(0, v)[1] + 14} />
            </g>
          ))}
        </g>
      </Stage>
      <div style={{ opacity: out }}>
        {[0, 0.25, 0.5, 0.75, 1].map((x, i) => (
          <Lbl key={i} x={g(x, 0)[0]} y={g(0, 0)[1] + 92} tex={['0', '\\dfrac14', '\\dfrac12', '\\dfrac34', '1'][i]} start={L(0, 0.1)} />
        ))}
        <Lbl x={g(0, 0)[0] - 28} y={g(0, 0)[1]} tex="0" start={L(0, 0.1)} anchor="right" />
        <Lbl x={g(0, 1)[0] - 28} y={g(0, 1)[1]} tex="1" start={L(0, 0.5)} anchor="right" />
        <Lbl x={g(0, 2)[0] - 28} y={g(0, 2)[1]} tex="2" start={L(1, 0.8)} anchor="right" color={BAD} />
        <Lbl x={g(0, 3)[0] - 28} y={g(0, 3)[1]} tex="3" start={L(1, 0.55)} anchor="right" />
        <Lbl x={g(0, 4)[0] - 28} y={g(0, 4)[1]} tex="4" start={L(2, 0.1)} anchor="right" />
        <Lbl x={g(0, 5)[0] - 28} y={g(0, 5)[1]} tex="5" start={L(2, 0.8)} anchor="right" color={BAD} />
        <Lbl x={g(0, 6)[0] - 28} y={g(0, 6)[1]} tex="6" start={L(2, 0.88)} anchor="right" color={BAD} />
        <Lbl x={g(0, 7)[0] - 28} y={g(0, 7)[1]} tex="7" start={L(2, 0.74)} anchor="right" />
        {[[0, 0.25, 0, cs[0]], [0.25, 0.5, 1, cs[1]], [0.5, 0.75, 3, L(1, 0.55)], [0.75, 1, 4, L(2, 0.1)]].map(([x0, x1, v, t], i) => (
          <Lbl key={i} x={g((x0 + x1) / 2, 0)[0]} y={g(0, v)[1] - 48} tex={String(v)} start={t} pops />
        ))}
        <Lbl x={g(0.5, 0)[0] + 34} y={g(0, 2)[1]} tex="+2" start={L(1, 0.35)} color={BAD} size={56} anchor="left" />
        <Lbl x={g(1, 0)[0] + 40} y={g(0, 5.5)[1]} tex="+3" start={L(2, 0.74)} color={BAD} size={56} anchor="left" />
        {/* L1: the two floors that step together */}
        <Parts x={1450} y={190} size={58} opacity={fadeTo(f, L(2, 0), 0, 10)} parts={[[L(1, 0.3), F2, G2]]} />
        <Parts x={1450} y={270} size={58} opacity={fadeTo(f, L(2, 0), 0, 10)} parts={[[L(1, 0.3), F4, G4]]} />
        <Tag x={1450} y={110} start={L(1, 0.3)} color={BAD} size={40} opacity={fadeTo(f, L(2, 0), 0, 10)}>在 1/2 处同时升一级</Tag>
      </div>
      <Parts x={1450} y={605} size={56} opacity={fadeTo(f, L(4, 0), 0, 10)} parts={[[L(3, 0.08), '1+2+4=7', TOT]]} />
      <Strip x={1390} y={430} n={7} good={[0, 1, 3, 4]} start={L(3, 0.2)} cell={64} gap={6} label="\div 7" labelStart={L(3, 0.15)} />
      <Parts x={150} y={250} size={68} parts={[[L(4, 0.1), '100=7\\times14+2']]} />
      <Parts x={150} y={380} size={68} parts={[[L(4, 0.5), '14\\times4=56']]} />
      <Card x={150} y={540} w={330} h={110} start={L(5, 0.12)} fill="rgba(33,196,93,0.18)" color={OK}>
        <span style={{ fontSize: 54, fontWeight: 900 }}>99</span>
        <span style={{ fontSize: 36, fontWeight: 800, color: OK, marginLeft: 22 }}>余 1</span>
      </Card>
      <Card x={540} y={540} w={380} h={110} start={L(5, 0.55)} fill="rgba(239,67,67,0.14)" color={BAD}>
        <span style={{ fontSize: 54, fontWeight: 900, color: BAD }}>100</span>
        <span style={{ fontSize: 36, fontWeight: 800, color: BAD, marginLeft: 22 }}>余 2</span>
      </Card>
      <Parts x={150} y={710} size={72} parts={[[L(6, 0.4), '56+1=57', OK]]} />
      <Answer x={1560} y={720} value="57" start={L(6, 0.88)} chime={CHIME} />
    </>
  );
};

// ---------- Scene: recap ----------

const RG = ((): Mapper => mk(300, 720, 420, 42))();

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = RG;
  const L = (i: number, t = 0) => at(scene, i, t);
  const gOut = fadeTo(f, L(1, 0.02), 0, 12);
  return (
    <>
      <div style={{ opacity: gOut }}>
        <Stage>
          <Axes g={g} xmax={2.2} ymax={12.6} xticks={[0, 1, 2]} start={4} />
          <SegList g={g} steps={[...T1, ...T2]} start={(i) => L(0, 0.05 + i * 0.07)} w={10} r={12} dur={10} />
          <Vert a={g(1, 3)} b={g(1, 6)} start={L(0, 0.55)} color={BAD} opacity={0.95} w={8} />
        </Stage>
        <Lbl x={g(1, 0)[0] + 30} y={g(0, 4.5)[1]} tex="+3" start={L(0, 0.55)} color={BAD} size={84} anchor="left" />
      </div>
      <Text x={1280} y={260} w={580} size={54} weight={900} style={{ ...fadeUp(f, L(0, 0.5)), opacity: ease(f, L(0, 0.5), 12) * gOut }}>
        跳得比 1 多，就会<span style={{ color: BAD }}>漏掉</span>数
      </Text>
      <Strip x={558} y={300} n={6} good={[0, 1, 2, 3]} start={L(1, 0.1)} cell={120} gap={14} />
      <Tag x={560} y={470} start={L(1, 0.5)} color={C.ink} size={60}>每 6 个一循环</Tag>
      <Tag x={560} y={580} start={L(1, 0.65)} color={BAD} size={54}>跳过：余数 4 和 5</Tag>
      <SignOff start={at(scene, 2, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(`n=${F1}+${F2}+${F3}`, '1\\le n\\le 1000', true, 10),
  steps: Steps,
  jump: Jump,
  count: Count,
  reveal: Reveal,
  rows: Rows,
  traps: Traps,
  variant: Variant,
  try2: makePause(`n=${F1}+${F2}+${F4}`, '1\\le n\\le 100', false, 10),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the three floors stacked, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 练习" lines={[<span style={{ fontFamily: ZH_FONT }}>你觉得是</span>, <span style={{ color: C.red, fontFamily: ZH_FONT }}>668？</span>]}>
    <div style={{ background: C.card, borderRadius: 40, padding: '30px 50px', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 900 }}>
      <Tex tex={`n=${F1}`} size={110} color={G1} />
      <Tex tex={`+${F2}`} size={110} color={G2} />
      <Tex tex={`+${F3}`} size={110} color={G3} />
    </div>
  </ThumbFrame>
);

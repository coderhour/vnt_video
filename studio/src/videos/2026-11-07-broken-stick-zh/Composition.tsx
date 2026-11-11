import { Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { ZH_FONT } from '../../lib/fonts';
import { Stage, type Pt } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Choices, Confetti, Mark, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-07-broken-stick-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- mixed maths + hanzi (hanzi never go inside KaTeX, whose \text font is serif) ----------
type Part = string | { z: string; c?: string };
const Z: React.FC<{ p: Part[] | string; size: number; color?: string }> = ({ p, size, color = C.ink }) =>
  typeof p === 'string' ? (
    <Tex tex={p} size={size} color={color} />
  ) : (
    <span style={{ whiteSpace: 'nowrap', color, display: 'inline-flex', alignItems: 'center' }}>
      {p.map((x, i) =>
        typeof x === 'string' ? (
          <Tex key={i} tex={x} size={size} color={color} />
        ) : (
          <span key={i} style={{ fontFamily: ZH_FONT, fontSize: size * 0.9, fontWeight: 800, color: x.c ?? color, margin: '0 0.12em' }}>{x.z}</span>
        ),
      )}
    </span>
  );
const z = (t: string, c?: string): Part => ({ z: t, c });

export const COL = ['#0cc281', '#7b61ff', '#f59e0b']; // left, middle, right
const GREEN_SOFT = 'rgba(33, 196, 93, 0.35)';
const GREY = '#9aa3b5';

// ---------- geometry (maths coordinates, y up; all verified in verify.py) ----------
export const V1: Pt = [0, 0];
export const V2: Pt = [0, 60];
export const V3: Pt = [60, 60];
const M12: Pt = [0, 30];
const M23: Pt = [30, 60];
const M13: Pt = [30, 30];
export const P: Pt = [20, 40];
export const A: Pt = [15, 30];
export const B: Pt = [12, 36];
export const SLICES: Pt[][] = [[P, V1, M12], [P, M12, V2], [P, V2, M23], [P, M23, V3], [P, V3, M13], [P, M13, V1]];
export const HEX: Pt[] = [A, B, [15, 45], [24, 48], [30, 45], [24, 36]];
export const WIN: Pt[][] = HEX.map((h, i) => [P, h, HEX[(i + 1) % 6]]);

type M = (x: number, y: number) => Pt;
const mapM: M = (x, y) => [200 + 9.5 * x, 725 - 9.5 * y];
const zoomM: M = (x, y) => [300 + 16 * x, 795 - 16 * y];
const areaM: M = (x, y) => [240 + (x - 10) * 40, 800 - (y - 28) * 40];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const tp = (ps: Pt[], m: M): Pt[] => ps.map((p) => m(p[0], p[1]));
export const pathOf = (ps: Pt[]) => `M ${ps.map((p) => p.join(' ')).join(' L ')} Z`;
export const centroid = (ps: Pt[]): Pt => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
export const pieces = (x: number, y: number) => {
  const a = Math.min(x, y), b = Math.max(x, y);
  return [a, b - a, 60 - b];
};
export const win = (x: number, y: number) => {
  const p = pieces(x, y);
  return Math.max(...p) < 2 * Math.min(...p);
};
/** Fold a point over the diagonal y = x: t = 0 original, t = 1 mirror image (it passes through the diagonal). */
export const flipPt = (p: Pt, t: number): Pt => {
  const s = (p[0] + p[1]) / 2, d = (p[0] - p[1]) / 2, k = Math.cos(Math.PI * t);
  return [s + d * k, s - d * k];
};
const track = (f: number, segs: [number, number, Pt, Pt][], start: Pt): Pt => {
  let p = start;
  for (const [t0, t1, a, b] of segs) {
    if (f <= t0) break;
    p = lerpPt(a, b, interpolate(f, [t0, t1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) }));
    if (f < t1) break;
  }
  return p;
};
/** Value of the last step whose start frame has been reached. */
const steps = <T,>(f: number, starts: number[], vals: T[]): T => {
  let v = vals[0];
  starts.forEach((s, i) => {
    if (f >= s) v = vals[i];
  });
  return v;
};

// ---------- text / maths helpers ----------
const Parts: React.FC<{ x: number; y: number; parts: [number, string | Part[], string?][]; size?: number; opacity?: number; center?: boolean; gap?: number }> = ({
  x, y, parts, size = 54, opacity = 1, center = false, gap = 12,
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
const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; opacity?: number }> = ({ x, y, start, color, children, size = 42, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return <div style={{ position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>{children}</div>;
};
const Lbl: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 52, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12) * opacity;
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: p, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

// ---------- svg helpers ----------
export const Pg: React.FC<{ pts: Pt[]; fill?: string; fo?: number; stroke?: string; sw?: number; op?: number; dash?: string }> = ({ pts, fill = 'none', fo = 1, stroke = 'none', sw = 5, op = 1, dash }) =>
  op <= 0 ? null : <path d={pathOf(pts)} fill={fill} fillOpacity={fo} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeDasharray={dash} opacity={op} />;
export const Ln: React.FC<{ a: Pt; b: Pt; color?: string; sw?: number; op?: number; dash?: string; prog?: number }> = ({ a, b, color = C.ink, sw = 4, op = 1, dash, prog = 1 }) => {
  if (op <= 0 || prog <= 0) return null;
  const e = lerpPt(a, b, prog);
  return <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash} opacity={op} />;
};
export const T: React.FC<{ x: number; y: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; op?: number; halo?: boolean; children: React.ReactNode }> = ({
  x, y, size = 44, fill = C.ink, anchor = 'middle', weight = 900, op = 1, halo = true, children,
}) =>
  op <= 0 ? null : (
    <text x={x} y={y} fontFamily={ZH_FONT} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} dominantBaseline="middle" opacity={op} stroke={halo ? C.bg : 'none'} strokeWidth={halo ? 8 : 0} paintOrder="stroke">
      {children}
    </text>
  );
export const Dot: React.FC<{ p: Pt; r?: number; color?: string; op?: number }> = ({ p, r = 14, color = C.ink, op = 1 }) =>
  op <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill={color} stroke="#fff" strokeWidth={4} opacity={op} />;
const Ring: React.FC<{ p: Pt; op: number; color?: string }> = ({ p, op, color = C.green }) =>
  op <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={18} fill="none" stroke={color} strokeWidth={7} opacity={op} />;

export const Verdict: React.FC<{ x: number; y: number; ok: boolean; op: number }> = ({ x, y, ok, op }) =>
  op <= 0 ? null : (
    <g opacity={op}>
      <circle cx={x} cy={y} r={27} fill={ok ? C.green : C.red} />
      {ok ? (
        <path d={`M ${x - 12} ${y + 1} L ${x - 3} ${y + 10} L ${x + 13} ${y - 10}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={`M ${x - 11} ${y - 11} L ${x + 11} ${y + 11} M ${x + 11} ${y - 11} L ${x - 11} ${y + 11}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );

const Cross: React.FC<{ x: number; y: number; start: number; children: React.ReactNode }> = ({ x, y, start, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, start) }}>
      <svg width={54} height={54} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={27} fill={C.red} />
        <path d="M17 17 L37 37 M37 17 L17 37" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
      </svg>
      {children}
    </div>
  );
};
const Okay: React.FC<{ x: number; y: number; start: number; children: React.ReactNode }> = ({ x, y, start, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, start) }}>
      <svg width={54} height={54} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={27} fill={C.green} />
        <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  );
};

/** Wide green answer pill ("C · 1/10") with the chime. */
const AnswerPill: React.FC<{ x: number; y: number; start: number; children: React.ReactNode }> = ({ x, y, start, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, background: C.green, color: '#fff', borderRadius: 999, padding: '14px 54px', fontSize: 72, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {children}
        </div>
      )}
    </>
  );
};

// ---------- the stick ----------
export const Stick: React.FC<{
  x0: number; y: number; w: number; a: number; b: number; total?: number; h?: number; gap?: number; opacity?: number; neutral?: number;
  hl?: number[]; labels?: React.ReactNode[]; lsize?: number; ruler?: number[]; rulerOp?: number;
}> = ({ x0, y, w, a, b, total = 60, h = 52, gap = 0, opacity = 1, neutral = 0, hl = [], labels = [], lsize = 50, ruler, rulerOp = 1 }) => {
  if (opacity <= 0) return null;
  const s = w / total;
  const bounds = [0, a, b, total];
  return (
    <div style={{ opacity }}>
      <Stage>
        {[0, 1, 2].map((i) => {
          const px = x0 + bounds[i] * s + (i - 1) * gap;
          const pw = (bounds[i + 1] - bounds[i]) * s;
          return (
            <g key={i}>
              <rect x={px + 1} y={y} width={Math.max(0, pw - 2)} height={h} rx={10} fill={GREY} opacity={neutral} />
              <rect x={px + 1} y={y} width={Math.max(0, pw - 2)} height={h} rx={10} fill={COL[i]} opacity={1 - neutral} stroke={C.ink} strokeWidth={hl.includes(i) ? 8 : 0} />
            </g>
          );
        })}
        {ruler && (
          <g opacity={rulerOp}>
            <line x1={x0} y1={y + h + 14} x2={x0 + w} y2={y + h + 14} stroke={C.muted} strokeWidth={4} />
            {ruler.map((n) => (
              <g key={n}>
                <line x1={x0 + n * s} y1={y + h + 14} x2={x0 + n * s} y2={y + h + 28} stroke={C.muted} strokeWidth={4} />
                <T x={x0 + n * s} y={y + h + 54} size={36} fill={C.muted} weight={800} halo={false}>{n}</T>
              </g>
            ))}
          </g>
        )}
      </Stage>
      {labels.map((l, i) =>
        l === null || l === undefined ? null : (
          <div key={i} style={{ position: 'absolute', left: x0 + ((bounds[i] + bounds[i + 1]) / 2) * s + (i - 1) * gap, top: y - 10, transform: 'translate(-50%, -100%)', fontSize: lsize, fontWeight: 900, color: COL[i], whiteSpace: 'nowrap' }}>
            {l}
          </div>
        ),
      )}
    </div>
  );
};
const nums = (a: number, b: number, total = 60) => [Math.round(a), Math.round(b - a), Math.round(total - b)].map(String);

// ---------- the map ----------
const Axes: React.FC<{ op?: number; titles?: number; ticks?: number; yticks?: number }> = ({ op = 1, titles = 1, ticks = 1, yticks = 1 }) => {
  const sq = tp([V1, [60, 0], V3, V2], mapM);
  return (
    <Stage>
      <g opacity={op}>
        <Pg pts={sq} stroke={C.ink} sw={5} />
        <g opacity={ticks}>
          {[0, 20, 40, 60].map((n) => (
            <g key={n}>
              <T x={mapM(n, 0)[0]} y={766} size={38} fill={C.muted} weight={800} halo={false}>{n}</T>
              <T x={176} y={mapM(0, n)[1]} size={38} fill={C.muted} weight={800} anchor="end" halo={false} op={yticks}>{n}</T>
            </g>
          ))}
        </g>
        <g opacity={titles}>
          <T x={mapM(30, 0)[0]} y={812} size={42} fill={C.ink} weight={800} halo={false}>第一刀 x</T>
          <text transform={`translate(96 ${mapM(0, 30)[1]}) rotate(-90)`} fontFamily={ZH_FONT} fontSize={42} fontWeight={800} fill={C.ink} textAnchor="middle">第二刀 y</text>
        </g>
      </g>
    </Stage>
  );
};

const RIGHT_STICK = { x0: 960, y: 250, w: 840 };

// ---------- Scene: intro ----------
const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const snap = at(scene, 0, 0.5);
  const l1 = at(scene, 1, 0.25);
  const l2 = at(scene, 2, 0.02);
  const s2 = ease(f, l2, 26);
  const gap = ease(f, snap, 16) * 18 * (1 - s2);
  const x0 = lerp(360, 1400, s2), w = lerp(1200, 340, s2), y = lerp(440, 200, s2);
  const hlOn = f >= l1 && f < l2;
  const lab = (t: string, i: number) => (hlOn ? <span key={i}>{t}</span> : null);
  const sq = tp([V1, [60, 0], V3, V2], (px, py) => [700 + px * 9.2, 830 - py * 9.2]);
  return (
    <>
      <Stage>
        <Pg pts={sq} stroke={C.muted} sw={5} dash="14 12" op={ease(f, l2 + 10, 20) * 0.6} />
        <Dot p={[700 + 14 * 9.2, 830 - 41 * 9.2]} r={16} op={ease(f, l2 + 40, 10)} />
      </Stage>
      <Stick x0={x0} y={y} w={w} a={12} b={44} gap={gap} neutral={1 - ease(f, snap, 8)} hl={hlOn ? [0, 1] : []} labels={[lab('最短', 0), lab('最长', 1), null]} lsize={46} opacity={fadeTo(f, 0, 1)} />
      <Eq x={0} y={640} center start={at(scene, 1, 0.55)} size={68} opacity={fadeTo(f, l2, 0, 12)} tex={[z('最长'), '<2\\times', z('最短'), '?']} />
    </>
  );
};

// ---------- Scene: question ----------
const PROMPT = '在一根木棍上独立、均匀地随机选两个点，把木棍切成三段。';
const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c = (i: number) => at(scene, 2, 0.12 + 0.13 * i);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 140, width: 1720, height: 400, background: C.card, borderRadius: 36, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) }} />
      <Text x={150} y={160} w={600} size={42} color={C.primary} weight={900} style={fadeUp(f, 4)}>题目</Text>
      <Text x={150} y={225} w={1640} size={48} weight={700} style={{ ...fadeUp(f, 8), lineHeight: 1.4 }}>
        {PROMPT}
        <Mark on={at(scene, 1, 0.4)}>最长的一段比最短一段的2倍还短</Mark>，这件事的概率是多少？
      </Text>
      <Stick x0={360} y={600} w={1200} a={15} b={40} opacity={ease(f, at(scene, 0, 0.55), 14)} />
      <Choices x={400} y={720} start={c} items={['\\dfrac1{20}', '\\dfrac1{12}', '\\dfrac1{10}', '\\dfrac16', '\\dfrac14'].map((t) => <Tex key={t} tex={t} size={56} />)} />
    </>
  );
};

// ---------- Scene: asked ----------
const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0);
  let cut: [number, number];
  if (f < l1) cut = [20, 40];
  else if (f < l2) cut = [16, 36];
  else cut = [10, 30];
  const showLab = f >= l1;
  const [a, b] = cut;
  const L = nums(a, b);
  const SX = 360, SW = 1200, SY = 300;
  return (
    <>
      <Stick x0={SX} y={SY} w={SW} a={a} b={b} ruler={[0, 10, 20, 30, 40, 50, 60]} rulerOp={ease(f, at(scene, 0, 0.3), 14)} labels={showLab ? L : []} lsize={54} />
      <Stage>
        <Verdict x={SX + SW + 60} y={SY + 26} ok={win(a, b)} op={f >= l1 ? 1 : 0} />
      </Stage>
      <Tag x={0} y={500} start={at(scene, 0, 0.6)} color={C.violet} size={56} opacity={fadeTo(f, l1, 0, 10)}>
        <div style={{ width: 1920, textAlign: 'center' }}>长度不影响概率</div>
      </Tag>
      {f >= l1 && f < l2 && <Okay x={560} y={520} start={l1 + 20}><Tex tex="24<2\times16=32" size={58} /></Okay>}
      {f >= l2 && <Cross x={560} y={520} start={l2 + 20}><Tex tex="30>2\times10=20" size={58} /></Cross>}
    </>
  );
};

// ---------- pause scenes ----------
const makePause = (seconds: number, withChoices: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={130} y={170} w={1050} size={46} style={{ ...fadeUp(f, 4), lineHeight: 1.35 }}>
        {withChoices ? (
          <><b>最长</b>的一段比最短一段的<b>2倍</b>还短，概率是多少？</>
        ) : (
          <>最长的一段比最短一段的<b>3倍</b>还短，概率是多少？</>
        )}
      </Text>
      {withChoices ? (
        <>
          <Stick x0={130} y={420} w={900} a={15} b={40} opacity={ease(f, 8, 12)} />
          <Choices x={130} y={600} start={() => 10} items={['\\dfrac1{20}', '\\dfrac1{12}', '\\dfrac1{10}', '\\dfrac16', '\\dfrac14'].map((t) => <Tex key={t} tex={t} size={50} />)} />
        </>
      ) : (
        <>
          <Eq x={130} y={380} start={8} size={66} tex={[z('最长'), '<3\\times', z('最短'), '?']} />
          <Stick x0={130} y={560} w={900} a={15} b={40} opacity={ease(f, 8, 12)} />
        </>
      )}
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// ---------- Scene: map ----------
const Map1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 0, 0), l2 = at(scene, 1, 0), l3 = at(scene, 2, 0), l4 = at(scene, 3, 0);
  const ex: [number, number][] = [[14, 41], [45, 20], [30, 52]];
  let d: [number, number];
  if (f < l3) d = steps(f, [0, at(scene, 0, 0.5), at(scene, 0, 0.72)], ex);
  else d = [14, 41];
  const [a, b] = [Math.min(d[0], d[1]), Math.max(d[0], d[1])];
  const dp = mapM(d[0], d[1]);
  const labs = f >= l3 ? [<Tex key="a" tex="x" size={54} />, <Tex key="b" tex="y-x" size={54} />, <Tex key="c" tex="60-y" size={54} />] : [];
  const sq = tp([V1, [60, 0], V3, V2], mapM);
  const top = tp([V1, V2, V3], mapM);
  const bot = tp([V1, [60, 0], V3], mapM);
  const flip = ease(f, l4 + 10, 40);
  const botCopy = tp([V1, V2, V3].map((p) => flipPt(p, flip)), mapM);
  const dimmed = ease(f, l4 + 55, 20);
  const verdictOn = (f >= l1 && f < l3 && f > at(scene, 0, 0.3)) || (f >= l3 && f < l4);
  return (
    <>
      <Stage>
        <Pg pts={sq} fill={GREY} fo={0.14 * ease(f, l2, 20)} />
        <Pg pts={top} fill={C.blue} fo={0.2 * ease(f, l3 + 20, 20)} />
        {f >= l4 && f < l4 + 80 && <Pg pts={botCopy} fill={C.violet} fo={0.45 * (1 - dimmed)} stroke={C.violet} sw={5} op={ease(f, l4 + 4, 6) * (1 - dimmed)} />}
      </Stage>
      <Axes titles={ease(f, l1 + 4, 14)} ticks={ease(f, l1, 14)} />
      <Stage>
        <Ln a={mapM(0, 0)} b={mapM(60, 60)} color={C.ink} sw={6} prog={ease(f, l3 + 6, 24)} />
        <T x={mapM(22, 52)[0]} y={mapM(22, 52)[1]} size={60} fill={C.blue} op={ease(f, at(scene, 3, 0.55), 12)}>1800</T>
        <Dot p={dp} r={16} color={C.ink} op={ease(f, 4, 8)} />
      </Stage>
      <Stick {...RIGHT_STICK} a={a} b={b} labels={labs} lsize={54} opacity={ease(f, 2, 12)} />
      <Stage>
        <Verdict x={1850} y={276} ok={win(d[0], d[1])} op={verdictOn ? 1 : 0} />
      </Stage>
      <Parts x={960} y={430} size={62} parts={[[l2 + 14, [z('面积'), '=60\\times60=3600']]]} opacity={fadeTo(f, l3, 0.0, 10)} />
      <Parts x={960} y={560} size={52} parts={[[l3 + 40, 'x']]} opacity={0} />
    </>
  );
};

// ---------- Scene: orders ----------
const MEDIANS: { a: Pt; b: Pt; end: Pt; l: [string, number, string, number]; at?: Pt }[] = [
  { a: V1, b: M23, end: M23, l: ['左', 0, '中', 1], at: [585, 145] },
  { a: M12, b: V3, end: V3, l: ['中', 1, '右', 2] },
  { a: V2, b: M13, end: M13, l: ['左', 0, '右', 2], at: [500, 470] },
];
const OrdersMap: React.FC<{ drawn: number[]; labelsOn?: boolean; f: number }> = ({ drawn, labelsOn = true, f }) => (
  <>
    {MEDIANS.map((m, i) => {
      const p = ease(f, drawn[i], 22);
      const e = mapM(m.end[0], m.end[1]);
      return (
        <g key={i}>
          <Ln a={mapM(m.a[0], m.a[1])} b={mapM(m.b[0], m.b[1])} color={C.ink} sw={4} prog={p} />
          {labelsOn && p > 0.9 && (
            <text x={m.at ? m.at[0] : e[0] + 15} y={m.at ? m.at[1] : 145} fontFamily={ZH_FONT} fontSize={40} fontWeight={800} textAnchor="start" stroke={C.bg} strokeWidth={8} paintOrder="stroke" opacity={ease(f, drawn[i] + 14, 10)}>
              <tspan fill={COL[m.l[1]]}>{m.l[0]}</tspan>
              <tspan fill={C.ink}> = </tspan>
              <tspan fill={COL[m.l[3]]}>{m.l[2]}</tspan>
            </text>
          )}
        </g>
      );
    })}
  </>
);
const LABEL_AT: Record<number, Pt> = { 0: [5.5, 21], 1: [5, 50], 5: [19, 21] };
const Orders: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0), l3 = at(scene, 3, 0), l4 = at(scene, 4, 0);
  const drawn = [at(scene, 0, 0.45), at(scene, 0, 0.6), at(scene, 0, 0.75)];
  const top = tp([V1, V2, V3], mapM);
  const slice0 = tp(SLICES[0], mapM);
  const pm = mapM(P[0], P[1]);
  return (
    <>
      <Stage>
        <Pg pts={tp([V1, [60, 0], V3, V2], mapM)} fill={GREY} fo={0.1} />
        <Pg pts={top} fill={C.blue} fo={0.2} />
        <Ln a={mapM(0, 0)} b={mapM(60, 60)} color={C.ink} sw={6} />
        <Pg pts={slice0} fill={C.violet} fo={0.3 * ease(f, l2, 14)} stroke={C.violet} sw={6} op={ease(f, l2, 14)} />
      </Stage>
      <Axes titles={0.0} yticks={fadeTo(f, l2, 0, 10)} />
      <Stage>
        <OrdersMap drawn={drawn} f={f} />
        <Ln a={mapM(0, 0)} b={mapM(0, 30)} color={C.ink} sw={12} prog={ease(f, l2 + 14, 14)} />
        <Ln a={pm} b={mapM(0, 40)} color={C.ink} sw={5} dash="12 10" prog={ease(f, l2 + 24, 16)} />
        <T x={168} y={mapM(0, 15)[1]} size={48} op={ease(f, l2 + 18, 10)}>30</T>
        <T x={mapM(10, 40)[0]} y={mapM(10, 40)[1] - 24} size={48} op={ease(f, l2 + 30, 10)}>20</T>
        {SLICES.map((s, i) => {
          const c = mapM(...(LABEL_AT[i] ?? centroid(s)));
          const start = i === 0 ? at(scene, 3, 0.8) : at(scene, 4, 0.12 + 0.12 * (i - 1));
          return <T key={i} x={c[0]} y={c[1]} size={46} fill={i === 0 ? C.violet : C.ink} op={ease(f, start, 10)}>300</T>;
        })}
        <Dot p={pm} r={15} color={C.ink} op={ease(f, l1, 8)} />
      </Stage>
      <Stick {...RIGHT_STICK} a={20} b={40} labels={['20', '20', '20']} lsize={54} opacity={ease(f, l1 + 4, 12)} />
      <Tag x={960} y={350} start={l2 + 6} color={C.ink} size={46}>
        <span style={{ color: COL[0] }}>左段</span> &lt; <span style={{ color: COL[1] }}>中段</span> &lt; <span style={{ color: COL[2] }}>右段</span>
      </Tag>
      <Eq x={960} y={470} start={at(scene, 3, 0.65)} size={58} tex="\dfrac12\times30\times20=300" />
      <Eq x={960} y={640} start={at(scene, 4, 0.75)} size={62} color={C.green} tex="6\times300=1800" />
    </>
  );
};

// ---------- Scene: good (zoom into our slice) ----------
const GoodMap: React.FC<{ e1?: number; e2?: number; f: number; pop1?: number; pop2?: number; border?: number; shade?: number; label?: number; sample?: number; sampleP?: Pt }> = ({ f, pop1 = 1e9, pop2 = 1e9, border = 1e9, shade = 1e9, label = 1e9, sample = 1e9, sampleP = [17, 36], e1 = 1e9, e2 = 1e9 }) => {
  const O = zoomM(0, 0), Q = zoomM(0, 30), PP = zoomM(P[0], P[1]), a = zoomM(A[0], A[1]), b = zoomM(B[0], B[1]);
  return (
    <Stage>
      <Pg pts={[O, Q, PP]} fill={C.violet} fo={0.14} stroke={C.ink} sw={6} />
      <Pg pts={[PP, a, b]} fill={C.green} fo={0.45 * ease(f, shade, 16)} op={ease(f, shade, 16)} />
      <Ln a={a} b={b} color={C.green} sw={9} prog={ease(f, border, 16)} />
      <text x={500} y={500} fontFamily={ZH_FONT} fontSize={38} fontWeight={800} fill={C.ink} opacity={ease(f, e1, 12)} stroke={C.bg} strokeWidth={8} paintOrder="stroke">两短段相等</text>
      <text x={420} y={196} fontFamily={ZH_FONT} fontSize={38} fontWeight={800} fill={C.ink} opacity={ease(f, e2, 12)} textAnchor="end" stroke={C.bg} strokeWidth={8} paintOrder="stroke">两长段相等</text>
      <Dot p={PP} r={15} />
      <T x={PP[0] + 24} y={PP[1] - 4} size={40} anchor="start" op={ease(f, label, 10)}>三等分点</T>
      <Dot p={a} r={14 * pop(f, pop1)} color={C.green} />
      <Dot p={b} r={14 * pop(f, pop2)} color={C.green} />
      <Dot p={zoomM(sampleP[0], sampleP[1])} r={12} color={C.ink} op={ease(f, sample, 8)} />
    </Stage>
  );
};
const Good: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0), l3 = at(scene, 3, 0);
  let cuts: [number, number] = [15, 30];
  let labs: React.ReactNode[] = [];
  if (f >= l1 && f < l2) labs = ['15', '15', '30'];
  if (f >= l2 && f < l3) { cuts = [12, 36]; labs = ['12', '24', '24']; }
  if (f >= l3) { cuts = [17, 36]; labs = []; }
  return (
    <>
      <GoodMap f={f} e1={at(scene, 1, 0.1)} e2={at(scene, 2, 0.1)} pop1={l1 + 10} pop2={l2 + 10} border={l3 + 4} shade={l3 + 14} label={at(scene, 3, 0.1)} sample={l3 + 30} />
      <Parts x={960} y={440} size={62} parts={[[6, [z('右段'), '<2\\times', z('左段')], C.ink]]} />
      <Stick {...RIGHT_STICK} a={cuts[0]} b={cuts[1]} labels={labs} lsize={54} opacity={ease(f, l1 + 8, 12)} />
      <Stage>
        <Verdict x={1850} y={276} ok op={f >= l3 + 30 ? ease(f, l3 + 30, 8) : 0} />
      </Stage>
    </>
  );
};

// ---------- Scene: area (box trick) ----------
const AreaScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0), l3 = at(scene, 3, 0);
  const p = areaM(20, 40), a = areaM(15, 30), b = areaM(12, 36);
  const c1 = areaM(20, 30), c2 = areaM(12, 40), c3 = areaM(12, 30);
  const box = [c3, c1, p, c2];
  const dim = fadeTo(f, l1, 0, 10);
  const t1 = at(scene, 1, 0.45), t2 = at(scene, 2, 0.05), t3 = at(scene, 2, 0.55);
  const tri = (pts: Pt[], s: number) => <Pg pts={pts} fill={GREY} fo={0.4} stroke={GREY} sw={4} op={ease(f, s, 14)} />;
  return (
    <>
      <Stage>
        <Pg pts={[p, a, b]} fill={C.green} fo={0.45} stroke={C.green} sw={7} />
        {tri([a, c1, p], t1)}
        {tri([b, c2, p], t2)}
        {tri([c3, a, b], t3)}
        <Pg pts={box} stroke={C.ink} sw={6} op={ease(f, 4, 14)} dash="2 0" />
        <Dot p={p} r={13} />
        <T x={(p[0] + c3[0]) / 2 + 160} y={(p[1] + c3[1]) / 2 + 0} size={0} op={0}>.</T>
        {/* inside the green triangle, last */}
        <T x={centroid([p, a, b])[0] + 10} y={centroid([p, a, b])[1]} size={64} fill="#0a7a3c" op={ease(f, at(scene, 3, 0.9), 12)}>30</T>
        {/* axis ticks */}
        {[12, 15, 20].map((n) => (
          <g key={n} opacity={ease(f, 6, 12)}>
            <line x1={areaM(n, 0)[0]} y1={c3[1]} x2={areaM(n, 0)[0]} y2={c3[1] + 14} stroke={C.muted} strokeWidth={4} />
            <T x={areaM(n, 0)[0]} y={c3[1] + 80} size={34} fill={C.muted} weight={800} halo={false} op={0}>{n}</T>
          </g>
        ))}
        {/* dimension labels (box) */}
        <T x={(c2[0] + p[0]) / 2} y={c2[1] - 34} size={52} op={dim * ease(f, at(scene, 0, 0.45), 10)}>8</T>
        <T x={c3[0] - 40} y={(c2[1] + c3[1]) / 2} size={52} op={dim * ease(f, at(scene, 0, 0.6), 10)}>10</T>
        {/* leg labels */}
        <T x={(a[0] + c1[0]) / 2} y={a[1] + 40} size={48} op={ease(f, t1 + 8, 10)}>5</T>
        <T x={c1[0] + 40} y={(c1[1] + p[1]) / 2} size={48} op={ease(f, t1 + 14, 10)}>10</T>
        <T x={c2[0] - 36} y={(b[1] + c2[1]) / 2} size={48} op={ease(f, t2 + 8, 10)}>4</T>
        <T x={(c2[0] + p[0]) / 2} y={c2[1] - 34} size={48} op={ease(f, t2 + 14, 10)}>8</T>
        <T x={(c3[0] + a[0]) / 2} y={c3[1] + 40} size={48} op={ease(f, t3 + 8, 10)}>3</T>
        <T x={c3[0] - 36} y={(c3[1] + b[1]) / 2} size={48} op={ease(f, t3 + 14, 10)}>6</T>
      </Stage>
      <Eq x={880} y={140} start={at(scene, 0, 0.7)} size={56} tex="8\times10=80" />
      <Eq x={880} y={255} start={at(scene, 1, 0.75)} size={52} color={C.ink} tex="\dfrac12\times5\times10=25" />
      <Eq x={1380} y={255} start={at(scene, 2, 0.3)} size={52} tex="\dfrac12\times4\times8=16" />
      <Eq x={880} y={425} start={at(scene, 2, 0.85)} size={52} tex="\dfrac12\times3\times6=9" />
      <Eq x={880} y={585} start={at(scene, 3, 0.25)} size={56} tex="25+16+9=50" />
      <Eq x={880} y={705} start={at(scene, 3, 0.8)} size={60} color={C.green} tex="80-50=30" />
    </>
  );
};

// ---------- Scene: reveal ----------
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0);
  const copyAt = (i: number) => (i === 0 ? 0 : at(scene, 0, 0.1 + 0.1 * (i - 1)));
  const flip = ease(f, l1 + 6, 40);
  const hexMirror = tp(HEX.map((h) => flipPt(h, flip)), mapM);
  const hexOrig = tp(HEX, mapM);
  const hexOp = ease(f, at(scene, 0, 0.55), 16);
  return (
    <>
      <Stage>
        <Pg pts={tp([V1, [60, 0], V3, V2], mapM)} fill={GREY} fo={0.1} />
        <Pg pts={tp([V1, V2, V3], mapM)} fill={C.blue} fo={0.2} />
        <Ln a={mapM(0, 0)} b={mapM(60, 60)} color={C.ink} sw={6} />
        {SLICES.map((s, i) => <Pg key={i} pts={tp(s, mapM)} stroke={C.muted} sw={3} op={0.6} />)}
      </Stage>
      <Axes titles={0} />
      <Stage>
        {WIN.map((w, i) => {
          const pp = ease(f, copyAt(i), 14);
          const c = mapM(...centroid(w));
          return (
            <g key={i}>
              <Pg pts={tp(w, mapM)} fill={C.green} fo={0.5} stroke={C.green} sw={4} op={pp} />
              {i === 0 && <T x={c[0]} y={c[1]} size={40} fill="#0a7a3c" op={ease(f, 8, 10) * (1 - ease(f, at(scene, 0, 0.7), 12))}>30</T>}
            </g>
          );
        })}
        <Pg pts={hexOrig} stroke="#0a7a3c" sw={6} op={hexOp} />
        {f >= l1 + 6 && <Pg pts={hexMirror} fill={C.green} fo={0.5} stroke="#0a7a3c" sw={6} op={ease(f, l1 + 6, 4)} />}
      </Stage>
      <Eq x={960} y={190} start={at(scene, 0, 0.82)} size={64} tex="6\times30=180" />
      <Parts x={960} y={330} size={64} parts={[[l1 + 20, '\\dfrac{180}{1800}'], [at(scene, 2, 0.55), '=\\dfrac1{10}', C.green]]} />
      <AnswerPill x={1380} y={720} start={at(scene, 2, 0.88)}>
        <span>C</span>
        <span style={{ opacity: 0.8 }}>·</span>
        <Tex tex="\dfrac1{10}" size={70} color="#fff" />
      </AnswerPill>
      <Confetti x={1380} y={720} start={at(scene, 2, 0.88)} seed={7} />
    </>
  );
};

// ---------- Scene: walk (Solution 2) ----------
const WalkMap: React.FC<{ dot: Pt; showDot?: number; trail?: { to: Pt; op: number }[]; edge1?: number; edge2?: number }> = ({ dot, showDot = 1, trail = [], edge1 = 0, edge2 = 0 }) => {
  const O = zoomM(0, 0), Q = zoomM(0, 30), PP = zoomM(P[0], P[1]);
  const d = zoomM(dot[0], dot[1]);
  return (
    <Stage>
      <Pg pts={[O, Q, PP]} fill={C.violet} fo={0.12} stroke={C.ink} sw={6} />
      {trail.map((t, i) => (
        <g key={i}>
          <Ln a={PP} b={zoomM(t.to[0], t.to[1])} color={C.green} sw={12} op={t.op} />
          <Ring p={zoomM(t.to[0], t.to[1])} op={t.op} />
        </g>
      ))}
      <T x={470} y={560} size={0} op={0}>.</T>
      <text x={500} y={500} fontFamily={ZH_FONT} fontSize={38} fontWeight={800} fill={C.ink} opacity={edge1} stroke={C.bg} strokeWidth={8} paintOrder="stroke">两短段相等</text>
      <text x={420} y={196} fontFamily={ZH_FONT} fontSize={38} fontWeight={800} fill={C.ink} opacity={edge2} textAnchor="end" stroke={C.bg} strokeWidth={8} paintOrder="stroke">两长段相等</text>
      <Dot p={d} r={16} op={showDot} />
    </Stage>
  );
};
const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0), l3 = at(scene, 3, 0), l4 = at(scene, 4, 0), l5 = at(scene, 5, 0);
  const segs: [number, number, Pt, Pt][] = [
    [at(scene, 1, 0.1), at(scene, 1, 0.42), P, V1],
    [at(scene, 1, 0.42), at(scene, 1, 0.52), V1, P],
    [at(scene, 1, 0.56), at(scene, 1, 0.92), P, M12],
    [at(scene, 2, 0), at(scene, 2, 0.14), M12, P],
    [at(scene, 2, 0.5), at(scene, 2, 0.88), P, A],
    [at(scene, 4, 0), at(scene, 4, 0.16), A, P],
    [at(scene, 4, 0.5), at(scene, 4, 0.88), P, B],
  ];
  const d = track(f, segs, P);
  const [a, b] = [d[0], d[1]];
  const labelsOn = f < at(scene, 1, 0.08) || (f >= at(scene, 2, 0.9) && f < at(scene, 4, 0.0)) || f >= at(scene, 4, 0.9) || (f >= at(scene, 2, 0) && f < at(scene, 2, 0.0));
  const L = nums(a, b);
  const shortest = Math.min(a, b - a, 60 - b);
  const barOp = ease(f, l1 + 4, 10) * fadeTo(f, l2, 0, 10);
  return (
    <>
      <WalkMap
        dot={d}
        edge1={ease(f, at(scene, 2, 0.15), 12)}
        edge2={ease(f, at(scene, 4, 0.2), 12)}
        trail={[{ to: A, op: ease(f, at(scene, 2, 0.9), 8) * fadeTo(f, at(scene, 4, 0.0), 0, 6) }, { to: B, op: ease(f, at(scene, 4, 0.88), 8) }]}
      />
      <Stick {...RIGHT_STICK} a={a} b={b} labels={labelsOn ? L : []} lsize={54} />
      <Stage>
        <rect x={960} y={360} width={14 * shortest} height={34} rx={8} fill={COL[0]} opacity={barOp} />
      </Stage>
      <Tag x={1270} y={350} start={l1 + 4} color={COL[0]} size={42} opacity={barOp}>最短的一段</Tag>
      <Parts x={960} y={430} size={58} parts={[[at(scene, 2, 0.3), '{\\color{#0cc281}1}:{\\color{#7b61ff}1}:{\\color{#f59e0b}2}']]} opacity={fadeTo(f, l4, 0, 10)} />
      <Parts x={960} y={430} size={58} parts={[[at(scene, 4, 0.3), '{\\color{#0cc281}1}:{\\color{#7b61ff}2}:{\\color{#f59e0b}2}']]} opacity={f >= l4 ? 1 : 0} />
      <Eq x={900} y={580} start={at(scene, 3, 0.55)} size={50} tex={[z('缩短'), '\\dfrac{5}{20}=\\dfrac14', z('的路程')]} />
      <Eq x={900} y={720} start={at(scene, 5, 0.6)} size={50} tex={[z('缩短'), '\\dfrac{8}{20}=\\dfrac25', z('的路程')]} />
    </>
  );
};

// ---------- Scene: walk2 ----------
const Walk2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0);
  const k1 = ease(f, at(scene, 0, 0.25), 24);
  const k2 = ease(f, at(scene, 0, 0.62), 24);
  const Qp = lerpPt(M12, B, k1), Op = lerpPt(V1, A, k2);
  const tri = tp([P, Op, Qp], zoomM);
  const done = ease(f, at(scene, 0, 0.92), 12);
  return (
    <>
      <Stage>
        <Pg pts={tp([P, V1, M12], zoomM)} fill={C.violet} fo={0.1} stroke={C.ink} sw={5} />
        <Pg pts={tri} fill={lerp(0, 1, 1) ? C.violet : C.violet} fo={0.3 * (1 - done)} />
        <Pg pts={tri} fill={C.green} fo={0.5 * done} stroke={C.green} sw={7} />
        <Dot p={zoomM(P[0], P[1])} r={14} />
      </Stage>
      <Lbl x={300} y={205} tex="\times\dfrac25" start={at(scene, 0, 0.5)} size={60} color={C.violet} />
      <Lbl x={zoomM(A[0], A[1])[0] + 130} y={zoomM(A[0], A[1])[1] + 20} tex="\times\dfrac14" start={at(scene, 0, 0.88)} size={60} color={C.violet} />
      <Parts x={920} y={320} size={74} parts={[[l1 + 10, '\\dfrac14'], [l1 + 10, '\\times'], [l1 + 10, '\\dfrac25'], [at(scene, 1, 0.3), '=\\dfrac1{10}', C.green]]} gap={16} />
      <Okay x={1480} y={350} start={at(scene, 1, 0.36)}><span /></Okay>
      <Tag x={920} y={560} start={at(scene, 1, 0.6)} color={C.amber} size={50}>满足条件的部分在角上 → 走一走！</Tag>
    </>
  );
};

// ---------- Scene: traps ----------
const CARD_W = 420, CARD_X = (i: number) => 75 + i * 450, CARD_Y = 140, CARD_H = 590;
const TrapCard: React.FC<{ i: number; start: number; letter: string; tex: string; text: string }> = ({ i, start, letter, tex, text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: CARD_X(i), top: CARD_Y, width: CARD_W, height: CARD_H, background: C.card, borderRadius: 30, border: `6px solid ${C.red}`, boxShadow: '0 8px 30px rgba(30,40,80,0.08)', boxSizing: 'border-box', ...fadeUp(f, start) }}>
      <div style={{ position: 'absolute', left: 30, top: 325, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ background: C.red, color: '#fff', borderRadius: 999, width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900 }}>{letter}</div>
        <Tex tex={tex} size={52} color={C.red} />
      </div>
      <div style={{ position: 'absolute', left: 30, top: 470, width: 360, fontSize: 40, fontWeight: 800, lineHeight: 1.25, color: C.ink, whiteSpace: 'pre-line' }}>{text}</div>
    </div>
  );
};
const TrapThumb: React.FC<{ i: number; start: number; kind: 'A' | 'B' | 'D' | 'E' }> = ({ i, start, kind }) => {
  const f = useCurrentFrame();
  const S = 280 / 60, X = CARD_X(i) + 70, Y = CARD_Y + 40;
  const m: M = (x, y) => [X + x * S, Y + (60 - y) * S];
  const sq = tp([V1, [60, 0], V3, V2], m);
  const op = ease(f, start, 14);
  const frame = (
    <>
      <Pg pts={sq} fill={GREY} fo={0.1} stroke={C.ink} sw={3} />
      <Pg pts={tp([V1, V2, V3], m)} fill={C.blue} fo={0.15} />
      <Ln a={m(0, 0)} b={m(60, 60)} color={C.ink} sw={3} />
    </>
  );
  let body: React.ReactNode = null;
  if (kind === 'A') {
    body = (
      <>
        {frame}
        <Pg pts={tp(HEX, m)} fill={C.red} fo={0.55} stroke={C.red} sw={3} />
        <Pg pts={tp(HEX.map((h) => [h[1], h[0]] as Pt), m)} stroke={C.red} sw={4} dash="8 7" />
      </>
    );
  } else if (kind === 'B') {
    body = (
      <>
        {frame}
        {SLICES.map((s, k) => <Pg key={k} pts={tp(s, m)} stroke={C.muted} sw={2} />)}
        <Pg pts={tp(SLICES[0], m)} fill={C.red} fo={0.55} stroke={C.red} sw={4} />
      </>
    );
  } else if (kind === 'D') {
    body = (
      <>
        {SLICES.map((sl, k) => {
          const col = k % 3, row = Math.floor(k / 3);
          const c = 88, ms: M = (x, y) => [X + col * 96 + (x / 60) * c, Y + 30 + row * 108 + ((60 - y) / 60) * c];
          return (
            <g key={k}>
              <Pg pts={tp([V1, [60, 0], V3, V2], ms)} fill={GREY} fo={0.1} stroke={C.muted} sw={2} />
              <Pg pts={tp(sl, ms)} fill={k === 0 ? C.red : GREY} fo={k === 0 ? 0.6 : 0.4} stroke={k === 0 ? C.red : C.muted} sw={3} />
            </g>
          );
        })}
      </>
    );
  } else {
    const tri: Pt[] = [[X + 10, Y + 250], [X + 250, Y + 250], [X + 150, Y + 30]];
    body = (
      <>
        {[0, 1, 2].map((k) => {
          const a = tri[k], b = tri[(k + 1) % 3];
          return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={COL[k]} strokeWidth={16} strokeLinecap="round" />;
        })}
      </>
    );
  }
  return (
    <g opacity={op}>{body}</g>
  );
};
const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = [1, 2, 3, 4].map((i) => at(scene, i, 0.04));
  return (
    <>
      <Tag x={0} y={380} start={4} color={C.red} size={62} opacity={fadeTo(f, l[0] - 4, 0, 10)}>
        <div style={{ width: 1920, textAlign: 'center' }}>每个错误选项都是一个陷阱</div>
      </Tag>
      <TrapCard i={0} start={l[0]} letter="A" tex="\dfrac1{20}" text="忘了镜像的一半" />
      <TrapCard i={1} start={l[1]} letter="B" tex="\dfrac1{12}" text="整块不都满足条件" />
      <TrapCard i={2} start={l[2]} letter="D" tex="\dfrac16" text={"只算一种顺序，\n忘了2倍条件"} />
      <TrapCard i={3} start={l[3]} letter="E" tex="\dfrac14" text={"能拼三角形\n≠ 本题条件"} />
      <Stage>
        <TrapThumb i={0} start={l[0]} kind="A" />
        <TrapThumb i={1} start={l[1]} kind="B" />
        <TrapThumb i={2} start={l[2]} kind="D" />
        <TrapThumb i={3} start={l[3]} kind="E" />
      </Stage>
      <Parts x={0} y={770} center size={46} parts={[[at(scene, 4, 0.5), [z('最长'), '<2\\times', z('最短'), '\\le', z('最短'), '+', z('中段')]], [at(scene, 4, 0.75), [z('更严格')], C.amber]]} gap={34} />
    </>
  );
};

// ---------- Scene: variant ----------
const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0);
  return (
    <>
      <Stick x0={360} y={380} w={1200} a={18} b={44} opacity={ease(f, 4, 14)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', ...fadeUp(f, l1 + 6) }}>
        <Z p={[z('最长'), '<']} size={72} />
        <Mark on={at(scene, 1, 0.55)}><Tex tex="3" size={80} /></Mark>
        <Z p={['\\times', z('最短'), '?']} size={72} />
      </div>
    </>
  );
};

// ---------- Scene: variant-answer ----------
const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0), l3 = at(scene, 3, 0), l4 = at(scene, 4, 0), l5 = at(scene, 5, 0);
  const T3 = 105;
  const A2 = lerpPt(P, V1, 0.4), B2 = lerpPt(P, M12, 4 / 7);
  const segs: [number, number, Pt, Pt][] = [
    [at(scene, 1, 0.55), at(scene, 1, 0.92), P, A2],
    [at(scene, 3, 0.0), at(scene, 3, 0.14), A2, P],
    [at(scene, 3, 0.5), at(scene, 3, 0.9), P, B2],
  ];
  const d = track(f, segs, P);
  let cuts: [number, number] = [35, 70];
  let labs: React.ReactNode[] = [];
  if (f >= l1) labs = ['35', '35', '35'];
  if (f >= at(scene, 1, 0.55)) {
    const k = interpolate(f, [segs[0][0], segs[0][1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
    cuts = [lerp(35, 21, k), lerp(70, 42, k)];
    labs = k >= 1 ? ['21', '21', '63'] : [];
  }
  if (f >= at(scene, 3, 0.0)) {
    const kb = interpolate(f, [segs[1][0], segs[1][1]], [0, 1], { ...clamp });
    const k2 = interpolate(f, [segs[2][0], segs[2][1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
    if (f < segs[2][0]) {
      cuts = [lerp(21, 35, kb), lerp(42, 70, kb)];
      labs = kb >= 1 ? ['35', '35', '35'] : [];
    } else {
      cuts = [lerp(35, 15, k2), lerp(70, 60, k2)];
      labs = k2 >= 1 ? ['15', '45', '45'] : [];
    }
  }
  const O = zoomM(0, 0), Q = zoomM(0, 30), PP = zoomM(P[0], P[1]);
  const dp = zoomM(d[0], d[1]);
  const a2 = zoomM(A2[0], A2[1]), b2 = zoomM(B2[0], B2[1]);
  const fin = ease(f, l5 + 4, 16);
  return (
    <>
      <Stage>
        <Pg pts={[O, Q, PP]} fill={C.violet} fo={0.12} stroke={C.ink} sw={6} />
        <Pg pts={[PP, a2, b2]} fill={C.green} fo={0.5 * fin} stroke={C.green} sw={7} op={fin} />
        <Ln a={PP} b={a2} color={C.green} sw={12} op={ease(f, segs[0][1], 8) * fadeTo(f, l3, 0, 6)} />
        <Ring p={a2} op={ease(f, segs[0][1], 8)} />
        <Ln a={PP} b={b2} color={C.green} sw={12} op={ease(f, segs[2][1], 8)} />
        <Ring p={b2} op={ease(f, segs[2][1], 8)} />
        <Dot p={dp} r={16} op={ease(f, l1, 8)} />
      </Stage>
      <Stick x0={960} y={250} w={840} a={cuts[0]} b={cuts[1]} total={T3} labels={labs} lsize={54} ruler={[0, T3]} rulerOp={ease(f, 4, 14)} />
      <Parts x={920} y={400} size={54} parts={[[at(scene, 1, 0.55), '{\\color{#0cc281}1}:{\\color{#7b61ff}1}:{\\color{#f59e0b}3}']]} />
      <Parts x={1400} y={400} size={54} parts={[[at(scene, 3, 0.35), '{\\color{#0cc281}1}:{\\color{#7b61ff}3}:{\\color{#f59e0b}3}']]} />
      <Eq x={920} y={465} start={at(scene, 2, 0.2)} size={50} tex="35-21=14" />
      <Eq x={920} y={555} start={at(scene, 2, 0.55)} size={50} tex="\dfrac{14}{35}=\dfrac25" />
      <Eq x={1400} y={465} start={at(scene, 4, 0.25)} size={50} tex="35-15=20" />
      <Eq x={1400} y={555} start={at(scene, 4, 0.6)} size={50} tex="\dfrac{20}{35}=\dfrac47" />
      <Parts x={920} y={710} size={56} parts={[[at(scene, 5, 0.05), '\\dfrac25\\times\\dfrac47'], [at(scene, 5, 0.8), '=\\dfrac{8}{35}', C.green]]} />
      <AnswerPill x={1760} y={810} start={at(scene, 5, 0.9)}>
        <Tex tex="\dfrac{8}{35}" size={64} color="#fff" />
      </AnswerPill>
      <Confetti x={1760} y={810} start={at(scene, 5, 0.9)} seed={5} />
    </>
  );
};

// ---------- Scene: recap ----------
const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0.02);
  const two = ease(f, l1, 14);
  const d: Pt = [14, 41];
  const showDot = fadeTo(f, l1 + 8, 0, 10);
  const out2 = fadeTo(f, l2, 0, 12);
  return (
    <>
    <div style={{ opacity: out2 }}>
      <Stage>
        <Pg pts={tp([V1, [60, 0], V3, V2], mapM)} fill={GREY} fo={0.1} stroke={C.ink} sw={5} />
        <Pg pts={tp([V1, V2, V3], mapM)} fill={C.blue} fo={0.2} />
        <Ln a={mapM(0, 0)} b={mapM(60, 60)} color={C.ink} sw={6} />
        {SLICES.map((s, i) => <Pg key={i} pts={tp(s, mapM)} stroke={C.ink} sw={3} op={two * 0.8} />)}
        <Pg pts={tp(SLICES[0], mapM)} fill={C.violet} fo={0.3} stroke={C.violet} sw={6} op={ease(f, l1 + 16, 14)} />
        <Pg pts={tp(WIN[0], mapM)} fill={C.green} fo={0.6} stroke={C.green} sw={5} op={ease(f, l1 + 34, 14)} />
        <Dot p={mapM(d[0], d[1])} r={16} op={ease(f, 4, 8) * showDot} />
      </Stage>
      <Stick {...RIGHT_STICK} y={200} a={14} b={41} opacity={ease(f, at(scene, 0, 0.1), 12) * showDot} />
      <Tag x={960} y={330} start={at(scene, 0, 0.35)} color={C.violet} size={56} opacity={showDot}>随机切两刀</Tag>
      <Tag x={960} y={420} start={at(scene, 0, 0.6)} color={C.ink} size={56} opacity={showDot}>= 正方形里的一个随机点</Tag>
      <Tag x={960} y={300} start={l1 + 20} color={C.ink} size={56}>只算<span style={{ color: C.violet }}>一块</span>里满足条件的比例</Tag>
    </div>
      <SignOff start={l2} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, true),
  map: Map1,
  orders: Orders,
  good: Good,
  area: AreaScene,
  reveal: Reveal,
  walk: Walk,
  walk2: Walk2,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

// YouTube thumbnail (`2026-11-07-broken-stick-thumb`, render.sh → poster.jpg): the stick snapped into three pieces, "longest < 2 × shortest ?", no answer.
export const Thumb: React.FC = () => {
  const u = 10, gap = 20, x0 = 20, y = 270, h = 90;
  const bounds = [0, 12, 44, 60];
  return (
    <ThumbFrame chip="AMC 10 练习" lines={[<span style={{ fontFamily: ZH_FONT }}>你觉得是</span>, <span style={{ color: C.red, fontFamily: ZH_FONT }}>1/4？</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={x0 + bounds[i] * u + i * gap} y={y} width={(bounds[i + 1] - bounds[i]) * u} height={h} rx={16} fill={COL[i]} />
        ))}
        {[0, 1].map((i) => (
          <path key={i} d={`M ${x0 + bounds[i + 1] * u + i * gap + gap / 2} ${y - 50} L ${x0 + bounds[i + 1] * u + i * gap + gap / 2} ${y + h + 50}`} stroke={C.ink} strokeWidth={6} strokeDasharray="12 10" strokeLinecap="round" />
        ))}
        <text x={x0} y={y - 70} textAnchor="start" fontSize={44} fontWeight={900} fill={COL[0]} fontFamily={ZH_FONT}>最短</text>
        <text x={x0 + 12 * u + gap + (32 * u) / 2} y={y + h + 95} textAnchor="middle" fontSize={44} fontWeight={900} fill={COL[1]} fontFamily={ZH_FONT}>最长</text>
        <text x={340} y={560} textAnchor="middle" fontSize={56} fontWeight={900} fill={C.ink} fontFamily={ZH_FONT}>最长 &lt; 2 × 最短 ？</text>
      </svg>
    </ThumbFrame>
  );
};

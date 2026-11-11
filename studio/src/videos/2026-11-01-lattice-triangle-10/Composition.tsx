import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-lattice-triangle-10';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- maths (same formulas as verify.py) ----------
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
type Kind = 'in' | 'slant' | 'edge' | 'out';
/** Class of the grid dot (x, y) for the triangle (0,0), (p,0), (0,q). */
export const classify = (p: number, q: number, x: number, y: number): Kind => {
  if (x < 0 || y < 0 || x > p || y > q) return 'out';
  if (x === 0 || y === 0) return 'edge';
  const s = q * x + p * y;
  return s < p * q ? 'in' : s === p * q ? 'slant' : 'out';
};
export const inside = (p: number, q: number) => range(p + 1).reduce((a, x) => a + range(q + 1).filter((y) => classify(p, q, x, y) === 'in').length, 0);

/** Maths coords (y up) → pixels. */
export const plane = (ox: number, oy: number, unit: number) => (p: Pt): Pt => [ox + p[0] * unit, oy - p[1] * unit];
type M = (p: Pt) => Pt;
export const tri = (p: number, q: number): Pt[] => [[0, 0], [p, 0], [0, q]];
export const rect = (p: number, q: number): Pt[] => [[0, 0], [p, 0], [p, q], [0, q]];

export const GREY = '#9aa0ad';
export const BASE = '#cfd3de';
const BLUE = C.blue;

// ---------- drawing helpers ----------
export type DotSpec = { fill: string; r: number; ring?: string; opacity?: number };
export const Grid: React.FC<{ cols: number; rows: number; m: M; spec: (x: number, y: number) => DotSpec }> = ({ cols, rows, m, spec }) => (
  <g>
    {range(rows + 1).flatMap((y) =>
      range(cols + 1).map((x) => {
        const s = spec(x, y);
        const [cx, cy] = m([x, y]);
        return (
          <g key={`${x}-${y}`} opacity={s.opacity ?? 1}>
            {s.ring && <circle cx={cx} cy={cy} r={s.r + 9} fill="none" stroke={s.ring} strokeWidth={5} />}
            <circle cx={cx} cy={cy} r={s.r} fill={s.fill} />
          </g>
        );
      }),
    )}
  </g>
);

export const base: DotSpec = { fill: BASE, r: 8 };
export const D_IN: DotSpec = { fill: C.primary, r: 15 };
export const D_SLANT: DotSpec = { fill: C.violet, r: 18, ring: C.violetSoft };
export const D_EDGE: DotSpec = { fill: GREY, r: 11 };

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 48, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** Positioned Tex (left aligned, or centred on x). */
const T: React.FC<{ x: number; y: number; tex: string; start?: number; size?: number; color?: string; center?: boolean; opacity?: number; plain?: boolean }> = ({
  x, y, tex, start = 0, size = 56, color = C.ink, center = false, opacity = 1, plain = false,
}) => {
  const f = useCurrentFrame();
  const s = plain ? { opacity: ease(f, start, 10) } : fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', transform: center ? 'translateX(-50%)' : undefined }}>
      <div style={{ ...s, opacity: (s.opacity as number) * opacity }}>
        <Tex tex={tex} size={size} color={color} />
      </div>
    </div>
  );
};

/** Plain text label (not maths). */
const Note: React.FC<{ x: number; y: number; start: number; size?: number; color?: string; w?: number; opacity?: number; children: React.ReactNode }> = ({ x, y, start, size = 44, color = C.ink, w = 800, opacity = 1, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return <Text x={x} y={y} w={w} size={size} weight={800} color={color} style={{ ...s, opacity: (s.opacity as number) * opacity }}>{children}</Text>;
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; opacity?: number }> = ({ x, y, w, h, start, opacity = 1 }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) * opacity }} />;
};

const MarkIcon: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 54 54" style={{ flex: 'none' }}>
    <circle cx={27} cy={27} r={27} fill={ok ? C.green : C.red} />
    {ok ? (
      <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M17 17 L37 37 M37 17 L17 37" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
    )}
  </svg>
);

/** Small red cross on a dot that does not count. */
const Cross: React.FC<{ at: Pt; opacity: number; s?: number }> = ({ at: a, opacity, s = 13 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={C.red} strokeWidth={6} strokeLinecap="round">
      <line x1={a[0] - s} y1={a[1] - s} x2={a[0] + s} y2={a[1] + s} />
      <line x1={a[0] + s} y1={a[1] - s} x2={a[0] - s} y2={a[1] + s} />
    </g>
  );

const Arrow: React.FC<{ a: Pt; b: Pt; color: string; opacity: number }> = ({ a, b, color, opacity }) => {
  if (opacity <= 0) return null;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => [b[0] - 20 * Math.cos(ang + s), b[1] - 20 * Math.sin(ang + s)].join(' ');
  return (
    <g opacity={opacity} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none">
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <path d={`M ${head(0.5)} L ${b[0]} ${b[1]} L ${head(-0.5)}`} />
    </g>
  );
};

/** Bracket over/along a run of dots (pixels a→b), pushed out by (dx, dy). */
const Brace: React.FC<{ a: Pt; b: Pt; dx: number; dy: number; color: string; opacity: number }> = ({ a, b, dx, dy, color, opacity }) =>
  opacity <= 0 ? null : (
    <path d={`M ${a[0] + dx * 0.4} ${a[1] + dy * 0.4} L ${a[0] + dx} ${a[1] + dy} L ${b[0] + dx} ${b[1] + dy} L ${b[0] + dx * 0.4} ${b[1] + dy * 0.4}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
  );

/** Line that draws itself on. */
const DrawLine: React.FC<{ a: Pt; b: Pt; color: string; progress: number; width?: number; dashed?: boolean }> = ({ a, b, color, progress, width = 7, dashed }) =>
  progress <= 0 ? null : (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * progress} y2={a[1] + (b[1] - a[1]) * progress} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '14 12' : undefined} />
  );

/** Ordered-pair chip like (2, 21). */
const PairChip: React.FC<{ x: number; y: number; a: number; b: number; start: number; color?: string; opacity?: number; bad?: boolean; dashed?: boolean; size?: number }> = ({
  x, y, a, b, start, color = C.ink, opacity = 1, bad, dashed, size = 50,
}) => {
  const f = useCurrentFrame();
  const s = pop(f, start, 30);
  if (s <= 0.01 || opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: Math.min(1, s) * opacity, transform: `scale(${0.6 + 0.4 * s})`, background: dashed ? 'transparent' : C.card, border: `${dashed ? 4 : 0}px dashed ${C.muted}`, borderRadius: 18, padding: '8px 22px', boxShadow: dashed ? 'none' : '0 4px 14px rgba(30,40,80,0.08)', outline: bad ? `5px solid ${C.red}` : 'none', whiteSpace: 'nowrap' }}>
      <Tex tex={`(${a},\\,${b})`} size={size} color={bad ? C.red : color} />
    </div>
  );
};

const CHOICE_VALUES = ['5', '6', '10', '11', '12'];
/** Answer choices; `reds[i]` = frame when choice i turns red, `good` = index highlighted green. */
const ChoiceBar: React.FC<{ x: number; y: number; start: (i: number) => number; reds?: (number | null)[]; good?: number; goodAt?: number }> = ({ x, y, start, reds = [], good = -1, goodAt = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CHOICE_VALUES.map((v, i) => {
        const red = reds[i] != null && f >= (reds[i] as number);
        const isGood = i === good && f >= goodAt;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), background: isGood ? C.green : red ? C.red : C.card, color: isGood || red ? '#fff' : C.ink, borderRadius: 18, padding: '12px 28px', fontSize: 48, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: isGood || red ? '#fff' : C.muted, fontSize: 34, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {v}
          </div>
        );
      })}
    </div>
  );
};

/** Question card text; `marks` are frames for the four highlights. */
const QuestionCard: React.FC<{ marks?: number[]; w?: number }> = ({ marks = [], w = 1100 }) => {
  const f = useCurrentFrame();
  const mk = (i: number) => marks[i] ?? 100000;
  return (
    <div style={{ position: 'absolute', left: 90, top: 150, width: w, background: C.card, borderRadius: 32, padding: '34px 46px', fontSize: 46, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
      A right triangle has <Mark on={mk(0)}>vertices <Tex tex="(0,0)" size={46} />, <Tex tex="(p,0)" size={46} />, <Tex tex="(0,q)" size={46} /></Mark>, where{' '}
      <Mark on={mk(1)}>
        <Tex tex="p" size={46} /> and <Tex tex="q" size={46} /> are positive integers
      </Mark>
      . <Mark on={mk(2)}>Exactly 10 points with integer coordinates lie strictly inside</Mark> it.{' '}
      <Mark on={mk(3)}>
        How many ordered pairs <Tex tex="(p,q)" size={46} />
      </Mark>{' '}
      are possible?
    </div>
  );
};

/** Schematic triangle with axes, corner labels and leg labels (no dots, no counts). */
const Schematic: React.FC<{ scene: Scene; glow?: number }> = ({ scene, glow }) => {
  const f = useCurrentFrame();
  const m = plane(1360, 640, 56);
  const A = m([0, 0]);
  const B = m([8, 0]);
  const Cc = m([0, 5]);
  const gl = glow === undefined ? 0 : ease(f, glow, 10);
  return (
    <>
      <Stage>
        <Arrow a={[A[0] - 50, A[1]]} b={[B[0] + 70, B[1]]} color={C.line} opacity={ease(f, 4, 12)} />
        <Arrow a={[A[0], A[1] + 50]} b={[Cc[0], Cc[1] - 60]} color={C.line} opacity={ease(f, 4, 12)} />
        <Poly pts={[A, B, Cc]} color={C.primary} fill={C.primary} width={8} progress={ease(f, 8, 22)} />
        {[A, B, Cc].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={14 + 6 * gl} fill={C.violet} opacity={ease(f, 20, 10)} />
        ))}
        <Label p={[(A[0] + B[0]) / 2, A[1] + 70]} text="p" color={C.primary} opacity={ease(f, 24, 10)} />
        <Label p={[A[0] - 56, (A[1] + Cc[1]) / 2]} text="q" color={C.primary} opacity={ease(f, 24, 10)} />
      </Stage>
      <T x={A[0] - 80} y={A[1] + 24} tex="(0,0)" size={48} center start={20} plain />
      <T x={B[0] + 20} y={B[1] + 24} tex="(p,0)" size={48} center start={20} plain />
      <T x={Cc[0] + 20} y={Cc[1] - 110} tex="(0,q)" size={48} center start={20} plain />
    </>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(150, 830, 76);
  const t1 = at(scene, 0, 0.35);
  const t2 = at(scene, 0, 0.62);
  const l1 = at(scene, 1, 0);
  const steps: [number, number][] = [[4, 3], [6, 4], [8, 5]];
  const idx = f >= l1 ? 1 : f >= t2 ? 2 : f >= t1 ? 1 : 0;
  const [p, q] = steps[idx];
  const glow = ease(f, at(scene, 1, 0.35), 14);
  const pulse = 1 + 0.35 * Math.sin(Math.max(0, f - at(scene, 1, 0.5)) / 4) * glow;
  const counts = [3, 7, 14];
  const card = ease(f, at(scene, 2, 0), 14);
  const showCount = f < l1;
  const show = ease(f, 6, 14);
  return (
    <>
      <Stage>
        <g opacity={show}>
          <Grid
            cols={10}
            rows={8}
            m={m}
            spec={(x, y) => {
              const k = classify(p, q, x, y);
              if (k === 'in') return D_IN;
              if (k === 'slant' && glow > 0) return { ...D_SLANT, r: 18 * (x === 3 && y === 2 ? pulse : 1), opacity: 1 };
              return base;
            }}
          />
          <Poly pts={tri(p, q).map(m)} color={C.primary} fill={C.primary} width={8} progress={ease(f, 8, 20)} />
          {glow > 0 && <DrawLine a={m([q === 4 ? 6 : p, 0])} b={m([0, q])} color={C.violet} progress={glow} width={11} />}
        </g>
      </Stage>
      {showCount && (
        <>
          <Note x={1030} y={290} start={8} size={52} color={C.muted} w={700}>Dots inside</Note>
          <div style={{ position: 'absolute', left: 1030, top: 350, fontSize: 190, fontWeight: 900, color: C.primary, lineHeight: 1 }}>{counts[idx]}</div>
        </>
      )}
      <div style={{ position: 'absolute', left: 1000, top: 330, opacity: ease(f, l1, 12), transform: `scale(${0.9 + 0.1 * ease(f, l1, 12)})` }}>
        <Pill x={0} y={0} color={C.amber} style={{ position: 'relative', fontSize: 62, padding: '16px 40px' }}>EXACTLY 10 inside?</Pill>
        <div style={{ marginTop: 40, fontSize: 52, fontWeight: 800, color: C.violet, opacity: glow }}>The slanted side is sneaky!</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: C.bg, opacity: card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 120, fontWeight: 900, transform: `translateY(${(1 - card) * 20}px)` }}>10 Dots Inside</div>
        <div style={{ fontFamily: PACIFICO, fontSize: 90, color: C.violet, marginTop: 10 }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted }}>your math tutor</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionCard marks={[at(scene, 0, 0.45), at(scene, 1, 0.3), at(scene, 2, 0.2), at(scene, 3, 0.1)]} />
      <ChoiceBar x={90} y={745} start={(i) => at(scene, 3, 0.7 + i * 0.05)} />
      <Schematic scene={scene} glow={at(scene, 0, 0.4)} />
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: 0 }}>{f}</div>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(190, 690, 100);
  const l1 = at(scene, 1, 0.1);
  const l2 = at(scene, 2, 0);
  const pOut = fadeTo(f, l2);
  const x1 = ease(f, at(scene, 1, 0.35), 14);
  return (
    <>
      <Stage>
        <Grid
          cols={6}
          rows={4}
          m={m}
          spec={(x, y) => {
            const k = classify(6, 4, x, y);
            if (f < l1) return base;
            if (k === 'in') return D_IN;
            if (k === 'slant' || k === 'edge') return { fill: GREY, r: 11 };
            return base;
          }}
        />
        <Poly pts={tri(6, 4).map(m)} color={C.primary} fill={C.primary} width={8} progress={ease(f, 4, 20)} />
        {range(7).flatMap((x) => range(5).map((y) => {
          const k = classify(6, 4, x, y);
          return k === 'edge' || k === 'slant' ? <Cross key={`${x}${y}`} at={m([x, y])} opacity={x1 * pOut} /> : null;
        }))}
        <g opacity={pOut}>
          <Arrow a={m([0, -0.55])} b={m([6, -0.55])} color={C.primary} opacity={ease(f, at(scene, 0, 0.3), 12)} />
          <Arrow a={m([-0.6, 0])} b={m([-0.6, 4])} color={C.primary} opacity={ease(f, at(scene, 0, 0.6), 12)} />
          <Label p={m([3, -1.05])} text="p" color={C.primary} opacity={ease(f, at(scene, 0, 0.3), 12)} />
          <Label p={m([-1.05, 2])} text="q" color={C.primary} opacity={ease(f, at(scene, 0, 0.6), 12)} />
        </g>
      </Stage>
      <div style={{ opacity: pOut }}>
        <div style={{ position: 'absolute', left: 1000, top: 220, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, at(scene, 1, 0.2)) }}>
          <MarkIcon ok={false} size={64} />
          <div style={{ fontSize: 52, fontWeight: 800 }}>Edge dots do NOT count</div>
        </div>
        <div style={{ position: 'absolute', left: 1000, top: 340, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, at(scene, 1, 0.55)) }}>
          <svg width={64} height={64}><circle cx={32} cy={32} r={22} fill={C.primary} /></svg>
          <div style={{ fontSize: 52, fontWeight: 800 }}>Only dots strictly inside</div>
        </div>
      </div>
      <T x={1000} y={300} tex="(2,\,21)\ \ne\ (21,\,2)" size={72} start={l2 + 4} />
      {(() => {
        const s = ease(f, l2 + 14, 14);
        const a: Pt[] = [[1100, 700], [1150, 700], [1100, 480]];
        const b: Pt[] = [[1450, 700], [1700, 700], [1450, 670]];
        return (
          <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} opacity={s}>
            <path d={`M ${a.map((p) => p.join(' ')).join(' L ')} Z`} fill={C.primarySoft} stroke={C.primary} strokeWidth={7} strokeLinejoin="round" />
            <path d={`M ${b.map((p) => p.join(' ')).join(' L ')} Z`} fill={C.violetSoft} stroke={C.violet} strokeWidth={7} strokeLinejoin="round" />
            <Label p={[1125, 750]} text="tall and thin" size={40} />
            <Label p={[1575, 750]} text="wide and flat" size={40} />
          </svg>
        );
      })()}
    </>
  );
};

const makePause = (variant: boolean, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      {variant ? <VariantCard /> : <QuestionCard w={1050} />}
      {!variant && <ChoiceBar x={90} y={745} start={() => 0} />}
      <Countdown scene={scene} seconds={seconds} x={1520} y={470} tick={TICK} />
      <div style={{ position: 'absolute', opacity: 0 }}>{f}</div>
    </>
  );
};

const VariantCard: React.FC<{ marks?: number[] }> = ({ marks = [] }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 90, top: 150, width: 1100, background: C.card, borderRadius: 32, padding: '34px 46px', fontSize: 46, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
      Same kind of triangle <Tex tex="(0,0),\ (p,0),\ (0,q)" size={46} />, but now <Mark on={marks[0] ?? 100000}>exactly <span style={{ color: C.violet, fontWeight: 900 }}>6</span> points</Mark> with integer coordinates lie strictly inside.{' '}
      <Mark on={marks[1] ?? 100000}>
        How many ordered pairs <Tex tex="(p,q)" size={46} />
      </Mark>{' '}
      are possible?
    </div>
  );
};

const Variant: SceneComponent = ({ scene }) => (
  <>
    <VariantCard marks={[at(scene, 0, 0.45), at(scene, 0, 0.72)]} />
    <Schematic scene={scene} />
  </>
);

// ----- Solution 1 -----
const RM = plane(120, 700, 105);
const Rect: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0.1);
  const l2 = at(scene, 2, 0.45);
  const rotS = at(scene, 3, 0.05);
  const rotE = at(scene, 3, 0.4);
  const split = at(scene, 3, 0.5);
  const slide = ease(f, at(scene, 0, 0.55), 26);
  const rot = interpolate(f, [rotS, rotE], [0, 180], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const [cx, cy] = RM([3, 2]);
  const pulse = 1 + 0.3 * Math.sin(Math.max(0, f - l2) / 4);
  const cnt = (x: number, y: number) => x >= 1 && x <= 5 && y >= 1 && y <= 3;
  return (
    <>
      <Stage>
        <Grid
          cols={6}
          rows={4}
          m={RM}
          spec={(x, y) => {
            if (!cnt(x, y) || f < l1) return base.r && (x === 0 || y === 0 || x === 6 || y === 4) ? { fill: BASE, r: 9 } : base;
            const o = pop(f, l1 + (x + y * 5) * 2, 30);
            if (x === 3 && y === 2 && f >= l2) return { ...D_SLANT, r: 18 * pulse };
            if (f >= split) return { fill: 6 * y + 4 * x < 24 ? BLUE : C.primary, r: 15, opacity: 1 };
            return { fill: C.primary, r: 15 * Math.min(1, o), opacity: 1 };
          }}
        />
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          <Poly pts={tri(6, 4).map(RM)} color={C.primary} fill={C.primary} width={8} progress={ease(f, 4, 20)} />
          <g opacity={slide} transform={`translate(${(1 - slide) * 320} ${(1 - slide) * -150})`}>
            <Poly pts={[[6, 0], [6, 4], [0, 4]].map((p) => RM(p as Pt))} color={BLUE} fill={BLUE} width={8} />
          </g>
        </g>
        <DrawLine a={RM([6, 0])} b={RM([0, 4])} color={C.violet} progress={ease(f, at(scene, 2, 0.15), 24)} width={10} />
        <Label p={[RM([3, 0])[0], RM([0, 0])[1] + 56]} text="6" opacity={ease(f, at(scene, 0, 0.7), 10)} />
        <Label p={[RM([0, 2])[0] - 50, RM([0, 2])[1]]} text="4" opacity={ease(f, at(scene, 0, 0.8), 10)} />
      </Stage>
      <T x={820} y={170} tex="5 \times 3 = 15" size={64} start={at(scene, 1, 0.5)} />
      <Note x={820} y={270} start={l2} color={C.violet} size={46} w={1000}>One dot sits ON the slanted side</Note>
      <T x={820} y={420} tex="15 - 1 = 14" size={64} start={at(scene, 3, 0.35)} />
      <T x={820} y={520} tex="14 \div 2 = 7" size={64} start={at(scene, 3, 0.65)} color={C.green} />
      <Note x={820} y={620} start={at(scene, 3, 0.8)} size={44} color={C.muted} w={1000}>seven dots in each triangle</Note>
      <div style={{ position: 'absolute', left: RM([1.5, 0.5])[0] - 20, top: RM([1.5, 0.5])[1] - 42, ...fadeUp(f, split) }}><span style={{ fontSize: 64, fontWeight: 900, color: BLUE }}>7</span></div>
      <div style={{ position: 'absolute', left: RM([4.5, 3.5])[0] - 20, top: RM([4.5, 3.5])[1] - 42, ...fadeUp(f, split) }}><span style={{ fontSize: 64, fontWeight: 900, color: C.primary }}>7</span></div>
    </>
  );
};

const FM = plane(230, 710, 100);
const KEY = '(p-1)(q-1)=19+g';
const Formula: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l2 = at(scene, 2, 0.1);
  const l4 = at(scene, 4, 0);
  const small = ease(f, at(scene, 4, 1) + 15, 16);
  return (
    <>
      <Stage>
        <Grid cols={6} rows={4} m={FM} spec={(x, y) => (x >= 1 && x <= 5 && y >= 1 && y <= 3 ? D_IN : { fill: BASE, r: 9 })} />
        <Poly pts={rect(6, 4).map(FM)} color={C.ink} width={6} />
        <DrawLine a={FM([6, 0])} b={FM([0, 4])} color={C.violet} progress={ease(f, l2, 18)} width={9} />
        {[[3, 2]].map(([x, y]) => (
          <circle key="m" cx={FM([x, y])[0]} cy={FM([x, y])[1]} r={18} fill={C.violet} opacity={ease(f, l2 + 6, 10)} />
        ))}
        <Label p={[FM([3, 4])[0], FM([0, 4])[1] - 78]} text="p − 1" color={C.primary} opacity={ease(f, at(scene, 0, 0.5), 10)} />
        <Brace a={FM([1, 4])} b={FM([5, 4])} dx={0} dy={-36} color={C.primary} opacity={ease(f, at(scene, 0, 0.5), 10)} />
        <Label p={[FM([0, 2])[0] - 110, FM([0, 2])[1]]} text="q − 1" color={C.primary} opacity={ease(f, at(scene, 0, 0.7), 10)} />
        <Brace a={FM([0, 1])} b={FM([0, 3])} dx={-36} dy={0} color={C.primary} opacity={ease(f, at(scene, 0, 0.7), 10)} />
        <Label p={[FM([3, 0])[0], FM([0, 0])[1] + 56]} text="p" color={C.ink} opacity={ease(f, 8, 10)} />
        <Label p={[FM([6, 2])[0] + 40, FM([6, 2])[1]]} text="q" color={C.ink} opacity={ease(f, 8, 10)} />
      </Stage>
      <T x={940} y={135} tex="(p-1)(q-1)\ \text{ dots inside}" size={50} start={at(scene, 0, 0.5)} opacity={fadeTo(f, l4 + 20, 1)} />
      <T x={940} y={210} tex="g=\gcd(p,q)" size={54} start={at(scene, 1, 0.4)} color={C.violet} />
      <Note x={1340} y={225} start={at(scene, 1, 0.55)} size={36} color={C.muted} w={540}>greatest common factor</Note>
      <T x={940} y={290} tex="g\ \text{equal hops}" size={50} start={at(scene, 2, 0.35)} color={C.violet} />
      <T x={940} y={420} tex="g-1\ \text{dots strictly between}" size={50} start={at(scene, 2, 0.8)} color={C.violet} />
      <T x={940} y={515} tex="\dfrac{(p-1)(q-1)-(g-1)}{2}=10" size={54} start={at(scene, 3, 0.3)} />
      <T x={940} y={660} tex="(p-1)(q-1)-(g-1)=20" size={54} start={at(scene, 3, 0.7)} />
      <div style={{ opacity: 1 - small }}>
        <T x={940} y={750} tex={KEY} size={60} start={at(scene, 4, 0.55)} color={C.green} />
        <Boxed x={920} y={735} w={770} h={96} start={at(scene, 4, 0.8)} />
      </div>
      <KeyCorner on={small} />
    </>
  );
};

/** The key equation, kept small in the top corner. */
const KeyCorner: React.FC<{ on: number; tex?: string }> = ({ on, tex = KEY }) => (
  <div style={{ position: 'absolute', left: 740, top: 34, opacity: on, border: `4px solid ${C.green}`, borderRadius: 16, padding: '0 18px', background: C.card, whiteSpace: 'nowrap' }}>
    <Tex tex={tex} size={38} color={C.green} />
  </div>
);

const BM = plane(120, 810, 62);
const Bound: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0);
  const l2 = at(scene, 2, 0);
  const l3 = at(scene, 3, 0);
  const inL2 = f >= l2 && f < l3;
  const inL3 = f >= l3;
  const oL2 = fadeTo(f, l3);
  return (
    <>
      <KeyCorner on={1} />
      <Stage>
        <Grid
          cols={10}
          rows={10}
          m={BM}
          spec={(x, y) => {
            if (inL3) return base;
            if (f >= l2 && x >= 1 && x <= 6 && y >= 1 && y <= 6) {
              const o = pop(f, l2 + (x + y * 6) * 1, 30);
              return x + y === 7 ? { ...D_SLANT, r: 18 * Math.min(1, o) } : x + y < 7 ? { fill: C.primary, r: 14 * Math.min(1, o) } : { fill: BLUE, r: 14 * Math.min(1, o) };
            }
            return base;
          }}
        />
        {!inL3 && (
          <>
            <Poly pts={tri(9, 10).map(BM)} color={C.amber} fill={C.amber} fillOpacity={0.1} width={6} dashed progress={ease(f, l1 + 6, 20)} opacity={oL2} />
            <Poly pts={tri(7, 7).map(BM)} color={C.violet} fill={C.violet} width={8} progress={ease(f, l1 + 24, 20)} opacity={oL2} />
            <Poly pts={rect(7, 7).map(BM)} color={C.ink} width={5} dashed progress={ease(f, l2, 18)} opacity={oL2} />
          </>
        )}
        {inL3 && (
          <>
            <rect x={BM([0, 10])[0]} y={BM([0, 10])[1]} width={62} height={620} fill={C.amber} opacity={0.2 * ease(f, l3 + 8, 14)} />
            <Poly pts={tri(1, 10).map(BM)} color={C.amber} fill={C.amber} width={8} progress={ease(f, l3 + 10, 20)} />
          </>
        )}
      </Stage>
      <T x={880} y={150} tex="p \le q" size={72} start={at(scene, 0, 0.5)} />
      <Note x={1200} y={170} start={at(scene, 0, 0.7)} size={44} color={C.muted} w={600}>(we flip later)</Note>
      <Note x={880} y={260} start={at(scene, 1, 0.4)} size={42} color={C.amber} w={900} opacity={oL2}>a big triangle covers the 7 × 7 one</Note>
      <div style={{ opacity: oL2 }}>
        <T x={880} y={340} tex="6 \times 6 = 36,\quad 36 - 6 = 30" size={56} start={at(scene, 2, 0.15)} />
        <T x={880} y={440} tex="30 \div 2 = 15" size={60} start={at(scene, 2, 0.5)} />
        <Pill x={1260} y={436} color={C.red} style={{ ...fadeUp(f, at(scene, 2, 0.75)), fontSize: 40 }}>Too many! 15 &gt; 10</Pill>
        <Note x={880} y={540} start={at(scene, 2, 0.35)} size={40} color={C.violet} w={900}>purple dots sit on the slanted side</Note>
      </div>
      {inL3 && (
        <>
          <T x={880} y={280} tex="p \le 6" size={64} start={at(scene, 3, 0.15)} />
          <T x={880} y={390} tex="p = 1:\ \text{no dot strictly inside}" size={52} start={at(scene, 3, 0.5)} color={C.amber} />
          <T x={880} y={520} tex="2 \le p \le 6" size={72} start={at(scene, 3, 0.8)} color={C.green} />
          <Boxed x={850} y={500} w={440} h={140} start={at(scene, 3, 0.85)} />
        </>
      )}
    </>
  );
};

// ----- case tables -----
type Res = { q: number; ok: boolean | null; note: string; grey?: boolean; at?: number };
type CaseRow = { y: number; rx?: number; lab: string; eq: (struck: boolean) => string; start: number; strikeAt?: number; resAt: number; res: Res[] };

const CaseTable: React.FC<{ rows: CaseRow[]; head?: number }> = ({ rows, head = 0 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Note x={40} y={135} start={head} size={32} color={C.muted} w={520}>short leg p and its g</Note>
      <Note x={580} y={135} start={head} size={32} color={C.muted} w={520}>the equation gives q − 1</Note>
      <Note x={1060} y={135} start={head} size={32} color={C.muted} w={700}>then check: is the gcd equal to g?</Note>
      {rows.map((r, i) => (
        <div key={i}>
          <T x={40} y={r.y} tex={r.lab} size={46} start={r.start} />
          <T x={580} y={r.y} tex={r.eq(r.strikeAt !== undefined && f >= r.strikeAt)} size={46} start={r.start + 5} />
          <div style={{ position: 'absolute', left: r.rx ?? 1200, top: r.y + 3, display: 'flex', gap: 26, whiteSpace: 'nowrap' }}>
            {r.res.map((s, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, ...fadeUp(f, s.at ?? r.resAt + j * 8) }}>
                <Tex tex={`q=${s.q}`} size={46} color={s.grey ? C.muted : C.ink} />
                {s.ok !== null && <MarkIcon ok={s.ok} size={38} />}
                <Tex tex={s.note} size={s.grey ? 38 : 42} color={s.grey ? C.muted : s.ok ? C.green : C.red} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

const st = (a: string, b: string) => `{\\color{#8a91a0}\\cancel{${a}}}${b}`;
const Cases: SceneComponent = ({ scene }) => {
  const rows: CaseRow[] = [
    { y: 200, rx: 1060, lab: 'p=2,\\ g\\in\\{1,2\\}', eq: () => '1(q-1)=20,\\,21', start: at(scene, 1, 0), resAt: at(scene, 1, 0.55), res: [{ q: 21, ok: true, note: '\\gcd\\,1' }, { q: 22, ok: true, note: '\\gcd\\,2' }] },
    { y: 310, rx: 1060, lab: 'p=3,\\ g\\in\\{1,3\\}', eq: () => '2(q-1)=20,\\,22', start: at(scene, 2, 0), resAt: at(scene, 2, 0.6), res: [{ q: 11, ok: true, note: '\\gcd\\,1' }, { q: 12, ok: true, note: '\\gcd\\,3' }] },
    {
      y: 420, rx: 1130, lab: 'p=4,\\ g\\in\\{1,2,4\\}', start: at(scene, 3, 0), strikeAt: at(scene, 3, 0.17), resAt: at(scene, 3, 0.45),
      eq: (s) => (s ? `3(q-1)=${st('20', '')},\\,21,\\,${st('23', '')}` : '3(q-1)=20,\\,21,\\,23'),
      res: [{ q: 8, ok: false, note: '\\gcd\\,4' }],
    },
    {
      y: 530, rx: 1060, lab: 'p=5,\\ g\\in\\{1,5\\}', eq: () => '4(q-1)=20,\\,24', start: at(scene, 4, 0), resAt: at(scene, 4, 0.4),
      res: [{ q: 6, ok: true, note: '\\gcd\\,1', at: at(scene, 4, 0.42) }, { q: 7, ok: false, note: '\\gcd\\,1', at: at(scene, 4, 0.62) }],
    },
    {
      y: 640, lab: 'p=6,\\ g\\in\\{1,2,3,6\\}', start: at(scene, 5, 0), strikeAt: at(scene, 5, 0.27), resAt: at(scene, 6, 0.1),
      eq: (s) => (s ? `5(q-1)=20,\\,${st('21', '')},\\,${st('22', '')},\\,25` : '5(q-1)=20,\\,21,\\,22,\\,25'),
      res: [{ q: 5, ok: null, note: '\\text{counted}', grey: true, at: at(scene, 6, 0.1) }, { q: 6, ok: true, note: '\\gcd\\,6', at: at(scene, 6, 0.55) }],
    },
  ];
  const f = useCurrentFrame();
  return (
    <>
      <KeyCorner on={1} />
      <CaseTable rows={rows} head={at(scene, 0, 0.3)} />
      <Note x={40} y={745} start={at(scene, 0, 0.55)} size={42} color={C.violet} w={1700}>g has to be a factor of p</Note>
      <div style={{ position: 'absolute', opacity: 0 }}>{f}</div>
    </>
  );
};

const PAIRS: [number, number][] = [[2, 21], [2, 22], [3, 11], [3, 12], [5, 6], [6, 6]];
const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const flip = at(scene, 0, 0.35);
  const loop = at(scene, 1, 0.1);
  const done = at(scene, 1, 0.93);
  return (
    <>
      <KeyCorner on={1} />
      {PAIRS.map(([a, b], i) => (
        <PairChip key={i} x={90 + i * 280} y={190} a={a} b={b} start={at(scene, 0, 0.05 + i * 0.05)} color={C.primary} />
      ))}
      {PAIRS.slice(0, 5).map(([a, b], i) => (
        <PairChip key={`f${i}`} x={90 + i * 280} y={330} a={b} b={a} start={flip + i * 6} color={C.violet} />
      ))}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {PAIRS.slice(0, 5).map((_, i) => (
          <Arrow key={i} a={[200 + i * 280, 270]} b={[200 + i * 280, 326]} color={C.violet} opacity={ease(f, flip + i * 6, 8)} />
        ))}
        <path d={`M ${90 + 5 * 280 + 60} 188 C ${90 + 5 * 280 + 60} 90, ${90 + 5 * 280 + 200} 90, ${90 + 5 * 280 + 200} 188`} stroke={C.violet} strokeWidth={6} fill="none" opacity={ease(f, loop, 10)} />
      </svg>
      <Note x={90 + 5 * 280 - 10} y={340} start={loop + 8} size={36} color={C.violet} w={260}>flips to itself</Note>
      <T x={90} y={470} tex="5 \times 2 = 10" size={64} start={at(scene, 0, 0.75)} />
      <T x={90} y={580} tex="10 + 1" size={64} start={at(scene, 1, 0.5)} />
      <T x={380} y={580} tex="= 11" size={64} start={at(scene, 1, 0.75)} color={C.green} />
      <ChoiceBar x={90} y={745} start={() => 0} good={3} goodAt={done} />
      <Answer x={1620} y={560} value="11" start={done} chime={CHIME} />
    </>
  );
};

// ----- Solution 2 -----
const PM = plane(260, 700, 90);
const WALK: Pt[] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [3, 2], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0]];
const Pick: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const w0 = at(scene, 1, 0.2);
  const w1 = at(scene, 1, 0.85);
  const k = Math.round(interpolate(f, [w0, w1], [0, WALK.length - 1], clamp));
  const mp = WALK[k];
  const showFig = f >= at(scene, 1, 0);
  return (
    <>
      <KeyCorner on={1} />
      <div style={{ position: 'absolute', left: 90, top: 150, opacity: 0 }} />
      <div style={{ position: 'absolute', left: 560, top: 170, fontSize: 80, fontWeight: 900, color: C.violet, ...fadeUp(f, at(scene, 0, 0.1)), opacity: (fadeUp(f, at(scene, 0, 0.1)).opacity as number) * fadeTo(f, at(scene, 1, 0)) }}>Pick&apos;s theorem</div>
      <div style={{ opacity: fadeTo(f, at(scene, 1, 0)) }}>
        <div style={{ position: 'absolute', left: 400, top: 320, background: C.card, borderRadius: 32, padding: '30px 60px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 0, 0.4)) }}>
          <Tex tex="A = I + \dfrac{B}{2} - 1" size={92} />
        </div>
        <Note x={400} y={600} start={at(scene, 0, 0.55)} size={44} color={C.primary} w={1200}>I = dots inside</Note>
        <Note x={900} y={600} start={at(scene, 0, 0.7)} size={44} color={C.muted} w={1200}>B = dots on the edge</Note>
      </div>
      {showFig && (
        <>
          <Stage>
            <g opacity={ease(f, at(scene, 1, 0), 12)}>
              <Grid cols={6} rows={4} m={PM} spec={(x, y) => { const c = classify(6, 4, x, y); return c === 'in' ? { fill: C.primary, r: 12 } : c === 'slant' ? { fill: C.violet, r: 14 } : c === 'edge' ? { fill: GREY, r: 11 } : { fill: BASE, r: 7 }; }} />
              <Poly pts={tri(6, 4).map(PM)} color={C.ink} width={6} />
              {WALK.slice(0, k + 1).map((p, i) => (
                <circle key={i} cx={PM(p)[0]} cy={PM(p)[1]} r={i === k ? 24 : 18} fill={i === k ? C.amber : C.amber} opacity={i === k ? 1 : 0.5} />
              ))}
              <Label p={[PM([3, 0])[0], PM([0, 0])[1] + 62]} text="p steps" color={C.primary} opacity={ease(f, w0 + 5, 10)} />
              <Label p={[PM([4.9, 2.4])[0] + 80, PM([4.9, 2.4])[1] - 30]} text="g hops" color={C.violet} opacity={ease(f, at(scene, 1, 0.5), 10)} />
              <Label p={[PM([0, 2])[0] - 135, PM([0, 2])[1]]} text="q steps" color={C.primary} opacity={ease(f, at(scene, 1, 0.7), 10)} />
            </g>
          </Stage>
          <T x={940} y={135} tex="B = p + q + g" size={58} start={at(scene, 1, 0.9)} color={C.violet} />
        </>
      )}
      <T x={940} y={235} tex="A = \dfrac{pq}{2}" size={52} start={at(scene, 2, 0.2)} />
      <T x={940} y={372} tex="\dfrac{pq}{2} = 10 + \dfrac{p+q+g}{2} - 1" size={52} start={at(scene, 2, 0.55)} />
      <T x={940} y={530} tex="pq = 18 + p + q + g" size={52} start={at(scene, 3, 0.1)} />
      <T x={940} y={620} tex="pq - p - q + 1 = 19 + g" size={52} start={at(scene, 3, 0.4)} />
      <T x={940} y={710} tex="(p-1)(q-1) = 19 + g" size={56} start={at(scene, 3, 0.7)} color={C.green} />
      <Pill x={1620} y={720} color={C.green} style={{ ...fadeUp(f, at(scene, 3, 0.88)), fontSize: 36 }}>Same!</Pill>
      <div style={{ opacity: ease(f, at(scene, 4, 0.15), 12) }}>
        <div style={{ position: 'absolute', left: 940, top: 300, width: 880, height: 440, background: C.card, borderRadius: 32, boxShadow: '0 10px 40px rgba(30,40,80,0.1)', display: 'none' }} />
      </div>
      <PickCards on={at(scene, 4, 0.3)} />
    </>
  );
};

const PickCards: React.FC<{ on: number }> = ({ on }) => {
  const f = useCurrentFrame();
  const p = ease(f, on, 14);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 130, bottom: 0, background: C.bg, opacity: p }}>
      <div style={{ position: 'absolute', left: 150, top: 120, width: 780, height: 420, background: C.card, borderRadius: 32, boxShadow: '0 10px 40px rgba(30,40,80,0.1)', padding: 50 }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: C.violet }}>Pick&apos;s theorem</div>
        <div style={{ fontSize: 48, fontWeight: 800, marginTop: 20 }}>Fast, if you know it</div>
        <Tex tex="A = I + \dfrac{B}{2} - 1" size={56} />
      </div>
      <div style={{ position: 'absolute', left: 990, top: 120, width: 780, height: 420, background: C.card, borderRadius: 32, boxShadow: '0 10px 40px rgba(30,40,80,0.1)', padding: 50 }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: C.primary }}>Rectangle</div>
        <div style={{ fontSize: 48, fontWeight: 800, marginTop: 20 }}>No formula to remember</div>
        <Tex tex="(p-1)(q-1)" size={56} />
      </div>
    </div>
  );
};

// ----- traps -----
const SIX = PAIRS;
const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l: number[] = [0, 1, 2, 3].map((i) => at(scene, i, 0));
  const win = (i: number) => fadeTo(f, i < 3 ? l[i + 1] : 1e9, 0, 10) * ease(f, l[i], 8);
  const RowPairs = (list: [number, number][], y: number, start: number, col: string, bad?: number) =>
    list.map(([a, b], i) => <PairChip key={`${y}-${i}`} x={90 + i * 260} y={y} a={a} b={b} start={start + i * 5} color={col} bad={bad === i} />);
  const m6 = plane(1530, 800, 52);
  const miniOn = ease(f, l[1] + 20, 12);
  return (
    <>
      <ChoiceBar x={90} y={150} start={() => 0} reds={[l[3], l[2], l[1], null, l[0]]} />
      {/* E: flip all six */}
      <div style={{ opacity: win(0) }}>
        <Note x={90} y={265} start={l[0] + 4} size={40} color={C.muted} w={700}>flip all six</Note>
        {RowPairs(SIX, 320, l[0] + 6, C.primary)}
        {RowPairs(SIX.map(([a, b]) => [b, a] as [number, number]), 440, l[0] + 40, C.violet, 5)}
        <Note x={90 + 5 * 260 - 80} y={545} start={at(scene, 0, 0.7)} size={36} color={C.red} w={400}>same pair twice!</Note>
        <T x={90} y={600} tex="6 \times 2 = 12" size={64} start={at(scene, 0, 0.6)} color={C.red} />
      </div>
      {/* C: miss (6,6) */}
      <div style={{ opacity: win(1) }}>
        {RowPairs(SIX.slice(0, 5), 270, l[1] + 6, C.primary)}
        <PairChip x={90 + 5 * 280 - 60} y={270} a={6} b={6} start={l[1] + 10} dashed bad />
        {RowPairs(SIX.slice(0, 5).map(([a, b]) => [b, a] as [number, number]), 390, l[1] + 40, C.violet)}
        <T x={90} y={520} tex="5 \times 2 = 10" size={64} start={at(scene, 1, 0.5)} color={C.red} />
        <Note x={90} y={620} start={at(scene, 1, 0.6)} size={42} color={C.red} w={1000}>no (6, 6) in the list</Note>
        <Stage>
          <g opacity={miniOn}>
            <Grid cols={6} rows={6} m={m6} spec={(x, y) => { const c = classify(6, 6, x, y); return c === 'in' ? { fill: C.primary, r: 11 } : c === 'slant' ? { fill: C.violet, r: 14 } : c === 'edge' ? { fill: GREY, r: 8 } : { fill: BASE, r: 6 }; }} />
            <Poly pts={tri(6, 6).map(m6)} color={C.ink} width={5} />
          </g>
        </Stage>
        <Note x={1400} y={430} start={at(scene, 1, 0.7)} size={36} color={C.violet} w={480}>(6, 6): 5 slant dots</Note>
      </div>
      {/* B: 6 */}
      <div style={{ opacity: win(2) }}>
        <Note x={90} y={255} start={l[2] + 4} size={40} color={C.muted} w={700}>never flipped</Note>
        {RowPairs(SIX, 305, l[2] + 6, C.primary)}
        <T x={1690} y={313} tex="=6" size={56} start={l[2] + 40} color={C.red} />
        <Note x={90} y={430} start={at(scene, 2, 0.55)} size={40} color={C.muted} w={900}>or forgot the slant:</Note>
        <T x={620} y={420} tex="(p-1)(q-1)=20" size={52} start={at(scene, 2, 0.6)} />
        {RowPairs([[2, 21], [3, 11], [5, 6], [21, 2], [11, 3], [6, 5]], 520, at(scene, 2, 0.7), C.amber)}
        <T x={1690} y={528} tex="=6" size={56} start={at(scene, 2, 0.9)} color={C.red} />
      </div>
      {/* A: 5 */}
      <div style={{ opacity: win(3) }}>
        <Note x={90} y={255} start={l[3] + 4} size={40} color={C.muted} w={900}>only p smaller than q, never flipped</Note>
        {RowPairs(SIX.slice(0, 5), 320, l[3] + 10, C.primary)}
        <T x={1500} y={328} tex="=5" size={56} start={l[3] + 50} color={C.red} />
      </div>
    </>
  );
};

// ----- variant answer -----
const VM = plane(1100, 780, 62);
const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l2 = at(scene, 2, 0);
  const l6 = at(scene, 6, 0);
  const early = fadeTo(f, l2);
  const tab = fadeTo(f, l6);
  const done = at(scene, 6, 0.9);
  const rows: CaseRow[] = [
    { y: 200, rx: 1060, lab: 'p=2,\\ g\\in\\{1,2\\}', eq: () => '1(q-1)=12,\\,13', start: at(scene, 2, 0), resAt: at(scene, 2, 0.5), res: [{ q: 13, ok: true, note: '\\gcd\\,1' }, { q: 14, ok: true, note: '\\gcd\\,2' }] },
    { y: 310, rx: 1060, lab: 'p=3,\\ g\\in\\{1,3\\}', eq: () => '2(q-1)=12,\\,14', start: at(scene, 3, 0), resAt: at(scene, 3, 0.35), res: [{ q: 7, ok: true, note: '\\gcd\\,1' }, { q: 8, ok: false, note: '\\gcd\\,1' }] },
    {
      y: 420, rx: 1130, lab: 'p=4,\\ g\\in\\{1,2,4\\}', start: at(scene, 4, 0), strikeAt: at(scene, 4, 0.2), resAt: at(scene, 4, 0.35),
      eq: (s) => (s ? `3(q-1)=12,\\,${st('13', '')},\\,15` : '3(q-1)=12,\\,13,\\,15'),
      res: [{ q: 5, ok: true, note: '\\gcd\\,1' }, { q: 6, ok: false, note: '\\gcd\\,2' }],
    },
    { y: 530, rx: 1060, lab: 'p=5,\\ g\\in\\{1,5\\}', eq: () => '4(q-1)=12,\\,16', start: at(scene, 5, 0), resAt: at(scene, 5, 0.3), res: [{ q: 4, ok: null, note: '(4,5)\\ \\text{flipped}', grey: true, at: at(scene, 5, 0.3) }, { q: 5, ok: true, note: '\\gcd\\,5', at: at(scene, 5, 0.6) }] },
  ];
  const PV: [number, number][] = [[2, 13], [2, 14], [3, 7], [4, 5]];
  return (
    <>
      <KeyCorner on={ease(f, at(scene, 0, 0.9), 12)} tex="(p-1)(q-1)=11+g" />
      <div style={{ opacity: early }}>
        <T x={120} y={190} tex="2 \times 6 = 12" size={60} start={at(scene, 0, 0.1)} />
        <T x={120} y={290} tex="(p-1)(q-1)-(g-1)=12" size={56} start={at(scene, 0, 0.45)} />
        <T x={120} y={390} tex="(p-1)(q-1)=11+g" size={60} start={at(scene, 0, 0.8)} color={C.green} />
        <Stage>
          <g opacity={ease(f, at(scene, 1, 0), 12)}>
            <Grid cols={6} rows={6} m={VM} spec={(x, y) => { const c = classify(6, 6, x, y); return c === 'in' ? { fill: C.primary, r: 12 } : c === 'slant' ? { fill: C.violet, r: 15 } : c === 'edge' ? { fill: GREY, r: 9 } : { fill: BASE, r: 7 }; }} />
            <Poly pts={tri(6, 6).map(VM)} color={C.ink} width={6} />
          </g>
        </Stage>
        <T x={120} y={520} tex="25 - 5 = 20" size={60} start={at(scene, 1, 0.3)} />
        <T x={120} y={620} tex="20 \div 2 = 10 > 6" size={60} start={at(scene, 1, 0.55)} color={C.red} />
        <T x={120} y={720} tex="p \le 5" size={64} start={at(scene, 1, 0.8)} color={C.green} />
      </div>
      <div style={{ opacity: ease(f, l2, 10) * tab }}>
        <CaseTable rows={rows} head={l2 + 4} />
      </div>
      <div style={{ opacity: 0 }}>{f}</div>
      {PV.map(([a, b], i) => (
        <PairChip key={i} x={110 + i * 280} y={200} a={a} b={b} start={l6 + 6 + i * 5} color={C.primary} />
      ))}
      {PV.map(([a, b], i) => (
        <PairChip key={`f${i}`} x={110 + i * 280} y={330} a={b} b={a} start={at(scene, 6, 0.2) + i * 5} color={C.violet} />
      ))}
      <T x={110} y={470} tex="4 \times 2 = 8" size={64} start={at(scene, 6, 0.3)} />
      <PairChip x={110} y={580} a={5} b={5} start={at(scene, 6, 0.45)} color={C.primary} />
      <T x={110} y={690} tex="8 + 1" size={64} start={at(scene, 6, 0.55)} />
      <T x={330} y={690} tex="= 9" size={64} start={at(scene, 6, 0.68)} color={C.green} />
      <Answer x={1620} y={560} value="9" start={done} chime={CHIME} />
      <Confetti x={1620} y={560} start={at(scene, 6, 0.9)} seed={7} />
      <Pill x={1380} y={340} color={C.primary} style={{ ...fadeUp(f, at(scene, 6, 0.85)), fontSize: 40 }}>Fantastic work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2, 0));
  const step = (i: number, x: number, color: string, tex: string, title: string) => (
    <div key={i} style={{ position: 'absolute', left: x, top: 230, width: 500, height: 330, background: C.card, borderRadius: 32, boxShadow: '0 10px 40px rgba(30,40,80,0.09)', borderTop: `10px solid ${color}`, textAlign: 'center', ...fadeUp(f, at(scene, 0, 0.35 + i * 0.2)) }}>
      <div style={{ fontSize: 44, fontWeight: 900, color, marginTop: 36 }}>{i + 1}. {title}</div>
      <div style={{ marginTop: 40 }}>
        <Tex tex={tex} size={64} />
      </div>
    </div>
  );
  return (
    <>
      <div style={{ opacity: cardOut }}>
        {step(0, 90, C.primary, '(p-1)(q-1)', 'Rectangle')}
        {step(1, 710, C.violet, '-\\,(g-1)', 'Take the slant')}
        {step(2, 1320, C.green, '\\div\\,2', 'Split in half')}
        <Note x={300} y={620} start={at(scene, 1, 0.1)} size={54} color={C.amber} w={1400}>Keep the short leg small, then check each case</Note>
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
  try1: makePause(false, 10),
  rect: Rect,
  formula: Formula,
  bound: Bound,
  cases: Cases,
  count: Count,
  pick: Pick,
  traps: Traps,
  variant: Variant,
  try2: makePause(true, 10),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): a right triangle on the dot grid, inside dots green, no answer.
const TM = plane(50, 530, 72);
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>12?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      <Grid cols={8} rows={6} m={TM} spec={(x, y) => (classify(8, 5, x, y) === 'in' ? D_IN : base)} />
      <Poly pts={tri(8, 5).map(TM)} color={C.primary} fill={C.primary} width={8} progress={1} />
    </svg>
  </ThumbFrame>
);

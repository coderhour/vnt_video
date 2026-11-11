import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-five-rectangles-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const SHORT = '#7b61ff'; // short sides: always purple
export const LONG = '#0cc281'; // long sides: always green
export const LONG_T = '#08a56f'; // slightly darker green, for text
const BLOCK = '#3c83f6';
const FILL = '#e6e8f0';
const INK = '#333333';

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const sh = (t: string) => col(SHORT, t);
const lo = (t: string) => col(LONG_T, t);

// ---------- mixed maths + hanzi (hanzi never go inside KaTeX, whose \\text font is serif) ----------

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
const S: Part = { z: '短边', c: SHORT };
const L: Part = { z: '长边', c: LONG_T };
const KUAI = z('块');

// ---------- geometry: all in blocks (main: short 2, long 3; variant: short 3, long 4) ----------

type T = { x: number; y: number; w: number; h: number };
export const MAIN: T[] = [
  { x: 0, y: 0, w: 3, h: 2 },
  { x: 3, y: 0, w: 3, h: 2 },
  { x: 0, y: 2, w: 2, h: 3 },
  { x: 2, y: 2, w: 2, h: 3 },
  { x: 4, y: 2, w: 2, h: 3 },
];
const VAR: T[] = [
  ...range(3).map((i): T => ({ x: i * 4, y: 0, w: 4, h: 3 })),
  ...range(4).map((i): T => ({ x: i * 3, y: 3, w: 3, h: 4 })),
];

type FigP = {
  tiles: T[];
  ox: number;
  oy: number;
  px: number;
  op?: number[];
  grid?: number[];
  lift?: number[];
  emph?: number[];
  tags?: (string | null)[];
  tagOp?: number;
  tagColor?: string;
  outline?: number; // 0..1 ink outline of the big rectangle
  outlineGlow?: number;
};

const bounds = (tiles: T[]) => ({ W: Math.max(...tiles.map((t) => t.x + t.w)), H: Math.max(...tiles.map((t) => t.y + t.h)) });

export const Fig: React.FC<FigP> = ({ tiles, ox, oy, px, op, grid, lift, emph, tags, tagOp = 1, tagColor = INK, outline = 0, outlineGlow = 0 }) => {
  const { W, H } = bounds(tiles);
  const I = 5;
  return (
    <Stage>
      {outline > 0 && (
        <rect x={ox - 10} y={oy - 10} width={W * px + 20} height={H * px + 20} rx={6} fill="none" stroke={INK} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - outline} opacity={0.9} />
      )}
      {outlineGlow > 0 && <rect x={ox - 10} y={oy - 10} width={W * px + 20} height={H * px + 20} rx={6} fill="none" stroke={C.amber} strokeWidth={16} opacity={outlineGlow * 0.5} />}
      {tiles.map((t, i) => {
        const o = op?.[i] ?? 1;
        const g = (grid?.[i] ?? 0) * 0.55;
        const l = lift?.[i] ?? 0;
        const e = emph?.[i] ?? 0;
        const x0 = ox + t.x * px + I;
        const y0 = oy + t.y * px + I;
        const x1 = ox + (t.x + t.w) * px - I;
        const y1 = oy + (t.y + t.h) * px - I;
        const hc = t.w > t.h ? LONG : SHORT; // horizontal edges
        const vc = t.w > t.h ? SHORT : LONG;
        const sw = 6 + e * 5;
        const tag = tags?.[i];
        return (
          <g key={i} opacity={o} transform={`translate(0 ${-l * 22})`} style={{ filter: l > 0 ? `drop-shadow(0 ${l * 12}px ${l * 10}px rgba(30,40,80,0.25))` : undefined }}>
            <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={FILL} />
            {g > 0 && (
              <g stroke="#7f8aa3" strokeWidth={2.5} opacity={g}>
                {range(t.w - 1).map((k) => (
                  <line key={`v${k}`} x1={ox + (t.x + k + 1) * px} x2={ox + (t.x + k + 1) * px} y1={y0} y2={y1} />
                ))}
                {range(t.h - 1).map((k) => (
                  <line key={`h${k}`} y1={oy + (t.y + k + 1) * px} y2={oy + (t.y + k + 1) * px} x1={x0} x2={x1} />
                ))}
              </g>
            )}
            <g strokeWidth={sw} strokeLinecap="square">
              <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={hc} />
              <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={hc} />
              <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={vc} />
              <line x1={x1} y1={y0} x2={x1} y2={y1} stroke={vc} />
            </g>
            {tag && (
              <text x={(x0 + x1) / 2} y={(y0 + y1) / 2} fontFamily={NUNITO} fontWeight={900} fontSize={tag.length > 1 ? 52 : 72} fill={tagColor} opacity={tagOp} textAnchor="middle" dominantBaseline="central">
                {tag}
              </text>
            )}
          </g>
        );
      })}
    </Stage>
  );
};

// ---------- walking the outline of the main figure ----------

type Piece = { a: [number, number]; b: [number, number]; k: 'L' | 'S' };
const PIECES: Piece[] = [
  { a: [0, 0], b: [3, 0], k: 'L' },
  { a: [3, 0], b: [6, 0], k: 'L' },
  { a: [6, 0], b: [6, 2], k: 'S' },
  { a: [6, 2], b: [6, 5], k: 'L' },
  { a: [6, 5], b: [4, 5], k: 'S' },
  { a: [4, 5], b: [2, 5], k: 'S' },
  { a: [2, 5], b: [0, 5], k: 'S' },
  { a: [0, 5], b: [0, 2], k: 'L' },
  { a: [0, 2], b: [0, 0], k: 'S' },
];
const plen = (p: Piece) => Math.abs(p.b[0] - p.a[0]) + Math.abs(p.b[1] - p.a[1]);
const STARTS = PIECES.map((_, i) => PIECES.slice(0, i).reduce((s, p) => s + plen(p), 0));
const TOTAL = 22;

export const Walk: React.FC<{ ox: number; oy: number; px: number; dist: number; ink?: boolean; emph?: number[]; showDot?: boolean; ghost?: number }> = ({ ox, oy, px, dist, ink, emph = [], showDot = true, ghost = 0 }) => {
  const P = (pt: [number, number]) => [ox + pt[0] * px, oy + pt[1] * px] as const;
  let dot: readonly [number, number] = P(PIECES[0].a);
  PIECES.forEach((p, i) => {
    const t = Math.max(0, Math.min(1, (dist - STARTS[i]) / plen(p)));
    if (dist >= STARTS[i] && dist <= STARTS[i] + plen(p)) {
      const a = P(p.a);
      const b = P(p.b);
      dot = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
  });
  if (dist >= TOTAL) dot = P(PIECES[0].a);
  return (
    <Stage>
      {PIECES.map((p, i) => {
        const t = Math.max(0, Math.min(1, (dist - STARTS[i]) / plen(p)));
        const a = P(p.a);
        const b = P(p.b);
        const c = ink ? INK : p.k === 'L' ? LONG : SHORT;
        const e = emph[i] ?? 0;
        return (
          <g key={i} strokeLinecap="square">
            {ghost > 0 && <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#b8bfd0" strokeWidth={8} opacity={ghost} />}
            {t > 0 && <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * t} y2={a[1] + (b[1] - a[1]) * t} stroke={c} strokeWidth={13 + e * 9} />}
          </g>
        );
      })}
      {showDot && dist > 0 && dist < TOTAL && <circle cx={dot[0]} cy={dot[1]} r={19} fill="#fff" stroke={INK} strokeWidth={7} />}
    </Stage>
  );
};

// ---------- small helpers ----------

const Eq: React.FC<{ x: number; y: number; start: number; tex: string | Part[]; size?: number; color?: string; out?: number }> = ({ x, y, start, tex, size = 52, color = C.ink, out = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start), opacity: ease(f, start, 14) * out }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number }> = ({ x, y, start, color, children, size = 42, w }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: w ? 'normal' : 'nowrap', width: w, textAlign: w ? 'center' : undefined, borderRadius: w ? 36 : 999 }}>
      {children}
    </Pill>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

/** Segmented bar: one coloured piece per tile edge. */
const SegBar: React.FC<{ y: number; segs: [number, number][]; color: string; op: number; ox: number; px: number }> = ({ y, segs, color, op, ox, px }) =>
  op <= 0 ? null : (
    <g opacity={op} stroke={color} strokeWidth={16} strokeLinecap="butt">
      {segs.map(([a, b], i) => (
        <line key={i} x1={ox + a * px + 4} x2={ox + b * px - 4} y1={y} y2={y} />
      ))}
    </g>
  );

/** Measuring bracket. `dir` h = above a width, v = beside a height. */
const Brace: React.FC<{ a: number; b: number; at: number; dir: 'h' | 'v'; op: number; color?: string; prog?: number }> = ({ a, b, at: p, dir, op, color = BLOCK, prog = 1 }) => {
  if (op <= 0) return null;
  const e = a + (b - a) * prog;
  const d = dir === 'h' ? `M ${a} ${p + 14} V ${p} H ${e} V ${p + 14}` : `M ${p - 14} ${a} H ${p} V ${e} H ${p - 14}`;
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
};

const PauseText: React.FC<{ x: number; y: number; w: number; size?: number; children: React.ReactNode }> = ({ x, y, w, size = 44, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
      {children}
    </div>
  );
};

const Wordmark: React.FC<{ x: number; y: number; start: number; size?: number; sub?: string }> = ({ x, y, start, size = 110, sub = '你的数学小导师' }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, ...fadeUp(f, start) }}>
      <div style={{ fontFamily: PACIFICO, fontSize: size, color: C.violet }}>Vantee</div>
      <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>{sub}</div>
    </div>
  );
};

const pulse = (f: number, s: number, d = 40) => Math.sin(Math.min(1, Math.max(0, (f - s) / d)) * Math.PI);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 110;
  const oy = 200;
  const px = 125;
  const lift = pulse(f, at(scene, 1, 0.15), 60);
  const lifted = f > at(scene, 1, 0.15) ? 1 : 0;
  return (
    <>
      <Fig
        tiles={MAIN}
        ox={ox}
        oy={oy}
        px={px}
        outline={ease(f, 6, 30)}
        outlineGlow={pulse(f, at(scene, 0, 0.3), 70) * 0.8}
        lift={[0, Math.max(lift, lifted * 0.0), 0, 0, 0].map((v, i) => (i === 1 ? Math.max(v, lifted) * ease(f, at(scene, 1, 0.15), 14) : 0))}
        tags={[null, '?', null, null, null]}
        tagOp={ease(f, at(scene, 1, 0.3), 12)}
      />
      <Tag x={ox + 3 * px - 70} y={oy - 78} start={at(scene, 0, 0.45)} color={INK} size={46}>
        66
      </Tag>
      <Text x={1000} y={210} w={880} size={96} weight={900} style={fadeUp(f, at(scene, 0, 0.1))}>
        5个长方形
      </Text>
      <Text x={1000} y={330} w={880} size={80} weight={900} color={C.muted} style={fadeUp(f, at(scene, 0, 0.45))}>
        周长 66
      </Text>
      <Text x={1000} y={440} w={880} size={52} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.7))}>
        一条边长都没给
      </Text>
      <Tag x={1000} y={560} start={at(scene, 1, 0.1)} color={C.violet} size={44}>
        一个小长方形的面积 = ?
      </Tag>
      <Wordmark x={1000} y={680} start={at(scene, 2, 0.2)} />
    </>
  );
};

export const CH = ['36', '45', '54', '72', '81'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const ox = 1150;
  const oy = 190;
  const px = 100;
  const nums = range(5).map((i) => String(i + 1));
  const numOp = ease(f, at(scene, 1, 0.5), 8) * fadeTo(f, at(scene, 2), 0, 10);
  const hi = f > at(scene, 3, 0.3) ? 1 : 0;
  const ph = ease(f, at(scene, 3, 0.3), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 140, width: 960, background: C.card, borderRadius: 32, padding: '28px 44px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 6, 10) }}>
        <span style={s(1)}>5个完全相同的小长方形拼成一个大长方形，如图所示。</span>
        <span style={s(2)}>大长方形的周长是 66。</span>
        <span style={s(3)}>一个小长方形的面积是多少？</span>
      </div>
      <Fig
        tiles={MAIN}
        ox={ox}
        oy={oy}
        px={px}
        tags={nums.map((n, i) => (f > at(scene, 3, 0.3) && i === 1 ? '?' : n))}
        tagOp={Math.max(numOp, ph)}
        lift={[0, ph, 0, 0, 0]}
        op={[1, 1, 1, 1, 1].map((v, i) => (hi && i !== 1 ? 1 - 0.55 * ph : v))}
        outline={ease(f, at(scene, 2, 0.1), 40)}
      />
      <Tag x={ox + 100} y={oy + 530} start={at(scene, 2, 0.3)} color={INK} size={44}>
        周长 66
      </Tag>
      <Tag x={ox + 100} y={oy + 625} start={at(scene, 3, 0.4)} color={C.violet} size={44}>
        面积 = ?
      </Tag>
      <div style={{ position: 'absolute', left: 80, top: 600, display: 'flex', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={i} style={{ ...fadeUp(f, at(scene, 4, 0.2 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '12px 26px', fontSize: 56, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 34, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 100;
  const oy = 200;
  const px = 120;
  const one = ease(f, at(scene, 1, 0.1), 14);
  const pul = pulse(f, at(scene, 0, 0.4), 50);
  return (
    <>
      <Fig
        tiles={MAIN}
        ox={ox}
        oy={oy}
        px={px}
        emph={range(5).map((i) => (i === 1 ? one : pul * 0.6))}
        op={range(5).map((i) => (i === 1 ? 1 : 1 - 0.55 * one))}
      />
      <Text x={ox + 4.5 * px} y={oy - 62} w={300} size={52} weight={900} color={LONG_T} align="center" style={{ opacity: one }}>
        长边
      </Text>
      <Text x={ox + 6 * px + 24} y={oy + px - 36} w={200} size={52} weight={900} color={SHORT} style={{ opacity: one }}>
        短边
      </Text>
      <Tag x={1010} y={220} start={at(scene, 0, 0.2)} color={C.violet} size={46} w={820}>
        完全相同 = 短边、长边都一样
      </Tag>
      <Eq x={1010} y={400} start={at(scene, 1, 0.3)} tex={[S, '\\qquad', L]} size={60} />
      <Tag x={1010} y={560} start={at(scene, 2, 0.3)} color={C.green} size={52}>
        目标：短边 × 长边
      </Tag>
    </>
  );
};

const QTXT = <>5个完全相同的小长方形拼成一个周长为 <b>66</b> 的大长方形。一个小长方形的面积是多少？</>;
const PAUSE_LABEL = <span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>;
const Pause1: SceneComponent = ({ scene }) => (
  <>
    <Fig tiles={MAIN} ox={100} oy={230} px={90} />
    <PauseText x={700} y={160} w={720}>
      {QTXT}
    </PauseText>
    <div style={{ position: 'absolute', left: 700, top: 480, display: 'flex', gap: 14 }}>
      {CH.map((c, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 18, padding: '10px 18px', fontSize: 46, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
          <span style={{ color: C.muted, fontSize: 30, marginRight: 8 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
    <Countdown scene={scene} seconds={10} x={1660} y={500} tick={TICK} label={PAUSE_LABEL} />
  </>
);

const Match: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 170;
  const oy = 230;
  const px = 108;
  const { W, H } = bounds(MAIN);
  const topY = oy - 28;
  const botY = oy + H * px + 28;
  const topOn = ease(f, at(scene, 0, 0.45), 14);
  const botOn = ease(f, at(scene, 0, 0.8), 14);
  const colOn = ease(f, at(scene, 1, 0.05), 14);
  const eq = ease(f, at(scene, 2, 0.05), 14);
  return (
    <>
      <Fig tiles={MAIN} ox={ox} oy={oy} px={px} />
      <Stage>
        <SegBar y={topY} segs={[[0, 3], [3, 6]]} color="#9aa3b2" op={topOn * (1 - colOn)} ox={ox} px={px} />
        <SegBar y={botY} segs={[[0, 2], [2, 4], [4, 6]]} color="#9aa3b2" op={botOn * (1 - colOn)} ox={ox} px={px} />
        <SegBar y={topY} segs={[[0, 3], [3, 6]]} color={LONG} op={colOn} ox={ox} px={px} />
        <SegBar y={botY} segs={[[0, 2], [2, 4], [4, 6]]} color={SHORT} op={colOn} ox={ox} px={px} />
        {eq > 0 && (
          <g stroke={C.amber} strokeWidth={5} strokeDasharray="14 10" opacity={eq}>
            <line x1={ox} x2={ox} y1={topY - 16} y2={botY + 16} />
            <line x1={ox + W * px} x2={ox + W * px} y1={topY - 16} y2={botY + 16} />
          </g>
        )}
      </Stage>
      <Eq x={1000} y={200} start={at(scene, 1, 0.05)} tex={[z('上边：'), L, '+', L]} size={56} />
      <Eq x={1000} y={300} start={at(scene, 1, 0.55)} tex={[z('下边：'), S, '+', S, '+', S]} size={50} />
      <Tag x={1000} y={420} start={at(scene, 2, 0.05)} color={C.amber} size={44}>
        一样宽！
      </Tag>
      <Eq x={1000} y={540} start={at(scene, 2, 0.4)} tex={['2', L, '=3', S]} size={90} />
    </>
  );
};

const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 130;
  const oy = 250;
  const px = 100;
  const { W, H } = bounds(MAIN);
  const one = ease(f, at(scene, 0, 0.5), 14);
  const all = ease(f, at(scene, 3, 0.0), 16);
  const small = ease(f, at(scene, 1, 0.4), 12) * (1 - ease(f, at(scene, 3, 0), 8));
  const smallTop = ease(f, at(scene, 1, 0.78), 12) * (1 - ease(f, at(scene, 3, 0), 8));
  const dimOthers = one * (1 - all);
  return (
    <>
      <Fig
        tiles={MAIN}
        ox={ox}
        oy={oy}
        px={px}
        grid={range(5).map((i) => (i === 1 ? one : all))}
        op={range(5).map((i) => (i === 1 ? 1 : 1 - 0.55 * dimOthers))}
      />
      <Stage>
        <Brace a={ox + 3 * px} b={ox + W * px} at={oy - 36} dir="h" op={smallTop} />
        <Brace a={ox} b={ox + W * px} at={oy - 36} dir="h" op={ease(f, at(scene, 3, 0.1), 14)} prog={ease(f, at(scene, 3, 0.1), 18)} />
        <Brace a={oy + 0} b={oy + 2 * px} at={ox + W * px + 36} dir="v" op={small} color={SHORT} />
        <Brace a={oy} b={oy + 2 * px} at={ox + W * px + 36} dir="v" op={ease(f, at(scene, 4, 0.1), 14)} color={SHORT} />
        <Brace a={oy + 2 * px} b={oy + H * px} at={ox + W * px + 36} dir="v" op={ease(f, at(scene, 4, 0.2), 14)} color={LONG} />
      </Stage>
      <Text x={ox + 4.5 * px} y={oy - 112} w={3 * px} size={48} weight={900} color={LONG_T} align="center" style={{ opacity: smallTop, whiteSpace: 'nowrap' }}>
        3块
      </Text>
      <Text x={ox + W * px + 70} y={oy + px - 30} w={260} size={48} weight={900} color={SHORT} style={{ opacity: small, whiteSpace: 'nowrap' }}>
        2块
      </Text>
      <Text x={ox + (W * px) / 2} y={oy - 112} w={W * px} size={52} weight={900} color={BLOCK} align="center" style={{ opacity: ease(f, at(scene, 3, 0.1), 14), whiteSpace: 'nowrap' }}>
        6块
      </Text>
      <Eq x={1100} y={200} start={at(scene, 2, 0.1)} tex={['2', L, '= 3\\times 2 = 6', KUAI]} size={54} />
      <Eq x={1100} y={290} start={at(scene, 2, 0.45)} tex={['3', S, '= 2\\times 3 = 6', KUAI]} size={54} />
      <Tag x={1100} y={390} start={at(scene, 2, 0.8)} color={C.green} size={44}>
        6 = 6，对上了！
      </Tag>
      <Eq x={ox + W * px + 70} y={oy + 2.5 * px} start={at(scene, 4, 0.3)} tex={[`${sh('2')}+${lo('3')}=5`, KUAI]} size={56} />
    </>
  );
};

const BlockSize: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 130;
  const oy = 250;
  const px = 100;
  const dist = TOTAL * ease(f, at(scene, 0, 0.1), Math.round(scene.lines[0].frames * 0.85));
  const lab6 = ease(f, at(scene, 2, 0.4), 10);
  const lab9 = ease(f, at(scene, 2, 0.82), 10);
  const done = at(scene, 3, 0.99);
  const cOn = f >= done ? 1 : 0;
  return (
    <>
      <Fig tiles={MAIN} ox={ox} oy={oy} px={px} grid={[0.6, 0.6, 0.6, 0.6, 0.6]} />
      <Walk ox={ox} oy={oy} px={px} dist={dist} ink showDot />
      <Text x={ox + 1.5 * px} y={oy - 76} w={3 * px} size={52} weight={900} color={LONG_T} align="center" style={{ opacity: lab9 }}>
        9
      </Text>
      <Text x={ox - 80} y={oy + px - 36} w={60} size={52} weight={900} color={SHORT} align="center" style={{ opacity: lab6 }}>
        6
      </Text>
      <Eq x={820} y={170} start={at(scene, 0, 0.1)} tex={[z('周长'), '= 6 + 5 + 6 + 5 = 22', KUAI]} size={50} />
      <Eq x={820} y={255} start={at(scene, 1, 0.1)} tex={['22', KUAI, '= 66']} size={54} />
      <Eq x={820} y={335} start={at(scene, 1, 0.5)} tex={['1', KUAI, '= 66 \\div 22 = 3']} size={54} color={BLOCK} />
      <Eq x={820} y={410} start={at(scene, 2, 0.15)} tex={[S, '= 2\\times 3 = 6']} size={52} />
      <Eq x={820} y={480} start={at(scene, 2, 0.62)} tex={[L, '= 3\\times 3 = 9']} size={52} />
      <Eq x={820} y={560} start={at(scene, 3, 0.1)} tex={'6\\times 9'} size={78} color={C.green} />
      <Eq x={820} y={560} start={at(scene, 3, 0.75)} tex={'6\\times 9 = 54'} size={78} color={C.green} />
      <Answer x={1760} y={640} value="54" start={done} chime={CHIME} />
      <div style={{ position: 'absolute', left: 820, top: 660, display: 'flex', gap: 14, ...fadeUp(f, at(scene, 3, 0.4), 10) }}>
        {CH.map((c, i) => {
          const win = i === 2 && cOn;
          return (
            <div key={i} style={{ background: win ? C.green : C.card, color: win ? '#fff' : C.ink, borderRadius: 18, padding: '10px 18px', fontSize: 46, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', opacity: i === 2 || !cOn ? 1 : 0.4 }}>
              <span style={{ opacity: 0.6, fontSize: 30, marginRight: 8 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      <Eq x={820} y={760} start={at(scene, 4, 0.1)} tex={[z('大长方形：长'), '18', z('宽'), '15 \\to 2\\times(18+15)=66\\ \\checkmark']} size={46} />
    </>
  );
};

const Walking: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 110;
  const oy = 230;
  const px = 110;
  const l0 = scene.lines[0];
  const dist = TOTAL * ease(f, at(scene, 0, 0.3), Math.round(l0.frames * 0.7));
  const e1 = pulse(f, at(scene, 1, 0.0), 30);
  const e2 = pulse(f, at(scene, 1, 0.26), 30);
  const e3 = pulse(f, at(scene, 1, 0.5), 40);
  const emph = [e1, e1, e3, e3, e2, e2, e2, e3, e3];
  const X = 920;
  return (
    <>
      <Fig tiles={MAIN} ox={ox} oy={oy} px={px} />
      <Walk ox={ox} oy={oy} px={px} dist={dist} emph={emph} showDot={dist < TOTAL} ghost={0.5} />
      <Eq x={X} y={160} start={at(scene, 1, 0.02)} tex={[z('上边：'), '2', L]} size={48} />
      <Eq x={X} y={225} start={at(scene, 1, 0.26)} tex={[z('下边：'), '3', S]} size={48} />
      <Eq x={X} y={290} start={at(scene, 1, 0.5)} tex={[z('左右各：'), '1', S, '+1', L]} size={48} />
      <Eq x={X} y={365} start={at(scene, 2, 0.2)} tex={['4', L, '+5', S, '=66']} size={60} />
      <Eq x={X} y={455} start={at(scene, 3, 0.05)} tex={['4', L, '= 2\\times(2', L, ')']} size={50} />
      <Eq x={X} y={520} start={at(scene, 3, 0.4)} tex={['= 2\\times(3', S, ') = 6', S]} size={50} />
      <Eq x={X} y={605} start={at(scene, 4, 0.0)} tex={['6', S, '+5', S, '=11', S]} size={50} out={fadeTo(f, at(scene, 5), 1)} />
      <Eq x={X} y={685} start={at(scene, 4, 0.4)} tex={['11', S, '=66 \\ \\to\\ ', S, '=6']} size={50} />
      <Eq x={X} y={765} start={at(scene, 4, 0.72)} tex={['2', L, '=3\\times 6=18 \\ \\to\\ ', L, '=9']} size={50} />
      <Text x={ox + 330} y={oy - 78} w={660} size={46} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 5, 0.3))}>
        数一数边上有几段
      </Text>
    </>
  );
};

const Chip: React.FC<{ i: number; formula?: string; start: number; state: 'none' | 'bad' | 'good' }> = ({ i, formula, start, state }) => {
  const f = useCurrentFrame();
  const c = state === 'bad' ? C.red : state === 'good' ? C.green : C.line;
  return (
    <div style={{ position: 'absolute', left: 90 + i * 350, top: 150, width: 320, height: 170, background: C.card, borderRadius: 22, border: `7px solid ${c}`, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', textAlign: 'center' }}>
      <div style={{ fontSize: 62, fontWeight: 900, color: state === 'bad' ? C.red : state === 'good' ? C.green : C.ink, marginTop: 8 }}>
        <span style={{ color: C.muted, fontSize: 34, marginRight: 10 }}>{'ABCDE'[i]}</span>
        {CH[i]}
      </div>
      {formula && <div style={{ fontSize: 46, fontWeight: 800, color: C.ink, ...fadeUp(f, start, 10) }}>{formula}</div>}
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const st = (i: number, at_: number): 'none' | 'bad' | 'good' => (f >= at_ ? (i === 2 ? 'good' : 'bad') : 'none');
  const note1 = fadeTo(f, at(scene, 2), 0, 10);
  return (
    <>
      <Chip i={0} start={at(scene, 0, 0.55)} formula="6 × 6" state={st(0, at(scene, 0, 0.75))} />
      <Chip i={4} start={at(scene, 1, 0.1)} formula="9 × 9" state={st(4, at(scene, 1, 0.3))} />
      <Chip i={2} start={at(scene, 7, 0.5)} formula={f >= at(scene, 7, 0.5) ? '6 × 9' : undefined} state={st(2, at(scene, 7, 0.6))} />
      <Chip i={3} start={at(scene, 5, 0.6)} formula="8 × 9" state={st(3, at(scene, 6, 0.7))} />
      <Chip i={1} start={at(scene, 2, 0.4)} formula={f >= at(scene, 2, 0.4) ? "5 × 9" : undefined} state={st(1, at(scene, 4, 0.4))} />
      <Fade op={note1}>
        <Eq x={110} y={390} start={at(scene, 0, 0.6)} tex={['36 = 6\\times 6:\\ ', S, '\\times', S]} size={52} />
        <Eq x={110} y={480} start={at(scene, 1, 0.4)} tex={['81 = 9\\times 9:\\ ', L, '\\times', L]} size={52} />
        <Tag x={110} y={580} start={at(scene, 1, 0.7)} color={C.red} size={46}>
          不是正方形！
        </Tag>
      </Fade>
      <Eq x={110} y={380} start={at(scene, 2, 0.1)} tex={[z('检验：'), '3', S, '= 2', L, '\\ ?']} size={56} />
      <Eq x={110} y={470} start={at(scene, 2, 0.55)} tex={`45 = 5\\times 9:\\ \\ ${sh('3\\times 5=15')}\\ \\ ${lo('2\\times 9=18')}`} size={52} />
      <Eq x={110} y={560} start={at(scene, 4, 0.1)} tex={'15 \\neq 18'} size={64} color={C.red} />
      <Eq x={110} y={650} start={at(scene, 6, 0.0)} tex={`72 = 8\\times 9:\\ \\ ${sh('3\\times 8=24')} \\neq 18`} size={52} color={C.ink} />
      <Eq x={110} y={745} start={at(scene, 7, 0.1)} tex={`${sh('3\\times 6=18')} = ${lo('2\\times 9=18')}\\ \\checkmark`} out={f >= at(scene, 7, 0.65) ? 0 : 1} size={52} color={C.green} />
      <Eq x={110} y={745} start={at(scene, 7, 0.65)} tex={[`${sh('3\\times 6=18')} = ${lo('2\\times 9=18')}\\ \\checkmark`, z('，周长'), '66\\ \\checkmark']} size={52} color={C.green} />
    </>
  );
};

const VAR_Q = <>7个完全相同的小长方形拼成一个周长为 <b>76</b> 的大长方形。一个小长方形的面积是多少？</>;

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 100;
  const oy = 250;
  const px = 70;
  const sel = ease(f, at(scene, 2, 0.5), 14);
  return (
    <>
      <Fig
        tiles={VAR}
        ox={ox}
        oy={oy}
        px={px}
        outline={ease(f, at(scene, 2, 0.05), 40)}
        lift={range(7).map((i) => (i === 1 ? sel : 0))}
        op={range(7).map((i) => (i === 1 ? 1 : 1 - 0.5 * sel))}
        tags={range(7).map((i) => (i === 1 ? '?' : null))}
        tagOp={sel}
      />
      <Text x={1000} y={210} w={880} size={80} weight={900} style={fadeUp(f, at(scene, 0, 0.1))}>
        轮到你了！
      </Text>
      <Text x={1000} y={340} w={880} size={54} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.3))}>
        7个完全相同的小长方形
      </Text>
      <Text x={1000} y={420} w={880} size={50} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.55))}>
        上面横放3个，下面竖放4个
      </Text>
      <Tag x={1000} y={530} start={at(scene, 2, 0.1)} color={INK} size={50}>
        周长 76
      </Tag>
      <Tag x={1000} y={630} start={at(scene, 2, 0.5)} color={C.violet} size={50}>
        面积 = ?
      </Tag>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => (
  <>
    <PauseText x={110} y={150} w={1200} size={46}>
      {VAR_Q}
    </PauseText>
    <Fig tiles={VAR} ox={150} oy={430} px={58} />
    <Countdown scene={scene} seconds={10} x={1660} y={500} tick={TICK} label={PAUSE_LABEL} />
  </>
);

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 90;
  const oy = 280;
  const px = 70;
  const { W, H } = bounds(VAR);
  const t0 = ease(f, at(scene, 0, 0.1), 14);
  const bars = ease(f, at(scene, 0, 0.3), 14);
  const g0 = ease(f, at(scene, 1, 0.1), 14);
  const gAll = ease(f, at(scene, 1, 0.7), 16);
  const h = ease(f, at(scene, 2, 0.1), 14);
  const X = 990;
  const topY = oy - 26;
  const botY = oy + H * px + 26;
  const ans = at(scene, 6, 0.99);
  const out = 1 - ease(f, at(scene, 6, 0.0), 10);
  return (
    <>
      <Fig tiles={VAR} ox={ox} oy={oy} px={px} grid={range(7).map((i) => (i === 0 ? g0 : gAll))} />
      <Stage>
        <SegBar y={topY} segs={[[0, 4], [4, 8], [8, 12]]} color={LONG} op={bars} ox={ox} px={px} />
        <SegBar y={botY} segs={[[0, 3], [3, 6], [6, 9], [9, 12]]} color={SHORT} op={bars} ox={ox} px={px} />
        <Brace a={ox} b={ox + W * px} at={oy - 74} dir="h" op={gAll} />
        <Brace a={oy} b={oy + H * px} at={ox + W * px + 30} dir="v" op={h} />
      </Stage>
      <Text x={ox + (W * px) / 2} y={oy - 145} w={W * px} size={50} weight={900} color={BLOCK} align="center" style={{ opacity: gAll, whiteSpace: 'nowrap' }}>
        12块
      </Text>
      <Fade op={out}>
        <Eq x={X} y={160} start={at(scene, 0, 0.1)} tex={['3', L, '=4', S]} size={62} />
        <Eq x={X} y={240} start={at(scene, 1, 0.1)} tex={[S, '= 3', KUAI]} size={50} />
        <Eq x={X} y={302} start={at(scene, 1, 0.4)} tex={[L, '= 4', KUAI]} size={50} />
        <Eq x={X} y={364} start={at(scene, 1, 0.7)} tex={'3\\times 4 = 4\\times 3 = 12'} size={50} />
        <Eq x={X} y={426} start={at(scene, 2, 0.1)} tex={[`${sh('3')}+${lo('4')}=7`, KUAI]} size={50} />
        <Eq x={X} y={488} start={at(scene, 3, 0.1)} tex={['12+7+12+7 = 38', KUAI]} size={50} />
        <Eq x={X} y={550} start={at(scene, 4, 0.1)} tex={['38', KUAI, '= 76']} size={50} />
        <Eq x={X} y={612} start={at(scene, 4, 0.55)} tex={['1', KUAI, '= 76\\div 38 = 2']} size={50} color={BLOCK} />
      </Fade>
      <Eq x={X} y={680} start={at(scene, 5, 0.15)} tex={[S, '=3\\times 2=6']} size={46} out={1} />
      <Eq x={X} y={745} start={at(scene, 5, 0.6)} tex={[L, '=4\\times 2=8']} size={46} out={1} />
      <Eq x={X} y={300} start={at(scene, 6, 0.1)} tex={'6\\times 8'} size={90} color={C.green} />
      <Eq x={X} y={300} start={at(scene, 6, 0.85)} tex={'6\\times 8 = 48'} size={90} color={C.green} />
      <Answer x={1560} y={560} value="48" start={ans} chime={CHIME} />
      <Confetti x={1560} y={500} start={at(scene, 7, 0.1)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 4), 0, 12);
  const steps: [string, number, string][] = [
    ['1  对一对边', at(scene, 1, 0.2), SHORT],
    ['2  用一样大的方块来量', at(scene, 2, 0.2), BLOCK],
    ['3  周长 → 一块有多大', at(scene, 3, 0.15), C.amber],
    ['4  短边 × 长边 → 面积', at(scene, 3, 0.6), C.green],
  ];
  return (
    <>
      <Fade op={out}>
        <Fig tiles={[{ x: 0, y: 0, w: 3, h: 2 }]} ox={150} oy={300} px={120} grid={[ease(f, at(scene, 2, 0.1), 12)]} />
        <Text x={150} y={170} w={800} size={64} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>
          核心思路
        </Text>
        {steps.map(([t, s, c], i) => (
          <div key={i} style={{ position: 'absolute', left: 700, top: 230 + i * 130, ...fadeUp(f, s, 12) }}>
            <div style={{ background: c, borderRadius: 30, padding: '14px 36px', fontSize: 50, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>{t}</div>
          </div>
        ))}
      </Fade>
      <SignOff start={at(scene, 4, 0.1)} text="继续动手拼一拼！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 4, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  match: Match,
  blocks: Blocks,
  'block-size': BlockSize,
  walk: Walking,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

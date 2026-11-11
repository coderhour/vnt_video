import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';

export const SLUG = '2026-11-07-no-double-triple';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const GREEN = C.primary; // chessboard colour 1 (even number of twos + threes)
export const PURPLE = C.violet; // chessboard colour 2
export const DARK = '#2b2b2b';
export const CHOICES = ['50', '58', '61', '64', '67'];
export const SOFT_GREEN = 'rgba(12,194,129,0.26)';
export const SOFT_PURPLE = 'rgba(123,97,255,0.22)';

// ---------- the numbers: a core, and its family on the grid ----------

export type Cell = { n: number; c: number; r: number }; // c = number of twos (right), r = number of threes (up)

export const famCells = (m: number, N = 100): Cell[] => {
  const out: Cell[] = [];
  for (let b = 0; m * 3 ** b <= N; b++) for (let a = 0; m * 2 ** a * 3 ** b <= N; a++) out.push({ n: m * 2 ** a * 3 ** b, c: a, r: b });
  return out;
};
const isGreen = (k: Cell) => (k.c + k.r) % 2 === 0;
const cs = (m: number, spec: [number, number][]): Cell[] => spec.map(([c, r]) => ({ n: m * 2 ** c * 3 ** r, c, r }));

// ---------- text helpers ----------

const Tag: React.FC<{ x: number; y: number; start: number; color?: string; children?: React.ReactNode; size?: number; opacity?: number; w?: number; center?: boolean; weight?: number }> = ({
  x, y, start, color = C.ink, children, size = 48, opacity = 1, w, center, weight = 900,
}) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const o = (s.opacity as number) * opacity;
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: center ? x - (w ?? 800) / 2 : x, top: y, width: w, textAlign: center ? 'center' : 'left', fontSize: size, fontWeight: weight, color, whiteSpace: w ? 'normal' : 'nowrap', lineHeight: 1.25, ...s, opacity: o }}>
      {children}
    </div>
  );
};

/** Pieces of maths that each fade up at their own frame, laid out in a row. */
const Parts: React.FC<{ x: number; y: number; parts: [number, string, string?][]; size?: number; opacity?: number; center?: boolean; gap?: number }> = ({
  x, y, parts, size = 64, opacity = 1, center = false, gap = 14,
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

/** A red or green badge with a mark in it. */
const Badge: React.FC<{ x: number; y: number; start: number; ok?: boolean; size?: number }> = ({ x, y, start, ok, size = 64 }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  if (f < start) return null;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: ok ? C.green : C.red, color: '#fff', fontSize: size * 0.62, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})` }}>
      {ok ? '✓' : '✗'}
    </div>
  );
};

/** Answer badge with room for text such as "C · 61" (or a round one for a bare number). */
const AnswerPill: React.FC<{ x: number; y: number; value: string; start: number; size?: number; round?: boolean }> = ({ x, y, value, start, size = 110, round }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {f >= start && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, background: C.green, color: '#fff', borderRadius: round ? '50%' : 80, width: round ? 240 : undefined, height: round ? 240 : undefined, padding: round ? 0 : '14px 56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};

// ---------- the family grid ----------

type GridProps = {
  cells: Cell[];
  ox: number; // left edge of the bottom-left cell
  oy: number; // top edge of the bottom row
  size: number;
  gap?: number;
  font?: number; // 0 = no digits
  appear?: number | ((k: Cell) => number);
  color?: number | null | ((k: Cell) => number | null); // frame at which chessboard colours wipe in (diagonally)
  purpleOp?: number;
  opacity?: number;
  checks?: [number, number, number?][]; // [number, frame, fade-out frame]
  dominoes?: [number, number, number][]; // [a, b, frame]
  rings?: [number, number][]; // [number, frame]
  hl?: { ns: number[]; at: number; out?: number; color?: string }[];
  bridges?: { a: number; b: number; at: number; color?: string }[];
};

export const NumGrid: React.FC<GridProps> = ({ cells, ox, oy, size, gap = 8, font = 48, appear = 0, color = null, purpleOp = 1, opacity = 1, checks = [], dominoes = [], rings = [], hl = [], bridges = [] }) => {
  const f = useCurrentFrame();
  const pitch = size + gap;
  const pos = (k: Cell): [number, number] => [ox + k.c * pitch, oy - k.r * pitch];
  const byN = new Map(cells.map((k) => [k.n, k]));
  const radius = Math.round(size * 0.2);
  const badge = Math.max(30, Math.round(size * 0.38));
  const apAt = (k: Cell) => (typeof appear === 'number' ? appear : appear(k));
  if (opacity <= 0 || f < Math.min(...cells.map(apAt))) return null;
  return (
    <div style={{ opacity }}>
      {cells.map((k) => {
        const [x, y] = pos(k);
        const ap = ease(f, apAt(k), 10);
        const colAt = typeof color === 'function' ? color(k) : color;
        const cp = colAt === null ? 0 : ease(f, colAt + (k.c + k.r) * 3, 10);
        const g = isGreen(k);
        const col = g ? GREEN : PURPLE;
        if (ap <= 0) return null;
        return (
          <div key={k.n} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: radius, opacity: ap * (g || cp < 0.5 ? 1 : purpleOp), transform: `scale(${0.82 + 0.18 * ap})`, background: C.card, border: `4px solid ${C.line}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: font, fontWeight: 800, color: C.ink }}>
            <div style={{ position: 'absolute', inset: -4, borderRadius: radius, background: g ? SOFT_GREEN : SOFT_PURPLE, border: `4px solid ${col}`, opacity: cp, boxSizing: 'border-box' }} />
            {font > 0 && <span style={{ position: 'relative' }}>{k.n}</span>}
          </div>
        );
      })}
      {dominoes.map(([a, b, t]) => {
        const ka = byN.get(a)!, kb = byN.get(b)!;
        const p = ease(f, t, 12);
        if (p <= 0) return null;
        const [xa, ya] = pos(ka), [xb, yb] = pos(kb);
        const x = Math.min(xa, xb), y = Math.min(ya, yb);
        const w = Math.abs(xa - xb) + size, h = Math.abs(ya - yb) + size;
        return <div key={`d${a}`} style={{ position: 'absolute', left: x - 3, top: y - 3, width: w + 6, height: h + 6, borderRadius: radius + 8, border: `${Math.max(4, Math.round(size / 17))}px solid ${DARK}`, boxSizing: 'border-box', opacity: p, transform: `scale(${0.94 + 0.06 * p})` }} />;
      })}
      {rings.map(([n, t]) => {
        const k = byN.get(n)!;
        const p = ease(f, t, 12);
        if (p <= 0) return null;
        const [x, y] = pos(k);
        return <div key={`r${n}`} style={{ position: 'absolute', left: x - 3, top: y - 3, width: size + 6, height: size + 6, borderRadius: radius + 8, border: `${Math.max(4, Math.round(size / 20))}px dashed ${DARK}`, boxSizing: 'border-box', opacity: p }} />;
      })}
      {hl.flatMap((h, i) =>
        h.ns.map((n) => {
          const k = byN.get(n)!;
          const p = ease(f, h.at, 10) * (h.out ? 1 - ease(f, h.out, 10) : 1);
          if (p <= 0) return null;
          const [x, y] = pos(k);
          return <div key={`h${i}-${n}`} style={{ position: 'absolute', left: x - 5, top: y - 5, width: size + 10, height: size + 10, borderRadius: radius + 6, border: `7px solid ${h.color ?? C.red}`, boxSizing: 'border-box', opacity: p }} />;
        }),
      )}
      {bridges.map((b, i) => {
        const ka = byN.get(b.a)!, kb = byN.get(b.b)!;
        const p = ease(f, b.at, 10);
        if (p <= 0) return null;
        const [xa, ya] = pos(ka), [xb, yb] = pos(kb);
        const horizontal = ya === yb;
        const cx = (xa + xb) / 2 + size / 2, cy = (ya + yb) / 2 + size / 2;
        const L = gap + 30, T = 20;
        return <div key={`b${i}`} style={{ position: 'absolute', left: cx - (horizontal ? L : T) / 2, top: cy - (horizontal ? T : L) / 2, width: horizontal ? L : T, height: horizontal ? T : L, borderRadius: 8, background: b.color ?? C.red, opacity: p }} />;
      })}
      {checks.map(([n, t, out], i) => {
        const k = byN.get(n)!;
        const p = ease(f, t, 10) * (out === undefined ? 1 : 1 - ease(f, out, 10));
        if (p <= 0) return null;
        const [x, y] = pos(k);
        return (
          <div key={`c${i}`} style={{ opacity: p }}>
            <div style={{ position: 'absolute', left: x - 3, top: y - 3, width: size + 6, height: size + 6, borderRadius: radius + 3, border: `7px solid ${DARK}`, boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', left: x + size - badge * 0.62, top: y - badge * 0.38, width: badge, height: badge, borderRadius: '50%', background: C.green, border: '4px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${Math.min(1, pop(f, t + 2))})` }}>
              <svg width={badge * 0.56} height={badge * 0.56} viewBox="0 0 24 24">
                <path d="M4 12.5 L10 18 L20 6" stroke="#fff" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- the 1..100 board ----------

export const BoardTile: React.FC<{ n: number; ox: number; oy: number; tile: number; gap: number; font: number; fill?: string; border?: string; opacity?: number; showN?: number; scale?: number }> = ({
  n, ox, oy, tile, gap, font, fill, border, opacity = 1, showN = 1, scale = 1,
}) => {
  const c = (n - 1) % 10, r = Math.floor((n - 1) / 10);
  return (
    <div style={{ position: 'absolute', left: ox + c * (tile + gap), top: oy + r * (tile + gap), width: tile, height: tile, borderRadius: Math.round(tile * 0.2), background: fill ?? C.card, border: `${tile > 40 ? 3 : 2}px solid ${border ?? C.line}`, boxSizing: 'border-box', opacity, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: font, fontWeight: 800, color: C.ink }}>
      <span style={{ opacity: showN }}>{font > 0 ? n : ''}</span>
    </div>
  );
};

const tc = (n: number, ox: number, oy: number, tile: number, gap: number): [number, number] => [ox + ((n - 1) % 10) * (tile + gap) + tile / 2, oy + Math.floor((n - 1) / 10) * (tile + gap) + tile / 2];

// ---------- Scene: intro ----------

const PICKED = [7, 11, 17, 23, 29, 36, 41, 47, 55, 63, 71, 78, 85, 90];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 633, oy = 200, tile = 58, gap = 6;
  const l1 = at(scene, 0, 0.5);
  const clash = ease(f, at(scene, 0, 0.78), 10);
  const chess = ease(f, at(scene, 1, 0.3), 30);
  const dim = 1 - 0.8 * ease(f, l1, 12) * (1 - chess);
  const [x5, y5] = tc(5, ox, oy, tile, gap);
  const [x10] = tc(10, ox, oy, tile, gap);
  const [, y15] = tc(15, ox, oy, tile, gap);
  const arrowCol = clash > 0.5 ? C.red : C.blue;
  const a = ease(f, l1, 14);
  const a2 = ease(f, at(scene, 0, 0.62), 14);
  const gone = 1 - ease(f, at(scene, 1, 0.02), 12);
  return (
    <>
      {range(100).map((i) => {
        const n = i + 1;
        const c = i % 10, r = Math.floor(i / 10);
        const pi = PICKED.indexOf(n);
        const pick = pi >= 0 ? ease(f, at(scene, 0, 0.08 + pi * 0.025), 10) * (1 - ease(f, l1, 10)) : 0;
        const special = n === 5 || n === 10 || n === 15;
        const sp = special ? ease(f, l1, 12) : 0;
        const par = (c + r) % 2 === 0 ? SOFT_GREEN : SOFT_PURPLE;
        const fill = chess > 0 ? par : pick > 0 || sp > 0 ? SOFT_GREEN : undefined;
        const o = (special ? 1 : dim) * ease(f, 2 + (c + r) * 1.2, 8);
        return <BoardTile key={n} n={n} ox={ox} oy={oy} tile={tile} gap={gap} font={30} fill={fill} border={chess > 0 ? ((c + r) % 2 === 0 ? GREEN : PURPLE) : sp > 0 || pick > 0 ? GREEN : undefined} opacity={o} showN={1 - chess} scale={special ? 1 + 0.12 * sp * gone : 1} />;
      })}
      <div style={{ opacity: gone }}>
        <Stage>
          <g opacity={a} fill="none" stroke={arrowCol} strokeWidth={8} strokeLinecap="round">
            <path d={`M ${x5} ${y5 - 34} Q ${(x5 + x10) / 2} ${y5 - 140} ${x10 - 8} ${y5 - 38}`} />
            <path d={`M ${x10 - 8} ${y5 - 38} l -6 -22 M ${x10 - 8} ${y5 - 38} l -24 -8`} />
          </g>
          <g opacity={a2} fill="none" stroke={arrowCol} strokeWidth={8} strokeLinecap="round">
            <path d={`M ${x5 - 34} ${y5 + 4} Q ${x5 - 120} ${(y5 + y15) / 2} ${x5 - 34} ${y15 - 4}`} />
            <path d={`M ${x5 - 34} ${y15 - 4} l 22 -2 M ${x5 - 34} ${y15 - 4} l 2 -24`} />
          </g>
        </Stage>
        <Tag x={(x5 + x10) / 2 - 50} y={y5 - 170} w={100} center start={l1} color={arrowCol} size={52}>×2</Tag>
        <Badge x={(x5 + x10) / 2 + 40} y={y5 - 140} start={at(scene, 0, 0.78)} size={56} />
        <div style={{ position: 'absolute', left: x5 - 260, top: (y5 + y15) / 2 - 40, background: C.bg, borderRadius: 16, padding: '0 14px', opacity: ease(f, at(scene, 0, 0.62), 10) }}>
          <Tag x={14} y={0} start={at(scene, 0, 0.62)} color={arrowCol} size={52}>×3</Tag>
          <span style={{ visibility: 'hidden', fontSize: 52, fontWeight: 900 }}>×3</span>
        </div>
        <Badge x={x5 - 110} y={(y5 + y15) / 2 + 60} start={at(scene, 0, 0.85)} size={56} />
        <Tag x={1330} y={330} w={540} start={at(scene, 0, 0.88)} color={C.red} size={56}>
          no doubles,<br />no triples
        </Tag>
      </div>
    </>
  );
};

// ---------- Scene: question ----------

const PROMPT_SET = '\\{1,2,\\dots,100\\}';

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={100} y={130} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>
        Question
      </Pill>
      <div style={{ position: 'absolute', left: 100, top: 220, width: 1720, background: C.card, borderRadius: 32, padding: '34px 52px', fontSize: 58, fontWeight: 700, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        What is the largest number of elements a{' '}
        <Mark on={at(scene, 0, 0.35)}>
          subset of <Tex tex={PROMPT_SET} size={54} />
        </Mark>{' '}
        can have if it never contains two numbers where one is <Mark on={at(scene, 1, 0.4)}>exactly 2 times</Mark> the other, or{' '}
        <Mark on={at(scene, 1, 0.75)}>exactly 3 times</Mark> the other?
      </div>
      <Choices x={190} y={690} items={CHOICES.map((c) => <span key={c}>{c}</span>)} start={(i) => at(scene, 1, 0.8 + i * 0.04)} />
    </>
  );
};

// ---------- Scene: asked ----------

const PairChip: React.FC<{ y: number; a: number; b: number; start: number; note: string; ok?: boolean; badgeAt: number }> = ({ y, a, b, start, note, ok, badgeAt }) => {
  const f = useCurrentFrame();
  const col = ok ? C.green : C.red;
  const tile = (n: number) => (
    <div style={{ width: 120, height: 120, borderRadius: 26, background: C.card, border: `5px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 66, fontWeight: 900 }}>{n}</div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 220, top: y, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, start) }}>
        {tile(a)}
        <span style={{ fontSize: 60, fontWeight: 900, color: C.muted }}>&amp;</span>
        {tile(b)}
      </div>
      <Tag x={720} y={y + 28} start={start + 8} color={col} size={58}>{note}</Tag>
      <Badge x={1500} y={y + 60} start={badgeAt} ok={ok} size={80} />
      <Tag x={1560} y={y + 22} start={badgeAt} color={col} size={60}>{ok ? 'fine' : 'clash'}</Tag>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => (
  <>
    <PairChip y={130} a={5} b={10} start={4} note="10 = 2 × 5" badgeAt={at(scene, 0, 0.25)} />
    <PairChip y={300} a={5} b={15} start={at(scene, 0, 0.5)} note="15 = 3 × 5" badgeAt={at(scene, 0, 0.8)} />
    <PairChip y={470} a={5} b={20} start={at(scene, 1, 0.05)} note="20 = 4 × 5" ok badgeAt={at(scene, 1, 0.7)} />
    <Tag x={960} y={680} w={1700} center start={at(scene, 2, 0.2)} size={58}>
      Keep as <span style={{ color: GREEN }}>MANY</span> as possible. No clashing pair.
    </Tag>
  </>
);

// ---------- Scene: pauses ----------

const makePause = (tex: string, withChoices: boolean, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={130} y={170} start={4} size={70} tex={tex} />
      <Text x={130} y={withChoices ? 340 : 360} w={1000} size={46} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      {withChoices && <Choices x={130} y={600} items={CHOICES.map((c) => <span key={c}>{c}</span>)} start={() => 8} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} />
    </>
  );
};

// ---------- Scene: families ----------

const CORES = [1, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31, 35, 37, 41, 43, 47, 49, 53, 55, 59, 61, 65, 67, 71, 73, 77, 79, 83, 85, 89, 91, 95, 97];

const Piece: React.FC<{ tex: string; start: number; color?: string; strikeAt?: number; boxAt?: number; size?: number }> = ({ tex, start, color = C.ink, strikeAt, boxAt, size = 66 }) => {
  const f = useCurrentFrame();
  const s = strikeAt === undefined ? 0 : ease(f, strikeAt, 12);
  const b = boxAt === undefined ? 0 : ease(f, boxAt, 12);
  const fu = fadeUp(f, start);
  return (
    <div style={{ position: 'relative', ...fu, opacity: (fu.opacity as number) * (1 - 0.65 * s), padding: '2px 14px' }}>
      <Tex tex={tex} size={size} color={color} />
      {s > 0 && <div style={{ position: 'absolute', left: 4, right: 4, top: '50%', height: 6, background: C.red, borderRadius: 3, transform: `scaleX(${s})`, transformOrigin: 'left' }} />}
      {b > 0 && <div style={{ position: 'absolute', inset: 0, border: `6px solid ${GREEN}`, borderRadius: 16, opacity: b }} />}
    </div>
  );
};

const Families: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l3 = at(scene, 3, 0), l4 = at(scene, 4, 0);
  const o0 = fadeTo(f, l1 + 4, 0, 12);
  const oRules = ease(f, l1, 8) * fadeTo(f, l3 + 2, 0, 12);
  const oChain = ease(f, l3, 8) * fadeTo(f, l4 + 2, 0, 12);
  const fams: [number, number[]][] = [[250, [3, 6, 12]], [960, [5, 10, 20]], [1670, [7, 14, 28]]];
  const chainFill = { background: SOFT_GREEN, border: `5px solid ${GREEN}` };
  return (
    <>
      <div style={{ opacity: o0 }}>
        <Tag x={960} y={150} w={1600} center start={4} size={62}>Sort the numbers into <span style={{ color: GREEN }}>families</span></Tag>
        {fams.map(([cx, ns], i) => (
          <div key={cx} style={{ position: 'absolute', left: cx - 190, top: 330, width: 380, height: 260, borderRadius: 40, border: `6px dashed ${[GREEN, PURPLE, C.blue][i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 0, 0.35 + i * 0.12)) }}>
            {ns.map((n) => <span key={n}>{n}</span>)}
          </div>
        ))}
        <Tag x={960} y={650} w={1700} center start={at(scene, 0, 0.8)} color={C.muted} size={46}>families never clash with each other</Tag>
      </div>

      <div style={{ opacity: oRules }}>
        <div style={{ position: 'absolute', left: 160, top: 130, width: 1600, height: 190, borderRadius: 36, background: C.card, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, l1) }} />
        <Tag x={960} y={150} w={1500} center start={l1 + 4} size={56}>divide out every 2 and every 3</Tag>
        <Tag x={960} y={232} w={1500} center start={at(scene, 1, 0.55)} size={56} color={GREEN}>what is left is the core</Tag>

        <div style={{ position: 'absolute', left: 280, top: 410, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Piece tex="72=" start={at(scene, 2, 0.04)} />
          <Piece tex="8" start={at(scene, 2, 0.06)} strikeAt={at(scene, 2, 0.2)} />
          <Piece tex="\times" start={at(scene, 2, 0.06)} />
          <Piece tex="9" start={at(scene, 2, 0.08)} strikeAt={at(scene, 2, 0.2)} />
          <Piece tex="\times" start={at(scene, 2, 0.08)} />
          <Piece tex="1" start={at(scene, 2, 0.1)} boxAt={at(scene, 2, 0.28)} />
        </div>
        <Tag x={930} y={417} start={at(scene, 2, 0.3)} color={GREEN} size={56}>core 1</Tag>
        <div style={{ position: 'absolute', left: 280, top: 570, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Piece tex="40=" start={at(scene, 2, 0.5)} />
          <Piece tex="8" start={at(scene, 2, 0.52)} strikeAt={at(scene, 2, 0.68)} />
          <Piece tex="\times" start={at(scene, 2, 0.54)} />
          <Piece tex="5" start={at(scene, 2, 0.56)} boxAt={at(scene, 2, 0.8)} />
        </div>
        <Tag x={780} y={577} start={at(scene, 2, 0.84)} color={GREEN} size={56}>core 5</Tag>
      </div>

      <div style={{ opacity: oChain }}>
        <Stage>
          <g stroke={C.ink} strokeWidth={7} strokeLinecap="round" fill="none">
            {([[385, 585, 0.28], [745, 925, 0.5]] as [number, number, number][]).map(([a, b, t]) => (
              <path key={a} opacity={ease(f, at(scene, 3, t), 12)} d={`M ${a} 620 L ${b} 620 M ${b - 22} 602 L ${b} 620 L ${b - 22} 638`} />
            ))}
            <path opacity={ease(f, at(scene, 3, 0.7), 12)} d="M 300 540 L 300 440 M 282 462 L 300 440 L 318 462" />
          </g>
        </Stage>
        {([[300, 620, 5, 0.1], [660, 620, 10, 0.3], [1000, 620, 20, 0.52], [300, 290, 15, 0.72]] as [number, number, number, number][]).map(([x, y, n, t]) => (
          <div key={n}>
            <div style={{ position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 30, ...chainFill, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, fontWeight: 900, ...fadeUp(f, at(scene, 3, t)) }}>{n}</div>
            <Tag x={x} y={y + 80} w={240} center start={at(scene, 3, t) + 6} color={GREEN} size={44}>core 5</Tag>
          </div>
        ))}
        <Tag x={485} y={545} w={100} center start={at(scene, 3, 0.28)} size={52}>×2</Tag>
        <Tag x={835} y={545} w={100} center start={at(scene, 3, 0.5)} size={52}>×2</Tag>
        <Tag x={335} y={465} start={at(scene, 3, 0.7)} size={52}>×3</Tag>
        <Tag x={1100} y={420} w={760} start={at(scene, 3, 0.8)} size={56}>clashes stay inside one family</Tag>
      </div>

      {f >= l4 && (
        <>
          {CORES.map((n, i) => {
            const row = i < 17 ? 0 : 1;
            const col = row === 0 ? i : i - 17;
            const x = row === 0 ? 98 + col * 102 : 149 + col * 102;
            const y = 200 + row * 96;
            const sc = ease(f, at(scene, 4, 0.04 + i * 0.012), 8);
            const hot = n === 1 ? ease(f, at(scene, 4, 0.85), 10) : 0;
            return (
              <div key={n} style={{ position: 'absolute', left: x, top: y, width: 92, height: 80, borderRadius: 18, background: hot > 0 ? SOFT_GREEN : '#eceef4', border: `4px solid ${hot > 0 ? GREEN : '#d6dae4'}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, color: C.ink, opacity: sc, transform: `scale(${0.8 + 0.2 * sc})` }}>
                {n}
              </div>
            );
          })}
          <Tag x={960} y={115} w={1700} center start={at(scene, 4, 0.08)} size={50} color={C.muted}>core = a number with no 2 or 3 inside it</Tag>
          <Tag x={960} y={400} w={900} center start={at(scene, 4, 0.55)} size={64}>33 cores = 33 families</Tag>
          <div style={{ position: 'absolute', left: 860, top: 520, width: 200, height: 200, borderRadius: 40, background: SOFT_GREEN, border: `7px solid ${GREEN}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 130, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.85)) }}>1</div>
          <Tag x={960} y={740} w={600} center start={at(scene, 4, 0.86)} size={56} color={GREEN}>core 1</Tag>
        </>
      )}
    </>
  );
};

// ---------- core 1 grid (main) ----------

export const MAIN = famCells(1, 100);
const MX = 140, MY = 712, MS = 104;
const mainBase = { cells: MAIN, ox: MX, oy: MY, size: MS, gap: 8, font: 52 };
export const GREEN1 = MAIN.filter(isGreen).map((k) => k.n); // the 11 green cells
export const DOM1: [number, number][] = [[1, 2], [4, 8], [16, 32], [3, 6], [12, 24], [48, 96], [9, 18], [36, 72], [27, 54]];

// ---------- Scene: grid1 ----------

const Grid1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const appear = (k: Cell) => {
    if (k.n === 1) return at(scene, 0, 0.2);
    if (k.r === 0) return at(scene, 1, 0.08 + (k.c - 1) * 0.06);
    if (k.r === 1) return at(scene, 1, 0.58 + k.c * 0.01);
    if (k.r === 2) return at(scene, 1, 0.7 + k.c * 0.01);
    if (k.n === 27 || k.n === 54) return at(scene, 1, 0.8);
    return at(scene, 1, 0.92);
  };
  const l3 = at(scene, 2, 0);
  return (
    <>
      <NumGrid {...mainBase} appear={appear} hl={[{ ns: [6, 12], at: at(scene, 2, 0.25) }, { ns: [6, 18], at: at(scene, 2, 0.45) }]} bridges={[{ a: 6, b: 12, at: at(scene, 2, 0.25) }, { a: 6, b: 18, at: at(scene, 2, 0.45) }]} />
      <Stage>
        <g stroke={C.muted} strokeWidth={7} strokeLinecap="round" fill="none">
          <path opacity={ease(f, at(scene, 0, 0.55), 12)} d="M 950 764 L 1040 764 M 1020 746 L 1040 764 L 1020 782" />
          <path opacity={ease(f, at(scene, 0, 0.7), 12)} d="M 85 690 L 85 480 M 67 500 L 85 480 L 103 500" />
        </g>
      </Stage>
      <Tag x={1060} y={738} start={at(scene, 0, 0.55)} size={52} color={C.muted}>×2</Tag>
      <Tag x={85} y={400} w={120} center start={at(scene, 0, 0.7)} size={52} color={C.muted}>×3</Tag>
      <Tag x={1020} y={170} start={l3 + 6} size={60}>20 numbers</Tag>
      <Tag x={1020} y={290} start={at(scene, 2, 0.25)} size={52} color={C.red}>6 and 12: side by side</Tag>
      <Tag x={1020} y={370} start={at(scene, 2, 0.45)} size={52} color={C.red}>6 and 18: one above</Tag>
      <Tag x={1020} y={500} w={800} start={at(scene, 2, 0.62)} size={58}>
        clash = <span style={{ color: C.red }}>neighbors</span>
      </Tag>
      <Tag x={1020} y={580} w={820} start={at(scene, 2, 0.7)} size={44} color={C.muted}>(side by side, or one above the other)</Tag>
    </>
  );
};

// ---------- Scene: checker ----------

const Checker: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const purpleOp = 1 - 0.7 * ease(f, at(scene, 1, 0.7), 14);
  const rowEnd = (r: number) => MX + MAIN.filter((k) => k.r === r).length * 112 - 8;
  const rowAt = [0.08, 0.26, 0.42, 0.56, 0.7];
  const rowN = [4, 3, 2, 1, 1];
  const checkAt = at(scene, 3, 0.55);
  const checks: [number, number][] = GREEN1.map((n, i) => [n, checkAt + i * 3]);
  return (
    <>
      <NumGrid {...mainBase} color={at(scene, 0, 0.1)} purpleOp={purpleOp} checks={checks}
        hl={[{ ns: [4, 8, 12, 36], at: at(scene, 1, 0.3), out: at(scene, 1, 0.68), color: DARK }]} />
      <Tag x={1000} y={170} w={860} start={at(scene, 1, 0.35)} size={52}>
        neighbors: <span style={{ color: GREEN }}>green</span> next to <span style={{ color: PURPLE }}>purple</span>
      </Tag>
      {rowN.map((n, r) => (
        <Tag key={r} x={rowEnd(r) + 36} y={MY - r * 112 + 18} start={at(scene, 2, rowAt[r])} size={60} color={GREEN}>{n}</Tag>
      ))}
      <Parts x={1000} y={290} size={68} parts={[[at(scene, 2, rowAt[0]), '4', GREEN], [at(scene, 2, rowAt[1]), '+3', GREEN], [at(scene, 2, rowAt[2]), '+2', GREEN], [at(scene, 2, rowAt[3]), '+1', GREEN], [at(scene, 2, rowAt[4]), '+1', GREEN], [at(scene, 2, 0.88), '=11', GREEN]]} />
      <Tag x={1000} y={420} start={at(scene, 3, 0.1)} size={64} color={PURPLE}>purple 9</Tag>
      <Tag x={1000} y={510} start={at(scene, 3, 0.3)} size={64} color={GREEN}>green 11</Tag>
      <Tag x={1000} y={650} w={860} start={at(scene, 3, 0.75)} size={58} color={GREEN}>core 1 keeps 11</Tag>
    </>
  );
};

// ---------- Scene: dominoes ----------

const Dominoes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l3 = at(scene, 3, 0);
  const doms: [number, number, number][] = DOM1.map(([a, b], i) => [a, b, i === 0 ? at(scene, 1, 0.4) : at(scene, 1, 0.65 + (i - 1) * 0.03)]);
  const checks: [number, number, number?][] = [
    ...GREEN1.map((n) => [n, -30, at(scene, 0, 0.1)] as [number, number, number]),
    ...GREEN1.map((n, i) => [n, l3 + 36 + i * 3] as [number, number]),
  ];
  return (
    <>
      <NumGrid {...mainBase} color={0} dominoes={doms} rings={[[64, at(scene, 2, 0.55)], [81, at(scene, 2, 0.8)]]} checks={checks}
        hl={[{ ns: [2, 9, 12, 54, 24], at: at(scene, 0, 0.45), out: at(scene, 0, 0.9), color: C.amber }]} />
      <Tag x={1000} y={180} start={at(scene, 0, 0.35)} size={60} color={C.amber} opacity={1 - ease(f, at(scene, 1, 0.05), 10)}>more than 11?</Tag>
      <Tag x={1000} y={230} w={860} start={at(scene, 1, 0.3)} size={52}>
        a domino keeps <span style={{ color: GREEN }}>at most 1</span>
      </Tag>
      <Tag x={1000} y={410} start={at(scene, 2, 0.12)} size={60}>9 dominoes + 2 leftovers</Tag>
      <Parts x={1000} y={540} size={72} parts={[[at(scene, 3, 0.35), '9+2=11']]} />
      <Tag x={1000} y={680} w={800} start={at(scene, 3, 0.6)} size={60} color={GREEN}>at most 11</Tag>
    </>
  );
};

// ---------- Scene: others (gallery) ----------

export type G = { m: number; cells: Cell[]; dom: [number, number][]; ring: number[]; keep: number[] };
const mk = (m: number, cells: Cell[], dom: [number, number][], ring: number[], keep: number[]): G => ({ m, cells, dom, ring, keep });

const G5 = mk(5, famCells(5), [[5, 10], [40, 80], [20, 60], [15, 30], [45, 90]], [], [5, 20, 80, 30, 45]);
const G7 = mk(7, famCells(7), [[7, 14], [28, 56], [21, 63], [42, 84]], [], [7, 28, 42, 63]);
const G11 = mk(11, famCells(11), [[11, 22], [44, 88], [33, 66]], [99], [11, 44, 66, 99]);
const G13 = mk(13, famCells(13), [[13, 26], [39, 78]], [52], [13, 52, 78]);
const corner4 = (m: number): G => mk(m, cs(m, [[0, 0], [1, 0], [2, 0], [0, 1]]), [[2 * m, 4 * m], [m, 3 * m]], [], [m, 4 * m]);
const corner3 = (m: number): G => mk(m, cs(m, [[0, 0], [1, 0], [0, 1]]), [[m, 2 * m]], [3 * m], [2 * m, 3 * m]);

export const cols = (g: G) => g.cells.reduce((m, k) => Math.max(m, k.c), 0) + 1;
const checkStart = (g: G, t0: number) => t0 + 40 + g.dom.length * 7;

/** One family: colours, then dominoes, then rings, then checks, from frame t0. */
const FamilyGrid: React.FC<{ g: G; ox: number; oy: number; size: number; t0: number; font?: number; gap?: number }> = ({ g, ox, oy, size, t0, font = 44, gap = 8 }) => (
  <NumGrid
    cells={g.cells} ox={ox} oy={oy} size={size} gap={gap} font={font}
    appear={t0} color={t0 + 4}
    dominoes={g.dom.map(([a, b], i) => [a, b, t0 + 22 + i * 7] as [number, number, number])}
    rings={g.ring.map((n) => [n, t0 + 24 + g.dom.length * 7] as [number, number])}
    checks={g.keep.map((n, i) => [n, checkStart(g, t0) + i * 5] as [number, number])}
  />
);

/** A family with its name above and "keeps N" below. */
const Family: React.FC<{ g: G; ox: number; oy: number; size: number; t0: number; name: string; keeps: string; font?: number; gap?: number; nameSize?: number; nameY: number }> = ({ g, ox, oy, size, t0, name, keeps, font = 44, gap = 6, nameSize = 50, nameY }) => {
  const cx = ox + (cols(g) * (size + gap) - gap) / 2;
  return (
    <>
      <FamilyGrid g={g} ox={ox} oy={oy} size={size} t0={t0} font={font} gap={gap} />
      <Tag x={cx} y={nameY} w={420} center start={t0} size={nameSize}>{name}</Tag>
      <Tag x={cx} y={oy + size + 22} w={420} center start={checkStart(g, t0) + 8} size={58} color={GREEN}>{keeps}</Tag>
    </>
  );
};

const Others: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vis = (l: number) => ease(f, at(scene, l, 0), 8) * (l === 5 ? 1 : 1 - ease(f, at(scene, l + 1, 0) - 6, 10));
  return (
    <>
      <NumGrid cells={MAIN} ox={60} oy={320} size={40} gap={4} font={0} color={0} checks={GREEN1.map((n) => [n, 0] as [number, number])} />
      <Tag x={60} y={365} start={0} size={48} color={GREEN}>core 1: 11</Tag>

      <div style={{ opacity: vis(0) }}>
        <Family g={G5} ox={700} oy={560} size={104} gap={8} font={48} t0={at(scene, 0, 0.12)} name="core 5" keeps="keeps 5" nameSize={60} nameY={210} />
      </div>
      <div style={{ opacity: vis(1) }}>
        <Family g={G7} ox={520} oy={600} size={88} t0={at(scene, 1, 0.05)} name="core 7" keeps="keeps 4" nameY={340} />
        <Family g={G11} ox={960} oy={600} size={88} t0={at(scene, 1, 0.34)} name="core 11" keeps="keeps 4" nameY={340} />
        <Family g={G13} ox={1400} oy={600} size={88} t0={at(scene, 1, 0.62)} name="core 13" keeps="keeps 3" nameY={340} />
      </div>
      <div style={{ opacity: vis(2) }}>
        {[17, 19, 23, 25].map((m, i) => (
          <Family key={m} g={corner4(m)} ox={460 + i * 362} oy={560} size={100} gap={6} font={48} t0={at(scene, 2, 0.05 + i * 0.12)} name={`core ${m}`} keeps="keeps 2" nameSize={50} nameY={340} />
        ))}
      </div>
      <div style={{ opacity: vis(3) }}>
        {[29, 31].map((m, i) => {
          const g = corner3(m);
          const ox = 700 + i * 420;
          const t0 = at(scene, 3, 0.05 + i * 0.12);
          return (
            <div key={m}>
              <NumGrid cells={g.cells} ox={ox} oy={540} size={120} gap={8} font={52} appear={t0} color={t0 + 4}
                dominoes={[[m, 2 * m, t0 + 26]]} rings={[[3 * m, t0 + 40]]}
                checks={[[2 * m, at(scene, 3, 0.7)], [3 * m, at(scene, 3, 0.74)]]} />
              <Tag x={ox + 124} y={330} w={400} center start={t0} size={56}>core {m}</Tag>
            </div>
          );
        })}
        <Tag x={1000} y={730} w={1200} center start={at(scene, 3, 0.4)} size={54} opacity={1 - ease(f, at(scene, 3, 0.62), 10)}>
          <span style={{ color: GREEN }}>green 1</span>, <span style={{ color: PURPLE }}>purple 2</span>
        </Tag>
        <Tag x={1000} y={730} w={1200} center start={at(scene, 3, 0.8)} size={58} color={PURPLE}>purple wins, 2 to 1</Tag>
      </div>
      <div style={{ opacity: vis(4) }}>
        {[35, 37, 41, 43, 47, 49].map((m, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const ox = 560 + col * 420, oy = 270 + row * 200;
          const t0 = at(scene, 4, 0.12 + i * 0.07);
          const hot = 0;
          return (
            <div key={m} style={{ transform: `scale(${1 + 0.1 * hot})`, transformOrigin: `${ox + 112}px ${oy + 52}px` }}>
              <NumGrid cells={famCells(m)} ox={ox} oy={oy} size={104} gap={8} font={52} appear={t0} color={t0 + 4} dominoes={[[m, 2 * m, t0 + 20]]} checks={[[m, t0 + 36]]} />
            </div>
          );
        })}
        <Tag x={1000} y={600} w={1400} center start={at(scene, 4, 0.55)} size={50}>the double fits, the triple doesn't</Tag>
        <Tag x={1000} y={700} w={800} center start={at(scene, 4, 0.85)} size={64} color={GREEN}>6 pairs × 1 each</Tag>
      </div>
      <div style={{ opacity: vis(5) }}>
        {[53, 55, 59, 61, 65, 67, 71, 73, 77, 79, 83, 85, 89, 91, 95, 97].map((n, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const t0 = at(scene, 5, 0.06 + i * 0.045);
          return <NumGrid key={n} cells={[{ n, c: 0, r: 0 }]} ox={640 + col * 170} oy={190 + row * 130} size={104} gap={8} font={52} appear={t0} checks={[[n, t0 + 14]]} />;
        })}
        <Tag x={1370} y={200} w={500} start={at(scene, 5, 0.45)} size={48}>even the double is past 100</Tag>
        <Tag x={1370} y={420} w={500} start={at(scene, 5, 0.86)} size={64} color={GREEN}>16 loners</Tag>
        <Tag x={1370} y={500} w={500} start={at(scene, 5, 0.9)} size={52}>keep them all</Tag>
      </div>
    </>
  );
};

// ---------- Scene: total ----------

const Cols: React.FC<{ y: number; gap: number; cols: [number, string, string, string?][] }> = ({ y, gap, cols }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 200, top: y, display: 'flex', alignItems: 'flex-start', gap, whiteSpace: 'nowrap' }}>
      {cols.map(([start, tex, label, color], i) => (
        <div key={i} style={{ ...fadeUp(f, start), display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
          <Tex tex={tex} size={80} color={color ?? C.ink} />
          <div style={{ fontSize: 40, fontWeight: 800, color: C.muted, marginTop: 6 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

const Total: SceneComponent = ({ scene }) => {
  const t = (l: number, x: number) => at(scene, l, x);
  return (
    <>
      <Cols y={120} gap={44} cols={[[t(0, 0.14), '11', 'core 1', GREEN], [t(0, 0.215), '+5', 'core 5'], [t(0, 0.29), '+4', 'core 7'], [t(0, 0.355), '+4', 'core 11'], [t(0, 0.41), '+3', 'core 13'], [t(0, 0.5), '=27', '']]} />
      <Cols y={340} gap={60} cols={[[t(0, 0.65), '+8', 'corners of four'], [t(0, 0.75), '+4', 'corners of three'], [t(0, 0.83), '+6', 'pairs'], [t(0, 0.9), '+16', 'loners']]} />
      <Parts x={200} y={590} size={80} gap={26} parts={[[t(1, 0.03), '27'], [t(1, 0.14), '+8'], [t(1, 0.26), '+4'], [t(1, 0.38), '+6'], [t(1, 0.49), '+16'], [t(1, 0.62), '='], [t(1, 0.73), '61', C.green]]} />
      <AnswerPill x={1480} y={640} value="C · 61" start={at(scene, 1, 0.73)} size={96} />
    </>
  );
};

// ---------- Scene: sol2 ----------

export const CHOSEN = new Set<number>([
  1, 4, 16, 64, 6, 24, 96, 9, 36, 54, 81, 5, 20, 80, 30, 45, 7, 28, 42, 63, 11, 44, 66, 99, 13, 52, 78,
  ...[17, 19, 23, 25].flatMap((m) => [m, 4 * m]),
  ...[29, 31].flatMap((m) => [2 * m, 3 * m]),
  35, 37, 41, 43, 47, 49,
  ...CORES.filter((m) => m >= 53),
]);
const S2 = { ox: 170, oy: 170, tile: 60, gap: 6 };

export type Tally = { g: G; n: number; name: string; cue: number };
export const TALLY: Tally[] = [
  { g: mk(1, MAIN, DOM1, [64, 81], []), n: 9, name: 'core 1', cue: 0.19 },
  { g: G5, n: 5, name: 'core 5', cue: 0.28 },
  { g: G7, n: 4, name: 'core 7', cue: 0.38 },
  { g: G11, n: 3, name: 'core 11', cue: 0.47 },
  { g: G13, n: 2, name: 'core 13', cue: 0.56 },
  { g: corner4(17), n: 8, name: 'corners of four', cue: 0.67 },
  { g: corner3(29), n: 2, name: 'corners of three', cue: 0.75 },
  { g: mk(35, famCells(35), [[35, 70]], [], []), n: 6, name: 'pairs', cue: 0.83 },
];

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { ox, oy, tile, gap } = S2;
  const l1 = at(scene, 1, 0), l3 = at(scene, 3, 0);
  const kept = ease(f, at(scene, 3, 0.55), 20);
  const boardOp = Math.max(ease(f, 2, 8) * (1 - ease(f, l1, 10)), ease(f, l3, 12));
  const zoom = ease(f, at(scene, 2, 0.1), 12) * (1 - ease(f, l3, 10));
  const running = TALLY.reduce((a, t) => (f >= at(scene, 1, t.cue) ? a + t.n : a), 0);
  const size = 30, pitch = 34, CW = 400;
  return (
    <>
      {boardOp > 0 &&
        range(100).map((i) => {
          const n = i + 1;
          const isK = CHOSEN.has(n);
          const fill = kept > 0 && isK ? `rgba(33,196,93,${0.18 + 0.3 * kept})` : undefined;
          return <BoardTile key={n} n={n} ox={ox} oy={oy} tile={tile} gap={gap} font={30} fill={fill} border={kept > 0 && isK ? C.green : undefined} opacity={boardOp * (kept > 0 && !isK ? 1 - 0.55 * kept : 1)} />;
        })}
      <Tag x={1000} y={300} w={820} start={at(scene, 0, 0.6)} size={60} opacity={1 - ease(f, l1, 10)}>count what we must <span style={{ color: C.red }}>throw away</span></Tag>
      {/* tally of the family shapes */}
      <div style={{ opacity: ease(f, l1, 10) * (1 - ease(f, at(scene, 2, 0.05), 10)) }}>
        {TALLY.map((t, i) => {
          const cx = 200 + (i % 4) * CW, cy = 140 + Math.floor(i / 4) * 320;
          const c = at(scene, 1, t.cue);
          const w = cols(t.g) * pitch - 4;
          return (
            <div key={i}>
              <NumGrid cells={t.g.cells} ox={cx + (CW - 20 - w) / 2} oy={cy + 80 + 4 * pitch} size={size} gap={4} font={0} appear={c} color={c + 2}
                dominoes={t.g.dom.map(([a, b], k) => [a, b, c + 8 + k * 2] as [number, number, number])} rings={t.g.ring.map((n) => [n, c + 14] as [number, number])} />
              <Tag x={cx + (CW - 20) / 2} y={cy} w={300} center start={c} size={64} color={GREEN}>+{t.n}</Tag>
              <Tag x={cx + (CW - 20) / 2} y={cy + 262} w={380} center start={c} size={40} color={C.muted} weight={800}>{t.name}</Tag>
            </div>
          );
        })}
      </div>
      <Tag x={960} y={45} w={900} center start={at(scene, 1, 0.3)} size={60}>
        dominoes: <span style={{ color: C.blue }}>{running}</span>
      </Tag>
      <div style={{ opacity: zoom }}>
        <div style={{ position: 'absolute', left: 795, top: 300, width: 330, height: 150, borderRadius: 40, border: `9px solid ${DARK}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, background: C.card }}>
          <div style={{ width: 110, height: 110, borderRadius: 24, background: SOFT_GREEN, border: `5px solid ${GREEN}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 900 }}>1</div>
          <div style={{ width: 110, height: 110, borderRadius: 24, background: SOFT_PURPLE, border: `5px solid ${PURPLE}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 900 }}>2</div>
        </div>
      </div>
      <Tag x={960} y={500} w={900} center start={at(scene, 2, 0.5)} size={60} color={C.red} opacity={zoom}>lose at least 1</Tag>
      <Parts x={1000} y={520} size={80} parts={[[at(scene, 3, 0.3), '100-39=61']]} />
      <Tag x={1000} y={650} w={860} start={at(scene, 4, 0.45)} size={54}>
        asked for the <span style={{ color: GREEN }}>MOST</span>? Prove the ceiling.
      </Tag>
    </>
  );
};

// ---------- Scene: traps ----------

const MiniBoard: React.FC<{ ox: number; oy: number; shadeFrom: number; start: number; link?: [number, number]; linkAt?: number }> = ({ ox, oy, shadeFrom, start, link, linkAt = 0 }) => {
  const f = useCurrentFrame();
  const tile = 24, gap = 2;
  const p = ease(f, start, 8);
  return (
    <>
      {range(100).map((i) => {
        const n = i + 1;
        const shaded = n >= shadeFrom;
        const sp = ease(f, start + (shaded ? ((n - shadeFrom) / (101 - shadeFrom)) * 24 : 0), 10);
        return <BoardTile key={n} n={n} ox={ox} oy={oy} tile={tile} gap={gap} font={0} fill={shaded && sp > 0 ? 'rgba(239,67,67,0.30)' : undefined} border={shaded && sp > 0 ? C.red : undefined} opacity={p} />;
      })}
      {link && (
        <Stage>
          {(() => {
            const [a, b] = link;
            const [x1, y1] = tc(a, ox, oy, tile, gap), [x2, y2] = tc(b, ox, oy, tile, gap);
            const q = ease(f, linkAt, 12);
            return (
              <g opacity={q}>
                <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * q} y2={y1 + (y2 - y1) * q} stroke={DARK} strokeWidth={6} strokeLinecap="round" />
                <circle cx={x1} cy={y1} r={10} fill={DARK} />
                <circle cx={x2} cy={y2} r={10} fill={DARK} opacity={q > 0.95 ? 1 : 0} />
              </g>
            );
          })()}
        </Stage>
      )}
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const W = 400, H = 560, Y = 150;
  const X = [100, 540, 980, 1420]; // A, B, D, E
  const starts = [at(scene, 0, 0.05), at(scene, 2, 0.05), at(scene, 3, 0.05), at(scene, 1, 0.05)];
  const letters = ['A', 'B', 'D', 'E'];
  const vals = ['50', '58', '64', '67'];
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div style={{ position: 'absolute', left: X[i], top: Y, width: W, height: H, borderRadius: 32, background: C.card, border: `5px solid ${C.red}`, boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(239,67,67,0.12)', ...fadeUp(f, starts[i]) }} />
          <div style={{ position: 'absolute', left: X[i], top: Y + 18, width: W, textAlign: 'center', fontSize: 62, fontWeight: 900, color: C.red, ...fadeUp(f, starts[i] + 2) }}>
            <span style={{ fontSize: 40, color: C.muted, marginRight: 12 }}>{letters[i]}</span>{vals[i]}
          </div>
          <Badge x={X[i] + W - 20} y={Y + 10} start={starts[i] + 8} size={64} />
        </div>
      ))}
      <MiniBoard ox={X[0] + 71} oy={Y + 110} shadeFrom={51} start={starts[0] + 6} />
      <Tag x={X[0] + 200} y={Y + 392} w={380} center start={at(scene, 0, 0.55)} size={44} color={C.red} weight={800}>no clashes, but not the most</Tag>
      <MiniBoard ox={X[3] + 71} oy={Y + 110} shadeFrom={34} start={starts[3] + 6} link={[34, 68]} linkAt={at(scene, 1, 0.6)} />
      <Parts x={X[3] + 60} y={Y + 405} size={46} parts={[[at(scene, 1, 0.65), '34\\times2=68', C.red]]} />
      <Tag x={X[3] + 200} y={Y + 482} w={370} center start={at(scene, 1, 0.7)} size={44} color={C.red} weight={800}>clash!</Tag>
      <div style={{ position: 'absolute', left: X[1], top: Y + 150, width: W, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.3)) }}>
        <Tex tex="58<61" size={80} color={C.red} />
      </div>
      <Tag x={X[1] + 200} y={Y + 330} w={360} center start={at(scene, 2, 0.45)} size={44} color={C.red} weight={800}>too small: we built 61</Tag>
      <div style={{ position: 'absolute', left: X[2], top: Y + 150, width: W, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.3)) }}>
        <Tex tex="64>61" size={80} color={C.red} />
      </div>
      <div style={{ position: 'absolute', left: X[2] + 100, top: Y + 290, width: 200, height: 90, borderRadius: 30, border: `7px solid ${DARK}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, ...fadeUp(f, at(scene, 3, 0.45)) }}>
        <div style={{ width: 54, height: 54, borderRadius: 12, background: SOFT_GREEN, border: `4px solid ${GREEN}`, boxSizing: 'border-box' }} />
        <div style={{ width: 54, height: 54, borderRadius: 12, background: SOFT_PURPLE, border: `4px solid ${PURPLE}`, boxSizing: 'border-box' }} />
      </div>
      <Tag x={X[2] + 200} y={Y + 410} w={360} center start={at(scene, 3, 0.55)} size={44} color={C.red} weight={800}>ceiling is 61</Tag>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 740, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 4, 0.3)) }}>
        <div style={{ background: C.primary, color: '#fff', borderRadius: 28, padding: '12px 44px', fontSize: 50, fontWeight: 900 }}>
          Show it works AND show nobody can beat it
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
      <Eq x={0} y={330} center start={at(scene, 0, 0.55)} size={96} tex="\{1,2,\dots,30\}" />
      <Tag x={960} y={560} w={1700} center start={at(scene, 1, 0.1)} size={56}>
        no doubles, no triples: the <span style={{ color: GREEN }}>most</span> you can pick?
      </Tag>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VCELLS = famCells(1, 30);
const VDOM: [number, number][] = [[2, 4], [8, 16], [1, 3], [12, 24], [6, 18], [9, 27]];
const VGREEN = VCELLS.filter(isGreen).map((k) => k.n);

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0), l2 = at(scene, 2, 0), l3 = at(scene, 3, 0);
  const small = ease(f, l1, 14);
  const l2Out = 1 - ease(f, l3 + 2, 12);
  const vg = (g: G, ox: number, t0: number, name: string, keeps: string) => (
    <Family g={g} ox={ox} oy={560} size={84} gap={6} font={40} t0={t0} name={name} keeps={keeps} nameSize={48} nameY={400} />
  );
  const A = mk(5, cs(5, [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1]]), [[5, 10], [15, 30]], [20], [5, 20, 30]);
  const B = mk(7, cs(7, [[0, 0], [1, 0], [2, 0], [0, 1]]), [[14, 28], [7, 21]], [], [7, 28]);
  const P11 = mk(11, cs(11, [[0, 0], [1, 0]]), [[11, 22]], [], [11]);
  const P13 = mk(13, cs(13, [[0, 0], [1, 0]]), [[13, 26]], [], [13]);
  const LON = [17, 19, 23, 25, 29];
  return (
    <>
      <div style={{ opacity: 1 - small }}>
        <NumGrid cells={VCELLS} ox={MX} oy={MY - 112} size={MS} gap={8} font={52} appear={at(scene, 0, 0.05)} color={at(scene, 0, 0.12)}
          dominoes={VDOM.map(([a, b], i) => [a, b, at(scene, 0, 0.3 + i * 0.05)] as [number, number, number])}
          checks={VGREEN.map((n, i) => [n, at(scene, 0, 0.62 + i * 0.03)] as [number, number])} />
        <Tag x={1000} y={200} w={860} start={at(scene, 0, 0.3)} size={58}>
          <span style={{ color: GREEN }}>green 6</span>, <span style={{ color: PURPLE }}>purple 6</span>
        </Tag>
        <Tag x={1000} y={300} w={860} start={at(scene, 0, 0.55)} size={58}>6 dominoes</Tag>
        <Tag x={1000} y={400} w={860} start={at(scene, 0, 0.75)} size={64} color={GREEN}>keeps 6</Tag>
      </div>
      <div style={{ opacity: small * l2Out }}>
        <NumGrid cells={VCELLS} ox={60} oy={320} size={44} gap={4} font={0} color={0} checks={VGREEN.map((n) => [n, 0] as [number, number])} />
        <Tag x={60} y={370} start={0} size={48} color={GREEN}>core 1: 6</Tag>
      </div>
      <div style={{ opacity: small * (1 - ease(f, l2 - 2, 10)) }}>
        {vg(A, 520, at(scene, 1, 0.1), 'core 5', 'keeps 3')}
        {vg(B, 900, at(scene, 1, 0.38), 'core 7', 'keeps 2')}
        {vg(P11, 1280, at(scene, 1, 0.38) - 47, 'core 11', 'keeps 1')}
        {vg(P13, 1560, at(scene, 1, 0.48) - 47, 'core 13', 'keeps 1')}
      </div>
      <div style={{ opacity: ease(f, l2, 8) * l2Out }}>
        {LON.map((n, i) => (
          <NumGrid key={n} cells={[{ n, c: 0, r: 0 }]} ox={560 + i * 190} oy={430} size={104} gap={8} font={52} appear={at(scene, 2, 0.15 + i * 0.12)} checks={[[n, at(scene, 2, 0.15 + i * 0.12) + 14]]} />
        ))}
        <Tag x={960} y={600} w={800} center start={at(scene, 2, 0.8)} size={64} color={GREEN}>5 loners</Tag>
      </div>
      <Parts x={0} y={380} center size={90} gap={30} parts={[[at(scene, 3, 0.06), '6', GREEN], [at(scene, 3, 0.18), '+3'], [at(scene, 3, 0.3), '+2'], [at(scene, 3, 0.4), '+1'], [at(scene, 3, 0.5), '+1'], [at(scene, 3, 0.62), '+5'], [at(scene, 3, 0.8), '=']]} />
      <AnswerPill x={960} y={640} value="18" start={at(scene, 3, 0.9)} round size={120} />
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0.02);
  const out0 = 1 - ease(f, l1, 12);
  const out1 = 1 - ease(f, at(scene, 2, 0.02), 12);
  const pairG = mk(49, famCells(49), [[49, 98]], [], [49]);
  return (
    <>
      <div style={{ opacity: out0 }}>
        <Tag x={960} y={130} w={1500} center start={4} size={52} color={GREEN}>The big idea: families that never clash</Tag>
        <NumGrid cells={MAIN} ox={110} oy={560} size={70} gap={6} font={0} appear={at(scene, 0, 0.15)} color={at(scene, 0, 0.2)} />
        <NumGrid cells={G5.cells} ox={760} oy={560} size={84} gap={6} font={40} appear={at(scene, 0, 0.35)} color={at(scene, 0, 0.4)} />
        <NumGrid cells={pairG.cells} ox={1330} oy={560} size={84} gap={6} font={40} appear={at(scene, 0, 0.55)} color={at(scene, 0, 0.6)} />
        <Tag x={373} y={668} w={400} center start={at(scene, 0, 0.2)} size={48} color={C.muted}>core 1</Tag>
        <Tag x={982} y={668} w={400} center start={at(scene, 0, 0.4)} size={48} color={C.muted}>core 5</Tag>
        <Tag x={1417} y={668} w={400} center start={at(scene, 0, 0.6)} size={48} color={C.muted}>core 49</Tag>
        {[690, 1250].map((x, i) => (
          <div key={x} style={{ position: 'absolute', left: x, top: 230, width: 0, height: 420, borderLeft: `6px dashed ${C.line}`, ...fadeUp(f, at(scene, 0, 0.5 + i * 0.1)) }} />
        ))}
        <Tag x={960} y={730} w={1500} center start={at(scene, 0, 0.75)} size={58} color={C.red}>can't clash across families</Tag>
      </div>
      <div style={{ opacity: ease(f, l1, 12) * out1 }}>
        <NumGrid {...mainBase} appear={l1} color={at(scene, 1, 0.12)} dominoes={DOM1.map(([a, b], i) => [a, b, at(scene, 1, 0.5 + i * 0.03)] as [number, number, number])} />
        <Tag x={1020} y={250} w={820} start={at(scene, 1, 0.3)} size={60} color={GREEN}>keep the bigger color</Tag>
        <Tag x={1020} y={380} w={820} start={at(scene, 1, 0.55)} size={60}>dominoes check it</Tag>
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(PROMPT_SET, true, 10, 'Biggest subset: no number double or triple another.'),
  families: Families,
  grid1: Grid1,
  checker: Checker,
  dominoes: Dominoes,
  others: Others,
  total: Total,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause('\\{1,2,\\dots,30\\}', false, 10, 'Same rule. The most numbers you can pick?'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 5" /> : null;

// YouTube thumbnail (`2026-11-07-no-double-triple-thumb`, render.sh → poster.jpg): the trap + the set 1..100 and the two forbidden pairs, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>50?</span>]}>
    <div style={{ width: '100%', height: '100%', background: C.card, borderRadius: 36, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
      <Tex tex={PROMPT_SET} size={84} />
      <div style={{ fontSize: 58, fontWeight: 900, color: C.muted }}>never both</div>
      <div style={{ fontSize: 96, fontWeight: 900, color: C.red }}>n and 2n</div>
      <div style={{ fontSize: 96, fontWeight: 900, color: C.amber }}>n and 3n</div>
    </div>
  </ThumbFrame>
);

import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, mulberry32, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-girls-apart-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const GIRL = '#e2478f';
export const BOY = C.blue;
const P = (f: number, st: number) => pop(f, st, 30);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** x of spot i (0-based) in a row of n spots. */
const sx = (i: number, cx = 960, sp = 150, n = 8) => cx + (i - (n - 1) / 2) * sp;

// ---------- pieces ----------

/** A kid. k = girl or boy, optional subscript name (G₁…). */
const Tok: React.FC<{ x: number; y: number; k: 'G' | 'B'; sub?: number; r?: number; o?: number; s?: number; ring?: string; subO?: number; letter?: boolean }> = ({
  x, y, k, sub, r = 52, o = 1, s = 1, ring, subO = 1, letter = true,
}) => {
  if (o <= 0 || s <= 0) return null;
  const col = k === 'G' ? GIRL : BOY;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {ring && <circle r={r + 12} fill="none" stroke={ring} strokeWidth={8} />}
      <circle r={r} fill={col} />
      {letter && (
        <text x={sub != null ? -r * 0.14 * subO : 0} y={2} fill="#fff" fontFamily={ZH_FONT} fontWeight={900} fontSize={r * 0.95} textAnchor="middle" dominantBaseline="central">
          {k === 'G' ? '女' : '男'}
          {sub != null && (
            <tspan fontSize={r * 0.85} dy={r * 0.28} opacity={subO}>
              {sub}
            </tspan>
          )}
        </text>
      )}
    </g>
  );
};

/** Empty numbered spots. */
const Slots: React.FC<{ y: number; cx?: number; sp?: number; r?: number; n?: number; o?: number; numO?: number; xs?: (i: number) => number }> = ({
  y, cx = 960, sp = 150, r = 52, n = 8, o = 1, numO = 1, xs,
}) => (
  <g>
    {range(n).map((i) => {
      const x = xs ? xs(i) : sx(i, cx, sp, n);
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity={0.7 * o} stroke={C.line} strokeWidth={5} strokeDasharray="12 9" opacity={o} />
          <text x={x} y={y + r + 44} fill={C.muted} opacity={numO * o} fontFamily={NUNITO} fontWeight={800} fontSize={48} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      );
    })}
  </g>
);

/** Formula assembled part by part: each part fades in at its own frame. */
const Parts: React.FC<{ x: number; y: number; parts: [string, number][]; size?: number; color?: string; gap?: number; w?: number; center?: boolean; opacity?: number }> = ({
  x, y, parts, size = 60, color = C.ink, gap = 18, w, center, opacity = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: center && w ? x - w / 2 : x, top: y, width: w, display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', gap, whiteSpace: 'nowrap', opacity }}>
      {parts.map(([t, st], i) => (
        <span key={i} style={fadeUp(f, st, 10)}>
          <Tex tex={/^(\+|\\times)/.test(t) ? `{}${t}` : t} size={size} color={color} />
        </span>
      ))}
    </div>
  );
};

/** A fraction with hanzi on top and bottom (hanzi never go inside KaTeX, whose \text font is serif). */
const HFrac: React.FC<{ top: React.ReactNode; bot: React.ReactNode; size: number; color?: string }> = ({ top, bot, size, color = C.ink }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', fontFamily: ZH_FONT, fontSize: size, fontWeight: 800, color, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
    <div style={{ padding: '0 0.2em' }}>{top}</div>
    <div style={{ alignSelf: 'stretch', height: Math.max(3, size * 0.06), background: color, borderRadius: 2, margin: '0.08em 0' }} />
    <div style={{ padding: '0 0.2em' }}>{bot}</div>
  </div>
);

/** Mixed hanzi + maths on one line: strings are KaTeX, {z} parts are hanzi in ZH_FONT. */
const ZhMath: React.FC<{ p: (string | { z: string })[]; size: number; color?: string }> = ({ p, size, color = C.ink }) => (
  <span style={{ whiteSpace: 'nowrap', color, display: 'inline-flex', alignItems: 'center' }}>
    {p.map((x, i) =>
      typeof x === 'string' ? (
        <Tex key={i} tex={x} size={size} color={color} />
      ) : (
        <span key={i} style={{ fontFamily: ZH_FONT, fontSize: size * 0.9, fontWeight: 800, margin: '0 0.15em' }}>{x.z}</span>
      ),
    )}
  </span>
);

const PAUSE_LABEL = (
  <span style={{ fontFamily: ZH_FONT }}>
    暂停，试一试<span style={{ color: C.primary }}>！</span>
  </span>
);

export const CH = ['\\dfrac{1}{14}', '\\dfrac{5}{28}', '\\dfrac{5}{14}', '\\dfrac{3}{8}', '\\dfrac{1}{2}'];

const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; hi?: number; hiAt?: number }> = ({ x, y, start, hi, hiAt = Infinity }) => {
  const f = useCurrentFrame();
  const h = ease(f, Math.min(hiAt, 1e7), 12);
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 24, alignItems: 'center' }}>
      {CH.map((c, i) => {
        const isHi = hi === i;
        const fu = fadeUp(f, start(i), 10);
        const dimO = hi !== undefined && !isHi ? 1 - 0.55 * h : 1;
        return (
          <div
            key={i}
            style={{
              background: C.card,
              borderRadius: 20,
              padding: '10px 26px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: `6px solid ${isHi && h > 0.5 ? C.green : 'transparent'}`,
              boxShadow: '0 4px 14px rgba(30,40,80,0.07)',
              opacity: (fu.opacity as number) * dimO,
              transform: `${fu.transform} scale(${isHi ? 1 + 0.12 * h : 1})`,
            }}
          >
            <span style={{ color: isHi && h > 0.5 ? C.green : C.muted, fontSize: 40, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={60} />
          </div>
        );
      })}
    </div>
  );
};

const Chime: React.FC<{ start: number }> = ({ start }) => (
  <Sequence from={start} durationInFrames={60} layout="none">
    <Audio src={CHIME} volume={0.3} />
  </Sequence>
);

// ---------- scenes ----------

// intro: shuffle eight kids, settle on a row where two girls touch.
const FINAL_POS = [1, 2, 5, 0, 3, 4, 6, 7]; // ids 0-2 are girls
const shuf = (k: number): number[] => {
  const r = mulberry32(k * 7919 + 13);
  const a = range(8);
  for (let i = 7; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const settle = at(scene, 1, 0);
  const kmax = Math.ceil(settle / 9);
  const posAt = (k: number) => (k >= kmax ? FINAL_POS : shuf(k));
  const k = Math.floor(f / 9);
  const p = ease(f, k * 9, 6);
  const pa = posAt(k - 1);
  const pb = posAt(k);
  const y = 470;
  const sp = 170;
  const flash = ease(f, at(scene, 1, 0.3), 8) * (0.55 + 0.45 * Math.sin((f - at(scene, 1, 0.3)) * 0.35));
  return (
    <>
      <Text x={960} y={140} w={1700} size={68} weight={900} align="center" style={fadeUp(f, 0)}>
        会不会有两个女生<span style={{ color: C.red }}>挨在一起</span>？
      </Text>
      <Stage>
        {range(8).map((id) => (
          <Tok key={id} x={sx(lerp(pa[id], pb[id], p), 960, sp)} y={y} k={id < 3 ? 'G' : 'B'} r={56} s={P(f, 4 + id * 2)} />
        ))}
        {flash > 0 && (
          <rect x={sx(1, 960, sp) - 56 - 16} y={y - 56 - 16} width={sp + 112 + 32} height={112 + 32} rx={44} fill="none" stroke={C.red} strokeWidth={10} opacity={flash} />
        )}
      </Stage>
      <Text x={sx(1.5, 960, sp)} y={y + 100} w={500} size={52} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.45))}>
        挨在一起！
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 635, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -4 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const TokenGroup: React.FC<{ cx: number; y: number; nB: number; nG: number; sp?: number; r?: number; start: (kind: 'B' | 'G', i: number) => number }> = ({ cx, y, nB, nG, sp = 150, r = 52, start }) => {
  const f = useCurrentFrame();
  const n = nB + nG;
  return (
    <Stage>
      {range(n).map((i) => {
        const k = i < nB ? 'B' : 'G';
        return <Tok key={i} x={sx(i, cx, sp, n)} y={y} k={k} r={r} s={P(f, start(k, k === 'B' ? i : i - nB))} />;
      })}
    </Stage>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, background: C.card, borderRadius: 32, padding: '34px 48px', fontSize: 52, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        <Mark on={at(scene, 1, 0.1)}>5 个男生和 3 个女生</Mark>随机站成一排，<Mark on={at(scene, 1, 0.6)}>每种排法的可能性都相同</Mark>。
        <Mark on={at(scene, 2, 0.15)}>没有任何两个女生相邻的概率是多少？</Mark>
      </div>
      <TokenGroup cx={960} y={520} nB={5} nG={3} sp={150} start={(k, i) => (k === 'B' ? at(scene, 1, 0.1 + i * 0.07) : at(scene, 1, 0.5 + i * 0.07))} />
      <ChoiceRow x={457} y={680} start={(i) => at(scene, 3, 0.15 + i * 0.13)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y1 = 290;
  const y2 = 520;
  const good = ['G', 'B', 'G', 'B', 'B', 'G', 'B', 'B'] as const;
  const bad = ['B', 'G', 'G', 'B', 'B', 'G', 'B', 'B'] as const;
  const hi = ease(f, at(scene, 1, 0.65), 12);
  const red = ease(f, at(scene, 2, 0.6), 10);
  return (
    <>
      <Stage>
        <Slots y={y1} o={ease(f, 0, 12)} numO={ease(f, 6, 14)} />
        <Slots y={y2} o={ease(f, at(scene, 2), 12)} numO={0} />
        {/* boys between girls: spots 2, 4, 5 */}
        {[1, 3, 4].map((i) => (
          <circle key={i} cx={sx(i)} cy={y1} r={58} fill="none" stroke={C.green} strokeWidth={9} opacity={hi} />
        ))}
        {good.map((k, i) => (
          <Tok key={`g${i}`} x={sx(i)} y={y1} k={k} s={P(f, at(scene, 1, 0.05 + i * 0.06))} />
        ))}
        {bad.map((k, i) => (
          <Tok key={`b${i}`} x={sx(i)} y={y2} k={k} s={P(f, at(scene, 2, 0.05 + i * 0.06))} />
        ))}
        <rect x={sx(1) - 52 - 16} y={y2 - 52 - 16} width={150 + 104 + 32} height={104 + 32} rx={44} fill="none" stroke={C.red} strokeWidth={10} opacity={red} />
        <g opacity={hi}>
          <circle cx={1790} cy={y1} r={36} fill={C.green} />
          <path d={`M ${1790 - 15} ${y1 + 1} L ${1790 - 4} ${y1 + 12} L ${1790 + 17} ${y1 - 12}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g opacity={red}>
          <circle cx={1790} cy={y2} r={36} fill={C.red} />
          <path d={`M ${1790 - 13} ${y2 - 13} L ${1790 + 13} ${y2 + 13} M ${1790 + 13} ${y2 - 13} L ${1790 - 13} ${y2 + 13}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
        </g>
      </Stage>
      <Text x={70} y={y1 - 26} w={150} size={44} weight={900} color={C.green} style={{ opacity: hi }}>
        好的
      </Text>
      <Text x={70} y={y2 - 26} w={150} size={44} weight={900} color={C.red} style={{ opacity: red }}>
        坏的
      </Text>
      <div style={{ position: 'absolute', left: 360, top: 640, width: 1200, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 3, 0.3), 10) }}>
        <HFrac top={<span style={{ color: C.green }}>好的排法</span>} bot="所有排法" size={64} />
      </div>
    </>
  );
};

const TRY1_Q = '没有任何两个女生相邻的概率是多少？';

const PauseScene: React.FC<{ scene: Parameters<SceneComponent>[0]['scene']; nB: number; nG: number; seconds: number; choices?: boolean }> = ({ scene, nB, nG, seconds, choices }) => {
  const f = useCurrentFrame();
  const n = nB + nG;
  const sp = n === 8 ? 100 : 118;
  return (
    <>
      <Pill x={150} y={150} color={C.violet} style={fadeUp(f, 4)}>
        {n === 8 ? '5 个男生，3 个女生' : '4 个男生，3 个女生'}
      </Pill>
      <TokenGroup cx={150 + (sp * (n - 1)) / 2 + 52} y={330} nB={nB} nG={nG} sp={sp} r={44} start={(k, i) => 6 + i * 3} />
      <Text x={150} y={440} w={950} size={52} weight={800} style={fadeUp(f, 12)}>
        {TRY1_Q}
      </Text>
      {choices && <ChoiceRow x={150} y={610} start={(i) => 16 + i * 4} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={480} tick={TICK} label={PAUSE_LABEL} />
    </>
  );
};

// ---------- solution 1 ----------

const GIRL_ORDERS = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]];
const BOY_ORDERS = [[1, 2, 3, 4, 5], [2, 1, 3, 4, 5], [2, 3, 1, 4, 5], [5, 4, 3, 2, 1], [3, 1, 5, 2, 4], [4, 5, 1, 3, 2]];

const Seats: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 290;
  const sw = at(scene, 5, 0.6);
  const switched = f >= sw;
  const gSet = switched ? [1, 2, 5] : [0, 3, 6];
  const bSet = range(8).filter((i) => !gSet.includes(i));
  const gi = f < at(scene, 2, 0.95) && f >= at(scene, 2, 0.05) ? Math.min(5, Math.floor(((f - at(scene, 2, 0.05)) / (at(scene, 2, 0.95) - at(scene, 2, 0.05))) * 6)) : 0;
  const bi = f >= at(scene, 3, 0.1) && f < at(scene, 3, 0.95) ? Math.min(5, Math.floor(((f - at(scene, 3, 0.1)) / (at(scene, 3, 0.85))) * 6 * 0.85)) : 0;
  const gOrder = GIRL_ORDERS[gi];
  const bOrder = BOY_ORDERS[Math.min(5, bi)];
  const subO = 1 - ease(f, at(scene, 6, 0.1), 22);
  const gStart = [at(scene, 1, 0.45), at(scene, 1, 0.62), at(scene, 1, 0.8)];
  return (
    <>
      <Stage>
        <Slots y={y} o={ease(f, 0, 12)} numO={ease(f, 6, 14)} />
        {gSet.map((spot, j) => (
          <Tok key={`g${j}${switched}`} x={sx(spot)} y={y} k="G" sub={gOrder[j]} subO={subO} s={P(f, switched ? sw : gStart[j])} />
        ))}
        {bSet.map((spot, j) => (
          <Tok key={`b${j}${switched}`} x={sx(spot)} y={y} k="B" sub={bOrder[j]} subO={subO} s={P(f, switched ? sw + 3 : at(scene, 3, 0.04 + j * 0.05))} />
        ))}
      </Stage>
      <Text x={960} y={140} w={1500} size={52} weight={800} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.35)), opacity: ease(f, at(scene, 0, 0.35), 14) * (1 - ease(f, at(scene, 6, 0.1), 10)) }}>
        只看女生站在<span style={{ color: GIRL }}>哪些位置</span>
      </Text>
      <Parts x={200} y={450} size={64} color={GIRL} parts={[['3 \\times 2 \\times 1', at(scene, 2, 0.45)], ['= 6', at(scene, 2, 0.85)]]} />
      <Parts x={200} y={540} size={64} color={BOY} parts={[['5 \\times 4 \\times 3 \\times 2 \\times 1', at(scene, 3, 0.5)], ['= 120', at(scene, 4, 0.3)]]} />
      <Parts x={200} y={640} size={76} color={C.green} parts={[['6 \\times 120 = 720', at(scene, 5, 0.12)]]} />
      {switched && (
        <>
          <Text x={1150} y={585} w={720} size={46} weight={900} color={C.red} style={fadeUp(f, sw)}>
            挨着的一组：2、3、6
          </Text>
          <Parts x={1150} y={640} size={76} color={C.green} parts={[['6 \\times 120 = 720', sw + 14]]} />
        </>
      )}
      <Pill x={960 - 330} y={135} color={C.primary} style={{ ...fadeUp(f, at(scene, 6, 0.3)), fontSize: 46, width: 660, textAlign: 'center' }}>
        只数位置，不管谁是谁
      </Pill>
    </>
  );
};

const All56: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 290;
  const picks = [0, 3, 6];
  const orders = ['1-4-7', '1-7-4', '4-1-7', '4-7-1', '7-1-4', '7-4-1'];
  return (
    <>
      <Stage>
        <Slots y={y} o={ease(f, 0, 12)} numO={ease(f, 4, 14)} />
        {picks.map((spot, j) => (
          <Tok key={j} x={sx(spot)} y={y} k="G" s={P(f, at(scene, 1, 0.4 + j * 0.2))} />
        ))}
      </Stage>
      <Text x={960} y={140} w={1500} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>
        从 8 个位置里选 3 个
      </Text>
      <Parts x={200} y={470} size={74} parts={[['8', at(scene, 1, 0.55)], ['\\times 7', at(scene, 1, 0.72)], ['\\times 6', at(scene, 1, 0.86)], ['= 336', at(scene, 2, 0.12)]]} />
      <div style={{ position: 'absolute', left: 200, top: 580, display: 'flex', gap: 18 }}>
        {orders.map((o, i) => (
          <div key={o} style={{ ...fadeUp(f, at(scene, 2, 0.42 + i * 0.08), 10), background: C.card, borderRadius: 18, padding: '8px 22px', fontSize: 50, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
            {o}
          </div>
        ))}
      </div>
      <Text x={200} y={680} w={1200} size={42} weight={700} color={C.muted} style={fadeUp(f, at(scene, 2, 0.5))}>
        同一组位置，有 6 种选的顺序
      </Text>
      <Parts x={200} y={740} size={76} color={C.green} parts={[['336 \\div 6 = 56', at(scene, 3, 0.5)]]} />
    </>
  );
};

// ---------- list ----------

type Chip = { a: number; b: number; c: number; col: number; row: number; ci: number; line: number; t: number };
const CHIP_T: Record<string, [number, number]> = {
  135: [2, 0.62], 136: [2, 0.72], 137: [2, 0.82], 138: [2, 0.92],
  146: [3, 0.26], 147: [3, 0.3], 148: [3, 0.34], 157: [3, 0.38], 158: [3, 0.43], 168: [3, 0.5],
  246: [5, 0.3], 247: [5, 0.35], 248: [5, 0.4], 257: [5, 0.45], 258: [5, 0.5], 268: [5, 0.58],
  357: [6, 0.12], 358: [6, 0.18], 368: [6, 0.24],
  468: [6, 0.8],
};
const CHIPS: Chip[] = [];
for (let a = 1; a <= 4; a++)
  for (let b = a + 2; b <= 6; b++)
    for (let c = b + 2; c <= 8; c++) {
      const [line, t] = CHIP_T[`${a}${b}${c}`];
      CHIPS.push({ a, b, c, col: a - 1, row: b - (a + 2), ci: c - (b + 2), line, t });
    }
const COLX = [90, 750, 1260, 1620];
const ROW0 = 345;

const BIG_X = (i: number) => 150 + i * 112;
const BIG_Y = 215;

const ListScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const EV: [number, number | null, number | null][] = [
    [at(scene, 1, 0.2), null, null],
    [at(scene, 1, 0.85), 3, null],
    [at(scene, 2, 0.62), 3, 5], [at(scene, 2, 0.72), 3, 6], [at(scene, 2, 0.82), 3, 7], [at(scene, 2, 0.92), 3, 8],
    [at(scene, 3, 0.26), 4, 6], [at(scene, 3, 0.3), 4, 7], [at(scene, 3, 0.34), 4, 8],
    [at(scene, 3, 0.38), 5, 7], [at(scene, 3, 0.43), 5, 8], [at(scene, 3, 0.5), 6, 8],
  ];
  let ev: [number, number | null, number | null] | null = null;
  for (const e of EV) if (f >= e[0]) ev = e;
  const bigO = 1 - ease(f, at(scene, 4, 0.5), 14);
  const g2 = ev ? ev[1] : null;
  const g3 = ev ? ev[2] : null;
  let xSpot: number | null = null;
  if (g2 == null) xSpot = f >= at(scene, 1, 0.55) ? 2 : null;
  else if (f >= at(scene, 2, 0.2)) xSpot = g2 + 1;
  const hdr = (k: number, st: number, txt: string) => (
    <Text key={k} x={COLX[k]} y={285} w={560} size={40} weight={900} color={GIRL} style={fadeUp(f, st)}>
      {txt}
    </Text>
  );
  const fadeAll = 1 - 1.0 * ease(f, at(scene, 8, 0.0), 14);
  return (
    <>
      <Stage>
        <g opacity={bigO}>
          {range(8).map((i) => (
            <g key={i}>
              <circle cx={BIG_X(i)} cy={BIG_Y} r={46} fill="#fff" fillOpacity={0.8} stroke={C.line} strokeWidth={5} strokeDasharray="12 9" />
              <text x={BIG_X(i)} y={BIG_Y + 1} fill={C.muted} fontFamily={NUNITO} fontWeight={800} fontSize={48} textAnchor="middle" dominantBaseline="central">
                {i + 1}
              </text>
            </g>
          ))}
          <Tok x={BIG_X(0)} y={BIG_Y} k="G" r={46} s={P(f, at(scene, 1, 0.2))} />
          {g2 != null && <Tok x={BIG_X(g2 - 1)} y={BIG_Y} k="G" r={46} s={1} />}
          {g3 != null && <Tok x={BIG_X(g3 - 1)} y={BIG_Y} k="G" r={46} s={1} />}
          {xSpot != null && (
            <g stroke={C.red} strokeWidth={12} strokeLinecap="round">
              <line x1={BIG_X(xSpot - 1) - 24} y1={BIG_Y - 24} x2={BIG_X(xSpot - 1) + 24} y2={BIG_Y + 24} />
              <line x1={BIG_X(xSpot - 1) + 24} y1={BIG_Y - 24} x2={BIG_X(xSpot - 1) - 24} y2={BIG_Y + 24} />
            </g>
          )}
        </g>
        <g opacity={fadeAll}>
          {CHIPS.map((ch) => {
            const st = at(scene, ch.line, ch.t);
            const s = P(f, st);
            if (s <= 0) return null;
            const x = COLX[ch.col] + ch.ci * 150;
            const y = ROW0 + ch.row * 92;
            return (
              <g key={`${ch.a}${ch.b}${ch.c}`} transform={`translate(${x + 69} ${y + 42}) scale(${s}) translate(${-69} ${-42})`}>
                <rect width={138} height={84} rx={16} fill="#fff" stroke={C.line} strokeWidth={3} />
                <text x={69} y={32} fill={C.ink} fontFamily={NUNITO} fontWeight={800} fontSize={48} textAnchor="middle" dominantBaseline="central">
                  {ch.a}-{ch.b}-{ch.c}
                </text>
                {range(8).map((i) => {
                  const lit = i + 1 === ch.a || i + 1 === ch.b || i + 1 === ch.c;
                  return <circle key={i} cx={13 + i * 16} cy={66} r={6.5} fill={lit ? GIRL : C.line} />;
                })}
              </g>
            );
          })}
        </g>
      </Stage>
      <div style={{ opacity: fadeAll }}>
        {hdr(0, at(scene, 1, 0.1), '第一个女生：1 号')}
        {hdr(1, at(scene, 5, 0.05), '第一个女生：2 号')}
        {hdr(2, at(scene, 6, 0.02), '第一个：3 号')}
        {hdr(3, at(scene, 6, 0.47), '第一个：4 号')}
        <Parts x={COLX[0]} y={735} size={56} color={GIRL} gap={10} parts={[['4', at(scene, 4, 0.03)], ['+3', at(scene, 4, 0.1)], ['+2', at(scene, 4, 0.18)], ['+1', at(scene, 4, 0.26)], ['=10', at(scene, 4, 0.4)]]} />
        <Parts x={COLX[1]} y={735} size={56} color={GIRL} gap={10} parts={[['3', at(scene, 5, 0.38)], ['+2', at(scene, 5, 0.48)], ['+1', at(scene, 5, 0.6)], ['=6', at(scene, 5, 0.82)]]} />
        <Parts x={COLX[2]} y={735} size={56} color={GIRL} gap={10} parts={[['2', at(scene, 6, 0.2)], ['+1', at(scene, 6, 0.27)], ['=3', at(scene, 6, 0.38)]]} />
        <Parts x={COLX[3]} y={735} size={56} color={GIRL} gap={10} parts={[['1', at(scene, 6, 0.68)]]} />
      </div>
      <Text x={1330} y={148} w={520} size={48} weight={800} color={C.muted} style={fadeUp(f, 6)}>
        一共 56 组
      </Text>
      <Parts x={140} y={160} size={78} color={C.green} gap={14} parts={[['10', at(scene, 7, 0.02)], ['+6', at(scene, 7, 0.15)], ['+3', at(scene, 7, 0.27)], ['+1', at(scene, 7, 0.38)], ['= 20', at(scene, 7, 0.68)]]} opacity={1 - ease(f, at(scene, 8, 0.0), 10)} />
      <Parts x={960} y={250} w={1500} center size={124} color={C.ink} parts={[['\\dfrac{20}{56}', at(scene, 8, 0.05)], ['= \\dfrac{5}{14}', at(scene, 8, 0.62)]]} />
      <Text x={946} y={440} w={200} size={48} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 8, 0.4))}>
        ÷ 4
      </Text>
      <ChoiceRow x={457} y={600} start={(i) => at(scene, 8, 0.6)} hi={2} hiAt={at(scene, 8, 0.8)} />
      <Answer x={1700} y={440} value="C" chime={CHIME} start={at(scene, 8, 0.88)} />
    </>
  );
};

// ---------- solution 2: gaps ----------

const bxs = (i: number) => 960 + (i - 2) * 250; // five boys
const gapx = (j: number) => (j === 0 ? bxs(0) - 125 : j === 5 ? bxs(4) + 125 : (bxs(j - 1) + bxs(j)) / 2);

const Marker: React.FC<{ x: number; y: number; o?: number; s?: number; color?: string; red?: boolean; w?: number; h?: number }> = ({ x, y, o = 1, s = 1, color = C.violet, red, w = 64, h = 120 }) =>
  o * s <= 0 ? null : (
    <rect x={x - (w * s) / 2} y={y - (h * s) / 2} width={w * s} height={h * s} rx={16} fill={red ? 'rgba(239,67,67,0.14)' : 'rgba(123,97,255,0.08)'} stroke={red ? C.red : color} strokeWidth={6} strokeDasharray="14 9" opacity={o} />
  );

const GapsScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 310;
  // L2: two girls into the gap j=2
  const gj = 2;
  const spread = ease(f, at(scene, 2, 0.15), 12) * (1 - ease(f, at(scene, 3, 0.0), 12));
  const bx = (i: number) => bxs(i) + (i < gj ? -60 : 60) * spread;
  const girlsO = spread;
  const flashRed = ease(f, at(scene, 2, 0.45), 8) * (1 - ease(f, at(scene, 3, 0.0), 10));
  // L3-L4: choose gaps 0, 2, 4 -> girls above the markers; L4 turn into a numbered row
  const hov = [at(scene, 3, 0.08), at(scene, 3, 0.18), at(scene, 3, 0.28)];
  const tr = ease(f, at(scene, 4, 0.12), 24);
  const girlGaps = [0, 2, 4];
  const girlSpots = [0, 3, 6];
  const boySpots = [1, 2, 4, 5, 7];
  const markerO = 1 - tr;
  const numO = ease(f, at(scene, 4, 0.22), 14);
  const endsHi = ease(f, at(scene, 1, 0.55), 10);
  return (
    <>
      <Stage>
        <g opacity={1 - tr * 0 }>
          {range(6).map((j) => {
            const end = j === 0 || j === 5;
            const st = end ? at(scene, 1, j === 0 ? 0.55 : 0.65) : at(scene, 1, 0.12 + (j - 1) * 0.1);
            const gx = j === gj ? gapx(j) : gapx(j) + (j < gj ? -60 : 60) * spread;
            const bad = j === gj && flashRed > 0;
            return <Marker key={j} x={gx} y={y} o={markerO} s={P(f, st)} color={end ? C.amber : C.violet} red={bad} w={bad ? 64 + 80 * spread : 64} />;
          })}
        </g>
        <Slots y={y} o={tr} numO={numO} />
        {range(5).map((i) => (
          <Tok key={`b${i}`} x={lerp(bx(i), sx(boySpots[i]), tr)} y={y} k="B" s={P(f, 4 + i * 4)} />
        ))}
        {girlsO > 0 && (
          <>
            <Tok x={gapx(gj) - 54} y={y} k="G" o={girlsO} s={1} />
            <Tok x={gapx(gj) + 54} y={y} k="G" o={girlsO} s={1} />
          </>
        )}
        {girlGaps.map((g, j) => (
          <Tok key={`h${j}`} x={lerp(gapx(g), sx(girlSpots[j]), tr)} y={lerp(y - 135, y, tr)} k="G" s={P(f, hov[j])} />
        ))}
        {flashRed > 0 && (
          <g opacity={flashRed * (0.6 + 0.4 * Math.sin(f * 0.5))}>
            <circle cx={gapx(gj)} cy={y - 120} r={30} fill={C.red} />
            <path d={`M ${gapx(gj) - 11} ${y - 131} L ${gapx(gj) + 11} ${y - 109} M ${gapx(gj) + 11} ${y - 131} L ${gapx(gj) - 11} ${y - 109}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
      </Stage>
      <div style={{ opacity: 1 - tr }}>
        {[0, 5].map((j) => (
          <Text key={j} x={gapx(j)} y={y + 74} w={160} size={40} weight={800} color={C.amber} align="center" style={{ opacity: endsHi }}>
            两头
          </Text>
        ))}
      </div>
      <Parts x={320} y={470} size={66} parts={[['4', at(scene, 1, 0.4)], ['+ 1', at(scene, 1, 0.56)], ['+ 1', at(scene, 1, 0.66)], ['= 6', at(scene, 1, 0.82)]]} opacity={1 - ease(f, at(scene, 2, 0.0), 10)} />
      <Pill x={560} y={470} color={C.red} style={{ ...fadeUp(f, at(scene, 2, 0.5)), fontSize: 42, opacity: flashRed }}>
        挨在一起了！
      </Pill>
      <Pill x={560} y={550} color={C.primary} style={{ ...fadeUp(f, at(scene, 2, 0.65)), fontSize: 42, opacity: flashRed }}>
        每个空隙最多 1 个女生
      </Pill>
      <Parts x={320} y={465} size={72} parts={[['\\dfrac{6 \\times 5 \\times 4}{6}', at(scene, 3, 0.38)], ['= 20', at(scene, 4, 0.1)]]} />
      <Parts x={940} y={470} size={72} parts={[['\\dfrac{20}{56} = \\dfrac{5}{14}', at(scene, 4, 0.2)]]} color={C.green} />
      <Pill x={1180} y={700} color={C.violet} style={{ ...fadeUp(f, at(scene, 5, 0.3)), fontSize: 42 }}>
        队伍长？用空隙！
      </Pill>
    </>
  );
};

// ---------- traps ----------

const CARD_W = 880;
const CARD_H = 340;
const CARD_POS: [number, number][] = [[60, 125], [980, 125], [60, 490], [980, 490]];

const MG_X = (ox: number, k: number) => ox + 40 * k + 20;

const MiniGaps: React.FC<{ ox: number; oy: number; cross?: number[]; crossO?: number; hiEnds?: number; girl?: number; girlO?: number; scale?: number }> = ({ ox, oy, cross = [], crossO = 0, hiEnds = 0, girl, girlO = 0 }) => (
  <g>
    {range(6).map((j) => {
      const x = MG_X(ox, 2 * j);
      const end = j === 0 || j === 5;
      return (
        <g key={j}>
          <rect x={x - 13} y={oy - 32} width={26} height={64} rx={8} fill={end && hiEnds > 0 ? `rgba(245,159,10,${0.25 * hiEnds})` : 'none'} stroke={end && hiEnds > 0 ? C.amber : C.violet} strokeWidth={4} strokeDasharray="8 6" />
          {cross.includes(j) && (
            <g stroke={C.red} strokeWidth={8} strokeLinecap="round" opacity={crossO * (j === 0 ? Math.max(0, 1 - girlO) : 1)}>
              <line x1={x - 18} y1={oy - 24} x2={x + 18} y2={oy + 24} />
              <line x1={x + 18} y1={oy - 24} x2={x - 18} y2={oy + 24} />
            </g>
          )}
        </g>
      );
    })}
    {range(5).map((i) => (
      <circle key={i} cx={MG_X(ox, 2 * i + 1)} cy={oy} r={17} fill={BOY} />
    ))}
    {girl !== undefined && girlO > 0 && <Tok x={MG_X(ox, 2 * girl)} y={oy} k="G" r={20} s={girlO} letter={false} />}
  </g>
);

const TrapCard: React.FC<{ i: number; letter: string; at0: number; children: React.ReactNode; dim?: number }> = ({ i, letter, at0, children, dim = 1 }) => {
  const f = useCurrentFrame();
  const o = ease(f, at0, 12) * dim;
  const [x, y] = CARD_POS[i];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, background: C.card, borderRadius: 28, border: `6px solid ${C.red}`, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', opacity: o, transform: `translateY(${(1 - o / dim) * 24}px)` }}>
      <div style={{ position: 'absolute', left: 30, top: 14, fontSize: 56, fontWeight: 900, color: C.red }}>{letter}</div>
      <div style={{ position: 'absolute', right: -24, top: -24, width: 60, height: 60, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 38, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</div>
      {children}
    </div>
  );
};

const Local: React.FC<{ x: number; y: number; start: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, start, children, style }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start, 10), ...style }}>{children}</div>;
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const habit = ease(f, at(scene, 8, 0.1), 14);
  const dim = 1 - 0.8 * habit;
  const eBar = ease(f, at(scene, 7, 0.25), 16);
  const leftW = lerp(220, (440 * 20) / 56, eBar);
  const kids = ['B', 'G', 'B', 'B', 'G', 'B', 'G', 'B'] as const;
  return (
    <>
      {/* B */}
      <TrapCard i={0} letter="B" at0={at(scene, 1, 0.02)} dim={dim}>
        <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <MiniGaps ox={30} oy={150} cross={[0]} crossO={ease(f, at(scene, 1, 0.12), 10)} />
        </svg>
        <Local x={30} y={200} start={at(scene, 1, 0.45)}>
          <ZhMath p={[{ z: '5 个空隙选 3 个' }, '\\to 10']} size={50} color={C.red} />
        </Local>
        <Local x={30} y={268} start={at(scene, 2, 0.6)} style={{ fontSize: 40, fontWeight: 800, color: C.red }}>
          漏掉了一头
        </Local>
        <Local x={570} y={95} start={at(scene, 1, 0.82)}>
          <Tex tex={'\\dfrac{10}{56}'} size={54} color={C.red} />
        </Local>
        <Local x={700} y={95} start={at(scene, 2, 0.1)}>
          <Tex tex={'= \\dfrac{5}{28}'} size={54} color={C.red} />
        </Local>
      </TrapCard>
      {/* A */}
      <TrapCard i={1} letter="A" at0={at(scene, 3, 0.02)} dim={dim}>
        <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <MiniGaps ox={30} oy={150} cross={[0, 5]} crossO={ease(f, at(scene, 3, 0.3), 10)} girl={0} girlO={P(f, at(scene, 4, 0.6))} />
          {f >= at(scene, 4, 0.7) && (
            <g opacity={ease(f, at(scene, 4, 0.7), 8)}>
              <circle cx={MG_X(30, 0) + 40} cy={104} r={22} fill={C.green} />
              <path d={`M ${MG_X(30, 0) + 30} 104 L ${MG_X(30, 0) + 38} 112 L ${MG_X(30, 0) + 52} 95`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </svg>
        <Local x={30} y={200} start={at(scene, 3, 0.58)}>
          <ZhMath p={[{ z: '4 个空隙选 3 个' }, '\\to 4']} size={50} color={C.red} />
        </Local>
        <Local x={30} y={268} start={at(scene, 4, 0.75)} style={{ fontSize: 40, fontWeight: 800, color: C.green }}>
          女生可以站在两头
        </Local>
        <Local x={570} y={95} start={at(scene, 4, 0.1)}>
          <Tex tex={'\\dfrac{4}{56}'} size={54} color={C.red} />
        </Local>
        <Local x={700} y={95} start={at(scene, 4, 0.35)}>
          <Tex tex={'= \\dfrac{1}{14}'} size={54} color={C.red} />
        </Local>
      </TrapCard>
      {/* D */}
      <TrapCard i={2} letter="D" at0={at(scene, 5, 0.02)} dim={dim}>
        <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', left: 0, top: 0 }}>
          {kids.map((k, i) => (
            <Tok key={i} x={50 + i * 54} y={110} k={k} r={22} letter={false} s={P(f, at(scene, 5, 0.1 + i * 0.03))} />
          ))}
        </svg>
        <Local x={30} y={142} start={at(scene, 5, 0.3)}>
          <HFrac top="3 个女生" bot="8 个小朋友" size={40} color={C.red} />
        </Local>
        <Local x={400} y={130} start={at(scene, 5, 0.6)}>
          <Tex tex={'= \\dfrac{3}{8}'} size={64} color={C.red} />
        </Local>
        <Local x={30} y={272} start={at(scene, 5, 0.8)} style={{ fontSize: 40, fontWeight: 800, color: C.red }}>
          没考虑挨不挨着
        </Local>
      </TrapCard>
      {/* E */}
      <TrapCard i={3} letter="E" at0={at(scene, 6, 0.02)} dim={dim}>
        <svg width={CARD_W} height={CARD_H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={ease(f, at(scene, 6, 0.45), 12)}>
            <rect x={30} y={110} width={leftW} height={80} fill={C.green} />
            <rect x={30 + leftW} y={110} width={440 - leftW} height={80} fill={C.red} />
            <rect x={30} y={110} width={440} height={80} rx={14} fill="none" stroke={C.card} strokeWidth={10} />
            <text x={30 + leftW / 2} y={150} fill="#fff" fontFamily={ZH_FONT} fontWeight={900} fontSize={38} textAnchor="middle" dominantBaseline="central" opacity={1 - eBar}>
              不挨着
            </text>
            <text x={30 + leftW + (440 - leftW) / 2} y={150} fill="#fff" fontFamily={ZH_FONT} fontWeight={900} fontSize={38} textAnchor="middle" dominantBaseline="central" opacity={1 - eBar}>
              挨着
            </text>
            <text x={30 + leftW / 2} y={150} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={56} textAnchor="middle" dominantBaseline="central" opacity={ease(f, at(scene, 7, 0.55), 10)}>
              20
            </text>
            <text x={30 + leftW + (440 - leftW) / 2} y={150} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={56} textAnchor="middle" dominantBaseline="central" opacity={ease(f, at(scene, 7, 0.8), 10)}>
              36
            </text>
          </g>
        </svg>
        <Local x={30} y={208} start={at(scene, 6, 0.65)} style={{ fontSize: 40, fontWeight: 800, color: C.red }}>
          各占一半？
        </Local>
        <Local x={30} y={268} start={at(scene, 7, 0.3)} style={{ fontSize: 40, fontWeight: 800, color: C.ink }}>
          根本不一样！
        </Local>
        <Local x={560} y={100} start={at(scene, 6, 0.3)}>
          <Tex tex={'\\dfrac{1}{2}'} size={80} color={C.red} />
        </Local>
      </TrapCard>
      {/* habit */}
      <div style={{ position: 'absolute', left: 260, top: 260, width: 1400, height: 400, background: C.card, borderRadius: 40, border: `8px solid ${C.green}`, boxShadow: '0 16px 50px rgba(30,40,80,0.16)', opacity: habit, transform: `scale(${0.92 + 0.08 * habit})`, display: habit > 0 ? 'block' : 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontSize: 66, fontWeight: 900 }}>
          数空隙？别忘了检查<span style={{ color: C.amber }}>两头</span>！
        </div>
        <svg width={1400} height={400} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform="translate(480 220) scale(1.1)">
            <MiniGaps ox={0} oy={50} hiEnds={1} />
          </g>
        </svg>
      </div>
    </>
  );
};

// ---------- variant ----------

const VariantScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={150} y={150} color={C.violet} style={fadeUp(f, 4)}>
        轮到你了！
      </Pill>
      <TokenGroup cx={960} y={380} nB={4} nG={3} sp={150} start={(k, i) => (k === 'B' ? at(scene, 0, 0.5 + i * 0.07) : at(scene, 0, 0.78 + i * 0.05))} />
      <Text x={960} y={490} w={1500} size={56} weight={900} align="center" style={fadeUp(f, at(scene, 0, 0.55))}>
        <span style={{ color: BOY }}>4 个男生</span>和 <span style={{ color: GIRL }}>3 个女生</span>
      </Text>
      <div style={{ position: 'absolute', left: 190, top: 600, width: 1540, background: C.card, borderRadius: 32, padding: '28px 44px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, textAlign: 'center', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        {TRY1_Q}
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 250;
  const bx = (i: number) => 960 + (i - 1.5) * 230;
  const gx = (j: number) => (j === 0 ? bx(0) - 115 : j === 4 ? bx(3) + 115 : (bx(j - 1) + bx(j)) / 2);
  return (
    <>
      <Stage>
        {range(5).map((j) => {
          const end = j === 0 || j === 4;
          const st = end ? at(scene, 0, j === 0 ? 0.62 : 0.78) : at(scene, 0, 0.3 + (j - 1) * 0.08);
          return <Marker key={j} x={gx(j)} y={y} s={P(f, st)} color={end ? C.amber : C.violet} />;
        })}
        {range(4).map((i) => (
          <Tok key={i} x={bx(i)} y={y} k="B" s={P(f, 4 + i * 4)} />
        ))}
      </Stage>
      <Parts x={200} y={340} size={60} parts={[['3', at(scene, 0, 0.42)], ['+ 2', at(scene, 0, 0.7)], ['= 5', at(scene, 0, 0.9)]]} />
      <Parts x={200} y={450} size={60} parts={[['\\dfrac{5 \\times 4 \\times 3}{6}', at(scene, 1, 0.4)], ['= 10', at(scene, 1, 0.85)]]} />
      <Parts x={200} y={640} size={60} parts={[['\\dfrac{7 \\times 6 \\times 5}{6}', at(scene, 2, 0.4)], ['= 35', at(scene, 2, 0.85)]]} />
      <Parts x={1050} y={480} size={92} color={C.green} parts={[['\\dfrac{10}{35}', at(scene, 3, 0.05)], ['= \\dfrac{2}{7}', at(scene, 3, 0.55)]]} />
      <Text x={1248} y={618} w={200} size={48} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 3, 0.3))}>
        ÷ 5
      </Text>
      <Answer x={1620} y={720} value="2/7" chime={CHIME} start={at(scene, 3, 0.72)} />
    </>
  );
};

// ---------- recap ----------

const RECAP_SETS = [[0, 3, 6], [1, 4, 7], [0, 2, 5], [3, 5, 7], [1, 3, 6], [2, 5, 7]];

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = ease(f, at(scene, 1, 0.0), 12) * (1 - ease(f, at(scene, 2, 0.0), 12));
  const l2 = ease(f, at(scene, 2, 0.05), 14) * (1 - ease(f, at(scene, 3, 0.0), 12));
  const card = 1 - ease(f, at(scene, 3, 0.0), 12);
  const si = Math.max(0, Math.floor((f - at(scene, 1, 0.3)) / 24)) % RECAP_SETS.length;
  const gy = 600;
  const bx = (i: number) => 960 + (i - 2) * 250;
  const mx = (j: number) => (j === 0 ? bx(0) - 125 : j === 5 ? bx(4) + 125 : (bx(j - 1) + bx(j)) / 2);
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 130, width: 1680, height: 700, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * card }}>
        <div style={{ position: 'absolute', left: 70, top: 40, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
      </div>
      <Text x={960} y={235} w={1500} size={54} weight={900} align="center" style={{ opacity: l1 }}>
        只有女生的位置才重要。
      </Text>
      <Text x={960} y={315} w={1500} size={46} weight={700} color={C.muted} align="center" style={{ opacity: l1 }}>
        每一组位置的可能性都一样。
      </Text>
      <Text x={960} y={235} w={1500} size={54} weight={900} align="center" style={{ opacity: l2 }}>
        先排男生，每个空隙最多站 1 个女生。
      </Text>
      <Text x={960} y={315} w={1500} size={46} weight={700} color={C.amber} align="center" style={{ opacity: l2 }}>
        别忘了两头！
      </Text>
      <Stage>
        <g opacity={l1}>
          <Slots y={gy} r={46} sp={150} numO={1} />
          {RECAP_SETS[si].map((s) => (
            <Tok key={`${si}-${s}`} x={sx(s)} y={gy} k="G" r={46} s={P(f, at(scene, 1, 0.3) + si * 24)} />
          ))}
        </g>
        <g opacity={l2}>
          {range(6).map((j) => (
            <Marker key={j} x={mx(j)} y={gy} color={j === 0 || j === 5 ? C.amber : C.violet} />
          ))}
          {range(5).map((i) => (
            <Tok key={i} x={bx(i)} y={gy} k="B" />
          ))}
          {[0, 2, 4].map((j) => (
            <Tok key={`g${j}`} x={mx(j)} y={gy - 150} k="G" s={P(f, at(scene, 2, 0.5 + j * 0.08))} />
          ))}
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
  try1: ({ scene }) => <PauseScene scene={scene} nB={5} nG={3} seconds={10} choices />,
  seats: Seats,
  all56: All56,
  list: ListScene,
  gaps: GapsScene,
  traps: Traps,
  variant: VariantScene,
  try2: ({ scene }) => <PauseScene scene={scene} nB={4} nG={3} seconds={12} />,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

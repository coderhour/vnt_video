import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-no-three-in-a-row';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Coins: heads = amber "H", tails = blue "T". Streak blocks: single = green, double = violet.
const SIDE: Record<string, string> = { H: C.amber, T: C.blue, '?': C.muted };
const SINGLE = C.primary;
const DOUBLE = C.violet;

// ---------- small building blocks ----------

/** One coin, centred at (x, y). `ring` draws a green outline (a newly added flip). */
export const Coin: React.FC<{ x: number; y: number; side: string; r?: number; s?: number; ring?: string; dim?: number }> = ({ x, y, side, r = 40, s = 1, ring, dim = 1 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim}>
      {ring && <circle r={r + 9} fill="none" stroke={ring} strokeWidth={6} />}
      <circle r={r} fill={SIDE[side]} />
      <circle r={r * 0.8} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={Math.max(2, r * 0.07)} />
      <text y={r * 0.05} fontFamily={NUNITO} fontWeight={900} fontSize={r * 1.05} fill="#fff" textAnchor="middle" dominantBaseline="middle">
        {side}
      </text>
    </g>
  );

/** A string of coins left to right from x (centre of the first coin). Coins pop in from `start`, `stagger` frames apart. */
export const Coins: React.FC<{ s: string; x: number; y: number; r?: number; gap?: number; start?: number; stagger?: number; ringFrom?: number; ring?: string; opacity?: number }> = ({
  s, x, y, r = 40, gap, start, stagger = 4, ringFrom = 99, ring = C.green, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = gap ?? r * 2.4;
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {s.split('').map((c, i) => (
        <Coin key={i} x={x + i * step} y={y} side={c} r={r} s={start === undefined ? 1 : pop(f, start + i * stagger, fps)} ring={i >= ringFrom ? ring : undefined} />
      ))}
    </g>
  );
};

/** Rounded box behind coins i..j (inclusive) of a Coins row. */
export const RunBox: React.FC<{ x: number; y: number; r: number; gap: number; i: number; j: number; color: string; opacity: number; fill?: number }> = ({ x, y, r, gap, i, j, color, opacity, fill = 0.12 }) =>
  opacity <= 0 ? null : (
    <rect x={x + i * gap - r - 12} y={y - r - 12} width={(j - i) * gap + 2 * r + 24} height={2 * r + 24} rx={r + 12} fill={color} fillOpacity={fill} stroke={color} strokeWidth={6} opacity={opacity} />
  );

/** A block pattern: lengths like [2, 1, 2]; each unit is `unit` px wide. */
const Blocks: React.FC<{ pat: number[]; x: number; y: number; unit: number; h?: number; opacity?: number; labels?: boolean; grow?: number }> = ({ pat, x, y, unit, h = 56, opacity = 1, labels = true, grow = 1 }) => {
  if (opacity <= 0) return null;
  let cx = x;
  return (
    <g opacity={opacity}>
      {pat.map((L, i) => {
        const left = cx;
        cx += L * unit;
        const show = Math.max(0, Math.min(1, grow * pat.length - i));
        if (show <= 0) return null;
        const color = L === 1 ? SINGLE : DOUBLE;
        return (
          <g key={i} opacity={show}>
            <rect x={left + 4} y={y} width={L * unit - 8} height={h} rx={14} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={5} />
            {labels && (
              <text x={left + (L * unit) / 2} y={y + h / 2 + 2} fontFamily={NUNITO} fontWeight={900} fontSize={Math.min(48, h * 0.8)} fill={color} textAnchor="middle" dominantBaseline="middle">
                {L}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle">
      {text}
    </text>
  );

const Cross: React.FC<{ x: number; y: number; size?: number; opacity: number }> = ({ x, y, size = 50, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={C.red} strokeWidth={12} strokeLinecap="round">
      <line x1={x - size / 2} y1={y - size / 2} x2={x + size / 2} y2={y + size / 2} />
      <line x1={x + size / 2} y1={y - size / 2} x2={x - size / 2} y2={y + size / 2} />
    </g>
  );

/** A maths line placed absolutely. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

/** Every way to place k doubles among n blocks (lexicographic). */
const placements = (n: number, k: number): number[][] => {
  if (k === 0) return [Array(n).fill(1)];
  if (n < k) return [];
  const withD = placements(n - 1, k - 1).map((p) => [2, ...p]);
  const withS = n > k ? placements(n - 1, k).map((p) => [1, ...p]) : [];
  return [...withD, ...withS];
};

/** Table of counts: one cell per number of flips. */
const TableRow: React.FC<{ x: number; y: number; cw: number; values: number[]; shows: number[]; color?: string; hi?: number; label?: string; header?: boolean }> = ({ x, y, cw, values, shows, color = C.ink, hi = -1, label, header }) => {
  const f = useCurrentFrame();
  return (
    <>
      {label && (
        <div style={{ position: 'absolute', left: x - 290, top: y, width: 270, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 38, fontWeight: 800, color: C.muted, opacity: ease(f, shows[0] ?? 0, 10) }}>
          {label}
        </div>
      )}
      {values.map((v, i) => {
        const p = ease(f, shows[i], 10);
        return (
          <div key={i} style={{ position: 'absolute', left: x + i * cw, top: y, width: cw - 12, height: 90, borderRadius: 18, background: header ? 'transparent' : i === hi ? C.primarySoft : C.card, border: header ? 'none' : `4px solid ${i === hi ? C.primary : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: header ? 44 : 56, fontWeight: 900, color: header ? C.muted : color, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
            {v}
          </div>
        );
      })}
    </>
  );
};

// ---------- scenes ----------

export const HOOK = 'THHHTTHT'; // a streak of three heads at flips 2-4

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 960 - 3.5 * 130;
  const box = ease(f, at(scene, 0, 0.8), 12);
  return (
    <>
      <Text x={960} y={120} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        Three in a row?
      </Text>
      <Stage>
        <RunBox x={x0} y={340} r={52} gap={130} i={1} j={3} color={C.red} opacity={box} />
        <Coins s={HOOK} x={x0} y={340} r={52} gap={130} start={at(scene, 0, 0.1)} stagger={Math.round(scene.lines[0].frames * 0.08)} />
      </Stage>
      <Text x={960} y={470} w={1300} size={72} weight={900} align="center" color={C.red} style={fadeUp(f, at(scene, 1, 0.6))}>
        It happens almost 3 times out of 4!
      </Text>
      <Text x={960} y={575} w={1300} size={44} weight={800} align="center" color={C.muted} style={fadeUp(f, at(scene, 1, 0.75))}>
        188 of the 256 outcomes ≈ 73%
      </Text>
      <div style={{ position: 'absolute', left: 1360, top: 650, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['\\frac{1}{8}', '\\frac{17}{128}', '\\frac{1}{4}', '\\frac{17}{64}', '\\frac{149}{256}'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1100, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 52, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        A fair coin is <Mark on={at(scene, 1, 0.4)}>{'flipped 8 times'}</Mark>. What is the probability that{' '}
        <Mark on={at(scene, 2, 0.4)}>the same side never comes up 3 times in a row</Mark>?
      </div>
      <Choices x={100} y={600} items={CHOICES.map((c) => <Tex key={c} tex={c.replace('\\frac', '\\dfrac')} size={60} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
      <Stage>
        <Coin x={1460} y={330} side="H" r={90} s={ease(f, 10, 14)} />
        <Coin x={1700} y={330} side="T" r={90} s={ease(f, 16, 14)} />
        <Label x={1460} y={470} text="heads" color={C.amber} opacity={ease(f, 20, 10)} />
        <Label x={1700} y={470} text="tails" color={C.blue} opacity={ease(f, 24, 10)} />
      </Stage>
    </>
  );
};

const GOOD = 'HTTHHTHH';
const BAD_H = 'THHHTHTT';
const BAD_T = 'HTTTHHTH';

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const R = 36;
  const G = 92;
  const X = 170;
  return (
    <>
      <Text x={120} y={150} w={400} size={48} weight={800} style={fadeUp(f, at(scene, 0, 0.3))}>Each flip:</Text>
      <Stage>
        <Coin x={390} y={182} side="H" r={40} s={ease(f, at(scene, 0, 0.5), 12)} />
        <Label x={470} y={184} text="or" size={40} color={C.muted} opacity={ease(f, at(scene, 0, 0.6), 10)} />
        <Coin x={550} y={182} side="T" r={40} s={ease(f, at(scene, 0, 0.7), 12)} />

        <Coins s={GOOD} x={X} y={420} r={R} gap={G} start={at(scene, 2, 0.05)} stagger={2} />
        <Coins s={BAD_H} x={X} y={560} r={R} gap={G} start={at(scene, 3, 0.05)} stagger={2} />
        <RunBox x={X} y={560} r={R} gap={G} i={1} j={3} color={C.red} opacity={ease(f, at(scene, 3, 0.6), 10)} fill={0.08} />
        <Coins s={BAD_T} x={X} y={700} r={R} gap={G} start={at(scene, 4, 0.05)} stagger={2} />
        <RunBox x={X} y={700} r={R} gap={G} i={1} j={3} color={C.red} opacity={ease(f, at(scene, 4, 0.5), 10)} fill={0.08} />
      </Stage>
      <Eq x={700} y={150} start={at(scene, 1, 0.2)} size={52} tex="2 \times 2 \times 2 \times 2 \times 2 \times 2 \times 2 \times 2 = 256" />
      <Check x={700} y={250} start={at(scene, 5, 0.05)}>All equally likely (fair coin)</Check>
      <Text x={900} y={392} w={500} size={48} weight={900} color={C.green} style={fadeUp(f, at(scene, 2, 0.5))}>✓ good</Text>
      <Text x={900} y={532} w={500} size={48} weight={900} color={C.red} style={fadeUp(f, at(scene, 3, 0.7))}>✗ 3 heads</Text>
      <Text x={900} y={672} w={500} size={48} weight={900} color={C.red} style={fadeUp(f, at(scene, 4, 0.6))}>✗ 3 tails</Text>
      <Card x={1260} y={440} w={580} h={200} style={fadeUp(f, at(scene, 5, 0.5))}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center' }}>
          <Tex tex="P = \frac{\text{good outcomes}}{256}" size={60} />
        </div>
      </Card>
    </>
  );
};

const makePause = (n: number, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const gap = n === 8 ? 96 : 86;
  return (
    <>
      <Card x={110} y={220} w={860} h={500} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 44, fontSize: 52, fontWeight: 700, lineHeight: 1.45 }}>
          Flip a fair coin <b style={{ color: C.primary }}>{n} times</b>. Chance the same side <b>never</b> comes up 3 times in a row?
        </div>
      </Card>
      <Stage>
        <Coins s={'?'.repeat(n)} x={540 - ((n - 1) * gap) / 2} y={600} r={34} gap={gap} start={6} stagger={3} />
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} />
    </>
  );
};

// ---- Solution 1: build it flip by flip ----

const SMALL = 30;
const SG = 70; // coin spacing for small strings

const Build: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L1 = at(scene, 3, 0.05);
  const L2 = at(scene, 3, 0.5);
  const singles: [string, string][] = [['HH', 'T'], ['HT', 'H'], ['TH', 'T'], ['TT', 'H']];
  const doubles: [string, string][] = [['H', 'TT'], ['T', 'HH']];
  const sx = (i: number) => 160 + (i % 2) * 270;
  const sy = (i: number) => 610 + Math.floor(i / 2) * 100;
  const dx = 830;
  const streakOut = fadeTo(f, at(scene, 4), 0.35);
  const why = ease(f, at(scene, 5, 0.1), 12) * fadeTo(f, at(scene, 6));
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Start small</Pill>
      {/* streak definition, top right */}
      <Stage>
        <g opacity={streakOut}>
          <RunBox x={1220} y={190} r={30} gap={76} i={0} j={1} color={DOUBLE} opacity={ease(f, at(scene, 1, 0.4), 10)} />
          <RunBox x={1220} y={190} r={30} gap={76} i={2} j={2} color={SINGLE} opacity={ease(f, at(scene, 2, 0.6), 10)} />
          <RunBox x={1220} y={190} r={30} gap={76} i={3} j={4} color={DOUBLE} opacity={ease(f, at(scene, 2, 0.6), 10)} />
          <Coins s="HHTHH" x={1220} y={190} r={30} gap={76} start={at(scene, 1, 0.02)} stagger={2} />
        </g>
      </Stage>
      <Text x={1190} y={240} w={700} size={40} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.5)), opacity: ease(f, at(scene, 1, 0.5)) * streakOut }}>
        a <span style={{ color: DOUBLE }}>streak</span> of 2 heads
      </Text>
      <Text x={1190} y={300} w={700} size={40} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 2, 0.1)), opacity: ease(f, at(scene, 2, 0.1)) * streakOut }}>
        string = one outcome
      </Text>
      <Text x={1190} y={360} w={700} size={40} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 2, 0.55)), opacity: ease(f, at(scene, 2, 0.55)) * streakOut }}>
        good: streaks of <span style={{ color: SINGLE }}>1</span> or <span style={{ color: DOUBLE }}>2</span> only
      </Text>

      {/* 1 flip and 2 flips */}
      <Text x={120} y={258} w={250} size={44} weight={800} style={fadeUp(f, L1)}>1 flip:</Text>
      <Text x={120} y={358} w={250} size={44} weight={800} style={fadeUp(f, L2)}>2 flips:</Text>
      <Stage>
        <Coins s="H" x={340} y={290} r={SMALL} start={L1 + 4} />
        <Coins s="T" x={420} y={290} r={SMALL} start={L1 + 8} />
        {['HH', 'HT', 'TH', 'TT'].map((s, i) => (
          <Coins key={s} s={s} x={340 + i * 170} y={390} r={SMALL} gap={SG} start={L2 + 4 + i * 4} />
        ))}
      </Stage>
      <Text x={530} y={250} w={200} size={60} weight={900} color={C.primary} style={fadeUp(f, L1 + 14)}>= 2</Text>
      <Text x={1010} y={350} w={200} size={60} weight={900} color={C.primary} style={fadeUp(f, L2 + 22)}>= 4</Text>

      {/* 3 flips */}
      <Text x={120} y={450} w={600} size={44} weight={800} style={fadeUp(f, at(scene, 4, 0.02))}>3 flips: how does it end?</Text>
      <Text x={130} y={520} w={560} size={40} weight={800} color={SINGLE} style={fadeUp(f, at(scene, 4, 0.3))}>end with a single</Text>
      <Text x={dx - 40} y={520} w={560} size={40} weight={800} color={DOUBLE} style={fadeUp(f, at(scene, 6, 0.1))}>end with a double</Text>
      <Stage>
        {singles.map(([a, b], i) => (
          <Coins key={i} s={a + b} x={sx(i)} y={sy(i)} r={SMALL} gap={SG} ringFrom={2} ring={SINGLE} start={at(scene, 4, 0.5) + i * 8} stagger={2} />
        ))}
        {doubles.map(([a, b], i) => (
          <Coins key={i} s={a + b} x={dx} y={sy(i * 2)} r={SMALL} gap={SG} ringFrom={1} ring={DOUBLE} start={at(scene, 6, 0.45) + i * 8} stagger={2} />
        ))}
        {/* why the new flip must be the other side */}
        <g opacity={why}>
          <Coins s="HHH" x={1300} y={620} r={SMALL} gap={SG} ringFrom={2} ring={C.red} />
          <RunBox x={1300} y={620} r={SMALL} gap={SG} i={0} j={2} color={C.red} opacity={1} fill={0.06} />
        </g>
      </Stage>
      <Text x={1250} y={520} w={640} size={40} weight={800} color={C.red} style={{ opacity: why }}>same side? the streak grows</Text>
      <Text x={680} y={615} w={120} size={64} weight={900} color={SINGLE} style={fadeUp(f, at(scene, 4, 0.9))}>4</Text>
      <Text x={1080} y={615} w={120} size={64} weight={900} color={DOUBLE} style={fadeUp(f, at(scene, 6, 0.85))}>2</Text>
      <Eq x={1260} y={520} start={at(scene, 7, 0.05)} size={72} color={C.green} tex="4 + 2 = 6" />
      <Stage>
        <g opacity={ease(f, at(scene, 7, 0.5), 12)}>
          <Label x={1260} y={680} text="missing:" size={40} color={C.muted} anchor="start" />
          {['HHH', 'TTT'].map((s, k) => {
            const x = 1300 + k * 280;
            return (
              <g key={s}>
                <Coins s={s} x={x} y={750} r={SMALL} gap={SG} />
                <line x1={x - SMALL - 14} y1={750} x2={x + 2 * SG + SMALL + 14} y2={750} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      </Stage>
    </>
  );
};

export const COUNTS = [2, 4, 6, 10, 16, 26, 42, 68];
const CW = 180;
const TX = 380;

/** Curved "+" arrows from cells i-2 and i-1 into cell i, drawn under the table. */
const AddArcs: React.FC<{ i: number; y: number; opacity: number; cw?: number; x0?: number }> = ({ i, y, opacity, cw = CW, x0 = TX }) => {
  if (opacity <= 0 || i < 2) return null;
  const cx = (k: number) => x0 + k * cw + (cw - 12) / 2;
  const arc = (a: number, b: number, depth: number) => `M ${cx(a)} ${y} Q ${(cx(a) + cx(b)) / 2} ${y + depth} ${cx(b) - 8} ${y + 6}`;
  return (
    <g opacity={opacity} fill="none" stroke={C.primary} strokeWidth={5} strokeLinecap="round">
      <path d={arc(i - 2, i, 110)} />
      <path d={arc(i - 1, i, 60)} />
      <path d={`M ${cx(i) - 26} ${y + 22} L ${cx(i) - 8} ${y + 6} L ${cx(i) + 4} ${y + 30}`} />
    </g>
  );
};

const Table: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const shows = [0, 0, 0, at(scene, 2, 0.1), at(scene, 2, 0.6), at(scene, 3, 0.1), at(scene, 3, 0.4), at(scene, 3, 0.75)];
  const steps = [at(scene, 1, 0.1), ...shows.slice(3)];
  const cur = steps.reduce((acc, s, k) => (f >= s ? k + 2 : acc), -1); // index of the cell being built
  const sums = ['2 + 4 = 6', '4 + 6 = 10', '6 + 10 = 16', '10 + 16 = 26', '16 + 26 = 42', '26 + 42 = 68'];
  const done = at(scene, 6, 0.97);
  const tableOut = fadeTo(f, at(scene, 4), 0.5);
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Same rule, every length</Pill>
      <div style={{ opacity: tableOut }}>
        <TableRow x={TX} y={230} cw={CW} values={range(8).map((i) => i + 1)} shows={range(8).map(() => 0)} header label="flips" />
        <TableRow x={TX} y={320} cw={CW} values={COUNTS} shows={shows} hi={f >= at(scene, 4) ? 7 : cur} label="good strings" />
      </div>
      <Stage>
        <AddArcs i={cur} y={420} opacity={cur >= 2 && f < at(scene, 4) ? 1 : 0} />
      </Stage>
      {cur >= 2 && f < at(scene, 4) && (
        <div style={{ position: 'absolute', left: Math.min(TX + cur * CW + 84, 1560) - 300, top: 540, width: 600, textAlign: 'center' }}>
          <Tex tex={sums[cur - 2]} size={60} color={C.primary} />
        </div>
      )}
      <Text x={120} y={665} w={1700} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.3)), opacity: ease(f, at(scene, 1, 0.3)) * fadeTo(f, at(scene, 4)) }}>
        each count = <span style={{ color: C.ink }}>the one before</span> + <span style={{ color: C.ink }}>the one before that</span>
      </Text>
      <Eq x={TX} y={500} start={at(scene, 4, 0.3)} size={80} tex="P = \frac{68}{256}" />
      <Eq x={TX + 420} y={500} start={at(scene, 5, 0.6)} size={80} color={C.green} tex="= \frac{17}{64}" />
      <Eq x={TX + 750} y={530} start={at(scene, 6, 0.5)} size={56} color={C.muted} tex="\approx 0.266 \approx 27\%" />
      <Answer x={1640} y={640} value="D" chime={CHIME} start={done} />
      <Confetti x={1640} y={640} start={done} seed={7} />
    </>
  );
};

// ---- Solution 2: cut it into streaks ----

const EX = 'HHTHHTTH';
const EXPAT = [2, 1, 2, 2, 1];
const EG = 130;
const EX0 = 960 - 3.5 * EG;

const Streaks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const runs: [number, number][] = [[0, 1], [2, 2], [3, 4], [5, 6], [7, 7]];
  const back = at(scene, 3);
  const refill = at(scene, 4, 0.1);
  const coinsOut = f < back ? 1 : f < refill ? fadeTo(f, back, 0.0, 10) : 0;
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Cut it into streaks</Pill>
      <Stage>
        {runs.map(([i, j], k) => (
          <RunBox key={k} x={EX0} y={300} r={50} gap={EG} i={i} j={j} color={i === j ? SINGLE : DOUBLE} opacity={ease(f, at(scene, 1, 0.12 + k * 0.16), 10) * (f < back ? 1 : coinsOut + (f >= refill ? 1 : 0))} />
        ))}
        <Coins s={EX} x={EX0} y={300} r={50} gap={EG} start={at(scene, 0, 0.4)} stagger={3} opacity={coinsOut} />
        {/* going backwards: refill the coins block by block, sides taking turns */}
        {f >= refill &&
          runs.map(([i, j], k) => (
            <Coins key={k} s={EX.slice(i, j + 1)} x={EX0 + i * EG} y={300} r={50} gap={EG} start={refill + k * 10} stagger={3} />
          ))}
        <Blocks pat={EXPAT} x={EX0 - EG / 2} y={430} unit={EG} h={70} grow={ease(f, at(scene, 2, 0.1), 30)} />
      </Stage>
      <Eq x={EX0 + 2 * EG} y={540} start={at(scene, 2, 0.6)} size={60} tex="2 + 1 + 2 + 2 + 1 = 8" />
      <div style={{ position: 'absolute', left: 120, top: 640, display: 'flex', gap: 24, alignItems: 'center', fontSize: 44, fontWeight: 800, ...fadeUp(f, at(scene, 3, 0.4)) }}>
        first side:
        <svg width={90} height={90} viewBox="-45 -45 90 90">
          <Coin x={0} y={0} side="H" r={40} />
        </svg>
      </div>
      <Text x={640} y={655} w={1200} size={44} weight={800} color={C.primary} style={fadeUp(f, at(scene, 4, 0.4))}>
        Sides take turns → only one string fits!
      </Text>
      <Eq x={640} y={735} start={at(scene, 5, 0.3)} size={52} tex="\text{good strings} = 2 \times \text{block patterns}" />
    </>
  );
};

const UNIT = 62;
const BX = 450;
const ROWY = [170, 285, 400, 515, 630];

const BlocksScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // row k: k doubles, cycled through every placement over a window of the narration
  const windows: [number, number][] = [
    [at(scene, 1, 0.3), at(scene, 1, 0.3)],
    [at(scene, 2, 0.45), at(scene, 2, 0.98)],
    [at(scene, 3, 0.45), at(scene, 4, 0.95)],
    [at(scene, 6, 0.4), at(scene, 6, 0.98)],
    [at(scene, 7, 0.4), at(scene, 7, 0.4)],
  ];
  const counts = ['1', '7', '6 \\times 5 \\div 2 = 15', '5 \\times 4 \\div 2 = 10', '1'];
  const countAt = [at(scene, 1, 0.6), at(scene, 2, 0.8), at(scene, 5, 0.6), at(scene, 6, 0.8), at(scene, 7, 0.7)];
  const labelAt = [at(scene, 1, 0.05), at(scene, 2, 0.05), at(scene, 3, 0.05), at(scene, 6, 0.05), at(scene, 7, 0.05)];
  return (
    <>
      <Stage>
        {ROWY.map((y, k) => {
          const all = placements(8 - k, k);
          const [s, e] = windows[k];
          const n = all.length;
          const i = n === 1 || f < s ? 0 : Math.min(n - 1, Math.floor(((f - s) / Math.max(1, e - s)) * n));
          return <Blocks key={k} pat={all[i]} x={BX} y={y} unit={UNIT} h={64} opacity={ease(f, labelAt[k] + 8, 10)} />;
        })}
      </Stage>
      {ROWY.map((y, k) => {
        const all = placements(8 - k, k);
        const [s, e] = windows[k];
        const n = all.length;
        const i = n === 1 || f < s ? 0 : Math.min(n - 1, Math.floor(((f - s) / Math.max(1, e - s)) * n));
        const counting = n > 1 && f >= s && f < countAt[k];
        return (
          <div key={k}>
            <div style={{ position: 'absolute', left: 110, top: y + 4, width: 320, fontSize: 40, fontWeight: 800, color: k === 0 ? SINGLE : DOUBLE, ...fadeUp(f, labelAt[k]) }}>
              {k === 0 ? 'no doubles' : k === 1 ? '1 double' : `${k} doubles`}
            </div>
            {counting && <div style={{ position: 'absolute', left: BX + 8 * UNIT + 30, top: y + 2, fontSize: 48, fontWeight: 900, color: C.muted }}>#{i + 1}</div>}
            <Eq x={BX + 8 * UNIT + 30} y={y} start={countAt[k]} size={48} color={C.ink} tex={counts[k]} />
          </div>
        );
      })}
      <Text x={BX + 8 * UNIT + 30} y={ROWY[2] + 58} w={440} size={36} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 4, 0.5)), whiteSpace: 'nowrap' }}>
        6 × 5 = 30: pairs twice
      </Text>
      <Text x={BX + 8 * UNIT + 30} y={ROWY[3] + 58} w={440} size={36} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 6, 0.45)), whiteSpace: 'nowrap' }}>
        5 × 4 = 20: pairs twice
      </Text>
      <Card x={1410} y={200} w={450} h={430} style={fadeUp(f, at(scene, 8, 0.05))}>
        <div style={{ position: 'absolute', left: 40, top: 40 }}>
          <Tex tex="1 + 7 + 15" size={52} />
          <div style={{ height: 14 }} />
          <Tex tex="+\, 10 + 1 = 34" size={52} />
        </div>
        <div style={{ position: 'absolute', left: 40, top: 240, ...fadeUp(f, at(scene, 9, 0.3)) }}>
          <Tex tex="34 \times 2 = 68" size={60} color={C.green} />
        </div>
        <div style={{ position: 'absolute', left: 40, top: 340, fontSize: 40, fontWeight: 900, color: C.green, ...fadeUp(f, at(scene, 9, 0.8)) }}>✓ It matches!</div>
      </Card>
    </>
  );
};

const FIB = [1, 2, 3, 5, 8, 13, 21, 34];

const Fib: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const names = at(scene, 1);
  const nameStep = (scene.lines[1].frames * 0.4) / 8;
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>A fun surprise</Pill>
      <TableRow x={TX} y={230} cw={CW} values={range(8).map((i) => i + 1)} shows={range(8).map(() => at(scene, 0, 0.3))} header label="flips" />
      <TableRow x={TX} y={320} cw={CW} values={FIB} shows={FIB.map((_, i) => names + i * nameStep)} color={DOUBLE} label="patterns" />
      <Text x={TX} y={430} w={1400} size={52} weight={900} color={DOUBLE} style={fadeUp(f, at(scene, 1, 0.3))}>
        The Fibonacci numbers!
      </Text>
      <Text x={120} y={540} w={250} size={52} weight={900} color={C.primary} align="left" style={{ ...fadeUp(f, at(scene, 2, 0.2)), textAlign: 'right' }}>× 2</Text>
      <TableRow x={TX} y={520} cw={CW} values={COUNTS} shows={COUNTS.map((_, i) => at(scene, 2, 0.25) + i * 3)} color={C.primary} />
      <Card x={120} y={665} w={820} h={110} style={{ ...fadeUp(f, at(scene, 3, 0.4)), display: 'flex', alignItems: 'center' }}>
        <div style={{ padding: '0 36px', fontSize: 40, fontWeight: 800, lineHeight: 1.3 }}>
          <span style={{ color: C.primary }}>Table:</span> fastest for long strings
        </div>
      </Card>
      <Card x={980} y={665} w={860} h={110} style={{ ...fadeUp(f, at(scene, 4, 0.2)), display: 'flex', alignItems: 'center' }}>
        <div style={{ padding: '0 36px', fontSize: 40, fontWeight: 800, lineHeight: 1.3 }}>
          <span style={{ color: C.violet }}>Blocks:</span> show why, great double-check
        </div>
      </Card>
    </>
  );
};

// ---- traps ----

const NOTES = ['3 given flips all heads', 'forgot the first side', '3 given flips all match', '', 'forgot three tails'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 2, 0.1), at(scene, 0, 0.1), at(scene, 3, 0.1), Infinity, at(scene, 1, 0.1)];
  const right = f >= at(scene, 4, 0.5);
  // E's example: a full-size row while line 1 plays, then it shrinks into card E
  const rowIn = ease(f, at(scene, 1, 0.3), 12);
  const shrink = ease(f, at(scene, 2), 20);
  const lerp = (a: number, b: number) => a + (b - a) * shrink;
  const [ex, ey, es] = [lerp(1290, 1535), lerp(720, 441), lerp(1, 14 / 30)];
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 3 && right;
          const border = wrong ? C.red : ok ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 400, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 18 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 150, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={60} color={wrong ? C.red : ok ? C.green : C.ink} />
                </div>
                <svg width={300} height={150} viewBox="0 0 300 150" style={{ overflow: 'visible' }}>
                  {(i === 0 || i === 2) && (
                    <g opacity={ease(f, wrongAt[i], 10)}>
                      <Coins s="HHH" x={90} y={i === 0 ? 60 : 35} r={26} gap={60} />
                      {i === 2 && <Coins s="TTT" x={90} y={105} r={26} gap={60} />}
                    </g>
                  )}
                  {i === 1 && (
                    <foreignObject x={0} y={20} width={300} height={110} opacity={ease(f, wrongAt[1] + 20, 10)}>
                      <div style={{ textAlign: 'center' }}>
                        <Tex tex="= \frac{34}{256}" size={48} color={C.red} />
                      </div>
                    </foreignObject>
                  )}
                  {i === 3 && ok && (
                    <foreignObject x={0} y={20} width={300} height={110}>
                      <div style={{ textAlign: 'center' }}>
                        <Tex tex="= \frac{68}{256}" size={48} color={C.green} />
                      </div>
                    </foreignObject>
                  )}
                </svg>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700, textAlign: 'center', lineHeight: 1.25, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Text x={1150} y={652} w={700} size={40} weight={800} color={C.red} style={{ ...fadeUp(f, at(scene, 0, 0.75)), opacity: ease(f, at(scene, 0, 0.75)) * fadeTo(f, at(scene, 1, 0.2)) }}>
        Every pattern starts with heads OR tails: × 2
      </Text>
      <div style={{ position: 'absolute', left: 260, top: 700, width: 1400, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 46, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.3)) }}>
        Check BOTH sides, and count every starting choice!
      </div>
      <Stage>
        <g opacity={rowIn} transform={`translate(${ex} ${ey}) scale(${es})`}>
          <RunBox x={0} y={0} r={30} gap={76} i={1} j={3} color={C.red} opacity={1} fill={0.1} />
          <Coins s={BAD_T} x={0} y={0} r={30} gap={76} />
        </g>
      </Stage>
    </>
  );
};

// ---- variant ----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const G9 = 120;
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>Your turn!</Pill>
      <Text x={120} y={280} w={1600} size={64} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        Flip a fair coin <span style={{ color: C.primary }}>9 times</span>.
      </Text>
      <Text x={120} y={380} w={1500} size={50} weight={700} style={fadeUp(f, at(scene, 1, 0.1))}>
        What is the probability that the same side never comes up 3 times in a row?
      </Text>
      <Stage>
        <Coins s={'?'.repeat(9)} x={960 - 4 * G9} y={600} r={44} gap={G9} start={at(scene, 0, 0.6)} stagger={3} />
      </Stage>
      <Pill x={120} y={700} color={C.amber} style={fadeUp(f, at(scene, 1, 0.85))}>Tip: extend the table!</Pill>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cw = 165;
  const x0 = 330;
  const done = at(scene, 6, 0.97);
  const C9 = [...COUNTS, 110];
  return (
    <>
      <TableRow x={x0} y={150} cw={cw} values={range(9).map((i) => i + 1)} shows={range(9).map(() => 0)} header label="flips" />
      <TableRow x={x0} y={240} cw={cw} values={C9} shows={[...range(8).map(() => 0), at(scene, 1, 0.6)]} hi={f >= at(scene, 1, 0.6) ? 8 : -1} label="good strings" />
      <Stage>
        <AddArcs i={8} y={340} cw={cw} x0={x0} opacity={ease(f, at(scene, 1, 0.1), 10)} />
      </Stage>
      <Eq x={x0 + 8 * cw - 470} y={430} start={at(scene, 1, 0.2)} size={56} color={C.primary} tex="42 + 68 = 110" />
      <Eq x={120} y={560} start={at(scene, 2, 0.2)} size={52} tex="\text{outcomes} = 2 \times 256 = 512" />
      <Eq x={120} y={660} start={at(scene, 3, 0.4)} size={72} tex="P = \frac{110}{512}" />
      <Eq x={520} y={660} start={at(scene, 4, 0.4)} size={72} color={C.green} tex="= \frac{55}{256}" />
      <Card x={1000} y={570} w={840} h={260} style={fadeUp(f, at(scene, 5, 0.05))}>
        <div style={{ position: 'absolute', left: 36, top: 26, fontSize: 36, fontWeight: 800, color: C.violet }}>Check with blocks</div>
        <div style={{ position: 'absolute', left: 36, top: 84 }}>
          <Tex tex="1 + 8 + 21 + 20 + 5 = 55" size={52} />
        </div>
        <div style={{ position: 'absolute', left: 36, top: 170, ...fadeUp(f, at(scene, 5, 0.75)) }}>
          <Tex tex="55 \times 2 = 110 \;\checkmark" size={52} color={C.green} />
        </div>
      </Card>
      <Answer x={1730} y={430} value="✓" chime={CHIME} start={done} />
      <Confetti x={1730} y={430} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const RX = 300;
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 650, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 120, width: 1460, fontSize: 58, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Cut each outcome into streaks. Count the patterns of streak lengths.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 540, width: 1460, fontSize: 50, fontWeight: 800, color: C.violet, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Then multiply by 2, for heads or tails first.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.5), 14) * cardOut}>
          {[[0, 1], [2, 2], [3, 4], [5, 6], [7, 7]].map(([i, j], k) => (
            <RunBox key={k} x={RX} y={500} r={36} gap={92} i={i} j={j} color={i === j ? SINGLE : DOUBLE} opacity={1} />
          ))}
          <Coins s={EX} x={RX} y={500} r={36} gap={92} />
          <Blocks pat={EXPAT} x={RX - 46} y={570} unit={92} h={56} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 1120, top: 490, opacity: ease(f, at(scene, 2, 0.3)) * cardOut }}>
        <Tex tex="\times\, 2" size={96} color={C.violet} />
      </div>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(8, 10),
  build: Build,
  table: Table,
  streaks: Streaks,
  blocks: BlocksScene,
  fib: Fib,
  traps: Traps,
  variant: Variant,
  try2: makePause(9, 12),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

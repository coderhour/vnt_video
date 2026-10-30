import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-consecutive-sums';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const PINK = '#e0559a';
const TEAL = '#14a3b8';
/** Colour of each run length on the board. */
const RUN = { 2: C.primary, 3: C.violet, 4: C.blue, 5: C.amber, 7: PINK, 8: TEAL } as Record<number, string>;

// Same numbers as verify.py: the sums each run length adds that no shorter run made.
const sumsOf = (len: number, max = 50) =>
  range(50)
    .map((a) => len * (a + 1) + (len * (len - 1)) / 2)
    .filter((s) => s <= max);
const NEW: Record<number, number[]> = {};
{
  const seen = new Set<number>();
  for (let len = 2; len <= 10; len++) {
    NEW[len] = sumsOf(len).filter((s) => !seen.has(s));
    sumsOf(len).forEach((s) => seen.add(s));
  }
}
const FAILS = [1, 2, 4, 8, 16, 32];

// ---------- small building blocks ----------

/** A maths line placed absolutely. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** A number tile. */
const Chip: React.FC<{ x: number; y: number; n: number | string; color?: string; filled?: boolean; size?: number; style?: React.CSSProperties }> = ({ x, y, n, color = C.ink, filled = false, size = 88, style }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: 16,
      background: filled ? color : C.card,
      border: `5px solid ${color}`,
      color: filled ? '#fff' : color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.56,
      fontWeight: 900,
      boxSizing: 'border-box',
      boxShadow: '0 4px 14px rgba(30,40,80,0.07)',
      ...style,
    }}
  >
    {n}
  </div>
);

// ---------- the 1–50 board ----------

const BX = 110;
const BY = 190;
const PITCH = 88;
const CELL = 79;
const cellXY = (n: number) => [BX + ((n - 1) % 10) * PITCH, BY + Math.floor((n - 1) / 10) * PITCH] as const;

type Lit = Record<number, { at: number; color: string }>;
type Pulse = { n: number; at: number; color: string };

const Board: React.FC<{ lit: Lit; pulses?: Pulse[]; failAt?: number; opacity?: number }> = ({ lit, pulses = [], failAt = 1e9, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      {range(50).map((i) => {
        const n = i + 1;
        const [x, y] = cellXY(n);
        const l = lit[n];
        const p = l ? ease(f, l.at, 8) : 0;
        const pop = l ? interpolate(f, [l.at, l.at + 5, l.at + 12], [1, 1.12, 1], clamp) : 1;
        const fail = FAILS.indexOf(n);
        const fp = fail >= 0 ? ease(f, failAt + fail * 6, 10) : 0;
        const pulse = pulses.filter((q) => q.n === n).reduce((m, q) => Math.max(m, interpolate(f, [q.at, q.at + 8, q.at + 30, q.at + 40], [0, 1, 1, 0], clamp)), 0);
        return (
          <div key={n} style={{ position: 'absolute', left: x, top: y, width: CELL, height: CELL, transform: `scale(${pop * (1 + 0.08 * fp)})` }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: C.card, border: `3px solid ${C.line}`, boxSizing: 'border-box' }} />
            {l && <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: l.color, opacity: p }} />}
            {fp > 0 && <div style={{ position: 'absolute', inset: -4, borderRadius: 16, border: `7px solid ${C.red}`, opacity: fp, background: 'rgba(239,67,67,0.10)' }} />}
            {pulse > 0 && <div style={{ position: 'absolute', inset: -6, borderRadius: 18, border: `7px solid ${pulses.find((q) => q.n === n)!.color}`, opacity: pulse }} />}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, color: p > 0.5 ? '#fff' : fp > 0 ? C.red : C.ink }}>{n}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Light up `ns` one after another between frames a and b. */
const sweep = (lit: Lit, ns: number[], a: number, b: number, color: string) =>
  ns.forEach((n, i) => (lit[n] = { at: a + ((b - a) * i) / Math.max(1, ns.length - 1), color }));

const PX = 1010; // right panel

/** One run length on the right panel: label, maths, how many new cells. */
/** Header over the run rows. */
const RunHead: React.FC<{ start: number; opacity?: number }> = ({ start, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <Text x={PX} y={185} w={760} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, start), opacity: ease(f, start, 14) * opacity }}>
      run length · sums · new cells
    </Text>
  );
};

const RunRow: React.FC<{ y: number; len: number; tex: string; count: string; start: number; countAt: number; color?: string; opacity?: number }> = ({ y, len, tex, count, start, countAt, color = RUN[len] ?? C.muted, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: PX, top: y, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <div style={{ width: 62, height: 62, borderRadius: 31, background: color, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>{len}</div>
      <Tex tex={tex} size={50} />
      <div style={{ position: 'absolute', left: 730, fontSize: 50, fontWeight: 900, color, ...fadeUp(f, countAt, 10) }}>{count}</div>
    </div>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const q = at(scene, 1, 0.1);
  return (
    <>
      <Text x={960} y={150} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        Which numbers can you build?
      </Text>
      <Eq x={260} y={330} start={at(scene, 0, 0.05)} size={84} tex="9 = 4 + 5" color={C.primary} />
      <Eq x={260} y={470} start={at(scene, 0, 0.45)} size={84} tex="10 = 1 + 2 + 3 + 4" color={C.violet} />
      <Eq x={1180} y={330} start={q} size={84} tex="8 = \;?" color={C.red} />
      <Eq x={1180} y={470} start={q + 10} size={84} tex="16 = \;?" color={C.red} />
      <Text x={1180} y={620} w={600} size={56} weight={900} color={C.red} style={fadeUp(f, at(scene, 1, 0.6))}>
        Never!
      </Text>
      <div style={{ position: 'absolute', left: 300, top: 640, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CHOICES = ['24', '43', '44', '45', '47'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1060, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 48, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        How many whole numbers <Mark on={at(scene, 0, 0.3)}>{'from 1 to 50'}</Mark> can be written as the{' '}
        <Mark on={at(scene, 1, 0.25)}>sum of two or more consecutive positive whole numbers</Mark>? (For example,{' '}
        <Mark on={at(scene, 2, 0.2)}>{'9 = 4 + 5'}</Mark>.)
      </div>
      <Choices x={130} y={660} items={CHOICES} start={(i) => at(scene, 3, 0.12 + i * 0.13)} />
      <Chip x={1290} y={300} n={4} color={C.primary} filled style={fadeUp(f, at(scene, 2, 0.35))} />
      <Text x={1395} y={302} w={80} size={64} weight={900} style={fadeUp(f, at(scene, 2, 0.45))}>+</Text>
      <Chip x={1460} y={300} n={5} color={C.primary} filled style={fadeUp(f, at(scene, 2, 0.5))} />
      <Text x={1570} y={302} w={300} size={64} weight={900} color={C.primary} style={fadeUp(f, at(scene, 2, 0.65))}>= 9</Text>
      <Text x={1290} y={430} w={560} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.7))}>
        two numbers in a row
      </Text>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const row = (ns: (number | string)[], y: number, start: number, color: string, gapAfter = -1) =>
    ns.map((n, i) => <Chip key={i} x={160 + i * 108 + (gapAfter >= 0 && i > gapAfter ? 60 : 0)} y={y} n={n} color={color} filled style={fadeUp(f, start + i * 4, 10)} />);
  const bad = (x: number, y: number, start: number) => (
    <div style={{ position: 'absolute', left: x, top: y, fontSize: 72, fontWeight: 900, color: C.red, ...fadeUp(f, start, 8) }}>✗</div>
  );
  return (
    <>
      {row([4, 5, 6], 200, at(scene, 0, 0.55), C.primary)}
      <div style={{ position: 'absolute', left: 500, top: 196, fontSize: 72, fontWeight: 900, color: C.green, ...fadeUp(f, at(scene, 0, 0.75), 8) }}>✓</div>
      {row([5], 360, at(scene, 1, 0.4), C.muted)}
      {bad(290, 356, at(scene, 1, 0.6))}
      {row([-1, 0, 1, 2], 520, at(scene, 2, 0.55), C.muted)}
      {bad(610, 516, at(scene, 2, 0.75))}
      <Check x={820} y={210} start={at(scene, 0, 0.2)}>Consecutive: next to each other</Check>
      <Check x={820} y={370} start={at(scene, 1, 0.15)}>At least two numbers</Check>
      <Check x={820} y={530} start={at(scene, 2, 0.15)}>All positive: no 0, no negatives</Check>
      <Pill x={560} y={690} color={C.violet} style={{ ...fadeUp(f, at(scene, 3, 0.2)), fontSize: 50 }}>
        Which of 1 to 50 can we build? How many?
      </Pill>
    </>
  );
};

const makePause = (seconds: number, title: string, example: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 130, top: 230, width: 820, background: C.card, borderRadius: 32, padding: '40px 48px', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted, marginTop: 24 }}>Sum of two or more consecutive positive whole numbers?</div>
        <div style={{ marginTop: 30 }}>
          <Tex tex={example} size={60} color={C.primary} />
        </div>
      </div>
      <Countdown scene={scene} seconds={seconds} x={1400} y={480} tick={TICK} />
    </>
  );
};

const BoardScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lit: Lit = {};
  const odds = NEW[2].filter((n) => n !== 3 && n !== 5);
  lit[3] = { at: at(scene, 1, 0.4), color: RUN[2] };
  lit[5] = { at: at(scene, 1, 0.8), color: RUN[2] };
  sweep(lit, odds, at(scene, 3, 0.05), at(scene, 3, 0.55), RUN[2]);
  sweep(lit, NEW[3], at(scene, 4, 0.3), at(scene, 4, 0.8), RUN[3]);
  sweep(lit, NEW[4], at(scene, 5, 0.1), at(scene, 5, 0.6), RUN[4]);
  lit[20] = { at: at(scene, 6, 0.7), color: RUN[5] };
  lit[40] = { at: at(scene, 6, 0.85), color: RUN[5] };
  const pulses: Pulse[] = [
    ...sumsOf(5).map((n, i) => ({ n, at: at(scene, 6, 0.15 + i * 0.05), color: C.amber })),
    ...sumsOf(6).map((n, i) => ({ n, at: at(scene, 7, 0.2 + i * 0.08), color: C.ink })),
  ];
  // the run table fades out over the scene's last 10 frames, so the cut to board2 is not a jump
  const tableOut = fadeTo(f, scene.frames - 10, 0, 10);
  return (
    <>
      <Board lit={lit} pulses={pulses} />
      <div style={{ opacity: tableOut }}>
      <RunHead start={at(scene, 1, 0.05)} />
      <RunRow y={260} len={2} tex="1+2=3,\;2+3=5" count="+24" start={at(scene, 1, 0.1)} countAt={at(scene, 3, 0.6)} />
      <Text x={PX + 82} y={340} w={760} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 2, 0.2)), opacity: ease(f, at(scene, 2, 0.2), 12) * fadeTo(f, at(scene, 4)) }}>
        one odd + one even = always odd
      </Text>
      <RunRow y={360} len={3} tex="6,\;9,\;12,\;\dots" count="+8" start={at(scene, 4, 0.1)} countAt={at(scene, 4, 0.85)} />
      <RunRow y={460} len={4} tex="10,\;14,\;18,\;\dots" count="+8" start={at(scene, 5, 0.05)} countAt={at(scene, 5, 0.7)} />
      <RunRow y={560} len={5} tex="15,\;20,\;\dots,\;50" count="+2" start={at(scene, 6, 0.1)} countAt={at(scene, 6, 0.85)} />
      <RunRow y={660} len={6} tex="\text{always odd}" count="+0" color={C.muted} start={at(scene, 7, 0.1)} countAt={at(scene, 7, 0.75)} />
      </div>
    </>
  );
};

const LIT_BEFORE: Lit = {};
[2, 3, 4, 5].forEach((len) => NEW[len].forEach((n) => (LIT_BEFORE[n] = { at: -100, color: RUN[len] })));

const Board2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lit: Lit = { ...LIT_BEFORE, 28: { at: at(scene, 0, 0.55), color: RUN[7] }, 44: { at: at(scene, 1, 0.55), color: RUN[8] } };
  const pulses: Pulse[] = [{ n: 45, at: at(scene, 2, 0.15), color: C.ink }];
  const rowsOut = fadeTo(f, at(scene, 3));
  const done = at(scene, 5, 0.97);
  return (
    <>
      <Board lit={lit} pulses={pulses} failAt={at(scene, 3, 0.35)} />
      <RunHead start={0} opacity={rowsOut} />
      <RunRow y={260} len={7} tex="1+\dots+7=28" count="+1" start={at(scene, 0, 0.1)} countAt={at(scene, 0, 0.6)} opacity={rowsOut} />
      <RunRow y={360} len={8} tex="2+\dots+9=44" count="+1" start={at(scene, 1, 0.1)} countAt={at(scene, 1, 0.6)} opacity={rowsOut} />
      <RunRow y={460} len={9} tex="1+\dots+9=45" count="+0" color={C.muted} start={at(scene, 2, 0.05)} countAt={at(scene, 2, 0.25)} opacity={rowsOut} />
      <RunRow y={560} len={10} tex="1+\dots+10=55" count="✗" color={C.red} start={at(scene, 2, 0.4)} countAt={at(scene, 2, 0.75)} opacity={rowsOut} />
      <Text x={PX} y={670} w={700} size={48} weight={900} color={C.red} style={{ ...fadeUp(f, at(scene, 2, 0.8)), opacity: ease(f, at(scene, 2, 0.8), 12) * rowsOut }}>
        Too big for 50. Stop!
      </Text>
      <Text x={PX} y={190} w={760} size={48} weight={900} style={fadeUp(f, at(scene, 3, 0.15))}>
        Still dark:
      </Text>
      <Eq x={PX} y={260} start={at(scene, 3, 0.35)} size={60} color={C.red} tex="1,\;2,\;4,\;8,\;16,\;32" />
      <Eq x={PX} y={380} start={at(scene, 4, 0.55)} size={52} tex="1+2=3" />
      <Text x={PX + 290} y={386} w={560} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.65))}>
        is the smallest run
      </Text>
      <Eq x={PX} y={500} start={at(scene, 5, 0.3)} size={64} tex="50 - 6 = 44" color={C.green} />
      <Answer x={1650} y={660} value="44" chime={CHIME} start={done} />
      <Confetti x={1650} y={660} start={done} seed={7} />
    </>
  );
};

// ---------- blocks ----------

const BW = 100;
const BH = 56;
const BASE = 770;

/** A stack of `n` unit blocks with its bottom-left at (x, bottom). The number sits inside. */
const Stack: React.FC<{ x: number; bottom: number; n: number; color: string; label?: string; opacity?: number }> = ({ x, bottom, n, color, label, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      {range(n).map((i) => (
        <rect key={i} x={x + 3} y={bottom - (i + 1) * BH + 3} width={BW - 6} height={BH - 6} rx={8} fill={color} />
      ))}
      {label !== undefined && (
        <text x={x + BW / 2} y={bottom - BH / 2 + 2} fontFamily={NUNITO} fontWeight={900} fontSize={48} fill="#fff" textAnchor="middle" dominantBaseline="middle">
          {label}
        </text>
      )}
    </g>
  );

/** Position along a hop from a to b (lift, carry, drop). */
const hop = (t: number, a: [number, number], b: [number, number], lift = 120): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * lift];

const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const oddOut = fadeTo(f, at(scene, 4));
  const evenIn = ease(f, at(scene, 4, 0.1), 14);
  // odd run: 4 + 5 + 6, top block of the 6 moves onto the 4
  const ox = [200, 330, 460];
  const mv = [at(scene, 2, 0.15), at(scene, 2, 0.5)] as const;
  const t = interpolate(f, mv, [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const landed = f >= mv[1];
  const moving = f >= mv[0] && !landed;
  const [mx, my] = hop(t, [ox[2], BASE - 5 * BH], [ox[0], BASE - 4 * BH]);
  const midLine = ease(f, at(scene, 2, 0.6), 12);
  // even run: 2 3 4 5; the 5 hops onto the 2, then the 4 onto the 3
  const ex = [200, 330, 460, 590];
  const h1 = [at(scene, 5, 0.1), at(scene, 5, 0.35)] as const;
  const h2 = [at(scene, 5, 0.4), at(scene, 5, 0.65)] as const;
  const sm = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const [p5x, p5y] = hop(sm(...h1), [ex[3], BASE], [ex[0], BASE - 2 * BH], 140);
  const [p4x, p4y] = hop(sm(...h2), [ex[2], BASE], [ex[1], BASE - 3 * BH], 140);
  const parity = ease(f, at(scene, 6, 0.1), 12);
  const ev = (base: string) => (parity > 0.5 ? C.blue : base);
  const od = (base: string) => (parity > 0.5 ? C.amber : base);
  const sevens = ease(f, at(scene, 5, 0.75), 10);
  return (
    <>
      <Pill x={130} y={170} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.4)), fontSize: 46 }}>Runs as blocks</Pill>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.1), 12) * oddOut}>
          <Stack x={ox[0]} bottom={BASE} n={landed ? 5 : 4} color={C.primary} label={landed ? '5' : '4'} />
          <Stack x={ox[1]} bottom={BASE} n={5} color={C.primary} label="5" />
          <Stack x={ox[2]} bottom={BASE} n={landed || moving ? 5 : 6} color={C.primary} label={landed ? '5' : moving ? '' : '6'} />
          {moving && <rect x={mx + 3} y={my - BH + 3} width={BW - 6} height={BH - 6} rx={8} fill={C.amber} />}
          {landed && <rect x={ox[0] + 3} y={BASE - 5 * BH + 3} width={BW - 6} height={BH - 6} rx={8} fill={C.amber} opacity={fadeTo(f, mv[1] + 40, 0, 20)} />}
          <line x1={ox[0] - 30} x2={ox[2] + BW + 30} y1={BASE - 5 * BH} y2={BASE - 5 * BH} stroke={C.ink} strokeWidth={4} strokeDasharray="12 10" opacity={midLine} />
        </g>
        <g opacity={evenIn}>
          <Stack x={ex[0]} bottom={BASE} n={2} color={ev(C.violet)} label="2" />
          <Stack x={ex[1]} bottom={BASE} n={3} color={od(C.violet)} label="3" />
          <Stack x={p4x} bottom={p4y} n={4} color={ev(C.violet)} label="4" />
          <Stack x={p5x} bottom={p5y} n={5} color={od(C.violet)} label="5" />
          {[0, 1].map((i) => (
            <g key={i} opacity={sevens}>
              <rect x={ex[i] + 10} y={BASE - 7 * BH - 78} width={BW - 20} height={64} rx={32} fill={C.ink} />
              <text x={ex[i] + BW / 2} y={BASE - 7 * BH - 44} fontFamily={NUNITO} fontWeight={900} fontSize={48} fill="#fff" textAnchor="middle" dominantBaseline="middle">7</text>
            </g>
          ))}
        </g>
      </Stage>
      <Text x={ox[2] + BW + 50} y={BASE - 5 * BH - 32} w={300} size={44} weight={800} color={C.muted} style={{ opacity: midLine * oddOut }}>
        middle
      </Text>
      <div style={{ opacity: oddOut }}>
        <Eq x={900} y={200} start={at(scene, 1, 0.3)} tex="4+5+6 = 15" />
        <Eq x={900} y={300} start={at(scene, 3, 0.35)} tex="= 3 \times 5" color={C.primary} />
        <Text x={1240} y={306} w={600} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 3, 0.2))}>
          length × middle
        </Text>
      </div>
      <Eq x={900} y={200} start={at(scene, 4, 0.2)} tex="2+3+4+5" />
      <Eq x={900} y={310} start={at(scene, 5, 0.4)} tex="2+5 = 7" color={C.violet} />
      <Eq x={900} y={410} start={at(scene, 5, 0.7)} tex="3+4 = 7" color={C.violet} />
      <div style={{ position: 'absolute', left: 1250, top: 340, fontSize: 48, fontWeight: 800, ...fadeUp(f, at(scene, 6, 0.3)) }}>
        <span style={{ color: C.blue }}>even</span> + <span style={{ color: C.amber }}>odd</span> = odd
      </div>
      <Eq x={900} y={540} start={at(scene, 7, 0.3)} size={60} tex="2+3+4+5 = 2 \times 7 = 14" color={C.green} />
    </>
  );
};

// ---------- the rule ----------

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const aOut = fadeTo(f, at(scene, 4));
  const bIn = at(scene, 4);
  const card = (x: number, title: string, tex: string, start: number) => (
    <div style={{ position: 'absolute', left: x, top: 170, width: 780, background: C.card, borderRadius: 28, padding: '26px 40px', boxShadow: '0 8px 26px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      <div style={{ fontSize: 44, fontWeight: 900, color: C.muted }}>{title}</div>
      <div style={{ marginTop: 8 }}>
        <Tex tex={tex} size={60} />
      </div>
    </div>
  );
  // 44 = four pairs that each add up to 11: chips 2…9 with nested arcs
  const cx0 = 1010;
  const cp = 104;
  const cy = 640;
  const chipX = (i: number) => cx0 + i * cp;
  const pairCol = [C.primary, C.violet, C.blue, C.amber];
  const pairAt = (i: number) => at(scene, 8, 0.05 + i * 0.16);
  return (
    <>
      <div style={{ opacity: aOut }}>
        {card(130, 'odd length', '15 = {\\color{#7b61ff}\\mathbf{3}} \\times 5', at(scene, 0, 0.3))}
        {card(1010, 'even length', '14 = 2 \\times {\\color{#7b61ff}\\mathbf{7}}', at(scene, 0, 0.6))}
        <Text x={130} y={395} w={1600} size={48} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.75))}>
          Always an odd factor bigger than 1
        </Text>
        <Text x={130} y={500} w={700} size={48} weight={900} style={fadeUp(f, at(scene, 1, 0.3))}>
          Powers of 2:
        </Text>
        {FAILS.map((n, i) => (
          <Chip key={n} x={480 + i * 110} y={490} n={n} color={C.red} filled style={fadeUp(f, at(scene, 1, 0.35) + i * 4, 10)} />
        ))}
        <Eq x={130} y={620} start={at(scene, 2, 0.2)} size={52} tex="8 = 2 \times 2 \times 2" />
        <Eq x={130} y={710} start={at(scene, 2, 0.35)} size={52} tex="32 = 2 \times 2 \times 2 \times 2 \times 2" />
        <Text x={1010} y={630} w={800} size={52} weight={900} color={C.red} style={fadeUp(f, at(scene, 2, 0.6))}>
          Only 2s. No odd factor!
        </Text>
        <Text x={1010} y={715} w={800} size={52} weight={900} color={C.red} style={fadeUp(f, at(scene, 3, 0.3))}>
          ✗ No run can make them
        </Text>
      </div>
      <div style={{ opacity: ease(f, bIn, 12) }}>
        <Text x={130} y={180} w={1700} size={52} weight={900} color={C.violet} style={{}}>
          Every other number has an odd factor → build a run!
        </Text>
        <Eq x={130} y={300} start={at(scene, 5, 0.05)} size={58} tex="18 = 3 \times 6" />
        {[5, 6, 7].map((n, i) => (
          <Chip key={n} x={130 + i * 108} y={420} n={n} color={C.primary} filled={n === 6} style={fadeUp(f, at(scene, 5, 0.6) + i * 5, 10)} />
        ))}
        <Text x={130} y={530} w={600} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 5, 0.75))}>
          3 numbers around 6
        </Text>
        <Eq x={1010} y={300} start={at(scene, 6, 0.05)} size={58} tex="44 = 4 \times 11" />
        <Text x={1010} y={385} w={860} size={44} weight={800} color={C.red} style={{ ...fadeUp(f, at(scene, 6, 0.55)), opacity: ease(f, at(scene, 6, 0.55), 12) * fadeTo(f, at(scene, 7)) }}>
          11 numbers around 4 go below 1 ✗
        </Text>
        <Text x={1010} y={385} w={800} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 7, 0.3))}>
          4 pairs, each adding up to 11
        </Text>
        <Stage>
          {range(4).map((i) => {
            const a = chipX(i) + 44;
            const b = chipX(7 - i) + 44;
            const h = 50 + (3 - i) * 32;
            return <path key={i} d={`M ${a} ${cy - 6} C ${a} ${cy - h}, ${b} ${cy - h}, ${b} ${cy - 6}`} fill="none" stroke={pairCol[i]} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, pairAt(i), 12)} />;
          })}
        </Stage>
        {range(8).map((i) => {
          const pair = Math.min(i, 7 - i);
          const on = f >= pairAt(pair);
          return <Chip key={i} x={chipX(i)} y={cy} n={i + 2} color={on ? pairCol[pair] : C.muted} filled={on} style={fadeUp(f, at(scene, 7, 0.6) + i * 3, 10)} />;
        })}
        <Eq x={1010} y={750} start={at(scene, 8, 0.75)} size={50} tex="= 2 + 3 + \dots + 9" color={C.green} />
        <Text x={130} y={640} w={800} size={48} weight={900} color={C.red} style={fadeUp(f, at(scene, 9, 0.1))}>
          Only powers of 2 fail.
        </Text>
        <Eq x={130} y={720} start={at(scene, 9, 0.6)} size={60} tex="50 - 6 = 44" color={C.green} />
        <Answer x={820} y={470} value="44" chime={CHIME} start={at(scene, 9, 0.97)} />
      </div>
    </>
  );
};

// ---------- traps ----------

const NOTES = ['only runs of 2: the odd numbers', "counted 64, but it's past 50", '', 'counted 1 as a sum', 'crossed out only 1, 2, 4'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 0, 0.1), at(scene, 1, 0.1), 1e9, at(scene, 2, 0.1), at(scene, 3, 0.1)];
  return (
    <>
      <div style={{ position: 'absolute', left: 135, top: 190, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 2 && f >= at(scene, 4);
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 300, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 200, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted }}>{'ABCDE'[i]}</div>
                <div style={{ fontSize: 100, fontWeight: 900, color: wrong ? C.red : right ? C.green : C.ink, lineHeight: 1 }}>{c}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 22, fontSize: 40, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 300, top: 650, width: 1320, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '22px 40px', fontSize: 46, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.3)) }}>
        Check until runs get too big, and keep each power of 2 in range!
      </div>
    </>
  );
};

// ---------- variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={130} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>Your turn!</Pill>
      <Text x={130} y={300} w={1000} size={64} weight={900} style={fadeUp(f, at(scene, 0, 0.6))}>
        Whole numbers from 1 to 100
      </Text>
      <Text x={130} y={420} w={1000} size={50} weight={700} style={fadeUp(f, at(scene, 0, 0.75))}>
        How many can be written as a sum of two or more consecutive positive whole numbers?
      </Text>
      <Pill x={130} y={660} color={C.amber} style={fadeUp(f, at(scene, 1, 0.3))}>Hunt for the ones that fail!</Pill>
      <Eq x={1220} y={370} start={at(scene, 0, 0.7)} size={72} tex="1, 2, 3, \dots, 100" color={C.violet} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P2 = [1, 2, 4, 8, 16, 32, 64];
  const done = at(scene, 3, 0.97);
  return (
    <>
      <Text x={130} y={180} w={900} size={52} weight={900} style={fadeUp(f, at(scene, 0, 0.3))}>
        The numbers that fail: powers of 2
      </Text>
      {P2.map((n, i) => (
        <Chip key={n} x={130 + i * 112} y={280} n={n} color={C.red} filled size={96} style={fadeUp(f, at(scene, 1, 0.05 + i * 0.1), 10)} />
      ))}
      <div style={{ position: 'absolute', left: 130 + 7 * 112 + 20, top: 280, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, at(scene, 2, 0.4)) }}>
        <Chip x={0} y={0} n={128} color={C.muted} size={96} style={{ position: 'relative', textDecoration: 'line-through', width: 140, fontSize: 50 }} />
        <Tex tex="> 100" size={56} color={C.muted} />
      </div>
      <Eq x={130} y={430} start={at(scene, 3, 0.2)} size={60} tex="7 \text{ fail}" color={C.red} />
      <Eq x={130} y={530} start={at(scene, 3, 0.45)} size={64} tex="100 - 7 = 93" color={C.green} />
      <Eq x={130} y={660} start={at(scene, 4, 0.2)} size={52} tex="100 = 5 \times 20 = 18+19+20+21+22" />
      <Answer x={1500} y={520} value="93" chime={CHIME} start={done} />
      <Confetti x={1500} y={520} start={done} seed={11} />
      <Pill x={1330} y={720} color={C.primary} style={fadeUp(f, at(scene, 4, 0.8))}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 580, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 56, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 140, width: 1450, fontSize: 60, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, 4) }}>
          A run of 2 or more consecutive numbers always has an <span style={{ color: C.violet }}>odd factor bigger than 1</span>.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 320, width: 1450, fontSize: 52, fontWeight: 800, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          So only the <span style={{ color: C.red }}>powers of 2</span> can't be built, even in a huge range.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 470, width: 1450, fontSize: 52, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 1, 0.6)) }}>
          Find them, and take them away.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'Whole numbers from 1\u00a0to\u00a050', '9 = 4 + 5'),
  board: BoardScene,
  board2: Board2,
  blocks: Blocks,
  rule: Rule,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'Whole numbers from 1\u00a0to\u00a0100', '\\text{How many?}'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;


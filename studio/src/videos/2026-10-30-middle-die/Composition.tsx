import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Choices, Confetti, Mark, Pill, Row, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-30-middle-die';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// The three dice are told apart by colour (red, blue, green), so the 216 ordered rolls are equally likely.
const RED = C.red;
const BLUE = C.blue;
const GREEN = C.primary;
export const DICE = [RED, BLUE, GREEN];

// ---------- dice ----------

const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

/** A die centred at (x, y). `color` fills the body (white pips); no colour = white die, dark pips.
 * v = 0 draws a "?" face. */
export const Die: React.FC<{ x: number; y: number; v: number; size?: number; color?: string; opacity?: number; scale?: number }> = ({ x, y, v, size = 120, color, opacity = 1, scale = 1 }) => {
  if (opacity <= 0 || scale <= 0) return null;
  const s = size;
  const body = color ?? C.card;
  const pip = color ? '#fff' : C.ink;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.18} fill={body} stroke={color ? 'none' : C.ink} strokeWidth={color ? 0 : 5} />
      {v === 0 ? (
        <text y={s * 0.04} fontSize={s * 0.62} fontWeight={900} fill={pip} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO}>?</text>
      ) : (
        PIPS[v].map(([px, py], i) => <circle key={i} cx={px * s * 0.26} cy={py * s * 0.26} r={s * 0.09} fill={pip} />)
      )}
    </g>
  );
};

/** Amber rounded box around a die: "this is the middle one". */
export const Ring: React.FC<{ x: number; y: number; size: number; opacity: number; color?: string }> = ({ x, y, size, opacity, color = C.amber }) =>
  opacity <= 0 ? null : (
    <rect x={x - size / 2 - 14} y={y - size / 2 - 14} width={size + 28} height={size + 28} rx={size * 0.26} fill="none" stroke={color} strokeWidth={7} opacity={opacity} />
  );

/** Empty slot with a label inside (e.g. "1–2"). */
const Slot: React.FC<{ x: number; y: number; size: number; label: string; color: string; opacity: number }> = ({ x, y, size, label, color, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <rect x={x - size / 2} y={y - size / 2} width={size} height={size} rx={size * 0.18} fill={C.card} stroke={color} strokeWidth={6} strokeDasharray="14 10" />
      <text x={x} y={y + 3} fontSize={52} fontWeight={900} fill={color} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO}>{label}</text>
    </g>
  );

export const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' }> = ({ x, y, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle">
      {text}
    </text>
  );

const Arrow: React.FC<{ x1: number; x2: number; y: number; opacity: number }> = ({ x1, x2, y, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={C.muted} strokeWidth={7} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <path d={`M ${x2 - 22} ${y - 18} L ${x2} ${y} L ${x2 - 22} ${y + 18}`} />
    </g>
  );

/** A roll of three coloured dice that slide into sorted order at frame `sortAt`.
 * Unsorted slots start at x0, sorted slots at x1. The middle sorted die gets a ring. */
export const SortRoll: React.FC<{ vals: number[]; x0: number; x1: number; y: number; size: number; gap: number; start: number; sortAt: number; ringAt?: number; colors?: (string | undefined)[]; opacity?: number }> = ({
  vals, x0, x1, y, size, gap, start, sortAt, ringAt, colors = DICE, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (opacity <= 0) return null;
  // stable sort: index order among equals
  const order = range(3).sort((a, b) => vals[a] - vals[b] || a - b);
  const slot = (i: number) => order.indexOf(i);
  const m = ease(f, sortAt, 20);
  return (
    <g opacity={opacity}>
      {range(3).map((i) => (
        <Die key={`g${i}`} x={x0 + i * gap} y={y} v={vals[i]} size={size} color={colors[i]} opacity={0.22 * ease(f, sortAt, 8)} />
      ))}
      {range(3).map((i) => {
        const xa = x0 + i * gap;
        const xb = x1 + slot(i) * gap;
        return <Die key={i} x={xa + (xb - xa) * m} y={y - Math.sin(Math.PI * m) * 40} v={vals[i]} size={size} color={colors[i]} scale={pop(f, start + i * 4, fps)} />;
      })}
      {ringAt !== undefined && <Ring x={x1 + gap} y={y} size={size} opacity={ease(f, ringAt, 10)} />}
    </g>
  );
};

/** A tally/maths line on the right panel. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Green answer badge holding a fraction, with the chime. */
const FracBadge: React.FC<{ x: number; y: number; tex?: string; text?: string; start: number }> = ({ x, y, tex, text, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 130, top: y - 130, width: 260, height: 260, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {tex ? <Tex tex={tex} size={84} color="#fff" /> : <span style={{ fontFamily: NUNITO, fontSize: 130, fontWeight: 900 }}>{text}</span>}
        </div>
      )}
    </>
  );
};

const Line: React.FC<{ x: number; y: number; w: number; style: React.CSSProperties }> = ({ x, y, w, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 5, background: C.line, ...style }} />
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const not = at(scene, 2, 0.55);
  return (
    <>
      <Text x={960} y={110} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        Is the middle one a 2?
      </Text>
      <Stage>
        <SortRoll vals={[5, 2, 1]} x0={720} x1={720} y={400} size={170} gap={240} start={4} sortAt={at(scene, 0, 0.55)} ringAt={at(scene, 1, 0.3)} />
        <Label x={960} y={555} text="middle" color={C.amber} opacity={ease(f, at(scene, 1, 0.3), 10)} />
      </Stage>
      <Text x={1500} y={630} w={600} size={76} weight={900} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 2, 0.05)), textDecoration: f > not ? 'line-through' : 'none' }}>
        1 out of 6?
      </Text>
      <Text x={1500} y={740} w={420} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, not)}>
        NOT right!
      </Text>
      <div style={{ position: 'absolute', left: 300, top: 640, ...fadeUp(f, at(scene, 3)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['\\frac{1}{9}', '\\frac{1}{6}', '\\frac{5}{27}', '\\frac{11}{54}', '\\frac{2}{9}'];
const choiceNodes = CHOICES.map((c) => <Tex key={c} tex={c} size={72} />);

const QuestionCard: React.FC<{ marks?: number[]; width?: number; style?: React.CSSProperties }> = ({ marks = [-1, -1, -1], width = 1000, style }) => (
  <div style={{ position: 'absolute', left: 100, top: 160, width, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 50, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...style }}>
    <Mark on={marks[0]}>Three fair six-sided dice</Mark> are rolled. When the three numbers are{' '}
    <Mark on={marks[1]}>put in order</Mark>, what is the probability that{' '}
    <Mark on={marks[2]}>the middle one is 2</Mark>?
  </div>
);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <QuestionCard marks={[at(scene, 1, 0.1), at(scene, 2, 0.3), at(scene, 3, 0.4)]} style={fadeUp(f, 0)} />
      <Choices x={130} y={630} items={choiceNodes} start={(i) => at(scene, 4, 0.1 + i * 0.15)} />
      <Stage>
        {range(3).map((i) => (
          <Die key={i} x={1380 + i * 170} y={380} v={0} size={140} color={DICE[i]} scale={pop(f, at(scene, 1, 0.2) + i * 5, fps)} />
        ))}
        <Arrow x1={1380} x2={1720} y={520} opacity={ease(f, at(scene, 2, 0.4), 10)} />
        <Label x={1550} y={575} text="smallest → largest" size={40} color={C.muted} opacity={ease(f, at(scene, 2, 0.4), 10)} />
        <Ring x={1550} y={380} size={140} opacity={ease(f, at(scene, 3, 0.5), 10)} />
      </Stage>
    </>
  );
};

/** Example rows for "what are we asked?" */
const EX = [
  { vals: [5, 2, 1], y: 270, show: [0, 0.1], sort: [1, 0.1], verdict: [1, 0.5], ok: true },
  { vals: [2, 6, 2], y: 450, show: [2, 0.03], sort: [2, 0.35], verdict: [2, 0.7], ok: true },
  { vals: [3, 2, 4], y: 630, show: [3, 0.03], sort: [3, 0.35], verdict: [3, 0.65], ok: false },
];

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const phaseA = fadeTo(f, at(scene, 4));
  const big = [at(scene, 4, 0.3), at(scene, 4, 0.45), at(scene, 4, 0.6)];
  return (
    <>
      <Stage>
        <g opacity={phaseA}>
          {EX.map((e, k) => {
            const start = at(scene, e.show[0], e.show[1]);
            const sortAt = at(scene, e.sort[0], e.sort[1]);
            const verdict = at(scene, e.verdict[0], e.verdict[1]);
            const mid = [...e.vals].sort()[1];
            return (
              <g key={k} opacity={f >= start - 2 ? 1 : 0}>
                <SortRoll vals={e.vals} x0={230} x1={830} y={e.y} size={120} gap={145} start={start} sortAt={sortAt} ringAt={verdict} />
                <Arrow x1={590} x2={720} y={e.y} opacity={ease(f, sortAt, 8)} />
                <Label x={1250} y={e.y} anchor="start" text={`middle = ${mid}`} color={e.ok ? C.green : C.red} size={60} opacity={ease(f, verdict, 10)} />
                <Label x={1640} y={e.y} anchor="start" text={e.ok ? '✓' : '✗'} color={e.ok ? C.green : C.red} size={84} opacity={ease(f, verdict + 6, 10)} />
              </g>
            );
          })}
        </g>
        {range(3).map((i) => (
          <g key={i}>
            <Die x={560 + i * 280} y={330} v={i === 0 ? 3 : i === 1 ? 6 : 1} size={170} color={DICE[i]} opacity={ease(f, big[i], 12)} />
            <Label x={560 + i * 280} y={465} text={['red', 'blue', 'green'][i]} color={DICE[i]} opacity={ease(f, big[i], 12)} />
          </g>
        ))}
      </Stage>
      <Eq x={560} y={520} tex="6 \times 6 \times 6 = 216" size={72} start={at(scene, 5, 0.5)} />
      <Text x={1470} y={300} w={400} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 5, 0.3))}>
        6 faces each
      </Text>
      <Pill x={1240} y={540} color={C.violet} style={{ ...fadeUp(f, at(scene, 6, 0.5)), fontSize: 44 }}>all equally likely</Pill>
    </>
  );
};

const makePause = (prompt: React.ReactNode, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 200, width: 900, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 50, fontWeight: 700, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        {prompt}
      </div>
      <Stage>
        {range(3).map((i) => (
          <Die key={i} x={380 + i * 170} y={620} v={0} size={130} color={DICE[i]} opacity={ease(f, 8 + i * 4, 10)} />
        ))}
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1430} y={480} tick={TICK} />
    </>
  );
};

// ----- Solution 1 -----

const PANEL = 1010;

const Case1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SX = [260, 470, 680];
  const SY = 360;
  const S = 150;
  const hi = [at(scene, 4, 0.25), at(scene, 4, 0.35), at(scene, 4, 0.45), at(scene, 4, 0.55)];
  const hiVal = 3 + Math.max(0, hi.filter((h) => f >= h).length - 1);
  const ex = at(scene, 5, 0.4); // the example 1, 2, 5
  const highV = f >= ex ? 5 : hiVal;
  // all six orders of 1, 2, 5 (red, blue, green)
  const perms = [[1, 2, 5], [1, 5, 2], [2, 1, 5], [2, 5, 1], [5, 1, 2], [5, 2, 1]];
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={fadeUp(f, at(scene, 1, 0.1))}>Case 1: exactly one die shows 2</Pill>
      <Stage>
        <Slot x={SX[0]} y={SY} size={S} label="?" color={C.blue} opacity={ease(f, at(scene, 2, 0.2), 12) * (f < at(scene, 3, 0.5) ? 1 : 0)} />
        <Die x={SX[1]} y={SY} v={2} size={S} scale={pop(f, at(scene, 2, 0.1), fps)} />
        <Slot x={SX[2]} y={SY} size={S} label="?" color={C.violet} opacity={ease(f, at(scene, 2, 0.6), 12) * (f < hi[0] ? 1 : 0)} />
        <Label x={SX[0]} y={SY + 120} text="lower" color={C.blue} opacity={ease(f, at(scene, 2, 0.2), 12)} />
        <Label x={SX[2]} y={SY + 120} text="higher" color={C.violet} opacity={ease(f, at(scene, 2, 0.6), 12)} />
        <Ring x={SX[1]} y={SY} size={S} opacity={ease(f, at(scene, 2, 0.1), 12)} />
        <Die x={SX[0]} y={SY} v={1} size={S} scale={pop(f, at(scene, 3, 0.5), fps)} />
        {f >= hi[0] && <Die key={highV} x={SX[2]} y={SY} v={highV} size={S} scale={f >= ex ? 1 : pop(f, hi[hiVal - 3], fps)} />}
        <Label x={SX[0]} y={SY + 185} text="only 1" color={C.blue} opacity={ease(f, at(scene, 3, 0.6), 12)} />
        <Label x={SX[2]} y={SY + 185} text="3, 4, 5, 6" color={C.violet} opacity={ease(f, at(scene, 4, 0.6), 12)} />
        <Label x={SX[2]} y={SY + 245} text="4 choices" color={C.violet} opacity={ease(f, at(scene, 4, 0.7), 12)} />
        {/* the six orders of 1, 2, 5 */}
        {perms.map((p, k) => {
          const col = k % 2;
          const row = Math.floor(k / 2);
          const t = at(scene, 6, 0.1 + k * 0.12);
          return range(3).map((i) => (
            <Die key={`${k}-${i}`} x={PANEL + 60 + col * 400 + i * 105} y={300 + row * 130} v={p[i]} size={92} color={DICE[i]} scale={pop(f, t + i * 2, fps)} />
          ));
        })}
      </Stage>
      <Text x={PANEL} y={680} w={800} size={52} weight={900} color={C.ink} style={fadeUp(f, at(scene, 6, 0.85))}>
        1, 2, 5 in <span style={{ color: C.violet }}>6 orders</span>
      </Text>
      <Eq x={160} y={700} tex="6 \times 4 = 24" size={72} start={at(scene, 7, 0.3)} />
      <Text x={600} y={712} w={400} size={56} weight={900} color={C.green} style={fadeUp(f, at(scene, 8, 0.2))}>
        rolls
      </Text>
    </>
  );
};

const TALLY_Y = [270, 365, 460];

const Case2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const topOut = fadeTo(f, at(scene, 3));
  const exOut = fadeTo(f, at(scene, 2));
  const spotsOut = fadeTo(f, at(scene, 5));
  const tripleOut = fadeTo(f, at(scene, 7));
  const choicesAt = at(scene, 2, 0.4);
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={{ opacity: fadeTo(f, at(scene, 5), 0, 6) }}>Case 2: exactly two dice show 2</Pill>
      <Pill x={120} y={170} color={C.violet} style={{ ...fadeUp(f, at(scene, 5)), opacity: ease(f, at(scene, 5), 12) * tripleOut }}>Case 3: all three show 2</Pill>
      <Stage>
        {/* L0–L2: two 2s and an odd die */}
        <g opacity={topOut}>
          {range(3).map((i) => (
            <Die key={i} x={260 + i * 190} y={340} v={i === 2 ? 0 : 2} size={150} color={DICE[i]} scale={pop(f, at(scene, 0, 0.3) + i * 4, fps)} />
          ))}
        </g>
        <g opacity={exOut}>
          <SortRoll vals={[2, 2, 1]} x0={160} x1={160} y={580} size={100} gap={115} start={at(scene, 1, 0.3)} sortAt={at(scene, 1, 0.5)} ringAt={at(scene, 1, 0.7)} />
          <SortRoll vals={[2, 2, 5]} x0={560} x1={560} y={580} size={100} gap={115} start={at(scene, 1, 0.3)} sortAt={at(scene, 1, 0.5)} ringAt={at(scene, 1, 0.7)} />
        </g>
        <g opacity={topOut}>
          {[1, 3, 4, 5, 6].map((v, k) => (
            <Die key={v} x={180 + k * 125} y={580} v={v} size={100} scale={pop(f, choicesAt + k * 3, fps)} />
          ))}
          <Label x={440} y={690} text="5 choices (not 2)" color={C.violet} opacity={ease(f, choicesAt + 15, 10)} />
        </g>
        {/* L3–L4: the odd die can be red, blue or green */}
        <g opacity={ease(f, at(scene, 3, 0.1), 10) * spotsOut}>
          {range(3).map((k) => {
            const t = at(scene, 3, 0.2 + k * 0.2);
            return range(3).map((i) => (
              <Die key={`${k}-${i}`} x={230 + i * 125} y={320 + k * 140} v={i === k ? 0 : 2} size={110} color={DICE[i]} scale={pop(f, t + i * 2, fps)} />
            ));
          })}
          <Label x={640} y={460} anchor="start" text="3 spots" color={C.violet} size={56} opacity={ease(f, at(scene, 3, 0.85), 10)} />
        </g>
        {/* L5: all three 2s */}
        <g opacity={tripleOut}>
          {range(3).map((i) => (
            <Die key={i} x={260 + i * 190} y={400} v={2} size={150} color={DICE[i]} scale={pop(f, at(scene, 5, 0.3) + i * 4, fps)} />
          ))}
          <Label x={450} y={560} text="1 roll" color={C.violet} size={56} opacity={ease(f, at(scene, 5, 0.7), 10)} />
        </g>
      </Stage>
      {/* tally */}
      <Text x={PANEL} y={190} w={800} size={40} weight={800} color={C.muted}>
        rolls with middle 2
      </Text>
      <Row x={PANEL} y={TALLY_Y[0]} label="one 2" tex="6 \times 4 = 24" color={C.primary} style={{}} />
      <Row x={PANEL} y={TALLY_Y[1]} label="two 2s" tex="3 \times 5 = 15" color={C.violet} style={fadeUp(f, at(scene, 4, 0.5))} />
      <Row x={PANEL} y={TALLY_Y[2]} label="three 2s" tex="1" color={C.blue} style={fadeUp(f, at(scene, 5, 0.75))} />
      <Line x={PANEL} y={560} w={760} style={fadeUp(f, at(scene, 6))} />
      <Row x={PANEL} y={585} label="Total" tex="24 + 15 + 1 = 40" strong style={fadeUp(f, at(scene, 6, 0.2))} />
      {/* L7–L9: the fraction */}
      <Eq x={140} y={260} tex="P = \frac{40}{216}" size={80} start={at(scene, 7, 0.4)} />
      <Eq x={140} y={430} tex="= \frac{40 \div 8}{216 \div 8}" size={80} start={at(scene, 8, 0.3)} />
      <Eq x={140} y={610} tex="= \frac{5}{27}" size={80} color={C.green} start={at(scene, 9, 0.2)} />
      <FracBadge x={620} y={680} text="C" start={at(scene, 9, 0.97)} />
      <Confetti x={620} y={680} start={at(scene, 9, 0.97)} seed={5} />
    </>
  );
};

// ----- Solution 2 -----

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = fadeTo(f, at(scene, 3)); // L0–L2: what "small" means
  const B = ease(f, at(scene, 3), 12) * fadeTo(f, at(scene, 6)); // L3–L5: slots
  const Cc = ease(f, at(scene, 6, 0.3), 12); // L6–L10
  const up = ease(f, at(scene, 6, 0.2), 20); // the 56 row moves up
  const s3 = at(scene, 4, 0.2); // all three small: the big slot turns small
  const oldOut = fadeTo(f, s3, 0, 8);
  const newIn = ease(f, s3, 8);
  const SX = [240, 440, 640];
  return (
    <>
      <Stage>
        <g opacity={A}>
          {range(6).map((k) => (
            <Die key={k} x={190 + k * 125} y={290} v={k + 1} size={100} color={k < 2 ? C.primary : undefined} scale={pop(f, at(scene, 0, 0.3) + k * 3, fps)} />
          ))}
          <Label x={252} y={390} text="small" color={C.primary} opacity={ease(f, at(scene, 0, 0.6), 10)} />
          <Label x={690} y={390} text="big" color={C.muted} opacity={ease(f, at(scene, 0, 0.6), 10)} />
          <SortRoll vals={[1, 5, 1]} x0={260} x1={260} y={670} size={100} gap={120} start={at(scene, 2, 0.15)} sortAt={at(scene, 2, 0.3)} ringAt={at(scene, 2, 0.6)} colors={[C.primary, undefined, C.primary]} />
          <Label x={680} y={670} anchor="start" text="middle 1 ≤ 2" color={C.green} opacity={ease(f, at(scene, 2, 0.7), 10)} />
        </g>
        <g opacity={B}>
          <Slot x={SX[0]} y={330} size={150} label="3–6" color={C.violet} opacity={oldOut} />
          <Slot x={SX[0]} y={330} size={150} label="1–2" color={C.primary} opacity={newIn} />
          <Slot x={SX[1]} y={330} size={150} label="1–2" color={C.primary} opacity={1} />
          <Slot x={SX[2]} y={330} size={150} label="1–2" color={C.primary} opacity={1} />
          <Label x={SX[0]} y={460} text="4" color={C.violet} size={56} opacity={ease(f, at(scene, 3, 0.62), 10) * oldOut} />
          <Label x={SX[0]} y={460} text="2" color={C.primary} size={56} opacity={newIn} />
          <Label x={SX[1]} y={460} text="2" color={C.primary} size={56} opacity={ease(f, at(scene, 3, 0.42), 10)} />
          <Label x={SX[2]} y={460} text="2" color={C.primary} size={56} opacity={ease(f, at(scene, 3, 0.5), 10)} />
          <Label x={SX[0] - 80} y={560} text="big one: 3 spots" anchor="start" color={C.violet} size={48} opacity={ease(f, at(scene, 3, 0.18), 10) * oldOut} />
        </g>
        <g opacity={Cc}>
          <SortRoll vals={[4, 1, 1]} x0={200} x1={200} y={600} size={100} gap={120} start={at(scene, 7, 0.2)} sortAt={at(scene, 7, 0.45)} ringAt={at(scene, 7, 0.7)} colors={[undefined, C.primary, C.primary]} />
          <Label x={620} y={600} anchor="start" text="middle 1" color={C.blue} opacity={ease(f, at(scene, 7, 0.75), 10)} />
        </g>
      </Stage>
      <Text x={120} y={440} w={820} size={52} weight={900} style={{ ...fadeUp(f, at(scene, 1, 0.2)), opacity: ease(f, at(scene, 1, 0.2), 14) * A }}>
        Middle is 2 or less exactly when <span style={{ color: C.primary }}>at least two dice are small</span>.
      </Text>
      <Text x={120} y={250} w={820} size={52} weight={900} style={{ ...fadeUp(f, at(scene, 7, 0.05)), opacity: ease(f, at(scene, 7, 0.05), 14) * Cc }}>
        Middle is 1 exactly when <span style={{ color: C.blue }}>at least two dice show 1</span>.
      </Text>
      {/* table */}
      <Text x={PANEL} y={190} w={800} size={40} weight={800} color={C.muted} style={{ opacity: fadeTo(f, at(scene, 6, 0.2)) }}>
        rolls with middle ≤ 2
      </Text>
      <Row x={PANEL} y={270} label="two small" tex="3 \times 2 \times 2 \times 4 = 48" color={C.primary} style={{ ...fadeUp(f, at(scene, 3, 0.8)), opacity: ease(f, at(scene, 3, 0.8), 14) * fadeTo(f, at(scene, 6, 0.1)) }} />
      <Row x={PANEL} y={365} label="three small" tex="2 \times 2 \times 2 = 8" color={C.primary} style={{ ...fadeUp(f, at(scene, 4, 0.6)), opacity: ease(f, at(scene, 4, 0.6), 14) * fadeTo(f, at(scene, 6, 0.1)) }} />
      <Line x={PANEL} y={465} w={760} style={{ ...fadeUp(f, at(scene, 5)), opacity: ease(f, at(scene, 5), 14) * fadeTo(f, at(scene, 6, 0.1)) }} />
      <Row x={PANEL} y={490 - up * 290} label="middle ≤ 2" tex="48 + 8 = 56" strong style={fadeUp(f, at(scene, 5, 0.2))} />
      <Row x={PANEL} y={320} label="two 1s" tex="3 \times 5 = 15" color={C.blue} style={fadeUp(f, at(scene, 8, 0.6))} />
      <Row x={PANEL} y={415} label="three 1s" tex="1" color={C.blue} style={fadeUp(f, at(scene, 9, 0.3))} />
      <Row x={PANEL} y={510} label="middle = 1" tex="15 + 1 = 16" color={C.blue} style={fadeUp(f, at(scene, 9, 0.7))} />
      <Line x={PANEL} y={610} w={760} style={fadeUp(f, at(scene, 10))} />
      <Row x={PANEL} y={635} label="middle = 2" tex="56 - 16 = 40" strong style={fadeUp(f, at(scene, 10, 0.2))} />
    </>
  );
};

// ----- Traps -----

type L = [number, number];
type TrapPanel = { card: number; from: L; to: L; color: string; title: string; rows: { at: L; node: React.ReactNode }[] };

const TRAP_PANELS: TrapPanel[] = [
  { card: 0, from: [1, 0.05], to: [2, 0], color: C.red, title: 'A: only one die shows 2', rows: [
    { at: [1, 0.55], node: <>Only the 24 rolls with one 2: <Tex tex="\frac{24}{216} = \frac{1}{9}" size={72} /></> },
  ] },
  { card: 1, from: [2, 0.05], to: [4, 0], color: C.red, title: 'B: one particular die', rows: [
    { at: [2, 0.4], node: <>The chance one die shows 2 is <Tex tex="\frac{1}{6}" size={72} /></> },
    { at: [3, 0.1], node: <>But after sorting, the middle can be <span style={{ color: C.violet }}>any die</span>!</> },
  ] },
  { card: 3, from: [4, 0.05], to: [7, 0], color: C.red, title: 'D: took away too little', rows: [
    { at: [4, 0.4], node: <>From 56, subtract only rolls like <span style={{ color: C.blue }}>1, 1, 5</span></> },
    { at: [5, 0.1], node: <>3 spots × 4 big numbers = 12 rolls</> },
    { at: [6, 0.1], node: <>Missed: <span style={{ color: C.red }}>1, 1, 2</span> and <span style={{ color: C.red }}>1, 1, 1</span></> },
  ] },
  { card: 4, from: [7, 0.05], to: [9, 1], color: C.red, title: 'E: exactly two small dice', rows: [
    { at: [7, 0.45], node: <>48 rolls with exactly two small dice</> },
    { at: [8, 0.1], node: <>Includes 12 like <span style={{ color: C.red }}>1, 1, 5</span>: middle is 1!</> },
    { at: [9, 0.3], node: <>Misses 4 that count: <span style={{ color: C.green }}>1, 2, 2</span> and <span style={{ color: C.green }}>2, 2, 2</span></> },
  ] },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const A = (l: L) => at(scene, l[0], l[1]);
  const wrongAt = [0, 1, -1, 2, 3].map((k) => (k < 0 ? Infinity : A(TRAP_PANELS[k].from)));
  const rightAt = at(scene, 9, 0.98);
  return (
    <>
      {CHOICES.map((c, i) => {
        const right = i === 2 && f >= rightAt;
        const wrong = f >= wrongAt[i];
        const col = right ? C.green : wrong ? C.red : C.ink;
        return (
          <div key={c} style={{ position: 'absolute', left: 120 + i * 345, top: 140, width: 320, ...fadeUp(f, 6 + i * 5, 12) }}>
            <div style={{ height: 200, background: C.card, borderRadius: 28, border: `6px solid ${right || wrong ? col : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative', boxSizing: 'border-box' }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: C.muted }}>{'ABCDE'[i]}</span>
              <Tex tex={c} size={80} color={col} />
              {(wrong || right) && (
                <div style={{ position: 'absolute', top: -24, right: -24, width: 64, height: 64, borderRadius: '50%', background: col, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {right ? '✓' : '✗'}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {TRAP_PANELS.map((p, k) => {
        const o = ease(f, A(p.from), 10) * fadeTo(f, A(p.to), 0, 8);
        if (o <= 0) return null;
        return (
          <div key={k} style={{ position: 'absolute', left: 120, top: 390, width: 1660, height: 380, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: o, padding: '30px 50px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: p.color }}>{p.title}</div>
            {p.rows.map((r, j) => (
              <div key={j} style={{ fontSize: 52, fontWeight: 800, marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', ...fadeUp(f, A(r.at)) }}>
                <span>{r.node}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 810, top: 360, fontSize: 52, fontWeight: 900, color: C.green, ...fadeUp(f, rightAt) }}>40 out of 216</div>
      <div style={{ position: 'absolute', left: 560, top: 520, width: 800, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '26px 40px', fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 10, 0.3)) }}>
        Try examples: sort first!
      </div>
    </>
  );
};

// ----- Variant -----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Text x={120} y={300} w={1000} size={56} weight={800} style={fadeUp(f, at(scene, 1, 0.1))}>
        Three fair dice are rolled and put in order. What is the probability that <span style={{ color: C.violet }}>the middle one is 3</span>?
      </Text>
      <Pill x={120} y={640} color={C.amber} style={fadeUp(f, at(scene, 2, 0.2))}>Split by how many 3s you roll</Pill>
      <Stage>
        {range(3).map((i) => (
          <Die key={i} x={1360 + i * 180} y={420} v={0} size={150} color={DICE[i]} scale={pop(f, at(scene, 0, 0.5) + i * 5, fps)} />
        ))}
        <Ring x={1540} y={420} size={150} opacity={ease(f, at(scene, 1, 0.8), 10)} />
        <Label x={1540} y={570} text="3?" color={C.amber} size={64} opacity={ease(f, at(scene, 1, 0.8), 10)} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SX = [220, 420, 620];
  const one = fadeTo(f, at(scene, 3));
  const two = ease(f, at(scene, 3), 10) * fadeTo(f, at(scene, 4));
  const three = ease(f, at(scene, 4), 10) * fadeTo(f, at(scene, 6));
  return (
    <>
      <Stage>
        <g opacity={one}>
          <Slot x={SX[0]} y={330} size={150} label="1–2" color={C.blue} opacity={ease(f, at(scene, 1, 0.05), 10)} />
          <Die x={SX[1]} y={330} v={3} size={150} scale={pop(f, at(scene, 0, 0.4), fps)} />
          <Ring x={SX[1]} y={330} size={150} opacity={ease(f, at(scene, 0, 0.5), 10)} />
          <Slot x={SX[2]} y={330} size={150} label="4–6" color={C.violet} opacity={ease(f, at(scene, 1, 0.5), 10)} />
          <Label x={SX[0]} y={460} text="2 choices" color={C.blue} opacity={ease(f, at(scene, 1, 0.3), 10)} size={48} />
          <Label x={SX[2]} y={460} text="3 choices" color={C.violet} opacity={ease(f, at(scene, 1, 0.88), 10)} size={48} />
          <Label x={SX[1]} y={560} text="× 6 orders" color={C.ink} size={56} opacity={ease(f, at(scene, 2, 0.1), 10)} />
        </g>
        <g opacity={two}>
          {range(3).map((k) =>
            range(3).map((i) => (
              <Die key={`${k}-${i}`} x={200 + i * 115} y={290 + k * 135} v={i === k ? 0 : 3} size={100} color={DICE[i]} scale={pop(f, at(scene, 3, 0.1 + k * 0.12) + i * 2, fps)} />
            )),
          )}
          <Label x={580} y={425} anchor="start" text="3 spots × 5" color={C.violet} size={52} opacity={ease(f, at(scene, 3, 0.5), 10)} />
        </g>
        <g opacity={three}>
          {range(3).map((i) => (
            <Die key={i} x={240 + i * 170} y={400} v={3} size={140} color={DICE[i]} scale={pop(f, at(scene, 4, 0.2) + i * 4, fps)} />
          ))}
          <Label x={410} y={550} text="1 roll" color={C.violet} size={56} opacity={ease(f, at(scene, 4, 0.6), 10)} />
        </g>
      </Stage>
      <Text x={PANEL} y={190} w={800} size={40} weight={800} color={C.muted}>
        rolls with middle 3
      </Text>
      <Row x={PANEL} y={TALLY_Y[0]} label="one 3" tex="6 \times 2 \times 3 = 36" color={C.primary} style={fadeUp(f, at(scene, 2, 0.4))} />
      <Row x={PANEL} y={TALLY_Y[1]} label="two 3s" tex="3 \times 5 = 15" color={C.violet} style={fadeUp(f, at(scene, 3, 0.75))} />
      <Row x={PANEL} y={TALLY_Y[2]} label="three 3s" tex="1" color={C.blue} style={fadeUp(f, at(scene, 4, 0.6))} />
      <Line x={PANEL} y={560} w={760} style={fadeUp(f, at(scene, 5))} />
      <Row x={PANEL} y={585} label="Total" tex="36 + 15 + 1 = 52" strong style={fadeUp(f, at(scene, 5, 0.3))} />
      <Eq x={140} y={300} tex="\frac{52}{216} = \frac{52 \div 4}{216 \div 4}" size={76} start={at(scene, 6, 0.2)} />
      <Eq x={140} y={500} tex="= \frac{13}{54}" size={80} color={C.green} start={at(scene, 7, 0.1)} />
      <FracBadge x={600} y={600} tex="\frac{13}{54}" start={at(scene, 7, 0.97)} />
      <Confetti x={600} y={600} start={at(scene, 7, 0.97)} seed={11} />
    </>
  );
};

// ----- Recap -----

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 560, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 150, width: 880, fontSize: 62, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Split the rolls by how many dice show the middle value.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 400, width: 880, fontSize: 52, fontWeight: 900, color: C.violet, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Then count the orders. Colored dice help!
        </div>
      </div>
      <Stage>
        <g opacity={cardOut}>
          {[[1, 2, 5], [2, 2, 5], [2, 2, 2]].map((r, k) =>
            r.map((v, i) => (
              <Die key={`${k}-${i}`} x={1270 + i * 120} y={330 + k * 140} v={v} size={100} color={DICE[i]} opacity={ease(f, at(scene, 1, 0.4) + k * 8, 10)} />
            )),
          )}
          {range(3).map((k) => (
            <Ring key={k} x={1390} y={330 + k * 140} size={100} opacity={ease(f, at(scene, 2, 0.2), 10)} />
          ))}
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} text="Keep rolling!" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(
    <>
      Three dice are rolled and put in order. What is the probability that <span style={{ color: C.primary }}>the middle one is 2</span>?
    </>,
    10,
  ),
  case1: Case1,
  case2: Case2,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause(
    <>
      Same three dice. What is the probability that <span style={{ color: C.violet }}>the middle one is 3</span>?
    </>,
    10,
  ),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

// YouTube thumbnail (`2026-10-30-middle-die-thumb`, render.sh → poster.jpg): three dice, the middle one is the 2, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Think it's", <span style={{ color: C.red }}>1 in 6?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      <Die x={120} y={300} v={0} size={170} color={DICE[0]} />
      <Die x={340} y={300} v={2} size={170} color={DICE[1]} />
      <Die x={560} y={300} v={0} size={170} color={DICE[2]} />
      <Ring x={340} y={300} size={170} opacity={1} />
      <Label x={340} y={470} text="middle" color={C.amber} size={64} />
    </svg>
  </ThumbFrame>
);

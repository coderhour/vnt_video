import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG, TICK } from '../Composition';

export { SLUG };

const PAIRS: [number, number][] = [[8, 9], [9, 8], [24, 9], [36, 8], [18, 8], [72, 1]];

const Chip: React.FC<{ a: number; b: number; s: number; color?: string }> = ({ a, b, s, color = C.primary }) => (
  <div style={{ transform: `scale(${s})`, background: C.card, border: `5px solid ${color}`, borderRadius: 24, padding: '8px 26px', fontSize: 60, fontWeight: 900, color, boxShadow: '0 6px 18px rgba(30,40,80,0.08)', whiteSpace: 'nowrap' }}>
    ({a}, {b})
  </div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0, 0.55);
  const per = 8;
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        Pairs with <span style={{ color: C.violet }}>LCM = 72</span>
      </Text>
      <div style={{ position: 'absolute', left: 90, top: 470, width: 740, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, justifyItems: 'center' }}>
        {PAIRS.map(([a, b], i) => (
          <Chip key={i} a={a} b={b} s={pop(f, t0 + i * per)} color={i % 2 === 0 ? C.primary : C.violet} />
        ))}
      </div>
      <Text x={540} y={1030} w={900} size={70} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        How many in all?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many <b style={{ color: C.primary }}>ordered pairs</b> of positive whole numbers have <b style={{ color: C.violet }}>least common multiple 72</b>?
      </div>
      <div style={{ position: 'absolute', left: 60, top: 660, width: 860, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, opacity: mark }}>
        <Chip a={8} b={9} s={1} />
        <span style={{ fontSize: 60, fontWeight: 900, color: C.red }}>≠</span>
        <Chip a={9} b={8} s={1} color={C.violet} />
      </div>
      <Text x={540} y={800} w={900} size={48} weight={800} color={C.muted} align="center" style={{ opacity: mark }}>
        order matters
      </Text>
      <div style={{ position: 'absolute', left: 60, top: 980, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 54, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} mark={ease(f, at(scene, 1, 0.55), 10)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} mark={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

// Two grids: how many twos (a across, b down) and how many threes. A cell is good when a or b has the full power.
const CELL = 92;
const GY = 610;
const G2X = 120; // 4 × 4
const G3X = 590; // 3 × 3

const Grid: React.FC<{ x0: number; n: number; color: string; start: number; end: number; shown: number }> = ({ x0, n, color, start, end, shown }) => {
  const f = useCurrentFrame();
  const cells: { i: number; j: number; good: boolean }[] = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) cells.push({ i, j, good: i === n - 1 || j === n - 1 });
  const goods = cells.filter((c) => c.good);
  const span = Math.max(1, end - start);
  return (
    <g opacity={shown}>
      {cells.map(({ i, j, good }) => {
        const k = goods.findIndex((g) => g.i === i && g.j === j);
        const on = good && f >= start + (span * k) / goods.length;
        return <rect key={`${i}-${j}`} x={x0 + i * CELL + 3} y={GY + j * CELL + 3} width={CELL - 6} height={CELL - 6} rx={14} fill={on ? color : '#e9ecf4'} opacity={on ? 0.95 : 1} />;
      })}
      {Array.from({ length: n }, (_, i) => (
        <g key={i} fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={44} fill={C.muted} textAnchor="middle">
          <text x={x0 + i * CELL + CELL / 2} y={GY - 16}>{i}</text>
          <text x={x0 - 22} y={GY + i * CELL + CELL / 2 + 15}>{i}</text>
        </g>
      ))}
    </g>
  );
};

const count = (f: number, start: number, end: number, total: number) => (f < start ? 0 : Math.min(total, Math.floor(((f - start) / Math.max(1, end - start)) * total) + 1));

const Grids: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s2 = at(scene, 1, 0.45);
  const e2 = at(scene, 1, 0.95);
  const s3 = at(scene, 2, 0.4);
  const e3 = at(scene, 2, 0.9);
  const c2 = count(f, s2, e2, 7);
  const c3 = count(f, s3, e3, 5);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} align="center" style={fadeUp(f, 0)}>
        <span style={{ color: C.primary }}>72 = 2³</span> × <span style={{ color: C.violet }}>3²</span>
      </Text>
      <Stage>
        <Grid x0={G2X} n={4} color={C.primary} start={s2} end={e2} shown={ease(f, at(scene, 1, 0.05), 12)} />
        <Grid x0={G3X} n={3} color={C.violet} start={s3} end={e3} shown={ease(f, at(scene, 2, 0.0), 12)} />
      </Stage>
      <Text x={G2X} y={485} w={4 * CELL} size={50} weight={900} color={C.primary} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.05)), left: G2X }}>
        twos
      </Text>
      <Text x={G3X} y={485} w={3 * CELL} size={50} weight={900} color={C.violet} align="center" style={{ ...fadeUp(f, at(scene, 2, 0.0)), left: G3X }}>
        threes
      </Text>
      <Text x={G2X} y={1000} w={4 * CELL} size={90} weight={900} color={C.primary} align="center" style={{ left: G2X, opacity: c2 > 0 ? 1 : 0 }}>
        {c2}
      </Text>
      <Text x={G3X} y={1000} w={3 * CELL} size={90} weight={900} color={C.violet} align="center" style={{ left: G3X, opacity: c3 > 0 ? 1 : 0 }}>
        {c3}
      </Text>
      <Text x={540} y={1130} w={900} size={46} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        a across, b down: one needs the full power
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  const g = ease(f, 0, 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 80, fontWeight: 900 }}>35 pairs</span>
        </div>
      </div>
      <Stage>
        <Grid x0={G2X} n={4} color={C.primary} start={-100} end={-99} shown={g} />
        <Grid x0={G3X} n={3} color={C.violet} start={-100} end={-99} shown={g} />
      </Stage>
      <Text x={G2X} y={1000} w={4 * CELL} size={90} weight={900} color={C.primary} align="center" style={{ left: G2X }}>7</Text>
      <Text x={G3X} y={1000} w={3 * CELL} size={90} weight={900} color={C.violet} align="center" style={{ left: G3X }}>5</Text>
      <Text x={470} y={1010} w={140} size={80} weight={900} color={C.ink} align="center" style={{ left: 470, opacity: ease(f, at(scene, 0, 0.1), 10) }}>×</Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:10" bullets={['Two ways to count', 'Every trap explained', 'A new number to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, grids: Grids, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

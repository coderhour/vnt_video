import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, DC, Page, Pages, SLUG, TICK, rowWidth } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ps = [1, 2, 3, '…', 98, 99];
  const W = rowWidth(ps);
  const k = 1.4;
  return (
    <>
      <Title>
        Count the <span style={{ color: C.amber }}>digits</span>!
      </Title>
      <Stage>
        <g transform={`translate(${540 - (W * k) / 2} 620) scale(${k})`}>
          <Pages ps={ps} x0={0} y={0} />
        </g>
      </Stage>
      <Text x={540} y={760} w={900} size={80} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        99 pages = 189 digits
      </Text>
      <Text x={540} y={900} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.5))}>
        not 2 × 99 = 198
      </Text>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={250} y1={935} x2={830} y2={935} stroke={C.red} strokeWidth={9} strokeLinecap="round" strokeDasharray={580} strokeDashoffset={580 * (1 - ease(f, at(scene, 1, 0.7), 12))} />
      </svg>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  const ps = [7, 42, 105];
  const W = rowWidth(ps);
  const k = 1.3;
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Pages are numbered from 1. The digits printed are exactly <b style={{ color: C.amber }}>twice</b> the pages. <b style={{ color: C.violet }}>How many pages?</b>
      </div>
      <Stage>
        <g transform={`translate(${540 - (W * k) / 2} 780) scale(${k})`}>
          <Pages ps={ps} x0={0} y={0} start={8} stagger={6} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 920, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 56, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 36 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.1)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const GRID_Y = [610, 725, 840];
const cell = (i: number, cx: number) => [cx + ((i % 3) - 1) * 130, GRID_Y[Math.floor(i / 3)]] as const;

const Balance: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lStart = at(scene, 1, 0.25);
  const rStart = at(scene, 2, 0.45);
  const total = ease(f, at(scene, 2, 0.88), 12);
  return (
    <>
      <Title>
        Each page owes <span style={{ color: C.violet }}>2</span> digits
      </Title>
      <Text x={290} y={460} w={400} size={54} weight={900} color={DC[1]} align="center" style={fadeUp(f, lStart)}>
        Pages 1–9
      </Text>
      <Text x={720} y={460} w={440} size={54} weight={900} color={DC[3]} align="center" style={fadeUp(f, rStart)}>
        3-digit pages
      </Text>
      <Stage>
        {Array.from({ length: 9 }, (_, i) => {
          const [x, y] = cell(i, 290);
          return <Page key={i} p={i + 1} x={x} y={y} s={pop(f, lStart + i * 3, fps)} />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const [x, y] = cell(i, 740);
          return <Page key={i} p="?" color={DC[3]} x={x} y={y} s={pop(f, rStart + i * 3, fps) * 0.95} />;
        })}
      </Stage>
      <Text x={290} y={930} w={400} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, lStart + 30)}>
        −1 each
      </Text>
      <Text x={720} y={930} w={400} size={64} weight={900} color={C.green} align="center" style={fadeUp(f, rStart + 30)}>
        +1 each
      </Text>
      <Text x={540} y={1055} w={900} size={46} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 2, 0.02))}>
        2-digit pages: exactly even
      </Text>
      <Text x={540} y={1135} w={900} size={78} weight={900} align="center" style={{ opacity: total, transform: `scale(${0.9 + 0.1 * total})` }}>
        <span style={{ color: C.red }}>−9</span> <span style={{ color: C.green }}>+ 9</span> = 0
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.36);
  const chime = at(scene, 1, 0.85);
  const ps = [100, 101, '…', 108];
  const W = rowWidth(ps);
  const k = 1.3;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 96, fontWeight: 900 }}>108</span>
          <span style={{ fontSize: 54, fontWeight: 900 }}>pages · C</span>
        </div>
      </div>
      <Text x={540} y={560} w={900} size={56} weight={900} color={DC[3]} align="center" style={fadeUp(f, 2)}>
        The extra pages
      </Text>
      <Stage>
        <g transform={`translate(${540 - (W * k) / 2} 760) scale(${k})`}>
          <Pages ps={ps} x0={0} y={0} start={4} stagger={8} />
        </g>
      </Stage>
      <Text x={540} y={900} w={900} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.2))}>
        216 digits = 2 × 108
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:10" bullets={['Counting digits in groups', 'The balance trick, step by step', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, balance: Balance, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

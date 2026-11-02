import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COUNTS, Coin, Coins, HOOK, RunBox, SLUG, TICK } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const gap = 112;
  const x0 = 540 - 3.5 * gap;
  const box = ease(f, at(scene, 0, 0.8), 12);
  return (
    <>
      <Title>
        <span style={{ color: C.red }}>Three</span> in a row?
      </Title>
      <Stage>
        <RunBox x={x0} y={700} r={50} gap={gap} i={1} j={3} color={C.red} opacity={box} />
        <Coins s={HOOK} x={x0} y={700} r={50} gap={gap} />
      </Stage>
      <Text x={540} y={880} w={900} size={80} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        3 times out of 4!
      </Text>
      <Text x={540} y={1020} w={900} size={46} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.6))}>
        8 flips, same side 3 in a row
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 52, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A fair coin is flipped <b style={{ color: C.amber }}>8 times</b>. What's the chance the same side <b style={{ color: C.red }}>never</b> comes up <b>3 times in a row</b>?
      </div>
      <Stage>
        <Coin x={400} y={760} side="H" r={70} s={ease(f, 6, 14)} />
        <Coin x={680} y={760} side="T" r={70} s={ease(f, 12, 14)} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 930, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={56} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const ROW = 88;
const TOP = 410;

const Table: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // row k (0-based, k flips = k+1): 0,1 on line 0; 2 on line 1; 3..7 on line 2.
  const starts = [at(scene, 0, 0.3), at(scene, 0, 0.7), at(scene, 1, 0.45), ...[0, 1, 2, 3, 4].map((i) => at(scene, 2, 0.02 + i * 0.17))];
  const cur = starts.reduce((n, s, k) => (f >= s ? k : n), 0);
  return (
    <>
      <Title>
        <span style={{ color: C.green }}>Good</span> strings
      </Title>
      {COUNTS.map((c, k) => {
        const o = ease(f, starts[k], 10);
        const isNow = k === cur && k >= 2;
        const last = k === 7;
        return (
          <div key={k} style={{ position: 'absolute', left: 120, top: TOP + k * ROW, width: 780, height: ROW - 10, display: 'flex', alignItems: 'center', opacity: o, transform: `translateY(${(1 - o) * 16}px)`, background: isNow ? 'rgba(33,196,93,0.14)' : 'transparent', borderRadius: 20 }}>
            <div style={{ width: 300, fontSize: 46, fontWeight: 800, color: C.muted, paddingLeft: 24 }}>
              {k + 1} flip{k ? 's' : ''}
            </div>
            <div style={{ width: 160, fontSize: 62, fontWeight: 900, color: last ? C.amber : C.ink, textAlign: 'right' }}>{c}</div>
            {k >= 2 && (
              <div style={{ marginLeft: 40, fontSize: 44, fontWeight: 800, color: C.green, opacity: isNow ? 1 : 0.55 }}>
                = {COUNTS[k - 1]} + {COUNTS[k - 2]}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.58);
  const chime = at(scene, 0, 1);
  const bars = ease(f, at(scene, 1, 0.1), 24);
  const W = 800;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{17}{64}'} size={96} color="#fff" />
          <span style={{ fontSize: 54, fontWeight: 900 }}>· D</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 640, textAlign: 'center', fontSize: 62, fontWeight: 900, ...fadeUp(f, at(scene, 0, 0.15)) }}>
        <span style={{ color: C.green }}>68</span> good out of 256
      </div>
      <div style={{ position: 'absolute', left: 90, top: 790, width: W, height: 90, borderRadius: 24, overflow: 'hidden', background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
        <div style={{ width: W * (68 / 256) * bars, height: 90, background: C.green }} />
        <div style={{ position: 'absolute', left: W * (68 / 256) * bars, top: 0, width: W * (188 / 256) * bars, height: 90, background: C.red, opacity: 0.85 }} />
      </div>
      <div style={{ position: 'absolute', left: 90, top: 900, width: W, display: 'flex', justifyContent: 'space-between', fontSize: 52, fontWeight: 900, ...fadeUp(f, at(scene, 1, 0.2)) }}>
        <span style={{ color: C.green }}>27% good</span>
        <span style={{ color: C.red }}>73% three in a row</span>
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:56" bullets={['The table, built step by step', 'A streak-blocks method', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, table: Table, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

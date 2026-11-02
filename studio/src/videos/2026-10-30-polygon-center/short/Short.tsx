import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, HIT, Half, MISS, NEXT6, Ngon, Outside, Ring, SLUG, Shape, TICK, gapsOf, rot } from '../Composition';

export { SLUG };

type G = Parameters<typeof Ngon>[0]['g'];
const MAIN: G = { cx: 540, cy: 860, R: 290, n: 13 };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Mid: React.FC<{ y: number; start: number; tex: string; size?: number; color?: string }> = ({ y, start, tex, size = 64, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const swap = at(scene, 1, 0.5);
  const hitOn = f < swap;
  return (
    <>
      <Title>
        Does it hold the <span style={{ color: C.primary }}>center</span>?
      </Title>
      <Stage>
        <Ngon g={MAIN} centre={hitOn ? C.green : C.red} />
        <Shape g={MAIN} set={HIT} color={C.green} opacity={fadeTo(f, swap, 0, 8)} />
        <Shape g={MAIN} set={MISS} color={C.red} progress={ease(f, swap + 4, 18)} />
      </Stage>
      <Text x={540} y={1215} w={900} size={64} weight={900} color={hitOn ? C.green : C.red} align="center">
        {hitOn ? '✓ hit' : '✗ miss'}
      </Text>
    </>
  );
};

const QG: G = { cx: 540, cy: 800, R: 190, n: 13 };

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Pick <b style={{ color: C.primary }}>4 of the 13 corners</b>. How many choices <b style={{ color: C.violet }}>contain the center</b>?
      </div>
      <Stage>
        <Ngon g={QG} centre={mark > 0.5 ? C.green : C.ink} />
        <Shape g={QG} set={HIT} color={C.primary} opacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1050, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} mark={ease(f, at(scene, 0, 0.5), 14)} />;
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

const Misses: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const half = at(scene, 1, 0.3);
  const six = at(scene, 2, 0.3);
  const l3 = at(scene, 3);
  const end = l3 + scene.lines[3].frames;
  // line 3: step through the 20 ways to pick three of the next six, then slide the first corner round all 13 places
  const c0 = l3 + 3;
  const ci = Math.max(0, Math.min(19, Math.floor((f - c0) / 4)));
  const r0 = c0 + 84;
  const rStep = Math.max(2, Math.floor((end - 20 - r0) / 13));
  const r = f < r0 ? 0 : Math.min(12, Math.floor((f - r0) / rStep));
  const cycling = f >= c0 && f < r0;
  const pick = f < c0 ? [2, 3, 5] : NEXT6[ci];
  const set = f < l3 ? MISS : rot([0, ...pick], r, 13);
  const first = f < l3 ? 0 : r;
  const g = gapsOf(set, 13);
  const bigIdx = g.findIndex((x) => x > 6);
  const bigFrom = [...set].sort((a, b) => a - b)[bigIdx];
  const sixOn = ease(f, six, 8) * fadeTo(f, l3 + 4, 0.0, 8);
  return (
    <>
      <Stage>
        <Half g={MAIN} a={first} opacity={ease(f, half, 14)} />
        <Ngon g={MAIN} centre={C.red} />
        <Arc g={MAIN} a={bigFrom} steps={g[bigIdx]} color={C.red} opacity={ease(f, at(scene, 0, 0.5), 12)} />
        {range(6).map((i) => (
          <Ring key={i} g={MAIN} k={first + i + 1} color={C.violet} opacity={f < l3 ? ease(f, six + i * 4, 8) : 1} />
        ))}
        <Shape g={MAIN} set={set} color={C.red} />
        <Outside g={MAIN} k={first} text="first" color={C.violet} opacity={ease(f, six - 6, 8)} d={56} />
        {range(6).map((i) => (
          <Outside key={`n${i}`} g={MAIN} k={first + i + 1} text={`${i + 1}`} color={C.violet} opacity={sixOn} d={56} size={44} />
        ))}
      </Stage>
      <Text x={540} y={420} w={980} size={66} weight={900} align="center" style={fadeUp(f, at(scene, 0, 0.2))}>
        {f < half - 4 ? (
          <>
            Count the <span style={{ color: C.red }}>misses</span>
          </>
        ) : f < l3 ? (
          <span style={{ color: C.violet }}>Miss = all 4 in one half</span>
        ) : cycling ? (
          <>
            way <span style={{ color: C.violet }}>{ci + 1}</span> of 20
          </>
        ) : r < 12 || f < end - 24 ? (
          <>
            first corner <span style={{ color: C.violet }}>{r + 1}</span> of 13
          </>
        ) : null}
      </Text>
      {f >= end - 24 && <Mid y={420} start={end - 24} tex="13 \times 20 = 260 \text{ misses}" size={64} color={C.red} />}
    </>
  );
};

const RG: G = { cx: 540, cy: 830, R: 250, n: 13 };

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.7);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="715 - 260 = 455" size={72} color="#fff" />
        </div>
      </div>
      <Stage>
        <Ngon g={RG} centre={C.green} />
        <Shape g={RG} set={HIT} color={C.green} />
      </Stage>
      <Text x={540} y={1110} w={900} size={64} weight={900} color={C.green} align="center" style={fadeUp(f, hit)}>
        Choice C
      </Text>
      <Text x={540} y={1210} w={900} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Hits hard to count? Count the misses.
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:48" bullets={['Two ways to count the misses', 'Every wrong choice explained', 'An 11-sided one to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, misses: Misses, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

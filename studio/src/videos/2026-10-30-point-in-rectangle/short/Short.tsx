import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ABOUT, CHIME, CHOICES, Figure, MAIN, SLUG, TICK, plane } from '../Composition';

export { SLUG };

// The figure: 10 x 8 rectangle at 70 px/unit = 700 x 560 px, top edge at y = 470, left edge at x = 170.
const M = plane(170, 1030, 70);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        Find the <span style={{ color: C.amber }}>missing</span> area
      </Title>
      <Stage>
        <Figure m={M} w={MAIN.w} h={MAIN.h} p={MAIN.p} fills={{ left: 0.25 }} colors={{ left: C.amber }} labels={ABOUT} labelColors={{ left: C.amber }} size={64} />
      </Stage>
      <Text x={540} y={1120} w={900} size={56} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.45))}>
        No idea where P is!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  const m = plane(290, 990, 50);
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Point <b>P</b> is inside a rectangle. Triangle areas: <b style={{ color: C.violet }}>bottom 15</b>, <b style={{ color: C.blue }}>right 22</b>, <b style={{ color: C.violet }}>top 25</b>. <b style={{ color: C.amber }}>Area of the left one?</b>
      </div>
      <Stage>
        <Figure m={m} w={MAIN.w} h={MAIN.h} p={MAIN.p} fills={{ left: 0.25 }} colors={{ left: C.amber }} labels={ABOUT} labelColors={{ left: C.amber }} size={46} letters={0} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1070, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 58, fontWeight: 800 }}>
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

const Pairs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vio = ease(f, at(scene, 0, 0.55), 14);
  const blu = ease(f, at(scene, 2, 0.35), 14);
  const half = ease(f, at(scene, 1, 0.3), 12);
  const eq1 = at(scene, 2, 0.02);
  const eq2 = at(scene, 2, 0.5);
  return (
    <>
      <Title>
        {f < at(scene, 2, 0) ? (
          <>
            <span style={{ color: C.violet }}>Bottom</span> + <span style={{ color: C.violet }}>top</span> = <span style={{ color: C.green }}>half</span>
          </>
        ) : (
          <>
            <span style={{ color: C.blue }}>Left</span> + <span style={{ color: C.blue }}>right</span> = <span style={{ color: C.green }}>half</span>
          </>
        )}
      </Title>
      <Stage>
        <Figure
          m={M}
          w={MAIN.w}
          h={MAIN.h}
          p={MAIN.p}
          fills={{ bottom: 0.35 * vio, top: 0.35 * vio, right: 0.35 * blu, left: 0.35 * blu }}
          colors={{ left: C.amber }}
          labels={ABOUT}
          labelColors={{ left: C.amber }}
          size={64}
        />
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1090, textAlign: 'center', fontSize: 66, fontWeight: 900, opacity: ease(f, eq1, 10) }}>
        <span style={{ color: C.violet }}>15 + 25 = 40</span>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1180, textAlign: 'center', fontSize: 66, fontWeight: 900, opacity: ease(f, eq2, 10) }}>
        <span style={{ color: C.blue }}>22 + </span>
        <span style={{ color: C.amber }}>?</span>
        <span style={{ color: C.blue }}> = 40</span>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1090, textAlign: 'center', fontSize: 52, fontWeight: 900, color: C.green, opacity: half * (1 - ease(f, eq1, 10)) }}>
        the heights stack to the full height
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.5);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Left =</span>
          <span style={{ fontSize: 100, fontWeight: 900 }}>18</span>
          <span style={{ fontSize: 54, fontWeight: 900 }}>· C</span>
        </div>
      </div>
      <Stage>
        <Figure
          m={M}
          w={MAIN.w}
          h={MAIN.h}
          p={MAIN.p}
          fills={{ bottom: 0.3, top: 0.3, right: 0.3, left: 0.3 * ease(f, hit, 10) }}
          colors={{ left: C.green }}
          labels={{ bottom: '15', right: '22', top: '25', left: f >= hit ? '18' : '?' }}
          labelColors={{ left: f >= hit ? C.green : C.amber }}
          size={64}
        />
      </Stage>
      <Text x={540} y={1120} w={900} size={52} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        P can be anywhere!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:14" bullets={['Why opposite pairs make half', 'A second way: just cut it', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pairs: Pairs, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

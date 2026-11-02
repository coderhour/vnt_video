import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, Clock, SLUG, TICK, hourAt, minAt, smaller, tw } from '../Composition';

export { SLUG };

const CX = 540;
const CY = 810;
const R = 260;
const CHOICES = ['12', '15', '29', '30', '60'];

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

/** The clock at 1:mm with the smaller angle shaded; whole angles green, halves red. */
const ClockAt: React.FC<{ hour: number; min: number; show?: number; cx?: number; cy?: number; r?: number }> = ({ hour, min, show = 1, cx = CX, cy = CY, r = R }) => {
  const w = smaller(hour, min);
  const deg = Math.round(w.sweep * 10) / 10;
  const whole = Math.abs(deg - Math.round(deg)) < 0.01;
  const color = whole ? C.green : C.red;
  return <Clock cx={cx} cy={cy} R={r} hour={hour} min={min} wedge={{ ...w, color, op: show }} label={{ text: `${deg}°`, color, at: w.from + w.sweep / 2, op: show }} />;
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const step = at(scene, 1, 0.1);
  const min = tw(f, 0, [[step, 6]], 10);
  const hour = tw(f, 30, [[step, 30.5]], 10);
  return (
    <>
      <Title>
        When is the angle <span style={{ color: C.green }}>whole</span>?
      </Title>
      <Stage>
        <ClockAt hour={hour} min={min} />
      </Stage>
      <Text x={540} y={1160} w={900} size={80} weight={900} color={C.red} align="center" style={{ opacity: ease(f, step + 12, 10) }}>
        not whole!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Times <b style={{ color: C.primary }}>1:00, 1:01, …, 1:59</b>. How many have a <b style={{ color: C.violet }}>smaller angle</b> that is a <b>whole number</b> of degrees?
      </div>
      <Stage>
        <Clock cx={CX} cy={800} R={200} hour={30} min={0} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1085, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 50, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
            {c}
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

const VALS = ['30°', '24.5°', '19°', '13.5°', '8°', '2.5°'];

const Hands: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s0 = at(scene, 0, 0.35);
  const s2 = [at(scene, 2, 0.05), at(scene, 2, 0.95)] as const;
  const per = (s2[1] - s2[0]) / 6;
  const m = f < s2[0] ? 0 : Math.min(5, Math.floor((f - s2[0]) / per));
  const step = f >= at(scene, 2) ? m : 0;
  // L0: the minute hand turns 6 degrees; L1: the hour hand drifts half a degree; L2+: whole minutes in turn.
  const phase = f < at(scene, 1) ? 0 : f < at(scene, 2) ? 1 : 2;
  const min = phase === 0 ? tw(f, 0, [[s0, 6]], 14) : phase === 1 ? 0 : minAt(step);
  const hour = phase === 2 ? hourAt(1, step) : phase === 1 ? 30 + 0.5 * ease(f, at(scene, 1, 0.3), 30) : 30;
  const title = phase === 0 ? <>Minute hand: <span style={{ color: C.primary }}>+6°</span> a minute</> : phase === 1 ? <>Hour hand: <span style={{ color: C.violet }}>+½°</span> a minute</> : f < at(scene, 3) ? <>Whole, half, whole, half…</> : <>Whole − half = <span style={{ color: C.red }}>half</span></>;
  return (
    <>
      <Title>{title}</Title>
      <Stage>
        {phase === 2 ? <ClockAt hour={hour} min={min} /> : <Clock cx={CX} cy={CY} R={R} hour={hour} min={min} />}
      </Stage>
      <div style={{ position: 'absolute', left: 90, top: 1130, display: 'flex', gap: 14 }}>
        {VALS.map((v, i) => {
          const on = phase === 2 ? ease(f, s2[0] + i * per, 8) : 0;
          const ok = i % 2 === 0;
          return (
            <div key={i} style={{ opacity: on, width: 130, textAlign: 'center', background: ok ? 'rgba(33,196,93,0.2)' : 'rgba(239,67,67,0.16)', border: `3px solid ${ok ? C.green : C.red}`, color: ok ? C.green : C.red, borderRadius: 16, padding: '8px 0', fontSize: 40, fontWeight: 900 }}>
              {v}
            </div>
          );
        })}
      </div>
      <Text x={540} y={1235} w={900} size={52} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 3, 0.55))}>
        Whole every other minute
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  const one = at(scene, 1, 0.1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', fontSize: 78, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          60 ÷ 2 = 30
        </div>
      </div>
      <Stage>
        <ClockAt hour={30} min={0} show={ease(f, one, 10)} cy={800} r={240} />
      </Stage>
      <Text x={540} y={1130} w={900} size={60} weight={900} color={C.green} align="center" style={fadeUp(f, one)}>
        1:00 is whole: 30°
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={400} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:50" bullets={['A formula and a quick trick', 'Every trap explained', 'A new clock challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, hands: Hands, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

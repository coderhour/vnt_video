import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ANN, BO, Brace, CHIME, CHOICES, D, Leg, Meet, RoadLine, SLUG, TICK, VA, VB, Walker, X, bounce, legs, type Road } from '../Composition';

export { SLUG };

const walkT = (f: number, f0: number, f1: number, a: number, b: number) => interpolate(f, [f0, Math.max(f0 + 1, f1)], [a, b], clamp);

const road = (y: number): Road => ({ x0: 140, x1: 820, y, d: D });

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r = road(700);
  const t = walkT(f, 8, at(scene, 1, 0.1), 0, 3);
  const three = at(scene, 1, 0.1);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        They meet <span style={{ color: C.primary }}>twice</span>. How far apart?
      </Text>
      <Stage>
        <RoadLine r={r} />
        <Meet r={r} km={12} n="1st" opacity={f > 8 + (three - 8) / 3 && t < 2.6 ? 1 : 0} />
        <Meet r={r} km={10} n="2nd" opacity={t >= 3 ? 1 : 0} />
        <Walker r={r} km={bounce(0, VA, D, t)} who="Ann" />
        <Walker r={r} km={bounce(D, VB, D, t)} who="Bo" />
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 900, display: 'flex', justifyContent: 'center', ...fadeUp(f, three), transform: `scale(${0.6 + 0.4 * ease(f, three, 12)})` }}>
        <Tex tex="\times\,3" size={170} color={C.primary} />
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  const r = road(800);
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 46, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <span style={{ color: ANN }}>Ann</span> and <span style={{ color: BO }}>Bo</span> meet <b style={{ color: C.primary }}>12 km</b> from A, turn around at the far end, and meet again <b style={{ color: C.blue }}>10 km</b> from A. <b>How far apart are A and B?</b>
      </div>
      <Stage>
        <RoadLine r={r} />
        <Brace r={r} a={0} b={12} y={r.y + 62} up color={C.primary} label="12 km" size={46} opacity={mark} />
        <circle cx={X(r, 12)} cy={r.y} r={16} fill={C.primary} opacity={mark} />
        <Brace r={r} a={0} b={10} y={r.y + 170} up color={C.blue} label="10 km" size={46} opacity={mark} />
        <circle cx={X(r, 10)} cy={r.y} r={16} fill={C.blue} opacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1110, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
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
  return <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} mark={ease(f, at(scene, 0, 0.5), 10)} />;
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

const Three: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r = road(640);
  // t = 1 at the first meeting (end of L0 start), t = 3 at the second
  const t = f < at(scene, 1) ? walkT(f, at(scene, 0, 0.45), at(scene, 0, 0.95), 0, 1) : walkT(f, at(scene, 1, 0.05), at(scene, 2, 0.45), 1, 3);
  const one = ease(f, at(scene, 0, 0.9), 10) * (1 - ease(f, at(scene, 1, 0.05), 8));
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} color={C.primary} align="center" style={fadeUp(f, 0)}>
        Together: how many roads?
      </Text>
      <Stage>
        <RoadLine r={r} />
        {legs(0, VA, D, t).map(([a, b], i) => <Leg key={`a${i}`} r={r} a={a} b={b} y={r.y - (i === 0 ? 46 : 80)} color={ANN} />)}
        {legs(D, VB, D, t).map(([a, b], i) => <Leg key={`b${i}`} r={r} a={a} b={b} y={r.y + (i === 0 ? 46 : 80)} color={BO} />)}
        <Meet r={r} km={12} n="1st" opacity={ease(f, at(scene, 0, 0.9), 8) * (t < 2.6 ? 1 : 0)} />
        <Meet r={r} km={10} n="2nd" opacity={t >= 3 ? 1 : 0} />
        <Walker r={r} km={bounce(0, VA, D, t)} who="Ann" tag={false} />
        <Walker r={r} km={bounce(D, VB, D, t)} who="Bo" tag={false} />
      </Stage>
      <div style={{ opacity: one }}>
        <Text x={540} y={810} w={980} size={62} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 0, 0.9))}>
          1 road: Ann walks 12
        </Text>
      </div>
      <Text x={540} y={810} w={1000} size={58} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 1, 0.5))}>
        3 roads: Ann walks <span style={{ color: ANN }}>3 × 12 = 36</span>
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 960, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.35)), opacity: ease(f, at(scene, 2, 0.35), 12) }}>
        <Tex tex="\text{road} + (\text{road} - 10) = 36" size={64} color={ANN} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r = road(640);
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Road =</span>
          <span style={{ fontSize: 90, fontWeight: 900 }}>23 km</span>
        </div>
      </div>
      <Stage>
        <RoadLine r={r} />
        <Leg r={r} a={0} b={D} y={r.y - 46} color={ANN} />
        <Leg r={r} a={D} b={10} y={r.y - 80} color={ANN} />
        <Meet r={r} km={10} n="2nd" opacity={1} />
        <Brace r={r} a={0} b={D} y={r.y + 70} up color={C.red} label="23 km" size={50} opacity={ease(f, at(scene, 0, 0.7), 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 900, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <Tex tex="2d - 10 = 36 \;\Rightarrow\; d = 23" size={64} color={ANN} />
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:23" bullets={['Two ways to solve it', 'Every wrong choice explained', 'A new road to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, three: Three, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

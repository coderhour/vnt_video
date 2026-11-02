import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Ant, CHIME, CHOICES, Cube, P, PulseRing, Route, SLUG, TICK, antAt, type Mv } from '../Composition';

export { SLUG };

/** Place the cube (drawn at 1920×1080 coordinates) so its top-left corner lands at (X, Y), scaled by k. */
const At: React.FC<{ k: number; X: number; Y: number; children: React.ReactNode }> = ({ k, X, Y, children }) => (
  <g transform={`translate(${X - 260 * k} ${Y - 270 * k}) scale(${k})`}>{children}</g>
);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const moves: Mv[] = [
    { t: 20, to: 'B', d: 18 },
    { t: 52, to: 'A', d: 18 },
    { t: 84, to: 'D', d: 18 },
  ];
  const ant = antAt(f, 'A', moves);
  const far = at(scene, 1);
  return (
    <>
      <Title>
        An <span style={{ color: C.violet }}>ant</span> on a cube
      </Title>
      <Stage>
        <At k={1.5} X={180} Y={450}>
          <Cube labels={() => 0} flag={ease(f, far, 14)} q={ease(f, far + 4, 14)} />
          <Ant p={ant} />
          <PulseRing at={P.G} f={f} start={far + 6} color={C.amber} />
          <PulseRing at={P.G} f={f} start={far + 28} color={C.amber} />
        </At>
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1200, display: 'flex', justifyContent: 'center', gap: 40 }}>
        {[0, 1, 2].map((i) => {
          const on = ease(f, moves[i].t + 10, 8) > 0.5;
          return (
            <div key={i} style={{ width: 90, height: 90, borderRadius: '50%', background: on ? C.primary : C.card, color: on ? '#fff' : C.muted, border: `4px solid ${on ? C.primary : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900 }}>
              {i + 1}
            </div>
          );
        })}
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; tag: number }> = ({ start, tag }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        An ant starts at <b>corner A</b> and walks a <b style={{ color: C.primary }}>random edge</b> each minute. <b style={{ color: C.amber }}>Chance it is at G after 3 minutes?</b>
      </div>
      <Stage>
        <At k={0.85} X={250} Y={600}>
          <Cube labels={(k) => (k === 'A' || k === 'G' ? ease(f, 10, 10) : 0)} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={ease(f, tag, 12)} />
          <Ant p={P.A} />
        </At>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} tag={at(scene, 1, 0.2)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} tag={0} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const FR = ['3/3', '2/3', '1/3'];

const Steps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const go = [at(scene, 1, 0.75), at(scene, 2, 0.75), at(scene, 3, 0.75)];
  const moves: Mv[] = [{ t: go[0], to: 'B' }, { t: go[1], to: 'C' }, { t: go[2], to: 'G' }];
  const ant = antAt(f, 'A', moves);
  const on = (i: number) => ease(f, at(scene, i + 1, 0.05), 10);
  const out = (i: number) => 1 - ease(f, go[i], 10);
  const GOOD = C.green;
  const BAD = C.red;
  const edges = {
    AB: { c: GOOD, o: on(0) * out(0) }, AD: { c: GOOD, o: on(0) * out(0) }, AE: { c: GOOD, o: on(0) * out(0) },
    BA: { c: BAD, o: on(1) * out(1) }, BC: { c: GOOD, o: on(1) * out(1) }, BF: { c: GOOD, o: on(1) * out(1) },
    CB: { c: BAD, o: on(2) * out(2) }, CD: { c: BAD, o: on(2) * out(2) }, CG: { c: GOOD, o: on(2) * out(2) },
  };
  const step = f < at(scene, 1) ? 0 : f < at(scene, 2) ? 1 : f < at(scene, 3) ? 2 : 3;
  return (
    <>
      <Title>{step === 0 ? <>Always go <span style={{ color: C.green }}>farther</span></> : <>Step <span style={{ color: C.primary }}>{step}</span></>}</Title>
      <Stage>
        <At k={1.5} X={180} Y={450}>
          <Cube labels={(k) => (k === 'A' || k === 'G' ? 1 : 0)} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} edges={edges} />
          <Route path="ABCG" p={ease(f, at(scene, 0, 0.45), 40) * (1 - ease(f, at(scene, 1, 0.1), 8))} color={C.violet} opacity={0.5} width={12} />
          <Ant p={ant} />
        </At>
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
        {FR.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, opacity: on(i), transform: `scale(${0.9 + 0.1 * on(i)})` }}>
            {i > 0 && <span style={{ fontSize: 64, fontWeight: 900, color: C.muted }}>×</span>}
            <div style={{ background: C.card, borderRadius: 24, padding: '4px 30px', boxShadow: '0 6px 20px rgba(30,40,80,0.1)' }}>
              <span style={{ fontSize: 76, fontWeight: 900, color: C.green }}>{t}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 60px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Chance =</span>
          <span style={{ fontSize: 110, fontWeight: 900 }}>2/9</span>
        </div>
      </div>
      <Stage>
        <At k={1.2} X={230} Y={600}>
          <Cube labels={(k) => (k === 'A' || k === 'G' ? 1 : 0)} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
          <Route path="ABCG" p={1} color={C.green} />
          <Ant p={P.G} />
        </At>
      </Stage>
      <Text x={540} y={1170} w={900} size={62} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Less than <span style={{ color: C.red }}>1/3</span>!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={400} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:27" bullets={['Two ways: steps and counting walks', 'Every trap explained', 'A sleepy-ant challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, steps: Steps, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { range, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Base, CHIME, Chords, DEG, LapPie, SLUG, TICK, TIP, TURN, TipArc, TurnArc, Walker, arcOp, cT, cU, lapOf, linear, mkG, vert } from '../Composition';

export { SLUG };

const G = mkG(540, 800, 240);
const GQ = mkG(540, 840, 210);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Eq: React.FC<{ y: number; start: number; end?: number; tex: string; size?: number }> = ({ y, start, end = 1e6, tex, size = 60 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start), opacity: ease(f, start, 10) * (1 - ease(f, end, 10)) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const p = linear(f, 4, at(scene, 0, 0.8), 0, 7);
  const tips = ease(f, at(scene, 0, 0.85), 14);
  return (
    <>
      <Title>
        Add up the <span style={{ color: TIP }}>7 tips</span>
      </Title>
      <Stage>
        <Base g={G} letters={1} />
        <Chords g={G} p={p} width={8} />
        {range(7).map((v) => <TipArc key={v} g={G} v={v} r={46} op={tips * ease(f, at(scene, 0, 0.85) + v * 3, 8)} />)}
        <Walker g={G} p={0} op={ease(f, at(scene, 1, 0.1), 10)} />
      </Stage>
      <Text x={540} y={1140} w={900} size={60} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        No protractor needed!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>7 points</b> on a circle, each joined to the <b>second point after it</b>. <b style={{ color: TIP }}>Sum of the 7 tip angles?</b>
      </div>
      <Stage>
        <Base g={GQ} letters={1} size={48} off={56} />
        <Chords g={GQ} p={7} width={7} />
        {range(7).map((v) => <TipArc key={v} g={GQ} v={v} r={42} />)}
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1160, width: 860, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {['180', '360', '540', '720', '900'].map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 30, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={50} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Pencil: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G;
  const p = f < at(scene, 1, 0.02) ? linear(f, at(scene, 0, 0.1), at(scene, 0, 0.55), 0, 1.15) : linear(f, at(scene, 1, 0.04), at(scene, 1, 0.88), 1.15, 7);
  const fin = linear(f, at(scene, 1, 0.9), at(scene, 1, 0.99), 0, 1);
  const labelOn = f < at(scene, 1, 0.02) ? ease(f, at(scene, 0, 0.6), 10) : 0;
  const lapOp = ease(f, at(scene, 1, 0.02), 10);
  const lap = lapOf(p, g);
  return (
    <>
      <Title>
        Take a <span style={{ color: C.amber }}>pencil</span> walk
      </Title>
      <Stage>
        <Base g={g} letters={1} />
        <Chords g={g} p={7} color={C.muted} width={5} op={0.4} dash />
        <Chords g={g} p={p} color={C.ink} width={8} />
        <LapPie g={g} p={p} op={lapOp} r={40} />
        {range(7).map((m0) => {
          const m = m0 + 1;
          const v = vert(g, m);
          const o = m === 7 ? fin : arcOp(p, m);
          if (m === 1) {
            return (
              <g key={m}>
                <TurnArc g={g} v={v} r={56} op={o} label={labelOn > 0 ? 'turn' : undefined} size={52} />
                <TipArc g={g} v={v} r={56} op={o * ease(f, at(scene, 0, 0.6), 10)} label={labelOn > 0 ? 'tip' : undefined} labelR={118} size={52} />
              </g>
            );
          }
          return (
            <g key={m}>
              <TurnArc g={g} v={v} r={m === 7 ? 56 : 38} op={m === 7 ? o : o * 0.9} ext={m === 7} />
              <TipArc g={g} v={v} r={m === 7 ? 56 : 44} op={m === 7 ? o : o * 0.9} />
            </g>
          );
        })}
        <Walker g={g} p={p} op={ease(f, 4, 12)} fin={fin} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 420, opacity: lapOp, background: C.card, borderRadius: 999, padding: '6px 32px', fontSize: 58, fontWeight: 900, color: TURN, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', border: `4px solid ${TURN}` }}>
        lap {lap}
      </div>
      <Eq y={1150} start={at(scene, 0, 0.55)} end={at(scene, 2, 0.05)} tex={`${cT('\\text{tip}')} + ${cU('\\text{turn}')} = 180${DEG}`} size={62} />
      <Eq y={1150} start={at(scene, 2, 0.15)} tex={`2\\times 360${DEG} = 720${DEG}\\;\\text{of turning}`} size={54} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.65);
  const chime = at(scene, 1, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 36px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>
          <Tex tex={`1260 - 720 = 540${DEG}`} size={72} color="#fff" />
        </div>
      </div>
      <Stage>
        <Base g={G} letters={1} />
        <Chords g={G} p={7} width={8} />
        {range(7).map((v) => <TipArc key={v} g={G} v={v} r={46} op={ease(f, at(scene, 0, 0.1) + v * 4, 8)} />)}
      </Stage>
      <Eq y={1150} start={at(scene, 0, 0.5)} end={at(scene, 2, 0.05)} tex={`7\\times 180${DEG} = 1260${DEG}`} size={60} />
      <Text x={540} y={1150} w={900} size={52} weight={900} color={C.ink} align="center" style={fadeUp(f, at(scene, 2, 0.15))}>
        Not 180°: that's the <span style={{ color: C.red }}>5-point</span> star
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:39" bullets={['Two ways to solve it', 'Every wrong answer explained', 'A pointier star to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pencil: Pencil, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

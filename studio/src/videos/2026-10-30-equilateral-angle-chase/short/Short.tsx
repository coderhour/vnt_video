import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ANSWER, CHIME, DERIVED, Fig, G1, GIVEN, SLUG, TICK, angADC, angADE, angBAD, angDAE, angX, tri } from '../Composition';

export { SLUG };

/** Place the landscape figure (bank coords scaled in Composition.tsx) in the vertical stage. */
const Framed: React.FC<{ k: number; top: number; children: React.ReactNode }> = ({ k, top, children }) => (
  <g transform={`translate(${540 - 455 * k} ${top - 180 * k}) scale(${k})`}>{children}</g>
);

const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 72 }) => (
  <Text x={540} y={300} w={980} size={size} weight={900} align="center">
    {children}
  </Text>
);

const g = G1;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pulse = 0.55 + 0.45 * Math.sin((f / 30) * Math.PI * 2);
  const l1 = at(scene, 1);
  return (
    <>
      <Title>
        Find the tiny <span style={{ color: ANSWER }}>angle x</span>!
      </Title>
      <Stage>
        <Framed k={1.15} top={470}>
          <Fig g={g} ticks={1} angs={[angBAD(g, { color: GIVEN, op: 1, label: '20°' }), angX(g, { color: ANSWER, op: 0.5 + 0.5 * pulse, label: 'x°' })]} />
        </Framed>
      </Stage>
      <Text x={540} y={1240} w={900} size={58} weight={900} color={C.muted} align="center" style={fadeUp(f, l1)}>
        Only <span style={{ color: GIVEN }}>one angle</span> is given
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  const vals = ['10', '15', '20', '30', '40'];
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 46, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>Equilateral</b> triangle ABC, AD = AE, <b style={{ color: C.primary }}>∠BAD = 20°</b>. What is <b style={{ color: ANSWER }}>x = ∠EDC</b>?
      </div>
      <Stage>
        <Framed k={0.92} top={640}>
          <Fig g={g} ticks={mark} angs={[angBAD(g, { color: GIVEN, op: mark, label: '20°' }), angX(g, { color: ANSWER, op: mark, label: 'x°' })]} />
        </Framed>
      </Stage>
      <div style={{ position: 'absolute', left: 40, top: 1225, width: 900, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {vals.map((v, i) => (
          <div key={v} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${v}^\\circ`} size={44} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} mark={ease(f, at(scene, 0, 0.6), 12)} />;
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

const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = at(scene, 0);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const e0 = (t: number) => ease(f, at(scene, 0, t), 12);
  const e1 = (t: number) => ease(f, at(scene, 1, t), 12);
  const e2 = ease(f, l2 + 4, 12);
  const adc = e0(0.55);
  const ade = e1(0.5);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 66, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1 - 4) }}>
          Outside angle: <span style={{ color: C.muted }}>60° + 20°</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 10) * fadeTo(f, l2 - 4) }}>
          Isosceles: <span style={{ color: DERIVED }}>base angles 70°</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 10) }}>
          x = <span style={{ color: C.green }}>80° − 70°</span>
        </div>
      </div>
      <Stage>
        <Framed k={1.3} top={470}>
          <Fig
            g={g}
            ticks={1}
            shades={[
              { pts: tri(g.A, g.B, g.D), color: GIVEN, op: e0(0.1) * fadeTo(f, l1) },
              { pts: tri(g.A, g.D, g.E), color: DERIVED, op: ade },
            ]}
            angs={[
              angBAD(g, { color: GIVEN, op: 1, label: '20°' }),
              angADC(g, { color: ANSWER, op: adc * fadeTo(f, l2, 0.35), label: '80°' }),
              angDAE(g, { color: DERIVED, op: e1(0.15), label: '40°' }),
              angADE(g, { color: DERIVED, op: ade, label: '70°' }),
              angX(g, { color: ANSWER, op: e2, label: 'x°' }),
            ]}
          />
        </Framed>
      </Stage>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.4);
  const chime = at(scene, 0, 0.97);
  const half = ease(f, at(scene, 1, 0.1), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 50px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>x =</span>
          <Tex tex="10^\circ" size={100} color="#fff" />
        </div>
      </div>
      <Stage>
        <Framed k={1.0} top={590}>
          <Fig
            g={g}
            ticks={1}
            angs={[
              angBAD(g, { color: GIVEN, op: 1, label: '20°' }),
              angX(g, { color: ANSWER, op: 1, label: '10°' }),
            ]}
          />
        </Framed>
      </Stage>
      <Text x={540} y={1262} w={900} size={58} weight={900} align="center" style={{ opacity: half }}>
        <span style={{ color: ANSWER }}>10°</span> = <span style={{ color: GIVEN }}>20°</span> ÷ 2
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:34" bullets={['Two ways to solve it', 'The hidden half pattern', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chase: Chase, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

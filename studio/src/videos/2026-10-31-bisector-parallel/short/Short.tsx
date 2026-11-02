import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, Fig, Glow, Lbl, MAIN, SLUG, TICK, XArcs, ZPath, deg, plane, pulse } from '../Composition';

export { SLUG };

const g = MAIN;
const P = plane(100, 1110, 44);
const pA = P(g.A);
const pB = P(g.B);
const pF = P(g.F);
const pC = P(g.C);
const midAF: [number, number] = [(pA[0] + pF[0]) / 2, pA[1] - 56];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hp = pulse(f, at(scene, 0, 0.55), 40);
  const q = ease(f, at(scene, 1, 0.25), 10);
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        3 sides given.
        <br />
        You need just <span style={{ color: C.violet }}>ONE</span>!
      </Text>
      <Stage>
        <Glow a={pA} b={pB} op={hp} />
        <Fig P={P} g={g} lens={[1, 1, 1]} />
        <Lbl p={midAF} t="?" color={C.amber} size={96} op={q} s={0.7 + 0.3 * pop(f, at(scene, 1, 0.25))} />
      </Stage>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        <b>AB = AC = 10</b>, <b>BC = 12</b>. A line through <b>A</b> is <b style={{ color: C.amber }}>parallel</b> to BC. The <b style={{ color: C.violet }}>bisector</b> of ∠B meets it at <b>F</b>. <b style={{ whiteSpace: "nowrap" }}>AF = ?</b>
      </div>
      <Stage>
        <Fig P={P} g={g} lens={[1, 1, 1]} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1215, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 48, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 2, 0.1 + i * 0.15)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={800} tick={TICK} />
  </>
);

const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const aBF = deg(g.B, g.F);
  const z = ease(f, at(scene, 1, 0.1), at(scene, 1, 0.5) - at(scene, 1, 0.1));
  const zOp = fadeTo(f, at(scene, 2, 0.1), 0.3, 14);
  const wedge = ease(f, at(scene, 1, 0.55), 12) * fadeTo(f, at(scene, 2, 0.05), 0, 12);
  const eq = (i: number, t: number, tex: string, y: number) => (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, i, t)) }}>
      <Tex tex={tex} size={64} />
    </div>
  );
  const done = ease(f, at(scene, 2, 0.45), 10);
  return (
    <>
      {eq(0, 0.55, '\\angle ABF = \\angle FBC = {\\color{#7b61ff}x}', 300)}
      {eq(1, 0.6, '\\angle AFB = {\\color{#7b61ff}x}\\ \\text{(Z shape)}', 400)}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 500, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.5)) }}>
        <Tex tex="AF = AB" size={84} color={C.green} />
      </div>
      <Stage>
        <ZPath P={P} g={g} p={z} op={zOp} />
        <Glow a={pA} b={pB} op={done} color={C.green} />
        <Glow a={pA} b={pF} op={done} color={C.green} />
        <Fig P={P} g={g} lens={[1, 1, 1]} />
        <XArcs
          P={P}
          g={g}
          r={80}
          b={ease(f, at(scene, 0, 0.5), 8)}
          bp={ease(f, at(scene, 0, 0.5), 16)}
          f={ease(f, at(scene, 1, 0.55), 8)}
          fp={ease(f, at(scene, 1, 0.55), 16)}
          s={1 + 0.15 * pulse(f, at(scene, 0, 0.6), 20)}
        />
        <Arc v={pF} a0={180} a1={180 + aBF} r={80} color={C.amber} w={9} op={wedge * (0.6 + 0.4 * pulse(f, at(scene, 1, 0.55), 40))} fill={C.amber} fillOp={0.35} />
      </Stage>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end = at(scene, 0, 1);
  const hit = at(scene, 0, 0.85);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 52px', fontSize: 84, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>AF = 10</div>
      </div>
      <Stage>
        <Glow a={pA} b={pB} op={1} color={C.green} />
        <Glow a={pA} b={pF} op={1} color={C.green} />
        <Fig P={P} g={g} lens={[1, 0.25, 0.25]} />
        <Lbl p={midAF} t="10" color={C.green} size={90} op={ease(f, hit, 8)} s={pop(f, hit)} />
      </Stage>
      <Text x={540} y={430} w={900} size={60} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        The other sides? Decoys!
      </Text>
      <Sequence from={end} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={end} seed={13} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="5:38" bullets={['Two ways: angles and a rhombus', 'Every trap explained', 'A lopsided triangle to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chase: Chase, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

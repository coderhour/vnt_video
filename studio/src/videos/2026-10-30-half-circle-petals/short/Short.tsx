import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Figure, Label, SLUG, TICK, arc, halves, path, plane } from '../Composition';

export { SLUG };

const BIG = plane(240, 1040, 150); // side 4 → 600 px, y 440…1040
const COLORS = [C.blue, C.amber, C.primary, C.red];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pet = ease(f, at(scene, 1, 0.0), 12) * fadeTo(f, at(scene, 1, 0.5), 0);
  const want = ease(f, at(scene, 1, 0.55), 14);
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        How much is <span style={{ color: C.violet }}>shaded</span>?
      </Text>
      <Stage>
        <Figure m={BIG} draw={range(4).map(() => 1)} shade={1} petalHi={[pet, pet, pet, pet]} petalHiColor={C.red} shadeHi={want} />
      </Stage>
      <Text x={540} y={1120} w={900} size={60} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.05)), opacity: pet }}>
        Petals? Not asked!
      </Text>
      <Text x={540} y={1120} w={900} size={60} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.55))}>
        We want the shaded part!
      </Text>
    </>
  );
};

const QM = plane(300, 1000, 100);

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>Side 4</b> square, a <b style={{ color: C.violet }}>half circle</b> on each side. <b>What is the shaded area?</b>
      </div>
      <Stage>
        <Figure m={QM} sideLabel="4" labelOpacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1130, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={46} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} mark={ease(f, at(scene, 0, 0.3), 10)} />;
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

const SPOTS2: [number, number][] = [[1, 1], [3, 1], [3, 3], [1, 3]]; // petal middles: in two half circles

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const start = (i: number) => at(scene, 0, 0.12 + i * 0.1);
  const lit = range(4).map((i) => ease(f, start(i), 8) * fadeTo(f, i < 3 ? start(i + 1) : at(scene, 1, 0.05), 0, 8));
  const arcs = ease(f, start(0), 8) * fadeTo(f, at(scene, 2, 0.1), 0);
  const twos = ease(f, at(scene, 1, 0.35), 12);
  const petalGlow = ease(f, at(scene, 2, 0.3), 14);
  const rows = fadeTo(f, at(scene, 2, 0.05), 0);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} color={C.amber} align="center" style={fadeUp(f, 0)}>
        Add up the half circles
      </Text>
      <Stage>
        <Figure m={BIG} sideLabel="4" halfHi={lit} shade={1 - 0.6 * arcs} petalHi={[twos * 0.6 + petalGlow, twos * 0.6 + petalGlow, twos * 0.6 + petalGlow, twos * 0.6 + petalGlow]} />
        {halves(4).map((h, i) => (
          <path key={i} d={path(arc(h.c, 2, h.a0, h.a1), BIG, false)} fill="none" stroke={COLORS[i]} strokeWidth={8} opacity={arcs * ease(f, start(i), 8)} />
        ))}
        {SPOTS2.map((p, i) => <Label key={i} p={BIG(p)} text="2" color={C.green} size={64} opacity={twos} />)}
      </Stage>
      <div style={{ opacity: rows }}>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 1135, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.6)) }}>
          <Tex tex="4 \times 2\pi = 8\pi" size={62} />
        </div>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 1220, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>
          <Tex tex="\text{but the square is only } 16" size={54} color={C.red} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.3)) }}>
        <Tex tex="8\pi = 16 + \text{petals}" size={70} color={C.green} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.3);
  const chime = at(scene, 1, 1);
  const pet = ease(f, at(scene, 0, 0.1), 12) * fadeTo(f, at(scene, 1, 0.1), 0.25);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '8px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Shaded =</span>
          <Tex tex="32-8\pi" size={84} color="#fff" />
        </div>
      </div>
      <Stage>
        <Figure m={BIG} petalHi={[pet, pet, pet, pet]} shadeHi={ease(f, at(scene, 1, 0.2), 14) * 0.5} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1130, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.1)), opacity: fadeTo(f, at(scene, 1, 0.1), 0) }}>
        <Tex tex="\text{petals} = 8\pi - 16" size={66} color={C.green} />
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1130, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Tex tex="\text{shaded} = 16 - (8\pi - 16)" size={58} color={C.violet} />
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:05" bullets={['Two neat ways to solve it', 'Every trap explained', 'A bigger square to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, count: Count, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

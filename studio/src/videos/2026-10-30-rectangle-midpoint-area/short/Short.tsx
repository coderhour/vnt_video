import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BOT, CHIME, CHOICES, Figure, Label, Q, SLUG, SimilarMarks, TICK, TOP, plane } from '../Composition';

export { SLUG };

const Mid: React.FC<{ y: number; start: number; end?: number; tex: string; size?: number; color?: string }> = ({ y, start, end = Infinity, tex, size = 60, color = C.ink }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const out = end === Infinity ? 1 : 1 - ease(f, end, 10);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * out }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const M = plane(160, 1000, 60); // rectangle 720 x 480: x 160..880, y 520..1000

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const say = at(scene, 1, 0.1);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        What's the <span style={{ color: C.primary }}>shaded area</span>?
      </Text>
      <Stage>
        <Figure g={Q} m={M} letterSize={52} />
      </Stage>
      <Text x={540} y={1130} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, say)}>
        Kids say 48. Not quite!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>12 by 8</b> rectangle, <b style={{ color: C.violet }}>M is the midpoint</b> of CD. Area of <b>A P M D</b>?
      </div>
      <Stage>
        <Figure g={Q} m={plane(160, 1060, 60)} letterSize={52} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1160, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Minus: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tri = ease(f, at(scene, 0, 0.45), 16);
  const cut = ease(f, at(scene, 1, 0.4), 12);
  const angles = ease(f, at(scene, 2, 0.1), 14);
  const heights = ease(f, at(scene, 2, 0.4), 12);
  const P = M(Q.P);
  const C2 = M(Q.C);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} align="center" color={C.violet} style={fadeUp(f, 0)}>
        Big triangle − small corner
      </Text>
      <Stage>
        <Figure g={Q} m={M} shade={1 - tri * 0.7} dims={1} letterSize={52} />
        <Poly pts={[Q.A, Q.C, Q.D].map(M)} color={C.violet} width={8} fill={C.violet} fillOpacity={0.22} progress={tri} />
        <Poly pts={TOP(Q).map(M)} color={C.red} width={6} fill={C.red} fillOpacity={0.4} opacity={cut} />
        <SimilarMarks g={Q} m={M} tri={0} angles={angles} heights={heights} parts={0} />
        <Label p={[P[0] + 62, (P[1] + C2[1]) / 2]} text="8/3" color={C.red} size={46} opacity={heights} />
      </Stage>
      <Mid y={1110} start={at(scene, 0, 0.5)} end={at(scene, 1, 0.3)} tex="ACD = \text{half of } 12 \times 8 = 48" size={54} color={C.violet} />
      <Mid y={1110} start={at(scene, 1, 0.5)} end={at(scene, 2, 0.3)} tex="\text{minus the corner } PCM" size={54} color={C.red} />
      <Mid y={1110} start={at(scene, 2, 0.35)} tex="PCM: \dfrac{6 \times \frac{8}{3}}{2} = 8" size={56} color={C.red} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="48 - 8 = 40" size={84} color="#fff" />
        </div>
      </div>
      <Stage>
        <Figure g={Q} m={plane(160, 1010, 60)} shadeColor={C.green} letterSize={52} />
      </Stage>
      <Text x={540} y={1090} w={900} size={60} weight={900} color={C.green} align="center" style={fadeUp(f, hit)}>
        Choice A
      </Text>
      <Text x={540} y={1180} w={900} size={50} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        48 forgets the little corner
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:32" bullets={['Two ways to find the area', 'Every wrong choice explained', 'A 15 by 8 one to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, minus: Minus, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

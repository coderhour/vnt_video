import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, R, Radius, Rolling, SLUG, TAU, TICK, lap, plane, pose, r } from '../Composition';

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

const MAIN = plane(540, 800, 27); // hoop radius 270 px: y 530 … 1070
const MU = 27;
const CM = plane(540, 760, 22); // centre scene: hoop radius 220, y 540 … 980
const CU = 22;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const d = lap(f, 6, scene.frames - 20);
  const nope = at(scene, 1, 0.5);
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        How many <span style={{ color: C.violet }}>turns</span>?
      </Text>
      <Stage>
        <Rolling d={d} m={MAIN} unit={MU} />
      </Stage>
      <Text x={540} y={1130} w={900} size={72} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        Most say 5.{' '}
        <span style={{ opacity: ease(f, nope, 8) }}>NOT 5!</span>
      </Text>
    </>
  );
};

const QM = plane(540, 770, 17); // hoop radius 170: y 600 … 940
const QU = 17;

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  const c0 = pose(R, r, 'inside', 0).c;
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A ring of <b style={{ color: C.violet }}>radius 2</b> rolls inside a hoop of <b style={{ color: C.primary }}>radius 10</b>. How many <b>full turns</b> on one trip?
      </div>
      <Stage>
        <Rolling d={0} m={QM} unit={QU} />
        <Radius m={QM} a={Math.PI * 0.75} len={R} text="10" color={C.primary} opacity={1} off={1.4} />
        <Radius m={QM} from={c0} a={0} len={r} text="2" color={C.amber} opacity={1} tip={1.2} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, display: 'flex', justifyContent: 'center', gap: 20 }}>
        {['3', '4', '5', '6', '8'].map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={54} />
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

const Center: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const start = pose(R, r, 'inside', 0);
  const [cx, cy] = CM(start.c);
  const centreHi = ease(f, at(scene, 0, 0.4), 12);
  const path = ease(f, at(scene, 1, 0.35), 40);
  const d = lap(f, at(scene, 2, 0.3), at(scene, 3, 0.95));
  const l3 = at(scene, 3);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} align="center" color={C.primary} style={fadeUp(f, 0)}>
        Follow the center!
      </Text>
      <Stage>
        <Rolling d={d} path={path} m={CM} unit={CU} />
        <circle cx={cx} cy={cy} r={14} fill={C.primary} opacity={centreHi * fadeTo(f, at(scene, 2, 0.3), 0)} />
        <Radius m={CM} a={Math.PI * 0.75} len={R - r} text="8" color={C.primary} opacity={ease(f, at(scene, 1, 0.7), 12)} off={1.3} />
      </Stage>
      <Mid y={410} start={at(scene, 1, 0.6)} tex="\text{path radius} = 10 - 2 = 8" size={54} color={C.primary} />
      <Mid y={1010} start={at(scene, 2, 0.3)} tex="\text{one turn} = 4\pi" size={56} color={C.red} />
      <Mid y={1080} start={l3 + 6} tex="\text{path} = 2 \times \pi \times 8 = 16\pi" size={52} color={C.primary} />
      <Mid y={1150} start={at(scene, 3, 0.65)} tex="16\pi \div 4\pi = \;?" size={60} color={C.green} />
    </>
  );
};

const RM = plane(540, 820, 24); // hoop radius 240: y 580 … 1060

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.02);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', fontSize: 72, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          4 full turns
        </div>
      </div>
      <Stage>
        <Rolling d={TAU} ghosts touches={f >= at(scene, 1, 0.1)} m={RM} unit={24} />
      </Stage>
      <Text x={540} y={1150} w={900} size={48} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        The dot touches the hoop 5 times, but the loop takes one turn back.
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:03" bullets={['Follow the center, step by step', 'The five-minus-one trick', 'A coin around a plate to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, center: Center, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBD, CH, CHIME, Clock, SLUG, TICK, stepH } from '../Composition';

export { SLUG };

const CX = 490;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [0.3, 0.45, 0.6, 0.75, 0.9].map((t) => at(scene, 0, t));
  // moves of 1, 2, 3, 4, 5 hours: the hand jumps ahead by a bigger step each time
  const h = starts.reduce((acc, s, i) => acc + (i + 1) * ease(f, s, 14), 3);
  const q = ease(f, at(scene, 1, 0.2), 10);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        Move it 1, 2, 3 … 20 hours
      </Text>
      <Clock cx={CX} cy={850} R={340} h={h} trail={f > starts[0] && f < starts[4] + 20 ? 1 : 0} q={q} qx={CX} qy={CX < 0 ? 0 : 990} />
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        The hour hand points to <b>3</b>. Move it <b style={{ color: C.violet }}>1 hour</b>, then <b style={{ color: C.violet }}>2</b>, then <b style={{ color: C.violet }}>3</b>, … up to <b style={{ color: C.violet }}>20</b>. <b>Where does it point?</b>
      </div>
      <Clock cx={CX} cy={920} R={240} h={3} />
      <div style={{ position: 'absolute', left: 60, top: 1215, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 50, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
            {c}
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

const Turns: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = at(scene, 1, 0.3);
  const b = at(scene, 1, 0.95);
  const p = interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 2 });
  const h = 3 + 204 * p;
  const turns = Math.floor((h - 3) / 12 + 1e-6);
  const spinning = f > a && f < b;
  const six = ease(f, at(scene, 2, 0.1), 10);
  const row = (i: number, t: number, tex: string, y: number, size = 64) => (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, i, t)) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
  return (
    <>
      {row(0, 0.25, '1 + 2 + 3 + \\cdots + 20 = 210', 300)}
      {row(1, 0.1, '210 = {\\color{#8a91a0}17 \\times 12} + {\\color{#f59f0a}6}', 410, 72)}
      <Clock cx={CX} cy={900} R={330} h={h} trail={spinning ? 1 : 0} glow={six} />
      <Text x={CX} y={1235} w={800} size={56} weight={900} color={C.muted} align="center" style={{ opacity: ease(f, a, 8) * (1 - six) }}>
        full turns: {turns}
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1225, display: 'flex', justifyContent: 'center', opacity: six }}>
        <div style={{ background: AMBD, color: '#fff', borderRadius: 999, padding: '8px 40px', fontSize: 56, fontWeight: 900, transform: `scale(${pop(f, at(scene, 2, 0.1))})` }}>only 6 hours matter</div>
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const starts = [0.04, 0.17, 0.3, 0.43, 0.56, 0.69].map(t);
  const h = stepH(f, 3, starts, 9);
  const k = starts.filter((s) => f >= s).length;
  const hit = t(0.88);
  const end = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, hit - 4) }}>
        <Tex tex="3 + 6" size={84} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>Points to 9</div>
      </div>
      <Clock cx={CX} cy={900} R={330} h={h} glow={ease(f, hit, 10)} />
      <Text x={CX} y={1235} w={800} size={60} weight={900} color={AMBD} align="center" style={{ opacity: k > 0 ? 1 - ease(f, hit, 8) : 0 }}>
        +{k} hour{k === 1 ? '' : 's'}
      </Text>
      <Text x={CX} y={1235} w={860} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Not 6! Start from 3.
      </Text>
      <Sequence from={end} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={end} seed={23} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="4:59" bullets={['Add it up, step by step', 'A way to skip the big sum', 'Every trap, plus a new start']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, turns: Turns, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

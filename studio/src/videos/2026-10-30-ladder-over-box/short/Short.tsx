import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Fig, HBrace, Label, SLUG, Seg, TICK, VBrace, px, wx, type Cfg } from '../Composition';

export { SLUG };

const BIG: Cfg = { a: 9, d: 12, h: 12, u: 24, ox: 110, oy: 1200 }; // wall at 21 ft → x 614; 31 ft tall → y 456
const SMALL: Cfg = { a: 9, d: 12, h: 12, u: 19, ox: 110, oy: 1195 };

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        How long is the <span style={{ color: C.violet }}>ladder</span>?
      </Text>
      <Stage>
        <Fig c={BIG} draw={ease(f, 0, 14)} ladder={ease(f, at(scene, 0, 0.3), 24)} dotP={1} />
      </Stage>
      <Text x={540} y={1245} w={900} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.45))}>
        Most kids stop halfway!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A <b style={{ color: C.violet }}>ladder</b> touches the corner of a <b style={{ color: C.primary }}>12 ft box</b> and reaches the wall. <b>How long is it?</b>
      </div>
      <Stage>
        <Fig c={SMALL} />
        <Label p={px(SMALL, 4.4, 1.9)} text="9 ft" color={C.primary} size={46} opacity={mark} />
        <Label p={px(SMALL, 15, 6)} text="12 × 12" color={C.ink} size={46} opacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1238, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 30, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 46, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.07)} mark={ease(f, at(scene, 0, 0.3), 10)} />;
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

const Steps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c = BIG;
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  const P = px(c, c.a, c.h);
  // L0: the small triangle and one 3-across, 4-up step; L1: seven steps; L2: the wall height
  const t0 = at(scene, 1, 0.15);
  const per = Math.max(4, Math.round((scene.lines[1].frames * 0.7) / 7));
  const k = f < t0 ? 0 : Math.min(7, Math.floor((f - t0) / per) + 1);
  const stairs = Array.from({ length: 7 }, (_, i) => ({ a: px(c, 3 * i, 4 * i), b: px(c, 3 * (i + 1), 4 * i), e: px(c, 3 * (i + 1), 4 * (i + 1)), i }));
  const tiny = s(0, 0.55);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} color={C.violet} align="center" style={fadeUp(f, 0)}>
        Same steepness all the way
      </Text>
      <Stage>
        <Fig c={c} />
        <path d={`M ${px(c, 0, 0).join(' ')} L ${px(c, c.a, 0).join(' ')} L ${P.join(' ')} Z`} fill={C.primary} opacity={0.4 * s(0, 0.1)} />
        <Label p={px(c, c.a / 2, -2.6)} text="9 across" color={C.primary} size={44} opacity={s(0, 0.2) * (1 - s(1, 0.1))} />
        <Label p={px(c, c.a + 0.6, 5)} text="12 up" color={C.primary} size={44} anchor="start" opacity={s(0, 0.35) * (1 - s(1, 0.1))} />
        {tiny > 0 && k === 0 && (
          <g opacity={tiny}>
            <Seg a={px(c, 6, 8)} b={px(c, 9, 8)} color={C.violet} width={10} />
            <Seg a={px(c, 9, 8)} b={px(c, 9, 12)} color={C.violet} width={10} />
            <Label p={px(c, 7.5, 6.3)} text="3" color={C.violet} size={52} />
            <Label p={px(c, 9.9, 10)} text="4" color={C.violet} size={52} anchor="start" />
          </g>
        )}
        {stairs.map(({ a, b, e, i }) => {
          if (i >= k) return null;
          const col = i % 2 === 0 ? C.violet : C.amber;
          return (
            <g key={i}>
              <Seg a={a} b={b} color={col} width={10} />
              <Seg a={b} b={e} color={col} width={10} />
            </g>
          );
        })}
        <HBrace x1={px(c, 0, 0)[0]} x2={px(c, wx(c), 0)[0]} y={px(c, 0, 0)[1] + 46} color={C.violet} label="21" opacity={s(1, 0.1)} />
        <circle cx={px(c, 21, 28)[0]} cy={px(c, 21, 28)[1]} r={14} fill={C.ink} opacity={s(2, 0.2)} />
        <VBrace x={px(c, 22.1, 0)[0]} y1={px(c, 0, 0)[1]} y2={px(c, 0, 28)[1]} color={C.blue} label="28" opacity={s(2, 0.2)} lx={62} />
      </Stage>
      <Text x={60} y={480} w={400} size={52} weight={900} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.2)), opacity: s(1, 0.2) * (1 - s(2, 0.1)) }}>
        {k} {k === 1 ? 'step' : 'steps'} of 3 across, 4 up
      </Text>
      <Text x={60} y={480} w={400} size={52} weight={900} color={C.blue} style={fadeUp(f, at(scene, 2, 0.15))}>
        7 × 4 = 28 feet up the wall
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c = BIG;
  const hit = at(scene, 1, 0.5);
  const chime = at(scene, 1, 1);
  const W = px(c, 21, 28);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Ladder =</span>
          <span style={{ fontSize: 90, fontWeight: 900 }}>35 ft</span>
        </div>
      </div>
      <Stage>
        <Fig c={c} big={ease(f, at(scene, 0, 0.1), 14)} dotW={1} />
        <HBrace x1={px(c, 0, 0)[0]} x2={px(c, wx(c), 0)[0]} y={px(c, 0, 0)[1] + 46} color={C.violet} label="21 = 7 × 3" opacity={ease(f, at(scene, 0, 0.25), 10)} />
        <VBrace x={px(c, 22.1, 0)[0]} y1={px(c, 0, 0)[1]} y2={W[1]} color={C.blue} label="28" opacity={ease(f, at(scene, 0, 0.45), 10)} lx={62} />
        <Label p={[px(c, 8, 20)[0] - 20, px(c, 8, 20)[1]]} text="35" color={C.green} size={80} opacity={ease(f, hit, 10)} />
      </Stage>
      <Text x={60} y={480} w={400} size={52} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.6))}>
        3-4-5 triangle, 7 times bigger
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:00" bullets={['Two ways to find the length', 'Every trap explained', 'A new ladder to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, steps: Steps, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

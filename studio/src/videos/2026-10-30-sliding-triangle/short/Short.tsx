import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Fig, Label, RightMark, SLUG, Seg, TICK, mkP } from '../Composition';

export { SLUG };

const ALL = { b: 1, h: 1, d: 1 };

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

const HP = mkP(110, 900, 50); // hook / aha figure: base at y 900, top at 450; copy ends at x 910

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        How much <span style={{ color: C.primary }}>sticks out</span>?
      </Text>
      <Stage>
        <Fig P={HP} cFill={0.1} shade={1} tFill={0.1} labels={{}} />
      </Stage>
      <Text x={540} y={1010} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.55))}>
        Kids say 24. Wrong!
      </Text>
    </>
  );
};

const QP = mkP(110, 1020, 50);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 46, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Legs <b style={{ color: C.primary }}>12 and 9</b>. The copy slides <b style={{ color: C.violet }}>4 right</b>. Area of the <b>shaded part</b>?
      </div>
      <Stage>
        <Fig P={QP} cFill={0.1} shade={1} tFill={0.1} labels={ALL} />
      </Stage>
      <div style={{ position: 'absolute', left: 40, top: 1190, width: 900, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
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

const Overlap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = HP;
  const ov = ease(f, at(scene, 1, 0.1), 14);
  const side = ease(f, at(scene, 2, 0.3), 14);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} align="center" color={C.violet} style={fadeUp(f, 0)}>
        The overlap is a mini copy
      </Text>
      <Stage>
        <Fig P={P} cFill={ease(f, at(scene, 0, 0.3), 12) * 2.2 + 0.1} ov={ov} labels={ALL}>
          <Label p={P(7.4, 2.0)} text="54" color={C.blue} size={72} opacity={ease(f, at(scene, 0, 0.5), 10) * (1 - ov)} />
          <RightMark p={P(4, 0)} opacity={ov} />
          <Seg a={P(4, 0)} b={P(4, 6)} color={C.red} width={12} opacity={side} progress={side} />
          <Label p={P(5.2, 2.4)} text="6" color={C.red} size={60} opacity={ease(f, at(scene, 2, 0.5), 10)} />
          <Label p={P(6.9, 1.2)} text="24" color={C.green} size={70} opacity={ease(f, at(scene, 2, 0.85), 10)} />
        </Fig>
      </Stage>
      <Mid y={1110} start={at(scene, 0, 0.5)} end={at(scene, 1, 0.3)} tex="\dfrac{1}{2} \times 12 \times 9 = 54" size={58} color={C.blue} />
      <Mid y={1110} start={at(scene, 2, 0.1)} tex="8 \text{ of } 12 \;\to\; \dfrac{2}{3} \times 9 = 6" size={56} color={C.red} />
      <Mid y={1235} start={at(scene, 2, 0.6)} tex="\dfrac{1}{2} \times 8 \times 6 = 24" size={58} color={C.green} />
    </>
  );
};

const RP = mkP(110, 900, 50);

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="54 - 24 = 30" size={84} color="#fff" />
        </div>
      </div>
      <Stage>
        <Fig P={RP} cFill={0.1} ov={1} shade={1} labels={ALL}>
          <Label p={RP(6.9, 1.2)} text="24" color={C.green} size={64} />
          <Label p={RP(13, 1.2)} text="30" color={C.ink} size={64} opacity={ease(f, hit, 10)} />
        </Fig>
      </Stage>
      <Text x={540} y={1130} w={900} size={60} weight={900} color={C.green} align="center" style={fadeUp(f, hit)}>
        Choice E
      </Text>
      <Text x={540} y={1215} w={900} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        24 was just the overlap
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:22" bullets={['Two ways to solve it', 'Every wrong choice explained', 'A new slide to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, overlap: Overlap, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

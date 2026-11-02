import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, Fig, Lbl, Pieces, Q, Radius, SLUG, TICK, view } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 72 }) => (
  <Text x={540} y={300} w={980} size={size} weight={900} align="center">
    {children}
  </Text>
);

/** A centred line of maths, fading up at frame `start`. */
const Mid: React.FC<{ y: number; tex: string; start: number; size?: number; color?: string }> = ({ y, tex, start, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const HG = Q(7, 8); // the 13-14-15 triangle: y = 7, z = 8
const HM = view(190, 1180, 48);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        Biggest <span style={{ color: C.violet }}>perimeter</span>?
      </Title>
      <Stage>
        <Fig g={HG} m={HM}>
          <Radius g={HG} m={HM} o={ease(f, at(scene, 0, 0.5), 10)} />
        </Fig>
      </Stage>
      <Text x={540} y={1235} w={900} size={60} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        Perimeter = ?
      </Text>
    </>
  );
};

const QM = view(300, 1200, 32);

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '22px 36px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Whole-number sides. The <b style={{ color: C.primary }}>circle</b> has radius <b>4</b> and touches <b>AB</b>, <b>AC</b> at points <b style={{ color: C.primary }}>6</b> from A. <b>Largest perimeter?</b>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 585, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 50, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 34 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <Fig g={HG} m={QM}>
          <Radius g={HG} m={QM} o={mark} />
        </Fig>
        <Pieces g={HG} m={QM} o={[mark, 0, 0]} />
      </Stage>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} mark={ease(f, at(scene, 0, 0.7), 10)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} mark={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={1000} tick={TICK} />
  </>
);

const Pcs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const side = (x: number, y: number, tex: string, start: number) => (
    <div style={{ position: 'absolute', left: x - 100, width: 200, top: y - 36, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={50} />
    </div>
  );
  return (
    <>
      <Title size={66}>Equal tangent pieces</Title>
      <Stage>
        <Fig g={HG} m={HM} />
        <Pieces g={HG} m={HM} o={[ease(f, a(0, 0.35), 10), ease(f, a(0, 0.6), 10), ease(f, a(0, 0.8), 10)]} labels={['6', 'y', 'z']} />
      </Stage>
      {side(190, 900, '6+y', a(1, 0.3))}
      {side(530, 1250, '6+z', a(1, 0.55))}
      {side(790, 900, 'y+z', a(1, 0.78))}
      <Mid y={395} tex="3yz=48+8y+8z" start={a(2, 0.05)} size={50} />
      <Mid y={470} tex="y=3\ \Rightarrow\ z=72" start={a(2, 0.6)} size={56} color={C.green} />
    </>
  );
};

const RM = view(110, 800, 10.5);
const RG = Q(3, 72);

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const hit = t(0, 0.74);
  const chime = t(1, 1) - 4;
  const lab = (p: [number, number], text: string, st: number) => <Lbl p={p} text={text} size={50} o={ease(f, st, 10)} />;
  return (
    <>
      <Title>The biggest triangle</Title>
      <Stage>
        <Fig g={RG} m={RM} letters={1} />
        {lab([76, 745], '9', t(0, 0.1))}
        {lab([520, 678], '75', t(0, 0.3))}
        {lab([520, 860], '78', t(0, 0.5))}
      </Stage>
      <Mid y={920} tex="9+75+78" start={t(0, 0.55)} size={64} />
      {pop(f, hit) > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 1010, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 56px', fontSize: 92, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>= 162</div>
        </div>
      )}
      <Text x={540} y={1150} w={900} size={58} weight={900} color={C.violet} align="center" style={fadeUp(f, t(1, 0.05))}>
        Choice E
      </Text>
      <Text x={540} y={1225} w={900} size={52} weight={900} color={C.amber} align="center" style={fadeUp(f, t(1, 0.4))}>
        81 is only half of it!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={1060} start={chime} seed={11} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:06" bullets={['Two ways to solve it', 'Why 81 is a trap', 'A radius-3 one to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pieces: Pcs, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

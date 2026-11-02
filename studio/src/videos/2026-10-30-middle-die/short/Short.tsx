import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, XMark } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, DICE, Die, Label, Ring, SLUG, SortRoll, TICK } from '../Composition';

export { SLUG };

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 1, 0.4);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        Middle die is a <span style={{ color: C.violet }}>2</span>?
      </Text>
      <Stage>
        <SortRoll vals={[5, 2, 1]} x0={225} x1={225} y={640} size={170} gap={225} start={0} sortAt={at(scene, 0, 0.45)} ringAt={at(scene, 0, 0.75)} />
        <Label x={540} y={860} text="sorted: 1 · 2 · 5" size={50} color={C.muted} opacity={ease(f, at(scene, 0, 0.6), 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 930, display: 'flex', justifyContent: 'center', opacity: ease(f, at(scene, 1, 0.1), 10) }}>
        <Tex tex="\dfrac{1}{6}\ ?" size={90} color={C.ink} />
      </div>
      <Stage>
        <XMark at={[540, 1025]} size={150} opacity={ease(f, nope, 8)} />
      </Stage>
      <Text x={540} y={1190} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, nope)}>
        NOT one in six!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>Three dice</b>, put in order. What is the chance the <b style={{ color: C.violet }}>middle</b> one is <b>2</b>?
      </div>
      <Stage>
        {range(3).map((i) => (
          <Die key={i} x={225 + i * 225} y={690} v={0} size={150} color={DICE[i]} scale={pop(f, 4 + i * 5, fps)} />
        ))}
        <Ring x={540} y={690} size={150} opacity={mark} />
        <Label x={540} y={830} text="smallest → largest" size={46} color={C.muted} opacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 40, top: 960, width: 900, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 16px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 30, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} mark={ease(f, at(scene, 1, 0.2), 10)} />;
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

const ROWS = [
  { label: 'exactly one 2', vals: [1, 2, 0], count: '24', line: 1, t: 0.2 },
  { label: 'exactly two 2s', vals: [2, 2, 0], count: '15', line: 2, t: 0.0 },
  { label: 'all three 2s', vals: [2, 2, 2], count: '1', line: 2, t: 0.55 },
];
const ROW_Y = [570, 750, 930];

const Rows: React.FC<{ scene: Scene; all?: boolean }> = ({ scene, all }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Stage>
        {ROWS.map((r, k) => {
          const t = all ? 0 : at(scene, r.line, r.t);
          return (
            <g key={k}>
              {r.vals.map((v, i) => (
                <Die key={i} x={150 + i * 150} y={ROW_Y[k] + 95} v={v} size={118} color={v === 0 ? C.muted : DICE[i]} scale={pop(f, t + i * 4, fps)} />
              ))}
            </g>
          );
        })}
      </Stage>
      {ROWS.map((r, k) => (
        <div key={k}>
          <Text x={90} y={ROW_Y[k] - 25} w={500} size={46} weight={800} color={C.muted} style={all ? undefined : fadeUp(f, at(scene, 0, 0.5 + k * 0.15))}>
            {r.label}
          </Text>
          <Text x={560} y={ROW_Y[k] + 45} w={360} size={88} weight={900} color={C.violet} style={all ? undefined : fadeUp(f, at(scene, r.line, r.t + 0.3))}>
            {r.count}
            <span style={{ fontSize: 40, color: C.muted, fontWeight: 800 }}> rolls</span>
          </Text>
        </div>
      ))}
    </>
  );
};

const Cases: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={64} weight={900} color={C.violet} align="center" style={fadeUp(f, 0)}>
        Sort by how many 2s
      </Text>
      <Rows scene={scene} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.45);
  const chime = at(scene, 1, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '6px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Chance =</span>
          <Tex tex="\dfrac{5}{27}" size={96} color="#fff" />
        </div>
      </div>
      <Rows scene={scene} all />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1125, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.55)) }}>
        <Tex tex="24 + 15 + 1 = 40 \;\Rightarrow\; \dfrac{40}{216} = \dfrac{5}{27}" size={54} />
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:59" bullets={['Two ways to count', 'Every trap explained', 'A new dice puzzle to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, cases: Cases, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

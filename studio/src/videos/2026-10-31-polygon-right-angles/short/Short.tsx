import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, CHIME, CHIPS, G1, G2, GD, SLUG, TICK } from '../Composition';
import { CornerMark, Outline, PartialShape, TurnCircle, Walker, corner, flashP, passP, poly11, walkU, type P, type Wedge } from '../geom';

export { SLUG };

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

// the 11-gon: bottom-left at (280, 990), 80 px per unit -> x 90…360, y 536…990
const R11 = poly11(80, [330, 990]);
const CC: P = [730, 740];
const CR = 185;

const Eq: React.FC<{ y: number; start: number; end?: number; tex: string; size?: number }> = ({ y, start, end = 1e6, tex, size = 64 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 10) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

const PS = poly11(86, [470, 1120]);
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        How many <span style={{ color: C.primary }}>sides</span>?
      </Title>
      <Stage>
        <PartialShape poly={PS} progress={ease(f, 2, 40)} marks={ease(f, at(scene, 0, 0.3), 10)} labels={ease(f, at(scene, 0, 0.5), 10)} unknown={ease(f, 20, 20)} fs={52} />
      </Stage>
      <Text x={540} y={1240} w={900} size={56} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Take a walk instead!
      </Text>
    </>
  );
};

const QS = poly11(70, [330, 1150]);
const QuestionBody: React.FC<{ start: (i: number) => number; shape: number }> = ({ start, shape }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A convex polygon: <b style={{ color: C.violet }}>two corners of 90°</b>, all the others <b style={{ color: C.primary }}>160°</b>. <b>How many sides?</b>
      </div>
      <Stage>
        <PartialShape poly={QS} progress={shape} marks={shape} labels={shape} unknown={shape} fs={48} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1210, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHIPS.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={54} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} shape={ease(f, 4, 20)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} shape={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // line 0: one lap around the outside; line 2: the walk again, filling the circle
  const lap = walkU(f, at(scene, 0, 0.1), at(scene, 0, 0.95), 0, 11);
  const u = walkU(f, at(scene, 2, 0.42), at(scene, 2, 0.93), 2, 11.9);
  const second = f >= at(scene, 2, 0.3);
  const c1 = corner(R11, 1);
  const c6 = corner(R11, 6);
  const w1 = ease(f, at(scene, 1, 0.05), 8) * (1 - ease(f, at(scene, 2, 0.02), 8));
  const w2 = ease(f, at(scene, 1, 0.5), 8) * (1 - ease(f, at(scene, 2, 0.02), 8));
  const wedges: Wedge[] = [
    { a: 90, color: AMBER, p: ease(f, at(scene, 2, 0.06), 10), label: '90°' },
    { a: 90, color: AMBER, p: ease(f, at(scene, 2, 0.2), 10), label: '90°' },
    ...range(9).map((j): Wedge => ({ a: 20, color: j % 2 ? G2 : G1, p: passP(u, 3 + j, 0.25) })),
  ];
  const k = Math.max(0, Math.min(9, Math.floor(u + 1e-9) - 2));
  const full = ease(f, at(scene, 0, 0.9), 8) * (1 - ease(f, at(scene, 1, 0.1), 8));
  return (
    <>
      <Title>
        Add up the <span style={{ color: GD }}>turns</span>
      </Title>
      <Stage>
        <Outline poly={R11} progress={ease(f, 2, 20)} fill={C.violetSoft} />
        <CornerMark at={c1.at} din={c1.din} dout={c1.dout} r={46} extOp={w1} inOp={w1} turnOp={w1} inLabel="90°" turnLabel="90°" labelGap={44} size={48} />
        <CornerMark at={c6.at} din={c6.din} dout={c6.dout} r={46} turnR={92} turnGap={46} extLen={170} extOp={w2} inOp={w2} turnOp={w2} inLabel="160°" turnLabel="20°" labelGap={48} size={48} />
        {range(9).map((j) => {
          const c = corner(R11, 3 + j);
          return <CornerMark key={j} at={c.at} din={c.din} dout={c.dout} r={40} turnOp={second ? flashP(u, 3 + j) : 0} />;
        })}
        <Walker poly={R11} u0={second ? 2 : 0} u={second ? Math.min(u, 11.3) : Math.min(lap, 10.95)} op={ease(f, 4, 8) * (1 - ease(f, at(scene, 1, 0.05), 10) * (1 - ease(f, at(scene, 2, 0.4), 8)))} />
        <TurnCircle c={CC} R={CR} wedges={wedges} ghost={{ a1: 0, a2: 359.9, op: ease(f, at(scene, 0, 0.1), 10) * (1 - ease(f, at(scene, 1, 0.1), 8)), label: '' }} />
      </Stage>
      <Text x={CC[0]} y={CC[1] - 36} w={300} size={72} weight={900} color={C.muted} align="center" style={{ opacity: full * ease(f, at(scene, 0, 0.7), 10) }}>360°</Text>
      <Text x={CC[0]} y={CC[1] + CR + 24} w={400} size={70} weight={900} color={GD} align="center" style={{ opacity: k > 0 ? 1 : 0 }}>
        ×{k}
      </Text>
      <Eq y={1075} start={at(scene, 1, 0.3)} end={at(scene, 2, 0)} tex={`180 - 90 = ${col(AMBER, '90')}`} />
      <Eq y={1170} start={at(scene, 1, 0.7)} end={at(scene, 2, 0)} tex={`180 - 160 = ${col(GD, '20')}`} />
      <Eq y={1075} start={at(scene, 2, 0.3)} tex={'360 - 180 = 180'} />
      <Eq y={1170} start={at(scene, 2, 0.62)} tex={`180 \\div 20 = ${col(GD, '9')}`} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.65);
  const chime = at(scene, 0, 1);
  const wedges: Wedge[] = [
    { a: 90, color: AMBER, p: 1, label: '90°' },
    { a: 90, color: AMBER, p: 1, label: '90°' },
    ...range(9).map((j): Wedge => ({ a: 20, color: j % 2 ? G2 : G1, p: 1 })),
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          11 sides
        </div>
      </div>
      <Stage>
        <Outline poly={R11} progress={1} fill={C.violetSoft} />
        {R11.pts.map((p, i) => {
          const s = ease(f, at(scene, 0, 0.1 + i * 0.07), 6);
          return s > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={18 * s} fill={i === 1 || i === 2 ? AMBER : G1} stroke="#fff" strokeWidth={4} /> : null;
        })}
        <TurnCircle c={CC} R={CR} wedges={wedges} />
      </Stage>
      <Text x={CC[0]} y={CC[1] - 36} w={300} size={72} weight={900} color="#fff" align="center" style={{ opacity: 0.95 }}>360°</Text>
      <Eq y={1050} start={at(scene, 0, 0.3)} tex={`${col(GD, '9')} + ${col(AMBER, '2')} = 11`} size={76} />
      <Text x={540} y={1180} w={900} size={50} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        160° is almost flat
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={7} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:15" bullets={['Two ways to solve it', 'Every wrong answer explained', 'New corners to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, walk: Walk, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

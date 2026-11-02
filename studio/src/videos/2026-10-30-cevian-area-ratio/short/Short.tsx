import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AcLab, CHIME, CHOICES, Dot, Fig, Fill, Lab, Ln, MidTicks, SLUG, StepTicks, TICK, add, bump, cen, lerp, main } from '../Composition';

export { SLUG };

/** The long video's figure (704 × 563 px, A at the top) placed at (X, Y) and scaled by k. */
const At: React.FC<{ k: number; X: number; Y: number; children: React.ReactNode }> = ({ k, X, Y, children }) => (
  <g transform={`translate(${X} ${Y}) scale(${k})`}>{children}</g>
);

const g = main(0, 0);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>Where do the lines cross?</Title>
      <Stage>
        <At k={1} X={110} Y={500}>
          <Fill pts={[g.A, g.B, g.D]} color={C.amber} opacity={bump(f, at(scene, 1, 0.45), 50)} fo={0.25} stroke={6} />
          <Fig g={g} draw={ease(f, 2, 20)} dOp={ease(f, 10, 10)} eOp={ease(f, 12, 10)} ad={ease(f, 14, 22)} be={ease(f, 24, 22)} pOp={ease(f, 52, 10)} shade={ease(f, 60, 16)} />
          <Lab p={cen([g.A, g.B, g.P])} text="?" size={80} color={C.primary} opacity={ease(f, at(scene, 1, 0.1), 10)} />
        </At>
      </Stage>
      <Text x={540} y={1170} w={900} size={64} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.5))}>
        Area of the triangle: <span style={{ color: C.ink }}>60</span>
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Area of A B C is <b style={{ color: C.primary }}>60</b>. D is the midpoint of B C, A E : E C = 2 : 1. <b>Area of A B P?</b>
      </div>
      <Stage>
        <At k={0.8} X={170} Y={650}>
          <Fig g={g} />
          <MidTicks g={g} op={ease(f, 20, 10)} />
          <StepTicks g={g} n={3} op={ease(f, 28, 10)} />
        </At>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1180, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 50, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Ratio: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const half = ease(f, at(scene, 0, 0.3), 12) * fadeTo(f, at(scene, 3, 0.1));
  const df = ease(f, at(scene, 1, 0.3), 20);
  const steps = ease(f, at(scene, 2, 0.05), 10);
  const four = ease(f, at(scene, 2, 0.5), 10);
  const abp = ease(f, at(scene, 3, 0.2), 14);
  const lab = (t: number, text: string, on: number) => <Lab p={AcLab(g, t, 100)} text={text} color={C.violet} size={52} opacity={on} />;
  return (
    <>
      <Title>{f < at(scene, 1) ? 'Half is thirty' : f < at(scene, 2, 0.5) ? <>A line <span style={{ color: C.violet }}>parallel</span> to B E</> : f < at(scene, 3) ? <>A P : P D = <span style={{ color: C.green }}>4 : 1</span></> : <>A B P is <span style={{ color: C.green }}>4/5</span> of A B D</>}</Title>
      <Stage>
        <At k={1} X={110} Y={470}>
          <Fill pts={[g.A, g.B, g.D]} color={C.amber} opacity={half} fo={0.25} stroke={6} />
          <Fill pts={[g.A, g.B, g.P]} color={C.green} opacity={abp} fo={0.4} stroke={6} />
          <Fig g={g} shade={0} />
          <Lab p={cen([g.A, g.B, g.D])} text="30" size={64} color={C.amber} opacity={half * (1 - abp)} />
          <Ln a={g.D} b={g.F} dashed color={C.violet} width={7} p={df} />
          <Dot p={g.F} color={C.violet} r={11} opacity={df} />
          <Lab p={add(g.F, 40, 26)} text="F" color={C.violet} size={52} opacity={df} />
          <StepTicks g={g} n={6} op={steps} color={C.violet} />
          {lab(2 / 6, '4', four)}
          {lab(4.5 / 6, '1', four)}
          {lab(5.5 / 6, '1', four)}
          <Dot p={g.P} color={C.green} r={14} opacity={ease(f, at(scene, 2, 0.7), 10)} />
        </At>
      </Stage>
      <Text x={540} y={1190} w={900} size={60} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 2, 0.7))}>
        A P is 4 parts, P D is 1 part
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  const chip = (x: number, text: string, color: string, start: number) => (
    <div style={{ position: 'absolute', left: x, top: 1200, background: color, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 46, fontWeight: 900, ...fadeUp(f, start) }}>{text}</div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 40px', fontSize: 68, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          4/5 × 30 = 24
        </div>
      </div>
      <Stage>
        <At k={0.95} X={130} Y={500}>
          <Fig g={g} />
          <Lab p={cen([g.A, g.B, g.P])} text="24" size={64} color={C.green} opacity={ease(f, hit, 8)} />
        </At>
      </Stage>
      {chip(60, 'A C  2 : 1', C.violet, at(scene, 1, 0.15))}
      {chip(520, 'A D  4 : 1', C.green, at(scene, 1, 0.5))}
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={400} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:59" bullets={['Two ways: pieces and a parallel line', 'Every trap explained', 'A new triangle to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, ratio: Ratio, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

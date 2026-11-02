import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Dots, Stage, makeGrid, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Lab, Ring, SLUG, Seg, TICK } from '../Composition';

export { SLUG };

const G = makeGrid(270, 540, 135);

const Title: React.FC<{ children: React.ReactNode; start?: number; size?: number }> = ({ children, start = 0, size = 72 }) => {
  const f = useCurrentFrame();
  return (
    <Text x={540} y={300} w={980} size={size} weight={900} align="center" style={start > 0 ? fadeUp(f, start) : undefined}>
      {children}
    </Text>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = at(scene, 1, 0.1);
  return (
    <>
      <Title>
        How many pairs are <span style={{ color: C.violet }}>5 apart</span>?
      </Title>
      <Stage>
        <Seg a={G([0, 0])} b={G([3, 4])} color={C.violet} width={9} progress={ease(f, a + 10, 20)} opacity={0.9} />
        <Dots cols={5} rows={5} at={G} r={14} />
      </Stage>
      <Text x={540} y={1130} w={900} size={60} weight={900} color={C.muted} align="center" style={fadeUp(f, a)}>
        25 dots, 1 unit apart
      </Text>
    </>
  );
};

const QG = makeGrid(290, 520, 125);

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Dots are <b style={{ color: C.primary }}>1 unit</b> apart. How many <b style={{ color: C.violet }}>pairs</b> are exactly <b>5 apart</b>?
      </div>
      <Stage>
        <Dots cols={5} rows={5} at={QG} r={13} />
        <Seg a={QG([0, 0])} b={QG([1, 0])} color={C.primary} width={9} opacity={mark} />
        <Lab at={[QG([0.5, 0])[0], QG([0, 0])[1] - 38]} color={C.primary} size={50} opacity={mark}>1</Lab>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1090, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} mark={ease(f, at(scene, 0, 0.5), 10)} />;
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

const KINDS = [
  { a: 3, b: 4, right: true, color: C.violet },
  { a: 3, b: 4, right: false, color: C.amber },
  { a: 4, b: 3, right: true, color: C.blue },
  { a: 4, b: 3, right: false, color: C.primary },
];
// every pair: kind + top-left corner of its box
const PAIRS = KINDS.flatMap((k) =>
  (k.a === 3 ? [[0, 0], [1, 0]] : [[0, 0], [0, 1]]).map(([x, y]) => ({ ...k, x, y })),
);
const ends = (p: { a: number; b: number; right: boolean; x: number; y: number }): [Pt, Pt] =>
  p.right ? [G([p.x, p.y]), G([p.x + p.a, p.y + p.b])] : [G([p.x + p.a, p.y]), G([p.x, p.y + p.b])];

const IU = 26;
const Slant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0);
  const t1 = at(scene, 1);
  const t2 = at(scene, 2);
  const brace = ease(f, at(scene, 0, 0.45), 12);
  const tri = ease(f, t1 + 4, 14);
  const second = f >= at(scene, 2, 0.3);
  const icons = at(scene, 2, 0.55);
  const [S, E] = ends(PAIRS[0]);
  const [S2, E2] = ends({ ...PAIRS[0], x: 1 });
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 70, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, t1) }}>
          Straight? Only <span style={{ color: C.red }}>4</span> long!
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, t1, 10) * fadeTo(f, t2) }}>
          A <span style={{ color: C.violet }}>3-4-5</span> slant
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, t2, 10) }}>
          <span style={{ color: C.amber }}>2 spots</span> × <span style={{ color: C.violet }}>4 slants</span>
        </div>
      </div>
      <Stage>
        {/* line 0: the top row is only 4 units long */}
        <g opacity={brace * fadeTo(f, t1 + 4)}>
          <Seg a={G([0, 0])} b={G([4, 0])} color={C.red} width={11} head="both" />
          <Lab at={[G([2, 0])[0], G([0, 0])[1] - 44]} color={C.red} size={56}>4 units</Lab>
        </g>
        {/* line 1: the 3-4-5 triangle */}
        <g opacity={tri * (second ? 0.3 : 1)}>
          <path d={`M ${S.join(' ')} L ${E[0]} ${S[1]} L ${E.join(' ')}`} fill="none" stroke={C.blue} strokeWidth={6} strokeDasharray="12 12" />
          <Seg a={S} b={E} color={C.violet} width={11} progress={ease(f, t1 + 8, 16)} />
          <Lab at={[(S[0] + E[0]) / 2, S[1] - 40]} color={C.blue} size={56}>3</Lab>
          <Lab at={[E[0] + 38, (S[1] + E[1]) / 2]} color={C.blue} size={56}>4</Lab>
          <Lab at={[(S[0] + E[0]) / 2 - 42, (S[1] + E[1]) / 2 + 28]} color={C.violet} size={64} opacity={ease(f, at(scene, 1, 0.55), 10)}>5</Lab>
        </g>
        {/* line 2: it fits twice side by side */}
        {second && (
          <g opacity={ease(f, at(scene, 2, 0.3), 6)}>
            <path d={`M ${S2.join(' ')} L ${E2[0]} ${S2[1]} L ${E2.join(' ')}`} fill="none" stroke={C.blue} strokeWidth={6} strokeDasharray="12 12" />
            <Seg a={S2} b={E2} color={C.amber} width={11} />
          </g>
        )}
        <Ring at={G([0, 0])} color={C.amber} opacity={ease(f, t1, 10) * fadeTo(f, t1 + 40)} r={30} />
        <Dots cols={5} rows={5} at={G} r={14} />
        {/* the four slants */}
        {KINDS.map((k, j) => {
          const w = k.a * IU, h = k.b * IU;
          const x0 = 150 + j * 210;
          const y0 = 1150;
          const Ss: Pt = [x0 + (k.right ? 0 : w), y0];
          const Ee: Pt = [x0 + (k.right ? w : 0), y0 + h];
          return (
            <g key={j} opacity={ease(f, icons + j * 6, 10)}>
              <path d={`M ${Ss.join(' ')} L ${Ee[0]} ${Ss[1]} L ${Ee.join(' ')}`} fill="none" stroke={C.blue} strokeWidth={4} strokeDasharray="8 8" />
              <Seg a={Ss} b={Ee} color={k.color} width={8} />
              <circle cx={Ss[0]} cy={Ss[1]} r={8} fill={C.ink} />
              <circle cx={Ee[0]} cy={Ee[1]} r={8} fill={C.ink} />
            </g>
          );
        })}
      </Stage>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.7);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>4 × 2 =</span>
          <Tex tex="8" size={96} color="#fff" />
          <span style={{ fontSize: 60, fontWeight: 900 }}>pairs</span>
        </div>
      </div>
      <Stage>
        {PAIRS.map((p, i) => {
          const [a, b] = ends(p);
          return <Seg key={i} a={a} b={b} color={p.color} width={9} progress={ease(f, 4 + i * 5, 14)} opacity={0.9} />;
        })}
        <Dots cols={5} rows={5} at={G} r={14} />
      </Stage>
      <Text x={540} y={1130} w={900} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        16 counts each pair twice
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:22" bullets={['Two ways to count them', 'Every trap explained', 'A bigger grid to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, slant: Slant, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

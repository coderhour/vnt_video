import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Circ, Dots, FOUR, Rings, SHAPE_COLOR, SLUG, SMALL, TICK, grid } from '../Composition';

export { SLUG };

const G = grid(540, 740, 150);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const show = [0, 6, 10, 11, 12, 13];
  const nope = at(scene, 1, 0.55);
  return (
    <>
      <Title>
        How many <span style={{ color: C.violet }}>circles</span>?
      </Title>
      <Stage>
        {show.map((k, i) => (
          <Circ key={i} g={G} pts={FOUR[k]} color={SHAPE_COLOR(k)} width={7} progress={ease(f, 24 + i * 14, 20)} />
        ))}
        <Dots g={G} r={14} />
      </Stage>
      <Text x={540} y={1110} w={900} size={120} weight={900} color={C.muted} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.3)), textDecoration: f > nope ? 'line-through' : 'none' }}>
        76?
      </Text>
      <Text x={540} y={1250} w={900} size={60} weight={900} color={C.violet} align="center" style={fadeUp(f, nope)}>
        Much smaller!
      </Text>
    </>
  );
};

const QG = grid(540, 800, 120);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>9 dots</b>. How many <b style={{ color: C.violet }}>different circles</b> pass through at least <b>3</b> of them?
      </div>
      <Stage>
        <Dots g={QG} r={13} />
        <Circ g={QG} pts={FOUR[12]} color={C.violet} progress={ease(f, 40, 24)} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1130, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
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

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.05 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const SQ = SMALL[3]; // corners (1,1) (2,1) (2,2) (1,2)
const MG = (i: number) => grid(540 + ((i % 7) - 3) * 112, i < 7 ? 1020 : 1130, 32);

const Repeat: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cyc = [at(scene, 1, 0.12), at(scene, 1, 0.9)] as const;
  const per = (cyc[1] - cyc[0]) / 4;
  const k = Math.min(3, Math.max(0, Math.floor((f - cyc[0]) / per)));
  const trip: Pt[] = SQ.filter((_, j) => j !== k);
  const cycling = f >= cyc[0] && f < at(scene, 2);
  const count = f < cyc[0] ? 0 : Math.min(4, k + 1);
  const tiles = at(scene, 2, 0.4);
  const title = f < at(scene, 1) ? <>76 groups of 3</> : f < at(scene, 2) ? <>Same circle!</> : f < at(scene, 3) ? <>14 circles, <span style={{ color: C.red }}>×4</span> each</> : <>Remove <span style={{ color: C.red }}>3</span> copies each</>;
  const small = f >= at(scene, 2, 0.35);
  return (
    <>
      <Title>{title}</Title>
      <Stage>
        <g opacity={small ? 0.5 : 1}>
          <Poly pts={SQ.map(G.at)} color={C.primary} width={6} fill={C.primary} fillOpacity={0.1} progress={ease(f, at(scene, 0, 0.5), 14)} />
          <Circ g={G} pts={SQ} color={C.violet} progress={ease(f, at(scene, 0, 0.6), 22)} width={8} />
          {cycling && <Poly pts={trip.map(G.at)} color={C.amber} width={6} dashed />}
          {cycling && <Rings g={G} pts={trip} color={C.amber} opacity={1} r={22} />}
          <Dots g={G} r={14} />
        </g>
        {FOUR.map((s, i) => {
          const p = ease(f, tiles + i * 4, 10);
          return (
            <g key={i} opacity={p}>
              <Circ g={MG(i)} pts={s} color={SHAPE_COLOR(i)} width={4} />
              <Dots g={MG(i)} r={4.5} />
            </g>
          );
        })}
      </Stage>
      {count > 0 && f < at(scene, 2, 0.35) && (
        <div style={{ position: 'absolute', left: 740, top: 560, fontSize: 80, fontWeight: 900, color: C.red }}>×{count}</div>
      )}
      <Text x={540} y={1230} w={900} size={64} weight={900} color={C.ink} align="center" style={fadeUp(f, at(scene, 3, 0.35))}>
        14 × 3 = <span style={{ color: C.red }}>42</span> extra
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          76 − 42 = 34
        </div>
      </div>
      <Stage>
        {FOUR.map((s, i) => (
          <Circ key={i} g={G} pts={s} color={SHAPE_COLOR(i)} width={4} opacity={0.45 * ease(f, hit + i * 2, 10)} />
        ))}
        <Dots g={G} r={14} />
      </Stage>
      <Text x={540} y={1130} w={900} size={72} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        34 circles
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={400} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:58" bullets={['Two ways to count the circles', 'Every trap explained', 'An eight-point puzzle to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, repeat: Repeat, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

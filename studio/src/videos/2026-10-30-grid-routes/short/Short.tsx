import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arrow, CHIME, CHOICES, Cross, HOOK_ROUTES, Num, Route, SLUG, Streets, TABLE, TICK, XC, passes, plane } from '../Composition';

export { SLUG };

const BIG = plane(165, 1030, 150); // 5 × 3 blocks: x 165…915, y 580…1030

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s0 = at(scene, 0, 0.1);
  const per = Math.round((scene.lines[0].frames * 0.8) / HOOK_ROUTES.length);
  const block = at(scene, 1, 0.2);
  const vanish = at(scene, 1, 0.55);
  return (
    <>
      <Text x={540} y={300} w={980} size={80} weight={900} color={C.violet} align="center" style={{ opacity: fadeTo(f, block, 0, 10) }}>
        56 routes to cross!
      </Text>
      <Text x={540} y={300} w={980} size={72} weight={900} color={C.red} align="center" style={fadeUp(f, block)}>
        Block ONE corner...
      </Text>
      <Stage>
        <Streets m={BIG} draw={1} labels={52} lo={1.1} xOpacity={ease(f, block, 10)} />
        {HOOK_ROUTES.map((r, i) => {
          const st = s0 + i * per;
          const bad = passes(r, XC);
          const ghost = f < st + per ? 1 : 0.35;
          const op = bad ? ghost * fadeTo(f, vanish, 0, 14) : ghost;
          return <Route key={r} m={BIG} route={r} color={bad && f >= block ? C.red : C.violet} progress={ease(f, st, per)} opacity={op} width={12} />;
        })}
        <Cross p={BIG(XC)} opacity={ease(f, block, 10)} size={70} />
      </Stage>
      <Text x={540} y={1130} w={900} size={62} weight={900} color={C.red} align="center" style={fadeUp(f, vanish)}>
        More than half vanish!
      </Text>
    </>
  );
};

const QG = plane(210, 1010, 120);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Mia walks <b style={{ color: C.primary }}>A to B</b>, only <b style={{ color: C.violet }}>right or up</b>, never through <b style={{ color: C.red }}>X</b>. <b>How many routes?</b>
      </div>
      <Stage>
        <Streets m={QG} labels={52} lo={1.1} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1120, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.1)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

// reveal order of the corner numbers: bottom row and left column first, then the inner corners by diagonal
const EDGE: Pt[] = [[0, 0], ...[1, 2, 3, 4, 5].map((x): Pt => [x, 0]), ...[1, 2, 3].map((y): Pt => [0, y])];
const INNER: Pt[] = [];
for (let d = 2; d <= 8; d++) for (let x = 1; x <= 5; x++) { const y = d - x; if (y >= 1 && y <= 3) INNER.push([x, y]); }

const Fill: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const edgeAt = (i: number) => at(scene, 0, 0.55) + i * 5;
  const innerStart = at(scene, 1, 0.1);
  const t11 = innerStart; // the demo corner (1,1) goes first, with its arrows
  const rest = INNER.filter((p) => !(p[0] === 1 && p[1] === 1));
  const span = scene.frames - 12 - at(scene, 2, 0.45);
  const restAt = (i: number) => at(scene, 2, 0.45) + Math.round((span * i) / rest.length);
  const items: { p: Pt; t: number }[] = [
    ...EDGE.map((p, i) => ({ p, t: edgeAt(i) })),
    { p: [1, 1], t: t11 + 40 },
    ...rest.map((p, i) => ({ p, t: restAt(i) })),
  ];
  const demo = f >= t11 && f < at(scene, 2, 0.3);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} color={C.primary} align="center" style={fadeUp(f, 0)}>
        Ways to reach each corner
      </Text>
      <Stage>
        <Streets m={BIG} labels={52} lo={1.1} />
        {demo && (
          <>
            <Arrow a={[BIG([0, 1])[0] + 46, BIG([1, 1])[1]]} b={[BIG([1, 1])[0] - 48, BIG([1, 1])[1]]} color={C.amber} opacity={ease(f, t11, 8)} />
            <Arrow a={[BIG([1, 0])[0], BIG([1, 0])[1] - 46]} b={[BIG([1, 1])[0], BIG([1, 1])[1] + 48]} color={C.amber} opacity={ease(f, t11, 8)} />
          </>
        )}
        {items.map(({ p, t }) => {
          const isX = p[0] === 2 && p[1] === 1;
          return <Num key={`${p}`} p={BIG(p)} value={TABLE[p[0]][p[1]]} s={pop(f, t, fps)} color={isX ? C.red : C.primary} />;
        })}
      </Stage>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1120, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Tex tex="\text{corner} = \text{left} + \text{below}" size={56} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>17 + 9 =</span>
          <span style={{ fontSize: 90, fontWeight: 900 }}>26</span>
        </div>
      </div>
      <Stage>
        <Streets m={BIG} labels={52} lo={1.1} />
        {EDGE.map((p) => <Num key={`${p}`} p={BIG(p)} value={TABLE[p[0]][p[1]]} s={1} color={C.primary} />)}
        {INNER.map((p) => {
          const isX = p[0] === 2 && p[1] === 1;
          const isB = p[0] === 5 && p[1] === 3;
          const hi = [[4, 3], [5, 2]].some((q) => q[0] === p[0] && q[1] === p[1]);
          return <Num key={`${p}`} p={BIG(p)} value={TABLE[p[0]][p[1]]} s={1} color={isX ? C.red : isB ? C.green : hi ? C.amber : C.primary} hi={isB} r={isB ? 48 : 40} />;
        })}
      </Stage>
      <Text x={540} y={1125} w={900} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        All routes = 56: that forgets X!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:26" bullets={['Two ways to count', 'Every trap explained', 'A 4 by 4 grid to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, fill: Fill, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

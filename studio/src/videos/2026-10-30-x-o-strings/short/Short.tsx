import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, XMark, makeGrid } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, GOOD, SLUG, T44, TICK, WalkGrid, WalkPath, Tiles, seq, walk, type Node } from '../Composition';

export { SLUG };

const SHUFFLE = ['XOXOXOXO', 'OXXOOXOX', 'XXOOOXXO', 'OOXXXOOX', 'XOOXOXXO', 'OXOXXOXO', GOOD];
const TL = 146; // left of an 8-tile row of 76 px tiles, centred on x 490
const G = makeGrid(200, 580, 150);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const settle = at(scene, 1);
  const k = f >= settle ? SHUFFLE.length - 1 : Math.min(SHUFFLE.length - 2, Math.floor(f / 12));
  const no = at(scene, 1, 0.45);
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        Can <span style={{ color: C.primary }}>X</span> stay ahead of <span style={{ color: C.violet }}>O</span>?
      </Text>
      <Tiles x={84} y={450} s={SHUFFLE[k]} size={100} gap={14} on={seq(f, 0, 14)} />
      <Text x={540} y={600} w={900} size={60} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.6))}>
        70 strings in all
      </Text>
      <Text x={540} y={720} w={900} size={110} weight={900} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.1)), textDecoration: f > no ? 'line-through' : undefined, textDecorationColor: C.red, textDecorationThickness: 12 }}>
        Half are good?
      </Text>
      <Stage>
        <XMark at={[540, 960]} size={150} opacity={ease(f, no, 8)} />
      </Stage>
      <Text x={540} y={1080} w={900} size={72} weight={900} color={C.red} align="center" style={fadeUp(f, no + 6)}>
        NOT even close!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        A string of <b style={{ color: C.primary }}>4 X’s</b> and <b style={{ color: C.violet }}>4 O’s</b>. Reading left to right, <b>X’s so far ≥ O’s so far</b>, always. <b>How many strings?</b>
      </div>
      <Tiles x={TL} y={770} s={GOOD} size={76} gap={10} />
      <div style={{ position: 'absolute', left: 60, top: 930, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={48} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.15)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

// Row 0 (ones) and row 1 are shown in the aha; the rest fills in during the reveal.
const v = (x: number, o: number) => T44[`${x},${o}`];

const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = at(scene, 0, 0.3);
  const p = interpolate(f, [a, at(scene, 0, 0.97)], [0, 1], clamp);
  const wall = ease(f, at(scene, 1, 0.35), 14);
  const fill = at(scene, 2, 0.2);
  const nodes: Node[] = [
    ...[0, 1, 2, 3, 4].map((x) => ({ x, o: 0, v: 1, at: fill + x * 5 })),
    ...[1, 2, 3, 4].map((x) => ({ x, o: 1, v: v(x, 1), at: at(scene, 2, 0.5) + (x - 1) * 12 })),
  ];
  const seen = (i: number) => (p * 8 > i ? 1 : 0.25);
  return (
    <>
      <Text x={540} y={300} w={980} size={64} weight={900} align="center" style={{ opacity: 1 - ease(f, at(scene, 1), 8) }}>
        <span style={{ color: C.primary }}>X</span> steps right · <span style={{ color: C.violet }}>O</span> steps down ↓
      </Text>
      <Text x={540} y={300} w={980} size={70} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.2)), opacity: ease(f, at(scene, 1, 0.2), 10) * (1 - ease(f, at(scene, 2), 8)) }}>
        Never cross the wall!
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 292, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.05)) }}>
        <Tex tex="\text{spot} = {\color{#0cc281}\text{left}} + {\color{#7b61ff}\text{above}}" size={64} />
      </div>
      <Tiles x={TL} y={410} s={GOOD} size={76} gap={10} on={(i) => ease(f, 0, 10) * (f < a ? 1 : seen(i))} />
      <Stage>
        <WalkGrid nx={4} no={4} g={G} wall={wall} start={0} nodes={nodes} />
        <WalkPath pts={walk(GOOD)} g={G} progress={p} color={C.primary} opacity={1 - ease(f, at(scene, 2), 12)} />
        <text x={G([0, 0])[0]} y={G([0, 0])[1] - 66} fontFamily="inherit" fontSize={40} fontWeight={900} fill={C.ink} textAnchor="middle" opacity={ease(f, 0, 10)}>
          start
        </text>
      </Stage>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const nodes: Node[] = [
    ...[0, 1, 2, 3, 4].map((x) => ({ x, o: 0, v: 1, at: -100 })),
    ...[1, 2, 3, 4].map((x) => ({ x, o: 1, v: v(x, 1), at: -100 })),
    { x: 2, o: 2, v: v(2, 2), at: t(0.05) },
    { x: 3, o: 2, v: v(3, 2), at: t(0.15) },
    { x: 4, o: 2, v: v(4, 2), at: t(0.25) },
    { x: 3, o: 3, v: v(3, 3), at: t(0.4) },
    { x: 4, o: 3, v: v(4, 3), at: t(0.6) },
    { x: 4, o: 4, v: v(4, 4), at: t(0.85) },
  ];
  const hit = t(0.85);
  const chime = t(1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 292, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, hit - 4) }}>
        <Tex tex="\text{spot} = {\color{#0cc281}\text{left}} + {\color{#7b61ff}\text{above}}" size={64} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 74, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>14 strings</div>
      </div>
      <Stage>
        <WalkGrid nx={4} no={4} g={G} wall={1} start={-100} nodes={nodes} corner={ease(f, hit, 12)} />
      </Stage>
      <Text x={540} y={430} w={900} size={64} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        14 of 70: one in five
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={9} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:49" bullets={['An organized list first', 'The table, step by step', 'Every wrong answer explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, walk: Walk, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

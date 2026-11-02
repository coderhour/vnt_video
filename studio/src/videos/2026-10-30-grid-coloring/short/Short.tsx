import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BLUE, Board, CHIME, CHOICES, CORN, EDGE, GRN, Out, RED, SLUG, TICK } from '../Composition';

export { SLUG };

const centerR = (size: number) => ({ C: { text: 'R', color: '#fff', o: 1, size } });
const EDGES = ['T', 'L', 'R', 'B'];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const o = ease(f, at(scene, 1, 0.1), 12);
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        Color the <span style={{ color: RED }}>g</span>
        <span style={{ color: BLUE }}>r</span>
        <span style={{ color: GRN }}>id</span>!
      </Text>
      <Stage>
        <Board ox={240} oy={460} s={200} fills={{ C: [[0, RED]] }} labels={centerR(84)} />
        <Out cells={EDGES} color={C.primary} o={o} ox={240} oy={460} s={200} />
      </Stage>
      <Text x={540} y={1110} w={900} size={56} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.25))}>
        touching squares must differ
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Each square is <b style={{ color: RED }}>red</b>, <b style={{ color: BLUE }}>blue</b> or <b style={{ color: GRN }}>green</b>. <b>Touching squares differ.</b> How many colorings?
      </div>
      <Stage>
        <Board ox={285} oy={570} s={170} fills={{ C: [[0, RED]] }} labels={centerR(72)} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1110, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={50} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const MS = 80;
/** One summary row: a mini board, its label, and the arithmetic. */
const Row: React.FC<{ y: number; fills: Record<string, [number, string][]>; corners: Record<string, string>; label: string; tex: string; start: number }> = ({ y, fills, corners, label, tex, start }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 12);
  const labels: Record<string, { text: string; color?: string; o: number; size?: number }> = { C: { text: 'R', color: '#fff', o: 1, size: 44 } };
  for (const [n, t] of Object.entries(corners)) labels[n] = { text: t, color: t === 'R' ? RED : C.ink, o: 1, size: 34 };
  return (
    <>
      <g opacity={o}>
        <Board ox={90} oy={y} s={MS} fills={{ C: [[0, RED]], ...fills }} labels={labels} />
      </g>
      <foreignObject x={360} y={y - 6} width={540} height={MS * 3 + 12} opacity={o} style={{ opacity: o }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 4 }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: C.muted }}>{label}</div>
          <Tex tex={tex} size={62} />
        </div>
      </foreignObject>
    </>
  );
};

const ROWS = [
  { y: 455, label: 'all 4 edges match', tex: '2\\times16=\\color{#21c45d}{32}', fills: { T: [[0, BLUE]], L: [[0, BLUE]], R: [[0, BLUE]], B: [[0, BLUE]] } as Record<string, [number, string][]>, corners: { TL: 'R/G', TR: 'R/G', BL: 'R/G', BR: 'R/G' } },
  { y: 725, label: 'edges take turns', tex: '2\\times1=\\color{#21c45d}{2}', fills: { T: [[0, BLUE]], R: [[0, GRN]], B: [[0, BLUE]], L: [[0, GRN]] } as Record<string, [number, string][]>, corners: { TL: 'R', TR: 'R', BL: 'R', BR: 'R' } },
  { y: 995, label: 'the other 12', tex: '12\\times4=\\color{#21c45d}{48}', fills: { T: [[0, BLUE]], L: [[0, BLUE]], R: [[0, BLUE]], B: [[0, GRN]] } as Record<string, [number, string][]>, corners: { TL: 'R/G', TR: 'R/G', BL: 'R', BR: 'R' } },
];

const Edges: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const fillAt = l1 + 6;
  const chip = ease(f, at(scene, 0, 0.55), 10) * (1 - ease(f, fillAt, 8));
  const big = fadeTo(f, l2 - 4, 0, 10);
  const same = ease(f, at(scene, 1, 0.4), 10);
  const diff = ease(f, at(scene, 1, 0.7), 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 68, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1) }}>
          Edges: <span style={{ color: BLUE }}>blue</span> or <span style={{ color: GRN }}>green</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 10) * fadeTo(f, l2 - 4) }}>
          Corner: do its edges <span style={{ color: C.primary }}>match</span>?
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 10) }}>
          Sort the 16 edge patterns
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: big }}>
        <Stage>
          <Board
            ox={255}
            oy={470}
            s={190}
            fills={{ C: [[0, RED]], T: [[fillAt, BLUE]], L: [[fillAt, BLUE]], R: [[fillAt, BLUE]], B: [[fillAt + 0, GRN]] }}
            chips={{ T: chip, L: chip, R: chip, B: chip }}
            labels={{
              C: { text: 'R', color: '#fff', o: 1, size: 80 },
              TL: { text: 'R / G', color: C.ink, o: same, size: 46 },
              TR: { text: 'R / G', color: C.ink, o: same, size: 46 },
              BL: { text: 'R', color: RED, o: diff, size: 64 },
              BR: { text: 'R', color: RED, o: diff, size: 64 },
            }}
          />
          <Out cells={['TL', 'TR']} color={CORN} o={same} ox={255} oy={470} s={190} />
          <Out cells={['BL', 'BR']} color={C.red} o={diff} ox={255} oy={470} s={190} />
        </Stage>
        <Text x={540} y={1070} w={900} size={52} weight={900} color={C.muted} align="center" style={{ opacity: same * (1 - diff) }}>
          match → 2 options
        </Text>
        <Text x={540} y={1070} w={900} size={52} weight={900} color={C.red} align="center" style={{ opacity: diff }}>
          differ → only red
        </Text>
      </div>
      <Stage>
        {ROWS.map((r, i) => (
          <Row key={i} y={r.y} fills={r.fills} corners={r.corners} label={r.label} tex={r.tex} start={at(scene, 2 + i, 0.05)} />
        ))}
      </Stage>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.78);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 40px', display: 'flex', alignItems: 'center' }}>
          <Tex tex={'32+48+2=82'} size={92} color="#fff" />
        </div>
      </div>
      <Stage>
        {ROWS.map((r, i) => (
          <Row key={i} y={r.y} fills={r.fills} corners={r.corners} label={r.label} tex={r.tex} start={-100} />
        ))}
      </Stage>
      <Text x={540} y={1262} w={900} size={46} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        81 is just a tempting guess ✗
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:51" bullets={['Edges first, then corners', 'A second way to double-check', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, edges: Edges, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

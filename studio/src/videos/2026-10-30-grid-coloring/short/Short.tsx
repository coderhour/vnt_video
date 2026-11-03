import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BLUE, Board, CHIME, CHOICES, GRN, Out, RED, SLUG } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: 3×3 grid, red centre, touching squares differ. Aha: colour the 4 edge squares first
// (blue/green, 16 patterns), then a corner has 2 options when its two edge neighbours match, else only red.
// 2 × 16 + 2 × 1 + 12 × 4 = 82 (D). Trap 16 = edges only, corners forgotten (the bank's choice note).

type Col = 'B' | 'G';
const HEX: Record<Col, string> = { B: BLUE, G: GRN };
const CORNERS: Record<string, [string, string]> = { TL: ['T', 'L'], TR: ['T', 'R'], BL: ['B', 'L'], BR: ['B', 'R'] };
const EDGES = ['T', 'L', 'R', 'B'];

/** A step of the aha: from frame `at`, these edges are coloured and these corners show their options. */
type Pat = { at: number; e: Partial<Record<string, Col>>; show: string[] };
const opts = (a?: Col, b?: Col) => (a && b ? (a === b ? `R / ${a === 'B' ? 'G' : 'B'}` : 'R') : '');

/** Board fills for a schedule of patterns (each edge's colour steps from pattern to pattern). */
const fillsOf = (pats: Pat[]) => {
  const fills: Record<string, [number, string | null][]> = { C: [[-100, RED]] };
  for (const n of EDGES) {
    // only step when the colour changes, so an edge that keeps its colour doesn't flash
    const steps: [number, string | null][] = [];
    for (const p of pats) {
      const c = p.e[n] ? HEX[p.e[n] as Col] : null;
      if (!steps.length || steps[steps.length - 1][1] !== c) steps.push([p.at, c]);
    }
    fills[n] = steps;
  }
  return fills;
};

/** Corner labels (+ outline opacities) for the pattern active at frame f. */
const cornersAt = (f: number, pats: Pat[], size: number) => {
  let cur: Pat | undefined;
  for (const p of pats) if (f >= p.at) cur = p;
  const labels: Record<string, { text: string; color?: string; o: number; size?: number }> = { C: { text: 'R', color: '#fff', o: 1, size: size * 1.2 } };
  const two: number[] = [];
  const one: number[] = [];
  for (const [k, [a, b]] of Object.entries(CORNERS)) {
    const t = cur && cur.show.includes(k) ? opts(cur.e[a], cur.e[b]) : '';
    const o = t && cur ? ease(f, cur.at + 6, 8) : 0;
    labels[k] = { text: t, color: t === 'R' ? RED : C.ink, o, size: t === 'R' ? size * 1.15 : size };
    two.push(t && t !== 'R' ? o : 0);
    one.push(t === 'R' ? o : 0);
  }
  return { labels, two, one };
};

const CK = Object.keys(CORNERS);
const SB = { ox: 270, oy: 525, s: 180 }; // the hook / reveal board (same place at frame 0 and the last frame)

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #27</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>16</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 780px">
        <Stage>
          <Board {...SB} fills={{ C: [[-100, RED]] }} labels={{ C: { text: 'R', color: '#fff', o: 1, size: 80 } }} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Each square is <b style={{ color: RED }}>red</b>, <b style={{ color: BLUE }}>blue</b> or <b style={{ color: GRN }}>green</b>. The center is red. <b style={{ color: C.violet }}>Touching squares differ.</b> How many colorings?
      </div>
      <Stage>
        <Board ox={375} oy={680} s={110} fills={{ C: [[-100, RED]] }} labels={{ C: { text: 'R', color: '#fff', o: 1, size: 60 } }} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1035, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.4 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** One readout chip under the board; shows the latest step whose frame has passed. */
const Readout: React.FC<{ steps: [number, React.ReactNode][] }> = ({ steps }) => {
  const f = useCurrentFrame();
  const i = steps.reduce((k, [s], j) => (f >= s ? j : k), -1);
  if (i < 0) return null;
  const [s, node] = steps[i];
  return (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 1165, display: 'flex', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${pop(f, s)})`, background: C.card, borderRadius: 26, padding: '12px 40px', boxShadow: '0 8px 24px rgba(30,40,80,0.12)', fontSize: 62, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        {node}
      </div>
    </div>
  );
};

const schedule = (scene: Scene): Pat[] => {
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  return [
    { at: l1 + 6, e: { T: 'B', L: 'B' }, show: ['TL'] },
    { at: at(scene, 1, 0.6), e: { T: 'B', L: 'G' }, show: ['TL'] },
    { at: l2 + 4, e: { T: 'B', L: 'B', R: 'B', B: 'B' }, show: CK },
    { at: at(scene, 2, 0.3), e: { T: 'G', L: 'G', R: 'G', B: 'G' }, show: CK },
    { at: at(scene, 2, 0.62), e: { T: 'B', R: 'G', B: 'B', L: 'G' }, show: CK },
    { at: l3 + 4, e: { T: 'B', L: 'B', R: 'B', B: 'G' }, show: CK },
    { at: at(scene, 3, 0.3), e: { T: 'B', R: 'B', L: 'G', B: 'G' }, show: CK },
    { at: at(scene, 3, 0.55), e: { T: 'G', L: 'B', R: 'G', B: 'G' }, show: CK },
  ];
};

const BB = { ox: 210, oy: 470, s: 220 }; // the big aha board

const Edges: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const pats = schedule(scene);
  const chipAt = (i: number) => at(scene, 0, 0.3) + i * 5;
  // B/G chips on the edges until each edge gets a colour (T, L at line 1; R, B at line 2)
  const chips = Object.fromEntries(EDGES.map((n, i) => [n, ease(f, chipAt(i), 8) * (1 - ease(f, n === 'T' || n === 'L' ? l1 + 6 : l2 + 4, 6))]));
  const { labels, two, one } = cornersAt(f, pats, 60);
  const zIn = l1 + 2;
  const zoom = 1 + 0.45 * ease(f, zIn, 12) - 0.45 * ease(f, l2, 10);
  const tally = (a: number, text: string, color: string) => (
    <span style={{ display: 'inline-block', marginLeft: 18, transform: `scale(${pop(f, a)})`, opacity: ease(f, a, 4), color }}>{text}</span>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {range(4).map((i) => <Sfx key={`c${i}`} at={chipAt(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {pats.map((p, i) => <Sfx key={`p${i}`} at={p.at} src={SFX.click} volume={0.28} />)}

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center', fontSize: 80, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1) }}>
          <span style={{ color: C.primary }}>Edges</span> first
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 8) * fadeTo(f, l2) }}>
          Then each <span style={{ color: C.violet }}>corner</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 8) }}>
          {tally(at(scene, 2, 0.45), '32', C.green)}
          {tally(at(scene, 2, 0.85), '+ 2', C.green)}
          {tally(at(scene, 3, 0.75), '+ 48', C.green)}
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '330px 600px' }}>
        <Stage>
          <Board {...BB} fills={fillsOf(pats)} chips={chips} labels={labels} />
          <Out cells={CK} color={C.primary} o={two} {...BB} />
          <Out cells={CK} color={RED} o={one} {...BB} />
        </Stage>
      </div>

      <Readout
        steps={[
          [at(scene, 0, 0.72), <Tex key="a" tex={'2\\times2\\times2\\times2 = 16'} size={64} />],
          [at(scene, 1, 0.3), <span key="b">match → <span style={{ color: C.primary }}>2 options</span></span>],
          [at(scene, 1, 0.62), <span key="c">differ → <span style={{ color: RED }}>only red</span></span>],
          [at(scene, 2, 0.33), <Tex key="d" tex={'2\\times16 = \\color{#21c45d}{32}'} size={64} />],
          [at(scene, 2, 0.8), <Tex key="e" tex={'2\\times1 = \\color{#21c45d}{2}'} size={64} />],
          [at(scene, 3, 0.65), <Tex key="f" tex={'12\\times4 = \\color{#21c45d}{48}'} size={64} />],
        ]}
      />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the small board (the same board, in the same place, as frame 0). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.79);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '8px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="82" size={104} color="#fff" />
          <span style={{ fontSize: 64, fontWeight: 900 }}>colorings</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 440, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.02)) }}>
        <Tex tex={'32 + 48 + 2'} size={64} color={C.green} />
      </div>
      <Stage>
        <Board
          {...SB}
          fills={{ C: [[-100, RED]], T: [[-100, BLUE]], L: [[-100, BLUE]], R: [[-100, BLUE]], B: [[-100, BLUE]], TL: [[-100, GRN]], TR: [[-100, RED]], BL: [[-100, RED]], BR: [[-100, GRN]] }}
          labels={{ C: { text: 'R', color: '#fff', o: 1, size: 80 } }}
        />
      </Stage>
      <Text x={490} y={1085} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        16 forgets the corners ✗
      </Text>
      <CtaPill start={at(scene, 2)} y={1180} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, edges: Edges, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

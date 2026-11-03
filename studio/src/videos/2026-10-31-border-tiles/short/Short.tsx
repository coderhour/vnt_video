import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BLUE, CH, CHIME, Floor, SLUG } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (4), question, comment bait, the list of floors (one floor morphing from 60 × 2 to 12 × 10
// with an edge readout and a zoom on 42 → 40), reveal over the same floor the hook opens on (loop match).

/** Every floor is laid out in the box x 60…920, top y 540, at most 640 tall. */
const BOX_CX = 490;
const BOX_Y = 540;
const cellFor = (l: number, w: number) => Math.min(860 / l, 640 / w);
const MAIN = { l: 12, w: 10, cell: cellFor(12, 10) }; // 64 px: the hook / reveal figure
const MAIN_X = BOX_CX - (MAIN.l * MAIN.cell) / 2;

/** The floor with no tile grid: blue ring one cell thick, white inside (the hook figure, no dimensions shown). */
const Plain: React.FC<{ x: number; y: number; l: number; w: number; cell: number; ring?: React.ReactNode; inside?: React.ReactNode }> = ({ x, y, l, w, cell, ring, inside }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: l * cell, height: w * cell, borderRadius: cell * 0.12, background: BLUE, padding: cell, boxSizing: 'border-box' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: l * cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: cell * 0.78, fontWeight: 900 }}>{ring}</div>
    <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 6, border: '2px solid #d3d9e6', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontWeight: 900, fontSize: cell * 1.15 }}>
      {inside}
    </div>
  </div>
);

const MainPlain: React.FC = () => <Plain x={MAIN_X} y={BOX_Y} l={MAIN.l} w={MAIN.w} cell={MAIN.cell} ring="40 blue" inside="80 white" />;

/** Opens on the floor (the same place the video ends on, so the loop cuts cleanly), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.78);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #15</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>4</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${BOX_CX}px 860px`}>
        <MainPlain />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 980, top: 760, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        A floor of 1-foot square tiles: <b style={{ color: BLUE }}>40 blue</b> on the edge, <b>80 white</b> inside. How many <b style={{ color: C.violet }}>feet longer</b> than wide?
      </div>
      <Plain x={540 - 6 * 34} y={620} l={12} w={10} cell={34} />
      <div style={{ position: 'absolute', left: 60, top: 1000, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
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
    <QuestionBody start={(i) => at(scene, 1, 0.35 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The floors with 120 tiles (verify.py: edge = 2L + 2(W − 2)), each shown as its edge count is spoken. */
const STEPS: { l: number; w: number; e: number; line: number; t: number }[] = [
  { l: 60, w: 2, e: 120, line: 1, t: 0.0 },
  { l: 40, w: 3, e: 82, line: 1, t: 0.6 },
  { l: 30, w: 4, e: 64, line: 2, t: 0.3 },
  { l: 24, w: 5, e: 54, line: 2, t: 0.48 },
  { l: 20, w: 6, e: 48, line: 2, t: 0.645 },
  { l: 15, w: 8, e: 42, line: 2, t: 0.78 },
  { l: 12, w: 10, e: 40, line: 3, t: 0.0 },
];

const ListScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const st = STEPS.map((s) => at(scene, s.line, s.t));
  const edgeAt = (i: number) => (i === 0 ? at(scene, 1, 0.3) : i === 1 ? at(scene, 1, 0.8) : i === 6 ? at(scene, 3, 0.36) : st[i]);
  let cur = -1;
  st.forEach((s, i) => { if (f >= s) cur = i; });
  let shownEdge = -1;
  STEPS.forEach((_, i) => { if (f >= edgeAt(i)) shownEdge = i; });
  const step = cur >= 0 ? STEPS[cur] : null;
  const zoomIn = st[4];
  const zoomOut = st[6] - 8;
  const zoom = 1 + 0.2 * ease(f, zoomIn, 12) - 0.2 * ease(f, zoomOut, 10);
  const inside = at(scene, 3, 0.52);
  const done = shownEdge === 6;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {st.map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.28} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={edgeAt(6)} src={SFX.click} volume={0.3} />
      {/* line 0: all the tiles */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.05)), opacity: ease(f, at(scene, 0, 0.05), 10) * fadeTo(f, st[0], 0, 6) }}>
        <Tex tex={'{\\color{#3b82f6}40} + 80 = 120\\ \\text{tiles}'} size={84} />
      </div>
      {f < st[0] && (
        <div style={{ opacity: ease(f, 0, 8) }}>
          <MainPlain />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${BOX_CX}px 420px` }}>
        {step && (
          <>
            <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, textAlign: 'center', fontSize: 96, fontWeight: 900, transform: `scale(${0.85 + 0.15 * pop(f, st[cur])})` }}>
              {step.l} × {step.w}
            </div>
            <Floor cols={step.l} rows={step.w} x={BOX_CX - (step.l * cellFor(step.l, step.w)) / 2} y={BOX_Y} cell={cellFor(step.l, step.w)} appear={1} />
          </>
        )}
        {step && (
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center' }}>
            {shownEdge === cur ? (
              <div style={{ transform: `scale(${0.8 + 0.2 * pop(f, edgeAt(shownEdge))})`, background: done ? C.green : C.red, color: '#fff', borderRadius: 24, padding: '4px 40px', fontSize: 70, fontWeight: 900, whiteSpace: 'nowrap' }}>
                edge = {STEPS[shownEdge].e} {done ? '✓' : '✗'}
              </div>
            ) : (
              <div style={{ background: C.card, color: C.muted, borderRadius: 24, padding: '4px 40px', fontSize: 70, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>edge = ?</div>
            )}
          </div>
        )}
      </div>
      {/* the 12 × 10 floor's inside: 10 × 8 = 80 white */}
      <div style={{ position: 'absolute', left: 0, width: 980, top: BOX_Y + 5 * MAIN.cell - 50, display: 'flex', justifyContent: 'center', ...fadeUp(f, inside) }}>
        <Tex tex="10 \times 8 = 80" size={84} color={C.ink} />
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same floor the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.55);
  const chime = at(scene, 0, 0.97);
  const cell = MAIN.cell;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, hit - 3, 0, 4) }}>
        <Tex tex="12 - 10" size={96} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="2" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>feet longer</span>
        </div>
      </div>
      <Floor cols={MAIN.l} rows={MAIN.w} x={MAIN_X} y={BOX_Y} cell={cell} />
      <div style={{ position: 'absolute', left: MAIN_X, width: MAIN.l * cell, top: BOX_Y, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 54, fontWeight: 900 }}>12</div>
      <div style={{ position: 'absolute', left: MAIN_X, width: cell, top: BOX_Y, height: MAIN.w * cell, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 50, fontWeight: 900 }}>10</div>
      <div style={{ position: 'absolute', left: 0, width: 980, top: BOX_Y + 110, display: 'flex', justifyContent: 'center' }}>
        <Tex tex="10 \times 8 = 80" size={64} color={C.muted} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 980, top: BOX_Y + 215, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.05)) }}>
        <Tex tex={'\\color{#ef4343}{4 \\to 9 \\times 13 = 117}'} size={56} />
      </div>
      <Text x={490} y={BOX_Y + 305} w={640} size={54} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.72))}>
        3 tiles short ✗
      </Text>
      <CtaPill start={at(scene, 2)} y={BOX_Y + 410} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={17} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, list: ListScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

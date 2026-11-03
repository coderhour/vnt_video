import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, Fig, LONG, LONG_T, MAIN, SHORT, SLUG, Walk } from '../Composition';

export { SLUG };

// New-recipe short (~38 s): trap-first hook (36), question, comment bait, measure in blocks (match the edges,
// zoom on one rectangle's 3 × 2 blocks, walk the 22-block outline), reveal 6 × 9 = 54 on the same figure.

/** Frame (scene-relative) where the first caption word of line `i` starting with `word` begins (WordCaptions' char weights). */
const cue = (scene: Scene, i: number, word: string) => {
  const ws = scene.lines[i].caption.split(/\s+/);
  const w = ws.map((s) => s.length + 2);
  const idx = Math.max(0, ws.findIndex((s) => s.startsWith(word)));
  return at(scene, i, w.slice(0, idx).reduce((a, b) => a + b, 0) / w.reduce((a, b) => a + b, 0));
};

// The big figure (hook, aha, reveal: same place, so the loop cuts cleanly): 6 × 5 blocks of 120 px, x 180…900.
const OX = 180;
const OY = 510;
const PX = 120;

/** A readout chip in the title slot. */
const Chip: React.FC<{ op: number; color?: string; children: React.ReactNode }> = ({ op, color = C.card, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ background: color, borderRadius: 26, padding: '10px 40px', boxShadow: '0 6px 22px rgba(30,40,80,0.1)', fontSize: 66, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 18 }}>{children}</div>
    </div>
  );

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, 'Nope');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #23</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>36</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 820px">
        <Fig tiles={MAIN} ox={OX} oy={OY} px={PX} outline={1} />
        <Text x={540} y={1128} w={900} size={60} weight={900} color={C.amber} align="center">
          perimeter = 66
        </Text>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 680, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
      <div style={{ position: 'absolute', left: 50, top: 280, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>5 identical rectangles</b> make a big one with <b style={{ color: C.amber }}>perimeter 66</b>. Area of one small rectangle?
      </div>
      <Fig tiles={MAIN} ox={300} oy={600} px={80} />
      <div style={{ position: 'absolute', left: 60, top: 1030, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} />
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

/** Thick coloured pieces over the top edge (2 long) and the bottom edge (3 short), popping one by one. */
const EdgeMatch: React.FC<{ top: number; bottom: number; op: number }> = ({ top, bottom, op }) => {
  const f = useCurrentFrame();
  if (op <= 0) return null;
  const seg = (a: number, b: number, y: number, c: string, s: number) => {
    const p = ease(f, s, 8);
    return p <= 0 ? null : <line key={`${a}-${y}`} x1={OX + a * PX + 8} x2={OX + a * PX + 8 + (b - a) * PX * p - 16 * p} y1={y} y2={y} stroke={c} strokeWidth={20} strokeLinecap="round" />;
  };
  return (
    <Stage>
      <g opacity={op}>
        {seg(0, 3, OY - 26, LONG, top)}
        {seg(3, 6, OY - 26, LONG, top + 8)}
        {seg(0, 2, OY + 5 * PX + 26, SHORT, bottom)}
        {seg(2, 4, OY + 5 * PX + 26, SHORT, bottom + 7)}
        {seg(4, 6, OY + 5 * PX + 26, SHORT, bottom + 14)}
      </g>
    </Stage>
  );
};

/** The aha: match the edges, then measure in blocks (zoom on one rectangle), then walk the 22-block outline. */
const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const top = cue(scene, 0, 'long');
  const bottom = cue(scene, 0, 'short');
  const l1 = at(scene, 1);
  const zIn = cue(scene, 1, 'short');
  const zOut = cue(scene, 1, 'The');
  const walk0 = cue(scene, 2, 'Walk');
  const walk1 = cue(scene, 2, 'make') - 4;
  const one = cue(scene, 2, 'One');
  const z = ease(f, zIn, 14) - ease(f, zOut, 12);
  const zoom = 1 + 0.3 * z;
  const tile0 = ease(f, zIn + 6, 10);
  const gridAll = ease(f, zOut + 6, 12);
  const dist = Math.max(0, Math.min(22, ((f - walk0) / (walk1 - walk0)) * 22));
  const blocks = Math.round(dist);
  const matchOp = fadeTo(f, l1, 0, 10);
  const blk = ease(f, one, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={top} src={SFX.click} volume={0.28} />
      <Sfx at={bottom} src={SFX.click} volume={0.28} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {[5, 11, 17].map((d) => <Sfx key={d} at={walk0 + ((walk1 - walk0) * d) / 22} src={SFX.click} volume={0.24} />)}
      <Sfx at={walk1} src={SFX.click} volume={0.3} />
      <Sfx at={one} src={SFX.click} volume={0.3} />
      <Chip op={ease(f, top, 8) * fadeTo(f, l1, 0, 6)}>
        <span style={{ color: LONG_T }}>2 long</span> = <span style={{ color: SHORT }}>3 short</span>
      </Chip>
      <Chip op={ease(f, l1, 8) * fadeTo(f, zOut, 0, 6)}>
        <span style={{ color: SHORT }}>short = 2</span>, <span style={{ color: LONG_T }}>long = 3</span>
      </Chip>
      <Chip op={ease(f, zOut, 8) * fadeTo(f, walk0, 0, 6)}>6 × 5 blocks</Chip>
      <Chip op={f >= walk0 && f < one ? 1 : 0}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{blocks}</span> blocks {f >= walk1 && <span style={{ color: C.amber }}>= 66</span>}
      </Chip>
      <Chip op={ease(f, one, 6)}>
        <Tex tex={'66\\div 22=3'} size={66} />
      </Chip>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${OX + 1.5 * PX}px ${OY}px` }}>
        <Fig tiles={MAIN} ox={OX} oy={OY} px={PX} outline={1} grid={range(5).map((i) => (i === 0 ? Math.max(tile0, gridAll) : gridAll))} op={range(5).map((i) => (i === 0 ? 1 : 1 - 0.6 * tile0 * (1 - gridAll)))} />
        <EdgeMatch top={top} bottom={bottom} op={matchOp} />
        <Walk ox={OX} oy={OY} px={PX} dist={dist} ghost={0} />
        {/* one rectangle measured: 3 blocks across, 2 down */}
        <div style={{ opacity: tile0 * (1 - gridAll) }}>
          <Text x={OX + 1.5 * PX} y={OY - 86} w={3 * PX} size={64} weight={900} color={LONG_T} align="center">3</Text>
          <Text x={OX - 50} y={OY + PX - 42} w={80} size={64} weight={900} color={SHORT} align="center">2</Text>
        </div>
        {/* the whole figure: 6 across, 5 down (on the left: the right edge is under the platform buttons) */}
        <div style={{ opacity: gridAll * fadeTo(f, walk0, 0, 8) }}>
          <Text x={OX + 3 * PX} y={OY - 92} w={6 * PX} size={68} weight={900} color={C.ink} align="center">6</Text>
          <Text x={OX - 54} y={OY + 2.5 * PX - 44} w={80} size={68} weight={900} color={C.ink} align="center">5</Text>
        </div>
        {/* one block lights up when it is worth 3 */}
        {blk > 0 && (
          <div style={{ position: 'absolute', left: OX + 6, top: OY + 6, width: PX - 12, height: PX - 12, borderRadius: 10, background: '#3c83f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 900, transform: `scale(${pop(f, one)})` }}>3</div>
        )}
      </div>
    </>
  );
};

/** The answer on the same figure, the trap, then the comment question + pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s6 = cue(scene, 0, '6');
  const l9 = cue(scene, 0, '9');
  const hit = cue(scene, 0, '54');
  const chime = at(scene, 0, 1);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 44px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 64, fontWeight: 900 }}>area</span>
          <Tex tex="6\times 9=54" size={84} color="#fff" />
        </div>
      </div>
      <Fig tiles={MAIN} ox={OX} oy={OY} px={PX} outline={1} emph={[ease(f, s6, 8), 0, 0, 0, 0]} />
      <div style={{ position: 'absolute', left: OX, top: OY, width: 3 * PX, height: 2 * PX, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 900, color: C.green, opacity: ease(f, hit, 4), transform: `scale(${pop(f, hit)})` }}>54</div>
      <Text x={OX + 1.5 * PX} y={OY - 86} w={3 * PX} size={64} weight={900} color={LONG_T} align="center" style={{ opacity: ease(f, l9, 6), transform: `scale(${pop(f, l9)})` }}>9</Text>
      <Text x={OX - 50} y={OY + PX - 42} w={80} size={64} weight={900} color={SHORT} align="center" style={{ opacity: ease(f, s6, 6), transform: `scale(${pop(f, s6)})` }}>6</Text>
      <Text x={540} y={1128} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        Trap: 36 = 6 × 6
      </Text>
      <CtaPill start={at(scene, 2)} y={1215} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={s6} src={SFX.click} volume={0.25} />
      <Sfx at={l9} src={SFX.click} volume={0.25} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={11} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, blocks: Blocks, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

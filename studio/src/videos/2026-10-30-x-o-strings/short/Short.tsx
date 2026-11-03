import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, Step, XMark, makeGrid, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BAD, CHIME, CHOICES, GOOD, SLUG, T44, Tiles, WalkGrid, WalkPath, walk, type Node } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: 35 (half of all 70 strings) is the trap, the walk grid + table fill is the aha, 14 is the answer.
// The same big grid sits at the same place in the hook (empty) and at the end of the reveal (filled), so the loop cuts cleanly.

const U = 160;
const G = makeGrid(200, 620, U); // spot (x, o) → px; corner (4, 4) at (840, 1260), clear of the right-side UI
const R = 58;
const FONT = 64;
const v = (x: number, o: number) => T44[`${x},${o}`];
const before = -100;
const TILES_X = (1080 - (8 * 76 + 7 * 10)) / 2;

/** Arrow into spot `to` from spot `from` (left or above), stopping at the circles' edges. */
const Into: React.FC<{ from: Pt; to: Pt; color: string; opacity: number }> = ({ from, to, color, opacity }) => {
  const [a, b] = [G(from), G(to)];
  const dx = Math.sign(b[0] - a[0]);
  const dy = Math.sign(b[1] - a[1]);
  if (opacity <= 0) return null;
  return (
    <g>
      <circle cx={a[0]} cy={a[1]} r={R + 9} fill="none" stroke={color} strokeWidth={9} opacity={opacity} />
      <Step a={[a[0] + dx * (R + 8), a[1] + dy * (R + 8)]} b={[b[0] - dx * (R + 10), b[1] - dy * (R + 10)]} label="" color={color} opacity={opacity} />
    </g>
  );
};

/** White readout chip in the empty lower-left corner (below the wall). */
const Readout: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 40, top: 1140, opacity, background: C.card, borderRadius: 24, padding: '10px 30px', boxShadow: '0 6px 20px rgba(30,40,80,0.10)', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap' }}>
      {children}
    </div>
  );

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  const [cx, cy] = G([4, 4]);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #24</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>35</span>?
      </Text>
      <PushIn frames={scene.frames} origin="520px 940px">
        <Stage>
          <WalkGrid nx={4} no={4} g={G} wall={1} start={before} corner={1} r={R} font={FONT} />
          <text x={cx} y={cy + 4} fontSize={68} fontWeight={900} fill={C.amber} textAnchor="middle" dominantBaseline="middle">?</text>
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 820, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        A string of <b style={{ color: C.primary }}>4 X’s</b> and <b style={{ color: C.violet }}>4 O’s</b>. Left to right, <b>X’s so far ≥ O’s so far</b>, always. <b>How many strings?</b>
      </div>
      <Tiles x={(1080 - (8 * 96 + 7 * 12)) / 2} y={700} s={GOOD} size={96} gap={12} />
      <div style={{ position: 'absolute', left: 60, top: 870, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 34px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.75 + i * 0.05)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1165} />
    </>
  );
};

/** The aha: each string is a walk, the walk never crosses the wall, and each spot = left + above. */
const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pA = at(scene, 0, 0.3);
  const pB = at(scene, 0, 0.95);
  const p = interpolate(f, [pA, pB], [0, 1], clamp);
  const k = Math.min(8, Math.floor(p * 8 + 0.001));
  const nX = GOOD.slice(0, k).split('').filter((c) => c === 'X').length;
  const badA = at(scene, 1, 0.05);
  const badP = interpolate(f, [badA, at(scene, 1, 0.4)], [0, 1], clamp);
  const badX = at(scene, 1, 0.45);
  const wall = ease(f, at(scene, 1, 0.6), 14);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const ones = (x: number) => at(scene, 2, 0.05) + x * 5;
  const zIn = at(scene, 2, 0.35);
  const zOut = at(scene, 3, 0.82);
  const zoom = 1 + 0.4 * ease(f, zIn, 12) - 0.4 * ease(f, zOut, 10);
  const blocked = at(scene, 3, 0.3);
  const copy = at(scene, 3, 0.62);
  const row1 = (x: number) => zOut + 6 + (x - 2) * 13;
  const nodes: Node[] = [
    ...[0, 1, 2, 3, 4].map((x) => ({ x, o: 0, v: 1, at: ones(x) })),
    { x: 1, o: 1, v: v(1, 1), at: copy },
    ...[2, 3, 4].map((x) => ({ x, o: 1, v: v(x, 1), at: row1(x) })),
  ];
  const calc = f >= row1(4) ? '3 + 1 = 4' : f >= row1(3) ? '2 + 1 = 3' : f >= row1(2) ? '1 + 1 = 2' : f >= copy ? '\\text{copy } 1' : null;
  const head = (a: number, b: number) => ease(f, a, 8) * fadeTo(f, b, 0, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[1, 3, 5, 7].map((i) => <Sfx key={i} at={pA + ((pB - pA) * i) / 8} src={SFX.click} volume={0.22} />)}
      <Sfx at={badX} src={SFX.click} volume={0.3} />
      {[0, 2, 4].map((x) => <Sfx key={`o${x}`} at={ones(x)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={copy} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {[2, 4].map((x) => <Sfx key={`r${x}`} at={row1(x)} src={SFX.click} volume={0.28} />)}

      {/* heading: one per line */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center', fontSize: 76, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: head(-100, at(scene, 1)) }}>
          <span style={{ color: C.primary }}>X</span> → right · <span style={{ color: C.violet }}>O</span> ↓ down
        </div>
        <div style={{ position: 'absolute', width: 1080, color: C.red, opacity: head(at(scene, 1, 0.05), l2) }}>Never cross the wall!</div>
        <div style={{ position: 'absolute', width: 1080, display: 'flex', justifyContent: 'center', top: 6, opacity: ease(f, l2, 8) }}>
          <Tex tex="\text{spot} = {\color{#0cc281}\text{left}} + {\color{#7b61ff}\text{above}}" size={70} />
        </div>
      </div>
      <Tiles x={TILES_X} y={410} s={GOOD} size={76} gap={10} on={(i) => ease(f, 0, 10) * fadeTo(f, badA, 0, 8) * (f < pA || p * 8 > i ? 1 : 0.3)} />
      <Tiles x={TILES_X} y={410} s={BAD} size={76} gap={10} on={(i) => ease(f, badA, 8) * fadeTo(f, l2, 0, 10) * (i < 3 ? 1 : 0.3)} ring={(i) => (i === 2 && f >= badX ? C.red : undefined)} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${G([1.5, 1])[0]}px ${G([1.5, 1])[1]}px` }}>
        <Stage>
          <WalkGrid nx={4} no={4} g={G} wall={wall} start={before} nodes={nodes} r={R} font={FONT} />
          <WalkPath pts={walk(GOOD)} g={G} progress={p} color={C.primary} opacity={fadeTo(f, badA, 0.3) * fadeTo(f, l2, 0, 10)} />
          <WalkPath pts={walk(BAD).slice(0, 4)} g={G} progress={badP} color={C.red} opacity={fadeTo(f, at(scene, 1, 0.75), 0)} />
          <XMark at={G([1, 2])} size={70} opacity={ease(f, badX, 6) * fadeTo(f, at(scene, 1, 0.75), 0)} />
          {/* the rule: arrows into (2, 1) from the left and from above */}
          <Into from={[1, 1]} to={[2, 1]} color={C.primary} opacity={ease(f, at(scene, 2, 0.45), 8) * fadeTo(f, l3, 0, 8)} />
          <Into from={[2, 0]} to={[2, 1]} color={C.violet} opacity={ease(f, at(scene, 2, 0.75), 8) * fadeTo(f, l3, 0, 8)} />
          {/* on the wall: the left spot is blocked, so copy the one above */}
          <XMark at={G([0, 1])} size={46} opacity={ease(f, blocked, 6) * fadeTo(f, zOut, 0)} />
          <Into from={[1, 0]} to={[1, 1]} color={C.violet} opacity={ease(f, at(scene, 3, 0.45), 8) * fadeTo(f, zOut, 0)} />
        </Stage>
      </div>
      <Sfx at={blocked} src={SFX.click} volume={0.25} />

      <Readout opacity={ease(f, pA, 8) * fadeTo(f, at(scene, 1), 0, 8)}>
        <span style={{ color: C.primary }}>X {nX}</span> · <span style={{ color: C.violet }}>O {k - nX}</span>
      </Readout>
      <Readout opacity={ease(f, at(scene, 2, 0.45), 8) * fadeTo(f, l3, 0, 6)}>
        <Tex tex="{\color{#0cc281}\text{left}} + {\color{#7b61ff}\text{above}}" size={60} />
      </Readout>
      <Readout opacity={ease(f, at(scene, 3, 0.25), 8) * fadeTo(f, copy, 0, 4)}>
        <span style={{ color: C.red }}>left blocked</span>
      </Readout>
      <Readout opacity={calc ? 1 : 0}>
        <Tex tex={calc ?? ''} size={64} />
      </Readout>
    </>
  );
};

/** Keep adding to the corner (14 pops on the spoken word), the trap, then the CTA pill over the same grid. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const hit = t(0.66);
  const chime = t(0.97);
  const steps: { x: number; o: number; at: number; tex: string }[] = [
    { x: 2, o: 2, at: t(0.04), tex: '\\text{copy } 2' },
    { x: 3, o: 2, at: t(0.16), tex: '2 + 3 = 5' },
    { x: 4, o: 2, at: t(0.28), tex: '5 + 4 = 9' },
    { x: 3, o: 3, at: t(0.42), tex: '\\text{copy } 5' },
    { x: 4, o: 3, at: hit, tex: '5 + 9 = 14' },
  ];
  const nodes: Node[] = [
    ...[0, 1, 2, 3, 4].map((x) => ({ x, o: 0, v: 1, at: before })),
    ...[1, 2, 3, 4].map((x) => ({ x, o: 1, v: v(x, 1), at: before })),
    ...steps.map((s) => ({ x: s.x, o: s.o, v: v(s.x, s.o), at: s.at })),
    { x: 4, o: 4, v: v(4, 4), at: hit + 6 },
  ];
  const cur = [...steps].reverse().find((s) => f >= s.at);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {steps.slice(0, 4).map((s, i) => <Sfx key={i} at={s.at} src={SFX.click} volume={0.25} />)}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '4px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="14" size={96} color="#fff" />
          <span style={{ fontSize: 68, fontWeight: 900 }}>strings</span>
        </div>
      </div>
      <Stage>
        <WalkGrid nx={4} no={4} g={G} wall={1} start={before} nodes={nodes} corner={ease(f, hit, 10)} r={R} font={FONT} />
      </Stage>
      <Readout opacity={cur ? fadeTo(f, at(scene, 1), 0, 6) : 0}>
        <Tex tex={cur?.tex ?? ''} size={64} />
      </Readout>
      <div style={{ position: 'absolute', left: 40, top: 1140, ...fadeUp(f, at(scene, 1, 0.05)), background: C.card, borderRadius: 24, padding: '10px 30px', boxShadow: '0 6px 20px rgba(30,40,80,0.10)', fontSize: 54, fontWeight: 900, color: C.red, whiteSpace: 'nowrap' }}>
        35 = half of 70 ✗
      </div>
      <CtaPill start={at(scene, 2)} y={418} />
      <Confetti x={540} y={350} start={chime} seed={9} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, walk: Walk, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

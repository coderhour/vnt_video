import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COUNTS, Coins, RunBox, SLUG } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (17/128), question, comment bait, the count table as the aha (zoom on 4 + 2 = 6,
// then the fast run to 68), reveal with CTA pill. Hook and reveal share the coin row, so the loop cuts cleanly.
// Word onsets below come from silencedetect on each line's WAV.

const before = () => -100;
const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...style }}>{children}</div>
);

/** The loop figure: a good 8-flip string with its streaks boxed (single green, double violet). */
const LOOP = 'HTTHHTHH';
const RUNS: [number, number][] = [[0, 0], [1, 2], [3, 4], [5, 5], [6, 7]];
const CR = 56;
const CG = 125;
const CX = 540 - 3.5 * CG;
const CY = 640;
const LoopFig: React.FC = () => (
  <>
    <Stage>
      {RUNS.map(([i, j], k) => <RunBox key={k} x={CX} y={CY} r={CR} gap={CG} i={i} j={j} color={i === j ? C.primary : C.violet} opacity={1} />)}
      <Coins s={LOOP} x={CX} y={CY} r={CR} gap={CG} />
    </Stage>
    <Text x={540} y={CY + 95} w={1000} size={52} weight={900} color={C.muted} align="center">8 flips, never 3 in a row</Text>
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 110 / 130); // "Nope" starts at frame 110 of 130
  return (
    <>
      <Center y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #55</div>
      </Center>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>17/128</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`540px ${CY}px`}>
        <LoopFig />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Center y={560} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Center>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A fair coin is <b style={{ color: C.blue }}>flipped 8 times</b>. Chance the same side <b style={{ color: C.violet }}>never comes up 3 times in a row</b>?
      </div>
      <Stage>
        <Coins s="????????" x={540 - 3.5 * 110} y={600} r={44} gap={110} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 675, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace('\\frac', '\\dfrac')} size={68} />
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
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1110} />
    </>
  );
};

// ---- the aha: good strings for 1..8 flips, each the sum of the two before ----
const CW = 230;
const CH = 190;
const GX = 540 - 2 * CW - 30;
const cardPos = (i: number) => [GX + (i % 4) * (CW + 20), 430 + Math.floor(i / 4) * (CH + 20)] as const;

const Card: React.FC<{ i: number; fill: number; ring?: string }> = ({ i, fill, ring }) => {
  const f = useCurrentFrame();
  const [x, y] = cardPos(i);
  const done = f >= fill;
  const last = i === 7 && done;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: CW, height: CH, borderRadius: 28, background: last ? C.green : C.card, boxShadow: ring ? `0 0 0 8px ${ring}` : '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 800, color: last ? '#fff' : C.muted }}>{i + 1} flip{i ? 's' : ''}</div>
      <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1.05, color: last ? '#fff' : done ? C.ink : C.muted, transform: `scale(${done ? pop(f, fill) : 1})` }}>{done ? COUNTS[i] : '?'}</div>
    </div>
  );
};

const Table: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  // card fill frames, on the spoken numbers
  const fill = [at(scene, 0) + 80, at(scene, 0) + 115, l1 + 105, l2 + 37, l2 + 52, l2 + 74, l2 + 98, l2 + 117];
  const zoomIn = at(scene, 0) + 50;
  const zoom = 1 + 0.35 * ease(f, zoomIn, 12) - 0.35 * ease(f, l2 + 2, 12);
  const single = l1 + 8;
  const dbl = l1 + 36;
  const ringFor = (i: number): string | undefined => {
    if (f >= l1 && f < fill[2] + 12) return i === 1 && f >= single ? C.primary : i === 0 && f >= dbl ? C.violet : undefined;
    const k = fill.findIndex((t, j) => j >= 3 && f >= t && f < t + 14);
    return k >= 3 && (i === k - 1 || i === k - 2) ? C.amber : undefined;
  };
  // the latest sum
  const last = [...fill.keys()].filter((j) => j >= 2 && f >= fill[j] - (j === 2 ? 30 : 0)).pop();
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2 + 2} src={SFX.whoosh} volume={0.25} />
      {fill.map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={i === 7 ? 0.3 : 0.24} />)}
      <Text x={540} y={270} w={1040} size={84} weight={900} align="center">
        Count the <span style={{ color: C.green }}>good</span> strings!
      </Text>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(400px 0 1050px 0)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `100px ${430 + CH / 2}px` }}>
          {fill.map((t, i) => <Card key={i} i={i} fill={t} ring={ringFor(i)} />)}
        </div>
      </div>
      {/* why it adds: a good 3-flip string ends in a single (after a good 2-flip string) or a double (after a good 1-flip string) */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 890, display: 'flex', justifyContent: 'center', gap: 24, opacity: fadeTo(f, l2, 0, 8) }}>
        <div style={{ ...fadeUp(f, single), background: C.primary, color: '#fff', borderRadius: 24, padding: '8px 30px', fontSize: 60, fontWeight: 900 }}>ends in a single: 4</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 990, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, l2, 0, 8) }}>
        <div style={{ ...fadeUp(f, dbl), background: C.violet, color: '#fff', borderRadius: 24, padding: '8px 30px', fontSize: 60, fontWeight: 900 }}>ends in a double: 2</div>
      </div>
      {last !== undefined && (
        <Center y={last === 2 ? 1095 : 940} style={{ opacity: last === 2 ? ease(f, fill[2] - 30, 8) * fadeTo(f, l2, 0, 8) : 1 }}>
          <div style={{ transform: `scale(${last === 2 ? 1 : 0.9 + 0.1 * pop(f, fill[last])})`, background: last === 7 ? C.green : C.card, borderRadius: 24, padding: '6px 36px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
            <Tex tex={last === 2 ? '4 + 2 = 6' : `${COUNTS[last - 2]} + ${COUNTS[last - 1]} = ${COUNTS[last]}`} size={last === 2 ? 72 : 84} color={last === 7 ? '#fff' : C.ink} />
          </div>
        </Center>
      )}
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 66 / 114); // "seventeen over sixty-four" starts near frame 66 of 114
  const chime = at(scene, 0, 104 / 114);
  const trap = at(scene, 1);
  return (
    <>
      <Center y={280}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 52px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{17}{64}'} size={96} color="#fff" />
        </div>
      </Center>
      <LoopFig />
      <Center y={845} style={{ ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Tex tex={'\\dfrac{68}{256}'} size={80} />
          <span style={{ opacity: ease(f, hit, 8) }}><Tex tex={'= \\dfrac{17}{64}'} size={80} color={C.green} /></span>
        </div>
      </Center>
      <Center y={1060} style={{ ...fadeUp(f, trap + 2) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: C.red, fontSize: 56, fontWeight: 900 }}>
          17/128 forgot the first side ✗
        </div>
      </Center>
      <CtaPill start={at(scene, 2)} y={1200} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, table: Table, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

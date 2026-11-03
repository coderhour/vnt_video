import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, GREEN, Kids, PAS, PIZ, SLUG, SOUP, groupsFor } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (16), question, comment bait, the "count the no's" aha on a big 8 × 3 kid grid
// (tags per food, a 4 + 6 + 8 readout, two zooms), then the answer, the trap and the CTA pill over the same grid.

const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

// The big kid grid (hook, aha, reveal): 8 columns × 3 rows, full width, above y≈900.
const BIG = { cols: 8, cell: 128, r: 56, cx: 540 - 3.5 * 128, cy: 580, fs: 54 } as const;
// The question's smaller grid.
const SMALL = { cols: 8, cell: 108, r: 47, cx: 540 - 3.5 * 108, cy: 680, fs: 44 } as const;

const before = () => -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #10</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>16</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 710px">
        <Kids {...BIG} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 610, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        <b>24 kids.</b> <b style={{ color: PIZ }}>20</b> like pizza, <b style={{ color: PAS }}>18</b> like pasta, <b style={{ color: SOUP }}>16</b> like soup. <b style={{ color: C.violet }}>Smallest number</b> who like all three?
      </div>
      <Kids {...SMALL} />
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: tag each "no" on its own kid, add them up, zoom in on the one-colour kids and on the untagged six. */
const Noes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const gs = [at(scene, 1, 0.03), at(scene, 1, 0.36), at(scene, 1, 0.68)];
  const tag = (k: number) => (k <= 4 ? gs[0] + (k - 1) * 4 : k <= 10 ? gs[1] + (k - 5) * 4 : gs[2] + (k - 11) * 3);
  const glow = (k: number) => l3 + 6 + (k - 19) * 4;
  const eighteen = at(scene, 2, 0.86);
  // zoom 1: onto the orange | blue kids while "no kid says no twice"; zoom 2: onto the six untagged kids
  const z1 = 0.4 * (ease(f, l2 + 8, 12) - ease(f, at(scene, 2, 0.72), 10));
  const z2 = 0.35 * (ease(f, l3, 12) - ease(f, at(scene, 3, 1) + 2, 10));
  const zoom = 1 + (f < l3 ? z1 : z2);
  const origin = f < l3 ? '410px 710px' : '668px 840px';
  const read = (tex: string, from: number, to: number) => (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 960, display: 'flex', justifyContent: 'center', opacity: ease(f, from, 6) * fadeTo(f, to, 0, 6) }}>
      <div style={{ background: C.card, borderRadius: 26, padding: '10px 40px', boxShadow: '0 6px 22px rgba(30,40,80,0.08)' }}>
        <Tex tex={tex} size={84} />
      </div>
    </div>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[1, 3, 5, 7, 9, 11, 13, 15, 17].map((k) => <Sfx key={k} at={tag(k)} src={SFX.click} volume={0.24} />)}
      {[19, 21, 23].map((k) => <Sfx key={`g${k}`} at={glow(k)} src={SFX.click} volume={0.3} />)}
      <Sfx at={l2 + 8} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l3} src={SFX.whoosh} volume={0.25} />
      <Text x={540} y={300} w={1000} size={92} weight={900} align="center" style={fadeUp(f, 0, 10)}>
        Count the <span style={{ color: C.red }}>no's</span>
      </Text>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: origin }}>
        <Kids {...BIG} groups={groupsFor(tag)} glow={{ from: 19, to: 24, start: glow }} />
      </div>
      {read(col(PIZ, '4'), gs[0], gs[1])}
      {read(`${col(PIZ, '4')} + ${col(PAS, '6')}`, gs[1], gs[2])}
      {read(`${col(PIZ, '4')} + ${col(PAS, '6')} + ${col(SOUP, '8')}`, gs[2], eighteen)}
      {read(`${col(PIZ, '4')} + ${col(PAS, '6')} + ${col(SOUP, '8')} = 18`, eighteen, l3 + 4)}
      {read(`24 - 18 = {\\color{${GREEN}}?}`, l3 + 4, 1e6)}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1110, textAlign: 'center', fontSize: 60, fontWeight: 900, color: C.violet, opacity: ease(f, at(scene, 2, 0.3), 8) * fadeTo(f, l3, 0, 6) }}>
        one no per kid
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1110, textAlign: 'center', fontSize: 60, fontWeight: 900, color: GREEN, opacity: ease(f, l3 + 8, 8) }}>
        yes to all three
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same grid (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.72);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="6" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>kids</span>
        </div>
      </div>
      <Kids {...BIG} groups={groupsFor(before)} glow={{ from: 19, to: 24, start: before }} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 925, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>
        <Tex tex={`24 - 18 = {\\color{${GREEN}}${f < hit ? '?' : '6'}}`} size={80} />
      </div>
      <Text x={540} y={1040} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        16 is the most, not the fewest
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, noes: Noes, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

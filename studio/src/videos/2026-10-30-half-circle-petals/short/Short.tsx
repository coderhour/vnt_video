import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Figure, Label, SLUG, arc, halves, path, plane } from '../Composition';

export { SLUG };

// New recipe (~38 s): trap-first hook (8π − 16 = the petals), question, comment bait, the "count twice" aha with a
// zoom onto one petal, then the answer. The hook and the reveal share one figure (M) so the loop cuts cleanly.

const M = plane(240, 1120, 150); // side 4 → 600 px, x 240…840, y 520…1120 (hook + reveal)
const A = plane(180, 1190, 180); // side 4 → 720 px, x 180…900, y 470…1190 (aha)
const ARC_COLORS = [C.blue, C.amber, C.primary, C.red];
const PETAL_MID: Pt[] = [[1, 1], [3, 1], [3, 3], [1, 3]]; // middles of the four petals (each inside two half circles)
const red4 = [1, 1, 1, 1];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84); // "Nope!" starts at 3.92 s of the 4.64 s line
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #49</div>
      </div>
      <Text x={540} y={385} w={1040} size={96} weight={900} align="center">
        Think it's <Tex tex="8\pi-16" size={96} color={C.red} />?
      </Text>
      <PushIn frames={scene.frames} origin="540px 820px">
        <Stage>
          <Figure m={M} petalHi={red4} petalHiColor={C.red} />
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

const QM = plane(310, 1040, 115); // side 4 → 460 px, y 580…1040
const tight = (c: string) => c.replace(' - ', '{-}'); // narrower chips so the five fit in two rows

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A <b style={{ color: C.primary }}>side 4</b> square, a <b style={{ color: C.blue }}>half circle</b> inside on each side, <b>4 white petals</b>. What is the <b style={{ color: C.violet }}>shaded area</b>?
      </div>
      <Stage>
        <Figure m={QM} sideLabel="4" />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1118, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 14px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 8, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={tight(c)} size={56} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />
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

/** The aha: add up the four half circles (8π), the square is only 16, so every petal was counted twice. */
const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const light = (i: number) => at(scene, 0, 0.06 + i * 0.2);
  const lit = [0, 1, 2, 3].map((i) => ease(f, light(i), 8) * fadeTo(f, i < 3 ? light(i + 1) : at(scene, 0, 0.9), 0, 8));
  const arcs = [0, 1, 2, 3].map((i) => ease(f, light(i), 8) * fadeTo(f, at(scene, 1, 0.3), 0, 10));
  const n = [0, 1, 2, 3].filter((i) => f >= light(i)).length;
  const sq = at(scene, 1, 0.12);
  const zIn = at(scene, 1, 0.45);
  const zOut = at(scene, 2);
  const z = ease(f, zIn, 14) - ease(f, zOut, 12);
  // zoom onto the bottom-left petal (both its half circles coloured) and slide it toward the middle
  const pm = A(PETAL_MID[0]);
  const zoomStyle = { transform: `translate(${(540 - pm[0]) * z}px, ${(900 - pm[1]) * z}px) scale(${1 + 0.45 * z})`, transformOrigin: `${pm[0]}px ${pm[1]}px` };
  const pair = ease(f, zIn, 10) * fadeTo(f, zOut + 6, 0, 10); // the petal's two half circles, during the zoom
  const two0 = ease(f, at(scene, 1, 0.68), 8);
  const twoAll = (k: number) => (k === 0 ? two0 : ease(f, zOut + 14 + (k - 1) * 8, 8));
  const eq = at(scene, 2, 0.45);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 1, 2, 3].map((i) => <Sfx key={i} at={light(i)} src={SFX.click} volume={0.25} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={at(scene, 1, 0.68)} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {[1, 2, 3].map((k) => <Sfx key={`t${k}`} at={zOut + 14 + (k - 1) * 8} src={SFX.click} volume={0.25} />)}
      <div style={{ position: 'absolute', inset: 0, clipPath: z > 0 ? 'inset(400px 30px 610px 30px)' : undefined }}>
      <div style={{ position: 'absolute', inset: 0, ...zoomStyle }}>
        <Stage>
          <Figure m={A} halfHi={[0, 1, 2, 3].map((i) => Math.max(lit[i], i < 2 ? pair : 0))} petalHi={[0, 1, 2, 3].map((k) => 0.8 * twoAll(k))} />
          {halves(4).map((h, i) => (
            <path key={i} d={path(arc(h.c, 2, h.a0, h.a1), A, false)} fill="none" stroke={ARC_COLORS[i]} strokeWidth={9} strokeLinecap="round" opacity={Math.max(arcs[i], i < 2 ? pair : 0)} />
          ))}
          {PETAL_MID.map((p, k) => <Label key={k} p={A(p)} text="×2" color={C.green} size={64} opacity={twoAll(k)} />)}
        </Stage>
      </div>
      </div>
      {/* readouts: the running total of the half circles, then the square next to it */}
      <div style={{ position: 'absolute', left: 30, width: 1020, top: 285, display: 'flex', justifyContent: 'center', gap: 26, opacity: fadeTo(f, zIn, 0, 8) + ease(f, zOut, 10) * (1 - ease(f, eq, 1)) }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 26, padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${n > 0 ? 1 + 0.1 * Math.max(0, 1 - (f - light(n - 1)) / 8) : 0})` }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>halves</span>
          <Tex tex={`${2 * Math.max(1, n)}\\pi`} size={80} color="#fff" />
        </div>
        <div style={{ background: C.red, color: '#fff', borderRadius: 26, padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${pop(f, sq)})` }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>square</span>
          <Tex tex="16" size={80} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: ease(f, zIn + 6, 8) * fadeTo(f, zOut, 0, 8) }}>
        <div style={{ background: C.green, color: '#fff', borderRadius: 26, padding: '12px 36px', fontSize: 64, fontWeight: 900 }}>in 2 half circles</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', ...fadeUp(f, eq, 10) }}>
        <div style={{ background: C.card, borderRadius: 26, padding: '12px 36px', boxShadow: '0 8px 30px rgba(30,40,80,0.1)' }}>
          <Tex tex={'8\\pi = \\color{#7b61ff}{16} + \\color{#21c45d}{\\text{petals}}'} size={84} />
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same figure as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.63); // "thirty-two" starts at ~2.85 s of the 4.5 s line
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const glow = ease(f, hit, 10) * fadeTo(f, trap, 0, 12);
  const redPetals = ease(f, trap, 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 44px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>shaded</span>
          <Tex tex="= 32-8\pi" size={100} color="#fff" />
        </div>
      </div>
      <Stage>
        <Figure m={M} shadeHi={glow} petalHi={[0, 1, 2, 3].map(() => Math.max(redPetals, 0.6 * fadeTo(f, hit, 0, 10) * ease(f, 6, 10)))} petalHiColor={redPetals > 0 ? C.red : C.green} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1140, display: 'flex', justifyContent: 'center', ...fadeUp(f, 6), opacity: ease(f, 6, 10) * fadeTo(f, trap, 0, 8) }}>
        <Tex tex={'\\text{petals} = 8\\pi - 16'} size={66} color={C.green} />
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1140, display: 'flex', justifyContent: 'center', ...fadeUp(f, trap + 4) }}>
        <Tex tex={'8\\pi - 16 \\text{ is just the petals}'} size={62} color={C.red} />
      </div>
      <CtaPill start={at(scene, 2)} y={1222} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, count: Count, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, Fig, Glow, Lbl, MAIN, SLUG, XArcs, ZPath, deg, pulse } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: 12 (BC, "it's parallel, so it's equal") is the trap, the angle chase to the hidden
// isosceles triangle ABF is the aha, AF = 10 is the answer. The same big figure sits at the same place in the
// hook (BC glowing red, "?" on AF) and at the end of the reveal (BC red, "10" on AF), so the loop cuts cleanly.

const g = MAIN;
const U = 53;
const P = (p: [number, number]): [number, number] => [80 + p[0] * U, 1090 - p[1] * U]; // top line x 186…1034, BC on y 1090
const pA = P(g.A);
const pB = P(g.B);
const pC = P(g.C);
const pF = P(g.F);
const midAF: [number, number] = [(pA[0] + pF[0]) / 2, pA[1] - 56];
const before = -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #38</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>12</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 880px">
        <Stage>
          <Glow a={pB} b={pC} op={1} color={C.red} />
          <Fig P={P} g={g} lens={[1, 1, 1]} />
          <Lbl p={midAF} t="?" color={C.amber} size={96} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 760, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse: pz = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        AB = AC = 10, BC = 12. The top line is <b style={{ color: C.amber }}>parallel</b> to BC. The <b style={{ color: C.violet }}>bisector</b> of ∠B meets it at F. <b style={{ whiteSpace: 'nowrap' }}>AF = ?</b>
      </div>
      <Stage>
        <Fig P={P} g={g} lens={[1, 1, 1]} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1190, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 12, scale: String(pz(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.8 + i * 0.04)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={820} />
    </>
  );
};

/** The aha: equal halves at B, the Z gives x at F (zoomed), so ABF is isosceles and AF = AB. */
const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const aBF = deg(g.B, g.F);
  const arcsB = at(scene, 0, 0.45);
  const zA = at(scene, 1, 0.05);
  const z = ease(f, zA, at(scene, 1, 0.45) - zA);
  const zIn = at(scene, 1, 0.2);
  const arcF = at(scene, 1, 0.6);
  const zOut = at(scene, 2, 0.02);
  const zoom = 1 + 0.35 * ease(f, zIn, 12) - 0.35 * ease(f, zOut, 10);
  const iso = at(scene, 2, 0.3);
  const done = ease(f, iso, 10);
  const wedge = ease(f, arcF, 12) * fadeTo(f, zOut, 0, 12);
  const row = (start: number, tex: string, y: number, size = 64, color?: string) => (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={arcsB} src={SFX.click} volume={0.28} />
      <Sfx at={arcsB + 8} src={SFX.click} volume={0.22} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={arcF} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={iso} src={SFX.click} volume={0.28} />
      <Sfx at={at(scene, 2, 0.65)} src={SFX.click} volume={0.28} />

      {row(arcsB + 4, '\\angle ABF = \\angle FBC = {\\color{#7b61ff}x}', 290)}
      {row(arcF + 4, '\\angle AFB = {\\color{#7b61ff}x}\\ \\text{(Z shape)}', 380)}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '700px 760px' }}>
        <Stage>
          <ZPath P={P} g={g} p={z} op={fadeTo(f, zOut, 0.25, 14)} />
          <Glow a={pA} b={pB} op={done} color={C.green} />
          <Glow a={pA} b={pF} op={done} color={C.green} />
          <path d={`M ${pA.join(' ')} L ${pB.join(' ')} L ${pF.join(' ')} Z`} fill={C.green} opacity={0.12 * done} />
          <Fig P={P} g={g} lens={[1, 1, 1]} />
          <XArcs P={P} g={g} r={80} b={ease(f, arcsB, 8)} bp={ease(f, arcsB, 16)} f={ease(f, arcF, 8)} fp={ease(f, arcF, 16)} s={1 + 0.15 * pulse(f, arcsB + 6, 20)} />
          <Arc v={pF} a0={180} a1={180 + aBF} r={80} color={C.amber} w={9} op={wedge * (0.6 + 0.4 * pulse(f, arcF, 40))} fill={C.amber} fillOp={0.35} />
          <Arc v={pB} a0={0} a1={aBF} r={80} color={C.amber} w={9} op={wedge * (0.6 + 0.4 * pulse(f, arcF, 40))} fill={C.amber} fillOp={0.35} />
        </Stage>
      </div>
      {row(at(scene, 2, 0.65), 'AF = AB', 465, 76, C.green)}
    </>
  );
};

/** AF = 10 pops on the spoken "ten", the trap (BC glows red), then the CTA pill over the same figure. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.84);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1, 0.05);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '0px 48px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="AF = 10" size={96} color="#fff" />
        </div>
      </div>
      <Stage>
        <Glow a={pB} b={pC} op={ease(f, trap, 8)} color={C.red} />
        <Glow a={pA} b={pB} op={1} color={C.green} />
        <Glow a={pA} b={pF} op={1} color={C.green} />
        <Fig P={P} g={g} lens={[1, 1, 1]} />
        <Lbl p={midAF} t="?" color={C.amber} size={96} op={fadeTo(f, hit, 0, 4)} />
        <Lbl p={midAF} t="10" color={C.green} size={96} op={ease(f, hit, 6)} s={pop(f, hit)} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1180, display: 'flex', justifyContent: 'center', ...fadeUp(f, trap) }}>
        <div style={{ background: C.card, borderRadius: 24, padding: '8px 32px', boxShadow: '0 6px 20px rgba(30,40,80,0.10)', fontSize: 56, fontWeight: 900, color: C.red, whiteSpace: 'nowrap' }}>
          BC = 12: parallel, not equal ✗
        </div>
      </div>
      <CtaPill start={at(scene, 2)} y={446} />
      <Confetti x={540} y={350} start={chime} seed={13} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chase: Chase, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BEST, CHIME, CHOICES, FLAT, Label, Ring, SLUG, Square, fitSide, plane, tri } from '../Composition';

export { SLUG };

// ~38 s: trap-first hook (√3/4 = the flat triangle), the question, comment bait, the pin-and-turn sweep with a live
// angle/side readout and a zoom onto the balanced 15° triangle, then the answer + CTA pill.
// The hook and the reveal show the same big square at the same place, so the loop cuts cleanly.

const BIG = plane(230, 1200, 620); // big square: x 230…850, y 580…1200
const before = -100;

const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, ...style }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.88);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #13</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 375, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, fontSize: 96, fontWeight: 900 }}>
        Think it's <Tex tex={'\\sqrt{3}/4'} size={92} color={C.red} />?
      </div>
      <PushIn frames={scene.frames} origin="540px 890px">
        <Stage>
          <Square at={BIG} />
          <Poly pts={FLAT.map(BIG)} color={C.primary} fill={C.primary} width={8} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 790, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QSQ = plane(370, 900, 340);

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number; pulse?: (i: number) => number }> = ({ start, mark, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Square with <b style={{ color: C.primary }}>side 1</b>. Area of the largest triangle with <b style={{ color: C.violet }}>3 equal sides</b> that fits inside?
      </div>
      <Stage>
        <Square at={QSQ} />
        <Label p={[QSQ([0.5, 0])[0], 900 + 42]} text="1" size={52} opacity={mark} />
        <Label p={[QSQ([1, 0])[0] + 40, QSQ([0, 0.5])[1]]} text="1" size={52} opacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 985, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={60} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={(i) => at(scene, 0, 0.5 + i * 0.08)} mark={ease(f, at(scene, 0, 0.12), 10)} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} mark={1} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: pin a corner and turn 0 → 30°, the side readout grows then shrinks; back to the peak at 15°, then zoom on the balance. */
const Turn: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sweep = [at(scene, 0, 0.85), at(scene, 1, 0.95)] as const;
  const l2 = at(scene, 2);
  const back = l2 + 2;
  const a = f < back ? interpolate(f, sweep, [0, 30], clamp) : interpolate(f, [back, back + 40], [30, 15], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const s = fitSide(a);
  const zIn = l2 + 48;
  const zOut = l2 + 104;
  const zoom = 1 + 0.3 * ease(f, zIn, 14) - 0.3 * ease(f, zOut, 12);
  const touch = ease(f, l2 + 56, 10);
  const peak = f >= back + 40;
  const fiveDeg = Array.from({ length: 6 }, (_, i) => interpolate((i + 1) * 5, [0, 30], sweep));
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.55)} src={SFX.click} volume={0.3} />
      {fiveDeg.map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.25} />)}
      <Sfx at={back} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.2} />
      <Center y={300} style={{ gap: 30, fontSize: 72, fontWeight: 900, ...fadeUp(f, 6) }}>
        <div style={{ background: C.card, borderRadius: 24, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
          turn <span style={{ color: C.amber, display: 'inline-block', width: 120, textAlign: 'right' }}>{Math.round(a)}°</span>
        </div>
        <div style={{ background: peak ? C.green : C.card, color: peak ? '#fff' : C.ink, borderRadius: 24, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
          side <span style={{ color: peak ? '#fff' : C.violet }}>{s.toFixed(3)}</span>
        </div>
      </Center>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${BIG([0.8, 0.8])[0]}px 960px` /* keeps the zoomed square above the captions */ }}>
        <Stage>
          <Square at={BIG} />
          <line x1={BIG([0, 0])[0]} y1={BIG([0, 0])[1]} x2={BIG([1, 1])[0]} y2={BIG([1, 1])[1]} stroke={C.muted} strokeWidth={5} strokeDasharray="16 14" opacity={ease(f, l2 + 30, 12)} />
          <Poly pts={tri(a, s).map(BIG)} color={C.violet} fill={C.violet} width={8} progress={ease(f, 2, 14)} />
          <circle cx={BIG([0, 0])[0]} cy={BIG([0, 0])[1]} r={24} fill={C.amber} opacity={ease(f, at(scene, 0, 0.55), 8)} />
          <Ring p={BIG(tri(15, fitSide(15))[1])} color={C.green} opacity={touch} />
          <Ring p={BIG(tri(15, fitSide(15))[2])} color={C.green} opacity={touch} />
        </Stage>
      </div>
      <Text x={540} y={1222} w={860} size={58} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, at(scene, 0, 0.5), 8) * fadeTo(f, zIn - 6, 0, 6) }}>
        Pin a corner, then turn
      </Text>
      <Text x={540} y={1222} w={860} size={58} weight={900} color={C.green} align="center" style={{ opacity: ease(f, zOut + 6, 8) }}>
        Biggest at 15°: balanced
      </Text>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same square as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.2); // "two" starts about 0.95 s into the line
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 64, fontWeight: 900 }}>Area =</span>
          <Tex tex="2\sqrt{3}-3" size={96} color="#fff" />
        </div>
      </div>
      <Stage>
        <Square at={BIG} />
        <Poly pts={FLAT.map(BIG)} color={f >= trap && f < at(scene, 2) ? C.red : C.primary} fill={C.primary} width={6} fillOpacity={0.12} />
        <Poly pts={BEST.map(BIG)} color={C.violet} fill={C.violet} width={8} progress={ease(f, 2, 14)} />
      </Stage>
      <Text x={540} y={1222} w={860} size={58} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, at(scene, 0, 0.6), 8) * fadeTo(f, trap, 0, 6) }}>
        ≈ 46% of the square
      </Text>
      <Center y={1205} style={{ opacity: ease(f, trap + 4, 8) * fadeTo(f, at(scene, 2), 0, 6), fontSize: 58, fontWeight: 900, color: C.red }}>
        flat <Tex tex={'\\sqrt{3}/4'} size={60} color={C.red} /> = the trap
      </Center>
      <CtaPill start={at(scene, 2)} y={1210} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, turn: Turn, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

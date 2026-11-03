import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ANSWER, CHIME, DERIVED, Fig, G1, GIVEN, SLUG, TRAP, angADC, angADE, angAED, angB60, angBAD, angDAE, angX, tri } from '../Composition';

export { SLUG };

// New recipe (see the geometric-triangle reference): trap-first hook (40 = angle DAE), question, comment bait,
// the angle chase big with a zoom onto D, then the answer, the trap and the CTA pill. The hook and the reveal use the
// same figure placement, so the last frame loops cleanly into frame 0.

const g = G1;
// The landscape figure has A at (455, 180) in Composition.tsx coordinates; Framed puts A at (cx, top), scaled by k.
const HERO = { k: 1.1, cx: 485, top: 590 };
const QK = { k: 0.68, cx: 490, top: 575 };
const Framed: React.FC<{ k: number; cx: number; top: number; children: React.ReactNode }> = ({ k, cx, top, children }) => (
  <g transform={`translate(${cx - 455 * k} ${top - 180 * k}) scale(${k})`}>{children}</g>
);
/** Screen position of a Composition.tsx point inside the hero frame (for zoom origins). */
const hero = (p: [number, number]) => [HERO.cx + (p[0] - 455) * HERO.k, HERO.top + (p[1] - 180) * HERO.k];

const LS = 52; // angle label size in figure units (57 px at the hero scale)

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #21</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>40°</span>?
      </Text>
      <PushIn frames={scene.frames} origin="485px 900px">
        <Stage>
          <Framed {...HERO}>
            <Fig g={g} ticks={1} angs={[angBAD(g, { color: GIVEN, op: 1, label: '20°', size: LS }), angDAE(g, { color: TRAP, op: 1, label: '40°', size: LS }), angX(g, { color: ANSWER, op: 1, label: 'x°', size: LS })]} />
          </Framed>
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

const CHOICES = ['10', '15', '20', '30', '40'];

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number; pulse?: (i: number) => number }> = ({ start, mark, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>Equilateral</b> triangle ABC, AD = AE, <b style={{ color: GIVEN }}>∠BAD = 20°</b>. What is <b style={{ color: ANSWER }}>x = ∠EDC</b>?
      </div>
      <Stage>
        <Framed {...QK}>
          <Fig g={g} ticks={mark} angs={[angBAD(g, { color: GIVEN, op: mark, label: '20°', size: 80 }), angX(g, { color: ANSWER, op: mark, label: 'x°', size: 80 })]} />
        </Framed>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1035, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${c}^\\circ`} size={68} />
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
      <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} mark={ease(f, at(scene, 0, 0.6), 12)} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    </>
  );
};

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} mark={1} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** Readout chip at the top that changes with each step of the chase. */
const Readout: React.FC<{ op: number; color: string; children: React.ReactNode }> = ({ op, color, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ background: C.card, border: `6px solid ${color}`, borderRadius: 28, padding: '10px 40px', fontSize: 76, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 8px 30px rgba(30,40,80,0.08)' }}>{children}</div>
    </div>
  );

const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const t0 = (t: number) => at(scene, 0, t);
  const t1 = (t: number) => at(scene, 1, t);
  // beats (estimated word positions in each line)
  const adcIn = t0(0.2); // "Angle A D C"
  const leftTri = t0(0.36); // "outside the left triangle"
  const sixty = t0(0.66); // "sixty plus twenty"
  const eighty = t0(0.93); // "eighty"
  const top40 = t1(0.58); // "forty"
  const base70 = t1(0.88); // "seventy"
  const xIn = at(scene, 2, 0.55); // "what's left for x"
  const zoomIn = t1(0.93);
  const zoomOut = l2 + 78;
  const zoom = 1 + 0.35 * ease(f, zoomIn, 14) - 0.35 * ease(f, zoomOut, 12);
  const [ox, oy] = hero(g.D);
  const xPulse = f >= xIn ? 1 + 0.25 * Math.max(0, Math.sin(((f - xIn) / 12) * Math.PI)) * (f < xIn + 24 ? 1 : 0) : 1;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[adcIn, leftTri, sixty, eighty, top40, base70, xIn].map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.27} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${ox + 110}px ${oy + 60}px` }}>
        <Stage>
          <Framed {...HERO}>
            <Fig
              g={g}
              ticks={1}
              shades={[
                { pts: tri(g.A, g.B, g.D), color: GIVEN, op: ease(f, leftTri, 10) * fadeTo(f, l1, 0, 10) },
                { pts: tri(g.A, g.D, g.E), color: DERIVED, op: ease(f, l1 + 4, 10) },
              ]}
              angs={[
                angBAD(g, { color: GIVEN, op: 1, label: '20°', size: LS }),
                angB60(g, { color: C.muted, op: ease(f, sixty, 8) * fadeTo(f, l1, 0, 10), label: '60°', size: LS }),
                angADC(g, { color: C.amber, op: ease(f, adcIn, 10), label: f >= eighty ? '80°' : '?', size: LS }),
                angDAE(g, { color: DERIVED, op: ease(f, top40, 10), label: '40°', size: LS }),
                angADE(g, { color: DERIVED, op: ease(f, base70, 10), label: '70°', size: LS }),
                angAED(g, { color: DERIVED, op: ease(f, base70, 10), label: '70°', size: LS }),
                { ...angX(g, { color: ANSWER, op: ease(f, xIn, 8), label: 'x°', size: LS * xPulse }), width: 12 },
              ]}
            />
          </Framed>
        </Stage>
      </div>
      <Readout op={ease(f, 0, 8) * fadeTo(f, sixty, 0, 4)} color={C.amber}>∠ADC = ?</Readout>
      <Readout op={ease(f, sixty, 6) * fadeTo(f, eighty, 0, 4)} color={C.amber}>
        ∠ADC = <span style={{ color: C.muted }}>60°</span> + <span style={{ color: GIVEN }}>20°</span>
      </Readout>
      <Readout op={ease(f, eighty, 6) * fadeTo(f, top40, 0, 4)} color={C.amber}>
        ∠ADC = <span style={{ color: C.amber }}>80°</span>
      </Readout>
      <Readout op={ease(f, top40, 6) * fadeTo(f, base70, 0, 4)} color={DERIVED}>
        top ∠DAE = <span style={{ color: DERIVED }}>40°</span>
      </Readout>
      <Readout op={ease(f, base70, 6) * fadeTo(f, l2, 0, 4)} color={DERIVED}>
        base angles = <span style={{ color: DERIVED }}>70°</span>
      </Readout>
      <Readout op={ease(f, l2, 6)} color={ANSWER}>
        x = <span style={{ color: C.amber }}>80°</span> − <span style={{ color: DERIVED }}>70°</span>
      </Readout>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same figure as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62); // "ten"
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 252, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '2px 50px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 76, fontWeight: 900 }}>x =</span>
          <Tex tex="10^\circ" size={96} color="#fff" />
        </div>
      </div>
      <Stage>
        <Framed {...HERO}>
          <Fig
            g={g}
            ticks={1}
            angs={[
              angBAD(g, { color: GIVEN, op: 1, label: '20°', size: LS }),
              angDAE(g, { color: TRAP, op: ease(f, trap, 8), label: '40°', size: LS * (1 + 0.2 * Math.max(0, Math.sin(((f - trap) / 14) * Math.PI)) * (f >= trap && f < trap + 14 ? 1 : 0)) }),
              angX(g, { color: ANSWER, op: 1, label: f >= hit ? '10°' : 'x°', size: LS }),
            ]}
          />
        </Framed>
      </Stage>
      <CtaPill start={at(scene, 2)} y={384} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chase: Chase, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

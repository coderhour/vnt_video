import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, XMark, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AcLab, CHIME, CHOICES, Dot, Fig, Fill, Lab, Ln, MidTicks, SLUG, StepTicks, Tk, add, cen, lerp, main } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (20 = the 2 : 1 copied onto A D), question, comment bait, the parallel-line aha
// (D F parallel to B E, count steps along A C, then A P : P D = 4 : 1) with zooms, then the answer over the
// same big figure the hook opens on (clean loop).

const g = main(0, 0); // 704 × 563 px, A at the top
/** The big figure: hook, aha and reveal use it at the same place. */
const K = 1.05;
const X = 100;
const Y = 570;
const sp = (p: Pt): Pt => [X + p[0] * K, Y + p[1] * K];

const At: React.FC<{ k: number; x: number; y: number; children: React.ReactNode }> = ({ k, x, y, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>{children}</g>
);

const before = () => -100;
const TRAP: Pt = [720, 850]; // reveal: where the trap label sits (screen px, outside A C)

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #50</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>20</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${sp(g.P)[0]}px ${sp(g.P)[1]}px`}>
        <Stage>
          <At k={K} x={X} y={Y}>
            <Fig g={g} />
            <Lab p={cen([g.A, g.B, g.P])} text="?" size={80} color={C.primary} />
          </At>
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

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Area of ABC is <b style={{ color: C.primary }}>60</b>. D is the midpoint of BC. <b style={{ color: C.violet }}>AE : EC = 2 : 1</b>. AD and BE meet at P. Area of <b style={{ color: C.primary }}>ABP</b>?
      </div>
      <Stage>
        <At k={0.75} x={226} y={700}>
          <Fig g={g} />
          <MidTicks g={g} op={1} />
          <StepTicks g={g} n={3} op={1} />
        </At>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1170, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 14px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 8, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={720} />
    </>
  );
};

const Chip: React.FC<{ color: string; opacity: number; scale?: number; children: React.ReactNode }> = ({ color, opacity, scale = 1, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 1225, display: 'flex', justifyContent: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, background: color, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 62, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );

/** The aha: A B D = 30, D F parallel to B E lands at the middle of E C, steps 4 : 1 along A C, so A P : P D = 4 : 1. */
const Ratio: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const half = ease(f, at(scene, 0, 0.1), 12) * fadeTo(f, at(scene, 1, 0.05), 0, 10);
  const thirty = at(scene, 0, 0.75);
  const df0 = at(scene, 1, 0.1);
  const fOn = at(scene, 1, 0.5);
  const mid = at(scene, 1, 0.78);
  const step0 = at(scene, 2, 0.28);
  const stepGap = 11;
  const stepAt = (i: number) => step0 + i * stepGap; // i = 0..3 the four A E steps, 4 = E F, 5 = F C
  const ad = at(scene, 3, 0.15);
  const zIn1 = at(scene, 1, 0.45);
  const zOut1 = at(scene, 2, 0.0);
  const zIn2 = at(scene, 3, 0.0);
  const zOut2 = at(scene, 3, 0.8);
  const z1 = ease(f, zIn1, 12) - ease(f, zOut1, 12);
  const z2 = ease(f, zIn2, 12) - ease(f, zOut2, 10);
  const zoom = 1 + 0.4 * z1 + 0.35 * z2;
  const origin = z2 > 0 ? sp(g.P) : sp(lerp(g.E, g.C, 0.5));
  const nSteps = [0, 1, 2, 3].filter((i) => f >= stepAt(i)).length;
  const stepLab = (i: number, text: string, color: string, out = 1) => (
    <Lab key={i} p={AcLab(g, (i + 0.5) / 6, 92)} text={text} color={color} size={60} opacity={ease(f, stepAt(i), 5) * out} />
  );
  const parts = ease(f, ad, 10);
  const P4 = lerp(g.A, g.D, 0.4);
  const P1 = lerp(g.P, g.D, 0.5);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={thirty} src={SFX.click} volume={0.3} />
      <Sfx at={zIn1} src={SFX.whoosh} volume={0.25} />
      <Sfx at={fOn} src={SFX.click} volume={0.28} />
      <Sfx at={mid} src={SFX.click} volume={0.25} />
      <Sfx at={zOut1} src={SFX.whoosh} volume={0.22} />
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} at={stepAt(i)} src={SFX.click} volume={i === 4 ? 0.3 : 0.22} />)}
      <Sfx at={zIn2} src={SFX.whoosh} volume={0.25} />
      <Sfx at={ad + 4} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${origin[0]}px ${origin[1]}px` }}>
        <Stage>
          <At k={K} x={X} y={Y}>
            <Fill pts={[g.A, g.B, g.D]} color={C.amber} opacity={half} fo={0.28} stroke={6} />
            <Fig g={g} shade={0} />
            <MidTicks g={g} op={ease(f, at(scene, 0, 0.1), 8)} />
            <Lab p={cen([g.A, g.B, g.D])} text="30" size={80} color={C.amber} opacity={ease(f, thirty, 6) * fadeTo(f, at(scene, 1, 0.05), 0, 10)} />
            {/* D F parallel to B E: both violet */}
            <Ln a={g.B} b={g.E} color={C.violet} width={8} opacity={ease(f, df0, 8)} />
            <Ln a={g.D} b={g.F} dashed color={C.violet} width={8} p={ease(f, df0 + 4, 26)} />
            <Dot p={g.F} color={C.violet} r={12} opacity={ease(f, fOn, 6)} />
            <Lab p={AcLab(g, 0.89, -50)} text="F" color={C.violet} size={56} opacity={ease(f, fOn, 6)} />
            <Tk a={g.E} b={g.F} opacity={ease(f, mid, 6)} color={C.violet} />
            <Tk a={g.F} b={g.C} opacity={ease(f, mid, 6)} color={C.violet} />
            {/* six equal steps along A C */}
            <StepTicks g={g} n={6} op={ease(f, step0 - 8, 8)} color={C.ink} />
            {[0, 1, 2, 3].map((i) => stepLab(i, String(i + 1), C.green))}
            {stepLab(4, '1', C.violet)}
            {stepLab(5, '1', C.muted, fadeTo(f, zIn2, 0, 8))}
            {/* A D in five parts: A P is four, P D is one */}
            <Ln a={g.A} b={g.P} color={C.green} width={12} p={parts} />
            <Ln a={g.P} b={g.D} color={C.amber} width={12} p={ease(f, ad + 8, 6)} />
            {[1, 2, 3, 4].map((k) => <Tk key={k} a={g.A} b={g.D} t={k / 5} opacity={parts} color={C.ink} len={16} />)}
            <Lab p={add(P4, -50, 6)} text="4" color={C.green} size={64} opacity={parts} />
            <Lab p={add(P1, -44, 4)} text="1" color={C.amber} size={60} opacity={ease(f, ad + 8, 6)} />
            <Dot p={g.P} color={C.green} r={13} opacity={parts} />
          </At>
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 280, width: 1080, height: 140, background: C.bg, opacity: Math.min(1, (zoom - 1) / 0.1) }} />
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: fadeTo(f, at(scene, 1) - 4, 0, 6) }}>
        <span style={{ color: C.amber }}>ABD</span> is half
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: ease(f, at(scene, 1), 8) * fadeTo(f, at(scene, 2) - 4, 0, 6) }}>
        <span style={{ color: C.violet }}>DF ∥ BE</span>
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: ease(f, at(scene, 2), 8) * fadeTo(f, at(scene, 3) - 4, 0, 6) }}>
        Count steps on <span style={{ color: C.violet }}>AC</span>
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: ease(f, at(scene, 3), 8) }}>
        Same split on <span style={{ color: C.green }}>AD</span>
      </Text>
      <Chip color={C.amber} opacity={ease(f, thirty, 8) * fadeTo(f, at(scene, 1, 0.05), 0, 8)}>ABD = 60 ÷ 2 = 30</Chip>
      <Chip color={C.violet} opacity={ease(f, mid + 6, 8) * fadeTo(f, at(scene, 2, 0.2), 0, 8)} scale={pop(f, mid + 6)}>EF = FC</Chip>
      <Chip color={nSteps === 4 && f >= stepAt(4) ? C.violet : C.green} opacity={ease(f, stepAt(0), 6) * fadeTo(f, at(scene, 3), 0, 6)}>
        {f >= stepAt(4) + 8 ? 'AE : EF = 4 : 1' : `AE = ${Math.max(1, nSteps)} step${nSteps > 1 ? 's' : ''}`}
      </Chip>
      <Chip color={C.green} opacity={ease(f, ad + 10, 6)} scale={pop(f, ad + 10)}>AP : PD = 4 : 1</Chip>
    </>
  );
};

/** The answer, the trap (2 : 1 copied onto A D), then the CTA pill, over the same figure the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 1);
  const trap = at(scene, 1);
  const tOp = ease(f, trap, 10);
  const P2 = lerp(g.A, g.D, 2 / 3);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 76, fontWeight: 900 }}>ABP =</span>
          <Tex tex={'\\dfrac{4}{5}\\times 30 = 24'} size={76} color="#fff" />
        </div>
      </div>
      <Stage>
        <At k={K} x={X} y={Y}>
          <Fig g={g} />
          <Lab p={cen([g.A, g.B, g.P])} text="24" size={80} color={C.green} opacity={ease(f, hit, 6)} />
          <g opacity={tOp}>
            <circle cx={P2[0]} cy={P2[1]} r={26} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="9 7" />
          </g>
        </At>
        {/* trap: 2 : 1 copied onto A D, label out to the right of A C with a leader to the wrong point */}
        <g opacity={tOp}>
          <Ln a={add(sp(P2), 26, -8)} b={TRAP} dashed color={C.red} width={5} />
          <Lab p={add(TRAP, 70, 0)} text="2 : 1" color={C.red} size={64} />
        </g>
        <XMark at={add(TRAP, 190, 0)} size={48} opacity={tOp} />
      </Stage>
      <CtaPill start={at(scene, 2)} y={1225} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, ratio: Ratio, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

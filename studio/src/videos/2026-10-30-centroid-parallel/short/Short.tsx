import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage, XMark, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Dot, Lab, Ln, Meds, SLUG, add, lerp, mkTri, outAB, outAC, type Tri } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (12, the halfway line), question, comment bait, the shrink-toward-A aha with zooms on G,
// then the answer over the same big triangle the hook opens on (clean loop).

/** The big triangle: hook, aha and reveal all use it, at the same place. */
const T = mkTri([370, 600], [70, 1100], [860, 1100]);
/** Smaller copy for the question card. */
const Q = mkTri([400, 650], [150, 990], [850, 990]);

const before = () => -100;

const Outline: React.FC<{ g: Tri; size?: number; aOp?: number }> = ({ g, size = 56, aOp = 1 }) => (
  <>
    <Poly pts={[g.A, g.B, g.C]} color={C.ink} width={7} />
    <Lab p={add(g.A, 0, -44)} text="A" size={size} opacity={aOp} />
    <Lab p={add(g.B, -40, 14)} text="B" size={size} />
    <Lab p={add(g.C, 40, 14)} text="C" size={size} />
  </>
);

/** Triangle + medians + G + E F, with the label over E F (`efText`), optionally the red halfway line (trap 12). */
const Figure: React.FC<{ efText: string; efColor: string; efOp?: number; trap?: number }> = ({ efText, efColor, efOp = 1, trap = 0 }) => (
  <Stage>
    <Outline g={T} />
    <Meds g={T} width={6} />
    <Ln a={T.E} b={T.F} color={C.violet} width={12} />
    <Dot p={T.E} color={C.violet} r={12} />
    <Dot p={T.F} color={C.violet} r={12} />
    <Lab p={outAB(T, 2 / 3, 50)} text="E" color={C.violet} size={56} />
    <Lab p={outAC(T, 2 / 3, 50)} text="F" color={C.violet} size={56} />
    <Dot p={T.G} r={15} color={C.amber} />
    <Lab p={add(T.G, -40, 48)} text="G" color={C.amber} size={56} />
    <Lab p={[475, 1152]} text="24" size={60} color={C.primary} />
    <Lab p={[565, 890]} text={efText} size={64} color={efColor} opacity={efOp} />
    {trap > 0 && (
      <g opacity={trap}>
        <Ln a={T.P} b={T.L} dashed color={C.red} width={8} />
        <Lab p={add(T.L, 85, -42)} text="12" color={C.red} size={64} />
        <XMark at={add(T.L, 175, -42)} size={50} opacity={1} />
      </g>
    )}
  </Stage>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #44</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>12</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${T.G[0]}px ${T.G[1]}px`}>
        <Figure efText="?" efColor={C.violet} />
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
  const g = Q;
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        The <b style={{ color: C.muted }}>medians</b> meet at <b style={{ color: C.amber }}>G</b>. <b style={{ color: C.primary }}>BC = 24</b>. <b style={{ color: C.violet }}>EF</b> runs through G, parallel to BC. How long is EF?
      </div>
      <Stage>
        <Outline g={g} size={50} />
        <Meds g={g} />
        <Ln a={g.E} b={g.F} color={C.violet} width={10} />
        <Lab p={outAB(g, 2 / 3, 46)} text="E" color={C.violet} size={50} />
        <Lab p={outAC(g, 2 / 3, 46)} text="F" color={C.violet} size={50} />
        <Dot p={g.G} r={13} color={C.amber} />
        <Lab p={add(g.G, 30, 38)} text="G" color={C.amber} size={50} />
        <Lab p={[(g.B[0] + g.C[0]) / 2, g.B[1] + 46]} text="24" size={54} color={C.primary} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1085, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
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
    <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={700} />
    </>
  );
};

const Chip: React.FC<{ y?: number; color: string; opacity: number; scale?: number; children: React.ReactNode }> = ({ y = 1200, color, opacity, scale = 1, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, background: color, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );

/** The aha: G splits the median 2 : 1, then the triangle shrinks toward A until M lands on G and B C on E F. */
const Shrink: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const ag = at(scene, 0, 0.2);
  const gm = at(scene, 0, 0.5);
  const s0 = at(scene, 1, 0.3);
  const s1 = at(scene, 2, 0.85);
  const s = interpolate(f, [s0, s1], [1, 2 / 3], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const sc = (p: Pt): Pt => lerp(g.A, p, s);
  const copy = ease(f, at(scene, 1, 0.1), 10);
  const landed = f >= s1;
  const zIn1 = at(scene, 0, 0.55);
  const zOut1 = at(scene, 1, 0.05);
  const zIn2 = at(scene, 2, 0.5);
  const zOut2 = at(scene, 3, 0.15);
  const zoom = 1 + 0.4 * (ease(f, zIn1, 12) - ease(f, zOut1, 12) + ease(f, zIn2, 14) - ease(f, zOut2, 12));
  const ef = ease(f, s1, 8);
  const ticks = [s0 + 12, s0 + 30, s0 + 48, s0 + 66, s0 + 84, s0 + 102];
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={ag} src={SFX.click} volume={0.28} />
      <Sfx at={gm} src={SFX.click} volume={0.28} />
      <Sfx at={zIn1} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut1} src={SFX.whoosh} volume={0.22} />
      {ticks.filter((t) => t < s1 - 6).map((t) => <Sfx key={t} at={t} src={SFX.click} volume={0.22} />)}
      <Sfx at={zIn2} src={SFX.whoosh} volume={0.25} />
      <Sfx at={s1} src={SFX.click} volume={0.3} />
      <Sfx at={zOut2} src={SFX.whoosh} volume={0.22} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${g.G[0]}px ${g.G[1]}px` }}>
        <Stage>
          {copy > 0 && <Poly pts={[g.A, sc(g.B), sc(g.C)]} color={C.violet} width={9} fill={C.violet} fillOpacity={0.14} opacity={copy} />}
          <Outline g={g} aOp={1 - (zoom - 1) / 0.4} />
          <Meds g={g} width={6} />
          <Ln a={g.A} b={g.G} color={C.violet} width={14} p={ease(f, ag, 14)} />
          <Ln a={g.G} b={g.M} color={C.amber} width={14} p={ease(f, gm, 12)} />
          <Lab p={add(lerp(g.A, g.G, 0.5), -70, 0)} text="2" color={C.violet} size={68} opacity={ease(f, ag + 8, 8) * (1 - copy)} />
          <Lab p={add(lerp(g.G, g.M, 0.5), 84, -18)} text="1" color={C.amber} size={68} opacity={ease(f, gm + 8, 8) * (1 - copy)} />
          <Ln a={g.E} b={g.F} color={C.violet} width={7} dashed opacity={0.7 * (1 - ef)} />
          <Ln a={g.E} b={g.F} color={C.violet} width={12} opacity={ef} />
          <Lab p={outAB(g, 2 / 3, 50)} text="E" color={C.violet} size={56} opacity={0.6 + 0.4 * ef} />
          <Lab p={outAC(g, 2 / 3, 50)} text="F" color={C.violet} size={56} opacity={0.6 + 0.4 * ef} />
          <Dot p={g.M} r={12} opacity={1 - copy} />
          <Lab p={add(g.M, 44, -36)} text="M" size={56} opacity={1 - copy} />
          {landed && <circle cx={g.G[0]} cy={g.G[1]} r={20 + 14 * pop(f, s1)} fill="none" stroke={C.green} strokeWidth={9} />}
          <Dot p={g.G} r={15} color={C.amber} />
          <Lab p={add(g.G, -40, 48)} text="G" color={C.amber} size={56} opacity={landed ? 0 : 1} />
          {copy > 0 && <Dot p={sc(g.M)} r={15} color={landed ? C.green : C.violet} opacity={copy} />}
          <Lab p={[475, 1152]} text="24" size={60} color={C.primary} opacity={1 - copy} />
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 280, width: 1080, height: 140, background: C.bg, opacity: Math.min(1, (zoom - 1) / 0.1) }} />
      <Text x={540} y={300} w={1000} size={88} weight={900} align="center" style={{ opacity: fadeTo(f, at(scene, 1) - 4, 0, 6) }}>
        G is <span style={{ color: C.violet }}>2/3</span> down
      </Text>
      <Text x={540} y={300} w={1000} size={88} weight={900} align="center" style={{ opacity: ease(f, at(scene, 1), 8) * fadeTo(f, at(scene, 3) - 4, 0, 6) }}>
        Shrink toward <span style={{ color: C.violet }}>A</span>
      </Text>
      <Text x={540} y={300} w={1000} size={88} weight={900} align="center" style={{ opacity: ease(f, at(scene, 3), 8) }}>
        Every length <span style={{ color: C.violet }}>× 2/3</span>
      </Text>
      <Chip color={C.violet} opacity={ease(f, gm + 10, 8) * fadeTo(f, at(scene, 1, 0.1), 0, 6)}>A to G : G to M = 2 : 1</Chip>
      <Chip color={landed ? C.green : C.violet} opacity={ease(f, at(scene, 1, 0.2), 8)} scale={landed ? pop(f, s1) : 1}>
        {landed ? 'size × 2/3' : f < s0 ? 'size × 1' : 'shrinking…'}
      </Chip>
    </>
  );
};

/** The answer, the trap (the halfway line), then the CTA pill, over the same triangle the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 1);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 76, fontWeight: 900 }}>EF =</span>
          <Tex tex={'\\dfrac{2}{3}\\times 24 = 16'} size={76} color="#fff" />
        </div>
      </div>
      <Figure efText="16" efColor={C.green} efOp={ease(f, hit, 6)} trap={ease(f, trap, 10)} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, shrink: Shrink, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

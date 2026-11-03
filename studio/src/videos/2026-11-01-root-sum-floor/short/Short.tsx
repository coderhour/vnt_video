import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, SLUG } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (19), question, comment bait, the nested squares (grow area k → k + 1, the
// strip is one gap thick, zoom on one strip, each term beats two gaps, all gaps reach √101, floor 18, ceiling 19),
// then 18. The nested squares sit at the same place in the hook and at the end of the reveal for a clean loop.

const FLOOR = C.primary;
const CEIL = C.violet;
const CHOICES = ['10', '17', '18', '19', '20'];
const SUM = '\\dfrac1{\\sqrt1}+\\dfrac1{\\sqrt2}+\\dfrac1{\\sqrt3}+\\cdots+\\dfrac1{\\sqrt{100}}';
const before = () => -100;

// ---- nested squares (the outer one, side √101, is not to scale) ----
const NU = 150;
const OX = 90;
const OY = 1190;
const SIDES = [1, 2, 3, 4, 5, 6].map((k) => NU * Math.sqrt(k));
const BIG = 680; // x 90…770, y 510…1190
const P = (x: number, y: number): [number, number] => [OX + x, OY - y];
const poly = (pts: [number, number][]) => `M ${pts.map((p) => p.join(' ')).join(' L ')} Z`;
const band = (s0: number, s1: number) => [P(s0, 0), P(s1, 0), P(s1, s1), P(0, s1), P(0, s0), P(s0, s0)];
const HI = 3; // the strip we zoom onto: area 3 → 4

const Nest: React.FC<{ show?: (i: number) => number; big?: number; hi?: number; color?: string; outline?: string }> = ({ show = () => 1, big = 1, hi = 0, color = FLOOR, outline = C.ink }) => (
  <Stage>
    {big > 0 && <path d={poly(band(SIDES[5], BIG))} fill={color} fillOpacity={0.16} stroke={outline} strokeWidth={7} strokeLinejoin="round" opacity={big} />}
    {big > 0 && [0, 1, 2].map((i) => <circle key={i} cx={P(SIDES[5] + 50 + i * 44, 0)[0]} cy={P(0, SIDES[5] + 50 + i * 44)[1]} r={10} fill={C.ink} opacity={big} />)}
    {SIDES.map((s, i) => {
      const o = show(i);
      if (o <= 0) return null;
      if (i === 0) return <path key={i} d={poly([P(0, 0), P(s, 0), P(s, s), P(0, s)])} fill={C.blue} fillOpacity={0.16} stroke={outline} strokeWidth={6} opacity={o} />;
      const h = i === HI ? hi : 0;
      return <path key={i} d={poly(band(SIDES[i - 1], s))} fill={h > 0 ? C.amber : color} fillOpacity={h > 0 ? 0.3 + 0.5 * h : i % 2 ? 0.5 : 0.22} stroke={outline} strokeWidth={6} strokeLinejoin="round" opacity={o} />;
    })}
  </Stage>
);

const NestLabels: React.FC<{ big?: number; one?: number }> = ({ big = 1, one = 1 }) => (
  <>
    <div style={{ position: 'absolute', left: OX + SIDES[0] / 2, top: OY - SIDES[0] / 2, transform: 'translate(-50%, -50%)', opacity: one }}>
      <Tex tex="\sqrt1" size={56} />
    </div>
    <div style={{ position: 'absolute', left: OX + BIG + 14, top: OY - BIG + 6, opacity: big }}>
      <Tex tex="\sqrt{101}" size={64} color={FLOOR} />
    </div>
  </>
);

const Chip: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Chip y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #10</div>
      </Chip>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>19</span>?
      </Text>
      <PushIn frames={scene.frames} origin="430px 850px">
        <Nest />
        <NestLabels />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Chip y={720}>
        <div style={{ opacity: ease(f, nope, 4), transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Chip>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Add these <b style={{ color: FLOOR }}>100</b> fractions. What's the <b style={{ color: C.violet }}>greatest whole number</b> at most the sum?
      </div>
      <Chip y={590}>
        <div style={{ whiteSpace: 'nowrap' }}>
          <Tex tex={SUM} size={62} />
        </div>
      </Chip>
      <div style={{ position: 'absolute', left: 60, top: 820, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.35 + i * 0.09)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1080} />
    </>
  );
};

/** Shows the last step whose start has passed, popping on each change. */
const Readout: React.FC<{ y: number; steps: [number, string, string][]; size?: number; chip?: boolean }> = ({ y, steps, size = 64, chip = true }) => {
  const f = useCurrentFrame();
  let k = -1;
  steps.forEach(([s], i) => { if (f >= s) k = i; });
  if (k < 0) return null;
  const [s, tex, col] = steps[k];
  return (
    <Chip y={y}>
      <div style={{ transform: `scale(${pop(f, s)})`, background: chip ? col : 'transparent', borderRadius: 24, padding: chip ? '6px 36px' : 0, whiteSpace: 'nowrap', boxShadow: chip ? '0 10px 26px rgba(30,40,80,0.15)' : undefined }}>
        <Tex tex={tex} size={size} color={chip ? '#fff' : col} />
      </div>
    </Chip>
  );
};

const Squeeze: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const grow = (i: number) => t(0, 0.04 + i * 0.09);
  const zoomIn = t(0, 0.62);
  const zoomOut = t(1, 0.75);
  const hi = ease(f, t(0, 0.55), 10) * fadeTo(f, zoomOut + 6, 0, 12);
  const bigAt = t(2, 0.05);
  const ceilAt = t(3, 0.05);
  // starts big on the small squares (1.65), pushes in on the strip (1.9), back out to 1 for the outer square
  const zoom = 1.65 + 0.25 * ease(f, zoomIn, 14) - 0.25 * ease(f, zoomOut, 14) - 0.65 * ease(f, bigAt - 4, 16);
  const [gx0, gx1] = [P(SIDES[HI - 1], 0)[0], P(SIDES[HI], 0)[0]];
  const gapOp = hi;
  const sideSteps: [number, string, string][] = SIDES.map((_, i) => [grow(i), `\\text{side }\\sqrt{${i + 1}}`, C.ink]);
  const ceilP = ease(f, ceilAt, 12);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {SIDES.map((_, i) => <Sfx key={i} at={grow(i)} src={SFX.click} volume={0.25} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={bigAt} src={SFX.click} volume={0.3} />
      <Sfx at={t(2, 0.6)} src={SFX.click} volume={0.3} />
      <Sfx at={ceilAt} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${OX}px ${OY}px` }}>
        <Nest show={(i) => ease(f, grow(i), 8)} big={ease(f, bigAt, 14)} hi={hi} outline={ceilP > 0 ? CEIL : C.ink} color={ceilP > 0 ? CEIL : FLOOR} />
        <NestLabels big={ease(f, bigAt, 14)} one={ease(f, grow(0) + 4, 8)} />
        <Stage>
          <path d={`M ${gx0} ${OY + 14} L ${gx1} ${OY + 14}`} stroke={C.amber} strokeWidth={6} strokeLinecap="round" opacity={gapOp} />
        </Stage>
        <div style={{ position: 'absolute', left: (gx0 + gx1) / 2, top: OY + 36, transform: 'translate(-50%, -50%)', opacity: gapOp }}>
          <Tex tex="g" size={56} color={C.amber} />
        </div>
        <div style={{ position: 'absolute', left: gx1 + 6, top: OY - SIDES[HI] / 2, transform: 'translate(0, -50%)', opacity: gapOp * ease(f, t(0, 0.75), 8), whiteSpace: 'nowrap', fontSize: 30, fontWeight: 900, color: '#fff', background: C.amber, borderRadius: 12, padding: '2px 12px' }}>
          area 1
        </div>
      </div>
      <Readout
        y={290}
        steps={[
          ...sideSteps,
          [zoomIn, '\\text{area }k\\to k+1', C.ink],
          [t(1, 0.05), '\\dfrac1{\\sqrt k}>2g', C.amber],
          [bigAt, '\\text{side }1\\to\\sqrt{101}', FLOOR],
          [ceilAt, '\\text{inside strips: ceiling}', CEIL],
        ]}
      />
      <Readout
        y={405}
        chip={false}
        size={60}
        steps={[
          [t(2, 0.6), '\\text{sum}>2(\\sqrt{101}-1)>18', FLOOR],
          [t(3, 0.35), '\\text{sum}<1+2(10-1)=19', CEIL],
        ]}
      />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  return (
    <>
      <Chip y={290}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '8px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>C</span>
          <Tex tex="18" size={104} color="#fff" />
        </div>
      </Chip>
      <Chip y={425}>
        <div style={fadeUp(f, 2)}>
          <Tex tex="18<\text{sum}<19" size={60} color={C.green} />
        </div>
      </Chip>
      <Nest />
      <NestLabels />
      <div style={{ position: 'absolute', left: 800, width: 250, top: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, ...fadeUp(f, trap) }}>
        <div style={{ position: 'relative' }}>
          <Tex tex="19" size={130} color={C.red} />
          <div style={{ position: 'absolute', left: -14, right: -14, top: '50%', height: 11, borderRadius: 6, background: C.red, transform: 'rotate(-14deg)' }} />
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.red, opacity: ease(f, at(scene, 1, 0.45), 8) }}>too high</div>
      </div>
      <CtaPill start={at(scene, 2)} y={1215} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, squeeze: Squeeze, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BASE, CHIME, D_IN, D_SLANT, Grid, Label, SLUG, classify, plane, type DotSpec } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (12), question, comment bait, the twin-triangle square on the 6 by 6 triangle
// (25 inside, 5 on the slant, 10 each), then 6 pairs → flip → 11. The 6 by 6 triangle sits at the same place in the
// hook and at the end of the reveal (grey in the hook, coloured at the end) so the loop cuts cleanly.

const CHOICES = ['5', '6', '10', '11', '12'];
const AMBER = C.amber;
const before = () => -100;

// ---- the main figure: the 6 by 6 triangle, big ----
const N = 6;
const fm = plane(250, 1100, 96); // x 250…826, y 524…1100
const isInterior = (x: number, y: number) => x > 0 && y > 0 && x < N && y < N;
const isSlant = (x: number, y: number) => classify(N, N, x, y) === 'slant';
const isTwin = (x: number, y: number) => isInterior(x, y) && x + y > N;
const GREY_DOT: DotSpec = { fill: BASE, r: 10 };
const solved = (x: number, y: number): DotSpec =>
  classify(N, N, x, y) === 'in' ? { ...D_IN, r: 19 } : isSlant(x, y) ? { ...D_SLANT, r: 20 } : GREY_DOT;

const path = (pts: Pt[]) => `M ${pts.map((p) => fm(p).join(' ')).join(' L ')} Z`;
const TRI: Pt[] = [[0, 0], [N, 0], [0, N]];
const SQUARE: Pt[] = [[0, 0], [N, 0], [N, N], [0, N]];

const Triangle: React.FC<{ spec: (x: number, y: number) => DotSpec; children?: React.ReactNode }> = ({ spec, children }) => (
  <Stage>
    <path d={path(TRI)} fill={C.primary} fillOpacity={0.08} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
    {children}
    <Grid cols={N} rows={N} m={fm} spec={spec} />
  </Stage>
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
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #3</div>
      </Chip>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>12</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 812px">
        <Triangle spec={() => GREY_DOT} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Chip y={700}>
        <div style={{ opacity: ease(f, nope, 4), transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Chip>
    </>
  );
};

// ---- question: a 5 by 6 example triangle with its 10 dots ----
const QP = 5;
const QQ = 6;
const qm = plane(375, 1030, 68);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Corners <b>(0, 0)</b>, <b style={{ color: C.primary }}>(p, 0)</b>, <b style={{ color: C.violet }}>(0, q)</b>. Exactly <b>10</b> dots <b>strictly inside</b>. How many ordered pairs <b>(p, q)</b>?
      </div>
      <Stage>
        <path d={`M ${[qm([0, 0]), qm([QP, 0]), qm([0, QQ])].map((p) => p.join(' ')).join(' L ')} Z`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
        <Grid cols={QP} rows={QQ} m={qm} spec={(x, y) => (classify(QP, QQ, x, y) === 'in' ? { ...D_IN, r: 13 } : { fill: BASE, r: 7 })} />
        <Label p={[qm([QP, 0])[0], qm([0, 0])[1] + 46]} text="p" color={C.primary} size={60} />
        <Label p={[qm([0, 0])[0] - 46, qm([0, QQ / 2])[1]]} text="q" color={C.violet} size={60} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1085, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
      <CommentBubble />
    </>
  );
};

// ---- aha: the twin triangle makes a 6 by 6 square ----
const INTERIOR: Pt[] = [];
for (let y = N - 1; y >= 1; y--) for (let x = 1; x < N; x++) INTERIOR.push([x, y]);
const SLANT: Pt[] = INTERIOR.filter(([x, y]) => isSlant(x, y));
const PAIRS: [number, number][] = [[2, 21], [2, 22], [3, 11], [3, 12], [5, 6], [6, 6]];

/** Shows the last readout whose start has passed, popping on each change. */
const Readout: React.FC<{ y: number; steps: [number, React.ReactNode, string][] }> = ({ y, steps }) => {
  const f = useCurrentFrame();
  let k = -1;
  steps.forEach(([s], i) => { if (f >= s) k = i; });
  if (k < 0) return null;
  const [s, node, bg] = steps[k];
  return (
    <Chip y={y}>
      <div style={{ transform: `scale(${pop(f, s)})`, background: bg, color: '#fff', borderRadius: 26, padding: '10px 44px', fontSize: 76, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 12px 30px rgba(30,40,80,0.15)' }}>{node}</div>
    </Chip>
  );
};

const Square: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const twinIn = t(0, 0.08);
  const fill0 = t(0, 0.55);
  const appear = (i: number) => fill0 + i * 1.2;
  const slant0 = t(1, 0.08);
  const slantAt = (k: number) => slant0 + k * 5;
  const zoomIn = t(1, 0.02);
  const split = t(1, 0.55);
  const zoomOut = t(1, 0.5);
  const twinOut = t(2, 0.02);
  const chipAt = (i: number) => t(2, 0.12) + i * 5;
  const twinOp = ease(f, twinIn, 14) * fadeTo(f, twinOut, 0, 12);
  const zoom = 1 + 0.3 * ease(f, zoomIn, 12) - 0.3 * ease(f, zoomOut, 12);
  const spec = (x: number, y: number): DotSpec => {
    const idx = INTERIOR.findIndex(([a, b]) => a === x && b === y);
    if (idx < 0) return GREY_DOT;
    const sk = SLANT.findIndex(([a, b]) => a === x && b === y);
    if (sk >= 0 && f >= slantAt(sk)) return { ...D_SLANT, r: 20 };
    if (isTwin(x, y) && f >= twinOut) return { ...GREY_DOT, opacity: 0.5 + 0.5 * ease(f, twinOut, 10) };
    if (isTwin(x, y) && f >= split) return { fill: AMBER, r: 19 };
    if (f >= appear(idx)) return { ...D_IN, r: 19 };
    return GREY_DOT;
  };
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {Array.from({ length: 9 }, (_, i) => <Sfx key={i} at={appear(i * 3)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      {SLANT.map((_, k) => <Sfx key={`s${k}`} at={slantAt(k)} src={SFX.click} volume={0.28} />)}
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      {PAIRS.map((_, i) => <Sfx key={`p${i}`} at={chipAt(i)} src={SFX.click} volume={0.28} />)}
      <Readout
        y={300}
        steps={[
          [twinIn, <>Add a <span style={{ color: '#ffe08a' }}>twin</span></>, C.ink],
          [t(0, 0.8), <>5 × 5 = 25 inside</>, C.primary],
          [slant0, <>25 − 5 = 20</>, C.violet],
          [split, <>20 ÷ 2 = 10 each</>, C.primary],
          [twinOut, <>short leg first</>, C.ink],
        ]}
      />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '538px 850px' }}>
        <Stage>
          <path d={path(SQUARE)} fill={AMBER} fillOpacity={0.1 * twinOp} stroke={AMBER} strokeWidth={8} strokeDasharray="16 12" strokeLinejoin="round" opacity={twinOp} />
          <path d={path(TRI)} fill={C.primary} fillOpacity={0.08} stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
          <Grid cols={N} rows={N} m={fm} spec={spec} />
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 1112, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 30, rowGap: 10 }}>
        {PAIRS.map(([a, b], i) => (
          <div key={i} style={{ width: 260, display: 'flex', justifyContent: 'center', opacity: ease(f, chipAt(i), 6), transform: `scale(${0.6 + 0.4 * pop(f, chipAt(i))})` }}>
            <div style={{ background: C.card, border: `5px solid ${C.primary}`, borderRadius: 20, padding: '2px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
              <Tex tex={`(${a},\\,${b})`} size={60} color={C.primary} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ---- reveal: 6 + 5 flipped = 11, over the same triangle as the hook ----
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  const mirror = ease(f, at(scene, 1, 0.45), 14);
  const [mx0, my0] = fm([0, 0]);
  const [mx1, my1] = fm([3, 3]);
  return (
    <>
      <Chip y={290}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="11" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>pairs</span>
        </div>
      </Chip>
      <Triangle spec={solved}>
        <line x1={mx0} y1={my0} x2={mx0 + (mx1 - mx0) * mirror} y2={my0 + (my1 - my0) * mirror} stroke={C.red} strokeWidth={7} strokeDasharray="14 12" opacity={mirror > 0 ? 1 : 0} />
      </Triangle>
      <Text x={620} y={560} w={430} size={64} weight={900} align="left" style={fadeUp(f, at(scene, 0, 0.05))}>
        6 + <span style={{ color: AMBER }}>5 flipped</span>
      </Text>
      <Text x={620} y={660} w={430} size={56} weight={900} color={C.red} align="left" style={fadeUp(f, at(scene, 1, 0.3))}>
        (6, 6) flips to itself!
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, square: Square, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Fig, Label, RightMark, SLUG, Seg, mkP } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (24), question, comment bait, "the overlap is a mini copy" aha (the original shrinks
// ×2/3 about its right corner onto the overlap, zoom on it, 54 → 8 of 12 → 6 → 24 readouts), reveal (30, 24 = the
// overlap) + CTA pill. The last frame shows the same figure, at the same place, as frame 0.

const ALL = { b: 1, h: 1, d: 1 };
const MP = mkP(100, 1010, 51); // main figure: x 100 … 916, base y 1010, top y 551; dims to y ≈ 1135
const QP = mkP(120, 990, 46); // question figure: x 120 … 856, top y 576
const before = -100;

/** Horizontal dimension bar (pixels) with a centred label. */
const Dim: React.FC<{ x1: number; x2: number; y: number; label: string; color: string; opacity: number }> = ({ x1, x2, y, label, color, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${x1} ${y - 12} L ${x1} ${y + 12} M ${x1} ${y} L ${(x1 + x2) / 2 - 36} ${y} M ${(x1 + x2) / 2 + 36} ${y} L ${x2} ${y} M ${x2} ${y - 12} L ${x2} ${y + 12}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Label p={[(x1 + x2) / 2, y]} text={label} color={color} size={56} />
    </g>
  );

const Chip: React.FC<{ y: number; bg: string; o: number; children: React.ReactNode }> = ({ y, bg, o, children }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ background: bg, color: '#fff', borderRadius: 24, padding: '6px 40px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 16 }}>{children}</div>
    </div>
  );

const Row: React.FC<{ y: number; o: number; tex: string; color?: string }> = ({ y, o, tex, color = C.ink }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', opacity: o, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={66} color={color} />
    </div>
  );

/** Opens on the slid figure (the same picture the video ends on), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #40</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>24</span>?
      </Text>
      <PushIn frames={scene.frames} origin="508px 800px">
        <Stage>
          <Fig P={MP} cFill={0.1} shade={1} tFill={0.1} labels={ALL} />
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

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Right triangle, legs <b style={{ color: C.primary }}>12 and 9</b>. The copy slides <b style={{ color: C.violet }}>4 right</b>. Area of the <b>shaded part</b>?
      </div>
      <Stage>
        <Fig P={QP} cFill={0.1} shade={1} tFill={0.1} labels={ALL} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1150, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 10, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The overlap is a mini copy: the original shrinks ×2/3 about its right corner (12, 0) onto the overlap (4,0) (12,0) (4,6). */
const Overlap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = MP;
  const ov = ease(f, at(scene, 1, 0.1), 12);
  const zin = at(scene, 1, 0.2);
  const zout = at(scene, 3, 0.05);
  const zoom = 1 + 0.3 * ease(f, zin, 12) - 0.3 * ease(f, zout, 12);
  const g0 = at(scene, 1, 0.35);
  const g1 = at(scene, 1, 0.85);
  const s = 1 - (1 / 3) * ease(f, g0, g1 - g0);
  const ghost: Pt[] = ([[0, 0], [12, 0], [0, 9]] as const).map(([x, y]) => P(12 + s * (x - 12), y * s));
  const ghostO = ease(f, at(scene, 1, 0.25), 6) * fadeTo(f, at(scene, 2, 0.2), 0, 10);
  const eight = ease(f, at(scene, 2, 0.15), 10);
  const side = ease(f, at(scene, 2, 0.6), 14);
  const area24 = at(scene, 3, 0.85);
  const base = P(0, 0)[1];
  const t = (i: number, a: number) => at(scene, i, a);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zin} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zout} src={SFX.whoosh} volume={0.25} />
      <Sfx at={t(0, 0.6)} src={SFX.click} volume={0.25} />
      <Sfx at={g1} src={SFX.click} volume={0.3} />
      <Sfx at={t(2, 0.15)} src={SFX.click} volume={0.25} />
      <Sfx at={t(2, 0.65)} src={SFX.click} volume={0.25} />
      <Sfx at={area24} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '440px 1060px' }}>
        <Stage>
          <Fig P={P} cFill={ease(f, t(0, 0.3), 12) * 2.2 + 0.1} ov={ov} labels={{ ...ALL, b: 1 }}>
            <Label p={P(7.4, 2.0)} text="54" color={C.blue} size={80} opacity={ease(f, t(0, 0.6), 10) * (1 - ov)} />
            <Poly pts={ghost} color={C.violet} width={7} fill={C.violet} fillOpacity={0.12} opacity={ghostO} dashed />
            <RightMark p={P(4, 0)} opacity={ov} />
            <Dim x1={P(4, 0)[0]} x2={P(12, 0)[0]} y={base + 44} label="8" color={C.green} opacity={eight} />
            <Seg a={P(4, 0)} b={P(4, 6)} color={C.red} width={12} opacity={side} progress={side} />
            <Label p={P(5.1, 2.6)} text="6" color={C.red} size={68} opacity={ease(f, t(2, 0.7), 10)} />
            <Label p={P(6.8, 1.3)} text="24" color={C.green} size={80} opacity={ease(f, area24, 10)} />
          </Fig>
        </Stage>
      </div>
      <Chip y={290} bg={C.blue} o={ease(f, t(0, 0.3), 8) * fadeTo(f, t(1, 0), 0, 6)}>whole copy = 54</Chip>
      <Chip y={290} bg={C.violet} o={ease(f, t(1, 0.1), 8) * fadeTo(f, t(2, 0), 0, 6)}>overlap = mini copy</Chip>
      <Chip y={290} bg={C.green} o={ease(f, t(2, 0.15), 8) * fadeTo(f, t(3, 0), 0, 6)}>
        8 of 12 → <Tex tex={'\\times\\tfrac{2}{3}'} size={64} color="#fff" />
      </Chip>
      <Chip y={290} bg={C.green} o={ease(f, area24, 8)}>overlap = 24</Chip>
      <Row y={1180} o={ease(f, t(0, 0.5), 8) * fadeTo(f, t(1, 0.1), 0, 6)} tex={'\\tfrac{1}{2} \\times 12 \\times 9 = 54'} color={C.blue} />
      <Row y={1180} o={ease(f, t(2, 0.6), 8) * fadeTo(f, t(3, 0.2), 0, 6)} tex={'\\tfrac{2}{3} \\times 9 = 6'} color={C.red} />
      <Row y={1180} o={ease(f, t(3, 0.25), 8)} tex={f >= area24 ? '\\tfrac{1}{2} \\times 8 \\times 6 = \\color{#21c45d}{24}' : '\\tfrac{1}{2} \\times 8 \\times 6'} />
    </>
  );
};

/** The answer, the trap (24 = the overlap), then the CTA pill over the same figure as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = MP;
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 0.99);
  const cta = at(scene, 2);
  const tail = fadeTo(f, cta, 0, 10);
  const ov = ease(f, 0, 8) * tail;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="54 - 24 = 30" size={84} color="#fff" />
        </div>
      </div>
      <Stage>
        <Fig P={P} cFill={0.1} tFill={0.1 * (1 - ov)} ov={ov} shade={1} labels={ALL}>
          <Label p={P(6.8, 1.3)} text="24" color={C.green} size={72} opacity={ov} />
          <Label p={P(13, 1.0)} text="30" color={C.ink} size={72} opacity={ease(f, hit, 10) * tail} />
        </Fig>
      </Stage>
      <Text x={540} y={468} w={1000} size={58} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.05)), opacity: ease(f, at(scene, 1, 0.05), 10) * tail }}>
        24 = just the overlap
      </Text>
      <CtaPill start={cta} y={1165} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, overlap: Overlap, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

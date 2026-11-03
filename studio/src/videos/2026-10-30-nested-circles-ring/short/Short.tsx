import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, BLUE, CHIME, DIA, Dot, Fig, GREEN, RS, TL, VIOLET, foldPt, mkP, SLUG, type Frame } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (12π), question, comment bait, the fold as the aha (zoom + counter), reveal with CTA pill.
// The hook and the reveal share FR, so the last frame matches frame 0 for a clean loop.

const CHOICES = ['4\\pi', '8\\pi', '12\\pi', '16\\pi', '24\\pi'];
const FR: Frame = { cx: 540, cy: 820, s: 2.4 };
const before = () => -100;

const Chip: React.FC<{ color: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ color, style, children }) => (
  <div style={{ background: color, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 62, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 16, ...style }}>{children}</div>
);

const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...style }}>{children}</div>
);

/** The loop figure: the bank picture with the ring shaded, side 8 marked on the left. */
const LoopFig: React.FC<{ inner?: number }> = ({ inner = 0 }) => (
  <>
    <Stage>
      <Fig fr={FR} ring={1} under={inner > 0 ? <circle cx={FR.cx} cy={FR.cy} r={RS * FR.s} fill={GREEN} opacity={0.25 * inner} /> : undefined} />
    </Stage>
    <TL p={[FR.cx - 120 * FR.s - 48, FR.cy]} tex="8" size={60} />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.79); // "Nope" starts at 2.52 s of 3.2 s
  return (
    <>
      <Center y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #46</div>
      </Center>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <Tex tex={'12\\pi'} size={100} color={C.red} />?
      </Text>
      <PushIn frames={scene.frames} origin={`${FR.cx}px ${FR.cy}px`}>
        <LoopFig />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Center y={730} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Center>
    </>
  );
};

const QFR: Frame = { cx: 540, cy: 830, s: 1.5 };

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Circle in a <b style={{ color: BLUE }}>square of side 8</b>. Smaller square with <b style={{ color: BLUE }}>corners on that circle</b>, a circle inside. <b style={{ color: VIOLET }}>Area of the shaded ring?</b>
      </div>
      <Stage>
        <Fig fr={QFR} ring={1} />
      </Stage>
      <TL p={[QFR.cx - 120 * QFR.s - 44, QFR.cy]} tex="8" size={56} />
      <div style={{ position: 'absolute', left: 60, top: 1035, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.45 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={660} />
    </>
  );
};

/** The aha: the corners sit mid-side, fold the 4 corner triangles in (zoom on the first), count 4 × 8 = 32 = half of 64, then the small circle is half too. */
const AFR: Frame = { cx: 540, cy: 780, s: 2.8 };
const TRIS: { c: Pt; a: Pt; b: Pt; col: string }[] = [
  { c: [30, 30], a: [150, 30], b: [30, 150], col: AMBER },
  { c: [270, 30], a: [150, 30], b: [270, 150], col: BLUE },
  { c: [270, 270], a: [270, 150], b: [150, 270], col: VIOLET },
  { c: [30, 270], a: [150, 270], b: [30, 150], col: GREEN },
];

const Fold: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = mkP(AFR);
  const dot = (i: number) => at(scene, 0, 0.18 + i * 0.07);
  const tris = at(scene, 0, 0.55);
  const foldAt = [at(scene, 0, 0.72), at(scene, 1, 0.04), at(scene, 1, 0.18), at(scene, 1, 0.32)];
  const zoomIn = at(scene, 0, 0.6);
  const zoomOut = at(scene, 1, 0.0);
  const zoom = 1 + 0.4 * ease(f, zoomIn, 12) - 0.4 * ease(f, zoomOut, 12);
  const origin = P(80, 80);
  const folded = foldAt.filter((t) => f >= t + 12).length;
  const each = at(scene, 1, 0.6);
  const four = at(scene, 1, 0.85);
  const half = at(scene, 2, 0.05);
  const circ = at(scene, 2, 0.5);
  const legs = ease(f, each - 4, 8);
  // readout chip: one state at a time
  const step = f < dot(0) ? -1 : f < foldAt[0] ? 0 : f < each ? 1 : f < four ? 2 : f < half ? 3 : f < circ ? 4 : 5;
  const readout: React.ReactNode[] = [
    <Chip key={0} color={AMBER}>corners = mid-sides</Chip>,
    <Chip key={1} color={folded === 4 ? C.green : C.violet}>{folded} of 4 folded{folded === 4 ? ' ✓' : ''}</Chip>,
    <Chip key={2} color={AMBER}>each: <Tex tex={'\\tfrac12 \\cdot 4 \\cdot 4 = 8'} size={66} color="#fff" /></Chip>,
    <Chip key={3} color={C.violet}><Tex tex={'4 \\times 8 = 32'} size={66} color="#fff" /></Chip>,
    <Chip key={4} color={C.green}><Tex tex="32" size={66} color="#fff" /> = half of <Tex tex="64" size={66} color="#fff" /></Chip>,
    <Chip key={5} color={C.green}>small circle = half too</Chip>,
  ];
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 1, 2, 3].map((i) => <Sfx key={`d${i}`} at={dot(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      {foldAt.map((t, i) => <Sfx key={`f${i}`} at={t + 10} src={SFX.click} volume={0.3} />)}
      <Sfx at={each} src={SFX.click} volume={0.25} />
      <Sfx at={four} src={SFX.click} volume={0.25} />
      <Sfx at={half} src={SFX.click} volume={0.25} />
      <Sfx at={circ} src={SFX.whoosh} volume={0.25} />
      <Text x={540} y={270} w={1000} size={88} weight={900} align="center">
        <span style={{ color: C.violet }}>Fold</span> the corners!
      </Text>
      {/* zoom window: the figure never spills over the readout or the captions */}
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(392px 0 775px 0)' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${origin[0]}px ${origin[1]}px` }}>
        <Stage>
          <Fig
            fr={AFR}
            c1={1}
            c2={ease(f, circ, 24)}
            ring={0}
            under={<circle cx={AFR.cx} cy={AFR.cy} r={RS * AFR.s} fill={GREEN} opacity={0.25 * ease(f, circ + 10, 14)} />}
            over={
              <>
                {TRIS.map((t, i) => {
                  const q = ease(f, foldAt[i], 22);
                  const c = foldPt(t.c, t.a, t.b, q);
                  return <Poly key={i} pts={[P(t.a[0], t.a[1]), P(t.b[0], t.b[1]), P(c[0], c[1])]} color={t.col} width={6} fill={t.col} fillOpacity={0.5} opacity={ease(f, tris, 10) * (1 - 0.65 * ease(f, circ, 16))} />;
                })}
                {DIA.map((p, i) => <Dot key={i} p={P(p[0], p[1])} r={18} s={pop(f, dot(i))} />)}
              </>
            }
          />
        </Stage>
        <TL p={P(90, 52)} tex="4" size={60} opacity={legs} />
        <TL p={P(52, 90)} tex="4" size={60} opacity={legs} />
      </div>
      </div>
      {readout.map((r, i) => (
        <Center key={i} y={1160} style={{ opacity: i === step ? 1 : 0, transform: `scale(${i === step ? 0.85 + 0.15 * pop(f, [dot(0), foldAt[0], each, four, half, circ][i]) : 1})` }}>
          {r}
        </Center>
      ))}
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.79); // "eight pi" starts at 3.24 s of 4.08 s (silencedetect)
  const chime = at(scene, 0, 0.93);
  const trap = at(scene, 1);
  return (
    <>
      <Center y={290}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 70, fontWeight: 900 }}>Ring =</span>
          <Tex tex={'8\\pi'} size={110} color="#fff" />
        </div>
      </Center>
      <LoopFig inner={ease(f, at(scene, 0, 0.5), 12)} />
      <Center y={1125} style={{ ...fadeUp(f, at(scene, 0, 0.1)), opacity: ease(f, at(scene, 0, 0.1), 10) * fadeTo(f, trap, 0, 6) }}>
        <span style={{ fontSize: 62, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 16 }}>big circle = <Tex tex={'16\\pi'} size={70} /></span>
      </Center>
      <Center y={1125} style={{ opacity: ease(f, trap + 4, 8) }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: C.red, display: 'flex', alignItems: 'center', gap: 16 }}><Tex tex={'12\\pi'} size={68} /> halves the radius ✗</span>
      </Center>
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, fold: Fold, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

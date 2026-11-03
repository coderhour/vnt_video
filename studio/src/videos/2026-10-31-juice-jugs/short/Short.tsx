import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, COL_A, COL_B, JugGlow, Jugs, Legend, MAIN, ORT, SLUG, Swirl, T_END, T_START, type Phases } from '../Composition';

export { SLUG };
const before = -100;

// Jugs as placed in the hook and at the end of the reveal (same spot, so the loop cuts cleanly).
const HJ = { ox: 149, oy: 540, s: 0.85 };

const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, ...style }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Center y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #37</div>
      </Center>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>60%</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 760px">
        <Jugs {...HJ} blocks={MAIN} T={T_START} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Center y={640} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Center>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: COL_A }}>Jug A:</b> 10 L water. <b style={{ color: COL_B }}>Jug B:</b> 10 L, <b style={{ color: ORT }}>60% juice</b>. Pour 5 L B → A, stir, pour 5 L back. <b>What % of B is juice?</b>
      </div>
      <Jugs ox={218} oy={680} s={0.7} blocks={MAIN} T={T_START} />
      <div style={{ position: 'absolute', left: 60, top: 1030, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${c}\\%`} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.75 + i * 0.05)} />
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

/** Juice readout under a jug: shows the latest value whose frame has passed, popping on each change. */
const Juice: React.FC<{ x: number; y: number; vals: [number, string][]; op?: number }> = ({ x, y, vals, op = 1 }) => {
  const f = useCurrentFrame();
  const cur = [...vals].reverse().find(([t]) => f >= t);
  if (!cur) return null;
  const k = pop(f, cur[0]);
  return (
    <div style={{ position: 'absolute', left: x - 170, top: y, width: 340, textAlign: 'center', whiteSpace: 'nowrap', opacity: op * ease(f, vals[0][0], 8) }}>
      <span style={{ display: 'inline-block', background: C.card, borderRadius: 22, padding: '6px 26px', fontSize: 64, fontWeight: 900, color: ORT, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', transform: `scale(${0.85 + 0.15 * Math.min(1, k)})` }}>{cur[1]}</span>
    </div>
  );
};

// ---------- the aha: follow the liters of juice, pour by pour ----------
const AJ = { ox: 80, oy: 420, s: 1 };
const AX = AJ.ox + 220; // jug A centre
const BX = AJ.ox + 700; // jug B centre

const Pour: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const glow = at(scene, 0, 0.5);
  const six = at(scene, 0, 0.78);
  const p1 = at(scene, 1, 0.05);
  const p2 = at(scene, 2, 0.3);
  const T: Phases = { p1: [p1, p1 + 36], s1: [p1 + 44, p1 + 68], p2: [p2, p2 + 36], s2: [p2 + 44, p2 + 68] };
  const zoomIn = at(scene, 2, 0.05);
  const zoomOut = at(scene, 2, 0.92);
  const zoom = 1 + 0.25 * ease(f, zoomIn, 12) - 0.25 * ease(f, zoomOut, 12);
  const eq = (tex: string, start: number, end: number) => (
    <Center y={1040} style={{ ...fadeUp(f, start), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 8) }}>
      <Tex tex={tex} size={72} />
    </Center>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={six} src={SFX.click} volume={0.28} />
      {[0, 12, 24].map((d) => <Sfx key={d} at={p1 + d} src={SFX.click} volume={0.25} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      {[0, 12, 24].map((d) => <Sfx key={`b${d}`} at={p2 + d} src={SFX.click} volume={0.25} />)}
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${BX + 20}px 690px` }}>
        <Jugs {...AJ} blocks={MAIN} T={T}>
          <JugGlow j="B" start={glow} end={p1} color={ORT} />
          <Swirl j="A" start={T.s1[0]} end={T.s1[1] + 6} />
          <Swirl j="B" start={T.s2[0]} end={T.s2[1] + 6} />
        </Jugs>
      </div>
      <Text x={540} y={290} w={1040} size={76} weight={900} align="center" style={{ opacity: ease(f, 2, 10) * fadeTo(f, zoomIn, 0, 8) + ease(f, zoomOut + 4, 10) }}>
        Count <span style={{ color: ORT }}>liters</span>, not percents
      </Text>
      <Juice x={AX} y={950} vals={[[at(scene, 0, 0.3), '0 L'], [p1 + 22, '3 L']]} op={fadeTo(f, p2 - 6, 0, 8)} />
      <Juice x={BX - 40} y={950} vals={[[six, '6 L'], [p1 + 22, '3 L'], [p2 + 26, '3 L + 1 L']]} />
      {eq('\\dfrac{1}{2}\\text{ of } 6\\text{ L} = 3\\text{ L}', at(scene, 1, 0.45), at(scene, 2, 0.4))}
      {eq('\\dfrac{1}{3}\\text{ of } 3\\text{ L} = 1\\text{ L}', at(scene, 2, 0.5), 1e6)}
      <div style={{ opacity: fadeTo(f, at(scene, 1, 0.4), 0, 8) }}>
        <Legend x={150} y={1060} start={at(scene, 0, 0.3)} />
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same jugs as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.76);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1, 0.05);
  return (
    <>
      <Center y={300} style={{ opacity: ease(f, at(scene, 0, 0.05), 8) * fadeTo(f, hit - 4, 0, 4) }}>
        <Tex tex={`3\\text{ L} + 1\\text{ L} = 4\\text{ L}\\text{ of }10\\text{ L}`} size={76} color={ORT} />
      </Center>
      <Center y={285}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{4}{10} = 40\\%'} size={92} color="#fff" />
        </div>
      </Center>
      <Jugs {...HJ} blocks={MAIN} T={T_END}>
        <JugGlow j="B" start={hit} end={at(scene, 2)} color={C.green} />
      </Jugs>
      <Text x={490} y={955} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        60% is where jug B started
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pour: Pour, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

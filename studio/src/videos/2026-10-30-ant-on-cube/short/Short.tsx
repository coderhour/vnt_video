import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Ant, CHIME, CHOICES, Cube, P, PulseRing, Route, SLUG, antAt, type Mv } from '../Composition';

export { SLUG };

// ~39 s: trap-first hook (1/27 = one in three at every step), the question, comment bait, the walk step by step
// (good edges green, back edges red, a 3/3 × 2/3 × 1/3 readout, a zoom onto corner C for the last step),
// then the answer + CTA pill. The hook and the reveal show the same big cube at the same place (clean loop).

/** Place the cube (drawn in 1920×1080 coordinates, x 260…740, y 270…720) with its top-left at (X, Y), scaled by k. */
const At: React.FC<{ k: number; X: number; Y: number; children: React.ReactNode }> = ({ k, X, Y, children }) => (
  <g transform={`translate(${X - 260 * k} ${Y - 270 * k}) scale(${k})`}>{children}</g>
);
const K = 1.3;
const X0 = 230;
const Y0 = 660; // big cube: x 230…854, y 660…1245
const screen = (p: [number, number]) => [X0 + (p[0] - 260) * K, Y0 + (p[1] - 270) * K] as const;
const AG = (k: string) => (k === 'A' || k === 'G' ? 1 : 0);
const AG_DOTS = { A: { c: C.ink }, G: { c: C.amber } };
const before = -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.78);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #53</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1/27</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 950px">
        <Stage>
          <At k={K} X={X0} Y={Y0}>
            <Cube labels={AG} dots={AG_DOTS} flag={1} />
            <Ant p={P.A} />
          </At>
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 820, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; tag: number; pulse?: (i: number) => number }> = ({ start, tag, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Each minute, an ant walks <b style={{ color: C.primary }}>1 of 3 edges</b> at random. Chance it's at the <b style={{ color: C.amber }}>farthest corner</b> after 3 minutes?
      </div>
      <Stage>
        <At k={0.72} X={370} Y={705}>
          <Cube labels={AG} dots={AG_DOTS} flag={ease(f, tag, 12)} />
          <Ant p={P.A} />
        </At>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1050, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={60} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.15 + i * 0.1)} tag={at(scene, 1, 0.3)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} tag={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const FR = ['\\dfrac{3}{3}', '\\dfrac{2}{3}', '\\dfrac{1}{3}'];

/** The aha: G is 3 edges away, so each step must go farther. At each corner the good edges glow green, the back edges red. */
const Steps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lit = [at(scene, 1, 0.05), at(scene, 2, 0.05), at(scene, 3, 0.08)];
  const go = [at(scene, 1, 0.8), at(scene, 2, 0.8), at(scene, 3, 0.8)];
  const chip = [at(scene, 1, 0.7), at(scene, 2, 0.7), at(scene, 3, 0.72)];
  const moves: Mv[] = [{ t: go[0], to: 'B' }, { t: go[1], to: 'C' }, { t: go[2], to: 'G' }];
  const ant = antAt(f, 'A', moves);
  const on = (i: number) => ease(f, lit[i], 8) * (1 - ease(f, go[i], 10));
  const edges = {
    AB: { c: C.green, o: on(0) }, AD: { c: C.green, o: on(0) }, AE: { c: C.green, o: on(0) },
    BA: { c: C.red, o: on(1) }, BC: { c: C.green, o: on(1) }, BF: { c: C.green, o: on(1) },
    CB: { c: C.red, o: on(2) }, CD: { c: C.red, o: on(2) }, CG: { c: C.green, o: on(2) },
  };
  const walked = f >= go[2] + 18 ? 'ABCG' : f >= go[1] + 18 ? 'ABC' : f >= go[0] + 18 ? 'AB' : '';
  const l3 = at(scene, 3);
  const zOut = go[2] + 10;
  const zoom = 1 + 0.3 * ease(f, l3, 14) - 0.3 * ease(f, zOut, 12);
  const [cx, cy] = screen(P.C);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {lit.map((t, i) => <Sfx key={`l${i}`} at={t} src={SFX.click} volume={0.25} />)}
      {chip.map((t, i) => <Sfx key={`c${i}`} at={t} src={SFX.click} volume={0.3} />)}
      <Sfx at={l3} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Text x={540} y={310} w={1000} size={84} weight={900} align="center" style={{ ...fadeUp(f, 6), opacity: ease(f, 6, 10) * fadeTo(f, at(scene, 1), 0, 8) }}>
        G is <span style={{ color: C.amber }}>3 edges</span> away
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        {FR.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(f, chip[i], 6), transform: `scale(${f >= chip[i] ? pop(f, chip[i]) : 0.8})` }}>
            {i > 0 && <span style={{ fontSize: 72, fontWeight: 900, color: C.muted }}>×</span>}
            <div style={{ background: C.card, borderRadius: 24, padding: '6px 30px', boxShadow: '0 6px 20px rgba(30,40,80,0.1)' }}>
              <Tex tex={t} size={64} color={C.green} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${cx - 100}px ${cy + 120}px` /* toward C, low enough that the cube stays above the captions */ }}>
        <Stage>
          <At k={K} X={X0} Y={Y0}>
            {walked && <Route path={walked} p={1} color={C.violet} opacity={0.5} width={16} />}
            <Cube labels={AG} dots={AG_DOTS} flag={1} edges={edges} />
            <Route path="ABCG" p={ease(f, at(scene, 0, 0.35), 40) * fadeTo(f, at(scene, 1), 0, 8)} color={C.violet} opacity={0.45} width={12} />
            <Ant p={ant} />
            <PulseRing at={P.G} f={f} start={go[2] + 16} color={C.amber} />
          </At>
        </Stage>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same cube as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.58); // "two over nine" starts 1.42 s into the line
  const chime = at(scene, 0, 0.9);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 50px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>Chance =</span>
          <span style={{ fontSize: 100, fontWeight: 900 }}>2/9</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: fadeTo(f, hit - 4, 0, 6) }}>
        {FR.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {i > 0 && <span style={{ fontSize: 64, fontWeight: 900, color: C.muted }}>×</span>}
            <Tex tex={t} size={58} color={C.green} />
          </div>
        ))}
      </div>
      <Stage>
        <At k={K} X={X0} Y={Y0}>
          <Cube labels={AG} dots={AG_DOTS} flag={1} />
          <Route path="ABCG" p={1} color={C.green} opacity={0.55} width={12} />
          <Ant p={P.G} />
        </At>
      </Stage>
      <Text x={540} y={462} w={900} size={60} weight={900} color={C.red} align="center" style={{ opacity: ease(f, trap + 3, 8) * fadeTo(f, at(scene, 2), 0, 6) }}>
        1/27: 1/3 at every step
      </Text>
      <CtaPill start={at(scene, 2)} y={452} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, steps: Steps, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

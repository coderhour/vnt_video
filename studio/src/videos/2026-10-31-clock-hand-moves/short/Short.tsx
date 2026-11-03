import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBD, CH, CHIME, Clock, SLUG, stepH } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (6), question, comment bait, the turns scene (pairs → 210 hours, one full turn, then a
// fast 17-turn spin with an hours readout counting in 12s, a zoom on the hand back at 3), the reveal (six hour steps
// from 3 to 9) on the same big clock the hook opens on (loop match).

const CX = 540;
const CY = 830;
const R = 330;
/** Tip of the hour hand at 3 o'clock (Clock: L = nr − 0.62·fs − 14). */
const TIP_X = CX + (R - 62 - 58 * 0.62 - 14);

const Row: React.FC<{ y: number; op: number; tex: string; size?: number }> = ({ y, op, tex, size = 76 }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: op }}>
      <Tex tex={tex} size={size} />
    </div>
  );

const Chip: React.FC<{ y: number; op: number; color: string; scale?: number; children: React.ReactNode }> = ({ y, op, color, scale = 1, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ background: color, color: '#fff', borderRadius: 24, padding: '2px 36px', fontSize: 62, fontWeight: 900, whiteSpace: 'nowrap', transform: `scale(${scale})` }}>{children}</div>
    </div>
  );

/** Opens on the clock (the same place the video ends on, so the loop cuts cleanly), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.79);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #9</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>6</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${CX}px ${CY}px`}>
        <Clock cx={CX} cy={CY} R={R} h={3} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 720, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        The hour hand points to <b style={{ color: C.violet }}>3</b>. It moves <b>1 hour</b>, then <b>2</b>, then <b>3</b>, … up to <b style={{ color: AMBD }}>20 hours</b>. Where does it point at the end?
      </div>
      <Clock cx={CX} cy={845} R={200} h={3} />
      <div style={{ position: 'absolute', left: 60, top: 1075, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
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
    <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const Turns: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x: number) => at(scene, i, x);
  // line 0: the sum by pairs
  const pairs = t(0, 0.36);
  const total = t(0, 0.72);
  // line 1: one full turn, then the other 16 turns fast
  const turn1 = t(1, 0.06);
  const turn1End = turn1 + 30;
  const spin = t(1, 0.4);
  const spinEnd = t(1, 0.8);
  const turns = ease(f, turn1, 30) + (f <= spin ? 0 : f >= spinEnd ? 16 : (16 * (f - spin)) / (spinEnd - spin));
  const h = 3 + 12 * turns;
  const spinning = f > spin && f < spinEnd ? 1 : 0;
  const full = Math.floor(turns + 1e-6);
  const plus6 = t(1, 0.82);
  // line 2: zoom onto the hand back at 3, then out to the leftover
  const zoomIn = t(2, 0.04);
  const zoomOut = t(2, 0.4);
  const zoom = 1 + 0.4 * ease(f, zoomIn, 12) - 0.4 * ease(f, zoomOut, 12);
  const top = fadeTo(f, zoomIn - 4, 0, 8) + ease(f, zoomOut + 6, 10);
  const left6 = t(2, 0.48);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={pairs} src={SFX.click} volume={0.25} />
      <Sfx at={total} src={SFX.click} volume={0.3} />
      <Sfx at={turn1} src={SFX.whoosh} volume={0.22} />
      {Array.from({ length: 6 }, (_, k) => <Sfx key={k} at={spin + ((spinEnd - spin) * (k * 3 + 1)) / 16} src={SFX.click} volume={0.24} />)}
      <Sfx at={plus6} src={SFX.click} volume={0.3} />
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={left6} src={SFX.click} volume={0.3} />
      <div style={{ opacity: Math.min(1, top) }}>
        <Row y={285} op={ease(f, 2, 10) * fadeTo(f, pairs - 3, 0, 6)} tex="1 + 2 + 3 + \cdots + 20" />
        <Row y={285} op={ease(f, pairs, 8) * fadeTo(f, t(1, 0.38), 0, 6)} tex={`10 \\times 21 ${f >= total ? '= 210' : ''}`} />
        <Row y={285} op={ease(f, t(1, 0.4), 8)} tex={`210 = 17 \\times 12 ${f >= plus6 ? '\\color{#c77f00}{+\\,6}' : ''}`} />
        <Chip y={395} op={ease(f, total, 8) * fadeTo(f, turn1, 0, 6)} color={C.violet} scale={0.8 + 0.2 * pop(f, total)}>210 hours</Chip>
        <Chip y={395} op={ease(f, turn1, 8) * fadeTo(f, t(2, 0.0), 0, 6)} color={C.ink}>{f < turn1End ? '12 h = 1 full turn' : `${Math.max(1, full) * 12} h used`}</Chip>
        <Chip y={395} op={ease(f, left6, 8)} color={AMBD} scale={0.8 + 0.2 * pop(f, left6)}>6 hours left</Chip>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${TIP_X}px ${CY}px` }}>
        <Clock cx={CX} cy={CY} R={R} h={h} trail={spinning} glow={ease(f, zoomIn + 6, 8) * fadeTo(f, zoomOut, 0, 8)} />
      </div>
    </>
  );
};

/** Six hour steps from 3 land on 9 with the spoken answer, then the trap (a ghost hand at 6), then the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.97);
  const steps = Array.from({ length: 6 }, (_, k) => at(scene, 0, 0.12) + k * ((hit - 8 - at(scene, 0, 0.12)) / 5));
  const h = stepH(f, 3, steps, 7);
  const trap = at(scene, 1, 0.05);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '4px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="3 + 6 = 9" size={86} color="#fff" />
        </div>
      </div>
      <Text x={540} y={403} w={1000} size={50} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.4))}>
        6 counts from 12, not 3 ✗
      </Text>
      <Clock cx={CX} cy={CY} R={R} h={h} ghostH={6} ghostOp={ease(f, trap, 8)} glow={ease(f, hit, 10)} />
      <CtaPill start={at(scene, 2)} y={1185} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {steps.map((s, k) => <Sfx key={k} at={s} src={SFX.click} volume={0.22} />)}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={11} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, turns: Turns, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

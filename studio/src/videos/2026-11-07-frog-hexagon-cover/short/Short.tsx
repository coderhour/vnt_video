import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, DARK, EXIT, Eq, GREEN, Line, NGon, SLUG, Tag, greenOf, vert, type Pt, type Walk } from '../Composition';

export { SLUG };

// ~38 s: trap-first hook ("12" = two jumps per corner), the question, comment bait, the stage idea
// (green block → straightened line → wait = steps × steps = 1 × k), then 1 + 2 + 3 + 4 + 5 = 15.
// The hook and the last frame show the same all-green hexagon with the frog on the top corner.

const HX = 540, HY = 780, HR = 220; // hook / reveal hexagon (loop match)
const ALL = Array(6).fill(-100);
const never = Array(6).fill(Infinity);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  const walk: Walk = [[0, -100], [1, 22], [0, 46]];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #25</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>12</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${HX}px ${HY}px`}>
        <NGon cx={HX} cy={HY} r={HR} green={ALL} walk={walk} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 690, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QX = 540, QY = 885, QR = 170;
const QuestionBody: React.FC<{ start: (i: number) => number; arrows: number; pulse?: (i: number) => number }> = ({ start, arrows, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  const P = (i: number) => vert(6, i, QX, QY, QR);
  const g = [...never];
  g[0] = -100;
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A frog hops around a <b style={{ color: C.violet }}>hexagon</b>, to either neighbor, chance <Tex tex="\tfrac12" size={58} /> each. Average jumps to visit <b style={{ color: GREEN }}>all 6 corners</b>?
      </div>
      <NGon cx={QX} cy={QY} r={QR} dotR={22} green={g} frogAt={0} frogStart={-100} />
      <Arc p={P(0)} q={P(1)} away={[QX, QY - 1000]} bulge={22} start={arrows} label="\dfrac12" labelSize={52} sh={30} labelOff={70} />
      <Arc p={P(0)} q={P(5)} away={[QX, QY - 1000]} bulge={22} start={arrows + 4} label="\dfrac12" labelSize={52} sh={30} labelOff={70} />
      <div style={{ position: 'absolute', left: 60, top: 1100, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.08)} arrows={at(scene, 0, 0.45)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} arrows={-100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={640} />
    </>
  );
};

// ---- the aha: one green block, straightened into a line, wait = steps × steps ----

const SX = 540, SY = 720, SR = 210;
const LX0 = 165, LSP = 150; // 6 slots: exit · 4 green · exit

const Stages: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = (i: number) => vert(6, i, SX, SY, SR);
  const walk: Walk = [[0, 0], [1, 18], [0, 32], [5, 46], [0, 60], [1, 74], [2, 92]];
  const green = greenOf(walk, 6);
  const count = green.filter((t) => t <= f).length;
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const morph = at(scene, 1, 0.1);
  const brk = at(scene, 1, 0.42);
  const zoom = 1 + 0.2 * ease(f, brk - 4, 12) - 0.2 * ease(f, l2, 12);
  const morphFrom: Pt[] = [P(3), P(2), P(1), P(0), P(5), P(4)];
  const lx = (i: number) => LX0 + i * LSP;
  const ly = SY;
  const chip = (i: number) => at(scene, 2, 0.6 + i * 0.08);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[18, 46, 92].map((t) => <Sfx key={t} at={t} src={SFX.click} volume={0.28} />)}
      <Sfx at={morph} src={SFX.whoosh} volume={0.28} />
      <Sfx at={brk - 4} src={SFX.whoosh} volume={0.22} />
      <Sfx at={at(scene, 1, 0.48)} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 1, 0.6)} src={SFX.click} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {range(5).map((i) => <Sfx key={`c${i}`} at={chip(i)} src={SFX.click} volume={0.28} />)}

      {/* readout chip */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: f >= at(scene, 2, 0.3) ? GREEN : C.primarySoft, border: `5px solid ${GREEN}`, color: f >= at(scene, 2, 0.3) ? '#fff' : DARK, borderRadius: 999, padding: '6px 40px', fontSize: 60, fontWeight: 900 }}>
          {f >= at(scene, 2, 0.3) ? 'stage 4: 4 jumps' : `green corners: ${count}`}
        </div>
      </div>
      <Tag x={0} y={392} w={1080} center start={30} size={52} color={DARK} end={86}>always one green block</Tag>
      <Tag x={0} y={392} w={1080} center start={98} size={52} color={C.amber} end={l1 + 6}>frog at an end</Tag>
      <Tag x={0} y={392} w={1080} center start={morph + 20} size={52} color={EXIT} end={l2}>an exit on each side</Tag>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${SX}px ${SY + 20}px` }}>
        <div style={{ opacity: fadeTo(f, morph, 0, 8) }}>
          <NGon cx={SX} cy={SY} r={SR} green={green} walk={walk} frogRing={{ start: 98 }}
            rings={[{ i: 3, start: l1 + 2 }, { i: 4, start: l1 + 2 }]} ringLabels={[{ i: 3, start: l1 + 2 }, { i: 4, start: l1 + 2 }]} />
        </div>
        <Line k={4} x0={LX0} y={ly} sp={LSP} start={morph} morphFrom={morphFrom} morphStart={morph} morphDur={24}
          labels={{
            0: { t: '\\text{exit}', s: morph + 22, color: EXIT },
            5: { t: '\\text{exit}', s: morph + 22, color: EXIT },
            1: { t: '4', s: at(scene, 2, 0.3), color: DARK },
          }} />
        {/* brackets: 1 step to one exit, 4 steps to the other */}
        <Stage>
          <path d={`M ${lx(0)} ${ly + 56} L ${lx(0)} ${ly + 74} L ${lx(1) - 6} ${ly + 74} L ${lx(1) - 6} ${ly + 56}`} fill="none" stroke={EXIT} strokeWidth={6} strokeLinejoin="round" opacity={ease(f, at(scene, 1, 0.48), 10)} />
          <path d={`M ${lx(1) + 6} ${ly + 56} L ${lx(1) + 6} ${ly + 74} L ${lx(5)} ${ly + 74} L ${lx(5)} ${ly + 56}`} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" opacity={ease(f, at(scene, 1, 0.6), 10)} />
        </Stage>
        <Tag x={(lx(0) + lx(1)) / 2 - 110} y={ly + 84} w={220} center start={at(scene, 1, 0.48)} size={46} color={EXIT}>1 step</Tag>
        <Tag x={(lx(1) + lx(5)) / 2 - 150} y={ly + 84} w={300} center start={at(scene, 1, 0.6)} size={46} color={C.green}>4 steps</Tag>
      </div>

      {/* the rule, then 1 × 4 = 4 */}
      <Tag x={60} y={935} w={960} center start={at(scene, 1, 0.5)} size={50} color={C.ink} end={l2 + 2}>
        <span style={{ display: 'inline-block', border: `6px solid ${GREEN}`, borderRadius: 24, padding: '8px 26px', background: C.card }}>
          average wait = steps to one exit {'×'} steps to the other
        </span>
      </Tag>
      <Eq x={0} y={935} center start={l2 + 6} tex="1 \times 4 = 4" size={80} color={C.green} box />

      {/* stage chips 1..5 */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1100, display: 'flex', justifyContent: 'space-between' }}>
        {range(5).map((i) => (
          <div key={i} style={{ width: 160, height: 150, ...fadeUp(f, chip(i), 8), borderRadius: 26, background: i === 3 ? C.primarySoft : C.card, border: `5px solid ${GREEN}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.muted }}>stage {i + 1}</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: DARK, lineHeight: 1 }}>{i + 1}</div>
          </div>
        ))}
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same all-green hexagon as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.52); // "fifteen" starts at frame 36 of 70 (checked on the WAV); its caption chunk shows later
  const chime = at(scene, 0, 0.88);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>C</span>
          <Tex tex="15" size={110} color="#fff" />
          <span style={{ fontSize: 66, fontWeight: 900 }}>jumps</span>
        </div>
      </div>
      <NGon cx={HX} cy={HY} r={HR} green={ALL} frogAt={0} frogStart={-100} />
      <Eq x={0} y={1050} center start={0} tex="1 + 2 + 3 + 4 + 5" size={72} color={DARK} />
      <Text x={540} y={1150} w={900} size={52} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.05)), opacity: (fadeUp(f, at(scene, 1, 0.05)).opacity as number) * fadeTo(f, at(scene, 2), 0, 8) }}>
          12 = equal stages ✗
      </Text>
      <CtaPill start={at(scene, 2)} y={1185} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={25} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, stages: Stages, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

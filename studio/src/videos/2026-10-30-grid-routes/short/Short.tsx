import { Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage, type Pt } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arrow, CHIME, CHOICES, HOOK_ROUTES, Num, Route, SLUG, Streets, TABLE, XC, plane } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: 5 × 3 street grid, right/up only, avoid corner X. Aha: corner numbers
// (left + below, 0 at X) fill the grid; B = 17 + 9 = 26 (B). Trap 56 = every route, forgetting X (bank choice note).

const BIG = plane(100, 1050, 155); // 5 × 3 blocks: x 100…875, y 585…1050 (same place in hook, aha and reveal)
const isPt = (p: Pt, q: Pt) => p[0] === q[0] && p[1] === q[1];
const B: Pt = [5, 3];

// fill order: the edge streets, then the demo corner (1,1) and X, then the rest by diagonal (B is left for the reveal)
const EDGE: Pt[] = [[0, 0], ...[1, 2, 3, 4, 5].map((x): Pt => [x, 0]), ...[1, 2, 3].map((y): Pt => [0, y])];
const REST: Pt[] = [];
for (let d = 2; d <= 7; d++)
  for (let x = 1; x <= 5; x++) {
    const p: Pt = [x, d - x];
    if (p[1] >= 1 && p[1] <= 3 && !isPt(p, [1, 1]) && !isPt(p, XC) && !isPt(p, B)) REST.push(p);
  }
const val = (p: Pt) => TABLE[p[0]][p[1]];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  const per = Math.round((scene.frames * 0.85) / HOOK_ROUTES.length);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #12</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>56</span>?
      </Text>
      <PushIn frames={scene.frames} origin="490px 820px">
        <Stage>
          <Streets m={BIG} labels={56} lo={1.0} />
          {HOOK_ROUTES.map((r, i) => {
            const st = i * per;
            return <Route key={r} m={BIG} route={r} color={C.violet} progress={ease(f, st, per)} opacity={f < st + per ? 0.9 : 0.3} width={12} />;
          })}
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

const QG = plane(215, 1000, 115);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Mia walks <b style={{ color: C.primary }}>A to B</b>, only <b style={{ color: C.violet }}>right or up</b>, never through <b style={{ color: C.red }}>X</b>. How many paths?
      </div>
      <Stage>
        <Streets m={QG} labels={54} lo={1.0} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1080, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.4 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** Readout chip under the heading; shows the latest step whose frame has passed. */
const Readout: React.FC<{ steps: [number, string][] }> = ({ steps }) => {
  const f = useCurrentFrame();
  const i = steps.reduce((k, [s], j) => (f >= s ? j : k), -1);
  if (i < 0) return null;
  const [s, tex] = steps[i];
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 395, display: 'flex', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${0.85 + 0.15 * pop(f, s)})`, background: C.card, borderRadius: 26, padding: '10px 40px', boxShadow: '0 8px 24px rgba(30,40,80,0.12)' }}>
        <Tex tex={tex} size={68} />
      </div>
    </div>
  );
};

const Fill: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const edgeAt = (i: number) => at(scene, 0, 0.68) + i * 4;
  const demo = at(scene, 1, 0.12); // arrows into (1,1)
  const t11 = at(scene, 1, 0.42);
  const tX = at(scene, 1, 0.84);
  const restAt = (i: number) => l2 + 10 + i * 7;
  const items: { p: Pt; t: number }[] = [...EDGE.map((p, i) => ({ p, t: edgeAt(i) })), { p: [1, 1], t: t11 }, { p: XC, t: tX }, ...REST.map((p, i) => ({ p, t: restAt(i) }))];
  const zoom = 1 + 0.4 * ease(f, l1, 12) - 0.4 * ease(f, l2, 10);
  const arrows = ease(f, demo, 8) * fadeTo(f, l2, 0, 8);
  const m11 = BIG([1, 1]);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {EDGE.map((_, i) => (i % 2 === 0 ? <Sfx key={`e${i}`} at={edgeAt(i)} src={SFX.click} volume={0.22} /> : null))}
      <Sfx at={l1} src={SFX.whoosh} volume={0.25} />
      <Sfx at={t11} src={SFX.click} volume={0.3} />
      <Sfx at={tX} src={SFX.buzz} volume={0.15} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {REST.map((_, i) => (i % 2 === 0 ? <Sfx key={`r${i}`} at={restAt(i)} src={SFX.click} volume={0.28} /> : null))}

      <Text x={540} y={290} w={1040} size={76} weight={900} align="center" style={fadeUp(f, 0)}>
        Ways to reach <span style={{ color: C.primary }}>each corner</span>
      </Text>
      <Readout
        steps={[
          [edgeAt(0), '\\text{edges: } 1'],
          [at(scene, 1, 0.05), '\\text{corner} = \\text{left} + \\text{below}'],
          [t11, '1 + 1 = 2'],
          [tX, '\\color{#ef4343}{X = 0}'],
          ...REST.map((p, i): [number, string] => [restAt(i), `${val([p[0] - 1, p[1]])} + ${val([p[0], p[1] - 1])} = ${val(p)}`]),
        ]}
      />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${m11[0] - 55}px 640px` }}>
        <Stage>
          <Streets m={BIG} labels={56} lo={1.0} />
          <Arrow a={[BIG([0, 1])[0] + 46, m11[1]]} b={[m11[0] - 48, m11[1]]} color={C.amber} opacity={arrows} />
          <Arrow a={[m11[0], BIG([1, 0])[1] - 46]} b={[m11[0], m11[1] + 48]} color={C.amber} opacity={arrows} />
          {items.map(({ p, t }) => (
            <Num key={`${p}`} p={BIG(p)} value={val(p)} s={pop(f, t, fps)} color={isPt(p, XC) ? C.red : C.primary} />
          ))}
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center', ...fadeUp(f, l2 + 4) }}>
        <Tex tex="\text{corner} = \text{left} + \text{below}" size={62} />
      </div>
    </>
  );
};

/** B = 17 + 9 pops on the answer word; the trap; then the CTA pill under the grid (same place as frame 0). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = at(scene, 0, 0.76);
  const chime = at(scene, 0, 0.97);
  const pB = BIG(B);
  const hi = (p: Pt) => isPt(p, [4, 3]) || isPt(p, [5, 2]);
  const arrows = ease(f, at(scene, 0, 0.12), 8);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '8px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="26" size={110} color="#fff" />
          <span style={{ fontSize: 66, fontWeight: 900 }}>paths</span>
        </div>
      </div>
      <Stage>
        <Streets m={BIG} labels={56} lo={1.0} />
        <Arrow a={[BIG([4, 3])[0] + 46, pB[1]]} b={[pB[0] - 52, pB[1]]} color={C.amber} opacity={arrows} />
        <Arrow a={[pB[0], BIG([5, 2])[1] - 46]} b={[pB[0], pB[1] + 52]} color={C.amber} opacity={arrows} />
        {[...EDGE, [1, 1] as Pt, XC, ...REST].map((p) => (
          <Num key={`${p}`} p={BIG(p)} value={val(p)} s={1} color={isPt(p, XC) ? C.red : hi(p) && arrows > 0 ? C.amber : C.primary} />
        ))}
        <Num p={pB} value={val(B)} s={pop(f, hit, fps)} color={C.green} hi r={50} />
      </Stage>
      <Text x={490} y={1125} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        56 forgets about X ✗
      </Text>
      <CtaPill start={at(scene, 2)} y={1205} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, fill: Fill, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

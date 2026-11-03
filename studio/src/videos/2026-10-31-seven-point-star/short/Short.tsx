import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { range, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Base, CHIME, Chords, DEG, LapPie, SLUG, TIP, TURN, TipArc, TurnArc, Walker, arcOp, cT, cU, lapOf, linear, mkG, pt, vert } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (180, the five-point star), question, comment bait, the pencil walk big with a zoom
// onto the first turn and a lap counter, then the answer. The last frame shows the hook's star at the same place.

const G = mkG(510, 930, 340); // the big star: hook, pencil, reveal
const GQ = mkG(540, 815, 190); // the question's smaller star (room for the card and the choices)
const CHOICES = ['180', '360', '540', '720', '900'];
const before = () => -100;

/** The finished star with all seven tip angles shaded (the hook's frame 0 and the reveal's last frame). */
const Star: React.FC<{ g?: ReturnType<typeof mkG>; tipOp?: (v: number) => number; size?: number; off?: number }> = ({ g = G, tipOp = () => 1, size = 58, off = 62 }) => (
  <Stage>
    <Base g={g} letters={1} size={size} off={off} />
    <Chords g={g} p={7} width={9} />
    {range(7).map((v) => <TipArc key={v} g={g} v={v} r={g.R * 0.16} op={tipOp(v)} />)}
  </Stage>
);

const Row: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const Chip: React.FC<{ color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ color = C.ink, children, style }) => (
  <div style={{ background: C.card, border: `5px solid ${color}`, color, borderRadius: 999, padding: '6px 36px', fontSize: 64, fontWeight: 900, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', ...style }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Row y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #11</div>
      </Row>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>180°</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${G.cx}px ${G.cy}px`}>
        <Star />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Row y={820} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Row>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.33, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>7 points</b> evenly spaced, each joined to the <b>2nd point after it</b>. <b style={{ color: TIP }}>Sum of the 7 tip angles?</b>
      </div>
      <Star g={GQ} size={48} off={50} />
      <div style={{ position: 'absolute', left: 60, top: 1065, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
      <CommentBubble />
    </>
  );
};

/** The aha: the pencil walks A → C and turns (zoom in on C: tip + turn = 180), then walks the whole star twice round. */
const PencilWalk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const zIn = at(scene, 0, 0.3);
  const zOut = l1 - 6;
  const p = f < l1 ? linear(f, at(scene, 0, 0.06), at(scene, 0, 0.5), 0, 1.6) : linear(f, at(scene, 1, 0.04), at(scene, 1, 0.86), 1.6, 7);
  const fin = linear(f, at(scene, 1, 0.88), at(scene, 1, 0.98), 0, 1);
  const z = ease(f, zIn, 14) - ease(f, zOut, 14);
  const C1 = pt(G, vert(G, 1));
  // zoom 1.5x and slide C to (430, 860)
  const zs = 1 + 0.5 * z;
  const tx = z * (430 - 1.5 * C1[0]);
  const ty = z * (860 - 1.5 * C1[1]);
  const labels = ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, zOut, 0, 8);
  const lapOp = ease(f, l1, 10);
  const lap = lapOf(p, G);
  // frame where the pencil reaches vertex m on the long walk (p goes 1.15 → 7 linearly)
  const reach = (m: number) => at(scene, 1, 0.04) + ((m - 1.6) / (7 - 1.6)) * (at(scene, 1, 0.86) - at(scene, 1, 0.04));
  const lap2 = reach(3.5);
  const lapPop = f >= lap2 ? pop(f, lap2) : pop(f, l1);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={at(scene, 0, 0.33)} src={SFX.click} volume={0.3} />
      {[2, 3, 4, 5, 6, 7].map((m) => <Sfx key={m} at={reach(m)} src={SFX.click} volume={m % 2 ? 0.22 : 0.28} />)}
      <Sfx at={lap2} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${zs})`, transformOrigin: '0 0' }}>
        <Stage>
          <Base g={G} letters={1} size={58} off={62} />
          <Chords g={G} p={7} color={C.muted} width={5} op={0.4} dash />
          <Chords g={G} p={p} color={C.ink} width={9} />
          <LapPie g={G} p={p} op={lapOp} r={70} />
          {range(7).map((m0) => {
            const m = m0 + 1;
            const v = vert(G, m);
            const o = m === 7 ? fin : arcOp(p, m);
            if (m === 1) {
              return (
                <g key={m}>
                  <TurnArc g={G} v={v} r={56} op={o} label={labels > 0.05 ? 'turn' : undefined} size={54} />
                  <TipArc g={G} v={v} r={60} op={o * ease(f, at(scene, 0, 0.5), 10)} label={labels > 0.05 ? 'tip' : undefined} labelR={118} size={54} />
                </g>
              );
            }
            return (
              <g key={m}>
                <TurnArc g={G} v={v} r={44} op={o * 0.9} ext={m === 7} />
                <TipArc g={G} v={v} r={52} op={o * 0.9} />
              </g>
            );
          })}
          <Walker g={G} p={p} op={ease(f, 2, 10)} fin={fin} />
        </Stage>
      </div>
      <Row y={285} style={fadeUp(f, at(scene, 0, 0.6))}>
        <Chip>
          <Tex tex={`${cT('\\text{tip}')} + ${cU('\\text{turn}')} = 180${DEG}`} size={64} />
        </Chip>
      </Row>
      <Row y={410} style={{ opacity: lapOp * fadeTo(f, l2, 0, 8) }}>
        <Chip color={TURN} style={{ transform: `scale(${lapPop})` }}>
          circle {lap}
        </Chip>
      </Row>
      <Row y={410} style={fadeUp(f, l2 + 4)}>
        <Chip color={TURN}>
          <Tex tex={`2 \\times 360${DEG} = 720${DEG}`} size={64} color={TURN} />
          <span style={{ marginLeft: 18 }}>turning</span>
        </Chip>
      </Row>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the hook's star (so the loop cuts cleanly). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.66);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const cta = at(scene, 2);
  return (
    <>
      <Star />
      <Row y={285} style={fadeUp(f, at(scene, 0, 0.05))}>
        <Tex tex={`7 \\times 180${DEG} - 720${DEG} =`} size={66} />
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, borderRadius: 26, padding: '8px 30px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={`540${DEG}`} size={84} color="#fff" />
        </div>
      </Row>
      <Text x={540} y={415} w={1000} size={60} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, trap + 3), opacity: ease(f, trap + 3, 12) * fadeTo(f, cta - 4, 0, 8) }}>
        180° is the 5-point star
      </Text>
      <CtaPill start={cta} y={405} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={720} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pencil: PencilWalk, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

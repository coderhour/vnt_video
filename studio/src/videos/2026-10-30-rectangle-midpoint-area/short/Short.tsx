import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BOT, CHIME, CHOICES, Figure, Label, Q, SLUG, SimilarMarks, TOP, plane } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (48 = the big triangle, corner kept), question, comment bait, then the big
// triangle ACD (48) minus the small corner PCM: zoom onto the corner, similar triangles give its height 8/3, area 8.
// Frame 0 and the last frame show the same big figure at the same place, so the loop cuts cleanly.

const before = () => -100;

const M = plane(110, 1100, 64); // rectangle 768 × 512: x 110…878, y 588…1100
const LS = 56;

/** HTML maths centred (or left-aligned) on a pixel point. */
const TexAt: React.FC<{ p: Pt; tex: string; size?: number; color?: string; opacity?: number; left?: boolean }> = ({ p, tex, size = 56, color = C.ink, opacity = 1, left }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: left ? 'translate(0, -50%)' : 'translate(-50%, -50%)', whiteSpace: 'nowrap', opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

/** Centred maths readout at `y`, visible between `start` and `end`. */
const Mid: React.FC<{ y: number; start: number; end?: number; tex: string; size?: number; color?: string }> = ({ y, start, end = 99999, tex, size = 76, color = C.ink }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start, 8);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * fadeTo(f, end, 0, 6) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Opens on the figure (the same figure the video ends on), then stamps the trap answer 48. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #19</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>48</span>?
      </Text>
      <PushIn frames={scene.frames} origin="494px 844px">
        <Stage>
          <Figure g={Q} m={M} letterSize={LS} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 740, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QM = plane(170, 1010, 56); // question figure 672 × 448: y 562…1010

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '22px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.3, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>12 by 8</b> rectangle, <b style={{ color: C.violet }}>M</b> = midpoint of the top. Shaded area <b style={{ color: C.primary }}>APMD</b>?
      </div>
      <Stage>
        <Figure g={Q} m={QM} letterSize={52} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1090, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const [PX, PY] = M(Q.P);
const [CX, CY] = M(Q.C);
const [MX] = M(Q.M);
const [, AY] = M(Q.A);
const CORNER = `${(PX + CX + MX) / 3}px ${(PY + 2 * CY) / 3}px`;

/** The aha: big triangle ACD (48), zoom onto the missing corner PCM, similar triangles → height 8/3, area 8. */
const Minus: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const tri = ease(f, at(scene, 0, 0.3), 24);
  const cut = ease(f, at(scene, 1, 0.45), 10);
  const bot = ease(f, l2 + 4, 10);
  const angles = ease(f, at(scene, 2, 0.3), 12);
  const heights = ease(f, at(scene, 2, 0.55), 10);
  const parts = ease(f, at(scene, 2, 0.75), 10);
  const widths = ease(f, at(scene, 2, 0.1), 10);
  const area8 = at(scene, 3, 0.85);
  // zoom 1 onto the corner while it's named; zoom 2 onto it again while its area is worked out
  const z = 0.3 * (ease(f, at(scene, 1, 0.4), 12) - ease(f, l2, 12)) + 0.2 * (ease(f, at(scene, 3, 0.55), 12) - ease(f, scene.frames - 18, 12));
  const blink = f >= at(scene, 1, 0.45) && f < l2 ? 0.15 * Math.sin(((f - at(scene, 1, 0.45)) / 8) * Math.PI) : 0;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.3)} src={SFX.click} volume={0.26} />
      <Sfx at={at(scene, 0, 0.8)} src={SFX.click} volume={0.3} />
      <Sfx at={at(scene, 1, 0.4)} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.22} />
      <Sfx at={at(scene, 2, 0.1)} src={SFX.click} volume={0.26} />
      <Sfx at={at(scene, 2, 0.75)} src={SFX.click} volume={0.28} />
      <Sfx at={at(scene, 3, 0.55)} src={SFX.whoosh} volume={0.25} />
      <Sfx at={area8} src={SFX.click} volume={0.3} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + z})`, transformOrigin: CORNER }}>
        <Stage>
          <Figure g={Q} m={M} shade={1 - tri * 0.75} letterSize={LS} dims={fadeTo(f, l2, 0, 8)}>
            <Poly pts={[Q.A, Q.C, Q.D].map(M)} color={C.violet} width={8} fill={C.violet} fillOpacity={0.2} progress={tri} opacity={fadeTo(f, l2, 0.35, 10)} />
            <Poly pts={BOT(Q).map(M)} color={C.blue} width={6} fill={C.blue} fillOpacity={0.2} opacity={bot} />
            <Poly pts={TOP(Q).map(M)} color={C.red} width={7} fill={C.red} fillOpacity={0.4 + blink} opacity={cut} />
            <SimilarMarks g={Q} m={M} tri={0} angles={angles} heights={heights} parts={parts} />
          </Figure>
          <Label p={[(MX + CX) / 2, CY - 46]} text="6" color={C.red} size={LS} opacity={widths} />
          <Label p={[(M(Q.A)[0] + M(Q.B)[0]) / 2, AY + 50]} text="12" color={C.blue} size={LS} opacity={widths} />
        </Stage>
        <TexAt p={[CX + 46, (CY + PY) / 2]} left tex="\dfrac{8}{3}" size={56} color={C.red} opacity={parts} />
        <TexAt p={[CX + 46, PY + 110]} left tex="\dfrac{16}{3}" size={56} color={C.blue} opacity={parts} />
        <TexAt p={[(PX + CX + MX) / 3 + 10, (PY + 2 * CY) / 3 + 6]} tex="8" size={60} color="#fff" opacity={ease(f, area8, 6)} />
      </div>

      {/* readouts, one idea at a time */}
      <Mid y={290} start={at(scene, 0, 0.3)} end={l1} tex="12 \times 8 = 96" size={80} />
      <Mid y={400} start={at(scene, 0, 0.75)} end={l1} tex="\text{half: } {\color{#7b61ff}48}" size={72} />
      <Mid y={300} start={l1 + 2} end={l2} tex="{\color{#7b61ff}48} - {\color{#ef4343}\text{PCM}}" size={84} />
      <Mid y={290} start={at(scene, 2, 0.1)} end={l3} tex="{\color{#ef4343}6} = \tfrac{1}{2} \text{ of } {\color{#3c83f6}12}" size={76} />
      <Mid y={400} start={at(scene, 2, 0.75)} end={l3} tex="8 = {\color{#ef4343}\tfrac{8}{3}} + {\color{#3c83f6}\tfrac{16}{3}}" size={72} />
      <Mid y={290} start={l3 + 2} end={at(scene, 3, 0.58)} tex="6 \times \dfrac{8}{3} = 16" size={76} />
      <Mid y={310} start={at(scene, 3, 0.62)} tex="16 \div 2 = {\color{#ef4343}8}" size={84} />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same figure (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  const trap = ease(f, at(scene, 1, 0.05), 8);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${f >= hit ? pop(f, hit) : 0})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="48 - 8 = 40" size={96} color="#fff" />
        </div>
      </div>
      <Stage>
        <Figure g={Q} m={M} letterSize={LS}>
          <Poly pts={TOP(Q).map(M)} color={C.red} width={7} fill={C.red} fillOpacity={0.12} opacity={trap} dashed />
        </Figure>
      </Stage>
      <Text x={527} y={985} w={560} size={48} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        48 keeps the corner
      </Text>
      <CtaPill start={at(scene, 2)} y={1200} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, minus: Minus, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

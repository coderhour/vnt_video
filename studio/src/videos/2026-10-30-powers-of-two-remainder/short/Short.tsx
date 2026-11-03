import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Chip, SLUG } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (0 = only 99 terms), question, comment bait, the remainder cycle (big cards, zoom on
// 8 = 7 + 1), then the 33 groups + the extra 2^99 strip, which is also the hook's figure so the loop cuts cleanly.

const before = () => -100;
const never = 99999;

/** Grey "?" chip for a remainder not found yet. */
const QChip: React.FC<{ d: number }> = ({ d }) => (
  <div style={{ width: d, height: d, borderRadius: '50%', background: C.line, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: d * 0.6, fontWeight: 900 }}>?</div>
);

const GW = 326;
/** One group of three powers with their remainder chips (1, 2, 4). Turns green (= 7, leaves nothing) at `green`. */
const Group: React.FC<{ x: number; y: number; k0: number; appear: number; green: number }> = ({ x, y, k0, appear, green }) => {
  const f = useCurrentFrame();
  const g = ease(f, green, 8);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: GW, boxSizing: 'border-box', background: C.card, borderRadius: 26, padding: '10px 10px 30px', boxShadow: `0 0 0 ${6 * g}px ${C.green}, 0 4px 14px rgba(30,40,80,0.08)`, display: 'flex', justifyContent: 'space-between', ...fadeUp(f, appear, 8) }}>
      {[0, 1, 2].map((j) => (
        <div key={j} style={{ width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ height: 70, display: 'flex', alignItems: 'center' }}>
            <Tex tex={`2^{${k0 + j}}`} size={58} />
          </div>
          <Chip r={[1, 2, 4][j]} d={90} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: GW / 2 - 40, width: 80, textAlign: 'center', bottom: -30, opacity: g, transform: `scale(${pop(f, green)})`, background: C.green, color: '#fff', borderRadius: 999, padding: '2px 18px', fontSize: 44, fontWeight: 900 }}>7</div>
    </div>
  );
};

const STRIP_Y = 530;
const LEFT = { x: 540, y: STRIP_Y + 330, w: 220 };
/** The 100 terms: groups 1–3, "…", group 33, plus the extra 2^99. Shared by the hook, the aha and the reveal. */
const Strip: React.FC<{ a: [number, number, number, number, number]; green: number; rem: number; ring?: number; mid?: React.ReactNode }> = ({ a, green, rem, ring = 0, mid }) => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Group key={i} x={31 + i * (GW + 20)} y={STRIP_Y} k0={3 * i} appear={a[i]} green={green + i * 3} />
      ))}
      <div style={{ position: 'absolute', left: 60, width: 860, top: STRIP_Y + 236, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 64, fontWeight: 900, color: C.violet }}>
        {mid ?? <Tex tex="\cdots" size={72} />}
      </div>
      <Group x={100} y={LEFT.y} k0={96} appear={a[3]} green={green + 9} />
      <div style={{ position: 'absolute', left: 452, top: LEFT.y + 70, ...fadeUp(f, a[4], 8) }}>
        <Tex tex="+" size={72} />
      </div>
      <div style={{ position: 'absolute', left: LEFT.x, top: LEFT.y, width: LEFT.w, boxSizing: 'border-box', background: C.card, borderRadius: 26, padding: '10px 0 24px', border: `6px solid ${C.amber}`, boxShadow: `0 0 0 ${12 * ring}px rgba(245,159,10,${0.45 * ring})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, ...fadeUp(f, a[4], 8) }}>
        <div style={{ height: 70, display: 'flex', alignItems: 'center' }}>
          <Tex tex="2^{99}" size={58} />
        </div>
        {f >= rem ? <div style={{ transform: `scale(${pop(f, rem)})` }}><Chip r={1} d={90} /></div> : <QChip d={90} />}
      </div>
    </>
  );
};

/** Opens on the strip (the same strip the video ends on), then stamps the trap answer 0. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #47</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>0</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 780px">
        <Strip a={[-100, -100, -100, -100, -100]} green={never} rem={never} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 640, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        Add 1, 2, 4, 8, … and keep <b style={{ color: C.primary }}>doubling</b>, up to <b style={{ color: C.violet }}>2⁹⁹</b>. What's the <b style={{ color: C.primary }}>remainder</b> when you divide by <b style={{ color: C.blue }}>7</b>?
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 650, textAlign: 'center', whiteSpace: 'nowrap' }}>
        <Tex tex="1 + 2 + 4 + 8 + \cdots + 2^{99}" size={76} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 790, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, fontSize: 64, fontWeight: 900 }}>
        <Tex tex="\div\, 7" size={76} color={C.blue} />
        <span style={{ color: C.muted }}>→</span>
        <span>remainder</span>
        <QChip d={90} />
      </div>
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 36px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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

const CARDS = [
  { k: 0, v: 1, r: 1 }, { k: 1, v: 2, r: 2 }, { k: 2, v: 4, r: 4 },
  { k: 3, v: 8, r: 1 }, { k: 4, v: 16, r: 2 }, { k: 5, v: 32, r: 4 },
];
const CARD_X = (i: number) => 50 + (i % 3) * 335;
const CARD_Y = (i: number) => (i < 3 ? 420 : 660);
const SPLITS = ['8 = 7 + {\\color{#0cc281}1}', '16 = 14 + {\\color{#7b61ff}2}', '32 = 28 + {\\color{#3c83f6}4}'];

/** Big remainder cards (zoom on 8 = 7 + 1), then the strip of 33 groups + the extra term (zoom on 2^99). */
const Cycle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const cardIn = [-100, -100, -100, at(scene, 0, 0.55), at(scene, 0, 0.84), at(scene, 0, 0.9)];
  const chipIn = [at(scene, 0, 0.3), at(scene, 0, 0.37), at(scene, 0, 0.44), at(scene, 0, 0.68), at(scene, 0, 0.87), at(scene, 0, 0.93)];
  const partA = fadeTo(f, l2, 0, 8);
  const partB = ease(f, l2 + 2, 8);
  // zoom 1: onto 2^3 = 8 while "eight leaves one again"; zoom 2: onto the extra 2^99 while it leaves one
  const z1 = ease(f, at(scene, 0, 0.55), 10) - ease(f, at(scene, 0, 0.82), 10);
  const z2 = ease(f, at(scene, 3, 0.15), 12) - ease(f, scene.frames - 26, 14);
  // the group counter climbs 1 → 33 during "thirty-three groups"
  const g0 = l2 + 6;
  const gEnd = at(scene, 2, 0.55);
  const n = Math.max(1, Math.min(33, 1 + Math.floor(((f - g0) / (gEnd - g0)) * 32)));
  const gAt = (k: number) => g0 + ((k - 1) / 32) * (gEnd - g0);
  const split = f < cardIn[4] ? 0 : f < cardIn[5] ? 1 : 2;
  const rowGreen = [at(scene, 1, 0.45), at(scene, 1, 0.58)];
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {chipIn.map((c, i) => <Sfx key={i} at={c} src={SFX.click} volume={0.26} />)}
      <Sfx at={at(scene, 0, 0.55)} src={SFX.whoosh} volume={0.25} />
      {rowGreen.map((c, i) => <Sfx key={`r${i}`} at={c} src={SFX.click} volume={0.3} />)}
      <Sfx at={l2} src={SFX.whoosh} volume={0.28} />
      {[1, 4, 7, 10, 14, 18, 22, 26, 30, 33].map((k) => <Sfx key={`g${k}`} at={gAt(k)} src={SFX.click} volume={0.22} />)}
      <Sfx at={at(scene, 3, 0.15)} src={SFX.whoosh} volume={0.25} />
      <Sfx at={at(scene, 3, 0.72)} src={SFX.click} volume={0.3} />
      <Sfx at={scene.frames - 26} src={SFX.whoosh} volume={0.22} />

      {/* part A: remainder cards */}
      <div style={{ opacity: partA }}>
        <Text style={{ opacity: 1 - z1 }} x={540} y={290} w={1000} size={84} weight={900} align="center">
          Remainders <span style={{ color: C.blue }}>÷ 7</span>
        </Text>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.4 * z1})`, transformOrigin: '205px 760px' }}>
          {[0, 1].map((row) => (
            <div key={row} style={{ position: 'absolute', left: 32, top: CARD_Y(row * 3) - 16, width: 1016, height: 246, borderRadius: 32, boxSizing: 'border-box', border: `6px solid ${C.green}`, opacity: ease(f, rowGreen[row], 8) }} />
          ))}
          {CARDS.map((c, i) => (
            <div key={i} style={{ position: 'absolute', left: CARD_X(i), top: CARD_Y(i), width: 310, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...fadeUp(f, cardIn[i], 8) }}>
              <div style={{ width: 310, boxSizing: 'border-box', background: C.card, borderRadius: 22, padding: '12px 0', textAlign: 'center', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', border: `5px solid ${i === 3 ? C.amber : 'transparent'}`, whiteSpace: 'nowrap' }}>
                <Tex tex={`2^{${c.k}} = ${c.v}`} size={64} />
              </div>
              <div style={{ opacity: ease(f, chipIn[i], 5), transform: `scale(${f >= chipIn[i] ? pop(f, chipIn[i]) : 0})` }}>
                <Chip r={c.r} d={100} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 935, display: 'flex', justifyContent: 'center', opacity: ease(f, cardIn[3], 8) * fadeTo(f, l1, 0, 6) }}>
          <div style={{ background: C.card, borderRadius: 24, padding: '10px 36px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
            <Tex tex={SPLITS[split]} size={72} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 935, display: 'flex', justifyContent: 'center', opacity: ease(f, l1 + 2, 8) }}>
          <Tex tex="1 + 2 + 4 = 7 \;\checkmark" size={80} color={C.green} />
        </div>
        <Text x={490} y={1060} w={860} size={64} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 1, 0.62))}>
          each group leaves 0
        </Text>
      </div>

      {/* part B: 100 terms = 33 groups + 1 */}
      <div style={{ opacity: partB }}>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', opacity: 1 - z2 }}>
          <Tex tex="100 = 33 \times 3 + 1" size={84} />
        </div>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.4 * z2})`, transformOrigin: `${LEFT.x + LEFT.w / 2}px ${LEFT.y + 100}px` }}>
          <Strip
            a={[gAt(1), gAt(2), gAt(3), gAt(33), at(scene, 2, 0.8)]}
            green={l2 + 2}
            rem={at(scene, 3, 0.72)}
            ring={ease(f, at(scene, 3, 0.15), 8)}
            mid={<span style={{ background: C.violet, color: '#fff', borderRadius: 24, padding: '4px 34px' }}>{n} {n === 1 ? 'group' : 'groups'}</span>}
          />
        </div>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 3, 0.3)) }}>
          <Tex tex="\text{power } 99 = 3 \times 33" size={64} color={C.amber} />
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same strip (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 0.98);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${f >= hit ? pop(f, hit) : 0})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 70, fontWeight: 900 }}>remainder</span>
          <Tex tex="1" size={116} color="#fff" />
        </div>
      </div>
      <Strip a={[-100, -100, -100, -100, -100]} green={-100} rem={-100} ring={1} />
      <Text x={490} y={1095} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        0 forgets the last term
      </Text>
      <CtaPill start={at(scene, 2)} y={1190} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, cycle: Cycle, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

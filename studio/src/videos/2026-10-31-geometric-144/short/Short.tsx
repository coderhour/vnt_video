import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, SLUG } from '../Composition';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);

// Trap-first AMC 10 short: hook on the k-table (12 rows, the 12th ringed), question, comment bait, the aha
// (144 = 12², so b = 12k, a = k²; a big a → b → 144 readout follows k, zoom onto k = 12), reveal over the same table.

/** Ratio from b to c (and a to b) for k: 12 / k in lowest terms. */
const ratioTex = (k: number) => {
  const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
  const d = g(12, k);
  return k === 12 ? '\\times 1' : d === k ? `\\times ${12 / k}` : `\\times \\dfrac{${12 / d}}{${k / d}}`;
};

const BW = 210;
const GAP = 170;
const X0 = 55;
/** a → b → c chain, three big boxes with the ratio over each arrow. */
const Chain: React.FC<{ y: number; vals: React.ReactNode[]; ratio: string; color?: string; scale?: number }> = ({ y, vals, ratio, color = C.ink, scale = 1 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: `540px ${y + 65}px` }}>
    {vals.map((v, i) => (
      <div key={i} style={{ position: 'absolute', left: X0 + i * (BW + GAP), top: y, width: BW, height: 130, borderRadius: 28, background: C.card, border: `6px solid ${i === 2 ? C.violet : color === C.ink ? C.line : color}`, color: i === 2 ? C.violet : color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 900, boxShadow: '0 8px 24px rgba(30,40,80,0.08)' }}>
        {v}
      </div>
    ))}
    {[0, 1].map((i) => (
      <div key={`r${i}`}>
        <div style={{ position: 'absolute', left: X0 + BW + i * (BW + GAP), top: y - 70, width: GAP, height: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', whiteSpace: 'nowrap' }}>
          <Tex tex={ratio} size={50} color={C.amber} />
        </div>
        <svg style={{ position: 'absolute', left: X0 + BW + i * (BW + GAP), top: y + 70 }} width={GAP} height={30} viewBox={`0 0 ${GAP} 30`}>
          <path d={`M14 15 H${GAP - 16} M${GAP - 36} 3 L${GAP - 12} 15 L${GAP - 36} 27`} stroke={C.amber} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ))}
  </div>
);

const TABLE_Y = 640;
/** Rows k = 1…12: k², 12k, 144, in two columns of six (x 60…920). */
const rowPos = (k: number) => ({ x: k <= 6 ? 60 : 500, y: TABLE_Y + ((k - 1) % 6) * 90 });
const Table: React.FC<{ show: (k: number) => number; state?: (k: number) => 'plain' | 'good' | 'bad'; ring?: number; ringColor?: string }> = ({ show, state = () => 'plain', ring, ringColor = C.amber }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => {
      const k = i + 1;
      const o = show(k);
      if (o <= 0) return null;
      const s = state(k);
      const { x, y } = rowPos(k);
      return (
        <div key={k} style={{ position: 'absolute', left: x, top: y, width: 420, height: 80, borderRadius: 20, opacity: o, transform: `scale(${0.85 + 0.15 * o})`, background: s === 'good' ? C.green : s === 'bad' ? C.red : C.card, color: s === 'plain' ? C.ink : '#fff', boxShadow: ring === k ? `0 0 0 7px ${ringColor}` : '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900, whiteSpace: 'nowrap' }}>
          {k * k}, {12 * k}, 144
        </div>
      );
    })}
  </>
);

const all = () => 1;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #11</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>12</span>?
      </Text>
      <PushIn frames={scene.frames} origin="490px 900px">
        {/* only the header and the trap row: the 11 good rows stay hidden, so the answer can't be counted on frame 0 */}
        <div style={{ position: 'absolute', left: 60, width: 860, top: 580, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: C.card, borderRadius: 24, padding: '10px 44px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
            <Tex tex={`k^2,\\ 12k,\\ {\\color{${C.violet}}144}`} size={80} />
          </div>
        </div>
        <Table show={(k) => (k === 12 ? 1 : 0)} state={(k) => (k === 12 && f >= nope ? 'bad' : 'plain')} ring={12} ringColor={C.red} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 980, top: 760, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        How many <b style={{ color: C.primary }}>increasing geometric</b> sequences <i>a, b, c</i> of <b style={{ color: C.violet }}>whole numbers</b> end at <b style={{ color: C.violet }}>c = 144</b>?
      </div>
      <Chain y={650} vals={['a', 'b', '144']} ratio="\times r" />
      <div style={{ position: 'absolute', left: 60, top: 860, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.55 + i * 0.07)} />
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

const Twelve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  // row k shows at rowAt(k): k = 1, 2 with "k equals two", the rest sweep in after the spoken chain, k = 12 on "twelve"
  const rowAt = (k: number) => (k === 1 ? l2 + 2 : k === 2 ? l2 + 12 : k === 12 ? at(scene, 3, 0.2) : at(scene, 2, 0.8) + (k - 3) * 5);
  let cur = 1;
  for (let k = 1; k <= 12; k++) if (f >= rowAt(k)) cur = k;
  const bump = 1 + 0.07 * (1 - ease(f, rowAt(cur), 8));
  const tableOn = ease(f, l2, 10);
  const zoom = 1 + 0.4 * ease(f, at(scene, 3, 0.15), 12) - 0.4 * ease(f, at(scene, 3, 0.9), 10);
  const bad = cur === 12;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.5)} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 1, 0.1)} src={SFX.click} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      <Sfx at={rowAt(2)} src={SFX.click} volume={0.25} />
      {[3, 5, 7, 9, 11].map((k) => <Sfx key={k} at={rowAt(k)} src={SFX.click} volume={0.22} />)}
      <Sfx at={at(scene, 3, 0.15)} src={SFX.whoosh} volume={0.25} />
      <Sfx at={rowAt(12)} src={SFX.buzz} volume={0.18} />
      <Text x={540} y={260} w={1000} size={100} weight={900} align="center">
        144 = <span style={{ color: C.violet }}>12²</span>
      </Text>
      {/* lines 1–2: the algebra, big, where the table will go */}
      <div style={{ opacity: fadeTo(f, l2, 0, 8) }}>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 520, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.45)) }}>
          <Tex tex={'a = \\left(\\dfrac{b}{12}\\right)^{2}'} size={104} />
        </div>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 860, display: 'flex', justifyContent: 'center', ...fadeUp(f, l1 + 4) }}>
          <Tex tex={`b = 12\\,{\\color{${C.amber}}k}`} size={104} />
        </div>
        <div style={{ position: 'absolute', left: 60, width: 860, top: 1020, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.55)) }}>
          <div style={{ background: C.amber, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 60, fontWeight: 900 }}>k = whole number</div>
        </div>
      </div>
      {/* lines 3–4: the readout chain follows k; the table fills, then zooms onto k = 12 */}
      <div style={{ opacity: tableOn }}>
        <Chain y={470} vals={[cur * cur, 12 * cur, 144]} ratio={ratioTex(cur)} color={bad ? C.red : C.primary} scale={bump} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 620, width: 1080, height: 620, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -620, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: '920px 1110px' }}>
          <Table show={(k) => ease(f, rowAt(k), 6) * (k === 12 ? 1 : 1 - 0.7 * (zoom - 1) / 0.4)} state={(k) => (k === 12 ? 'bad' : 'plain')} ring={cur} ringColor={bad ? C.red : C.amber} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 690, display: 'flex', justifyContent: 'center', opacity: ease(f, at(scene, 3, 0.7), 4) * fadeTo(f, at(scene, 3, 0.9), 0, 8) }}>
        <div style={{ transform: `rotate(-6deg) scale(${pop(f, at(scene, 3, 0.7))})`, background: C.red, color: '#fff', borderRadius: 24, padding: '10px 40px', fontSize: 66, fontWeight: 900 }}>not increasing ✗</div>
      </div>
      <Sfx at={at(scene, 3, 0.7)} src={SFX.click} volume={0.3} />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same table as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.64);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="11" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>sequences</span>
        </div>
      </div>
      <Text x={540} y={480} w={1000} size={64} weight={900} color={C.green} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.2)), opacity: ease(f, at(scene, 0, 0.2), 10) * fadeTo(f, trap, 0, 6) }}>
        k = 1, 2, … , 11 ✓
      </Text>
      <Text x={540} y={480} w={1000} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap + 4)}>
        12 adds 144, 144, 144 ✗
      </Text>
      <Table show={all} state={(k) => (k === 12 ? 'bad' : f >= at(scene, 0, 0.2) + (k - 1) * 2 ? 'good' : 'plain')} ring={f >= trap ? 12 : undefined} ringColor={C.red} />
      <CtaPill start={at(scene, 2)} y={1190} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, twelve: Twelve, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

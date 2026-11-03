import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BASE, Beaker, CHIME, CH, JD, SLUG, WD } from '../Composition';

export { SLUG };

// New recipe (~40 s): trap-first hook (4 L = the juice she adds), question, comment bait, the split-each-drink aha
// with a zoom onto the water, then the answer. Hook and reveal share one beaker layout so the loop cuts cleanly.

// Beakers are drawn in the long video's absolute-pixel layout (bottom at BASE = 824); Shift moves them down.
const DY = 356; // beaker bottoms at y 1180
const SC = 22; // px per liter (25 L = 550 px)
const X1 = 60;
const X2 = 560;
const W = 300;

const Shift: React.FC<{ dy?: number; children: React.ReactNode }> = ({ dy = DY, children }) => (
  <div style={{ position: 'absolute', left: 0, top: dy, width: 1080, height: 1200 }}>{children}</div>
);

/** Bracket on the right of a beaker from L1 to L2 liters, with a label. */
const Br: React.FC<{ x: number; L1: number; L2: number; label: React.ReactNode; color: string; op: number; scale?: number; left?: boolean }> = ({ x, L1, L2, label, color, op, scale = 1, left = false }) => {
  if (op <= 0) return null;
  const top = BASE - L2 * SC;
  const h = (L2 - L1) * SC;
  return (
    <div style={{ opacity: op, transform: `scale(${scale})`, transformOrigin: `${x}px ${top + h / 2}px` }}>
      <div style={{ position: 'absolute', left: left ? x - 22 : x, top, width: 22, height: h, borderStyle: 'solid', borderWidth: left ? '6px 0 6px 6px' : '6px 6px 6px 0', borderColor: color, borderRadius: left ? '8px 0 0 8px' : '0 8px 8px 0' }} />
      <div style={{ position: 'absolute', left: left ? x - 36 : x + 36, top: top + h / 2, transform: `translate(${left ? '-100%' : '0'}, -50%)`, fontSize: 60, fontWeight: 900, color, whiteSpace: 'nowrap', textAlign: left ? 'right' : 'left' }}>{label}</div>
    </div>
  );
};

/** "+ juice / + water" between the beakers. */
const Plus: React.FC<{ op?: number; x1?: number; x2?: number; top?: number }> = ({ op = 1, x1 = X1 + W, x2 = X2, top = 330 }) => (
  <div style={{ position: 'absolute', left: x1, width: x2 - x1, top, textAlign: 'center', fontSize: 40, fontWeight: 900, lineHeight: 1.2, opacity: op }}>
    <div style={{ color: JD }}>+ juice</div>
    <div style={{ color: WD }}>+ water</div>
    <div style={{ fontSize: 80, color: C.ink, lineHeight: 1 }}>→</div>
  </div>
);

const TintedPair: React.FC = () => (
  <>
    <Beaker x={X1} w={W} sc={SC} total={20} tint={1} tintJ={0.3} head={['20 L', '30% juice']} />
    <Beaker x={X2} w={W} sc={SC} total={25} tint={1} tintJ={0.4} head={['25 L', '40% juice']} />
    <Plus />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.82); // "Nope!" starts at 2.95 s of the 3.6 s line
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #3</div>
      </div>
      <Text x={540} y={385} w={1040} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>4 L</span>?
      </Text>
      <PushIn frames={scene.frames} origin="460px 900px">
        <Shift>
          <TintedPair />
        </Shift>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QX1 = 190;
const QX2 = 650;
const QW = 220;
const QSC = 16; // 25 L = 400 px

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>20 L</b>, <b style={{ color: JD }}>30% juice</b>. Ella adds juice and water: <b style={{ color: C.primary }}>25 L</b>, <b style={{ color: JD }}>40% juice</b>. How much <b style={{ color: WD }}>water</b> did she add?
      </div>
      <Shift dy={300}>
        <Beaker x={QX1} w={QW} sc={QSC} total={20} tint={1} tintJ={0.3} head={['20 L', '30% juice']} />
        <Beaker x={QX2} w={QW} sc={QSC} total={25} tint={1} tintJ={0.4} head={['25 L', '40% juice']} />
        <Plus x1={QX1 + QW} x2={QX2} top={560} />
      </Shift>
      <div style={{ position: 'absolute', left: 60, top: 1180, width: 860, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 12, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 68, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.6 + i * 0.07)} />
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

/** The aha: split each drink into juice and water, then watch only the water (14 → 15). */
const Split: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const empty = 1 - ease(f, at(scene, 0, 0.45), 10); // the tinted "juice / water" guess fades as we split for real
  const j1 = ease(f, at(scene, 1, 0.2), 14);
  const w1 = ease(f, at(scene, 1, 0.62), 14);
  const j2 = ease(f, at(scene, 2, 0.25), 14);
  const w2 = ease(f, at(scene, 2, 0.65), 14);
  const grey = ease(f, l3, 12);
  const z = ease(f, l3 + 6, 14) - ease(f, l3 + 100, 12);
  const n14 = l3 + 49; // "Fourteen," at 1.63 s
  const n15 = l3 + 80; // "fifteen!" at about 2.7 s
  const big14 = 1 + 0.25 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - n14) / 12)) * Math.PI));
  const big15 = 1 + 0.25 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - n15) / 12)) * Math.PI));
  const chip = (start: number, end: number): React.CSSProperties => ({ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', ...fadeUp(f, start, 10), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 8) });
  const pill = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', borderRadius: 26, padding: '10px 40px', fontSize: 68, fontWeight: 900, whiteSpace: 'nowrap' });
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[at(scene, 1, 0.2), at(scene, 1, 0.62), at(scene, 2, 0.25), at(scene, 2, 0.65)].map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.28} />)}
      <Sfx at={l3 + 6} src={SFX.whoosh} volume={0.25} />
      <Sfx at={n14} src={SFX.click} volume={0.3} />
      <Sfx at={n15} src={SFX.click} volume={0.3} />
      <Sfx at={l3 + 100} src={SFX.whoosh} volume={0.25} />
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${80 * z}px, ${30 * z}px) scale(${1 + 0.22 * z})`, transformOrigin: '460px 860px' }}>
        <Shift>
          <Beaker x={X1} w={W} sc={SC} total={20} tint={empty} tintJ={0.3} j={6} wt={14} jp={j1} wp={w1} jl={j1} wl={w1 * (1 - grey)} grey={0.8 * grey} wText={'14 L'} head={['20 L', '30% juice']} />
          <Beaker x={X2} w={W} sc={SC} total={25} tint={empty} tintJ={0.4} j={10} wt={15} jp={j2} wp={w2} jl={j2} wl={w2 * (1 - grey)} grey={0.8 * grey} wText={'15 L'} head={['25 L', '40% juice']} />
          <Plus op={empty} />
          {/* the water labels pulse on the spoken numbers */}
          <div style={{ position: 'absolute', left: X1 - 6, width: W + 12, top: BASE - 20 * SC, height: 14 * SC, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: grey }}>
            <div style={{ background: WD, color: '#fff', borderRadius: 22, padding: '4px 22px', fontSize: 64, fontWeight: 900, transform: `scale(${big14})` }}>14 L</div>
          </div>
          <div style={{ position: 'absolute', left: X2 - 6, width: W + 12, top: BASE - 25 * SC, height: 15 * SC, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: grey * ease(f, n15 - 4, 6) }}>
            <div style={{ background: WD, color: '#fff', borderRadius: 22, padding: '4px 22px', fontSize: 64, fontWeight: 900, transform: `scale(${big15})` }}>15 L</div>
          </div>
        </Shift>
      </div>
      {/* readouts above the beakers, one at a time */}
      <div style={chip(4, at(scene, 0, 0.95))}>
        <div style={pill(C.violet)}>
          <span style={{ color: '#ffd9a0' }}>juice</span> + <span style={{ color: '#bfefff' }}>water</span>
        </div>
      </div>
      <div style={chip(l1, at(scene, 1, 0.98))}>
        <div style={pill(JD)}>30% of 20 = 6</div>
      </div>
      <div style={chip(l2, l3)}>
        <div style={pill(JD)}>40% of 25 = 10</div>
      </div>
      <div style={chip(l3 + 6, 99999)}>
        <div style={pill(WD)}>
          water {f >= n14 ? '14' : '?'} → {f >= n15 ? '15' : '?'}
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same beakers as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.46); // "ONE" at about 1.2 s of the 2.5 s line
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const juice = ease(f, trap + 4, 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'baseline', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 110, fontWeight: 900 }}>1 L</span>
          <span style={{ fontSize: 66, fontWeight: 900 }}>of water</span>
        </div>
      </div>
      <Shift>
        <Beaker x={X1} w={W} sc={SC} total={20} j={6} wt={14} jp={1} wp={1} jl={1} wl={1} head={['20 L', '30% juice']} />
        <Beaker x={X2} w={W} sc={SC} total={25} j={10} wt={15} jp={1} wp={1} jl={1} wl={1} head={['25 L', '40% juice']} />
        <Plus />
        <Br x={X2 + W + 24} L1={24} L2={25} label="+1 L" color={WD} op={ease(f, hit, 8)} scale={pop(f, hit)} />
        <Br left x={X2 - 24} L1={6} L2={10} label={<div style={{ lineHeight: 1 }}>+4 L<div style={{ fontSize: 44 }}>juice</div></div>} color={C.red} op={juice} />
      </Shift>
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, split: Split, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

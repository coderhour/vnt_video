import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CH_URL, Calc, GD, SLUG, VD } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (9), question, comment bait, the backward chain 90 → 3 as a big 3 × 3 snake with
// the even/odd rule chips lighting per step and a zoom on 4 → 2 (too small) → 3, then the reveal and the
// calculator back in the hook's place for the loop.

const CALC_SCALE = 1.4;
const CALC_X = 540 - (452 * CALC_SCALE) / 2;
const CALC_Y = 560;
const BigCalc: React.FC<{ value: string }> = ({ value }) => <Calc x={CALC_X} y={CALC_Y} value={value} scale={CALC_SCALE} />;

/** verify.py: backward(3, 90) and its arrows (h = halve, m = minus one). */
const V = [90, 45, 44, 22, 11, 10, 5, 4, 3];
const OPS: ('h' | 'm')[] = ['h', 'm', 'h', 'h', 'm', 'h', 'm', 'm'];
const COLS = [170, 490, 810];
const ROWS = [570, 790, 1010];
/** Snake: row 1 left → right, row 2 right → left, row 3 left → right. */
const POS = V.map((_, i) => {
  const r = Math.floor(i / 3);
  const c = r === 1 ? 2 - (i % 3) : i % 3;
  return { x: COLS[c], y: ROWS[r] };
});
const NW = 200;
const NH = 130;

/** The chain. `nodeAt[i]` = frame node i appears; `hi(i)` = 0..1 pulse for arrow i; `red` = 0..1 red outline on every node. */
const Chain: React.FC<{ nodeAt: number[]; hi?: (i: number) => number; red?: number }> = ({ nodeAt, hi = () => 0, red = 0 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={1080} height={1920}>
        {OPS.map((o, i) => {
          const a = ease(f, nodeAt[i + 1] - 8, 8);
          if (a <= 0) return null;
          const p = POS[i];
          const q = POS[i + 1];
          const col = o === 'h' ? C.violet : C.primary;
          const vert = p.x === q.x;
          const dx = Math.sign(q.x - p.x);
          const x1 = vert ? p.x : p.x + dx * (NW / 2 + 8);
          const y1 = vert ? p.y + NH / 2 + 8 : p.y;
          const x2 = vert ? q.x : q.x - dx * (NW / 2 + 22);
          const y2 = vert ? q.y - NH / 2 - 22 : q.y;
          const head = vert ? `${x2},${y2 + 16} ${x2 - 20},${y2 - 12} ${x2 + 20},${y2 - 12}` : `${x2 + dx * 16},${y2} ${x2 - dx * 12},${y2 - 20} ${x2 - dx * 12},${y2 + 20}`;
          const w = 10 + 6 * hi(i);
          return (
            <g key={i} opacity={a} stroke={col} fill={col} strokeWidth={w} strokeLinecap="round">
              <line x1={x1} y1={y1} x2={x2} y2={y2} />
              <polygon points={head} stroke="none" />
            </g>
          );
        })}
      </svg>
      {OPS.map((o, i) => {
        const a = ease(f, nodeAt[i + 1] - 8, 8);
        if (a <= 0) return null;
        const p = POS[i];
        const q = POS[i + 1];
        const vert = p.x === q.x;
        const lx = vert ? p.x + 95 : (p.x + q.x) / 2;
        const ly = vert ? (p.y + q.y) / 2 - 34 : p.y - 86;
        return (
          <div key={i} style={{ position: 'absolute', left: lx - 70, width: 140, top: ly, textAlign: 'center', fontSize: 56, fontWeight: 900, color: o === 'h' ? VD : GD, opacity: a, transform: `scale(${1 + 0.25 * hi(i)})` }}>
            {o === 'h' ? '÷2' : '−1'}
          </div>
        );
      })}
      {V.map((v, i) => {
        const a = ease(f, nodeAt[i], 8);
        if (a <= 0) return null;
        const end = i === 0 || i === V.length - 1;
        const border = red > 0 ? C.red : end ? C.primary : C.ink;
        return (
          <div key={i} style={{ position: 'absolute', left: POS[i].x - NW / 2, top: POS[i].y - NH / 2, width: NW, height: NH, boxSizing: 'border-box', borderRadius: 30, background: C.card, border: `7px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 900, opacity: a, transform: `scale(${0.8 + 0.2 * pop(f, nodeAt[i])})`, boxShadow: '0 6px 18px rgba(30,40,80,0.10)' }}>
            {v}
          </div>
        );
      })}
    </>
  );
};

/** Opens on the calculator (the same place the video ends on, so the loop cuts cleanly), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.8);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #13</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>9</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 800px">
        <BigCalc value="3" />
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

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A calculator shows <b>3</b>. One key does <b style={{ color: GD }}>+1</b>, the other <b style={{ color: VD }}>×2</b>. Fewest presses to show <b style={{ color: C.primary }}>90</b>?
      </div>
      <Calc x={540 - 226} y={590} value="3" />
      <div style={{ position: 'absolute', left: 60, top: 1000, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />
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

/** Frames (within the back scene) where each node appears: 90 on line 0, then each number as it is spoken on line 1, 3 on line 2. */
const nodeFrames = (scene: Parameters<SceneComponent>[0]['scene']) => [
  at(scene, 0, 0.2),
  ...[0.16, 0.31, 0.44, 0.57, 0.68, 0.79, 0.89].map((t) => at(scene, 1, t)),
  at(scene, 2, 0.84),
];

const RuleChip: React.FC<{ x: number; on: number; lit: number; color: string; children: React.ReactNode }> = ({ x, on, lit, color, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: 290, width: 440, display: 'flex', justifyContent: 'center', ...fadeUp(f, on) }}>
      <div style={{ background: lit > 0 ? color : C.card, color: lit > 0 ? '#fff' : color, border: `6px solid ${color}`, borderRadius: 26, padding: '6px 30px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap', transform: `scale(${1 + 0.1 * lit})` }}>
        {children}
      </div>
    </div>
  );
};

const Back: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nodeAt = nodeFrames(scene);
  // the rule chip for the step being made lights for 14 frames
  const lit = (op: 'h' | 'm') => {
    let g = 0;
    OPS.forEach((o, i) => {
      const t = f - nodeAt[i + 1];
      if (o === op && t >= -6 && t < 14) g = 1;
    });
    return g;
  };
  const l2 = at(scene, 2);
  const zoomIn = l2;
  const zoomOut = nodeAt[8] + 6;
  const zoom = 1 + 0.25 * ease(f, zoomIn, 12) - 0.25 * ease(f, zoomOut, 12);
  const chips = fadeTo(f, zoomIn - 6, 0, 8);
  const ghost = at(scene, 2, 0.22);
  const tooSmall = at(scene, 2, 0.4);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {nodeAt.map((n, i) => (i % 2 === 1 || i === 8 ? <Sfx key={i} at={n} src={SFX.click} volume={0.28} /> : null))}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={tooSmall} src={SFX.buzz} volume={0.15} />
      <div style={{ opacity: chips }}>
      <RuleChip x={60} on={at(scene, 0, 0.37)} lit={lit('h') || (f >= at(scene, 0, 0.37) && f < at(scene, 0, 0.65) ? 1 : 0)} color={C.violet}>even → ÷2</RuleChip>
      <RuleChip x={580} on={at(scene, 0, 0.69)} lit={lit('m') || (f >= at(scene, 0, 0.69) && f < at(scene, 0, 0.97) ? 1 : 0)} color={C.primary}>odd → −1</RuleChip>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '810px 1060px' }}>
        <Chain nodeAt={nodeAt} />
        {/* 4 ÷ 2 = 2 drops below the start */}
        <div style={{ position: 'absolute', left: 490 - 90, top: 1150, width: 180, height: 110, boxSizing: 'border-box', borderRadius: 26, border: `6px dashed ${C.red}`, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 900, opacity: ease(f, ghost, 8) * fadeTo(f, nodeAt[8], 0, 10) }}>
          2
        </div>
        <div style={{ position: 'absolute', left: 600, top: 1170, fontSize: 58, fontWeight: 900, color: C.red, whiteSpace: 'nowrap', opacity: ease(f, tooSmall, 6) * fadeTo(f, nodeAt[8], 0, 10) }}>
          2 &lt; 3 ✗
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the calculator back in the hook's place (loop) with the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.73);
  const chime = at(scene, 0, 0.97);
  const before = V.map(() => -100);
  // arrows pulse forwards (3 → 90: arrow 7 first) while "Count the arrows" is said
  const sweep0 = at(scene, 0, 0.08);
  const hi = (i: number) => {
    const t = f - (sweep0 + (7 - i) * 6);
    return t >= 0 && t < 10 ? Math.sin((t / 10) * Math.PI) : 0;
  };
  const trap = at(scene, 1, 0.5);
  const back = at(scene, 2);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="8" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>presses</span>
        </div>
      </div>
      <div style={{ opacity: fadeTo(f, back, 0, 10) }}>
        <Chain nodeAt={before} hi={hi} red={f >= trap ? 1 : 0} />
        <Text x={490} y={1130} w={860} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
          9 numbers, but 8 arrows
        </Text>
      </div>
      <div style={{ opacity: ease(f, back, 10) }}>
        <BigCalc value="90" />
      </div>
      <CtaPill start={back + 6} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {Array.from({ length: 4 }, (_, k) => <Sfx key={k} at={sweep0 + k * 12} src={SFX.click} volume={0.22} />)}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sfx at={back} src={SFX.whoosh} volume={0.25} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CH_URL} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={9} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, back: Back, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

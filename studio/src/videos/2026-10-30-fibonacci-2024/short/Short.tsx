import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SEQ84, SLUG, XC, YC } from '../Composition';

export { SLUG };

// New recipe (see the geometric-triangle reference): trap-first hook (71 = Choice B, the other start that works),
// question, comment bait, the T countdown big (12 cells with a live leftover readout and a zoom onto T = 84),
// then the answer, the trap and the CTA pill. Hook and reveal show the same 10-term grid, so the loop cuts cleanly.

const TC = C.amber; // T = x + y
const TEX_T = '\\color{#f59f0a}{T}';
const TEX_Y = '\\color{#7b61ff}{y}';

const CW = 190;
const CH = 150;
const CG = 16;
const CX0 = (1080 - (5 * CW + 4 * CG)) / 2;
const GRID_Y = 545;

/** The 10 terms as a 5 × 2 grid of big chips, nearly full width. `start(i)` = pop frame, `hi` = green chip. */
const Terms: React.FC<{ y?: number; vals: string[]; colors?: (string | undefined)[]; start?: (i: number) => number; hi?: number }> = ({ y = GRID_Y, vals, colors = [], start = () => -100, hi }) => {
  const f = useCurrentFrame();
  return (
    <>
      {vals.map((v, i) => {
        const s = pop(f, start(i));
        if (f < start(i)) return null;
        const h = hi === i;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: CX0 + (i % 5) * (CW + CG), top: y + Math.floor(i / 5) * (CH + CG), width: CW, height: CH, transform: `scale(${s})`,
              background: h ? C.green : C.card, color: h ? '#fff' : colors[i] ?? C.ink, borderRadius: 24, boxShadow: h ? `0 0 0 7px ${C.green}55` : '0 4px 14px rgba(30,40,80,0.09)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, lineHeight: 1.05,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: h ? '#fff' : C.muted }}>term {i + 1}</span>
            {v}
          </div>
        );
      })}
    </>
  );
};

const HOOK_VALS = ['x', 'y', 'x+y', '?', '?', '?', '?', '?', '?', '2024'];
const HOOK_COLS = [XC, YC, TC, C.muted, C.muted, C.muted, C.muted, C.muted, C.muted, C.violet];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #6</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>71</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 700px">
        <Terms vals={HOOK_VALS} colors={HOOK_COLS} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 600, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        <b style={{ color: C.primary }}>Positive whole numbers</b>, each the <b style={{ color: C.primary }}>sum of the two before</b>. Term 10 is <b style={{ color: C.violet }}>2024</b>. Largest <b style={{ color: TC }}>first + second</b>?
      </div>
      <Terms y={690} vals={HOOK_VALS} colors={HOOK_COLS} />
      <div style={{ position: 'absolute', left: 60, top: 1040, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${c}`} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} />
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

// T = 95 … 84 and their leftovers 2024 − 21T (verify.py: only 84 gives a multiple of 13 here).
const TS = Array.from({ length: 12 }, (_, i) => 95 - i);
const left = (t: number) => 2024 - 21 * t;
const BW = 158;
const BH = 180;
const BG = 15;
const BX0 = (1080 - (6 * BW + 5 * BG)) / 2;
const BY = 470;
const cellXY = (i: number) => [BX0 + (i % 6) * (BW + BG), BY + Math.floor(i / 6) * (BH + 20)];

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  // beats (estimated word positions)
  const chipAt = [at(scene, 0, 0.12), at(scene, 0, 0.24), at(scene, 0, 0.42)]; // "x", "y", "total T"
  const eqAt = at(scene, 0, 0.6); // "Term ten is …"
  const slotsAt = l1 + 2;
  const ruleAt = at(scene, 1, 0.55); // "the leftover has to be thirteen times y"
  // cell i shows its T at show(i) and its leftover at mark(i)
  const sweep0 = at(scene, 2, 0.37); // "Keep going"
  const hitT = at(scene, 2, 0.58); // "eighty-four"
  const hitL = at(scene, 2, 0.8); // "two hundred sixty"
  const show = (i: number) => (i === 0 ? at(scene, 1, 0.3) : i < 11 ? sweep0 + (i - 1) * 3 : hitT);
  const mark = (i: number) => (i === 0 ? at(scene, 2, 0.22) : i < 11 ? show(i) + 2 : hitL);
  const cur = TS.reduce((c, _, i) => (f >= show(i) ? i : c), -1);
  const zoom = 1 + 0.22 * ease(f, hitT, 12) - 0.22 * ease(f, l2 + 126, 10);
  const [zx, zy] = cellXY(11);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {chipAt.map((s, i) => <Sfx key={`c${i}`} at={s} src={SFX.click} volume={0.25} />)}
      <Sfx at={mark(0)} src={SFX.click} volume={0.27} />
      {Array.from({ length: 5 }, (_, i) => <Sfx key={i} at={show(1 + 2 * i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={hitT} src={SFX.whoosh} volume={0.25} />
      <Sfx at={hitL} src={SFX.click} volume={0.3} />
      <Sfx at={l2 + 126} src={SFX.whoosh} volume={0.2} />

      {/* the equation, then the same equation set to 2024 */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', ...fadeUp(f, eqAt), opacity: ease(f, eqAt, 10) * fadeTo(f, l1, 0, 6) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 76, fontWeight: 900 }}>
          term 10 = <Tex tex={`21${TEX_T} + 13${TEX_Y}`} size={88} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: ease(f, l1, 10) }}>
        <Tex tex={`21${TEX_T} + 13${TEX_Y} = 2024`} size={88} />
      </div>

      {/* line 0: the first two terms and their total */}
      <div style={{ opacity: fadeTo(f, l1, 0, 8) }}>
        {[['x', XC, '1st term'], ['y', YC, '2nd term'], ['T = x+y', TC, 'total']].map(([v, col, lab], i) => (
          <div key={i} style={{ position: 'absolute', left: 30 + i * 345, top: 500, width: 330, height: 200, transform: `scale(${pop(f, chipAt[i])})`, opacity: f >= chipAt[i] ? 1 : 0, background: C.card, borderRadius: 28, boxShadow: '0 6px 20px rgba(30,40,80,0.09)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: col, fontSize: i === 2 ? 72 : 96, fontWeight: 900, lineHeight: 1.1 }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: C.muted }}>{lab}</span>
            {v}
          </div>
        ))}
      </div>

      {/* lines 1–2: the T countdown board */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${zx + BW}px ${zy + BH}px` }}>
        {TS.map((t, i) => {
          const [x, y] = cellXY(i);
          const shown = f >= show(i);
          const marked = f >= mark(i);
          const ok = i === 11;
          return (
            <div key={t} style={{ position: 'absolute', left: x, top: y, width: BW, height: BH, borderRadius: 24, opacity: ease(f, slotsAt, 8), boxSizing: 'border-box', border: shown ? 'none' : `4px dashed ${C.muted}55`, background: shown ? (marked ? (ok ? C.green : C.card) : C.card) : 'transparent', boxShadow: shown ? (i === cur ? `0 0 0 7px ${ok ? C.green : C.amber}` : '0 4px 14px rgba(30,40,80,0.09)') : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${shown ? pop(f, show(i)) : 1})` }}>
              {shown && <span style={{ fontSize: 64, fontWeight: 900, color: ok && marked ? '#fff' : TC, lineHeight: 1.05 }}>{t}</span>}
              {marked && <span style={{ fontSize: 54, fontWeight: 900, color: ok ? '#fff' : C.red, lineHeight: 1.05 }}>{left(t)}</span>}
            </div>
          );
        })}
      </div>

      {/* live readout under the board */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 925, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: ease(f, ruleAt, 8) }}>
        {cur < 0 || f < mark(0) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tex tex={`2024 - 21${TEX_T} = 13${TEX_Y}`} size={72} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: C.card, borderRadius: 26, padding: '12px 34px', border: `6px solid ${cur === 11 && f >= hitL ? C.green : C.red}`, boxShadow: '0 8px 30px rgba(30,40,80,0.08)' }}>
            <Tex tex={`2024 - 21 \\cdot \\color{#f59f0a}{${TS[cur]}} = ${cur === 11 && f < hitL ? '\\,?' : left(TS[cur])}`} size={68} />
            <span style={{ fontSize: 68, fontWeight: 900, color: cur === 11 && f >= hitL ? C.green : C.red }}>{cur === 11 ? (f >= hitL ? '✓' : '') : '✗'}</span>
          </div>
        )}
      </div>
      <Text x={490} y={1080} w={860} size={56} weight={900} color={C.muted} align="center" style={{ opacity: ease(f, ruleAt + 8, 8) }}>
        must be a multiple of 13
      </Text>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same term grid as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8); // "eighty-four"
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const vals = SEQ84.map((n) => `${n}`);
  const start = (i: number) => (i === 0 ? at(scene, 0, 0.3) : i === 1 ? at(scene, 0, 0.2) : i === 2 ? hit : hit + 4 + (i - 3) * 4);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 76, fontWeight: 900 }}>x + y =</span>
          <Tex tex="84" size={110} color="#fff" />
        </div>
      </div>
      <Terms vals={vals} colors={[XC, YC]} start={start} hi={f >= hit ? 2 : undefined} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 900, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <Tex tex={`260 = 13 \\times \\color{#7b61ff}{20} \\;\\Rightarrow\\; ${TEX_Y} = \\color{#7b61ff}{20}`} size={64} />
      </div>
      <Text x={490} y={1010} w={860} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap + 2)}>
        71 works too, but 71 &lt; 84
      </Text>
      <CtaPill start={at(scene, 2)} y={1130} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      {Array.from({ length: 4 }, (_, i) => <Sfx key={i} at={start(3 + 2 * i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, count: Count, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, SLUG } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: "Think it's 33?", then the remainders after ÷3 go 1, 0, 0 (zoom on the first group),
// two multiples in every group, and the whole list of 100 as 33 groups of 3 plus one extra spot (zoom on spot 100).
// Frame 0 and the last frame show the same row of the first nine numbers.

const CHOICES = ['33', '34', '50', '66', '67'];
const VALS = [1, 3, 6, 10, 15, 21, 28, 36, 45];
const REM = VALS.map((v) => v % 3);
const before = () => -100;

const TX = (i: number) => 30 + i * 108 + Math.floor(i / 3) * 24;
const TW = 100;
const LAB_Y = 560;
const TILE_Y = 615;
const REM_Y = 765;

/** The first nine numbers as tiles, grouped in threes. `green(i)` turns a multiple of 3 green, `ring(i)` rings it. */
const Row: React.FC<{ green?: (i: number) => boolean; ring?: (i: number) => string | undefined }> = ({ green = () => false, ring = () => undefined }) => (
  <>
    {VALS.map((v, i) => {
      const g = green(i);
      const r = ring(i);
      return (
        <div key={i}>
          <div style={{ position: 'absolute', left: TX(i), width: TW, top: LAB_Y, textAlign: 'center', fontSize: 40, fontWeight: 900, color: C.muted }}>#{i + 1}</div>
          <div
            style={{
              position: 'absolute', left: TX(i), top: TILE_Y, width: TW, height: 120, borderRadius: 22, background: g ? C.green : C.card, color: g ? '#fff' : C.ink,
              boxShadow: r ? `0 0 0 8px ${r}` : '0 5px 16px rgba(30,40,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 900,
            }}
          >
            {v}
          </div>
        </div>
      );
    })}
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #42</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>33</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 700px">
        <Row />
        <Text x={540} y={800} w={1000} size={64} weight={900} align="center" color={C.muted}>
          1, 3, 6, 10, … <span style={{ color: C.violet }}>100 numbers</span>
        </Text>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 590, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

/** Triangle of dots: rows 1, 2, …, n centred on x = cx, top at y. */
const Dots: React.FC<{ n: number; cx: number; y: number; opacity: number }> = ({ n, cx, y, opacity }) => (
  <g opacity={opacity}>
    {Array.from({ length: n }, (_, r) => Array.from({ length: r + 1 }, (_, c) => <circle key={`${r}-${c}`} cx={cx + (c - r / 2) * 36} cy={y + r * 34} r={14} fill={C.violet} />))}
  </g>
);
const DOT_X = [100, 255, 440, 650, 880];

const QuestionBody: React.FC<{ start: (i: number) => number; dots: (i: number) => number; pulse?: (i: number) => number }> = ({ start, dots, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        The list <b style={{ color: C.violet }}>1, 3, 6, 10, 15, …</b> adds one more each step. Of its <b>first 100</b> numbers, how many are <b style={{ color: C.primary }}>multiples of 3</b>?
      </div>
      <Stage>
        {DOT_X.map((x, i) => <Dots key={i} n={i + 1} cx={x} y={690} opacity={ease(f, dots(i), 6)} />)}
      </Stage>
      {DOT_X.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - 70, width: 140, top: 870, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.violet, opacity: ease(f, dots(i), 6) }}>
          {VALS[i]}
        </div>
      ))}
      <div style={{ position: 'absolute', left: 60, top: 1000, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 34px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const dots = (i: number) => at(scene, 0, 0.02 + i * 0.09);
  return (
    <>
      <QuestionBody dots={dots} start={(i) => at(scene, 1, 0.4 + i * 0.08)} />
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} at={dots(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody dots={before} start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={700} />
    </>
  );
};

// the whole list of 100: rows of 9 (three groups), 11 full rows + spot 100
const BC = 70;
const BS = 74;
const BX = (c: number) => 190 + c * BS + Math.floor(c / 3) * 18;
const BY = (r: number) => 430 + r * BS;

/** The aha: remainders 1, 0, 0 repeat; two multiples per group; 100 = 33 groups + 1 extra spot that leaves 1. */
const Cycle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const remAt = (i: number) => (i < 3 ? at(scene, 0, 0.6 + i * 0.08) : at(scene, 0, 0.86) + (i - 3) * 3);
  const z1 = at(scene, 0, 0.5);
  const z1out = at(scene, 0, 0.85);
  const zoom1 = 1 + 0.4 * ease(f, z1, 10) - 0.4 * ease(f, z1out, 10);
  const brAt = (g: number) => at(scene, 1, 0.3 + g * 0.08);
  const two = at(scene, 1, 0.72);
  const rowOut = fadeTo(f, l2 - 2, 0, 8);
  const boardRow = (r: number) => l2 + 6 + r * 5;
  const groups = Math.max(0, Math.min(33, 3 * Math.floor((f - boardRow(0) + 5) / 5)));
  const extra = at(scene, 2, 0.55);
  const z2 = at(scene, 2, 0.6);
  const leaves = at(scene, 2, 0.8);
  const z2out = at(scene, 2, 1) + 1;
  const zoom2 = 1 + 0.3 * ease(f, z2, 12) - 0.3 * ease(f, z2out, 8);
  const dim = 1 - 0.7 * ease(f, z2, 10) + 0.7 * ease(f, z2out, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={z1} src={SFX.whoosh} volume={0.25} />
      <Sfx at={z1out} src={SFX.whoosh} volume={0.25} />
      {[0, 1, 2, 3, 5, 7].map((i) => <Sfx key={i} at={remAt(i)} src={SFX.click} volume={0.25} />)}
      {[0, 1, 2].map((g) => <Sfx key={`b${g}`} at={brAt(g)} src={SFX.click} volume={0.28} />)}
      {[0, 3, 6, 9].map((r) => <Sfx key={`r${r}`} at={boardRow(r)} src={SFX.click} volume={0.25} />)}
      <Sfx at={extra} src={SFX.click} volume={0.3} />
      <Sfx at={z2} src={SFX.whoosh} volume={0.25} />
      {/* titles */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 80, fontWeight: 900, opacity: fadeTo(f, z2, 0, 8) + ease(f, z2out, 6) }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1, 0, 8) }}>
          remainder after <span style={{ color: C.violet }}>÷ 3</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 8) * fadeTo(f, l2, 0, 8) }}>
          <span style={{ color: C.green }}>2</span> in every group of 3
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, at(scene, 2, 0.1), 8) }}>
          <Tex tex={`100 = 33\\times 3 + 1`} size={80} />
        </div>
      </div>
      {/* lines 1–2: the first nine numbers and their remainders */}
      <div style={{ position: 'absolute', inset: 0, opacity: rowOut, transform: `scale(${zoom1})`, transformOrigin: '100px 700px' }}>
        <Row green={(i) => REM[i] === 0 && f >= two} />
        {VALS.map((_, i) => {
          const s = pop(f, remAt(i));
          if (s <= 0) return null;
          const z = REM[i] === 0;
          return (
            <div key={i} style={{ position: 'absolute', left: TX(i) + 4, top: REM_Y, width: 92, height: 92, borderRadius: 46, background: z ? C.green : C.violet, color: '#fff', fontSize: 58, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})` }}>
              {REM[i]}
            </div>
          );
        })}
        {[0, 1, 2].map((g) => (
          <div key={g} style={{ position: 'absolute', left: TX(g * 3), width: TX(g * 3 + 2) + TW - TX(g * 3), top: 880, opacity: ease(f, brAt(g), 8) }}>
            <div style={{ height: 10, borderRadius: 5, background: C.line }} />
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 60, fontWeight: 900, color: C.green, transform: `scale(${pop(f, two)})` }}>2 ✓</div>
          </div>
        ))}
      </div>
      {/* line 3: all 100 spots, rows of three groups, zoom on spot 100 */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom2})`, transformOrigin: `${BX(0) + BC / 2}px ${BY(11) + BC / 2}px` }}>
        {Array.from({ length: 100 }, (_, k) => {
          const r = Math.floor(k / 9);
          const c = k % 9;
          const isExtra = k === 99;
          const st = isExtra ? extra : boardRow(r);
          const s = isExtra ? pop(f, st) : ease(f, st, 6);
          if (s <= 0) return null;
          const z = k % 3 !== 0;
          return (
            <div
              key={k}
              style={{
                position: 'absolute', left: BX(c), top: BY(r), width: BC, height: BC, borderRadius: 14, background: z ? C.green : C.violet, opacity: isExtra ? 1 : s * dim,
                transform: isExtra ? `scale(${s})` : undefined, boxShadow: isExtra && f >= leaves ? `0 0 0 7px ${C.amber}` : undefined,
                color: '#fff', fontSize: 42, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {z ? 0 : 1}
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: BX(1) + 20, top: BY(11) - 4, ...fadeUp(f, boardRow(0), 6), opacity: ease(f, boardRow(0), 6) * fadeTo(f, extra, 0, 6) }}>
          <div style={{ background: C.ink, color: '#fff', borderRadius: 20, padding: '2px 30px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap' }}>{groups} groups</div>
        </div>
        <div style={{ position: 'absolute', left: BX(1) + 20, top: BY(11) - 2, whiteSpace: 'nowrap', fontSize: 60, fontWeight: 900, color: '#b87800', ...fadeUp(f, leaves, 8) }}>
          ← #100 leaves 1
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same row the hook showed. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.84);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  const too = at(scene, 1, 0.45);
  const cta = at(scene, 2);
  const ring = (i: number) => (f >= trap && f < cta ? (i % 3 === 2 ? C.red : i % 3 === 1 && f >= too ? C.amber : undefined) : undefined);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="66" size={110} color="#fff" />
          <span style={{ fontSize: 66, fontWeight: 900 }}>multiples</span>
        </div>
      </div>
      <Row green={(i) => REM[i] === 0} ring={ring} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 800, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <Tex tex={`33 \\text{ groups} \\times 2${f >= hit ? ' = 66' : ''}`} size={72} />
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 940, textAlign: 'center', fontSize: 62, fontWeight: 900, color: '#b87800', ...fadeUp(f, too, 8), opacity: ease(f, too, 8) * fadeTo(f, cta - 6, 0, 6) }}>
        spots 2, 5, 8 count too!
      </div>
      <CtaPill start={cta} y={1170} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sfx at={too} src={SFX.click} volume={0.28} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, cycle: Cycle, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

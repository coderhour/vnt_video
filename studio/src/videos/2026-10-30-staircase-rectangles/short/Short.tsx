import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Confetti, Text } from '../../../lib/ui';
import { CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

// Trap-first short: hook (15?) → question → think (comment bait) → the corner trick (zoom onto the 3 × 2 block,
// spot counter, column × row fill) → reveal (column sums as spoken, 70, the trap, CTA pill). Last frame = frame 0's stairs.

const COLS = [C.primary, C.violet, C.blue, C.amber, C.red];
const CELLS: [number, number][] = [1, 2, 3, 4, 5].flatMap((r) => Array.from({ length: 6 - r }, (_, i): [number, number] => [i + 1, r]));
const SUMS = [15, 20, 18, 12, 5];

type G = { ox: number; bottom: number; u: number };
const cx = (g: G, c: number) => g.ox + (c - 0.5) * g.u;
const cy = (g: G, r: number) => g.bottom - (r - 0.5) * g.u;
const tint = (c: number) => `${COLS[c - 1]}22`;

/** The staircase: rows of 5, 4, 3, 2, 1 (row 1 at the bottom). `fill(c, r)` returns extra style per cell. */
const Stairs: React.FC<{ g: G; fill?: (c: number, r: number) => React.CSSProperties; text?: (c: number, r: number) => React.ReactNode }> = ({ g, fill, text }) => (
  <>
    {CELLS.map(([c, r]) => (
      <div
        key={`${c}-${r}`}
        style={{ position: 'absolute', left: g.ox + (c - 1) * g.u, top: g.bottom - r * g.u, width: g.u, height: g.u, boxSizing: 'border-box', border: `5px solid ${C.ink}`, background: tint(c), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: g.u * 0.46, fontWeight: 900, ...fill?.(c, r) }}
      >
        {text?.(c, r)}
      </div>
    ))}
  </>
);

const Dot: React.FC<{ g: G; c: number; r: number; color: string; o: number; s?: number }> = ({ g, c, r, color, o, s = 1 }) => (
  <div style={{ position: 'absolute', left: cx(g, c) - 30, top: cy(g, r) - 30, width: 60, height: 60, borderRadius: 30, background: color, border: '6px solid #fff', boxSizing: 'border-box', opacity: o, transform: `scale(${s})`, boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }} />
);

/** Column sum chip sitting on top of column c. */
const SumChip: React.FC<{ g: G; c: number; style: React.CSSProperties }> = ({ g, c, style }) => (
  <div style={{ position: 'absolute', left: g.ox + (c - 1) * g.u, width: g.u, top: g.bottom - (6 - c) * g.u - 96, display: 'flex', justifyContent: 'center', ...style }}>
    <div style={{ background: COLS[c - 1], color: '#fff', borderRadius: 22, padding: '2px 22px', fontSize: 64, fontWeight: 900 }}>{SUMS[c - 1]}</div>
  </div>
);

/** Big stairs: x 115…890, y 525…1300 (the hook, the corner trick and the reveal all use it, so the loop cuts cleanly). */
const BIG: G = { ox: 115, bottom: 1300, u: 155 };
const QG: G = { ox: 300, bottom: 1065, u: 96 };
const before = -100;

/** Opens on the stairs, counts the 15 little squares, then stamps the trap. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  const idx = (c: number, r: number) => CELLS.findIndex(([a, b]) => a === c && b === r);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #6</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>15</span>?
      </Text>
      <PushIn frames={scene.frames} origin="500px 1000px">
        <Stairs g={BIG} text={(c, r) => <span style={{ opacity: ease(f, 6 + idx(c, r) * 3.5, 4), color: C.muted }}>{idx(c, r) + 1}</span>} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 820, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '22px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.3, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>15 squares</b> in rows of 5, 4, 3, 2, 1. How many <b style={{ color: C.primary }}>rectangles</b>? Squares count too.
      </div>
      <Stairs g={QG} />
      <div style={{ position: 'absolute', left: 60, top: 1090, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={640} />
    </>
  );
};

const BLOCK: [number, number][] = [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2]];

const Corner: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  // L0: one example rectangle (cols 2–3, rows 1–2) with its two corner squares
  const ex = ease(f, 10, 10) * fadeTo(f, l1, 0, 8);
  const inEx = (c: number, r: number) => c >= 2 && c <= 3 && r <= 2;
  // L1: zoom onto the 3 × 2 block, the bottom-left spots appear one by one
  const zIn = at(scene, 1, 0.3);
  const zoom = 1 + 0.3 * ease(f, zIn, 12) - 0.3 * ease(f, l2, 10);
  const dotAt = (i: number) => at(scene, 1, 0.42 + i * 0.065);
  const n = BLOCK.filter((_, i) => f >= dotAt(i)).length;
  const block = ease(f, zIn, 10) * fadeTo(f, l2 + 4, 0, 8);
  const tr = ease(f, l1, 8) * fadeTo(f, l2 + 4, 0, 8);
  const six = at(scene, 1, 0.84);
  // L2: column × row fills in, column by column
  const fillAt = (c: number, r: number) => at(scene, 2, 0.12) + (c - 1) * 13 + (r - 1) * 3;
  const legend = ease(f, 14, 10) * fadeTo(f, l1, 0, 8);
  const readout = ease(f, l1 + 6, 8) * fadeTo(f, l2 + 2, 0, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      {BLOCK.map((_, i) => <Sfx key={i} at={dotAt(i)} src={SFX.click} volume={0.25} />)}
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {[1, 2, 3, 4, 5].map((c) => <Sfx key={`c${c}`} at={fillAt(c, 1)} src={SFX.click} volume={0.25} />)}
      <Text x={540} y={290} w={1000} size={84} weight={900} align="center" style={{ opacity: fadeTo(f, l1, 0, 8) }}>
        The <span style={{ color: C.violet }}>corner</span> trick
      </Text>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '300px 1290px' }}>
        <Stairs
          g={g}
          fill={(c, r) => (inEx(c, r) && ex > 0 ? { background: `rgba(123,97,255,${0.3 * ex})` } : c <= 3 && r <= 2 && block > 0 ? { background: `rgba(12,194,129,${0.3 * block})` } : {})}
          text={(c, r) => <span style={{ ...fadeUp(f, fillAt(c, r), 8), color: COLS[c - 1] }}>{c * r}</span>}
        />
        <Dot g={g} c={3} r={2} color={C.amber} o={Math.max(ex, tr)} s={1 + 0.15 * Math.sin(Math.max(0, f - l1) / 4) * tr} />
        <Dot g={g} c={2} r={1} color={C.primary} o={ex} />
        {BLOCK.map(([c, r], i) => (c === 3 && r === 2 ? null : <Dot key={i} g={g} c={c} r={r} color={C.primary} o={block * (f >= dotAt(i) ? 1 : 0)} s={pop(f, dotAt(i))} />))}
        {/* the top-right square counts as its own bottom-left: a green ring around the amber dot */}
        <div style={{ position: 'absolute', left: cx(g, 3) - 42, top: cy(g, 2) - 42, width: 84, height: 84, borderRadius: 42, border: `8px solid ${C.primary}`, boxSizing: 'border-box', opacity: block * (f >= dotAt(5) ? 1 : 0), transform: `scale(${pop(f, dotAt(5))})` }} />
      </div>
      {/* legend (L0) */}
      <div style={{ position: 'absolute', left: 560, top: 545, display: 'flex', flexDirection: 'column', gap: 18, fontSize: 56, fontWeight: 900, opacity: legend }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: C.amber }} /> top-right
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: C.primary }} /> bottom-left
        </div>
      </div>
      {/* readouts (L1) */}
      <div style={{ position: 'absolute', left: 620, top: 330, width: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: readout }}>
        <div style={{ background: C.amber, color: '#fff', borderRadius: 24, padding: '8px 28px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap' }}>col 3, row 2</div>
        <div style={{ background: C.card, color: C.primary, borderRadius: 24, padding: '8px 28px', fontSize: 64, fontWeight: 900, boxShadow: '0 6px 20px rgba(30,40,80,0.1)', opacity: ease(f, dotAt(0), 6), whiteSpace: 'nowrap' }}>
          spots: {Math.max(1, n)}
        </div>
        <div style={{ transform: `scale(${pop(f, six)})`, opacity: ease(f, six, 4), background: C.primary, color: '#fff', borderRadius: 24, padding: '8px 28px', display: 'flex' }}>
          <span style={{ whiteSpace: 'nowrap' }}><Tex tex="3\times 2=6" size={64} color="#fff" /></span>
        </div>
      </div>
      <Text x={760} y={430} w={560} size={64} weight={900} align="center" color={C.violet} style={{ opacity: ease(f, l2 + 10, 8) }}>
        column × row
      </Text>
    </>
  );
};

/** Column sums as they're spoken, the answer, the trap, then the CTA pill over the same stairs. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sumAt = [0.0, 0.13, 0.25, 0.4, 0.52].map((t) => at(scene, 0, t));
  const hit = at(scene, 0, 0.72);
  const chime = at(scene, 0, 0.97);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {sumAt.map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.28} />)}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={l1} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Text x={540} y={290} w={1000} size={80} weight={900} align="center" style={{ opacity: fadeTo(f, l2 - 4, 0, 8) }}>
        Add each <span style={{ color: C.violet }}>column</span>
      </Text>
      <Stairs g={BIG} text={(c, r) => <span style={{ color: COLS[c - 1] }}>{c * r}</span>} />
      {[1, 2, 3, 4, 5].map((c) => (
        <SumChip key={c} g={BIG} c={c} style={{ opacity: ease(f, sumAt[c - 1], 4), transform: `scale(${pop(f, sumAt[c - 1])})` }} />
      ))}
      <div style={{ position: 'absolute', left: 640, top: 420, width: 380, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 36px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="70" size={120} color="#fff" />
          <span style={{ fontSize: 54, fontWeight: 900, marginTop: -6 }}>rectangles</span>
        </div>
      </div>
      <Text x={835} y={680} w={410} size={54} weight={900} color={C.red} align="center" style={fadeUp(f, l1 + 3)}>
        15 = just the little squares
      </Text>
      <CtaPill start={l2} y={290} />
      <Confetti x={830} y={520} start={chime} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, corner: Corner, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

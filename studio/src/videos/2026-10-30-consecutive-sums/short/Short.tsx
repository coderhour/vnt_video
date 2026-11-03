import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, FAILS, NEW, RUN, SLUG } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (45), question, comment bait, the board lighting up one run length at a time
// with a "dark" counter and a zoom onto the dark cells, then the reveal over the same board the hook opens on.

const BX = 40;
const BY = 525;
const P = 88;
const CELL = 80;
const LENS = [2, 3, 4, 5, 7, 8];
const NEVER = 99999;
const lenOf = (n: number) => LENS.find((l) => NEW[l].includes(n));
const cellXY = (n: number) => [BX + ((n - 1) % 10) * P, BY + Math.floor((n - 1) / 10) * P] as const;

/** 1…50 as a 10 × 5 board. `litAt(n)` = frame where n lights in its run colour, `redAt(n)` = frame where a dark cell turns red. */
const Board: React.FC<{ litAt?: (n: number) => number; redAt?: (n: number) => number; pulse?: (n: number) => number }> = ({ litAt = () => NEVER, redAt = () => NEVER, pulse = () => 0 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {range(50).map((i) => {
        const n = i + 1;
        const [x, y] = cellXY(n);
        const L = lenOf(n);
        const lit = L !== undefined && f >= litAt(n);
        const red = !lit && f >= redAt(n);
        const bump = lit ? Math.max(0, 1 - (f - litAt(n)) / 8) : red ? Math.max(0, 1 - (f - redAt(n)) / 8) : 0;
        const col = lit ? RUN[L!] : C.red;
        return (
          <div
            key={n}
            style={{
              position: 'absolute', left: x, top: y, width: CELL, height: CELL, borderRadius: 18, boxSizing: 'border-box',
              background: lit ? col : red ? 'rgba(239,67,67,0.16)' : C.card,
              border: `4px solid ${lit ? col : red ? C.red : C.line}`,
              color: lit ? '#fff' : red ? C.red : C.ink,
              fontSize: 44, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${1 + 0.2 * bump + 0.14 * pulse(n)})`,
              boxShadow: pulse(n) > 0 ? `0 0 0 ${7 * pulse(n)}px ${C.red}66` : '0 3px 10px rgba(30,40,80,0.06)',
            }}
          >
            {n}
          </div>
        );
      })}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #5</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>45</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 750px">
        <Board />
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

const QuestionBody: React.FC<{ start: (i: number) => number; example: number; pulse?: (i: number) => number }> = ({ start, example, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many numbers from <b style={{ color: C.primary }}>1 to 50</b> are a sum of <b style={{ color: C.violet }}>2 or more consecutive</b> positive whole numbers?
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 720, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 120, fontWeight: 900, ...fadeUp(f, example) }}>
        <span>9</span>
        <span style={{ color: C.muted }}>=</span>
        <span style={{ color: C.primary }}>4</span>
        <span style={{ color: C.muted }}>+</span>
        <span style={{ color: C.primary }}>5</span>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 1000, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.75 + i * 0.05)} example={at(scene, 1, 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} example={-100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: light the board one run length at a time; only the powers of two stay dark. */
const BoardScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  // when each run length's group starts, and the gap between its cells
  const group: Record<number, [number, number]> = { 2: [l(0, 0.2), 2.4], 3: [l(1, 0.18), 3], 4: [l(1, 0.4), 3], 5: [l(1, 0.62), 4], 7: [l(2, 0.3), 0], 8: [l(2, 0.55), 0] };
  const litAt = (n: number) => {
    const L = lenOf(n);
    if (L === undefined) return NEVER;
    const [s, d] = group[L];
    return s + NEW[L].indexOf(n) * d;
  };
  const say: Record<number, number> = { 1: 0.25, 2: 0.3, 4: 0.36, 8: 0.43, 16: 0.51, 32: 0.65 };
  const redAt = (n: number) => (n in say ? l(3, say[n]) : NEVER);
  const pulse = (n: number) => (n in say ? Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - redAt(n)) / 16)) * Math.PI)) : 0);
  const zoomIn = l(3, 0.05);
  const zoomOut = l(3, 0.7);
  const zoom = 1 + 0.3 * ease(f, zoomIn, 12) - 0.3 * ease(f, zoomOut, 10);
  // the counter steps only when a whole run length is done (50, 26, 18, 10, 8, 7, 6), so it never shows a choice value
  const dark = 50 - LENS.filter((L) => f >= group[L][0] + (NEW[L].length - 1) * group[L][1] + 4).reduce((a, L) => a + NEW[L].length, 0);
  const clicks = range(50).map((i) => i + 1).filter((n) => litAt(n) < NEVER).sort((a, b) => litAt(a) - litAt(b)).filter((_, k) => k % 3 === 0);

  const read = (start: number, end: number) => ease(f, start, 8) * fadeTo(f, end, 0, 6);
  const runChip = (L: number) => (
    <span style={{ color: RUN[L], opacity: 0.25 + 0.75 * ease(f, group[L][0] - 4, 6) }}>{L}</span>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {clicks.map((n) => <Sfx key={n} at={litAt(n)} src={SFX.click} volume={0.24} />)}
      {FAILS.map((n) => <Sfx key={`r${n}`} at={redAt(n)} src={SFX.click} volume={0.3} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 80, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: read(0, l(1)) }}>
          runs of <span style={{ color: RUN[2] }}>2</span> → <span style={{ color: RUN[2] }}>odd</span> sums
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(1), l(2)) }}>
          runs of {runChip(3)} · {runChip(4)} · {runChip(5)}
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(2), l(3)) }}>
          runs of {runChip(7)} · {runChip(8)}
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(3), l(3, 0.76)) }}>
          <span style={{ color: C.red }}>6</span> cells stay dark
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l(3, 0.76), 8) }}>
          all <span style={{ color: C.red }}>powers of 2</span>!
        </div>
      </div>

      {/* the board, zoomed onto the top-left dark cells while they're named, clipped above the counter */}
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(400px 0 925px 0)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${BX}px ${BY}px` }}>
          <Board litAt={litAt} redAt={redAt} pulse={pulse} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 60, width: 860, top: 1015, display: 'flex', justifyContent: 'center', ...fadeUp(f, l(0, 0.15), 8) }}>
        <div style={{ background: dark === 6 ? C.red : C.ink, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900 }}>
          dark: {dark}
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same board the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.68);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  const ring = (n: number) => (n === 1 && f >= trap ? 0.6 + 0.4 * Math.sin(((f - trap) / 30) * Math.PI * 2) : 0);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="44" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>numbers</span>
        </div>
      </div>
      <Board litAt={() => -100} redAt={(n) => (FAILS.includes(n) ? -100 : NEVER)} pulse={ring} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1010, display: 'flex', justifyContent: 'center', ...fadeUp(f, hit), opacity: ease(f, hit, 10) * fadeTo(f, trap, 0, 8) }}>
        <Tex tex={'50 - 6 = \\color{#21c45d}{44}'} size={72} />
      </div>
      <Text x={490} y={1010} w={860} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.08))}>
        45 forgets that 1 fails
      </Text>
      <CtaPill start={at(scene, 2)} y={1140} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, board: BoardScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

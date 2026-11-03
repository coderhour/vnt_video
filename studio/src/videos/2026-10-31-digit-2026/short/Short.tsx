import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, Dots, G1, G2, G3, Ribbon, SLUG, Seg, col, digitsOf } from '../Composition';

export { SLUG };

// New-recipe short (~38 s): trap-first hook (6), question, comment bait, count in blocks (digit budget bar +
// rows, zoom on the remainder), reveal 7 = first digit of 712, back to the same ribbon for the loop.

const MONO = '"DejaVu Sans Mono", "Noto Sans Mono", monospace';
const CH = ['1', '2', '6', '7', '8'];

/** Frame (scene-relative) where the first caption word of line `i` starting with `word` begins (WordCaptions' char weights). */
const cue = (scene: Scene, i: number, word: string) => {
  const ws = scene.lines[i].caption.split(/\s+/);
  const w = ws.map((s) => s.length + 2);
  const idx = Math.max(0, ws.findIndex((s) => s.startsWith(word)));
  return at(scene, i, w.slice(0, idx).reduce((a, b) => a + b, 0) / w.reduce((a, b) => a + b, 0));
};

// The ribbon "1 2 3 … 20 …" in three rows: hook and the end of the reveal (same place, so the loop cuts cleanly).
const ROWS = [digitsOf(1, 10), digitsOf(11, 15), digitsOf(16, 20)];
const CW = 80;
const GAP = 6;
const rowW = (items: ReturnType<typeof digitsOf>) => items.length * CW + (items[items.length - 1].n) * GAP;
const BigRibbon: React.FC<{ spot?: React.ReactNode }> = ({ spot }) => (
  <>
    {ROWS.map((items, r) => {
      const w = rowW(items) + (r === 2 ? 90 : 0);
      const x = (1080 - w) / 2;
      return (
        <div key={r}>
          <Ribbon x={x} y={560 + r * 112} items={items} cw={CW} gap={GAP} size={66} />
          {r === 2 && <Dots x={x + rowW(items) + 20} y={560 + r * 112} size={66} />}
        </div>
      );
    })}
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 905, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.red }}>{spot ?? <>spot 2026 = ?</>}</div>
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, 'Nope');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #31</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>6</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 740px">
        <BigRibbon />
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
  const r = digitsOf(1, 10);
  const x = (1080 - rowW(r) - 90) / 2;
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 280, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Write <b style={{ color: C.primary }}>all the whole numbers</b> in a row, no spaces. What is the <b style={{ color: C.red }}>2026th digit</b>?
      </div>
      <Ribbon x={x} y={590} items={r} cw={CW} gap={GAP} size={66} />
      <Dots x={x + rowW(r) + 20} y={590} size={66} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 730, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.red }}>spot 2026 = ?</div>
      <div style={{ position: 'absolute', left: 60, top: 900, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={600} />
    </>
  );
};

const Row: React.FC<{ y: number; start: number; tex: string; size?: number }> = ({ y, start, tex, size = 80 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

/** The aha: a digit budget bar of 2026 and one row per step; zoom on the division while the remainder sticks out. */
const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g9 = cue(scene, 0, '1');
  const g180 = cue(scene, 0, '99');
  const r1 = cue(scene, 0, '189');
  const left = cue(scene, 1, '1837');
  const div = cue(scene, 2, '612');
  const rem = cue(scene, 2, 'remainder');
  const l3 = at(scene, 3);
  const end = cue(scene, 3, '711');
  const zIn = at(scene, 2, 0.05);
  const zOut = l3 - 4;
  const z = ease(f, zIn, 14) - ease(f, zOut, 12);
  const zoom = 1 + 0.32 * z;
  const split = ease(f, rem, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      {[g9, g180, r1, left, div, rem, end].map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.26} />)}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Text x={540} y={262} w={1000} size={44} weight={800} color={C.muted} align="center" style={{ opacity: ease(f, 2, 8) }}>2026 digits in all</Text>
        <Seg x={40} y={330} w={110} h={110} color={G1} label="9" op={ease(f, g9, 8)} r="28px 8px 8px 28px" size={60} />
        <Seg x={156} y={330} w={250} h={110} color={G2} label="180" op={ease(f, g180, 8)} size={60} />
        <Seg x={412} y={330} w={628} h={110} color="rgba(120,130,150,0.18)" label={f >= left ? '1837' : '?'} txt={C.muted} r="8px 28px 28px 8px" size={60} op={1 - split} />
        <Seg x={412} y={330} w={562} h={110} color={G3} label="612 × 3" r="8px" size={60} op={split} />
        <Seg x={980} y={330} w={60} h={110} color={C.red} label="1" r="8px 28px 28px 8px" size={60} op={split} />
        <div style={{ opacity: 1 - 0.65 * z }}>
          <Row y={490} start={r1 - 6} tex={`${col(G1, '9')}+${col(G2, '180')}=189\\text{ used}`} />
          <Row y={625} start={left - 6} tex={`2026-189=1837\\text{ left}`} />
        </div>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 812px' }}>
          <Row y={760} start={div - 8} tex={f >= rem ? `1837\\div 3=${col(G3, '612')}\\text{ r }${col(C.red, '1')}` : '1837\\div 3'} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 920, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, l3 + 4) }}>
        <Tex tex={`\\underbrace{100,\\ 101,\\ \\dots,\\ ${f >= end ? col(C.red, '711') : '\\ ?\\ '}}_{612\\text{ numbers}}`} size={76} />
      </div>
    </>
  );
};

/** 711 | 712 side by side; the first digit of 712 is spot 2026 (a "?" until `mask`). From the old short, bigger. */
const Pair: React.FC<{ y: number; a: number; b: number; mask: number }> = ({ y, a, b, mask }) => {
  const f = useCurrentFrame();
  const W = 130;
  const GP = 56;
  const X0 = (1080 - (6 * W + GP)) / 2;
  const cell = (i: number, ch: string, color: string, bg: string, op: number, extra?: React.CSSProperties) => (
    <div key={i} style={{ position: 'absolute', left: X0 + i * W + (i >= 3 ? GP : 0), top: y, width: W, height: 150, background: bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 110, fontWeight: 800, color, opacity: op, ...extra }}>{ch}</div>
  );
  const tgt = X0 + 3 * W + GP;
  const hit = mask >= 0.5;
  return (
    <>
      {['7', '1', '1'].map((ch, i) => cell(i, ch, C.ink, 'rgba(123,97,255,0.16)', a))}
      {['7', '1', '2'].map((ch, i) =>
        i === 0
          ? cell(3, hit ? ch : '?', hit ? C.green : C.red, hit ? 'rgba(33,196,93,0.22)' : 'rgba(239,67,67,0.14)', b, { outline: `7px solid ${hit ? C.green : C.red}`, outlineOffset: 3, transform: `scale(${1 + 0.05 * Math.sin(f / 5)})` })
          : cell(3 + i, ch, C.ink, 'rgba(12,194,129,0.20)', b * 0.4),
      )}
      <div style={{ position: 'absolute', left: X0, top: y - 74, width: 3 * W, textAlign: 'center', fontSize: 58, fontWeight: 900, color: G2, opacity: a }}>711</div>
      <div style={{ position: 'absolute', left: tgt, top: y - 74, width: 3 * W, textAlign: 'center', fontSize: 58, fontWeight: 900, color: C.red, opacity: b }}>712</div>
      <div style={{ position: 'absolute', left: tgt - 90, top: y + 170, width: W + 180, textAlign: 'center', fontSize: 56, fontWeight: 900, color: hit ? C.green : C.red, opacity: b }}>spot 2026</div>
    </>
  );
};

/** The answer, the trap, then back to the opening ribbon under the comment question + pill (loop). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nextAt = cue(scene, 0, 'first');
  const hit = cue(scene, 0, '7!');
  const chime = at(scene, 0, 1);
  const trap = at(scene, 1);
  const back = at(scene, 2);
  const pairOp = fadeTo(f, back, 0, 10);
  const ribOp = ease(f, back, 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>digit 2026 =</span>
          <span style={{ fontSize: 110, fontWeight: 900, lineHeight: 1 }}>7</span>
        </div>
      </div>
      {pairOp > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: pairOp }}>
          <Pair y={600} a={1} b={ease(f, nextAt - 4, 8)} mask={f >= hit ? 1 : 0} />
          <Text x={540} y={870} w={960} size={52} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 0, 0.05))}>
            remainder 1 = 1 digit more
          </Text>
        </div>
      )}
      {ribOp > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: ribOp }}>
          <BigRibbon spot={<span style={{ color: C.green }}>spot 2026 = 7</span>} />
        </div>
      )}
      <Text x={540} y={1010} w={900} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        Trap: 6. They start at 100!
      </Text>
      <CtaPill start={back} y={1150} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sfx at={back} src={SFX.whoosh} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, blocks: Blocks, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

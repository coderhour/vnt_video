import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BoardTile, CHIME, CHOICES, CHOSEN, DOM1, MAIN, NumGrid, SLUG, TALLY, cols, type Cell } from '../Composition';

export { SLUG };

// ~39.5 s AMC 10 short: trap 50 (taking 51…100) stamped NOPE on the 1–100 board, the core-1 grid (right ×2, up ×3,
// clashes = neighbours), dominoes with a counter, the gallery of the other families up to 39 dominoes,
// then 100 − 39 = 61 on the same board (the kept set from verify.py glows green) for a clean loop.

const before = () => -100;

// ---------- the 1–100 board (hook and reveal: same place, so the loop cuts cleanly) ----------
const BX = 70, BY = 510, TILE = 80, GAP = 2;

const Board: React.FC<{ fill: (n: number) => string | undefined; border: (n: number) => string | undefined; opacity?: number }> = ({ fill, border, opacity = 1 }) => (
  <>
    {range(100).map((i) => (
      <BoardTile key={i} n={i + 1} ox={BX} oy={BY} tile={TILE} gap={GAP} font={34} fill={fill(i + 1)} border={border(i + 1)} opacity={opacity} />
    ))}
  </>
);

const Chip: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #19</div>
  </div>
);

/** Opens on the 1–100 board with the trap pick (51…100) shaded, then stamps it. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.71);
  return (
    <>
      <Chip />
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>50</span>?
      </Text>
      <PushIn frames={scene.frames} origin="480px 920px">
        <Board fill={(n) => (n >= 51 ? (f >= nope ? 'rgba(239,67,67,0.28)' : 'rgba(60,131,246,0.22)') : undefined)} border={(n) => (n >= 51 ? (f >= nope ? C.red : C.blue) : undefined)} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 960, top: 820, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

// ---------- question ----------
const EXAMPLES: [string, boolean][] = [['10=2\\times5', false], ['15=3\\times5', false], ['20=4\\times5', true]];

const QuestionBody: React.FC<{ start: (i: number) => number; ex: (i: number) => number; pulse?: (i: number) => number }> = ({ start, ex, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Pick numbers from <b style={{ color: C.blue }}>1 to 100</b>. None may be <b style={{ color: C.red }}>double</b> or <b style={{ color: C.red }}>triple</b> another. What's the <b style={{ color: C.primary }}>most</b> you can pick?
      </div>
      <div style={{ position: 'absolute', left: 50, top: 620, width: 980, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {EXAMPLES.map(([tex, ok], i) => (
          <div key={i} style={{ ...fadeUp(f, ex(i), 8), background: C.card, borderRadius: 22, padding: '12px 14px', flexShrink: 0, whiteSpace: 'nowrap', border: `4px solid ${ok ? C.green : C.red}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tex tex={tex} size={40} />
            <span style={{ fontSize: 42, fontWeight: 900, color: ok ? C.green : C.red }}>{ok ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 60, top: 800, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
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
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.08)} ex={(i) => at(scene, 0, 0.5 + i * 0.12)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait: the question stays, the bubble replaces the example chips right above the choices (above y 900, so the full width is safe), the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} ex={() => 99999} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={615} />
    </>
  );
};

// ---------- the aha: core-1 grid, neighbours, dominoes, then every family ----------
const GX = 150, GY = 1010, GS = 100, GG = 8, GP = GS + GG;
const ORDER = [...MAIN].sort((a, b) => a.r - b.r || a.c - b.c);

const Dominoes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1), l2 = at(scene, 2), l3 = at(scene, 3);
  const cellAt = (k: Cell) => (k.n === 1 ? at(scene, 0, 0.45) : at(scene, 0, 0.5) + ORDER.indexOf(k) * 2.2);
  const domAt = (i: number) => l2 + 8 + i * 5;
  const zoomIn = l1 + 52, zoomOut = l2;
  const zoom = 1 + 0.4 * ease(f, zoomIn, 12) - 0.4 * ease(f, zoomOut, 10);
  const gridOp = 1 - ease(f, l3, 8);
  const GAL = TALLY.slice(1); // core 1 (9 dominoes) is already counted on the big grid
  const cue = (i: number) => l3 + 6 + i * 8;
  const doms = DOM1.filter((_, i) => f >= domAt(i)).length;
  const more = GAL.reduce((a, t, i) => (f >= cue(i) ? a + t.n : a), 0);
  const count = doms + more;
  const bump = Math.max(-99, ...[...DOM1.map((_, i) => domAt(i)), ...GAL.map((_, i) => cue(i))].filter((t) => t <= f));
  const head0 = fadeTo(f, l1, 0, 8);
  const head1 = ease(f, l1 + 62, 8) * fadeTo(f, l2, 0, 8);
  const counterOp = ease(f, domAt(0), 8);
  const CW = 287;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {ORDER.filter((_, i) => i % 3 === 1).map((k) => <Sfx key={k.n} at={cellAt(k)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      {DOM1.map((_, i) => (i % 2 === 0 ? <Sfx key={`d${i}`} at={domAt(i)} src={SFX.click} volume={0.28} /> : null))}
      <Sfx at={l3} src={SFX.whoosh} volume={0.25} />
      {GAL.map((_, i) => <Sfx key={`t${i}`} at={cue(i)} src={SFX.click} volume={0.26} />)}

      {/* headers */}
      <div style={{ opacity: head0 }}>
        <Text x={540} y={290} w={1000} size={80} weight={900} align="center" style={fadeUp(f, 6)}>
          divide out <span style={{ color: C.blue }}>2s</span> and <span style={{ color: C.violet }}>3s</span>
        </Text>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.2)) }}>
          <Tex tex={'72=8\\times9\\times\\color{#0cc281}{1}'} size={64} />
        </div>
      </div>
      <div style={{ opacity: head1 }}>
        <Text x={540} y={300} w={1000} size={84} weight={900} align="center">
          clash = <span style={{ color: C.red }}>neighbors</span>
        </Text>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: counterOp }}>
        <div style={{ background: C.ink, color: '#fff', borderRadius: 24, padding: '10px 44px', fontSize: 66, fontWeight: 900, transform: `scale(${1 + 0.08 * Math.max(0, 1 - (f - bump) / 6)})` }}>
          dominoes: <span style={{ color: '#7ee8b8' }}>{count}</span>
        </div>
      </div>
      <Text x={540} y={420} w={1000} size={58} weight={900} align="center" style={{ ...fadeUp(f, l2 + 48), opacity: ease(f, l2 + 48, 8) * fadeTo(f, l3, 0, 8) }}>
        each keeps <span style={{ color: C.primary }}>at most 1</span>
      </Text>

      {/* the core-1 grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: gridOp, transform: `scale(${zoom})`, transformOrigin: '150px 900px' }}>
        <NumGrid cells={MAIN} ox={GX} oy={GY} size={GS} gap={GG} font={50} appear={cellAt} color={l2}
          dominoes={DOM1.map(([a, b], i) => [a, b, domAt(i)] as [number, number, number])}
          rings={[[64, l2 + 60], [81, l2 + 66]]}
          hl={[{ ns: [6, 12], at: l1 + 62, out: l2 }, { ns: [6, 18], at: l1 + 74, out: l2 }]}
          bridges={f < l2 ? [{ a: 6, b: 12, at: l1 + 62 }, { a: 6, b: 18, at: l1 + 74 }] : []} />
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g stroke={C.muted} strokeWidth={7} strokeLinecap="round" fill="none">
            <path opacity={ease(f, l1 + 4, 10)} d="M 160 1150 L 400 1150 M 380 1132 L 400 1150 L 380 1168" />
            <path opacity={ease(f, l1 + 32, 10)} d="M 105 1100 L 105 860 M 87 880 L 105 860 L 123 880" />
          </g>
        </svg>
        <Text x={420} y={1112} w={200} size={60} weight={900} color={C.blue} style={fadeUp(f, l1 + 4)}>×2</Text>
        <Text x={105} y={770} w={160} size={60} weight={900} color={C.violet} align="center" style={fadeUp(f, l1 + 32)}>×3</Text>
      </div>

      {/* every family: its grid and its dominoes */}
      {f >= l3 &&
        GAL.map((t, i) => {
          const row = Math.floor(i / 3);
          const inRow = row < 2 ? 3 : GAL.length - 6;
          const cx = 60 + (i % 3) * CW + CW / 2 + ((3 - inRow) * CW) / 2;
          const top = 450 + row * 300;
          const c = cue(i);
          const size = 44, gap = 6, pitch = size + gap;
          const w = cols(t.g) * pitch - gap;
          return (
            <div key={i}>
              <Text x={cx} y={top} w={280} size={40} weight={800} color={C.muted} align="center" style={fadeUp(f, c)}>{t.name}</Text>
              <NumGrid cells={t.g.cells} ox={cx - w / 2} oy={top + 56 + 2 * pitch} size={size} gap={gap} font={0} appear={c} color={c}
                dominoes={t.g.dom.map(([a, b]) => [a, b, c + 2] as [number, number, number])} rings={t.g.ring.map((n) => [n, c + 4] as [number, number])} />
              <Text x={cx} y={top + 56 + 3 * pitch + 4} w={280} size={60} weight={900} color={C.primary} align="center" style={fadeUp(f, c + 2)}>+{t.n}</Text>
            </div>
          );
        })}
    </>
  );
};

// ---------- reveal ----------
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.78);
  const chime = at(scene, 0, 0.97);
  const boardIn = ease(f, 0, 6);
  const kept = (n: number) => CHOSEN.has(n) && f >= hit + n * 0.25;
  return (
    <>
      <Board opacity={boardIn} fill={(n) => (kept(n) ? 'rgba(33,196,93,0.38)' : undefined)} border={(n) => (kept(n) ? C.green : undefined)} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, height: 130, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <div style={fadeUp(f, at(scene, 0, 0.32))}>
          <Tex tex={'100-39='} size={96} />
        </div>
        <div style={{ transform: `scale(${f >= hit ? pop(f, hit) : 0})`, background: C.green, color: '#fff', borderRadius: 28, padding: '6px 40px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="61" size={104} color="#fff" />
        </div>
      </div>
      <Text x={540} y={430} w={1000} size={54} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        50 (51 to 100): not the most
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, dominoes: Dominoes, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: two exponent grids (twos 4×4, threes 3×3), one zoom per grid while its good cells fill
// with a live counter (4 + 4 − 1 = 7, 3 + 3 − 1 = 5), then 7 × 5 = 35. Frame 0 and the last frame show the same two grids.

const S = 100; // cell size
const GY = 660; // grid top
const G2X = 100; // twos grid (4 × 4): x 100…500
const G3X = 610; // threes grid (3 × 3): x 610…910
const GREEN_SOFT = 'rgba(12, 194, 129, 0.32)';
const VIOLET_SOFT = 'rgba(123, 97, 255, 0.30)';

/** When each cell of a grid lights up: `col(r)` = frame cell (last col, row r) lights, `row(c)` = (col c, last row). */
type Fill = { col: (r: number) => number; row: (c: number) => number; corner?: number; labels?: number };

const never = () => 99999;
const before = () => -100;
const FULL: Fill = { col: before, row: before };
const EMPTY: Fill = { col: never, row: never };

/** One exponent grid: columns = how many of the prime in a (violet), rows = how many in b (blue). */
const Grid: React.FC<{ x: number; n: number; what: string; color: string; fill: Fill; count?: string; hl?: number }> = ({ x, n, what, color, fill, count, hl }) => {
  const f = useCurrentFrame();
  const last = n - 1;
  const lit = (c: number, r: number) => {
    const a = c === last && f >= fill.col(r);
    const b = r === last && f >= fill.row(c);
    return { a, b };
  };
  const cornerPulse = fill.corner !== undefined && f >= fill.corner && f < fill.corner + 24 ? 1 + 0.12 * Math.sin(((f - fill.corner) / 24) * Math.PI) : 1;
  return (
    <>
      <div style={{ position: 'absolute', left: x - 60, width: n * S + 60, top: GY - 130, textAlign: 'center', fontSize: 56, fontWeight: 900, color, whiteSpace: 'nowrap' }}>
        {what}
        {count && <span style={{ color: C.ink }}> · {count}</span>}
      </div>
      {Array.from({ length: n }, (_, i) => {
        const on = hl !== undefined && (hl === i || (hl > last && i === last));
        const sc = on ? 1.25 : 1;
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: x + i * S, width: S, top: GY - 62, textAlign: 'center', fontSize: 48, fontWeight: 900, color: on ? C.green : C.violet, transform: `scale(${sc})` }}>{i}</div>
            <div style={{ position: 'absolute', left: x - 56, width: 50, top: GY + i * S + S / 2 - 32, textAlign: 'center', fontSize: 48, fontWeight: 900, color: on ? C.green : C.blue, transform: `scale(${sc})` }}>{i}</div>
          </div>
        );
      })}
      {Array.from({ length: n * n }, (_, k) => {
        const c = k % n;
        const r = Math.floor(k / n);
        const { a, b } = lit(c, r);
        const corner = a && b;
        const bg = corner ? `linear-gradient(135deg, ${GREEN_SOFT} 50%, ${VIOLET_SOFT} 50%)` : a ? GREEN_SOFT : b ? VIOLET_SOFT : C.card;
        const bd = corner ? C.ink : a ? C.primary : b ? C.violet : C.line;
        return (
          <div
            key={k}
            style={{
              position: 'absolute', left: x + c * S + 4, top: GY + r * S + 4, width: S - 8, height: S - 8, borderRadius: 16,
              background: bg, border: `${corner ? 6 : 3}px solid ${bd}`, boxSizing: 'border-box',
              transform: `scale(${c === last && r === last ? cornerPulse : 1})`, zIndex: corner ? 2 : 1,
            }}
          />
        );
      })}
    </>
  );
};

const Grids: React.FC<{ twos: Fill; threes: Fill; c2?: string; c3?: string; hl2?: number; hl3?: number }> = ({ twos, threes, c2, c3, hl2, hl3 }) => (
  <>
    <Grid x={G2X} n={4} what="twos" color={C.primary} fill={twos} count={c2} hl={hl2} />
    <Grid x={G3X} n={3} what="threes" color={C.violet} fill={threes} count={c3} hl={hl3} />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #35</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>18</span>?
      </Text>
      <PushIn frames={scene.frames} origin="505px 810px">
        <Grids twos={EMPTY} threes={EMPTY} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 720, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const PairChip: React.FC<{ a: number; b: number }> = ({ a, b }) => (
  <div style={{ background: C.card, border: `5px solid ${C.green}`, borderRadius: 24, padding: '8px 28px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 6px 18px rgba(30,40,80,0.08)' }}>
    (<span style={{ color: C.violet }}>{a}</span>, <span style={{ color: C.blue }}>{b}</span>) <span style={{ color: C.green }}>✓</span>
  </div>
);

const QuestionBody: React.FC<{ start: (i: number) => number; pairs: number; pulse?: (i: number) => number }> = ({ start, pairs, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many <b style={{ color: C.primary }}>ordered pairs</b> (<span style={{ color: C.violet }}>a</span>, <span style={{ color: C.blue }}>b</span>) of positive whole numbers have <b style={{ color: C.violet }}>least common multiple 72</b>?
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 690, display: 'flex', justifyContent: 'center', gap: 40, opacity: pairs, transform: `translateY(${(1 - pairs) * 20}px)` }}>
        <PairChip a={8} b={9} />
        <PairChip a={9} b={8} />
      </div>
      <div style={{ position: 'absolute', left: 60, top: 900, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={(i) => at(scene, 0, 0.75 + i * 0.05)} pairs={ease(f, at(scene, 1, 0.3), 10)} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 1, 0.3)} src={SFX.click} volume={0.25} />
      <Sfx at={at(scene, 1, 0.55)} src={SFX.click} volume={0.25} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pairs={1} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: zoom onto the twos grid while its last column and bottom row fill (4 + 4 − 1 = 7), back out, then the threes (5). */
const Aha: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const show = at(scene, 0, 0.62);
  // twos
  const z2in = at(scene, 1, 0.02);
  const sweep = (i: number) => at(scene, 1, 0.12 + i * 0.1);
  const all3 = at(scene, 1, 0.78);
  const col2 = (r: number) => at(scene, 2, 0.02 + r * 0.04);
  const row2 = (c: number) => at(scene, 2, 0.2 + c * 0.04);
  const corner2 = at(scene, 2, 0.55);
  const seven = at(scene, 2, 0.88);
  const z2out = at(scene, 2, 0.95);
  // threes
  const z3in = at(scene, 3, 0.0);
  const col3 = (r: number) => at(scene, 3, 0.32 + r * 0.05);
  const row3 = (c: number) => at(scene, 3, 0.47 + c * 0.05);
  const corner3 = at(scene, 3, 0.66);
  const five = at(scene, 3, 0.86);
  const z3out = at(scene, 3, 0.93);

  const z2 = 0.35 * (ease(f, z2in, 12) - ease(f, z2out, 10));
  const z3 = 0.35 * (ease(f, z3in, 12) - ease(f, z3out, 10));
  const zoomed2 = f >= z2in && f < z3in;
  const zoom = 1 + z2 + z3;
  const origin = zoomed2 ? '300px 960px' : '910px 900px';

  const hl2 = f >= all3 && f < col2(0) ? 4 : f >= sweep(0) && f < all3 ? Math.min(3, Math.floor((f - sweep(0)) / (sweep(1) - sweep(0)))) : undefined;
  const hl3 = f >= z3in + 8 && f < col3(0) ? 3 : undefined;

  // counter readouts
  const n2c = [0, 1, 2, 3].filter((r) => f >= col2(r)).length;
  const n2r = [0, 1, 2, 3].filter((c) => f >= row2(c)).length;
  const read2 = f >= seven ? '4+4-1=\\textcolor{#0cc281}{7}' : f >= corner2 ? '4+4-1' : n2r > 0 ? `4+${n2r}` : `${n2c}`;
  const n3c = [0, 1, 2].filter((r) => f >= col3(r)).length;
  const n3r = [0, 1, 2].filter((c) => f >= row3(c)).length;
  const read3 = f >= five ? '3+3-1=\\textcolor{#7b61ff}{5}' : f >= corner3 ? '3+3-1' : n3r > 0 ? `3+${n3r}` : `${n3c}`;
  const r2o = ease(f, col2(0), 6) * fadeTo(f, z3in, 0, 8);
  const r3o = ease(f, col3(0), 6);
  const dim2 = 1 - 0.6 * ease(f, z3in, 10);
  const dim3 = 1 - 0.6 * (ease(f, z2in, 10) - ease(f, z2out, 10));

  const twos: Fill = { col: col2, row: row2, corner: corner2 };
  const threes: Fill = { col: col3, row: row3, corner: corner3 };
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={z2in} src={SFX.whoosh} volume={0.25} />
      {[0, 1, 2, 3].map((i) => <Sfx key={`s${i}`} at={sweep(i)} src={SFX.click} volume={0.22} />)}
      {[0, 2].map((i) => <Sfx key={`c${i}`} at={col2(i)} src={SFX.click} volume={0.26} />)}
      {[0, 2].map((i) => <Sfx key={`r${i}`} at={row2(i)} src={SFX.click} volume={0.26} />)}
      <Sfx at={corner2} src={SFX.click} volume={0.3} />
      <Sfx at={z2out} src={SFX.whoosh} volume={0.22} />
      <Sfx at={z3in + 4} src={SFX.whoosh} volume={0.25} />
      <Sfx at={col3(0)} src={SFX.click} volume={0.26} />
      <Sfx at={row3(0)} src={SFX.click} volume={0.26} />
      <Sfx at={corner3} src={SFX.click} volume={0.3} />
      <Sfx at={z3out} src={SFX.whoosh} volume={0.22} />

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: ease(f, 2, 8) * fadeTo(f, z2in, 0, 8) }}>
        <Tex tex={'72 = \\textcolor{#0cc281}{2^3} \\times \\textcolor{#7b61ff}{3^2}'} size={96} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: origin }}>
        <div style={{ position: 'absolute', inset: 0, opacity: ease(f, show, 10) * dim2 }}>
          <Grid x={G2X} n={4} what="twos" color={C.primary} fill={twos} count={f >= seven ? '7' : undefined} hl={hl2} />
        </div>
        <div style={{ position: 'absolute', inset: 0, opacity: ease(f, show + 8, 10) * dim3 }}>
          <Grid x={G3X} n={3} what="threes" color={C.violet} fill={threes} count={f >= five ? '5' : undefined} hl={hl3} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center', opacity: r2o }}>
        <div style={{ background: C.card, border: `5px solid ${C.primary}`, borderRadius: 24, padding: '6px 36px', boxShadow: '0 6px 18px rgba(30,40,80,0.08)' }}>
          <Tex tex={read2} size={72} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1150, display: 'flex', justifyContent: 'center', opacity: r3o }}>
        <div style={{ background: C.card, border: `5px solid ${C.violet}`, borderRadius: 24, padding: '6px 36px', boxShadow: '0 6px 18px rgba(30,40,80,0.08)' }}>
          <Tex tex={read3} size={72} />
        </div>
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, height: 170, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
        <div style={fadeUp(f, 2)}>
          <Tex tex={'\\textcolor{#0cc281}{7} \\times \\textcolor{#7b61ff}{5} ='} size={96} />
        </div>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 40px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="35" size={110} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>pairs</span>
        </div>
      </div>
      <Grids twos={FULL} threes={FULL} c2="7" c3="5" />
      <Text x={540} y={1080} w={960} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        18 ignores the order
      </Text>
      <CtaPill start={at(scene, 2)} y={1175} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, grids: Aha, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

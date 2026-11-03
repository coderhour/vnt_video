import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { NUNITO } from '../../../lib/fonts';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Ball, CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (50), question, comment bait, "count the primes" aha (prime balls of 20·n and 50·n,
// n's twos then its five dropped in one by one, count readouts flipping ✗ → ✓, zoom on the twos, pair/triple
// brackets), reveal (n = 2 × 2 × 5 = 20, 50 = cube not square) + CTA pill. The last frame shows the same rows as frame 0.

const X0 = 310; // first ball
const GAP = 108;
const PG = 32; // extra gap between different primes
const RAD = 48;
const YA = 590; // 20 × n row
const YB = 870; // 50 × n row
const YN = 1140; // n row
const before = -100;

type St = {
  popA?: number; // frame the 20-row balls pop in (default: already there)
  popB?: number;
  add2: number[]; // frames n's twos drop in
  add5: number[]; // frames n's five drops in
  nO: number; // the dashed "n" circle at each row's end
  groupO?: number; // pair / triple brackets
  tail?: number; // 0 … 1: n's balls leave again (the loop back to frame 0)
};

const Txt: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; anchor?: 'start' | 'middle'; opacity?: number }> = ({ x, y, text, size = 64, color = C.ink, anchor = 'start', opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle">
      {text}
    </text>
  );

/** One row: the label, the primes of 20 (or 50), n's added primes (ringed), and the dashed n circle. */
const Row: React.FC<{ y: number; label: string; base: [number, number]; st: St; popAt?: number; group: number }> = ({ y, label, base, st, popAt, group }) => {
  const f = useCurrentFrame();
  const tail = st.tail ?? 0;
  const grow = (t: number) => ease(f, t, 8) * (1 - tail);
  const s2 = base[0] + st.add2.reduce((a, t) => a + grow(t), 0);
  const s5 = base[1] + st.add5.reduce((a, t) => a + grow(t), 0);
  const g = (st.groupO ?? 0) * (1 - tail);
  const sp = 16 * g; // extra space between groups once they are bracketed
  const x2 = (i: number) => X0 + i * GAP + Math.floor(i / group) * sp;
  const x5 = (j: number) => X0 + s2 * GAP + PG + j * GAP + Math.floor(j / group) * sp + Math.floor((s2 - 1e-6) / group) * sp;
  const xn = X0 + (s2 + s5) * GAP + PG + 12;
  const bs = (i: number) => (popAt === undefined ? 1 : pop(f, popAt + i * 5));
  const balls: React.ReactNode[] = [];
  range(base[0]).forEach((i) => balls.push(<Ball key={`b2${i}`} x={x2(i)} y={y} p={2} r={RAD} s={bs(i)} />));
  st.add2.forEach((t, k) => {
    const s = (f >= t ? pop(f, t) : 0) * (1 - tail);
    balls.push(
      <g key={`n2${k}`} opacity={s > 0 ? 1 : 0}>
        <circle cx={x2(base[0] + k)} cy={y} r={(RAD + 7) * s} fill="none" stroke={C.ink} strokeWidth={5} />
        <Ball x={x2(base[0] + k)} y={y} p={2} r={RAD} s={s} />
      </g>,
    );
  });
  range(base[1]).forEach((j) => balls.push(<Ball key={`b5${j}`} x={x5(j)} y={y} p={5} r={RAD} s={bs(base[0] + j)} />));
  st.add5.forEach((t, k) => {
    const s = (f >= t ? pop(f, t) : 0) * (1 - tail);
    balls.push(
      <g key={`n5${k}`} opacity={s > 0 ? 1 : 0}>
        <circle cx={x5(base[1] + k)} cy={y} r={(RAD + 7) * s} fill="none" stroke={C.ink} strokeWidth={5} />
        <Ball x={x5(base[1] + k)} y={y} p={5} r={RAD} s={s} />
      </g>,
    );
  });
  const n2 = base[0] + st.add2.length;
  const n5 = base[1] + st.add5.length;
  const brackets =
    g > 0
      ? [...range(n2 / group).map((k) => [x2(k * group), x2(k * group + group - 1)]), ...range(n5 / group).map((k) => [x5(k * group), x5(k * group + group - 1)])].map(([a, b], k) => (
          <rect key={k} x={a - RAD - 7} y={y - RAD - 7} width={b - a + 2 * RAD + 14} height={2 * RAD + 14} rx={RAD + 7} fill="none" stroke={group === 2 ? C.primary : C.violet} strokeWidth={6} opacity={g} />
        ))
      : null;
  return (
    <>
      <Txt x={36} y={y + 4} text={label} />
      {brackets}
      {balls}
      {st.nO > 0 && (
        <g opacity={st.nO}>
          <circle cx={xn} cy={y} r={RAD} fill={C.card} stroke={C.muted} strokeWidth={5} strokeDasharray="10 8" />
          <Txt x={xn} y={y + 3} text="n" size={52} color={C.muted} anchor="middle" />
        </g>
      )}
    </>
  );
};

const Rows: React.FC<{ st: St; ya?: number; yb?: number }> = ({ st, ya = YA, yb = YB }) => (
  <>
    <Row y={ya} label="20 × n" base={[2, 1]} st={st} popAt={st.popA} group={2} />
    <Row y={yb} label="50 × n" base={[1, 2]} st={st} popAt={st.popB} group={3} />
  </>
);

const BASE: St = { add2: [], add5: [], nO: 1 };

/** Opens on the two prime rows (the same picture the video ends on), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #18</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>50</span>?
      </Text>
      <PushIn frames={scene.frames} origin="480px 740px">
        <Stage>
          <Rows st={BASE} />
        </Stage>
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
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Smallest <b style={{ color: C.violet }}>n</b> so that <b style={{ color: C.primary }}>20n is a perfect square</b> and <b style={{ color: C.violet }}>50n is a perfect cube</b>?
      </div>
      <Stage>
        <Rows st={BASE} ya={665} yb={805} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 900, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 12px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 10, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.75 + i * 0.05)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1050} />
    </>
  );
};

/** "2s: 4 ✓" readout chips under a row; each turns green when its count fits the rule and pops when it changes. */
const Readouts: React.FC<{ y: number; o: number; items: [number, number, boolean, number][] }> = ({ y, o, items }) => {
  const f = useCurrentFrame();
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 150, top: y, display: 'flex', gap: 18, opacity: o }}>
      {items.map(([p, k, ok, flip]) => (
        <div key={p} style={{ background: ok ? C.green : C.red, color: '#fff', borderRadius: 22, padding: '2px 26px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap', transform: `scale(${flip > 0 ? 0.85 + 0.15 * pop(f, flip) : 1})` }}>
          {p}s: {k} {ok ? '✓' : '✗'}
        </div>
      ))}
    </div>
  );
};

const Primes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, a: number) => at(scene, i, a);
  const add2 = [t(2, 0.25), t(2, 0.62)];
  const add5 = [t(3, 0.5)];
  const groupAt = t(3, 0.85);
  const st: St = { popA: t(0, 0.08), popB: t(0, 0.55), add2, add5, nO: ease(f, t(0, 0.9), 8) * fadeTo(f, add2[0], 0, 8), groupO: ease(f, groupAt, 12) };
  const zin = t(2, 0.02);
  const zout = t(3, 0.02);
  const zoom = 1 + 0.32 * ease(f, zin, 12) - 0.32 * ease(f, zout, 12);
  const cnt = (frames: number[]) => frames.filter((x) => f >= x).length;
  const k2 = cnt(add2);
  const k5 = cnt(add5);
  const last = (frames: number[]) => [...frames].reverse().find((x) => f >= x) ?? 0;
  const s2A = 2 + k2;
  const s2B = 1 + k2;
  const ra = ease(f, t(1, 0.05), 8);
  const rb = ease(f, t(1, 0.5), 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zin} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zout} src={SFX.whoosh} volume={0.25} />
      {[...add2, ...add5].map((x, i) => <Sfx key={i} at={x} src={SFX.click} volume={0.3} />)}
      <Sfx at={groupAt} src={SFX.click} volume={0.25} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center', ...fadeUp(f, 0), opacity: ease(f, 0, 10) * fadeTo(f, t(1, 0), 0, 8) }}>
        <div style={{ fontSize: 84, fontWeight: 900, color: C.violet }}>Count the primes!</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '36px 780px' }}>
        <Text x={36} y={448} w={900} size={58} weight={900} color={C.primary} style={{ opacity: ra }}>
          Square: even counts
        </Text>
        <Text x={36} y={745} w={900} size={58} weight={900} color={C.violet} style={{ opacity: rb }}>
          Cube: multiples of 3
        </Text>
        <Stage>
          <Rows st={st} />
          <Txt x={36} y={YN + 4} text="n =" opacity={ease(f, zin + 4, 8)} />
          {add2.map((x, i) => <Ball key={i} x={X0 + i * GAP} y={YN} p={2} r={RAD} s={f >= x ? pop(f, x) : 0} />)}
          <Ball x={X0 + 2 * GAP + PG} y={YN} p={5} r={RAD} s={f >= add5[0] ? pop(f, add5[0]) : 0} />
        </Stage>
        <Readouts y={YA + 66} o={ra} items={[[2, s2A, s2A % 2 === 0, last(add2)], [5, 1 + k5, (1 + k5) % 2 === 0, last(add5)]]} />
        <Readouts y={YB + 66} o={rb} items={[[2, s2B, s2B % 3 === 0, last(add2)], [5, 2 + k5, (2 + k5) % 3 === 0, last(add5)]]} />
      </div>
    </>
  );
};

/** The answer, the trap (50: 20 × 50 is a cube, not a square), then the CTA pill over the same rows as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.86);
  const chime = at(scene, 0, 0.99);
  const cta = at(scene, 2);
  const tail = ease(f, cta, 14);
  const st: St = { add2: [before, before], add5: [before], nO: tail, groupO: 1, tail };
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="n = 20" size={88} color="#fff" />
        </div>
      </div>
      <Stage>
        <Rows st={st} />
        <g opacity={1 - tail}>
          <Txt x={36} y={YN + 4} text="n =" />
          <Ball x={X0} y={YN} p={2} r={RAD} />
          <Ball x={X0 + GAP} y={YN} p={2} r={RAD} />
          <Ball x={X0 + 2 * GAP + PG} y={YN} p={5} r={RAD} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1100, display: 'flex', paddingLeft: 660, boxSizing: 'border-box', opacity: ease(f, hit, 8) * (1 - tail) }}>
        <Tex tex="= 20" size={72} color={C.green} />
      </div>
      <Text x={540} y={428} w={1000} size={54} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.3)), opacity: ease(f, at(scene, 1, 0.3), 10) * (1 - tail) }}>
        20 × 50 = 1000: a cube, not a square
      </Text>
      <CtaPill start={cta} y={1165} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, primes: Primes, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

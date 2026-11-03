import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { NUNITO } from '../../../lib/fonts';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ANN, BOB, CHIME, FC, GOLD, PILE, SLUG, comb, type Face } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (1/2), question, comment bait, the aha (flip Ann's coins, 12 coins, count the heads,
// then the three piles: zoom on the middle, the mirrored sides), then Choice D over the same coin rows as frame 0.

const CHOICES = ['\\dfrac{793}{2048}', '\\dfrac12', '\\dfrac{575}{1024}', '\\dfrac{1255}{2048}', '\\dfrac{1651}{2048}'];
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const before = () => -100;

// coin rows of the hook / reveal (same place, so the loop cuts cleanly)
const RY = { ann: 570, bob: 710 };
const R = 50;
const RP = 116;
const RX = (i: number) => 250 + i * RP;

const Rows: React.FC<{ faces?: { a: Face[]; b: Face[] } }> = ({ faces }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        {range(5).map((i) => <FC key={`a${i}`} f={f} x={RX(i)} y={RY.ann} r={R} rim={ANN} from={faces?.a[i] ?? 'N'} />)}
        {range(7).map((i) => <FC key={`b${i}`} f={f} x={RX(i)} y={RY.bob} r={R} rim={BOB} from={faces?.b[i] ?? 'N'} />)}
      </Stage>
      <RowLabels o={1} />
    </>
  );
};

const RowLabels: React.FC<{ o: number }> = ({ o }) => (
  <>
    <Text x={40} y={RY.ann - 40} w={180} size={58} weight={900} color={ANN} style={{ opacity: o }}>Ann</Text>
    <Text x={40} y={RY.bob - 40} w={180} size={58} weight={900} color={BOB} style={{ opacity: o }}>Bob</Text>
  </>
);

// the 13 piles of 12 coins: C(12, k) ways to get k heads
const BASE = 1130;
const PX = 80;
const PP = 64;
const PW = 54;
const MAXH = 300;
const bx = (k: number) => PX + k * PP;
const Piles: React.FC<{ rise: number; color: (k: number) => string; op?: (k: number) => number; glow?: (k: number) => number }> = ({ rise, color, op = () => 1, glow = () => 0 }) => (
  <Stage>
    {range(13).map((k) => {
      const h = Math.max(4, (comb(12, k) / 924) * MAXH * rise);
      const g = glow(k);
      return (
        <g key={k} opacity={op(k)}>
          {g > 0 && <rect x={bx(k) - 7} y={BASE - h - 7} width={PW + 14} height={h + 14} rx={10} fill="none" stroke={C.ink} strokeWidth={5} opacity={g} />}
          <rect x={bx(k)} y={BASE - h} width={PW} height={h} rx={7} fill={color(k)} />
        </g>
      );
    })}
    {[0, 6, 12].map((k) => (
      <text key={k} x={bx(k) + PW / 2} y={BASE + 44} textAnchor="middle" fontSize={50} fontWeight={900} fill={k === 6 ? GOLD : C.muted} fontFamily={NUNITO} opacity={rise}>{k}</text>
    ))}
  </Stage>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #16</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1/2</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 840px">
        <Rows />
        <Piles rise={1} color={() => PILE} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 545, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        <b style={{ color: ANN }}>Ann</b> flips <b>5</b> fair coins, <b style={{ color: BOB }}>Bob</b> flips <b>7</b>. Chance Bob gets <b style={{ color: C.violet }}>MORE heads</b> than Ann?
      </div>
      <Stage>
        {range(5).map((i) => <FC key={`a${i}`} f={f} x={270 + i * 92} y={650} r={40} rim={ANN} from="N" />)}
        {range(7).map((i) => <FC key={`b${i}`} f={f} x={270 + i * 92} y={760} r={40} rim={BOB} from="N" />)}
      </Stage>
      <Text x={60} y={620} w={180} size={50} weight={900} color={ANN}>Ann</Text>
      <Text x={60} y={730} w={180} size={50} weight={900} color={BOB}>Bob</Text>
      <div style={{ position: 'absolute', left: 60, top: 860, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
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
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={600} />
    </>
  );
};

const Head: React.FC<{ y: number; o: number; children: React.ReactNode; sc?: number }> = ({ y, o, children, sc = 1 }) =>
  o > 0 ? (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: o, transform: `scale(${sc})`, fontSize: 76, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
  ) : null;

const chip: React.CSSProperties = { background: C.card, borderRadius: 26, padding: '6px 36px', boxShadow: '0 8px 28px rgba(30,40,80,0.09)' };

const SA: Face[] = ['H', 'H', 'H', 'T', 'T']; // Ann: 3 heads, 2 tails
const SB: Face[] = ['H', 'T', 'H', 'H', 'T', 'H', 'T']; // Bob: 4 heads, so Bob wins this one
const opp = (a: Face): Face => (a === 'H' ? 'T' : 'H');
// after the flip, the 12 coins in one row: Bob's 7, then Ann's 5 flipped. Heads: 4 + 2 = 6.
const ROW: { who: 'a' | 'b'; i: number; face: Face }[] = [...SB.map((face, i) => ({ who: 'b' as const, i, face })), ...SA.map((fc, i) => ({ who: 'a' as const, i, face: opp(fc) }))];
const HEADS = ROW.map((c, j) => (c.face === 'H' ? j : -1)).filter((j) => j >= 0);

const Flip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  // line 0: coins land, zoom on Ann's row, her coins flip over
  const flip0 = t(0, 0.2);
  const zoom1 = 0.08 * ease(f, 14, 14) * (1 - ease(f, t(0, 0.78), 12));
  // line 1: one row of 12, count the heads
  const merge = ease(f, t(1), 18);
  const cx = (j: number) => 78 + j * 84;
  const tally0 = t(1, 0.3);
  const tallyN = HEADS.filter((_, n) => f >= tally0 + n * 7).length;
  // line 2: the 13 piles, zoom on the middle, then the mirrored sides
  const rise = ease(f, t(2), 20);
  const zoom2 = 0.35 * ease(f, t(2, 0.08), 14) * (1 - ease(f, t(2, 0.48), 12));
  const mirror = ease(f, t(2, 0.52), 12);
  const pairK = Math.floor((f - t(2, 0.58)) / 5); // pairs (5,7), (4,8), … light up in turn
  const color = (k: number) => (k === 6 ? GOLD : mirror > 0.5 ? (k < 6 ? C.blue : C.green) : PILE);
  const glow = (k: number) => (k === 6 ? ease(f, t(2, 0.1), 8) * (1 - mirror) : pairK >= 0 && Math.min(k, 12 - k) === 5 - Math.min(pairK, 5) && k !== 6 ? 1 : 0);
  const zoom = 1 + zoom1 + zoom2;
  const origin = f < t(1) ? '520px 640px' : '491px 1000px';
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 4, 8].map((d) => <Sfx key={d} at={2 + d} src={SFX.click} volume={0.22} />)}
      <Sfx at={14} src={SFX.whoosh} volume={0.25} />
      {[0, 2, 4].map((i) => <Sfx key={`f${i}`} at={flip0 + i * 5} src={SFX.click} volume={0.28} />)}
      <Sfx at={t(1)} src={SFX.whoosh} volume={0.25} />
      {HEADS.map((_, n) => <Sfx key={`h${n}`} at={tally0 + n * 7} src={SFX.click} volume={0.25} />)}
      {[0, 10].map((d) => <Sfx key={`r${d}`} at={t(2) + d} src={SFX.click} volume={0.22} />)}
      <Sfx at={t(2, 0.08)} src={SFX.whoosh} volume={0.25} />
      <Sfx at={t(2, 0.48)} src={SFX.whoosh} volume={0.25} />
      {range(6).map((n) => <Sfx key={`p${n}`} at={t(2, 0.58) + n * 5} src={SFX.click} volume={n % 2 ? 0.22 : 0.28} />)}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: origin }}>
        <Stage>
          {SA.map((fc, i) => {
            const j = 7 + i;
            const lit = merge > 0.5 && HEADS.indexOf(j) >= 0 && f >= tally0 + HEADS.indexOf(j) * 7;
            return (
              <FC key={`a${i}`} f={f} x={lerp(RX(i), cx(j), merge)} y={lerp(RY.ann, 640, merge)} r={lerp(R, 38, merge)} rim={ANN}
                from={f < flip0 ? 'N' : fc} to={f < flip0 ? fc : opp(fc)} start={f < flip0 ? 2 + i : flip0 + i * 5} dur={f < flip0 ? 14 : 20} glow={lit ? 1 : 0} />
            );
          })}
          {SB.map((fc, i) => {
            const lit = merge > 0.5 && HEADS.indexOf(i) >= 0 && f >= tally0 + HEADS.indexOf(i) * 7;
            return <FC key={`b${i}`} f={f} x={lerp(RX(i), cx(i), merge)} y={lerp(RY.bob, 640, merge)} r={lerp(R, 38, merge)} rim={BOB} from="N" to={fc} start={4 + i} dur={14} glow={lit ? 1 : 0} />;
          })}
        </Stage>
        <RowLabels o={1 - merge} />
        {rise > 0 && <Piles rise={rise} color={color} glow={glow} />}
        {mirror > 0 && (
          <Stage>
            <line x1={bx(6) + PW / 2} y1={BASE - MAXH - 50} x2={bx(6) + PW / 2} y2={BASE + 6} stroke={C.ink} strokeWidth={5} strokeDasharray="14 12" opacity={mirror * 0.6} />
          </Stage>
        )}
      </div>
      <Head y={290} o={fadeTo(f, t(1), 0, 8)}>
        Flip <span style={{ color: ANN }}>Ann's</span> coins!
      </Head>
      <Head y={400} o={ease(f, t(0, 0.4), 8) * fadeTo(f, t(0, 0.72), 0, 6)}>
        <span style={{ fontSize: 64 }}>tails → <span style={{ color: C.primary }}>heads</span></span>
      </Head>
      <Head y={400} o={ease(f, t(0, 0.74), 8) * fadeTo(f, t(1), 0, 6)}>
        <span style={{ fontSize: 64, color: C.violet }}>fair coins stay fair</span>
      </Head>
      <Head y={290} o={ease(f, t(1, 0.05), 8) * fadeTo(f, t(2), 0, 8)}>
        <span>Bob wins: <span style={{ color: C.green }}>6+ heads</span></span>
      </Head>
      <Head y={760} o={ease(f, tally0, 6) * fadeTo(f, t(2), 0, 8)} sc={1 + 0.08 * Math.max(0, 1 - Math.abs(f - (tally0 + (tallyN - 1) * 7) - 3) / 4)}>
        <div style={{ ...chip, background: tallyN >= 6 ? C.green : C.card, color: tallyN >= 6 ? '#fff' : C.ink, fontSize: 72 }}>
          heads: {tallyN}{tallyN >= 6 ? ' ✓' : ''}
        </div>
      </Head>
      <Head y={290} o={ease(f, t(2, 0.05), 8) * fadeTo(f, t(2, 0.5), 0, 6)}>
        <span>exactly <span style={{ color: GOLD }}>6 heads</span></span>
      </Head>
      <Head y={290} o={ease(f, t(2, 0.52), 8)} sc={0.9 + 0.1 * mirror}>
        <span><span style={{ color: C.blue }}>left</span> = <span style={{ color: C.green }}>right</span></span>
      </Head>
      <Head y={395} o={ease(f, t(2, 0.6), 8)}>
        <span style={{ fontSize: 60, color: C.muted }}>mirror images</span>
      </Head>
    </>
  );
};

/** Choice D over the same coin rows as frame 0, the piles below (middle + one side), then the trap and the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const hit = t(0, 0.29);
  const chime = t(0, 0.97);
  const win = ease(f, t(0, 0.05), 10);
  return (
    <>
      <Rows />
      <Piles rise={1} color={(k) => (k === 6 ? GOLD : k > 6 ? C.green : PILE)} op={(k) => (k < 6 ? 1 - 0.55 * win : 1)} glow={(k) => (k >= 6 ? win : 0)} />
      {f >= hit && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 30, padding: '8px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
            <span style={{ fontSize: 76, fontWeight: 900 }}>D</span>
            <Tex tex={'\\dfrac{1255}{2048}'} size={66} color="#fff" />
          </div>
        </div>
      )}
      <Head y={1212} o={ease(f, t(1, 0.05), 8) * fadeTo(f, t(2), 0, 8)}>
        <span style={{ fontSize: 56, color: C.red, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Tex tex={'\\dfrac12'} size={58} color={C.red} /> is for 6 coins vs 5 ✗
        </span>
      </Head>
      <CtaPill start={t(2)} y={1205} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={t(1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, flip: Flip, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

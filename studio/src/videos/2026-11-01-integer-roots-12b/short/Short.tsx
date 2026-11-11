import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, POS, SLUG } from '../Composition';

export { SLUG };

// New recipe: trap-first AMC 10 hook (8 = only the positive pairs), question, comment bait, the aha (the
// (r + 12)(s + 12) grid: three parts, add 144, it factors, zoom on the 144 cell) and the factor-pair list,
// reveal 16 under the same grid as frame 0.

const before = () => -100;

// The grid (a sketch, not to scale): columns r | 12, rows s | 12.
const GX = 170;
const GY = 620;
const CW = [450, 300];
const RH = [300, 220];
const CELLS = [
  { c: 0, r: 0, t: 'rs', col: C.violet },
  { c: 1, r: 0, t: '12s', col: C.primary },
  { c: 0, r: 1, t: '12r', col: C.primary },
  { c: 1, r: 1, t: '144', col: C.amber },
];
const cx = (c: number) => GX + (c ? CW[0] : 0);
const cy = (r: number) => GY + (r ? RH[0] : 0);
const W = CW[0] + CW[1];
const H = RH[0] + RH[1];

/** The grid; `text[i]` = opacity of cell i's label, `hot` = the 144 cell lit, `ring` = green outline, `labels` = side labels. */
const Grid: React.FC<{ text?: number[]; hot?: number; ring?: number; labels?: number; whole?: number; opacity?: number }> = ({ text = [0, 0, 0, 0], hot = 0, ring = 0, labels = 1, whole = 0, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <Stage>
        {CELLS.map((c, i) => (
          <rect key={i} x={cx(c.c)} y={cy(c.r)} width={CW[c.c]} height={RH[c.r]} fill={c.col} fillOpacity={0.1 + (i === 3 ? 0.35 * hot : 0) + 0.12 * text[i]} stroke={C.ink} strokeWidth={6} />
        ))}
        <rect x={GX - 8} y={GY - 8} width={W + 16} height={H + 16} fill="none" stroke={C.green} strokeWidth={12} rx={10} opacity={ring} />
      </Stage>
      {CELLS.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: cx(c.c), top: cy(c.r), width: CW[c.c], height: RH[c.r], display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: text[i], transform: `scale(${0.6 + 0.4 * text[i]})` }}>
          <Tex tex={c.t} size={i === 3 ? 92 : 84} color={c.col === C.amber ? '#b87400' : c.col} />
        </div>
      ))}
      {/* side labels: r | 12 on top, s | 12 on the left; then the whole sides r + 12, s + 12 */}
      <div style={{ opacity: labels * (1 - whole) }}>
        <Text x={GX + CW[0] / 2} y={GY - 82} w={200} size={64} weight={900} align="center" color={C.violet}>r</Text>
        <Text x={GX + CW[0] + CW[1] / 2} y={GY - 82} w={200} size={64} weight={900} align="center">12</Text>
        <Text x={95} y={GY + RH[0] / 2 - 42} w={120} size={64} weight={900} align="center" color={C.violet}>s</Text>
        <Text x={95} y={GY + RH[0] + RH[1] / 2 - 42} w={120} size={64} weight={900} align="center">12</Text>
      </div>
      {whole > 0 && (
        <>
          <div style={{ position: 'absolute', left: GX, width: W, top: GY - 92, display: 'flex', justifyContent: 'center', opacity: whole }}>
            <Tex tex="r+12" size={66} color={C.green} />
          </div>
          <div style={{ position: 'absolute', left: 90 - 150, width: 300, top: GY + H / 2 - 40, display: 'flex', justifyContent: 'center', transform: 'rotate(-90deg)', opacity: whole }}>
            <Tex tex="s+12" size={66} color={C.green} />
          </div>
        </>
      )}
    </div>
  );

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.78);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10B prep · Challenge #8</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>8</span>?
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 512, display: 'flex', justifyContent: 'center' }}>
        <Tex tex="x^2+bx+12b=0" size={60} />
      </div>
      <PushIn frames={scene.frames} origin="545px 880px">
        <Grid labels={0} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 58, fontWeight: 800, lineHeight: 1.32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        For how many <b style={{ color: C.amber }}>integers b</b> are <b style={{ color: C.primary }}>both roots integers</b>?
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 610, display: 'flex', justifyContent: 'center' }}>
        <Tex tex="x^2+bx+12b=0" size={104} />
      </div>
      <div style={{ position: 'absolute', left: 30, top: 870, width: 1020, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={String(c)} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 0, 0.78 + i * 0.04)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1080} />
    </>
  );
};

/** One maths row centred at the top. */
const TopEq: React.FC<{ tex: string; o: number; size?: number; color?: string; y?: number }> = ({ tex, o, size = 72, color = C.ink, y = 290 }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: o }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

const ROW_Y = (i: number) => 556 + i * 68;
const POS_X = 110;
const NEG_X = 560;

/** The factor pairs of 144: positive column (counted 1..8), then the negative column all at once. */
const Pairs: React.FC<{ pos: (i: number) => number; neg: number; count: number; negFlash?: number; opacity?: number }> = ({ pos, neg, count, negFlash = 0, opacity = 1 }) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      {count > 0 && (
        <div style={{ position: 'absolute', left: POS_X - 20, top: 460, background: C.primary, color: '#fff', borderRadius: 20, padding: '6px 28px', fontSize: 56, fontWeight: 900 }}>
          + pairs: {count}
        </div>
      )}
      <div style={{ position: 'absolute', left: NEG_X - 20, top: 460, background: negFlash > 0 ? C.red : C.violet, color: '#fff', borderRadius: 20, padding: '6px 28px', fontSize: 56, fontWeight: 900, opacity: ease(f, neg, 6), transform: `scale(${pop(f, neg)})`, transformOrigin: 'left center' }}>
        − pairs: 8
      </div>
      {POS.map(([u, v], i) => (
        <div key={i}>
          <div style={{ position: 'absolute', left: POS_X, top: ROW_Y(i), whiteSpace: 'nowrap', ...fadeUp(f, pos(i), 6) }}>
            <Tex tex={`${u}\\times${v}`} size={60} />
          </div>
          <div style={{ position: 'absolute', left: NEG_X, top: ROW_Y(i), whiteSpace: 'nowrap', ...fadeUp(f, neg + i, 6) }}>
            <Tex tex={`(-${u})\\times(-${v})`} size={60} color={negFlash > 0 ? C.red : C.violet} />
          </div>
        </div>
      ))}
    </div>
  );
};

const Trick: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const text = [ease(f, t(0, 0.6), 8), ease(f, t(0, 0.76), 8), ease(f, t(0, 0.88), 8), ease(f, t(1, 0.08), 8)];
  const zIn = t(1, 0.05);
  const zOut = t(1, 0.78);
  const z = 1 + 0.3 * ease(f, zIn, 14) - 0.3 * ease(f, zOut, 14);
  const gridOut = t(2, 0.92);
  const posAt = (i: number) => t(3, 0.02) + i * 6;
  const count = POS.reduce((n, _, i) => (f >= posAt(i) ? i + 1 : n), 0);
  const neg = t(3, 0.68);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0.6, 0.76, 0.88].map((p) => <Sfx key={p} at={t(0, p)} src={SFX.click} volume={0.26} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.28} />
      <Sfx at={t(1, 0.08)} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={t(2, 0.25)} src={SFX.click} volume={0.26} />
      {[0, 2, 4, 6].map((i) => <Sfx key={i} at={posAt(i)} src={SFX.click} volume={0.25} />)}
      <Sfx at={neg} src={SFX.whoosh} volume={0.3} />
      <TopEq tex="rs+12r+12s=0" o={ease(f, t(0, 0.4), 10) * fadeTo(f, t(1, 0.15), 0, 6)} />
      <TopEq tex="rs+12r+12s{\color{#b87400}+144}=0{\color{#b87400}+144}" size={60} o={ease(f, t(1, 0.15), 8) * fadeTo(f, t(2, 0.1), 0, 6)} />
      <TopEq tex="(r+12)(s+12)=144" size={80} color={C.green} o={ease(f, t(2, 0.15), 10)} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: `${cx(1) + CW[1] / 2}px ${cy(1) + RH[1] / 2}px` }}>
        <Grid text={text} hot={ease(f, t(1, 0.08), 10)} ring={ease(f, t(1, 0.62), 10) * fadeTo(f, t(2, 0.6), 0, 10)} whole={ease(f, t(2, 0.25), 10)} opacity={fadeTo(f, gridOut, 0, 8)} />
      </div>
      <Text x={540} y={1150} w={800} size={36} weight={700} color={C.muted} align="center" style={{ opacity: ease(f, 6, 10) * fadeTo(f, gridOut, 0, 8) }}>
        a sketch, not to scale
      </Text>
      <Pairs pos={posAt} neg={neg} count={count} />
    </>
  );
};

/** 16, the trap, then the list gives way to the same grid as frame 0 (filled in) under the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const hit = t(0, 0.71);
  const chime = t(0, 0.97);
  const trap = t(1, 0.05);
  const swap = t(2, 0.0);
  return (
    <>
      <TopEq tex="(r+12)(s+12)=144" size={80} color={C.green} o={fadeTo(f, hit - 6, 0, 6)} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>C</span>
          <Tex tex="16" size={110} color="#fff" />
          <span style={{ fontSize: 60, fontWeight: 900 }}>values of b</span>
        </div>
      </div>
      <Pairs pos={before} neg={-100} count={8} negFlash={f >= trap && f < swap ? 1 : 0} opacity={fadeTo(f, swap, 0, 10)} />
      <Grid text={[1, 1, 1, 1]} hot={1} opacity={ease(f, swap + 4, 12)} />
      <Text x={490} y={1115} w={860} size={60} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, trap), opacity: ease(f, trap, 10) * fadeTo(f, swap, 0, 8) }}>
        8 forgets the negatives ✗
      </Text>
      <CtaPill start={t(2)} y={1180} />
      <Sfx at={0} src={SFX.whoosh} volume={0.25} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sfx at={swap} src={SFX.whoosh} volume={0.22} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, trick: Trick, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

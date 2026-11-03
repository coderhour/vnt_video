import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ALI, ALI_D, BEA, BEA_D, CH, COIN, SLUG, chime } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: $150 (Ali alone) is the trap, the bar model + balance is the aha, $240 is the answer.
// The same two bars (Ali 5 parts, Bea 3 parts) sit at the same place in the hook ("?") and at the end of the reveal ("$30").

const PW = 150; // every part is this wide, in every bar
const GP = 8;
const BH = 110;
const X0 = 60;
const BLK = 90; // the $10 block: small and fixed, clearly not a part
const px = (i: number, x0 = X0) => x0 + i * (PW + GP);
const YA = 600; // Ali's bar
const YB = 790; // Bea's bar
const YD = 990; // twice Bea: her bar drawn twice, at YD and YD2 (aha only)
const YD2 = YD + BH + 10;
const LBL = 66; // labels sit this far above their bar
const before = -100;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const Part: React.FC<{ x: number; y: number; color: string; op?: number; scale?: number; dashed?: boolean; label?: string; glow?: number }> = ({ x, y, color, op = 1, scale = 1, dashed, label, glow = 0 }) =>
  op <= 0 ? null : (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: PW, height: BH, borderRadius: 16, boxSizing: 'border-box', opacity: op, transform: `scale(${scale})`,
        background: dashed ? 'transparent' : color, border: dashed ? `5px dashed ${color}` : undefined,
        boxShadow: glow > 0 ? `0 0 0 ${8 * glow}px rgba(245,159,10,${0.6 * glow})` : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 44, fontWeight: 900,
      }}
    >
      {label}
    </div>
  );

/** n parts popping in from `start` (pass a negative start for "already there"). */
const Parts: React.FC<{ y: number; n: number; color: string; start: number; x0?: number; op?: number; label?: (i: number) => string | undefined; skip?: number[] }> = ({ y, n, color, start, x0 = X0, op = 1, label = () => undefined, skip = [] }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        if (skip.includes(i)) return null;
        const s = pop(f, start + i * 5);
        return <Part key={i} x={px(i, x0)} y={y} color={color} op={Math.min(1, s * 2) * op} scale={0.6 + 0.4 * Math.min(1, s)} label={label(i)} />;
      })}
    </>
  );
};

const Coin10: React.FC<{ x: number; y: number; op?: number }> = ({ x, y, op = 1 }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y + 10, width: BLK, height: BH - 20, borderRadius: 12, background: COIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, opacity: op, boxShadow: '0 4px 10px rgba(245,159,10,0.4)' }}>$10</div>
  );

const Gap10: React.FC<{ x: number; y: number; op?: number }> = ({ x, y, op = 1 }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y + 10, width: BLK, height: BH - 20, borderRadius: 12, border: `4px dashed ${COIN}`, boxSizing: 'border-box', opacity: op, color: COIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 900 }}>−10</div>
  );

/** Label above a bar: the name, then an optional amount (swapped in place as it changes). */
const Label: React.FC<{ y: number; name: string; color: string; op?: number; children?: React.ReactNode }> = ({ y, name, color, op = 1, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: X0, top: y - LBL, height: 60, display: 'flex', alignItems: 'center', gap: 22, fontSize: 58, fontWeight: 900, color, opacity: op, whiteSpace: 'nowrap' }}>
      {name}
      {children}
    </div>
  );

/** Fades one label text out and the next in, at the given frames. */
const swap = (f: number, a: number, b: number) => ease(f, a, 8) * fadeTo(f, b, 0, 6);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #43</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>$150</span>?
      </Text>
      <PushIn frames={scene.frames} origin="400px 760px">
        <Label y={YA} name="Ali" color={ALI_D} />
        <Parts y={YA} n={5} color={ALI} start={before} label={() => '?'} />
        <Label y={YB} name="Bea" color={BEA_D} />
        <Parts y={YB} n={3} color={BEA} start={before} label={() => '?'} />
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
        If <b style={{ color: ALI_D }}>Ali</b> gives <b style={{ color: BEA_D }}>Bea</b> 20% of his money, they have the <b>same</b>.
        <div style={{ height: 14 }} />
        If <b style={{ color: C.violet }}>instead</b> <b style={{ color: BEA_D }}>Bea</b> gives <b style={{ color: ALI_D }}>Ali</b> $10, Ali has <b>twice</b> as much.
        <div style={{ height: 14 }} />
        <b>How many dollars together?</b>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 860, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={`\\$${c}`} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.78 + i * 0.04)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1120} />
    </>
  );
};

/** The aha: 20% = one of Ali's 5 parts, so Bea has 3; then the $10 swap gives a balance, and 1 part = $30. */
const Bars: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a0 = at(scene, 0, 0.45);
  // clue 1: the 5th part rides to Bea's bar and back
  const giveA = at(scene, 1, 0.08);
  const give = ease(f, giveA, 20);
  const beaIn = at(scene, 1, 0.12);
  const match = at(scene, 1, 0.38);
  const three = at(scene, 1, 0.75);
  const backA = at(scene, 2, 0);
  const back = ease(f, backA, 14);
  const g = give - back;
  const gx = lerp(px(4), px(3), g);
  const gy = lerp(YA, YB, g) - Math.sin(g * Math.PI) * 40;
  // clue 2: the $10 block rides from Bea's end to Ali's end, then twice Bea's bar
  const coinA = at(scene, 2, 0.1);
  const coin = ease(f, coinA, 18);
  const cx = lerp(px(3), px(5), coin);
  const cy = lerp(YB, YA, coin) - Math.sin(coin * Math.PI) * 40;
  const dbl = at(scene, 2, 0.5);
  // the balance, zoomed
  const eqA = at(scene, 3, 0.05);
  const zIn = at(scene, 3, 0.15);
  const cancel = at(scene, 3, 0.45);
  const one = at(scene, 3, 0.72);
  const zOut = Math.min(scene.frames - 12, at(scene, 3, 1));
  const zoom = 1 + 0.06 * ease(f, zIn, 12) - 0.06 * ease(f, zOut, 10);
  const punch = 1 + 0.3 * ease(f, zIn, 12) - 0.3 * ease(f, zOut, 10); // the balance itself zooms in
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 2, 4].map((i) => <Sfx key={i} at={a0 + i * 5} src={SFX.click} volume={0.25} />)}
      <Sfx at={giveA} src={SFX.whoosh} volume={0.22} />
      <Sfx at={match} src={SFX.click} volume={0.28} />
      <Sfx at={three} src={SFX.click} volume={0.28} />
      <Sfx at={coinA} src={SFX.whoosh} volume={0.22} />
      <Sfx at={dbl} src={SFX.click} volume={0.25} />
      <Sfx at={dbl + 15} src={SFX.click} volume={0.25} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={cancel} src={SFX.click} volume={0.3} />
      <Sfx at={one} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />

      {/* heading, one per line */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: ease(f, 0, 8) * fadeTo(f, at(scene, 1), 0, 8) }}>
        <Tex tex="20\% = \dfrac{1}{5}" size={84} />
      </div>
      <Text x={540} y={330} w={1000} size={76} weight={900} align="center" style={{ opacity: swap(f, at(scene, 1, 0.05), at(scene, 2)) }}>
        Clue 1: <span style={{ color: ALI_D }}>Ali</span> gives a part
      </Text>
      <Text x={540} y={330} w={1000} size={76} weight={900} align="center" style={{ opacity: swap(f, at(scene, 2, 0.02), at(scene, 3)) }}>
        Clue 2: <span style={{ color: BEA_D }}>Bea</span> gives <span style={{ color: COIN }}>$10</span>
      </Text>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 370px' }}>
        {/* Ali */}
        <Label y={YA} name="Ali" color={ALI_D} op={ease(f, a0 - 8, 8)}>
          <span style={{ position: 'relative' }}>
            <span style={{ opacity: swap(f, a0 + 20, match) }}>5 parts</span>
            <span style={{ position: 'absolute', left: 0, opacity: swap(f, match, backA + 6) }}>4 parts</span>
            <span style={{ position: 'absolute', left: 0, opacity: swap(f, backA + 6, coinA + 14) }}>5 parts</span>
            <span style={{ position: 'absolute', left: 0, opacity: ease(f, coinA + 14, 8) }}>5 parts + 10</span>
          </span>
        </Label>
        <Parts y={YA} n={5} color={ALI} start={a0} skip={f >= giveA && f < backA + 14 ? [4] : []} />
        {f >= giveA && f < backA + 14 && <Part x={gx} y={gy} color={ALI} glow={ease(f, three - 8, 6) * fadeTo(f, backA, 0, 6)} />}
        <Part x={px(4)} y={YA} color={ALI} dashed op={f >= giveA + 4 && f < backA ? 0.6 : 0} />
        <Coin10 x={cx} y={cy} op={ease(f, coinA - 6, 6)} />
        {/* Bea */}
        <Label y={YB} name="Bea" color={BEA_D} op={ease(f, beaIn - 6, 8)}>
          <span style={{ position: 'relative' }}>
            <span style={{ opacity: swap(f, match, three) }}>4 parts</span>
            <span style={{ position: 'absolute', left: 0, opacity: swap(f, three, coinA + 14) }}>3 parts</span>
            <span style={{ position: 'absolute', left: 0, opacity: ease(f, coinA + 14, 8) }}>3 parts − 10</span>
          </span>
        </Label>
        <Parts y={YB} n={3} color={BEA} start={beaIn} />
        <Gap10 x={px(3)} y={YB} op={ease(f, coinA + 6, 8)} />
        {/* twice Bea: her bar twice, each copy missing $10 */}
        <Label y={YD} name="2 × Bea" color={BEA_D} op={ease(f, dbl - 6, 8)}>
          <span style={{ opacity: ease(f, dbl + 24, 8) }}>= 6 parts − 20</span>
        </Label>
        <Parts y={YD} n={3} color={BEA} start={dbl} />
        <Gap10 x={px(3)} y={YD} op={ease(f, dbl + 8, 8)} />
        <Parts y={YD2} n={3} color={BEA} start={dbl + 15} />
        <Gap10 x={px(3)} y={YD2} op={ease(f, dbl + 23, 8)} />
        {/* the balance */}
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 330, display: 'flex', justifyContent: 'center', ...fadeUp(f, eqA, 10), opacity: ease(f, eqA, 10) * fadeTo(f, one, 0, 6), scale: String(punch) }}>
          <Tex
            tex={
              f >= cancel
                ? `{\\color{#8a91a0}\\cancel{5\\text{ parts}}}+10={\\color{#8a91a0}\\cancel{5\\text{ parts}}}+{\\color{${BEA_D}}1\\text{ part}}-20`
                : `{\\color{${ALI_D}}5\\text{ parts}+10}={\\color{${BEA_D}}6\\text{ parts}-20}`
            }
            size={50}
          />
        </div>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 315, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, one) * punch})`, background: C.card, border: `6px solid ${C.primary}`, borderRadius: 24, padding: '4px 36px' }}>
            <Tex tex={`1\\text{ part} = \\$30`} size={70} />
          </div>
        </div>
      </div>
    </>
  );
};

/** 8 parts of $30 (the $240 chip pops on the spoken number), the trap, then the CTA pill under the same bars. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const hit = t(0.46);
  const chime_ = t(0.97);
  const lab = t(0.02);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 2, 4, 6].map((i) => <Sfx key={i} at={lab + i * 3} src={SFX.click} volume={0.22} />)}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime_} durationInFrames={60} layout="none">
        <Audio src={chime} volume={0.3} />
      </Sequence>

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '8px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="\$240" size={100} color="#fff" />
          <span style={{ fontSize: 68, fontWeight: 900 }}>together</span>
        </div>
      </div>
      <Label y={YA} name="Ali" color={ALI_D}>
        <span style={{ opacity: ease(f, at(scene, 1, 0.05), 8), color: C.red }}>$150 alone ✗</span>
      </Label>
      <Parts y={YA} n={5} color={ALI} start={before} label={(i) => (f >= lab + i * 3 ? '$30' : '?')} />
      <Label y={YB} name="Bea" color={BEA_D} />
      <Parts y={YB} n={3} color={BEA} start={before} label={(i) => (f >= lab + (5 + i) * 3 ? '$30' : '?')} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 975, display: 'flex', justifyContent: 'center', ...fadeUp(f, hit, 10) }}>
        <Tex tex={`8 \\times \\$30 = {\\color{${C.green}}\\$240}`} size={72} />
      </div>
      <CtaPill start={at(scene, 2)} y={1120} />
      <Confetti x={540} y={350} start={chime_} seed={11} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, bars: Bars, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, SLUG } from '../Composition';

export { SLUG };

// AMC 10 #24: trap 25 (treating 7 as ending in 1), aha = the 7×3 last-digit grid of 3^a·13^c,
// five 1-boxes get two powers of 7 each, every other box exactly one: 5·2 + 16 = 26.

const GA = C.primary; // a / powers of 3
const GB = C.violet; // b / powers of 7
const GC = C.amber; // c / powers of 13
const ONE = C.green;
const tc = (col: string, tex: string) => `\\textcolor{${col}}{${tex}}`;
const N_COL = `${tc(GA, '3^6')}\\cdot ${tc(GB, '7^4')}\\cdot ${tc(GC, '13^2')}`;
const CHOICES = ['24', '25', '26', '27', '28'];
const SEVENS = [1, 7, 9, 3, 1];
const dig = (a: number, c: number) => (3 ** a * 13 ** c) % 10;

const CW = 110;
const GX = 180;
const GY = 590;
const before = () => -100;
const never = () => 99999;

/** The 7 × 3 grid: last digit of 3^a·13^c, a across (green), c down (amber). Same place in every scene. */
const Grid: React.FC<{ show?: (a: number, c: number) => number; lit?: (a: number, c: number) => number; ring?: (a: number, c: number) => string | undefined; tint?: (a: number, c: number) => boolean; headStart?: number }> = ({
  show = before, lit = never, ring = () => undefined, tint = () => false, headStart = -100,
}) => {
  const f = useCurrentFrame();
  const h = ease(f, headStart, 10);
  return (
    <>
      <div style={{ position: 'absolute', left: GX - 92, top: GY - 84, opacity: h }}>
        <Tex tex={`${tc(GC, 'c')}\\backslash ${tc(GA, 'a')}`} size={40} />
      </div>
      {range(7).map((a) => (
        <div key={`h${a}`} style={{ position: 'absolute', left: GX + a * CW, width: CW, top: GY - 64, textAlign: 'center', fontSize: 50, fontWeight: 900, color: GA, opacity: h }}>{a}</div>
      ))}
      {range(3).map((c) => (
        <div key={`r${c}`} style={{ position: 'absolute', left: GX - 62, width: 50, top: GY + c * CW + 24, textAlign: 'center', fontSize: 50, fontWeight: 900, color: GC, opacity: h }}>{c}</div>
      ))}
      {range(3).flatMap((c) =>
        range(7).map((a) => {
          const d = dig(a, c);
          const p = ease(f, show(a, c), 6);
          const g = d === 1 && f >= lit(a, c);
          const t = !g && tint(a, c);
          const r = ring(a, c);
          return (
            <div key={`${a}-${c}`} style={{ position: 'absolute', left: GX + a * CW + 5, top: GY + c * CW + 5, width: CW - 10, height: CW - 10, borderRadius: 18, boxSizing: 'border-box', background: g ? ONE : t ? 'rgba(123,97,255,0.18)' : C.card, border: `3px solid ${g ? ONE : C.line}`, boxShadow: r ? `0 0 0 8px ${r}` : '0 3px 10px rgba(30,40,80,0.08)', opacity: h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 900, color: g ? '#fff' : C.ink }}>
              <span style={{ opacity: p, transform: `scale(${0.7 + 0.3 * p})` }}>{d}</span>
            </div>
          );
        }),
      )}
    </>
  );
};

/** Opens on the grid (the same grid the video ends on), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.88);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #24</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>25</span>?
      </Text>
      <PushIn frames={scene.frames} origin="565px 755px">
        <Grid lit={before} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 680, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

/** A divisor with only its last digit bold. */
const Num: React.FC<{ v: number }> = ({ v }) => {
  const s = String(v);
  return (
    <span style={{ fontSize: 56, fontWeight: 700, color: C.muted }}>
      {s.slice(0, -1)}
      <span style={{ color: ONE, fontWeight: 900, fontSize: 66 }}>{s.slice(-1)}</span>
    </span>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; samples?: (i: number) => number }> = ({ start, pulse = () => 1, samples = before }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', textAlign: 'center' }}>
        <div>How many positive divisors of</div>
        <div style={{ margin: '12px 0' }}><Tex tex={N_COL} size={84} /></div>
        <div>end in the digit <b style={{ color: ONE }}>1</b>?</div>
      </div>
      {[21, 63, 91, 169, 2401].map((v, i) => (
        <div key={v} style={{ position: 'absolute', left: 60 + i * 196, top: 720, width: 180, height: 100, borderRadius: 20, background: C.card, border: `3px solid ${C.line}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, samples(i), 8) }}>
          <Num v={v} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 60, top: 960, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} samples={(i) => at(scene, 1, 0.1 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const ONES: [number, number][] = [[0, 0], [4, 0], [3, 1], [2, 2], [6, 2]];
const SX = 200;
const SW = 128;
const SY = 1040;

/** The aha: build the grid, light the five 1s (zoomed), bring in the 7-cycle, then pair boxes with powers of 7. */
const GridScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const fill = (a: number, c: number) => at(scene, 0, 0.42) + (c * 7 + a) * 3.3;
  const litAt = (i: number) => l1 + 8 + i * 7;
  const lit = (a: number, c: number) => litAt(ONES.findIndex(([x, y]) => x === a && y === c));
  const nLit = ONES.filter((_, i) => f >= litAt(i)).length;
  const chipAt = (i: number) => l1 + 80 + i * 10;
  const zoom = 1 + 0.25 * ease(f, at(scene, 0, 0.9), 12) - 0.25 * ease(f, l1 + 46, 12);
  // L2 pairing steps: [box (a, c), partner chips, readout, frame]
  const steps: { box: [number, number]; chips: number[]; tex: string; t: number }[] = [
    { box: [0, 0], chips: [0, 4], tex: `\\mathbf{1}\\to ${tc(GB, 'b=0,\\,4')}\\quad\\times2`, t: l2 + 6 },
    { box: [1, 0], chips: [1], tex: `3\\times${tc(GB, '7')}=21\\quad\\times1`, t: l2 + 51 },
    { box: [2, 0], chips: [2], tex: `9\\times${tc(GB, '9')}=81\\quad\\times1`, t: l2 + 70 },
    { box: [3, 0], chips: [3], tex: `7\\times${tc(GB, '3')}=21\\quad\\times1`, t: l2 + 89 },
  ];
  const allT = l2 + 108;
  const step = f >= allT ? -1 : steps.reduce((k, s, i) => (f >= s.t ? i : k), -2);
  const cur = step >= 0 ? steps[step] : undefined;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {range(7).map((i) => <Sfx key={`f${i}`} at={fill((3 * i) % 7, Math.floor((3 * i) / 7))} src={SFX.click} volume={0.22} />)}
      <Sfx at={at(scene, 0, 0.9)} src={SFX.whoosh} volume={0.25} />
      {ONES.map((_, i) => <Sfx key={`o${i}`} at={litAt(i)} src={SFX.click} volume={0.3} />)}
      <Sfx at={l1 + 46} src={SFX.whoosh} volume={0.25} />
      {[0, 2, 4].map((i) => <Sfx key={`c${i}`} at={chipAt(i)} src={SFX.click} volume={0.22} />)}
      {steps.map((s, i) => <Sfx key={`s${i}`} at={s.t} src={SFX.click} volume={0.3} />)}
      <Sfx at={allT} src={SFX.whoosh} volume={0.25} />

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center' }}>
        <div style={{ position: 'absolute', width: 1080, fontSize: 84, fontWeight: 900, opacity: fadeTo(f, at(scene, 0, 0.4)) }}>
          Only last digits!
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, at(scene, 0, 0.42), 8) }}>
          <Tex tex={`\\text{last digit of }${tc(GA, '3^a')}\\cdot${tc(GC, '13^c')}`} size={64} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 405, display: 'flex', justifyContent: 'center', opacity: ease(f, litAt(0), 6) * fadeTo(f, l2 + 2, 0, 8) }}>
        <div style={{ background: ONE, color: '#fff', borderRadius: 24, padding: '4px 36px', fontSize: 60, fontWeight: 900, transform: `scale(${pop(f, litAt(Math.max(0, nLit - 1)))})` }}>
          {nLit} {nLit === 1 ? 'box ends' : 'boxes end'} in 1
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 405, display: 'flex', justifyContent: 'center', opacity: ease(f, allT, 8) }}>
        <div style={{ background: GB, color: '#fff', borderRadius: 24, padding: '4px 36px', fontSize: 60, fontWeight: 900 }}>every other box: ×1</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '565px 755px' }}>
        <Grid
          headStart={0}
          show={fill}
          lit={lit}
          ring={(a, c) => (cur && cur.box[0] === a && cur.box[1] === c ? C.ink : undefined)}
          tint={(a, c) => f >= allT && dig(a, c) !== 1}
        />
      </div>

      <div style={{ position: 'absolute', left: 60, width: 130, top: SY + 18, textAlign: 'center', opacity: ease(f, chipAt(0) - 8, 8) }}>
        <Tex tex={tc(GB, '7^b')} size={64} />
      </div>
      {SEVENS.map((v, i) => {
        const on = (cur?.chips.includes(i) ?? false) || (f >= allT && i >= 1 && i <= 3);
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: SX + i * (SW + 14), width: SW, top: SY - 58, textAlign: 'center', fontSize: 40, fontWeight: 900, color: GB, opacity: ease(f, chipAt(i), 6) }}>b={i}</div>
            <div style={{ position: 'absolute', left: SX + i * (SW + 14), top: SY, width: SW, height: 112, borderRadius: 20, background: C.card, border: `4px solid ${GB}`, boxSizing: 'border-box', boxShadow: on ? `0 0 0 8px ${cur ? ONE : GB}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: GB, ...fadeUp(f, chipAt(i), 8) }}>
              {v}
            </div>
          </div>
        );
      })}
      {steps.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: 60, width: 860, top: 1200, display: 'flex', justifyContent: 'center', opacity: step === i ? ease(f, s.t, 5) : 0 }}>
          <Tex tex={s.tex} size={64} />
        </div>
      ))}
    </>
  );
};

/** The answer, the trap, then the CTA pill under the same grid (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.71);
  const chime = at(scene, 0, 0.95);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: f >= hit ? 1 : 0 }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: ONE, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="26" size={110} color="#fff" />
          <span style={{ fontSize: 66, fontWeight: 900 }}>divisors</span>
        </div>
      </div>
      <Grid lit={before} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 975, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <Tex tex={`${tc(ONE, '5\\times2')}+${tc(GB, '16')}=`} size={76} />
        <span style={{ opacity: f >= hit ? 1 : 0, display: 'inline-block', transform: `scale(${pop(f, hit)})` }}>
          <Tex tex={tc(ONE, '26')} size={76} />
        </span>
      </div>
      <Text x={490} y={1080} w={860} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        25: 7 doesn't end in 1!
      </Text>
      <CtaPill start={at(scene, 2)} y={1175} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, grid: GridScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, IS_RED, SLUG, Tile, TwoDots, v2 } from '../Composition';

export { SLUG };

// Trap-first AMC 10 hook ("Think it's 50?" = every even loses), the 0…16 tiles in two rows of 9, the aha
// (red ⇔ odd number of 2s, with a zoom on 8 vs 4), then 25 + 6 + 2 = 33. The last frame shows the same tile grid
// at the same place as frame 0, so the loop cuts cleanly.

const TS = 96; // tile size
const tx = (n: number) => 108 + (n % 9) * 108;
const ty = (n: number) => (n < 9 ? 620 : 820);
const top = (n: number) => ty(n) - TS / 2;
const bot = (n: number) => ty(n) + TS / 2;
const N = range(17);
const RED_N = [2, 6, 8, 10, 14];
const EVEN_GREEN = [4, 12, 16];
const TWO = C.violet;

const never = Infinity;

/** The 0…16 grid. `red`/`green` give the frame each tile colours (default: never), `ring`/`glow` per tile. */
const Grid: React.FC<{ red?: (n: number) => number; green?: (n: number) => number; ring?: (n: number) => string | undefined; glow?: (n: number) => boolean; dots?: (n: number) => number }> = ({
  red = () => never, green = () => never, ring = () => undefined, glow = () => false, dots,
}) => (
  <>
    {N.map((n) => (
      <Tile key={n} n={n} cx={tx(n)} cy={ty(n)} size={TS} show={-100} red={red(n)} green={green(n)} ring={ring(n)} glow={glow(n)} />
    ))}
    {dots && N.map((n) => <TwoDots key={`d${n}`} count={n === 0 ? 0 : v2(n)} cx={tx(n)} y={bot(n) + 22} start={dots(n)} />)}
  </>
);

const final = { red: (n: number) => (IS_RED(n) ? -100 : never), green: (n: number) => (IS_RED(n) ? never : -100) };

/** Opens on the grey grid (the same grid the video ends on), rings every even number for the trap, then stamps it. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fifty = at(scene, 0, 0.62);
  const nope = at(scene, 0, 0.8);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #22</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>50</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 720px">
        <Grid ring={(n) => (n > 0 && n % 2 === 0 && f >= fifty + (n / 2) * 1.5 ? C.red : undefined)} />
        <Text x={540} y={930} w={900} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, fifty)}>
          every even loses?
        </Text>
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

const QuestionBody: React.FC<{ start: (i: number) => number; moves: number; pulse?: (i: number) => number }> = ({ start, moves, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Take away <b style={{ color: C.primary }}>1</b> or <b style={{ color: C.primary }}>halve</b> (round down). Reach <b style={{ color: C.red }}>0</b> to win. For how many <b>n</b> from 1 to 100 does <b style={{ color: C.violet }}>player 2</b> always win?
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', gap: 40, ...fadeUp(f, moves) }}>
        {[String.raw`k\to k-1`, String.raw`k\to \lfloor k/2\rfloor`].map((t) => (
          <div key={t} style={{ background: C.card, border: `5px solid ${C.primary}`, borderRadius: 26, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
            <Tex tex={t} size={60} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 840, display: 'flex', justifyContent: 'center', ...fadeUp(f, moves + 10) }}>
        <Tex tex={String.raw`13\to12 \;\text{ or }\; 13\to6`} size={56} color={C.muted} />
      </div>
      <div style={{ position: 'absolute', left: 60, top: 980, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody moves={at(scene, 0, 0.1)} start={(i) => at(scene, 1, 0.5 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody moves={-100} start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: colour 0…16 (reds on their spoken words), the even greens, the dots, then red ⇔ odd number of 2s. */
const Twos: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L0 = at(scene, 0);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  // reds named on "two, six, eight, ten, fourteen"
  const said: Record<number, number> = { 2: at(scene, 0, 0.48), 6: at(scene, 0, 0.575), 8: at(scene, 0, 0.675), 10: at(scene, 0, 0.75), 14: at(scene, 0, 0.84) };
  const redAt = (n: number) => (n === 0 ? L0 + 6 : n === 2 ? L0 + 42 : said[n] ?? never);
  const greens = N.filter((n) => !IS_RED(n));
  const greenAt = (n: number) => (IS_RED(n) ? never : n === 1 ? L0 + 22 : L0 + 50 + greens.indexOf(n) * 1.6);
  const dotAt = (n: number) => at(scene, 1, 0.66) + n * 2.5;
  const oddOn = at(scene, 2, 0.22);
  const zIn = at(scene, 2, 0.45);
  const zOut = at(scene, 2, 0.9);
  const zoom = 1 + 0.3 * ease(f, zIn, 12) - 0.3 * ease(f, zOut, 10);
  const eight = at(scene, 2, 0.5);
  const four = at(scene, 2, 0.74);
  const h0 = fadeTo(f, l1, 0, 8);
  const h1 = ease(f, l1 + 7, 8) * fadeTo(f, l2, 0, 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={redAt(0)} src={SFX.click} volume={0.25} />
      <Sfx at={greenAt(1)} src={SFX.click} volume={0.25} />
      <Sfx at={redAt(2)} src={SFX.click} volume={0.25} />
      {[3, 9, 15].map((n) => <Sfx key={n} at={greenAt(n)} src={SFX.click} volume={0.22} />)}
      {RED_N.slice(1).map((n) => <Sfx key={`r${n}`} at={said[n]} src={SFX.click} volume={0.28} />)}
      {[1, 6, 11, 16].map((n) => <Sfx key={`d${n}`} at={dotAt(n)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.2} />

      {/* headline: what red means → even AND green? → the rule */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 66, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, ...fadeUp(f, 2), opacity: h0 * ease(f, 2, 14) }}>
          <span style={{ color: C.red }}>red</span> = player to move <span style={{ color: C.red }}>loses</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: h1 }}>
          even, but <span style={{ color: C.green }}>green</span>?
        </div>
      </div>
      <div
        style={{
          position: 'absolute', left: 90, width: 900, top: 280, height: 150, boxSizing: 'border-box', background: C.card, borderRadius: 36, border: `6px solid ${TWO}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 68, fontWeight: 900, boxShadow: '0 12px 40px rgba(123,97,255,0.22)',
          opacity: ease(f, oddOn, 8), transform: `scale(${0.9 + 0.1 * pop(f, oddOn)})`,
        }}
      >
        <span style={{ color: C.red }}>red</span>
        <Tex tex={String.raw`\Leftrightarrow`} size={70} />
        <span><span style={{ color: TWO }}>odd</span> number of <span style={{ color: TWO }}>2s</span></span>
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${tx(8)}px ${ty(8) + 30}px` }}>
        <Grid
          red={redAt}
          green={greenAt}
          ring={(n) => (EVEN_GREEN.includes(n) && f >= at(scene, 1, 0.08 + EVEN_GREEN.indexOf(n) * 0.11) && f < l2 ? TWO : undefined)}
          glow={(n) => (said[n] !== undefined && f >= said[n] && f < said[n] + 14) || (RED_N.includes(n) && f >= oddOn + 6 && f < zOut)}
          dots={dotAt}
        />
        <Arc x1={tx(1)} x2={tx(0)} edge={top(0)} dir="up" peak={44} start={L0 + 10} end={L0 + 60} label="−1" />
        <Arc x1={tx(2)} x2={tx(1)} edge={top(0)} dir="up" peak={44} start={L0 + 26} end={L0 + 62} label="−1" />
        <Arc x1={tx(2)} x2={tx(1)} edge={bot(0)} dir="down" peak={44} start={L0 + 32} end={L0 + 62} label="½" />
      </div>

      {/* readouts under the grid (x 60…920) */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 970, display: 'flex', justifyContent: 'center', opacity: ease(f, said[2], 6) * fadeTo(f, l2, 0, 8) }}>
        <div style={{ background: C.red, color: '#fff', borderRadius: 24, padding: '8px 36px', fontSize: 62, fontWeight: 900, whiteSpace: 'nowrap' }}>
          lose:{' '}
          {RED_N.map((n, i) => (
            <span key={n} style={{ opacity: f >= said[n] ? 1 : 0 }}>{i ? ', ' : ''}{n}</span>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 970, display: 'flex', justifyContent: 'center', gap: 36, opacity: fadeTo(f, zOut + 4, 0, 8) }}>
        <div style={fadeUp(f, eight)}>
          <Tex tex={String.raw`\color{#ef4343}8\color{#333333}=\color{#7b61ff}2\times2\times2`} size={66} />
        </div>
        <div style={fadeUp(f, four)}>
          <Tex tex={String.raw`\color{#21c45d}4\color{#333333}=\color{#7b61ff}2\times2`} size={66} />
        </div>
      </div>
    </>
  );
};

/** The count by groups, the answer on its word, the trap, then the CTA pill over the same grid. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const p25 = at(scene, 0, 0.22);
  const p6 = at(scene, 0, 0.46);
  const p2 = at(scene, 0, 0.7);
  const hit = at(scene, 0, 0.845);
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1, 0.05);
  const part = (start: number, tex: string, label: string, color: string = C.ink) => (
    <div style={{ ...fadeUp(f, start, 8), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Tex tex={tex} size={76} color={color} />
      <span style={{ fontSize: 40, fontWeight: 800, color: TWO, height: 50 }}>{label}</span>
    </div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 70, fontWeight: 900 }}>C ·</span>
          <Tex tex="33" size={116} color="#fff" />
        </div>
      </div>
      <Text x={540} y={472} w={1000} size={54} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        50 = every even ✗
      </Text>
      <Grid
        {...final}
        ring={(n) => (EVEN_GREEN.includes(n) && f >= trap ? TWO : undefined)}
        glow={(n) => (v2(n) === 1 && f >= 4 && f < p6 - 4) || (n === 8 && f >= p6 && f < p2)}
        dots={() => -100}
      />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 950, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 18 }}>
        {part(p25, '25', '1 two')}
        {part(p6, '+\\,6', '3 twos')}
        {part(p2, '+\\,2', '5 twos')}
        {part(hit, '=\\,33', '', C.green)}
      </div>
      <CtaPill start={at(scene, 2)} y={1160} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[p25, p6, p2].map((s) => <Sfx key={s} at={s} src={SFX.click} volume={0.28} />)}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={22} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, twos: Twos, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

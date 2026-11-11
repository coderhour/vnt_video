import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Grid, Mini, SLUG, Strike, type Band } from '../Composition';

export { SLUG };

// AMC 10 Challenge #18: trap 384 (6 × 64 counts overlaps twice), aha = count the losers (7³ = 343, minus 78 with a
// full column = 265), reveal 512 − 265 = 247. Frame 0 and the last frame show the same cross pattern (row 1 + column 1).

/** The hook / reveal figure: row 1 and column 1 full, nothing else full (so it sits in exactly two of the six groups). */
const CROSS = ['111', '100', '100'];
const G = { x: 285, y: 560, p: 170 };
const crossBands = (color?: string): Band[] => [{ k: 'r', i: 0, color }, { k: 'c', i: 0, color }];

/** Opacity 0 → 1 at `from`, back to 0 at `to`. */
const vis = (f: number, from: number, to?: number, dur = 8) => ease(f, from, dur) * (to === undefined ? 1 : fadeTo(f, to, 0, dur));

const before = -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0) + 100;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #18</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>384</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 815px">
        <Grid x={G.x} y={G.y} p={G.p} cells={CROSS} bands={crossBands()} />
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

const QG = { x: 390, y: 670, p: 100 };

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; cells?: string[]; bands?: Band[] }> = ({ start, pulse = () => 1, cells = ['000', '000', '000'], bands = [] }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>9 lights</b> in a 3 × 3 grid, each <b style={{ color: C.amber }}>on</b> or off. How many patterns have <b style={{ color: C.violet }}>at least one full row or column</b> all on?
      </div>
      <Grid x={QG.x} y={QG.y} p={QG.p} cells={cells} bands={bands} />
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
  const rowOn = at(scene, 1, 0.3);
  const colOn = at(scene, 1, 0.62);
  const off = at(scene, 1, 0.95);
  let cells = ['000', '000', '000'];
  let bands: Band[] = [];
  if (f >= rowOn && f < colOn) { cells = ['111', '000', '000']; bands = [{ k: 'r', i: 0, op: ease(f, rowOn, 10) }]; }
  if (f >= colOn && f < off) { cells = ['100', '100', '100']; bands = [{ k: 'c', i: 0, op: ease(f, colOn, 10) }]; }
  return (
    <>
      <QuestionBody start={(i) => at(scene, 1, 0.4 + i * 0.08)} cells={cells} bands={bands} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={rowOn} src={SFX.click} volume={0.25} />
      <Sfx at={colOn} src={SFX.click} volume={0.25} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const LG = { x: 315, y: 520, p: 150 };
const STRINGS = ['000', '001', '010', '011', '100', '101', '110', '111'];
/** Top-left of the k-th one-row mini in the 2 × 4 strip under the grid. */
const strip = (k: number) => ({ x: 114 + (k % 4) * 200, y: 1010 + Math.floor(k / 4) * 112 });

/** The aha: count the losers. Each row 7 safe choices → 343, minus the 78 with a full column → 265 losers. */
const Losers: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const strike = l1 + 30;
  const sevens = l1 + 52;
  const stripOut = l1 + 88;
  const cube = l1 + 98;
  const ex1 = l2 + 4;
  const ex2 = l2 + 40;
  const loser = l2 + 84;
  // zoom onto the crossed-out all-on row, then back out for the 7s
  const zoom = 1 + 0.3 * ease(f, strike - 6, 10) - 0.3 * ease(f, sevens - 6, 10);
  // L0: three random-looking losers flicker by; L1: all off; L2: two full-column examples, then a loser
  let cells = ['110', '001', '100'];
  let bands: Band[] = [];
  if (f >= 28) cells = ['101', '010', '101'];
  if (f >= 54) cells = ['011', '101', '110'];
  if (f >= l1) cells = ['000', '000', '000'];
  if (f >= l1 && f < stripOut) bands = [{ k: 'r', i: 0, color: C.ink, op: ease(f, l1, 10) }];
  if (f >= ex1) { cells = ['100', '110', '101']; bands = [{ k: 'c', i: 0, op: ease(f, ex1, 10) }]; }
  if (f >= ex2) { cells = ['011', '101', '001']; bands = [{ k: 'c', i: 2, op: ease(f, ex2, 10) }]; }
  if (f >= loser) { cells = ['110', '001', '100']; bands = []; }
  const s111 = strip(7);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[28, 54, l1 + 10, l1 + 22, strike, ex1, ex2, loser].map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.25} />)}
      <Sfx at={strike - 6} src={SFX.whoosh} volume={0.25} />
      <Sfx at={cube} src={SFX.click} volume={0.3} />
      <Text x={540} y={290} w={1000} size={76} weight={900} align="center">
        <span style={{ color: C.muted }}>Losers:</span> no full row <span style={{ color: C.muted }}>or</span> column
      </Text>
      <Grid x={LG.x} y={LG.y} p={LG.p} cells={cells} bands={bands} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${s111.x + 80}px ${s111.y + 25}px` }}>
        {/* one row's 8 on-off strings; the all-on one is out */}
        <div style={{ opacity: vis(f, l1 + 6, stripOut) }}>
          {STRINGS.map((s, k) => (
            <div key={s} style={{ opacity: ease(f, l1 + 6 + k * 2.5, 6) }}>
              <Mini x={strip(k).x} y={strip(k).y} p={50} cells={[s]} ink={f >= strike + 8 && s !== '111'} />
            </div>
          ))}
          <div style={{ opacity: ease(f, strike, 4) }}>
            <Strike x={s111.x - 10} y={s111.y - 10} w={170} h={70} />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <Text key={i} x={LG.x + 3 * LG.p + 30} y={LG.y + i * LG.p + 30} w={120} size={80} weight={900} color={C.ink} style={{ opacity: ease(f, sevens + i * 6, 6) * fadeTo(f, ex1, 0, 8) }}>
            7
          </Text>
        ))}
      </div>
      {/* readout: 7³ = 343 → 343 − 78 → = 265 losers */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1030, display: 'flex', justifyContent: 'center', ...fadeUp(f, cube), opacity: vis(f, cube, l2 + 14) }}>
        <Tex tex="7^3=343" size={90} />
      </div>
      <Text x={LG.x + 3 * LG.p + 20} y={LG.y + 40} w={240} size={56} weight={900} color={C.violet} style={{ opacity: vis(f, ex1 + 6, loser) }}>
        full column!
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1030, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, ...fadeUp(f, l2 + 16), opacity: ease(f, l2 + 16, 8) }}>
        <Tex tex={f >= loser - 2 ? '343-78=265' : '343-78'} size={90} />
        <span style={{ fontSize: 60, fontWeight: 900, color: C.muted, opacity: ease(f, loser, 8) }}>losers</span>
      </div>
      <Text x={LG.x + 3 * LG.p + 20} y={LG.y + 40} w={240} size={56} weight={900} color={C.muted} style={{ opacity: ease(f, loser + 4, 8) }}>
        a loser
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0) + 87;
  const chime = at(scene, 0) + 121;
  const trap = at(scene, 1);
  const twice = at(scene, 1) + 78;
  const red = f >= twice && f < at(scene, 2);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 320, display: 'flex', justifyContent: 'center', ...fadeUp(f, 6), opacity: vis(f, 6, hit - 3, 4) }}>
        <Tex tex="512-265=" size={100} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: f >= hit ? 1 : 0 }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="247" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>patterns</span>
        </div>
      </div>
      <Grid x={G.x} y={G.y} p={G.p} cells={CROSS} bands={crossBands(red ? C.red : undefined)} />
      {/* the double count: this one is in row 1's group AND column 1's group */}
      {(['row 1', 'column 1'] as const).map((lab, i) => (
        <Text key={lab} x={i === 0 ? G.x + 3 * G.p + 20 : G.x - 20} y={i === 0 ? G.y + 50 : G.y - 72} w={300} size={52} weight={900} color={C.red} style={{ opacity: vis(f, twice + i * 8, at(scene, 2)) }}>
          {lab}
        </Text>
      ))}
      <Text x={540} y={1090} w={960} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, trap + 4)}>
        384 counts it twice
      </Text>
      <CtaPill start={at(scene, 2)} y={1180} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, losers: Losers, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

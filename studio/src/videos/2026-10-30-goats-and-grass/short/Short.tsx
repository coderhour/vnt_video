import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, GROW, Goat, HELP, SLUG, START } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: goat-day bars (frame 0 = last frame), the aha splits each bar into the starting pile + growth,
// then 5 helper goats eat the growth and 20 eat the pile. Answer 5 days (B), trap 4 days (100 / 25 forgets the growth).

const EATEN = C.amber; // a total eaten, before it is split
const U = 4.3; // px per goat-day: 200 goat-days span x 60…920
const BX = 60;
const BH = 110;
const Y1 = 610; // 10 goats × 20 days
const Y2 = 820; // 15 goats × 10 days
const L1 = 540;
const L2 = 750;
const box = (x: number, y: number, w: number): React.CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: BH, borderRadius: 16 });

/** A total as `n` day-chunks of `per` goat-days each; `shown` chunks are drawn. */
const DayBar: React.FC<{ y: number; n: number; per: number; shown: number; label?: string; opacity?: number }> = ({ y, n, per, shown, label, opacity = 1 }) => (
  <div style={{ opacity }}>
    {range(Math.min(n, Math.max(0, Math.floor(shown)))).map((i) => (
      <div key={i} style={{ ...box(BX + i * per * U + 2, y, per * U - 4), borderRadius: 10, background: EATEN }} />
    ))}
    {label && shown >= n && (
      <div style={{ ...box(BX, y, n * per * U), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 64, fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>{label}</div>
    )}
  </div>
);

/** A total split into the starting pile (green, `start` 0→1) and `days` growth chunks of 5 (blue) after it. */
const SplitBar: React.FC<{ y: number; maxDays: number; days: number; start: number; growLabel: string; opacity?: number }> = ({ y, maxDays, days, start, growLabel, opacity = 1 }) => {
  const d = Math.min(maxDays, Math.max(0, Math.floor(days)));
  return (
    <div style={{ opacity }}>
      <div style={{ ...box(BX, y, 100 * U - 4), border: `5px dashed ${START}`, boxSizing: 'border-box', opacity: 1 - start }} />
      <div style={{ ...box(BX, y, 100 * U - 4), background: START, opacity: start, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 58, fontWeight: 900 }}>start 100</div>
      {range(d).map((i) => (
        <div key={i} style={{ ...box(BX + (100 + i * 5) * U + 1, y, 5 * U - 2), borderRadius: 6, background: GROW }} />
      ))}
      {d >= maxDays && (
        <div style={{ ...box(BX + 100 * U, y, maxDays * 5 * U), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 58, fontWeight: 900, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{growLabel}</div>
      )}
    </div>
  );
};

const BarLabel: React.FC<{ y: number; goats: number; days: number; opacity?: number }> = ({ y, goats, days, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: BX, top: y, fontSize: 54, fontWeight: 900, color: C.ink, opacity, whiteSpace: 'nowrap' }}>
    <span style={{ color: EATEN }}>{goats} goats</span> × {days} days
  </div>
);

/** The finished picture: both totals split into start + growth (ends the reveal, matches the hook's layout). */
const SplitFigure: React.FC = () => (
  <>
    <BarLabel y={L1} goats={10} days={20} />
    <BarLabel y={L2} goats={15} days={10} />
    <SplitBar y={Y1} maxDays={20} days={20} start={1} growLabel="+100" />
    <SplitBar y={Y2} maxDays={10} days={10} start={1} growLabel="+50" />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #8</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>4 days</span>?
      </Text>
      <PushIn frames={scene.frames} origin="490px 770px">
        <BarLabel y={L1} goats={10} days={20} />
        <BarLabel y={L2} goats={15} days={10} />
        <DayBar y={Y1} n={20} per={10} shown={20} />
        <DayBar y={Y2} n={10} per={15} shown={10} />
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

const Fact: React.FC<{ y: number; goats: number; days: number }> = ({ y, goats, days }) => (
  <div style={{ position: 'absolute', left: 90, top: y, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 62, fontWeight: 900, background: C.card, borderRadius: 26, padding: '12px 10px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
    <span style={{ color: EATEN }}>{goats} goats</span>
    <span style={{ color: C.muted }}>→</span>
    <span>{days} days</span>
  </div>
);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        The grass <b style={{ color: GROW }}>grows steadily</b>. 10 goats eat it all in 20 days, 15 goats in 10 days. How many days for <b style={{ color: C.violet }}>25 goats</b>?
      </div>
      <Fact y={690} goats={10} days={20} />
      <Fact y={820} goats={15} days={10} />
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.4 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** One readout chip under the bars; shows the latest step whose frame has passed. */
const Readout: React.FC<{ steps: [number, string][]; hide: number }> = ({ steps, hide }) => {
  const f = useCurrentFrame();
  const i = steps.reduce((k, [s], j) => (f >= s ? j : k), -1);
  if (i < 0) return null;
  const [s, tex] = steps[i];
  return (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 985, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, hide, 0, 8) }}>
      <div style={{ transform: `scale(${pop(f, s)})`, background: C.card, borderRadius: 26, padding: '14px 40px', boxShadow: '0 8px 24px rgba(30,40,80,0.10)' }}>
        <Tex tex={tex} size={70} />
      </div>
    </div>
  );
};

const Growth: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  // line 0: the two totals tick in, a day at a time
  const b1 = at(scene, 0, 0.05);
  const b2 = at(scene, 0, 0.6);
  const day1 = (f - b1) / 2; // 20 chunks, one every 2 frames
  const day2 = (f - b2) / 3; // 10 chunks, one every 3 frames
  // line 1: zoom on the extra 50; line 2: split into start + growth
  const zIn = l1 + 3;
  const zoom = 1 + 0.4 * ease(f, zIn, 12) - 0.4 * ease(f, l2, 10);
  const split = ease(f, l2, 8);
  const g0 = l2 + 8;
  const gDays = (f - g0) / 2;
  const startOn = ease(f, at(scene, 2, 0.6), 8);
  // line 3: the bars give way to the two teams of goats
  const teams = ease(f, l3, 8);
  const helpersAt = (i: number) => l3 + 6 + i * 4;
  const pileAt = (i: number) => at(scene, 3, 0.45) + i * 1.2;
  const BLUE = '#3c83f6';
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {range(7).map((i) => <Sfx key={`a${i}`} at={b1 + 3 * i * 2} src={SFX.click} volume={0.22} />)}
      {range(4).map((i) => <Sfx key={`b${i}`} at={b2 + 3 * i * 3} src={SFX.click} volume={0.22} />)}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {range(7).map((i) => <Sfx key={`g${i}`} at={g0 + 3 * i * 2} src={SFX.click} volume={0.25} />)}
      {range(5).map((i) => <Sfx key={`h${i}`} at={helpersAt(i)} src={SFX.click} volume={0.28} />)}
      {range(5).map((i) => <Sfx key={`p${i}`} at={pileAt(4 * i)} src={SFX.click} volume={0.25} />)}

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center', fontSize: 80, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l2) }}>
          Count in <span style={{ color: EATEN }}>goat-days</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 8) * fadeTo(f, l3) }}>
          The <span style={{ color: START }}>starting pile</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l3, 8) }}>
          <span style={{ color: HELP }}>Helpers</span> + <span style={{ color: START }}>pile-eaters</span>
        </div>
      </div>
      <Text x={540} y={410} w={1000} size={46} weight={800} color={C.muted} align="center" style={{ opacity: ease(f, 4, 10) * fadeTo(f, l1) }}>
        1 goat-day = what 1 goat eats in 1 day
      </Text>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '812px 875px' }}>
        <BarLabel y={L1} goats={10} days={20} opacity={ease(f, 2, 8)} />
        <BarLabel y={L2} goats={15} days={10} opacity={ease(f, b2 - 8, 8) * fadeTo(f, l3)} />
        <DayBar y={Y1} n={20} per={10} shown={day1} label="200" opacity={1 - split} />
        <DayBar y={Y2} n={10} per={15} shown={day2} label="150" opacity={1 - split} />
        {/* the extra 50 the first field grew */}
        <div style={{ ...box(BX + 150 * U, Y2, 50 * U - 4), border: `6px dashed ${BLUE}`, boxSizing: 'border-box', color: BLUE, fontSize: 60, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, zIn + 6, 8) * fadeTo(f, l2, 0, 8) }}>
          50
        </div>
        <div style={{ opacity: split }}>
          <SplitBar y={Y1} maxDays={20} days={gDays} start={startOn} growLabel="+100" />
          <SplitBar y={Y2} maxDays={10} days={gDays} start={startOn} growLabel="+50" opacity={fadeTo(f, l3)} />
        </div>
      </div>

      <Readout
        hide={l3}
        steps={[
          [at(scene, 0, 0.42), '10 \\times 20 = 200'],
          [at(scene, 0, 0.88), '15 \\times 10 = 150'],
          [at(scene, 1, 0.12), '200 - 150 = \\color{#3c83f6}{50}'],
          [at(scene, 1, 0.62), '50 \\div 10 = \\color{#3c83f6}{5} \\text{ a day}'],
          [at(scene, 2, 0.05), '20 \\times 5 = \\color{#3c83f6}{100}'],
          [at(scene, 2, 0.6), '200 - 100 = \\color{#0cc281}{100}'],
        ]}
      />

      <div style={{ opacity: teams }}>
        <Stage>
          {range(5).map((i) => (
            <Goat key={`h${i}`} x={552 + i * 88} y={815} s={0.8 * pop(f, helpersAt(i))} fill={HELP} />
          ))}
          {range(20).map((i) => (
            <Goat key={`p${i}`} x={100 + (i % 5) * 88} y={815 + Math.floor(i / 5) * 92} s={0.8 * pop(f, pileAt(i))} fill={START} />
          ))}
        </Stage>
        <Text x={720} y={870} w={460} size={50} weight={900} color={HELP} align="center" style={{ ...fadeUp(f, helpersAt(2)), whiteSpace: 'nowrap' }}>
          5 eat the growth
        </Text>
        <Text x={276} y={1135} w={440} size={52} weight={900} color={START} align="center" style={fadeUp(f, pileAt(10))}>
          20 eat the pile
        </Text>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the split bars (the same place as the hook's bars). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.71);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="5" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>days</span>
        </div>
      </div>
      <SplitFigure />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 975, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <Tex tex={'100 \\div 20 = \\color{#21c45d}{5}'} size={72} />
      </div>
      <Text x={490} y={1065} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        100 ÷ 25 = 4 ✗ no growth
      </Text>
      <CtaPill start={at(scene, 2)} y={1170} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, growth: Growth, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

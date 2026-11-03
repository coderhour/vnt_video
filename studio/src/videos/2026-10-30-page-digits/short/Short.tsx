import { Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, DC, Page, Pages, SLUG, rowWidth } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (99), question, comment bait, the balance trick as the aha (a gap counter that the
// nine 3-digit pages close, with a zoom on them), reveal with CTA pill. Hook and reveal share the two page grids,
// so the loop cuts cleanly. Word onsets come from silencedetect on each line's WAV.

const before = () => -100;
const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...style }}>{children}</div>
);

// ---- the two grids: pages 1–9 (each one digit short) and nine 3-digit pages (each one extra) ----
const LX = 280;
const RX = 770;
const ROWS = [655, 765, 875];
const SP = 160;
const K = 1.1;
const cell = (i: number, cx: number) => [cx + ((i % 3) - 1) * SP, ROWS[Math.floor(i / 3)]] as const;

/** `left(i)` / `right(i)` = frame tile i pops in; `num(i)` = frame the right tile turns from "?" into 100 + i. */
const Grids: React.FC<{ left: (i: number) => number; right: (i: number) => number; num: (i: number) => number }> = ({ left, right, num }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Text x={LX} y={522} w={460} size={48} weight={900} color={DC[1]} align="center">pages 1–9</Text>
      <Text x={RX} y={522} w={480} size={48} weight={900} color={DC[3]} align="center">3-digit pages</Text>
      <Stage>
        {Array.from({ length: 9 }, (_, i) => {
          const [x, y] = cell(i, LX);
          return <Page key={i} p={i + 1} x={x} y={y} s={K * pop(f, left(i), fps)} />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const [x, y] = cell(i, RX);
          const shown = f >= num(i);
          return <Page key={`r${i}`} p={shown ? 100 + i : '?'} color={DC[3]} x={x} y={y} s={K * pop(f, shown ? num(i) : right(i), fps)} />;
        })}
      </Stage>
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 80 / 102); // "Nope" starts at frame 80 of 102
  return (
    <>
      <Center y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #25</div>
      </Center>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>99</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 760px">
        <Grids left={before} right={before} num={() => 99999} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Center y={660} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Center>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  const ps = [7, 42, 105];
  const k = 1.5;
  const W = rowWidth(ps, 40);
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Pages are numbered from 1. The digits printed are exactly <b style={{ color: C.amber }}>twice the pages</b>. <b style={{ color: C.violet }}>How many pages?</b>
      </div>
      <Stage>
        <g transform={`translate(${540 - (W * k) / 2} 680) scale(${k})`}>
          <Pages ps={ps} x0={0} y={0} gap={40} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 790, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 34px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 68, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1070} />
    </>
  );
};

/** The aha: every page owes 2 digits. Pages 1–9 leave a gap of 9; each 3-digit page pays it back by one. */
const Balance: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const left = (i: number) => at(scene, 0) + 62 + i * 5;
  const right = (i: number) => l2 + 22 + i * 10;
  const minus = at(scene, 0) + 110;
  const gapIn = l1 + 6;
  const even = l1 + 66;
  const plus = l2 + 12;
  const closed = right(8) + 4;
  const zoomIn = l2 + 2;
  const zoomOut = closed + 10;
  const zoom = 1 + 0.22 * ease(f, zoomIn, 12) - 0.22 * ease(f, zoomOut, 12);
  const paid = Array.from({ length: 9 }, (_, i) => right(i) + 4).filter((t) => f >= t).length;
  const gap = 9 - paid;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 3, 6, 8].map((i) => <Sfx key={`l${i}`} at={left(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={gapIn} src={SFX.click} volume={0.28} />
      <Sfx at={even} src={SFX.click} volume={0.24} />
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      {Array.from({ length: 9 }, (_, i) => <Sfx key={`r${i}`} at={right(i)} src={SFX.click} volume={i === 8 ? 0.3 : 0.24} />)}
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Text x={540} y={270} w={1040} size={84} weight={900} align="center" style={fadeUp(f, 4)}>
        Every page owes <span style={{ color: C.primary }}>2 digits</span>
      </Text>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(455px 0 868px 0)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${RX + 60}px 765px` }}>
          <Grids left={left} right={right} num={() => 99999} />
          <Text x={LX} y={940} w={460} size={62} weight={900} color={C.red} align="center" style={fadeUp(f, minus)}>−1 each</Text>
          <Text x={RX} y={940} w={460} size={62} weight={900} color={C.green} align="center" style={fadeUp(f, plus)}>+1 each</Text>
        </div>
      </div>
      <Center y={1058} style={fadeUp(f, even)}>
        <div style={{ background: DC[2], color: '#fff', borderRadius: 24, padding: '6px 34px', fontSize: 60, fontWeight: 900 }}>pages 10–99: even</div>
      </Center>
      <Center y={1165} style={{ opacity: ease(f, gapIn, 8) }}>
        <div style={{ transform: `scale(${0.9 + 0.1 * pop(f, paid ? right(paid - 1) + 4 : gapIn)})`, background: gap === 0 ? C.green : C.red, color: '#fff', borderRadius: 26, padding: '8px 48px', fontSize: 80, fontWeight: 900, whiteSpace: 'nowrap' }}>
          {gap === 0 ? 'gap closed ✓' : `${gap} digit${gap > 1 ? 's' : ''} short`}
        </div>
      </Center>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 80 / 130); // "one hundred eight" (the second one) starts near frame 80 of 130
  const chime = at(scene, 0, 126 / 130);
  const trap = at(scene, 1);
  const num = (i: number) => at(scene, 0) + 10 + i * 5; // tiles turn into 100…108 on "pages one hundred to one hundred eight"
  return (
    <>
      <Center y={280}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 110, fontWeight: 900 }}>108</span>
          <span style={{ fontSize: 66, fontWeight: 900 }}>pages</span>
        </div>
      </Center>
      <Grids left={before} right={before} num={num} />
      {Array.from({ length: 9 }, (_, i) => (i % 3 === 0 ? <Sfx key={i} at={num(i)} src={SFX.click} volume={0.22} /> : null))}
      <Center y={945} style={fadeUp(f, 4)}>
        <span style={{ fontSize: 72, fontWeight: 900 }}><span style={{ color: C.red }}>−9</span> <span style={{ color: C.green }}>+ 9</span> = 0</span>
      </Center>
      <Center y={1045} style={{ ...fadeUp(f, trap + 2) }}>
        <span style={{ fontSize: 54, fontWeight: 900, color: C.red }}>99 pages: 189 digits, 9 short ✗</span>
      </Center>
      <CtaPill start={at(scene, 2)} y={1155} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, balance: Balance, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

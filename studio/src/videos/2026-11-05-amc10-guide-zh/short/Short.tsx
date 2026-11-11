import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ZH_FONT } from '../../../lib/fonts';
import { CHIME, SLUG } from '../Composition';

export { SLUG };

// Tip short (no quiz question): two 25-cell answer sheets, scoring chips, score bars, AIME cutoff line.
// The reveal ends on the same two sheets, at the same place as frame 0, so the loop cuts cleanly.

const GREY = '#cfd4df';
const SX = 40, CW = 31, CH = 90, STEP = 35; // 25 cells span x 40…911 (right ~160 px stay clear below y 900)
const SA_Y = 730, SB_Y = 940;
const BX = 60, KB = 8; // bars: x origin, px per point
const BH = 96;
const never = 99999;

type Group = [number, string];
const GA: Group[] = [[16, C.green], [9, C.red]];
const GB: Group[] = [[14, C.green], [11, GREY]];

/** One answer sheet: 25 cells in a row. `op(k)` = opacity of cell k. */
const Strip: React.FC<{ y: number; groups: Group[]; op?: (k: number) => number }> = ({ y, groups, op = () => 1 }) => {
  const cells: React.ReactNode[] = [];
  let k = 0;
  for (const [n, col] of groups)
    for (let i = 0; i < n; i++, k++)
      cells.push(<div key={k} style={{ position: 'absolute', left: SX + k * STEP, top: y, width: CW, height: CH, borderRadius: 9, background: col, opacity: op(k) }} />);
  return <>{cells}</>;
};

/** Both sheets exactly as on frame 0. */
const Sheets: React.FC<{ tintA?: number }> = ({ tintA = 0 }) => (
  <>
    {tintA > 0 && <div style={{ position: 'absolute', left: SX - 10, top: SA_Y - 8, width: 25 * STEP - 4 + 20, height: CH + 16, borderRadius: 22, background: 'rgba(239,67,67,0.22)', border: `6px solid ${C.red}`, opacity: tintA, boxSizing: 'border-box' }} />}
    <Strip y={SA_Y} groups={GA} />
    <Strip y={SB_Y} groups={GB} />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · 小贴士</div>
      </div>
      <Text x={540} y={385} w={1000} size={100} weight={900} align="center" style={{ lineHeight: 1.12 }}>
        答对越多 =<br />分越高<span style={{ color: C.red }}>？</span>
      </Text>
      <PushIn frames={scene.frames} origin="540px 880px">
        <Sheets />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 790, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 4 }}>
          错！
        </div>
      </div>
    </>
  );
};

const Chip: React.FC<{ color: string; t0: number; children: React.ReactNode }> = ({ color, t0, children }) => {
  const f = useCurrentFrame();
  return <div style={{ transform: `scale(${pop(f, t0)})`, background: color, color: '#fff', borderRadius: 26, padding: '10px 28px', fontSize: 62, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>;
};

const QuestionBody: React.FC<{ chips: [number, number, number]; labels: [number, number]; ask?: number; pulse?: (i: number) => number; bubble?: boolean }> = ({ chips, labels, ask, pulse = () => 1, bubble }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 270, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Chip color={C.green} t0={chips[0]}>答对 +6</Chip>
        <Chip color={C.red} t0={chips[1]}>答错 0</Chip>
        <Chip color="#6b7280" t0={chips[2]}>空着 +1.5</Chip>
      </div>
      {!bubble && ask !== undefined && (
        <Text x={540} y={440} w={1000} size={96} weight={900} align="center" style={fadeUp(f, ask)}>
          谁的分高？
        </Text>
      )}
      <Text x={SX} y={SA_Y - 82} w={1000} size={64} weight={900} style={{ lineHeight: 1.1, ...fadeUp(f, labels[0]) }}>
        <span style={{ color: C.violet }}>A卷：</span>对16，错9
      </Text>
      <Text x={SX} y={SB_Y - 82} w={1000} size={64} weight={900} style={{ lineHeight: 1.1, ...fadeUp(f, labels[1]) }}>
        <span style={{ color: C.violet }}>B卷：</span>对14，空11
      </Text>
      <Sheets />
      <div style={{ position: 'absolute', left: 60, top: 1100, width: 860, display: 'flex', justifyContent: 'center', gap: 60 }}>
        {['A', 'B'].map((l, i) => (
          <div key={l} style={{ ...fadeUp(f, ask ?? -100, 8), background: C.card, borderRadius: 28, width: 300, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 900, color: C.violet, boxShadow: '0 4px 14px rgba(30,40,80,0.1)', scale: String(pulse(i)) }}>
            {l}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody chips={[at(scene, 0, 0.22), at(scene, 0, 0.5), at(scene, 0, 0.86)]} labels={[at(scene, 1, 0.08), at(scene, 1, 0.36)]} ask={at(scene, 1, 0.78)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    <Sfx at={at(scene, 0, 0.22)} src={SFX.click} volume={0.25} />
    <Sfx at={at(scene, 0, 0.5)} src={SFX.click} volume={0.25} />
    <Sfx at={at(scene, 0, 0.86)} src={SFX.click} volume={0.25} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody chips={[-100, -100, -100]} labels={[-100, -100]} ask={-100} bubble pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={400} choices={2} text="评论你的选项！" />
    </>
  );
};

/** Horizontal score bars: A (red) and B (green 84 + grey 16.5), value inside at the left. */
const Bars: React.FC<{ yA: number; yB: number; a: number; b1: number; b2: number; instant?: boolean }> = ({ yA, yB, a, b1, b2, instant }) => {
  const f = useCurrentFrame();
  const g = (t: number, d = 22) => (instant ? 1 : ease(f, t, d));
  const wa = 96 * KB * g(a), w1 = 84 * KB * g(b1), w2 = 16.5 * KB * g(b2);
  const lab = (y: number, txt: string) => (
    <div style={{ position: 'absolute', left: BX + 24, top: y, height: BH, display: 'flex', alignItems: 'center', fontSize: 70, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>{txt}</div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: BX, top: yA, width: wa, height: BH, background: C.red, borderRadius: 18 }} />
      {wa >= 96 * KB - 1 && lab(yA, 'A卷 · 96')}
      <div style={{ position: 'absolute', left: BX, top: yB, width: w1, height: BH, background: C.green, borderRadius: w2 > 1 ? '18px 0 0 18px' : 18 }} />
      <div style={{ position: 'absolute', left: BX + w1, top: yB, width: w2, height: BH, background: GREY, borderRadius: '0 18px 18px 0' }} />
      {w1 >= 84 * KB - 1 && lab(yB, w2 >= 16.5 * KB - 1 ? 'B卷 · 100.5' : 'B卷 · 84')}
    </>
  );
};

const Eq: React.FC<{ parts: [string, number, string?][]; x: number; y: number; size?: number; style?: React.CSSProperties }> = ({ parts, x, y, size = 72, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', gap: '0.3em', lineHeight: 1.15, ...style }}>
      {parts.map(([t, s, col], i) => (
        <span key={i} style={{ opacity: ease(f, s, 6), color: col ?? C.ink }}>{t}</span>
      ))}
    </div>
  );
};

// Score scene stack (y): recap 262, bars 335 / 445, A eq 575, strip A 665, A eq2 765, B eq 870, strip B 960, B eq2 1060, total 1170.
const SC = { rec: 262, barA: 335, barB: 445, a1: 575, sa: 665, a2: 765, b1: 870, sb: 960, b2: 1060, tot: 1170 };
const aCountOn = (f: number, t: number) => ease(f, t, 4);

const Score: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a0 = at(scene, 0), b0 = at(scene, 1), c0 = at(scene, 2);
  const aCount = a0 + Math.round(0.1 * scene.lines[0].frames);
  const aSpan = Math.round(0.25 * scene.lines[0].frames);
  const bCount = b0 + Math.round(0.12 * scene.lines[1].frames);
  const bSpan = Math.round(0.28 * scene.lines[1].frames);
  const blankT = at(scene, 1, 0.5); // "Eleven blanks"
  const blankSpan = Math.round(0.2 * scene.lines[1].frames);
  const aOp = (k: number) => (k < 16 ? 0.3 + 0.7 * aCountOn(f, aCount + (k / 16) * aSpan) : 0.3 + 0.7 * ease(f, at(scene, 0, 0.7) + (k - 16) * 2, 5));
  const bOp = (k: number) => (k < 14 ? 0.3 + 0.7 * aCountOn(f, bCount + (k / 14) * bSpan) : 0.3 + 0.7 * aCountOn(f, blankT + ((k - 14) / 11) * blankSpan));
  const zoomIn = at(scene, 1, 0.48);
  const zoomOut = at(scene, 1, 0.97);
  const zoom = 1 + 0.07 * ease(f, zoomIn, 12) - 0.07 * ease(f, zoomOut, 12);
  const ring = ease(f, zoomIn, 8) * (1 - ease(f, zoomOut, 8));
  const dimA = 1 - 0.8 * ease(f, zoomIn, 10) + 0.8 * ease(f, zoomOut, 10);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {Array.from({ length: 6 }, (_, i) => <Sfx key={`a${i}`} at={aCount + (i * 3 / 16) * aSpan} src={SFX.click} volume={0.22} />)}
      {Array.from({ length: 5 }, (_, i) => <Sfx key={`b${i}`} at={bCount + (i * 3 / 14) * bSpan} src={SFX.click} volume={0.22} />)}
      {Array.from({ length: 4 }, (_, i) => <Sfx key={`k${i}`} at={blankT + (i * 3 / 11) * blankSpan} src={SFX.click} volume={0.28} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.2} />
      <Sfx at={c0 + 0.66 * scene.lines[2].frames} src={SFX.click} volume={0.3} />
      <Text x={540} y={SC.rec} w={1000} size={54} weight={800} color={C.muted} align="center">
        答对 +6 · 答错 0 · 空着 +1.5
      </Text>
      <Bars yA={SC.barA} yB={SC.barB} a={at(scene, 0, 0.38)} b1={at(scene, 1, 0.38)} b2={at(scene, 2, 0.66)} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 1000px' }}>
        <div style={{ opacity: dimA }}>
          <Eq x={SX} y={SC.a1} parts={[['16 × 6 =', at(scene, 0, 0.1), C.ink], ['96', at(scene, 0, 0.4), C.green]]} />
          <Strip y={SC.sa} groups={GA} op={aOp} />
          <Eq x={SX} y={SC.a2} parts={[['9道错题 × 0 = 0', at(scene, 0, 0.76), C.red]]} />
        </div>
        <Eq x={SX} y={SC.b1} parts={[['14 × 6 = 84', at(scene, 1, 0.12), C.ink]]} />
        <Strip y={SC.sb} groups={GB} op={bOp} />
        <div style={{ position: 'absolute', left: SX + 14 * STEP - 8, top: SC.sb - 8, width: 11 * STEP + 10, height: CH + 16, borderRadius: 16, border: `7px solid ${C.amber}`, boxSizing: 'border-box', opacity: ring }} />
        <Eq x={SX} y={SC.b2} parts={[['11 × 1.5 = 16.5', at(scene, 1, 0.5), '#6b7280']]} />
      </div>
      <Eq x={SX} y={SC.tot} size={80} parts={[['84', c0 + 2, C.green], ['+ 16.5', at(scene, 2, 0.3), '#6b7280'], ['= 100.5', at(scene, 2, 0.66), C.green]]} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.1);
  const chime = at(scene, 0, 0.97);
  const cutoff = at(scene, 0, 0.72);
  const trap = at(scene, 1);
  const tint = ease(f, trap, 6) * (1 - ease(f, at(scene, 2, 0.5), 10));
  return (
    <>
      <Confetti x={540} y={330} start={chime} seed={7} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 270, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', fontSize: 84, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>
          B卷胜 · 100.5
        </div>
      </div>
      <Text x={650} y={405} w={760} size={50} weight={800} align="center" style={{ opacity: ease(f, cutoff, 8), whiteSpace: 'nowrap' }}>
        AIME晋级线（2026–27）
      </Text>
      <div style={{ position: 'absolute', left: BX + 100 * KB - 3, top: 472, height: 240, borderLeft: `6px dashed ${C.ink}`, opacity: ease(f, cutoff, 8) }} />
      <Bars yA={485} yB={595} a={0} b1={0} b2={0} instant />
      <Sheets tintA={tint} />
      <CtaPill start={at(scene, 2)} y={1150} text="练习更多题，就在 vantee.ai" />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, score: Score, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10 备考指南" captions="box" font={ZH_FONT} music={MUSIC} /> : null;

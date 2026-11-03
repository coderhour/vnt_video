import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { NUNITO } from '../../../lib/fonts';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, CHIME, CHOICES, GREEN, SLUG, VIOLET, along } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (1 = p² alone, forgets the 17), question, comment bait, the dot picture
// (7 × 7 = 49 → remove a corner, slide the bottom row → 6 × 8 + 1), then the answer over the same picture.
// Frame 0 and the last frame both show the 6 × 8 rectangle plus the lone red dot, so the loop cuts cleanly.

const before = () => -100;

const DX0 = 246; // the 8-column rectangle is centred on x = 540
const DY0 = 660;
const SP = 84;
const DR = 30;
const dpos = (c: number, r: number): [number, number] => [DX0 + c * SP, DY0 + r * SP];
const [REDX, REDY] = dpos(6, 6);

/** 7 × 7 dots; the corner (6, 6) turns red at `cornerRed`, the rest of the bottom row slides up the right side from
 * `move0`. `seven` / `eight` = opacity of the 7 × 7 and the 6 × 8 braces, `plus` = the "+1" tag on the red dot. */
const DotFig: React.FC<{ dotStart: number; cornerRed: number; move0: number; seven: number; eight: number; plus: number; pulse?: number }> = ({ dotStart, cornerRed, move0, seven, eight, plus, pulse = 0 }) => {
  const f = useCurrentFrame();
  const gut = 7.1;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const s = f >= dotStart + (r * 7 + c) ? pop(f, dotStart + (r * 7 + c)) : 0;
      if (s <= 0.01) continue;
      let [x, y] = dpos(c, r);
      let fill: string = C.ink;
      let rad = DR * s;
      if (r === 6 && c === 6) {
        if (f >= cornerRed) fill = C.red;
        rad = DR * s * (1 + 0.25 * pulse);
      } else if (r === 6) {
        const j = 5 - c;
        const u = ease(f, move0 + j * 5, 44);
        if (f >= move0 - 4) fill = AMBER;
        if (u > 0) [x, y] = along([dpos(c, 6), dpos(c, gut), dpos(7, gut), dpos(7, j)], u);
      }
      dots.push(<circle key={`${c}-${r}`} cx={x} cy={y} r={rad} fill={fill} />);
    }
  }
  const lab = (text: string, x: number, y: number, op: number, color: string) =>
    op > 0 ? (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={900} fontSize={60} fill={color} opacity={op}>
        {text}
      </text>
    ) : null;
  const top = DY0 - 56;
  const [tx0] = dpos(0, 0);
  const brace = (x2: number, op: number, color: string) => (
    <path d={`M ${tx0 - 22} ${top + 12} L ${tx0 - 22} ${top} L ${x2 + 22} ${top} L ${x2 + 22} ${top + 12}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
  const lx = DX0 - 56;
  const lbrace = (r2: number, op: number, color: string) => (
    <path d={`M ${lx + 12} ${DY0 - 22} L ${lx} ${DY0 - 22} L ${lx} ${DY0 + r2 * SP + 22} L ${lx + 12} ${DY0 + r2 * SP + 22}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
  return (
    <Stage>
      <rect x={DX0 - 40} y={DY0 - 40} width={6 * SP + 80} height={6 * SP + 80} rx={28} fill="none" stroke={VIOLET} strokeWidth={6} opacity={seven} />
      <rect x={DX0 - 40} y={DY0 - 40} width={7 * SP + 80} height={5 * SP + 80} rx={28} fill="rgba(33,196,93,0.08)" stroke={GREEN} strokeWidth={7} opacity={eight} />
      {dots}
      {brace(dpos(6, 0)[0], seven, VIOLET)}
      {lab('7', dpos(3, 0)[0], top - 40, seven, VIOLET)}
      {lbrace(6, seven, VIOLET)}
      {lab('7', lx - 44, DY0 + 3 * SP, seven, VIOLET)}
      {brace(dpos(7, 0)[0], eight, GREEN)}
      {lab('8', dpos(3.5, 0)[0], top - 40, eight, GREEN)}
      {lbrace(5, eight, GREEN)}
      {lab('6', lx - 44, DY0 + 2.5 * SP, eight, GREEN)}
      {lab('+1', REDX + 92, REDY + 2, plus, C.red)}
    </Stage>
  );
};

/** The end picture (6 × 8 + the red dot), as in the hook and the reveal. */
const EndFig: React.FC = () => <DotFig dotStart={-200} cornerRed={-100} move0={-200} seven={0} eight={1} plus={1} />;

/** Centred maths line at `y`, visible between `start` and `end`. */
const Mid: React.FC<{ y: number; start: number; end?: number; tex: string; size?: number; color?: string }> = ({ y, start, end = 99999, tex, size = 80, color = C.ink }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start, 8);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * fadeTo(f, end, 0, 6) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Opens on the 6 × 8 + 1 picture (the same picture the video ends on), then stamps the trap answer 1. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #39</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 880px">
        <EndFig />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 770, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        <b style={{ color: C.violet }}>p</b> is a <b style={{ color: C.violet }}>prime bigger than 3</b>. What's the <b style={{ color: C.primary }}>remainder</b> when p² + 17 is divided by <b style={{ color: C.blue }}>12</b>?
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 640, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34 }}>
        <Tex tex="\dfrac{p^2 + 17}{12}" size={84} />
        <span style={{ fontSize: 70, fontWeight: 900, color: C.muted }}>→</span>
        <span style={{ fontSize: 64, fontWeight: 900 }}>remainder?</span>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 36px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: 49 dots with a counter, zoom onto the corner, the slide into 6 × 8, then why it's a multiple of 12. */
const Dots: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const dotStart = at(scene, 0, 0.12);
  const count = Math.max(1, Math.min(49, Math.floor(f - dotStart) + 1));
  const cornerRed = at(scene, 1, 0.08);
  const move0 = at(scene, 1, 0.42);
  const land = move0 + 25 + 44;
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const l4 = at(scene, 4);
  const eight = ease(f, Math.max(land - 4, l2), 10);
  const seven = ease(f, at(scene, 0, 0.6), 10) * fadeTo(f, cornerRed - 6, 0, 8);
  // zoom onto the bottom row while the corner is removed, back out for the slide
  const z = ease(f, cornerRed - 4, 10) - ease(f, move0 + 12, 16);
  const pulse = f >= l4 ? Math.max(0, Math.sin(((f - l4) / 22) * Math.PI)) * (f < l4 + 66 ? 1 : 0) : 0;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {Array.from({ length: 7 }, (_, r) => <Sfx key={r} at={dotStart + r * 7} src={SFX.click} volume={0.22} />)}
      <Sfx at={cornerRed - 4} src={SFX.whoosh} volume={0.25} />
      <Sfx at={cornerRed + 4} src={SFX.click} volume={0.3} />
      {[0, 2, 4].map((j) => <Sfx key={`m${j}`} at={move0 + j * 5 + 40} src={SFX.click} volume={0.25} />)}
      <Sfx at={l2 + 4} src={SFX.click} volume={0.3} />
      <Sfx at={l3 + 6} src={SFX.whoosh} volume={0.22} />
      <Sfx at={l4 + 4} src={SFX.click} volume={0.3} />

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.3 * z})`, transformOrigin: `560px ${REDY + 100}px` }}>
        <DotFig dotStart={dotStart} cornerRed={cornerRed} move0={move0} seven={seven} eight={eight} plus={ease(f, land, 8)} pulse={pulse} />
      </div>

      {/* top readouts, one idea at a time */}
      <Mid y={300} start={dotStart} end={cornerRed} tex={count < 49 ? `${count}` : '7 \\times 7 = 49'} size={count < 49 ? 96 : 84} />
      <Mid y={300} start={cornerRed} end={l2} tex="49 - {\color{#ef4343}1} = 48" size={84} />
      <Mid y={300} start={l2 + 2} end={l3} tex="6 \times 8 = 48" size={84} color={GREEN} />
      <Mid y={410} start={at(scene, 2, 0.45)} end={l3} tex="6 = 7 - 1 \qquad 8 = 7 + 1" size={64} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 28, opacity: ease(f, l3, 8) * fadeTo(f, l4, 0, 6) }}>
        {[['6', 'multiple of 6', at(scene, 3, 0.15)], ['8', 'even', at(scene, 3, 0.62)]].map(([n, tag, s], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
            {i === 1 && <div style={{ fontSize: 80, fontWeight: 900, paddingTop: 4 }}>×</div>}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 88, fontWeight: 900, color: GREEN, lineHeight: 1.1 }}>{n}</div>
              <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 44, fontWeight: 900, ...fadeUp(f, s as number, 8) }}>{tag}</div>
            </div>
          </div>
        ))}
      </div>
      <Mid y={300} start={l4} tex="p^2 = \text{mult. of } 12 \;{\color{#ef4343}+\, 1}" size={76} />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same picture (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.86);
  const chime = at(scene, 0, 0.99);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${f >= hit ? pop(f, hit) : 0})`, background: C.green, color: '#fff', borderRadius: 28, padding: '8px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 70, fontWeight: 900 }}>remainder</span>
          <Tex tex="6" size={104} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 430, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.05), 8) }}>
        <Tex tex="1 + 17 = 18" size={64} />
        <span style={{ opacity: ease(f, hit, 8) }}>
          <Tex tex="\;= 12 + {\color{#21c45d}6}" size={64} />
        </span>
      </div>
      <EndFig />
      <div style={{ position: 'absolute', left: 40, width: 660, top: REDY - 40, textAlign: 'right', fontSize: 58, fontWeight: 900, color: C.red, ...fadeUp(f, at(scene, 1, 0.05)) }}>
        1 forgets the 17
      </div>
      <CtaPill start={at(scene, 2)} y={1212} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, dots: Dots, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

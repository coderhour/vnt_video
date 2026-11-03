import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Fig, HBrace, Label, SLUG, Seg, VBrace, px, type Cfg } from '../Composition';

export { SLUG };

// New recipe (~40 s): trap-first hook (15 = the lower piece only), question, comment bait, the "same steepness"
// aha (3 across, 4 up, seven times) with a zoom onto one step, then the answer. Hook and reveal share one figure (M).

const M: Cfg = { a: 9, d: 12, h: 12, u: 21, ox: 300, oy: 1180 }; // wall top (31 ft) at y 529 (hook + reveal)
const A: Cfg = { a: 9, d: 12, h: 12, u: 26, ox: 240, oy: 1225 }; // aha, bigger: wall top at y 419
const QC: Cfg = { a: 9, d: 12, h: 12, u: 17, ox: 340, oy: 1110 }; // question

/** The trap: the lower piece only, from the foot to the box corner, in red. */
const LowerPiece: React.FC<{ c: Cfg; op: number; label?: boolean }> = ({ c, op, label = true }) =>
  op <= 0 ? null : (
    <g opacity={op}>
      <Seg a={px(c, 0, 0)} b={px(c, c.a, c.h)} color={C.red} width={17} />
      {label && <Label p={[px(c, 4.5, 6)[0] - 62, px(c, 4.5, 6)[1] - 30]} text="15" color={C.red} size={72} />}
    </g>
  );

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.77); // "Nope!" starts at 2.73 s of the 3.56 s line
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #2</div>
      </div>
      <Text x={540} y={385} w={1040} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>15 ft</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 900px">
        <Stage>
          <Fig c={M} />
          <LowerPiece c={M} op={1} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 760, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        The <b style={{ color: '#a0662b' }}>ladder</b> touches the box's top corner and reaches the wall. <b>How long is it?</b>
      </div>
      <Stage>
        <Fig c={QC} />
        <Label p={px(QC, 4.5, -2.2)} text="9 ft" color={C.blue} size={50} />
        <Label p={px(QC, 15, 8)} text="12 tall" color={C.primary} size={50} />
        <Label p={px(QC, 15, 4.5)} text="12 deep" color={C.primary} size={50} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1190, width: 860, display: 'flex', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 12, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.75 + i * 0.05)} />
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

/** The aha: 12 up for 9 across is 4 up per 3 across (zoom on one step), seven steps to the wall, 28 up. */
const Steps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c = A;
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const zIn = at(scene, 0, 0.38); // "That's four up for every three across" at 1.5 s
  const z = ease(f, zIn, 14) - ease(f, l1, 12);
  const step = px(c, 7.5, 10);
  const small = ease(f, 4, 10) * fadeTo(f, l1, 0, 10);
  const one = ease(f, zIn + 10, 10) * fadeTo(f, l1 + 6, 0, 8);
  const t0 = l1 + 18; // stairs climb from "twenty-one feet away", one step every 10 frames
  const k = f < t0 ? 0 : Math.min(7, Math.floor((f - t0) / 10) + 1);
  const n28 = at(scene, 2, 0.61); // "Twenty-eight feet" at 2.62 s
  const chip = (start: number, end: number): React.CSSProperties => ({ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', ...fadeUp(f, start, 10), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 8) });
  const pill = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', borderRadius: 26, padding: '10px 40px', fontSize: 68, fontWeight: 900, whiteSpace: 'nowrap' });
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l1} src={SFX.whoosh} volume={0.25} />
      {[0, 2, 4, 6].map((i) => <Sfx key={i} at={t0 + i * 10} src={SFX.click} volume={0.26} />)}
      <Sfx at={n28} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, clipPath: z > 0 ? 'inset(400px 0px 590px 0px)' : undefined }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${(540 - step[0]) * z}px, ${(860 - step[1]) * z}px) scale(${1 + 0.75 * z})`, transformOrigin: `${step[0]}px ${step[1]}px` }}>
          <Stage>
            <Fig c={c} small={small} />
            <Label p={px(c, c.a / 2, -2.2)} text="9 across" color={C.primary} size={52} opacity={small * fadeTo(f, zIn, 0, 8)} />
            <Label p={px(c, c.a + 0.6, 5)} text="12 up" color={C.primary} size={52} anchor="start" opacity={small * fadeTo(f, zIn, 0, 8)} />
            {one > 0 && (
              <g opacity={one}>
                <Seg a={px(c, 6, 8)} b={px(c, 9, 8)} color={C.violet} width={8} />
                <Seg a={px(c, 9, 8)} b={px(c, 9, 12)} color={C.violet} width={8} />
                <Label p={px(c, 7.5, 7.1)} text="3" color={C.violet} size={36} />
                <Label p={px(c, 9.5, 10)} text="4" color={C.violet} size={36} anchor="start" />
              </g>
            )}
            {Array.from({ length: k }, (_, i) => {
              const col = i % 2 === 0 ? C.violet : C.amber;
              return (
                <g key={i}>
                  <Seg a={px(c, 3 * i, 4 * i)} b={px(c, 3 * (i + 1), 4 * i)} color={col} width={10} />
                  <Seg a={px(c, 3 * (i + 1), 4 * i)} b={px(c, 3 * (i + 1), 4 * (i + 1))} color={col} width={10} />
                </g>
              );
            })}
            <HBrace x1={px(c, 0, 0)[0]} x2={px(c, 21, 0)[0]} y={px(c, 0, 0)[1] + 46} color={C.violet} label="21" opacity={ease(f, l1 + 6, 10)} />
            <circle cx={px(c, 21, 28)[0]} cy={px(c, 21, 28)[1]} r={14} fill={C.ink} opacity={ease(f, n28, 8)} />
            <VBrace x={px(c, 22.2, 0)[0]} y1={px(c, 0, 0)[1]} y2={px(c, 0, 28)[1]} color={C.blue} label="28" opacity={ease(f, n28, 8)} lx={40} />
          </Stage>
        </div>
      </div>
      {/* readouts above the figure, one at a time */}
      <div style={chip(4, zIn)}>
        <div style={pill(C.primary)}>9 across, 12 up</div>
      </div>
      <div style={chip(zIn + 6, l1)}>
        <div style={pill(C.violet)}>4 up per 3 across</div>
      </div>
      <div style={chip(l1 + 4, l2)}>
        <div style={pill(C.violet)}>{k === 0 ? 'steps of 3 across' : k < 7 ? `${k} × 3 = ${3 * k}` : '21 = 7 × 3'}</div>
      </div>
      <div style={chip(l2 + 4, 99999)}>
        <div style={pill(C.blue)}>7 × 4 = {f >= n28 ? '28' : '?'}</div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same figure as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c = M;
  const hit = at(scene, 0, 0.74); // "thirty-five" at about 3.6 s of the 4.84 s line
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const braces = ease(f, 6, 10) * fadeTo(f, at(scene, 2), 0, 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'baseline', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>ladder</span>
          <span style={{ fontSize: 110, fontWeight: 900 }}>35 ft</span>
        </div>
      </div>
      <Stage>
        <Fig c={c} big={ease(f, 6, 12) * fadeTo(f, trap, 0, 10)} />
        <HBrace x1={px(c, 0, 0)[0]} x2={px(c, 21, 0)[0]} y={px(c, 0, 0)[1] + 40} color={C.violet} label="21 = 7 × 3" opacity={braces} />
        <VBrace x={px(c, 22.2, 0)[0]} y1={px(c, 0, 0)[1]} y2={px(c, 0, 28)[1]} color={C.blue} label="28" opacity={braces} lx={40} />
        <Label p={px(c, 12.5, 21)} text="35" color={C.green} size={80} opacity={ease(f, hit, 8)} />
        <LowerPiece c={c} op={ease(f, trap, 10)} />
      </Stage>
      <Text x={180} y={760} w={420} size={56} weight={900} color={C.violet} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.15)), opacity: ease(f, at(scene, 0, 0.15), 10) * fadeTo(f, trap, 0, 8) }}>
        3-4-5 × 7
      </Text>
      <CtaPill start={at(scene, 2)} y={1220} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, steps: Steps, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

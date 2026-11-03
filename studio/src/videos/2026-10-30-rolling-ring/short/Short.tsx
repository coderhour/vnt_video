import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { NUNITO } from '../../../lib/fonts';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, Label, PHI0, R, Rolling, SLUG, TAU, plane, pose, r } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (5), question, comment bait, "follow the center" aha (zoom on the radius-2 gap,
// the radius-8 path, the ring rolling with a 4π-step readout), reveal (4 turns, 5 = the dot's touches) + CTA pill.
// The last frame shows the same hoop and ring, at the same place, as frame 0.

const MAIN = plane(540, 850, 32); // hoop radius 320 px: x 220 … 860, y 530 … 1170
const MU = 32;
const QM = plane(540, 805, 23); // question figure: y 575 … 1035
const QU = 23;
const CHOICES = ['3', '4', '5', '6', '8'];
const before = -100;

/** A labelled segment from p to q (maths coords), label at `lp`. */
const Seg: React.FC<{ m: (p: Pt) => Pt; p: Pt; q: Pt; lp: Pt; text: string; color: string; opacity: number; size?: number }> = ({ m, p, q, lp, text, color, opacity, size = 60 }) => {
  if (opacity <= 0) return null;
  const [x0, y0] = m(p);
  const [x1, y1] = m(q);
  return (
    <g opacity={opacity}>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={7} strokeLinecap="round" />
      <circle cx={x0} cy={y0} r={8} fill={color} />
      <circle cx={x1} cy={y1} r={8} fill={color} />
      <Label p={m(lp)} text={text} color={color} size={size} />
    </g>
  );
};

/** The dot's touch marks on the hoop (every 72°), popping in from `start`, `gap` frames apart. */
const Touches: React.FC<{ start: number; gap: number; opacity?: number }> = ({ start, gap, opacity = 1 }) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {range(5).map((k) => {
        const s = pop(f, start + k * gap);
        if (f < start + k * gap) return null;
        const a = PHI0 + ((k + 1) * TAU) / 5;
        const p0 = MAIN([R * Math.cos(a), R * Math.sin(a)]);
        const p1 = MAIN([(R + 0.7) * Math.cos(a), (R + 0.7) * Math.sin(a)]);
        const [bx, by] = MAIN([(R + 1.5) * Math.cos(a), (R + 1.5) * Math.sin(a)]);
        return (
          <g key={k}>
            <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
            <g transform={`translate(${bx} ${by}) scale(${s})`}>
              <circle r={28} fill={C.red} />
              <text y={2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={36} textAnchor="middle" dominantBaseline="middle">{k + 1}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** Opens on the hoop and ring (the same picture the video ends on), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #7</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>5</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 850px">
        <Stage>
          <Rolling d={0} m={MAIN} unit={MU} />
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
  const c0 = pose(R, r, 'inside', 0).c;
  const a = Math.PI * 0.75;
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A ring of <b style={{ color: C.violet }}>radius 2</b> rolls inside a hoop of <b style={{ color: C.primary }}>radius 10</b>. How many <b>full turns</b> in one lap?
      </div>
      <Stage>
        <Rolling d={0} m={QM} unit={QU} />
        <Seg m={QM} p={[0, 0]} q={[R * Math.cos(a), R * Math.sin(a)]} lp={[5 * Math.cos(a) + 1.3, 5 * Math.sin(a) + 1.3]} text="10" color={C.primary} opacity={1} />
        <Seg m={QM} p={c0} q={[c0[0] + r, c0[1]]} lp={[c0[0] + r + 1.6, c0[1]]} text="2" color={C.amber} opacity={1} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1055, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** Follow the center: zoom onto the radius-2 gap, out to the radius-8 path, then roll the ring with a 4π-step readout. */
const Center: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c0 = pose(R, r, 'inside', 0).c;
  const zin = at(scene, 0, 0.45);
  const zout = at(scene, 1, 0.5);
  const zoom = 1 + 0.45 * ease(f, zin, 12) - 0.45 * ease(f, zout, 12);
  const path = ease(f, zout + 4, 36);
  const roll1 = [at(scene, 2, 0.15), at(scene, 2, 0.85)];
  const roll2 = [at(scene, 3, 0.05), at(scene, 3, 0.95)];
  const d = interpolate(f, [roll1[0], roll1[1], roll2[0], roll2[1]], [0, TAU / 4, TAU / 4, TAU], clamp);
  const turn = (k: number) => (k === 1 ? roll1[1] : roll2[0] + ((k - 1) / 3) * (roll2[1] - roll2[0])); // frame turn k finishes
  const done = range(4).filter((k) => f >= turn(k + 1)).length;
  const centreHi = ease(f, zin - 6, 8);
  const pulse = 1 + 0.25 * Math.max(0, Math.sin(((f - zin) / 15) * Math.PI)) * (f < zout ? 1 : 0);
  const [cx, cy] = MAIN(pose(R, r, 'inside', d).c);
  const readout = (slot: number, s: number, e = 99999) => ({ opacity: ease(f, s, 8) * fadeTo(f, e, 0, 6), transform: `scale(${slot === done ? pop(f, s) : 1})` });
  const chip: React.CSSProperties = { position: 'absolute', left: 0, width: 1080, top: 405, display: 'flex', justifyContent: 'center' };
  const box = (bg: string): React.CSSProperties => ({ background: bg, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap' });
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zin} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zout} src={SFX.whoosh} volume={0.25} />
      {range(4).map((k) => <Sfx key={k} at={turn(k + 1)} src={SFX.click} volume={0.3} />)}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 1150px' }}>
        <Stage>
          <Rolling d={d} path={path} m={MAIN} unit={MU} />
          <circle cx={cx} cy={cy} r={14 * pulse} fill={C.primary} opacity={centreHi} />
          <Seg m={MAIN} p={c0} q={[0, -R]} lp={[1.3, c0[1] - 1]} text="2" color={C.amber} opacity={ease(f, at(scene, 1, 0.05), 8) * fadeTo(f, zout, 0, 8)} size={56} />
          <Seg m={MAIN} p={[0, 0]} q={[(R - r) * Math.cos(Math.PI * 0.75), (R - r) * Math.sin(Math.PI * 0.75)]} lp={[-4 * 0.707 + 1.1, 4 * 0.707 + 1.1]} text="8" color={C.primary} opacity={ease(f, at(scene, 1, 0.75), 10)} size={64} />
          <Label p={MAIN([2.4, -2.6])} text="16π" color={C.primary} size={72} opacity={ease(f, at(scene, 3, 0.15), 10)} />
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center', ...fadeUp(f, 0) }}>
        <div style={{ background: C.bg, borderRadius: 24, padding: '0 30px', fontSize: 84, fontWeight: 900, color: C.primary }}>Follow the center!</div>
      </div>
      <div style={{ ...chip, ...readout(-1, at(scene, 1, 0.1), zout) }}>
        <div style={box(C.amber)}>2 from the hoop</div>
      </div>
      <div style={{ ...chip, ...readout(-1, zout + 6, turn(1)) }}>
        <div style={box(C.primary)}>path radius 10 − 2 = 8</div>
      </div>
      {range(4).map((k) => (
        <div key={k} style={{ ...chip, ...readout(k + 1, turn(k + 1), k < 3 ? turn(k + 2) : 99999) }}>
          <div style={box(C.violet)}>center moved {4 * (k + 1)}π</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1195, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.6)), opacity: ease(f, at(scene, 2, 0.6), 8) * fadeTo(f, at(scene, 3, 0.55), 0, 6) }}>
        <Tex tex={'\\text{1 turn} = 4\\pi'} size={66} color={C.red} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1195, display: 'flex', justifyContent: 'center', opacity: ease(f, at(scene, 3, 0.6), 8) }}>
        <Tex tex={'16\\pi \\div 4\\pi = \\;?'} size={66} />
      </div>
    </>
  );
};

/** The answer, the trap (the dot's five touches), then the CTA pill over the same hoop and ring as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.6);
  const chime = at(scene, 0, 0.97);
  const cta = at(scene, 2);
  const tail = fadeTo(f, cta, 0, 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="4" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>full turns</span>
        </div>
      </div>
      <Stage>
        <Rolling d={TAU} ghosts ghostOpacity={ease(f, hit, 8) * tail} m={MAIN} unit={MU} />
        <Touches start={at(scene, 1, 0.45)} gap={5} opacity={tail} />
      </Stage>
      <Text x={540} y={1256} w={900} size={54} weight={900} color={C.red} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.05)), opacity: ease(f, at(scene, 1, 0.05), 10) * tail }}>
        5 = dot touches, not turns
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1195, display: 'flex', justifyContent: 'center', opacity: ease(f, 4, 8) * fadeTo(f, at(scene, 1), 0, 8) }}>
        <Tex tex={f >= hit ? '16\\pi \\div 4\\pi = \\color{#21c45d}{4}' : '16\\pi \\div 4\\pi'} size={66} />
      </div>
      <CtaPill start={cta} y={1210} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      {range(5).filter((k) => k % 2 === 0).map((k) => <Sfx key={k} at={at(scene, 1, 0.45) + k * 5} src={SFX.click} volume={0.22} />)}
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, center: Center, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

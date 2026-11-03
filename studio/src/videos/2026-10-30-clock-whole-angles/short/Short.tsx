import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, Clock, SLUG, hourAt, minAt, smaller, tw } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (29), question, comment bait, the "watch each hand" aha with a zoom onto the
// hour hand and a chip readout, then the reveal over the same 1:00 clock the hook opens on (clean loop).

const CHOICES = ['12', '15', '29', '30', '60'];
const CX = 540;
const CY = 790;
const R = 280;
const before = -100;

/** The big 1:00 clock: the hook's first frame and the reveal's last frame. */
const HomeClock: React.FC = () => (
  <Stage>
    <Clock cx={CX} cy={CY} R={R} hour={hourAt(1, 0)} min={0} />
  </Stage>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #29</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>29</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${CX}px ${CY}px`}>
        <HomeClock />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Times <b style={{ color: C.primary }}>1:00, 1:01, …, 1:59</b>. How many have a <b style={{ color: C.violet }}>smaller angle</b> between the hands that is a <b style={{ color: C.blue }}>whole number</b> of degrees?
      </div>
      <Stage>
        <Clock cx={CX} cy={835} R={165} hour={hourAt(1, 0)} min={0} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1030, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} />
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

type ChipDef = { text: string; ok: boolean; on: number; ring?: number };

/** Four big value chips under the clock, one per minute 1:00…1:03, with the time under each. */
const Chips: React.FC<{ chips: ChipDef[]; opacity?: number }> = ({ chips, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top: 1105, width: 860, display: 'flex', justifyContent: 'center', gap: 20, opacity }}>
      {chips.map((c, i) => {
        const o = ease(f, c.on, 8);
        const col = c.ok ? C.green : C.red;
        const ring = c.ring ?? 0;
        return (
          <div key={i} style={{ width: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: o }}>
            <div style={{ width: 200, boxSizing: 'border-box', textAlign: 'center', background: c.ok ? 'rgba(33,196,93,0.18)' : 'rgba(239,67,67,0.15)', border: `5px solid ${col}`, color: col, borderRadius: 22, padding: '6px 0', fontSize: 64, fontWeight: 900, transform: `scale(${(1 - 0.3 * (1 - o)) * (1 + 0.1 * ring)})`, boxShadow: ring > 0 ? `0 0 0 ${8 * ring}px ${col}55` : 'none' }}>
              {c.text}
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>1:0{i}</div>
          </div>
        );
      })}
    </div>
  );
};

/** The aha: the minute hand is always whole, the hour hand is a half on odd minutes, so the angle is whole every other minute. */
const Hands: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const steps = (i: number, ts: number[]) => ts.map((t, k) => [l(i, t), k + 1] as [number, number]);
  const s0 = steps(0, [0.3, 0.48, 0.66]);
  const s1 = steps(1, [0.5, 0.66, 0.82]);
  const s3 = steps(3, [0.42, 0.57, 0.72]);
  // minutes past one: 0→3 on line 0, back to 1:00 and 0→3 again on line 1, held on line 2, 0→3 in steps on line 3
  const m = f < l(1) ? tw(f, 0, s0, 8) : f < l(3) ? tw(f, 0, s1, 8) : tw(f, 0, s3, 5);
  const phase = f < l(1) ? 0 : f < l(2) ? 1 : f < l(3) ? 2 : 3;
  const zoomIn = l(1, 0.08);
  const zoomOut = l(3);
  const zoom = 1 + 0.5 * ease(f, zoomIn, 12) - 0.5 * ease(f, zoomOut, 10);
  const tip = [CX + R * 0.5 * Math.sin(Math.PI / 6), CY - R * 0.5 * Math.cos(Math.PI / 6)];
  const mi = Math.round(m);
  const settled = Math.abs(m - mi) < 0.02;
  const w = smaller(hourAt(1, mi), minAt(mi));
  const deg = Math.round(w.sweep * 10) / 10;
  const whole = Number.isInteger(deg);
  const wedgeOn = phase === 3 && settled ? ease(f, s3.find(([fr, k]) => k === mi)?.[0] ?? l(3), 6) : 0;
  const oddPulse = (t: number) => (phase === 2 ? Math.sin(Math.min(1, Math.max(0, (f - l(2, t)) / 14)) * Math.PI) : 0);

  const minChips: ChipDef[] = ['0°', '6°', '12°', '18°'].map((text, k) => ({ text, ok: true, on: k === 0 ? l(0, 0.12) : s0[k - 1][0] }));
  const hourChips: ChipDef[] = ['30°', '30.5°', '31°', '31.5°'].map((text, k) => ({
    text, ok: k % 2 === 0, on: k === 0 ? l(1, 0.35) : s1[k - 1][0],
    ring: phase === 2 ? (k % 2 === 1 ? oddPulse(0.05) + (k === 1 ? oddPulse(0.42) : 0) : oddPulse(0.7)) : 0,
  }));
  const angChips: ChipDef[] = ['30°', '24.5°', '19°', '13.5°'].map((text, k) => ({ text, ok: k % 2 === 0, on: k === 0 ? l(3, 0.05) : s3[k - 1][0] }));
  const chips = phase === 0 ? minChips : phase === 3 ? angChips : hourChips;

  const read = (start: number, end: number) => ease(f, start, 8) * fadeTo(f, end, 0, 6);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[...s0, ...s1, ...s3].map(([fr], i) => <Sfx key={i} at={fr} src={SFX.click} volume={0.26} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l(2, 0.05)} src={SFX.click} volume={0.24} />
      <Sfx at={l(2, 0.7)} src={SFX.click} volume={0.24} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 74, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: read(0, l(1)) }}>
          Minute hand: <span style={{ color: C.green }}>+6°</span> a minute
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(1), l(2)) }}>
          Hour hand: <span style={{ color: C.violet }}>+½°</span> a minute
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(2), l(3)) }}>
          <span style={{ color: C.red }}>odd → half</span>
          <span style={{ opacity: ease(f, l(2, 0.7), 8) }}>
            {' '}· <span style={{ color: C.green }}>even → whole</span>
          </span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(3), l(3, 0.42)) }}>
          whole − half = <span style={{ color: C.red }}>not whole</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l(3, 0.42), 8) }}>
          <span style={{ color: C.green }}>Whole</span> every other minute!
        </div>
      </div>

      {/* the clock, zoomed onto the hour hand's tip on lines 1–2 and clipped so it never covers the chips */}
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(400px 0 820px 0)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${tip[0]}px ${tip[1]}px` }}>
          <Stage>
            <Clock
              cx={CX} cy={CY} R={R} hour={hourAt(1, m)} min={minAt(m)}
              wedge={wedgeOn > 0 ? { ...w, color: whole ? C.green : C.red, op: wedgeOn } : null}
              label={wedgeOn > 0 ? { text: `${deg}°`, color: whole ? C.green : C.red, at: w.from + w.sweep / 2, op: wedgeOn } : null}
            />
          </Stage>
        </div>
      </div>

      <Chips chips={chips} />
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same 1:00 clock the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="30" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>times</span>
        </div>
      </div>
      <HomeClock />
      <Text x={490} y={1090} w={860} size={60} weight={900} color={C.green} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.2)), opacity: ease(f, at(scene, 0, 0.2), 14) * fadeTo(f, at(scene, 1), 0, 8) }}>
        even minutes 1:00 … 1:58
      </Text>
      <Text x={490} y={1090} w={860} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.08))}>
        29 forgets 1:00
      </Text>
      <CtaPill start={at(scene, 2)} y={1185} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, hands: Hands, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

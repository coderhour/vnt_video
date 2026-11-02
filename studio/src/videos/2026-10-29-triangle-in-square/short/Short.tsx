import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage, XMark } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BEST, CHIME, CHOICES, FLAT, Label, Ring, SLUG, Square, TICK, fitSide, plane, tri } from '../Composition';

export { SLUG };

// The big working square: 640 px, bottom-left at (220, 1180), so it spans y 540…1180.
const BIG = plane(220, 1180, 640);

const Title: React.FC<{ children: React.ReactNode; start?: number }> = ({ children, start = 0 }) => {
  const f = useCurrentFrame();
  return (
    <Text x={540} y={300} w={980} size={76} weight={900} align="center" style={start > 0 ? fadeUp(f, start) : undefined}>
      {children}
    </Text>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 1, 0.15);
  return (
    <>
      <Title>
        Biggest <span style={{ color: C.violet }}>triangle</span> in a square?
      </Title>
      <Stage>
        <Square at={BIG} />
        <Poly pts={FLAT.map(BIG)} color={C.primary} fill={C.primary} progress={ease(f, at(scene, 0, 0.55), 12)} opacity={fadeTo(f, nope + 18, 0.3)} />
        <XMark at={[BIG([0.5, 0.35])[0], BIG([0.5, 0.35])[1]]} size={120} opacity={ease(f, nope, 8)} />
        <Poly pts={BEST.map(BIG)} color={C.violet} fill={C.violet} width={8} progress={ease(f, nope + 18, 16)} />
      </Stage>
      <Text x={540} y={1215} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, nope)}>
        NOT the biggest!
      </Text>
    </>
  );
};

const QSQ = plane(390, 900, 300);

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Square with <b style={{ color: C.primary }}>side 1</b>. Largest <b style={{ color: C.violet }}>equilateral triangle</b> inside: <b>what's its area?</b>
      </div>
      <Stage>
        <Square at={QSQ} />
        <Label p={[QSQ([0.5, 0])[0], 900 + 40]} text="1" opacity={mark} />
        <Label p={[QSQ([1, 0])[0] + 36, QSQ([0, 0.5])[1]]} text="1" opacity={mark} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={48} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} mark={ease(f, at(scene, 0, 0.3), 10)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} mark={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Turn: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // L0: pin; L0 end → L1 end: sweep 0 → 30°; L2: come back to the peak at 15°.
  const sweep = [at(scene, 0, 0.75), at(scene, 1, 0.95)] as const;
  const back = at(scene, 2, 0.05);
  const a = f < back ? interpolate(f, sweep, [0, 30], clamp) : interpolate(f, [back, back + 40], [30, 15], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const s = fitSide(a);
  const touch = ease(f, at(scene, 2, 0.6), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', gap: 70, fontSize: 64, fontWeight: 900, ...fadeUp(f, at(scene, 1)) }}>
        <div>
          turn <span style={{ color: C.amber, display: 'inline-block', width: 120 }}>{Math.round(a)}°</span>
        </div>
        <div>
          side <span style={{ color: C.violet }}>{s.toFixed(3)}</span>
        </div>
      </div>
      <Stage>
        <Square at={BIG} />
        <line x1={BIG([0, 0])[0]} y1={BIG([0, 0])[1]} x2={BIG([1, 1])[0]} y2={BIG([1, 1])[1]} stroke={C.muted} strokeWidth={5} strokeDasharray="16 14" opacity={ease(f, at(scene, 2, 0.5), 12)} />
        <Poly pts={tri(a, s).map(BIG)} color={C.violet} fill={C.violet} width={8} progress={ease(f, 4, 14)} />
        <circle cx={BIG([0, 0])[0]} cy={BIG([0, 0])[1]} r={22} fill={C.amber} opacity={ease(f, at(scene, 0, 0.4), 10)} />
        <Ring p={BIG(BEST[1])} color={C.green} opacity={touch} />
        <Ring p={BIG(BEST[2])} color={C.green} opacity={touch} />
      </Stage>
      <Text x={540} y={1215} w={900} size={58} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>
        {f < at(scene, 2, 0.3) ? 'Pin a corner, then turn' : <span style={{ color: C.green }}>Biggest at 15°</span>}
      </Text>
    </>
  );
};

const RSQ = plane(330, 900, 420);

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.45);
  const chime = at(scene, 0, 1);
  const bars = ease(f, at(scene, 1, 0.1), 24);
  const Bar: React.FC<{ y: number; label: string; pct: number; color: string; start: number }> = ({ y, label, pct, color, start }) => (
    <div style={{ position: 'absolute', left: 90, top: y, width: 860, display: 'flex', alignItems: 'center', gap: 20, fontSize: 46, fontWeight: 900, ...fadeUp(f, start) }}>
      <div style={{ width: 150, color }}>{label}</div>
      <div style={{ height: 64, width: 560 * (pct / 50) * bars, background: color, borderRadius: 16 }} />
      <div style={{ color }}>{pct}%</div>
    </div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Area =</span>
          <Tex tex="2\sqrt{3}-3" size={84} color="#fff" />
        </div>
      </div>
      <Stage>
        <Square at={RSQ} />
        <Poly pts={FLAT.map(RSQ)} color={C.primary} fill={C.primary} opacity={0.35 * bars} progress={1} />
        <Poly pts={BEST.map(RSQ)} color={C.violet} fill={C.violet} width={8} />
      </Stage>
      <Bar y={1000} label="Tilted" pct={46} color={C.violet} start={at(scene, 1, 0.05)} />
      <Bar y={1100} label="Flat" pct={43} color={C.primary} start={at(scene, 1, 0.5)} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:01" bullets={['The exact area, two ways', 'Every trap explained', 'A harder one to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, turn: Turn, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

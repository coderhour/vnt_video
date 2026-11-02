import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, PIV, PMark, Ring, SLUG, Sq, TICK, Trail } from '../Composition';

export { SLUG };

const mkm = (ox: number, oy: number, u: number) => (p: Pt): Pt => [ox + u * p[0], oy - u * p[1]];

const Board: React.FC<{ m: (p: Pt) => Pt; u: number; labels?: number }> = ({ m, u, labels = 0 }) => {
  const [x0, y0] = m([0, 2]);
  return (
    <g>
      <rect x={x0} y={y0} width={2 * u} height={2 * u} fill="#e4e7ef" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <text x={x0 + u} y={y0 + 2 * u + 46} textAnchor="middle" fontSize={50} fontWeight={900} fill={C.ink} opacity={labels} fontFamily="Nunito, sans-serif">2</text>
      <text x={x0 - 34} y={y0 + u + 16} textAnchor="middle" fontSize={50} fontWeight={900} fill={C.ink} opacity={labels} fontFamily="Nunito, sans-serif">2</text>
    </g>
  );
};

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

// ---- hook ----
const hm = mkm(370, 1120, 170);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const T = interpolate(f, [t(0, 0.5), t(1, 0.55)], [0, 2], clamp);
  return (
    <>
      <Title>
        Where does <span style={{ color: C.primary }}>P</span> travel?
      </Title>
      <Stage>
        <Board m={hm} u={170} />
        <Trail m={hm} to={T} width={13} />
        <Sq m={hm} T={T} />
        <PMark m={hm} T={T} scale={1.3} label={1.2} />
      </Stage>
      <Text x={540} y={1260} w={900} size={52} weight={900} color={C.violet} align="center" style={fadeUp(f, t(1, 0.6))}>
        A sneaky move hides here…
      </Text>
    </>
  );
};

// ---- question ----
const qm = mkm(330, 1040, 90);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 46, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        A small square (side <b style={{ color: C.primary }}>1</b>) rolls clockwise around a fixed square (side <b>2</b>). How long is the path of corner <b style={{ color: C.primary }}>P</b> until it is first back home?
      </div>
      <Stage>
        <Board m={qm} u={90} labels={1} />
        <Sq m={qm} T={0} />
        <PMark m={qm} T={0} />
      </Stage>
      <div style={{ position: 'absolute', left: 40, top: 1110, width: 900, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={46} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={850} tick={TICK} />
  </>
);

// ---- aha: move by move ----
const CHIPS: { r: string; arc: string; color: string }[] = [
  { r: 'r=1', arc: '\\tfrac{\\pi}{2}', color: C.primary },
  { r: 'r=\\sqrt2', arc: '\\sqrt2\\,\\pi', color: C.violet },
  { r: 'r=1', arc: '\\tfrac{\\pi}{2}', color: C.primary },
  { r: 'r=0', arc: '0', color: C.muted },
];

const Roll: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const m = mkm(390, 1070, 150);
  const T = interpolate(
    f,
    [t(0, 0.7), t(1, 0.15), t(1, 0.9), t(2, 0.1), t(2, 0.68), t(2, 0.72), t(2, 0.98), t(3, 0.05), t(3, 0.4), t(3, 0.45), t(3, 0.98)],
    [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 8],
    clamp,
  );
  const k = Math.min(7, Math.floor(T + 1e-6));
  const flipNow = T > 3.05 && T < 4;
  return (
    <>
      <Title>{f < t(1, 0) ? <>One move at a time</> : <>Add the arcs</>}</Title>
      <div style={{ position: 'absolute', left: 40, top: 395, width: 1000, display: 'flex', gap: 14, alignItems: 'center' }}>
        {CHIPS.map((c, i) => {
          const o = T >= i ? 1 : 0;
          return (
            <div key={i} style={{ width: 188, textAlign: 'center', background: C.card, borderRadius: 18, border: `5px solid ${c.color}`, padding: '4px 4px', opacity: ease(f, 0, 1) * o, transform: `scale(${0.8 + 0.2 * o})`, boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
              <div><Tex tex={c.r} size={40} color={c.color} /></div>
              <div><Tex tex={c.arc} size={56} color={c.color} /></div>
            </div>
          );
        })}
        <div style={{ fontSize: 60, fontWeight: 900, color: C.green, opacity: ease(f, t(3, 0.5), 10) }}>×2</div>
      </div>
      <Stage>
        <Board m={m} u={150} />
        <Trail m={m} to={T} width={14} />
        <Sq m={m} T={T} />
        <PMark m={m} T={T} scale={1.2} label={1.1} />
        {T < 4 && <Ring m={m} k={k} f={f} opacity={1} />}
      </Stage>
      {flipNow && (
        <Text x={540} y={1245} w={900} size={52} weight={900} color={C.muted} align="center">
          P is the pivot: it stays put
        </Text>
      )}
    </>
  );
};

// ---- reveal ----
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.72);
  const chime = at(scene, 0, 0.9);
  const m = mkm(430, 1060, 130);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>C</span>
          <Tex tex="(2+2\sqrt2)\pi" size={74} color="#fff" />
        </div>
      </div>
      <Stage>
        <Board m={m} u={130} />
        <Trail m={m} to={ease(f, 0, 40) * 8} width={11} />
        <Sq m={m} T={0} />
        <PMark m={m} T={0} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1245, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Tex tex="\approx 15.2" size={58} color={C.muted} />
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:59" bullets={['Every move explained', 'Four traps to dodge', 'Follow the center: challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, roll: Roll, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

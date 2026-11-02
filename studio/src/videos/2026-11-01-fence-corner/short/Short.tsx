import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, XMark } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BEST, CHIME, LOP, Region, SLUG, SQB, TICK, Walls, mk, octOf, poly } from '../Composition';

export { SLUG };

const CHOICES = ['36', '18+18\\sqrt{2}', '36\\sqrt{2}', '36+18\\sqrt{2}', '72+72\\sqrt{2}'];
const VIOLET = C.violet;

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

// ---- hook ----
const hm = mk(170, 1190, 80);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const nope = t(1, 0.5);
  const sq = 1 - ease(f, nope + 14, 10) * 0.7;
  return (
    <>
      <Title>
        Best <span style={{ color: C.primary }}>fence</span> in a corner?
      </Title>
      <Stage>
        <Walls m={hm} len={9.5} />
        <Region m={hm} s={SQB} opacity={sq} />
        <Region m={hm} s={BEST} fence={VIOLET} fill={VIOLET} width={12} draw={ease(f, nope + 18, 18)} opacity={ease(f, nope + 18, 8)} />
        <XMark at={hm([4.2, 4.2])} size={110} opacity={ease(f, nope, 8)} />
      </Stage>
      <Text x={540} y={1245} w={900} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, nope)}>
        Square: NOT the biggest!
      </Text>
      <Text x={640} y={470} w={300} size={46} weight={900} color={C.muted} style={fadeUp(f, 4)}>
        fence = 12
      </Text>
    </>
  );
};

// ---- question ----
const qm = mk(150, 1020, 44);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Two walls meet at a right angle. A <b style={{ color: C.primary }}>two-piece fence</b> of total length <b>12</b> joins them. <b style={{ color: VIOLET }}>Largest area enclosed?</b>
      </div>
      <Stage>
        <Walls m={qm} len={10.5} />
        <Region m={qm} s={LOP} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={48} />
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

// ---- aha: mirror the walls into an octagon ----
const mm = mk(540, 830, 50);

const Mirror: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const q2 = ease(f, t(1, 0.2), 14);
  const q34 = ease(f, t(1, 0.55), 14);
  const walls = 1 - ease(f, t(1, 0.6), 14);
  const whole = ease(f, t(2, 0.2), 14);
  const reg = ease(f, t(3, 0.3), 14);
  const oct = octOf(BEST).map(mm);
  return (
    <>
      <Title>{f < t(1, 0) ? <>Walls are <span style={{ color: VIOLET }}>mirrors</span></> : f < t(3, 0) ? <>Reflect it!</> : <>The regular octagon</>}</Title>
      <Stage>
        <Walls m={mm} len={9} opacity={walls} />
        <Region m={mm} s={BEST} fence={VIOLET} fill={VIOLET} fillOp={0.28} width={12} />
        <Region m={mm} s={BEST} sx={-1} fence={VIOLET} fill={VIOLET} fillOp={0.14} width={12} opacity={q2} />
        <Region m={mm} s={BEST} sy={-1} fence={VIOLET} fill={VIOLET} fillOp={0.14} width={12} opacity={q34} />
        <Region m={mm} s={BEST} sx={-1} sy={-1} fence={VIOLET} fill={VIOLET} fillOp={0.14} width={12} opacity={q34} />
        <path d={poly(oct)} fill="none" stroke={C.green} strokeWidth={14} strokeLinejoin="round" opacity={reg} />
        {oct.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={13} fill={C.green} opacity={reg} />
        ))}
      </Stage>
      <div style={{ opacity: whole * (1 - reg) }}>
        <Text x={540} y={1245} w={900} size={52} weight={900} align="center">
          perimeter <span style={{ color: VIOLET }}>48</span>, area <span style={{ color: VIOLET }}>4×</span> ours
        </Text>
      </div>
      <Text x={540} y={1245} w={900} size={52} weight={900} color={C.green} align="center" style={{ opacity: reg }}>
        8 equal sides of 6
      </Text>
    </>
  );
};

// ---- reveal ----
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.83);
  const chime = at(scene, 0, 0.92);
  const bars = ease(f, at(scene, 1, 0.1), 26);
  const Bar: React.FC<{ y: number; label: string; v: number; color: string; start: number }> = ({ y, label, v, color, start }) => (
    <div style={{ position: 'absolute', left: 70, top: y, width: 860, display: 'flex', alignItems: 'center', gap: 18, fontSize: 48, fontWeight: 900, ...fadeUp(f, start) }}>
      <div style={{ width: 170, color }}>{label}</div>
      <div style={{ height: 70, width: (v / 43.5) * 480 * bars, background: color, borderRadius: 16 }} />
      <div style={{ color }}>{(v * bars).toFixed(1)}</div>
    </div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>B</span>
          <Tex tex="18+18\sqrt{2}" size={78} color="#fff" />
        </div>
      </div>
      <Stage>
        <Region m={mk(300, 800, 36)} s={BEST} fence={VIOLET} fill={VIOLET} fillOp={0.3} width={10} opacity={ease(f, at(scene, 0, 0.3), 10)} />
      </Stage>
      <Bar y={880} label="Best" v={43.5} color={VIOLET} start={at(scene, 1, 0.05)} />
      <Bar y={990} label="Square" v={36} color={C.primary} start={at(scene, 1, 0.4)} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:12" bullets={['Two ways to solve it', 'Every trap explained', 'A straight-fence challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, mirror: Mirror, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

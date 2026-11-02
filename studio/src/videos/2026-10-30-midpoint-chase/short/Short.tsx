import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Dot, GREY, Jump, NLine, SLUG, TICK, mapper } from '../Composition';

export { SLUG };

const m = mapper(0, 64, 130, 880);

/** The first four points on a number line, with their jumps. `t(i)` is the frame each point (i = 1…4) appears. */
const Line4: React.FC<{ y: number; t: (i: number) => number; showVals?: boolean }> = ({ y, t, showVals = true }) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <NLine m={m} x0={130} x1={880} y={y} lo={0} hi={64} step={8} major={16} />
      <Jump a={m(0)} b={m(64)} y={y} p={ease(f, t(2) - 6, 20)} hMax={190} />
      <Jump a={m(64)} b={m(32)} y={y} p={ease(f, t(3) - 6, 18)} hMax={150} />
      <Jump a={m(32)} b={m(48)} y={y} p={ease(f, t(4) - 6, 18)} hMax={90} />
      {[0, 64, 32, 48].map((v, i) => (
        <Dot key={v} x={m(v)} y={y} n={[1, 2, 3, 4][i]} color={C.primary} op={ease(f, t(i + 1), 8)} val={showVals ? String(v) : undefined} />
      ))}
    </Stage>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        The <span style={{ color: C.violet }}>midpoint</span> chase
      </Text>
      <Line4 y={720} t={(i) => [0, 6, at(scene, 0, 0.55), at(scene, 1, 0.1), at(scene, 1, 0.4)][i]} />
      <Text x={540} y={1060} w={900} size={80} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.6))}>
        P<sub style={{ fontSize: 48 }}>10</sub> = ?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>P1 = 0</b>, <b style={{ color: C.primary }}>P2 = 64</b>. Each new point is the <b style={{ color: C.violet }}>midpoint</b> of the two before. <b>Where is P10?</b>
      </div>
      <div style={{ opacity: mark }}>
        <Line4 y={800} t={() => -100} />
      </div>
      <div style={{ position: 'absolute', left: 40, top: 1020, width: 900, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 14px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 28, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 42, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} mark={ease(f, at(scene, 0, 0.3), 10)} />;
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

// jump (signed, as TeX), point label, value (TeX)
const ROWS: { j: string; right: boolean; n: number; v: string }[] = [
  { j: '+64', right: true, n: 2, v: '64' },
  { j: '-32', right: false, n: 3, v: '32' },
  { j: '+16', right: true, n: 4, v: '48' },
  { j: '-8', right: false, n: 5, v: '40' },
  { j: '+4', right: true, n: 6, v: '44' },
  { j: '-2', right: false, n: 7, v: '42' },
  { j: '+1', right: true, n: 8, v: '43' },
  { j: '-\\tfrac12', right: false, n: 9, v: '42\\tfrac12' },
  { j: '+\\tfrac14', right: true, n: 10, v: '42\\tfrac34' },
];
const TOP = 430;
const H = (i: number) => (i >= 7 ? 92 : 74);
const rowTop = (i: number) => TOP + ROWS.slice(0, i).reduce((a, _, k) => a + H(k), 0);

const Table: React.FC<{ times: number[]; hi?: number }> = ({ times, hi = 0 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {ROWS.map((r, i) => {
        const last = i === ROWS.length - 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 80, top: rowTop(i), width: 720, height: H(i) - 2, display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px', borderRadius: 20,
              background: last && hi > 0 ? `rgba(33,196,93,${0.18 * hi})` : 'transparent', ...fadeUp(f, times[i], 10),
            }}
          >
            <div style={{ width: 190, display: 'flex', justifyContent: 'flex-end' }}>
              <Tex tex={r.j} size={i >= 7 ? 70 : 54} color={r.right ? C.primary : C.violet} />
            </div>
            <span style={{ fontSize: 44, fontWeight: 900, color: C.muted }}>{r.right ? '→' : '←'}</span>
            <Tex tex={`P_{${r.n}} = ${r.v}`} size={i >= 7 ? 66 : 56} color={last && hi > 0 ? C.green : C.ink} />
          </div>
        );
      })}
    </>
  );
};

const Jumps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const times = [at(scene, 0, 0.35), at(scene, 0, 0.6), at(scene, 0, 0.85), at(scene, 2, 0.1), at(scene, 2, 0.25), at(scene, 2, 0.38), at(scene, 2, 0.5), at(scene, 2, 0.68), at(scene, 2, 0.88)];
  const flip = at(scene, 1, 0.1);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} color={C.primary} align="center" style={{ opacity: fadeTo(f, flip, 0, 8) }}>
        Watch the jumps
      </Text>
      <Text x={540} y={300} w={980} size={66} weight={900} color={C.violet} align="center" style={fadeUp(f, flip)}>
        Half as big, and flip!
      </Text>
      <Table times={times} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.7);
  const chime = at(scene, 0, 1);
  const hi = ease(f, at(scene, 0, 0.3), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '6px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>P10 =</span>
          <Tex tex="42\tfrac{3}{4}" size={84} color="#fff" />
        </div>
      </div>
      <Table times={ROWS.map(() => -100)} hi={hi} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:20" bullets={['Two ways to find it', 'Every trap explained', 'A new chase to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, jumps: Jumps, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

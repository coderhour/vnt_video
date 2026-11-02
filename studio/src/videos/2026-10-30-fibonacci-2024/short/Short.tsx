import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SEQ84, SLUG, TICK, XC, YC } from '../Composition';

export { SLUG };

const TC = C.amber; // T = x + y

/** The 10 terms as a 5 × 2 grid of chips (x 70…910). */
const Chips: React.FC<{ y: number; vals: (string | null)[]; colors?: (string | undefined)[]; start: (i: number) => number; hi?: number; size?: number }> = ({ y, vals, colors = [], start, hi, size = 54 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {vals.map((v, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const s = Math.max(0, pop(f, start(i)));
        if (v === null || s <= 0) return null;
        const h = hi === i;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 70 + col * 176, top: y + row * 150, width: 160, height: 120, transform: `scale(${s})`,
              background: h ? C.green : C.card, color: h ? '#fff' : colors[i] ?? C.ink, borderRadius: 22, boxShadow: '0 4px 14px rgba(30,40,80,0.09)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900,
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 800, color: h ? '#fff' : C.muted, lineHeight: 1 }}>term {i + 1}</span>
            {v}
          </div>
        );
      })}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vals = ['x', 'y', 'x+y', '?', '?', '?', '?', '?', '?', '2024'];
  const colors = [XC, YC, TC, ...Array(6).fill(C.muted), C.ink];
  return (
    <>
      <Text x={540} y={300} w={980} size={74} weight={900} align="center">
        Which start reaches <span style={{ color: C.violet }}>2024</span>?
      </Text>
      <Chips y={560} vals={vals} colors={colors} start={() => -100} hi={undefined} />
      <Text x={540} y={900} w={900} size={60} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>
        each term = the two before added
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Positive whole numbers, each the <b style={{ color: C.primary }}>sum of the two before</b>. Term 10 is <b style={{ color: C.violet }}>2024</b>. Largest <b>first + second</b>?
      </div>
      <Chips y={610} vals={['x', 'y', 'x+y', '', '', '', '', '', '', '2024']} colors={[XC, YC, TC, ...Array(6).fill(C.muted), C.ink]} start={() => -100} size={50} />
      <div style={{ position: 'absolute', left: 60, top: 960, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${c}`} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Row: React.FC<{ y: number; t: number; left: string; right: string; ok?: boolean; start: number }> = ({ y, t, left, right, ok, start }) => {
  const f = useCurrentFrame();
  const mark = ease(f, start + 14, 8);
  return (
    <div style={{ position: 'absolute', left: 60, top: y, width: 860, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <div style={{ width: 230, fontSize: 56, fontWeight: 900, color: TC, textAlign: 'right' }}>T = {t}</div>
      <div style={{ fontSize: 56, fontWeight: 900 }}>→</div>
      <Tex tex={right} size={60} color={ok ? C.green : C.ink} />
      <div style={{ opacity: mark, fontSize: 64, fontWeight: 900, color: ok ? C.green : C.red }}>{ok ? '✓' : '✗'}</div>
      <span style={{ display: 'none' }}>{left}</span>
    </div>
  );
};

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 70, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1) }}>
          Let <span style={{ color: TC }}>T = x + y</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 10) * fadeTo(f, l2) }}>
          Term 10 in terms of <span style={{ color: TC }}>T</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 10) }}>
          Count <span style={{ color: TC }}>T</span> down from 95
        </div>
      </div>
      <Chips y={430} vals={['x', 'y', 'x+y']} colors={[XC, YC, TC]} start={(i) => at(scene, 0, 0.15 + i * 0.3)} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 590, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.45)) }}>
        <Tex tex={'a_{10} = 21\\color{#f59f0a}{T} + 13\\color{#7b61ff}{y}'} size={86} />
      </div>
      <div style={{ position: 'absolute', left: 60, top: 720, width: 860, textAlign: 'center', fontSize: 46, fontWeight: 800, color: C.muted, ...fadeUp(f, l2 + 10) }}>
        leftover must be a multiple of 13
      </div>
      <Row y={830} t={95} left="95" right={'29'} start={at(scene, 3, 0.02)} />
      <div style={{ position: 'absolute', left: 60, top: 945, width: 860, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 3, 0.35)) }}>⋮</div>
      <Row y={1030} t={84} left="84" right={'260 = 13 \\times 20'} ok start={at(scene, 3, 0.55)} />
      <div style={{ display: 'none' }}>{l3}</div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.5);
  const chime = at(scene, 1, 0.97);
  const vals = SEQ84.map((n) => `${n}`);
  const start = (i: number) => (i < 2 ? at(scene, 0, 0.45 + i * 0.2) : at(scene, 1, 0.02 + (i - 2) * 0.06));
  return (
    <>
      <Text x={540} y={310} w={980} size={66} weight={900} align="center" style={{ opacity: ease(f, at(scene, 0, 0.2), 10) * fadeTo(f, hit - 4, 0, 6) }}>
        260 = 13 × <span style={{ color: YC }}>20</span>
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>64 + 20 =</span>
          <Tex tex="84" size={96} color="#fff" />
        </div>
      </div>
      <Chips y={560} vals={vals} colors={[XC, YC, undefined]} start={start} hi={f >= hit ? 2 : undefined} size={48} />
      <Text x={540} y={900} w={900} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.4))}>
        …and term 10 lands on 2024
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:50" bullets={['Where 21 and 13 come from', 'A second, faster way', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, count: Count, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

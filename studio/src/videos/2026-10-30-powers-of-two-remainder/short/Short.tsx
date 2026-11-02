import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Pill, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Chip, SLUG, TICK, TOTAL } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Mid: React.FC<{ y: number; start: number; tex: string; size?: number; color?: string }> = ({ y, start, tex, size = 64, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0, 0.6);
  const shown = Math.max(0, Math.min(TOTAL.length, Math.floor((f - t0) / 1.3)));
  const digits = (s: string, from: number) => s.split('').map((ch, i) => <span key={i} style={{ opacity: from + i < shown ? 1 : 0 }}>{ch}</span>);
  return (
    <>
      <Title>
        Keep <span style={{ color: C.primary }}>doubling</span>!
      </Title>
      <Mid y={470} start={0} tex="1 + 2 + 4 + 8 + 16 + \cdots" size={64} />
      <Pill x={540 - 190} y={590} color={C.violet} style={{ width: 380, textAlign: 'center', boxSizing: 'border-box', fontSize: 48 }}>
        100 numbers
      </Pill>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 740, textAlign: 'center', fontSize: 70, fontWeight: 900, letterSpacing: 2, lineHeight: 1.3 }}>
        <div><span style={{ color: C.muted, opacity: f >= t0 ? 1 : 0 }}>= </span>{digits(TOTAL.slice(0, 16), 0)}</div>
        <div>{digits(TOTAL.slice(16), 16)}</div>
      </div>
      <Pill x={540 - 200} y={980} color={C.amber} style={{ ...fadeUp(f, at(scene, 1, 0.25)), width: 400, textAlign: 'center', boxSizing: 'border-box', fontSize: 48 }}>
        31 digits!
      </Pill>
      <Text x={540} y={1120} w={900} size={64} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 1, 0.7))}>
        Remainder ÷ 7?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        What is the <b style={{ color: C.primary }}>remainder</b> when this sum is <b style={{ color: C.violet }}>divided by 7</b>?
      </div>
      <Mid y={620} start={0} tex="1 + 2 + 4 + 8 + \cdots + 2^{99}" size={64} />
      <div style={{ position: 'absolute', left: 60, top: 800, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={56} />
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
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Cell: React.FC<{ k: number; v?: string; r: number; x: number; y: number; start: number; remStart: number; tint?: string }> = ({ k, v, r, x, y, start, remStart, tint }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ ...fadeUp(f, start), width: 270, boxSizing: 'border-box', background: C.card, borderRadius: 22, padding: '12px 0', textAlign: 'center', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', border: `5px solid ${tint ?? 'transparent'}`, whiteSpace: 'nowrap' }}>
        <Tex tex={v ? `2^{${k}} = ${v}` : `2^{${k}}`} size={50} />
      </div>
      <Chip r={r} d={84} style={fadeUp(f, remStart)} />
    </div>
  );
};

const ROW0 = [[0, '1', 1], [1, '2', 2], [2, '4', 4]] as const;
const ROW1 = [[3, '8', 1], [4, '16', 2], [5, '32', 4]] as const;
const CX = (i: number) => 60 + i * 290;

const Cycle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sum = (y: number, start: number) => (
    <Mid y={y} start={start} tex="1 + 2 + 4 = 7 \;\checkmark" size={56} color={C.green} />
  );
  const l3 = at(scene, 3);
  return (
    <>
      <Text x={540} y={300} w={980} size={66} weight={900} align="center" style={fadeUp(f, 0)}>
        Remainders when <span style={{ color: C.violet }}>÷ 7</span>
      </Text>
      {ROW0.map(([k, v, r], i) => (
        <Cell key={k} k={k} v={v} r={r} x={CX(i)} y={400} start={at(scene, 0, 0.15 + i * 0.2)} remStart={at(scene, 0, 0.45 + i * 0.2)} />
      ))}
      {ROW1.map(([k, v, r], i) => (
        <Cell key={k} k={k} v={v} r={r} x={CX(i)} y={690} start={at(scene, 1, 0.1 + i * 0.12)} remStart={at(scene, 1, 0.2 + i * 0.12)} tint={i === 0 ? C.amber : undefined} />
      ))}
      <Text x={540} y={1010} w={900} size={56} weight={900} color={C.amber} align="center" style={{ opacity: ease(f, at(scene, 1, 0.5), 12) * (1 - ease(f, at(scene, 2), 10)) }}>
        8 leaves 1 again: a cycle!
      </Text>
      {sum(580, at(scene, 2, 0.35))}
      {sum(870, at(scene, 2, 0.7))}
      <div style={{ opacity: ease(f, l3, 10) }}>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 960, textAlign: 'center' }}>
          <span style={{ fontSize: 60, fontWeight: 900, color: C.green, ...fadeUp(f, at(scene, 3, 0.05)) }}>33 groups: nothing left</span>
        </div>
        <Mid y={1035} start={at(scene, 3, 0.1)} tex="99 = 33 \times 3" size={52} color={C.muted} />
      </div>
      <Cell k={99} r={1} x={CX(1)} y={1110} start={at(scene, 3, 0.45)} remStart={at(scene, 3, 0.75)} tint={C.amber} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.83);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>Remainder</span>
          <Tex tex="= 1" size={96} color="#fff" />
        </div>
      </div>
      <Text x={540} y={560} w={900} size={64} weight={900} color={C.green} align="center" style={fadeUp(f, hit)}>
        Choice B
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 720, textAlign: 'center', fontSize: 44, fontWeight: 800, color: C.muted, lineHeight: 1.4, ...fadeUp(f, at(scene, 1, 0.1)) }}>
        {TOTAL.slice(0, 16)}
        <br />
        {TOTAL.slice(16)}
      </div>
      <Text x={540} y={900} w={900} size={56} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        A giant sum, a tiny pattern
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:47" bullets={['The cycle, step by step', 'A second way: doubling', 'A divide-by-five challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, cycle: Cycle, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

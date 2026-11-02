import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, CIRC, SLUG, TICK } from '../Composition';

export { SLUG };

const D = [4, 6, 9];
const MULTI = [12, 18, 24, 36];
const CELL = 120;
const GAP = 10;
const GX = 155;
const GY = 420;

const Grid: React.FC<{ lit: (n: number, k: number) => boolean; ring?: (n: number) => number; pulse?: number }> = ({ lit, ring, pulse = 0 }) => (
  <>
    {range(36).map((i) => {
      const n = i + 1;
      const cols = D.map((_, k) => (n % D[k] === 0 && lit(n, k) ? CIRC[k] : null)).filter(Boolean) as string[];
      const bg = cols.length === 0 ? C.card : cols.length === 1 ? cols[0] : `linear-gradient(90deg, ${cols.map((c, j) => `${c} ${(j / cols.length) * 100}% ${((j + 1) / cols.length) * 100}%`).join(', ')})`;
      const r = ring ? ring(n) : 0;
      return (
        <div
          key={n}
          style={{
            position: 'absolute',
            left: GX + (i % 6) * (CELL + GAP),
            top: GY + Math.floor(i / 6) * (CELL + GAP),
            width: CELL,
            height: CELL,
            borderRadius: 24,
            background: bg,
            color: cols.length ? '#fff' : C.muted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            fontWeight: 900,
            boxShadow: '0 4px 14px rgba(30,40,80,0.07)',
            outline: r > 0 ? `${5 + 4 * pulse}px solid ${C.red}` : 'none',
            outlineOffset: 3,
            transform: r > 0 ? `scale(${1 + 0.05 * r})` : undefined,
          }}
        >
          {n}
        </div>
      );
    })}
  </>
);

const Legend: React.FC<{ y: number; op?: number }> = ({ y, op = 1 }) => (
  <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', gap: 20, opacity: op }}>
    {D.map((d, k) => (
      <div key={d} style={{ background: CIRC[k], color: '#fff', borderRadius: 18, padding: '8px 26px', fontSize: 46, fontWeight: 900 }}>
        ×{d}
      </div>
    ))}
  </div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const warn = at(scene, 1, 0.1);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        Multiples of <span style={{ color: CIRC[0] }}>4</span>, <span style={{ color: CIRC[1] }}>6</span> or <span style={{ color: CIRC[2] }}>9</span>?
      </Text>
      <Grid lit={(n) => f >= (n / 36) * 70} />
      <Text x={540} y={1215} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, warn)}>
        Adding is a trap!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; legend?: boolean }> = ({ start, legend = true }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 52, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many whole numbers from <b>1 to 1000</b> are multiples of <b>at least one</b> of <b style={{ color: CIRC[0] }}>4</b>, <b style={{ color: CIRC[1] }}>6</b> and <b style={{ color: CIRC[2] }}>9</b>?
      </div>
      {legend && <Legend y={700} />}
      <div style={{ position: 'absolute', left: 60, top: 860, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 56, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 38 }}>{'ABCDE'[i]}</span>
            {c}
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
      <QuestionBody start={() => -100} legend={false} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Aha: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const one = ease(f, at(scene, 0, 0.55), 10);
  const all = ease(f, at(scene, 1, 0.35), 12);
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  const fix = at(scene, 2, 0.1);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        {f < at(scene, 2) ? <>Counted <span style={{ color: C.red }}>twice</span>!</> : <>Fix the <span style={{ color: C.green }}>overlaps</span></>}
      </Text>
      <Grid lit={() => true} ring={(n) => (n === 12 ? Math.max(one, all) : MULTI.includes(n) ? all : 0)} pulse={pulse} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1215, display: 'flex', justifyContent: 'center', gap: 24 }}>
        <div style={{ ...fadeUp(f, fix), background: C.red, color: '#fff', borderRadius: 20, padding: '8px 28px', fontSize: 50, fontWeight: 900 }}>− overlaps</div>
        <div style={{ ...fadeUp(f, fix + 30), background: C.green, color: '#fff', borderRadius: 20, padding: '8px 28px', fontSize: 50, fontWeight: 900 }}>+ all three</div>
      </div>
      <Text x={540} y={1215} w={900} size={56} weight={900} color={C.red} align="center" style={{ opacity: f < fix ? ease(f, at(scene, 0, 0.55), 10) : 0 }}>
        12 = 4 × 3 = 6 × 2
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.1);
  const chime = at(scene, 1, 0.5);
  const rows: [string, string, string, number][] = [
    ['527', 'add the three counts', C.primary, at(scene, 0, 0.05)],
    ['− 165', 'take away the pairs', C.red, at(scene, 0, 0.45)],
    ['+ 27', 'add back all three', C.green, at(scene, 0, 0.8)],
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 52px', fontSize: 84, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>389 · C</div>
      </div>
      {rows.map(([n, label, color, s], i) => (
        <div key={n} style={{ position: 'absolute', left: 40, top: 560 + i * 200, width: 880, display: 'flex', alignItems: 'center', gap: 36, ...fadeUp(f, s) }}>
          <div style={{ width: 300, textAlign: 'right', fontSize: 92, fontWeight: 900, color }}>{n}</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: C.muted, width: 520 }}>{label}</div>
        </div>
      ))}
      <Text x={540} y={1190} w={900} size={52} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.7))}>
        Most stop at 527 ✗
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:58" bullets={['A Venn diagram, step by step', 'A faster second method', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, aha: Aha, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

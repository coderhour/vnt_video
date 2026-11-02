import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage, XMark } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COLS, LIST, SLUG, TICK, triPts } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const u = 30;
  const shapes: { s: [number, number, number]; x: number; col: string }[] = [
    { s: [7, 8, 9], x: 190, col: C.violet },
    { s: [8, 8, 8], x: 190 + 9 * u + 90, col: C.primary },
  ];
  const bad = ease(f, at(scene, 1, 0.3), 10);
  return (
    <>
      <Title>
        <span style={{ color: C.violet }}>Perimeter 24</span>
      </Title>
      <Stage>
        {shapes.map((t, i) => (
          <Poly key={i} pts={triPts(t.s[0], t.s[1], t.s[2], u, t.x, 700)} progress={1} color={t.col} width={7} fill={t.col} fillOpacity={0.2} />
        ))}
      </Stage>
      <Text x={190 + 4.5 * u} y={730} w={300} size={48} weight={900} color={C.violet} align="center">
        7 + 8 + 9
      </Text>
      <Text x={190 + 9 * u + 90 + 4 * u} y={730} w={300} size={48} weight={900} color={C.primary} align="center">
        8 + 8 + 8
      </Text>
      <Text x={540} y={900} w={900} size={72} weight={900} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        How many triangles?
      </Text>
      <Text x={540} y={1040} w={900} size={56} weight={900} color={C.red} align="center" style={{ opacity: bad, transform: `translateY(${(1 - bad) * 20}px)` }}>
        Most kids miss one or two!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '32px 40px', fontSize: 52, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many different triangles have <b style={{ color: C.violet }}>whole-number sides</b> and a <b style={{ color: C.amber }}>perimeter of 24</b>?
      </div>
      <Text x={540} y={780} w={860} size={48} weight={800} color={C.muted} align="center" style={fadeUp(f, at0(start))}>
        Same three sides count once.
      </Text>
      <div style={{ position: 'absolute', left: 60, top: 940, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 62, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 38 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};
const at0 = (start: (i: number) => number) => start(0) - 10;

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

const U = 10;
const BASE = (i: number) => 800 + i * 150;

const ListScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const strip = [7, 8, 9, 10, 11, 12];
  const x12 = ease(f, at(scene, 0, 0.55), 10);
  const x7 = ease(f, at(scene, 1, 0.45), 10);
  const rowsOn = at(scene, 2, 0.05);
  // each triangle gets its slot in the third line
  let k = 0;
  return (
    <>
      <Title>
        Longest side <span style={{ color: C.violet }}>c</span>
      </Title>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 430, display: 'flex', gap: 14, justifyContent: 'center' }}>
        {strip.map((n) => {
          const out = n === 12 ? x12 : n === 7 ? x7 : 0;
          const col = n >= 8 && n <= 11 ? COLS[11 - n] : C.muted;
          return (
            <div key={n} style={{ position: 'relative', width: 124, height: 110, borderRadius: 22, background: out > 0.5 ? 'transparent' : col, border: `6px solid ${out > 0.5 ? C.red : col}`, color: out > 0.5 ? C.red : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 68, fontWeight: 900, boxSizing: 'border-box' }}>
              {n}
              {out > 0 && <div style={{ position: 'absolute', left: 8, top: 49, width: 108 * out, height: 8, background: C.red, borderRadius: 4 }} />}
            </div>
          );
        })}
      </div>
      <Text x={540} y={575} w={900} size={50} weight={900} color={C.red} align="center" style={{ opacity: Math.max(x12 * (1 - x7), x7) }}>
        {f < at(scene, 1, 0.2) ? 'c is under 12' : 'c is at least 8'}
      </Text>
      {LIST.map((l, i) => (
        <div key={l.c}>
          <div style={{ position: 'absolute', left: 60, top: BASE(i) - 70, width: 220, fontSize: 58, fontWeight: 900, color: COLS[i], ...fadeUp(f, rowsOn + i * 8) }}>
            c = {l.c}
          </div>
          <Stage>
            {l.rows.map((r, j) => {
              const idx = k++;
              const s = pop(f, rowsOn + 14 + idx * 9);
              return (
                <g key={j} transform={`translate(${300 + j * 128 + 55} ${BASE(i)}) scale(${s}) translate(${-55} 0)`}>
                  <Poly pts={triPts(r[0], r[1], l.c, U, 0, 0)} progress={1} color={COLS[i]} width={5} fill={COLS[i]} fillOpacity={0.25} />
                </g>
              );
            })}
          </Stage>
        </div>
      ))}
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62);
  const chime = at(scene, 0, 1);
  const parts = LIST.map((l, i) => ({ n: l.rows.length, col: COLS[i], t: at(scene, 0, 0.05 + i * 0.16) }));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 100, fontWeight: 900 }}>12</span>
          <span style={{ fontSize: 54, fontWeight: 900 }}>triangles · C</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 560, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, fontSize: 110, fontWeight: 900 }}>
        {parts.map((p, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {i > 0 && <span style={{ color: C.muted, opacity: ease(f, p.t, 8) }}>+</span>}
            <span style={{ color: p.col, opacity: ease(f, p.t, 8), transform: `scale(${0.7 + 0.3 * ease(f, p.t, 10)})` }}>{p.n}</span>
          </span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 740, display: 'flex', justifyContent: 'center', gap: 36, fontSize: 48, fontWeight: 800 }}>
        {LIST.map((l, i) => (
          <span key={l.c} style={{ color: COLS[i], opacity: ease(f, parts[i].t + 6, 8) }}>
            c={l.c}
          </span>
        ))}
      </div>
      <Text x={540} y={930} w={860} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        Don't miss one!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:00" bullets={['Why under half the perimeter', 'A second way: the gap trick', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, list: ListScene, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG, SideLabels, TICK, geom, mix, place, seg } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const U = 36;
const T1 = place(geom(10, 12, 14), 540, 760, U);
const T2 = place(geom(5, 15, 16), 540, 760, U);
const T3 = place(geom(11, 12, 13), 540, 760, U);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const t12 = seg(f, l1 + 10, l1 + 40);
  const t23 = seg(f, l1 + 60, l1 + 90);
  const pts = mix(mix(T1, T2, t12), T3, t23);
  const s1 = 1 - seg(f, l1 + 4, l1 + 12);
  const s2 = seg(f, l1 + 42, l1 + 48) * (1 - seg(f, l1 + 56, l1 + 62));
  const s3 = seg(f, l1 + 92, l1 + 98);
  return (
    <>
      <Title>
        String of <span style={{ color: C.primary }}>36</span>, bent into a triangle
      </Title>
      <Stage>
        <Poly pts={pts} progress={ease(f, 2, 24)} color={C.violet} width={10} fill={C.violet} fillOpacity={0.12} />
      </Stage>
      <SideLabels pts={pts} labels={[14, 10, 12]} op={s1 * ease(f, at(scene, 0, 0.4), 10)} size={56} />
      <SideLabels pts={pts} labels={[16, 5, 15]} op={s2} size={56} />
      <SideLabels pts={pts} labels={[13, 11, 12]} op={s3} size={56} />
      <Text x={540} y={1060} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.5))}>
        How many are there?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many triangles have <b style={{ color: C.primary }}>whole-number</b> sides, <b style={{ color: C.amber }}>three different</b> lengths, and a <b style={{ color: C.violet }}>perimeter of 36</b>?
      </div>
      <Stage>
        <Poly pts={place(geom(10, 12, 14), 540, 800, 28)} progress={1} color={C.violet} width={9} fill={C.violet} fillOpacity={0.12} />
      </Stage>
      <SideLabels pts={place(geom(10, 12, 14), 540, 800, 28)} labels={[14, 10, 12]} size={52} />
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={54} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

// rows of the list: longest side -> number of triangles
const ROWS: { c: number; n: number }[] = [
  { c: 17, n: 7 }, { c: 16, n: 5 }, { c: 15, n: 4 }, { c: 14, n: 2 }, { c: 13, n: 1 }, { c: 12, n: 0 },
];
const RY = 520;
const PITCH = 100;

const Rows: React.FC<{ starts: number[]; dotGap?: number; final?: boolean }> = ({ starts, dotGap = 5, final }) => {
  const f = useCurrentFrame();
  return (
    <>
      {ROWS.map((r, i) => {
        const y = RY + i * PITCH;
        const s = starts[i];
        const op = ease(f, s, 10);
        return (
          <div key={r.c}>
            <div style={{ position: 'absolute', left: 60, top: y, width: 860, height: 86, background: C.card, borderRadius: 24, boxShadow: '0 3px 12px rgba(30,40,80,0.06)', opacity: op }} />
            <div style={{ position: 'absolute', left: 90, top: y, height: 86, display: 'flex', alignItems: 'center', fontSize: 48, fontWeight: 900, opacity: op, whiteSpace: 'nowrap' }}>
              <span style={{ color: C.muted, fontSize: 34, marginRight: 10, fontWeight: 800 }}>longest</span>
              {r.c}
            </div>
            {Array.from({ length: r.n }, (_, k) => {
              const p = final ? 1 : pop(f, s + 8 + k * dotGap);
              return p > 0 ? <div key={k} style={{ position: 'absolute', left: 392 + k * 56, top: y + 18, width: 50, height: 50, borderRadius: '50%', background: C.violet, transform: `scale(${p})`, opacity: Math.min(1, p) }} /> : null;
            })}
            <div style={{ position: 'absolute', left: 810, top: y + 3, width: 80, height: 80, borderRadius: '50%', background: r.n === 0 ? C.muted : C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, transform: `scale(${final ? 1 : pop(f, s + 8 + r.n * dotGap)})` }}>
              {r.n}
            </div>
          </div>
        );
      })}
    </>
  );
};

const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [at(scene, 1, 0.12), at(scene, 1, 0.5), at(scene, 1, 0.78), at(scene, 2, 0.05), at(scene, 2, 0.4), at(scene, 2, 0.75)];
  return (
    <>
      <Title>
        Fix the <span style={{ color: C.violet }}>longest</span> side
      </Title>
      <div style={{ position: 'absolute', left: 60, top: 410, width: 860, display: 'flex', justifyContent: 'center', gap: 10, ...fadeUp(f, at(scene, 0, 0.45)) }}>
        {[12, 13, 14, 15, 16, 17].map((n, i) => (
          <div key={n} style={{ width: 120, height: 80, borderRadius: 14, background: ease(f, at(scene, 0, 0.5 + i * 0.07), 8) > 0.5 ? C.primary : C.line, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900 }}>
            {n}
          </div>
        ))}
      </div>
      <Rows starts={starts} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.82);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 40px', fontSize: 70, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>
          7+5+4+2+1 = 19
        </div>
      </div>
      <Text x={540} y={420} w={900} size={56} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        19 triangles!
      </Text>
      <Rows starts={[0, 0, 0, 0, 0, 0]} final />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="5:57" bullets={['Two ways to count them', 'Every wrong answer explained', 'A perimeter-24 challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, list: List, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

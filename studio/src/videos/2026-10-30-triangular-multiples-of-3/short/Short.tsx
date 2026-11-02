import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, SLUG, TICK } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeThink } from '../../2026-10-30-square-and-cube/short/kit';

export { SLUG };

const Center: React.FC<{ top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top, display: 'flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const VALS = [1, 3, 6, 10, 15, 21, 28, 36, 45];
const REM = VALS.map((v) => v % 3);
const RC = (r: number) => (r === 0 ? C.primary : C.violet);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const tri = [1, 2, 3, 4];
  return (
    <>
      <Title>
        <span style={{ color: C.violet }}>Triangular</span> numbers
      </Title>
      <Stage>
        {tri.map((n, ti) => {
          const cx = 150 + ti * 260;
          return (
            <g key={n} opacity={ti === 0 ? 1 : ease(f, at(scene, 0, 0.1 + ti * 0.17), 8)}>
              {Array.from({ length: n }, (_, r) =>
                Array.from({ length: r + 1 }, (_, c) => <circle key={`${r}-${c}`} cx={cx + (c - r / 2) * 48} cy={520 + r * 46} r={17} fill={C.violet} />),
              )}
            </g>
          );
        })}
      </Stage>
      {[1, 3, 6, 10].map((v, i) => (
        <div key={v} style={{ position: 'absolute', left: 150 + i * 260 - 100, width: 200, top: 725, textAlign: 'center', fontSize: 76, fontWeight: 900, opacity: i === 0 ? 1 : ease(f, at(scene, 0, 0.1 + (i + 1) * 0.17), 8) }}>
          {v}
        </div>
      ))}
      <Text x={540} y={860} w={900} size={64} weight={900} align="center" color={C.muted} style={fadeUp(f, at(scene, 0, 0.75))}>
        … 100 numbers
      </Text>
      <Text x={540} y={990} w={900} size={72} weight={900} align="center" color={C.violet} style={{ opacity: f >= l1 ? 1 : 0, transform: `scale(${pop(f, l1 + 20)})` }}>
        How many are multiples of 3?
      </Text>
    </>
  );
};

const QBody: React.FC = () => (
  <QCard top={300} size={56}>
    Of the first <b style={{ color: C.violet }}>100 numbers</b> in 1, 3, 6, 10, 15, …, how many are <b style={{ color: C.primary }}>multiples of 3</b>?
  </QCard>
);
const Question: SceneComponent = ({ scene }) => (
  <>
    <QBody />
    <ChoiceRow items={['33', '34', '50', '66', '67']} top={760} start={(i) => at(scene, 0, 0.55 + i * 0.07)} size={66} />
  </>
);
const Think = makeThink(QBody, TICK);

const XS = VALS.map((_, i) => 118 + i * 88 + Math.floor(i / 3) * 26);

const Cycle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const e = (s: number, d = 10) => ease(f, s, d);
  return (
    <>
      <Title size={70}>The remainder pattern</Title>
      {VALS.map((v, i) => (
        <div key={v}>
          <div style={{ position: 'absolute', left: XS[i], width: 88, top: 410, textAlign: 'center', fontSize: 32, fontWeight: 800, color: C.muted, opacity: e(at(scene, 0, 0.02 + i * 0.03)) }}>#{i + 1}</div>
          <div style={{ position: 'absolute', left: XS[i] + 4, width: 80, top: 450, height: 84, borderRadius: 18, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, opacity: e(at(scene, 0, 0.02 + i * 0.03)) }}>{v}</div>
          <div style={{ position: 'absolute', left: XS[i] + 8, top: 560, width: 72, height: 72, borderRadius: 36, background: RC(REM[i]), color: '#fff', fontSize: 46, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', border: REM[i] === 0 ? `0px solid ${C.green}` : 'none', opacity: e(at(scene, 0, 0.3 + i * 0.07)), transform: `scale(${REM[i] === 0 ? 1 + 0.12 * e(l1 + 4 + i * 6) * (1 - e(l1 + 40)) : 1})` }}>
            {REM[i]}
          </div>
        </div>
      ))}
      <Text x={60} y={640} w={400} size={34} weight={800} color={C.muted} style={{ opacity: e(at(scene, 0, 0.4)) }}>
        remainder ÷ 3
      </Text>
      {[0, 1, 2].map((g) => (
        <div key={g} style={{ position: 'absolute', left: XS[g * 3], width: XS[g * 3 + 2] + 88 - XS[g * 3], top: 700, opacity: e(l1 + g * 8) }}>
          <div style={{ height: 8, borderRadius: 4, background: C.line }} />
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 44, fontWeight: 900, color: C.green }}>2 ✓</div>
        </div>
      ))}
      <Center top={850} style={fadeUp(f, l2 + 6)}>
        <Tex tex="100=33\times3+1" size={74} />
      </Center>
      <Center top={990} style={{ ...fadeUp(f, l3 + 4) }}>
        <Tex tex="33\times2\;+\;0" size={80} />
      </Center>
      <Text x={540} y={1110} w={900} size={46} weight={800} align="center" color={C.muted} style={fadeUp(f, at(scene, 3, 0.45))}>
        extra spot #100 leaves 1
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const Chip: React.FC<{ letter: string; v: string; color: string; left: number; start: number; cross?: boolean }> = ({ letter, v, color, left, start, cross }) => (
    <div style={{ position: 'absolute', left, top: 760, width: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, background: C.card, border: `6px solid ${color}`, borderRadius: 26, padding: '16px 0', boxShadow: '0 8px 24px rgba(30,40,80,0.12)', ...fadeUp(f, start) }}>
      <span style={{ color, fontSize: 52, fontWeight: 900 }}>{letter}</span>
      <span style={{ fontSize: 84, fontWeight: 900, opacity: cross ? 0.4 : 1 }}>{v}</span>
      {cross && <span style={{ position: 'absolute', fontSize: 130, fontWeight: 900, color: C.red, opacity: 0.85 }}>✕</span>}
    </div>
  );
  return (
    <>
      <AnswerBadge label="Count =" tex="66" hit={at(scene, 0, 0.3)} chime={at(scene, 0, 1)} sfx={CHIME} />
      <Center top={540} style={fadeUp(f, at(scene, 0, 0.3))}>
        <Tex tex="33\times2+0=66" size={80} />
      </Center>
      <Chip letter="A" v="33" color={C.red} left={110} start={l1} cross />
      <Chip letter="D" v="66" color={C.green} left={450} start={at(scene, 0, 0.8)} />
      <Text x={540} y={960} w={900} size={60} weight={900} align="center" color={C.amber} style={fadeUp(f, l1 + 24)}>
        Each group has TWO!
      </Text>
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:59" bullets={['Two ways to solve it', 'Every trap explained', 'The first 80 to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, cycle: Cycle, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

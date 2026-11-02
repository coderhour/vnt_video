import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, SLUG } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeCta, makeThink } from '../../2026-10-31-digit-2026/short/kit';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

const Box: React.FC<{ x: number; y: number; w?: number; h?: number; size?: number; color: string; op?: number; children: React.ReactNode }> = ({ x, y, w = 220, h = 130, size = 84, color, op = 1, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, background: C.card, border: `7px solid ${color}`, color, fontSize: size, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op, boxShadow: '0 8px 24px rgba(30,40,80,0.08)' }}>{children}</div>
);

/** a → b → c chain with ×r arrows. */
const Chain: React.FC<{ y: number; s?: number; vals: [string, string, string]; arrowOp: number; label: string }> = ({ y, s = 1, vals, arrowOp, label }) => {
  const w = 200 * s;
  const gap = 140 * s;
  const x0 = (1000 - (3 * w + 2 * gap)) / 2 + 20;
  return (
    <>
      {vals.map((v, i) => (
        <Box key={i} x={x0 + i * (w + gap)} y={y} w={w} h={130 * s} size={84 * s} color={i === 2 ? C.violet : C.primary}>
          {v}
        </Box>
      ))}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: 'absolute', left: x0 + w + i * (w + gap), top: y + 10 * s, width: gap, textAlign: 'center', opacity: arrowOp }}>
          <div style={{ fontSize: 40 * s, fontWeight: 900, color: C.amber, whiteSpace: 'nowrap' }}>{label}</div>
          <div style={{ fontSize: 56 * s, fontWeight: 900, color: C.amber, lineHeight: 1 }}>→</div>
        </div>
      ))}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        Sequences ending at <span style={{ color: C.violet }}>144</span>
      </Title>
      <Chain y={470} vals={['a', 'b', '144']} arrowOp={ease(f, at(scene, 0, 0.3), 10)} label="× r" />
      <Text x={540} y={700} w={900} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.6))}>
        same ratio every step, like
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.7)) }}>
        <Tex tex={`${col(C.primary, '64')} \\xrightarrow{\\times\\frac32} ${col(C.primary, '96')} \\xrightarrow{\\times\\frac32} ${col(C.violet, '144')}`} size={68} />
      </div>
      <Text x={540} y={990} w={900} size={92} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.2))}>
        How many?
      </Text>
    </>
  );
};

const QBody: React.FC<{ start: (i: number) => number }> = ({ start }) => (
  <>
    <QCard size={46}>
      How many <b style={{ color: C.primary }}>increasing geometric sequences</b> <i>a, b, c</i> of whole numbers have <b style={{ color: C.violet }}>c = 144</b>?
    </QCard>
    <Chain y={640} s={0.8} vals={['a', 'b', '144']} arrowOp={1} label="× r" />
    <ChoiceRow choices={CH} start={start} top={860} plain size={56} />
  </>
);
const Question: SceneComponent = ({ scene }) => <QBody start={(i) => at(scene, 0, 0.7 + i * 0.07)} />;
const Think = makeThink(() => <QBody start={() => -100} />, TICK);

/** k = 1..12 table: row k is a, b, c = k², 12k, 144. */
const Table: React.FC<{ y: number; rowOp: (k: number) => number; hi?: number; hiOp?: number }> = ({ y, rowOp, hi, hiOp = 1 }) => (
  <>
    {range(12).map((i) => {
      const k = i + 1;
      const o = rowOp(k);
      const bad = k === 12;
      const x = k <= 6 ? 50 : 530;
      const yy = y + ((k - 1) % 6) * 92;
      const isHi = hi === k;
      return (
        <div key={k} style={{ position: 'absolute', left: x, top: yy, width: 450, height: 76, borderRadius: 20, background: isHi ? 'rgba(245,159,10,0.22)' : bad && o > 0 ? 'rgba(239,67,67,0.12)' : C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, opacity: o, transform: `scale(${0.9 + 0.1 * o})`, outline: isHi && hiOp > 0 ? `5px solid ${C.amber}` : undefined }}>
          <span style={{ width: 92, color: C.muted, fontSize: 36, fontWeight: 800 }}>k={k}</span>
          <span style={{ fontSize: 44, fontWeight: 900, color: bad ? C.red : C.ink, whiteSpace: 'nowrap' }}>
            {k * k}, {12 * k}, 144
          </span>
          {bad && <span style={{ marginLeft: 'auto', color: C.red, fontSize: 48, fontWeight: 900 }}>✗</span>}
        </div>
      );
    })}
  </>
);

const Twelve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const row = (k: number) => (k === 1 ? ease(f, at(scene, 2, 0.45), 8) : k === 2 ? ease(f, at(scene, 2, 0.75), 8) : ease(f, at(scene, 3, (k - 3) * 0.08), 8));
  const Eq: React.FC<{ y: number; start: number; tex: string }> = ({ y, start, tex }) => (
    <div style={{ position: 'absolute', left: 0, width: 1000, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={62} />
    </div>
  );
  return (
    <>
      <Title>
        144 = <span style={{ color: C.violet }}>12</span>²
      </Title>
      <Eq y={400} start={at(scene, 1, 0.1)} tex={`\\dfrac{b}{12} = ${col(C.amber, 'k')}\\ \\text{(whole!)}`} />
      <Eq y={575} start={at(scene, 2, 0.05)} tex={`b = 12${col(C.amber, 'k')}, \\quad a = ${col(C.amber, 'k')}^2`} />
      <Table y={760} rowOp={row} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.42)} chime={at(scene, 0, 0.45)} sfx={CHIME} label="Answer" text="11" />
      <Table y={500} rowOp={(k) => (k === 12 ? 0.55 : 1)} hi={8} hiOp={ease(f, at(scene, 1, 0.1), 10)} />
      <Text x={540} y={1080} w={900} size={52} weight={900} align="center" color={C.amber} style={fadeUp(f, at(scene, 1, 0.55))}>
        k = 8: 64, 96, 144 has ratio 3/2
      </Text>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, twelve: Twelve, reveal: Reveal, cta: makeCta(SLUG, '6:30', ['Two ways to count them', 'Every trap explained', 'A challenge: ending at 72']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null);

import { useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { SLUG } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeCta, makeThink } from './kit';
import { staticFile } from 'remotion';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);
const MONO = '"DejaVu Sans Mono", "Noto Sans Mono", monospace';
const G2 = C.violet;
const G3 = '#e08600';
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const CH = ['1', '2', '6', '7', '8'];

// digits of 1..14 written in a row, grouped by number
const ROW: { ch: string; n: number }[] = [];
for (let n = 1; n <= 16; n++) for (const ch of String(n)) ROW.push({ ch, n });

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const per = 10;
  const rows = [0, 1, 2];
  return (
    <>
      <Title>
        The <span style={{ color: C.violet }}>2026th</span> digit?
      </Title>
      {rows.map((r) => (
        <div key={r} style={{ position: 'absolute', left: 140, top: 450 + r * 110, display: 'flex' }}>
          {ROW.slice(r * per, r * per + per).map((d, i) => (
            <div key={i} style={{ width: 80, height: 96, background: d.n % 2 ? 'rgba(12,194,129,0.20)' : 'rgba(123,97,255,0.16)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 68, fontWeight: 800 }}>
              {d.ch}
            </div>
          ))}
        </div>
      ))}
      <Text x={540} y={790} w={900} size={80} weight={900} color={C.muted} align="center">
        …
      </Text>
      <Text x={540} y={930} w={900} size={64} weight={900} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Which digit sits in <span style={{ color: C.red }}>spot 2026</span>?
      </Text>
      <Text x={540} y={1090} w={900} size={52} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.6))}>
        (no writing them all out!)
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => (
  <>
    <QCard>
      Write <b style={{ color: C.primary }}>all the whole numbers</b> in a row, no spaces:
      <div style={{ fontFamily: MONO, fontSize: 60, fontWeight: 800, color: G2, margin: '10px 0', letterSpacing: 2 }}>123456789101112…</div>
      What is the <b style={{ color: C.red }}>2026th digit</b>?
    </QCard>
    <ChoiceRow choices={CH} start={start} top={820} plain size={64} />
  </>
);

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;
const Think = makeThink(() => <QuestionBody start={() => -100} />, TICK);

const Pair: React.FC<{ y: number; a: number; b: number; mask: number; label?: number }> = ({ y, a, b, mask, label = 1 }) => {
  const f = useCurrentFrame();
  const CW = 120;
  const GAP = 50;
  const X0 = (1080 - 120 - (6 * CW + GAP)) / 2 + 60;
  const cell = (i: number, ch: string, color: string, bg: string, op: number, extra?: React.CSSProperties) => (
    <div key={i} style={{ position: 'absolute', left: X0 + i * CW + (i >= 3 ? GAP : 0), top: y, width: CW, height: 140, background: bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 100, fontWeight: 800, color, opacity: op, ...extra }}>{ch}</div>
  );
  const tgt = X0 + 3 * CW + GAP;
  const pulse = 1 + 0.05 * Math.sin(f / 5);
  return (
    <>
      {['7', '1', '1'].map((ch, i) => cell(i, ch, C.ink, 'rgba(123,97,255,0.16)', a))}
      {['7', '1', '2'].map((ch, i) =>
        i === 0
          ? cell(3, mask < 0.5 ? '?' : ch, mask < 0.5 ? C.red : C.green, mask < 0.5 ? 'rgba(239,67,67,0.14)' : 'rgba(33,196,93,0.22)', b, { outline: `7px solid ${mask < 0.5 ? C.red : C.green}`, outlineOffset: 3, transform: `scale(${pulse})` })
          : cell(3 + i, ch, C.ink, 'rgba(12,194,129,0.20)', b * 0.4),
      )}
      <div style={{ position: 'absolute', left: X0, top: y - 66, width: 3 * CW, textAlign: 'center', fontSize: 52, fontWeight: 900, color: G2, opacity: a }}>711</div>
      <div style={{ position: 'absolute', left: tgt, top: y - 66, width: 3 * CW, textAlign: 'center', fontSize: 52, fontWeight: 900, color: C.red, opacity: b }}>712</div>
      <div style={{ position: 'absolute', left: tgt - 80, top: y + 160, width: CW + 160, textAlign: 'center', fontSize: 56, fontWeight: 900, color: mask < 0.5 ? C.red : C.green, opacity: b * label }}>spot 2026</div>
    </>
  );
};

const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const Eq: React.FC<{ y: number; start: number; tex: string }> = ({ y, start, tex }) => (
    <div style={{ position: 'absolute', left: 0, width: 1000, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={62} />
    </div>
  );
  return (
    <>
      <Title>Count in blocks</Title>
      <Eq y={400} start={at(scene, 0, 0.2)} tex={`${col(C.primary, '9')} + ${col(G2, '180')} = ${col(C.ink, '189')}\\text{ used}`} />
      <Eq y={520} start={at(scene, 1, 0.1)} tex={`2026 - 189 = ${col(C.ink, '1837')}`} />
      <Eq y={640} start={at(scene, 2, 0.1)} tex={`1837 \\div 3 = ${col(G3, '612')}\\ \\text{r}\\ ${col(C.red, '1')}`} />
      <Text x={540} y={770} w={900} size={52} weight={800} color={G3} align="center" style={fadeUp(f, at(scene, 3, 0.0))}>
        100, 101, …, 711 <span style={{ color: C.muted }}>(612 numbers)</span>
      </Text>
      <Pair y={930} a={ease(f, at(scene, 3, 0.05), 10)} b={ease(f, at(scene, 3, 0.55), 10)} mask={0} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.78)} chime={at(scene, 0, 0.81)} sfx={CHIME} label="Digit =" text="7" />
      <Pair y={620} a={1} b={1} mask={ease(f, at(scene, 0, 0.78), 6)} />
      <Text x={540} y={960} w={900} size={60} weight={900} align="center" color={C.red} style={fadeUp(f, at(scene, 1, 0.05))}>
        Remainder 1 means the FIRST digit of the NEXT number!
      </Text>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, blocks: Blocks, reveal: Reveal, cta: makeCta(SLUG, '6:09', ['Two ways to find it', 'Every trap explained', 'The 1000th digit to try']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null);

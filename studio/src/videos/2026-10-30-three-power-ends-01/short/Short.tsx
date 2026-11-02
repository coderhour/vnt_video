import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, CHOICES, SLUG, TICK } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeThink } from '../../2026-10-30-square-and-cube/short/kit';

export { SLUG };

const Center: React.FC<{ top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top, display: 'flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const POW = [['3^1', '3'], ['3^2', '9'], ['3^3', '27'], ['3^4', '81']];
  return (
    <>
      <Title>
        Powers of <span style={{ color: C.violet }}>three</span>
      </Title>
      {POW.map(([p, v], i) => (
        <div key={p} style={{ position: 'absolute', left: 120 + (i % 2) * 400, top: 430 + Math.floor(i / 2) * 190, width: 340, height: 150, background: C.card, borderRadius: 28, boxShadow: '0 8px 26px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, ...fadeUp(f, i === 0 ? 0 : at(scene, 0, 0.18 + i * 0.16)), opacity: i === 0 ? 1 : (fadeUp(f, at(scene, 0, 0.18 + i * 0.16)).opacity as number) }}>
          <Tex tex={`${p}=`} size={58} color={C.muted} />
          <span style={{ fontSize: 84, fontWeight: 900, color: C.violet }}>{v}</span>
        </div>
      ))}
      <Center top={870} style={{ opacity: ease(f, at(scene, 1), 8), transform: `scale(${pop(f, at(scene, 1, 0.3))})` }}>
        <span style={{ fontSize: 66, fontWeight: 900 }}>Ever end in </span>
        <span style={{ fontSize: 96, fontWeight: 900, color: C.red, marginLeft: 20 }}>01</span>
        <span style={{ fontSize: 66, fontWeight: 900 }}>?</span>
      </Center>
    </>
  );
};

const QBody: React.FC = () => (
  <QCard top={300} size={60}>
    Smallest positive <b style={{ color: C.violet }}>n</b> so that <b style={{ color: C.primary }}>3<sup>n</sup></b> ends in <b style={{ color: C.red }}>01</b>?
  </QCard>
);
const Question: SceneComponent = ({ scene }) => (
  <>
    <QBody />
    <ChoiceRow items={CHOICES} top={640} start={(i) => at(scene, 1, 0.1 + i * 0.15)} size={56} />
  </>
);
const Think = makeThink(QBody, TICK);

const Pillar: React.FC<{ top: number; start: number; n: string; last: string; color: string; fin?: boolean }> = ({ top, start, n, last, color, fin }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 150, top, width: 560, height: 105, background: C.card, borderRadius: 26, boxShadow: '0 6px 22px rgba(30,40,80,0.1)', border: fin ? `6px solid ${C.green}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px', boxSizing: 'border-box', ...fadeUp(f, start) }}>
      <Tex tex={`3^{${n}}`} size={64} />
      <span style={{ fontSize: 40, color: C.muted, fontWeight: 900 }}>ends</span>
      <span style={{ fontSize: 68, fontWeight: 900, color }}>…{last}</span>
    </div>
  );
};

const Jump: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const loop = ['3', '9', '7', '1'];
  const rows: [string, string, number][] = [['4', '81', at(scene, 1, 0.2)], ['8', '61', at(scene, 2, 0.02)], ['12', '41', at(scene, 2, 0.24)], ['16', '21', at(scene, 2, 0.46)]];
  return (
    <>
      <Title size={70}>The last-digit loop</Title>
      <Center top={410} style={{ gap: 14 }}>
        {loop.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, ...fadeUp(f, at(scene, 0, 0.1 + i * 0.14)) }}>
            <div style={{ width: 100, height: 100, borderRadius: 50, background: d === '1' ? C.green : C.violet, color: '#fff', fontSize: 64, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</div>
            <span style={{ fontSize: 46, color: C.muted, fontWeight: 900 }}>{i < 3 ? '→' : '↻'}</span>
          </div>
        ))}
      </Center>
      <Text x={540} y={535} w={900} size={46} weight={800} align="center" color={C.green} style={fadeUp(f, at(scene, 0, 0.7))}>
        ends in 1 only for n = 4, 8, 12, …
      </Text>
      {rows.map(([n, last, st], i) => (
        <Pillar key={n} top={640 + i * 125} start={st} n={n} last={last} color={i === 0 ? C.violet : C.ink} />
      ))}
      <Pillar top={640 + 4 * 125} start={at(scene, 2, 0.72)} n="?" last="01" color={C.green} fin />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: 'absolute', left: 740, top: 640 + i * 125 + 85, fontSize: 48, fontWeight: 900, color: C.amber, whiteSpace: 'nowrap', ...fadeUp(f, i === 0 ? at(scene, 1, 0.65) : rows[i][2] + 10) }}>
          ↓ tens −2
        </div>
      ))}
      <div style={{ display: 'none' }}>{l1 + l2}</div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  return (
    <>
      <AnswerBadge label="n =" tex="20" hit={at(scene, 0, 0.85)} chime={at(scene, 0, 1)} sfx={CHIME} />
      <Center top={520} style={fadeUp(f, at(scene, 0, 0.8))}>
        <Tex tex="5\text{ jumps}\times4=20" size={72} />
      </Center>
      <Center top={720} style={fadeUp(f, l1)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, background: C.card, border: `6px solid ${C.green}`, borderRadius: 28, padding: '20px 44px', boxShadow: '0 8px 24px rgba(33,196,93,0.25)' }}>
          <Tex tex="3^{20}" size={84} />
          <span style={{ fontSize: 40, color: C.muted, fontWeight: 900 }}>ends</span>
          <span style={{ fontSize: 84, fontWeight: 900, color: C.green }}>…01</span>
        </div>
      </Center>
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:33" bullets={['Two ways to solve it', 'Every trap explained', 'Powers of nine to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, jump: Jump, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

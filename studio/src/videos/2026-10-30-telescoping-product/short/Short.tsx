import { staticFile, useCurrentFrame } from 'remotion';
import { fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, CHOICES, SLUG, TICK, br } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeThink } from '../../2026-10-30-square-and-cube/short/kit';

export { SLUG };

const Center: React.FC<{ top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const P1 = `${br('+', '2')}${br('+', '4')}`;
const P2 = `${br('+', '16')}${br('+', '256')}`;
const Product: React.FC<{ size: number; gap?: number }> = ({ size, gap = 10 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap, whiteSpace: 'nowrap' }}>
    <Tex tex={P1} size={size} />
    <Tex tex={`\\times${P2}`} size={size} />
  </div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  return (
    <>
      <Title>
        Four <span style={{ color: C.violet }}>brackets</span>, multiplied
      </Title>
      <Center top={430}>
        <Product size={66} />
      </Center>
      <Text x={540} y={870} w={900} size={64} weight={900} align="center" color={C.red}>
        Multiply it out? ✕
      </Text>
      <Text x={540} y={1000} w={900} size={78} weight={900} align="center" color={C.green} style={{ transform: `scale(${pop(f, l1 + 4)})`, opacity: f >= l1 ? 1 : 0 }}>
        There's a trick!
      </Text>
    </>
  );
};

const QBody: React.FC = () => (
  <QCard top={300}>
    <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div style={{ marginBottom: 6 }}>
        What is the <b style={{ color: C.violet }}>value</b> of
      </div>
      <Product size={56} gap={4} />
    </div>
  </QCard>
);

const Question: SceneComponent = ({ scene }) => (
  <>
    <QBody />
    <ChoiceRow items={CHOICES} top={840} start={(i) => at(scene, 0, 0.6 + i * 0.07)} size={52} />
  </>
);
const Think = makeThink(QBody, TICK);

const G = C.green;
const ROWS = [
  `${br('-', '2', G)}${br('+', '2')}\\cdots`,
  `=${br('-', '4')}${br('+', '4')}\\cdots`,
  `=${br('-', '16')}${br('+', '16')}\\cdots`,
  `=${br('-', '256')}${br('+', '256')}`,
  '=1-\\dfrac{1}{256^2}',
];

const Helper: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [at(scene, 0, 0.3), at(scene, 1, 0.1), at(scene, 1, 0.45), at(scene, 1, 0.78), at(scene, 2, 0.35)];
  return (
    <>
      <Title size={70}>
        The <span style={{ color: G }}>helper</span> trick
      </Title>
      {ROWS.map((r, i) => (
        <Center key={i} top={390 + i * 158} style={fadeUp(f, starts[i])}>
          <Tex tex={r} size={i === 4 ? 72 : 64} />
        </Center>
      ))}
      <Center top={1200} style={{ transform: `scale(${pop(f, at(scene, 3, 0.35))})`, opacity: f >= at(scene, 3, 0.3) ? 1 : 0 }}>
        <Tex tex="\text{double it: }\times 2" size={64} color={C.amber} />
      </Center>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  return (
    <>
      <AnswerBadge label="" tex="2-\dfrac{2}{256^2}" hit={at(scene, 0, 0.85)} chime={at(scene, 0, 1)} sfx={CHIME} />
      <Center top={560} style={fadeUp(f, at(scene, 0, 0.7))}>
        <Tex tex="=\dfrac{65535}{32768}" size={76} />
      </Center>
      <Center top={790} style={{ ...fadeUp(f, l1) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: C.card, border: `6px solid ${C.green}`, borderRadius: 24, padding: '14px 36px', boxShadow: '0 8px 24px rgba(33,196,93,0.25)' }}>
          <span style={{ color: C.green, fontSize: 56, fontWeight: 900 }}>C</span>
          <Tex tex="\dfrac{65535}{32768}" size={66} />
        </div>
      </Center>
      <Text x={540} y={1010} w={900} size={56} weight={900} align="center" color={C.muted} style={fadeUp(f, l1 + 12)}>
        Just under 2
      </Text>
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:07" bullets={['Two ways to solve it', 'Every trap explained', 'A new product to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, helper: Helper, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

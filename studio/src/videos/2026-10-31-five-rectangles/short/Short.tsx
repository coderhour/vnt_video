import { useCurrentFrame } from 'remotion';
import { ease, fadeUp, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, Fig, LONG_T, MAIN, SHORT, SLUG } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeCta, makeThink } from '../../2026-10-31-digit-2026/short/kit';
import { staticFile } from 'remotion';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

const Eq: React.FC<{ y: number; start: number; tex: string; size?: number }> = ({ y, start, tex, size = 62 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1000, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const o = ease(f, at(scene, 0, 0.4), 18);
  return (
    <>
      <Title>
        <span style={{ color: C.red }}>No side lengths</span> given!
      </Title>
      <Fig tiles={MAIN} ox={240} oy={450} px={100} outline={1} outlineGlow={o} lift={range(5).map((i) => (i === 3 ? ease(f, at(scene, 1, 0.2), 10) : 0))} tags={[null, null, null, '?', null]} tagOp={ease(f, at(scene, 1, 0.3), 10)} />
      <Text x={540} y={1040} w={900} size={72} weight={900} align="center" color={C.amber} style={fadeUp(f, at(scene, 0, 0.3))}>
        perimeter = 66
      </Text>
      <Text x={540} y={1150} w={900} size={56} weight={800} align="center" color={C.muted} style={fadeUp(f, at(scene, 1, 0.1))}>
        area of ONE small one?
      </Text>
    </>
  );
};

const QBody: React.FC<{ start: (i: number) => number }> = ({ start }) => (
  <>
    <QCard size={46}>
      <b style={{ color: C.primary }}>Five identical rectangles</b> make a large rectangle with <b style={{ color: C.amber }}>perimeter 66</b>. <b>Area of one small rectangle?</b>
    </QCard>
    <Fig tiles={MAIN} ox={330} oy={650} px={70} />
    <ChoiceRow choices={CH} start={start} top={1070} plain size={56} />
  </>
);
const Question: SceneComponent = ({ scene }) => <QBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;
const Think = makeThink(() => <QBody start={() => -100} />, TICK);

const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const emph = ease(f, at(scene, 0, 0.3), 10);
  const grid = ease(f, at(scene, 1, 0.3), 14);
  const OX = 270;
  const OY = 480;
  const PX = 90;
  const lab = (x: number, y: number, w: number, c: string, t: React.ReactNode, o: number) => (
    <Text x={x} y={y} w={w} size={48} weight={900} color={c} align="center" style={{ opacity: o, whiteSpace: 'nowrap' }}>
      {t}
    </Text>
  );
  return (
    <>
      <Title>Match the edges</Title>
      <Fig tiles={MAIN} ox={OX} oy={OY} px={PX} emph={range(5).map(() => emph)} grid={range(5).map(() => grid)} />
      {lab(OX, OY - 70, 6 * PX, LONG_T, <>2 long{grid > 0.5 && <span style={{ color: C.ink }}> = 6 blocks</span>}</>, ease(f, at(scene, 0, 0.1), 10))}
      {lab(OX, OY + 5 * PX + 24, 6 * PX, SHORT, <>3 short{grid > 0.5 && <span style={{ color: C.ink }}> = 6 blocks</span>}</>, ease(f, at(scene, 0, 0.6), 10))}
      <Eq y={1040} start={at(scene, 2, 0.1)} tex={`6+5+6+5 = ${col(C.primary, '22')}\\text{ blocks}`} />
      <Eq y={1150} start={at(scene, 2, 0.5)} tex={`66 \\div 22 = ${col(C.violet, '3')}\\text{ per block}`} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.76)} chime={at(scene, 0, 0.79)} sfx={CHIME} label="Area" tex="6\times 9=54" />
      <Fig tiles={MAIN} ox={330} oy={520} px={70} emph={[0, 0, 0, 1, 0]} op={[0.4, 0.4, 0.4, 1, 0.4]} tags={[null, null, null, '54', null]} tagOp={ease(f, at(scene, 0, 0.76), 8)} />
      <Eq y={940} start={at(scene, 0, 0.05)} tex={`${col(SHORT, '\\text{short}')} = 2\\times 3 = 6`} size={56} />
      <Eq y={1040} start={at(scene, 0, 0.25)} tex={`${col(LONG_T, '\\text{long}')} = 3\\times 3 = 9`} size={56} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, blocks: Blocks, reveal: Reveal, cta: makeCta(SLUG, '6:06', ['Two ways to find it', 'Every trap explained', 'A 7-rectangle challenge']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null);

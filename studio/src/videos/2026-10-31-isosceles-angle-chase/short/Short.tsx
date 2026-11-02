import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHOICES, Fig, SLUG, VA, VC, VD, allTicks, arcA, arcABD, arcB, arcBDC, arcC, labA, labABD, labB, labC, labD, pulse, tickSet } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeCta, makeThink } from '../../2026-10-31-digit-2026/short/kit';

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
  const g = at(scene, 0, 0.3);
  return (
    <>
      <Title>
        Find the <span style={{ color: VA }}>top angle</span>
      </Title>
      <Fig bx={300} by={1060} H={540} ticks={tickSet(f, scene, at(scene, 0, 0.2), at(scene, 0, 0.55))} arcs={[arcABD(ease(f, g, 10))]} labels={[labABD('24°', ease(f, g, 10), 1 + 0.25 * pulse(f, g, 30)), labA('?', ease(f, at(scene, 1, 0.1), 10))]} />
      <Text x={540} y={1130} w={900} size={84} weight={900} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        <span style={{ color: VD }}>24°</span> <span style={{ color: C.muted }}>→</span> <span style={{ color: VA }}>?</span>
      </Text>
    </>
  );
};

const QBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard size={44}>
        In triangle ABC, <b style={{ color: C.primary }}>AB = AC</b>. D is on AC so that <b style={{ color: C.violet }}>BD = BC</b>. Angle ABD is <b style={{ color: VD }}>24°</b>. Find <b style={{ color: VA }}>angle A</b>.
      </QCard>
      <Fig bx={400} by={1020} H={340} ticks={allTicks(f)} arcs={[arcABD(1)]} labels={[labABD('24°', 1), labA('?', 1)]} />
      <ChoiceRow choices={CHOICES} start={start} top={1110} plain size={50} />
    </>
  );
};
const Question: SceneComponent = ({ scene }) => <QBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;
const Think = makeThink(() => <QBody start={() => -100} />, TICK);

const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const e = pulse(f, at(scene, 0, 0.15), 60);
  const l1 = at(scene, 1, 0.1);
  return (
    <>
      <Title>Chase the angles</Title>
      <Fig
        bx={300} by={960} H={540}
        shades={[{ pts: ['A', 'B', 'D'], color: 'rgba(245, 159, 10, 0.18)', op: ease(f, at(scene, 0, 0.1), 12) }]}
        ticks={allTicks(f)}
        arcs={[arcABD(1), arcA(1), arcBDC(ease(f, at(scene, 0, 0.68), 10)), arcB(ease(f, l1 + 20, 12)), arcC(ease(f, l1 + 6, 12))]}
        labels={[labABD('24°', 1, 1 + 0.25 * e), labA('a', 1, 1 + 0.25 * e), labD('a+24', ease(f, at(scene, 0, 0.55), 10)), labC('a+24', ease(f, l1 + 6, 10)), labB('a+24', ease(f, l1 + 20, 10))]}
      />
      <Eq y={1030} start={at(scene, 0, 0.6)} tex={`\\angle BDC = ${col(VA, 'a')} + ${col(VD, '24')}`} />
      <Eq y={1130} start={at(scene, 2, 0.05)} tex={`(${col(VC, 'a+24')}) + (${col(VC, 'a+24')}) + ${col(VA, 'a')} = 180`} size={54} />
      <Eq y={1230} start={at(scene, 2, 0.55)} tex="3a + 48 = 180" />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const o = ease(f, at(scene, 0, 0.68), 10);
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.68)} chime={at(scene, 0, 0.71)} sfx={CHIME} label="Top angle =" tex="44^\circ" />
      <Fig
        bx={362} by={960} H={440}
        ticks={allTicks(f)}
        arcs={[arcABD(1), arcA(1), arcBDC(1), arcB(1), arcC(1)]}
        labels={[labABD('24°', 1), labA(o > 0.5 ? '44°' : 'a', 1), labD('68°', 1), labC('68°', 1), labB('68°', 1)]}
      />
      <Eq y={1060} start={at(scene, 0, 0.1)} tex="3a = 132" />
      <Eq y={1160} start={at(scene, 1, 0.2)} tex={`${col(C.red, '24')}\\text{ was the trap: it's not the top!}`} size={52} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chase: Chase, reveal: Reveal, cta: makeCta(SLUG, '5:56', ['A second way to solve it', 'Why each wrong answer tempts', 'A new angle to chase']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null);

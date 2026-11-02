import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { ShortFrame } from '../../../lib/Short';
import { Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, BIG_DOWN, BIG_UP, BLUE_D, Base, CHOICES, GREEN_D, Pg, SLUG, SMALL_HEX, UP2, VIOLET_D, mk, ptsOf } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeCta, makeThink } from '../../2026-10-31-digit-2026/short/kit';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const BigT = mk(540, 780, 150);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        How many <span style={{ color: C.violet }}>triangles</span>?
      </Title>
      <Stage>
        <Base T={BigT} />
        {SMALL_HEX.map((t, k) => (
          <Pg key={k} pts={ptsOf(t, BigT)} fill={t.dir === 'up' ? C.primary : C.blue} fo={0.3} />
        ))}
        {UP2.map((t, k) => (
          <Pg key={`u${k}`} pts={ptsOf(t, BigT)} stroke={C.violet} w={9} op={ease(f, at(scene, 1, 0.1 + k * 0.08), 8) * (1 - ease(f, at(scene, 1, 0.1 + (k + 1) * 0.08), 8) * (k < 5 ? 1 : 0))} />
        ))}
        <Pg pts={ptsOf(BIG_UP, BigT)} stroke={AMBER} w={13} op={ease(f, at(scene, 1, 0.75), 12)} />
      </Stage>
      <Text x={540} y={1110} w={900} size={64} weight={900} align="center" color={GREEN_D} style={fadeUp(f, at(scene, 0, 0.3))}>
        24 little triangles…
      </Text>
      <Text x={540} y={1210} w={900} size={64} weight={900} align="center" color={VIOLET_D} style={fadeUp(f, at(scene, 1, 0.3))}>
        …and bigger ones hide!
      </Text>
    </>
  );
};

const QBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const T = mk(540, 800, 100);
  return (
    <>
      <QCard size={46}>
        A <b style={{ color: C.primary }}>regular hexagon</b> is cut into <b>24 small triangles</b>. How many triangles <b style={{ color: C.violet }}>of any size</b> are in the figure?
      </QCard>
      <Stage>
        <Base T={T} />
      </Stage>
      <ChoiceRow choices={CHOICES} start={start} top={1040} plain size={56} />
    </>
  );
};
const Question: SceneComponent = ({ scene }) => <QBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;
const Think = makeThink(() => <QBody start={() => -100} />, TICK);

const Flip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ups = SMALL_HEX.filter((t) => t.dir === 'up');
  const shade = (k: number) => ease(f, at(scene, 0, 0.35) + k * 4, 8);
  const mid = ease(f, at(scene, 1, 0.25), 12);
  const big = ease(f, at(scene, 1, 0.7), 12);
  const spin = ease(f, at(scene, 2, 0.1), 80);
  const o = BigT([0, 0]);
  return (
    <>
      <Title>
        Count only the <span style={{ color: C.primary }}>▲</span> ones
      </Title>
      <Stage>
        <g transform={`rotate(${spin * 180} ${o[0]} ${o[1]})`}>
          <Base T={BigT} />
          {ups.map((t, k) => (
            <Pg key={k} pts={ptsOf(t, BigT)} fill={C.primary} fo={0.5} op={shade(k)} />
          ))}
          {UP2.map((t, k) => (
            <Pg key={`u${k}`} pts={ptsOf(t, BigT)} fill={C.violet} fo={0.12} stroke={C.violet} w={6} op={mid} />
          ))}
          <Pg pts={ptsOf(BIG_UP, BigT)} stroke={AMBER} w={12} op={big} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1100, display: 'flex', justifyContent: 'center', gap: 20, fontSize: 68, fontWeight: 900, ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <span style={{ color: GREEN_D, opacity: ease(f, at(scene, 1, 0.1), 8) }}>12</span>
        <span style={{ color: C.muted }}>+</span>
        <span style={{ color: VIOLET_D, opacity: mid }}>6</span>
        <span style={{ color: C.muted }}>+</span>
        <span style={{ color: '#c27a00', opacity: big }}>1</span>
        <span style={{ color: C.muted, opacity: big }}>=</span>
        <span style={{ opacity: big }}>19 <span style={{ color: C.primary }}>▲</span></span>
      </div>
      <Text x={540} y={1210} w={900} size={64} weight={900} align="center" color={BLUE_D} style={fadeUp(f, at(scene, 2, 0.55))}>
        19 <span>▼</span> too!
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = mk(540, 880, 140);
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.57)} chime={at(scene, 0, 0.60)} sfx={CHIME} label="2 × 19 =" text="38" />
      <Stage>
        <Base T={T} />
        {SMALL_HEX.map((t, k) => (
          <Pg key={k} pts={ptsOf(t, T)} fill={t.dir === 'up' ? C.primary : C.blue} fo={0.35} />
        ))}
        <Pg pts={ptsOf(BIG_UP, T)} stroke={AMBER} w={11} op={ease(f, at(scene, 1, 0.2), 10)} />
        <Pg pts={ptsOf(BIG_DOWN, T)} stroke={BLUE_D} w={11} op={ease(f, at(scene, 1, 0.5), 10)} />
      </Stage>
      <Text x={540} y={1170} w={900} size={60} weight={900} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        <span style={{ color: GREEN_D }}>19 ▲</span> + <span style={{ color: BLUE_D }}>19 ▼</span>
      </Text>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, flip: Flip, reveal: Reveal, cta: makeCta(SLUG, '5:02', ['Count by size, two ways', 'Every trap explained', 'A big triangle to try']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null);

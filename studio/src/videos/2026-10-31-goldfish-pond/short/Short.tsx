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
const GOLD = C.amber;
const OTHER = C.blue;

/** 20 × 10 dots: row 0 = the 20 other fish (blue), rows 1..9 = 180 goldfish. Rows 5..9 are the 100 that leave. */
const Pond: React.FC<{ x: number; y: number; step: number; rowOp?: (r: number) => number; ring?: number; leaving?: number }> = ({ x, y, step, rowOp, ring = 0, leaving = 0 }) => (
  <>
    {range(200).map((i) => {
      const r = Math.floor(i / 20);
      const c = i % 20;
      const o = rowOp ? rowOp(r) : 1;
      if (o <= 0) return null;
      const other = r === 0;
      const going = r >= 5 && leaving > 0;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + c * step,
            top: y + r * step,
            width: step * 0.72,
            height: step * 0.72,
            borderRadius: '50%',
            background: other ? OTHER : going ? C.red : GOLD,
            opacity: o * (going ? 1 - 0.55 * leaving : 1) * (other || ring === 0 ? 1 : 1),
            boxShadow: other && ring > 0 ? `0 0 0 ${4 * ring}px rgba(60,131,246,0.35)` : undefined,
          }}
        />
      );
    })}
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        <span style={{ color: GOLD }}>90%</span> goldfish. Remove some, get <span style={{ color: GOLD }}>80%</span>
      </Title>
      <Pond x={140} y={540} step={40} />
      <Text x={540} y={970} w={900} size={60} weight={900} align="center" color={C.muted} style={fadeUp(f, at(scene, 1, 0.1))}>
        200 fish in the pond
      </Text>
      <Text x={540} y={1090} w={900} size={78} weight={900} align="center" color={C.red} style={fadeUp(f, at(scene, 1, 0.55))}>
        Most kids say <span style={{ textDecoration: 'line-through' }}>10</span>!
      </Text>
    </>
  );
};

const QBody: React.FC<{ start: (i: number) => number }> = ({ start }) => (
  <>
    <QCard size={46}>
      A pond has <b>200 fish</b>, <b style={{ color: GOLD }}>90%</b> goldfish. How many goldfish must go so that <b style={{ color: GOLD }}>80%</b> of the fish <u>left</u> are goldfish?
    </QCard>
    <Pond x={210} y={650} step={30} />
    <ChoiceRow choices={CH} start={start} top={1010} plain size={56} />
  </>
);
const Question: SceneComponent = ({ scene }) => <QBody start={(i) => at(scene, 0, 0.7 + i * 0.07)} />;
const Think = makeThink(() => <QBody start={() => -100} />, TICK);

const Stay: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // goldfish rows 9..5 leave one row at a time during the last line
  const rowOp = (r: number) => (r < 5 ? 1 : 1 - ease(f, at(scene, 2, 0.3 + (9 - r) * 0.1), 8));
  return (
    <>
      <Title>Watch the fish that stay</Title>
      <Pond x={140} y={440} step={40} rowOp={rowOp} ring={ease(f, at(scene, 0, 0.7), 12)} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 880, display: 'flex', justifyContent: 'center', gap: 50, fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 0, 0.35)) }}>
        <span style={{ color: GOLD }}>180 goldfish</span>
        <span style={{ color: OTHER }}>20 others</span>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1000, top: 1010, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.35)) }}>
        <Tex tex={`${col(OTHER, '20')} = 20\\% = \\dfrac15`} size={68} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1000, top: 1140, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.45)) }}>
        <Tex tex={`5 \\times ${col(OTHER, '20')} = 100\\text{ fish}`} size={68} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.56)} chime={at(scene, 0, 0.59)} sfx={CHIME} label="Remove" text="100" />
      <Pond x={140} y={470} step={40} leaving={ease(f, at(scene, 0, 0.56), 12)} />
      <Text x={540} y={910} w={900} size={56} weight={900} align="center" style={fadeUp(f, at(scene, 0, 0.5))}>
        200 fish → <span style={{ color: C.green }}>100 fish</span>
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1000, top: 1030, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Tex tex={`${col(C.red, '90 - 80 = 10')}\\ \\text{?}\\quad \\text{no!}`} size={64} />
      </div>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, stay: Stay, reveal: Reveal, cta: makeCta(SLUG, '5:45', ['Two ways to solve it', 'Why every wrong answer tempts', 'A bigger pond to try']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null);

import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHOICES, KM, MS, SLUG } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeCta, makeThink } from '../../2026-10-31-digit-2026/short/kit';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

/** Hill scene: triangle hill from (x0, y0) to (x0+W, y0), peak in the middle at height H. */
const Hill: React.FC<{ x0: number; y0: number; W: number; H: number; up?: string; down?: string; upOp?: number; downOp?: number; size?: number }> = ({ x0, y0, W, H, up, down, upOp = 1, downOp = 1, size = 56 }) => {
  const px = x0 + W / 2;
  return (
    <>
      <Stage>
        <path d={`M${x0} ${y0} L${px} ${y0 - H} L${x0 + W} ${y0} Z`} fill="#dfe5f3" stroke="#b9c3da" strokeWidth={6} strokeLinejoin="round" />
        <line x1={x0 + W * 0.12} y1={y0 - H * 0.28} x2={x0 + W * 0.4} y2={y0 - H * 0.84} stroke={KM} strokeWidth={14} strokeLinecap="round" opacity={upOp} />
        <path d={`M${x0 + W * 0.4 - 22} ${y0 - H * 0.84 + 26} L${x0 + W * 0.4 + 10} ${y0 - H * 0.84 - 8} L${x0 + W * 0.4 + 22} ${y0 - H * 0.84 + 34}`} fill="none" stroke={KM} strokeWidth={0} />
        <line x1={x0 + W * 0.6} y1={y0 - H * 0.84} x2={x0 + W * 0.88} y2={y0 - H * 0.28} stroke={MS} strokeWidth={14} strokeLinecap="round" strokeDasharray="1 26" opacity={downOp} />
      </Stage>
      {up && (
        <div style={{ position: 'absolute', left: x0 - 30, top: y0 - H * 0.2, width: W * 0.45, textAlign: 'center', fontSize: size, fontWeight: 900, color: KM, opacity: upOp }}>
          ▲ {up}
        </div>
      )}
      {down && (
        <div style={{ position: 'absolute', left: x0 + W * 0.55 + 30, top: y0 - H * 0.2, width: W * 0.45, textAlign: 'center', fontSize: size, fontWeight: 900, color: MS, opacity: downOp }}>
          ▼ {down}
        </div>
      )}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        Up the hill, <span style={{ color: MS }}>down</span> the hill
      </Title>
      <Hill x0={140} y0={880} W={760} H={380} up="12 km/h" down="10 m/s" upOp={ease(f, at(scene, 0, 0.2), 10)} downOp={ease(f, at(scene, 0, 0.6), 10)} />
      <Text x={540} y={1000} w={900} size={64} weight={900} align="center" color={C.amber} style={fadeUp(f, at(scene, 1, 0.3))}>
        Average speed = ?
      </Text>
      <Text x={540} y={1100} w={900} size={52} weight={800} align="center" color={C.muted} style={fadeUp(f, at(scene, 1, 0.7))}>
        (not just the average of the two!)
      </Text>
    </>
  );
};

const QBody: React.FC<{ start: (i: number) => number }> = ({ start }) => (
  <>
    <QCard size={44}>
      Jo bikes up a <b>3 km</b> hill at <b style={{ color: KM }}>12 km/h</b>, then back down at <b style={{ color: MS }}>10 m/s</b>. Average speed for the round trip, <b>in km/h</b>?
    </QCard>
    <Hill x0={250} y0={900} W={560} H={240} size={40} />
    <ChoiceRow choices={CHOICES} start={start} top={980} plain size={56} />
  </>
);
const Question: SceneComponent = ({ scene }) => <QBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;
const Think = makeThink(() => <QBody start={() => -100} />, TICK);

const Bars: React.FC<{ y: number; up: number; down: number }> = ({ y, up, down }) => (
  <>
    <div style={{ position: 'absolute', left: 60, top: y, height: 86, width: 15 * 40 * up, background: KM, borderRadius: 18, color: '#fff', fontSize: 46, fontWeight: 900, display: 'flex', alignItems: 'center', paddingLeft: 24, whiteSpace: 'nowrap', overflow: 'hidden', opacity: up > 0 ? 1 : 0 }}>
      {up > 0.9 ? 'up: 15 min' : ''}
    </div>
    <div style={{ position: 'absolute', left: 60, top: y + 110, height: 86, width: 5 * 40 * down, background: MS, borderRadius: 18, opacity: down > 0 ? 1 : 0 }} />
    <div style={{ position: 'absolute', left: 60 + 5 * 40 + 24, top: y + 110, height: 86, display: 'flex', alignItems: 'center', fontSize: 46, fontWeight: 900, color: MS, opacity: down > 0.9 ? 1 : 0, whiteSpace: 'nowrap' }}>down: 5 min</div>
  </>
);

const Times: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const Eq: React.FC<{ y: number; start: number; tex: string }> = ({ y, start, tex }) => (
    <div style={{ position: 'absolute', left: 0, width: 1000, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={64} />
    </div>
  );
  return (
    <>
      <Title>Fix the units first</Title>
      <Eq y={420} start={at(scene, 0, 0.35)} tex={`${col(MS, '10\\text{ m/s}')} = ${col(KM, '36\\text{ km/h}')}`} />
      <Bars y={600} up={ease(f, at(scene, 1, 0.05), 14)} down={ease(f, at(scene, 1, 0.5), 10)} />
      <Eq y={880} start={at(scene, 2, 0.1)} tex={`6\\text{ km in }20\\text{ min} = \\tfrac13\\text{ hour}`} />
      <Eq y={1000} start={at(scene, 2, 0.6)} tex={`\\text{in 1 hour: } 6 \\times 3 = ${col(C.red, '?')}`} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge hit={at(scene, 0, 0.37)} chime={at(scene, 0, 0.40)} sfx={CHIME} label="Average =" text="18 km/h" />
      <Bars y={500} up={1} down={1} />
      <Text x={540} y={800} w={900} size={56} weight={900} align="center" color={C.muted} style={fadeUp(f, at(scene, 1, 0.1))}>
        slow for 15 min, fast for only 5
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1000, top: 930, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.45)) }}>
        <Tex tex={`${col(C.red, '\\tfrac{12+36}{2}=24')}\\ \\text{ is a trap!}`} size={64} />
      </div>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, times: Times, reveal: Reveal, cta: makeCta(SLUG, '5:50', ['Two ways to solve it', 'Every trap explained', 'A gentler hill to try']) };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) => (timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null);

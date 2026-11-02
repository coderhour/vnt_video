import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, CHOICES, COLORS, Label, SLUG, TICK, centroid, mk, tris } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeThink } from '../../2026-10-30-square-and-cube/short/kit';

export { SLUG };

type Key = keyof typeof COLORS;
const KEYS: Key[] = ['top', 'bottom', 'left', 'right'];
const pts = (p: Pt[]) => p.map((q) => q.join(',')).join(' ');

/** Trapezoid + diagonals; `fill[k]` (0..1) shades triangle k; `lab[k]` is its label (opacity in `labO[k]`). */
const Trap: React.FC<{ g: ReturnType<typeof mk>; fill: Partial<Record<Key, number>>; lab?: Partial<Record<Key, [string, number]>>; sides?: number; size?: number }> = ({ g, fill, lab = {}, sides = 1, size = 64 }) => {
  const T = tris(g);
  return (
    <Stage>
      {KEYS.map((k) => (
        <polygon key={k} points={pts(T[k])} fill={COLORS[k]} opacity={0.38 * (fill[k] ?? 0)} />
      ))}
      <polygon points={pts([g.A, g.B, g.C, g.D])} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <line x1={g.A[0]} y1={g.A[1]} x2={g.C[0]} y2={g.C[1]} stroke={C.ink} strokeWidth={5} />
      <line x1={g.B[0]} y1={g.B[1]} x2={g.D[0]} y2={g.D[1]} stroke={C.ink} strokeWidth={5} />
      <Label p={[(g.A[0] + g.B[0]) / 2, g.A[1] - 46]} text="6" opacity={sides} size={56} />
      <Label p={[(g.C[0] + g.D[0]) / 2, g.D[1] + 52]} text="10" opacity={sides} size={56} />
      {KEYS.map((k) => {
        const l = lab[k];
        if (!l) return null;
        const c = centroid(T[k]);
        return <Label key={k} p={k === 'left' ? [c[0] - 6, c[1]] : k === 'right' ? [c[0] + 6, c[1]] : c} text={l[0]} color={COLORS[k] === C.amber ? '#b87800' : COLORS[k]} size={size} opacity={l[1]} />;
      })}
    </Stage>
  );
};

const HG = mk(6, 10, 6, 1.5, 140, 1060, 80);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        Four <span style={{ color: C.violet }}>triangles</span>, one area
      </Title>
      <Trap g={HG} fill={{ top: 1 }} lab={{ top: ['9', 1], bottom: ['?', 1], left: ['?', 1], right: ['?', 1] }} />
      <Text x={540} y={1160} w={900} size={60} weight={900} align="center" color={C.red} style={{ transform: `scale(${pop(f, at(scene, 0, 0.55))})`, opacity: f >= at(scene, 0, 0.5) ? 1 : 0 }}>
        We only know one!
      </Text>
    </>
  );
};

const QG = mk(6, 10, 6, 1.5, 180, 1060, 70);
const QBody: React.FC = () => (
  <>
    <QCard top={300} size={50}>
      Trapezoid with <b>top 6</b>, <b>bottom 10</b>. The shaded triangle has <b style={{ color: C.amber }}>area 9</b>. <b style={{ color: C.violet }}>Whole area?</b>
    </QCard>
    <Trap g={QG} fill={{ top: 1 }} lab={{ top: ['9', 1] }} />
  </>
);
const Question: SceneComponent = ({ scene }) => (
  <>
    <QBody />
    <ChoiceRow items={CHOICES} top={1180} start={(i) => at(scene, 0, 0.55 + i * 0.07)} size={52} />
  </>
);
const Think = makeThink(QBody, TICK);

const AG = mk(6, 10, 6, 1.5, 140, 1060, 80);

const Similar: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const e = (s: number, d = 10) => ease(f, s, d);
  const bottomNum = e(at(scene, 1, 0.8));
  const o1 = e(l1 + 4) * (1 - e(l2 - 6, 6));
  const o2 = e(l2 + 10) * (1 - e(l3 - 6, 6));
  const o3 = e(l3 + 4);
  return (
    <>
      <Title size={70}>
        <span style={{ color: C.amber }}>Top</span> & <span style={{ color: C.blue }}>bottom</span> are copies
      </Title>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 405, textAlign: 'center', fontSize: 60, fontWeight: 900, ...fadeUp(f, at(scene, 0, 0.55)) }}>
        6 : 10 = <span style={{ color: C.violet }}>3 : 5</span>
      </div>
      <Trap
        g={AG}
        fill={{ top: 1, bottom: e(at(scene, 0, 0.3)), left: e(l2 + 20), right: e(l2 + 20) }}
        lab={{ top: ['9', 1], bottom: ['25', bottomNum], left: ['15', e(l2 + 30)], right: ['15', e(l2 + 30)] }}
        sides={e(at(scene, 0, 0.1))}
        size={60}
      />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1150, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: o1 }}>
        <Tex tex="9\times\dfrac53\times\dfrac53=25" size={64} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1150, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: o2 }}>
        <Tex tex="9\times\dfrac53=15" size={64} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1150, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: o3 }}>
        <Tex tex="9+25+15+15" size={72} />
      </div>
    </>
  );
};

const RG = mk(6, 10, 6, 1.5, 140, 1060, 80);
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge label="Area =" tex="64" hit={at(scene, 0, 0.8)} chime={at(scene, 0, 1)} sfx={CHIME} />
      <Trap g={RG} fill={{ top: 1, bottom: 1, left: 1, right: 1 }} lab={{ top: ['9', 1], bottom: ['25', 1], left: ['15', 1], right: ['15', 1] }} size={60} />
      <Text x={540} y={1200} w={900} size={60} weight={900} align="center" color={C.green} style={fadeUp(f, at(scene, 1, 0.1))}>
        Choice D
      </Text>
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:37" bullets={['Two ways to solve it', 'Every trap explained', 'A new trapezoid to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, similar: Similar, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, CHOICES, SLUG, TICK } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeThink } from '../../2026-10-30-square-and-cube/short/kit';

export { SLUG };

const COLS = [C.primary, C.violet, C.blue, C.amber, C.red];
const CELLS: [number, number][] = [1, 2, 3, 4, 5].flatMap((r) => Array.from({ length: 6 - r }, (_, i): [number, number] => [i + 1, r]));

type G = { ox: number; bottom: number; u: number };
const cx = (g: G, c: number) => g.ox + (c - 0.5) * g.u;
const cy = (g: G, r: number) => g.bottom - (r - 0.5) * g.u;

/** The staircase: rows of 5, 4, 3, 2, 1 (row 1 at the bottom). `fill(c, r)` returns extra style per cell. */
const Stairs: React.FC<{ g: G; fill?: (c: number, r: number) => React.CSSProperties; text?: (c: number, r: number) => React.ReactNode }> = ({ g, fill, text }) => (
  <>
    {CELLS.map(([c, r]) => (
      <div
        key={`${c}-${r}`}
        style={{ position: 'absolute', left: g.ox + (c - 1) * g.u, top: g.bottom - r * g.u, width: g.u, height: g.u, boxSizing: 'border-box', border: `4px solid ${C.ink}`, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: g.u * 0.46, fontWeight: 900, ...fill?.(c, r) }}
      >
        {text?.(c, r)}
      </div>
    ))}
  </>
);

const Dot: React.FC<{ g: G; c: number; r: number; color: string; o: number; s?: number }> = ({ g, c, r, color, o, s = 1 }) => (
  <div style={{ position: 'absolute', left: cx(g, c) - 22, top: cy(g, r) - 22, width: 44, height: 44, borderRadius: 22, background: color, border: '5px solid #fff', boxSizing: 'border-box', opacity: o, transform: `scale(${s})`, boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }} />
);

const BIG: G = { ox: 245, bottom: 1110, u: 118 };

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  return (
    <>
      <Title>
        How many <span style={{ color: C.violet }}>rectangles</span>?
      </Title>
      <Stairs g={BIG} fill={(c) => ({ background: `${COLS[c - 1]}22` })} />
      <Text x={770} y={560} w={300} size={110} weight={900} align="center" color={C.amber} style={{ transform: `scale(${pop(f, at(scene, 0, 0.55))})` }}>
        15?
      </Text>
      <Text x={770} y={760} w={300} size={64} weight={900} align="center" color={C.red} style={{ transform: `scale(${pop(f, l1 + 6)})`, opacity: ease(f, l1, 6) }}>
        WAY more!
      </Text>
    </>
  );
};

const QG: G = { ox: 330, bottom: 1010, u: 84 };
const QuestionPic: React.FC = () => <Stairs g={QG} fill={(c) => ({ background: `${COLS[c - 1]}22` })} />;

const Question: SceneComponent = ({ scene }) => (
  <>
    <QCard top={300}>
      How many <b style={{ color: C.violet }}>rectangles</b> of any size are in the stairs? <b>Squares count too.</b>
    </QCard>
    <QuestionPic />
    <ChoiceRow items={CHOICES} top={1060} start={(i) => at(scene, 1, 0.1 + i * 0.15)} size={50} />
  </>
);

const Think = makeThink(
  () => (
    <QCard top={300}>
      How many <b style={{ color: C.violet }}>rectangles</b> of any size are in the stairs? <b>Squares count too.</b>
    </QCard>
  ),
  TICK,
);

const SUMS = [15, 20, 18, 12, 5];

const Corner: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const inRect = (c: number, r: number) => c >= 2 && c <= 3 && r <= 2;
  const inBlock = (c: number, r: number) => c <= 3 && r <= 2;
  const showRect = ease(f, 6, 10) * (1 - ease(f, l1 + 40, 8));
  const block = ease(f, l2 + 4, 12) * (1 - ease(f, l3, 8));
  const tr = Math.max(showRect, ease(f, l1, 8) * (1 - ease(f, l3, 8)));
  const fillT = (c: number, r: number) => ease(f, l3 + 4 + (c - 1) * 14 + (r - 1) * 2, 8);
  const blockCells = [1, 2, 3].flatMap((c) => [1, 2].map((r): [number, number] => [c, r]));
  const count = Math.min(6, Math.max(0, Math.floor(((f - at(scene, 2, 0.35)) / (at(scene, 2, 0.8) - at(scene, 2, 0.35))) * 6) + 1));
  return (
    <>
      <Title size={70}>The corner trick</Title>
      <Stairs
        g={g}
        fill={(c, r) => ({
          background: inRect(c, r) && showRect > 0 ? `rgba(123,97,255,${0.22 * showRect})` : inBlock(c, r) && block > 0 ? `rgba(12,194,129,${0.22 * block})` : fillT(c, r) > 0 ? `${COLS[c - 1]}22` : C.card,
        })}
        text={(c, r) => <span style={{ opacity: fillT(c, r) }}>{c * r}</span>}
      />
      {/* L0: top-right (amber) and bottom-left (green) squares of one rectangle */}
      <Dot g={g} c={3} r={2} color={C.amber} o={tr} />
      <Dot g={g} c={2} r={1} color={C.primary} o={showRect} />
      {/* L1: six bottom-left spots */}
      {blockCells.map(([c, r], i) => (
        <Dot key={`${c}${r}`} g={g} c={c} r={r} color={C.primary} o={block * (i < count && (c !== 3 || r !== 2) ? 1 : 0)} s={1} />
      ))}
      <div style={{ position: 'absolute', left: 630, top: 540, display: 'flex', flexDirection: 'column', gap: 18, fontSize: 40, fontWeight: 800, opacity: ease(f, 8, 10) * (1 - ease(f, l3, 8)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: C.amber }} />
          top-right
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: C.primary }} />
          bottom-left
        </div>
      </div>
      <Text x={770} y={720} w={300} size={68} weight={900} align="center" color={C.primary} style={{ opacity: ease(f, at(scene, 2, 0.55), 8) * (1 - ease(f, l3, 8)) }}>
        3 × 2 = 6
      </Text>
      {/* L2: column sums */}
      {SUMS.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: g.ox + i * g.u, width: g.u, top: g.bottom + 22, textAlign: 'center', fontSize: 56, fontWeight: 900, color: COLS[i], ...fadeUp(f, l3 + 90 + i * 12) }}>
          {s}
        </div>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: 'absolute', left: g.ox + (i + 1) * g.u - 20, width: 40, top: g.bottom + 28, textAlign: 'center', fontSize: 44, fontWeight: 900, color: C.muted, ...fadeUp(f, l3 + 96 + i * 12) }}>
          +
        </div>
      ))}
    </>
  );
};

const RG: G = { ox: 270, bottom: 960, u: 100 };

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AnswerBadge label="Total =" tex="70" hit={at(scene, 0, 0.3)} chime={at(scene, 0, 1)} sfx={CHIME} />
      <Stairs g={RG} fill={(c) => ({ background: `${COLS[c - 1]}22` })} text={(c, r) => c * r} />
      {SUMS.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: RG.ox + i * RG.u, width: RG.u, top: RG.bottom + 20, textAlign: 'center', fontSize: 54, fontWeight: 900, color: COLS[i] }}>
          {s}
        </div>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: 'absolute', left: RG.ox + (i + 1) * RG.u - 20, width: 40, top: RG.bottom + 26, textAlign: 'center', fontSize: 42, fontWeight: 900, color: C.muted }}>
          +
        </div>
      ))}
      <Text x={540} y={1150} w={900} size={66} weight={900} align="center" color={C.amber} style={fadeUp(f, at(scene, 1, 0.1))}>
        Not 15. Way more!
      </Text>
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:50" bullets={['Two ways to count them', 'Every trap explained', 'A taller staircase to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, corner: Corner, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

import { staticFile, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Step as Arrow, Stage, XMark } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-grid-coloring';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const RED = '#ef4343';
const BLUE = '#3b82f6';
const GRN = '#21c45d';
const EDGE = C.primary; // outline colour for "edge" squares
const CORN = '#7b61ff'; // outline colour for "corner" squares
const COL: Record<string, string> = { B: BLUE, G: GRN, R: RED };

// ---------- grids ----------

type Names = Record<string, [number, number]>;
const N3: Names = { TL: [0, 0], T: [0, 1], TR: [0, 2], L: [1, 0], C: [1, 1], R: [1, 2], BL: [2, 0], B: [2, 1], BR: [2, 2] };
const N23: Names = { TL: [0, 0], TM: [0, 1], TR: [0, 2], BL: [1, 0], BM: [1, 1], BR: [1, 2] };
const OX = 240;
const OY = 170;
const S = 170;
const VX = 300;
const VY = 250;

type Step = [number, string | null];
const stepAt = (f: number, steps?: Step[]) => {
  if (!steps) return null;
  let cur: Step | undefined;
  for (const st of steps) if (f >= st[0]) cur = st;
  if (!cur || cur[1] === null) return null;
  return { color: cur[1], p: ease(f, cur[0], 9) };
};
const ctr = (names: Names, n: string, ox = OX, oy = OY, s = S): [number, number] => [ox + names[n][1] * s + s / 2, oy + names[n][0] * s + s / 2];

type Num = Record<string, number>;
const Board: React.FC<{
  ox?: number;
  oy?: number;
  s?: number;
  names?: Names;
  fills?: Record<string, Step[]>;
  chips?: Num; // "B / G" chip opacity per cell
  dim?: Num;
  labels?: Record<string, { text: string; color?: string; o: number; size?: number }>;
  checks?: Num;
}> = ({ ox = OX, oy = OY, s = S, names = N3, fills, chips, dim, labels, checks }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Object.entries(names).map(([n, [r, c]]) => {
        const x = ox + c * s;
        const y = oy + r * s;
        const st = stepAt(f, fills?.[n]);
        const ch = chips?.[n] ?? 0;
        const lb = labels?.[n];
        const ck = checks?.[n] ?? 0;
        return (
          <g key={n} opacity={dim?.[n] ?? 1}>
            <rect x={x} y={y} width={s} height={s} fill={C.card} />
            {st && <rect x={x + 3} y={y + 3} width={s - 6} height={s - 6} fill={st.color} opacity={st.p} />}
            <rect x={x} y={y} width={s} height={s} fill="none" stroke={C.ink} strokeWidth={4} />
            {ch > 0 && (
              <text x={x + s / 2} y={y + s / 2} opacity={ch} fontFamily={NUNITO} fontWeight={900} fontSize={50} textAnchor="middle" dominantBaseline="central">
                <tspan fill={BLUE}>B</tspan>
                <tspan fill={C.muted}> / </tspan>
                <tspan fill={GRN}>G</tspan>
              </text>
            )}
            {lb && lb.o > 0 && (
              <text x={x + s / 2} y={y + s / 2 + 2} opacity={lb.o} fill={lb.color ?? C.ink} fontFamily={NUNITO} fontWeight={900} fontSize={lb.size ?? 72} textAnchor="middle" dominantBaseline="central">
                {lb.text}
              </text>
            )}
            {ck > 0 && <path d={`M ${x + s * 0.28} ${y + s * 0.52} L ${x + s * 0.44} ${y + s * 0.68} L ${x + s * 0.74} ${y + s * 0.34}`} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ck} />}
          </g>
        );
      })}
    </g>
  );
};

/** Coloured outline around chosen cells. */
const Out: React.FC<{ names?: Names; cells: string[]; color: string; o: number | number[]; ox?: number; oy?: number; s?: number }> = ({ names = N3, cells, color, o, ox = OX, oy = OY, s = S }) => (
  <g fill="none" stroke={color} strokeWidth={11} strokeLinejoin="round">
    {cells.map((n, i) => {
      const op = Array.isArray(o) ? o[i] : o;
      if (op <= 0) return null;
      const [r, c] = names[n];
      return <rect key={n} x={ox + c * s + 8} y={oy + r * s + 8} width={s - 16} height={s - 16} rx={10} opacity={op} />;
    })}
  </g>
);

const redCenter: Step[] = [[0, RED]];
const centerLabel = (o = 1) => ({ C: { text: 'R', color: '#fff', o, size: 72 } });

// ---------- mini grids (pattern lists) ----------

const M = 56;
/** Edge letters in T, L, R, B order. */
const Mini: React.FC<{
  x: number;
  y: number;
  e: string;
  corner?: Record<string, string>;
  nums?: Record<string, { t: string; c?: string }>;
  o?: number;
  scale?: number;
  m?: number;
}> = ({ x, y, e, corner = {}, nums = {}, o = 1, scale = 1, m = M }) => {
  const edge: Record<string, string> = { T: e[0], L: e[1], R: e[2], B: e[3] };
  return (
    <g opacity={o} transform={`translate(${x + (3 * m) / 2} ${y + (3 * m) / 2}) scale(${scale}) translate(${-(3 * m) / 2} ${-(3 * m) / 2})`}>
      {Object.entries(N3).map(([n, [r, c]]) => {
        const fill = n === 'C' ? RED : edge[n] ? COL[edge[n]] : corner[n] ? COL[corner[n]] : C.card;
        const nm = nums[n];
        return (
          <g key={n}>
            <rect x={c * m} y={r * m} width={m} height={m} fill={fill} stroke={C.ink} strokeWidth={2.5} />
            {nm && (
              <text x={c * m + m / 2} y={r * m + m / 2 + 2} fill={nm.c ?? C.ink} fontFamily={NUNITO} fontWeight={900} fontSize={40} textAnchor="middle" dominantBaseline="central">
                {nm.t}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ---------- html helpers ----------

const win = (f: number, a: number, b = 1e9) => ease(f, a, 10) * (1 - ease(f, b, 10));

/** Absolutely placed text that fades in at a and out at b. */
const T: React.FC<{ x: number; y: number; w?: number; size?: number; weight?: number; color?: string; a: number; b?: number; align?: 'left' | 'center'; children: React.ReactNode }> = ({
  x, y, w = 900, size = 44, weight = 800, color = C.ink, a, b, align = 'left', children,
}) => {
  const f = useCurrentFrame();
  const o = win(f, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: align === 'center' ? x - w / 2 : x, top: y + (1 - o) * 20, width: w, fontSize: size, fontWeight: weight, color, opacity: o, lineHeight: 1.3, textAlign: align }}>
      {children}
    </div>
  );
};

const P: React.FC<{ x: number; y: number; color: string; a: number; b?: number; size?: number; children: React.ReactNode }> = ({ x, y, color, a, b, size = 44, children }) => {
  const f = useCurrentFrame();
  const o = win(f, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y + (1 - o) * 20, opacity: o, background: color, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap' }}>
      {children}
    </div>
  );
};

const Eq: React.FC<{ x: number; y: number; tex: string; a: number; b?: number; size?: number; color?: string }> = ({ x, y, tex, a, b, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  const o = win(f, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y + (1 - o) * 20, whiteSpace: 'nowrap', opacity: o }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Five answer choices (all ≥ 48 px). `mark` = frame at which D gets the green check. `wrong` = frame at which the wrong ones get red outlines per index. */
const CHOICES = ['16', '32', '81', '82', '162'];
const Chips: React.FC<{ x: number; y: number; start: (i: number) => number; mark?: number; size?: number }> = ({ x, y, start, mark, size = 52 }) => {
  const f = useCurrentFrame();
  const m = mark === undefined ? 0 : ease(f, mark, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 18 }}>
      {CHOICES.map((c, i) => {
        const good = i === 3 && m > 0;
        return (
          <div
            key={c}
            style={{
              ...fadeUp(f, start(i), 10),
              background: C.card,
              borderRadius: 999,
              padding: '8px 24px',
              fontSize: size,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 14px rgba(30,40,80,0.07)',
              border: `6px solid ${good ? C.green : 'transparent'}`,
            }}
          >
            <span style={{ color: C.muted, fontSize: size - 8 }}>{'ABCDE'[i]}</span>
            {c}
            {good && (
              <svg width={44} height={44} viewBox="0 0 54 54">
                <circle cx={27} cy={27} r={27} fill={C.green} />
                <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Row of three colour swatches with ok / no marks. marks[i] = [frame, ok]. */
const Opts: React.FC<{ x: number; y: number; order: string[]; marks: [number, boolean][]; a: number; b?: number }> = ({ x, y, order, marks, a, b }) => {
  const f = useCurrentFrame();
  const o = win(f, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 40, opacity: o }}>
      {order.map((c, i) => {
        const [mf, ok] = marks[i];
        const p = ease(f, mf, 8);
        return (
          <div key={i} style={{ width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 96, height: 96, borderRadius: 16, background: COL[c], border: `4px solid ${C.ink}` }} />
            <div style={{ height: 56, opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>
              {ok ? (
                <svg width={56} height={56} viewBox="0 0 54 54">
                  <circle cx={27} cy={27} r={27} fill={C.green} />
                  <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width={56} height={56} viewBox="0 0 54 54">
                  <circle cx={27} cy={27} r={27} fill={RED} />
                  <path d="M17 17 L37 37 M37 17 L17 37" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Sw: React.FC<{ c: string }> = ({ c }) => <span style={{ display: 'inline-block', width: 56, height: 56, borderRadius: 12, background: COL[c], border: `4px solid ${C.ink}`, verticalAlign: 'middle' }} />;

/** "neighbors match → 2 options / differ → 1 option" */
const RuleCard: React.FC<{ x: number; y: number; a: number; b?: number }> = ({ x, y, a, b }) => {
  const f = useCurrentFrame();
  const o = win(f, a, b);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y + (1 - o) * 20, width: 900, opacity: o, background: C.card, borderRadius: 32, padding: '34px 44px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', border: `5px solid ${C.violet}` }}>
      <div style={{ fontSize: 40, fontWeight: 900, color: C.violet, marginBottom: 18 }}>A corner's options</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 52, fontWeight: 900 }}>
        <span style={{ whiteSpace: 'nowrap' }}>
          <Sw c="B" /> <Sw c="B" />
        </span>
        <span>neighbors match</span>
        <span style={{ color: C.violet }}>→ 2</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 52, fontWeight: 900, marginTop: 20 }}>
        <span style={{ whiteSpace: 'nowrap' }}>
          <Sw c="B" /> <Sw c="G" />
        </span>
        <span>neighbors differ</span>
        <span style={{ color: C.violet }}>→ 1</span>
      </div>
    </div>
  );
};

const Vantee: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, ...fadeUp(f, a) }}>
      <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
      <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
    </div>
  );
};

const PANEL = 900;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = at(scene, 1, 0.08);
  const b = at(scene, 1, 0.42);
  const mid: [number, number] = [OX + S, OY + S / 2];
  const xo = win(f, a + 6, b);
  return (
    <>
      <Stage>
        <Board
          fills={{ C: [[at(scene, 0, 0.5), RED]], TL: [[a, BLUE], [b, null]], T: [[a, BLUE], [b, null]] }}
          labels={{ C: { text: 'R', color: '#fff', o: ease(f, at(scene, 0, 0.6), 8), size: 72 } }}
        />
        <XMark at={mid} size={70} opacity={xo} />
      </Stage>
      <T x={PANEL} y={220} size={72} weight={900} a={at(scene, 0, 0.05)}>9 squares, 3 colors</T>
      <T x={PANEL} y={330} size={56} color={RED} a={at(scene, 1, 0.05)}>Neighbors can't match!</T>
      <T x={PANEL} y={440} size={64} weight={900} color={C.violet} a={at(scene, 1, 0.6)}>How many colorings?</T>
      <Vantee x={PANEL} y={580} a={at(scene, 2, 0.05)} />
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Board fills={{ C: redCenter }} labels={centerLabel(1)} />
      </Stage>
      <div style={{ position: 'absolute', left: PANEL, top: 150, width: 960, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 1, 0.05)) }}>
        Each square of the{' '}
        <Mark on={at(scene, 1, 0.3)}>
          <Tex tex={'3 \\times 3'} size={46} />
        </Mark>{' '}
        grid shown is colored red, blue or green. <Mark on={at(scene, 2, 0.05)}>The center square is red.</Mark>{' '}
        <Mark on={at(scene, 2, 0.45)}>Squares that share a side must be different colors.</Mark> <Mark on={at(scene, 3, 0.05)}>Not every color has to be used.</Mark>{' '}
        <Mark on={at(scene, 3, 0.55)}>How many colorings are there?</Mark>
      </div>
      <Chips x={PANEL} y={640} start={(i) => at(scene, 4, 0.2 + i * 0.12)} />
    </>
  );
};

const EDGES = ['T', 'L', 'R', 'B'];
const CORNERS = ['TL', 'TR', 'BR', 'BL'];

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const eo = EDGES.map((_, i) => ease(f, at(scene, 0, 0.35 + i * 0.1), 10));
  const co = CORNERS.map((_, i) => ease(f, at(scene, 1, 0.1 + i * 0.1), 10));
  const arr = ease(f, at(scene, 1, 0.55), 10);
  const sh = ease(f, at(scene, 1, 0.8), 10);
  const all = ease(f, at(scene, 2, 0.1), 10);
  const [tlx, tly] = ctr(N3, 'TL');
  return (
    <>
      <Stage>
        <Board fills={{ C: redCenter }} labels={centerLabel(1)} />
        <Out cells={EDGES} color={EDGE} o={eo} />
        <Out cells={CORNERS} color={CORN} o={co} />
        <Arrow a={[tlx + 50, tly]} b={[tlx + 112, tly]} label="" color={CORN} opacity={arr} />
        <Arrow a={[tlx, tly + 50]} b={[tlx, tly + 112]} label="" color={CORN} opacity={arr} />
        <line x1={tlx + 52} y1={tly + 52} x2={tlx + 118} y2={tly + 118} stroke={RED} strokeWidth={7} strokeDasharray="12 10" strokeLinecap="round" opacity={sh} />
        <XMark at={[tlx + 85, tly + 85]} size={40} opacity={sh} />
      </Stage>
      <P x={PANEL} y={190} color={EDGE} a={at(scene, 0, 0.3)}>edge squares: 4</P>
      <P x={PANEL} y={290} color={CORN} a={at(scene, 1, 0.08)}>corner squares: 4</P>
      <T x={PANEL} y={390} size={44} color={C.violet} a={at(scene, 1, 0.5)}>each corner touches 2 edges</T>
      <T x={OX} y={706} w={1000} size={46} color={RED} a={at(scene, 1, 0.78)}>corner and center share only a point</T>
      <P x={PANEL} y={500} color={C.green} a={at(scene, 2, 0.1)} size={50}>8 squares to color</P>
      <Stage>
        <g opacity={all * 0.0} />
      </Stage>
    </>
  );
};

const makePause = (seconds: number, prompt: string, mode: '3x3' | '2x3'): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        {mode === '3x3' ? (
          <Board fills={{ C: redCenter }} labels={centerLabel(1)} />
        ) : (
          <Board ox={VX} oy={VY} names={N23} fills={{ BM: redCenter }} labels={{ BM: { text: 'R', color: '#fff', o: 1, size: 72 } }} />
        )}
      </Stage>
      <T x={mode === '3x3' ? OX : VX} y={mode === '3x3' ? 710 : 640} w={800} size={48} a={6}>
        {prompt}
      </T>
      <Countdown scene={scene} seconds={seconds} x={1330} y={450} tick={TICK} />
      {mode === '3x3' && <Chips x={PANEL + 40} y={740} start={(i) => 10 + i * 4} />}
      <div style={{ opacity: 0 * f }} />
    </>
  );
};

const Edges: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const chipO = (i: number) => ease(f, l(0, 0.3 + i * 0.1), 10);
  const chips: Num = {
    T: chipO(0) * (1 - ease(f, l(2, 0.3), 8)),
    L: chipO(1) * (1 - ease(f, l(2, 0.3), 8)),
    R: chipO(2) * (1 - 0.7 * ease(f, l(2, 0.1), 10)),
    B: chipO(3) * (1 - 0.7 * ease(f, l(2, 0.1), 10)),
  };
  const dim: Num = { C: 1 };
  const fade = 1 - 0.6 * ease(f, l(2, 0.05), 10);
  for (const n of ['TR', 'BL', 'BR', 'R', 'B']) dim[n] = fade;
  const fills: Record<string, Step[]> = {
    C: redCenter,
    T: [[l(2, 0.3), BLUE]],
    L: [[l(2, 0.3), BLUE], [l(4, 0.15), GRN]],
    TL: [[l(3, 0.12), RED], [l(3, 0.42), GRN], [l(3, 0.72), BLUE], [l(3, 0.97), null], [l(4, 0.7), RED]],
  };
  const tlOut = ease(f, l(2, 0.5), 10);
  const bluexo = win(f, l(3, 0.78), l(3, 0.97));
  const [tlx, tly] = ctr(N3, 'TL');
  return (
    <>
      <Stage>
        <Board fills={fills} chips={chips} dim={dim} labels={centerLabel(1)} />
        <Out cells={['TL']} color={CORN} o={tlOut} />
        <XMark at={[tlx, tly]} size={64} opacity={bluexo} />
      </Stage>
      {/* L0, L1 */}
      <T x={PANEL} y={190} size={62} a={l(0, 0.5)} b={l(2)}>
        edges touch red:{' '}
        <span style={{ color: RED }}>no R</span>
      </T>
      <Eq x={PANEL} y={310} tex={'2\\times2\\times2\\times2=16'} a={l(1, 0.1)} b={l(2)} />
      <P x={PANEL} y={420} color={EDGE} a={l(1, 0.6)} b={l(2)}>16 edge patterns</P>
      {/* L2 */}
      <T x={PANEL} y={190} size={44} a={l(2, 0.1)} b={l(4)} color={C.violet}>
        Top-left corner: top and left are both blue
      </T>
      {/* L3 */}
      <T x={PANEL} y={330} size={46} a={l(3, 0.05)} b={l(4)} color={C.muted}>doesn't touch the center</T>
      <Opts x={PANEL} y={410} order={['R', 'G', 'B']} marks={[[l(3, 0.18), true], [l(3, 0.48), true], [l(3, 0.78), false]]} a={l(3, 0.1)} b={l(4)} />
      <P x={PANEL + 420} y={460} color={C.primary} a={l(3, 0.9)} b={l(4)}>2 options</P>
      {/* L4 */}
      <T x={PANEL} y={330} size={46} a={l(4, 0.05)} b={l(5)} color={C.muted}>top is blue, left is green</T>
      <Opts x={PANEL} y={410} order={['B', 'G', 'R']} marks={[[l(4, 0.25), false], [l(4, 0.45), false], [l(4, 0.65), true]]} a={l(4, 0.1)} b={l(5)} />
      <P x={PANEL + 420} y={460} color={C.primary} a={l(4, 0.75)} b={l(5)}>1 option</P>
      {/* L5 */}
      <RuleCard x={PANEL} y={220} a={l(5, 0.15)} />
    </>
  );
};

// ----- groups -----

const A_P = ['BBBB', 'GGGG'];
const B_P = ['BGGB', 'GBBG'];
const C1 = ['B', 'G'].flatMap((maj) => range(4).map((odd) => range(4).map((k) => (k === odd ? (maj === 'B' ? 'G' : 'B') : maj)).join('')));
const C2 = [[0, 2], [2, 3], [3, 1], [1, 0]].map((pr) => range(4).map((k) => (pr.includes(k) ? 'B' : 'G')).join(''));
const ROW2 = 398;
const ROW3 = 584;
const A_X = (i: number) => 56 + i * 180;
const B_X = (i: number) => 466 + i * 180;
const C1_X = (i: number) => 60 + i * 176;
const C2_X = (i: number) => 60 + i * 180;

const Groups: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const dimA = interpolate(f, [0, l(3), l(3) + 12, l(5), l(5) + 12], [1, 1, 0.3, 0.3, 0.3], clamp);
  const dimB = interpolate(f, [0, l(1), l(1) + 12, l(3), l(3) + 12, l(5), l(5) + 12], [1, 1, 0.3, 0.3, 1, 1, 0.3], clamp);
  // dimB: dims while A is spoken, bright on lines 3-4, dim afterwards
  const dimBfix = interpolate(f, [0, l(1), l(1) + 12, l(3), l(3) + 12, l(5), l(5) + 12], [1, 1, 0.3, 0.3, 1, 1, 0.3], clamp);
  const dimC = interpolate(f, [0, l(1), l(1) + 12, l(5), l(5) + 12], [1, 1, 0.3, 0.3, 1], clamp);
  void dimB;
  const popAt = (k: number) => ease(f, l(0, 0.1 + k * 0.035), 10);
  const bandO = ease(f, l(0, 0.02), 14);
  const aNums = ease(f, l(2, 0.12), 10);
  const bRed = ease(f, l(4, 0.15), 10);
  const grey = (v: number) => v; // keep helper for readability
  const ex1o = ease(f, l(6, 0.1), 10);
  const ex2o = ease(f, l(6, 0.4), 10);
  return (
    <>
      <Stage>
        {/* bands */}
        <rect x={40} y={120} width={380} height={250} rx={26} fill={C.violet} opacity={0.14 * bandO * grey(dimA)} />
        <rect x={450} y={120} width={380} height={250} rx={26} fill={C.amber} opacity={0.16 * bandO * dimBfix} />
        <rect x={40} y={384} width={1840} height={380} rx={26} fill="#06b6d4" opacity={0.12 * bandO * dimC} />
        {/* A: all four edges match */}
        {A_P.map((e, i) => (
          <Mini key={e} x={A_X(i)} y={190} e={e} o={popAt(i) * dimA} scale={0.8 + 0.2 * popAt(i)} nums={aNums > 0 ? { TL: { t: '2' }, TR: { t: '2' }, BL: { t: '2' }, BR: { t: '2' } } : {}} />
        ))}
        {/* B: take turns */}
        {B_P.map((e, i) => (
          <Mini
            key={e}
            x={B_X(i)}
            y={190}
            e={e}
            o={popAt(2 + i) * dimBfix}
            scale={0.8 + 0.2 * popAt(2 + i)}
            corner={bRed > 0.5 ? { TL: 'R', TR: 'R', BL: 'R', BR: 'R' } : {}}
            nums={bRed > 0.5 ? { TL: { t: '1', c: '#fff' }, TR: { t: '1', c: '#fff' }, BL: { t: '1', c: '#fff' }, BR: { t: '1', c: '#fff' } } : {}}
          />
        ))}
        {/* C1: three and one */}
        {C1.map((e, i) => (
          <Mini key={e} x={C1_X(i)} y={ROW2} e={e} o={popAt(4 + i) * dimC} scale={0.8 + 0.2 * popAt(4 + i)} />
        ))}
        {C2.map((e, i) => (
          <Mini key={e} x={C2_X(i)} y={ROW3} e={e} o={popAt(12 + i) * dimC} scale={0.8 + 0.2 * popAt(12 + i)} />
        ))}
        {/* worked examples */}
        <Mini x={1100} y={ROW3} e="GBBB" o={ex1o} nums={{ TL: { t: '1' }, TR: { t: '1' }, BL: { t: '2', c: '#065f46' }, BR: { t: '2', c: '#065f46' } }} />
        <Mini x={1300} y={ROW3} e="BGBG" o={ex2o} nums={{ TL: { t: '1' }, TR: { t: '2', c: '#065f46' }, BL: { t: '2', c: '#065f46' }, BR: { t: '1' } }} />
      </Stage>
      <T x={56} y={122} w={370} size={48} color={C.violet} a={l(0, 0.3)}>all four match</T>
      <T x={466} y={122} w={370} size={48} color="#b7791f" a={l(0, 0.3)}>take turns</T>
      <T x={800} y={ROW3 + 20} w={680} size={48} color="#0e7490" a={l(5, 0.55)} b={l(6)}>4 · two and two, side by side</T>
      <T x={1500} y={ROW2 + 6} w={360} size={56} weight={900} color="#0e7490" a={l(5, 0.1)}>12 left</T>
      <T x={1500} y={ROW2 + 76} w={380} size={48} color="#0e7490" a={l(5, 0.35)} b={l(6)}>8 · three and one</T>
      <Eq x={880} y={134} tex={'2\\times2\\times2\\times2=16'} a={l(2, 0.3)} />
      <Eq x={880} y={214} tex={'2\\times16=32'} a={l(2, 0.7)} />
      <Eq x={1400} y={214} tex={'2\\times1=2'} a={l(4, 0.75)} color={C.ink} />
      <Eq x={1500} y={ROW3 + 30} tex={'2\\times2=4'} a={l(6, 0.7)} />
      <Eq x={1490} y={ROW2 + 90} tex={'12\\times4=48'} a={l(7, 0.35)} color={C.violet} size={56} />
    </>
  );
};

const Total1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const start = l(0, 0.93);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(f, l(0, 0.02)) }}>
        <Tex tex={'32+48+2=82'} size={110} />
      </div>
      <Chips x={470} y={420} start={(i) => l(0, 0.1 + i * 0.05)} mark={start} size={56} />
      <Confetti x={960} y={700} start={start} seed={7} />
      <Answer x={960} y={700} value="D" start={start} chime={CHIME} />
    </>
  );
};

// ----- corners (second solution) -----

const ROWS: { label: string; first?: string; tex?: string; sub: string }[] = [
  { label: '0', tex: '1\\times16=16', sub: '16' },
  { label: '1', first: '4\\times2', tex: '4\\times2\\times4=32', sub: '32' },
  { label: '2 · same side', tex: '4\\times4=16', sub: '16' },
  { label: '2 · opposite', tex: '2\\times4=8', sub: '8' },
  { label: '3', tex: '4\\times2=8', sub: '8' },
  { label: '4', tex: '1\\times2=2', sub: '2' },
];
const ROW_Y = (i: number) => 205 + i * 86;

const Corners: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  // each row appears on its line
  const rowOn = [l(3, 0.3), l(4, 0.05), l(6, 0.05), l(7, 0.05), l(8, 0.05), l(8, 0.6)];
  const rowLabelOn = [l(0, 0.3), l(0, 0.4), l(0, 0.5), l(0, 0.6), l(0, 0.7), l(0, 0.8)];
  const subOn = [l(3, 0.5), l(5, 0.55), l(6, 0.6), l(7, 0.6), l(8, 0.45), l(8, 0.9)];
  const fillsG: Record<string, Step[]> = {
    C: redCenter,
    // corners
    TL: [[l(1, 0.2), RED], [l(2, 0.1), GRN], [l(3, 0.1), RED], [l(4, 0.1), GRN], [l(6, 0.1), GRN], [l(7, 0.1), GRN], [l(8, 0.1), GRN], [l(9, 0.0), null]],
    TR: [[l(1, 0.3), RED], [l(2, 0.1), null], [l(3, 0.2), RED], [l(4, 0.1), null], [l(6, 0.1), GRN], [l(7, 0.1), RED], [l(8, 0.1), GRN], [l(9, 0.0), null]],
    BR: [[l(1, 0.4), RED], [l(2, 0.1), null], [l(3, 0.3), RED], [l(4, 0.1), null], [l(7, 0.1), BLUE], [l(8, 0.1), GRN], [l(9, 0.0), null]],
    BL: [[l(1, 0.5), RED], [l(2, 0.1), null], [l(3, 0.4), RED], [l(4, 0.1), null], [l(7, 0.1), RED], [l(8, 0.1), RED], [l(8, 0.55), GRN], [l(9, 0.0), null]],
    // edges
    T: [[l(2, 0.2), BLUE], [l(3, 0.0), null], [l(4, 0.1), BLUE], [l(6, 0.1), BLUE], [l(7, 0.1), BLUE], [l(8, 0.1), BLUE], [l(9, 0.0), null]],
    L: [[l(2, 0.2), BLUE], [l(3, 0.0), null], [l(4, 0.1), BLUE], [l(6, 0.1), BLUE], [l(7, 0.1), BLUE], [l(8, 0.1), BLUE], [l(9, 0.0), null]],
    R: [[l(6, 0.1), BLUE], [l(7, 0.1), GRN], [l(8, 0.1), BLUE], [l(9, 0.0), null]],
    B: [[l(7, 0.1), GRN], [l(8, 0.1), BLUE], [l(9, 0.0), null]],
  };
  const chips: Num = {
    T: win(f, l(3, 0.05), l(4)),
    L: win(f, l(3, 0.05), l(4)),
    R: win(f, l(3, 0.05), l(6)),
    B: win(f, l(3, 0.05), l(7)),
  };
  chips.B = Math.max(chips.B, win(f, l(6, 0.1), l(7)));
  const checks: Num = { TL: win(f, l(1, 0.25), l(2)), TR: win(f, l(1, 0.35), l(2)), BR: win(f, l(1, 0.45), l(2)), BL: win(f, l(1, 0.55), l(2)) };
  const cOut = [win(f, l(0, 0.35), l(1)), win(f, l(0, 0.45), l(1)), win(f, l(0, 0.55), l(1)), win(f, l(0, 0.65), l(1))];
  return (
    <>
      <Stage>
        <Board fills={fillsG} chips={chips} checks={checks} labels={centerLabel(1)} />
        <Out cells={CORNERS} color={CORN} o={cOut} />
      </Stage>
      <Eq x={OX} y={706} tex={'2\\times2=4'} a={l(6, 0.55)} b={l(8)} />
      <Eq x={OX} y={706} tex={'2\\times2=4'} a={l(8)} b={l(9)} />
      {/* table */}
      <T x={PANEL} y={150} w={300} size={34} weight={800} color={C.muted} a={l(0, 0.2)} b={l(10, 0.0)}>non-red corners</T>
      <T x={PANEL + 330} y={150} w={300} size={34} weight={800} color={C.muted} a={l(0, 0.2)} b={l(10, 0.0)}>ways</T>
      <T x={PANEL + 700} y={150} w={300} size={34} weight={800} color={C.muted} a={l(0, 0.2)} b={l(10, 0.0)}>total</T>
      {ROWS.map((r, i) => (
        <div key={i}>
          <T x={PANEL} y={ROW_Y(i) + 8} w={320} size={40} color={C.ink} a={rowLabelOn[i]} b={l(10)}>
            {r.label}
          </T>
          {r.first && <Eq x={PANEL + 330} y={ROW_Y(i)} tex={r.first} a={rowOn[i]} b={subOn[i]} size={50} />}
          {r.tex && <Eq x={PANEL + 330} y={ROW_Y(i)} tex={r.tex.split('=')[0]} a={r.first ? subOn[i] - 4 : rowOn[i]} b={l(10)} size={50} />}
          <Eq x={PANEL + 720} y={ROW_Y(i)} tex={r.sub} a={subOn[i]} b={l(10)} size={52} color={C.violet} />
        </div>
      ))}
      <Eq x={PANEL} y={738} tex={'16+32+16+8+8+2=82'} a={l(9, 0.3)} b={l(10)} size={58} color={C.green} />
      {/* L10 */}
      <div style={{ position: 'absolute', left: PANEL, top: 230, width: 900, ...fadeUp(f, l(10, 0.15)), opacity: win(f, l(10, 0.15)) }}>
        <div style={{ background: C.card, border: `5px solid ${C.primary}`, borderRadius: 28, padding: '22px 36px', fontSize: 48, fontWeight: 900 }}>
          Edges first: <span style={{ color: C.primary }}>quicker</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 390, width: 900, opacity: win(f, l(10, 0.5)), transform: `translateY(${(1 - win(f, l(10, 0.5))) * 20}px)` }}>
        <div style={{ background: C.card, border: `5px solid ${C.violet}`, borderRadius: 28, padding: '22px 36px', fontSize: 48, fontWeight: 900 }}>
          Corners first: <span style={{ color: C.violet }}>double-check</span>
        </div>
      </div>
    </>
  );
};

// ----- traps -----

const TRAPS: { idx: number; ch: string; v: string; eqs: string[]; note: string }[] = [
  { idx: 1, ch: 'A', v: '16', eqs: ['2^4=16'], note: 'corners forgotten' },
  { idx: 2, ch: 'B', v: '32', eqs: ['2\\times16'], note: 'only all-match edges' },
  { idx: 3, ch: 'C', v: '81', eqs: ['3^4=81', '82-1'], note: 'a tempting guess' },
  { idx: 4, ch: 'E', v: '162', eqs: ['2\\times81=162'], note: 'too many' },
];
const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <T x={960} y={140} w={1500} size={56} weight={900} align="center" a={l(0, 0.1)}>
        Each wrong answer is a <span style={{ color: RED }}>trap</span>
      </T>
      {TRAPS.map((t, i) => {
        const a = l(t.idx, 0.05);
        const o = ease(f, a, 12);
        return (
          <div
            key={t.v}
            style={{
              position: 'absolute',
              left: 60 + i * 462,
              top: 270,
              width: 430,
              height: 410,
              boxSizing: 'border-box',
              background: C.card,
              border: `6px solid ${RED}`,
              borderRadius: 28,
              padding: '22px 24px',
              opacity: o,
              transform: `translateY(${(1 - o) * 30}px)`,
              boxShadow: '0 8px 24px rgba(239,67,67,0.12)',
            }}
          >
            <div style={{ fontSize: 60, fontWeight: 900, color: RED }}>
              <span style={{ fontSize: 46, color: C.muted, marginRight: 12 }}>{t.ch}</span>
              {t.v}
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {t.eqs.map((e, k) => (
                <div key={k} style={{ whiteSpace: 'nowrap', opacity: ease(f, l(t.idx, 0.35 + k * 0.3), 10) }}>
                  <Tex tex={e} size={52} />
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', left: 24, bottom: 20, right: 12, fontSize: 36, whiteSpace: 'nowrap', fontWeight: 800, color: RED, opacity: ease(f, l(t.idx, 0.6), 10) }}>{t.note}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center', opacity: win(f, l(5, 0.2)), transform: `translateY(${(1 - win(f, l(5, 0.2))) * 20}px)` }}>
        <div style={{ background: C.card, border: `5px solid ${C.primary}`, borderRadius: 999, padding: '14px 44px', fontSize: 48, fontWeight: 900 }}>
          Habit: split into <span style={{ color: C.primary }}>cases</span>, count each one
        </div>
      </div>
    </>
  );
};

// ----- variant -----

const VBoard: React.FC<{ fills?: Record<string, Step[]>; chips?: Num; labels?: Record<string, { text: string; color?: string; o: number; size?: number }> }> = ({ fills, chips, labels }) => (
  <Board
    ox={VX}
    oy={VY}
    names={N23}
    fills={{ BM: redCenter, ...fills }}
    chips={chips}
    labels={{ BM: { text: 'R', color: '#fff', o: 1, size: 72 }, ...labels }}
  />
);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <Stage>
        <g opacity={ease(f, 4, 14)}>
          <Board ox={VX} oy={VY} names={N23} fills={{ BM: [[l(1, 0.2), RED]] }} labels={{ BM: { text: 'R', color: '#fff', o: ease(f, l(1, 0.3), 8), size: 72 } }} />
        </g>
      </Stage>
      <P x={PANEL + 60} y={190} color={C.violet} a={l(0, 0.35)} size={52}>2 by 3 grid</P>
      <T x={PANEL + 60} y={310} w={900} size={46} a={l(0, 0.55)}>
        same <span style={{ color: BLUE }}>3</span> <span style={{ color: GRN }}>colors</span>, neighbors must differ
      </T>
      <T x={PANEL + 60} y={410} w={900} size={46} a={l(1, 0.15)}>
        bottom middle is <span style={{ color: RED }}>red</span>
      </T>
      <T x={PANEL + 60} y={510} w={900} size={56} weight={900} color={C.violet} a={l(1, 0.6)}>How many colorings?</T>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const hl = ['BL', 'BR', 'TM'];
  const hlo = hl.map((_, i) => win(f, l(0, 0.55 + i * 0.12), l(3)));
  const chipsO: Num = { BL: win(f, l(1, 0.05), l(2, 0.15)), BR: win(f, l(1, 0.05), l(2, 0.15)), TM: win(f, l(1, 0.05), l(2, 0.15)) };
  const arrows = ease(f, l(2, 0.3), 12) * (1 - ease(f, l(3), 10));
  const [tl, tm, tr, bl, br] = ['TL', 'TM', 'TR', 'BL', 'BR'].map((n) => ctr(N23, n, VX, VY));
  const numO = (a: number, b: number) => win(f, a, b);
  const fills: Record<string, Step[]> = {
    TM: [[l(3, 0.1), BLUE]],
    BL: [[l(3, 0.1), BLUE], [l(4, 0.1), BLUE], [l(5, 0.1), GRN]],
    BR: [[l(3, 0.1), BLUE], [l(4, 0.1), GRN], [l(5, 0.1), GRN]],
  };
  const labels = {
    TL: { text: '2', o: numO(l(3, 0.3), l(4)) , size: 64 },
    TR: { text: '2', o: numO(l(3, 0.3), l(4)), size: 64 },
  };
  const labels4 = {
    TL: { text: '2', o: numO(l(4, 0.3), l(5)), size: 64 },
    TR: { text: '1', o: numO(l(4, 0.3), l(5)), size: 64 },
  };
  const labels5 = {
    TL: { text: '1', o: numO(l(5, 0.3), l(6, 0.5)), size: 64 },
    TR: { text: '1', o: numO(l(5, 0.3), l(6, 0.5)), size: 64 },
  };
  const lab: Record<string, { text: string; color?: string; o: number; size?: number }> = {};
  for (const [k, v] of Object.entries(labels)) lab[k] = v;
  const pick = (k: string) => [labels[k as 'TL'], labels4[k as 'TL'], labels5[k as 'TL']].find((x) => x.o > 0) ?? labels[k as 'TL'];
  lab.TL = pick('TL');
  lab.TR = pick('TR');
  const start = l(6, 0.93);
  const rowStyle = (a: number): React.CSSProperties => ({ position: 'absolute', left: PANEL, display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', opacity: win(f, a), transform: `translateY(${(1 - win(f, a)) * 20}px)` });
  const lbl: React.CSSProperties = { width: 300, fontSize: 40, fontWeight: 800 };
  return (
    <>
      <Stage>
        <VBoard fills={fills} chips={chipsO} labels={lab} />
        <Out names={N23} ox={VX} oy={VY} cells={hl} color={EDGE} o={hlo} />
        <Arrow a={[tl[0] + 55, tl[1]]} b={[tm[0] - 55, tm[1]]} label="" color={CORN} opacity={arrows} />
        <Arrow a={[tl[0], tl[1] + 55]} b={[bl[0], bl[1] - 55]} label="" color={CORN} opacity={arrows} />
        <Arrow a={[tr[0] - 55, tr[1]]} b={[tm[0] + 55, tm[1]]} label="" color={CORN} opacity={arrows} />
        <Arrow a={[tr[0], tr[1] + 55]} b={[br[0], br[1] - 55]} label="" color={CORN} opacity={arrows} />
      </Stage>
      <Eq x={PANEL} y={190} tex={'2\\times2\\times2=8'} a={l(1, 0.4)} />
      <T x={PANEL + 420} y={205} w={500} size={40} color={C.muted} a={l(1, 0.6)}>neighbor patterns</T>
      <div style={{ ...rowStyle(l(3, 0.45)), top: 330 }}>
        <div style={lbl}>all 3 match</div>
        <Tex tex={'2\\times4=8'} size={56} />
      </div>
      <div style={{ ...rowStyle(l(4, 0.5)), top: 440 }}>
        <div style={lbl}>1 matches</div>
        <Tex tex={'4\\times2=8'} size={56} />
      </div>
      <div style={{ ...rowStyle(l(5, 0.5)), top: 550 }}>
        <div style={lbl}>none match</div>
        <Tex tex={'2\\times1=2'} size={56} />
      </div>
      <Eq x={PANEL} y={640} tex={'8+8+2=18'} a={l(6, 0.1)} size={72} color={C.green} />
      <Confetti x={1710} y={700} start={start} seed={5} />
      <Answer x={1710} y={700} value="18" start={start} chime={CHIME} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const chips: Num = {};
  EDGES.forEach((n, i) => (chips[n] = ease(f, l(1, 0.35 + i * 0.1), 10)));
  const out = EDGES.map((_, i) => ease(f, l(1, 0.3 + i * 0.1), 10));
  return (
    <>
      <Stage>
        <Board fills={{ C: redCenter }} chips={chips} labels={centerLabel(1)} />
        <Out cells={EDGES} color={EDGE} o={out} />
      </Stage>
      <T x={PANEL} y={190} w={960} size={60} weight={900} color={C.violet} a={l(0, 0.1)}>The big idea</T>
      <RuleCard x={PANEL} y={310} a={l(2, 0.15)} b={l(3, 0.0)} />
      <Vantee x={PANEL + 40} y={310} a={l(3, 0.1)} />
      <Confetti x={1350} y={420} start={l(3, 0.25)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'How many colorings?', '3x3'),
  edges: Edges,
  groups: Groups,
  total1: Total1,
  corners: Corners,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'A 2 by 3 grid: how many colorings?', '2x3'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

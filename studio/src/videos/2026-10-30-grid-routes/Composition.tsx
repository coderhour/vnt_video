import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-grid-routes';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- grid geometry (maths coordinates: A = (0, 0) bottom-left, y grows UP, like the figure) ----------
// Main grid: 5 blocks across, 3 blocks up, X at (2, 1) (bank figure: circle at svg 130,130, 50 px per block).

const W = 5;
const H = 3;
const XC: Pt = [2, 1];

/** Corner coords → pixels: (ox, oy) is A on screen, `u` px per block. */
const plane = (ox: number, oy: number, u: number) => (p: Pt): Pt => [ox + p[0] * u, oy - p[1] * u];
type Map = (p: Pt) => Pt;

/** Corners visited by a route string like "RRUR…". */
const corners = (route: string, start: Pt = [0, 0]): Pt[] => {
  const pts: Pt[] = [start];
  let [x, y] = start;
  for (const s of route) {
    if (s === 'R') x += 1;
    else y += 1;
    pts.push([x, y]);
  }
  return pts;
};
const passes = (route: string, p: Pt) => corners(route).some(([x, y]) => x === p[0] && y === p[1]);

/** Corner numbers: ways to reach each corner = left + below, 0 at the blocked corner. */
const cornerTable = (w: number, h: number, bad: Pt | null) => {
  const T: number[][] = range(w + 1).map(() => range(h + 1).map(() => 0));
  for (let y = 0; y <= h; y++)
    for (let x = 0; x <= w; x++) {
      if (bad && x === bad[0] && y === bad[1]) T[x][y] = 0;
      else if (x === 0 && y === 0) T[x][y] = 1;
      else T[x][y] = (x > 0 ? T[x - 1][y] : 0) + (y > 0 ? T[x][y - 1] : 0);
    }
  return T;
};
const TABLE = cornerTable(W, H, XC); // B = 26 (same as verify.py)
const VTABLE = cornerTable(4, 4, [2, 2]); // B = 34

// ---------- drawing helpers ----------

const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ p, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** The street grid with A, B and (optionally) the corner X. `draw` 0→1 draws the streets on. */
const Streets: React.FC<{ m: Map; w?: number; h?: number; x?: Pt | null; draw?: number; opacity?: number; labels?: number; xOpacity?: number; dot?: number; stroke?: number; lo?: number }> = ({
  m, w = W, h = H, x = XC, draw = 1, opacity = 1, labels = 48, xOpacity = 1, dot = 14, stroke = 6, lo = 0.75,
}) => {
  if (opacity <= 0) return null;
  const u = m([1, 0])[0] - m([0, 0])[0];
  const lines: [Pt, Pt][] = [...range(w + 1).map((i): [Pt, Pt] => [[i, 0], [i, h]]), ...range(h + 1).map((j): [Pt, Pt] => [[0, j], [w, j]])];
  const [ax, ay] = m([0, 0]);
  const [bx, by] = m([w, h]);
  return (
    <g opacity={opacity}>
      {lines.map(([a, b], i) => {
        const [x1, y1] = m(a);
        const [x2, y2] = m(b);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeOpacity={0.55} strokeWidth={stroke} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />;
      })}
      <circle cx={ax} cy={ay} r={dot} fill={C.ink} opacity={draw} />
      <circle cx={bx} cy={by} r={dot} fill={C.ink} opacity={draw} />
      {labels > 0 && (
        <>
          <Label p={[ax - labels * lo, ay + labels * lo * 0.8]} text="A" size={labels} opacity={draw} />
          <Label p={[bx + labels * lo, by - labels * lo * 0.8]} text="B" size={labels} opacity={draw} />
        </>
      )}
      {x && xOpacity > 0 && (
        <g opacity={xOpacity * draw}>
          <circle cx={m(x)[0]} cy={m(x)[1]} r={Math.max(12, u * 0.13)} fill="#dddddd" stroke={C.ink} strokeWidth={4} />
          {/* red ring on the corner itself, with a short leader to its label */}
          <circle cx={m(x)[0]} cy={m(x)[1]} r={Math.max(12, u * 0.13) + 9} fill="none" stroke={C.red} strokeWidth={labels > 0 ? 5 : 3} />
          {labels > 0 && (() => {
            const k = labels * Math.max(1.0, lo * 0.85);
            const r0 = (Math.max(12, u * 0.13) + 9) / Math.SQRT2;
            const r1 = k - labels * 0.42;
            return (
              <>
                <line x1={m(x)[0] + r0} y1={m(x)[1] - r0} x2={m(x)[0] + r1} y2={m(x)[1] - r1} stroke={C.red} strokeWidth={4} strokeLinecap="round" />
                <Label p={[m(x)[0] + k, m(x)[1] - k]} text="X" size={labels} color={C.red} />
              </>
            );
          })()}
        </g>
      )}
    </g>
  );
};

/** A route drawn as a thick line that draws itself on as `progress` goes 0→1. */
const Route: React.FC<{ m: Map; route: string; start?: Pt; color: string; progress?: number; opacity?: number; width?: number }> = ({ m, route, start, color, progress = 1, opacity = 1, width = 14 }) => {
  if (progress <= 0 || opacity <= 0) return null;
  const d = `M ${corners(route, start).map((p) => m(p).join(' ')).join(' L ')}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />;
};

/** Red cross over a corner. */
const Cross: React.FC<{ p: Pt; size?: number; opacity: number }> = ({ p, size = 54, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={C.red} strokeWidth={12} strokeLinecap="round">
      <line x1={p[0] - size / 2} y1={p[1] - size / 2} x2={p[0] + size / 2} y2={p[1] + size / 2} />
      <line x1={p[0] + size / 2} y1={p[1] - size / 2} x2={p[0] - size / 2} y2={p[1] + size / 2} />
    </g>
  );

/** A number badge on a corner. */
const Num: React.FC<{ p: Pt; value: number; s: number; r?: number; color?: string; hi?: boolean }> = ({ p, value, s, r = 40, color = C.primary, hi }) =>
  s <= 0 ? null : (
    <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
      <circle r={r} fill={hi ? color : C.card} stroke={color} strokeWidth={5} />
      <text y={3} fontFamily={NUNITO} fontWeight={900} fontSize={Math.max(48, r * 1.15)} fill={hi ? '#fff' : color} textAnchor="middle" dominantBaseline="middle">
        {value}
      </text>
    </g>
  );

/** Shaded rectangle of blocks from corner a to corner b (a sub-grid). */
const Zone: React.FC<{ m: Map; a: Pt; b: Pt; color: string; opacity: number }> = ({ m, a, b, color, opacity }) => {
  if (opacity <= 0) return null;
  const [x1, y1] = m([a[0], b[1]]);
  const [x2, y2] = m([b[0], a[1]]);
  return <rect x={x1 - 18} y={y1 - 18} width={x2 - x1 + 36} height={y2 - y1 + 36} rx={24} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={5} opacity={opacity} />;
};

/** Bracket along the grid with a label. */
const Brace: React.FC<{ a: Pt; b: Pt; dx: number; dy: number; color: string; opacity: number; label: string; size?: number }> = ({ a, b, dx, dy, color, opacity, label, size = 48 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${a[0] + dx * 0.4} ${a[1] + dy * 0.4} L ${a[0] + dx} ${a[1] + dy} L ${b[0] + dx} ${b[1] + dy} L ${b[0] + dx * 0.4} ${b[1] + dy * 0.4}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label p={[(a[0] + b[0]) / 2 + dx * 2.2, (a[1] + b[1]) / 2 + dy * 2.2]} text={label} color={color} size={size} />
    </g>
  );

/** Arrow from a to b (pixels). */
const Arrow: React.FC<{ a: Pt; b: Pt; color: string; opacity: number; width?: number }> = ({ a, b, color, opacity, width = 7 }) => {
  if (opacity <= 0) return null;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => [b[0] - 22 * Math.cos(ang + s), b[1] - 22 * Math.sin(ang + s)].join(' ');
  return (
    <g opacity={opacity} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <path d={`M ${head(0.5)} L ${b[0]} ${b[1]} L ${head(-0.5)}`} />
    </g>
  );
};

/** A maths line placed absolutely. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

/** Little R / U step chips, e.g. "RRU". */
const StepChips: React.FC<{ s: string; size?: number; style?: React.CSSProperties }> = ({ s, size = 48, style }) => (
  <span style={{ display: 'inline-flex', gap: 6, ...style }}>
    {s.split('').map((c, i) => (
      <span key={i} style={{ width: size * 1.05, height: size * 1.2, borderRadius: 12, background: c === 'U' ? C.violetSoft : C.primarySoft, color: c === 'U' ? C.violet : C.primary, fontSize: size, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {c}
      </span>
    ))}
  </span>
);

// ---------- scenes ----------

const HOOK_ROUTES = ['RRRRRUUU', 'RRUURRRU', 'UUURRRRR', 'URRRRRUU', 'RRRURURU', 'RURRRUUR', 'UURRRURR', 'RRURRUUR'];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(400, 770, 150);
  const s0 = at(scene, 0, 0.05);
  const per = Math.round((scene.lines[0].frames * 0.85) / HOOK_ROUTES.length);
  const block = at(scene, 1, 0.3);
  const vanish = at(scene, 1, 0.6);
  return (
    <>
      <Stage>
        <Streets m={m} draw={ease(f, 0, 18)} xOpacity={ease(f, block, 10)} />
        {HOOK_ROUTES.map((r, i) => {
          const st = s0 + i * per;
          const bad = passes(r, XC);
          const ghost = f < st + per ? 1 : 0.35;
          const op = bad ? ghost * fadeTo(f, vanish, 0, 14) : ghost;
          const color = bad && f >= block ? C.red : C.violet;
          return <Route key={r} m={m} route={r} color={color} progress={ease(f, st, per)} opacity={op} width={12} />;
        })}
        <Cross p={m(XC)} opacity={ease(f, block, 10)} size={70} />
      </Stage>
      <Text x={1290} y={300} w={590} size={96} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.5))}>
        56 routes
      </Text>
      <Text x={1290} y={440} w={590} size={50} weight={900} color={C.red} style={fadeUp(f, at(scene, 1, 0.5))}>
        Block one corner: more than half vanish!
      </Text>
      <div style={{ position: 'absolute', left: 1290, top: 680, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CHOICES = ['20', '26', '30', '35', '56'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(1260, 600, 105);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1020, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        In the street grid shown, Mia walks from <Mark on={at(scene, 1, 0.35)}>A to B</Mark>, going <Mark on={at(scene, 1, 0.6)}>only right or up</Mark> along the streets. She{' '}
        <Mark on={at(scene, 2, 0.15)}>does not go through the corner marked X</Mark>. How many different routes can she take?
      </div>
      <Choices x={100} y={680} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
      <Stage>
        <Streets m={m} draw={ease(f, 6, 20)} />
      </Stage>
    </>
  );
};

const GOOD = 'RRRUURRU';
const BAD = 'RRUURRRU';

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(170, 700, 130);
  const goodOut = fadeTo(f, at(scene, 4), 0.25);
  return (
    <>
      <Stage>
        <Streets m={m} />
        <Brace a={m([0, 0])} b={m([5, 0])} dx={0} dy={30} color={C.primary} label="5 blocks" opacity={ease(f, at(scene, 0, 0.35), 12)} />
        <Brace a={m([5, 0])} b={m([5, 3])} dx={36} dy={0} color={C.violet} label="" opacity={ease(f, at(scene, 0, 0.7), 12)} />
        <Label p={[m([5, 0])[0] + 70, m([0, 1.5])[1]]} text="3 blocks" anchor="start" color={C.violet} size={48} opacity={ease(f, at(scene, 0, 0.7), 12)} />
        <Route m={m} route={GOOD} color={C.green} progress={ease(f, at(scene, 3, 0.1), 40)} opacity={goodOut} />
        <Route m={m} route={BAD} color={C.red} progress={ease(f, at(scene, 4, 0.1), 40)} />
        <Cross p={m(XC)} opacity={ease(f, at(scene, 4, 0.5), 10)} size={70} />
      </Stage>
      <div style={{ position: 'absolute', left: 1140, top: 200, ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Tex tex="5\ \text{right} + 3\ \text{up}" size={56} />
      </div>
      <div style={{ position: 'absolute', left: 1140, top: 290, ...fadeUp(f, at(scene, 1, 0.6)) }}>
        <Tex tex="= 8\ \text{steps}" size={56} />
      </div>
      <div style={{ position: 'absolute', left: 1140, top: 460, display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(f, at(scene, 3, 0.3)) }}>
        <span style={{ fontSize: 48, fontWeight: 900, color: C.green, width: 56 }}>✓</span>
        <StepChips s={GOOD} size={44} />
      </div>
      <div style={{ position: 'absolute', left: 1140, top: 570, display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(f, at(scene, 4, 0.3)) }}>
        <span style={{ fontSize: 48, fontWeight: 900, color: C.red, width: 56 }}>✗</span>
        <StepChips s={BAD} size={44} />
      </div>
      <Text x={1140} y={378} w={800} size={40} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.3))}>
        same 8 steps, a different order
      </Text>
      <Check x={1140} y={700} start={at(scene, 5, 0.2)}>Count routes that skip X</Check>
    </>
  );
};

const makePause = (w: number, h: number, x: Pt, seconds: number, prompt: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const u = w === 5 ? 120 : 100;
  const m = plane(540 - (w * u) / 2, 770, u);
  return (
    <>
      <Card x={110} y={150} w={860} h={180} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 44, right: 44, top: 34, fontSize: 48, fontWeight: 700, lineHeight: 1.4 }}>{prompt}</div>
      </Card>
      <Stage>
        <Streets m={m} w={w} h={h} x={x} draw={ease(f, 4, 16)} labels={48} />
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} />
    </>
  );
};

// ---- Solution 1: number the corners ----

const S1 = plane(190, 770, 150);

type Reveal = { p: Pt; at: number };

const Sol1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (i: number, t: number) => at(scene, i, t);
  // when each corner's number appears, in the order the narration says them
  const rev: Reveal[] = [
    { p: [0, 0], at: L(0, 0.85) },
    ...range(5).map((i): Reveal => ({ p: [i + 1, 0], at: L(1, 0.55 + i * 0.08) })),
    ...range(3).map((j): Reveal => ({ p: [0, j + 1], at: L(2, 0.55 + j * 0.1) })),
    { p: [1, 1], at: L(4, 0.75) },
    { p: [2, 1], at: L(6, 0.6) },
    { p: [3, 1], at: L(7, 0.3) },
    { p: [4, 1], at: L(7, 0.72) },
    { p: [5, 1], at: L(7, 0.9) },
    { p: [1, 2], at: L(8, 0.4) },
    { p: [2, 2], at: L(8, 0.85) },
    { p: [3, 2], at: L(9, 0.45) },
    { p: [4, 2], at: L(9, 0.62) },
    { p: [5, 2], at: L(9, 0.85) },
    { p: [1, 3], at: L(10, 0.3) },
    { p: [2, 3], at: L(10, 0.45) },
    { p: [3, 3], at: L(10, 0.62) },
    { p: [4, 3], at: L(10, 0.85) },
    { p: [5, 3], at: L(11, 0.5) },
  ];
  // the corner currently being built (only inner corners have a sum)
  const inner = rev.filter((r) => r.p[0] > 0 && r.p[1] > 0);
  const cur = [...inner].reverse().find((r) => f >= r.at - 8);
  const focus = f >= L(3, 0.2) && f < L(4, 0.75) ? ([1, 1] as Pt) : cur?.p;
  const showArrows = focus && f >= L(3, 0.2) && !(focus[0] === 2 && focus[1] === 1);
  const sumTex = (p: Pt) => {
    const [x, y] = p;
    if (x === 2 && y === 1) return 'X = 0';
    return `${TABLE[x - 1][y]} + ${TABLE[x][y - 1]} = ${TABLE[x][y]}`;
  };
  const done = L(11, 0.97);
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, L(0, 0.2))}>Number the corners</Pill>
      <Stage>
        <Streets m={S1} labels={52} xOpacity={1} lo={1.4} />
        {focus && showArrows && (
          <>
            <Arrow a={[S1([focus[0] - 1, focus[1]])[0] + 46, S1(focus)[1]]} b={[S1(focus)[0] - 48, S1(focus)[1]]} color={C.amber} opacity={1} />
            <Arrow a={[S1(focus)[0], S1([focus[0], focus[1] - 1])[1] - 46]} b={[S1(focus)[0], S1(focus)[1] + 48]} color={C.amber} opacity={1} />
          </>
        )}
        {rev.map((r) => {
          const [x, y] = r.p;
          const isX = x === 2 && y === 1;
          const isB = x === 5 && y === 3;
          return <Num key={`${x}-${y}`} p={S1(r.p)} value={TABLE[x][y]} s={pop(f, r.at, fps)} color={isX ? C.red : isB ? C.green : C.primary} hi={isB && f >= done - 10} />;
        })}
      </Stage>
      <Text x={1110} y={250} w={760} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, L(3, 0.3)) }}>
        last step: from the <span style={{ color: C.amber }}>left</span> or from <span style={{ color: C.amber }}>below</span>
      </Text>
      <Card x={1110} y={370} w={700} h={130} style={{ ...fadeUp(f, L(4, 0.1)), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Tex tex="\text{corner} = \text{left} + \text{below}" size={54} />
      </Card>
      {cur && f >= L(4, 0.5) && (
        <div style={{ position: 'absolute', left: 1110, top: 540, width: 540, textAlign: 'center' }}>
          <Tex tex={sumTex(cur.p)} size={80} color={cur.p[0] === 2 && cur.p[1] === 1 ? C.red : cur.p[0] === 5 && cur.p[1] === 3 ? C.green : C.primary} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 1110, top: 690, display: 'flex', alignItems: 'center', gap: 24, fontSize: 44, fontWeight: 800, color: C.muted, opacity: ease(f, L(5, 0.1)) * fadeTo(f, L(6, 0)) }}>
        <StepChips s="RU" size={48} /> or <StepChips s="UR" size={48} /> <span style={{ color: C.primary }}>= 2 ways</span>
      </div>
      <Answer x={1740} y={710} value="B" chime={CHIME} start={done} />
      <Confetti x={1740} y={710} start={done} seed={7} />
    </>
  );
};

// ---- Solution 2: count all, then subtract ----

const SLOT_UP = [3, 4, 7]; // the same route as GOOD: RRRUURRU

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t: number) => at(scene, i, t);
  const p1 = fadeTo(f, L(5, 0), 0, 12);
  const p2 = ease(f, L(5, 0.1), 14) * fadeTo(f, L(12, 0), 0, 12);
  const p3 = ease(f, L(12, 0.1), 14);
  const flip = L(1, 0.55);
  const pick = [L(2, 0.15), L(2, 0.45), L(2, 0.75)];
  const mini = plane(1450, 520, 70);
  const g = plane(160, 770, 110);
  // A -> X routes, cycled while line 6 plays
  const AX = ['RRU', 'RUR', 'URR'];
  const axStart = L(6, 0.45);
  const axStep = Math.round(Math.max(1, L(7, 0.2) - axStart) / 3);
  const axI = Math.min(2, Math.max(0, Math.floor((f - axStart) / axStep)));
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, L(0, 0.2))}>Count all, then subtract</Pill>
      {/* ---- phase 1: all routes ---- */}
      {p1 > 0 && (
        <div style={{ opacity: p1 }}>
          {range(8).map((i) => {
            const up = SLOT_UP.includes(i) && f >= flip;
            const k = SLOT_UP.indexOf(i);
            return (
              <div key={i} style={{ position: 'absolute', left: 120 + i * 150, top: 270, width: 130, ...fadeUp(f, L(1, 0.05) + i * 2) }}>
                <div style={{ height: 120, borderRadius: 20, background: up ? C.violetSoft : C.card, border: `5px solid ${up ? C.violet : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: up ? C.violet : C.primary }}>
                  {up ? 'U' : 'R'}
                </div>
                <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.muted, marginTop: 6 }}>step {i + 1}</div>
                {k >= 0 && (
                  <div style={{ textAlign: 'center', fontSize: 48, fontWeight: 900, color: C.violet, marginTop: 4, ...fadeUp(f, pick[k]) }}>
                    {['1st', '2nd', '3rd'][k]}
                  </div>
                )}
              </div>
            );
          })}
          <Eq x={120} y={528} start={pick[0]} size={64} tex="8" />
          <Eq x={180} y={528} start={pick[1]} size={64} tex="\times\, 7" />
          <Eq x={300} y={528} start={pick[2]} size={64} tex="\times\, 6 = 336" />
          <Eq x={670} y={530} start={L(3, 0.4)} size={60} tex="\text{orders: } 3 \times 2 \times 1 = 6" />
          <Eq x={120} y={628} start={L(4, 0.2)} size={64} color={C.green} tex="\dfrac{336}{6} = 56 \text{ routes}" />
        </div>
      )}
      {p1 > 0 && (
        <Stage>
          <g opacity={p1 * ease(f, flip, 12)}>
            <Streets m={mini} labels={40} dot={10} stroke={5} />
            <Route m={mini} route={GOOD} color={C.violet} progress={ease(f, flip + 6, 24)} width={10} />
          </g>
        </Stage>
      )}
      {/* ---- phase 2: routes through X ---- */}
      {p2 > 0 && (
        <>
          <Stage>
            <g opacity={p2}>
              <Zone m={g} a={[0, 0]} b={XC} color={C.violet} opacity={ease(f, L(6, 0.1), 12)} />
              <Zone m={g} a={XC} b={[5, 3]} color={C.amber} opacity={ease(f, L(7, 0.4), 12)} />
              <Streets m={g} labels={48} />
              {f >= axStart && <Route m={g} route={AX[axI]} color={C.violet} progress={ease(f, axStart + axI * axStep, 14)} width={12} />}
              <Route m={g} route="RURUR" start={XC} color={C.amber} progress={ease(f, L(8, 0.2), 30)} width={12} />
            </g>
          </Stage>
          <div style={{ opacity: p2 }}>
            <div style={{ position: 'absolute', left: 900, top: 240, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, L(6, 0.2)) }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: C.violet, width: 210 }}>A → X:</span>
              {AX.map((s, i) => (
                <StepChips key={s} s={s} size={44} style={{ marginRight: 18, opacity: f >= axStart + i * axStep ? 1 : 0.25 }} />
              ))}
            </div>
            <Eq x={1700} y={238} start={L(7, 0.1)} size={60} color={C.violet} tex="= 3" />
            <div style={{ position: 'absolute', left: 900, top: 370, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, L(7, 0.45)) }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: C.amber, width: 210 }}>X → B:</span>
              <Tex tex="3\ \text{right} + 2\ \text{up}" size={54} />
            </div>
            <Eq x={1110} y={470} start={L(8, 0.4)} size={60} tex="\dfrac{5 \times 4}{2} = 10" />
            <Text x={1500} y={522} w={380} size={42} weight={800} color={C.muted} style={fadeUp(f, L(8, 0.7))}>
              each pair twice
            </Text>
            <Text x={900} y={640} w={980} size={44} weight={800} color={C.muted} style={{ opacity: ease(f, L(10, 0.2)) * fadeTo(f, L(11, 0.05)) }}>
              every start pairs with every finish: 3 × 10
            </Text>
            <Eq x={900} y={620} start={L(11, 0.15)} size={64} color={C.red} tex="3 \times 10 = 30 \text{ through X}" />
            <Eq x={900} y={730} start={L(11, 0.6)} size={64} color={C.green} tex="56 - 30 = 26 \ \checkmark" />
          </div>
        </>
      )}
      {/* ---- phase 3: which way when ---- */}
      {p3 > 0 && (
        <div style={{ opacity: p3 }}>
          <Card x={140} y={300} w={800} h={300} style={fadeUp(f, L(12, 0.3))}>
            <div style={{ position: 'absolute', left: 50, top: 40, fontSize: 52, fontWeight: 900, color: C.primary }}>Corner numbers</div>
            <div style={{ position: 'absolute', left: 50, top: 130, right: 40, fontSize: 44, fontWeight: 700, lineHeight: 1.35 }}>work even with lots of blocked corners</div>
          </Card>
          <Card x={980} y={300} w={800} h={300} style={fadeUp(f, L(13, 0.1))}>
            <div style={{ position: 'absolute', left: 50, top: 40, fontSize: 52, fontWeight: 900, color: C.violet }}>Count all, subtract</div>
            <div style={{ position: 'absolute', left: 50, top: 130, right: 40, fontSize: 44, fontWeight: 700, lineHeight: 1.35 }}>fastest when just one corner is blocked</div>
          </Card>
        </div>
      )}
    </>
  );
};

// ---- traps ----

type Mini = { w: number; h: number; x: Pt | null; route?: string; color?: string; cross?: boolean };
const MINIS: Mini[] = [
  { w: 3, h: 3, x: null },
  { w: 5, h: 3, x: XC, route: GOOD, color: C.green, cross: true },
  { w: 5, h: 3, x: XC, route: BAD, color: C.red },
  { w: 4, h: 3, x: null },
  { w: 5, h: 3, x: XC },
];
const NOTES = ['if 3 wide', '', 'through X', 'if 4 wide', 'forgot about X'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 3, 0.1), Infinity, at(scene, 0, 0.1), at(scene, 2, 0.1), at(scene, 1, 0.1)];
  const right = f >= at(scene, 5, 0.3);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 140, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 1 && right;
          const border = wrong ? C.red : ok ? C.green : 'transparent';
          const mi = MINIS[i];
          const u = 50;
          const mm = plane(150 - (mi.w * u) / 2, 160, u);
          const show = i === 1 ? (ok ? 1 : 0) : ease(f, wrongAt[i], 12);
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 6 + i * 6, 12) }}>
              <div style={{ height: 410, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.muted, marginTop: 14 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 110, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={72} color={wrong ? C.red : ok ? C.green : C.ink} />
                </div>
                <svg width={300} height={200} viewBox="0 0 300 200" style={{ overflow: 'visible', opacity: show }}>
                  <Streets m={mm} w={mi.w} h={mi.h} x={mi.x} labels={0} dot={8} stroke={4} xOpacity={i === 4 ? 0.35 : 1} />
                  {mi.route && <Route m={mm} route={mi.route} color={mi.color ?? C.ink} width={8} progress={i === 1 ? 1 : ease(f, wrongAt[i] + 6, 20)} />}
                  {mi.cross && <Cross p={mm(XC)} size={34} opacity={1} />}
                </svg>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 16, fontSize: 40, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, color: C.red, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: ease(f, at(scene, 4, 0.2)) * fadeTo(f, at(scene, 5, 0.1)) }}>
        <Tex tex="56 - (3 + 10) = 43" size={64} color={C.red} />
        <span style={{ fontSize: 44, fontWeight: 800, color: C.red, marginLeft: 30 }}>added, not multiplied</span>
      </div>
      <div style={{ position: 'absolute', left: 230, top: 690, width: 1460, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 46, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.4)) }}>
        Count the blocks carefully. Which routes were you asked for?
      </div>
    </>
  );
};

// ---- variant ----

const VX: Pt = [2, 2];

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(220, 770, 100);
  return (
    <>
      <Stage>
        <Streets m={m} w={4} h={4} x={VX} draw={ease(f, at(scene, 0, 0.3), 20)} xOpacity={ease(f, at(scene, 1, 0.1), 10)} />
        <Brace a={m([0, 0])} b={m([4, 0])} dx={0} dy={28} color={C.primary} label="4" opacity={ease(f, at(scene, 0, 0.6), 12)} />
        <Brace a={m([4, 0])} b={m([4, 4])} dx={34} dy={0} color={C.violet} label="4" opacity={ease(f, at(scene, 0, 0.85), 12)} />
      </Stage>
      <Pill x={800} y={230} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>Your turn!</Pill>
      <Text x={800} y={340} w={1060} size={54} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        A grid <span style={{ color: C.primary }}>4 blocks across</span> and <span style={{ color: C.violet }}>4 blocks up</span>.
      </Text>
      <Text x={800} y={520} w={1050} size={52} weight={700} style={fadeUp(f, at(scene, 1, 0.1))}>
        X is right in the middle. How many routes from A to B skip X?
      </Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = plane(200, 770, 110);
  const tableAt = at(scene, 5, 0.1);
  const done = at(scene, 4, 0.97);
  const zones = fadeTo(f, tableAt, 0, 10);
  const order = range(5).flatMap((y) => range(5).map((x): Pt => [x, y]));
  return (
    <>
      <Stage>
        <Zone m={m} a={[0, 0]} b={VX} color={C.violet} opacity={ease(f, at(scene, 2, 0.1), 12) * zones} />
        <Zone m={m} a={VX} b={[4, 4]} color={C.amber} opacity={ease(f, at(scene, 3, 0.1), 12) * zones} />
        <Streets m={m} w={4} h={4} x={VX} labels={48} lo={1.4} />
        {order.map((p, k) => (
          <Num key={k} p={m(p)} value={VTABLE[p[0]][p[1]]} r={36} s={pop(f, tableAt + k * 2, fps)} color={p[0] === 2 && p[1] === 2 ? C.red : p[0] === 4 && p[1] === 4 ? C.green : C.primary} />
        ))}
      </Stage>
      <Eq x={820} y={140} start={at(scene, 0, 0.4)} size={56} tex="4\ \text{right} + 4\ \text{up} = 8\ \text{steps}" />
      <Eq x={820} y={240} start={at(scene, 1, 0.2)} size={56} tex="\dfrac{8 \times 7 \times 6 \times 5}{4 \times 3 \times 2 \times 1} = \dfrac{1680}{24} = 70" />
      <Eq x={820} y={420} start={at(scene, 2, 0.4)} size={56} color={C.violet} tex="\text{A} \to \text{X}\text{:}\ \dfrac{4 \times 3}{2} = 6" />
      <Eq x={820} y={590} start={at(scene, 3, 0.15)} size={56} color={C.amber} tex="\text{X} \to \text{B}\text{:}\ 6" />
      <Eq x={1200} y={590} start={at(scene, 3, 0.55)} size={56} color={C.red} tex="6 \times 6 = 36" />
      <Eq x={820} y={690} start={at(scene, 4, 0.3)} size={72} color={C.green} tex="70 - 36 = 34" />
      <Answer x={1700} y={680} value="34" chime={CHIME} start={done} />
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(0 0 0 1560px)' }}>
        <Confetti x={1700} y={680} start={done} seed={11} />
      </div>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 650, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1460, fontSize: 58, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Count all the routes, then subtract the routes through the blocked corner.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 330, ...fadeUp(f, at(scene, 1, 0.6)) }}>
          <Tex tex="56 - 30 = 26" size={64} color={C.green} />
        </div>
        <div style={{ position: 'absolute', left: 70, top: 460, width: 1460, fontSize: 50, fontWeight: 800, color: C.violet, lineHeight: 1.3, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Or fill in corner numbers: left + below, and 0 on the blocked corner.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(5, 3, XC, 10, <>Only right or up, from A to B. How many routes skip X?</>),
  sol1: Sol1,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause(4, 4, VX, 10, <>A 4 by 4 grid, X in the middle. How many routes skip X?</>),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;


import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Pill, Text } from '../../lib/ui';
import { Choices } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-border-tiles';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const BLUE = '#3b82f6';
export const BLUE_D = '#1e40af'; // lit rows
export const AMBER = '#f59f0a'; // lit side columns
const WHITE_LINE = '#d3d9e6';

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

// ---------- tiled floor ----------

type FloorP = {
  cols: number; rows: number; x: number; y: number; cell: number;
  appear?: number; // 0..1 sweep-in
  op?: number;
  paint?: (c: number, r: number) => string | undefined; // override fill for a cell
  glow?: number; // pulse the blue ring
  insideTint?: number; // 0..1 tint white inside
};

const isEdge = (c: number, r: number, cols: number, rows: number) => c === 0 || r === 0 || c === cols - 1 || r === rows - 1;

export const Floor: React.FC<FloorP> = ({ cols, rows, x, y, cell, appear = 1, op = 1, paint, glow = 0, insideTint = 0 }) => {
  const f = useCurrentFrame();
  const pulse = glow * (0.5 + 0.5 * Math.sin(f / 5));
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const edge = isEdge(c, r, cols, rows);
      const a = Math.max(0, Math.min(1, appear * 1.8 - ((c + r) / (cols + rows)) * 0.8));
      if (a <= 0) continue;
      const over = paint?.(c, r);
      const fill = over ?? (edge ? BLUE : insideTint > 0 ? `rgba(138,145,160,${0.3 * insideTint})` : '#ffffff');
      cells.push(
        <rect key={`${c}-${r}`} x={c * cell + 0.75} y={r * cell + 0.75} width={cell - 1.5} height={cell - 1.5} rx={cell * 0.06}
          fill={fill} stroke={edge || over ? '#ffffff' : WHITE_LINE} strokeWidth={1.5} opacity={a}
          style={edge && !over && glow > 0 ? { filter: `brightness(${1 - 0.25 * pulse})` } : undefined} />,
      );
    }
  }
  return (
    <svg style={{ position: 'absolute', left: x, top: y, opacity: op, overflow: 'visible' }} width={cols * cell} height={rows * cell}>
      {cells}
      <rect x={0} y={0} width={cols * cell} height={rows * cell} fill="none" stroke="#9db8f0" strokeWidth={2} opacity={appear} />
    </svg>
  );
};

/** Sweep a lit range of cells: progress p 0..1 along the list. */
const sweep = (p: number, i: number, n: number) => p * n > i;

const Label: React.FC<{ x: number; y: number; w?: number; color?: string; op?: number; size?: number; children: React.ReactNode }> = ({ x, y, w = 140, color = C.ink, op = 1, size = 52, children }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, textAlign: 'center', fontSize: size, fontWeight: 900, color, opacity: op, whiteSpace: 'nowrap' }}>{children}</div>
);

const Eq: React.FC<{ x: number; y: number; start: number; tex: string; size?: number }> = ({ x, y, start, tex, size = 56 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number }> = ({ x, y, start, color, children, size = 42, w }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: w ? 'normal' : 'nowrap', width: w, textAlign: w ? 'center' : undefined, borderRadius: w ? 36 : 999 }}>
      {children}
    </Pill>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

/** Plain floor outline with no tile grid (variant card: no dimensions). */
export const Silhouette: React.FC<{ x: number; y: number; w: number; h: number; op?: number }> = ({ x, y, w, h, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 14, background: BLUE, padding: 36, opacity: op, boxSizing: 'border-box' }}>
    <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 6, border: `2px solid ${WHITE_LINE}` }} />
  </div>
);

// 7 x 5 example floor geometry (used in several scenes)
export const EC = 7;
export const ER = 5;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const glow = ease(f, at(scene, 0, 0.55), 10) * (1 - ease(f, at(scene, 1), 10));
  return (
    <>
      <Floor cols={EC} rows={ER} x={110} y={250} cell={80} appear={ease(f, 4, 36)} glow={glow} />
      <Label x={110 + 280} y={165} w={420} color={C.violet} op={ease(f, at(scene, 1, 0.15), 10)}>long side</Label>
      <Text x={820} y={250} w={900} size={64} weight={900} style={fadeUp(f, at(scene, 0, 0.1))}>
        <span style={{ color: BLUE }}>blue</span> edge, white inside
      </Text>
      <div style={{ position: 'absolute', left: 820, top: 380, display: 'flex', alignItems: 'center', gap: 28, ...fadeUp(f, at(scene, 1, 0.3)) }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 50, fontWeight: 900 }}>long</div>
        <div style={{ fontSize: 120, fontWeight: 900, color: C.amber, lineHeight: 1 }}>?</div>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 50, fontWeight: 900 }}>short</div>
      </div>
      <div style={{ position: 'absolute', left: 820, top: 580, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CH = ['1', '2', '3', '4', '6'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const oneTile = ease(f, at(scene, 1, 0.55), 8) * (1 - ease(f, at(scene, 2), 8));
  const ring = ease(f, at(scene, 2, 0.4), 10) * (1 - ease(f, at(scene, 3), 8));
  const inside = ease(f, at(scene, 3, 0.4), 10);
  const FX = 1190;
  const FY = 250;
  const CELL = 76;
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 140, width: 960, minHeight: 400, background: C.card, borderRadius: 32, padding: '28px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>A rectangular floor is covered with square tiles, each one foot on a side. </span>
        <span style={s(2)}>The forty tiles along the edge are blue. </span>
        <span style={s(3)}>The other eighty tiles are white. </span>
        <span style={s(4)}>How many feet longer is the floor than it is wide?</span>
      </div>
      <Floor cols={EC} rows={ER} x={FX - 80} y={FY} cell={CELL} appear={ease(f, 6, 30)} glow={ring} insideTint={inside} paint={(c, r) => (c === 0 && r === 0 && oneTile > 0.5 ? AMBER : undefined)} />
      <Label x={FX - 80 + (EC * CELL) / 2} y={FY + ER * CELL + 18} w={400} size={44} color={C.muted}>example</Label>
      {oneTile > 0.01 && <Label x={FX - 80 + CELL / 2 - 10} y={FY - 70} w={220} size={46} color={AMBER} op={oneTile}>1 ft</Label>}
      <Tag x={90} y={565} start={at(scene, 2, 0.5)} color={BLUE}>40 blue</Tag>
      <Tag x={400} y={565} start={at(scene, 3, 0.5)} color={C.muted}>80 white</Tag>
      <div style={{ position: 'absolute', left: 90, top: 645, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, at(scene, 4, 0.5)) }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 30px', fontSize: 42, fontWeight: 900, whiteSpace: 'nowrap' }}>longer by ? ft</div>
        <svg width={120} height={50} viewBox="0 0 120 50"><path d="M5 25 H100 M78 6 L105 25 L78 44" stroke={C.violet} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Choices x={90} y={740} start={(i) => at(scene, 5, 0.25 + i * 0.1)} items={CH.map((c) => <Tex key={c} tex={c} size={52} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 150, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.15)) }}>
        <Tex tex={`${col(BLUE, '40')} + ${col('#6b7385', '80')} = 120\\text{ tiles}`} size={68} />
      </div>
      <Floor cols={EC} rows={ER} x={170} y={370} cell={70} appear={ease(f, 4, 24)} />
      <Label x={170 + 245} y={288} w={300} size={56} color={C.violet} op={ease(f, at(scene, 1, 0.3), 10)}>L</Label>
      <Label x={110} y={370 + 175 - 30} w={80} size={56} color={C.violet} op={ease(f, at(scene, 1, 0.45), 10)}>W</Label>
      <Label x={170 + 245} y={370 + 5 * 70 + 12} w={300} size={40} color={C.muted}>example</Label>
      <Eq x={860} y={420} start={at(scene, 1, 0.55)} tex={'L \\times W = 120'} size={66} />
      <Tag x={860} y={560} start={at(scene, 2, 0.35)} color={C.violet} size={50}>goal: L − W</Tag>
    </>
  );
};

const PAUSE1 = 'A rectangular floor is covered with 1-foot square tiles. The 40 edge tiles are blue and the other 80 are white. How many feet longer is the floor than it is wide?';
const PAUSE2 = 'A new floor has 36 blue tiles on the edge and 60 white tiles inside. How many feet longer is it than it is wide?';

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Floor cols={EC} rows={ER} x={90} y={290} cell={60} appear={ease(f, 4, 20)} />
      <Label x={90 + 210} y={290 + 5 * 60 + 14} w={300} size={40} color={C.muted}>example</Label>
      <div style={{ position: 'absolute', left: 590, top: 150, width: 780, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE1}</div>
      <Countdown scene={scene} seconds={10} x={1640} y={500} tick={TICK} />
    </>
  );
};

const EdgeRule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const FX = 160;
  const FY = 230;
  const CELL = 70;
  const topBottom = ease(f, at(scene, 1, 0.55), 40); // whole top row then bottom row
  const sides = ease(f, at(scene, 2, 0.35), 40);
  const paint = (c: number, r: number) => {
    const rowCells = 2 * EC;
    if (r === 0 || r === ER - 1) {
      const i = r === 0 ? c : EC + c;
      if (sweep(topBottom, i, rowCells)) return BLUE_D;
    }
    if (c === 0 || c === EC - 1) {
      if (r > 0 && r < ER - 1) {
        const i = (c === 0 ? 0 : ER - 2) + (r - 1);
        if (sweep(sides, i, 2 * (ER - 2))) return AMBER;
      }
    }
    return undefined;
  };
  return (
    <>
      <Floor cols={EC} rows={ER} x={FX} y={FY} cell={CELL} appear={ease(f, 4, 20)} paint={paint} />
      <Label x={FX + (EC * CELL) / 2} y={FY - 80} w={300} size={40} color={C.muted} op={ease(f, 8, 10)}>example</Label>
      <Label x={FX + (EC * CELL) / 2} y={FY + ER * CELL + 16} w={300} color={BLUE_D} op={ease(f, at(scene, 1, 0.8), 10)}>7 + 7</Label>
      <Label x={FX - 60} y={FY + 130} w={90} color={AMBER} op={ease(f, at(scene, 2, 0.6), 10)}>3</Label>
      <Label x={FX + EC * CELL + 60} y={FY + 130} w={90} color={AMBER} op={ease(f, at(scene, 2, 0.7), 10)}>3</Label>
      <Tag x={860} y={190} start={at(scene, 0, 0.35)} color={C.violet} size={42}>make a list of floors with 120 tiles</Tag>
      <Eq x={860} y={330} start={at(scene, 1, 0.8)} tex={col(BLUE_D, '7 + 7')} size={60} />
      <Eq x={860} y={430} start={at(scene, 2, 0.75)} tex={`${col(AMBER, '3 + 3')}\\quad (5 - 2 = 3)`} size={60} />
      <Eq x={860} y={560} start={at(scene, 3, 0.3)} tex={`\\text{edge} = ${col(BLUE_D, '7 + 7')} + ${col(AMBER, '3 + 3')} = 20`} size={58} />
    </>
  );
};

// ---------- the list ----------

const LIST: { l: number; w: number; e: number; line: number; t: number; tone: 'red' | 'green' }[] = [
  { l: 60, w: 2, e: 120, line: 1, t: 0.45, tone: 'red' },
  { l: 40, w: 3, e: 82, line: 1, t: 0.85, tone: 'red' },
  { l: 30, w: 4, e: 64, line: 2, t: 0.5, tone: 'red' },
  { l: 24, w: 5, e: 54, line: 2, t: 0.65, tone: 'red' },
  { l: 20, w: 6, e: 48, line: 2, t: 0.85, tone: 'red' },
  { l: 15, w: 8, e: 42, line: 3, t: 0.35, tone: 'red' },
  { l: 12, w: 10, e: 40, line: 4, t: 0.3, tone: 'green' },
];

const ListScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const RH = 82;
  const TY = 190;
  const gridStart = at(scene, 4, 0.5);
  const gp = ease(f, gridStart, 30);
  const GX = 960;
  const GY = 175;
  const GC = 44;
  const done = at(scene, 5, 0.92);
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 120, display: 'flex', fontSize: 40, fontWeight: 800, color: C.muted, ...fadeUp(f, 4) }}>
        <div style={{ width: 360 }}>length × width</div>
        <div style={{ width: 280 }}>edge tiles</div>
      </div>
      {LIST.map((r, i) => {
        const st = at(scene, r.line, r.t);
        const o = ease(f, st, 10);
        const green = r.tone === 'green';
        const colr = green ? C.green : C.red;
        return (
          <div key={i} style={{ position: 'absolute', left: 70, top: TY + i * RH, width: 660, height: RH - 10, display: 'flex', alignItems: 'center', padding: '0 20px', borderRadius: 18, fontSize: 52, fontWeight: 900, background: green ? 'rgba(33,196,93,0.14)' : 'transparent', ...fadeUp(f, st, 10), opacity: o }}>
            <div style={{ width: 360, color: C.ink }}>{r.l} × {r.w}</div>
            <div style={{ width: 80, color: C.muted }}>→</div>
            <div style={{ width: 160, color: colr }}>{r.e}</div>
          </div>
        );
      })}
      {gp > 0 && (
        <>
          <Floor cols={12} rows={10} x={GX} y={GY} cell={GC} appear={gp} />
          <Label x={GX + 6 * GC} y={GY - 66} w={200} size={52} color={C.violet} op={ease(f, gridStart + 20, 10)}>12</Label>
          <Label x={GX - 50} y={GY + 5 * GC - 30} w={80} size={52} color={C.violet} op={ease(f, gridStart + 24, 10)}>10</Label>
          <Label x={GX + 6 * GC} y={GY + 5 * GC - 82} w={300} size={64} color={C.ink} op={ease(f, gridStart + 30, 12)}>80</Label>
          <Label x={GX + 6 * GC} y={GY + 5 * GC - 12} w={400} size={40} color={C.muted} op={ease(f, gridStart + 30, 12)}>10 × 8 inside</Label>
          <Tag x={GX} y={GY + 10 * GC + 22} start={gridStart + 34} color={BLUE} size={40}>40 blue edge</Tag>
        </>
      )}
      <Eq x={GX} y={GY + 10 * GC + 100} start={at(scene, 5, 0.05)} tex={`12 - 10 \\phantom{= 2}`} size={60} />
      <Eq x={GX} y={GY + 10 * GC + 100} start={at(scene, 5, 0.22)} tex={`\\phantom{12 - 10} = ${col(C.green, '2')}`} size={60} />
      <Tag x={90} y={775} start={at(scene, 4, 0.7)} color={C.muted} size={36}>120 × 1: no inside</Tag>
      <Tag x={470} y={775} start={at(scene, 4, 0.85)} color={C.muted} size={36}>next pair repeats</Tag>
      <Answer x={1680} y={440} value="2" start={done} chime={CHIME} />
      <Confetti x={1680} y={440} start={done} seed={5} />
      <Tag x={1555} y={600} start={done} color={C.green} size={48}>Choice B</Tag>
    </>
  );
};

// ---------- solution 2: sum ----------

const SumScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const FX = 150;
  const FY = 250;
  const CELL = 64;
  const C8 = 8;
  const R5 = 5;
  const rows = ease(f, at(scene, 1, 0.25), 24);
  const sides = ease(f, at(scene, 1, 0.6), 24);
  const paint = (c: number, r: number) => {
    if ((r === 0 || r === R5 - 1) && sweep(rows, r === 0 ? c : C8 + c, 2 * C8)) return BLUE_D;
    if ((c === 0 || c === C8 - 1) && r > 0 && r < R5 - 1 && sweep(sides, (c === 0 ? 0 : R5 - 2) + r - 1, 2 * (R5 - 2))) return AMBER;
    return undefined;
  };
  const X = 760;
  return (
    <>
      <Floor cols={C8} rows={R5} x={FX} y={FY} cell={CELL} appear={ease(f, 4, 24)} paint={paint} />
      <Label x={FX + (C8 * CELL) / 2} y={FY - 80} w={200} size={58} color={C.violet} op={ease(f, 10, 10)}>L</Label>
      <Label x={FX - 60} y={FY + (R5 * CELL) / 2 - 36} w={80} size={58} color={C.violet} op={ease(f, 10, 10)}>W</Label>
      <Eq x={X} y={150} start={at(scene, 1, 0.35)} tex={col(BLUE_D, 'L + L')} size={50} />
      <Eq x={X} y={212} start={at(scene, 1, 0.6)} tex={col(AMBER, '(W - 2) + (W - 2)')} size={50} />
      <Eq x={X} y={282} start={at(scene, 1, 0.85)} tex={`${col(BLUE_D, 'L + L')} + ${col(AMBER, '(W - 2) + (W - 2)')} = 2L + 2W - 4`} size={48} />
      <Eq x={X} y={365} start={at(scene, 2, 0.5)} tex={`2L + 2W - 4 = ${col(BLUE, '40')}`} size={54} />
      <Eq x={X} y={435} start={at(scene, 3, 0.15)} tex={'2L + 2W = 44'} size={54} />
      <Eq x={X} y={505} start={at(scene, 3, 0.6)} tex={'L + W = 22'} size={54} />
      <Eq x={X} y={585} start={at(scene, 4, 0.5)} tex={'L + W = 22,\\quad L \\times W = 120'} size={54} />
      <Tag x={X} y={660} start={at(scene, 5, 0.55)} color={C.amber} size={42}>11 × 11 = 121: one too many</Tag>
      <Eq x={X} y={735} start={at(scene, 7, 0.3)} tex={`${col(C.green, '12 + 10 = 22,\\quad 12 \\times 10 = 120')}`} size={54} />
      <Eq x={150} y={720} start={at(scene, 7, 0.75)} tex={`12 - 10 \\phantom{= 2}`} size={64} />
      <Eq x={150} y={720} start={at(scene, 7, 0.92)} tex={`\\phantom{12 - 10} = ${col(C.green, '2')}`} size={64} />
      <Tag x={90} y={600} start={at(scene, 8, 0.5)} color={C.violet} size={40} w={600}>sum + product → the two numbers</Tag>
    </>
  );
};

// ---------- traps ----------

const TRAPS: { d: number; w: string; l: string; t: string; note?: string; line: number; at: number; tone: 'red' | 'green' }[] = [
  { d: 1, w: '10.5', l: '11.5', t: '', note: 'half tiles!', line: 2, at: 0.5, tone: 'red' },
  { d: 3, w: '9.5', l: '12.5', t: '', note: 'half tiles!', line: 2, at: 0.8, tone: 'red' },
  { d: 4, w: '9', l: '13', t: '117', note: '3 short', line: 3, at: 0.45, tone: 'red' },
  { d: 6, w: '8', l: '14', t: '112', line: 4, at: 0.45, tone: 'red' },
  { d: 2, w: '10', l: '12', t: '120', line: 5, at: 0.3, tone: 'green' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X = 120;
  const widths = [190, 230, 230, 480];
  const RH = 96;
  return (
    <>
      <Tag x={X} y={130} start={at(scene, 0, 0.5)} color={C.violet} size={48}>L + W = 22</Tag>
      <div style={{ position: 'absolute', left: X, top: 250, display: 'flex', fontSize: 42, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 0, 0.7)) }}>
        {['difference', 'width', 'length', 'tiles'].map((h, i) => <div key={h} style={{ width: widths[i] + (i === 0 ? 70 : 0) }}>{h}</div>)}
      </div>
      <Eq x={1230} y={335} start={at(scene, 2, 0.55)} tex={'(22 - 1) \\div 2 = 10.5'} size={54} />
      {TRAPS.map((r, i) => {
        const st = at(scene, r.line, r.at);
        const green = r.tone === 'green';
        const cc = green ? C.green : C.red;
        return (
          <div key={i} style={{ position: 'absolute', left: X - 20, top: 320 + i * RH, height: RH - 10, display: 'flex', alignItems: 'center', padding: '0 20px', borderRadius: 18, fontSize: 56, fontWeight: 900, background: green ? 'rgba(33,196,93,0.14)' : 'transparent', ...fadeUp(f, st, 10) }}>
            <div style={{ width: 260, color: C.ink }}>{r.d}</div>
            <div style={{ width: widths[1], color: cc }}>{r.w}</div>
            <div style={{ width: widths[2], color: cc }}>{r.l}</div>
            <div style={{ width: widths[3], color: cc, display: 'flex', alignItems: 'baseline', gap: 20, whiteSpace: 'nowrap' }}>
              {r.t}
              {r.note && <span style={{ fontSize: 40, color: C.red }}>{r.note}</span>}
              {green && <span style={{ fontSize: 40 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------- variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Silhouette x={140} y={230} w={560} h={360} op={ease(f, 4, 20)} />
      <Label x={420} y={610} w={500} size={40} color={C.muted}>a new floor</Label>
      <div style={{ position: 'absolute', left: 800, top: 200, width: 1000, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 52, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <span style={{ color: BLUE, fontWeight: 900 }}>36 blue</span> edge tiles, <span style={{ fontWeight: 900 }}>60 white</span> tiles inside.
        <div style={{ ...fadeUp(f, at(scene, 2, 0.1)), marginTop: 14, fontWeight: 800 }}>How many feet longer than wide?</div>
      </div>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Silhouette x={110} y={270} w={440} h={290} op={ease(f, 4, 20)} />
      <div style={{ position: 'absolute', left: 600, top: 170, width: 740, background: C.card, borderRadius: 28, padding: '28px 40px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE2}</div>
      <Countdown scene={scene} seconds={12} x={1620} y={500} tick={TICK} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const FX = 130;
  const FY = 220;
  const GC = 48;
  const gridStart = at(scene, 3, 0.05);
  const gp = ease(f, gridStart, 30);
  const X = 800;
  const done = at(scene, 4, 0.92);
  return (
    <>
      {gp > 0 && (
        <>
          <Floor cols={12} rows={8} x={FX} y={FY} cell={GC} appear={gp} />
          <Label x={FX + 6 * GC} y={FY - 66} w={200} size={52} color={C.violet} op={ease(f, gridStart + 22, 10)}>12</Label>
          <Label x={FX - 50} y={FY + 4 * GC - 30} w={80} size={52} color={C.violet} op={ease(f, gridStart + 26, 10)}>8</Label>
          <Label x={FX + 6 * GC} y={FY + 4 * GC - 34} w={400} size={56} color={C.ink} op={ease(f, gridStart + 32, 12)}>10 × 6 = 60</Label>
          <Label x={FX + 6 * GC} y={FY + 8 * GC + 14} w={500} size={44} color={C.muted} op={ease(f, gridStart + 36, 12)}>inside: 60 white</Label>
        </>
      )}
      <Eq x={X} y={140} start={at(scene, 0, 0.35)} tex={`${col(BLUE, '36')} + ${col('#6b7385', '60')} = 96\\text{ tiles}`} size={54} />
      <Eq x={X} y={215} start={at(scene, 1, 0.1)} tex={`2L + 2W - 4 = ${col(BLUE, '36')}`} size={54} />
      <Eq x={X} y={285} start={at(scene, 1, 0.4)} tex={'2L + 2W = 40'} size={54} />
      <Eq x={X} y={355} start={at(scene, 1, 0.75)} tex={'L + W = 20'} size={54} />
      <Eq x={X} y={440} start={at(scene, 2, 0.25)} tex={`10 \\times 10 = 100\\ ${col(C.red, '\\text{too many}')}`} size={54} />
      <Eq x={X} y={515} start={at(scene, 2, 0.7)} tex={`${col(C.green, '12 \\times 8 = 96 \\ \\checkmark')}`} size={56} />
      <Eq x={X} y={610} start={at(scene, 4, 0.1)} tex={`12 - 8 \\phantom{= 4}`} size={62} />
      <Eq x={X} y={610} start={at(scene, 4, 0.3)} tex={`\\phantom{12 - 8} = ${col(C.green, '4')}`} size={62} />
      <Answer x={1700} y={640} value="4" start={done} chime={CHIME} />
      <Confetti x={1700} y={640} start={done} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 4), 0, 12);
  const FX = 120;
  const FY = 280;
  const CELL = 64;
  const glow = ease(f, at(scene, 1, 0.1), 12);
  const paint = (c: number, r: number) => (isEdge(c, r, 8, 5) && glow > 0.5 ? BLUE_D : undefined);
  return (
    <>
      <Fade op={out}>
        <Floor cols={8} rows={5} x={FX} y={FY} cell={CELL} appear={ease(f, 4, 20)} paint={paint} />
        <Text x={800} y={140} w={900} size={60} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <div style={{ position: 'absolute', left: 800, top: 260, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, at(scene, 1, 0.15)) }}>
          <div style={{ background: BLUE_D, borderRadius: 28, padding: '12px 32px', fontSize: 50, fontWeight: 900, color: '#fff' }}>edge tiles</div>
          <Tex tex={'(\\text{edge} + 4) \\div 2 \\to L + W'} size={56} />
        </div>
        <div style={{ position: 'absolute', left: 800, top: 400, display: 'flex', alignItems: 'center', gap: 22, ...fadeUp(f, at(scene, 2, 0.3)) }}>
          <div style={{ background: C.muted, borderRadius: 28, padding: '12px 32px', fontSize: 50, fontWeight: 900, color: '#fff' }}>all tiles</div>
          <span style={{ fontSize: 56, color: C.muted, fontWeight: 900 }}>→</span>
          <Tex tex={'L \\times W'} size={60} />
        </div>
        <div style={{ position: 'absolute', left: 800, top: 540, ...fadeUp(f, at(scene, 3, 0.2)) }}>
          <div style={{ background: C.violet, borderRadius: 28, padding: '12px 32px', fontSize: 50, fontWeight: 900, color: '#fff' }}>find the pair!</div>
        </div>
      </Fade>
      <SignOff start={at(scene, 4, 0.1)} text="Keep counting!" />
      <Confetti x={960} y={380} start={at(scene, 4, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  'edge-rule': EdgeRule,
  list: ListScene,
  sum: SumScene,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

void clamp;

// YouTube thumbnail (`2026-10-31-border-tiles-thumb`, render.sh → poster.jpg): the trap + an example floor with a blue edge ring (40 blue, 80 white), no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Think it's", <span style={{ color: C.red }}>4?</span>]}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
      <div style={{ position: 'relative', width: 630, height: 450 }}>
        <Floor cols={EC} rows={ER} x={0} y={0} cell={90} />
      </div>
      <div style={{ display: 'flex', gap: 36, fontSize: 64, fontWeight: 900 }}>
        <span style={{ color: BLUE }}>40 blue</span>
        <span style={{ color: C.muted }}>80 white</span>
      </div>
    </div>
  </ThumbFrame>
);

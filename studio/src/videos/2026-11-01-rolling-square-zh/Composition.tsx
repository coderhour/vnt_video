import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-11-01-rolling-square-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates, y UP; clockwise as seen on screen) ----------
// The 8 moves of the small square (pivot, clockwise turn). Verified in verify.py.
export const PIV: Pt[] = [[1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2]];
const ANG = [90, 180, 90, 180, 90, 180, 90, 180];
const rotCW = (p: Pt, c: Pt, deg: number): Pt => {
  const t = (deg * Math.PI) / 180;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(t) + dy * Math.sin(t), c[1] - dx * Math.sin(t) + dy * Math.cos(t)];
};
// corners: [bottom-left = P, bottom-right, top-right, top-left]
const S0: Pt[] = [[0, 2], [1, 2], [1, 3], [0, 3]];
const STATES: Pt[][] = [S0];
range(8).forEach((k) => STATES.push(STATES[k].map((p) => rotCW(p, PIV[k], ANG[k]))));
const sm = (u: number) => u * u * (3 - 2 * u);
const moveOf = (T: number) => Math.min(7, Math.max(0, Math.floor(T)));
const uOf = (T: number) => (T >= 8 ? 1 : T <= 0 ? 0 : sm(T - Math.floor(T)));
const poseAt = (T: number): Pt[] => {
  const k = moveOf(T);
  return STATES[k].map((p) => rotCW(p, PIV[k], ANG[k] * uOf(T)));
};
type PtId = 'P' | 'TL' | 'C';
const pick = (s: Pt[], id: PtId): Pt => (id === 'P' ? s[0] : id === 'TL' ? s[3] : [(s[0][0] + s[2][0]) / 2, (s[0][1] + s[2][1]) / 2]);
const ptAt = (T: number, id: PtId): Pt => pick(poseAt(T), id);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const U = 140;
const mL = (p: Pt): Pt => [330 + U * p[0], 628 - U * p[1]]; // figure on the left (x -1..3 -> 180..780)
const mR = (p: Pt): Pt => [1330 + U * p[0], 628 - U * p[1]]; // figure on the right
const mC = (p: Pt): Pt => [810 + U * p[0], 618 - U * p[1]]; // centred
type M = (p: Pt) => Pt;

const lin = (f: number, a: number, b: number, v0: number, v1: number) => interpolate(f, [a, b], [v0, v1], clamp);
const pulse = (f: number, period = 14) => 0.5 + 0.5 * Math.sin((f / period) * Math.PI);

// ---------- drawing pieces ----------
const poly = (m: M, pts: Pt[]) => `M ${pts.map((p) => m(p).join(' ')).join(' L ')} Z`;

const Board: React.FC<{ m: M; opacity?: number; labels?: number }> = ({ m, opacity = 1, labels = 0 }) => {
  const [x0, y0] = m([0, 2]);
  const s = 2 * U;
  return (
    <g opacity={opacity}>
      <rect x={x0} y={y0} width={s} height={s} fill="#e4e7ef" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <Lbl p={[x0 + s / 2, y0 + s + 38]} text="2" size={52} opacity={labels} />
      <Lbl p={[x0 - 38, y0 + s / 2]} text="2" size={52} opacity={labels} />
    </g>
  );
};

export const Lbl: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ p, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={9} strokeLinejoin="round">
      {text}
    </text>
  );

/** HTML maths label centred on a pixel position. */
const Tx: React.FC<{ p: Pt; tex: string; size?: number; color?: string; opacity?: number }> = ({ p, tex, size = 52, color = C.ink, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: 'translate(-50%, -50%)', opacity, whiteSpace: 'nowrap', textShadow: `0 0 6px ${C.bg}, 0 0 6px ${C.bg}, 0 0 10px ${C.bg}` }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

/** The small square at progress T. */
export const Sq: React.FC<{ m: M; T: number; opacity?: number; ghost?: boolean; color?: string }> = ({ m, T, opacity = 1, ghost, color = C.primary }) => {
  if (opacity <= 0) return null;
  return (
    <path d={poly(m, poseAt(T))} fill={ghost ? 'none' : C.primarySoft} stroke={color} strokeWidth={ghost ? 5 : 8} strokeDasharray={ghost ? '14 10' : undefined} strokeLinejoin="round" opacity={opacity} />
  );
};

/** Sample points of a tracked point during move j, from eased progress s0 to s1. */
const movePts = (id: PtId, j: number, s0: number, s1: number, n = 30): Pt[] =>
  range(n + 1).map((i) => pick(STATES[j].map((p) => rotCW(p, PIV[j], ANG[j] * (s0 + ((s1 - s0) * i) / n))), id));

const trailColor = (id: PtId, r: number) => (id === 'P' ? (Math.abs(r - 1) < 1e-6 ? C.primary : C.violet) : id === 'TL' ? C.amber : C.blue);

/** Trail of a point over moves [from, to) (to may be fractional: the move in progress). */
export const Trail: React.FC<{ m: M; id?: PtId; from?: number; to: number; opacity?: number; width?: number; only?: number[] }> = ({ m, id = 'P', from = 0, to, opacity = 1, width = 11, only }) => {
  const segs = [];
  for (let j = Math.floor(from); j < Math.min(8, Math.ceil(to - 1e-9)); j++) {
    if (only && !only.includes(j)) continue;
    const r = dist(pick(STATES[j], id), PIV[j]);
    if (r < 1e-6) continue;
    const s1 = j + 1 <= to ? 1 : sm(to - j);
    if (s1 <= 0) continue;
    const pts = movePts(id, j, 0, s1);
    segs.push(
      <path key={j} d={`M ${pts.map((p) => m(p).join(' ')).join(' L ')}`} fill="none" stroke={trailColor(id, r)} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />,
    );
  }
  return <g>{segs}</g>;
};

const Dot: React.FC<{ p: Pt; color?: string; scale?: number; opacity?: number }> = ({ p, color = C.ink, scale = 1, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={p[0]} cy={p[1]} r={20 * scale} fill="#fff" />
      <circle cx={p[0]} cy={p[1]} r={13 * scale} fill={color} />
    </g>
  );

/** The marked corner P with its label (label sits away from the square's centre). */
export const PMark: React.FC<{ m: M; T: number; opacity?: number; scale?: number; label?: number; id?: PtId; color?: string; text?: string }> = ({ m, T, opacity = 1, scale = 1, label = 1, id = 'P', color = C.ink, text = 'P' }) => {
  const s = poseAt(T);
  const p = pick(s, id);
  const c = pick(s, 'C');
  const d = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1;
  const lp = m([p[0] + ((p[0] - c[0]) / d) * 0.36, p[1] + ((p[1] - c[1]) / d) * 0.36]);
  return (
    <g>
      <Dot p={m(p)} color={color} scale={scale} opacity={opacity} />
      <Lbl p={lp} text={text} color={color} size={52 * Math.max(1, Math.min(1.5, label))} opacity={opacity * Math.min(1, label)} />
    </g>
  );
};

export const Ring: React.FC<{ m: M; k: number; f: number; opacity?: number }> = ({ m, k, f, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const [x, y] = m(PIV[k]);
  return <circle cx={x} cy={y} r={24 + 8 * pulse(f)} fill="none" stroke={C.amber} strokeWidth={7} opacity={opacity} />;
};

/** Dashed segment between two maths points. */
const Seg: React.FC<{ m: M; a: Pt; b: Pt; color?: string; opacity?: number; width?: number }> = ({ m, a, b, color = C.ink, opacity = 1, width = 5 }) => {
  if (opacity <= 0) return null;
  const [x1, y1] = m(a);
  const [x2, y2] = m(b);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray="12 9" strokeLinecap="round" opacity={opacity} />;
};

/** Angle mark at a pivot: arc from direction a0 to a1 (maths degrees; clockwise = decreasing). */
const AngMark: React.FC<{ m: M; c: Pt; a0: number; a1: number; text: string; opacity?: number; r?: number; lr?: number }> = ({ m, c, a0, a1, text, opacity = 1, r = 0.3, lr = 0.7 }) => {
  if (opacity <= 0) return null;
  const pts = range(25).map((i) => {
    const a = ((a0 + ((a1 - a0) * i) / 24) * Math.PI) / 180;
    return m([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  });
  const am = (((a0 + a1) / 2) * Math.PI) / 180;
  return (
    <g opacity={opacity}>
      <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <Lbl p={m([c[0] + lr * Math.cos(am), c[1] + lr * Math.sin(am)])} text={text} size={48} />
    </g>
  );
};

/** Faint full circle of radius r (maths units) round a centre. */
const Circ: React.FC<{ m: M; c: Pt; r: number; opacity?: number; color?: string; width?: number }> = ({ m, c, r, opacity = 1, color = C.muted, width = 5 }) => {
  if (opacity <= 0) return null;
  const [x, y] = m(c);
  return <circle cx={x} cy={y} r={r * U} fill="none" stroke={color} strokeWidth={width} strokeDasharray="4 12" strokeLinecap="round" opacity={opacity} />;
};

const GreyX: React.FC<{ p: Pt; size?: number; opacity?: number; color?: string }> = ({ p, size = 44, opacity = 1, color = C.muted }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} stroke={color} strokeWidth={10} strokeLinecap="round">
      <line x1={p[0] - size / 2} y1={p[1] - size / 2} x2={p[0] + size / 2} y2={p[1] + size / 2} />
      <line x1={p[0] + size / 2} y1={p[1] - size / 2} x2={p[0] - size / 2} y2={p[1] + size / 2} />
    </g>
  );

const TickMark: React.FC<{ p: Pt; opacity?: number; r?: number }> = ({ p, opacity = 1, r = 28 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={p[0]} cy={p[1]} r={r} fill={C.green} />
      <path d={`M ${p[0] - r * 0.5} ${p[1] + r * 0.02} L ${p[0] - r * 0.12} ${p[1] + r * 0.4} L ${p[0] + r * 0.52} ${p[1] - r * 0.36}`} stroke="#fff" strokeWidth={r * 0.22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

// ---------- answer chips ----------
export const CHOICES = ['(2+\\sqrt2)\\pi', '4\\pi', '(2+2\\sqrt2)\\pi', '(4+\\sqrt2)\\pi', '(4+2\\sqrt2)\\pi'];
type ChipState = 'plain' | 'bad' | 'good';
const Chips: React.FC<{ x: number; y: number; w: number; start: (i: number) => number; state?: (i: number) => ChipState; wrap?: boolean }> = ({ x, y, w, start, state = () => 'plain', wrap = true }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: '14px 20px' }}>
      {CHOICES.map((c, i) => {
        const s = state(i);
        const bg = s === 'bad' ? 'rgba(239,67,67,0.14)' : s === 'good' ? 'rgba(33,196,93,0.2)' : C.card;
        const bd = s === 'bad' ? C.red : s === 'good' ? C.green : 'transparent';
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), background: bg, border: `5px solid ${bd}`, borderRadius: 18, padding: '4px 22px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: s === 'bad' ? C.red : C.muted, fontSize: 36, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={48} color={s === 'bad' ? C.red : C.ink} />
          </div>
        );
      })}
    </div>
  );
};

// ---------- the table of moves (right panel) ----------
type Row = { turn: string; r: string; arc: string; kind: 'g' | 'v' | 'z' };
const G: Row = { turn: '90^\\circ', r: '1', arc: '\\pi/2', kind: 'g' };
const V: Row = { turn: '180^\\circ', r: '\\sqrt2', arc: '\\sqrt2\\,\\pi', kind: 'v' };
const Z: Row = { turn: '180^\\circ', r: '0', arc: '0', kind: 'z' };
const ROWS: Row[] = [G, V, G, Z, G, V, G, Z];
const KCOL = { g: C.primary, v: C.violet, z: C.muted };
const KSOFT = { g: C.primarySoft, v: C.violetSoft, z: 'rgba(138,145,160,0.14)' };
const COLX = [955, 1115, 1360, 1625];
const TBL_Y = 150;
const TBL_PITCH = 80;

const Table: React.FC<{ starts: number[]; headStart?: number; hi?: (i: number) => number; dim?: (i: number) => number; opacity?: number }> = ({ starts, headStart = 0, hi = () => 0, dim = () => 1, opacity = 1 }) => {
  const f = useCurrentFrame();
  const heads = ['第几次', '转角', '半径', '弧长'];
  return (
    <div style={{ opacity }}>
      {heads.map((h, i) => (
        <div key={h} style={{ position: 'absolute', left: COLX[i] - 150, width: 300, top: 98, textAlign: 'center', fontSize: 36, fontWeight: 800, color: C.muted, opacity: ease(f, headStart, 12) }}>
          {h}
        </div>
      ))}
      {ROWS.map((row, i) => {
        const p = ease(f, starts[i], 12);
        if (p <= 0) return null;
        const h = hi(i);
        const big = row.kind === 'z';
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: TBL_Y + i * TBL_PITCH, width: 1920, height: TBL_PITCH - 2, opacity: p * dim(i), transform: `translateX(${(1 - p) * 40}px)` }}>
            <div style={{ position: 'absolute', left: 905, width: 840, top: 0, height: TBL_PITCH - 2, borderRadius: 18, background: KSOFT[row.kind], border: `4px solid ${h > 0 ? KCOL[row.kind] : 'transparent'}` }} />
            {[String(i + 1), row.turn, row.r, row.arc].map((cell, c) => (
              <div key={c} style={{ position: 'absolute', left: COLX[c] - 150, width: 300, top: 0, height: TBL_PITCH - 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c === 0 ? C.muted : C.ink }}>
                {c === 0 ? <span style={{ fontSize: 44, fontWeight: 900 }}>{cell}</span> : <Tex tex={cell} size={big && c >= 2 ? 64 : 48} color={c === 2 ? KCOL[row.kind] : C.ink} />}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** Fade-and-pulse highlight for a row that was added at frame `s`. */
const justAdded = (f: number, s: number) => (f >= s && f < s + 45 ? 1 : 0);

const TagPill: React.FC<{ x: number; y: number; color: string; start: number; children: React.ReactNode; size?: number }> = ({ x, y, color, start, children, size = 40 }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start, 10), fontSize: size, whiteSpace: 'nowrap' }}>
      {children}
    </Pill>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; opacity?: number }> = ({ x, y, w, h, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 36, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity }} />
);

// ================= scenes =================

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = lin(f, at(scene, 0, 0.04), at(scene, 0, 0.62), 0, 8);
  const figOut = 1 - 0.85 * ease(f, at(scene, 1, 0), 14);
  const cardIn = ease(f, at(scene, 1, 0.05), 14);
  const qIn = ease(f, at(scene, 0, 0.68), 10);
  return (
    <>
      <Stage>
        <g opacity={ease(f, 0, 12) * figOut}>
          <Board m={mC} />
          <Trail m={mC} to={T} opacity={0.55} width={9} />
          <Sq m={mC} T={T} />
          <Dot p={mC(ptAt(T, 'P'))} />
          <Ring m={mC} k={2} f={f} opacity={qIn * 0} />
        </g>
        {qIn > 0 && f < at(scene, 1, 0) + 30 && (
          <g opacity={qIn * figOut}>
            <circle cx={mC([2, 2])[0]} cy={mC([2, 2])[1]} r={26 + 8 * pulse(f)} fill="none" stroke={C.amber} strokeWidth={7} />
          </g>
        )}
      </Stage>
      <Tx p={[mC([2, 2])[0] + 70, mC([2, 2])[1] - 90]} tex="\text{?}" size={150} color={C.violet} opacity={qIn * figOut} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: cardIn, transform: `translateY(${(1 - cardIn) * 24}px)` }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 150, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 56, fontWeight: 900, marginTop: 14 }}>滚动的顶点</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: 10 }}>AMC 10 风格 · 第4级</div>
      </div>
    </>
  );
};

const QLINES = [
  '大正方形：边长 2，固定不动。',
  '小正方形：边长 1，放在上面，左边对齐。',
  '小正方形绕着大正方形顺时针滚动，不打滑。',
  '每一次都绕着和大正方形接触的顶点旋转，直到有一条边平贴。',
  '第一次回到起点时停下。顶点 P 走过的路线有多长？',
];
const QY = [140, 215, 290, 365, 495];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mR;
  const T = interpolate(f, [at(scene, 3, 0.12), at(scene, 3, 0.5), at(scene, 3, 0.62), at(scene, 3, 0.78)], [0, 1, 1, 0], clamp);
  const drop = ease(f, at(scene, 1, 0.05), 16);
  const lined = ease(f, at(scene, 1, 0.55), 12);
  // clockwise arrow round the big square (right side, heading down)
  const A0 = 62;
  const A1 = -42;
  const arrowP = ease(f, at(scene, 2, 0.3), 26);
  const ang = A0 + (A1 - A0) * arrowP;
  const arc = range(31).map((i) => {
    const a = ((A0 + ((ang - A0) * i) / 30) * Math.PI) / 180;
    return m([1 + 2.3 * Math.cos(a), 1 + 2.3 * Math.sin(a)]);
  });
  const ar = (ang * Math.PI) / 180;
  const tip = arc[30];
  const tx = Math.sin(ar);
  const ty = -Math.cos(ar); // clockwise tangent (maths)
  const hd = (s: number): Pt => {
    const a = Math.atan2(-ty, tx) + Math.PI + s;
    return [tip[0] + 34 * Math.cos(a), tip[1] + 34 * Math.sin(a)];
  };
  const pPulse = f >= at(scene, 4, 0) && f < at(scene, 4, 0.5) ? 1 + 0.5 * pulse(f, 10) : 1;
  return (
    <>
      <Card x={50} y={115} w={1080} h={500} opacity={ease(f, 0, 12)} />
      {QLINES.map((t, i) => (
        <Text key={i} x={90} y={QY[i]} w={1000} size={42} weight={i === 4 ? 800 : 700} style={fadeUp(f, at(scene, i, 0.05))}>
          {t}
        </Text>
      ))}
      <Chips x={50} y={640} w={1100} start={(i) => at(scene, 5, 0.12 + i * 0.1)} />
      <Stage>
        <Board m={m} opacity={ease(f, 0, 14)} labels={ease(f, at(scene, 0, 0.5), 10)} />
        <g opacity={drop} transform={`translate(0 ${(1 - drop) * -70})`}>
          <Sq m={m} T={0} />
          <Lbl p={m([0.5, 2.5])} text="1" size={56} opacity={drop} color={C.primary} />
        </g>
        {/* the left sides lined up */}
        <line x1={m([0, 0])[0]} y1={m([0, 0])[1]} x2={m([0, 3])[0]} y2={m([0, 3])[1]} stroke={C.amber} strokeWidth={7} strokeLinecap="round" opacity={lined * 0.9} strokeDasharray="1 14" />
        <path d={`M ${arc.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={C.violet} strokeWidth={10} strokeLinecap="round" opacity={arrowP > 0 ? 1 : 0} />
        {arrowP > 0.9 && <path d={`M ${hd(0.5).join(' ')} L ${tip.join(' ')} L ${hd(-0.5).join(' ')}`} fill="none" stroke={C.violet} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
        <g opacity={T > 0 ? 1 : 0}>
          <Sq m={m} T={T} ghost />
          <Ring m={m} k={0} f={f} />
        </g>
        <PMark m={m} T={0} opacity={drop} scale={pPulse} />
      </Stage>
      <Text x={1690} y={730} w={200} size={38} color={C.violet} align="center" style={{ opacity: arrowP }}>
        顺时针
      </Text>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mR;
  const grow = ease(f, at(scene, 0, 0.45), 14);
  const l1 = ease(f, at(scene, 1, 0.1), 12);
  const l2 = ease(f, at(scene, 2, 0.35), 12);
  const pTL = m([0, 3]);
  const pBL = m([0, 2]);
  return (
    <>
      <Text x={70} y={150} w={1000} size={46} style={fadeUp(f, at(scene, 0, 0.05))}>
        P 一开始在大正方形的<span style={{ color: C.primary }}>左上角</span>。
      </Text>
      <Text x={70} y={330} w={1000} size={46} color={C.primary} style={fadeUp(f, at(scene, 1, 0.1))}>
        ✓ 跟踪小正方形的左下角
      </Text>
      <Text x={70} y={410} w={1000} size={46} color={C.muted} style={fadeUp(f, at(scene, 1, 0.45))}>
        ✗ 不是小正方形的左上角
      </Text>
      <Card x={50} y={560} w={1080} h={100} opacity={ease(f, at(scene, 2, 0.1), 12)} />
      <Text x={90} y={582} w={1000} size={44} weight={800} style={fadeUp(f, at(scene, 2, 0.1))}>
        目标：<span style={{ color: C.violet }}>把 P 走过的每段弧加起来</span>
      </Text>
      <Stage>
        <Board m={m} />
        <Sq m={m} T={0} />
        <PMark m={m} T={0} label={0.7 + 0.8 * grow} scale={1 + 0.3 * grow} />
        {/* arrow from the sentence to P */}
        <Step2 a={[1000, 190]} b={[pBL[0] - 40, pBL[1] - 32]} o={ease(f, at(scene, 0, 0.55), 14)} />
        <TickMark p={[pBL[0] - 46, pBL[1] - 46]} opacity={l1} />
        <GreyX p={[pTL[0] - 56, pTL[1] - 12]} opacity={l1 * ease(f, at(scene, 1, 0.45), 10)} />
        <Ring m={m} k={0} f={f} opacity={l2} />
        <Lbl p={[m([1, 2])[0] + 85, m([1, 2])[1] + 52]} text="支点" size={44} color={C.amber} opacity={l2} />
      </Stage>
    </>
  );
};

const Step2: React.FC<{ a: Pt; b: Pt; o: number }> = ({ a, b, o }) => {
  if (o <= 0) return null;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const e: Pt = [a[0] + (b[0] - a[0]) * o, a[1] + (b[1] - a[1]) * o];
  const h = (s: number) => [e[0] - 26 * Math.cos(ang + s), e[1] - 26 * Math.sin(ang + s)].join(' ');
  return (
    <g stroke={C.violet} strokeWidth={7} strokeLinecap="round" fill="none">
      <path d={`M ${a.join(' ')} Q ${(a[0] + b[0]) / 2 + 40} ${(a[1] + b[1]) / 2 - 60} ${e.join(' ')}`} />
      <path d={`M ${h(0.5)} L ${e.join(' ')} L ${h(-0.5)}`} />
    </g>
  );
};

const makePause = (seconds: number, prompt: string, variant: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  return (
    <>
      <Stage>
        <Board m={m} />
        <Sq m={m} T={0} />
        {variant && <Dot p={m([0.5, 2.5])} color={C.violet} />}
        {variant && <Lbl p={[m([0, 2.5])[0] - 20, m([0, 2.5])[1]]} text="中心" size={44} color={C.violet} anchor="end" />}
        {!variant && <PMark m={m} T={0} />}
      </Stage>
      {variant && (
        <Text x={1390} y={120} w={960} size={46} align="center" style={fadeUp(f, 6)}>
          {prompt}
        </Text>
      )}
      {!variant && <Chips x={900} y={130} w={980} start={() => 0} />}
      <Countdown scene={scene} seconds={seconds} x={1390} y={variant ? 570 : 590} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

const TblStarts = (scene: Parameters<SceneComponent>[0]['scene'], list: Record<number, number>) => range(8).map((i) => (list[i] !== undefined ? list[i] : 1e9));

const Roll1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const T = lin(f, at(scene, 2, 0.1), at(scene, 2, 0.85), 0, 1);
  const r1 = at(scene, 4, 0.5);
  const starts = TblStarts(scene, { 0: r1 });
  const ringO = ease(f, at(scene, 1, 0.4), 10);
  const markO = ease(f, at(scene, 2, 0.3), 12);
  const seg = ease(f, at(scene, 3, 0.1), 12);
  const circ = ease(f, at(scene, 4, 0.05), 14);
  return (
    <>
      <Stage>
        <Board m={m} />
        <Circ m={m} c={[1, 2]} r={1} opacity={circ} />
        <Trail m={m} to={T} />
        {circ > 0 && <Trail m={m} to={T} width={11 + 9 * pulse(f, 12) * circ} opacity={circ * 0.55} />}
        <Sq m={m} T={T} />
        <Ring m={m} k={0} f={f} opacity={ringO} />
        <AngMark m={m} c={[1, 2]} a0={180} a1={90} text="90°" opacity={markO * (T > 0.05 ? 1 : 0)} />
        <Seg m={m} a={[1, 2]} b={ptAt(1, 'P')} opacity={seg} />
        <PMark m={m} T={T} />
        <Lbl p={m([1.28, 2.5])} text="1" color={C.primary} size={52} opacity={seg} />
      </Stage>
      <Tx p={m([1, 1.45])} tex="2\pi" size={58} color={C.muted} opacity={circ} />
      <Table starts={starts} headStart={at(scene, 1, 0.3)} hi={(i) => justAdded(f, starts[i])} />
    </>
  );
};

const Corner: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const T = interpolate(f, [at(scene, 1, 0.1), at(scene, 1, 0.6), at(scene, 2, 0.15), at(scene, 2, 0.85)], [1, 1.5, 1.5, 2], clamp);
  const frozen = f >= at(scene, 1, 0.6) && f < at(scene, 2, 0.1);
  const flat = ease(f, at(scene, 1, 0.62), 10) * (1 - ease(f, at(scene, 2, 0.15), 10));
  const diag = ease(f, at(scene, 3, 0.3), 14);
  const starts = TblStarts(scene, { 0: 0, 1: at(scene, 4, 0.5) });
  return (
    <>
      <Stage>
        <Board m={m} />
        <Trail m={m} to={T} />
        <Sq m={m} T={T} />
        <Ring m={m} k={1} f={f} />
        {/* the single touching point */}
        <g opacity={flat}>
          <circle cx={m([2, 2])[0]} cy={m([2, 2])[1]} r={20 + 10 * pulse(f, 8)} fill="none" stroke={C.red} strokeWidth={8} />
          <line x1={705} y1={425} x2={m([2, 2])[0] + 14} y2={m([2, 2])[1] + 20} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
        </g>
        <AngMark m={m} c={[2, 2]} a0={135} a1={-45} text="180°" opacity={ease(f, at(scene, 2, 0.5), 12) * (f < at(scene, 3, 0) ? 1 : 1)} r={0.45} lr={0.85} />
        <Seg m={m} a={[1, 3]} b={[2, 2]} opacity={diag * 0.5} color={C.muted} />
        <Seg m={m} a={ptAt(2, 'P')} b={[2, 2]} opacity={diag} color={C.violet} width={7} />
        <Circ m={m} c={[2, 2]} r={Math.SQRT2} opacity={ease(f, at(scene, 4, 0.05), 14)} />
        <PMark m={m} T={T} />
      </Stage>
      <Tx p={m([2.22, 1.22])} tex="\sqrt2" size={60} color={C.violet} opacity={diag} />
      {flat > 0 && (
        <div style={{ position: 'absolute', left: 640, top: 430, opacity: flat }}>
          <Pill x={0} y={0} color={C.red} style={{ position: 'static', fontSize: 40 }}>
            还没平贴！
          </Pill>
        </div>
      )}
      <Table starts={starts} headStart={0} hi={(i) => (i === 0 ? 0 : justAdded(f, starts[i]))} dim={(i) => (i === 0 ? 0.6 : 1)} />
    </>
  );
};

const Rest: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const kf = [
    at(scene, 0, 0.08), at(scene, 0, 0.8),
    at(scene, 1, 0.4), at(scene, 1, 0.92),
    at(scene, 3, 0.02), at(scene, 3, 0.25),
    at(scene, 3, 0.29), at(scene, 3, 0.47),
    at(scene, 3, 0.52), at(scene, 3, 0.76),
    at(scene, 3, 0.80), at(scene, 3, 0.90),
  ];
  const T = interpolate(f, kf, [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8], clamp);
  const starts = TblStarts(scene, {
    0: 0, 1: 0,
    2: kf[1],
    3: at(scene, 2, 0.05),
    4: kf[5], 5: kf[7], 6: kf[9], 7: kf[11],
  });
  const k = moveOf(T);
  const cur = f > kf[11] + 20 ? -1 : [[kf[10], 7], [kf[8], 6], [kf[6], 5], [kf[4], 4], [kf[2], 3], [kf[0], 2]].find(([st]) => f >= st)?.[1] ?? -1;
  const flipP = f >= kf[2] && f <= kf[3] ? 1 + 0.55 * pulse(f, 7) : 1;
  const doneO = ease(f, at(scene, 4, 0.2), 12);
  return (
    <>
      <Stage>
        <Board m={m} />
        <Trail m={m} to={T} />
        <Sq m={m} T={T} />
        {cur >= 0 && f > kf[0] - 6 && <Ring m={m} k={cur} f={f} />}
        <Seg m={m} a={PIV[2]} b={ptAt(T, 'P')} color={C.primary} opacity={ease(f, at(scene, 0, 0.45), 10) * (1 - ease(f, at(scene, 1, 0.1), 10))} />
        <PMark m={m} T={T} scale={flipP} />
        <TickMark p={[mL([0, 2])[0] - 52, mL([0, 2])[1] - 52]} opacity={doneO} />
      </Stage>
      <Tx p={m([ (PIV[2][0] + ptAt(T, 'P')[0]) / 2 + 0.3, (PIV[2][1] + ptAt(T, 'P')[1]) / 2 ])} tex="1" size={52} color={C.primary} opacity={ease(f, at(scene, 0, 0.45), 10) * (1 - ease(f, at(scene, 1, 0.1), 10))} />
      <Tx p={[m([2, 0])[0] + 120, m([2, 0])[1] + 60]} tex="r=0" size={56} color={C.muted} opacity={ease(f, at(scene, 2, 0.05), 10) * (1 - ease(f, kf[4], 10))} />
      {ease(f, at(scene, 2, 0.4), 12) * (1 - ease(f, at(scene, 3, 0.0), 10)) > 0 && (
        <div style={{ position: 'absolute', left: 680, top: 735, opacity: ease(f, at(scene, 2, 0.4), 12) * (1 - ease(f, at(scene, 3, 0), 10)) }}>
          <Pill x={0} y={0} color={C.primary} style={{ position: 'static', fontSize: 40 }}>
            走完半程！
          </Pill>
        </div>
      )}
      <Table starts={starts} headStart={0} hi={(i) => (i < 2 ? 0 : justAdded(f, starts[i]))} />
    </>
  );
};

const Sum: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const tableOut = 1 - ease(f, at(scene, 0, 0.42), 12);
  const hiG = ease(f, at(scene, 0, 0.0), 8);
  const hiV = ease(f, at(scene, 1, 0.0), 8);
  const hiZ = ease(f, at(scene, 2, 0.0), 8);
  const starts = range(8).map(() => 0);
  const kindHi = (i: number) => (ROWS[i].kind === 'g' ? hiG * (1 - ease(f, at(scene, 1, 0), 8)) : ROWS[i].kind === 'v' ? hiV * (1 - ease(f, at(scene, 2, 0), 8)) : hiZ);
  const eq = (tex: string, y: number, start: number, color?: string, size = 56) => (
    <div style={{ position: 'absolute', left: 940, top: y, ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
  return (
    <>
      <Stage>
        <Board m={m} />
        <Trail m={m} to={8} />
        <Sq m={m} T={8} />
        <PMark m={m} T={8} />
      </Stage>
      <Table starts={starts} headStart={0} opacity={tableOut} hi={(i) => (kindHi(i) > 0.3 ? 1 : 0)} dim={(i) => 1 - 0.7 * (1 - kindHi(i)) * hiG} />
      <div style={{ position: 'absolute', left: 925, top: 144, width: 5, height: 2, background: C.primary, opacity: 0 }} />
      <Swatch y={138} color={C.primary} start={at(scene, 0, 0.42)} />
      <Swatch y={253} color={C.violet} start={at(scene, 1, 0.1)} />
      <Swatch y={368} color={C.muted} start={at(scene, 2, 0.1)} />
      {eq('4\\times\\dfrac{\\pi}{2}=2\\pi', 118, at(scene, 0, 0.42))}
      {eq('2\\times\\sqrt2\\,\\pi=2\\sqrt2\\,\\pi', 233, at(scene, 1, 0.3))}
      {eq('0+0=0', 348, at(scene, 2, 0.3))}
      <div style={{ position: 'absolute', left: 930, top: 460, width: 800, height: 5, background: C.line, opacity: ease(f, at(scene, 3, 0.05), 10) }} />
      {eq('2\\pi+2\\sqrt2\\,\\pi=(2+2\\sqrt2)\\pi', 478, at(scene, 3, 0.15), C.green, 62)}
      <Chips x={920} y={610} w={960} start={() => at(scene, 3, 0.55)} state={(i) => (i === 2 && f >= at(scene, 3, 0.9) ? 'good' : 'plain')} />
      <Answer x={1745} y={290} value="C" start={at(scene, 3, 0.9)} chime={CHIME} />
    </>
  );
};

const Swatch: React.FC<{ y: number; color: string; start: number }> = ({ y, color, start }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: 905, top: y, width: 18, height: 70, borderRadius: 9, background: color, opacity: ease(f, start, 10) }} />;
};

// pieces of the trail that fly together into whole circles
const FLY: { j: number; rho: number; circle: number }[] = [
  { j: 0, rho: 0, circle: 0 },
  { j: 2, rho: 0, circle: 0 },
  { j: 4, rho: -90, circle: 0 },
  { j: 6, rho: -90, circle: 0 },
  { j: 1, rho: 0, circle: 1 },
  { j: 5, rho: 0, circle: 1 },
];
const CIRC_C: Pt[] = [[1140, 440], [1580, 440]];

const Circles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const eqO = 1;
  return (
    <>
      <Stage>
        <Board m={m} />
        <Sq m={m} T={8} opacity={0.5} />
        <PMark m={m} T={8} />
        {[0, 1].map((c) => (
          <circle key={c} cx={CIRC_C[c][0]} cy={CIRC_C[c][1]} r={(c === 0 ? 1 : Math.SQRT2) * U} fill="none" stroke={C.line} strokeWidth={8} strokeDasharray="4 14" strokeLinecap="round" opacity={ease(f, at(scene, c === 0 ? 1 : 2, 0), 12)} />
        ))}
        {FLY.map(({ j, rho, circle }, n) => {
          const startF = circle === 0 ? at(scene, 1, 0.1 + 0.16 * n) : at(scene, 2, 0.1 + 0.2 * (n - 4));
          const t = ease(f, startF, 40);
          const [px, py] = m(PIV[j]);
          const dx = CIRC_C[circle][0] - px;
          const dy = CIRC_C[circle][1] - py;
          const pts = movePts('P', j, 0, 1, 40);
          const col = circle === 0 ? C.primary : C.violet;
          return (
            <g key={n} transform={`translate(${t * dx} ${t * dy}) rotate(${-t * rho} ${px} ${py})`}>
              <path d={`M ${pts.map((p) => m(p).join(' ')).join(' L ')}`} fill="none" stroke={col} strokeWidth={11} strokeLinecap="round" />
            </g>
          );
        })}
      </Stage>
      <Tx p={CIRC_C[0]} tex="2\pi" size={60} color={C.primary} opacity={ease(f, at(scene, 1, 0.8), 12)} />
      <Tx p={CIRC_C[1]} tex="2\sqrt2\,\pi" size={60} color={C.violet} opacity={ease(f, at(scene, 2, 0.85), 12)} />
      <div style={{ position: 'absolute', left: 925, top: 690, ...fadeUp(f, at(scene, 3, 0.15)) }}>
        <Tex tex="2\pi+2\sqrt2\,\pi=(2+2\sqrt2)\pi" size={56} />
      </div>
      <div style={{ position: 'absolute', left: 925, top: 780, display: 'flex', alignItems: 'center', gap: 18, fontSize: 42, fontWeight: 800, color: C.green, ...fadeUp(f, at(scene, 3, 0.55)) }}>
        <svg width={46} height={46} viewBox="0 0 54 54">
          <circle cx={27} cy={27} r={27} fill={C.green} />
          <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        答案一样！
      </div>
      <div style={{ position: 'absolute', left: 925, top: 118, width: 930, padding: '10px 28px', background: C.card, borderRadius: 26, fontSize: 38, fontWeight: 800, color: C.ink, boxShadow: '0 6px 24px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 4, 0.3)), opacity: ease(f, at(scene, 4, 0.3), 12) * eqO }}>
        弧能配成套？<span style={{ color: C.primary }}>就拼成整圆。</span>
      </div>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const L = (i: number) => at(scene, i, 0);
  const inA = f >= L(1) && f < L(3);
  const inB = f >= L(3) && f < L(5);
  const inD = f >= L(5) && f < L(7);
  const inE = f >= L(7) && f < L(9);
  const inEnd = f >= L(9);
  const bad = (i: number) => (i === 0 ? f >= L(1) : i === 1 ? f >= L(3) : i === 3 ? f >= L(5) : i === 4 ? f >= L(7) : false);
  const T = inA ? 1.5 : inB ? 2 : inD ? lin(f, at(scene, 5, 0.05), at(scene, 6, 0.4), 0, 8) : inE ? 3 : inEnd ? 8 : 8;
  const showP = !inD;
  const eqs: [boolean, string, number][] = [
    [inA, '2\\pi+2\\cdot\\dfrac{\\sqrt2\\,\\pi}{2}=(2+\\sqrt2)\\pi', 1],
    [inB, '2\\pi+2\\cdot\\pi\\cdot1=4\\pi', 3],
    [inD, '\\sqrt2\\,\\pi+4\\pi=(4+\\sqrt2)\\pi', 5],
    [inE, '2\\pi+2\\sqrt2\\,\\pi+2\\pi=(4+2\\sqrt2)\\pi', 7],
  ];
  const wrongOne = ease(f, L(3), 10) * (1 - ease(f, at(scene, 4, 0.2), 10));
  const rootTwo = ease(f, at(scene, 4, 0.2), 10);
  const r1 = ease(f, at(scene, 7, 0.1), 10) * (1 - ease(f, at(scene, 8, 0.15), 10));
  const r0 = ease(f, at(scene, 8, 0.15), 10);
  const tags = ['角度错', '半径错', '顶点错', '忘了 0'];
  return (
    <>
      <Stage>
        <Board m={m} />
        {inD ? (
          <>
            <Trail m={m} id="P" to={8} opacity={0.18} />
            <Trail m={m} id="TL" to={T} width={12} />
            <Sq m={m} T={T} />
            <Dot p={m(ptAt(T, 'P'))} opacity={0.4} />
            <PMark m={m} T={T} id="TL" color={C.amber} text="左上角" label={0} />
          </>
        ) : (
          <>
            <Trail m={m} to={inEnd || f < L(1) ? 8 : T} opacity={f < L(1) ? ease(f, 0, 12) * 0.5 : 1} />
            <Sq m={m} T={inEnd || f < L(1) ? 8 : T} />
            <PMark m={m} T={inEnd || f < L(1) ? 8 : T} scale={inE ? 1 + 0.4 * pulse(f, 8) : 1} />
          </>
        )}
        {inA && (
          <circle cx={m([2, 2])[0]} cy={m([2, 2])[1]} r={20 + 9 * pulse(f, 8)} fill="none" stroke={C.red} strokeWidth={8} opacity={ease(f, at(scene, 2, 0), 10)} />
        )}
        {(inA || inB) && <Ring m={m} k={1} f={f} />}
        {inB && <Seg m={m} a={ptAt(2, 'P')} b={[2, 2]} color={C.violet} width={7} opacity={ease(f, L(3), 10)} />}
        {inE && <Ring m={m} k={3} f={f} />}
        {inD && <Dot p={m(ptAt(0, 'TL'))} color={C.amber} opacity={0.0} />}
      </Stage>
      {inD && (
        <div style={{ position: 'absolute', left: 930, top: 540, fontSize: 40, fontWeight: 800, color: C.amber, ...fadeUp(f, L(5) + 10) }}>● 小正方形的左上角</div>
      )}
      {inB && (
        <>
          <Tx p={m([2.22, 1.22])} tex="1" size={60} color={C.red} opacity={wrongOne} />
          <Tx p={m([2.22, 1.22])} tex="\sqrt2" size={60} color={C.violet} opacity={rootTwo} />
          <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <GreyX p={m([2.22, 1.22])} size={70} color={C.red} opacity={wrongOne} />
          </svg>
        </>
      )}
      {inE && (
        <>
          <Tx p={[m([2, 0])[0] + 140, m([2, 0])[1] + 62]} tex="r=1" size={56} color={C.red} opacity={r1} />
          <Tx p={[m([2, 0])[0] + 140, m([2, 0])[1] + 62]} tex="r=0" size={56} color={C.green} opacity={r0} />
          <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g stroke={C.red} strokeWidth={9} strokeLinecap="round" opacity={r1 * 0.85}>
              <line x1={m([2, 0])[0] + 140 - 80} y1={m([2, 0])[1] + 62 - 34} x2={m([2, 0])[0] + 140 + 80} y2={m([2, 0])[1] + 62 + 34} />
              <line x1={m([2, 0])[0] + 140 - 80} y1={m([2, 0])[1] + 62 + 34} x2={m([2, 0])[0] + 140 + 80} y2={m([2, 0])[1] + 62 - 34} />
            </g>
          </svg>
        </>
      )}
      {inA && (
        <div style={{ position: 'absolute', left: 650, top: 560, opacity: ease(f, L(2), 10) }}>
          <Pill x={0} y={0} color={C.red} style={{ position: 'static', fontSize: 40 }}>
            还没平贴！
          </Pill>
        </div>
      )}
      <Chips x={900} y={125} w={990} start={() => L(0) + 6} state={(i) => (bad(i) ? 'bad' : 'plain')} />
      {eqs.map(([on, tex, li], n) =>
        on ? (
          <div key={n} style={{ position: 'absolute', left: 930, top: 440, ...fadeUp(f, L(li) + 20) }}>
            <Tex tex={tex} size={52} />
          </div>
        ) : null,
      )}
      {inEnd &&
        tags.map((t, i) => (
          <TagPill key={t} x={940 + (i % 2) * 460} y={420 + Math.floor(i / 2) * 110} color={[C.violet, C.violet, C.amber, C.muted][i]} start={at(scene, 9, 0.12 + i * 0.2)}>
            {t}
          </TagPill>
        ))}
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const c = ease(f, at(scene, 0, 0.5), 14);
  return (
    <>
      <Stage>
        <Board m={m} />
        <Sq m={m} T={0} />
        <Dot p={m([0.5, 2.5])} color={C.violet} scale={1.2 * c + 0.0001} opacity={c} />
        <Lbl p={[m([0, 2.5])[0] - 22, m([0, 2.5])[1]]} text="中心" size={46} color={C.violet} anchor="end" opacity={c} />
      </Stage>
      <Text x={900} y={170} w={960} size={52} weight={800} style={fadeUp(f, at(scene, 0, 0.1))}>
        正方形不变，滚法不变。
      </Text>
      <Text x={900} y={290} w={960} size={52} weight={800} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>
        新的标记点：中心！
      </Text>
      <Text x={900} y={440} w={960} size={52} weight={800} style={fadeUp(f, at(scene, 0, 0.75))}>
        中心走过的路线有多长？
        <span style={{ color: C.violet }}> ?</span>
      </Text>
    </>
  );
};

const Eq: React.FC<{ y: number; tex: string; start: number; color?: string; size?: number; x?: number }> = ({ y, tex, start, color, size = 58, x = 930 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mL;
  const T = lin(f, at(scene, 1, 0.04), at(scene, 1, 0.96), 0, 8);
  const k = moveOf(T);
  const playing = f >= at(scene, 1, 0.0);
  const diagO = ease(f, at(scene, 0, 0.1), 12);
  const cen = ptAt(T, 'C');
  const circO = ease(f, at(scene, 4, 0.3), 14);
  return (
    <>
      <Stage>
        <Board m={m} />
        <Trail m={m} id="C" to={playing ? T : 0} width={10} />
        <Sq m={m} T={playing ? T : 0} />
        {f < at(scene, 1, 0) && (
          <>
            <Seg m={m} a={[0, 2]} b={[1, 3]} opacity={diagO * 0.8} color={C.muted} />
            <Seg m={m} a={[0, 3]} b={[1, 2]} opacity={diagO * 0.8} color={C.muted} />
            <line x1={m([0.5, 2.5])[0]} y1={m([0.5, 2.5])[1]} x2={m([0, 2])[0]} y2={m([0, 2])[1]} stroke={C.violet} strokeWidth={9} strokeLinecap="round" opacity={diagO} />
            <line x1={m([0, 2.5])[0] - 150} y1={m([0, 2.5])[1]} x2={m([0.25, 2.25])[0]} y2={m([0.25, 2.25])[1]} stroke={C.violet} strokeWidth={4} opacity={diagO * 0.6} />
          </>
        )}
        {playing && <Seg m={m} a={cen} b={PIV[k]} color={C.violet} width={6} opacity={T < 8 ? 1 : 0} />}
        {playing && T < 8 && <Ring m={m} k={k} f={f} />}
        <Dot p={m(cen)} color={C.violet} />
        <PMark m={m} T={playing ? T : 0} opacity={0.35} label={0} />
      </Stage>
      <Tx p={[m([0, 2.5])[0] - 205, m([0, 2.5])[1]]} tex="\dfrac{\sqrt2}{2}" size={56} color={C.violet} opacity={diagO * (f < at(scene, 1, 0) ? 1 : 0)} />
      <Eq y={90} tex="4\times90^\circ+4\times180^\circ" start={at(scene, 2, 0.2)} />
      <Eq y={168} tex="=1080^\circ" start={at(scene, 3, 0.5)} />
      <Eq y={246} tex="=3\times360^\circ" start={at(scene, 4, 0.1)} />
      <Text x={1500} y={257} w={380} size={42} weight={800} color={C.violet} style={fadeUp(f, at(scene, 4, 0.1))}>
        3 整圈
      </Text>
      <Stage>
        {range(3).map((i) => (
          <circle key={i} cx={1060 + i * 280} cy={445} r={108} fill="none" stroke={C.violet} strokeWidth={9} opacity={ease(f, at(scene, 4, 0.45 + i * 0.12), 12) * circO} />
        ))}
      </Stage>
      {range(3).map((i) => (
        <Tx key={i} p={[1060 + i * 280, 445]} tex="r=\dfrac{\sqrt2}{2}" size={42} color={C.violet} opacity={ease(f, at(scene, 4, 0.55 + i * 0.12), 12) * circO} />
      ))}
      <Eq y={565} tex="2\pi\cdot\dfrac{\sqrt2}{2}=\sqrt2\,\pi" start={at(scene, 5, 0.15)} />
      <Eq y={745} tex="3\times\sqrt2\,\pi=3\sqrt2\,\pi" start={at(scene, 5, 0.6)} color={C.green} size={66} />
      <Sequence from={at(scene, 5, 0.95)} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <svg width={100} height={100} style={{ position: 'absolute', left: 1670, top: 740, ...fadeUp(f, at(scene, 5, 0.9)) }}>
        <TickMark p={[50, 50]} r={44} />
      </svg>
      <Confetti x={1500} y={730} start={at(scene, 5, 0.95)} seed={5} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = (p: Pt): Pt => [1370 + 105 * p[0], 600 - 105 * p[1]];
  const T = lin(f, at(scene, 1, 0.1), at(scene, 1, 0.8), 1, 2);
  const cardOut = 1 - ease(f, at(scene, 2, 0.05), 14) * 0.9;
  return (
    <>
      <Card x={70} y={130} w={1700} h={620} opacity={ease(f, 0, 14) * cardOut} />
      <div style={{ opacity: cardOut }}>
        <Text x={130} y={170} w={800} size={46} color={C.primary} weight={900} style={fadeUp(f, 4)}>
          核心思路
        </Text>
        <Text x={130} y={260} w={800} size={52} weight={900} style={fadeUp(f, at(scene, 0, 0.1))}>
          列出每一次翻滚：<span style={{ color: C.amber }}>支点</span> + <span style={{ color: C.violet }}>角度</span>
        </Text>
        <Text x={130} y={450} w={1100} size={50} weight={800} color={C.violet} style={fadeUp(f, at(scene, 1, 0.1))}>
          半径 = 到支点的距离（可以是 <span style={{ color: C.red }}>0</span>！）
        </Text>
      </div>
      <Stage>
        <g opacity={cardOut}>
          <rect x={m([0, 2])[0]} y={m([0, 2])[1]} width={210} height={210} fill="#e4e7ef" stroke={C.ink} strokeWidth={6} />
          <path d={poly(m, poseAt(T))} fill={C.primarySoft} stroke={C.primary} strokeWidth={6} strokeLinejoin="round" />
          {(() => {
            const pts = movePts('P', 1, 0, sm(T - 1));
            return <path d={`M ${pts.map((p) => m(p).join(' ')).join(' L ')}`} fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" />;
          })()}
          <Seg m={m} a={[2, 2]} b={ptAt(T, 'P')} color={C.violet} width={5} />
          <circle cx={m([2, 2])[0]} cy={m([2, 2])[1]} r={18 + 6 * pulse(f)} fill="none" stroke={C.amber} strokeWidth={6} />
          <Dot p={m(ptAt(T, 'P'))} scale={0.85} />
        </g>
      </Stage>
      <SignOff start={at(scene, 2, 0.15)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={400} start={at(scene, 2, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, '哪个选项是 P 走过的路线长度？', false),
  roll1: Roll1,
  corner: Corner,
  rest: Rest,
  sum: Sum,
  circles: Circles,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, '跟着小正方形的中心走，路线有多长？', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

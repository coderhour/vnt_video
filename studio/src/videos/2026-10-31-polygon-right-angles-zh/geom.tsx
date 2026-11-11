import { clamp, ease, range } from '../../lib/anim';
import { NUNITO } from '../../lib/fonts';
import { C } from '../../lib/theme';

// Geometry + drawing helpers for the polygon-turns video. Maths coordinates (y up), screen = [ox + x*S, oy - y*S].

export type P = [number, number];
export type Poly = { pts: P[]; dirs: number[] }; // dirs[i] = direction (degrees, y up) of side i, from pts[i] to pts[i+1]

const rad = (d: number) => (d * Math.PI) / 180;
const pol = (c: P, r: number, deg: number): P => [c[0] + r * Math.cos(rad(deg)), c[1] - r * Math.sin(rad(deg))];
const f1 = (n: number) => n.toFixed(1);
const pt = (p: P) => `${f1(p[0])} ${f1(p[1])}`;
export const norm = (d: number) => ((d % 360) + 360) % 360;
/** Turn at the corner where direction a changes to b (left turn, 0..180). */
export const turnOf = (a: number, b: number) => norm(b - a);

/** Maths polygon from side directions and lengths, then scaled to the screen. */
export const build = (dirs: number[], lens: number[], S: number, o: P): Poly => {
  let x = 0;
  let y = 0;
  const pts: P[] = [];
  dirs.forEach((d, i) => {
    pts.push([o[0] + x * S, o[1] - y * S]);
    x += lens[i] * Math.cos(rad(d));
    y += lens[i] * Math.sin(rad(d));
  });
  if (Math.abs(x) > 1e-6 || Math.abs(y) > 1e-6) throw new Error(`polygon does not close: ${x}, ${y}`);
  return { pts, dirs };
};

/** The real 11-gon of verify.py: sides 0 and 1 are the bottom and right side, then nine unit sides. */
export const DIRS11 = [0, 90, ...range(9).map((i) => 180 + 20 * i)];
const rest = DIRS11.slice(2);
const EX = rest.reduce((s, d) => s + Math.cos(rad(d)), 0);
const EY = rest.reduce((s, d) => s + Math.sin(rad(d)), 0);
export const LENS11 = [-EX, -EY, ...range(9).map(() => 1)];
if (!(LENS11[0] > 0 && LENS11[1] > 0)) throw new Error('11-gon sides must be positive');
export const poly11 = (S: number, o: P) => build(DIRS11, LENS11, S, o);

/** A lopsided pentagon with turns 100, 70, 50, 80, 60 (inside angles 80, 110, 130, 100, 120). */
export const DIRS5 = [0, 100, 170, 220, 300];
const L5a = [1.8, 1.9, 1.2];
const sx = L5a.reduce((s, l, i) => s + l * Math.cos(rad(DIRS5[i])), 0);
const sy = L5a.reduce((s, l, i) => s + l * Math.sin(rad(DIRS5[i])), 0);
const [ca, cb, sa, sb] = [Math.cos(rad(220)), Math.cos(rad(300)), Math.sin(rad(220)), Math.sin(rad(300))];
const det = ca * sb - cb * sa;
export const LENS5 = [...L5a, (-sx * sb + sy * cb) / det, (-sy * ca + sx * sa) / det];
if (!(LENS5[3] > 0 && LENS5[4] > 0)) throw new Error('pentagon sides must be positive');
export const poly5 = (S: number, o: P) => build(DIRS5, LENS5, S, o);

export const SQUARE = (S: number, o: P) => build([0, 90, 180, 270], [1, 1, 1, 1], S, o);

/** Corner i sits at pts[i], between side i-1 and side i. */
export const corner = (poly: Poly, i: number) => {
  const n = poly.pts.length;
  const k = ((i % n) + n) % n;
  const din = poly.dirs[(k - 1 + n) % n];
  const dout = poly.dirs[k];
  return { at: poly.pts[k], din, dout, turn: turnOf(din, dout) };
};

// ---------- arcs and corner marks ----------

const arc = (c: P, r: number, a1: number, a2: number) => `M ${pt(pol(c, r, a1))} A ${r} ${r} 0 0 0 ${pt(pol(c, r, a2))}`;
const sector = (c: P, r: number, a1: number, a2: number) =>
  `M ${pt(c)} L ${pt(pol(c, r, a1))} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 0 ${pt(pol(c, r, a2))} Z`;

export const SvgText: React.FC<{ at: P; size?: number; color: string; op?: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; halo?: boolean }> = ({ at, size = 48, color, op = 1, anchor = 'middle', halo = true, children }) =>
  op <= 0 ? null : (
    <text x={at[0]} y={at[1]} fontFamily={NUNITO} fontWeight={900} fontSize={size} fill={color} textAnchor={anchor} dominantBaseline="central" opacity={op} stroke="#fff" strokeWidth={halo ? 9 : 0} paintOrder="stroke" strokeLinejoin="round">
      {children}
    </text>
  );

/** Inside angle (purple) + turn (green) at one corner, side by side on one straight line. */
export const CornerMark: React.FC<{
  at: P; din: number; dout: number; r?: number; inOp?: number; turnOp?: number; extOp?: number;
  inLabel?: string; turnLabel?: string; size?: number; labelGap?: number; turnR?: number; turnGap?: number; extLen?: number;
}> = ({ at, din, dout, r = 62, inOp = 0, turnOp = 0, extOp = 0, inLabel, turnLabel, size = 48, labelGap = 56, turnR = r, turnGap = labelGap, extLen }) => {
  const turn = turnOf(din, dout);
  const interior = 180 - turn;
  const inMid = dout + interior / 2;
  const tMid = din + turn / 2;
  return (
    <g>
      {extOp > 0 && <line x1={at[0]} y1={at[1]} x2={pol(at, extLen ?? r + 70, din)[0]} y2={pol(at, extLen ?? r + 70, din)[1]} stroke={C.muted} strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" opacity={extOp} />}
      {inOp > 0 && (
        <g opacity={inOp}>
          <path d={sector(at, r, dout, din + 180)} fill={C.violet} opacity={0.2} />
          <path d={arc(at, r, dout, din + 180)} fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" />
          {inLabel && <SvgText at={pol(at, r + labelGap, inMid)} size={size} color={C.violet}>{inLabel}</SvgText>}
        </g>
      )}
      {turnOp > 0 && (
        <g opacity={turnOp}>
          <path d={sector(at, turnR, din, dout)} fill={C.primary} opacity={0.25} />
          <path d={arc(at, turnR, din, dout)} fill="none" stroke={C.primary} strokeWidth={9} strokeLinecap="round" />
          {turnLabel && <SvgText at={pol(at, turnR + turnGap, tMid)} size={size} color="#0a9d68">{turnLabel}</SvgText>}
        </g>
      )}
    </g>
  );
};

/** Small square for a right angle (inside). */
export const RightMark: React.FC<{ at: P; din: number; dout: number; a?: number; op?: number }> = ({ at, din, dout, a = 30, op = 1 }) => {
  if (op <= 0) return null;
  const p1 = pol(at, a, dout);
  const p2 = pol(at, a, din + 180);
  const p3: P = [p1[0] + p2[0] - at[0], p1[1] + p2[1] - at[1]];
  return <path d={`M ${pt(p1)} L ${pt(p3)} L ${pt(p2)}`} fill="none" stroke={C.violet} strokeWidth={7} strokeLinejoin="round" opacity={op} />;
};

// ---------- polygon outline, walker, turn circle ----------

export const Outline: React.FC<{ poly: Poly; progress?: number; op?: number; fill?: string; color?: string; width?: number }> = ({ poly, progress = 1, op = 1, fill = C.violetSoft, color = C.ink, width = 8 }) => {
  if (progress <= 0 || op <= 0) return null;
  const d = `M ${poly.pts.map(pt).join(' L ')} Z`;
  return (
    <g opacity={op}>
      <path d={d} fill={fill} opacity={Math.min(1, progress * 1.5) * 0.9} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
    </g>
  );
};

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/** Position and heading of a walker at u sides along the boundary. */
export const walkAt = (poly: Poly, u: number): { pos: P; heading: number } => {
  const n = poly.pts.length;
  const i = Math.floor(u + 1e-9);
  const k = ((i % n) + n) % n;
  const frac = u - i;
  const a = poly.pts[k];
  const b = poly.pts[(k + 1) % n];
  const pos: P = [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
  const cur = poly.dirs[k];
  const prev = poly.dirs[(k - 1 + n) % n];
  const delta = turnOf(prev, cur);
  const heading = frac < 0.22 && i > 0 ? cur - delta * (1 - smooth(frac / 0.22)) : cur;
  return { pos, heading };
};

/** A walker arrow with a trail from u0 to u. */
export const Walker: React.FC<{ poly: Poly; u0: number; u: number; op?: number }> = ({ poly, u0, u, op = 1 }) => {
  if (op <= 0) return null;
  const n = poly.pts.length;
  const { pos, heading } = walkAt(poly, u);
  const trail: P[] = [walkAt(poly, u0).pos];
  for (let j = Math.floor(u0) + 1; j <= Math.floor(u + 1e-9); j++) trail.push(poly.pts[((j % n) + n) % n]);
  trail.push(pos);
  return (
    <g opacity={op}>
      <polyline points={trail.map(pt).join(' ')} fill="none" stroke={C.blue} strokeWidth={13} strokeLinejoin="round" strokeLinecap="round" opacity={0.45} />
      <g transform={`translate(${f1(pos[0])} ${f1(pos[1])}) rotate(${f1(-heading)})`}>
        <path d="M 34 0 L -20 -24 L -6 0 L -20 24 Z" fill={C.blue} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      </g>
    </g>
  );
};

export type Wedge = { a: number; color: string; p: number; label?: string };

/** Pie that fills up with turn wedges, in order, starting at angle 0 and going counter-clockwise. */
export const TurnCircle: React.FC<{
  c: P; R: number; wedges: Wedge[]; ghost?: { a1: number; a2: number; op: number; label?: string }; center?: string; centerOp?: number; op?: number; fs?: number;
}> = ({ c, R, wedges, ghost, center, centerOp = 0, op = 1, fs = 48 }) => {
  if (op <= 0) return null;
  let start = 0;
  const parts = wedges.map((w, i) => {
    const a1 = start;
    const a2 = start + w.a;
    start = a2;
    if (w.p <= 0) return null;
    return (
      <g key={i}>
        <g transform={`translate(${f1(c[0])} ${f1(c[1])}) scale(${w.p}) translate(${-f1(c[0])} ${-f1(c[1])})`}>
          <path d={sector(c, R, a1, a2)} fill={w.color} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
        </g>
        {w.label && w.p > 0.9 && <SvgText at={pol(c, R * 0.62, (a1 + a2) / 2)} size={fs} color="#fff" halo={false}>{w.label}</SvgText>}
      </g>
    );
  });
  return (
    <g opacity={op}>
      <circle cx={c[0]} cy={c[1]} r={R} fill={C.card} stroke={C.line} strokeWidth={10} />
      {ghost && ghost.op > 0 && (
        <g opacity={ghost.op}>
          <path d={sector(c, R - 4, ghost.a1, ghost.a2)} fill="none" stroke={C.muted} strokeWidth={5} strokeDasharray="14 12" strokeLinejoin="round" />
          {ghost.label && <SvgText at={pol(c, R * 0.5, (ghost.a1 + ghost.a2) / 2)} size={56} color={C.muted}>{ghost.label}</SvgText>}
        </g>
      )}
      {parts}
      {center && centerOp > 0 && (
        <g opacity={centerOp}>
          <circle cx={c[0]} cy={c[1]} r={R * 0.5} fill="#fff" opacity={0.92} />
          <SvgText at={c} size={64} color={C.ink}>{center}</SvgText>
        </g>
      )}
    </g>
  );
};

/** 0→1 once the walker has passed corner k (u ≥ k). */
export const passP = (u: number, k: number, dur = 0.3) => Math.min(1, Math.max(0, (u - k) / dur));
/** 1 right when the walker passes corner k, fading out over `dur` sides. */
export const flashP = (u: number, k: number, dur = 0.7) => (u < k ? 0 : Math.max(0, 1 - (u - k) / dur));

/** u for a walk that runs linearly from frame a to frame b. */
export const walkU = (f: number, a: number, b: number, u0: number, u1: number) => u0 + (u1 - u0) * Math.min(1, Math.max(0, (f - a) / (b - a)));

/** The partial shape for the intro and question: sides 0-5 solid, the rest an unknown dashed curve. */
export const PartialShape: React.FC<{ poly: Poly; progress?: number; marks?: number; labels?: number; unknown?: number; op?: number; fs?: number }> = ({ poly, progress = 1, marks = 1, labels = 1, unknown = 1, op = 1, fs = 48 }) => {
  if (op <= 0 || progress <= 0) return null;
  const v = poly.pts;
  const d = poly.dirs;
  // the unknown part: a loose dashed curve from V6 back to V0 (control point where the tangent lines meet)
  const a = v[6];
  const b = v[0];
  const t = rad(d[5]);
  const kx = (b[1] - a[1]) / -Math.sin(t); // screen y grows down, so heading is (cos, -sin)
  const ctrl: P = [a[0] + kx * Math.cos(t), b[1]];
  const solid = `M ${v.slice(0, 7).map(pt).join(' L ')}`;
  const closed = `${solid} Q ${pt(ctrl)} ${pt(b)} Z`;
  const out = (i: number) => {
    const c = corner(poly, i);
    return pol(c.at, 88, c.dout + (180 - c.turn) / 2 + 180);
  };
  const m = (i: number) => corner(poly, i);
  return (
    <g opacity={op}>
      <path d={closed} fill={C.violetSoft} opacity={Math.min(1, progress * 1.4) * 0.9} />
      <path d={solid} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
      <path d={`M ${pt(a)} Q ${pt(ctrl)} ${pt(b)}`} fill="none" stroke={C.muted} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 18" opacity={unknown * ease(progress, 0.6, 0.4)} />
      <path d={`M ${pt(b)} L ${pt(v[1])}`} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      {[1, 2].map((i) => <RightMark key={i} at={m(i).at} din={m(i).din} dout={m(i).dout} a={34} op={marks} />)}
      {[3, 4, 5].map((i) => (
        <CornerMark key={i} at={m(i).at} din={m(i).din} dout={m(i).dout} r={34} inOp={marks} />
      ))}
      {labels > 0 && (
        <>
          <SvgText at={[v[1][0] + 78, v[1][1] + 20]} size={fs} color={C.violet} op={labels}>90°</SvgText>
          <SvgText at={[v[2][0] + 78, v[2][1] - 12]} size={fs} color={C.violet} op={labels}>90°</SvgText>
          {[3, 4, 5].map((i) => <SvgText key={i} at={out(i)} size={fs} color={C.violet} op={labels}>160°</SvgText>)}
        </>
      )}
    </g>
  );
};

import { Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';

export const SLUG = '2026-11-01-fence-corner';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates: corner O at the origin, y UP) ----------
export type Pt = [number, number];
const S2 = Math.SQRT2;
const D2R = Math.PI / 180;
export const R = Math.sqrt(36 / (2 - S2)); // circumradius of the best octagon (7.839), same as verify.py
export const mk = (ox: number, oy: number, u: number) => (p: Pt): Pt => [ox + p[0] * u, oy - p[1] * u];
type M = (p: Pt) => Pt;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixP = (a: Pt[], b: Pt[], t: number): Pt[] => a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]);
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const O0: Pt = [0, 0];

/** Fence A=(a,0) -> P -> B=(0,b), |AP| = p, |PB| = 12 - p; P on the side away from the corner. */
export const shape = (a: number, b: number, p: number) => {
  const d = Math.hypot(a, b);
  const q = 12 - p;
  const x = (p * p - q * q + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, p * p - x * x));
  const P: Pt = [a + x * (-a / d) + h * (b / d), x * (b / d) + h * (a / d)];
  return { A: [a, 0] as Pt, P, B: [0, b] as Pt };
};
export type Shp = { A: Pt; P: Pt; B: Pt };

export const LOP = shape(9, 6.49, 4); // lopsided example: P ~ (7.5, 3.708)
export const SQB = shape(6, 6, 6);
export const BEST = shape(R, R, 6); // P ~ (5.543, 5.543)

/** The 8 vertices of the mirrored closed shape, counter-clockwise from A. */
export const octOf = (s: Shp): Pt[] => [s.A, s.P, s.B, [-s.P[0], s.P[1]], [-s.A[0], 0], [-s.P[0], -s.P[1]], [0, -s.B[1]], [s.P[0], -s.P[1]]];
const regOct = (rho = 0): Pt[] => range(8).map((k): Pt => [R * Math.cos((rho + 45 * k) * D2R), R * Math.sin((rho + 45 * k) * D2R)]);

const pw = (f: number, k: [number, number][]) =>
  interpolate(f, k.map((e) => e[0]), k.map((e) => e[1]), { ...clamp, easing: Easing.inOut(Easing.cubic) });

// ---------- drawing helpers ----------

const HATCH = (
  <defs>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="14" height="14" fill="#dfe2ea" />
      <line x1="0" y1="0" x2="0" y2="14" stroke="#b3bac8" strokeWidth="5" />
    </pattern>
  </defs>
);

/** The two walls as grey hatched bands along the positive axes. */
export const Walls: React.FC<{ m: M; len: number; opacity?: number; glow?: number }> = ({ m, len, opacity = 1, glow = 0 }) => {
  if (opacity <= 0) return null;
  const o = m(O0);
  const L = m([len, 0])[0] - o[0];
  const w = 26;
  const st = glow > 0 ? C.amber : '#b3bac8';
  const sw = glow > 0 ? 3 + 5 * glow : 2;
  return (
    <g opacity={opacity}>
      {HATCH}
      <rect x={o[0] - w} y={o[1]} width={L + w} height={w} fill="url(#hatch)" stroke={st} strokeWidth={sw} />
      <rect x={o[0] - w} y={o[1] - L} width={w} height={L} fill="url(#hatch)" stroke={st} strokeWidth={sw} />
    </g>
  );
};

/** Walls as bands along two rays from o (used when the corner moves, in the "tallest" scene). */
const RayWalls: React.FC<{ o: Pt; a: Pt; b: Pt; opacity?: number }> = ({ o, a, b, opacity = 1 }) => {
  const ext = (t: Pt): Pt => {
    const d = Math.hypot(t[0] - o[0], t[1] - o[1]);
    return [t[0] + ((t[0] - o[0]) / d) * 60, t[1] + ((t[1] - o[1]) / d) * 60];
  };
  const ea = ext(a);
  const eb = ext(b);
  return (
    <g opacity={opacity} stroke="#c3c9d6" strokeWidth={16} strokeLinecap="round">
      <line x1={o[0]} y1={o[1]} x2={ea[0]} y2={ea[1]} />
      <line x1={o[0]} y1={o[1]} x2={eb[0]} y2={eb[1]} />
    </g>
  );
};

export const poly = (pts: Pt[]) => `M ${pts.map((p) => p.join(' ')).join(' L ')} Z`;

/** Region O-A-P-B with the fence A-P-B on top. sx / sy flip it in a wall (the mirror trick). */
export const Region: React.FC<{
  m: M; s: Shp; sx?: number; sy?: number; fill?: string; fillOp?: number; fence?: string; width?: number; draw?: number; opacity?: number;
}> = ({ m, s, sx = 1, sy = 1, fill = C.primary, fillOp = 0.2, fence = C.primary, width = 11, draw = 1, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const f = (p: Pt) => m([p[0] * sx, p[1] * sy]);
  const [o, a, p, b] = [O0, s.A, s.P, s.B].map(f);
  return (
    <g opacity={opacity}>
      <path d={poly([o, a, p, b])} fill={fill} opacity={fillOp} />
      {draw > 0 && (
        <path d={`M ${a.join(' ')} L ${p.join(' ')} L ${b.join(' ')}`} fill="none" stroke={fence} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      )}
    </g>
  );
};

/** The region and its three mirror images; sy flips in the bottom wall, sx in the side wall. */
const Quad: React.FC<{ m: M; s: Shp; sx: number; sy: number; fence?: string; width?: number; copyOp?: number }> = ({ m, s, sx, sy, fence = C.primary, width = 11, copyOp = 0.1 }) => (
  <>
    {sy < 1 && <Region m={m} s={s} sy={sy} fillOp={copyOp} fence={fence} width={width} />}
    {sx < 1 && <Region m={m} s={s} sx={sx} fillOp={copyOp} fence={fence} width={width} />}
    {sx < 1 && sy < 1 && <Region m={m} s={s} sx={sx} sy={sy} fillOp={copyOp} fence={fence} width={width} />}
    <Region m={m} s={s} fence={fence} width={width} />
  </>
);

const Lbl: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={9} strokeLinejoin="round">
      {text}
    </text>
  );

/** KaTeX centred on a pixel point. */
const TexAt: React.FC<{ p: Pt; tex: string; size?: number; color?: string; opacity?: number }> = ({ p, tex, size = 52, color = C.ink, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', opacity, textShadow: `0 0 8px ${C.bg}, 0 0 8px ${C.bg}, 0 0 8px ${C.bg}` }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );

/** A maths row, fading up at `start`. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Dot: React.FC<{ p: Pt; color?: string; r?: number; opacity?: number }> = ({ p, color = C.ink, r = 11, opacity = 1 }) => (opacity <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill={color} opacity={opacity} />);

const Seg: React.FC<{ a: Pt; b: Pt; color?: string; width?: number; dash?: string; opacity?: number }> = ({ a, b, color = C.muted, width = 5, dash, opacity = 1 }) =>
  opacity <= 0 ? null : <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" opacity={opacity} />;

/** Small tick(s) across the middle of a segment (equal-length marker). */
const Tick: React.FC<{ a: Pt; b: Pt; n?: number; color?: string; opacity?: number }> = ({ a, b, n = 1, color = C.ink, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const [ux, uy] = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
  const c = mid(a, b);
  return (
    <g opacity={opacity} stroke={color} strokeWidth={6} strokeLinecap="round">
      {range(n).map((i) => {
        const off = (i - (n - 1) / 2) * 14;
        const [cx, cy] = [c[0] + ux * off, c[1] + uy * off];
        return <line key={i} x1={cx - uy * 16} y1={cy + ux * 16} x2={cx + uy * 16} y2={cy - ux * 16} />;
      })}
    </g>
  );
};

/** Angle arc at c between maths directions a0 and a1 (degrees, a1 > a0). */
const Arc: React.FC<{ c: Pt; a0: number; a1: number; r: number; color?: string; opacity?: number; width?: number }> = ({ c, a0, a1, r, color = C.violet, opacity = 1, width = 6 }) => {
  if (opacity <= 0) return null;
  const p0 = [c[0] + r * Math.cos(a0 * D2R), c[1] - r * Math.sin(a0 * D2R)];
  const p1 = [c[0] + r * Math.cos(a1 * D2R), c[1] - r * Math.sin(a1 * D2R)];
  return <path d={`M ${p0.join(' ')} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${p1.join(' ')}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
};

/** Closed octagon: soft fill plus 8 edges, each with its own colour and width. */
const Oct: React.FC<{ pts: Pt[]; fill?: string; fillOp?: number; colors: string[]; widths?: number[]; opacity?: number }> = ({ pts, fill = C.primary, fillOp = 0.2, colors, widths, opacity = 1 }) => (
  <g opacity={opacity} strokeLinecap="round">
    <path d={poly(pts)} fill={fill} opacity={fillOp} />
    {pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={colors[i]} strokeWidth={widths ? widths[i] : 11} />;
    })}
  </g>
);

const Mirror: React.FC<{ x: number; y: number; opacity?: number; scale?: number }> = ({ x, y, opacity = 1, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d="M -90 40 L -30 40 L -30 -50 Z" fill={C.primary} fillOpacity={0.35} stroke={C.primary} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 90 40 L 30 40 L 30 -50 Z" fill={C.violet} fillOpacity={0.35} stroke={C.violet} strokeWidth={6} strokeLinejoin="round" />
    <line x1={0} y1={-80} x2={0} y2={70} stroke={C.muted} strokeWidth={5} strokeDasharray="10 8" />
  </g>
);

const FigLabels = (m: M, s: Shp, o: { O: number; A: number; B: number; P: number }) => {
  const [po, pa, pp, pb] = [O0, s.A, s.P, s.B].map(m);
  return (
    <>
      <Lbl p={[po[0] - 40, po[1] + 44]} text="O" opacity={o.O} />
      <Lbl p={[pa[0], pa[1] + 78]} text="A" opacity={o.A} />
      <Lbl p={[pb[0] - 56, pb[1]]} text="B" opacity={o.B} />
      <Lbl p={[pp[0] + 42, pp[1] - 36]} text="P" color={C.violet} opacity={o.P} />
    </>
  );
};

const CHOICE_TEX = ['36', '18+18\\sqrt{2}', '36\\sqrt{2}', '36+18\\sqrt{2}', '72+72\\sqrt{2}'];
const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; size?: number }> = ({ x, y, start, size = 46 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 20 }}>
      {CHOICE_TEX.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
          <span style={{ color: C.muted, fontSize: 34, marginRight: 12 }}>{'ABCDE'[i]}</span>
          <Tex tex={c} size={size} />
        </div>
      ))}
    </div>
  );
};

/** Standard figure of a fence (walls + region + fence). */
const Fig: React.FC<{ m: M; s: Shp; len?: number; draw?: number; fillOp?: number; walls?: number; glow?: number }> = ({ m, s, len = 10, draw = 1, fillOp = 0.2, walls = 1, glow = 0 }) => (
  <>
    <Walls m={m} len={len} opacity={walls} glow={glow} />
    <Region m={m} s={s} draw={draw} fillOp={fillOp} />
  </>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mk(250, 760, 78);
  const sq = ease(f, at(scene, 1, 0.04), 36);
  const s = shape(lerp(9, 6, sq), lerp(6.49, 6, sq), lerp(4, 6, sq));
  const stamp = at(scene, 1, 0.62);
  const card = at(scene, 2);
  return (
    <>
      <Text x={1000} y={170} w={880} size={70} weight={900} style={fadeUp(f, 0)}>
        A fence with one bend
      </Text>
      <Text x={1000} y={270} w={880} size={50} weight={700} color={C.muted} style={fadeUp(f, 10)}>
        tucked into a corner
      </Text>
      <Stage>
        <Fig m={m} s={s} len={9} draw={ease(f, 6, 40)} fillOp={0.2 * ease(f, 40, 30)} />
        <Mirror x={1640} y={640} opacity={ease(f, at(scene, 2, 0.6), 14)} scale={1.3} />
      </Stage>
      <div style={{ opacity: 1 - ease(f, card - 4, 10) }}>
        <Pill x={1000} y={400} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.15)), fontSize: 46 }}>
          Square bend: 6 × 6
        </Pill>
        <div style={{ position: 'absolute', left: 1000, top: 520, ...fadeUp(f, stamp, 8), transform: `rotate(-5deg) scale(${1 + 0.25 * (1 - ease(f, stamp, 8))})` }}>
          <div style={{ border: `8px solid ${C.red}`, color: C.red, borderRadius: 20, padding: '8px 30px', fontSize: 64, fontWeight: 900, display: 'inline-block' }}>NOT the best!</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 440, ...fadeUp(f, card + 4) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -4 }}>your math tutor</div>
      </div>
    </>
  );
};

const QFIG = mk(190, 700, 56);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Fig m={QFIG} s={LOP} len={10.5} draw={ease(f, 10, 30)} fillOp={0.2 * ease(f, 30, 20)} />
      </Stage>
      <div style={{ position: 'absolute', left: 860, top: 150, width: 1010, background: C.card, borderRadius: 32, padding: '34px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        Two straight walls meet at a right angle. A fence of <Mark on={at(scene, 1, 0.3)}>two straight pieces</Mark> runs from one wall to the other, bending once. The pieces have{' '}
        <Mark on={at(scene, 2, 0.15)}>total length 12</Mark>. What is the <Mark on={at(scene, 3, 0.15)}>largest possible area</Mark> of the region?
      </div>
      <ChoiceRow x={110} y={752} start={(i) => at(scene, 3, 0.45 + i * 0.1)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mk(210, 740, 66);
  const [t1, t2, t3] = [at(scene, 1), at(scene, 2), at(scene, 3)];
  const l = scene.lines[1].frames;
  const k = [0, t1, t1 + 0.3 * l, t1 + 0.65 * l, t1 + 0.95 * l, t2 + 30, t3, t3 + 30];
  const key = (v: number[]) => pw(f, range(8).map((i) => [k[i], v[i]] as [number, number]));
  const s = shape(key([9, 9, 6.5, 8, 8, 6, 6, 6 * S2]), key([6.49, 6.49, 8, 5.5, 5.5, 6, 6, 6 * S2]), key([4, 4, 7, 5, 5, 6, 6, 6]));
  const glow = ease(f, t1, 10) * (1 - ease(f, t1 + 0.6 * l, 12));
  const sqL = ease(f, t2 + 35, 10) * (1 - ease(f, t3, 8));
  const stL = ease(f, t3 + 35, 10);
  return (
    <>
      <Stage>
        <Fig m={m} s={s} len={9} glow={glow} />
        {FigLabels(m, s, { O: ease(f, at(scene, 0, 0.28), 8), A: ease(f, at(scene, 0, 0.52), 8), B: ease(f, at(scene, 0, 0.64), 8), P: ease(f, at(scene, 0, 0.88), 8) })}
        <Dot p={m(s.A)} color={C.violet} opacity={ease(f, t1, 8)} />
        <Dot p={m(s.B)} color={C.violet} opacity={ease(f, t1, 8)} />
      </Stage>
      <TexAt p={[m([3, 0])[0], m([3, 0])[1] - 52]} tex="6" opacity={sqL} color={C.violet} />
      <TexAt p={[m([0, 3])[0] + 52, m([0, 3])[1]]} tex="6" opacity={sqL} color={C.violet} />
      <TexAt p={[m([4.24, 0])[0], m([4.24, 0])[1] - 52]} tex="6\sqrt{2}" opacity={stL} color={C.violet} size={50} />
      <TexAt p={[m([0, 4.24])[0] + 92, m([0, 4.24])[1]]} tex="6\sqrt{2}" opacity={stL} color={C.violet} size={50} />
      <Text x={1010} y={200} w={860} size={54} weight={800} color={C.amber} style={{ ...fadeUp(f, t1 + 4), opacity: ease(f, t1 + 4, 10) * (1 - ease(f, t1 + 0.7 * l, 10)) }}>
        The walls are free: slide the ends!
      </Text>
      <Text x={1010} y={290} w={860} size={54} weight={800} color={C.violet} style={{ opacity: ease(f, t1 + 10, 10) * (1 - ease(f, t2, 10)) }}>
        AP + PB = 12, always
      </Text>
      <Eq x={1010} y={290} start={t2 + 30} tex="6 \times 6 = 36" size={72} color={C.violet} />
      <Eq x={1010} y={440} start={t3 + 30} tex="\dfrac{1}{2}\,(6\sqrt{2})^2 = 36" size={66} color={C.violet} />
      <Text x={1010} y={620} w={860} size={64} weight={900} color={C.green} style={fadeUp(f, at(scene, 3, 0.75))}>
        Can a bend do better?
      </Text>
    </>
  );
};

const makePause = (seconds: number, variant: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = variant ? mk(200, 700, 56) : QFIG;
  const sv = { A: [6, 0] as Pt, B: [0, 8] as Pt, P: [3, 4] as Pt };
  return (
    <>
      <Stage>{variant ? (
        <>
          <Walls m={m} len={9.5} />
          <Region m={m} s={sv} />
        </>
      ) : (
        <Fig m={m} s={LOP} len={10.5} />
      )}</Stage>
      {variant ? (
        <>
          <TexAt p={[m([3, 4])[0] + 72, m([3, 4])[1] - 30]} tex="10" color={C.violet} size={60} />
          <Text x={720} y={140} w={520} size={46} weight={800} style={fadeUp(f, 6)}>
            One straight fence, 10 long. Largest area?
          </Text>
        </>
      ) : (
        <>
          <Text x={760} y={140} w={480} size={46} weight={800} style={fadeUp(f, 6)}>
            Two pieces, total length 12. Largest area?
          </Text>
          <ChoiceRow x={110} y={752} start={() => 0} />
        </>
      )}
      <Countdown scene={scene} seconds={seconds} x={1500} y={470} tick={TICK} />
    </>
  );
};

const MC = mk(660, 480, 50);

const MirrorScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t1 = ease(f, at(scene, 1, 0.25), 44);
  const t2 = ease(f, at(scene, 2, 0.12), 44);
  const sy = 1 - 2 * t1;
  const sx = 1 - 2 * t2;
  const walls = 1 - ease(f, at(scene, 2, 0.55), 14);
  const dash = ease(f, at(scene, 1, 0.1), 10) * (1 - ease(f, at(scene, 3, 0.05), 10));
  const oct = octOf(LOP).map(MC);
  const c = MC(O0);
  const nums = range(8).map((i) => {
    const mp = mid(oct[i], oct[(i + 1) % 8]);
    const d = Math.hypot(mp[0] - c[0], mp[1] - c[1]);
    return [mp[0] + ((mp[0] - c[0]) / d) * 44, mp[1] + ((mp[1] - c[1]) / d) * 44] as Pt;
  });
  const cnt = at(scene, 3, 0.1);
  const cntSpan = 0.45 * scene.lines[3].frames;
  const mir = ease(f, at(scene, 0, 0.5), 12) * (1 - ease(f, at(scene, 2, 0.6), 10));
  return (
    <>
      <Stage>
        <Walls m={MC} len={8} opacity={walls} />
        <Seg a={MC([-10, 0])} b={MC([10, 0])} dash="14 12" opacity={dash} />
        <Seg a={MC([0, -7.5])} b={MC([0, 7.5])} dash="14 12" opacity={dash} />
        <Quad m={MC} s={LOP} sx={sx} sy={sy} />
        {range(8).map((i) => {
          const o = ease(f, cnt + (i / 8) * cntSpan, 8);
          return (
            o > 0 && (
              <g key={i} opacity={o}>
                <circle cx={nums[i][0]} cy={nums[i][1]} r={30} fill={C.primary} />
                <text x={nums[i][0]} y={nums[i][1] + 2} fontFamily={NUNITO} fontWeight={900} fontSize={42} fill="#fff" textAnchor="middle" dominantBaseline="central">
                  {i + 1}
                </text>
              </g>
            )
          );
        })}
        <Mirror x={1700} y={250} opacity={mir} />
      </Stage>
      <Pill x={1200} y={170} color={C.violet} style={{ opacity: mir, fontSize: 46 }}>
        Walls = mirrors
      </Pill>
      <Text x={1200} y={400} w={680} size={48} weight={800} style={{ opacity: ease(f, at(scene, 1, 0.5), 10) * (1 - ease(f, at(scene, 2, 0.1), 10)) }}>
        Now 4 fence pieces
      </Text>
      <Text x={1200} y={400} w={680} size={48} weight={800} style={{ opacity: ease(f, at(scene, 2, 0.6), 10) * (1 - ease(f, at(scene, 3, 0), 10)) }}>
        Now 8 fence pieces
      </Text>
      <Eq x={1190} y={400} start={at(scene, 3, 0.55)} tex="\text{perimeter} = 4\times 12 = 48" size={48} color={C.primary} />
      <Eq x={1190} y={510} start={at(scene, 4, 0.12)} tex="\text{area} = 4\times\text{region}" size={52} />
      <div style={{ position: 'absolute', left: 1190, top: 630, width: 640, background: C.violet, color: '#fff', borderRadius: 24, padding: '16px 28px', fontSize: 44, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 4, 0.55)) }}>
        Goal: biggest octagon with perimeter 48
      </div>
    </>
  );
};

const RC = mk(640, 455, 46);

const Regular: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const mt = ease(f, at(scene, 1, 0.12), 50);
  const pts = mixP(octOf(LOP), regOct(0), mt).map(RC);
  const grey = ease(f, at(scene, 2, 0.1), 20);
  const ec = range(8).map((i) => (i < 2 ? C.primary : grey > 0.5 ? '#9aa3b5' : C.primary));
  const ew = range(8).map((i) => (i < 2 ? 14 : lerp(11, 7, grey)));
  const c = RC(O0);
  const rays = ease(f, at(scene, 3, 0.05), 16);
  const q = pts.slice(0, 3);
  const wallsOn = ease(f, at(scene, 2, 0.2), 14);
  const marks = ease(f, at(scene, 1, 0.65), 12);
  const v = regOct(0).map(RC);
  // loop of string -> circle inset
  const lp = ease(f, at(scene, 0, 0.45), 60);
  const ip = range(60).map((i): Pt => {
    const th = (i / 60) * Math.PI * 2;
    const r = 1 + (1 - lp) * (0.28 * Math.cos(2 * th) + 0.16 * Math.sin(3 * th + 1));
    return [1600 + 95 * r * Math.cos(th), 420 + 95 * r * Math.sin(th)];
  });
  const insetOp = ease(f, 4, 10) * (1 - ease(f, at(scene, 2, 0.1), 12));
  return (
    <>
      <Stage>
        <Walls m={RC} len={9} opacity={wallsOn * 0.9} />
        <Oct pts={pts} fillOp={0.2} colors={ec} widths={ew} />
        <path d={poly([c, ...q])} fill={C.primary} opacity={0.22 * ease(f, at(scene, 3, 0.5), 14)} />
        {range(8).map((i) => (
          <Seg key={i} a={c} b={v[i]} dash="10 10" width={3} opacity={rays * 0.9} />
        ))}
        {range(8).map((i) => (
          <Arc key={i} c={c} a0={45 * i} a1={45 * i + 45} r={64 + (i % 2) * 8} color={C.violet} opacity={rays} />
        ))}
        {range(8).map((i) => (
          <Tick key={i} a={v[i]} b={v[(i + 1) % 8]} color={C.violet} opacity={marks * (1 - grey)} />
        ))}
        {range(8).map((i) => {
          // interior angle arc (135 degrees) at each vertex
          const P0 = v[(i + 7) % 8];
          const P1 = v[(i + 1) % 8];
          const a0 = Math.atan2(-(P0[1] - v[i][1]), P0[0] - v[i][0]) / D2R;
          const a1 = Math.atan2(-(P1[1] - v[i][1]), P1[0] - v[i][0]) / D2R;
          let lo = a1;
          let hi = a0;
          while (hi < lo) hi += 360;
          if (hi - lo > 180) [lo, hi] = [hi, lo + 360];
          return <Arc key={i} c={v[i]} a0={lo} a1={hi} r={34} color={C.blue} width={5} opacity={marks * (1 - grey) * mt} />;
        })}
        <path d={`M ${c[0] + 34} ${c[1]} L ${c[0] + 34} ${c[1] - 34} L ${c[0]} ${c[1] - 34}`} fill="none" stroke={C.ink} strokeWidth={5} opacity={ease(f, at(scene, 2, 0.45), 10)} />
        <path d={poly(ip)} fill="none" stroke={C.violet} strokeWidth={9} strokeLinejoin="round" opacity={insetOp} />
      </Stage>
      <TexAt p={[c[0] + 112, c[1] - 52]} tex="90^\circ" size={52} opacity={ease(f, at(scene, 2, 0.5), 10) * (1 - ease(f, at(scene, 3, 0.12), 10))} />
      <TexAt p={[c[0] + 150 * Math.cos(22.5 * D2R), c[1] - 150 * Math.sin(22.5 * D2R)]} tex="45^\circ" size={48} color={C.violet} opacity={ease(f, at(scene, 3, 0.2), 10)} />
      <TexAt p={[c[0] + 150 * Math.cos(67.5 * D2R), c[1] - 150 * Math.sin(67.5 * D2R)]} tex="45^\circ" size={48} color={C.violet} opacity={ease(f, at(scene, 3, 0.3), 10)} />
      <Text x={1600} y={550} w={560} size={44} weight={800} color={C.violet} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.45)), opacity: insetOp * ease(f, at(scene, 0, 0.45), 14) }}>
        Same string length: the circle holds the most
      </Text>
      <Pill x={1200} y={170} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.5)), fontSize: 44, opacity: ease(f, at(scene, 1, 0.5), 10) * (1 - grey) }}>
        Equal sides · equal angles
      </Pill>
      <Eq x={1200} y={290} start={at(scene, 3, 0.5)} tex="45^\circ + 45^\circ = 90^\circ" size={60} color={C.violet} />
      <Text x={1200} y={400} w={680} size={46} weight={800} color={C.primary} style={fadeUp(f, at(scene, 3, 0.65))}>
        Our two pieces = a quarter of the octagon
      </Text>
      <Eq x={1200} y={590} start={at(scene, 4, 0.15)} tex="48 \div 8 = 6" size={72} color={C.green} />
      <TexAt p={[(v[0][0] + v[1][0]) / 2 + 52, (v[0][1] + v[1][1]) / 2 - 10]} tex="6" size={58} color={C.green} opacity={ease(f, at(scene, 4, 0.5), 10)} />
      <TexAt p={[(v[1][0] + v[2][0]) / 2 + 10, (v[1][1] + v[2][1]) / 2 - 56]} tex="6" size={58} color={C.green} opacity={ease(f, at(scene, 4, 0.7), 10)} />
    </>
  );
};

const AC = mk(470, 510, 42);
const A_HALF = R * Math.cos(22.5 * D2R); // half of the bounding square, 3 + 3 sqrt 2 = 7.24
const A_SIN = R * Math.sin(22.5 * D2R); // 3

const Area1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rot = 22.5 * ease(f, at(scene, 0, 0.18), 50);
  const pts = regOct(rot).map(AC);
  const a = A_HALF;
  const sqp: Pt[] = [[-a, -a], [a, -a], [a, a], [-a, a]];
  const c = AC(O0);
  const corners: Pt[][] = [
    [[a, a], [a, A_SIN], [A_SIN, a]],
    [[-a, a], [-A_SIN, a], [-a, A_SIN]],
    [[-a, -a], [-a, -A_SIN], [-A_SIN, -a]],
    [[a, -a], [A_SIN, -a], [a, -A_SIN]],
  ];
  const sqIn = ease(f, at(scene, 0, 0.6), 16);
  const hi = ease(f, at(scene, 1, 0.05), 12);
  const shade = ease(f, at(scene, 5, 0.1), 16);
  const cut = ease(f, at(scene, 5, 0.62), 22);
  const oct1 = ease(f, at(scene, 6, 0.3), 14);
  const rev = at(scene, 7);
  const clearRows = 1 - ease(f, rev + 4, 14);
  const revOn = ease(f, rev + 4, 12);
  const cmp = at(scene, 8, 0.05);
  const cmpOn = ease(f, cmp, 12);
  const left = 1 - ease(f, cmp - 6, 10);
  const mS = mk(1090, 740, 30);
  const mB = mk(1560, 740, 30);
  const px = (x: number, y: number) => AC([x, y]);
  const yTop = px(0, a)[1] - 22;
  const xs = [-a, -A_SIN, A_SIN, a].map((x) => px(x, 0)[0]);
  const braceOp = ease(f, at(scene, 3, 0.12), 12) * left;
  return (
    <>
      <Stage>
        <g opacity={left}>
          <path d={poly(sqp.map((p) => px(p[0], p[1])))} fill="none" stroke={C.muted} strokeWidth={5} strokeDasharray="14 12" opacity={sqIn} />
          {corners.map((t, i) => {
            const dir: Pt = [i === 0 || i === 3 ? 1 : -1, i < 2 ? -1 : 1];
            return <path key={i} d={poly(t.map((p) => px(p[0], p[1])))} fill={C.red} opacity={shade * 0.32 * (1 - cut)} transform={`translate(${dir[0] * cut * 70} ${dir[1] * cut * 70})`} />;
          })}
          <path d={poly(corners[0].map((p) => px(p[0], p[1])))} fill={C.amber} opacity={0.4 * hi * (1 - shade)} stroke={C.amber} strokeWidth={5} />
          <Oct pts={pts} fillOp={0.2 + 0.1 * oct1} colors={range(8).map(() => C.primary)} opacity={1 - 0.7 * revOn} />
          <path d={poly([c, pts[0], pts[1], pts[2]])} fill={C.green} opacity={0.4 * revOn} />
          <Seg a={pts[0]} b={pts[1]} color={C.green} width={14} opacity={revOn} />
          <Seg a={pts[1]} b={pts[2]} color={C.green} width={14} opacity={revOn} />
          <g opacity={braceOp} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${xs[i] + 3} ${yTop + 14} L ${xs[i] + 3} ${yTop} L ${xs[i + 1] - 3} ${yTop} L ${xs[i + 1] - 3} ${yTop + 14}`} />
            ))}
          </g>
        </g>
        <g opacity={cmpOn}>
          <Seg a={mS([0, 0])} b={mS([9, 0])} color={C.muted} width={4} />
          <Seg a={mS([0, 0])} b={mS([0, 9])} color={C.muted} width={4} />
          <Region m={mS} s={SQB} fill={C.amber} fence={C.amber} />
          <Seg a={mB([0, 0])} b={mB([9, 0])} color={C.muted} width={4} />
          <Seg a={mB([0, 0])} b={mB([0, 9])} color={C.muted} width={4} />
          <Region m={mB} s={BEST} fill={C.green} fence={C.green} fillOp={0.3} />
        </g>
      </Stage>
      <TexAt p={[px(a, 0)[0] + 62, px(a, (a + A_SIN) / 2)[1]]} tex="3\sqrt{2}" size={48} color={C.amber} opacity={ease(f, at(scene, 2, 0.6), 10) * left} />
      <TexAt p={[px((a + A_SIN) / 2, 0)[0], px(0, a)[1] - 62]} tex="3\sqrt{2}" size={48} color={C.amber} opacity={ease(f, at(scene, 2, 0.6), 10) * (1 - braceOp) * left} />
      <TexAt p={[px(6.15, 6.15)[0], px(6.15, 6.15)[1]]} tex="6" size={52} color={C.violet} opacity={hi * (1 - ease(f, at(scene, 3), 10)) * left} />
      <TexAt p={[px(0, 0)[0], yTop - 40]} tex="6" size={48} color={C.violet} opacity={braceOp} />
      <TexAt p={[px(-(a + A_SIN) / 2, 0)[0], yTop - 40]} tex="3\sqrt{2}" size={48} color={C.amber} opacity={braceOp} />
      <TexAt p={[px((a + A_SIN) / 2, 0)[0], yTop - 40]} tex="3\sqrt{2}" size={48} color={C.amber} opacity={braceOp} />
      <Eq x={980} y={150} start={at(scene, 2, 0.1)} tex="\text{long side} = \text{leg}\times\sqrt{2}" size={46} color={C.amber} opacity={clearRows} />
      <Eq x={980} y={212} start={at(scene, 2, 0.55)} tex="\text{leg} = \dfrac{6}{\sqrt{2}} = 3\sqrt{2}" size={46} opacity={clearRows} />
      <Eq x={980} y={335} start={at(scene, 3, 0.25)} tex="\text{side} = 3\sqrt{2}+6+3\sqrt{2} = 6+6\sqrt{2}" size={48} color={C.violet} opacity={clearRows} />
      <Eq x={980} y={425} start={at(scene, 4, 0.1)} tex="(6+6\sqrt{2})^2 = 36+72\sqrt{2}+72" size={50} opacity={clearRows} />
      <Eq x={980} y={495} start={at(scene, 4, 0.6)} tex="= 108+72\sqrt{2}" size={56} opacity={clearRows} />
      <Eq x={980} y={585} start={at(scene, 5, 0.3)} tex="\text{corner} = \tfrac{1}{2}(3\sqrt{2})^2 = 9" size={50} color={C.red} opacity={clearRows} />
      <Eq x={980} y={655} start={at(scene, 5, 0.7)} tex="4 \times 9 = 36" size={56} color={C.red} opacity={clearRows} />
      <Eq x={980} y={740} start={at(scene, 6, 0.25)} tex="108+72\sqrt{2}-36 = 72+72\sqrt{2}" size={50} color={C.green} opacity={clearRows} />
      <Text x={980} y={180} w={800} size={46} weight={800} color={C.muted} style={{ opacity: revOn * left }}>
        One quarter of the octagon:
      </Text>
      <Eq x={980} y={260} start={rev + 8} tex="\dfrac{72+72\sqrt{2}}{4}" size={62} color={C.green} opacity={left} />
      <Eq x={1400} y={260} start={at(scene, 7, 0.5)} tex="= 18+18\sqrt{2}" size={62} color={C.green} opacity={left} />
      <div style={{ opacity: left }}>
        <Answer x={1500} y={560} value="B" start={at(scene, 7, 0.9)} chime={CHIME} />
      </div>
      <Text x={950} y={170} w={900} size={52} weight={900} style={{ opacity: cmpOn }}>
        Square bend vs the best bend
      </Text>
      <TexAt p={[mS([3, 0])[0], mS([0, 0])[1] + 52]} tex="36" size={62} color={C.amber} opacity={ease(f, cmp + 4, 10)} />
      <TexAt p={[mB([4, 0])[0], mB([0, 0])[1] + 52]} tex="\approx 43.5" size={62} color={C.green} opacity={ease(f, cmp + 14, 10)} />
    </>
  );
};

// ----- Solution 2: tallest in the middle -----
const TM = mk(240, 690, 68);

const Tallest: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const A = LOP.A;
  const B = LOP.B;
  const d = Math.hypot(A[0], B[1]);
  const M0 = mid(A, B);
  const r = d / 2;
  const u: Pt = [(B[0] - A[0]) / d, (B[1] - A[1]) / d];
  const n: Pt = [B[1] / d, A[0] / d]; // away from the corner
  const phi0 = Math.atan2(-M0[1], -M0[0]) / D2R + 360; // O's start angle on the circle
  const phiEnd = Math.atan2(-n[1], -n[0]) / D2R + 360; // O above the middle of the arc
  const [t2, t3] = [at(scene, 2), at(scene, 3)];
  const l2 = scene.lines[2].frames;
  const l3 = scene.lines[3].frames;
  const phi = pw(f, [[0, phi0], [t2 + 0.15 * l2, phi0], [t2 + 0.5 * l2, 192], [t2 + 0.9 * l2, phiEnd]]);
  const Opt: Pt = [M0[0] + r * Math.cos(phi * D2R), M0[1] + r * Math.sin(phi * D2R)];
  const bb = Math.sqrt(Math.max(0, 36 - r * r));
  const psi0 = Math.acos(((LOP.P[0] - M0[0]) * u[0] + (LOP.P[1] - M0[1]) * u[1]) / 6) / D2R;
  const psi = pw(f, [[0, psi0], [t3 + 0.15 * l3, psi0], [t3 + 0.5 * l3, 150], [t3 + 0.92 * l3, 90]]);
  const onEll = (ps: number): Pt => [M0[0] + 6 * Math.cos(ps * D2R) * u[0] + bb * Math.sin(ps * D2R) * n[0], M0[1] + 6 * Math.cos(ps * D2R) * u[1] + bb * Math.sin(ps * D2R) * n[1]];
  const Ppt = onEll(psi);
  const m = TM;
  const [pA, pB, pO, pP] = [A, B, Opt, Ppt].map(m);
  const foot = (q: Pt): Pt => {
    const t = (q[0] - A[0]) * u[0] + (q[1] - A[1]) * u[1];
    return m([A[0] + t * u[0], A[1] + t * u[1]]);
  };
  const fO = foot(Opt);
  const fP = foot(Ppt);
  const semi = range(61).map((i): Pt => {
    const ph = (144.2 + (i / 60) * 180) * D2R;
    return m([M0[0] + r * Math.cos(ph), M0[1] + r * Math.sin(ph)]);
  });
  const ell = range(61).map((i): Pt => m(onEll((i / 60) * 180)));
  const e1 = ease(f, at(scene, 1, 0.3), 14);
  const e2 = ease(f, t2, 12);
  const e3 = ease(f, t3, 12);
  const e4 = ease(f, at(scene, 4, 0.1), 12);
  const e5 = ease(f, at(scene, 5, 0.2), 12);
  const ab = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);
  const mark = (q: Pt, ft: Pt, color: string) => {
    const dd = Math.hypot(q[0] - ft[0], q[1] - ft[1]) || 1;
    const a1: Pt = [((q[0] - ft[0]) / dd) * 26, ((q[1] - ft[1]) / dd) * 26];
    const b1: Pt = [((pB[0] - pA[0]) / ab) * 26, ((pB[1] - pA[1]) / ab) * 26];
    return <path d={`M ${ft[0] + a1[0]} ${ft[1] + a1[1]} L ${ft[0] + a1[0] + b1[0]} ${ft[1] + a1[1] + b1[1]} L ${ft[0] + b1[0]} ${ft[1] + b1[1]}`} fill="none" stroke={color} strokeWidth={4} />;
  };
  return (
    <>
      <Stage>
        <RayWalls o={pO} a={pA} b={pB} opacity={0.9} />
        <path d={poly([pO, pA, pB])} fill={C.violet} opacity={0.16 * e1} />
        <path d={poly([pA, pP, pB])} fill={C.amber} opacity={0.22 * e1} />
        <path d={`M ${pA.join(' ')} L ${pP.join(' ')} L ${pB.join(' ')}`} fill="none" stroke={C.primary} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round" />
        <path d={poly([pO, pA, pP, pB])} fill={C.primary} opacity={0.1} />
        <Seg a={pA} b={pB} dash="14 12" color={C.ink} width={5} opacity={e1} />
        <path d={`M ${semi.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={C.violet} strokeWidth={5} strokeDasharray="12 10" opacity={e2} />
        <path d={`M ${ell.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={C.amber} strokeWidth={5} strokeDasharray="12 10" opacity={e3} />
        <Seg a={pO} b={fO} color={C.violet} width={6} opacity={Math.max(e4, ease(f, t2 + 0.5 * l2, 10))} />
        <Seg a={pP} b={fP} color={C.amber} width={6} opacity={Math.max(e4, ease(f, t3 + 0.5 * l3, 10))} />
        <g opacity={Math.max(e4, ease(f, t2 + 0.5 * l2, 10))}>{mark(pO, fO, C.violet)}</g>
        <g opacity={Math.max(e4, ease(f, t3 + 0.5 * l3, 10))}>{mark(pP, fP, C.amber)}</g>
        <Dot p={pO} color={C.violet} r={12} />
        <Dot p={pA} />
        <Dot p={pB} />
        <Dot p={pP} color={C.amber} r={12} />
        <Tick a={pO} b={pA} color={C.violet} opacity={e5} />
        <Tick a={pO} b={pB} color={C.violet} opacity={e5} />
        <Tick a={pA} b={pP} n={2} color={C.amber} opacity={e5} />
        <Tick a={pP} b={pB} n={2} color={C.amber} opacity={e5} />
        <Lbl p={[pA[0] + 50, pA[1] + 28]} text="A" />
        <Lbl p={[pB[0] - 50, pB[1] - 4]} text="B" />
        <Lbl p={[pP[0] + 44, pP[1] - 34]} text="P" color={C.amber} />
        <Lbl p={[pO[0] - 38, pO[1] + 42]} text="O" color={C.violet} />
      </Stage>
      <Pill x={1010} y={170} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.5)), fontSize: 46 }}>
        Tallest in the middle
      </Pill>
      <Text x={1010} y={270} w={860} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 1, 0.5))}>
        Corner triangle O A B
      </Text>
      <Text x={1010} y={335} w={860} size={44} weight={800} color={C.amber} style={fadeUp(f, at(scene, 1, 0.75))}>
        Outer triangle A P B
      </Text>
      <Text x={1010} y={420} w={860} size={44} weight={700} style={{ opacity: e2 * (1 - e3) }}>
        Right angle at O, so O rides a half circle
      </Text>
      <Eq x={1010} y={520} start={t3 + 8} tex="AP + PB = 12" size={64} color={C.amber} opacity={e3} />
      <Text x={1010} y={640} w={860} size={44} weight={800} style={fadeUp(f, at(scene, 4, 0.3))}>
        Both heights are biggest in the middle
      </Text>
      <Eq x={1010} y={730} start={at(scene, 5, 0.3)} tex="OA = OB \qquad AP = PB = 6" size={54} color={C.green} />
    </>
  );
};

// ----- arc scene -----
const ArcScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const zoom = ease(f, at(scene, 4), 40);
  const u = lerp(76, 44, zoom);
  const m: M = (p) => [lerp(250, 700, zoom) + p[0] * u, lerp(735, 490, zoom) - p[1] * u];
  const [po, pa, pp, pb] = [O0, BEST.A, BEST.P, BEST.B].map(m);
  const e0 = ease(f, at(scene, 0, 0.12), 12);
  const e3 = ease(f, at(scene, 3, 0.1), 14);
  const wallsOp = 1 - ease(f, at(scene, 4), 14);
  // inset: triangle OAP with AP as a horizontal base
  const im = mk(1470, 720, 56);
  const rr = 6 / S2;
  const phi = pw(f, [[at(scene, 1, 0.45), 8], [at(scene, 1, 0.75), 38], [at(scene, 2, 0.05), 38], [at(scene, 2, 0.5), 90]]);
  const iA = im([-3, 0]);
  const iP = im([3, 0]);
  const iO = im([rr * Math.cos(phi * D2R), 3 + rr * Math.sin(phi * D2R)]);
  const insetOp = ease(f, at(scene, 1, 0.12), 14) * (1 - ease(f, at(scene, 3), 12));
  const arcMajor = range(61).map((i): Pt => {
    const th = (-45 + (i / 60) * 270) * D2R;
    return im([rr * Math.cos(th), 3 + rr * Math.sin(th)]);
  });
  const oct = regOct(0).map(m);
  const ghost = range(8).map((i) => ease(f, at(scene, 4, 0.2 + 0.07 * i), 10));
  // 45 degree angle at the inset apex, centred on the downward direction
  const dA = Math.atan2(-(iA[1] - iO[1]), iA[0] - iO[0]) / D2R;
  const dP = Math.atan2(-(iP[1] - iO[1]), iP[0] - iO[0]) / D2R;
  const lo = Math.min(dA, dP);
  const hiA = Math.max(dA, dP);
  return (
    <>
      <Stage>
        <Walls m={m} len={9} opacity={wallsOp * 0.9} />
        <Region m={m} s={BEST} fillOp={0.15} />
        <path d={poly([po, pa, pp])} fill={C.blue} opacity={0.18 * e0} />
        <path d={poly([po, pp, pb])} fill={C.violet} opacity={0.18 * e0} />
        <Seg a={po} b={pp} dash="14 12" color={C.ink} width={5} opacity={e0} />
        <Arc c={po} a0={0} a1={45} r={110} color={C.blue} opacity={e0 * wallsOp} width={7} />
        <Arc c={po} a0={45} a1={90} r={110} color={C.violet} opacity={e0 * wallsOp} width={7} />
        <path d={`M ${pa.join(' ')} A ${R * u} ${R * u} 0 0 0 ${pb.join(' ')}`} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" opacity={e3} />
        <Tick a={po} b={pa} color={C.ink} opacity={e3} />
        <Tick a={po} b={pp} color={C.ink} opacity={e3} />
        <Tick a={po} b={pb} color={C.ink} opacity={e3} />
        {range(6).map((j) => {
          const i = j + 2;
          return <Seg key={i} a={oct[i]} b={oct[(i + 1) % 8]} color="#9aa3b5" width={8} dash="14 10" opacity={ghost[i]} />;
        })}
        {range(8).map((i) => (
          <Dot key={i} p={oct[i]} color="#9aa3b5" r={9} opacity={i > 2 ? ghost[i] : 0} />
        ))}
        <g opacity={insetOp}>
          <path d={`M ${arcMajor.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="10 9" opacity={0.7} />
          <path d={poly([iA, iP, iO])} fill={C.blue} opacity={0.2} />
          <Seg a={iA} b={iP} color={C.primary} width={11} />
          <Seg a={iA} b={iO} color={C.ink} width={5} />
          <Seg a={iP} b={iO} color={C.ink} width={5} />
          <Arc c={iO} a0={lo} a1={hiA} r={64} color={C.blue} width={6} />
          <Dot p={iO} color={C.blue} r={13} />
          <Dot p={iA} />
          <Dot p={iP} />
          <Tick a={iO} b={iA} color={C.ink} opacity={ease(f, at(scene, 2, 0.5), 10)} />
          <Tick a={iO} b={iP} color={C.ink} opacity={ease(f, at(scene, 2, 0.5), 10)} />
        </g>
        <Lbl p={[iA[0] - 46, iA[1] + 30]} text="A" opacity={insetOp} />
        <Lbl p={[iP[0] + 50, iP[1] + 30]} text="P" color={C.violet} opacity={insetOp} />
        <Lbl p={[iO[0], iO[1] - 52]} text="O" color={C.blue} opacity={insetOp} />
        <Dot p={po} />
        <Dot p={pa} />
        <Dot p={pb} />
        <Dot p={pp} color={C.violet} />
        <Lbl p={[pa[0] + 8, pa[1] + 64]} text="A" />
        <Lbl p={[pb[0] - 52, pb[1]]} text="B" />
        <Lbl p={[pp[0] + 40, pp[1] - 36]} text="P" color={C.violet} />
        <Lbl p={[po[0] - 36, po[1] + 40]} text="O" />
      </Stage>
      <TexAt p={[po[0] + 200, po[1] - 76]} tex="45^\circ" size={50} color={C.blue} opacity={e0 * wallsOp} />
      <TexAt p={[po[0] + 62, po[1] - 205]} tex="45^\circ" size={50} color={C.violet} opacity={e0 * wallsOp} />
      <TexAt p={[iO[0] + 90, iO[1] + 78]} tex="45^\circ" size={50} color={C.blue} opacity={insetOp} />
      <TexAt p={[(iA[0] + iP[0]) / 2, iA[1] + 76]} tex="AP = 6" size={52} color={C.primary} opacity={insetOp} />
      <Text x={1130} y={150} w={760} size={42} weight={800} color={C.blue} style={{ ...fadeUp(f, at(scene, 1, 0.2)), opacity: insetOp }} align="center">
        Points that see A P at 45° lie on one arc
      </Text>
      <Text x={1180} y={190} w={700} size={50} weight={900} color={C.green} style={fadeUp(f, at(scene, 4, 0.55))}>
        Same answer:
      </Text>
      <Eq x={1180} y={270} start={at(scene, 4, 0.6)} tex="18+18\sqrt{2}" size={72} color={C.green} />
      <div style={{ position: 'absolute', left: 1180, top: 470, width: 680, ...fadeUp(f, at(scene, 5, 0.15)) }}>
        <div style={{ background: C.card, borderRadius: 26, padding: '16px 28px', fontSize: 40, fontWeight: 800, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', marginBottom: 20 }}>
          <span style={{ color: C.primary }}>Solution 1: </span>mirror, then the regular octagon wins
        </div>
        <div style={{ background: C.card, borderRadius: 26, padding: '16px 28px', fontSize: 40, fontWeight: 800, boxShadow: '0 6px 20px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 5, 0.45)) }}>
          <span style={{ color: C.violet }}>Solution 2: </span>tallest in the middle shows <u>why</u>
        </div>
      </div>
    </>
  );
};

// ----- traps -----
const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const card = (x: number, w: number, start: number, h = 470): React.CSSProperties => ({ position: 'absolute', left: x, top: 165, width: w, height: h, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.08)', ...fadeUp(f, start) });
  const ms = mk(215, 450, 20);
  const ao = ease(f, at(scene, 1, 0.3), 14);
  const eo = ease(f, at(scene, 2, 0.3), 14);
  const bars = ease(f, at(scene, 3, 0.2), 20);
  const base = 470;
  const sc = 3.0;
  const vC = 36 * S2;
  const vD = 36 + 18 * S2;
  const ceil = 18 + 18 * S2;
  const ro = mk(970, 365, 17);
  const oc = regOct(0).map((p): Pt => [p[0] * 0.8, p[1] * 0.8]).map(ro);
  const badge = (x: number, y: number, o: number) => (
    <div style={{ position: 'absolute', left: x, top: y, width: 64, height: 64, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 42, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o }}>✗</div>
  );
  return (
    <>
      <Text x={110} y={125} w={900} size={46} weight={900} color={C.red} style={{ opacity: ease(f, 0, 10) * (1 - ease(f, at(scene, 1), 8)) }}>
        Each wrong answer is a trap
      </Text>
      <div style={card(90, 560, at(scene, 1))}>
        <Text x={36} y={22} w={480} size={54} weight={900} color={C.red}>A: 36</Text>
        <Text x={36} y={335} w={490} size={42} weight={700} style={fadeUp(f, at(scene, 1, 0.35))}>The 6 × 6 square fits, but it is not the biggest.</Text>
      </div>
      <div style={card(690, 560, at(scene, 2))}>
        <Text x={36} y={22} w={490} size={50} weight={900} color={C.red}>E: whole octagon</Text>
        <Text x={36} y={335} w={490} size={42} weight={700} style={fadeUp(f, at(scene, 2, 0.4))}>Our region is only a quarter: ÷ 4 forgotten!</Text>
      </div>
      <div style={card(1290, 590, at(scene, 3), 665)}>
        <Text x={36} y={22} w={470} size={54} weight={900} color={C.red}>C and D</Text>
      </div>
      <Stage>
        <g opacity={ao}>
          <Seg a={ms([0, 0])} b={ms([8, 0])} color={C.muted} width={4} />
          <Seg a={ms([0, 0])} b={ms([0, 8])} color={C.muted} width={4} />
          <Region m={ms} s={SQB} fill={C.amber} fence={C.amber} fillOp={0.3} />
        </g>
        <g opacity={eo}>
          <Oct pts={oc} fillOp={0.25} colors={range(8).map(() => C.primary)} widths={range(8).map(() => 8)} />
          <path d={poly([ro(O0), oc[0], oc[1], oc[2]])} fill={C.green} opacity={0.5} />
        </g>
        <g opacity={bars}>
          {[{ x: 1680, v: vC, l: 'C' }, { x: 1780, v: vD, l: 'D' }].map((b) => (
            <g key={b.l}>
              <rect x={b.x} y={base - b.v * sc * bars} width={80} height={b.v * sc * bars} fill={C.red} opacity={0.75} rx={10} />
              <text x={b.x + 40} y={base + 40} fontFamily={NUNITO} fontWeight={900} fontSize={48} textAnchor="middle" fill={C.ink}>{b.l}</text>
            </g>
          ))}
          <line x1={1320} y1={base - ceil * sc} x2={1860} y2={base - ceil * sc} stroke={C.green} strokeWidth={7} strokeDasharray="16 10" />
        </g>
      </Stage>
      <TexAt p={[1480, base - ceil * sc - 38]} tex="\text{best} \approx 43.5" size={48} color={C.green} opacity={bars} />
      <TexAt p={[1585, 590]} tex="C = 36\sqrt{2} \approx 50.9" size={48} color={C.red} opacity={ease(f, at(scene, 3, 0.2), 10)} />
      <TexAt p={[1585, 672]} tex="D = 36+18\sqrt{2} \approx 61.5" size={48} color={C.red} opacity={ease(f, at(scene, 3, 0.5), 10)} />
      <TexAt p={[1585, 752]} tex="\sqrt{2} \approx 1.41" size={48} color={C.muted} opacity={ease(f, at(scene, 3, 0.1), 10)} />
      {badge(1790, 180, ease(f, at(scene, 3, 0.7), 8))}
      {badge(560, 255, ao)}
      {badge(1160, 255, eo)}
      <div style={{ position: 'absolute', left: 90, top: 690, width: 1160, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '18px 30px', fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.25)) }}>
        Estimate each choice. Cross out the impossible!
      </div>
    </>
  );
};

// ----- variant -----
const SV = { A: [6, 0] as Pt, B: [0, 8] as Pt, P: [3, 4] as Pt }; // one straight piece of length 10 (6-8-10)

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = mk(210, 760, 70);
  return (
    <>
      <Stage>
        <Walls m={m} len={9} />
        <Region m={m} s={SV} draw={ease(f, 8, 30)} fillOp={0.2 * ease(f, 30, 20)} />
        <Mirror x={1560} y={640} opacity={ease(f, at(scene, 1, 0.5), 14)} scale={1.6} />
      </Stage>
      <TexAt p={[m([3, 4])[0] + 72, m([3, 4])[1] - 30]} tex="10" size={72} color={C.violet} opacity={ease(f, at(scene, 0, 0.55), 10)} />
      <Pill x={1000} y={180} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.2)), fontSize: 44 }}>Your turn!</Pill>
      <Text x={1000} y={290} w={880} size={56} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        ONE straight fence, 10 long
      </Text>
      <Text x={1000} y={400} w={880} size={52} weight={800} color={C.primary} style={fadeUp(f, at(scene, 1, 0.1))}>
        Largest area it can enclose?
      </Text>
      <Text x={1000} y={490} w={500} size={42} weight={700} color={C.muted} style={fadeUp(f, at(scene, 1, 0.5))}>
        Use the mirror trick!
      </Text>
    </>
  );
};

// ----- variant answer -----
const VC = mk(540, 480, 40);
const AV = (a: number, b: number): Shp => ({ A: [a, 0], B: [0, b], P: [a / 2, b / 2] });

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = ease(f, at(scene, 0, 0.1), 40);
  const t2 = ease(f, at(scene, 0, 0.5), 40);
  const sx = 1 - 2 * t2;
  const sy = 1 - 2 * t;
  const mo = ease(f, at(scene, 1, 0.1), 50);
  const a = lerp(6, 5 * S2, mo);
  const b = lerp(8, 5 * S2, mo);
  const s = AV(a, b);
  const q = ease(f, at(scene, 2, 0.1), 16);
  const l = ease(f, at(scene, 3, 0.1), 12);
  const o = VC(O0);
  const tk = ease(f, at(scene, 0, 0.75), 10) * (1 - ease(f, at(scene, 3, 0.05), 10));
  return (
    <>
      <Stage>
        <Walls m={VC} len={9} opacity={1 - ease(f, at(scene, 0, 0.7), 12)} />
        <g opacity={1 - 0.75 * q}>
          {sy < 1 && <Region m={VC} s={s} sy={sy} fillOp={0.1} />}
          {sx < 1 && <Region m={VC} s={s} sx={sx} fillOp={0.1} />}
          {sx < 1 && sy < 1 && <Region m={VC} s={s} sx={sx} sy={sy} fillOp={0.1} />}
        </g>
        <Region m={VC} s={s} fillOp={0.2 + 0.2 * q} fill={q > 0.5 ? C.green : C.primary} />
        <Tick a={VC(s.A)} b={VC(s.B)} color={C.ink} opacity={tk} />
        <Tick a={VC(s.A)} b={VC([0, -b])} color={C.ink} opacity={tk * t} />
        <Tick a={VC([-a, 0])} b={VC(s.B)} color={C.ink} opacity={tk * t2} />
        <Tick a={VC([-a, 0])} b={VC([0, -b])} color={C.ink} opacity={tk * t * t2} />
        <path d={`M ${o[0] + 28} ${o[1]} L ${o[0] + 28} ${o[1] - 28} L ${o[0]} ${o[1] - 28}`} fill="none" stroke={C.ink} strokeWidth={4} opacity={mo} />
        <Lbl p={[o[0] - 30, o[1] + 36]} text="O" size={48} />
      </Stage>
      <TexAt p={[VC([a / 2, b / 2])[0] + 66, VC([a / 2, b / 2])[1] - 30]} tex="10" size={56} color={C.violet} opacity={ease(f, at(scene, 0, 0.3), 10) * (1 - q)} />
      <TexAt p={[VC([-a / 2, b / 2])[0] - 66, VC([-a / 2, b / 2])[1] - 30]} tex="10" size={56} color={C.violet} opacity={tk * t2 * (1 - q)} />
      <TexAt p={[VC([a / 2, -b / 2])[0] + 66, VC([a / 2, -b / 2])[1] + 30]} tex="10" size={56} color={C.violet} opacity={tk * t * (1 - q)} />
      <TexAt p={[VC([-a / 2, -b / 2])[0] - 66, VC([-a / 2, -b / 2])[1] + 30]} tex="10" size={56} color={C.violet} opacity={tk * t * t2 * (1 - q)} />
      <TexAt p={[VC([a / 2, 0])[0], VC([a / 2, 0])[1] + 56]} tex="5\sqrt{2}" size={50} color={C.amber} opacity={l} />
      <TexAt p={[VC([0, b / 2])[0] - 92, VC([0, b / 2])[1]]} tex="5\sqrt{2}" size={50} color={C.amber} opacity={l} />
      <Eq x={1000} y={170} start={at(scene, 0, 0.7)} tex="\text{perimeter} = 4\times 10 = 40" size={54} color={C.primary} />
      <Eq x={1000} y={270} start={at(scene, 1, 0.45)} tex="10 \times 10 = 100" size={64} color={C.violet} />
      <Eq x={1000} y={385} start={at(scene, 2, 0.15)} tex="\dfrac{100}{4} \phantom{= 25}" size={72} color={C.green} />
      {/* "= 25" waits for the spoken "twenty-five" after the pause */}
      <Eq x={1000} y={385} start={at(scene, 2, 0.8)} tex="\phantom{\dfrac{100}{4}} = 25" size={72} color={C.green} />
      <Eq x={1000} y={625} start={at(scene, 3, 0.25)} tex="\tfrac{1}{2}\cdot 5\sqrt{2}\cdot 5\sqrt{2} = 25" size={52} />
      <Answer x={1730} y={400} value="25" start={at(scene, 2, 0.95)} chime={CHIME} />
      <Confetti x={1730} y={400} start={at(scene, 4, 0.2)} seed={7} />
    </>
  );
};

// ----- recap -----
const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const m = mk(1450, 470, 36);
  const fl1 = ease(f, at(scene, 1, 0.3), 40);
  const fl2 = ease(f, at(scene, 1, 0.6), 40);
  const showIcons = ease(f, at(scene, 2, 0.1), 12);
  const m2 = mk(1290, 470, 22);
  const m3 = mk(1665, 470, 22);
  const sq = [[7.07, 0], [0, 7.07], [-7.07, 0], [0, -7.07]] as Pt[];
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 150, width: 930, height: 640, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, at(scene, 1, 0.02), 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 50, top: 40, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, at(scene, 1, 0.05)) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 50, top: 120, width: 830, fontSize: 52, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Walls and a fence? Mirror it: you get a closed shape.
        </div>
        <div style={{ position: 'absolute', left: 50, top: 360, width: 830, fontSize: 50, fontWeight: 800, color: C.violet, lineHeight: 1.2, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Same perimeter, same number of sides: the regular shape wins.
        </div>
      </div>
      <Stage>
        <g opacity={cardOut * ease(f, at(scene, 1, 0.1), 12) * (1 - showIcons)}>
          <Walls m={m} len={8} opacity={1 - ease(f, at(scene, 1, 0.8), 12)} />
          <Quad m={m} s={LOP} sx={1 - 2 * fl2} sy={1 - 2 * fl1} />
        </g>
        <g opacity={cardOut * showIcons}>
          <Oct pts={regOct(0).map(m2)} fillOp={0.25} colors={range(8).map(() => C.primary)} widths={range(8).map(() => 9)} />
          <path d={poly(sq.map(m3))} fill={C.violet} opacity={0.2} />
          <path d={poly(sq.map(m3))} fill="none" stroke={C.violet} strokeWidth={9} strokeLinejoin="round" />
        </g>
      </Stage>
      <TexAt p={[1290, 700]} tex="8\text{ sides}" size={50} color={C.primary} opacity={cardOut * showIcons} />
      <TexAt p={[1665, 700]} tex="4\text{ sides}" size={50} color={C.violet} opacity={cardOut * showIcons} />
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, false),
  mirror: MirrorScene,
  regular: Regular,
  area1: Area1,
  tallest: Tallest,
  arc: ArcScene,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-01-fence-corner-thumb`, render.sh → poster.jpg): the trap + the walls with a lopsided fence, no answer.
export const Thumb: React.FC = () => {
  const m = mk(50, 600, 58);
  return (
    <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>36?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <Fig m={m} s={LOP} len={10.5} fillOp={0.2} />
      </svg>
    </ThumbFrame>
  );
};

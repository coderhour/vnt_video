import { Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-rolling-ring';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- rolling geometry (maths coordinates, y UP, angles counterclockwise) ----------
// The hoop's centre is (0, 0). The ring starts at the bottom of the hoop (centre direction PHI0 = -90°),
// with its spoke (the arrow) pointing straight down at the contact point, a red dot at the arrow's tip.
// The ring's centre goes counterclockwise. No slipping fixes the spin exactly (checked in verify.py):
//   inside:  spin = PHI0      - (R - r) / r * d    -> clockwise, 4 turns for R = 10, r = 2
//   outside: spin = PHI0 + pi + (R + r) / r * d    -> counterclockwise, 5 turns for R = 12, r = 3
//   slide:   spin = PHI0 + d                       (glued, no rolling: the arrow always points at the hoop)
// where d is how far the centre has gone around (0 … 2pi).

export const TAU = Math.PI * 2;
export const PHI0 = -Math.PI / 2;
const e = (a: number): Pt => [Math.cos(a), Math.sin(a)];

type Mode = 'inside' | 'outside' | 'slide';
type Pose = { c: Pt; spin: number };

export const pose = (R: number, r: number, mode: Mode, d: number): Pose => {
  const phi = PHI0 + d;
  const dist = mode === 'outside' ? R + r : R - r;
  const c: Pt = [dist * Math.cos(phi), dist * Math.sin(phi)];
  const spin = mode === 'inside' ? PHI0 - ((R - r) / r) * d : mode === 'outside' ? PHI0 + Math.PI + ((R + r) / r) * d : PHI0 + d;
  return { c, spin };
};

/** Full turns made so far (the arrow back to its starting direction). */
const turnsSoFar = (R: number, r: number, mode: Mode, d: number) => {
  const k = mode === 'inside' ? (R - r) / r : mode === 'outside' ? (R + r) / r : 1;
  return Math.floor((k * d) / TAU + 1e-6);
};

/** Maths coords → pixels: (ox, oy) is the hoop centre on screen, `unit` px per cm. */
export const plane = (ox: number, oy: number, unit: number) => (p: Pt): Pt => [ox + p[0] * unit, oy - p[1] * unit];

/** Lap progress d (0 … 2pi) between frames a and b. */
export const lap = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, TAU], { ...clamp, easing: Easing.inOut(Easing.quad) });

// ---------- drawing helpers ----------

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 48, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

const Hoop: React.FC<{ m: (p: Pt) => Pt; unit: number; R: number; opacity?: number; plate?: boolean }> = ({ m, unit, R, opacity = 1, plate }) => {
  const [x, y] = m([0, 0]);
  return <circle cx={x} cy={y} r={R * unit} fill={plate ? C.card : 'none'} stroke={C.ink} strokeWidth={10} opacity={opacity} />;
};

/** The ring with its arrow (centre → rim) and the red dot at the arrow's tip. */
const Ring: React.FC<{ m: (p: Pt) => Pt; unit: number; r: number; p: Pose; opacity?: number; ghost?: boolean; color?: string }> = ({ m, unit, r, p, opacity = 1, ghost, color = C.violet }) => {
  if (opacity <= 0) return null;
  const [cx, cy] = m(p.c);
  const [tx, ty] = m([p.c[0] + r * Math.cos(p.spin), p.c[1] + r * Math.sin(p.spin)]);
  const ang = Math.atan2(ty - cy, tx - cx);
  const L = r * unit;
  const hb = Math.min(26, L * 0.4); // arrow head length
  const hx = tx - Math.cos(ang) * 14;
  const hy = ty - Math.sin(ang) * 14;
  const head = (s: number) => [hx - hb * Math.cos(ang + s), hy - hb * Math.sin(ang + s)].join(' ');
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={L} fill={ghost ? 'none' : C.violetSoft} stroke={color} strokeWidth={ghost ? 4 : 8} />
      <line x1={cx} y1={cy} x2={hx - Math.cos(ang) * hb * 0.6} y2={hy - Math.sin(ang) * hb * 0.6} stroke={C.ink} strokeWidth={ghost ? 4 : 7} strokeLinecap="round" />
      <path d={`M ${head(0.45)} L ${hx} ${hy} L ${head(-0.45)} Z`} fill={C.ink} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={tx} cy={ty} r={ghost ? 8 : 12} fill={C.red} />
      {!ghost && <circle cx={cx} cy={cy} r={6} fill={C.ink} />}
    </g>
  );
};

/** Dashed circle of radius `rad` around the hoop centre, drawn from the bottom counterclockwise as `progress` goes 0 → 1. */
export const Path: React.FC<{ m: (p: Pt) => Pt; unit: number; rad: number; progress: number; color: string; opacity?: number }> = ({ m, rad, progress, color, opacity = 1 }) => {
  if (progress <= 0 || opacity <= 0) return null;
  const n = Math.max(2, Math.ceil(240 * progress));
  const pts = range(n + 1).map((k) => {
    const a = PHI0 + (TAU * progress * k) / n;
    return m([rad * Math.cos(a), rad * Math.sin(a)]).join(' ');
  });
  return <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" opacity={opacity} />;
};

/** Radius line from the hoop centre at angle `a`, with a label. */
export const Radius: React.FC<{ m: (p: Pt) => Pt; from?: Pt; a: number; len: number; text: string; color: string; opacity: number; off?: number; side?: number; tip?: number }> = ({
  m, from = [0, 0], a, len, text, color, opacity, off = 1.1, side = 1, tip,
}) => {
  if (opacity <= 0) return null;
  const p0 = m(from);
  const p1 = m([from[0] + len * Math.cos(a), from[1] + len * Math.sin(a)]);
  const mid =
    tip !== undefined
      ? m([from[0] + (len + tip) * Math.cos(a), from[1] + (len + tip) * Math.sin(a)])
      : m([from[0] + (len / 2) * Math.cos(a) - side * off * Math.sin(a), from[1] + (len / 2) * Math.sin(a) + side * off * Math.cos(a)]);
  return (
    <g opacity={opacity}>
      <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <circle cx={p0[0]} cy={p0[1]} r={7} fill={color} />
      <Label p={mid} text={text} color={color} />
    </g>
  );
};

/** A maths line on the right panel. */
const Eq: React.FC<{ x?: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x = 1000, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Big "turns: n" counter. */
const Counter: React.FC<{ x: number; y: number; n: number; label: string; color?: string; style?: React.CSSProperties }> = ({ x, y, n, label, color = C.violet, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'baseline', gap: 24, whiteSpace: 'nowrap', ...style }}>
    <div style={{ fontSize: 46, fontWeight: 800, color: C.muted }}>{label}</div>
    <div style={{ fontSize: 120, fontWeight: 900, color, width: 100 }}>{n}</div>
  </div>
);

/** Number badge (a small filled circle with a digit), in SVG. */
const Badge: React.FC<{ p: Pt; n: number; color: string; opacity?: number }> = ({ p, n, color, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={p[0]} cy={p[1]} r={28} fill={color} />
      <text x={p[0]} y={p[1] + 2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={36} textAnchor="middle" dominantBaseline="middle">
        {n}
      </text>
    </g>
  );

// The question's numbers.
export const R = 10;
export const r = 2;
// The variant's numbers (outside).
const VR = 12;
const Vr = 3;

// Main figure: hoop centre (520, 450), 30 px per cm → hoop radius 300 px (y 150 … 750).
const M = plane(520, 450, 30);
const U = 30;

/** The hoop, the ring at lap progress d, ghosts at each finished turn, and (optionally) the dot's touch marks and trail. */
export const Rolling: React.FC<{
  d: number;
  ghosts?: boolean;
  ghostOpacity?: number;
  touches?: boolean;
  trail?: boolean;
  path?: number;
  mode?: Mode;
  m?: (p: Pt) => Pt;
  unit?: number;
}> = ({ d, ghosts, ghostOpacity = 1, touches, trail, path = 0, mode = 'inside', m = M, unit = U }) => {
  const turnsPerLap = mode === 'inside' ? (R - r) / r : 1;
  const touchesPerLap = R / r; // the dot meets the hoop every rim length: 20pi / 4pi = 5
  const done = range(turnsPerLap).map((k) => (k + 1) * (TAU / turnsPerLap)).filter((x) => x <= d + 1e-9);
  const marks = range(touchesPerLap).map((k) => (k + 1) * (TAU / touchesPerLap)).filter((x) => x <= d + 1e-9);
  const tr = trail
    ? [...range(Math.floor((d / TAU) * 400) + 1).map((k) => (k / 400) * TAU), d]
        .map((x) => {
          const q = pose(R, r, mode, x);
          return m([q.c[0] + r * Math.cos(q.spin), q.c[1] + r * Math.sin(q.spin)]).join(' ');
        })
        .join(' L ')
    : '';
  return (
    <>
      <Hoop m={m} unit={unit} R={R} />
      <Path m={m} unit={unit} rad={R - r} progress={path} color={C.primary} />
      {trail && <path d={`M ${tr}`} fill="none" stroke={C.red} strokeWidth={4} opacity={0.45} />}
      {ghosts &&
        ghostOpacity > 0 &&
        done.map((x, k) => {
          const q = pose(R, r, mode, x);
                    return (
            <g key={k} opacity={ghostOpacity}>
              <Ring m={m} unit={unit} r={r} p={q} ghost opacity={0.3} />
              <Badge p={m([q.c[0] * 0.55, q.c[1] * 0.55])} n={k + 1} color={C.violet} />
            </g>
          );
        })}
      {touches &&
        marks.map((x, k) => {
          const a = PHI0 + x;
          const p0 = m([R * Math.cos(a), R * Math.sin(a)]);
          const p1 = m([(R + 0.8) * Math.cos(a), (R + 0.8) * Math.sin(a)]);
          const lb = m([(R + 1.8) * Math.cos(a), (R + 1.8) * Math.sin(a)]);
          return (
            <g key={k}>
              <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
              <Badge p={lb} n={k + 1} color={C.red} />
            </g>
          );
        })}
      <Ring m={m} unit={unit} r={r} p={pose(R, r, mode, d)} />
    </>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const d = lap(f, at(scene, 0, 0.15), at(scene, 1, 0.3));
  const nope = at(scene, 1, 0.62);
  return (
    <>
      <Stage>
        <g opacity={ease(f, 0, 14)}>
          <Rolling d={d} />
        </g>
      </Stage>
      <Text x={1000} y={170} w={860} size={84} weight={900} style={fadeUp(f, 0)}>
        How many turns?
      </Text>
      <Text x={1000} y={330} w={500} size={110} weight={900} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.35)), textDecoration: f > nope ? 'line-through' : 'none' }}>
        5?
      </Text>
      <Text x={1200} y={350} w={600} size={72} weight={900} color={C.red} style={fadeUp(f, nope)}>
        NOT 5!
      </Text>
      <div style={{ position: 'absolute', left: 1000, top: 560, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 72, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const QFIG = plane(1440, 440, 26);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const show = ease(f, 6, 16);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1000, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 46, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        A small ring with a <Mark on={at(scene, 1, 0.3)}>radius of 2 cm</Mark> rolls without slipping around the{' '}
        <Mark on={at(scene, 1, 0.75)}>inside</Mark> of a large hoop with a <Mark on={at(scene, 2, 0.3)}>radius of 10 cm</Mark>, always touching it, until it is{' '}
        <Mark on={at(scene, 3, 0.6)}>back where it started</Mark>. How many <Mark on={at(scene, 4, 0.3)}>full turns</Mark> does the small ring make?
      </div>
      <Choices x={100} y={690} items={['3', '4', '5', '6', '8'].map((c) => <Tex key={c} tex={c} size={54} />)} start={(i) => at(scene, 5, 0.1 + i * 0.12)} />
      <Stage>
        <g opacity={show}>
          <Hoop m={QFIG} unit={26} R={R} />
          <Ring m={QFIG} unit={26} r={r} p={pose(R, r, 'inside', 0)} />
        </g>
        <Radius m={QFIG} a={Math.PI / 4} len={R} text="10 cm" color={C.ink} opacity={ease(f, at(scene, 2, 0.3), 12)} off={2.4} />
        <Radius m={QFIG} from={pose(R, r, 'inside', 0).c} a={Math.PI / 2} len={r} text="2 cm" color={C.violet} opacity={ease(f, at(scene, 1, 0.35), 12)} tip={1.4} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // A demo ring on the right spins once in place to show "one full turn".
  const spinA = at(scene, 4, 0.1);
  const spin = PHI0 - interpolate(f, [spinA, spinA + 60], [0, TAU], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const D = plane(1640, 560, 40);
  const arrow = ease(f, at(scene, 3, 0.5), 12);
  return (
    <>
      <Stage>
        <Hoop m={M} unit={U} R={R} />
        <Ring m={M} unit={U} r={r} p={pose(R, r, 'inside', 0)} />
        <Radius m={M} a={Math.PI / 4} len={R} text="10" color={C.ink} opacity={ease(f, at(scene, 1, 0.5), 12)} off={1.6} />
        <Radius m={M} from={pose(R, r, 'inside', 0).c} a={Math.PI / 2} len={r} text="2" color={C.violet} opacity={ease(f, at(scene, 1, 0.2), 12)} tip={1.2} />
        <g opacity={arrow}>
          <Ring m={D} unit={40} r={2} p={{ c: [0, 0], spin: PHI0 }} ghost opacity={0.25 * ease(f, spinA, 8)} />
          <Ring m={D} unit={40} r={2} p={{ c: [0, 0], spin }} />
        </g>
      </Stage>
      <Check x={1000} y={190} start={at(scene, 1, 0.1)}>Ring: radius 2 cm</Check>
      <Check x={1000} y={280} start={at(scene, 1, 0.55)}>Hoop: radius 10 cm</Check>
      <Check x={1000} y={370} start={at(scene, 2, 0.2)}>No slipping: it never skids</Check>
      <Text x={1000} y={490} w={450} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 4, 0.2))}>
        Full turn = the arrow points the same way again
      </Text>
      <Pill x={1000} y={740} color={C.primary} style={fadeUp(f, at(scene, 5, 0.2))}>Count the turns in one trip around</Pill>
    </>
  );
};

const makePause = (seconds: number, prompt: string, variant: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = variant ? plane(520, 480, 18) : M;
  return (
    <>
      <Stage>
        {variant ? (
          <>
            <Hoop m={m} unit={18} R={VR} plate />
            <Ring m={m} unit={18} r={Vr} p={pose(VR, Vr, 'outside', 0)} />
            <Label p={m([0, 0])} text="12" />
            <Label p={[m([0, 0])[0] + 110, m(pose(VR, Vr, 'outside', 0).c)[1]]} text="3" color={C.violet} />
          </>
        ) : (
          <>
            <Hoop m={m} unit={U} R={R} />
            <Ring m={m} unit={U} r={r} p={pose(R, r, 'inside', 0)} />
            <Label p={m([0, 0])} text="10" />
            <Label p={[m([0, 0])[0] + 120, m(pose(R, r, 'inside', 0).c)[1]]} text="2" color={C.violet} />
          </>
        )}
      </Stage>
      <Text x={1450} y={130} w={880} size={46} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1450} y={540} tick={TICK} />
    </>
  );
};

const FL = { x0: 260, y: 640, unit: 50 }; // floor: ring centre starts at x0, floor line at y

const Floor: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [at(scene, 1, 0.15), at(scene, 1, 0.85)], [0, TAU], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const rr = r * FL.unit; // 100 px
  const cx = FL.x0 + rr * a; // centre moves r × (angle turned)
  const cy = FL.y - rr;
  const spin = PHI0 - a; // rolling right = clockwise
  const tip: Pt = [cx + rr * Math.cos(spin), cy - rr * Math.sin(spin)];
  const end = FL.x0 + rr * TAU;
  const brace = ease(f, at(scene, 2, 0.3), 12);
  return (
    <>
      <Stage>
        <line x1={120} y1={FL.y} x2={1180} y2={FL.y} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        {/* the rim laid flat: the part of the floor the ring has rolled over */}
        <line x1={FL.x0} y1={FL.y} x2={cx} y2={FL.y} stroke={C.red} strokeWidth={10} opacity={a > 0 ? 1 : 0} />
        <g opacity={ease(f, at(scene, 1, 0.1), 10) * 0.3}>
          <circle cx={FL.x0} cy={cy} r={rr} fill="none" stroke={C.violet} strokeWidth={4} />
          <line x1={FL.x0} y1={cy} x2={FL.x0} y2={FL.y - 8} stroke={C.ink} strokeWidth={4} />
        </g>
        <circle cx={cx} cy={cy} r={rr} fill={C.violetSoft} stroke={C.violet} strokeWidth={8} />
        <line x1={cx} y1={cy} x2={cx + (tip[0] - cx) * 0.72} y2={cy + (tip[1] - cy) * 0.72} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <path
          d={(() => {
            const ang = Math.atan2(tip[1] - cy, tip[0] - cx);
            const hx = tip[0] - Math.cos(ang) * 14;
            const hy = tip[1] - Math.sin(ang) * 14;
            const h = (s: number) => [hx - 26 * Math.cos(ang + s), hy - 26 * Math.sin(ang + s)].join(' ');
            return `M ${h(0.45)} L ${hx} ${hy} L ${h(-0.45)} Z`;
          })()}
          fill={C.ink}
          stroke={C.ink}
          strokeWidth={3}
        />
        <circle cx={tip[0]} cy={tip[1]} r={12} fill={C.red} />
        <circle cx={cx} cy={cy} r={6} fill={C.ink} />
        {/* centre moved: brace above */}
        <g opacity={brace}>
          <path d={`M ${FL.x0} ${cy - rr - 30} L ${FL.x0} ${cy - rr - 50} L ${end} ${cy - rr - 50} L ${end} ${cy - rr - 30}`} stroke={C.primary} strokeWidth={6} fill="none" strokeLinejoin="round" />
          <Label p={[(FL.x0 + end) / 2, cy - rr - 95]} text="the center moves" color={C.primary} size={44} />
          <Label p={[(FL.x0 + end) / 2, FL.y + 55]} text="1 rim length" color={C.red} size={48} />
        </g>
      </Stage>
      <Eq x={1260} y={220} start={at(scene, 3, 0.2)} tex="\text{rim} = 2 \times \pi \times 2" />
      <Eq x={1260} y={320} start={at(scene, 3, 0.6)} color={C.red} tex="= 4\pi" />
      <div style={{ position: 'absolute', left: 1260, top: 450, width: 600, background: C.card, borderRadius: 24, padding: '22px 30px', fontSize: 42, fontWeight: 800, lineHeight: 1.3, boxShadow: '0 6px 24px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 4, 0.3)) }}>
        <span style={{ color: C.violet }}>1 full turn</span> moves the center <span style={{ color: C.red }}>1 rim length</span>
      </div>
      <Text x={1260} y={660} w={600} size={40} weight={800} color={C.primary} style={fadeUp(f, at(scene, 5, 0.3))}>
        Curved track too, if nothing slips!
      </Text>
    </>
  );
};

const PathScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const start = pose(R, r, 'inside', 0);
  const centreHi = ease(f, at(scene, 0, 0.5), 12);
  const gap = ease(f, at(scene, 1, 0.4), 12) * fadeTo(f, at(scene, 2, 0.6), 0);
  const [cx, cy] = M(start.c);
  const path = ease(f, at(scene, 2, 0.2), 40);
  const done = at(scene, 5, 0.98);
  return (
    <>
      <Stage>
        <Rolling d={0} path={path} />
        <circle cx={cx} cy={cy} r={16} fill={C.primary} opacity={centreHi} />
        <g opacity={gap}>
          <line x1={cx - 14} y1={cy} x2={cx - 14} y2={cy + r * U} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
          <Label p={[cx, cy + r * U + 40]} text="2" color={C.amber} />
        </g>
        <Radius m={M} a={Math.PI * 0.75} len={R - r} text="8" color={C.primary} opacity={ease(f, at(scene, 2, 0.7), 12)} off={1.1} />
      </Stage>
      <Eq y={190} size={52} start={at(scene, 2, 0.5)} color={C.primary} tex="\text{path radius} = 10 - 2 = 8" />
      <Eq y={300} size={52} start={at(scene, 3, 0.3)} color={C.primary} tex="\text{path length} = 2 \times \pi \times 8 = 16\pi" />
      <Eq y={410} size={52} start={at(scene, 4, 0.2)} color={C.red} tex="\text{one turn} = 4\pi" />
      <Eq y={520} start={at(scene, 5, 0.2)} size={66} color={C.green} tex="16\pi \div 4\pi = 4" />
      <Answer x={1660} y={600} value="B" chime={CHIME} start={done} />
      <Confetti x={1660} y={600} start={done} seed={5} />
    </>
  );
};

const Watch: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const d = lap(f, at(scene, 1, 0.1), at(scene, 3, 0.9));
  const n = turnsSoFar(R, r, 'inside', d);
  return (
    <>
      <Stage>
        <Rolling d={d} ghosts path={1} />
      </Stage>
      <Counter x={1040} y={170} n={n} label="full turns:" style={fadeUp(f, at(scene, 1))} />
      <div style={{ position: 'absolute', left: 1040, top: 400, fontSize: 44, fontWeight: 800, lineHeight: 1.6, ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div>
          <span style={{ color: C.primary }}>center:</span> counterclockwise ↺
        </div>
        <div>
          <span style={{ color: C.violet }}>ring:</span> clockwise ↻
        </div>
      </div>
      <Check x={1040} y={650} start={at(scene, 4, 0.1)}>
        4 full turns, as we worked out!
      </Check>
    </>
  );
};

const Five: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // The lap starts with line 2 ("Each time the dot touches…") and takes about 10 s; the scene's hold covers it.
  const d = lap(f, at(scene, 2, 0.05), Math.min(at(scene, 2, 0.05) + 300, scene.frames - 8));
  return (
    <Stage>
      <Rolling d={d} ghosts ghostOpacity={0} touches trail />
    </Stage>
  );
};

const Five2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Rolling d={TAU} ghosts ghostOpacity={ease(f, at(scene, 2, 0.15), 18)} touches trail />
      </Stage>
      <Eq y={190} size={52} start={at(scene, 0, 0.35)} tex="\text{hoop rim} = 2 \times \pi \times 10 = 20\pi" />
      <Eq y={300} start={at(scene, 0, 0.65)} color={C.red} tex="\text{ring rim} = 4\pi" />
      <Eq y={410} start={at(scene, 1, 0.1)} tex="20\pi \div 4\pi = 5" />
      <div style={{ position: 'absolute', left: 1000, top: 540, fontSize: 46, fontWeight: 800, lineHeight: 1.6 }}>
        <div style={fadeUp(f, at(scene, 1, 0.5))}>
          <span style={{ color: C.red }}>dot touches:</span> 5 times
        </div>
        <div style={fadeUp(f, at(scene, 2, 0.15))}>
          <span style={{ color: C.violet }}>arrow turns:</span> 4 times
        </div>
      </div>
    </>
  );
};

const Slide: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const d = lap(f, at(scene, 1, 0.1), at(scene, 2, 0.6));
  // Part 2 (line 4 on): roll the ring again, with the glued ring drawn on top at the same spot.
  const b = at(scene, 4);
  const d2 = lap(f, at(scene, 4, 0.4), at(scene, 5, 0.95));
  const part2 = ease(f, b, 12);
  const back = Math.floor((5 * d2) / TAU + 1e-6); // the rolling dot back at the hoop
  return (
    <>
      <Stage>
        <g opacity={1 - part2}>
          <Hoop m={M} unit={U} R={R} />
          <Ring m={M} unit={U} r={r} p={pose(R, r, 'slide', 0)} ghost opacity={0.3 * ease(f, at(scene, 1, 0.1), 10)} />
          <Ring m={M} unit={U} r={r} p={pose(R, r, 'slide', d)} color={C.amber} />
        </g>
        {part2 > 0 && (
          <g opacity={part2}>
            <Rolling d={d2} touches />
            <Ring m={M} unit={U} r={r} p={pose(R, r, 'slide', d2)} ghost color={C.amber} opacity={0.85} />
          </g>
        )}
      </Stage>
      <Pill x={1000} y={180} color={C.amber} style={{ ...fadeUp(f, at(scene, 0, 0.5)), opacity: 1 - part2 }}>Glued: slide, no rolling</Pill>
      <Pill x={1000} y={180} color={C.violet} style={{ ...fadeUp(f, b), opacity: part2 }}>Rolling, with the glued ring on top</Pill>
      <Counter x={1000} y={290} n={turnsSoFar(R, r, 'slide', d)} label="arrow turns:" color={C.amber} style={{ ...fadeUp(f, at(scene, 1, 0.2)), opacity: Math.min(ease(f, at(scene, 1, 0.2)), 1 - part2) }} />
      <Counter x={1000} y={290} n={back} label="dot back at the hoop:" color={C.red} style={{ opacity: part2 }} />
      <div style={{ position: 'absolute', left: 1000, top: 480, fontSize: 46, fontWeight: 800, lineHeight: 1.6 }}>
        <div style={fadeUp(f, at(scene, 3, 0.3))}>
          <span style={{ color: C.amber }}>loop:</span> 1 turn counterclockwise ↺
        </div>
        <div style={fadeUp(f, at(scene, 6, 0.1))}>
          <span style={{ color: C.red }}>rolling:</span> 5 turns clockwise ↻
        </div>
      </div>
      <Eq y={660} start={at(scene, 7, 0.65)} size={66} color={C.green} tex="5 - 1 = 4" />
      <Pill x={1400} y={672} color={C.primary} style={{ ...fadeUp(f, at(scene, 8, 0.4)), fontSize: 36 }}>Fast check!</Pill>
    </>
  );
};

// ---------- traps ----------

const mini = plane(150, 150, 11); // inside a 300×300 card picture

const TrapPic: React.FC<{ i: number }> = ({ i }) => {
  const st = pose(R, r, 'inside', 0);
  if (i === 0)
    return (
      <>
        <Hoop m={mini} unit={11} R={R} />
        <Path m={mini} unit={11} rad={8} progress={1} color={C.muted} />
        <Path m={mini} unit={11} rad={6} progress={1} color={C.red} />
        <Ring m={mini} unit={11} r={r} p={st} />
      </>
    );
  if (i === 1)
    return (
      <>
        <Hoop m={mini} unit={11} R={R} />
        <Path m={mini} unit={11} rad={8} progress={1} color={C.green} />
        <Ring m={mini} unit={11} r={r} p={st} />
      </>
    );
  if (i === 2)
    return (
      <>
        <Hoop m={mini} unit={11} R={R} />
        {range(5).map((k) => {
          const a = PHI0 + (k * TAU) / 5;
          const p0 = mini([R * Math.cos(a), R * Math.sin(a)]);
          const p1 = mini([(R + 1.4) * Math.cos(a), (R + 1.4) * Math.sin(a)]);
          return <line key={k} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={C.red} strokeWidth={8} strokeLinecap="round" />;
        })}
        <Ring m={mini} unit={11} r={r} p={st} />
      </>
    );
  if (i === 3) {
    const o = plane(150, 135, 10);
    return (
      <>
        <Hoop m={o} unit={10} R={R} />
        <Ring m={o} unit={10} r={r} p={pose(R, r, 'outside', 0)} color={C.red} />
      </>
    );
  }
  return null;
};

const TRAPS = [
  { n: '3', note: 'Took off the width: radius 6' },
  { n: '4', note: 'Center path radius 8' },
  { n: '5', note: 'Hoop rim: forgot the turn back' },
  { n: '6', note: 'That is rolling on the OUTSIDE' },
  { n: '8', note: 'Used 2π: rim for radius 1' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // narration order: 5 (C), 8 (E), 6 (D), 3 (A), then 4 (B)
  const wrongAt = [at(scene, 4, 0.1), Infinity, at(scene, 1, 0.1), at(scene, 3, 0.1), at(scene, 2, 0.1)];
  return (
    <div style={{ position: 'absolute', left: 100, top: 140, display: 'flex', gap: 30 }}>
      {TRAPS.map((t, i) => {
        const wrong = f >= wrongAt[i];
        const right = i === 1 && f >= at(scene, 5);
        const border = wrong ? C.red : right ? C.green : 'transparent';
        const showNote = wrong || right;
        return (
          <div key={i} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
            <div style={{ height: 460, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: C.muted, marginTop: 14 }}>{'ABCDE'[i]}</div>
              <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.1, color: wrong ? C.red : right ? C.green : C.ink }}>{t.n}</div>
              <svg width={270} height={270} viewBox="0 0 300 300" style={{ overflow: 'visible', marginTop: 6, opacity: showNote ? 1 : 0.35 }}>
                <TrapPic i={i} />
                {i === 4 && (
                  <foreignObject x={0} y={95} width={300} height={110}>
                    <div style={{ textAlign: 'center' }}>
                      <Tex tex="16\pi \div 2\pi" size={56} color={C.red} />
                    </div>
                  </foreignObject>
                )}
              </svg>
              {(wrong || right) && (
                <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {wrong ? '✗' : '✓'}
                </div>
              )}
            </div>
            <div style={{ marginTop: 18, fontSize: 40, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, ...fadeUp(f, i === 1 ? at(scene, 5, 0.1) : wrongAt[i] + 8) }}>{t.note}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- variant ----------

const VM = plane(1400, 470, 18); // plate radius 216 px, coin path radius 270 px

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const st = pose(VR, Vr, 'outside', 0);
  return (
    <>
      <Pill x={120} y={190} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Text x={120} y={310} w={880} size={52} weight={800} style={fadeUp(f, at(scene, 1, 0.1))}>
        A coin with radius <span style={{ color: C.violet }}>3</span> rolls around the <span style={{ color: C.red }}>OUTSIDE</span> of a plate
      </Text>
      <Text x={120} y={470} w={880} size={52} weight={800} style={fadeUp(f, at(scene, 2, 0.1))}>
        The plate has radius <span style={{ color: C.ink }}>12</span>.
      </Text>
      <Text x={120} y={570} w={880} size={52} weight={800} color={C.primary} style={fadeUp(f, at(scene, 3, 0.1))}>
        How many full turns does the coin make?
      </Text>
      <Pill x={120} y={720} color={C.amber} style={fadeUp(f, at(scene, 4, 0.1))}>Hint: follow the center!</Pill>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.3), 14)}>
          <Hoop m={VM} unit={18} R={VR} plate />
          <Ring m={VM} unit={18} r={Vr} p={st} />
        </g>
        <Radius m={VM} a={Math.PI / 4} len={VR} text="12" color={C.ink} opacity={ease(f, at(scene, 2, 0.3), 12)} off={1.8} />
        <Radius m={VM} from={st.c} a={0} len={Vr} text="3" color={C.violet} opacity={ease(f, at(scene, 1, 0.5), 12)} tip={1.2} />
      </Stage>
    </>
  );
};

const VM2 = plane(470, 480, 18);

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const d = lap(f, at(scene, 4, 0.1), at(scene, 5, 0.95));
  const p = pose(VR, Vr, 'outside', d);
  const n = turnsSoFar(VR, Vr, 'outside', d);
  const done = at(scene, 3, 0.98);
  const ghosts = range(5).map((k) => ((k + 1) * TAU) / 5).filter((x) => x <= d + 1e-9);
  const st = pose(VR, Vr, 'outside', 0);
  const [sx, sy] = VM2(st.c);
  return (
    <>
      <Stage>
        <Hoop m={VM2} unit={18} R={VR} plate />
        <Path m={VM2} unit={18} rad={VR + Vr} progress={ease(f, at(scene, 1, 0.1), 40)} color={C.primary} />
        <Radius m={VM2} a={Math.PI * 0.75} len={VR + Vr} text="15" color={C.primary} opacity={ease(f, at(scene, 1, 0.6), 12) * fadeTo(f, at(scene, 4))} off={1.6} />
        {ghosts.map((x, k) => {
          const q = pose(VR, Vr, 'outside', x);
          return <Ring key={k} m={VM2} unit={18} r={Vr} p={q} ghost opacity={0.3} />;
        })}
        <Ring m={VM2} unit={18} r={Vr} p={p} />
        <g opacity={ease(f, at(scene, 0, 0.4), 12) * fadeTo(f, at(scene, 4))}>
          <line x1={sx - 14} y1={sy} x2={sx - 14} y2={sy - Vr * 18} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
          <Label p={[sx, sy - Vr * 18 - 36]} text="3" color={C.amber} />
        </g>
      </Stage>
      <Eq y={170} size={50} start={at(scene, 1, 0.3)} color={C.primary} tex="\text{path radius} = 12 + 3 = 15" />
      <Eq y={265} size={50} start={at(scene, 2, 0.15)} color={C.primary} tex="\text{path length} = 2 \times \pi \times 15 = 30\pi" />
      <Eq y={360} size={50} start={at(scene, 2, 0.6)} color={C.red} tex="\text{one turn} = 2 \times \pi \times 3 = 6\pi" />
      <Eq y={470} start={at(scene, 3, 0.2)} size={66} color={C.green} tex="30\pi \div 6\pi = 5" />
      <Eq y={600} start={at(scene, 4, 0.4)} size={50} color={C.amber} tex="\text{check: } 12 \div 3 = 4, \;\; 4 + 1 = 5" />
      <Answer x={VM2([0, 0])[0]} y={VM2([0, 0])[1]} value="5" chime={CHIME} start={done} />
      <Confetti x={VM2([0, 0])[0]} y={VM2([0, 0])[1]} start={done} seed={11} />
      <Counter x={1000} y={680} n={n} label="coin turns:" style={{ ...fadeUp(f, at(scene, 4, 0.1)), transform: 'none' }} />
      <Text x={1380} y={720} w={480} size={40} weight={800} color={C.violet} style={fadeUp(f, at(scene, 5, 0.4))}>
        Same way it travels ↺
      </Text>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const m = plane(1480, 450, 17);
  const d = lap(f, at(scene, 1, 0.2), at(scene, 2, 0.95));
  return (
    <>
      <div style={{ position: 'absolute', left: 140, top: 160, width: 1640, height: 620, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 56, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 140, width: 960, fontSize: 58, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Follow the center. Each turn moves it one rim length.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 360, width: 960, fontSize: 48, fontWeight: 800, color: C.violet, lineHeight: 1.35, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Center's circle: hoop radius <span style={{ color: C.red }}>−</span> ring radius inside, <span style={{ color: C.primary }}>+</span> outside.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.3), 14) * cardOut}>
          <Rolling d={d} path={1} m={m} unit={17} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'Ring radius 2, hoop radius 10. How many full turns?', false),
  floor: Floor,
  path: PathScene,
  watch: Watch,
  five: Five,
  five2: Five2,
  slide: Slide,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'Coin radius 3, OUTSIDE a plate of radius 12. How many full turns?', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { SignOff } from '../../lib/Brand';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-incircle-radius-4';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates, y up, same scale on both axes) ----------
// A at the origin, AC along +x, AB along (t^2-r^2, 2tr)/(t^2+r^2); incentre I = (t, r).
const geom = (r: number, t: number, y: number, z: number) => {
  const d = t * t + r * r;
  const u: Pt = [(t * t - r * r) / d, (2 * t * r) / d];
  const A: Pt = [0, 0];
  const B: Pt = [u[0] * (t + y), u[1] * (t + y)];
  const Cc: Pt = [t + z, 0];
  const I: Pt = [t, r];
  const TAC: Pt = [t, 0];
  const TAB: Pt = [u[0] * t, u[1] * t];
  const dx = Cc[0] - B[0];
  const dy = Cc[1] - B[1];
  const L = Math.hypot(dx, dy);
  const TBC: Pt = [B[0] + (dx / L) * y, B[1] + (dy / L) * y];
  return { A, B, C: Cc, I, TAC, TAB, TBC, r, t, y, z };
};
type Geo = ReturnType<typeof geom>;
export const Q = (y: number, z: number) => geom(4, 6, y, z);
const V = (y: number, z: number) => geom(3, 4, y, z);

export const view = (ox: number, oy: number, k: number) => (p: Pt): Pt => [ox + p[0] * k, oy - p[1] * k];
type Map = (p: Pt) => Pt;
const kOf = (m: Map) => m([1, 0])[0] - m([0, 0])[0];

const GREEN = C.primary; // the pieces at A
const VIO = C.violet; // y
const AMB = C.amber; // z
const cl = (hex: string, s: string) => `{\\color{${hex}}${s}}`;
const Y = cl('#7b61ff', 'y');
const Z = cl('#f59f0a', 'z');
const SIX = cl('#0cc281', '6');

const pulse = (f: number, a: number, b: number) => ease(f, a, 5) * (1 - ease(f, b, 5));

// ---------- drawing helpers (all in pixels, inside <Stage>) ----------

const Seg: React.FC<{ a: Pt; b: Pt; color: string; w?: number; o?: number; dash?: string }> = ({ a, b, color, w = 8, o = 1, dash }) =>
  o <= 0 ? null : <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={o} strokeDasharray={dash} />;

export const Lbl: React.FC<{ p: Pt; text: string; color?: string; size?: number; o?: number }> = ({ p, text, color = C.ink, size = 48, o = 1 }) =>
  o <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={o} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={9} strokeLinejoin="round">
      {text}
    </text>
  );

const Dot: React.FC<{ p: Pt; color: string; r?: number; o?: number }> = ({ p, color, r = 9, o = 1 }) => (o <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill={color} opacity={o} />);

const Ring: React.FC<{ p: Pt; color: string; o: number; r?: number }> = ({ p, color, o, r = 26 }) =>
  o <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill="none" stroke={color} strokeWidth={7} opacity={o} />;

/** Point `d` px away from the middle of segment pq, on the side away from `from`. */
const away = (p: Pt, q: Pt, from: Pt, d: number): Pt => {
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  let nx = -(q[1] - p[1]) / len;
  let ny = (q[0] - p[0]) / len;
  if ((mx - from[0]) * nx + (my - from[1]) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  return [mx + nx * d, my + ny * d];
};

/** n equal-length tick marks across the middle of segment pq. */
const Ticks: React.FC<{ p: Pt; q: Pt; n: number; color: string; o: number }> = ({ p, q, n, color, o }) => {
  if (o <= 0) return null;
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const ux = (q[0] - p[0]) / len;
  const uy = (q[1] - p[1]) / len;
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  return (
    <g opacity={o} stroke={color} strokeWidth={6} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const c = (i - (n - 1) / 2) * 14;
        const cx = mx + ux * c;
        const cy = my + uy * c;
        return <line key={i} x1={cx - uy * 16} y1={cy + ux * 16} x2={cx + uy * 16} y2={cy - ux * 16} />;
      })}
    </g>
  );
};

const RightMark: React.FC<{ at: Pt; toward: Pt; along: Pt; o: number; s?: number }> = ({ at: t, toward, along, o, s = 20 }) => {
  if (o <= 0) return null;
  const n = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  const d1 = n(t, toward);
  const d2 = n(t, along);
  const a: Pt = [t[0] + d1[0] * s, t[1] + d1[1] * s];
  const b: Pt = [a[0] + d2[0] * s, a[1] + d2[1] * s];
  const c: Pt = [t[0] + d2[0] * s, t[1] + d2[1] * s];
  return <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`} fill="none" stroke={C.ink} strokeWidth={4} opacity={o} />;
};

/** The triangle, its incircle and vertex letters. Overlays go in `children` (same pixel space). */
export const Fig: React.FC<{ g: Geo; m: Map; tri?: number; circ?: number; letters?: number; children?: React.ReactNode }> = ({ g, m, tri = 1, circ = 1, letters = 1, children }) => {
  const k = kOf(m);
  const [ix, iy] = m(g.I);
  const A = m(g.A);
  const B = m(g.B);
  const Cc = m(g.C);
  return (
    <>
      <Poly pts={[A, B, Cc]} color={C.ink} width={7} fill={C.card} fillOpacity={1} progress={tri} />
      {circ > 0 && (
        <circle cx={ix} cy={iy} r={g.r * k} fill={C.primary} fillOpacity={0.08 * circ} stroke={C.primary} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circ} transform={`rotate(-90 ${ix} ${iy})`} />
      )}
      {children}
      <Lbl p={[A[0] - 36, A[1] + 34]} text="A" o={letters} />
      <Lbl p={[B[0] - 6, B[1] - 40]} text="B" o={letters} />
      <Lbl p={[Cc[0] + 38, Cc[1] + 34]} text="C" o={letters} />
    </>
  );
};

/** Radius from I to the touch point on AC, labelled r. */
export const Radius: React.FC<{ g: Geo; m: Map; o: number; label?: string; hl?: number }> = ({ g, m, o, label, hl = 0 }) => {
  const i = m(g.I);
  const t = m(g.TAC);
  return (
    <>
      <Seg a={i} b={t} color={hl > 0 ? C.amber : C.ink} w={hl > 0 ? 10 : 6} o={o} dash={hl > 0 ? undefined : '12 9'} />
      <Dot p={i} color={C.ink} r={8} o={o} />
      <Lbl p={[i[0] + 34, (i[1] + t[1]) / 2]} text={label ?? String(g.r)} color={hl > 0 ? C.amber : C.ink} size={56} o={o} />
    </>
  );
};

/** The three tangent-piece pairs, coloured 6 / y / z with tick marks and labels. */
export const Pieces: React.FC<{ g: Geo; m: Map; o: [number, number, number]; labels?: [string, string, string]; flash?: number }> = ({ g, m, o, labels = [String(g.t), 'y', 'z'], flash = 0 }) => {
  const [A, B, Cc, I, TAC, TAB, TBC] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB, g.TBC].map(m) as Pt[];
  const col: [string, string, string] = [flash > 0 ? C.red : GREEN, VIO, AMB];
  const segs: [Pt, Pt, number][] = [
    [A, TAC, 0],
    [A, TAB, 0],
    [B, TAB, 1],
    [B, TBC, 1],
    [Cc, TAC, 2],
    [Cc, TBC, 2],
  ];
  return (
    <>
      {segs.map(([p, q, c], i) => (
        <g key={i}>
          <Seg a={p} b={q} color={col[c]} w={13} o={o[c] * (c === 0 && flash > 0 ? 0.4 + 0.6 * flash : 1)} />
          <Ticks p={p} q={q} n={c + 1} color={col[c]} o={o[c]} />
          <Lbl p={away(p, q, I, 56)} text={labels[c]} color={col[c]} o={o[c]} />
        </g>
      ))}
    </>
  );
};

// ---------- panel helpers ----------

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; out?: number }> = ({ y, tex, start, x = 720, size = 52, color = C.ink, out }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const o = out === undefined ? 1 : 1 - ease(f, out, 10);
  if ((s.opacity as number) * o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * o }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; out?: number }> = ({ x, y, w, h, start, out }) => {
  const f = useCurrentFrame();
  const o = out === undefined ? 1 : 1 - ease(f, out, 10);
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) * o }} />;
};

const Mk: React.FC<{ x: number; y: number; ok: boolean; start: number; out?: number }> = ({ x, y, ok, start, out }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 8) * (out === undefined ? 1 : 1 - ease(f, out, 10));
  if (o <= 0) return null;
  return (
    <svg width={54} height={54} viewBox="0 0 54 54" style={{ position: 'absolute', left: x, top: y, opacity: o }}>
      <circle cx={27} cy={27} r={27} fill={ok ? C.primary : C.red} />
      {ok ? <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M17 17 L37 37 M37 17 L17 37" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />}
    </svg>
  );
};

type ChipState = { label: string; start: number; wrong?: number; right?: number };
const Chips: React.FC<{ x: number; y: number; items: ChipState[]; out?: number }> = ({ x, y, items, out }) => {
  const f = useCurrentFrame();
  const fo = out === undefined ? 1 : 1 - ease(f, out, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22, opacity: fo }}>
      {items.map((c, i) => {
        const wrong = c.wrong === undefined ? 0 : ease(f, c.wrong, 8);
        const right = c.right === undefined ? 0 : ease(f, c.right, 8);
        const bg = right > 0 ? C.green : wrong > 0 ? C.red : C.card;
        const fg = right > 0 || wrong > 0 ? '#fff' : C.ink;
        return (
          <div key={i} style={{ ...fadeUp(f, c.start, 10), background: bg, color: fg, borderRadius: 18, padding: '12px 26px', fontSize: 48, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ opacity: 0.6, fontSize: 34, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c.label}
          </div>
        );
      })}
    </div>
  );
};

export const CH = ['42', '60', '81', '150', '162'];

// ---------- scenes ----------

const MI = view(700, 760, 40);

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q(7, 8);
  const slip = at(scene, 1, 0.1);
  const wob = f > slip ? Math.sin((f - slip) * 0.7) * 7 * Math.max(0, 1 - (f - slip) / 120) : 0;
  return (
    <>
      <Text x={960} y={100} w={1500} size={76} weight={900} align="center" style={fadeUp(f, 0)}>
        How big can the triangle get?
      </Text>
      <Stage>
        <Fig g={g} m={MI} tri={ease(f, 6, 26)} circ={ease(f, at(scene, 0, 0.35), 28)} letters={ease(f, 24, 10)}>
          <Radius g={g} m={MI} o={ease(f, at(scene, 0, 0.7), 10)} />
        </Fig>
      </Stage>
      <div style={{ position: 'absolute', left: 1360, top: 380, transform: `rotate(${wob}deg)`, background: C.card, border: `6px solid ${C.red}`, borderRadius: 26, padding: '22px 40px', fontSize: 64, fontWeight: 900, color: C.red, boxShadow: '0 8px 30px rgba(239,67,67,0.18)', ...fadeUp(f, slip) }}>
        ÷ 2 slip
      </div>
      <div style={{ position: 'absolute', left: 130, top: 400, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 84, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const MQ = view(1130, 740, 40);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q(7, 8);
  const o4 = ease(f, at(scene, 0, 0.7), 10);
  const o6 = ease(f, at(scene, 1, 0.8), 10);
  const [A, , , I, TAC, TAB] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB].map(MQ) as Pt[];
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 960, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 46, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        A triangle has <Mark on={at(scene, 0, 0.25)}>whole-number sides</Mark>. Its inscribed circle has <Mark on={at(scene, 0, 0.6)}>radius <Tex tex="4" size={48} /></Mark>. The circle touches{' '}
        <Tex tex="\overline{AB}" size={48} /> and <Tex tex="\overline{AC}" size={48} /> at points that are each <Mark on={at(scene, 1, 0.8)}><Tex tex="6" size={48} /> from <Tex tex="A" size={48} /></Mark>. What is the{' '}
        <Mark on={at(scene, 2, 0.4)}>largest possible perimeter</Mark>?
      </div>
      <div style={{ position: 'absolute', left: 100, top: 640, display: 'flex', gap: 20 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 3, 0.15 + i * 0.13), 10), background: C.card, borderRadius: 18, padding: '12px 22px', fontSize: 46, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 32, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Stage>
        <Fig g={g} m={MQ} tri={ease(f, 8, 24)} circ={ease(f, 20, 24)}>
          <Radius g={g} m={MQ} o={o4} />
          <Lbl p={away(A, TAC, I, 40)} text="6" color={GREEN} o={o6} />
          <Lbl p={away(A, TAB, I, 40)} text="6" color={GREEN} o={o6} />
        </Fig>
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q(7, 8);
  const [A, , , I, TAC, TAB] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB].map(MQ) as Pt[];
  const rad = pulse(f, at(scene, 0, 0.1), at(scene, 0, 0.4));
  const six = ease(f, at(scene, 0, 0.45), 10);
  return (
    <>
      <Stage>
        <Fig g={g} m={MQ}>
          <Radius g={g} m={MQ} o={1} hl={rad} />
          <Seg a={A} b={TAC} color={GREEN} w={14} o={six} />
          <Seg a={A} b={TAB} color={GREEN} w={14} o={six} />
          <Lbl p={away(A, TAC, I, 40)} text="6" color={GREEN} o={six} />
          <Lbl p={away(A, TAB, I, 40)} text="6" color={GREEN} o={six} />
        </Fig>
      </Stage>
      <Check x={100} y={250} start={at(scene, 0, 0.15)}>Radius is 4</Check>
      <Check x={100} y={350} start={at(scene, 0, 0.45)}>Both pieces at A are 6</Check>
      <Pill x={100} y={480} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.75)), fontSize: 40 }}>
        BIGGEST perimeter
      </Pill>
    </>
  );
};

const makePause = (seconds: number, prompt: string, gf: Geo, label: [string, string]): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = view(200, 740, 40);
  const [A, , , I, TAC, TAB] = [gf.A, gf.B, gf.C, gf.I, gf.TAC, gf.TAB].map(m) as Pt[];
  return (
    <>
      <Stage>
        <Fig g={gf} m={m}>
          <Radius g={gf} m={m} o={1} />
          <Lbl p={away(A, TAC, I, 40)} text={label[1]} color={GREEN} />
          <Lbl p={away(A, TAB, I, 40)} text={label[1]} color={GREEN} />
        </Fig>
      </Stage>
      <Text x={450} y={105} w={760} size={46} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} />
    </>
  );
};

const ML = view(120, 780, 34);

const Setup: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q(7, 8);
  const mini = ease(f, at(scene, 0, 0.1), 12) * (1 - ease(f, at(scene, 1, 0.05), 10));
  // tangent demo: P outside a small circle (pixels)
  const c: Pt = [1250, 420];
  const rr = 95;
  const P: Pt = [1690, 420];
  const al = Math.acos(rr / (P[0] - c[0]));
  const T1: Pt = [c[0] + rr * Math.cos(al), c[1] - rr * Math.sin(al)];
  const T2: Pt = [c[0] + rr * Math.cos(al), c[1] + rr * Math.sin(al)];
  const p6 = ease(f, at(scene, 1, 0.15), 10);
  const py = ease(f, at(scene, 1, 0.5), 10);
  const pz = ease(f, at(scene, 1, 0.8), 10);
  const [A, B, Cc, , TAC, TAB, TBC] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB, g.TBC].map(ML) as Pt[];
  const flashAB = pulse(f, at(scene, 2, 0.1), at(scene, 2, 0.4));
  const flashAC = pulse(f, at(scene, 2, 0.4), at(scene, 2, 0.68));
  const flashBC = pulse(f, at(scene, 2, 0.68), at(scene, 2, 0.98));
  // L6: one piece from each corner lifts out and lines up
  const lift = ease(f, at(scene, 4, 0.3), 26);
  const tgt: Pt[] = [[1330, 700], [1440, 700], [1550, 700]];
  const src: Pt[] = [[(A[0] + TAC[0]) / 2, A[1] + 40], [(B[0] + TAB[0]) / 2 - 36, (B[1] + TAB[1]) / 2], [(Cc[0] + TAC[0]) / 2, Cc[1] + 40]];
  const cols = [GREEN, VIO, AMB];
  const names = ['6', 'y', 'z'];
  return (
    <>
      <Stage>
        <Fig g={g} m={ML}>
          <Pieces g={g} m={ML} o={[p6, py, pz]} />
          <Seg a={A} b={B} color={C.red} w={16} o={flashAB * 0.7} />
          <Seg a={A} b={Cc} color={C.red} w={16} o={flashAC * 0.7} />
          <Seg a={B} b={Cc} color={C.red} w={16} o={flashBC * 0.7} />
        </Fig>
        <g opacity={mini}>
          <circle cx={c[0]} cy={c[1]} r={rr} fill={C.primary} fillOpacity={0.1} stroke={C.primary} strokeWidth={6} />
          <Seg a={P} b={T1} color={C.violet} w={10} />
          <Seg a={P} b={T2} color={C.violet} w={10} />
          <Ticks p={P} q={T1} n={2} color={C.violet} o={1} />
          <Ticks p={P} q={T2} n={2} color={C.violet} o={1} />
          <Dot p={P} color={C.ink} r={10} />
          <Lbl p={[P[0] + 44, P[1]]} text="P" />
          <Lbl p={[1500, 280]} text="equal" color={C.violet} size={56} />
        </g>
      </Stage>
      <Eq y={190} start={at(scene, 2, 0.1)} tex={`AB = ${SIX} + ${Y}`} />
      <Eq y={290} start={at(scene, 2, 0.4)} tex={`AC = ${SIX} + ${Z}`} />
      <Eq y={390} start={at(scene, 2, 0.68)} tex={`BC = ${Y} + ${Z}`} />
      <Eq y={520} start={at(scene, 3, 0.1)} size={48} tex={`AB \\text{ whole} \\Rightarrow ${Y} \\text{ whole}`} />
      <Eq y={605} start={at(scene, 3, 0.6)} size={48} tex={`AC \\text{ whole} \\Rightarrow ${Z} \\text{ whole}`} />
      <Eq y={700} start={at(scene, 4, 0.05)} size={60} tex={`s = ${SIX} + ${Y} + ${Z}`} />
      <Text x={720} y={782} w={600} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.05))}>
        half the perimeter
      </Text>
      {lift > 0 &&
        names.map((n, i) => {
          const x = src[i][0] + (tgt[i][0] - src[i][0]) * lift;
          const y = src[i][1] + (tgt[i][1] - src[i][1]) * lift;
          return (
            <div key={n} style={{ position: 'absolute', left: x - 44, top: y - 36, width: 88, height: 72, borderRadius: 22, background: cols[i], color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, lift * 3) }}>
              {n}
            </div>
          );
        })}
    </>
  );
};

const Area: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q(7, 8);
  const [A, B, Cc, I, TAC, TAB, TBC] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB, g.TBC].map(ML) as Pt[];
  const spokes = ease(f, at(scene, 0, 0.55), 14);
  const tint = ease(f, at(scene, 1, 0.0), 14);
  // L2: each small triangle gets its radius + right angle, base flashes in turn
  const st = [at(scene, 1, 0.2), at(scene, 1, 0.45), at(scene, 1, 0.7)];
  const tris: { pts: Pt[]; col: string; T: Pt; base: [Pt, Pt]; other: Pt }[] = [
    { pts: [A, B, I], col: C.blue, T: TAB, base: [A, B], other: A },
    { pts: [B, Cc, I], col: C.violet, T: TBC, base: [B, Cc], other: B },
    { pts: [Cc, A, I], col: C.amber, T: TAC, base: [Cc, A], other: A },
  ];
  const X = 720;
  const phase2 = at(scene, 3, 0.0);
  const phase3 = at(scene, 6, 0.0);
  return (
    <>
      <Stage>
        <Fig g={g} m={ML}>
          {tris.map((t, i) => (
            <Poly key={i} pts={t.pts} color={t.col} width={0} fill={t.col} fillOpacity={0.22} progress={tint} />
          ))}
          <Seg a={I} b={A} color={C.ink} w={5} o={spokes} />
          <Seg a={I} b={B} color={C.ink} w={5} o={spokes} />
          <Seg a={I} b={Cc} color={C.ink} w={5} o={spokes} />
          <Dot p={I} color={C.ink} r={8} o={spokes} />
          <Lbl p={[I[0] - 4, I[1] - 30]} text="I" size={44} o={spokes} />
          {tris.map((t, i) => {
            const o = ease(f, st[i], 8);
            const fl = pulse(f, st[i], st[i] + 24);
            return (
              <g key={i}>
                <Seg a={I} b={t.T} color={C.ink} w={6} o={o} />
                <RightMark at={t.T} toward={I} along={t.other} o={o} />
                <Lbl p={away(I, t.T, t.base[0] === A && i === 0 ? Cc : i === 1 ? A : B, 28)} text="4" size={48} o={o} />
                <Seg a={t.base[0]} b={t.base[1]} color={t.col} w={14} o={fl} />
              </g>
            );
          })}
        </Fig>
      </Stage>
      {/* way one */}
      <Eq y={150} start={at(scene, 2, 0.0)} out={phase2} size={52} tex={'\\text{Area} = \\dfrac12 \\cdot 4 \\cdot (AB + BC + CA)'} />
      <Eq y={290} start={at(scene, 2, 0.5)} out={phase2} size={52} tex={'= \\dfrac12 \\cdot 4 \\cdot 2s = 4s'} />
      <Eq y={150} start={phase2 + 6} size={58} color={C.green} tex={'\\text{Area} = 4s'} />
      {/* way two */}
      <Eq y={265} start={at(scene, 3, 0.1)} out={phase3} size={52} tex={'\\text{Area} = \\sqrt{s(s-a)(s-b)(s-c)}'} />
      <Eq y={355} start={at(scene, 3, 0.55)} out={phase3} size={44} color={C.muted} tex={'a = BC,\\; b = CA,\\; c = AB'} />
      <Eq y={450} start={at(scene, 4, 0.1)} out={phase3} size={50} tex={`s - BC = (6 + ${Y} + ${Z}) - (${Y} + ${Z}) = ${SIX}`} />
      <Eq y={530} start={at(scene, 4, 0.45)} out={phase3} size={50} tex={`s - CA = ${Y}`} />
      <Eq y={610} start={at(scene, 4, 0.7)} out={phase3} size={50} tex={`s - AB = ${Z}`} />
      <Eq y={700} start={at(scene, 5, 0.2)} out={phase3} size={54} tex={`\\text{Area} = \\sqrt{${SIX} \\cdot s \\cdot ${Y} \\cdot ${Z}}`} />
      {/* set equal */}
      <Eq y={265} start={at(scene, 6, 0.05)} out={at(scene, 7, 0)} tex={'4s = \\sqrt{6syz}'} />
      <Eq y={355} start={at(scene, 6, 0.4)} out={at(scene, 7, 0)} tex={'(4s)^2 = 6syz'} />
      <Eq y={445} start={at(scene, 6, 0.7)} out={at(scene, 7, 0)} tex={'16s^2 = 6syz'} />
      <Eq y={265} start={at(scene, 7, 0.05)} out={at(scene, 8, 0)} tex={'16s = 6yz'} />
      <Eq y={355} start={at(scene, 7, 0.55)} tex={'8s = 3yz'} />
      <Eq y={450} start={at(scene, 8, 0.1)} tex={'8(6 + y + z) = 3yz'} />
      <Eq y={560} start={at(scene, 8, 0.55)} size={60} tex={'3yz = 48 + 8y + 8z'} />
      <Boxed x={X - 24} y={540} w={640} h={112} start={at(scene, 8, 0.6)} />
    </>
  );
};

// table rows
const ROWS = [
  { y: 3, z: '(24+48)/(9-8) = 72', ok: 1, s: 81, p: 162, line: 3, t: 0.1 },
  { y: 4, z: '80/4 = 20', ok: 1, s: 30, p: 60, line: 4, t: 0.1 },
  { y: 5, z: '88/7', ok: 0, line: 5, t: 0.1 },
  { y: 6, z: '96/10', ok: 0, line: 5, t: 0.55 },
  { y: 7, z: '104/13 = 8', ok: 1, s: 21, p: 42, line: 6, t: 0.1 },
  { y: 8, z: '112/16 = 7', ok: 2, line: 7, t: 0.1 },
];

const Table: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const TX = 960;
  const ty = (i: number) => 270 + i * 82;
  const reveal = at(scene, 9, 0.0);
  const fade = at(scene, 9, 0.4);
  const tableOut = 1 - ease(f, fade, 12);
  const hl = ease(f, reveal + 4, 10) * tableOut;
  const flyT = ease(f, at(scene, 0, 0.15), 24);
  const g3 = [Q(7, 8), Q(4, 20), Q(3, 72)];
  const M3 = view(130, 810, 21);
  const o3 = [pulse(f, at(scene, 9, 0.35), at(scene, 9, 0.55)), pulse(f, at(scene, 9, 0.55), at(scene, 9, 0.75)), ease(f, at(scene, 9, 0.75), 12)];
  const fig = ease(f, at(scene, 9, 0.35), 10);
  const [ci, ciw] = [M3(g3[0].I), 0];
  void ciw;
  return (
    <>
      <div style={{ opacity: tableOut }}>
        {/* left: solving for z */}
        <div style={{ position: 'absolute', left: 100, top: 170, display: 'flex', alignItems: 'center', ...fadeUp(f, 4) }}>
          <Tex tex="3yz = 48 + 8y" size={54} />
          <div style={{ marginLeft: 12 }}>
            <Tex tex="{}+ 8z" size={54} color={C.amber} />
          </div>
        </div>
        {flyT > 0 && (
          <div style={{ position: 'absolute', left: 100 + 440 - 395 * flyT, top: 170 + 110 * flyT, opacity: flyT < 1 ? 1 : 0 }}>
            <Tex tex={flyT < 0.5 ? '8z' : '-8z'} size={54} color={C.amber} />
          </div>
        )}
        <Eq x={100} y={285} start={at(scene, 0, 0.45)} tex={'3yz - 8z = 8y + 48'} />
        <Eq x={100} y={395} start={at(scene, 0, 0.75)} tex={'z(3y - 8) = 8y + 48'} />
        <Eq x={100} y={495} start={at(scene, 1, 0.3)} size={62} tex={'z = \\dfrac{8y + 48}{3y - 8}'} />
        <Boxed x={76} y={478} w={470} h={185} start={at(scene, 1, 0.4)} />
        <Eq x={100} y={710} start={at(scene, 2, 0.05)} size={46} tex={'3y - 8 > 0 \\;\\Rightarrow\\; 3y > 8 \\;\\Rightarrow\\; y \\ge 3'} />
        {/* right: the table */}
        <div style={{ position: 'absolute', left: TX, top: 160, fontSize: 48, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 3, 0)) }}>y</div>
        <div style={{ position: 'absolute', left: TX + 110, top: 160, fontSize: 48, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 3, 0)) }}>z</div>
        <div style={{ position: 'absolute', left: TX + 700, top: 160, fontSize: 48, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 8, 0)) }}>s</div>
        <div style={{ position: 'absolute', left: TX + 820, top: 160, fontSize: 48, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 8, 0.35)) }}>2s</div>
        <div style={{ position: 'absolute', left: TX - 100, top: ty(0) - 8, width: 960, height: 78, borderRadius: 20, background: C.primarySoft, border: `5px solid ${C.green}`, opacity: hl, boxSizing: 'border-box' }} />
        {ROWS.map((r, i) => {
          const st = at(scene, r.line, r.t);
          const col = r.ok === 0 ? C.red : r.ok === 2 ? C.muted : C.ink;
          return (
            <div key={r.y}>
              <div style={{ position: 'absolute', left: TX, top: ty(i), whiteSpace: 'nowrap', ...fadeUp(f, st), opacity: (fadeUp(f, st).opacity as number) * (r.ok === 2 ? 0.7 : 1) }}>
                <span style={{ display: 'inline-block', width: 70 }}>
                  <Tex tex={String(r.y)} size={50} color={col} />
                </span>
                <Tex tex={r.z} size={50} color={col} />
              </div>
              {r.ok === 1 && <Mk x={TX - 80} y={ty(i) + 4} ok start={st + 6} />}
              {r.ok === 0 && <Mk x={TX - 80} y={ty(i) + 4} ok={false} start={st + 6} />}
              {r.ok === 2 && (
                <div style={{ position: 'absolute', left: TX + 400, top: ty(i) + 2, fontSize: 48, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap', ...fadeUp(f, st + 10) }}>flip of 7, 8</div>
              )}
              {r.s !== undefined && (
                <>
                  <div style={{ position: 'absolute', left: TX + 700, top: ty(i), ...fadeUp(f, at(scene, 8, 0.1 + i * 0.05)) }}>
                    <Tex tex={String(r.s)} size={52} />
                  </div>
                  <div style={{ position: 'absolute', left: TX + 820, top: ty(i), ...fadeUp(f, at(scene, 8, 0.4 + (r.y === 3 ? 0 : r.y === 4 ? 0.22 : 0.4))) }}>
                    <Tex tex={String(r.p)} size={52} color={r.y === 3 ? C.green : C.ink} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {/* reveal */}
      <div style={{ opacity: fig }}>
        <Chips x={100} y={160} items={CH.map((l, i) => ({ label: l, start: 0, right: i === 4 ? reveal + 30 : undefined }))} />
      </div>
      <Stage>
        <g opacity={fig}>
          {/* one common scale: the SAME circle, three different tangent lines BC */}
          <circle cx={ci[0]} cy={ci[1]} r={4 * 21} fill={C.primary} fillOpacity={0.1} stroke={C.primary} strokeWidth={5} />
          <Seg a={M3([0, 0])} b={M3(g3[2].C)} color={C.line} w={3} dash="8 8" />
          {g3.map((g, i) => (
            <Poly key={i} pts={[M3(g.A), M3(g.B), M3(g.C)]} color={i === 2 ? C.green : C.ink} width={5} progress={1} opacity={o3[i]} />
          ))}
        </g>
      </Stage>
      <Answer x={1560} y={360} value="162" start={at(scene, 9, 0.88)} chime={CHIME} />
    </>
  );
};

const Factor: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pairs: [string, string, string, boolean][] = [
    ['1 \\times 208', '9,\\ 216', '', true],
    ['2 \\times 104', '10,\\ 112', '', false],
    ['4 \\times 52', '12,\\ 60', '', true],
    ['8 \\times 26', '16,\\ 34', '', false],
    ['13 \\times 16', '21,\\ 24', '', true],
  ];
  const RX = 1130;
  const qm = ease(f, at(scene, 1, 0.1), 10);
  return (
    <>
      <Eq x={100} y={108} start={0} size={44} color={C.muted} tex={'\\text{from } 3yz = 48 + 8y + 8z'} />
      <Eq x={100} y={185} start={0} tex={'3yz - 8y - 8z = 48'} />
      <Eq x={100} y={285} start={at(scene, 0, 0.6)} tex={'9yz - 24y - 24z = \\;'} />
      <div style={{ position: 'absolute', left: 100 + 545, top: 285, fontSize: 52, fontWeight: 800, color: C.amber, opacity: ease(f, at(scene, 0, 0.6), 10) * (1 - ease(f, at(scene, 1, 0.1), 6)) }}>?</div>
      <Eq x={100 + 540} y={285} start={at(scene, 1, 0.1)} tex={'144'} />
      <Eq x={100 + 620} y={185} start={at(scene, 0, 0.6)} size={44} color={C.amber} tex={'{}\\times 3'} />
      <Eq x={100} y={385} start={at(scene, 1, 0.45)} out={at(scene, 2, 0.05)} tex={'9yz - 24y - 24z + 64 = 144 + 64'} />
      <Eq x={100} y={385} start={at(scene, 2, 0.08)} tex={'9yz - 24y - 24z + 64 = 208'} />
      <Eq x={100} y={495} start={at(scene, 2, 0.35)} size={62} tex={'(3y - 8)(3z - 8) = 208'} />
      <Boxed x={76} y={477} w={800} h={116} start={at(scene, 2, 0.45)} />
      <Eq x={100} y={620} start={at(scene, 2, 0.7)} size={44} color={C.muted} tex={'(3y-8)(3z-8) = 9yz - 24y - 24z + 64'} />
      {pairs.map(([p, t, , ok], i) => {
        const s = at(scene, 3, 0.25 + i * 0.12);
        const test = at(scene, 4, 0.05 + i * 0.12);
        return (
          <div key={p}>
            <Eq x={RX} y={160 + i * 92} start={s} size={52} tex={p} />
            <Eq x={RX + 290} y={160 + i * 92} start={test} size={46} color={ok ? C.ink : C.red} tex={`+8 \\to ${t}`} />
            <Mk x={RX + 690} y={168 + i * 92} ok={ok} start={test + 8} />
          </div>
        );
      })}
      <Eq x={RX} y={625} start={at(scene, 3, 0.7)} size={50} tex={'(3y - 8) + 8 = 3y'} />
      <Text x={RX} y={690} w={700} size={38} weight={800} color={C.violet} style={fadeUp(f, at(scene, 3, 0.85))}>
        so +8 must divide by 3
      </Text>
      <div style={{ opacity: qm }} />
      <div style={{ position: 'absolute', left: 100, top: 715, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.15)) }}>
        <Tex tex="(y, z) =" size={56} />
        <div style={{ padding: '2px 14px', borderRadius: 16, border: `6px solid ${ease(f, at(scene, 5, 0.5), 12) > 0 ? C.green : 'transparent'}` }}>
          <Tex tex="(3, 72)" size={56} />
        </div>
        <Tex tex=",\ (4, 20),\ (7, 8)" size={56} />
      </div>
      <Pill x={RX} y={760} color={C.violet} style={{ ...fadeUp(f, at(scene, 6, 0.35)), fontSize: 36 }}>
        every answer, no stopping rule needed
      </Pill>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const M3 = view(130, 760, 21);
  const g3 = [Q(7, 8), Q(4, 20), Q(3, 72)];
  const o = [
    pulse(f, at(scene, 0, 0.05), at(scene, 0, 0.5)) + 0,
    pulse(f, at(scene, 0, 0.5), at(scene, 1, 0.0)),
    ease(f, at(scene, 1, 0.0), 12),
  ];
  const [A, , , I, TAC, TAB] = [g3[2].A, g3[2].B, g3[2].C, g3[2].I, g3[2].TAC, g3[2].TAB].map(M3) as Pt[];
  const flash = pulse(f, at(scene, 2, 0.4), at(scene, 3, 0.0)) * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.3)));
  const ci = M3(g3[0].I);
  return (
    <>
      <Chips
        x={100}
        y={150}
        items={[
          { label: '42', start: 0, wrong: at(scene, 0, 0.05) },
          { label: '60', start: 0, wrong: at(scene, 0, 0.5) },
          { label: '81', start: 0, wrong: at(scene, 1, 0.05) },
          { label: '150', start: 0, wrong: at(scene, 2, 0.05) },
          { label: '162', start: 0, right: 0 },
        ]}
      />
      <Stage>
        <circle cx={ci[0]} cy={ci[1]} r={4 * 21} fill={C.primary} fillOpacity={0.1} stroke={C.primary} strokeWidth={5} />
        {g3.map((g, i) => (
          <Poly key={i} pts={[M3(g.A), M3(g.B), M3(g.C)]} color={i === 2 ? C.green : C.red} width={5} progress={1} opacity={i === 2 ? o[2] : o[i]} />
        ))}
        <Pieces g={g3[2]} m={M3} o={[flash, 0, 0]} flash={flash} labels={['6', '', '']} />
        <Lbl p={[A[0], A[1]]} text="" />
        <Lbl p={[I[0] + TAC[0] * 0, I[1]]} text="" />
        <Lbl p={TAB} text="" />
      </Stage>
      <Text x={700} y={590} w={300} size={64} weight={900} color={C.red} style={{ opacity: o[0] + o[1] }}>
        {f < at(scene, 0, 0.5) ? '42' : '60'}
      </Text>
      <Eq x={100} y={270} start={at(scene, 1, 0.05)} size={64} tex={'s = 81'} out={at(scene, 2, 0.0)} />
      <Pill x={420} y={275} color={C.red} style={{ ...fadeUp(f, at(scene, 1, 0.5)), fontSize: 38, opacity: (fadeUp(f, at(scene, 1, 0.5)).opacity as number) * (1 - ease(f, at(scene, 2, 0), 10)) }}>
        × 2 forgotten
      </Pill>
      <Eq x={100} y={260} start={at(scene, 2, 0.3)} size={60} color={C.red} tex={'2(3 + 72) = 150'} out={at(scene, 3, 0.0)} />
      <Eq x={100} y={370} start={at(scene, 2, 0.6)} size={60} color={C.green} tex={'2(6 + 3 + 72) = 162'} out={at(scene, 3, 0.0)} />
    </>
  );
};

const MV = view(1130, 740, 40);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = V(6, 6);
  const [A, , , I, TAC, TAB] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB].map(MV) as Pt[];
  const o3 = ease(f, at(scene, 0, 0.45), 10);
  const o4 = ease(f, at(scene, 0, 0.85), 10);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 220, width: 900, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 48, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        Now the circle has <Mark on={at(scene, 0, 0.4)}>radius <Tex tex="3" size={50} /></Mark>, and the touch points are <Mark on={at(scene, 0, 0.8)}><Tex tex="4" size={50} /> from <Tex tex="A" size={50} /></Mark>. The sides are whole numbers again.{' '}
        <Mark on={at(scene, 1, 0.5)}>Largest possible perimeter?</Mark>
      </div>
      <Stage>
        <Fig g={g} m={MV} tri={ease(f, 6, 24)} circ={ease(f, 18, 24)}>
          <Radius g={g} m={MV} o={o3} />
          <Lbl p={away(A, TAC, I, 40)} text="4" color={GREEN} o={o4} />
          <Lbl p={away(A, TAB, I, 40)} text="4" color={GREEN} o={o4} />
        </Fig>
      </Stage>
    </>
  );
};

const VA: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = at(scene, 6, 0.0);
  const TX = 1010;
  const ty = (i: number) => 270 + i * 82;
  const rows: { y: number; z: string; ok: boolean; line: number; t: number }[] = [
    { y: 3, z: '63/3 = 21', ok: true, line: 3, t: 0.3 },
    { y: 4, z: '72/7', ok: false, line: 4, t: 0.05 },
    { y: 5, z: '81/11', ok: false, line: 4, t: 0.2 },
    { y: 6, z: '90/15 = 6', ok: true, line: 4, t: 0.35 },
  ];
  const g = V(3, 21);
  const M = view(380, 650, 36);
  const [A, B, Cc, I, TAC, TAB] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB].map(M) as Pt[];
  const fig = ease(f, out + 6, 14);
  return (
    <>
      <div style={{ opacity: 1 - ease(f, out, 10) }}>
        <Eq x={100} y={150} start={at(scene, 0, 0.15)} size={50} tex={'\\text{Area} = 3s = \\sqrt{s \\cdot 4 \\cdot y \\cdot z}'} />
        <Eq x={100} y={250} start={at(scene, 1, 0.1)} tex={'9s = 4yz'} />
        <Eq x={100} y={340} start={at(scene, 1, 0.55)} tex={'9(4 + y + z) = 4yz'} />
        <Eq x={100} y={440} start={at(scene, 2, 0.0)} tex={'36 + 9y + 9z = 4yz'} />
        <Eq x={100} y={540} start={at(scene, 2, 0.4)} size={60} tex={'z = \\dfrac{9y + 36}{4y - 9}'} />
        <Boxed x={76} y={523} w={470} h={185} start={at(scene, 2, 0.55)} />
        <Text x={100} y={725} w={760} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 3, 0.05))}>
          4y − 9 &gt; 0, so y ≥ 3
        </Text>
        <div style={{ position: 'absolute', left: TX, top: 160, fontSize: 48, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 3, 0.2)) }}>y</div>
        <div style={{ position: 'absolute', left: TX + 110, top: 160, fontSize: 48, fontWeight: 900, color: C.muted, ...fadeUp(f, at(scene, 3, 0.2)) }}>z</div>
        {rows.map((r, i) => {
          const st = at(scene, r.line, r.t);
          return (
            <div key={r.y}>
              <div style={{ position: 'absolute', left: TX, top: ty(i), whiteSpace: 'nowrap', ...fadeUp(f, st) }}>
                <span style={{ display: 'inline-block', width: 110 }}>
                  <Tex tex={String(r.y)} size={52} color={r.ok ? C.ink : C.red} />
                </span>
                <Tex tex={r.z.replace('/', '\\,/\\,')} size={52} color={r.ok ? C.ink : C.red} />
              </div>
              <Mk x={TX + 480} y={ty(i) + 4} ok={r.ok} start={st + 6} />
            </div>
          );
        })}
        <Text x={TX} y={ty(4) - 10} w={600} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.8))}>
          then z &lt; y
        </Text>
        <Eq x={TX} y={ty(4) + 60} start={at(scene, 5, 0.05)} size={50} tex={'s = 4 + 3 + 21 = 28 \\to 56'} />
        <Eq x={TX} y={ty(4) + 140} start={at(scene, 5, 0.4)} size={50} tex={'s = 4 + 6 + 6 = 16 \\to 32'} />
      </div>
      <Stage>
        <g opacity={fig}>
          <Fig g={g} m={M} letters={fig}>
            <Seg a={A} b={B} color={C.ink} w={0} />
            <RightMark at={B} toward={A} along={Cc} o={fig} s={22} />
            <Lbl p={away(A, B, I, 40)} text="7" color={C.blue} o={fig} />
            <Lbl p={away(B, Cc, I, 40)} text="24" color={C.blue} o={fig} />
            <Lbl p={[(A[0] + Cc[0]) / 2, A[1] + 44]} text="25" color={C.blue} o={fig} />
            <Dot p={TAC} color={C.primary} r={0} />
            <Dot p={TAB} color={C.primary} r={0} />
          </Fig>
        </g>
      </Stage>
      <Answer x={1710} y={420} value="56" start={at(scene, 5, 0.9)} chime={CHIME} />
      <Confetti x={960} y={330} start={at(scene, 6, 0.1)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q(7, 8);
  return (
    <>
      <Stage>
        <Fig g={g} m={ML}>
          <Pieces g={g} m={ML} o={[ease(f, 4, 10), ease(f, 10, 10), ease(f, 16, 10)]} />
        </Fig>
      </Stage>
      <Text x={720} y={170} w={1100} size={52} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>
        Equal tangent pieces name every side
      </Text>
      <Eq x={720} y={300} start={at(scene, 1, 0.25)} size={46} tex={'\\text{Area} = r \\cdot s = \\sqrt{s(s-a)(s-b)(s-c)}'} />
      <Boxed x={696} y={282} w={1130} h={110} start={at(scene, 1, 0.5)} />
      <SignOff start={at(scene, 2, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 2, 0.3)} seed={3} />
    </>
  );
};

const Q1 = Q(7, 8);
const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'Biggest perimeter?', Q1, ['4', '6']),
  setup: Setup,
  area: Area,
  table: Table,
  factor: Factor,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, 'Radius 3: biggest perimeter?', V(6, 6), ['3', '4']),
  'variant-answer': VA,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + the intro's triangle, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>81?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      <Fig g={Q(7, 8)} m={view(60, 560, 40)}>
        <Radius g={Q(7, 8)} m={view(60, 560, 40)} o={1} label="4" />
      </Fig>
    </svg>
  </ThumbFrame>
);

export type { Scene };

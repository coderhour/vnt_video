import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Stage, XMark, type Pt } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Row, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-hexagon-triangles';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const AMBER = '#f59f0a';
export const AMBER_D = '#c27a00';
export const GREEN_D = '#08925f';
export const VIOLET_D = '#5b43d6';
const RED_D = '#d12f2f';
const GRID = '#aab1c2';

// ---------- triangular lattice (same convention as verify.py) ----------
// point (i, j) sits at maths x = i + j/2, y = j*sqrt(3)/2 (y up). Screen flips y.

const S3 = Math.sqrt(3);
type IJ = [number, number];
type Tri = { dir: 'up' | 'down'; s: number; p: [IJ, IJ, IJ] };
type Inside = (i: number, j: number) => boolean;

const enumerate = (inside: Inside, n = 8): Tri[] => {
  const out: Tri[] = [];
  for (let s = 1; s < n; s++)
    for (let i = -n; i <= n; i++)
      for (let j = -n; j <= n; j++) {
        if (inside(i, j) && inside(i + s, j) && inside(i, j + s)) out.push({ dir: 'up', s, p: [[i, j], [i + s, j], [i, j + s]] });
        if (inside(i, j) && inside(i + s, j) && inside(i + s, j - s)) out.push({ dir: 'down', s, p: [[i, j], [i + s, j], [i + s, j - s]] });
      }
  return out;
};

const hexa: Inside = (i, j) => Math.abs(i) <= 2 && Math.abs(j) <= 2 && Math.abs(i + j) <= 2;
const tri4: Inside = (i, j) => i >= 0 && j >= 0 && i + j <= 4;
export const HEX = enumerate(hexa);
const TRI4 = enumerate(tri4);
const HEX_VERTS: IJ[] = [[2, 0], [0, 2], [-2, 2], [-2, 0], [0, -2], [2, -2]];
const TRI4_VERTS: IJ[] = [[0, 0], [4, 0], [0, 4]];
const MIDS: IJ[] = [[1, 1], [-1, 2], [-2, 1], [-1, -1], [1, -2], [2, -1]]; // midpoints of the six hexagon sides

const pick = (all: Tri[], dir: 'up' | 'down', s: number) => all.filter((t) => t.dir === dir && t.s === s);
const mx = (p: IJ) => p[0] + p[1] / 2;
const my = (p: IJ) => (p[1] * S3) / 2;
const cen = (t: Tri) => [(mx(t.p[0]) + mx(t.p[1]) + mx(t.p[2])) / 3, (my(t.p[0]) + my(t.p[1]) + my(t.p[2])) / 3];
const angOf = (t: Tri) => { const c = cen(t); return Math.atan2(c[1], c[0]); };
const byAngle = (a: Tri[]) => [...a].sort((x, y) => angOf(x) - angOf(y));
const has = (t: Tri, q: IJ) => t.p.some((p) => p[0] === q[0] && p[1] === q[1]);
// reading order, for sliding an outline along rows
const byRow = (a: Tri[]) => [...a].sort((x, y) => x.p[0][1] - y.p[0][1] || x.p[0][0] - y.p[0][0]);

export const SMALL_HEX = HEX.filter((t) => t.s === 1);
const SIZE2_ALL = [...pick(HEX, 'up', 2), ...pick(HEX, 'down', 2)];
const WEDGE = byAngle(SIZE2_ALL.filter((t) => has(t, [0, 0]))); // six pizza slices, rotated 60 degrees from each other
const OTHER = byAngle(SIZE2_ALL.filter((t) => !has(t, [0, 0]))); // six with the center at the middle of a side
export const UP2 = byRow(pick(HEX, 'up', 2));
export const BIG_UP = pick(HEX, 'up', 3)[0];
export const BIG_DOWN = pick(HEX, 'down', 3)[0];
// the far corner of each OTHER triangle that lands on a side-midpoint
const farCorner = (t: Tri): IJ => t.p.find((q) => MIDS.some((m) => m[0] === q[0] && m[1] === q[1])) as IJ;
// the side of an OTHER triangle that has the center at its middle
const centerSide = (t: Tri): [IJ, IJ] => {
  const e: [IJ, IJ][] = [[t.p[0], t.p[1]], [t.p[1], t.p[2]], [t.p[0], t.p[2]]];
  return e.find(([a, b]) => a[0] + b[0] === 0 && a[1] + b[1] === 0) as [IJ, IJ];
};

const edgesOf = (inside: Inside): [IJ, IJ][] => {
  const out: [IJ, IJ][] = [];
  for (let i = -5; i <= 5; i++)
    for (let j = -5; j <= 5; j++)
      if (inside(i, j))
        for (const [di, dj] of [[1, 0], [0, 1], [-1, 1]] as IJ[]) if (inside(i + di, j + dj)) out.push([[i, j], [i + di, j + dj]]);
  return out;
};
const HEX_EDGES = edgesOf(hexa);
const TRI4_EDGES = edgesOf(tri4);

type Map = (p: IJ) => Pt;
export const mk = (ox: number, oy: number, U: number): Map => (p) => [ox + U * (p[0] + p[1] / 2), oy - (U * p[1] * S3) / 2];
export const ptsOf = (t: Tri, T: Map) => t.p.map(T);
const poly = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');

// main hexagon placement (left half)
const HCX = 520;
const HCY = 505;
const HU = 185;
const HT = mk(HCX, HCY, HU);
const PX = 1000; // right panel x

// ---------- drawing pieces ----------

export const Base: React.FC<{ T: Map; kind?: 'hex' | 'tri'; op?: number; lines?: number }> = ({ T, kind = 'hex', op = 1, lines = 1 }) => {
  const E = kind === 'hex' ? HEX_EDGES : TRI4_EDGES;
  const V = kind === 'hex' ? HEX_VERTS : TRI4_VERTS;
  return (
    <g opacity={op}>
      <polygon points={poly(V.map(T))} fill="#fff" />
      {E.map(([a, b], k) => {
        const p = T(a);
        const q = T(b);
        return <line key={k} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={GRID} strokeWidth={3} opacity={lines} />;
      })}
      <polygon points={poly(V.map(T))} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

export const Pg: React.FC<{ pts: Pt[]; fill?: string; fo?: number; stroke?: string; w?: number; op?: number; dash?: string }> = ({ pts, fill, fo = 0.25, stroke, w = 7, op = 1, dash }) =>
  op <= 0.005 ? null : (
    <polygon points={poly(pts)} fill={fill ?? 'none'} fillOpacity={fo} stroke={stroke ?? 'none'} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" opacity={op} strokeDasharray={dash} />
  );

const Dot: React.FC<{ at: Pt; r?: number; color: string; s?: number; ring?: number }> = ({ at: a, r = 13, color, s = 1, ring = 0 }) =>
  s <= 0 ? null : (
    <g>
      {ring > 0 && <circle cx={a[0]} cy={a[1]} r={r * (1 + ring * 1.6)} fill="none" stroke={color} strokeWidth={5} opacity={1 - ring} />}
      <circle cx={a[0]} cy={a[1]} r={r * s} fill={color} stroke="#fff" strokeWidth={3} />
    </g>
  );

/** 0 -> 1 -> 0 flash. */
const bump = (f: number, start: number, dur: number) => {
  const p = (f - start) / dur;
  return p <= 0 || p >= 1 ? 0 : p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75;
};

/** Continuous position of a single outline hopping through n spots: spot k is left at t0 + k*step. */
const hopPos = (f: number, t0: number, step: number, d: number, n: number) => range(n - 1).reduce((a, k) => a + ease(f, t0 + k * step, d), 0);

/** ONE highlighted outline moving from spot to spot (rotating 60 degrees about the center, or sliding), faint ghosts left behind. */
const Slide: React.FC<{
  T: Map; tris: Tri[]; pos: number; mode: 'rot' | 'tr'; color: string; origin?: IJ; show?: number; w?: number;
  edge?: [IJ, IJ]; ghostStroke?: boolean; ghostFo?: number; outFo?: number;
}> = ({ T, tris, pos, mode, color, origin = [0, 0], show = 1, w = 9, edge, ghostStroke, ghostFo = 0.14, outFo = 0.2 }) => {
  const n = tris.length;
  const ghosts = tris.map((t, k) => (
    <Pg key={k} pts={ptsOf(t, T)} fill={color} fo={ghostFo} stroke={ghostStroke ? color : undefined} w={3} op={Math.max(0, Math.min(1, pos - k + 0.2)) * (k === n - 1 ? 0 : 1) * show} />
  ));
  let cur: React.ReactNode;
  if (mode === 'rot') {
    const o = T(origin);
    const ang = pos * 60;
    const e = edge ? edge.map(T) : null;
    cur = (
      <g transform={`rotate(${-ang} ${o[0]} ${o[1]})`} opacity={show}>
        <Pg pts={ptsOf(tris[0], T)} fill={color} fo={outFo} stroke={color} w={w} />
        {e && <line x1={e[0][0]} y1={e[0][1]} x2={e[1][0]} y2={e[1][1]} stroke={color} strokeWidth={w + 8} strokeLinecap="round" />}
      </g>
    );
  } else {
    const k0 = Math.min(n - 1, Math.floor(pos + 1e-6));
    const k1 = Math.min(n - 1, k0 + 1);
    const a = Math.min(1, Math.max(0, pos - k0));
    const A = ptsOf(tris[k0], T);
    const B = ptsOf(tris[k1], T);
    const pts = A.map((p, i): Pt => [p[0] + (B[i][0] - p[0]) * a, p[1] + (B[i][1] - p[1]) * a]);
    cur = <Pg pts={pts} fill={color} fo={outFo} stroke={color} w={w} op={show} />;
  }
  return <g>{ghosts}{cur}</g>;
};

const Counter: React.FC<{ x: number; y: number; n: number; color: string; label?: string; op?: number }> = ({ x, y, n, color, label, op = 1 }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, opacity: op, display: 'flex', alignItems: 'baseline', gap: 18, whiteSpace: 'nowrap', color }}>
      <span style={{ fontSize: 110, fontWeight: 900 }}>×{n}</span>
      {label && <span style={{ fontSize: 44, fontWeight: 800 }}>{label}</span>}
    </div>
  );

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number }> = ({ x, y, start, color, children, size = 40, w }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: w ? 'normal' : 'nowrap', width: w, textAlign: w ? 'center' : undefined, borderRadius: w ? 36 : 999 }}>
      {children}
    </Pill>
  );
};

const Note: React.FC<{ x: number; y: number; start: number; w?: number; color?: string; size?: number; children: React.ReactNode }> = ({ x, y, start, w = 880, color = C.ink, size = 46, children }) => {
  const f = useCurrentFrame();
  return (
    <Text x={x} y={y} w={w} size={size} weight={800} color={color} style={fadeUp(f, start)}>
      {children}
    </Text>
  );
};

const Tally: React.FC<{ y: number; label: string; tex: string; start: number; color?: string; strong?: boolean; x?: number }> = ({ y, label, tex, start, color = C.ink, strong, x = PX }) => {
  const f = useCurrentFrame();
  return <Row x={x} y={y} label={label} tex={tex} color={color} strong={strong} style={fadeUp(f, start)} />;
};

const Up: React.FC<{ s?: number; color?: string }> = ({ s = 34, color = C.primary }) => (
  <svg width={s} height={s * 0.9} viewBox="0 0 100 90" style={{ verticalAlign: 'middle' }}><polygon points="50,4 96,86 4,86" fill={color} /></svg>
);
const Down: React.FC<{ s?: number; color?: string }> = ({ s = 34, color = C.blue }) => (
  <svg width={s} height={s * 0.9} viewBox="0 0 100 90" style={{ verticalAlign: 'middle' }}><polygon points="4,4 96,4 50,86" fill={color} /></svg>
);

export const BLUE_D = '#2a63c4';

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const idx = [0, 5, 8, 13, 17, 22];
  const w0 = WEDGE[0];
  return (
    <>
      <Stage>
        <Base T={HT} op={ease(f, 2, 24)} lines={ease(f, 6, 24)} />
        {idx.map((k, n) => (
          <Pg key={k} pts={ptsOf(SMALL_HEX[k], HT)} fill={C.primary} fo={0.55} op={bump(f, at(scene, 0, 0.3 + n * 0.1), 22)} />
        ))}
        <Pg pts={ptsOf(w0, HT)} fill={C.violet} fo={0.2} stroke={C.violet} w={10} op={bump(f, at(scene, 1, 0.1), 50)} />
        <Pg pts={ptsOf(BIG_UP, HT)} fill={AMBER} fo={0.18} stroke={AMBER} w={11} op={bump(f, at(scene, 1, 0.5), 60)} />
      </Stage>
      <div style={{ position: 'absolute', left: PX, top: 190, ...fadeUp(f, at(scene, 0, 0.55)) }}>
        <div style={{ fontSize: 170, fontWeight: 900, color: GREEN_D, lineHeight: 1 }}>24</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: C.muted, marginTop: 6 }}>little triangles</div>
      </div>
      <Tag x={PX} y={470} start={at(scene, 1, 0.45)} color={C.violet} size={46}>bigger ones hide too</Tag>
      <div style={{ position: 'absolute', left: PX, top: 590, ...fadeUp(f, at(scene, 2, 0.2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['24', '30', '32', '36', '38'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const side = [HT([-2, 2]), HT([0, 2])]; // top side: two small edges
  const mid = HT([-1, 2]);
  const fillOp = ease(f, at(scene, 2, 0.25), 14) * fadeTo(f, at(scene, 3, 0.1), 0, 14);
  return (
    <>
      <Stage>
        <Base T={HT} />
        {SMALL_HEX.map((t, k) => (
          <Pg key={k} pts={ptsOf(t, HT)} fill={C.primary} fo={0.3} op={fillOp * ease(f, at(scene, 2, 0.1) + k * 2, 8)} />
        ))}
        <g opacity={ease(f, at(scene, 1, 0.45), 12)}>
          <line x1={side[0][0]} y1={side[0][1]} x2={side[1][0]} y2={side[1][1]} stroke={AMBER} strokeWidth={14} strokeLinecap="round" />
          <circle cx={mid[0]} cy={mid[1]} r={11} fill="#fff" stroke={AMBER} strokeWidth={6} />
        </g>
      </Stage>
      <Text x={mid[0] - 50} y={mid[1] - 90} w={100} size={64} weight={900} color={AMBER_D} align="center" style={{ opacity: ease(f, at(scene, 1, 0.55), 10) }}>2</Text>
      <div style={{ position: 'absolute', left: PX - 40, top: 150, width: 930, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>A regular hexagon has side length 2. </span>
        <span style={s(2)}>It's cut into 24 small equilateral triangles. </span>
        <span style={s(3)}>How many triangles of <Mark on={at(scene, 3, 0.5)}>any size</Mark> are in the figure?</span>
      </div>
      <Tag x={PX - 40} y={560} start={at(scene, 2, 0.4)} color={GREEN_D} size={44}>24 small</Tag>
      <Tag x={PX + 250} y={560} start={at(scene, 3, 0.5)} color={C.violet} size={44}>any size</Tag>
      <div style={{ position: 'absolute', left: PX - 40, top: 700, display: 'flex', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 4, 0.2 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '12px 24px', fontSize: 50, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 32, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const small = SMALL_HEX.find((t) => t.dir === 'up' && has(t, [0, 0]) && t.p[1][0] === 1 && t.p[1][1] === 0) as Tri;
  const small2 = HEX.find((t) => t.s === 1 && t.dir === 'down' && t.p[0][0] === 0 && t.p[0][1] === 1) as Tri;
  const two = UP2.find((t) => t.p[0][0] === -1 && t.p[0][1] === -1) as Tri;
  const o1 = ease(f, at(scene, 0, 0.3), 10) * fadeTo(f, at(scene, 1, 0.1), 0, 10);
  const o2 = ease(f, at(scene, 1, 0.25), 10) * fadeTo(f, at(scene, 2, 0.05), 0, 10);
  const o3 = ease(f, at(scene, 2, 0.15), 10);
  return (
    <>
      <Stage>
        <Base T={HT} />
        <g opacity={bump(f, at(scene, 0, 0.5), 60)}>
          <line x1={HT([-2, 2])[0]} y1={HT([-2, 2])[1]} x2={HT([0, 2])[0]} y2={HT([0, 2])[1]} stroke={AMBER} strokeWidth={14} strokeLinecap="round" />
          <circle cx={HT([-1, 2])[0]} cy={HT([-1, 2])[1]} r={11} fill="#fff" stroke={AMBER} strokeWidth={6} />
        </g>
        <Pg pts={ptsOf(small, HT)} fill={AMBER} fo={0.4} stroke={AMBER} w={10} op={o1} />
        <Pg pts={ptsOf(two, HT)} fill={C.violet} fo={0.2} stroke={C.violet} w={10} op={o2} />
        <Pg pts={ptsOf(small, HT)} fill={C.primary} fo={0.45} stroke={GREEN_D} w={9} op={o3} />
        <Pg pts={ptsOf(small2, HT)} fill={C.blue} fo={0.45} stroke={BLUE_D} w={9} op={o3} />
      </Stage>
      <Text x={HT([-1, 2])[0] - 140} y={HT([-1, 2])[1] - 82} w={280} size={52} weight={900} color={AMBER_D} align="center" style={{ opacity: bump(f, at(scene, 0, 0.5), 60), whiteSpace: 'nowrap' }}>2 small edges</Text>
      <Tag x={PX} y={200} start={at(scene, 0, 0.3)} color={AMBER_D} size={54}>side 1</Tag>
      <Tag x={PX} y={340} start={at(scene, 1, 0.25)} color={C.violet} size={54}>side 2</Tag>
      <Note x={PX + 250} y={355} w={600} start={at(scene, 1, 0.4)} color={C.muted} size={38}>= 4 small ones</Note>
      <div style={{ position: 'absolute', left: PX, top: 500, display: 'flex', flexDirection: 'column', gap: 34, opacity: o3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 56, fontWeight: 900, color: GREEN_D }}>
          <Up s={96} /> points up
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 56, fontWeight: 900, color: BLUE_D, ...fadeUp(f, at(scene, 2, 0.5)) }}>
          <Down s={96} /> points down
        </div>
      </div>
    </>
  );
};

const PAUSE_Q = <>A regular hexagon has side length 2. It's cut into 24 small equilateral triangles. How many triangles of any size are in the figure?</>;
const PAUSE_Q2 = <>This big triangle has side 4. It's cut into 16 small triangles. How many triangles of any size are in it?</>;

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = mk(390, 520, 150);
  return (
    <>
      <Stage><Base T={T} /></Stage>
      <div style={{ position: 'absolute', left: 770, top: 150, width: 650, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE_Q}</div>
      <Countdown scene={scene} seconds={10} x={1660} y={500} tick={TICK} />
    </>
  );
};

const Size1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // 4 rows of the hexagon, bottom to top
  const row = (t: Tri) => Math.min(...t.p.map((q) => q[1])) + 2;
  return (
    <>
      <Stage>
        <Base T={HT} />
        {SMALL_HEX.map((t, k) => (
          <Pg key={k} pts={ptsOf(t, HT)} fill={C.primary} fo={0.38} op={ease(f, at(scene, 1, 0.2) + (3 - row(t)) * 16, 10)} />
        ))}
      </Stage>
      <Tag x={PX} y={170} start={at(scene, 0, 0.5)} color={C.violet} size={50}>one size at a time</Tag>
      <Tally y={320} label="side 1" tex="24" start={at(scene, 1, 0.82)} color={GREEN_D} strong />
      <Row x={PX} y={440} label="side 2" tex="\; ?" color={C.muted} style={{ opacity: 0.4 }} />
      <Row x={PX} y={560} label="side 3" tex="\; ?" color={C.muted} style={{ opacity: 0.4 }} />
    </>
  );
};

const Size2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wPos = hopPos(f, at(scene, 1, 0.2), 20, 14, 6);
  const wShow = ease(f, at(scene, 0, 0.25), 10);
  const wCount = Math.floor(wPos + 0.5) + 1;
  const wFade = fadeTo(f, at(scene, 3), 0.25, 16);
  const oShow = ease(f, at(scene, 3, 0.3), 12);
  const oPos = hopPos(f, at(scene, 5, 0.22), 18, 14, 6);
  const oCount = Math.floor(oPos + 0.5) + 1;
  const o0 = OTHER[0];
  // side-midpoint dots appear as each outline lands
  const landed = (k: number) => (k === 0 ? ease(f, at(scene, 5, 0.1), 8) : ease(f, at(scene, 5, 0.22) + (k - 1) * 18 + 10, 8));
  const ring = (k: number) => bump(f, (k === 0 ? at(scene, 5, 0.1) : at(scene, 5, 0.22) + (k - 1) * 18 + 10), 24);
  const cDot = HT([0, 0]);
  const cPulse = bump(f, at(scene, 2, 0.1), 40);
  return (
    <>
      <Stage>
        <Base T={HT} />
        <g opacity={wFade}>
          <Slide T={HT} tris={WEDGE} pos={wPos} mode="rot" color={C.primary} show={wShow} ghostStroke />
        </g>
        <g opacity={oShow}>
          <Slide T={HT} tris={OTHER} pos={oPos} mode="rot" color={C.violet} edge={centerSide(o0)} show={1} />
        </g>
        {OTHER.map((t, k) => (
          <Dot key={k} at={HT(farCorner(t))} color={AMBER} s={landed(k)} ring={ring(k)} r={14} />
        ))}
        <Dot at={cDot} color={C.red} r={15} s={ease(f, at(scene, 1, 0.1), 8)} ring={cPulse} />
      </Stage>
      <Tally y={150} label="side 1" tex="24" start={4} color={GREEN_D} />
      <Counter x={PX} y={260} n={wCount} color={GREEN_D} label="pizza slices" op={ease(f, at(scene, 1, 0.2), 8) * (f < at(scene, 3) ? 1 : 0.3)} />
      {f < at(scene, 3, 0.05) && <Note x={PX} y={410} w={880} start={at(scene, 2, 0.1)} color={GREEN_D}>all touch the center with a corner</Note>}
      <Note x={PX} y={410} w={880} start={at(scene, 3, 0.1)} color={VIOLET_D} size={46}>
        {f >= at(scene, 4) ? 'the center is the middle of a side' : 'NO corner at the center'}
      </Note>
      <div style={{ opacity: ease(f, at(scene, 5, 0.1), 8) }}>
        <Counter x={PX} y={500} n={oCount} color={VIOLET_D} label="sneaky ones" />
      </div>
      <Tally y={690} label="side 2" tex="6 + 6 = 12" start={at(scene, 6, 0.4)} strong color={C.ink} />
    </>
  );
};

const Size3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const U = 125;
  const T = mk(520, 585, U);
  const dotS = (k: number) => pop(f, at(scene, 0, 0.45) + k * 6, 30);
  const baseA = T([-2, 0]);
  const baseB = T([2, 0]);
  const apex = T([-2, 4]);
  const lineOp = ease(f, at(scene, 3, 0.35), 12);
  const t4 = ease(f, at(scene, 3, 0.7), 30);
  const done = at(scene, 5, 0.97);
  const brX = 815;
  const y0 = T([0, 0])[1];
  const y2 = T([0, 2])[1];
  const y4 = T([0, 4])[1];
  return (
    <>
      <Stage>
        <Base T={T} />
        <Pg pts={ptsOf(BIG_DOWN, T)} fill={C.violet} fo={0.16} op={ease(f, at(scene, 2, 0.1), 10)} />
        <Pg pts={ptsOf(BIG_UP, T)} fill={AMBER} fo={0.16} op={ease(f, at(scene, 1, 0.1), 10)} />
        <polygon points={poly(ptsOf(BIG_UP, T))} fill="none" stroke={AMBER} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, at(scene, 1, 0.15), 40)} />
        <polygon points={poly(ptsOf(BIG_DOWN, T))} fill="none" stroke={C.violet} strokeWidth={10} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, at(scene, 2, 0.15), 40)} />
        {MIDS.map((m, k) => (
          <Dot key={k} at={T(m)} color={RED_D} s={dotS(k)} r={13} />
        ))}
        {/* side-4 demo, with its base on a long middle line */}
        <g opacity={fadeTo(f, at(scene, 5, 0.0), 0.25, 14)}>
          <line x1={baseA[0]} y1={baseA[1]} x2={baseB[0]} y2={baseB[1]} stroke={C.red} strokeWidth={14} strokeLinecap="round" opacity={lineOp} />
          <polyline
            points={poly([baseA, apex, baseB])}
            fill="none" stroke={C.red} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="22 14" opacity={t4}
          />
          <XMark at={[apex[0], apex[1] + 6]} size={70} opacity={ease(f, at(scene, 4, 0.5), 8)} />
          {/* rows above the middle line */}
          <g opacity={ease(f, at(scene, 4, 0.1), 12)} stroke={BLUE_D} strokeWidth={6} strokeLinecap="round">
            <line x1={brX} y1={y0} x2={brX} y2={y2} />
            <line x1={brX - 12} y1={y0} x2={brX + 12} y2={y0} />
            <line x1={brX - 12} y1={y2} x2={brX + 12} y2={y2} />
          </g>
          <g opacity={ease(f, at(scene, 4, 0.1), 12)} stroke={BLUE_D} strokeWidth={6} strokeLinecap="round">
            <line x1={brX} y1={y0} x2={brX} y2={T([0, -2])[1]} />
            <line x1={brX - 12} y1={T([0, -2])[1]} x2={brX + 12} y2={T([0, -2])[1]} />
          </g>
          <g opacity={ease(f, at(scene, 4, 0.45), 12)} stroke={RED_D} strokeWidth={6} strokeLinecap="round">
            <line x1={brX} y1={y2} x2={brX} y2={y4} />
            <line x1={brX - 12} y1={y4} x2={brX + 12} y2={y4} />
          </g>
        </g>
      </Stage>
      <Text x={brX + 24} y={(y0 + y2) / 2 - 26} w={260} size={44} weight={900} color={BLUE_D} style={{ opacity: ease(f, at(scene, 4, 0.1), 12), whiteSpace: 'nowrap' }}>2 rows</Text>
      <Text x={brX + 24} y={(y0 + T([0, -2])[1]) / 2 - 26} w={260} size={44} weight={900} color={BLUE_D} style={{ opacity: ease(f, at(scene, 4, 0.1), 12), whiteSpace: 'nowrap' }}>2 rows</Text>
      <Text x={brX + 24} y={(y2 + y4) / 2 - 26} w={260} size={44} weight={900} color={RED_D} style={{ opacity: ease(f, at(scene, 4, 0.45), 12), whiteSpace: 'nowrap' }}>outside!</Text>
      <Tally x={1060} y={150} label="side 1" tex="24" start={4} color={GREEN_D} />
      <Tally x={1060} y={250} label="side 2" tex="12" start={4} color={C.violet} />
      <Tally x={1060} y={350} label="side 3" tex="2" start={at(scene, 2, 0.7)} color={AMBER_D} />
      <Tag x={1060} y={460} start={at(scene, 3, 0.1)} color={C.red} size={44}>side 4: needs a long line</Tag>
      <div style={{ position: 'absolute', left: 1060, top: 570, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.3)) }}><Tex tex="24 + 12 + 2 = 38" size={62} color={C.green} /></div>
      <div style={{ position: 'absolute', left: 1060, top: 700, display: 'flex', gap: 14 }}>
        {CHOICES.map((c, i) => {
          const e = i === 4;
          return (
            <div key={c} style={{ ...fadeUp(f, at(scene, 5, 0.55) + i * 3, 10), background: e ? C.green : C.card, color: e ? '#fff' : C.ink, borderRadius: 16, padding: '8px 18px', fontSize: 44, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <span style={{ color: e ? '#d8ffe5' : C.muted, fontSize: 28, marginRight: 8 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      <Answer x={1740} y={290} value="38" start={done} chime={CHIME} />
      <Confetti x={1740} y={290} start={done} seed={5} />
    </>
  );
};

const Flip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const upSmall = SMALL_HEX.filter((t) => t.dir === 'up');
  const shade = (k: number) => ease(f, at(scene, 1, 0.1) + k * 5, 8);
  const pos2 = hopPos(f, at(scene, 2, 0.08), 15, 12, 6);
  const c2 = Math.floor(pos2 + 0.5) + 1;
  const bigOn = ease(f, at(scene, 2, 0.62), 12);
  const spin = ease(f, at(scene, 4, 0.2), 90);
  const rot = spin * 180;
  const o = HT([0, 0]);
  const s2show = ease(f, at(scene, 2, 0.05), 8);
  const done = at(scene, 5, 0.97);
  return (
    <>
      <Stage>
        <g transform={`rotate(${rot} ${o[0]} ${o[1]})`}>
          <Base T={HT} />
          {upSmall.map((t, k) => (
            <Pg key={k} pts={ptsOf(t, HT)} fill={C.primary} fo={0.5} op={shade(k)} />
          ))}
          <g opacity={fadeTo(f, at(scene, 4, 0.02), 0, 14)}>
            <Slide T={HT} tris={UP2} pos={pos2} mode="tr" color={C.violet} show={s2show} ghostFo={0.12} outFo={0.18} w={8} />
            <Pg pts={ptsOf(BIG_UP, HT)} fill={AMBER} fo={0.1} stroke={AMBER} w={11} op={bigOn} />
          </g>
        </g>
      </Stage>
      <Tag x={PX} y={150} start={at(scene, 0, 0.45)} color={C.primary} size={46}>
        count only <Up s={40} color="#fff" />
      </Tag>
      <Tally y={230} label="small" tex="12" start={at(scene, 1, 0.6)} color={GREEN_D} />
      <Tally y={315} label="side 2" tex={`${c2}`} start={at(scene, 2, 0.08)} color={VIOLET_D} />
      <Tally y={400} label="side 3" tex="1" start={at(scene, 2, 0.7)} color={AMBER_D} />
      <Tally y={490} label="all" tex="12 + 6 + 1 = 19" start={at(scene, 3, 0.35)} strong />
      <div style={{ position: 'absolute', left: PX + 288, top: 585, fontSize: 44, fontWeight: 900, color: BLUE_D, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.12)) }}>
        19 <Down s={44} /> too
      </div>
      <Tally y={655} label="double" tex="2 \times 19 = 38" start={at(scene, 5, 0.55)} strong />
      <Tag x={PX} y={765} start={at(scene, 6, 0.3)} color={C.violet} size={42}>use symmetry</Tag>
      <Answer x={1790} y={250} value="38" start={done} chime={CHIME} />
      <Confetti x={1790} y={250} start={done} seed={9} />
    </>
  );
};

const Thumb: React.FC<{ T: Map; kind: 'a' | 'b' | 'c' | 'd' | 'e'; op: number }> = ({ T, kind, op }) => (
  <g opacity={op}>
    <Base T={T} />
    {kind === 'a' && SMALL_HEX.map((t, k) => <Pg key={k} pts={ptsOf(t, T)} fill={C.primary} fo={0.3} />)}
    {kind === 'b' && WEDGE.map((t, k) => <Pg key={k} pts={ptsOf(t, T)} fill={k % 2 ? C.violet : C.primary} fo={0.3} stroke={k % 2 ? C.violet : C.primary} w={3} />)}
    {kind === 'c' && (
      <>
        {UP2.map((t, k) => <Pg key={k} pts={ptsOf(t, T)} fill={C.violet} fo={0.14} />)}
        <Pg pts={ptsOf(BIG_UP, T)} stroke={AMBER} w={4} />
        <Pg pts={ptsOf(BIG_DOWN, T)} stroke={AMBER} w={4} />
      </>
    )}
    {kind === 'd' && (
      <>
        <Pg pts={ptsOf(BIG_UP, T)} stroke={C.red} w={4} dash="10 8" />
        <Pg pts={ptsOf(BIG_DOWN, T)} stroke={C.red} w={4} dash="10 8" />
        <XMark at={T([0, 0])} size={50} opacity={1} />
      </>
    )}
    {kind === 'e' && (
      <>
        <Pg pts={ptsOf(BIG_UP, T)} fill={AMBER} fo={0.2} stroke={AMBER} w={4} />
        <Pg pts={ptsOf(BIG_DOWN, T)} fill={C.violet} fo={0.2} stroke={C.violet} w={4} />
      </>
    )}
  </g>
);

const TRAPS = [
  { l: 'A', v: '24', sum: '24', note: 'only the small ones', kind: 'a' as const, ok: false },
  { l: 'B', v: '30', sum: '24 + 6 = 30', note: 'only the 6 pizza slices', kind: 'b' as const, ok: false },
  { l: 'C', v: '32', sum: '24 + 6 + 2 = 32', note: 'side 2: one direction only', kind: 'c' as const, ok: false },
  { l: 'D', v: '36', sum: '24 + 12 = 36', note: 'forgot the 2 big ones', kind: 'd' as const, ok: false },
  { l: 'E', v: '38', sum: '24 + 12 + 2 = 38', note: 'every size, both ways', kind: 'e' as const, ok: true },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const RY = 140;
  const RH = 128;
  return (
    <>
      <Stage>
        {TRAPS.map((r, i) => {
          const st = at(scene, i);
          return <Thumb key={r.l} T={mk(1010, RY + i * RH + 57, 29)} kind={r.kind} op={ease(f, st + 14, 12)} />;
        })}
      </Stage>
      {TRAPS.map((r, i) => {
        const st = at(scene, i);
        const color = r.ok ? C.green : C.red;
        return (
          <div key={r.l}>
            <div style={{ position: 'absolute', left: 60, top: RY + i * RH, width: 1800, height: RH - 14, borderRadius: 22, background: r.ok ? 'rgba(33,196,93,0.14)' : 'rgba(239,67,67,0.07)', opacity: ease(f, st, 10) }} />
            <div style={{ position: 'absolute', left: 90, top: RY + i * RH + 16, display: 'flex', alignItems: 'center', gap: 16, fontSize: 64, fontWeight: 900, color: r.ok ? '#0f8f3d' : C.ink, ...fadeUp(f, st, 10) }}>
              <span style={{ color: C.muted, fontSize: 38 }}>{r.l}</span>
              {r.v}
            </div>
            <div style={{ position: 'absolute', left: 330, top: RY + i * RH + 22, whiteSpace: 'nowrap', ...fadeUp(f, st + 8, 10) }}>
              <Tex tex={r.sum} size={52} color={r.ok ? '#0f8f3d' : C.ink} />
            </div>
            <div style={{ position: 'absolute', left: 1160, top: RY + i * RH + 28, whiteSpace: 'nowrap', fontSize: 42, fontWeight: 800, color: r.ok ? '#0f8f3d' : RED_D, ...fadeUp(f, st + 12, 10) }}>
              {r.note}
            </div>
            <div style={{ position: 'absolute', left: 1800, top: RY + i * RH + 22, fontSize: 60, fontWeight: 900, color, ...fadeUp(f, st + 20, 10) }}>{r.ok ? '✓' : '✗'}</div>
          </div>
        );
      })}
    </>
  );
};

const VX = 150;
const VY = 810;
const VU = 185;
const VT = mk(VX, VY, VU);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Stage><Base T={VT} kind="tri" lines={ease(f, at(scene, 0, 0.5), 20)} /></Stage>
      <Pill x={PX - 40} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>Your turn</Pill>
      <div style={{ position: 'absolute', left: PX - 40, top: 230, width: 900, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>This big triangle has side 4. It's cut into 16 small triangles. </span>
        <span style={s(1)}>How many triangles of <Mark on={at(scene, 1, 0.4)}>any size</Mark> are in it?</span>
      </div>
      <Tag x={PX - 40} y={620} start={at(scene, 0, 0.55)} color={GREEN_D} size={44}>16 small</Tag>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = mk(110, 790, 150);
  return (
    <>
      <Stage><Base T={T} kind="tri" /></Stage>
      <div style={{ position: 'absolute', left: 770, top: 150, width: 650, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE_Q2}</div>
      <Countdown scene={scene} seconds={12} x={1660} y={500} tick={TICK} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const small = TRI4.filter((t) => t.s === 1);
  const rowOf = (t: Tri) => (t.dir === 'up' ? t.p[0][1] : t.p[0][1] - 1);
  const UP2V = byRow(pick(TRI4, 'up', 2));
  const DOWN2 = pick(TRI4, 'down', 2)[0];
  const UP3V = byRow(pick(TRI4, 'up', 3));
  const BIG4 = pick(TRI4, 'up', 4)[0];
  const sm = (t: Tri) => ease(f, at(scene, 0, 0.15) + rowOf(t) * 14, 10) * fadeTo(f, at(scene, 1), 0, 14);
  const p2 = hopPos(f, at(scene, 1, 0.1), 16, 12, 6);
  const c2 = Math.floor(p2 + 0.5) + 1;
  const sneakyOn = ease(f, at(scene, 1, 0.62), 10);
  const p3 = hopPos(f, at(scene, 2, 0.15), 22, 14, 3);
  const c3 = Math.floor(p3 + 0.5) + 1;
  const done = at(scene, 4, 0.97);
  const fade1 = fadeTo(f, at(scene, 2), 0, 12);
  const fade2 = fadeTo(f, at(scene, 3), 0.0, 12);
  return (
    <>
      <Stage>
        <Base T={VT} kind="tri" />
        {small.map((t, k) => <Pg key={k} pts={ptsOf(t, VT)} fill={C.primary} fo={0.38} op={sm(t)} />)}
        <g opacity={f < at(scene, 2) ? 1 : fade1}>
          <Slide T={VT} tris={UP2V} pos={p2} mode="tr" color={C.violet} show={ease(f, at(scene, 1, 0.08), 8) * fadeTo(f, at(scene, 2), 0, 12)} ghostFo={0.13} outFo={0.18} w={8} />
          <Pg pts={ptsOf(DOWN2, VT)} fill={AMBER} fo={0.3} stroke={AMBER} w={11} op={sneakyOn * fadeTo(f, at(scene, 2), 0, 12)} />
        </g>
        <g opacity={ease(f, at(scene, 2, 0.1), 8) * fade2}>
          <Slide T={VT} tris={UP3V} pos={p3} mode="tr" color={C.blue} ghostFo={0.14} outFo={0.2} w={9} />
        </g>
        <Pg pts={ptsOf(BIG4, VT)} fill={C.primary} fo={0.12} stroke={GREEN_D} w={11} op={ease(f, at(scene, 3, 0.1), 14)} />
      </Stage>
      <Tally y={130} label="side 1" tex="16" start={at(scene, 0, 0.55)} color={GREEN_D} />
      <Row x={PX} y={230} label="side 2" tex={f >= at(scene, 1, 0.62) ? '6 + 1 = 7' : `${c2}`} color={VIOLET_D} style={fadeUp(f, at(scene, 1, 0.1))} />
      <div style={{ position: 'absolute', left: PX + 640, top: 246, fontSize: 40, fontWeight: 800, color: VIOLET_D, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <Up s={40} color={C.violet} />
        {f >= at(scene, 1, 0.62) && <span style={{ color: AMBER_D }}> + <Down s={40} color={AMBER} /></span>}
      </div>
      <Row x={PX} y={330} label="side 3" tex={`${c3}`} color={BLUE_D} style={fadeUp(f, at(scene, 2, 0.15))} />
      <Tally y={430} label="side 4" tex="1" start={at(scene, 3, 0.2)} color={GREEN_D} />
      <div style={{ position: 'absolute', left: PX, top: 515, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.3)) }}><Tex tex="16 + 7 + 3 + 1 = 27" size={62} color={C.green} /></div>
      <Answer x={1560} y={735} value="27" start={done} chime={CHIME} />
      <Confetti x={1560} y={735} start={done} seed={21} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const items = [
    { t: 'size by size', c: C.primary, s: at(scene, 1, 0.1) },
    { t: 'up and down', c: C.violet, s: at(scene, 1, 0.55), icons: true },
    { t: 'symmetry can halve the work', c: AMBER_D, s: at(scene, 2, 0.15) },
  ];
  return (
    <>
      <div style={{ opacity: out }}>
        <Stage>
          <Base T={HT} op={out} />
          <Pg pts={ptsOf(BIG_UP, HT)} fill={AMBER} fo={0.14} stroke={AMBER} w={10} op={out * ease(f, at(scene, 1, 0.2), 14)} />
          <Pg pts={ptsOf(BIG_DOWN, HT)} fill={C.violet} fo={0.14} stroke={C.violet} w={10} op={out * ease(f, at(scene, 1, 0.6), 14)} />
        </Stage>
        <Text x={PX} y={150} w={800} size={60} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        {items.map((it, i) => (
          <div key={it.t} style={{ position: 'absolute', left: PX, top: 280 + i * 140, display: 'flex', alignItems: 'center', gap: 22, background: it.c === AMBER_D ? AMBER_D : it.c, color: '#fff', borderRadius: 32, padding: '14px 36px', fontSize: 52, fontWeight: 900, whiteSpace: 'nowrap', ...fadeUp(f, it.s) }}>
            {it.icons && <Up s={46} color="#fff" />}
            {it.t}
            {it.icons && <Down s={46} color="#fff" />}
          </div>
        ))}
      </div>
      <SignOff start={at(scene, 3, 0.1)} text="Keep hunting!" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  size1: Size1,
  size2: Size2,
  size3: Size3,
  flip: Flip,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

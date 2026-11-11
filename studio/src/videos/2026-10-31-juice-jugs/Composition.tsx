import { Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Choices, Confetti, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-31-juice-jugs';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const OR = '#ff8a1f';
export const ORB = '#e06d00';
export const ORT = '#d96b00'; // text orange
export const BL = '#9fd4ff';
export const BLB = '#5fb0ee';
const GR = '#eef0f6';
const GRB = '#d3d8e4';
export const COL_A = C.violet;
export const COL_B = '#0aa56b';

// ---------- geometry (base units, scaled by the wrapper) ----------
const PITCH = 80;
const BLK = 72;
const PAD = 20;
export const BODY_TOP = 90;
export const BH = 4 * PITCH + 2 * PAD; // 360
export const JX = { A: 0, B: 480 };
const JW = (cols: number) => cols * PITCH + 2 * PAD;
type Jug = 'A' | 'B';
type Loc = [Jug, number];
const slotXY = (j: Jug, slot: number, cols: number): [number, number] => [
  JX[j] + PAD + (slot % cols) * PITCH + 4,
  BODY_TOP + BH - PAD - (Math.floor(slot / cols) + 1) * PITCH + 4,
];

type Blk = { id: string; c: 'o' | 'b'; locs: Loc[] };
export type Win = [number, number];
export type Phases = { p1: Win; s1: Win; p2: Win; s2: Win };
export const NEVER: Win = [1e6, 1e6 + 1];
export const DONE: Win = [-200, -190];
export const T_START: Phases = { p1: NEVER, s1: NEVER, p2: NEVER, s2: NEVER };
export const T_END: Phases = { p1: DONE, s1: DONE, p2: DONE, s2: DONE };
const T_P1DONE: Phases = { p1: DONE, s1: DONE, p2: NEVER, s2: NEVER };

const L = (s: string): Loc => [s[0] as Jug, Number(s.slice(1))];
const blk = (id: string, c: 'o' | 'b', ...locs: string[]): Blk => ({ id, c, locs: locs.map(L) });
const same = (id: string, c: 'o' | 'b', s: string) => blk(id, c, s, s, s, s, s);

// Main puzzle: A 10 L water, B 10 L at 60%. 5 columns. locs = [start, after pour 1, after stir 1, after pour 2, after stir 2]
export const MAIN: Blk[] = [
  ...[0, 1, 2, 4, 5, 6, 7, 9].map((i) => same(`a${i}`, 'b', `A${i}`)),
  blk('a3', 'b', 'A3', 'A3', 'A10', 'B5', 'B3'),
  blk('a8', 'b', 'A8', 'A8', 'A12', 'B6', 'B6'),
  blk('b0', 'o', 'B0', 'B0', 'B0', 'B0', 'B1'),
  blk('b1', 'b', 'B1', 'B1', 'B1', 'B1', 'B0'),
  blk('b2', 'o', 'B2', 'B2', 'B2', 'B2', 'B4'),
  blk('b3', 'b', 'B3', 'B3', 'B3', 'B3', 'B2'),
  blk('b4', 'o', 'B4', 'B4', 'B4', 'B4', 'B8'),
  blk('b5', 'b', 'B5', 'A13', 'A13', 'B8', 'B7'),
  blk('b6', 'o', 'B6', 'A10', 'A3', 'A3', 'A3'),
  blk('b7', 'o', 'B7', 'A11', 'A8', 'A8', 'A8'),
  blk('b8', 'b', 'B8', 'A14', 'A14', 'B9', 'B9'),
  blk('b9', 'o', 'B9', 'A12', 'A11', 'B7', 'B5'),
];

// Variant: A 8 L water, B 8 L at 75%. 4 columns.
const VAR: Blk[] = [
  ...[0, 1, 3, 4, 5, 7].map((i) => same(`a${i}`, 'b', `A${i}`)),
  blk('a2', 'b', 'A2', 'A2', 'A8', 'B4', 'B3'),
  blk('a6', 'b', 'A6', 'A6', 'A10', 'B6', 'B4'),
  blk('b0', 'o', 'B0', 'B0', 'B0', 'B0', 'B1'),
  blk('b1', 'o', 'B1', 'B1', 'B1', 'B1', 'B2'),
  blk('b2', 'b', 'B2', 'B2', 'B2', 'B2', 'B0'),
  blk('b3', 'o', 'B3', 'B3', 'B3', 'B3', 'B5'),
  blk('b4', 'o', 'B4', 'A8', 'A2', 'A2', 'A2'),
  blk('b5', 'b', 'B5', 'A11', 'A11', 'B7', 'B7'),
  blk('b6', 'o', 'B6', 'A9', 'A9', 'B5', 'B6'),
  blk('b7', 'o', 'B7', 'A10', 'A6', 'A6', 'A6'),
];

const io = Easing.inOut(Easing.cubic);
const seg = (f: number, w: Win, d: number) => interpolate(f, [w[0] + d, w[1] + d], [0, 1], { ...clamp, easing: io });

type BlockState = { x: number; y: number; jug: Jug; moving: boolean };
const blockState = (b: Blk, f: number, T: Phases, cols: number): BlockState => {
  const wins = [T.p1, T.s1, T.p2, T.s2];
  let [x, y] = slotXY(b.locs[0][0], b.locs[0][1], cols);
  let jug: Jug = b.locs[0][0];
  let moving = false;
  for (let i = 0; i < 4; i++) {
    const a = b.locs[i];
    const z = b.locs[i + 1];
    const [ax, ay] = slotXY(a[0], a[1], cols);
    const [zx, zy] = slotXY(z[0], z[1], cols);
    const d = i % 2 === 0 ? (z[1] % cols) * 2 : 0;
    const p = seg(f, wins[i], d);
    if (p >= 1) {
      x = zx;
      y = zy;
      jug = z[0];
      continue;
    }
    if (p > 0) {
      const lift = a[0] !== z[0] ? Math.sin(p * Math.PI) * 90 : 0;
      x = ax + (zx - ax) * p;
      y = ay + (zy - ay) * p - lift;
      jug = p > 0.5 ? z[0] : a[0];
      moving = true;
    }
    break;
  }
  return { x, y, jug, moving };
};

// ---------- jugs ----------
const JugLabel: React.FC<{ j: Jug; op: number }> = ({ j, op }) => (
  <div style={{ position: 'absolute', left: JX[j], top: 0, width: 440, height: 76, borderRadius: 38, background: j === 'A' ? COL_A : COL_B, color: '#fff', fontSize: 64, fontWeight: 900, letterSpacing: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op }}>
    JUG {j}
  </div>
);

export const Jugs: React.FC<{
  ox: number; oy: number; s?: number; cols?: number; blocks: Blk[]; T: Phases;
  known?: { A: number; B: number }; labelOp?: number; fadeIn?: number; children?: React.ReactNode;
}> = ({ ox, oy, s = 1, cols = 5, blocks, T, known, labelOp = 1, fadeIn = 1, children }) => {
  const f = useCurrentFrame();
  const jw = (j: Jug) => (cols === 4 ? 360 : 440) + (j === 'B' ? 0 : 0);
  return (
    <div style={{ position: 'absolute', left: ox, top: oy, width: 920, height: 520, transform: `scale(${s})`, transformOrigin: '0 0', opacity: fadeIn }}>
      {(['A', 'B'] as Jug[]).map((j) => (
        <div key={j}>
          <JugLabel j={j} op={labelOp} />
          <div style={{ position: 'absolute', left: JX[j], top: BODY_TOP, width: JW(cols === 4 ? 5 : cols) , height: BH, boxSizing: 'border-box', border: `8px solid ${j === 'A' ? COL_A : COL_B}`, borderRadius: '16px 16px 40px 40px', background: 'rgba(255,255,255,0.75)' }} />
          {[1, 2, 3].map((r) => (
            <div key={r} style={{ position: 'absolute', left: JX[j] + 8, top: BODY_TOP + BH - PAD - r * PITCH - 2, width: JW(5) - 16, borderTop: `3px dashed ${GRB}` }} />
          ))}
        </div>
      ))}
      {blocks.map((b) => {
        const st = blockState(b, f, T, cols);
        const kn = known ? ease(f, known[st.jug], 14) : 1;
        return (
          <div key={b.id} style={{ position: 'absolute', left: st.x, top: st.y, width: BLK, height: BLK, zIndex: st.moving ? 6 : 2 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: GR, border: `4px solid ${GRB}`, boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: b.c === 'o' ? OR : BL, border: `4px solid ${b.c === 'o' ? ORB : BLB}`, boxSizing: 'border-box', opacity: kn }} />
          </div>
        );
      })}
      {children}
    </div>
  );
};
void (0 as unknown as number);

/** Dashed ring in wrapper coords. */
const Ring: React.FC<{ x: number; y: number; w: number; h: number; start: number; end?: number; color?: string }> = ({ x, y, w, h, start, end = 1e6, color = C.red }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 10) * fadeTo(f, end, 0, 10);
  if (o <= 0.01) return null;
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `7px dashed ${color}`, borderRadius: 20, opacity: o, zIndex: 9, boxSizing: 'border-box' }} />;
};
const rowRing = (j: Jug, row: number, cols: number, start: number, end?: number, color?: string) => {
  const [x, y] = slotXY(j, row * cols, cols);
  return <Ring x={x - 10} y={y - 8} w={cols * PITCH + 12} h={PITCH + 12} start={start} end={end} color={color} />;
};
export const JugGlow: React.FC<{ j: Jug; start: number; end?: number; color: string; cols?: number }> = ({ j, start, end = 1e6, color }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 10) * fadeTo(f, end, 0, 10);
  if (o <= 0.01) return null;
  return <div style={{ position: 'absolute', left: JX[j] - 14, top: -10, width: 468, height: BODY_TOP + BH + 20, borderRadius: 34, boxShadow: `0 0 0 8px ${color}`, opacity: o * (0.6 + 0.4 * Math.sin(f / 6)) }} />;
};

export const Swirl: React.FC<{ j: Jug; start: number; end: number }> = ({ j, start, end }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 6) * fadeTo(f, end - 6, 0, 6);
  if (o <= 0.01) return null;
  const cx = JX[j] + 220;
  const cy = BODY_TOP + BH / 2;
  return (
    <div style={{ position: 'absolute', left: cx - 100, top: cy - 100, width: 200, height: 200, opacity: o * 0.8, zIndex: 8, transform: `rotate(${f * 14}deg)` }}>
      <svg width={200} height={200} viewBox="-100 -100 200 200">
        <path d="M0 -70 A70 70 0 1 1 -70 0" fill="none" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
        <path d="M-92 -22 L-70 6 L-44 -20 Z" fill={C.ink} />
      </svg>
    </div>
  );
};

/** Curved arrow in wrapper coords; draws on from `start`. */
export const Arc: React.FC<{ from: number; to: number; y0: number; peak: number; start: number; end?: number; label?: string; labelOp?: number }> = ({ from, to, y0, peak, start, end = 1e6, label, labelOp = 1 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 18);
  const vis = fadeTo(f, end, 0, 10);
  const mid = (from + to) / 2;
  const dir = peak < y0 ? 1 : -1; // head points down for top arcs
  const ey = y0;
  const head = p > 0.95 ? 1 : 0;
  const midY = (y0 + peak) / 2;
  return (
    <div style={{ opacity: vis }}>
      <svg width={920} height={10} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`M ${from} ${y0} Q ${mid} ${peak} ${to} ${ey}`} fill="none" stroke={C.ink} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d={`M ${to - 24} ${ey - 30 * dir} L ${to} ${ey} L ${to + 24} ${ey - 30 * dir} Z`} fill={C.ink} opacity={head} />
      </svg>
      {label && (
        <div style={{ position: 'absolute', left: mid - 140, top: midY + (peak < y0 ? -78 : 8), width: 280, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.ink, opacity: labelOp * p }}>{label}</div>
      )}
    </div>
  );
};

// ---------- small shared bits ----------
export const Legend: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  const sq = (c: string, b: string) => <div style={{ width: 40, height: 40, borderRadius: 10, background: c, border: `4px solid ${b}`, boxSizing: 'border-box' }} />;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, fontSize: 44, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      {sq(OR, ORB)} juice {sq(BL, BLB)} water <span style={{ color: C.muted }}>1 block = 1 L</span>
    </div>
  );
};

const Eq: React.FC<{ x: number; y: number; start: number; end?: number; tex: string; size?: number; color?: string }> = ({ x, y, start, end = 1e6, tex, size = 54, color = C.ink }) => {
  const f = useCurrentFrame();
  if (f >= end + 10) return null;
  const u = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...u, opacity: Number(u.opacity) * fadeTo(f, end, 0, 10) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 44 }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: 'nowrap' }}>
      {children}
    </Pill>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

const Badge: React.FC<{ x: number; y: number; value: string; start: number; chimeAt: number }> = ({ x, y, value, start, chimeAt }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  return (
    <>
      <Sequence from={chimeAt} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.25} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 120, top: y - 120, width: 240, height: 240, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};
const lineEnd = (scene: { lines: { from: number; frames: number }[] }, i: number) => scene.lines[i].from + scene.lines[i].frames - 6;

// ---------- tracking table ----------
type Cell = { t: string; s: number } | null;
type TRow = { label: string; s: number; cells: Cell[] };
const TX = 965;
const TY = 130;
const Table: React.FC<{ hdr: number; rows: TRow[] }> = ({ hdr, rows }) => {
  const f = useCurrentFrame();
  const cx = (c: number) => TX + 295 + c * 150;
  return (
    <>
      <div style={{ position: 'absolute', left: cx(0) + 4, top: TY, width: 292, height: 70, borderRadius: 35, background: COL_A, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, hdr, 12) }}>JUG A</div>
      <div style={{ position: 'absolute', left: cx(2) + 4, top: TY, width: 292, height: 70, borderRadius: 35, background: COL_B, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, hdr, 12) }}>JUG B</div>
      {['drink', 'juice', 'drink', 'juice'].map((h, c) => (
        <div key={c} style={{ position: 'absolute', left: cx(c), top: TY + 76, width: 150, textAlign: 'center', fontSize: 44, fontWeight: 800, color: c % 2 ? ORT : C.muted, opacity: ease(f, hdr + 4, 12) }}>{h}</div>
      ))}
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ position: 'absolute', left: TX, top: TY + 128 + i * 92, width: 895, height: 84, borderRadius: 22, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', ...fadeUp(f, r.s) }} />
          <div style={{ position: 'absolute', left: TX + 20, top: TY + 128 + i * 92, height: 84, display: 'flex', alignItems: 'center', fontSize: 44, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap', ...fadeUp(f, r.s) }}>{r.label}</div>
          {r.cells.map((c, k) =>
            c ? (
              <div key={k} style={{ position: 'absolute', left: cx(k), top: TY + 128 + i * 92, width: 150, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, color: k % 2 ? ORT : C.ink, whiteSpace: 'nowrap', ...fadeUp(f, c.s, 10) }}>{c.t}</div>
            ) : null,
          )}
        </div>
      ))}
    </>
  );
};

const NOTE_X = TX;
const J1 = { ox: 20, oy: 130 };

// ---------- scenes ----------
const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const oy = 200;
  return (
    <>
      <Jugs ox={20} oy={oy} blocks={MAIN} T={T_START} fadeIn={ease(f, 2, 12)}>
        <Arc from={JX.B + 220} to={JX.A + 220} y0={-6} peak={-170} start={at(scene, 0, 0.1)} />
        <Arc from={JX.A + 220} to={JX.B + 220} y0={BODY_TOP + BH + 30} peak={BODY_TOP + BH + 170} start={at(scene, 0, 0.55)} />
      </Jugs>
      <div style={{ position: 'absolute', left: 1000, top: oy - 40, fontSize: 230, fontWeight: 900, color: C.violet, ...fadeUp(f, at(scene, 1, 0.1)) }}>?</div>
      <Tag x={1150} y={250} start={at(scene, 0, 0.1)} color={COL_B} size={48}>pour B → A</Tag>
      <Tag x={1150} y={350} start={at(scene, 0, 0.35)} color={C.violet} size={48}>stir</Tag>
      <Tag x={1150} y={450} start={at(scene, 0, 0.55)} color={COL_A} size={48}>pour back A → B</Tag>
      <Tag x={1150} y={560} start={at(scene, 1, 0.55)} color={C.red} size={48}>Kids mix up the jugs!</Tag>
      <div style={{ position: 'absolute', left: 1150, top: 660, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CH = ['20', '30', '40', '45', '60'];
const QS = 0.8;

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const oy = 270;
  const ox = 1130;
  const capY = oy + (BODY_TOP + BH + 12) * QS;
  const cAx = ox + 220 * QS;
  const cBx = ox + (JX.B + 220) * QS;
  return (
    <>
      <Jugs ox={ox} oy={oy} s={QS} blocks={MAIN} T={T_START} fadeIn={ease(f, at(scene, 1, 0), 10)}>
        <Arc from={JX.B + 220} to={JX.A + 220} y0={-6} peak={-170} start={at(scene, 3, 0.2)} end={at(scene, 5, 0.3)} label="5 L" labelOp={1} />
        <Swirl j="A" start={at(scene, 3, 0.55)} end={at(scene, 3, 1)} />
        <Arc from={JX.A + 220} to={JX.B + 220} y0={BODY_TOP + BH + 100} peak={BODY_TOP + BH + 200} start={at(scene, 4, 0.2)} end={at(scene, 5, 0.3)} label="5 L" />
      </Jugs>
      <Text x={cAx} y={capY} w={420} size={46} weight={900} color={COL_A} align="center" style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.55)) }}>10 L water</Text>
      <Text x={cBx} y={capY} w={420} size={46} weight={900} color={COL_B} align="center" style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.75)) }}>10 L, 60% juice</Text>
      <Text x={cBx} y={capY + 62} w={420} size={54} weight={900} color={C.violet} align="center" style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.55)) }}>? % juice</Text>
      <div style={{ position: 'absolute', left: 50, top: 130, width: 980, background: C.card, borderRadius: 32, padding: '28px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>Jug A holds 10 liters of water. </span>
        <span style={s(2)}>Jug B holds 10 liters of a drink that is 60% juice. </span>
        <span style={s(3)}>5 liters are poured from jug B into jug A and stirred. </span>
        <span style={s(4)}>Then 5 liters are poured from jug A back into jug B. </span>
        <span style={s(5)}>What percent of the drink in jug B is now juice?</span>
      </div>
      <Choices x={50} y={700} start={(i) => at(scene, 6, 0.2 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={`${c}\\%`} size={48} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sw = ease(f, at(scene, 1, 0.1), 10);
  return (
    <>
      <Jugs ox={50} oy={170} s={QS} blocks={MAIN} T={T_START}>
        <JugGlow j="B" start={at(scene, 2, 0.4)} color={COL_B} />
      </Jugs>
      <Tag x={880} y={170} start={at(scene, 0, 0.15)} color={COL_B} size={50}>1st: pour B → A</Tag>
      <Tag x={880} y={270} start={at(scene, 0, 0.55)} color={COL_A} size={50}>2nd: pour A → B</Tag>
      <div style={{ position: 'absolute', left: 880, top: 390, opacity: sw, transform: `rotate(${f * 6}deg)`, transformOrigin: '50px 50px', width: 100, height: 100 }}>
        <svg width={100} height={100} viewBox="-50 -50 100 100">
          <path d="M0 -34 A34 34 0 1 1 -34 0" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <path d="M-46 -10 L-34 4 L-20 -10 Z" fill={C.ink} />
        </svg>
      </div>
      <Text x={1010} y={400} w={850} size={44} weight={900} style={{ opacity: sw, whiteSpace: 'nowrap' }}>stirred = evenly mixed</Text>
      <Eq x={880} y={560} start={at(scene, 2, 0.15)} size={56} tex={'\\text{goal: }\\dfrac{\\text{juice in B}}{\\text{drink in B}}'} />
    </>
  );
};

const Pause: React.FC<{ scene: Parameters<SceneComponent>[0]['scene']; blocks: Blk[]; cols: number; lines: string[] }> = ({ scene, blocks, cols, lines }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Jugs ox={20} oy={190} s={QS} cols={cols} blocks={blocks} T={T_START} />
      <div style={{ position: 'absolute', left: 800, top: 170, width: 640, background: C.card, borderRadius: 28, padding: '22px 36px', fontSize: 44, fontWeight: 700, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <Countdown scene={scene} seconds={scene.frames > 400 && blocks === VAR ? 12 : 10} x={1660} y={500} tick={TICK} />
    </>
  );
};
const Pause1: SceneComponent = ({ scene }) => (
  <Pause scene={scene} blocks={MAIN} cols={5} lines={['Jug A: 10 L of water', 'Jug B: 10 L, 60% juice', 'Pour 5 L B → A, stir', 'Pour 5 L A → B', 'What % of B is juice?']} />
);
const Pause2: SceneComponent = ({ scene }) => (
  <Pause scene={scene} blocks={VAR} cols={4} lines={['Jug A: 8 L of water', 'Jug B: 8 L, 75% juice', 'Pour 4 L B → A, stir', 'Pour 4 L A → B', 'What % of B is juice?']} />
);

const Liters: SceneComponent = ({ scene }) => {
  return (
    <>
      <Jugs {...J1} blocks={MAIN} T={T_START} />
      <Table
        hdr={at(scene, 0, 0.5)}
        rows={[{ label: 'Start', s: at(scene, 1, 0), cells: [{ t: '10 L', s: at(scene, 1, 0.03) }, { t: '0 L', s: at(scene, 1, 0.14) }, { t: '10 L', s: at(scene, 1, 0.5) }, { t: '6 L', s: at(scene, 1, 0.82) }] }]}
      />
      <Legend x={TX} y={545} start={at(scene, 0, 0.6)} />
      <Tag x={NOTE_X} y={620} start={at(scene, 0, 0.35)} color={C.violet} size={46}>count liters, not percents</Tag>
      <Eq x={NOTE_X} y={720} start={at(scene, 1, 0.55)} tex={'60\\%\\text{ of }10 = 6\\text{ L}'} />
    </>
  );
};

const START_ROW = (s: number): TRow => ({ label: 'Start', s, cells: [{ t: '10 L', s }, { t: '0 L', s }, { t: '10 L', s }, { t: '6 L', s }] });

const Pour1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fly = at(scene, 1, 0.08);
  const T: Phases = { p1: [fly, fly + 36], s1: [at(scene, 2, 0), at(scene, 2, 0) + 24], p2: NEVER, s2: NEVER };
  return (
    <>
      <Jugs {...J1} blocks={MAIN} T={T}>
        {rowRing('B', 1, 5, at(scene, 0, 0.3), fly + 4, COL_B)}
        <Swirl j="A" start={T.s1[0]} end={T.s1[1] + 6} />
      </Jugs>
      <Table
        hdr={-50}
        rows={[
          START_ROW(-50),
          { label: 'After pour 1', s: at(scene, 2, 0.1), cells: [{ t: '15 L', s: at(scene, 2, 0.15) }, { t: '3 L', s: at(scene, 2, 0.55) }, { t: '5 L', s: at(scene, 3, 0.1) }, { t: '3 L', s: at(scene, 3, 0.7) }] },
        ]}
      />
      <Legend x={TX} y={545} start={-50} />
      <Eq x={NOTE_X} y={600} start={at(scene, 0, 0.55)} tex={'5\\text{ of }10 = \\dfrac{1}{2}\\text{ of B}'} />
      <Eq x={NOTE_X} y={700} start={at(scene, 1, 0.55)} tex={'\\dfrac{1}{2}\\text{ of }6 = 3\\text{ L juice}'} />
      <div style={{ position: 'absolute', left: 20, top: 595, width: 460, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.3)) }}>
        <Tex tex={'\\dfrac{3}{15} = \\dfrac{1}{5} = 20\\%'} size={56} color={COL_A} />
      </div>
    </>
  );
};

const Pour2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fly = at(scene, 1, 0.12);
  const T: Phases = { p1: DONE, s1: DONE, p2: [fly, fly + 36], s2: [at(scene, 2, 0), at(scene, 2, 0) + 24] };
  const C_ = 2;
  return (
    <>
      <Jugs {...J1} blocks={MAIN} T={T}>
        {rowRing('A', 3, 5, at(scene, 0, 0.3), fly + 4, COL_A)}
        <Swirl j="B" start={T.s2[0]} end={T.s2[1] + 6} />
      </Jugs>
      <Table
        hdr={-50}
        rows={[
          START_ROW(-50),
          { label: 'After pour 1', s: -50, cells: [{ t: '15 L', s: -50 }, { t: '3 L', s: -50 }, { t: '5 L', s: -50 }, { t: '3 L', s: -50 }] },
          { label: 'After pour 2', s: at(scene, 2, 0.05), cells: [null, null, { t: '10 L', s: at(scene, 2, 0.2) }, { t: '4 L', s: at(scene, 2, 0.8) }] },
        ]}
      />
      <Legend x={TX} y={545} start={-50} />
      <Eq x={NOTE_X} y={600} start={at(scene, 0, 0.55)} end={at(scene, 3, 0)} tex={'5\\text{ of }15 = \\dfrac{1}{3}\\text{ of A}'} />
      <Eq x={NOTE_X} y={700} start={at(scene, 1, 0.5)} end={at(scene, 3, 0)} tex={'\\dfrac{1}{3}\\text{ of }3 = 1\\text{ L juice}'} />
      <div style={{ position: 'absolute', left: JX.B + 20, top: 595, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 3, 0.5)) }}>
        <Tex tex={'\\dfrac{4}{10} = 40\\%'} size={60} color={COL_B} />
      </div>
      <Badge x={1730} y={730} value="40%" start={at(scene, 3, 0.55)} chimeAt={lineEnd(scene, 3)} />
      <Confetti x={1730} y={730} start={at(scene, 3, 0.55)} seed={5} />
      <div style={{ position: 'absolute', left: 20, top: 760, display: 'flex', gap: 18, ...fadeUp(f, at(scene, 3, 0.7)) }}>
        {CH.map((c, i) => (
          <div key={c} style={{ background: i === C_ ? C.green : C.card, color: i === C_ ? '#fff' : C.ink, borderRadius: 18, padding: '8px 22px', fontSize: 44, fontWeight: 800, opacity: i === C_ ? 1 : 0.55, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ fontSize: 44, marginRight: 8, opacity: 0.8 }}>{'ABCDE'[i]}</span>{c}%
          </div>
        ))}
      </div>
    </>
  );
};

const Keep: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const known = { A: at(scene, 1, 0.1), B: at(scene, 4, 0.5) };
  return (
    <>
      <Jugs {...J1} blocks={MAIN} T={T_END} known={known}>
        <JugGlow j="A" start={at(scene, 1, 0.1)} end={at(scene, 3, 0.3)} color={COL_A} />
        <div style={{ position: 'absolute', left: 0, top: BODY_TOP + BH + 24, width: 920, height: 22, borderLeft: `8px solid ${ORT}`, borderRight: `8px solid ${ORT}`, borderBottom: `8px solid ${ORT}`, borderRadius: '0 0 16px 16px', boxSizing: 'border-box', opacity: ease(f, at(scene, 0, 0.55), 12) }} />
      </Jugs>
      <Text x={480} y={J1.oy + BODY_TOP + BH + 56} w={920} size={54} weight={900} color={ORT} align="center" style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.6)) }}>6 L juice in all</Text>
      <Eq x={TX} y={150} start={at(scene, 2, 0.1)} tex={'\\text{Jug A: }20\\%\\text{ juice}'} color={COL_A} />
      <Eq x={TX} y={250} start={at(scene, 2, 0.65)} tex={'15 - 5 = 10\\text{ L}'} color={COL_A} />
      <Eq x={TX} y={350} start={at(scene, 3, 0.45)} tex={'20\\%\\text{ of }10 = 2\\text{ L}'} />
      <Eq x={TX} y={450} start={at(scene, 4, 0.3)} tex={'6 - 2 = 4\\text{ L in B}'} color={COL_B} />
      <Eq x={TX} y={550} start={at(scene, 4, 0.8)} tex={'\\dfrac{4}{10} = 40\\%'} size={62} color={COL_B} />
      <Tag x={TX} y={740} start={at(scene, 5, 0.4)} color={C.violet} size={46}>find the easy jug, subtract</Tag>
    </>
  );
};

type TrapRow = { letter: string; val: string; start: number; end: number; body: React.ReactNode; ok?: boolean };

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows: TrapRow[] = [
    { letter: 'A', val: '20%', start: at(scene, 0, 0.3), end: 0, body: <span style={{ fontSize: 42 }}>right number, <b style={{ color: COL_A }}>wrong jug</b></span> },
    { letter: 'B', val: '30%', start: at(scene, 2, 0.3), end: 0, body: <><Tex tex={'3 \\div 10 = 30\\%'} size={50} /> <span style={{ fontSize: 44, color: C.red }}>forgot 1 L</span></> },
    { letter: 'C', val: '40%', start: at(scene, 7, 0.1), end: 0, ok: true, body: <span style={{ fontSize: 42 }}>every liter counted</span> },
    { letter: 'D', val: '45%', start: at(scene, 4, 0.3), end: 0, body: <><Tex tex={'(30+60)\\div 2 = 45'} size={50} /> <span style={{ fontSize: 44, color: C.red }}>averaging %</span></> },
    { letter: 'E', val: '60%', start: at(scene, 6, 0.3), end: 0, body: <span style={{ fontSize: 42 }}>where B <b style={{ color: COL_B }}>started</b></span> },
  ];
  return (
    <>
      <Jugs ox={20} oy={170} s={QS} blocks={MAIN} T={T_END}>
        <JugGlow j="A" start={at(scene, 0, 0.5)} end={at(scene, 2, 0)} color={COL_A} />
        <Ring x={slotXY('B', 5, 5)[0] - 8} y={slotXY('B', 5, 5)[1] - 8} w={BLK + 16} h={BLK + 16} start={at(scene, 3, 0.1)} end={at(scene, 4, 0)} color={C.red} />
        <JugGlow j="B" start={at(scene, 7, 0.2)} color={C.green} />
      </Jugs>
      {f >= at(scene, 3, 0.1) && f < at(scene, 4, 0) && (
        <Text x={40 + (JX.B + 20) * QS} y={170 + (BODY_TOP + BH + 14) * QS} w={460} size={44} weight={900} color={C.red} style={{ whiteSpace: 'nowrap' }}>the 1 L that came back</Text>
      )}
      {rows.map((r, i) => {
        const bad = !r.ok;
        return (
          <div key={r.letter} style={{ position: 'absolute', left: 800, top: 140 + i * 118, width: 1080, height: 102, borderRadius: 22, background: C.card, borderLeft: `12px solid ${bad ? C.red : C.green}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 28px', boxShadow: '0 6px 22px rgba(30,40,80,0.08)', fontWeight: 800, whiteSpace: 'nowrap', ...fadeUp(f, i === 2 ? r.start : r.start - 6) }}>
            <div style={{ background: bad ? C.red : C.green, color: '#fff', borderRadius: 16, padding: '4px 20px', fontSize: 50, fontWeight: 900, minWidth: 190, textAlign: 'center' }}>{r.letter} {r.val}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>{r.body}</div>
          </div>
        );
      })}
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Jugs ox={20} oy={190} s={QS} cols={4} blocks={VAR} T={T_START} />
      <Text x={880} y={170} w={1000} size={52} weight={900} color={COL_A} style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.5)) }}>Jug A: 8 L water</Text>
      <Text x={880} y={260} w={1000} size={52} weight={900} color={COL_B} style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.3)) }}>Jug B: 8 L, 75% juice</Text>
      <Tag x={880} y={400} start={at(scene, 2, 0.15)} color={COL_B} size={48}>4 L  B → A, stir</Tag>
      <Tag x={880} y={500} start={at(scene, 2, 0.4)} color={COL_A} size={48}>4 L  A → B</Tag>
      <Tag x={880} y={620} start={at(scene, 2, 0.85)} color={C.violet} size={54}>? % juice in B</Tag>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fly1 = at(scene, 1, 0.45);
  const fly2 = at(scene, 3, 0.5);
  const T: Phases = { p1: [fly1, fly1 + 36], s1: [at(scene, 2, 0), at(scene, 2, 0) + 24], p2: [fly2, fly2 + 36], s2: [at(scene, 4, 0), at(scene, 4, 0) + 24] };
  const done = at(scene, 5, 0.5);
  return (
    <>
      <Jugs {...J1} cols={4} blocks={VAR} T={T}>
        {rowRing('B', 1, 4, at(scene, 1, 0.1), fly1 + 4, COL_B)}
        {rowRing('A', 2, 4, at(scene, 3, 0.1), fly2 + 4, COL_A)}
        <Swirl j="A" start={T.s1[0]} end={T.s1[1] + 6} />
        <Swirl j="B" start={T.s2[0]} end={T.s2[1] + 6} />
      </Jugs>
      <Table
        hdr={4}
        rows={[
          { label: 'Start', s: at(scene, 0, 0.3), cells: [{ t: '8 L', s: at(scene, 0, 0.4) }, { t: '0 L', s: at(scene, 0, 0.5) }, { t: '8 L', s: at(scene, 0, 0.6) }, { t: '6 L', s: at(scene, 0, 0.88) }] },
          { label: 'After pour 1', s: at(scene, 2, 0.1), cells: [{ t: '12 L', s: at(scene, 2, 0.35) }, { t: '3 L', s: at(scene, 2, 0.8) }, { t: '4 L', s: at(scene, 2, 0.95) }, { t: '3 L', s: at(scene, 2, 0.95) }] },
          { label: 'After pour 2', s: at(scene, 4, 0.05), cells: [null, null, { t: '8 L', s: at(scene, 4, 0.25) }, { t: '4 L', s: at(scene, 4, 0.9) }] },
        ]}
      />
      <Legend x={TX} y={545} start={4} />
      <Eq x={NOTE_X} y={600} start={at(scene, 0, 0.5)} end={at(scene, 1, 0.1)} tex={'75\\%\\text{ of }8 = 6\\text{ L}'} />
      <Eq x={NOTE_X} y={600} start={at(scene, 1, 0.1)} end={at(scene, 3, 0.1)} tex={'4\\text{ of }8 = \\dfrac{1}{2}\\text{ of B}'} />
      <Eq x={NOTE_X} y={700} start={at(scene, 1, 0.6)} end={at(scene, 3, 0.1)} tex={'\\dfrac{1}{2}\\text{ of }6 = 3\\text{ L juice}'} />
      <Eq x={NOTE_X} y={600} start={at(scene, 3, 0.1)} end={at(scene, 4, 0.65)} tex={'4\\text{ of }12 = \\dfrac{1}{3}\\text{ of A}'} />
      <Eq x={NOTE_X} y={700} start={at(scene, 3, 0.6)} end={at(scene, 4, 0.65)} tex={'\\dfrac{1}{3}\\text{ of }3 = 1\\text{ L juice}'} />
      <Eq x={NOTE_X} y={600} start={at(scene, 4, 0.7)} tex={'3 + 1 = 4\\text{ L}'} />
      <div style={{ position: 'absolute', left: 20, top: 595, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.8)) }}>
        <Tex tex={'\\dfrac{3}{12} = \\dfrac{1}{4}'} size={56} color={COL_A} />
      </div>
      <div style={{ position: 'absolute', left: JX.B + 20, top: 595, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.5)) }}>
        <Tex tex={'\\dfrac{4}{8} = 50\\%'} size={60} color={COL_B} />
      </div>
      <Badge x={1730} y={730} value="50%" start={done} chimeAt={lineEnd(scene, 5)} />
      <Confetti x={1730} y={730} start={done} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  return (
    <>
      <Fade op={out}>
        <Jugs ox={20} oy={190} s={QS} blocks={MAIN} T={T_START}>
          {rowRing('B', 1, 5, at(scene, 2, 0.1), undefined, COL_B)}
        </Jugs>
        <Text x={880} y={150} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <Tag x={880} y={260} start={at(scene, 1, 0.3)} color={C.green} size={50}>count liters, not percents</Tag>
        <Tag x={880} y={400} start={at(scene, 2, 0.15)} color={C.violet} size={46}>a part of the jug moves</Tag>
        <div style={{ position: 'absolute', left: 900, top: 480, ...fadeUp(f, at(scene, 2, 0.4)) }}>
          <svg width={80} height={90} viewBox="0 0 80 90"><path d="M40 5 V70 M15 48 L40 78 L65 48" stroke={C.violet} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <Tag x={880} y={590} start={at(scene, 2, 0.5)} color={ORT} size={46}>the same part of its juice moves</Tag>
      </Fade>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  liters: Liters,
  pour1: Pour1,
  pour2: Pour2,
  keep: Keep,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + the two jugs at the start (A water, B 60% juice), no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Think it's", <span style={{ color: C.red }}>60%?</span>]}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
      <div style={{ position: 'relative', width: 662, height: 374 }}>
        <Jugs ox={0} oy={0} s={0.72} blocks={MAIN} T={T_START} />
      </div>
      <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 44px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap' }}>% juice in B?</div>
    </div>
  </ThumbFrame>
);

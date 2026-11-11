import { staticFile, useCurrentFrame } from 'remotion';
import { Audio, Sequence } from 'remotion';
import { clamp, ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Confetti, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';
import { NUNITO } from '../../lib/fonts';

export const SLUG = '2026-11-07-incircle-cevians';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GREEN = C.primary; // AP, tangent x
const PURP = C.violet; // PD, tangent y
const AMB = '#f59e0b'; // tangent z
const RED = C.red;
const GRAY = '#6b7280';
const PX = 1010; // right panel x

type V = [number, number];
type Geo = { A: V; B: V; C: V; I: V; D: V; E: V; F: V; P: V; G: V; r: number; U: number; ox: number; oy: number };
const MAIN: Geo = {
  A: [5, 12], B: [0, 0], C: [14, 0], I: [6, 4], D: [6, 0], E: [9.2, 6.4], F: [30 / 13, 72 / 13],
  P: [414 / 73, 288 / 73], G: [394 / 35, 128 / 35], r: 4, U: 46, ox: 290, oy: 745,
};
const VAR: Geo = {
  A: [0, 3], B: [0, 0], C: [4, 0], I: [1, 1], D: [1, 0], E: [1.6, 1.8], F: [0, 1],
  P: [8 / 11, 9 / 11], G: [0, 0], r: 1, U: 140, ox: 290, oy: 760,
};
const px = (g: Geo, p: V): V => [g.ox + p[0] * g.U, g.oy - p[1] * g.U];
const lerp = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const unit = (a: V, b: V): V => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};

/** Frame of a phrase inside a line (by character position in the caption). */
const cue = (scene: Scene, i: number, phrase: string, off = 0) => {
  const cap = scene.lines[i].caption.toLowerCase();
  const k = cap.indexOf(phrase.toLowerCase());
  return at(scene, i, Math.max(0, k < 0 ? 0 : k / cap.length) * 0.97) + off;
};
const lineIdx = (scene: Scene, f: number) => {
  let k = 0;
  scene.lines.forEach((l, i) => { if (f >= l.from) k = i; });
  return k;
};

// ---------- small building blocks ----------

const Win: React.FC<{ a: number; b?: number; children: React.ReactNode }> = ({ a, b = 1e9, children }) => {
  const f = useCurrentFrame();
  const o = ease(f, a, 10) * (1 - ease(f, b - 6, 6));
  if (o <= 0) return null;
  return <div style={{ opacity: o }}>{children}</div>;
};

const Lbl: React.FC<{ x: number; y: number; tex: string; op?: number; size?: number; color?: string }> = ({ x, y, tex, op = 1, size = 52, color = C.ink }) => {
  if (op <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: op, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Maths row in the right panel, fades up at `start`. */
const R: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; op?: number }> = ({ y, tex, start, x = PX, size = 52, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color?: string; size?: number; children: React.ReactNode; w?: number }> = ({ x, y, start, color = C.ink, size = 44, children, w }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, fontSize: size, fontWeight: 900, color, lineHeight: 1.25, ...fadeUp(f, start) }}>{children}</div>;
};

const Seg: React.FC<{ a: V; b: V; p?: number; color?: string; w?: number; dash?: string; op?: number }> = ({ a, b, p = 1, color = GRAY, w = 6, dash, op = 1 }) => {
  if (p <= 0 || op <= 0) return null;
  const e = lerp(a, b, Math.min(1, p));
  return <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} opacity={op} />;
};

const Disc: React.FC<{ x: number; y: number; text: string; color: string; op?: number; r?: number; s?: number; bad?: boolean }> = ({ x, y, text, color, op = 1, r = 50, s = 1, bad }) => {
  if (op <= 0 || s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: bad ? '#fde4e4' : C.card, border: `7px solid ${bad ? RED : color}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: 900, color: C.ink, opacity: op, transform: `scale(${s})`, boxShadow: '0 6px 18px rgba(30,40,80,0.12)' }}>
      {text}
    </div>
  );
};
const popS = (f: number, start: number) => {
  const t = (f - start) / 12;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 + 0.22 * Math.sin(t * Math.PI) * (1 - t) * 2 * t;
};

const Seesaw: React.FC<{ cx: number; cy: number; len: number; angle: number; pf?: number; L?: { r: number; text?: string; color: string }; Rt?: { r: number; text?: string; color: string }; op?: number; barColor?: string }> = ({
  cx, cy, len, angle, pf = 0.5, L, Rt, op = 1, barColor = C.ink,
}) => {
  const x0 = cx - pf * len;
  const x1 = cx + (1 - pf) * len;
  const disc = (x: number, d?: { r: number; text?: string; color: string }) => {
    if (!d) return null;
    const dy = cy - 8 - d.r;
    const [tx, ty] = (() => {
      const a = (angle * Math.PI) / 180;
      const rx = x - cx, ry = dy - cy;
      return [cx + rx * Math.cos(a) - ry * Math.sin(a), cy + rx * Math.sin(a) + ry * Math.cos(a)];
    })();
    return (
      <g>
        <circle cx={x} cy={dy} r={d.r} fill={C.card} stroke={d.color} strokeWidth={7} />
        {d.text && (
          <text x={tx} y={ty + 17} textAnchor="middle" fontSize={50} fontWeight={900} fill={C.ink} transform={`rotate(${-angle} ${tx} ${ty})`} style={{ display: 'none' }}>
            {d.text}
          </text>
        )}
      </g>
    );
  };
  return (
    <Stage>
      <g opacity={op}>
        <polygon points={`${cx - 46},${cy + 80} ${cx + 46},${cy + 80} ${cx},${cy}`} fill={C.muted} />
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <rect x={x0 - 20} y={cy - 8} width={x1 - x0 + 40} height={16} rx={8} fill={barColor} />
          {disc(x0, L)}
          {disc(x1, Rt)}
        </g>
      </g>
    </Stage>
  );
};
/** Number labels for a seesaw's discs (kept upright): positions follow the rotation. */
const seesawPos = (cx: number, cy: number, len: number, angle: number, pf: number, which: 'L' | 'R', r: number): V => {
  const x = which === 'L' ? cx - pf * len : cx + (1 - pf) * len;
  const a = (angle * Math.PI) / 180;
  const rx = x - cx, ry = -8 - r;
  return [cx + rx * Math.cos(a) - ry * Math.sin(a), cy + rx * Math.sin(a) + ry * Math.cos(a)];
};

// ---------- the figure ----------

type FigProps = {
  g: Geo; tri?: number; circ?: number; ad?: number; be?: number; split?: number; pAt?: number; adOp?: number; beOp?: number;
  D?: number; E?: number; F?: number; letters?: number; off?: number; sides?: [string, string, string]; sidesOp?: number;
  svg?: React.ReactNode; html?: React.ReactNode; hideD?: boolean; fillOp?: number;
};
const Fig: React.FC<FigProps> = ({
  g, tri = 1, circ = 1, ad = 0, be = 0, split = 0, pAt, adOp = 1, beOp = 1, D = 0, E = 0, F = 0, letters, off = 1, sides, sidesOp = 1, svg, html, hideD, fillOp = 1,
}) => {
  const f = useCurrentFrame();
  const A = px(g, g.A), B = px(g, g.B), Cc = px(g, g.C), I = px(g, g.I), Dp = px(g, g.D), Ep = px(g, g.E), Fp = px(g, g.F), P = px(g, g.P);
  const lop = letters ?? ease(f, 0, 10) * Math.min(1, tri * 3);
  const out = (t: V) => unit(I, t);
  const dl = out(Dp), el = out(Ep), fl = out(Fp);
  const pr = pAt === undefined ? -1 : f - pAt;
  const ring = (d: number) => {
    const t = (pr - d) / 22;
    return t > 0 && t < 1 ? { r: 12 + 40 * t, o: 1 - t } : null;
  };
  const r1 = ring(0), r2 = ring(26);
  const U = g.U;
  const sideLab = (i: number, text: string) => {
    const pos: V[] = g === MAIN ? [[354, 448], [796, 791], [690, 324]] : [[222, 550], [570, 815], [715, 590]];
    const [x, y] = pos[i];
    return <Lbl key={i} x={x} y={y} tex={text} op={sidesOp} />;
  };
  return (
    <>
      <Stage>
        {tri > 0 && <path d={`M ${A.join(' ')} L ${B.join(' ')} L ${Cc.join(' ')} Z`} fill={C.card} opacity={fillOp * Math.min(1, tri * 2)} />}
        {circ > 0 && <circle cx={I[0]} cy={I[1]} r={g.r * U} fill="none" stroke={C.blue} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circ} transform={`rotate(-90 ${I[0]} ${I[1]})`} />}
        {tri > 0 && <path d={`M ${A.join(' ')} L ${B.join(' ')} L ${Cc.join(' ')} Z`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tri} />}
        {g === VAR && tri > 0.9 && <path d={`M ${B[0] + 26} ${B[1]} L ${B[0] + 26} ${B[1] - 26} L ${B[0]} ${B[1] - 26}`} fill="none" stroke={C.ink} strokeWidth={4} />}
        <Seg a={A} b={Dp} p={ad} op={(1 - split) * adOp} />
        <Seg a={A} b={P} p={ad} color={GREEN} w={10} op={split * adOp} />
        <Seg a={P} b={Dp} p={ad} color={PURP} w={10} op={split * adOp} />
        <Seg a={B} b={Ep} p={be} op={beOp} />
        {[[Dp, D], [Ep, E], [Fp, F]].map(([p, o], i) => (o as number) > 0 && <circle key={i} cx={(p as V)[0]} cy={(p as V)[1]} r={9} fill={C.ink} opacity={o as number} />)}
        {pAt !== undefined && pr >= 0 && <circle cx={P[0]} cy={P[1]} r={12} fill={RED} stroke="#fff" strokeWidth={3} opacity={Math.min(1, pr / 6)} />}
        {r1 && <circle cx={P[0]} cy={P[1]} r={r1.r} fill="none" stroke={RED} strokeWidth={5} opacity={r1.o} />}
        {r2 && <circle cx={P[0]} cy={P[1]} r={r2.r} fill="none" stroke={RED} strokeWidth={5} opacity={r2.o} />}
        {svg}
      </Stage>
      <Lbl x={A[0] + 48 * off} y={A[1] - 22 * off} tex="A" op={lop} />
      <Lbl x={B[0] - 44 * off} y={B[1] + 14 * off} tex="B" op={lop} />
      <Lbl x={Cc[0] + 44 * off} y={Cc[1] + 14 * off} tex="C" op={lop} />
      {!hideD && <Lbl x={Dp[0] + dl[0] * 46} y={Dp[1] + dl[1] * 46} tex="D" op={D} />}
      <Lbl x={Ep[0] + el[0] * 52} y={Ep[1] + el[1] * 52} tex="E" op={E} />
      <Lbl x={Fp[0] + fl[0] * 52} y={Fp[1] + fl[1] * 52} tex="F" op={F} />
      {pAt !== undefined && pr >= 0 && <Lbl x={P[0] + 40} y={P[1] + 32} tex="P" op={Math.min(1, pr / 8)} />}
      {sides && sides.map((s, i) => sideLab(i, s))}
      {html}
    </>
  );
};

// ---------- tangent pieces ----------

type PK = 'AF' | 'AE' | 'BF' | 'BD' | 'CD' | 'CE';
const PIECES: { k: PK; a: 'A' | 'B' | 'C'; t: 'D' | 'E' | 'F'; col: string; sym: string; n: number }[] = [
  { k: 'AF', a: 'A', t: 'F', col: GREEN, sym: 'x', n: 1 },
  { k: 'AE', a: 'A', t: 'E', col: GREEN, sym: 'x', n: 1 },
  { k: 'BF', a: 'B', t: 'F', col: PURP, sym: 'y', n: 2 },
  { k: 'BD', a: 'B', t: 'D', col: PURP, sym: 'y', n: 2 },
  { k: 'CD', a: 'C', t: 'D', col: AMB, sym: 'z', n: 3 },
  { k: 'CE', a: 'C', t: 'E', col: AMB, sym: 'z', n: 3 },
];
const pieceLen = (g: Geo, a: V, t: V) => Math.round(Math.hypot(a[0] - t[0], a[1] - t[1]));
/** SVG part (segments + ticks) of the tangent pieces. */
const PiecesSvg: React.FC<{ g: Geo; draw?: number; ticks?: number; only?: PK[] }> = ({ g, draw = 1, ticks = 1, only }) => {
  const I = px(g, g.I);
  return (
    <>
      {PIECES.filter((p) => !only || only.includes(p.k)).map((p) => {
        const a = px(g, g[p.a]), t = px(g, g[p.t]);
        const m = lerp(a, t, 0.5);
        const d = unit(a, t);
        const nrm: V = [-d[1], d[0]];
        return (
          <g key={p.k}>
            <Seg a={a} b={t} p={draw} color={p.col} w={13} />
            {ticks > 0 && Array.from({ length: p.n }, (_, i) => {
              const c: V = [m[0] + d[0] * (i - (p.n - 1) / 2) * 13, m[1] + d[1] * (i - (p.n - 1) / 2) * 13];
              return <line key={i} x1={c[0] - nrm[0] * 17} y1={c[1] - nrm[1] * 17} x2={c[0] + nrm[0] * 17} y2={c[1] + nrm[1] * 17} stroke={p.col} strokeWidth={6} strokeLinecap="round" opacity={ticks} />;
            })}
          </g>
        );
      })}
      <circle cx={I[0]} cy={I[1]} r={0} />
    </>
  );
};
/** Labels (x/y/z letters or lengths) next to the pieces. */
const PieceLabels: React.FC<{ g: Geo; letters?: number; nums?: Partial<Record<PK, number>> }> = ({ g, letters = 0, nums = {} }) => {
  const I = px(g, g.I);
  return (
    <>
      {PIECES.map((p) => {
        const a = px(g, g[p.a]), t = px(g, g[p.t]);
        const m = lerp(a, t, 0.5);
        const o = unit(I, t);
        const x = m[0] + o[0] * 48, y = m[1] + o[1] * 48;
        const n = nums[p.k] ?? 0;
        return (
          <div key={p.k}>
            <Lbl x={x} y={y} tex={p.sym} op={letters * (1 - n)} color={p.col} />
            <Lbl x={x} y={y} tex={String(pieceLen(g, g[p.a], g[p.t]))} op={n} color={p.col} />
          </div>
        );
      })}
    </>
  );
};
const N4 = (o: number) => ({ BD: o, CD: o, CE: o, AE: o }) as Partial<Record<PK, number>>;

/** A bright overlay on a stretch of the figure. */
const Hi: React.FC<{ a: V; b: V; op: number; color?: string; w?: number }> = ({ a, b, op, color = '#fbbf24', w = 24 }) => <Seg a={a} b={b} color={color} w={w} op={op * 0.45} />;
const pulse = (f: number, a: number, b: number) => ease(f, a, 6) * (1 - ease(f, b, 8));

// ---------- answer chips ----------

const CHOICES = ['24:49', '7:4', '2:1', '49:24', '15:7'];
const Chips: React.FC<{ x: number; y: number; start: (i: number) => number; hl?: number; w?: number; cols?: number }> = ({ x, y, start, hl, w = 270, cols = 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {CHOICES.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: x + (i % cols) * (w + 20), top: y + Math.floor(i / cols) * 76, width: w, height: 64, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', background: hl === i ? 'rgba(33,196,93,0.16)' : C.card, border: hl === i ? `4px solid ${C.green}` : '4px solid transparent', borderRadius: 18, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', ...fadeUp(f, start(i), 10) }}>
          <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
          <Tex tex={c} size={46} />
        </div>
      ))}
    </>
  );
};

const Badge: React.FC<{ x: number; y: number; value: string; start: number }> = ({ x, y, value, start }) => {
  const f = useCurrentFrame();
  const s = popS(f, start);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 230, top: y - 80, width: 460, height: 160, borderRadius: 80, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};

// ---------- scenes ----------

const SIDES: [string, string, string] = ['13', '14', '15'];
const mainProps = (extra: Partial<FigProps> = {}): FigProps => ({ g: MAIN, D: 1, E: 1, ad: 1, be: 1, split: 0, ...extra });

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const strike = cue(scene, 1, "trap");
  const shake = f > strike && f < strike + 16 ? Math.sin((f - strike) * 1.8) * 10 : 0;
  const tagOp = fadeTo(f, at(scene, 2, 0), 0, 12);
  const l2 = at(scene, 2, 0.05);
  const tilt = 15 * (1 - ease(f, l2 + 6, 26)) * Math.cos((f - l2) / 3.5);
  const P = px(MAIN, MAIN.P);
  return (
    <>
      <Fig g={MAIN} tri={ease(f, 6, 40)} circ={ease(f, 40, 40)} ad={ease(f, at(scene, 0, 0.5), 28)} be={ease(f, at(scene, 0, 0.62), 28)} D={ease(f, at(scene, 0, 0.55), 8)} E={ease(f, at(scene, 0, 0.65), 8)} pAt={at(scene, 0, 0.86)} />
      <Win a={at(scene, 1, 0.05)} b={at(scene, 2, 0)}>
        <Stage>
          <line x1={PX + 30} y1={410} x2={P[0] + 40} y2={P[1] - 20} stroke={RED} strokeWidth={5} strokeDasharray="12 10" opacity={tagOp} />
        </Stage>
        <div style={{ position: 'absolute', left: PX + 20 + shake, top: 330, background: C.card, border: `6px solid ${RED}`, borderRadius: 28, padding: '10px 40px', opacity: tagOp }}>
          <Tex tex="2:1\;?" size={96} color={RED} />
        </div>
        <Stage>
          <g opacity={ease(f, strike, 6) * tagOp}>
            <line x1={PX + 10} y1={320} x2={PX + 10 + 330 * ease(f, strike, 8)} y2={320 + 150 * ease(f, strike, 8)} stroke={RED} strokeWidth={12} strokeLinecap="round" />
          </g>
        </Stage>
      </Win>
      <Win a={l2}>
        <Seesaw cx={1380} cy={560} len={480} angle={tilt} L={{ r: 44, color: GREEN }} Rt={{ r: 44, color: PURP }} />
      </Win>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const A = px(MAIN, MAIN.A), B = px(MAIN, MAIN.B), Cc = px(MAIN, MAIN.C);
  const l1 = (i: number) => at(scene, 0, i / 3 + 0.04);
  const hiOp = (i: number) => pulse(f, l1(i), l1(i) + 26);
  const l2 = at(scene, 1, 0);
  return (
    <>
      <div style={{ position: 'absolute', left: PX, top: 150, width: 860, background: C.card, borderRadius: 32, padding: '26px 36px', boxShadow: '0 10px 40px rgba(30,40,80,0.08)', ...fadeUp(f, 4) }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: C.primary, marginBottom: 6 }}>Question</div>
        <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.3 }}>
          Triangle ABC has AB = 13, BC = 14 and CA = 15. Its incircle touches BC at D and CA at E. Segments AD and BE meet at P. What is the ratio AP : PD?
        </div>
      </div>
      <Fig {...mainProps({ tri: ease(f, 4, 20), circ: ease(f, 4, 20), D: ease(f, l2 + 30, 8), E: ease(f, l2 + 40, 8), ad: ease(f, at(scene, 1, 0.55), 22), be: ease(f, at(scene, 1, 0.7), 22), sides: SIDES, pAt: at(scene, 1, 0.92) })}
        sidesOp={1}
        svg={
          <>
            <Hi a={A} b={B} op={hiOp(0)} />
            <Hi a={B} b={Cc} op={hiOp(1)} />
            <Hi a={Cc} b={A} op={hiOp(2)} />
            <circle cx={px(MAIN, MAIN.I)[0]} cy={px(MAIN, MAIN.I)[1]} r={MAIN.r * MAIN.U + 8} fill="none" stroke={C.blue} strokeWidth={18} opacity={pulse(f, l2, l2 + 24) * 0.35} />
          </>
        }
        html={
          <>
            <div style={{ position: 'absolute', inset: 0, background: C.bg, opacity: 0 }} />
          </>
        }
      />
      <Chips x={PX} y={500} cols={2} start={(i) => at(scene, 2, 0) + i * 9} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sp = ease(f, at(scene, 0, 0.35), 14);
  const l1 = at(scene, 1, 0);
  const g = MAIN;
  const Bp = px(g, g.B), Cp = px(g, g.C), Dp = px(g, g.D), Ep = px(g, g.E), Ap = px(g, g.A);
  const Ap2 = lerp(Ap, Cp, 0.09);
  const op = ease(f, l1, 12);
  const add = (a: V, o: V): V => [a[0] + o[0], a[1] + o[1]];
  const dn: V = [0, 92];
  const on: V = [0.8 * 92, -0.6 * 92];
  const tick = (pt: V, o: V, len: number, key: string, col: string) => {
    const n = unit([0, 0], o);
    return <line key={key} x1={pt[0] + o[0]} y1={pt[1] + o[1]} x2={pt[0] + o[0] - n[0] * len} y2={pt[1] + o[1] - n[1] * len} stroke={col} strokeWidth={5} opacity={op} />;
  };
  const run = (a: V, b: V, o: V, col: string, key: string) => <line key={key} x1={a[0] + o[0]} y1={a[1] + o[1]} x2={b[0] + o[0]} y2={b[1] + o[1]} stroke={col} strokeWidth={5} strokeDasharray="12 9" opacity={op} />;
  const mark = (a: V, b: V, o: V, k: number, d: V) => { const m = lerp(a, b, 0.5); return [m[0] + o[0] * k + d[0], m[1] + o[1] * k + d[1]] as V; };
  const qs: [V, string][] = [
    [mark(Bp, Dp, dn, 0.55, [0, 0]), PURP], [mark(Dp, Cp, dn, 0.55, [0, 0]), AMB],
    [mark(Cp, Ep, on, 1, [40, -30]), AMB], [mark(Ep, Ap, on, 1, [40, -30]), GREEN],
  ];
  return (
    <>
      <Fig {...mainProps({ split: sp, pAt: -1000, svg: (
        <>
          {run(Bp, Cp, dn, C.muted, 'bc')}
          {run(Cp, Ap2, on, C.muted, 'ca')}
          {tick(Bp, dn, 24, 't1', C.muted)}{tick(Cp, dn, 24, 't2', C.muted)}
          <line x1={Dp[0]} y1={Dp[1] + 92} x2={Dp[0]} y2={Dp[1] + 92 - 16} stroke={C.muted} strokeWidth={5} opacity={op} />
          {tick(Cp, on, 24, 't3', C.muted)}{tick(Ap2, on, 24, 't4', C.muted)}
          <line x1={Ep[0] + on[0]} y1={Ep[1] + on[1]} x2={Ep[0] + on[0] - 0.8 * 16} y2={Ep[1] + on[1] + 0.6 * 16} stroke={C.muted} strokeWidth={5} opacity={op} />
        </>
      ) })} />
      {qs.map(([p, col], i) => <Lbl key={i} x={p[0]} y={i < 2 ? Dp[1] + 52 : p[1]} tex="?" color={col} op={ease(f, l1 + 4 + i * 5, 10)} />)}
      <Text x={PX} y={190} w={860} size={46} style={fadeUp(f, 6)}>Goal: how does P split AD?</Text>
      <R y={280} start={at(scene, 0, 0.4)} tex={`\\color{${GREEN}}AP\\;:\\;\\color{${PURP}}PD\\;=\\;?`} size={72} />
      <Tag x={PX} y={470} start={l1 + 6} size={46} w={860}>Known: AB = 13, BC = 14, CA = 15</Tag>
      <Tag x={PX} y={560} start={l1 + 18} size={46} color={AMB} w={860}>Where are D and E?</Tag>
    </>
  );
};

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Fig {...mainProps({ sides: SIDES, pAt: 4 })} />
      <Text x={PX} y={170} w={600} size={44} style={fadeUp(f, 6)}>What is AP : PD?</Text>
      <Chips x={PX} y={250} start={() => 8} w={270} />
      <Countdown scene={scene} seconds={10} x={1580} y={560} tick={TICK} />
    </>
  );
};

const Tangents: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = MAIN;
  const l = (i: number, t = 0) => at(scene, i, t);
  const Ap = px(g, g.A), Bp = px(g, g.B), Cp = px(g, g.C), Ip = px(g, g.I), Fp = px(g, g.F), Ep = px(g, g.E);
  // fold: ghost copy of piece AF swings about A onto AE
  const aF = Math.atan2(Fp[1] - Ap[1], Fp[0] - Ap[0]);
  const aE = Math.atan2(Ep[1] - Ap[1], Ep[0] - Ap[0]);
  const len = Math.hypot(Fp[0] - Ap[0], Fp[1] - Ap[1]);
  const swT = cue(scene, 2, 'one piece');
  const sw = ease(f, swT, 30);
  const ang = aF + (aE - aF) * sw;
  const gh: V = [Ap[0] + len * Math.cos(ang), Ap[1] + len * Math.sin(ang)];
  const foldOp = pulse(f, l(2, 0.05), l(2, 0.92));
  const axisEnd = lerp(Ap, Ip, 1.3);
  const flash = ease(f, swT + 30, 4) * (1 - ease(f, swT + 36, 12));
  const hl = (a: V, b: V, i: number) => <Hi key={i} a={a} b={b} op={pulse(f, l(4, i / 3), l(4, (i + 1) / 3))} />;
  const bcHi = pulse(f, cue(scene, 6, 'y plus z'), cue(scene, 6, 'that leaves'));
  const lettersOp = ease(f, l(3, 0.05), 12) * (1 - ease(f, l(8, 0.02), 14));
  const nums = (k: PK) => ease(f, l(8, k === 'BD' ? 0.1 : k === 'CD' ? 0.3 : k === 'CE' ? 0.55 : 0.8), 12);
  return (
    <>
      <Fig {...mainProps({ ad: 0, be: 0, F: ease(f, l(1, 0.1), 8), letters: 1,
        svg: (
          <>
            <PiecesSvg g={g} draw={ease(f, l(1, 0.12), 24)} ticks={ease(f, l(1, 0.65), 12)} />
            {hl(Ap, Bp, 0)}{hl(Bp, Cp, 1)}{hl(Cp, Ap, 2)}
            <Hi a={Bp} b={Cp} op={bcHi} color="#fbbf24" />
            <g opacity={foldOp}>
              <line x1={Ap[0]} y1={Ap[1]} x2={axisEnd[0]} y2={axisEnd[1]} stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" />
              <circle cx={Ip[0]} cy={Ip[1]} r={9} fill={C.blue} />
              <line x1={Ap[0]} y1={Ap[1]} x2={gh[0]} y2={gh[1]} stroke="#079a66" strokeWidth={15} strokeLinecap="round" opacity={0.95} />
              <circle cx={Ep[0]} cy={Ep[1]} r={22 * flash} fill="none" stroke={GREEN} strokeWidth={6} />
            </g>
          </>
        ),
        html: (
          <>
            <PieceLabels g={g} letters={lettersOp} nums={{ BD: nums('BD'), CD: nums('CD'), CE: nums('CE'), AE: nums('AE') }} />
          </>
        ),
      })} />
      <R y={190} start={l(4, 0.0)} tex="x+y=13" />
      <R y={275} start={l(4, 0.34)} tex="y+z=14" />
      <R y={360} start={l(4, 0.67)} tex="z+x=15" />
      <R y={470} start={cue(scene, 5, 'add all')} tex="2(x+y+z)=42" />
      <R y={555} start={cue(scene, 5, 'each letter')} tex="x+y+z=21" />
      <R x={1030} y={660} size={50} start={l(6, 0.2)} tex="x=21-(y+z)=21-14=7" />
      <R x={1060} y={745} start={l(7, 0.2)} tex="y=6\qquad z=8" />
    </>
  );
};

// mass-point figure state
const MassFig: React.FC<{ scene: Scene; children?: React.ReactNode; extra?: Partial<FigProps>; off?: number; hideD?: boolean; svg?: React.ReactNode; html?: React.ReactNode }> = ({ extra, off = 1.9, hideD, svg, html }) => (
  <Fig {...mainProps({ letters: 1, off, hideD, svg, ...extra, html: (<><PieceLabels g={MAIN} nums={N4(1)} />{html}</>) })} />
);
const g0 = MAIN;
const Ap0 = px(g0, g0.A), Bp0 = px(g0, g0.B), Cp0 = px(g0, g0.C), Dp0 = px(g0, g0.D), Ep0 = px(g0, g0.E), P0 = px(g0, g0.P);

const Mass: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const li = lineIdx(scene, f);
  const fill = (k: 'B' | 'C' | 'A') => (k === 'B' ? cue(scene, 5, 'twenty-eight') : k === 'C' ? cue(scene, 5, 'twenty-one') : cue(scene, 5, 'twenty-four'));
  const shown = (k: 'B' | 'C' | 'A') => f >= fill(k);
  const Ip0 = px(g0, g0.I);
  const inw = unit(Ep0, Ip0);
  const Em: V = [Ep0[0] + inw[0] * 48, Ep0[1] + inw[1] * 48];
  // L6: B and C slide into D
  const m6a = ease(f, l(6, 0.1), 24), m6 = cue(scene, 6, 'forty-nine');
  const bPos = lerp(Bp0, Dp0, m6a), cPos = lerp(Cp0, Dp0, m6a);
  const merged = f >= m6;
  // L7: A and a ghost of C slide to E
  const m7s = l(7, 0.02), m7e = m7s + 26;
  const m7a = ease(f, m7s, 26);
  const aPos = lerp(Ap0, Em, m7a), gPos = lerp(Cp0, Em, m7a);
  const both = cue(scene, 7, 'both lines');
  const a24 = cue(scene, 7, 'twenty-four at a');
  const beGlow = pulse(f, cue(scene, 7, 'balances on be'), both);
  const adGlow = ease(f, a24, 14);
  const bcFade = li < 6 ? 1 : 1 - ease(f, m6 - 4, 4);
  const txt = (k: 'B' | 'C' | 'A', v: string) => (shown(k) ? v : '?');
  const sw = ease(f, l(2, 0), 14);
  const aVisible = li < 7 || (li === 7 && f >= both);
  return (
    <>
      <MassFig scene={scene} hideD={li >= 6} extra={{ pAt: both }}
        svg={
          <>
            <Hi a={Bp0} b={Cp0} op={li === 2 ? 1 : 0} />
            <Hi a={Cp0} b={Ap0} op={li === 3 ? 1 : 0} />
            <Hi a={Bp0} b={Ep0} op={beGlow * 1.6} color={RED} />
            <Hi a={Ap0} b={Dp0} op={adGlow * 0.8} color={GREEN} />
            {li === 2 && <circle cx={Dp0[0]} cy={Dp0[1]} r={14 * sw} fill={C.amber} />}
            {li === 3 && <circle cx={Ep0[0]} cy={Ep0[1]} r={14} fill={C.amber} />}
          </>
        }
        html={
          <>
            {aVisible && <Disc x={li < 7 ? Ap0[0] : Ap0[0]} y={Ap0[1]} text={txt('A', '24')} color={GREEN} op={ease(f, l(0, 0.5), 10)} s={li === 7 ? popS(f, both) || 1 : 1} />}
            {li === 7 && f < both && f < m7e && <Disc x={aPos[0]} y={aPos[1]} text="24" color={GREEN} />}
            <Disc x={li < 6 ? Bp0[0] : bPos[0]} y={li < 6 ? Bp0[1] : bPos[1]} text={txt('B', '28')} color={PURP} op={ease(f, l(0, 0.3), 10) * bcFade} />
            <Disc x={li < 6 ? Cp0[0] : cPos[0]} y={li < 6 ? Cp0[1] : cPos[1]} text={txt('C', '21')} color={AMB} op={ease(f, l(0, 0.7), 10) * bcFade} />
            {li === 7 && f < m7e && <Disc x={gPos[0]} y={gPos[1]} text="21" color={AMB} op={0.9} />}
            {merged && <Disc x={Dp0[0]} y={Dp0[1]} text="49" color={GREEN} r={56} s={popS(f, m6)} />}
            {f >= both && li === 7 && <div style={{ position: 'absolute', left: P0[0] - 12, top: P0[1] - 12, width: 24, height: 24, borderRadius: '50%', background: RED, border: '3px solid #fff', boxSizing: 'border-box' }} />}
            {li === 7 && f >= m7e && f < both && <Disc x={Em[0]} y={Em[1]} text="A+C" color={GREEN} r={62} s={popS(f, m7e)} />}
          </>
        }
      />
      <Win a={l(1, 0.0)} b={l(2, 0)}>
        <Seesaw cx={1300} cy={380} len={560} angle={0} pf={0.35} L={{ r: 52, color: GREEN }} Rt={{ r: 40, color: PURP }} />
        <Lbl x={1300 - 0.35 * 560} y={380 - 8 - 52} tex="w_1" size={48} />
        <Lbl x={1300 + 0.65 * 560} y={380 - 8 - 40} tex="w_2" size={48} />
        <Lbl x={1300 - 0.175 * 560} y={470} tex="d_1" size={48} color={C.muted} />
        <Lbl x={1300 + 0.325 * 560} y={470} tex="d_2" size={48} color={C.muted} />
        <R y={570} start={l(1, 0.35)} tex="w_1\times d_1=w_2\times d_2" />
      </Win>
      <R y={190} start={l(2, 0.35)} tex="B\times 6=C\times 8" />
      <R y={270} start={l(3, 0.35)} tex="C\times 8=A\times 7" />
      <R y={350} start={l(4, 0.3)} tex="B\times 6=C\times 8=A\times 7=168" />
      <R y={440} start={fill('B')} tex={`B=168\\div 6=28`} color={PURP} />
      <R y={520} start={fill('C')} tex={`C=168\\div 8=21`} color={AMB} />
      <R y={600} start={fill('A')} tex={`A=168\\div 7=24`} color={GREEN} />
      <R x={1100} y={690} start={m6} tex="28+21=49" />
      <Tag x={1100} y={775} start={l(7, 0.3)} color={GREEN} size={46} w={780}>A and C merge at E</Tag>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const t0 = l(0, 0.38);
  const a = 11 * Math.exp(-Math.max(0, f - t0) / 12) * Math.cos(Math.max(0, f - t0) / 3.2);
  const ang = f < t0 ? 11 : a;
  const pf = 49 / 73;
  const cx = 1400, cy = 600, len = 540;
  const lp = seesawPos(cx, cy, len, ang, pf, 'L', 40);
  const rp = seesawPos(cx, cy, len, ang, pf, 'R', 56);
  const mid = (t: number): V => [cx - pf * len + t * len, cy + 80];
  return (
    <>
      <Fig {...mainProps({ split: 1, pAt: 0, hideD: true, letters: 1, off: 1.9,
        svg: (<Hi a={Ap0} b={Dp0} op={0} />),
        html: (
          <>
            <Disc x={Ap0[0]} y={Ap0[1]} text="24" color={GREEN} />
            <Disc x={Dp0[0]} y={Dp0[1]} text="49" color={GREEN} r={56} />
          </>
        ) })} />
      <R y={170} start={l(0, 0.1)} tex={`24\\times\\color{${GREEN}}AP\\color{${C.ink}}=49\\times\\color{${PURP}}PD`} />
      <R y={265} start={l(0, 0.7)} tex={`\\color{${GREEN}}AP\\color{${C.ink}}:\\color{${PURP}}PD=49:24`} size={62} />
      <Seesaw cx={cx} cy={cy} len={len} angle={ang} pf={pf} L={{ r: 40, color: GREEN }} Rt={{ r: 56, color: PURP }} />
      <div style={{ position: 'absolute', left: lp[0], top: lp[1], transform: 'translate(-50%, -50%)', fontSize: 50, fontWeight: 900 }}>24</div>
      <div style={{ position: 'absolute', left: rp[0], top: rp[1], transform: 'translate(-50%, -50%)', fontSize: 50, fontWeight: 900 }}>49</div>
      <Lbl x={mid(0.335)[0]} y={cy + 42} tex="AP" color={GREEN} op={ease(f, l(0, 0.3), 10)} />
      <Lbl x={mid(0.835)[0] + 15} y={cy + 42} tex="PD" color={PURP} op={ease(f, l(0, 0.3), 10)} />
      <Badge x={1560} y={775} value="D · 49:24" start={l(1, 0.82)} />
    </>
  );
};

const Parallel: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const g = MAIN;
  const Dp = Dp0, Gp = px(g, g.G), Ep = Ep0, Bp = Bp0, Cp = Cp0, Ap = Ap0, P = P0;
  const px0 = 1260;
  const dg = ease(f, l(1, 0.35), 24);
  const chev = (a: V, b: V, t: number, op: number, key: string, col = C.ink) => {
    const m = lerp(a, b, t);
    const d = unit(a, b);
    const n: V = [-d[1], d[0]];
    const p = (s: number): V => [m[0] + d[0] * s, m[1] + d[1] * s];
    return <polyline key={key} points={`${p(-12)[0] + n[0] * 14},${p(-12)[1] + n[1] * 14} ${p(10)[0]},${p(10)[1]} ${p(-12)[0] - n[0] * 14},${p(-12)[1] - n[1] * 14}`} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" opacity={op} />;
  };
  const cbe = ease(f, l(2, 0.05), 14) * (1 - ease(f, l(3, 0.2), 12) * 0.7);
  const adg = ease(f, l(4, 0.05), 14);
  const brk = ease(f, cue(scene, 2, 'g splits'), 14);
  const bo: V = [0.8 * 105, -0.6 * 105];
  const bC: V = [Cp[0] + bo[0], Cp[1] + bo[1]], bG: V = [Gp[0] + bo[0], Gp[1] + bo[1]], bE: V = [Ep[0] + bo[0], Ep[1] + bo[1]];
  const mid2 = (a: V, b: V) => lerp(a, b, 0.5);
  const geOp = ease(f, cue(scene, 3, 'twenty-four over seven'), 12);
  const poly = (pts: V[], col: string, op: number) => <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={col} opacity={op} />;
  const mGE = mid2(bG, bE), mCE = mid2(bC, bE), mCG = mid2(bC, bG);
  return (
    <>
      <Fig {...mainProps({ split: 1, pAt: 0, hideD: false, letters: 1,
        svg: (
          <>
            {poly([Cp, Bp, Ep], AMB, 0.18 * cbe)}
            {poly([Ap, Dp, Gp], PURP, 0.16 * adg)}
            <Hi a={Cp} b={Bp} op={cbe * 1.4} color={AMB} />
            <Hi a={Cp} b={Ep} op={cbe * 1.4} color={AMB} />
            <Seg a={Dp} b={Gp} p={dg} color={RED} w={6} dash="14 10" />
            {dg > 0.95 && <circle cx={Gp[0]} cy={Gp[1]} r={10} fill={RED} />}
            {chev(Bp, Ep, 0.5, ease(f, l(1, 0.7), 10), 'c1')}
            {chev(Dp, Gp, 0.5, ease(f, l(1, 0.7), 10), 'c2', RED)}
            {chev(P, Ep, 0.5, adg, 'c3')}
            {chev(Dp, Gp, 0.7, adg, 'c4', RED)}
            <polyline points={`${bC[0] - bo[0] * 0.15},${bC[1] - bo[1] * 0.15} ${bC[0]},${bC[1]} ${bE[0]},${bE[1]} ${bE[0] - bo[0] * 0.15},${bE[1] - bo[1] * 0.15}`} fill="none" stroke={C.ink} strokeWidth={5} opacity={brk} />
            <line x1={bG[0] - bo[0] * 0.15} y1={bG[1] - bo[1] * 0.15} x2={bG[0] + bo[0] * 0.15} y2={bG[1] + bo[1] * 0.15} stroke={C.ink} strokeWidth={5} opacity={brk} />
          </>
        ),
        html: (
          <>
            <PieceLabels g={g} nums={{ BD: 1, CD: 1, AE: 1 }} />
            <Lbl x={Gp[0] + 36} y={Gp[1] + 16} tex="G" op={ease(f, l(1, 0.6), 10)} />
            <Lbl x={mCG[0] + 30 + 40} y={mCG[1] + 20} tex="CG" op={brk} color={AMB} />
            <Lbl x={mGE[0] + 30 + 40} y={mGE[1] - 6} tex="GE" op={brk * (1 - geOp)} color={GREEN} />
            <Lbl x={mGE[0] + 30 + 125} y={mGE[1] - 6} tex="GE=24/7" op={geOp} color={GREEN} />
            <Lbl x={mCE[0] + 30 + 80} y={mCE[1] - 10} tex="CE=8" op={brk} color={AMB} />
          </>
        ) })} />
      <R x={px0} y={170} start={cue(scene, 2, 'just like')} tex="CD:DB=8:6" />
      <R x={px0} y={245} start={cue(scene, 2, 'eight to six')} tex="CG:GE=8:6" />
      <R x={px0} y={320} start={l(3, 0.35)} tex="GE=\dfrac{8\times 6}{14}=\dfrac{24}{7}" />
      <R x={px0} y={460} start={l(4, 0.3)} tex="\dfrac{AP}{PD}=\dfrac{AE}{EG}" />
      <R x={px0} y={615} start={cue(scene, 5, "that's seven")} tex="\dfrac{AE}{EG}=7\div\dfrac{24}{7}=\dfrac{49}{24}" />
      <Win a={l(5, 0.5)}>
        <div style={{ position: 'absolute', left: px0 + 570, top: 650 }}>
          <svg width={64} height={64} viewBox="0 0 54 54"><circle cx={27} cy={27} r={27} fill={C.green} /><path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </Win>
      <Tag x={px0} y={780} start={l(6, 0.3)} color={C.primary} size={46} w={640}>No weights needed!</Tag>
    </>
  );
};

const TrapHead: React.FC<{ y: number; start: number; label: string; tex: string }> = ({ y, start, label, tex }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PX, top: y, display: 'flex', alignItems: 'center', gap: 20, background: RED, color: '#fff', borderRadius: 999, padding: '8px 34px', fontSize: 46, fontWeight: 900, ...fadeUp(f, start) }}>
      <span>{label}</span>
      <Tex tex={tex} size={52} color="#fff" />
      <span>✗</span>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const li = lineIdx(scene, f);
  const g = MAIN;
  const Gp = px(g, g.G);
  const M = px(g, [11.6, 3.2]);
  const lens = <PieceLabels g={g} nums={N4(1)} />;
  const win = (i: number, children: React.ReactNode) => <Win a={l(i, 0)} b={i + 1 < scene.lines.length ? l(i + 1, 0) : 1e9}>{children}</Win>;
  const bcBad = ease(f, l(4, 0.1), 10);
  return (
    <>
      {/* figure variants */}
      {li <= 1 && <Fig {...mainProps({ split: 1, pAt: -1000 })} html={lens} />}
      {li === 2 && (
        <Fig {...mainProps({ adOp: 0.35 })}
          svg={
            <>
              <Seg a={Dp0} b={Gp} color={C.muted} w={5} dash="12 9" op={ease(f, l(2, 0.55), 12) * 0.8} />
              <Seg a={Dp0} b={M} color={RED} w={6} dash="14 10" p={ease(f, l(2, 0.3), 16)} />
              <circle cx={M[0]} cy={M[1]} r={11} fill={RED} opacity={ease(f, l(2, 0.35), 8)} />
              <circle cx={Gp[0]} cy={Gp[1]} r={8} fill={C.muted} opacity={ease(f, l(2, 0.55), 8) * 0.8} />
            </>
          }
          html={<><PieceLabels g={g} nums={N4(1)} /><Lbl x={M[0] + 6} y={M[1] + 46} tex="G" color={RED} op={ease(f, l(2, 0.35), 10)} /></>} />
      )}
      {(li === 3 || li === 4) && (
        <Fig {...mainProps({ letters: 1, off: 1.9, hideD: true, adOp: 0.3, beOp: 0.3,
          svg: <Hi a={Bp0} b={Cp0} op={bcBad} color={RED} />,
          html: (
            <>
              {lens}
              <Disc x={Ap0[0]} y={Ap0[1]} text="7" color={RED} bad op={ease(f, l(3, 0.3), 10)} />
              <Disc x={Bp0[0]} y={Bp0[1]} text="6" color={RED} bad op={ease(f, l(3, 0.45), 10)} />
              <Disc x={Cp0[0]} y={Cp0[1]} text="8" color={RED} bad op={ease(f, l(3, 0.55), 10)} />
              <Disc x={Dp0[0]} y={Dp0[1]} text="14" color={RED} bad r={56} s={popS(f, cue(scene, 3, 'fourteen'))} />
            </>
          ) })} />
      )}
      {li === 5 && (
        <Fig {...mainProps({ adOp: 0.5, beOp: 0.5 })}
          svg={
            <>
              <Hi a={Cp0} b={Ap0} op={ease(f, l(5, 0.1), 10) * 1.6} color={RED} />
              <Seg a={Ap0} b={Ep0} color={GREEN} w={14} op={ease(f, cue(scene, 5, 'to ae'), 10)} />
            </>
          }
          html={<><PieceLabels g={g} nums={N4(1)} /><Lbl x={815} y={372} tex="15" color={RED} op={ease(f, l(5, 0.1), 10)} /></>} />
      )}
      {li === 6 && <Fig {...mainProps({ split: 1, pAt: -1000 })} html={lens} />}

      {/* panel */}
      {win(0, <Chips x={PX} y={200} cols={2} start={(i) => l(0, 0.35) + i * 7} />)}
      {win(1, (
        <>
          <TrapHead y={170} start={l(1, 0)} label="A" tex="24:49" />
          <R y={310} start={cue(scene, 1, 'pd to')} tex={`PD:AP=24:49`} color={RED} />
          <R y={410} start={cue(scene, 1, "it's our")} tex={`AP:PD=49:24`} />
          <Tag x={PX} y={510} start={cue(scene, 1, 'flipped')} color={RED} size={46} w={860}>the two parts swapped!</Tag>
        </>
      ))}
      {win(2, (
        <>
          <TrapHead y={170} start={l(2, 0)} label="B" tex="7:4" />
          <R y={310} start={cue(scene, 2, 'cut ce')} tex="GE=4" color={RED} />
          <R y={410} start={cue(scene, 2, 'making')} tex="AE:EG=7:4" color={RED} />
          <Tag x={PX} y={520} start={l(2, 0.7)} color={C.muted} size={42} w={860}>the real G is at GE = 24/7</Tag>
        </>
      ))}
      {win(3, (
        <>
          <TrapHead y={170} start={l(3, 0)} label="C" tex="2:1" />
          <R y={310} start={l(3, 0.3)} tex="A=7,\;B=6,\;C=8" color={RED} />
          <R y={410} start={cue(scene, 3, 'fourteen')} tex="D=6+8=14" color={RED} />
          <R y={510} start={cue(scene, 3, 'fourteen')} tex="AP:PD=14:7=2:1" color={RED} />
        </>
      ))}
      {win(4, (
        <>
          <TrapHead y={170} start={l(4, 0)} label="C" tex="2:1" />
          <Seesaw cx={1380} cy={470} len={520} angle={12 * ease(f, l(4, 0.1), 14)} L={{ r: 36, color: RED }} Rt={{ r: 44, color: RED }} barColor={RED} />
          {(() => {
            const a = 12 * ease(f, l(4, 0.1), 14);
            const lp = seesawPos(1380, 470, 520, a, 0.5, 'L', 36), rp = seesawPos(1380, 470, 520, a, 0.5, 'R', 44);
            return (
              <>
                <div style={{ position: 'absolute', left: lp[0], top: lp[1], transform: 'translate(-50%,-50%)', fontSize: 48, fontWeight: 900 }}>6</div>
                <div style={{ position: 'absolute', left: rp[0], top: rp[1], transform: 'translate(-50%,-50%)', fontSize: 48, fontWeight: 900 }}>8</div>
              </>
            );
          })()}
          <R x={1120} y={610} start={cue(scene, 4, 'six times')} tex="6\times 6=36" />
          <R x={1120} y={695} start={cue(scene, 4, 'but eight')} tex="8\times 8=64" />
          <R x={1500} y={650} start={cue(scene, 4, 'sixty-four') - 6} tex="36\ne 64" color={RED} />
        </>
      ))}
      {win(5, (
        <>
          <TrapHead y={170} start={l(5, 0)} label="E" tex="15:7" />
          <R y={310} start={cue(scene, 5, 'ca to')} tex="CA:AE=15:7" color={RED} />
          <Tag x={PX} y={420} start={cue(scene, 5, "that's a ratio")} color={RED} size={46} w={860}>a ratio on a side, not on AD</Tag>
        </>
      ))}
      {win(6, (
        <div style={{ position: 'absolute', left: PX, top: 260, width: 840, background: C.card, borderRadius: 36, padding: '36px 40px', boxShadow: '0 10px 40px rgba(30,40,80,0.1)', border: `6px solid ${C.primary}`, ...fadeUp(f, l(6, 0.4)) }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.primary }}>A great habit</div>
          <div style={{ fontSize: 56, fontWeight: 900, marginTop: 10, lineHeight: 1.2 }}>Check every seesaw balances before you merge weights.</div>
        </div>
      ))}
    </>
  );
};

const SIDES_V: [string, string, string] = ['3', '4', '5'];
const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0);
  const glow = pulse(f, l1, l1 + 30);
  const Dv = px(VAR, VAR.D), Ev = px(VAR, VAR.E);
  return (
    <>
      <Fig g={VAR} tri={ease(f, 6, 30)} circ={ease(f, 20, 30)} D={ease(f, at(scene, 0, 0.7), 8)} E={ease(f, at(scene, 0, 0.8), 8)} sides={SIDES_V} sidesOp={ease(f, 10, 14)}
        ad={ease(f, l1 + 12, 22)} be={ease(f, l1 + 22, 22)} split={0} pAt={at(scene, 1, 0.5)}
        svg={
          <>
            <circle cx={Dv[0]} cy={Dv[1]} r={26 * glow} fill="none" stroke={AMB} strokeWidth={7} />
            <circle cx={Ev[0]} cy={Ev[1]} r={26 * glow} fill="none" stroke={AMB} strokeWidth={7} />
          </>
        } />
      <div style={{ position: 'absolute', left: PX, top: 170, width: 860, background: C.card, borderRadius: 32, padding: '26px 36px', boxShadow: '0 10px 40px rgba(30,40,80,0.08)', ...fadeUp(f, 6) }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: C.violet, marginBottom: 6 }}>Your turn</div>
        <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.3 }}>New triangle, right angle at B. AB = 3, BC = 4, CA = 5. The incircle touches BC at D and CA at E. AD and BE meet at P.</div>
      </div>
      <R y={520} start={l1 + 10} tex={`AP:PD=\\;?`} size={72} />
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Fig g={VAR} D={1} E={1} ad={1} be={1} sides={SIDES_V} pAt={4} />
      <R x={PX} y={190} start={8} tex="AP:PD=\;?" size={60} />
      <Countdown scene={scene} seconds={10} x={1600} y={600} tick={TICK} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const li = lineIdx(scene, f);
  const g = VAR;
  const Av = px(g, g.A), Bv = px(g, g.B), Cv = px(g, g.C), Dv = px(g, g.D);
  const dsc = li >= 4;
  const dAt = cue(scene, 4, 'eight');
  return (
    <>
      <Fig g={g} D={1} E={1} ad={1} be={1} sides={SIDES_V} sidesOp={fadeTo(f, l(2, 0), 0, 12)} pAt={-1000} letters={1} off={dsc ? 1.9 : 1}
        svg={<PiecesSvg g={g} draw={ease(f, l(2, 0.1), 20)} ticks={0} only={['BD', 'CD', 'CE', 'AE']} />}
        html={
          <>
            <PieceLabels g={g} nums={{ BD: ease(f, l(2, 0.15), 10), CD: ease(f, l(2, 0.35), 10), CE: ease(f, l(2, 0.55), 10), AE: ease(f, l(2, 0.8), 10) }} />
            <Disc x={Bv[0]} y={Bv[1]} text="6" color={PURP} r={44} op={ease(f, cue(scene, 4, 'b is six') , 8)} />
            <Disc x={Cv[0]} y={Cv[1]} text="2" color={AMB} r={44} op={ease(f, cue(scene, 4, 'c is two'), 8)} />
            <Disc x={Av[0]} y={Av[1]} text="3" color={GREEN} r={44} op={ease(f, cue(scene, 4, 'a is three'), 8)} />
            {dsc && <Disc x={Dv[0] + 85} y={Dv[1] - 62} text="8" color={GREEN} r={44} s={popS(f, dAt)} />}
          </>
        } />
      <R y={190} start={l(0, 0.25)} tex="\dfrac{3+4+5}{2}=6" />
      <R y={318} start={cue(scene, 0, 'so x')} tex="x=6-4=2" />
      <R y={403} start={l(1, 0.3)} tex="y=1\qquad z=3" />
      <R y={488} start={l(3, 0.35)} tex="B\times 1=C\times 3=A\times 2=6" />
      <R y={573} start={dAt} tex="6+2=8" />
      <R y={660} start={l(5, 0.05)} tex="3\times AP=8\times PD" />
      <Badge x={1600} y={815} value="8 : 3" start={l(5, 0.8)} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const one = 1 - ease(f, l(1, 0.02), 12);
  const g = MAIN;
  const allNums = { AF: 1, AE: 1, BF: 1, BD: 1, CD: 1, CE: 1 } as Record<PK, number>;
  const m1 = cue(scene, 1, 'ratio');
  return (
    <>
      <Fig {...mainProps({ F: 1, ad: ease(f, l(1, 0.1), 16), be: 0, split: 1, letters: 1, off: f >= l(1, 0.05) ? 1.9 : 1, hideD: f >= l(1, 0.05), pAt: l(1, 0.7),
        svg: <g opacity={one}><PiecesSvg g={g} draw={ease(f, l(0, 0.15), 20)} ticks={ease(f, l(0, 0.5), 10)} /></g>,
        html: (
          <>
            <div style={{ opacity: one }}><PieceLabels g={g} nums={Object.fromEntries(Object.entries(allNums).map(([k, v]) => [k, v * ease(f, l(0, 0.4), 10)])) as Partial<Record<PK, number>>} /></div>
            <Disc x={Ap0[0]} y={Ap0[1]} text="24" color={GREEN} op={ease(f, l(1, 0.1), 8)} />
            <Disc x={Bp0[0]} y={Bp0[1]} text="28" color={PURP} op={ease(f, l(1, 0.2), 8) * (1 - ease(f, l(1, 0.45), 8))} />
            <Disc x={Cp0[0]} y={Cp0[1]} text="21" color={AMB} op={ease(f, l(1, 0.3), 8) * (1 - ease(f, l(1, 0.45), 8))} />
            <Disc x={Dp0[0]} y={Dp0[1]} text="49" color={GREEN} r={56} s={popS(f, l(1, 0.45))} />
          </>
        ) })} />
      <Win a={l(0, 0.2)} b={l(1, 0)}>
        <Tag x={PX} y={250} start={l(0, 0.2)} color={C.ink} size={52} w={860}>Equal tangents tell us where the circle touches</Tag>
        <R y={470} start={l(0, 0.5)} tex="x=7,\;y=6,\;z=8" />
      </Win>
      <R y={230} start={l(1, 0.3)} tex="28+21=49" op={1} />
      <R y={340} start={m1} tex={`\\color{${GREEN}}AP\\color{${C.ink}}:\\color{${PURP}}PD=49:24`} size={68} />
      <SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  tangents: Tangents,
  mass: Mass,
  reveal: Reveal,
  parallel: Parallel,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-07-incircle-cevians-thumb`, render.sh → poster.jpg): the 13-14-15 triangle, incircle and the two lines crossing at P, no answer.
export const Thumb: React.FC = () => {
  const g: Geo = { ...MAIN, U: 40, ox: 62, oy: 565 };
  const [A, B, Cc, I, D, E, P] = [g.A, g.B, g.C, g.I, g.D, g.E, g.P].map((p) => px(g, p));
  const lab = (p: V, dx: number, dy: number, t: string, color = C.ink) => (
    <text x={p[0] + dx} y={p[1] + dy} fontFamily={NUNITO} fontWeight={900} fontSize={54} textAnchor="middle" dominantBaseline="central" fill={color} paintOrder="stroke" stroke={C.bg} strokeWidth={8}>{t}</text>
  );
  return (
    <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>2:1?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <path d={`M ${A.join(' ')} L ${B.join(' ')} L ${Cc.join(' ')} Z`} fill={C.card} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
        <circle cx={I[0]} cy={I[1]} r={g.r * g.U} fill="none" stroke={C.blue} strokeWidth={7} />
        <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke={GRAY} strokeWidth={8} strokeLinecap="round" />
        <line x1={B[0]} y1={B[1]} x2={E[0]} y2={E[1]} stroke={GRAY} strokeWidth={8} strokeLinecap="round" />
        <circle cx={P[0]} cy={P[1]} r={14} fill={RED} stroke="#fff" strokeWidth={3} />
        {lab(A, 0, -34, 'A')}
        {lab(B, -34, 6, 'B')}
        {lab(Cc, 34, 6, 'C')}
        {lab(D, 0, 40, 'D')}
        {lab(E, 40, -8, 'E')}
        {lab(P, 4, 40, 'P', RED)}
      </svg>
    </ThumbFrame>
  );
};

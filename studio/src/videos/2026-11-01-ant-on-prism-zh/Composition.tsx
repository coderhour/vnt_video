import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, XMark, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Confetti, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-11-01-ant-on-prism-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- mixed maths + hanzi (hanzi never go inside KaTeX, whose \text font is serif) ----------

type Part = string | { z: string; c?: string };
const Z: React.FC<{ p: Part[] | string; size: number; color?: string }> = ({ p, size, color = C.ink }) =>
  typeof p === 'string' ? (
    <Tex tex={p} size={size} color={color} />
  ) : (
    <span style={{ whiteSpace: 'nowrap', color }}>
      {p.map((x, i) =>
        typeof x === 'string' ? (
          <Tex key={i} tex={x} size={size} color={color} />
        ) : (
          <span key={i} style={{ fontFamily: ZH_FONT, fontSize: size * 0.9, fontWeight: 800, color: x.c ?? color, margin: '0 0.12em' }}>{x.z}</span>
        ),
      )}
    </span>
  );
const z = (t: string): Part => ({ z: t });
/** P(E 比 A 先到) and the same with a start corner. */
const race = (w: string, start = false): Part[] => ['P(\\text{' + w + '}', z('比'), '\\text{A}', z('先到'), ')', ...(start ? [z('，从 C 出发')] : [])];

// ---------- the prism (oblique projection, screen y grows downward) ----------

const OFF: Record<string, Pt> = { A: [0, 0], B: [420, 0], C: [314, -95], D: [0, -420], E: [420, -420], F: [314, -515] };
const KEYS = 'ABCDEF'.split('');
const EDGES = ['AB', 'BC', 'AC', 'DE', 'EF', 'DF', 'AD', 'BE', 'CF'];
const HIDDEN = new Set(['AC', 'BC', 'CF']);
const BOT = ['AB', 'BC', 'AC'];
const TOP = ['DE', 'EF', 'DF'];
const SIG: Record<string, string> = { A: 'E', E: 'A', B: 'D', D: 'B', C: 'F', F: 'C' };
const TAU: Record<string, string> = { A: 'F', F: 'A', C: 'D', D: 'C', B: 'E', E: 'B' };
const LAB: Record<string, Pt> = { A: [-42, 38], B: [42, 38], C: [44, 32], D: [-42, -30], E: [42, -30], F: [40, -36] };
const CHIP: Record<string, Pt> = { A: [-42, 100], B: [42, 100], C: [-100, -28], D: [-42, -92], E: [42, -92], F: [-92, -14] };
export const FRONT_C: Pt = [210, -210];
export const BACK_C: Pt = [314, -305];

export const VC: Record<string, string> = { c: C.violet, b: C.blue, d: C.amber, f: '#e0569b', e: '#14b8c4' };
export const RED = C.red;
export const GRN = C.green;
export const v = (k: string, tex = k) => `\\textcolor{${VC[k]}}{${tex}}`;
const z0 = '\\textcolor{#ef4343}{0}';
const z1 = '\\textcolor{#21c45d}{1}';

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Position of vertex k relative to the prism origin, after a half-turn of angle theta (0..PI). */
const rel = (k: string, theta: number): Pt => {
  if (theta <= 0) return OFF[k];
  const c = k === 'C' || k === 'F' ? BACK_C : FRONT_C;
  const dx = OFF[k][0] - c[0];
  const dy = OFF[k][1] - c[1];
  const cs = Math.cos(theta);
  const sn = Math.sin(theta);
  return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs];
};

/** Plain screen position of a vertex (no spin). */
export const P = (O: Pt, k: string, s = 1): Pt => [O[0] + OFF[k][0] * s, O[1] + OFF[k][1] * s];

export type VS = {
  fill?: string;
  ring?: string;
  ringO?: number;
  ringR?: number;
  chip?: string;
  chipC?: string;
  chipO?: number;
  tag?: string;
  tagC?: string;
  tagO?: number;
  tagOff?: Pt;
  labelO?: number;
};
export type Hi = { c: string; o: number; w?: number };

const TAGOFF: Record<string, Pt> = { A: [-150, 10], E: [150, 0], F: [165, -5] };

export const Prism: React.FC<{
  O: Pt;
  s?: number;
  bot?: number;
  top?: number;
  vert?: number;
  theta?: number;
  swap?: Record<string, number>;
  tint?: { verts: string[]; c: string; o: number };
  hi?: Record<string, Hi>;
  vs?: Record<string, VS>;
  labels?: number;
  chipSize?: number;
  chipPush?: number;
  chipOff?: Record<string, Pt>;
  children?: React.ReactNode;
}> = ({ O, s = 1, bot = 1, top = 1, vert = 1, theta = 0, swap = {}, tint, hi = {}, vs = {}, labels = 1, chipSize = 46, chipPush = 0, chipOff = {}, children }) => {
  const spinning = theta > 0.001 && theta < Math.PI - 0.001;
  const u = Math.min(1, Math.max(0, theta / Math.PI));
  const tok = (k: string): Pt => {
    const r = rel(k, theta);
    let p: Pt = [O[0] + r[0] * s, O[1] + r[1] * s];
    const w = swap[k] ?? 0;
    if (w > 0) {
      const q = P(O, TAU[k], s);
      const m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const a = Math.PI * w;
      const dx = p[0] - m[0];
      const dy = p[1] - m[1];
      p = [m[0] + dx * Math.cos(a) - dy * Math.sin(a), m[1] + dx * Math.sin(a) + dy * Math.cos(a)];
    }
    return p;
  };
  const off = (tbl: Record<string, Pt>, k: string): Pt => {
    const a = lerp(tbl[k], tbl[SIG[k]], u);
    return lerp(a, tbl[TAU[k]], swap[k] ?? 0);
  };
  const std = (k: string) => P(O, k, s);
  const edgePts = (e: string): [Pt, Pt] => (spinning ? [tok(e[0]), tok(e[1])] : [std(e[0]), std(e[1])]);
  const prog = (e: string) => (BOT.includes(e) ? bot : TOP.includes(e) ? top : vert);
  const hid = (e: string) => HIDDEN.has(e) && !spinning;
  return (
    <>
      <Stage>
        {tint && tint.o > 0 && (
          <polygon points={tint.verts.map((k) => tok(k).join(',')).join(' ')} fill={tint.c} opacity={tint.o} />
        )}
        {EDGES.map((e) => {
          const [a, b] = edgePts(e);
          const p = prog(e);
          if (p <= 0) return null;
          const h = hid(e);
          return (
            <line key={e} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={h ? p * 0.85 : 0.85}
              pathLength={1} strokeDasharray={h ? '0.03 0.025' : 1} strokeDashoffset={h ? 0 : 1 - p} />
          );
        })}
        {Object.entries(hi).map(([e, h]) => {
          if (h.o <= 0) return null;
          const [a, b] = edgePts(e);
          return <line key={`hi${e}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={h.c} strokeWidth={h.w ?? 14} strokeLinecap="round" opacity={h.o} />;
        })}
        {KEYS.map((k) => {
          const p = tok(k);
          const st = vs[k];
          const vis = Math.min(1, ('ABC'.includes(k) ? bot : top) * 3);
          return (
            <g key={k} opacity={vis}>
              <circle cx={p[0]} cy={p[1]} r={13} fill={st?.fill ?? '#fff'} stroke={C.ink} strokeWidth={4} />
              {st?.ring && (st.ringO ?? 1) > 0 && (
                <circle cx={p[0]} cy={p[1]} r={st.ringR ?? 32} fill="none" stroke={st.ring} strokeWidth={6} opacity={st.ringO ?? 1} />
              )}
            </g>
          );
        })}
        {KEYS.map((k) => {
          const p = tok(k);
          const o = off(LAB, k);
          const lo = (vs[k]?.labelO ?? 1) * labels * Math.min(1, ('ABC'.includes(k) ? bot : top) * 3);
          if (lo <= 0) return null;
          return (
            <text key={k} x={p[0] + o[0] * s} y={p[1] + o[1] * s} opacity={lo} fill={C.ink} fontFamily={NUNITO} fontWeight={900} fontSize={50} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
              {k}
            </text>
          );
        })}
        {children}
      </Stage>
      {KEYS.map((k) => {
        const st = vs[k];
        if (!st) return null;
        const p = tok(k);
        return (
          <div key={k}>
            {st.chip && (st.chipO ?? 1) > 0 && (() => {
              const o0 = off(CHIP, k);
              const o: Pt = [o0[0] + ('CF'.includes(k) ? -chipPush : 0), o0[1] + ('AB'.includes(k) ? chipPush : 'DE'.includes(k) ? -chipPush : 0)];
              if (chipOff[k]) { o[0] += chipOff[k][0] / s; o[1] += chipOff[k][1] / s; }
              return (
                <div style={{ position: 'absolute', left: p[0] + o[0] * s, top: p[1] + o[1] * s, transform: 'translate(-50%,-50%)', background: st.chipC ?? C.violet, color: '#fff', borderRadius: 18, padding: '2px 18px', minWidth: 72, textAlign: 'center', whiteSpace: 'nowrap', opacity: st.chipO ?? 1, boxShadow: '0 4px 14px rgba(30,40,80,0.18)' }}>
                  <Tex tex={st.chip} size={chipSize} color="#fff" />
                </div>
              );
            })()}
            {st.tag && (st.tagO ?? 1) > 0 && (() => {
              const o = st.tagOff ?? TAGOFF[k] ?? [0, 0];
              return (
                <div style={{ position: 'absolute', left: p[0] + o[0] * s, top: p[1] + o[1] * s, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * (st.tagO ?? 1)})`, background: st.tagC ?? GRN, color: '#fff', borderRadius: 999, padding: '4px 28px', fontSize: 42, fontWeight: 900, opacity: st.tagO ?? 1, whiteSpace: 'nowrap' }}>
                  {st.tag}
                </div>
              );
            })()}
          </div>
        );
      })}
    </>
  );
};

// ---------- small pieces ----------

export const Ant: React.FC<{ p: Pt; opacity?: number }> = ({ p, opacity = 1 }) => (
  <g transform={`translate(${p[0]} ${p[1]})`} opacity={opacity}>
    <path d="M -6 -8 L -12 -22 M 6 -8 L 12 -22" stroke="#3b2a1d" strokeWidth={3.5} strokeLinecap="round" fill="none" />
    <circle r={17} fill="#3b2a1d" stroke="#fff" strokeWidth={4} />
    <circle cx={-6} cy={-3} r={3.5} fill="#fff" />
    <circle cx={6} cy={-3} r={3.5} fill="#fff" />
  </g>
);

export type Mv = { t: number; to: string; d?: number };
export const antAt = (f: number, O: Pt, start: string, moves: Mv[], s = 1): Pt => {
  let cur = start;
  for (const m of moves) {
    const d = m.d ?? 18;
    if (f < m.t) return P(O, cur, s);
    if (f < m.t + d) return lerp(P(O, cur, s), P(O, m.to, s), ease(f, m.t, d));
    cur = m.to;
  }
  return P(O, cur, s);
};

const pulse = (f: number, st: number) => Math.max(0, 1 - Math.abs(f - st - 10) / 10);

export const Arrow: React.FC<{ a: Pt; b: Pt; color: string; o: number; both?: boolean; bend?: number; w?: number }> = ({ a, b, color, o, both = false, bend = 0, w = 6 }) => {
  if (o <= 0) return null;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const cx = (a[0] + b[0]) / 2 + nx * bend;
  const cy = (a[1] + b[1]) / 2 + ny * bend;
  const sh = 26;
  const a2: Pt = [a[0] + (cx - a[0]) / Math.hypot(cx - a[0], cy - a[1]) * sh, a[1] + (cy - a[1]) / Math.hypot(cx - a[0], cy - a[1]) * sh];
  const b2: Pt = [b[0] + (cx - b[0]) / Math.hypot(cx - b[0], cy - b[1]) * sh, b[1] + (cy - b[1]) / Math.hypot(cx - b[0], cy - b[1]) * sh];
  const head = (tip: Pt, from: Pt) => {
    const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
    const h = (q: number) => [tip[0] - 20 * Math.cos(ang + q), tip[1] - 20 * Math.sin(ang + q)].join(' ');
    return `M ${h(0.5)} L ${tip[0]} ${tip[1]} L ${h(-0.5)}`;
  };
  return (
    <g opacity={o} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${a2[0]} ${a2[1]} Q ${cx} ${cy} ${b2[0]} ${b2[1]}`} />
      <path d={head(b2, [cx, cy])} />
      {both && <path d={head(a2, [cx, cy])} />}
    </g>
  );
};

export const Eq: React.FC<{
  y: number; tex: string; start: number; x?: number; size?: number; color?: string; end?: number;
  box?: string; mv?: { at: number; x: number; y: number }; mark?: number;
}> = ({ y, tex, start, x = 840, size = 56, color = C.ink, end, box, mv, mark }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const m = mv ? ease(f, mv.at, 20) : 0;
  const px = mv ? x + (mv.x - x) * m : x;
  const py = mv ? y + (mv.y - y) * m : y;
  const o = (s.opacity as number) * (end === undefined ? 1 : fadeTo(f, end, 0, 12));
  const bx = box ? ease(f, start + 6, 14) : 0;
  const mk = mark === undefined ? 0 : ease(f, mark, 18);
  return (
    <div style={{ position: 'absolute', left: px, top: py, whiteSpace: 'nowrap', transform: s.transform, opacity: o, padding: '4px 22px', borderRadius: 20, border: box ? `5px solid ${bx > 0.5 ? box : 'transparent'}` : '5px solid transparent', backgroundImage: mark === undefined ? undefined : `linear-gradient(${C.primarySoft}, ${C.primarySoft})`, backgroundSize: `${mk * 100}% 100%`, backgroundRepeat: 'no-repeat' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; start: number; end?: number; border?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, start, end, border, children, style }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const o = (s.opacity as number) * (end === undefined ? 1 : fadeTo(f, end, 0, 12));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 28, padding: '20px 30px', boxShadow: '0 8px 28px rgba(30,40,80,0.09)', border: border ? `5px solid ${border}` : undefined, transform: s.transform, opacity: o, fontSize: 48, fontWeight: 800, ...style }}>
      {children}
    </div>
  );
};

export const VALUES = ['\\dfrac{1}{3}', '\\dfrac{4}{11}', '\\dfrac{5}{11}', '\\dfrac{6}{11}', '\\dfrac{7}{11}'];

/** The five answer values as plain chips (no letters: A-E are vertex names). */
export const Vals: React.FC<{ x: number; y: number; start: (i: number) => number; green?: number; greenAt?: number; reds?: Record<number, number>; dim?: boolean; size?: number }> = ({ x, y, start, green = -1, greenAt = 0, reds = {}, dim = false, size = 50 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 18 }}>
      {VALUES.map((t, i) => {
        const g = i === green ? ease(f, greenAt, 12) : 0;
        const r = reds[i] === undefined ? 0 : ease(f, reds[i], 12);
        const bg = g > 0.5 ? GRN : r > 0.5 ? RED : C.card;
        const on = g > 0.5 || r > 0.5;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), opacity: ease(f, start(i), 10) * (dim && !on ? 0.5 : 1), background: bg, color: on ? '#fff' : C.ink, borderRadius: 20, padding: '10px 22px', boxShadow: on ? `0 10px 26px ${g > 0.5 ? 'rgba(33,196,93,0.4)' : 'rgba(239,67,67,0.35)'}` : '0 4px 14px rgba(30,40,80,0.07)', transform: `scale(${1 + 0.1 * Math.max(g, r)})` }}>
            <Tex tex={t} size={size} />
          </div>
        );
      })}
    </div>
  );
};

const Badge: React.FC<{ x: number; y: number; tex: string; start: number; chimeAt: number; size?: number }> = ({ x, y, tex, start, chimeAt, size = 84 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = pop(f, start, fps);
  return (
    <>
      <Sequence from={chimeAt} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {sc > 0 && (
        <div style={{ position: 'absolute', left: x, top: y, background: GRN, color: '#fff', borderRadius: 40, padding: '14px 44px', transform: `scale(${sc})`, transformOrigin: 'left center', boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>
          <Tex tex={tex} size={size} color="#fff" />
        </div>
      )}
    </>
  );
};

/** The standard "E green, A red" vertex states. */
export const EA = (f: number, on: number, extra: Record<string, VS> = {}): Record<string, VS> => {
  const o = ease(f, on, 12);
  return {
    E: { fill: o > 0 ? GRN : undefined, tag: '终点', tagC: GRN, tagO: o },
    A: { fill: o > 0 ? RED : undefined, tag: '陷阱', tagC: RED, tagO: o },
    ...extra,
  };
};

const tail = (scene: Scene, i: number) => at(scene, i, 1) - 4; // chime at the END of line i

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const O: Pt = [330, 720];
  const moves: Mv[] = [
    { t: at(scene, 0, 0.06), to: 'B' },
    { t: at(scene, 0, 0.17), to: 'C' },
    { t: at(scene, 0, 0.28), to: 'F' },
  ];
  const ant = antAt(f, O, 'C', moves);
  const on = ease(f, at(scene, 0, 0.5), 14);
  const glow = (st: number) => {
    const t = (f - st) / 26;
    return t < 0 || t > 1 ? null : t;
  };
  const vs = EA(f, at(scene, 0, 0.5));
  return (
    <>
      <Prism O={O} bot={ease(f, 4, 30)} top={ease(f, 22, 30)} vert={ease(f, 12, 30)} vs={vs}>
        {[at(scene, 0, 0.5), at(scene, 0, 0.7)].map((st, i) => {
          const t = glow(st);
          return t === null ? null : <circle key={i} cx={P(O, 'E')[0]} cy={P(O, 'E')[1]} r={18 + t * 44} fill="none" stroke={GRN} strokeWidth={6} opacity={1 - t} />;
        })}
        <text x={O[0] + 210} y={O[1] - 210} opacity={on} fill={C.amber} fontFamily={NUNITO} fontWeight={900} fontSize={110} textAnchor="middle" dominantBaseline="middle">?</text>
        <Ant p={ant} opacity={ease(f, 10, 8)} />
      </Prism>
      <Text x={1050} y={200} w={800} size={64} weight={900} style={fadeUp(f, 6)}>蚂蚁、三棱柱和一场比赛</Text>
      <Text x={1050} y={300} w={800} size={46} weight={700} color={C.muted} style={fadeUp(f, at(scene, 0, 0.15))}>每秒随机爬一条棱</Text>
      <Text x={1050} y={420} w={800} size={52} weight={800} color={C.violet} style={fadeUp(f, at(scene, 0, 0.8))}>先到哪个顶点？</Text>
      <div style={{ position: 'absolute', left: 1080, top: 520, ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted, marginTop: -4 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const QO: Pt = [1230, 720];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const edgeHi = (e: string, i: number): Hi => ({ c: C.primary, o: ease(f, at(scene, 1, 0.02 + i * 0.11), 6) * fadeTo(f, at(scene, 1, 0.02 + i * 0.11 + 0.1), 0, 10), w: 16 });
  const cEdges = ['AC', 'BC', 'CF'];
  const hi: Record<string, Hi> = {
    AD: edgeHi('AD', 0), BE: edgeHi('BE', 1), CF: edgeHi('CF', 2),
  };
  cEdges.forEach((e, i) => {
    const t = at(scene, 2, 0.5 + i * 0.12);
    const o = ease(f, t, 6) * fadeTo(f, t + 14, 0, 10);
    if (o > 0) hi[e] = { c: C.amber, o, w: 16 };
  });
  const ant = ease(f, at(scene, 2, 0.1), 10);
  const rows = [
    { i: 0, node: <><b>三棱柱</b>：底面是三角形 <b>ABC</b>，顶面是 <b>DEF</b></> },
    { i: 1, node: <>棱 <b>AD</b>、<b>BE</b>、<b>CF</b> 把底面每个顶点和正上方的顶点连起来</> },
    { i: 2, node: <>蚂蚁从 <b>C</b> 出发。每秒沿所在顶点的 <b>3 条棱</b>之一爬过去，机会相等。</> },
  ];
  return (
    <>
      <Prism O={QO} bot={ease(f, at(scene, 0, 0.1), 40)} top={ease(f, at(scene, 0, 0.5), 40)} vert={ease(f, at(scene, 1, 0.05), 30)} hi={hi} vs={EA(f, at(scene, 3, 0.2))}>
        <Ant p={P(QO, 'C')} opacity={ant} />
      </Prism>
      <div style={{ position: 'absolute', left: 60, top: 130, width: 900, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {rows.map((r) => (
          <div key={r.i} style={{ ...fadeUp(f, at(scene, r.i, 0.05)), background: C.card, borderRadius: 24, padding: '16px 28px', fontSize: 42, fontWeight: 600, lineHeight: 1.35, boxShadow: '0 6px 22px rgba(30,40,80,0.07)' }}>{r.node}</div>
        ))}
        <div style={{ ...fadeUp(f, at(scene, 3, 0.05)), fontSize: 52, fontWeight: 900, color: C.violet, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
          <Z p={[...race('E'), z('？')]} size={56} color={C.violet} />
        </div>
      </div>
      <Vals x={60} y={690} start={(i) => at(scene, 4, 0.1 + i * 0.1)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const O = QO;
  const t1 = at(scene, 1, 0.15);
  const moves: Mv[] = [{ t: t1, to: 'F' }, { t: t1 + 30, to: 'D' }, { t: t1 + 60, to: 'A' }];
  const ant = antAt(f, O, 'C', moves);
  const walkFade = fadeTo(f, at(scene, 1, 0.8), 0, 14);
  const stop = t1 + 78;
  const redo = at(scene, 2, 0.0);
  const antO = f < redo ? walkFade : ease(f, redo, 10);
  const antP = f < redo ? ant : P(O, 'C');
  const route = (a: string, b: string, st: number): React.ReactNode => {
    const p = ease(f, st, 18);
    if (p <= 0) return null;
    const pa = P(O, a);
    const pb = P(O, b);
    return <line key={a + b} x1={pa[0]} y1={pa[1]} x2={pa[0] + (pb[0] - pa[0]) * p} y2={pa[1] + (pb[1] - pa[1]) * p} stroke={C.amber} strokeWidth={14} strokeLinecap="round" />;
  };
  return (
    <>
      <Prism O={O} vs={EA(f, 0)}>
        <g opacity={walkFade}>
          {route('C', 'F', t1)}
          {route('F', 'D', t1 + 30)}
          {route('D', 'A', t1 + 60)}
          <XMark at={P(O, 'A')} size={54} opacity={ease(f, stop, 8)} />
        </g>
        <Ant p={antP} opacity={antO} />
      </Prism>
      <Card x={60} y={140} w={900} start={at(scene, 0, 0.1)} style={{ fontSize: 46 }}>
        <span style={{ color: GRN }}>E</span> = 终点<br />
        <span style={{ color: RED }}>A</span> = 陷阱
      </Card>
      <Card x={60} y={360} w={900} start={at(scene, 1, 0.05)} end={at(scene, 2, 0.3)} style={{ fontSize: 44 }}>
        蚂蚁先碰到哪一个，就停在哪里。
      </Card>
      <Card x={60} y={420} w={900} start={at(scene, 2, 0.1)} border={C.primary}>
        <Z p={race('E', true)} size={54} />
      </Card>
    </>
  );
};

const makePause = (seconds: number, goal: Part[], fVertex: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const O = QO;
  const vs: Record<string, VS> = {
    A: { fill: RED, tag: '陷阱', tagC: RED },
    ...(fVertex ? { F: { fill: GRN, tag: '终点', tagC: GRN } } : { E: { fill: GRN, tag: '终点', tagC: GRN } }),
  };
  return (
    <>
      <Prism O={O} vs={vs}>
        <Ant p={P(O, 'C')} />
      </Prism>
      <Card x={60} y={130} w={900} start={6} style={{ fontSize: 44 }}>
        <Z p={goal} size={54} />
      </Card>
      <Countdown scene={scene} seconds={seconds} x={500} y={570} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// Solution scenes: prism on the left, equations on the right.
const SO: Pt = [250, 700];

const Rules: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const chipO = (st: number) => ease(f, st, 12);
  // which vertex is active per line (4..7) and its neighbours
  const act: [string, string[], string][] = [
    ['B', ['A', 'C', 'E'], 'b'],
    ['D', ['A', 'E', 'F'], 'd'],
    ['C', ['A', 'B', 'F'], 'c'],
    ['F', ['C', 'D', 'E'], 'f'],
  ];
  const ringFor = (k: string) => {
    for (let j = 0; j < 4; j++) {
      const st = t(3 + j, 0.02);
      const en = j < 3 ? t(4 + j, 0.02) : scene.frames + 999;
      if (f >= st && f < en) {
        const [a, nb, key] = act[j];
        const o = ease(f, st, 10);
        if (k === a) return { ring: VC[key], ringO: o, ringR: 42 };
        if (nb.includes(k)) return { ring: C.ink, ringO: o * 0.7, ringR: 30 };
      }
    }
    return {};
  };
  const vs: Record<string, VS> = {
    C: { chip: 'c', chipC: VC.c, chipO: chipO(t(1, 0.18)), ...ringFor('C') },
    B: { chip: 'b', chipC: VC.b, chipO: chipO(t(1, 0.3)), ...ringFor('B') },
    D: { chip: 'd', chipC: VC.d, chipO: chipO(t(1, 0.42)), ...ringFor('D') },
    F: { chip: 'f', chipC: VC.f, chipO: chipO(t(1, 0.54)), ...ringFor('F') },
    E: { fill: GRN, chip: '1', chipC: GRN, chipO: chipO(t(1, 0.7)), ...ringFor('E') },
    A: { fill: RED, chip: '0', chipC: RED, chipO: chipO(t(1, 0.85)), ...ringFor('A') },
  };
  const a3 = (k: number) => ease(f, t(2, 0.08 + k * 0.1), 12);
  const B = P(SO, 'B');
  const arrows: [string, number][] = [['A', 0], ['C', 1], ['E', 2]];
  const mid = (k: string): Pt => lerp(B, P(SO, k), 0.5);
  const rowsAt = [t(3, 0.35), t(4, 0.35), t(5, 0.35), t(6, 0.35)];
  const rowY = [250, 250, 430, 430];
  const rowX = [840, 1340, 840, 1340];
  const rowTex = [
    `${v('b')} = \\dfrac{${z0} + ${v('c')} + ${z1}}{3}`,
    `${v('d')} = \\dfrac{${z0} + ${z1} + ${v('f')}}{3}`,
    `${v('c')} = \\dfrac{${z0} + ${v('b')} + ${v('f')}}{3}`,
    `${v('f')} = \\dfrac{${v('c')} + ${v('d')} + ${z1}}{3}`,
  ];
  return (
    <>
      <Prism O={SO} vs={vs} hi={{}}>
        {arrows.map(([k, i]) => (
          <Arrow key={k} a={B} b={P(SO, k)} color={C.violet} o={a3(i) * fadeTo(f, t(2, 0.6), 0, 14)} />
        ))}
      </Prism>
      {arrows.map(([k, i]) => {
        const m = mid(k);
        const pos: Pt = k === 'A' ? [m[0], m[1] + 62] : k === 'E' ? [m[0] + 62, m[1]] : [m[0] + 160, m[1] - 14];
        const o = a3(i) * fadeTo(f, t(2, 0.6), 0, 14);
        return (
          <div key={k}>
            {k === 'C' && (
              <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: o }}>
                <line x1={m[0]} y1={m[1]} x2={pos[0] - 44} y2={pos[1]} stroke={C.violet} strokeWidth={4} strokeDasharray="6 8" strokeLinecap="round" />
              </svg>
            )}
            <div style={{ position: 'absolute', left: pos[0], top: pos[1], transform: 'translate(-50%,-50%)', opacity: o, background: C.bg, borderRadius: 14, padding: '0 10px' }}>
              <Tex tex={'\\dfrac{1}{3}'} size={52} color={C.violet} />
            </div>
          </div>
        );
      })}
      <Text x={840} y={140} w={1040} size={50} weight={800} style={{ ...fadeUp(f, t(0, 0.3)), opacity: ease(f, t(0, 0.3), 12) * fadeTo(f, t(2, 0.0), 0, 12) }}>
        每个顶点都有自己的概率
      </Text>
      <Card x={840} y={130} w={1040} start={t(2, 0.62)} border={C.violet} style={{ fontSize: 46 }}>
        概率 = 3 个邻居概率的<span style={{ color: C.violet }}>平均数</span>
      </Card>
      {rowTex.map((tx, i) => (
        <Eq key={i} x={rowX[i]} y={rowY[i]} tex={tx} start={rowsAt[i]} size={58} />
      ))}
    </>
  );
};

const CHIPS_ALL = (f: number, hl: Record<string, number> = {}): Record<string, VS> => ({
  C: { chip: 'c', chipC: VC.c },
  B: { chip: 'b', chipC: VC.b },
  D: { chip: 'd', chipC: VC.d },
  F: { chip: 'f', chipC: VC.f },
  E: { fill: GRN, chip: '1', chipC: GRN },
  A: { fill: RED, chip: '0', chipC: RED },
  ...Object.fromEntries(Object.entries(hl).map(([k, o]) => [k, { ring: C.primary, ringO: o, ringR: 42 }])),
});

const Solve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const p1End = t(4, 0.0);
  const p2End = t(6, 0.0);
  const popT = at(scene, 7, 0.4);
  const green = ease(f, popT, 8);
  const vs = CHIPS_ALL(f);
  if (green > 0) vs.C = { chip: '\\dfrac{4}{11}', chipC: GRN };
  return (
    <>
      <Prism O={SO} vs={vs} chipSize={44} />
      {/* phase 1: left column c, right column f */}
      <Eq x={840} y={170} start={t(0, 0.45)} end={p1End} tex={`3${v('c')} = ${v('b')} + ${v('f')}`} size={52} />
      <Eq x={840} y={290} start={t(1, 0.1)} end={p1End} tex={`3${v('c')} = \\dfrac{1 + ${v('c')}}{3} + ${v('f')}`} size={52} />
      <Eq x={840} y={420} start={t(1, 0.52)} end={p1End} tex={`9${v('c')} = 1 + ${v('c')} + 3${v('f')}`} size={52} />
      <Eq x={840} y={550} start={t(2, 0.3)} tex={`8${v('c')} = 1 + 3${v('f')}`} size={52} box={C.primary} end={p2End}
        mv={{ at: p1End, x: 860, y: 190 }} />
      <Eq x={1330} y={170} start={t(3, 0.1)} end={p1End} tex={`3${v('f')} = ${v('c')} + ${v('d')} + 1`} size={50} />
      <Eq x={1330} y={290} start={t(3, 0.3)} end={p1End} tex={`3${v('f')} = ${v('c')} + \\dfrac{1 + ${v('f')}}{3} + 1`} size={46} />
      <Eq x={1330} y={420} start={t(3, 0.52)} end={p1End} tex={`9${v('f')} = 3${v('c')} + 1 + ${v('f')} + 3`} size={46} />
      <Eq x={1330} y={550} start={t(3, 0.66)} tex={`8${v('f')} = 4 + 3${v('c')}`} size={52} box={C.primary} end={p2End}
        mv={{ at: p1End, x: 860, y: 290 }} />
      {/* phase 2 */}
      <Eq x={860} y={420} start={t(4, 0.5)} end={p2End} tex={`8${v('c')} + 8${v('f')} = 5 + 3${v('c')} + 3${v('f')}`} size={52} />
      <Eq x={860} y={530} start={t(5, 0.36)} end={p2End} tex={`5${v('c')} + 5${v('f')} = 5`} size={56} />
      <Eq x={1330} y={515} start={t(5, 0.68)} tex={`${v('c')} + ${v('f')} = 1`} size={64} box={C.primary} mark={t(5, 0.8)}
        end={p2End} mv={{ at: p2End, x: 860, y: 190 }} />
      {/* phase 3 */}
      <Eq x={860} y={310} start={t(6, 0.15)} tex={`${v('f')} = 1 - ${v('c')}`} size={56} />
      <Eq x={860} y={420} start={t(6, 0.45)} tex={`8${v('c')} = 1 + 3 - 3${v('c')}`} size={56} />
      <Eq x={860} y={530} start={t(6, 0.77)} tex={`11${v('c')} = 4`} size={60} box={C.primary} />
      <Vals x={840} y={705} start={(i) => 0 + i * 3 + 6} green={1} greenAt={popT} dim size={44} />
      <Badge x={1220} y={522} size={58} tex={`${v('c', '\\textcolor{#fff}{c}')} = \\dfrac{4}{11}`} start={popT} chimeAt={tail(scene, 7)} />
    </>
  );
};

const Spin: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const spinT = t(2, 0.5);
  const theta = Math.PI * ease(f, spinT, 66);
  const tintO = ease(f, t(1, 0.1), 14) * 0.2;
  const ring = (o: number): VS => ({ ring: C.violet, ringO: o, ringR: 40 });
  const ro = ease(f, t(1, 0.4), 12);
  const vs: Record<string, VS> = { E: { fill: GRN, ...ring(ro) }, A: { fill: RED, ...ring(ro) } };
  const diag = ease(f, t(1, 0.6), 18);
  const diagO = fadeTo(f, t(2, 0.0), 0, 10);
  const skO = fadeTo(f, t(3, 0.2), 0, 12);
  const SKC = '#6b7280';
  const A = P(SO, 'A');
  const E = P(SO, 'E');
  const sk = ease(f, t(2, 0.15), 14);
  const ext = (a: Pt, b: Pt, d: number): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [b[0] + ((b[0] - a[0]) / l) * d, b[1] + ((b[1] - a[1]) / l) * d];
  };
  const c1: Pt = [SO[0] + FRONT_C[0], SO[1] + FRONT_C[1]];
  const c2: Pt = [SO[0] + BACK_C[0], SO[1] + BACK_C[1]];
  const s1 = ext(c2, c1, 80);
  const s2 = ext(c1, c2, 80);
  const pairs: [string, string, string, number][] = [['A', 'E', C.violet, 40], ['B', 'D', C.blue, -40], ['C', 'F', C.amber, 70]];
  const a4 = (i: number) => ease(f, t(3, 0.05 + i * 0.24), 12);
  return (
    <>
      <Prism O={SO} theta={theta} vs={vs} tint={{ verts: ['A', 'B', 'E', 'D'], c: C.primary, o: tintO }}>
        {diag > 0 && diagO > 0 && (
          <line x1={A[0]} y1={A[1]} x2={A[0] + (E[0] - A[0]) * diag} y2={A[1] + (E[1] - A[1]) * diag} stroke={C.violet} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" opacity={diagO} />
        )}
        {sk > 0 && skO > 0 && (
          <g opacity={skO}>
            <line x1={s1[0]} y1={s1[1]} x2={s1[0] + (s2[0] - s1[0]) * sk} y2={s1[1] + (s2[1] - s1[1]) * sk} stroke={SKC} strokeWidth={9} strokeLinecap="round" />
            <circle cx={c1[0]} cy={c1[1]} r={14} fill={SKC} stroke="#fff" strokeWidth={4} />
          </g>
        )}
        {pairs.map(([a, b, col, bend], i) => (
          <Arrow key={a + b} a={P(SO, a)} b={P(SO, b)} color={col} o={a4(i)} both bend={bend} w={7} />
        ))}
      </Prism>
      <Card x={840} y={130} w={620} start={t(0, 0.1)} border={C.primary} style={{ fontSize: 64, textAlign: 'center', padding: '8px 30px' }}>
        <Tex tex={`${v('c')} + ${v('f')} = 1`} size={70} />
      </Card>
      <div style={{ position: 'absolute', left: 840, top: 300, background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 34px', fontSize: 46, fontWeight: 900, ...fadeUp(f, t(3, 0.75)) }}>
        还是同一个三棱柱！
      </div>
      <div style={{ position: 'absolute', left: 840, top: 410, display: 'flex', alignItems: 'center', gap: 26 }}>
        <Card x={0} y={0} w={400} start={t(4, 0.1)} style={{ position: 'relative', fontSize: 44, textAlign: 'center', lineHeight: 1.3 }}>
          从 <b style={{ color: VC.f }}>F</b> 出发
          <br />
          先到 <b style={{ color: GRN }}>E</b>
        </Card>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.violet, opacity: ease(f, t(4, 0.52), 12) }}>=</div>
        <Card x={0} y={0} w={400} start={t(4, 0.55)} style={{ position: 'relative', fontSize: 44, textAlign: 'center', lineHeight: 1.3 }}>
          从 <b style={{ color: VC.c }}>C</b> 出发
          <br />
          先到 <b style={{ color: RED }}>A</b>
        </Card>
      </div>
      <Eq x={840} y={660} start={t(5, 0.55)} tex={`${v('f')} = 1 - ${v('c')}`} size={58} />
      <Eq x={1300} y={660} start={t(5, 0.8)} tex={`${v('d')} = 1 - ${v('b')}`} size={58} />
    </>
  );
};

const SpinSolve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const end = t(2, 0.0);
  const popT = t(1, 0.78);
  const vs = CHIPS_ALL(f);
  if (ease(f, popT, 8) > 0) vs.C = { chip: '\\dfrac{4}{11}', chipC: GRN };
  return (
    <>
      <Prism O={SO} vs={vs} chipSize={44} />
      <Eq x={840} y={150} start={t(0, 0.3)} end={end} tex={`8${v('c')} = 1 + 3${v('f')}`} size={56} box={C.primary} />
      <Eq x={840} y={260} start={t(0, 0.62)} end={end} tex={`${v('f')} = 1 - ${v('c')}`} size={56} />
      <Eq x={840} y={370} start={t(1, 0.02)} end={end} tex={`8${v('c')} = 1 + 3 - 3${v('c')}`} size={56} />
      <Eq x={840} y={480} start={t(1, 0.15)} end={end} tex={`8${v('c')} = 4 - 3${v('c')}`} size={56} />
      <Eq x={840} y={590} start={t(1, 0.45)} end={end} tex={`11${v('c')} = 4`} size={60} box={C.primary} />
      <Vals x={840} y={705} start={(i) => 6 + i * 3} green={1} greenAt={popT} dim size={44} />
      <div style={{ opacity: fadeTo(f, end, 0, 12) }}>
        <Badge x={1350} y={460} tex={'\\dfrac{4}{11}'} start={popT} chimeAt={tail(scene, 1)} size={60} />
      </div>
      <Card x={840} y={330} w={1030} start={t(2, 0.15)} border={C.violet} style={{ fontSize: 46 }}>
        找一种能对调输赢的<span style={{ color: C.violet }}>转法</span>
      </Card>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const O: Pt = [230, 665];
  const reveal = (st: number) => ease(f, st, 12);
  const vs: Record<string, VS> = {
    A: { fill: RED, chip: '0', chipC: RED, chipO: reveal(0) },
    E: { fill: GRN, chip: '1', chipC: GRN, chipO: reveal(0) },
    C: { chip: '\\dfrac{4}{11}', chipC: GRN, chipO: reveal(t(0, 0.3)) },
    B: { chip: '\\dfrac{5}{11}', chipC: RED, chipO: reveal(t(2, 0.1)) },
    D: { chip: '\\dfrac{6}{11}', chipC: RED, chipO: reveal(t(3, 0.1)) },
    F: { chip: '\\dfrac{7}{11}', chipC: RED, chipO: reveal(t(4, 0.1)) },
  };
  const glow = (k: string, st: number): void => {
    const o = reveal(st) * fadeTo(f, st + 40, 0, 14);
    if (o > 0) vs[k] = { ...vs[k], ring: RED, ringO: o, ringR: 44 };
  };
  glow('B', t(2, 0.1));
  glow('D', t(3, 0.1));
  glow('F', t(4, 0.1));
  const reds = { 0: t(1, 0.1), 2: t(2, 0.1), 3: t(3, 0.1), 4: t(4, 0.1) };
  const last = scene.frames + 999;
  return (
    <>
      <Prism O={O} s={0.82} vs={vs} chipSize={44} chipPush={40} chipOff={{ D: [-14, -24], F: [85, -80] }} />
      <Vals x={800} y={130} start={(i) => t(0, 0.1 + i * 0.1)} green={1} greenAt={t(0, 0.1)} reds={reds} size={46} />
      {/* line 1: the 1/3 guess */}
      <Eq x={800} y={300} start={t(1, 0.25)} end={t(2, 0.0)} tex={'\\dfrac{0 + \\tfrac12 + \\tfrac12}{3} = \\dfrac{1}{3}'} size={58} />
      <div style={{ position: 'absolute', left: 800, top: 478, fontSize: 44, fontWeight: 800, color: RED, opacity: ease(f, t(1, 0.45), 12) * fadeTo(f, t(2, 0), 0, 12) }}>
        猜 <span style={{ textDecoration: 'line-through' }}>b</span> 和 <span style={{ textDecoration: 'line-through' }}>f</span> 都是 ½
      </div>
      {/* line 2 */}
      <Eq x={800} y={330} start={t(2, 0.3)} end={t(3, 0.0)} tex={`${v('b')} = \\dfrac{1 + \\tfrac{4}{11}}{3} = \\dfrac{5}{11}`} size={60} />
      <Text x={800} y={510} w={1080} size={44} color={RED} style={{ opacity: ease(f, t(2, 0.5), 12) * fadeTo(f, t(3, 0), 0, 12) }}>算得没错，但这是 B 点的概率</Text>
      {/* line 3 */}
      <Eq x={800} y={330} start={t(3, 0.3)} end={t(4, 0.0)} tex={`${v('d')} = 1 - \\dfrac{5}{11} = \\dfrac{6}{11}`} size={60} />
      <Text x={800} y={510} w={1080} size={44} color={RED} style={{ opacity: ease(f, t(3, 0.5), 12) * fadeTo(f, t(4, 0), 0, 12) }}>D 点的概率：起点选错了</Text>
      {/* line 4 */}
      <Eq x={800} y={330} start={t(4, 0.3)} end={last} tex={`${v('f')} = 1 - \\dfrac{4}{11} = \\dfrac{7}{11}`} size={60} />
      <Text x={800} y={510} w={1080} size={44} color={RED} style={{ opacity: ease(f, t(4, 0.5), 12) }}>从 C 出发 A 先到：比赛看反了</Text>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const O = QO;
  const sw = ease(f, at(scene, 1, 0.15), 16);
  const vs: Record<string, VS> = {
    A: { fill: RED, tag: '陷阱', tagC: RED },
    E: { fill: sw < 0.5 ? GRN : undefined, tag: '终点', tagC: GRN, tagO: 1 - sw },
    F: { fill: sw > 0.5 ? GRN : undefined, tag: '终点', tagC: GRN, tagO: sw },
  };
  return (
    <>
      <Prism O={O} vs={vs}>
        <Ant p={P(O, 'C')} />
      </Prism>
      <Text x={60} y={150} w={900} size={54} weight={900} style={fadeUp(f, 4)}>换个终点</Text>
      <Text x={60} y={240} w={900} size={46} weight={700} color={C.muted} style={fadeUp(f, at(scene, 0, 0.3))}>还是这个三棱柱，蚂蚁还是从 C 出发。</Text>
      <Card x={60} y={380} w={900} start={at(scene, 1, 0.55)} border={C.primary}>
        <Z p={race('F', true)} size={54} />
      </Card>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const back = t(2, 0.0);
  const fly = (st: number) => ease(f, st, 28) * (1 - ease(f, back, 18));
  const swap: Record<string, number> = {
    A: fly(t(1, 0.0)), F: fly(t(1, 0.0)),
    C: fly(t(1, 0.2)), D: fly(t(1, 0.2)),
    B: fly(t(1, 0.41)), E: fly(t(1, 0.41)),
  };
  const ro = ease(f, t(0, 0.3), 12);
  const ringS = (o: number): Partial<VS> => ({ ring: C.violet, ringO: o, ringR: 40 });
  const hl = (ks: string[], act: string, st: number): Record<string, Partial<VS>> => {
    const o = ease(f, st, 10);
    const r: Record<string, Partial<VS>> = {};
    ks.forEach((k) => (r[k] = { ring: C.ink, ringO: o * 0.7, ringR: 30 }));
    r[act] = { ring: act === 'C' ? VC.c : VC.b, ringO: o, ringR: 44 };
    return r;
  };
  const r2 = f >= t(2, 0.02) && f < t(3, 0.02) ? hl(['A', 'B', 'F'], 'C', t(2, 0.02)) : {};
  const r3 = f >= t(3, 0.02) && f < t(4, 0.02) ? hl(['A', 'C', 'E'], 'B', t(3, 0.02)) : {};
  const ringAF = f < t(2, 0.0) ? { A: ringS(ro), F: ringS(ro) } : {};
  const vs: Record<string, VS> = {
    A: { fill: RED, chip: '0', chipC: RED, chipO: ease(f, t(2, 0.05), 12), ...ringAF.A, ...r2.A, ...r3.A },
    F: { fill: GRN, chip: '1', chipC: GRN, chipO: ease(f, t(2, 0.05), 12), ...ringAF.F, ...r2.F, ...r3.F },
    C: { chip: 'c', chipC: VC.c, chipO: ease(f, t(2, 0.2), 12), ...r2.C, ...r3.C },
    B: { chip: 'b', chipC: VC.b, chipO: ease(f, t(2, 0.2), 12), ...r2.B, ...r3.B },
    E: { chip: 'e', chipC: VC.e, chipO: ease(f, t(1, 0.72), 12), ...r2.E, ...r3.E },
    D: {},
  };
  const sk = ease(f, t(0, 0.72), 16) * (1 - ease(f, t(2, 0.0), 10));
  const cF = (() => {
    const sum = ['A', 'C', 'F', 'D'].reduce((a, k) => [a[0] + OFF[k][0], a[1] + OFF[k][1]] as Pt, [0, 0] as Pt);
    return [SO[0] + sum[0] / 4, SO[1] + sum[1] / 4] as Pt;
  })();
  const mBE: Pt = [SO[0] + 420, SO[1] - 210];
  const ext = (a: Pt, b: Pt, d: number): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [b[0] + ((b[0] - a[0]) / l) * d, b[1] + ((b[1] - a[1]) / l) * d];
  };
  const s1 = ext(mBE, cF, 80);
  const s2 = ext(cF, mBE, 80);
  const pairs: [string, string, string, number][] = [['A', 'F', C.violet, 60], ['C', 'D', C.blue, -50], ['B', 'E', C.amber, 50]];
  const ap = (i: number) => ease(f, t(1, 0.1 + i * 0.2), 12) * (1 - ease(f, back, 14));
  const tint = ease(f, t(0, 0.25), 14) * 0.2 * (1 - ease(f, t(2, 0.3), 14));
  const p1End = t(4, 0.0);
  const popT = at(scene, 5, 0.42);
  return (
    <>
      <Prism O={SO} vs={vs} swap={swap} tint={{ verts: ['A', 'C', 'F', 'D'], c: C.primary, o: tint }} chipSize={44}>
        {sk > 0 && <line x1={s1[0]} y1={s1[1]} x2={s1[0] + (s2[0] - s1[0]) * sk} y2={s1[1] + (s2[1] - s1[1]) * sk} stroke={C.violet} strokeWidth={9} strokeLinecap="round" />}
        {pairs.map(([a, b, col, bend], i) => (
          <Arrow key={a + b} a={P(SO, a)} b={P(SO, b)} color={col} o={ap(i)} both bend={bend} w={7} />
        ))}
      </Prism>
      <Eq x={840} y={140} start={t(1, 0.72)} end={p1End} tex={`${v('e')} = 1 - ${v('b')}`} size={56} />
      <Eq x={840} y={225} start={t(2, 0.2)} tex={`${v('c')} = \\dfrac{${z0} + ${v('b')} + ${z1}}{3}`} size={56} mv={{ at: p1End, x: 840, y: 140 }} />
      <Eq x={840} y={385} start={t(3, 0.1)} end={p1End} tex={`${v('b')} = \\dfrac{${z0} + ${v('c')} + (1 - ${v('b')})}{3}`} size={52} />
      <Eq x={840} y={540} start={t(3, 0.3)} end={p1End} tex={`3${v('b')} = ${v('c')} + 1 - ${v('b')}`} size={52} />
      <Eq x={840} y={630} start={t(3, 0.62)} tex={`4${v('b')} = ${v('c')} + 1`} size={56} mv={{ at: p1End, x: 840, y: 290 }} />
      <Eq x={840} y={380} start={t(4, 0.05)} tex={`3${v('c')} = ${v('b')} + 1`} size={56} end={t(5, 0.0)} />
      <Eq x={840} y={470} start={t(4, 0.25)} tex={`${v('b')} = 3${v('c')} - 1`} size={56} end={t(5, 0.0)} />
      <Eq x={840} y={570} start={t(4, 0.5)} tex={`4(3${v('c')} - 1) = ${v('c')} + 1`} size={52} end={t(5, 0.0)} />
      <Eq x={840} y={670} start={t(4, 0.65)} tex={`12${v('c')} - 4 = ${v('c')} + 1`} size={52} end={t(5, 0.0)} />
      <Eq x={840} y={440} start={t(5, 0.1)} tex={`11${v('c')} = 5`} size={64} box={C.primary} />
      <Badge x={1250} y={425} tex={`${v('c', '\\textcolor{#fff}{c}')} = \\dfrac{5}{11}`} start={popT} chimeAt={tail(scene, 5)} />
      <Confetti x={1450} y={520} start={t(5, 0.75)} seed={11} />
    </>
  );
};

const Num: React.FC<{ n: number; size?: number }> = ({ n, size = 64 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%', background: C.violet, color: '#fff', fontSize: size * 0.62, fontWeight: 900, flexShrink: 0 }}>{n}</span>
);

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const out = fadeTo(f, t(2, 0), 0, 12);
  const O: Pt = [150, 640];
  const sw = ease(f, t(1, 0.2), 30) * 0; // prism stays still, the rows do the talking
  void sw;
  return (
    <>
      <div style={{ opacity: out }}>
        <Prism O={O} s={0.68} vs={{ E: { fill: GRN }, A: { fill: RED } }} labels={1} />
        <Text x={1000} y={120} w={1700} size={64} weight={900} align="center" color={C.primary} style={fadeUp(f, 4)}>核心思路</Text>
        <Card x={620} y={250} w={1260} start={t(0, 0.15)} style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 48 }}>
          <Num n={1} />
          <span>概率 = 邻居概率的<span style={{ color: C.violet }}>平均数</span></span>
        </Card>
        <Card x={620} y={460} w={1260} start={t(1, 0.15)} style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 48 }}>
          <Num n={2} />
          <span>一次<span style={{ color: C.violet }}>转动</span>对调输赢，配对的两个概率加起来等于 1</span>
        </Card>
      </div>
      <SignOff start={t(2, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={t(2, 0.2)} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, race('E', true), false),
  rules: Rules,
  solve: Solve,
  spin: Spin,
  'spin-solve': SpinSolve,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, race('F', true), true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

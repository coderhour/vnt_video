import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, XMark, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-ant-on-cube';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- the cube (cavalier projection, screen y grows downward) ----------

export const P: Record<string, Pt> = {
  A: [260, 720], B: [580, 720], D: [260, 400], E: [420, 590],
  C: [580, 400], F: [740, 590], H: [420, 270], G: [740, 270],
};
const LABEL_OFF: Record<string, Pt> = {
  A: [-52, 46], B: [44, 40], C: [52, 22], D: [-46, 0], E: [40, 36], F: [50, 0], G: [48, -34], H: [-46, -34],
};
const EDGE_LIST = ['AB', 'BC', 'CD', 'AD', 'EF', 'FG', 'GH', 'EH', 'AE', 'BF', 'CG', 'DH'];
const HIDDEN = new Set(['AE', 'EF', 'EH']);
const DIR: Record<string, string[]> = {
  across: ['AB', 'CD', 'EF', 'GH'],
  up: ['AD', 'BC', 'EH', 'FG'],
  in: ['AE', 'BF', 'DH', 'CG'],
};
const DIRC: Record<string, string> = { across: C.blue, up: C.amber, in: C.violet };
const key = (a: string, b: string) => [a, b].sort().join('');
const CORNERS = 'ABCDEFGH'.split('');

type Es = { c: string; o?: number; w?: number };
type Dot = { c: string; txt?: string; r?: number };

export const Cube: React.FC<{
  draw?: number;
  edges?: Record<string, Es>;
  dots?: Record<string, Dot>;
  labels?: (k: string) => number;
  flag?: number;
  q?: number;
}> = ({ draw = 1, edges = {}, dots = {}, labels = () => 1, flag = 0, q = 0 }) => (
  <>
    {EDGE_LIST.map((e) => {
      const a = P[e[0]], b = P[e[1]];
      const hid = HIDDEN.has(e);
      return (
        <line key={e} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={hid ? draw * 0.85 : 0.85}
          pathLength={1} strokeDasharray={hid ? '0.03 0.025' : 1} strokeDashoffset={hid ? 0 : 1 - draw} />
      );
    })}
    {Object.entries(edges).map(([e, s]) => {
      const a = P[e[0]], b = P[e[1]];
      if ((s.o ?? 1) <= 0) return null;
      return <line key={e} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={s.c} strokeWidth={s.w ?? 14} strokeLinecap="round" opacity={s.o ?? 1} />;
    })}
    {CORNERS.map((k) => {
      const d = dots[k];
      const r = d?.r ?? 12;
      return (
        <g key={k} opacity={ease(draw, 0.3, 0.3)}>
          <circle cx={P[k][0]} cy={P[k][1]} r={r} fill={d?.c ?? '#fff'} stroke={C.ink} strokeWidth={4} />
          {d?.txt && <text x={P[k][0]} y={P[k][1] + 1} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={28} textAnchor="middle" dominantBaseline="middle">{d.txt}</text>}
        </g>
      );
    })}
    {CORNERS.map((k) =>
      labels(k) > 0 ? (
        <text key={k} x={P[k][0] + LABEL_OFF[k][0]} y={P[k][1] + LABEL_OFF[k][1]} opacity={labels(k)} fill={k === 'A' ? C.ink : C.ink} fontFamily={NUNITO} fontWeight={900} fontSize={54} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
          {k}
        </text>
      ) : null,
    )}
    {flag > 0 && (
      <g opacity={flag} transform={`translate(0 ${(1 - flag) * 10})`}>
        <line x1={P.G[0]} y1={P.G[1] - 14} x2={P.G[0]} y2={P.G[1] - 64} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d={`M ${P.G[0]} ${P.G[1] - 64} L ${P.G[0] - 44} ${P.G[1] - 48} L ${P.G[0]} ${P.G[1] - 32} Z`} fill={C.amber} />
      </g>
    )}
    {q > 0 && (
      <text x={P.G[0] + 100} y={P.G[1] - 70} opacity={q} fill={C.amber} fontFamily={NUNITO} fontWeight={900} fontSize={90} textAnchor="middle" dominantBaseline="middle">?</text>
    )}
  </>
);

export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export type Mv = { t: number; to: string; d?: number };
/** Ant position: starts on `start`, then slides along an edge for each move (corner to corner). */
export const antAt = (f: number, start: string, moves: Mv[]): Pt => {
  let cur = start;
  for (const m of moves) {
    const d = m.d ?? 18;
    if (f < m.t) return P[cur];
    if (f < m.t + d) return lerp(P[cur], P[m.to], ease(f, m.t, d));
    cur = m.to;
  }
  return P[cur];
};

export const Ant: React.FC<{ p: Pt; zzz?: number; opacity?: number }> = ({ p, zzz = 0, opacity = 1 }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 5) * 1.5;
  return (
    <g transform={`translate(${p[0]} ${p[1] - 16 + bob}) scale(1.3)`} opacity={opacity}>
      <g stroke="#3b2a1d" strokeWidth={3.5} strokeLinecap="round" fill="none">
        <path d="M -8 4 L -16 16 M 0 4 L 0 17 M 8 4 L 16 16 M -8 -2 L -20 -8 M 8 -2 L 20 -8" />
        <path d="M 22 -8 Q 30 -22 38 -20 M 26 -6 Q 36 -14 42 -8" />
      </g>
      <ellipse cx={-17} cy={-2} rx={13} ry={10} fill="#3b2a1d" />
      <ellipse cx={0} cy={-3} rx={9} ry={8} fill="#3b2a1d" />
      <circle cx={19} cy={-5} r={11} fill="#3b2a1d" />
      <circle cx={23} cy={-8} r={3} fill="#fff" />
      <circle cx={24} cy={-8} r={1.3} fill="#111" />
      {zzz > 0 && (
        <g opacity={zzz} fontFamily={NUNITO} fontWeight={900} fill={C.violet}>
          <text x={34} y={-40 - ((f / 3) % 14)} fontSize={34}>z</text>
          <text x={52} y={-62 - ((f / 3) % 14)} fontSize={44}>z</text>
        </g>
      )}
    </g>
  );
};

/** A route drawn as a polyline through corners, progress 0..1. */
export const Route: React.FC<{ path: string; p: number; color?: string; opacity?: number; width?: number }> = ({ path, p, color = C.green, opacity = 1, width = 16 }) =>
  p <= 0 || opacity <= 0 ? null : (
    <polyline points={path.split('').map((k) => P[k].join(',')).join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={opacity} />
  );

const pulse = (f: number, s: number) => Math.max(0, 1 - Math.abs(f - s - 10) / 10);

export const PulseRing: React.FC<{ at: Pt; f: number; start: number; color: string }> = ({ at: p, f, start, color }) => {
  const t = (f - start) / 24;
  if (t < 0 || t > 1) return null;
  return <circle cx={p[0]} cy={p[1]} r={16 + t * 34} fill="none" stroke={color} strokeWidth={6} opacity={1 - t} />;
};

// ---------- panel pieces ----------

const PANEL = 950;
const FRACS = ['1', '\\dfrac{2}{3}', '\\dfrac{1}{3}'];

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Num: React.FC<{ n: number; size?: number; color?: string }> = ({ n, size = 44, color = C.violet }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%', background: color, color: '#fff', fontSize: size * 0.62, fontWeight: 900 }}>{n}</span>
);

/** A step slot: round number badge + content (empty until given). */
const Slot: React.FC<{ x: number; y: number; n: number; tex?: string; start: number; fillAt?: number; color?: string; w?: number; sub?: string; subAt?: number }> = ({ x, y, n, tex, start, fillAt = 0, color = C.ink, w = 230, sub, subAt = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 170, background: C.card, borderRadius: 26, border: `4px dashed ${tex && f >= fillAt ? 'transparent' : C.line}`, boxShadow: tex && f >= fillAt ? '0 8px 24px rgba(30,40,80,0.09)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, start) }}>
      <div style={{ position: 'absolute', left: -16, top: -18 }}><Num n={n} size={44} /></div>
      {tex && (
        <div style={{ opacity: ease(f, fillAt, 10), transform: `scale(${0.8 + 0.2 * ease(f, fillAt, 10)})`, whiteSpace: 'nowrap' }}>
          <Tex tex={tex} size={58} color={color} />
        </div>
      )}
      {sub && (
        <div style={{ position: 'absolute', bottom: -52, width: '100%', textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.muted, opacity: ease(f, subAt, 10) }}>{sub}</div>
      )}
    </div>
  );
};

const SLOT_X = [PANEL, PANEL + 310, PANEL + 620];

export const CHOICES = ['\\dfrac{1}{27}', '\\dfrac{1}{9}', '\\dfrac{2}{9}', '\\dfrac{1}{3}', '\\dfrac{4}{9}'];

const Chips: React.FC<{ x: number; y: number; start: (i: number) => number; win?: number; winAt?: number; dim?: boolean }> = ({ x, y, start, win = -1, winAt = 0, dim = false }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 14 }}>
      {CHOICES.map((c, i) => {
        const w = i === win ? ease(f, winAt, 12) : 0;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), display: 'flex', alignItems: 'center', gap: 8, background: w > 0 ? C.green : C.card, color: w > 0 ? '#fff' : C.ink, borderRadius: 20, padding: '10px 16px', boxShadow: w > 0 ? '0 12px 30px rgba(33,196,93,0.4)' : '0 4px 14px rgba(30,40,80,0.07)', transform: `scale(${1 + 0.12 * w})`, opacity: ease(f, start(i), 10) * (dim && w === 0 ? 0.55 : 1) }}>
            <span style={{ display: 'inline-flex', width: 46, height: 46, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: w > 0 ? '#fff' : C.violet, color: w > 0 ? C.green : '#fff', fontSize: 30, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={50} />
          </div>
        );
      })}
    </div>
  );
};

const DirChip: React.FC<{ x: number; y: number; label: string; color: string; start: number; w?: number; cross?: number }> = ({ x, y, label, color, start, w = 200, cross = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: 'center', background: color, color: '#fff', borderRadius: 999, padding: '10px 0', fontSize: 44, fontWeight: 900, ...fadeUp(f, start), opacity: ease(f, start, 12) * (1 - 0.55 * cross) }}>
      {label}
      {cross > 0 && <div style={{ position: 'absolute', left: -6, right: -6, top: '50%', height: 8, background: C.red, borderRadius: 4, transform: `scaleX(${cross})`, transformOrigin: 'left' }} />}
    </div>
  );
};

const stateDots = (f: number, on: number): Record<string, Dot> => {
  const g = ease(f, on, 12);
  return g > 0 ? {} : {};
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const moves: Mv[] = [
    { t: at(scene, 0, 0.2), to: 'B', d: 18 },
    { t: at(scene, 0, 0.5), to: 'A', d: 18 },
    { t: at(scene, 0, 0.78), to: 'D', d: 18 },
  ];
  const ant = antAt(f, 'A', moves);
  const stepOn = (i: number) => ease(f, moves[i].t + 10, 8);
  return (
    <>
      <Stage>
        <Cube draw={ease(f, 4, 36)} labels={() => 0} flag={ease(f, at(scene, 1, 0.05), 14)} q={ease(f, at(scene, 1, 0.1), 14)} />
        <Ant p={ant} opacity={ease(f, 28, 8)} />
        <PulseRing at={P.G} f={f} start={at(scene, 1, 0.15)} color={C.amber} />
        <PulseRing at={P.G} f={f} start={at(scene, 1, 0.5)} color={C.amber} />
      </Stage>
      <Text x={PANEL} y={190} w={900} size={64} weight={900} style={fadeUp(f, 6)}>An ant, a cube, 3 random steps</Text>
      <div style={{ position: 'absolute', left: PANEL, top: 360, display: 'flex', gap: 40 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 150, height: 150, borderRadius: '50%', background: stepOn(i) > 0.5 ? C.primary : C.card, color: stepOn(i) > 0.5 ? '#fff' : C.muted, border: `5px solid ${stepOn(i) > 0.5 ? C.primary : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 900, transform: `scale(${1 + 0.1 * pulse(f, moves[i].t)})`, opacity: ease(f, 10 + i * 4, 10) }}>
            {i + 1}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: PANEL + 40, top: 560, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted, marginTop: -4 }}>your math tutor</div>
      </div>
    </>
  );
};

const QUESTION_ANT = 'A';

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const flash = (i: number) => ease(f, at(scene, 2, 0.15 + i * 0.22), 8) * fadeTo(f, at(scene, 2, 0.15 + i * 0.22 + 0.2), 0.0, 10);
  const tagOn = ease(f, at(scene, 3, 0.2), 12);
  const T = (a: string, b: string) => lerp(P[a], P[b], 0.5);
  const tagPos: Record<string, Pt> = { AB: [485, 660], AD: [185, 560], AE: [318, 610] };
  return (
    <>
      <div style={{ position: 'absolute', left: PANEL, top: 130, width: 900, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        An ant stands on <span style={{ fontWeight: 800 }}>corner A</span> of a cube. <span style={{ backgroundImage: `linear-gradient(${C.primarySoft},${C.primarySoft})`, backgroundSize: `${ease(f, at(scene, 2, 0.3), 18) * 100}% 100%`, backgroundRepeat: 'no-repeat', borderRadius: 8 }}>Each minute, it walks along an edge to one of the three nearest corners, each equally likely.</span>{' '}
        <span style={{ backgroundImage: `linear-gradient(${C.primarySoft},${C.primarySoft})`, backgroundSize: `${ease(f, at(scene, 4, 0.1), 18) * 100}% 100%`, backgroundRepeat: 'no-repeat', borderRadius: 8 }}>What is the probability that after 3 minutes it is at the corner farthest from its start?</span>
      </div>
      <Chips x={PANEL} y={680} start={(i) => at(scene, 5, 0.2 + i * 0.1)} />
      <Stage>
        <Cube draw={ease(f, 4, 30)} labels={(k) => (k === 'A' || k === 'G' ? ease(f, 20, 10) : 0)}
          edges={{ AB: { c: C.green, o: Math.max(flash(0), 0) }, AD: { c: C.green, o: flash(1) }, AE: { c: C.green, o: flash(2) } }}
          dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={ease(f, at(scene, 4, 0.5), 12)} />
        <Ant p={P[QUESTION_ANT]} />
        {Object.entries(tagPos).map(([e, p]) => (
          <foreignObject key={e} x={p[0] - 60} y={p[1] - 50} width={120} height={100} opacity={tagOn} style={{ overflow: 'visible' }}>
            <div style={{ display: 'flex', justifyContent: 'center', borderRadius: 14 }}>
              <Tex tex={'\\dfrac{1}{3}'} size={50} color={C.green} />
            </div>
          </foreignObject>
        ))}
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lab = (k: string) => ease(f, at(scene, 0, 0.08 + CORNERS.indexOf(k) * 0.075), 8);
  const goal = ease(f, at(scene, 2, 0.5), 12);
  return (
    <>
      <Stage>
        <Cube labels={lab} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={ease(f, at(scene, 1, 0.4), 12)} />
        <PulseRing at={P.G} f={f} start={at(scene, 1, 0.3)} color={C.amber} />
        <PulseRing at={P.G} f={f} start={at(scene, 1, 0.6)} color={C.amber} />
        <Ant p={P.A} />
        <circle cx={P.A[0]} cy={P.A[1]} r={30 + 4 * Math.sin(f / 6)} fill="none" stroke={C.ink} strokeWidth={4} opacity={lab('A') * fadeTo(f, at(scene, 1, 0), 0)} />
      </Stage>
      <Pill x={PANEL} y={130} color={C.amber} style={{ ...fadeUp(f, at(scene, 1, 0.3)), fontSize: 44 }}>G: the opposite end</Pill>
      <Text x={PANEL} y={230} w={900} size={50} weight={900} style={fadeUp(f, at(scene, 2, 0.05))}>The ant takes 3 steps</Text>
      {[0, 1, 2].map((i) => <Slot key={i} x={SLOT_X[i]} y={330} n={i + 1} start={at(scene, 2, 0.1 + i * 0.12)} />)}
      <Pill x={PANEL} y={580} color={C.green} style={{ ...fadeUp(f, at(scene, 2, 0.5)), fontSize: 50, opacity: goal }}>Goal: end at G</Pill>
    </>
  );
};

const makePause = (seconds: number, prompt: string, zzz: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Cube labels={(k) => (k === 'A' || k === 'G' ? 1 : 0)} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
        <Ant p={P.A} zzz={zzz ? 1 : 0} />
      </Stage>
      <Text x={PANEL} y={130} w={900} size={44} style={fadeUp(f, 6)}>{prompt}</Text>
      <Countdown scene={scene} seconds={seconds} x={1400} y={540} tick={TICK} />
    </>
  );
};

const LayerRow: React.FC<{ y: number; label: string; items: string; color: string; start: number }> = ({ y, label, items, color, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <span style={{ background: color, color: '#fff', borderRadius: 999, padding: '8px 28px', fontSize: 46, fontWeight: 900 }}>{label}</span>
      <span style={{ fontSize: 56, fontWeight: 900, color }}>{items}</span>
    </div>
  );
};

const Layers: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const one = ease(f, at(scene, 1, 0.35), 12);
  const two = ease(f, at(scene, 2, 0.05), 12);
  const three = ease(f, at(scene, 2, 0.6), 12);
  const dots: Record<string, Dot> = {};
  const ONE = 'BDE', TWO = 'CFH';
  const mix = (c: string, a: number) => (a > 0.5 ? c : '#fff');
  for (const k of ONE) dots[k] = { c: mix(C.primary, one), txt: one > 0.5 ? '1' : undefined, r: one > 0.5 ? 22 : 12 };
  for (const k of TWO) dots[k] = { c: mix(C.violet, two), txt: two > 0.5 ? '2' : undefined, r: two > 0.5 ? 22 : 12 };
  dots.G = { c: three > 0.5 ? C.amber : '#fff', txt: three > 0.5 ? '3' : undefined, r: three > 0.5 ? 22 : 12 };
  dots.A = { c: C.ink };
  const stepOut = at(scene, 4, 0.2);
  const back = at(scene, 4, 0.5);
  const ant = antAt(f, 'A', [{ t: stepOut, to: 'B', d: 18 }, { t: back, to: 'A', d: 18 }]);
  const redE = ease(f, back - 4, 8) * fadeTo(f, at(scene, 4, 0.95), 0.0, 12);
  const same = ease(f, at(scene, 3, 0.55), 12);
  return (
    <>
      <Stage>
        <Cube labels={() => 1} dots={dots} flag={three}
          edges={{ AB: { c: C.red, o: redE } }} />
        <Ant p={ant} />
        <XMark at={[P.A[0] + 60, P.A[1] - 80]} opacity={ease(f, back + 14, 8) * fadeTo(f, at(scene, 4, 0.95), 0, 12)} />
      </Stage>
      <Text x={PANEL} y={140} w={900} size={52} weight={900} color={C.muted} style={fadeUp(f, at(scene, 0, 0.5))}>edges away from A</Text>
      <LayerRow y={240} label="1 away" items="B, D, E" color={C.primary} start={at(scene, 1, 0.35)} />
      <LayerRow y={340} label="2 away" items="C, F, H" color={C.violet} start={at(scene, 2, 0.05)} />
      <LayerRow y={440} label="3 away" items="G" color={C.amber} start={at(scene, 2, 0.6)} />
      <div style={{ position: 'absolute', left: PANEL, top: 580, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 3, 0.25)) }}>
        <span style={{ background: C.ink, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 50, fontWeight: 900 }}>3 steps</span>
        <span style={{ opacity: same, fontSize: 60, fontWeight: 900 }}>=</span>
        <span style={{ opacity: same, background: C.amber, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: 50, fontWeight: 900 }}>3 edges</span>
      </div>
      <Text x={PANEL} y={690} w={900} size={48} weight={900} color={C.red} style={{ opacity: ease(f, back + 16, 10) * fadeTo(f, at(scene, 4, 0.95), 0, 12), transform: 'none' }}>
        Can't reach G now! 1 step left, 3 edges to go
      </Text>
    </>
  );
};

const Steps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m1 = at(scene, 1, 0.12);
  const m2 = at(scene, 3, 0.1);
  const ant = antAt(f, 'A', [{ t: m1, to: 'B', d: 22 }, { t: m2, to: 'C', d: 22 }]);
  const eA = ease(f, at(scene, 0, 0.35), 12) * fadeTo(f, m1 + 6, 0, 10);
  const eB = ease(f, at(scene, 2, 0.15), 12) * fadeTo(f, m2 + 6, 0, 10);
  const eC = ease(f, at(scene, 3, 0.5), 12);
  const goodC = C.green, badC = C.red;
  const edges: Record<string, Es> = {
    AB: { c: goodC, o: eA }, AD: { c: goodC, o: eA }, AE: { c: goodC, o: eA },
    BA: { c: badC, o: eB }, BC: { c: goodC, o: Math.max(eB * fadeTo(f, m2 + 6, 0, 10), 0) }, BF: { c: goodC, o: eB },
    CD: { c: badC, o: eC },
  };
  // normalise keys (cube edges are stored alphabetically)
  const fixed: Record<string, Es> = {};
  const addE = (k: string, s: Es) => { const kk = key(k[0], k[1]); fixed[kk] = fixed[kk] && fixed[kk].o && !s.o ? fixed[kk] : s; };
  Object.entries(edges).forEach(([k, s]) => addE(k, s));
  // edge B-C: green while at B, red once the ant is at C (it would step back); C-G green
  fixed.BC = { c: f >= m2 + 22 ? badC : goodC, o: Math.max(eB * fadeTo(f, m2 + 6, 0, 10), f >= m2 + 22 ? eC : 0) };
  fixed.CG = { c: goodC, o: eC };
  const pd = (k: string) => ease(f, 0, 1) && pulse(f, at(scene, 1, 0.55));
  const times = ease(f, at(scene, 4, 0.2), 12);
  const final = ease(f, at(scene, 6, 0.15), 12);
  return (
    <>
      <Stage>
        <Cube labels={() => 1} edges={fixed} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
        <PulseRing at={P.D} f={f} start={at(scene, 1, 0.55)} color={C.primary} />
        <PulseRing at={P.E} f={f} start={at(scene, 1, 0.6)} color={C.primary} />
        <Ant p={ant} />
      </Stage>
      <Slot x={SLOT_X[0]} y={150} n={1} tex={'\\dfrac{3}{3} = 1'} start={4} fillAt={at(scene, 0, 0.6)} />
      <Slot x={SLOT_X[1]} y={150} n={2} tex={'\\dfrac{2}{3}'} start={4} fillAt={at(scene, 2, 0.6)} />
      <Slot x={SLOT_X[2]} y={150} n={3} tex={'\\dfrac{1}{3}'} start={4} fillAt={at(scene, 3, 0.8)} />
      {[0, 1].map((i) => (
        <div key={i} style={{ position: 'absolute', left: SLOT_X[i] + 232, top: 195, width: 76, textAlign: 'center', fontSize: 70, fontWeight: 900, color: C.violet, opacity: times }}>×</div>
      ))}
      <div style={{ position: 'absolute', left: PANEL, top: 420, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.05)) }}>
        <Tex tex={'1 \\times \\dfrac{2}{3} \\times \\dfrac{1}{3}'} size={64} />
        <span style={{ opacity: final }}><Tex tex={'= \\dfrac{2}{9}'} size={64} color={C.green} /></span>
      </div>
      <Chips x={PANEL} y={650} start={() => at(scene, 5, 0.5)} win={2} winAt={at(scene, 6, 0.85)} dim />
      <Answer x={1720} y={470} value="✓" start={at(scene, 6, 0.97)} chime={CHIME} />
    </>
  );
};

// ---- count ----

const TREE = (() => {
  const leaves = range(27).map((i) => 235 + i * 11.2);
  const l2 = range(9).map((i) => (leaves[i * 3] + leaves[i * 3 + 2]) / 2);
  const l1 = range(3).map((i) => (l2[i * 3] + l2[i * 3 + 2]) / 2);
  return { leaves, l2, l1, root: (l1[0] + l1[2]) / 2 };
})();

const Tree: React.FC<{ f: number; s1: number; s2: number; s3: number; op: number }> = ({ f, s1, s2, s3, op }) => {
  const X = [1000, 1220, 1440, 1660];
  const lines = (xa: number, ya: number[], xb: number, yb: number[], per: number, p: number) =>
    yb.map((y, i) => {
      const a = ya[Math.floor(i / per)];
      return <line key={i} x1={xa} y1={a} x2={xa + (xb - xa) * p} y2={a + (y - a) * p} stroke={C.ink} strokeWidth={per === 3 && yb.length === 27 ? 2 : 3.5} opacity={0.6} />;
    });
  const p1 = ease(f, s1, 14), p2 = ease(f, s2, 14), p3 = ease(f, s3, 14);
  return (
    <g opacity={op}>
      {lines(X[0], [TREE.root], X[1], TREE.l1, 3, p1)}
      {lines(X[1], TREE.l1, X[2], TREE.l2, 3, p2)}
      {lines(X[2], TREE.l2, X[3], TREE.leaves, 3, p3)}
      <circle cx={X[0]} cy={TREE.root} r={14} fill={C.ink} />
      {p1 > 0.5 && TREE.l1.map((y, i) => <circle key={i} cx={X[1]} cy={y} r={11} fill={C.primary} />)}
      {p2 > 0.5 && TREE.l2.map((y, i) => <circle key={i} cx={X[2]} cy={y} r={8} fill={C.violet} />)}
      {p3 > 0.5 && TREE.leaves.map((y, i) => <circle key={i} cx={X[3]} cy={y} r={4.5} fill={C.amber} />)}
    </g>
  );
};

const ROUTES = ['ABCG', 'ABFG', 'ADCG', 'ADHG', 'AEFG', 'AEHG'];
const ROUTE_TXT = ROUTES.map((r) => r.split('').join('→'));

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const treeOut = fadeTo(f, at(scene, 3, 0.0), 0, 10);
  const legend = ease(f, at(scene, 3, 0.1), 10);
  const O: Pt = [1030, 450];
  const dirs: [string, Pt, Pt][] = [
    ['across', [O[0] + 200, O[1]], [O[0] + 215, O[1] + 16]],
    ['up', [O[0], O[1] - 150], [O[0] - 62, O[1] - 75]],
    ['in', [O[0] + 130, O[1] - 104], [O[0] + 125, O[1] - 124]],
  ];
  const dStart = [at(scene, 3, 0.3), at(scene, 3, 0.55), at(scene, 3, 0.8)];
  const dirEdges: Record<string, Es> = {};
  Object.keys(DIR).forEach((d, i) => DIR[d].forEach((e) => (dirEdges[e] = { c: DIRC[d], o: ease(f, dStart[i], 12) * 0.9, w: 11 })));
  const edgesOp = fadeTo(f, at(scene, 8, 0.0), 0, 8);
  Object.values(dirEdges).forEach((s) => (s.o = (s.o ?? 0) * edgesOp));
  // routes (line 7)
  const r0 = at(scene, 8, 0.05);
  const per = Math.max(14, (scene.frames - r0 - 24) / 6);
  const rp = (i: number) => ease(f, r0 + i * per, Math.min(per - 2, 20));
  const cur = Math.min(5, Math.max(0, Math.floor((f - r0) / per)));
  const started = f >= r0;
  const ant = P.A;
  const fillAt = [at(scene, 7, 0.05), at(scene, 7, 0.3), at(scene, 7, 0.55)];
  const slotTxt = ['across', 'up', 'in'];
  const panelOut = fadeTo(f, at(scene, 8, 0.0), 0, 10);
  return (
    <>
      <Stage>
        <Cube labels={() => 1} edges={dirEdges} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
        {ROUTES.map((r, i) => <Route key={r} path={r} p={rp(i)} opacity={i === cur && started ? 1 : 0.22} />)}
        <Ant p={ant} />
        <g opacity={legend * panelOut} strokeLinecap="round" fill="none" strokeWidth={9}>
          {dirs.map(([d, to, lp], i) => (
            <g key={d} opacity={ease(f, dStart[i], 10)} stroke={DIRC[d]}>
              <line x1={O[0]} y1={O[1]} x2={to[0]} y2={to[1]} />
              <path d={(() => { const a = Math.atan2(to[1] - O[1], to[0] - O[0]); const h = (s: number) => `${to[0] - 26 * Math.cos(a + s)} ${to[1] - 26 * Math.sin(a + s)}`; return `M ${h(0.5)} L ${to[0]} ${to[1]} L ${h(-0.5)}`; })()} />
              <text x={lp[0]} y={lp[1]} stroke="none" fill={DIRC[d]} fontFamily={NUNITO} fontWeight={900} fontSize={48} textAnchor={d === 'up' ? 'end' : 'start'}>{d}</text>
            </g>
          ))}
        </g>
        <g opacity={treeOut * ease(f, at(scene, 1, 0.05), 10)}>
          <Tree f={f} s1={at(scene, 1, 0.1)} s2={at(scene, 1, 0.3)} s3={at(scene, 1, 0.5)} op={1} />
        </g>
      </Stage>
      <Text x={PANEL} y={140} w={900} size={52} weight={900} color={C.muted} style={{ ...fadeUp(f, at(scene, 0, 0.4)), opacity: ease(f, at(scene, 0, 0.4), 14) * panelOut }}>count the walks</Text>
      <div style={{ opacity: treeOut }}>
        <Eq y={590} x={PANEL + 30} start={at(scene, 1, 0.65)} tex={'3 \\times 3 \\times 3 = 27'} size={64} />
        <Pill x={PANEL + 30} y={700} color={C.primary} style={{ ...fadeUp(f, at(scene, 2, 0.1)), fontSize: 40 }}>27 equally likely</Pill>
        <Pill x={PANEL + 450} y={700} color={C.amber} style={{ ...fadeUp(f, at(scene, 2, 0.55)), fontSize: 40 }}>how many end at G?</Pill>
      </div>
      <div style={{ opacity: panelOut }}>
        {slotTxt.map((s, i) => (
          <DirChip key={s} x={PANEL + 20 + i * 290} y={525} label={`${s} ×1`} color={DIRC[s]} start={at(scene, 4, 0.2 + i * 0.22)} w={260} />
        ))}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', left: PANEL + 20 + i * 290, top: 610, width: 260, height: 100, borderRadius: 22, border: `4px dashed ${f >= fillAt[i] ? 'transparent' : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f >= fillAt[i] ? DIRC[slotTxt[i]] : 'transparent', color: '#fff', fontSize: 44, fontWeight: 900, ...fadeUp(f, at(scene, 6, 0.3 + i * 0.1)) }}>
            {f >= fillAt[i] ? slotTxt[i] : ''}
          </div>
        ))}
        <div style={{ opacity: ease(f, at(scene, 5, 0.1), 10) * fadeTo(f, at(scene, 6, 0.0), 0, 8) }}>
          <DirChip x={PANEL + 20} y={610} label="across" color={DIRC.across} start={at(scene, 5, 0.1)} w={260} />
          <DirChip x={PANEL + 310} y={610} label="across" color={DIRC.across} start={at(scene, 5, 0.3)} w={260} />
          <Text x={PANEL + 20} y={705} w={880} size={46} weight={900} color={C.red} style={{ opacity: ease(f, at(scene, 5, 0.5), 10) }}>cancels out ✗</Text>
        </div>
        {['3 choices', '2 left', '1 left'].map((s, i) => (
          <div key={s} style={{ position: 'absolute', left: PANEL + 20 + i * 290, top: 720, width: 260, textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.muted, opacity: ease(f, fillAt[i], 10) }}>{s}</div>
        ))}
        <Eq y={765} x={PANEL + 50} start={at(scene, 7, 0.72)} tex={'3 \\times 2 \\times 1 = 6'} size={54} color={C.green} />
      </div>
      {/* routes list + counter */}
      <div style={{ opacity: ease(f, at(scene, 8, 0.0), 10) }}>
        <Text x={PANEL} y={130} w={500} size={60} weight={900} color={C.green}>routes ×{started ? cur + 1 : 0}</Text>
        {ROUTE_TXT.map((t, i) => (
          <Text key={t} x={PANEL} y={225 + i * 82} w={700} size={50} weight={800} color={C.green} style={{ opacity: ease(f, r0 + i * per, 8) }}>{t}</Text>
        ))}
      </div>
    </>
  );
};

const Total2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hl = ease(f, at(scene, 1, 0.45), 14);
  const L = '\\dfrac{3}{3}\\times\\dfrac{2}{3}\\times\\dfrac{1}{3}';
  const R = '\\dfrac{3\\times2\\times1}{3\\times3\\times3}';
  const LC = '\\dfrac{\\textcolor{#0cc281}{3}}{\\textcolor{#7b61ff}{3}}\\times\\dfrac{\\textcolor{#0cc281}{2}}{\\textcolor{#7b61ff}{3}}\\times\\dfrac{\\textcolor{#0cc281}{1}}{\\textcolor{#7b61ff}{3}}';
  const RC = '\\dfrac{\\textcolor{#0cc281}{3\\times2\\times1}}{\\textcolor{#7b61ff}{3\\times3\\times3}}';
  return (
    <>
      <Stage>
        <Cube labels={() => 1} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
        {ROUTES.map((r) => <Route key={r} path={r} p={ease(f, 2, 14)} opacity={0.3} />)}
        <Ant p={P.A} />
      </Stage>
      <Eq y={170} start={at(scene, 0, 0.2)} tex={'\\dfrac{6}{27} = \\dfrac{2}{9}'} size={84} />
      <Check x={PANEL + 420} y={194} start={at(scene, 0, 0.7)}>It matches!</Check>
      <Eq y={400} x={PANEL} start={at(scene, 1, 0.1)} tex={L} size={52} />
      <Eq y={400} x={PANEL} start={at(scene, 1, 0.1)} tex={LC} size={52} opacity={hl} />
      <Eq y={400} x={PANEL + 540} start={at(scene, 1, 0.2)} tex={R} size={52} />
      <Eq y={400} x={PANEL + 540} start={at(scene, 1, 0.2)} tex={RC} size={52} opacity={hl} />
      <Text x={PANEL} y={570} w={440} size={42} weight={800} color={C.green} style={{ opacity: ease(f, at(scene, 1, 0.5), 10) }}>tops: 3, 2, 1</Text>
      <Text x={PANEL + 540} y={570} w={440} size={42} weight={800} color={C.violet} style={{ opacity: ease(f, at(scene, 1, 0.75), 10) }}>bottoms: 3, 3, 3</Text>
      <Pill x={PANEL} y={690} color={C.primary} style={{ ...fadeUp(f, at(scene, 2, 0.25)), fontSize: 38 }}>step by step</Pill>
      <Pill x={PANEL + 540} y={690} color={C.violet} style={{ ...fadeUp(f, at(scene, 2, 0.5)), fontSize: 38 }}>count the walks</Pill>
    </>
  );
};

// ---- traps ----

type TrapCard = { i: number; head: string; factors: string; result: string; fix?: string[]; note?: string; at: number; fixAt?: number };

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const R = '#ef4343', G = '#21c45d';
  const cards: TrapCard[] = [
    { i: 0, head: '\\dfrac{1}{27}', factors: `\\textcolor{${R}}{\\dfrac13}\\times\\textcolor{${R}}{\\dfrac13}\\times\\dfrac13`, result: '\\dfrac{1}{27}', fix: [`\\text{step 2: }\\textcolor{${G}}{\\dfrac23}`], note: '6 routes, not 1', at: at(scene, 1, 0.1), fixAt: at(scene, 2, 0.15) },
    { i: 1, head: '\\dfrac{1}{9}', factors: `1\\times\\textcolor{${R}}{\\dfrac13}\\times\\dfrac13`, result: '\\dfrac{1}{9}', fix: [`\\text{step 2: }\\textcolor{${G}}{\\dfrac23}`], note: 'step 2 has two good edges', at: at(scene, 3, 0.1), fixAt: at(scene, 3, 0.55) },
    { i: 3, head: '\\dfrac{1}{3}', factors: `\\text{only step 3: }\\dfrac13`, result: '\\dfrac{1}{3}', note: 'you skipped steps 1 and 2', at: at(scene, 4, 0.1) },
    { i: 4, head: '\\dfrac{4}{9}', factors: `1\\times\\dfrac23\\times\\textcolor{${R}}{\\dfrac23}`, result: '\\dfrac{4}{9}', fix: [`\\text{step 3: }\\textcolor{${G}}{\\dfrac13}`], note: 'from corner C, only 1 edge reaches G', at: at(scene, 5, 0.1), fixAt: at(scene, 5, 0.55) },
  ];
  const habit = ease(f, at(scene, 6, 0.1), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 75, top: 120, display: 'flex', gap: 28 }}>
        {cards.map((c) => {
          const on = ease(f, c.at, 12);
          const fixOn = c.fixAt ? ease(f, c.fixAt, 12) : 0;
          return (
            <div key={c.i} style={{ width: 430, minHeight: 440, background: C.card, borderRadius: 28, border: `6px solid ${f >= c.at ? C.red : 'transparent'}`, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative', padding: '14px 22px', opacity: ease(f, c.at - 6, 12), transform: `translateY(${(1 - on) * 24}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: C.red }}>
                <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: C.violet, color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900 }}>{'ABCDE'[c.i]}</span>
                <Tex tex={`=\\ ${c.head}`} size={52} color={C.red} />
              </div>
              <div style={{ marginTop: 14, whiteSpace: 'nowrap' }}><Tex tex={c.factors} size={52} /></div>
              {c.fix && (
                <div style={{ marginTop: 12, opacity: fixOn, whiteSpace: 'nowrap', borderTop: `3px solid ${C.line}`, paddingTop: 6 }}>
                  {c.fix.map((t) => <div key={t}><Tex tex={t} size={50} /></div>)}
                </div>
              )}
              {c.note && <div style={{ marginTop: 8, fontSize: 42, fontWeight: 800, color: C.muted, opacity: c.fixAt ? fixOn : on, lineHeight: 1.2 }}>{c.note}</div>}
              <div style={{ position: 'absolute', right: -22, top: -26, width: 60, height: 60, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 38, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: on }}>✗</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 150, top: 755, width: 1620, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 30, padding: '10px 30px', fontSize: 44, fontWeight: 900, opacity: habit, transform: `translateY(${(1 - habit) * 20}px)` }}>
        Count only the edges that keep you on track
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const names: [string, string][] = [['across', DIRC.across], ['up', DIRC.up], ['in', DIRC.in], ['nap', C.muted]];
  return (
    <>
      <Stage>
        <Cube labels={(k) => (k === 'A' || k === 'G' ? 1 : 0)} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
        <Ant p={P.A} zzz={ease(f, 4, 10)} />
      </Stage>
      <Text x={PANEL} y={140} w={900} size={52} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>The sleepy ant</Text>
      {names.map(([n, c], i) => (
        <DirChip key={n} x={PANEL + i * 225} y={250} label={n} color={c} start={at(scene, 1, 0.25 + i * 0.17)} w={200} />
      ))}
      {names.map(([n], i) => (
        <div key={n} style={{ position: 'absolute', left: PANEL + i * 225 + 40, top: 335, ...fadeUp(f, at(scene, 2, 0.1 + i * 0.1)) }}>
          <Tex tex={'\\dfrac{1}{4}'} size={60} />
        </div>
      ))}
      <Pill x={PANEL} y={520} color={C.green} style={{ ...fadeUp(f, at(scene, 2, 0.6)), fontSize: 44 }}>At G after 3 minutes?</Pill>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const names: [string, string][] = [['across', DIRC.across], ['up', DIRC.up], ['in', DIRC.in], ['nap', C.muted]];
  const fl = (i: number) => {
    const t = at(scene, 5, 0.45) + i * 6;
    return pulse(f, t) > 0 ? 1 : 0;
  };
  const cross = ease(f, at(scene, 1, 0.3), 12);
  const RT = (i: number) => at(scene, 6, 0.08) + i * 30;
  const flash = (i: number) => ease(f, RT(i), 8) * fadeTo(f, RT(i) + 24, 0.0, 8);
  void fl;
  return (
    <>
      <Stage>
        <Cube labels={(k) => (k === 'A' || k === 'G' ? 1 : 0)} dots={{ A: { c: C.ink }, G: { c: C.amber } }} flag={1} />
        {ROUTES.map((r, i) => <Route key={r} path={r} p={ease(f, RT(i), 18)} opacity={flash(i)} />)}
        <Ant p={P.A} zzz={fadeTo(f, at(scene, 1, 0.2), 0, 10)} />
      </Stage>
      <Eq y={140} start={at(scene, 0, 0.2)} tex={'3 \\text{ edges away},\\ 3 \\text{ minutes}'} size={50} />
      {names.map(([n, c], i) => (
        <DirChip key={n} x={PANEL + i * 225} y={250} label={n} color={c} start={at(scene, 1, 0.1 + i * 0.05)} w={200} cross={i === 3 ? cross : 0} />
      ))}
      <Text x={PANEL} y={340} w={900} size={44} weight={800} color={C.muted} style={{ opacity: ease(f, at(scene, 2, 0.2), 10) * ease(f, at(scene, 1, 0.5), 1) }}>
        {f >= at(scene, 2, 0.1) ? '4 choices each minute' : ''}
      </Text>
      <div style={{ opacity: fadeTo(f, at(scene, 6, 0.0), 0, 10) }}>
        {[0, 1, 2].map((i) => (
          <Slot key={i} x={SLOT_X[i]} y={430} n={i + 1} tex={['\\dfrac{3}{4}', '\\dfrac{2}{4}', '\\dfrac{1}{4}'][i]} start={at(scene, 3, 0.05 + i * 0.1)} fillAt={at(scene, 3, 0.1 + i * 0.22)} w={230} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 640, display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.1)) }}>
        <Tex tex={'\\dfrac34\\times\\dfrac24\\times\\dfrac14 = \\dfrac{6}{64}'} size={52} color={C.green} />
        <span style={{ opacity: ease(f, at(scene, 5, 0.15), 12) }}><Tex tex={'= \\dfrac{3}{32}'} size={52} color={C.green} /></span>
      </div>
      <Answer x={1730} y={722} value="✓" start={at(scene, 5, 0.97)} chime={CHIME} />
      <Eq y={410} start={at(scene, 6, 0.1)} tex={'4 \\times 4 \\times 4 = 64'} size={60} />
      <Check x={PANEL + 560} y={420} start={at(scene, 6, 0.6)}><Tex tex={'\\dfrac{6}{64}'} size={50} /></Check>
      <Confetti x={1400} y={400} start={at(scene, 7, 0.1)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3, 0.0), 0, 12);
  const times = ease(f, at(scene, 2, 0.2), 12);
  return (
    <>
      <div style={{ opacity: out }}>
        <Text x={960} y={120} w={1700} size={64} weight={900} align="center" color={C.primary} style={fadeUp(f, 4)}>The big idea</Text>
        <Text x={960} y={225} w={1500} size={50} weight={800} align="center" style={fadeUp(f, at(scene, 1, 0.15))}>At each step: which moves keep me on the path?</Text>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', left: 130 + i * 590, top: 360, width: 500, height: 300, background: C.card, borderRadius: 32, boxShadow: '0 10px 30px rgba(30,40,80,0.09)', ...fadeUp(f, at(scene, 1, 0.3 + i * 0.2)) }}>
            <div style={{ position: 'absolute', left: 20, top: 16, fontSize: 40, fontWeight: 900, color: C.violet, display: 'flex', alignItems: 'center', gap: 12 }}><Num n={i + 1} size={46} /> Step {i + 1}</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', whiteSpace: 'nowrap' }}>
              <Tex tex={'\\dfrac{\\text{good edges}}{\\text{all edges}}'} size={52} />
            </div>
          </div>
        ))}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: 630 + i * 590, top: 440, width: 90, textAlign: 'center', fontSize: 90, fontWeight: 900, color: C.violet, opacity: times }}>×</div>
        ))}
        <Text x={960} y={720} w={1500} size={50} weight={900} align="center" color={C.green} style={fadeUp(f, at(scene, 2, 0.5))}>Multiply the chances along the path</Text>
      </div>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 'Chance the ant is at G after 3 minutes?', false),
  layers: Layers,
  steps: Steps,
  count: Count,
  total2: Total2,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 'Sleepy ant: 3 edges or a nap, 4 choices. Chance at G after 3 minutes?', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

void stateDots;
export type { Scene };

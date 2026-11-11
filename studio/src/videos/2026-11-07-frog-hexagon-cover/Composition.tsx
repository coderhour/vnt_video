import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Tex } from '../../lib/Tex';
import { Stage } from '../../lib/grid';
import { Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-07-frog-hexagon-cover';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const GREEN = C.primary;
export const EXIT = C.violet;
export const DARK = '#067a50';
export const CHOICES = ['10', '12', '15', '18', '21'];

export type Pt = [number, number];

// ---------- small helpers ----------

export const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: boolean; box?: boolean }> = ({
  x, y, tex, start, size = 52, color = C.ink, opacity = 1, center = false, box = false,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', whiteSpace: 'nowrap', opacity: (s.opacity as number) * opacity }}>
      <div style={{ transform: s.transform, ...(box ? { border: `6px solid ${GREEN}`, borderRadius: 20, padding: '2px 22px', background: C.card } : {}) }}>
        <Tex tex={tex} size={size} color={color} />
      </div>
    </div>
  );
};

export const Tag: React.FC<{ x: number; y: number; start: number; color?: string; size?: number; w?: number; center?: boolean; end?: number; children: React.ReactNode }> = ({
  x, y, start, color = C.ink, size = 44, w, center = false, end, children,
}) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const o = (s.opacity as number) * (end === undefined ? 1 : fadeTo(f, end, 0, 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, textAlign: center ? 'center' : 'left', fontSize: size, fontWeight: 900, color, lineHeight: 1.25, whiteSpace: w ? 'normal' : 'nowrap', opacity: o, transform: s.transform }}>
      {children}
    </div>
  );
};

/** Maths label centred on (x, y). */
export const Lbl: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; end?: number; opacity?: number }> = ({
  x, y, tex, start, size = 52, color = C.ink, end, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12) * (end === undefined ? 1 : fadeTo(f, end, 0, 10)) * opacity;
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: p, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

export const vert = (n: number, i: number, cx = 560, cy = 450, r = 250): Pt => {
  const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

export type Walk = [number, number][]; // [index, landing frame]; the first entry is the start
export const HOP = 9;

export const greenOf = (walk: Walk, n: number) => {
  const g: number[] = Array(n).fill(Infinity);
  walk.forEach(([c, t]) => {
    g[c] = Math.min(g[c], t);
  });
  return g;
};

export const hopPos = (f: number, walk: Walk, posOf: (i: number) => Pt): Pt => {
  let j = 0;
  for (let k = 0; k < walk.length; k++) if (walk[k][1] <= f) j = k;
  const cur = posOf(walk[j][0]);
  const nx = walk[j + 1];
  if (nx && f > nx[1] - HOP) {
    const p = Math.min(1, (f - (nx[1] - HOP)) / HOP);
    const q = posOf(nx[0]);
    return [cur[0] + (q[0] - cur[0]) * p, cur[1] + (q[1] - cur[1]) * p - Math.sin(Math.PI * p) * 36];
  }
  return cur;
};

export const Frog: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={4} rx={26} ry={21} fill={DARK} stroke="#fff" strokeWidth={3.5} />
    <circle cx={-13} cy={-14} r={10} fill="#fff" stroke={DARK} strokeWidth={3} />
    <circle cx={13} cy={-14} r={10} fill="#fff" stroke={DARK} strokeWidth={3} />
    <circle cx={-13} cy={-14} r={4.5} fill={C.ink} />
    <circle cx={13} cy={-14} r={4.5} fill={C.ink} />
    <path d="M -10 12 Q 0 20 10 12" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

const Badge: React.FC<{ x: number; y: number; start: number; letter?: string; value: string }> = ({ x, y, start, letter, value }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 130, top: y - 130, width: 260, height: 260, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)', fontWeight: 900, lineHeight: 1 }}>
          {letter && <div style={{ fontSize: 60, marginBottom: 6 }}>{letter}</div>}
          <div style={{ fontSize: 120 }}>{value}</div>
        </div>
      )}
    </>
  );
};

// ---------- the polygon figure ----------

type Ring = { i: number; start: number; end?: number };

export const NGon: React.FC<{
  n?: number; cx?: number; cy?: number; r?: number; dotR?: number;
  green: number[]; walk?: Walk; frogAt?: number; frogStart?: number; showFrog?: boolean;
  rings?: Ring[]; ringLabels?: Ring[]; opacity?: number; band?: boolean; frogRing?: { start: number; end?: number };
}> = ({ n = 6, cx = 560, cy = 450, r = 250, dotR = 26, green, walk, frogAt = 0, frogStart = 0, showFrog = true, rings = [], ringLabels = [], opacity = 1, band = true, frogRing }) => {
  const f = useCurrentFrame();
  const P = (i: number) => vert(n, i, cx, cy, r);
  const fp = walk ? hopPos(f, walk, P) : P(frogAt);
  const fo = walk ? 1 : ease(f, frogStart, 10);
  return (
    <Stage>
      <g opacity={opacity}>
        {range(n).map((i) => {
          const a = P(i), b = P((i + 1) % n);
          return <line key={`e${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.line} strokeWidth={8} strokeLinecap="round" />;
        })}
        {band &&
          range(n).map((i) => {
            const j = (i + 1) % n;
            const t = Math.max(green[i], green[j]);
            if (!isFinite(t)) return null;
            const p = ease(f, t, 12);
            if (p <= 0) return null;
            const a = P(i), b = P(j);
            return <line key={`b${i}`} x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke={GREEN} strokeWidth={18} strokeLinecap="round" opacity={0.55} />;
          })}
        {range(n).map((i) => {
          const p = P(i);
          const s = isFinite(green[i]) ? pop(f, green[i], 30) : 0;
          return (
            <g key={`v${i}`}>
              <circle cx={p[0]} cy={p[1]} r={dotR} fill={C.card} stroke="#c9ceda" strokeWidth={6} />
              {s > 0 && <circle cx={p[0]} cy={p[1]} r={dotR * Math.min(s, 1.15)} fill={GREEN} />}
            </g>
          );
        })}
        {rings.map((rg) => {
          const p = P(rg.i);
          const o = ease(f, rg.start, 12) * (rg.end === undefined ? 1 : fadeTo(f, rg.end, 0, 10));
          if (o <= 0) return null;
          return <circle key={`r${rg.i}`} cx={p[0]} cy={p[1]} r={dotR + 14} fill="none" stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" opacity={o} />;
        })}
        {ringLabels.map((rg) => {
          const p = P(rg.i);
          const o = ease(f, rg.start, 12) * (rg.end === undefined ? 1 : fadeTo(f, rg.end, 0, 10));
          if (o <= 0) return null;
          const dx = p[0] - cx, dy = p[1] - cy;
          const d = Math.hypot(dx, dy);
          const ux = dx / d, uy = dy / d;
          const lx = p[0] + ux * (dotR + 30), ly = p[1] + uy * (dotR + 30) + 14;
          const anchor = Math.abs(ux) < 0.3 ? 'middle' : ux > 0 ? 'start' : 'end';
          return (
            <text key={`l${rg.i}`} x={lx} y={ly} textAnchor={anchor} fontSize={40} fontWeight={900} fill={EXIT} opacity={o}>
              exit
            </text>
          );
        })}
        {frogRing && (
          <circle cx={fp[0]} cy={fp[1]} r={dotR + 20} fill="none" stroke={C.amber} strokeWidth={8} opacity={ease(f, frogRing.start, 10) * (frogRing.end === undefined ? 1 : fadeTo(f, frogRing.end, 0, 10))} />
        )}
        {showFrog && <Frog x={fp[0]} y={fp[1]} opacity={fo} />}
      </g>
    </Stage>
  );
};

// ---------- arrows ----------

export const Arc: React.FC<{ p: Pt; q: Pt; away: Pt; bulge?: number; color?: string; start: number; end?: number; label?: string; labelSize?: number; sh?: number; labelOff?: number }> = ({
  p, q, away, bulge = 60, color = EXIT, start, end, label, labelSize = 52, sh = 34, labelOff = 42,
}) => {
  const f = useCurrentFrame();
  const o = end === undefined ? 1 : fadeTo(f, end, 0, 10);
  const pr = ease(f, start, 16);
  if (pr <= 0 || o <= 0) return null;
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const d: Pt = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
  const a: Pt = [p[0] + d[0] * sh, p[1] + d[1] * sh];
  const b: Pt = [q[0] - d[0] * sh, q[1] - d[1] * sh];
  let nrm: Pt = [-d[1], d[0]];
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (nrm[0] * (m[0] - away[0]) + nrm[1] * (m[1] - away[1]) < 0) nrm = [-nrm[0], -nrm[1]];
  const c: Pt = [m[0] + nrm[0] * bulge * 2, m[1] + nrm[1] * bulge * 2];
  const tx = b[0] - c[0], ty = b[1] - c[1];
  const tl = Math.hypot(tx, ty);
  const u: Pt = [tx / tl, ty / tl];
  const v: Pt = [-u[1], u[0]];
  const head = `${b[0]},${b[1]} ${b[0] - u[0] * 30 + v[0] * 15},${b[1] - u[1] * 30 + v[1] * 15} ${b[0] - u[0] * 30 - v[0] * 15},${b[1] - u[1] * 30 - v[1] * 15}`;
  const mid: Pt = [0.25 * a[0] + 0.5 * c[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * c[1] + 0.25 * b[1]];
  return (
    <>
      <Stage>
        <g opacity={o}>
          <path d={`M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
          {pr > 0.85 && <polygon points={head} fill={color} />}
        </g>
      </Stage>
      {label && <Lbl x={mid[0] + nrm[0] * labelOff} y={mid[1] + nrm[1] * labelOff} tex={label} start={start + 8} size={labelSize} color={color} end={end} />}
    </>
  );
};

// ---------- the straightened line ----------

export const SP = 170;
export type SlotLabel = { t: string; s: number; color?: string; end?: number };

export const Line: React.FC<{
  k: number; x0: number; y: number; sp?: number; start: number; labels?: Record<number, SlotLabel>;
  walk?: Walk; morphFrom?: Pt[]; morphStart?: number; morphDur?: number; opacity?: number; twin?: number[]; twinStart?: number;
  exitFill?: boolean; frogOff?: boolean; frogRingStart?: number;
}> = ({ k, x0, y, sp = SP, start, labels = {}, walk = [[1, 0]], morphFrom, morphStart = 0, morphDur = 26, opacity = 1, twin = [], twinStart = 0, frogOff = false }) => {
  const f = useCurrentFrame();
  const pos = (i: number): Pt => {
    const t: Pt = [x0 + i * sp, y];
    if (!morphFrom) return t;
    const p = ease(f, morphStart, morphDur);
    const s = morphFrom[i];
    return [s[0] + (t[0] - s[0]) * p, s[1] + (t[1] - s[1]) * p];
  };
  const fp = hopPos(f, walk, pos);
  return (
    <>
      <Stage>
        <g opacity={opacity}>
          <line x1={pos(0)[0]} y1={y} x2={pos(k + 1)[0]} y2={y} stroke={C.line} strokeWidth={8} strokeLinecap="round" opacity={ease(f, start, 10)} />
          {range(k + 2).map((i) => {
            const p = pos(i);
            const exit = i === 0 || i === k + 1;
            const s = pop(f, start + i * 3, 30);
            if (s <= 0) return null;
            return exit ? (
              <circle key={i} cx={p[0]} cy={p[1]} r={40 * Math.min(s, 1.1)} fill={C.violetSoft} stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" />
            ) : (
              <circle key={i} cx={p[0]} cy={p[1]} r={40 * Math.min(s, 1.1)} fill={GREEN} />
            );
          })}
          {twin.map((i) => {
            const p = pos(i);
            return <circle key={`t${i}`} cx={p[0]} cy={p[1]} r={54} fill="none" stroke={C.amber} strokeWidth={7} opacity={ease(f, twinStart, 12)} />;
          })}
          {!frogOff && <Frog x={fp[0]} y={fp[1] - 2} s={0.85} opacity={ease(f, start + 8, 10)} />}
        </g>
      </Stage>
      {Object.entries(labels).map(([i, l]) => {
        const p = pos(Number(i));
        return <Lbl key={i} x={p[0]} y={p[1] - 92} tex={l.t} start={l.s} color={l.color ?? C.ink} end={l.end} size={58} opacity={opacity} />;
      })}
    </>
  );
};

// ---------- stage chips ----------

const chipLeft = (k: number) => 100 + (k - 1) * 340;
const Chip: React.FC<{ k: number; start?: number; opacity?: number }> = ({ k, start, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = start === undefined ? { opacity: 1, transform: 'none' } : fadeUp(f, start);
  const o = (s.opacity as number) * opacity;
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: chipLeft(k), top: 138, width: 320, height: 64, borderRadius: 999, background: C.primarySoft, border: `4px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 900, color: DARK, opacity: o, transform: s.transform, whiteSpace: 'nowrap' }}>
      stage {k}: {k} jump{k > 1 ? 's' : ''}
    </div>
  );
};

const Chips: React.FC<{ upTo: number; newStart?: number; opacity?: number }> = ({ upTo, newStart, opacity = 1 }) => (
  <>
    {range(upTo).map((i) => (
      <Chip key={i} k={i + 1} start={i + 1 === upTo ? newStart : undefined} opacity={opacity} />
    ))}
  </>
);

const MiniHex: React.FC<{ cx: number; cy: number; r?: number; greens: number; start: number; first?: number }> = ({ cx, cy, r = 95, greens, start, first = 5 }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 14);
  const pts = range(6).map((i) => vert(6, i, cx, cy, r));
  return (
    <g opacity={o}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.line} strokeWidth={8} strokeLinejoin="round" />
      {pts.map((p, i) => {
        const idx = (i - first + 6) % 6;
        return <circle key={i} cx={p[0]} cy={p[1]} r={17} fill={idx < greens ? GREEN : C.card} stroke={idx < greens ? GREEN : '#c9ceda'} strokeWidth={5} />;
      })}
    </g>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end = at(scene, 1, 0.5);
  const walk: Walk = [[0, 6]];
  [1, 2, 1, 0, 5, 4, 5].forEach((c, k) => walk.push([c, 40 + Math.round((k * (end - 60)) / 7)]));
  const green = greenOf(walk, 6);
  return (
    <>
      <NGon green={green} walk={walk} />
      <Tag x={980} y={330} start={at(scene, 0, 0.45)} color={GREEN} size={66}>
        every corner?
      </Tag>
      <Tag x={980} y={450} start={at(scene, 1, 0.25)} color={C.muted} size={50} end={at(scene, 1, 0.6)}>
        a pattern is hiding here
      </Tag>
      <Tag x={980} y={450} start={at(scene, 1, 0.65)} color={EXIT} size={66}>
        find the pattern
      </Tag>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = (i: number) => vert(6, i);
  const frogP = P(0);
  return (
    <>
      <Pill x={100} y={140} color={EXIT} style={{ ...fadeUp(f, 0), fontSize: 38 }}>
        Question
      </Pill>
      <NGon green={[0, Infinity, Infinity, Infinity, Infinity, Infinity]} />
      <Arc p={frogP} q={P(1)} away={[560, 450]} start={at(scene, 1, 0.35)} label="\dfrac12" bulge={26} labelOff={90} />
      <Arc p={frogP} q={P(5)} away={[560, 450]} start={at(scene, 1, 0.45)} label="\dfrac12" bulge={26} labelOff={90} />
      <div style={{ position: 'absolute', left: 930, top: 150, width: 900, background: C.card, borderRadius: 32, padding: '30px 42px', fontSize: 46, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        A frog sits on one vertex of a regular hexagon. Each second it jumps to one of the two neighboring vertices, each with chance{' '}
        <Tex tex="\dfrac12" size={50} />. What is the expected number of jumps until the frog{' '}
        <Mark on={at(scene, 2, 0.45)}>has been on all six vertices</Mark>?
      </div>
      <Choices x={930} y={650} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 2, 0.02 + i * 0.05)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ghostWalks = [
    [0, 1, 2, 3, 2, 1, 0, 5, 4],
    [0, 5, 4, 5, 0, 1, 0, 5, 4, 3],
    [0, 1, 0, 1, 2, 3, 4, 5],
  ];
  const out = fadeTo(f, at(scene, 1, 0.03), 0, 12);
  const gx = [440, 960, 1480];
  const q = vert(6, 0);
  return (
    <>
      <Tag x={0} y={170} w={1920} center start={at(scene, 0, 0.1)} color={C.ink} size={56} end={at(scene, 1, 0.03)}>
        expected = the <span style={{ color: GREEN }}>average</span> over a million tries
      </Tag>
      <Stage>
        <g opacity={out}>
          {ghostWalks.map((w, gi) => {
            const cx = gx[gi], cy = 520, r = 105;
            const pts = w.map((c, k) => {
              const p = vert(6, c, cx, cy, r);
              const jitter = ((gi * 3 + k) % 3) - 1;
              return [p[0] + jitter * 6, p[1] + jitter * 5] as Pt;
            });
            const prog = ease(f, at(scene, 0, 0.2 + gi * 0.12), 70);
            return (
              <g key={gi} opacity={ease(f, at(scene, 0, 0.1 + gi * 0.1), 12)}>
                <polygon points={range(6).map((i) => vert(6, i, cx, cy, r).join(',')).join(' ')} fill={C.card} stroke={C.line} strokeWidth={8} strokeLinejoin="round" />
                <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={EXIT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                {range(6).map((i) => {
                  const p = vert(6, i, cx, cy, r);
                  return <circle key={i} cx={p[0]} cy={p[1]} r={12} fill="#fff" stroke="#c9ceda" strokeWidth={5} />;
                })}
              </g>
            );
          })}
        </g>
      </Stage>
      <div style={{ opacity: ease(f, at(scene, 1, 0.03), 12) }}>
        <NGon green={[at(scene, 1, 0.08), Infinity, Infinity, Infinity, Infinity, Infinity]} frogStart={at(scene, 1, 0.03)} opacity={ease(f, at(scene, 1, 0.03), 12)} />
      </div>
      <Tag x={q[0] + 50} y={q[1] - 30} start={at(scene, 1, 0.1)} color={GREEN} size={42}>
        already visited
      </Tag>
      {[1, 2, 3, 4, 5].map((i) => {
        const p = vert(6, i);
        const dx = p[0] - 560;
        const right = dx > 5;
        const left = dx < -5;
        const lx = right ? p[0] + 50 : left ? p[0] - 50 : p[0];
        const ly = i === 3 ? p[1] + 36 : p[1] - 24;
        return (
          <Tag key={i} x={right ? lx : left ? lx - 140 : lx - 70} y={ly} start={at(scene, 1, 0.45 + i * 0.05)} color={EXIT} size={42} w={140} center={!right && !left}>
            <span style={{ display: 'block', textAlign: right ? 'left' : left ? 'right' : 'center' }}>new</span>
          </Tag>
        );
      })}
      <Tag x={1060} y={400} start={at(scene, 1, 0.65)} color={EXIT} size={64}>
        5 new corners
      </Tag>
    </>
  );
};

const makePause = (opts: { n: number; choices: boolean; seconds: number; prompt: React.ReactNode }): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <NGon n={opts.n} cx={340} cy={560} r={170} dotR={22} green={[0, ...Array(opts.n - 1).fill(Infinity)]} />
      <Text x={130} y={140} w={1100} size={44} style={fadeUp(f, 6)}>
        {opts.prompt}
      </Text>
      {opts.choices ? (
        <Choices x={570} y={500} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={() => 8} />
      ) : (
        <Text x={700} y={470} w={700} size={56} weight={900} color={EXIT} style={fadeUp(f, 8)}>
          Expected jumps until all 8 corners?
        </Text>
      )}
      <Countdown scene={scene} seconds={opts.seconds} x={1630} y={560} tick={TICK} />
    </>
  );
};

const Block: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const walk: Walk = [
    [0, at(scene, 0, 0.35)],
    [1, at(scene, 0, 0.75)],
    [0, at(scene, 1, 0.2)],
    [5, at(scene, 1, 0.45)],
    [0, at(scene, 1, 0.65)],
    [1, at(scene, 1, 0.85)],
    [2, at(scene, 2, 0.3)],
    [1, at(scene, 3, 0.55)],
    [2, at(scene, 3, 0.68)],
    [3, at(scene, 3, 0.8)],
    [4, at(scene, 3, 0.93)],
  ];
  const green = greenOf(walk, 6);
  const hexOut = fadeTo(f, at(scene, 4, 0.02), 0, 12);
  const stageNames = [1, 2, 3, 4, 5];
  const arrowStart = at(scene, 3, 0.1);
  return (
    <>
      <div style={{ opacity: hexOut }}>
        <NGon green={green} walk={walk} opacity={hexOut}
          frogRing={{ start: at(scene, 2, 0.45), end: at(scene, 3, 0.4) }}
          rings={[{ i: 3, start: arrowStart, end: walk[9][1] }, { i: 4, start: arrowStart, end: walk[10][1] }]}
          ringLabels={[{ i: 3, start: arrowStart, end: walk[9][1] }, { i: 4, start: arrowStart, end: walk[10][1] }]} />
        <Tag x={1000} y={260} start={at(scene, 1, 0.45)} color={GREEN} size={54}>
          always one unbroken block
        </Tag>
        <Tag x={1000} y={380} start={at(scene, 2, 0.4)} color={C.amber} size={54}>
          frog at an end
        </Tag>
        <Arc p={vert(6, 2)} q={vert(6, 3)} away={[560, 450]} bulge={22} start={arrowStart} end={walk[9][1]} />
        <Arc p={vert(6, 5)} q={vert(6, 4)} away={[560, 450]} bulge={22} start={arrowStart + 6} end={walk[10][1]} />
        <Tag x={1000} y={500} start={at(scene, 3, 0.2)} color={EXIT} size={54}>
          the frog must step out
        </Tag>
      </div>
      <Stage>
        {stageNames.map((k, i) => (
          <MiniHex key={k} cx={260 + i * 350} cy={430} greens={k} start={at(scene, 4, 0.08 + i * 0.1)} />
        ))}
      </Stage>
      {stageNames.map((k, i) => (
        <Tag key={k} x={260 + i * 350 - 130} y={560} w={260} center start={at(scene, 4, 0.1 + i * 0.1)} color={DARK} size={44}>
          stage {k}
        </Tag>
      ))}
    </>
  );
};

// ---- stage scenes: straightened line ----

const RX = 1150;

const Stage12: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 200, y = 360;
  const hexOut = fadeTo(f, at(scene, 1, 0.05), 0, 10);
  const hexC: Pt[] = [vert(6, 5, 560, 520, 190), vert(6, 0, 560, 520, 190), vert(6, 1, 560, 520, 190), vert(6, 2, 560, 520, 190)];
  const sx = (i: number): Pt => [x0 + i * SP, y];
  const away: Pt = [560, y - 900];
  const l = at(scene, 0, 0);
  return (
    <>
      <Chip k={1} start={at(scene, 0, 0.3)} />
      <div style={{ opacity: hexOut }}>
        <NGon n={6} cx={560} cy={520} r={190} dotR={24} green={[at(scene, 0, 0.1), Infinity, Infinity, Infinity, Infinity, Infinity]} frogStart={l + 4}
          rings={[{ i: 1, start: at(scene, 0, 0.35) }, { i: 5, start: at(scene, 0, 0.35) }]}
          ringLabels={[{ i: 1, start: at(scene, 0, 0.35) }, { i: 5, start: at(scene, 0, 0.35) }]} opacity={hexOut} />
      </div>
      {f >= at(scene, 1, 0.05) - 2 && (
        <Line k={2} x0={x0} y={y} start={at(scene, 1, 0.05)} morphFrom={hexC} morphStart={at(scene, 1, 0.12)} morphDur={30}
          labels={{
            0: { t: '0', s: at(scene, 2, 0.1) },
            3: { t: '0', s: at(scene, 2, 0.1) },
            1: { t: 'W', s: at(scene, 2, 0.1), color: GREEN },
            2: { t: 'W', s: at(scene, 4, 0.1), color: GREEN },
          }} />
      )}
      <Eq x={RX} y={240} start={at(scene, 2, 0.4)} tex="W = 1 + \dfrac{\text{left}+\text{right}}{2}" size={52} />
      <Tag x={RX} y={385} w={720} size={36} color={C.muted} start={at(scene, 2, 0.6)}>
        left, right: the wait at each landing spot
      </Tag>
      <Arc p={sx(1)} q={sx(0)} away={away} start={at(scene, 3, 0.1)} end={at(scene, 4, 0.02)} label="\dfrac12" bulge={44} labelOff={90} />
      <Arc p={sx(1)} q={sx(2)} away={away} start={at(scene, 3, 0.25)} end={at(scene, 4, 0.02)} label="\dfrac12" bulge={44} labelOff={90} />
      <Check x={110} y={y + 230} start={at(scene, 3, 0.35)}>done!</Check>
      <Stage>
        <line x1={(sx(1)[0] + sx(2)[0]) / 2} y1={y - 125} x2={(sx(1)[0] + sx(2)[0]) / 2} y2={y + 60} stroke={C.amber} strokeWidth={6} strokeDasharray="10 8" opacity={ease(f, at(scene, 4, 0.05), 12)} />
      </Stage>
      <Tag x={(sx(1)[0] + sx(2)[0]) / 2 - 90} y={y + 80} w={180} center start={at(scene, 4, 0.05)} color={C.amber} size={38}>
        mirror
      </Tag>
      <Eq x={RX} y={500} start={at(scene, 4, 0.3)} tex="W = 1 + \dfrac{0 + W}{2} = 1 + \dfrac{W}{2}" size={52} />
      <Eq x={RX} y={650} start={at(scene, 5, 0.1)} tex="\dfrac{W}{2} = 1" size={52} />
      <Eq x={RX + 330} y={660} start={at(scene, 5, 0.5)} tex="W = 2" size={60} color={C.green} box />
      <Chips upTo={2} newStart={at(scene, 5, 0.6)} />
    </>
  );
};

const Stage3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 200, y = 360;
  const sx = (i: number): Pt => [x0 + i * SP, y];
  const away: Pt = [560, y - 900];
  return (
    <>
      <Chips upTo={3} newStart={at(scene, 4, 0.8)} />
      <Line k={3} x0={x0} y={y} start={at(scene, 0, 0.05)}
        labels={{
          0: { t: '0', s: 0 },
          4: { t: '0', s: 0 },
          1: { t: 'W', s: at(scene, 0, 0.25), color: GREEN },
          2: { t: 'M', s: at(scene, 0, 0.55), color: C.amber },
          3: { t: 'W', s: at(scene, 0, 0.35), color: GREEN },
        }} />
      <Arc p={sx(2)} q={sx(1)} away={away} start={at(scene, 1, 0.1)} end={at(scene, 2, 0.02)} bulge={34} />
      <Arc p={sx(2)} q={sx(3)} away={away} start={at(scene, 1, 0.2)} end={at(scene, 2, 0.02)} bulge={34} />
      <Eq x={RX} y={250} start={at(scene, 1, 0.4)} tex="M = 1 + W" size={52} />
      <Arc p={sx(1)} q={sx(0)} away={away} start={at(scene, 2, 0.1)} end={at(scene, 3, 0.02)} label="\dfrac12" bulge={44} labelOff={90} />
      <Arc p={sx(1)} q={sx(2)} away={away} start={at(scene, 2, 0.25)} end={at(scene, 3, 0.02)} label="\dfrac12" bulge={44} labelOff={90} />
      <div style={{ opacity: fadeTo(f, at(scene, 3, 0.02), 0, 10) }}>
        <Check x={110} y={y + 230} start={at(scene, 2, 0.4)}>done!</Check>
      </div>
      <Eq x={RX} y={350} start={at(scene, 3, 0.1)} tex="W = 1 + \dfrac{M}{2}" size={52} />
      <Eq x={RX} y={490} start={at(scene, 3, 0.55)} tex="W = 1 + \dfrac{{\color{#7b61ff}1 + W}}{2}" size={52} />
      <Eq x={150} y={620} start={at(scene, 4, 0.12)} tex="W = \dfrac32 + \dfrac{W}{2}" size={52} />
      <Eq x={690} y={620} start={at(scene, 4, 0.4)} tex="\dfrac{W}{2} = \dfrac32" size={52} />
      <Eq x={1040} y={635} start={at(scene, 4, 0.65)} tex="W = 3" size={60} color={C.green} box />
    </>
  );
};

const Stage45: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // first half (L0-L2): stage 4 on the left; L3 hexagon, then the 7-slot line
  const s4Out = fadeTo(f, at(scene, 3, 0.02), 0, 12);
  const hexIn = ease(f, at(scene, 3, 0.04), 12) * fadeTo(f, at(scene, 3, 0.5), 0, 12);
  const s5In = at(scene, 3, 0.55);
  const x0 = 200, y = 360;
  const sx = (i: number): Pt => [x0 + i * SP, y];
  const away: Pt = [560, y - 900];
  const hx = 450, hy = 340;
  const sx5 = (i: number): Pt => [hx + i * SP, hy];
  const hexPos = (i: number) => vert(6, i, 560, 530, 190);
  const s5chip = f >= at(scene, 3, 0.9);
  return (
    <>
      <Chips upTo={s5chip ? 5 : 4} newStart={s5chip ? at(scene, 4, 0.8) : at(scene, 2, 0.8)} opacity={1} />
      <div style={{ opacity: s4Out }}>
        <Line k={4} x0={x0} y={y} start={at(scene, 0, 0.05)} opacity={s4Out} twin={[2, 3]} twinStart={at(scene, 0, 0.3)}
          labels={{
            0: { t: '0', s: 0 },
            5: { t: '0', s: 0 },
            1: { t: 'W', s: at(scene, 0, 0.45), color: GREEN },
            2: { t: 'P', s: at(scene, 0, 0.3), color: C.amber },
            3: { t: 'P', s: at(scene, 0, 0.3), color: C.amber },
            4: { t: 'W', s: at(scene, 0, 0.45), color: GREEN },
          }} />
        <Arc p={sx(2)} q={sx(1)} away={away} start={at(scene, 1, 0.1)} bulge={34} />
        <Arc p={sx(2)} q={sx(3)} away={away} start={at(scene, 1, 0.2)} bulge={34} />
        <Eq x={RX + 20} y={215} start={at(scene, 1, 0.4)} tex="P = 1 + \dfrac{W}{2} + \dfrac{P}{2}" size={52} opacity={s4Out} />
        <Eq x={RX + 20} y={390} start={at(scene, 2, 0.1)} tex="\dfrac{P}{2} = 1 + \dfrac{W}{2}" size={52} opacity={s4Out} />
        <Eq x={RX + 20} y={545} start={at(scene, 2, 0.3)} tex="P = 2 + W" size={52} color={C.amber} opacity={s4Out} />
        <Eq x={150} y={610} start={at(scene, 2, 0.45)} tex="W = 1 + \dfrac{P}{2} = 1 + \dfrac{2+W}{2}" size={52} opacity={s4Out} />
        <Eq x={1010} y={620} start={at(scene, 2, 0.6)} tex="\dfrac{W}{2} = 2" size={52} opacity={s4Out} />
        <Eq x={1300} y={640} start={at(scene, 2, 0.8)} tex="W = 4" size={60} color={C.green} box opacity={s4Out} />
      </div>
      {/* L3: the last corner touches both ends */}
      <div style={{ opacity: hexIn }}>
        <NGon n={6} cx={560} cy={530} r={190} dotR={24} green={[0, 0, 0, 0, Infinity, 0].map((v) => (v === 0 ? 0 : Infinity))} showFrog={false} opacity={hexIn}
          rings={[{ i: 4, start: at(scene, 3, 0.1) }]} />
        <Arc p={hexPos(5)} q={hexPos(4)} away={[560, 530]} start={at(scene, 3, 0.15)} bulge={20} />
        <Arc p={hexPos(3)} q={hexPos(4)} away={[560, 530]} start={at(scene, 3, 0.2)} bulge={20} />
        <Tag x={1000} y={380} start={at(scene, 3, 0.12)} color={GREEN} size={54}>
          5 green corners
        </Tag>
        <Tag x={1000} y={470} start={at(scene, 3, 0.2)} color={EXIT} size={54}>
          one corner missing
        </Tag>
      </div>
      {f >= s5In - 2 && (
        <>
          <Line k={5} x0={hx} y={hy} start={s5In}
            labels={{
              0: { t: '0', s: at(scene, 4, 0.05) },
              6: { t: '0', s: at(scene, 4, 0.05) },
              1: { t: 'W', s: at(scene, 4, 0.1), color: GREEN },
              2: { t: 'P', s: at(scene, 4, 0.1), color: C.amber },
              3: { t: 'M', s: at(scene, 4, 0.1), color: C.blue },
              4: { t: 'P', s: at(scene, 4, 0.1), color: C.amber },
              5: { t: 'W', s: at(scene, 4, 0.1), color: GREEN },
            }} />
          {[5, 8, 9, 8, 5].map((v, i) => (
            <Lbl key={`v${i}`} x={sx5(i + 1)[0]} y={hy + 90} tex={String(v)} start={at(scene, 4, i === 0 || i === 4 ? 0.45 : i === 2 ? 0.8 : 0.6)} size={56} color={DARK} />
          ))}
          <Stage>
            <path d={`M ${sx5(0)[0]} ${hy - 50} Q ${(sx5(0)[0] + sx5(6)[0]) / 2} ${hy - 170} ${sx5(6)[0]} ${hy - 50}`} fill="none" stroke={EXIT} strokeWidth={6} strokeDasharray="12 10" opacity={ease(f, at(scene, 3, 0.72), 14) * fadeTo(f, at(scene, 4, 0.02), 0, 10)} />
          </Stage>
          <Tag x={sx5(0)[0] - 130} y={hy + 62} w={260} center size={36} color={EXIT} start={at(scene, 3, 0.75)} end={at(scene, 4, 0.02)}>
            same last corner
          </Tag>
          <Tag x={sx5(6)[0] - 130} y={hy + 62} w={260} center size={36} color={EXIT} start={at(scene, 3, 0.75)} end={at(scene, 4, 0.02)}>
            same last corner
          </Tag>
          <Eq x={150} y={470} start={at(scene, 4, 0.25)} tex="M = 1 + P" size={52} />
          <Eq x={150} y={590} start={at(scene, 4, 0.45)} tex="P = 1 + \dfrac{W}{2} + \dfrac{M}{2} \;\Rightarrow\; P = 3 + W" size={52} />
          <Eq x={1050} y={470} start={at(scene, 4, 0.65)} tex="W = 1 + \dfrac{P}{2}" size={52} />
          <Eq x={1420} y={490} start={at(scene, 4, 0.85)} tex="W = 5" size={60} color={C.green} box />
        </>
      )}
    </>
  );
};

// ---- reveal ----

const REV_Y = 430;
const tokX = (j: number) => 310 + 130 * j;

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0, 0.3);
  const digits = [1, 2, 3, 4, 5];
  const land = at(scene, 1, 0.5);
  const done = at(scene, 1, 0.9);
  return (
    <>
      {digits.map((k) => {
        const p = ease(f, t0 + k * 3, 26);
        const chipCx = chipLeft(k) + 160, chipCy = 170;
        const cx = chipCx + (tokX(2 * (k - 1)) - chipCx) * p;
        const cy = chipCy + (REV_Y - chipCy) * p;
        const boxO = fadeTo(f, t0 + k * 3, 0, 8);
        return (
          <div key={k}>
            <Chip k={k} opacity={boxO} />
            <Lbl x={cx} y={cy} tex={String(k)} start={t0 + k * 3} size={Math.round(52 + 58 * p)} color={DARK} />
          </div>
        );
      })}
      {[1, 3, 5, 7].map((j) => (
        <Lbl key={j} x={tokX(j)} y={REV_Y} tex="+" start={at(scene, 0, 0.55 + j * 0.05)} size={100} color={C.muted} />
      ))}
      <Lbl x={tokX(9)} y={REV_Y} tex="=" start={land} size={100} color={C.muted} />
      <Lbl x={tokX(10)} y={REV_Y} tex="15" start={land} size={110} color={C.green} />
      <Badge x={960} y={680} letter="C" value="15" start={done} />
      <Confetti x={960} y={680} start={done} seed={7} />
      <Check x={1150} y={655} start={at(scene, 1, 0.96)}>exact computer check: 15</Check>
    </>
  );
};

// ---- hill ----

const HILL = [0, 5, 8, 9, 8, 5, 0];
const UNIT = 20;

const Hill: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 450, y = 560;
  const sx = (i: number) => x0 + i * SP;
  const topY = (i: number) => y - 45 - HILL[i] * UNIT;
  const base = y - 45;
  const lineStart = at(scene, 0, 0.4);
  const l1Out = fadeTo(f, at(scene, 7, 0.5), 0, 14);
  const genIn = ease(f, at(scene, 7, 0.52), 14);
  const l8Out = fadeTo(f, at(scene, 9, 0.02), 0, 12);
  const climbs = ['+5', '+3', '+1', '-1', '-3', '-5'];
  const gx = (i: number) => 360 + i * 240;
  const gy = 520;
  const gSlot: (string | null)[] = ['', '1', '2', null, 'k', ''];
  return (
    <>
      {/* L0: chips with a question mark */}
      <Eq x={0} y={160} center start={at(scene, 0, 0.1)} tex="1,\ 2,\ 3,\ 4,\ 5\ \ {\color{#7b61ff}?}" size={64} opacity={fadeTo(f, at(scene, 1, 0.02), 0, 10)} />
      <Tag x={0} y={175} w={1920} center start={at(scene, 1, 0.1)} size={52} color={C.ink} end={at(scene, 3, 0.02)}>
        wait = 1 + average of the neighbors
      </Tag>
      <div style={{ opacity: l1Out }}>
        <Line k={5} x0={x0} y={y} start={lineStart} frogOff opacity={l1Out}
          labels={{}} />
        {/* empty bar frames */}
        <Stage>
          {range(5).map((i) => (
            <rect key={i} x={sx(i + 1) - 45} y={base - 9 * UNIT} width={90} height={9 * UNIT} rx={10} fill="none" stroke={C.line} strokeWidth={5} strokeDasharray="10 8" opacity={ease(f, at(scene, 0, 0.55), 12) * fadeTo(f, at(scene, 2, 0.2), 0, 10)} />
          ))}
          {/* bars */}
          {HILL.map((h, i) => {
            const st = at(scene, 2, 0.05 + i * 0.062);
            const p = ease(f, st, 16);
            const hh = h * UNIT * p;
            const hi = (i >= 1 && i <= 3) && f >= at(scene, 2, 0.62);
            return (
              <g key={i}>
                {h > 0 && <rect x={sx(i) - 45} y={base - hh} width={90} height={hh} rx={10} fill={hi ? 'rgba(245,159,10,0.35)' : C.primarySoft} stroke={hi ? C.amber : GREEN} strokeWidth={6} opacity={ease(f, at(scene, 2, 0.05 + i * 0.062), 4)} />}
                {h === 0 && ease(f, at(scene, 1, 0.3), 12) > 0 && <line x1={sx(i) - 45} y1={base} x2={sx(i) + 45} y2={base} stroke={EXIT} strokeWidth={8} strokeLinecap="round" opacity={ease(f, at(scene, 1, 0.3), 12)} />}
              </g>
            );
          })}
          {/* climb arrows between bar tops */}
          {climbs.map((c, i) => {
            const p = ease(f, at(scene, 3, 0.2 + i * 0.12), 12);
            if (p <= 0) return null;
            const a: Pt = [sx(i) + 20, topY(i) - 8], b: Pt = [sx(i + 1) - 20, topY(i + 1) - 8];
            const up = HILL[i + 1] > HILL[i];
            const col = up ? C.green : EXIT;
            const e: Pt = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
            const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
            const u: Pt = [dx / L, dy / L], v: Pt = [-u[1], u[0]];
            return (
              <g key={i} opacity={l1Out}>
                <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={col} strokeWidth={7} strokeLinecap="round" />
                {p > 0.9 && <polygon points={`${b[0]},${b[1]} ${b[0] - u[0] * 24 + v[0] * 12},${b[1] - u[1] * 24 + v[1] * 12} ${b[0] - u[0] * 24 - v[0] * 12},${b[1] - u[1] * 24 - v[1] * 12}`} fill={col} />}
              </g>
            );
          })}
        </Stage>
        {/* numbers on bars */}
        {HILL.map((h, i) => (
          <Lbl key={i} x={sx(i)} y={topY(i) - 32} tex={String(h)} start={at(scene, 2, 0.1 + i * 0.062)} size={56} color={DARK} opacity={l1Out} />
        ))}
        {/* climb labels */}
        {climbs.map((c, i) => (
          <Lbl key={c} x={(sx(i) + sx(i + 1)) / 2} y={y + 92} tex={c} start={at(scene, 3, 0.25 + i * 0.12)} size={54} color={HILL[i + 1] > HILL[i] ? C.green : EXIT} end={at(scene, 5, 0.02)} opacity={l1Out} />
        ))}
        {/* L2: check row */}
        <Eq x={0} y={715} center start={at(scene, 2, 0.62)} tex="8 = 1 + \dfrac{5 + 9}{2} = 1 + 7" size={56} opacity={l1Out * fadeTo(f, at(scene, 4, 0.02), 0, 10)} />
        <Eq x={0} y={715} center start={at(scene, 4, 0.2)} tex="\dfrac{5+9}{2} = 7,\quad 8 = 7 + 1" size={56} opacity={l1Out * fadeTo(f, at(scene, 4, 0.5), 0, 10)} />
        {/* L4: reasons */}
        <Eq x={0} y={715} center start={at(scene, 4, 0.55)} tex="8-5=3,\quad 9-8=1,\quad 3-1=2" size={56} opacity={l1Out * fadeTo(f, at(scene, 5, 0.02), 0, 10)} />
        <Tag x={0} y={175} w={1920} center start={at(scene, 4, 0.02)} size={52} color={DARK} end={at(scene, 4, 0.5)}>
          each climb is 2 less than the last
        </Tag>
        <Tag x={0} y={175} w={1920} center start={at(scene, 4, 0.58)} size={52} color={C.amber} end={at(scene, 4, 0.85)}>
          climb in {'−'} climb out = 2
        </Tag>
        <Tag x={0} y={175} w={1920} center start={at(scene, 4, 0.88)} size={52} color={EXIT} end={at(scene, 5, 0.02)}>
          {'\u2212'}2 each time
        </Tag>
        {/* L5: spot numbers and products */}
        {range(7).map((i) => (
          <Lbl key={`s${i}`} x={sx(i)} y={y + 88} tex={String(i)} start={at(scene, 5, 0.04 + i * 0.03)} size={50} color={C.muted} opacity={l1Out} />
        ))}
        {[1, 2, 3, 4, 5].map((i) => (
          <Lbl key={`p${i}`} x={sx(i)} y={y + 160} tex={`${i}\\times${6 - i}`} start={at(scene, 5, 0.4 + i * 0.09)} size={52} color={GREEN}
            end={at(scene, 6, 0.04)} opacity={l1Out} />
        ))}
        {/* L6: steps to each exit for slot 2 */}
        <Stage>
          <g opacity={ease(f, at(scene, 6, 0.15), 14) * l1Out * fadeTo(f, at(scene, 7, 0.08), 0, 10)}>
            <path d={`M ${sx(0)} ${y + 120} L ${sx(0)} ${y + 138} L ${sx(2)} ${y + 138} L ${sx(2)} ${y + 120}`} fill="none" stroke={EXIT} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M ${sx(2) + 8} ${y + 120} L ${sx(2) + 8} ${y + 138} L ${sx(6)} ${y + 138} L ${sx(6)} ${y + 120}`} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" />
          </g>
        </Stage>
        <Tag x={(sx(0) + sx(2)) / 2 - 130} y={y + 146} w={260} center start={at(scene, 6, 0.2)} size={40} color={EXIT} end={at(scene, 7, 0.08)}>2 steps</Tag>
        <Tag x={(sx(2) + sx(6)) / 2 - 130} y={y + 146} w={260} center start={at(scene, 6, 0.35)} size={40} color={C.green} end={at(scene, 7, 0.08)}>4 steps</Tag>
        <Tag x={0} y={175} w={1920} center start={at(scene, 6, 0.55)} size={44} color={C.ink} end={at(scene, 7, 0.08)}>
          <span style={{ border: `6px solid ${GREEN}`, borderRadius: 20, padding: '4px 22px', background: C.card }}>
            wait = (steps to one exit) {'×'} (steps to the other exit)
          </span>
        </Tag>
        {/* L7a: stage-5 instance tag */}
        <Tag x={0} y={175} w={1920} center start={at(scene, 7, 0.12)} size={46} color={C.ink} end={at(scene, 7, 0.5)}>
          6 climbs, each 2 less: +5 … −5
        </Tag>
      </div>

      {/* L7b-L9: generic stage k */}
      <div style={{ opacity: genIn * l8Out }}>
        <Stage>
          {/* schematic hill silhouette */}
          <path d={`M ${gx(0)} ${gy - 45} L ${gx(1)} ${gy - 115} L ${gx(2)} ${gy - 165} L ${gx(3)} ${gy - 180} L ${gx(4)} ${gy - 165} L ${gx(5)} ${gy - 115} L ${gx(6)} ${gy - 45}`} fill="none" stroke={GREEN} strokeWidth={7} strokeLinejoin="round" strokeDasharray="14 10" opacity={0} />
          <line x1={gx(0)} y1={gy} x2={gx(5)} y2={gy} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
          {gSlot.map((s, i) =>
            s === null ? null : i === 0 || i === 5 ? (
              <circle key={i} cx={gx(i)} cy={gy} r={40} fill={C.violetSoft} stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" />
            ) : (
              <circle key={i} cx={gx(i)} cy={gy} r={40} fill={GREEN} />
            ),
          )}
          <path d={`M ${gx(0)} ${gy - 62} L ${gx(1)} ${gy - 128} L ${gx(2)} ${gy - 174} L ${gx(3)} ${gy - 190} L ${gx(4)} ${gy - 174} L ${gx(5)} ${gy - 128}`} fill="none" stroke="none" />
          <Frog x={gx(1)} y={gy - 2} s={0.85} opacity={ease(f, at(scene, 8, 0.05), 10)} />
        </Stage>
        <Lbl x={gx(3)} y={gy} tex="\cdots" start={at(scene, 7, 0.55)} size={64} color={C.muted} />
        {['', '1', '2', '', 'k'].map((s, i) => (s ? <Lbl key={i} x={gx(i)} y={gy - 92} tex={s} start={at(scene, 7, 0.6)} size={58} color={C.muted} /> : null))}
        {/* climbs +k ... -k */}
        {['+k', '+(k-2)', '\\cdots', '-(k-2)', '-k'].map((c, i) => (
          <Lbl key={i} x={(gx(i) + gx(i + 1)) / 2} y={gy + 100} tex={c} start={at(scene, 7, 0.65 + i * 0.05)} size={54} color={i < 2 ? C.green : i === 2 ? C.muted : EXIT} end={at(scene, 8, 0.02)} />
        ))}
        <Tag x={0} y={190} w={1920} center start={at(scene, 7, 0.58)} size={52} color={DARK} end={at(scene, 8, 0.02)}>
          k + 1 climbs, mirrored
        </Tag>
        <Tag x={0} y={265} w={1920} center start={at(scene, 7, 0.75)} size={46} color={EXIT} end={at(scene, 8, 0.02)}>
          both exits are 0, so the climbs cancel
        </Tag>
        {/* L8: brackets */}
        <Stage>
          <g opacity={ease(f, at(scene, 8, 0.15), 14)}>
            <path d={`M ${gx(0)} ${gy + 70} L ${gx(0)} ${gy + 90} L ${gx(1)} ${gy + 90} L ${gx(1)} ${gy + 70}`} fill="none" stroke={EXIT} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M ${gx(1) + 8} ${gy + 70} L ${gx(1) + 8} ${gy + 90} L ${gx(5)} ${gy + 90} L ${gx(5)} ${gy + 70}`} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" />
          </g>
        </Stage>
        <Tag x={(gx(0) + gx(1)) / 2 - 100} y={gy + 100} w={200} center start={at(scene, 8, 0.2)} size={40} color={EXIT}>1 step</Tag>
        <Tag x={(gx(1) + gx(5)) / 2 - 100} y={gy + 100} w={200} center start={at(scene, 8, 0.35)} size={40} color={C.green}>k steps</Tag>
        <Eq x={0} y={680} center start={at(scene, 8, 0.6)} tex="1 \times k = k" size={72} color={C.green} box />
      </div>
      <Tag x={0} y={330} w={1920} center start={at(scene, 9, 0.2)} size={72} color={C.ink}>
        big shapes: use the <span style={{ color: GREEN }}>hill</span>
      </Tag>
    </>
  );
};

// ---- traps ----

const TrapCard: React.FC<{ y: number; letter: string; value: string; tex: string; note: string; start: number; note2?: string; start2?: number }> = ({ y, letter, value, tex, note, start, note2, start2 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const sw = start2 === undefined ? 0 : ease(f, start2, 10);
  return (
    <div style={{ position: 'absolute', left: 100, top: y, width: 900, height: 140, background: C.card, borderRadius: 28, border: `5px solid ${C.red}`, boxShadow: '0 6px 20px rgba(239,67,67,0.12)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 28px', ...s }}>
      <div style={{ width: 110, height: 90, borderRadius: 22, background: C.red, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {letter} {value}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ whiteSpace: 'nowrap' }}>
          <Tex tex={tex} size={52} color={C.ink} />
        </div>
        <div style={{ position: 'relative', height: 46 }}>
          <div style={{ position: 'absolute', fontSize: 34, fontWeight: 800, color: C.red, whiteSpace: 'nowrap', opacity: 1 - sw }}>{note}</div>
          {note2 && <div style={{ position: 'absolute', fontSize: 34, fontWeight: 800, color: C.amber, whiteSpace: 'nowrap', opacity: sw }}>{note2}</div>}
        </div>
      </div>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const gx0 = 1090, sp = 150, gy = 400;
  const walk: Walk = [[1, 0], [2, at(scene, 2, 0.45)]];
  const pos = (i: number): Pt => [gx0 + i * sp, gy];
  const fp = hopPos(f, walk, pos);
  const figIn = ease(f, at(scene, 2, 0.02), 14);
  return (
    <>
      <TrapCard y={150} letter="A" value="10" tex="1+2+3+4 = 10" note="forgot stage 5" start={at(scene, 0, 0.15)} />
      <TrapCard y={310} letter="B" value="12" tex="6 \times 2 = 12" note="every corner = 2 jumps?" start={at(scene, 1, 0.15)} />
      <TrapCard y={470} letter="D" value="18" tex="6 \times 3 = 18" note="every corner = 3 jumps?" note2="stages aren't equal" start2={at(scene, 1, 0.78)} start={at(scene, 1, 0.45)} />
      <TrapCard y={630} letter="E" value="21" tex="1+2+3+4+5+6 = 21" note="no stage 6: all green = done" start={at(scene, 3, 0.15)} />
      <Stage>
        <g opacity={figIn}>
          <line x1={pos(0)[0]} y1={gy} x2={pos(5)[0]} y2={gy} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
          {range(6).map((i) =>
            i === 0 || i === 5 ? (
              <circle key={i} cx={pos(i)[0]} cy={gy} r={36} fill={C.violetSoft} stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" />
            ) : (
              <circle key={i} cx={pos(i)[0]} cy={gy} r={36} fill={GREEN} />
            ),
          )}
          <Frog x={fp[0]} y={fp[1] - 2} s={0.8} />
        </g>
      </Stage>
      <Arc p={pos(1)} q={pos(2)} away={[gx0 + 300, gy - 900]} start={at(scene, 2, 0.4)} color={C.red} bulge={40} sh={30} />
      <Tag x={gx0 - 60} y={gy + 120} w={800} start={at(scene, 2, 0.5)} size={40} color={C.red}>
        a step back lands inside the block
      </Tag>
      <Tag x={gx0 - 60} y={gy + 170} w={800} start={at(scene, 2, 0.55)} size={40} color={C.muted}>
        farther from the new corners
      </Tag>
      {/* growing stage bars */}
      <Stage>
        {range(5).map((i) => {
          const p = ease(f, at(scene, 2, 0.62 + i * 0.07), 14);
          const h = (i + 1) * 28 * p;
          return <rect key={i} x={gx0 + 20 + i * 140} y={760 - h} width={100} height={h} rx={12} fill={C.primarySoft} stroke={GREEN} strokeWidth={6} />;
        })}
      </Stage>
      {range(5).map((i) => (
        <Lbl key={i} x={gx0 + 70 + i * 140} y={790} tex={String(i + 1)} start={at(scene, 2, 0.66 + i * 0.07)} size={48} color={DARK} />
      ))}
    </>
  );
};

// ---- variant ----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = (i: number) => vert(8, i, 560, 500, 240);
  return (
    <>
      <Pill x={100} y={140} color={EXIT} style={{ ...fadeUp(f, at(scene, 0, 0.3)), fontSize: 38 }}>
        Your turn!
      </Pill>
      <NGon n={8} cy={500} r={240} green={[0, ...Array(7).fill(Infinity)]} frogStart={at(scene, 0, 0.3)} />
      <Arc p={P(0)} q={P(1)} away={[560, 500]} start={at(scene, 0, 0.7)} label="\dfrac12" bulge={22} labelOff={90} />
      <Arc p={P(0)} q={P(7)} away={[560, 500]} start={at(scene, 0, 0.8)} label="\dfrac12" bulge={22} labelOff={90} />
      <Text x={960} y={380} w={850} size={56} weight={900} style={fadeUp(f, at(scene, 1, 0.3))}>
        Expected jumps until all <span style={{ color: EXIT }}>8</span> corners?
      </Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const o0 = fadeTo(f, at(scene, 2, 0.02), 0, 12);
  const gx = (i: number) => 330 + i * 240;
  const gy = 470;
  const done = at(scene, 2, 0.93);
  const P = (i: number) => vert(8, i, 560, 450, 250);
  const greens = [at(scene, 0, 0.1), at(scene, 0, 0.2), at(scene, 0, 0.3), Infinity, Infinity, Infinity, Infinity, at(scene, 0, 0.0)];
  const walk: Walk = [[7, at(scene, 0, 0.0)], [0, at(scene, 0, 0.1)], [1, at(scene, 0, 0.2)], [2, at(scene, 0, 0.3)]];
  const lineIn = ease(f, at(scene, 1, 0.05), 14);
  return (
    <>
      <div style={{ opacity: o0 * fadeTo(f, at(scene, 1, 0.02), 0, 12) }}>
        <NGon n={8} green={greenOf(walk, 8)} walk={walk} opacity={o0 * fadeTo(f, at(scene, 1, 0.02), 0, 12)}
          rings={[{ i: 3, start: at(scene, 0, 0.5) }, { i: 6, start: at(scene, 0, 0.5) }]}
          ringLabels={[{ i: 3, start: at(scene, 0, 0.5) }, { i: 6, start: at(scene, 0, 0.5) }]}
          frogRing={{ start: at(scene, 0, 0.45) }} />
        <Tag x={1000} y={330} start={at(scene, 0, 0.3)} color={GREEN} size={54}>one unbroken block</Tag>
        <Tag x={1000} y={430} start={at(scene, 0, 0.5)} color={C.amber} size={54}>frog at an end</Tag>
      </div>
      <div style={{ opacity: lineIn * o0 }}>
        <Stage>
          <line x1={gx(0)} y1={gy} x2={gx(5)} y2={gy} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
          {[0, 1, 2, 4, 5].map((i) =>
            i === 0 || i === 5 ? (
              <circle key={i} cx={gx(i)} cy={gy} r={40} fill={C.violetSoft} stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" />
            ) : (
              <circle key={i} cx={gx(i)} cy={gy} r={40} fill={GREEN} />
            ),
          )}
          <Frog x={gx(1)} y={gy - 2} s={0.85} />
          <g opacity={ease(f, at(scene, 1, 0.3), 14)}>
            <path d={`M ${gx(0)} ${gy + 70} L ${gx(0)} ${gy + 90} L ${gx(1)} ${gy + 90} L ${gx(1)} ${gy + 70}`} fill="none" stroke={EXIT} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M ${gx(1) + 8} ${gy + 70} L ${gx(1) + 8} ${gy + 90} L ${gx(5)} ${gy + 90} L ${gx(5)} ${gy + 70}`} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" />
          </g>
        </Stage>
        <Lbl x={gx(3)} y={gy} tex="\cdots" start={at(scene, 1, 0.1)} size={64} color={C.muted} />
        <Lbl x={gx(1)} y={gy - 92} tex="1" start={at(scene, 1, 0.1)} size={58} color={C.muted} />
        <Lbl x={gx(4)} y={gy - 92} tex="k" start={at(scene, 1, 0.1)} size={58} color={C.muted} />
        <Tag x={(gx(0) + gx(1)) / 2 - 100} y={gy + 100} w={200} center start={at(scene, 1, 0.35)} size={40} color={EXIT}>1 step</Tag>
        <Tag x={(gx(1) + gx(5)) / 2 - 100} y={gy + 100} w={200} center start={at(scene, 1, 0.45)} size={40} color={C.green}>k steps</Tag>
        <Eq x={0} y={680} center start={at(scene, 1, 0.65)} tex="1 \times k = k" size={72} color={C.green} box />
      </div>
      <Lbl x={760} y={375} start={at(scene, 2, 0.15)} tex="1 + 2 + 3 + 4 + 5 + 6 + 7" size={80} />
      <Lbl x={1470} y={375} tex="= 28" start={at(scene, 2, 0.6)} size={80} color={C.green} />
      <Badge x={960} y={650} value="28" start={done} />
      <Confetti x={960} y={650} start={done} seed={11} />
    </>
  );
};

// ---- recap ----

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 360, x1 = 1560, y = 440;
  const mid = (x0 + x1) / 2 + 60;
  const walkers: Walk = [[0, 0]];
  const o = fadeTo(f, at(scene, 2, 0.02), 0, 12);
  // seeded back-and-forth wiggle of the walker dot
  const wig = Math.sin(f / 9) * 150 + Math.sin(f / 4.3) * 40;
  const wx = ease(f, at(scene, 1, 0.1), 20) > 0 ? mid : mid + wig * fadeTo(f, at(scene, 1, 0.05), 0, 20);
  return (
    <>
      <div style={{ opacity: o }}>
        <Pill x={100} y={140} color={C.primary} style={{ ...fadeUp(f, 0), fontSize: 38 }}>
          The big idea
        </Pill>
        <Stage>
          <g opacity={ease(f, 6, 14)}>
            <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.line} strokeWidth={10} strokeLinecap="round" />
            <circle cx={x0} cy={y} r={46} fill={C.violetSoft} stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" />
            <circle cx={x1} cy={y} r={46} fill={C.violetSoft} stroke={EXIT} strokeWidth={7} strokeDasharray="12 9" />
            <circle cx={wx} cy={y} r={26} fill={GREEN} />
          </g>
          <g opacity={ease(f, at(scene, 1, 0.15), 14)}>
            <path d={`M ${x0} ${y + 74} L ${x0} ${y + 96} L ${wx - 6} ${y + 96} L ${wx - 6} ${y + 74}`} fill="none" stroke={EXIT} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M ${wx + 6} ${y + 74} L ${wx + 6} ${y + 96} L ${x1} ${y + 96} L ${x1} ${y + 74}`} fill="none" stroke={C.green} strokeWidth={6} strokeLinejoin="round" />
          </g>
        </Stage>
        <Tag x={0} y={y - 150} w={1920} center start={at(scene, 0, 0.5)} size={50} color={C.muted}>
          equal chances each step, an exit at each end
        </Tag>
        <Tag x={(x0 + wx) / 2 - 150} y={y + 108} w={300} center start={at(scene, 1, 0.2)} size={44} color={EXIT}>a steps</Tag>
        <Tag x={(wx + x1) / 2 - 150} y={y + 108} w={300} center start={at(scene, 1, 0.3)} size={44} color={C.green}>b steps</Tag>
        <Eq x={0} y={650} center start={at(scene, 1, 0.55)} tex="\text{average wait} = a \times b" size={72} color={C.green} box />
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause({ n: 6, choices: true, seconds: 10, prompt: 'Expected number of jumps until the frog has been on all six vertices?' }),
  block: Block,
  stage12: Stage12,
  stage3: Stage3,
  stage45: Stage45,
  reveal: Reveal,
  hill: Hill,
  traps: Traps,
  variant: Variant,
  try2: makePause({ n: 8, choices: false, seconds: 10, prompt: 'A frog on a regular octagon jumps to a neighboring corner each second, each with chance 1/2.' }),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 5" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + the hexagon with the frog on its start corner, no answer.
export const Thumb: React.FC = () => {
  const cx = 340, cy = 320, r = 255;
  const V = (i: number): Pt => [cx + r * Math.sin((i * Math.PI) / 3), cy - r * Math.cos((i * Math.PI) / 3)];
  return (
    <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>12?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <path d={`M ${range(6).map((i) => V(i).join(' ')).join(' L ')} Z`} fill="none" stroke={C.line} strokeWidth={14} strokeLinejoin="round" />
        {range(6).map((i) => (
          <circle key={i} cx={V(i)[0]} cy={V(i)[1]} r={i === 0 ? 46 : 40} fill={i === 0 ? GREEN : C.card} stroke={i === 0 ? '#fff' : '#c9ceda'} strokeWidth={8} />
        ))}
        <Frog x={V(0)[0]} y={V(0)[1] - 4} s={1.7} />
      </svg>
    </ThumbFrame>
  );
};

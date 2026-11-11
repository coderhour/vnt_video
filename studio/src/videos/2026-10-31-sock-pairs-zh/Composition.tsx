import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-sock-pairs-zh';
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

export const COL = ['#ef4343', '#3c83f6', '#21c45d', '#7b61ff', '#ff9f1c', '#f2c200']; // red blue green purple orange yellow
const PANEL = 760;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------- socks ----------

const BODY = 'M16 4 Q16 0 20 0 H60 Q64 0 64 4 V66 Q64 74 72 78 L92 88 Q104 95 100 108 Q95 118 80 118 H34 Q16 118 16 98 Z';
const STAR = 'M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z';

/** One sock, centred at (x, y). v = 1 has two white stripes, so the two socks of a color are visibly different socks. */
export const Sock: React.FC<{ x: number; y: number; k?: number; c: number; v: number; op?: number; glow?: number }> = ({ x, y, k = 1, c, v, op = 1, glow = 0 }) => {
  const f = useCurrentFrame();
  if (op <= 0) return null;
  const pulse = 0.85 + 0.15 * Math.sin(f / 4);
  return (
    <g transform={`translate(${x - 50 * k} ${y - 60 * k}) scale(${k})`} opacity={op}>
      {glow > 0 && (
        <>
          <circle cx={50} cy={60} r={82} fill="#ffd54a" opacity={0.5 * glow * pulse} />
          {[[-8, 6, 1], [108, -2, 0.8], [104, 112, 1.1], [-4, 116, 0.7]].map(([sx, sy, s], i) => (
            <path key={i} d={STAR} fill="#ffb300" transform={`translate(${sx} ${sy}) scale(${s * glow * (0.7 + 0.5 * Math.abs(Math.sin(f / 6 + i * 1.7)))})`} />
          ))}
        </>
      )}
      <path d={BODY} fill={COL[c]} stroke="rgba(0,0,0,0.28)" strokeWidth={3} />
      <rect x={16} y={0} width={48} height={18} rx={5} fill="#fff" opacity={0.4} />
      {v === 1 && (
        <>
          <rect x={16} y={34} width={48} height={8} fill="#fff" opacity={0.9} />
          <rect x={16} y={50} width={48} height={8} fill="#fff" opacity={0.9} />
        </>
      )}
    </g>
  );
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0 }}>
    {children}
  </svg>
);

export type Over = { to?: [number, number, number]; p?: number; op?: number; glow?: number };

/** Centre of the sock (color c, variant v) lying in a drawer at (x, y). */
const dpos = (x: number, y: number, cell: number, c: number, v: number): [number, number] => {
  const k = cell / 150;
  return [x + 24 + (c + 0.5) * cell, y + 30 + (v + 0.5) * 140 * k];
};

/** A drawer of n colors x 2 socks. `over(c, v)` lifts / dims / glows single socks. */
export const Drawer: React.FC<{ x: number; y: number; n: number; cell?: number; over?: (c: number, v: number) => Over | undefined; op?: number }> = ({ x, y, n, cell = 150, over, op = 1 }) => {
  const k = cell / 150;
  const W = n * cell + 48;
  const H = 2 * 140 * k + 60;
  const items = range(n * 2).map((i) => {
    const c = Math.floor(i / 2);
    const v = i % 2;
    const o = over?.(c, v) ?? {};
    const [bx, by] = dpos(x, y, cell, c, v);
    const p = o.p ?? 0;
    const to = o.to ?? [bx, by, k];
    return { c, v, o, X: lerp(bx, to[0], p), Y: lerp(by, to[1], p), K: lerp(k * 0.95, to[2], p), lifted: p > 0 };
  });
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={W} height={H} rx={26} fill="#f1e2c4" stroke="#caa86a" strokeWidth={8} />
      <rect x={x + 14} y={y + 14} width={W - 28} height={H - 28} rx={16} fill="#e4cfa6" />
      {[false, true].map((top) =>
        items
          .filter((s) => s.lifted === top)
          .map((s) => <Sock key={`${s.c}-${s.v}`} x={s.X} y={s.Y} k={s.K} c={s.c} v={s.v} op={s.o.op ?? 1} glow={s.o.glow ?? 0} />),
      )}
    </g>
  );
};

const SockRow: React.FC<{ x: number; y: number; k?: number; gap?: number; socks: [number, number][]; op?: number; glow?: (i: number) => number }> = ({ x, y, k = 0.6, gap = 78, socks, op = 1, glow }) => (
  <g opacity={op}>
    {socks.map(([c, v], i) => (
      <Sock key={i} x={x + i * gap} y={y} k={k} c={c} v={v} glow={glow?.(i) ?? 0} />
    ))}
  </g>
);

export const Dot: React.FC<{ x: number; y: number; c: number; r?: number; ring?: boolean; dim?: number; op?: number }> = ({ x, y, c, r = 32, ring = false, dim = 0, op = 1 }) => (
  <g opacity={op}>
    {ring && <circle cx={x} cy={y} r={r + 12} fill="none" stroke={C.ink} strokeWidth={6} />}
    <circle cx={x} cy={y} r={r} fill={COL[c]} opacity={1 - 0.8 * dim} />
    {dim > 0.5 && <path d={`M${x - r * 0.6} ${y - r * 0.6} L${x + r * 0.6} ${y + r * 0.6} M${x + r * 0.6} ${y - r * 0.6} L${x - r * 0.6} ${y + r * 0.6}`} stroke={C.muted} strokeWidth={6} strokeLinecap="round" />}
  </g>
);

/** Two colors as a "dot pair" chip. */
const DotPair: React.FC<{ x: number; y: number; a: number; b: number; w?: number; op?: number }> = ({ x, y, a, b, w = 130, op = 1 }) => (
  <g opacity={op} transform={`translate(0 ${(1 - op) * 14})`}>
    <rect x={x} y={y} width={w} height={66} rx={18} fill={C.card} stroke={C.line} strokeWidth={3} />
    <circle cx={x + w * 0.3} cy={y + 33} r={22} fill={COL[a]} />
    <circle cx={x + w * 0.7} cy={y + 33} r={22} fill={COL[b]} />
  </g>
);

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string | Part[]; size?: number; color?: string; op?: number }> = ({ x = PANEL, y, start, tex, size = 56, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start), opacity: ease(f, start, 14) * op }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Same row twice: `a` fades out as `b` (which extends it) fades in. */
const Morph: React.FC<{ x?: number; y: number; show: number; start: number; a: string; b: string; size?: number; color?: string }> = ({ x = PANEL, y, show, start, a, b, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', opacity: ease(f, show, 12) }}>
      <div style={{ opacity: 1 - p }}>
        <Tex tex={a} size={size} color={color} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: p }}>
        <Tex tex={b} size={size} color={color} />
      </div>
    </div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string }> = ({ x = 100, y, w = 840, start, children, color = C.red }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: 42, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

const Chime: React.FC<{ start: number }> = ({ start }) => (
  <Sequence from={start} durationInFrames={60} layout="none">
    <Audio src={CHIME} volume={0.3} />
  </Sequence>
);

export const CHOICES = ['80', '125', '130', '140', '210'];
const ChoiceChips: React.FC<{ x: number; y: number; start: (i: number) => number; bad?: (i: number) => number }> = ({ x, y, start, bad }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 14 }}>
      {CHOICES.map((c, i) => {
        const b = bad ? bad(i) : 0;
        return (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), width: 150, textAlign: 'center', background: b > 0 ? 'rgba(239,67,67,0.14)' : C.card, border: `4px solid ${b > 0 ? C.red : 'transparent'}`, borderRadius: 18, padding: '8px 0', fontSize: 46, fontWeight: 800, color: b > 0 ? C.red : C.ink, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', opacity: ease(f, start(i), 10) }}>
            <span style={{ color: C.muted, fontSize: 30, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        );
      })}
    </div>
  );
};

const QCARD = (s: (i: number) => React.CSSProperties, pairs: string, again = false) => (
  <>
    <span style={s(1)}>抽屉里有 {pairs} 双袜子，每双袜子的颜色都不一样。</span>
    <span style={s(2)}>佐伊{again ? '还是' : '从里面'}拿出 4 只袜子。</span>
  </>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const DX = 100;
  const DY = 330;
  const set1: [number, number][] = [[0, 0], [0, 1], [1, 0], [2, 0]];
  const set2: [number, number][] = [[1, 0], [2, 1], [3, 0], [4, 1]];
  const g1 = ease(f, at(scene, 0, 0.3), 18) * (1 - ease(f, at(scene, 1, 0.0), 14));
  const g2 = ease(f, at(scene, 1, 0.5), 18);
  const glow = ease(f, at(scene, 0, 0.65), 10) * (1 - ease(f, at(scene, 1, 0.0), 10));
  const T = (i: number): [number, number, number] => [1150 + i * 170, 340, 1];
  const over = (c: number, v: number): Over | undefined => {
    const j2 = set2.findIndex(([a, b]) => a === c && b === v);
    if (j2 >= 0 && g2 > 0) return { to: T(j2), p: g2 };
    const j1 = set1.findIndex(([a, b]) => a === c && b === v);
    if (j1 >= 0) return { to: T(j1), p: g1, glow: c === 0 ? glow : 0 };
    return undefined;
  };
  return (
    <>
      <Svg>
        <Drawer x={DX} y={DY} n={5} over={over} />
      </Svg>
      <Pill x={1150} y={490} color={C.green} style={{ ...fadeUp(f, at(scene, 0, 0.7)), opacity: ease(f, at(scene, 0, 0.7), 10) * (1 - ease(f, at(scene, 1, 0), 8)), fontSize: 44 }}>凑成一双！</Pill>
      <Pill x={1150} y={490} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.8)), fontSize: 44 }}>一双也没有</Pill>
      <div style={{ position: 'absolute', left: 1130, top: 600, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const red: [number, number][] = [[0, 0], [0, 1], [1, 1], [2, 0]];
  const lift = ease(f, at(scene, 2, 0.35), 18);
  const glow = ease(f, at(scene, 3, 0.5), 12);
  const over = (c: number, v: number): Over | undefined => {
    const j = red.findIndex(([a, b]) => a === c && b === v);
    return j < 0 ? undefined : { to: [1130 + j * 170, 240, 1], p: lift, glow: c === 0 ? glow : 0 };
  };
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 150, width: 860, minHeight: 440, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        {QCARD(s, '5')}
        <span style={s(3)}>
          有多少组 4 只袜子，<Mark on={at(scene, 3, 0.4)}>至少包含一双同色的袜子</Mark>？
        </span>
      </div>
      <Svg>
        <Drawer x={1040} y={400} n={5} over={over} op={ease(f, 2, 10)} />
      </Svg>
      <ChoiceChips x={100} y={700} start={(i) => at(scene, 4, 0.2 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g1 = fadeTo(f, at(scene, 1), 0, 10);
  const pairGlow = ease(f, at(scene, 0, 0.75), 12) * (1 - ease(f, at(scene, 1, 0.0), 10));
  const over = (c: number, v: number): Over | undefined => (c === 0 ? { glow: pairGlow } : undefined);
  const A: [number, number][] = [[0, 0], [1, 1], [2, 0], [3, 1]];
  const B: [number, number][] = [[3, 1], [0, 0], [2, 0], [1, 1]];
  return (
    <>
      <Svg>
        <Drawer x={100} y={230} n={5} cell={120} over={over} />
        <g opacity={g1 * ease(f, at(scene, 0, 0.55), 12)}>
          <Sock x={1060} y={450} k={1.6} c={0} v={0} />
          <Sock x={1330} y={450} k={1.6} c={0} v={1} />
        </g>
        <SockRow x={PANEL + 140} y={400} socks={A} op={ease(f, at(scene, 1, 0.3), 12)} />
        <SockRow x={PANEL + 520} y={400} socks={B} op={ease(f, at(scene, 1, 0.55), 12)} />
        <SockRow x={1210} y={645} socks={[[0, 0], [0, 1], [1, 1], [2, 0]]} op={ease(f, at(scene, 2, 0.25), 12)} />
        <SockRow x={1210} y={775} socks={[[0, 0], [0, 1], [1, 0], [1, 1]]} op={ease(f, at(scene, 2, 0.6), 12)} />
      </Svg>
      <Fade op={g1}>
        <Text x={PANEL + 120} y={170} w={1000} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.2))}>10 只袜子</Text>
        <Text x={PANEL + 120} y={250} w={1000} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.4))}>5 种颜色 × 每种 2 只</Text>
        <Text x={PANEL + 120} y={580} w={1000} size={46} weight={800} color={C.violet} style={{ opacity: ease(f, at(scene, 0, 0.7), 12) }}>颜色一样，但是两只不同的袜子</Text>
      </Fade>
      <Text x={PANEL + 120} y={170} w={1000} size={56} weight={900} style={{ opacity: ease(f, at(scene, 1, 0.1), 12) }}>一组 = 拿的是哪 4 只</Text>
      <div style={{ position: 'absolute', left: PANEL + 440, top: 345, fontSize: 80, fontWeight: 900, opacity: ease(f, at(scene, 1, 0.5), 12) }}>=</div>
      <Text x={PANEL + 120} y={460} w={1000} size={44} weight={800} color={C.violet} style={{ opacity: ease(f, at(scene, 1, 0.7), 12) }}>同样的袜子，不管顺序：算一组</Text>
      <Text x={PANEL + 120} y={575} w={260} size={46} weight={900} color={C.primary} style={{ opacity: ease(f, at(scene, 2, 0.1), 12), top: 600 }}>一双</Text>
      <Text x={PANEL + 120} y={705} w={260} size={46} weight={900} color={C.primary} style={{ opacity: ease(f, at(scene, 2, 0.45), 12), top: 730 }}>两双</Text>
      <Check x={1620} y={615} start={at(scene, 2, 0.35)}>{''}</Check>
      <Check x={1620} y={745} start={at(scene, 2, 0.7)}>{''}</Check>
    </>
  );
};

const makePause = (seconds: number, n: number, pairs: string, again: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Svg>
        <Drawer x={100} y={280} n={n} cell={100} />
      </Svg>
      <div style={{ position: 'absolute', left: n > 5 ? 790 : 700, top: 120, width: n > 5 ? 600 : 700, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 48, fontWeight: 600, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
        抽屉里有 {pairs} 双袜子，每双颜色都不一样。佐伊{again ? '还是' : ''}拿出 4 只袜子。有多少组 4 只袜子，至少包含一双同色的袜子？
      </div>
      <Countdown scene={scene} seconds={seconds} x={1660} y={500} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

const ORD = [[0, 1, 2, 3], [1, 0, 3, 2], [1, 2, 3, 0], [3, 0, 1, 2], [2, 3, 0, 1], [0, 1, 2, 3]];
const SLOT = (i: number) => 140 + i * 150;

const All: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const picks: [number, number][] = [[0, 0], [2, 1], [1, 0], [4, 1]];
  const lift = (j: number) => ease(f, at(scene, 2, 0.4 + j * 0.14), 14);
  const t0 = at(scene, 4, 0.1);
  const t1 = at(scene, 5, 0.9);
  const prog = c01((f - t0) / (t1 - t0)) * (ORD.length - 1);
  const idx = Math.min(ORD.length - 2, Math.floor(prog));
  const fr = ease(prog - idx, 0, 1) * 0 + c01((prog - idx - 0.15) / 0.7);
  const e = fr * fr * (3 - 2 * fr);
  const pos = (j: number): [number, number, number] => {
    const a = ORD[idx][j];
    const b = ORD[idx + 1][j];
    return [lerp(SLOT(a), SLOT(b), e), 710 - Math.sin(Math.PI * e) * 40 * (j % 2 ? 1 : -1), 0.75];
  };
  const over = (c: number, v: number): Over | undefined => {
    const j = picks.findIndex(([a, b]) => a === c && b === v);
    return j < 0 ? undefined : { to: pos(j), p: lift(j) };
  };
  const lab = [10, 9, 8, 7];
  const labOp = 1 - ease(f, at(scene, 4), 10);
  return (
    <>
      <Svg>
        <Drawer x={100} y={190} n={5} cell={110} over={over} />
      </Svg>
      {lab.map((n, j) => (
        <Text key={j} x={SLOT(j) - 60} y={575} w={120} size={64} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, at(scene, 2, 0.4 + j * 0.14), 10) * labOp }}>
          {n}
        </Text>
      ))}
      <Pill x={PANEL} y={150} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.45)), fontSize: 38 }}>先数全部，再减去不成对的</Pill>
      <Eq y={250} start={at(scene, 1, 0.2)} tex={[z('全部'), '-', z('不成对'), '=', z('有一双')]} />
      <Morph y={375} show={at(scene, 2, 0.4)} start={at(scene, 3, 0.1)} a={'10\\times 9\\times 8\\times 7'} b={'10\\times 9\\times 8\\times 7 = 5040'} />
      <Text x={PANEL} y={500} w={1000} size={42} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.2))}>同一组，每种顺序都被数了一次</Text>
      <Eq y={570} start={at(scene, 5, 0.5)} tex={['4\\times 3\\times 2\\times 1 = 24', z('种顺序')]} />
      <Eq y={690} start={at(scene, 6, 0.3)} size={64} color={C.green} tex={'5040 \\div 24 = 210'} />
    </>
  );
};

const NoPair: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const chosen = [0, 1, 2, 3];
  const l2a = at(scene, 1, 0.35);
  const l2b = at(scene, 1, 0.95);
  const leave = f < l2a ? -1 : f >= l2b ? 4 : Math.min(4, Math.floor(((f - l2a) / (l2b - l2a)) * 5));
  const over = (c: number): Over | undefined => (c === leave ? { op: 0.2 } : undefined);
  const s1 = at(scene, 0, 0.3);
  const slotsOp = ease(f, s1, 10) * (1 - ease(f, at(scene, 1), 8));
  const optOp = ease(f, at(scene, 2, 0.05), 12);
  const o0 = at(scene, 2, 0.1);
  const o1 = at(scene, 2, 0.85);
  const cnt = Math.min(15, Math.max(0, Math.floor(((f - o0) / (o1 - o0)) * 16)));
  const dotsOn = ease(f, l2a - 10, 10);
  const doneA = at(scene, 5, 0.8);
  return (
    <>
      <Svg>
        <Drawer x={100} y={190} n={5} cell={110} over={over} />
        {chosen.map((c, i) => (
          <Sock key={c} x={SLOT(i)} y={700} k={0.8} c={c} v={i % 2 ? 1 : 0} op={ease(f, s1 + i * 6, 10) * (1 - ease(f, at(scene, 1), 8))} />
        ))}
        <g opacity={optOp}>
          {chosen.map((c, i) => {
            const v = Math.floor(cnt / 2 ** (3 - i)) % 2;
            return (
              <g key={c}>
                <rect x={SLOT(i) - 35 - 36 + v * 72} y={700 - 50} width={72} height={100} rx={14} fill="none" stroke={C.ink} strokeWidth={5} />
                <Sock x={SLOT(i) - 35} y={700} k={0.6} c={c} v={0} />
                <Sock x={SLOT(i) + 35} y={700} k={0.6} c={c} v={1} />
              </g>
            );
          })}
        </g>
        {range(5).map((c) => (
          <Dot key={c} x={PANEL + 50 + c * 100} y={215} c={c} dim={c === leave ? 1 : 0} op={dotsOn} />
        ))}
      </Svg>
      <Pill x={PANEL} y={160} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.35)), opacity: ease(f, at(scene, 0, 0.35), 10) * (1 - ease(f, l2a - 14, 8)), fontSize: 42 }}>4 种不同颜色</Pill>
      <Text x={PANEL + 540} y={178} w={400} size={52} weight={900} color={C.violet} style={{ opacity: ease(f, l2b - 6, 10) }}>5 种</Text>
      <Eq y={310} start={at(scene, 2, 0.55)} tex={'2\\times 2\\times 2\\times 2 = 16'} />
      <Eq y={430} start={at(scene, 3, 0.5)} tex={'5\\times 16 = 80'} />
      <Morph y={550} show={at(scene, 4, 0.05)} start={at(scene, 4, 0.75)} a={'210 - 80 = \\,?'} b={'210 - 80 = 130'} />
      <Answer x={1700} y={420} value="130" start={doneA} chime={CHIME} />
      <Confetti x={1700} y={420} start={doneA} seed={11} />
      <Pill x={1580} y={560} color={C.green} style={{ ...fadeUp(f, doneA + 4), fontSize: 46 }}>选项 C</Pill>
    </>
  );
};

const Direct: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l2a = at(scene, 1, 0.25);
  const l2b = at(scene, 1, 0.9);
  const seq = [1, 2, 3, 4, 0];
  const hi = f < l2a ? -1 : f >= l2b ? 0 : seq[Math.min(4, Math.floor(((f - l2a) / (l2b - l2a)) * 5))];
  const combos: [number, number][] = [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
  const all: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
  const dotsOp = ease(f, l2a - 8, 10);
  return (
    <>
      <Svg>
        {range(5).map((c) => (
          <Dot key={c} x={140 + c * 105} y={270} c={c} ring={c === hi} op={dotsOp} />
        ))}
        {combos.map(([a, b], i) => (
          <DotPair key={i} x={100 + (i % 3) * 150} y={350 + Math.floor(i / 3) * 82} a={a} b={b} op={ease(f, at(scene, 2, 0.12 + i * 0.07), 8)} />
        ))}
        {all.map(([a, b], i) => (
          <DotPair key={i} x={1000 + (i % 5) * 160} y={270 + Math.floor(i / 5) * 84} a={a} b={b} w={140} op={ease(f, at(scene, 4, 0.2 + i * 0.06), 8)} />
        ))}
      </Svg>
      <Pill x={100} y={150} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.45)), fontSize: 40 }}>恰好一双</Pill>
      <Pill x={1000} y={150} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.7)), fontSize: 40 }}>两双</Pill>
      <Text x={680} y={247} w={300} size={46} weight={900} color={C.violet} style={{ opacity: ease(f, l2b - 8, 10) }}>5 种</Text>
      <Text x={580} y={375} w={380} size={46} weight={900} color={C.violet} style={{ opacity: ease(f, at(scene, 2, 0.6), 10) }}>6 种</Text>
      <Text x={100} y={530} w={880} size={42} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.6))}>每种颜色挑一只：</Text>
      <Eq x={560} y={512} start={at(scene, 2, 0.8)} size={52} tex={'2\\times 2 = 4'} />
      <Eq x={100} y={610} start={at(scene, 3, 0.35)} tex={'5\\times 6\\times 4 = 120'} />
      <Text x={1000} y={455} w={700} size={46} weight={900} color={C.violet} style={{ opacity: ease(f, at(scene, 4, 0.85), 10) }}>10 种</Text>
      <Eq x={560} y={730} start={at(scene, 5, 0.1)} size={64} tex={'120 + 10 = 130'} />
      <Check x={1160} y={742} start={at(scene, 5, 0.75)}>答案一样！</Check>
      <Card x={1000} y={560} w={860} start={at(scene, 6, 0.55)} color={C.primary}>很好的验算</Card>
      <Card x={1000} y={650} w={860} start={at(scene, 6, 0.8)} color={C.violet}>解法一不用分情况</Card>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const bads = [at(scene, 1), at(scene, 7), Infinity, at(scene, 5), at(scene, 2)];
  const bad = (i: number) => (f >= bads[i] ? 1 : 0);
  const row = (y: number, socks: [number, number][], glowC: number, start: number) => (
    <g opacity={ease(f, start, 12)}>
      <SockRow x={1360} y={y} k={0.55} gap={72} socks={socks} glow={(i) => (socks[i][0] === glowC ? 0.9 : 0)} />
    </g>
  );
  const four: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
  return (
    <>
      <ChoiceChips x={100} y={140} start={() => 4} bad={bad} />
      <Card y={250} start={at(scene, 1, 0.3)}>A：80 = 不成对的组数</Card>
      <Card y={340} start={at(scene, 2, 0.3)}>E：210 = 全部的组数</Card>
      <Card y={430} start={at(scene, 3, 0.3)}>D：先选一双，5 种</Card>
      <div style={{ position: 'absolute', left: 100, top: 515, whiteSpace: 'nowrap', color: C.muted, ...fadeUp(f, at(scene, 4, 0.1)) }}><Z p={[z('另外 8 只里任选 2 只：'), '8\\times 7\\div 2 = 28']} size={50} color={C.muted} /></div>
      <Eq x={100} y={605} start={at(scene, 4, 0.7)} tex={'5\\times 28 = 140'} />
      <Card y={690} start={at(scene, 7, 0.3)}>B：125 不是正确的数法</Card>
      <Svg>
        {row(350, four, 0, at(scene, 5, 0.15))}
        {row(450, four, 1, at(scene, 5, 0.5))}
      </Svg>
      <Text x={1000} y={270} w={860} size={40} weight={800} color={C.muted} style={fadeUp(f, at(scene, 5, 0.05))}>同一组两双的</Text>
      <Text x={1000} y={322} w={340} size={38} weight={800} color={COL[0]} style={fadeUp(f, at(scene, 5, 0.15))}>先选红色这双</Text>
      <Text x={1000} y={422} w={340} size={38} weight={800} color={COL[1]} style={fadeUp(f, at(scene, 5, 0.5))}>先选蓝色这双</Text>
      <Pill x={1000} y={520} color={C.red} style={{ ...fadeUp(f, at(scene, 5, 0.8)), fontSize: 40 }}>数了两次！</Pill>
      <Eq x={1000} y={610} start={at(scene, 6, 0.3)} color={C.green} tex={'140 - 10 = 130'} />
      <Pill x={1000} y={700} color={C.primary} style={{ ...fadeUp(f, at(scene, 8, 0.45)), whiteSpace: 'normal', width: 760, borderRadius: 36, textAlign: 'center', fontSize: 38 }}>至少一个？数相反的情况，再减掉</Pill>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const yel = ease(f, at(scene, 0, 0.45), 14);
  const over = (c: number): Over | undefined => (c === 5 ? { op: yel } : undefined);
  return (
    <>
      <Pill x={900} y={140} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>新抽屉：6 双袜子</Pill>
      <div style={{ position: 'absolute', left: 900, top: 240, width: 940, minHeight: 360, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>抽屉里有 6 双袜子，每双袜子的颜色都不一样。</span>
        <span style={s(1)}>
          佐伊还是拿出 4 只袜子。有多少组 4 只袜子，<Mark on={at(scene, 1, 0.5)}>至少包含一双同色的袜子</Mark>？
        </span>
      </div>
      <Svg>
        <Drawer x={100} y={300} n={6} cell={115} over={over} op={ease(f, 2, 10)} />
      </Svg>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l4a = at(scene, 3, 0.15);
  const dim = ease(f, l4a, 10);
  const over = (c: number): Over | undefined => (c >= 4 ? { op: 1 - 0.8 * dim } : undefined);
  const done = at(scene, 5, 0.82);
  return (
    <>
      <Svg>
        <Drawer x={100} y={230} n={6} cell={90} over={over} />
        {range(6).map((c) => (
          <Dot key={c} x={PANEL + 40 + c * 90} y={345} r={30} c={c} dim={c >= 4 ? dim : 0} op={ease(f, at(scene, 2, 0.3), 10)} />
        ))}
      </Svg>
      <Morph y={110} size={52} show={at(scene, 0, 0.35)} start={at(scene, 1, 0.1)} a={'\\dfrac{12\\times 11\\times 10\\times 9}{24}'} b={'\\dfrac{12\\times 11\\times 10\\times 9}{24} = 495'} />
      <Text x={PANEL} y={240} w={1000} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.1))}>不成对：6 种颜色里选 4 种</Text>
      <div style={{ position: 'absolute', left: PANEL + 590, top: 312, whiteSpace: 'nowrap', opacity: ease(f, at(scene, 3, 0.55), 10) }}><Tex tex={'6\\times 5\\div 2 = 15'} size={50} color={C.violet} /></div>
      <Eq y={385} start={at(scene, 3, 0.8)} size={52} tex={'2\\times 2\\times 2\\times 2 = 16'} />
      <Eq y={460} start={at(scene, 4, 0.4)} size={52} tex={'15\\times 16 = 240'} />
      <Morph y={535} show={at(scene, 5, 0.05)} start={at(scene, 5, 0.72)} size={56} color={C.green} a={'495 - 240 = \\,?'} b={'495 - 240 = 255'} />
      <Eq y={615} start={at(scene, 6, 0.35)} size={48} tex={[z('恰好一双：'), '6\\times 10\\times 4 = 240']} />
      <Eq y={690} start={at(scene, 6, 0.75)} size={50} tex={[z('两双：'), '6\\times 5\\div 2 = 15']} />
      <Eq x={1480} y={620} start={at(scene, 6, 0.55)} size={48} color={C.muted} tex={'10 = 5\\times 4\\div 2'} />
      <Check x={PANEL} y={765} start={at(scene, 7, 0.3)}>240 + 15 = 255，又是 255！</Check>
      <Answer x={1700} y={500} value="255" start={done} chime={CHIME} />
      <Confetti x={1700} y={500} start={done} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const labelY = 596;
  return (
    <>
      <Fade op={out}>
        <Text x={100} y={150} w={900} size={52} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>核心思路</Text>
        <Text x={100} y={235} w={1700} size={58} weight={900} style={fadeUp(f, at(scene, 1, 0.2))}>至少一个？就数相反的情况。</Text>
        <Svg>
          <Drawer x={250} y={330} n={5} cell={66} op={ease(f, at(scene, 2, 0.05), 12)} />
          <SockRow x={780} y={440} k={0.8} gap={100} socks={[[0, 0], [1, 1], [2, 0], [3, 1]]} op={ease(f, at(scene, 2, 0.5), 12)} />
          <SockRow x={1250} y={440} k={0.8} gap={100} socks={[[0, 0], [0, 1], [1, 1], [2, 0]]} op={ease(f, at(scene, 2, 0.8), 12)} />
        </Svg>
        <Text x={684} y={385} w={80} size={90} weight={900} align="center" style={{ opacity: ease(f, at(scene, 2, 0.45), 10) }}>−</Text>
        <Text x={1170} y={385} w={80} size={90} weight={900} align="center" style={{ opacity: ease(f, at(scene, 2, 0.75), 10) }}>=</Text>
        <Text x={439} y={labelY} w={440} size={44} weight={900} align="center" color={C.muted} style={fadeUp(f, at(scene, 2, 0.1))}>全部</Text>
        <Text x={920} y={labelY} w={440} size={44} weight={900} align="center" color={C.red} style={fadeUp(f, at(scene, 2, 0.55))}>不成对</Text>
        <Text x={1390} y={labelY} w={440} size={44} weight={900} align="center" color={C.green} style={fadeUp(f, at(scene, 2, 0.85))}>有一双</Text>
      </Fade>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 5, '5', false),
  all: All,
  nopair: NoPair,
  direct: Direct,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, 6, '6', true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;


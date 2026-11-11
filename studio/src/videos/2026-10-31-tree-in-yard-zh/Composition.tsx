import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-31-tree-in-yard-zh';
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

const PANEL = 990;
export const BLUE = '#2f6fd6';
export const AMBER = '#d98600';
const GRASS = '#e6f6ec';
export const E0 = 10; // E at its true spot (the bank figure draws it there too)

// ---------- the yard figure ----------

export type G = { X: (x: number) => number; Y: (y: number) => number; u: number; L: number; W: number; ox: number; oy: number; ex: number };

type YP = {
  L: number; W: number; u: number; ox: number; oy: number; ex: number;
  draw?: number; corners?: number; dim?: number; bc?: number; dot?: number; eLab?: number;
  tree?: number; lift?: number; ea?: number; ec?: number; ecDash?: boolean; tick?: number; tri?: number; rt?: number;
  hiEB?: number; hiBC?: number;
  children?: (g: G) => React.ReactNode;
};

const LBL: React.CSSProperties = { paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 9, strokeLinejoin: 'round' };

export const Lab: React.FC<{ x: number; y: number; t: string; color?: string; op?: number; anchor?: 'start' | 'middle' | 'end'; size?: number }> = ({ x, y, t, color = C.ink, op = 1, anchor = 'middle', size = 48 }) =>
  op <= 0 ? null : (
    <text x={x} y={y} fontFamily={ZH_FONT} fontWeight={800} fontSize={size} fill={color} textAnchor={anchor} opacity={op} style={LBL}>
      {t}
    </text>
  );

const Ticks: React.FC<{ a: [number, number]; b: [number, number]; op: number }> = ({ a, b, op }) => {
  if (op <= 0) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const dx = (b[0] - a[0]) / len;
  const dy = (b[1] - a[1]) / len;
  const nx = -dy;
  const ny = dx;
  return (
    <g opacity={op} stroke={C.ink} strokeWidth={6} strokeLinecap="round">
      {[-8, 8].map((s) => (
        <line key={s} x1={mx + dx * s - nx * 17} y1={my + dy * s - ny * 17} x2={mx + dx * s + nx * 17} y2={my + dy * s + ny * 17} />
      ))}
    </g>
  );
};

export const Yard: React.FC<YP> = ({ L, W, u, ox, oy, ex, draw = 1, corners = 1, dim = 1, bc = 1, dot = 1, eLab = 1, tree = 0, lift = 0, ea = 0, ec = 0, ecDash = true, tick = 0, tri = 0, rt = 0, hiEB = 0, hiBC = 0, children }) => {
  const X = (x: number) => ox + x * u;
  const Y = (y: number) => oy - y * u;
  const g: G = { X, Y, u, L, W, ox, oy, ex };
  const rect: [number, number][] = [[X(0), Y(0)], [X(L), Y(0)], [X(L), Y(W)], [X(0), Y(W)]];
  const dy = oy + 100;
  return (
    <Stage>
      <Poly pts={rect} progress={draw} color={C.ink} width={7} fill={GRASS} fillOpacity={1} />
      {/* triangle EBC */}
      <path d={`M ${X(ex)} ${Y(0)} L ${X(L)} ${Y(0)} L ${X(L)} ${Y(W)} Z`} fill={C.blue} opacity={0.26 * tri} />
      {hiEB > 0 && <line x1={X(ex)} y1={Y(0)} x2={X(L)} y2={Y(0)} stroke={AMBER} strokeWidth={14} strokeLinecap="round" opacity={hiEB} />}
      {hiBC > 0 && <line x1={X(L)} y1={Y(0)} x2={X(L)} y2={Y(W)} stroke={AMBER} strokeWidth={14} strokeLinecap="round" opacity={hiBC} />}
      {ea > 0 && <line x1={X(0)} y1={Y(0)} x2={X(ex)} y2={Y(0)} stroke={C.primary} strokeWidth={13} strokeLinecap="round" opacity={ea} />}
      {ec > 0 && <line x1={X(ex)} y1={Y(0)} x2={X(L)} y2={Y(W)} stroke={C.violet} strokeWidth={ecDash ? 9 : 11} strokeLinecap="round" strokeDasharray={ecDash ? '16 13' : undefined} opacity={ec} />}
      <Ticks a={[X(0), Y(0)]} b={[X(ex), Y(0)]} op={tick} />
      <Ticks a={[X(ex), Y(0)]} b={[X(L), Y(W)]} op={tick} />
      {rt > 0 && <path d={`M ${X(L) - 30} ${Y(0)} L ${X(L) - 30} ${Y(0) - 30} L ${X(L)} ${Y(0) - 30}`} stroke={C.ink} strokeWidth={5} fill="none" opacity={rt} />}
      {/* dimension line under AB */}
      <g opacity={dim} stroke="#666" strokeWidth={4}>
        <line x1={X(0)} y1={dy} x2={X(L)} y2={dy} />
        <line x1={X(0)} y1={dy - 14} x2={X(0)} y2={dy + 14} />
        <line x1={X(L)} y1={dy - 14} x2={X(L)} y2={dy + 14} />
      </g>
      <Lab x={(X(0) + X(L)) / 2} y={dy + 58} t={String(L)} op={dim} />
      <Lab x={X(L) + 22} y={Y(W / 2) + 16} t={String(W)} op={bc} anchor="start" />
      {/* corners */}
      <Lab x={X(0) - 36} y={oy + 50} t="A" op={corners} />
      <Lab x={X(L) + 36} y={oy + 50} t="B" op={corners} />
      <Lab x={X(L) + 38} y={Y(W) - 6} t="C" op={corners} />
      <Lab x={X(0) - 38} y={Y(W) - 6} t="D" op={corners} />
      {/* E: a dot, or the tree */}
      {dot > 0 && <circle cx={X(ex)} cy={Y(0)} r={9} fill={C.ink} opacity={dot} />}
      {tree > 0 && (
        <g opacity={tree} transform={`translate(${X(ex)} ${Y(0) - lift})`}>
          <rect x={-8} y={-38} width={16} height={38} fill="#8a5a2b" rx={3} />
          <circle cx={0} cy={-68} r={42} fill={C.primary} stroke="#08855a" strokeWidth={5} />
        </g>
      )}
      <Lab x={X(ex)} y={oy + 50} t="E" op={eLab} />
      {children?.(g)}
    </Stage>
  );
};

// ---------- table + small helpers ----------

const COLS = [120, 250, 300, 220];

const THead: React.FC<{ y: number; start: number }> = ({ y, start }) => {
  const f = useCurrentFrame();
  const heads = ['EA', 'EB', 'EB^2+64', 'EA^2'];
  return (
    <div style={{ position: 'absolute', left: PANEL + 16, top: y, display: 'flex', ...fadeUp(f, start) }}>
      {heads.map((h, i) => (
        <div key={h} style={{ width: COLS[i], color: C.muted, whiteSpace: 'nowrap' }}>
          <Tex tex={h} size={48} />
        </div>
      ))}
    </div>
  );
};

const TRow: React.FC<{ y: number; vals: string[]; starts: number[]; verdict?: 'bad' | 'good'; vStart?: number }> = ({ y, vals, starts, verdict, vStart = 0 }) => {
  const f = useCurrentFrame();
  const v = verdict ? ease(f, vStart, 10) : 0;
  const col = verdict === 'good' ? C.green : verdict === 'bad' ? C.red : C.ink;
  return (
    <>
      {verdict && <div style={{ position: 'absolute', left: PANEL - 6, top: y - 6, width: 900, height: 82, borderRadius: 20, background: verdict === 'good' ? 'rgba(33,196,93,0.18)' : 'rgba(239,67,67,0.12)', opacity: v }} />}
      <div style={{ position: 'absolute', left: PANEL + 16, top: y, display: 'flex', whiteSpace: 'nowrap' }}>
        {vals.map((t, i) => (
          <div key={i} style={{ width: COLS[i], fontSize: 56, fontWeight: 800, color: v > 0.5 ? col : C.ink, ...fadeUp(f, starts[i], 8) }}>
            {t}
          </div>
        ))}
      </div>
    </>
  );
};

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string }> = ({ x = PANEL, y, start, tex, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Two layers of the same row: the x² terms go violet, then fade to grey (they cancel). */
const Cancel: React.FC<{ y: number; start: number; swap: number; a: string; b: string }> = ({ y, start, swap, a, b }) => {
  const f = useCurrentFrame();
  const p = ease(f, swap, 16);
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <div style={{ opacity: 1 - p }}>
        <Tex tex={a} size={56} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: p }}>
        <Tex tex={b} size={56} />
      </div>
    </div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string }> = ({ x = PANEL, y, w = 890, start, children, color = C.primary }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: 44, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

export const VALS = ['6', '8', '10', '12', '14'];

type ChipState = ('' | 'bad' | 'good')[];
const Chips: React.FC<{ x: number; y: number; start: (i: number) => number; states?: ChipState; fs?: number[] }> = ({ x, y, start, states = [], fs = [] }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 18 }}>
      {VALS.map((v, i) => {
        const st = states[i] ?? '';
        const p = fs[i] === undefined ? 0 : ease(f, fs[i], 10);
        const bg = st === 'good' ? `rgba(33,196,93,${0.2 + 0.8 * p})` : st === 'bad' ? `rgba(239,67,67,${0.14 * p})` : C.card;
        const fg = st === 'good' && p > 0.5 ? '#fff' : st === 'bad' && p > 0.5 ? C.red : C.ink;
        return (
          <div key={v} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <div style={{ background: p > 0 ? bg : 'transparent', borderRadius: 18, padding: '12px 24px', fontSize: 56, fontWeight: 800, color: fg, opacity: 1 }}>
              <span style={{ color: p > 0.5 ? fg : C.muted, fontSize: 34, marginRight: 10 }}>{'ABCDE'[i]}</span>
              {v}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Value of the latest [frame, value] pair at or before f (dot-to-dot jumps, never a tween). */
const steps = (f: number, list: [number, number][]) => list.reduce((acc, [fr, v]) => (f >= fr ? v : acc), list[0][1]);

// Geometry of the two yards.
const Y1 = { L: 16, W: 8, u: 46, ox: 110, oy: 560 };
const Y2 = { L: 18, W: 12, u: 38, ox: 110, oy: 640 };

/** Labels inside the yard: x above EA (middle), EB above the bottom edge, EC beside the slant. */
export const eaLab = (g: G, t: string, op: number, color = C.primary) => <Lab x={g.X(g.ex / 4)} y={g.oy - 18} t={t} op={op} color={color} />;
export const ebLab = (g: G, t: string, op: number, color = BLUE, dx = 0) => <Lab x={g.X((g.ex + g.L) / 2) + dx} y={g.oy - 18} t={t} op={op} color={color} />;
export const ecLab = (g: G, t: string, op: number, color = C.violet) => <Lab x={g.X((g.ex + g.L) / 2) - 46} y={g.Y(g.W / 2) + 6} t={t} op={op} color={color} anchor="end" />;

// ---------- scenes ----------

const HOPS = [3, 6, 13, 5, 12, 8, 14, 9];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end = at(scene, 2);
  const hf = Math.floor((end - 14) / HOPS.length);
  const k = Math.max(0, Math.min(HOPS.length - 1, Math.floor((f - 14) / hf)));
  const t = f < 14 ? 0 : ((f - 14) % hf) / hf;
  const lift = f < 14 || f >= end ? 0 : Math.sin(Math.min(1, t * 2.4) * Math.PI) * 36;
  const strings = ease(f, 14, 10);
  const title = fadeTo(f, at(scene, 2), 0, 10);
  return (
    <>
      <Yard {...Y1} ex={HOPS[k]} draw={ease(f, 0, 24)} dot={0} eLab={0} tree={ease(f, 8, 10)} lift={lift} ea={strings} ec={strings} ecDash={false} tri={ease(f, at(scene, 1, 0.35), 14)} rt={ease(f, at(scene, 1, 0.55), 10)} />
      <div style={{ opacity: title }}>
        <Text x={PANEL} y={250} w={890} size={78} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>这棵树在哪里？</Text>
        <Text x={PANEL} y={400} w={890} size={56} weight={800} style={fadeUp(f, at(scene, 1, 0.45))}>院子里藏着一个直角三角形。</Text>
      </div>
      <div style={{ position: 'absolute', left: PANEL + 60, top: 330, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const glow = ease(f, at(scene, 3, 0.15), 12);
  return (
    <>
      <Yard {...Y1} ex={E0} draw={ease(f, at(scene, 1), 24)} corners={ease(f, at(scene, 1, 0.3), 10)} dim={ease(f, at(scene, 1, 0.55), 10)} bc={ease(f, at(scene, 1, 0.75), 10)} dot={ease(f, at(scene, 2, 0.4), 8)} eLab={ease(f, at(scene, 2, 0.4), 8)} ea={glow} ec={glow} tick={glow}>
        {(g) => <Lab x={g.X(g.ex / 4)} y={g.oy - 20} t="? 米" color={AMBER} op={ease(f, at(scene, 4, 0.5), 10)} />}
      </Yard>
      <div style={{ position: 'absolute', left: PANEL, top: 140, width: 890, minHeight: 420, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 46, fontWeight: 600, lineHeight: 1.42, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>长方形院子 ABCD，AB = 16 米，BC = 8 米。</span>
        <span style={s(2)}>边 AB 上的点 E 处有一棵树，</span>
        <span style={s(3)}>这棵树到 A 的距离和到 C 的距离相等。</span>
        <span style={s(4)}>
          <Mark on={at(scene, 4, 0.3)}>这棵树离 A 有多少米？</Mark>
        </span>
      </div>
      <Chips x={PANEL} y={640} start={(i) => at(scene, 5, 0.15 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Yard {...Y1} ex={E0} ea={1} ec={1} tick={1} tri={ease(f, at(scene, 1, 0.45), 14)} rt={ease(f, at(scene, 1, 0.7), 10)}>
        {(g) => <Lab x={g.X(g.ex / 4)} y={g.oy - 20} t="? 米" color={AMBER} op={ease(f, at(scene, 2, 0.3), 10)} />}
      </Yard>
      <Eq y={160} start={at(scene, 0, 0.55)} size={84} tex={'EA = EC'} />
      <Pill x={PANEL} y={330} color={C.blue} style={{ ...fadeUp(f, at(scene, 1, 0.4)), fontSize: 46 }}>直角三角形 EBC</Pill>
      <Eq y={480} start={at(scene, 2, 0.3)} size={110} tex={'\\textcolor{#d98600}{EA = ?}'} />
    </>
  );
};

const makePause = (seconds: number, g: typeof Y1, ex: number, text: React.ReactNode, chips: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Yard {...g} ex={ex} ea={1} ec={1} tick={1} />
      <div style={{ position: 'absolute', left: PANEL, top: 110, width: 890, background: C.card, borderRadius: 24, padding: '14px 32px', fontSize: 46, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1430} y={470} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
      {chips && <Chips x={PANEL} y={730} start={() => 6} />}
    </>
  );
};

const DIM = 0.22; // EA = EC ticks are dimmed while testing a wrong spot

const Test: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ex = steps(f, [[0, E0], [at(scene, 3, 0.05), 6]]);
  const tri = ease(f, at(scene, 1, 0.1), 14);
  const num = f >= at(scene, 3, 0.3);
  const tick = ex === 6 ? DIM : 1;
  return (
    <>
      <Yard {...Y1} ex={ex} ea={1} ec={1} tick={tick} tri={tri} rt={tri}>
        {(g) => (
          <>
            {ebLab(g, num ? '10' : 'EB', tri)}
            {ecLab(g, 'EC', tri)}
          </>
        )}
      </Yard>
      <Eq y={110} size={52} start={at(scene, 1, 0.55)} tex={'EB^2 + 8^2 = EC^2'} />
      <Eq y={185} size={52} start={at(scene, 2, 0.1)} tex={'EC = EA'} />
      <Eq y={260} size={52} start={at(scene, 2, 0.6)} tex={'EB^2 + 64 = EA^2'} />
      <Eq y={335} size={52} start={at(scene, 3, 0.2)} tex={'EB = 16 - EA'} />
      <THead y={430} start={at(scene, 3, 0.0)} />
      <TRow y={510} vals={['6', '10', '164', '36']} starts={[at(scene, 3, 0.15), at(scene, 3, 0.35), at(scene, 3, 0.85), at(scene, 4, 0.45)]} verdict="bad" vStart={at(scene, 4, 0.75)} />
    </>
  );
};

const Test2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ex = steps(f, [[0, 6], [at(scene, 0, 0.05), 8], [at(scene, 2, 0.02), 10]]);
  const num = String(16 - ex);
  const l3 = ease(f, at(scene, 4, 0.15), 10);
  const tick = ex === 10 ? 1 : DIM;
  return (
    <>
      <Yard {...Y1} ex={ex} ea={1} ec={1} tick={tick} tri={1} rt={1}>
        {(g) => (
          <>
            {ebLab(g, num, 1)}
            {ecLab(g, '10', l3, C.green)}
            {eaLab(g, '10', ease(f, at(scene, 4, 0.55), 10), C.green)}
          </>
        )}
      </Yard>
      <Eq y={110} size={52} start={0} tex={'EB^2 + 8^2 = EC^2'} />
      <Eq y={185} size={52} start={0} tex={'EC = EA'} />
      <Eq y={260} size={52} start={0} tex={'EB^2 + 64 = EA^2'} />
      <Eq y={335} size={52} start={0} tex={'EB = 16 - EA'} />
      <THead y={430} start={0} />
      <TRow y={510} vals={['6', '10', '164', '36']} starts={[0, 0, 0, 0]} verdict="bad" vStart={0} />
      <TRow y={595} vals={['8', '8', '128', '64']} starts={[at(scene, 0, 0.05), at(scene, 0, 0.3), at(scene, 0, 0.85), at(scene, 1, 0.5)]} verdict="bad" vStart={at(scene, 1, 0.8)} />
      <TRow y={680} vals={['10', '6', '100', '100']} starts={[at(scene, 2, 0.03), at(scene, 2, 0.2), at(scene, 2, 0.75), at(scene, 3, 0.55)]} verdict="good" vStart={at(scene, 3, 0.8)} />
      <Pill x={PANEL} y={775} color={C.blue} style={{ fontSize: 42, ...fadeUp(f, at(scene, 4, 0.1)) }}>6-8-10 三角形</Pill>
      <Pill x={1400} y={775} color={C.green} style={{ fontSize: 46, ...fadeUp(f, at(scene, 5, 0.86)) }}>选 C：10 米</Pill>
      <Answer x={1700} y={260} value="10" start={at(scene, 5, 0.86)} chime={CHIME} />
    </>
  );
};

const Algebra: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Yard {...Y1} ex={10} ea={1} ec={1} tick={1} tri={1} rt={1}>
        {(g) => (
          <>
            {eaLab(g, 'x', ease(f, at(scene, 0, 0.6), 10), AMBER)}
            {ecLab(g, 'x', ease(f, at(scene, 1, 0.25), 10), AMBER)}
            {ebLab(g, '16 − x', ease(f, at(scene, 1, 0.65), 10))}
          </>
        )}
      </Yard>
      <Eq y={130} start={at(scene, 2, 0.35)} tex={'(16 - x)^2 + 8^2 = x^2'} />
      <Eq y={225} start={at(scene, 3, 0.5)} tex={'(16 - x)(16 - x)'} />
      <Eq x={PANEL + 70} y={302} start={at(scene, 3, 0.5)} tex={'= 256 - 16x - 16x + x^2'} />
      <Eq y={390} size={52} start={at(scene, 4, 0.5)} tex={'(16 - x)^2 = 256 - 32x + x^2'} />
      <Cancel
        y={483}
        start={at(scene, 5, 0.15)}
        swap={at(scene, 5, 0.6)}
        a={'256 - 32x + \\textcolor{#7b61ff}{x^2} + 64 = \\textcolor{#7b61ff}{x^2}'}
        b={'256 - 32x + \\textcolor{#b4bbc9}{x^2} + 64 = \\textcolor{#b4bbc9}{x^2}'}
      />
      <Eq y={575} start={at(scene, 6, 0.2)} tex={'320 = 32x'} />
      <Eq y={655} start={at(scene, 6, 0.7)} size={72} tex={'\\textcolor{#21c45d}{x = 10}'} />
      <Card y={765} start={at(scene, 7, 0.55)}>没有选项可以试？就设为 x。</Card>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ex = steps(f, [[0, 10], [at(scene, 3, 0.3), 12], [at(scene, 3, 0.65), 14], [at(scene, 5, 0.0), 10]]);
  const hiEB = ease(f, at(scene, 1, 0.4), 10) * fadeTo(f, at(scene, 2), 0, 10);
  const hiBC = ease(f, at(scene, 2, 0.35), 10) * fadeTo(f, at(scene, 3), 0, 10);
  const states: ChipState = ['bad', 'bad', 'good', 'bad', 'bad'];
  const fs = [at(scene, 1, 0.5), at(scene, 2, 0.55), at(scene, 5, 0.2), at(scene, 3, 0.55), at(scene, 3, 0.65)];
  const numOp = ease(f, at(scene, 3, 0.35), 10);
  const tick = ex === 10 ? 1 : DIM;
  return (
    <>
      <Yard {...Y1} ex={ex} ea={1} ec={1} tick={tick} tri={1} rt={1} hiEB={hiEB} hiBC={hiBC}>
        {(g) => (
          <>
            {ebLab(g, String(16 - g.ex), Math.max(hiEB, numOp))}
          </>
        )}
      </Yard>
      <Chips x={PANEL} y={130} start={() => at(scene, 0, 0.5)} states={states} fs={fs} />
      <THead y={302} start={at(scene, 3, 0.2)} />
      <TRow y={375} vals={['12', '4', '80', '144']} starts={[at(scene, 3, 0.3), at(scene, 3, 0.4), at(scene, 4, 0.08), at(scene, 4, 0.3)]} verdict="bad" vStart={at(scene, 4, 0.42)} />
      <TRow y={465} vals={['14', '2', '68', '196']} starts={[at(scene, 3, 0.65), at(scene, 3, 0.75), at(scene, 4, 0.5), at(scene, 4, 0.7)]} verdict="bad" vStart={at(scene, 4, 0.78)} />
      <Card y={610} start={at(scene, 5, 0.35)}>距离相等？用直角三角形，把其中一段换一种方式写出来。</Card>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Yard {...Y2} ex={13} draw={ease(f, at(scene, 0), 24)} corners={ease(f, at(scene, 0, 0.4), 10)} dim={ease(f, at(scene, 0, 0.6), 10)} bc={ease(f, at(scene, 0, 0.8), 10)} dot={ease(f, at(scene, 1), 8)} eLab={ease(f, at(scene, 1), 8)} ea={ease(f, at(scene, 1, 0.3), 10)} ec={ease(f, at(scene, 1, 0.3), 10)} tick={ease(f, at(scene, 1, 0.3), 10)}>
        {(g) => <Lab x={g.X(g.ex / 4)} y={g.oy - 20} t="? 米" color={AMBER} op={ease(f, at(scene, 1, 0.8), 10)} />}
      </Yard>
      <Pill x={PANEL} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 42 }}>更大的院子</Pill>
      <div style={{ position: 'absolute', left: PANEL, top: 240, width: 890, minHeight: 380, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 46, fontWeight: 600, lineHeight: 1.42, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>AB = 18 米，BC = 12 米。</span>
        <span style={s(1)}>
          边 AB 上的点 E 处有一棵树，到 A 和到 C 的距离相等。<Mark on={at(scene, 1, 0.7)}>这棵树离 A 有多少米？</Mark>
        </span>
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const e13 = f >= at(scene, 4, 0.8);
  const swap = ease(f, at(scene, 4, 0.8), 8);
  return (
    <>
      <Yard {...Y2} ex={13} ea={1} ec={1} tick={1} tri={ease(f, at(scene, 0, 0.6), 12)} rt={ease(f, at(scene, 0, 0.6), 12)}>
        {(g) => {
          const l0 = ease(f, at(scene, 0, 0.3), 10);
          const lx = ease(f, at(scene, 0, 0.5), 10);
          const green = (n: string, x: string) => (e13 ? n : x);
          return (
            <>
              {eaLab(g, green('13', 'x'), l0, e13 ? C.green : AMBER)}
              {ebLab(g, e13 ? '5' : '18 − x', l0, e13 ? C.green : BLUE, e13 ? 0 : -24)}
              {ecLab(g, green('13', 'x'), lx, e13 ? C.green : AMBER)}
            </>
          );
        }}
      </Yard>
      <Eq y={130} start={at(scene, 0, 0.75)} tex={'(18 - x)^2 + 12^2 = x^2'} />
      <Eq y={225} start={at(scene, 1, 0.5)} tex={'(18 - x)(18 - x)'} />
      <Eq x={PANEL + 70} y={302} start={at(scene, 1, 0.5)} tex={'= 324 - 18x - 18x + x^2'} />
      <Eq y={390} size={52} start={at(scene, 2, 0.55)} tex={'(18 - x)^2 = 324 - 36x + x^2'} />
      <Cancel
        y={483}
        start={at(scene, 3, 0.1)}
        swap={at(scene, 3, 0.55)}
        a={'324 - 36x + \\textcolor{#7b61ff}{x^2} + 144 = \\textcolor{#7b61ff}{x^2}'}
        b={'324 - 36x + \\textcolor{#b4bbc9}{x^2} + 144 = \\textcolor{#b4bbc9}{x^2}'}
      />
      <Eq y={575} start={at(scene, 4, 0.2)} tex={'468 = 36x'} />
      <Eq y={655} start={at(scene, 4, 0.82)} size={72} tex={'\\textcolor{#21c45d}{x = 13}'} />
      <Answer x={1740} y={705} value="13" start={at(scene, 4, 0.86)} chime={CHIME} />
      <Check x={PANEL} y={755} start={at(scene, 5, 0.2)}>
        <Tex tex={'5^2 + 12^2 = 13^2'} size={52} />
      </Check>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  return (
    <>
      <div style={{ opacity: out }}>
        <Yard {...Y1} ex={10} draw={1} ea={1} ec={1} tick={1} tri={ease(f, at(scene, 1, 0.2), 14)} rt={ease(f, at(scene, 1, 0.3), 10)} />
        <Text x={PANEL} y={130} w={890} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>今天的大思路</Text>
        <Card y={240} start={at(scene, 1, 0.1)} color={C.violet}>1. 设出未知的距离：x</Card>
        <Card y={370} start={at(scene, 1, 0.55)} color={C.blue}>2. 用勾股定理，把同一段距离换一种方式写出来</Card>
        <Card y={560} start={at(scene, 2, 0.2)} color={C.green}>3. 让两个式子相等，解方程</Card>
      </div>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, Y1, E0, <Z size={46} p={['EA = EC', z('。树离'), 'A', z('有多远？')]} />, true),
  test: Test,
  test2: Test2,
  algebra: Algebra,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, Y2, 13, <Z size={46} p={['AB = 18', z('，'), 'BC = 12', z('。离'), 'A', z('有多远？')]} />, false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the yard with the tree and its two strings, tree at the trap spot, no answer.
// Yard is laid out for the 1920×1080 video frame, so it is drawn there and scaled down to the 1280×720 thumbnail.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 练习" lines={[<span style={{ fontFamily: ZH_FONT }}>你觉得是</span>, <span style={{ color: C.red }}>6<span style={{ fontFamily: ZH_FONT }}> 米？</span></span>]}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.6667)', transformOrigin: '0 0' }}>
      <Yard L={16} W={8} u={52} ox={964} oy={718} ex={6} dot={0} eLab={0} tree={1} ea={1} ec={1} ecDash={false} />
    </div>
  </ThumbFrame>
);

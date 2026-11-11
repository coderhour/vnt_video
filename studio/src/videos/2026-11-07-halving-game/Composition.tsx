import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-07-halving-game';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const RED = C.red;
const GREEN = C.green;
const TWO = C.violet;
const ARROW = '#333333';
export const CHOICES = ['25', '31', '33', '34', '50'];

export const v2 = (n: number) => {
  let c = 0;
  while (n > 0 && n % 2 === 0) {
    n /= 2;
    c++;
  }
  return c;
};
export const IS_RED = (n: number) => n === 0 || v2(n) % 2 === 1; // losing for the player to move

// ---------- helpers ----------

const Parts: React.FC<{ x: number; y: number; parts: [number, string, string?][]; size?: number; opacity?: number; center?: boolean; gap?: number }> = ({
  x, y, parts, size = 52, opacity = 1, center = false, gap = 16,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center', gap, whiteSpace: 'nowrap', opacity }}>
      {parts.map(([start, tex, color], i) => (
        <div key={i} style={fadeUp(f, start)}>
          <Tex tex={tex} size={size} color={color ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ start, tex, color, ...rest }) => (
  <Parts {...rest} parts={[[start, tex, color]]} />
);

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; opacity?: number; center?: boolean }> = ({ x, y, start, color, children, size = 40, opacity = 1, center = false }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: center ? `translateX(-50%) ${s.transform}` : s.transform, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', opacity: (s.opacity as number) * opacity }}>
      {children}
    </div>
  );
};

/** Number tile. state: grey until `red`/`green` frame, then coloured (with a little pop). */
export const Tile: React.FC<{ n: number | string; cx: number; cy: number; size?: number; show?: number; red?: number; green?: number; opacity?: number; ring?: string; glow?: boolean }> = ({
  n, cx, cy, size = 96, show = 0, red = Infinity, green = Infinity, opacity = 1, ring, glow,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, show, 10) * opacity;
  if (p <= 0) return null;
  const col = f >= red ? RED : f >= green ? GREEN : null;
  const t0 = f >= red ? red : green;
  const bump = col ? Math.max(0, 1 - Math.abs(f - t0 - 4) / 6) * 0.14 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        borderRadius: size * 0.2,
        boxSizing: 'border-box',
        background: col ?? '#fff',
        border: col ? `4px solid ${col}` : '4px solid #b8bfcc',
        color: col ? '#fff' : C.ink,
        fontSize: size * 0.58,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: p,
        transform: `scale(${(0.85 + 0.15 * p) + bump})`,
        boxShadow: glow ? `0 0 0 8px rgba(239,67,67,0.25), 0 0 28px rgba(239,67,67,0.45)` : ring ? `0 0 0 8px ${ring}` : '0 3px 10px rgba(30,40,80,0.08)',
      }}
    >
      {n}
    </div>
  );
};

/** Little tile used inside cards, legends and recap. */
const MiniTile: React.FC<{ n: number | string; color?: 'red' | 'green' | 'grey'; size?: number }> = ({ n, color = 'grey', size = 64 }) => {
  const bg = color === 'red' ? RED : color === 'green' ? GREEN : '#fff';
  return (
    <div style={{ width: size, height: size, boxSizing: 'border-box', borderRadius: size * 0.2, background: bg, border: `3px solid ${color === 'grey' ? '#b8bfcc' : bg}`, color: color === 'grey' ? C.ink : '#fff', fontSize: size * 0.58, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      {n}
    </div>
  );
};

/** One purple dot per factor of two, centred under a tile. */
export const TwoDots: React.FC<{ count: number; cx: number; y: number; start: number; r?: number; stagger?: number; opacity?: number }> = ({ count, cx, y, start, r = 9, stagger = 6, opacity = 1 }) => {
  const f = useCurrentFrame();
  const pitch = r * 2 + 6;
  return (
    <>
      {range(count).map((i) => {
        const p = pop(f, start + i * stagger);
        if (p <= 0.01) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: cx + (i - (count - 1) / 2) * pitch - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: TWO, transform: `scale(${p})`, opacity }} />
        );
      })}
    </>
  );
};

/** Move arrow between tile edges: -1 arcs above the row, halving arcs below. */
export const Arc: React.FC<{ x1: number; x2: number; edge: number; dir: 'up' | 'down'; start: number; end?: number; peak?: number; label?: string; thick?: boolean; inset?: number }> = ({
  x1, x2, edge, dir, start, end, peak, label, thick = false, inset = 0,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 10);
  const o = p * (end === undefined ? 1 : fadeTo(f, end, 0, 10));
  if (o <= 0.01) return null;
  const sgn = Math.sign(x2 - x1) || 1;
  const a = x1 + sgn * inset;
  const b = x2 - sgn * inset;
  const s = dir === 'up' ? -1 : 1;
  const pk = peak ?? Math.min(190, 36 + 0.2 * Math.abs(x2 - x1));
  const cy = edge + s * 2 * pk;
  const mx = (a + b) / 2;
  const ang = (Math.atan2(edge - cy, b - mx) * 180) / Math.PI;
  const head = Math.max(0, (p - 0.85) / 0.15);
  return (
    <>
      <Stage>
        <g opacity={0.7 * (end === undefined ? 1 : fadeTo(f, end, 0, 10))}>
          <path d={`M ${a} ${edge} Q ${mx} ${cy} ${b} ${edge}`} fill="none" stroke={ARROW} strokeWidth={thick ? 11 : 6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          <polygon points="2,0 -24,-13 -24,13" fill={ARROW} transform={`translate(${b} ${edge}) rotate(${ang})`} opacity={head} />
        </g>
      </Stage>
      {label && (
        <div style={{ position: 'absolute', left: mx, top: edge + s * (pk + 30), transform: 'translate(-50%, -50%)', fontSize: 44, fontWeight: 900, color: ARROW, opacity: o * 0.85, whiteSpace: 'nowrap' }}>{label}</div>
      )}
    </>
  );
};

const Chip: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; center?: boolean; size?: number; fill?: boolean }> = ({ x, y, start, color, children, center = false, size = 44, fill = false }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: center ? `translateX(-50%) ${s.transform}` : s.transform, opacity: s.opacity, background: fill ? color : C.card, color: fill ? '#fff' : color, border: `5px solid ${color}`, borderRadius: 999, padding: '8px 28px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
      {children}
    </div>
  );
};

/** A number chip in a halving chain. */
const NumChip: React.FC<{ n: number; cx: number; cy: number; start: number; w?: number; muted?: boolean; fs?: number }> = ({ n, cx, cy, start, w = 150, muted = false, fs = 64 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12);
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - 50, width: w, height: 100, borderRadius: 24, background: muted ? '#eceef4' : C.card, border: `5px solid ${muted ? '#b8bfcc' : C.violet}`, color: muted ? C.muted : C.ink, fontSize: fs, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, boxShadow: '0 6px 18px rgba(30,40,80,0.08)' }}>
      {n}
    </div>
  );
};

const SignBadge: React.FC<{ cx: number; cy: number; start: number; plus: boolean }> = ({ cx, cy, start, plus }) => {
  const f = useCurrentFrame();
  const p = pop(f, start);
  if (p <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: cx - 34, top: cy - 34, width: 68, height: 68, borderRadius: '50%', background: plus ? C.primary : C.amber, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, lineHeight: 1 }}>
      {plus ? '+' : '−'}
    </div>
  );
};

/** Legend: red / green tile meaning. */
const Legend: React.FC<{ x: number; y: number; start: number; startGreen?: number }> = ({ x, y, start, startGreen }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 70, ...fadeUp(f, start) }}>
        <MiniTile n="" color="red" size={56} />
        <span style={{ fontSize: 42, fontWeight: 800 }}>player to move <span style={{ color: RED }}>LOSES</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 70, ...fadeUp(f, startGreen ?? start + 14) }}>
        <MiniTile n="" color="green" size={56} />
        <span style={{ fontSize: 42, fontWeight: 800 }}>player to move <span style={{ color: GREEN }}>WINS</span></span>
      </div>
    </div>
  );
};

const RowTiles: React.FC<{ cy: number; pitch?: number; size?: number; count: number; cx: (i: number) => number }> = () => null;
void RowTiles;

// 17-tile row geometry (table / pattern): tile 96, gap 12, x 48..1872
const RY = 430;
const RS = 96;
const tx = (n: number) => 96 + n * 108;
const TOP = RY - RS / 2;
const BOT = RY + RS / 2;

// ---------- Scene: intro ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const raceOut = fadeTo(f, T(1, 0.0), 0, 14);
  const h1 = T(0, 0.2);
  const h2 = T(0, 0.42);
  const hop = (a: number, b: number, s: number) => a + (b - a) * ease(f, s, 14);
  const cx = f < h2 ? hop(1500, 1100, h1) : hop(1100, 700, h2);
  const label = f < h1 + 7 ? 9 : f < h2 + 7 ? 8 : 4;
  const pulse = 1 + 0.07 * Math.sin(Math.max(0, f - T(0, 0.72)) / 5) * ease(f, T(0, 0.72), 6) * fadeTo(f, T(1, 0), 0, 6);
  const cy = 520;
  return (
    <>
      <div style={{ opacity: raceOut }}>
        <Chip x={560} y={150} start={6} color={C.violet} center fill>Player 1</Chip>
        <div style={{ position: 'absolute', left: 1360, top: 150, transform: `translateX(-50%) scale(${pulse})` }}>
          <Chip x={0} y={0} start={10} color={C.blue} fill>Player 2</Chip>
        </div>
        <Tag x={1360} y={245} start={T(0, 0.74)} color={GREEN} center size={46}>can ALWAYS win</Tag>
        <Tile n={0} cx={220} cy={cy} size={150} show={4} />
        <Stage>
          <polygon
            transform="translate(220 395) scale(1.2)"
            points="0,-30 9,-9 31,-8 14,6 19,28 0,16 -19,28 -14,6 -31,-8 -9,-9"
            fill={C.amber}
            opacity={ease(f, 12, 10)}
          />
        </Stage>
        <Tile n={label} cx={cx} cy={cy} size={150} show={6} />
        <Tag x={1500} y={385} start={10} color={C.violet} center size={56} opacity={fadeTo(f, h1, 0, 8)}>
          <Tex tex="n" size={64} color={C.violet} />
        </Tag>
        <Arc x1={1500} x2={1100} edge={cy - 75} dir="up" peak={55} start={h1 - 4} end={h2 + 30} label="−1" />
        <Arc x1={1100} x2={700} edge={cy + 75} dir="down" peak={70} start={h2 - 4} end={h2 + 30} label="½" inset={30} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', ...fadeUp(f, T(1, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 100, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
      {range(7).map((i) => (
        <Tile key={i} n={i} cx={960 + (i - 3) * 160} cy={560} size={130} show={T(1, 0.35) + i * 5} />
      ))}
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const line = (i: number, children: React.ReactNode) => (
    <div style={{ marginTop: i ? 6 : 0, ...fadeUp(f, i === 0 ? 6 : [0, T(0, 0.35), T(1, 0.05), T(2, 0.05)][i]) }}>{children}</div>
  );
  return (
    <>
      <Pill x={100} y={120} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>Question</Pill>
      <div style={{ position: 'absolute', left: 100, top: 185, width: 1720, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 48px', fontSize: 50, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        {line(0, <>A number <Tex tex="n" size={48} /> is on the board. Two players take turns.</>)}
        {line(1, <>On each turn: take away 1, or halve it (round down).</>)}
        {line(2, <><Mark on={T(1, 0.25)}>The player who writes 0 wins.</Mark></>)}
        {line(3, <>For how many <Mark on={T(2, 0.45)}><Tex tex="n" size={48} /> from 1 to 100</Mark> can the <Mark on={T(2, 0.2)}>second player always win</Mark>?</>)}
      </div>
      <Chip x={290} y={565} start={T(0, 0.55)} color={C.violet} size={50}><Tex tex={String.raw`k\to k-1`} size={50} /></Chip>
      <Chip x={820} y={565} start={T(0, 0.72)} color={C.violet} size={50}><Tex tex={String.raw`k\to\lfloor k/2\rfloor`} size={50} /></Chip>
      <Eq x={1380} y={570} start={T(0, 0.85)} size={52} color={C.muted} tex={String.raw`13\to12\ \text{or}\ 6`} />
      <Choices x={170} y={700} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => T(2, 0.6 + i * 0.08)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const treeOut = fadeTo(f, T(1, 0.02), 0, 12);
  return (
    <>
      <Text x={960} y={120} w={1700} size={54} weight={900} align="center" style={{ ...fadeUp(f, 4), opacity: ease(f, 4, 12) * treeOut }}>
        Goal: starting numbers where <span style={{ color: C.violet }}>Player 1</span> is stuck
      </Text>
      <div style={{ opacity: treeOut }}>
        <Tile n="n" cx={330} cy={400} size={130} show={T(0, 0.1)} />
        <Stage>
          <g stroke={ARROW} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7}>
            <path d="M 410 370 Q 520 300 700 295" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(f, T(0, 0.2), 12)} />
            <path d="M 410 430 Q 520 500 700 505" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(f, T(0, 0.3), 12)} />
          </g>
          <polygon points="2,0 -24,-13 -24,13" fill={ARROW} transform="translate(706 295) rotate(0)" opacity={0.7 * ease(f, T(0, 0.3), 6)} />
          <polygon points="2,0 -24,-13 -24,13" fill={ARROW} transform="translate(706 505) rotate(0)" opacity={0.7 * ease(f, T(0, 0.4), 6)} />
        </Stage>
        <Chip x={740} y={250} start={T(0, 0.3)} color={C.blue} fill size={46}>Player 2 wins</Chip>
        <Chip x={740} y={460} start={T(0, 0.4)} color={C.blue} fill size={46}>Player 2 wins</Chip>
        <Tag x={1180} y={380} start={T(0, 0.5)} color={C.muted} size={44}>whatever Player 1 does</Tag>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 580, ...fadeUp(f, T(0, 0.72)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <MiniTile n="" color="red" size={64} />
          <span style={{ fontSize: 56, fontWeight: 900, color: RED }}>losing number</span>
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, color: C.muted, marginTop: 6, marginLeft: 86 }}>the player to move loses (if the other plays well)</div>
      </div>
      <Eq x={0} y={300} center start={T(1, 0.2)} size={72} tex={String.raw`1,\ 2,\ 3,\ \dots,\ 100`} />
      <div style={{ position: 'absolute', left: 1530, top: 280, width: 130, height: 130, borderRadius: '50%', background: C.violet, color: '#fff', fontSize: 90, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, T(1, 0.55)) }}>?</div>
      <Tag x={960} y={460} start={T(1, 0.5)} color={RED} center size={52}>
        how many losing numbers?
      </Tag>
    </>
  );
};

// ---------- Scene: pauses ----------

const makePause = (withChoices: boolean, seconds: number, lines: React.ReactNode[], headline: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={130} y={140} w={1000} size={46} weight={800} style={fadeUp(f, 4)}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginBottom: 14 }}>{l}</div>
        ))}
      </Text>
      <Text x={130} y={withChoices ? 470 : 500} w={1000} size={48} weight={900} color={C.violet} style={fadeUp(f, 8)}>
        {headline}
      </Text>
      {withChoices && <Choices x={130} y={620} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={() => 10} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} />
    </>
  );
};

// ---------- Scene: table ----------

type Move = { from: number; to: number; kind: 'm1' | 'half'; start: number; end?: number; label?: string };

const TableMoves: React.FC<{ moves: Move[] }> = ({ moves }) => (
  <>
    {moves.map((m, i) => (
      <Arc
        key={i}
        x1={tx(m.from)}
        x2={tx(m.to)}
        edge={m.kind === 'm1' ? TOP : BOT}
        dir={m.kind === 'm1' ? 'up' : 'down'}
        start={m.start}
        end={m.end}
        peak={m.kind === 'm1' ? 50 : undefined}
        label={m.label}
      />
    ))}
  </>
);

const Table: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const b7 = T(7, 0.05);
  const when = (k: number) => b7 + (k - 7) * 7;
  const redAt: Record<number, number> = { 0: T(2, 0.3), 2: T(4, 0.75), 6: T(6, 0.88) };
  const greenAt: Record<number, number> = { 1: T(3, 0.55), 3: T(6, 0.15), 4: T(6, 0.25), 5: T(6, 0.35) };
  for (let k = 7; k <= 16; k++) (IS_RED(k) ? redAt : greenAt)[k] = when(k);
  const moves: Move[] = [
    { from: 1, to: 0, kind: 'm1', start: T(3, 0.3), end: T(4, 0.0), label: '−1' },
    { from: 2, to: 1, kind: 'm1', start: T(4, 0.3), end: T(5, 0.0), label: '−1' },
    { from: 2, to: 1, kind: 'half', start: T(4, 0.4), end: T(5, 0.0), label: '½' },
    { from: 3, to: 2, kind: 'm1', start: T(6, 0.05), end: T(6, 0.3) },
    { from: 4, to: 2, kind: 'half', start: T(6, 0.15), end: T(6, 0.42) },
    { from: 5, to: 2, kind: 'half', start: T(6, 0.25), end: T(6, 0.5) },
    { from: 6, to: 5, kind: 'm1', start: T(6, 0.55), end: T(7, 0.0) },
    { from: 6, to: 3, kind: 'half', start: T(6, 0.62), end: T(7, 0.0) },
  ];
  // L7 decisive arrows
  const dec: [number, number[]][] = [[7, [6]], [8, [7, 4]], [9, [8]], [10, [9, 5]], [11, [10]], [12, [6]], [13, [6]], [14, [13, 7]], [15, [14]], [16, [8]]];
  for (const [k, tos] of dec) {
    for (const to of tos) {
      moves.push({ from: k, to, kind: to === k - 1 ? 'm1' : 'half', start: when(k) - 6, end: when(k) + 14 });
    }
  }
  return (
    <>
      {range(17).map((n) => (
        <Tile key={n} n={n} cx={tx(n)} cy={RY} size={RS} show={T(0, 0.05) + n * 3} red={redAt[n]} green={greenAt[n]} />
      ))}
      <TableMoves moves={moves} />
      <Legend x={1190} y={118} start={T(1, 0.2)} startGreen={T(1, 0.6)} />
      <Tag x={tx(0)} y={BOT + 14} start={T(2, 0.5)} color={C.muted} center size={36}>game over</Tag>
      <Tag x={tx(5)} y={640} start={T(6, 0.28)} color={C.muted} center size={44} opacity={fadeTo(f, T(6, 0.48), 0, 10)}>
        <Tex tex={String.raw`\lfloor 5/2\rfloor=2`} size={52} color={C.muted} />
      </Tag>
      {/* rule box */}
      <div style={{ position: 'absolute', left: 50, top: 112, background: C.card, borderRadius: 24, padding: '10px 30px', boxShadow: '0 6px 20px rgba(30,40,80,0.08)', ...fadeUp(f, T(5, 0.25)) }}>
        <div><Tex tex={String.raw`{\color{#21c45d}\text{green}}\Leftarrow\text{SOME move}\to{\color{#ef4343}\text{red}}`} size={48} /></div>
        <div><Tex tex={String.raw`{\color{#ef4343}\text{red}}\Leftarrow\text{EVERY move}\to{\color{#21c45d}\text{green}}`} size={48} /></div>
      </div>
      <Chip x={960} y={720} start={T(7, 0.62)} color={RED} center size={52}>
        <Tex tex={String.raw`\text{red: }2,6,8,10,14`} size={56} />
      </Chip>
    </>
  );
};

// ---------- Scene: pattern ----------

const Pattern: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const DY = BOT + 24;
  const facOut = fadeTo(f, T(3, 0.02), 0, 12);
  const qOut = fadeTo(f, T(1, 0.02), 0, 12);
  const reds = [2, 6, 8, 10, 14];
  const evenGreens = [4, 12, 16];
  return (
    <>
      {range(17).map((n) => (
        <Tile
          key={n}
          n={n}
          cx={tx(n)}
          cy={RY}
          size={RS}
          show={0}
          red={IS_RED(n) ? 0 : undefined}
          green={IS_RED(n) ? undefined : 0}
          glow={reds.includes(n) && f >= T(0, 0.5) && f < T(3, 0)}
          ring={evenGreens.includes(n) && f >= T(0, 0.3) && f < T(1, 0) ? TWO : undefined}
        />
      ))}
      {evenGreens.map((n) => (
        <Tag key={n} x={tx(n)} y={BOT - 235} start={T(0, 0.35)} color={TWO} center size={72} opacity={qOut}>?</Tag>
      ))}
      <Eq x={tx(6) - 150} y={250} start={T(1, 0.3)} size={56} opacity={facOut} tex={String.raw`6=\color{#7b61ff}2\color{#333333}\times3`} />
      {range(16).map((i) => {
        const n = i + 1;
        const st = n === 6 ? T(1, 0.6) : T(2, 0.05) + i * 4;
        return <TwoDots key={n} count={v2(n)} cx={tx(n)} y={DY} start={st} />;
      })}
      <div style={{ opacity: facOut }}>
        <Eq x={110} y={600} start={T(2, 0.1)} size={54} tex={String.raw`8=\color{#7b61ff}2\times2\times2`} />
        <Eq x={110} y={695} start={T(2, 0.35)} size={54} tex={String.raw`4=\color{#7b61ff}2\times2`} />
        <Eq x={1000} y={600} start={T(2, 0.6)} size={54} tex={String.raw`12=\color{#7b61ff}2\times2\color{#333333}\times3`} />
        <Eq x={1000} y={695} start={T(2, 0.8)} size={54} tex={String.raw`16=\color{#7b61ff}2\times2\times2\times2`} />
      </div>
      {/* flashing counts under the red tiles */}
      {reds.map((n, i) => {
        const s = T(3, 0.5 + i * 0.07);
        const p = pop(f, s);
        if (p <= 0.01) return null;
        return (
          <div key={n} style={{ position: 'absolute', left: tx(n) - 40, top: DY + 22, width: 80, textAlign: 'center', fontSize: 56, fontWeight: 900, color: TWO, transform: `scale(${p})` }}>
            {v2(n)}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute', left: 230, right: 230, top: 640, height: 150, background: C.card, borderRadius: 36, border: `6px solid ${TWO}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, fontSize: 70, fontWeight: 900,
          boxShadow: '0 12px 40px rgba(123,97,255,0.22)',
          opacity: ease(f, T(3, 0.12), 10), transform: `scale(${0.9 + 0.1 * pop(f, T(3, 0.12))})`,
        }}
      >
        <span style={{ color: RED }}>red</span>
        <Tex tex={String.raw`\Leftrightarrow`} size={72} />
        <span>odd number of <span style={{ color: TWO }}>2s</span></span>
      </div>
    </>
  );
};

// ---------- Scene: prove ----------

const PCY = 360;
const PS = 140;
const PTOP = PCY - PS / 2;
const PBOT = PCY + PS / 2;

const Prove: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const g1 = fadeTo(f, T(4, 0.02), 0, 12); // first group (8, 7, 4) fades before L4
  const g2 = ease(f, T(4, 0.05), 6);
  const dotY = PBOT + 26;
  const pCol = (c: string) => c;
  void pCol;
  return (
    <>
      <Tag x={960} y={290} start={4} color={C.violet} center size={96} opacity={fadeTo(f, T(1, 0.0), 0, 12)}>pattern ≠ proof</Tag>

      {/* group 1: 8 -> 7, 8 -> 4 */}
      <div style={{ opacity: g1 }}>
        <Tile n={8} cx={360} cy={PCY} size={PS} show={T(1, 0.05)} red={0} />
        <TwoDots count={3} cx={360} y={dotY} start={T(1, 0.1)} r={11} />
        <Tile n={7} cx={760} cy={PCY} size={PS} show={T(1, 0.45)} green={T(2, 0.2)} />
        <Arc x1={360} x2={760} edge={PTOP} dir="up" peak={46} start={T(1, 0.38)} label="−1" />
        <Tag x={760} y={170} start={T(1, 0.6)} color={TWO} center size={42}>odd: 0 twos</Tag>
        <Tag x={760} y={PBOT + 20} start={T(2, 0.2)} color={GREEN} center size={42}>0 is even</Tag>
        <Tile n={4} cx={1160} cy={PCY} size={PS} show={T(2, 0.62)} green={T(2, 0.72)} />
        <TwoDots count={2} cx={1160} y={dotY} start={T(2, 0.78)} r={11} />
        <Arc x1={360} x2={1160} edge={PBOT} dir="down" peak={110} start={T(2, 0.45)} label="½" inset={48} />
        <Chip x={760} y={PBOT + 160} start={T(2, 0.55)} color={TWO} center size={40}>lose one <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: '50%', background: TWO, verticalAlign: 'middle' }} /></Chip>
      </div>
      <Check x={150} y={700} start={T(3, 0.2)}>
        <span>from <span style={{ color: RED }}>red</span>: EVERY move → <span style={{ color: GREEN }}>green</span></span>
      </Check>

      {/* group 2: 13, 12, 6 */}
      <div style={{ opacity: g2 }}>
        <Tile n={12} cx={760} cy={PCY} size={PS} show={T(4, 0.05)} green={0} />
        <TwoDots count={2} cx={760} y={dotY} start={T(4, 0.1)} r={11} />
        <Tile n={6} cx={1160} cy={PCY} size={PS} show={T(4, 0.1)} green={0} red={T(4, 0.72)} glow={f >= T(6, 0.35)} />
        <TwoDots count={1} cx={1160} y={dotY} start={T(4, 0.74)} r={11} />
        <Arc x1={760} x2={1160} edge={PBOT} dir="down" peak={60} start={T(4, 0.42)} label="½" inset={48} />
        <Tag x={960} y={170} start={T(4, 0.8)} color={TWO} center size={42} opacity={fadeTo(f, T(5, 0.0), 0, 10)}>even → odd</Tag>
        <Tile n={13} cx={360} cy={PCY} size={PS} show={T(5, 0.05)} green={0} />
        <Arc x1={360} x2={760} edge={PTOP} dir="up" peak={46} start={T(5, 0.45)} label="−1" />
        <Arc x1={360} x2={1160} edge={PBOT} dir="down" peak={190} start={T(5, 0.6)} label="½" inset={48} thick={f >= T(6, 0.3)} />
        <Tag x={1560} y={470} start={T(5, 0.78)} color={C.muted} center size={42}>
          <Tex tex={String.raw`\lfloor 13/2\rfloor=6`} size={50} color={C.muted} />
          <span style={{ marginLeft: 16, fontSize: 48 }}>= half of 12</span>
        </Tag>
        <Tag x={960} y={170} start={T(6, 0.12)} color={TWO} center size={42}>differ by one 2</Tag>
        <Chip x={1330} y={290} start={T(6, 0.7)} color={C.primary} size={46}>
          <Tex tex={String.raw`1\to0`} size={54} /> write 0, win
        </Chip>
      </div>
      <Check x={150} y={770} start={T(6, 0.85)}>
        <span>from <span style={{ color: GREEN }}>green</span>: SOME move → <span style={{ color: RED }}>red</span></span>
      </Check>
    </>
  );
};

// ---------- Scene: count ----------

const CountScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const done = T(3, 0.93);
  const Label: React.FC<{ y: number; start: number; text: string }> = ({ y, start, text }) => (
    <div style={{ position: 'absolute', left: 90, top: y, display: 'flex', alignItems: 'center', gap: 14, ...fadeUp(f, start) }}>
      <span style={{ fontSize: 46, fontWeight: 900, color: TWO, whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
  const CountChip: React.FC<{ y: number; start: number; n: number }> = ({ y, start, n }) => {
    const p = pop(f, start);
    if (p <= 0.01) return null;
    return (
      <div style={{ position: 'absolute', left: 1640, top: y, width: 150, height: 90, borderRadius: 24, background: TWO, color: '#fff', fontSize: 64, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, opacity: fadeTo(f, done - 12, 0, 10) }}>{n}</div>
    );
  };
  return (
    <>
      <Label y={160} start={T(0, 0.2)} text="one 2" />
      <Eq x={420} y={142} start={T(0, 0.25)} size={58} tex={String.raw`2,\ 6,\ 10,\ \dots,\ 98`} />
      <Eq x={420} y={225} start={T(0, 0.5)} size={60} tex={String.raw`\underbrace{50}_{\text{\large even}}-\underbrace{25}_{\text{\large multiples of 4}}=25`} />
      <CountChip y={148} start={T(0, 0.9)} n={25} />

      <Label y={485} start={T(1, 0.0)} text="three 2s" />
      <Eq x={420} y={467} start={T(1, 0.05)} size={56} tex={String.raw`8,\ 24,\ 40,\ 56,\ 72,\ 88`} />
      <CountChip y={473} start={T(1, 0.88)} n={6} />

      <Label y={615} start={T(2, 0.0)} text="five 2s" />
      <Eq x={420} y={597} start={T(2, 0.05)} size={58} tex={String.raw`32,\ 96`} />
      <CountChip y={603} start={T(2, 0.38)} n={2} />
      <Eq x={800} y={607} start={T(2, 0.55)} size={48} color={C.muted} tex={String.raw`\text{seven 2s: }128>100`} />

      <Parts x={0} y={725} center size={72} parts={[[T(3, 0.08), String.raw`25+6+2=`], [T(3, 0.62), '33', C.green]]} gap={16} />
      <Answer x={1700} y={480} value="33" chime={CHIME} start={done} />
      <Pill x={1595} y={625} color={C.green} style={{ ...fadeUp(f, done), fontSize: 50 }}>Choice C</Pill>
      <Confetti x={1700} y={480} start={done} seed={7} />
    </>
  );
};

// ---------- Scene: double ----------

const Double: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const panelOut = fadeTo(f, T(4, 0.45), 0, 12);
  const SZ = 130;
  const ay = 330;
  const by = 565;
  const chain = [50, 25, 12, 6, 3, 1];
  const cxs = chain.map((_, i) => 215 + i * 298);
  return (
    <>
      <div style={{ opacity: panelOut }}>
        {/* pair A: 6 -> 12 */}
        <Tile n={6} cx={200} cy={ay} size={SZ} show={T(0, 0.1)} red={0} />
        <Tile n={12} cx={600} cy={ay} size={SZ} show={T(0, 0.6)} green={T(1, 0.35)} />
        <Arc x1={200} x2={600} edge={ay - SZ / 2} dir="up" peak={60} start={T(0, 0.5)} label="×2" />
        <TwoDots count={1} cx={200} y={ay + SZ / 2 + 24} start={T(1, 0.1)} r={11} />
        <TwoDots count={2} cx={600} y={ay + SZ / 2 + 24} start={T(1, 0.2)} r={11} />
        {/* pair B: 3 -> 6 */}
        <Tile n={3} cx={200} cy={by} size={SZ} show={T(1, 0.45)} green={0} />
        <Tile n={6} cx={600} cy={by} size={SZ} show={T(1, 0.5)} red={T(1, 0.62)} />
        <Arc x1={200} x2={600} edge={by - SZ / 2} dir="up" peak={50} start={T(1, 0.52)} label="×2" />
        <TwoDots count={1} cx={600} y={by + SZ / 2 + 24} start={T(1, 0.68)} r={11} />
        <Eq x={70} y={715} start={T(1, 0.78)} size={46} tex={String.raw`\times2\text{ adds one 2: flips odd}\leftrightarrow\text{even}`} />

        <Eq x={930} y={140} start={T(2, 0.45)} size={62} tex={String.raw`R(100)=G(50)`} />
        <Eq x={930} y={228} start={T(2, 0.65)} size={48} color={RED} tex={String.raw`R(N)=\text{reds in }1\text{ to }N`} />
        <Eq x={930} y={288} start={T(2, 0.82)} size={48} color={GREEN} tex={String.raw`G(N)=\text{greens in }1\text{ to }N`} />
        <Eq x={930} y={372} start={T(3, 0.4)} size={56} tex={String.raw`G(50)=50-R(50)`} />
        <Eq x={930} y={450} start={T(3, 0.75)} size={56} tex={String.raw`R(100)=50-R(50)`} />
        <Eq x={930} y={545} start={T(4, 0.08)} size={56} tex={String.raw`R(50)=25-R(25)`} />
        <Eq x={930} y={622} start={T(4, 0.2)} size={56} tex={String.raw`R(100)=50-25+R(25)`} />
        <Tag x={930} y={700} start={T(4, 0.3)} color={TWO} size={46}>minus a minus is a plus</Tag>
      </div>

      {/* halving chain */}
      {chain.map((n, i) => (
        <NumChip key={n} n={n} cx={cxs[i]} cy={250} start={T(4, 0.5 + i * 0.05)} />
      ))}
      {range(5).map((i) => {
        const mid = (cxs[i] + cxs[i + 1]) / 2;
        const s = T(4, 0.52 + i * 0.05);
        return (
          <div key={i}>
            <Stage>
              <path d={`M ${cxs[i] + 90} 250 L ${cxs[i + 1] - 96} 250`} stroke={ARROW} strokeWidth={6} strokeLinecap="round" opacity={0.6 * ease(f, s, 8)} />
              <polygon points="2,0 -22,-12 -22,12" transform={`translate(${cxs[i + 1] - 80} 250)`} fill={ARROW} opacity={0.6 * ease(f, s + 6, 4)} />
            </Stage>
            <Tag x={mid} y={160} start={s} color={ARROW} center size={40} opacity={0.8}>½</Tag>
            <SignBadge cx={mid} cy={345} start={T(4, 0.75 + i * 0.04)} plus={i % 2 === 1} />
          </div>
        );
      })}
      <Parts
        x={0}
        y={470}
        center
        size={72}
        gap={4}
        parts={[
          [T(5, 0.05), '50'],
          [T(5, 0.18), '{}-25', C.amber],
          [T(5, 0.32), '{}+12', C.primary],
          [T(5, 0.46), '{}-6', C.amber],
          [T(5, 0.58), '{}+3', C.primary],
          [T(5, 0.7), '{}-1', C.amber],
          [T(5, 0.82), '{}=33', C.green],
        ]}
      />
      <Chip x={960} y={640} start={T(6, 0.55)} color={C.violet} center size={52} fill>
        huge ranges (1 to 1,000,000)
      </Chip>
    </>
  );
};

// ---------- Scene: traps ----------

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const wrongAt = [T(0, 0.3), T(1, 0.1), Infinity, T(2, 0.3), T(3, 0.3)];
  const formAt = [T(0, 0.55), T(1, 0.35), T(4, 0.5), T(2, 0.55), T(3, 0.55)];
  const habit = T(4, 0.2);
  const content = (i: number, col: string): React.ReactNode => {
    if (i === 0) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Tex tex={String.raw`\text{only one 2}`} size={48} color={TWO} /><Tex tex={String.raw`2,6,\dots,98`} size={48} color={col} /></div>;
    if (i === 1)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Tex tex={String.raw`33-2`} size={52} color={col} />
          <Tex tex={String.raw`32=2^5`} size={48} color={TWO} />
          <div style={{ display: 'flex', gap: 8, opacity: ease(f, T(1, 0.5), 10) }}>
            {range(5).map((k) => <div key={k} style={{ width: 20, height: 20, borderRadius: '50%', background: TWO }} />)}
          </div>
        </div>
      );
    if (i === 2) return <Tex tex={String.raw`\begin{gathered}25+6+2\\=33\end{gathered}`} size={52} color={col} />;
    if (i === 3)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Tex tex={String.raw`33+1`} size={52} color={col} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MiniTile n={1} color="green" />
            <Tex tex={String.raw`\to`} size={40} />
            <MiniTile n={0} color="red" />
          </div>
        </div>
      );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Tex tex={String.raw`\text{all evens}`} size={48} color={col} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MiniTile n={4} color="green" />
          <span style={{ fontSize: 40, fontWeight: 900 }}>½→</span>
          <MiniTile n={2} color="red" />
        </div>
      </div>
    );
  };
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 140, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 2 && f >= habit + 40;
          const border = wrong ? RED : ok ? GREEN : 'transparent';
          const col = C.ink;
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 6 + i * 6, 12) }}>
              <div style={{ height: 410, boxSizing: 'border-box', background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 12 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 90, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={72} color={C.ink} />
                </div>
                <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, formAt[i]) }}>
                  {content(i, col)}
                </div>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? RED : GREEN, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 725, display: 'flex', justifyContent: 'center', ...fadeUp(f, habit) }}>
        <div style={{ background: C.primary, color: '#fff', borderRadius: 28, padding: '12px 44px', fontSize: 50, fontWeight: 900 }}>
          Table → pattern → <span style={{ color: '#fff3b0' }}>PROOF</span>
        </div>
      </div>
    </>
  );
};

// ---------- Scene: variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <Pill x={120} y={150} color={C.violet} style={fadeUp(f, T(0, 0.1))}>Your turn!</Pill>
      <div style={{ position: 'absolute', left: 120, top: 280, width: 1680, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '30px 50px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, T(0, 0.2)) }}>
        <div>Same game: take away 1, or halve it (round down).</div>
        <div style={{ marginTop: 10 }}>
          How many <Mark on={T(0, 0.6)}><Tex tex="n" size={54} /> from 1 to 200</Mark> are second-player wins?
        </div>
      </div>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const chain = [200, 100, 50, 25, 12, 6, 3, 1];
  const cxs = chain.map((_, i) => 160 + i * 230);
  const done = T(1, 0.95);
  const term = [0.12, 0.28, 0.42, 0.54, 0.66, 0.76];
  return (
    <>
      {chain.map((n, i) => (
        <NumChip key={n} n={n} cx={cxs[i]} cy={200} start={T(0, 0.15 + i * 0.1)} w={136} fs={56} muted={i === 0} />
      ))}
      {range(7).map((i) => (
        <Stage key={i}>
          <path d={`M ${cxs[i] + 72} 200 L ${cxs[i + 1] - 74} 200`} stroke={ARROW} strokeWidth={6} strokeLinecap="round" opacity={0.6 * ease(f, T(0, 0.2 + i * 0.1), 8)} />
          <polygon points="2,0 -20,-11 -20,11" transform={`translate(${cxs[i + 1] - 66} 200)`} fill={ARROW} opacity={0.6 * ease(f, T(0, 0.26 + i * 0.1), 4)} />
        </Stage>
      ))}
      {range(6).map((i) => (
        <SignBadge key={i} cx={(cxs[i + 1] + cxs[i + 2]) / 2} cy={295} start={T(1, term[i])} plus={i % 2 === 1} />
      ))}
      <Parts
        x={0}
        y={400}
        center
        size={72}
        gap={10}
        parts={[
          [T(1, 0.02), '100'],
          [T(1, term[0]), '{}-50', C.amber],
          [T(1, term[1]), '{}+25', C.primary],
          [T(1, term[2]), '{}-12', C.amber],
          [T(1, term[3]), '{}+6', C.primary],
          [T(1, term[4]), '{}-3', C.amber],
          [T(1, term[5]), '{}+1', C.primary],
          [T(1, 0.84), '{}=67', C.green],
        ]}
      />
      <Answer x={1730} y={640} value="67" chime={CHIME} start={done} />
      <Confetti x={1730} y={640} start={done} seed={9} />
      <Eq x={90} y={560} start={T(2, 0.15)} size={60} tex={String.raw`\underbrace{50}_{\text{\large one 2}}+\underbrace{13}_{\text{\large three 2s}}+\underbrace{3}_{\text{\large five 2s}}+\underbrace{1}_{\text{\large 128}}=67`} />
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const T = (i: number, t = 0) => at(scene, i, t);
  const out = fadeTo(f, T(2, 0.02), 0, 12);
  return (
    <>
      <div style={{ opacity: out }}>
        {range(11).map((n) => (
          <Tile key={n} n={n} cx={210 + n * 150} cy={250} size={120} show={T(0, 0.1) + n * 4} red={IS_RED(n) ? 0 : undefined} green={IS_RED(n) ? undefined : 0} />
        ))}
        <Tag x={960} y={340} start={T(0, 0.55)} color={C.violet} center size={58} opacity={fadeTo(f, T(1, 0.02), 0, 12)}>small cases → pattern</Tag>
        <div style={{ position: 'absolute', left: 230, top: 400, display: 'flex', alignItems: 'center', gap: 28, fontSize: 56, fontWeight: 800, ...fadeUp(f, T(1, 0.15)) }}>
          <MiniTile n="" color="red" size={84} />
          <span><span style={{ color: RED }}>red</span>: EVERY move → <span style={{ color: GREEN }}>green</span></span>
        </div>
        <div style={{ position: 'absolute', left: 230, top: 540, display: 'flex', alignItems: 'center', gap: 28, fontSize: 56, fontWeight: 800, ...fadeUp(f, T(1, 0.5)) }}>
          <MiniTile n="" color="green" size={84} />
          <span><span style={{ color: GREEN }}>green</span>: SOME move → <span style={{ color: RED }}>red</span></span>
        </div>
      </div>
      <SignOff start={T(2, 0.1)} text="Keep exploring!" />
      <Confetti x={960} y={380} start={T(2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(
    true,
    10,
    ['Take away 1, or halve it (round down).', 'The player who writes 0 wins.'],
    'How many n from 1 to 100 are second-player wins?',
  ),
  table: Table,
  pattern: Pattern,
  prove: Prove,
  count: CountScene,
  double: Double,
  traps: Traps,
  variant: Variant,
  try2: makePause(
    false,
    10,
    ['Same game. Take away 1, or halve it (round down).', 'The player who writes 0 wins.'],
    'How many n from 1 to 200 are second-player wins?',
  ),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-07-halving-game-thumb`, render.sh -> poster.jpg): the trap + the two moves and the goal of writing 0, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={['Think it\u2019s', <span style={{ color: C.red }}>50?</span>]}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <Tex tex={'n \\to n-1'} size={110} color={C.violet} />
      <div style={{ fontSize: 52, fontWeight: 900, color: C.muted }}>or</div>
      <Tex tex={'n \\to \\tfrac{n}{2}'} size={110} color={C.blue} />
      <div style={{ marginTop: 20, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 40px', fontSize: 64, fontWeight: 900 }}>Write 0 = win</div>
    </div>
  </ThumbFrame>
);

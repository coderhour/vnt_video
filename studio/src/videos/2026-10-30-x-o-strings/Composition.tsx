import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, Step, XMark, makeGrid, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-x-o-strings';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- maths (same as verify.py) ----------

export const GOOD = 'XXOXOOXO'; // the "keep score" example that counts
export const BAD = 'XOOXXXOO'; // O leads 2 to 1 after three letters

/** The good strings, sorted by how many X's come before the first O (verify.py prints the same lists). */
const GROUPS: Record<number, string[]> = {
  4: ['XXXXOOOO'],
  3: ['XXXOXOOO', 'XXXOOXOO', 'XXXOOOXO'],
  2: ['XXOXXOOO', 'XXOXOXOO', 'XXOXOOXO', 'XXOOXXOO', 'XXOOXOXO'],
  1: ['XOXXXOOO', 'XOXXOXOO', 'XOXXOOXO', 'XOXOXXOO', 'XOXOXOXO'],
};

/** Ways to reach (x X's, o O's) without the O count passing the X count. */
const table = (nx: number, no: number) => {
  const v: Record<string, number> = {};
  for (let o = 0; o <= no; o++)
    for (let x = 0; x <= nx; x++) v[`${x},${o}`] = o > x ? 0 : x === 0 && o === 0 ? 1 : (v[`${x - 1},${o}`] ?? 0) + (v[`${x},${o - 1}`] ?? 0);
  return v;
};
export const T44 = table(4, 4);
const T53 = table(5, 3);

/** Grid nodes visited by a string's walk: X steps right, O steps down. */
export const walk = (s: string): Pt[] => {
  const out: Pt[] = [[0, 0]];
  for (const ch of s) {
    const [x, o] = out[out.length - 1];
    out.push(ch === 'X' ? [x + 1, o] : [x, o + 1]);
  }
  return out;
};

/** Frame (in the scene) where `phrase` starts inside line i, estimated from its position in the caption. */
export const cue = (scene: Scene, i: number, phrase: string, after = false) => {
  const cap = scene.lines[i].caption;
  const k = cap.indexOf(phrase);
  if (k < 0) throw new Error(`cue: "${phrase}" not in line ${i} of ${scene.id}`);
  return at(scene, i, (k + (after ? phrase.length : 0)) / cap.length);
};

// ---------- building blocks ----------

const TILE = { X: C.primary, O: C.violet } as Record<string, string>;

/** A string as a row of letter tiles. `on(i)` = how visible tile i is; `ring(i)` = optional outline colour. */
export const Tiles: React.FC<{
  x: number;
  y: number;
  s: string;
  size?: number;
  gap?: number;
  on?: (i: number) => number;
  dim?: (i: number) => boolean;
  ring?: (i: number) => string | undefined;
  style?: React.CSSProperties;
}> = ({ x, y, s, size = 70, gap = 10, on = () => 1, dim = () => false, ring = () => undefined, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap, ...style }}>
    {s.split('').map((ch, i) => {
      const p = on(i);
      const r = ring(i);
      const q = ch === '?';
      return (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.22,
            background: q ? C.card : TILE[ch],
            border: q ? `4px dashed ${C.line}` : undefined,
            boxSizing: 'border-box',
            color: q ? C.muted : '#fff',
            fontSize: size * 0.72,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: p * (dim(i) ? 0.3 : 1),
            transform: `scale(${0.6 + 0.4 * p})`,
            boxShadow: r ? `0 0 0 6px ${C.bg}, 0 0 0 12px ${r}` : '0 4px 10px rgba(30,40,80,0.08)',
          }}
        >
          {ch}
        </div>
      );
    })}
  </div>
);

/** Tiles popping in one after another between frames a and b. */
export const seq = (f: number, a: number, b: number, n = 8) => (i: number) => ease(f, a + ((b - a) * i) / n, 8);

/** A maths line placed at (x, y). */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

export const Chime: React.FC<{ at: number }> = ({ at: a }) => (
  <Sequence from={a} durationInFrames={60} layout="none">
    <Audio src={CHIME} volume={0.3} />
  </Sequence>
);

export const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

// ---------- the walk grid ----------

export type Node = { x: number; o: number; v: number; at: number };

const R = 44; // node radius

/** Lattice of X-steps (right) and O-steps (down). Spots below the wall (more O's than X's) are blocked. */
export const WalkGrid: React.FC<{
  nx: number;
  no: number;
  g: (p: Pt) => Pt;
  wall: number;
  nodes?: Node[];
  start?: number;
  corner?: number;
  r?: number;
  font?: number;
}> = ({ nx, no, g, wall, nodes = [], start = 0, corner = 0, r = R, font = 52 }) => {
  const f = useCurrentFrame();
  const show = ease(f, start, 16);
  const allowed = range(no + 1).flatMap((o) => range(nx + 1).filter((x) => o <= x).map((x): Pt => [x, o]));
  const blocked = range(no + 1).flatMap((o) => range(nx + 1).filter((x) => o > x).map((x): Pt => [x, o]));
  const shade: Pt[] = [[-0.45, 0.25], [no - 0.25, no + 0.45], [-0.45, no + 0.45]]; // wall: o = x + 0.7, clear of the diagonal spots
  const [wa, wb] = [g(shade[0]), g(shade[1])];
  return (
    <g opacity={show}>
      <g opacity={wall}>
        <path d={`M ${shade.map((p) => g(p).join(' ')).join(' L ')} Z`} fill={C.red} opacity={0.08} />
        <line x1={wa[0]} y1={wa[1]} x2={wb[0]} y2={wb[1]} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
      </g>
      {allowed.map(([x, o]) => {
        const [a, b] = [g([x, o]), g([x + 1, o])];
        const [c, d] = [g([x, o]), g([x, o + 1])];
        return (
          <g key={`${x},${o}`} stroke={C.line} strokeWidth={7}>
            {x < nx && <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />}
            {o < no && o + 1 <= x && <line x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />}
          </g>
        );
      })}
      {blocked.map((p) => {
        const [cx, cy] = g(p);
        return <circle key={p.join()} cx={cx} cy={cy} r={8} fill={C.muted} opacity={0.45} />;
      })}
      {allowed.map((p) => {
        const [cx, cy] = g(p);
        return <circle key={p.join()} cx={cx} cy={cy} r={r} fill={C.card} stroke={C.line} strokeWidth={5} />;
      })}
      {corner > 0 && (() => {
        const [cx, cy] = g([nx, no]);
        return <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={C.amber} strokeWidth={8} opacity={corner} />;
      })()}
      {nodes.map((n) => {
        const s = pop(f, n.at);
        if (s <= 0) return null;
        const [cx, cy] = g([n.x, n.o]);
        return (
          <g key={`${n.x},${n.o}`} transform={`translate(${cx} ${cy}) scale(${s})`}>
            <circle r={r} fill={C.primarySoft} stroke={C.primary} strokeWidth={5} />
            <text y={3} fontFamily={NUNITO} fontSize={n.v >= 10 ? Math.max(48, font * 0.9) : font} fontWeight={900} fill={C.ink} textAnchor="middle" dominantBaseline="middle">
              {n.v}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** A walk drawn node to node (never between nodes), `progress` 0→1 over its steps. */
export const WalkPath: React.FC<{ pts: Pt[]; g: (p: Pt) => Pt; progress: number; color: string; opacity?: number }> = ({ pts, g, progress, color, opacity = 1 }) => {
  if (progress <= 0 || opacity <= 0) return null;
  const steps = pts.length - 1;
  const t = progress * steps;
  const k = Math.min(steps, Math.floor(t));
  const shown = pts.slice(0, k + 1).map(g);
  if (k < steps) {
    const [a, b] = [g(pts[k]), g(pts[k + 1])];
    const u = t - k;
    shown.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  const head = shown[shown.length - 1];
  return (
    <g opacity={opacity}>
      <polyline points={shown.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={head[0]} cy={head[1]} r={16} fill={color} />
    </g>
  );
};

/** Arrows into spot (x, o): from the left (an X step) and from above (an O step). */
const Into: React.FC<{ g: (p: Pt) => Pt; x: number; o: number; left: boolean; above: boolean; opacity: number }> = ({ g, x, o, left, above, opacity }) => {
  if (opacity <= 0) return null;
  const [cx, cy] = g([x, o]);
  const [lx] = g([x - 1, o]);
  const [, ay] = g([x, o - 1]);
  return (
    <g opacity={opacity}>
      {left && <Step a={[lx + R + 6, cy]} b={[cx - R - 8, cy]} label="" color={C.primary} opacity={1} />}
      {above && <Step a={[cx, ay + R + 6]} b={[cx, cy - R - 8]} label="" color={C.violet} opacity={1} />}
    </g>
  );
};

// ---------- scenes ----------

const SHUFFLE = ['XOXOXOXO', 'OXXOOXOX', 'XXOOOXXO', 'OOXXXOOX', 'XOOXOXXO', 'OXOXXOXO', 'XXXOOOOX', GOOD];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const settle = at(scene, 1);
  const k = f >= settle ? SHUFFLE.length - 1 : Math.min(SHUFFLE.length - 2, Math.floor(Math.max(0, f - 20) / 9));
  const how = cue(scene, 1, 'How many');
  return (
    <>
      <Text x={960} y={120} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        4 X tiles and 4 O tiles
      </Text>
      <Tiles x={960 - (8 * 118 - 14) / 2} y={270} s={SHUFFLE[k]} size={104} gap={14} on={seq(f, 6, 30)} />
      <Text x={960} y={440} w={1200} size={64} weight={900} align="center" color={C.muted} style={{ ...fadeUp(f, cue(scene, 0, 'seventy')), opacity: ease(f, cue(scene, 0, 'seventy'), 12) * fadeTo(f, settle) }}>
        70 ways to line them up
      </Text>
      <Text x={960} y={440} w={1400} size={64} weight={900} align="center" color={C.primary} style={fadeUp(f, settle + 8)}>
        X never falls behind…
      </Text>
      <Text x={960} y={540} w={1000} size={96} weight={900} align="center" color={C.violet} style={fadeUp(f, how)}>
        How many?
      </Text>
      <div style={{ position: 'absolute', left: 1330, top: 680, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['8', '14', '16', '20', '35'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 140, top: 170, width: 1640, background: C.card, borderRadius: 32, padding: '44px 56px', fontSize: 52, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box', ...fadeUp(f, 0) }}>
        Nora writes a string of <Mark on={at(scene, 1, 0.45)}>{'4 X’s and 4 O’s'}</Mark>.{' '}
        <Mark on={at(scene, 2, 0.2)}>Reading from left to right</Mark>,{' '}
        <Mark on={at(scene, 3, 0.15)}>at every point the number of X's so far is at least the number of O's so far</Mark>.{' '}
        <Mark on={at(scene, 4, 0.1)}>How many such strings are there?</Mark>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 826, height: 100 }}>
          <Choices x={0} y={0} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => cue(scene, 5, ['eight', 'fourteen', 'sixteen', 'twenty', 'thirty'][i])} />
        </div>
      </div>
    </>
  );
};

/** Running X and O counts under a string, revealed column by column. */
const Score: React.FC<{ x: number; y: number; s: string; cols: number; on: (i: number) => number; mark?: (i: number) => string | undefined; step: number }> = ({ x, y, s, cols, on, mark = () => undefined, step }) => {
  let xs = 0;
  let os = 0;
  const counts = s.split('').map((ch) => (ch === 'X' ? ++xs : ++os, [xs, os]));
  return (
    <>
      {['X', 'O'].map((lbl, r) => (
        <div key={lbl} style={{ position: 'absolute', left: x - 110, top: y + r * 64, fontSize: 52, fontWeight: 900, color: TILE[lbl], opacity: on(0) }}>
          {lbl}
        </div>
      ))}
      {counts.slice(0, cols).map((c, i) => {
        const m = mark(i);
        return (
          <div key={i} style={{ position: 'absolute', left: x + i * step, top: y - 6, width: step - 12, height: 128, borderRadius: 16, background: m ?? 'transparent', opacity: on(i), textAlign: 'center', fontSize: 52, fontWeight: 900, lineHeight: '64px' }}>
            <div style={{ color: C.ink }}>{c[0]}</div>
            <div style={{ color: C.ink }}>{c[1]}</div>
          </div>
        );
      })}
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X0 = 300;
  const STEP = 96;
  const good = seq(f, at(scene, 2, 0.15), at(scene, 2, 0.85));
  const bad = seq(f, at(scene, 4, 0.15), at(scene, 4, 0.45), 3);
  const ties = f >= at(scene, 3, 0.05);
  const badOut = f >= at(scene, 4, 0.45);
  return (
    <>
      <Tiles x={X0} y={190} s={GOOD} size={84} gap={12} on={(i) => ease(f, at(scene, 1, 0.3) + i * 3, 8)} />
      <Score x={X0} y={300} s={GOOD} cols={8} step={STEP} on={good} mark={(i) => (ties && (i === 5 || i === 7) ? 'rgba(245,159,10,0.22)' : undefined)} />
      <Tiles x={X0} y={490} s={BAD} size={84} gap={12} on={(i) => ease(f, at(scene, 4, 0.02) + i * 3, 8)} dim={(i) => badOut && i > 2} />
      <Score x={X0} y={600} s={BAD} cols={3} step={STEP} on={bad} mark={(i) => (badOut && i === 2 ? 'rgba(239,67,67,0.18)' : undefined)} />
      <Text x={1150} y={250} w={700} size={56} weight={900} color={C.green} style={fadeUp(f, at(scene, 3, 0.75))}>
        ✓ This one counts!
      </Text>
      <Text x={1150} y={335} w={700} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 3, 0.05))}>
        Ties are fine
      </Text>
      <Text x={720} y={600} w={1100} size={56} weight={900} color={C.red} style={fadeUp(f, cue(scene, 4, 'two to one'))}>
        ✗ O leads, 2 to 1. Out!
      </Text>
      <Pill x={720} y={700} color={C.primary} style={{ ...fadeUp(f, at(scene, 5, 0.3)), fontSize: 48 }}>
        Count strings where O never leads
      </Pill>
    </>
  );
};

const makePause = (lines: React.ReactNode[], seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={110} y={210} w={820} h={560} style={fadeUp(f, 0)}>
        {lines.map((l, i) => (
          <div key={i} style={{ position: 'absolute', left: 60, top: 60 + i * 120, fontSize: 56, fontWeight: 800, ...fadeUp(f, 6 + i * 5) }}>
            {l}
          </div>
        ))}
      </Card>
      <Countdown scene={scene} seconds={seconds} x={1380} y={480} tick={TICK} />
    </>
  );
};

const Rules: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const first = cue(scene, 1, 'The first letter');
  const last = at(scene, 3, 0.1);
  return (
    <>
      <Pill x={140} y={150} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.5)), fontSize: 46 }}>Make an organized list</Pill>
      {/* first letter */}
      <Card x={110} y={260} w={820} h={450} style={fadeUp(f, first)}>
        <div style={{ position: 'absolute', left: 50, top: 40, fontSize: 52, fontWeight: 900 }}>First letter:</div>
        <Tiles x={400} y={30} s="X" size={96} on={() => ease(f, first + 10, 10)} />
        <Text x={530} y={45} w={300} size={56} weight={900} color={C.green} style={fadeUp(f, first + 16)}>✓</Text>
        <Tiles x={50} y={170} s="O???????" size={76} gap={8} on={seq(f, at(scene, 2), at(scene, 2, 0.2))} ring={(i) => (i === 0 ? C.red : undefined)} />
        <div style={{ position: 'absolute', left: 50, top: 290, fontSize: 52, fontWeight: 900, color: C.red, ...fadeUp(f, cue(scene, 2, 'one to zero')) }}>
          ✗ O leads, 1 to 0
        </div>
      </Card>
      {/* last letter */}
      <Card x={990} y={260} w={820} h={450} style={fadeUp(f, last)}>
        <div style={{ position: 'absolute', left: 50, top: 40, fontSize: 52, fontWeight: 900 }}>Last letter:</div>
        <Tiles x={390} y={30} s="O" size={96} on={() => ease(f, last + 10, 10)} />
        <Text x={520} y={45} w={300} size={56} weight={900} color={C.green} style={fadeUp(f, last + 16)}>✓</Text>
        <Tiles x={50} y={170} s="???????X" size={76} gap={8} on={seq(f, at(scene, 4), at(scene, 4, 0.15))} ring={(i) => (i === 7 ? C.red : undefined)} />
        <div style={{ position: 'absolute', left: 50, top: 260, width: 580, height: 8, borderRadius: 4, background: C.red, ...fadeUp(f, cue(scene, 4, 'after seven')) }} />
        <div style={{ position: 'absolute', left: 50, top: 285, fontSize: 48, fontWeight: 900, color: C.red, ...fadeUp(f, cue(scene, 4, 'the O count')) }}>
          O count 4, X count 3
        </div>
        <div style={{ position: 'absolute', left: 50, top: 355, fontSize: 52, fontWeight: 900, color: C.red, ...fadeUp(f, cue(scene, 4, 'O would lead')) }}>
          ✗ O leads!
        </div>
      </Card>
    </>
  );
};

const LTILE = 67; // letters 48 px
const LGAP = 5;
const LROW = 80;
// [group, column x, header y] — group 4 and 3 share the first column.
const COLS: [number, number, number][] = [
  [4, 60, 170],
  [3, 60, 380],
  [2, 670, 170],
  [1, 1280, 170],
];

const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const total = at(scene, 5, 0.05);
  return (
    <>
      {COLS.map(([k, x, y], gi) => {
        const line = gi + 1;
        const head = gi === 0 ? at(scene, 0, 0.5) + gi * 6 : at(scene, line, 0.02);
        const strs = GROUPS[k];
        const a = gi === 0 ? at(scene, 1, 0.55) : gi === 1 ? at(scene, 2, 0.2) : at(scene, line, 0.35);
        const b = gi === 0 ? a : gi === 1 ? at(scene, 2, 0.7) : at(scene, line, 0.85);
        const counted = gi === 0 ? cue(scene, 1, 'just one') : gi === 1 ? cue(scene, 2, "That's three") : cue(scene, line, gi === 2 ? 'five strings' : 'Five more');
        return (
          <div key={k}>
            <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, Math.min(head, at(scene, 0, 0.6) + gi * 6)) }}>
              <span style={{ fontSize: 48, fontWeight: 900 }}>
                {k} X tile{k > 1 ? 's' : ''} first
              </span>
              <span style={{ background: C.primary, color: '#fff', borderRadius: 999, padding: '2px 26px', fontSize: 52, fontWeight: 900, opacity: ease(f, counted, 10) }}>{strs.length}</span>
            </div>
            {strs.map((s, j) => {
              const t = strs.length === 1 ? a : a + ((b - a) * j) / (strs.length - 1);
              const p = ease(f, t, 10);
              return (
                <div key={s} style={{ position: 'absolute', left: x, top: y + 75 + j * LROW, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
                  <Tiles x={0} y={0} s={s} size={LTILE} gap={LGAP} ring={(i) => (k === 3 && i >= 4 && s[i] === 'X' ? C.amber : undefined)} />
                  {/* underline: the X's before the first O, plus that O */}
                  <div style={{ position: 'absolute', left: 0, top: LTILE + 4, width: (k + 1) * (LTILE + LGAP) - LGAP, height: 6, borderRadius: 3, background: C.amber, opacity: 0.8 }} />
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', ...fadeUp(f, total) }}>
        <Tex tex="1 + 3 + 5 + 5 = \mathbf{14}" size={76} color={C.green} />
      </div>
      <Chime at={at(scene, 5, 0.97)} />
      <Pill x={110} y={720} color={C.amber} style={{ ...fadeUp(f, at(scene, 6, 0.55)), fontSize: 44 }}>Lists grow fast!</Pill>
    </>
  );
};

const GW = makeGrid(250, 230, 130); // the 4 × 4 walk grid, top-left spot at (250, 230)
const RP = 1030; // right panel x

const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const goodA = at(scene, 2, 0.35);
  const goodB = at(scene, 2, 0.95);
  const goodP = interpolate(f, [goodA, goodB], [0, 1], clamp);
  const badA = at(scene, 4, 0.1);
  const badP = interpolate(f, [badA, at(scene, 4, 0.6)], [0, 1], clamp);
  const wall = ease(f, cue(scene, 3, 'So the walk'), 14);
  const corner = ease(f, cue(scene, 5, 'to this corner'), 12);
  const goodSeen = (i: number) => (goodP * 8 > i ? 1 : 0.25);
  return (
    <>
      <Stage>
        <WalkGrid nx={4} no={4} g={GW} wall={wall} start={at(scene, 0, 0.4)} corner={corner} />
        <WalkPath pts={walk(GOOD)} g={GW} progress={goodP} color={C.primary} opacity={fadeTo(f, badA, 0.25) * (1 - ease(f, at(scene, 5), 12)) + ease(f, at(scene, 5), 12)} />
        <WalkPath pts={walk(BAD).slice(0, 4)} g={GW} progress={badP} color={C.red} opacity={fadeTo(f, at(scene, 5), 0)} />
        <XMark at={GW([1, 2])} size={70} opacity={ease(f, cue(scene, 4, 'right here'), 8) * fadeTo(f, at(scene, 5), 0)} />
        {/* start marker */}
        <g opacity={ease(f, at(scene, 1, 0.05), 10)}>
          <text x={GW([0, 0])[0]} y={GW([0, 0])[1] - 72} fontFamily={NUNITO} fontSize={44} fontWeight={900} fill={C.ink} textAnchor="middle">start</text>
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: RP, top: 200, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, cue(scene, 1, 'Each X')) }}>
        <Tiles x={0} y={0} s="X" size={84} style={{ position: 'relative' }} />
        <span style={{ fontSize: 52, fontWeight: 900 }}>step right →</span>
      </div>
      <div style={{ position: 'absolute', left: RP, top: 310, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, cue(scene, 1, 'Each O')) }}>
        <Tiles x={0} y={0} s="O" size={84} style={{ position: 'relative' }} />
        <span style={{ fontSize: 52, fontWeight: 900 }}>step down ↓</span>
      </div>
      <Tiles x={RP} y={460} s={GOOD} size={76} gap={10} on={(i) => ease(f, at(scene, 2, 0.05), 10) * (f < goodA ? 1 : goodSeen(i))} />
      <Tiles x={RP} y={580} s={BAD} size={76} gap={10} on={(i) => ease(f, badA, 10) * fadeTo(f, at(scene, 5), 0) * (i < 3 ? 1 : 0.25)} ring={(i) => (i === 2 && f > cue(scene, 4, 'right here') ? C.red : undefined)} />
      <Text x={RP} y={700} w={860} size={52} weight={900} color={C.red} style={{ ...fadeUp(f, wall > 0 ? cue(scene, 3, 'So the walk') + 10 : 1e9), opacity: wall * fadeTo(f, at(scene, 5), 0) }}>
        Never step below the wall!
      </Text>
      <Text x={RP} y={700} w={860} size={52} weight={900} color={C.amber} style={fadeUp(f, corner > 0 ? cue(scene, 5, 'So let') : 1e9)}>
        Count the walks to the corner
      </Text>
    </>
  );
};

type Calc = { x: number; o: number; tex?: string; start: number; value: number; left: boolean; above: boolean };

const Fill: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const v = (x: number, o: number) => T44[`${x},${o}`];
  const ones = cue(scene, 1, 'So we write ones');
  const c = (line: number, phrase: string, valuePhrase: string, x: number, o: number, tex: string, left = true): Calc => ({
    x, o, tex, start: cue(scene, line, phrase), value: cue(scene, line, valuePhrase), left, above: true,
  });
  const calcs: Calc[] = [
    { x: 2, o: 1, start: cue(scene, 2, 'a step from the left'), value: Infinity, left: true, above: true },
    c(4, 'We just copy', 'copy the one', 1, 1, '\\text{copy } 1', false),
    c(5, 'one plus one', 'is two', 2, 1, '1 + 1 = 2'),
    c(5, 'Two plus one', 'is three', 3, 1, '2 + 1 = 3'),
    c(5, 'Three plus one', 'is four', 4, 1, '3 + 1 = 4'),
    c(6, 'Copy the two', 'the two', 2, 2, '\\text{copy } 2', false),
    c(6, 'Two plus three', 'is five', 3, 2, '2 + 3 = 5'),
    c(6, 'Five plus four', 'is nine', 4, 2, '5 + 4 = 9'),
    c(7, 'copy the five', 'the five', 3, 3, '\\text{copy } 5', false),
    c(7, 'five plus nine', 'is fourteen', 4, 3, '5 + 9 = 14'),
    c(8, 'And the corner', 'copies the fourteen', 4, 4, '\\text{copy } 14', false),
  ];
  const cur = [...calcs].reverse().find((k) => f >= k.start);
  const nodes: Node[] = [
    ...range(5).map((x) => ({ x, o: 0, v: 1, at: ones + x * 5 })),
    ...calcs.filter((k) => k.tex).map((k) => ({ x: k.x, o: k.o, v: v(k.x, k.o), at: k.value })),
  ];
  const doneAt = at(scene, 8, 0.97);
  const arrowsOut = at(scene, 8, 0.6);
  return (
    <>
      <Stage>
        <WalkGrid nx={4} no={4} g={GW} wall={1} nodes={nodes} corner={ease(f, at(scene, 8), 12)} />
        {cur && <Into g={GW} x={cur.x} o={cur.o} left={cur.left} above={cur.above} opacity={ease(f, cur.start, 8) * fadeTo(f, arrowsOut)} />}
      </Stage>
      <Text x={RP} y={170} w={860} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.2))}>
        each spot = walks that reach it
      </Text>
      <div style={{ position: 'absolute', left: RP, top: 260, ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <Tex tex="\text{spot} = {\color{#0cc281}\text{left}} + {\color{#7b61ff}\text{above}}" size={60} />
      </div>
      <Text x={RP} y={360} w={860} size={48} weight={800} color={C.red} style={fadeUp(f, at(scene, 4, 0.05))}>
        On the wall: copy the one above
      </Text>
      {cur?.tex && (
        <div key={cur.tex} style={{ position: 'absolute', left: RP, top: 470, ...fadeUp(f, cur.start, 8), opacity: ease(f, cur.start, 8) * fadeTo(f, arrowsOut + 10) }}>
          <Tex tex={cur.tex} size={84} />
        </div>
      )}
      <Text x={RP} y={480} w={700} size={56} weight={900} color={C.green} style={fadeUp(f, cue(scene, 8, 'Fourteen walks'))}>
        14 walks = 14 strings
      </Text>
      <Answer x={1740} y={700} value="14" chime={CHIME} start={doneAt} />
      <Confetti x={1740} y={700} start={doneAt} seed={7} />
      <Pill x={RP} y={600} color={C.amber} style={{ ...fadeUp(f, at(scene, 9, 0.5)), fontSize: 44 }}>Long list? Build a table!</Pill>
    </>
  );
};

// Trap rows in choice order A–E; `line` = the narration line that explains it.
const TRAPS: { v: string; line: number; note: React.ReactNode }[] = [
  { v: '8', line: 4, note: <>Too few. The list found <Tex tex="14" size={50} />.</> },
  { v: '14', line: 0, note: 'Correct!' },
  { v: '16', line: 3, note: <>Guessed <Tex tex="1, 3, 5, 7" size={50} />. Really <Tex tex="1, 3, 5, 5" size={50} />.</> },
  { v: '20', line: 2, note: <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}>Starts X, ends O, middle unchecked: <Tiles x={0} y={0} s={BAD} size={67} gap={6} style={{ position: 'relative' }} ring={(i) => (i === 2 ? C.red : undefined)} /></span> },
  { v: '35', line: 1, note: <>Half of all <Tex tex="70" size={50} /> strings. The good ones are NOT half.</> },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      {TRAPS.map((t, i) => {
        const right = t.v === '14';
        const on = right ? at(scene, 0, 0.5) : at(scene, t.line, 0.1);
        const col = right ? C.green : C.red;
        const shown = f >= on;
        return (
          <div key={t.v} style={{ position: 'absolute', left: 120, top: 160 + i * 108, display: 'flex', alignItems: 'center', gap: 36, ...fadeUp(f, 6 + i * 5) }}>
            <div style={{ width: 170, height: 90, background: C.card, borderRadius: 22, border: `6px solid ${shown ? col : 'transparent'}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, boxShadow: '0 6px 18px rgba(30,40,80,0.07)' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: C.muted }}>{'ABCDE'[i]}</span>
              <span style={{ fontSize: 60, fontWeight: 900, color: shown ? col : C.ink }}>{t.v}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 48, fontWeight: 800, color: right ? C.green : C.ink, whiteSpace: 'nowrap', ...fadeUp(f, on + 6) }}>
              <span style={{ color: col }}>{right ? '✓' : '✗'}</span>
              <span style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>{t.note}</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 260, top: 720, width: 1400, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 50, fontWeight: 900, boxSizing: 'border-box', ...fadeUp(f, at(scene, 5, 0.3)) }}>
        Count in a clear order. Check the rule at EVERY step!
      </div>
    </>
  );
};

const GV = makeGrid(1150, 330, 120); // the variant's 5 × 3 grid

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Text x={120} y={300} w={900} size={56} weight={900} style={fadeUp(f, at(scene, 1, 0.3))}>
        <span style={{ color: C.primary }}>X five times</span>, <span style={{ color: C.violet }}>O three times</span>
      </Text>
      <Text x={120} y={410} w={900} size={52} weight={800} style={fadeUp(f, at(scene, 2, 0.1))}>
        At every point: X count ≥ O count
      </Text>
      <Text x={120} y={500} w={900} size={52} weight={800} style={fadeUp(f, at(scene, 3, 0.05))}>
        How many strings now?
      </Text>
      <Pill x={120} y={620} color={C.amber} style={fadeUp(f, cue(scene, 3, 'Use the table'))}>Use the table!</Pill>
      <Stage>
        <WalkGrid nx={5} no={3} g={GV} wall={1} start={at(scene, 1, 0.5)} corner={ease(f, at(scene, 3), 12)} r={40} font={48} />
      </Stage>
    </>
  );
};

const GVA = makeGrid(200, 260, 130);

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const v = (x: number, o: number) => T53[`${x},${o}`];
  const old = at(scene, 1, 0.3);
  const steps = [
    { o: 1, tex: '4 + 1 = 5', start: cue(scene, 3, 'four plus one'), value: cue(scene, 3, 'is five') },
    { o: 2, tex: '9 + 5 = 14', start: cue(scene, 3, 'Nine plus five'), value: cue(scene, 3, 'is fourteen') },
    { o: 3, tex: '14 + 14 = 28', start: cue(scene, 4, 'fourteen plus'), value: at(scene, 4, 0.9) },
  ];
  const nodes: Node[] = [
    ...range(4).flatMap((o) => range(5).filter((x) => o <= x).map((x) => ({ x, o, v: v(x, o), at: old + (x + o) * 3 }))),
    { x: 5, o: 0, v: 1, at: cue(scene, 2, 'The top spot') + 10 },
    ...steps.map((s) => ({ x: 5, o: s.o, v: v(5, s.o), at: s.value })),
  ];
  const cur = [...steps].reverse().find((s) => f >= s.start);
  const doneAt = at(scene, 4, 0.97);
  return (
    <>
      <Stage>
        <g opacity={ease(f, at(scene, 2, 0.1), 12) * fadeTo(f, at(scene, 5))}>
          <rect x={GVA([4.5, 0])[0]} y={GVA([0, -0.5])[1]} width={130} height={4 * 130} rx={30} fill={C.amber} opacity={0.14} />
        </g>
        <WalkGrid nx={5} no={3} g={GVA} wall={1} nodes={nodes} corner={ease(f, at(scene, 0, 0.5), 12)} />
        {cur && <Into g={GVA} x={5} o={cur.o} left above opacity={ease(f, cur.start, 8) * fadeTo(f, doneAt)} />}
      </Stage>
      <Text x={1080} y={180} w={800} size={52} weight={900} style={fadeUp(f, at(scene, 0, 0.3))}>
        <span style={{ color: C.primary }}>5 steps right</span>, <span style={{ color: C.violet }}>3 down</span>
      </Text>
      <Text x={1080} y={270} w={800} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.2))}>
        5 columns same, 1 row fewer
      </Text>
      <Text x={1080} y={340} w={800} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 2, 0.1))}>
        new column: top spot is 1
      </Text>
      {steps.map((s, i) => (
        <Eq key={s.o} x={1080} y={440 + i * 95} tex={s.tex} start={s.start} size={64} color={i === 2 ? C.green : C.ink} />
      ))}
      <Answer x={1700} y={640} value="28" chime={CHIME} start={doneAt} />
      <Confetti x={1700} y={640} start={doneAt} seed={11} />
      <Pill x={1080} y={740} color={C.primary} style={fadeUp(f, at(scene, 5, 0.1))}>Amazing work!</Pill>
    </>
  );
};

const GR = makeGrid(1240, 290, 100);

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  const all: Node[] = range(5).flatMap((o) => range(5).filter((x) => o <= x).map((x) => ({ x, o, v: T44[`${x},${o}`], at: -100 })));
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 160, width: 1680, height: 620, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 56, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 150, width: 900, fontSize: 60, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Turn each string into a walk. Never cross the wall.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 330, width: 900, fontSize: 52, fontWeight: 800, lineHeight: 1.3, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Fill a table: each spot adds the ways in from the <span style={{ color: C.primary }}>left</span> and from <span style={{ color: C.violet }}>above</span>.
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.3), 14) * cardOut}>
          <WalkGrid nx={4} no={4} g={GR} wall={1} r={40} font={48} nodes={all.map((n) => ({ ...n, at: at(scene, 2, 0.4) + (n.x + n.o) * 3 }))} />
          <WalkPath pts={walk(GOOD)} g={GR} progress={interpolate(f, [at(scene, 1, 0.3), at(scene, 1, 0.9)], [0, 1], clamp)} color={C.primary} opacity={fadeTo(f, at(scene, 2, 0.3), 0)} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} text="Keep counting!" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause([<>4 X's and 4 O's</>, <>X count ≥ O count,</>, <>at every point.</>, <span style={{ color: C.primary }}>How many strings?</span>], 10),
  rules: Rules,
  list: List,
  walk: Walk,
  fill: Fill,
  traps: Traps,
  variant: Variant,
  try2: makePause([<>5 X's and 3 O's</>, <>X count ≥ O count,</>, <>at every point.</>, <span style={{ color: C.amber }}>Use the table!</span>], 12),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

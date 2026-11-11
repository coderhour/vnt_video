import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, Step, XMark, type Pt } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti } from '../../lib/ui';
const atBase = at;
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-domino-tromino-2x6';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------------------------------------------------------------- board geometry
// Cells are [row, col]. Row 0 is the TOP row, col 0 the LEFT column (screen coordinates, y grows down).
export type RC = [number, number];
export type Org = { ox: number; oy: number; u: number };
export const O = (ox: number, oy: number, u: number): Org => ({ ox, oy, u });
const cellXY = (o: Org, [r, c]: RC): Pt => [o.ox + (c + 0.5) * o.u, o.oy + (r + 0.5) * o.u];
const centroid = (o: Org, cells: RC[]): Pt => {
  const pts = cells.map((c) => cellXY(o, c));
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
};
export const board = (cols: number, c0 = 0): RC[] => range(cols).flatMap((i) => [[0, c0 + i], [1, c0 + i]] as RC[]);

export type Kind = 'D' | 'L' | 'S';
const FILL: Record<Kind, string> = { D: C.primary, L: C.violet, S: C.amber };
const EDGE: Record<Kind, string> = { D: '#078a5b', L: '#4f35d6', S: '#b87400' };

/** Outline polygon (clockwise on screen, grid units [col,row]) of a set of cells; collinear points removed. */
const outline = (cells: RC[]): Pt[] => {
  const all: [Pt, Pt][] = [];
  for (const [r, c] of cells) all.push([[c, r], [c + 1, r]], [[c + 1, r], [c + 1, r + 1]], [[c + 1, r + 1], [c, r + 1]], [[c, r + 1], [c, r]]);
  const has = new Set(all.map(([a, b]) => `${a}>${b}`));
  const keep = all.filter(([a, b]) => !has.has(`${b}>${a}`));
  const next = new Map(keep.map(([a, b]) => [`${a}`, b] as [string, Pt]));
  const start = keep[0][0];
  const pts: Pt[] = [start];
  let cur = next.get(`${start}`)!;
  while (`${cur}` !== `${start}`) {
    pts.push(cur);
    cur = next.get(`${cur}`)!;
  }
  const n = pts.length;
  return pts.filter((p, i) => {
    const a = pts[(i + n - 1) % n];
    const b = pts[(i + 1) % n];
    return !((a[0] === p[0] && p[0] === b[0]) || (a[1] === p[1] && p[1] === b[1]));
  });
};
/** Move every vertex of a clockwise rectilinear polygon inward by g (grid units). */
const inset = (pts: Pt[], g: number): Pt[] =>
  pts.map((p, i) => {
    const a = pts[(i + pts.length - 1) % pts.length];
    const b = pts[(i + 1) % pts.length];
    const n1 = [-Math.sign(p[1] - a[1]), Math.sign(p[0] - a[0])];
    const n2 = [-Math.sign(b[1] - p[1]), Math.sign(b[0] - p[0])];
    return [p[0] + g * (n1[0] + n2[0]), p[1] + g * (n1[1] + n2[1])] as Pt;
  });
const pathOf = (o: Org, cells: RC[], g: number) => 'M ' + inset(outline(cells), g).map(([x, y]) => `${o.ox + x * o.u} ${o.oy + y * o.u}`).join(' L ') + ' Z';

const win = (f: number, t0: number, t1?: number, d = 8) => ease(f, t0, d) * (t1 === undefined ? 1 : 1 - ease(f, t1, d));

// ---------------------------------------------------------------- tiles
export const Cells: React.FC<{ cells: RC[]; o: Org; opacity?: number; fill?: string; dashed?: boolean }> = ({ cells, o, opacity = 1, fill = '#fff', dashed }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      {cells.map(([r, c]) => (
        <rect key={`${r},${c}`} x={o.ox + c * o.u} y={o.oy + r * o.u} width={o.u} height={o.u} fill={fill} stroke="#c9cfdd" strokeWidth={Math.max(2, o.u * 0.03)} strokeDasharray={dashed ? '8 8' : undefined} />
      ))}
    </g>
  );

/** One tile = one shape. It snaps into its cells (pop in place, never travels between cells). */
export const Tile: React.FC<{ cells: RC[]; o: Org; kind: Kind; t0: number; t1?: number; ghost?: boolean; bad?: boolean; opacity?: number }> = ({ cells, o, kind, t0, t1, ghost, bad, opacity = 1 }) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1) * opacity;
  if (a <= 0) return null;
  const [cx, cy] = centroid(o, cells);
  const s = 0.9 + 0.1 * ease(f, t0, 8);
  const col = bad ? C.red : FILL[kind];
  return (
    <g opacity={a} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
      <path
        d={pathOf(o, cells, 0.045)}
        fill={col}
        fillOpacity={ghost ? 0.14 : 0.72}
        stroke={ghost || bad ? col : EDGE[kind]}
        strokeWidth={Math.max(3, o.u * 0.05)}
        strokeLinejoin="round"
        strokeDasharray={ghost ? `${o.u * 0.12} ${o.u * 0.1}` : undefined}
      />
    </g>
  );
};

type TileSpec = { cells: RC[]; kind: Kind; t0: number; t1?: number };
export const Tiles: React.FC<{ list: TileSpec[]; o: Org; opacity?: number }> = ({ list, o, opacity }) => (
  <>
    {list.map((t, i) => (
      <Tile key={i} {...t} o={o} opacity={opacity} />
    ))}
  </>
);

/** Dashed soft outline round a set of empty cells. */
export const Region: React.FC<{ cells: RC[]; o: Org; t0: number; t1?: number; color?: string }> = ({ cells, o, t0, t1, color = C.ink }) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1, 10);
  if (a <= 0) return null;
  const d = pathOf(o, cells, 0.02);
  return (
    <g opacity={a}>
      <path d={d} fill={color} fillOpacity={0.07} />
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray="14 10" strokeLinejoin="round" strokeOpacity={0.75} />
    </g>
  );
};

export const HiCell: React.FC<{ cell: RC; o: Org; t0: number; t1?: number; color?: string }> = ({ cell, o, t0, t1, color = C.amber }) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1, 6);
  if (a <= 0) return null;
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin((f - t0) / 7));
  return (
    <rect x={o.ox + cell[1] * o.u + 4} y={o.oy + cell[0] * o.u + 4} width={o.u - 8} height={o.u - 8} fill={color} fillOpacity={0.28 * pulse} stroke={color} strokeWidth={Math.max(5, o.u * 0.07)} opacity={a} rx={6} />
  );
};

const Badge: React.FC<{ p: Pt; ok: boolean; t0: number; t1?: number; r?: number }> = ({ p, ok, t0, t1, r = 26 }) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1, 6);
  if (a <= 0) return null;
  const col = ok ? C.green : C.red;
  return (
    <g opacity={a} transform={`translate(${p[0]} ${p[1]}) scale(${0.6 + 0.4 * a})`}>
      <circle r={r} fill={col} stroke="#fff" strokeWidth={4} />
      {ok ? (
        <path d={`M ${-r * 0.45} 0 L ${-r * 0.1} ${r * 0.38} L ${r * 0.5} ${-r * 0.35}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={`M ${-r * 0.4} ${-r * 0.4} L ${r * 0.4} ${r * 0.4} M ${r * 0.4} ${-r * 0.4} L ${-r * 0.4} ${r * 0.4}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};

/** The zigzag: an L, k lying dominoes alternating rows, then a closing L. Length k + 3. */
export const zig = (k: number, flip = false, t0 = 0, dt = 4): TileSpec[] => {
  const F = (r: number) => (flip ? 1 - r : r);
  const out: Omit<TileSpec, 't0'>[] = [{ kind: 'L', cells: [[0, 0], [1, 0], [0, 1]] }];
  for (let j = 0; j < k; j++) {
    const row = j % 2 === 0 ? 1 : 0;
    out.push({ kind: 'D', cells: [[row, 1 + j], [row, 2 + j]] });
  }
  const cb = 1 + k;
  const rb = k % 2 === 0 ? 1 : 0;
  out.push({ kind: 'L', cells: [[rb, cb], [rb, cb + 1], [1 - rb, cb + 1]] });
  return out.map((t, i) => ({ ...t, cells: t.cells.map(([r, c]) => [F(r), c] as RC), t0: t0 + i * dt }));
};
export const LBOX = (r0: number, c0: number, missing: 'br' | 'bl' | 'tl' | 'tr'): RC[] => {
  const miss: RC = { br: [r0 + 1, c0 + 1], bl: [r0 + 1, c0], tl: [r0, c0], tr: [r0, c0 + 1] }[missing] as RC;
  return ([[r0, c0], [r0, c0 + 1], [r0 + 1, c0], [r0 + 1, c0 + 1]] as RC[]).filter(([r, c]) => !(r === miss[0] && c === miss[1]));
};
export const DOM_V = (c: number, r0 = 0): RC[] => [[r0, c], [r0 + 1, c]];
export const DOM_H = (r: number, c: number): RC[] => [[r, c], [r, c + 1]];
/** A dominoes-only cover of the 2 x 6 board: standing, lying pair, lying pair, standing. */
export const DOM_COVER: RC[][] = [DOM_V(0), DOM_H(0, 1), DOM_H(1, 1), DOM_H(0, 3), DOM_H(1, 3), DOM_V(5)];

// ---------------------------------------------------------------- text bits
const Tag: React.FC<{ cx: number; y: number; t0: number; t1?: number; color?: string; bg?: string; size?: number; border?: boolean; children: React.ReactNode }> = ({
  cx, y, t0, t1, color = C.ink, bg = C.card, size = 42, border = true, children,
}) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1, 12);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: cx - 700, width: 1400, top: y, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
      <div style={{ background: bg, color, border: border ? `4px solid ${color}` : 'none', borderRadius: 999, padding: '6px 28px', fontSize: size, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>{children}</div>
    </div>
  );
};

const Tx: React.FC<{ x: number; y: number; w?: number; t0: number; t1?: number; size?: number; color?: string; weight?: number; align?: 'left' | 'center'; children: React.ReactNode }> = ({
  x, y, w = 900, t0, t1, size = 46, color = C.ink, weight = 800, align = 'left', children,
}) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1, 12);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: align === 'center' ? x - w / 2 : x, top: y, width: w, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight: 1.25, opacity: a, transform: `translateY(${(1 - a) * 18}px)` }}>
      {children}
    </div>
  );
};

const tc = (color: string, s: string) => `\\textcolor{${color}}{${s}}`;
const cP = C.primary;
const cB = C.blue;
const cV = C.violet;
const cA = C.amber;

type Piece = { tex: string; t: number; color?: string };
/** A line of maths built piece by piece on the voice. */
const Work: React.FC<{ x: number; y: number; pieces: Piece[]; size?: number; t1?: number; align?: 'left' | 'center'; gap?: number }> = ({ x, y, pieces, size = 60, t1, align = 'center', gap = 16 }) => {
  const f = useCurrentFrame();
  const o = t1 === undefined ? 1 : 1 - ease(f, t1, 10);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: align === 'center' ? x - 900 : x, width: align === 'center' ? 1800 : undefined, top: y, display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', gap, whiteSpace: 'nowrap', opacity: o }}>
      {pieces.map((p, i) => (
        <div key={i} style={fadeUp(f, p.t, 12)}>
          <Tex tex={p.tex} size={size} color={p.color ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- table
type TCell = { v: string; t: number; ph?: string; color?: string } | null;
type TRow = { label: string; cells: TCell[]; opacity?: number };
type TMark = { col: number; row: number; color: string; t0: number; t1?: number };
type TB = { x: number; y: number; labelW: number; colW: number; headH: number; rowH: number; n: number };
const tbX = (tb: TB, i: number) => tb.x + tb.labelW + i * tb.colW;
const tbBottom = (tb: TB, rows: number) => tb.y + tb.headH + rows * tb.rowH;

const Table: React.FC<{ tb: TB; heads: string[]; head?: string; headT: number; colT?: number[]; rows: TRow[]; marks?: TMark[]; t1?: number; size?: number }> = ({
  tb, heads, head = 'length', headT, colT, rows, marks = [], t1, size = 64,
}) => {
  const f = useCurrentFrame();
  const out = t1 === undefined ? 1 : 1 - ease(f, t1, 10);
  if (out <= 0) return null;
  const pad = 5;
  return (
    <div style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: tb.x, top: tb.y, width: tb.labelW - 16, height: tb.headH, fontSize: 38, fontWeight: 800, color: C.muted, display: 'flex', alignItems: 'center', ...fadeUp(f, headT) }}>{head}</div>
      {rows.map((r, ri) => (
        <div key={ri} style={{ position: 'absolute', left: tb.x, top: tb.y + tb.headH + ri * tb.rowH, width: tb.labelW - 16, height: tb.rowH, fontSize: 38, fontWeight: 800, color: C.muted, display: 'flex', alignItems: 'center', ...fadeUp(f, headT + 4) }}>
          {r.label}
        </div>
      ))}
      {heads.map((h, i) => {
        const ct = colT ? colT[i] : headT + i * 3;
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: tbX(tb, i) + pad, top: tb.y + pad, width: tb.colW - 2 * pad, height: tb.headH - 2 * pad, borderRadius: 14, background: '#e9ecf5', color: C.ink, fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, ct) }}>{h}</div>
            {rows.map((r, ri) => {
              const c = r.cells[i];
              const showV = c && f >= c.t;
              const s = c ? pop(f, c.t) : 1;
              return (
                <div key={ri} style={{ position: 'absolute', left: tbX(tb, i) + pad, top: tb.y + tb.headH + ri * tb.rowH + pad, width: tb.colW - 2 * pad, height: tb.rowH - 2 * pad, borderRadius: 14, background: C.card, border: `3px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, ct, 12) * (r.opacity ?? 1) }}>
                  {c && (
                    <span style={{ fontSize: size, fontWeight: 900, color: showV ? (c.color ?? C.ink) : C.muted, transform: showV ? `scale(${s})` : undefined, opacity: showV || c.ph ? 1 : 0 }}>
                      {showV ? c.v : c.ph}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      {marks.map((m, i) => {
        const a = win(f, m.t0, m.t1, 8);
        if (a <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: tbX(tb, m.col) + 1, top: tb.y + tb.headH + m.row * tb.rowH + 1, width: tb.colW - 2, height: tb.rowH - 2, borderRadius: 16, border: `8px solid ${m.color}`, opacity: a, boxSizing: 'border-box' }} />
        );
      })}
    </div>
  );
};

/** Brackets under table cells (a..b inclusive) with a stem, coloured like the term in the sum. */
type BGroup = { a: number; b: number; color: string; t0: number; t1?: number };
const Brackets: React.FC<{ tb: TB; rows: number; groups: BGroup[] }> = ({ tb, rows, groups }) => {
  const f = useCurrentFrame();
  const y0 = tbBottom(tb, rows) + 8;
  return (
    <Stage>
      {groups.map((g, i) => {
        const a = win(f, g.t0, g.t1, 8);
        if (a <= 0) return null;
        const x1 = tbX(tb, g.a) + 14;
        const x2 = tbX(tb, g.b + 1) - 14;
        const xm = (x1 + x2) / 2;
        return <path key={i} d={`M ${x1} ${y0} V ${y0 + 18} H ${x2} V ${y0} M ${xm} ${y0 + 18} V ${y0 + 46}`} stroke={g.color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={a} />;
      })}
    </Stage>
  );
};

// the sol1 table (shared by sol1-table, traps and recap)
export const W6 = [1, 1, 2, 5, 11, 24, 53];
const TBL: TB = { x: 60, y: 140, labelW: 190, colW: 215, headH: 70, rowH: 130, n: 7 };

const endOf = (s: Scene, i: number) => s.lines[i].from + s.lines[i].frames - 8;

// ---------------------------------------------------------------- shared small pieces
const PromptCard: React.FC<{ x: number; y: number; w: number; t0: number; size?: number; children: React.ReactNode }> = ({ x, y, w, t0, size = 46, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: size, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', ...fadeUp(f, t0) }}>{children}</div>
  );
};

const Fade: React.FC<{ t1?: number; t0?: number; children: React.ReactNode }> = ({ t1, t0, children }) => {
  const f = useCurrentFrame();
  const a = (t0 === undefined ? 1 : ease(f, t0, 10)) * (t1 === undefined ? 1 : 1 - ease(f, t1, 10));
  return a <= 0 ? null : <g opacity={a}>{children}</g>;
};

const Chips: React.FC<{ y: number; t0: (i: number) => number; red?: Record<number, number>; green?: Record<number, number>; x?: number; w?: number }> = ({ y, t0, red = {}, green = {}, x = 330, w = 190 }) => {
  const f = useCurrentFrame();
  const vals = ['13', '50', '53', '59', '117'];
  return (
    <>
      {vals.map((v, i) => {
        const r = red[i] !== undefined ? ease(f, red[i], 10) : 0;
        const g = green[i] !== undefined ? ease(f, green[i], 10) : 0;
        const col = r > 0 ? C.red : g > 0 ? C.green : C.ink;
        const bg = r > 0 ? 'rgba(239,67,67,0.12)' : g > 0 ? 'rgba(33,196,93,0.16)' : C.card;
        return (
          <div key={i} style={{ position: 'absolute', left: x + i * (w + 20), top: y, width: w, height: 84, boxSizing: 'border-box', borderRadius: 20, background: bg, border: `5px solid ${r > 0 || g > 0 ? col : 'transparent'}`, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', ...fadeUp(f, t0(i), 10) }}>
            <span style={{ color: C.muted, fontSize: 32, marginRight: 14 }}>{'ABCDE'[i]}</span>
            {v}
          </div>
        );
      })}
    </>
  );
};

// ================================================================= scenes

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const B = O(630, 330, 110);
  const gone = at(scene, 1, 0);
  const out = at(scene, 2, 0);
  const l1 = at(scene, 1, 0.12);
  return (
    <>
      <Stage>
        <g opacity={fadeTo(f, out, 0, 10)}>
          <Cells cells={board(6)} o={B} />
          <Tiles o={B} list={DOM_COVER.map((cells, i) => ({ cells, kind: 'D' as Kind, t0: at(scene, 0, 0.12 + i * 0.08), t1: gone }))} />
          <Tile cells={LBOX(0, 0, 'br')} o={B} kind="L" t0={l1} />
        </g>
      </Stage>
      <Tag cx={960} y={640} t0={at(scene, 0, 0.78)} t1={gone} color={C.primary} size={50}>dominoes only: 13 ways</Tag>
      <Tag cx={960} y={640} t0={at(scene, 1, 0.3)} t1={out} color={C.violet} size={50}>with L&apos;s: ? ways</Tag>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.05)) }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: C.muted }}>Hello, I&apos;m</div>
        <div style={{ fontFamily: PACIFICO, fontSize: 170, color: C.violet, lineHeight: 1.1 }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 14 }}>Dominoes and L-trominoes</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const B = O(1230, 170, 100);
  const S1 = O(1260, 440, 100);
  const S2 = O(1600, 420, 100);
  return (
    <>
      <PromptCard x={70} y={150} w={1000} t0={at(scene, 0, 0)}>
        <span>
          In how many ways can a <Tex tex="2\times 6" size={52} /> board be covered, with no gaps or overlaps,{' '}
        </span>
        <span style={{ opacity: ease(f, at(scene, 1, 0), 12) }}>
          using <Tex tex="1\times 2" size={52} /> dominoes and L-shaped trominoes made of three squares? Pieces may be turned.
        </span>
      </PromptCard>
      <Stage>
        <Fade t0={at(scene, 0, 0.2)}>
          <Cells cells={board(6)} o={B} />
        </Fade>
        <Fade t0={at(scene, 1, 0.5)}>
          <Tile cells={DOM_H(0, 0)} o={S1} kind="D" t0={at(scene, 1, 0.5)} />
          <Tile cells={LBOX(0, 0, 'br')} o={S2} kind="L" t0={at(scene, 1, 0.8)} />
        </Fade>
      </Stage>
      <Tx x={1260} y={650} w={250} size={38} color={C.primary} t0={at(scene, 1, 0.5)}>domino</Tx>
      <Tx x={1600} y={650} w={250} size={38} color={C.violet} t0={at(scene, 1, 0.8)}>L-tromino</Tx>
      <Choices x={300} y={735} start={(i) => at(scene, 2, 0.36 + i * 0.11)} items={['13', '50', '53', '59', '117']} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const B = O(150, 300, 110);
  const Dm = O(930, 245, 70);
  const Dm2 = O(1070, 275, 70);
  const Ts = ['br', 'bl', 'tl', 'tr'] as const;
  const Lo = (i: number) => O(920 + i * 200, 480, 70);
  const small = O(900, 690, 60);
  const dim = (t: number) => ease(f, t, 14);
  return (
    <>
      <Stage>
        <Cells cells={board(6)} o={B} />
        {/* dimension brackets */}
        <g stroke={C.primary} strokeWidth={6} strokeLinecap="round" fill="none" opacity={dim(at(scene, 0, 0.1))}>
          <path d={`M ${B.ox} ${B.oy - 30} V ${B.oy - 44} H ${B.ox + 6 * B.u} V ${B.oy - 30}`} />
          <path d={`M ${B.ox - 30} ${B.oy} H ${B.ox - 44} V ${B.oy + 2 * B.u} H ${B.ox - 30}`} />
        </g>
        <Fade t0={at(scene, 1, 0.05)}>
          <Tile cells={DOM_V(0)} o={Dm} kind="D" t0={at(scene, 1, 0.1)} />
          <Tile cells={DOM_H(0, 0)} o={Dm2} kind="D" t0={at(scene, 1, 0.2)} />
          {Ts.map((m, i) => (
            <g key={m}>
              <Cells cells={LBOX(0, 0, 'br').concat([[1, 1]]) as RC[]} o={Lo(i)} opacity={0.6 * ease(f, at(scene, 1, 0.35 + i * 0.1), 8)} fill="#f3f4f9" dashed />
              <Tile cells={LBOX(0, 0, m)} o={Lo(i)} kind="L" t0={at(scene, 1, 0.4 + i * 0.1)} />
            </g>
          ))}
        </Fade>
        <Fade t0={at(scene, 2, 0.35)}>
          <Cells cells={board(6)} o={small} />
          <Tiles o={small} list={DOM_COVER.map((cells, i) => ({ cells, kind: 'D' as Kind, t0: at(scene, 2, 0.4 + i * 0.05) }))} />
        </Fade>
      </Stage>
      <Tx x={B.ox + 3 * B.u} y={B.oy - 118} w={200} size={56} color={C.primary} align="center" t0={at(scene, 0, 0.1)}>6</Tx>
      <Tx x={B.ox - 100} y={B.oy + 70} w={80} size={56} color={C.primary} align="center" t0={at(scene, 0, 0.1)}>2</Tx>
      <Tag cx={B.ox + 3 * B.u} y={B.oy + 2 * B.u + 40} t0={at(scene, 0, 0.55)} color={C.primary} size={48}>12 squares</Tag>
      <Tx x={900} y={170} w={900} size={44} color={C.primary} t0={at(scene, 1, 0.05)}>domino: standing or lying</Tx>
      <Tx x={900} y={400} w={600} size={44} color={C.violet} t0={at(scene, 1, 0.3)}>L-tromino:</Tx>
      <Tag cx={1330} y={398} t0={at(scene, 1, 0.8)} color={C.violet} size={42}>4 turns</Tag>
      <Tx x={150} y={640} w={650} size={46} t0={at(scene, 2, 0.1)}>each square covered exactly once</Tx>
      <div style={{ position: 'absolute', left: 1290, top: 700, display: 'flex', alignItems: 'center', gap: 16, fontSize: 38, fontWeight: 800, ...fadeUp(f, at(scene, 2, 0.6)) }}>
        <svg width={54} height={54} viewBox="0 0 54 54">
          <circle cx={27} cy={27} r={27} fill={C.green} />
          <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        dominoes alone count too
      </div>
    </>
  );
};

const Pause: React.FC<{ scene: Scene; text: React.ReactNode; boardCols: number; tray?: boolean; chips?: boolean }> = ({ scene, text, boardCols, tray, chips }) => {
  const B = O(1100, tray ? 420 : 380, 90);
  return (
    <>
      <Countdown scene={scene} seconds={10} x={470} y={520} tick={TICK} />
      <PromptCard x={880} y={140} w={960} t0={4} size={44}>
        {text}
      </PromptCard>
      <Stage>
        <Cells cells={board(boardCols)} o={B} />
        {tray && (
          <>
            <Tile cells={DOM_H(0, 0)} o={O(950, 700, 60)} kind="D" t0={6} />
            <Tile cells={LBOX(0, 0, 'br')} o={O(1180, 680, 60)} kind="L" t0={9} />
            <Tile cells={[[0, 0], [0, 1], [1, 0], [1, 1]]} o={O(1400, 680, 60)} kind="S" t0={12} />
          </>
        )}
      </Stage>
      {chips && <Choices x={880} y={640} start={(i) => 8 + i * 4} items={['13', '50', '53', '59', '117']} />}
    </>
  );
};
const Try1: SceneComponent = ({ scene }) => (
  <Pause scene={scene} boardCols={6} chips text={<>Count the ways to cover a <Tex tex="2\times 6" size={50} /> board with dominoes and L-trominoes.</>} />
);
const Try2: SceneComponent = ({ scene }) => (
  <Pause scene={scene} boardCols={5} tray text={<>Cover a <Tex tex="2\times 5" size={50} /> board with dominoes, L-trominoes and <Tex tex="2\times 2" size={50} /> squares.</>} />
);

// ---------------------------------------------------------------- solution 1, the cases
const Sol1Cases: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const M = O(90, 320, 120);
  const out = a(6, 0);
  const rows: [string, number, string, string][] = [
    ['standing domino → 2 × 5 left', a(1, 0.7), C.primary, 'D'],
    ['lying pair → 2 × 4 left', a(2, 0.85), C.primary, 'D'],
    ['L → starts a zigzag', a(3, 0.85), C.violet, 'L'],
  ];
  const cols = (c0: number, c1: number): RC[] => board(c1 - c0 + 1, c0);
  const L1: RC[] = [[0, 0], [1, 0], [0, 1]];
  const L2: RC[] = [[0, 0], [1, 0], [1, 1]];
  const L3: RC[] = [[0, 0], [0, 1], [1, 1]];
  // mini zigzags (L6 / L7)
  const u = 60;
  const xs = [330, 570, 870, 1230];
  const oy = 230;
  const oy2 = 420;
  const Ym = (oy + 2 * u + oy2) / 2;
  const fs = a(7, 0.22);
  const s = Math.cos(ease(f, fs, 18) * Math.PI);
  const starts = [0.45, 0.6, 0.75, 0.88].map((t) => a(6, t));
  const chipX = [638, 1257, 960];
  const chipY = [650, 650, 750];
  const chips: [string, string, number][] = [
    ['standing → 1 shorter', C.primary, a(7, 0.62)],
    ['lying pair → 2 shorter', C.blue, a(7, 0.74)],
    ['zigzag (×2) → 3, 2, 1 or 0 left', C.violet, a(7, 0.86)],
  ];
  return (
    <>
      <Stage>
        <g opacity={fadeTo(f, out, 0, 10)}>
          <Cells cells={board(6)} o={M} />
          <HiCell cell={[0, 0]} o={M} t0={a(0, 0.25)} t1={a(1, 0.1)} color={C.amber} />
          {/* case 1 */}
          <Tile cells={DOM_V(0)} o={M} kind="D" t0={a(1, 0.35)} t1={a(2, 0.02)} />
          <Region cells={cols(1, 5)} o={M} t0={a(1, 0.6)} t1={a(2, 0.02)} />
          {/* case 2 */}
          <Tile cells={DOM_H(0, 0)} o={M} kind="D" t0={a(2, 0.08)} t1={a(3, 0.02)} />
          <Tile cells={DOM_V(0)} o={M} kind="D" ghost bad t0={a(2, 0.28)} t1={a(2, 0.4)} />
          <Tile cells={LBOX(0, 0, 'tl')} o={M} kind="L" ghost bad t0={a(2, 0.4)} t1={a(2, 0.52)} />
          <XMark at={cellXY(M, [0.5, 0] as unknown as RC)} opacity={win(f, a(2, 0.3), a(2, 0.4), 6)} />
          <XMark at={cellXY(M, [0.5, 0.5] as unknown as RC)} opacity={win(f, a(2, 0.42), a(2, 0.52), 6)} />
          <Tile cells={DOM_H(1, 0)} o={M} kind="D" t0={a(2, 0.55)} t1={a(3, 0.02)} />
          <Region cells={cols(2, 5)} o={M} t0={a(2, 0.8)} t1={a(3, 0.02)} />
          {/* case 3: the three L's containing the top-left square */}
          <Tile cells={L1} o={M} kind="L" t0={a(3, 0.15)} t1={a(3, 0.38)} />
          <Badge p={[M.ox + 0.5 * M.u, M.oy + M.u]} ok t0={a(3, 0.18)} t1={a(3, 0.38)} />
          <Tile cells={L2} o={M} kind="L" t0={a(3, 0.38)} t1={a(3, 0.62)} />
          <Badge p={[M.ox + 0.5 * M.u, M.oy + M.u]} ok t0={a(3, 0.41)} t1={a(3, 0.62)} />
          <Tile cells={L3} o={M} kind="L" t0={a(3, 0.62)} t1={a(4, 0.0)} />
          <HiCell cell={[1, 0]} o={M} t0={a(3, 0.72)} t1={a(4, 0.0)} color={C.red} />
          <Badge p={[M.ox + 1.2 * M.u, M.oy + 0.9 * M.u]} ok={false} t0={a(3, 0.75)} t1={a(4, 0.0)} />
          {/* the zigzag: good L #1, a lying domino, a second L */}
          <Tile cells={L1} o={M} kind="L" t0={a(4, 0.04)} />
          <HiCell cell={[1, 1]} o={M} t0={a(4, 0.2)} t1={a(4, 0.5)} />
          <Tile cells={DOM_H(1, 1)} o={M} kind="D" t0={a(4, 0.5)} />
          <HiCell cell={[0, 2]} o={M} t0={a(4, 0.64)} t1={a(5, 0.15)} />
          <Step a={cellXY(M, [1, 1])} b={cellXY(M, [0, 2])} label="" color={C.amber} opacity={win(f, a(4, 0.7), a(5, 0.12), 8)} />
          <Tile cells={[[0, 2], [0, 3], [1, 3]]} o={M} kind="L" t0={a(5, 0.18)} />
          <Region cells={board(4)} o={M} t0={a(5, 0.55)} color={C.violet} />
        </g>
        {/* L6: four zigzags, one of each length */}
        {[0, 1, 2, 3].map((k) => {
          const o = O(xs[k], oy, u);
          return (
            <g key={k}>
              <Cells cells={board(k + 3)} o={o} opacity={ease(f, starts[k], 10)} />
              <Tiles o={o} list={zig(k, false, starts[k], 4)} />
              {f >= fs && (
                <g transform={`translate(0 ${Ym}) scale(1 ${s}) translate(0 ${-Ym})`} opacity={ease(f, fs, 3)}>
                  <Cells cells={board(k + 3)} o={o} />
                  <Tiles o={o} list={zig(k, false, 0, 0)} />
                </g>
              )}
            </g>
          );
        })}
      </Stage>
      {/* case labels under the main board */}
      <Tag cx={450} y={600} t0={a(0, 0.35)} t1={a(1, 0.2)} size={44}>who covers this square?</Tag>
      <Tag cx={M.ox + 3.5 * M.u} y={600} t0={a(1, 0.65)} t1={a(2, 0.02)} color={C.primary} size={44}>2 × 5 left</Tag>
      <Tag cx={M.ox + 4 * M.u} y={600} t0={a(2, 0.82)} t1={a(3, 0.02)} color={C.primary} size={44}>2 × 4 left</Tag>
      <Tag cx={M.ox + 2 * M.u} y={600} t0={a(4, 0.72)} t1={a(5, 0.1)} color={C.amber} size={44}>the bump moves along</Tag>
      <Tag cx={M.ox + 2 * M.u} y={600} t0={a(5, 0.6)} t1={out} color={C.violet} size={44}>a zigzag, 4 long</Tag>
      {/* right-hand case strip */}
      {rows.map(([text, t, col], i) => (
        <div key={i} style={{ position: 'absolute', left: 860, top: 320 + i * 125, width: 960, height: 96, boxSizing: 'border-box', background: C.card, borderRadius: 24, borderLeft: `14px solid ${col}`, display: 'flex', alignItems: 'center', padding: '0 34px', fontSize: 46, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', opacity: win(f, t, out, 12), transform: `translateX(${(1 - ease(f, t, 12)) * 30}px)` }}>
          {text}
        </div>
      ))}
      {/* L6 / L7 labels */}
      {[0, 1, 2, 3].map((k) => (
        <div key={k}>
          <Tx x={xs[k] + ((k + 3) * u) / 2} y={160} w={300} size={48} color={C.violet} align="center" t0={starts[k]}>{k + 3} long</Tx>
          <Tag cx={xs[k] + ((k + 3) * u) / 2} y={oy2 + 2 * u + 28} t0={a(7, 0.55)} color={C.violet} size={46}>× 2</Tag>
        </div>
      ))}
      {chips.map(([text, col, t], i) => (
        <Tag key={i} cx={chipX[i]} y={chipY[i]} t0={t} color={col} size={48}>{text}</Tag>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- solution 1, the table
const Sol1Table: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const tb = TBL;
  const tT = [a(1, 0.72), a(2, 0.2), a(2, 0.9), a(4, 0.88), a(5, 0.9), a(6, 0.92), a(8, 0.6)];
  const cells: TCell[] = W6.map((v, i) => ({ v: String(v), t: tT[i], ph: '?', color: i === 6 ? C.green : undefined }));
  // sources for each length: [one shorter, two shorter, zigzag leftovers]
  const m = (n: number, line: number, ts: number[]): TMark[] => [
    { col: n - 1, row: 0, color: cP, t0: a(line, ts[0]), t1: a(line + 1, 0.0) },
    { col: n - 2, row: 0, color: cB, t0: a(line, ts[1]), t1: a(line + 1, 0.0) },
    ...range(n - 2).map((c) => ({ col: c, row: 0, color: cV, t0: a(line, ts[2]), t1: a(line + 1, 0.0) })),
  ];
  const marks: TMark[] = [
    { col: 6, row: 0, color: C.amber, t0: a(0, 0.5), t1: a(8, 0.58) },
    ...m(3, 4, [0.2, 0.34, 0.5]),
    ...m(4, 5, [0.14, 0.3, 0.5]),
    ...m(5, 6, [0.12, 0.28, 0.5]),
    ...m(6, 7, [0.12, 0.28, 0.5]),
  ];
  const groups = (n: number, line: number, ts: number[]): BGroup[] => [
    { a: n - 1, b: n - 1, color: cP, t0: a(line, ts[0]), t1: a(line + 1, 0) },
    { a: n - 2, b: n - 2, color: cB, t0: a(line, ts[1]), t1: a(line + 1, 0) },
    { a: 0, b: n - 3, color: cV, t0: a(line, ts[2]), t1: a(line + 1, 0) },
  ];
  const work = (line: number, p: [string, string, string, string | null], ts: number[], end = a(line + 1, 0)) => (
    <Work
      x={900}
      y={430}
      t1={end}
      pieces={[
        { tex: tc(cP, p[0]), t: a(line, ts[0]) },
        { tex: '+\\,' + tc(cB, p[1]), t: a(line, ts[1]) },
        { tex: '+\\,' + tc(cV, p[2]), t: a(line, ts[2]) },
        ...(p[3] ? [{ tex: '=\\,' + p[3], t: a(line, ts[3]) }] : []),
      ]}
    />
  );
  const L1 = O(260, 450, 80);
  const rule: [string, string][] = [['one shorter', cP], ['two shorter', cB], ['2 × (what the zigzags leave)', cV]];
  return (
    <>
      <Table tb={tb} heads={range(7).map(String)} headT={a(0, 0.05)} rows={[{ label: 'ways', cells }]} marks={marks} />
      <Brackets tb={tb} rows={1} groups={[...groups(3, 4, [0.2, 0.34, 0.5]), ...groups(4, 5, [0.14, 0.3, 0.5]), ...groups(5, 6, [0.12, 0.28, 0.5]), ...groups(6, 7, [0.12, 0.28, 0.5])]} />
      {/* L1: a zigzag filling 2 x 3 exactly */}
      <Stage>
        <Fade t0={a(1, 0.1)} t1={a(2, 0.0)}>
          <Cells cells={board(3)} o={L1} />
          <Tiles o={L1} list={zig(0, false, a(1, 0.15), 6)} />
        </Fade>
        {/* L2: length 1 and length 2 */}
        <Fade t0={a(2, 0.05)} t1={a(3, 0.0)}>
          <Cells cells={board(1)} o={O(260, 450, 80)} />
          <Tile cells={DOM_V(0)} o={O(260, 450, 80)} kind="D" t0={a(2, 0.08)} />
        </Fade>
        <Fade t0={a(2, 0.48)} t1={a(3, 0.0)}>
          <Cells cells={board(2)} o={O(480, 450, 80)} />
          <Tile cells={DOM_V(0)} o={O(480, 450, 80)} kind="D" t0={a(2, 0.5)} />
          <Tile cells={DOM_V(1)} o={O(480, 450, 80)} kind="D" t0={a(2, 0.55)} />
          <Cells cells={board(2)} o={O(800, 450, 80)} />
          <Tile cells={DOM_H(0, 0)} o={O(800, 450, 80)} kind="D" t0={a(2, 0.68)} />
          <Tile cells={DOM_H(1, 0)} o={O(800, 450, 80)} kind="D" t0={a(2, 0.74)} />
        </Fade>
      </Stage>
      <Tag cx={900} y={500} t0={a(1, 0.45)} t1={a(2, 0.0)} color={C.violet} size={46}>nothing left = 1 way</Tag>
      <Tag cx={300} y={625} t0={a(2, 0.3)} t1={a(3, 0.0)} color={C.primary} size={44}>1 way</Tag>
      <Tag cx={690} y={625} t0={a(2, 0.9)} t1={a(3, 0.0)} color={C.primary} size={44}>1 + 1 = 2 ways</Tag>
      <Tx x={680} y={473} w={100} size={46} color={C.muted} align="center" t0={a(2, 0.62)} t1={a(3, 0)}>or</Tx>
      {/* the rule, from line 3 on */}
      <div style={{ position: 'absolute', left: 90, top: 745, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...fadeUp(f, a(3, 0.05)) }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: C.muted }}>ways(n) =</span>
        {rule.map(([text, col], i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: ease(f, a(3, 0.2 + i * 0.2), 10) }}>
            {i > 0 && <span style={{ fontSize: 44, fontWeight: 900 }}>+</span>}
            <span style={{ background: C.card, color: col, border: `4px solid ${col}`, borderRadius: 18, padding: '4px 22px', fontSize: 40, fontWeight: 900 }}>{text}</span>
          </span>
        ))}
      </div>
      {work(4, ['2', '1', '2\\times 1', '5'], [0.22, 0.36, 0.52, 0.86])}
      {work(5, ['5', '2', '2\\times(1+1)', '11'], [0.16, 0.32, 0.52, 0.88])}
      {work(6, ['11', '5', '2\\times(2+1+1)', '24'], [0.14, 0.3, 0.52, 0.9])}
      {work(7, ['24', '11', '2\\times(5+2+1+1)', null], [0.14, 0.3, 0.52, 0], a(8, 0.3))}
      {/* L8 */}
      <Work
        x={850}
        y={540}
        pieces={[
          { tex: '=\\,' + tc(cP, '24'), t: a(8, 0.04) },
          { tex: '+\\,' + tc(cB, '11'), t: a(8, 0.2) },
          { tex: '+\\,' + tc(cV, '18'), t: a(8, 0.36) },
          { tex: '=\\,' + tc(C.green, '53'), t: a(8, 0.56) },
        ]}
      />
      <Work x={850} y={430} pieces={[{ tex: tc(cP, '24') + '+' + tc(cB, '11') + '+' + tc(cV, '2\\times 9'), t: a(8, 0.3) }]} />
      <Tag cx={850} y={655} t0={a(8, 0.3)} color={C.violet} size={48} border={false} bg="transparent">5 + 2 + 1 + 1 = 9, and 2 × 9 = 18</Tag>
      <Tag cx={1640} y={365} t0={endOf(scene, 8) - 10} color={C.green} bg="rgba(33,196,93,0.14)" size={44}>Choice C</Tag>
      <Answer x={1700} y={600} value="53" start={endOf(scene, 8) - 12} chime={CHIME} />
    </>
  );
};

// ---------------------------------------------------------------- solution 2, flat and bumpy
const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => (i === 0 ? at(scene, 0, 0.45 * t) : i === 1 ? at(scene, 0, 0.4 + 0.6 * t) : at(scene, i - 1, t));
  const Fl = O(250, 270, 100); // flat 2 x 4
  const Bu = O(1010, 270, 100); // bumpy: extra cell at col -1
  const Bu2 = O(520, 270, 110); // bumpy, L4/L5
  const Fl2 = O(250, 270, 110);
  const flatCells = board(4);
  const bumpCells: RC[] = [[0, -1] as RC, ...board(4)];
  const cols = (o: Org, c0: number, c1: number) => board(c1 - c0 + 1, c0);
  const tb: TB = { x: 60, y: 140, labelW: 190, colW: 215, headH: 70, rowH: 100, n: 7 };
  const flatRow: TCell[] = [1, 1, 2, 5, 11, 24, 53].map((v, i) => ({ v: String(v), t: i === 6 ? a(8, 0.78) : a(6, 0.0), ph: i === 6 ? '?' : undefined, color: i === 6 ? C.green : undefined }));
  const bump: (TCell)[] = [null, { v: '1', t: a(6, 0.32) }, { v: '2', t: a(6, 0.85) }, { v: '4', t: a(7, 0.38) }, { v: '9', t: a(7, 0.88) }, null, null];
  const marks: TMark[] = [
    { col: 1, row: 1, color: cP, t0: a(6, 0.62), t1: a(7, 0.0) },
    { col: 1, row: 0, color: cV, t0: a(6, 0.62), t1: a(7, 0.0) },
    { col: 2, row: 1, color: cP, t0: a(7, 0.14), t1: a(7, 0.6) },
    { col: 2, row: 0, color: cV, t0: a(7, 0.14), t1: a(7, 0.6) },
    { col: 3, row: 1, color: cP, t0: a(7, 0.62), t1: a(8, 0.0) },
    { col: 3, row: 0, color: cV, t0: a(7, 0.62), t1: a(8, 0.0) },
    { col: 5, row: 0, color: cP, t0: a(8, 0.1), t1: a(9, 0.0) },
    { col: 4, row: 0, color: cB, t0: a(8, 0.25), t1: a(9, 0.0) },
    { col: 4, row: 1, color: cV, t0: a(8, 0.42), t1: a(9, 0.0) },
  ];
  const tabT = a(6, 0.0);
  const flatRule = '\\text{flat}(n)=' + tc(cP, '\\text{flat}(n-1)') + '+' + tc(cB, '\\text{flat}(n-2)') + '+' + tc(cV, '2\\times\\text{bumpy}(n-2)');
  const bumpRule = '\\text{bumpy}(m)=' + tc(cP, '\\text{bumpy}(m-1)') + '+' + tc(cV, '\\text{flat}(m-1)');
  const toTable = a(6, 0.0);
  const swap = a(4, 0.0);
  const L2 = a(2, 0);
  const lone = [0, -1] as RC;
  return (
    <>
      <Stage>
        {/* L0-L1: flat and bumpy side by side; the flat one stays through L3, the bumpy one is back from L4 */}
        <Fade t1={swap}>
          <Fade t0={a(0, 0.1)}>
            <Cells cells={flatCells} o={Fl} />
          </Fade>
          <Fade t0={a(0, 0.3)} t1={L2}>
            <Cells cells={bumpCells} o={Bu} />
          </Fade>
          <HiCell cell={lone} o={Bu} t0={a(1, 0.25)} t1={L2} />
          <Fade t0={a(0, 0.5)} t1={L2}>
            <g stroke={C.muted} strokeWidth={5} fill="none" strokeLinecap="round">
              <path d={`M ${Fl.ox} ${Fl.oy + 2 * Fl.u + 24} v 14 h ${4 * Fl.u} v -14`} />
              <path d={`M ${Bu.ox} ${Bu.oy + 2 * Bu.u + 24} v 14 h ${4 * Bu.u} v -14`} />
            </g>
          </Fade>
          {/* L2: flat board, three starts */}
          <Tile cells={DOM_V(0)} o={Fl} kind="D" t0={a(2, 0.1)} t1={a(2, 0.3)} />
          <Region cells={cols(Fl, 1, 3)} o={Fl} t0={a(2, 0.14)} t1={a(2, 0.3)} />
          <Tiles o={Fl} list={[{ cells: DOM_H(0, 0), kind: 'D', t0: a(2, 0.3), t1: a(2, 0.55) }, { cells: DOM_H(1, 0), kind: 'D', t0: a(2, 0.33), t1: a(2, 0.55) }]} />
          <Region cells={cols(Fl, 2, 3)} o={Fl} t0={a(2, 0.34)} t1={a(2, 0.55)} />
          <Tile cells={[[0, 0], [1, 0], [1, 1]]} o={Fl} kind="L" t0={a(2, 0.55)} t1={a(3, 0.25)} />
          <Region cells={[[0, 1], ...cols(Fl, 2, 3)]} o={Fl} t0={a(2, 0.6)} t1={a(3, 0.25)} color={C.violet} />
          {/* L3: the mirror L */}
          <Tile cells={[[0, 0], [1, 0], [0, 1]]} o={Fl} kind="L" t0={a(3, 0.25)} />
          <Region cells={[[1, 1], ...cols(Fl, 2, 3)]} o={Fl} t0={a(3, 0.3)} color={C.violet} />
        </Fade>
        {/* L4-L5: the bumpy board */}
        <Fade t0={swap} t1={toTable}>
          <Cells cells={[[0, -1] as RC, ...board(4)]} o={Bu2} />
          <HiCell cell={lone} o={Bu2} t0={a(4, 0.12)} t1={a(4, 0.35)} />
          <Tile cells={[[0, -1], [0, 0]]} o={Bu2} kind="D" t0={a(4, 0.35)} t1={a(5, 0.02)} />
          <Region cells={[[1, 0], ...cols(Bu2, 1, 3)]} o={Bu2} t0={a(4, 0.62)} t1={a(5, 0.02)} color={C.amber} />
          <Tile cells={[[0, -1], [0, 0], [1, 0]]} o={Bu2} kind="L" t0={a(5, 0.1)} />
          <Region cells={cols(Bu2, 1, 3)} o={Bu2} t0={a(5, 0.3)} color={C.violet} />
        </Fade>
        {/* L6: the one-L bumpy board */}
        <Fade t0={a(6, 0.04)} t1={a(6, 0.62)}>
          <Cells cells={[[0, -1] as RC, [0, 0], [1, 0]]} o={O(420, 560, 100)} />
          <Tile cells={[[0, -1], [0, 0], [1, 0]]} o={O(420, 560, 100)} kind="L" t0={a(6, 0.1)} />
        </Fade>
      </Stage>
      {/* names and labels */}
      <Tx x={Fl.ox + 200} y={175} w={400} size={54} color={C.primary} align="center" t0={a(0, 0.15)} t1={swap}>flat</Tx>
      <Tx x={Bu.ox + 150} y={175} w={400} size={54} color={C.violet} align="center" t0={a(0, 0.35)} t1={L2}>bumpy</Tx>
      <Tx x={Fl.ox + 200} y={Fl.oy + 2 * Fl.u + 44} w={200} size={44} color={C.muted} align="center" t0={a(0, 0.55)} t1={L2}>m</Tx>
      <Tx x={Bu.ox + 200} y={Bu.oy + 2 * Bu.u + 44} w={200} size={44} color={C.muted} align="center" t0={a(0, 0.55)} t1={L2}>m</Tx>
      <Tx x={960} y={620} w={1700} size={46} align="center" t0={a(1, 0.25)} t1={L2}>bumpy m = flat 2 × m, plus 1 square on the left</Tx>
      <Tx x={960} y={690} w={1700} size={38} color={C.muted} align="center" t0={a(1, 0.6)} t1={L2}>(top or bottom: same count)</Tx>
      <Tx x={Bu.ox - 50} y={Bu.oy - 62} w={300} size={36} color={C.amber} align="center" t0={a(1, 0.3)} t1={L2}>the bump</Tx>

      <Tag cx={Fl.ox + 2 * Fl.u} y={Fl.oy + 2 * Fl.u + 30} t0={a(2, 0.18)} t1={a(2, 0.3)} color={C.primary} size={40}>flat, 1 shorter</Tag>
      <Tag cx={Fl.ox + 3 * Fl.u} y={Fl.oy + 2 * Fl.u + 30} t0={a(2, 0.38)} t1={a(2, 0.55)} color={C.primary} size={40}>flat, 2 shorter</Tag>
      <Tag cx={Fl.ox + 2 * Fl.u} y={Fl.oy + 2 * Fl.u + 30} t0={a(2, 0.66)} t1={swap} color={C.violet} size={40}>bumpy, 2 shorter</Tag>
      <Tx x={900} y={285} w={950} size={44} color={C.primary} t0={a(2, 0.22)} t1={swap}>domino start → flat board</Tx>
      <Tx x={900} y={365} w={950} size={44} color={C.violet} t0={a(2, 0.7)} t1={swap}>L start → bumpy, 2 shorter</Tx>
      <Tag cx={Fl.ox + 5.2 * Fl.u + 20} y={Fl.oy + 0.5 * Fl.u} t0={a(3, 0.5)} t1={swap} color={C.violet} size={50}>× 2</Tag>

      <Tx x={Bu2.ox + 220} y={175} w={500} size={54} color={C.violet} align="center" t0={swap} t1={toTable}>bumpy</Tx>
      <Tag cx={Bu2.ox + 2 * Bu2.u} y={Bu2.oy + 2 * Bu2.u + 30} t0={a(4, 0.66)} t1={a(5, 0.02)} color={C.amber} size={40}>bumpy, 1 shorter</Tag>
      <Tag cx={Bu2.ox + 2 * Bu2.u} y={Bu2.oy + 2 * Bu2.u + 30} t0={a(5, 0.34)} t1={toTable} color={C.violet} size={40}>flat, 1 shorter</Tag>
      <Tx x={1070} y={285} w={780} size={42} color={C.primary} t0={a(4, 0.5)} t1={toTable}>lying domino → bumpy, 1 shorter</Tx>
      <Tx x={1070} y={365} w={780} size={42} color={C.violet} t0={a(5, 0.4)} t1={toTable}>L → flat, 1 shorter</Tx>
      <Work x={960} y={595} t1={toTable} size={50} pieces={[{ tex: flatRule, t: a(3, 0.62) }]} />
      <Work x={960} y={690} t1={toTable} size={50} pieces={[{ tex: bumpRule, t: a(5, 0.55) }]} />

      {/* L6-L8: the two-row table */}
      <Table tb={tb} heads={range(7).map(String)} headT={tabT} rows={[{ label: 'flat', cells: flatRow, opacity: 0.8 }, { label: 'bumpy', cells: bump }]} marks={marks} />
      <Tag cx={900} y={620} t0={a(6, 0.12)} t1={a(6, 0.62)} color={C.violet} size={44}>bumpy 1 = 1 way</Tag>
      <Work x={800} y={450} align="left" size={56} t1={a(8, 0)} pieces={[{ tex: '\\text{bumpy }2=' + tc(cP, '1') + '+' + tc(cV, '1') + '=2', t: a(6, 0.7) }]} />
      <Work x={800} y={535} align="left" size={56} t1={a(8, 0)} pieces={[{ tex: '\\text{bumpy }3=' + tc(cP, '2') + '+' + tc(cV, '2') + '=4', t: a(7, 0.3) }]} />
      <Work x={800} y={620} align="left" size={56} t1={a(8, 0)} pieces={[{ tex: '\\text{bumpy }4=' + tc(cP, '4') + '+' + tc(cV, '5') + '=9', t: a(7, 0.8) }]} />
      <Work x={960} y={470} size={64} pieces={[{ tex: '\\text{flat}(6)=' + tc(cP, '24') + '+' + tc(cB, '11') + '+' + tc(cV, '2\\times 9'), t: a(8, 0.08) }, { tex: '=' + tc(C.green, '53'), t: a(8, 0.78) }]} />
      <Check x={560} y={600} start={a(8, 0.82)}>same answer</Check>
      <Tag cx={960} y={720} t0={a(9, 0.45)} color={C.violet} size={50}>long boards → two short rules</Tag>
    </>
  );
};

// ---------------------------------------------------------------- the traps
const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, Math.max(0, i - 1), t);
  const D = O(330, 270, 70);
  const small: TB = { x: 250, y: 470, labelW: 190, colW: 190, headH: 70, rowH: 110, n: 6 };
  const dv = [1, 2, 3, 5, 8, 13];
  const dT = [0.42, 0.52, 0.62, 0.72, 0.82, 0.93].map((t) => a(2, t));
  const big: TB = { x: 60, y: 290, labelW: 190, colW: 200, headH: 70, rowH: 120, n: 8 };
  const bigCells: TCell[] = [...W6, 117].map((v, i) => ({ v: String(v), t: i === 7 ? a(3, 0.55) : -5, ph: i === 7 ? '?' : undefined, color: i === 7 ? C.red : undefined }));
  const colT = range(8).map((i) => (i === 7 ? a(3, 0.3) : a(3, 0.02) + i * 2));
  const gone = a(5, 0);
  const marks: TMark[] = [
    { col: 7, row: 0, color: C.red, t0: a(3, 0.3), t1: gone },
    { col: 6, row: 0, color: cP, t0: a(4, 0.12), t1: gone },
    { col: 5, row: 0, color: cB, t0: a(4, 0.22), t1: gone },
    ...range(5).map((c) => ({ col: c, row: 0, color: cV, t0: a(4, 0.32), t1: gone })),
  ];
  const bB: TB = big;
  return (
    <>
      <Chips y={130} t0={(i) => 4 + i * 4} red={{ 0: a(1, 0.35), 4: a(3, 0.18), 1: a(5, 0.12), 3: a(5, 0.12) }} green={{ 2: a(5, 0.5) }} />
      {/* L1-L2: dominoes only */}
      <Stage>
        <Fade t0={a(1, 0.1)} t1={a(3, 0)}>
          <Cells cells={board(6)} o={D} />
          <Tiles o={D} list={DOM_COVER.map((cells, i) => ({ cells, kind: 'D' as Kind, t0: a(1, 0.15 + i * 0.07) }))} />
        </Fade>
      </Stage>
      <Tx x={820} y={300} w={800} size={46} color={C.red} t0={a(1, 0.5)} t1={a(3, 0)}>dominoes only: no L at all</Tx>
      <Table tb={small} heads={['1', '2', '3', '4', '5', '6']} headT={a(2, 0.05)} t1={a(3, 0)} rows={[{ label: 'dominoes', cells: dv.map((v, i) => ({ v: String(v), t: dT[i], color: i === 5 ? C.red : undefined })) }]} />
      <Tx x={250} y={720} w={1500} size={42} color={C.muted} t0={a(2, 0.93)} t1={a(3, 0)}>each number after the first two = the two before it, added</Tx>
      {/* L3-L4: one column too far */}
      <Table tb={big} heads={range(8).map(String)} headT={a(3, 0.02)} colT={colT} t1={gone} rows={[{ label: 'ways', cells: bigCells }]} marks={marks} />
      <Brackets tb={bB} rows={1} groups={[{ a: 6, b: 6, color: cP, t0: a(4, 0.12), t1: gone }, { a: 5, b: 5, color: cB, t0: a(4, 0.22), t1: gone }, { a: 0, b: 4, color: cV, t0: a(4, 0.32), t1: gone }]} />
      <Tag cx={bB.x + bB.labelW + 7.5 * bB.colW - 60} y={bB.y + bB.headH + bB.rowH + 36} t0={a(3, 0.62)} t1={gone} color={C.red} size={48}>2 × 7 board</Tag>
      <Work x={960} y={590} size={56} t1={gone} pieces={[{ tex: tc(cP, '53') + '+' + tc(cB, '24') + '+' + tc(cV, '2\\times(11+5+2+1+1)'), t: a(4, 0.1) }]} />
      <Work
        x={960}
        y={680}
        size={56}
        t1={gone}
        pieces={[
          { tex: '=\\,' + tc(cP, '53'), t: a(4, 0.42) },
          { tex: '+\\,' + tc(cB, '24'), t: a(4, 0.5) },
          { tex: '+\\,' + tc(cV, '2\\times 20'), t: a(4, 0.58) },
          { tex: '=\\,' + tc(C.red, '117'), t: a(4, 0.86) },
        ]}
      />
      {/* L5-L6 */}
      <Tag cx={330 + 1 * 210 + 95} y={232} t0={a(5, 0.15)} color={C.red} size={38}>near miss</Tag>
      <Tag cx={330 + 3 * 210 + 95} y={232} t0={a(5, 0.15)} color={C.red} size={38}>near miss</Tag>
      <Tx x={960} y={330} w={1200} size={130} weight={900} color={C.green} align="center" t0={a(5, 0.5)}>53 ✓ ✓</Tx>
      <Check x={330} y={520} start={a(5, 0.62)}>Solution 1: the table</Check>
      <Check x={1010} y={520} start={a(5, 0.78)}>Solution 2: flat and bumpy</Check>
    </>
  );
};

// ---------------------------------------------------------------- the variant
const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const T = [O(380, 330, 100), O(760, 290, 100), O(1180, 290, 100)];
  const t1 = a(1, 0);
  const B = O(180, 440, 110);
  const S = [O(1000, 500, 70), O(1180, 480, 70), O(1380, 480, 70)];
  return (
    <>
      <Stage>
        <Fade t1={t1}>
          <Tile cells={DOM_H(0, 0)} o={T[0]} kind="D" t0={a(0, 0.3)} />
          <Tile cells={LBOX(0, 0, 'br')} o={T[1]} kind="L" t0={a(0, 0.5)} />
          <Tile cells={[[0, 0], [0, 1], [1, 0], [1, 1]]} o={T[2]} kind="S" t0={a(0, 0.7)} />
        </Fade>
        <Fade t0={a(1, 0.2)}>
          <Cells cells={board(5)} o={B} />
          <Tile cells={DOM_H(0, 0)} o={S[0]} kind="D" t0={a(1, 0.25)} />
          <Tile cells={LBOX(0, 0, 'br')} o={S[1]} kind="L" t0={a(1, 0.3)} />
          <Tile cells={[[0, 0], [0, 1], [1, 0], [1, 1]]} o={S[2]} kind="S" t0={a(1, 0.35)} />
        </Fade>
      </Stage>
      <Tx x={T[0].ox + 100} y={560} w={300} size={42} color={C.primary} align="center" t0={a(0, 0.3)} t1={t1}>domino</Tx>
      <Tx x={T[1].ox + 100} y={560} w={300} size={42} color={C.violet} align="center" t0={a(0, 0.5)} t1={t1}>L-tromino</Tx>
      <Tx x={T[2].ox + 100} y={560} w={300} size={42} color={C.amber} align="center" t0={a(0, 0.7)} t1={t1}>2 × 2 square</Tx>
      <Tag cx={T[2].ox + 290} y={220} t0={a(0, 0.75)} t1={t1} color={C.amber} size={46}>new!</Tag>
      <PromptCard x={130} y={150} w={1660} t0={a(1, 0.05)} size={46}>
        Cover a <Tex tex="2\times 5" size={50} /> board with the same tiles and <Tex tex="2\times 2" size={50} /> squares. How many ways?
      </PromptCard>
      <Tag cx={1160} y={420} t0={a(1, 0.45)} color={C.amber} size={38} border={false} bg="transparent">your tiles</Tag>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const B = O(120, 250, 100);
  const tb: TB = { x: 60, y: 140, labelW: 190, colW: 215, headH: 70, rowH: 130, n: 6 };
  const vv = [1, 1, 3, 7, 17, 41];
  const vT = [a(3, 0.06), a(3, 0.2), a(3, 0.5), a(3, 0.88), a(4, 0.88), a(5, 0.86)];
  const cells: TCell[] = vv.map((v, i) => ({ v: String(v), t: vT[i], ph: i === 5 ? '?' : undefined, color: i === 5 ? C.green : undefined }));
  const mk = (n: number, line: number, ts: number[], t1: number): TMark[] => [
    { col: n - 1, row: 0, color: cP, t0: a(line, ts[0]), t1 },
    { col: n - 2, row: 0, color: cA, t0: a(line, ts[1]), t1 },
    ...range(Math.max(0, n - 2)).map((c) => ({ col: c, row: 0, color: cV, t0: a(line, ts[2]), t1 })),
  ];
  const marks: TMark[] = [
    { col: 5, row: 0, color: C.amber, t0: a(3, 0.0), t1: a(5, 0.84) },
    ...mk(2, 3, [0.36, 0.44, 0.5], a(3, 0.62)).slice(0, 2),
    ...mk(3, 3, [0.66, 0.74, 0.82], a(4, 0)),
    ...mk(4, 4, [0.15, 0.3, 0.5], a(5, 0)),
    ...mk(5, 5, [0.1, 0.3, 0.5], a(5, 0.84)),
  ];
  const bg = (n: number, line: number, ts: number[], t1: number): BGroup[] => [
    { a: n - 1, b: n - 1, color: cP, t0: a(line, ts[0]), t1 },
    { a: n - 2, b: n - 2, color: cA, t0: a(line, ts[1]), t1 },
    ...(n >= 3 ? [{ a: 0, b: n - 3, color: cV, t0: a(line, ts[2]), t1 }] : []),
  ];
  const ub = (k: string, v: string) => `\\underbrace{${k}}_{${v}}`;
  const rule = [
    ['one shorter', cP],
    ['2 × two shorter', cA],
    ['2 × (what the zigzags leave)', cV],
  ];
  const sq = [[0, 0], [0, 1], [1, 0], [1, 1]] as RC[];
  return (
    <>
      {/* L0-L2: the new starts */}
      <Stage>
        <Fade t1={a(1, 0.0)}>
          <Cells cells={board(5)} o={B} />
          <Tiles o={B} list={[{ cells: DOM_H(0, 0), kind: 'D', t0: a(0, 0.25), t1: a(0, 0.5) }, { cells: DOM_H(1, 0), kind: 'D', t0: a(0, 0.3), t1: a(0, 0.5) }]} />
          <Tile cells={sq} o={B} kind="S" t0={a(0, 0.52)} />
          <Region cells={board(3, 2)} o={B} t0={a(0, 0.7)} />
        </Fade>
        <Fade t0={a(1, 0.0)} t1={a(2, 0.0)}>
          <Cells cells={board(5)} o={B} />
          <Tile cells={[[0, 0], [1, 0], [0, 1]]} o={B} kind="L" t0={a(1, 0.05)} />
          <Tile cells={DOM_H(1, 1)} o={B} kind="D" t0={a(1, 0.08)} />
          <Tile cells={sq.map(([r, c]) => [r, c + 1] as RC)} o={B} kind="S" ghost bad t0={a(1, 0.4)} t1={a(2, 0)} />
          <XMark at={cellXY(B, [0.5, 1.5] as unknown as RC)} opacity={win(f, a(1, 0.45), a(2, 0), 6)} />
        </Fade>
      </Stage>
      <Tag cx={B.ox + 3.5 * B.u} y={B.oy + 2 * B.u + 30} t0={a(0, 0.72)} t1={a(1, 0)} color={C.amber} size={44}>2 shorter</Tag>
      <Tag cx={870} y={290} t0={a(0, 0.8)} t1={a(1, 0)} color={C.amber} size={44}>two-wide starts: 2</Tag>
      <Tag cx={B.ox + 2 * B.u} y={B.oy + 2 * B.u + 30} t0={a(1, 0.3)} t1={a(2, 0)} color={C.red} size={44}>a square can&apos;t fill the bump</Tag>
      <Tag cx={B.ox + 2 * B.u} y={B.oy + 2 * B.u + 110} t0={a(1, 0.8)} t1={a(2, 0)} color={C.violet} size={44}>zigzags: same, × 2</Tag>
      <div style={{ position: 'absolute', left: 270, top: 330, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', opacity: win(f, a(2, 0.05), a(3, 0), 10) }}>
        {rule.map(([text, col], i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: ease(f, a(2, 0.15 + i * 0.2), 10) }}>
            {i > 0 && <span style={{ fontSize: 44, fontWeight: 900 }}>+</span>}
            <span style={{ background: C.card, color: col, border: `4px solid ${col}`, borderRadius: 18, padding: '4px 22px', fontSize: 40, fontWeight: 900 }}>{text}</span>
          </span>
        ))}
      </div>
      <Tx x={960} y={440} w={1000} size={110} weight={900} color={C.amber} align="center" t0={a(2, 0.42)} t1={a(3, 0)}>TWO</Tx>
      {/* L3-L5: the table */}
      <Table tb={tb} heads={range(6).map(String)} headT={a(3, 0.0)} rows={[{ label: 'ways', cells }]} marks={marks} />
      <Brackets tb={tb} rows={1} groups={[...bg(2, 3, [0.36, 0.44, 0.5], a(3, 0.62)), ...bg(3, 3, [0.66, 0.74, 0.82], a(4, 0)), ...bg(4, 4, [0.15, 0.3, 0.5], a(5, 0)), ...bg(5, 5, [0.1, 0.3, 0.5], a(5, 0.84))]} />
      <Work x={960} y={470} size={70} t1={a(3, 0.62)} pieces={[{ tex: tc(cP, '1') + '+' + tc(cA, ub('2\\times 1', '2')) + '=3', t: a(3, 0.38) }]} />
      <Work x={960} y={470} size={70} t1={a(4, 0)} pieces={[{ tex: tc(cP, '3') + '+' + tc(cA, ub('2\\times 1', '2')) + '+' + tc(cV, ub('2\\times 1', '2')) + '=7', t: a(3, 0.68) }]} />
      <Work x={960} y={470} size={70} t1={a(5, 0)} pieces={[{ tex: tc(cP, '7') + '+' + tc(cA, ub('2\\times 3', '6')) + '+' + tc(cV, ub('2\\times(1+1)', '4')) + '=17', t: a(4, 0.18) }]} />
      <Work x={960} y={470} size={70} pieces={[{ tex: tc(cP, '17') + '+' + tc(cA, ub('2\\times 7', '14')) + '+' + tc(cV, ub('2\\times(3+1+1)', '10')) + '=' + tc(C.green, '41'), t: a(5, 0.12) }]} />
      <Answer x={1740} y={700} value="41" start={endOf(scene, 5) - 6} chime={CHIME} />
      <Confetti x={960} y={500} start={a(6, 0.08)} seed={7} />
    </>
  );
};

// ---------------------------------------------------------------- recap
const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, Math.max(0, i - 1), t);
  const B = O(150, 380, 80);
  const out = a(3, 0);
  const tb: TB = { x: 60, y: 650, labelW: 190, colW: 215, headH: 64, rowH: 100, n: 7 };
  const targets: [string, string, number][] = [
    ['standing domino → 1 shorter', C.primary, 0.3],
    ['lying pair → 2 shorter', C.blue, 0.5],
    ['zigzag (×2) → 3, 2, 1 or 0 left', C.violet, 0.7],
  ];
  const cells: TCell[] = W6.map((v, i) => ({ v: String(v), t: a(2, 0.15 + i * 0.07), color: i === 6 ? C.green : undefined }));
  const oc = fadeTo(f, out, 0, 10);
  return (
    <>
      <div style={{ opacity: oc }}>
        <Tx x={130} y={140} w={1400} size={44} color={C.primary} t0={4} weight={900}>The big idea</Tx>
        <Tx x={130} y={205} w={1650} size={54} weight={900} t0={a(1, 0.1)}>Ask which tile covers the first square. Then count what&apos;s left.</Tx>
        <Stage>
          <Fade t0={a(1, 0.2)}>
            <Cells cells={board(6)} o={B} />
            <HiCell cell={[0, 0]} o={B} t0={a(1, 0.25)} />
          </Fade>
          {targets.map(([, col, t], i) => {
            const p = cellXY(B, [0, 0]);
            return <Step key={i} a={[p[0] + 30, p[1] + 20]} b={[880, 380 + i * 70 + 26]} label="" color={col} opacity={ease(f, a(1, t), 10)} />;
          })}
        </Stage>
        {targets.map(([text, col, t], i) => (
          <Tx key={i} x={900} y={380 + i * 70} w={950} size={42} color={col} t0={a(1, t)}>{text}</Tx>
        ))}
        <Table tb={tb} heads={range(7).map(String)} headT={a(2, 0.05)} rows={[{ label: 'ways', cells }]} size={56} />
        <Tx x={960} y={585} w={1400} size={40} color={C.muted} align="center" t0={a(2, 0.2)}>build up from short boards</Tx>
      </div>
      <SignOff start={a(3, 0.1)} />
      <Confetti x={960} y={380} start={a(3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Try1,
  'sol1-cases': Sol1Cases,
  'sol1-table': Sol1Table,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: Try2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-01-domino-tromino-2x6-thumb`, render.sh → poster.jpg): the empty 2×6 board and the two kinds of tile, no count.
export const Thumb: React.FC = () => {
  const B = O(25, 110, 105);
  const t = -50;
  return (
    <ThumbFrame chip="AMC 10 Practice" lines={['Think it\'s', <span style={{ color: C.red }}>13?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <Cells cells={board(6)} o={B} />
        <Tiles o={O(60, 440, 105)} list={[{ cells: DOM_H(0, 0), kind: 'D', t0: t }]} />
        <Tiles o={O(380, 390, 105)} list={[{ cells: LBOX(0, 0, 'br'), kind: 'L', t0: t }]} />
      </svg>
    </ThumbFrame>
  );
};

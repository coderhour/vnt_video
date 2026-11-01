import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { PACIFICO, NUNITO } from '../../lib/fonts';
import { Countdown } from '../../lib/PauseCard';
import { Dots, Stage, XMark, makeGrid, type Pt } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { C } from '../../lib/theme';
import { Answer, Check, Choices, Confetti, Mark, Pill, Row, Text } from '../../lib/ui';

export const SLUG = '2026-10-30-dots-five-apart';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- small building blocks ----------

/** Straight segment that draws itself on (progress 0→1), optionally with arrowheads at either end. */
const Seg: React.FC<{ a: Pt; b: Pt; color: string; width?: number; progress?: number; opacity?: number; dash?: boolean; head?: 'end' | 'both' }> = ({
  a, b, color, width = 8, progress = 1, opacity = 1, dash = false, head,
}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const e: Pt = [a[0] + (b[0] - a[0]) * progress, a[1] + (b[1] - a[1]) * progress];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const hd = (p: Pt, dir: number, s: number) => [p[0] - 24 * Math.cos(ang * 1 + (dir ? Math.PI : 0) + s), p[1] - 24 * Math.sin(ang + (dir ? Math.PI : 0) + s)].join(' ');
  return (
    <g opacity={opacity} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} strokeDasharray={dash ? '14 12' : undefined} />
      {head && progress >= 1 && <path d={`M ${hd(b, 0, 0.5)} L ${b[0]} ${b[1]} L ${hd(b, 0, -0.5)}`} />}
      {head === 'both' && progress >= 1 && <path d={`M ${hd(a, 1, 0.5)} L ${a[0]} ${a[1]} L ${hd(a, 1, -0.5)}`} />}
    </g>
  );
};

const Lab: React.FC<{ at: Pt; children: React.ReactNode; color?: string; size?: number; opacity?: number; weight?: number }> = ({ at: p, children, color = C.ink, size = 48, opacity = 1, weight = 900 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} fontFamily={NUNITO} fontWeight={weight} fontSize={size} textAnchor="middle" dominantBaseline="central" opacity={opacity}>
      {children}
    </text>
  );

const Ring: React.FC<{ at: Pt; color: string; opacity?: number; r?: number }> = ({ at: p, color, opacity = 1, r = 26 }) =>
  opacity <= 0 ? null : <circle cx={p[0]} cy={p[1]} r={r} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={6} opacity={opacity} />;

/** A shape that STEPS dot to dot through `spots` (no tween), leaving faint ghosts. */
const Stepper: React.FC<{ spots: Pt[]; draw: (p: Pt, ghost: boolean) => React.ReactNode; start: number; end: number; opacity?: number }> = ({ spots, draw, start, end, opacity = 1 }) => {
  const f = useCurrentFrame();
  if (f < start || opacity <= 0) return null;
  const i = Math.min(spots.length - 1, Math.floor((f - start) / ((end - start) / spots.length)));
  return (
    <g opacity={opacity}>
      {spots.slice(0, i).map((s, j) => (
        <g key={j} opacity={0.28}>
          {draw(s, true)}
        </g>
      ))}
      <g opacity={ease(f, start, 8)}>{draw(spots[i], false)}</g>
    </g>
  );
};
const stepCount = (f: number, start: number, end: number, n: number) => (f < start ? 0 : Math.min(n, 1 + Math.floor((f - start) / ((end - start) / n))));

const Counter: React.FC<{ x: number; y: number; n: number; color: string; opacity?: number }> = ({ x, y, n, color, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontSize: 72, fontWeight: 900, color, opacity }}>×{n}</div>
);

const Rect: React.FC<{ pts: Pt[]; color: string; width?: number; fill?: boolean; opacity?: number; progress?: number }> = ({ pts, color, width = 7, fill = true, opacity = 1, progress = 1 }) =>
  progress <= 0 || opacity <= 0 ? null : (
    <g opacity={opacity * Math.min(1, progress * 2)}>
      <path d={`M ${pts.map((p) => p.join(' ')).join(' L ')} Z`} fill={fill ? color : 'none'} fillOpacity={0.12} stroke={color} strokeWidth={width} strokeLinejoin="round" />
    </g>
  );

/** Right/wrong verdict icon. */
const Verdict: React.FC<{ x: number; y: number; ok: boolean; start: number }> = ({ x, y, ok, start }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  if (s <= 0) return null;
  const col = ok ? C.green : C.red;
  return (
    <svg width={60} height={60} viewBox="0 0 60 60" style={{ position: 'absolute', left: x, top: y, transform: `scale(${s})` }}>
      <circle cx={30} cy={30} r={29} fill={col} />
      {ok ? (
        <path d="M16 31 L26 41 L45 20" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M19 19 L41 41 M41 19 L19 41" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
};

const Warn: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  return (
    <svg width={170} height={160} viewBox="0 0 170 160" style={{ position: 'absolute', left: x, top: y, transform: `scale(${s})` }}>
      <path d="M85 12 L158 142 L12 142 Z" fill={C.amber} stroke={C.amber} strokeWidth={14} strokeLinejoin="round" />
      <text x={85} y={118} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={96} textAnchor="middle">!</text>
    </svg>
  );
};

const PROMPT = 'The 25 dots shown are spaced 1 unit apart in rows and columns. How many pairs of dots are exactly 5 units apart?';
const CHOICES = ['2', '4', '6', '8', '16'];

const makePause = (n: number, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const unit = n === 5 ? 110 : 92;
  const g = makeGrid(130, 190, unit);
  return (
    <>
      <Stage>
        <Dots cols={n} rows={n} at={g} />
      </Stage>
      <Text x={130 + ((n - 1) * unit) / 2} y={230 + (n - 1) * unit} w={720} size={46} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} />
    </>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(240, 190, 130);
  return (
    <>
      <Stage>
        <Seg a={g([0, 0])} b={g([3, 4])} color={C.violet} width={6} opacity={0.35} progress={ease(f, at(scene, 0, 0.55), 20)} />
        <Dots cols={5} rows={5} at={g} start={0} />
      </Stage>
      <Text x={1330} y={210} w={1000} size={88} weight={900} align="center" style={fadeUp(f, 6)}>
        How many pairs are
      </Text>
      <Text x={1330} y={320} w={1000} size={96} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 0, 0.5))}>
        exactly 5 apart?
      </Text>
      <Warn x={1130} y={500} start={at(scene, 1, 0.45)} />
      <Warn x={1360} y={500} start={at(scene, 1, 0.7)} />
      <Text x={1330} y={680} w={800} size={48} weight={800} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.75))}>
        2 sneaky traps
      </Text>
      <div style={{ position: 'absolute', left: 1020, top: 740, textAlign: 'center', width: 620, ...fadeUp(f, at(scene, 2)) }}>
        <span style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</span>
        <span style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginLeft: 18 }}>your math tutor</span>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(1150, 190, 130);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 150, width: 940, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        The {'25 dots'} shown are <Mark on={at(scene, 1, 0.35)}>{'spaced 1 unit apart'}</Mark> in rows and columns. How many pairs of dots are{' '}
        <Mark on={at(scene, 2, 0.55)}>{'exactly 5 units apart'}</Mark>?
      </div>
      <Choices x={110} y={690} items={CHOICES.map((c) => <Tex key={c} tex={c} size={52} />)} start={(i) => at(scene, 3, 0.2 + i * 0.13)} />
      <Stage>
        <Dots cols={5} rows={5} at={g} start={4} r={11} />
        <g opacity={ease(f, at(scene, 1, 0.4), 12)}>
          <Seg a={g([0, 4.45])} b={g([1, 4.45])} color={C.primary} width={7} head="both" />
          <Lab at={g([0.5, 4.8])} color={C.primary}>1 unit</Lab>
        </g>
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(220, 190, 130);
  const A: Pt = [0, 0];
  const B: Pt = [2, 1];
  const pa = g(A);
  const pb = g(B);
  const L = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
  const nx = (pb[1] - pa[1]) / L;
  const ny = -(pb[0] - pa[0]) / L;
  const off = (p: Pt, d: number): Pt => [p[0] + nx * d, p[1] + ny * d];
  const t3 = at(scene, 3, 0.2);
  const t3b = at(scene, 3, 0.5);
  const sw = ease(f, t3b - 8, 10);
  return (
    <>
      <Stage>
        <Ring at={pa} color={C.amber} opacity={ease(f, at(scene, 1, 0.3), 10)} />
        <Ring at={pb} color={C.amber} opacity={ease(f, at(scene, 1, 0.45), 10)} />
        <g opacity={ease(f, at(scene, 2, 0.5), 14)}>
          <Seg a={pa} b={pb} color={C.violet} width={9} />
          {range(9).map((i) => {
            const t = (i + 1) / 10;
            const c: Pt = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
            const len = i % 2 === 0 ? 20 : 12;
            return <line key={i} x1={c[0] - nx * len} y1={c[1] - ny * len} x2={c[0] + nx * len} y2={c[1] + ny * len} stroke={C.violet} strokeWidth={4} />;
          })}
          <Lab at={g([2.55, 0.5])} color={C.violet} size={44} opacity={fadeTo(f, t3 - 4)}>distance</Lab>
        </g>
        <g opacity={ease(f, t3 - 4, 8)}>
          <Seg a={off(pa, 56)} b={off(pb, 56)} color={C.blue} width={7} head="end" progress={ease(f, t3, 16) * fadeTo(f, t3b - 10, 1)} opacity={1 - sw * 0.0} />
          <Seg a={off(pb, -56)} b={off(pa, -56)} color={C.primary} width={7} head="end" progress={ease(f, t3b, 16)} />
        </g>
        <Dots cols={5} rows={5} at={g} />
        <Lab at={[pa[0] - 44, pa[1] - 36]} color={C.ink} opacity={ease(f, at(scene, 1, 0.3), 8)}>A</Lab>
        <Lab at={[pb[0] + 44, pb[1] + 40]} color={C.ink} opacity={ease(f, at(scene, 1, 0.45), 8)}>B</Lab>
      </Stage>
      <Check x={980} y={230} start={at(scene, 1, 0.3)}>A pair = two dots</Check>
      <Check x={980} y={350} start={at(scene, 2, 0.4)}>Straight-line distance</Check>
      <Check x={980} y={470} start={at(scene, 3, 0.15)}>A to B = B to A</Check>
      <Text x={1010} y={580} w={800} size={52} weight={900} color={C.violet} style={fadeUp(f, at(scene, 3, 0.7))}>
        Same pair, count once
      </Text>
    </>
  );
};

const Straight: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(220, 260, 120);
  const l1 = at(scene, 1, 0.4);
  const l2 = at(scene, 2, 0.3);
  return (
    <>
      <Stage>
        <rect x={g([0, 0])[0] - 30} y={g([0, 0])[1] - 30} width={4 * 120 + 60} height={60} rx={30} fill={C.primary} opacity={0.2 * ease(f, l1, 12)} />
        <rect x={g([3, 0])[0] - 30} y={g([3, 0])[1] - 30} width={60} height={4 * 120 + 60} rx={30} fill={C.red} opacity={0.18 * ease(f, l2, 12)} />
        <rect x={g([0, 3])[0] - 30} y={g([0, 3])[1] - 30} width={4 * 120 + 60} height={60} rx={30} fill={C.red} opacity={0.18 * ease(f, l2, 12)} />
        <Seg a={g([0, -0.6])} b={g([5, -0.6])} color={C.amber} width={8} head="end" progress={ease(f, at(scene, 0, 0.5), 22)} opacity={fadeTo(f, l1, 0.25)} />
        <Lab at={g([2.5, -1.05])} color={C.amber} size={48} opacity={ease(f, at(scene, 0, 0.7), 10) * fadeTo(f, l1, 0.25)}>5 units?</Lab>
        <Dots cols={5} rows={5} at={g} />
        {range(4).map((i) => (
          <Lab key={i} at={g([i + 0.5, 0.42])} color={C.primary} size={44} opacity={ease(f, l1 + i * 6, 8)}>{i + 1}</Lab>
        ))}
        <XMark at={g([4.55, 3])} opacity={ease(f, l2 + 4, 8)} size={50} />
        <XMark at={g([3, 4.6])} opacity={ease(f, l2 + 10, 8)} size={50} />
      </Stage>
      <Text x={960} y={280} w={760} size={56} weight={900} color={C.primary} style={fadeUp(f, l1)}>
        Row of 5 dots: 4 gaps
      </Text>
      <Text x={960} y={370} w={760} size={80} weight={900} color={C.primary} style={fadeUp(f, at(scene, 1, 0.8))}>
        4 units
      </Text>
      <Text x={960} y={520} w={800} size={56} weight={900} color={C.red} style={fadeUp(f, l2 + 14)}>
        No straight 5
      </Text>
      <Text x={960} y={600} w={800} size={44} weight={700} color={C.muted} style={fadeUp(f, l2 + 20)}>
        not in a row, not in a column
      </Text>
    </>
  );
};

const LIST: { tex: string; ok: boolean; note?: string }[] = [
  { tex: '0:\\ 25-0=25 \\Rightarrow \\text{down}=5', ok: false, note: 'too big' },
  { tex: '1:\\ 25-1=24', ok: false, note: 'not a square' },
  { tex: '2:\\ 25-4=21', ok: false, note: 'not a square' },
  { tex: '3:\\ 25-9=16=4^2', ok: true },
  { tex: '4:\\ 25-16=9=3^2', ok: true },
];

const Slant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(200, 180, 130);
  const a = g([0, 0]);
  const b = g([3, 0]);
  const c = g([3, 4]);
  const l6 = at(scene, 6, 0.2);
  const lblSwap = ease(f, l6, 8);
  const rowStart = [at(scene, 3, 0.45), at(scene, 4, 0.1), at(scene, 4, 0.5), at(scene, 5, 0.15), at(scene, 5, 0.6)];
  const X = 860;
  return (
    <>
      <Stage>
        <Seg a={a} b={b} color={C.blue} width={7} dash progress={ease(f, at(scene, 0, 0.55), 14)} />
        <Seg a={b} b={c} color={C.blue} width={7} dash progress={ease(f, at(scene, 0, 0.7), 14)} />
        <Seg a={a} b={c} color={C.violet} width={10} progress={ease(f, at(scene, 0, 0.3), 22)} />
        <Dots cols={5} rows={5} at={g} start={0} />
        <Lab at={[(a[0] + b[0]) / 2, a[1] - 40]} color={C.blue} size={42} opacity={ease(f, at(scene, 0, 0.8), 8) * (1 - lblSwap)}>across</Lab>
        <Lab at={[b[0] + 68, (b[1] + c[1]) / 2]} color={C.blue} size={34} opacity={ease(f, at(scene, 0, 0.85), 8) * (1 - lblSwap)}>down</Lab>
        <Lab at={[(a[0] + b[0]) / 2, a[1] - 40]} color={C.blue} size={56} opacity={lblSwap}>3</Lab>
        <Lab at={[b[0] - 40, (b[1] + c[1]) / 2]} color={C.blue} size={56} opacity={lblSwap}>4</Lab>
        <Lab at={[a[0] + 82, a[1] + 182]} color={C.violet} size={60} opacity={ease(f, at(scene, 0, 0.6), 8)}>5</Lab>
      </Stage>
      <div style={{ position: 'absolute', left: X, top: 150, ...fadeUp(f, at(scene, 1, 0.4)) }}>
        <Tex tex={'\\text{across}^2 + \\text{down}^2 = 5^2'} size={58} />
      </div>
      <div style={{ position: 'absolute', left: X, top: 235, ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <Tex tex={'5^2 = 25'} size={58} />
      </div>
      <div style={{ position: 'absolute', left: X + 300, top: 235, ...fadeUp(f, at(scene, 2, 0.5)) }}>
        <Tex tex={'\\text{each step} \\le 4'} size={52} color={C.violet} />
      </div>
      <Text x={X} y={336} w={900} size={36} weight={800} color={C.muted} style={fadeUp(f, rowStart[0] - 10)}>
        across : what is left for down²
      </Text>
      {LIST.map((r, i) => (
        <div key={i}>
          <div style={{ position: 'absolute', left: X, top: 395 + i * 80, ...fadeUp(f, rowStart[i]) }}>
            <Tex tex={r.tex} size={46} color={r.ok ? C.green : C.ink} />
          </div>
          <Verdict x={X + [700, 390, 390, 560, 550][i]} y={398 + i * 80} ok={r.ok} start={rowStart[i] + 14} />
          {r.note && (
            <Text x={X + [775, 465, 465, 0, 0][i]} y={400 + i * 80} w={400} size={40} weight={800} color={C.red} style={fadeUp(f, rowStart[i] + 16)}>
              {r.note}
            </Text>
          )}
        </div>
      ))}
      <Pill x={220} y={745} color={C.violet} style={{ fontSize: 56, ...fadeUp(f, l6) }}>3-4-5</Pill>
    </>
  );
};

const SLANTS: { a: number; b: number; right: boolean }[] = [
  { a: 3, b: 4, right: true },
  { a: 3, b: 4, right: false },
  { a: 4, b: 3, right: true },
  { a: 4, b: 3, right: false },
];
const U = 34;
const IX = [840, 1060, 1330, 1590];
const IY = 280;

const Fit: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(200, 170, 130);
  const iconAt = [at(scene, 1, 0.35), at(scene, 1, 0.8), at(scene, 2, 0.25), at(scene, 2, 0.7)];
  const shown = iconAt.filter((s) => f >= s).length;
  const box = (x: number, y: number): Pt[] => [[x, y], [x + 3, y], [x + 3, y + 4], [x, y + 4]].map((p) => g(p as Pt));
  const t3 = at(scene, 3, 0.3);
  const t4 = at(scene, 4, 0.45);
  const second = f >= t4;
  const t6 = at(scene, 6, 0.0);
  return (
    <>
      <Stage>
        {/* icons: one small triangle per slant, beside the grid */}
        {SLANTS.map((s, j) => {
          const w = s.a * U;
          const h = s.b * U;
          const o = ease(f, iconAt[j], 12);
          const S: Pt = [IX[j] + (s.right ? 0 : w), IY];
          const E: Pt = [IX[j] + (s.right ? w : 0), IY + h];
          const K: Pt = [E[0], IY];
          const hot = j === 0 && f >= t3 && f < at(scene, 5);
          return (
            <g key={j} opacity={o}>
              <path d={`M ${S.join(' ')} L ${K.join(' ')} L ${E.join(' ')}`} fill="none" stroke={C.blue} strokeWidth={4} strokeDasharray="8 8" />
              <Seg a={S} b={E} color={hot ? C.amber : C.violet} width={hot ? 9 : 7} />
              <circle cx={S[0]} cy={S[1]} r={8} fill={C.ink} />
              <circle cx={E[0]} cy={E[1]} r={8} fill={C.ink} />
              <Lab at={[(S[0] + K[0]) / 2, IY - 28]} color={C.blue} size={44}>{s.a}</Lab>
              <Lab at={[E[0] + (s.right ? 30 : -30), IY + h / 2]} color={C.blue} size={44}>{s.b}</Lab>
              <Lab at={[(S[0] + E[0]) / 2, IY + h + 62]} color={C.green} size={64} opacity={ease(f, at(scene, 5, 0.1 + j * 0.2), 10)}>2</Lab>
            </g>
          );
        })}
        <Ring at={g([0, 0])} color={C.amber} opacity={ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, t3 + 6)} />
        <Rect pts={box(0, 0)} color={C.violet} opacity={ease(f, t3, 12) * (second ? 0.25 : 1)} />
        <Seg a={g([0, 0])} b={g([3, 4])} color={C.violet} width={second ? 5 : 9} opacity={ease(f, t3 + 6, 12) * (second ? 0.25 : 1)} />
        {second && (
          <g opacity={ease(f, t4, 6)}>
            <Rect pts={box(1, 0)} color={C.amber} />
            <Seg a={g([1, 0])} b={g([4, 4])} color={C.amber} width={9} />
          </g>
        )}
        <Dots cols={5} rows={5} at={g} start={0} />
      </Stage>
      <Text x={840} y={140} w={700} size={52} weight={900} color={C.muted} style={{ opacity: ease(f, iconAt[0], 10) * fadeTo(f, t3) }}>
        slants: {shown}
      </Text>
      <Counter x={840} y={540} n={second ? 2 : 1} color={second ? C.amber : C.violet} opacity={ease(f, t3 + 14, 8) * fadeTo(f, at(scene, 5))} />
      <Text x={1010} y={560} w={700} size={46} weight={800} color={C.muted} style={{ opacity: ease(f, at(scene, 4, 0.75), 10) * fadeTo(f, at(scene, 5)) }}>
        top to bottom: 1
      </Text>
      <Text x={840} y={600} w={700} size={44} weight={800} color={C.green} style={{ opacity: ease(f, at(scene, 5, 0.7), 10) * fadeTo(f, t6) }}>
        2 places each
      </Text>
      <div style={{ position: 'absolute', left: 840, top: 620, ...fadeUp(f, t6 + 4) }}>
        <Tex tex={'4 \\times 2 = 8'} size={92} color={C.green} />
      </div>
      <Answer x={1640} y={690} value="D" chime={CHIME} start={at(scene, 6, 0.88)} />
    </>
  );
};

const COUNTS = [
  [2, 1, 0, 1, 2],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [2, 1, 0, 1, 2],
];

const DotsScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(200, 180, 130);
  const t1 = at(scene, 1, 0.3);
  const t2 = at(scene, 2, 0.2);
  const t3 = at(scene, 3, 0.1);
  const t4 = at(scene, 4, 0.02);
  const t5 = at(scene, 5, 0.5);
  const linesOut = fadeTo(f, t3 - 6);
  const reveal = (x: number, y: number) => {
    if (x === 0 && y === 0) return t1 + 14;
    if (x === 1 && y === 0) return t2 + 10;
        if (COUNTS[y][x] === 0) return t3 + 4 + (y * 5 + x) * 2;
    return t4 + (y * 5 + x) * 2;
  };
  return (
    <>
      <Stage>
        <Seg a={g([0, 0])} b={g([3, 4])} color={C.violet} width={8} progress={ease(f, t1, 16)} opacity={linesOut * fadeTo(f, t2, 0.25)} />
        <Seg a={g([0, 0])} b={g([4, 3])} color={C.violet} width={8} progress={ease(f, t1 + 6, 16)} opacity={linesOut * fadeTo(f, t2, 0.25)} />
        <g opacity={ease(f, t1 + 18, 10) * linesOut * fadeTo(f, t2, 0)}>
          <Lab at={[g([3, 4])[0], g([3, 4])[1] + 52]} color={C.violet} size={38} weight={800}>3 across, 4 down</Lab>
          <Lab at={[g([4, 3])[0] + 190, g([4, 3])[1]]} color={C.violet} size={38} weight={800}>4 across, 3 down</Lab>
        </g>
        <Seg a={g([1, 0])} b={g([4, 4])} color={C.blue} width={8} progress={ease(f, t2, 16)} opacity={linesOut} />
        <Seg a={g([0, 0])} b={g([3, 4])} color={C.red} width={9} head="both" progress={ease(f, t5, 14)} opacity={1} />
        <Dots cols={5} rows={5} at={g} />
        {COUNTS.map((row, y) =>
          row.map((n, x) => {
            const s = pop(f, reveal(x, y));
            if (s <= 0) return null;
            const p = g([x, y]);
            const hot = n > 0;
            const dim = 1;
            return (
              <g key={`${x}${y}`} transform={`translate(${p[0]} ${p[1]}) scale(${s})`} opacity={dim}>
                <circle r={31} fill={hot ? C.green : '#fff'} stroke={hot ? C.green : C.line} strokeWidth={5} />
                <text fill={hot ? '#fff' : C.muted} fontFamily={NUNITO} fontWeight={900} fontSize={42} textAnchor="middle" dominantBaseline="central">{n}</text>
              </g>
            );
          }),
        )}
      </Stage>
      <Row x={880} y={190} label="4 corners" tex={'4 \\times 2 = 8'} color={C.green} style={fadeUp(f, at(scene, 4, 0.55))} />
      <Row x={880} y={290} label="8 edge dots" tex={'8 \\times 1 = 8'} color={C.green} style={fadeUp(f, at(scene, 4, 0.85))} />
      <Row x={880} y={400} label="Add up" tex={'8 + 8 = 16'} strong style={fadeUp(f, at(scene, 5, 0.1))} />
      <Text x={880} y={485} w={800} size={42} weight={800} color={C.red} style={fadeUp(f, t5)}>
        each pair counted twice
      </Text>
      <Row x={880} y={570} label="Halve it" tex={'\\dfrac{16}{2} = 8'} strong style={fadeUp(f, at(scene, 6, 0.1))} />
      <Verdict x={1500} y={600} ok start={at(scene, 6, 0.65)} />
      <Pill x={880} y={750} color={C.primary} style={fadeUp(f, at(scene, 7, 0.55))}>A great double-check</Pill>
    </>
  );
};

const TRAPS: { choice: string; tex: string }[] = [
  { choice: '2', tex: '1 \\times 2 = 2' },
  { choice: '4', tex: '2 \\times 2 = 4' },
  { choice: '6', tex: '12 \\div 2 = 6' },
  { choice: '16', tex: '8 \\times 2 = 16' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(190, 190, 100);
  const t = (i: number, k = 0.15) => at(scene, i, k);
  const twelve: Pt[] = [];
  range(5).forEach((y) => range(5).forEach((x) => COUNTS[y][x] > 0 && twelve.push([x, y])));
  const gridOut = fadeTo(f, t(5, 0.0), 0);
  const cornerFlash = ease(f, t(3, 0.55), 8) * fadeTo(f, t(3, 0.55) + 40, 0, 12);
  return (
    <>
      <div style={{ opacity: gridOut }}>
        <Stage>
          <Seg a={g([0, 0])} b={g([3, 4])} color={C.red} width={8} progress={ease(f, t(1, 0.3), 16)} opacity={fadeTo(f, t(2), 0.3)} />
          <Seg a={g([1, 0])} b={g([4, 4])} color={C.red} width={8} progress={ease(f, t(1, 0.55), 16)} opacity={fadeTo(f, t(2), 0.3)} />
          <Seg a={g([0, 0])} b={g([4, 3])} color={C.red} width={8} progress={ease(f, t(2, 0.35), 16)} opacity={fadeTo(f, t(3), 0)} />
          <Seg a={g([0, 1])} b={g([4, 4])} color={C.red} width={8} progress={ease(f, t(2, 0.6), 16)} opacity={fadeTo(f, t(3), 0)} />
          {twelve.map((p, i) => (
            <Ring key={i} at={g(p)} color={C.amber} r={22} opacity={ease(f, t(3, 0.1) + i * 2, 8) * fadeTo(f, t(4), 0)} />
          ))}
          <Seg a={g([0, 0])} b={g([3, 4])} color={C.red} width={9} head="both" progress={ease(f, t(4, 0.3), 16)} />
          <Dots cols={5} rows={5} at={g} />
          <g transform={`translate(${g([0, 0])[0]} ${g([0, 0])[1]}) scale(${cornerFlash})`}>
            <circle r={32} fill={C.green} />
            <text fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={44} textAnchor="middle" dominantBaseline="central">2</text>
          </g>
        </Stage>
      </div>
      {/* fence-post card: a row of 5 dots, 4 gaps */}
      <div style={{ opacity: ease(f, t(5, 0.0), 12) }}>
        <Stage>
          {range(4).map((i) => (
            <Lab key={i} at={[190 + i * 110 + 55, 380]} color={C.red} size={48} opacity={ease(f, t(5, 0.45) + i * 8, 8)}>{i + 1}</Lab>
          ))}
          {range(4).map((i) => (
            <Seg key={i} a={[190 + i * 110, 440]} b={[190 + (i + 1) * 110, 440]} color={C.red} width={7} opacity={ease(f, t(5, 0.45) + i * 8, 8)} />
          ))}
          {range(5).map((i) => (
            <circle key={i} cx={190 + i * 110} cy={440} r={12} fill={C.ink} />
          ))}
        </Stage>
      </div>
      {TRAPS.map((tr, i) => (
        <div key={i} style={{ position: 'absolute', left: 940, top: 140 + i * 130, width: 840, height: 112, background: '#fff4f4', border: `4px solid ${C.red}`, borderRadius: 26, display: 'flex', alignItems: 'center', gap: 36, padding: '0 36px', ...fadeUp(f, t(i + 1, 0.1)) }}>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.red, width: 130 }}>{tr.choice}</div>
          <Tex tex={tr.tex} size={56} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 940, top: 140 + 4 * 130, width: 840, height: 112, background: '#fff4f4', border: `4px solid ${C.red}`, borderRadius: 26, display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px', fontSize: 50, fontWeight: 900, color: C.red, ...fadeUp(f, t(5, 0.2)) }}>
        5 dots → only 4 gaps
      </div>
    </>
  );
};

const GV = makeGrid(130, 190, 100);

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Dots cols={6} rows={6} at={GV} start={4} r={11} />
      </Stage>
      <Text x={820} y={210} w={1000} size={64} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.5))}>
        6 rows of 6 dots
      </Text>
      <div style={{ position: 'absolute', left: 820, top: 330, width: 960, background: C.card, borderRadius: 32, padding: '36px 46px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 1, 0.05)) }}>
        Still 1 unit apart. How many pairs of dots are <Mark on={at(scene, 1, 0.55)}>{'exactly 5 units apart'}</Mark> now?
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = makeGrid(120, 180, 100);
  const rows: Pt[] = range(6).map((y) => [0, y] as Pt);
  const cols: Pt[] = range(6).map((x) => [x, 0] as Pt);
  const boxSp: Pt[] = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
  const rS = [at(scene, 1, 0.3), at(scene, 1, 0.95)] as const;
  const cS = [at(scene, 2, 0.1), at(scene, 2, 0.7)] as const;
  const bS = [at(scene, 3, 0.1), at(scene, 3, 0.95)] as const;
  const l0 = at(scene, 0, 0.5);
  const rowDraw = (p: Pt, ghost: boolean) => (
    <g>
      <Ring at={g([0, p[1]])} color={C.primary} r={ghost ? 18 : 22} />
      <Ring at={g([5, p[1]])} color={C.primary} r={ghost ? 18 : 22} />
    </g>
  );
  const colDraw = (p: Pt, ghost: boolean) => (
    <g>
      <Ring at={g([p[0], 0])} color={C.blue} r={ghost ? 18 : 22} />
      <Ring at={g([p[0], 5])} color={C.blue} r={ghost ? 18 : 22} />
    </g>
  );
  const boxDraw = (p: Pt, ghost: boolean) => (
    <g>
      {!ghost && <Rect pts={[[p[0], p[1]], [p[0] + 3, p[1]], [p[0] + 3, p[1] + 4], [p[0], p[1] + 4]].map((q) => g(q as Pt))} color={C.violet} />}
      <Seg a={g(p)} b={g([p[0] + 3, p[1] + 4])} color={C.violet} width={ghost ? 5 : 9} />
    </g>
  );
  const X = 860;
  const row = (label: string, tex: string, y: number, start: number, color: string, strong = false) => (
    <Row x={X} y={y} label={label} tex={tex} color={color} strong={strong} style={fadeUp(f, start)} />
  );
  return (
    <>
      <Stage>
        {range(5).map((i) => (
          <Lab key={i} at={g([i + 0.5, -0.4])} color={C.primary} size={44} opacity={ease(f, l0 + i * 5, 8) * fadeTo(f, rS[0] - 6, 0)}>{i + 1}</Lab>
        ))}
        <Seg a={g([0, 0])} b={g([5, 0])} color={C.primary} width={10} progress={ease(f, l0, 20)} opacity={fadeTo(f, rS[0] - 6, 0)} />
        <Stepper spots={rows} draw={rowDraw} start={rS[0]} end={rS[1]} opacity={fadeTo(f, cS[0] - 4, 0)} />
        <Stepper spots={cols} draw={colDraw} start={cS[0]} end={cS[1]} opacity={fadeTo(f, bS[0] - 4, 0)} />
        <Stepper spots={boxSp} draw={boxDraw} start={bS[0]} end={bS[1]} opacity={fadeTo(f, at(scene, 5), 0.0)} />
        <Dots cols={6} rows={6} at={g} />
      </Stage>
      <Text x={X} y={200} w={900} size={64} weight={900} color={C.primary} style={{ opacity: ease(f, l0 + 10, 10) * fadeTo(f, rS[0], 0) }}>
        5 units fit!
      </Text>
      <Counter x={680} y={190} n={Math.max(1, stepCount(f, rS[0], rS[1], 6))} color={C.primary} opacity={ease(f, rS[0], 8) * fadeTo(f, cS[0] - 4, 0)} />
      <Counter x={680} y={190} n={Math.max(1, stepCount(f, cS[0], cS[1], 6))} color={C.blue} opacity={ease(f, cS[0], 8) * fadeTo(f, at(scene, 3, 0), 0, 6)} />
      <Counter x={680} y={190} n={Math.max(1, stepCount(f, bS[0], bS[1], 6))} color={C.violet} opacity={ease(f, bS[0], 8) * fadeTo(f, at(scene, 4, 0.6), 0)} />
      <Text x={X} y={335} w={900} size={48} weight={800} color={C.violet} style={{ opacity: ease(f, at(scene, 3, 0.3), 10) * fadeTo(f, at(scene, 4, 0.1), 0) }}>
        side to side: 3
      </Text>
      <Text x={X} y={405} w={900} size={48} weight={800} color={C.violet} style={{ opacity: ease(f, at(scene, 3, 0.65), 10) * fadeTo(f, at(scene, 4, 0.1), 0) }}>
        top to bottom: 2
      </Text>
      {row('Straight', '6 + 6 = 12', 200, at(scene, 2, 0.85), C.primary)}
      {row('One slant', '3 \\times 2 = 6', 305, at(scene, 4, 0.2), C.violet)}
      {row('4 slants', '4 \\times 6 = 24', 410, at(scene, 5, 0.2), C.violet)}
      <div style={{ position: 'absolute', left: X, top: 520, width: 780, height: 5, background: C.line, ...fadeUp(f, at(scene, 6, 0.0)) }} />
      {row('Total', '12 + 24 = 36', 545, at(scene, 6, 0.05), C.ink, true)}
      <Answer x={1730} y={670} value="36" chime={CHIME} start={at(scene, 6, 0.85)} />
      <Confetti x={1730} y={670} start={at(scene, 6, 0.85)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3));
  const card = (y: number, start: number, text: string, color: string) => (
    <div style={{ position: 'absolute', left: 150, top: y, width: 1620, background: C.card, borderRadius: 36, padding: '34px 56px', fontSize: 56, fontWeight: 900, color, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {text}
    </div>
  );
  return (
    <>
      <div style={{ opacity: out }}>
        <Text x={150} y={130} w={900} size={48} weight={900} color={C.primary} style={fadeUp(f, 4)}>The big idea</Text>
        {card(220, at(scene, 1, 0.1), '1. List the steps across and down', C.violet)}
        {card(410, at(scene, 2, 0.1), '2. Count the places each fits, count each pair once', C.blue)}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(5, 10, '25 dots. How many pairs are exactly 5 apart?'),
  straight: Straight,
  slant: Slant,
  fit: Fit,
  dots: DotsScene,
  traps: Traps,
  variant: Variant,
  try2: makePause(6, 12, '6 rows of 6 dots. How many pairs are exactly 5 apart?'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

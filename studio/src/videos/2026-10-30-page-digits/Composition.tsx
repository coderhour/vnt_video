import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-30-page-digits';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Colour per digit count: 1-digit pages amber, 2-digit blue, 3-digit violet, 4-digit green.
export const DC: Record<number, string> = { 1: C.amber, 2: C.blue, 3: C.violet, 4: C.primary };
const nd = (p: number) => String(p).length;

// ---------- building blocks ----------

const TILE_H = 92;
const tileW = (p: number) => 34 + nd(p) * 34;

/** A little page with its number, centred at (x, y). Each digit is one coloured cell. */
export const Page: React.FC<{ p: number | string; x: number; y: number; s?: number; opacity?: number; color?: string }> = ({ p, x, y, s = 1, opacity = 1, color }) => {
  if (s <= 0 || opacity <= 0) return null;
  const str = String(p);
  const n = typeof p === 'number' ? nd(p) : 1;
  const col = color ?? (typeof p === 'number' ? DC[n] : C.muted);
  const w = typeof p === 'number' ? tileW(p) : 80;
  const h = TILE_H;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path d={`M ${-w / 2} ${-h / 2} H ${w / 2 - 18} L ${w / 2} ${-h / 2 + 18} V ${h / 2} H ${-w / 2} Z`} fill={C.card} stroke={col} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${w / 2 - 18} ${-h / 2} V ${-h / 2 + 18} H ${w / 2}`} fill="none" stroke={col} strokeWidth={4} strokeLinejoin="round" />
      <text y={4} fontFamily={NUNITO} fontWeight={900} fontSize={54} fill={col} textAnchor="middle" dominantBaseline="middle">
        {str}
      </text>
    </g>
  );
};

/** A row of page tiles from x0, popping in from `start`, `stagger` frames apart. */
export const Pages: React.FC<{ ps: (number | string)[]; x0: number; y: number; gap?: number; start?: number; stagger?: number; opacity?: number }> = ({ ps, x0, y, gap = 14, start, stagger = 3, opacity = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let x = x0;
  return (
    <g opacity={opacity}>
      {ps.map((p, i) => {
        const w = typeof p === 'number' ? tileW(p) : 80;
        const cx = x + w / 2;
        x += w + gap;
        return <Page key={i} p={p} x={cx} y={y} s={start === undefined ? 1 : pop(f, start + i * stagger, fps)} />;
      })}
    </g>
  );
};

export const rowWidth = (ps: (number | string)[], gap = 14) => ps.reduce<number>((a, p) => a + (typeof p === 'number' ? tileW(p) : 80) + gap, -gap);

/** A maths line placed absolutely. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1, center }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: center ? x - 900 : x, width: center ? 1800 : undefined, textAlign: center ? 'center' : undefined, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

/** Small square chip with a label (a digit owed or a digit extra). */
const Chip: React.FC<{ x: number; y: number; w?: number; label: string; color: string; s: number; filled?: boolean }> = ({ x, y, w = 118, label, color, s, filled }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-40} width={w} height={80} rx={18} fill={filled ? color : C.card} fillOpacity={filled ? 0.18 : 1} stroke={color} strokeWidth={5} />
      <text y={4} fontFamily={NUNITO} fontWeight={900} fontSize={50} fill={color} textAnchor="middle" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );

const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle">
      {text}
    </text>
  );

/** Answer chime timed to the end of a line, plus a pill badge (for answers too wide for <Answer>). */
const AnswerPill: React.FC<{ x: number; y: number; value: string; start: number }> = ({ x, y, value, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, background: C.green, color: '#fff', borderRadius: 999, padding: '18px 54px', fontSize: 92, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};

// ---------- scenes ----------

const HOOK: (number | string)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, '…', 98, 99];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const w = rowWidth(HOOK);
  return (
    <>
      <Text x={960} y={160} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        Count every digit!
      </Text>
      <Stage>
        <Pages ps={HOOK} x0={960 - w / 2} y={370} start={at(scene, 0, 0.2)} stagger={3} />
      </Stage>
      <Eq x={960} center y={490} start={at(scene, 1, 0.3)} size={72} tex="99 \text{ pages} \;\to\; 189 \text{ digits}" />
      <Eq x={960} center y={600} start={at(scene, 1, 0.55)} size={60} color={C.red} tex="\text{not } 2 \times 99 = 198" />
      <div style={{ position: 'absolute', left: 1440, top: 690, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['99', '100', '108', '117', '189'];

const Book: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-210} y={-150} width={200} height={290} rx={14} fill={C.card} stroke={C.violet} strokeWidth={6} />
    <rect x={10} y={-150} width={200} height={290} rx={14} fill={C.card} stroke={C.violet} strokeWidth={6} />
    <line x1={0} y1={-150} x2={0} y2={140} stroke={C.violet} strokeWidth={6} />
    {range(5).map((i) => (
      <g key={i}>
        <line x1={-180} x2={-40} y1={-100 + i * 38} y2={-100 + i * 38} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
        <line x1={40} x2={180} y1={-100 + i * 38} y2={-100 + i * 38} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
      </g>
    ))}
    <Label x={-110} y={105} text="1" color={C.amber} size={52} />
    <Label x={110} y={105} text="2" color={C.amber} size={52} />
  </g>
);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1180, background: C.card, borderRadius: 32, padding: '40px 52px', fontSize: 52, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        The pages of a book are <Mark on={at(scene, 1, 0.3)}>numbered in order starting at 1</Mark>. The{' '}
        <Mark on={at(scene, 2, 0.2)}>total number of digits</Mark> printed is <Mark on={at(scene, 2, 0.55)}>exactly twice the number of pages</Mark>. How many pages does the book have?
      </div>
      <Choices x={100} y={640} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 3, 0.45 + i * 0.09)} />
      <Stage>
        <Book x={1590} y={400} opacity={ease(f, 8, 14)} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ex = [
    { p: 7, x: 200, t: at(scene, 0, 0.3), lab: '1 digit' },
    { p: 42, x: 520, t: at(scene, 1, 0.1), lab: '2 digits' },
    { p: 105, x: 860, t: at(scene, 1, 0.55), lab: '3 digits' },
  ];
  const small = range(12).map((i) => i + 1);
  const w = rowWidth(small);
  const x0 = 120;
  return (
    <>
      <Stage>
        {ex.map((e) => (
          <g key={e.p}>
            <Page p={e.p} x={e.x} y={220} s={pop(f, e.t, fps)} />
            <Label x={e.x} y={315} text={e.lab} color={DC[nd(e.p)]} opacity={ease(f, e.t + 6, 10)} />
          </g>
        ))}
        <Pages ps={small} x0={x0} y={480} start={at(scene, 2, 0.1)} stagger={3} />
        {/* brackets under the groups */}
        <g opacity={ease(f, at(scene, 2, 0.45), 10)}>
          <path d={`M ${x0} 545 V 560 H ${x0 + 9 * 68 + 8 * 14} V 545`} fill="none" stroke={C.amber} strokeWidth={5} />
          <Label x={x0 + (9 * 68 + 8 * 14) / 2} y={600} text="9 × 1" color={C.amber} />
        </g>
        <g opacity={ease(f, at(scene, 2, 0.75), 10)}>
          <path d={`M ${x0 + 9 * 82} 545 V 560 H ${x0 + w} V 545`} fill="none" stroke={C.blue} strokeWidth={5} />
          <Label x={x0 + 9 * 82 + (w - 9 * 82) / 2} y={600} text="3 × 2" color={C.blue} />
        </g>
      </Stage>
      <Eq x={1240} y={430} start={at(scene, 3, 0.05)} size={60} tex="9 + 6 = 15 \text{ digits}" />
      <Eq x={1240} y={530} start={at(scene, 3, 0.4)} size={60} tex="2 \times 12 = 24" />
      <Text x={1240} y={630} w={600} size={52} weight={900} color={C.red} style={fadeUp(f, at(scene, 3, 0.7))}>
        too few ✗
      </Text>
      <Card x={120} y={680} w={1000} h={130} style={{ ...fadeUp(f, at(scene, 4, 0.2)), border: `5px solid ${C.primary}` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center' }}>
          <Tex tex="\text{digits} = 2 \times \text{pages}" size={64} color={C.primary} />
        </div>
      </Card>
    </>
  );
};

const makePause = (k: number, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={110} y={200} w={880} h={540} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 44, fontSize: 52, fontWeight: 700, lineHeight: 1.45 }}>
          Pages are numbered from 1. The digits printed are <b style={{ color: C.primary }}>exactly {k === 2 ? 'twice' : 'THREE times'}</b> the number of pages. How many pages?
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 50, textAlign: 'center' }}>
          <Tex tex={`\\text{digits} = ${k} \\times \\text{pages}`} size={60} color={C.primary} />
        </div>
      </Card>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} />
    </>
  );
};

// ---- Solution 1: count in groups ----

const Groups: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows = [
    { lt: at(scene, 0, 0.35), t: at(scene, 1, 0.1), color: C.amber, label: 'Pages 1–9', tex: '9 \\times 1 = 9' },
    { lt: at(scene, 0, 0.6), t: at(scene, 2, 0.1), color: C.blue, label: 'Pages 10–99', tex: '90 \\times 2 = 180' },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: 120, top: 170 + i * 115, display: 'flex', alignItems: 'center', gap: 40, whiteSpace: 'nowrap' }}>
          <div style={{ width: 380, fontSize: 52, fontWeight: 900, color: r.color, ...fadeUp(f, r.lt) }}>{r.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, ...fadeUp(f, r.t) }}>
            <Tex tex={r.tex} size={60} />
            <span style={{ fontSize: 48, fontWeight: 800, color: C.muted }}>digits</span>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 120, top: 400, width: 980, height: 6, borderRadius: 3, background: C.line, opacity: ease(f, at(scene, 3), 10) }} />
      <Eq x={120} y={430} start={at(scene, 3, 0.1)} size={64} tex="99 \text{ pages}: \; 9 + 180 = 189 \text{ digits}" />
      <Eq x={120} y={545} start={at(scene, 4, 0.2)} size={64} tex="\text{target: } 2 \times 99 = 198" />
      <Text x={850} y={548} w={460} size={56} weight={900} color={C.red} style={fadeUp(f, at(scene, 4, 0.7))}>
        9 digits short
      </Text>
      {/* the gap stays: each 2-digit page */}
      <Card x={1240} y={170} w={600} h={360} style={{ ...fadeUp(f, at(scene, 5, 0.05)) }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontSize: 44, fontWeight: 900, color: C.blue }}>each 2-digit page</div>
        <div style={{ position: 'absolute', left: 50, top: 110, fontSize: 52, fontWeight: 800, ...fadeUp(f, at(scene, 5, 0.2)) }}>
          digits <span style={{ color: C.blue }}>+2</span>
        </div>
        <div style={{ position: 'absolute', left: 50, top: 185, fontSize: 52, fontWeight: 800, ...fadeUp(f, at(scene, 5, 0.45)) }}>
          target <span style={{ color: C.blue }}>+2</span>
        </div>
        <div style={{ position: 'absolute', left: 50, top: 265, fontSize: 52, fontWeight: 900, color: C.red, ...fadeUp(f, at(scene, 5, 0.7)) }}>gap stays 9</div>
      </Card>
      <Card x={120} y={680} w={1720} h={130} style={{ ...fadeUp(f, at(scene, 6, 0.1)), border: `5px solid ${C.violet}` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 32, textAlign: 'center', fontSize: 56, fontWeight: 900 }}>
          Under 100 pages never works → we need <span style={{ color: C.violet }}>3-digit pages</span>
        </div>
      </Card>
    </>
  );
};

const THREE = range(9).map((i) => 100 + i);

const Gap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // page 100 lands on line 0; pages 101..108 step through lines 2-3
  const tStart = [at(scene, 0, 0.15), ...range(8).map((i) => Math.round(at(scene, 2, 0.15) + ((at(scene, 3, 0.45) - at(scene, 2, 0.15)) * i) / 7))];
  const added = tStart.filter((t) => f >= t + 4).length;
  const gap = 9 - added;
  const step = 170;
  const x0 = 390;
  const done = at(scene, 5, 1);
  const checkIn = at(scene, 4);
  const topOut = fadeTo(f, checkIn, 0);
  return (
    <>
      <Stage>
        <g opacity={topOut}>
          {THREE.map((p, i) => (
            <Page key={p} p={p} x={x0 + i * step} y={210} s={pop(f, tStart[i], fps)} />
          ))}
          {/* the gap: 9 red missing-digit slots, each filled green by a 3-digit page */}
          <Label x={120} y={360} text="gap" color={C.red} anchor="start" opacity={ease(f, 0, 10)} />
          {range(9).map((i) => {
            const filled = f >= tStart[i] + 4;
            return <Chip key={i} x={x0 + i * step} y={360} w={110} label={filled ? '✓' : '?'} color={filled ? C.green : C.red} s={1} filled={filled} />;
          })}
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 120, top: 450, display: 'flex', gap: 60, alignItems: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.4)), opacity: ease(f, at(scene, 0, 0.4)) * topOut }}>
        <span style={{ fontSize: 52, fontWeight: 800 }}>
          each 3-digit page: digits <span style={{ color: C.violet }}>+3</span>, target <span style={{ color: C.violet }}>+2</span>
        </span>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 560, fontSize: 64, fontWeight: 900, color: gap === 0 ? C.green : C.red, opacity: ease(f, at(scene, 1, 0.1)) * topOut, whiteSpace: 'nowrap' }}>
        gap: {gap} {gap === 0 ? 'digits ✓' : gap === 1 ? 'digit short' : 'digits short'}
      </div>
      <div style={{ position: 'absolute', left: 820, top: 560, fontSize: 64, fontWeight: 900, color: C.violet, ...fadeUp(f, at(scene, 3, 0.55)), opacity: ease(f, at(scene, 3, 0.55)) * topOut, whiteSpace: 'nowrap' }}>
        → page 108
      </div>
      {/* check */}
      <div style={{ position: 'absolute', left: 120, top: 200, display: 'flex', gap: 30, whiteSpace: 'nowrap', ...fadeUp(f, checkIn + 4) }}>
        {[
          ['Pages 1–9', '9', C.amber],
          ['Pages 10–99', '180', C.blue],
          ['Pages 100–108', '27', C.violet],
        ].map(([l, v, c]) => (
          <Card key={l} x={0} y={0} w={480} h={170} style={{ position: 'relative' }}>
            <div style={{ textAlign: 'center', marginTop: 22, fontSize: 46, fontWeight: 900, color: c }}>{l}</div>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <Tex tex={`${v} \\text{ digits}`} size={60} />
            </div>
          </Card>
        ))}
      </div>
      <Eq x={120} y={430} start={at(scene, 4, 0.3)} size={68} tex="9 + 180 + 27 = 216 \text{ digits}" />
      <Eq x={120} y={550} start={at(scene, 5, 0.1)} size={68} color={C.green} tex="2 \times 108 = 216 \;\checkmark" />
      <Text x={1200} y={680} w={400} size={52} weight={900} color={C.green} style={fadeUp(f, at(scene, 5, 0.6))}>
        Choice C
      </Text>
      {f >= checkIn && <Answer x={1620} y={520} value="108" chime={CHIME} start={done} />}
      <Confetti x={1620} y={520} start={done} seed={7} />
    </>
  );
};

// ---- Solution 2: the balance trick ----

const Balance: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { t: at(scene, 1, 0.05), p: 7, pay: 'pays 1', res: '−1 each', c: C.amber },
    { t: at(scene, 3, 0.05), p: 42, pay: 'pays 2', res: 'even', c: C.blue },
    { t: at(scene, 4, 0.05), p: 105, pay: 'pays 3', res: '+1 each', c: C.violet },
  ];
  const step = 142;
  const cx = (i: number) => 400 + i * step;
  const shortIn = at(scene, 2, 0.1);
  const pairIn = at(scene, 5, 0.25);
  const pairDur = at(scene, 5, 0.7) - pairIn;
  const extraIn = at(scene, 6, 0.3);
  const done = at(scene, 7, 1);
  return (
    <>
      <Text x={120} y={150} w={1700} size={52} weight={900} style={fadeUp(f, at(scene, 0, 0.2))}>
        Every page <span style={{ color: C.primary }}>owes 2 digits</span>
      </Text>
      {cards.map((k, i) => (
        <Card key={i} x={120 + i * 580} y={240} w={540} h={170} style={fadeUp(f, k.t)}>
          <svg width={200} height={170} style={{ position: 'absolute', left: 10, top: 0 }}>
            <Page p={k.p} x={100} y={85} />
          </svg>
          <div style={{ position: 'absolute', left: 210, top: 28, fontSize: 48, fontWeight: 800 }}>{k.pay}</div>
          <div style={{ position: 'absolute', left: 210, top: 92, fontSize: 52, fontWeight: 900, color: k.c }}>{k.res}</div>
        </Card>
      ))}
      <Stage>
        <Label x={120} y={510} text="short" color={C.amber} anchor="start" opacity={ease(f, shortIn, 10)} />
        {range(9).map((i) => (
          <Chip key={i} x={cx(i)} y={510} label={String(i + 1)} color={C.amber} s={pop(f, shortIn + i * 3, fps)} />
        ))}
        <Label x={120} y={630} text="extra" color={C.violet} anchor="start" opacity={ease(f, pairIn, 10)} />
        {range(9).map((i) => {
          const t = pairIn + Math.round((pairDur * i) / 9);
          return <Chip key={i} x={cx(i)} y={630} label={String(100 + i)} w={124} color={C.violet} s={pop(f, t, fps)} filled />;
        })}
        {range(9).map((i) => {
          const t = pairIn + Math.round((pairDur * i) / 9) + 6;
          const o = ease(f, t, 8);
          return o > 0 ? <line key={i} x1={cx(i)} x2={cx(i)} y1={552} y2={588} stroke={C.green} strokeWidth={6} strokeLinecap="round" opacity={o} /> : null;
        })}
        {[109].map((p, i) => (
          <Chip key={p} x={cx(9) + 40 + i * step} y={630} label={String(p)} w={124} color={C.red} s={pop(f, extraIn + i * 8, fps)} />
        ))}
      </Stage>
      <Text x={cx(9) + 40} y={680} w={300} size={48} weight={900} align="center" color={C.red} style={fadeUp(f, extraIn + 16)}>
        too many
      </Text>
      <Eq x={120} y={710} start={at(scene, 5, 0.1)} size={60} color={C.ink} tex="-9 + 9 = 0" />
      {f >= at(scene, 7) && <AnswerPill x={1100} y={745} value="108 pages" start={done} />}
    </>
  );
};

const Compare: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const items = [
    { t: at(scene, 0, 0.5), title: 'Count in groups', body: 'Gives you the totals to check.', c: C.blue },
    { t: at(scene, 1, 0.1), title: 'Balance trick', body: 'Faster. It skips all the big sums.', c: C.violet },
  ];
  return (
    <>
      <Text x={960} y={170} w={1500} size={64} weight={900} align="center" style={fadeUp(f, 0)}>
        Which way would you pick?
      </Text>
      {items.map((k, i) => (
        <Card key={i} x={160 + i * 830} y={320} w={770} h={380} style={{ ...fadeUp(f, k.t), border: `6px solid ${k.c}` }}>
          <div style={{ position: 'absolute', left: 50, top: 50, fontSize: 64, fontWeight: 900, color: k.c }}>{k.title}</div>
          <div style={{ position: 'absolute', left: 50, top: 170, width: 670, fontSize: 52, fontWeight: 700, lineHeight: 1.35 }}>{k.body}</div>
        </Card>
      ))}
    </>
  );
};

const NOTES: (string | null)[] = ['forgets pages 1–9 have 1 digit: 9 short', '8 digits short', null, '243 digits, not 234: 9 too many', 'that counts digits, not pages'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 0, 0.15), at(scene, 1, 0.15), Infinity, at(scene, 2, 0.15), at(scene, 4, 0.15)];
  const right = f >= at(scene, 5, 0.1);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 2 && right;
          const border = wrong ? C.red : ok ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 230, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.muted, marginTop: 18 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 130, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={76} color={wrong ? C.red : ok ? C.green : C.ink} />
                </div>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 22, fontSize: 48, fontWeight: 800, textAlign: 'center', lineHeight: 1.2, color: C.ink, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Check x={300} y={720} start={at(scene, 5, 0.2)}>
        <span style={{ fontSize: 52 }}>Habit: count the digits for your answer, and check it!</span>
      </Check>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={960} y={190} w={1600} size={64} weight={900} align="center" style={fadeUp(f, 0)}>
        Your turn!
      </Text>
      <Card x={260} y={320} w={1400} h={300} style={fadeUp(f, at(scene, 0, 0.2))}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center' }}>
          <Tex tex="\text{digits} = 3 \times \text{pages}" size={84} color={C.primary} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontSize: 56, fontWeight: 800, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          How many pages?
        </div>
      </Card>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows = [
    { lt: at(scene, 0, 0.5), t: at(scene, 1, 0.1), label: '1-digit pages', c: C.amber, tex: '9 \\times 2 = 18', tail: 'short' },
    { lt: at(scene, 0, 0.7), t: at(scene, 2, 0.1), label: '2-digit pages', c: C.blue, tex: '90 \\times 1 = 90', tail: 'short' },
  ];
  const done = at(scene, 5, 1);
  return (
    <>
      <Text x={120} y={150} w={1700} size={52} weight={900} style={fadeUp(f, 4)}>
        Every page <span style={{ color: C.primary }}>owes 3 digits</span>
      </Text>
      {rows.map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: 120, top: 250 + i * 100, display: 'flex', alignItems: 'center', gap: 36, whiteSpace: 'nowrap' }}>
          <div style={{ width: 380, fontSize: 50, fontWeight: 900, color: r.c, ...fadeUp(f, r.lt) }}>{r.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, ...fadeUp(f, r.t) }}>
            <Tex tex={r.tex} size={60} />
            <span style={{ fontSize: 50, fontWeight: 800, color: C.red }}>{r.tail}</span>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 120, top: 455, width: 1000, height: 6, borderRadius: 3, background: C.line, opacity: ease(f, at(scene, 3), 10) }} />
      <div style={{ position: 'absolute', left: 120, top: 480, display: 'flex', alignItems: 'center', gap: 30, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <Tex tex="18 + 90 = 108" size={64} />
        <span style={{ fontSize: 54, fontWeight: 900, color: C.red }}>missing digits</span>
      </div>
      <Card x={1240} y={250} w={600} h={300} style={fadeUp(f, at(scene, 4, 0.05))}>
        <div style={{ position: 'absolute', left: 44, top: 36, fontSize: 50, fontWeight: 800 }}>
          <span style={{ color: C.violet }}>3-digit</span> pages: even
        </div>
        <div style={{ position: 'absolute', left: 44, top: 130, fontSize: 50, fontWeight: 800, ...fadeUp(f, at(scene, 4, 0.5)) }}>
          <span style={{ color: C.primary }}>4-digit</span> pages:
        </div>
        <div style={{ position: 'absolute', left: 44, top: 200, fontSize: 50, fontWeight: 900, color: C.primary, ...fadeUp(f, at(scene, 4, 0.55)) }}>+1 extra each</div>
      </Card>
      <div style={{ position: 'absolute', left: 120, top: 610, display: 'flex', alignItems: 'center', gap: 30, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 5, 0.1)) }}>
        <span style={{ fontSize: 52, fontWeight: 800 }}>108 four-digit pages:</span>
        <Tex tex="1000 \text{ to } 1107" size={64} color={C.primary} />
      </div>
      <Stage>
        <Pages ps={[1000, 1001, '…', 1107]} x0={120} y={772} opacity={ease(f, at(scene, 5, 0.6), 10)} />
      </Stage>
      {f >= at(scene, 5) && <AnswerPill x={1500} y={720} value="1107 pages" start={done} />}
      <Confetti x={1500} y={720} start={done} seed={5} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 650, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1460, fontSize: 58, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.05)) }}>
          Count the digits in groups of pages.
        </div>
        <svg width={1460} height={140} style={{ position: 'absolute', left: 70, top: 230, opacity: ease(f, at(scene, 1, 0.3), 12) }}>
          <Pages ps={[7]} x0={20} y={70} />
          <Label x={175} y={72} text="then" color={C.muted} size={48} />
          <Pages ps={[42]} x0={270} y={70} />
          <Label x={475} y={72} text="then" color={C.muted} size={48} />
          <Pages ps={[105]} x0={580} y={70} />
        </svg>
        <div style={{ position: 'absolute', left: 70, top: 430, width: 1460, fontSize: 58, fontWeight: 900, lineHeight: 1.2, color: C.violet, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          Track the gap to the target, and find where it hits zero.
        </div>
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
  try1: makePause(2, 10),
  groups: Groups,
  gap: Gap,
  balance: Balance,
  compare: Compare,
  traps: Traps,
  variant: Variant,
  try2: makePause(3, 12),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + page tiles 1, 2, 3, 4, … ? and the digits rule, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Think it's", <span style={{ color: C.red }}>99?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      {[1, 2, 3, 4].map((p, i) => (
        <Page key={p} p={p} x={95 + i * 163} y={110} s={2} />
      ))}
      <text x={340} y={290} fontFamily={NUNITO} fontWeight={900} fontSize={110} fill={C.muted} textAnchor="middle">…</text>
      <Page p="?" x={340} y={430} s={2.2} color={C.violet} />
    </svg>
    <div style={{ position: 'absolute', right: 20, bottom: 36, width: 680, textAlign: 'center' }}>
      <Tex tex={'\\text{digits} = 2 \\times \\text{pages}'} size={58} color={C.ink} />
    </div>
  </ThumbFrame>
);

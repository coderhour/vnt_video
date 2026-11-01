import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-lcm-72-pairs';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GREEN_SOFT = 'rgba(12, 194, 129, 0.30)';
const VIOLET_SOFT = 'rgba(123, 97, 255, 0.26)';
const RED_SOFT = 'rgba(239, 67, 67, 0.14)';

// ---------- small helpers ----------

/** A maths expression that fades up at `start`. */
const Ex: React.FC<{ x: number; y: number; tex: string; size?: number; color?: string; start: number; center?: number }> = ({ x, y, tex, size = 64, color = C.ink, start, center }) => {
  const f = useCurrentFrame();
  const style: React.CSSProperties = center
    ? { position: 'absolute', left: 0, width: 1920, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }
    : { position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) };
  return (
    <div style={style}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const PromptText: React.FC<{ n: string; m1: number; m2: number }> = ({ n, m1, m2 }) => (
  <>
    How many <Mark on={m1}>ordered pairs (a, b)</Mark> of positive whole numbers have <Mark on={m2}>least common multiple {n}</Mark>?
  </>
);

const PromptCard: React.FC<{ x: number; y: number; w: number; size: number; n: string; m1: number; m2: number; start: number }> = ({ x, y, w, size, n, m1, m2, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 32, padding: '32px 44px', fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      <PromptText n={n} m1={m1} m2={m2} />
    </div>
  );
};

// ---------- exponent grid (axes are EXPONENTS, not divisor values) ----------

type CellKind = 'plain' | 'col' | 'row' | 'corner' | 'good' | 'miss';
const KC: Record<CellKind, { bg: string; bd: string }> = {
  plain: { bg: C.card, bd: C.line },
  col: { bg: GREEN_SOFT, bd: C.primary },
  row: { bg: VIOLET_SOFT, bd: C.violet },
  corner: { bg: `linear-gradient(135deg, rgba(12,194,129,0.55) 50%, rgba(123,97,255,0.5) 50%)`, bd: C.ink },
  good: { bg: GREEN_SOFT, bd: C.primary },
  miss: { bg: RED_SOFT, bd: C.red },
};

const ExpGrid: React.FC<{
  x: number;
  y: number;
  n: number;
  S: number;
  kind?: (c: number, r: number) => CellKind;
  pulse?: [number, number] | null;
  labels?: boolean;
  what?: string; // "twos" / "threes"
  colsOp?: number;
  rowsOp?: number;
  start?: number;
  op?: number;
  block?: { k: number; p: number } | null;
}> = ({ x, y, n, S, kind = () => 'plain', pulse = null, labels = true, what = 'twos', colsOp = 1, rowsOp = 1, start = 0, op = 1, block = null }) => {
  const f = useCurrentFrame();
  const g = ease(f, start, 12);
  return (
    <div style={{ opacity: op * g }}>
      {labels && (
        <>
          <div style={{ position: 'absolute', left: x - 100, width: n * S + 200, top: y - 150, textAlign: 'center', fontSize: 46, fontWeight: 900, color: C.violet, opacity: colsOp }}>
            {what} in a →
          </div>
          {range(n).map((c) => (
            <div key={c} style={{ position: 'absolute', left: x + c * S, width: S, top: y - 74, textAlign: 'center', fontSize: 48, fontWeight: 800, color: C.muted, opacity: colsOp }}>
              {c}
            </div>
          ))}
          <div style={{ position: 'absolute', left: x - 125 - 200, width: 400, top: y + (n * S) / 2 - 30, textAlign: 'center', fontSize: 46, fontWeight: 900, color: C.blue, transform: 'rotate(90deg)', opacity: rowsOp }}>
            {what} in b →
          </div>
          {range(n).map((r) => (
            <div key={r} style={{ position: 'absolute', left: x - 64, width: 50, top: y + r * S + S / 2 - 33, textAlign: 'center', fontSize: 48, fontWeight: 800, color: C.muted, opacity: rowsOp }}>
              {r}
            </div>
          ))}
        </>
      )}
      {range(n).flatMap((r) =>
        range(n).map((c) => {
          const k = kind(c, r);
          const isPulse = pulse && pulse[0] === c && pulse[1] === r;
          const sc = isPulse ? 1 + 0.09 * Math.sin(f / 3.2) : 1;
          return (
            <div
              key={`${c}-${r}`}
              style={{
                position: 'absolute',
                left: x + c * S + 4,
                top: y + r * S + 4,
                width: S - 8,
                height: S - 8,
                borderRadius: Math.min(16, S / 6),
                background: KC[k].bg,
                border: `${k === 'corner' ? 6 : 3}px solid ${KC[k].bd}`,
                transform: `scale(${sc})`,
                zIndex: isPulse ? 2 : 1,
                opacity: ease(f, start + (r + c) * 1.5, 10),
              }}
            />
          );
        }),
      )}
      {block && (
        <div style={{ position: 'absolute', left: x + 2, top: y + 2, width: block.k * S - 4, height: block.k * S - 4, border: `8px dashed ${C.red}`, borderRadius: 14, opacity: block.p, zIndex: 3 }} />
      )}
    </div>
  );
};

// ---------- divisor table (values) ----------

const TX = 440;
const TY = 410;
const TW = 200;
const TH = 110;
const cellX = (c: number) => TX + c * TW;
const cellY = (r: number) => TY + r * TH;
const VAL = (c: number, r: number) => 2 ** c * 3 ** r;

type Hl = { bg?: string; bd?: string; w?: number; s?: number };

const DivTable: React.FC<{
  hdr?: [number, number];
  appear?: (c: number, r: number) => number;
  hl?: (c: number, r: number) => Hl;
  badges?: Record<number, { v: string; p: number }>;
  op?: number;
}> = ({ hdr = [1, 1], appear = () => 1, hl = (): Hl => ({}), badges = {}, op = 1 }) => (
  <div style={{ opacity: op }}>
    <div style={{ position: 'absolute', left: TX, width: 4 * TW, top: TY - 125, textAlign: 'center', fontSize: 40, fontWeight: 900, color: C.violet, opacity: hdr[0] }}>powers of 2 →</div>
    {range(4).map((c) => (
      <div key={c} style={{ position: 'absolute', left: cellX(c), width: TW, top: TY - 66, textAlign: 'center', fontSize: 52, fontWeight: 900, opacity: hdr[0] }}>
        {2 ** c}
      </div>
    ))}
    <div style={{ position: 'absolute', left: 30, width: 320, top: TY + TH * 1.5 - 28, fontSize: 40, fontWeight: 900, color: C.blue, opacity: hdr[1] }}>powers of 3 ↓</div>
    {range(3).map((r) => (
      <div key={r} style={{ position: 'absolute', left: TX - 170, width: 150, top: cellY(r) + 20, textAlign: 'right', fontSize: 52, fontWeight: 900, opacity: hdr[1] }}>
        ×{3 ** r}
      </div>
    ))}
    {range(3).flatMap((r) =>
      range(4).map((c) => {
        const h = hl(c, r);
        const a = appear(c, r);
        const b = badges[r * 4 + c];
        return (
          <div
            key={`${c}-${r}`}
            style={{
              position: 'absolute',
              left: cellX(c) + 4,
              top: cellY(r) + 4,
              width: TW - 8,
              height: TH - 8,
              borderRadius: 18,
              background: h.bg ?? C.card,
              border: `${h.w ?? 3}px solid ${h.bd ?? C.line}`,
              transform: `scale(${(h.s ?? 1) * (0.7 + 0.3 * a)})`,
              opacity: a,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 14,
              fontSize: 52,
              fontWeight: 900,
              zIndex: h.w && h.w > 3 ? 2 : 1,
            }}
          >
            {VAL(c, r)}
            {b && b.p > 0 && (
              <div style={{ position: 'absolute', right: 8, top: '50%', marginTop: -31, width: 62, height: 62, borderRadius: '50%', background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, transform: `scale(${b.p})` }}>
                {b.v}
              </div>
            )}
          </div>
        );
      }),
    )}
  </div>
);

const Arrow: React.FC<{ from: [number, number]; to: [number, number]; p: number; color?: string }> = ({ from, to, p, color = C.ink }) => {
  if (p <= 0) return null;
  const x2 = from[0] + (to[0] - from[0]) * p;
  const y2 = from[1] + (to[1] - from[1]) * p;
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const h = 30;
  return (
    <g stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={from[0]} y1={from[1]} x2={x2} y2={y2} />
      <path d={`M ${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)} L ${x2} ${y2} L ${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`} />
    </g>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pairs = ['(8, 9)', '(72, 1)', '(24, 9)'];
  return (
    <>
      <Ex x={0} y={150} tex={'\\operatorname{lcm}(a, b) = 72'} size={130} start={4} center={1} />
      <div style={{ position: 'absolute', left: 0, width: 1920, top: 385, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.7)) }}>
        <Pill x={0} y={0} color={C.violet} style={{ position: 'static', fontSize: 64, padding: '10px 44px' }}>
          ? pairs
        </Pill>
      </div>
      {pairs.map((p, i) => {
        const s = pop(f, at(scene, 1, 0.45 + i * 0.16), 30);
        return s > 0 ? (
          <div key={p} style={{ position: 'absolute', left: 375 + i * 420, top: 535, width: 330, textAlign: 'center', background: C.card, borderRadius: 28, padding: '18px 0', fontSize: 74, fontWeight: 900, boxShadow: '0 8px 24px rgba(30,40,80,0.09)', transform: `scale(${s})` }}>
            {p}
          </div>
        ) : null;
      })}
      <div style={{ position: 'absolute', left: 0, width: 1920, top: 690, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
      </div>
    </>
  );
};

const CHOICES = ['12', '18', '24', '35', '70'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <PromptCard x={210} y={190} w={1500} size={56} n="72" m1={at(scene, 1, 0.3)} m2={at(scene, 2, 0.3)} start={at(scene, 1, 0)} />
      <div style={{ position: 'absolute', left: 0, top: 0, transform: 'scale(1.45)', transformOrigin: '0 0' }}><Choices x={338} y={400} start={(i) => at(scene, 3, 0.25 + i * 0.12)} items={CHOICES.map((c) => <Tex key={c} tex={c} size={50} />)} /></div>
      <Text x={960} y={110} w={1200} size={50} weight={900} color={C.muted} align="center" style={fadeUp(f, 0)}>
        Today's question
      </Text>
    </>
  );
};

const mult = (k: number, n: number) => range(Math.floor(72 / k)).map((i) => (i + 1) * k).filter((v) => v <= 72 && n > 0);

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m8 = mult(8, 1);
  const m9 = mult(9, 1);
  const rowsOut = 1 - ease(f, at(scene, 2, 0.02), 10);
  const hi = ease(f, at(scene, 1, 0.72), 12);
  const box = (v: number, i: number, y: number, t0: number) => {
    const a = ease(f, at(scene, 1, t0 + i * 0.05), 10);
    const is72 = v === 72;
    return (
      <div key={v} style={{ position: 'absolute', left: 540 + i * 126, top: y, width: 116, height: 84, borderRadius: 16, textAlign: 'center', lineHeight: '84px', fontSize: 50, fontWeight: 900, background: is72 ? `rgba(12,194,129,${0.12 + 0.55 * hi})` : C.card, border: `${is72 && hi > 0.5 ? 6 : 3}px solid ${is72 && hi > 0.5 ? C.primary : C.line}`, opacity: a * rowsOut, transform: `scale(${0.8 + 0.2 * a})` }}>
        {v}
      </div>
    );
  };
  const pairChip = (txt: string, x: number, t: number) => {
    const s = pop(f, at(scene, 2, t), 30);
    return s > 0 ? (
      <div style={{ position: 'absolute', left: x, top: 330, width: 380, textAlign: 'center', background: C.card, borderRadius: 28, padding: '22px 0', fontSize: 84, fontWeight: 900, boxShadow: '0 8px 24px rgba(30,40,80,0.09)', transform: `scale(${s})` }}>
        {txt}
      </div>
    ) : null;
  };
  return (
    <>
      <div style={{ position: 'absolute', left: 240, top: 125, width: 1500, fontSize: 46, fontWeight: 600, whiteSpace: 'nowrap', ...fadeUp(f, 0) }}>
        How many <Mark on={at(scene, 2, 0.1)}>ordered</Mark> pairs (a, b) have least common multiple 72?
      </div>
      <div style={{ position: 'absolute', left: 240, top: 220, background: C.card, borderRadius: 28, padding: '14px 40px', fontSize: 54, fontWeight: 700, boxShadow: '0 6px 20px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <Mark on={at(scene, 0, 0.45)}>LCM</Mark> = the smallest number both go into
      </div>
      <div style={{ position: 'absolute', left: 60, top: 352, width: 460, fontSize: 42, fontWeight: 900, color: C.primary, opacity: ease(f, at(scene, 1, 0.05), 10) * rowsOut, textAlign: 'right' }}>multiples of 8</div>
      <div style={{ position: 'absolute', left: 60, top: 472, width: 460, fontSize: 42, fontWeight: 900, color: C.violet, opacity: ease(f, at(scene, 1, 0.35), 10) * rowsOut, textAlign: 'right' }}>multiples of 9</div>
      {m8.map((v, i) => box(v, i, 340, 0.08))}
      {m9.map((v, i) => box(v, i, 460, 0.38))}
      <div style={{ position: 'absolute', left: 1430, top: 560, fontSize: 40, fontWeight: 900, color: C.primary, opacity: hi * rowsOut }}>first shared!</div>
      <div style={{ opacity: rowsOut }}>
        <Check x={540} y={590} start={at(scene, 1, 0.8)}>
          <Tex tex={'\\operatorname{lcm}(8, 9) = 72'} size={54} />
        </Check>
      </div>
      {pairChip('(8, 9)', 400, 0.3)}
      {pairChip('(9, 8)', 1140, 0.5)}
      <div style={{ position: 'absolute', left: 0, width: 1920, top: 520, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.72)) }}>
        <Pill x={0} y={0} color={C.red} style={{ position: 'static', display: 'inline-block', fontSize: 58, padding: '10px 44px' }}>
          2 different pairs
        </Pill>
      </div>
    </>
  );
};

const makePause = (seconds: number, n: string, withChoices: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <PromptCard x={100} y={170} w={1000} size={54} n={n} m1={9999} m2={9999} start={4} />
      {withChoices && <div style={{ position: 'absolute', left: 0, top: 0, transform: 'scale(1.3)', transformOrigin: '0 0' }}><Choices x={138} y={470} start={() => 6} items={CHOICES.map((c) => <Tex key={c} tex={c} size={50} />)} /></div>}
      {!withChoices && (
        <div style={{ position: 'absolute', left: 100, top: 560, fontSize: 60, fontWeight: 900, color: C.violet, ...fadeUp(f, 10) }}>
          Same idea. New number!
        </div>
      )}
      <Countdown scene={scene} seconds={seconds} x={1500} y={490} tick={TICK} />
    </>
  );
};

const Divisors: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hdr: [number, number] = [ease(f, at(scene, 2, 0.28), 12), ease(f, at(scene, 2, 0.5), 12)];
  const appear = (c: number, r: number) => ease(f, at(scene, 2, 0.45 + (r * 4 + c) * 0.04), 10);
  return (
    <>
      <Text x={TX} y={125} w={1300} size={54} weight={800} style={fadeUp(f, at(scene, 0, 0.1))}>
        a and b are divisors of 72
      </Text>
      <Ex x={TX} y={198} tex={'72 = 8 \\times 9 = 2\\cdot2\\cdot2 \\times 3\\cdot3'} size={56} start={at(scene, 1, 0.1)} />
      <DivTable hdr={hdr} appear={appear} />
    </>
  );
};

const Partners: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const colOn = ease(f, at(scene, 0, 0.4), 12);
  const rowOn = ease(f, at(scene, 1, 0.4), 12);
  const sel: [number, number] | null = f >= at(scene, 5, 0.05) ? [3, 2] : f >= at(scene, 3, 0.05) ? [3, 0] : f >= at(scene, 2, 0.1) ? [2, 1] : null;
  const selVal = sel ? VAL(sel[0], sel[1]) : null;
  const hl = (c: number, r: number): Hl => {
    const inCol = c === 3 && colOn > 0;
    const inRow = r === 2 && rowOn > 0;
    const gC = `rgba(12,194,129,${0.3 * colOn})`;
    const vC = `rgba(123,97,255,${0.26 * rowOn})`;
    const out: Hl = {};
    if (inCol && inRow) {
      out.bg = `linear-gradient(135deg, ${gC}, ${vC})`;
      out.bd = C.ink;
    } else if (inCol) {
      out.bg = gC;
      out.bd = C.primary;
    } else if (inRow) {
      out.bg = vC;
      out.bd = C.violet;
    }
    const pf = at(scene, 4, 0.08 + (c + 0) * 0.17);
    if (r === 2 && f >= pf && f < at(scene, 5, 0.05)) {
      out.bd = C.violet;
      out.w = 9;
    }
    if (f >= at(scene, 5, 0.3) + (r * 4 + c) * 2) {
      out.bd = C.primary;
      out.w = 8;
    }
    if (sel && sel[0] === c && sel[1] === r) {
      out.bd = C.ink;
      out.w = 10;
      out.s = 1.08;
    }
    if (c === 3 && r === 2 && f >= at(scene, 2, 0.65) && f < at(scene, 3, 0.05)) {
      out.bd = C.primary;
      out.w = 9;
    }
    return out;
  };
  const badges: Record<number, { v: string; p: number }> = {
    [1 * 4 + 2]: { v: '1', p: pop(f, at(scene, 2, 0.85), 30) },
    [0 * 4 + 3]: { v: '4', p: pop(f, at(scene, 4, 0.85), 30) },
    [2 * 4 + 3]: { v: '12', p: pop(f, at(scene, 5, 0.55), 30) },
  };
  const c12: [number, number] = [cellX(2) + 100, cellY(1) + 55];
  const c72: [number, number] = [cellX(3) + 100, cellY(2) + 55];
  const dir: [number, number] = [c72[0] - c12[0], c72[1] - c12[1]];
  const L = Math.hypot(dir[0], dir[1]);
  const u: [number, number] = [dir[0] / L, dir[1] / L];
  const arrowOn = f < at(scene, 3, 0.05) ? ease(f, at(scene, 2, 0.5), 14) : 0;
  return (
    <>
      <DivTable hl={hl} badges={badges} />
      <Stage>
        <Arrow from={[c12[0] + u[0] * 62, c12[1] + u[1] * 50]} to={[c72[0] - u[0] * 70, c72[1] - u[1] * 55]} p={arrowOn} />
      </Stage>
      <Pill x={1270} y={420} color={C.primary} style={{ fontSize: 38, opacity: colOn }}>multiple of 8 (three 2s)</Pill>
      <Pill x={1270} y={500} color={C.violet} style={{ fontSize: 38, opacity: rowOn }}>multiple of 9 (two 3s)</Pill>
      {sel && (
        <div style={{ position: 'absolute', left: 1270, top: 600, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, sel[1] === 1 ? 2 : sel[1] === 0 ? 3 : 5, sel[1] === 1 ? 0.1 : 0.05), 8) }}>
          <Tex tex={`a = ${selVal}`} size={64} />
        </div>
      )}
      <Text x={1270} y={690} w={600} size={48} weight={700} color={C.muted} style={fadeUp(f, at(scene, 2, 0.8))}>
        badge = partners for b
      </Text>
    </>
  );
};

const Fill: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const B = (i: number, t: number) => ({ v: '', p: 0, _i: i, _t: t });
  void B;
  const b: Record<number, { v: string; p: number }> = {};
  const one: [number, number][] = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]; // 1 2 4 3 6 12
  one.forEach(([c, r], i) => (b[r * 4 + c] = { v: '1', p: pop(f, at(scene, 0, 0.15 + i * 0.1), 30) }));
  b[0 * 4 + 3] = { v: '4', p: pop(f, at(scene, 1, 0.65), 30) };
  b[1 * 4 + 3] = { v: '4', p: pop(f, at(scene, 1, 0.75), 30) };
  [0, 1, 2].forEach((c, i) => (b[2 * 4 + c] = { v: '3', p: pop(f, at(scene, 2, 0.78 + i * 0.05), 30) }));
  b[2 * 4 + 3] = { v: '12', p: pop(f, at(scene, 2, 0.93), 30) };
  const flashAt = at(scene, 2, 0.45);
  const hl = (c: number, r: number): Hl => {
    const out: Hl = {};
    if (r === 2 && f >= flashAt && f < flashAt + 40) {
      out.bd = C.violet;
      out.w = 9;
    }
    if (c === 3 && f >= flashAt + 6 && f < flashAt + 50) {
      out.bd = C.primary;
      out.w = 9;
    }
    return out;
  };
  return (
    <>
      <DivTable badges={b} hl={hl} />
      <Text x={1270} y={430} w={600} size={48} weight={700} color={C.muted} style={fadeUp(f, at(scene, 0, 0.1))}>
        badge = partners for b
      </Text>
    </>
  );
};

const FULL: Record<number, { v: string; p: number }> = {};
range(3).forEach((r) =>
  range(4).forEach((c) => {
    FULL[r * 4 + c] = { v: c === 3 ? (r === 2 ? '12' : '4') : r === 2 ? '3' : '1', p: 1 };
  }),
);

const Total1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const band = (r: number, t: number): boolean => f >= t && r >= 0;
  const hl = (c: number, r: number): Hl => {
    const on = (r === 0 && band(r, at(scene, 0, 0.1))) || (r === 1 && band(r, at(scene, 0, 0.72))) || (r === 2 && band(r, at(scene, 1, 0.1)));
    return on ? { bd: C.primary, w: 6, bg: 'rgba(12,194,129,0.10)' } : {};
  };
  const fade = 1 - 1 * ease(f, at(scene, 2, 0.25), 10);
  return (
    <>
      <DivTable badges={FULL} hl={hl} />
      <div style={{ opacity: fade }}>
        <Ex x={1270} y={cellY(0) + 20} tex={'1{+}1{+}1{+}4=7'} size={56} start={at(scene, 0, 0.12)} />
        <Ex x={1270} y={cellY(1) + 20} tex={'7'} size={58} start={at(scene, 0, 0.78)} />
        <Ex x={1270} y={cellY(2) + 20} tex={'3{+}3{+}3{+}12=21'} size={56} start={at(scene, 1, 0.12)} />
      </div>
      <Ex x={1270} y={235} tex={'7 + 7 + 21 = 35'} size={64} color={C.green} start={at(scene, 2, 0.42)} />
      <Answer x={1700} y={600} value="D" start={at(scene, 2, 0.88)} chime={CHIME} />
      <Confetti x={1700} y={600} start={at(scene, 2, 0.88)} seed={5} />
    </>
  );
};

const Maxrule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hi = ease(f, at(scene, 2, 0.1), 14);
  const G = (v: string, on: boolean) => (on ? `\\textcolor{#0cc281}{\\mathbf{${v}}}` : v);
  const hiOn = hi > 0.4;
  return (
    <>
      <Text x={250} y={140} w={1400} size={56} weight={800} style={fadeUp(f, at(scene, 0, 0.1))}>
        Look at each prime on its own: 2 and 3
      </Text>
      <Ex x={300} y={270} tex={`8 = 2^{${G('3', hiOn)}} \\cdot 3^{0}`} size={86} start={at(scene, 1, 0.3)} />
      <Ex x={300} y={410} tex={`18 = 2^{1} \\cdot 3^{${G('2', hiOn)}}`} size={86} start={at(scene, 1, 0.65)} />
      <Ex x={300} y={580} tex={`\\text{lcm} = 2^{${G('3', hiOn)}} \\cdot 3^{${G('2', hiOn)}} = 72`} size={86} start={at(scene, 2, 0.3)} />
      <Text x={300} y={715} w={1300} size={46} weight={800} color={C.primary} style={fadeUp(f, at(scene, 2, 0.55))}>
        3 twos from 8 · 2 threes from 18 (the bigger ones)
      </Text>
    </>
  );
};

const G2X = 380;
const G2Y = 300;
const G2S = 120;

const Grid2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tCol = at(scene, 3, 0.1);
  const tRow = at(scene, 3, 0.28);
  const tCorner = at(scene, 3, 0.52);
  const t5 = at(scene, 4, 0.05);
  const kind = (c: number, r: number): CellKind => {
    if (f >= t5) return c < 3 && r < 3 ? 'miss' : 'good';
    const corner = c === 3 && r === 3;
    if (corner && f >= tCorner) return 'corner';
    if (c === 3 && f >= tCol) return 'col';
    if (r === 3 && f >= tRow) return 'row';
    return 'plain';
  };
  const pulse: [number, number] | null = f >= tCorner && f < t5 ? [3, 3] : null;
  return (
    <>
      <ExpGrid x={G2X} y={G2Y} n={4} S={G2S} kind={kind} pulse={pulse} what="twos" start={at(scene, 0, 0.1)} colsOp={ease(f, at(scene, 0, 0.3), 12)} rowsOp={ease(f, at(scene, 1, 0.05), 12)} block={{ k: 3, p: ease(f, at(scene, 4, 0.2), 12) }} />
      <Ex x={1010} y={235} tex={'4 \\times 4 = 16'} size={64} start={at(scene, 1, 0.72)} />
      <Ex x={1010} y={350} tex={'\\text{most} = 3'} size={64} start={at(scene, 2, 0.5)} />
      <Text x={1010} y={430} w={850} size={48} weight={700} color={C.muted} style={fadeUp(f, at(scene, 2, 0.72))}>
        at least one has 3 twos
      </Text>
      <Ex x={1010} y={520} tex={'4 + 4 - 1 = 7'} size={64} start={at(scene, 3, 0.5)} />
      <Ex x={1010} y={640} tex={'16 - 9 = 7'} size={64} start={at(scene, 4, 0.5)} />
    </>
  );
};

const Grid3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tCol = at(scene, 1, 0.1);
  const tRow = at(scene, 1, 0.2);
  const tCorner = at(scene, 1, 0.3);
  const t2 = at(scene, 1, 0.58);
  const kind = (c: number, r: number): CellKind => {
    if (f >= t2) return c < 2 && r < 2 ? 'miss' : 'good';
    const corner = c === 2 && r === 2;
    if (corner && f >= tCorner) return 'corner';
    if (c === 2 && f >= tCol) return 'col';
    if (r === 2 && f >= tRow) return 'row';
    return 'plain';
  };
  const pulse: [number, number] | null = f >= tCorner && f < t2 ? [2, 2] : null;
  return (
    <>
      <ExpGrid x={G2X} y={G2Y} n={3} S={140} kind={kind} pulse={pulse} what="threes" start={at(scene, 0, 0.1)} colsOp={ease(f, at(scene, 0, 0.3), 12)} rowsOp={ease(f, at(scene, 0, 0.5), 12)} block={{ k: 2, p: ease(f, t2 + 6, 12) }} />
      <Ex x={1010} y={250} tex={'\\text{most} = 2'} size={64} start={at(scene, 1, 0.04)} />
      <Ex x={1010} y={380} tex={'3 + 3 - 1 = 5'} size={64} start={at(scene, 1, 0.4)} />
      <Ex x={1010} y={510} tex={'9 - 4 = 5'} size={64} start={at(scene, 1, 0.74)} />
    </>
  );
};

const Multiply: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const good4 = (c: number, r: number): CellKind => (c === 3 || r === 3 ? 'good' : 'plain');
  const good3 = (c: number, r: number): CellKind => (c === 2 || r === 2 ? 'good' : 'plain');
  return (
    <>
      <ExpGrid x={300} y={300} n={4} S={80} kind={good4} labels={false} start={at(scene, 0, 0.1)} />
      <ExpGrid x={760} y={300} n={3} S={80} kind={good3} labels={false} start={at(scene, 0, 0.3)} />
      <Ex x={300} y={640} tex={'7 \\text{ ways}'} size={60} color={C.violet} start={at(scene, 0, 0.5)} />
      <Ex x={720} y={640} tex={'5 \\text{ ways}'} size={60} color={C.blue} start={at(scene, 0, 0.75)} />
      <Ex x={1150} y={360} tex={'7 \\times 5 = 35'} size={96} color={C.green} start={at(scene, 1, 0.1)} />
      <Sequence from={at(scene, 1, 0.88)} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Text x={1130} y={520} w={720} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.5))}>
        Big number? One small grid per prime. No huge table!
      </Text>
    </>
  );
};

// ---------- common traps ----------

const TrapCard: React.FC<{ start: number; end: number; letter: string; val: string; good?: boolean; children?: React.ReactNode }> = ({ start, end, letter, val, good, children }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 10) * (1 - ease(f, end - 6, 8));
  if (o <= 0) return null;
  const col = good ? C.green : C.red;
  return (
    <div style={{ position: 'absolute', left: 260, top: 140, width: 1400, height: 650, background: C.card, border: `6px solid ${col}`, borderRadius: 36, boxShadow: '0 10px 36px rgba(30,40,80,0.09)', opacity: o, transform: `translateY(${(1 - ease(f, start, 10)) * 24}px)` }}>
      {letter && (
        <div style={{ position: 'absolute', left: 36, top: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: col, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{letter}</div>
          <div style={{ fontSize: 96, fontWeight: 900, color: col }}>{val}</div>
        </div>
      )}
      {children}
    </div>
  );
};

const Rel: React.FC<{ x: number; y: number; start: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, start, children, style }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start), ...style }}>{children}</div>;
};

const chip = (txt: string, color = C.ink, size = 56): React.CSSProperties & { children?: never } => ({ fontSize: size, color }) as never;
void chip;

const Chip: React.FC<{ children: React.ReactNode; border?: string; size?: number; bg?: string }> = ({ children, border = C.line, size = 54, bg = C.bg }) => (
  <div style={{ display: 'inline-block', background: bg, border: `4px solid ${border}`, borderRadius: 20, padding: '8px 26px', fontSize: size, fontWeight: 900 }}>{children}</div>
);

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => at(scene, i, 0);
  const DIVS = [1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72];
  const merge = ease(f, at(scene, 2, 0.5), 20);
  const bodyB1 = 1 - ease(f, s(3), 8);
  return (
    <>
      <Text x={960} y={330} w={1500} size={86} weight={900} align="center" style={{ opacity: ease(f, 6, 12) * (1 - ease(f, s(1) - 4, 8)) }}>
        Each wrong answer is a <span style={{ color: C.red }}>trap</span>
      </Text>

      <TrapCard start={s(1)} end={s(2)} letter="A" val="12">
        {DIVS.map((d, i) => (
          <div key={d} style={{ position: 'absolute', left: 60 + (i % 6) * 215, top: 190 + Math.floor(i / 6) * 110, opacity: ease(f, at(scene, 1, 0.12 + i * 0.04), 8), transform: `scale(${0.8 + 0.2 * ease(f, at(scene, 1, 0.12 + i * 0.04), 8)})` }}>
            <Chip size={56}>{d}</Chip>
          </div>
        ))}
        <Rel x={60} y={440} start={at(scene, 1, 0.62)} style={{ fontSize: 66, fontWeight: 900, color: C.red }}>
          12 divisors, not 12 pairs
        </Rel>
      </TrapCard>

      <TrapCard start={s(2)} end={s(4)} letter="B" val="18">
        <div style={{ opacity: bodyB1 }}>
          <Rel x={60 + merge * 250} y={200} start={at(scene, 2, 0.12)} style={{ opacity: ease(f, at(scene, 2, 0.12), 12) * (1 - merge) }}>
            <Chip size={72} border={C.red}>(8, 9)</Chip>
          </Rel>
          <Rel x={760 - merge * 250} y={200} start={at(scene, 2, 0.28)} style={{ opacity: ease(f, at(scene, 2, 0.28), 12) * (1 - merge) }}>
            <Chip size={72} border={C.red}>(9, 8)</Chip>
          </Rel>
          <div style={{ position: 'absolute', left: 60, top: 190, opacity: merge, whiteSpace: 'nowrap' }}>
            <Chip size={72} border={C.green}>(8, 9) = (9, 8)</Chip>
          </div>
          <Rel x={60} y={360} start={at(scene, 2, 0.35)} style={{ fontSize: 56, fontWeight: 800, color: C.muted }}>
            if order didn't matter
          </Rel>
          <Rel x={60} y={460} start={at(scene, 2, 0.75)} style={{ fontSize: 66, fontWeight: 900, color: C.red }}>
            two pairs become one!
          </Rel>
        </div>
        <Rel x={60} y={170} start={at(scene, 3, 0.2)}>
          <Chip size={64} border={C.violet}>(72, 72)</Chip>
        </Rel>
        <Rel x={500} y={186} start={at(scene, 3, 0.26)} style={{ fontSize: 50, fontWeight: 800, color: C.muted }}>
          alone: it has no twin
        </Rel>
        <Rel x={500} y={252} start={at(scene, 3, 0.5)} style={{ fontSize: 52, fontWeight: 800, color: C.muted }}>
          <Tex tex={'35 - 1 = 34'} size={52} color={C.muted} />
        </Rel>
        <Rel x={60} y={395} start={at(scene, 3, 0.68)}>
          <Tex tex={'\\dfrac{34}{2} + 1 = 18'} size={84} color={C.red} />
        </Rel>
      </TrapCard>

      <TrapCard start={s(4)} end={s(5)} letter="C" val="24">
        <Rel x={60} y={170} start={at(scene, 4, 0.1)}>
          <Tex tex={'2 \\times 12 = 24'} size={84} color={C.red} />
        </Rel>
        <Rel x={60} y={340} start={at(scene, 4, 0.58)}>
          <Chip size={64} border={C.violet}>8</Chip>
        </Rel>
        <Rel x={190} y={346} start={at(scene, 4, 0.62)} style={{ fontSize: 60, fontWeight: 900 }}>→</Rel>
        {[9, 18, 36, 72].map((p, i) => (
          <Rel key={p} x={290 + i * 190} y={340} start={at(scene, 4, 0.68 + i * 0.07)}>
            <Chip size={64}>{p}</Chip>
          </Rel>
        ))}
        <Rel x={60} y={480} start={at(scene, 4, 0.82)} style={{ fontSize: 62, fontWeight: 900, color: C.red }}>
          8 alone has 4 partners, not 2
        </Rel>
      </TrapCard>

      <TrapCard start={s(5)} end={s(6)} letter="E" val="70">
        <Rel x={60} y={170} start={at(scene, 5, 0.36)}>
          <Tex tex={'2 \\times 35 = 70'} size={84} color={C.red} />
        </Rel>
        <Rel x={60} y={340} start={at(scene, 5, 0.58)}>
          <Chip size={64} border={C.green}>(8, 9)</Chip>
        </Rel>
        <Rel x={380} y={340} start={at(scene, 5, 0.66)}>
          <Chip size={64} border={C.green}>(9, 8)</Chip>
        </Rel>
        <Rel x={60} y={480} start={at(scene, 5, 0.74)} style={{ fontSize: 58, fontWeight: 900, color: C.red }}>
          both orders are already counted
        </Rel>
      </TrapCard>

      <TrapCard start={s(6)} end={99999} letter="" val="" good>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 100, fontWeight: 900, ...fadeUp(f, at(scene, 6, 0.12)) }}>
          Does order matter?
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', fontSize: 84, fontWeight: 900, color: C.green, ...fadeUp(f, at(scene, 6, 0.62)) }}>
          Here, it does!
        </div>
      </TrapCard>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <PromptCard x={210} y={190} w={1500} size={56} n="48" m1={at(scene, 1, 0.3)} m2={at(scene, 2, 0.3)} start={at(scene, 0, 0.3)} />
      <Text x={960} y={110} w={1200} size={50} weight={900} color={C.violet} align="center" style={fadeUp(f, 0)}>
        Your turn!
      </Text>
    </>
  );
};

const VX = 270;
const VY = 340;

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t3 = at(scene, 2, 0.1);
  const kind5 = (c: number, r: number): CellKind => (f >= t3 ? (c < 4 && r < 4 ? 'miss' : 'good') : 'plain');
  const kind2 = (c: number, r: number): CellKind => (f >= at(scene, 3, 0.2) ? (c === 0 && r === 0 ? 'miss' : 'good') : 'plain');
  return (
    <>
      <Ex x={700} y={118} tex={'48 = 16 \\times 3 = 2^{4} \\cdot 3^{1}'} size={62} start={at(scene, 0, 0.15)} />
      <ExpGrid x={VX} y={VY} n={5} S={88} kind={kind5} what="twos" start={at(scene, 1, 0.1)} colsOp={ease(f, at(scene, 1, 0.1), 12)} rowsOp={ease(f, at(scene, 1, 0.3), 12)} block={{ k: 4, p: ease(f, at(scene, 2, 0.12), 12) }} />
      <Ex x={850} y={260} tex={'5 \\times 5 = 25'} size={64} start={at(scene, 1, 0.78)} />
      <Ex x={850} y={380} tex={'25 - 16 = 9'} size={64} start={at(scene, 2, 0.6)} />
      <ExpGrid x={1560} y={290} n={2} S={100} kind={kind2} what="threes" start={at(scene, 3, 0.0)} colsOp={ease(f, at(scene, 3, 0.0), 12)} rowsOp={ease(f, at(scene, 3, 0.1), 12)} block={{ k: 1, p: ease(f, at(scene, 3, 0.25), 12) }} />
      <Ex x={1500} y={510} tex={'4 - 1 = 3'} size={64} start={at(scene, 3, 0.6)} />
      <Ex x={820} y={600} tex={'9 \\times 3 = 27'} size={84} color={C.green} start={at(scene, 4, 0.3)} />
      <Answer x={1700} y={725} value="27" start={at(scene, 4, 0.85)} chime={CHIME} />
      <Confetti x={1700} y={820} start={at(scene, 4, 0.85)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const thumbs = 1 - ease(f, at(scene, 2, 0.02), 10);
  const g4 = (c: number, r: number): CellKind => (c === 3 || r === 3 ? 'good' : 'plain');
  const g3 = (c: number, r: number): CellKind => (c === 2 || r === 2 ? 'good' : 'plain');
  return (
    <>
      <Text x={960} y={130} w={1700} size={62} weight={900} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.1)), opacity: ease(f, at(scene, 0, 0.1), 14) * thumbs }}>
        Each prime: the lcm keeps the <span style={{ color: C.primary }}>bigger</span> power
      </Text>
      <div style={{ opacity: thumbs }}>
        <Ex x={0} y={270} tex={'\\text{bigger of } 2^{3} \\text{ and } 2^{1} = 2^{3}'} size={84} start={at(scene, 0, 0.5)} center={1} />
      </div>
      <div style={{ opacity: thumbs }}>
        <ExpGrid x={470} y={440} n={4} S={64} kind={g4} labels={false} start={at(scene, 1, 0.15)} />
        <Ex x={560} y={706} tex={'7'} size={72} color={C.violet} start={at(scene, 1, 0.4)} />
        <Ex x={800} y={510} tex={'\\times'} size={90} start={at(scene, 1, 0.4)} />
        <ExpGrid x={940} y={440} n={3} S={64} kind={g3} labels={false} start={at(scene, 1, 0.3)} />
        <Ex x={1010} y={706} tex={'5'} size={72} color={C.blue} start={at(scene, 1, 0.55)} />
        <Ex x={1200} y={490} tex={'= 35'} size={96} color={C.green} start={at(scene, 1, 0.7)} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 2, 0.25)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, '72', true),
  divisors: Divisors,
  partners: Partners,
  fill: Fill,
  total1: Total1,
  maxrule: Maxrule,
  grid2: Grid2,
  grid3: Grid3,
  multiply: Multiply,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, '48', false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

void clamp;
void fadeTo;

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

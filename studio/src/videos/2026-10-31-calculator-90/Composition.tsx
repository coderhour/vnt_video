import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-calculator-90';
const CHIME = `${SLUG}/sfx/fs-541985.mp3`; // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = `${SLUG}/sfx/fs-668355.mp3`;

import { staticFile } from 'remotion';
const CH_URL = staticFile(CHIME);
const TICK_URL = staticFile(TICK);

const PANEL = 620;
const VD = '#5b43e0'; // darker violet for text
const GD = '#139a4a'; // darker green for text

// ---------- calculator ----------

type Press = { key: '+1' | '×2'; f: number };

const glowOf = (f: number, presses: Press[], key: string) => {
  let g = 0;
  for (const p of presses) if (p.key === key) {
    const t = f - p.f;
    if (t >= 0 && t < 30) g = Math.max(g, 1 - t / 30);
  }
  return g;
};

const Calc: React.FC<{ x: number; y: number; value: string; presses?: Press[]; scale?: number; op?: number; hot?: boolean }> = ({ x, y, value, presses = [], scale = 1, op = 1, hot = false }) => {
  const f = useCurrentFrame();
  const key = (k: '+1' | '×2', color: string, soft: string, dark: string) => {
    const g = glowOf(f, presses, k);
    return (
      <div style={{ width: 150, height: 120, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 900, background: g > 0 ? color : soft, color: g > 0 ? '#fff' : dark, border: `5px solid ${color}`, transform: `scale(${1 - 0.08 * g})`, boxShadow: g > 0 ? `0 0 ${50 * g}px ${14 * g}px ${color}` : '0 6px 0 rgba(30,40,80,0.12)' }}>
        {k}
      </div>
    );
  };
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 380, transform: `scale(${scale})`, transformOrigin: 'top left', opacity: op, background: C.card, borderRadius: 44, border: `6px solid ${C.ink}`, padding: 30, boxShadow: '0 14px 40px rgba(30,40,80,0.12)' }}>
      <div style={{ height: 130, borderRadius: 20, background: '#243046', color: hot ? '#ffd166' : '#7dffc3', fontSize: value.length > 4 ? 76 : 96, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 26px', marginBottom: 34, whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ display: 'flex', gap: 30, justifyContent: 'center' }}>
        {key('+1', C.primary, C.primarySoft, GD)}
        {key('×2', C.violet, C.violetSoft, VD)}
      </div>
    </div>
  );
};

// ---------- the chain of numbers ----------

type ChainProps = {
  vals: number[]; // backward order: vals[0] = target
  ops: ('h' | 'm')[]; // ops[i] = arrow between vals[i] and vals[i+1]: h = halve / x2, m = minus one / plus one
  right: number; // x centre of vals[0]
  pitch: number;
  y: number;
  nodeAt: number[]; // frame where node i appears (Infinity = hidden)
  ghostEnd?: boolean; // faint dashed node for the last value until it appears
  fw?: number; // frame where arrows flip to "forward presses"
  numAt?: number[]; // numAt[j]: frame where forward arrow j (j = 0 is the first press) gets its count badge
  hi?: (arrowIdx: number) => number; // 0..1 emphasis for an arrow (default 1)
  stops?: number[]; // stops[k]: frame where node (forward k) gets a stop badge
  size?: number;
  bw?: number;
};

const BH = 100;

const Chain: React.FC<ChainProps> = ({ vals, ops, right, pitch, y, nodeAt, ghostEnd = false, fw = Infinity, numAt = [], hi, stops = [], size = 58, bw = 112 }) => {
  const f = useCurrentFrame();
  const n = vals.length;
  const xs = vals.map((_, i) => right - i * pitch);
  const W = (i: number) => (vals[i] >= 100 ? bw + 40 : bw);
  const ez = (st: number, d: number) => (Number.isFinite(st) ? ease(f, st, d) : 0);
  const flip = ez(fw, 12);
  return (
    <>
      <Stage>
        {ops.map((o, i) => {
          const a = ez(nodeAt[i + 1] - 14, 10);
          if (a <= 0) return null;
          const xr = xs[i] - W(i) / 2 - 6;
          const xl = xs[i + 1] + W(i + 1) / 2 + 6;
          const col = o === 'h' ? C.violet : C.primary;
          const e = hi ? hi(i) : 1;
          const head = (px: number, dir: number) => `${px},${y} ${px - dir * 28},${y - 18} ${px - dir * 28},${y + 18}`;
          return (
            <g key={i} opacity={a * e} stroke={col} strokeWidth={9} strokeLinecap="round" fill={col}>
              <g opacity={1 - flip}>
                <line x1={xr} y1={y} x2={xl + 16} y2={y} />
                <polygon points={head(xl, -1)} stroke="none" />
              </g>
              <g opacity={flip}>
                <line x1={xl} y1={y} x2={xr - 16} y2={y} />
                <polygon points={head(xr, 1)} stroke="none" />
              </g>
            </g>
          );
        })}
      </Stage>
      {ops.map((o, i) => {
        const a = ez(nodeAt[i + 1] - 14, 10);
        if (a <= 0) return null;
        const mid = (xs[i] + xs[i + 1]) / 2;
        const col = o === 'h' ? VD : GD;
        const e = hi ? hi(i) : 1;
        const lab = (t: string, op: number) => (
          <div style={{ position: 'absolute', left: mid - 80, width: 160, top: y - 78, textAlign: 'center', fontSize: 48, fontWeight: 900, color: col, opacity: op * a * e }}>{t}</div>
        );
        return (
          <div key={i}>
            {lab(o === 'h' ? '÷2' : '−1', 1 - flip)}
            {lab(o === 'h' ? '×2' : '+1', flip)}
          </div>
        );
      })}
      {vals.map((v, i) => {
        const reveal = ez(nodeAt[i], 10);
        const ghost = ghostEnd && i === n - 1 ? 0.4 : 0;
        const op = Math.max(reveal, ghost);
        if (op <= 0) return null;
        const solid = reveal > 0;
        const s = solid ? 0.8 + 0.2 * pop(f, nodeAt[i]) : 1;
        return (
          <div key={i} style={{ position: 'absolute', left: xs[i] - W(i) / 2, top: y - BH / 2, width: W(i), height: BH, borderRadius: 26, background: solid ? C.card : 'transparent', border: `5px ${solid ? 'solid' : 'dashed'} ${i === 0 ? C.primary : C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, opacity: op, transform: `scale(${s})`, boxShadow: solid ? '0 6px 18px rgba(30,40,80,0.10)' : undefined }}>
            {v}
          </div>
        );
      })}
      {ops.map((_, i) => {
        const j = n - 2 - i; // forward index of this arrow
        const at0 = numAt[j];
        if (at0 === undefined) return null;
        const p = pop(f, at0);
        if (p <= 0) return null;
        const mid = (xs[i] + xs[i + 1]) / 2;
        return (
          <div key={i} style={{ position: 'absolute', left: mid - 36, top: y + 36, width: 72, height: 72, borderRadius: '50%', background: C.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, transform: `scale(${p})` }}>
            {j + 1}
          </div>
        );
      })}
      {vals.map((_, i) => {
        const k = n - 1 - i; // forward index of this node
        const s0 = stops[k];
        if (s0 === undefined) return null;
        const p = pop(f, s0);
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: xs[i] - 36, top: y + BH / 2 + 14, width: 72, height: 72, borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, transform: `scale(${p})` }}>
            {k + 1}
          </div>
        );
      })}
    </>
  );
};

const V90 = [90, 45, 44, 22, 11, 10, 5, 4, 3];
const O90: ('h' | 'm')[] = ['h', 'm', 'h', 'h', 'm', 'h', 'm', 'm'];
const V100 = [100, 50, 25, 24, 12, 6, 3];
const O100: ('h' | 'm')[] = ['h', 'h', 'm', 'h', 'h', 'h'];
const INF = Infinity;

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ x = PANEL, y, w = 1100, start, children, color = C.red, size = 42, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: size, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start), ...style }}>
      {children}
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

/** Round answer badge: pops at `start`, chime plays separately at `chimeAt` (end of the line). */
const Badge: React.FC<{ x: number; y: number; value: string; start: number; chimeAt: number }> = ({ x, y, value, start, chimeAt }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  return (
    <>
      <Sequence from={chimeAt} durationInFrames={60} layout="none">
        <Audio src={CH_URL} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 110, top: y - 110, width: 220, height: 220, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>{value}</div>
      )}
    </>
  );
};

const Tick48: React.FC<{ x: number; y: number; start: number; children: React.ReactNode }> = ({ x, y, start, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 22, fontSize: 48, fontWeight: 800, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <svg width={58} height={58} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={27} fill={C.primary} />
        <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  );
};

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string; op?: number }> = ({ x = 140, y, start, tex, size = 56, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  const a = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', opacity: (a.opacity as number) * op, transform: a.transform }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const p0 = at(scene, 0, 0.42);
  const p1 = at(scene, 0, 0.58);
  const p2 = at(scene, 0, 0.74);
  const presses: Press[] = [{ key: '×2', f: p0 }, { key: '+1', f: p1 }, { key: '×2', f: p2 }];
  const target = f >= at(scene, 1, 0.3);
  const value = target ? '90?' : f >= p2 ? '14' : f >= p1 ? '7' : f >= p0 ? '6' : '3';
  const trail = [['3', 0], ['6', p0], ['7', p1], ['14', p2]] as [string, number][];
  const lost = ease(f, at(scene, 1, 0.1), 10);
  return (
    <>
      <Calc x={200} y={170} value={value} presses={presses} scale={1.3} hot={target} op={ease(f, 0, 10)} />
      <div style={{ position: 'absolute', left: 860, top: 230, display: 'flex', gap: 18, alignItems: 'center', fontSize: 84, fontWeight: 900 }}>
        {trail.map(([t, s], i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: ease(f, s, 8) }}>
            {i > 0 && <span style={{ color: C.muted, fontSize: 60 }}>→</span>}
            <span>{t}</span>
          </div>
        ))}
        <span style={{ opacity: lost, color: C.muted }}>→ …?</span>
      </div>
      <div style={{ position: 'absolute', left: 860, top: 640, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CH = ['6', '7', '8', '9', '10'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const presses: Press[] = [{ key: '+1', f: at(scene, 2, 0.5) }, { key: '×2', f: at(scene, 3, 0.2) }];
  return (
    <>
      <Calc x={140} y={170} value="3" presses={presses} op={ease(f, at(scene, 1) - 6, 10)} />
      <div style={{ position: 'absolute', left: PANEL + 40, top: 150, width: 1100, minHeight: 360, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>A calculator shows 3. </span>
        <span style={s(2)}>It has only two keys: one adds 1 </span>
        <span style={s(3)}>and one doubles the number on the screen. </span>
        <span style={s(4)}>What is the fewest number of key presses needed to make the screen show 90?</span>
      </div>
      <Choices x={PANEL + 40} y={600} start={(i) => at(scene, 5, 0.15 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Calc x={140} y={170} value="3" />
      <Card x={PANEL + 40} y={190} w={1000} color={C.primary} start={at(scene, 0, 0.3)} size={56}>
        <span style={{ color: C.muted }}>start:</span> 3 <span style={{ color: C.muted, margin: '0 14px' }}>→</span> <span style={{ color: C.muted }}>end:</span> 90
      </Card>
      <Card x={PANEL + 40} y={340} w={1000} color={C.violet} start={at(scene, 1, 0.1)} size={56}>
        <span style={{ color: C.muted }}>keys:</span> <span style={{ color: GD }}>+1</span>, <span style={{ color: VD }}>×2</span>
      </Card>
      <Card x={PANEL + 40} y={490} w={1000} color={C.amber} start={at(scene, 2, 0.05)} size={56}>
        <span style={{ color: C.muted }}>goal:</span> 90 in the <Mark on={at(scene, 2, 0.5)}>FEWEST</Mark> presses
      </Card>
      <div style={{ position: 'absolute', left: PANEL + 40, top: 660, opacity: ease(f, at(scene, 2, 0.8), 10) * 0 }} />
    </>
  );
};

const QTEXT1 = <>A calculator shows 3. It has only two keys: one adds 1 and one doubles the number on the screen. What is the fewest number of key presses needed to make the screen show 90?</>;
const QTEXT2 = <>The calculator shows 3 again, with the same two keys: +1 and ×2. What is the fewest number of key presses needed to make the screen show 100?</>;

const makePause = (seconds: number, text: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Calc x={120} y={170} value="3" scale={0.9} />
      <div style={{ position: 'absolute', left: 540, top: 170, width: 860, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1660} y={500} tick={TICK_URL} />
    </>
  );
};

const Backward: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nodeAt = [at(scene, 0, 0.35), at(scene, 3, 0.55), ...Array(7).fill(INF)];
  return (
    <>
      <Card x={140} y={150} w={780} color={VD} start={at(scene, 1, 0.3)} size={50}>
        <span style={{ color: VD }}>×2</span> undone = <span style={{ color: VD }}>÷2</span>
      </Card>
      <Card x={140} y={250} w={780} color={GD} start={at(scene, 1, 0.65)} size={50}>
        <span style={{ color: GD }}>+1</span> undone = <span style={{ color: GD }}>−1</span>
      </Card>
      <Card x={980} y={150} w={820} color={C.primary} start={at(scene, 2, 0.2)} size={52}>
        even → <span style={{ color: VD }}>÷2</span>
      </Card>
      <Card x={980} y={250} w={820} color={C.primary} start={at(scene, 2, 0.6)} size={52}>
        odd → <span style={{ color: GD }}>−1</span> first
      </Card>
      <div style={{ position: 'absolute', left: 60, width: 1800, top: 420, textAlign: 'center', fontSize: 48, fontWeight: 800, color: C.muted, opacity: ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, at(scene, 3), 0, 10) }}>work backwards: right to left</div>
      <Chain vals={V90} ops={O90} right={1770} pitch={200} y={600} nodeAt={nodeAt} ghostEnd />
    </>
  );
};

const ChainScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nodeAt = [
    0, 0,
    at(scene, 0, 0.3), at(scene, 0, 0.55), at(scene, 0, 0.85), // 44, 22, 11
    at(scene, 1, 0.55), at(scene, 1, 0.89), // 10, 5
    at(scene, 2, 0.28), // 4
    at(scene, 3, 0.55), // 3
  ];
  const fw = at(scene, 4, 0.05);
  const cnt = [0.286, 0.378, 0.475, 0.561, 0.658, 0.751, 0.847, 0.943].map((t) => at(scene, 5, t));
  const crossOp = ease(f, at(scene, 2, 0.62), 10) * fadeTo(f, at(scene, 3, 0.4), 0, 12);
  const shown = at(scene, 6, 0.15);
  const chimeAt = at(scene, 6, 0.95);
  const cx = 1770 - 7 * 200;
  return (
    <>
      <div style={{ position: 'absolute', left: cx - 190, top: 215, width: 380, textAlign: 'center', opacity: crossOp }}>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.red, textDecoration: 'line-through', textDecorationThickness: 6 }}>÷2 → 2</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: C.red }}>2 is below 3</div>
      </div>
      <Chain vals={V90} ops={O90} right={1770} pitch={200} y={470} nodeAt={nodeAt} ghostEnd fw={fw} numAt={cnt} />
      <div style={{ position: 'absolute', left: 140, top: 640, fontSize: 48, fontWeight: 900, color: C.muted, opacity: ease(f, fw, 12) * fadeTo(f, at(scene, 6), 0, 10) }}>
        read forward: every arrow is one key press
      </div>
      <Badge x={1620} y={735} value="8" start={shown} chimeAt={chimeAt} />
      <Pill x={760} y={700} color={C.green} style={{ ...fadeUp(f, shown), fontSize: 48 }}>8 presses: Choice C</Pill>
      <Confetti x={1620} y={735} start={shown} seed={7} />
    </>
  );
};

const Snow: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const f = useCurrentFrame();
  const t = ease(f, start, end - start);
  const x0 = 170;
  const x1 = 1000;
  const b1 = 380;
  const b2 = 640;
  const x = x0 + (x1 - x0) * t;
  const c1 = x0 + (x1 - x0) * 0; // unused guard
  void c1;
  const val = x >= b2 + 70 ? 4 : x >= b1 + 70 ? 2 : 1;
  const kick = (b: number) => (x >= b + 70 && x < b + 110 ? 1.25 : 1);
  const box = (bx: number, i: number) => (
    <div key={i} style={{ position: 'absolute', left: bx, top: 590, width: 140, height: 130, borderRadius: 26, background: C.violetSoft, border: `5px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: VD, opacity: ease(f, start - 14, 10) }}>×2</div>
  );
  return (
    <>
      {box(b1, 0)}
      {box(b2, 1)}
      <div style={{ position: 'absolute', left: x - 55, top: 600, width: 110, height: 110, borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58, fontWeight: 900, transform: `scale(${(1 + 0.06 * val) * Math.max(kick(b1), kick(b2))})`, opacity: ease(f, start - 14, 10), boxShadow: '0 10px 26px rgba(12,194,129,0.35)' }}>{val}</div>
      <div style={{ position: 'absolute', left: 90, top: 735, fontSize: 48, fontWeight: 800, color: GD, opacity: ease(f, start - 14, 10) }}>a +1 token</div>
    </>
  );
};

const Doubles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows: [string, string][] = [
    ['before 4 doubles', '16'],
    ['before 3 doubles', '8'],
    ['before 2 doubles', '4'],
    ['before 1 double', '2'],
    ['at the end', '1'],
  ];
  return (
    <>
      <Eq y={140} start={at(scene, 1, 0.3)} size={56} tex={'3\\times2\\times2\\times2\\times2\\times2 = 96'} color={C.red} />
      <Pill x={940} y={140} color={C.red} style={{ ...fadeUp(f, at(scene, 1, 0.7)), fontSize: 48 }}>too big!</Pill>
      <Eq y={250} start={at(scene, 2, 0.3)} size={56} tex={'3\\times2\\times2\\times2\\times2 = 48'} />
      <Eq y={350} start={at(scene, 2, 0.7)} size={56} tex={`90 - 48 = ${col(C.violet, '42')}`} />
      <Snow start={at(scene, 3, 0.35)} end={at(scene, 3, 0.95)} />
      <div style={{ position: 'absolute', left: 1230, top: 140, width: 640, background: C.card, borderRadius: 26, padding: '14px 26px', boxShadow: '0 6px 22px rgba(30,40,80,0.08)', opacity: ease(f, at(scene, 4, 0.05), 10) }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: C.muted, marginBottom: 4 }}>an add is worth</div>
        {rows.map(([lab, v], i) => (
          <div key={lab} style={{ display: 'flex', alignItems: 'center', height: 80, fontSize: 48, fontWeight: 800, ...fadeUp(f, at(scene, 4, 0.12 + i * 0.14), 10) }}>
            <div style={{ width: 410 }}>{lab}</div>
            <div style={{ color: VD, fontSize: 60, fontWeight: 900 }}>{v}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const Chip: React.FC<{ v: string; start: number }> = ({ v, start }) => {
  const f = useCurrentFrame();
  const p = pop(f, start);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * Math.min(1, p)})` }}>
      <div style={{ width: 130, height: 100, borderRadius: 24, background: C.card, border: `5px solid ${C.violet}`, fontSize: 60, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: C.primary, color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+1</div>
    </div>
  );
};

const Doubles2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vals = ['16', '16', '8', '2'];
  const fwNodes = [3, 4, 5, 10, 11, 22, 44, 45, 90];
  const vb = [...fwNodes].reverse();
  const hiArrow = (i: number) => (O90[i] === 'm' ? 1 : 0.28); // +1 arrows stand out
  const triesOp = 1 - ease(f, at(scene, 4), 12);
  const nodeAt = vb.map(() => at(scene, 4, 0.1));
  return (
    <>
      <div style={{ position: 'absolute', left: 140, top: 130, display: 'flex', alignItems: 'flex-start', gap: 22 }}>
        <div style={{ fontSize: 60, fontWeight: 900, paddingTop: 16, opacity: ease(f, at(scene, 0, 0.1), 10) }}>42 =</div>
        {vals.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>
            {i > 0 && <div style={{ fontSize: 60, fontWeight: 900, paddingTop: 16, opacity: ease(f, at(scene, 0, 0.1 + i * 0.15), 8) }}>+</div>}
            <Chip v={v} start={at(scene, 0, 0.15 + i * 0.15)} />
          </div>
        ))}
      </div>
      <Fade op={triesOp}>
        <Eq y={345} start={at(scene, 1, 0.45)} size={52} tex={'16+16+16 = 48'} color={C.red} />
        <Pill x={660} y={349} color={C.red} style={{ ...fadeUp(f, at(scene, 1, 0.75)), fontSize: 48 }}>too big</Pill>
        <Eq y={425} start={at(scene, 2, 0.25)} size={52} tex={'16+16+8 = 40'} color={C.red} />
        <Pill x={660} y={429} color={C.red} style={{ ...fadeUp(f, at(scene, 2, 0.55)), fontSize: 48 }}>too small</Pill>
      </Fade>
      <div style={{ position: 'absolute', left: 140, top: 535, border: `6px solid ${C.green}`, borderRadius: 26, padding: '8px 30px', fontSize: 52, fontWeight: 900, background: C.card, ...fadeUp(f, at(scene, 3, 0.35)) }}>
        4 doubles + 4 adds = 8 presses
      </div>
      <Chain vals={vb} ops={O90} right={1770} pitch={200} y={705} nodeAt={nodeAt} fw={0} hi={(i) => hiArrow(i) * 1} />
      <Text x={1080} y={547} w={800} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.3))}>the four <span style={{ color: GD }}>+1</span> presses</Text>
      <Card x={140} y={775} w={1500} size={48} color={C.amber} start={at(scene, 5, 0.3)}>
        Fewer doubles? Three doubles needs 9 adds: 12 presses.
      </Card>
    </>
  );
};

const Pick: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 200, top: 250, width: 720, background: C.card, borderRadius: 30, borderTop: `14px solid ${C.violet}`, padding: '30px 36px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 0, 0.35)) }}>
        <div style={{ fontSize: 50, fontWeight: 900, color: VD }}>Work backwards</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 14 }}>find a short path fast</div>
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 250, width: 720, background: C.card, borderRadius: 30, borderTop: `14px solid ${C.primary}`, padding: '30px 36px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 1, 0.05)) }}>
        <div style={{ fontSize: 50, fontWeight: 900, color: GD }}>Plan the doubles</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 14 }}>prove nothing is shorter</div>
      </div>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vb = V90;
  const stops = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => at(scene, 1, 0.35 + k * 0.05));
  const nodeAt = vb.map(() => 0);
  const chip = (v: string, label: string, state: 'none' | 'red' | 'amber', start: number, x: number) => {
    const st = ease(f, start, 10);
    const colr = state === 'red' ? C.red : state === 'amber' ? C.amber : C.line;
    return (
      <div key={v} style={{ position: 'absolute', left: x, top: 520, width: 150, height: 90, borderRadius: 20, background: C.card, border: `5px solid ${st > 0 ? colr : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: 900, opacity: 0.6 + 0.4 * st, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
        <span style={{ color: C.muted, fontSize: 32, marginRight: 10 }}>{label}</span>
        <span style={{ textDecoration: state === 'red' && st > 0 ? 'line-through' : undefined, textDecorationThickness: 6, textDecorationColor: C.red }}>{v}</span>
      </div>
    );
  };
  return (
    <>
      <Card x={140} y={130} w={1500} start={at(scene, 1)} size={48}>D: 9 counts the numbers, but presses are the arrows</Card>
      <Card x={140} y={220} w={1500} start={at(scene, 2)} size={48}>A, B: 6 or 7 are too few: we need 4 doubles + 4 adds</Card>
      <Card x={140} y={310} w={1500} start={at(scene, 3)} color={C.amber} size={48}>E: 10 works, but it is not the fewest</Card>
      <Pill x={140} y={410} color={C.primary} style={{ ...fadeUp(f, at(scene, 4, 0.3)), fontSize: 46 }}>Count the steps, not the stops</Pill>
      {chip('6', 'A', 'red', at(scene, 2, 0.35), 140)}
      {chip('7', 'B', 'red', at(scene, 2, 0.55), 320)}
      {chip('9', 'D', 'red', at(scene, 1, 0.1), 500)}
      {chip('10', 'E', 'amber', at(scene, 3, 0.4), 680)}
      <Chain vals={vb} ops={O90} right={1770} pitch={200} y={690} nodeAt={nodeAt} fw={0} stops={stops} size={56} />
      <div style={{ position: 'absolute', left: 1000, top: 420, fontSize: 48, fontWeight: 800, color: C.muted, opacity: ease(f, at(scene, 1, 0.8), 10) }}>
        <span style={{ color: C.blue }}>9 numbers</span>, but only 8 arrows
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Calc x={140} y={170} value="3" op={ease(f, 4, 10)} />
      <Pill x={PANEL + 40} y={170} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 48 }}>Your turn</Pill>
      <Card x={PANEL + 40} y={290} w={1000} color={C.primary} start={at(scene, 0, 0.4)} size={54}>
        <span style={{ color: C.muted }}>start:</span> 3 <span style={{ color: C.muted, marginLeft: 36 }}>keys:</span> <span style={{ color: GD }}>+1</span>, <span style={{ color: VD }}>×2</span>
      </Card>
      <Card x={PANEL + 40} y={440} w={1000} color={C.amber} start={at(scene, 1, 0.3)} size={56}>
        <span style={{ color: C.muted }}>goal:</span> <Mark on={at(scene, 1, 0.6)}>100</Mark> in the fewest presses
      </Card>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nodeAt = [
    at(scene, 0, 0.05),
    at(scene, 0, 0.58), // 50
    at(scene, 0, 0.8), // 25
    at(scene, 1, 0.31), // 24
    at(scene, 1, 0.72), // 12
    at(scene, 1, 0.83), // 6
    at(scene, 1, 0.94), // 3
  ];
  const fw = at(scene, 2, 0.05);
  const cnt = [0, 1, 2, 3, 4, 5].map((j) => at(scene, 2, 0.15 + j * 0.07));
  const shown = at(scene, 2, 0.6);
  const chimeAt = at(scene, 2, 0.97);
  const bigOp = ease(f, at(scene, 4, 0.2), 12);
  return (
    <>
      <Chain vals={V100} ops={O100} right={1740} pitch={270} y={300} nodeAt={nodeAt} fw={fw} numAt={cnt} />
      <Eq y={450} start={at(scene, 3, 0.2)} size={54} tex={'3\\times2\\times2\\times2\\times2\\times2 = 96'} />
      <Eq y={540} start={at(scene, 3, 0.55)} size={54} tex={`100 - 96 = ${col(C.green, '4')}`} />
      <Tick48 x={140} y={640} start={at(scene, 3, 0.85)}>5 doubles + 1 add = 6 presses</Tick48>
      <Badge x={1640} y={625} value="6" start={shown} chimeAt={chimeAt} />
      <Card x={880} y={745} w={780} color={C.violet} size={48} start={at(scene, 4, 0.2)} style={{ opacity: bigOp, top: 760 }}>
        bigger target, fewer presses
      </Card>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 5), 0, 12);
  return (
    <>
      <Fade op={out}>
        <Text x={140} y={150} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <Card x={140} y={260} w={1500} color={VD} start={at(scene, 1, 0.3)} size={50}>Doubling and +1? <span style={{ color: VD }}>Work backwards</span> from the target.</Card>
        <Card x={140} y={390} w={1500} color={VD} start={at(scene, 2, 0.3)} size={50}>Even → <span style={{ color: VD }}>÷2</span>, unless that drops below the start</Card>
        <Card x={140} y={520} w={1500} color={GD} start={at(scene, 3, 0.2)} size={50}>Otherwise → <span style={{ color: GD }}>−1</span></Card>
        <Card x={140} y={650} w={1500} color={C.amber} start={at(scene, 4, 0.3)} size={50}>Count the arrows, not the numbers.</Card>
      </Fade>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 5, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 5, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, QTEXT1),
  backward: Backward,
  chain: ChainScene,
  doubles: Doubles,
  doubles2: Doubles2,
  pick: Pick,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, QTEXT2),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

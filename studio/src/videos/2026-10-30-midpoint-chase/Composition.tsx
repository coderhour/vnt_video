import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-30-midpoint-chase';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- the chase (contract: same as verify.py) ----------

export const PTS = [0, 64, 32, 48, 40, 44, 42, 43, 42.5, 42.75, 42.625]; // P1 .. P11
export const GREY = '#9aa1b0';
const BG = C.bg;
const HALO = `0 0 8px ${BG}, 0 0 8px ${BG}, 0 0 6px ${BG}`;

type M = (v: number) => number;
export const mapper = (lo: number, hi: number, x0: number, x1: number): M => (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame in a scene where `phrase` (in line i's caption) ends (or starts). */
const cue = (s: Scene, i: number, phrase: string, after = true, off = -3) => {
  const l = s.lines[i];
  const t = l.caption.toLowerCase();
  const k = t.indexOf(phrase.toLowerCase());
  const fr = k < 0 ? 0.5 : Math.min(0.97, (k + (after ? phrase.length : 0)) / t.length);
  return l.from + Math.round(l.frames * fr) + off;
};

// ---------- SVG building blocks ----------

/** Centred KaTeX inside the SVG. */
export const T: React.FC<{ x: number; y: number; tex: string; size?: number; color?: string; op?: number; w?: number }> = ({ x, y, tex, size = 52, color = C.ink, op = 1, w = 560 }) =>
  op <= 0.01 ? null : (
    <foreignObject x={x - w / 2} y={y - size} width={w} height={size * 2} opacity={op} style={{ overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: size * 2, whiteSpace: 'nowrap', textShadow: HALO }}>
        <Tex tex={tex} size={size} color={color} />
      </div>
    </foreignObject>
  );

export const NLine: React.FC<{ m: M; x0: number; x1: number; y: number; lo: number; hi: number; step: number; labels?: number[]; op?: number; major?: number }> = ({ m, x0, x1, y, lo, hi, step, labels = [], op = 1, major }) => {
  if (op <= 0.01) return null;
  const n = Math.round((hi - lo) / step);
  return (
    <g opacity={op}>
      <line x1={x0 - 20} y1={y} x2={x1 + 20} y2={y} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      {range(n + 1).map((k) => {
        const v = lo + k * step;
        const big = major ? Math.abs((v / major) - Math.round(v / major)) < 1e-6 : Math.abs(v - Math.round(v)) < 1e-6;
        return <line key={k} x1={m(v)} y1={y - (big ? 16 : 9)} x2={m(v)} y2={y + (big ? 16 : 9)} stroke={C.ink} strokeWidth={big ? 4 : 3} />;
      })}
      {labels.map((v) => (
        <T key={v} x={m(v)} y={y + 62} tex={String(v)} size={52} color={C.muted} w={200} />
      ))}
    </g>
  );
};

/** A point on the line: dot, P_n label above, value (and optional mixed-number chip) below. */
export const Dot: React.FC<{
  x: number; y: number; n: number; color?: string; op?: number; r?: number;
  label?: number; val?: string; valOp?: number; chip?: string; chipOp?: number; lx?: number; valColor?: string;
}> = ({ x, y, n, color = C.primary, op = 1, r = 15, label = 1, val, valOp = 1, chip, chipOp = 1, lx = 0, valColor }) => {
  if (op <= 0.01) return null;
  const s = Math.min(1.25, pop(0, 0) + 1);
  void s;
  return (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r} fill={color} stroke="#fff" strokeWidth={4} />
      <T x={x + lx} y={y - 72} tex={`P_{${n}}`} size={52} color={color} op={label} w={200} />
      {val && <T x={x + lx} y={y + 62} tex={val} size={52} color={valColor ?? color} op={valOp} w={240} />}
      {chip && <T x={x + lx} y={y + 172} tex={chip} size={66} color={valColor ?? color} op={chipOp} w={260} />}
    </g>
  );
};

/** Curved jump arrow from pixel a to pixel b. Right jumps go above the line (green), left jumps below (purple). */
export const Jump: React.FC<{ a: number; b: number; y: number; p: number; op?: number; hMax?: number; lab?: string; labDy?: number; labSize?: number; color?: string; grow?: number; labOp?: number }> = ({ a, b, y, p, op = 1, hMax = 230, lab, labDy, labSize = 52, color, grow = 0.16, labOp = 1 }) => {
  if (p <= 0.001 || op <= 0.01) return null;
  const right = b > a;
  const col = color ?? (right ? C.primary : C.violet);
  const s = right ? -1 : 1;
  const len = Math.abs(b - a);
  const yy = y + s * 15;
  const h = Math.min(hMax, 36 + len * grow);
  const c1: [number, number] = [a + (b - a) * 0.12, y + s * h * 1.33];
  const c2: [number, number] = [b - (b - a) * 0.12, y + s * h * 1.33];
  const ang = Math.atan2(yy - c2[1], b - c2[0]);
  const hd = 20;
  const tip: [number, number] = [b, yy];
  const l: [number, number] = [b - hd * Math.cos(ang - 0.5), yy - hd * Math.sin(ang - 0.5)];
  const r: [number, number] = [b - hd * Math.cos(ang + 0.5), yy - hd * Math.sin(ang + 0.5)];
  return (
    <g opacity={op}>
      <path d={`M ${a} ${yy} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${b} ${yy}`} stroke={col} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={`M ${l[0]} ${l[1]} L ${tip[0]} ${tip[1]} L ${r[0]} ${r[1]}`} stroke={col} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(p, 0.85, 0.15)} />
      {lab && <T x={(a + b) / 2} y={y + (labDy ?? s * (h + 46))} tex={lab} size={labSize} color={col} op={ease(p, 0.5, 0.4) * labOp} w={420} />}
    </g>
  );
};

const PANEL = 1010;

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; op?: number }> = ({ y, tex, start, x = PANEL, size = 52, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const G = '\\color{#0cc281}';
const V = '\\color{#7b61ff}';

const VanteeMark: React.FC<{ x: number; y: number; size?: number; style?: React.CSSProperties; sub?: string }> = ({ x, y, size = 84, style, sub }) => (
  <div style={{ position: 'absolute', left: x - 400, width: 800, top: y, textAlign: 'center', ...style }}>
    <div style={{ fontFamily: PACIFICO, fontSize: size, color: C.violet }}>Vantee</div>
    {sub && <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -4 }}>{sub}</div>}
  </div>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 160, x1 = 1760, y = 600;
  const m = mapper(0, 64, x0, x1);
  const pd = (t: number) => ease(f, t, 10);
  const t3 = cue(scene, 1, 'each new point lands', true);
  const t4 = cue(scene, 1, 'halfway', true);
  const tq = cue(scene, 1, 'where does it end', false);
  const arcsOut = fadeTo(f, tq - 6, 0, 10);
  const qb = ease(f, tq, 14);
  return (
    <>
      <Text x={960} y={70} w={1500} size={76} weight={900} align="center" style={fadeUp(f, 0)}>
        The Midpoint Chase
      </Text>
      <VanteeMark x={960} y={170} sub="your math tutor" style={fadeUp(f, at(scene, 2, 0))} />
      <Stage>
        <NLine m={m} x0={x0} x1={x1} y={y} lo={0} hi={64} step={8} major={16} />
        <Jump a={m(64)} b={m(32)} y={y} p={ease(f, t3 + 4, 22)} op={arcsOut} hMax={170} />
        <Jump a={m(32)} b={m(48)} y={y} p={ease(f, t4 + 2, 20)} op={arcsOut} hMax={170} />
        <Dot x={m(0)} y={y} n={1} color={GREY} op={pd(at(scene, 0, 0.3))} val="0" valOp={1} />
        <Dot x={m(64)} y={y} n={2} color={GREY} op={pd(at(scene, 0, 0.7))} val="64" />
        <Dot x={m(32)} y={y} n={3} color={GREY} op={pd(t3)} val="32" />
        <Dot x={m(48)} y={y} n={4} color={C.primary} op={pd(t4)} val="48" />
        {/* the "?" bracket over the 40 to 45 region */}
        <g opacity={qb}>
          <path d={`M ${m(40)} ${y - 40} L ${m(40)} ${y - 62} L ${m(45)} ${y - 62} L ${m(45)} ${y - 40}`} stroke={C.amber} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={(m(40) + m(45)) / 2} y={y - 100 + Math.sin(f / 5) * 6} fontSize={110} fontWeight={900} fill={C.amber} textAnchor="middle" fontFamily="Nunito, sans-serif">?</text>
        </g>
      </Stage>
    </>
  );
};

export const CHOICES = ['42.5', '42.625', '42.75', '43', '44'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 160, x1 = 1760, y = 640;
  const m = mapper(0, 64, x0, x1);
  const t5 = at(scene, 5, 0);
  const lineOp = 1;
  const arcOut = fadeTo(f, t5 - 4, 0, 10);
  const t3 = cue(scene, 3, 'thirty-two');
  const t4 = cue(scene, 3, 'forty-eight');
  return (
    <>
      <div style={{ position: 'absolute', left: 110, top: 140, width: 1700, background: C.card, borderRadius: 32, padding: '28px 44px', fontSize: 46, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        On a number line, <Mark on={at(scene, 1, 0.45)}><Tex tex="P_1 = 0" size={50} /></Mark> and <Mark on={at(scene, 1, 0.75)}><Tex tex="P_2 = 64" size={50} /></Mark>.{' '}
        <Mark on={at(scene, 2, 0.35)}>Each later point is the midpoint of the two points before it.</Mark> Where is{' '}
        <Mark on={at(scene, 4, 0.2)}><Tex tex="P_{10}" size={50} /></Mark>?
      </div>
      <Choices x={110} y={730} start={(i) => t5 + 8 + i * 14} items={CHOICES.map((c) => <Tex key={c} tex={c} size={52} />)} />
      <Stage>
        <g opacity={fadeTo(f, t5 - 4, 0, 10) * lineOp}>
          <NLine m={m} x0={x0} x1={x1} y={y} lo={0} hi={64} step={8} major={16} />
          <Jump a={m(64)} b={m(32)} y={y} p={ease(f, t3, 22)} op={arcOut} hMax={120} lab="32" labSize={52} />
          <Jump a={m(32)} b={m(48)} y={y} p={ease(f, t4 - 4, 20)} op={arcOut} hMax={120} lab="16" />
          <Dot x={m(0)} y={y} n={1} color={GREY} op={ease(f, at(scene, 1, 0.45), 10)} val="0" />
          <Dot x={m(64)} y={y} n={2} color={GREY} op={ease(f, at(scene, 1, 0.8), 10)} val="64" />
          <Dot x={m(32)} y={y} n={3} color={GREY} op={ease(f, t3, 10)} val="32" />
          <Dot x={m(48)} y={y} n={4} color={C.primary} op={ease(f, t4, 10)} val="48" />
        </g>
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const colW = 158, sx = 150, sy = 430;
  const slots = range(10);
  const filled: Record<number, string> = { 0: '0', 1: '64', 2: '32', 3: '48' };
  const brk = ease(f, at(scene, 2, 0.5), 14);
  return (
    <>
      <Check x={120} y={140} start={at(scene, 0, 0.4)}>
        <span>Two starting points: <Tex tex="P_1 = 0" size={50} />, <Tex tex="P_2 = 64" size={50} /></span>
      </Check>
      <div style={{ position: 'absolute', left: 120, top: 225, background: C.card, borderRadius: 24, padding: '14px 34px', boxShadow: '0 4px 16px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 1, 0.45)) }}>
        <Tex tex={'P_{n+2} = \\text{midpoint of } P_n \\text{ and } P_{n+1}'} size={56} />
      </div>
      <Pill x={1330} y={236} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.75)), fontSize: 40 }}>the newest two</Pill>
      <Stage>
        {slots.map((i) => {
          const x = sx + i * colW;
          const o = ease(f, at(scene, 2, 0.05 + i * 0.03), 10);
          const known = i < 4;
          return (
            <g key={i} opacity={known ? ease(f, at(scene, 2, 0), 10) : o}>
              <rect x={x} y={sy} width={130} height={110} rx={20} fill={known ? '#fff' : 'none'} stroke={known ? C.primary : C.line} strokeWidth={known ? 5 : 5} strokeDasharray={known ? undefined : '12 10'} />
              <T x={x + 65} y={sy - 44} tex={`P_{${i + 1}}`} size={52} color={known ? C.primary : C.muted} w={160} />
              {known && <T x={x + 65} y={sy + 55} tex={filled[i]} size={56} color={C.ink} w={130} />}
            </g>
          );
        })}
        <g opacity={brk}>
          <path d={`M ${sx + 2 * colW} ${sy + 150} L ${sx + 2 * colW} ${sy + 170} L ${sx + 9 * colW + 130} ${sy + 170} L ${sx + 9 * colW + 130} ${sy + 150}`} stroke={C.amber} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={(sx + 2 * colW + sx + 9 * colW + 130) / 2} y={sy + 238} fontSize={54} fontWeight={900} fill={C.amber} textAnchor="middle" fontFamily="Nunito, sans-serif">8 midpoints to find</text>
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 120, top: 705, display: 'flex', gap: 40, ...fadeUp(f, at(scene, 3, 0.4)) }}>
        {['0.5 = \\dfrac12', '0.25 = \\dfrac14', '0.75 = \\dfrac34', '0.625 = \\dfrac58'].map((t, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 22, padding: '8px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 3, 0.45 + i * 0.1), 10) }}>
            <Tex tex={t} size={56} />
          </div>
        ))}
      </div>
    </>
  );
};

const PauseQ: React.FC<{ scene: Scene; text: React.ReactNode; hi: number; ticks: number; step: number; major: number; p2: number; choices?: boolean; tick?: string; seconds: number }> = ({ scene, text, hi, ticks, step, major, p2, choices, seconds }) => {
  const f = useCurrentFrame();
  void ticks;
  const x0 = 140, x1 = 1060, y = 690;
  const m = mapper(0, hi, x0, x1);
  const pts = hi === 64 ? [[0, 1], [64, 2], [32, 3], [48, 4]] : [[0, 1], [32, 2]];
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 130, width: 1100, fontSize: 46, fontWeight: 600, lineHeight: 1.5, ...fadeUp(f, 6) }}>{text}</div>
      {choices && <Choices x={100} y={440} start={(i) => 12 + i * 4} items={CHOICES.map((c) => <Tex key={c} tex={c} size={52} />)} />}
      <Stage>
        <NLine m={m} x0={x0} x1={x1} y={y} lo={0} hi={hi} step={step} major={major} />
        {pts.map(([v, n]) => (
          <Dot key={n} x={m(v)} y={y} n={n} color={GREY} val={String(v)} op={ease(f, 10 + n * 3, 8)} />
        ))}
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1570} y={430} tick={TICK} />
      {void p2}
    </>
  );
};

const Try1: SceneComponent = ({ scene }) => (
  <PauseQ
    scene={scene}
    hi={64}
    ticks={9}
    step={8}
    major={16}
    p2={64}
    choices
    seconds={10}
    text={<span>On a number line, <Tex tex="P_1 = 0" size={50} />, <Tex tex="P_2 = 64" size={50} />. Each later point is the midpoint of the two points before it. Where is <Tex tex="P_{10}" size={50} />?</span>}
  />
);

const Jumps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 130, x1 = 960, y = 470;
  const m = mapper(0, 64, x0, x1);
  const t2 = cue(scene, 2, 'thirty-two', true, -30);
  const t3 = cue(scene, 3, 'forty-eight', true, -20);
  const p1 = ease(f, at(scene, 1, 0.12), 24);
  const p2 = ease(f, at(scene, 2, 0.35), 24);
  const p3 = ease(f, at(scene, 3, 0.55), 22);
  const half = ease(f, at(scene, 5, 0.1), 20);
  const back = ease(f, at(scene, 5, 0.45), 22);
  const p5 = ease(f, at(scene, 5, 0.75), 10);
  const old = (t: number) => 1 - 0.65 * ease(f, t, 14);
  return (
    <>
      <Stage>
        <NLine m={m} x0={x0} x1={x1} y={y} lo={0} hi={64} step={8} major={16} />
        {/* the 32 to 64 stretch that P4 sits inside */}
        <rect x={m(32)} y={y - 15} width={m(64) - m(32)} height={30} fill={C.primarySoft} opacity={ease(f, at(scene, 3, 0.1), 12) * fadeTo(f, at(scene, 4, 0), 0, 12)} />
        <Jump a={m(0)} b={m(64)} y={y} p={p1} lab="64" hMax={190} op={old(at(scene, 4, 0))} />
        <Jump a={m(64)} b={m(32)} y={y} p={p2} lab="32" hMax={150} op={old(at(scene, 4, 0))} />
        <Jump a={m(32)} b={m(48)} y={y} p={p3} lab="16" hMax={70} op={old(at(scene, 4, 0))} />
        {/* why: the next jump goes back to the midpoint of the last jump */}
        <line x1={m(32)} y1={y} x2={m(48)} y2={y} stroke={C.amber} strokeWidth={14} strokeLinecap="round" opacity={half} />
        <line x1={m(40)} y1={y - 26} x2={m(40)} y2={y + 26} stroke={C.amber} strokeWidth={8} opacity={half} />
        <Jump a={m(48)} b={m(40)} y={y} p={back} lab="8" hMax={50} labDy={100} color={C.violet} />
        <Dot x={m(0)} y={y} n={1} color={GREY} val="0" op={ease(f, 4, 10)} />
        <Dot x={m(64)} y={y} n={2} color={GREY} val="64" op={ease(f, 4, 10)} />
        <Dot x={m(32)} y={y} n={3} color={GREY} val="32" op={ease(f, t2, 10)} />
        <Dot x={m(48)} y={y} n={4} color={C.primary} val="48" op={ease(f, t3, 10)} />
        <Dot x={m(40)} y={y} n={5} color={C.primary} op={p5} r={13} label={1} lx={-38} />
      </Stage>
      <Eq y={170} start={at(scene, 1, 0.3)} tex={`P_1 \\to P_2:\\ ${G}{64}\\ \\text{right}`} />
      <Eq y={260} start={at(scene, 2, 0.4)} tex={`P_2 \\to P_3:\\ ${V}{32}\\ \\text{left}`} />
      <Eq y={350} start={at(scene, 3, 0.55)} tex={`P_3 \\to P_4:\\ ${G}{16}\\ \\text{right}`} />
      <div style={{ position: 'absolute', left: PANEL - 20, top: 450, width: 830, height: 190, borderRadius: 24, background: C.primarySoft, opacity: ease(f, at(scene, 4, 0.3), 14) * 0 }} />
      <Eq y={470} start={at(scene, 4, 0.2)} tex={`${G}{64}\\ \\xrightarrow{\\div 2}\\ ${V}{32}\\ \\xrightarrow{\\div 2}\\ ${G}{16}`} />
      <Eq y={570} start={at(scene, 4, 0.55)} tex={`${G}{\\text{right}}\\ \\ \\ ${V}{\\text{left}}\\ \\ \\ ${G}{\\text{right}}`} size={48} />
      <Eq y={690} start={at(scene, 5, 0.5)} tex={'\\text{half of } 16 = 8\\text{, back}'} color={C.amber} />
    </>
  );
};

const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 470;
  const mw = mapper(0, 64, 130, 960);
  const yz = 520;
  const mz = mapper(40, 45, 160, 1760); // view A
  const mb = mapper(42, 43, 200, 1720); // view B
  const tp = [cue(scene, 1, 'five at forty'), cue(scene, 1, 'six at forty-four'), cue(scene, 1, 'seven at forty-two'), cue(scene, 1, 'eight at forty-three')];
  const zs = at(scene, 1, 0) - 4;
  const zt = ease(f, zs, 24);
  const bIn = ease(f, zs - 26, 12);
  const bop = bIn * (1 - ease(zt, 0.8, 0.2));
  const bx0 = lerp(mw(40) - 14, 150, zt);
  const bx1 = lerp(mw(45) + 14, 1770, zt);
  const panelOp = fadeTo(f, zs - 4, 0, 14);
  const wideP = (i: number) => ease(f, tp[i], 8);
  const newest = (i: number) => (i === 3 ? 1 : 1 - wideP(i + 1));
  // view A (40..45)
  const ja = ease(f, tp[1] - 8, 22);
  const jb = ease(f, tp[2] - 8, 22);
  const jc = ease(f, tp[3] - 8, 22);
  const band = ease(f, at(scene, 2, 0.35), 40);
  const bandOp = ease(f, at(scene, 2, 0.34), 10) * fadeTo(f, at(scene, 3, 0), 0, 8);
  // zoom again to view B (42..43)
  const zb0 = at(scene, 3, 0) - 8;
  const zt2 = ease(f, zb0, 20);
  const b2op = ease(f, zb0 - 10, 8) * (1 - ease(zt2, 0.8, 0.2));
  const c0 = lerp(mz(42) - 12, 150, zt2);
  const c1 = lerp(mz(43) + 12, 1770, zt2);
  const opA = zt * (1 - zt2);
  const t9 = cue(scene, 3, 'forty-two and');
  const j9 = ease(f, at(scene, 3, 0.2), 22);
  const p9 = ease(f, t9, 10);
  const j10 = ease(f, at(scene, 4, 0.35), 22);
  const t10 = cue(scene, 5, 'three quarters');
  const p10 = ease(f, t10, 10);
  const p10s = pop(f, t10);
  const tAns = cue(scene, 5, 'the answer is c', true, 0);
  const axisA = [41, 45];
  return (
    <>
      <Stage>
        <g opacity={1 - zt}>
          <NLine m={mw} x0={130} x1={960} y={y} lo={0} hi={64} step={8} major={16} />
          <Jump a={mw(32)} b={mw(48)} y={y} p={1} hMax={70} op={0.35} />
          <Jump a={mw(64)} b={mw(32)} y={y} p={1} hMax={150} op={0.35} />
          <Jump a={mw(0)} b={mw(64)} y={y} p={1} hMax={190} op={0.35} />
          {[0, 64, 32, 48].map((v, i) => (
            <Dot key={v} x={mw(v)} y={y} n={[1, 2, 3, 4][i]} color={GREY} val={String(v)} label={fadeTo(f, tp[0] - 4, 0, 8)} valOp={fadeTo(f, tp[0] - 4, 0, 8)} />
          ))}
        </g>
        <rect x={bx0} y={y - 150} width={bx1 - bx0} height={330} rx={22} fill="none" stroke={C.amber} strokeWidth={7} opacity={bop} strokeDasharray="16 10" />
        {/* view A: 40 to 45 */}
        <g opacity={opA}>
          <NLine m={mz} x0={160} x1={1760} y={yz} lo={40} hi={45} step={0.25} labels={axisA} />
          <rect x={lerp(mz(40), mz(42), band)} y={yz - 26} width={lerp(mz(44) - mz(40), mz(43) - mz(42), band)} height={52} rx={26} fill={C.amber} opacity={0.3 * bandOp} />
          <Jump a={mz(40)} b={mz(44)} y={yz} p={ja} hMax={170} lab="4" />
          <Jump a={mz(44)} b={mz(42)} y={yz} p={jb} hMax={120} lab="2" />
          <Jump a={mz(42)} b={mz(43)} y={yz} p={jc} hMax={90} lab="1" />
          {[40, 44, 42, 43].map((v, i) => {
            const nx = i < 3 ? ease(f, tp[i + 1], 8) : 0;
            return <Dot key={v} x={mz(v)} y={yz} n={5 + i} color={nx > 0.5 ? GREY : C.primary} op={ease(f, tp[i], 8)} val={String(v)} lx={[0, 50, -50, 50][i]} />;
          })}
        </g>
        <rect x={c0} y={yz - 150} width={c1 - c0} height={330} rx={22} fill="none" stroke={C.amber} strokeWidth={7} opacity={b2op} strokeDasharray="16 10" />
        {/* view B: 42 to 43 */}
        <g opacity={zt2}>
          <NLine m={mb} x0={200} x1={1720} y={yz} lo={42} hi={43} step={0.25} />
          <Jump a={mb(42)} b={mb(43)} y={yz} p={1} hMax={110} op={0.3} />
          <Jump a={mb(43)} b={mb(42.5)} y={yz} p={j9} hMax={140} lab={'\\dfrac12\\ \\text{left}'} labDy={190} labSize={56} op={1 - p10} />
          <Jump a={mb(42.5)} b={mb(42.75)} y={yz} p={j10} hMax={90} lab={'\\dfrac14\\ \\text{right}'} labDy={-180} labSize={56} />
          <Dot x={mb(42)} y={yz} n={7} color={GREY} val="42" lx={-50} />
          <Dot x={mb(43)} y={yz} n={8} color={p9 > 0.5 ? GREY : C.primary} val="43" lx={50} />
          <Dot x={mb(42.5)} y={yz} n={9} color={p10 > 0.2 ? GREY : C.primary} op={p9} val="42.5" chip={'42\\dfrac12'} lx={-90} />
          {p10 > 0 && (
            <g transform={`translate(${mb(42.75)} ${yz}) scale(${0.6 + 0.4 * Math.min(1.3, p10s)}) translate(${-mb(42.75)} ${-yz})`}>
              <Dot x={mb(42.75)} y={yz} n={10} color={C.green} op={p10} val="42.75" chip={'42\\dfrac34'} lx={90} r={19} />
            </g>
          )}
        </g>
      </Stage>
      <div style={{ opacity: panelOp }}>
        <Eq y={170} start={4} tex={`${G}{64}\\ \\ ${V}{32}\\ \\ ${G}{16}`} op={1} />
        <Eq y={270} start={at(scene, 0, 0.45)} tex={`${V}{8}\\text{ left},\\ ${G}{4}\\text{ right},\\ ${V}{2}\\text{ left},\\ ${G}{1}\\text{ right}`} size={50} />
      </div>
      <Answer x={1620} y={225} value="C" start={tAns} chime={CHIME} />
    </>
  );
};

const Pairs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const plain = '0 + 64 - 32 + 16 - 8 + 4 - 2 + 1 - \\dfrac12 + \\dfrac14';
  const sg = (c: string, sign: string, x: string) => `\\mathbin{\\textcolor{${c}}{${sign}}}\\textcolor{${c}}{${x}}`;
  const gg = '#0cc281', vv = '#7b61ff';
  const col0 = `${G}{+64}\\ ${V}{-32}\\ ${G}{+16}\\ ${V}{-8}\\ ${G}{+4}\\ ${V}{-2}\\ ${G}{+1}\\ ${V}{-\\dfrac12}\\ ${G}{+\\dfrac14}`;
  const col = [sg(gg, '+', '64'), sg(vv, '-', '32'), sg(gg, '+', '16'), sg(vv, '-', '8'), sg(gg, '+', '4'), sg(vv, '-', '2'), sg(gg, '+', '1'), sg(vv, '-', '\\dfrac12'), sg(gg, '+', '\\dfrac14')].join('\\,');
  void col0;
  const colored = ease(f, at(scene, 1, 0.3), 14);
  const box = (x: number, y: number, w: number, h: number, color: string, start: number) => (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 24, opacity: ease(f, start, 12) }} />
  );
  const cols = [C.blue, C.amber, C.primary, C.violet];
  const ys = 265;
  const tw = [395, 330, 310, 345];
  const pw = tw.map((w) => w + 28);
  const px = [114, 114 + pw[0] + 20, 114 + pw[0] + pw[1] + 40, 114 + pw[0] + pw[1] + pw[2] + 60];
  return (
    <>
      <Eq x={110} y={105} start={at(scene, 0, 0.45)} tex={`P_{10} = ${plain}`} size={50} op={1 - colored} />
      <Eq x={110} y={105} start={at(scene, 1, 0.3)} tex={`P_{10} = 0 ${col}`} size={50} op={colored} />
      {/* pairs */}
      {box(px[0] - 14, ys - 36, pw[0], 164, cols[0], at(scene, 2, 0.5))}
      <Eq x={px[0]} y={ys} start={at(scene, 2, 0.5)} tex={'(64 - 32) = 32'} size={50} />
      {box(px[1] - 14, ys - 36, pw[1], 164, cols[1], at(scene, 3, 0.05))}
      <Eq x={px[1]} y={ys} start={at(scene, 3, 0.05)} tex={'(16 - 8) = 8'} size={50} />
      {box(px[2] - 14, ys - 36, pw[2], 164, cols[2], at(scene, 3, 0.6))}
      <Eq x={px[2]} y={ys} start={at(scene, 3, 0.6)} tex={'(4 - 2) = 2'} size={50} />
      {box(px[3] - 14, ys - 36, pw[3], 164, cols[3], at(scene, 4, 0.05))}
      <Eq x={px[3]} y={ys} start={at(scene, 4, 0.05)} tex={'(1 - \\dfrac12) = \\dfrac12'} size={50} />
      <div style={{ position: 'absolute', left: 1670, top: ys - 36, width: 200, height: 164, border: `6px solid ${C.green}`, borderRadius: 82, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 4, 0.5)) }}>
        <Tex tex={'+\\dfrac14'} size={50} color={C.primary} />
      </div>
      <Text x={1770} y={ys + 140} w={300} size={40} weight={800} color={C.green} align="center" style={fadeUp(f, at(scene, 4, 0.6))}>on its own</Text>
      {/* quarter chain */}
      <div style={{ position: 'absolute', left: 250, top: 415, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap' }}>
        {['32', '8', '2', '\\dfrac12'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {i > 0 && (
              <div style={{ ...fadeUp(f, at(scene, 5, 0.45 + i * 0.12)), background: C.violet, color: '#fff', borderRadius: 999, padding: '4px 20px', fontSize: 48, fontWeight: 900 }}>÷ 4</div>
            )}
            <div style={{ ...fadeUp(f, at(scene, 5, 0.1 + i * 0.1)), background: C.card, borderRadius: 20, padding: '4px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <Tex tex={t} size={64} />
            </div>
          </div>
        ))}
      </div>
      <Eq x={110} y={585} start={at(scene, 6, 0.3)} tex={'32 + 8 + 2 = 42'} size={56} />
      <Eq x={1250} y={540} start={at(scene, 7, 0.1)} tex={'\\dfrac12 + \\dfrac14 = \\dfrac34'} size={56} />
      <Eq x={110} y={705} start={at(scene, 7, 0.6)} tex={'P_{10} = 42\\dfrac34 = 42.75'} size={58} color={C.green} />
      <div style={{ position: 'absolute', left: 770, top: 720 }}>
        <Check x={0} y={0} start={at(scene, 7, 0.8)}>{''}</Check>
      </div>
      <Pill x={1000} y={740} color={C.violet} style={{ ...fadeUp(f, at(scene, 8, 0.35)), fontSize: 40 }}>many steps: pairs keep it tidy</Pill>
    </>
  );
};

const TrapCard: React.FC<{ x: number; letter: string; val: string; chip: string; tag: string; start: number }> = ({ x, letter, val, chip, tag, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: 478, width: 390, height: 340, border: `6px solid ${C.red}`, background: C.card, borderRadius: 26, textAlign: 'center', ...fadeUp(f, start) }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 12 }}>
        <span style={{ color: C.red, fontSize: 48, fontWeight: 900 }}>{letter}</span>
        <Tex tex={val} size={58} />
      </div>
      <div style={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{chip && <Tex tex={chip} size={66} color={C.muted} />}</div>
      <div style={{ fontSize: 40, fontWeight: 900, color: C.red, marginTop: 6 }}>{tag}</div>
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const yz = 345;
  const mz = mapper(40, 45, 160, 1760);
  const t = [at(scene, 1, 0.45), at(scene, 2, 0.1), at(scene, 3, 0.1), at(scene, 4, 0.1)];
  const ends = [at(scene, 2, 0.1), at(scene, 3, 0.1), at(scene, 4, 0.1), at(scene, 5, 0)];
  const showNum = (i: number) => ease(f, t[i], 10) * fadeTo(f, ends[i], 0, 10);
  const demoIn = ease(f, at(scene, 5, 0), 14);
  const demoOut = fadeTo(f, at(scene, 6, 0), 0, 14);
  const lineOp = fadeTo(f, at(scene, 5, 0) - 4, 0, 12);
  const cards = [
    { x: 130, letter: '(A)', val: '42.5', chip: '42\\dfrac12', tag: 'one point early', i: 0, pt: 42.5, n: 9 },
    { x: 550, letter: '(B)', val: '42.625', chip: '42\\dfrac58', tag: 'one point late', i: 3, pt: 42.625, n: 11 },
    { x: 970, letter: '(D)', val: '43', chip: '', tag: 'stopped early', i: 1, pt: 43, n: 8 },
    { x: 1390, letter: '(E)', val: '44', chip: '', tag: 'far too early', i: 2, pt: 44, n: 6 },
  ];
  const cut = ease(f, at(scene, 2, 0.4), 12) * fadeTo(f, at(scene, 3, 0), 0, 10);
  const rowX = 330;
  const hab = ease(f, at(scene, 6, 0.2), 14);
  const dem = [
    { v: '0', a: 'P_1', b: 'P_0' }, { v: '64', a: 'P_2', b: 'P_1' }, { v: '32', a: 'P_3', b: 'P_2' }, { v: '\\cdots', a: '\\cdots', b: '\\cdots' },
    { v: '42.5', a: 'P_9', b: 'P_8' }, { v: '42.75', a: 'P_{10}', b: 'P_9' }, { v: '42.625', a: 'P_{11}', b: 'P_{10}' },
  ];
  return (
    <>
      <div style={{ opacity: lineOp }}>
        <Eq x={rowX} y={105} start={at(scene, 2, 0.1)} tex={`64,\\ 32,\\ 16,\\ 8,\\ 4,\\ 2,\\ 1\\ \\ ${'\\color{#ef4343}{\\Big|}'}\\ \\ \\dfrac12,\\ \\dfrac14`} size={56} op={cut} />
        <Stage>
          <NLine m={mz} x0={160} x1={1760} y={yz} lo={40} hi={45} step={0.25} labels={[40, 41, 42, 43, 44, 45]} />
          {[40, 44, 42, 43].map((v, i) => (
            <circle key={v} cx={mz(v)} cy={yz} r={10} fill={GREY} />
          ))}
          {/* P10, the true answer, quietly */}
          <circle cx={mz(42.75)} cy={yz} r={12} fill="none" stroke={C.green} strokeWidth={5} opacity={0.8} />
          {cards.map((c) => {
            const lit = ease(f, t[c.i], 8);
            const cx = c.x + 195;
            const px = mz(c.pt);
            return (
              <g key={c.letter}>
                <line x1={cx} y1={478} x2={px} y2={yz + 18} stroke={C.red} strokeWidth={5} strokeDasharray="10 8" opacity={lit * 0.85} />
                <circle cx={px} cy={yz} r={15} fill={C.red} opacity={lit} stroke="#fff" strokeWidth={4} />
                <T x={px + (c.n === 9 ? -45 : c.n === 11 ? 45 : 0)} y={yz - 72} tex={`P_{${c.n}}`} size={52} color={C.red} op={showNum(c.i)} w={200} />
              </g>
            );
          })}
        </Stage>
        {cards.map((c) => (
          <TrapCard key={c.letter} x={c.x} letter={c.letter} val={c.val} chip={c.chip} tag={c.tag} start={t[c.i]} />
        ))}
      </div>
      {/* relabel demo */}
      <div style={{ opacity: demoIn * demoOut }}>
        <Text x={960} y={140} w={1500} size={50} weight={900} align="center" color={C.muted}>If the first point gets called <Tex tex="P_0" size={50} color={C.red} /></Text>
        {dem.map((d, i) => (
          <div key={i} style={{ position: 'absolute', left: 130 + i * 240, width: 220, textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: 260, width: 220 }}><Tex tex={d.a} size={56} color={C.green} /></div>
            <div style={{ position: 'absolute', top: 350, width: 220, background: C.card, borderRadius: 18, padding: '4px 0', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}><Tex tex={d.v} size={54} /></div>
            <div style={{ position: 'absolute', top: 460, width: 220, opacity: ease(f, at(scene, 5, 0.3 + i * 0.05), 10) }}><Tex tex={d.b} size={56} color={C.red} /></div>
          </div>
        ))}
        <Text x={20} y={268} w={110} size={36} weight={900} color={C.green} style={{ display: 'none' }}>x</Text>
        <div style={{ position: 'absolute', left: 130, top: 190, fontSize: 40, fontWeight: 900, color: C.green }}>true name</div>
        <div style={{ position: 'absolute', left: 130, top: 545, fontSize: 40, fontWeight: 900, color: C.red, opacity: ease(f, at(scene, 5, 0.3), 10) }}>your name</div>
        <div style={{ position: 'absolute', left: 1590, top: 610, width: 280, textAlign: 'center', fontSize: 44, fontWeight: 900, color: C.red, opacity: ease(f, at(scene, 5, 0.6), 12) }}>
          your tenth is really <Tex tex="P_{11}" size={50} color={C.red} />
        </div>
        <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M 1730 600 L 1730 560" stroke={C.red} strokeWidth={8} strokeLinecap="round" opacity={ease(f, at(scene, 5, 0.6), 12)} />
          <path d="M 1716 575 L 1730 552 L 1744 575" stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(f, at(scene, 5, 0.6), 12)} />
        </svg>
      </div>
      {/* habit card */}
      <div style={{ position: 'absolute', left: 260, top: 200, width: 1400, background: C.card, borderRadius: 36, padding: '34px 50px', textAlign: 'center', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', opacity: hab, transform: `translateY(${(1 - hab) * 24}px)` }}>
        <div style={{ fontSize: 60, fontWeight: 900, color: C.primary }}>Label every point as you go</div>
        <div style={{ marginTop: 22 }}>
          <Tex tex={'P_1,\\ P_2,\\ P_3,\\ \\cdots,\\ P_{10}'} size={64} />
        </div>
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 160, x1 = 1760, y = 560;
  const m = mapper(0, 32, x0, x1);
  return (
    <>
      <Text x={960} y={120} w={1500} size={70} weight={900} align="center" style={fadeUp(f, 0)}>
        A new chase
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <Tex tex={'\\text{Where is } P_9\\,?'} size={80} />
      </div>
      <Stage>
        <NLine m={m} x0={x0} x1={x1} y={y} lo={0} hi={32} step={4} major={8} />
        <Dot x={m(0)} y={y} n={1} color={GREY} val="0" op={ease(f, at(scene, 1, 0.2), 10)} />
        <Dot x={m(32)} y={y} n={2} color={GREY} val="32" op={ease(f, at(scene, 1, 0.55), 10)} />
      </Stage>
    </>
  );
};

const Try2: SceneComponent = ({ scene }) => (
  <PauseQ
    scene={scene}
    hi={32}
    ticks={9}
    step={4}
    major={8}
    p2={32}
    seconds={12}
    text={<span>New chase: <Tex tex="P_1 = 0" size={50} />, <Tex tex="P_2 = 32" size={50} />. Each point is the midpoint of the two before it. Where is <Tex tex="P_9" size={50} />?</span>}
  />
);

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x0 = 130, x1 = 960, y = 470;
  const mw = mapper(0, 32, x0, x1);
  const yz = 470;
  const mz = mapper(20.75, 21.75, 150, 960);
  const tj = [cue(scene, 1, 'thirty-two right'), cue(scene, 1, 'sixteen left'), cue(scene, 1, 'eight right'), cue(scene, 1, 'four left'), cue(scene, 1, ', two right'), cue(scene, 1, 'one left')];
  const zs = at(scene, 2, 0);
  const zt = ease(f, zs, 24);
  const jp = tj.map((t) => ease(f, t, 20));
  const pv = [0, 32, 16, 24, 20, 22, 21];
  const j7 = ease(f, cue(scene, 2, 'a half to the right'), 18);
  const j8 = ease(f, cue(scene, 2, 'a quarter to the left'), 18);
  const tEnd = at(scene, 6, 0.8);
  const t9 = cue(scene, 6, 'twenty-one and a quarter');
  const p9 = ease(f, t9, 10);
  const pairsStart = at(scene, 3, 0);
  const listOp = fadeTo(f, pairsStart + 20, 0, 14);
  return (
    <>
      <Stage>
        <g opacity={1 - zt}>
          <NLine m={mw} x0={x0} x1={x1} y={y} lo={0} hi={32} step={4} major={8} />
          {[[0, 32], [32, 16], [16, 24], [24, 20], [20, 22], [22, 21]].map(([a, b], i) => {
            const nx = i + 1 < tj.length ? ease(f, tj[i + 1], 12) : 0;
            return <Jump key={i} a={mw(a)} b={mw(b)} y={y} p={jp[i]} hMax={[190, 150, 100, 80, 60, 50][i]} op={1 - 0.65 * nx} labOp={1 - nx} />;
          })}
          <Dot x={mw(0)} y={y} n={1} color={GREY} val="0" op={ease(f, 4, 10)} label={fadeTo(f, tj[2], 0, 8)} valOp={fadeTo(f, tj[2], 0, 8)} />
          {pv.slice(1).map((v, i) => {
            const n = i + 2;
            const nxt = i + 1 < jp.length ? jp[i + 1] : 0;
            return <Dot key={n} x={mw(v)} y={y} n={n} color={nxt > 0.3 ? GREY : C.primary} val={String(v)} op={ease(f, i === 0 ? 4 : tj[i], 8)} r={13} label={nxt > 0.3 ? 0 : 1} valOp={nxt > 0.3 ? 0 : 1} />;
          })}
        </g>
        <g opacity={zt}>
          <NLine m={mz} x0={150} x1={960} y={yz} lo={20.75} hi={21.75} step={0.25} />
          <Dot x={mz(21)} y={yz} n={7} color={GREY} val="21" lx={-50} />
          <Jump a={mz(21)} b={mz(21.5)} y={yz} p={j7} hMax={110} lab={'\\dfrac12\\ \\text{right}'} labSize={50} labDy={-200} op={1 - 0.6 * p9} labOp={1 - p9} />
          <Jump a={mz(21.5)} b={mz(21.25)} y={yz} p={j8} hMax={70} lab={'\\dfrac14\\ \\text{left}'} labSize={50} labDy={190} op={1 - 0.6 * p9} labOp={1 - p9} />
          <Dot x={mz(21.5)} y={yz} n={8} color={j8 > 0.3 ? GREY : C.primary} val="21.5" op={j7} lx={60} />
          {p9 > 0 && (
            <g transform={`translate(${mz(21.25)} ${yz}) scale(${0.6 + 0.4 * Math.min(1.3, pop(f, t9))}) translate(${-mz(21.25)} ${-yz})`}>
              <Dot x={mz(21.25)} y={yz} n={9} color={C.green} op={p9} val="21.25" chip={'21\\dfrac14'} lx={-60} r={18} />
            </g>
          )}
        </g>
      </Stage>
      <Pill x={130} y={720} color={C.violet} style={{ ...fadeUp(f, at(scene, 2, 0.7)), fontSize: 42 }}>
        8 jumps = P<sub>9</sub>
      </Pill>
      <div style={{ opacity: listOp }}>
        {[['32', 'right', G, 0], ['16', 'left', V, 1], ['8', 'right', G, 2], ['4', 'left', V, 3], ['2', 'right', G, 4], ['1', 'left', V, 5]].map(([n, d, c, i]) => (
          <Eq key={String(i)} x={PANEL + (Number(i) % 3) * 270} y={Number(i) < 3 ? 170 : 250} start={tj[Number(i)]} tex={`${c}{${n}}\\text{ ${d}},`} size={48} />
        ))}
        <Eq y={330} start={at(scene, 2, 0.35)} tex={`${G}{\\dfrac12}\\text{ right},\\ ${V}{\\dfrac14}\\text{ left}`} size={52} />
      </div>
      <Eq y={130} start={at(scene, 3, 0.2)} tex={'(32 - 16) = 16'} size={50} />
      <Eq x={1450} y={130} start={at(scene, 3, 0.7)} tex={'(8 - 4) = 4'} size={50} />
      <Eq y={225} start={at(scene, 4, 0.05)} tex={'(2 - 1) = 1'} size={50} />
      <Eq y={310} start={at(scene, 4, 0.55)} tex={'(\\dfrac12 - \\dfrac14) = \\dfrac14'} size={50} />
      <Eq y={470} start={at(scene, 5, 0.25)} tex={'16 + 4 + 1 = 21'} size={56} />
      <Eq y={560} start={at(scene, 5, 0.7)} tex={'21 + \\dfrac14'} size={56} />
      <Eq y={690} start={t9} tex={'P_9 = 21\\dfrac14 = 21.25'} size={58} color={C.green} />
      <Sequence from={tEnd} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={560} y={300} start={tEnd} seed={5} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 470;
  const x0 = 330, x1 = 1590;
  const m = mapper(0, 1, x0, x1);
  // alternating, halving jumps: positions 0, 1, 1/3 ...
  const pos = [0, 1, 0.5, 0.75, 0.625, 0.6875];
  const fade = fadeTo(f, at(scene, 3, 0), 0, 14);
  const lab = ['', '', '', '', ''];
  void lab;
  return (
    <>
      <Text x={960} y={100} w={1500} size={70} weight={900} align="center" style={{ ...fadeUp(f, 0), opacity: ease(f, 0, 12) * fade }}>
        The big idea
      </Text>
      <div style={{ opacity: fade }}>
        <div style={{ position: 'absolute', left: 150, top: 200, width: 1620, background: C.card, borderRadius: 30, padding: '16px 40px', fontSize: 50, fontWeight: 800, textAlign: 'center', boxShadow: '0 6px 24px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 1, 0.35)) }}>
          Midpoint rule: each jump is <span style={{ color: C.primary }}>half the last</span> and <span style={{ color: C.violet }}>flips direction</span>
        </div>
        <div style={{ position: 'absolute', left: 150, top: 680, width: 1620, background: C.card, borderRadius: 30, padding: '16px 40px', fontSize: 50, fontWeight: 800, textAlign: 'center', boxShadow: '0 6px 24px rgba(30,40,80,0.08)', ...fadeUp(f, at(scene, 2, 0.45)) }}>
          List the points, watch the jumps: they close in on <span style={{ color: C.green }}>one value</span>
        </div>
      </div>
      <Stage>
        <g opacity={fade}>
          <line x1={x0 - 30} y1={y} x2={x1 + 30} y2={y} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={ease(f, at(scene, 1, 0.3), 10)} />
          {range(5).map((i) => (
            <Jump key={i} a={m(pos[i])} b={m(pos[i + 1])} y={y} p={ease(f, at(scene, 1, 0.45 + i * 0.1), 18)} hMax={150} grow={0.2} />
          ))}
          {pos.map((p, i) => (
            <circle key={i} cx={m(p)} cy={y} r={i === 5 ? 15 : 12} fill={i === 5 ? C.primary : GREY} opacity={ease(f, at(scene, 1, 0.4 + i * 0.1), 8)} />
          ))}
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Try1,
  jumps: Jumps,
  list: List,
  pairs: Pairs,
  traps: Traps,
  variant: Variant,
  try2: Try2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

// YouTube thumbnail (`2026-10-30-midpoint-chase-thumb`, render.sh → poster.jpg): the number line with P1 = 0, P2 = 64 and the first two jumps, "P10 = ?", no answer.
export const Thumb: React.FC = () => {
  const m = mapper(0, 64, 60, 620);
  const y = 300;
  return (
    <ThumbFrame chip="AMC 8 Practice" lines={['Think it\'s', <span style={{ color: C.red }}>42.5?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <NLine m={m} x0={60} x1={620} y={y} lo={0} hi={64} step={16} labels={[]} op={1} />
        <Jump a={m(32)} b={m(48)} y={y} p={1} hMax={150} />
        <Dot x={m(0)} y={y} n={1} val="0" r={20} />
        <Dot x={m(64)} y={y} n={2} val="64" r={20} />
        <Dot x={m(32)} y={y} n={3} label={0} color={C.violet} r={18} />
        <Dot x={m(48)} y={y} n={4} label={0} color={C.primary} r={18} />
        <T x={340} y={540} tex="P_{10} = \;?" size={90} color={C.ink} w={600} />
      </svg>
    </ThumbFrame>
  );
};

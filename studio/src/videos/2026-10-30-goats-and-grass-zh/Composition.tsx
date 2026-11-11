import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-goats-and-grass-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Colour language: starting grass = green, new growth = blue, helper goats = violet.
export const START = C.primary;
export const GROW = C.blue;
export const HELP = C.violet;
const FIELD = '#e3f5e6';

/** Frame of line i (t = fraction into it), plus an offset in frames. */
const cue = (scene: Scene, i: number, t = 0, off = 0) => at(scene, i, t) + off;

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
const z = (t: string, c?: string): Part => ({ z: t, c });

// ---------- drawings ----------

/** A simple goat facing right, centred at (x, y). `fill` tints the body (team colour). */
export const Goat: React.FC<{ x: number; y: number; s?: number; fill?: string; opacity?: number; flip?: boolean }> = ({ x, y, s = 1, fill = '#ffffff', opacity = 1, flip }) =>
  s <= 0 || opacity <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity} stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
      {[-26, -12, 14, 26].map((lx) => (
        <line key={lx} x1={lx} y1={12} x2={lx} y2={40} strokeWidth={6} />
      ))}
      <path d="M -40 -6 Q -50 -16 -46 -22" fill="none" strokeWidth={5} />
      <ellipse cx={0} cy={0} rx={40} ry={22} fill={fill} />
      <path d="M 28 -26 Q 22 -46 8 -50" fill="none" strokeWidth={6} />
      <ellipse cx={40} cy={-20} rx={17} ry={14} fill={fill} />
      <path d="M 30 -28 L 18 -22" strokeWidth={5} />
      <path d="M 48 -8 L 50 6 L 42 -6" fill={C.ink} strokeWidth={3} />
      <circle cx={45} cy={-23} r={3} fill={C.ink} stroke="none" />
    </g>
  );

/** A fluffy sheep facing right. */
const Sheep: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) =>
  s <= 0 || opacity <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} stroke={C.ink} strokeWidth={4}>
      {[-24, -10, 12, 24].map((lx) => (
        <line key={lx} x1={lx} y1={10} x2={lx} y2={40} strokeWidth={6} strokeLinecap="round" />
      ))}
      {[[-26, 0], [-10, -12], [8, -12], [24, 0], [8, 10], [-12, 10]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={18} fill="#ffffff" />
      ))}
      <ellipse cx={0} cy={0} rx={30} ry={14} fill="#ffffff" stroke="none" />
      <ellipse cx={42} cy={-12} rx={14} ry={12} fill={C.ink} />
      <circle cx={47} cy={-15} r={3} fill="#ffffff" stroke="none" />
    </g>
  );

const Tuft: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = START }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M -14 0 Q -20 -22 -30 -34 Q -10 -26 -4 0 Z" />
      <path d="M -6 0 Q -6 -30 0 -46 Q 8 -30 6 0 Z" />
      <path d="M 4 0 Q 12 -24 28 -32 Q 18 -20 14 0 Z" />
      <rect x={-18} y={-3} width={36} height={6} rx={3} />
    </g>
  );

/** A row of goats from x (centre of the first), `gap` apart, popping in from `start`. */
const GoatRow: React.FC<{ n: number; x: number; y: number; s: number; gap: number; start?: number; stagger?: number; fill?: (i: number) => string; opacity?: number }> = ({
  n, x, y, s, gap, start, stagger = 2, fill, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {range(n).map((i) => (
        <Goat key={i} x={x + i * gap} y={y} s={s * (start === undefined ? 1 : pop(f, start + i * stagger, fps))} fill={fill ? fill(i) : '#ffffff'} opacity={opacity} />
      ))}
    </>
  );
};

// ---------- small layout helpers ----------

const Eq: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1, center }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: center ? x - 700 : x, width: center ? 1400 : undefined, textAlign: center ? 'center' : undefined, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number }> = ({ x, y, text, color = C.ink, size = 44, opacity = 1, anchor = 'middle', weight = 900 }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={weight} fontSize={size} textAnchor={anchor} dominantBaseline="middle">
      {text}
    </text>
  );

/** A bar segment from x, `w` wide, drawing on left→right as grow goes 0→1. */
const Seg: React.FC<{ x: number; y: number; w: number; h: number; color: string; grow?: number; opacity?: number; label?: string; labelSize?: number; soft?: boolean }> = ({
  x, y, w, h, color, grow = 1, opacity = 1, label, labelSize = 44, soft,
}) =>
  grow <= 0 || opacity <= 0 ? null : (
    <g opacity={opacity}>
      <rect x={x + 2} y={y} width={Math.max(0, w * grow - 4)} height={h} rx={14} fill={color} fillOpacity={soft ? 0.25 : 1} stroke={color} strokeWidth={soft ? 4 : 0} />
      {label && grow > 0.95 && <Label x={x + w / 2} y={y + h / 2 + 2} text={label} size={labelSize} color={soft ? color : '#fff'} />}
    </g>
  );

/** `n` growth chunks (one per day), drawn right→left or left→right. */
const Chunks: React.FC<{ x: number; y: number; n: number; cw: number; h: number; start: number; dur: number }> = ({ x, y, n, cw, h, start, dur }) => {
  const f = useCurrentFrame();
  return (
    <>
      {range(n).map((i) => {
        const p = ease(f, start + (i * dur) / n, 6);
        return p > 0 ? <rect key={i} x={x + i * cw + 2} y={y} width={cw - 4} height={h} rx={6} fill={GROW} opacity={p} /> : null;
      })}
    </>
  );
};

/** Bracket over [x1, x2] at height y, with a label above. */
const Brace: React.FC<{ x1: number; x2: number; y: number; text: string; color: string; opacity: number; below?: boolean; size?: number }> = ({ x1, x2, y, text, color, opacity, below, size = 44 }) => {
  if (opacity <= 0) return null;
  const d = below ? 14 : -14;
  return (
    <g opacity={opacity}>
      <path d={`M ${x1} ${y} L ${x1} ${y + d} L ${x2} ${y + d} L ${x2} ${y}`} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
      <Label x={(x1 + x2) / 2} y={y + d + (below ? 30 : -30)} text={text} color={color} size={size} />
    </g>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={960} y={130} w={1500} size={76} weight={900} align="center" style={fadeUp(f, 0)}>
        羊多了，天数少这么多？
      </Text>
      <Stage>
        <rect x={120} y={260} width={1680} height={420} rx={40} fill={FIELD} opacity={ease(f, 0, 14)} />
        <GoatRow n={10} x={210} y={350} s={0.75} gap={92} start={cue(scene, 0, 0.1)} />
        <Label x={1560} y={350} text="20 天" size={64} color={C.ink} opacity={ease(f, cue(scene, 0, 0.75), 10)} anchor="start" />
        <GoatRow n={15} x={200} y={540} s={0.75} gap={88} start={cue(scene, 1, 0.05)} stagger={3} />
        <Label x={1560} y={540} text="10 天" size={64} color={C.red} opacity={ease(f, cue(scene, 1, 0.4), 10)} anchor="start" />
      </Stage>
      <Text x={1560} y={600} w={330} size={44} weight={900} color={C.red} style={fadeUp(f, cue(scene, 1, 0.8))}>
        时间少一半！
      </Text>
      <Text x={960} y={700} w={1200} size={52} weight={900} align="center" color={C.violet} style={fadeUp(f, cue(scene, 2, 0.05))}>
        多 5 只山羊，就能少花整整 10 天。为什么？
      </Text>
      <div style={{ position: 'absolute', left: 1500, top: 120, textAlign: 'right', width: 340, ...fadeUp(f, cue(scene, 2, 0.5)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 56, color: C.violet }}>Vantee</div>
      </div>
    </>
  );
};

export const CHOICES = ['4', '5', '6', '8', '10'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 150, width: 1180, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box', ...fadeUp(f, 0) }}>
        一片草地上原来有<Mark on={cue(scene, 0, 0.45)}>一些草</Mark>，而且<Mark on={cue(scene, 0, 0.75)}>新草匀速生长</Mark>。
        <br />
        <Mark on={cue(scene, 1, 0.05)}>10 只山羊</Mark> <Mark on={cue(scene, 1, 0.2)}>20 天</Mark>能把草全部吃光，
        <br />
        <Mark on={cue(scene, 1, 0.5)}>15 只山羊</Mark> <Mark on={cue(scene, 1, 0.65)}>10 天</Mark>能全部吃光。
        <br />
        每只山羊吃草的速度都一样。
        <br />
        <Mark on={cue(scene, 2, 0.6)}>25 只山羊</Mark>需要多少天？
      </div>
      <Choices x={100} y={720} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => cue(scene, 3, 0.1 + i * 0.12)} />
      <Stage>
        <rect x={1330} y={230} width={500} height={440} rx={36} fill={FIELD} opacity={ease(f, 6, 14)} />
        {[[1400, 330], [1520, 300], [1660, 340], [1760, 300], [1400, 650], [1770, 650]].map(([x, y], i) => (
          <Tuft key={i} x={x} y={y} s={ease(f, 10 + i * 3, 10)} />
        ))}
        <Goat x={1470} y={450} s={1.2 * ease(f, 14, 12)} />
        <Goat x={1680} y={500} s={1.2 * ease(f, 20, 12)} flip />
        <Tuft x={1580} y={575} s={ease(f, cue(scene, 0, 0.8), 14) * 1.3} color={GROW} />
        <Label x={1580} y={615} text="新草" size={36} color={GROW} opacity={ease(f, cue(scene, 0, 0.85), 10)} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.12)', transformOrigin: '120px 140px' }}>
      <Text x={120} y={150} w={1200} size={52} weight={900} style={fadeUp(f, cue(scene, 0, 0.2))}>
        山羊在吃，草也在长！
      </Text>
      <Stage>
        {[0, 1, 2].map((i) => (
          <Tuft key={i} x={1440 + i * 80} y={215} s={ease(f, cue(scene, 0, 0.5) + i * 8, 20) * 1.1} color={GROW} />
        ))}
      </Stage>
      <Eq x={120} y={245} start={cue(scene, 1, 0.1)} size={64} tex={[z('吃掉的'), '=', z('原来的草', START), '+', z('新长的所有草', GROW)]} />
      <Card x={120} y={370} w={560} h={110} style={{ ...fadeUp(f, cue(scene, 2, 0.15)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, color: START }}>
        原来的草 = ?
      </Card>
      <Card x={720} y={370} w={640} h={110} style={{ ...fadeUp(f, cue(scene, 2, 0.45)), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, color: GROW }}>
        每天长多少 = ?
      </Card>
      <Card x={120} y={515} w={1240} h={130} style={fadeUp(f, cue(scene, 3, 0.15))}>
        <div style={{ position: 'absolute', left: 170, top: 0, height: 130, display: 'flex', alignItems: 'center', fontSize: 46, fontWeight: 800 }}>
          1 只山羊 × 1 天 = <span style={{ color: C.primary, marginLeft: 14 }}>1 筐</span>
        </div>
      </Card>
      <Stage>
        <Goat x={200} y={585} s={0.8 * pop(f, cue(scene, 3, 0.2), fps)} />
        <Tuft x={1290} y={605} s={ease(f, cue(scene, 3, 0.6), 10) * 1.1} />
      </Stage>
      <Pill x={120} y={680} color={C.violet} style={{ ...fadeUp(f, cue(scene, 4, 0.15)), fontSize: 48 }}>
        目标：25 只山羊要几天
      </Pill>
    </div>
  );
};

const makePause = (lines: React.ReactNode, seconds: number, animal: 'goat' | 'sheep'): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={110} y={200} w={900} h={560} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 44, fontSize: 50, fontWeight: 700, lineHeight: 1.45 }}>{lines}</div>
      </Card>
      <Stage>
        {range(5).map((i) =>
          animal === 'goat' ? <Goat key={i} x={240 + i * 160} y={670} s={0.8 * ease(f, 6 + i * 3, 10)} /> : <Sheep key={i} x={240 + i * 160} y={670} s={0.8 * ease(f, 6 + i * 3, 10)} />,
        )}
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// ---- Solution 1: goat-day bars ----

const BX = 160;
const U = 5.5; // px per goat-day
const BH = 84;
const AY = 280;
const BY = 480;
const PX = 1360;

/** The two cases as bars of goat-days. */
const Bars: React.FC<{ growA?: number; growB?: number; opacity?: number; labels?: boolean }> = ({ growA = 1, growB = 1, opacity = 1, labels = true }) => (
  <>
    <Seg x={BX} y={AY} w={200 * U} h={BH} color={C.ink} grow={growA} opacity={opacity} soft label={labels ? '200 筐' : undefined} />
    <Seg x={BX} y={BY} w={150 * U} h={BH} color={C.ink} grow={growB} opacity={opacity} soft label={labels ? '150 筐' : undefined} />
  </>
);

const BarTitles: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={BX} y={AY - 66} w={700} size={42} weight={800} style={fadeUp(f, a)}>10 只山羊，20 天</Text>
      <Text x={BX} y={BY - 66} w={700} size={42} weight={800} style={fadeUp(f, b)}>15 只山羊，10 天</Text>
    </>
  );
};

const Eaten: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Bars growA={ease(f, cue(scene, 1, 0.2), 40)} growB={ease(f, cue(scene, 2, 0.2), 30)} />
      </Stage>
      <BarTitles a={cue(scene, 1, 0.02)} b={cue(scene, 2, 0.02)} />
      <Eq x={PX} y={AY + 4} start={cue(scene, 1, 0.5)} tex="10 \times 20 = 200" />
      <Eq x={PX} y={BY + 4} start={cue(scene, 2, 0.5)} tex="15 \times 10 = 150" />
      <Text x={BX} y={640} w={1500} size={44} weight={800} color={C.muted} style={fadeUp(f, cue(scene, 0, 0.4))}>
        1 筐 = 1 只山羊 1 天吃的草
      </Text>
    </>
  );
};

const Growth: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const xB = BX + 150 * U;
  const xA = BX + 200 * U;
  const extra = ease(f, cue(scene, 1, 0.2), 14);
  return (
    <>
      <Stage>
        <Bars />
        <Seg x={xB} y={AY} w={50 * U} h={BH} color={GROW} grow={extra} label="50" />
        <line x1={xB} y1={AY - 10} x2={xB} y2={BY + BH + 10} stroke={C.muted} strokeWidth={4} strokeDasharray="12 10" opacity={ease(f, cue(scene, 0, 0.3), 10)} />
        <Brace x1={xB + 4} x2={xA - 4} y={AY - 4} text="多长了 10 天" color={GROW} opacity={extra} />
      </Stage>
      <BarTitles a={-30} b={-30} />
      <Eq x={PX} y={AY + 4} start={-30} tex="10 \times 20 = 200" />
      <Eq x={PX} y={BY + 4} start={-30} tex="15 \times 10 = 150" />
      <Text x={BX} y={620} w={1100} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, cue(scene, 0, 0.2)), opacity: ease(f, cue(scene, 0, 0.2)) * fadeTo(f, cue(scene, 2)) }}>
        原来的草一样多，为什么多吃了 50 筐？
      </Text>
      <Eq x={BX} y={640} start={cue(scene, 2, 0.4)} tex="200 - 150 = 50" color={GROW} />
      <Eq x={700} y={600} start={cue(scene, 3, 0.25)} tex={['\\dfrac{50}{10} = ', z('每天'), '5', z('筐')]} color={GROW} size={60} />
      <Stage>
        <GoatRow n={5} x={1400} y={690} s={0.6} gap={95} start={cue(scene, 3, 0.7)} stagger={3} />
      </Stage>
      <Text x={1340} y={570} w={540} size={40} weight={800} color={GROW} style={fadeUp(f, cue(scene, 3, 0.7))}>
        正好够 5 只山羊吃
      </Text>
    </>
  );
};

const StartScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cw = 5 * U;
  const xA = BX + 100 * U;
  const chunksA = cue(scene, 0, 0.1);
  const startA = ease(f, cue(scene, 1, 0.3), 14);
  const bIn = cue(scene, 2, 0.1);
  return (
    <>
      <Stage>
        <Seg x={BX} y={AY} w={200 * U} h={BH} color={C.ink} soft opacity={1 - startA} />
        <Chunks x={xA} y={AY} n={20} cw={cw} h={BH} start={chunksA} dur={scene.lines[0].frames * 0.6} />
        <Brace x1={xA + 4} x2={BX + 200 * U - 4} y={AY - 4} text="20 天 × 5" color={GROW} opacity={ease(f, chunksA + scene.lines[0].frames * 0.6, 10)} />
        <Seg x={BX} y={AY} w={100 * U} h={BH} color={START} grow={startA} label="原有 100" />
        <Seg x={BX} y={BY} w={150 * U} h={BH} color={C.ink} soft opacity={1 - ease(f, bIn, 10)} />
        <Seg x={BX} y={BY} w={100 * U} h={BH} color={START} grow={ease(f, bIn, 14)} label="原有 100" />
        <Chunks x={xA} y={BY} n={10} cw={cw} h={BH} start={bIn + 10} dur={scene.lines[2].frames * 0.4} />
        <Brace x1={xA + 4} x2={BX + 150 * U - 4} y={BY + BH + 4} text="10 天 × 5" color={GROW} opacity={ease(f, bIn + scene.lines[2].frames * 0.45, 10)} below />
      </Stage>
      <BarTitles a={-30} b={-30} />
      <Pill x={PX} y={150} color={GROW} style={{ fontSize: 44 }}>新草：每天 5 筐</Pill>
      <Eq x={PX} y={260} start={cue(scene, 0, 0.6)} tex="20 \times 5 = 100" color={GROW} />
      <Eq x={PX} y={350} start={cue(scene, 1, 0.5)} tex="200 - 100 = 100" color={START} />
      <Eq x={PX} y={480} start={cue(scene, 2, 0.4)} tex="100 + 10 \times 5" />
      <Eq x={PX} y={570} start={cue(scene, 2, 0.75)} tex="= 150 \;\checkmark" color={C.green} />
      <Text x={BX} y={690} w={1100} size={46} weight={900} style={fadeUp(f, cue(scene, 2, 0.9))}>
        原有：<span style={{ color: START }}>100 筐</span> · 每天长 <span style={{ color: GROW }}>5 筐</span>
      </Text>
    </>
  );
};

const Finish: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const PY = 360;
  const W = 100 * 8; // 8 px per goat-day here
  const s0 = cue(scene, 2, 0.15);
  const stepLen = (scene.lines[2].frames * 0.75) / 5;
  // Each day: 5 goat-days grow (blue sliver on the left), then the goats eat 25 from the left.
  const t = f < s0 ? 0 : (f - s0) / stepLen;
  const d = Math.min(5, Math.floor(t));
  const ph = d >= 5 ? 1 : t - d;
  const ndone = Math.min(5, d + (f >= s0 && ph >= 0.6 ? 1 : 0));
  const left = 100 - 20 * ndone;
  const x0 = BX + 160 * d;
  const preview = ease(f, cue(scene, 1, 0.1), 10);
  const sliver = d >= 5 || (f >= s0 && ph >= 0.6) ? 0 : f < s0 ? preview : d === 0 ? 1 : Math.min(1, ph / 0.2);
  const bite = f >= s0 && d < 5 && ph >= 0.3 && ph < 0.6 ? 1 : 0;
  const done = cue(scene, 4, 0.97);
  return (
    <>
      <Stage>
        <GoatRow n={13} x={210} y={170} s={0.6} gap={80} start={cue(scene, 0, 0.05)} stagger={1} />
        <GoatRow n={12} x={250} y={250} s={0.6} gap={80} start={cue(scene, 0, 0.05) + 13} stagger={1} />
        <rect x={BX} y={PY} width={W} height={BH} rx={14} fill="none" stroke={C.line} strokeWidth={4} strokeDasharray="10 8" />
        <Seg x={BX + W - W * (left / 100)} y={PY} w={W * (left / 100)} h={BH} color={START} label={left > 0 && !bite ? (ndone === 0 ? '原有 100' : `${left}`) : undefined} />
        {sliver > 0 && (
          <g opacity={sliver}>
            <rect x={x0 - 40} y={PY} width={38} height={BH} rx={8} fill={GROW} />
            <Label x={x0 - 21} y={PY - 32} text="+5" size={44} color={GROW} />
          </g>
        )}
        {bite > 0 && (
          <g>
            <rect x={x0 - 42} y={PY - 6} width={204} height={BH + 12} rx={14} fill={C.red} fillOpacity={0.18} stroke={C.red} strokeWidth={5} />
            <Label x={x0 + 100} y={PY - 32} text="−25" size={44} color={C.red} />
          </g>
        )}
        {range(5).map((k) => (
          <g key={k} opacity={ndone > k ? 1 : 0}>
            <line x1={BX + (k + 1) * 160} y1={PY - 8} x2={BX + (k + 1) * 160} y2={PY + BH + 8} stroke={C.muted} strokeWidth={3} />
            <Label x={BX + k * 160 + 80} y={PY + BH + 44} text={`第 ${k + 1} 天`} size={36} color={C.muted} />
          </g>
        ))}
      </Stage>
      <Eq x={PX} y={300} start={cue(scene, 0, 0.6)} tex={[z('每天吃'), '25']} color={C.red} />
      <Eq x={PX} y={390} start={cue(scene, 1, 0.1)} tex={[z('每天长'), '5']} color={GROW} />
      <Eq x={PX} y={480} start={cue(scene, 1, 0.7)} tex="25 - 5 = 20" />
      <Eq x={BX} y={540} start={cue(scene, 2, 0.85)} size={64} tex={['\\dfrac{100}{20} = 5', z('天')]} />
      <Eq x={BX + 560} y={560} start={cue(scene, 3, 0.25)} size={52} tex="25 \times 5 = 125" color={C.muted} />
      <Eq x={BX + 560} y={650} start={cue(scene, 3, 0.65)} size={52} tex="= 100 + 25 \;\checkmark" color={C.muted} />
      <Answer x={1660} y={690} value="B" chime={CHIME} start={done} />
      <Confetti x={1660} y={690} start={done + 4} seed={7} />
    </>
  );
};

// ---- Solution 2: helper goats ----

const Teams: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const split = ease(f, cue(scene, 1, 0.05), 16);
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.3))}>把山羊分成两队</Pill>
      <Card x={120} y={260} w={800} h={500} style={{ ...fadeUp(f, cue(scene, 0, 0.6)), border: `6px solid ${HELP}` }}>
        <div style={{ position: 'absolute', left: 40, top: 30, fontSize: 52, fontWeight: 900, color: HELP }}>帮手队</div>
        <div style={{ position: 'absolute', left: 40, top: 330, width: 720, fontSize: 42, fontWeight: 800, lineHeight: 1.3, opacity: split }}>
          只吃<span style={{ color: GROW }}>新长的草</span>，草长多快，就吃多快
        </div>
      </Card>
      <Card x={1000} y={260} w={800} h={500} style={{ ...fadeUp(f, cue(scene, 0, 0.75)), border: `6px solid ${START}` }}>
        <div style={{ position: 'absolute', left: 40, top: 30, fontSize: 52, fontWeight: 900, color: START }}>其余的山羊</div>
        <div style={{ position: 'absolute', left: 40, top: 330, width: 720, fontSize: 42, fontWeight: 800, lineHeight: 1.3, opacity: ease(f, cue(scene, 1, 0.55), 12) }}>
          吃<span style={{ color: START }}>原来那堆草</span>，这堆草不会再长
        </div>
      </Card>
      <Stage>
        <g opacity={ease(f, cue(scene, 0, 0.8), 12)}>
          <Goat x={330} y={460} s={1.3} fill={HELP} />
          {[560, 660, 760].map((x, i) => (
            <Tuft key={x} x={x} y={490} s={1.1 * (0.6 + 0.4 * Math.abs(Math.sin((f + i * 20) / 18)))} color={GROW} />
          ))}
          <Goat x={1180} y={460} s={1.3} fill={START} />
          <Seg x={1370} y={420} w={360} h={80} color={START} />
        </g>
      </Stage>
    </>
  );
};

const GRows = range(6).map((k) => ({ k, a: (10 - k) * 20, b: (15 - k) * 10 }));

const Guess: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X0 = 170;
  const cols = [X0, X0 + 230, X0 + 760, X0 + 1290];
  const Y0 = 245;
  const RH = 94;
  const show = [cue(scene, 1, 0.1), ...range(4).map((i) => cue(scene, 2, 0.15 + i * 0.2)), cue(scene, 3, 0.35)];
  return (
    <>
      <Text x={cols[0]} y={150} w={260} size={40} weight={900} color={HELP} style={fadeUp(f, cue(scene, 0, 0.1))}>帮手</Text>
      <Text x={cols[1]} y={150} w={440} size={40} weight={900} style={fadeUp(f, cue(scene, 0, 0.5))}>草堆（10 只）</Text>
      <Text x={cols[2]} y={150} w={440} size={40} weight={900} style={fadeUp(f, cue(scene, 0, 0.5))}>草堆（15 只）</Text>
      <Text x={cols[3]} y={150} w={300} size={40} weight={900} color={C.red} style={fadeUp(f, cue(scene, 1, 0.8))}>差距</Text>
      {GRows.map(({ k, a, b }, i) => {
        const y = Y0 + i * RH;
        const hit = k === 5;
        const st = fadeUp(f, show[i], 10);
        return (
          <div key={k} style={{ position: 'absolute', left: X0 - 30, top: y, width: 1560, height: RH - 10, borderRadius: 18, background: hit ? C.primarySoft : C.card, ...st }}>
            <div style={{ position: 'absolute', left: 50, top: 6, fontSize: 52, fontWeight: 900, color: HELP }}>{k}</div>
            <div style={{ position: 'absolute', left: cols[1] - X0 + 30, top: 6 }}>
              <Tex tex={`${10 - k} \\times 20 = ${a}`} size={48} />
            </div>
            <div style={{ position: 'absolute', left: cols[2] - X0 + 30, top: 6 }}>
              <Tex tex={`${15 - k} \\times 10 = ${b}`} size={48} />
            </div>
            <div style={{ position: 'absolute', left: cols[3] - X0 + 30, top: 6 }}>
              <Tex tex={hit ? '0 \\;\\checkmark' : `${a - b}`} size={50} color={hit ? C.green : C.red} />
            </div>
          </div>
        );
      })}
      {[cols[2] - 160, cols[3] - 160].map((x, j) => (
        <Text key={j} x={x} y={Y0 + RH + 6} w={120} size={48} weight={900} color={HELP} style={{ ...fadeUp(f, cue(scene, 2, 0.3 + j * 0.2)), opacity: ease(f, cue(scene, 2, 0.3 + j * 0.2)) * fadeTo(f, cue(scene, 3, 0.2)) }}>
          {j === 0 ? '−20' : '−10'}
        </Text>
      ))}
    </>
  );
};

const Use: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const G = 90;
  const X = 300;
  const recolor = ease(f, cue(scene, 0, 0.4), 12);
  return (
    <>
      <Stage>
        <GoatRow n={5} x={X} y={210} s={0.65} gap={G} start={cue(scene, 0, 0.02)} stagger={1} fill={() => (recolor > 0.5 ? HELP : '#ffffff')} />
        <GoatRow n={10} x={X + 6 * G} y={170} s={0.65} gap={G} start={cue(scene, 0, 0.02) + 5} stagger={1} fill={() => (recolor > 0.5 ? START : '#ffffff')} />
        <GoatRow n={10} x={X + 6 * G} y={260} s={0.65} gap={G} start={cue(scene, 0, 0.02) + 15} stagger={1} fill={() => (recolor > 0.5 ? START : '#ffffff')} />
        <Brace x1={X - 40} x2={X + 4 * G + 45} y={310} text="5 只帮手" color={HELP} opacity={ease(f, cue(scene, 0, 0.45), 10)} below />
        <Brace x1={X + 6 * G - 40} x2={X + 15 * G + 45} y={310} text="20 只吃草堆" color={START} opacity={ease(f, cue(scene, 0, 0.65), 10)} below />
      </Stage>
      <Eq x={960} y={400} start={cue(scene, 1, 0.6)} center size={68} tex={['\\dfrac{100}{20} = 5', z('天')]} />
      <Text x={960} y={580} w={800} size={48} weight={900} color={C.green} align="center" style={fadeUp(f, cue(scene, 1, 0.85))}>
        答案一样！
      </Text>
      <Card x={260} y={670} w={1400} h={120} style={{ ...fadeUp(f, cue(scene, 2, 0.3)), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.3 }}>
          <span style={{ color: HELP }}>帮手山羊</span>把会长的草地，变成了<span style={{ color: START }}>一堆不会变的草</span>。
        </div>
      </Card>
    </>
  );
};

// ---- traps ----

const TRAP_TEX = ['\\dfrac{100}{25}', '\\dfrac{100}{25 - 5}', '\\dfrac{150}{25}', '\\dfrac{200}{25}', '\\dfrac{200}{20}'];
const NOTES = ['忘了新长的草', '✓ 正确做法', '含 10 天的新草', '含 20 天的新草', '把 200 当成原有'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [cue(scene, 1, 0.15), Infinity, cue(scene, 2, 0.1), cue(scene, 2, 0.55), cue(scene, 4, 0.1)];
  const noteAt = [cue(scene, 1, 0.5), cue(scene, 5, 0.3), cue(scene, 3, 0.2), cue(scene, 3, 0.3), cue(scene, 4, 0.5)];
  const right = cue(scene, 5, 0.3);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 1 && f >= right;
          const border = wrong ? C.red : ok ? C.green : 'transparent';
          const shown = Math.min(1, ease(f, i === 1 ? right : wrongAt[i], 10));
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 390, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 18 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 110, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={72} color={wrong ? C.red : ok ? C.green : C.ink} />
                </div>
                <div style={{ opacity: shown, marginTop: 10 }}>
                  <Tex tex={TRAP_TEX[i]} size={50} color={wrong ? C.red : C.green} />
                </div>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 18, fontSize: 38, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, color: i === 1 ? C.green : C.ink, ...fadeUp(f, noteAt[i]) }}>
                {NOTES[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 260, top: 700, width: 1400, boxSizing: 'border-box', textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 46, fontWeight: 900, ...fadeUp(f, cue(scene, 5, 0.1)) }}>
        吃掉的 = 原来的草 + 所有新长的草
      </div>
    </>
  );
};

// ---- variant ----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={150} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.05))}>轮到你了！</Pill>
      <Text x={120} y={260} w={1700} size={58} weight={900} style={fadeUp(f, cue(scene, 0, 0.35))}>
        <span style={{ color: C.primary }}>8 只绵羊</span>，<span style={{ color: C.primary }}>30 天</span>能把草吃光。
      </Text>
      <Text x={120} y={350} w={1700} size={58} weight={900} style={fadeUp(f, cue(scene, 0, 0.7))}>
        <span style={{ color: C.primary }}>12 只绵羊</span>，要 <span style={{ color: C.primary }}>15 天</span>。
      </Text>
      <Text x={120} y={460} w={1700} size={50} weight={700} style={fadeUp(f, cue(scene, 1, 0.05))}>
        草每天匀速生长。<b style={{ color: C.violet }}>24 只绵羊</b>需要多少天？
      </Text>
      <Stage>
        {range(24).map((i) => (
          <Sheep key={i} x={260 + (i % 12) * 118} y={610 + Math.floor(i / 12) * 105} s={0.75 * ease(f, cue(scene, 1, 0.4) + i, 10)} />
        ))}
      </Stage>
    </>
  );
};

const VU = 4; // px per sheep-day
const VAY = 230;
const VBY = 380;
const VH = 70;
const VPX = 1170;

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const xB = BX + 180 * VU;
  const extra = ease(f, cue(scene, 2, 0.15), 12);
  const startIn = ease(f, cue(scene, 4, 0.2), 14);
  const growIn = ease(f, cue(scene, 3, 0.1), 10);
  const done = cue(scene, 6, 0.97);
  return (
    <>
      <Text x={BX} y={VAY - 60} w={600} size={38} weight={800} style={fadeUp(f, cue(scene, 0, 0.1))}>8 只绵羊，30 天</Text>
      <Text x={BX} y={VBY - 60} w={600} size={38} weight={800} style={fadeUp(f, cue(scene, 1, 0.05))}>12 只绵羊，15 天</Text>
      <Stage>
        <Seg x={BX} y={VAY} w={240 * VU} h={VH} color={C.ink} soft grow={ease(f, cue(scene, 0, 0.3), 30)} label="240" opacity={1 - growIn} />
        <Seg x={BX} y={VAY} w={120 * VU} h={VH} color={C.ink} soft opacity={growIn * (1 - startIn)} />
        <Chunks x={BX + 120 * VU} y={VAY} n={30} cw={4 * VU} h={VH} start={cue(scene, 3, 0.15)} dur={scene.lines[3].frames * 0.5} />
        <Brace x1={BX + 120 * VU + 4} x2={BX + 240 * VU - 4} y={VAY - 4} text="30 天 × 4" color={GROW} opacity={ease(f, cue(scene, 3, 0.7), 10)} />
        <Seg x={BX} y={VBY} w={180 * VU} h={VH} color={C.ink} soft grow={ease(f, cue(scene, 1, 0.2), 24)} label="180" />
        <Seg x={xB} y={VAY} w={60 * VU} h={VH} color={GROW} grow={extra} label="60" opacity={1 - growIn} />
        <Brace x1={xB + 4} x2={BX + 240 * VU - 4} y={VAY - 4} text="多长了 15 天" color={GROW} opacity={extra * (1 - growIn)} />
        <Seg x={BX} y={VAY} w={120 * VU} h={VH} color={START} grow={startIn} label="原有 120" />
      </Stage>
      <Eq x={VPX} y={VAY} start={cue(scene, 0, 0.6)} tex="8 \times 30 = 240" />
      <Eq x={VPX} y={VBY} start={cue(scene, 1, 0.5)} tex="12 \times 15 = 180" />
      <Eq x={BX} y={490} start={cue(scene, 2, 0.35)} tex="240 - 180 = 60" color={GROW} />
      <Eq x={BX} y={590} start={cue(scene, 2, 0.7)} tex={['\\dfrac{60}{15} = ', z('每天'), '4', z('筐')]} color={GROW} />
      <Eq x={700} y={490} start={cue(scene, 3, 0.5)} tex="30 \times 4 = 120" color={GROW} />
      <Eq x={700} y={590} start={cue(scene, 4, 0.5)} tex="240 - 120 = 120" color={START} />
      <Eq x={1250} y={490} start={cue(scene, 5, 0.3)} tex="24 - 4 = 20" color={HELP} />
      <Eq x={1250} y={590} start={cue(scene, 6, 0.5)} size={60} tex={['\\dfrac{120}{20} = 6', z('天')]} />
      <Answer x={1740} y={320} value="6" chime={CHIME} start={done} />
      <Confetti x={1740} y={320} start={done + 4} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, cue(scene, 3));
  const steps: [string, React.ReactNode, number][] = [
    ['1', <>按<b style={{ color: C.primary }}>筐</b>来算：1 只羊 1 天吃 1 筐。</>, cue(scene, 0, 0.5)],
    ['2', <>两种情况 → <b style={{ color: GROW }}>每天长多少</b> → <b style={{ color: START }}>原来有多少</b>。</>, cue(scene, 1, 0.2)],
    ['3', <><b style={{ color: HELP }}>帮手</b>吃新长的草，其余的吃原来那堆。</>, cue(scene, 2, 0.15)],
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 640, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        {steps.map(([n, t, s], i) => (
          <div key={n} style={{ position: 'absolute', left: 70, top: 160 + i * 140, display: 'flex', alignItems: 'center', gap: 30, fontSize: 54, fontWeight: 800, ...fadeUp(f, s) }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.violet, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{n}</div>
            <div>{t}</div>
          </div>
        ))}
      </div>
      <SignOff start={cue(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={cue(scene, 3, 0.2) + 4} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(
    <>
      草匀速生长。
      <br />
      <b style={{ color: C.primary }}>10 只山羊</b>：20 天吃光。
      <br />
      <b style={{ color: C.primary }}>15 只山羊</b>：10 天吃光。
      <br />
      <b style={{ color: C.violet }}>25 只山羊</b>要几天？
    </>,
    10,
    'goat',
  ),
  eaten: Eaten,
  growth: Growth,
  start: StartScene,
  finish: Finish,
  teams: Teams,
  guess: Guess,
  use: Use,
  traps: Traps,
  variant: Variant,
  try2: makePause(
    <>
      草匀速生长。
      <br />
      <b style={{ color: C.primary }}>8 只绵羊</b>：30 天吃光。
      <br />
      <b style={{ color: C.primary }}>12 只绵羊</b>：15 天吃光。
      <br />
      <b style={{ color: C.violet }}>24 只绵羊</b>要几天？
    </>,
    10,
    'sheep',
  ),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第5级" font={ZH_FONT} /> : null;

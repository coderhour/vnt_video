import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-ladder-over-box-zh';
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

const PAUSE_LABEL = <span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>;

// ---------- geometry (feet, y up; foot at the origin) ----------

export type Cfg = { a: number; d: number; h: number; u: number; ox: number; oy: number };
/** Question: foot 9 ft from the box, box 12 deep and 12 tall. */
export const Q: Cfg = { a: 9, d: 12, h: 12, u: 21, ox: 150, oy: 700 };
/** Variant: foot 6 ft from the box, box 9 deep and 8 tall. */
export const V: Cfg = { a: 6, d: 9, h: 8, u: 26, ox: 200, oy: 700 };

export const wx = (c: Cfg) => c.a + c.d; // wall distance
export const wy = (c: Cfg) => (c.h / c.a) * wx(c); // height where the ladder meets the wall
export const px = (c: Cfg, x: number, y: number): Pt => [c.ox + x * c.u, c.oy - y * c.u];
/** Point at fraction t of the ladder. */
export const lad = (c: Cfg, t: number): Pt => px(c, t * wx(c), t * wy(c));

export const WOOD = '#a0662b';
export const GREY = '#dfe3ec';
export const WALLC = '#cdd3e0';
const PANEL = 820;

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({
  p, text, color = C.ink, size = 50, opacity = 1, anchor = 'middle',
}) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={9}>
      {text}
    </text>
  );

export const Seg: React.FC<{ a: Pt; b: Pt; color: string; opacity?: number; width?: number; dashed?: boolean; p?: number }> = ({ a, b, color, opacity = 1, width = 14, dashed, p = 1 }) =>
  opacity <= 0 || p <= 0 ? null : (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} strokeDasharray={dashed ? '16 14' : undefined} />
  );

/** Horizontal bracket (pixels) with label below it. */
export const HBrace: React.FC<{ x1: number; x2: number; y: number; color: string; opacity: number; label: string }> = ({ x1, x2, y, color, opacity, label }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${x1} ${y - 12} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y - 12}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label p={[(x1 + x2) / 2, y + 28]} text={label} color={color} size={50} />
    </g>
  );

/** Vertical bracket (pixels) with label to the right. */
export const VBrace: React.FC<{ x: number; y1: number; y2: number; color: string; opacity: number; label: string; lx?: number }> = ({ x, y1, y2, color, opacity, label, lx = 64 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <path d={`M ${x - 12} ${y1} L ${x} ${y1} L ${x} ${y2} L ${x - 12} ${y2}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label p={[x + lx, (y1 + y2) / 2]} text={label} color={color} size={50} />
    </g>
  );

type FigProps = {
  c: Cfg;
  draw?: number; // ground, wall and box
  ladder?: number; // ladder sweeps from the foot
  dotP?: number;
  dotW?: number;
  small?: number; // green triangle: foot, (a,0), P
  big?: number; // purple triangle: foot, (wx,0), W
  up?: number; // amber triangle: P, (wx,h), W
  wallLabel?: number;
  dim?: number; // ladder opacity
};

/** Side view: ground, wall, box and the ladder through the box's top outer corner. */
export const Fig: React.FC<FigProps> = ({ c, draw = 1, ladder = 1, dotP = 1, dotW = 0, small = 0, big = 0, up = 0, wallLabel = 1, dim = 1 }) => {
  const { a, d, h } = c;
  const X = wx(c);
  const top = wy(c) + 3;
  const F = px(c, 0, 0);
  const P = px(c, a, h);
  const W = px(c, X, wy(c));
  const wallTop = px(c, X, top);
  return (
    <>
      <Poly pts={[px(c, 0, 0), px(c, a, 0), P]} color={C.primary} width={0} fill={C.primary} fillOpacity={0.4} opacity={small} />
      <Poly pts={[px(c, 0, 0), px(c, X, 0), W]} color={C.violet} width={0} fill={C.violet} fillOpacity={0.3} opacity={big} />
      <Poly pts={[P, px(c, X, h), W]} color={C.amber} width={0} fill={C.amber} fillOpacity={0.42} opacity={up} />
      {/* ground and wall */}
      <rect x={c.ox - 1.2 * c.u} y={c.oy} width={(X + 2.2) * c.u} height={0.6 * c.u} fill={WALLC} opacity={ease(draw * 20, 0, 20)} />
      <rect x={px(c, X, 0)[0]} y={wallTop[1]} width={c.u} height={px(c, X, -0.6)[1] - wallTop[1]} fill={WALLC} opacity={draw} />
      {/* box */}
      <rect x={px(c, a, h)[0]} y={px(c, a, h)[1]} width={d * c.u} height={h * c.u} fill={GREY} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" opacity={draw} />
      {/* ladder */}
      {ladder > 0 && <Seg a={F} b={W} color={WOOD} width={13} opacity={dim} p={ladder} />}
      <circle cx={F[0]} cy={F[1]} r={11} fill={C.ink} opacity={ladder > 0 ? 1 : 0} />
      <circle cx={P[0]} cy={P[1]} r={13} fill={C.ink} opacity={dotP * (ladder > 0.5 ? 1 : 0)} />
      <circle cx={W[0]} cy={W[1]} r={14} fill={C.ink} opacity={dotW} />
      <Label p={[wallTop[0] + c.u + 12, wallTop[1] + 30]} text="墙" color={C.muted} anchor="start" opacity={wallLabel * draw} />
    </>
  );
};

const Eq: React.FC<{ y: number; tex: string | Part[]; start: number; x?: number; size?: number; color?: string }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

export const CHOICES = ['15', '20', '28', '35', '37'];

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const q = ease(f, at(scene, 1, 0.1), 10);
  return (
    <>
      <Stage>
        <Fig c={Q} draw={ease(f, 4, 40)} ladder={ease(f, at(scene, 0, 0.3), 50)} dotP={ease(f, at(scene, 0, 0.7), 8)} />
        {q > 0 && (
          <g transform={`translate(${lad(Q, 0.5)[0] - 80} ${lad(Q, 0.5)[1] - 70}) scale(${q})`} opacity={fadeTo(f, at(scene, 2))}>
            <circle r={52} fill={C.violet} />
            <text y={4} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={80} textAnchor="middle" dominantBaseline="middle">?</text>
          </g>
        )}
      </Stage>
      <Text x={PANEL} y={230} w={1000} size={92} weight={900} style={{ lineHeight: 1.1, ...fadeUp(f, 6) }}>
        越过箱子
        <br />
        的梯子
      </Text>
      <Pill x={PANEL} y={500} color={C.violet} style={{ ...fadeUp(f, 18), fontSize: 38 }}>AMC 8 风格 · 第5级</Pill>
      <div style={{ position: 'absolute', left: PANEL, top: 600, fontFamily: PACIFICO, fontSize: 110, color: C.violet, ...fadeUp(f, at(scene, 2, 0.1)) }}>Vantee</div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pulse = ease(f, at(scene, 3, 0.4), 8) * (1 - ease(f, at(scene, 4, 0), 10));
  const P = px(Q, Q.a, Q.h);
  return (
    <>
      <div style={{ position: 'absolute', left: PANEL, top: 130, width: 1010, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 46, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        一个<Mark on={at(scene, 1, 0.3)}>高 12 英尺</Mark>、<Mark on={at(scene, 1, 0.6)}>深 12 英尺</Mark>的箱子放在地上，紧靠着墙。梯子的底端<Mark on={at(scene, 2, 0.4)}>离箱子 9 英尺</Mark>。梯子碰到<Mark on={at(scene, 3, 0.4)}>箱子顶部外侧的边</Mark>，并搭到墙上。<Mark on={at(scene, 4, 0.2)}>梯子有多长（单位：英尺）？</Mark>
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 640, display: 'flex', gap: 22 }}>
        {CHOICES.map((ch, i) => (
          <div key={ch} style={{ ...fadeUp(f, at(scene, 5, 0.15 + i * 0.12), 10), background: C.card, borderRadius: 18, padding: '10px 24px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 40, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {ch}
          </div>
        ))}
      </div>
      <Stage>
        <Fig c={Q} />
        <Label p={px(Q, Q.a + 0.5, 6)} text="12" color={C.primary} anchor="start" opacity={ease(f, at(scene, 1, 0.5), 10)} />
        <Label p={px(Q, Q.a + 6, -2)} text="12" color={C.primary} opacity={ease(f, at(scene, 1, 0.3), 10)} />
        <Label p={px(Q, Q.a / 2, -2)} text="9" color={C.blue} opacity={ease(f, at(scene, 2, 0.5), 10)} />
        <circle cx={P[0]} cy={P[1]} r={14 + 34 * pulse} fill="none" stroke={C.red} strokeWidth={7} opacity={pulse} />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = px(Q, Q.a, Q.h);
  const pulse = ease(f, at(scene, 2, 0.3), 8) * (1 - ease(f, at(scene, 3, 0), 10));
  const trace = ease(f, at(scene, 3, 0.2), 40);
  const x0 = px(Q, 0, 0)[0];
  const x1 = px(Q, wx(Q), 0)[0];
  return (
    <>
      <Stage>
        <Fig c={Q} dotW={ease(f, at(scene, 3, 0.6), 8)} />
        <Label p={px(Q, Q.a / 2, -2)} text="9" color={C.blue} />
        <Label p={px(Q, Q.a + 6, -2)} text="12" color={C.primary} />
        <HBrace x1={x0} x2={x1} y={px(Q, 0, 0)[1] + 82} color={C.violet} label="21" opacity={ease(f, at(scene, 1, 0.7), 12)} />
        <circle cx={P[0]} cy={P[1]} r={14 + 34 * pulse} fill="none" stroke={C.red} strokeWidth={7} opacity={pulse} />
        <Seg a={px(Q, 0, 0)} b={px(Q, wx(Q), wy(Q))} color={C.blue} width={20} opacity={0.85} p={trace} />
        <Label p={[lad(Q, 0.5)[0] - 64, lad(Q, 0.5)[1] - 52]} text="?" color={C.blue} size={90} opacity={ease(f, at(scene, 3, 0.7), 10)} />
      </Stage>
      <Check x={PANEL} y={170} start={at(scene, 0, 0.3)}>梯子底端离箱子 9 英尺</Check>
      <Eq y={290} start={at(scene, 1, 0.7)} color={C.violet} tex={'9 + 12 = 21'} size={64} />
      <Text x={PANEL + 400} y={300} w={700} size={42} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.78))}>
        到墙的距离
      </Text>
      <Check x={PANEL} y={420} start={at(scene, 2, 0.2)}>梯子碰到箱子的角，</Check>
      <Text x={PANEL + 76} y={485} w={800} size={44} weight={800} color={C.red} style={fadeUp(f, at(scene, 2, 0.3))}>
        离地 12 英尺
      </Text>
      <Check x={PANEL} y={600} start={at(scene, 3, 0.15)}>要求整架梯子的长度</Check>
    </>
  );
};

const makePause = (seconds: number, prompt: React.ReactNode, c: Cfg, labels: [string, string, string]): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Fig c={c} />
        <Label p={px(c, c.a / 2, -2)} text={labels[0]} color={C.blue} />
        <Label p={px(c, c.a + c.d / 2, -2)} text={labels[1]} color={C.primary} />
        <Label p={px(c, c.a + 0.5, c.h / 2)} text={labels[2]} color={C.primary} anchor="start" />
      </Stage>
      <Text x={PANEL} y={150} w={1000} size={46} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1400} y={560} tick={TICK} label={PAUSE_LABEL} />
    </>
  );
};

const Slope: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = px(Q, Q.a, Q.h);
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  // line 2: a subtle arrow running up the ladder, offset to its upper left
  const off = (t: number): Pt => {
    const p = lad(Q, t);
    return [p[0] - 1.4 * Q.u * 0.8, p[1] - 1.4 * Q.u * 0.6];
  };
  const arrowOp = s(2, 0.1) * (1 - s(3, 0.1));
  // line 5: seven steps of (3 across, 4 up), appearing one at a time
  const nSteps = Math.min(7, Math.max(0, Math.floor(((f - at(scene, 4, 0.25)) / (scene.lines[4].frames * 0.6)) * 7) + 1));
  const stepsOn = f >= at(scene, 4, 0.25);
  const k = stepsOn ? nSteps : 0;
  const stairs = range(7).map((i) => {
    const a: Pt = px(Q, 3 * i, 4 * i);
    const b: Pt = px(Q, 3 * (i + 1), 4 * i);
    const e: Pt = px(Q, 3 * (i + 1), 4 * (i + 1));
    return { a, b, e, i };
  });
  const stairFade = 1 - s(6, 0.3);
  const tiny = s(3, 0.5);
  return (
    <>
      <Stage>
        <Fig c={Q} small={0.0} />
        <Poly pts={[px(Q, 0, 0), px(Q, Q.a, 0), P]} color={C.primary} width={0} fill={C.primary} fillOpacity={0.4} opacity={s(0, 0.2)} />
        <Label p={px(Q, Q.a / 2, -2)} text="水平 9" color={C.primary} opacity={s(1, 0.15)} />
        <Label p={px(Q, Q.a + 0.5, 6)} text="升高 12" color={C.primary} anchor="start" opacity={s(1, 0.5)} />
        {/* subtle arrow along the ladder */}
        {arrowOp > 0 && (
          <g opacity={arrowOp * 0.8}>
            <Seg a={off(0.3)} b={off(0.85)} color={C.blue} width={8} />
            <path d={`M ${off(0.85)[0] - 34} ${off(0.85)[1] + 4} L ${off(0.85)[0] + 2} ${off(0.85)[1] - 2} L ${off(0.85)[0] - 12} ${off(0.85)[1] + 36}`} stroke={C.blue} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {/* tiny 3 across, 4 up step ending at the corner */}
        {tiny > 0 && stairFade > 0 && k === 0 && (
          <g opacity={tiny}>
            <Seg a={px(Q, 6, 8)} b={px(Q, 9, 8)} color={C.violet} width={9} />
            <Seg a={px(Q, 9, 8)} b={px(Q, 9, 12)} color={C.violet} width={9} />
            <Label p={px(Q, 7.5, 6.6)} text="3" color={C.violet} />
            <Label p={px(Q, 9.9, 10)} text="4" color={C.violet} anchor="start" />
          </g>
        )}
        {/* seven steps */}
        <g opacity={stairFade}>
          {stairs.map(({ a, b, e, i }) => {
            const on = i < k;
            const col = i % 2 === 0 ? C.violet : C.amber;
            const pulse = Math.max(0, 1 - Math.abs(f - at(scene, 5, 0.12 + i * 0.1)) / 8);
            return on ? (
              <g key={i}>
                <Seg a={a} b={b} color={col} width={9} />
                <Seg a={b} b={e} color={col} width={9 + 9 * pulse} />
              </g>
            ) : null;
          })}
        </g>
        <HBrace x1={px(Q, 0, 0)[0]} x2={px(Q, wx(Q), 0)[0]} y={px(Q, 0, 0)[1] + 82} color={C.violet} label="21" opacity={s(4, 0.05) * stairFade} />
        <circle cx={px(Q, 21, 28)[0]} cy={px(Q, 21, 28)[1]} r={14} fill={C.ink} opacity={s(6, 0.2)} />
        <VBrace x={px(Q, 22.1, 0)[0]} y1={px(Q, 0, 0)[1]} y2={px(Q, 0, 28)[1]} color={C.blue} label="28" opacity={s(6, 0.2)} lx={70} />
      </Stage>
      <Eq y={150} start={at(scene, 3, 0.4)} tex={'\\dfrac{12}{9} = \\dfrac{4}{3}'} size={64} />
      <Text x={PANEL + 330} y={170} w={700} size={48} weight={800} color={C.violet} style={fadeUp(f, at(scene, 3, 0.7))}>
        每水平 3，升高 4
      </Text>
      <Eq y={355} start={at(scene, 4, 0.1)} tex={'21 = 7 \\times 3'} />
      {k > 0 && (
        <div style={{ position: 'absolute', left: PANEL + 400, top: 360, fontSize: 48, fontWeight: 900, color: C.violet, whiteSpace: 'nowrap', opacity: stairFade }}>
          {k} 步：每步水平 3，升高 4
        </div>
      )}
      <Eq y={475} start={at(scene, 5, 0.5)} tex={'7 \\times 4 = 28'} color={C.blue} size={64} />
      <Pill x={PANEL} y={640} color={C.blue} style={{ ...fadeUp(f, at(scene, 6, 0.4)), fontSize: 38 }}>梯子在 28 英尺高处碰到墙</Pill>
    </>
  );
};

const Pythag: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  const done = at(scene, 5, 0.8);
  return (
    <>
      <Stage>
        <Fig c={Q} big={s(0, 0.1)} dotW={1} />
        <HBrace x1={px(Q, 0, 0)[0]} x2={px(Q, wx(Q), 0)[0]} y={px(Q, 0, 0)[1] + 82} color={C.violet} label="21" opacity={s(0, 0.4)} />
        <VBrace x={px(Q, 22.1, 0)[0]} y1={px(Q, 0, 0)[1]} y2={px(Q, 0, 28)[1]} color={C.blue} label="28" opacity={s(0, 0.6)} lx={70} />
        <Label p={[lad(Q, 0.5)[0] - 58, lad(Q, 0.5)[1] - 48]} text="L" color={C.blue} size={64} opacity={s(1, 0.2)} />
      </Stage>
      <Eq y={140} start={at(scene, 1, 0.3)} tex={[z('直角边'), '{}^2 +', z('直角边'), '{}^2 =', z('斜边'), '{}^2']} size={48} color={C.muted} />
      <Eq y={230} start={at(scene, 1, 0.55)} tex={'L^2 = 21^2 + 28^2'} size={60} />
      <Eq y={350} start={at(scene, 2, 0.3)} tex={'21^2 = 441'} color={C.violet} />
      <Eq y={445} start={at(scene, 2, 0.75)} tex={'28^2 = 784'} color={C.blue} />
      <Eq y={550} start={at(scene, 3, 0.55)} tex={'441 + 784 = 1225'} />
      <Eq y={655} start={at(scene, 4, 0.35)} tex={'35 \\times 35 = 1225'} color={C.green} size={60} />
      <Answer x={1620} y={430} value="35" chime={CHIME} start={done} />
      <Pill x={1400} y={590} color={C.green} style={{ ...fadeUp(f, done + 6), fontSize: 44 }}>L = 35 → 选项 D</Pill>
    </>
  );
};

const Pieces: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  const P = px(Q, Q.a, Q.h);
  const W = px(Q, wx(Q), wy(Q));
  const F = px(Q, 0, 0);
  const split = s(0, 0.4, 16);
  const ang = (t: number): Pt => lad(Q, t);
  void ang;
  return (
    <>
      <Stage>
        <Fig c={Q} small={s(1, 0.1)} up={s(3, 0.1)} dotW={1} />
        {/* the two pieces */}
        <Seg a={F} b={P} color={C.primary} width={18} opacity={split} />
        <Seg a={P} b={W} color={C.amber} width={18} opacity={split} />
        {/* lower triangle legs */}
        <Label p={px(Q, Q.a / 2, -2)} text="9" color={C.primary} opacity={s(1, 0.4)} />
        <Label p={px(Q, Q.a + 0.5, 6)} text="12" color={C.primary} anchor="start" opacity={s(1, 0.5)} />
        <Label p={px(Q, 2.6, 8.2)} text="15" color={C.primary} opacity={s(2, 0.55)} />
        {/* upper triangle */}
        <Label p={px(Q, 15, 13.9)} text="12" color={C.amber} opacity={s(3, 0.5)} />
        <VBrace x={px(Q, 22.1, 0)[0]} y1={px(Q, 0, 12)[1]} y2={px(Q, 0, 28)[1]} color={C.amber} label="16" opacity={s(4, 0.6)} lx={70} />
        <Label p={px(Q, 12.5, 21.6)} text="20" color={C.amber} opacity={s(6, 0.1)} />
      </Stage>
      <Pill x={PANEL} y={140} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.6)), fontSize: 40 }}>
        <Tex tex={'3\\text{-}4\\text{-}5 \\times 3'} size={48} color="#fff" />
      </Pill>
      <Eq y={235} start={at(scene, 1, 0.8)} tex={'3^2 + 4^2 = 9 + 16 = 25 = 5^2'} color={C.primary} size={48} />
      <Eq y={325} start={at(scene, 2, 0.4)} tex={'9,\\ 12,\\ 15 = 3 \\times (3,\\ 4,\\ 5)'} color={C.primary} />
      <Eq y={430} start={at(scene, 4, 0.4)} tex={'12 = 4 \\times 3 \\ \\to\\ 4 \\times 4 = 16'} color={C.amber} />
      <Eq y={535} start={at(scene, 5, 0.4)} tex={'12,\\ 16,\\ 20 = 4 \\times (3,\\ 4,\\ 5)'} color={C.amber} />
      <Eq y={650} start={at(scene, 6, 0.5)} tex={'15 + 20 = 35'} color={C.green} size={64} />
      <Check x={PANEL + 520} y={655} start={at(scene, 6, 0.8)}>对上了！</Check>
      <Pill x={PANEL} y={760} color={C.violet} style={{ ...fadeUp(f, at(scene, 7, 0.45)), fontSize: 40 }}>两段都是好三角形 → 数字小</Pill>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  const F = px(Q, 0, 0);
  const P = px(Q, Q.a, Q.h);
  const W = px(Q, wx(Q), wy(Q));
  const R = px(Q, wx(Q), 0);
  // which wrong choice is active
  const marks = [0, 1, 2, 4];
  const lines = [1, 2, 3, 4];
  const act = (j: number) => s(lines[j], 0, 10) * (j < 3 ? 1 - s(lines[j] + 1, 0, 10) : 1 - s(5, 0, 10));
  return (
    <>
      <Stage>
        <Fig c={Q} wallLabel={0} dim={1 - 0.6 * Math.max(act(0), act(1), act(2), s(5, 0, 10))} />
        <Seg a={F} b={P} color={C.red} width={20} opacity={act(0)} />
        <Label p={px(Q, 2.6, 8.2)} text="15" color={C.red} opacity={act(0)} />
        <Seg a={P} b={W} color={C.red} width={20} opacity={act(1)} />
        <Label p={px(Q, 12.5, 21.6)} text="20" color={C.red} opacity={act(1)} />
        <Seg a={R} b={W} color={C.red} width={20} opacity={act(2)} />
        <Seg a={F} b={px(Q, Q.a, 0)} color={C.red} width={20} opacity={act(3)} />
        <Label p={px(Q, Q.a / 2, -2)} text="9" color={C.red} opacity={act(3)} />
        <Seg a={R} b={W} color={C.red} width={20} opacity={act(3)} />
        <Label p={px(Q, 22.7, 14)} text="28" color={C.red} anchor="start" opacity={act(3)} />
        <Label p={px(Q, 22.7, 14)} text="28" color={C.red} anchor="start" opacity={act(2)} />
        {/* across + up path vs the straight ladder */}
        <g opacity={s(5, 0.1)}>
          <Seg a={F} b={R} color={C.red} width={11} dashed />
          <Seg a={R} b={W} color={C.red} width={11} dashed />
          <Label p={px(Q, 10.5, -2)} text="水平" color={C.red} size={48} />
          <Label p={px(Q, 22.7, 14)} text="竖直" color={C.red} size={48} anchor="start" />
        </g>
        <Seg a={F} b={W} color={WOOD} width={13} opacity={s(6, 0.1)} />
        <circle cx={W[0]} cy={W[1]} r={14} fill={C.ink} />
      </Stage>
      <div style={{ position: 'absolute', left: PANEL, top: 130, display: 'flex', gap: 22 }}>
        {CHOICES.map((ch, i) => {
          const j = marks.indexOf(i);
          const bad = j >= 0 ? s(lines[j], 0.3, 10) : 0;
          return (
            <div key={ch} style={{ ...fadeUp(f, 4 + i * 3, 10), position: 'relative', background: bad > 0.5 ? C.red : C.card, color: bad > 0.5 ? '#fff' : C.ink, borderRadius: 18, padding: '10px 24px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <span style={{ color: bad > 0.5 ? '#fff' : C.muted, fontSize: 40, marginRight: 10 }}>{'ABCDE'[i]}</span>
              {ch}
            </div>
          );
        })}
      </div>
      <TrapCard y={300} start={at(scene, 1, 0.1)} end={at(scene, 2)} title="A · 15" body="只算了下面一段，到箱子的角就停了。" />
      <TrapCard y={300} start={at(scene, 2, 0.1)} end={at(scene, 3)} title="B · 20" body="只量了上面一段得到的结果。" />
      <TrapCard y={300} start={at(scene, 3, 0.1)} end={at(scene, 4)} title="C · 28" body="这是梯子够到的高度。高度不是长度。" tex={[z('高度'), '\\ne', z('长度')]} />
      <TrapCard y={300} start={at(scene, 4, 0.1)} end={at(scene, 5)} title="E · 37" body="把水平的 9 和竖直的 28 直接相加。" tex={'9 + 28 = 37'} />
      <TrapCard y={300} start={at(scene, 5, 0.1)} end={at(scene, 6)} title="水平 + 竖直 ≠ 梯子" body="梯子斜着抄近路，要用勾股定理。" />
      <TrapCard y={300} start={at(scene, 6, 0.1)} end={scene.frames + 100} title="好习惯" body="再读一遍题目：梯子一直搭到墙上。" good />
    </>
  );
};

const TrapCard: React.FC<{ y: number; start: number; end: number; title: string; body: string; tex?: string | Part[]; good?: boolean }> = ({ y, start, end, title, body, tex, good }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 10) * (1 - ease(f, end - 8, 8));
  if (o <= 0) return null;
  const col = good ? C.primary : C.red;
  return (
    <div style={{ position: 'absolute', left: PANEL, top: y, width: 1000, background: C.card, borderLeft: `14px solid ${col}`, borderRadius: 24, padding: '24px 36px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
      <div style={{ fontSize: 56, fontWeight: 900, color: col }}>{title}</div>
      <div style={{ fontSize: 46, fontWeight: 700, marginTop: 10, lineHeight: 1.3 }}>{body}</div>
      {tex && (
        <div style={{ marginTop: 14 }}>
          <Z p={tex} size={58} color={col} />
        </div>
      )}
    </div>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  return (
    <>
      <div style={{ position: 'absolute', left: PANEL, top: 150, width: 1010, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
        一个<Mark on={at(scene, 1, 0.3)}>高 8 英尺</Mark>、<Mark on={at(scene, 1, 0.6)}>深 9 英尺</Mark>的箱子紧靠着墙。梯子底端<Mark on={at(scene, 2, 0.15)}>离箱子 6 英尺</Mark>。梯子碰到箱子顶部外侧的边，并搭到墙上。<Mark on={at(scene, 3, 0.2)}>梯子有多长？</Mark>
      </div>
      <Stage>
        <Fig c={V} draw={ease(f, 4, 30)} ladder={ease(f, at(scene, 2, 0.5), 40)} />
        <Label p={px(V, V.a + 4.5, -1.8)} text="9" color={C.primary} opacity={s(1, 0.55)} />
        <Label p={px(V, V.a + 0.5, 4)} text="8" color={C.primary} anchor="start" opacity={s(1, 0.35)} />
        <Label p={px(V, V.a / 2, -1.8)} text="6" color={C.blue} opacity={s(2, 0.3)} />
        <Label p={[lad(V, 0.55)[0] - 62, lad(V, 0.55)[1] - 50]} text="?" color={C.blue} size={90} opacity={s(3, 0.4)} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  const done = at(scene, 4, 0.8);
  const P = px(V, V.a, V.h);
  const W = px(V, wx(V), wy(V));
  const y0 = px(V, 0, 0)[1];
  return (
    <>
      <Stage>
        <Fig c={V} small={s(0, 0.2)} big={s(3, 0.1)} dotW={s(2, 0.5)} wallLabel={0} />
        <Label p={px(V, V.a / 2, -1.8)} text="6" color={C.primary} opacity={s(0, 0.2) * (1 - s(5, 0, 8))} />
        <Label p={px(V, V.a + 0.5, 4)} text="8" color={C.primary} anchor="start" opacity={s(0, 0.25) * (1 - s(5, 0, 8))} />
        <HBrace x1={px(V, 0, 0)[0]} x2={px(V, wx(V), 0)[0]} y={y0 + 82} color={C.violet} label="15" opacity={s(1, 0.4) * (1 - s(5, 0, 8))} />
        <VBrace x={px(V, 16.1, 0)[0]} y1={y0} y2={px(V, 0, 20)[1]} color={C.blue} label="20" opacity={s(2, 0.5)} lx={62} />
        <Seg a={px(V, 0, 0)} b={P} color={C.primary} width={18} opacity={s(5, 0.1)} />
        <Seg a={P} b={W} color={C.amber} width={18} opacity={s(5, 0.1)} />
        <Label p={px(V, 1.4, 5.6)} text="10" color={C.primary} opacity={s(5, 0.35)} />
        <Label p={px(V, 8.4, 15.4)} text="15" color={C.amber} opacity={s(5, 0.55)} />
      </Stage>
      <Eq y={150} start={at(scene, 0, 0.45)} tex={'\\dfrac{8}{6} = \\dfrac{4}{3}'} size={62} />
      <Eq y={340} start={at(scene, 1, 0.3)} tex={'6 + 9 = 15 = 5 \\times 3'} />
      <Eq y={440} start={at(scene, 2, 0.35)} tex={'5 \\times 4 = 20'} color={C.blue} />
      <Eq y={540} start={at(scene, 3, 0.55)} tex={'15^2 + 20^2 = 225 + 400 = 625'} />
      <Eq y={640} start={at(scene, 4, 0.35)} tex={'25 \\times 25 = 625'} color={C.green} size={58} />
      <Answer x={1700} y={300} value="25" chime={CHIME} start={done} />
      <Pill x={1560} y={435} color={C.green} style={{ ...fadeUp(f, done + 6), fontSize: 44 }}>L = 25</Pill>
      <Eq y={745} start={at(scene, 5, 0.68)} tex={'10 + 15 = 25'} color={C.green} size={62} />
      <Confetti x={1400} y={330} start={at(scene, 6, 0.2)} seed={7} />
      <Pill x={PANEL + 560} y={760} color={C.primary} style={{ ...fadeUp(f, at(scene, 6, 0.2)), fontSize: 40 }}>太棒了！</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);
  const cardOut = fadeTo(f, at(scene, 3));
  const u = 22;
  const stepPts = range(5).map((i): [Pt, Pt, Pt] => [
    [200 + 3 * i * u, 700 - 4 * i * u],
    [200 + 3 * (i + 1) * u, 700 - 4 * i * u],
    [200 + 3 * (i + 1) * u, 700 - 4 * (i + 1) * u],
  ]);
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, height: 640, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 44, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 800, top: 120, width: 820, fontSize: 52, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          一条直线，每<span style={{ color: C.violet }}>水平</span>走一步，<span style={{ color: C.violet }}>升高</span>的都一样多。
        </div>
        <div style={{ position: 'absolute', left: 800, top: 340, width: 820, fontSize: 48, fontWeight: 800, color: C.primary, ...fadeUp(f, at(scene, 2, 0.25)) }}>
          1. 小三角形 → 高度
        </div>
        <div style={{ position: 'absolute', left: 800, top: 430, width: 820, fontSize: 48, fontWeight: 800, color: C.violet, ...fadeUp(f, at(scene, 2, 0.6)) }}>
          2. 勾股定理 → 长度
        </div>
      </div>
      <Stage>
        <g opacity={cardOut}>
          <Seg a={[200, 700]} b={[200 + 15 * u, 700 - 20 * u]} color={WOOD} width={11} opacity={ease(f, at(scene, 0, 0.5), 14)} />
          {stepPts.map(([a, b, e], i) => {
            const on = ease(f, at(scene, 0, 0.6) + i * 8, 8);
            return (
              <g key={i}>
                <Seg a={a} b={b} color={i % 2 === 0 ? C.violet : C.amber} width={8} opacity={on} />
                <Seg a={b} b={e} color={i % 2 === 0 ? C.violet : C.amber} width={8} opacity={on} />
              </g>
            );
          })}
          <Label p={[200 + 1.5 * u, 700 + 36]} text="水平" color={C.violet} size={40} opacity={s(1, 0.5)} />
          <Label p={[200 + 3 * u + 54, 700 - 2 * u]} text="升高" color={C.violet} size={40} opacity={s(1, 0.5)} />
        </g>
      </Stage>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, '梯子有多长？单位是英尺。', Q, ['9', '12', '12']),
  slope: Slope,
  pythag: Pythag,
  pieces: Pieces,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, <>箱子高 8 英尺、深 9 英尺，梯子底端<br />离箱子 6 英尺。梯子有多长？</>, V, ['6', '9', '8']),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第5级" font={ZH_FONT} /> : null;

import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-point-in-rectangle';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry (maths coordinates, y grows UPWARD) ----------
// Same picture as the bank figure: A bottom-left, B bottom-right, C top-right, D top-left.
// The drawing is a 10 x 8 rectangle with P = (4.5, 3), which gives exactly 15, 22, 25 and 18
// (verify.py, section 2). The size is never labelled, because the question doesn't give it.
// The variant is drawn 9 x 8 with P = (4, 2): 9, 20, 27, 16 (verify.py, section 6).

type Side = 'bottom' | 'right' | 'top' | 'left';
const SIDES: Side[] = ['bottom', 'right', 'top', 'left'];

export const plane = (ox: number, oy: number, unit: number) => (p: Pt): Pt => [ox + p[0] * unit, oy - p[1] * unit];

const triOf = (w: number, h: number, p: Pt): Record<Side, Pt[]> => ({
  bottom: [p, [0, 0], [w, 0]],
  right: [p, [w, 0], [w, h]],
  top: [p, [w, h], [0, h]],
  left: [p, [0, h], [0, 0]],
});

/** Where each triangle's area label goes. Top and bottom labels sit right of P (clear of the height arrows),
 * halfway between the side and the slanted edge above / below it. */
const labelSpot = (w: number, h: number, p: Pt, s: Side): Pt => {
  const k = 0.45;
  const x = p[0] + 0.35 * (w - p[0]);
  const t = (x - p[0]) / (w - p[0]);
  if (s === 'bottom') return [x, (p[1] * (1 - t)) / 2];
  if (s === 'top') return [x, (p[1] + (h - p[1]) * t + h) / 2];
  if (s === 'left') return [p[0] * k, (p[1] + h / 2) / 2];
  return [w - (w - p[0]) * k, (p[1] + h / 2) / 2];
};

// Pairs: bottom + top = violet, left + right = blue. The missing triangle is amber until it is found.
export const PAIR: Record<Side, string> = { bottom: C.violet, top: C.violet, left: C.blue, right: C.blue };

export const MAIN = { w: 10, h: 8, p: [4.5, 3] as Pt };
const VAR = { w: 9, h: 8, p: [4, 2] as Pt };
const M = plane(150, 790, 62); // the working figure: 620 x 496 px, top edge at y = 294
const PANEL = 900;

// ---------- drawing helpers ----------

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

type FigProps = {
  m: (p: Pt) => Pt;
  w: number;
  h: number;
  p: Pt;
  progress?: number;
  /** Fill opacity per triangle (0 = no fill). */
  fills?: Partial<Record<Side, number>>;
  /** Fill colour per triangle (defaults to the pair colours). */
  colors?: Partial<Record<Side, string>>;
  /** Area label text per triangle. */
  labels?: Partial<Record<Side, string>>;
  labelColors?: Partial<Record<Side, string>>;
  labelOpacity?: Partial<Record<Side, number>> | number;
  letters?: number;
  size?: number;
  dim?: number;
};

/** Rectangle ABCD with P joined to all four corners. */
export const Figure: React.FC<FigProps> = ({ m, w, h, p, progress = 1, fills = {}, colors = {}, labels = {}, labelColors = {}, labelOpacity = 1, letters = 1, size = 56, dim = 1 }) => {
  const t = triOf(w, h, p);
  const corners: Pt[] = [[0, 0], [w, 0], [w, h], [0, h]];
  const P = m(p);
  const seg = Math.max(0, Math.min(1, progress * 1.5 - 0.5));
  const off: Pt[] = [[-30, 32], [30, 32], [30, -32], [-30, -32]];
  return (
    <g opacity={dim}>
      <Poly pts={corners.map(m)} color={C.ink} width={6} fill={C.card} fillOpacity={1} progress={Math.min(1, progress * 1.5)} />
      {SIDES.map((s) => (fills[s] ?? 0) > 0 && <path key={s} d={`M ${t[s].map(m).map((q) => q.join(' ')).join(' L ')} Z`} fill={colors[s] ?? PAIR[s]} opacity={fills[s]} />)}
      {corners.map((c, i) => {
        const q = m(c);
        return <line key={i} x1={P[0]} y1={P[1]} x2={P[0] + (q[0] - P[0]) * seg} y2={P[1] + (q[1] - P[1]) * seg} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
      })}
      {seg > 0 && <circle cx={P[0]} cy={P[1]} r={11} fill={C.ink} />}
      {corners.map((c, i) => (
        <Label key={i} p={[m(c)[0] + off[i][0], m(c)[1] + off[i][1]]} text={'ABCD'[i]} size={48} color={C.muted} opacity={letters * seg} />
      ))}
      <Label p={[P[0] - 42, P[1] - 20]} text="P" size={48} opacity={letters * seg} />
      {SIDES.map((s) => {
        const txt = labels[s];
        if (!txt) return null;
        const o = typeof labelOpacity === 'number' ? labelOpacity : labelOpacity[s] ?? 1;
        return <Label key={s} p={m(labelSpot(w, h, p, s))} text={txt} size={size} color={labelColors[s] ?? C.ink} opacity={o * seg} />;
      })}
    </g>
  );
};

/** Dimension line from a to b (pixels) with arrow heads at both ends and a maths label. */
export const Dim: React.FC<{ a: Pt; b: Pt; color: string; opacity: number; label: string; lx?: number; ly?: number; size?: number }> = ({ a, b, color, opacity, label, lx = 0, ly = 0, size = 52 }) => {
  if (opacity <= 0) return null;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (q: Pt, d: number) => {
    const h = (s: number) => [q[0] - d * 16 * Math.cos(ang + s), q[1] - d * 16 * Math.sin(ang + s)].join(' ');
    return `M ${h(0.55)} L ${q[0]} ${q[1]} L ${h(-0.55)}`;
  };
  return (
    <g opacity={opacity}>
      <g stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        <path d={head(b, 1)} />
        <path d={head(a, -1)} />
      </g>
      <Label p={[(a[0] + b[0]) / 2 + lx, (a[1] + b[1]) / 2 + ly]} text={label} color={color} size={size} />
    </g>
  );
};

/** A maths line on the right panel. */
const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; opacity?: number }> = ({ x, y, w, h, start, opacity = 1 }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) * opacity }} />;
};

export const ABOUT = { bottom: '15', right: '22', top: '25', left: '?' };
export const ABOUT_COLORS = { left: C.amber };

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(1060, 790, 56);
  const ring = ease(f, at(scene, 1, 0.3), 12) * fadeTo(f, at(scene, 2, 0.2));
  const P = m(MAIN.p);
  return (
    <>
      <Text x={960} y={120} w={1700} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        One point, four triangles
      </Text>
      <Stage>
        <Figure m={m} {...MAIN} progress={ease(f, 6, 30)} letters={0} labels={ABOUT} labelColors={ABOUT_COLORS} labelOpacity={ease(f, at(scene, 0, 0.55), 12)} fills={{ left: 0.18 * ease(f, at(scene, 0, 0.7), 12) }} colors={{ left: C.amber }} />
        <circle cx={P[0]} cy={P[1]} r={30 + 6 * Math.sin(f / 5)} fill="none" stroke={C.violet} strokeWidth={6} opacity={ring} />
      </Stage>
      <Text x={1650} y={420} w={260} size={52} weight={900} color={C.violet} style={fadeUp(f, at(scene, 1, 0.3))}>
        Where is P?
      </Text>
      <div style={{ position: 'absolute', left: 240, top: 470, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 84, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['12', '15', '18', '22', '28'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(1230, 760, 56);
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 160, width: 990, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        Point <i>P</i> is <Mark on={at(scene, 0, 0.55)}>inside rectangle ABCD</Mark>. The areas of triangles <Mark on={at(scene, 1, 0.1)}>PAB, PBC and PCD</Mark> are{' '}
        <Mark on={at(scene, 1, 0.7)}>15, 22 and 25</Mark>. What is the <Mark on={at(scene, 2, 0.2)}>area of triangle PDA</Mark>?
      </div>
      <Choices x={90} y={640} items={CHOICES.map((c) => <Tex key={c} tex={c} size={54} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
      <Stage>
        <Figure
          m={m}
          {...MAIN}
          progress={ease(f, 8, 30)}
          labels={ABOUT}
          labelColors={{ left: C.amber }}
          labelOpacity={{ bottom: ease(f, at(scene, 1, 0.65), 10), right: ease(f, at(scene, 1, 0.75), 10), top: ease(f, at(scene, 1, 0.85), 10), left: ease(f, at(scene, 2, 0.5), 10) }}
          fills={{ bottom: 0.25 * ease(f, at(scene, 1, 0.2), 10), right: 0.25 * ease(f, at(scene, 1, 0.3), 10), top: 0.25 * ease(f, at(scene, 1, 0.4), 10), left: 0.25 * ease(f, at(scene, 2, 0.5), 10) }}
          colors={{ bottom: C.violet, right: C.blue, top: C.violet, left: C.amber }}
        />
      </Stage>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fill = (i: number) => 0.3 * ease(f, i, 12);
  const sideOn = at(scene, 1, 0.2);
  const left = at(scene, 3, 0.1);
  const NAMES: Record<Side, string> = { bottom: 'PAB', right: 'PBC', top: 'PCD', left: 'PDA' };
  const rows: [Side, string, number][] = [
    ['bottom', '15', at(scene, 2, 0.05)],
    ['right', '22', at(scene, 2, 0.4)],
    ['top', '25', at(scene, 2, 0.7)],
    ['left', '?', left],
  ];
  const sideLines: Record<Side, [Pt, Pt]> = { bottom: [[0, 0], [10, 0]], right: [[10, 0], [10, 8]], top: [[10, 8], [0, 8]], left: [[0, 8], [0, 0]] };
  return (
    <>
      <Stage>
        <Figure
          m={M}
          {...MAIN}
          fills={{ bottom: fill(rows[0][2]), right: fill(rows[1][2]), top: fill(rows[2][2]), left: fill(left) }}
          colors={{ bottom: C.violet, right: C.blue, top: C.violet, left: C.amber }}
          labels={ABOUT}
          labelColors={ABOUT_COLORS}
          labelOpacity={{ bottom: ease(f, rows[0][2], 10), right: ease(f, rows[1][2], 10), top: ease(f, rows[2][2], 10), left: ease(f, left, 10) }}
        />
        {SIDES.map((s, i) => (
          <line key={s} x1={M(sideLines[s][0])[0]} y1={M(sideLines[s][0])[1]} x2={M(sideLines[s][1])[0]} y2={M(sideLines[s][1])[1]} stroke={s === 'left' ? C.amber : PAIR[s]} strokeWidth={12} strokeLinecap="round" opacity={ease(f, sideOn + i * 8, 10) * fadeTo(f, at(scene, 2), 0)} />
        ))}
      </Stage>
      <Check x={PANEL} y={190} start={at(scene, 0, 0.5)}>P joins all 4 corners: 4 triangles</Check>
      <Check x={PANEL} y={280} start={at(scene, 1, 0.1)}>Each one sits on a side</Check>
      {rows.map(([s, v, start], i) => (
        <div key={s} style={{ position: 'absolute', left: PANEL + 20, top: 380 + i * 82, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, start) }}>
          <div style={{ width: 150, fontSize: 44, fontWeight: 800, color: s === 'left' ? C.amber : PAIR[s] }}>{s}</div>
          <div style={{ width: 130, fontSize: 40, fontWeight: 700, color: C.muted }}>({NAMES[s]})</div>
          <Tex tex={v === '?' ? '\\text{?}' : v} size={56} color={s === 'left' ? C.amber : C.ink} />
          {s === 'left' && <Pill x={300} y={-6} color={C.amber} style={{ position: 'relative', left: 0, top: 0, fontSize: 36 }}>find this!</Pill>}
        </div>
      ))}
      <Text x={PANEL} y={730} w={960} size={40} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.1))}>
        Unknown: the rectangle's size, and where P is
      </Text>
    </>
  );
};

const makePause = (fig: typeof MAIN, labels: Partial<Record<Side, string>>, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(150, 790, 56);
  return (
    <>
      <Stage>
        <Figure m={m} {...fig} labels={labels} labelColors={{ [Object.keys(labels).find((k) => labels[k as Side] === '?') as Side]: C.amber }} />
      </Stage>
      <Text x={150} y={170} w={760} size={44} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1380} y={480} tick={TICK} />
    </>
  );
};

/** Bottom + top highlighted, with the width and the two heights. Shared by the two Solution 1 scenes. */
const PairFigure: React.FC<{ p: Pt; widthOn: number; h1On: number; h2On: number; hOn: number; labels: Partial<Record<Side, string>>; labelOpacity?: number }> = ({ p, widthOn, h1On, h2On, hOn, labels, labelOpacity = 1 }) => {
  const { w, h } = MAIN;
  const P = M(p);
  return (
    <Stage>
      <Figure m={M} w={w} h={h} p={p} fills={{ bottom: 0.3, top: 0.3 }} labels={labels} labelOpacity={labelOpacity} labelColors={{ bottom: C.violet, top: C.violet, left: C.amber }} letters={0.6} />
      <Dim a={[M([0, 0])[0], M([0, 0])[1] + 44]} b={[M([w, 0])[0], M([0, 0])[1] + 44]} color={C.violet} opacity={widthOn} label="w" ly={0} />
      <Dim a={[M([0, h])[0], M([0, h])[1] - 44]} b={[M([w, h])[0], M([0, h])[1] - 44]} color={C.violet} opacity={widthOn} label="w" ly={0} />
      <Dim a={P} b={M([p[0], 0])} color={C.amber} opacity={h1On} label="h₁" lx={-44} />
      <Dim a={P} b={M([p[0], h])} color={C.primary} opacity={h2On} label="h₂" lx={-44} />
      <Dim a={[M([w, 0])[0] + 50, M([w, 0])[1]]} b={[M([w, h])[0] + 50, M([w, h])[1]]} color={C.ink} opacity={hOn} label="h" lx={36} />
    </Stage>
  );
};

const Sol1Pair: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <PairFigure p={MAIN.p} widthOn={ease(f, at(scene, 2, 0.4), 12)} h1On={ease(f, at(scene, 3, 0.3), 12)} h2On={ease(f, at(scene, 4, 0.3), 12)} hOn={ease(f, at(scene, 5, 0.5), 12)} labels={{ bottom: '15', top: '25' }} />
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>Base times height</Pill>
      <Eq y={270} start={at(scene, 0, 0.5)} tex="\text{area} = \dfrac{1}{2} \times \text{base} \times \text{height}" />
      <Eq y={400} start={at(scene, 3, 0.4)} color={C.violet} tex="\text{bottom} = \dfrac{1}{2} \times w \times {\color{#f59f0a}h_1}" />
      <Eq y={520} start={at(scene, 4, 0.4)} color={C.violet} tex="\text{top} = \dfrac{1}{2} \times w \times {\color{#0cc281}h_2}" />
      <Eq y={650} start={at(scene, 5, 0.6)} size={58} tex="{\color{#f59f0a}h_1} + {\color{#0cc281}h_2} = h" />
    </>
  );
};

// P slides straight up and down: same formulas as verify.py section 5 (bottom = 5y, top = 40 − 5y).
// P stops at y = 6 (30 + 10), y = 2 (10 + 30), then back home (15 + 25). The numbers only show while P is
// stopped, so no in-between value (like 18 or 22, which would spoil the answer) is ever on screen.
const STOPS = [3, 6, 2, 3];
const MOVE = 14;
export const slide = (f: number, a: number, b: number) => {
  const starts = [0.04, 0.36, 0.72].map((t) => a + (b - a) * t);
  let y = STOPS[0];
  let vis = 1;
  starts.forEach((s, i) => {
    const t = interpolate(f, [s, s + MOVE], [0, 1], { ...clamp, easing: (u) => u * u * (3 - 2 * u) });
    if (f >= s) y = STOPS[i] + (STOPS[i + 1] - STOPS[i]) * t;
    vis = Math.min(vis, interpolate(f, [s - 5, s, s + MOVE, s + MOVE + 5], [1, 0, 0, 1], clamp));
  });
  return { y, vis };
};

const Sol1Half: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { y, vis } = slide(f, at(scene, 2, 0.35), at(scene, 3, 0.95));
  const bottom = Math.round(5 * y);
  const top = 40 - bottom;
  const live = ease(f, at(scene, 2, 0.1), 12);
  return (
    <>
      <PairFigure p={[MAIN.p[0], y]} widthOn={1} h1On={1} h2On={1} hOn={1} labels={{ bottom: String(bottom), top: String(top) }} labelOpacity={vis} />
      <Eq y={140} start={at(scene, 0, 0.1)} size={50} color={C.violet} tex="\text{bottom} + \text{top} = \dfrac{1}{2} w h_1 + \dfrac{1}{2} w h_2" />
      <Eq y={275} start={at(scene, 0, 0.55)} size={50} tex="= \dfrac{1}{2} \times w \times (h_1 + h_2) = \dfrac{1}{2} \times w \times h" />
      <Eq y={420} start={at(scene, 1, 0.1)} size={50} tex="w \times h = \text{the whole rectangle}" />
      <Eq y={530} start={at(scene, 1, 0.5)} size={62} color={C.green} tex="\text{bottom} + \text{top} = \text{half!}" />
      <Boxed x={PANEL - 24} y={516} w={760} h={104} start={at(scene, 1, 0.6)} />
      <div style={{ position: 'absolute', left: PANEL, top: 690, opacity: live * vis, whiteSpace: 'nowrap' }}>
        <Tex tex={`{\\color{#7b61ff}${bottom}} + {\\color{#7b61ff}${top}} = 40`} size={64} />
      </div>
      <Pill x={PANEL + 480} y={706} color={C.green} style={{ ...fadeUp(f, at(scene, 3, 0.2)), fontSize: 36 }}>never changes</Pill>
    </>
  );
};

const Sol1Solve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { w, h, p } = MAIN;
  const P = M(p);
  const side = ease(f, at(scene, 0, 0.3), 14);
  const pair1 = ease(f, at(scene, 3, 0.1), 12);
  const found = at(scene, 5, 0.6);
  const done = at(scene, 5, 0.97);
  return (
    <>
      <Stage>
        <Figure
          m={M}
          {...MAIN}
          fills={{ left: 0.3 * side, right: 0.3 * side, bottom: 0.3 * pair1, top: 0.3 * pair1 }}
          colors={{ left: f >= found ? C.green : C.blue }}
          labels={{ bottom: '15', top: '25', right: '22', left: f >= found ? '18' : '?' }}
          labelColors={{ bottom: C.violet, top: C.violet, right: C.blue, left: f >= found ? C.green : C.amber }}
          letters={0.6}
        />
        <Dim a={[M([0, 0])[0] - 46, M([0, 0])[1]]} b={[M([0, h])[0] - 46, M([0, h])[1]]} color={C.blue} opacity={ease(f, at(scene, 1, 0.2), 12) * fadeTo(f, at(scene, 3), 0)} label="h" lx={-34} />
        <Dim a={P} b={M([0, p[1]])} color={C.amber} opacity={ease(f, at(scene, 1, 0.55), 12) * fadeTo(f, at(scene, 3), 0)} label="w₁" ly={36} />
        <Dim a={P} b={M([w, p[1]])} color={C.primary} opacity={ease(f, at(scene, 1, 0.55), 12) * fadeTo(f, at(scene, 3), 0)} label="w₂" ly={36} />
      </Stage>
      <Eq y={170} start={at(scene, 1, 0.3)} size={50} color={C.blue} tex="\text{left} + \text{right} = \dfrac{1}{2} \times h \times (w_1 + w_2)" />
      <Eq y={290} start={at(scene, 2, 0.2)} size={50} color={C.blue} tex="= \dfrac{1}{2} \times h \times w = \text{the other half}" />
      <Eq y={420} start={at(scene, 3, 0.3)} size={58} color={C.violet} tex="15 + 25 = 40 = \text{half}" />
      <Eq y={530} start={at(scene, 4, 0.2)} size={58} color={C.blue} tex="22 + {\color{#f59f0a}?} = 40" />
      <Eq y={640} start={found} size={66} color={C.green} tex="? = 40 - 22 = 18" />
      <Answer x={1720} y={600} value="C" chime={CHIME} start={done} />
      <Confetti x={1720} y={600} start={done} seed={5} />
    </>
  );
};

/** A third way to check: the whole rectangle is 2 × 40 = 80, minus the three known triangles. */
const Check2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const all = ease(f, at(scene, 0, 0.5), 14);
  return (
    <>
      <Stage>
        <Figure
          m={M}
          {...MAIN}
          fills={{ bottom: 0.3, top: 0.3, right: 0.3 * all, left: 0.3 * all }}
          colors={{ left: C.green }}
          labels={{ bottom: '15', top: '25', right: '22', left: '18' }}
          labelColors={{ bottom: C.violet, top: C.violet, right: C.blue, left: C.green }}
          letters={0.6}
        />
      </Stage>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>Double-check</Pill>
      <Eq y={290} start={at(scene, 0, 0.3)} size={58} color={C.violet} tex="\text{bottom} + \text{top} = 40" />
      <Eq y={400} start={at(scene, 0, 0.7)} size={58} tex="\text{rectangle} = 2 \times 40 = 80" />
      <Eq y={530} start={at(scene, 1, 0.2)} size={58} tex="80 - 15 - 22 - 25 = 18" />
      <Eq y={640} start={at(scene, 1, 0.7)} size={58} color={C.green} tex="\text{It matches!} \; \checkmark" />
    </>
  );
};

/** Solution 2: lines through P cut the rectangle into four small rectangles, each halved by its diagonal. */
const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { w, h, p } = MAIN;
  const m = plane(150, 790, 62);
  const [px, py] = p;
  const cross = ease(f, at(scene, 1, 0.2), 18);
  const smalls = ease(f, at(scene, 2, 0.2), 12);
  const tb = ease(f, at(scene, 4, 0.2), 14); // halves on the top / bottom sides
  const lr = ease(f, at(scene, 5, 0.2), 14); // halves on the left / right sides
  // Halves that touch a horizontal side (inside the bottom or top triangle) and a vertical side (left or right triangle).
  const tbHalves: Pt[][] = [
    [[0, 0], [px, 0], p], [[px, 0], [w, 0], p],
    [[0, h], [px, h], p], [[px, h], [w, h], p],
  ];
  const lrHalves: Pt[][] = [
    [[0, 0], [0, py], p], [[0, py], [0, h], p],
    [[w, 0], [w, py], p], [[w, py], [w, h], p],
  ];
  // The flips: in each small rectangle in turn, the violet half turns 180° about that rectangle's centre and
  // lands exactly on the blue half (shrinking a little mid-turn so it stays clear of the captions).
  const FLIPS: { tb: number; lr: number; c: Pt }[] = [
    { tb: 0, lr: 0, c: [px / 2, py / 2] },
    { tb: 1, lr: 2, c: [(px + w) / 2, py / 2] },
    { tb: 3, lr: 3, c: [(px + w) / 2, (py + h) / 2] },
    { tb: 2, lr: 1, c: [px / 2, (py + h) / 2] },
  ];
  const l3 = at(scene, 3, 0.15);
  const l3e = at(scene, 3, 0.98);
  const slot = (l3e - l3) / 4;
  const d = (pts: Pt[]) => `M ${pts.map((q) => m(q).join(' ')).join(' L ')} Z`;
  return (
    <>
      <Stage>
        <Figure m={m} {...MAIN} letters={0.6} />
        {tbHalves.map((t, i) => <path key={`t${i}`} d={d(t)} fill={C.violet} opacity={0.32 * tb} />)}
        {lrHalves.map((t, i) => <path key={`l${i}`} d={d(t)} fill={C.blue} opacity={0.32 * lr} />)}
        {FLIPS.map((fl, i) => {
          const s0 = l3 + i * slot;
          const on = ease(f, s0, 6) * fadeTo(f, s0 + slot - 4, 0, 8);
          if (on <= 0) return null;
          const t = interpolate(f, [s0 + 4, s0 + slot * 0.75], [0, 1], { ...clamp, easing: (u) => u * u * (3 - 2 * u) });
          const c = m(fl.c);
          return (
            <g key={i} opacity={on}>
              <path d={d(lrHalves[fl.lr])} fill="none" stroke={C.blue} strokeWidth={5} strokeDasharray="12 9" />
              <path d={d(tbHalves[fl.tb])} fill={C.violet} fillOpacity={0.45} stroke={C.violet} strokeWidth={5} transform={`rotate(${180 * t} ${c[0]} ${c[1]}) translate(${c[0]} ${c[1]}) scale(${1 - 0.35 * Math.sin(Math.PI * t)}) translate(${-c[0]} ${-c[1]})`} />
            </g>
          );
        })}
        <g opacity={cross} stroke={C.muted} strokeWidth={5} strokeDasharray="16 12">
          <line x1={m([0, py])[0]} y1={m([0, py])[1]} x2={m([0, py])[0] + (m([w, py])[0] - m([0, py])[0]) * cross} y2={m([w, py])[1]} />
          <line x1={m([px, 0])[0]} y1={m([px, 0])[1]} x2={m([px, 0])[0]} y2={m([px, 0])[1] + (m([px, h])[1] - m([px, 0])[1]) * cross} />
        </g>
        {[[0, 0], [px, 0], [px, py], [0, py]].map(([x0, y0], i) => {
          const x1 = i === 0 || i === 3 ? px : w;
          const y1 = i < 2 ? py : h;
          const a = m([x0, y0]);
          const b = m([x1, y1]);
          return <rect key={i} x={a[0] + 8} y={b[1] + 8} width={b[0] - a[0] - 16} height={a[1] - b[1] - 16} rx={10} fill="none" stroke={[C.amber, C.primary, C.violet, C.blue][i]} strokeWidth={5} opacity={smalls * fadeTo(f, at(scene, 3, 0.2), 0)} />;
        })}
        <circle cx={m(p)[0]} cy={m(p)[1]} r={11} fill={C.ink} />
      </Stage>
      <Pill x={PANEL} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Cut it into four</Pill>
      <Text x={PANEL} y={280} w={960} size={44} weight={800} style={fadeUp(f, at(scene, 2, 0.3))}>
        4 small rectangles
      </Text>
      <Text x={PANEL} y={360} w={960} size={44} weight={800} style={fadeUp(f, at(scene, 3, 0.2))}>
        Each one: cut into <span style={{ color: C.primary }}>2 matching halves</span>
      </Text>
      <Text x={PANEL} y={460} w={960} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 4, 0.3))}>
        One piece → top or bottom
      </Text>
      <Text x={PANEL} y={540} w={960} size={44} weight={800} color={C.blue} style={fadeUp(f, at(scene, 5, 0.3))}>
        Other piece → left or right
      </Text>
      <Eq y={640} start={at(scene, 6, 0.2)} size={52} color={C.violet} tex="\text{top} + \text{bottom} = \text{half}" />
      <Eq y={730} start={at(scene, 6, 0.6)} size={52} color={C.blue} tex="\text{left} + \text{right} = \text{the rest}" />
      <Pill x={1510} y={170} color={C.amber} style={{ ...fadeUp(f, at(scene, 7, 0.45)), fontSize: 36 }}>Shows WHY!</Pill>
    </>
  );
};

const NOTES = ['Neighbours paired', 'Copies the bottom', '', 'Across from it', 'Too big'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // Lines: 1–2 = 22, 3–4 = 12, 5 = 15, 6 = 28, 7 = the quick check.
  const wrongAt = [at(scene, 3, 0.05), at(scene, 5, 0.05), Infinity, at(scene, 2, 0.05), at(scene, 6, 0.05)];
  const rightAt = at(scene, 7, 0.05);
  const m = plane(160, 800, 42); // 420 x 336 px, top at 464
  const { w, h, p } = MAIN;
  const half = ease(f, at(scene, 2, 0.1), 12) * fadeTo(f, at(scene, 3), 0);
  const copy = ease(f, at(scene, 5, 0.1), 12) * fadeTo(f, at(scene, 6), 0);
  const nb = ease(f, at(scene, 3, 0.2), 12) * fadeTo(f, at(scene, 5), 0);
  const nb2 = ease(f, at(scene, 4, 0.5), 12) * fadeTo(f, at(scene, 5), 0);
  const big = ease(f, at(scene, 6, 0.2), 12) * fadeTo(f, at(scene, 7), 0);
  const opp = ease(f, at(scene, 7, 0.1), 12);
  const fills = {
    bottom: 0.3 * Math.max(nb, copy, opp),
    right: 0.3 * Math.max(nb, big, half, opp),
    top: 0.3 * opp,
    left: 0.3 * Math.max(copy, big, half, opp),
  };
  return (
    <>
      <div style={{ position: 'absolute', left: 110, top: 150, display: 'flex', gap: 36 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 2 && f >= rightAt;
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 300, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 170, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: C.muted, marginTop: 12 }}>{'ABCDE'[i]}</div>
                <Tex tex={c} size={64} color={wrong ? C.red : right ? C.green : C.ink} />
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 14, fontSize: 36, fontWeight: 800, textAlign: 'center', color: C.red, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Stage>
        <Figure m={m} {...MAIN} size={48} letters={0} fills={fills} colors={{ left: C.amber }} labels={{ bottom: '15', right: '22', top: '25', left: f >= at(scene, 7, 0.3) ? '18' : '?' }} labelColors={{ left: f >= at(scene, 7, 0.3) ? C.green : C.amber }} />
        <g opacity={half}>
          <line x1={m([w / 2, 0])[0]} y1={m([0, 0])[1] + 20} x2={m([w / 2, 0])[0]} y2={m([0, h])[1] - 20} stroke={C.red} strokeWidth={5} strokeDasharray="14 10" />
          <Label p={[m([w / 2, 0])[0] + 110, m([0, h])[1] - 34]} text="halfway" color={C.red} size={48} />
          <Label p={[m(p)[0] - 30, m(p)[1] - 26]} text="P" color={C.ink} size={48} />
        </g>
      </Stage>
      <div style={{ position: 'absolute', left: 720, top: 560, whiteSpace: 'nowrap' }}>
        <div style={{ position: 'absolute', opacity: half }}>
          <Text x={0} y={0} w={1100} size={48} weight={800} color={C.red}>Left = right only if P is halfway</Text>
        </div>
        <div style={{ position: 'absolute', top: -60, opacity: nb }}>
          <Tex tex="15 + 22 - 25 = 12" size={60} color={C.red} />
        </div>
        <div style={{ position: 'absolute', top: 60, opacity: nb2 }}>
          <Tex tex="\text{but } 15 + 22 = 37 \neq 40" size={60} color={C.red} />
        </div>
        <div style={{ position: 'absolute', opacity: copy }}>
          <Text x={0} y={0} w={1100} size={48} weight={800} color={C.red}>Nothing makes left = bottom</Text>
        </div>
        <div style={{ position: 'absolute', opacity: big }}>
          <Tex tex="22 + 28 = 50 \neq 40" size={64} color={C.red} />
        </div>
        <div style={{ position: 'absolute', opacity: opp }}>
          <Tex tex="\text{bottom} + \text{top} = \text{left} + \text{right}" size={58} color={C.green} />
        </div>
      </div>
    </>
  );
};

const VM = plane(1120, 780, 58); // variant figure on the right: 522 x 464 px

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const labels = { bottom: '9', right: '20', left: '16', top: '?' };
  const on = (i: number) => ease(f, at(scene, 1, i), 10);
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>Your turn!</Pill>
      <Text x={120} y={290} w={900} size={54} weight={900} style={fadeUp(f, at(scene, 0, 0.5))}>
        P is inside rectangle ABCD.
      </Text>
      {([['bottom', '9', 0.25], ['right', '20', 0.5], ['left', '16', 0.78]] as const).map(([s, v, t], i) => (
        <div key={s} style={{ position: 'absolute', left: 140, top: 390 + i * 76, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, at(scene, 1, t)) }}>
          <div style={{ width: 170, fontSize: 44, fontWeight: 800, color: PAIR[s] }}>{s}</div>
          <Tex tex={v} size={56} />
        </div>
      ))}
      <Text x={120} y={640} w={900} size={48} weight={900} color={C.amber} style={fadeUp(f, at(scene, 2, 0.1))}>
        Find: the top triangle
      </Text>
      <Text x={120} y={715} w={900} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.55))}>
        Bonus: the whole rectangle
      </Text>
      <Stage>
        <Figure m={VM} {...VAR} progress={ease(f, at(scene, 0, 0.4), 30)} labels={labels} labelColors={{ top: C.amber }} labelOpacity={{ bottom: on(0.25), right: on(0.5), left: on(0.78), top: ease(f, at(scene, 2, 0.1), 10) }} fills={{ top: 0.2 * ease(f, at(scene, 2, 0.1), 10) }} colors={{ top: C.amber }} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = plane(150, 790, 60);
  const lr = ease(f, at(scene, 0, 0.4), 12);
  const tb = ease(f, at(scene, 2, 0.2), 12);
  const found = at(scene, 3, 0.6);
  const done = at(scene, 4, 0.97);
  return (
    <>
      <Stage>
        <Figure
          m={m}
          {...VAR}
          fills={{ left: 0.3 * lr, right: 0.3 * lr, bottom: 0.3 * tb, top: 0.3 * tb }}
          colors={{ top: f >= found ? C.green : C.violet }}
          labels={{ bottom: '9', right: '20', left: '16', top: f >= found ? '27' : '?' }}
          labelColors={{ bottom: C.violet, right: C.blue, left: C.blue, top: f >= found ? C.green : C.amber }}
          letters={0.6}
        />
      </Stage>
      <Pill x={PANEL} y={170} color={C.blue} style={fadeUp(f, at(scene, 0, 0.3))}>Known pair: left + right</Pill>
      <Eq y={280} start={at(scene, 1, 0.2)} size={58} color={C.blue} tex="16 + 20 = 36 = \text{half}" />
      <Eq y={390} start={at(scene, 2, 0.2)} size={58} color={C.violet} tex="\text{bottom} + \text{top} = 36" />
      <Eq y={500} start={at(scene, 3, 0.2)} size={58} color={C.violet} tex="9 + {\color{#f59f0a}?} = 36" />
      <Eq y={500} x={PANEL + 400} start={found} size={62} color={C.green} tex="? = 27" />
      <Eq y={620} start={at(scene, 4, 0.3)} size={58} color={C.green} tex="\text{rectangle} = 2 \times 36 = 72" />
      <Answer x={1720} y={380} value="✓" chime={CHIME} start={done} />
      <Confetti x={1720} y={380} start={done} seed={11} />
      <Pill x={PANEL} y={740} color={C.primary} style={{ ...fadeUp(f, at(scene, 5, 0.1)), fontSize: 38 }}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  const m = plane(1240, 700, 46);
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 160, width: 1600, height: 620, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 56, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 140, width: 860, fontSize: 50, fontWeight: 800, ...fadeUp(f, at(scene, 0, 0.4)) }}>
          Join a point inside a rectangle to all four corners.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 320, width: 860, fontSize: 58, fontWeight: 900, lineHeight: 1.2, color: C.violet, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Opposite triangles add up to half the rectangle.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 480, ...fadeUp(f, at(scene, 1, 0.6)) }}>
          <Tex tex="\text{bottom} + \text{top} = \text{left} + \text{right}" size={60} color={C.ink} />
        </div>
      </div>
      <Stage>
        <g opacity={ease(f, at(scene, 0, 0.5), 14) * cardOut}>
          <Figure m={m} {...MAIN} letters={0} fills={{ bottom: 0.3 * ease(f, at(scene, 1, 0.3), 12), top: 0.3 * ease(f, at(scene, 1, 0.3), 12), left: 0.3 * ease(f, at(scene, 1, 0.6), 12), right: 0.3 * ease(f, at(scene, 1, 0.6), 12) }} />
        </g>
      </Stage>
      <SignOff start={at(scene, 2, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(MAIN, ABOUT, 10, 'Area of the left triangle?'),
  'sol1-pair': Sol1Pair,
  'sol1-half': Sol1Half,
  'sol1-solve': Sol1Solve,
  check: Check2,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause(VAR, { bottom: '9', right: '20', left: '16', top: '?' }, 12, 'Top triangle? Whole rectangle?'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

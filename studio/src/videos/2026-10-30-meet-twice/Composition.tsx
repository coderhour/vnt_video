import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-meet-twice';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Ann = violet, Bo = amber. Time is measured in "meeting units": the first meeting is at t = 1,
// so Ann walks `first` km per unit and Bo walks `d - first` km per unit (same model as verify.py).
export const ANN = C.violet;
export const BO = C.amber;

/** Position (km from A) of a walker bouncing between A (0) and B (d). Unfolded start s0: Ann 0, Bo d. */
export const bounce = (s0: number, v: number, d: number, t: number) => {
  const s = (((s0 + v * t) % (2 * d)) + 2 * d) % (2 * d);
  return s <= d ? s : 2 * d - s;
};

/** The legs a walker has covered up to time t, as [fromKm, toKm] pairs. */
export const legs = (s0: number, v: number, d: number, t: number): [number, number][] => {
  const out: [number, number][] = [];
  let s = s0;
  const end = s0 + v * t;
  while (s < end - 1e-9) {
    const next = Math.min(end, (Math.floor(s / d + 1e-9) + 1) * d);
    out.push([bounce(s, 0, d, 0), bounce(next - 1e-9, 0, d, 0)]);
    s = next;
  }
  return out;
};

export type Road = { x0: number; x1: number; y: number; d: number };
export const X = (r: Road, km: number) => r.x0 + ((r.x1 - r.x0) * km) / r.d;

export const Label: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** The road with towns A and B. */
export const RoadLine: React.FC<{ r: Road; opacity?: number; townSize?: number }> = ({ r, opacity = 1, townSize = 52 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <line x1={r.x0} y1={r.y} x2={r.x1} y2={r.y} stroke={C.line} strokeWidth={22} strokeLinecap="round" />
      <line x1={r.x0} y1={r.y} x2={r.x1} y2={r.y} stroke={C.muted} strokeWidth={3} strokeDasharray="18 16" />
      {[
        [r.x0, 'A'],
        [r.x1, 'B'],
      ].map(([x, n]) => (
        <g key={n as string}>
          <rect x={(x as number) - 34} y={r.y - 34} width={68} height={68} rx={14} fill={C.ink} />
          <text x={x as number} y={r.y + 3} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={townSize} textAnchor="middle" dominantBaseline="middle">
            {n}
          </text>
        </g>
      ))}
    </g>
  );

/** A walker dot on the road with a name tag above (Ann) or below (Bo). */
export const Walker: React.FC<{ r: Road; km: number; who: 'Ann' | 'Bo'; opacity?: number; tag?: boolean }> = ({ r, km, who, opacity = 1, tag = true }) => {
  if (opacity <= 0) return null;
  // Keep the dot beside the town box (66 px) so it never hides the letter A or B.
  const x = Math.min(r.x1 - 66, Math.max(r.x0 + 66, X(r, km)));
  const up = who === 'Ann';
  const color = up ? ANN : BO;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={r.y} r={24} fill={color} stroke="#fff" strokeWidth={5} />
      {tag && <Label x={x} y={r.y + (up ? -62 : 64)} text={who} color={color} size={44} />}
    </g>
  );
};

/** Arrow along a lane at height y, from km a to km b. */
export const Leg: React.FC<{ r: Road; a: number; b: number; y: number; color: string; opacity?: number; p?: number; label?: string; labelDy?: number }> = ({ r, a, b, y, color, opacity = 1, p = 1, label, labelDy = -40 }) => {
  if (opacity <= 0 || p <= 0) return null;
  const xa = X(r, a);
  const xb = xa + (X(r, b) - xa) * p;
  const dir = Math.sign(xb - xa) || 1;
  return (
    <g opacity={opacity}>
      <line x1={xa} y1={y} x2={xb} y2={y} stroke={color} strokeWidth={8} strokeLinecap="round" />
      {Math.abs(xb - xa) > 24 && <path d={`M ${xb - dir * 22} ${y - 16} L ${xb} ${y} L ${xb - dir * 22} ${y + 16}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {label && <Label x={(xa + X(r, b)) / 2} y={y + labelDy} text={label} color={color} opacity={ease(p, 0.6, 0.3)} />}
    </g>
  );
};

/** Distance bracket under/over the road, from km a to km b. */
export const Brace: React.FC<{ r: Road; a: number; b: number; y: number; color: string; label: string; opacity: number; up?: boolean; size?: number }> = ({ r, a, b, y, color, label, opacity, up = false, size = 48 }) => {
  if (opacity <= 0) return null;
  const xa = X(r, a);
  const xb = X(r, b);
  const k = up ? 1 : -1;
  return (
    <g opacity={opacity}>
      <path d={`M ${xa} ${y - k * 16} L ${xa} ${y} L ${xb} ${y} L ${xb} ${y - k * 16}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Label x={(xa + xb) / 2} y={y + k * 40} text={label} color={color} size={size} />
    </g>
  );
};

/** A meeting marker: a ring on the road and a small numbered flag. */
export const Meet: React.FC<{ r: Road; km: number; n: string; opacity: number; color?: string }> = ({ r, km, n, opacity, color = C.primary }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={X(r, km)} cy={r.y} r={36} fill="none" stroke={color} strokeWidth={6} />
      <Label x={X(r, km)} y={r.y - 118} text={n} color={color} size={48} />
    </g>
  );

/** Maths row (HTML) that fades up. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** Coloured road-length bar, split into pieces [km, color, label]. */
const Bar: React.FC<{ r: Road; y: number; pieces: [number, string, string][]; p: number; h?: number }> = ({ r, y, pieces, p, h = 76 }) => {
  if (p <= 0) return null;
  let km = 0;
  return (
    <g opacity={Math.min(1, p * 1.5)}>
      {pieces.map(([len, color, label], i) => {
        const a = km;
        km += len;
        const xa = X(r, a);
        const w = X(r, km) - xa;
        return (
          <g key={i}>
            <rect x={xa + 3} y={y} width={Math.max(0, w * p - 6)} height={h} rx={16} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={5} />
            <Label x={xa + w / 2} y={y + h / 2 + 2} text={label} color={color} size={48} opacity={ease(p, 0.7, 0.3)} />
          </g>
        );
      })}
    </g>
  );
};

/** Walk time t(frame) from `a` to `b` units over frames [f0, f1]. */
export const walkT = (f: number, f0: number, f1: number, a: number, b: number) => interpolate(f, [f0, Math.max(f0 + 1, f1)], [a, b], clamp);

// ---------- the main question: d = 23, Ann 12 per unit, Bo 11 per unit ----------
export const D = 23;
export const VA = 12;
export const VB = D - VA;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 260, x1: 1660, y: 470, d: D };
  const t = walkT(f, 12, at(scene, 1, 0.3), 0, 3);
  const three = at(scene, 1, 0.55);
  return (
    <>
      <Text x={960} y={120} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        They meet <span style={{ color: C.primary }}>twice</span>. How far apart?
      </Text>
      <Stage>
        <RoadLine r={r} opacity={ease(f, 4, 14)} />
        <Meet r={r} km={12} n="1st" opacity={ease(f, 12 + (at(scene, 1, 0.3) - 12) / 3, 8)} />
        <Meet r={r} km={10} n="2nd" opacity={t >= 3 ? 1 : 0} />
        <Walker r={r} km={bounce(0, VA, D, t)} who="Ann" opacity={ease(f, 8, 10)} />
        <Walker r={r} km={bounce(D, VB, D, t)} who="Bo" opacity={ease(f, 8, 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 1500, top: 600, ...fadeUp(f, three), transform: `scale(${0.6 + 0.4 * ease(f, three, 12)})` }}>
        <Tex tex="\times\,3" size={130} color={C.primary} />
      </div>
      <div style={{ position: 'absolute', left: 300, top: 640, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['18', '21', '22', '23', '26'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 300, x1: 1620, y: 625, d: D };
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 130, width: 1720, background: C.card, borderRadius: 32, padding: '30px 48px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box', ...fadeUp(f, 0) }}>
        Ann and Bo start at the same time from towns A and B and walk toward each other on the same road,{' '}
        <Mark on={at(scene, 1, 0.6)}>each at a steady speed</Mark>. They <Mark on={at(scene, 2, 0.3)}>first meet 12 km from A</Mark>. Each keeps walking to the other
        town, <Mark on={at(scene, 3, 0.4)}>turns around at once</Mark> and walks back. They <Mark on={at(scene, 4, 0.2)}>meet for the second time 10 km from A</Mark>. How many kilometers apart are A and B?
      </div>
      <Stage>
        <RoadLine r={r} opacity={ease(f, at(scene, 0, 0.3), 14)} />
        <Walker r={r} km={0} who="Ann" opacity={ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, at(scene, 2, 0.2))} />
        <Walker r={r} km={D} who="Bo" opacity={ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, at(scene, 2, 0.2))} />
        <Brace r={r} a={0} b={12} y={r.y + 50} up color={C.primary} label="12 km" opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <circle cx={X(r, 12)} cy={r.y} r={16} fill={C.primary} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Brace r={r} a={0} b={10} y={r.y - 50} color={C.blue} label="10 km" opacity={ease(f, at(scene, 4, 0.3), 10)} />
        <circle cx={X(r, 10)} cy={r.y} r={16} fill={C.blue} opacity={ease(f, at(scene, 4, 0.3), 10)} />
      </Stage>
      <Choices x={480} y={740} items={CHOICES.map((c) => <Tex key={c} tex={c} size={54} />)} start={(i) => at(scene, 5, 0.1 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 260, x1: 1660, y: 330, d: D };
  // L2: walk on from the first meeting to the second.
  const t = f < at(scene, 2) ? walkT(f, at(scene, 1, 0.1), at(scene, 1, 0.6), 0, 1) : walkT(f, at(scene, 2, 0.05), at(scene, 2, 0.8), 1, 3);
  return (
    <>
      <Stage>
        <RoadLine r={r} />
        <Walker r={r} km={bounce(0, VA, D, t)} who="Ann" />
        <Walker r={r} km={bounce(D, VB, D, t)} who="Bo" />
        <Brace r={r} a={0} b={12} y={r.y + 110} up color={C.primary} label="12 km" opacity={ease(f, at(scene, 1, 0.6), 10)} />
        <circle cx={X(r, 12)} cy={r.y} r={14} fill={C.primary} opacity={ease(f, at(scene, 1, 0.6), 10)} />
        <circle cx={X(r, 10)} cy={r.y} r={14} fill={C.blue} opacity={ease(f, at(scene, 2, 0.8), 10)} />
        <Brace r={r} a={0} b={10} y={r.y + 210} up color={C.blue} label="10 km" opacity={ease(f, at(scene, 2, 0.8), 10)} />
        <Brace r={r} a={0} b={D} y={r.y - 120} color={C.red} label="d = ?" size={56} opacity={ease(f, at(scene, 3, 0.3), 10)} />
      </Stage>
      <Check x={260} y={655} start={at(scene, 0, 0.5)}>Steady speeds, the whole time</Check>
      <Check x={260} y={745} start={at(scene, 2, 0.2)}>Both turn around before meeting again</Check>
      <Pill x={1250} y={650} color={C.red} style={{ ...fadeUp(f, at(scene, 3, 0.4)), fontSize: 48, whiteSpace: 'nowrap' }}>Find the road length d</Pill>
    </>
  );
};

const makePause = (first: number, second: string, seconds: number, d: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 160, x1: 1000, y: 430, d };
  const fromB = second.includes('B');
  const s = Number(second.split(' ')[0]);
  const at2 = fromB ? d - s : s;
  return (
    <>
      <Text x={580} y={170} w={900} size={52} weight={800} align="center" style={fadeUp(f, 6)}>
        How far apart are A and B?
      </Text>
      <Stage>
        <RoadLine r={r} />
        <Brace r={r} a={0} b={first} y={r.y + 70} up color={C.primary} label={`1st: ${first} km`} opacity={1} />
        <circle cx={X(r, first)} cy={r.y} r={14} fill={C.primary} />
        <Brace r={r} a={fromB ? at2 : 0} b={fromB ? d : at2} y={r.y + 190} up color={C.blue} label={`2nd: ${second}`} opacity={1} />
        <circle cx={X(r, at2)} cy={r.y} r={14} fill={C.blue} />
        <Brace r={r} a={0} b={d} y={r.y - 70} color={C.red} label="d = ?" size={56} opacity={1} />
      </Stage>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} />
    </>
  );
};

// ---- Solution 1 ----

const R1: Road = { x0: 260, x1: 1660, y: 260, d: D };
const BAR = (i: number) => 420 + i * 110;

/** Lanes for the walked legs: Ann above the road, Bo below it. */
export const Trails: React.FC<{ r: Road; t: number; annY?: number[]; boY?: number[]; opacity?: number }> = ({ r, t, annY = [r.y - 46, r.y - 80], boY = [r.y + 46, r.y + 80], opacity = 1 }) => (
  <g opacity={opacity}>
    {legs(0, VA, r.d, t).map(([a, b], i) => <Leg key={`a${i}`} r={r} a={a} b={b} y={annY[i] ?? annY[0]} color={ANN} />)}
    {legs(r.d, VB, r.d, t).map(([a, b], i) => <Leg key={`b${i}`} r={r} a={a} b={b} y={boY[i] ?? boY[0]} color={BO} />)}
  </g>
);

const Walk1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = walkT(f, at(scene, 0, 0.4), at(scene, 1, 0.3), 0, 1);
  const bar = ease(f, at(scene, 1, 0.5), 18);
  return (
    <>
      <Stage>
        <RoadLine r={R1} />
        <Trails r={R1} t={t} annY={[R1.y + 60]} boY={[R1.y + 60]} />
        <Walker r={R1} km={bounce(0, VA, D, t)} who="Ann" />
        <Walker r={R1} km={bounce(D, VB, D, t)} who="Bo" tag={false} />
        <Label x={X(R1, 17.5)} y={R1.y - 62} text="Bo" color={BO} size={44} opacity={t >= 1 ? 1 : 0} />
        <Bar r={R1} y={BAR(1)} p={bar} pieces={[[12, ANN, 'Ann: 12 km'], [11, BO, "Bo's part"]]} />
      </Stage>
      <Text x={1700} y={BAR(1) + 8} w={200} size={48} weight={900} color={C.primary} style={fadeUp(f, at(scene, 2, 0.2))}>
        = 1
      </Text>
      <Text x={260} y={BAR(2) + 20} w={1400} size={52} weight={900} align="left" style={fadeUp(f, at(scene, 2, 0.3))}>
        Together: <span style={{ color: C.primary }}>1 road length</span>. Ann's share: <span style={{ color: ANN }}>12 km</span>
      </Text>
    </>
  );
};

const Walk2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = walkT(f, at(scene, 0, 0.1), at(scene, 0, 0.9), 1, 3);
  const b1 = ease(f, at(scene, 1, 0.2), 18);
  const b2 = ease(f, at(scene, 2, 0.2), 18);
  const b3 = ease(f, at(scene, 3, 0.15), 22);
  const n3 = ease(f, at(scene, 4, 0.5), 12);
  return (
    <>
      <Stage>
        <RoadLine r={R1} />
        <Trails r={R1} t={t} />
        <Meet r={R1} km={10} n="2nd" opacity={t >= 3 ? 1 : 0} />
        <Walker r={R1} km={bounce(0, VA, D, t)} who="Ann" tag={false} />
        <Walker r={R1} km={bounce(D, VB, D, t)} who="Bo" tag={false} />
        <Bar r={R1} y={BAR(0)} p={b1} pieces={[[23, ANN, 'Ann: A to B']]} />
        <Bar r={R1} y={BAR(1)} p={b2} pieces={[[23, BO, 'Bo: B to A']]} />
        <Bar r={R1} y={BAR(2)} p={b3} pieces={[[10, BO, 'Bo back'], [13, ANN, 'Ann back']]} />
      </Stage>
      {[b1, b2, b3].map((p, i) => (
        <Text key={i} x={1700} y={BAR(i) + 8} w={200} size={52} weight={900} color={C.primary} style={{ opacity: p }}>
          {i + 1}
        </Text>
      ))}
      <Pill x={1240} y={760} color={C.primary} style={{ opacity: n3, transform: `scale(${0.8 + 0.2 * n3})`, fontSize: 48 }}>
        3 road lengths!
      </Pill>
    </>
  );
};

const Triple: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const share = (i: number) => ease(f, at(scene, 1, 0.15 + i * 0.25), 14);
  return (
    <>
      <Pill x={260} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>Same speeds → same time per road length</Pill>
      <Stage>
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={ease(f, at(scene, 0, 0.15), 12)}>
            <Bar r={R1} y={BAR(i) - 140} p={1} pieces={[[12, ANN, ''], [11, BO, '']]} />
            <Label x={X(R1, 6)} y={BAR(i) - 100} text="Ann: 12" color={ANN} opacity={share(i)} />
            <Label x={X(R1, 17.5)} y={BAR(i) - 100} text="Bo" color={BO} size={44} opacity={share(i)} />
          </g>
        ))}
      </Stage>
      {[0, 1, 2].map((i) => (
        <Text key={i} x={1700} y={BAR(i) - 132} w={220} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.15))}>
          road {i + 1}
        </Text>
      ))}
      <Eq x={560} y={640} start={at(scene, 2, 0.35)} size={76} tex="3 \times 12 = \textcolor{#7b61ff}{36}\ \text{km}" />
    </>
  );
};

const Solve1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 260, x1: 1660, y: 300, d: D };
  const done = at(scene, 4, 0.97);
  return (
    <>
      <Pill x={260} y={130} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>Ann walks 36 km: two parts</Pill>
      <Stage>
        <RoadLine r={r} />
        <Leg r={r} a={0} b={D} y={r.y - 70} color={ANN} p={ease(f, at(scene, 1, 0.2), 22)} label="d" labelDy={-42} />
        <Leg r={r} a={D} b={10} y={r.y + 70} color={ANN} p={ease(f, at(scene, 2, 0.25), 22)} label="d − 10" labelDy={44} />
        <Brace r={r} a={0} b={10} y={r.y + 70} up color={C.blue} label="10" opacity={ease(f, at(scene, 2, 0.5), 10)} />
        <circle cx={X(r, 10)} cy={r.y} r={16} fill={C.blue} opacity={ease(f, at(scene, 2, 0.5), 10)} />
      </Stage>
      <Eq x={560} y={480} start={at(scene, 3, 0.2)} tex="d + (d - 10) = 36" />
      <Eq x={560} y={570} start={at(scene, 4, 0.0)} tex="2d - 10 = 36" />
      <Eq x={560} y={660} start={at(scene, 4, 0.25)} tex="2d = 46" />
      <Eq x={560} y={750} start={at(scene, 4, 0.5)} size={62} color={C.green} tex="d = 23\ \text{km}" />
      <Text x={1000} y={580} w={500} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 4, 0.05))}>
        (add 10)
      </Text>
      <Answer x={1560} y={650} value="D" chime={CHIME} start={done} />
      <Confetti x={1560} y={650} start={done} seed={5} />
    </>
  );
};

const Check1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 260, x1: 1660, y: 380, d: D };
  return (
    <>
      <Pill x={260} y={140} color={C.primary} style={fadeUp(f, 0)}>Walk it: d = 23 km</Pill>
      <Stage>
        <RoadLine r={r} />
        <Leg r={r} a={0} b={D} y={r.y - 70} color={ANN} p={ease(f, at(scene, 0, 0.25), 18)} label="23 km" labelDy={-42} />
        <Leg r={r} a={D} b={10} y={r.y + 70} color={ANN} p={ease(f, at(scene, 0, 0.5), 18)} label="13 km back" labelDy={46} />
        <Brace r={r} a={0} b={10} y={r.y + 70} up color={C.blue} label="10 km" opacity={ease(f, at(scene, 0, 0.75), 10)} />
        <circle cx={X(r, 10)} cy={r.y} r={16} fill={C.blue} opacity={ease(f, at(scene, 0, 0.75), 10)} />
      </Stage>
      <Eq x={300} y={640} start={at(scene, 0, 0.5)} tex="23 + 13 = 36, \quad 23 - 13 = 10" />
      <Check x={1360} y={650} start={at(scene, 0, 0.85)}>It works!</Check>
    </>
  );
};

// ---- Solution 2: follow Bo ----

const Bo: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 260, x1: 1660, y: 250, d: D };
  const L = 1000;
  return (
    <>
      <Stage>
        <RoadLine r={r} />
        <Leg r={r} a={D} b={12} y={r.y - 70} color={BO} p={ease(f, at(scene, 1, 0.2), 18)} label="d − 12" labelDy={-42} />
        <circle cx={X(r, 12)} cy={r.y} r={14} fill={C.primary} opacity={ease(f, at(scene, 1, 0.2), 10)} />
        <g opacity={fadeTo(f, at(scene, 3), 0)}>
          <Brace r={r} a={0} b={12} y={r.y + 50} up color={C.primary} label="12" opacity={ease(f, at(scene, 1, 0.4), 10)} />
        </g>
        <Leg r={r} a={D} b={0} y={r.y + 70} color={BO} p={ease(f, at(scene, 3, 0.1), 18)} label="d" labelDy={46} opacity={ease(f, at(scene, 3), 6)} />
        <Leg r={r} a={0} b={10} y={r.y + 150} color={BO} p={ease(f, at(scene, 3, 0.4), 14)} label="10" labelDy={46} />
      </Stage>
      <Pill x={260} y={140} color={BO} style={fadeUp(f, at(scene, 0, 0.2))}>Follow Bo</Pill>
      <Eq x={260} y={480} start={at(scene, 1, 0.6)} size={52} color={BO} tex="\text{1st: } d - 12" />
      <Eq x={260} y={560} start={at(scene, 2, 0.5)} size={52} color={BO} tex="\text{2nd: } 3(d - 12)" />
      <Eq x={260} y={640} start={at(scene, 3, 0.6)} size={52} color={BO} tex="\text{walked: } d + 10" />
      <Eq x={L} y={480} start={at(scene, 4, 0.1)} tex="3(d - 12) = d + 10" />
      <Eq x={L} y={560} start={at(scene, 4, 0.4)} tex="3d - 36 = d + 10" />
      <Eq x={L} y={640} start={at(scene, 5, 0.1)} tex="2d = 46" />
      <Text x={L + 260} y={648} w={400} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 5, 0.1))}>
        (−d, +36)
      </Text>
      <Eq x={L} y={720} start={at(scene, 5, 0.4)} size={60} color={C.green} tex="d = 23 \;\checkmark" opacity={fadeTo(f, at(scene, 6))} />
      <Pill x={L} y={720} color={C.violet} style={{ ...fadeUp(f, at(scene, 6, 0.3)), fontSize: 44 }}>Start from what you know: Ann's 12</Pill>
    </>
  );
};

// ---- Common traps: walk 36 km on each choice's road ----

const TRAPS = [
  { d: 18, why: '36 \\div 2', end: 'at A' },
  { d: 21, why: '\\text{no step}', end: '6 km' },
  { d: 22, why: '12 + 10', end: '8 km' },
  { d: 23, why: '', end: '10 km' },
  { d: 26, why: '36 = d + 10', end: '16 km' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.2), at(scene, 2, 0.2), at(scene, 3, 0.2), Infinity, at(scene, 4, 0.2)];
  const endAt = [at(scene, 1, 0.55), at(scene, 2, 0.55), at(scene, 3, 0.55), at(scene, 5, 0.75), at(scene, 5, 0.2)];
  const rightAt = at(scene, 5, 0.75);
  return (
    <>
      <Text x={960} y={128} w={1600} size={48} weight={800} align="center" style={fadeUp(f, at(scene, 0, 0.1))}>
        Ann walks <span style={{ color: ANN }}>36 km</span> in total. Where does she end?
      </Text>
      <div style={{ position: 'absolute', left: 95, top: 220, display: 'flex', gap: 30 }}>
        {TRAPS.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 3 && f >= rightAt;
          const border = wrong ? C.red : right ? C.green : 'transparent';
          const shown = ease(f, endAt[i], 12);
          const r: Road = { x0: 40, x1: 280, y: 70, d: c.d };
          const endKm = c.d - (36 - c.d);
          const col = wrong ? C.red : right ? C.green : C.ink;
          return (
            <div key={i} style={{ width: 320, ...fadeUp(f, at(scene, 0, 0.2) + i * 5, 12) }}>
              <div style={{ height: 420, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 14 }}>{'ABCDE'[i]}</div>
                <Tex tex={`d = ${c.d}`} size={60} color={col} />
                <svg width={320} height={130} viewBox="0 0 320 130" style={{ overflow: 'visible', marginTop: 6 }}>
                  <line x1={r.x0} y1={r.y} x2={r.x1} y2={r.y} stroke={C.line} strokeWidth={14} strokeLinecap="round" />
                  <text x={r.x0} y={r.y + 44} fontFamily={NUNITO} fontWeight={900} fontSize={36} textAnchor="middle" fill={C.ink}>A</text>
                  <text x={r.x1} y={r.y + 44} fontFamily={NUNITO} fontWeight={900} fontSize={36} textAnchor="middle" fill={C.ink}>B</text>
                  <line x1={X(r, 10)} y1={r.y - 30} x2={X(r, 10)} y2={r.y + 30} stroke={C.blue} strokeWidth={5} strokeDasharray="8 6" />
                  <circle cx={X(r, endKm)} cy={r.y} r={16 * shown} fill={col === C.ink ? ANN : col} />
                </svg>
                <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, opacity: shown }}>ends</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: col, opacity: shown }}>{c.end}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {c.why && (
                <div style={{ marginTop: 18, textAlign: 'center', ...fadeUp(f, wrongAt[i] + 6) }}>
                  <Tex tex={c.why} size={50} color={C.red} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---- Variant ----

const VD = 16;
const VR: Road = { x0: 260, x1: 1660, y: 360, d: VD };

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={260} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>Your turn!</Pill>
      <Stage>
        <RoadLine r={VR} opacity={ease(f, at(scene, 0, 0.4), 14)} />
        <Brace r={VR} a={0} b={7} y={VR.y + 70} up color={C.primary} label="1st: 7 km from A" opacity={ease(f, at(scene, 1, 0.2), 10)} />
        <circle cx={X(VR, 7)} cy={VR.y} r={14} fill={C.primary} opacity={ease(f, at(scene, 1, 0.2), 10)} />
        <Brace r={VR} a={11} b={VD} y={VR.y + 200} up color={C.blue} label="2nd: 5 km from B" opacity={ease(f, at(scene, 1, 0.65), 10)} />
        <circle cx={X(VR, 11)} cy={VR.y} r={14} fill={C.blue} opacity={ease(f, at(scene, 1, 0.65), 10)} />
        <Brace r={VR} a={0} b={VD} y={VR.y - 90} color={C.red} label="d = ?" size={56} opacity={ease(f, at(scene, 2, 0.7), 10)} />
      </Stage>
      <Pill x={1060} y={720} color={C.amber} style={{ ...fadeUp(f, at(scene, 2, 0.1)), fontSize: 46 }}>Watch out: from B!</Pill>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { ...VR, y: 215 };
  const done = at(scene, 2, 0.97);
  const bo = ease(f, at(scene, 3), 12);
  const annOut = fadeTo(f, at(scene, 3), 0.25);
  return (
    <>
      <Stage>
        <RoadLine r={r} />
        <g opacity={annOut}>
          <Leg r={r} a={0} b={VD} y={r.y - 70} color={ANN} p={ease(f, at(scene, 1, 0.15), 18)} label="d" labelDy={-42} />
          <Leg r={r} a={VD} b={11} y={r.y + 70} color={ANN} p={ease(f, at(scene, 1, 0.45), 14)} label="5" labelDy={46} />
        </g>
        <g opacity={bo}>
          <Leg r={r} a={VD} b={0} y={r.y + 150} color={BO} p={ease(f, at(scene, 4, 0.1), 18)} label="16" labelDy={46} />
          <Leg r={r} a={0} b={11} y={r.y + 230} color={BO} p={ease(f, at(scene, 4, 0.35), 16)} label="11" labelDy={46} />
        </g>
        <circle cx={X(r, 11)} cy={r.y} r={16} fill={C.blue} opacity={ease(f, at(scene, 1, 0.5), 10)} />
      </Stage>
      <Eq x={260} y={530} start={at(scene, 0, 0.6)} color={ANN} tex="\text{Ann: } 3 \times 7 = 21" opacity={annOut} />
      <Eq x={260} y={620} start={at(scene, 2, 0.1)} opacity={annOut} tex="d + 5 = 21" />
      <Eq x={260} y={710} start={at(scene, 2, 0.45)} size={62} color={C.green} tex="d = 16\ \text{km}" />
      <Eq x={900} y={530} start={at(scene, 3, 0.3)} size={52} color={BO} tex="\text{Bo: } 16 - 7 = 9" />
      <Eq x={900} y={620} start={at(scene, 3, 0.6)} size={52} color={BO} tex="3 \times 9 = 27 = 16 + 11" />
      <Eq x={900} y={710} start={at(scene, 4, 0.55)} size={52} color={C.blue} tex="16 - 11 = 5\ \text{from B}\ \checkmark" />
      <Answer x={1720} y={600} value="16" chime={CHIME} start={done} />
      <Confetti x={1720} y={600} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 620, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1460, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.3)) }}>
          1st meeting: together they've walked the road <span style={{ color: C.primary }}>once</span>.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 300, width: 1460, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          2nd meeting: <span style={{ color: C.primary }}>three times</span>.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 440, width: 1460, fontSize: 52, fontWeight: 800, color: C.violet, ...fadeUp(f, at(scene, 1, 0.5)) }}>
          So each walker goes <Tex tex="3\times" size={60} color={C.violet} /> as far!
        </div>
      </div>
      <SignOff start={at(scene, 2, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(12, '10 km from A', 10, D),
  walk1: Walk1,
  walk2: Walk2,
  triple: Triple,
  solve1: Solve1,
  check1: Check1,
  bo: Bo,
  traps: Traps,
  variant: Variant,
  try2: makePause(7, '5 km from B', 12, VD),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;


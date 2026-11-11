import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-meet-twice-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Ann = violet, Bo = amber. Time is measured in "meeting units": the first meeting is at t = 1,
// so Ann walks `first` km per unit and Bo walks `d - first` km per unit (same model as verify.py).
export const ANN = C.violet;
export const BO = C.amber;
const NAME = { Ann: '小安', Bo: '小明' } as const;

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
    <text x={x} y={y} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
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
      {tag && <Label x={x} y={r.y + (up ? -62 : 64)} text={NAME[who]} color={color} size={44} />}
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
export const Meet: React.FC<{ r: Road; km: number; n: string; opacity: number; color?: string; anchor?: 'start' | 'middle' | 'end' }> = ({ r, km, n, opacity, color = C.primary, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={X(r, km)} cy={r.y} r={36} fill="none" stroke={color} strokeWidth={6} />
      <Label x={X(r, km) + (anchor === 'start' ? -24 : anchor === 'end' ? 24 : 0)} y={r.y - 118} text={n} color={color} size={48} anchor={anchor} />
    </g>
  );

/** Maths row (HTML) that fades up. */
const Eq: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
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
  const three = at(scene, 1, 0.8);
  return (
    <>
      <Text x={960} y={120} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        相遇<span style={{ color: C.primary }}>两次</span>，两地相距多远？
      </Text>
      <Stage>
        <RoadLine r={r} opacity={ease(f, 4, 14)} />
        <Meet r={r} km={12} n="第1次" anchor="start" opacity={ease(f, 12 + (at(scene, 1, 0.3) - 12) / 3, 8)} />
        <Meet r={r} km={10} n="第2次" anchor="end" opacity={t >= 3 ? 1 : 0} />
        <Walker r={r} km={bounce(0, VA, D, t)} who="Ann" opacity={ease(f, 8, 10)} />
        <Walker r={r} km={bounce(D, VB, D, t)} who="Bo" opacity={ease(f, 8, 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 1500, top: 600, ...fadeUp(f, three), transform: `scale(${0.6 + 0.4 * ease(f, three, 12)})` }}>
        <Tex tex="\times\,3" size={130} color={C.primary} />
      </div>
      <div style={{ position: 'absolute', left: 300, top: 640, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
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
        小安和小明分别从 A、B 两地同时出发，在同一条路上相向而行，<Mark on={at(scene, 1, 0.6)}>速度都保持不变</Mark>。两人<Mark on={at(scene, 2, 0.2)}>第一次在离 A 地 12 千米处相遇</Mark>。两人继续前进，各自到达对方的出发地后
        <Mark on={at(scene, 3, 0.6)}>立即掉头</Mark>往回走。两人<Mark on={at(scene, 4, 0.1)}>第二次在离 A 地 10 千米处相遇</Mark>。A、B 两地相距多少千米？
      </div>
      <Stage>
        <RoadLine r={r} opacity={ease(f, at(scene, 0, 0.3), 14)} />
        <Walker r={r} km={0} who="Ann" opacity={ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, at(scene, 2, 0.2))} />
        <Walker r={r} km={D} who="Bo" opacity={ease(f, at(scene, 0, 0.5), 10) * fadeTo(f, at(scene, 2, 0.2))} />
        <Brace r={r} a={0} b={12} y={r.y + 50} up color={C.primary} label="12 千米" opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <circle cx={X(r, 12)} cy={r.y} r={16} fill={C.primary} opacity={ease(f, at(scene, 2, 0.3), 10)} />
        <Brace r={r} a={0} b={10} y={r.y - 50} color={C.blue} label="10 千米" opacity={ease(f, at(scene, 4, 0.3), 10)} />
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
        <Brace r={r} a={0} b={12} y={r.y + 110} up color={C.primary} label="12 千米" opacity={ease(f, at(scene, 1, 0.6), 10)} />
        <circle cx={X(r, 12)} cy={r.y} r={14} fill={C.primary} opacity={ease(f, at(scene, 1, 0.6), 10)} />
        <circle cx={X(r, 10)} cy={r.y} r={14} fill={C.blue} opacity={ease(f, at(scene, 2, 0.8), 10)} />
        <Brace r={r} a={0} b={10} y={r.y + 210} up color={C.blue} label="10 千米" opacity={ease(f, at(scene, 2, 0.8), 10)} />
        <Brace r={r} a={0} b={D} y={r.y - 120} color={C.red} label="d = ?" size={56} opacity={ease(f, at(scene, 3, 0.3), 10)} />
      </Stage>
      <Check x={260} y={655} start={at(scene, 0, 0.5)}>速度从头到尾都不变</Check>
      <Check x={260} y={745} start={at(scene, 2, 0.2)}>两人都掉头之后，才第二次相遇</Check>
      <Pill x={1250} y={650} color={C.red} style={{ ...fadeUp(f, at(scene, 3, 0.4)), fontSize: 48, whiteSpace: 'nowrap' }}>求全程 d</Pill>
    </>
  );
};

const makePause = (first: number, s: number, fromB: boolean, seconds: number, d: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 160, x1: 1000, y: 430, d };
  const at2 = fromB ? d - s : s;
  return (
    <>
      <Text x={580} y={170} w={900} size={52} weight={800} align="center" style={fadeUp(f, 6)}>
        A、B 两地相距多少千米？
      </Text>
      <Stage>
        <RoadLine r={r} />
        <Brace r={r} a={0} b={first} y={r.y + 70} up color={C.primary} label={`第1次：离A ${first}千米`} opacity={1} />
        <circle cx={X(r, first)} cy={r.y} r={14} fill={C.primary} />
        <Brace r={r} a={fromB ? at2 : 0} b={fromB ? d : at2} y={r.y + 190} up color={C.blue} label={`第2次：离${fromB ? 'B' : 'A'} ${s}千米`} opacity={1} />
        <circle cx={X(r, at2)} cy={r.y} r={14} fill={C.blue} />
        <Brace r={r} a={0} b={d} y={r.y - 70} color={C.red} label="d = ?" size={56} opacity={1} />
      </Stage>
      <Countdown
        scene={scene}
        seconds={seconds}
        x={1440}
        y={480}
        tick={TICK}
        label={
          <span style={{ fontFamily: ZH_FONT }}>
            暂停，试一试<span style={{ color: C.primary }}>！</span>
          </span>
        }
      />
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
        <Label x={X(R1, 17.5)} y={R1.y - 62} text="小明" color={BO} size={44} opacity={t >= 1 ? 1 : 0} />
        <Bar r={R1} y={BAR(1)} p={bar} pieces={[[12, ANN, '小安：12 千米'], [11, BO, '小明走的']]} />
      </Stage>
      <Text x={1700} y={BAR(1) + 8} w={200} size={48} weight={900} color={C.primary} style={fadeUp(f, at(scene, 2, 0.2))}>
        = 1
      </Text>
      <Text x={260} y={BAR(2) + 20} w={1400} size={52} weight={900} align="left" style={fadeUp(f, at(scene, 2, 0.3))}>
        两人合走：<span style={{ color: C.primary }}>1 个全程</span>。其中小安走了 <span style={{ color: ANN }}>12 千米</span>
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
  const n3 = ease(f, at(scene, 4, 0.6), 12);
  return (
    <>
      <Stage>
        <RoadLine r={R1} />
        <Trails r={R1} t={t} />
        <Meet r={R1} km={10} n="第2次" opacity={t >= 3 ? 1 : 0} />
        <Walker r={R1} km={bounce(0, VA, D, t)} who="Ann" tag={false} />
        <Walker r={R1} km={bounce(D, VB, D, t)} who="Bo" tag={false} />
        <Bar r={R1} y={BAR(0)} p={b1} pieces={[[23, ANN, '小安：A 到 B']]} />
        <Bar r={R1} y={BAR(1)} p={b2} pieces={[[23, BO, '小明：B 到 A']]} />
        <Bar r={R1} y={BAR(2)} p={b3} pieces={[[10, BO, '小明往回'], [13, ANN, '小安往回']]} />
      </Stage>
      {[b1, b2, b3].map((p, i) => (
        <Text key={i} x={1700} y={BAR(i) + 8} w={200} size={52} weight={900} color={C.primary} style={{ opacity: p }}>
          {i + 1}
        </Text>
      ))}
      <Pill x={1240} y={760} color={C.primary} style={{ opacity: n3, transform: `scale(${0.8 + 0.2 * n3})`, fontSize: 48 }}>
        3 个全程！
      </Pill>
    </>
  );
};

const Triple: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const share = (i: number) => ease(f, at(scene, 1, 0.15 + i * 0.25), 14);
  return (
    <>
      <Pill x={260} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>速度不变 → 每个全程用时相同</Pill>
      <Stage>
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={ease(f, at(scene, 0, 0.15), 12)}>
            <Bar r={R1} y={BAR(i) - 140} p={1} pieces={[[12, ANN, ''], [11, BO, '']]} />
            <Label x={X(R1, 6)} y={BAR(i) - 100} text="小安：12" color={ANN} opacity={share(i)} />
            <Label x={X(R1, 17.5)} y={BAR(i) - 100} text="小明" color={BO} size={44} opacity={share(i)} />
          </g>
        ))}
      </Stage>
      {[0, 1, 2].map((i) => (
        <Text key={i} x={1700} y={BAR(i) - 132} w={220} size={44} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.15))}>
          全程 {i + 1}
        </Text>
      ))}
      <Eq x={560} y={640} start={at(scene, 2, 0.55)} size={76} tex={['3 \\times 12 = \\textcolor{#7b61ff}{36}', z('千米')]} />
    </>
  );
};

const Solve1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r: Road = { x0: 260, x1: 1660, y: 300, d: D };
  const done = at(scene, 4, 0.97);
  return (
    <>
      <Pill x={260} y={130} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>小安走的 36 千米：分成两段</Pill>
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
      <Eq x={560} y={750} start={at(scene, 4, 0.5)} size={62} color={C.green} tex={['d = 23', z('千米')]} />
      <Text x={1000} y={580} w={500} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 4, 0.05))}>
        （两边加 10）
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
      <Pill x={260} y={140} color={C.primary} style={fadeUp(f, 0)}>走一遍：d = 23 千米</Pill>
      <Stage>
        <RoadLine r={r} />
        <Leg r={r} a={0} b={D} y={r.y - 70} color={ANN} p={ease(f, at(scene, 0, 0.25), 18)} label="23 千米" labelDy={-42} />
        <Leg r={r} a={D} b={10} y={r.y + 70} color={ANN} p={ease(f, at(scene, 0, 0.5), 18)} label="往回 13 千米" labelDy={46} />
        <Brace r={r} a={0} b={10} y={r.y + 70} up color={C.blue} label="10 千米" opacity={ease(f, at(scene, 0, 0.75), 10)} />
        <circle cx={X(r, 10)} cy={r.y} r={16} fill={C.blue} opacity={ease(f, at(scene, 0, 0.75), 10)} />
      </Stage>
      <Eq x={300} y={640} start={at(scene, 0, 0.5)} tex="23 + 13 = 36, \quad 23 - 13 = 10" />
      <Check x={1360} y={650} start={at(scene, 0, 0.85)}>对上了！</Check>
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
      <Pill x={260} y={140} color={BO} style={fadeUp(f, at(scene, 0, 0.2))}>跟着小明走</Pill>
      <Eq x={260} y={480} start={at(scene, 1, 0.6)} size={52} color={BO} tex={[z('第1次：'), 'd - 12']} />
      <Eq x={260} y={560} start={at(scene, 2, 0.5)} size={52} color={BO} tex={[z('第2次：'), '3(d - 12)']} />
      <Eq x={260} y={640} start={at(scene, 3, 0.6)} size={52} color={BO} tex={[z('也就是：'), 'd + 10']} />
      <Eq x={L} y={480} start={at(scene, 4, 0.1)} tex="3(d - 12) = d + 10" />
      <Eq x={L} y={560} start={at(scene, 4, 0.4)} tex="3d - 36 = d + 10" />
      <Eq x={L} y={640} start={at(scene, 5, 0.1)} tex="2d = 46" />
      <Text x={L + 260} y={648} w={400} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 5, 0.1))}>
        （两边 −d，+36）
      </Text>
      <Eq x={L} y={720} start={at(scene, 5, 0.4)} size={60} color={C.green} tex="d = 23 \;\checkmark" opacity={fadeTo(f, at(scene, 6))} />
      <Pill x={L} y={720} color={C.violet} style={{ ...fadeUp(f, at(scene, 6, 0.3)), fontSize: 44 }}>从已知的入手：小安的 12</Pill>
    </>
  );
};

// ---- Common traps: walk 36 km on each choice's road ----

const TRAPS: { d: number; why: string | Part[]; end: string }[] = [
  { d: 18, why: '36 \\div 2', end: 'A 地' },
  { d: 21, why: [z('没有依据')], end: '6 千米' },
  { d: 22, why: '12 + 10', end: '8 千米' },
  { d: 23, why: '', end: '10 千米' },
  { d: 26, why: '36 = d + 10', end: '16 千米' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.2), at(scene, 2, 0.2), at(scene, 3, 0.2), Infinity, at(scene, 4, 0.2)];
  const endAt = [at(scene, 1, 0.55), at(scene, 2, 0.55), at(scene, 3, 0.55), at(scene, 5, 0.75), at(scene, 5, 0.2)];
  const rightAt = at(scene, 5, 0.75);
  return (
    <>
      <Text x={960} y={128} w={1600} size={48} weight={800} align="center" style={fadeUp(f, at(scene, 0, 0.1))}>
        小安一共走 <span style={{ color: ANN }}>36 千米</span>。小安最后停在哪里？
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
              <div style={{ height: 450, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 14 }}>{'ABCDE'[i]}</div>
                <Tex tex={`d = ${c.d}`} size={60} color={col} />
                <svg width={320} height={130} viewBox="0 0 320 130" style={{ overflow: 'visible', marginTop: 6 }}>
                  <line x1={r.x0} y1={r.y} x2={r.x1} y2={r.y} stroke={C.line} strokeWidth={14} strokeLinecap="round" />
                  <text x={r.x0} y={r.y + 44} fontFamily={NUNITO} fontWeight={900} fontSize={36} textAnchor="middle" fill={C.ink}>A</text>
                  <text x={r.x1} y={r.y + 44} fontFamily={NUNITO} fontWeight={900} fontSize={36} textAnchor="middle" fill={C.ink}>B</text>
                  <line x1={X(r, 10)} y1={r.y - 30} x2={X(r, 10)} y2={r.y + 30} stroke={C.blue} strokeWidth={5} strokeDasharray="8 6" />
                  <circle cx={X(r, endKm)} cy={r.y} r={16 * shown} fill={col === C.ink ? ANN : col} />
                </svg>
                <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, opacity: shown }}>{i === 0 ? '停在' : '停在离 A'}</div>
                <div style={{ fontSize: 52, fontWeight: 900, color: col, opacity: shown }}>{c.end}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {c.why && (
                <div style={{ marginTop: 18, textAlign: 'center', ...fadeUp(f, wrongAt[i] + 6) }}>
                  <Z p={c.why} size={50} color={C.red} />
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
      <Pill x={260} y={140} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>轮到你了！</Pill>
      <Stage>
        <RoadLine r={VR} opacity={ease(f, at(scene, 0, 0.4), 14)} />
        <Brace r={VR} a={0} b={7} y={VR.y + 70} up color={C.primary} label="第1次：离A 7千米" opacity={ease(f, at(scene, 1, 0.2), 10)} />
        <circle cx={X(VR, 7)} cy={VR.y} r={14} fill={C.primary} opacity={ease(f, at(scene, 1, 0.2), 10)} />
        <Brace r={VR} a={11} b={VD} y={VR.y + 200} up color={C.blue} label="第2次：离B 5千米" opacity={ease(f, at(scene, 1, 0.65), 10)} />
        <circle cx={X(VR, 11)} cy={VR.y} r={14} fill={C.blue} opacity={ease(f, at(scene, 1, 0.65), 10)} />
        <Brace r={VR} a={0} b={VD} y={VR.y - 90} color={C.red} label="d = ?" size={56} opacity={ease(f, at(scene, 2, 0.7), 10)} />
      </Stage>
      <Pill x={1060} y={720} color={C.amber} style={{ ...fadeUp(f, at(scene, 2, 0.1)), fontSize: 46 }}>注意：这次是离 B！</Pill>
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
      <Eq x={260} y={530} start={at(scene, 0, 0.7)} color={ANN} tex={[z('小安：'), '3 \\times 7 = 21']} opacity={annOut} />
      <Eq x={260} y={620} start={at(scene, 2, 0.1)} opacity={annOut} tex="d + 5 = 21" />
      <Eq x={260} y={710} start={at(scene, 2, 0.45)} size={62} color={C.green} tex={['d = 16', z('千米')]} />
      <Eq x={900} y={530} start={at(scene, 3, 0.3)} size={52} color={BO} tex={[z('小明：'), '16 - 7 = 9']} />
      <Eq x={900} y={620} start={at(scene, 3, 0.6)} size={52} color={BO} tex="3 \times 9 = 27 = 16 + 11" />
      <Eq x={900} y={710} start={at(scene, 4, 0.55)} size={52} color={C.blue} tex={['16 - 11 = 5', z('离 B'), '\\;\\checkmark']} />
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
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1460, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.3)) }}>
          第1次相遇：两人合走了<span style={{ color: C.primary }}>一个</span>全程。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 300, width: 1460, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          第2次相遇：两人合走了<span style={{ color: C.primary }}>3 个</span>全程。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 440, width: 1460, fontSize: 52, fontWeight: 800, color: C.violet, ...fadeUp(f, at(scene, 1, 0.5)) }}>
          所以每个人走的路程，都是第1次的 3 倍！
        </div>
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(12, 10, false, 10, D),
  walk1: Walk1,
  walk2: Walk2,
  triple: Triple,
  solve1: Solve1,
  check1: Check1,
  bo: Bo,
  traps: Traps,
  variant: Variant,
  try2: makePause(7, 5, true, 10, VD),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第5级" font={ZH_FONT} /> : null;


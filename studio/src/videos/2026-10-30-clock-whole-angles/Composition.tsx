import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-clock-whole-angles';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const HOUR_C = C.violet;
const MIN_C = C.primary;
const GREEN_SOFT = 'rgba(33, 196, 93, 0.24)';
const RED_SOFT = 'rgba(239, 67, 67, 0.2)';

// ---------- helpers ----------

const rad = (d: number) => (d * Math.PI) / 180;
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];

/** Piecewise tween: starts at v0, moves to each [frame, value] over `dur` frames. */
const tw = (f: number, v0: number, keys: [number, number][], dur = 10) => {
  let v = v0;
  let prev = v0;
  for (const [fr, val] of keys) {
    v += ease(f, fr, dur) * (val - prev);
    prev = val;
  }
  return v;
};

/** Smaller wedge between two hand angles (degrees clockwise from 12). */
const smaller = (hour: number, min: number) => {
  const d = (((min - hour) % 360) + 360) % 360;
  return d <= 180 ? { from: hour, sweep: d } : { from: min, sweep: 360 - d };
};

const hourAt = (h: number, m: number) => 30 * h + 0.5 * m;
const minAt = (m: number) => 6 * m;

type Wedge = { from: number; sweep: number; color: string; op?: number };
type Lab = { text: string; color: string; at: number; op?: number };

/** Analogue clock. Hand angles are in degrees clockwise from 12. */
const Clock: React.FC<{ cx: number; cy: number; R: number; hour: number; min: number; wedge?: Wedge | null; label?: Lab | null }> = ({ cx, cy, R, hour, min, wedge, label }) => {
  const sector = (w: Wedge) => {
    const r = R * 0.46;
    if (Math.abs(w.sweep) >= 359.5) return <circle cx={cx} cy={cy} r={r} fill={w.color} fillOpacity={0.28 * (w.op ?? 1)} stroke={w.color} strokeWidth={5} strokeOpacity={w.op ?? 1} />;
    if (Math.abs(w.sweep) < 0.2) return null;
    const a = polar(cx, cy, r, w.from);
    const b = polar(cx, cy, r, w.from + w.sweep);
    const large = Math.abs(w.sweep) > 180 ? 1 : 0;
    const sw = w.sweep > 0 ? 1 : 0;
    return <path d={`M ${cx} ${cy} L ${a[0]} ${a[1]} A ${r} ${r} 0 ${large} ${sw} ${b[0]} ${b[1]} Z`} fill={w.color} fillOpacity={0.3 * (w.op ?? 1)} stroke={w.color} strokeWidth={5} strokeOpacity={w.op ?? 1} strokeLinejoin="round" />;
  };
  const hp = polar(cx, cy, R * 0.5, hour);
  const mp = polar(cx, cy, R * 0.78, min);
  const lp = label ? polar(cx, cy, R + 78, label.at) : [0, 0];
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill={C.card} stroke={C.ink} strokeWidth={8} />
      {range(60).map((i) => {
        const a = polar(cx, cy, R - (i % 5 === 0 ? 20 : 11), i * 6);
        const b = polar(cx, cy, R - 2, i * 6);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={i % 5 === 0 ? C.ink : C.muted} strokeWidth={i % 5 === 0 ? 5 : 2.5} />;
      })}
      {range(12).map((i) => {
        const p = polar(cx, cy, R - 56, (i + 1) * 30);
        return (
          <text key={i} x={p[0]} y={p[1]} fontFamily={NUNITO} fontWeight={800} fontSize={Math.round(R * 0.19)} fill={C.ink} textAnchor="middle" dominantBaseline="central">
            {i + 1}
          </text>
        );
      })}
      {wedge && sector(wedge)}
      <line x1={cx} y1={cy} x2={hp[0]} y2={hp[1]} stroke={HOUR_C} strokeWidth={R * 0.07} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mp[0]} y2={mp[1]} stroke={MIN_C} strokeWidth={R * 0.045} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={R * 0.05} fill={C.ink} />
      {label && (label.op ?? 1) > 0 && (
        <text x={lp[0]} y={lp[1]} fontFamily={NUNITO} fontWeight={900} fontSize={64} fill={label.color} opacity={label.op ?? 1} textAnchor="middle" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={10}>
          {label.text}
        </text>
      )}
    </g>
  );
};

/** Chip grid h:00 ... h:59 (6 rows of 10). */
type ChipSt = { bg?: string; fg?: string; border?: string; op?: number; scale?: number };
const TimeGrid: React.FC<{ h: number; style: (m: number) => ChipSt; x0?: number; y0?: number; colw?: number; rowh?: number; cw?: number; ch?: number; font?: number; brackets?: (pair: number) => number }> = ({
  h, style, x0 = 160, y0 = 160, colw = 165, rowh = 84, cw = 150, ch = 66, font = 46, brackets,
}) => {
  const pos = (m: number) => [x0 + (m % 10) * colw, y0 + Math.floor(m / 10) * rowh] as const;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {brackets &&
        range(30).map((k) => {
          const [x, y] = pos(2 * k);
          const o = brackets(k);
          if (o <= 0) return null;
          return <div key={`b${k}`} style={{ position: 'absolute', left: x - 8, top: y - 7, width: colw + cw + 6, height: ch + 14, borderRadius: 24, border: `4px solid ${C.violet}`, opacity: o * 0.8 }} />;
        })}
      {range(60).map((m) => {
        const [x, y] = pos(m);
        const s = style(m);
        return (
          <div
            key={m}
            style={{
              position: 'absolute', left: x, top: y, width: cw, height: ch, borderRadius: 16,
              background: s.bg ?? C.card, color: s.fg ?? C.ink, border: `3px solid ${s.border ?? C.line}`,
              opacity: s.op ?? 1, transform: `scale(${s.scale ?? 1})`,
              fontSize: font, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(30,40,80,0.05)',
            }}
          >
            {h}:{String(m).padStart(2, '0')}
          </div>
        );
      })}
    </div>
  );
};

const EVEN_ON: ChipSt = { bg: GREEN_SOFT, border: C.green };
const ODD_OFF: ChipSt = { bg: RED_SOFT, border: C.red, op: 0.45 };

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ y, tex, start, x = 960, size = 56, color = C.ink, opacity = 1, center }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 14);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', opacity: p * opacity, transform: `${center ? 'translateX(-50%) ' : ''}translateY(${(1 - p) * 24}px)` }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number }> = ({ x, y, w, h, start }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

const Mk: React.FC<{ x: number; y: number; start: number; ok: boolean }> = ({ x, y, start, ok }) => {
  const f = useCurrentFrame();
  const col = ok ? C.green : C.red;
  return (
    <svg width={64} height={64} viewBox="0 0 54 54" style={{ position: 'absolute', left: x, top: y, ...fadeUp(f, start) }}>
      <circle cx={27} cy={27} r={27} fill={col} />
      {ok ? <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M17 17 L37 37 M37 17 L17 37" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />}
    </svg>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const step = at(scene, 1, 0.12);
  const min = tw(f, 0, [[step, 6]], 8);
  const hour = tw(f, 30, [[step, 30.5]], 8);
  const second = f >= step + 4;
  const w = smaller(hour, min);
  const lab = second ? { text: '24.5°', color: C.red } : { text: '30°', color: C.green };
  return (
    <>
      <Stage>
        <Clock cx={600} cy={500} R={270} hour={hour} min={min} wedge={{ ...w, color: lab.color }} label={{ ...lab, at: w.from + w.sweep / 2, op: ease(f, 8, 12) }} />
      </Stage>
      <Pill x={1010} y={340} color={C.red} style={{ opacity: ease(f, step + 8, 12), fontSize: 52 }}>
        not whole
      </Pill>
      <div style={{ position: 'absolute', left: 1230, top: 460, width: 600, textAlign: 'center', fontFamily: PACIFICO, fontSize: 150, color: C.primary, ...fadeUp(f, at(scene, 2)) }}>Vantee</div>
      <Text x={1530} y={715} w={600} size={44} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 2, 0.3))}>
        AMC 8-style · Level 4
      </Text>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={70} y={130} w={1020} size={50} weight={600} style={fadeUp(f, 4)}>
        How many of the times <Mark on={at(scene, 1, 0.5)}>1:00, 1:01, 1:02, …, 1:59</Mark> have a <Mark on={at(scene, 2, 0.5)}>smaller angle</Mark> between the clock hands that is a{' '}
        <Mark on={at(scene, 2, 0.7)}>whole number of degrees</Mark>?
      </Text>
      <Stage>
        <Clock cx={1450} cy={470} R={220} hour={30} min={0} />
      </Stage>
      <Choices x={70} y={650} start={(i) => at(scene, 3, 0.35) + i * 9} items={['12', '15', '29', '30', '60']} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const lit = (m: number): ChipSt => {
    if (f < l1 + 20) return { op: ease(f, m, 8) };
    if (m === 0) return { bg: GREEN_SOFT, border: C.green, scale: 1.06 };
    if (m === 1) return { bg: RED_SOFT, border: C.red, scale: 1.06 };
    return { op: 0.35 };
  };
  return (
    <>
      <TimeGrid h={1} style={lit} y0={200} rowh={78} />
      <Pill x={160} y={112} color={C.violet} style={fadeUp(f, 14)}>
        60 times
      </Pill>
      <div style={{ position: 'absolute', left: 250, top: 700, ...fadeUp(f, l1 + 6) }}>
        <Tex tex={'1{:}00 \\to 30^\\circ'} size={60} color={C.green} />
      </div>
      <Mk x={700} y={710} start={l1 + 6} ok />
      <div style={{ position: 'absolute', left: 1000, top: 700, ...fadeUp(f, l1 + 30) }}>
        <Tex tex={'1{:}01 \\to 24.5^\\circ'} size={60} color={C.red} />
      </div>
      <Mk x={1560} y={710} start={l1 + 30} ok={false} />
    </>
  );
};

const Try: React.FC<{ scene: Parameters<SceneComponent>[0]['scene']; text: React.ReactNode; hour: number; secs: number }> = ({ scene, text, hour, secs }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={70} y={110} w={1780} size={48} weight={600} style={fadeUp(f, 0)}>
        {text}
      </Text>
      <Stage>
        <Clock cx={460} cy={540} R={210} hour={hour} min={0} />
      </Stage>
      <Countdown scene={scene} seconds={secs} x={1370} y={540} tick={TICK} />
    </>
  );
};

const Try1: SceneComponent = ({ scene }) => <Try scene={scene} hour={30} secs={10} text={<>How many of the times 1:00, 1:01, …, 1:59 have a smaller angle between the clock hands that is a whole number of degrees?</>} />;
const Try2: SceneComponent = ({ scene }) => <Try scene={scene} hour={60} secs={12} text={<>From 2:00, 2:01, …, 2:59, how many times is the smaller angle a multiple of 5 degrees (5°, 10°, 15°, …)?</>} />;

const Speeds: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = at(scene, 0, 0.35);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const sweepEnd = at(scene, 0, 0.95);
  const turn = ease(f, l0, sweepEnd - l0) * 360;
  const hourMove = ease(f, l2 + 25, 60) * 30;
  const wedge: Wedge | null = f < l2 ? (turn > 0 ? { from: 0, sweep: turn, color: MIN_C } : null) : { from: 30, sweep: hourMove, color: HOUR_C, op: ease(f, l2, 10) };
  const minHand = f < l2 ? turn : 0;
  const lab: Lab | null = f >= l2 + 85 ? { text: '30°', color: HOUR_C, at: 45 } : null;
  return (
    <>
      <Stage>
        <Clock cx={480} cy={500} R={260} hour={30 + (f < l2 ? 0 : hourMove)} min={minHand} wedge={wedge} label={lab} />
      </Stage>
      <Eq x={960} y={230} start={l1} tex={'\\dfrac{360^\\circ}{60} = 6^\\circ \\text{ per minute}'} color={MIN_C} size={62} />
      <Eq x={960} y={470} start={l2 + 50} tex={'\\dfrac{30^\\circ}{60} = 0.5^\\circ \\text{ per minute}'} color={HOUR_C} size={62} />
      <Eq x={960} y={640} start={l2 + 60} tex={'360^\\circ \\div 12 = 30^\\circ'} color={C.muted} size={52} />
    </>
  );
};

const Formula: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const hour = tw(f, 30, [[l(2, 0.1), 35]], 40);
  const min = tw(f, 0, [[l(3, 0.1), 60]], 40);
  const wedge: Wedge | null = f < l(2) ? { from: 0, sweep: 30, color: HOUR_C, op: ease(f, l(1, 0.55), 12) } : f < l(5) ? null : { ...smaller(hour, min), color: C.amber, op: ease(f, l(5), 12) };
  const lab: Lab | null = f >= l(1, 0.55) && f < l(2) ? { text: '30°', color: HOUR_C, at: 15 } : null;
  return (
    <>
      <Stage>
        <Clock cx={460} cy={500} R={250} hour={hour} min={min} wedge={wedge} label={lab} />
      </Stage>
      <Eq x={940} y={150} start={l(2)} tex={'\\text{hour hand} = 30 + 0.5m'} color={HOUR_C} />
      <Eq x={940} y={285} start={l(3)} tex={'\\text{minute hand} = 6m'} color={MIN_C} />
      <Eq x={940} y={420} start={l(4)} tex={'6 - 0.5 = 5.5'} />
      <Text x={940} y={500} w={900} size={44} weight={700} color={C.muted} style={fadeUp(f, l(4, 0.5))}>
        degrees gained per minute
      </Text>
      <Eq x={970} y={620} start={l(5)} tex={'\\text{gap} = 30 - 5.5m'} size={68} color={C.green} />
      <Boxed x={940} y={605} w={760} h={110} start={l(5, 0.4)} />
    </>
  );
};

const Test: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const hour = tw(f, 40, [[l(2), 50]], 30);
  const min = tw(f, 120, [[l(2), 240]], 30);
  const phase = f < l(1) ? 0 : f < l(2) ? 1 : f < l(3) ? 2 : 3;
  let wedge: Wedge | null = null;
  let lab: Lab | null = null;
  if (phase === 1) {
    wedge = { ...smaller(40, 120), color: C.amber, op: ease(f, l(1), 12) };
    lab = { text: '80°', color: C.amber, at: 80, op: ease(f, l(1), 12) };
  }
  if (phase === 2 && f > l(2) + 30) {
    wedge = { from: 50, sweep: 190, color: C.red, op: ease(f, l(2) + 30, 14) };
    lab = { text: '190°', color: C.red, at: 145, op: ease(f, l(2) + 30, 14) };
  }
  if (phase === 3) {
    const k = ease(f, l(3), 20);
    wedge = { from: 240, sweep: 170, color: C.green, op: k };
    lab = { text: '170°', color: C.green, at: 325, op: k };
    if (k < 1) {
      // the long side fades while the smaller side appears
      wedge = { from: 50, sweep: 190, color: C.red, op: 1 - k };
      lab = { text: '190°', color: C.red, at: 145, op: 1 - k };
    }
  }
  const early = 1 - ease(f, l(2), 10);
  const late = ease(f, l(2), 10);
  return (
    <>
      <Stage>
        <Clock cx={450} cy={500} R={250} hour={hour} min={min} wedge={wedge} label={lab} />
      </Stage>
      <Eq x={900} y={170} start={l(0)} tex={'30 - 5.5 \\times 20 = 30 - 110 = -80'} size={52} opacity={early} />
      <Eq x={900} y={300} start={l(1)} tex={'-80 \\;\\to\\; 80^\\circ'} size={60} color={C.amber} opacity={early} />
      <Eq x={900} y={170} start={l(2) + 10} tex={'30 - 5.5 \\times 40 = -190'} size={52} opacity={late} />
      <Eq x={900} y={300} start={l(2) + 24} tex={'\\text{gap} = 190^\\circ > 180^\\circ'} size={56} color={C.red} opacity={late} />
      <Eq x={900} y={470} start={l(3)} tex={'360 - 190 = 170^\\circ'} size={64} color={C.green} />
    </>
  );
};

const Whole: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const hl = ease(f, l(1), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 960, top: 130, whiteSpace: 'nowrap', opacity: ease(f, l(0, 0.3), 14), transform: `translateX(-50%) translateY(${(1 - ease(f, l(0, 0.3), 14)) * 24}px)` }}>
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 1 - hl }}>
            <Tex tex={'30 - 5.5m'} size={120} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: hl, whiteSpace: 'nowrap' }}>
            <Tex tex={'\\textcolor{#21c45d}{30} - \\colorbox{#bff0d6}{$5.5m$}'} size={120} />
          </div>
        </div>
      </div>
      <Pill x={1440} y={150} color={C.violet} style={{ ...fadeUp(f, l(0, 0.5)), fontSize: 56 }}>
        whole?
      </Pill>
      <Eq x={560} y={420} start={l(2, 0.25)} tex={'5.5 \\times 2 = 11'} size={76} color={C.green} />
      <Mk x={1090} y={440} start={l(2, 0.3)} ok />
      <Eq x={560} y={590} start={l(3, 0.45)} tex={'5.5 \\times 3 = 16\\textcolor{#ef4343}{.5}'} size={76} color={C.red} />
      <Mk x={1170} y={610} start={l(3, 0.55)} ok={false} />
    </>
  );
};

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const big = fadeTo(f, l(1), 0, 12);
  const gridIn = ease(f, l(1) + 8, 14);
  const gridOut = 1 - 0.92 * ease(f, l(3, 0.1), 14);
  const eqOut = 1 - ease(f, l(3, 0.05), 10);
  const t0 = l(1, 0.18);
  const t1 = l(2, -0.2) > t0 + 30 ? l(2, 0) : l(2, 0);
  const pairAt = (k: number) => t0 + Math.round((k / 30) * (t1 - t0));
  const style = (m: number): ChipSt => {
    const k = Math.floor(m / 2);
    if (f < pairAt(k)) return {};
    const on = ease(f, pairAt(k), 8);
    return m % 2 === 0 ? { bg: GREEN_SOFT, border: C.green, scale: 1 + 0.05 * on } : { ...ODD_OFF, op: 1 - 0.55 * on };
  };
  const dOn = ease(f, l(3, 0.55), 10);
  return (
    <>
      <Eq x={960} y={230} start={l(0, 0.15)} tex={'360 - \\text{whole} = \\text{whole}'} size={84} center opacity={big} />
      <Eq x={960} y={420} start={l(0, 0.6)} tex={'\\text{whole} \\iff m \\text{ even}'} size={92} center color={C.green} opacity={big} />
      <div style={{ opacity: gridIn * gridOut }}>
        <TimeGrid h={1} style={style} y0={190} rowh={78} ch={64} brackets={(k) => ease(f, pairAt(k) - 6, 8)} />
      </div>
      <Eq x={960} y={100} start={l(1)} tex={'\\text{whole} \\iff m \\text{ even}'} size={56} center opacity={gridIn * eqOut} color={C.green} />
      <Eq x={960} y={690} start={l(2, 0.25)} tex={'60 \\div 2 = 30 \\text{ pairs}'} size={68} center opacity={eqOut} color={C.violet} />
      <div style={{ position: 'absolute', left: 960, top: 600, transform: 'translateX(-50%)', display: 'flex', gap: 22 }}>
        {['12', '15', '29', '30', '60'].map((c, i) => (
          <div key={i} style={{ ...fadeUp(f, l(3, 0.05) + i * 6, 10), background: i === 3 ? `rgba(33,196,93,${0.1 + 0.3 * dOn})` : C.card, border: `6px solid ${i === 3 ? `rgba(33,196,93,${dOn})` : 'transparent'}`, borderRadius: 18, padding: '12px 26px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 36, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Answer x={960} y={330} value="30" start={l(3, 0.7)} chime={CHIME} />
      <Confetti x={960} y={330} start={l(3, 0.7)} seed={7} />
    </>
  );
};

const Hands: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const stepF = (i: number, k: number) => l(i, 0.12 + 0.25 * k);
  const keys = (i: number) => [1, 2, 3].map((k) => [stepF(i, k), k] as [number, number]);
  const tweenM = f < l(2) ? tw(f, 0, keys(1), 8) : f < l(3) ? tw(f, 0, keys(2), 8) : 1;
  const hourVals = ['30°', '30.5°', '31°', '31.5°'];
  const minVals = ['0°', '6°', '12°', '18°'];
  const gridPhase = ease(f, l(5), 14);
  const x0 = 930;
  const c1 = polar(440, 480, 120, 30.5);
  return (
    <>
      <div style={{ opacity: 1 - gridPhase }}>
        <Stage>
          <Clock cx={440} cy={480} R={240} hour={30 + 0.5 * tweenM} min={6 * tweenM} />
          {f >= l(3, 0.5) && <circle cx={c1[0]} cy={c1[1]} r={46} fill="none" stroke={C.red} strokeWidth={7} opacity={ease(f, l(3, 0.5), 10)} />}
        </Stage>
        <Text x={x0} y={140} w={800} size={42} weight={800} color={MIN_C} style={fadeUp(f, l(1))}>
          Minute hand
        </Text>
        <div style={{ position: 'absolute', left: x0, top: 190, display: 'flex', gap: 24 }}>
          {minVals.map((v, k) => (
            <div key={k} style={{ ...fadeUp(f, stepF(1, k), 8), fontSize: 60, fontWeight: 900, color: C.green, background: GREEN_SOFT, borderRadius: 16, padding: '4px 20px' }}>{v}</div>
          ))}
        </div>
        <Text x={x0} y={300} w={800} size={42} weight={800} color={HOUR_C} style={fadeUp(f, l(2))}>
          Hour hand
        </Text>
        <div style={{ position: 'absolute', left: x0, top: 350, display: 'flex', gap: 24 }}>
          {hourVals.map((v, k) => (
            <div key={k} style={{ ...fadeUp(f, stepF(2, k), 8), fontSize: 60, fontWeight: 900, color: k % 2 === 0 ? C.green : C.red, background: k % 2 === 0 ? GREEN_SOFT : RED_SOFT, borderRadius: 16, padding: '4px 20px' }}>{v}</div>
          ))}
        </div>
        <Eq x={x0} y={480} start={l(4)} tex={'\\text{whole} - \\text{whole} = \\text{whole}'} size={52} color={C.green} />
        <Eq x={x0} y={575} start={l(4, 0.5)} tex={'\\text{whole} - (\\text{something}.5) = \\text{not whole}'} size={52} color={C.red} />
        <Eq x={x0} y={670} start={l(4, 0.7)} tex={'\\text{e.g. } 30.5 - 6 = 24.5'} size={52} color={C.muted} />
      </div>
      <div style={{ opacity: gridPhase }}>
        <TimeGrid h={1} y0={170} rowh={80} style={(mm) => (f < l(5) ? {} : mm % 2 === 0 ? { ...EVEN_ON, op: ease(f, l(5) + mm, 8) } : { ...ODD_OFF, op: 1 - 0.55 * ease(f, l(5) + mm, 8) })} />
        <Pill x={600} y={680} color={C.green} style={{ fontSize: 52, ...fadeUp(f, l(5, 0.5)) }}>
          every other minute → 30
        </Pill>
      </div>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const phase = f < l(1) ? 0 : f < l(2) ? 1 : f < l(3) ? 2 : f < l(4) ? 3 : f < l(5) ? 4 : 5;
  const card = ['', 'Trap: 60', 'Trap: 29', 'Trap: 12', 'Trap: 15', ''][phase];
  const swp = (m: number, i: number) => ease(f, l(i) + 6 + Math.round(m * 0.5), 8);
  const RED_ON = (o: number): ChipSt => ({ bg: RED_SOFT, border: C.red, op: 0.3 + 0.7 * o });
  const tm1 = l(4, 0.55);
  const style = (m: number): ChipSt => {
    if (phase === 0) return {};
    if (phase === 1) return RED_ON(swp(m, 1));
    if (phase === 2) {
      if (m === 0) return { border: C.red, bg: C.card, scale: 1 + 0.08 * Math.sin((f - l(2)) / 4) ** 2 };
      return m % 2 === 0 ? RED_ON(swp(m, 2)) : {};
    }
    if (phase === 3) return m % 5 === 0 ? RED_ON(ease(f, m === 0 ? l(3) : l(3, 0.08 + 0.075 * (m / 5 - 1)) + 6, 8)) : {};
    if (phase === 4 && m === 2 && f >= tm1) return { bg: GREEN_SOFT, border: C.green, scale: 1.12 };
    return m % 4 === 0 && phase === 4 ? RED_ON(swp(m, 4)) : {};
  };
  const tm = phase === 3 ? tw(f, 0, range(11).map((k) => [l(3, 0.08 + 0.075 * k), 5 * (k + 1)] as [number, number]), 8) : phase === 4 ? tw(f, 0, [[tm1, 2]], 14) : 0;
  const hr = hourAt(1, tm);
  const showClock = phase === 3 || phase === 4;
  const lop = ease(f, tm1 + 14, 10);
  const w1 = phase === 4 ? smaller(hr, minAt(tm)) : null;
  return (
    <>
      <div style={{ opacity: phase === 5 ? 0.15 : 1 }}>
        <TimeGrid h={1} x0={90} y0={215} colw={128} rowh={80} cw={120} ch={66} font={46} style={style} />
      </div>
      {card && (
        <Pill x={90} y={110} color={C.red} style={{ fontSize: 52, ...fadeUp(f, l(phase)) }}>
          {card}
        </Pill>
      )}
      {phase === 2 && (
        <Pill x={400} y={118} color={C.amber} style={{ fontSize: 40, padding: '6px 22px', ...fadeUp(f, l(2, 0.5)) }}>
          forgot me! ↓
        </Pill>
      )}
      {showClock && (
        <Stage>
          <g opacity={ease(f, l(phase), 12)}>
            <Clock cx={1660} cy={470} R={170} hour={hr} min={minAt(tm)} wedge={w1 && lop > 0 ? { ...w1, color: C.green, op: lop } : null} label={w1 && lop > 0 ? { text: '19°', color: C.green, at: w1.from + w1.sweep / 2, op: lop } : null} />
          </g>
        </Stage>
      )}
      {phase === 4 && lop > 0 && (
        <Pill x={1420} y={700} color={C.green} style={{ fontSize: 44, opacity: lop }}>
          1:02 is whole too
        </Pill>
      )}
      {phase === 5 && (
        <div style={{ position: 'absolute', left: 960, top: 300, transform: `translateX(-50%) translateY(${(1 - ease(f, l(5), 14)) * 24}px)`, opacity: ease(f, l(5), 14), background: C.card, border: `6px solid ${C.primary}`, borderRadius: 32, padding: '36px 56px', width: 1400, textAlign: 'center', boxShadow: '0 12px 40px rgba(30,40,80,0.12)' }}>
          <div style={{ fontSize: 60, fontWeight: 900, color: C.primary, marginBottom: 18 }}>A great habit</div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.35 }}>
            Check the first time
            <br />
            Test an even AND an odd minute
          </div>
        </div>
      )}
    </>
  );
};

const VariantQ: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={70} y={130} w={1020} size={52} weight={600} style={fadeUp(f, 4)}>
        From <Mark on={at(scene, 0, 0.5)}>2:00, 2:01, …, 2:59</Mark>, how many times is the smaller angle a <Mark on={at(scene, 1, 0.55)}>multiple of 5 degrees</Mark> (5°, 10°, 15°, …)?
      </Text>
      <Stage>
        <Clock cx={1450} cy={470} R={220} hour={60} min={0} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const left = 1 - ease(f, l(6), 12);
  const gridOn = ease(f, l(6), 14) * (1 - ease(f, l(7), 12));
  const ten = ease(f, l(7), 14);
  const MS = [0, 10, 20, 30, 40, 50];
  const ANG = ['60°', '5°', '50°', '105°', '160°', '145°'];
  const style = (m: number): ChipSt => {
    const i = MS.indexOf(m);
    if (i >= 0 && f >= l(6, 0.3) + i * 14) return { ...EVEN_ON, scale: 1.08 };
    return { op: 0.4 };
  };
  const tableStart = l(5, 0.1);
  return (
    <>
      <div style={{ opacity: left }}>
        <Stage>
          <g opacity={ease(f, l(0), 14)}>
            <Clock cx={1600} cy={340} R={170} hour={60} min={0} />
          </g>
        </Stage>
        <Eq x={70} y={448} start={l(5)} tex={'5.5 \\times 10 = 55'} size={50} color={C.violet} />
        <Eq x={70} y={120} start={l(0)} tex={'\\text{gap} = 60 - 5.5m'} size={64} />
        <Pill x={780} y={125} color={C.violet} style={{ fontSize: 48, ...fadeUp(f, l(1, 0.4)) }}>
          m even
        </Pill>
        <div style={{ position: 'absolute', left: 50, top: 235, width: 1280, height: 90, borderRadius: 20, background: C.violetSoft, opacity: ease(f, l(3), 12) * 0 }} />
        <Eq x={70} y={240} start={l(2, 0.3)} tex={'5.5 \\times 2 = 11,\\ 5.5 \\times 4 = 22,\\ 5.5 \\times 6 = 33,\\ \\ldots'} size={50} />
        <Eq x={70} y={360} start={l(3, 0.3)} tex={'\\text{multiple of } 11 \\ \\text{AND}\\ \\text{multiple of } 5'} size={56} color={C.violet} />
        <div style={{ position: 'absolute', left: 70, top: 545, display: 'flex', gap: 22 }}>
          {[0, 55, 110, 165, 220, 275].map((v, i) => (
            <div key={i} style={{ ...fadeUp(f, tableStart + i * 7, 10), width: 190, textAlign: 'center', background: C.card, borderRadius: 18, padding: '10px 0', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <div style={{ fontSize: 60, fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: C.violet }}>m = {i * 10}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ opacity: gridOn }}>
        <Eq x={960} y={90} start={l(6)} tex={'360 - (\\text{multiple of }5) = \\text{multiple of }5'} size={52} center />
        <TimeGrid h={2} y0={180} rowh={76} ch={64} style={style} />
        <div style={{ position: 'absolute', left: 90, top: 650, display: 'flex', gap: 14 }}>
          {MS.map((m, i) => (
            <div key={m} style={{ ...fadeUp(f, l(6, 0.3) + i * 14, 8), fontSize: 44, fontWeight: 900, color: C.green, background: GREEN_SOFT, borderRadius: 16, padding: '6px 14px', whiteSpace: 'nowrap' }}>
              2:{String(m).padStart(2, '0')} → {ANG[i]}
            </div>
          ))}
        </div>
      </div>
      <div style={{ opacity: ten }}>
        <Stage>
          <Clock cx={520} cy={470} R={250} hour={hourAt(2, 10)} min={minAt(10)} wedge={{ ...smaller(hourAt(2, 10), minAt(10)), color: C.green, op: ten }} label={{ text: '5°', color: C.green, at: 62.5, op: ten }} />
        </Stage>
        <Eq x={1000} y={600} start={l(7, 0.5)} tex={'60 - 55 = 5^\\circ'} size={72} color={C.green} />
      </div>
      <Answer x={1450} y={360} value="6" start={l(7, 0.28)} chime={CHIME} />
      <Confetti x={1450} y={360} start={l(8)} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const off = ease(f, l(2), 14);
  const g = off * (1 - ease(f, l(3), 12));
  return (
    <>
      <div style={{ opacity: 1 - ease(f, l(3), 12) }}>
        <Eq x={960} y={70 + (1 - off) * 270} start={l(1)} tex={'\\text{gap at } 1{:}m = 30 - 5.5m'} size={64 + (1 - off) * 24} center color={C.green} />
      </div>
      <Text x={960} y={470} w={1500} size={44} weight={700} color={C.muted} align="center" style={{ ...fadeUp(f, l(1, 0.5)), opacity: ease(f, l(1, 0.5), 14) * (1 - off) }}>
        drop any minus sign, and if it is over 180° take 360 minus it
      </Text>
      <div style={{ opacity: g }}>
        <TimeGrid h={1} y0={190} rowh={80} style={(m) => (m % 2 === 0 ? { ...EVEN_ON, op: ease(f, l(2) + m, 8) } : { ...ODD_OFF, op: 1 - 0.55 * ease(f, l(2) + m, 8) })} />
        <Pill x={620} y={690} color={C.green} style={{ fontSize: 56, ...fadeUp(f, l(2, 0.5)) }}>
          every even minute
        </Pill>
      </div>
      <div style={{ position: 'absolute', left: 960, top: 300, transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(f, l(3)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 190, color: C.primary }}>Vantee</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: C.ink }}>See you next time!</div>
      </div>
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Try1,
  speeds: Speeds,
  formula: Formula,
  test: Test,
  whole: Whole,
  count: Count,
  hands: Hands,
  traps: Traps,
  variant: VariantQ,
  try2: Try2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

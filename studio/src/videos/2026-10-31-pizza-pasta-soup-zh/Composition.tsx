import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, XMark } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-pizza-pasta-soup-zh';
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md

export const PIZ = '#ef4343';
export const PAS = '#f08c00';
export const SOUP = '#3c83f6';
const VIO = C.violet;
export const GREEN = C.green;
const PANEL = 900;

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

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

// ---------- kid tokens ----------

export type Group = { from: number; to: number; color: string; start: (k: number) => number };
const bump = (t: number) => (t < 0 ? 0 : Math.sin(Math.min(1, t / 14) * Math.PI));

const wedge = (cx: number, cy: number, r: number, i: number, n: number) => {
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
  return `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
};

type KidsProps = {
  n?: number; cols?: number; cx?: number; cy?: number; cell?: number; r?: number;
  groups?: Group[]; glow?: { from: number; to: number; start: (k: number) => number };
  appear?: (k: number) => number; op?: number; fs?: number;
};

/** n kid tokens (numbered circles) in a grid. A tag is a coloured wedge; a kid with two tags is split in half. */
export const Kids: React.FC<KidsProps> = ({ n = 24, cols = 6, cx = 150, cy = 205, cell = 118, r = 50, groups = [], glow, appear, op = 1, fs = 48 }) => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <g opacity={op}>
        {range(n).map((i) => {
          const k = i + 1;
          const x = cx + (i % cols) * cell;
          const y = cy + Math.floor(i / cols) * (cell + 2);
          const ap = appear ? ease(f, appear(k), 10) : 1;
          if (ap <= 0) return null;
          const on = groups.filter((g) => k >= g.from && k <= g.to && f >= g.start(k));
          const pulse = Math.max(0, ...on.map((g) => bump(f - g.start(k))));
          const gl = glow && k >= glow.from && k <= glow.to ? ease(f, glow.start(k), 12) : 0;
          const gp = gl > 0 ? Math.sin(Math.min(1, (f - glow!.start(k)) / 16) * Math.PI) : 0;
          const s = ap * (1 + 0.16 * pulse + 0.2 * gp);
          const fill = on.length === 0 && gl === 0;
          return (
            <g key={k} transform={`translate(${x} ${y}) scale(${s})`} opacity={ap}>
              {gl > 0 && <circle r={r + 12} fill={GREEN} opacity={0.3 * gl} />}
              <circle r={r} fill={fill ? '#e6e9f2' : '#fff'} stroke={fill ? '#c6ccdb' : '#fff'} strokeWidth={4} />
              {gl > 0 ? (
                <circle r={r} fill={GREEN} opacity={gl} />
              ) : on.length === 1 ? (
                <circle r={r} fill={on[0].color} />
              ) : (
                on.map((g, j) => <path key={j} d={wedge(0, 0, r, j, on.length)} fill={g.color} />)
              )}
              <text y={fs * 0.35} fontSize={fs} fontWeight={900} textAnchor="middle" fill={fill ? '#4a5160' : '#fff'} stroke={fill ? 'none' : 'rgba(0,0,0,0.35)'} strokeWidth={6} paintOrder="stroke" style={{ fontFamily: 'inherit' }}>
                {k}
              </text>
            </g>
          );
        })}
      </g>
    </Stage>
  );
};

// ---------- small helpers ----------

const Row: React.FC<{ x: number; y: number; label: string; tex: string; color: string; style: React.CSSProperties }> = ({ x, y, label, tex, color, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', ...style }}>
    <div style={{ width: 290, fontSize: 48, fontWeight: 800, color }}>{label}</div>
    <Tex tex={tex} size={56} />
  </div>
);


const Eq: React.FC<{ x?: number; y: number; start: number; tex: string | Part[]; size?: number; color?: string }> = ({ x = PANEL, y, start, tex, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; children: React.ReactNode; color?: string; size?: number; fade?: number }> = ({ x = PANEL, y, w = 960, start, children, color = C.red, size = 48, fade }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: size, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start), opacity: ease(f, start, 14) * (fade === undefined ? 1 : fadeTo(f, fade, 0, 10)) }}>
      {children}
    </div>
  );
};

const QBox: React.FC<{ x?: number; y: number; w?: number; minHeight?: number; start: number; children: React.ReactNode; size?: number }> = ({ x = PANEL, y, w = 940, minHeight = 440, start, children, size = 48 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, minHeight, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, start, 10) }}>
      {children}
    </div>
  );
};

export type LegendItem = { label: string; color: string; start: number };
export const Legend: React.FC<{ x: number; y: number; items: LegendItem[]; size?: number; wrap?: number }> = ({ x, y, items, size = 48, wrap = 800 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: wrap, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
      {items.map((it) => (
        <div key={it.label} style={{ background: it.color, color: '#fff', borderRadius: 999, padding: '2px 22px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', ...fadeUp(f, it.start, 10) }}>
          {it.label}
        </div>
      ))}
    </div>
  );
};

export const CH = ['0', '4', '6', '14', '16'];

/** Answer-choice chips. `red[i]` / `green` = frame at which that chip changes colour. */
const ChoiceRow: React.FC<{ x: number; y: number; start?: (i: number) => number; red?: Record<number, number>; green?: number; size?: number }> = ({ x, y, start, red = {}, green, size = 58 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CH.map((c, i) => {
        const r = red[i] !== undefined ? ease(f, red[i], 10) : 0;
        const g = i === 2 && green !== undefined ? ease(f, green, 10) : 0;
        const bg = g > 0 ? `rgba(33,196,93,${0.18 * g})` : r > 0 ? `rgba(239,67,67,${0.14 * r})` : C.card;
        const bd = g > 0 ? GREEN : r > 0 ? C.red : 'transparent';
        return (
          <div key={i} style={{ ...(start ? fadeUp(f, start(i), 10) : {}), background: bg, border: `5px solid ${g > 0 || r > 0 ? bd : 'transparent'}`, borderRadius: 18, padding: '8px 18px', fontSize: size, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', color: r > 0 ? '#b52a2a' : C.ink }}>
            <span style={{ color: C.muted, fontSize: 48, marginRight: 8 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        );
      })}
    </div>
  );
};

export const FoodBadges: React.FC<{ x: number; y: number; start: (i: number) => number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 24 }}>
      {[['披萨', PIZ], ['意面', PAS], ['汤', SOUP]].map(([t, c], i) => (
        <div key={t} style={{ background: c, color: '#fff', borderRadius: 24, padding: '12px 34px', fontSize: 58, fontWeight: 900, transform: `scale(${pop(f, start(i))})`, opacity: f >= start(i) ? 1 : 0, boxShadow: '0 8px 22px rgba(30,40,80,0.15)' }}>
          {t}
        </div>
      ))}
    </div>
  );
};

const QTEXT1 = <>一个班有 24 个小朋友，20 个喜欢披萨，18 个喜欢意面，16 个喜欢喝汤。3 种都喜欢的小朋友，最少可能有几个？</>;
const QTEXT2 = <>一个班有 30 个小朋友，25 个喜欢猫，22 个喜欢狗，20 个喜欢鱼，27 个喜欢鸟。4 样都喜欢的小朋友，最少可能有几个？</>;

const countLegend = (s: (i: number) => number): LegendItem[] => [
  { label: '披萨 20', color: PIZ, start: s(0) },
  { label: '意面 18', color: PAS, start: s(1) },
  { label: '汤 16', color: SOUP, start: s(2) },
];

// the arrangement from verify.py: kids 1-4 no pizza, 5-10 no pasta, 11-18 no soup, 19-24 like all three
export const groupsFor = (start: (k: number) => number): Group[] => [
  { from: 1, to: 4, color: PIZ, start },
  { from: 5, to: 10, color: PAS, start },
  { from: 11, to: 18, color: SOUP, start },
];

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const vennOp = ease(f, l1, 12) * fadeTo(f, l2, 0, 10);
  const xp = ease(f, at(scene, 1, 0.6), 10);
  return (
    <>
      <Kids appear={(k) => 4 + k * 3} />
      <FoodBadges x={PANEL} y={150} start={(i) => at(scene, 0, 0.45 + i * 0.15)} />
      <div style={{ position: 'absolute', inset: 0, opacity: vennOp }}>
        <Stage>
          <circle cx={1240} cy={430} r={125} fill={PIZ} opacity={0.35} />
          <circle cx={1400} cy={430} r={125} fill={PAS} opacity={0.35} />
          <circle cx={1320} cy={570} r={125} fill={SOUP} opacity={0.35} />
          <XMark at={[1320, 500]} size={320 * xp} opacity={xp} />
        </Stage>
        <Text x={1320} y={725} w={700} size={64} weight={900} color={C.primary} align="center" style={{ opacity: xp }}>不用画！</Text>
      </div>
      <div style={{ position: 'absolute', left: PANEL + 100, top: 420, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 42, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Kids />
      <Legend x={60} y={650} items={countLegend((i) => at(scene, 2 + i, 0.3))} />
      <QBox y={140} minHeight={340} start={at(scene, 1) - 4}>
        <span style={s(1)}>一个班有 24 个小朋友，</span>
        <span style={s(2)}>其中 20 个喜欢披萨，</span>
        <span style={s(3)}>18 个喜欢意面，</span>
        <span style={s(4)}>
          16 个喜欢喝汤。3 种都喜欢的小朋友，<Mark on={at(scene, 4, 0.6)}>最少可能有几个</Mark>？
        </span>
      </QBox>
      <ChoiceRow x={PANEL} y={680} start={(i) => at(scene, 5, 0.2 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // line 3: arrangements flicker; they are shown only to say "we choose", none is the best one
  const t0 = at(scene, 2, 0.1);
  const idx = f < t0 ? -1 : Math.floor((f - t0) / 26) % 3;
  const R: [number, number][][] = [
    [[1, 4], [3, 8], [5, 12]],
    [[21, 24], [19, 24], [17, 24]],
    [[5, 8], [7, 12], [10, 17]],
  ];
  const groups: Group[] = idx < 0 ? [] : [PIZ, PAS, SOUP].map((color, j) => ({ from: R[idx][j][0], to: R[idx][j][1], color, start: () => -1000 }));
  const card = (i: number, label: string, v: number, color: string) => (
    <div key={label} style={{ background: color, color: '#fff', borderRadius: 24, padding: '12px 20px', width: 218, textAlign: 'center', fontSize: 48, fontWeight: 900, lineHeight: 1.15, ...fadeUp(f, at(scene, 0, 0.3 + i * 0.16)) }}>
      <div style={{ fontSize: 64 }}>{v}</div>
      {label}
    </div>
  );
  return (
    <>
      <Kids groups={groups} />
      <Legend x={60} y={650} items={[{ label: '不喜欢披萨', color: PIZ, start: t0 }, { label: '不喜欢意面', color: PAS, start: t0 }, { label: '不喜欢汤', color: SOUP, start: t0 }]} />
      <div style={{ position: 'absolute', left: PANEL, top: 150, display: 'flex', gap: 22 }}>
        {card(0, '小朋友', 24, VIO)}
        {card(1, '披萨', 20, PIZ)}
        {card(2, '意面', 18, PAS)}
        {card(3, '汤', 16, SOUP)}
      </div>
      <div style={{ position: 'absolute', left: PANEL, top: 420, width: 940, fontSize: 54, fontWeight: 700, lineHeight: 1.35, ...fadeUp(f, at(scene, 1)) }}>
        3 种都喜欢的人，<Mark on={at(scene, 1, 0.45)}>最少可能</Mark>有几个？
      </div>
      <Card y={640} start={at(scene, 2)} color={C.primary}>谁喜欢什么，由我们来安排！</Card>
    </>
  );
};

const makePause = (seconds: number, n: number, text: React.ReactNode, pills: LegendItem[]): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Kids n={n} cx={110} cy={190} cell={108} r={46} fs={48} />
      <Legend x={60} y={n === 24 ? 640 : 730} wrap={1360} items={pills} />
      <div style={{ position: 'absolute', left: 780, top: 140, width: 640, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1660} y={500} tick={TICK} label={PAUSE_LABEL} />
    </>
  );
};

const Misses: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const groups: Group[] = [
    { from: 1, to: 4, color: PIZ, start: (k) => at(scene, 1, 0.55) + (k - 1) * 6 },
    { from: 5, to: 10, color: PAS, start: (k) => at(scene, 2, 0.2) + (k - 5) * 5 },
    { from: 11, to: 18, color: SOUP, start: (k) => at(scene, 2, 0.62) + (k - 11) * 4 },
  ];
  return (
    <>
      <Kids groups={groups} />
      <Legend x={60} y={650} items={[{ label: '不喜欢披萨', color: PIZ, start: at(scene, 1, 0.5) }, { label: '不喜欢意面', color: PAS, start: at(scene, 2, 0.2) }, { label: '不喜欢汤', color: SOUP, start: at(scene, 2, 0.62) }]} />
      <Row x={PANEL} y={160} label="不喜欢披萨" color={PIZ} tex={'24 - 20 = 4'} style={fadeUp(f, at(scene, 1, 0.3))} />
      <Row x={PANEL} y={270} label="不喜欢意面" color={PAS} tex={'24 - 18 = 6'} style={fadeUp(f, at(scene, 2, 0.15))} />
      <Row x={PANEL} y={380} label="不喜欢汤" color={SOUP} tex={'24 - 16 = 8'} style={fadeUp(f, at(scene, 2, 0.6))} />
      <Card y={540} start={at(scene, 3, 0.1)} color={C.violet} size={48}>说了一次“不” → 就不是 3 种都喜欢</Card>
    </>
  );
};

const Spread: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0, 0.14);
  const tagStart = (k: number) => t0 + (k - 1) * 5;
  const groups = groupsFor(tagStart);
  const glowStart = (k: number) => at(scene, 2, 0.45) + (k - 19) * 3;
  const ans = at(scene, 5, 0.86);
  return (
    <>
      <Kids groups={groups} glow={{ from: 19, to: 24, start: glowStart }} />
      <Legend
        x={60}
        y={650}
        wrap={800}
        items={[
          { label: '不喜欢披萨', color: PIZ, start: tagStart(1) },
          { label: '不喜欢意面', color: PAS, start: tagStart(5) },
          { label: '不喜欢汤', color: SOUP, start: tagStart(11) },
          { label: '3 种都喜欢', color: GREEN, start: glowStart(19) },
        ]}
      />
      <Eq y={150} start={at(scene, 1, 0.35)} tex={`${col(PIZ, '4')} + ${col(PAS, '6')} + ${col(SOUP, '8')} = 18`} />
      <Eq y={260} start={at(scene, 2, 0.3)} tex={'24 - 18 = 6'} />
      <Check x={PANEL} y={400} start={at(scene, 3, 0.35)}><Z p={[z('披萨：'), '24 - 4 = 20']} size={50} /></Check>
      <Check x={PANEL} y={490} start={at(scene, 3, 0.55)}><Z p={[z('意面：'), '24 - 6 = 18']} size={50} /></Check>
      <Check x={PANEL} y={580} start={at(scene, 3, 0.75)}><Z p={[z('汤：'), '24 - 8 = 16']} size={50} /></Check>
      <ChoiceRow x={PANEL} y={670} start={() => at(scene, 4, 0.1)} green={ans} size={52} />
      <Answer x={1730} y={400} value="6" start={ans} chime={staticFile(`${SLUG}/sfx/fs-541985.mp3`)} />
    </>
  );
};

// ---------- solution 2: bars of 24 slots ----------

const SLOT = 34;
const BX = 100;
const Bar: React.FC<{ y: number; from: number; to: number; color: string; p: number; fromRight?: boolean; frame?: number }> = ({ y, from, to, color, p, fromRight = false }) => {
  const len = to - from + 1;
  const shown = Math.floor(p * len + 0.001);
  return (
    <>
      {range(24).map((i) => {
        const inRange = i >= from && i <= to;
        const order = fromRight ? to - i : i - from;
        const on = inRange && order < shown;
        return <rect key={i} x={BX + i * SLOT + 2} y={y} width={SLOT - 4} height={56} rx={6} fill={on ? color : '#eceff6'} stroke={on ? 'none' : '#d3d8e6'} strokeWidth={2} />;
      })}
    </>
  );
};

const Pairs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pz = ease(f, at(scene, 1, 0.08), 26);
  const pa = ease(f, at(scene, 1, 0.42), 26);
  const b1 = ease(f, at(scene, 2, 0.1), 12);
  const pv = ease(f, at(scene, 3, 0.1), 20);
  const sv = ease(f, at(scene, 3, 0.4), 20);
  const b2 = ease(f, at(scene, 4, 0.2), 12);
  const lab = (y: number, t: string, c: string, start: number) => (
    <Text x={BX} y={y} w={850} size={48} weight={900} color={c} style={{ opacity: ease(f, start, 10) }}>{t}</Text>
  );
  const bandX = (a: number, b: number) => BX + a * SLOT;
  return (
    <>
      {lab(130, '披萨：20', PIZ, at(scene, 1))}
      {lab(260, '意面：18', PAS, at(scene, 1, 0.35))}
      {lab(470, '披萨和意面都喜欢：14', VIO, at(scene, 3))}
      {lab(604, '汤：16', SOUP, at(scene, 3, 0.3))}
      <Stage>
        <g opacity={ease(f, 4, 12)}>
          <Bar y={195} from={0} to={19} color={PIZ} p={pz} />
          <Bar y={325} from={6} to={23} color={PAS} p={pa} fromRight />
          <g opacity={ease(f, at(scene, 3), 10)}>
            <Bar y={535} from={0} to={13} color={VIO} p={pv} />
            <Bar y={670} from={8} to={23} color={SOUP} p={sv} fromRight />
          </g>
        </g>
        {b1 > 0 && [191, 321].map((y) => <rect key={y} x={bandX(6, 0)} y={y} width={14 * SLOT} height={64} rx={10} fill="none" stroke={VIO} strokeWidth={7} opacity={b1} />)}
        {b2 > 0 && [531, 666].map((y) => <rect key={y} x={bandX(8, 0)} y={y} width={6 * SLOT} height={64} rx={10} fill="none" stroke={GREEN} strokeWidth={8} opacity={b2} />)}
      </Stage>
      <Pill x={bandX(6, 0) + 70} y={392} color={VIO} style={{ fontSize: 48, padding: '2px 24px', opacity: b1 }}>两种都喜欢：14</Pill>
      <Pill x={bandX(8, 0) - 110} y={736} color={GREEN} style={{ fontSize: 48, padding: '2px 24px', opacity: b2 }}>3 种都喜欢：6</Pill>
      <Eq x={1000} y={190} start={at(scene, 1, 0.6)} tex={`${col(PIZ, '20')} + ${col(PAS, '18')} = 38`} />
      <Eq x={1000} y={300} start={at(scene, 2, 0.35)} tex={`38 - 24 = ${col(VIO, '14')}`} />
      <Eq x={1000} y={540} start={at(scene, 3, 0.55)} tex={`${col(VIO, '14')} + ${col(SOUP, '16')} = 30`} />
      <Eq x={1000} y={650} start={at(scene, 4, 0.3)} tex={`30 - 24 = ${col(GREEN, '6')}`} />
    </>
  );
};

// ---------- traps ----------

const Traps: SceneComponent = ({ scene }) => {
  const red = { 1: at(scene, 1, 0.1), 4: at(scene, 2, 0.1), 3: at(scene, 4, 0.1), 0: at(scene, 5, 0.1) };
  const card = (i: number, y: number, children: React.ReactNode) => (
    <Card key={i} x={100} y={y} w={1720} start={at(scene, i, 0.2)}>{children}</Card>
  );
  return (
    <>
      <ChoiceRow x={100} y={130} start={(i) => at(scene, 0, 0.35 + i * 0.1)} red={red} green={at(scene, 6, 0.7)} size={64} />
      {card(1, 260, <>B：24 − 20 = 4 个不喜欢披萨，只是其中一个数。</>)}
      {card(2, 365, <>E：16 是喜欢汤的人数，是最多的可能。</>)}
      {card(4, 470, <>D：14 只算了披萨和意面，没加汤就停了。</>)}
      {card(5, 575, <>A：0 需要 24 个“不”，但只有 18 个。</>)}
      <Card x={100} y={700} w={1720} start={at(scene, 6, 0.2)} color={C.primary}>找全都说“是”的最少人数？去数“不”！</Card>
    </>
  );
};

// ---------- variant ----------

const VCOL = [PIZ, PAS, SOUP, VIO];

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const pills: LegendItem[] = [
    { label: '猫 25', color: VCOL[0], start: at(scene, 1, 0.5) },
    { label: '狗 22', color: VCOL[1], start: at(scene, 1, 0.8) },
    { label: '鱼 20', color: VCOL[2], start: at(scene, 2, 0.3) },
    { label: '鸟 27', color: VCOL[3], start: at(scene, 2, 0.7) },
  ];
  return (
    <>
      <Kids n={30} cx={140} cy={190} cell={108} r={46} />
      <Pill x={PANEL} y={120} color={VIO} style={{ ...fadeUp(f, 4), fontSize: 48 }}>四种最爱</Pill>
      <QBox y={220} minHeight={380} start={at(scene, 1) - 4}>
        <span style={s(1)}>一个班有 30 个小朋友，25 个喜欢猫，22 个喜欢狗，</span>
        <span style={s(2)}>20 个喜欢鱼，27 个喜欢鸟。</span>
        <span style={s(3)}>4 样都喜欢的小朋友，<Mark on={at(scene, 3, 0.55)}>最少可能有几个</Mark>？</span>
      </QBox>
      <Legend x={PANEL} y={650} wrap={960} items={pills} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const bounds: [number, number][] = [[1, 5], [6, 13], [14, 23], [24, 26]];
  const rowStart = [at(scene, 0, 0.3), at(scene, 0, 0.75), at(scene, 1, 0.2), at(scene, 1, 0.7)];
  const groups: Group[] = bounds.map(([from, to], j) => ({ from, to, color: VCOL[j], start: (k) => at(scene, 2, 0.35) + (k - 1) * 4 }));
  const glowStart = (k: number) => at(scene, 3, 0.2) + (k - 27) * 4;
  const ans = at(scene, 3, 0.86);
  const rows: [string, string, string][] = [
    ['不喜欢猫', '30 - 25 = 5', VCOL[0]],
    ['不喜欢狗', '30 - 22 = 8', VCOL[1]],
    ['不喜欢鱼', '30 - 20 = 10', VCOL[2]],
    ['不喜欢鸟', '30 - 27 = 3', VCOL[3]],
  ];
  return (
    <>
      <Kids n={30} cx={140} cy={190} cell={108} r={46} groups={groups} glow={{ from: 27, to: 30, start: glowStart }} />
      {rows.map(([label, tex, c], j) => (
        <Row key={label} x={PANEL} y={140 + j * 92} label={label} color={c} tex={tex} style={fadeUp(f, rowStart[j])} />
      ))}
      <Eq y={530} start={at(scene, 2, 0.4)} tex={`${col(VCOL[0], '5')} + ${col(VCOL[1], '8')} + ${col(VCOL[2], '10')} + ${col(VCOL[3], '3')} = 26`} size={54} />
      <Eq y={635} start={at(scene, 3, 0.3)} tex={'30 - 26 = 4'} />
      <Answer x={1760} y={560} value="4" start={ans} chime={staticFile(`${SLUG}/sfx/fs-541985.mp3`)} />
      <Card y={720} w={880} start={at(scene, 4, 0.3)} color={C.primary} size={48}>多一样 = 多数一次</Card>
      <Confetti x={1760} y={560} start={at(scene, 5, 0.25)} seed={5} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const t0 = at(scene, 1, 0.3);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: out }}>
        <Kids groups={groupsFor((k) => t0 + (k - 1) * 3)} glow={{ from: 19, to: 24, start: (k) => at(scene, 2, 0.3) + (k - 19) * 3 }} />
        <Text x={PANEL} y={160} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>核心思路</Text>
        <Card y={250} w={940} start={at(scene, 1, 0.1)} color={C.violet} size={50}>数一数每样东西的“不”</Card>
        <Card y={360} w={940} start={at(scene, 1, 0.55)} color={C.violet} size={50}>把“不”分给不同的小朋友</Card>
        <Card y={470} w={940} start={at(scene, 2, 0.2)} color={C.primary} size={50}>剩下的人样样都喜欢</Card>
        <Eq y={590} size={56} start={at(scene, 2, 0.6)} tex={[z('全都喜欢的最少人数')]} />
        <Eq y={670} size={56} start={at(scene, 2, 0.75)} tex={['=', z('总人数'), '-', z('“不”的总数')]} />
      </div>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 24, QTEXT1, countLegend(() => 0)),
  misses: Misses,
  spread: Spread,
  pairs: Pairs,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 30, QTEXT2, [
    { label: '猫 25', color: VCOL[0], start: 0 },
    { label: '狗 22', color: VCOL[1], start: 0 },
    { label: '鱼 20', color: VCOL[2], start: 0 },
    { label: '鸟 27', color: VCOL[3], start: 0 },
  ]),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

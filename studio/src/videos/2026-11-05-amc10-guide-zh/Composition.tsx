import { Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Tex } from '../../lib/Tex';
import { Answer } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ZH_FONT } from '../../lib/fonts';

export const SLUG = '2026-11-05-amc10-guide-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md

// ---------------------------------------------------------------- helpers
const win = (f: number, t0: number, t1?: number, d = 10) => ease(f, t0, d) * (t1 === undefined ? 1 : 1 - ease(f, t1, d));

/** Absolute full-frame layer that fades in at t0 (and out at t1). Children use absolute page coordinates. */
const Sh: React.FC<{ t0: number; t1?: number; children: React.ReactNode }> = ({ t0, t1, children }) => {
  const f = useCurrentFrame();
  const a = win(f, t0, t1);
  if (a <= 0) return null;
  return <div style={{ position: 'absolute', inset: 0, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>{children}</div>;
};

const Tx: React.FC<{ x: number; y: number; w?: number; size?: number; color?: string; weight?: number; align?: 'left' | 'center'; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x, y, w = 900, size = 52, color = C.ink, weight = 800, align = 'left', children, style,
}) => (
  <div style={{ position: 'absolute', left: align === 'center' ? x - w / 2 : x, top: y, width: w, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight: 1.25, ...style }}>{children}</div>
);

const Box: React.FC<{ x: number; y: number; w: number; h: number; color?: string; border?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, color = C.card, border, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: color, borderRadius: 28, boxShadow: '0 6px 22px rgba(30,40,80,0.09)', border: border ? `6px solid ${border}` : undefined, boxSizing: 'border-box', ...style }}>{children}</div>
);

const Chip: React.FC<{ x: number; y: number; color: string; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, color, size = 48, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, background: color, color: '#fff', borderRadius: 999, padding: '8px 30px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const XIcon: React.FC<{ x: number; y: number; s?: number; t0: number }> = ({ x, y, s = 90, t0 }) => {
  const f = useCurrentFrame();
  const p = ease(f, t0, 8);
  if (p <= 0) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>
      <path d="M18 18 L82 82 M82 18 L18 82" stroke={C.red} strokeWidth={16} strokeLinecap="round" />
    </svg>
  );
};

const Tick: React.FC<{ x: number; y: number; s?: number; t0: number }> = ({ x, y, s = 70, t0 }) => {
  const f = useCurrentFrame();
  const p = ease(f, t0, 8);
  if (p <= 0) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 54 54" style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>
      <circle cx={27} cy={27} r={27} fill={C.green} />
      <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Arr: React.FC<{ color?: string; w?: number }> = ({ color = C.muted, w = 70 }) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 70 35" style={{ verticalAlign: 'middle', margin: '0 10px' }}>
    <path d="M4 17.5 H60 M46 5 L62 17.5 L46 30" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A vertical bar growing up from `base`. */
const Bar: React.FC<{ x: number; base: number; h: number; w: number; color: string; t0: number; value: string; label?: string; valueInside?: boolean; labelW?: number; vo?: number }> = ({
  x, base, h, w, color, t0, value, label, valueInside, labelW = 260, vo = 8,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, t0, 16);
  if (p <= 0) return null;
  const hh = h * p;
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: base - hh, width: w, height: hh, background: color, borderRadius: '14px 14px 0 0' }} />
      <div style={{ position: 'absolute', left: x, width: w, top: valueInside ? base - hh + vo : base - hh - 66, textAlign: 'center', fontSize: 56, fontWeight: 900, color: valueInside ? '#fff' : C.ink, opacity: p }}>{value}</div>
      {label && <div style={{ position: 'absolute', left: x + w / 2 - labelW / 2, width: labelW, top: base + 10, textAlign: 'center', fontSize: 48, fontWeight: 800, color: C.ink, opacity: p }}>{label}</div>}
    </>
  );
};

const FadeAt: React.FC<{ t0: number; children: React.ReactNode }> = ({ t0, children }) => {
  const f = useCurrentFrame();
  return <span style={{ opacity: ease(f, t0, 10) }}>{children}</span>;
};

type S = { scene: Scene };

// ---------------------------------------------------------------- intro
const ScoreCard: React.FC<{ x: number; n: string; t0: number; color: string }> = ({ x, n, t0, color }) => {
  const f = useCurrentFrame();
  const s = pop(f, t0);
  return (
    <div style={{ position: 'absolute', left: x, top: 190, width: 480, height: 330, background: C.card, borderRadius: 36, boxShadow: '0 10px 30px rgba(30,40,80,0.10)', textAlign: 'center', transform: `scale(${s})`, opacity: Math.min(1, s) }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: C.ink, marginTop: 14 }}>答对</div>
      <div style={{ fontSize: 170, fontWeight: 900, color, lineHeight: 1.05 }}>{n}<span style={{ fontSize: 72, fontWeight: 800, color: C.ink }}>题</span></div>
    </div>
  );
};

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const pulse = 1 + 0.06 * Math.sin(f / 5);
  return (
    <>
      <Sh t0={0} t1={a(2, 0.05)}>
        <ScoreCard x={330} n="16" t0={a(0, 0.18)} color={C.primary} />
        <ScoreCard x={1110} n="14" t0={a(0, 0.75)} color={C.violet} />
        <Tx x={960} y={225} w={200} size={190} color={C.amber} weight={900} align="center" style={{ opacity: ease(f, a(0, 0.35), 10) }}>?</Tx>
      </Sh>
      <Sh t0={a(0, 0.72)} t1={a(1, 0)}>
        <Tx x={960} y={590} w={700} size={120} color={C.red} weight={900} align="center" style={{ transform: `scale(${pulse})` }}>更低</Tx>
      </Sh>
      <Sh t0={a(1, 0.1)} t1={a(2, 0.05)}>
        <Tx x={960} y={600} w={1600} size={60} color={C.ink} align="center">秘密就在计分规则里</Tx>
        <Tx x={960} y={700} w={1600} size={64} color={C.violet} weight={900} align="center">答对 = ?   空着 = ?   答错 = ?</Tx>
      </Sh>
      <Sh t0={a(2, 0.1)}>
        <Box x={330} y={260} w={600} h={260}><Tx x={300} y={70} w={600} size={68} align="center" color={C.primary} weight={900}>AMC 10 计分</Tx></Box>
        <Box x={990} y={260} w={600} h={260}><Tx x={300} y={70} w={600} size={68} align="center" color={C.violet} weight={900}>考试当天的计划</Tx></Box>
      </Sh>
    </>
  );
};

// ---------------------------------------------------------------- what
const What: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const days = [9, 17]; // unlabeled cells: positions only, no dates
  const cal = (
    <>
      <Box x={200} y={150} w={780} h={600}>
        <div style={{ height: 100, background: C.red, borderRadius: '28px 28px 0 0', color: '#fff', fontSize: 56, fontWeight: 900, textAlign: 'center', lineHeight: '100px' }}>11月</div>
        {range(35).map((i) => {
          const col = i % 7, row = Math.floor(i / 7);
          const d = days.indexOf(i);
          const on = d >= 0 && f >= a(1, 0.45 + d * 0.3);
          return (
            <div key={i} style={{ position: 'absolute', left: 24 + col * 104, top: 124 + row * 92, width: 92, height: 80, borderRadius: 14, background: on ? (d === 0 ? C.primary : C.violet) : '#eef0f6', color: '#fff', fontSize: 56, fontWeight: 900, textAlign: 'center', lineHeight: '80px' }}>
              {on ? (d === 0 ? 'A' : 'B') : ''}
            </div>
          );
        })}
      </Box>
    </>
  );
  return (
    <>
      <Sh t0={a(0, 0.2)} t1={a(1, 0)}>
        <Tx x={960} y={330} w={1500} size={110} color={C.primary} weight={900} align="center">十年级及以下</Tx>
      </Sh>
      <Sh t0={a(1, 0)} t1={a(3, 0)}>{cal}</Sh>
      <Sh t0={a(2, 0)} t1={a(3, 0)}>
        <Box x={1060} y={280} w={760} h={380}>
          <Tx x={30} y={40} w={700} size={60} color={C.primary} weight={900}>1场A卷</Tx>
          <Tx x={30} y={130} w={700} size={60} color={C.violet} weight={900}>+ 1场B卷</Tx>
          <Tx x={30} y={230} w={700} size={72} color={C.ink} weight={900} style={{ opacity: ease(f, a(2, 0.55), 10) }}>= 2次机会</Tx>
        </Box>
      </Sh>
      <Sh t0={a(3, 0.05)}>
        <svg width={360} height={360} viewBox="0 0 120 120" style={{ position: 'absolute', left: 220, top: 200 }}>
          <rect x={22} y={8} width={76} height={104} rx={12} fill="#4b5563" />
          <rect x={30} y={16} width={60} height={22} rx={4} fill="#d1fae5" />
          {range(12).map((i) => <rect key={i} x={32 + (i % 3) * 20} y={48 + Math.floor(i / 3) * 15} width={16} height={11} rx={3} fill="#e5e7eb" />)}
          <line x1={14} y1={106} x2={106} y2={14} stroke={C.red} strokeWidth={9} strokeLinecap="round" opacity={ease(f, a(3, 0.1), 10)} />
        </svg>
        <Tx x={400} y={600} w={500} size={64} color={C.red} weight={900} align="center">不能用计算器</Tx>
        {/* difficulty ramp */}
        <div style={{ position: 'absolute', left: 840, top: 420, width: 900, height: 120, borderRadius: 60, background: `linear-gradient(90deg, ${C.primary}, ${C.amber}, ${C.red})`, opacity: 0.9 }} />
        <Tx x={840} y={560} w={300} size={56} color={C.ink}>Q1</Tx>
        <Tx x={1440} y={560} w={300} size={56} color={C.ink} align="left" style={{ textAlign: 'right' }}>Q25</Tx>
        <Tx x={840} y={320} w={900} size={56} color={C.muted} align="center" style={{ left: 840 }}>简单 → 更难</Tx>
      </Sh>
    </>
  );
};

// ---------------------------------------------------------------- format
const Format: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const rows: { label: string; val: string; col: string; note?: React.ReactNode; t: number }[] = [
    { label: '答对', val: '+6', col: C.green, note: <FadeAt t0={a(2, 0.55)}><span style={{ fontSize: 52, fontWeight: 800 }}>满分 25 × 6 = 150</span></FadeAt>, t: a(2, 0.05) },
    { label: '答错', val: '0', col: C.red, t: a(3, 0.05) },
    { label: '空着', val: '+1.5', col: C.violet, note: <FadeAt t0={a(4, 0.58)}><span style={{ fontSize: 48, fontWeight: 800 }}>留空也有分！</span></FadeAt>, t: a(4, 0.05) },
  ];
  const blankOn = f >= a(4, 0.05);
  const pulse = blankOn ? 1 + 0.025 * Math.sin((f - a(4, 0.05)) / 5) : 1;
  return (
    <>
      <Sh t0={a(0, 0.05)}>
        <Chip x={190} y={150} color={C.primary}>25道题</Chip>
        <Chip x={720} y={150} color={C.violet}>5个选项</Chip>
        <Chip x={1150} y={150} color={C.blue}>75分钟</Chip>
      </Sh>
      <Sh t0={a(1, 0.05)}>
        <div style={{ position: 'absolute', left: 0, top: 270, width: 1920, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
          <Tex tex="75 \div 25 = 3" size={84} />
          <span style={{ fontSize: 52, fontWeight: 800 }}>分钟 / 题</span>
        </div>
      </Sh>
      {rows.map((r, i) => (
        <Sh key={i} t0={r.t}>
          <div style={{ position: 'absolute', left: 260, top: 440 + i * 130, width: 1400, height: 112, background: C.card, borderRadius: 28, boxShadow: '0 6px 22px rgba(30,40,80,0.09)', border: i === 2 ? `6px solid ${C.amber}` : undefined, boxSizing: 'border-box', transform: i === 2 ? `scale(${pulse})` : undefined, display: 'flex', alignItems: 'center', gap: 40, padding: '0 36px' }}>
            <div style={{ background: r.col, color: '#fff', borderRadius: 999, width: 230, textAlign: 'center', fontSize: 52, fontWeight: 900, padding: '4px 0' }}>{r.label}</div>
            <div style={{ fontSize: 84, fontWeight: 900, color: r.col, width: 220 }}>{r.val}</div>
            {r.note}
          </div>
        </Sh>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- hook
const CELL = 50, GAP = 4, SX = 280;
const Sheet: React.FC<{ y: number; groups: [number, string][]; t0: number; span: number }> = ({ y, groups, t0, span }) => {
  const f = useCurrentFrame();
  let k = 0;
  const cells: React.ReactNode[] = [];
  for (const [n, col] of groups)
    for (let i = 0; i < n; i++, k++) {
      const p = pop(f, t0 + Math.round((k / 25) * span));
      cells.push(<div key={k} style={{ position: 'absolute', left: SX + k * (CELL + GAP), top: y, width: CELL, height: CELL, borderRadius: 10, background: col, transform: `scale(${Math.min(1, p)})`, opacity: Math.min(1, p) }} />);
    }
  return <>{cells}</>;
};

const GREY = '#cfd4df';
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const u = CELL + GAP;
  const BASE = 815, K = 2.4;
  return (
    <>
      <Sheet y={150} groups={[[16, C.green], [9, C.red]]} t0={a(0, 0.02)} span={Math.round(scene.lines[0].frames * 0.5)} />
      <Sh t0={a(0, 0.5)}><div style={{ position: 'absolute', left: SX, top: 215 }}><Tex tex="16\times 6=96" size={56} color="#118a45" /></div></Sh>
      <Sh t0={a(0, 0.72)}><div style={{ position: 'absolute', left: SX + 16 * u, top: 215 }}><span style={{ fontSize: 52, fontWeight: 800, color: C.red, whiteSpace: 'nowrap' }}>9道错题 × 0 = 0</span></div></Sh>
      <Sheet y={330} groups={[[14, C.green], [11, GREY]]} t0={a(1, 0.02)} span={Math.round(scene.lines[1].frames * 0.4)} />
      <Sh t0={a(1, 0.2)}><div style={{ position: 'absolute', left: SX, top: 395 }}><Tex tex="14\times 6=84" size={56} color="#118a45" /></div></Sh>
      <Sh t0={a(1, 0.72)}><div style={{ position: 'absolute', left: SX + 14 * u, top: 395 }}><Tex tex="11\times 1.5=16.5" size={52} color="#6b7280" /></div></Sh>
      <Bar x={400} base={BASE} w={200} h={96 * K} color={C.red} t0={a(2, 0.02)} value="96" valueInside />
      <Bar x={680} base={BASE} w={200} h={100.5 * K} color={C.green} t0={a(2, 0.3)} value="100.5" valueInside />
      <Sh t0={a(2, 0.35)}><div style={{ position: 'absolute', left: 960, top: 650 }}><Tex tex="84+16.5=100.5" size={64} color="#118a45" /></div></Sh>
      <Sequence from={a(2, 0.9)} layout="none"><Audio src={CHIME} volume={0.3} /></Sequence>
      {f >= a(2, 0.9) && <Tick x={780} y={BASE - 100.5 * K - 45} t0={a(2, 0.9)} />}
    </>
  );
};

// ---------------------------------------------------------------- aime
const Aime: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const BASE = 800, K = 30, FROM = 90;
  const h = (v: number) => (v - FROM) * K;
  const lineY = BASE - h(100);
  return (
    <>
      <Sh t0={a(0, 0.25)}>
        <Tx x={120} y={150} w={800} size={130} color={C.primary} weight={900}>100</Tx>
      </Sh>
      <Sh t0={a(1, 0.05)}>
        <Tx x={120} y={330} w={900} size={48} color={C.muted}>2026–27 赛季规则 · 以官方公布为准</Tx>
        <Bar x={150} base={BASE} w={180} h={h(96)} color={C.red} t0={a(1, 0.1)} value="96" valueInside />
        <Bar x={400} base={BASE} w={180} h={h(100.5)} color={C.green} t0={a(1, 0.25)} value="100.5" valueInside labelW={180} vo={40} />
        <div style={{ position: 'absolute', left: 100, top: lineY - 3, width: 800, borderTop: `6px dashed ${C.ink}`, opacity: ease(f, a(1, 0.4), 10) }} />
        <Tx x={620} y={lineY - 62} w={300} size={48} color={C.ink} style={{ opacity: ease(f, a(1, 0.65), 10), whiteSpace: 'nowrap' }}>AIME晋级线</Tx>
        <Tick x={490} y={lineY - 70} t0={a(1, 0.8)} />
        <XIcon x={240} y={BASE - h(96) - 60} s={70} t0={a(1, 0.85)} />
      </Sh>
      <Sh t0={a(2, 0.1)}>
        <Box x={1000} y={150} w={840} h={380}>
          <Chip x={30} y={30} color={C.violet}>AIME</Chip>
          <Tx x={30} y={140} w={780} size={56} style={{ opacity: ease(f, a(2, 0.4), 10) }}>15道题 · 3小时</Tx>
          <Tx x={30} y={250} w={780} size={50} color={C.violet} style={{ opacity: ease(f, a(3, 0.1), 10) }}>答案：0–999 的整数</Tx>
        </Box>
      </Sh>
      <Sh t0={a(4, 0.1)}>
        <Box x={1000} y={590} w={840} h={150} border={C.green}>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: 24, fontSize: 52, fontWeight: 900 }}>
            答对14题，0错<Arr color={C.green} w={60} />100.5
          </div>
        </Box>
        <Tick x={1790} y={665} t0={a(4, 0.5)} />
      </Sh>
    </>
  );
};

// ---------------------------------------------------------------- guess charts
const BASE_G = 760, KG = 110;
const GuessChart: React.FC<{ t: { blank: number; wild: number; one?: number; two?: number } }> = ({ t }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Tx x={150} y={330} w={960} size={52} color={C.muted}>平均得分</Tx>
      <div style={{ position: 'absolute', left: 140, top: BASE_G, width: 980, borderTop: `5px solid ${C.line}` }} />
      <Bar x={170} base={BASE_G} w={170} h={1.5 * KG} color={C.blue} t0={t.blank} value="1.5" label="空着" />
      <Bar x={430} base={BASE_G} w={170} h={1.2 * KG} color={C.red} t0={t.wild} value="1.2" label="乱猜" valueInside />
      {t.one !== undefined && <Bar x={690} base={BASE_G} w={170} h={1.5 * KG} color={C.blue} t0={t.one} value="1.5" label="排除1个" />}
      {t.two !== undefined && <Bar x={950} base={BASE_G} w={170} h={2 * KG} color={C.green} t0={t.two} value="2" label="排除2个" />}
      <div style={{ position: 'absolute', left: 140, top: BASE_G - 1.5 * KG - 2, width: 980, borderTop: `4px dashed ${C.muted}`, opacity: 0.5 * ease(f, t.blank + 10, 10) }} />
    </>
  );
};

const Chips5: React.FC<{ x: number; y: number; t0: number; hi?: number; hiT?: number; crossed: [number, number][] }> = ({ x, y, t0, hi, hiT = 0, crossed }) => {
  const f = useCurrentFrame();
  return (
    <>
      {range(5).map((i) => {
        const on = hi === i && f >= hiT;
        const c = crossed.find(([k]) => k === i);
        return (
          <div key={i} style={{ position: 'absolute', left: x + i * 134, top: y, width: 120, height: 110, borderRadius: 22, background: on ? C.green : C.card, color: on ? '#fff' : C.ink, border: `4px solid ${on ? C.green : C.line}`, fontSize: 60, fontWeight: 900, textAlign: 'center', lineHeight: '102px', opacity: c ? 0.55 : 1, ...fadeUp(f, t0 + i * 3, 10) }}>
            {'ABCDE'[i]}
          </div>
        );
      })}
      {crossed.map(([i, t]) => <XIcon key={i} x={x + i * 134 + 60} y={y + 55} s={90} t0={t} />)}
    </>
  );
};

const Guess: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <GuessChart t={{ blank: a(1, 0.35), wild: a(2, 0.75) }} />
      <Sh t0={a(0, 0.4)} t1={a(1, 0.3)}>
        <Tx x={1500} y={400} w={640} size={72} color={C.violet} weight={900} align="center">猜，还是空着？</Tx>
      </Sh>
      <Sh t0={a(2, 0.05)}>
        <Chips5 x={1180} y={250} t0={a(2, 0.05)} hi={2} hiT={a(2, 0.3)} crossed={[]} />
        <Tx x={1180} y={375} w={700} size={48} color={C.muted} style={{ opacity: ease(f, a(2, 0.3), 10) }}>5个选项里有1个对</Tx>
      </Sh>
      <Sh t0={a(2, 0.48)}>
        <div style={{ position: 'absolute', left: 1180, top: 450 }}><Tex tex="6\times\dfrac{1}{5}=1.2" size={72} /></div>
      </Sh>
      <Sh t0={a(3, 0.2)}>
        <div style={{ position: 'absolute', left: 1180, top: 650 }}><Tex tex="1.2<1.5" size={80} color={C.red} /></div>
        <Tx x={1180} y={765} w={700} size={56} color={C.red} weight={900}>乱猜不划算</Tx>
      </Sh>
    </>
  );
};

const Guess2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <GuessChart t={{ blank: -100, wild: -100, one: a(1, 0.2), two: a(2, 0.6) }} />
      <Sh t0={0} t1={a(3, 0)}>
        <Chips5 x={1180} y={250} t0={0} crossed={[[4, a(0, 0.12)], [3, a(2, 0.1)]]} />
      </Sh>
      <Sh t0={a(0, 0.3)} t1={a(2, 0.05)}>
        <Tx x={1180} y={370} w={700} size={56} color={C.muted}>4分之1</Tx>
        <div style={{ position: 'absolute', left: 1180, top: 470, opacity: ease(f, a(1, 0.0), 10) }}><Tex tex="\dfrac{6}{4}=1.5" size={80} /></div>
        <Tx x={1180} y={680} w={700} size={72} color={C.blue} weight={900} style={{ opacity: ease(f, a(1, 0.8), 10) }}>打平</Tx>
      </Sh>
      <Sh t0={a(2, 0.25)} t1={a(3, 0)}>
        <Tx x={1180} y={370} w={700} size={56} color={C.muted}>3分之1</Tx>
        <div style={{ position: 'absolute', left: 1180, top: 470, opacity: ease(f, a(2, 0.5), 10) }}><Tex tex="\dfrac{6}{3}=2" size={80} /></div>
        <Tx x={1180} y={680} w={700} size={64} color={C.green} weight={900} style={{ opacity: ease(f, a(2, 0.85), 10) }}>猜就赚了</Tx>
      </Sh>
      <Sh t0={a(3, 0.1)}>
        <Box x={1180} y={250} w={650} h={300}>
          <div style={{ padding: '40px 36px', fontSize: 58, fontWeight: 900, lineHeight: 1.3 }}>
            <div style={{ color: C.green }}>能排除2个<Arr color={C.green} w={60} />猜。</div>
            <div style={{ color: C.blue, marginTop: 40, opacity: ease(f, a(3, 0.55), 10) }}>否则<Arr color={C.blue} w={60} />空着。</div>
          </div>
        </Box>
      </Sh>
    </>
  );
};

// ---------------------------------------------------------------- plan
const Plan: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const W = 1500, X0 = 200, seg = (20 / 75) * W;
  const cell = (x: number, y: number, label: string, color: string, extra?: React.ReactNode) => (
    <div style={{ position: 'absolute', left: x, top: y, width: 150, height: 130, borderRadius: 24, background: color, color: '#fff', fontSize: 56, fontWeight: 900, textAlign: 'center', lineHeight: '130px' }}>
      {label}
      {extra}
    </div>
  );
  return (
    <>
      <Sh t0={a(0, 0.05)}>
        <div style={{ position: 'absolute', left: X0, top: 230, width: W, height: 70, background: '#e6e9f2', borderRadius: 35 }} />
        <div style={{ position: 'absolute', left: X0, top: 230, width: seg * ease(f, a(0, 0.4), 20), height: 70, background: C.primary, borderRadius: 35 }} />
        <Tx x={X0 + W + 20} y={236} w={200} size={48} color={C.muted}>75分钟</Tx>
        <Tx x={X0} y={150} w={900} size={48} color={C.primary} style={{ opacity: ease(f, a(0, 0.6), 10), whiteSpace: 'nowrap' }}>前10题 ≈ 20分钟</Tx>
      </Sh>
      <Sh t0={a(1, 0)} t1={a(2, 0)}>
        {cell(560, 400, '', '#fbd5d5')}
        <XIcon x={635} y={465} s={110} t0={a(1, 0.45)} />
        <Tx x={760} y={385} w={1000} size={64} color={C.red} weight={900}>粗心一错：丢掉6分</Tx>
        <Tx x={760} y={470} w={1000} size={48} color={C.muted}>发生在简单题上</Tx>
      </Sh>
      <Sh t0={a(2, 0)} t1={a(3, 0)}>
        {cell(300, 420, '简单', C.primary)}
        {cell(480, 420, '简单', C.primary)}
        {cell(660, 420, '简单', C.primary)}
        <Tick x={375} y={400} t0={a(2, 0.2)} />
        <Tick x={555} y={400} t0={a(2, 0.35)} />
        <Tick x={735} y={400} t0={a(2, 0.5)} />
        <div style={{ position: 'absolute', left: 860, top: 440, opacity: ease(f, a(2, 0.6), 10) }}><Arr color={C.ink} w={110} /></div>
        {cell(1050, 420, '难题', C.violet)}
        <Tx x={300} y={600} w={1200} size={52} color={C.ink}>先检查简单题</Tx>
      </Sh>
      <Sh t0={a(3, 0)} t1={a(4, 0)}>
        {range(5).map((i) => cell(300 + i * 170, 400, `Q${21 + i}`, i === 3 ? C.violet : '#aab1c2'))}
        <Chip x={750} y={560} color={C.violet} style={{ opacity: ease(f, a(3, 0.5), 10) }}>你擅长的题</Chip>
      </Sh>
      <Sh t0={a(4, 0)}>
        {['估算', '看大小', '代入选项'].map((t, i) => (
          <Chip key={i} x={[260, 700, 1220][i]} y={470} color={[C.primary, C.blue, C.violet][i]} size={52} style={{ opacity: ease(f, a(4, 0.15 + i * 0.22), 10) }}>{t}</Chip>
        ))}
      </Sh>
    </>
  );
};

// ---------------------------------------------------------------- try
const CH = ['2^{12}', '2^{40}', '8^{10}', '4^{40}', '2^{14}'];
const CX = (i: number) => 255 + i * 290;
const QCard: React.FC = () => (
  <>
    <Box x={260} y={140} w={1400} h={230}>
      <Chip x={30} y={-26} color={C.violet} size={44}>AMC 10 风格</Chip>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center' }}>
        <Tex tex="2^{10}+2^{10}+2^{10}+2^{10}=\,?" size={84} />
      </div>
    </Box>
  </>
);

const ChoiceChip: React.FC<{ i: number; t0: number; border?: string; glow?: boolean }> = ({ i, t0, border, glow }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: CX(i), top: 410, width: 250, height: 110, borderRadius: 22, background: glow ? C.primarySoft : C.card, border: `5px solid ${border ?? C.line}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, ...fadeUp(f, t0, 10) }}>
      <span style={{ color: C.muted, fontSize: 40, fontWeight: 800 }}>{'ABCDE'[i]}</span>
      <Tex tex={CH[i]} size={56} />
    </div>
  );
};

const Try: SceneComponent = ({ scene }) => {
  const a = (i: number, t = 0) => at(scene, i, t);
  const cues = [a(1, 0.1), a(1, 0.4), a(1, 0.7), a(2, 0.1), a(2, 0.5)];
  return (
    <>
      <Sh t0={a(0, 0.35)}><QCard /></Sh>
      {range(5).map((i) => <ChoiceChip key={i} i={i} t0={cues[i]} />)}
    </>
  );
};

const TrySolve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const red = (i: number, t: number) => (f >= t ? C.red : undefined);
  const tags: [number, string, number][] = [[1, '太大', a(1, 0.45)], [3, '太大', a(1, 0.6)], [2, '太大', a(2, 0.55)], [4, '太大', a(3, 0.55)]];
  const xs: [number, number][] = [[1, a(1, 0.5)], [3, a(1, 0.65)], [2, a(2, 0.6)], [4, a(3, 0.6)]];
  const Rw: React.FC<{ y: number; t0: number; t1?: number; tex: string; col?: string }> = ({ y, t0, t1, tex, col }) => (
    <Sh t0={t0} t1={t1}><div style={{ position: 'absolute', left: 300, top: y }}><Tex tex={tex} size={72} color={col} /></div></Sh>
  );
  return (
    <>
      <QCard />
      {range(5).map((i) => {
        const x = xs.find(([k]) => k === i);
        const glow = i === 0 && f >= a(4, 0.1);
        return <ChoiceChip key={i} i={i} t0={-20} border={glow ? C.green : x && f >= x[1] ? C.red : undefined} glow={glow} />;
      })}
      {xs.map(([i, t]) => <XIcon key={i} x={CX(i) + 222} y={428} s={52} t0={t} />)}
      {tags.map(([i, txt, t]) => (
        <Sh key={i + txt} t0={t}><Tx x={CX(i) - 20} y={530} w={290} size={52} color={C.red} weight={900} align="center" style={{ left: CX(i) - 20 }}>{txt}</Tx></Sh>
      ))}
      <Rw y={600} t0={a(0, 0.55)} t1={a(2, 0.3)} tex="2^{10}\approx 1{,}000" />
      <Rw y={710} t0={a(0, 0.8)} t1={a(2, 0.3)} tex="4\times 1{,}000\approx 4{,}000" />
      <Rw y={600} t0={a(2, 0.4)} t1={a(4, 0)} tex="8^{10}=2^{30}" col={C.red} />
      <Rw y={710} t0={a(3, 0.3)} t1={a(4, 0)} tex="2^{14}>16{,}000" col={C.red} />
      <Rw y={600} t0={a(5, 0.05)} tex="4=2^2" />
      <Rw y={710} t0={a(5, 0.3)} tex="2^2\cdot 2^{10}=2^{12}" />
      <Answer x={1620} y={720} value="A" start={a(5, 0.9)} chime={CHIME} />
    </>
  );
};

// ---------------------------------------------------------------- prepare
const Prepare: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const Card: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => (
    <Sh t0={a(i, 0.05)}>
      <Box x={280} y={150 + i * 166} w={1450} h={150}>
        <div style={{ position: 'absolute', left: 28, top: 38 }}><svg width={64} height={64} viewBox="0 0 54 54"><circle cx={27} cy={27} r={27} fill={C.primary} /><path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        {children}
      </Box>
    </Sh>
  );
  const topics = ['代数', '几何', '计数', '数论'];
  const thumbs = ['2026-10-30-geometric-triangle-zh'];
  return (
    <>
      <Card i={0}>
        <Tx x={120} y={36} w={760} size={50}>历年 AMC 10 真题</Tx>
        <Chip x={920} y={36} color={C.blue}>75分钟计时</Chip>
      </Card>
      <Card i={1}>
        <Tx x={120} y={10} w={1000} size={50}>记录你的分数</Tx>
        <Tx x={120} y={76} w={1300} size={48} color={C.muted} weight={700}>分从哪里来 · 又在哪里丢</Tx>
      </Card>
      <Card i={2}>
        <Tx x={120} y={8} w={900} size={50}>复盘每一道错题</Tx>
        {topics.map((t, k) => <Chip key={t} x={[120, 370, 650, 940][k]} y={78} size={44} color={[C.primary, C.violet, C.blue, C.amber][k]} style={{ padding: '2px 22px', ...fadeUp(f, a(2, 0.4 + k * 0.12), 10) }}>{t}</Chip>)}
      </Card>
      <Card i={3}>
        <Tx x={120} y={44} w={800} size={50}>Vantee 的 AMC 10 风格讲解视频</Tx>
        {thumbs.map((t, k) => <Img key={t} src={staticFile(`${SLUG}/thumbs/${t}.jpg`)} style={{ position: 'absolute', left: 900 + k * 180, top: 25, width: 168, height: 100, objectFit: 'cover', borderRadius: 12, ...fadeUp(f, a(3, 0.35 + k * 0.15), 10) }} />)}
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- recap
const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <Sh t0={a(0, 0.05)} t1={a(2, 0)}>
        <Chip x={160} y={160} color={C.green} size={56}>答对 +6</Chip>
        <Chip x={680} y={160} color={C.violet} size={56} style={{ opacity: ease(f, a(0, 0.35), 10) }}>空着 +1.5</Chip>
        <Chip x={1230} y={160} color={C.red} size={56} style={{ opacity: ease(f, a(0, 0.7), 10) }}>答错 0</Chip>
      </Sh>
      <Sh t0={a(1, 0.05)} t1={a(2, 0)}>
        {['100分 → 晋级AIME', '准确第一', '排除2个，再猜'].map((t, i) => (
          <Box key={t} x={360} y={330 + i * 150} w={1200} h={125} style={{ opacity: ease(f, a(1, 0.05 + i * 0.35), 10) }}>
            <Tx x={600} y={26} w={1200} size={60} color={[C.primary, C.blue, C.violet][i]} weight={900} align="center">{t}</Tx>
          </Box>
        ))}
      </Sh>
      <SignOff start={a(2, 0.1)} text="考试加油！" tagline="你的家庭 AI 教练" />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  what: What,
  format: Format,
  hook: Hook,
  aime: Aime,
  guess: Guess,
  guess2: Guess2,
  plan: Plan,
  try: Try,
  'try-solve': TrySolve,
  prepare: Prepare,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 备考指南" font={ZH_FONT} /> : null;

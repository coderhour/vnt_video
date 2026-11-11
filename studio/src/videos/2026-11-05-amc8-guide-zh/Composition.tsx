import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Tex } from '../../lib/Tex';
import { Answer, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ZH_FONT } from '../../lib/fonts';
import { C } from '../../lib/theme';

export const SLUG = '2026-11-05-amc8-guide-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

type P = { scene: Scene };
const L = 330; // left edge of the stage (the watermark owns x < 300 at the bottom)

// ------------------------------------------------------------ small pieces
const Card: React.FC<{ x: number; y: number; w: number; h: number; start: number; color?: string; border?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({
  x, y, w, h, start, color = C.card, border, children, style,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: color, borderRadius: 24, boxShadow: '0 6px 22px rgba(30,40,80,0.09)', border: border ? `5px solid ${border}` : undefined, boxSizing: 'border-box', display: 'flex', alignItems: 'center', ...fadeUp(f, start), ...style }}>
      {children}
    </div>
  );
};

const Heading: React.FC<{ n: number; sub: string; start: number }> = ({ n, sub, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: L, top: 120, display: 'flex', alignItems: 'baseline', gap: 28, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <span style={{ fontSize: 84, fontWeight: 900, color: C.violet }}>策略{'零一二三四'[n]}</span>
      <span style={{ fontSize: 56, fontWeight: 800, color: C.ink }}>{sub}</span>
    </div>
  );
};

/** Red X over a box (absolute, centred at cx, cy). */
const RedX: React.FC<{ cx: number; cy: number; r?: number; start: number }> = ({ cx, cy, r = 34, start }) => {
  const f = useCurrentFrame();
  const s = pop(f, start, 30);
  if (s <= 0) return null;
  return (
    <svg style={{ position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, transform: `scale(${s})` }} viewBox="-40 -40 80 80">
      <circle r={36} fill={C.red} />
      <path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
    </svg>
  );
};

const Tick: React.FC<{ cx: number; cy: number; r?: number; start: number }> = ({ cx, cy, r = 34, start }) => {
  const f = useCurrentFrame();
  const s = pop(f, start, 30);
  if (s <= 0) return null;
  return (
    <svg style={{ position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, transform: `scale(${s})` }} viewBox="-40 -40 80 80">
      <circle r={36} fill={C.green} />
      <path d="M-18 0 L-6 13 L18 -13" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Bubble: React.FC<{ letter?: string; size?: number; filled?: boolean; fillT?: number; hot?: boolean }> = ({ letter, size = 80, filled, fillT = 0, hot }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', border: `5px solid ${hot ? C.amber : C.ink}`, boxSizing: 'border-box', background: filled ? C.ink : hot ? 'rgba(245,159,10,0.15)' : '#fff', opacity: filled ? 0.35 + 0.65 * fillT : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 800, color: C.ink }}>
    {letter}
  </div>
);

// ------------------------------------------------------------ intro
const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = pop(f, 4, 30);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontSize: 240, fontWeight: 900, lineHeight: 1.1, transform: `scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s) }}>
        <span style={{ color: C.primary }}>AMC</span> <span style={{ color: C.violet }}>8</span>
      </div>
      <Pill x={420} y={430} color={C.primary} style={{ fontSize: 64, padding: '16px 44px', ...fadeUp(f, at(scene, 1, 0.0)) }}>25道题</Pill>
      <Pill x={1010} y={430} color={C.violet} style={{ fontSize: 64, padding: '16px 44px', ...fadeUp(f, at(scene, 1, 0.3)) }}>40分钟</Pill>
      <Card x={560} y={600} w={800} h={170} start={at(scene, 1, 0.7)} border={C.amber}>
        <div style={{ width: 120, height: 120, marginLeft: 30, borderRadius: '50%', background: C.amber, color: '#fff', fontSize: 100, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginLeft: 36, lineHeight: 1.15 }}>1条规则<br />很多同学都忽略</div>
      </Card>
      <Text x={960} y={800} w={900} align="center" size={52} color={C.muted} style={fadeUp(f, at(scene, 2, 0.05))}>你好，我是 Vantee！</Text>
    </>
  );
};

// ------------------------------------------------------------ what
const Calc: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg style={{ position: 'absolute', left: x, top: y }} width={150} height={210} viewBox="0 0 150 210">
    <rect x={4} y={4} width={142} height={202} rx={18} fill="#e9ecf4" stroke={C.ink} strokeWidth={5} />
    <rect x={20} y={20} width={110} height={44} rx={8} fill="#fff" stroke={C.ink} strokeWidth={4} />
    {range(12).map((i) => <rect key={i} x={20 + (i % 3) * 38} y={80 + Math.floor(i / 3) * 30} width={30} height={22} rx={5} fill={C.muted} />)}
  </svg>
);
const Slash: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12);
  return (
    <svg style={{ position: 'absolute', left: x, top: y }} width={150} height={210} viewBox="0 0 150 210">
      <circle cx={75} cy={105} r={92} fill="none" stroke={C.red} strokeWidth={14} opacity={p} />
      <line x1={10} y1={170} x2={10 + 130 * p} y2={170 - 130 * p - 2} stroke={C.red} strokeWidth={14} strokeLinecap="round" />
    </svg>
  );
};
const Pencil: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg style={{ position: 'absolute', left: x, top: y }} width={200} height={90} viewBox="0 0 200 90">
    <g transform="rotate(-25 100 45)">
      <rect x={20} y={30} width={120} height={30} fill={C.amber} />
      <rect x={10} y={30} width={14} height={30} fill="#f08a96" />
      <polygon points="140,30 140,60 185,45" fill="#f3d9b1" />
      <polygon points="173,40 173,50 185,45" fill={C.ink} />
    </g>
  </svg>
);
const Paper: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg style={{ position: 'absolute', left: x, top: y }} width={150} height={200} viewBox="0 0 150 200">
    <rect x={6} y={6} width={138} height={188} rx={8} fill="#fff" stroke={C.ink} strokeWidth={5} />
    {range(6).map((i) => <line key={i} x1={26} x2={124} y1={42 + i * 26} y2={42 + i * 26} stroke={C.line} strokeWidth={5} />)}
  </svg>
);

const What: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const words = ['American', 'Mathematics', 'Competitions'];
  const t0 = at(scene, 0, 0.05);
  const a1 = at(scene, 1, 0.15);
  const c2 = at(scene, 2, 0.0);
  const c3 = at(scene, 3, 0.0);
  const c4 = at(scene, 4, 0.0);
  const widths = [240, 340, 360];
  return (
    <>
      <div style={{ position: 'absolute', left: L, top: 110, display: 'flex', gap: 34, alignItems: 'baseline', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 90, fontWeight: 900, color: C.primary, ...fadeUp(f, t0 - 4) }}>AMC =</div>
        {words.map((w, i) => (
          <div key={w} style={{ fontSize: 62, fontWeight: 800, ...fadeUp(f, t0 + 8 + i * 12) }}>
            <span style={{ color: C.violet, fontSize: 84, fontWeight: 900 }}>{w[0]}</span>
            {w.slice(1)}
          </div>
        ))}
      </div>
      <Pill x={L} y={250} color={C.violet} style={{ fontSize: 56, ...fadeUp(f, a1) }}>八年级及以下</Pill>
      <Text x={L + 520} y={258} w={700} size={56} weight={800} color={C.muted} style={fadeUp(f, t0 + 40)}>美国数学竞赛</Text>
      {/* calendar */}
      <Card x={L} y={375} w={300} h={270} start={c2} style={{ flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden' }}>
        <div style={{ background: C.red, color: '#fff', fontSize: 52, fontWeight: 900, textAlign: 'center', padding: '10px 0' }}>1月</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: 18 }}>
          {range(28).map((i) => <div key={i} style={{ height: 24, borderRadius: 5, background: i === 17 ? C.amber : C.line }} />)}
        </div>
      </Card>
      <Text x={L + 330} y={450} w={820} size={46} style={fadeUp(f, at(scene, 2, 0.4))}>在你的学校或其他考点</Text>
      {/* calculator crossed, pencil, paper */}
      <div style={{ opacity: ease(f, c3, 10) }}>
        <Calc x={1180} y={385} />
        <Slash x={1180} y={385} start={c3 + 10} />
      </div>
      <div style={{ opacity: ease(f, c3 + 22, 10) }}>
        <Pencil x={1390} y={470} />
        <Paper x={1620} y={395} />
      </div>
      {/* difficulty ramp */}
      <div style={{ position: 'absolute', left: L, top: 650, width: 1500, height: 170 }}>
        {range(25).map((i) => {
          const p = ease(f, c4 + i * 1.2, 10);
          const h = (20 + i * 2.6) * p;
          const col = `hsl(${160 - i * 1.6}, ${70 - i * 0.3}%, ${62 - i * 1.8}%)`;
          return <div key={i} style={{ position: 'absolute', left: i * 60 + 6, bottom: 56, width: 48, height: h, background: col, borderRadius: '8px 8px 0 0' }} />;
        })}
        <div style={{ position: 'absolute', left: 0, bottom: 0, fontSize: 48, fontWeight: 900, color: C.primary, opacity: ease(f, c4 + 10) }}>Q1</div>
        <div style={{ position: 'absolute', right: 0, bottom: 0, fontSize: 48, fontWeight: 900, color: C.violet, opacity: ease(f, c4 + 40) }}>Q25</div>
      </div>
    </>
  );
};

// ------------------------------------------------------------ format
const Format: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g0 = at(scene, 0, 0.0);
  const bub = at(scene, 0, 0.55);
  const c1 = at(scene, 1, 0.0);
  const c2 = at(scene, 2, 0.0);
  const gridOp = fadeTo(f, c1 - 4, 0);
  return (
    <>
      <div style={{ opacity: gridOp }}>
        {range(25).map((i) => (
          <div key={i} style={{ position: 'absolute', left: L + (i % 5) * 112, top: 130 + Math.floor(i / 5) * 112, width: 100, height: 100, borderRadius: 16, background: C.card, border: `4px solid ${C.line}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 800, ...fadeUp(f, g0 + i * 2.2, 10) }}>
            {i + 1}
          </div>
        ))}
        <Card x={1000} y={230} w={680} h={310} start={bub} style={{ flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: C.muted }}>每题5个选项</div>
          <div style={{ display: 'flex', gap: 14 }}>
            {'ABCDE'.split('').map((l, i) => <div key={l} style={fadeUp(f, bub + 6 + i * 5)}><Bubble letter={l} size={96} filled={false} /></div>)}
          </div>
        </Card>
      </div>
      {/* clock */}
      <Card x={L + 100} y={170} w={560} h={300} start={c1 + 4} style={{ justifyContent: 'center', gap: 30 }}>
        <svg width={150} height={150} viewBox="-75 -75 150 150">
          <circle r={68} fill="#fff" stroke={C.ink} strokeWidth={8} />
          <line x1={0} y1={0} x2={0} y2={-50} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={34} y2={0} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 120, fontWeight: 900, color: C.violet }}>40:00</div>
      </Card>
      <Card x={L + 100} y={520} w={1260} h={160} start={at(scene, 1, 0.45)} style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, whiteSpace: 'nowrap' }}>40分钟 ÷ 25题 = 96秒/题</div>
      </Card>
      <Pill x={L + 800} y={190} color={C.primary} style={{ fontSize: 72, padding: '18px 44px', ...fadeUp(f, c2) }}>每题 +1 分</Pill>
      <Pill x={L + 800} y={340} color={C.violet} style={{ fontSize: 72, padding: '18px 44px', ...fadeUp(f, at(scene, 2, 0.5)) }}>满分 25 分</Pill>
    </>
  );
};

// ------------------------------------------------------------ rule
const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows: { label: string; val: string; col: string; t: number }[] = [
    { label: '答对', val: '+1', col: C.green, t: at(scene, 0, 0.0) },
    { label: '答错', val: '0', col: C.ink, t: at(scene, 0, 0.25) },
    { label: '空着', val: '0', col: C.ink, t: at(scene, 1, 0.0) },
  ];
  const stamp = at(scene, 0, 0.62);
  const sp = pop(f, stamp, 30);
  const ch = at(scene, 2, 0.0);
  const cross = at(scene, 2, 0.42);
  const third = at(scene, 2, 0.72);
  const one5 = ease(f, ch + 20, 10) * (1 - ease(f, cross + 20, 10));
  return (
    <>
      {rows.map((r, i) => (
        <Card key={r.label} x={L} y={120 + i * 135} w={760} h={115} start={r.t} border={r.col === C.green ? C.green : undefined}>
          <div style={{ fontSize: 60, fontWeight: 900, marginLeft: 40, width: 300, color: r.col }}>{r.label}</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: r.col }}>{r.val}</div>
        </Card>
      ))}
      {sp > 0 && (
        <div style={{ position: 'absolute', left: 1170, top: 190, transform: `rotate(-9deg) scale(${0.6 + 0.4 * sp})`, opacity: Math.min(1, sp), border: `10px solid ${C.red}`, borderRadius: 18, color: C.red, fontSize: 92, fontWeight: 900, padding: '8px 36px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          不扣分
        </div>
      )}
      <Pill x={1130} y={400} color={C.violet} style={{ fontSize: 64, padding: '14px 36px', ...fadeUp(f, at(scene, 1, 0.5)) }}>一个猜测只会有好处</Pill>
      {/* choice chips */}
      {'ABCDE'.split('').map((l, i) => {
        const x = L + i * 150;
        const out = i === 1 || i === 3;
        return (
          <div key={l}>
            <div style={{ position: 'absolute', left: x, top: 610, width: 120, height: 120, borderRadius: 24, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, opacity: ease(f, ch + i * 3) * (out ? fadeTo(f, cross + i, 0.35) : 1), ...fadeUp(f, ch + i * 3) }}>
              {l}
            </div>
            {out && <RedX cx={x + 60} cy={670} r={44} start={cross + (i === 1 ? 0 : 8)} />}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: L + 800, top: 600, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap' }}>
        <div style={{ opacity: one5, position: 'absolute', display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 64, fontWeight: 900 }}>5分之1</span><Tex tex={'= \\dfrac{1}{5}'} size={72} />
        </div>
        <div style={{ opacity: ease(f, third, 10), display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: C.primary }}>3分之1</span><Tex tex={'= \\dfrac{1}{3}'} size={72} color={C.primary} />
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------ awards
const Awards: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tiers = [
    { w: 380, y: 130, col: C.amber, label: '前1%', t: at(scene, 1, 0.0), side: '杰出荣誉榜' },
    { w: 660, y: 280, col: C.violet, label: '前5%', t: at(scene, 0, 0.1), side: '荣誉榜' },
    { w: 940, y: 430, col: '#c9cfdd', label: '所有参赛者', t: at(scene, 0, 0.0), side: '' },
  ];
  return (
    <>
      {tiers.map((t) => (
        <div key={t.label}>
          <div style={{ position: 'absolute', left: L + (940 - t.w) / 2, top: t.y, width: t.w, height: 130, borderRadius: 20, background: t.col, color: t.col === '#c9cfdd' ? C.ink : '#fff', fontSize: 60, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, t.t) }}>
            {t.label}
          </div>
          {t.side && (
            <div style={{ position: 'absolute', left: L + 1010, top: t.y + (t.label === '前1%' ? -10 : 20), width: 540, fontSize: 56, fontWeight: 900, lineHeight: 1.15, color: t.col, ...fadeUp(f, t.t + 8) }}>{t.side}</div>
          )}
        </div>
      ))}
    </>
  );
};

// ------------------------------------------------------------ pace
const Flag: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg style={{ position: 'absolute', left: x, top: y }} width={90} height={110} viewBox="0 0 90 110">
    <line x1={14} y1={8} x2={14} y2={104} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    <path d="M14 10 L80 28 L14 56 Z" fill={C.red} />
  </svg>
);

const Pace: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s1 = at(scene, 1, 0.1);
  const s2 = at(scene, 2, 0.1);
  const s3 = at(scene, 3, 0.0);
  const p1 = ease(f, s1, 18);
  const p2 = ease(f, s2, 24);
  return (
    <>
      <Heading n={1} sub="控制节奏" start={at(scene, 0, 0.1)} />
      <div style={{ position: 'absolute', left: L, top: 290, width: 1500, height: 110, borderRadius: 24, background: C.line, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 375 * p1, background: C.primary, color: '#fff', fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{p1 > 0.7 ? '10分钟' : ''}</div>
        <div style={{ position: 'absolute', left: 375, top: 0, height: '100%', width: 1125 * p2, background: C.violet, color: '#fff', fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{p2 > 0.7 ? '30分钟' : ''}</div>
      </div>
      <Text x={L} y={410} w={375} size={52} weight={800} color={C.primary} style={{ opacity: p1 }}>第1–10题</Text>
      <Text x={L + 375} y={410} w={1125} size={52} weight={800} color={C.violet} style={{ opacity: p2 }}>第11–25题 · 难题都在这里</Text>
      <Card x={L} y={560} w={560} h={190} start={s3} border={C.amber}>
        <div style={{ marginLeft: 36, marginRight: 24, width: 90, height: 110, position: 'relative' }}><Flag x={0} y={0} /></div>
        <div style={{ fontSize: 56, fontWeight: 900 }}>第17题</div>
      </Card>
      <div style={{ position: 'absolute', left: L + 620, top: 555, width: 1000, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, s3 + 10) }}>
        <span style={{ color: C.red }}>卡住2分钟</span> → 在试卷上圈出来，先跳过，回头再做
      </div>
    </>
  );
};

// ------------------------------------------------------------ read
const Read: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const q = at(scene, 1, 0.0);
  const circ = at(scene, 1, 0.12);
  const alt = at(scene, 1, 0.5);
  const c3 = at(scene, 2, 0.0);
  const cp = ease(f, circ, 14);
  const wrongTag = at(scene, 2, 0.35);
  return (
    <>
      <Heading n={2} sub="题目读两遍" start={at(scene, 0, 0.1)} />
      <Card x={L} y={270} w={1500} h={140} start={q} style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, position: 'relative', whiteSpace: 'nowrap' }}>
          求一个4英尺×6英尺长方形的<span style={{ position: 'relative', display: 'inline-block' }}>面积
            <svg style={{ position: 'absolute', left: '50%', marginLeft: -115, top: -22 }} width={230} height={110} viewBox="0 0 230 110">
              <ellipse cx={115} cy={55} rx={78} ry={38} fill="none" stroke={C.red} strokeWidth={7} strokeDasharray={560} strokeDashoffset={560 * (1 - cp)} strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </Card>
      <div style={{ position: 'absolute', left: L, top: 450, display: 'flex', gap: 28, alignItems: 'center', whiteSpace: 'nowrap', ...fadeUp(f, alt) }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: C.muted, textDecoration: 'line-through', background: C.line, borderRadius: 20, padding: '6px 28px' }}>周长</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: C.violet, background: C.violetSoft, borderRadius: 20, padding: '6px 28px', ...fadeUp(f, alt + 10) }}>英尺？</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: C.violet, background: C.violetSoft, borderRadius: 20, padding: '6px 28px', ...fadeUp(f, alt + 18) }}>英寸？</div>
      </div>
      {[['A', '10'], ['B', '20'], ['C', '24']].map(([l, v], i) => (
        <Card key={l} x={L + i * 330} y={600} w={290} h={110} start={c3 + i * 5} border={l === 'B' ? C.red : l === 'C' && f >= at(scene, 2, 0.7) ? C.green : undefined}>
          <span style={{ color: C.muted, fontSize: 48, fontWeight: 800, marginLeft: 34, marginRight: 22 }}>{l}</span>
          <span style={{ fontSize: 60, fontWeight: 900 }}>{v}</span>
        </Card>
      ))}
      <div style={{ position: 'absolute', left: L + 990, top: 622, width: 520, fontSize: 52, fontWeight: 900, color: C.green, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 2, 0.7)) }}>
        面积 = 24 平方英尺
      </div>
      <div style={{ position: 'absolute', left: L + 330, top: 730, width: 1100, fontSize: 52, fontWeight: 900, color: C.red, whiteSpace: 'nowrap', ...fadeUp(f, wrongTag) }}>
        ↑ 这是另一个问题的正确答案
      </div>
    </>
  );
};

// ------------------------------------------------------------ choices
const Choices3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ln = at(scene, 1, 0.0);
  const est = at(scene, 1, 0.2);
  const gone = at(scene, 1, 0.55);
  const pl = at(scene, 2, 0.0);
  const pts = [
    { l: 'A', x: 0.06 },
    { l: 'B', x: 0.42 },
    { l: 'C', x: 0.55 },
    { l: 'D', x: 0.66 },
    { l: 'E', x: 0.93 },
  ];
  const W = 1500;
  const far = (l: string) => l === 'A' || l === 'E';
  return (
    <>
      <Heading n={3} sub="利用答案选项" start={at(scene, 0, 0.1)} />
      <div style={{ position: 'absolute', left: L, top: 400, width: W, height: 8, background: C.ink, borderRadius: 4, opacity: ease(f, ln, 10) }} />
      {pts.map((p, i) => (
        <div key={p.l} style={{ position: 'absolute', left: L + p.x * W - 45, top: 335, width: 90, height: 90, borderRadius: '50%', background: C.card, border: `6px solid ${C.violet}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, opacity: ease(f, ln + 4 + i * 3) * (far(p.l) ? fadeTo(f, gone + (p.l === 'E' ? 8 : 0), 0.18) : 1) }}>{p.l}</div>
      ))}
      <div style={{ position: 'absolute', left: L + 0.58 * W - 250, top: 440, width: 500, textAlign: 'center', whiteSpace: 'nowrap', ...fadeUp(f, est) }}>
        <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: `32px solid ${C.primary}` }} />
        <div style={{ fontSize: 52, fontWeight: 900, color: C.primary }}>我的估算</div>
      </div>
      {/* plug in: choice -> question, with a check */}
      <Card x={L} y={620} w={160} h={140} start={pl + 6}>
        <div style={{ width: '100%', textAlign: 'center', fontSize: 80, fontWeight: 900, color: C.violet }}>C</div>
      </Card>
      <svg style={{ position: 'absolute', left: L + 170, top: 600, opacity: ease(f, pl + 20) }} width={420} height={180} viewBox="0 0 420 180">
        <path d="M10 90 C 120 -10, 260 -10, 360 80" fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" strokeDasharray="520" strokeDashoffset={520 * (1 - ease(f, pl + 20, 18))} />
        <polygon points="350,50 396,100 336,106" fill={C.violet} opacity={ease(f, pl + 34, 6)} />
      </svg>
      <Card x={L + 620} y={600} w={760} h={180} start={pl + 28} style={{ justifyContent: 'center' }}>
        <div style={{ fontSize: 56, fontWeight: 900 }}>题目</div>
      </Card>
      <Tick cx={L + 1440} cy={690} r={56} start={at(scene, 2, 0.6)} />
    </>
  );
};

// ------------------------------------------------------------ fill
const Fill: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sheet = at(scene, 0, 0.1);
  const empt = at(scene, 0, 0.5);
  const clk = at(scene, 1, 0.0);
  const fillT = at(scene, 1, 0.45);
  const rows = [
    { q: 21, pick: 1 }, { q: 22, pick: 3 }, { q: 23, pick: -1, fill: 2 }, { q: 24, pick: -1, fill: 0 }, { q: 25, pick: -1, fill: 4 },
  ];
  return (
    <>
      <Heading n={4} sub="每道题都作答" start={at(scene, 0, 0.0)} />
      <Card x={L} y={240} w={880} h={560} start={sheet} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 14, paddingLeft: 40 }}>
        {rows.map((r, ri) => {
          const empty = r.pick < 0;
          const ft = fillT + ri * 12 - 24;
          return (
            <div key={r.q} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{ width: 90, fontSize: 52, fontWeight: 900, color: C.muted }}>{r.q}</div>
              {range(5).map((c) => {
                const isFilled = empty ? c === r.fill && f >= ft : c === r.pick;
                const hot = empty && f >= empt && f < ft;
                return <Bubble key={c} size={84} letter={'ABCDE'[c]} filled={false} hot={hot} />;
              }).map((el, c) => {
                const isFilled = empty ? c === r.fill && f >= ft : c === r.pick;
                return isFilled ? <div key={c} style={{ width: 84, height: 84, borderRadius: '50%', background: C.ink, color: '#fff', fontSize: 48, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'ABCDE'[c]}</div> : el;
              })}
            </div>
          );
        })}
      </Card>
      <Card x={L + 960} y={330} w={540} h={330} start={clk} style={{ flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontSize: 140, fontWeight: 900, color: C.red }}>2:00</div>
        <div style={{ fontSize: 60, fontWeight: 800, color: C.muted }}>剩余时间</div>
      </Card>
    </>
  );
};

// ------------------------------------------------------------ try + try-solve
const VALUES = ['39,996', '40,004', '39,204', '40,000', '4,000'];
type CState = { appear: number; dim?: number; x?: number; hiDigit?: number; hot?: number };
const ChoiceCol: React.FC<{ cs: (i: number) => CState }> = ({ cs }) => {
  const f = useCurrentFrame();
  return (
    <>
      {VALUES.map((v, i) => {
        const s = cs(i);
        const o = (s.dim !== undefined ? fadeTo(f, s.dim, 0.35) : 1);
        const hot = s.hot !== undefined ? ease(f, s.hot, 10) : 0;
        const hd = s.hiDigit !== undefined ? ease(f, s.hiDigit, 12) : 0;
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: L, top: 110 + i * 100, width: 480, height: 88, background: hot > 0 ? '#e8faf1' : C.card, border: hot > 0 ? `5px solid ${C.green}` : '5px solid transparent', boxSizing: 'border-box', borderRadius: 20, boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', paddingLeft: 30, fontSize: 52, fontWeight: 800, opacity: ease(f, s.appear, 10) * o, transform: `translateY(${(1 - ease(f, s.appear, 10)) * 20}px)`, whiteSpace: 'nowrap' }}>
              <span style={{ color: C.muted, fontSize: 48, marginRight: 22 }}>{'ABCDE'[i]}</span>
              {v.slice(0, -1)}
              <span style={{ background: `rgba(245,159,10,${0.4 * hd})`, boxShadow: `0 0 0 4px rgba(245,159,10,${0.4 * hd})`, color: hd > 0.5 ? '#9a5b00' : 'inherit', borderRadius: 4, fontWeight: 900, textDecoration: hd > 0.5 ? 'underline' : undefined }}>{v.slice(-1)}</span>
            </div>
            {s.x !== undefined && <RedX cx={L + 520} cy={154 + i * 100} r={34} start={s.x} />}
          </div>
        );
      })}
    </>
  );
};

const Try: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [at(scene, 1, 0.12), at(scene, 1, 0.55), at(scene, 2, 0.2), at(scene, 3, 0.2), at(scene, 3, 0.6)];
  return (
    <>
      <Pill x={L + 560} y={130} color={C.violet} style={{ fontSize: 56, ...fadeUp(f, 4) }}>AMC 8 风格</Pill>
      <Card x={L + 560} y={250} w={900} h={230} start={at(scene, 0, 0.35)} style={{ justifyContent: 'center' }}>
        <Tex tex={'198 \\times 202 = \\ ?'} size={110} />
      </Card>
      <ChoiceCol cs={(i) => ({ appear: starts[i] })} />
    </>
  );
};

const TrySolve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ans = at(scene, 3, 0.9);
  const isLine3 = at(scene, 3, 0);
  return (
    <>
      <ChoiceCol
        cs={(i) => ({
          appear: 0,
          x: i === 4 ? at(scene, 1, 0.35) : undefined,
          dim: i === 4 ? at(scene, 1, 0.35) : i >= 1 && i <= 3 ? at(scene, 3, 0.15 + (i - 1) * 0.08) : undefined,
          hiDigit: at(scene, 2, 0.25),
          hot: i === 0 ? ans : undefined,
        })}
      />
      {[1, 2, 3].map((i) => <RedX key={i} cx={L + 520} cy={154 + i * 100} r={34} start={at(scene, 3, 0.15 + (i - 1) * 0.08)} />)}
      <div style={{ position: 'absolute', left: L + 600, top: 100, fontSize: 68, fontWeight: 800, whiteSpace: 'nowrap', color: C.ink }}>
        {[...'198 × 202'].map((ch, k) => {
          const hot = (k === 2 || k === 8) ? ease(f, at(scene, 2, 0.1), 12) : 0;
          return <span key={k} style={{ background: `rgba(245,159,10,${0.45 * hot})`, boxShadow: `0 0 0 4px rgba(245,159,10,${0.45 * hot})`, borderRadius: 4, color: hot > 0.5 ? '#9a5b00' : C.ink, whiteSpace: 'pre' }}>{ch}</span>;
        })}
      </div>
      <div style={{ position: 'absolute', left: L + 600, top: 205, ...fadeUp(f, at(scene, 0, 0.45)) }}>
        <Tex tex={'200 \\times 200 = 40{,}000'} size={64} />
      </div>
      <div style={{ position: 'absolute', left: L + 600, top: 300, ...fadeUp(f, at(scene, 2, 0.2)) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', fontSize: 60, fontWeight: 900, color: C.amber }}><Tex tex={'8 \\times 2 = 16 \\ \\to'} size={60} color={C.amber} /><span>个位是 6</span></div>
      </div>
      {f >= isLine3 && <div style={{ opacity: 1 - ease(f, at(scene, 4, 0), 10) }}><Answer x={L + 1390} y={720} value="A" start={ans} chime={CHIME} /></div>}
      <div style={{ position: 'absolute', left: L + 600, top: 410, ...fadeUp(f, at(scene, 4, 0.05)) }}>
        <Tex tex={'(200-2)(200+2)'} size={50} />
      </div>
      <div style={{ position: 'absolute', left: L + 600, top: 495, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.3)) }}>
        <Tex tex={'= 200\\cdot 200 \\, \\color{#ef4343}{\\cancel{-\\,2\\cdot 200}} \\, \\color{#ef4343}{\\cancel{+\\,2\\cdot 200}} \\, - 2\\cdot 2'} size={50} />
      </div>
      <div style={{ position: 'absolute', left: L + 600, top: 580, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.6)) }}>
        <Tex tex={'= 40{,}000 - 4 = 39{,}996'} size={50} />
      </div>
      <Tick cx={L + 1255} cy={612} r={34} start={at(scene, 4, 0.85)} />
    </>
  );
};

// ------------------------------------------------------------ prepare
const Prepare: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const items: { y: number; h: number; text: React.ReactNode; col: string }[] = [
    { y: 110, h: 95, text: '多做历年的 AMC 8 真题', col: C.primary },
    { y: 215, h: 95, text: <>每隔几周：整套25道题 · 计时40分钟</>, col: C.violet },
    { y: 320, h: 95, text: '复盘每道错题：找到思路，不只是答案', col: C.amber },
    { y: 425, h: 95, text: '', col: C.blue },
    { y: 530, h: 240, text: '', col: C.red },
  ];
  const topics = ['计数', '数字谜题', '几何', '初步代数'];
  return (
    <>
      {items.map((it, i) => (
        <Card key={i} x={L} y={it.y} w={1500} h={it.h} start={at(scene, i, 0.05)} style={{ paddingLeft: 30, gap: 26, alignItems: i === 4 ? 'flex-start' : 'center', paddingTop: i === 4 ? 30 : 0 }}>
          <div style={{ width: 66, height: 66, flex: 'none', borderRadius: '50%', background: it.col, color: '#fff', fontSize: 44, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
          {i === 3 ? (
            <div style={{ display: 'flex', gap: 16, whiteSpace: 'nowrap' }}>
              {topics.map((t, k) => <div key={t} style={{ background: C.violetSoft, color: C.violet, borderRadius: 999, padding: '4px 24px', fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 3, 0.1 + k * 0.17), 10) }}>{t}</div>)}
            </div>
          ) : i === 4 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 52, fontWeight: 900, whiteSpace: 'nowrap' }}>Vantee 的 AMC 8 风格讲解视频</div>
              <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                <img src={staticFile(`${SLUG}/thumb1.jpg`)} style={{ width: 224, height: 126, borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 14px rgba(30,40,80,0.18)', ...fadeUp(f, at(scene, 4, 0.3), 10) }} />
                <div style={{ fontSize: 50, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 4, 0.5), 10) }}>每种解法、每个陷阱都讲清楚</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 50, fontWeight: 900, whiteSpace: 'nowrap' }}>{it.text}</div>
          )}
        </Card>
      ))}
    </>
  );
};

// ------------------------------------------------------------ recap
const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const chips = ['控制节奏', '题目读两遍', '利用选项', '每题都作答'];
  const cols = [C.primary, C.violet, C.blue, C.amber];
  return (
    <>
      <Text x={L} y={120} w={1500} size={76} weight={900} style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.05)) }}>
        <span style={{ color: C.primary }}>25道题</span> · <span style={{ color: C.violet }}>40分钟</span>
      </Text>
      <Pill x={L} y={250} color={C.green} style={{ fontSize: 64, padding: '14px 40px', ...fadeUp(f, at(scene, 0, 0.45)) }}>答错不扣分</Pill>
      {chips.map((c, i) => (
        <Card key={c} x={L + (i % 2) * 760} y={440 + Math.floor(i / 2) * 150} w={720} h={120} start={at(scene, 1, 0.1 + i * 0.2)} color={cols[i]}>
          <div style={{ width: '100%', textAlign: 'center', fontSize: 58, fontWeight: 900, color: '#fff' }}>{c}</div>
        </Card>
      ))}
      <SignOff start={at(scene, 2, 0.1)} text="考试加油！" tagline="你的家庭 AI 教练" />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  what: What,
  format: Format,
  rule: Rule,
  awards: Awards,
  pace: Pace,
  read: Read,
  choices: Choices3,
  fill: Fill,
  try: Try,
  'try-solve': TrySolve,
  prepare: Prepare,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 备考指南" font={ZH_FONT} /> : null;

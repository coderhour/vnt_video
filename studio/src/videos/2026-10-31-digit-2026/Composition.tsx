import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';
import { interpolate } from 'remotion';

export const SLUG = '2026-10-31-digit-2026';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const G1 = C.primary; // 1-digit numbers
const G2 = C.violet; // 2-digit numbers
const G3 = '#e08600'; // 3-digit numbers (amber, darker for text)
const TINT = ['rgba(12, 194, 129, 0.20)', 'rgba(123, 97, 255, 0.16)'];

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

// ---------- the digit ribbon ----------

type Item = { ch: string; num: number; k: number; last: boolean; spot: number; n: number };

/** Digits of the whole numbers from..to written in a row; spot0 = spot of the first digit. */
const digitsOf = (from: number, to: number, spot0 = 1): Item[] => {
  const out: Item[] = [];
  let spot = spot0;
  for (let n = from; n <= to; n++) {
    const s = String(n);
    for (let k = 0; k < s.length; k++) out.push({ ch: s[k], num: n, k, last: k === s.length - 1, spot: spot++, n: n - from });
  }
  return out;
};

type Deco = { op?: number; ring?: string; color?: string; scale?: number };
type RibbonP = {
  x: number;
  y: number;
  items: Item[];
  cw?: number;
  size?: number;
  gap?: number; // extra gap between numbers
  deco?: (it: Item, i: number) => Deco;
  spotOp?: (it: Item, i: number) => number;
  spotLabel?: (it: Item) => string;
  spotSize?: number;
  tintOf?: (it: Item) => number;
};

const Ribbon: React.FC<RibbonP> = ({ x, y, items, cw = 80, size = 64, gap = 8, deco, spotOp, spotLabel, spotSize = 48, tintOf }) => {
  const h = Math.round(size * 1.3);
  return (
    <>
      {items.map((it, i) => {
        const d = deco?.(it, i) ?? {};
        const op = d.op ?? 1;
        const left = x + i * cw + it.n * gap;
        const t = tintOf ? tintOf(it) : it.n % 2;
        const so = spotOp ? spotOp(it, i) : 0;
        return (
          <div key={i}>
            {op > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left,
                  top: y,
                  width: cw,
                  height: h,
                  background: TINT[t],
                  borderRadius: `${it.k === 0 ? 16 : 2}px ${it.last ? 16 : 2}px ${it.last ? 16 : 2}px ${it.k === 0 ? 16 : 2}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: size,
                  fontWeight: 800,
                  fontFamily: '"DejaVu Sans Mono", "Noto Sans Mono", monospace',
                  color: d.color ?? C.ink,
                  opacity: op,
                  transform: d.scale ? `scale(${d.scale})` : undefined,
                  outline: d.ring ? `6px solid ${d.ring}` : undefined,
                  outlineOffset: 2,
                }}
              >
                {it.ch}
              </div>
            )}
            {so > 0 && (
              <div style={{ position: 'absolute', left, top: y + h + 6, width: cw, textAlign: 'center', fontSize: spotSize, fontWeight: 700, color: C.muted, opacity: so * (op > 0 ? 1 : 0) }}>
                {spotLabel ? spotLabel(it) : it.spot}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const Dots: React.FC<{ x: number; y: number; size?: number; op?: number }> = ({ x, y, size = 64, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, height: Math.round(size * 1.3), display: 'flex', alignItems: 'center', fontSize: size, fontWeight: 800, color: C.muted, opacity: op }}>…</div>
);

// ---------- small helpers ----------

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string }> = ({ x = 80, y, start, tex, size = 54, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 40 }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: 'nowrap' }}>
      {children}
    </Pill>
  );
};

const QCard: React.FC<{ x: number; y: number; w: number; size?: number; children: React.ReactNode; op?: number }> = ({ x, y, w, size = 46, children, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 30, padding: '26px 44px', fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: op }}>{children}</div>
);

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

/** Horizontal bar made of coloured segments (not to scale). */
const Seg: React.FC<{ x: number; y: number; w: number; h?: number; color: string; label: string; op?: number; txt?: string; size?: number; r?: string }> = ({ x, y, w, h = 90, color, label, op = 1, txt = '#fff', size = 54, r = '10px' }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: color, borderRadius: r, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, color: txt, opacity: op, whiteSpace: 'nowrap' }}>{label}</div>
);

// ---------- scenes ----------

// A counter that never shows a 7 (or anything near 2026).
const safeCount = (v: number) => {
  let n = Math.max(1, Math.floor(v));
  while (String(n).includes('7')) n++;
  return n;
};

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = scene.lines[0];
  const p = interpolate(f, [4, l0.frames - 12], [0, 1], clamp);
  const count = safeCount(Math.pow(10, 3.15 * p));
  const cOp = ease(f, 2, 8) * (1 - ease(f, l0.frames - 14, 10));
  const strip = '12345678910111213141516171819202122232425262728293031323334353637383940'.split('');
  const off = -f * 9;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, height: 150, overflow: 'hidden', opacity: ease(f, 0, 10) }}>
        <div style={{ position: 'absolute', left: 1920 + off, top: 0, display: 'flex', gap: 4 }}>
          {strip.map((ch, i) => (
            <div key={i} style={{ width: 96, height: 140, borderRadius: 12, background: TINT[Math.floor(i / 5) % 2], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 800, fontFamily: '"DejaVu Sans Mono", monospace', color: C.ink }}>{ch}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: cOp, filter: `blur(${p < 0.98 ? 3 : 0}px)` }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>digit #</div>
        <div style={{ fontSize: 190, fontWeight: 900, color: C.primary, lineHeight: 1.05 }}>{count}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', ...fadeUp(f, at(scene, 1, 0.1)) }}>
        <div style={{ display: 'inline-block', background: C.violet, color: '#fff', borderRadius: 60, padding: '10px 70px', fontSize: 150, fontWeight: 900 }}>2026th?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.15)) }}>
        <span style={{ fontFamily: PACIFICO, fontSize: 100, color: C.violet }}>Vantee</span>
        <span style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginLeft: 24 }}>your math tutor</span>
      </div>
    </>
  );
};

const CH = ['1', '2', '6', '7', '8'];
const Q1 = digitsOf(1, 14);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const n19 = (it: Item) => it.spot <= 9;
  const n1011 = (it: Item) => it.num === 10 || it.num === 11;
  const t19 = at(scene, 1, 0.35);
  return (
    <>
      <QCard x={90} y={130} w={1740} op={ease(f, at(scene, 1) - 4, 10)}>
        <span style={s(1)}>The whole numbers are written in order with no spaces: </span>
        <span style={s(2)}>1, 2, 3, … and after 9 comes 10, 11, and so on. </span>
        <span style={s(3)}>What is the <Mark on={at(scene, 3, 0.4)}>2026th digit</Mark>?</span>
      </QCard>
      <Ribbon
        x={110}
        y={355}
        items={Q1}
        cw={80}
        size={64}
        deco={(it, i) => ({ op: ease(f, 6 + i * 2, 8) })}
        spotOp={(it) => {
          if (n19(it)) return ease(f, t19 + (it.spot - 1) * 4, 8);
          if (n1011(it)) return ease(f, at(scene, 2, 0.4), 10);
          return 0;
        }}
      />
      <Dots x={110 + 19 * 80 + 13 * 8 + 6} y={355} op={ease(f, 40, 10)} />
      <div style={{ position: 'absolute', left: 110 + 9 * 80 + 9 * 8, top: 535, width: 4 * 80, textAlign: 'center', fontSize: 40, fontWeight: 900, color: G2, opacity: ease(f, at(scene, 2, 0.55), 10), whiteSpace: 'nowrap' }}>spots 10, 11, 12, 13</div>
      <Tag x={90} y={625} start={at(scene, 3, 0.25)} color={C.violet} size={50}>2026th digit = ?</Tag>
      <Choices x={90} y={735} start={(i) => at(scene, 4, 0.2 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const items = digitsOf(1, 13);
  const CW = 68;
  const X0 = 110;
  const G = 8;
  const bx = (spot: number) => X0 + (spot - 1) * CW; // approximate (ignores gap)
  const bar1 = ease(f, at(scene, 1, 0.1), 12);
  const bar2 = ease(f, at(scene, 1, 0.45), 12);
  const bar3 = ease(f, at(scene, 1, 0.75), 12);
  const endX = X0 + 17 * CW + 12 * G + 6;
  return (
    <>
      <Ribbon
        x={X0}
        y={190}
        items={items}
        cw={CW}
        gap={G}
        size={56}
        deco={(it, i) => ({ op: ease(f, 4 + i, 6) })}
        spotOp={(it) => (it.spot === 1 || it.spot === 10 || it.spot === 11 ? ease(f, at(scene, 0, 0.1 + (it.spot === 1 ? 0 : it.spot === 10 ? 0.3 : 0.6)), 10) : 0)}
        spotSize={48}
      />
      <Dots x={endX} y={190} size={56} />
      <div style={{ position: 'absolute', left: X0, top: 400, width: 9 * CW + 9 * G, height: 20, borderRadius: 10, background: G1, transformOrigin: 'left', transform: `scaleX(${bar1})` }} />
      <div style={{ position: 'absolute', left: X0 + 9 * CW + 9 * G, top: 400, width: endX + 60 - (X0 + 9 * CW + 9 * G), height: 20, borderRadius: 10, background: G2, transformOrigin: 'left', transform: `scaleX(${bar2})` }} />
      <div style={{ position: 'absolute', left: endX + 90, top: 400, width: 1830 - endX - 90, height: 20, borderRadius: 10, background: G3, transformOrigin: 'left', transform: `scaleX(${bar3})` }} />
      <Text x={X0} y={440} w={560} size={44} weight={900} color={G1} style={{ opacity: bar1, whiteSpace: 'nowrap' }}>1-digit numbers</Text>
      <Text x={X0 + 9 * CW + 9 * G} y={440} w={700} size={44} weight={900} color={G2} style={{ opacity: bar2, whiteSpace: 'nowrap' }}>2-digit numbers</Text>
      <Text x={endX + 90} y={440} w={400} size={40} weight={900} color={G3} style={{ opacity: bar3, whiteSpace: 'nowrap' }}>3-digit numbers</Text>
      <Text x={endX + 90} y={510} w={400} size={48} weight={700} color={C.muted} style={{ opacity: bar3, whiteSpace: 'nowrap' }}>100, 101, …</Text>
      <Tag x={X0} y={660} start={at(scene, 2, 0.15)} color={C.violet} size={46}>find: which number?</Tag>
      <Tag x={X0 + 520} y={660} start={at(scene, 2, 0.55)} color={C.violet} size={46}>and which digit of it?</Tag>
      {void bx}
    </>
  );
};

const PauseQ = (
  <>
    The whole numbers are written in a row with no spaces: 123456789101112… What is the 2026th digit?
  </>
);

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard x={90} y={140} w={1050} size={46} op={ease(f, 6, 10)}>{PauseQ}</QCard>
      <Ribbon x={90} y={520} items={digitsOf(1, 11)} cw={80} gap={8} deco={(it, i) => ({ op: ease(f, 10 + i, 6) })} />
      <Dots x={90 + 13 * 80 + 11 * 8} y={520} />
      <Choices x={90} y={700} start={(i) => 12 + i * 4} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
      <Countdown scene={scene} seconds={10} x={1560} y={500} tick={TICK} />
    </>
  );
};

// ----- Solution 1 -----

const BudgetBar: React.FC<{ y: number; g: number; p: number; r: number; h?: number }> = ({ y, g, p, r, h = 90 }) => (
  <>
    <Text x={90} y={y - 62} w={900} size={44} weight={800} color={C.muted} style={{ opacity: ease(useCurrentFrame(), 4, 10), whiteSpace: 'nowrap' }}>digit budget: 2026 digits</Text>
    <Seg x={90} y={y} w={160} h={h} color={G1} label="9" op={g} r="28px 8px 8px 28px" />
    <Seg x={256} y={y} w={420} h={h} color={G2} label="180" op={p} />
    <Seg x={682} y={y} w={1148} h={h} color="rgba(120,130,150,0.18)" label="3-digit part: ?" op={r} txt={C.muted} r="8px 28px 28px 8px" size={46} />
  </>
);

const Blocks: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Tag x={90} y={110} start={at(scene, 0, 0.5)} color={C.violet} size={44}>count in blocks</Tag>
      <BudgetBar y={250} g={ease(f, at(scene, 1, 0.5), 10)} p={ease(f, at(scene, 4, 0.4), 10)} r={ease(f, at(scene, 1, 0.1), 12)} />
      <Text x={90} y={350} w={900} size={34} weight={600} color={C.muted} style={{ opacity: ease(f, 6, 10) }}>(bar not to scale)</Text>
      <Eq y={420} start={at(scene, 1, 0.3)} tex={col(G1, '1\\text{ to }9:\\; 9\\times 1 = 9\\text{ digits}')} />
      <Eq y={510} start={at(scene, 2, 0.15)} tex={col(G2, '10\\text{ to }99:\\; 99-10+1 = 90\\text{ numbers}')} />
      <Text x={1150} y={522} w={720} size={48} weight={800} color={G2} style={{ ...fadeUp(f, at(scene, 3, 0.15)), whiteSpace: 'nowrap' }}>+1 counts both 10 and 99</Text>
      <Eq y={600} start={at(scene, 4, 0.1)} tex={col(G2, '90\\times 2 = 180\\text{ digits}')} />
      <Eq y={700} start={at(scene, 5, 0.2)} tex={`9+180 = ${col(C.ink, '189')}\\text{ digits used}`} size={60} />
    </>
  );
};

// zoom ribbon on the two numbers around the answer spot
const Zoom: React.FC<{ x: number; y: number; first: number; start: number; showAt: number; spots: number[] }> = ({ x, y, first, start, showAt, spots }) => {
  const f = useCurrentFrame();
  const CW = 130;
  const GAP = 44;
  const items = [...digitsOf(first, first, spots[0]), ...digitsOf(first + 1, first + 1, spots[0] + 3).map((d) => ({ ...d, n: 1 }))];
  const target = spots[3];
  const pulse = 0.6 + 0.4 * Math.sin(f / 5);
  const X0 = x + 70;
  const sx = (i: number) => X0 + i * CW + (i >= 3 ? GAP : 0);
  return (
    <>
      <Dots x={x} y={y} op={ease(f, start, 10)} />
      <Ribbon
        x={X0}
        y={y}
        items={items}
        cw={CW}
        gap={GAP}
        size={80}
        spotSize={48}
        tintOf={(it) => (it.num === first ? 0 : 1)}
        deco={(it) => {
          if (it.num === first) return { op: ease(f, start, 10) };
          const o = ease(f, showAt, 10);
          if (it.k === 0) return { op: o, color: C.red, ring: C.red, scale: 1 + 0.06 * Math.max(0, pulse) };
          return { op: o * 0.35 };
        }}
        spotOp={(it) => (it.num === first ? ease(f, start + 8 + (it.spot - spots[0]) * 8, 10) : it.k === 0 ? ease(f, showAt, 10) : 0)}
        spotLabel={(it) => String(it.spot)}
      />
      <Dots x={X0 + 6 * CW + GAP + 8} y={y} op={ease(f, showAt, 10)} />
      <div style={{ position: 'absolute', left: sx(3) - GAP / 2 - 3, top: y - 14, width: 6, height: 112, borderRadius: 3, background: C.muted, opacity: ease(f, showAt, 10) }} />
      <div style={{ position: 'absolute', left: sx(0), top: y - 70, width: 3 * CW, textAlign: 'center', fontSize: 48, fontWeight: 900, color: G2, opacity: ease(f, start + 20, 10), whiteSpace: 'nowrap' }}>{first}</div>
      <div style={{ position: 'absolute', left: sx(3), top: y - 70, width: 3 * CW, textAlign: 'center', fontSize: 48, fontWeight: 900, color: C.red, opacity: ease(f, showAt + 6, 10), whiteSpace: 'nowrap' }}>{first + 1}</div>
      <div style={{ position: 'absolute', left: sx(3) - 40, top: y + 160, width: CW + 80, textAlign: 'center', fontSize: 64, fontWeight: 900, color: C.red, opacity: ease(f, showAt + 10, 10), transform: `scale(${0.85 + 0.15 * pop(f, showAt + 10)})` }}>{target}</div>
      <div style={{ position: 'absolute', left: sx(3) - 330, top: y + 240, width: 540, textAlign: 'center', fontSize: 48, fontWeight: 800, lineHeight: 1.15, color: C.red, opacity: ease(f, showAt + 20, 10) }}>▲ just one digit<br />into the next number</div>
    </>
  );
};

const Three: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const sw = (i: number, p: number) => f >= at(scene, i, p);
  const caution = ease(f, t(5, 0.6), 12);
  const answerAt = t(9, 0.9);
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 120, width: 700, height: 56, display: 'flex', gap: 6, opacity: ease(f, 4, 10) }}>
        <div style={{ width: 70, background: G1, borderRadius: '16px 6px 6px 16px' }} />
        <div style={{ width: 170, background: G2, borderRadius: 6 }} />
        <div style={{ flex: 1, background: 'rgba(120,130,150,0.2)', borderRadius: '6px 16px 16px 6px' }} />
      </div>
      <Text x={820} y={120} w={500} size={40} weight={800} color={C.muted} style={{ opacity: ease(f, t(0, 0.5), 10), whiteSpace: 'nowrap' }}>189 used</Text>
      <Eq y={190} start={t(1, 0.1)} tex={sw(1, 0.55) ? `2026 - 189 = ${col(C.ink, '1837')}\\text{ digits left}` : '2026 - 189'} />
      <Eq y={270} start={t(2, 0.35)} tex={sw(3, 0.2) ? `1837 \\div 3 = ${col(G3, '612')}\\text{ remainder } ${col(C.red, '1')}` : '1837 \\div 3'} />
      <Eq
        y={345}
        start={t(4, 0.3)}
        tex={sw(5, 0.15) ? `\\underbrace{100,\\ 101,\\ \\dots,\\ ${col(C.red, '711')}}_{612\\text{ numbers}}` : `\\underbrace{100,\\ 101,\\ \\dots,\\ ?}_{612\\text{ numbers}}`}
      />
      <Eq y={525} start={t(5, 0.35)} tex={`100 + 612 - 1 = ${col(C.red, '711')}`} />
      <div style={{ position: 'absolute', left: 80, top: 598, fontSize: 48, fontWeight: 900, color: C.red, opacity: caution * fadeTo(f, t(7), 0.5, 12), whiteSpace: 'nowrap' }}>not 712: the count starts AT 100</div>
      <Eq y={665} start={t(6, 0.35)} tex={`612 \\times 3 = ${col(C.ink, '1836')}`} />
      <Eq y={740} start={t(7, 0.2)} tex={`189 + 1836 = ${col(C.ink, '2025')}`} />
      <Text x={640} y={752} w={520} size={48} weight={800} color={G2} style={{ opacity: ease(f, t(7, 0.55), 10), whiteSpace: 'nowrap' }}>= last digit of 711</Text>
      <Fade op={ease(f, t(8), 10)}>
        <Zoom x={900} y={290} first={711} start={t(8, 0.0)} showAt={t(8, 0.5)} spots={[2023, 2024, 2025, 2026]} />
      </Fade>
      <Answer x={1740} y={700} value="7" start={answerAt} chime={CHIME} />
      <Confetti x={1740} y={700} start={answerAt} seed={5} />
      <Pill x={1180} y={680} color={C.green} style={{ ...fadeUp(f, answerAt + 4), fontSize: 50 }}>Choice D</Pill>
    </>
  );
};

// ----- Solution 2 -----

const TX0 = 100;
const SC = 1700 / 2289;
const X = (d: number) => TX0 + d * SC;
const TY = 330;

const Hundreds: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const ds = [189, 489, 789, 1089, 1389, 1689, 1989];
  const jump = (i: number) => ease(f, t(2, 0.04 + i * 0.14), 12);
  const startOp = ease(f, t(1, 0.3), 10);
  const over = ease(f, t(3, 0.05), 14);
  const pinOp = ease(f, t(3, 0.55), 10);
  const label = (d: number, op: number, faded = false) => (
    <div key={d} style={{ position: 'absolute', left: X(d) - 115, top: TY + 28, width: 230, textAlign: 'center', whiteSpace: 'nowrap', opacity: op * (faded ? 0.4 : 1) }}>
      <div style={{ fontSize: 42, fontWeight: 900, color: C.ink }}>{d}</div>
      <div style={{ fontSize: 48, fontWeight: 800, color: G3 }}>({Math.round((d - 189) / 3) + 99})</div>
    </div>
  );
  const arc = (a: number, b: number, op: number, faded = false) => {
    const x1 = X(a);
    const x2 = X(b);
    const d = `M ${x1} ${TY} Q ${(x1 + x2) / 2} ${TY - 110} ${x2} ${TY}`;
    return (
      <g opacity={op * (faded ? 0.4 : 1)}>
        <path d={d} fill="none" stroke={faded ? C.muted : C.violet} strokeWidth={7} strokeLinecap="round" strokeDasharray={faded ? '12 10' : undefined} pathLength={1} />
      </g>
    );
  };
  return (
    <>
      <Eq y={100} start={t(0, 0.3)} tex={`100\\text{ numbers}\\times 3\\text{ digits} = ${col(C.violet, '300')}\\text{ digits}`} />
      <Stage>
        <rect x={TX0 - 6} y={TY - 6} width={1712} height={12} rx={6} fill={C.line} />
        {ds.slice(0, -1).map((d, i) => <g key={d}>{arc(d, ds[i + 1], jump(i))}</g>)}
        {arc(1989, 2289, over, true)}
        {ds.map((d, i) => (
          <circle key={d} cx={X(d)} cy={TY} r={14} fill={i === 0 ? G3 : C.violet} opacity={i === 0 ? startOp : jump(i - 1)} />
        ))}
        <circle cx={X(2289)} cy={TY} r={14} fill={C.muted} opacity={over * 0.5} />
        <line x1={X(2026)} y1={TY - 130} x2={X(2026)} y2={TY} stroke={C.red} strokeWidth={6} opacity={pinOp} />
        <circle cx={X(2026)} cy={TY} r={11} fill={C.red} opacity={pinOp} />
      </Stage>
      {ds.slice(0, -1).map((d, i) => (
        <div key={d} style={{ position: 'absolute', left: (X(d) + X(ds[i + 1])) / 2 - 70, top: TY - 140, width: 140, textAlign: 'center', fontSize: 48, fontWeight: 900, color: C.violet, opacity: jump(i) }}>+300</div>
      ))}
      <div style={{ position: 'absolute', left: (X(1989) + X(2289)) / 2 - 70, top: TY - 140, width: 140, textAlign: 'center', fontSize: 48, fontWeight: 900, color: C.muted, opacity: over * 0.5 }}>+300</div>
      {label(189, startOp)}
      {ds.slice(1).map((d, i) => label(d, jump(i)))}
      {label(2289, over, true)}
      <div style={{ position: 'absolute', left: X(2026) - 90, top: TY - 195, width: 180, textAlign: 'center', fontSize: 50, fontWeight: 900, color: C.red, opacity: pinOp }}>2026</div>
      <Eq y={490} start={t(3, 0.3)} tex={`1989 < 2026 < 2289 \\;\\Rightarrow\\; \\text{the }700\\text{s}`} size={52} />
      <Eq y={555} start={t(4, 0.25)} tex={`2026 - 1989 = 37`} size={52} />
      <Eq y={620} start={t(5, 0.3)} tex={`37 = 3\\times 12 + 1`} size={52} />
      <Eq y={685} start={t(6, 0.25)} tex={`700,\\ \\dots,\\ 711 = 12\\text{ numbers}`} size={52} />
      <Eq y={750} start={t(7, 0.3)} tex={`712 \\to ${col(C.green, '7')}`} size={52} />
      <Text x={1000} y={560} w={880} size={44} weight={800} color={G3} style={{ opacity: startOp, whiteSpace: 'nowrap' }}>( ) = last number reached</Text>
      <Tag x={1100} y={660} start={t(8, 0.55)} color={C.violet} size={42}>big jumps first, then small steps</Tag>
    </>
  );
};

// ----- Traps -----

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const digits = ['7', '1', '2'];
  const red = (i: number) => (i === 1 ? f >= t(0, 0.3) && f < t(2) : i === 2 ? f >= t(2, 0.3) && f < t(3, 0.3) : false);
  const green7 = f >= t(6, 0.2);
  const chipState = (c: number): 'none' | 'red' | 'green' => {
    if (c === 0) return f >= t(0, 0.3) ? 'red' : 'none';
    if (c === 1) return f >= t(2, 0.3) ? 'red' : 'none';
    if (c === 2) return f >= t(3, 0.4) ? 'red' : 'none';
    if (c === 4) return f >= t(5, 0.3) ? 'red' : 'none';
    return f >= t(6, 0.2) ? 'green' : 'none';
  };
  const showSix = f >= t(3, 0.3) && f < t(5);
  return (
    <>
      <Text x={90} y={120} w={600} size={44} weight={800} color={C.muted} style={fadeUp(f, 4)}>the number</Text>
      {digits.map((d, i) => {
        const bad = red(i);
        const good = i === 0 && green7;
        const showing = showSix;
        return (
          <div key={i} style={{ position: 'absolute', left: 90 + i * 150, top: 190, width: 130, height: 170, borderRadius: 24, background: good ? 'rgba(33,196,93,0.2)' : bad ? 'rgba(239,67,67,0.16)' : TINT[1], border: `6px solid ${good ? C.green : bad ? C.red : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, fontWeight: 900, fontFamily: '"DejaVu Sans Mono", monospace', color: good ? C.green : bad ? C.red : C.ink, opacity: showing ? 0 : ease(f, 4 + i * 4, 8) }}>
            {d}
          </div>
        );
      })}
      <Text x={90} y={380} w={500} size={34} weight={700} color={C.muted} style={{ opacity: ease(f, 14, 10) * (showSix ? 0 : 1), whiteSpace: 'nowrap' }}>712: first · middle · last digit</Text>
      {/* 612 */}
      {showSix && (
        <div style={{ position: 'absolute', left: 90, top: 190, display: 'flex', gap: 20, opacity: 1 }}>
          {['6', '1', '2'].map((d, i) => (
            <div key={i} style={{ width: 130, height: 170, borderRadius: 24, background: i === 0 ? 'rgba(239,67,67,0.16)' : TINT[0], border: `6px solid ${i === 0 ? C.red : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, fontWeight: 900, fontFamily: '"DejaVu Sans Mono", monospace', color: i === 0 ? C.red : C.ink, ...fadeUp(f, t(3, 0.3), 10) }}>{d}</div>
          ))}
        </div>
      )}
      {showSix && (
        <div style={{ position: 'absolute', left: 560, top: 200, width: 1250, background: C.card, borderLeft: `12px solid ${C.red}`, borderRadius: 22, padding: '14px 30px', fontSize: 42, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', opacity: ease(f, t(3, 0.5), 10) }}>
          {f < t(4) ? 'forgot: 3-digit numbers start at 100' : 'counting from 0: the next number is 612'}
        </div>
      )}
      {f >= t(5, 0.2) && f < t(6) && (
        <div style={{ position: 'absolute', left: 560, top: 200, width: 1250, background: C.card, borderLeft: `12px solid ${C.red}`, borderRadius: 22, padding: '14px 30px', fontSize: 42, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, t(5, 0.2), 10) }}>
          the 700s start with 7, never 8
        </div>
      )}
      <div style={{ position: 'absolute', left: 90, top: 560, display: 'flex', gap: 26 }}>
        {CH.map((c, i) => {
          const st = chipState(i);
          const color = st === 'red' ? C.red : st === 'green' ? C.green : C.ink;
          return (
            <div key={c} style={{ width: 210, height: 130, borderRadius: 26, background: st === 'red' ? 'rgba(239,67,67,0.14)' : st === 'green' ? 'rgba(33,196,93,0.2)' : C.card, border: `6px solid ${st === 'none' ? C.line : color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 80, fontWeight: 900, color, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', ...fadeUp(f, 8 + i * 3, 10) }}>
              <span style={{ fontSize: 40, color: C.muted }}>{'ABCDE'[i]}</span>
              {c}
              {st === 'red' && <span style={{ fontSize: 56 }}>✗</span>}
              {st === 'green' && <span style={{ fontSize: 56 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ----- Variant -----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={90} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>Your turn</Pill>
      <QCard x={90} y={230} w={1500} size={50} op={ease(f, at(scene, 0) - 4, 10)}>
        The same long row of digits.<span style={{ opacity: ease(f, at(scene, 1), 10) }}> <Mark on={at(scene, 1, 0.3)}>What is the digit in spot 1000?</Mark></span>
      </QCard>
      <Ribbon x={90} y={520} items={digitsOf(1, 12)} cw={80} gap={8} deco={(it, i) => ({ op: ease(f, at(scene, 0, 0.2) + i * 2, 8) })} />
      <Dots x={90 + 15 * 80 + 12 * 8} y={520} />
      <Tag x={90} y={700} start={at(scene, 1, 0.5)} color={C.violet} size={50}>digit in spot 1000 = ?</Tag>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard x={90} y={170} w={1000} size={48} op={ease(f, 6, 10)}>The same row of digits, 123456789101112… What is the 1000th digit?</QCard>
      <Ribbon x={90} y={520} items={digitsOf(1, 11)} cw={80} gap={8} deco={(it, i) => ({ op: ease(f, 10 + i, 6) })} />
      <Dots x={90 + 13 * 80 + 11 * 8} y={520} />
      <Countdown scene={scene} seconds={12} x={1560} y={500} tick={TICK} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const done = t(5, 0.9);
  return (
    <>
      <Eq y={130} start={t(0, 0.4)} tex={`${col(G1, '9')}+${col(G2, '180')} = 189\\text{ digits used}`} />
      <Eq y={225} start={t(1, 0.3)} tex={`1000 - 189 = ${col(C.ink, '811')}`} />
      <Eq y={320} start={t(2, 0.3)} tex={`811 \\div 3 = ${col(G3, '270')}\\text{ remainder } ${col(C.red, '1')}`} />
      <Eq y={415} start={t(3, 0.3)} tex={`100,\\ \\dots,\\ ${col(G3, '369')} = 270\\text{ numbers}`} />
      <Fade op={ease(f, t(4), 10)}>
        <Zoom x={900} y={290} first={369} start={t(4, 0.0)} showAt={t(4, 0.45)} spots={[997, 998, 999, 1000]} />
      </Fade>
      <Answer x={1740} y={700} value="3" start={done} chime={CHIME} />
      <Confetti x={1740} y={700} start={done} seed={9} />
    </>
  );
};

// ----- Recap -----

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 4), 0, 12);
  const step = (i: number, label: string, color: string, y: number) => (
    <div style={{ position: 'absolute', left: 90, top: y, display: 'flex', alignItems: 'center', gap: 26, ...fadeUp(f, at(scene, i, 0.15)) }}>
      <div style={{ background: color, borderRadius: 28, padding: '14px 40px', fontSize: 54, fontWeight: 900, color: '#fff' }}>{label}</div>
    </div>
  );
  return (
    <>
      <Fade op={out}>
        <Text x={90} y={120} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <div style={{ position: 'absolute', left: 90, top: 250, display: 'flex', gap: 14, opacity: ease(f, at(scene, 1, 0.1), 12) }}>
          <Seg x={0} y={0} w={0} color="none" label="" />
        </div>
        <Seg x={90} y={230} w={180} h={100} color={G1} label="9" op={ease(f, at(scene, 1, 0.1), 12)} r="28px 8px 8px 28px" />
        <Seg x={276} y={230} w={380} h={100} color={G2} label="180" op={ease(f, at(scene, 1, 0.2), 12)} r="8px" />
        <Seg x={662} y={230} w={380} h={100} color={G3} label="3 each" op={ease(f, at(scene, 2, 0.0), 12)} r="8px 28px 28px 8px" />
        {step(1, '1. subtract what is used up', C.primary, 400)}
        {step(2, '2. divide by the digits per number', C.violet, 520)}
        {step(3, '3. the remainder picks the digit', C.red, 640)}
      </Fade>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 4, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep counting!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 4, 0.2)} seed={3} />
      {void range}
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  blocks: Blocks,
  'three-digit': Three,
  hundreds: Hundreds,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

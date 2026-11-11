import { staticFile, interpolate, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-geometric-144-zh';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const cV = (t: string) => col(C.violet, t);
const cR = (t: string) => col(C.red, t);
const cG = (t: string) => col(C.green, t);

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

// ---------- helpers ----------

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string | Part[]; size?: number; color?: string }> = ({ x = 900, y, start, tex, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number }> = ({ x, y, start, color, children, size = 40, w }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: w ? 'normal' : 'nowrap', width: w, textAlign: w ? 'center' : undefined, borderRadius: w ? 36 : 999 }}>
      {children}
    </Pill>
  );
};

/** Three rounded boxes joined by arrows, with the ratio on each arrow. */
const Chain: React.FC<{
  x: number; y: number; start: number; labels: React.ReactNode[]; ratios: string[];
  bw?: number; bh?: number; gap?: number; size?: number; hi?: number; ratioOp?: number; colors?: string[];
}> = ({ x, y, start, labels, ratios, bw = 160, bh = 110, gap = 250, size = 64, hi = -1, ratioOp = 1, colors }) => {
  const f = useCurrentFrame();
  return (
    <>
      {labels.map((l, i) => {
        const on = i === hi;
        const cc = colors?.[i] ?? C.ink;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x + i * (bw + gap), top: y, width: bw, height: bh, borderRadius: 28,
              background: on ? C.violet : C.card, color: on ? '#fff' : cc, border: `5px solid ${on ? C.violet : C.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900,
              boxShadow: '0 6px 20px rgba(30,40,80,0.08)', ...fadeUp(f, start + i * 5),
            }}
          >
            {l}
          </div>
        );
      })}
      {ratios.map((r, i) => (
        <div key={`r${i}`} style={{ opacity: ease(f, start + 12 + i * 5, 10) * ratioOp }}>
          <div style={{ position: 'absolute', left: x + (i + 1) * bw + i * gap, top: y + bh / 2 - 15 - 125, width: gap, height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', whiteSpace: 'nowrap' }}>
            <Tex tex={r} size={52} color={C.violet} />
          </div>
          <svg style={{ position: 'absolute', left: x + (i + 1) * bw + i * gap, top: y + bh / 2 - 15 }} width={gap} height={30} viewBox={`0 0 ${gap} 30`}>
            <path d={`M16 15 H${gap - 18} M${gap - 38} 3 L${gap - 14} 15 L${gap - 38} 27`} stroke={C.violet} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </>
  );
};

const QCard: React.FC<{ x: number; y: number; w: number; size?: number; start?: number; children: React.ReactNode }> = ({ x, y, w, size = 46, start = 6, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 32, padding: '28px 44px', fontSize: size, fontWeight: 600, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Mk: React.FC<{ t: string; size?: number }> = ({ t, size = 52 }) => <Tex tex={t} size={size} />;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const q = ease(f, at(scene, 0, 0.18), 10); // question marks turn into the first example
  const ex = (a: React.ReactNode) => a;
  return (
    <>
      <Chain x={90} y={250} start={4} labels={[q < 0.5 ? '?' : ex('1'), q < 0.5 ? '?' : ex('12'), '144']} ratios={[q < 0.5 ? '\\times r' : '\\times 12', q < 0.5 ? '\\times r' : '\\times 12']} colors={[C.ink, C.ink, C.primary]} />
      <Chain x={90} y={560} start={at(scene, 1, 0.1)} labels={['36', '72', '144']} ratios={['\\times 2', '\\times 2']} colors={[C.ink, C.ink, C.primary]} />
      <Tag x={1300} y={590} start={at(scene, 2, 0.1)} color={C.amber} size={52}>有多少组？</Tag>
      <div style={{ position: 'absolute', left: 1280, top: 200, ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CH = ['9', '10', '11', '12', '14'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <QCard x={90} y={130} w={1100} start={at(scene, 1) - 4}>
        <span style={s(1)}>有多少个由三个正整数 <Mk t={'a,\\ b,\\ c'} size={48} /> 组成的递增等比数列，</span>
        <span style={s(2)}>满足 <Mk t={'c'} size={48} /> 等于 <Mark on={at(scene, 2, 0.3)}>144</Mark>？</span>
      </QCard>
      <Eq x={120} y={500} start={at(scene, 1, 0.5)} tex={'a<b<c'} size={64} />
      <Eq x={560} y={500} start={at(scene, 2, 0.5)} tex={'c=144'} size={64} />
      <Tag x={1250} y={140} w={620} start={at(scene, 1, 0.3)} color={C.violet} size={38}>等比 = 每一步都乘同一个公比</Tag>
      <Tag x={1250} y={370} start={at(scene, 2, 0.1)} color={C.primary} size={38}>正整数</Tag>
      <Tag x={1250} y={460} start={at(scene, 2, 0.35)} color={C.primary} size={38}>递增</Tag>
      <Choices x={120} y={680} start={(i) => at(scene, 3, 0.2 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Chain x={90} y={250} start={at(scene, 0, 0.3)} labels={['a', 'b', 'c']} ratios={['\\times r', '\\times r']} />
      <Eq x={120} y={420} start={at(scene, 1, 0.2)} tex={'a<b<c'} size={64} />
      <Tag x={700} y={430} start={at(scene, 2, 0.3)} color={C.amber} size={46}>公比 r 可以是分数！</Tag>
      <Chain x={90} y={660} start={at(scene, 3, 0.3)} labels={['64', '96', '144']} ratios={['\\times\\dfrac{3}{2}', '\\times\\dfrac{3}{2}']} />
      <div style={{ opacity: ease(f, at(scene, 3, 0.3), 10) * 0 }} />
    </>
  );
};

const QTEXT = (
  <>
    有多少个由三个正整数 <Mk t={'a,\\ b,\\ c'} size={48} /> 组成的递增等比数列，满足 <Mk t={'c'} size={48} /> 等于 144？
  </>
);
const QTEXT2 = (
  <>
    有多少个由三个正整数 <Mk t={'a,\\ b,\\ c'} size={48} /> 组成的递增等比数列，满足 <Mk t={'c'} size={48} /> 等于 72？
  </>
);

const Pause1: SceneComponent = ({ scene }) => (
  <>
    <QCard x={100} y={160} w={1180} size={44}>{QTEXT}</QCard>
    <Eq x={130} y={520} start={14} tex={'a<b<c'} size={64} />
    <Eq x={560} y={520} start={14} tex={'c=144'} size={64} />
    <Countdown scene={scene} seconds={10} x={1630} y={500} tick={TICK} label={PAUSE_LABEL} />
  </>
);

const TRow: React.FC<{ y: number; start: number; tex: string; ok: boolean }> = ({ y, start, tex, ok }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 70, top: y, display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={52} />
      <span style={{ fontSize: 52, fontWeight: 900, color: ok ? C.green : C.red }}>{ok ? '✓' : '✗'}</span>
    </div>
  );
};

const Middle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const o = fadeTo(f, at(scene, 4, 0), 0, 10);
  return (
    <>
      <div style={{ opacity: o }}>
        <Chain x={70} y={210} start={4} labels={['a', 'b', 'c']} ratios={['\\times r', '\\times r']} bw={120} bh={100} gap={200} size={60} hi={ease(f, at(scene, 0, 0.4), 6) > 0.5 ? 1 : -1} />
        <Tag x={70} y={325} start={at(scene, 0, 0.4)} color={C.violet} size={42}>盯住 b</Tag>
      </div>
      <Eq y={120} start={at(scene, 1, 0.3)} tex={'\\dfrac{b}{a}=\\dfrac{c}{b}'} />
      <Eq y={300} start={at(scene, 1, 0.7)} tex={'b\\times b=a\\times c'} />
      <Eq y={410} start={at(scene, 2, 0.25)} tex={'b^2=144\\times a'} />
      <Eq y={510} start={at(scene, 2, 0.8)} tex={cV('a=\\dfrac{b^2}{144}')} />
      <TRow y={240} start={at(scene, 4, 0.12)} tex={'6^2=36:\\ \\dfrac{36}{144}=\\dfrac{1}{4}'} ok={false} />
      <TRow y={415} start={at(scene, 4, 0.3)} tex={'18^2=324:\\ \\dfrac{324}{144}=\\dfrac{9}{4}'} ok={false} />
      <TRow y={590} start={at(scene, 4, 0.62)} tex={'24^2=576:\\ \\dfrac{576}{144}=4'} ok />
    </>
  );
};

const KRow: React.FC<{ k: number; start: number; hi: number }> = ({ k, start, hi }) => {
  const f = useCurrentFrame();
  const idx = k <= 6 ? k - 1 : k <= 11 ? k - 7 : 5;
  const x = k <= 6 ? 90 : 880;
  const y = 250 + idx * 92;
  const bad = k === 12;
  const colr = bad ? C.red : C.ink;
  const tex = `k=${k}:\\ ${k * k},\\ ${12 * k},\\ 144`;
  return (
    <div style={{ position: 'absolute', left: x - 18, top: y, padding: '2px 18px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', background: `rgba(33,196,93,${0.16 * hi})`, ...fadeUp(f, start, 10) }}>
      <Tex tex={bad ? 'k=12:\\ 144,\\ 144,\\ 144' : tex} size={52} color={colr} />
      {bad && <span style={{ fontSize: 52, fontWeight: 900, color: C.red }}>✗</span>}
    </div>
  );
};

const Twelve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 5, 0.0), 0, 10);
  const done = at(scene, 10, 0.88);
  const hi = ease(f, at(scene, 10, 0.15), 14);
  const rest = Array.from({ length: 9 }, (_, i) => i + 3);
  return (
    <>
      <div style={{ opacity: out }}>
        <Eq x={90} y={130} start={at(scene, 0, 0.4)} tex={'144=12^2'} />
        <Eq x={90} y={215} start={at(scene, 1, 0.3)} tex={'a=\\dfrac{b^2}{12^2}=\\left(\\dfrac{b}{12}\\right)^2'} />
        <Eq x={90} y={385} start={at(scene, 2, 0.35)} size={52} tex={['\\dfrac{b}{12}', z('不是整数'), '\\ \\Rightarrow\\ \\left(\\dfrac{b}{12}\\right)^2', z('也不是整数')]} />
        <Eq x={90} y={550} start={at(scene, 3, 0.1)} size={52} tex={'b=18:\\ \\dfrac{b}{12}=\\dfrac{3}{2},\\ \\ \\left(\\dfrac{3}{2}\\right)^2=\\dfrac{9}{4}'} />
        <Tag x={90} y={765} start={at(scene, 4, 0.1)} color={C.green} size={50}>a 是整数</Tag>
        <Eq x={470} y={735} start={at(scene, 4, 0.6)} size={52} color={C.violet} tex={['\\dfrac{b}{12}', z('一定是整数')]} />
      </div>
      <Eq x={90} y={130} start={at(scene, 5, 0.4)} tex={cV('b=12k,\\ \\ a=k^2')} />
      <KRow k={1} start={at(scene, 6, 0.35)} hi={hi} />
      <KRow k={2} start={at(scene, 7, 0.1)} hi={hi} />
      {rest.map((k) => (
        <KRow key={k} k={k} start={at(scene, 7, 0.6) + (k - 3) * 5} hi={hi} />
      ))}
      <KRow k={12} start={at(scene, 8, 0.4)} hi={0} />
      <Tag x={1620} y={690} w={250} start={at(scene, 9, 0.1)} color={C.red} size={38}>不递增</Tag>
      <Answer x={1720} y={400} value="11" start={done} chime={CHIME} />
      <Confetti x={1720} y={400} start={done} seed={5} />
      <Pill x={1610} y={560} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 46 }}>选项 C</Pill>
    </>
  );
};

const PS = [2, 3, 4, 6, 12];
const QS: Record<number, number[]> = { 2: [1], 3: [1, 2], 4: [1, 3], 6: [1, 5], 12: [1, 5, 7, 11] };

const Ratio: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const TX = 1000;
  return (
    <>
      <Eq x={80} y={165} start={at(scene, 0, 0.5)} tex={[z('公比'), '=\\dfrac{p}{q}']} />
      <Text x={560} y={190} w={400} size={36} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.7))}>最简分数</Text>
      <Eq x={80} y={275} start={at(scene, 1, 0.3)} tex={'p>q'} />
      <Eq x={80} y={345} start={at(scene, 2, 0.5)} tex={'a=144\\times\\dfrac{q^2}{p^2}'} />
      <Text x={530} y={392} w={440} size={38} weight={800} color={C.muted} style={fadeUp(f, at(scene, 3, 0.1))}>q² 和 p² 没有公因数</Text>
      <Eq x={80} y={505} start={at(scene, 3, 0.65)} color={C.violet} tex={['p^2', z('能整除'), '144']} />
      <Text x={80} y={595} w={900} size={38} weight={800} color={C.muted} style={fadeUp(f, at(scene, 4, 0.3))}>能整除 144、又大于 1 的平方数</Text>
      <Eq x={80} y={635} start={at(scene, 4, 0.5)} tex={'4,\\ 9,\\ 16,\\ 36,\\ 144'} />
      <Eq x={80} y={735} start={at(scene, 5, 0.4)} tex={'p=2,\\ 3,\\ 4,\\ 6,\\ 12'} />
      {PS.map((p, i) => {
        const y = 130 + i * 100;
        const s0 = at(scene, 6, 0.08 + i * 0.16);
        const s1 = at(scene, 7, 0.05 + i * 0.15);
        const n = QS[p].length;
        return (
          <div key={p}>
            <div style={{ position: 'absolute', left: TX, top: y, width: 880, height: 88, ...fadeUp(f, s0) }}>
              <div style={{ position: 'absolute', left: 0, top: 6 }}>
                <Tex tex={`p=${p}`} size={52} />
              </div>
              {QS[p].map((q, j) => (
                <div key={q} style={{ position: 'absolute', left: 200 + j * 100, top: 0, width: 84, height: 84, borderRadius: 22, background: C.violetSoft, border: `4px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, color: C.violet }}>
                  {q}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', left: 1700, top: y, width: 84, height: 84, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900, ...fadeUp(f, s1, 10) }}>
              {n}
            </div>
          </div>
        );
      })}
      <Eq x={TX} y={650} start={at(scene, 7, 0.4)} tex={f < at(scene, 7, 0.85) ? '1+2+2+2+4' : `1+2+2+2+4=${cG('11')}`} />
      <Tag x={TX} y={745} start={at(scene, 8, 0.35)} color={C.violet} size={42}>对任何 c 都管用</Tag>
    </>
  );
};

const RATIOS: { t: string; frac: boolean }[] = [
  { t: '12', frac: false }, { t: '6', frac: false }, { t: '4', frac: false }, { t: '3', frac: false }, { t: '2', frac: false },
  { t: '\\dfrac{12}{5}', frac: true }, { t: '\\dfrac{12}{7}', frac: true }, { t: '\\dfrac{3}{2}', frac: true },
  { t: '\\dfrac{4}{3}', frac: true }, { t: '\\dfrac{6}{5}', frac: true }, { t: '\\dfrac{12}{11}', frac: true },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const redAt: Record<number, number> = { 0: 99999, 1: 99999, 2: 99999, 3: at(scene, 0, 0.4), 4: at(scene, 2, 0.15) };
  const bad = (i: number) => (i === 3 ? f >= at(scene, 0, 0.4) : i === 4 ? f >= at(scene, 2, 0.15) : i < 2 ? f >= at(scene, 4, 0.3) : false);
  const good = f >= at(scene, 5, 0.3);
  void redAt;
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 130, display: 'flex', gap: 22 }}>
        {CH.map((c, i) => {
          const b = bad(i);
          const g = i === 2 && good;
          const color = b ? C.red : g ? C.green : C.ink;
          return (
            <div key={i} style={{ background: b ? 'rgba(239,67,67,0.12)' : g ? 'rgba(33,196,93,0.16)' : C.card, border: `5px solid ${b ? C.red : g ? C.green : C.line}`, borderRadius: 20, padding: '10px 28px', fontSize: 52, fontWeight: 900, color, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <span style={{ color: C.muted, fontSize: 34, marginRight: 12 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 100, top: 290, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, at(scene, 0, 0.7)) }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: C.muted, width: 80 }}>D</span>
        <Tex tex={'144,\\ 144,\\ 144'} size={52} />
        <span style={{ fontSize: 52, fontWeight: 900, color: C.red }}>✗</span>
      </div>
      <div style={{ position: 'absolute', left: 100, top: 390, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, at(scene, 2, 0.4)) }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: C.muted, width: 80 }}>E</span>
        <Tex tex={'1,\\ 2,\\ 3,\\ 4,\\ 6,\\ 8,\\ 9,\\ 12,\\ 16,\\ 18,\\ 24,\\ 36,\\ 48,\\ 72'} size={52} />
      </div>
      <div style={{ position: 'absolute', left: 180, top: 480, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, at(scene, 3, 0.2)) }}>
        <Tex tex={'a=2:\\ \\ b^2=2\\times 144=288'} size={52} />
        <span style={{ fontSize: 52, fontWeight: 900, color: C.red }}>✗</span>
      </div>
      <div style={{ position: 'absolute', left: 100, top: 585, ...fadeUp(f, at(scene, 4, 0.2)) }}>
        <Text x={0} y={0} w={900} size={38} weight={800} color={C.muted}>A、B：公比 12/k，k = 1 到 11，共 11 个</Text>
      </div>
      <div style={{ position: 'absolute', left: 100, top: 640, display: 'flex', gap: 14 }}>
        {RATIOS.map((r, i) => {
          const g = good;
          return (
            <div key={i} style={{ minWidth: r.frac ? 130 : 90, height: 175, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: g ? 'rgba(33,196,93,0.16)' : r.frac ? C.violetSoft : C.card, border: `4px solid ${g ? C.green : r.frac ? C.violet : C.line}`, ...fadeUp(f, at(scene, 4, 0.35) + i * 3, 10) }}>
              <Tex tex={r.t} size={r.frac ? 60 : 56} color={r.frac ? C.violet : C.ink} />
            </div>
          );
        })}
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>轮到你</Pill>
      <QCard x={120} y={230} w={1250} size={48} start={at(scene, 0) - 4}>{QTEXT2}</QCard>
      <Eq x={150} y={610} start={at(scene, 0, 0.6)} tex={'a<b<c'} size={64} />
      <Eq x={560} y={610} start={at(scene, 0, 0.7)} tex={'c=72'} size={64} />
      <Tag x={120} y={740} start={at(scene, 1, 0.1)} color={C.amber} size={44}>注意：72 不是完全平方数！</Tag>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => (
  <>
    <QCard x={100} y={160} w={1180} size={44}>{QTEXT2}</QCard>
    <Eq x={130} y={520} start={14} tex={'a<b<c'} size={64} />
    <Eq x={560} y={520} start={14} tex={'c=72'} size={64} />
    <Countdown scene={scene} seconds={12} x={1630} y={500} tick={TICK} label={PAUSE_LABEL} />
  </>
);

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 7, 0.88);
  const L = ['2,\\ 12,\\ 72', '8,\\ 24,\\ 72', '18,\\ 36,\\ 72', '32,\\ 48,\\ 72', '50,\\ 60,\\ 72'];
  return (
    <>
      <Eq x={90} y={130} start={at(scene, 0, 0.5)} tex={'b^2=72\\times a'} />
      <Eq x={90} y={215} start={at(scene, 1, 0.3)} tex={'72\\times a=36\\times 2a'} />
      <Eq x={90} y={295} start={at(scene, 2, 0.3)} tex={'\\left(\\dfrac{b}{6}\\right)^2=2a'} />
      <Eq x={650} y={330} start={at(scene, 2, 0.75)} color={C.violet} tex={['2a', z('是完全平方数')]} />
      <Eq x={90} y={465} start={at(scene, 3, 0.4)} tex={'2a=4,\\ 16,\\ 36,\\ 64,\\ 100'} />
      <Eq x={90} y={555} start={at(scene, 4, 0.35)} tex={'a=2,\\ 8,\\ 18,\\ 32,\\ 50'} />
      {L.map((t, i) => (
        <Eq key={i} x={1120} y={150 + i * 100} start={at(scene, 5, 0.25 + i * 0.16)} tex={t} />
      ))}
      <div style={{ position: 'absolute', left: 1120, top: 650, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, at(scene, 6, 0.35)) }}>
        <Tex tex={'72,\\ 72,\\ 72'} size={56} color={C.red} />
        <span style={{ fontSize: 52, fontWeight: 900, color: C.red }}>✗</span>
      </div>
      <Answer x={880} y={660} value="5" start={done} chime={CHIME} />
      <Confetti x={880} y={660} start={done} seed={9} />
    </>
  );
};

const Card: React.FC<{ y: number; start: number; color: string; children: React.ReactNode }> = ({ y, start, color, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 220, top: y, width: 1480, background: C.card, borderRadius: 26, borderLeft: `14px solid ${color}`, padding: '16px 40px', fontSize: 50, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 4), 0, 12);
  return (
    <>
      <div style={{ opacity: out }}>
        <Text x={220} y={130} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>核心思路</Text>
        <Card y={250} start={at(scene, 1, 0.3)} color={C.violet}><Tex tex={'b\\times b=a\\times c'} size={62} /></Card>
        <Card y={420} start={at(scene, 2, 0.3)} color={C.primary}><Z p={['a\\times c', z('是完全平方数')]} size={58} /></Card>
        <Card y={590} start={at(scene, 3, 0.3)} color={C.amber}>一不再递增，就停下</Card>
      </div>
      <SignOff start={at(scene, 4, 0.1)} text="继续提升你的数学本领！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 4, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  middle: Middle,
  twelve: Twelve,
  ratio: Ratio,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

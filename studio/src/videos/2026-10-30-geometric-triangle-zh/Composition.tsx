import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-geometric-triangle-zh';
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

// ---------- the maths (same formulas as verify.py) ----------
// Longest side N = n². Every allowed ratio is m/n, so the sides are m², n·m, n² (m = 1 … n−1),
// and the triangle rule is m² + n·m > n².
const N = 45;
const short = (m: number) => m * m;
const middle = (m: number, n = N) => n * m;
const closes = (m: number, n = N) => short(m) + middle(m, n) > n * n;

const PANEL = 900;

// ---------- small drawing helpers ----------

const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ p, text, color = C.ink, size = 48, opacity = 1, anchor = 'middle' }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={ZH_FONT} fontWeight={900} fontSize={size} textAnchor={anchor} dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
      {text}
    </text>
  );

/** A maths line. */
const Eq: React.FC<{ y: number; tex: string | Part[]; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Green box around a key result. */
const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; opacity?: number; color?: string }> = ({ x, y, w, h, start, opacity = 1, color = C.green }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 20, opacity: ease(f, start, 12) * opacity }} />;
};

/**
 * Try to build a triangle with short sides a (right, blue) and b (left, violet) on the longest side c.
 * If a + b > c the two sides swing up (lift 0 → 1) and meet at the top corner.
 * If not, they lie flat along c and the red gap between them shows they can't reach.
 */
const Builder: React.FC<{
  a: number; b: number; c: number; x0: number; y0: number; L: number; lift?: number; opacity?: number;
  la?: string; lb?: string; lc?: string; size?: number;
}> = ({ a, b, c, x0, y0, L, lift = 1, opacity = 1, la, lb, lc, size = 48 }) => {
  if (opacity <= 0) return null;
  const k = L / c;
  const ok = a + b > c;
  const px = (c * c + b * b - a * a) / (2 * c);
  const h = ok ? Math.sqrt(Math.max(0, b * b - px * px)) : 0;
  const t = ok ? lift : 0;
  const thL = Math.atan2(h, px) * t;
  const thR = Math.atan2(h, c - px) * t;
  const A: Pt = [x0, y0];
  const B: Pt = [x0 + L, y0];
  const P1: Pt = [x0 + b * k * Math.cos(thL), y0 - b * k * Math.sin(thL)];
  const P2: Pt = [x0 + L - a * k * Math.cos(thR), y0 - a * k * Math.sin(thR)];
  const done = ok && t >= 1;
  const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const flatLift = t < 0.5 ? 46 : 0;
  return (
    <g opacity={opacity}>
      {done && <path d={`M ${A.join(' ')} L ${P1.join(' ')} L ${B.join(' ')} Z`} fill={C.green} opacity={0.14} />}
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      {!ok && <line x1={P1[0]} y1={y0} x2={P2[0]} y2={y0} stroke={C.red} strokeWidth={14} strokeLinecap="round" />}
      <line x1={A[0]} y1={A[1]} x2={P1[0]} y2={P1[1]} stroke={C.violet} strokeWidth={11} strokeLinecap="round" />
      <line x1={B[0]} y1={B[1]} x2={P2[0]} y2={P2[1]} stroke={C.blue} strokeWidth={11} strokeLinecap="round" />
      {[A, B].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={9} fill={C.ink} />)}
      {done && <circle cx={P1[0]} cy={P1[1]} r={10} fill={C.green} />}
      {lc && <Label p={[x0 + L / 2, y0 + 48]} text={lc} size={size} />}
      {lb && <Label p={done ? [mid(A, P1)[0] - 50, mid(A, P1)[1] - 34] : [mid(A, P1)[0], y0 - flatLift]} text={lb} color={C.violet} size={size} />}
      {la && <Label p={done ? [mid(B, P2)[0] + 50, mid(B, P2)[1] - 34] : [mid(B, P2)[0], y0 - flatLift]} text={la} color={C.blue} size={size} />}
    </g>
  );
};

/** Horizontal side-length bars (longest on top), for the ratio scenes. */
const Bars: React.FC<{ lens: number[]; labels: React.ReactNode[]; colors: string[]; starts: number[]; x?: number; y?: number; w?: number; arrows?: { start: number; tex: string } }> = ({ lens, labels, colors, starts, x = 120, y = 250, w = 640, arrows }) => {
  const f = useCurrentFrame();
  return (
    <>
      {lens.map((len, i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: y + i * 170, opacity: ease(f, starts[i], 12) }}>
          <div style={{ width: w * len * ease(f, starts[i], 18), height: 64, background: colors[i], borderRadius: 14, opacity: 0.85 }} />
          <div style={{ position: 'absolute', left: 0, top: 70, whiteSpace: 'nowrap', fontSize: 44, fontWeight: 800, color: colors[i] }}>{labels[i]}</div>
        </div>
      ))}
      {arrows &&
        [0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: x + w * lens[i + 1] + 30, top: y + i * 170 + 80, whiteSpace: 'nowrap', ...fadeUp(f, arrows.start + i * 12) }}>
            <Tex tex={`\\downarrow \\times ${arrows.tex}`} size={50} color={C.amber} />
          </div>
        ))}
    </>
  );
};

/** "4 → 6" style arrow with a readable multiplier label on top. */
const Arrow: React.FC<{ tex: string }> = ({ tex }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 6px' }}>
    <Tex tex={tex} size={48} color={C.amber} />
    <div style={{ fontSize: 56, fontWeight: 900, color: C.amber, lineHeight: 0.6 }}>⟶</div>
  </div>
);

const Chip: React.FC<{ x: number; y: number; text: string; color: string; style?: React.CSSProperties }> = ({ x, y, text, color, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 96, height: 96, borderRadius: 24, background: color, color: '#fff', fontSize: 58, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    {text}
  </div>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const bad = at(scene, 1, 0.1);
  const chain = (vals: string[], step: string, x: number, y: number, start: number, color: string) => (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(f, start) }}>
      {vals.map((v, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {i > 0 && <Arrow tex={`\\times ${step}`} />}
          <span style={{ fontSize: 64, fontWeight: 900, color }}>{v}</span>
        </div>
      ))}
    </div>
  );
  return (
    <>
      {chain(['4', '6', '9'], '\\dfrac{3}{2}', 150, 150, 6, C.ink)}
      {chain(['1', '3', '9'], '3', 1110, 150, bad, C.ink)}
      <Stage>
        <Builder a={4} b={6} c={9} x0={150} y0={560} L={600} lift={ease(f, 30, 24)} la="4" lb="6" lc="9" opacity={ease(f, 10, 12)} />
        <Builder a={1} b={3} c={9} x0={1110} y0={560} L={600} la="1" lb="3" lc="9" opacity={ease(f, bad + 10, 12)} />
      </Stage>
      <Text x={450} y={300} w={300} size={56} weight={900} color={C.green} align="center" style={fadeUp(f, 60)}>
        ✓ 围成了
      </Text>
      <Text x={1410} y={390} w={500} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.5))}>
        ✗ 够不着
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', ...fadeUp(f, at(scene, 2)) }}>
        <span style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</span>
        <span style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginLeft: 20 }}>你的数学小导师</span>
      </div>
    </>
  );
};

export const CHOICES = ['16', '17', '18', '27', '44'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1080, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 50, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        一个三角形，<Mark on={at(scene, 1, 0.2)}>三条边长是互不相同的整数</Mark>，
        <Mark on={at(scene, 2, 0.2)}>成等比数列</Mark>，<Mark on={at(scene, 3, 0.15)}>最长边是 2025</Mark>。
        <Mark on={at(scene, 4, 0.1)}>这样的三角形一共有几个？</Mark>
      </div>
      <Choices x={130} y={660} items={CHOICES.map((c) => <span key={c} style={{ fontSize: 52 }}>{c}</span>)} start={(i) => at(scene, 5, 0.1 + i * 0.12)} />
      <Stage>
        <Builder a={1300} b={1620} c={2025} x0={1290} y0={560} L={540} lc="2025" la="?" lb="?" opacity={ease(f, 12, 14)} />
      </Stage>
      <Pill x={1370} y={650} color={C.amber} style={{ ...fadeUp(f, at(scene, 3, 0.55)), fontSize: 48 }}>
        2025 = 45²
      </Pill>
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={120} y={180} w={700} size={52} weight={900} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>
        等比：每次乘同一个数
      </Text>
      <div style={{ position: 'absolute', left: 120, top: 270, display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(f, at(scene, 0, 0.55)) }}>
        {['4', '6', '9'].map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {i > 0 && <Arrow tex="\times \dfrac{3}{2}" />}
            <span style={{ fontSize: 64, fontWeight: 900 }}>{v}</span>
          </div>
        ))}
      </div>
      <Stage>
        <Builder a={4} b={6} c={9} x0={140} y0={700} L={600} la="4" lb="6" lc="9" lift={ease(f, at(scene, 0, 0.55), 20)} opacity={ease(f, at(scene, 0, 0.55), 10)} />
      </Stage>
      <Check x={PANEL} y={230} start={at(scene, 1, 0.1)}>3 个不同的整数</Check>
      <Check x={PANEL} y={330} start={at(scene, 1, 0.6)}>最长边 = 2025</Check>
      <Check x={PANEL} y={430} start={at(scene, 2, 0.2)}>短边 + 短边 &gt; 最长边</Check>
      <Eq x={PANEL + 76} y={510} size={50} color={C.green} start={at(scene, 2, 0.6)} tex="4 + 6 = 10 > 9 \;\checkmark" />
      <Pill x={PANEL} y={640} color={C.primary} style={fadeUp(f, at(scene, 2, 0.7))}>数一数哪些数列能通过</Pill>
    </>
  );
};

const makePause = (prompt: React.ReactNode, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 220, width: 860, background: C.card, borderRadius: 32, padding: '40px 48px', fontSize: 50, fontWeight: 700, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
        {prompt}
      </div>
      <Countdown scene={scene} seconds={seconds} x={1400} y={500} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

const Ratio: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hi = ease(f, at(scene, 3, 0.3), 12);
  return (
    <>
      <Bars
        lens={[1, 7 / 9, 49 / 81]}
        labels={[<Z key="a" p={[z('最长边')]} size={44} />, <Z key="b" p={[z('中间边')]} size={44} />, <Z key="c" p={[z('最短边')]} size={44} />]}
        colors={[C.ink, C.violet, C.blue]}
        starts={[at(scene, 0, 0.3), at(scene, 2, 0.05), at(scene, 2, 0.5)]}
        arrows={{ start: at(scene, 2, 0.1), tex: '\\dfrac{p}{q}' }}
      />
      <Eq y={170} start={at(scene, 1, 0.2)} tex={[z('公比'), '= \\dfrac{p}{q}']} />
      <Eq y={170} start={at(scene, 1, 0.7)} color={C.amber} tex={[{ z: '公比', c: 'transparent' }, '\\phantom{= \\dfrac{p}{q}} < 1']} />
      <Eq y={170} start={at(scene, 1, 0.45)} color={C.muted} tex={[{ z: '公比', c: 'transparent' }, '\\phantom{= \\dfrac{p}{q} < 1}\\quad', z('（最简分数）')]} />
      <Eq y={340} start={at(scene, 2, 0.1)} color={C.violet} tex={[z('中间边'), '= 2025 \\times \\dfrac{p}{q}']} />
      <Eq y={500} start={at(scene, 2, 0.5)} color={C.blue} tex={[z('最短边'), `= 2025 \\times \\dfrac{p^2}{${hi > 0 ? '\\colorbox{#fde2b0}{$q^2$}' : 'q^2'}}`]} />
      <Eq y={690} start={at(scene, 4, 0.3)} size={60} color={C.green} tex={['q^2', z('能整除'), '2025']} />
      <Boxed x={PANEL - 24} y={672} w={560} h={110} start={at(scene, 4, 0.6)} />
    </>
  );
};

const QS = [1, 3, 5, 9, 15, 45];

const Bottoms: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const primes = ['3', '3', '3', '3', '5', '5'];
  const pair = ease(f, at(scene, 2, 0.15), 18);
  const out = fadeTo(f, at(scene, 4), 0);
  return (
    <>
      <Eq x={120} y={170} start={at(scene, 0, 0.2)} tex="2025 = 45 \times 45" opacity={out} />
      <div style={{ opacity: out }}>
        {primes.map((p, i) => (
          <Chip key={i} x={120 + i * 116 + Math.floor(i / 2) * 40 * pair} y={300} text={p} color={p === '3' ? C.violet : C.blue} style={fadeUp(f, at(scene, 1, 0.2) + i * 4)} />
        ))}
        {[0, 1, 2].map((g) => (
          <div key={g} style={{ position: 'absolute', left: 108 + g * 272, top: 288, width: 236, height: 120, border: `5px solid ${C.amber}`, borderRadius: 30, opacity: pair }} />
        ))}
        <Text x={120} y={440} w={760} size={46} weight={800} color={C.amber} style={fadeUp(f, at(scene, 2, 0.5))}>
          每对取一个：
        </Text>
        <Eq x={120} y={510} start={at(scene, 2, 0.6)} size={58} tex={['q', z('能整除'), '3 \\times 3 \\times 5 = 45']} />
      </div>
      {/* the q list (right panel) */}
      <div style={{ position: 'absolute', left: PANEL + 40, top: 170, opacity: out }}>
        <div style={{ display: 'flex', gap: 0, ...fadeUp(f, at(scene, 3, 0.05)) }}>
          <div style={{ width: 130, fontSize: 48, fontWeight: 900, color: C.muted, lineHeight: '80px' }}>
            <Tex tex="q" size={56} color={C.muted} />
            <br />
            <Tex tex="q^2" size={56} color={C.muted} />
          </div>
          {QS.map((q, i) => (
            <div key={q} style={{ width: 130, textAlign: 'center', lineHeight: '80px', ...fadeUp(f, at(scene, 3, 0.1 + i * 0.12), 10) }}>
              <Tex tex={String(q)} size={56} />
              <br />
              <Tex tex={String(q * q)} size={48} color={C.muted} />
            </div>
          ))}
        </div>
        <Text x={0} y={200} w={900} size={50} weight={900} color={C.green} style={fadeUp(f, at(scene, 3, 0.7))}>
          ✓ 每个都能整除 45
        </Text>
      </div>
      {/* rewrite over 45 */}
      <Eq x={200} y={170} start={at(scene, 4, 0.05)} size={64} tex="\dfrac{p}{q} = \dfrac{?}{45}" />
      <Eq x={200} y={380} start={at(scene, 5, 0.1)} size={64} color={C.violet} tex="\dfrac{2}{3} = \dfrac{2 \times 15}{3 \times 15} = \dfrac{30}{45}" />
      <Eq x={1100} y={380} start={at(scene, 5, 0.6)} size={64} color={C.blue} tex="\dfrac{7}{9} = \dfrac{35}{45}" />
      <Eq x={200} y={600} start={at(scene, 6, 0.3)} size={72} color={C.green} tex={[z('公比'), '= \\dfrac{m}{45}']} />
      <Boxed x={176} y={580} w={540} h={200} start={at(scene, 6, 0.5)} />
    </>
  );
};

const Sides: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ex = 36; // the example bars: m = 36
  return (
    <>
      <Bars
        lens={[1, middle(ex) / 2025, short(ex) / 2025]}
        labels={[<Tex key="c" tex="2025" size={50} />, <Tex key="b" tex="45m" size={50} color={C.violet} />, <Tex key="a" tex="m^2" size={50} color={C.blue} />]}
        colors={[C.ink, C.violet, C.blue]}
        starts={[at(scene, 0, 0.2), at(scene, 1, 0.6), at(scene, 2, 0.4)]}
        arrows={{ start: at(scene, 1, 0.3), tex: '\\dfrac{m}{45}' }}
      />
      <Eq y={160} start={at(scene, 0, 0.3)} tex={[z('最长边'), '= 2025']} />
      <Eq y={255} start={at(scene, 1, 0.2)} color={C.violet} tex={[z('中间边'), '= 2025 \\times \\dfrac{m}{45} = 45m']} />
      <Eq y={420} start={at(scene, 2, 0.2)} color={C.blue} tex={[z('最短边'), '= 45m \\times \\dfrac{m}{45} = m^2']} />
      <Text x={PANEL} y={585} w={900} size={48} weight={900} color={C.green} style={fadeUp(f, at(scene, 2, 0.8))}>
        ✓ 都是整数
      </Text>
      <Eq y={670} start={at(scene, 3, 0.3)} tex="1 \le m \le 44" />
      <Pill x={PANEL + 380} y={672} color={C.primary} style={fadeUp(f, at(scene, 3, 0.6))}>要检查 44 个数列</Pill>
    </>
  );
};

/** One cell per m = 1…44, red once it fails the triangle rule, green once it passes. */
const Strip: React.FC<{ x: number; y: number; w: number; upTo: number; opacity?: number; labels?: number[]; h?: number }> = ({ x, y, w, upTo, opacity = 1, labels = [1, 27, 28, 44], h = 46 }) => {
  const cw = w / 44;
  return (
    <g opacity={opacity}>
      {range(44).map((i) => {
        const m = i + 1;
        const fill = m > upTo ? C.line : closes(m) ? C.green : C.red;
        return <rect key={m} x={x + i * cw + 2} y={y} width={cw - 4} height={h} rx={5} fill={fill} />;
      })}
      {labels.map((m) => (
        <Label key={m} p={[m === 27 ? x + 27 * cw - 4 : m === 28 ? x + 27 * cw + 4 : x + (m - 0.5) * cw, y + h + 40]} anchor={m === 27 ? 'end' : m === 28 ? 'start' : 'middle'} text={String(m)} size={48} color={m > upTo ? C.muted : closes(m) ? C.green : C.red} />
      ))}
    </g>
  );
};

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const grow = [at(scene, 2, 0.1), at(scene, 2, 0.95)];
  const final = [at(scene, 5, 0.25), at(scene, 5, 0.95)];
  const at28 = at(scene, 4, 0.1);
  let m = 1;
  const STEPS = [1, 2, 3, 5, 10, 15, 20, 25, 26];
  if (f >= grow[0]) m = STEPS[Math.min(STEPS.length - 1, Math.floor(((f - grow[0]) / (grow[1] - grow[0])) * STEPS.length))];
  if (f >= at(scene, 3)) m = 27;
  if (f >= at28) m = 28;
  if (f >= final[0]) m = Math.min(44, 28 + Math.floor(((f - final[0]) / (final[1] - final[0])) * 17));
  const lift = m === 28 ? ease(f, at(scene, 4, 0.45), 20) : 1;
  const ok = closes(m);
  const a = short(m);
  const b = middle(m);
  const color = ok ? C.green : C.red;
  const show = ease(f, at(scene, 0, 0.3), 12);
  return (
    <>
      <Stage>
        <Builder a={a} b={b} c={2025} x0={150} y0={640} L={600} lift={lift} lc="2025" opacity={show} />
        <Strip x={PANEL} y={600} w={960} upTo={f >= at(scene, 1, 0.3) ? m : 0} opacity={show} />
      </Stage>
      <div style={{ position: 'absolute', left: PANEL, top: 170, opacity: show, lineHeight: 1 }}>
        <div style={{ height: 90 }}>
          <Tex tex={`m = ${m}`} size={64} />
        </div>
        <div style={{ height: 85 }}>
          <Z p={[z('最短边'), `= m^2 = ${a}`]} size={52} color={C.blue} />
        </div>
        <div style={{ height: 85 }}>
          <Z p={[z('中间边'), `= 45m = ${b}`]} size={52} color={C.violet} />
        </div>
        <div style={{ height: 85, opacity: ease(f, at(scene, 1, 0.4), 10) }}>
          <Tex tex={`${a} + ${b} = ${a + b} ${ok ? '>' : '<'} 2025`} size={56} color={color} />
          <span style={{ fontSize: 56, fontWeight: 900, color, marginLeft: 24 }}>{ok ? '✓' : '✗'}</span>
        </div>
      </div>
      <Pill x={150} y={740} color={C.red} style={{ ...fadeUp(f, at(scene, 3, 0.4)), opacity: (fadeUp(f, at(scene, 3, 0.4)).opacity as number) * fadeTo(f, at28) }}>
        差一点！
      </Pill>
      <Pill x={150} y={740} color={C.green} style={{ ...fadeUp(f, at(scene, 4, 0.7)) }}>
        围成了！
      </Pill>
    </>
  );
};

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 2, 0.95);
  const X = 140;
  const W = 1500;
  const cw = W / 44;
  const br = ease(f, at(scene, 0, 0.3), 14);
  return (
    <>
      <Stage>
        <Strip x={X} y={300} w={W} upTo={44} h={70} />
        <g opacity={br} stroke={C.green} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d={`M ${X + 27 * cw + 2} 280 L ${X + 27 * cw + 2} 250 L ${X + 44 * cw - 2} 250 L ${X + 44 * cw - 2} 280`} />
        </g>
        <Label p={[X + 35.5 * cw, 205]} text="这些都能围成" color={C.green} size={48} opacity={br} />
        <Label p={[X + 13.5 * cw, 230]} text="太短了" color={C.red} size={48} opacity={br} />
      </Stage>
      <Eq x={420} y={520} start={at(scene, 1, 0.2)} size={72} tex="44 - 28 + 1" />
      <Eq x={890} y={520} start={at(scene, 2, 0.2)} size={72} color={C.green} tex="= 17" />
      <Text x={420} y={650} w={700} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 1, 0.75))}>
        （+1 是把 28 自己也算上）
      </Text>
      <Answer x={1640} y={640} value="B" chime={CHIME} start={done} />
      <Confetti x={1640} y={640} start={done} seed={5} />
    </>
  );
};

const Middle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows: [number, string | Part[], string, number?][] = [
    [at(scene, 0, 0.3), [z('中间边'), '{}^2 =', z('最短边'), '\\times', z('最长边')], C.ink],
    [at(scene, 1, 0.2), '6^2 = 36 = 4 \\times 9 \\;\\checkmark', C.muted, 50],
    [at(scene, 2, 0.2), [z('中间边'), '{}^2 =', z('最短边'), '\\times 45^2'], C.ink],
    [at(scene, 3, 0.3), [z('最短边'), '= (', z('中间边'), '\\div 45)^2'], C.blue],
    [at(scene, 4, 0.2), ['\\left(\\dfrac{3}{2}\\right)^2 = \\dfrac{9}{4} \\;\\;', z('（还是分数）')], C.amber, 50],
    [at(scene, 5, 0.3), [z('最短边是整数'), '\\Rightarrow', z('中间边'), '\\div 45', z('是整数')], C.violet, 50],
    [at(scene, 6, 0.1), [z('中间边'), '= 45m, \\quad', z('最短边'), '= m^2'], C.green],
  ];
  const ys = [160, 245, 320, 400, 480, 630, 720];
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>中间边妙招</Pill>
      <Stage>
        <Builder a={4} b={6} c={9} x0={120} y0={620} L={540} la="4" lb="6" lc="9" opacity={ease(f, at(scene, 1, 0.05), 12) * fadeTo(f, at(scene, 2, 0.1), 0.35)} />
      </Stage>
      {rows.map(([start, tex, color, size], i) => (
        <Eq key={i} x={760} y={ys[i]} start={start} tex={tex} color={color} size={size ?? 54} />
      ))}
      <Pill x={90} y={720} color={C.green} style={{ ...fadeUp(f, at(scene, 7, 0.3)), opacity: (fadeUp(f, at(scene, 7, 0.3)).opacity as number) * fadeTo(f, at(scene, 8, 0.4)) }}>和刚才一样的三条边！</Pill>
      <Pill x={90} y={720} color={C.amber} style={{ ...fadeUp(f, at(scene, 8, 0.5)), fontSize: 42 }}>看到中间项：更快！</Pill>
    </>
  );
};

const NOTES = ['忘了加 1', '', '把 m = 45 也算了：三边相等', '数的是不能围成的', '漏了三角形规则'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 3, 0.1), Infinity, at(scene, 4, 0.1), at(scene, 2, 0.1), at(scene, 1, 0.1)];
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 170, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 1 && f >= at(scene, 5);
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 260, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.muted, marginTop: 22 }}>{'ABCDE'[i]}</div>
                <div style={{ fontSize: 110, fontWeight: 900, color: wrong ? C.red : right ? C.green : C.ink, marginTop: 6 }}>{c}</div>
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 18, fontSize: 36, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, color: C.red, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
              {i === 1 && (
                <div style={{ marginTop: 18, fontSize: 36, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, color: C.green, ...fadeUp(f, at(scene, 5, 0.1)) }}>
                  m = 28 … 44
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 260, top: 640, width: 1400, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.3)) }}>
        检查三角形规则，数数两头都要算！
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>轮到你了！</Pill>
      <Text x={120} y={300} w={1000} size={56} weight={800} style={fadeUp(f, at(scene, 0, 0.5))}>
        同一道题，但最长边是 <span style={{ color: C.violet }}>144</span>。
      </Text>
      <Text x={120} y={470} w={1000} size={56} weight={800} style={fadeUp(f, at(scene, 1, 0.1))}>
        现在有几个三角形？
      </Text>
      <Pill x={120} y={600} color={C.amber} style={{ ...fadeUp(f, at(scene, 2, 0.3)), fontSize: 48 }}>提示：144 = 12²</Pill>
      <Stage>
        <Builder a={60} b={110} c={144} x0={1230} y0={560} L={540} lc="144" la="?" lb="?" opacity={ease(f, at(scene, 0, 0.6), 12)} />
      </Stage>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 5, 0.95);
  const m = f < at(scene, 4, 0.05) ? 7 : 8;
  const show = ease(f, at(scene, 3, 0.05), 12);
  return (
    <>
      <Stage>
        <Builder a={short(m)} b={middle(m, 12)} c={144} x0={150} y0={640} L={600} lc="144" la={String(short(m))} lb={String(middle(m, 12))} lift={m === 8 ? ease(f, at(scene, 4, 0.4), 20) : 1} opacity={show} />
      </Stage>
      <Text x={150} y={190} w={600} size={64} weight={900} style={{ opacity: show }}>
        <Tex tex={`m = ${m}`} size={64} color={m === 8 ? C.green : C.red} />
      </Text>
      <Eq y={170} start={at(scene, 2, 0.15)} tex={[z('公比'), '= \\dfrac{m}{12} < 1']} />
      <Eq y={170} start={at(scene, 2, 0.6)} color={C.amber} tex={[{ z: '公比', c: 'transparent' }, '\\phantom{= \\dfrac{m}{12} < 1} \\;\\Rightarrow m \\le 11']} />
      <div style={{ opacity: fadeTo(f, at(scene, 3)) }}>
        <Eq x={150} y={190} start={at(scene, 0, 0.3)} tex="144 = 2^4 \times 3^2" />
        <Eq x={150} y={300} start={at(scene, 1, 0.1)} color={C.violet} tex="q = 1, 2, 3, 4, 6, 12" />
        <Text x={150} y={400} w={700} size={48} weight={900} color={C.green} style={fadeUp(f, at(scene, 1, 0.7))}>
          ✓ 每个都能整除 12
        </Text>
      </div>
      <Eq y={300} start={at(scene, 2, 0.8)} tex="m^2, \;\; 12m, \;\; 144" />
      <Eq y={400} start={at(scene, 3, 0.2)} size={52} color={C.red} tex="7: \; 49 + 84 = 133 < 144 \;\text{✗}" />
      <Eq y={490} start={at(scene, 4, 0.2)} size={52} color={C.green} tex="8: \; 64 + 96 = 160 > 144 \;\checkmark" />
      <Eq y={600} start={at(scene, 5, 0.1)} size={56} tex="m = 8, 9, 10, 11" />
      <Eq y={700} start={at(scene, 5, 0.55)} size={64} color={C.green} tex={['4', z('个三角形')]} />
      <Answer x={1720} y={680} value="4" chime={CHIME} start={done} />
      <Confetti x={1720} y={680} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 560, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 150, ...fadeUp(f, at(scene, 0, 0.1)) }}>
          <Z p={[z('中间边'), '{}^2 =', z('最短边'), '\\times', z('最长边')]} size={72} />
        </div>
        <div style={{ position: 'absolute', left: 70, top: 300, width: 1460, fontSize: 52, fontWeight: 800, color: C.violet, lineHeight: 1.3, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          它告诉你哪些边可以是整数。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 400, width: 1460, fontSize: 52, fontWeight: 800, color: C.green, lineHeight: 1.3, ...fadeUp(f, at(scene, 1, 0.55)) }}>
          再用 短边 + 短边 &gt; 最长边 筛一遍。
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
  try1: makePause(
    <>
      3 条互不相同的整数边，成等比数列。最长边是 <b>2025</b>。
      <br />
      有几个三角形？
    </>,
    10,
  ),
  ratio: Ratio,
  bottoms: Bottoms,
  sides: Sides,
  rule: Rule,
  count: Count,
  middle: Middle,
  traps: Traps,
  variant: Variant,
  try2: makePause(
    <>
      同一道题，但最长边是 <b>144</b>。
      <br />
      有几个三角形？
    </>,
    12,
  ),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第5级" font={ZH_FONT} /> : null;

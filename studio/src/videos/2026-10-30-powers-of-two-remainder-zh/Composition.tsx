import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-powers-of-two-remainder-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// 1 + 2 + 2^2 + ... + 2^99 = 2^100 - 1 (same number verify.py checks).
export const TOTAL = '1267650600228229401496703205375';

/** One colour per remainder, used everywhere a remainder shows. */
export const REM: Record<number, string> = { 0: C.muted, 1: C.primary, 2: C.violet, 3: C.amber, 4: C.blue };

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

// ---------- small helpers ----------

/** A maths line, fading up at `start`. */
const Eq: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Round remainder chip. */
export const Chip: React.FC<{ r: number; d?: number; style?: React.CSSProperties; ring?: number }> = ({ r, d = 92, style, ring = 0 }) => (
  <div style={{ width: d, height: d, borderRadius: '50%', background: REM[r], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: d * 0.6, fontWeight: 900, boxShadow: ring > 0 ? `0 0 0 ${8 * ring}px rgba(245,159,10,${0.9 * ring})` : 'none', ...style }}>
    {r}
  </div>
);

/** A power-of-two card: the power on top, then (optionally) its value and remainder chip. */
const Term: React.FC<{ k: number | string; value?: string; rem?: number; w?: number; remStart?: number; valueStart?: number; ring?: number; tint?: string; size?: number }> = ({
  k, value, rem, w = 104, remStart = 0, valueStart = 0, ring = 0, tint, size = 52,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ width: w, background: C.card, borderRadius: 20, padding: '14px 0', textAlign: 'center', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', border: `5px solid ${tint ?? 'transparent'}` }}>
        <Tex tex={`2^{${k}}`} size={size} />
        {value !== undefined && <div style={{ fontSize: 50, fontWeight: 900, color: C.muted, opacity: ease(f, valueStart, 10) }}>{value}</div>}
      </div>
      {rem !== undefined && <Chip r={rem} d={84} ring={ring} style={fadeUp(f, remStart)} />}
    </div>
  );
};

/** Row of n blocks, grouped in sevens (or fives), with leftovers in amber. */
const Blocks: React.FC<{ x: number; y: number; n: number; per: number; start: number; size?: number }> = ({ x, y, n, per, start, size = 50 }) => {
  const f = useCurrentFrame();
  const full = Math.floor(n / per) * per;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 8 }}>
      {range(n).map((i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 10,
            background: i < full ? C.primary : C.amber,
            marginLeft: i > 0 && i % per === 0 ? 26 : 0,
            opacity: ease(f, start + i * 2, 8),
          }}
        />
      ))}
    </div>
  );
};

const Pause: React.FC<{ tex: string; div: string }> = ({ tex, div }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 110, top: 300, width: 760, background: C.card, borderRadius: 32, padding: '44px 40px', textAlign: 'center', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
      <span style={{ whiteSpace: 'nowrap' }}><Tex tex={tex} size={58} /></span>
      <div style={{ fontSize: 50, fontWeight: 800, marginTop: 30 }}>
        除以 <Tex tex={div} size={60} />
      </div>
      <div style={{ fontSize: 50, fontWeight: 900, color: C.primary, marginTop: 16 }}>余数是多少？</div>
    </div>
  );
};

const makePause = (tex: string, div: string, seconds: number): SceneComponent => ({ scene }) => (
  <>
    <Pause tex={tex} div={div} />
    <Countdown scene={scene} seconds={seconds} x={1330} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
  </>
);

// ---------- scenes ----------

const INTRO_TERMS = ['1', '2', '4', '8', '16', '32', '64', '128'];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const big = at(scene, 1, 0.05);
  const shown = Math.max(0, Math.min(TOTAL.length, Math.floor((f - big) / 1.2)));
  return (
    <>
      <Text x={960} y={120} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        不停地翻倍！
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center' }}>
        {INTRO_TERMS.map((t, i) => (
          <div key={t} style={{ display: 'flex', gap: 18, ...fadeUp(f, 10 + i * 9, 10) }}>
            {i > 0 && <Tex tex="+" size={64} color={C.muted} />}
            <Tex tex={t} size={64} />
          </div>
        ))}
        <div style={fadeUp(f, 10 + 8 * 9, 10)}>
          <Tex tex="+ \cdots" size={64} color={C.muted} />
        </div>
      </div>
      <Pill x={960 - 190} y={370} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.6)), width: 380, textAlign: 'center', boxSizing: 'border-box' }}>
        100 个数
      </Pill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontSize: 74, fontWeight: 900, letterSpacing: 2, opacity: f >= big ? 1 : 0 }}>
        <span style={{ color: C.muted }}>= </span>
        {TOTAL.slice(0, shown)}
        <span style={{ opacity: 0 }}>{TOTAL.slice(shown)}</span>
      </div>
      <Pill x={960 - 170} y={600} color={C.amber} style={{ ...fadeUp(f, big + 40), width: 340, textAlign: 'center', boxSizing: 'border-box' }}>
        31 位数！
      </Pill>
      <Text x={1430} y={720} w={800} size={56} weight={900} align="center" color={C.primary} style={fadeUp(f, at(scene, 1, 0.7))}>
        除以 7 余几？
      </Text>
      <div style={{ position: 'absolute', left: 300, top: 660, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CHOICES = ['0', '1', '2', '4', '6'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1000, background: C.card, borderRadius: 32, padding: '44px 52px', fontSize: 52, fontWeight: 600, lineHeight: 1.6, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        <div style={{ whiteSpace: 'nowrap', margin: '0 0 6px' }}>
          <Mark on={at(scene, 1, 0.1)}>
            <Tex tex="1 + 2 + 2^2 + 2^3 + \cdots" size={60} />
          </Mark>{' '}
          <Tex tex="+" size={60} /> <Mark on={at(scene, 2, 0.2)}><Tex tex="2^{99}" size={60} /></Mark>
        </div>
        <Mark on={at(scene, 3, 0.25)}>除以 7</Mark>，余数是多少？
      </div>
      <Eq x={1250} y={190} start={at(scene, 1, 0.45)} tex="2^2 = 4" />
      <Eq x={1250} y={280} start={at(scene, 1, 0.6)} tex="2^3 = 8" />
      <Eq x={1250} y={400} start={at(scene, 2, 0.3)} tex="2^{99} = 2 \times 2 \times \cdots \times 2" />
      <Text x={1250} y={490} w={600} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 2, 0.5))}>
        （99 个 2 相乘）
      </Text>
      <Choices x={100} y={640} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 4, 0.1 + i * 0.13)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const powers = ['0', '1', '2', '3', '\\cdots', '98', '99'];
  return (
    <>
      <Text x={120} y={160} w={1700} size={50} weight={800} style={fadeUp(f, at(scene, 0, 0.3))}>
        余数 = 把所有的 <span style={{ color: C.primary }}>7</span> 都拿走以后，剩下的数
      </Text>
      <Blocks x={120} y={265} n={20} per={7} start={at(scene, 2, 0.1)} />
      <Eq x={1380} y={250} start={at(scene, 2, 0.5)} size={60} tex="20 = 2 \times 7 + {\color{#f59f0a}6}" />
      {/* the terms with their powers */}
      <div style={{ position: 'absolute', left: 120, top: 400, display: 'flex', gap: 22, alignItems: 'flex-start', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        {powers.map((p, i) =>
          p === '\\cdots' ? (
            <div key={i} style={{ width: 104, textAlign: 'center', paddingTop: 30 }}>
              <Tex tex="\cdots" size={56} />
            </div>
          ) : (
            <Term key={i} k={p} w={i === 0 ? 150 : p.length > 1 ? 124 : 104} value={i === 0 ? '= 1' : undefined} valueStart={at(scene, 4, 0.05)} tint={i === 0 ? C.amber : undefined} />
          ),
        )}
      </div>
      <Text x={1180} y={400} w={680} size={48} weight={800} color={C.amber} style={fadeUp(f, at(scene, 4, 0.05))}>
        往回看，每次减半：
      </Text>
      <Eq x={1160} y={470} start={at(scene, 4, 0.3)} size={48} color={C.amber} tex="2^2 = 4 \to 2^1 = 2 \to 2^0 = 1" />
      <Eq x={1180} y={570} start={at(scene, 5, 0.2)} tex={[z('指数'), '0, 1, 2, \\ldots, 99']} />
      <div style={{ position: 'absolute', left: 120, top: 670, display: 'flex', alignItems: 'center', gap: 30, ...fadeUp(f, at(scene, 6, 0.1)) }}>
        <Tex tex="1 + 99 =" size={60} />
        <div style={{ fontSize: 60, fontWeight: 900, color: C.green }}>100 项</div>
        <div style={{ fontSize: 52, fontWeight: 800, color: C.red, textDecoration: 'line-through' }}>99</div>
      </div>
      <Pill x={1180} y={690} color={C.violet} style={fadeUp(f, at(scene, 7, 0.4))}>
        太大了！找规律。
      </Pill>
    </>
  );
};

/** Columns for the cycle scene: power, value, "how many sevens + what's left", remainder. */
const CYCLE = [
  { k: 0, v: 1, split: '', r: 1 },
  { k: 1, v: 2, split: '', r: 2 },
  { k: 2, v: 4, split: '', r: 4 },
  { k: 3, v: 8, split: '7 + {\\color{#0cc281}1}', r: 1 },
  { k: 4, v: 16, split: '14 + {\\color{#7b61ff}2}', r: 2 },
  { k: 5, v: 32, split: '28 + {\\color{#3c83f6}4}', r: 4 },
];
const CX = (i: number) => 150 + i * 262 + (i >= 3 ? 40 : 0);

const Cycle: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const colStart = [at(scene, 0, 0.35), at(scene, 0, 0.5), at(scene, 0, 0.65), at(scene, 2, 0.05), at(scene, 3, 0.05), at(scene, 4, 0.05)];
  const remStart = [at(scene, 1, 0.6), at(scene, 1, 0.75), at(scene, 1, 0.9), at(scene, 2, 0.6), at(scene, 3, 0.6), at(scene, 4, 0.7)];
  const groups = ease(f, at(scene, 5, 0.1), 14);
  const why = ease(f, at(scene, 7, 0.4), 14);
  const dbl = ease(f, at(scene, 6, 0.2), 14) * fadeTo(f, at(scene, 8, 0.1));
  return (
    <>
      <Pill x={CX(0)} y={150} color={C.violet} style={fadeUp(f, at(scene, 0, 0.4))}>除以 7 的余数</Pill>
      {CYCLE.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: CX(i), top: 250, width: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', ...fadeUp(f, colStart[i]) }}>
          <div style={{ width: 230, height: 270, background: C.card, borderRadius: 24, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, boxSizing: 'border-box' }}>
            <Tex tex={`2^{${c.k}}`} size={56} />
            <div style={{ fontSize: 60, fontWeight: 900, marginTop: 2 }}>{c.v}</div>
            <div style={{ height: 70, marginTop: 4 }}>{c.split && <Tex tex={c.split} size={48} />}</div>
          </div>
          <Chip r={c.r} d={100} style={{ marginTop: 22, ...fadeUp(f, remStart[i]) }} />
        </div>
      ))}
      {/* group brackets under each cycle */}
      <Stage>
        {[0, 3].map((g) => {
          const x1 = CX(g) + 20;
          const x2 = CX(g + 2) + 210;
          return (
            <path key={g} d={`M ${x1} 660 L ${x1} 680 L ${x2} 680 L ${x2} 660`} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={groups} />
          );
        })}
        {/* "double 4 is 8" arrow from the third chip to the fourth */}
        <g opacity={why}>
          <path d={`M ${CX(2) + 170} 600 Q ${(CX(2) + CX(3)) / 2 + 115} 520 ${CX(3) + 50} 600`} stroke={C.amber} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M ${CX(3) + 30} 584 L ${CX(3) + 52} 602 L ${CX(3) + 56} 574`} stroke={C.amber} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Stage>
      <Text x={(CX(2) + CX(3)) / 2 + 115} y={598} w={160} size={48} weight={900} color={C.amber} align="center" style={{ opacity: why }}>
        ×2
      </Text>
      <Text x={(CX(0) + CX(2) + 230) / 2} y={700} w={700} size={52} weight={900} align="center" color={C.violet} style={{ opacity: groups * fadeTo(f, at(scene, 6, 0.1)) }}>
        一轮
      </Text>
      <Text x={(CX(3) + CX(5) + 230) / 2} y={700} w={700} size={52} weight={900} align="center" color={C.violet} style={{ opacity: groups * fadeTo(f, at(scene, 6, 0.1)) }}>
        又一轮
      </Text>
      <Eq x={CX(0) + 20} y={700} start={at(scene, 6, 0.2)} opacity={dbl} tex={[z('翻倍：'), '{\\color{#0cc281}1} \\to {\\color{#7b61ff}2} \\to {\\color{#3c83f6}4} \\to 8']} />
      <Eq x={CX(0) + 700} y={700} start={at(scene, 7, 0.45)} opacity={dbl} color={C.amber} tex={['= 7 + {\\color{#0cc281}1} \\to', z('回到'), '{\\color{#0cc281}1}']} />
      <Eq x={CX(0) + 110} y={700} start={at(scene, 8, 0.3)} size={60} color={C.green} tex="1 + 2 + 4 = 7 \;\checkmark" />
    </>
  );
};

/** Groups of three, as power cards with their remainder chips. */
const GROUPS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], null, [96, 97, 98]] as const;

const Groups: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const gStart = [at(scene, 0, 0.3), at(scene, 0, 0.6), at(scene, 1, 0.1), at(scene, 2, 0.1), at(scene, 2, 0.2)];
  const sevens = at(scene, 1, 0.45);
  const leftover = at(scene, 3, 0.1);
  const starts = ease(f, at(scene, 4, 0.1), 12) * fadeTo(f, at(scene, 6, 0.1));
  const leftRem = at(scene, 5, 0.6);
  const done = at(scene, 6, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 110, top: 160, display: 'flex', gap: 34, alignItems: 'flex-start' }}>
        {GROUPS.map((g, i) =>
          g === null ? (
            <div key={i} style={{ width: 60, paddingTop: 40, ...fadeUp(f, gStart[i]) }}>
              <Tex tex="\cdots" size={60} />
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...fadeUp(f, gStart[i]) }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {g.map((k, j) => (
                  <Term key={k} k={k} w={k >= 10 ? 112 : 96} size={48} rem={[1, 2, 4][j]} remStart={gStart[i] + 6} ring={j === 0 ? starts : 0} />
                ))}
              </div>
              <div style={{ marginTop: 12, width: '100%', height: 18, borderBottom: `5px solid ${C.ink}`, borderLeft: `5px solid ${C.ink}`, borderRight: `5px solid ${C.ink}`, borderRadius: '0 0 10px 10px', boxSizing: 'border-box', opacity: ease(f, sevens, 10) }} />
              <div style={{ marginTop: 6, ...fadeUp(f, sevens) }}>
                <Tex tex="7" size={56} color={C.green} />
              </div>
            </div>
          ),
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 20, ...fadeUp(f, leftover) }}>
          <Term k={99} w={112} size={48} tint={C.amber} rem={1} remStart={leftRem} />
        </div>
      </div>
      <Eq x={110} y={470} start={at(scene, 2, 0.35)} tex={[z('前'), '99', z('项'), '= 33', z('组'), '\\to', z('余'), '0']} />
      <Eq x={110} y={552} start={at(scene, 4, 0.2)} tex={[z('指数'), '0, 3, 6, \\ldots \\to', z('余'), '1']} />
      <Eq x={110} y={634} start={at(scene, 5, 0.2)} color={C.amber} tex={['99 = 3 \\times 33 \\;\\to\\; 2^{99}', z('余'), '1']} />
      <Eq x={110} y={722} start={at(scene, 6, 0.3)} size={60} color={C.green} tex={[z('总和：'), '0 + 1 = 1']} />
      <Answer x={1660} y={640} value="B" chime={CHIME} start={done} />
      <Confetti x={1660} y={640} start={done} seed={5} />
    </>
  );
};

const SNOW = [
  '{\\color{#f59f0a}1} + 1 + 2 + 4 + 8 + \\cdots + 2^{99}',
  '= 2 + 2 + 4 + 8 + \\cdots + 2^{99}',
  '= 4 + 4 + 8 + \\cdots + 2^{99}',
  '= 8 + 8 + \\cdots + 2^{99}',
  '= 2^{99} + 2^{99} = 2^{100}',
];

const Doubling: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [at(scene, 0, 0.5), at(scene, 1, 0.15), at(scene, 1, 0.45), at(scene, 1, 0.8), at(scene, 2, 0.4)];
  const R = 1060;
  return (
    <>
      <Pill x={110} y={150} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.2)), fontSize: 48 }}>再多加一个 1</Pill>
      {SNOW.map((t, i) => (
        <Eq key={i} x={110} y={250 + i * 88} start={starts[i]} size={52} tex={t} />
      ))}
      <Text x={650} y={608} w={460} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 3, 0.4))}>
        （100 个 2 相乘）
      </Text>
      <div style={{ position: 'absolute', left: 90, top: 680, ...fadeUp(f, at(scene, 4, 0.1)) }}>
        <div style={{ border: `6px solid ${C.green}`, borderRadius: 20, padding: '6px 22px' }}>
          <Z p={[z('和'), '= 2^{100} - 1']} size={58} />
        </div>
      </div>
      <Eq x={R} y={170} start={at(scene, 5, 0.1)} tex={['8 = 7 + 1 \\to', z('余'), '1']} />
      <Text x={R} y={255} w={800} size={48} weight={900} color={C.violet} style={fadeUp(f, at(scene, 5, 0.6))}>
        乘 8 就像乘 1
      </Text>
      <Eq x={R} y={360} start={at(scene, 6, 0.2)} tex={['2^{99} = 8^{33} \\to', z('余'), '1']} />
      <Eq x={R} y={460} start={at(scene, 7, 0.3)} tex={['2^{100} = 2 \\times 2^{99} \\to', z('余'), '2']} />
      <Eq x={R} y={570} start={at(scene, 8, 0.2)} size={60} color={C.green} tex="2^{100} - 1 \;\to\; 2 - 1 = 1" />
      <Pill x={R} y={700} color={C.primary} style={{ ...fadeUp(f, at(scene, 9, 0.5)), fontSize: 48 }}>翻倍求和 → 一个次方</Pill>
    </>
  );
};

const TRAP_NOTES = ['只算了 99 项', '', '忘了减 1', '不可能', '不可能'];
const RUN = [
  [1, 1],
  [3, 3],
  [7, 0],
  [15, 1],
  [31, 3],
  [63, 0],
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.1), Infinity, at(scene, 2, 0.1), at(scene, 3, 0.1), at(scene, 3, 0.25)];
  const run = at(scene, 4, 0.0);
  return (
    <>
      <div style={{ position: 'absolute', left: 110, top: 140, display: 'flex', gap: 34 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const right = i === 1 && f >= at(scene, 1);
          const border = wrong ? C.red : right ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 312, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 162, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: C.muted, marginTop: 8 }}>{'ABCDE'[i]}</div>
                <Tex tex={c} size={72} color={wrong ? C.red : right ? C.green : C.ink} />
                {(wrong || right) && (
                  <div style={{ position: 'absolute', top: -24, right: -24, width: 60, height: 60, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 38, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {TRAP_NOTES[i] && (
                <div style={{ marginTop: 14, width: 344, marginLeft: -16, fontSize: 48, fontWeight: 800, textAlign: 'center', color: C.red, lineHeight: 1.15, ...fadeUp(f, wrongAt[i] + 8) }}>{TRAP_NOTES[i]}</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 110, top: 445, display: 'flex', alignItems: 'center', gap: 26, ...fadeUp(f, at(scene, 4, 0.0)) }}>
        <div style={{ width: 380, fontSize: 48, fontWeight: 900, whiteSpace: 'nowrap' }}>累加的总和</div>
        {RUN.map(([n], i) => (
          <div key={n} style={{ width: 150, textAlign: 'center', fontSize: 58, fontWeight: 900, ...fadeUp(f, run + i * 14, 10) }}>
            {n}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 110, top: 545, display: 'flex', alignItems: 'center', gap: 26 }}>
        <div style={{ width: 380, fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 4, 0.6)) }}>余数</div>
        {RUN.map(([n, r], i) => (
          <div key={n} style={{ width: 150, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 4, 0.6) + i * 4, 10) }}>
            <Chip r={r} d={88} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 110, top: 650, width: 1400, fontSize: 48, fontWeight: 900, color: C.green, lineHeight: 1.3, ...fadeUp(f, at(scene, 4, 0.85)) }}>
        只有 1、3 或 0，不会是 4 或 6！
      </div>
      <div style={{ position: 'absolute', left: 360, top: 725, width: 1200, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '20px 40px', fontSize: 48, fontWeight: 900, boxSizing: 'border-box', ...fadeUp(f, at(scene, 5, 0.3)) }}>
        从 0 次方开始，数清有几项！
      </div>
    </>
  );
};

const VSERIES = '1 + 2 + 2^2 + 2^3 + \\cdots + 2^{50}';

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.2))}>轮到你了！</Pill>
      <Eq x={120} y={300} start={at(scene, 0, 0.5)} size={72} tex={VSERIES} />
      <Text x={120} y={440} w={1400} size={60} weight={900} style={fadeUp(f, at(scene, 1, 0.1))}>
        除以 <span style={{ color: C.primary }}>5</span>，余数是多少？
      </Text>
      <Pill x={120} y={600} color={C.amber} style={fadeUp(f, at(scene, 2, 0.2))}>先找循环！</Pill>
    </>
  );
};

const VCYCLE = [
  { k: 0, v: '1', r: 1 },
  { k: 1, v: '2', r: 2 },
  { k: 2, v: '4', r: 4 },
  { k: 3, v: '8', r: 3 },
  { k: 4, v: '16', r: 1 },
];

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 6, 0.97);
  const remAt = (i: number) => at(scene, 0, 0.45 + i * 0.1);
  return (
    <>
      <div style={{ position: 'absolute', left: 110, top: 150, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 56, fontWeight: 900, width: 150, paddingTop: 30, ...fadeUp(f, 4) }}>÷ 5</div>
        {VCYCLE.map((c, i) => (
          <div key={i} style={{ marginLeft: i === 4 ? 30 : 0, ...fadeUp(f, at(scene, 0, 0.1 + i * 0.08)) }}>
            <Term k={c.k} w={130} size={48} value={c.v} rem={c.r} remStart={remAt(i)} tint={i === 4 ? C.line : undefined} />
          </div>
        ))}
      </div>
      <Eq x={1070} y={170} start={at(scene, 1, 0.1)} tex={[z('一轮'), '4', z('项')]} color={C.violet} />
      <Eq x={1070} y={260} start={at(scene, 1, 0.4)} tex="1 + 2 + 4 + 3 = 10 = 2 \times 5" />
      <Eq x={110} y={470} start={at(scene, 2, 0.3)} size={52} tex={[z('指数'), '0', z('到'), '50 \\;\\to\\; 51', z('项')]} />
      <Eq x={900} y={470} start={at(scene, 3, 0.15)} size={52} color={C.violet} tex="51 = 12 \times 4 + 3" />
      <Eq x={110} y={555} start={at(scene, 3, 0.6)} size={52} tex={[z('前'), '48', z('项'), '= 12', z('组'), '\\to', z('余'), '0']} />
      <Eq x={110} y={640} start={at(scene, 4, 0.2)} size={52} color={C.amber} tex={[z('剩下：'), '2^{48},\\; 2^{49},\\; 2^{50}']} />
      <Eq x={720} y={644} start={at(scene, 5, 0.2)} size={48} color={C.amber} tex={['(48 = 4 \\times 12 \\to', z('新一轮'), ')']} />
      <Eq x={110} y={725} start={at(scene, 6, 0.2)} size={56} color={C.green} tex={['1 + 2 + 4 = 7 = 5 + 2 \\to', z('余'), '2']} />
      <Answer x={1640} y={620} value="2" chime={CHIME} start={done} />
      <Confetti x={1640} y={620} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, height: 600, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 60, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>关键思路</div>
        <div style={{ position: 'absolute', left: 70, top: 140, width: 900, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 1, 0.05)) }}>
          找出余数的循环。
        </div>
        <div style={{ position: 'absolute', left: 70, top: 240, width: 920, fontSize: 48, fontWeight: 800, lineHeight: 1.3, ...fadeUp(f, at(scene, 1, 0.4)) }}>
          一整轮加起来，是不是除数的倍数？
        </div>
        <div style={{ position: 'absolute', left: 70, top: 420, width: 920, fontSize: 52, fontWeight: 900, color: C.amber, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          再处理剩下的项。
        </div>
        <div style={{ position: 'absolute', left: 1080, top: 150, display: 'flex', gap: 14, ...fadeUp(f, at(scene, 0, 0.4)) }}>
          {[1, 2, 4].map((r) => (
            <Chip key={r} r={r} d={110} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 1120, top: 300, ...fadeUp(f, at(scene, 1, 0.6)) }}>
          <Tex tex="1 + 2 + 4 = 7" size={60} color={C.green} />
        </div>
        <div style={{ position: 'absolute', left: 1240, top: 400, ...fadeUp(f, at(scene, 2, 0.3)) }}>
          <Chip r={1} d={110} style={{ boxShadow: `0 0 0 8px ${C.amber}` }} />
        </div>
      </div>
      <SignOff start={at(scene, 3, 0.1)} text="继续发现规律！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause('1 + 2 + 2^2 + \\cdots + 2^{99}', '7', 10),
  cycle: Cycle,
  groups: Groups,
  doubling: Doubling,
  traps: Traps,
  variant: Variant,
  try2: makePause('1 + 2 + 2^2 + \\cdots + 2^{50}', '5', 12),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第5级" font={ZH_FONT} /> : null;

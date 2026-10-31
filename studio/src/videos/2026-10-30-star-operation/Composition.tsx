import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-star-operation';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const NEVER = 1e7;
const PH = '#0cc281'; // TOP tint
const VH = '#7b61ff'; // BOTTOM tint
const tp = (s: string) => `\\textcolor{${PH}}{${s}}`;
const bt = (s: string) => `\\textcolor{${VH}}{${s}}`;
const RULE = `a\\star b=\\dfrac{${tp('a+b')}}{${bt('1+ab')}}`;

// ---------- building blocks ----------

type Seg = { tex: string; start: number; end?: number; color?: string; size?: number };
type Piece = Seg | { group: Seg[]; w: number; h?: number };

const segOp = (f: number, s: Seg) => ease(f, s.start, 10) * (1 - (s.end !== undefined ? ease(f, s.end, 10) : 0));

/** A row of maths pieces that appear (and swap) at given frames. Groups stack alternatives in one slot. */
const Expr: React.FC<{ x?: number; y: number; size?: number; pieces: Piece[]; color?: string; center?: boolean; wipe?: number; opacity?: number }> = ({
  x = 0, y, size = 56, pieces, color = C.ink, center, wipe, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const p = wipe === undefined ? 1 : ease(f, wipe, 22);
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, top: y, width: center ? 1920 : undefined, display: 'flex', justifyContent: center ? 'center' : 'flex-start', whiteSpace: 'nowrap', opacity }}>
      <div style={{ display: 'flex', alignItems: 'center', clipPath: wipe === undefined ? undefined : `inset(-20px ${(1 - p) * 100}% -20px 0)` }}>
        {pieces.map((pc, i) =>
          'group' in pc ? (
            <div key={i} style={{ display: 'grid', width: pc.w, height: pc.h, gridTemplateRows: pc.h ? `${pc.h}px` : undefined, alignItems: 'center' }}>
              {pc.group.map((s, j) => (
                <div key={j} style={{ gridArea: '1 / 1', opacity: segOp(f, s), lineHeight: 1 }}>
                  <Tex tex={s.tex} size={s.size ?? size} color={s.color ?? color} />
                </div>
              ))}
            </div>
          ) : (
            <div key={i} style={{ opacity: segOp(f, pc) }}>
              <Tex tex={pc.tex} size={size} color={pc.color ?? color} />
            </div>
          ),
        )}
      </div>
    </div>
  );
};

const Win: React.FC<{ a: number; b?: number; children: React.ReactNode }> = ({ a, b = NEVER, children }) => {
  const f = useCurrentFrame();
  const o = ease(f, a, 10) * (1 - ease(f, b, 8));
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div>;
};

const Box: React.FC<{ x: number; y: number; w: number; h: number; color: string; tint: string; label: string; start: number; out?: number; children?: React.ReactNode }> = ({
  x, y, w, h, color, tint, label, start, out = NEVER, children,
}) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 12) * (1 - ease(f, out, 10));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `5px solid ${color}`, borderRadius: 28, background: tint, opacity: o }}>
      <div style={{ position: 'absolute', left: 24, top: -30, background: color, color: '#fff', borderRadius: 999, padding: '4px 24px', fontSize: 38, fontWeight: 900 }}>{label}</div>
      {children}
    </div>
  );
};
const TopBox: React.FC<Omit<React.ComponentProps<typeof Box>, 'color' | 'tint' | 'label'>> = (p) => <Box {...p} color={PH} tint="rgba(12,194,129,0.08)" label="TOP" />;
const BotBox: React.FC<Omit<React.ComponentProps<typeof Box>, 'color' | 'tint' | 'label'>> = (p) => <Box {...p} color={VH} tint="rgba(123,97,255,0.08)" label="BOTTOM" />;

/** Rule card pinned top-right. `flash` pulses the purple bottom. */
const Rule: React.FC<{ start?: number; flash?: number; opacity?: number }> = ({ start = -100, flash = NEVER, opacity = 1 }) => {
  const f = useCurrentFrame();
  const t = f - flash;
  const pulse = t >= 0 && t < 50 ? Math.sin((t / 50) * Math.PI) : 0;
  return (
    <div style={{ position: 'absolute', left: 1400, top: 108, padding: '10px 22px', background: C.card, borderRadius: 22, boxShadow: `0 4px 16px rgba(30,40,80,0.08), 0 0 0 ${pulse * 10}px rgba(123,97,255,${pulse * 0.5})`, ...fadeUp(f, start), opacity: ease(f, start, 14) * opacity }}>
      <Tex tex={RULE} size={48} />
    </div>
  );
};

const STAR_PTS = (cx: number, cy: number, R: number) =>
  range(10).map((i) => {
    const r = i % 2 === 0 ? R : R * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
const StarIcon: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number; scale?: number }> = ({ x, y, r, color, opacity = 1, scale = 1 }) => (
  <svg style={{ position: 'absolute', left: x - r - 10, top: y - r - 10, opacity, transform: `scale(${scale})` }} width={2 * r + 20} height={2 * r + 20}>
    <polygon points={STAR_PTS(r + 10, r + 10, r)} fill={color} stroke={color} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

const VALS = ['\\dfrac57', '\\dfrac{9}{11}', '\\dfrac78'];
const EXPRS = ['\\dfrac12\\star\\dfrac13', '\\star\\dfrac14', '\\star\\dfrac15'];
const VVALS = ['\\dfrac{7}{13}', '\\dfrac23', '\\dfrac34'];
const VEXPRS = ['\\dfrac13\\star\\dfrac14', '\\star\\dfrac15', '\\star\\dfrac16'];

/** The chain tracker: three slots that fill in when the voice says each result. */
const Tracker: React.FC<{
  x?: number; y?: number; exprs?: string[]; vals?: string[]; fills: number[]; dashed?: boolean[]; start?: number; hi?: number;
}> = ({ x = 40, y = 124, exprs = EXPRS, vals = VALS, fills, dashed = [false, false, false], start = -100, hi = NEVER }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 10, ...fadeUp(f, start) }}>
      {range(3).map((i) => {
        const filled = f >= fills[i];
        const prevFilled = i === 0 || f >= fills[i - 1];
        const left = (i === 0 ? exprs[0] : (prevFilled ? vals[i - 1] : '\\,?\\,') + exprs[i]) + '\\to';
        const isHi = f >= hi && i === 2;
        const p = ease(f, fills[i], 10);
        const s = pop(f, fills[i]);
        return (
          <div key={i} style={{ width: 425, height: 150, boxSizing: 'border-box', background: isHi ? 'rgba(33,196,93,0.14)' : C.card, border: `4px ${dashed[i] ? 'dashed' : 'solid'} ${isHi ? C.green : dashed[i] ? C.red : C.line}`, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', boxShadow: isHi ? '0 0 0 8px rgba(33,196,93,0.2)' : undefined }}>
            <div style={{ lineHeight: 1, display: 'flex', alignItems: 'center' }}><Tex tex={left} size={48} /></div>
            <div style={{ display: 'grid', minWidth: 100, justifyItems: 'start', alignItems: 'center', lineHeight: 1 }}>
              <div style={{ gridArea: '1 / 1', opacity: 1 - p }}>{dashed[i] ? <span style={{ fontSize: 40, fontWeight: 900, color: C.red }}>left</span> : <div style={{ lineHeight: 1, display: 'flex', alignItems: 'center' }}><Tex tex={'\\,?'} size={48} color={C.muted} /></div>}</div>
              <div style={{ gridArea: '1 / 1', opacity: p, transform: `scale(${filled ? 0.85 + 0.15 * s : 0.85})`, transformOrigin: 'left center' }}>
                <Tex tex={vals[i]} size={50} color={isHi ? C.green : PH} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CHOICES = ['\\dfrac57', '\\dfrac{9}{11}', '\\dfrac78', '\\dfrac{14}{15}', '\\dfrac{77}{60}'];

/** The five answer chips. okAt turns C green, badAt marks a wrong one red. */
const Chips: React.FC<{ x: number; y: number; start: (i: number) => number; okAt?: number[]; badAt?: number[]; vertical?: boolean; size?: number; dim?: number }> = ({
  x, y, start, okAt = [], badAt = [], vertical, size = 52,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 14 : 22 }}>
      {CHOICES.map((c, i) => {
        const ok = f >= (okAt[i] ?? NEVER);
        const bad = f >= (badAt[i] ?? NEVER);
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), position: 'relative', display: 'flex', alignItems: 'center', gap: 14, background: ok ? C.green : C.card, color: ok ? '#fff' : C.ink, border: `4px solid ${ok ? C.green : bad ? C.red : C.line}`, borderRadius: 20, padding: '8px 26px', width: vertical ? 330 : undefined, boxSizing: 'border-box', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: ok ? '#fff' : C.muted, fontSize: 38, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={size} color={ok ? '#fff' : bad ? C.red : C.ink} />
            {bad && <span style={{ marginLeft: 'auto', color: C.red, fontSize: 52, fontWeight: 900 }}>✗</span>}
            {ok && <span style={{ marginLeft: 'auto', color: '#fff', fontSize: 52, fontWeight: 900 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
};

const QEXPR = '\\left(\\left(\\dfrac12\\star\\dfrac13\\right)\\star\\dfrac14\\right)\\star\\dfrac15';
const VEXPR = '\\left(\\left(\\dfrac13\\star\\dfrac14\\right)\\star\\dfrac15\\right)\\star\\dfrac16';

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const big = pop(f, 4);
  const starOut = 1 - ease(f, at(scene, 1, 0.0), 10);
  const chainIn = ease(f, at(scene, 1, 0.05), 12) * (1 - ease(f, at(scene, 2, 0), 10));
  const X = [560, 960, 1360];
  return (
    <>
      <StarIcon x={960} y={430} r={190} color={C.violet} opacity={starOut} scale={big} />
      <div style={{ opacity: chainIn }}>
        <Text x={960} y={190} w={1500} size={60} weight={900} align="center">Three stars in a row</Text>
        {X.map((cx, i) => {
          const left = i === 2;
          const o = left ? 0.45 : 1;
          return (
            <div key={i} style={{ opacity: ease(f, at(scene, 1, 0.1 + 0.2 * i), 10) * o }}>
              <div style={{ position: 'absolute', left: cx - 100, top: 340, width: 200, height: 200, borderRadius: '50%', border: `6px ${left ? 'dashed' : 'solid'} ${left ? C.muted : C.violet}`, background: C.card }} />
              <StarIcon x={cx} y={440} r={64} color={left ? C.muted : C.violet} />
              <Text x={cx} y={570} w={400} size={48} weight={800} align="center" color={left ? C.muted : C.ink}>{`step ${i + 1}`}</Text>
              {i < 2 && <Text x={cx + 100} y={400} w={160} size={80} weight={900} align="center" color={C.muted}>→</Text>}
            </div>
          );
        })}
        <Text x={1360} y={640} w={500} size={48} weight={900} align="center" color={C.red} style={{ opacity: ease(f, at(scene, 1, 0.65), 10) }}>left behind!</Text>
        <Text x={960} y={720} w={1200} size={48} weight={800} align="center" color={C.red} style={{ opacity: ease(f, at(scene, 1, 0.65), 10) }}>Stopping after step 2 is too early</Text>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.05)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 170, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 66, fontWeight: 900, marginTop: 14 }}>Hi, let's crack it together!</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <Expr center y={170} size={76} wipe={at(scene, 0, 0.1)} pieces={[{ tex: RULE, start: at(scene, 0, 0.1) }]} />
    <Expr center y={420} size={72} wipe={at(scene, 1, 0.1)} pieces={[{ tex: QEXPR, start: at(scene, 1, 0.1) }]} />
    <Chips x={200} y={690} size={56} start={(i) => at(scene, 2, 0.1 + 0.13 * i)} />
  </>
);

const MACHINE_IN = ['a', 'b'];
const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0 = 1 - ease(f, at(scene, 1, 0), 10);
  const mach = ease(f, at(scene, 1, 0.02), 10) * (1 - ease(f, at(scene, 2, 0), 10));
  const st = (n: number) => `\\underbrace{${n >= 1 ? '\\left(' : ''}${n >= 2 ? '\\underbrace{\\left(' : ''}`;
  void st;
  const U1 = '\\underbrace{\\bigl(\\dfrac12\\star\\dfrac13\\bigr)}_{\\text{1st}}';
  const U2 = `\\underbrace{\\bigl(${U1}\\star\\dfrac14\\bigr)}_{\\text{2nd}}`;
  const U3 = `\\underbrace{${U2}\\star\\dfrac15}_{\\text{3rd}}`;
  const stages = [QEXPR.replace(/\\left/g, '\\bigl').replace(/\\right/g, '\\bigr'), `\\bigl(${U1}\\star\\dfrac14\\bigr)\\star\\dfrac15`, `${U2}\\star\\dfrac15`, U3];
  const sAt = [at(scene, 2, 0.02), at(scene, 2, 0.2), at(scene, 2, 0.48), at(scene, 2, 0.75)];
  return (
    <>
      <Rule start={at(scene, 1, 0)} />
      <div style={{ opacity: l0 }}>
        <div style={{ position: 'absolute', left: 0, top: 190, width: 1920, display: 'flex', justifyContent: 'center', fontSize: 76, ...fadeUp(f, 4) }}>
          <Mark on={at(scene, 0, 0.35)}><Tex tex={RULE} size={76} /></Mark>
        </div>
        <Expr center y={470} size={64} opacity={0.22} pieces={[{ tex: QEXPR, start: 0 }]} />
      </div>
      <div style={{ opacity: mach }}>
        {MACHINE_IN.map((s, i) => (
          <div key={s} style={{ position: 'absolute', left: 230, top: 270 + i * 160, width: 130, height: 130, borderRadius: 28, background: C.card, border: `5px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.12 + 0.12 * i)) }}>
            <Tex tex={s} size={72} />
          </div>
        ))}
        <Text x={380} y={330} w={200} size={80} weight={900} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.3)) }}>→</Text>
        <div style={{ position: 'absolute', left: 640, top: 270, width: 290, height: 290, borderRadius: 40, background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.4)) }}>
          <svg width={200} height={200}><polygon points={STAR_PTS(100, 104, 92)} fill="#fff" /></svg>
        </div>
        <Text x={960} y={330} w={200} size={80} weight={900} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.6)) }}>→</Text>
        <div style={{ position: 'absolute', left: 1180, top: 305, width: 330, height: 220, borderRadius: 28, background: C.card, border: `5px solid ${C.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 1, 0.7)) }}>
          <Tex tex={'a\\star b'} size={72} color={C.primary} />
        </div>
        <Text x={1180} y={560} w={420} size={48} weight={800} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.75)) }}>one new number</Text>
        <Text x={230} y={610} w={500} size={48} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.3)) }}>two numbers in</Text>
      </div>
      <Expr center y={185} size={72} pieces={[{ group: stages.map((tex, i) => ({ tex, start: sAt[i], end: sAt[i + 1] })), w: 1200 }]} />
      <Text x={960} y={740} w={1500} size={50} weight={800} color={C.violet} align="center" style={fadeUp(f, at(scene, 2, 0.5))}>each answer feeds the next star</Text>
    </>
  );
};

const makePause = (seconds: number, expr: string, withChips: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Expr x={80} y={260} size={64} pieces={[{ tex: expr, start: 4 }]} />
      {withChips && <Chips x={80} y={560} start={() => 8} size={48} />}
      {!withChips && <Text x={80} y={460} w={900} size={48} weight={800} color={C.muted} style={fadeUp(f, 10)}>Find the final answer as a fraction.</Text>}
      <Countdown scene={scene} seconds={seconds} x={1560} y={540} tick={TICK} />
    </>
  );
};

// ----- shared step layout -----
const BOX_Y = 480;
const BOX_H = 355;

const Step1: SceneComponent = ({ scene }) => {
  const TPL = `\\dfrac{${tp('\\dfrac12+\\dfrac13')}}{${bt('1+\\dfrac12\\cdot\\dfrac13')}}`;
  const a = at(scene, 4, 0.0), b = at(scene, 4, 0.42);
  return (
    <>
      <Tracker fills={[at(scene, 4, 0.82), NEVER, NEVER]} start={at(scene, 1, 0)} />
      <Rule start={-100} />
      <Expr x={80} y={308} size={52} pieces={[
        { tex: '\\dfrac12\\star\\dfrac13=', start: at(scene, 1, 0.2) },
        { group: [
          { tex: TPL, start: at(scene, 1, 0.6), end: at(scene, 2, 0), size: 48 },
          { tex: `\\dfrac{${tp('\\text{top}')}}{${bt('\\text{bottom}')}}`, start: at(scene, 2, 0.05), end: a },
          { tex: `${tp('\\dfrac56')}\\div${bt('\\dfrac76')}`, start: a, end: b },
          { tex: '\\dfrac{5}{\\cancel{6}}\\div\\dfrac{7}{\\cancel{6}}', start: b },
        ], w: 340, h: 120 },
        { tex: '=\\dfrac57', start: at(scene, 4, 0.76), color: C.green },
      ]} />
      <TopBox x={60} y={BOX_Y} w={900} h={BOX_H} start={at(scene, 2, 0.1)}>
        <Expr x={30} y={140} size={52} pieces={[
          { tex: '\\dfrac12+\\dfrac13', start: at(scene, 2, 0.05) },
          { tex: '=\\dfrac36+\\dfrac26', start: at(scene, 2, 0.4) },
          { tex: '=\\dfrac56', start: at(scene, 2, 0.7), color: PH },
        ]} />
      </TopBox>
      <BotBox x={990} y={BOX_Y} w={890} h={BOX_H} start={at(scene, 3, 0)}>
        <Expr x={30} y={50} size={48} color={C.muted} pieces={[{ tex: '\\dfrac12\\cdot\\dfrac13=\\dfrac16', start: at(scene, 3, 0.02) }]} />
        <Expr x={30} y={195} size={52} pieces={[
          { tex: '1+\\dfrac16', start: at(scene, 3, 0.3) },
          { tex: '=\\dfrac66+\\dfrac16', start: at(scene, 3, 0.55) },
          { tex: '=\\dfrac76', start: at(scene, 3, 0.8), color: VH },
        ]} />
      </BotBox>
    </>
  );
};

const Step2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fly = ease(f, 2, 22);
  const a = at(scene, 3, 0.0), b = at(scene, 3, 0.16);
  const g1 = at(scene, 3, 0.55);
  const g2 = at(scene, 3, 0.35);
  return (
    <>
      <Tracker fills={[0, at(scene, 3, 0.78), NEVER]} />
      <Rule start={-100} />
      <div style={{ position: 'absolute', left: 330 + (80 - 330) * fly, top: 160 + (300 - 160) * fly, opacity: f < 2 ? 0 : 1 - ease(f, 26, 4), pointerEvents: 'none' }}>
        <Tex tex={'\\dfrac57'} size={52} color={PH} />
      </div>
      <Expr x={80} y={300} size={52} pieces={[
        { tex: '\\dfrac57\\star\\dfrac14=', start: 25 },
        { group: [
          { tex: `${tp('\\dfrac{27}{28}')}\\div${bt('\\dfrac{33}{28}')}`, start: a, end: b },
          { tex: '\\dfrac{27}{\\cancel{28}}\\div\\dfrac{33}{\\cancel{28}}', start: b },
        ], w: 270 },
        { group: [
          { tex: '=\\dfrac{27}{33}', start: g2, end: g1 },
          { tex: '=\\dfrac{27\\,{\\color{#f59f0a}\\div3}}{33\\,{\\color{#f59f0a}\\div3}}', start: g1 },
        ], w: 260 },
        { tex: '=\\dfrac{9}{11}', start: at(scene, 3, 0.78), color: C.green },
      ]} />
      <TopBox x={60} y={BOX_Y} w={900} h={BOX_H} start={at(scene, 1, 0)}>
        <Expr x={26} y={140} size={50} pieces={[
          { tex: '\\dfrac57+\\dfrac14', start: at(scene, 1, 0.05) },
          { tex: '=\\dfrac{20}{28}+\\dfrac{7}{28}', start: at(scene, 1, 0.4) },
          { tex: '=\\dfrac{27}{28}', start: at(scene, 1, 0.72), color: PH },
        ]} />
      </TopBox>
      <BotBox x={990} y={BOX_Y} w={890} h={BOX_H} start={at(scene, 2, 0)}>
        <Expr x={26} y={50} size={48} color={C.muted} pieces={[{ tex: '\\dfrac57\\cdot\\dfrac14=\\dfrac{5}{28}', start: at(scene, 2, 0.02) }]} />
        <Expr x={26} y={195} size={50} pieces={[
          { tex: '1+\\dfrac{5}{28}', start: at(scene, 2, 0.3) },
          { tex: '=\\dfrac{28}{28}+\\dfrac{5}{28}', start: at(scene, 2, 0.5) },
          { tex: '=\\dfrac{33}{28}', start: at(scene, 2, 0.78), color: VH },
        ]} />
      </BotBox>
    </>
  );
};

const Step3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fly = ease(f, 2, 22);
  const a = at(scene, 3, 0.0), b = at(scene, 3, 0.14);
  const g2 = at(scene, 3, 0.28);
  const g1 = at(scene, 3, 0.55);
  const done = at(scene, 4, 0.97);
  const out = at(scene, 4, 0.0);
  return (
    <>
      <Tracker fills={[0, 0, at(scene, 4, 0.34)]} hi={at(scene, 4, 0.34)} />
      <Rule start={-100} />
      <div style={{ position: 'absolute', left: 740 + (80 - 740) * fly, top: 160 + (300 - 160) * fly, opacity: f < 2 ? 0 : 1 - ease(f, 26, 4), pointerEvents: 'none' }}>
        <Tex tex={'\\dfrac{9}{11}'} size={52} color={PH} />
      </div>
      <Expr x={80} y={300} size={52} pieces={[
        { tex: '\\dfrac{9}{11}\\star\\dfrac15=', start: 25 },
        { group: [
          { tex: `${tp('\\dfrac{56}{55}')}\\div${bt('\\dfrac{64}{55}')}`, start: a, end: b },
          { tex: '\\dfrac{56}{\\cancel{55}}\\div\\dfrac{64}{\\cancel{55}}', start: b },
        ], w: 270 },
        { group: [
          { tex: '=\\dfrac{56}{64}', start: g2, end: g1 },
          { tex: '=\\dfrac{56\\,{\\color{#f59f0a}\\div8}}{64\\,{\\color{#f59f0a}\\div8}}', start: g1 },
        ], w: 260 },
        { tex: '=\\dfrac{7}{8}', start: at(scene, 4, 0.32), color: C.green },
      ]} />
      <TopBox x={60} y={BOX_Y} w={900} h={BOX_H} start={at(scene, 1, 0)} out={out}>
        <Expr x={26} y={140} size={50} pieces={[
          { tex: '\\dfrac{9}{11}+\\dfrac15', start: at(scene, 1, 0.05) },
          { tex: '=\\dfrac{45}{55}+\\dfrac{11}{55}', start: at(scene, 1, 0.4) },
          { tex: '=\\dfrac{56}{55}', start: at(scene, 1, 0.72), color: PH },
        ]} />
      </TopBox>
      <BotBox x={990} y={BOX_Y} w={890} h={BOX_H} start={at(scene, 2, 0)} out={out}>
        <Expr x={26} y={50} size={48} color={C.muted} pieces={[{ tex: '\\dfrac{9}{11}\\cdot\\dfrac15=\\dfrac{9}{55}', start: at(scene, 2, 0.02) }]} />
        <Expr x={26} y={195} size={50} pieces={[
          { tex: '1+\\dfrac{9}{55}', start: at(scene, 2, 0.3) },
          { tex: '=\\dfrac{55}{55}+\\dfrac{9}{55}', start: at(scene, 2, 0.5) },
          { tex: '=\\dfrac{64}{55}', start: at(scene, 2, 0.78), color: VH },
        ]} />
      </BotBox>
      <Chips x={250} y={510} start={(i) => out + 4 + i * 3} okAt={[NEVER, NEVER, at(scene, 4, 0.62)]} />
      <Answer x={960} y={760} value="C" chime={CHIME} start={done} />
      <Confetti x={960} y={760} start={done} seed={5} />
    </>
  );
};

const Score: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t: number) => at(scene, i, t);
  return (
    <>
      <Rule start={-100} />
      <Expr x={80} y={235} size={56} pieces={[{ tex: '\\text{score}(x)=\\dfrac{1+x}{1-x}', start: l(1, 0.2), color: C.violet }]} />
      <Expr x={80} y={400} size={50} pieces={[
        { tex: '\\text{score}\\bigl(\\dfrac12\\bigr)', start: l(2, 0.0) },
        { tex: '=\\dfrac32\\div\\dfrac12', start: l(2, 0.3) },
        { tex: '=3', start: l(2, 0.75), color: C.green },
      ]} />
      <Expr x={80} y={550} size={50} pieces={[
        { tex: '\\text{score}\\bigl(\\dfrac13\\bigr)', start: l(3, 0.0) },
        { tex: '=\\dfrac43\\div\\dfrac23', start: l(3, 0.15) },
        { tex: '=2', start: l(3, 0.3), color: C.green },
      ]} />
      <div style={{ position: 'absolute', left: 250, top: 725, padding: '10px 36px', border: `5px solid ${C.violet}`, borderRadius: 26, background: C.violetSoft, ...fadeUp(f, l(3, 0.6)) }}>
        <Tex tex={'\\text{score}(a\\star b)=\\text{score}(a)\\times\\text{score}(b)'} size={50} color={C.violet} />
      </div>
      <Expr x={1000} y={265} size={50} pieces={[{ tex: '\\dfrac12\\star\\dfrac13', start: l(4, 0.1) }, { tex: '=\\dfrac57', start: l(4, 0.45), color: PH }]} />
      <Expr x={1000} y={400} size={50} pieces={[
        { tex: '\\text{score}\\bigl(\\dfrac57\\bigr)', start: l(5, 0.0) },
        { tex: '=\\dfrac{12}{7}\\div\\dfrac27', start: l(5, 0.2) },
        { tex: '=6', start: l(5, 0.4), color: C.green },
      ]} />
      <Expr x={1000} y={560} size={56} pieces={[{ tex: '3\\times2=6', start: l(5, 0.62), color: C.green }]} />
      <Check x={1380} y={572} start={l(5, 0.8)}>{''}</Check>
    </>
  );
};

const Why: SceneComponent = ({ scene }) => {
  const l = (i: number, t: number) => at(scene, i, t);
  const n0 = l(1, 0.5), n1 = l(1, 0.72);
  const NEST = `\\dfrac{\\dfrac{${tp('(1+a)(1+b)')}}{${bt('1+ab')}}}{\\dfrac{${tp('(1-a)(1-b)')}}{${bt('1+ab')}}}`;
  const NESTC = `\\dfrac{\\dfrac{${tp('(1+a)(1+b)')}}{${bt('\\cancel{1+ab}')}}}{\\dfrac{${tp('(1-a)(1-b)')}}{${bt('\\cancel{1+ab}')}}}`;
  return (
    <>
      <Rule start={-100} />
      <Win a={l(0, 0.8)} b={l(1, 0)}>
        <Expr x={60} y={430} size={48} pieces={[{ tex: '(1+a)(1+b)=1+a+b+ab', start: l(0, 0.82), color: C.muted }]} />
        <Check x={800} y={444} start={l(0, 0.9)}>{''}</Check>
      </Win>
      <Expr x={60} y={250} size={48} pieces={[
        { tex: `1+(a\\star b)=\\dfrac{${tp('1+ab+a+b')}}{${bt('1+ab')}}`, start: l(0, 0.25) },
        { tex: `=\\dfrac{${tp('(1+a)(1+b)')}}{${bt('1+ab')}}`, start: l(0, 0.65) },
      ]} />
      <Expr x={60} y={395} size={48} pieces={[
        { tex: `1-(a\\star b)=\\dfrac{${tp('1+ab-a-b')}}{${bt('1+ab')}}`, start: l(1, 0.05) },
        { tex: `=\\dfrac{${tp('(1-a)(1-b)')}}{${bt('1+ab')}}`, start: l(1, 0.3) },
      ]} />
      <Expr x={60} y={560} size={48} pieces={[
        { tex: '\\dfrac{1+(a\\star b)}{1-(a\\star b)}=', start: n0 },
        { group: [{ tex: NEST, start: n0, end: n1 }, { tex: NESTC, start: n1 }], w: 340 },
        { tex: `=\\dfrac{${tp('(1+a)(1+b)')}}{${tp('(1-a)(1-b)')}}`, start: l(1, 0.88) },
      ]} />
    </>
  );
};

const ScoreChain: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = [1, 2, 3, 5, 6, 7];
  const l = (i: number, t: number) => at(scene, m[i], t);
  const q = (t: number) => at(scene, 4, t);
  const NUMS = ['\\dfrac12', '\\dfrac13', '\\dfrac14', '\\dfrac15'];
  const SC = ['\\dfrac31', '\\dfrac42', '\\dfrac53', '\\dfrac64'];
  const p1 = l(1, 0.1), p2 = l(1, 0.35), p3 = l(1, 0.55);
  const out2 = l(2, 0);
  const barX = 216, pw = 93;
  const barOp = ease(f, q(0.02), 8);
  const pulse = (() => { const t = f - l(4, 0.55); return t >= 0 && t < 40 ? 1 + 0.12 * Math.sin((t / 40) * Math.PI) : 1; })();
  return (
    <>
      <Rule start={-100} />
      <Text x={960} y={330} w={1500} size={56} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, 8, 12) * (1 - ease(f, at(scene, 1, 0), 8)) }}>Each star multiplies the scores</Text>
      <Win a={at(scene, 1, 0)} b={out2}>
        {NUMS.map((n, i) => (
          <div key={i} style={{ position: 'absolute', left: 140 + i * 420, top: 240, width: 380, height: 400, background: C.card, borderRadius: 28, boxShadow: '0 6px 24px rgba(30,40,80,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, ...fadeUp(f, l(0, 0.05 + 0.2 * i)) }}>
            <Tex tex={n} size={48} />
            <div style={{ fontSize: 40, fontWeight: 800, color: C.muted, opacity: ease(f, l(0, 0.15 + 0.2 * i), 10) }}>↓ score</div>
            <div style={{ opacity: ease(f, l(0, 0.2 + 0.2 * i), 10) }}><Tex tex={SC[i]} size={52} color={C.violet} /></div>
          </div>
        ))}
        <Expr x={110} y={655} size={56} pieces={[
          { group: [
            { tex: `${SC.join('\\times')}`, start: p1, end: p2 },
            { tex: '\\dfrac{\\cancel{3}}{1}\\times\\dfrac42\\times\\dfrac{5}{\\cancel{3}}\\times\\dfrac64', start: p2, end: p3 },
            { tex: '\\dfrac{\\cancel{3}}{1}\\times\\dfrac{\\cancel{4}}{2}\\times\\dfrac{5}{\\cancel{3}}\\times\\dfrac{6}{\\cancel{4}}', start: p3 },
          ], w: 800 },
          { tex: '=\\dfrac{5\\times6}{1\\times2}', start: l(1, 0.72) },
          { tex: '=15', start: l(1, 0.88), color: C.green },
        ]} />
      </Win>
      <Expr x={100} y={215} size={60} pieces={[
        { group: [{ tex: '\\dfrac{1+x}{1-x}=15', start: l(2, 0.05), end: l(2, 0.5) }, { tex: '1+x=15\\,(1-x)', start: l(2, 0.5) }], w: 700, h: 80 },
      ]} />
      <Text x={900} y={245} w={900} size={48} weight={800} color={C.muted} style={fadeUp(f, l(2, 0.15))}>(x means the answer)</Text>
      {/* the 16-part bar */}
      <Stage>
        <g opacity={barOp}>
          {range(16).map((k) => {
            const vis = ease(f, q(0.05 + k * 0.03), 6);
            return <rect key={k} x={barX + k * pw + 2} y={515} width={pw - 4} height={72} rx={8} fill={k < 15 ? C.primary : C.violet} opacity={vis * 0.92} />;
          })}
          <path d={`M ${barX} 615 v 14 H ${barX + 16 * pw} v -14`} stroke={C.ink} strokeWidth={5} fill="none" opacity={ease(f, q(0.55), 10)} />
        </g>
      </Stage>
      <div style={{ opacity: ease(f, q(0.3), 10) }}>
        <div style={{ position: 'absolute', left: barX + 7 * pw - 60, top: 410, ...fadeUp(f, q(0.35)) }}><Tex tex={'1+x'} size={56} color={PH} /></div>
        <div style={{ position: 'absolute', left: barX + 15 * pw + 4, top: 410, ...fadeUp(f, q(0.45)) }}><Tex tex={'1-x'} size={56} color={VH} /></div>
      </div>
      <div style={{ position: 'absolute', left: barX + 8 * pw - 20, top: 625, ...fadeUp(f, q(0.6)) }}><Tex tex={'2'} size={56} /></div>
      <Expr x={110} y={335} size={52} pieces={[{ tex: '(1+x)+(1-x)=2', start: q(0.5), color: C.violet }]} />
      <Expr x={110} y={705} size={52} pieces={[{ tex: '\\text{each part}=\\dfrac{2}{16}=\\dfrac18', start: l(3, 0.75) }]} />
      <div style={{ position: 'absolute', left: 900, top: 715, whiteSpace: 'nowrap', transform: `scale(${pulse})`, transformOrigin: 'left center', ...fadeUp(f, l(4, 0.2)) }}>
        <Tex tex={'1-x=\\dfrac18\\ \\Rightarrow\\ x=\\dfrac78'} size={52} color={C.green} />
      </div>
      <Pill x={1250} y={300} color={C.violet} style={{ ...fadeUp(f, l(5, 0.3)), fontSize: 40 }}>Long chain? Use scores!</Pill>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t: number) => at(scene, i, t);
  const N0 = 400, N1 = 1000;
  const px = (v: number) => N0 + (N1 - N0) * v;
  const wall = ease(f, l(4, 0.3), 12);
  return (
    <>
      <Rule start={-100} flash={l(3, 0.45)} />
      <Chips x={60} y={225} size={48} start={(i) => l(0, 0.2 + 0.1 * i)} okAt={[NEVER, NEVER, 0]} badAt={[l(1, 0.3), l(2, 0.3), NEVER, l(5, 0.3), l(3, 0.5)]} />
      <Win a={l(1, 0)} b={l(2, 0)}>
        <Tracker x={40} y={390} fills={[0, NEVER, NEVER]} dashed={[false, true, true]} />
        <Text x={60} y={570} w={1500} size={48} weight={800} color={C.red}>Only step 1 is done. Two stars are left!</Text>
      </Win>
      <Win a={l(2, 0)} b={l(3, 0)}>
        <Tracker x={40} y={390} fills={[0, 0, NEVER]} dashed={[false, false, true]} />
        <Text x={60} y={570} w={1500} size={48} weight={800} color={C.red}>Only step 2 is done. One star is left!</Text>
      </Win>
      <Win a={l(3, 0)} b={l(4, 0)}>
        <Expr x={60} y={400} size={50} pieces={[
          { tex: '\\dfrac12+\\dfrac13+\\dfrac14+\\dfrac15', start: l(3, 0.05) },
          { tex: '=\\dfrac{30+20+15+12}{60}', start: l(3, 0.4) },
          { tex: '=\\dfrac{77}{60}', start: l(3, 0.62), color: C.red },
        ]} />
        <Expr x={60} y={600} size={48} pieces={[{ tex: RULE, start: l(3, 0.5) }]} />
        <Text x={640} y={620} w={1200} size={48} weight={800} color={C.red} style={fadeUp(f, l(3, 0.75))}>Only the top is used. The purple bottom is forgotten!</Text>
      </Win>
      <Win a={l(4, 0)} b={l(5, 0)}>
        <Expr x={60} y={390} size={50} pieces={[{ tex: '0<a<1,\\ 0<b<1\\ \\Rightarrow\\ a\\star b<1', start: l(4, 0.1) }]} />
        <Stage>
          <rect x={N0} y={588} width={N1 - N0} height={26} rx={13} fill={C.primary} opacity={0.25 * ease(f, l(4, 0.25), 10)} />
          <line x1={N0 - 40} y1={601} x2={1180} y2={601} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={ease(f, l(4, 0.25), 10)} />
          <line x1={px(0)} y1={568} x2={px(0)} y2={634} stroke={C.ink} strokeWidth={6} opacity={ease(f, l(4, 0.25), 10)} />
          <line x1={px(1)} y1={520} x2={px(1)} y2={660} stroke={C.violet} strokeWidth={14} strokeLinecap="round" opacity={wall} />
          <circle cx={px(77 / 60)} cy={601} r={20} fill={C.red} opacity={ease(f, l(4, 0.72), 8)} />
        </Stage>
        <div style={{ position: 'absolute', left: px(0) - 14, top: 645, opacity: ease(f, l(4, 0.25), 10) }}><Tex tex="0" size={52} /></div>
        <div style={{ position: 'absolute', left: px(1) - 12, top: 645, opacity: wall }}><Tex tex="1" size={52} color={C.violet} /></div>
        <Text x={px(1) - 150} y={470} w={300} size={42} weight={800} color={C.violet} align="center" style={{ opacity: wall }}>ceiling</Text>
        <div style={{ position: 'absolute', left: 1250, top: 540, opacity: ease(f, l(4, 0.75), 10) }}><Tex tex={'\\dfrac{77}{60}>1'} size={56} color={C.red} /></div>
      </Win>
      <Win a={l(5, 0)} b={l(6, 0)}>
        <Text x={60} y={420} w={1350} size={48} weight={800} color={C.muted} style={fadeUp(f, l(5, 0.1))}>What you'd get if you did:</Text>
        <Expr x={60} y={520} size={60} pieces={[{ tex: '1-\\dfrac{1}{15}=\\dfrac{14}{15}', start: l(5, 0.35), color: C.red }]} />
      </Win>
      <Win a={l(6, 0)}>
        <Expr x={60} y={400} size={56} pieces={[
          { tex: '\\text{score}=15', start: l(6, 0.05), color: C.red },
          { tex: '\\ \\longrightarrow\\ ', start: l(6, 0.4) },
          { tex: '1+x=15\\,(1-x)', start: l(6, 0.45) },
        ]} />
        <Text x={60} y={520} w={1350} size={48} weight={800} color={C.violet} style={fadeUp(f, l(6, 0.4))}>16 parts, each part one over eight</Text>
        <Expr x={60} y={620} size={60} pieces={[{ tex: 'x=\\dfrac78', start: l(6, 0.7), color: C.green }]} />
        <Check x={330} y={645} start={l(6, 0.8)}>{''}</Check>
      </Win>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const big = 1 - ease(f, at(scene, 1, 0), 10);
  return (
    <>
      <Rule start={at(scene, 1, 0)} />
      <Pill x={120} y={130} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.1)), opacity: ease(f, at(scene, 0, 0.1), 14) * big }}>Your turn!</Pill>
      <div style={{ opacity: big }}>
        <Expr center y={330} size={80} wipe={at(scene, 0, 0.3)} pieces={[{ tex: RULE, start: at(scene, 0, 0.3) }]} />
      </div>
      <Tracker exprs={VEXPRS} vals={VVALS} fills={[NEVER, NEVER, NEVER]} start={at(scene, 1, 0.3)} />
      <Expr center y={400} size={76} wipe={at(scene, 1, 0.1)} pieces={[{ tex: VEXPR, start: at(scene, 1, 0.1) }]} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const m = [0, 1, 2, 3, 5, 6];
  const l = (i: number, t: number) => at(scene, m[i], t);
  const done = l(2, 0.97);
  const rowsOut = ease(f, l(3, 0), 10);
  const NUMS = ['\\dfrac42', '\\dfrac53', '\\dfrac64', '\\dfrac75'];
  void NUMS;
  const c1 = l(3, 0.45), c2 = l(3, 0.6);
  const barX = 280, pw = 160;
  return (
    <>
      <Rule start={-100} />
      <Tracker exprs={VEXPRS} vals={VVALS} fills={[l(0, 0.8), l(1, 0.8), l(2, 0.55)]} hi={l(2, 0.55)} />
      <div style={{ opacity: 1 - rowsOut }}>
        <Expr x={60} y={295} size={52} pieces={[
          { tex: '\\dfrac13\\star\\dfrac14=', start: l(0, 0.05) },
          { tex: `${tp('\\dfrac{7}{12}')}\\div${bt('\\dfrac{13}{12}')}`, start: l(0, 0.3) },
          { tex: '=\\dfrac{7}{13}', start: l(0, 0.7), color: C.green },
        ]} />
        <Expr x={60} y={465} size={52} pieces={[
          { tex: '\\dfrac{7}{13}\\star\\dfrac15=', start: l(1, 0.05) },
          { tex: `${tp('\\dfrac{48}{65}')}\\div${bt('\\dfrac{72}{65}')}`, start: l(1, 0.3) },
          { tex: '=\\dfrac{48}{72}=\\dfrac23', start: l(1, 0.65), color: C.green },
        ]} />
        <Expr x={60} y={635} size={52} pieces={[
          { tex: '\\dfrac23\\star\\dfrac16=', start: l(2, 0.05) },
          { tex: `${tp('\\dfrac{5}{6}')}\\div${bt('\\dfrac{10}{9}')}`, start: l(2, 0.25) },
          { tex: '=\\dfrac56\\times\\dfrac{9}{10}', start: l(2, 0.5) },
          { tex: '=\\dfrac{45}{60}=\\dfrac34', start: l(2, 0.65), color: C.green },
        ]} />
      </div>
      <Expr x={80} y={295} size={56} pieces={[
        { group: [
          { tex: '\\dfrac42\\times\\dfrac53\\times\\dfrac64\\times\\dfrac75', start: l(3, 0.1), end: c1 },
          { tex: '\\dfrac{\\cancel{4}}{2}\\times\\dfrac{\\cancel5}{3}\\times\\dfrac{6}{\\cancel4}\\times\\dfrac{7}{\\cancel5}', start: c1 },
        ], w: 720 },
        { tex: '=\\dfrac{6\\times7}{2\\times3}', start: c2 },
        { tex: '=7', start: l(3, 0.8), color: C.green },
      ]} />
      <Expr x={80} y={480} size={54} pieces={[{ tex: '1+x=7\\,(1-x)', start: at(scene, 4, 0.3) }]} />
      <Expr x={800} y={490} size={48} pieces={[{ tex: '(1+x)+(1-x)=2', start: l(4, 0.15), color: C.violet }]} />
      <Stage>
        {range(8).map((k) => (
          <rect key={k} x={barX + k * pw + 3} y={635} width={pw - 6} height={68} rx={8} fill={k < 7 ? C.primary : C.violet} opacity={0.92 * ease(f, l(4, 0.04 + k * 0.05), 6)} />
        ))}
      </Stage>
      <div style={{ position: 'absolute', left: barX + 3 * pw - 20, top: 565, ...fadeUp(f, l(4, 0.2)) }}><Tex tex={'1+x'} size={52} color={PH} /></div>
      <div style={{ position: 'absolute', left: barX + 7 * pw + 36, top: 565, ...fadeUp(f, l(4, 0.3)) }}><Tex tex={'1-x'} size={52} color={VH} /></div>
      <Expr x={barX} y={720} size={50} pieces={[{ tex: '\\text{each part}=\\dfrac28=\\dfrac14', start: l(4, 0.5) }]} />
      <Expr x={barX + 620} y={720} size={50} pieces={[{ tex: '1-x=\\dfrac14\\Rightarrow x=\\dfrac34', start: l(4, 0.75), color: C.green }]} />
      <Answer x={1730} y={380} value="3/4" chime={CHIME} start={done} />
      <Confetti x={1730} y={380} start={l(5, 0.1)} seed={9} />
      <Pill x={1330} y={160 + 0} color={C.primary} style={{ ...fadeUp(f, l(5, 0.2)), fontSize: 36, top: 800, left: 1460 }}>Amazing work!</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t: number) => at(scene, i, t);
  const out = fadeTo(f, l(3, 0));
  return (
    <>
      <div style={{ opacity: out }}>
        <Text x={960} y={120} w={1200} size={52} weight={900} color={C.primary} align="center" style={fadeUp(f, 4)}>The big idea</Text>
        <Expr center y={200} size={76} pieces={[{ tex: RULE, start: l(1, 0.05) }]} />
        <div style={{ position: 'absolute', left: 270, top: 460, display: 'flex', gap: 40, alignItems: 'center', ...fadeUp(f, l(1, 0.4)) }}>
          <div style={{ border: `5px solid ${PH}`, background: 'rgba(12,194,129,0.08)', borderRadius: 24, padding: '12px 44px', fontSize: 48, fontWeight: 900, color: PH }}>TOP</div>
          <div style={{ border: `5px solid ${VH}`, background: 'rgba(123,97,255,0.08)', borderRadius: 24, padding: '12px 44px', fontSize: 48, fontWeight: 900, color: VH }}>BOTTOM</div>
          <div style={{ fontSize: 46, fontWeight: 800 }}>one step at a time</div>
        </div>
        <Tracker x={260} y={610} fills={[0, 0, l(2, 0.3)]} hi={l(2, 0.3)} start={l(2, 0)} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, l(3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 150, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 56, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={l(3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, QEXPR, true),
  step1: Step1,
  step2: Step2,
  step3: Step3,
  score: Score,
  why: Why,
  'score-chain': ScoreChain,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, VEXPR, false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

void NUNITO;
export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

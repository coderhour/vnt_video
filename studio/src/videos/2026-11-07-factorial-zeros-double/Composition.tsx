import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { SignOff } from '../../lib/Brand';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { PACIFICO } from '../../lib/fonts';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';

export const SLUG = '2026-11-07-factorial-zeros-double';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const G5 = C.primary; // fives / rule one
const P25 = C.violet; // twenty-fives / rule two
const RED = C.red; // spill / crossed out
const OK = C.green; // survivors / answer
const INK = C.ink;
export const CHOICES = ['20', '24', '26', '30', '50'];

const FL = (a: string, b: string) => `\\left\\lfloor\\dfrac{${a}}{${b}}\\right\\rfloor`;

// ---------- helpers ----------

/** Fades a whole layer in at `a` and out at `b`. Children use absolute full-frame coordinates. */
const Fade: React.FC<{ a?: number; b?: number; children: React.ReactNode }> = ({ a = 0, b, children }) => {
  const f = useCurrentFrame();
  const o = ease(f, a, 12) * (b === undefined ? 1 : fadeTo(f, b, 0, 12));
  if (o <= 0.001) return null;
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div>;
};

const Parts: React.FC<{ x: number; y: number; parts: [number, string, string?][]; size?: number; center?: boolean; gap?: number }> = ({ x, y, parts, size = 52, center = false, gap = 14 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center', gap, whiteSpace: 'nowrap' }}>
      {parts.map(([start, tex, color], i) => (
        <div key={i} style={fadeUp(f, start)}>
          <Tex tex={tex} size={size} color={color ?? INK} />
        </div>
      ))}
    </div>
  );
};

const Eq: React.FC<{ x?: number; y: number; tex: string; start: number; size?: number; color?: string; center?: boolean }> = ({ x = 0, y, tex, start, size = 52, color, center }) => (
  <Parts x={x} y={y} center={center} size={size} parts={[[start, tex, color]]} />
);

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number; center?: boolean }> = ({ x, y, start, color, children, size = 44, w, center }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, width: w, top: y, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', textAlign: center ? 'center' : 'left', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Chip: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ x, y, start, color, children, size = 48, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, background: color, color: '#fff', borderRadius: 999, padding: '8px 28px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', ...fadeUp(f, start), ...style }}>
      {children}
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; start: number; border?: string; fill?: string; children?: React.ReactNode }> = ({ x, y, w, h, start, border = 'transparent', fill = C.card, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: fill, borderRadius: 28, border: `6px solid ${border}`, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

/** Digits with the last k zeros coloured. */
const ZR = (s: string, k: number, col: string) => `${s.slice(0, s.length - k)}{\\color{${col}}${s.slice(s.length - k)}}`;

// ---------- the two "fives" rows kept on top of fives + double ----------

const TopRows: React.FC<{ t1: number; t1b: number; t2: number; t2b: number }> = ({ t1, t1b, t2, t2b }) => (
  <>
    <Parts x={100} y={135} size={48} parts={[[t1, '\\text{fives in }n!='], [t1, FL('n', '5'), G5], [t1b, `+${FL('n', '25')}`, P25]]} />
    <Parts
      x={100}
      y={250}
      size={48}
      parts={[[t2, '\\text{fives in }(2n)!='], [t2, FL('2n', '5'), G5], [t2, `+${FL('2n', '25')}`, P25], [t2b, `+${FL('2n', '125')}`, RED]]}
    />
  </>
);

// ---------- Scene: intro ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const x0 = 140;
  return (
    <>
      <Fade a={2} b={l1}>
        <Parts x={x0} y={205} size={68} parts={[[at(scene, 0, 0.05), `10!=${ZR('3628800', 2, G5)}`]]} />
        <Chip x={1180} y={215} start={at(scene, 0, 0.25)} color={G5} size={48}>2 zeros</Chip>
        <Parts x={x0} y={405} size={68} parts={[[at(scene, 0, 0.45), `20!=${ZR('2432902008176640000', 4, G5)}`]]} />
        <Chip x={1180} y={415} start={at(scene, 0, 0.65)} color={G5} size={48}>4 zeros</Chip>
        <Tag x={1250} y={320} start={at(scene, 0, 0.82)} color={OK} size={56}>×2 ✓</Tag>
      </Fade>
      <Fade a={l1} b={l2}>
        <Parts x={x0} y={205} size={68} parts={[[at(scene, 1, 0.05), `8!=${ZR('40320', 1, G5)}`]]} />
        <Chip x={1180} y={215} start={at(scene, 1, 0.2)} color={G5} size={48}>1 zero</Chip>
        <Parts x={x0} y={405} size={68} parts={[[at(scene, 1, 0.4), `16!=${ZR('20922789888000', 3, RED)}`]]} />
        <Chip x={1180} y={415} start={at(scene, 1, 0.65)} color={RED} size={48}>3 zeros</Chip>
        <Parts x={1200} y={318} size={56} parts={[[at(scene, 1, 0.8), '3>2\\times1', RED]]} />
      </Fade>
      <Fade a={l2}>
        <Text x={960} y={250} w={1700} size={88} weight={900} align="center" style={fadeUp(f, l2 + 4)}>
          When does doubling work?
        </Text>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
          <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -4 }}>your math tutor</div>
        </div>
      </Fade>
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={100} y={130} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>
        Question
      </Pill>
      <div style={{ position: 'absolute', left: 100, top: 210, width: 1720, background: C.card, borderRadius: 32, padding: '30px 52px', fontSize: 52, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', lineHeight: 1.45, ...fadeUp(f, 4) }}>
        <div style={{ whiteSpace: 'nowrap' }}>
          Here{' '}
          <Mark on={at(scene, 0, 0.3)}>
            <Tex tex="n!=1\times2\times\cdots\times n" size={56} />
          </Mark>{' '}
          is the product.
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          For how many{' '}
          <Mark on={at(scene, 1, 0.3)}>
            integers <Tex tex="n" size={56} /> from 1 to 100
          </Mark>{' '}
          does
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <Mark on={at(scene, 2, 0.2)}>
            <Tex tex="(2n)!" size={56} /> end in exactly twice as many zeros as <Tex tex="n!" size={56} />
          </Mark>
          ?
        </div>
      </div>
      <Choices x={170} y={640} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fall = (start: number, y1: number) => {
    const p = ease(f, start, 20);
    return { opacity: ease(f, start, 6), y: 120 + (y1 - 120) * p };
  };
  const a10 = fall(at(scene, 1, 0.08), 290);
  const a8 = fall(at(scene, 1, 0.3), 290);
  const goalIn = at(scene, 2, 0.1);
  return (
    <>
      <Card x={150} y={190} w={700} h={400} start={at(scene, 0, 0.1)} border={OK} fill="rgba(33,196,93,0.08)" />
      <Card x={1070} y={190} w={700} h={400} start={at(scene, 0, 0.45)} border={RED} fill="rgba(239,67,67,0.07)" />
      <Text x={500} y={200} w={600} size={48} weight={900} color={OK} align="center" style={fadeUp(f, at(scene, 0, 0.15))}>
        doubling works ✓
      </Text>
      <Text x={1420} y={200} w={600} size={48} weight={900} color={RED} align="center" style={fadeUp(f, at(scene, 0, 0.5))}>
        doesn't ✗
      </Text>
      {/* chip 10 -> works */}
      <div style={{ position: 'absolute', left: 500 - 60, top: a10.y, width: 120, textAlign: 'center', opacity: a10.opacity, background: OK, color: '#fff', borderRadius: 999, fontSize: 52, fontWeight: 900, padding: '4px 0' }}>10</div>
      <Parts x={370} y={400} size={60} parts={[[at(scene, 1, 0.22), '2\\to4', OK]]} />
      {/* chip 8 -> fails */}
      <div style={{ position: 'absolute', left: 1420 - 60, top: a8.y, width: 120, textAlign: 'center', opacity: a8.opacity, background: RED, color: '#fff', borderRadius: 999, fontSize: 52, fontWeight: 900, padding: '4px 0' }}>8</div>
      <Parts x={1290} y={400} size={60} parts={[[at(scene, 1, 0.5), '1\\to3', RED]]} />
      <Parts x={1290} y={490} size={56} parts={[[at(scene, 1, 0.6), '3>2\\times1', RED]]} />
      <Fade a={at(scene, 1, 0.72)} b={goalIn}>
        <Card x={560} y={650} w={800} h={110} start={at(scene, 1, 0.72)} border={C.violet}>
          <div style={{ fontSize: 56, fontWeight: 900, color: C.violet }}>? the rule</div>
        </Card>
      </Fade>
      <Fade a={goalIn}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontSize: 52, fontWeight: 900, whiteSpace: 'nowrap' }}>
          Count the <Tex tex="n" size={56} /> in <Tex tex="1\ldots100" size={56} /> that land in <span style={{ color: OK }}>✓</span>
        </div>
      </Fade>
    </>
  );
};

// ---------- pauses ----------

const makePause = (tex: string, withChoices: boolean, seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={130} y={190} start={4} size={54} tex={tex} />
      <Text x={130} y={withChoices ? 380 : 400} w={1100} size={46} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      {withChoices && <Choices x={130} y={560} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={() => 8} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} />
    </>
  );
};

// ---------- Scene: fives ----------

const Fives: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const mid = at(scene, 0, 0.45);
  const l2 = at(scene, 1, 0);
  const l3 = at(scene, 2, 0); // was (1, 0), which hid the twos-vs-fives panel
  const l4 = at(scene, 3, 0);
  const l5 = at(scene, 4, 0);
  const mults = range(10).map((i) => (i + 1) * 5);
  const cx = (i: number) => 130 + i * 168;
  return (
    <>
      <Fade a={2} b={mid}>
        <Parts x={0} y={230} center size={88} parts={[[at(scene, 0, 0.08), `10!=${ZR('3628800', 2, G5)}`]]} />
        <Tag x={0} y={420} center start={at(scene, 0, 0.2)} color={C.amber} size={56}>Where do these zeros come from?</Tag>
      </Fade>
      <Fade a={mid} b={l2}>
        <Parts x={0} y={210} center size={96} parts={[[at(scene, 0, 0.55), '10=2\\times5']]} />
        <Parts x={0} y={410} center size={64} parts={[[at(scene, 0, 0.8), `\\text{one zero}\\;=\\;\\text{one pair }\\left({\\color{#3c83f6}2},\\,{\\color{${G5}}5}\\right)`]]} />
      </Fade>
      <Fade a={l2} b={l3}>
        <Tag x={560} y={150} start={l2 + 4} color={C.muted} size={40}>in 20!</Tag>
        <Text x={150} y={285} w={300} size={52} weight={900} color="#3c83f6" style={fadeUp(f, l2 + 6)}>twos</Text>
        <Text x={150} y={405} w={300} size={52} weight={900} color={G5} style={fadeUp(f, l2 + 6)}>fives</Text>
        {range(18).map((i) => (
          <div key={i} style={{ position: 'absolute', left: 400 + i * 40, top: 290, width: 28, height: 56, borderRadius: 8, background: '#3c83f6', opacity: ease(f, at(scene, 1, 0.1) + i * 1.5, 6) }} />
        ))}
        {range(4).map((i) => (
          <div key={i} style={{ position: 'absolute', left: 400 + i * 40, top: 410, width: 28, height: 56, borderRadius: 8, background: G5, opacity: ease(f, at(scene, 1, 0.4) + i * 3, 6) }} />
        ))}
        <Parts x={1160} y={270} size={64} parts={[[at(scene, 1, 0.2), '18', '#3c83f6']]} />
        <Parts x={1160} y={390} size={64} parts={[[at(scene, 1, 0.5), '4', G5]]} />
        <Tag x={0} y={590} center start={at(scene, 1, 0.7)} color={C.amber} size={56}>zeros = number of fives</Tag>
      </Fade>

      {/* the two term rows grow over lines 3-5 */}
      <Fade a={l3 - 6}>
        <TopRows t1={l3 + 4} t1b={l4 + 8} t2={l5 + 6} t2b={l5 + 30} />
      </Fade>
      <Tag x={1330} y={160} start={l3 + 14} color={C.amber} size={44}>rounded down</Tag>

      <Fade a={l3} b={l5}>
        {mults.map((m, i) => {
          const two = m % 25 === 0;
          const t = l3 + 20 + i * 4;
          return (
            <div key={m}>
              <div style={{ position: 'absolute', left: cx(i), top: 440, width: 140, height: 80, borderRadius: 18, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 800, ...fadeUp(f, t, 10) }}>
                {m}
              </div>
              <div style={{ position: 'absolute', left: cx(i) + 70 - 14 - (two ? 22 : 0), top: 540, width: 28, height: 28, borderRadius: '50%', background: G5, opacity: ease(f, t + 6, 8) }} />
              {two && <div style={{ position: 'absolute', left: cx(i) + 70 - 14 + 22, top: 540, width: 28, height: 28, borderRadius: '50%', background: P25, opacity: ease(f, l4 + 10 + (m / 25) * 10, 8) }} />}
            </div>
          );
        })}
      </Fade>
      <Fade a={l5 + 20}>
        <Parts x={100} y={450} size={50} parts={[[l5 + 24, 'n\\le100\\Rightarrow n!\\text{ needs no }125\\text{ term}']]} />
        <Parts x={100} y={550} size={50} parts={[[l5 + 40, '2n\\le200\\Rightarrow(2n)!\\text{ gets one}', RED]]} />
      </Fade>
    </>
  );
};

// ---------- Scene: double ----------

const dx = (i: number, x0: number) => x0 + i * 64 + Math.floor(i / 5) * 32;

/** n dots in groups of five. Leftovers (after the full groups) are drawn in `left`. */
const DotRow: React.FC<{ n: number; x0: number; y: number; start: number; left?: string; stagger?: number }> = ({ n, x0, y, start, left = INK, stagger = 2 }) => {
  const f = useCurrentFrame();
  const groups = Math.floor(n / 5);
  return (
    <g>
      {range(groups).map((g) => (
        <rect key={g} x={dx(g * 5, x0) - 32} y={y - 38} width={5 * 64 + 4} height={76} rx={24} fill="none" stroke={G5} strokeWidth={6} opacity={ease(f, start + g * 5 * stagger + 8, 10)} />
      ))}
      {range(n).map((i) => {
        const left_ = i >= groups * 5;
        return <circle key={i} cx={dx(i, x0)} cy={y} r={22 * ease(f, start + i * stagger, 8)} fill={left_ ? left : G5} />;
      })}
    </g>
  );
};

const Double: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  // line 3: the spill
  const slide = ease(f, L(2, 0.3), 26);
  const six = range(6).map((j) => {
    const sx = j < 3 ? 520 + j * 64 : 1020 + (j - 3) * 64;
    const tx = 760 + j * 64 + (j === 5 ? 32 : 0);
    return sx + (tx - sx) * slide;
  });
  const spill = ease(f, L(2, 0.62), 14);
  return (
    <>
      <TopRows t1={-50} t1b={-50} t2={-50} t2b={-50} />

      {/* lines 1-2: 8 and 16 */}
      <Fade a={L(1)} b={L(2)}>
        <Stage>
          <DotRow n={8} x0={130} y={500} start={L(1, 0.05)} left={C.amber} />
          <DotRow n={16} x0={130} y={630} start={L(1, 0.4)} left={C.amber} stagger={1.5} />
        </Stage>
        <Parts x={1000} y={455} size={52} parts={[[L(1, 0.25), '8=1\\times5+3']]} />
        <Parts x={1290} y={585} size={52} parts={[[L(1, 0.5), '16=3\\times5+1']]} />
        <Parts x={130} y={715} size={52} parts={[[L(1, 0.65), '\\text{expected }{\\color{#ef4343}\\cancel{2}}', INK], [L(1, 0.82), '\\text{got }3', RED]]} gap={50} />
      </Fade>

      {/* line 3: spill */}
      <Fade a={L(2)} b={L(3)}>
        <Stage>
          <rect x={dx(0, 760) - 32} y={452} width={5 * 64 + 4} height={76} rx={24} fill="rgba(239,67,67,0.12)" stroke={RED} strokeWidth={6} opacity={spill} />
          {six.map((x, j) => (
            <circle key={j} cx={x} cy={490} r={22} fill={j < 5 && spill > 0.5 ? RED : C.amber} />
          ))}
        </Stage>
        <Parts x={370} y={570} size={56} parts={[[L(2, 0.2), '3+3=6\\ge5', RED]]} />
        <Tag x={1000} y={572} start={L(2, 0.7)} color={RED} size={52}>spill!</Tag>
        <Tag x={0} y={690} center start={L(2, 0.8)} color={RED} size={48}>remainder 3 → 6: a new group of five</Tag>
      </Fade>

      {/* line 4: 7 -> 14 */}
      <Fade a={L(3)} b={L(4)}>
        <Stage>
          <DotRow n={7} x0={130} y={500} start={L(3, 0.05)} left={C.amber} />
          <DotRow n={14} x0={130} y={630} start={L(3, 0.3)} left={C.amber} stagger={1.5} />
        </Stage>
        <Parts x={760} y={455} size={52} parts={[[L(3, 0.15), '7=1\\times5+2']]} />
        <Parts x={1200} y={585} size={52} parts={[[L(3, 0.45), '14=2\\times5+4']]} />
        <Parts x={130} y={715} size={52} parts={[[L(3, 0.6), '2+2=4<5', OK]]} />
        <Chip x={620} y={722} start={L(3, 0.65)} color={OK} size={44}>no spill</Chip>
        <Parts x={900} y={715} size={56} parts={[[L(3, 0.78), '1\\to2\\ \\checkmark', OK]]} />
      </Fade>

      {/* line 5: rule one */}
      <Fade a={L(4)} b={L(5)}>
        <Eq y={445} center start={L(4, 0.1)} size={50} color={G5} tex={`n\\bmod5\\in\\{0,1,2\\}\\Rightarrow${FL('2n', '5')}=2${FL('n', '5')}`} />
        {range(5).map((r) => {
          const good = r <= 2;
          return (
            <div key={r}>
              <div style={{ position: 'absolute', left: 560 + r * 150 + (r > 2 ? 20 : 0), top: 590, width: 110, height: 110, borderRadius: 24, background: good ? G5 : RED, color: '#fff', fontSize: 64, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, L(4, 0.3 + r * 0.08)) }}>
                {r}
              </div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 1160, top: 715, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          <div style={fadeUp(f, L(4, 0.7))}>
            <Tex tex="3\to6,\ \ 4\to8" size={52} color={RED} />
          </div>
        </div>
        <Text x={100} y={610} w={420} size={44} weight={800} color={C.muted} style={fadeUp(f, L(4, 0.25))}>remainder</Text>
        
      </Fade>

      {/* line 6: rule two */}
      <Fade a={L(5)} b={L(6)}>
        <Eq y={445} center start={L(5, 0.1)} size={50} color={P25} tex={`n\\bmod25\\le12\\Rightarrow${FL('2n', '25')}=2${FL('n', '25')}`} />
        <Parts x={0} y={600} center size={56} parts={[[L(5, 0.45), '12+12<25\\ \\checkmark', OK]]} />
        <Parts x={0} y={710} center size={56} parts={[[L(5, 0.7), '13+13\\ge25\\ \\times', RED]]} />
      </Fade>

      {/* line 7: never short */}
      <Fade a={L(6)} b={L(7)}>
        <Parts x={0} y={440} center size={52} parts={[[L(6, 0.1), `${FL('2n', '5')}\\ge2${FL('n', '5')}`, G5], [L(6, 0.1), ',\\quad'], [L(6, 0.1), `${FL('2n', '25')}\\ge2${FL('n', '25')}`, P25]]} />
        <Tag x={0} y={620} center start={L(6, 0.5)} color={C.amber} size={52}>never short ⇒ every term must be exact</Tag>
      </Fade>

      {/* line 8: rule three */}
      <Fade a={L(7)}>
        <Eq y={440} center start={L(7, 0.2)} size={54} color={RED} tex={`${FL('2n', '125')}=0\\iff2n<125\\iff n\\le62`} />
        <Tag x={0} y={620} center start={L(7, 0.55)} color={RED} size={48}>the 125 term must stay zero</Tag>
      </Fade>
    </>
  );
};

// ---------- Scene: count (the grid) ----------

const CELL = 62;
const BGAP = 18;
const GX0 = 130;
const GY0 = 230;
const RH = 90;
const colX = (c: number) => GX0 + c * CELL + Math.floor(c / 5) * BGAP;
const rowY = (r: number) => GY0 + r * RH;
const passes = (n: number) => n >= 1 && n % 5 <= 2 && n % 25 <= 12 && n <= 62;

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const cells = range(100).map((n) => ({ n, r: Math.floor(n / 25), c: n % 25 }));
  cells.push({ n: 100, r: 4, c: 0 });
  const cutY = rowY(2) + CELL + (RH - CELL) / 2;
  return (
    <>
      <Stage>
        {cells.map(({ n, r, c }) => {
          const x = colX(c) + (CELL - 56) / 2;
          const y = n === 100 ? rowY(3) + RH + 0 : rowY(r);
          const w = n === 100 ? 80 : 56;
          const appear = ease(f, L(0, 0.05) + r * 10 + c * 0.5, 8);
          const out1 = c % 5 >= 3 ? ease(f, L(1, 0.12) + c * 2.2, 10) : 0;
          const out2 = c >= 13 && c % 5 <= 2 ? ease(f, L(2, 0.15) + (c - 13) * 3, 10) : 0;
          const out3 = (n > 62 && passes2(n) ? ease(f, L(3, 0.35) + (n > 100 ? 0 : (n - 75) * 0.5), 10) : 0);
          const eliminated = Math.max(out1, out2);
          const keepOutline = c % 5 <= 2 ? ease(f, L(1, 0.12) + c * 2.2, 10) : 0;
          const survive = passes(n) ? ease(f, L(5, 0.05) + n * 0.4, 10) : 0;
          const isZero = n === 0;
          const pulse = (n === 1 || n === 2) && f >= L(4, 0.1) && f < L(4, 0.1) + 40 ? 1 + 0.18 * Math.sin(((f - L(4, 0.1)) / 40) * Math.PI * 2) : 1;
          const gone = Math.max(eliminated, out3);
          const border = survive > 0 ? OK : keepOutline > 0 && !gone ? G5 : C.line;
          const fill = survive > 0 ? `rgba(33,196,93,${0.1 + 0.25 * survive})` : gone > 0 ? `rgba(239,67,67,${0.14 * gone})` : C.card;
          const bw = survive > 0 ? 4 : keepOutline > 0 && gone === 0 ? 4 : 2;
          const op = appear * (isZero ? 0.38 : 1) * (1 - 0.35 * gone);
          return (
            <g key={n} opacity={op} transform={`translate(${x + w / 2} ${y + 28}) scale(${pulse}) translate(${-(x + w / 2)} ${-(y + 28)})`}>
              <rect x={x} y={y} width={w} height={56} rx={10} fill={fill} stroke={border} strokeWidth={bw} />
              <text x={x + w / 2} y={y + 40} textAnchor="middle" fontSize={34} fontWeight={800} fill={gone > 0.5 ? RED : survive > 0.5 ? '#14803a' : INK} style={{ fontFamily: 'inherit' }}>
                {n}
              </text>
              {gone > 0 && (
                <line x1={x + 6} y1={y + 6} x2={x + w - 6} y2={y + 50} stroke={RED} strokeWidth={out3 > 0 ? 5 : 3} strokeLinecap="round" opacity={gone} />
              )}
              {out3 > 0 && (
                <line x1={x + w - 6} y1={y + 6} x2={x + 6} y2={y + 50} stroke={RED} strokeWidth={5} strokeLinecap="round" opacity={out3} />
              )}
            </g>
          );
        })}
        {/* rule two divider */}
        <line x1={colX(13)} y1={GY0 - 14} x2={colX(13)} y2={rowY(2) + 56 + 14} stroke={P25} strokeWidth={8} strokeLinecap="round" opacity={ease(f, L(2, 0.5), 12)} />
        {/* rule three cut */}
        <line x1={colX(13) + 4} y1={rowY(2) - 10} x2={colX(13) + 4} y2={cutY} stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={ease(f, L(3, 0.2), 14)} />
        <line x1={colX(0) - 14} y1={cutY} x2={colX(24) + CELL + 6} y2={cutY} stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={ease(f, L(3, 0.2), 14)} />
      </Stage>
      {/* row counts */}
      {[8, 9, 9, 0].map((v, r) => (
        <div key={r} style={{ position: 'absolute', left: 1768, top: rowY(r) - 4, width: 120, fontSize: 60, fontWeight: 900, color: v === 0 ? C.muted : OK, ...fadeUp(f, L(5, 0.35 + r * 0.12)) }}>
          {v}
        </div>
      ))}
      {/* rule tags */}
      <Fade a={L(0, 0.2)} b={L(1)}>
        <Tag x={0} y={700} center start={L(0, 0.2)} color={C.muted} size={48}>the numbers 0 to 100, in rows of 25</Tag>
      </Fade>
      <Fade a={L(1, 0.2)} b={L(2)}>
        <Parts x={0} y={700} center size={52} parts={[[L(1, 0.2), 'n\\bmod5\\in\\{0,1,2\\}', G5]]} />
      </Fade>
      <Fade a={L(2, 0.2)} b={L(3)}>
        <Parts x={0} y={700} center size={52} parts={[[L(2, 0.2), 'n\\bmod25\\le12', P25]]} />
      </Fade>
      <Fade a={L(3, 0.2)} b={L(4)}>
        <Parts x={0} y={700} center size={52} parts={[[L(3, 0.2), 'n\\le62', RED]]} />
      </Fade>
      <Fade a={L(4, 0.1)} b={L(5)}>
        <Parts x={0} y={700} center size={52} parts={[[L(4, 0.2), '2!=2', G5], [L(4, 0.3), ',\\ \\ 4!=24'], [L(4, 0.5), '\\text{no zeros: }0=2\\times0\\ \\checkmark', OK]]} gap={44} />
      </Fade>
    </>
  );
};

// n > 62 rows that still look like survivors of rules one and two (row 4 and 100)
const passes2 = (n: number) => n % 5 <= 2 && n % 25 <= 12;

// ---------- Scene: reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 0, 0.93);
  return (
    <>
      <Parts x={0} y={300} center size={130} parts={[[at(scene, 0, 0.12), '8', G5], [at(scene, 0, 0.12), '+'], [at(scene, 0, 0.25), '9', P25], [at(scene, 0, 0.25), '+'], [at(scene, 0, 0.38), '9', P25], [at(scene, 0, 0.62), '=\\,26', OK]]} gap={20} />
      <Tag x={0} y={520} center start={at(scene, 0, 0.2)} color={C.muted} size={46}>row 1 + row 2 + row 3</Tag>
      <Pill x={1380} y={750} color={C.green} style={{ ...fadeUp(f, done), fontSize: 52 }}>
        Choice C
      </Pill>
      <Answer x={1500} y={620} value="26" chime={CHIME} start={done} />
      <Confetti x={1500} y={620} start={done} seed={7} />
    </>
  );
};

// ---------- Scene: base5 ----------

const BX = [110, 380, 650];
const BOXW = 230;

const Digit: React.FC<{ i: number; x: number; digit: string; color: string; start: number; label: string; hint: string; hintStart: number }> = ({ x, digit, color, start, label, hint, hintStart }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={x + BOXW / 2} y={225} w={BOXW + 60} size={40} weight={800} color={C.muted} align="center" style={fadeUp(f, 4)}>{label}</Text>
      <div style={{ position: 'absolute', left: x, top: 290, width: BOXW, height: 200, borderRadius: 28, background: C.card, border: `7px solid ${color}`, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 130, fontWeight: 900, color, ...fadeUp(f, 4) }}>
        <span style={{ opacity: ease(f, start, 8) }}>{digit}</span>
      </div>
      <Text x={x + BOXW / 2} y={510} w={BOXW + 60} size={44} weight={800} color={C.muted} align="center" style={fadeUp(f, hintStart)}>{hint}</Text>
    </>
  );
};

const Base5: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const l4 = L(4);
  const l6 = L(6);
  const first = f < l4 ? '1' : f < l6 ? '2' : '0';
  const rest = f < l6 ? '2' : '0';
  const bothStart = f < L(1, 0.3) ? '' : null;
  void bothStart;
  const showDigits = (i: number) => (i === 0 ? L(1, 0.35) : i === 1 ? L(1, 0.4) : L(1, 0.45));
  const hintsAll = L(4, 0.5);
  const digitCol = (i: number) => (i === 0 ? INK : i === 1 ? P25 : G5);
  const col0 = f >= l6 ? RED : digitCol(0);
  const col1 = f >= l6 ? RED : digitCol(1);
  const col2 = f >= l6 ? RED : digitCol(2);
  return (
    <>
      <Digit i={0} x={BX[0]} digit={first} color={col0} start={f < l4 ? showDigits(0) : f < l6 ? l4 : l6} label="twenty-fives" hint="0 1 2 3 4" hintStart={L(0, 0.5)} />
      <Digit i={1} x={BX[1]} digit={rest} color={col1} start={f < l6 ? showDigits(1) : l6} label="fives" hint="0 1 2 3 4" hintStart={L(0, 0.6)} />
      <Digit i={2} x={BX[2]} digit={rest} color={col2} start={f < l6 ? showDigits(2) : l6} label="ones" hint="0 1 2 3 4" hintStart={L(0, 0.7)} />
      {/* after line 4 every box allows 0, 1, 2 only */}
      <Fade a={hintsAll}>
        <div style={{ position: 'absolute', left: BX[0] - 20, top: 506, width: BX[2] + BOXW - BX[0] + 40, height: 70, background: C.bg }} />
        {BX.map((x, i) => (
          <Text key={i} x={x + BOXW / 2} y={510} w={BOXW + 60} size={44} weight={800} color={digitCol(i)} align="center">0 1 2</Text>
        ))}
      </Fade>

      <Fade a={L(1)} b={l4}>
        <Eq x={1010} y={290} start={L(1, 0.2)} size={52} tex="37=25+2\times5+2" />
        <Eq x={1010} y={400} start={L(1, 0.6)} size={60} tex="37=122_5" />
      </Fade>
      <Parts x={BX[2] + 30} y={595} size={56} parts={[[L(2, 0.3), '\\le2', G5]]} />
      <Tag x={BX[2] - 10} y={685} start={L(2, 0.45)} color={G5} size={44}>rule one</Tag>
      <Parts x={BX[1] + 30} y={595} size={56} parts={[[L(3, 0.3), '\\le2', P25]]} />
      <Tag x={BX[1] - 10} y={685} start={L(3, 0.45)} color={P25} size={44}>rule two</Tag>
      <Fade a={L(3, 0.2)} b={l4}>
        <Eq x={1010} y={520} start={L(3, 0.15)} size={46} tex="\text{remainder by }25" />
        <Eq x={1010} y={600} start={L(3, 0.3)} size={46} tex="=5\times\text{fives}+\text{ones}\le12" />
        <Eq x={1010} y={700} start={L(3, 0.7)} size={52} color={RED} tex="3\times5=15>12" />
      </Fade>
      <Parts x={BX[0] + 30} y={595} size={56} parts={[[L(4, 0.35), '\\le2', INK]]} />
      <Tag x={BX[0] - 10} y={685} start={L(4, 0.5)} color={RED} size={44}>rule three</Tag>
      <Fade a={l4} b={L(5)}>
        <Eq x={1010} y={290} start={L(4, 0.1)} size={50} tex="62=2\times25+2\times5+2" />
        <Eq x={1010} y={400} start={L(4, 0.3)} size={60} tex="62=222_5" />
        <Tag x={1010} y={540} start={L(4, 0.65)} color={OK} size={42}>
          doubled digits stay ≤ 4: no carries
        </Tag>
      </Fade>
      <Fade a={L(5)} b={l6}>
        <Eq x={1010} y={340} start={L(5, 0.2)} size={80} color={OK} tex="3\times3\times3=27" />
        <Tag x={1010} y={500} start={L(5, 0.4)} color={C.muted} size={44}>3 choices for each digit</Tag>
      </Fade>
      <Fade a={l6}>
        <div style={{ position: 'absolute', left: 1010, top: 330, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, L(6, 0.1)) }}>
          <Tex tex="\cancel{000_5}" size={70} color={RED} />
          <span style={{ fontSize: 52, fontWeight: 900, color: RED }}>✗</span>
        </div>
        <Eq x={1010} y={470} start={L(6, 0.55)} size={80} color={OK} tex="27-1=26" />
      </Fade>
      <Fade a={L(7)}>
        <Card x={260} y={752} w={1400} h={90} start={L(7, 0.25)} border={C.violet}>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.violet, whiteSpace: 'nowrap' }}>Doubling + fives? Think base five: no carries.</div>
        </Card>
      </Fade>
    </>
  );
};

// ---------- Scene: traps ----------

type TrapRow = { letter: string; value: string; tex: string; note: string; at: number; cue: number };

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const rows: TrapRow[] = [
    { letter: 'A', value: '20', tex: '5,10,15,\\dots,100\\;\\to\\;20', note: 'not our rule', at: 0, cue: L(0, 0.82) },
    { letter: 'B', value: '24', tex: '26-2=24', note: '', at: 1, cue: L(1, 0.2) },
    { letter: 'D', value: '30', tex: '\\text{base ten: }0,1,2\\;\\to\\;10+10+10', note: 'wrong base', at: 2, cue: L(2, 0.35) },
    { letter: 'E', value: '50', tex: '\\text{half of }100', note: 'rules are stricter', at: 3, cue: L(3, 0.35) },
  ];
  const habit = L(4, 0.2);
  const unstrike = L(1, 0.6);
  return (
    <>
      {rows.map((r, i) => {
        const y = 130 + i * 140;
        const wrong = f >= r.cue;
        return (
          <div key={r.letter}>
            <div style={{ position: 'absolute', left: 100, top: y, width: 1720, height: 120, background: C.card, borderRadius: 28, border: `6px solid ${wrong ? RED : 'transparent'}`, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', padding: '0 36px', gap: 36, ...fadeUp(f, L(0, 0.02 + i * 0.1)) }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.muted, width: 40 }}>{r.letter}</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: wrong ? RED : INK, width: 110 }}>{r.value}</div>
              <div style={{ flex: 1, whiteSpace: 'nowrap', opacity: ease(f, r.cue - 10, 12) }}>
                {r.letter === 'B' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                    <Tex tex="26-2=24" size={52} color={f >= unstrike ? INK : RED} />
                    {['n=1', 'n=2'].map((t) => (
                      <span key={t} style={{ fontSize: 48, fontWeight: 900, color: f >= unstrike ? OK : RED, textDecoration: f >= unstrike ? 'none' : 'line-through', textDecorationThickness: 5 }}>
                        {t}
                      </span>
                    ))}
                    <span style={{ opacity: ease(f, unstrike, 10) }}>
                      <Tex tex="0=2\times0\ \checkmark" size={52} color={OK} />
                    </span>
                  </div>
                ) : (
                  <Tex tex={r.tex} size={52} color={wrong ? RED : INK} />
                )}
              </div>
              <div style={{ width: 440, flexShrink: 0, whiteSpace: 'nowrap', fontSize: 40, fontWeight: 800, color: RED, textAlign: 'right', ...fadeUp(f, r.cue + 8) }}>
                {r.letter === 'B' ? (f >= unstrike ? <span style={{ color: OK }}>they count!</span> : 'skipped 1 and 2') : r.note}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 710, display: 'flex', justifyContent: 'center', ...fadeUp(f, habit) }}>
        <div style={{ background: C.primary, color: '#fff', borderRadius: 28, padding: '14px 44px', fontSize: 48, fontWeight: 900, whiteSpace: 'nowrap' }}>Doubling a rounded-down number? Check the remainder.</div>
      </div>
    </>
  );
};

// ---------- Scene: variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={150} color={C.violet} style={fadeUp(f, at(scene, 0, 0.05))}>
        Your turn!
      </Pill>
      <div style={{ position: 'absolute', left: 100, top: 300, width: 1720, background: C.card, borderRadius: 32, padding: '30px 52px', fontSize: 52, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', lineHeight: 1.5, ...fadeUp(f, at(scene, 0, 0.15)) }}>
        <div style={{ whiteSpace: 'nowrap' }}>
          For how many <Mark on={at(scene, 0, 0.4)}>integers <Tex tex="n" size={56} /> from 1 to 100</Mark> does
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <Mark on={at(scene, 0, 0.62)}>
            <Tex tex="(3n)!" size={56} /> end in exactly three times as many zeros as <Tex tex="n!" size={56} />
          </Mark>
          ?
        </div>
      </div>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  const done = L(4, 0.93);
  const l3 = L(3);
  const nums: [string, string][] = [['1', '1'], ['5', '10'], ['6', '11'], ['25', '100'], ['26', '101'], ['30', '110'], ['31', '111']];
  return (
    <>
      <Fade a={0} b={l3}>
        <Text x={110} y={150} w={400} size={42} weight={800} color={C.muted} style={fadeUp(f, L(0, 0.05))}>remainder by 5</Text>
        {range(5).map((r) => {
          const good = r <= 1;
          return (
            <div key={r} style={{ position: 'absolute', left: 560 + r * 130 + (r > 1 ? 18 : 0), top: 130, width: 100, height: 100, borderRadius: 22, background: good ? G5 : RED, color: '#fff', fontSize: 60, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, L(0, 0.1 + r * 0.08)) }}>
              {r}
            </div>
          );
        })}
        <Parts x={1290} y={140} size={52} parts={[[L(0, 0.45), '3\\times2=6\\ge5', RED]]} />
        <Eq x={110} y={270} start={L(0, 0.7)} size={56} tex="3r<5\Rightarrow r\le1" color={G5} />
        <Parts x={110} y={400} size={54} parts={[[L(1, 0.2), '3\\times8=24<25\\ \\checkmark', OK], [L(1, 0.45), '3\\times9=27\\ \\times', RED]]} gap={50} />
        <Eq x={110} y={510} start={L(1, 0.75)} size={56} tex="\text{remainder by }25\le8" color={P25} />
        <Eq x={110} y={650} start={L(2, 0.35)} size={56} tex="3n<125\Rightarrow n\le41" color={RED} />
      </Fade>
      <Fade a={l3} b={L(4)}>
        {[0, 1, 2].map((i) => {
          const x = [210, 480, 750][i];
          const col = [INK, P25, G5][i];
          return (
            <div key={i}>
              <div style={{ position: 'absolute', left: x, top: 250, width: 200, height: 170, borderRadius: 28, background: C.card, border: `7px solid ${col}`, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: col, ...fadeUp(f, L(3, 0.15 + i * 0.1)) }}>
                0 1
              </div>
              <Text x={x + 100} y={440} w={240} size={40} weight={800} color={C.muted} align="center" style={fadeUp(f, L(3, 0.15 + i * 0.1))}>
                {['25s', '5s', '1s'][i]}
              </Text>
            </div>
          );
        })}
        <Eq x={1060} y={290} start={L(3, 0.55)} size={84} color={OK} tex="2\times2\times2=8" />
      </Fade>
      <Fade a={L(4)}>
        <Eq x={260} y={150} start={L(4, 0.6)} size={90} color={OK} tex="8-1=7" />
        {nums.map(([d, b5], i) => {
          const x = 140 + i * 215;
          const t = L(4, 0.0 + i * 0.06);
          return (
            <div key={d} style={{ position: 'absolute', left: x, top: 370, width: 190, textAlign: 'center', ...fadeUp(f, t) }}>
              <div style={{ background: C.card, borderRadius: 22, padding: '6px 0', fontSize: 64, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>{d}</div>
              <div style={{ marginTop: 14, fontSize: 48, fontWeight: 800, color: C.muted, opacity: ease(f, t + 8, 10) }}>{b5}</div>
            </div>
          );
        })}
        <Tag x={140} y={620} start={L(4, 0.6)} color={C.muted} size={40}>(in base five, the digits are only 0 and 1)</Tag>
      </Fade>
      <Answer x={1580} y={220} value="7" chime={CHIME} start={done} />
      <Confetti x={1580} y={220} start={done} seed={9} />
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = (i: number, t = 0) => at(scene, i, t);
  return (
    <>
      <Fade a={0} b={L(1)}>
        <Text x={160} y={180} w={800} size={44} color={C.primary} weight={900} style={fadeUp(f, 4)}>The big idea</Text>
        <Eq y={320} center start={L(0, 0.3)} size={62} tex={`\\text{zeros}=${FL('n', '5')}+${FL('n', '25')}+\\cdots`} />
        <Tag x={0} y={540} center start={L(0, 0.7)} color={C.amber} size={52}>count the fives</Tag>
      </Fade>
      <Fade a={L(1)} b={L(2)}>
        <Eq y={200} center start={L(1, 0.1)} size={80} tex="\lfloor 2x\rfloor=2\lfloor x\rfloor" color={OK} />
        <Tag x={0} y={390} center start={L(1, 0.3)} color={INK} size={52}>when the remainder is less than half the divisor</Tag>
        <Chip x={300} y={560} start={L(1, 0.55)} color={G5} size={50}>5: r ≤ 2</Chip>
        <Chip x={730} y={560} start={L(1, 0.65)} color={P25} size={50}>25: r ≤ 12</Chip>
        <Chip x={1190} y={560} start={L(1, 0.75)} color={RED} size={50}>125: n ≤ 62</Chip>
      </Fade>
      <SignOff start={L(2, 0.1)} text="Keep exploring!" />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause('(2n)!\\text{ has exactly twice the zeros of }n!', true, 10, 'How many whole numbers n from 1 to 100?'),
  fives: Fives,
  double: Double,
  count: Count,
  reveal: Reveal,
  base5: Base5,
  traps: Traps,
  variant: Variant,
  try2: makePause('(3n)!\\text{ has exactly three times the zeros of }n!', false, 10, 'How many whole numbers n from 1 to 100?'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + the factorials in question, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>24?</span>]}>
    <div style={{ background: C.card, borderRadius: 40, padding: "40px 10px", width: 640, boxShadow: '0 8px 30px rgba(30,40,80,0.10)', textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div><Tex tex="(2n)!" size={150} /></div>
      <div style={{ margin: '14px 0', fontSize: 58, fontWeight: 900, color: C.violet }}>twice the zeros of</div>
      <div><Tex tex="n!" size={150} /></div>
    </div>
  </ThumbFrame>
);

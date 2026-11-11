import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-telescoping-product';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- maths strings ----------
// (1 + 1/2)(1 + 1/4)(1 + 1/16)(1 + 1/256): each bottom number is the one before it, squared.

const DENS = ['2', '4', '16', '256'];
const col = (c: string | undefined, tex: string) => (c ? `{\\color{${c}}${tex}}` : tex);
/** One bracket (1 ± 1/d), optionally coloured. */
export const br = (sign: '+' | '-', d: string, c?: string) => col(c, `\\left(1${sign}\\dfrac{1}{${d}}\\right)`);
export const PRODUCT = DENS.map((d) => br('+', d)).join('');

// ---------- small helpers ----------

/** A row of maths pieces that appear one after another: [start frame, tex, colour?]. */
const Parts: React.FC<{ x: number; y: number; parts: [number, string, string?][]; size?: number; opacity?: number; center?: boolean }> = ({
  x,
  y,
  parts,
  size = 52,
  opacity = 1,
  center = false,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: center ? 0 : x,
        right: center ? 0 : undefined,
        top: y,
        display: 'flex',
        justifyContent: center ? 'center' : 'flex-start',
        alignItems: 'center',
        gap: 16,
        whiteSpace: 'nowrap',
        opacity,
      }}
    >
      {parts.map(([start, tex, color], i) => (
        <div key={i} style={fadeUp(f, start)}>
          <Tex tex={tex} size={size} color={color ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

/** One maths row that fades in at `start`. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({
  start,
  tex,
  color,
  ...rest
}) => <Parts {...rest} parts={[[start, tex, color]]} />;

/** Green outline around a key result. */
const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number; color?: string }> = ({ x, y, w, h, start, color = C.green }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 40 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>{children}</div>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const boom = [`\\dfrac{3}{2}`, `\\dfrac{15}{8}`, `\\dfrac{255}{128}`, `\\dfrac{255\\times257}{128\\times256}`];
  const trick = at(scene, 1, 0.62);
  const dim = fadeTo(f, trick, 0.2);
  return (
    <>
      <Text x={960} y={110} w={1500} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        Multiply all four?
      </Text>
      <Eq x={0} y={250} center start={8} size={64} tex={PRODUCT} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 480, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50, opacity: dim }}>
        {boom.map((t, i) => (
          <div key={t} style={fadeUp(f, at(scene, 1, 0.06 + i * 0.09))}>
            <Tex tex={t} size={52 + i * 12} color={i === 3 ? C.red : C.ink} />
          </div>
        ))}
      </div>
      <Pill x={1250} y={730} color={C.violet} style={{ ...fadeUp(f, trick), fontSize: 52 }}>
        There's a trick!
      </Pill>
      <div style={{ position: 'absolute', left: 200, top: 700, ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['\\dfrac{65535}{65536}', '\\dfrac{255}{128}', '\\dfrac{65535}{32768}', '\\dfrac{131071}{65536}', '\\dfrac{65537}{32768}'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const marks = [at(scene, 1, 0.25), at(scene, 1, 0.7), at(scene, 2, 0.2), at(scene, 2, 0.6)];
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 170, width: 1720, background: C.card, borderRadius: 32, padding: '40px 52px', fontSize: 52, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        <div>What is</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, whiteSpace: 'nowrap' }}>
          {DENS.map((d, i) => (
            <Mark key={d} on={marks[i]}>
              <Tex tex={br('+', d)} size={60} />
            </Mark>
          ))}
          <span style={{ marginLeft: 8 }}>?</span>
        </div>
      </div>
      <Choices x={130} y={560} items={CHOICES.map((c) => <Tex key={c} tex={c} size={50} />)} start={(i) => at(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const amber = f >= at(scene, 2, 0.1) ? C.amber : undefined;
  const xs = [330, 740, 1150, 1560];
  const sq = [at(scene, 4, 0.05), at(scene, 4, 0.38), at(scene, 4, 0.7)];
  return (
    <>
      <Eq x={0} y={170} center start={0} size={60} tex={DENS.map((d) => `\\left(1+\\dfrac{1}{${col(amber, d)}}\\right)`).join('')} />
      <Tag x={0} y={365} start={at(scene, 1, 0.5)} color={C.muted} size={40}>
        <div style={{ width: 1920, textAlign: 'center' }}>each one is 1 + a fraction</div>
      </Tag>
      {DENS.map((d, i) => (
        <div key={d} style={{ position: 'absolute', left: xs[i] - 110, top: 440, width: 220, textAlign: 'center', fontSize: 84, fontWeight: 900, color: C.amber, ...fadeUp(f, at(scene, 2, 0.25 + i * 0.15)) }}>
          {d}
        </div>
      ))}
      {[0, 1, 2].map((i) => {
        const o = ease(f, at(scene, 3, 0.1 + i * 0.2), 10);
        const a = xs[i] + 90;
        const b = xs[i + 1] - 90 - (i === 2 ? 30 : 0);
        return (
          <svg key={i} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1920} height={1080}>
            <g opacity={o} stroke={C.violet} strokeWidth={6} strokeLinecap="round" fill="none">
              <line x1={a} y1={492} x2={b} y2={492} />
              <path d={`M ${b - 18} ${480} L ${b} ${492} L ${b - 18} ${504}`} />
            </g>
            <text x={(a + b) / 2} y={460} opacity={o} fill={C.violet} fontSize={40} fontWeight={900} textAnchor="middle">
              squared
            </text>
          </svg>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Eq key={i} x={(xs[i] + xs[i + 1]) / 2 - 130} y={580} start={sq[i]} size={54} color={C.violet} tex={`${DENS[i]}^2 = ${DENS[i + 1]}`} />
      ))}
      <Parts x={0} y={680} center size={52} parts={[[at(scene, 5, 0.1), '\\left(1+\\dfrac{1}{2}\\right) = \\dfrac{3}{2},'], [at(scene, 5, 0.6), '\\text{the rest} > 1'], [at(scene, 6, 0.3), '\\Rightarrow\\; \\text{answer} > \\dfrac{3}{2}']]} />
    </>
  );
};

const makePause = (rows: string[], seconds: number, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      {rows.map((r, i) => (
        <Eq key={r} x={130} y={190 + i * 195} start={4} size={62} tex={r} />
      ))}
      <Text x={520} y={220 + rows.length * 195} w={800} size={44} align="center" style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1400} y={480} tick={TICK} />
    </>
  );
};

const Sol1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tops = f >= at(scene, 6, 0.1) ? C.violet : undefined;
  const t = (n: string) => col(tops, n);
  const ys = [180, 340, 500];
  const right = [
    [`3 = 2\\times2 - 1`, `\\dfrac{3}{2} = 2 - \\dfrac{1}{2}`],
    [`15 = 2\\times8 - 1`, `\\dfrac{15}{8} = 2 - \\dfrac{1}{8}`],
    [`255 = 2\\times128 - 1`, `\\dfrac{255}{128} = 2 - \\dfrac{1}{128}`],
  ];
  const swap = [at(scene, 9, 0.02), at(scene, 9, 0.3), at(scene, 9, 0.6)];
  return (
    <>
      <Pill x={1100} y={150} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.4)), opacity: (fadeUp(f, at(scene, 0, 0.4)).opacity as number) * fadeTo(f, at(scene, 7)) }}>
        One bracket at a time
      </Pill>
      <Parts x={120} y={ys[0]} parts={[[at(scene, 1, 0.1), `\\left(1+\\dfrac{1}{2}\\right) = \\dfrac{${t('3')}}{2}`]]} />
      <Parts
        x={120}
        y={ys[1]}
        parts={[
          [at(scene, 2, 0.05), `\\dfrac{${t('3')}}{2}\\times\\dfrac{5}{4}`],
          [at(scene, 2, 0.35), `= \\dfrac{3\\times5}{2\\times4}`],
          [at(scene, 3, 0.1), `= \\dfrac{${t('15')}}{8}`],
        ]}
      />
      <Parts
        x={120}
        y={ys[2]}
        parts={[
          [at(scene, 4, 0.05), `\\dfrac{${t('15')}}{8}\\times\\dfrac{17}{16}`],
          [at(scene, 4, 0.35), `= \\dfrac{15\\times17}{8\\times16}`],
          [at(scene, 4, 0.7), f < at(scene, 5, 0.3) ? `= \\dfrac{${t('255')}}{\\phantom{128}}` : `= \\dfrac{${t('255')}}{128}`],
        ]}
      />
      {right.map(([a, b], i) => (
        <div key={i}>
          <Eq x={1100} y={ys[i]} start={at(scene, 7, 0.05 + i * 0.25)} size={52} color={C.violet} opacity={fadeTo(f, swap[i])} tex={a} />
          <Eq x={1100} y={ys[i]} start={swap[i]} size={52} color={C.green} tex={b} />
        </div>
      ))}
      <Pill x={1100} y={680} color={C.green} style={{ ...fadeUp(f, at(scene, 8, 0.2)), fontSize: 46 }}>
        A little under 2!
      </Pill>
    </>
  );
};

const Sol1b: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 7, 0.97);
  return (
    <>
      <Parts
        x={120}
        y={160}
        parts={[
          [at(scene, 0, 0.1), `\\dfrac{255}{128}\\times\\dfrac{257}{256}`],
          [at(scene, 0, 0.6), `= \\dfrac{255\\times257}{128\\times256}`],
        ]}
      />
      <Tag x={120} y={338} start={at(scene, 1, 0.05)} color={C.blue} size={44}>
        bottom:
      </Tag>
      <Eq x={330} y={330} start={at(scene, 1, 0.3)} size={52} color={C.blue} tex="128\times256 = 32768" />
      <Tag x={120} y={428} start={at(scene, 2, 0.05)} color={C.violet} size={44}>
        top:
      </Tag>
      <Parts
        x={330}
        y={420}
        parts={[
          [at(scene, 2, 0.2), '255\\times257', C.violet],
          [at(scene, 3, 0.4), '= (256-1)(256+1)', C.violet],
        ]}
      />
      <Eq x={330} y={510} start={at(scene, 5, 0.2)} size={52} color={C.violet} tex="= 256^2 - 1 = 65535" />
      <Eq x={120} y={600} start={at(scene, 6, 0.2)} size={52} tex="256^2 = 65536 = 2\times32768" />
      <div style={{ position: 'absolute', left: 1260, top: 300, width: 560, background: C.card, borderRadius: 28, padding: '22px 34px', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: C.amber }}>Shortcut</div>
        <div style={{ marginTop: 8 }}>
          <Tex tex="(a-1)(a+1)" size={50} />
        </div>
        <div style={{ marginTop: 6, ...fadeUp(f, at(scene, 4, 0.1)) }}>
          <Tex tex={`= a^2\\, ${f >= at(scene, 4, 0.5) ? '\\cancel{+\\,a}\\,\\cancel{-\\,a}' : '+\\,a-a'} - 1`} size={50} />
        </div>
        <div style={{ marginTop: 6, ...fadeUp(f, at(scene, 4, 0.75)) }}>
          <Tex tex="= a^2 - 1" size={50} color={C.amber} />
        </div>
      </div>
      <Eq x={120} y={690} start={at(scene, 7, 0.4)} size={52} color={C.green} tex="\dfrac{65535}{32768} = 2 - \dfrac{1}{32768}" />
      <Answer x={1120} y={710} value="C" chime={CHIME} start={done} />
      <Confetti x={1120} y={710} start={done} seed={5} />
    </>
  );
};

/** Solution 2 rows: the helper meets each bracket in turn and the chain collapses. */
const CHAIN = [
  { left: '2', rest: ['2', '4', '16', '256'] },
  { left: '4', rest: ['4', '16', '256'] },
  { left: '16', rest: ['16', '256'] },
  { left: '256', rest: ['256'] },
];

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rowAt = [at(scene, 1, 0.3), at(scene, 3, 0.15), at(scene, 4, 0.65), at(scene, 5, 0.4), at(scene, 6, 0.4)];
  const pairAt = [at(scene, 2, 0.05), at(scene, 4, 0.05), at(scene, 5, 0.0), at(scene, 6, 0.0)];
  const ys = [160, 280, 400, 520, 640];
  const note = at(scene, 2, 0.6);
  // \tfrac at 68 px keeps the digits at about 48 px while each row stays one line tall.
  const tb = (sign: '+' | '-', d: string, c?: string) => col(c, `\\left(1${sign}\\tfrac{1}{${d}}\\right)`);
  const rows = CHAIN.map(({ left, rest }, i) => {
    const hi = f >= pairAt[i] ? C.amber : undefined;
    const first = tb('-', left, hi ?? (i === 0 ? C.violet : C.green));
    const tail = rest.map((d, j) => tb('+', d, j === 0 ? hi : undefined)).join('');
    return (i > 0 ? '= ' : '') + first + tail;
  });
  const pickAt = at(scene, 11, 0.3);
  const clear = fadeTo(f, at(scene, 8, 0.05), 0, 14);
  return (
    <>
      <Pill x={600} y={735} color={C.violet} style={{ ...fadeUp(f, at(scene, 7, 0.05)), opacity: (fadeUp(f, at(scene, 7, 0.05)).opacity as number) * clear }}>
        Each step knocks over the next!
      </Pill>
      <div style={{ position: 'absolute', left: 1190, top: 410, whiteSpace: 'nowrap', background: C.card, borderRadius: 24, padding: '14px 30px', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', ...fadeUp(f, note), opacity: ease(f, note, 14) * clear }}>
        <Tex tex="(1-a)(1+a) = 1 - a^2" size={48} color={C.amber} />
        <div style={{ fontSize: 34, fontWeight: 800, color: C.muted, marginTop: 4 }}>same shortcut, with 1 in front</div>
      </div>
      <div style={{ opacity: clear }}>
        <Tag x={124} y={112} start={at(scene, 1, 0.5)} color={C.violet} size={36}>
          helper
        </Tag>
        <Eq x={1190} y={590} start={at(scene, 1, 0.75)} size={52} color={C.violet} tex="\text{helper} = 1-\dfrac{1}{2} = \dfrac{1}{2}" />
      </div>
      {rows.map((r, i) => (
        <Eq key={i} x={120} y={ys[i]} start={rowAt[i]} size={68} tex={r} opacity={clear} />
      ))}
      <Eq x={120} y={ys[4]} start={rowAt[4]} size={68} color={C.green} tex="= 1-\tfrac{1}{256^2}" />
      <Boxed x={100} y={ys[4] - 12} w={410} h={124} start={at(scene, 7, 0.2)} />
      <Tag x={800} y={200} start={at(scene, 8, 0.3)} color={C.violet} size={40}>
        undo the helper: double!
      </Tag>
      <Eq x={800} y={270} start={at(scene, 8, 0.75)} size={68} tex="2\times\left(1-\tfrac{1}{256^2}\right)" />
      <Eq x={800} y={390} start={at(scene, 9, 0.3)} size={68} tex="= 2-\tfrac{2}{256^2}" />
      <Parts
        x={800}
        y={510}
        size={68}
        parts={[
          [at(scene, 10, 0.05), '= 2-\\tfrac{1}{32768}'],
          [at(scene, 10, 0.4), '= \\tfrac{65535}{32768}', C.green],
        ]}
      />
      <Pill x={800} y={640} color={C.green} style={{ ...fadeUp(f, at(scene, 10, 0.6)), opacity: (fadeUp(f, at(scene, 10, 0.6)).opacity as number) * fadeTo(f, pickAt), fontSize: 40 }}>
        Choice C again!
      </Pill>
      <Pill x={560} y={740} color={C.primary} style={{ ...fadeUp(f, pickAt), fontSize: 38 }}>
        Pick it when each bottom is the last one squared
      </Pill>
    </>
  );
};

const FORMS = ['1-\\dfrac{1}{256^2}', '\\text{3 brackets}', '2-\\dfrac{2}{256^2}', '2-\\dfrac{1}{256^2}', '2+\\dfrac{2}{256^2}'];
const NOTES = ['Forgot to undo the helper. Below 1!', 'Stopped after 3 brackets', '', 'Tiny piece not doubled', 'Wrong sign: above 2!'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.2), at(scene, 3, 0.1), Infinity, at(scene, 4, 0.1), at(scene, 5, 0.1)];
  const formAt = [at(scene, 1, 0.5), at(scene, 3, 0.4), at(scene, 7, 0.7), at(scene, 4, 0.2), at(scene, 5, 0.2)];
  const right = f >= at(scene, 7, 0.7);
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 150, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 2 && right;
          const border = wrong ? C.red : ok ? C.green : 'transparent';
          return (
            <div key={c} style={{ width: 320, ...fadeUp(f, 8 + i * 6, 12) }}>
              <div style={{ height: 400, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 16 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 150, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c} size={50} color={wrong ? C.red : ok ? C.green : C.ink} />
                </div>
                <div style={{ height: 150, display: 'flex', alignItems: 'center', ...fadeUp(f, formAt[i]) }}>
                  <Tex tex={FORMS[i]} size={i === 1 ? 40 : 48} color={wrong ? C.red : ok ? C.green : C.ink} />
                </div>
                {(wrong || ok) && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wrong ? '✗' : '✓'}
                  </div>
                )}
              </div>
              {NOTES[i] && (
                <div style={{ marginTop: 16, fontSize: 32, fontWeight: 700, textAlign: 'center', lineHeight: 1.25, ...fadeUp(f, wrongAt[i] + 8) }}>
                  {NOTES[i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 6, 0.3)) }}>
        <div style={{ background: C.primary, color: '#fff', borderRadius: 28, padding: '12px 40px', fontSize: 46, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 24 }}>
          Check:
          <span style={fadeUp(f, at(scene, 6, 0.3))}><Tex tex="1 < \text{answer}" size={50} color="#fff" /></span>
          <span style={fadeUp(f, at(scene, 7, 0.3))}><Tex tex="< 2" size={50} color="#fff" /></span>
        </div>
      </div>
    </>
  );
};

const VPRODUCT = `${br('+', '3')}${br('+', '9')}`;

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={180} color={C.violet} style={fadeUp(f, at(scene, 0, 0.3))}>
        Your turn!
      </Pill>
      <Eq x={0} y={330} center start={at(scene, 1, 0.1)} size={80} tex={VPRODUCT} />
      <Tag x={1400} y={390} start={at(scene, 1, 0.7)} color={C.muted} size={44}>
        <Tex tex="3^2 = 9" size={52} color={C.muted} />
      </Tag>
      <Pill x={760} y={620} color={C.amber} style={fadeUp(f, at(scene, 2, 0.4))}>
        The helper is…?
      </Pill>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 7, 0.97);
  return (
    <>
      <Eq x={120} y={150} start={at(scene, 0, 0.3)} size={48} color={C.violet} tex={`${br('-', '3')} = \\dfrac{2}{3}`} />
      <Parts
        x={120}
        y={320}
        size={48}
        parts={[
          [at(scene, 1, 0.02), `${br('-', '3', C.violet)}${br('+', '3')}${br('+', '9')}`],
          [at(scene, 1, 0.35), `= ${br('-', '9')}${br('+', '9')}`],
          [at(scene, 1, 0.7), '= 1-\\dfrac{1}{81}'],
          [at(scene, 2, 0.2), '= \\dfrac{80}{81}'],
        ]}
      />
      <Parts
        x={120}
        y={480}
        size={48}
        parts={[
          [at(scene, 3, 0.6), '\\dfrac{80}{81}\\times\\dfrac{3}{2}'],
          [at(scene, 4, 0.3), '= \\dfrac{240}{162}'],
          [at(scene, 4, 0.75), '= \\dfrac{40}{27}', C.green],
        ]}
      />
            <Parts
        x={1000}
        y={480}
        size={48}
        parts={[
          [at(scene, 5, 0.1), '2\\times\\dfrac{80}{81} = \\dfrac{160}{81}', C.red],
          [at(scene, 5, 0.6), '\\text{too big!}', C.red],
        ]}
      />
      <Parts
        x={120}
        y={650}
        size={48}
        parts={[
          [at(scene, 6, 0.3), '\\dfrac{4}{3}\\times\\dfrac{10}{9} = \\dfrac{40}{27}'],
          [at(scene, 6, 0.8), '\\text{it matches!}', C.green],
        ]}
      />
      <Answer x={1500} y={700} value="✓" chime={CHIME} start={done} />
      <Confetti x={1500} y={700} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 160, width: 1600, height: 600, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 1460, fontSize: 56, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, at(scene, 1, 0.1)) }}>
          Each bottom is the last one squared? Bring in a helper: <span style={{ color: C.violet }}>1 − the first fraction</span>.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 330, display: 'flex', alignItems: 'center', gap: 40, ...fadeUp(f, at(scene, 2, 0.1)) }}>
          <Tex tex="(1-x)(1+x) = 1-x^2" size={60} color={C.amber} />
          <span style={{ fontSize: 50, fontWeight: 800 }}>The chain collapses!</span>
        </div>
        <div style={{ position: 'absolute', left: 70, top: 460, fontSize: 52, fontWeight: 900, color: C.green, ...fadeUp(f, at(scene, 2, 0.75)) }}>
          Then undo the helper.
        </div>
      </div>
      <SignOff start={at(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause([DENS.slice(0, 2).map((d) => br('+', d)).join(''), DENS.slice(2).map((d) => br('+', d)).join('')], 10, 'Multiply them all. Is there a shortcut?'),
  sol1: Sol1,
  sol1b: Sol1b,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause([VPRODUCT], 12, 'Find the helper first!'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

// YouTube thumbnail (`2026-10-30-telescoping-product-thumb`, render.sh → poster.jpg): the question in a few words + the four brackets, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={["Find the", <span style={{ color: C.primary }}>product</span>]}>
    <div style={{ width: '100%', height: '100%', background: C.card, borderRadius: 36, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Tex tex={br('+', '2')} size={52} />
        <Tex tex={br('+', '4')} size={52} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Tex tex={br('+', '16')} size={52} />
        <Tex tex={br('+', '256')} size={52} />
      </div>
      <Tex tex={'= \\,?'} size={110} color={C.red} />
    </div>
  </ThumbFrame>
);

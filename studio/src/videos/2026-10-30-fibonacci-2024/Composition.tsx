import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-fibonacci-2024';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// x = first term (green), y = second term (violet). The same numbers as verify.py.
const XC = C.primary;
const YC = C.violet;
const SEQ84 = [64, 20, 84, 104, 188, 292, 480, 772, 1252, 2024];
const SEQ71 = [30, 41, 71, 112, 183, 295, 478, 773, 1251, 2024];
const SEQ89 = [77, 12, 89, 101, 190, 291, 481, 772, 1253, 2025];

/** Frame where line i of the scene starts, plus a fraction t into it (Infinity-safe). */
const cue = (scene: Scene, i: number, t = 0) => at(scene, i, t);

// ---------- small building blocks ----------

/** A maths line placed absolutely. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

type CellStyle = { border?: string; fill?: string; color?: string };

/** A row of term boxes. values[i] is TeX ('' = empty box). shows[i] = frame the box pops in. */
const SeqRow: React.FC<{
  x: number; y: number; cw: number; values: string[]; shows: number[]; size?: number; h?: number;
  labels?: boolean; labelAt?: number; styles?: (i: number) => CellStyle; opacity?: number;
}> = ({ x, y, cw, values, shows, size = 50, h = 96, labels = false, labelAt = 0, styles, opacity = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (opacity <= 0) return null;
  return (
    <div style={{ opacity }}>
      {values.map((v, i) => {
        const s = Math.min(1, pop(f, shows[i], fps));
        const st = styles?.(i) ?? {};
        return (
          <div key={i}>
            {labels && (
              <div style={{ position: 'absolute', left: x + i * cw, top: y - 78, width: cw - 14, textAlign: 'center', opacity: ease(f, labelAt + i * 2, 10) }}>
                <Tex tex={`a_{${i + 1}}`} size={48} color={C.muted} />
              </div>
            )}
            {s > 0.01 && (
              <div
                style={{
                  position: 'absolute', left: x + i * cw, top: y, width: cw - 14, height: h, borderRadius: 20,
                  background: st.fill ?? C.card, border: `5px solid ${st.border ?? C.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`,
                  boxShadow: '0 4px 14px rgba(30,40,80,0.06)', whiteSpace: 'nowrap',
                }}
              >
                <Tex tex={v} size={size} color={st.color ?? C.ink} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Little "T = 95: 29" chip from a countdown, with a cross or a tick. */
const Chip: React.FC<{ x: number; y: number; w: number; S: number; left: number; start: number; markAt: number; good?: boolean }> = ({ x, y, w, S, left, start, markAt, good }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.min(1, pop(f, start, fps));
  if (s <= 0.01) return null;
  const m = f >= markAt;
  const col = !m ? C.ink : good ? C.green : C.red;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 104, borderRadius: 22, background: good && m ? 'rgba(33,196,93,0.12)' : C.card, border: `5px solid ${m ? col : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, whiteSpace: 'nowrap' }}>
      <Tex tex={`${S} \\to ${left}`} size={48} color={col} />
      {m && (
        <div style={{ position: 'absolute', top: -22, right: -12, width: 54, height: 54, borderRadius: '50%', background: col, color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {good ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};

/** Running "a + b = c" under the cell being built, centred on it. */
const RunningSum: React.FC<{ x0: number; cw: number; y: number; vals: number[]; starts: number[]; until: number; color?: string }> = ({ x0, cw, y, vals, starts, until, color = C.primary }) => {
  const f = useCurrentFrame();
  if (f >= until) return null;
  const k = starts.reduce((acc, s, i) => (f >= s ? i : acc), -1);
  if (k < 2) return null;
  const cx = Math.max(330, Math.min(1590, x0 + k * cw + (cw - 14) / 2));
  return (
    <div style={{ position: 'absolute', left: cx - 330, top: y, width: 660, textAlign: 'center', whiteSpace: 'nowrap' }}>
      <Tex tex={`${vals[k - 2]} + ${vals[k - 1]} = ${vals[k]}`} size={56} color={color} />
    </div>
  );
};

const QText: React.FC<{ scene?: Scene; size?: number; tex?: number; marks?: boolean }> = ({ scene, size = 50, tex = 54, marks }) => {
  const m = (i: number, node: React.ReactNode) => (marks && scene ? <Mark on={cue(scene, i, 0.35)}>{node}</Mark> : node);
  return (
    <>
      A sequence of {m(0, 'positive integers')} has <Tex tex="a_{n+2}=a_{n+1}+a_n" size={tex} /> for every <Tex tex="n\ge 1" size={tex} />, and{' '}
      {m(1, <Tex tex="a_{10}=2024" size={tex} />)}. What is the {m(2, <>largest possible value of <Tex tex="a_1+a_2" size={tex} /></>)}?
    </>
  );
};

const CHOICES = [50, 71, 84, 94, 105];

// ---------- scenes ----------

const X0 = 110;
const CW = 172;

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const l0 = cue(scene, 0, 0.15);
  const step = (scene.lines[0].frames * 0.7) / 10;
  const l1 = cue(scene, 1, 0.05);
  return (
    <>
      <Text x={960} y={130} w={1600} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        Which start reaches <span style={{ color: C.primary }}>2024</span>?
      </Text>
      <SeqRow x={X0} y={290} cw={CW} values={fib.map(String)} shows={fib.map((_, i) => l0 + i * step)} opacity={fadeTo(f, l1, 0.3)} />
      <Text x={960} y={405} w={1400} size={44} weight={800} align="center" color={C.muted} style={{ ...fadeUp(f, cue(scene, 0, 0.5)), opacity: ease(f, cue(scene, 0, 0.5)) * fadeTo(f, l1, 0.3) }}>
        each term = the two before it, added
      </Text>
      <SeqRow
        x={X0} y={500} cw={CW}
        values={['?', '?', '', '', '', '', '', '', '', '2024']}
        shows={range(10).map((i) => l1 + (i === 9 ? 0 : 20 + i * 2))}
        styles={(i) => (i === 9 ? { border: C.primary, fill: C.primarySoft, color: C.primary } : i < 2 ? { border: YC, color: YC } : {})}
      />
      <Eq x={X0} y={640} start={cue(scene, 1, 0.6)} size={60} color={YC} tex="a_1 + a_2 = \,?" />
      <div style={{ position: 'absolute', left: 1360, top: 640, ...fadeUp(f, cue(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

/** The rule a(n+2) = a(n+1) + a(n), drawn as three boxes. */
const RuleBoxes: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  const cw = 190;
  return (
    <div style={{ ...fadeUp(f, start) }}>
      <SeqRow x={x} y={y} cw={cw} values={['a_n', 'a_{n+1}', 'a_{n+2}']} shows={[start, start + 4, start + 8]} size={52} styles={(i) => (i === 2 ? { border: C.primary, color: C.primary } : {})} />
      <svg style={{ position: 'absolute', left: x, top: y + 96, width: 3 * cw, height: 90, overflow: 'visible' }}>
        <g fill="none" stroke={C.primary} strokeWidth={5} strokeLinecap="round" opacity={ease(f, start + 14, 10)}>
          <path d={`M ${cw / 2 - 7} 6 Q ${cw * 1.5} 80 ${cw * 2.5 - 14} 8`} />
          <path d={`M ${cw * 1.5 - 7} 6 Q ${cw * 2} 44 ${cw * 2.5 - 14} 8`} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: x, top: y + 190, width: 3 * cw, textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.muted, opacity: ease(f, start + 18, 10) }}>
        add the two before
      </div>
    </div>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1080, background: C.card, borderRadius: 32, padding: '40px 50px', fontSize: 50, fontWeight: 600, lineHeight: 1.6, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        <QText scene={scene} marks />
      </div>
      <RuleBoxes x={1290} y={230} start={cue(scene, 0, 0.3)} />
      <Choices x={100} y={660} items={CHOICES.map((c) => <Tex key={c} tex={String(c)} size={60} />)} start={(i) => cue(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ex = ['1', '2', '3', '5', '8', '\\cdots', '\\cdots', '\\cdots', '\\cdots', '\\cdots'];
  const exShow = [cue(scene, 1, 0.25), cue(scene, 1, 0.3), cue(scene, 1, 0.5), cue(scene, 1, 0.6), cue(scene, 1, 0.7), ...range(5).map((i) => cue(scene, 1, 0.8) + i * 3)];
  const pick = ease(f, cue(scene, 0, 0.3), 10);
  return (
    <>
      <SeqRow x={X0} y={260} cw={CW} values={range(10).map(() => '')} shows={range(10).map((i) => 4 + i * 2)} styles={(i) => (i < 2 ? { border: YC } : {})} />
      <SeqRow
        x={X0} y={260} cw={CW} values={ex} shows={exShow} labels labelAt={6}
        styles={(i) => (i < 2 ? { border: YC, color: YC } : i >= 5 ? { color: C.muted } : {})}
      />
      {/* "pick these two" brace, then "the rest is fixed" */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible' }}>
        <path d={`M ${X0} 380 L ${X0} 395 L ${X0 + 2 * CW - 14} 395 L ${X0 + 2 * CW - 14} 380`} fill="none" stroke={YC} strokeWidth={5} opacity={pick} />
        <path d={`M ${X0 + 2 * CW} 395 L ${X0 + 10 * CW - 14} 395`} fill="none" stroke={C.muted} strokeWidth={5} strokeDasharray="14 12" opacity={ease(f, cue(scene, 0, 0.6), 10)} />
      </svg>
      <Text x={X0} y={405} w={360} size={42} weight={800} color={YC} style={{ opacity: pick }}>you pick</Text>
      <Text x={X0 + 2 * CW} y={405} w={1200} size={42} weight={800} color={C.muted} style={fadeUp(f, cue(scene, 0, 0.6))}>
        then every term is fixed
      </Text>
      <SeqRow
        x={X0} y={540} cw={CW}
        values={['?', '?', '', '', '', '', '', '', '', '2024']}
        shows={range(10).map((i) => cue(scene, 2, 0.1) + (i === 9 ? 16 : i * 2))}
        styles={(i) => (i === 9 ? { border: C.primary, fill: C.primarySoft, color: C.primary } : i < 2 ? { border: YC, color: YC } : {})}
      />
      <Eq x={X0 + 6 * CW} y={665} start={cue(scene, 2, 0.6)} size={56} color={C.primary} tex="a_{10} = 2024" />
      <Card x={X0} y={660} w={700} h={110} style={{ ...fadeUp(f, cue(scene, 3, 0.2)), display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 36, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: C.violet }}>Goal: the largest</span>
        <Tex tex="a_1 + a_2" size={56} />
      </Card>
    </>
  );
};

const makePause = (variant: boolean, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={100} y={190} w={1000} h={variant ? 380 : 440} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 44, fontSize: 48, fontWeight: 700, lineHeight: 1.6 }}>
          {variant ? (
            <>
              Same rule: <Tex tex="a_{n+2}=a_{n+1}+a_n" size={52} />, all terms positive integers, and{' '}
              <b style={{ color: C.primary, whiteSpace: 'nowrap' }}>
                <Tex tex="a_{10}=2025" size={52} />
              </b>
              . <span style={{ whiteSpace: 'nowrap' }}>Largest possible <Tex tex="a_1+a_2" size={52} />?</span>
            </>
          ) : (
            <QText size={48} tex={52} />
          )}
        </div>
      </Card>
      {!variant && <Choices x={100} y={680} items={CHOICES.map((c) => <Tex key={c} tex={String(c)} size={52} />)} start={() => 4} />}
      <Countdown scene={scene} seconds={seconds} x={1480} y={480} tick={TICK} />
    </>
  );
};

// ---- Solution 1: write every term with x and y ----

const fmt = (cx: number, cy: number, X = 'x', Y = 'y', xc = XC, yc = YC) => {
  const t = (c: number, v: string, col: string) => (c === 0 ? '' : `\\color{${col}}${c === 1 ? '' : c}\\color{${C.ink}}${v}`);
  const a = t(cx, X, xc);
  const b = t(cy, Y, yc);
  return a && b ? `${a} + ${b}` : a || b;
};

const COEF: [number, number][] = [[1, 0], [0, 1]];
while (COEF.length < 10) COEF.push([COEF[COEF.length - 1][0] + COEF[COEF.length - 2][0], COEF[COEF.length - 1][1] + COEF[COEF.length - 2][1]]);

const Build: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const shows = [
    cue(scene, 0, 0.45), cue(scene, 0, 0.75),
    cue(scene, 1, 0.1), cue(scene, 1, 0.55),
    ...range(5).map((i) => cue(scene, 2, 0.2 + i * 0.14)),
    cue(scene, 3, 0.1),
  ];
  const fibOn = cue(scene, 4, 0.3);
  return (
    <>
      {COEF.map(([a, b], i) => {
        const col = i < 5 ? 0 : 1;
        const row = i % 5;
        const last = i === 9;
        return (
          <div key={i} style={{ position: 'absolute', left: 140 + col * 540, top: 150 + row * 100, whiteSpace: 'nowrap', ...fadeUp(f, shows[i]) }}>
            <div style={{ display: 'inline-block', padding: '0 14px', borderRadius: 16, border: `5px solid ${last && f >= shows[9] + 10 ? C.primary : 'transparent'}` }}>
              <Tex tex={`a_{${i + 1}} = ${fmt(a, b)}`} size={56} />
            </div>
          </div>
        );
      })}
      <Text x={1250} y={170} w={620} size={52} weight={900} color={C.violet} style={fadeUp(f, fibOn)}>
        Fibonacci numbers!
      </Text>
      <Eq x={1250} y={260} start={fibOn + 8} size={56} tex={`\\color{${XC}}1, 1, 2, 3, 5,`} />
      <Eq x={1250} y={350} start={fibOn + 14} size={56} tex={`\\color{${XC}}8, 13, 21, \\ldots`} />
      <Text x={1250} y={450} w={620} size={40} weight={800} color={C.muted} style={fadeUp(f, fibOn + 22)}>
        each = sum of the two before
      </Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', justifyContent: 'center', ...fadeUp(f, cue(scene, 5, 0.3)) }}>
        <div style={{ background: C.card, border: `6px solid ${C.primary}`, borderRadius: 26, padding: '14px 44px', whiteSpace: 'nowrap' }}>
          <Tex tex={`${fmt(21, 34)} = 2024`} size={72} />
        </div>
      </div>
    </>
  );
};

const Split: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = 140;
  const R = 1060;
  return (
    <>
      <Eq x={L} y={160} start={0} size={60} tex={`${fmt(21, 34)} = 2024`} />
      <Eq x={L} y={290} start={cue(scene, 0, 0.55)} size={60} tex={`\\color{${XC}}21\\color{${C.ink}}x + \\color{${YC}}21\\color{${C.ink}}y + \\color{${YC}}13\\color{${C.ink}}y = 2024`} />
      <Eq x={L} y={440} start={cue(scene, 1, 0.45)} size={60} tex="21(x + y) + 13y = 2024" />
      <Eq x={L} y={570} start={cue(scene, 2, 0.15)} size={52} color={C.violet} tex="T = x + y" />
      <div style={{ position: 'absolute', left: L - 20, top: 650, padding: '10px 24px', border: `6px solid ${C.primary}`, borderRadius: 22, whiteSpace: 'nowrap', ...fadeUp(f, cue(scene, 2, 0.45)) }}>
        <Tex tex="21T + 13y = 2024" size={68} />
      </div>
      <Text x={R} y={170} w={800} size={48} weight={900} color={C.violet} style={fadeUp(f, cue(scene, 3, 0.4))}>
        small y → big T
      </Text>
      <Eq x={R} y={290} start={cue(scene, 4, 0.1)} size={56} tex="y \ge 1" />
      <Eq x={R} y={390} start={cue(scene, 4, 0.5)} size={56} tex="21T \le 2024 - 13 = 2011" />
      <Eq x={R} y={500} start={cue(scene, 5, 0.2)} size={56} tex="21 \times 96 = 2016 > 2011" color={C.red} />
      <Eq x={R} y={620} start={cue(scene, 5, 0.65)} size={68} tex="T \le 95" color={C.green} />
    </>
  );
};

const CHIPW = 266;
const chipX = (i: number) => 100 + (i % 6) * (CHIPW + 24);
const chipY = (i: number, y0 = 330) => y0 + Math.floor(i / 6) * 135;

const Countdown2024: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const Ss = range(12).map((i) => 95 - i);
  const starts = [
    cue(scene, 1, 0.2),
    cue(scene, 2, 0.45), cue(scene, 2, 0.6), cue(scene, 2, 0.75),
    ...range(7).map((i) => cue(scene, 2, 0.9) + i * 7),
    cue(scene, 3, 0.55),
  ];
  return (
    <>
      <Eq x={140} y={150} start={0} size={56} tex="21T + 13y = 2024" />
      <Eq x={760} y={150} start={cue(scene, 0, 0.4)} size={56} tex="\text{leftover} = 2024 - 21T = 13y" color={C.violet} />
      {Ss.map((S, i) => (
        <Chip key={S} x={chipX(i)} y={chipY(i)} w={CHIPW} S={S} left={2024 - 21 * S} start={starts[i]} markAt={i === 0 ? cue(scene, 1, 0.6) : i === 11 ? cue(scene, 4, 0.1) : starts[i] + 8} good={i === 11} />
      ))}
      <Eq x={100} y={244} start={cue(scene, 1, 0.1)} size={48} tex="T \to \text{leftover}" color={C.muted} />
      <Text x={1150} y={600} w={700} size={48} weight={900} color={C.muted} style={{ ...fadeUp(f, cue(scene, 2, 0.2)), textAlign: 'right' }}>
        each step down: +21
      </Text>
      <Eq x={140} y={600} start={cue(scene, 4, 0.2)} size={60} tex="260 = 13 \times 20 \;\Rightarrow\; y = 20" color={YC} />
      <Eq x={140} y={700} start={cue(scene, 5, 0.3)} size={60} tex="x = 84 - 20 = 64" color={XC} />
    </>
  );
};

const CheckSeq: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const shows = [cue(scene, 0, 0.45), cue(scene, 0, 0.6), ...range(7).map((i) => cue(scene, 1, 0.05 + i * 0.13)), cue(scene, 2, 0.1)];
  const done = cue(scene, 2, 1);
  return (
    <>
      <SeqRow
        x={X0} y={260} cw={CW} values={SEQ84.map(String)} shows={shows} labels labelAt={4}
        styles={(i) => (i === 0 ? { border: XC, color: XC } : i === 1 ? { border: YC, color: YC } : i === 9 ? { border: C.green, fill: 'rgba(33,196,93,0.12)', color: C.green } : {})}
      />
      <RunningSum x0={X0} cw={CW} y={400} vals={SEQ84} starts={shows} until={cue(scene, 2, 0.5)} />
      <Eq x={140} y={560} start={cue(scene, 2, 0.55)} size={68} tex={`a_1 + a_2 = \\color{${XC}}64\\color{${C.ink}} + \\color{${YC}}20\\color{${C.ink}} = 84`} />
      <Answer x={1600} y={600} value="C" chime={CHIME} start={done} />
      <Confetti x={1600} y={600} start={done} seed={7} />
    </>
  );
};

// ---- Solution 2: x + y is the third term ----

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // terms a2..a10 written with y and S: coefficients (y, S)
  const co: [number, number][] = [[1, 0], [0, 1]];
  while (co.length < 9) co.push([co[co.length - 1][0] + co[co.length - 2][0], co[co.length - 1][1] + co[co.length - 2][1]]);
  const shows = [cue(scene, 1, 0.45), cue(scene, 1, 0.75), ...range(7).map((i) => cue(scene, 2, 0.05 + i * 0.07))];
  const same = cue(scene, 2, 0.7);
  return (
    <>
      <Eq x={140} y={150} start={cue(scene, 0, 0.35)} size={60} tex={`a_3 = a_1 + a_2 = x + y = \\color{${C.violet}}T`} />
      {co.map(([b, s], i) => {
        const col = i < 5 ? 0 : 1;
        const row = i % 5;
        return (
          <div key={i} style={{ position: 'absolute', left: 140 + col * 560, top: 270 + row * 98, whiteSpace: 'nowrap', ...fadeUp(f, shows[i]) }}>
            <div style={{ display: 'inline-block', padding: '0 14px', borderRadius: 16, border: `5px solid ${i === 8 && f >= same ? C.primary : 'transparent'}` }}>
              <Tex tex={`a_{${i + 2}} = ${fmt(b, s, 'y', 'T', YC, C.violet)}`} size={56} />
            </div>
          </div>
        );
      })}
      <Eq x={1290} y={420} start={same} size={60} tex="13y + 21T = 2024" />
      <Text x={1290} y={530} w={600} size={48} weight={900} color={C.green} style={fadeUp(f, same + 10)}>
        ✓ Same equation!
      </Text>
    </>
  );
};

const TestRow: React.FC<{ y: number; letter: string; tex: string; start: number; good: boolean; note?: string }> = ({ y, letter, tex, start, good, note }) => {
  const f = useCurrentFrame();
  const col = good ? C.green : C.red;
  const mark = ease(f, start + 20, 10);
  return (
    <div style={{ position: 'absolute', left: 120, top: y, display: 'flex', alignItems: 'center', gap: 30, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <div style={{ width: 84, height: 84, borderRadius: 20, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900, color: C.muted }}>{letter}</div>
      <Tex tex={tex} size={56} />
      <div style={{ opacity: mark, width: 64, height: 64, borderRadius: '50%', background: col, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{good ? '✓' : '✗'}</div>
      {note && <div style={{ opacity: mark, fontSize: 44, fontWeight: 800, color: col }}>{note}</div>}
    </div>
  );
};

const Test: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={140} y={150} start={0} size={56} tex="2024 - 21T = 13y" color={C.violet} />
      <Pill x={760} y={158} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.3))}>biggest choice first</Pill>
      <TestRow y={280} letter="E" tex="T = 105:\ \ 21 \times 105 = 2205 > 2024" start={cue(scene, 0, 0.3)} good={false} note="too big" />
      <TestRow y={410} letter="D" tex="T = 94:\ \ 2024 - 21 \times 94 = 50" start={cue(scene, 1, 0.1)} good={false} note="not 13 × anything" />
      <TestRow y={540} letter="C" tex="T = 84:\ \ 2024 - 21 \times 84 = 260 = 13 \times 20" start={cue(scene, 2, 0.1)} good />
      <Eq x={234} y={625} start={cue(scene, 3, 0.1)} size={52} color={C.green} tex="y = 20,\ \ x = 84 - 20 = 64 > 0" />
      <Card x={120} y={720} w={1300} h={100} style={{ ...fadeUp(f, cue(scene, 4, 0.45)), display: 'flex', alignItems: 'center', paddingLeft: 40 }}>
        <span style={{ fontSize: 44, fontWeight: 900 }}>
          <span style={{ color: C.primary }}>Asked for the largest?</span> Test the choices from the top.
        </span>
      </Card>
    </>
  );
};

// ---- traps ----

const NOTES = ['30 + 20', '30 + 41', '64 + 20', '64 + 30', '64 + 41'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [cue(scene, 4, 0.6), cue(scene, 2, 0.2), Infinity, cue(scene, 4, 0.1), cue(scene, 3, 0.85)];
  const noteAt = [cue(scene, 4, 0.6), cue(scene, 1, 0.3), cue(scene, 2, 0.2), cue(scene, 4, 0.1), cue(scene, 3, 0.85)];
  const okAt = cue(scene, 2, 0.2);
  const bannerAt = cue(scene, 5, 0.15);
  const notesOut = fadeTo(f, bannerAt);
  // which cells to ring: [row (0 = 84 start, 1 = 71 start), cell]
  const rings: [number, number, number, number][] = [
    // [row, cell, from, to]
    [0, 0, cue(scene, 3, 0.8), cue(scene, 4, 0.05)], [1, 1, cue(scene, 3, 0.8), cue(scene, 4, 0.05)],
    [0, 0, cue(scene, 4, 0.05), cue(scene, 4, 0.5)], [1, 0, cue(scene, 4, 0.05), cue(scene, 4, 0.5)],
    [1, 0, cue(scene, 4, 0.5), cue(scene, 5)], [0, 1, cue(scene, 4, 0.5), cue(scene, 5)],
  ];
  const ringOn = (row: number, i: number) => rings.some(([r, c, a, b]) => r === row && c === i && f >= a && f < b);
  const RX = 300;
  const RCW = 156;
  const rowStyle = (row: number) => (i: number): CellStyle =>
    ringOn(row, i) ? { border: C.red, color: C.red, fill: 'rgba(239,67,67,0.08)' } : i === 9 ? { border: C.green, color: C.green } : i < 2 ? { border: i === 0 ? XC : YC } : {};
  return (
    <>
      <div style={{ position: 'absolute', left: 95, top: 140, display: 'flex', gap: 30 }}>
        {CHOICES.map((c, i) => {
          const wrong = f >= wrongAt[i];
          const ok = i === 2 && f >= okAt;
          const real = i === 1 && f >= noteAt[1] && !wrong;
          const border = wrong ? C.red : ok ? C.green : real ? C.blue : 'transparent';
          const col = wrong ? C.red : ok ? C.green : C.ink;
          return (
            <div key={c} style={{ width: 320, height: 250, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative', ...fadeUp(f, 6 + i * 5, 12) }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 14 }}>{'ABCDE'[i]}</div>
              <Tex tex={String(c)} size={72} color={col} />
              <div style={{ marginTop: 6, opacity: ease(f, noteAt[i], 10) }}>
                <Tex tex={NOTES[i]} size={48} color={col} />
              </div>
              {(wrong || ok) && (
                <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: wrong ? C.red : C.green, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {wrong ? '✗' : '✓'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ opacity: notesOut }}>
        <Eq x={110} y={432} start={0} size={52} tex="T{=}84" color={C.green} />
        <SeqRow x={RX} y={420} cw={RCW} h={86} size={48} values={SEQ84.map(String)} shows={range(10).map(() => 0)} styles={rowStyle(0)} />
        <Eq x={110} y={542} start={cue(scene, 1, 0.2)} size={52} tex="T{=}71" color={C.blue} />
        <SeqRow x={RX} y={530} cw={RCW} h={86} size={48} values={SEQ71.map(String)} shows={range(10).map((i) => cue(scene, 1, 0.2) + i * 3)} styles={rowStyle(1)} />
        <Eq x={110} y={660} start={cue(scene, 0, 0.6)} size={52} tex="T{=}71:\ \ 2024 - 21 \times 71 = 533 = 13 \times 41" color={C.blue} opacity={fadeTo(f, cue(scene, 2, 0.4))} />
        <Eq x={110} y={660} start={cue(scene, 2, 0.5)} size={52} tex="71 < 84" opacity={fadeTo(f, cue(scene, 3, 0.4))} />
        <Eq x={600} y={660} start={cue(scene, 2, 0.75)} size={52} tex="T{=}58:\ \ y = 62,\ x = 58 - 62 = -4" color={C.red} opacity={fadeTo(f, cue(scene, 3, 0.4))} />
        <Text x={110} y={665} w={1700} size={46} weight={900} color={C.red} style={{ ...fadeUp(f, cue(scene, 4, 0.8)) }}>
          No mixed pair works here.
        </Text>
        <Eq x={110} y={740} start={cue(scene, 4, 0.75)} size={48} tex="T{=}50:\ \ 2024 - 21 \times 50 = 974,\ \text{not } 13 \times \text{anything}" color={C.red} />
      </div>
      <div style={{ position: 'absolute', left: 210, top: 500, width: 1500, textAlign: 'center', background: C.primary, color: '#fff', borderRadius: 28, padding: '22px 40px', fontSize: 50, fontWeight: 900, ...fadeUp(f, bannerAt) }}>
        Find EVERY start that works, then compare!
      </div>
    </>
  );
};

// ---- variant ----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={160} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.1))}>Your turn!</Pill>
      <Text x={120} y={260} w={1700} size={56} weight={800} style={fadeUp(f, cue(scene, 0, 0.3))}>
        Same rule: <Tex tex="a_{n+2}=a_{n+1}+a_n" size={60} />, all terms positive integers.
      </Text>
      <SeqRow
        x={X0} y={400} cw={CW}
        values={['?', '?', '', '', '', '', '', '', '', '2025']}
        shows={range(10).map((i) => cue(scene, 0, 0.6) + (i === 9 ? 16 : i * 2))}
        styles={(i) => (i === 9 ? { border: C.primary, fill: C.primarySoft, color: C.primary } : i < 2 ? { border: YC, color: YC } : {})}
      />
      <Eq x={X0 + 6 * CW} y={530} start={cue(scene, 0, 0.75)} size={60} color={C.primary} tex="a_{10} = 2025" />
      <Text x={120} y={650} w={1600} size={56} weight={900} style={fadeUp(f, cue(scene, 1, 0.2))}>
        Largest possible <Tex tex="a_1 + a_2" size={60} /> ?
      </Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const Ss = range(7).map((i) => 95 - i);
  const W = 300;
  const starts = [...range(6).map((i) => cue(scene, 1, 0.45 + i * 0.09)), cue(scene, 2, 0.4)];
  const seqShows = [cue(scene, 3, 0.15), cue(scene, 3, 0.2), ...range(8).map((i) => cue(scene, 3, 0.3 + i * 0.057))];
  const done = cue(scene, 4, 0.45);
  return (
    <>
      <Eq x={140} y={150} start={cue(scene, 0, 0.2)} size={56} tex="21T + 13y = 2025" />
      <Eq x={760} y={150} start={cue(scene, 1, 0.05)} size={56} tex="T \le 95" color={C.violet} />
      <Eq x={1100} y={156} start={cue(scene, 1, 0.3)} size={48} tex="T \to \text{leftover}" color={C.muted} />
      {Ss.map((S, i) => (
        <Chip key={S} x={100 + (i % 4) * (W + 22)} y={260 + Math.floor(i / 4) * 130} w={W} S={S} left={2025 - 21 * S} start={starts[i]} markAt={i === 6 ? cue(scene, 2, 0.75) : starts[i] + 8} good={i === 6} />
      ))}
      <Eq x={140} y={530} start={cue(scene, 2, 0.75)} size={56} tex="156 = 13 \times 12 \;\Rightarrow\; y = 12" color={YC} />
      <Eq x={1000} y={530} start={cue(scene, 3, 0.1)} size={56} tex="x = 89 - 12 = 77" color={XC} />
      <SeqRow
        x={X0} y={650} cw={CW} values={SEQ89.map(String)} shows={seqShows}
        styles={(i) => (i === 0 ? { border: XC, color: XC } : i === 1 ? { border: YC, color: YC } : i === 9 ? { border: C.green, fill: 'rgba(33,196,93,0.12)', color: C.green } : {})}
      />
      <Answer x={1660} y={400} value="89" chime={CHIME} start={done} />
      <Confetti x={1660} y={400} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, cue(scene, 2));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 640, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 120, width: 1460, fontSize: 58, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, cue(scene, 0, 0.1)) }}>
          Every term is a fixed mix of the first two.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 230, ...fadeUp(f, cue(scene, 0, 0.5)) }}>
          <Tex tex={`a_{10} = ${fmt(21, 34, 'a_1', 'a_2')}`} size={68} />
        </div>
        <div style={{ position: 'absolute', left: 70, top: 380, width: 1460, fontSize: 52, fontWeight: 800, color: C.violet, lineHeight: 1.3, ...fadeUp(f, cue(scene, 1, 0.1)) }}>
          One equation in whole numbers. Then find every start, and compare.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, cue(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={cue(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(false, 10),
  build: Build,
  split: Split,
  countdown: Countdown2024,
  check: CheckSeq,
  sol2: Sol2,
  test: Test,
  traps: Traps,
  variant: Variant,
  try2: makePause(true, 10),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-10-30-square-and-cube';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Prime colours: twos = blue, fives = amber, threes = violet. Square ideas = green, cube ideas = violet.
const PRIME: Record<number, string> = { 2: C.blue, 3: C.violet, 5: C.amber };
const SQ = C.primary;
const CU = C.violet;

/** Frame where line `i` of a scene starts, plus `t` of the way through it. */
const cue = (scene: Scene, i: number, t = 0) => at(scene, i, t);

// ---------- small building blocks ----------

/** A maths line placed absolutely; fades up at `start`. */
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

/** One prime as a coloured ball. */
export const Ball: React.FC<{ x: number; y: number; p: number; r?: number; s?: number }> = ({ x, y, p, r = 32, s = 1 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill={PRIME[p]} />
      <text y={r * 0.06} fontFamily={NUNITO} fontWeight={900} fontSize={r * 1.5} fill="#fff" textAnchor="middle" dominantBaseline="middle">
        {p}
      </text>
    </g>
  );

/** A row of prime balls, popping in one by one. `group` = 2 or 3 draws a bracket under each pair or triple of equal primes. */
const Balls: React.FC<{ ps: number[]; x: number; y: number; r?: number; gap?: number; start: number; stagger?: number; group?: number; groupAt?: number; opacity?: number }> = ({
  ps, x, y, r = 32, gap = 80, start, stagger = 3, group, groupAt = 0, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (opacity <= 0) return null;
  // extra space between different primes
  const xs: number[] = [];
  let cx = x;
  ps.forEach((p, i) => {
    if (i > 0 && ps[i - 1] !== p) cx += gap * 0.35;
    xs.push(cx);
    cx += gap;
  });
  const g = group ? ease(f, groupAt, 12) : 0;
  return (
    <g opacity={opacity}>
      {group &&
        g > 0 &&
        range(ps.length / group).map((k) => {
          const a = xs[k * group] - r - 6;
          const b = xs[k * group + group - 1] + r + 6;
          return <rect key={k} x={a} y={y - r - 8} width={b - a} height={2 * r + 16} rx={r + 8} fill="none" stroke={group === 2 ? SQ : CU} strokeWidth={5} opacity={g} />;
        })}
      {ps.map((p, i) => (
        <Ball key={i} x={xs[i]} y={y} p={p} r={r} s={pop(f, start + i * stagger, fps)} />
      ))}
    </g>
  );
};

/** k×k grid of little squares: a picture of a perfect square. */
const SquarePic: React.FC<{ x: number; y: number; k: number; cell: number; p: number }> = ({ x, y, k, cell, p }) => (
  <g opacity={p}>
    {range(k * k).map((i) => {
      const s = Math.max(0, Math.min(1, p * k * k * 0.6 - i * 0.6 + 0.6));
      return <rect key={i} x={x + (i % k) * cell + 3} y={y + Math.floor(i / k) * cell + 3} width={cell - 6} height={cell - 6} rx={6} fill={SQ} opacity={0.25 + 0.6 * s} />;
    })}
  </g>
);

/** k×k×k isometric block of cubes: a picture of a perfect cube. (x, y) = top corner of the top face. */
const CubePic: React.FC<{ x: number; y: number; k: number; e: number; p: number }> = ({ x, y, k, e, p }) => {
  if (p <= 0) return null;
  const ux = e * 0.866;
  const uy = e * 0.5;
  // point on the block: i along right-down, j along left-down, h downwards
  const P = (i: number, j: number, h: number) => `${x + (i - j) * ux},${y + (i + j) * uy + h * e}`;
  const face = (pts: string[], fill: string) => <polygon points={pts.join(' ')} fill={fill} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />;
  const cells: React.ReactNode[] = [];
  range(k).forEach((a) =>
    range(k).forEach((b) => {
      cells.push(<g key={`t${a}${b}`}>{face([P(a, b, 0), P(a + 1, b, 0), P(a + 1, b + 1, 0), P(a, b + 1, 0)], '#b9acff')}</g>);
      cells.push(<g key={`r${a}${b}`}>{face([P(k, a, b), P(k, a + 1, b), P(k, a + 1, b + 1), P(k, a, b + 1)], '#7b61ff')}</g>);
      cells.push(<g key={`l${a}${b}`}>{face([P(a, k, b), P(a + 1, k, b), P(a + 1, k, b + 1), P(a, k, b + 1)], '#9a86ff')}</g>);
    }),
  );
  return <g opacity={p} transform={`translate(0 ${(1 - p) * 20})`}>{cells}</g>;
};

/** Number strip 0…9 for "which exponents work?". `on` lists the lit cells. */
const Strip: React.FC<{ x: number; y: number; on: number[]; color: string; start: number; cw?: number; h?: number; hi?: number; hiAt?: number; opacity?: number }> = ({
  x, y, on, color, start, cw = 96, h = 86, hi, hiAt = 0, opacity = 1,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 10, opacity }}>
      {range(10).map((v) => {
        const lit = on.includes(v) ? ease(f, start + on.indexOf(v) * 6, 10) : 0;
        const best = hi === v ? ease(f, hiAt, 10) : 0;
        return (
          <div
            key={v}
            style={{
              width: cw,
              height: h,
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
              fontWeight: 900,
              background: lit > 0 ? `rgba(255,255,255,1)` : C.card,
              border: `5px solid ${best > 0 ? C.green : lit > 0.5 ? color : C.line}`,
              color: lit > 0.5 ? color : C.muted,
              boxShadow: lit > 0 ? `inset 0 0 0 999px ${color}${Math.round(lit * 40).toString(16).padStart(2, '0')}` : undefined,
              transform: `scale(${1 + 0.08 * best})`,
            }}
          >
            {v}
          </div>
        );
      })}
    </div>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = cue(scene, 0, 0.05);
  const b = cue(scene, 0, 0.55);
  return (
    <>
      <Text x={960} y={130} w={1600} size={80} weight={900} align="center" style={fadeUp(f, 0)}>
        One number, two jobs
      </Text>
      <Card x={250} y={270} w={660} h={460} style={fadeUp(f, a)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center' }}>
          <Tex tex="20 \times n" size={72} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontSize: 50, fontWeight: 900, color: SQ }}>a perfect square</div>
      </Card>
      <Card x={1010} y={270} w={660} h={460} style={fadeUp(f, b)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center' }}>
          <Tex tex="50 \times n" size={72} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontSize: 50, fontWeight: 900, color: CU }}>a perfect cube</div>
      </Card>
      <Stage>
        <SquarePic x={580 - 90} y={415} k={3} cell={60} p={ease(f, a + 10, 24)} />
        <CubePic x={1340} y={405} k={3} e={34} p={ease(f, b + 10, 16)} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center', ...fadeUp(f, cue(scene, 1, 0.15)) }}>
        <Tex tex="n = \,?" size={80} color={C.primary} />
      </div>
      <div style={{ position: 'absolute', left: 250, top: 735, display: 'flex', gap: 18 }}>
        <Pill x={0} y={0} color={C.primary} style={{ position: 'relative', fontSize: 36, ...fadeUp(f, cue(scene, 1, 0.75)) }}>① list</Pill>
        <Pill x={0} y={0} color={C.violet} style={{ position: 'relative', fontSize: 36, ...fadeUp(f, cue(scene, 1, 0.85)) }}>② primes</Pill>
      </div>
      <div style={{ position: 'absolute', left: 1400, top: 735, ...fadeUp(f, cue(scene, 2)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 64, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CHOICES = ['10', '20', '40', '50', '100'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 180, width: 1600, background: C.card, borderRadius: 32, padding: '48px 60px', fontSize: 60, fontWeight: 600, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        What is the <Mark on={cue(scene, 1, 0.1)}>smallest positive integer</Mark> <Tex tex="n" size={64} /> such that{' '}
        <Mark on={cue(scene, 1, 0.6)}>
          <Tex tex="20n" size={64} /> is a perfect square
        </Mark>{' '}
        and{' '}
        <Mark on={cue(scene, 2, 0.2)}>
          <Tex tex="50n" size={64} /> is a perfect cube
        </Mark>
        ?
      </div>
      <Choices x={160} y={600} items={CHOICES.map((c) => <Tex key={c} tex={c} size={60} />)} start={(i) => cue(scene, 3, 0.1 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = cue(scene, 0, 0.3);
  const c = cue(scene, 1, 0.3);
  return (
    <>
      <Card x={140} y={150} w={790} h={500} style={fadeUp(f, cue(scene, 0, 0.05))}>
        <div style={{ position: 'absolute', left: 40, top: 30, fontSize: 52, fontWeight: 900, color: SQ }}>Perfect square</div>
        <div style={{ position: 'absolute', left: 40, top: 100, fontSize: 40, fontWeight: 700, color: C.muted }}>a whole number times itself</div>
        <div style={{ position: 'absolute', left: 330, top: 380, ...fadeUp(f, s + 10) }}>
          <Tex tex="9" size={72} />
        </div>
        <div style={{ position: 'absolute', left: 520, top: 380, ...fadeUp(f, cue(scene, 0, 0.75)) }}>
          <Tex tex="400" size={72} />
        </div>
      </Card>
      <Card x={990} y={150} w={790} h={500} style={fadeUp(f, cue(scene, 1, 0.05))}>
        <div style={{ position: 'absolute', left: 40, top: 30, fontSize: 52, fontWeight: 900, color: CU }}>Perfect cube</div>
        <div style={{ position: 'absolute', left: 40, top: 100, fontSize: 36, fontWeight: 700, color: C.muted }}>a whole number times itself, times itself</div>
        <div style={{ position: 'absolute', left: 330, top: 380, ...fadeUp(f, c + 10) }}>
          <Tex tex="8" size={72} />
        </div>
        <div style={{ position: 'absolute', left: 520, top: 380, ...fadeUp(f, cue(scene, 1, 0.8)) }}>
          <Tex tex="1000" size={72} />
        </div>
      </Card>
      <Stage>
        <SquarePic x={200} y={330} k={3} cell={66} p={ease(f, s, 24)} />
        <CubePic x={1140} y={320} k={2} e={70} p={ease(f, c, 16)} />
      </Stage>
      <div style={{ position: 'absolute', left: 140, top: 690, width: 1640, display: 'flex', justifyContent: 'center', gap: 26, alignItems: 'center', fontSize: 48, fontWeight: 800, ...fadeUp(f, cue(scene, 2, 0.1)) }}>
        <span>ONE</span>
        <Tex tex="n" size={60} />
        <span>:</span>
        <Tex tex="20n" size={60} color={SQ} />
        <span style={{ color: SQ }}>square</span>
        <span>AND</span>
        <Tex tex="50n" size={60} color={CU} />
        <span style={{ color: CU }}>cube</span>
        <span style={{ ...fadeUp(f, cue(scene, 2, 0.65)), background: C.primary, color: '#fff', borderRadius: 999, padding: '6px 26px' }}>smallest!</span>
      </div>
    </>
  );
};

const makePause = (seconds: number, body: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={110} y={220} w={900} h={460} style={fadeUp(f, 0)}>
        <div style={{ position: 'absolute', left: 54, right: 54, top: 50, fontSize: 56, fontWeight: 700, lineHeight: 1.5 }}>{body}</div>
      </Card>
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} />
    </>
  );
};

// ---- Solution 1: make a list ----

const LIST = [5, 20, 45, 80];
const LIST_K = ['5 \\times 1', '5 \\times 4', '5 \\times 9', '5 \\times 16'];

const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phase2 = cue(scene, 5); // cube test starts
  const top = fadeTo(f, phase2 - 6);
  const move = ease(f, phase2 - 6, 18);
  const chipY = 560 + (250 - 560) * move;
  const fail5 = cue(scene, 7, 0.4);
  const pass20 = cue(scene, 8, 0.4);
  const done = cue(scene, 9, 0.97);
  const lineIn = ease(f, cue(scene, 6, 0.05), 14) * fadeTo(f, cue(scene, 8, 0.1), 0.35);
  // number line 200 … 360
  const nx = (v: number) => 180 + ((v - 200) / 160) * 860;
  const NY = 620;
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={{ ...fadeUp(f, cue(scene, 0, 0.3)), opacity: ease(f, cue(scene, 0, 0.3)) * top }}>Make a list</Pill>
      <div style={{ opacity: top }}>
        <Eq x={120} y={250} start={cue(scene, 1, 0.05)} tex="20n = 4 \times 5n" />
        <Text x={700} y={256} w={1100} size={48} weight={800} color={SQ} style={fadeUp(f, cue(scene, 1, 0.55))}>
          4 = 2 × 2 is already a square ✓
        </Text>
        <div style={{ position: 'absolute', left: 120, top: 350, display: 'flex', gap: 22, alignItems: 'center', fontSize: 46, fontWeight: 800, whiteSpace: 'nowrap', ...fadeUp(f, cue(scene, 2, 0.2)) }}>
          <Tex tex="20n" size={56} /> is a square exactly when <Tex tex="5n" size={56} /> is a square
        </div>
        <div style={{ position: 'absolute', left: 120, top: 440, display: 'flex', gap: 22, alignItems: 'center', fontSize: 46, fontWeight: 800, whiteSpace: 'nowrap', ...fadeUp(f, cue(scene, 3, 0.2)) }}>
          <Tex tex="5n = 5 \times 5 \times \square" size={56} />
          <span style={{ color: C.muted }}>→</span>
          <Tex tex="n = 5 \times \square" size={56} color={C.primary} />
          <span style={{ color: C.muted, fontSize: 48 }}>(□ = a perfect square)</span>
        </div>
      </div>
      {/* the list of candidates */}
      <div style={{ position: 'absolute', left: 120, top: chipY, display: 'flex', gap: 30, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 46, fontWeight: 800, paddingTop: 22, width: 120, opacity: ease(f, cue(scene, 4, 0.05), 10) }}>
          <Tex tex="n:" size={56} />
        </div>
        {LIST.map((v, i) => {
          const s = pop(f, cue(scene, 4, 0.12 + i * 0.13), fps);
          const bad = v === 5 && f >= fail5;
          const good = v === 20 && f >= pass20;
          const active = (v === 5 && f >= phase2 && f < cue(scene, 8)) || (v === 20 && f >= cue(scene, 8));
          return (
            <div key={v} style={{ textAlign: 'center', transform: `scale(${s})`, opacity: Math.min(1, s) }}>
              <div style={{ width: 170, height: 100, borderRadius: 22, background: C.card, border: `5px solid ${bad ? C.red : good ? C.green : active ? C.primary : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
                <Tex tex={String(v)} size={60} color={bad ? C.red : good ? C.green : C.ink} />
                {(bad || good) && (
                  <div style={{ position: 'absolute', top: -22, right: -22, width: 52, height: 52, borderRadius: '50%', background: bad ? C.red : C.green, color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bad ? '✗' : '✓'}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8, opacity: top }}>
                <Tex tex={LIST_K[i]} size={48} color={C.muted} />
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 60, fontWeight: 900, color: C.muted, paddingTop: 16, opacity: ease(f, cue(scene, 4, 0.7), 10) }}>…</div>
      </div>
      <Text x={1190} y={chipY + 18} w={760} size={44} weight={800} color={C.muted} style={{ opacity: ease(f, cue(scene, 4, 0.75), 10) }}>
        smallest first →
      </Text>

      {/* cube test for n = 5 */}
      <Eq x={120} y={400} start={cue(scene, 5, 0.45)} tex="50 \times 5 = 250" opacity={fadeTo(f, cue(scene, 8, 0.1), 0.35)} />
      <Stage>
        <g opacity={lineIn}>
          <line x1={nx(200)} y1={NY} x2={nx(360)} y2={NY} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          {[216, 343].map((v, k) => (
            <g key={v} opacity={ease(f, cue(scene, 6, 0.1 + k * 0.45), 10)}>
              <line x1={nx(v)} y1={NY - 24} x2={nx(v)} y2={NY + 24} stroke={CU} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
          <g opacity={ease(f, cue(scene, 7, 0.05), 10)}>
            <circle cx={nx(250)} cy={NY} r={16} fill={C.red} />
          </g>
        </g>
      </Stage>
      <div style={{ opacity: lineIn }}>
        <Eq x={nx(216) - 160} y={NY + 40} start={cue(scene, 6, 0.1)} size={52} color={CU} tex="6^3 = 216" />
        <Eq x={nx(343) - 160} y={NY + 40} start={cue(scene, 6, 0.55)} size={52} color={CU} tex="7^3 = 343" />
        <Eq x={nx(250) - 50} y={NY - 110} start={cue(scene, 7, 0.05)} size={52} color={C.red} tex="250" />
        <Text x={nx(250) + 70} y={NY - 104} w={420} size={46} weight={900} color={C.red} style={fadeUp(f, cue(scene, 7, 0.4))}>
          ✗ not a cube
        </Text>
      </div>

      {/* cube test for n = 20 */}
      <Eq x={1140} y={400} start={cue(scene, 8, 0.3)} tex="50 \times 20 = 1000" color={C.ink} />
      <Eq x={1140} y={490} start={cue(scene, 8, 0.65)} tex="= 10 \times 10 \times 10 \;\checkmark" color={C.green} />
      <Text x={1140} y={600} w={500} size={44} weight={800} color={C.muted} style={fadeUp(f, cue(scene, 9, 0.2))}>
        first one that works
      </Text>
      <Answer x={1700} y={680} value="B" chime={CHIME} start={done} />
      <Confetti x={1700} y={680} start={done} seed={7} />
    </>
  );
};

// ---- Solution 2: count the primes ----

const Primes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const FX = 380;
  return (
    <>
      <Pill x={120} y={140} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.3))}>Count the primes</Pill>
      <Eq x={120} y={240} start={cue(scene, 1, 0.02)} tex="20 =" size={60} />
      <Eq x={120} y={340} start={cue(scene, 1, 0.5)} tex="50 =" size={60} />
      <Stage>
        <Balls ps={[2, 2, 5]} x={FX} y={278} start={cue(scene, 1, 0.1)} stagger={5} />
        <Balls ps={[2, 5, 5]} x={FX} y={378} start={cue(scene, 1, 0.6)} stagger={5} />
      </Stage>

      {/* square rule */}
      <Card x={800} y={210} w={1060} h={250} style={fadeUp(f, cue(scene, 2, 0.05))}>
        <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 46, fontWeight: 900, color: SQ }}>
          Square: every prime count is <u>even</u>
        </div>
        <div style={{ position: 'absolute', left: 40, top: 128, ...fadeUp(f, cue(scene, 3, 0.02)) }}>
          <Tex tex="400 =" size={56} />
        </div>
        <div style={{ position: 'absolute', left: 760, top: 128, ...fadeUp(f, cue(scene, 3, 0.6)) }}>
          <Tex tex="2^4 \times 5^2" size={56} color={SQ} />
        </div>
      </Card>
      {/* cube rule */}
      <Card x={800} y={490} w={1060} h={250} style={fadeUp(f, cue(scene, 4, 0.05))}>
        <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 46, fontWeight: 900, color: CU }}>
          Cube: every count is a <u>multiple of 3</u>
        </div>
        <div style={{ position: 'absolute', left: 40, top: 128, ...fadeUp(f, cue(scene, 4, 0.5)) }}>
          <Tex tex="1000 =" size={56} />
        </div>
        <div style={{ position: 'absolute', left: 760, top: 128, ...fadeUp(f, cue(scene, 4, 0.85)) }}>
          <Tex tex="2^3 \times 5^3" size={56} color={CU} />
        </div>
      </Card>
      <Stage>
        <Balls ps={[2, 2, 2, 2, 5, 5]} x={1070} y={370} r={26} gap={64} start={cue(scene, 3, 0.05)} stagger={3} group={2} groupAt={cue(scene, 3, 0.5)} />
        <Balls ps={[2, 2, 2, 5, 5, 5]} x={1120} y={650} r={26} gap={64} start={cue(scene, 4, 0.55)} stagger={3} group={3} groupAt={cue(scene, 4, 0.85)} />
      </Stage>

      {/* n */}
      <Card x={120} y={490} w={640} h={250} style={fadeUp(f, cue(scene, 5, 0.05))}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center' }}>
          <Tex tex="n = 2^{\color{#3c83f6}x} \times 5^{\color{#f59f0a}y}" size={80} />
        </div>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 165, textAlign: 'center', fontSize: 38, fontWeight: 800, color: C.muted, ...fadeUp(f, cue(scene, 6, 0.1)) }}>
          other primes don't help
        </div>
      </Card>
    </>
  );
};

/** Exponent scene shared by the twos and the fives. */
const makeExp = (opts: {
  prime: number;
  v: string; // the letter
  sqTex: string;
  cuTex: string;
  sqOn: number[];
  cuOn: number[];
  best: number;
  final?: boolean;
}): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const { prime, v, sqTex, cuTex, sqOn, cuOn, best, final } = opts;
  const col = PRIME[prime];
  const hl = (e: string) => `{\\color{${col}}${e}}`;
  const e20 = prime === 2 ? `2^${hl('{x+2}')} \\times 5^{y+1}` : `2^{x+2} \\times 5^${hl('{y+1}')}`;
  const e50 = prime === 2 ? `2^${hl('{x+1}')} \\times 5^{y+2}` : `2^{x+1} \\times 5^${hl('{y+2}')}`;
  const SX = 760;
  const bestAt = final ? cue(scene, 3, 0.02) : cue(scene, 3, 0.1);
  const stripsOut = final ? fadeTo(f, cue(scene, 3, 0.4), 0) : 1;
  return (
    <>
      <Pill x={120} y={140} color={col} style={fadeUp(f, cue(scene, 0, 0.1))}>
        {prime === 2 ? 'The twos' : 'The fives'}
      </Pill>
      <Eq x={560} y={140} start={cue(scene, 0, 0.0)} size={52} color={C.muted} tex="n = 2^x \times 5^y" />
      <Eq x={120} y={240} start={cue(scene, 0, 0.25)} size={56} tex={`20n = ${e20}`} />
      <Eq x={1000} y={240} start={cue(scene, 0, 0.6)} size={56} tex={`50n = ${e50}`} />

      <div style={{ opacity: stripsOut }}>
        <div style={{ position: 'absolute', left: 120, top: 380, whiteSpace: 'nowrap', ...fadeUp(f, cue(scene, 1, 0.05)) }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: SQ }}>square:</div>
          <Tex tex={sqTex} size={48} />
        </div>
        <Strip x={SX} y={395} on={sqOn} color={SQ} start={cue(scene, 1, 0.5)} hi={best} hiAt={bestAt} />
        <div style={{ position: 'absolute', left: 120, top: 540, whiteSpace: 'nowrap', ...fadeUp(f, cue(scene, 2, 0.05)) }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: CU }}>cube:</div>
          <Tex tex={cuTex} size={48} />
        </div>
        <Strip x={SX} y={555} on={cuOn} color={CU} start={cue(scene, 2, 0.55)} hi={best} hiAt={bestAt} />
        <Stage>
          <rect x={SX + best * 106 - 12} y={380} width={96 + 24} height={276} rx={26} fill="none" stroke={C.green} strokeWidth={6} opacity={ease(f, bestAt, 12)} />
        </Stage>
      </div>
      {!final && (
        <Eq x={SX + best * 106 - 60} y={690} start={cue(scene, 3, 0.3)} size={72} color={C.green} tex={`${v} = ${best}`} />
      )}
      {final && (
        <>
          <Eq x={SX + best * 106 - 60} y={690} start={cue(scene, 3, 0.05)} size={72} color={C.green} tex={`${v} = ${best}`} opacity={stripsOut} />
          <Card x={120} y={380} w={1720} h={230} style={fadeUp(f, cue(scene, 3, 0.45))}>
            <div style={{ position: 'absolute', left: 50, top: 70 }}>
              <Tex tex="n = 2^2 \times 5^1 = 2 \times 2 \times 5 = 20" size={80} color={C.green} />
            </div>
          </Card>
          <Card x={120} y={640} w={830} h={130} style={{ ...fadeUp(f, cue(scene, 4, 0.3)), display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '0 36px', fontSize: 44, fontWeight: 800 }}>
              <span style={{ color: C.primary }}>List:</span> quick for small answers
            </div>
          </Card>
          <Card x={1010} y={640} w={830} h={130} style={{ ...fadeUp(f, cue(scene, 4, 0.6)), display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '0 36px', fontSize: 44, fontWeight: 800 }}>
              <span style={{ color: C.violet }}>Count primes:</span> always works
            </div>
          </Card>
        </>
      )}
    </>
  );
};

/** The "same answer" moment in the fives scene: a check that appears with line 3. */
const FivesDone: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ opacity: ease(f, cue(scene, 3, 0.85), 10) * fadeTo(f, cue(scene, 4)) }}>
      <Check x={1240} y={640} start={cue(scene, 3, 0.85)}>
        Same answer!
      </Check>
    </div>
  );
};

const Twos = makeExp({ prime: 2, v: 'x', sqTex: 'x + 2 \\text{ is even}', cuTex: 'x + 1 \\text{ is a multiple of } 3', sqOn: [0, 2, 4, 6, 8], cuOn: [2, 5, 8], best: 2 });
const FivesBase = makeExp({ prime: 5, v: 'y', sqTex: 'y + 1 \\text{ is even}', cuTex: 'y + 2 \\text{ is a multiple of } 3', sqOn: [1, 3, 5, 7, 9], cuOn: [1, 4, 7], best: 1, final: true });
const Fives: SceneComponent = (p) => (
  <>
    <FivesBase {...p} />
    <FivesDone {...p} />
  </>
);

// ---- traps ----

type TrapCard = { v: string; r20: string; r50: string; ok20: boolean; ok50: boolean; note: string };
const TRAPS: TrapCard[] = [
  { v: '10', r20: '200', r50: '500', ok20: false, ok50: false, note: 'fails both' },
  { v: '20', r20: '400', r50: '1000', ok20: true, ok50: true, note: 'both ✓' },
  { v: '40', r20: '800', r50: '2000', ok20: false, ok50: false, note: 'fails both' },
  { v: '50', r20: '1000', r50: '2500', ok20: false, ok50: false, note: 'jobs swapped!' },
  { v: '100', r20: '2000', r50: '5000', ok20: false, ok50: false, note: '20 and 50 divide it' },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // when each card's first and second row appear
  const rows: [number, number][] = [
    [cue(scene, 4, 0.3), cue(scene, 4, 0.4)],
    [cue(scene, 5, 0.85), cue(scene, 5, 0.85)],
    [cue(scene, 5, 0.3), cue(scene, 5, 0.4)],
    [cue(scene, 1, 0.3), cue(scene, 2, 0.2)],
    [cue(scene, 3, 0.65), cue(scene, 3, 0.65)],
  ];
  const noteAt = [cue(scene, 4, 0.65), cue(scene, 5, 0.95), cue(scene, 5, 0.65), cue(scene, 2, 0.7), cue(scene, 3, 0.45)];
  const focus = [cue(scene, 4), cue(scene, 5, 0.8), cue(scene, 5), cue(scene, 0, 0.4), cue(scene, 3)];
  return (
    <>
      <div style={{ position: 'absolute', left: 52, top: 150, display: 'flex', gap: 14 }}>
        {TRAPS.map((c, i) => {
          const shown = f >= rows[i][0];
          const right = i === 1;
          const border = !shown ? (f >= focus[i] ? C.primary : 'transparent') : right ? C.green : C.red;
          const row = (lab: string, val: string, ok: boolean, start: number, kind: string) => (
            <div style={{ ...fadeUp(f, start, 10), display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, whiteSpace: 'nowrap' }}>
              <Tex tex={`{\\color{${kind === 'sq' ? SQ : CU}}${lab}} = ${val}`} size={48} color={ok ? C.green : C.red} />
              <span style={{ fontSize: 36, fontWeight: 900, color: ok ? C.green : C.red }}>{ok ? '✓' : '✗'}</span>
            </div>
          );
          return (
            <div key={c.v} style={{ width: 352, ...fadeUp(f, 6 + i * 5, 12) }}>
              <div style={{ height: 400, background: C.card, borderRadius: 28, border: `6px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, marginTop: 18 }}>{'ABCDE'[i]}</div>
                <div style={{ height: 120, display: 'flex', alignItems: 'center' }}>
                  <Tex tex={c.v} size={72} color={shown ? (right ? C.green : C.red) : C.ink} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {row('20n', c.r20, c.ok20, rows[i][0], 'sq')}
                  {row('50n', c.r50, c.ok50, rows[i][1], 'cube')}
                </div>
                {shown && (
                  <div style={{ position: 'absolute', top: -26, right: -26, width: 64, height: 64, borderRadius: '50%', background: right ? C.green : C.red, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {right ? '✓' : '✗'}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 18, fontSize: 36, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, color: right ? C.green : C.ink, ...fadeUp(f, noteAt[i]) }}>
                {c.note}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 200, top: 700, width: 1520, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, background: C.primary, color: '#fff', borderRadius: 28, padding: '18px 40px', fontSize: 44, fontWeight: 900, whiteSpace: 'nowrap', ...fadeUp(f, cue(scene, 6, 0.1)) }}>
        <span>n = 5:</span>
        <Tex tex="100" size={52} />
        <span>square ✓</span>
        <Tex tex="250" size={52} />
        <span>cube ✗</span>
        <span style={{ marginLeft: 20 }}>Check BOTH rules!</span>
      </div>
    </>
  );
};

// ---- variant ----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={fadeUp(f, cue(scene, 0, 0.2))}>Your turn!</Pill>
      <div style={{ position: 'absolute', left: 120, top: 290, width: 1600, fontSize: 64, fontWeight: 800, lineHeight: 1.5 }}>
        <span style={fadeUp(f, cue(scene, 0, 0.4))}>
          Find the smallest positive integer <Tex tex="n" size={68} />
        </span>
        <div style={fadeUp(f, cue(scene, 1, 0.05))}>
          such that <span style={{ color: SQ }}><Tex tex="2n" size={68} /> is a perfect square</span>
        </div>
        <div style={fadeUp(f, cue(scene, 1, 0.5))}>
          and <span style={{ color: CU }}><Tex tex="3n" size={68} /> is a perfect cube</span>.
        </div>
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const stripsOut = fadeTo(f, cue(scene, 4));
  const cw = 64;
  const strip = (x: number, y: number, on: number[], color: string, start: number, best: number) => (
    <Strip x={x} y={y} on={on} color={color} start={start} cw={cw} h={70} hi={best} hiAt={start + 40} opacity={ease(f, start - 6, 10)} />
  );
  return (
    <>
      <Eq x={120} y={150} start={cue(scene, 0, 0.1)} size={60} tex="n = 2^{\color{#3c83f6}x} \times 3^{\color{#7b61ff}y}" />
      <Eq x={720} y={156} start={cue(scene, 0, 0.5)} size={52} color={C.muted} tex="2n = 2^{x+1} \times 3^{y}" />
      <Eq x={1300} y={156} start={cue(scene, 0, 0.7)} size={52} color={C.muted} tex="3n = 2^{x} \times 3^{y+1}" />
      <div style={{ opacity: stripsOut }}>
        {/* twos */}
        <div style={{ position: 'absolute', left: 120, top: 270, fontSize: 44, fontWeight: 900, color: C.blue, ...fadeUp(f, cue(scene, 1, 0.02)) }}>Twos</div>
        <Eq x={120} y={330} start={cue(scene, 1, 0.1)} size={48} tex="x + 1 \text{ even}" color={SQ} />
        {strip(120, 400, [1, 3, 5, 7, 9], SQ, cue(scene, 1, 0.15), 3)}
        <Eq x={120} y={490} start={cue(scene, 1, 0.45)} size={48} tex="x \text{ a multiple of } 3" color={CU} />
        {strip(120, 560, [0, 3, 6, 9], CU, cue(scene, 1, 0.5), 3)}
        <Eq x={120} y={636} start={cue(scene, 1, 0.85)} size={56} tex="x = 3" color={C.green} />
        {/* threes */}
        <div style={{ position: 'absolute', left: 1000, top: 270, fontSize: 44, fontWeight: 900, color: C.violet, ...fadeUp(f, cue(scene, 2, 0.02)) }}>Threes</div>
        <Eq x={1000} y={330} start={cue(scene, 2, 0.1)} size={48} tex="y \text{ even}" color={SQ} />
        {strip(1000, 400, [0, 2, 4, 6, 8], SQ, cue(scene, 2, 0.15), 2)}
        <Eq x={1000} y={490} start={cue(scene, 2, 0.4)} size={48} tex="y + 1 \text{ a multiple of } 3" color={CU} />
        {strip(1000, 560, [2, 5, 8], CU, cue(scene, 2, 0.5), 2)}
        <Eq x={1000} y={636} start={cue(scene, 2, 0.85)} size={56} tex="y = 2" color={C.green} />
      </div>
      <Eq x={120} y={722} start={cue(scene, 3, 0.1)} size={64} tex="n = 2^3 \times 3^2 = 8 \times 9" color={C.green} />
      {/* "= 72" lands on the spoken "seventy-two" at the end of the line */}
      <Eq x={120} y={722} start={cue(scene, 3, 0.85)} size={64} tex="\phantom{n = 2^3 \times 3^2 = 8 \times 9} = 72" color={C.green} />
      <Eq x={120} y={330} start={cue(scene, 4, 0.2)} size={60} tex="2 \times 72 = 144 = 12 \times 12 \;\checkmark" />
      <Eq x={120} y={470} start={cue(scene, 5, 0.2)} size={60} tex="3 \times 72 = 216 = 6 \times 6 \times 6 \;\checkmark" />
      <Answer x={1600} y={540} value="72" chime={CHIME} start={cue(scene, 6, 0.95)} />
      <Confetti x={1600} y={540} start={cue(scene, 6, 0.95)} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, cue(scene, 3));
  return (
    <>
      <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 650, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 50, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>The big idea</div>
        <div style={{ position: 'absolute', left: 70, top: 120, width: 1460, fontSize: 60, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, cue(scene, 1, 0.1)) }}>
          Break the number into primes. Count the copies of each prime.
        </div>
        <div style={{ position: 'absolute', left: 70, top: 330, fontSize: 52, fontWeight: 900, color: SQ, ...fadeUp(f, cue(scene, 2, 0.05)) }}>Square: every count even</div>
        <div style={{ position: 'absolute', left: 70, top: 480, fontSize: 52, fontWeight: 900, color: CU, ...fadeUp(f, cue(scene, 2, 0.5)) }}>Cube: every count a multiple of 3</div>
      </div>
      <Stage>
        <g opacity={cardOut}>
          <Balls ps={[2, 2, 2, 2, 5, 5]} x={1230} y={512} r={28} gap={66} start={cue(scene, 2, 0.1)} stagger={2} group={2} groupAt={cue(scene, 2, 0.3)} />
          <Balls ps={[2, 2, 2, 5, 5, 5]} x={1230} y={662} r={28} gap={66} start={cue(scene, 2, 0.55)} stagger={2} group={3} groupAt={cue(scene, 2, 0.75)} />
        </g>
      </Stage>
      <SignOff start={cue(scene, 3, 0.1)} />
      <Confetti x={960} y={380} start={cue(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(
    10,
    <>
      Smallest positive integer <Tex tex="n" size={60} /> with <Tex tex="20n" size={60} color={SQ} /> a perfect square and <Tex tex="50n" size={60} color={CU} /> a perfect cube?
    </>,
  ),
  list: List,
  primes: Primes,
  twos: Twos,
  fives: Fives,
  traps: Traps,
  variant: Variant,
  try2: makePause(
    10,
    <>
      Smallest positive integer <Tex tex="n" size={60} /> with <Tex tex="2n" size={60} color={SQ} /> a perfect square and <Tex tex="3n" size={60} color={CU} /> a perfect cube?
    </>,
  ),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

// YouTube thumbnail (`2026-10-30-square-and-cube-thumb`, render.sh -> poster.jpg): the trap + 20n square and 50n cube, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 8 Practice" lines={['Think it\u2019s', <span style={{ color: C.red }}>50?</span>]}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'stretch' }}>
      <div style={{ background: C.card, borderRadius: 36, padding: '20px 36px', border: `7px solid ${C.violet}`, textAlign: 'center' }}>
        <Tex tex={'20\\cdot n'} size={100} />
        <div style={{ fontSize: 56, fontWeight: 900, color: C.violet }}>perfect SQUARE</div>
      </div>
      <div style={{ background: C.card, borderRadius: 36, padding: '20px 36px', border: `7px solid ${C.amber}`, textAlign: 'center' }}>
        <Tex tex={'50\\cdot n'} size={100} />
        <div style={{ fontSize: 56, fontWeight: 900, color: C.amber }}>perfect CUBE</div>
      </div>
    </div>
  </ThumbFrame>
);

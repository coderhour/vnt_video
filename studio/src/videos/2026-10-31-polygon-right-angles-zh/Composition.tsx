import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import {
  CornerMark, Outline, PartialShape, SQUARE, SvgText, TurnCircle, Walker, corner, flashP, passP, poly11, poly5, walkU,
  type P, type Wedge,
} from './geom';

export const SLUG = '2026-10-31-polygon-right-angles-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const AMBER = '#f59f0a';
export const G1 = '#0cc281';
export const G2 = '#0a9d68';
export const GD = '#0a9d68'; // green for text
const VD = C.violet;

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

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
const z = (t: string, c?: string): Part => ({ z: t, c });

// ---------- small helpers ----------

const Eq: React.FC<{ x?: number; y: number; start: number; tex: Part[] | string; size?: number; color?: string }> = ({ x = 1180, y, start, tex, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

/** 0→1 at frame a, back to 0 at frame b. */
const win = (f: number, a: number, b: number) => ease(f, a, 8) * (1 - ease(f, b, 8));

const Card: React.FC<{ x: number; y: number; w: number; start: number; color?: string; children: React.ReactNode; size?: number }> = ({ x, y, w, start, color = C.red, children, size = 44 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 30px', fontSize: size, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

// ---------- shared geometry ----------

const S11 = 104;
const PART_I = poly11(96, [560, 770]); // intro partial shape
const PART_Q = poly11(96, [1560, 770]); // question partial shape
const PART_P = poly11(84, [1120, 770]); // pause partial shape
const R11 = poly11(S11, [400, 800]); // the real 11-gon, count scene only
const CC: P = [900, 470]; // count-scene turn circle
const CR = 190;
const SQ = SQUARE(250, [190, 700]);
const PENT = poly5(170, [330, 640]);
const WC: P = [900, 470]; // walk-scene turn circle
const WR = 160;
const TURNS5 = [100, 70, 50, 80, 60];

const QTEXT = '一个凸多边形恰好有两个内角是90°，其他每个内角都是160°。这个多边形有几条边？';
const QTEXT2 = '一个凸多边形恰好有三个角是120°，其他每个角都是150°。这个多边形有几条边？';

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end1 = at(scene, 1);
  const u = walkU(f, at(scene, 1, 0.08), at(scene, 1, 0.88), 0, 6);
  const wop = ease(f, at(scene, 1, 0.02), 8) * (1 - ease(f, at(scene, 2), 10));
  return (
    <>
      <Stage>
        <PartialShape poly={PART_I} progress={ease(f, 4, 50)} marks={ease(f, at(scene, 0, 0.25), 10)} labels={ease(f, at(scene, 0, 0.45), 10)} unknown={ease(f, 30, 20)} />
        <Walker poly={PART_I} u0={0} u={u} op={wop} />
      </Stage>
      <Text x={1000} y={260} w={860} size={100} weight={900} style={{ ...fadeUp(f, at(scene, 0, 0.72)), lineHeight: 1.1 }}>
        有几条<span style={{ color: C.primary }}>边</span>？
      </Text>
      <div style={{ position: 'absolute', left: 1000, top: 520, ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
      <div style={{ position: 'absolute', left: 1000, top: end1 > 0 ? 170 : 170, fontSize: 48, fontWeight: 800, color: C.muted, opacity: ease(f, at(scene, 0, 0.1), 10) }}>AMC 8 风格题</div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Stage>
        <PartialShape poly={PART_Q} progress={ease(f, 4, 40)} marks={ease(f, at(scene, 1, 0.4), 10)} labels={ease(f, at(scene, 1, 0.6), 10)} unknown={ease(f, 30, 20)} />
      </Stage>
      <div style={{ position: 'absolute', left: 100, top: 140, width: 960, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>一个凸多边形恰好有两个内角是90°，</span>
        <span style={s(2)}>
          其他每个内角都是160°。这个多边形有几条<Mark on={at(scene, 2, 0.8)}>边</Mark>？
        </span>
      </div>
      <Choices x={100} y={650} start={(i) => at(scene, 3, 0.15 + i * 0.12)} items={['9', '10', '11', '12', '20'].map((c) => <Tex key={c} tex={c} size={56} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cvx = poly5(110, [190, 450]);
  const dent: P[] = [[560, 450], [690, 190], [820, 450], [690, 350]];
  const dentD = `M ${dent.map((p) => p.join(' ')).join(' L ')} Z`;
  const pc = ease(f, at(scene, 0, 0.12), 20);
  const pd = ease(f, at(scene, 0, 0.55), 20);
  const xo = ease(f, at(scene, 0, 0.8), 8);
  return (
    <>
      <Stage>
        <Outline poly={cvx} progress={pc} fill={C.primarySoft} color={C.ink} />
        {cvx.pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={13 * ease(f, at(scene, 0, 0.35) + i * 3, 6)} fill={G1} />)}
        <g opacity={pd}>
          <path d={dentD} fill="rgba(239,67,67,0.12)" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
          <circle cx={dent[3][0]} cy={dent[3][1]} r={13} fill={C.red} />
        </g>
        {xo > 0 && (
          <g opacity={xo} stroke={C.red} strokeWidth={14} strokeLinecap="round">
            <line x1={640} y1={250} x2={740} y2={400} />
            <line x1={740} y1={250} x2={640} y2={400} />
          </g>
        )}
        <g opacity={ease(f, at(scene, 0, 0.3), 8)} stroke={G1} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 120 220 L 160 262 L 240 170" opacity={0} />
        </g>
      </Stage>
      <Text x={110} y={500} w={460} size={50} weight={900} color={GD} style={fadeUp(f, at(scene, 0, 0.35))}>凸：没有凹陷</Text>
      <Text x={560} y={500} w={400} size={50} weight={900} color={C.red} style={fadeUp(f, at(scene, 0, 0.8))}>凹进去了</Text>
      <Pill x={1060} y={150} color={VD} style={{ ...fadeUp(f, at(scene, 1, 0.1)), fontSize: 52 }}>2个角：90°</Pill>
      <Pill x={1060} y={270} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.45)), fontSize: 52 }}>其他所有角：160°</Pill>
      <Text x={1060} y={470} w={800} size={72} weight={900} style={fadeUp(f, at(scene, 2, 0.35))}>
        边数 = 角数 = <span style={{ color: C.primary }}>?</span>
      </Text>
    </>
  );
};

const makePause = (seconds: number, text: string, shape: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      {shape && (
        <Stage>
          <PartialShape poly={PART_P} marks={1} labels={1} fs={48} />
        </Stage>
      )}
      <div style={{ position: 'absolute', left: 80, top: 140, width: shape ? 700 : 1100, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{text}</div>
      <Countdown scene={scene} seconds={seconds} x={1640} y={500} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

const Walk: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // square
  const sqOp = (1 - ease(f, at(scene, 2, 0.05), 12));
  const sqU = walkU(f, at(scene, 1, 0.1), at(scene, 1, 0.74), 0, 4.9);
  const sqK = Math.floor(sqU + 1e-9);
  const sqCircle = ease(f, at(scene, 1, 0.02), 10) * (1 - ease(f, at(scene, 2, 0.3), 10));
  const sqW: Wedge[] = range(4).map((j) => ({ a: 90, color: j % 2 ? G2 : G1, p: passP(sqU, j + 1), label: '90°' }));
  const sqRow = ['', '90', '90 + 90', '90 + 90 + 90', '90 + 90 + 90 + 90'][sqK];
  // pentagon
  const pnOp = ease(f, at(scene, 2, 0.3), 14);
  const pnU = walkU(f, at(scene, 4, 0.06), at(scene, 4, 0.74), 0, 5.9);
  const pnK = Math.floor(pnU + 1e-9);
  const pnCircle = ease(f, at(scene, 3), 10) * (1 - ease(f, at(scene, 5, 0.05), 10));
  const pnW: Wedge[] = TURNS5.map((a, j) => ({ a, color: j % 2 ? G2 : G1, p: passP(pnU, j + 1), label: `${a}°` }));
  const pnRow = TURNS5.slice(0, pnK).join(' + ');
  const sum360 = ease(f, at(scene, 4, 0.88), 8);
  // the straight-line corner (turn 70, inside 110)
  const cd = corner(PENT, 2);
  const demo = ease(f, at(scene, 5, 0.02), 10);
  const sqSum = ease(f, at(scene, 1, 0.88), 8);
  return (
    <>
      <Stage>
        {/* square */}
        <g opacity={sqOp}>
          <Outline poly={SQ} progress={ease(f, 2, at(scene, 0, 0.6))} fill={C.violetSoft} />
          <Walker poly={SQ} u0={0} u={Math.min(sqU, 4.3)} op={ease(f, at(scene, 0, 0.55), 8)} />
          {range(4).map((j) => {
            const c = corner(SQ, j + 1);
            return <CornerMark key={j} at={c.at} din={c.din} dout={c.dout} r={60} turnOp={flashP(sqU, j + 1)} turnLabel="90°" labelGap={60} />;
          })}
        </g>
        <TurnCircle c={WC} R={WR} wedges={sqW} op={sqCircle} />
        {/* pentagon */}
        <g opacity={pnOp}>
          <Outline poly={PENT} progress={1} fill={C.violetSoft} />
          <Walker poly={PENT} u0={0} u={Math.min(pnU, 5.3)} op={ease(f, at(scene, 4, 0.02), 8) * (1 - ease(f, at(scene, 5, 0.02), 10))} />
          {range(5).map((j) => {
            const c = corner(PENT, j + 1);
            return <CornerMark key={j} at={c.at} din={c.din} dout={c.dout} r={56} turnOp={flashP(pnU, j + 1)} turnLabel={`${TURNS5[j]}°`} labelGap={62} />;
          })}
          <CornerMark at={cd.at} din={cd.din} dout={cd.dout} r={86} extOp={demo} inOp={demo} turnOp={demo} inLabel="110°" turnLabel="70°" labelGap={78} />
        </g>
        <TurnCircle c={WC} R={WR} wedges={pnW} op={pnCircle} />
      </Stage>
      <Text x={WC[0]} y={WC[1] + WR + 20} w={400} align="center" size={72} weight={900} color={GD} style={{ opacity: Math.max(sqSum * sqCircle, sum360 * pnCircle) }}>360°</Text>
      <Pill x={1100} y={150} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.55)), fontSize: 48, opacity: ease(f, at(scene, 0, 0.55), 12) * (1 - ease(f, at(scene, 2, 0.2), 10)) }}>走一圈，把转角加起来</Pill>
      {sqK >= 1 && sqOp > 0 && (
        <div style={{ position: 'absolute', left: 1110, top: 330, opacity: sqOp * ease(f, at(scene, 1, 0.1), 8), whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: GD, marginBottom: 6 }}>你转的角度</div>
          <Tex tex={`${sqRow}${sqSum > 0.5 ? ' = 360' : ''}`} size={50} />
        </div>
      )}
      <Eq x={1110} y={250} start={at(scene, 5, 0.6)} size={56} tex={[z('内角', VD), '+', z('转角', GD), '= 180']} />
      <Eq x={1110} y={380} start={at(scene, 5, 0.75)} size={64} tex={`${col(VD, '110')} + ${col(GD, '70')} = 180`} />
      <Text x={1110} y={500} w={620} size={48} weight={800} color={C.muted} style={fadeUp(f, at(scene, 5, 0.3))}>在同一条直线上</Text>
    </>
  );
};

const WIN = 20;

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const u = walkU(f, at(scene, 4, 0.06), at(scene, 4, 0.86), 2, 11.9);
  const k = Math.max(0, Math.min(9, Math.floor(u + 1e-9) - 2));
  const c1 = corner(R11, 1);
  const c2 = corner(R11, 2);
  const c6 = corner(R11, 6);
  const w0 = win(f, at(scene, 0, 0.05), at(scene, 1));
  const w1 = win(f, at(scene, 1, 0.05), at(scene, 2));
  const w2 = win(f, at(scene, 2, 0.05), at(scene, 3, 0.6));
  const wedges: Wedge[] = [
    { a: 90, color: AMBER, p: ease(f, at(scene, 2, 0.12), 10), label: '90°' },
    { a: 90, color: AMBER, p: ease(f, at(scene, 2, 0.5), 10), label: '90°' },
    ...range(9).map((j): Wedge => ({ a: 20, color: j % 2 ? G2 : G1, p: passP(u, 3 + j, 0.25) })),
  ];
  const walkerOp = ease(f, at(scene, 4, 0.02), 8) * (1 - ease(f, at(scene, 5, 0.1), 10));
  const done = at(scene, 6, 0.8);
  const divRow = f < at(scene, 4, 0.88) ? '180 \\div 20 = \\,?' : `180 \\div 20 = ${col(GD, '9')}`;
  return (
    <>
      <Stage>
        <Outline poly={R11} progress={ease(f, 2, 24)} fill={C.violetSoft} />
        <CornerMark at={c1.at} din={c1.din} dout={c1.dout} r={56} extOp={w0} inOp={w0} turnOp={w0} inLabel="90°" turnLabel="90°" labelGap={52} />
        <CornerMark at={c6.at} din={c6.din} dout={c6.dout} r={56} turnR={112} turnGap={56} extLen={200} extOp={w1} inOp={w1} turnOp={w1} inLabel="160°" turnLabel="20°" labelGap={58} />
        <CornerMark at={c1.at} din={c1.din} dout={c1.dout} r={56} turnOp={w2} />
        <CornerMark at={c2.at} din={c2.din} dout={c2.dout} r={56} turnOp={w2 * ease(f, at(scene, 2, 0.4), 8)} />
        {range(9).map((j) => {
          const c = corner(R11, 3 + j);
          return <CornerMark key={j} at={c.at} din={c.din} dout={c.dout} r={46} turnOp={flashP(u, 3 + j)} />;
        })}
        <Walker poly={R11} u0={2} u={Math.min(u, 11.3)} op={walkerOp} />
        {R11.pts.map((p, i) => {
          const s = ease(f, at(scene, 5, 0.04 + i * 0.07), 6);
          return s > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={15 * s} fill={i === 1 || i === 2 ? AMBER : G1} stroke="#fff" strokeWidth={4} /> : null;
        })}
        <TurnCircle c={CC} R={CR} wedges={wedges} ghost={{ a1: 180, a2: 360, op: ease(f, at(scene, 3, 0.05), 10) * (1 - ease(f, at(scene, 4, 0.1), 8)), label: '180°' }} />
      </Stage>
      <Text x={CC[0]} y={190} w={500} size={48} weight={800} color={C.muted} align="center" style={fadeUp(f, at(scene, 2, 0.05))}>所有转角</Text>
      {k > 0 && (
        <Text x={CC[0]} y={CC[1] + CR + 28} w={400} size={84} weight={900} color={GD} align="center">
          ×{k}
        </Text>
      )}
      <Eq y={140} start={at(scene, 0, 0.3)} tex={'180 - 90 = 90'} />
      <Eq y={230} start={at(scene, 1, 0.3)} tex={'180 - 160 = 20'} />
      <Eq y={320} start={at(scene, 2, 0.5)} tex={'90 + 90 = 180'} />
      <Eq y={410} start={at(scene, 3, 0.2)} tex={'360 - 180 = 180'} />
      <Eq y={500} start={at(scene, 4, 0.45)} tex={divRow} />
      <Eq y={590} start={at(scene, 5, 0.5)} tex={`${col(GD, '9')} + ${col(AMBER, '2')} = 11`} />
      <Answer x={1710} y={720} value="11" start={done} chime={CHIME} />
      <Confetti x={1710} y={720} start={done} seed={7} />
      <Pill x={1180} y={705} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 48 }}>选项C</Pill>
      {WIN > 0 && null}
    </>
  );
};

const Inside: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P5 = poly5(180, [270, 520]);
  const v = P5.pts;
  const tri = (a: P, b: P, c: P) => `M ${a.join(' ')} L ${b.join(' ')} L ${c.join(' ')} Z`;
  const tcol = ['rgba(60,131,246,0.30)', 'rgba(245,159,10,0.32)', 'rgba(123,97,255,0.28)'];
  const tstart = [at(scene, 1, 0.35), at(scene, 1, 0.55), at(scene, 1, 0.75)];
  const tris: [P, P, P][] = [[v[0], v[1], v[2]], [v[0], v[2], v[3]], [v[0], v[3], v[4]]];
  const rowsOut = 1 - ease(f, at(scene, 8), 10);
  return (
    <>
      <Stage>
        <Outline poly={P5} progress={ease(f, 2, 22)} fill="rgba(0,0,0,0)" />
        {tris.map((t, i) => {
          const p = ease(f, tstart[i], 10);
          return p > 0 ? <path key={i} d={tri(...t)} fill={tcol[i]} stroke={C.ink} strokeWidth={5} opacity={p} strokeLinejoin="round" /> : null;
        })}
      </Stage>
      <Eq x={90} y={570} start={at(scene, 1, 0.45)} size={50} tex={['n', z('边形'), '\\to (n-2)', z('个三角形')]} />
      <Text x={90} y={650} w={700} size={48} weight={700} color={C.muted} style={fadeUp(f, at(scene, 1, 0.85))}>这里：5条边，3个三角形</Text>
      <div style={{ opacity: rowsOut, position: 'absolute', inset: 0 }}>
        <Eq x={860} y={120} start={at(scene, 2, 0.35)} size={52} tex={[z('内角和'), '= (n-2)\\times 180']} />
        <Eq x={860} y={205} start={at(scene, 3, 0.4)} size={52} tex={[z('我们的'), '= 2\\times 90 + (n-2)\\times 160']} />
        <Eq x={860} y={315} start={at(scene, 4, 0.45)} size={48} tex={'(n-2)\\times 180 = 180 + (n-2)\\times 160'} />
        <Eq x={860} y={385} start={at(scene, 4, 0.8)} size={48} color={C.muted} tex={'2 \\times 90 = 180'} />
        <Eq x={860} y={480} start={at(scene, 5, 0.1)} size={48} tex={'(n-2)\\times 180 - (n-2)\\times 160 = 180'} />
        <Eq x={860} y={550} start={at(scene, 5, 0.4)} size={48} color={C.muted} tex={'180 - 160 = 20'} />
        <Eq x={860} y={630} start={at(scene, 5, 0.75)} size={56} tex={f < at(scene, 6, 0.3) ? '(n-2)\\times 20' : '(n-2)\\times 20 = 180'} />
        <Eq x={860} y={715} start={at(scene, 7, 0.37)} size={60} tex={'n - 2 = 9'} />
        <Eq x={1230} y={715} start={at(scene, 7, 0.68)} size={60} tex={`n = ${col(C.green, '11')}`} />
        <Check x={1530} y={725} start={at(scene, 7, 0.88)}>答案一样！</Check>
      </div>
      <Card x={860} y={180} w={1000} start={at(scene, 8, 0.3)} color={VD} size={48}>内角和：喜欢列方程的时候</Card>
      <Card x={860} y={330} w={1000} start={at(scene, 8, 0.65)} color={C.primary} size={48}>走一圈：很多角都一样大的时候</Card>
    </>
  );
};

export const CHIPS = ['9', '10', '11', '12', '20'];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const wrongAt = [at(scene, 1, 0.1), at(scene, 4, 0.25), -1, at(scene, 4, 0.55), at(scene, 2, 0.1)];
  const aOp = win(f, at(scene, 1), at(scene, 2));
  const eOp = win(f, at(scene, 2), at(scene, 4, 0.1));
  const cGreen = ease(f, at(scene, 7, 0.1), 10);
  const hab = ease(f, at(scene, 7, 0.3), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 140, display: 'flex', gap: 22 }}>
        {CHIPS.map((c, i) => {
          const wr = wrongAt[i] >= 0 ? ease(f, wrongAt[i], 8) : 0;
          const g = i === 2 ? cGreen : 0;
          const sc = 1 + 0.12 * Math.sin(Math.min(1, Math.max(0, (f - wrongAt[i]) / 24)) * Math.PI) * (wrongAt[i] >= 0 ? 1 : 0);
          return (
            <div key={c} style={{ ...fadeUp(f, at(scene, 0, 0.1 + i * 0.1), 10), transform: `scale(${sc})`, background: g > 0 ? C.green : wr > 0 ? 'rgba(239,67,67,0.14)' : C.card, color: g > 0 ? '#fff' : C.ink, border: `5px solid ${g > 0 ? C.green : wr > 0 ? C.red : 'transparent'}`, borderRadius: 18, padding: '8px 22px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
              <span style={{ color: g > 0 ? '#fff' : C.muted, fontSize: 48, marginRight: 10 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      {/* A: the nine corners, two forgotten */}
      <Fade op={aOp}>
        <Stage>
          {range(9).map((i) => {
            const s = ease(f, at(scene, 1, 0.1 + i * 0.04), 6);
            return <circle key={i} cx={130 + i * 62} cy={380} r={24 * s} fill={G1} />;
          })}
          {[0, 1].map((i) => (
            <circle key={i} cx={130 + (9 + i) * 62 + 20} cy={380} r={24 * ease(f, at(scene, 1, 0.72 + i * 0.05), 6)} fill="none" stroke={AMBER} strokeWidth={7} strokeDasharray="10 8" />
          ))}
        </Stage>
        <Text x={100} y={425} w={540} size={48} weight={900} color={GD} style={fadeUp(f, at(scene, 1, 0.3))}>9个角</Text>
        <Text x={690} y={425} w={400} size={48} weight={900} color={AMBER} style={fadeUp(f, at(scene, 1, 0.76))}>+ 2个被忘了</Text>
      </Fade>
      {/* E: 20 is a turn */}
      <Fade op={eOp}>
        <Stage>
          <TurnCircle c={[280, 560]} R={130} wedges={[{ a: 20, color: G1, p: ease(f, at(scene, 2, 0.15), 10) }]} />
          <SvgText at={[435, 535]} size={56} color={GD} op={ease(f, at(scene, 2, 0.35), 10)} anchor="start">20°</SvgText>
        </Stage>
        <Text x={570} y={470} w={460} size={48} weight={800} style={fadeUp(f, at(scene, 2, 0.45))}>每个160°角上的转角</Text>
        <Pill x={100} y={730} color={C.red} style={{ ...fadeUp(f, at(scene, 3, 0.3)), fontSize: 48 }}>这是角度，不是边数</Pill>
      </Fade>
      {/* B and D: the angle sums */}
      <Card x={100} y={290} w={840} start={at(scene, 5)} size={48}>B：10条边</Card>
      <Eq x={110} y={380} start={at(scene, 5, 0.25)} size={50} tex={[z('应该：'), '(10-2)\\times 180 = 1440']} />
      <Eq x={110} y={465} start={at(scene, 5, 0.75)} size={50} tex={[z('实际：'), '2\\times 90 + 8\\times 160 = 1460']} />
      <Eq x={110} y={550} start={at(scene, 5, 0.95)} size={56} color={C.red} tex={'1440 \\neq 1460'} />
      <Card x={1000} y={290} w={840} start={at(scene, 6)} size={48}>D：12条边</Card>
      <Eq x={1010} y={380} start={at(scene, 6, 0.25)} size={50} tex={[z('应该：'), '(12-2)\\times 180 = 1800']} />
      <Eq x={1010} y={465} start={at(scene, 6, 0.75)} size={50} tex={[z('实际：'), '2\\times 90 + 10\\times 160 = 1780']} />
      <Eq x={1010} y={550} start={at(scene, 6, 0.95)} size={56} color={C.red} tex={'1800 \\neq 1780'} />
      <Pill x={100} y={665} color={C.primary} style={{ opacity: hab, transform: `translateY(${(1 - hab) * 20}px)`, fontSize: 48 }}>想一想转角：加起来总是360°</Pill>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Pill x={100} y={150} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 48 }}>轮到你：新的角</Pill>
      <div style={{ position: 'absolute', left: 100, top: 270, width: 1100, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 50, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>一个凸多边形恰好有三个角是120°，</span>
        <span style={s(1)}>
          其他每个角都是150°。这个多边形有几条<Mark on={at(scene, 1, 0.8)}>边</Mark>？
        </span>
      </div>
      <Pill x={1300} y={300} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.6)), fontSize: 50 }}>3个角：120°</Pill>
      <Pill x={1300} y={420} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.2)), fontSize: 50 }}>其余的角：150°</Pill>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c: P = [430, 470];
  const R = 210;
  const t60 = [at(scene, 0, 0.5), at(scene, 1, 0.15), at(scene, 1, 0.5)];
  const t30 = range(6).map((j) => at(scene, 3, 0.1 + j * 0.115));
  const wedges: Wedge[] = [
    ...t60.map((t): Wedge => ({ a: 60, color: AMBER, p: ease(f, t, 10), label: '60°' })),
    ...t30.map((t, j): Wedge => ({ a: 30, color: j % 2 ? G2 : G1, p: ease(f, t, 8) })),
  ];
  const k60 = t60.filter((t) => f >= t).length;
  const k30 = t30.filter((t) => f >= t).length;
  const counter = f >= at(scene, 2) ? k30 : k60;
  const shown = f >= t60[0] && f < at(scene, 5) && (f < at(scene, 2) || k30 > 0);
  const done = at(scene, 4, 0.85);
  return (
    <>
      <Stage>
        <TurnCircle c={c} R={R} wedges={wedges} ghost={{ a1: 180, a2: 360, op: ease(f, at(scene, 2, 0.1), 10) * (1 - ease(f, at(scene, 3, 0.05), 8)), label: '180°' }} />
      </Stage>
      <Text x={c[0]} y={190} w={500} size={48} weight={800} color={C.muted} align="center" style={fadeUp(f, 6)}>所有转角</Text>
      {shown && counter > 0 && (
        <Text x={c[0]} y={c[1] + R + 24} w={400} size={84} weight={900} color={GD} align="center">
          ×{counter}
        </Text>
      )}
      <Eq x={860} y={100} start={at(scene, 0, 0.3)} tex={`180 - 120 = ${col(AMBER, '60')}`} />
      <Eq x={860} y={170} start={at(scene, 1, 0.3)} tex={'3 \\times 60 = 180'} />
      <Eq x={860} y={240} start={at(scene, 2, 0.3)} tex={'360 - 180 = 180'} />
      <Eq x={860} y={310} start={at(scene, 3, 0.05)} tex={`180 - 150 = ${col(GD, '30')}`} />
      <Eq x={860} y={380} start={at(scene, 3, 0.9)} tex={'180 \\div 30 = 6'} />
      <Eq x={860} y={450} start={at(scene, 4, 0.75)} tex={`${col(GD, '6')} + ${col(AMBER, '3')} = 9`} />
      <Eq x={860} y={540} start={at(scene, 5, 0.6)} size={52} tex={'(9-2)\\times 180 = 1260'} />
      <Eq x={860} y={620} start={at(scene, 6, 0.5)} size={52} tex={'3\\times 120 + 6\\times 150 = 1260'} />
      <Check x={1520} y={545} start={at(scene, 6, 0.88)}>成立！</Check>
      <Answer x={1660} y={290} value="9" start={done} chime={CHIME} />
      <Confetti x={1660} y={290} start={done} seed={11} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P5 = poly5(165, [250, 640]);
  const c: P = [850, 450];
  const R = 160;
  const u = walkU(f, at(scene, 1, 0.12), at(scene, 1, 0.8), 0, 5.9);
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const wedges: Wedge[] = TURNS5.map((a, j) => ({ a, color: j % 2 ? G2 : G1, p: passP(u, j + 1), label: `${a}°` }));
  return (
    <>
      <Fade op={out}>
        <Stage>
          <Outline poly={P5} progress={ease(f, at(scene, 0, 0.3), 24)} fill={C.violetSoft} />
          <Walker poly={P5} u0={0} u={Math.min(u, 5.3)} op={ease(f, at(scene, 1, 0.05), 8)} />
          {range(5).map((j) => {
            const cc = corner(P5, j + 1);
            return <CornerMark key={j} at={cc.at} din={cc.din} dout={cc.dout} r={52} turnOp={flashP(u, j + 1)} />;
          })}
          <TurnCircle c={c} R={R} wedges={wedges} op={ease(f, at(scene, 1, 0.05), 10)} />
        </Stage>
        <Text x={c[0]} y={c[1] + R + 20} w={400} align="center" size={72} weight={900} color={GD} style={{ opacity: ease(f, at(scene, 1, 0.85), 8) }}>360°</Text>
        <Text x={1090} y={140} w={780} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>重要思路</Text>
        <Eq x={1090} y={240} start={at(scene, 1, 0.5)} size={52} tex={[z('转角加起来是'), '360^\\circ']} />
        <Eq x={1090} y={350} start={at(scene, 2, 0.15)} size={52} tex={[z('转角', GD), '= 180 -', z('内角', VD)]} />
        <div style={{ position: 'absolute', left: 1090, top: 450, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...fadeUp(f, at(scene, 2, 0.5)) }}>
          <Z p={['360 -', z('已知的转角')]} size={50} />
          <div style={{ alignSelf: 'stretch', height: 5, background: C.ink, borderRadius: 3, margin: '10px 0' }} />
          <Z p={[z('其他每个角的转角')]} size={50} />
        </div>
        <Eq x={1090} y={640} start={at(scene, 2, 0.8)} size={50} tex={['=', z('其他角的个数')]} />
      </Fade>
      <SignOff start={at(scene, 3, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, QTEXT, true),
  walk: Walk,
  count: Count,
  inside: Inside,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, QTEXT2, false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

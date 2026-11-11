import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-integer-roots-12b';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GR = '\\color{#0cc281}';
const VI = '\\color{#7b61ff}';
const AM = '\\color{#f59f0a}';

// ---------- helpers ----------

/** A maths line at (x, y) that fades up at frame `start`; optionally fades out from frame `out`. */
const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; out?: number; dim?: number }> = ({ x, y, tex, start, size = 54, color = C.ink, out, dim = 0 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const o = (s.opacity as number) * (out === undefined ? 1 : fadeTo(f, out, dim));
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: o }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Box: React.FC<{ x: number; y: number; w: number; h: number; start: number; color?: string; out?: number }> = ({ x, y, w, h, start, color = C.green, out }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 12) * (out === undefined ? 1 : fadeTo(f, out, 0));
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 20, opacity: o }} />;
};

const Fade: React.FC<{ start: number; out?: number; children: React.ReactNode }> = ({ start, out, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const o = (s.opacity as number) * (out === undefined ? 1 : fadeTo(f, out, 0));
  return <div style={{ ...s, opacity: o, position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none' }}>{children}</div>;
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; start?: number }> = ({ x, y, w, h, start = 0 }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 36, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, start, 14) }} />;
};

const QUESTION_TEX = (k: number) => (
  <>
    For how many integers <Tex tex="b" size={56} /> are both roots of <Tex tex={`x^2+bx+${k}b=0`} size={56} /> integers?
  </>
);

export const CH = [8, 15, 16, 30, 32];

// ---------- intro ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X0 = 360;
  const nl = (v: number) => X0 + (v + 5) * 120;
  const t1 = at(scene, 0, 0.1);
  const morph = at(scene, 0, 0.3);
  const dots = at(scene, 0, 0.65);
  const l1 = at(scene, 1);
  return (
    <>
      <Eq x={400} y={150} tex="x^2+bx+12b" start={4} size={84} out={morph} dim={0.35} />
      <Fade start={morph}>
        <Pill x={1180} y={158} color={C.amber} style={{ fontSize: 56 }}>
          {f >= l1 + 4 ? 'b = ?' : 'b = −1'}
        </Pill>
      </Fade>
      <Eq x={400} y={290} tex="x^2-x-12=(x-4)(x+3)" start={morph + 6} size={84} />
      <Stage>
        <line x1={nl(-5.4)} y1={480} x2={nl(5.4)} y2={480} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {range(11).map((i) => (
          <line key={i} x1={nl(i - 5)} y1={468} x2={nl(i - 5)} y2={492} stroke={C.ink} strokeWidth={4} opacity={0.6} />
        ))}
        {[-3, 4].map((v, i) => {
          const s = ease(f, dots + i * 12, 12);
          return <circle key={v} cx={nl(v)} cy={480} r={20 * s} fill={v === 4 ? C.primary : C.violet} />;
        })}
        {[-3, 4].map((v) => (
          <path key={v} d={`M ${nl(v) - 22} ${420} l 16 18 l 30 -34`} stroke={C.green} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(f, l1 + 6, 10)} />
        ))}
      </Stage>
      {[-5, -3, 0, 4, 5].map((v) => (
        <Text key={v} x={nl(v)} y={505} w={120} size={48} weight={800} align="center" color={v === 4 ? C.primary : v === -3 ? C.violet : C.muted} style={fadeUp(f, dots)}>
          {v < 0 ? `−${-v}` : v}
        </Text>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', ...fadeUp(f, at(scene, 2)) }}>
        <div style={{ fontSize: 76, fontWeight: 900 }}>Both roots integers?</div>
        <div style={{ fontFamily: PACIFICO, fontSize: 70, color: C.violet, marginTop: 4 }}>Vantee</div>
      </div>
    </>
  );
};

// ---------- question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={140} y={150} w={1640} h={270} start={at(scene, 0, 0)} />
      <div style={{ position: 'absolute', left: 200, top: 190, width: 1520, fontSize: 56, fontWeight: 700, lineHeight: 1.6, ...fadeUp(f, at(scene, 0, 0.02)) }}>
        <Mark on={at(scene, 0, 0.6)}>{QUESTION_TEX(12)}</Mark>
      </div>
      <Choices x={260} y={540} start={(i) => at(scene, 1, 0.4 + i * 0.12)} items={CH.map((c) => <span key={c}>{c}</span>)} />
    </>
  );
};

// ---------- asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nl = (v: number) => 960 + v * 190;
  return (
    <>
      <Text x={960} y={140} w={1200} size={70} weight={900} align="center" style={fadeUp(f, 4)}>
        An <span style={{ color: C.primary }}>integer</span> is a whole number
      </Text>
      <Stage>
        <line x1={120} y1={370} x2={1800} y2={370} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {range(5).map((i) => (
          <g key={i} opacity={ease(f, 12 + i * 4, 10)}>
            <line x1={nl(i - 2)} y1={356} x2={nl(i - 2)} y2={384} stroke={C.ink} strokeWidth={5} />
            <circle cx={nl(i - 2)} cy={370} r={13} fill={C.primary} />
          </g>
        ))}
        <text x={90} y={382} fontSize={60} fontWeight={900} fill={C.muted} textAnchor="middle">…</text>
        <text x={1830} y={382} fontSize={60} fontWeight={900} fill={C.muted} textAnchor="middle">…</text>
      </Stage>
      {range(5).map((i) => (
        <Text key={i} x={nl(i - 2)} y={400} w={140} size={56} weight={800} align="center" style={fadeUp(f, 16 + i * 4)}>
          {i - 2 < 0 ? `−${2 - i}` : i - 2}
        </Text>
      ))}
      <Pill x={300} y={560} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.5)), fontSize: 50 }}>
        b ✓ integer
      </Pill>
      <Pill x={940} y={560} color={C.violet} style={{ ...fadeUp(f, at(scene, 0, 0.75)), fontSize: 50 }}>
        both roots ✓ integers
      </Pill>
      <Pill x={540} y={700} color={C.amber} style={{ ...fadeUp(f, at(scene, 1, 0.3)), fontSize: 56 }}>
        count values of b
      </Pill>
      <Text x={1130} y={706} w={560} size={48} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 1, 0.3)), textDecoration: 'line-through' }}>
        pairs of roots
      </Text>
    </>
  );
};

// ---------- pause cards ----------

const makePause = (k: number, seconds: number, withChoices: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Card x={80} y={150} w={1000} h={withChoices ? 380 : 440} />
      <div style={{ position: 'absolute', left: 120, top: 180, width: 920, fontSize: 52, fontWeight: 700, lineHeight: 1.6, ...fadeUp(f, 4) }}>{QUESTION_TEX(k)}</div>
      {withChoices && <Choices x={100} y={600} start={() => 6} items={CH.map((c) => <span key={c}>{c}</span>)} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={480} tick={TICK} />
    </>
  );
};

// ---------- sumprod ----------

const SumProd: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = 90;
  const R = 1010;
  return (
    <>
      <Eq x={L} y={150} tex="x^2+bx+12b=(x-r)(x-s)" start={at(scene, 0, 0.3)} out={at(scene, 2)} dim={0.45} />
      <Eq x={L} y={250} tex={`=x^2-\\underbrace{(r+s)}_{\\text{sum}}x+\\underbrace{rs}_{\\text{product}}`} start={at(scene, 1, 0.4)} out={at(scene, 2)} dim={0.45} size={50} />
      <Eq x={L} y={440} tex={`x^2+${GR}b${'\\color{#333333}'}x+${VI}12b`} start={at(scene, 2, 0.15)} />
      <Eq x={L} y={530} tex={`x^2${GR}-(r+s)${'\\color{#333333}'}x+${VI}rs`} start={at(scene, 2, 0.25)} />
      <div style={{ position: 'absolute', left: L + 4, top: 618, fontSize: 48, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 2, 0.4)) }}>
        <span style={{ color: C.primary }}>b = −(r+s)</span> &nbsp; <span style={{ color: C.violet }}>12b = rs</span>
      </div>
      <Eq x={R} y={150} tex="b=-(r+s)=-r-s" start={at(scene, 2, 0.7)} color={C.ink} />
      <Eq x={R} y={250} tex="12b=rs" start={at(scene, 3, 0.5)} />
      <Eq x={R} y={350} tex="rs=12b=12(-r-s)" start={at(scene, 4, 0.5)} size={54} />
      <Eq x={R + 46} y={430} tex="=-12r-12s" start={at(scene, 4, 0.8)} size={54} />
      <Eq x={R} y={560} tex="rs+12r+12s=0" start={at(scene, 5, 0.5)} size={64} />
      <Box x={R - 20} y={540} w={700} h={110} start={at(scene, 5, 0.8)} />
    </>
  );
};

// ---------- trick ----------

const Trick: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const GX = 260;
  const GY = 250;
  const S = 220;
  const cells = [
    { c: 0, r: 0, t: 'rs', col: C.violet },
    { c: 1, r: 0, t: '12s', col: C.primary },
    { c: 0, r: 1, t: '12r', col: C.primary },
    { c: 1, r: 1, t: '144', col: C.amber },
  ];
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const glow = ease(f, at(scene, 3), 12);
  return (
    <>
      <Text x={GX + S / 2} y={175} w={200} size={52} weight={900} align="center" color={C.primary} style={fadeUp(f, 6)}>r</Text>
      <Text x={GX + S * 1.5} y={175} w={200} size={52} weight={900} align="center" color={C.ink} style={fadeUp(f, 8)}>12</Text>
      <Text x={GX - 100} y={GY + S / 2 - 34} w={80} size={52} weight={900} align="center" color={C.violet} style={fadeUp(f, 10)}>s</Text>
      <Text x={GX - 100} y={GY + S * 1.5 - 34} w={80} size={52} weight={900} align="center" style={fadeUp(f, 12)}>12</Text>
      <Stage>
        {cells.map((c, i) => {
          const hot = i === 3 ? ease(f, l2, 10) : 0;
          return (
            <rect key={i} x={GX + c.c * S} y={GY + c.r * S} width={S} height={S} fill={c.col} fillOpacity={0.1 + 0.3 * hot + 0.15 * ease(f, l1, 10)} stroke={C.ink} strokeWidth={5} opacity={ease(f, 4 + i * 3, 12)} />
          );
        })}
        <rect x={GX - 6} y={GY - 6} width={2 * S + 12} height={2 * S + 12} fill="none" stroke={C.green} strokeWidth={10} rx={8} opacity={glow} />
      </Stage>
      {cells.map((c, i) => (
        <Text key={i} x={GX + c.c * S + S / 2} y={GY + c.r * S + S / 2 - 34} w={S} size={56} weight={900} align="center" color={c.col === C.amber ? '#b87400' : c.col} style={{ opacity: ease(f, at(scene, 1, 0.15 + i * 0.2), 10) }}>
          {c.t}
        </Text>
      ))}
      <div style={{ position: 'absolute', left: GX, top: GY + 2 * S + 14, width: 2 * S, textAlign: 'center', ...fadeUp(f, 14) }}>
        <Tex tex="r+12" size={52} />
      </div>
      <div style={{ position: 'absolute', left: GX + 2 * S + 28, top: GY + S - 34, ...fadeUp(f, 16) }}>
        <Tex tex="s+12" size={52} />
      </div>
      <Text x={GX} y={GY + 2 * S + 80} w={2 * S} size={32} weight={700} color={C.muted} align="center" style={fadeUp(f, 18)}>
        (a sketch, not to scale)
      </Text>
      <Eq x={1000} y={170} tex="rs+12r+12s=0" start={0} out={l2} dim={0.4} />
      <Eq x={960} y={290} size={52} tex={`rs+12r+12s+${AM}144${'\\color{#333333}'}=0+${AM}144`} start={l2 + 4} />
      <Eq x={1000} y={450} tex="(r+12)(s+12)=144" start={at(scene, 3, 0.3)} size={64} color={C.green} />
      <Box x={980} y={430} w={820} h={120} start={at(scene, 3, 0.55)} />
    </>
  );
};

// ---------- count ----------

export const POS: [number, number][] = [[1, 144], [2, 72], [3, 48], [4, 36], [6, 24], [8, 18], [9, 16], [12, 12]];
const BPOS = [-121, -50, -27, -16, -6, -2, -1, 0];
const BNEG = [169, 98, 75, 64, 54, 50, 49, 48];
const RY = (i: number) => 185 + i * 66;
const val = (v: number) => (v < 0 ? `-${-v}` : `${v}`);

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rowStart = (i: number) => {
    if (i < 2) return at(scene, 0, 0.45 + 0.4 * i);
    if (i < 5) return at(scene, 1, 0.3 + 0.25 * (i - 2));
    return at(scene, 2, 0.1 + 0.25 * (i - 5));
  };
  const negStart = (i: number) => at(scene, 4, 0.45 + 0.07 * i);
  const bStart = (i: number) => at(scene, 8, 0.1 + 0.1 * i);
  const R = 1000;
  const done = at(scene, 9, 0.88);
  return (
    <>
      <Text x={60} y={118} w={180} size={36} weight={800} color={C.muted} style={fadeUp(f, 4)}>positive</Text>
      <Text x={300} y={118} w={100} size={36} weight={800} color={C.amber} style={{ opacity: ease(f, bStart(0) - 6, 8) }}>b</Text>
      <Text x={450} y={118} w={200} size={36} weight={800} color={C.muted} style={{ opacity: ease(f, at(scene, 4, 0.3), 10) }}>negative</Text>
      <Text x={790} y={118} w={100} size={36} weight={800} color={C.amber} style={{ opacity: ease(f, bStart(0) - 6, 8) }}>b</Text>
      <Box x={40} y={RY(6) - 6} w={880} h={66} start={at(scene, 6, 0)} out={at(scene, 7)} color={C.violet} />
      <Box x={40} y={RY(7) - 6} w={880} h={66} start={at(scene, 7, 0)} out={at(scene, 8)} color={C.violet} />
      {POS.map(([u, v], i) => (
        <div key={i}>
          <Eq x={60} y={RY(i)} tex={`${u}\\times${v}`} start={rowStart(i)} size={48} />
          <Eq x={450} y={RY(i)} tex={`(-${u})(-${v})`} start={negStart(i)} size={48} color={C.red} />
          <Eq x={300} y={RY(i)} tex={val(BPOS[i])} start={bStart(i)} size={48} color={C.amber} />
          <Eq x={790} y={RY(i)} tex={val(BNEG[i])} start={bStart(i)} size={48} color={C.amber} />
        </div>
      ))}
      <Pill x={60} y={RY(8) + 6} color={C.primary} style={{ ...fadeUp(f, at(scene, 2, 0.85)), fontSize: 40, padding: '6px 22px' }}>8 pairs</Pill>
      <Pill x={450} y={RY(8) + 6} color={C.red} style={{ ...fadeUp(f, at(scene, 4, 0.9)), fontSize: 40, padding: '6px 22px' }}>8 more</Pill>
      {/* swap */}
      <Eq x={R} y={140} tex="9\times16\ \leftrightarrow\ 16\times9" start={at(scene, 3, 0.3)} out={at(scene, 9)} size={52} />
      <Fade start={at(scene, 3, 0.6)} out={at(scene, 9)}>
        <Pill x={R + 500} y={222} color={C.primary} style={{ fontSize: 44 }}>same b</Pill>
      </Fade>
      {/* shift by 12 */}
      <Eq x={R} y={310} tex="r=u-12,\ \ s=v-12" start={at(scene, 5, 0.1)} out={at(scene, 9)} size={52} />
      <Eq x={R} y={400} tex="b=-(r+s)=24-(u+v)" start={at(scene, 5, 0.55)} out={at(scene, 9)} size={52} />
      <Eq x={R} y={510} tex="9+16=25" start={at(scene, 6, 0.15)} out={at(scene, 7)} size={52} />
      <Eq x={R} y={590} tex="b=24-25=-1" start={at(scene, 6, 0.4)} out={at(scene, 7)} size={52} color={C.amber} />
      <Text x={R} y={680} w={700} size={44} weight={800} color={C.violet} style={{ opacity: ease(f, at(scene, 6, 0.65), 10) * fadeTo(f, at(scene, 7), 0) }}>
        roots −3 and 4: our opening example!
      </Text>
      <Eq x={R} y={510} tex="12+12=24" start={at(scene, 7, 0.15)} out={at(scene, 8)} size={52} />
      <Eq x={R} y={590} tex="b=24-24=0" start={at(scene, 7, 0.4)} out={at(scene, 8)} size={52} color={C.amber} />
      <Eq x={R} y={680} tex="x^2=0:\ \text{roots }0,\,0" start={at(scene, 7, 0.65)} out={at(scene, 8)} size={52} />
      <Text x={R} y={600} w={800} size={46} weight={800} color={C.primary} style={{ ...fadeUp(f, at(scene, 8, 0.7)), opacity: ease(f, at(scene, 8, 0.7), 14) * fadeTo(f, at(scene, 9), 0) }}>all different, every pair its own b</Text>
      <Eq x={R} y={420} tex="8+8=16" start={at(scene, 9, 0.35)} size={90} color={C.green} />
      <Answer x={1740} y={440} value="C" chime={CHIME} start={done} />
      <Confetti x={1740} y={440} start={done} seed={7} />
    </>
  );
};

// ---------- oneroot ----------

const DIV_TOP = [1, 2, 3, 4, 6, 8, 9, 12];
const DIV_BOT = [144, 72, 48, 36, 24, 18, 16];
const CW = 112;
const CX = 930;

const Chip: React.FC<{ x: number; y: number; v: number; start: number; color?: string }> = ({ x, y, v, start, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: CW - 8, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.card, borderRadius: 14, fontSize: 46, fontWeight: 800, color, boxShadow: '0 3px 10px rgba(30,40,80,0.08)', ...fadeUp(f, start, 10) }}>
      {v < 0 ? `−${-v}` : v}
    </div>
  );
};

const OneRoot: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = 70;
  const l5 = at(scene, 5, 0.25);
  const rows = [
    { y: 140, v: DIV_TOP, sign: 1 },
    { y: 215, v: DIV_BOT, sign: 1 },
    { y: 320, v: DIV_TOP, sign: -1 },
    { y: 395, v: DIV_BOT, sign: -1 },
  ];
  const l7 = at(scene, 7);
  const l8 = at(scene, 8);
  return (
    <>
      <Eq x={L} y={140} tex="r^2+br+12b=0" start={at(scene, 0, 0.6)} />
      <Eq x={L} y={225} tex="b(r+12)=-r^2" start={at(scene, 1, 0.6)} />
      <Eq x={L} y={310} tex="d=r+12,\ \ r=d-12" start={at(scene, 2, 0.5)} />
      <Eq x={L} y={395} tex="r^2=d^2-24d+144" start={at(scene, 3, 0.5)} />
      <Eq x={L} y={480} tex="bd=-d^2+24d-144" start={at(scene, 4, 0.2)} />
      <Eq x={L} y={565} tex="b=24-d-\dfrac{144}{d}" start={at(scene, 4, 0.7)} color={C.ink} size={58} />
      <Text x={CX} y={62} w={900} size={48} weight={800} color={C.primary} style={fadeUp(f, l5)}>
        d divides 144
      </Text>
      {rows.map((row, ri) =>
        row.v.map((v, i) => {
          const sv = row.sign * v;
          const hot = sv === 16 || sv === 9;
          const col = f >= l7 && f < l8 && hot ? C.violet : C.ink;
          return <Chip key={`${ri}-${i}`} x={CX + i * CW} y={row.y} v={sv} start={l5 + 2 * i + (ri % 2) * 8 + (ri > 1 ? 20 : 0)} color={col} />;
        }),
      )}
      {/* pair lines (L8) */}
      <Stage>
        {[0, 2].map((ri) =>
          DIV_BOT.map((_, i) => (
            <line key={`${ri}-${i}`} x1={CX + i * CW + (CW - 8) / 2} y1={rows[ri].y + 64} x2={CX + i * CW + (CW - 8) / 2} y2={rows[ri + 1].y} stroke={[C.primary, C.violet, C.blue, C.amber][i % 4]} strokeWidth={7} strokeLinecap="round" opacity={ease(f, l8 + 3 * i, 10)} />
          )),
        )}
        {[0, 2].map((ri) => (
          <rect key={ri} x={CX + 7 * CW - 4} y={rows[ri].y - 4} width={CW} height={72} rx={18} fill="none" stroke={C.red} strokeWidth={6} opacity={ease(f, l8 + 30, 10)} />
        ))}
      </Stage>
      <Text x={CX} y={485} w={900} size={40} weight={800} color={C.muted} style={{ opacity: ease(f, l5 + 50, 10) * fadeTo(f, l8, 0) }}>
        <Tex tex="15+15=30" size={52} />
      </Text>
      <Eq x={CX} y={560} tex="s=-b-r\ \ \checkmark" start={at(scene, 6, 0.5)} out={l8} size={52} />
      <Eq x={CX} y={650} tex="d=16\to r=4,\ \ d=9\to r=-3" start={l7 + 8} out={l8} size={50} />
      <Eq x={CX} y={730} tex="\text{both give }b=-1" start={at(scene, 7, 0.7)} out={l8} size={50} color={C.amber} />
      <Text x={CX} y={520} w={900} size={40} weight={700} color={C.muted} style={fadeUp(f, l8 + 40)}>
        Only 12 and −12 pair with themselves.
      </Text>
      <Eq x={CX} y={600} tex="28\div2=14,\ \ 14+2=16" start={at(scene, 9, 0.5)} size={58} color={C.green} />
      <Pill x={CX} y={720} color={C.amber} style={{ ...fadeUp(f, at(scene, 10, 0.1)), fontSize: 38 }}>
        Forgot sum &amp; product? Chase one root.
      </Pill>
    </>
  );
};

// ---------- traps ----------

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const flash = [0, 1, 3, 4]; // wrong choices: A B D E, on lines 0 1 2 3
  const lineOf: Record<number, number> = { 0: 0, 1: 1, 3: 2, 4: 3 };
  const fr = (n: number) => at(scene, n);
  return (
    <>
      <div style={{ position: 'absolute', left: 260, top: 130, display: 'flex', gap: 22 }}>
        {CH.map((c, i) => {
          const wrong = flash.includes(i);
          const red = wrong ? ease(f, fr(lineOf[i]) + 6, 8) : 0;
          const isC = i === 2;
          return (
            <div key={i} style={{ background: isC ? C.green : red > 0.5 ? C.red : C.card, color: isC || red > 0.5 ? '#fff' : C.ink, borderRadius: 18, padding: '10px 28px', fontSize: 50, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.08)', opacity: isC ? 1 : 1 - 0.0 * red }}>
              <span style={{ fontSize: 34, marginRight: 10, opacity: 0.7 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          );
        })}
      </div>
      {/* A */}
      <Fade start={fr(0) + 8} out={fr(1)}>
        <div style={{ position: 'absolute', left: 260, top: 290, width: 560, height: 360, borderRadius: 28, border: `6px solid ${C.green}`, background: C.card }} />
        <Text x={540} y={320} w={520} size={48} weight={900} color={C.green} align="center">positive pairs</Text>
        <Text x={540} y={430} w={520} size={120} weight={900} color={C.green} align="center">8</Text>
        <div style={{ position: 'absolute', left: 900, top: 290, width: 700, height: 360, borderRadius: 28, border: `6px dashed ${C.muted}`, background: '#eceef4', opacity: 0.8 }} />
        <Text x={1250} y={320} w={660} size={48} weight={900} color={C.muted} align="center">negative pairs</Text>
        <Text x={1250} y={430} w={660} size={72} weight={900} color={C.red} align="center">8 missing!</Text>
      </Fade>
      {/* B */}
      <Fade start={fr(1) + 8} out={fr(2)}>
        <Text x={960} y={290} w={1400} size={50} weight={800} align="center">15 divisors = 15 values of b?</Text>
        <div style={{ position: 'absolute', left: 240, top: 400 }}>
          <Tex tex={`d=9:\\ b=24-9-16=${AM}-1`} size={54} />
        </div>
        <div style={{ position: 'absolute', left: 240, top: 500 }}>
          <Tex tex={`d=16:\\ b=24-16-9=${AM}-1`} size={54} />
        </div>
        <div style={{ position: 'absolute', left: 1200, top: 395, width: 520, height: 190, borderRadius: 40, border: `6px solid ${C.red}` }} />
        <Text x={1460} y={430} w={480} size={52} weight={900} color={C.red} align="center">same b!</Text>
        <Text x={1460} y={500} w={480} size={40} weight={800} color={C.muted} align="center">counted twice</Text>
      </Fade>
      {/* D */}
      <Fade start={fr(2) + 8} out={fr(3)}>
        <Text x={960} y={290} w={1400} size={50} weight={800} align="center">30 divisors, but each b appears twice</Text>
        {range(4).map((i) => (
          <div key={i} style={{ position: 'absolute', left: 250 + i * 340, top: 390 }}>
            <Tex tex={`${[1, 2, 3, 4][i]}\\leftrightarrow${[144, 72, 48, 36][i]}`} size={50} />
            <div style={{ fontSize: 40, fontWeight: 900, color: C.red, marginTop: 6 }}>one b, ×2</div>
          </div>
        ))}
        <Text x={960} y={560} w={1400} size={44} weight={700} color={C.muted} align="center">only 12 and −12 are single</Text>
      </Fade>
      {/* E */}
      <Fade start={fr(3) + 8} out={fr(4)}>
        <div style={{ position: 'absolute', left: 420, top: 300 }}>
          <Tex tex="2\times16=32" size={80} color={C.red} />
        </div>
        <Text x={420} y={440} w={1100} size={46} weight={800} color={C.muted}>doubling 16, as if</Text>
        <div style={{ position: 'absolute', left: 420, top: 510 }}>
          <Tex tex="(r,s)\ \leftrightarrow\ (s,r)" size={66} />
        </div>
        <Text x={1000} y={490} w={120} size={96} weight={900} color={C.red} style={{ opacity: ease(f, fr(3) + 60, 10) }}>✗</Text>
        <Text x={420} y={620} w={1100} size={46} weight={900} color={C.red} style={{ opacity: ease(f, fr(3) + 60, 10) }}>was a new b. It isn't!</Text>
      </Fade>
    </>
  );
};

// ---------- variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={960} y={140} w={1000} size={60} weight={900} align="center" color={C.violet} style={fadeUp(f, 4)}>
        Your turn!
      </Text>
      <Card x={140} y={260} w={1640} h={300} start={at(scene, 0, 0.2)} />
      <div style={{ position: 'absolute', left: 200, top: 300, width: 1520, fontSize: 56, fontWeight: 700, lineHeight: 1.6, ...fadeUp(f, at(scene, 0, 0.4)) }}>
        <Mark on={at(scene, 1, 0.2)}>{QUESTION_TEX(6)}</Mark>
      </div>
    </>
  );
};

// ---------- variant answer ----------

const VAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = 80;
  const l5 = at(scene, 6);
  const g = (a: number) => ({ out: l5, start: a });
  const done = at(scene, 5, 0.85);
  const GX = 1330;
  const GY = 170;
  const S = 120;
  const cells = [['rs', C.violet], ['6s', C.primary], ['6r', C.primary], ['36', C.amber]];
  return (
    <>
      <Eq x={L} y={150} tex="r+s=-b,\ \ rs=6b" {...g(at(scene, 0, 0.5))} size={52} />
      <Eq x={L} y={240} tex="rs+6r+6s=0" {...g(at(scene, 1, 0.6))} size={52} />
      <Eq x={L} y={330} tex={`rs+6r+6s+${AM}36${'\\color{#333333}'}=${AM}36`} {...g(at(scene, 2, 0.2))} size={52} />
      <Eq x={L} y={420} tex="(r+6)(s+6)=36" {...g(at(scene, 2, 0.55))} size={64} color={C.green} />
      <Fade start={at(scene, 2, 0.5)} out={l5}>
        {cells.map(([t, col], i) => (
          <div key={t} style={{ position: 'absolute', left: GX + (i % 2) * S, top: GY + Math.floor(i / 2) * S, width: S, height: S, border: `4px solid ${C.ink}`, background: `${col}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900, color: col === C.amber ? '#b87400' : col }}>
            {t}
          </div>
        ))}
        <Text x={GX} y={GY - 56} w={S} size={40} weight={900} align="center" color={C.primary}>r</Text>
        <Text x={GX + S} y={GY - 56} w={S} size={40} weight={900} align="center">6</Text>
        <Text x={GX - 70} y={GY + S / 2 - 26} w={60} size={40} weight={900} align="center" color={C.violet}>s</Text>
        <Text x={GX - 70} y={GY + S * 1.5 - 26} w={60} size={40} weight={900} align="center">6</Text>
      </Fade>
      {[['1\\times36', '2\\times18', '3\\times12'], ['4\\times9', '6\\times6']].map((row, ri) =>
        row.map((t, i) => {
          const ln = ri === 0 ? 3 : 4;
          return <Eq key={t} x={L + i * 270} y={510 + ri * 80} tex={t} start={at(scene, ln, ri === 0 ? 0.35 + 0.2 * i : 0.05 + 0.2 * i)} out={l5} size={50} />;
        }),
      )}
      <Pill x={L + 600} y={592} color={C.primary} style={{ ...fadeUp(f, at(scene, 4, 0.4)), fontSize: 40, padding: '6px 22px', opacity: fadeTo(f, l5, 0) * ease(f, at(scene, 4, 0.4), 10) }}>5 pairs</Pill>
      <Eq x={L} y={670} tex="(-1)(-36),\ \dots,\ (-6)(-6)" start={at(scene, 4, 0.7)} out={l5} size={48} color={C.red} />
      <Pill x={L + 700} y={684} color={C.red} style={{ ...fadeUp(f, at(scene, 4, 0.8)), fontSize: 40, padding: '6px 22px', opacity: fadeTo(f, l5, 0) * ease(f, at(scene, 4, 0.8), 10) }}>5 more</Pill>
      <Eq x={1180} y={450} tex="5+5=10" start={at(scene, 5, 0.5)} size={86} color={C.green} />
      <Answer x={1740} y={690} value="10" chime={CHIME} start={done} />
      <Eq x={L} y={150} tex="4-6=-2,\ \ 9-6=3" start={l5 + 8} size={52} />
      <Eq x={L} y={240} tex="b=-(-2+3)=-1" start={at(scene, 6, 0.45)} size={52} color={C.amber} />
      <Eq x={L} y={330} tex="x^2-x-6=(x-3)(x+2)" start={at(scene, 6, 0.75)} size={52} />
      <Text x={930} y={330} w={300} size={60} weight={900} color={C.green} style={fadeUp(f, at(scene, 6, 0.9))}>✓</Text>
      <Confetti x={1230} y={600} start={at(scene, 7, 0.3)} seed={21} />
      <Pill x={80} y={440} color={C.primary} style={{ ...fadeUp(f, at(scene, 7, 0.2)), fontSize: 40 }}>Amazing work!</Pill>
    </>
  );
};

// ---------- recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  const steps: [number, string, string][] = [
    [at(scene, 0, 0.05), '1  Roots → sum and product', 'r+s=-b,\\ \\ rs=12b'],
    [at(scene, 0, 0.55), '2  Remove b', 'rs+12r+12s=0'],
    [at(scene, 1, 0.05), '3  Add 144 so it factors', '(r+12)(s+12)=144'],
    [at(scene, 1, 0.6), '4  Count factor pairs', '\\pm\\ \\text{both!}'],
  ];
  return (
    <>
      <div style={{ opacity: cardOut }}>
        <Card x={140} y={150} w={1640} h={640} />
        <Text x={200} y={175} w={800} size={44} weight={900} color={C.primary} style={fadeUp(f, 4)}>The big idea</Text>
        {steps.map(([s, label, tex], i) => (
          <div key={i}>
            <Text x={200} y={255 + i * 128} w={800} size={46} weight={800} color={i === 3 ? C.red : C.ink} style={fadeUp(f, s)}>{label}</Text>
            <Eq x={1000} y={247 + i * 128} tex={tex} start={s + 4} size={54} color={i === 3 ? C.red : C.ink} />
          </div>
        ))}
      </div>
      <SignOff start={at(scene, 2, 0.1)} />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(12, 10, true),
  sumprod: SumProd,
  trick: Trick,
  count: Count,
  oneroot: OneRoot,
  traps: Traps,
  variant: Variant,
  try2: makePause(6, 10, false),
  'variant-answer': VAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + the equation big, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>8?</span>]}>
    <div style={{ background: C.card, borderRadius: 40, padding: '50px 10px', width: 640, boxShadow: '0 8px 30px rgba(30,40,80,0.10)', textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div><Tex tex="x^2+bx+12b" size={84} /></div>
      <div><Tex tex="=0" size={84} /></div>
      <div style={{ marginTop: 30, fontSize: 64, fontWeight: 900, color: C.violet }}>2 integer roots</div>
    </div>
  </ThumbFrame>
);

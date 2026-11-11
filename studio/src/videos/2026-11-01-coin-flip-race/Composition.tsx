import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-coin-flip-race';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const ANN = C.violet;
export const BOB = C.primary;
export const PILE = '#9fb0d0';
export const GOLD = C.amber;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const comb = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 || k === n ? 1 : comb(n - 1, k - 1) + comb(n - 1, k));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- coins ----------

export type Face = 'H' | 'T' | 'N';
const opp = (a: Face): Face => (a === 'H' ? 'T' : 'H');

type FCProps = {
  f: number; x: number; y: number; r?: number; rim: string; from: Face; to?: Face; start?: number; dur?: number; spin?: number;
  op?: number; dashed?: boolean; glow?: number; glowColor?: string; scale?: number;
};
/** A coin that can flip from one face to another (scaleX trick). Static when `start` is omitted. */
export const FC: React.FC<FCProps> = ({ f, x, y, r = 35, rim, from, to = from, start = 1e9, dur = 20, spin = 1, op = 1, dashed = false, glow = 0, glowColor = GOLD, scale = 1 }) => {
  if (op <= 0) return null;
  const p = cl((f - start) / dur);
  const n = from === to ? 2 * spin : 2 * spin - 1;
  const seg = p <= 0 ? 0 : Math.floor(p * n + 0.5);
  let face: Face = from;
  if (p > 0) face = seg >= n ? to : seg === 0 ? from : from === 'N' ? (seg % 2 === 1 ? 'H' : 'T') : seg % 2 === 1 ? opp(from) : from;
  const sx = p <= 0 || p >= 1 ? 1 : Math.cos(p * n * Math.PI);
  const dy = p > 0 && p < 1 ? -Math.sin(p * Math.PI) * (n > 1 ? 34 : 22) : 0;
  const fill = face === 'H' ? C.primary : face === 'T' ? '#e6e9f0' : '#ffffff';
  const letter = face === 'N' ? '?' : face;
  const lc = face === 'H' ? '#fff' : face === 'T' ? C.ink : C.muted;
  return (
    <g opacity={op} transform={`translate(${x} ${y + dy}) scale(${Math.max(0.05, Math.abs(sx)) * scale} ${scale})`}>
      {glow > 0 && <circle r={r + 12 + 4 * glow} fill="none" stroke={glowColor} strokeWidth={8} opacity={glow} />}
      {dashed ? (
        <circle r={r} fill="none" stroke={rim} strokeWidth={5} strokeDasharray="10 8" />
      ) : (
        <>
          <circle r={r} fill={fill} stroke={rim} strokeWidth={7} />
          <text y={2} fontFamily={NUNITO} fontWeight={900} fontSize={r * 1.05} textAnchor="middle" dominantBaseline="central" fill={lc}>
            {letter}
          </text>
        </>
      )}
    </g>
  );
};

/** Big coin that keeps flipping H/T. */
const LoopCoin: React.FC<{ f: number; x: number; y: number; r: number; start: number; period?: number; op?: number }> = ({ f, x, y, r, start, period = 36, op = 1 }) => {
  const u = Math.max(0, f - start) / period;
  const sx = Math.cos(u * Math.PI);
  const face: Face = Math.floor(u + 0.5) % 2 === 0 ? 'H' : 'T';
  const hop = Math.abs(Math.sin(u * Math.PI)) * 0;
  return (
    <g opacity={op} transform={`translate(${x} ${y - hop}) scale(${Math.max(0.05, Math.abs(sx))} 1)`}>
      <circle r={r} fill={face === 'H' ? C.primary : '#e6e9f0'} stroke={C.violet} strokeWidth={9} />
      <text y={3} fontFamily={NUNITO} fontWeight={900} fontSize={r * 1.05} textAnchor="middle" dominantBaseline="central" fill={face === 'H' ? '#fff' : C.ink}>{face}</text>
    </g>
  );
};

const FA: Face[] = ['H', 'T', 'H', 'T', 'T']; // Ann's example (intro)
const FB: Face[] = ['H', 'H', 'T', 'H', 'T', 'H', 'T']; // Bob's example (intro)
const SA: Face[] = ['H', 'H', 'H', 'T', 'T']; // Ann: 3 heads + 2 tails (solution 1)
const SB: Face[] = ['H', 'T', 'H', 'H', 'T', 'H', 'T'];
const VA: Face[] = ['H', 'H', 'T']; // variant Ann
const VB: Face[] = ['H', 'T', 'H', 'H', 'T'];

// ---------- small building blocks ----------

const RowLabel: React.FC<{ x: number; y: number; color: string; start?: number; w?: number; size?: number; children: React.ReactNode }> = ({ x, y, color, start = 0, w = 400, size = 48, children }) => {
  const f = useCurrentFrame();
  return <Text x={x} y={y} w={w} size={size} weight={900} color={color} style={{ ...fadeUp(f, start), whiteSpace: 'nowrap' }}>{children}</Text>;
};

const TR: React.FC<{ x: number; y: number; tex: string; size?: number; start: number; color?: string; op?: number; center?: boolean }> = ({ x, y, tex, size = 56, start, color = C.ink, op = 1, center = false }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...(center ? { transform: `translateX(-50%) ${s.transform}` } : { transform: s.transform }), opacity: (s.opacity as number) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; color?: string; op?: number; size?: number; children: React.ReactNode }> = ({ x = 880, y, w = 980, start, color = C.primary, op = 1, size = 42, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  if (op <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 28px', fontSize: size, fontWeight: 800, lineHeight: 1.25, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      {children}
    </div>
  );
};

const QCard: React.FC<{ x?: number; y?: number; w?: number; size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ x = 60, y = 130, w = 900, size = 42, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 30, padding: '26px 40px', fontSize: size, fontWeight: 600, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

const XIcon: React.FC<{ start: number; size?: number }> = ({ start, size = 56 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 10);
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ opacity: p, transform: `scale(${0.6 + 0.4 * p})`, flexShrink: 0 }}>
      <g stroke={C.red} strokeWidth={10} strokeLinecap="round">
        <line x1={8} y1={8} x2={52} y2={52} />
        <line x1={52} y1={8} x2={8} y2={52} />
      </g>
    </svg>
  );
};

type ChipState = 'none' | 'green' | 'red' | 'dim';
const Chips: React.FC<{ x: number; y: number; vals: string[]; start: (i: number) => number; state?: (i: number) => ChipState; pitch?: number; size?: number; cw?: number }> = ({ x, y, vals, start, state = () => 'none', pitch = 240, size = 54, cw = 230 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {vals.map((v, i) => {
        const st = state(i);
        const bc = st === 'green' ? C.green : st === 'red' ? C.red : 'transparent';
        return (
          <div key={i} style={{ position: 'absolute', left: x + i * pitch, top: y, display: 'flex', alignItems: 'center', justifyContent: 'center', width: cw, boxSizing: 'border-box', gap: 12, background: st === 'green' ? 'rgba(33,196,93,0.14)' : C.card, border: `5px solid ${bc}`, borderRadius: 20, padding: '10px 22px', fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', ...(() => { const s = fadeUp(f, start(i), 10); return { transform: s.transform, opacity: (s.opacity as number) * (st === 'dim' ? 0.4 : 1) }; })() }}>
            <span style={{ color: C.muted, fontSize: 36 }}>{'ABCDE'[i]}</span>
            <Tex tex={v} size={size} color={st === 'green' ? '#0d8a3a' : C.ink} />
          </div>
        );
      })}
    </>
  );
};

const Chime: React.FC<{ start: number; volume?: number }> = ({ start, volume = 0.3 }) => (
  <Sequence from={start} durationInFrames={60} layout="none">
    <Audio src={CHIME} volume={volume} />
  </Sequence>
);

/** Bars for C(n, k), k = 0..n. */
const Bars: React.FC<{ f: number; n: number; x0: number; base: number; pitch: number; w: number; maxH: number; color: (k: number) => string; op?: (k: number) => number; rise?: (k: number) => number; dx?: (k: number) => number; dy?: (k: number) => number; scaleTo?: number }> = ({ f, n, x0, base, pitch, w, maxH, color, op = () => 1, rise = () => 1, dx = () => 0, dy = () => 0, scaleTo }) => {
  void f;
  const top = scaleTo ?? comb(n, Math.floor(n / 2));
  return (
    <g>
      {range(n + 1).map((k) => {
        const h = Math.max(2, (comb(n, k) / top) * maxH * rise(k));
        return <rect key={k} x={x0 + k * pitch + dx(k)} y={base - h + dy(k)} width={w} height={h} rx={5} fill={color(k)} opacity={op(k)} />;
      })}
    </g>
  );
};

const Bracket: React.FC<{ x1: number; x2: number; y: number; opacity: number }> = ({ x1, x2, y, opacity }) => (
  <path d={`M ${x1} ${y - 10} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y - 10}`} stroke={C.muted} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
);

const out = (f: number, at0: number, dur = 12) => fadeTo(f, at0, 0, dur);
const win = (f: number, a: number, b: number) => ease(f, a, 10) * (1 - ease(f, b - 10, 10));

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const o = out(f, t(2, 0));
  const ay = 300;
  const by = 540;
  const x0 = 560;
  const pitch = 100;
  const glow = ease(f, t(1, 0.25), 12) * (0.6 + 0.4 * Math.sin(f / 5));
  const q = ease(f, t(1, 0.4), 14);
  return (
    <>
      <div style={{ opacity: o }}>
        <Stage>
          {FA.map((fc, i) => <FC key={`a${i}`} f={f} x={x0 + i * pitch} y={ay} rim={ANN} from="N" to={fc} start={t(0, 0.06 + i * 0.05)} dur={30} spin={2} />)}
          {FB.map((fc, i) => <FC key={`b${i}`} f={f} x={x0 + i * pitch} y={by} rim={BOB} from="N" to={fc} start={t(0, 0.2 + i * 0.05)} dur={30} spin={2} glow={i >= 5 ? glow : 0} />)}
        </Stage>
        <RowLabel x={80} y={ay - 31} color={ANN} start={t(0, 0.02)}>Ann (5)</RowLabel>
        <RowLabel x={80} y={by - 31} color={BOB} start={t(0, 0.02)}>Bob (7)</RowLabel>
        <RowLabel x={x0 - 35} y={ay + 52} color={ANN} start={t(0, 0.72)} size={44}>Ann: 2 heads</RowLabel>
        <RowLabel x={x0 - 35} y={by + 52} color={BOB} start={t(0, 0.8)} size={44}>Bob: 4 heads</RowLabel>
        <Text x={940} y={by + 52} w={420} size={44} weight={900} color="#b36b00" style={{ ...fadeUp(f, t(1, 0.25)), whiteSpace: 'nowrap' }}>2 extra coins</Text>
        <Text x={1400} y={150} w={400} size={300} weight={900} color={C.violet} align="center" style={{ opacity: q, transform: `scale(${0.7 + 0.3 * q})`, lineHeight: 1.1 }}>?</Text>
        <Text x={1400} y={470} w={400} size={64} weight={900} color={C.ink} align="center" style={fadeUp(f, t(1, 0.6))}>how often?</Text>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', ...fadeUp(f, t(2, 0.08)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 150, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 80, fontWeight: 900, marginTop: 18 }}>Coin race: 5 vs 7</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.muted, marginTop: 8 }}>Who gets more heads?</div>
      </div>
    </>
  );
};

const NeutralRows: React.FC<{ f: number; ax: number; ay: number; bx: number; by: number; na: number; nb: number; pitch?: number; r?: number; aStart?: number; bStart?: number }> = ({ f, ax, ay, bx, by, na, nb, pitch = 90, r = 35, aStart = 0, bStart = 0 }) => (
  <Stage>
    {range(na).map((i) => <FC key={`a${i}`} f={f} x={ax + i * pitch} y={ay} r={r} rim={ANN} from="N" op={ease(f, aStart + i * 3, 10)} />)}
    {range(nb).map((i) => <FC key={`b${i}`} f={f} x={bx + i * pitch} y={by} r={r} rim={BOB} from="N" op={ease(f, bStart + i * 3, 10)} />)}
  </Stage>
);

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  return (
    <>
      <QCard w={940} size={44} style={fadeUp(f, 6)}>
        Ann flips <b>5</b> fair coins and Bob flips <b>7</b> fair coins. What is the probability that Bob gets <Mark on={t(1, 0.45)}>more heads</Mark> than Ann?
      </QCard>
      <NeutralRows f={f} ax={1130} ay={225} bx={1130} by={400} na={5} nb={7} aStart={t(0, 0.35)} bStart={t(0, 0.7)} />
      <RowLabel x={1095} y={130} color={ANN} start={t(0, 0.3)}>Ann (5)</RowLabel>
      <RowLabel x={1095} y={305} color={BOB} start={t(0, 0.65)}>Bob (7)</RowLabel>
      <Chips x={60} y={600} vals={['\\dfrac{793}{2048}', '\\dfrac12', '\\dfrac{575}{1024}', '\\dfrac{1255}{2048}', '\\dfrac{1651}{2048}']} start={(i) => t(2, 0.12 + i * 0.14)} pitch={310} cw={280} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const o0 = out(f, t(1, 0), 10);
  const sl = ease(f, t(2, 0.1), 40);
  const ax = lerp(140, 470, sl);
  const bx = lerp(1100, 920, sl);
  return (
    <>
      <div style={{ opacity: o0 }}>
        <Stage>
          <LoopCoin f={f} x={330} y={420} r={100} start={t(0, 0.05)} op={ease(f, 4, 10)} />
        </Stage>
        <Text x={560} y={190} w={1250} size={64} weight={900} style={fadeUp(f, t(0, 0.15))}>Heads and tails are equally likely</Text>
        <div style={{ position: 'absolute', left: 580, top: 340, display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, t(0, 0.55)) }}>
          <svg width={90} height={90} viewBox="-45 -45 90 90"><circle r={38} fill={C.primary} stroke={ANN} strokeWidth={7} /><text y={3} fontFamily={NUNITO} fontWeight={900} fontSize={42} textAnchor="middle" dominantBaseline="central" fill="#fff">H</text></svg>
          <Tex tex="\dfrac12" size={90} />
          <div style={{ width: 70 }} />
          <svg width={90} height={90} viewBox="-45 -45 90 90"><circle r={38} fill="#e6e9f0" stroke={ANN} strokeWidth={7} /><text y={3} fontFamily={NUNITO} fontWeight={900} fontSize={42} textAnchor="middle" dominantBaseline="central" fill={C.ink}>T</text></svg>
          <Tex tex="\dfrac12" size={90} />
        </div>
        <Text x={560} y={640} w={1250} size={50} weight={700} color={C.muted} style={fadeUp(f, t(0, 0.75))}>every coin is fair</Text>
      </div>
      <QCard x={60} y={130} w={1780} size={42} style={{ ...fadeUp(f, t(1, 0.0)), padding: '18px 36px' }}>
        Ann flips 5 fair coins and Bob flips 7 fair coins. What is the probability that Bob gets <Mark on={t(1, 0.35)}>MORE heads</Mark> than Ann?
      </QCard>
      <div style={{ position: 'absolute', left: 100, top: 300, display: 'flex', gap: 40, alignItems: 'flex-start', ...fadeUp(f, t(1, 0.15)) }}>
        {[['B', "Bob's heads"], ['>', 'more than'], ['A', "Ann's heads"]].map(([s, l], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            {i === 1 ? <Mark on={t(1, 0.4)}><Tex tex=">" size={130} /></Mark> : <Tex tex={s} size={130} />}
            <div style={{ fontSize: 40, fontWeight: 800, color: i === 1 ? C.primary : i === 0 ? BOB : ANN }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 880, top: 335, display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap', ...fadeUp(f, t(1, 0.62)) }}>
        <Tex tex="B = A" size={80} color={C.red} />
        <span style={{ fontSize: 52, fontWeight: 900, color: C.red }}>tie = not a win</span>
      </div>
      <div style={{ opacity: ease(f, t(2, 0), 10) }}>
        <Stage>
          {FA.map((_, i) => <FC key={`a${i}`} f={f} x={ax + i * 90} y={750} rim={ANN} from="N" />)}
          {range(7).map((i) => <FC key={`b${i}`} f={f} x={bx + i * 90} y={750} rim={BOB} from="N" />)}
        </Stage>
        <RowLabel x={ax - 35} y={650} color={ANN} size={44} w={300}>Ann (5)</RowLabel>
        <RowLabel x={bx - 35} y={650} color={BOB} size={44} w={300}>Bob (7)</RowLabel>
      </div>
      <Pill x={700} y={555} color={C.violet} style={{ ...fadeUp(f, t(2, 0.5)), fontSize: 50 }}>→ one count?</Pill>
    </>
  );
};

const makePause = (seconds: number, variant: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QCard w={1220} size={44} style={fadeUp(f, 6)}>
        {variant ? <>Ann flips <b>3</b> fair coins and Bob flips <b>5</b> fair coins. What is the probability that Bob gets more heads than Ann?</> : <>Ann flips <b>5</b> fair coins and Bob flips <b>7</b> fair coins. What is the probability that Bob gets more heads than Ann?</>}
      </QCard>
      {!variant && <Chips x={60} y={420} vals={['\\dfrac{793}{2048}', '\\dfrac12', '\\dfrac{575}{1024}', '\\dfrac{1255}{2048}', '\\dfrac{1651}{2048}']} start={() => 8} pitch={250} size={50} cw={230} />}
      <NeutralRows f={f} ax={350} ay={640} bx={350} by={770} na={variant ? 3 : 5} nb={variant ? 5 : 7} aStart={10} bStart={14} />
      <RowLabel x={60} y={610} color={ANN} start={10} w={260}>Ann ({variant ? 3 : 5})</RowLabel>
      <RowLabel x={60} y={740} color={BOB} start={10} w={260}>Bob ({variant ? 5 : 7})</RowLabel>
      <Countdown scene={scene} seconds={seconds} x={1660} y={500} tick={TICK} />
    </>
  );
};

const Sol1Flip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const ay = 290;
  const by = 520;
  const mergeP = ease(f, t(6, 0.05), 36);
  const m0 = 432;
  const pitchM = 88;
  const panel = out(f, t(6, 0), 10);
  const left = out(f, t(6, 0.0), 10);
  const flipStart = (i: number) => t(4, 0.1 + i * 0.13);
  const flipped = (i: number): Face => opp(SA[i]);
  const tBub = ease(f, t(3, 0.05), 26);
  return (
    <>
      <Stage>
        {SA.map((fc, i) => {
          const sx = 130 + i * 90;
          const isT = fc === 'T';
          const gx = lerp(sx, m0 + i * pitchM, mergeP);
          const gy = lerp(ay, 420, mergeP);
          const ring = isT ? ease(f, t(1, 0.55), 10) * (1 - ease(f, flipStart(i) + 14, 8)) : 0;
          const ring2 = isT ? ease(f, flipStart(i) + 20, 10) * (1 - ease(f, t(5, 0.5), 10)) : 0;
          return <FC key={`a${i}`} f={f} x={gx} y={gy} rim={ANN} from={fc} to={flipped(i)} start={flipStart(i)} dur={24} glow={Math.max(ring, ring2)} glowColor={ring2 > ring ? C.green : GOLD} />;
        })}
        {SB.map((fc, j) => <FC key={`b${j}`} f={f} x={lerp(130 + j * 90, m0 + (5 + j) * pitchM, mergeP)} y={lerp(by, 420, mergeP)} rim={BOB} from={fc} />)}
      </Stage>
      <div style={{ opacity: left }}>
        <RowLabel x={100} y={ay - 125} color={ANN} start={6}>Ann (5)</RowLabel>
        <RowLabel x={100} y={by - 100} color={BOB} start={6}>Bob (7)</RowLabel>
        <div style={{ position: 'absolute', left: 100, top: ay + 55, whiteSpace: 'nowrap', fontSize: 46, fontWeight: 900 }}>
          <span style={{ color: ANN, opacity: ease(f, t(1, 0.35), 10) * (1 - ease(f, t(4, 0.6), 10)) }}>tails T = 2</span>
          <span style={{ position: 'absolute', left: 0, color: C.green, opacity: ease(f, t(4, 0.65), 10) * (1 - ease(f, t(6, 0), 10)) }}>now heads</span>
        </div>
        <Pill x={100} y={650} color={C.green} style={{ ...fadeUp(f, t(5, 0.2)), fontSize: 44 }}>still fair coins ✓</Pill>
      </div>
      <div style={{ opacity: panel }}>
        <TR x={1000} y={150} tex="A = 5 - T" size={64} start={t(1, 0.5)} />
        <TR x={1000} y={235} tex="3 = 5 - 2" size={60} start={t(1, 0.75)} color={C.muted} />
        <TR x={1000} y={330} tex="B > 5 - T" size={64} start={t(2, 0.35)} />
        <TR x={1000} y={440} tex="B + T > 5" size={64} start={t(3, 0.45)} />
        <TR x={1000} y={540} tex="B + T \ge 6" size={64} start={t(3, 0.75)} color="#0a8a5c" />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: tBub > 0 && tBub < 1 ? 1 : 0 }} viewBox="0 0 1920 1080">
          <circle cx={lerp(1260, 1165, tBub)} cy={lerp(375, 475, tBub)} r={30} fill={ANN} />
          <text x={lerp(1260, 1165, tBub)} y={lerp(377, 477, tBub)} fontFamily={NUNITO} fontWeight={900} fontSize={38} textAnchor="middle" dominantBaseline="central" fill="#fff">T</text>
        </svg>
      </div>
      <Stage><Bracket x1={m0 - 35} x2={m0 + 12 * pitchM - 53} y={500} opacity={mergeP} /></Stage>
      <Text x={960} y={510} w={600} size={44} weight={800} color={C.muted} align="center" style={{ opacity: mergeP }}>12 coins</Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', fontSize: 58, fontWeight: 900, ...fadeUp(f, t(6, 0.5)) }}>
        <span>Bob wins</span>
        <Tex tex="\iff" size={64} />
        <span style={{ color: '#0a8a5c' }}>at least 6 heads of 12</span>
      </div>
    </>
  );
};

const PX0 = 100;
const PITCH = 72;
const PW = 60;
const BASE = 700;
const MAXH = 360;
const bx = (k: number) => PX0 + k * PITCH;
const gcx = (a: number, b: number) => PX0 + ((a + b) / 2) * PITCH + PW / 2;

const Sol1Piles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const coinsO = out(f, t(1, 0.0), 14);
  const risen = (k: number) => ease(f, t(1, 0.05) + k * 3, 18);
  const colorOf = (k: number) => (k === 6 ? C.primary : PILE);
  const leftFade = fadeTo(f, t(7, 0.15), 0.3, 12);
  const mIn = ease(f, t(2, 0.15), 22);
  const mOut = ease(f, t(2, 0.72), 22);
  const mir = mIn * (1 - mOut);
  const hl = ease(f, t(7, 0.05), 12);
  const lblQ = (x: number, start: number) => {
    const to = t(6, 0.5);
    const q = f < to;
    return (
      <Text x={x} y={q ? 300 : 320} w={300} size={q ? 100 : 76} weight={900} color={q ? C.muted : C.violet} align="center" style={{ ...fadeUp(f, q ? start : to), lineHeight: 1.1 }}>
        {q ? '?' : '1586'}
      </Text>
    );
  };
  return (
    <>
      <div style={{ opacity: coinsO }}>
        <Stage>
          {range(12).map((i) => <FC key={i} f={f} x={170 + i * 80} y={400} r={30} rim={i < 5 ? ANN : BOB} from="N" op={ease(f, 8 + i * 2, 10)} />)}
        </Stage>
        <Text x={170} y={470} w={950} size={50} weight={800} color={C.muted} style={fadeUp(f, 30)}>12 coins</Text>
      </div>
      <Stage>
        <g opacity={f >= t(1, 0.05) ? 1 : 0}>
          <g opacity={leftFade}>
            <Bars f={f} n={12} x0={PX0} base={BASE} pitch={PITCH} w={PW} maxH={MAXH} color={() => PILE} op={(k) => (k < 6 ? 1 : 0)} rise={risen} />
          </g>
          <Bars f={f} n={12} x0={PX0} base={BASE} pitch={PITCH} w={PW} maxH={MAXH} color={colorOf} op={(k) => (k >= 6 ? 1 : 0)} rise={risen} />
          {/* mirrored copy of the left pile */}
          <Bars f={f} n={12} x0={PX0} base={BASE} pitch={PITCH} w={PW} maxH={MAXH} color={() => C.violet} op={(k) => (k < 6 && mir > 0 ? 0.55 : 0)} dx={(k) => (12 - 2 * k) * PITCH * mir} dy={() => -Math.sin(mir * Math.PI) * 60} />
          <Bracket x1={bx(0)} x2={bx(5) + PW} y={BASE + 22} opacity={ease(f, t(1, 0.3), 10)} />
          <Bracket x1={bx(6)} x2={bx(6) + PW} y={BASE + 22} opacity={ease(f, t(1, 0.5), 10)} />
          <Bracket x1={bx(7)} x2={bx(12) + PW} y={BASE + 22} opacity={ease(f, t(1, 0.7), 10)} />
          {hl > 0 && <rect x={bx(6) - 12} y={265} width={bx(12) + PW - bx(6) + 24} height={BASE + 10 - 265} rx={22} fill="none" stroke={C.green} strokeWidth={8} opacity={hl} />}
        </g>
        {/* 12-coin strip over the middle bar */}
        {range(12).map((i) => (
          <FC key={i} f={f} x={1138 + i * 64} y={450} r={28} rim={i < 6 ? C.primary : '#c3cadb'} from={i < 6 ? 'H' : 'T'} op={ease(f, t(3, 0.3) + i, 10) * (1 - ease(f, t(4, 0.0), 10))} />
        ))}
      </Stage>
      <div style={{ opacity: leftFade }}>
        <Text x={gcx(0, 5)} y={BASE + 28} w={300} size={40} weight={800} color={C.muted} align="center" style={fadeUp(f, t(1, 0.3))}>fewer than 6</Text>
      </div>
      <Text x={gcx(6, 6)} y={BASE + 28} w={300} size={40} weight={800} color={C.primary} align="center" style={fadeUp(f, t(1, 0.5))}>exactly 6</Text>
      <Text x={gcx(7, 12)} y={BASE + 28} w={300} size={40} weight={800} color={C.muted} align="center" style={fadeUp(f, t(1, 0.7))}>more than 6</Text>
      <div style={{ opacity: ease(f, t(2, 0.2), 10) * (1 - ease(f, t(3, 0), 10)) }}>
        <Pill x={bx(0)} y={175} color={C.violet} style={{ fontSize: 42 }}>mirror images</Pill>
      </div>
      <div style={{ opacity: leftFade }}>{lblQ(gcx(0, 5), t(2, 0.5))}</div>
      {lblQ(gcx(7, 12), t(2, 0.5))}
      <TR x={1110} y={235} tex="\binom{12}{6}" size={96} start={t(3, 0.1)} op={1 - ease(f, t(4, 0.0), 8)} />
      <TR x={gcx(6, 6)} y={150} tex="924" size={60} start={t(4, 0.55)} center color="#0a8a5c" />
      <Pill x={660} y={175} color={C.green} style={{ ...fadeUp(f, t(7, 0.3)), fontSize: 42 }}>at least 6</Pill>
      <TR x={1110} y={140} tex="2^{12} = 4096" size={62} start={t(0, 0.4)} />
      <TR x={1110} y={250} tex="\dfrac{12\cdot11\cdot10\cdot9\cdot8\cdot7}{6\cdot5\cdot4\cdot3\cdot2\cdot1}=924" size={48} start={t(4, 0.45)} />
      <TR x={1110} y={430} tex="4096 - 924 = 3172" size={56} start={t(5, 0.4)} />
      <TR x={1110} y={530} tex="3172 \div 2 = 1586" size={56} start={t(6, 0.35)} />
      <TR x={1110} y={650} tex="924 + 1586 = 2510" size={62} start={t(8, 0.45)} color="#0a8a5c" />
    </>
  );
};

const Sol1Answer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const end = at(scene, 1, 1) - 10;
  const reveal = ease(f, t(1, 0.38), 14);
  return (
    <>
      <TR x={140} y={150} tex="\dfrac{2510}{4096}" size={150} start={t(0, 0.35)} />
      <div style={{ position: 'absolute', left: 620, top: 150, whiteSpace: 'nowrap', opacity: reveal, transform: `translateX(${(1 - reveal) * -20}px)` }}>
        <Tex tex="\xlongequal[\div 2]{\div 2}\dfrac{1255}{2048}" size={150} />
      </div>
      <Chips x={160} y={570} vals={['\\dfrac{793}{2048}', '\\dfrac12', '\\dfrac{575}{1024}', '\\dfrac{1255}{2048}', '\\dfrac{1651}{2048}']} start={() => 4} pitch={310} cw={280} state={(i) => (f >= end && i === 3 ? 'green' : f >= end ? 'dim' : 'none')} />
      <Answer x={1640} y={400} value="D" start={end} chime={CHIME} />
    </>
  );
};

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const P = 76;
  const R = 30;
  const x0 = 290;
  const ay = 230;
  const by = 390;
  const slide = ease(f, t(0, 0.35), 24);
  const back = ease(f, t(4, 0.15), 24);
  const away = slide * (1 - back);
  const c7x = lerp(x0 + 6 * P, 746, away);
  const c7y = lerp(by, 480, away);
  const dimC7 = 1 - 0.65 * ease(f, t(5, 0.0), 10) * (1 - ease(f, t(7, 0), 10));
  const g1 = out(f, t(3, 0.0), 10);
  const g4 = ease(f, t(4, 0.3), 10) * (1 - ease(f, t(5, 0), 10));
  const g56 = ease(f, t(5, 0.0), 10) * (1 - ease(f, t(8, 0), 10));
  const wob = Math.sin(f / 6) * 7 * (1 - ease(f, t(3, 0.55), 20)) * ease(f, t(3, 0.05), 6);
  const balO = ease(f, t(3, 0.05), 12) * (1 - ease(f, t(4, 0.0), 10));
  const flipA = (i: number) => t(5, 0.1 + i * 0.07);
  return (
    <>
      <Stage>
        {SA.map((fc, i) => <FC key={`a${i}`} f={f} x={x0 + i * P} y={ay} r={R} rim={ANN} from={fc} to={opp(fc)} start={flipA(i)} dur={16} />)}
        {SB.slice(0, 6).map((fc, j) => <FC key={`b${j}`} f={f} x={x0 + j * P} y={by} r={R} rim={BOB} from={fc} />)}
        <FC f={f} x={c7x} y={c7y} r={R} rim={GOLD} from={SB[6]} to={SB[6] === 'T' ? 'H' : 'T'} start={t(7, 0.25)} dur={30} spin={2} dashed={away > 0.9} op={dimC7} glow={ease(f, t(4, 0.35), 10) * (1 - ease(f, t(5, 0), 10))} />
        {/* balance: level at 50 / 50 */}
        <g opacity={balO}>
          <line x1={410} y1={610} x2={410} y2={705} stroke={C.muted} strokeWidth={10} strokeLinecap="round" />
          <g transform={`rotate(${wob} 410 610)`}>
            <line x1={190} y1={610} x2={630} y2={610} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
            <path d="M 190 610 L 140 665 L 240 665 Z" fill="rgba(12,194,129,0.15)" stroke={BOB} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 630 610 L 580 665 L 680 665 Z" fill="rgba(123,97,255,0.15)" stroke={ANN} strokeWidth={6} strokeLinejoin="round" />
          </g>
          <circle cx={410} cy={610} r={14} fill={C.ink} />
        </g>
      </Stage>
      <RowLabel x={60} y={ay - 31} color={ANN} w={230} start={4}>Ann (5)</RowLabel>
      <RowLabel x={60} y={by - 31} color={BOB} w={230} start={4}>Bob (6)</RowLabel>
      <Text x={746} y={c7y + 40} w={220} size={40} weight={800} color="#b36b00" align="center" style={{ opacity: away > 0.2 ? away : 0, whiteSpace: 'nowrap' }}>coin 7</Text>
      <Pill x={x0 + 6 * P - 175} y={by + 48} color={GOLD} style={{ opacity: g4, fontSize: 38, color: '#4a3000', whiteSpace: 'nowrap' }}>tiebreaker</Pill>
      <div style={{ opacity: balO }}>
        <div style={{ position: 'absolute', left: 90, top: 465, width: 200, display: 'flex', justifyContent: 'center' }}><Tex tex="\dfrac12" size={56} /></div>
        <div style={{ position: 'absolute', left: 530, top: 465, width: 200, display: 'flex', justifyContent: 'center' }}><Tex tex="\dfrac12" size={56} /></div>
        <div style={{ position: 'absolute', left: 80, top: 675, width: 220, textAlign: 'center', fontSize: 38, fontWeight: 800, color: BOB, whiteSpace: 'nowrap' }}>more heads</div>
        <div style={{ position: 'absolute', left: 520, top: 675, width: 220, textAlign: 'center', fontSize: 38, fontWeight: 800, color: ANN, whiteSpace: 'nowrap' }}>more tails</div>
      </div>
      {/* panel: L1-L2 */}
      <div style={{ opacity: g1 }}>
        <Card y={150} w={640} start={t(1, 0.25)} color={BOB}>Bob has more heads</Card>
        <Card y={245} w={640} start={t(1, 0.45)} color={ANN}>Bob has more tails</Card>
        <Stage>
          <path d="M 1545 152 Q 1575 152 1575 182 L 1575 190 Q 1575 220 1600 220 Q 1575 220 1575 250 L 1575 262 Q 1575 292 1545 292" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" opacity={ease(f, t(1, 0.6), 12)} />
        </Stage>
        <Text x={1615} y={192} w={260} size={44} weight={900} style={{ ...fadeUp(f, t(1, 0.7)), whiteSpace: 'nowrap' }}>exactly one</Text>
        <div style={{ position: 'absolute', left: 880, top: 350, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...fadeUp(f, t(2, 0.2)) }}>
          <Tex tex="B_6 \le A,\ 6-B_6 \le 5-A \Rightarrow 6 \le 5" size={52} />
          <XIcon start={t(2, 0.35)} />
        </div>
        <div style={{ position: 'absolute', left: 880, top: 480, display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', ...fadeUp(f, t(2, 0.55)) }}>
          <Tex tex="B_6 > A,\ 6-B_6 > 5-A \Rightarrow 6 \ge 7" size={52} />
          <XIcon start={t(2, 0.72)} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 880, top: 140, whiteSpace: 'nowrap', ...fadeUp(f, t(3, 0.5)), opacity: ease(f, t(3, 0.5), 14) * (1 - ease(f, t(8, 0), 10)) }}>
        <Tex tex="6 \text{ vs } 5:\ \text{Bob wins } \dfrac12" size={52} />
      </div>
      <Card y={300} start={t(4, 0.35)} color={C.green} op={g4} size={40}>Bob ahead → win</Card>
      <Card y={385} start={t(4, 0.55)} color={GOLD} op={g4} size={40}>tie → coin 7 decides</Card>
      <Card y={470} start={t(4, 0.75)} color={C.red} op={g4} size={40}>Bob behind → lose <span style={{ fontSize: 34, color: C.muted, fontWeight: 700 }}>(7 coins can at most tie)</span></Card>
      <div style={{ opacity: g56 }}>
        <TR x={880} y={290} tex="B_6 = A \iff B_6 + T = 5" size={54} start={t(5, 0.35)} />
        <Card y={380} start={t(5, 0.6)} color={C.violet} size={42}>exactly 5 heads among 11 coins</Card>
        <TR x={880} y={460} tex="\dbinom{11}{5}=\dfrac{11\cdot10\cdot9\cdot8\cdot7}{5\cdot4\cdot3\cdot2\cdot1}=462" size={50} start={t(6, 0.1)} />
        <TR x={880} y={620} tex="2^{11}=2048,\ \text{tie: } \dfrac{462}{2048}" size={48} start={t(6, 0.55)} op={1 - ease(f, t(7, 0.35), 6)} />
        <TR x={880} y={620} tex="2^{11}=2048,\ \text{tie: } \dfrac{462}{2048}\quad 462 \div 2 = 231" size={48} start={t(7, 0.35)} />
      </div>
      <TR x={880} y={160} tex="\dfrac12 = \dfrac{1024}{2048}" size={64} start={t(8, 0.05)} />
      <TR x={880} y={345} tex="\dfrac{1024 + 231}{2048}" size={64} start={t(8, 0.6)} op={1 - ease(f, t(9, 0.0), 6)} />
      <TR x={880} y={345} tex="\dfrac{1024 + 231}{2048} = \dfrac{1255}{2048}" size={64} start={t(9, 0.0)} color="#0a8a5c" />
      <Check x={880} y={510} start={t(9, 0.6)}>Same answer!</Check>
      <Chime start={at(scene, 9, 1) - 12} volume={0.15} />
      <Pill x={880} y={600} color={C.violet} style={{ ...fadeUp(f, t(10, 0.45)), fontSize: 42, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
        one extra coin → exactly <Tex tex="\dfrac12" size={56} color="#fff" />
      </Pill>
    </>
  );
};

const MiniBars: React.FC<{ f: number; x: number; base: number; hi: [number, number]; color: string; start: number }> = ({ f, x, base, hi, color, start }) => (
  <Stage>
    <Bars f={f} n={12} x0={x} base={base} pitch={38} w={30} maxH={200} color={(k) => (k >= hi[0] && k <= hi[1] ? color : '#d5dbea')} rise={(k) => ease(f, start + k, 14)} />
  </Stage>
);

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const wA = win(f, t(1, 0), t(2, 0));
  const wB = win(f, t(2, 0), t(3, 0));
  const wE = win(f, t(3, 0), t(4, 0));
  const wC = win(f, t(4, 0), t(7, 0));
  const w7 = ease(f, t(7, 0), 12);
  const state = (i: number): ChipState => {
    if (i === 3) return f >= t(0, 0.8) ? 'green' : 'none';
    const hot = (i === 0 && f >= t(1, 0) && f < t(2, 0)) || (i === 1 && f >= t(2, 0) && f < t(3, 0)) || (i === 4 && f >= t(3, 0) && f < t(4, 0)) || (i === 2 && f >= t(4, 0) && f < t(7, 0));
    return hot ? 'red' : 'none';
  };
  const sp = ease(f, t(5, 0.0), 10);
  const spare = (j: number) => 5 + j;
  const comeback = ease(f, t(6, 0.1), 12);
  return (
    <>
      <TR x={500} y={108} center tex="\dfrac12 = \dfrac{1024}{2048}" size={52} start={t(0, 0.4)} color={C.muted} />
      <TR x={1060} y={108} center tex="\dfrac{575}{1024} = \dfrac{1150}{2048}" size={52} start={t(0, 0.55)} color={f >= t(4, 0) && f < t(7, 0) ? C.red : C.muted} />
      <Chips x={100} y={265} vals={['\\dfrac{793}{2048}', '\\dfrac{1024}{2048}', '\\dfrac{1150}{2048}', '\\dfrac{1255}{2048}', '\\dfrac{1651}{2048}']} start={(i) => t(0, 0.1 + i * 0.1)} pitch={350} size={50} cw={300} state={state} />
      {/* A */}
      <div style={{ position: 'absolute', inset: 0, opacity: wA }}>
        <MiniBars f={f} x={110} base={720} hi={[7, 12]} color={C.red} start={t(1, 0.1)} />
        <TR x={650} y={450} tex="\dfrac{1586}{4096} = \dfrac{793}{2048}" size={60} start={t(1, 0.45)} />
        <Card x={650} y={620} w={760} start={t(1, 0.7)} color={C.red}>forgot &ldquo;exactly 6&rdquo;</Card>
      </div>
      {/* B */}
      <div style={{ position: 'absolute', inset: 0, opacity: wB }}>
        <Card x={110} y={440} w={780} start={t(2, 0.15)} color={C.green}>true for 6 vs 5</Card>
        <div style={{ position: 'absolute', left: 110, top: 570, display: 'flex', alignItems: 'center', gap: 26, whiteSpace: 'nowrap', ...fadeUp(f, t(2, 0.5)) }}>
          <Tex tex="\dfrac{1024}{2048}" size={72} />
          <span style={{ border: `5px dashed ${C.red}`, borderRadius: 18, padding: '4px 22px' }}><Tex tex="+\,231" size={72} color={C.red} /></span>
          <span style={{ fontSize: 44, fontWeight: 800, color: C.red }}>missing tie wins</span>
        </div>
      </div>
      {/* E */}
      <div style={{ position: 'absolute', inset: 0, opacity: wE }}>
        <MiniBars f={f} x={110} base={720} hi={[5, 12]} color={C.red} start={t(3, 0.1)} />
        <TR x={650} y={450} tex="\dbinom{12}{5} = 792" size={50} start={t(3, 0.3)} />
        <TR x={650} y={620} tex="2510 + 792 = 3302" size={54} start={t(3, 0.45)} />
        <TR x={1340} y={455} tex="\dfrac{3302}{4096}" size={56} start={t(3, 0.62)} />
        <TR x={1340} y={620} tex="= \dfrac{1651}{2048}" size={56} start={t(3, 0.75)} />
        <Card x={650} y={760} w={760} start={t(3, 0.8)} color={C.red} size={40}>counted a tie as a win</Card>
      </div>
      {/* C */}
      <div style={{ position: 'absolute', inset: 0, opacity: wC }}>
        <Stage>
          {range(5).map((i) => <FC key={`a${i}`} f={f} x={330 + i * 90} y={470} rim={ANN} from={SA[i]} op={ease(f, t(4, 0.5) + i * 3, 10)} />)}
          {range(7).map((j) => {
            const isSpare = j >= 5;
            const gl = isSpare ? comeback * (0.6 + 0.4 * Math.sin(f / 5)) : 0;
            return <FC key={`b${j}`} f={f} x={330 + j * 90} y={600} rim={isSpare ? GOLD : BOB} from={isSpare && f >= t(6, 0.1) ? 'H' : SB[j]} op={ease(f, t(4, 0.65) + j * 3, 10)} glow={gl} />;
          })}
        </Stage>
        <RowLabel x={60} y={440} color={ANN} start={t(4, 0.5)} w={260}>Ann (5)</RowLabel>
        <RowLabel x={60} y={570} color={BOB} start={t(4, 0.65)} w={260}>Bob (7)</RowLabel>
        <Text x={spare(0) * 90 + 330 - 60} y={650} w={330} size={38} weight={800} color="#b36b00" style={{ ...fadeUp(f, t(5, 0.0)), whiteSpace: 'nowrap' }}>2 spares</Text>
        <Text x={330 - 35} y={650} w={420} size={38} weight={800} color={BOB} style={{ ...fadeUp(f, t(5, 0.0)), whiteSpace: 'nowrap' }}>first 5 race Ann</Text>
        <Card x={1060} y={440} w={800} start={t(5, 0.2)} color={C.green} size={40}>ahead → win</Card>
        <Card x={1060} y={530} w={800} start={t(5, 0.45)} color={GOLD} size={40}>tie → needs a head from the 2 spares</Card>
        <Card x={1060} y={690} w={800} start={t(5, 0.7)} color={C.red} size={40} op={1 - comeback}>behind by 1 → ✗ (forgot!)</Card>
        <Card x={1060} y={690} w={800} start={t(6, 0.1)} color={C.green} size={40} op={comeback}>behind by 1 + both spares H → win!</Card>
        <div style={{ opacity: sp }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, opacity: w7 }}>
        <div style={{ fontSize: 76, fontWeight: 900 }}>Does a tie count?</div>
        <div style={{ display: 'flex', gap: 80, alignItems: 'center', fontSize: 56, fontWeight: 800 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}><Tex tex=">" size={110} color={C.green} /> more than</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}><Tex tex="\ge" size={110} color={C.red} /> at least</span>
        </div>
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  return (
    <>
      <QCard w={1500} size={50} style={fadeUp(f, 6)}>
        Ann flips <b>3</b> fair coins, and Bob flips <b>5</b> fair coins. What is the probability that Bob gets more heads?
      </QCard>
      <NeutralRows f={f} ax={400} ay={540} bx={400} by={680} na={3} nb={5} pitch={100} r={38} aStart={t(0, 0.4)} bStart={t(0, 0.8)} />
      <RowLabel x={100} y={505} color={ANN} start={t(0, 0.4)} w={280}>Ann (3)</RowLabel>
      <RowLabel x={100} y={645} color={BOB} start={t(0, 0.8)} w={280}>Bob (5)</RowLabel>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const end = at(scene, 4, 1) - 8;
  const merge = ease(f, t(0, 0.62), 34);
  const rowsO = out(f, t(1, 0.0), 12);
  const hi = ease(f, t(3, 0.1), 12);
  const BX = 90;
  const BP = 72;
  const BB = 640;
  const colorOf = (k: number) => (k === 4 ? C.primary : PILE);
  const ansO = ease(f, t(4, 0.45), 14);
  const dimAll = 1 - ansO;
  const vflip = (i: number) => t(0, 0.12 + i * 0.12);
  return (
    <>
      <div style={{ opacity: rowsO }}>
        <Stage>
          {VA.map((fc, i) => <FC key={`a${i}`} f={f} x={lerp(160 + i * 90, 130 + i * 90, merge)} y={lerp(300, 420, merge)} rim={ANN} from={fc} to={opp(fc)} start={vflip(i)} dur={22} />)}
          {VB.map((fc, j) => <FC key={`b${j}`} f={f} x={lerp(160 + j * 90, 130 + (3 + j) * 90, merge)} y={lerp(470, 420, merge)} rim={BOB} from={fc} />)}
        </Stage>
        <div style={{ opacity: 1 - merge }}>
          <RowLabel x={100} y={190} color={ANN} w={300} start={4}>Ann (3)</RowLabel>
          <RowLabel x={100} y={385} color={BOB} w={300} start={4}>Bob (5)</RowLabel>
        </div>
        <Text x={95} y={490} w={760} size={44} weight={800} color={C.muted} style={{ opacity: merge, whiteSpace: 'nowrap' }}>8 coins in one row</Text>
      </div>
      <div style={{ opacity: dimAll }}>
        <TR x={900} y={150} tex="B > 3 - T \Rightarrow B + T \ge 4" size={56} start={t(0, 0.45)} op={rowsO} />
        <Text x={900} y={245} w={900} size={50} weight={900} color="#0a8a5c" style={{ ...fadeUp(f, t(0, 0.8)), opacity: rowsO, whiteSpace: 'nowrap' }}>at least 4 heads of 8</Text>
        <Stage>
          <g opacity={ease(f, t(1, 0.05), 10)}>
            <Bars f={f} n={8} x0={BX} base={BB} pitch={BP} w={60} maxH={360} color={(k) => (k === 4 ? C.primary : PILE)} rise={(k) => ease(f, t(1, 0.1) + k * 3, 16)} op={(k) => (k >= 4 || f < t(3, 0.1) ? 1 : 1 - 0.7 * hi)} />
          </g>
          {hi > 0 && <rect x={BX + 4 * BP - 10} y={235} width={5 * BP + 4 - 0 + 10} height={BB + 10 - 235} rx={20} fill="none" stroke={C.green} strokeWidth={8} opacity={hi} />}
        </Stage>
        {range(9).map((k) => {
          void k;
          return null;
        })}
        <Text x={BX + 4 * BP - 60} y={BB + 20} w={180} size={40} weight={800} color={C.primary} style={{ ...fadeUp(f, t(1, 0.5)), whiteSpace: 'nowrap' }}>exactly 4</Text>
        <TR x={900} y={150} tex="2^8 = 256" size={60} start={t(1, 0.15)} op={1 - rowsO} />
        <TR x={900} y={250} tex="\dbinom84=\dfrac{8\cdot7\cdot6\cdot5}{4\cdot3\cdot2\cdot1}=70" size={50} start={t(1, 0.6)} />
        <TR x={900} y={420} tex="256 - 70 = 186" size={58} start={t(2, 0.25)} />
        <TR x={900} y={510} tex="186 \div 2 = 93" size={58} start={t(2, 0.55)} />
        <TR x={900} y={620} tex="70 + 93 = 163" size={62} start={t(3, 0.45)} color="#0a8a5c" />
        <Text x={BX + 1.5 * BP + 30} y={250} w={300} size={76} weight={900} color={C.violet} align="center" style={{ ...fadeUp(f, t(2, 0.6)), opacity: ease(f, t(2, 0.6), 10) * (1 - 0.7 * hi) }}>93</Text>
        <Text x={BX + 6.5 * BP + 30} y={250} w={300} size={76} weight={900} color={C.violet} align="center" style={fadeUp(f, t(2, 0.6))}>93</Text>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', opacity: ansO, transform: `scale(${0.85 + 0.15 * ansO})` }}>
        <Tex tex="\dfrac{163}{256}" size={160} color="#0a8a5c" />
      </div>
      <Chime start={end} />
      <Confetti x={960} y={430} start={end + 6} seed={5} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const o = out(f, t(2, 0), 12);
  return (
    <>
      <div style={{ opacity: o }}>
        <Text x={60} y={130} w={1800} size={72} weight={900} color={C.primary} style={fadeUp(f, 6)}>The big idea</Text>
        <Stage>
          <LoopCoin f={f} x={330} y={470} r={110} start={t(0, 0.1)} op={ease(f, t(0, 0.05), 10)} />
          <g opacity={ease(f, t(1, 0.3), 4)}><Bars f={f} n={12} x0={1320} base={640} pitch={40} w={32} maxH={240} color={(k) => (k === 6 ? C.primary : PILE)} rise={(k) => ease(f, t(1, 0.35) + k * 2, 16)} op={(k) => (k >= 6 ? 1 : 0.35)} /></g>
        </Stage>
        <Text x={330} y={620} w={460} size={64} weight={900} color={C.ink} align="center" style={{ ...fadeUp(f, t(0, 0.45)), whiteSpace: 'nowrap' }}>fair stays fair</Text>
        <div style={{ position: 'absolute', left: 640, top: 280, whiteSpace: 'nowrap', fontSize: 52, fontWeight: 900, lineHeight: 1.35, ...fadeUp(f, t(1, 0.1)) }}>
          <div>5 vs 7 coins</div>
          <div style={{ color: '#0a8a5c' }}>→ at least 6 heads</div>
          <div style={{ color: '#0a8a5c', paddingLeft: 56 }}>of 12 coins</div>
        </div>
        <Stage><Bracket x1={1320 + 6 * 40} x2={1320 + 12 * 40 + 32} y={680} opacity={ease(f, t(1, 0.7), 10)} /></Stage>
        <Text x={1320 + 6 * 40} y={690} w={400} size={40} weight={800} color="#0a8a5c" style={{ ...fadeUp(f, t(1, 0.75)), whiteSpace: 'nowrap' }}>Bob wins</Text>
      </div>
      <SignOff start={t(2, 0.1)} />
      <Confetti x={960} y={380} start={t(2, 0.25)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, false),
  'sol1-flip': Sol1Flip,
  'sol1-piles': Sol1Piles,
  'sol1-answer': Sol1Answer,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

void clamp;
void (null as unknown as Scene);
export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-01-coin-flip-race-thumb`, render.sh → poster.jpg): Ann's 5 and Bob's 7 unflipped coins, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>1/2?</span>]}>
    <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
      <text x={340} y={130} fontFamily={NUNITO} fontWeight={900} fontSize={64} textAnchor="middle" fill={ANN}>Ann: 5 coins</text>
      {range(5).map((i) => <FC key={`a${i}`} f={0} x={340 + (i - 2) * 124} y={235} r={52} rim={ANN} from="N" />)}
      <text x={340} y={400} fontFamily={NUNITO} fontWeight={900} fontSize={64} textAnchor="middle" fill={BOB}>Bob: 7 coins</text>
      {range(7).map((i) => <FC key={`b${i}`} f={0} x={340 + (i - 3) * 94} y={505} r={40} rim={BOB} from="N" />)}
    </svg>
  </ThumbFrame>
);

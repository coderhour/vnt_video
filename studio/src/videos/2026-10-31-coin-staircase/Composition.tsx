import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, XMark } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-coin-staircase';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const HC = C.primary; // heads
export const TC = C.violet; // tails
const GOLD = C.amber;
const GOLD_D = '#b36b00';

// ---------- staircase geometry ----------

export type Geo = { ox: number; y0: number; w: number; h: number };
const BIG: Geo = { ox: 960, y0: 740, w: 110, h: 62 };
const LAD: Geo = { ox: 50, y0: 690, w: 120, h: 56 };
const SMALL: Geo = { ox: 790, y0: 730, w: 76, h: 48 };
const INTRO_G: Geo = { ox: 440, y0: 750, w: 130, h: 72 };
export const cx = (g: Geo, n: number) => g.ox + n * g.w + g.w / 2;
export const ty = (g: Geo, n: number) => g.y0 - n * g.h;
export const rad = (g: Geo) => Math.round(g.w * 0.27);
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const Stairs: React.FC<{ g: Geo; gold?: number; goldP?: number; op?: number }> = ({ g, gold = 5, goldP = 0, op = 1 }) => (
  <Stage>
    <g opacity={op}>
      {range(8).map((n) => {
        const x = g.ox + n * g.w;
        const y = ty(g, n);
        const isG = n === gold && goldP > 0;
        return (
          <g key={n}>
            <rect x={x} y={y} width={g.w} height={g.y0 + 16 - y} fill={n === 0 ? '#d9efe3' : '#e8ebf4'} stroke="#c3cadb" strokeWidth={3} />
            {isG && <rect x={x} y={y} width={g.w} height={g.y0 + 16 - y} fill={GOLD} fillOpacity={0.5 * goldP} stroke={GOLD} strokeWidth={6 * goldP} />}
            <rect x={x} y={y} width={g.w} height={10} fill={n === 0 ? '#8fd3ae' : isG ? GOLD : '#b4bcd3'} />
            <text x={x + g.w / 2} y={g.y0 + 16 + 46} fontFamily={NUNITO} fontWeight={900} fontSize={50} textAnchor="middle" fill={isG ? GOLD_D : C.ink}>
              {n}
            </text>
          </g>
        );
      })}
    </g>
  </Stage>
);

// ---------- Pia and the coin ----------

type Hop = { at: number; from: number; to: number; dur?: number; tele?: boolean };

const piaAt = (g: Geo, hops: Hop[], f: number) => {
  const R = rad(g);
  const first = hops.length ? hops[0].from : 0;
  let x = cx(g, first);
  let y = ty(g, first) - R;
  for (const h of hops) {
    if (f < h.at) break;
    const d = h.tele ? 0 : h.dur ?? 16;
    const t = d === 0 ? 1 : cl((f - h.at) / d);
    const e = t * t * (3 - 2 * t);
    x = cx(g, h.from) + (cx(g, h.to) - cx(g, h.from)) * e;
    y = ty(g, h.from) - R + (ty(g, h.to) - ty(g, h.from)) * e - (d === 0 ? 0 : Math.sin(Math.PI * t) * (50 + 18 * Math.abs(h.to - h.from)));
  }
  return { x, y };
};

export const Token: React.FC<{ x: number; y: number; r: number; label?: number }> = ({ x, y, r, label = 0 }) => (
  <>
    <Stage>
      <g opacity={1}>
        <ellipse cx={x} cy={y + r + 2} rx={r * 0.8} ry={5} fill="rgba(30,40,80,0.15)" />
        <circle cx={x} cy={y} r={r} fill={C.violet} stroke="#fff" strokeWidth={5} />
        <circle cx={x - r * 0.33} cy={y - r * 0.15} r={r * 0.2} fill="#fff" />
        <circle cx={x + r * 0.33} cy={y - r * 0.15} r={r * 0.2} fill="#fff" />
        <circle cx={x - r * 0.28} cy={y - r * 0.12} r={r * 0.09} fill={C.ink} />
        <circle cx={x + r * 0.38} cy={y - r * 0.12} r={r * 0.09} fill={C.ink} />
        <path d={`M ${x - r * 0.3} ${y + r * 0.3} Q ${x} ${y + r * 0.55} ${x + r * 0.3} ${y + r * 0.3}`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    </Stage>
    {label > 0 && (
      <div style={{ position: 'absolute', left: x - 80, width: 160, top: y - r - 58, textAlign: 'center', fontSize: 42, fontWeight: 900, color: C.violet, opacity: label }}>Pia</div>
    )}
  </>
);

type CoinEv = { at: number; face: 'H' | 'T' };
const coinFromHops = (hops: Hop[]): CoinEv[] => hops.filter((h) => !h.tele).map((h) => ({ at: h.at - 2, face: h.to - h.from === 1 ? 'H' : 'T' }));

const Coin: React.FC<{ x: number; y: number; f: number; ev: CoinEv[]; r?: number; op?: number }> = ({ x, y, f, ev, r = 46, op = 1 }) => {
  if (op <= 0) return null;
  let face: string | null = null;
  let fl = -1;
  let other = 'T';
  for (const e of ev) {
    if (f >= e.at) face = e.face;
    else {
      if (f > e.at - 16) {
        fl = (f - (e.at - 16)) / 16;
        face = e.face;
        other = e.face === 'H' ? 'T' : 'H';
      }
      break;
    }
  }
  const sx = fl >= 0 ? Math.cos(fl * Math.PI * 4) : 1;
  const letter = fl >= 0 ? (sx > 0 ? face : other) : face ?? '?';
  const dy = fl >= 0 ? -Math.sin(fl * Math.PI) * 36 : 0;
  const col = letter === 'H' ? '#0a8a5c' : letter === 'T' ? '#5a3fd6' : GOLD_D;
  return (
    <Stage>
      <g opacity={op} transform={`translate(${x} ${y + dy}) scale(${Math.max(0.04, Math.abs(sx))} 1)`}>
        <circle r={r} fill="#ffd978" stroke="#e0a300" strokeWidth={6} />
        <circle r={r - 11} fill="none" stroke="#e8b52e" strokeWidth={3} />
        <text y={1} fontFamily={NUNITO} fontWeight={900} fontSize={58} textAnchor="middle" dominantBaseline="central" fill={col}>
          {letter}
        </text>
      </g>
    </Stage>
  );
};

/** Curved hop arrow from step a to step b. */
export const Arc: React.FC<{ g: Geo; a: number; b: number; color: string; p: number; label?: string; lift?: number; op?: number; dash?: boolean; lw?: number; ldx?: number }> = ({ g, a, b, color, p, label, lift, op = 1, dash, lw = 7, ldx = 0 }) => {
  if (p <= 0 || op <= 0) return null;
  const R = rad(g);
  const x1 = cx(g, a);
  const y1 = ty(g, a) - R;
  const x2 = cx(g, b);
  const y2 = ty(g, b) - R * 0.5;
  const L = lift ?? 110 + 22 * Math.abs(b - a);
  const xc = (x1 + x2) / 2;
  const yc = Math.min(y1, y2) - L;
  const qx = 0.25 * x1 + 0.5 * xc + 0.25 * x2;
  const qy = 0.25 * y1 + 0.5 * yc + 0.25 * y2;
  const dx = x2 - xc;
  const dy = y2 - yc;
  const n = Math.hypot(dx, dy);
  const ux = dx / n;
  const uy = dy / n;
  const head = [
    [x2, y2],
    [x2 - ux * 26 - uy * 15, y2 - uy * 26 + ux * 15],
    [x2 - ux * 26 + uy * 15, y2 - uy * 26 - ux * 15],
  ]
    .map((q) => q.join(' '))
    .join(' ');
  return (
    <Stage>
      <g opacity={op}>
        <path d={`M ${x1} ${y1} Q ${xc} ${yc} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={lw} strokeLinecap="round" pathLength={1} strokeDasharray={dash ? '0.03 0.025' : 1} strokeDashoffset={dash ? 0 : 1 - p} opacity={dash ? p : 1} />
        {p > 0.96 && <polygon points={head} fill={color} />}
        {label && (
          <text x={qx + ldx} y={qy - 16} fontFamily={NUNITO} fontWeight={900} fontSize={52} textAnchor="middle" fill={color} stroke={C.bg} strokeWidth={9} paintOrder="stroke" opacity={cl((p - 0.4) / 0.4)}>
            {label}
          </text>
        )}
      </g>
    </Stage>
  );
};

// ---------- small shared bits ----------

const LAB: Record<number, string> = { 0: '1', 1: '\\dfrac{1}{2}', 2: '\\dfrac{3}{4}', 3: '\\dfrac{5}{8}', 4: '\\dfrac{11}{16}', 5: '\\dfrac{21}{32}', 6: '\\dfrac{43}{64}' };

/** Probability labels sitting on top of the steps. */
const Labels: React.FC<{ g: Geo; items: [number, number][]; color?: string }> = ({ g, items, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.map(([n, start]) => {
        const p = ease(f, start, 12);
        if (p <= 0) return null;
        return (
          <div key={n} style={{ position: 'absolute', left: cx(g, n) - g.w / 2, width: g.w, top: ty(g, n) - 128, height: 116, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, whiteSpace: 'nowrap' }}>
            <Tex tex={LAB[n]} size={56} color={color} />
          </div>
        );
      })}
    </>
  );
};

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string; op?: number }> = ({ x = 1060, y, start, tex, size = 56, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** A ladder row: label, expression part, then the result part (shown later). */
const LRow: React.FC<{ y: number; label: string; a?: string; aStart?: number; b: string; bStart: number; note?: string; op?: number; x?: number; hh?: number }> = ({ y, label, a, aStart, b, bStart, note, op = 1, x = 1060, hh = 140 }) => {
  const f = useCurrentFrame();
  aStart = aStart ?? bStart;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', height: hh, opacity: op }}>
      <div style={{ width: 150, fontSize: 40, fontWeight: 800, color: C.muted, ...fadeUp(f, aStart) }}>{label}</div>
      {a && (
        <div style={fadeUp(f, aStart)}>
          <Tex tex={a} size={50} />
        </div>
      )}
      <div style={fadeUp(f, bStart)}>
        <Tex tex={b} size={58} color={C.ink} />
      </div>
      {note && <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, ...fadeUp(f, bStart) }}>{note}</div>}
    </div>
  );
};

const Card: React.FC<{ x?: number; y: number; w?: number; start: number; color?: string; op?: number; children: React.ReactNode }> = ({ x = 1060, y, w = 800, start, color = C.primary, op = 1, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '12px 28px', fontSize: 42, fontWeight: 800, lineHeight: 1.25, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 20, ...s, opacity: (s.opacity as number) * op }}>
      {children}
    </div>
  );
};

type ChipKind = 1 | 2 | 'j';
const ChipRow: React.FC<{ x: number; y: number; items: ChipKind[]; start: number; stagger?: number; bar?: string; op?: number }> = ({ x, y, items, start, stagger = 5, bar, op = 1 }) => {
  const f = useCurrentFrame();
  if (f < start || op <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 8, alignItems: 'center', opacity: op }}>
      {bar && <div style={{ width: 8, height: 66, borderRadius: 4, background: bar, marginRight: 8 }} />}
      {items.map((k, i) => {
        const s = f < start + i * stagger ? 0 : pop(f, start + i * stagger);
        const st: React.CSSProperties =
          k === 1
            ? { background: '#fff', border: `3px solid ${HC}`, color: HC }
            : k === 2
              ? { background: TC, border: `3px solid ${TC}`, color: '#fff' }
              : { background: C.red, border: `3px solid ${C.red}`, color: '#fff', marginLeft: 18 };
        return (
          <div key={i} style={{ width: 62, height: 66, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, transform: `scale(${s})`, ...st }}>
            {k === 'j' ? 2 : k}
          </div>
        );
      })}
    </div>
  );
};

export const CHOICES = ['\\dfrac{1}{2}', '\\dfrac{8}{13}', '\\dfrac{5}{8}', '\\dfrac{21}{32}', '\\dfrac{11}{16}'];
type Tone = 'n' | 'red' | 'green';
const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; tone?: (i: number) => Tone; focus?: (i: number) => number; dim?: number }> = ({ x, y, start, tone = () => 'n', focus = () => 0, dim = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 14, opacity: dim }}>
      {CHOICES.map((c, i) => {
        const t = tone(i);
        const fo = focus(i);
        const border = t === 'red' ? C.red : t === 'green' ? C.green : C.line;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), background: t === 'red' ? '#fdeeee' : t === 'green' ? '#e6f8ec' : C.card, border: `5px solid ${border}`, borderRadius: 18, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: fo > 0 ? `0 0 0 ${8 * fo}px ${t === 'green' ? 'rgba(33,196,93,0.3)' : 'rgba(239,67,67,0.25)'}` : '0 4px 14px rgba(30,40,80,0.07)', transform: `translateY(${(1 - ease(f, start(i), 10)) * 24 - fo * 6}px) scale(${1 + 0.06 * fo})` }}>
            <span style={{ color: C.muted, fontSize: 40, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={56} />
          </div>
        );
      })}
    </div>
  );
};

const ease2 = (f: number, start: number) => 1 - ease(f, start, 10);

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

const Chime: React.FC<{ start: number }> = ({ start }) => (
  <Sequence from={start} durationInFrames={60} layout="none">
    <Audio src={CHIME} volume={0.3} />
  </Sequence>
);

/** Round answer badge with a real fraction in it. */
const Badge: React.FC<{ x: number; y: number; tex: string; start: number }> = ({ x, y, tex, start }) => {
  const f = useCurrentFrame();
  const s = f < start ? 0 : pop(f, start);
  if (s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - 125, top: y - 125, width: 250, height: 250, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
      <Tex tex={tex} size={96} color="#fff" />
    </div>
  );
};

const QCard: React.FC<{ x?: number; y?: number; w?: number; size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ x = 60, y = 130, w = 840, size = 42, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 30, padding: '26px 40px', fontSize: size, fontWeight: 600, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...style }}>{children}</div>
);

const HChip: React.FC<{ k: 'H' | 'T'; size?: number }> = ({ k, size = 64 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: k === 'H' ? HC : TC, color: '#fff', fontSize: size * 0.72, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k}</div>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = INTRO_G;
  const hops: Hop[] = [
    { at: at(scene, 0, 0.25), from: 0, to: 1 },
    { at: at(scene, 0, 0.45), from: 1, to: 3 },
    { at: at(scene, 0, 0.62), from: 3, to: 4 },
    { at: at(scene, 1, 0.2), from: 4, to: 5 },
    { at: at(scene, 1, 0.45), from: 5, to: 4, tele: true },
    { at: at(scene, 1, 0.62), from: 4, to: 6 },
  ];
  const pia = piaAt(g, hops, f);
  const goldP = ease(f, at(scene, 0, 0.7), 14);
  const jump = hops[5].at;
  const out = fadeTo(f, at(scene, 2, 0), 1, 10);
  return (
    <>
      <Stairs g={g} gold={5} goldP={goldP} />
      <Arc g={g} a={4} b={6} color={C.red} p={ease(f, jump, 16)} dash lift={140} label="whoosh!" op={out} />
      <Token x={pia.x} y={pia.y} r={rad(g)} />
      <Coin x={cx(g, 1) + 20} y={ty(g, 5) - 30} f={f} ev={coinFromHops(hops)} op={ease(f, 4, 10)} />
      <div style={{ position: 'absolute', left: 60, top: 210, ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 120, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const QSPAN = 'Pia climbs a long staircase. Before each move, she flips a fair coin. ';

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const arcOut = fadeTo(f, at(scene, 4, 0.05), 0, 12);
  const ev: CoinEv[] = [
    { at: at(scene, 2, 0.45), face: 'H' },
    { at: at(scene, 3, 0.45), face: 'T' },
  ];
  return (
    <>
      <QCard y={130} style={{ minHeight: 330, opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>{QSPAN}</span>
        <span style={s(2)}>On heads she goes up 1 step, </span>
        <span style={s(3)}>and on tails she goes up 2 steps. </span>
        <span style={s(4)}>
          What is the probability that she stands on <Mark on={at(scene, 4, 0.6)}>step 5</Mark>?
        </span>
      </QCard>
      <Stairs g={g} gold={5} goldP={ease(f, at(scene, 4, 0.65), 14)} op={ease(f, at(scene, 1), 12)} />
      <Arc g={g} a={0} b={1} color={HC} p={ease(f, at(scene, 2, 0.5), 14)} label="H: +1" lift={60} ldx={-95} op={arcOut} />
      <Arc g={g} a={0} b={2} color={TC} p={ease(f, at(scene, 3, 0.5), 14)} label="T: +2" lift={150} ldx={40} op={arcOut} />
      <Fade op={ease(f, at(scene, 1), 12)}>
        <Token x={cx(g, 0)} y={ty(g, 0) - rad(g)} r={rad(g)} label={ease(f, at(scene, 1, 0.3), 10) * fadeTo(f, at(scene, 2, 0.3), 0, 8)} />
      </Fade>
      <Coin x={cx(g, 1) + 40} y={ty(g, 5) - 40} f={f} ev={ev} op={ease(f, at(scene, 1, 0.4), 10)} />
      <ChoiceRow x={60} y={590} start={(i) => at(scene, 5, 0.15 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  const greenOp = fadeTo(f, at(scene, 2, 0.6), 0.22, 12);
  return (
    <>
      <Stairs g={g} gold={5} goldP={ease(f, at(scene, 2, 0.1), 14)} />
      <Token x={cx(g, 0)} y={ty(g, 0) - rad(g)} r={rad(g)} label={fadeTo(f, at(scene, 2, 0.2), 0, 8)} />
      <Arc g={g} a={0} b={1} color={HC} p={ease(f, at(scene, 2, 0.25), 10)} label="1" op={greenOp} />
      <Arc g={g} a={1} b={3} color={TC} p={ease(f, at(scene, 2, 0.32), 10)} label="2" op={greenOp} />
      <Arc g={g} a={3} b={5} color={TC} p={ease(f, at(scene, 2, 0.4), 10)} label="2" op={greenOp} />
      <Arc g={g} a={0} b={2} color={C.red} p={ease(f, at(scene, 2, 0.62), 10)} label="2" lift={150} />
      <Arc g={g} a={2} b={4} color={C.red} p={ease(f, at(scene, 2, 0.7), 10)} label="2" lift={150} />
      <Arc g={g} a={4} b={6} color={C.red} p={ease(f, at(scene, 2, 0.78), 10)} label="2" lift={150} />
      <div style={{ position: 'absolute', left: 60, top: 130, ...fadeUp(f, at(scene, 0, 0.3)) }}>
        <Pill x={0} y={0} color={C.primary} style={{ position: 'relative', fontSize: 44 }}>Start: step 0, the ground</Pill>
      </div>
      <Card x={60} y={240} w={420} start={at(scene, 1, 0.3)} color={HC}>
        <HChip k="H" />
        <span>up 1 step</span>
        <Tex tex="\dfrac{1}{2}" size={56} />
      </Card>
      <Card x={500} y={240} w={440} start={at(scene, 1, 0.65)} color={TC}>
        <HChip k="T" />
        <span>up 2 steps</span>
        <Tex tex="\dfrac{1}{2}" size={56} />
      </Card>
      <Pill x={60} y={440} color={GOLD} style={{ ...fadeUp(f, at(scene, 2, 0.05)), fontSize: 42, color: '#4a3000' }}>Goal: stand on step 5</Pill>
      <Card x={60} y={560} w={800} start={at(scene, 2, 0.25)} color={C.green}>
        <ChipInline items={[1, 2, 2]} />
        <span style={{ color: C.green }}>lands on 5</span>
      </Card>
      <Card x={60} y={680} w={800} start={at(scene, 2, 0.6)} color={C.red}>
        <ChipInline items={[2, 2, 'j']} />
        <span style={{ color: C.red }}>jumps 4 → 6</span>
      </Card>
    </>
  );
};

const ChipInline: React.FC<{ items: ChipKind[] }> = ({ items }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {items.map((k, i) => (
      <div key={i} style={{ width: 62, height: 66, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, ...(k === 1 ? { background: '#fff', border: `3px solid ${HC}`, color: HC } : k === 2 ? { background: TC, border: `3px solid ${TC}`, color: '#fff' } : { background: C.red, border: `3px solid ${C.red}`, color: '#fff' }) }}>
        {k === 'j' ? 2 : k}
      </div>
    ))}
  </div>
);

const QALL = <>Pia climbs a long staircase. Before each move, she flips a fair coin. On heads she goes up 1 step, and on tails she goes up 2 steps. What is the probability that she stands on step {'{N}'}?</>;

const makePause = (seconds: number, n: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  const g = SMALL;
  return (
    <>
      <QCard w={680} size={40} style={{ ...fadeUp(f, 6) }}>
        Pia climbs a long staircase. Before each move, she flips a fair coin. On heads she goes up 1 step, and on tails she goes up 2 steps. What is the probability that she stands on step {n}?
      </QCard>
      <Stairs g={g} gold={n} goldP={ease(f, 8, 14)} />
      <Token x={cx(g, 0)} y={ty(g, 0) - rad(g)} r={rad(g)} />
      <Coin x={cx(g, 1) + 40} y={ty(g, 5) - 40} f={f} ev={[]} />
      <Countdown scene={scene} seconds={seconds} x={1660} y={500} tick={TICK} />
    </>
  );
};
void QALL;

const GCOL = { a: '#2f6fe0', b: '#e08600', c: '#c13fa5' };
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const G2 = [[2, 1, 1, 1], [1, 2, 1, 1], [1, 1, 2, 1], [1, 1, 1, 2]] as ChipKind[][];
  const G3 = [[2, 2, 1], [2, 1, 2], [1, 2, 2]] as ChipKind[][];
  const rowY = (i: number) => 335 + i * 92;
  const flipTag = (x: number, y: number, n: number, start: number) => (
    <div style={{ position: 'absolute', left: x, top: y, height: 66, display: 'flex', alignItems: 'center', fontSize: 48, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>{n} flips</div>
  );
  const brace = (x: number, y: number, h: number, c: string, start: number) => (
    <div style={{ position: 'absolute', left: x, top: y, width: 20, height: h, borderStyle: 'solid', borderColor: c, borderWidth: '6px 6px 6px 0', borderRadius: '0 10px 10px 0', ...fadeUp(f, start) }} />
  );
  return (
    <>
      <Pill x={1000} y={140} color={C.primary} style={{ ...fadeUp(f, at(scene, 0, 0.45)), fontSize: 40 }}>List every way to reach step 5</Pill>
      <div style={{ position: 'absolute', left: 1000, top: 232, display: 'flex', alignItems: 'center', gap: 16, fontSize: 40, fontWeight: 800, ...fadeUp(f, at(scene, 0, 0.7)) }}>
        <ChipInline items={[1]} /> heads
        <span style={{ width: 24 }} />
        <ChipInline items={[2]} /> tails
      </div>
      {/* group 1 */}
      <ChipRow x={60} y={140} items={[1, 1, 1, 1, 1]} start={at(scene, 1, 0.1)} stagger={14} bar={GCOL.a} />
      {flipTag(450, 140, 5, at(scene, 2, 0.05))}
      <Eq x={60} y={212} size={48} start={at(scene, 2, 0.35)} tex={`\\dfrac{1}{2}\\times\\dfrac{1}{2}\\times\\dfrac{1}{2}\\times\\dfrac{1}{2}\\times\\dfrac{1}{2}=${col(GCOL.a, '\\dfrac{1}{32}')}`} />
      {/* group 2 */}
      {G2.map((it, i) => (
        <ChipRow key={i} x={60} y={rowY(i)} items={it} start={at(scene, 3, 0.15 + i * 0.14)} bar={GCOL.b} />
      ))}
      {G2.map((_, i) => flipTag(60 + 8 + 4 * 70 + 30, rowY(i), 4, at(scene, 3, 0.8)))}
      {brace(560, rowY(0), rowY(3) + 66 - rowY(0), GCOL.b, at(scene, 4, 0.35))}
      <Eq x={605} y={rowY(1) + 33 - 62} size={52} start={at(scene, 4, 0.45)} tex={`\\text{each}=${col(GCOL.b, '\\dfrac{1}{16}')}`} />
      {/* group 3 */}
      {G3.map((it, i) => (
        <ChipRow key={i} x={1000} y={rowY(i)} items={it} start={at(scene, 5, 0.12 + i * 0.1)} bar={GCOL.c} />
      ))}
      {G3.map((_, i) => flipTag(1000 + 8 + 3 * 70 + 30, rowY(i), 3, at(scene, 5, 0.45)))}
      {brace(1430, rowY(0), rowY(2) + 66 - rowY(0), GCOL.c, at(scene, 5, 0.75))}
      <Eq x={1475} y={rowY(1) + 33 - 62} size={52} start={at(scene, 5, 0.8)} tex={`\\text{each}=${col(GCOL.c, '\\dfrac{1}{8}')}`} />
    </>
  );
};

const List2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p: number) => at(scene, i, p);
  const Term: React.FC<{ tex: string; start: number }> = ({ tex, start }) => (
    <div style={fadeUp(f, start)}>
      <Tex tex={tex} size={56} />
    </div>
  );
  const sum = (y: number, terms: [string, number][]) => (
    <div style={{ position: 'absolute', left: 1000, top: y, display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', height: 125 }}>
      {terms.map(([tex, s], i) => (
        <Term key={i} tex={tex} start={s} />
      ))}
    </div>
  );
  const summary = (y: number, items: ChipKind[], times: string, c: string, start: number) => (
    <>
      <ChipRow x={60} y={y} items={items} start={start} stagger={3} bar={c} />
      <div style={{ position: 'absolute', left: 60 + 8 + 8 + items.length * 70 + 20, top: y - 4, fontSize: 56, fontWeight: 900, color: c, ...fadeUp(f, start + 6) }}>{times}</div>
    </>
  );
  return (
    <>
      {summary(150, [1, 1, 1, 1, 1], '× 1', GCOL.a, t(0, 0.3))}
      {summary(280, [2, 1, 1, 1], '× 4', GCOL.b, t(0, 0.6))}
      {summary(410, [2, 2, 1], '× 3', GCOL.c, t(0, 0.85))}
      {sum(125, [
        [col(GCOL.a, '\\dfrac{1}{32}'), t(0, 0.25)],
        [col(GCOL.b, '+\\,4\\times\\dfrac{1}{16}'), t(0, 0.5)],
        [col(GCOL.c, '+\\,3\\times\\dfrac{1}{8}'), t(0, 0.8)],
      ])}
      {sum(290, [
        [col(GCOL.a, '\\dfrac{1}{32}'), t(1, 0.25)],
        [col(GCOL.b, '+\\,\\dfrac{8}{32}'), t(1, 0.5)],
        [col(GCOL.c, '+\\,\\dfrac{12}{32}'), t(1, 0.78)],
      ])}
      <Eq x={1000} y={440} start={t(2, 0.08)} tex={'=\\dfrac{1+8+12}{32}'} />
      <Eq x={1000} y={595} start={t(2, 0.5)} tex={'=\\dfrac{21}{32}'} size={64} color={C.green} />
      <ChoiceRow x={60} y={620} start={() => t(3, 0.05)} tone={(i) => (i === 3 && f >= t(3, 0.5) ? 'green' : 'n')} focus={(i) => (i === 3 ? ease(f, t(3, 0.5), 12) : 0)} dim={ease(f, t(3, 0.05), 10)} />
      <Badge x={1660} y={640} tex="\dfrac{21}{32}" start={t(3, 0.55)} />
      <Chime start={t(3, 0.8)} />
      <Confetti x={1660} y={640} start={t(3, 0.8)} seed={5} />
    </>
  );
};

const ArcsInto4: React.FC<{ g: Geo; h: number; t: number; op: number }> = ({ g, h, t, op }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Arc g={g} a={3} b={4} color={HC} p={ease(f, h, 14)} label="H" op={op} lift={90} />
      <Arc g={g} a={2} b={4} color={TC} p={ease(f, t, 14)} label="T" op={op} lift={150} />
    </>
  );
};

const Ladder: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = LAD;
  const t = (i: number, p: number) => at(scene, i, p);
  const arcOp = fadeTo(f, t(2, 0.3), 0, 10);
  const expl = fadeTo(f, t(3, 0.0), 0, 10);
  const cardY = 685 + (122 - 685) * ease(f, t(3, 0), 14);
  return (
    <>
      <Stairs g={g} gold={5} goldP={ease(f, t(0, 0.35), 14)} />
      <ArcsInto4 g={g} h={t(1, 0.3)} t={t(1, 0.55)} op={arcOp} />
      <Labels g={g} items={[[0, t(3, 0.3)], [1, t(3, 0.8)], [2, t(4, 0.75)], [3, t(5, 0.75)], [4, t(6, 0.75)]]} />
      {/* explanation of the two ways in */}
      <div style={{ opacity: expl }}>
        <Card y={135} w={820} start={t(1, 0.25)} color={HC}>
          <HChip k="H" />
          <span>from 1 step below</span>
        </Card>
        <Card y={225} w={820} start={t(1, 0.5)} color={TC}>
          <HChip k="T" />
          <span>from 2 steps below</span>
        </Card>
        <Card y={315} w={820} start={t(1, 0.78)} color={C.muted}>
          <span>each move:</span>
          <Tex tex="\dfrac{1}{2}" size={56} />
        </Card>
        <Eq y={492} size={56} start={t(2, 0.15)} tex={'\\dfrac{1}{2}A+\\dfrac{1}{2}B'} />
        <Eq x={1385} y={492} size={56} start={t(2, 0.65)} tex={'=\\dfrac{A+B}{2}'} />
        <Text x={1060} y={632} w={820} size={40} weight={700} color={C.muted} style={fadeUp(f, t(2, 0.15))}>A, B: the two steps before</Text>
      </div>
      <div style={{ position: 'absolute', left: 1060, top: cardY, width: 820, background: C.card, borderRadius: 22, borderLeft: `12px solid ${C.violet}`, padding: '12px 28px', fontSize: 42, fontWeight: 800, lineHeight: 1.25, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, t(2, 0.8)) }}>
        each step = <span style={{ color: C.violet }}>average</span> of the two steps before it
      </div>
      <LRow y={248} hh={125} label="step 0" b="1" bStart={t(3, 0.3)} />
      <LRow y={248} hh={125} x={1290} label="step 1" b={'\\dfrac{1}{2}'} bStart={t(3, 0.8)} note="needs heads first" />
      <LRow y={388} label="step 2" a={'\\left(\\dfrac{1}{2}+1\\right)\\div 2'} aStart={t(4, 0.3)} b={'=\\dfrac{3}{4}'} bStart={t(4, 0.75)} />
      <LRow y={536} label="step 3" a={'\\left(\\dfrac{3}{4}+\\dfrac{1}{2}\\right)\\div 2'} aStart={t(5, 0.3)} b={'=\\dfrac{5}{8}'} bStart={t(5, 0.75)} />
      <LRow y={684} label="step 4" a={'\\left(\\dfrac{5}{8}+\\dfrac{3}{4}\\right)\\div 2'} aStart={t(6, 0.3)} b={'=\\dfrac{11}{16}'} bStart={t(6, 0.8)} />
    </>
  );
};

const Ladder2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = LAD;
  const t = (i: number, p: number) => at(scene, i, p);
  return (
    <>
      <Stairs g={g} gold={5} goldP={1} />
      <Labels g={g} items={[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, t(1, 0.8)]]} />
      <Eq y={125} start={t(0, 0.4)} size={56} tex={'\\dfrac{5}{8}=\\dfrac{10}{16}'} />
      <Eq y={275} start={t(1, 0.2)} size={50} tex={'\\left(\\dfrac{11}{16}+\\dfrac{10}{16}\\right)\\div 2'} />
      <Eq y={425} start={t(1, 0.8)} size={62} color={C.green} tex={'=\\dfrac{21}{32}'} />
      <Card y={612} w={820} start={t(2, 0.1)} color={C.violet}>
        <span>Ladder: each step = average of the two below</span>
      </Card>
      <Pill x={1060} y={752} color={C.primary} style={{ ...fadeUp(f, t(2, 0.6)), fontSize: 42 }}>Long list? Use the ladder</Pill>
    </>
  );
};

const LAND = [[1, 1, 1, 1, 1], [2, 1, 1, 1], [1, 2, 1, 1], [1, 1, 2, 1], [1, 1, 1, 2], [2, 2, 1], [2, 1, 2], [1, 2, 2]] as ChipKind[][];
const JUMP = [[1, 1, 1, 1, 'j'], [2, 1, 1, 'j'], [1, 2, 1, 'j'], [1, 1, 2, 'j'], [2, 2, 'j']] as ChipKind[][];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p: number) => at(scene, i, p);
  const g = LAD;
  const win = (a: number, b: number) => ease(f, a, 8) * (1 - ease(f, b, 8));
  const focus = (i: number) => (i === 0 ? win(t(1, 0), t(3, 0)) : i === 1 ? win(t(3, 0), t(6, 0)) : i === 2 || i === 4 ? win(t(6, 0), t(7, 0)) : 0);
  const tone = (i: number): Tone => (f < t(0, 0.65) ? 'n' : i === 3 ? 'green' : 'red');
  const listOp = fadeTo(f, t(6, 0), 0, 10);
  const stairIn = ease(f, t(6, 0.0), 12);
  const rowL = (i: number): [number, number] => [i < 4 ? 60 : 600, 375 + (i % 4) * 70];
  return (
    <>
      <ChoiceRow x={60} y={120} start={(i) => t(0, 0.2 + i * 0.1)} tone={tone} focus={focus} />
      {/* A */}
      <div style={{ opacity: fadeTo(f, t(3, 0), 0, 10) }}>
        <Card x={60} y={310} w={900} start={t(1, 0.4)} color={C.red}>
          <span>Land or skip: half and half?</span>
        </Card>
        <Card x={60} y={420} w={900} start={t(2, 0.2)} color={TC}>
          <HChip k="T" />
          <span>Skip step 5 only from step 4, with tails</span>
        </Card>
        <Text x={60} y={560} w={900} size={48} weight={900} color={C.green} style={fadeUp(f, t(2, 0.7))}>So landing is more likely</Text>
      </div>
      {/* B: the lists */}
      <Fade op={listOp}>
        <Text x={60} y={310} w={800} size={44} weight={900} color={C.green} style={fadeUp(f, t(4, 0.08))}>lands on 5: 8 climbs</Text>
        {LAND.map((it, i) => (
          <ChipRow key={i} x={rowL(i)[0]} y={rowL(i)[1]} items={it} start={t(4, 0.12 + i * 0.05)} stagger={2} />
        ))}
        <Text x={1000} y={310} w={860} size={44} weight={900} color={C.red} style={fadeUp(f, t(4, 0.5))}>jumps 4 → 6: 5 climbs</Text>
        {JUMP.map((it, i) => (
          <ChipRow key={i} x={1000} y={375 + i * 70} items={it} start={t(4, 0.55 + i * 0.05)} stagger={2} />
        ))}
        <Text x={1000} y={740} w={860} size={40} weight={700} color={C.muted} style={fadeUp(f, t(4, 0.85))}>first part adds to 4, then a 2</Text>
        <Eq x={60} y={700} size={52} start={t(5, 0.02)} tex="8+5=13" />
        <Eq x={400} y={680} size={52} start={t(5, 0.2)} tex="\dfrac{8}{13}" />
        <Stage>
          <XMark at={[440, 740]} size={110} opacity={ease(f, t(5, 0.32), 8)} />
        </Stage>
        <Text x={525} y={690} w={470} size={44} weight={900} color={C.red} style={fadeUp(f, t(5, 0.34))}>not equally likely</Text>
        <Text x={525} y={745} w={480} size={40} weight={800} color={C.green} style={fadeUp(f, t(5, 0.8))}>fewer flips, more likely</Text>
        <div style={{ position: 'absolute', left: 415, top: 375, height: 66, display: 'flex', alignItems: 'center', fontSize: 48, whiteSpace: 'nowrap', fontWeight: 800, color: C.muted, ...fadeUp(f, t(5, 0.62)) }}>5 flips</div>
        <div style={{ position: 'absolute', left: 820, top: 445, height: 66, display: 'flex', alignItems: 'center', fontSize: 48, whiteSpace: 'nowrap', fontWeight: 800, color: C.green, ...fadeUp(f, t(5, 0.72)) }}>3 flips</div>
      </Fade>
      {/* C and E: steps 3 and 4 */}
      <Stairs g={g} gold={5} goldP={ease(f, t(7, 0.2), 14)} op={stairIn} />
      <Labels g={g} items={[[3, t(6, 0.3)], [4, t(6, 0.6)]]} />
      <Stage>
        <g opacity={ease(f, t(6, 0.45), 10)}>
          <line x1={cx(g, 3)} y1={ty(g, 3) - 140} x2={410} y2={292} stroke={C.red} strokeWidth={5} strokeDasharray="12 10" />
        </g>
        <g opacity={ease(f, t(6, 0.75), 10)}>
          <line x1={cx(g, 4)} y1={ty(g, 4) - 140} x2={715} y2={292} stroke={C.red} strokeWidth={5} strokeDasharray="12 10" />
        </g>
      </Stage>
      <Card y={330} w={820} start={t(6, 0.35)} color={C.red}>
        <span>C: the chance for step 3</span>
      </Card>
      <Card y={440} w={820} start={t(6, 0.68)} color={C.red}>
        <span>E: the chance for step 4</span>
      </Card>
      <Text x={1060} y={560} w={820} size={56} weight={900} color={C.red} style={fadeUp(f, t(7, 0.15))}>Stopped too early!</Text>
      <Pill x={1060} y={670} color={C.primary} style={{ ...fadeUp(f, t(8, 0.3)), fontSize: 42, whiteSpace: 'normal', width: 800, borderRadius: 36, textAlign: 'center' }}>Build each spot&apos;s chance from the spots before it</Pill>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  return (
    <>
      <Pill x={60} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 42 }}>Your turn</Pill>
      <QCard y={230} style={{ minHeight: 200, opacity: ease(f, at(scene, 0, 0.1), 10) }}>
        Same staircase, same fair coin. Heads: up 1 step. Tails: up 2 steps. What is the probability that she stands on <Mark on={at(scene, 1, 0.5)}>step 6</Mark>?
      </QCard>
      <Stairs g={g} gold={6} goldP={ease(f, at(scene, 1, 0.5), 14)} />
      <Token x={cx(g, 0)} y={ty(g, 0) - rad(g)} r={rad(g)} />
      <Coin x={cx(g, 1) + 40} y={ty(g, 5) - 40} f={f} ev={[]} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = LAD;
  const t = (i: number, p: number) => at(scene, i, p);
  const end = at(scene, 2, 0.92);
  return (
    <>
      <Stairs g={g} gold={6} goldP={1} />
      <Labels g={g} items={[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, t(2, 0.8)]]} />
      <Eq y={125} start={t(1, 0.5)} size={56} op={ease2(f, t(3, 0))} tex={'\\dfrac{11}{16}=\\dfrac{22}{32}'} />
      <Eq y={275} start={t(2, 0.3)} size={50} op={ease2(f, t(3, 0))} tex={'\\left(\\dfrac{21}{32}+\\dfrac{22}{32}\\right)\\div 2'} />
      <Eq y={425} start={t(2, 0.8)} size={62} op={ease2(f, t(3, 0))} color={C.green} tex={'=\\dfrac{43}{64}'} />
      <Badge x={250} y={250} tex="\dfrac{43}{64}" start={t(2, 0.82)} />
      <Chime start={end} />
      <Card y={140} w={820} start={t(3, 0.45)} color={C.red}>
        <span>Miss step 6: on step 5, then tails</span>
      </Card>
      <Eq y={260} start={t(4, 0.35)} size={54} tex={'\\dfrac{21}{32}\\times\\dfrac{1}{2}=\\dfrac{21}{64}'} />
      <Eq y={420} start={t(5, 0.25)} size={54} tex={'1-\\dfrac{21}{64}=\\dfrac{43}{64}'} />
      <Check x={1500} y={455} start={t(5, 0.75)}>Matches!</Check>
      <Confetti x={1400} y={600} start={t(6, 0.45)} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = LAD;
  const t = (i: number, p: number) => at(scene, i, p);
  const out = fadeTo(f, t(3, 0.0), 0, 12);
  const arcOp = fadeTo(f, t(2, 0.0), 0, 10);
  return (
    <>
      <Fade op={out}>
        <Stairs g={g} gold={5} goldP={ease(f, t(0, 0.3), 14)} />
        <ArcsInto4 g={g} h={t(1, 0.5)} t={t(1, 0.7)} op={arcOp} />
        <Labels g={g} items={range(6).map((n): [number, number] => [n, t(2, 0.08 + n * 0.12)])} />
        <Text x={1060} y={140} w={820} size={56} weight={900} color={C.primary} style={fadeUp(f, t(0, 0.3))}>The big idea</Text>
        <Card y={250} w={820} start={t(1, 0.25)} color={C.violet}>
          <span>A spot&apos;s chance comes from the spots that lead to it</span>
        </Card>
        <Card y={470} w={820} start={t(2, 0.25)} color={C.primary}>
          <span>Build up one step at a time, then read off the step you need</span>
        </Card>
      </Fade>
      <SignOff start={t(3, 0.1)} />
      <Confetti x={960} y={380} start={t(3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, 5),
  list: List,
  list2: List2,
  ladder: Ladder,
  ladder2: Ladder2,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, 6),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

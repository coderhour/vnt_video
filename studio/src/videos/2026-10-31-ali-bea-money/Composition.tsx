import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-ali-bea-money';
const CHIME = `${SLUG}/sfx/fs-541985.mp3`; // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = `${SLUG}/sfx/fs-668355.mp3`;

const chime = staticFile(CHIME);
const tick = staticFile(TICK);

const ALI = '#0cc281';
const ALI_D = '#079a66';
const BEA = '#7b61ff';
const BEA_D = '#5b43e0';
const COIN = '#f59f0a';

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const cA = (t: string) => col(ALI_D, t);
const cB = (t: string) => col(BEA_D, t);

// ---------- small helpers ----------

const Eq: React.FC<{ x: number; y: number; start: number; tex: string; size?: number; color?: string; op?: number }> = ({ x, y, start, tex, size = 54, color = C.ink, op = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; out?: number }> = ({ x, y, start, color, children, size = 40, out }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), ...(out !== undefined ? { opacity: ease(f, start, 14) * (1 - ease(f, out, 10)) } : {}), fontSize: size, whiteSpace: 'nowrap' }}>
      {children}
    </Pill>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; start: number; color?: string; children: React.ReactNode; op?: number }> = ({ x, y, w, start, color = C.red, children, op = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '10px 28px', fontSize: 48, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      {children}
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

/** Little wallet: a card with the name and an amount (or ?). */
const Wallet: React.FC<{ x: number; y: number; w?: number; h?: number; name: 'Ali' | 'Bea'; amount?: string; start: number; size?: number }> = ({ x, y, w = 330, h = 200, name, amount = '$ ?', start, size = 64 }) => {
  const f = useCurrentFrame();
  const c = name === 'Ali' ? ALI : BEA;
  const cd = name === 'Ali' ? ALI_D : BEA_D;
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 30, background: C.card, border: `8px solid ${c}`, boxShadow: '0 8px 26px rgba(30,40,80,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...s }}>
      <div style={{ fontSize: size, fontWeight: 900, color: cd }}>{name}</div>
      <div style={{ fontSize: size * 0.85, fontWeight: 900, color: C.muted }}>{amount}</div>
    </div>
  );
};

/** Horizontal arrow with an optional coin; dir 1 = right, -1 = left. */
const Arrow: React.FC<{ x: number; y: number; w: number; dir: 1 | -1; color: string; start: number; coin?: boolean }> = ({ x, y, w, dir, color, start, coin }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 18);
  const x1 = dir === 1 ? x : x + w;
  const x2 = dir === 1 ? x + w : x;
  const cx = x1 + (x2 - x1) * p;
  const tip = x2;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: p > 0 ? 1 : 0 }}>
      <line x1={x1} y1={y} x2={x1 + (x2 - x1) * p} y2={y} stroke={color} strokeWidth={12} strokeLinecap="round" />
      {p > 0.95 && <path d={`M${tip - dir * 30} ${y - 26} L${tip} ${y} L${tip - dir * 30} ${y + 26}`} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {coin && (
        <g transform={`translate(${cx} ${y})`}>
          <circle r={26} fill={COIN} stroke="#c97f00" strokeWidth={4} />
          <text y={2} fontSize={30} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="middle">$</text>
        </g>
      )}
    </svg>
  );
};

// ---------- bar model ----------

const PW = 120; // every part is exactly this wide, in every bar
const GP = 6;
const BH = 80;
const X0 = 290;
const px = (i: number) => X0 + i * (PW + GP);
const BLK = 86; // the $10 block: small and fixed, clearly not a part

const Part: React.FC<{ x: number; y: number; color: string; op?: number; dashed?: boolean; lift?: number; glow?: number }> = ({ x, y, color, op = 1, dashed, lift = 0, glow = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y - lift,
      width: PW,
      height: BH,
      borderRadius: 14,
      background: dashed ? 'transparent' : color,
      border: dashed ? `5px dashed ${color}` : undefined,
      boxSizing: 'border-box',
      opacity: op,
      boxShadow: glow > 0 ? `0 0 0 ${8 * glow}px rgba(245,159,10,${0.55 * glow})` : undefined,
    }}
  />
);

const Name: React.FC<{ y: number; name: string; color: string; op?: number }> = ({ y, name, color, op = 1 }) => (
  <div style={{ position: 'absolute', left: 40, top: y, width: X0 - 60, height: BH, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 54, fontWeight: 900, color, opacity: op, whiteSpace: 'nowrap' }}>{name}</div>
);

/** A row of n equal parts that pop in one after another from `start`. */
const Parts: React.FC<{ y: number; n: number; color: string; start: number; step?: number; skip?: number[]; x0?: number; op?: number }> = ({ y, n, color, start, step = 4, skip = [], x0 = X0, op = 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        if (skip.includes(i)) return null;
        const s = pop(f, start + i * step);
        return <Part key={i} x={x0 + i * (PW + GP)} y={y} color={color} op={Math.min(1, s * 2) * op} />;
      })}
    </>
  );
};

const CountLabel: React.FC<{ x: number; y: number; tex: string; start: number; color?: string; size?: number; op?: number }> = ({ x, y, tex, start, color = C.ink, size = 52, op = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, height: BH, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * op }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Dash: React.FC<{ x: number; y1: number; y2: number; op: number }> = ({ x, y1, y2, op }) =>
  op <= 0 ? null : (
    <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: op }}>
      <line x1={x} y1={y1} x2={x} y2={y1 + (y2 - y1) * op} stroke={C.muted} strokeWidth={5} strokeDasharray="12 10" />
    </svg>
  );

const Coin10: React.FC<{ x: number; y: number; op?: number }> = ({ x, y, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y + 8, width: BLK, height: BH - 16, borderRadius: 12, background: COIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, opacity: op, boxShadow: '0 4px 10px rgba(245,159,10,0.4)' }}>$10</div>
);

const Gap10: React.FC<{ x: number; y: number; op?: number }> = ({ x, y, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y + 8, width: BLK, height: BH - 16, borderRadius: 12, border: `4px dashed ${COIN}`, boxSizing: 'border-box', opacity: op, color: COIN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900 }}>−10</div>
);

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Wallet x={200} y={190} name="Ali" start={4} />
      <Wallet x={1390} y={190} name="Bea" start={10} />
      <Arrow x={600} y={260} w={700} dir={1} color={ALI} start={at(scene, 0, 0.25)} coin />
      <Text x={950} y={160} w={100} size={90} weight={900} color={C.ink} align="center" style={fadeUp(f, at(scene, 0, 0.55))}>=</Text>
      <Arrow x={600} y={400} w={700} dir={-1} color={BEA} start={at(scene, 1, 0.1)} coin />
      <Text x={950} y={300} w={200} size={76} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.45))}>×2</Text>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const CH = ['90', '150', '200', '240', '300'];

const Choices: React.FC<{ x: number; y: number; start: (i: number) => number; items: React.ReactNode[] }> = ({ x, y, start, items }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 18 }}>
      {items.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 20px', fontSize: 48, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
          <span style={{ color: C.muted, fontSize: 48, marginRight: 10 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 130, width: 980, minHeight: 440, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>If Ali gives Bea 20% of his money, they will have the same amount. </span>
        <span style={s(2)}>If instead Bea gives Ali $10, Ali will have twice as much as Bea. </span>
        <span style={s(3)}>How many dollars do Ali and Bea have <Mark on={at(scene, 3, 0.5)}>together</Mark>?</span>
      </div>
      <Wallet x={1150} y={130} w={300} h={160} name="Ali" start={at(scene, 1, 0.1)} size={52} />
      <Wallet x={1520} y={130} w={300} h={160} name="Bea" start={at(scene, 1, 0.1)} size={52} />
      <Arrow x={1300} y={350} w={370} dir={1} color={ALI} start={at(scene, 1, 0.3)} coin />
      <Text x={1490} y={385} w={680} size={48} weight={800} color={ALI_D} align="center" style={fadeUp(f, at(scene, 1, 0.45))}>20% of Ali's money</Text>
      <Text x={1490} y={440} w={680} size={48} weight={900} color={C.ink} align="center" style={fadeUp(f, at(scene, 1, 0.75))}>then they have the same</Text>
      <Tag x={1150} y={520} start={at(scene, 2, 0.05)} color={C.violet} size={44}>OR, instead:</Tag>
      <Arrow x={1300} y={640} w={370} dir={-1} color={BEA} start={at(scene, 2, 0.3)} coin />
      <Text x={1490} y={670} w={680} size={48} weight={800} color={BEA_D} align="center" style={fadeUp(f, at(scene, 2, 0.4))}>Bea gives $10</Text>
      <Eq x={1230} y={730} size={50} start={at(scene, 2, 0.7)} tex={`${cA('\\text{Ali}')}=2\\times ${cB('\\text{Bea}')}`} />
      <Text x={90} y={620} w={900} size={52} weight={900} color={C.primary} style={fadeUp(f, at(scene, 3, 0.45))}>Ali + Bea = ?</Text>
      <Choices x={90} y={730} start={(i) => at(scene, 4, 0.25 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={52} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const Clue: React.FC<{ x: number; n: number; text: React.ReactNode; color: string; start: number }> = ({ x, n, text, color, start }) => (
    <div style={{ position: 'absolute', left: x, top: 140, width: 800, height: 460, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, start) }}>
      <Pill x={32} y={26} color={color} style={{ fontSize: 44 }}>Clue {n}</Pill>
      <Wallet x={70} y={150} w={320} h={150} name="Ali" start={start + 6} size={50} />
      <Wallet x={410} y={150} w={320} h={150} name="Bea" start={start + 10} size={50} />
      <div style={{ position: 'absolute', left: 30, top: 330, width: 740, textAlign: 'center', fontSize: 44, fontWeight: 800, lineHeight: 1.3 }}>{text}</div>
    </div>
  );
  return (
    <>
      <Clue x={100} n={1} color={ALI_D} start={at(scene, 0, 0.1)} text={<>Ali gives 20% → they match</>} />
      <Clue x={1020} n={2} color={BEA} start={at(scene, 0, 0.2)} text={<>Bea gives $10 → Ali = 2 × Bea</>} />
      <Text x={960} y={650} w={1720} size={50} weight={700} align="center" style={fadeUp(f, at(scene, 0, 0.4))}>
        <Mark on={at(scene, 0, 0.5)}>instead</Mark> = each clue starts fresh, from the same amounts
      </Text>
      <Tag x={560} y={750} start={at(scene, 1, 0.3)} color={C.primary} size={50}>goal: Ali + Bea</Tag>
    </>
  );
};

const QTEXT = (
  <>If Ali gives Bea 20% of his money, they will have the same amount. If instead Bea gives Ali $10, Ali will have twice as much as Bea. How many dollars do Ali and Bea have together?</>
);
const QTEXT2 = (
  <>If Ali gives Bea 25% of his money, they have the same amount. If instead Bea gives Ali $6, Ali has 3 times as much as Bea. How much do they have together?</>
);

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 170, width: 1100, background: C.card, borderRadius: 28, padding: '28px 40px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{QTEXT}</div>
      <Countdown scene={scene} seconds={10} x={1660} y={500} tick={tick} />
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 170, width: 1100, background: C.card, borderRadius: 28, padding: '28px 40px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{QTEXT2}</div>
      <Countdown scene={scene} seconds={12} x={1660} y={500} tick={tick} />
    </>
  );
};

// Solution 1, first half: draw the bar model for clue 1.
const Bars: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const YA = 240;
  const YB = 450;
  // gift part slides from Ali's 5th part (index 4) to the end of Bea's bar (index 3)
  const slide = ease(f, at(scene, 2, 0.25), 26);
  const gx = lerp(px(4), px(3), slide);
  const gy = lerp(YA, YB, slide) - Math.sin(slide * Math.PI) * 40;
  const gift = f >= at(scene, 2, 0.25);
  const guide = ease(f, at(scene, 3, 0.5), 18);
  const gone = ease(f, at(scene, 4, 0.35), 16);
  const pulse = f >= at(scene, 4, 0.1) ? Math.sin(Math.min(1, (f - at(scene, 4, 0.1)) / 30) * Math.PI) : 0;
  return (
    <>
      <Tag x={90} y={125} start={at(scene, 0, 0.5)} color={C.violet} size={42}>draw a bar model</Tag>
      <Name y={YA} name="Ali" color={ALI_D} op={ease(f, at(scene, 0, 0.7), 10)} />
      <Parts y={YA} n={5} color={ALI} start={at(scene, 1, 0.45)} skip={gift ? [4] : []} />
      <Eq x={1100} y={YA - 5} size={56} start={at(scene, 1, 0.1)} tex={'20\\%=\\dfrac{1}{5}'} op={fadeTo(f, at(scene, 2, 0.9), 0, 10)} />
      <CountLabel x={px(4) + 24} y={YA} tex={'4\\text{ parts}'} start={at(scene, 2, 0.75)} />
      {/* Bea's bar: appears when it is time to say she now has four */}
      <Name y={YB} name="Bea" color={BEA_D} op={ease(f, at(scene, 2, 0.3), 10)} />
      <Parts y={YB} n={3} color={BEA} start={at(scene, 3, 0.15)} />
      {gift && <Part x={gx} y={gy} color={ALI} op={1 - gone} glow={pulse} />}
      <Dash x={px(4) - GP / 2} y1={YA + BH + 6} y2={YB + BH + 40} op={guide * (1 - gone)} />
      <CountLabel x={px(4) + 24} y={YB} tex={'4\\text{ parts}'} start={at(scene, 3, 0.7)} op={1 - gone} />
      <Text x={px(4) + 14} y={YA + BH + 40} w={320} size={44} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 3, 0.55)), opacity: ease(f, at(scene, 3, 0.55), 10) * (1 - gone), whiteSpace: 'nowrap' }}>same amount</Text>
      <CountLabel x={px(3) + 24} y={YB} tex={'3\\text{ parts}'} start={at(scene, 4, 0.7)} color={BEA_D} />
      <Tag x={700} y={640} start={at(scene, 4, 0.55)} color={BEA} size={48}>Bea started with 3 parts</Tag>
    </>
  );
};

// Solution 1, second half: clue two on fresh bars, the balance, the answer.
const Part2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const Y1 = 130;
  const Y2 = 225;
  const Y3 = 320;
  const slide = ease(f, at(scene, 0, 0.5), 28);
  const bx = lerp(px(3), px(5), slide); // the $10 block rides from Bea's end to Ali's end
  const by = lerp(Y2, Y1, slide) - Math.sin(slide * Math.PI) * 30;
  const moved = slide >= 1;
  const lab = fadeTo(f, at(scene, 6, 0.0), 0, 10);
  const dbl = at(scene, 2, 0.15);
  const p3 = ease(f, dbl, 14);
  const copy2 = px(3) + BLK + GP; // second copy of Bea's bar starts after the first copy and its gap
  const cancel = ease(f, at(scene, 4, 0.5), 14);
  const lineY = 450;
  const keep = ease(f, at(scene, 6, 0.0), 16); // final labels
  const done = at(scene, 7, 0.88);
  return (
    <>
      <Name y={Y1} name="Ali" color={ALI_D} op={ease(f, 2, 10)} />
      <Parts y={Y1} n={5} color={ALI} start={4} />
      <Name y={Y2} name="Bea" color={BEA_D} op={ease(f, 6, 10)} />
      <Parts y={Y2} n={3} color={BEA} start={8} />
      {/* $10 block: sits on Bea's bar, slides to Ali's */}
      <Coin10 x={bx} y={by} op={ease(f, 16, 8) * (1 - keep)} />
      <Gap10 x={px(3)} y={Y2} op={ease(f, at(scene, 0, 0.9), 10) * (1 - keep)} />
      <CountLabel x={1100} y={Y1} tex={`${cA('5\\text{ parts}+10')}`} start={at(scene, 1, 0.15)} op={lab} />
      <CountLabel x={1100} y={Y2} tex={`${cB('3\\text{ parts}-10')}`} start={at(scene, 1, 0.65)} op={lab} />
      {/* twice Bea: her bar drawn twice end to end, each copy missing $10 */}
      {p3 > 0 && (
        <>
          <Name y={Y3} name="2 × Bea" color={BEA_D} op={p3 * (1 - keep)} />
          <Parts y={Y3} n={3} color={BEA} start={dbl} step={3} op={1 - keep} />
          <Gap10 x={px(3)} y={Y3} op={p3 * (1 - keep)} />
          <Parts y={Y3} n={3} color={BEA} start={dbl + 12} step={3} x0={copy2} op={1 - keep} />
          <Gap10 x={copy2 + 3 * (PW + GP)} y={Y3} op={ease(f, dbl + 22, 10) * (1 - keep)} />
        </>
      )}
      <CountLabel x={copy2 + 3 * (PW + GP) + BLK + 30} y={Y3} tex={cB('6\\text{ parts}-20')} start={at(scene, 2, 0.6)} op={1 - keep} />
      {/* the balance: after the cancel, both 5-part terms are struck through */}
      <div style={{ position: 'absolute', left: 90, top: lineY, whiteSpace: 'nowrap', opacity: (ease(f, at(scene, 3, 0.45), 14)) * (1 - 0.6 * Math.sin(Math.min(1, Math.max(0, (f - at(scene, 4, 0.5)) / 14)) * Math.PI)), transform: `translateY(${(1 - ease(f, at(scene, 3, 0.45), 14)) * 24}px)` }}>
        <Tex tex={cancel > 0.5 ? `${col(C.muted, '\\cancel{5\\text{ parts}}')}+10=${col(C.muted, '\\cancel{5\\text{ parts}}')}+${cB('1\\text{ part}')}-20` : `${cA('5\\text{ parts}')}+10=${cB('6\\text{ parts}')}-20`} size={54} />
      </div>
      <Tag x={500} y={lineY + 200} start={at(scene, 4, 0.15)} out={at(scene, 5, 0.05)} color={C.muted} size={44}>take 5 parts from both sides</Tag>
      <Eq x={90} y={lineY + 100} start={at(scene, 4, 0.75)} tex={`1\\text{ part}-20=10`} />
      <Eq x={90} y={lineY + 200} start={at(scene, 5, 0.3)} tex={`1\\text{ part}=${col(C.green, '30')}`} size={60} />
      {/* bars labelled with their value */}
      <CountLabel x={px(5) + 60} y={Y1} tex={`${cA('5\\times 30=150')}`} start={at(scene, 6, 0.2)} op={keep} />
      <CountLabel x={px(3) + 60} y={Y2} tex={`${cB('3\\times 30=90')}`} start={at(scene, 6, 0.65)} op={keep} />
      <Eq x={1000} y={lineY + 95} size={60} start={at(scene, 7, 0.35)} tex={`150+90=${col(C.green, '240')}`} />
      <Answer x={1640} y={730} value="240" start={done} chime={chime} />
      <div style={{ position: 'absolute', left: 1000, top: lineY + 205, background: C.green, color: '#fff', borderRadius: 18, padding: '8px 26px', fontSize: 50, fontWeight: 900, opacity: ease(f, at(scene, 7, 0) + scene.lines[7].frames - 34, 8) }}>Choice D</div>
      <Confetti x={1640} y={730} start={done} seed={5} />
    </>
  );
};

const CheckS: SceneComponent = ({ scene }) => {
  return (
    <>
      <Check x={120} y={150} start={at(scene, 0, 0.1)}>
        <span style={{ color: ALI_D }}>Clue 1</span>
      </Check>
      <Eq x={170} y={250} size={54} start={at(scene, 0, 0.55)} tex={'20\\%\\text{ of }150=30'} />
      <Eq x={170} y={345} size={54} start={at(scene, 1, 0.1)} tex={`${cA('\\text{Ali: }150-30=120')}\\quad ${cB('\\text{Bea: }90+30=120')}`} />
      <Check x={120} y={500} start={at(scene, 2, 0.05)}>
        <span style={{ color: BEA_D }}>Clue 2</span>
      </Check>
      <Eq x={170} y={600} size={54} start={at(scene, 2, 0.4)} tex={`${cA('\\text{Ali: }150+10=160')}\\quad ${cB('\\text{Bea: }90-10=80')}`} />
      <Eq x={170} y={695} size={54} start={at(scene, 3, 0.1)} tex={`160=2\\times 80\\;\\;${col(C.green, '\\checkmark')}`} />
    </>
  );
};

const Letters: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 130, display: 'flex', gap: 36, ...fadeUp(f, at(scene, 0, 0.3)) }}>
        <Pill x={0} y={0} color={ALI_D} style={{ position: 'static', fontSize: 46 }}>Ali = a</Pill>
        <Pill x={0} y={0} color={BEA} style={{ position: 'static', fontSize: 46 }}>Bea = b</Pill>
      </div>
      <Tag x={100} y={235} start={at(scene, 1, 0.05)} color={C.muted} size={44}>Clue 1</Tag>
      <Eq x={100} y={325} start={at(scene, 1, 0.45)} tex={'a-\\dfrac{a}{5}=b+\\dfrac{a}{5}'} />
      <Eq x={100} y={485} start={at(scene, 2, 0.4)} tex={'b=a-\\dfrac{2a}{5}=\\dfrac{3a}{5}'} />
      <Tag x={1000} y={235} start={at(scene, 3, 0.05)} color={C.muted} size={44}>Clue 2</Tag>
      <Eq x={1000} y={300} start={at(scene, 3, 0.5)} tex={'a+10=2(b-10)'} />
      <Eq x={1000} y={375} start={at(scene, 4, 0.15)} size={50} tex={'=2\\left(\\dfrac{3a}{5}-10\\right)'} />
      <Eq x={1000} y={520} start={at(scene, 4, 0.55)} size={50} tex={'a+10=\\dfrac{6a}{5}-20'} />
      <Eq x={1000} y={640} start={at(scene, 5, 0.1)} size={50} tex={'30=\\dfrac{a}{5}'} />
      <Tag x={1250} y={660} start={at(scene, 5, 0.1)} color={C.muted} size={44}>take a from both sides</Tag>
      <Eq x={1000} y={755} start={at(scene, 5, 0.6)} size={56} tex={`a=${col(C.green, '150')},\\;\\; b=${col(C.green, '90')}`} />
      <Tag x={100} y={640} start={at(scene, 6, 0.3)} color={C.violet} size={44}>Bars get messy? Letters still work.</Tag>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const bad = (i: number, from: number) => ease(f, from, 10);
  const chip = (i: number) => {
    const v = CH[i];
    const red = i === 0 || i === 1 ? bad(i, at(scene, 0, 0.5)) : i === 4 ? bad(i, at(scene, 1, 0.5)) : i === 2 ? bad(i, at(scene, 6, 0.6)) : 0;
    const amber = i === 2 ? ease(f, at(scene, 2, 0.3), 10) * (1 - red) : 0;
    const green = i === 3 ? ease(f, at(scene, 7, 0.4), 10) : 0;
    const bg = green > 0 ? C.green : red > 0 ? C.red : amber > 0 ? C.amber : C.card;
    const on = green > 0 || red > 0 || amber > 0;
    return (
      <div key={i} style={{ ...fadeUp(f, 6 + i * 3), background: bg, color: on ? '#fff' : C.ink, borderRadius: 18, padding: '12px 30px', fontSize: 52, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.08)', transform: green > 0 ? `scale(${1 + 0.1 * Math.sin(green * Math.PI)})` : undefined }}>
        <span style={{ fontSize: 48, marginRight: 12, opacity: 0.7 }}>{'ABCDE'[i]}</span>
        {v}
      </div>
    );
  };
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 120, display: 'flex', gap: 22 }}>{[0, 1, 2, 3, 4].map(chip)}</div>
      <Card x={100} y={290} w={820} start={at(scene, 0, 0.5)}>A: 90 = Bea alone</Card>
      <Card x={100} y={385} w={820} start={at(scene, 0, 0.75)}>B: 150 = Ali alone</Card>
      <Card x={100} y={480} w={820} start={at(scene, 1, 0.55)}>
        <Tex tex={'\\text{E: }2\\times 150=300'} size={48} />
      </Card>
      <Tag x={1000} y={290} start={at(scene, 2, 0.4)} color={C.amber} size={48}>Test C: 200</Tag>
      <Eq x={1000} y={380} size={50} start={at(scene, 3, 0.5)} tex={'8\\text{ parts}=200,\\;\\;1\\text{ part}=25'} />
      <Eq x={1000} y={470} size={50} start={at(scene, 4, 0.35)} tex={`${cA('5\\times 25=125')},\\;\\;${cB('3\\times 25=75')}`} />
      <Eq x={1000} y={560} size={50} start={at(scene, 5, 0.35)} tex={`125+10=135,\\;\\;75-10=65`} />
      <Eq x={1000} y={650} size={54} start={at(scene, 6, 0.3)} tex={`2\\times 65=130\\neq 135`} color={C.red} />
      <Check x={100} y={690} start={at(scene, 7, 0.3)}>Only 240 passes both clues</Check>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Pill x={120} y={130} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>New clues</Pill>
      <div style={{ position: 'absolute', left: 120, top: 230, width: 1300, minHeight: 360, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 48, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>If Ali gives Bea 25% of his money, they have the same amount. </span>
        <span style={s(1)}>If instead Bea gives Ali $6, Ali has 3 times as much as Bea. </span>
        <span style={s(2)}>How much do they have <Mark on={at(scene, 2, 0.4)}>together</Mark>?</span>
      </div>
      <Text x={120} y={650} w={900} size={52} weight={900} color={C.primary} style={fadeUp(f, at(scene, 2, 0.5))}>Ali + Bea = ?</Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const YA = 130;
  const YB = 240;
  const gStart = at(scene, 1, 0.3);
  const slide = ease(f, gStart, 24);
  const ret = ease(f, at(scene, 3, 0.0), 18); // gift part goes home: clue two starts fresh
  const gslide = slide * (1 - ret);
  const gx = lerp(px(3), px(2), gslide);
  const gy = lerp(YA, YB, gslide) - Math.sin(gslide * Math.PI) * 40;
  const gift = f >= gStart && ret < 1;
  const aliParts = f < gStart ? 4 : 3;
  const gone = ease(f, at(scene, 2, 0.6), 14);
  const guide = ease(f, at(scene, 2, 0.1), 16) * (1 - ret) * (1 - gone);
  const done = at(scene, 6, 0.88);
  const lab = (i: number) => at(scene, i, 0.4);
  return (
    <>
      <Name y={YA} name="Ali" color={ALI_D} op={ease(f, 4, 10)} />
      <Parts y={YA} n={4} color={ALI} start={at(scene, 0, 0.4)} skip={gift && aliParts === 3 ? [3] : []} />
      <Name y={YB} name="Bea" color={BEA_D} op={ease(f, gStart, 10)} />
      <Parts y={YB} n={2} color={BEA} start={at(scene, 2, 0.05)} />
      {gift && <Part x={gx} y={gy} color={ALI} op={1 - gone} />}
      <Dash x={px(3) - GP / 2} y1={YA + BH + 6} y2={YB + BH + 40} op={guide} />
      <Eq x={1150} y={YA - 8} size={54} start={at(scene, 0, 0.55)} tex={'25\\%=\\dfrac{1}{4}'} op={fadeTo(f, at(scene, 2, 0.0), 0, 10)} />
      <CountLabel x={px(4) + 24} y={YA} tex={'4\\text{ parts}'} start={at(scene, 0, 0.85)} op={fadeTo(f, gStart, 0, 8)} />
      <CountLabel x={px(3) + 24} y={YA} tex={'3\\text{ parts}'} start={at(scene, 1, 0.8)} op={(1 - ret)} />
      <CountLabel x={px(3) + 24} y={YB} tex={'3\\text{ parts}'} start={at(scene, 2, 0.2)} op={(1 - gone) * (1 - ret)} />
      <CountLabel x={px(2) + 24} y={YB} tex={cB('2\\text{ parts}')} start={at(scene, 2, 0.8)} op={1 - ret * 0} />
      {/* clue two: balance rows */}
      <Eq x={100} y={360} size={50} start={at(scene, 3, 0.35)} tex={`${cA('4\\text{ parts}+6')}=3\\times(${cB('2\\text{ parts}')}-6)`} />
      <Eq x={100} y={425} size={50} start={at(scene, 4, 0.1)} tex={`4\\text{ parts}+6=6\\text{ parts}-18`} />
      <Eq x={100} y={490} size={50} start={at(scene, 4, 0.5)} tex={`2\\text{ parts}=24`} />
      <Eq x={100} y={555} size={54} start={at(scene, 4, 0.82)} tex={`1\\text{ part}=${col(C.green, '12')}`} />
      <Eq x={1150} y={YA - 8} size={54} start={at(scene, 5, 0.1)} tex={cA('4\\times 12=48')} />
      <Eq x={1150} y={YB - 8} size={54} start={at(scene, 5, 0.6)} tex={cB('2\\times 12=24')} />
      <Eq x={1150} y={400} size={60} start={at(scene, 6, 0.3)} tex={`48+24=${col(C.green, '72')}`} />
      <Answer x={1560} y={640} value="72" start={done} chime={chime} />
      <Check x={100} y={650} start={at(scene, 7, 0.1)}>
        <Tex tex={`\\text{Clue 2: }54=3\\times 18`} size={52} />
      </Check>
      <Check x={100} y={735} start={at(scene, 8, 0.35)}>
        <Tex tex={`\\text{Clue 1: }48-12=36=24+12`} size={52} />
      </Check>
      <Confetti x={1560} y={640} start={at(scene, 9, 0.2)} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const row = (y: number, start: number, color: string, a: string, b: string) => (
    <div style={{ position: 'absolute', left: 300, top: y, display: 'flex', alignItems: 'center', gap: 30, ...fadeUp(f, start) }}>
      <div style={{ background: color, borderRadius: 28, padding: '14px 36px', fontSize: 52, fontWeight: 900, color: '#fff', width: 440, textAlign: 'center' }}>{a}</div>
      <svg width={110} height={60} viewBox="0 0 120 60">
        <path d="M5 30 H95 M70 8 L100 30 L70 52" stroke={C.muted} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: 52, fontWeight: 900 }}>{b}</div>
    </div>
  );
  return (
    <>
      <Fade op={out}>
        <Text x={300} y={130} w={900} size={60} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        {row(260, at(scene, 1, 0.1), ALI, 'percent', 'equal parts')}
        {row(400, at(scene, 1, 0.6), BEA, 'each clue', 'one balance')}
        {row(540, at(scene, 2, 0.2), C.violet, 'one part', 'everything else')}
      </Fade>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep balancing!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  bars: Bars,
  part: Part2,
  check: CheckS,
  letters: Letters,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

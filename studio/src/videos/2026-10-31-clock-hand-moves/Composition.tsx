import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-31-clock-hand-moves';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const PINK = '#e0559c';
export const AMBD = '#c77f00';
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

// ---------- clock: a big face with an hour hand only ----------

type ClockP = {
  cx: number; cy: number; R: number;
  h: number; // hour-hand position in hours (3 = pointing at the 3); can be any real number
  op?: number; handOp?: number; trail?: number; glow?: number;
  ghostH?: number; ghostOp?: number;
  q?: number; // opacity of the "?" bubble
  qx?: number; qy?: number;
};

export const Clock: React.FC<ClockP> = ({ cx, cy, R, h, ghostH, ghostOp = 0, op = 1, handOp = 1, trail = 0, glow = 0, q = 0, qx, qy }) => {
  const f = useCurrentFrame();
  const fs = R >= 280 ? 58 : 50;
  const nr = R - (R >= 280 ? 62 : 54);
  const L = nr - fs * 0.62 - 14;
  const pulse = 0.55 + 0.45 * Math.sin(f / 6);
  const hand = (deg: number, o: number, k: number) => (
    <g key={k} transform={`rotate(${deg} ${cx} ${cy})`} opacity={o}>
      <line x1={cx} y1={cy + 0.14 * L} x2={cx} y2={cy - L + 26} stroke={C.violet} strokeWidth={R >= 280 ? 18 : 15} strokeLinecap="round" />
      <path d={`M${cx - 24} ${cy - L + 34} L${cx} ${cy - L - 6} L${cx + 24} ${cy - L + 34} Z`} fill={C.violet} stroke={C.violet} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
  const ang = h * 30;
  return (
    <div style={{ opacity: op }}>
      <Stage>
        <circle cx={cx} cy={cy} r={R} fill={C.card} stroke={C.line} strokeWidth={14} />
        {range(60).map((i) => {
          const a = (i * 6 * Math.PI) / 180;
          const big = i % 5 === 0;
          const r1 = R - 8;
          const r2 = R - (big ? 26 : 16);
          return <line key={i} x1={cx + Math.sin(a) * r1} y1={cy - Math.cos(a) * r1} x2={cx + Math.sin(a) * r2} y2={cy - Math.cos(a) * r2} stroke={big ? C.muted : C.line} strokeWidth={big ? 5 : 3} strokeLinecap="round" />;
        })}
        {glow > 0 && (() => {
          const a = (ang * Math.PI) / 180;
          return <circle cx={cx + Math.sin(a) * L} cy={cy - Math.cos(a) * L} r={46} fill="rgba(123,97,255,0.16)" stroke={C.violet} strokeWidth={5} opacity={glow * pulse} />;
        })()}
        {ghostOp > 0 && ghostH !== undefined && (
          <g transform={`rotate(${ghostH * 30} ${cx} ${cy})`} opacity={ghostOp * 0.7}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - L + 26} stroke={C.muted} strokeWidth={13} strokeLinecap="round" strokeDasharray="18 14" />
            <path d={`M${cx - 20} ${cy - L + 32} L${cx} ${cy - L - 4} L${cx + 20} ${cy - L + 32} Z`} fill={C.muted} />
          </g>
        )}
        {trail > 0 && range(7).map((k) => hand(ang - (k + 1) * trail * 9, handOp * (0.5 - k * 0.07), 100 + k))}
        {hand(ang, handOp, 0)}
        <circle cx={cx} cy={cy} r={16} fill={C.violet} />
        <circle cx={cx} cy={cy} r={6} fill="#fff" />
      </Stage>
      {range(12).map((i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        return (
          <div key={n} style={{ position: 'absolute', left: cx + Math.sin(a) * nr - 50, top: cy - Math.cos(a) * nr - fs * 0.65, width: 100, textAlign: 'center', fontSize: fs, fontWeight: 800, lineHeight: 1.3, color: C.ink }}>
            {n}
          </div>
        );
      })}
      {q > 0 && (
        <div style={{ position: 'absolute', left: (qx ?? cx) - 70, top: (qy ?? cy) - 80, width: 140, height: 140, borderRadius: '50%', background: C.violet, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 900, opacity: q, transform: `scale(${0.6 + 0.4 * q})` }}>?</div>
      )}
    </div>
  );
};

/** hand position that steps one hour at a time at the given start frames */
export const stepH = (f: number, base: number, starts: number[], dur = 7) => starts.reduce((h, s) => h + ease(f, s, dur), base);

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; w?: number }> = ({ x, y, start, color, children, size = 40, w }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: w ? 'normal' : 'nowrap', width: w, textAlign: w ? 'center' : undefined, borderRadius: w ? 36 : 999 }}>
      {children}
    </Pill>
  );
};

/** a tag that pops in (springy) */
const PopTag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 52 }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  if (s <= 0) return null;
  return (
    <Pill x={x} y={y} color={color} style={{ fontSize: size, whiteSpace: 'nowrap', transform: `scale(${s})`, transformOrigin: 'left center' }}>
      {children}
    </Pill>
  );
};

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ x = 900, y, start, tex, size = 56, color = C.ink, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start), ...style }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (op <= 0 ? null : <div style={{ opacity: op, position: 'absolute', inset: 0 }}>{children}</div>);

const Dots: React.FC<{ x: number; y: number; n: number; done: number[]; color: string; show: number }> = ({ x, y, n, done, color, show }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 18, ...fadeUp(f, show) }}>
      {range(n).map((i) => {
        const p = ease(f, done[i], 6);
        return (
          <div key={i} style={{ width: 56, height: 56, borderRadius: '50%', border: `5px solid ${color}`, background: `rgba(123,97,255,${0.9 * p})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 900 }}>
            {p > 0.5 ? i + 1 : ''}
          </div>
        );
      })}
    </div>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sp0 = at(scene, 1, 0.0);
  const sp1 = at(scene, 1, 0.85);
  const p = ease(f, sp0, sp1 - sp0);
  const spinning = f >= sp0;
  const handOp = spinning ? 1 - ease(f, at(scene, 1, 0.55), Math.round(scene.lines[1].frames * 0.4)) : 1;
  const h = spinning ? 3 + 36 * p * p * (3 - 2 * p) : 3;
  const tags = ['+1', '+2', '+3', '…', '+20'];
  return (
    <>
      <Clock cx={500} cy={470} R={310} h={h} handOp={handOp} trail={spinning ? 1.6 * Math.sin(Math.PI * p) : 0} q={ease(f, at(scene, 1, 0.8), 10)} qx={500} qy={470} op={ease(f, 3, 12)} />
      <div style={{ position: 'absolute', left: 1000, top: 170, display: 'flex', gap: 18 }}>
        {tags.map((t, i) => {
          const s = pop(f, at(scene, 0, 0.25 + i * 0.13));
          return s > 0 ? (
            <div key={i} style={{ background: i === 3 ? C.muted : C.violet, color: '#fff', borderRadius: 999, padding: '10px 28px', fontSize: 56, fontWeight: 900, transform: `scale(${s})` }}>{t}</div>
          ) : null;
        })}
      </div>
      <Text x={1000} y={330} w={860} size={68} weight={900} style={fadeUp(f, at(scene, 1, 0.15))}>Where does it stop?</Text>
      <div style={{ position: 'absolute', left: 1000, top: 520, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 42, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

export const CH = ['3', '6', '7', '9', '10'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Clock cx={1420} cy={460} R={300} h={3} glow={ease(f, at(scene, 1, 0.5), 10) * fadeTo(f, at(scene, 2), 0, 10)} q={ease(f, at(scene, 4, 0.6), 10)} qx={1380} qy={580} />
      <div style={{ position: 'absolute', left: 80, top: 140, width: 900, minHeight: 440, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 1) - 4, 10) }}>
        <span style={s(1)}>The hour hand of a clock points to <Mark on={at(scene, 1, 0.7)}>three</Mark>. </span>
        <span style={s(2)}>Tom moves it forward one hour, then two hours, then three hours, and so on. </span>
        <span style={s(3)}>He finishes with a move of twenty hours. </span>
        <span style={s(4)}>To which number does the hour hand point at the end?</span>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 612, display: 'flex', gap: 14 }}>
        {[['+1', 0], ['+2', 0.25], ['+3', 0.5]].map(([t, d]) => (
          <div key={t as string} style={{ ...fadeUp(f, at(scene, 2, 0.45 + (d as number))), background: C.violet, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: 48, fontWeight: 900 }}>{t}</div>
        ))}
        <div style={{ ...fadeUp(f, at(scene, 3, 0.3)), background: C.violet, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: 48, fontWeight: 900 }}>… +20</div>
      </div>
      <Choices x={80} y={725} start={(i) => at(scene, 5, 0.25 + i * 0.12)} items={CH.map((c) => <Tex key={c} tex={c} size={56} />)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const turn = ease(f, at(scene, 1, 0.45), Math.round(scene.lines[1].frames * 0.55));
  const items = ['+1', '+2', '+3', '…', '+20'];
  return (
    <>
      <Clock cx={450} cy={470} R={300} h={3 + 12 * turn} trail={turn > 0 && turn < 1 ? 1.2 : 0} />
      <div style={{ position: 'absolute', left: 900, top: 190, display: 'flex', gap: 16 }}>
        {items.map((t, i) => (
          <div key={i} style={{ ...fadeUp(f, at(scene, 0, 0.1 + i * 0.1)), background: i === 3 ? C.muted : C.violet, color: '#fff', borderRadius: 999, padding: '8px 26px', fontSize: 52, fontWeight: 900 }}>{t}</div>
        ))}
      </div>
      <Text x={900} y={310} w={900} size={56} weight={900} style={fadeUp(f, at(scene, 0, 0.6))}>
        <span style={{ color: C.violet }}>20</span> moves
      </Text>
      <Tag x={900} y={440} start={at(scene, 1, 0.5)} color={C.primary} size={46}>12 hours = back where you started</Tag>
      <Tag x={900} y={600} start={at(scene, 3, 0.4)} color={C.amber} size={46}>goal: the final number</Tag>
    </>
  );
};

const PAUSE_TEXT = (
  <>The hour hand of a clock points to three. Tom moves it forward one hour, then two hours, then three hours, and so on, finishing with a move of twenty hours. To which number does it point at the end?</>
);
const PAUSE_TEXT2 = (
  <>The hour hand points to eight. Tom moves it forward one hour, then two hours, then three hours, and so on, finishing with a move of sixteen hours. To which number does it point at the end?</>
);

const Pause1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Clock cx={330} cy={470} R={250} h={3} />
      <div style={{ position: 'absolute', left: 660, top: 150, width: 720, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE_TEXT}</div>
      <Countdown scene={scene} seconds={10} x={1660} y={500} tick={TICK} />
    </>
  );
};

const PAIRS = 10;
const CHW = 90; // pitch of the chips in the pairing row
const CX0 = 100; // centre of the first chip

const Total: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const chipY = 470;
  const cx = (i: number) => CX0 + i * CHW;
  const arcAt = (k: number) => (k === 0 ? at(scene, 2, 0.28) : k === 1 ? at(scene, 2, 0.6) : at(scene, 2, 0.82) + (k - 2) * 3);
  const colors = [C.violet, C.primary, C.blue];
  return (
    <>
      <Tag x={90} y={140} start={at(scene, 0, 0.5)} color={C.primary} size={44}>add up all the moves</Tag>
      <Eq x={760} y={132} start={at(scene, 1, 0.35)} tex={'1 + 2 + 3 + \\cdots + 20'} />
      <Stage>
        {range(PAIRS).map((k) => {
          const x1 = cx(k);
          const x2 = cx(19 - k);
          const span = x2 - x1;
          const p = ease(f, arcAt(k), 16);
          const len = span * 1.2;
          return (
            <path key={k} d={`M${x1} ${chipY - 4} Q${(x1 + x2) / 2} ${chipY - 4 - span * 0.27} ${x2} ${chipY - 4}`} fill="none" stroke={colors[k % 3]} strokeWidth={7} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={p > 0 ? 1 : 0} />
          );
        })}
      </Stage>
      {range(20).map((i) => {
        const pairK = i < 10 ? i : 19 - i;
        const hl = ease(f, arcAt(pairK), 10);
        return (
          <div key={i} style={{ position: 'absolute', left: cx(i) - 40, top: chipY, width: 80, height: 84, borderRadius: 18, background: C.card, border: `4px solid ${hl > 0.5 ? colors[pairK % 3] : C.line}`, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, ...fadeUp(f, at(scene, 1, 0.1 + i * 0.03), 8) }}>
            {i + 1}
          </div>
        );
      })}
      <Eq x={90} y={600} start={at(scene, 2, 0.32)} tex={col(C.violet, '1 + 20 = 21')} />
      <Eq x={640} y={600} start={at(scene, 2, 0.64)} tex={col(C.primary, '2 + 19 = 21')} />
      <Eq x={1190} y={600} start={at(scene, 2, 0.86)} tex={col(C.blue, '3 + 18 = 21') + '\\ \\cdots'} />
      <Eq x={90} y={715} start={at(scene, 3, 0.45)} size={64} tex={'10 \\text{ pairs} \\times 21 = 210'} color={C.ink} />
      <Tag x={1150} y={725} start={at(scene, 3, 0.75)} color={C.violet} size={44}>210 hours</Tag>
    </>
  );
};

const Turns: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = scene.lines[1].frames;
  const spinStart = at(scene, 1, 0.08);
  const sp = ease(f, spinStart, Math.round(l1 * 0.78));
  const spun = f >= spinStart;
  const stepStarts = range(6).map((i) => at(scene, 2, 0.48 + i * 0.085));
  const h = 3 + 12 * 17 * sp + range(6).reduce((a, i) => a + ease(f, stepStarts[i], 8), 0);
  const count = Math.min(17, Math.floor(17 * sp + 0.001));
  const done = at(scene, 3, 0.8);
  return (
    <>
      <Clock cx={430} cy={470} R={300} h={h} trail={spun && sp > 0.02 && sp < 0.98 ? 2.2 : 0} />
      <Eq y={150} start={at(scene, 0, 0.55)} tex={'210 \\div 12 = 17 \\text{ remainder } 6'} />
      <Eq y={240} start={at(scene, 0, 0.7)} tex={'17 \\times 12 = 204'} />
      <Eq y={320} start={at(scene, 0, 0.85)} tex={'210 - 204 = 6'} />
      {spun && (
        <div style={{ position: 'absolute', left: 900, top: 410, whiteSpace: 'nowrap', lineHeight: 1.15, opacity: ease(f, spinStart, 6) }}>
          <span style={{ display: 'inline-block', width: 260, fontSize: 110, fontWeight: 900, color: C.violet }}>×{count}</span>
          <span style={{ fontSize: 46, fontWeight: 800, color: C.muted }}>full turns</span>
        </div>
      )}
      <Tag x={1480} y={425} start={at(scene, 1, 0.88)} color={C.primary} size={44}>back at 3</Tag>
      <Tag x={900} y={565} start={at(scene, 2, 0.1)} color={C.amber} size={46}>+6 leftover hours</Tag>
      <Dots x={900} y={672} n={6} done={stepStarts} color={C.violet} show={at(scene, 2, 0.15)} />
      <Eq y={750} start={at(scene, 3, 0.15)} size={60} tex={'3 + 6 = ' + col(C.green, '9')} />
      <Answer x={1700} y={655} value="9" start={done} chime={CHIME} />
      <Confetti x={1700} y={655} start={done} seed={5} />
      <Pill x={1590} y={790} color={C.green} style={{ ...fadeUp(f, done + 4), fontSize: 46 }}>Choice D</Pill>
    </>
  );
};

// ---------- solution 2: chips 1..20 ----------

const PX0 = 650;
const PPITCH = 124;
const chipPos = (n: number) => ({ x: PX0 + ((n - 1) % 10) * PPITCH, y: n <= 10 ? 190 : 330 });
const PCOL = [C.violet, C.primary, C.blue, AMBD, PINK];
const PAIR_OF = (n: number): number => {
  if (n >= 1 && n <= 5) return n - 1;
  if (n >= 7 && n <= 11) return 11 - n;
  return -1;
};

const Throw: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pairStart = (k: number) => at(scene, 1, 0.12 + k * 0.17);
  const pairsGone = ease(f, at(scene, 1, 0.93), 10);
  const l4 = scene.lines[4].frames;
  const extra = (n: number) => ease(f, at(scene, 4, 0.12 + (n - 13) * 0.09), 8);
  const twelveFade = ease(f, at(scene, 4, 0.82), 10);
  const extrasGone = ease(f, at(scene, 5, 0.9), 10);
  const hand = 3 + 6 * ease(f, at(scene, 3, 0.45), 36);
  const six = ease(f, at(scene, 3, 0.1), 10);
  const pulse = 0.55 + 0.45 * Math.sin(f / 6);
  void l4;
  return (
    <>
      <Clock cx={300} cy={470} R={235} h={hand} />
      <Tag x={650} y={120} start={at(scene, 0, 0.3)} color={C.primary} size={44}>throw away 12s as you go</Tag>
      {range(20).map((i) => {
        const n = i + 1;
        const { x, y } = chipPos(n);
        const pk = PAIR_OF(n);
        let op = ease(f, at(scene, 0, 0.45) + i * 2, 8);
        let border: string = C.line;
        let bg: string = C.card;
        if (pk >= 0) {
          const hl = ease(f, pairStart(pk), 8);
          if (hl > 0.5) { border = PCOL[pk]; bg = 'rgba(255,255,255,1)'; }
          op *= 1 - pairsGone;
        }
        if (n === 12) {
          const hl = ease(f, at(scene, 2, 0.25), 8);
          if (hl > 0.5) border = C.primary;
          op *= 1 - ease(f, at(scene, 2, 0.8), 10);
        }
        if (n === 6) {
          border = six > 0.5 ? C.green : C.line;
          bg = six > 0.5 ? `rgba(33,196,93,${0.12 + 0.1 * pulse})` : C.card;
        }
        if (n >= 13) op *= 1 - extrasGone;
        const split = n >= 13 ? extra(n) : 0;
        const wide = n >= 13;
        return (
          <div key={n} style={{ position: 'absolute', left: x, top: y, width: 108, height: wide ? 128 : 104, borderRadius: 20, background: bg, border: `5px solid ${border}`, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', opacity: op, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 52 }}>
            {wide ? (
              <>
                <div style={{ opacity: 1 - split, position: split > 0.5 ? 'absolute' : 'static' }}>{n}</div>
                <div style={{ opacity: split * (1 - twelveFade), fontSize: 48, color: C.muted, height: split > 0.01 ? 'auto' : 0, lineHeight: 1.1 }}>{split > 0.01 ? 12 : ''}</div>
                <div style={{ opacity: split, fontSize: 52, color: C.violet, lineHeight: 1.1 }}>{split > 0.01 ? `+${n - 12}` : ''}</div>
              </>
            ) : (
              n
            )}
          </div>
        );
      })}
      {/* pair labels */}
      {range(5).map((k) => (
        <Eq key={k} x={PX0 + (k % 3) * 410} y={486 + Math.floor(k / 3) * 80} size={48} start={pairStart(k) + 6} tex={col(PCOL[k], `${k + 1} + ${11 - k} = 12`)} style={{ opacity: ease(f, pairStart(k) + 6, 12) * (1 - ease(f, at(scene, 2, 0.05), 8)) }} />
      ))}
      <Eq x={PX0} y={486} size={52} start={at(scene, 2, 0.3)} tex={'12 = \\text{one full turn}'} style={{ opacity: ease(f, at(scene, 2, 0.3), 12) * (1 - ease(f, at(scene, 3, 0.05), 8)) }} />
      <Eq x={PX0} y={486} size={56} start={at(scene, 3, 0.5)} tex={'3 + 6 = 9'} style={{ opacity: ease(f, at(scene, 3, 0.5), 12) * (1 - ease(f, at(scene, 4, 0.05), 8)) }} />
      <Eq x={PX0} y={486} size={52} start={at(scene, 4, 0.55)} tex={'13 = 12 + 1,\\ \\ 14 = 12 + 2,\\ \\ \\ldots'} style={{ opacity: ease(f, at(scene, 4, 0.55), 12) * (1 - ease(f, at(scene, 5, 0.05), 8)) }} />
      <Eq x={PX0} y={600} size={56} start={at(scene, 5, 0.25)} tex={'1 + 2 + \\cdots + 8 = 36 = 3 \\times 12'} style={{ opacity: ease(f, at(scene, 5, 0.25), 12) * (1 - ease(f, at(scene, 6, 0.1), 10)) }} />
      <Tag x={PX0} y={600} start={at(scene, 6, 0.3)} color={C.violet} size={46}>last 8 moves: no change</Tag>
      <Tag x={PX0} y={720} start={at(scene, 7, 0.45)} color={C.primary} size={46}>only leftovers matter</Tag>
    </>
  );
};

type Row = { letter: string; val: string; l1: string; l2?: string; ok: boolean; start: number };

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sw0 = ease(f, at(scene, 0, 0.5), 36);
  const reset = ease(f, at(scene, 1, 0.05), 14);
  const hand = 3 + 6 * sw0 * (1 - reset) + 6 * ease(f, at(scene, 4, 0.12), 40);
  const ghostOp = 1 - ease(f, at(scene, 1, 0.05), 14);
  const RX = 700;
  const RW = 1180;
  const RH = 134;
  const RY = 118;
  const order = ['A', 'B', 'C', 'D', 'E'];
  const rows: Record<string, Row> = {
    A: { letter: 'A', val: '3', l1: 'back at the start?', ok: false, start: at(scene, 1, 0.3) },
    B: { letter: 'B', val: '6', l1: 'only the leftover', ok: false, start: at(scene, 0, 0.35) },
    C: { letter: 'C', val: '7', l1: 'would need a leftover of 4', ok: false, start: at(scene, 3, 0.2) },
    D: { letter: 'D', val: '9', l1: 'start at 3, add 6', ok: true, start: at(scene, 4, 0.55) },
    E: { letter: 'E', val: '10', l1: 'would need a leftover of 7', ok: false, start: at(scene, 3, 0.55) },
  };
  return (
    <>
      <Clock cx={330} cy={400} R={225} h={hand} ghostH={6 * sw0} ghostOp={ease(f, at(scene, 0, 0.45), 8) * ghostOp} />
      <Fade op={ghostOp}><Tag x={110} y={650} start={at(scene, 0, 0.55)} color={C.muted} size={44}>from 12</Tag></Fade>
      <Fade op={ghostOp}><Tag x={380} y={650} start={at(scene, 0, 0.75)} color={C.violet} size={44}>from 3</Tag></Fade>
      <Eq x={120} y={680} size={52} start={at(scene, 3, 0.8)} tex={'210 - 204 = 6'} />
      <Text x={120} y={760} w={560} size={44} weight={800} color="#6b7385" style={fadeUp(f, at(scene, 3, 0.8))}>the real leftover</Text>
      {order.map((L, i) => {
        const r = rows[L];
        const p = ease(f, r.start, 12);
        const color = r.ok ? C.green : C.red;
        return (
          <div key={L} style={{ position: 'absolute', left: RX, top: RY + i * (RH + 6), width: RW, height: RH, borderRadius: 22, background: C.card, borderLeft: `12px solid ${p > 0 ? color : C.line}`, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', opacity: 0.55 + 0.45 * p }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.muted, width: 40 }}>{L}</div>
            <div style={{ width: 110, textAlign: 'center' }}><Tex tex={r.val} size={64} color={p > 0 ? color : C.ink} /></div>
            <div style={{ opacity: p, fontSize: 48, fontWeight: 800, lineHeight: 1.2, color: p > 0 ? color : C.ink }}>
              {r.l1}
              {r.l2 && L === 'B' && <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, opacity: ease(f, at(scene, 0, 0.7), 10) }}>{r.l2}</div>}
              {L === 'A' && <div style={{ opacity: ease(f, at(scene, 2, 0.2), 10) }}><Tex tex={'210 \\div 12 \\text{ is not whole}'} size={48} color={C.ink} /></div>}
              {L === 'D' && <div style={{ opacity: ease(f, at(scene, 4, 0.7), 10) }}><Tex tex={'3 + 6 = 9'} size={48} color={C.ink} /></div>}
            </div>
            {r.ok && <div style={{ marginLeft: 'auto', fontSize: 60, color: C.green, fontWeight: 900, opacity: p }}>✓</div>}
            {!r.ok && p > 0.5 && <div style={{ marginLeft: 'auto', fontSize: 56, color: C.red, fontWeight: 900, opacity: p }}>✗</div>}
          </div>
        );
      })}
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Clock cx={450} cy={470} R={300} h={8} glow={ease(f, at(scene, 0, 0.6), 10) * fadeTo(f, at(scene, 1), 0, 10)} />
      <Pill x={900} y={140} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 40 }}>Your turn</Pill>
      <div style={{ position: 'absolute', left: 900, top: 230, width: 940, minHeight: 300, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 44, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: ease(f, at(scene, 0) - 4, 10) }}>
        <span style={s(0)}>The hand starts at <Mark on={at(scene, 0, 0.6)}>eight</Mark>. </span>
        <span style={s(1)}>It moves 1 hour, then 2, then 3, finishing with a move of 16 hours. </span>
        <span style={s(2)}>Where does it point?</span>
      </div>
      <div style={{ position: 'absolute', left: 900, top: 590, display: 'flex', gap: 14 }}>
        {['+1', '+2', '+3', '…', '+16'].map((t, i) => (
          <div key={i} style={{ ...fadeUp(f, at(scene, 1, 0.3 + i * 0.12)), background: i === 3 ? C.muted : C.violet, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: 48, fontWeight: 900 }}>{t}</div>
        ))}
      </div>
    </>
  );
};

const Pause2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Clock cx={330} cy={470} R={250} h={8} />
      <div style={{ position: 'absolute', left: 660, top: 150, width: 720, background: C.card, borderRadius: 28, padding: '24px 36px', fontSize: 42, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>{PAUSE_TEXT2}</div>
      <Countdown scene={scene} seconds={11} x={1660} y={500} tick={TICK} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const stepStarts = [0.5, 0.64, 0.78, 0.92].map((t) => at(scene, 3, t));
  const h = stepH(f, 8, stepStarts, 7);
  const done = at(scene, 4, 0.82);
  return (
    <>
      <Clock cx={430} cy={470} R={300} h={h} />
      <Eq y={140} start={at(scene, 0, 0.55)} tex={'1 + 16 = 17'} />
      <Tag x={1330} y={146} start={at(scene, 0, 0.85)} color={C.violet} size={44}>8 pairs</Tag>
      <Eq y={235} start={at(scene, 1, 0.5)} tex={'8 \\times 17 = 136'} />
      <Eq y={330} start={at(scene, 2, 0.5)} tex={'136 \\div 12 = 11 \\text{ remainder } 4'} />
      <Tag x={900} y={440} start={at(scene, 3, 0.1)} color={C.amber} size={46}>+4 leftover hours</Tag>
      <Dots x={900} y={535} n={4} done={stepStarts} color={C.violet} show={at(scene, 3, 0.2)} />
      <Eq y={625} start={at(scene, 5, 0.25)} size={60} tex={'8 + 4 = ' + col(C.green, '12')} />
      <Tag x={900} y={730} start={at(scene, 5, 0.65)} color={C.primary} size={44}>the 12 itself!</Tag>
      <Answer x={1710} y={620} value="12" start={done} chime={CHIME} />
      <Confetti x={1710} y={620} start={done} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const turn = ease(f, at(scene, 1, 0.1), 40);
  const stepRow = (y: number, n: string, text: string, start: number, color: string) => (
    <div style={{ position: 'absolute', left: 900, top: y, display: 'flex', alignItems: 'center', gap: 24, ...fadeUp(f, start) }}>
      <div style={{ width: 76, height: 76, borderRadius: '50%', background: color, color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
      <div style={{ fontSize: 54, fontWeight: 900, whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
  return (
    <>
      <Fade op={out}>
        <Clock cx={430} cy={470} R={290} h={3 + 12 * turn} trail={turn > 0 && turn < 1 ? 1.2 : 0} op={ease(f, 4, 10)} />
        <Text x={900} y={150} w={900} size={60} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>The big idea</Text>
        <Tag x={900} y={650} start={at(scene, 1, 0.3)} color={C.primary} size={44}>12 = a full turn</Tag>
        {stepRow(270, '1', 'add up all the moves', at(scene, 1, 0.15), C.violet)}
        {stepRow(390, '2', 'keep only the remainder', at(scene, 1, 0.6), C.violet)}
        {stepRow(510, '3', 'count from the start', at(scene, 2, 0.25), C.violet)}
      </Fade>
      <SignOff start={at(scene, 3, 0.1)} text="Keep spinning!" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  total: Total,
  turns: Turns,
  throw: Throw,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

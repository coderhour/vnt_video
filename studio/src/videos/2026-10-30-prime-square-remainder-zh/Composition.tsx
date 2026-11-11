import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-prime-square-remainder-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const AMBER = '#f59f0a';
export const GREEN = '#21c45d';
export const VIOLET = '#7b61ff';

// ---------- helpers ----------

// Mixed maths + hanzi (hanzi never go inside KaTeX, whose \text font is serif).
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
const z = (t: string): Part => ({ z: t });

/** A maths line, fading up at `start` (and optionally out at `end`). */
const Eq: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; end?: number; size?: number; color?: string; center?: boolean }> = ({ x, y, tex, start, end = Infinity, size = 54, color = C.ink, center }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const out = end === Infinity ? 1 : 1 - ease(f, end, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...(center ? { transform: `translateX(-50%) ${s.transform}` } : { transform: s.transform }), opacity: (s.opacity as number) * out }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Plain text that fades up at `start` and out at `end`. */
const Say: React.FC<{ x: number; y: number; w?: number; start: number; end?: number; size?: number; color?: string; align?: 'left' | 'center'; weight?: number; children: React.ReactNode }> = ({ x, y, w = 900, start, end = Infinity, size = 48, color = C.ink, align = 'left', weight = 800, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const out = end === Infinity ? 1 : 1 - ease(f, end, 10);
  return (
    <Text x={x} y={y} w={w} size={size} color={color} align={align} weight={weight} style={{ ...s, opacity: (s.opacity as number) * out }}>
      {children}
    </Text>
  );
};

/** Position along a polyline at progress u in [0,1] (by arc length). */
export const along = (pts: [number, number][], u: number): [number, number] => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, u)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const t = segs[i] === 0 ? 0 : Math.min(1, d / segs[i]);
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};

export const CHOICES = ['0', '1', '5', '6', '11'];

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const sq = at(scene, 0, 0.5);
  const plus = at(scene, 0, 0.78);
  const tex = f < sq ? 'p' : f < plus ? 'p^2' : 'p^2 + 17';
  const pPop = pop(f, 4);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
        <div style={{ transform: `scale(${pPop})`, background: C.card, borderRadius: 40, padding: '10px 70px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)', minWidth: 480, textAlign: 'center' }}>
          <Tex tex={tex} size={140} color={C.violet} />
        </div>
        <div style={fadeUp(f, at(scene, 1, 0.0))}>
          <Tex tex="\div 12" size={130} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 395, textAlign: 'center', fontSize: 48, fontWeight: 800, color: C.muted, ...fadeUp(f, at(scene, 0, 0.8)) }}>
        <Tex tex="p" size={54} /> 是质数，<Tex tex="p > 3" size={54} />
      </div>
      <div style={{ position: 'absolute', left: 560, top: 480, width: 800, height: 120, borderRadius: 30, border: `6px dashed ${C.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: C.primary, ...fadeUp(f, at(scene, 1, 0.5)) }}>
        余数 = ?
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -4 }}>你的数学小导师</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 160, width: 1300, background: C.card, borderRadius: 32, padding: '36px 52px', fontSize: 52, fontWeight: 600, lineHeight: 1.7, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        <div style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.3)) }}>
          设 <Mark on={at(scene, 1, 0.2)}><Tex tex="p" size={60} /></Mark> 是一个质数，<Mark on={at(scene, 1, 0.55)}><Tex tex="p > 3" size={60} /></Mark>。
        </div>
        <div style={{ whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.4)) }}>
          <Mark on={at(scene, 2, 0.1)}><Tex tex="p^2 + 17" size={64} /></Mark> 除以 <Mark on={at(scene, 2, 0.45)}><Tex tex="12" size={64} /></Mark>，余数是多少？
        </div>
      </div>
      <Choices x={100} y={640} items={CHOICES.map((c) => <Tex key={c} tex={c} size={60} />)} start={(i) => at(scene, 3, 0.1 + i * 0.13)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={110} y={150} w={1700} size={56} weight={900} style={fadeUp(f, at(scene, 0, 0.05))}>
        质数正好有<span style={{ color: C.violet }}>两个因数</span>
      </Text>
      <Say x={110} y={235} w={1200} start={at(scene, 0, 0.2)} size={50} weight={700}>因数：1 和它本身</Say>
      <div style={{ position: 'absolute', left: 110, top: 340, display: 'flex', gap: 28 }}>
        {[5, 7, 11, 13].map((p, i) => (
          <div key={p} style={{ width: 150, height: 110, borderRadius: 28, background: C.violet, color: '#fff', fontSize: 64, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.6 + i * 0.09), 10) }}>
            {p}
          </div>
        ))}
      </div>
      <Text x={110} y={500} w={1300} size={50} weight={800} style={fadeUp(f, at(scene, 1, 0.05))}>
        余数 = 拿走所有的 <span style={{ color: C.primary }}>12</span> 以后，剩下的数
      </Text>
      <Eq x={110} y={590} size={64} tex="26 = 2 \times 12 + {\color{#f59f0a}2}" start={at(scene, 1, 0.62)} />
      <Say x={800} y={606} w={600} start={at(scene, 1, 0.82)} color={AMBER} size={48}>
        26 剩下 2
      </Say>
      <Text x={110} y={700} w={1700} size={54} weight={800} style={fadeUp(f, at(scene, 2, 0.0))}>
        答案必须对<Mark on={at(scene, 2, 0.55)}>每一个质数 <Tex tex="p > 3" size={56} /></Mark>都成立
      </Text>
    </>
  );
};

const Pause: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 170, width: 1000, background: C.card, borderRadius: 32, padding: '34px 44px', textAlign: 'center', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
        <div style={{ fontSize: 50, fontWeight: 800 }}>
          <Tex tex="p" size={58} /> 是质数，<Tex tex="p > 3" size={58} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Tex tex="(p^2 + 17) \div 12" size={64} />
        </div>
        <div style={{ fontSize: 50, fontWeight: 900, color: C.primary, marginTop: 10 }}>余数是多少？</div>
      </div>
      <Choices x={90} y={540} items={CHOICES.map((c) => <Tex key={c} tex={c} size={60} />)} start={() => 10} />
    </>
  );
};

const makePause = (seconds: number, variant: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      {variant ? (
        <div style={{ position: 'absolute', left: 90, top: 220, width: 1000, background: C.card, borderRadius: 32, padding: '34px 44px', textAlign: 'center', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
          <div style={{ fontSize: 50, fontWeight: 800 }}>
            <Tex tex="p" size={58} /> 是质数，<Tex tex="p > 3" size={58} />
          </div>
          <div style={{ marginTop: 14 }}>
            <Tex tex="(5p^2 + 9) \div 12" size={64} />
          </div>
          <div style={{ fontSize: 50, fontWeight: 900, color: C.primary, marginTop: 10 }}>余数是多少？</div>
        </div>
      ) : (
        <Pause />
      )}
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// ----- test: the table -----

const ROWS = [
  { p: 5, sq: '5^2 = 25', sum: '25 + 17 = 42', rem: '42 = 3 \\times 12 + {\\color{#f59f0a}6}' },
  { p: 7, sq: '7^2 = 49', sum: '49 + 17 = 66', rem: '66 = 5 \\times 12 + {\\color{#f59f0a}6}' },
  { p: 11, sq: '11^2 = 121', sum: '121 + 17 = 138', rem: '138 = 11 \\times 12 + {\\color{#f59f0a}6}' },
  { p: 13, sq: '13^2 = 169', sum: '169 + 17 = 186', rem: '186 = 15 \\times 12 + {\\color{#f59f0a}6}' },
];
const TX = [50, 180, 520, 980]; // column x positions
const TW = [120, 330, 450, 610];
const TY0 = 215;
const TRH = 105;

const Test: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 9, 0.93);
  const hi = ease(f, at(scene, 9, 0.4), 14);
  const heads: (string | Part[])[] = ['p', 'p^2', 'p^2 + 17', [z('几个12'), '+', z('余数')]];
  const sizes = 50;
  const hdrSize = [54, 54, 54, 44];
  return (
    <>
      {/* header */}
      <div style={fadeUp(f, at(scene, 0, 0.55))}>
        {heads.map((h, c) => (
          <div key={c} style={{ position: 'absolute', left: TX[c], top: 130, width: TW[c], height: 70, display: 'flex', alignItems: 'center', justifyContent: c === 0 ? 'center' : 'flex-start', color: C.violet }}>
            <Z p={h} size={hdrSize[c]} />
          </div>
        ))}
        <div style={{ position: 'absolute', left: TX[0] - 20, top: 202, width: TX[3] + TW[3] - TX[0] + 20, height: 5, background: C.line, borderRadius: 3 }} />
      </div>
      {ROWS.map((r, i) => {
        const y = TY0 + i * TRH;
        const base = 1 + i * 2; // line index where "Start with five" etc. speaks
        const t0 = at(scene, base, 0.0);
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: TX[0], top: y, width: TW[0], height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, t0 + 4) }}>
              <div style={{ width: 96, height: 76, borderRadius: 22, background: C.violet, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.p}</div>
            </div>
            <Eq x={TX[1]} y={y + 8} size={sizes} tex={r.sq} start={at(scene, base, 0.35)} />
            <Eq x={TX[2]} y={y + 8} size={sizes} tex={r.sum} start={at(scene, base, 0.7)} />
            <Eq x={TX[3]} y={y + 8} size={sizes} tex={r.rem} start={at(scene, base + 1, 0.5)} />
          </div>
        );
      })}
      {/* highlight the column of remainders */}
      <div style={{ position: 'absolute', left: TX[3] - 20, top: 130, width: TW[3] + 20, height: TY0 + 4 * TRH - 130 - 5, borderRadius: 28, border: `7px solid ${GREEN}`, background: 'rgba(33,196,93,0.08)', opacity: hi }} />
      <Pill x={TX[3] + 140} y={TY0 + 4 * TRH + 8} color={AMBER} style={{ ...fadeUp(f, at(scene, 9, 0.3)), fontSize: 48 }}>
        总是 6！
      </Pill>
      <Answer x={1710} y={450} value="D" chime={CHIME} start={done} />
      {/* test is not proof */}
      <div style={{ position: 'absolute', left: 90, top: 735, display: 'flex', alignItems: 'center', gap: 30, ...fadeUp(f, at(scene, 10, 0.1)) }}>
        <div style={{ background: C.card, borderRadius: 24, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', fontSize: 50, fontWeight: 800, whiteSpace: 'nowrap' }}>
          试数 <Tex tex="\neq" size={56} /> 证明
        </div>
      </div>
      <div style={{ position: 'absolute', left: 840, top: 722, fontSize: 96, fontWeight: 900, color: VIOLET, ...fadeUp(f, at(scene, 10, 0.7)) }}>
        为什么？
      </div>
    </>
  );
};

// ----- columns -----

const GX = 110;
const GY = 215;
const CW = 118;
const RH = 90;
const PRIMES_SHOWN = [5, 7, 11, 13, 17, 19, 23, 29, 31];
const PX = 850;

const Msg: React.FC<{ start: number; end?: number; children: React.ReactNode }> = ({ start, end = Infinity, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const out = end === Infinity ? 1 : 1 - ease(f, end - 6, 10);
  return <div style={{ position: 'absolute', left: PX, top: 190, width: 1000, ...s, opacity: (s.opacity as number) * out }}>{children}</div>;
};

const Columns: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const crossAt = (c: number) => (c === 1 ? at(scene, 1, 0.72) : c === 3 ? at(scene, 1, 0.8) : c === 5 ? at(scene, 1, 0.88) : c === 2 ? at(scene, 2, 0.75) : 1e9);
  const frame15 = ease(f, at(scene, 3, 0.02), 14);
  const ring25 = ease(f, at(scene, 4, 0.35), 12);
  const ring23 = ease(f, at(scene, 5, 0.6), 12);
  const col1 = ease(f, at(scene, 6, 0.2), 12);
  const col5 = ease(f, at(scene, 6, 0.55), 12);
  const cellCenter = (n: number): [number, number] => {
    const r = Math.floor((n - 1) / 6);
    const c = (n - 1) % 6;
    return [GX + c * CW + CW / 2, GY + r * RH + RH / 2];
  };
  const outline = (c: number, color: string, op: number, dash?: boolean) => (
    <rect x={GX + c * CW + 4} y={GY - 4} width={CW - 8} height={6 * RH + 8} rx={22} fill="none" stroke={color} strokeWidth={7} opacity={op} strokeDasharray={dash ? '16 12' : undefined} />
  );
  return (
    <>
      {/* column headers */}
      {range(6).map((c) => (
        <div key={c} style={{ position: 'absolute', left: GX + c * CW, top: 140, width: CW, textAlign: 'center', fontSize: 52, fontWeight: 900, color: c === 0 || c === 4 ? (f >= at(scene, 3, 0) ? GREEN : VIOLET) : VIOLET, ...fadeUp(f, at(scene, 0, 0.05 + c * 0.04), 10) }}>
          {c + 1}
        </div>
      ))}
      <Stage>
        {range(36).map((i) => {
          const n = i + 1;
          const r = Math.floor(i / 6);
          const c = i % 6;
          const x = GX + c * CW;
          const y = GY + r * RH;
          const appear = ease(f, at(scene, 0, 0.12 + r * 0.1 + c * 0.01), 10);
          const cp = ease(f, crossAt(c), 12);
          const pi = PRIMES_SHOWN.indexOf(n);
          const gp = pi >= 0 ? ease(f, at(scene, 3, 0.2 + pi * 0.07), 10) : 0;
          const cx = x + CW / 2;
          const cy = y + RH / 2;
          return (
            <g key={n} opacity={appear}>
              <rect x={x + 5} y={y + 5} width={CW - 10} height={RH - 10} rx={16} fill={C.card} />
              <rect x={x + 5} y={y + 5} width={CW - 10} height={RH - 10} rx={16} fill="rgba(239,67,67,0.16)" opacity={cp} />
              <rect x={x + 5} y={y + 5} width={CW - 10} height={RH - 10} rx={16} fill="rgba(33,196,93,0.28)" stroke={GREEN} strokeWidth={5} opacity={gp} />
              <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={800} fontSize={50} fill={pi >= 0 && gp > 0.5 ? '#128a3e' : C.ink} opacity={1 - 0.55 * cp}>
                {n}
              </text>
              <line x1={x + 18} y1={cy + 2} x2={x + CW - 18} y2={cy + 2} stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - cp} opacity={cp > 0 ? 1 : 0} />
            </g>
          );
        })}
        {outline(0, GREEN, frame15, true)}
        {outline(4, GREEN, frame15, true)}
        {/* ring 25 */}
        {ring25 > 0 && <circle cx={cellCenter(25)[0]} cy={cellCenter(25)[1]} r={52} fill="none" stroke={AMBER} strokeWidth={8} opacity={ring25} />}
        {ring23 > 0 && [2, 3].map((n) => <circle key={n} cx={cellCenter(n)[0]} cy={cellCenter(n)[1]} r={52} fill="none" stroke={VIOLET} strokeWidth={8} opacity={ring23} />)}
        {outline(0, VIOLET, col1)}
        {outline(4, AMBER, col5)}
      </Stage>

      {/* right panel: one message at a time */}
      <Msg start={at(scene, 1, 0.1)} end={at(scene, 2, 0)}>
        <Say x={0} y={0} w={1000} start={at(scene, 1, 0.1)} size={54} weight={800}>比 3 大的质数不是偶数</Say>
        <Say x={0} y={90} w={1000} start={at(scene, 1, 0.35)} size={48} color={C.red}>不然就能被 2 整除</Say>
      </Msg>
      <Msg start={at(scene, 2, 0.1)} end={at(scene, 3, 0)}>
        <Say x={0} y={0} w={1000} start={at(scene, 2, 0.1)} size={54} weight={800}>也不是 3 的倍数</Say>
      </Msg>
      <Msg start={at(scene, 3, 0.05)} end={at(scene, 4, 0)}>
        <Say x={0} y={0} w={1000} start={at(scene, 3, 0.05)} size={54} weight={900}>只剩下第 <span style={{ color: GREEN }}>1</span> 列和第 <span style={{ color: GREEN }}>5</span> 列</Say>
        <Say x={0} y={90} w={1000} start={at(scene, 3, 0.45)} size={48} color={GREEN}>比 3 大的质数都落在这两列</Say>
      </Msg>
      <Msg start={at(scene, 4, 0.2)} end={at(scene, 5, 0)}>
        <Eq x={0} y={0} size={64} tex="25 = 5 \times 5" start={at(scene, 4, 0.35)} color={AMBER} />
        <Say x={0} y={100} w={1000} start={at(scene, 4, 0.55)} size={48} color={AMBER}>在第 1 列，但不是质数</Say>
      </Msg>
      <Msg start={at(scene, 5, 0.1)} end={at(scene, 6, 0)}>
        <Say x={0} y={0} w={1000} start={at(scene, 5, 0.15)} size={54} weight={900}>所以题目要求 <Tex tex="p > 3" size={56} /></Say>
        <Say x={0} y={90} w={1000} start={at(scene, 5, 0.6)} size={48} color={VIOLET}>2 和 3：已经被划掉了</Say>
      </Msg>
      <div style={{ position: 'absolute', left: PX, top: 175, width: 960, height: 210, borderRadius: 28, background: C.card, boxShadow: '0 6px 20px rgba(30,40,80,0.07)', border: `6px solid ${VIOLET}`, boxSizing: 'border-box', padding: '16px 34px', ...fadeUp(f, at(scene, 6, 0.15)) }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: VIOLET }}>第 1 列：6 的倍数多 1</div>
        <div style={{ marginTop: 8, whiteSpace: 'nowrap' }}>
          <Tex tex="7 = 6 + 1" size={56} /> <span style={{ display: 'inline-block', width: 50 }} /> <Tex tex="13 = 12 + 1" size={56} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: PX, top: 415, width: 960, height: 210, borderRadius: 28, background: C.card, boxShadow: '0 6px 20px rgba(30,40,80,0.07)', border: `6px solid ${AMBER}`, boxSizing: 'border-box', padding: '16px 34px', ...fadeUp(f, at(scene, 6, 0.55)) }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: AMBER }}>第 5 列：6 的倍数少 1</div>
        <div style={{ marginTop: 8, whiteSpace: 'nowrap' }}>
          <Tex tex="5 = 6 - 1" size={56} /> <span style={{ display: 'inline-block', width: 50 }} /> <Tex tex="11 = 12 - 1" size={56} />
        </div>
      </div>
    </>
  );
};

// ----- neighbors: the dot rectangle -----

const DX0 = 320;
const DY0 = 260;
const SP = 62;
const DR = 21;
const dpos = (c: number, r: number): [number, number] => [DX0 + c * SP, DY0 + r * SP];

const Neighbors: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const gut = 7.1;
  const dots: React.ReactNode[] = [];
  const move0 = at(scene, 2, 0.5);
  const cornerRed = at(scene, 2, 0.1);
  const cornerGone = at(scene, 2, 0.25);
  const dotStart = at(scene, 1, 0.1);
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const s = pop(f, dotStart + (r * 7 + c) * 1.2);
      if (s <= 0.01) continue;
      let [x, y] = dpos(c, r);
      let fill: string = C.ink;
      let scale = s;
      if (r === 6 && c === 6) {
        if (f >= cornerRed) fill = C.red;
        scale = s * (1 - ease(f, cornerGone, 10));
      } else if (r === 6) {
        const j = 5 - c;
        const t0 = move0 + j * 7;
        const u = ease(f, t0, 44);
        if (f >= at(scene, 2, 0.45)) fill = AMBER;
        if (u > 0) {
          const path: [number, number][] = [dpos(c, 6), dpos(c, gut), dpos(7, gut), dpos(7, j)];
          [x, y] = along(path, u);
        }
      }
      if (scale <= 0.01) continue;
      dots.push(<circle key={`${c}-${r}`} cx={x} cy={y} r={DR * scale} fill={fill} />);
    }
  }
  const lab = (text: string, x: number, y: number, op: number, size = 56, color: string = C.violet) =>
    op > 0 ? (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily={ZH_FONT} fontWeight={900} fontSize={size} fill={color} opacity={op}>
        {text}
      </text>
    ) : null;
  const land = move0 + 5 * 7 + 44;
  const seven = ease(f, at(scene, 1, 0.55), 12) * (1 - ease(f, land - 8, 10));
  const eight = ease(f, land - 4, 12);
  const [tx0] = dpos(0, 0);
  const [tx6] = dpos(6, 0);
  const [tx7] = dpos(7, 0);
  const top = DY0 - 52;
  const brace = (x1: number, x2: number, op: number, color: string) => (
    <path d={`M ${x1} ${top + 10} L ${x1} ${top} L ${x2} ${top} L ${x2} ${top + 10}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
  const lx = DX0 - 52;
  const lbrace = (r2: number, op: number, color: string) => (
    <path d={`M ${lx + 10} ${DY0 - 20} L ${lx} ${DY0 - 20} L ${lx} ${DY0 + r2 * SP + 20} L ${lx + 10} ${DY0 + r2 * SP + 20}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
  const rectOp = ease(f, land - 4, 14);
  return (
    <>
      <Stage>
        {/* the 7x7 square */}
        <rect x={DX0 - 34} y={DY0 - 34} width={6 * SP + 68} height={6 * SP + 68} rx={26} fill="none" stroke={VIOLET} strokeWidth={6} opacity={ease(f, at(scene, 1, 0.5), 14) * (1 - ease(f, at(scene, 2, 0.45), 10))} />
        {/* the 6x8 rectangle */}
        <rect x={DX0 - 34} y={DY0 - 34} width={7 * SP + 68} height={5 * SP + 68} rx={26} fill="rgba(33,196,93,0.08)" stroke={GREEN} strokeWidth={7} opacity={rectOp} />
        {dots}
        {/* labels */}
        {brace(tx0 - 20, tx6 + 20, seven, VIOLET)}
        {lab('7', (tx0 + tx6) / 2, top - 38, seven)}
        {lbrace(6, seven, VIOLET)}
        {lab('7', lx - 40, DY0 + 3 * SP, seven)}
        {brace(tx0 - 20, tx7 + 20, eight, GREEN)}
        {lab('8 列', (tx0 + tx7) / 2, top - 38, eight, 52, GREEN)}
        {lbrace(5, eight, GREEN)}
        {lab('6', lx - 50, DY0 + 2.5 * SP - 30, eight, 52, GREEN)}
        {lab('行', lx - 55, DY0 + 2.5 * SP + 30, eight, 44, GREEN)}
      </Stage>
      <Eq x={PX - 40} y={150} size={54} tex={['p =', z('6的倍数'), '\\pm 1']} start={at(scene, 0, 0.45)} />
      <Eq x={PX - 40} y={235} size={54} tex="7 \times 7 = 49" start={at(scene, 1, 0.5)} end={at(scene, 5, 0)} />
      <Eq x={PX - 40} y={315} size={54} tex="6 \times 8 = 48" start={at(scene, 3, 0.75)} end={at(scene, 5, 0)} color={GREEN} />
      <Eq x={PX - 40} y={395} size={54} tex="6 = 7 - 1 \qquad 8 = 7 + 1" start={at(scene, 4, 0.4)} end={at(scene, 5, 0)} />
      <Eq x={PX - 40} y={235} size={56} tex="p^2 - 1 = (p-1)(p+1)" start={at(scene, 5, 0.3)} />
      {/* tags on the two factors */}
      <div style={{ position: 'absolute', left: PX - 40, top: 330, display: 'flex', gap: 24, ...fadeUp(f, at(scene, 6, 0.15)) }}>
        {[
          { t: 'p - 1', ex: '7 - 1 = 6', col: GREEN, st: 0.2 },
          { t: 'p + 1', ex: '7 + 1 = 8', col: AMBER, st: 0.55 },
        ].map((b) => (
          <div key={b.t} style={{ width: 500, background: C.card, border: `6px solid ${b.col}`, borderRadius: 26, boxSizing: 'border-box', padding: '10px 24px', textAlign: 'center', ...fadeUp(f, at(scene, 6, b.st)) }}>
            <Tex tex={b.t} size={58} />
            <div style={{ marginTop: 2 }}>
              <Tex tex={b.ex} size={50} />
            </div>
          </div>
        ))}
      </div>
      <Say x={PX - 40} y={548} w={1050} start={at(scene, 6, 0.6)} size={44} color={C.violet}>一个是 6 的倍数，另一个是偶数</Say>
      <Eq x={PX - 40} y={640} size={50} tex={[z('6的倍数'), '\\times', z('偶数'), '=', z('12的倍数')]} start={at(scene, 7, 0.1)} color={GREEN} />
      <Eq x={PX - 40} y={725} size={50} tex="6a \times 2b = 12ab" start={at(scene, 7, 0.55)} />
    </>
  );
};

// ----- finish -----

const Finish: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 1, 0.93);
  return (
    <>
      <Eq x={110} y={170} size={68} tex={['p^2 =', z('12的倍数'), '+ 1']} start={at(scene, 0, 0.1)} />
      <Eq x={110} y={290} size={68} tex="17 = 12 + 5" start={at(scene, 0, 0.6)} color={AMBER} />
      <Eq x={110} y={440} size={80} tex="1 + 5 = 6" start={at(scene, 1, 0.25)} color={GREEN} />
      <Answer x={1480} y={420} value="6" chime={CHIME} start={done} />
      <Pill x={1380} y={570} color={C.green} style={{ ...fadeUp(f, done + 6), fontSize: 52 }}>选项 D</Pill>
      <Confetti x={1480} y={420} start={done} seed={7} />
      <Pill x={110} y={640} color={C.violet} style={{ ...fadeUp(f, at(scene, 2, 0.15)), fontSize: 48 }}>
        要确保规律不会被打破时，就用这种方法
      </Pill>
    </>
  );
};

// ----- traps -----

type Trap = { letter: string; val: string; tex: string | Part[]; size: number; sub: string; line: number; x: number; y: number };
const TRAPS: Trap[] = [
  { letter: 'B', val: '1', tex: ['p^2', z('余'), '1'], size: 54, sub: '忘了加 17', line: 1, x: 80, y: 205 },
  { letter: 'C', val: '5', tex: '17 = 12 + 5', size: 54, sub: '忘了 p²', line: 2, x: 980, y: 205 },
  { letter: 'A', val: '0', tex: '7 + 17 = 24 = 2 \\times 12', size: 48, sub: '忘了平方（只对 p = 7）', line: 3, x: 80, y: 410 },
  { letter: 'E', val: '11', tex: [z('除以'), '12', z('的最大余数')], size: 54, sub: '但余数永远不会是 11', line: 4, x: 980, y: 410 },
];

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={110} y={125} w={1500} size={50} weight={900} style={fadeUp(f, at(scene, 0, 0.3))}>
        每个错误答案都是一个陷阱
      </Text>
      {TRAPS.map((t) => (
        <div key={t.letter} style={{ position: 'absolute', left: t.x, top: t.y, width: 860, height: 190, boxSizing: 'border-box', background: C.card, borderRadius: 28, border: `6px solid ${C.red}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 28px', boxShadow: '0 8px 24px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, t.line, 0.1)) }}>
          <div style={{ width: 130, height: 130, flex: '0 0 130px', borderRadius: 26, background: C.red, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{t.letter}</div>
            <div style={{ fontSize: 68, fontWeight: 900 }}>{t.val}</div>
          </div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <Z p={t.tex} size={t.size} />
            <div style={{ fontSize: 44, fontWeight: 800, color: C.red, marginTop: 4, ...fadeUp(f, at(scene, t.line, 0.45)) }}>{t.sub}</div>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 80, top: 630, width: 1760, height: 170, boxSizing: 'border-box', background: C.card, borderRadius: 28, border: `6px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, boxShadow: '0 8px 24px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 5, 0.15)) }}>
        {[
          ['求每部分的余数', C.violet, 0.3],
          ['相加', C.blue, 0.58],
          ['拿掉多余的 12', GREEN, 0.78],
        ].map(([t, col, st], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, ...fadeUp(f, at(scene, 5, st as number), 10) }}>
            {i > 0 && <Tex tex="\to" size={64} color={C.muted} />}
            <div style={{ background: col as string, color: '#fff', borderRadius: 999, padding: '10px 32px', fontSize: 46, fontWeight: 900, whiteSpace: 'nowrap' }}>{t}</div>
          </div>
        ))}
      </div>
    </>
  );
};

// ----- variant -----

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={120} y={170} color={C.violet} style={fadeUp(f, at(scene, 0, 0.1))}>轮到你了！</Pill>
      <div style={{ position: 'absolute', left: 120, top: 290, display: 'flex', alignItems: 'center', gap: 20, fontSize: 56, fontWeight: 800, ...fadeUp(f, at(scene, 0, 0.5)) }}>
        <Tex tex="p" size={64} /> 是质数，<Tex tex="p > 3" size={64} />
      </div>
      <Eq x={120} y={430} size={84} tex="(5p^2 + 9) \div 12 = {\color{#0cc281}?}" start={at(scene, 1, 0.3)} />
      <Text x={120} y={580} w={1400} size={54} weight={900} color={C.primary} style={fadeUp(f, at(scene, 1, 0.7))}>
        余数是多少？
      </Text>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 2, 0.93);
  return (
    <>
      <Eq x={110} y={150} size={60} tex={['p^2 =', z('12的倍数'), '+ 1']} start={at(scene, 0, 0.5)} />
      <Eq x={110} y={250} size={60} tex={['5p^2 =', z('12的倍数'), '+ 5']} start={at(scene, 1, 0.35)} />
      <Eq x={110} y={350} size={60} tex="5 + 9 = 14 = 12 + {\color{#f59f0a}2}" start={at(scene, 2, 0.3)} color={C.ink} />
      <Answer x={1560} y={420} value="2" chime={CHIME} start={done} />
      <Pill x={1400} y={575} color={C.green} style={{ ...fadeUp(f, done + 6), fontSize: 48 }}>余数 2</Pill>
      <Eq x={110} y={500} size={60} tex="5 \times 25 + 9 = 134" start={at(scene, 3, 0.6)} />
      <Eq x={110} y={600} size={60} tex="134 = 11 \times 12 + {\color{#f59f0a}2}" start={at(scene, 4, 0.25)} />
      <Eq x={1000} y={604} size={64} tex="\checkmark" start={at(scene, 4, 0.7)} color={GREEN} />
      <Text x={110} y={720} w={1500} size={50} weight={900} color={C.primary} style={fadeUp(f, at(scene, 5, 0.2))}>
        余数是 2：太棒了！
      </Text>
    </>
  );
};

// ----- recap -----

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2, 0.0));
  const lit = ease(f, at(scene, 0, 0.55), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 130, top: 150, width: 1660, height: 640, background: C.card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 60, top: 40, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 60, top: 110, width: 1500, fontSize: 52, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.1)) }}>
          每个大于 3 的质数，都和 6 的倍数只差 1
        </div>
        <div style={{ position: 'absolute', left: 60 - 33, top: 372, width: 200, whiteSpace: 'nowrap', textAlign: 'center', ...fadeUp(f, at(scene, 0, 0.7)) }}>
          <Tex tex="6k + 1" size={50} color={GREEN} />
        </div>
        <div style={{ position: 'absolute', left: 60 + 4 * 134 - 33, top: 372, width: 200, whiteSpace: 'nowrap', textAlign: 'center', ...fadeUp(f, at(scene, 0, 0.8)) }}>
          <Tex tex="6k - 1" size={50} color={GREEN} />
        </div>
        <div style={{ position: 'absolute', left: 60, top: 270, display: 'flex', gap: 14 }}>
          {range(6).map((c) => {
            const on = c === 0 || c === 4;
            return (
              <div key={c} style={{ width: 120, height: 100, borderRadius: 22, background: on ? `rgba(33,196,93,${0.12 + 0.88 * lit})` : C.bg, border: `5px solid ${on ? GREEN : C.line}`, color: on && lit > 0.5 ? '#fff' : C.ink, fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.3 + c * 0.04), 10) }}>
                {c + 1}
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 60, top: 470, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.15)) }}>
          <Z p={['p^2', z('除以'), '12', z('总是余'), '1']} size={64} color={GREEN} />
        </div>
        <div style={{ position: 'absolute', left: 60, top: 570, fontSize: 52, fontWeight: 900, color: AMBER, ...fadeUp(f, at(scene, 1, 0.6)) }}>
          再把其余部分加上
        </div>
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="继续多问为什么！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, false),
  test: Test,
  columns: Columns,
  neighbors: Neighbors,
  finish: Finish,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

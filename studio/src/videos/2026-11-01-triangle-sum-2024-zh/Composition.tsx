import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Confetti, Mark } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-01-triangle-sum-2024-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GREY = '#c7ccd8';
const DARKGREY = '#6b7280';
const SOFTRED = 'rgba(239, 67, 67, 0.12)';
const SOFTGREEN = 'rgba(33, 196, 93, 0.16)';
const COL: Record<string, string> = { '16': C.primary, '11': C.violet, '23': C.amber, '81': C.primary, '25': C.violet, '2': GREY, '8': C.primary };
const card: React.CSSProperties = { background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' };

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
const z = (t: string): Part => ({ z: t });

// ---------- helpers ----------

const win = (f: number, a: number, b: number) => ease(f, a, 10) * (1 - ease(f, b, 10));

/** Tex placed absolutely; centred on x when `w` is given. */
const Eq: React.FC<{ x: number; y: number; start: number; tex: string | Part[]; size?: number; color?: string; o?: number; w?: number }> = ({ x, y, start, tex, size = 56, color = C.ink, o = 1, w }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const base: React.CSSProperties = { position: 'absolute', top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * o };
  return w ? (
    <div style={{ ...base, left: x - w / 2, width: w, textAlign: 'center' }}><Z p={tex} size={size} color={color} /></div>
  ) : (
    <div style={{ ...base, left: x }}><Z p={tex} size={size} color={color} /></div>
  );
};

/** Plain text placed absolutely. */
const T: React.FC<{ x: number; y: number; start: number; size?: number; weight?: number; color?: string; w?: number; o?: number; align?: 'left' | 'center'; children: React.ReactNode }> = ({ x, y, start, size = 44, weight = 800, color = C.ink, w = 900, o = 1, align = 'left', children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: align === 'center' ? x - w / 2 : x, top: y, width: w, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight: 1.25, ...s, opacity: (s.opacity as number) * o }}>
      {children}
    </div>
  );
};

/** Factor tile: whole, never split. */
const Tile: React.FC<{ x: number; y: number; v: string; w?: number; h?: number; o?: number; size?: number; ring?: number; label?: string; tick?: number }> = ({ x, y, v, w = 150, h = 100, o = 1, size = 60, ring = 0, label, tick = 0 }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, transform: `translateY(${(1 - Math.min(1, o)) * 20}px)` }}>
      <div style={{ width: w, height: h, borderRadius: 24, background: COL[v] ?? C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, boxShadow: '0 6px 16px rgba(30,40,80,0.18)' }}>{v}</div>
      {ring > 0 && <div style={{ position: 'absolute', left: -10, top: -10, right: -10, bottom: -10, border: `8px solid ${C.green}`, borderRadius: 32, opacity: ring }} />}
      {tick > 0 && <div style={{ position: 'absolute', right: -16, top: -22, opacity: tick }}><Mk ok size={52} /></div>}
      {label && <div style={{ position: 'absolute', top: h + 6, left: -40, width: w + 80, textAlign: 'center', fontSize: 38, fontWeight: 800, color: DARKGREY }}>{label}</div>}
    </div>
  );

/** Round tick / cross badge. */
const Mk: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 54 54" style={{ flex: 'none' }}>
    <circle cx={27} cy={27} r={27} fill={ok ? C.green : C.red} />
    {ok ? <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M17 17 L37 37 M37 17 L17 37" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />}
  </svg>
);

/** Choices A-E, all at least 48 px. */
export const CHOICES = ['253', '483', '528', '736', '1012'];
const Chips: React.FC<{ x: number; y: number; start: (i: number) => number; state?: Record<number, 'red' | 'green' | 'amber'>; size?: number }> = ({ x, y, start, state = {}, size = 60 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CHOICES.map((c, i) => {
        const st = state[i];
        const bg = st === 'red' ? SOFTRED : st === 'green' ? SOFTGREEN : st === 'amber' ? 'rgba(245,159,10,0.16)' : C.card;
        const bd = st === 'red' ? C.red : st === 'green' ? C.green : st === 'amber' ? C.amber : 'transparent';
        return (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), display: 'flex', alignItems: 'baseline', gap: 12, background: bg, border: `6px solid ${bd}`, borderRadius: 20, padding: '8px 24px', fontSize: size, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
            <span style={{ color: C.muted, fontSize: 48 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        );
      })}
    </div>
  );
};


/** Neighbor-walk row: [a] [multiple] [b]. Marks: 'x' | 'ok' | null with their start frames. */
type WalkRowProps = {
  x: number; y: number; a: number; m: number; b: number; tint: string[]; start: number;
  aMark?: [boolean, number] | null; bMark?: [boolean, number] | null; o?: number; w?: number; outline?: boolean; hideNb?: boolean;
};
const Walk: React.FC<WalkRowProps> = ({ x, y, a, m, b, tint, start, aMark, bMark, o = 1, w = 260, outline, hideNb }) => {
  const f = useCurrentFrame();
  const s = outline ? ease(f, start, 12) : fadeUp(f, start, 12).opacity as number;
  const nb = (v: number, mk?: [boolean, number] | null) => (
    <div style={{ width: w, height: 100, borderRadius: 22, background: outline ? 'transparent' : C.card, border: outline ? `5px dashed ${GREY}` : '5px solid transparent', boxShadow: outline ? 'none' : '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 56, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap' }}>
      {!outline && v}
      {!outline && mk && <div style={{ opacity: ease(f, mk[1], 8), transform: `scale(${0.6 + 0.4 * ease(f, mk[1], 8)})` }}><Mk ok={mk[0]} /></div>}
    </div>
  );
  const bg = `linear-gradient(90deg, ${tint.join(', ')})`;
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 16, opacity: s * o }}>
      {hideNb ? <div style={{ width: w }} /> : nb(a, aMark)}
      <div style={{ width: w + 40, height: 110, borderRadius: 24, background: outline ? 'transparent' : bg, border: outline ? `5px dashed ${GREY}` : '5px solid rgba(30,40,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900 }}>
        {outline ? <span style={{ fontSize: 44, color: C.muted }}>倍数</span> : m}
      </div>
      {hideNb ? null : nb(b, bMark)}
    </div>
  );
};

/** Pile summary at the left of the walk panel. */
const Pile: React.FC<{ tiles: string[]; other: string[]; prod: string; label: string; start: number; o?: number }> = ({ tiles, other, prod, label, start, o = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: 80, top: 150, width: 500, height: 560, ...card, padding: 28, ...s, opacity: (s.opacity as number) * o }}>
      <div style={{ fontSize: 44, fontWeight: 900, color: C.primary }}>{label}</div>
      <div style={{ marginTop: 24, fontSize: 38, fontWeight: 800, color: DARKGREY }}>放在倍数里</div>
      <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
        {tiles.map((v) => (
          <div key={v} style={{ width: 120, height: 90, borderRadius: 22, background: COL[v], color: '#fff', fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 56, fontWeight: 900 }}>{prod}</div>
      {other.length > 0 && (
        <>
          <div style={{ marginTop: 22, fontSize: 38, fontWeight: 800, color: DARKGREY }}>相邻数要含有</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
            {other.map((v) => (
              <div key={v} style={{ width: 120, height: 90, borderRadius: 22, background: COL[v], color: '#fff', fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Ref: React.FC<{ x: number; y: number; start: number; label: string; items: string; o?: number }> = ({ x, y, start, label, items, o = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontSize: 38, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap', ...fadeUp(f, start), opacity: ease(f, start, 12) * o }}>
      {label} <span style={{ color: DARKGREY }}>{items}</span>
    </div>
  );
};

const Badge: React.FC<{ x: number; y: number; text: string; start: number; chimeAt: number; size?: number; h?: number; w?: number }> = ({ x, y, text, start, chimeAt, size = 110, w = 520, h = 190 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={chimeAt} durationInFrames={60} layout="none"><Audio src={CHIME} volume={0.3} /></Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 60, background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {text}
        </div>
      )}
    </>
  );
};

const makePause = (year: string, withChoices: boolean, seconds: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 150, width: 1100, ...fadeUp(f, 6) }}>
        <div><Z p={[z('求最小的正整数'), 'n', z('，')]} size={60} /></div>
        <div style={{ marginTop: 10, whiteSpace: 'nowrap' }}><Z p={[z('使'), '1+2+\\cdots+n', z('能被'), year, z('整除')]} size={60} /></div>
      </div>
      {withChoices && <Chips x={90} y={400} start={() => 12} size={52} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={460} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // counter ticks 1..20 only, so the total stops at 210 (never a choice value)
  const endTick = at(scene, 0, 0.85);
  const k = Math.max(1, Math.min(20, Math.round(ease(f, 6, endTick - 6) * 20)));
  const total = (k * (k + 1)) / 2;
  const sumTex = k <= 3 ? [1, 2, 3].slice(0, k).join('+') : `1+2+3+\\cdots+${k}`;
  const out1 = 1 - ease(f, at(scene, 1, 0.05), 12);
  const badgeIn = ease(f, at(scene, 1, 0.1), 14);
  const out2 = 1 - ease(f, at(scene, 2), 10);
  const titleIn = ease(f, at(scene, 2, 0.05), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: out1 }}>
        <Tex tex={sumTex} size={100} />
        <div style={{ marginTop: 30, fontSize: 70, fontWeight: 900, color: C.primary }}>总和 = {total}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', opacity: badgeIn * out2, transform: `scale(${0.85 + 0.15 * badgeIn})` }}>
        <div><Tex tex={'1+2+3+\\cdots'} size={90} color={C.muted} /></div>
        <div style={{ marginTop: 26, display: 'inline-block', padding: '10px 70px', borderRadius: 60, background: C.card, boxShadow: '0 8px 30px rgba(30,40,80,0.1)' }}>
          <Tex tex={'2024\\ ?'} size={130} color={C.violet} />
        </div>
        <div style={{ marginTop: 20, fontSize: 52, fontWeight: 800, color: DARKGREY }}>是 2024 的倍数吗？</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: titleIn, transform: `translateY(${(1 - titleIn) * 24}px)` }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 150, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 56, fontWeight: 900, marginTop: 10 }}>一起来找一个数</div>
        <div style={{ marginTop: 24 }}><Z p={['1+2+\\cdots+n', z('与'), '2024']} size={70} color={C.primary} /></div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 190, width: 1680, padding: '40px 50px', ...card, ...fadeUp(f, 4) }}>
        <div style={{ opacity: 1 }}>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.5 }}>
            <span style={{ opacity: ease(f, at(scene, 0, 0.05), 10) }}>求<Mark on={at(scene, 0, 0.5)}>最小的正整数 <Tex tex="n" size={64} /></Mark>，</span>
            <br />
            <span style={{ opacity: ease(f, at(scene, 1, 0.05), 10) }}>使得 <span style={{ whiteSpace: 'nowrap' }}><Tex tex="1+2+\cdots+n" size={64} /></span> <Mark on={at(scene, 1, 0.55)}>能被 <Tex tex="2024" size={64} /> 整除</Mark>。</span>
          </div>
        </div>
      </div>
      <Chips x={150} y={560} start={(i) => at(scene, 2, 0.25 + i * 0.1)} size={64} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', ...fadeUp(f, 4) }}>
        <Tex tex={'1+2+3+\\cdots+\\textcolor{#0cc281}{n}'} size={110} />
      </div>
      <div style={{ position: 'absolute', left: 560, top: 300, width: 800, textAlign: 'center', fontSize: 44, fontWeight: 800, color: C.primary, opacity: ease(f, at(scene, 0, 0.6), 12) }}>
        从 1 到 n 的每一个整数
      </div>
      <div style={{ position: 'absolute', left: 160, top: 470, width: 1600, padding: '30px 40px', textAlign: 'center', ...card, ...fadeUp(f, at(scene, 1, 0.05)) }}>
        <Z p={[z('总和'), '\\div 2024 =', z('整数')]} size={72} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', ...fadeUp(f, at(scene, 1, 0.7)) }}>
        <span style={{ fontSize: 66, fontWeight: 900, color: '#fff', background: C.violet, borderRadius: 999, padding: '10px 50px' }}>最小的 n</span>
      </div>
    </>
  );
};

const Sum: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cols = ['1', '2', '3', '\\cdots', 'n'];
  const rev = ['n', 'n-1', 'n-2', '\\cdots', '1'];
  const cx = (i: number) => 520 + i * 230;
  const r1 = 140, r2 = 245;
  const l1 = (i: number) => ease(f, at(scene, 0, 0.35 + i * 0.05), 10);
  const l2 = (i: number) => ease(f, at(scene, 0, 0.7 + i * 0.04), 10);
  const glow = ease(f, at(scene, 1, 0.05), 14);
  const lbl = ease(f, at(scene, 1, 0.3), 14);
  const sum2 = ease(f, at(scene, 2, 0.08), 14);
  const fin = ease(f, at(scene, 2, 0.5), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: r1 + 4, fontSize: 44, fontWeight: 800, color: DARKGREY, opacity: ease(f, at(scene, 0, 0.3), 10) }}>正着写</div>
      <div style={{ position: 'absolute', left: 120, top: r2 + 4, fontSize: 44, fontWeight: 800, color: DARKGREY, opacity: ease(f, at(scene, 0, 0.65), 10) }}>倒着写</div>
      {cols.map((c, i) => (
        <div key={i}>
          <div style={{ position: 'absolute', left: cx(i) - 100, top: r1, width: 200, textAlign: 'center', opacity: l1(i) }}><Tex tex={c} size={72} /></div>
          <div style={{ position: 'absolute', left: cx(i) - 100, top: r2, width: 200, textAlign: 'center', whiteSpace: 'nowrap', opacity: l2(i) }}><Tex tex={rev[i]} size={60} color={C.violet} /></div>
          {c !== '\\cdots' && (
            <div style={{ position: 'absolute', left: cx(i) - 102, top: r1 - 18, width: 204, height: 232, borderRadius: 28, border: `6px solid ${C.primary}`, background: C.primarySoft, opacity: glow }} />
          )}
          <div style={{ position: 'absolute', left: cx(i) - 100, top: 375, width: 200, textAlign: 'center', opacity: lbl }}>
            {c !== '\\cdots' ? <Tex tex={'n+1'} size={64} color={C.primary} /> : <Tex tex={'\\cdots'} size={64} color={C.primary} />}
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: cx(0) - 85, top: 460, width: cx(4) - cx(0) + 170, textAlign: 'center', opacity: lbl }}>
        <div style={{ height: 10, borderRadius: 5, background: C.primary }} />
        <div style={{ fontSize: 50, fontWeight: 900, color: C.primary, marginTop: 8 }}><Z p={['n', z('列')]} size={56} color={C.primary} /></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 556, textAlign: 'center', opacity: sum2 * (1 - 0.35 * fin) }}>
        <Z p={['2\\times', z('总和'), '= n(n+1)']} size={64} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', opacity: fin, transform: `translateY(${(1 - fin) * 20}px)` }}>
        <Z p={[z('总和'), '= \\dfrac{n(n+1)}{2}']} size={72} color={C.violet} />
      </div>
    </>
  );
};

const Double: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tileO = (i: number) => ease(f, at(scene, 2, 0.2 + i * 0.18), 12);
  return (
    <>
      <Eq x={110} y={125} start={at(scene, 0, 0.1)} tex={['\\dfrac{n(n+1)}{2}', z('能被'), '2024', z('整除')]} size={60} />
      <Eq x={110} y={325} start={at(scene, 1, 0.1)} tex={['n(n+1)', z('能被'), '2\\times 2024 = 4048', z('整除')]} size={60} />
      <Eq x={110} y={435} start={at(scene, 2, 0.05)} tex={'4048 = 16\\times 11\\times 23'} size={70} />
      <Tile x={210} y={565} v="16" o={tileO(0)} />
      <Tile x={560} y={565} v="11" o={tileO(1)} />
      <Tile x={910} y={565} v="23" o={tileO(2)} />
      <T x={110} y={690} start={at(scene, 2, 0.45)} w={760} size={44} color={DARKGREY}><Tex tex={'16 = 2\\times2\\times2\\times2'} size={52} color={DARKGREY} /></T>
      <T x={110} y={765} start={at(scene, 2, 0.75)} w={1200} size={44} color={DARKGREY}>4 个因数 2 &nbsp;·&nbsp; 11 和 23 是质数</T>
    </>
  );
};

// neighbor boxes
const BX = [300, 760];
const Neighbors: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const boxOut = 1 - ease(f, at(scene, 4, 0.1), 12);
  const toggle = ease(f, at(scene, 0, 0.55), 10);
  const tagO = ease(f, at(scene, 0, 0.35), 10);
  const t16 = ease(f, at(scene, 1, 0.25), 16);
  const t11 = ease(f, at(scene, 2, 0.15), 12);
  const t11gone = ease(f, at(scene, 3, 0.05), 10);
  const diff = ease(f, at(scene, 2, 0.5), 12);
  const t11b = ease(f, at(scene, 3, 0.15), 14);
  const t23b = ease(f, at(scene, 3, 0.4), 14);
  const pileCards: { t: string[]; u: string[]; p: string; n: string }[] = [
    { t: ['16', '11'], u: ['23'], p: '176', n: '①' },
    { t: ['16', '23'], u: ['11'], p: '368', n: '②' },
    { t: ['11', '23'], u: ['16'], p: '253', n: '③' },
    { t: ['16', '11', '23'], u: [], p: '4048', n: '④' },
  ];
  return (
    <>
      <div style={{ opacity: boxOut }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: BX[i], top: 170, width: 400, height: 290, borderRadius: 36, ...card, border: `6px solid ${C.line}`, opacity: ease(f, 4 + i * 4, 10) }}>
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center' }}>
              <Tex tex={i === 0 ? 'n' : 'n+1'} size={64} color={DARKGREY} />
            </div>
          </div>
        ))}
        {/* odd tag toggles from n to n+1 */}
        <div style={{ position: 'absolute', left: BX[0] + 20 + toggle * (BX[1] - BX[0]), top: 100, opacity: tagO, ...{ background: C.amber, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: 44, fontWeight: 900, whiteSpace: 'nowrap' } }}>奇数：没有因数 2</div>
        <T x={BX[1] + 430} y={200} start={at(scene, 0, 0.6)} w={600} size={44} color={DARKGREY}>哪一个都可能是奇数</T>
        {/* 16 tile drops into the even box (n) */}
        <Tile x={BX[0] + 30} y={310 - (1 - t16) * 220} v="16" o={t16} />
        {/* 11 tries both */}
        <Tile x={BX[0] + 240} y={330} v="11" w={110} h={80} size={50} o={t11 * (1 - t11gone)} />
        <Tile x={BX[1] + 145} y={330} v="11" w={110} h={80} size={50} o={t11 * (1 - t11gone)} />
        <div style={{ position: 'absolute', left: BX[0] + 150, top: 320, opacity: diff * (1 - t11gone) }} />
        <div style={{ position: 'absolute', left: 820, top: 480, opacity: diff * (1 - t11gone) }}><Mk ok={false} size={72} /></div>
        <T x={300} y={475} start={at(scene, 2, 0.5)} w={1000} size={44} color={C.red}><Tex tex={'(n+1)-n = 1'} size={64} color={C.red} /></T>
        {/* 11 and 23 each whole into a box */}
        <Tile x={BX[0] + 240} y={330} v="11" w={110} h={80} size={50} o={t11b} />
        <Tile x={BX[1] + 125} y={310 - (1 - t23b) * 200} v="23" o={t23b} />
      </div>
      {pileCards.map((pc, i) => {
        const o = ease(f, at(scene, 4, 0.12 + i * 0.12), 14);
        const x = 90 + i * 440;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: 150, width: 410, height: 560, ...card, border: `5px solid ${C.line}`, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
            <div style={{ position: 'absolute', left: 20, top: 8, fontSize: 56, fontWeight: 900, color: C.primary }}>{pc.n}</div>
            <div style={{ position: 'absolute', left: 20, top: 86, lineHeight: 1.1, fontSize: 34, fontWeight: 800, color: DARKGREY }}>一个相邻数</div>
            <div style={{ position: 'absolute', left: 20, top: 130, display: 'flex', gap: 10 }}>
              {pc.t.map((v) => <div key={v} style={{ width: 110, height: 80, borderRadius: 20, background: COL[v], color: '#fff', fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>)}
            </div>
            <div style={{ position: 'absolute', left: 20, top: 226, lineHeight: 1.1, fontSize: 34, fontWeight: 800, color: DARKGREY }}>另一个</div>
            <div style={{ position: 'absolute', left: 20, top: 280, display: 'flex', gap: 10, minHeight: 80 }}>
              {pc.u.length === 0 ? <div style={{ fontSize: 56, fontWeight: 800, color: C.muted, lineHeight: '80px' }}>无</div> : pc.u.map((v) => <div key={v} style={{ width: 110, height: 80, borderRadius: 20, background: COL[v], color: '#fff', fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>)}
            </div>
            <div style={{ position: 'absolute', left: 20, top: 386, lineHeight: 1.1, fontSize: 34, fontWeight: 800, color: DARKGREY }}>倍数</div>
            <div style={{ position: 'absolute', left: 20, top: 440, fontSize: 80, fontWeight: 900 }}>{pc.p}</div>
          </div>
        );
      })}
      <T x={90} y={735} start={at(scene, 4, 0.7)} w={1700} size={44} color={DARKGREY}>两个相邻数交换位置，还是同一组：所以两边都要检查。</T>
    </>
  );
};

// ---- walks ----
const TINT: Record<string, string> = { '16': 'rgba(12,194,129,0.28)', '11': 'rgba(123,97,255,0.26)', '23': 'rgba(245,159,10,0.30)' };
const tint = (...v: string[]) => (v.length === 1 ? [TINT[v[0]], TINT[v[0]]] : v.map((x) => TINT[x]));
const WX = 640;
const WY = [240, 370, 500, 630];

const Best: React.FC<{ start: number; o?: number; y?: number }> = ({ start, o = 1, y = 705 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: WX, top: y, display: 'flex', alignItems: 'center', gap: 20, padding: '12px 32px', borderRadius: 26, border: `5px solid ${DARKGREY}`, ...fadeUp(f, start), opacity: ease(f, start, 12) * o }}>
      <span style={{ fontSize: 44, fontWeight: 800, color: DARKGREY }}>目前最好</span>
      <Tex tex={'n = 528,\\ n+1 = 529'} size={56} />
    </div>
  );
};

const WalkA: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = tint('16', '11');
  const outline = 1 - ease(f, at(scene, 1, 0.05), 8);
  return (
    <>
      <Pile tiles={['16', '11']} other={['23']} prod="16 × 11 = 176" label="第①组" start={4} />
      <Ref x={WX} y={150} start={at(scene, 1, 0.1)} label="23 的倍数：" items="161, 184 | 345, 368 | 506, 529" />
      {outline > 0 && <Walk x={WX} y={WY[0]} a={0} m={0} b={0} tint={t} start={at(scene, 0, 0.35)} outline o={outline} />}
      <Walk x={WX} y={WY[0]} a={175} m={176} b={177} tint={t} start={at(scene, 1, 0.05)} aMark={[false, at(scene, 1, 0.55)]} bMark={[false, at(scene, 1, 0.7)]} />
      <Walk x={WX} y={WY[1]} a={351} m={352} b={353} tint={t} start={at(scene, 2, 0.05)} aMark={[false, at(scene, 2, 0.5)]} bMark={[false, at(scene, 2, 0.65)]} />
      <Walk x={WX} y={WY[2]} a={527} m={528} b={529} tint={t} start={at(scene, 3, 0.05)} aMark={[false, at(scene, 3, 0.4)]} bMark={[true, at(scene, 3, 0.7)]} />
      <T x={WX + 30} y={WY[2] + 118} start={at(scene, 3, 0.75)} w={560} size={54} color={C.green} weight={900}>
        <Tex tex={'529 = 23\\times 23'} size={56} color={C.green} />
      </T>
      <Best start={at(scene, 4, 0.35)} />
    </>
  );
};

const WalkB: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = tint('16', '23');
  const dim = 1 - 0.45 * ease(f, at(scene, 2, 0.1), 12);
  return (
    <>
      <Pile tiles={['16', '23']} other={['11']} prod="16 × 23 = 368" label="第②组" start={4} />
      <Ref x={WX} y={150} start={at(scene, 0, 0.3)} label="11 的倍数：" items="11 × 33 = 363, 11 × 34 = 374 | 726, 737" />
      <Walk x={WX} y={WY[0]} a={367} m={368} b={369} tint={t} start={at(scene, 0, 0.35)} aMark={[false, at(scene, 0, 0.7)]} bMark={[false, at(scene, 0, 0.85)]} />
      <Walk x={WX} y={WY[1]} a={735} m={736} b={737} tint={t} start={at(scene, 1, 0.05)} o={dim} aMark={[false, at(scene, 1, 0.3)]} bMark={[true, at(scene, 1, 0.8)]} />
      <T x={WX + 30} y={WY[1] + 118} start={at(scene, 1, 0.8)} w={560} size={54} color={C.green} weight={900} o={dim}>
        <Tex tex={'737 = 11\\times 67'} size={56} color={C.green} />
      </T>
      <div style={{ position: 'absolute', left: WX, top: 610, ...fadeUp(f, at(scene, 2, 0.3)) }}>
        <span style={{ display: 'inline-block', background: '#e6e9f1', color: DARKGREY, borderRadius: 999, padding: '8px 36px', fontSize: 56, fontWeight: 900 }}>
          <Tex tex={'736 > 528'} size={60} color={DARKGREY} /> &nbsp;更大，不是最小的
        </span>
      </div>
      <Best start={at(scene, 0, 0.1)} o={0.7} y={715} />
    </>
  );
};

const WalkC: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = tint('11', '23');
  const walkOut = 1 - ease(f, at(scene, 4, 0.05), 12);
  const ans = ease(f, at(scene, 4, 0.1), 10);
  const l3 = ease(f, at(scene, 3, 0.1), 12);
  return (
    <>
      <div style={{ opacity: walkOut }}>
        <Pile tiles={['11', '23']} other={['16']} prod="11 × 23 = 253" label="第③组" start={4} o={1 - 0.0} />
        <Ref x={WX} y={150} start={at(scene, 0, 0.5)} label="16 的倍数：" items="240, 256 | 496, 512" />
        <Walk x={WX} y={WY[0]} a={252} m={253} b={254} tint={t} start={at(scene, 1, 0.05)} o={1 - 0.0} aMark={[false, at(scene, 1, 0.3)]} bMark={[false, at(scene, 1, 0.38)]} />
        <Walk x={WX} y={WY[1]} a={505} m={506} b={507} tint={t} start={at(scene, 1, 0.45)} aMark={[false, at(scene, 1, 0.8)]} bMark={[false, at(scene, 1, 0.9)]} />
        <div style={{ position: 'absolute', left: WX + 280, top: WY[2], opacity: ease(f, at(scene, 2, 0.4), 12) }}>
          <div style={{ width: 300, height: 110, borderRadius: 24, background: '#e6e9f1', border: `5px solid ${GREY}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900 }}>759</div>
        </div>
        <T x={WX + 600} y={WY[2] + 20} start={at(scene, 2, 0.55)} w={600} size={44} color={DARKGREY}>超过 528：停</T>
        <div style={{ position: 'absolute', left: WX, top: WY[3], display: 'flex', alignItems: 'center', gap: 16, padding: '10px 26px', borderRadius: 26, background: '#eef0f5', opacity: l3 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>第④组</span>
          {['16', '11', '23'].map((v) => <div key={v} style={{ width: 100, height: 76, borderRadius: 18, background: GREY, color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>)}
          <span style={{ fontSize: 56, fontWeight: 900, color: C.muted }}>= 4048</span>
          <span style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>太大</span>
        </div>
      </div>
      <Badge x={960} y={280} text="n = 528" start={at(scene, 4, 0.45)} chimeAt={at(scene, 4, 0.88)} size={130} w={560} h={210} />
      <Confetti x={960} y={280} start={at(scene, 4, 0.45)} seed={7} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', opacity: ans * ease(f, at(scene, 4, 0.7), 12) }}>
        <Chips x={0} y={0} start={() => 0} state={{ 2: 'green' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', ...fadeUp(f, at(scene, 4, 0.65)) }}>
        <Tex tex={'1+2+\\cdots+528 = 139656 = 2024\\times 69'} size={52} color={DARKGREY} />
      </div>
    </>
  );
};

const Choices: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const RX = 640;
  const out7 = 1 - ease(f, at(scene, 6, 0.0), 12);
  const t8 = ease(f, at(scene, 1, 0.05), 12);
  const t11 = ease(f, at(scene, 1, 0.15), 12);
  const t23 = ease(f, at(scene, 1, 0.28), 12);
  const tk = ease(f, at(scene, 4, 0.55), 10);
  const slot = (a: number, b: number) => win(f, a, b);
  const note = (y: number, a: number, b: number, txt: string) => (
    <div style={{ position: 'absolute', left: RX, top: y, display: 'flex', alignItems: 'center', gap: 14, fontSize: 48, fontWeight: 900, color: C.red, opacity: slot(a, b) }}><Mk ok={false} />{txt}</div>
  );
  const row = (tex: string, a: number, b: number, size = 56) => (
    <div style={{ position: 'absolute', left: RX, top: 315, whiteSpace: 'nowrap', opacity: slot(a, b) }}><Tex tex={tex} size={size} /></div>
  );
  return (
    <>
      <div style={{ opacity: out7 }}>
        <div style={{ position: 'absolute', left: 110, top: 150, fontSize: 38, fontWeight: 800, color: DARKGREY, opacity: t8 }}>需要</div>
        <Tile x={110} y={200} v="8" w={130} h={96} size={56} o={t8} tick={tk} />
        <Tile x={110} y={340} v="11" w={130} h={96} size={56} o={t11} tick={tk} />
        <Tile x={110} y={480} v="23" w={130} h={96} size={56} o={t23} tick={tk} />
        <T x={90} y={610} start={at(scene, 1, 0.5)} w={520} size={40} color={DARKGREY}>2024 = 8 × 11 × 23</T>

        <Eq x={RX} y={115} start={at(scene, 0, 0.4)} tex={['\\dfrac{n(n+1)}{2}\\ :', z('偶数那个先除以 2')]} size={56} />
        {row('\\dfrac{253\\times254}{2} = 253\\times127', at(scene, 1, 0.5), at(scene, 2, 0.05))}
        {note(480, at(scene, 1, 0.75), at(scene, 2, 0.05), '奇数：没有因数 2')}
        {row('\\dfrac{483\\times484}{2} = 483\\times242,\\ \\ 242 = 2\\times121', at(scene, 2, 0.15), at(scene, 3, 0.05), 52)}
        {note(480, at(scene, 2, 0.6), at(scene, 3, 0.05), '只有 1 个因数 2')}
        {row('\\dfrac{528\\times529}{2} = 264\\times529', at(scene, 3, 0.15), 99999)}
        <Eq x={RX} y={500} start={at(scene, 4, 0.15)} tex={'= (8\\times3\\times11)\\times(23\\times23)'} size={56} color={C.green} />
        <div style={{ position: 'absolute', left: RX + 880, top: 506, opacity: tk }}><Mk ok size={64} /></div>
        <T x={RX} y={660} start={at(scene, 5, 0.3)} w={1200} size={44} color={DARKGREY}>能成立的最小选项。解法一证明了没有更小的 n。</T>
      </div>
      <div style={{ position: 'absolute', left: 260, top: 250, width: 1400, padding: '50px 60px', textAlign: 'center', ...card, ...fadeUp(f, at(scene, 6, 0.15)) }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: C.violet }}>限时考试时</div>
        <div style={{ fontSize: 60, fontWeight: 800, marginTop: 20 }}>从最小的选项开始试</div>
      </div>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const st: Record<number, 'red' | 'green' | 'amber'> = { 2: 'green' };
  if (f >= at(scene, 0, 0.1)) st[0] = 'red';
  if (f >= at(scene, 1, 0.1)) st[4] = 'red';
  if (f >= at(scene, 2, 0.1)) st[1] = 'red';
  if (f >= at(scene, 3, 0.1)) st[3] = 'amber';
  const panel = (a: number, b: number) => win(f, a, b);
  const P = (a: number, b: number, rows: React.ReactNode) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, opacity: panel(a, b) }}>{rows}</div>
  );
  const row = (y: number, tex: string | Part[], size = 60) => (
    <div style={{ position: 'absolute', left: 130, top: y, whiteSpace: 'nowrap' }}><Z p={tex} size={size} /></div>
  );
  const note = (x: number, y: number, txt: string, color: string) => (
    <div style={{ position: 'absolute', left: x, top: y, fontSize: 48, fontWeight: 900, color, whiteSpace: 'nowrap' }}>{txt}</div>
  );
  return (
    <>
      <Chips x={160} y={160} start={(i) => 6 + i * 3} state={st} size={64} />
      {/* A */}
      {P(at(scene, 0, 0.1), at(scene, 1, 0.05), (
        <>
          {row(330, '253 = 11\\times 23')}
          {row(450, '2024 = \\textcolor{#ef4343}{\\boxed{8}}\\times 11\\times 23')}
          {note(1020, 470, '忘了 8！', C.red)}
          {row(580, [z('总和'), '= 253\\times127'])}
          {note(980, 600, '奇数：一个因数 2 都没有', C.red)}
        </>
      ))}
      {/* E */}
      {P(at(scene, 1, 0.1), at(scene, 2, 0.05), (
        <>
          {row(330, '1012 = 2024\\div 2')}
          {row(450, [z('总和'), '= 506\\times1013'])}
          {row(580, '506 = 2\\times253')}
          {note(900, 600, '只有 1 个因数 2，需要 3 个', C.red)}
        </>
      ))}
      {/* B */}
      {P(at(scene, 2, 0.1), at(scene, 3, 0.05), (
        <>
          {row(330, '483 = 21\\times 23\\quad 484 = 4\\times 121')}
          {row(450, [z('总和'), '= 483\\times242'])}
          {note(900, 470, '只有 1 个因数 2：没有 8', C.red)}
        </>
      ))}
      {/* D */}
      {P(at(scene, 3, 0.1), 99999, (
        <>
          <div style={{ position: 'absolute', left: 130, top: 330, display: 'flex', alignItems: 'center', gap: 20, fontSize: 56, fontWeight: 900, color: C.amber }}>
            <Mk ok size={64} /> 736 可以，
          </div>
          <div style={{ position: 'absolute', left: 130, top: 450, fontSize: 56, fontWeight: 900 }}>
            但是 <Tex tex={'736 > 528'} size={60} />，所以不是最小的
          </div>
        </>
      ))}
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', ...fadeUp(f, 6) }}>
        <span style={{ fontSize: 120, fontWeight: 900, color: C.muted, textDecoration: 'line-through' }}>2024</span>
        <span style={{ fontSize: 100, fontWeight: 900, color: C.muted }}> → </span>
        <span style={{ fontSize: 130, fontWeight: 900, color: C.violet, opacity: ease(f, at(scene, 0, 0.05), 12) }}>2025</span>
      </div>
      <div style={{ position: 'absolute', left: 100, top: 450, width: 1720, padding: '36px 30px', textAlign: 'center', ...card, ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <div style={{ whiteSpace: 'nowrap' }}><Z p={[z('使'), '1+2+\\cdots+n', z('能被'), '2025', z('整除的最小'), 'n', z('是多少？')]} size={54} /></div>
      </div>
    </>
  );
};

const VX = 1060;
const VY = [220, 335, 450, 565];
const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = tint('16', '11').map((_, i) => (i === 0 ? 'rgba(12,194,129,0.28)' : 'rgba(12,194,129,0.28)'));
  const fadeLeft = 1 - ease(f, at(scene, 6, 0.0), 12);
  const free = ease(f, at(scene, 1, 0.55), 12);
  const tile = (i: number) => ease(f, at(scene, 2, 0.1 + i * 0.15), 12);
  return (
    <>
      <div style={{ opacity: fadeLeft }}>
        <Eq x={90} y={140} start={at(scene, 0, 0.1)} tex={['n(n+1)', z('能被'), '2\\times2025 = 4050', z('整除')]} size={46} />
        <Eq x={90} y={235} start={at(scene, 1, 0.05)} tex={'4050 = 2\\times 81\\times 25'} size={56} />
        <Tile x={90} y={340} v="2" w={110} h={90} size={52} o={free} />
        <Tile x={290} y={340} v="81" w={130} h={90} size={52} o={tile(0)} />
        <Tile x={470} y={340} v="25" w={130} h={90} size={52} o={tile(1)} />
        <T x={90} y={450} start={at(scene, 1, 0.6)} w={880} size={40} color={DARKGREY}>不用管：相邻数里总有一个是偶数</T>
        <T x={90} y={540} start={at(scene, 2, 0.55)} w={900} size={42} color={C.red}>都放进同一个数：是 81 × 25 的倍数，太大了</T>
      </div>
      <Ref x={VX} y={140} start={at(scene, 4, 0.2)} label="25 的倍数：" items="75, 100 | 150, 175 | 225, 250" />
      <Walk x={VX} y={VY[0]} a={80} m={81} b={82} tint={tint('16', '16')} start={at(scene, 3, 0.35)} w={210} aMark={[false, at(scene, 4, 0.1)]} bMark={[false, at(scene, 4, 0.18)]} />
      <Walk x={VX} y={VY[1]} a={161} m={162} b={163} tint={tint('16', '16')} start={at(scene, 3, 0.6)} w={210} aMark={[false, at(scene, 4, 0.3)]} bMark={[false, at(scene, 4, 0.38)]} />
      <Walk x={VX} y={VY[2]} a={242} m={243} b={244} tint={tint('16', '16')} start={at(scene, 3, 0.85)} w={210} aMark={[false, at(scene, 4, 0.5)]} bMark={[false, at(scene, 4, 0.58)]} />
      <Walk x={VX} y={VY[3]} a={323} m={324} b={325} tint={tint('16', '16')} start={at(scene, 5, 0.05)} w={210} aMark={[false, at(scene, 5, 0.3)]} bMark={[true, at(scene, 5, 0.6)]} />
      <T x={VX + 40} y={VY[3] + 112} start={at(scene, 5, 0.65)} w={600} size={50} color={C.green} weight={900}>
        <Tex tex={'325 = 25\\times 13'} size={56} color={C.green} />
      </T>
      <Badge x={330} y={380} text="n = 324" start={at(scene, 6, 0.25)} chimeAt={at(scene, 6, 0.5)} size={100} w={460} h={170} />
      <Confetti x={330} y={380} start={at(scene, 6, 0.25)} seed={11} />
      <Eq x={90} y={520} start={at(scene, 6, 0.5)} tex={'\\dfrac{324\\times325}{2} = 162\\times325'} size={52} color={DARKGREY} />
      <Eq x={90} y={660} start={at(scene, 6, 0.7)} tex={'= 52650 = 2025\\times26'} size={52} color={DARKGREY} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = 1 - ease(f, at(scene, 2, 0.0), 12);
  const rows: [string, string][] = [
    ['sum = n(n+1)/2', ''],
    ['相邻数除了 1，没有别的公因数', ''],
    ['每个质数的幂，整个落在一个相邻数里', ''],
    ['分组，从小到大数倍数，检查相邻数', ''],
  ];
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 140, width: 1680, height: 690, ...card, opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 60, top: 30, fontSize: 48, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 60, top: 110, ...fadeUp(f, 8) }}><Z p={[z('总和'), '= \\dfrac{n(n+1)}{2}']} size={64} color={C.violet} /></div>
        <div style={{ position: 'absolute', left: 60, top: 300, fontSize: 52, fontWeight: 800, ...fadeUp(f, at(scene, 0, 0.1)) }}>{rows[1][0]}</div>
        <div style={{ position: 'absolute', left: 60, top: 400, fontSize: 52, fontWeight: 800, color: C.violet, ...fadeUp(f, at(scene, 0, 0.55)) }}>{rows[2][0]}</div>
        <div style={{ position: 'absolute', left: 60, top: 500, fontSize: 52, fontWeight: 800, color: C.primary, ...fadeUp(f, at(scene, 1, 0.1)) }}>{rows[3][0]}</div>
        <div style={{ position: 'absolute', left: 60, top: 600, display: 'flex', gap: 14, ...fadeUp(f, at(scene, 1, 0.5)) }}>
          {['16', '11', '23'].map((v) => <div key={v} style={{ width: 110, height: 70, borderRadius: 18, background: COL[v], color: '#fff', fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v}</div>)}
        </div>
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={360} start={at(scene, 2, 0.2)} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause('2024', true, 10),
  sum: Sum,
  double: Double,
  neighbors: Neighbors,
  walkA: WalkA,
  walkB: WalkB,
  walkC: WalkC,
  choices: Choices,
  traps: Traps,
  variant: Variant,
  try2: makePause('2025', false, 10),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

// YouTube thumbnail (`2026-11-01-triangle-sum-2024-zh-thumb`, render.sh → poster.jpg): the sum and "multiple of 2024", no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 练习" lines={[<span style={{ fontFamily: ZH_FONT }}>以为是</span>, <span style={{ color: C.red, fontFamily: ZH_FONT }}>253？</span>]}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>
      <div style={{ whiteSpace: 'nowrap' }}><Tex tex={'1+2+3+\\cdots+n'} size={62} /></div>
      <div style={{ fontSize: 56, fontWeight: 800, color: DARKGREY, fontFamily: ZH_FONT }}>能被</div>
      <div style={{ padding: '6px 56px', borderRadius: 60, background: C.card, boxShadow: '0 8px 30px rgba(30,40,80,0.12)' }}>
        <Tex tex={'2024'} size={150} color={C.violet} />
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, color: DARKGREY, fontFamily: ZH_FONT }}>整除</div>
    </div>
  </ThumbFrame>
);

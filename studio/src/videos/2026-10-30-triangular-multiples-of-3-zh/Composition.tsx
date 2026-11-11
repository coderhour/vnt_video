import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, XMark } from '../../lib/grid';
import { NUNITO, PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-triangular-multiples-of-3-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// Remainder colours, used everywhere: 0 = green, 1 = violet, 2 = amber.
const REM = (r: number) => (r === 0 ? C.primary : r === 1 ? C.violet : C.amber);
const GREY = '#c7ccd8';
const SPOTGREY = '#6b7280';
const LIST = '1, 3, 6, 10, 15, \\dots';

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

/** Tex placed absolutely; centred on x when `w` is given. */
const Eq: React.FC<{ x: number; y: number; start: number; tex: string | Part[]; size?: number; color?: string; o?: number; w?: number }> = ({ x, y, start, tex, size = 60, color = C.ink, o = 1, w }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const base: React.CSSProperties = { position: 'absolute', top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * o };
  return w ? (
    <div style={{ ...base, left: x - w / 2, width: w, textAlign: 'center' }}>
      <Z p={tex} size={size} color={color} />
    </div>
  ) : (
    <div style={{ ...base, left: x }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Opacity window: fades in at `a`, out at `b`. */
const win = (f: number, a: number, b: number) => ease(f, a, 10) * (1 - ease(f, b, 10));

/** Remainder chip (HTML circle). */
const Chip: React.FC<{ x?: number; y?: number; r: number; size?: number; o?: number; flow?: boolean }> = ({ x = 0, y = 0, r, size = 72, o = 1, flow }) => (
  <div style={{ position: flow ? 'relative' : 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: REM(r), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.62, fontWeight: 900, opacity: o, transform: `scale(${0.6 + 0.4 * o})` }}>
    {r}
  </div>
);

/** A spot tile: grey "spot n" label on top, big list value in the middle, remainder chip below. */
const TW = 190;
const Tile: React.FC<{ x: number; y: number; spot: string; val: string; chip?: number | null; o?: number; chipO?: number; ring?: number; w?: number; valSize?: number }> = ({
  x, y, spot, val, chip = null, o = 1, chipO = 1, ring = 0, w = TW, valSize = 84,
}) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
      <div style={{ margin: '0 auto', width: 'fit-content', background: '#e6e9f1', color: SPOTGREY, borderRadius: 999, padding: '2px 22px', fontSize: 34, fontWeight: 800, whiteSpace: 'nowrap' }}>{spot}</div>
      <div style={{ marginTop: 8, height: 118, background: C.card, borderRadius: 24, boxShadow: '0 4px 14px rgba(30,40,80,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: valSize, fontWeight: 900, whiteSpace: 'nowrap' }}>{val}</div>
      <div style={{ height: 76, marginTop: 10, display: 'flex', justifyContent: 'center' }}>
        {chip !== null && chipO > 0 && <Chip flow r={chip} o={chipO} size={72} />}
      </div>
      {ring > 0 && <div style={{ position: 'absolute', left: -12, top: -10, right: -12, bottom: -10, border: `8px solid ${C.primary}`, borderRadius: 34, opacity: ring }} />}
    </div>
  );

const REM_X0 = 305;
const REM_PITCH = 220;
const REM_Y = 150;
const VALS = [1, 3, 6, 10, 15, 21];

// ---- group blocks (cells showing remainders 1, 0, 0) ----

const BlockSvg: React.FC<{ x: number; y: number; s?: number; o?: number; digits?: boolean; vals?: number[]; spots?: number[] }> = ({ x, y, s = 1, o = 1, digits = true, vals = [1, 0, 0], spots }) => {
  if (o <= 0) return null;
  const cw = 40 * s, ch = 72 * s, gap = 4 * s;
  return (
    <g opacity={o}>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={x + i * (cw + gap)} y={y} width={cw} height={ch} rx={10 * s} fill={REM(v)} />
          {digits && (
            <text x={x + i * (cw + gap) + cw / 2} y={y + ch / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={900} fontSize={34 * s} fill="#fff">
              {v}
            </text>
          )}
          {spots && (
            <text x={x + i * (cw + gap) + cw / 2} y={y + ch + 34} textAnchor="middle" fontFamily={NUNITO} fontWeight={800} fontSize={32} fill={SPOTGREY}>
              {spots[i]}
            </text>
          )}
        </g>
      ))}
    </g>
  );
};

const PITCH = 142;
const ROWH = 92;
const PER = 11;
const GX = 120;
const GY = 270;
const slot = (k: number): [number, number] => [GX + (k % PER) * PITCH, GY + Math.floor(k / PER) * ROWH];

/** ONE block slides through its spots, leaving faint ghosts. pos runs 0..count. */
const SlideGrid: React.FC<{ count: number; pos: number }> = ({ count, pos }) => {
  if (pos <= 0) return null;
  const p = Math.min(pos, count);
  const idx = Math.min(count - 1, Math.floor(p));
  const frac = p >= count ? 0 : p - idx;
  const [sx, sy] = slot(idx);
  const ax = sx + (idx % PER !== PER - 1 ? frac * PITCH : 0);
  return (
    <g>
      {Array.from({ length: idx + 1 }, (_, k) => k).map((k) => {
        const show = k < idx || (k === idx && frac > 0);
        if (!show) return null;
        const [gx, gy] = slot(k);
        return <BlockSvg key={k} x={gx} y={gy} digits={false} o={0.28} />;
      })}
      <BlockSvg x={ax} y={sy} />
    </g>
  );
};

/** Lone cell (the leftover spot). chip null = plain grey. */
const LoneCell: React.FC<{ x: number; y: number; chip: number | null; label: string; o: number; ring?: number; cross?: number }> = ({ x, y, chip, label, o, ring = 0, cross = 0 }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      {ring > 0 && <rect x={x - 10} y={y - 10} width={60} height={92} rx={16} fill="none" stroke={C.primary} strokeWidth={7} opacity={ring} />}
      <rect x={x} y={y} width={40} height={72} rx={10} fill={chip === null ? GREY : REM(chip)} />
      {chip !== null && (
        <text x={x + 20} y={y + 37} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={900} fontSize={34} fill="#fff">
          {chip}
        </text>
      )}
      <text x={x + 20} y={y + 112} textAnchor="middle" fontFamily={ZH_FONT} fontWeight={800} fontSize={34} fill={SPOTGREY}>
        {label}
      </text>
      <XMark at={[x + 82, y + 36]} size={44} opacity={cross} />
    </g>
  );

/** Answer badge with the chime timed separately (chime at the END of the line). */
const Badge: React.FC<{ x: number; y: number; value: string; start: number; chimeAt: number; size?: number }> = ({ x, y, value, start, chimeAt, size = 240 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={chimeAt} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};

const Brand: React.FC<{ x: number; y: number; start: number; size?: number; sub?: string }> = ({ x, y, start, size = 84, sub = '你的数学小导师' }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x - 500, top: y, width: 1000, textAlign: 'center', ...fadeUp(f, start) }}>
      <div style={{ fontFamily: PACIFICO, fontSize: size, color: C.violet }}>Vantee</div>
      <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>{sub}</div>
    </div>
  );
};

/** Answer choices A-E, letters and numbers both at least 48 px. */
const BigChoices: React.FC<{ x: number; y: number; start: (i: number) => number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 24 }}>
      {['33', '34', '50', '66', '67'].map((c, i) => (
        <div key={c} style={{ ...fadeUp(f, start(i), 10), display: 'flex', alignItems: 'baseline', gap: 12, background: C.card, borderRadius: 20, padding: '10px 28px', fontSize: 60, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
          <span style={{ color: C.muted, fontSize: 48 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};

const card: React.CSSProperties = { background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' };

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nums = [1, 3, 6, 10, 15];
  const cx = (i: number) => 330 + i * 270;
  const numAt = [0.04, 0.14, 0.24, 0.34, 0.44];
  return (
    <>
      <Stage>
        {nums.slice(1).map((_, i) => {
          const o = ease(f, at(scene, 0, 0.58 + i * 0.1), 10);
          const a = cx(i) + 20, b = cx(i + 1) - 20;
          return (
            <g key={i} opacity={o}>
              <path d={`M ${a} 228 Q ${(a + b) / 2} 150 ${b} 228`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" />
              <path d={`M ${b - 16} 204 L ${b} 228 L ${b - 28} 232`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x={(a + b) / 2} y={142} textAnchor="middle" fontFamily={NUNITO} fontWeight={900} fontSize={52} fill={C.violet}>
                +{i + 2}
              </text>
            </g>
          );
        })}
      </Stage>
      {nums.map((n, i) => {
        const o = ease(f, at(scene, 0, numAt[i]), 10);
        return (
          <div key={n} style={{ position: 'absolute', left: cx(i) - 95, top: 240, width: 190, height: 150, ...card, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 900, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
            {n}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: cx(5) - 60, top: 255, fontSize: 100, fontWeight: 900, color: C.muted, opacity: ease(f, at(scene, 0, 0.8), 10) }}>…</div>
      <Pill x={420} y={470} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.12)), fontSize: 46 }}>前100个数</Pill>
      <Pill x={1010} y={470} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.35)), fontSize: 46 }}>3的倍数？</Pill>
      <Brand x={960} y={620} start={at(scene, 2)} />
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const boxes = [1, 3, 6, 10];
  const steps = ['+2', '+3', '+4'];
  const bx = (i: number) => 1120 + i * 200;
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 150, width: 1000, padding: '34px 46px', fontSize: 48, fontWeight: 600, lineHeight: 1.5, ...card, ...fadeUp(f, 0) }}>
        一串数从 1 开始，先加 2，再加 3，再加 4，依此类推。这串数的<Mark on={at(scene, 2, 0.3)}>前 100 个数</Mark>中，有多少个是<Mark on={at(scene, 2, 0.7)}>3 的倍数</Mark>？
      </div>
      <Stage>
        {steps.map((s, i) => {
          const o = ease(f, at(scene, 1, 0.1 + i * 0.15), 10);
          const a = bx(i) + 120, b = bx(i + 1) - 6;
          return (
            <g key={s} opacity={o}>
              <line x1={a} y1={255} x2={b} y2={255} stroke={C.violet} strokeWidth={6} strokeLinecap="round" />
              <path d={`M ${b - 18} 241 L ${b} 255 L ${b - 18} 269`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x={(a + b) / 2 + 2} y={218} textAnchor="middle" fontFamily={NUNITO} fontWeight={900} fontSize={48} fill={C.violet}>
                {s}
              </text>
            </g>
          );
        })}
      </Stage>
      {boxes.map((n, i) => {
        const o = ease(f, at(scene, 1, 0.02 + i * 0.15), 10);
        return (
          <div key={n} style={{ position: 'absolute', left: bx(i), top: 200, width: 120, height: 110, ...card, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 900, opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
            {n}
          </div>
        );
      })}
      <Eq x={1120} y={380} start={at(scene, 1, 0.65)} tex={LIST} size={72} color={C.violet} />
      <BigChoices x={150} y={715} start={(i) => at(scene, 3, 0.2 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const pop3 = (i: number) => ease(f, at(scene, 0, 0.45 + i * 0.18), 12);
  return (
    <>
      <Tile x={160} y={170} spot="第1项" val="1" o={pop3(0)} />
      <Tile x={400} y={170} spot="第2项" val="3" o={pop3(1)} />
      <Tile x={640} y={170} spot="第3项" val="6" o={pop3(2)} />
      <div style={{ position: 'absolute', left: 900, top: 215, fontSize: 96, fontWeight: 900, color: C.muted, opacity: ease(f, at(scene, 2, 0.05), 10) }}>· · ·</div>
      <Tile x={1440} y={170} w={340} spot="第100项" val="超过5000" valSize={58} o={ease(f, at(scene, 2, 0.25), 14)} />
      <div style={{ position: 'absolute', left: 120, top: 520, width: 1680, padding: '26px 44px', fontSize: 50, fontWeight: 700, lineHeight: 1.35, ...card, ...fadeUp(f, at(scene, 1, 0.1)) }}>
        目标：<Mark on={at(scene, 1, 0.35)}>从第 1 项到第 100 项</Mark>，数一数有几项是 <Mark on={at(scene, 1, 0.75)}>3 的倍数</Mark>。
      </div>
      <Pill x={560} y={725} color={C.amber} style={{ ...fadeUp(f, at(scene, 2, 0.6)), fontSize: 46 }}>数太大，列不完。找规律！</Pill>
    </>
  );
};

const makePause = (seconds: number, prompt: React.ReactNode, withChoices: boolean): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={100} y={150} w={1050} size={50} weight={800} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Eq x={100} y={370} start={10} tex={LIST} size={72} color={C.violet} />
      {withChoices && (
        <BigChoices x={100} y={540} start={() => 12} />
      )}
      <Countdown scene={scene} seconds={seconds} x={1440} y={480} tick={TICK} label={<span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>} />
    </>
  );
};

const Remainders: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tx = (i: number) => REM_X0 + i * REM_PITCH;
  const tileO = (i: number) => ease(f, at(scene, 0, 0.1 + i * 0.1), 12);
  // remainder chip reveal frames per tile
  const chipAt = [at(scene, 1, 0.3), at(scene, 1, 0.7), at(scene, 3, 0.8), at(scene, 4, 0.8), at(scene, 5, 0.9), at(scene, 6, 0.8)];
  const ring = ease(f, at(scene, 1, 0.75), 10) * (1 - ease(f, at(scene, 2, 0.4), 10));
  const jumpAt = [null, null, at(scene, 3, 0.1), at(scene, 4, 0.1), at(scene, 5, 0.1), at(scene, 6, 0.1)];
  const jumps = ['', '', '+3', '+4', '+5', '+6'];
  const arcFade = 1 - ease(f, at(scene, 7), 10);
  const brOp = ease(f, at(scene, 7, 0.3), 12);
  const rem = [1, 0, 0, 1, 0, 0];
  const row = (l: number) => win(f, at(scene, l), at(scene, l + 1));
  return (
    <>
      {VALS.map((v, i) => (
        <Tile key={v} x={tx(i)} y={REM_Y} spot={`第${i + 1}项`} val={String(v)} o={tileO(i)} chip={rem[i]} chipO={ease(f, chipAt[i], 10)} ring={i === 1 ? ring : 0} />
      ))}
      <Stage>
        {jumps.map((j, i) =>
          j && jumpAt[i] !== null ? (
            <g key={i} opacity={ease(f, jumpAt[i]!, 10) * arcFade}>
              <path d={`M ${tx(i - 1) + 125} 424 Q ${tx(i - 1) + 205} 476 ${tx(i) + 65} 426`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" />
              <path d={`M ${tx(i) + 40} 446 L ${tx(i) + 65} 426 L ${tx(i) + 42} 410`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x={tx(i - 1) + 205} y={516} textAnchor="middle" fontFamily={NUNITO} fontWeight={900} fontSize={46} fill={C.violet}>
                {j}
              </text>
            </g>
          ) : null,
        )}
        {[0, 3].map((g) => (
          <path key={g} d={`M ${tx(g) + 5} 420 V 442 H ${tx(g + 2) + 185} V 420`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={brOp} />
        ))}
      </Stage>
      {/* L1 */}
      <Eq x={960} y={560} w={1500} start={at(scene, 0, 0.5)} tex={['\\div 3 \\to', z('余数')]} size={72} color={C.violet} o={row(0)} />
      {/* L2 */}
      <Eq x={960} y={560} w={1500} start={at(scene, 1, 0.1)} tex={['1 \\div 3 \\to', z('余'), '1']} color={C.violet} o={row(1)} />
      <Eq x={960} y={660} w={1500} start={at(scene, 1, 0.5)} tex={['3 \\div 3 \\to', z('余'), '0']} color={C.primary} o={row(1)} />
      <Pill x={1450} y={668} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.7)), fontSize: 38, opacity: row(1) * ease(f, at(scene, 1, 0.7), 10) }}>是倍数！</Pill>
      {/* L3 */}
      <Eq x={960} y={560} w={1700} start={at(scene, 2, 0.15)} tex={[z('每个数'), '=', z('前一个数'), '+', z('再加的数')]} o={row(2)} />
      <Eq x={960} y={665} w={1500} start={at(scene, 2, 0.6)} tex={[z('所以把余数加起来')]} color={C.violet} o={row(2)} />
      {/* L4 */}
      <Eq x={960} y={560} w={1500} start={at(scene, 3, 0.1)} tex={'6 = 3 + 3'} o={row(3)} />
      <Eq x={960} y={655} w={1500} start={at(scene, 3, 0.5)} tex={'0 + 0 = 0'} color={C.primary} o={row(3)} />
      <Pill x={620} y={750} color={C.violet} style={{ ...fadeUp(f, at(scene, 3, 0.3)), fontSize: 40, opacity: row(3) * ease(f, at(scene, 3, 0.3), 10) }}>+3 不改变余数</Pill>
      {/* L5 */}
      <Eq x={960} y={560} w={1500} start={at(scene, 4, 0.1)} tex={'10 = 6 + 4'} o={row(4)} />
      <Eq x={960} y={650} w={1500} start={at(scene, 4, 0.4)} tex={['4 \\to', z('余'), '1']} color={C.violet} o={row(4)} />
      <Eq x={960} y={740} w={1500} start={at(scene, 4, 0.7)} tex={'0 + 1 = 1'} color={C.violet} o={row(4)} />
      {/* L6 */}
      <Eq x={960} y={560} w={1500} start={at(scene, 5, 0.1)} tex={'15 = 10 + 5'} o={row(5)} />
      <Eq x={960} y={650} w={1500} start={at(scene, 5, 0.35)} tex={['5 \\to', z('余'), '2']} color={C.amber} o={row(5)} />
      <Eq x={960} y={740} w={1500} start={at(scene, 5, 0.65)} tex={'1 + 2 = 3 \\to 0'} color={C.primary} o={row(5)} />
      {/* L7 */}
      <Eq x={960} y={560} w={1500} start={at(scene, 6, 0.1)} tex={'21 = 15 + 6'} o={row(6)} />
      <Eq x={960} y={650} w={1500} start={at(scene, 6, 0.4)} tex={['6 \\to', z('余'), '0']} color={C.primary} o={row(6)} />
      <Eq x={960} y={740} w={1500} start={at(scene, 6, 0.65)} tex={'0 + 0 = 0'} color={C.primary} o={row(6)} />
      {/* L8 */}
      <Eq x={960} y={580} w={1700} start={at(scene, 7, 0.35)} tex={'[1, 0, 0] \\quad [1, 0, 0] \\quad \\dots'} size={80} />
    </>
  );
};

const Why: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tx = (i: number) => 560 + i * 230;
  const spots = [3, 4, 5, 6];
  const vals = [6, 10, 15, 21];
  const rem = [0, 1, 0, 0];
  const jumps = ['+4', '+5', '+6'];
  return (
    <>
      {spots.map((s, i) => (
        <Tile key={s} x={tx(i)} y={230} spot={`第${s}项`} val={String(vals[i])} chip={rem[i]} />
      ))}
      <Stage>
        {jumps.map((j, i) => {
          const o = ease(f, at(scene, 0, 0.3 + i * 0.22), 10);
          const a = tx(i) + 95, b = tx(i + 1) + 95;
          return (
            <g key={j} opacity={o}>
              <path d={`M ${a} 236 Q ${(a + b) / 2} 150 ${b} 236`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" />
              <path d={`M ${b - 18} 212 L ${b} 236 L ${b - 30} 240`} stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x={(a + b) / 2} y={160} textAnchor="middle" fontFamily={NUNITO} fontWeight={900} fontSize={50} fill={C.violet}>
                {j}
              </text>
            </g>
          );
        })}
        {/* the remainder loops back to 0 */}
        <g opacity={ease(f, at(scene, 2, 0.55), 14)}>
          <path d={`M ${tx(0) + 95} 500 C ${tx(0) + 95} 570 ${tx(3) + 95} 570 ${tx(3) + 95} 500`} stroke={C.primary} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d={`M ${tx(3) + 75} 524 L ${tx(3) + 95} 500 L ${tx(3) + 118} 522`} stroke={C.primary} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={(tx(0) + tx(3)) / 2 + 95} y={612} textAnchor="middle" fontFamily={ZH_FONT} fontWeight={900} fontSize={44} fill={C.primary}>
            余数又回到 0
          </text>
        </g>
      </Stage>
      <Eq x={960} y={650} w={1700} start={at(scene, 1, 0.45)} tex={'4 + 5 + 6 = 15 = 5 \\times 3'} size={68} />
    </>
  );
};

const Cycles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const bigO = 1 - ease(f, at(scene, 2), 10);
  const bigPitch = 340;
  const bx = (i: number) => 290 + i * bigPitch;
  const a0 = at(scene, 2, 0.3);
  const a1 = at(scene, 2, 0.85);
  const prog = Math.max(0, Math.min(1, (f - a0) / (a1 - a0)));
  const count = 33;
  const pos = prog * count;
  const idx = Math.min(count - 1, Math.floor(pos));
  const loneX = GX + 11 * PITCH + 30;
  const loneY = GY + 2 * ROWH;
  const done = at(scene, 5, 0.75);
  return (
    <>
      {/* L1-L2: compact group blocks */}
      <div style={{ opacity: bigO }}>
        <Text x={960} y={150} w={1500} size={54} weight={900} align="center" style={fadeUp(f, 4)}>
          每 3 项一组：余数 1，0，0
        </Text>
        <Stage>
          {[0, 1, 2, 3].map((g) => (
            <BlockSvg key={g} x={bx(g)} y={260} s={2.4} spots={[3 * g + 1, 3 * g + 2, 3 * g + 3]} o={ease(f, at(scene, 0, 0.25 + g * 0.18), 10)} />
          ))}
          <g opacity={ease(f, at(scene, 0, 0.9), 10)}>
            <text x={bx(4) - 20} y={370} fontFamily={NUNITO} fontWeight={900} fontSize={80} fill={C.muted}>…</text>
          </g>
          <g opacity={ease(f, at(scene, 1, 0.3), 12)}>
            <path d={`M ${bx(0) + 108} 505 V 525 H ${bx(0) + 307} V 505`} stroke={C.primary} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </Stage>
        <Text x={bx(0) + 207} y={540} w={640} size={52} weight={900} color={C.primary} align="center" style={{ ...fadeUp(f, at(scene, 1, 0.3)) }}>
          2 个 3 的倍数
        </Text>
      </div>
      {/* L3+: 33 groups */}
      <Eq x={150} y={150} start={at(scene, 2, 0.05)} tex={'100 = 33 \\times 3 + 1'} size={76} />
      {prog > 0 && <Eq x={1300} y={150} start={a0} tex={`\\times ${idx + 1}`} size={88} color={C.violet} />}
      <Stage>
        <SlideGrid count={count} pos={pos} />
        <LoneCell x={loneX} y={loneY} chip={f >= at(scene, 4, 0.6) ? 1 : null} label="第100项" o={ease(f, at(scene, 2, 0.88), 10)} cross={ease(f, at(scene, 4, 0.75), 10)} />
      </Stage>
      <Eq x={150} y={600} start={at(scene, 3, 0.6)} tex={'33 \\times 2 = 66'} size={76} color={C.primary} />
      <Text x={1360} y={590} w={500} size={46} weight={900} color={C.red} style={{ textAlign: 'right', ...fadeUp(f, at(scene, 4, 0.75)), opacity: ease(f, at(scene, 4, 0.75), 10) * (1 - ease(f, done, 10)) }}>
        不是倍数
      </Text>
      <Eq x={960} y={650} start={at(scene, 5, 0.55)} tex={'66 ='} size={120} color={C.ink} />
      <Badge x={1450} y={690} value="D" start={done} chimeAt={at(scene, 5, 0.88)} size={220} />
      <Confetti x={1450} y={690} start={done} seed={5} />
    </>
  );
};

const DOT = 84;
const Dotcopy: React.FC<{ color: string }> = ({ color }) => (
  <>
    {[0, 1, 2, 3].flatMap((r) => Array.from({ length: r + 1 }, (_, c) => <circle key={`${r}-${c}`} cx={c * DOT} cy={r * DOT} r={26} fill={color} />))}
  </>
);

const Formula: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ox = 200, oy = 500;
  const rowO = (r: number) => ease(f, at(scene, 1, 0.04 + r * 0.1), 10);
  // second copy: appears above, flips 180 degrees, then drops into place
  const up = ease(f, at(scene, 1, 0.5), 10);
  const flip = ease(f, at(scene, 1, 0.62), 20);
  const drop = ease(f, at(scene, 1, 0.86), 16);
  const cx = ox + 1 * DOT + 1.5 * DOT;
  const cy = oy + 1.5 * DOT - 330 * (1 - drop);
  const rectO = ease(f, at(scene, 2), 12);
  return (
    <>
      <Eq x={900} y={150} start={at(scene, 0, 0.55)} tex={[z('第4项：'), '1 + 2 + 3 + 4 = 10']} size={62} />
      <Stage>
        {/* staircase 1 */}
        {[0, 1, 2, 3].map((r) => (
          <g key={r} opacity={rowO(r)}>
            {Array.from({ length: r + 1 }, (_, c) => (
              <circle key={c} cx={ox + c * DOT} cy={oy + r * DOT} r={26} fill={C.violet} />
            ))}
          </g>
        ))}
        {/* staircase 2, rotated copy */}
        <g opacity={up} transform={`translate(${cx} ${cy}) rotate(${180 * flip}) translate(${-1.5 * DOT} ${-1.5 * DOT})`}>
          <Dotcopy color={C.amber} />
        </g>
        <rect x={ox - 44} y={oy - 44} width={4 * DOT + 88} height={3 * DOT + 88} rx={22} fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="14 12" opacity={rectO} />
      </Stage>
      <Text x={ox - 100} y={oy + 1.5 * DOT - 40} w={110} size={64} weight={900} color={C.ink} align="center" style={{ opacity: ease(f, at(scene, 2, 0.1), 10) }}>4</Text>
      <Text x={ox + 2 * DOT - 55} y={oy - 150} w={110} size={64} weight={900} color={C.ink} align="center" style={{ opacity: ease(f, at(scene, 2, 0.3), 10) }}>5</Text>
      <Eq x={900} y={350} start={at(scene, 2, 0.5)} tex={['4 \\times 5 = 20', z('个点')]} size={64} />
      <Eq x={900} y={450} start={at(scene, 2, 0.8)} tex={'20 \\div 2 = 10'} size={64} color={C.primary} />
      <div style={{ position: 'absolute', left: 880, top: 580, padding: '14px 40px', border: `6px solid ${C.green}`, borderRadius: 24, opacity: ease(f, at(scene, 3, 0.4), 14) }}>
        <Z p={[z('第'), 'n', z('项'), '= \\dfrac{n(n+1)}{2}']} size={72} />
      </div>
    </>
  );
};

const When3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const boxO = ease(f, at(scene, 0, 0.1), 14);
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 150 }}>
        <Z p={[z('第'), 'n', z('项'), `= \\dfrac{\\color{${boxO > 0.5 ? '#0cc281' : '#333333'}}\\boxed{n(n+1)}}{2}`]} size={60} />
      </div>
      <Eq x={80} y={400} start={at(scene, 0, 0.45)} tex={['n(n+1) = 2 \\times', z('（这个数）')]} size={54} />
      <Pill x={80} y={480} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.7)), fontSize: 42 }}>只要看分子！</Pill>
      <div style={{ position: 'absolute', left: 1000, top: 150, padding: '16px 34px', ...card, border: `5px solid ${C.violet}`, ...fadeUp(f, at(scene, 2, 0.2)) }}>
        <div><Z p={['a \\times b', z('是'), '3', z('的倍数')]} size={50} /></div>
        <div><Z p={[z('只有当'), 'a', z('或'), 'b', z('是'), '3', z('的倍数')]} size={50} color={C.violet} /></div>
      </div>
      <Eq x={1000} y={380} start={at(scene, 3, 0.5)} tex={'n = 3, 6, \\dots, 99 \\to 33'} size={56} color={C.primary} />
      <Eq x={1000} y={470} start={at(scene, 4, 0.45)} tex={'n = 2, 5, \\dots, 98 \\to 33'} size={56} color={C.blue} />
      <Eq x={1000} y={555} start={at(scene, 4, 0.65)} tex={'(n+1 = 3, 6, \\dots, 99)'} size={48} color={C.muted} />
      <Eq x={1000} y={660} start={at(scene, 5, 0.6)} tex={'33 + 33 = 66'} size={84} color={C.green} />
      <div style={{ position: 'absolute', left: 80, top: 575, width: 820, padding: '24px 36px', ...card, border: `5px solid ${C.primary}`, ...fadeUp(f, at(scene, 6, 0.25)) }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: C.primary }}>什么时候用这种方法</div>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.3, marginTop: 6 }}>记得公式的话，<br />一条规律就管住每一项。</div>
      </div>
    </>
  );
};

const MiniChip: React.FC<{ r: number; size?: number }> = ({ r, size = 62 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: REM(r), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.62, fontWeight: 900 }}>{r}</div>
);

const TrapCard: React.FC<{ x: number; y: number; letter: string; value: string; o: number; dim: number; children: React.ReactNode }> = ({ x, y, letter, value, o, dim, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 860, height: 290, padding: '20px 36px', background: C.card, border: `6px solid ${C.red}`, borderRadius: 30, boxShadow: '0 8px 30px rgba(239,67,67,0.12)', opacity: o * dim, transform: `translateY(${(1 - o) * 24}px)` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ background: C.red, color: '#fff', borderRadius: 999, padding: '2px 26px', fontSize: 46, fontWeight: 900 }}>
        {letter} · {value}
      </div>
    </div>
    <div style={{ marginTop: 14 }}>{children}</div>
  </div>
);

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const o = (l: number) => ease(f, at(scene, l, 0.05), 14);
  const dim = 1 - 0.93 * ease(f, at(scene, 4), 12);
  const flow = (hOff = 0): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 14, marginTop: hOff });
  return (
    <>
      <TrapCard x={70} y={140} letter="A" value="33" o={o(0)} dim={dim}>
        <Tex tex={'3, 6, 9, \\dots, 99 \\to 33'} size={52} />
        <div style={{ fontSize: 46, fontWeight: 900, color: C.red, marginTop: 12, opacity: ease(f, at(scene, 0, 0.55), 10) }}>漏掉了：第 2、5、8 项</div>
      </TrapCard>
      <TrapCard x={990} y={140} letter="B" value="34" o={o(1)} dim={dim}>
        <Tex tex={'1, 4, 7, \\dots, 100 \\to 34'} size={52} />
        <div style={{ ...flow(18), opacity: ease(f, at(scene, 1, 0.6), 10) }}>
          {[0, 1, 2, 3, 4].map((i) => <MiniChip key={i} r={1} />)}
          <div style={{ fontSize: 44, fontWeight: 900, color: C.violet, marginLeft: 8 }}>全都余 1</div>
        </div>
      </TrapCard>
      <TrapCard x={70} y={470} letter="C" value="50" o={o(2)} dim={dim}>
        <Z p={[z('每隔一个：'), '100 \\div 2 = 50']} size={50} />
        <div style={{ ...flow(18), opacity: ease(f, at(scene, 2, 0.55), 10) }}>
          {[1, 0, 0, 1, 0, 0].map((r, i) => <MiniChip key={i} r={r} />)}
          <div style={{ fontSize: 40, fontWeight: 900, color: C.red, marginLeft: 8 }}>每 3 项重复</div>
        </div>
      </TrapCard>
      <TrapCard x={990} y={470} letter="E" value="67" o={o(3)} dim={dim}>
        <Tex tex={'66 + 1 = 67'} size={56} />
        <div style={{ ...flow(18), opacity: ease(f, at(scene, 3, 0.55), 10) }}>
          <div style={{ position: 'relative' }}>
            <MiniChip r={1} size={72} />
            <svg width={72} height={72} style={{ position: 'absolute', left: 0, top: 0 }}>
              <line x1={10} y1={10} x2={62} y2={62} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
              <line x1={62} y1={10} x2={10} y2={62} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.red }}>第 100 项余 1</div>
        </div>
      </TrapCard>
      {/* L6 habit */}
      <div style={{ position: 'absolute', left: 200, top: 330, width: 1520, padding: '34px 40px', ...card, border: `6px solid ${C.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: ease(f, at(scene, 4, 0.3), 14) }}>
        {['找周期', '数完整的组', '查剩下的'].map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: ease(f, at(scene, 4, 0.4 + i * 0.18), 10) }}>
            {i > 0 && <div style={{ fontSize: 60, fontWeight: 900, color: C.muted }}>→</div>}
            <div style={{ background: [C.violet, C.primary, C.amber][i], color: '#fff', borderRadius: 999, padding: '10px 30px', fontSize: 46, fontWeight: 900, whiteSpace: 'nowrap' }}>{t}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, padding: '22px 46px', fontSize: 62, fontWeight: 800, ...card, ...fadeUp(f, 4) }}>
        还是这串数，只看<Mark on={at(scene, 0, 0.8)}>前 80 个数</Mark>。
      </div>
      <Eq x={120} y={310} start={at(scene, 0, 0.3)} tex={LIST} size={72} color={C.violet} />
      <Text x={120} y={430} w={1600} size={58} weight={900} style={fadeUp(f, at(scene, 1, 0.05))}>
        有多少个是 3 的倍数？
      </Text>
      <div style={{ position: 'absolute', left: 120, top: 540, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Pill x={0} y={0} color={C.primary} style={{ position: 'static', fontSize: 46, width: 'fit-content', ...fadeUp(f, at(scene, 1, 0.5)) }}>1. 先分成三项一组</Pill>
        <Pill x={0} y={0} color={C.violet} style={{ position: 'static', fontSize: 46, width: 'fit-content', ...fadeUp(f, at(scene, 1, 0.78)) }}>2. 再查剩下的</Pill>
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const count = 26;
  const a0 = at(scene, 0, 0.35);
  const a1 = at(scene, 0, 0.82);
  const prog = Math.max(0, Math.min(1, (f - a0) / (a1 - a0)));
  const pos = prog * count;
  const idx = Math.min(count - 1, Math.floor(pos));
  const [ex, ey] = slot(26);
  const exA = ex + 10, exB = exA + 160;
  const fade = 1 - ease(f, at(scene, 4), 12);
  const end = at(scene, 4, 0.2);
  return (
    <>
      <div style={{ opacity: fade }}>
        <Eq x={150} y={150} start={at(scene, 0, 0.05)} tex={'80 = 26 \\times 3 + 2'} size={76} />
        {prog > 0 && <Eq x={1300} y={150} start={a0} tex={`\\times ${idx + 1}`} size={88} color={C.violet} />}
        <Stage>
          <SlideGrid count={count} pos={pos} />
          <LoneCell x={exA} y={ey} chip={f >= at(scene, 2, 0.15) ? 1 : null} label="第79项" o={ease(f, at(scene, 0, 0.88), 10)} />
          <LoneCell x={exB} y={ey} chip={f >= at(scene, 2, 0.15) ? 0 : null} label="第80项" o={ease(f, at(scene, 0, 0.88), 10)} ring={ease(f, at(scene, 2, 0.4), 10)} />
        </Stage>
        <Eq x={150} y={600} start={at(scene, 1, 0.55)} tex={'26 \\times 2 = 52'} size={56} color={C.primary} />
        <Eq x={150} y={700} start={at(scene, 2, 0.75)} tex={'52 + 1 = 53'} size={56} color={C.ink} />
        <Eq x={820} y={590} start={at(scene, 3, 0.15)} tex={'n: 3, \\dots, 78 \\to 26'} size={50} color={C.primary} />
        <Eq x={820} y={665} start={at(scene, 3, 0.4)} tex={'n+1: n = 2, \\dots, 80 \\to 27'} size={50} color={C.blue} />
        <Eq x={820} y={745} start={at(scene, 3, 0.7)} tex={'26 + 27 = 53'} size={56} color={C.ink} />
      </div>
      <Badge x={960} y={400} value="53" start={end} chimeAt={at(scene, 4, 0.9)} size={260} />
      <Confetti x={960} y={400} start={end} seed={9} />
      <Pill x={730} y={590} color={C.primary} style={{ ...fadeUp(f, at(scene, 4, 0.5)), fontSize: 46 }}>太棒了！</Pill>
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 2));
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, height: 620, ...card, borderRadius: 40, boxShadow: '0 10px 40px rgba(30,40,80,0.08)', opacity: ease(f, 0, 14) * cardOut }}>
        <div style={{ position: 'absolute', left: 70, top: 44, fontSize: 44, fontWeight: 900, color: C.primary, ...fadeUp(f, 4) }}>核心思路</div>
        <div style={{ position: 'absolute', left: 70, top: 130, width: 900, fontSize: 56, fontWeight: 900, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.1)) }}>别去追那些大数。</div>
        <div style={{ position: 'absolute', left: 70, top: 270, width: 900, fontSize: 52, fontWeight: 800, color: C.violet, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.4)) }}>盯住余数。</div>
        <div style={{ position: 'absolute', left: 70, top: 380, width: 900, fontSize: 52, fontWeight: 800, color: C.primary, lineHeight: 1.25, ...fadeUp(f, at(scene, 0, 0.7)) }}>找出哪些项符合条件。</div>
      </div>
      <Stage>
        <BlockSvg x={1210} y={300} s={2.6} o={ease(f, at(scene, 1, 0.1), 14) * cardOut} />
      </Stage>
      <div style={{ position: 'absolute', left: 1060, top: 520, width: 640, textAlign: 'center', fontSize: 62, fontWeight: 900, color: C.primary, ...fadeUp(f, at(scene, 1, 0.45)), opacity: ease(f, at(scene, 1, 0.45), 14) * cardOut }}>每 3 项有 2 项</div>
      <SignOff start={at(scene, 2, 0.1)} text="继续发现规律！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, '前 100 个数里，有多少个是 3 的倍数？', true),
  remainders: Remainders,
  why: Why,
  cycles: Cycles,
  formula: Formula,
  when3: When3,
  traps: Traps,
  variant: Variant,
  try2: makePause(10, <>还是这串数，但只看前 80 个数。<br />有多少个是 3 的倍数？</>, false),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

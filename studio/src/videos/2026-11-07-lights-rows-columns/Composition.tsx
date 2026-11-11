import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, mulberry32 } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Answer, Check, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-07-lights-rows-columns';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const ON = '#ffc53d';
const ON_GLOW = 'rgba(255, 197, 61, 0.32)';
const OFF = '#e9ebf1';
const OFF_LINE = '#b4bac8';
const BAND = C.violet;
export const CHOICES = ['169', '247', '265', '338', '384'];

const PROMPT = 'Each light in a 3 × 3 grid of 9 lights is on or off. How many on-off patterns have at least one full row, or at least one full column, of lights on?';
const PROMPT2 = 'Each light in a grid of 2 rows and 3 columns is on or off. How many on-off patterns have at least one full row, or at least one full column, of lights on?';

// ---------- building blocks ----------

/** Fades (and lifts) its children in at `from`, out at `to`. Children use absolute frame coordinates. */
const Show: React.FC<{ from?: number; to?: number; children: React.ReactNode }> = ({ from = 0, to, children }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const p = ease(f, from, 12);
  const out = to === undefined ? 1 : 1 - ease(f, to, 12);
  if (out <= 0) return null;
  return <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: p * out, transform: `translateY(${(1 - p) * 14}px)` }}>{children}</div>;
};

export type Band = { k: 'r' | 'c'; i: number; color?: string; op?: number; solid?: boolean };

/** Lamp grid. cells: array of strings, '1' on, '0' off, 'f' free (dashed). `p` = pitch (px per lamp). */
export const Grid: React.FC<{ x: number; y: number; p: number; cells: string[]; bands?: Band[]; mult?: boolean; dim?: number; glow?: boolean }> = ({ x, y, p, cells, bands = [], mult = false, dim = 1, glow = true }) => {
  const rows = cells.length, cols = cells[0].length;
  const r = p * 0.36;
  return (
    <Stage>
      <g opacity={dim}>
        {bands.map((b, n) => {
          const op = b.op ?? 1;
          if (op <= 0.25) return null;
          const col = b.color ?? BAND;
          const fill = b.color ? 'rgba(160,166,180,0.18)' : C.violetSoft;
          return b.k === 'r' ? (
            <rect key={n} x={x + 4} y={y + b.i * p + 6} width={(cols * p - 8) * op} height={p - 12} rx={p * 0.45} fill={fill} stroke={col} strokeWidth={5} strokeDasharray={b.solid === false ? '14 10' : undefined} />
          ) : (
            <rect key={n} x={x + b.i * p + 6} y={y + 4} width={p - 12} height={(rows * p - 8) * op} rx={p * 0.45} fill={fill} stroke={col} strokeWidth={5} strokeDasharray={b.solid === false ? '14 10' : undefined} />
          );
        })}
        {cells.flatMap((row, ri) =>
          row.split('').map((ch, ci) => {
            const cx = x + (ci + 0.5) * p, cy = y + (ri + 0.5) * p;
            if (ch === '1')
              return (
                <g key={`${ri}${ci}`}>
                  {glow && <circle cx={cx} cy={cy} r={r * 1.42} fill={ON_GLOW} />}
                  <circle cx={cx} cy={cy} r={r} fill={ON} stroke="#f0a800" strokeWidth={3} />
                </g>
              );
            if (ch === 'f')
              return (
                <g key={`${ri}${ci}`}>
                  <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={BAND} strokeWidth={4} strokeDasharray="9 7" />
                  {mult && (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={48} fontWeight={900} fill={BAND}>
                      ×2
                    </text>
                  )}
                </g>
              );
            return <circle key={`${ri}${ci}`} cx={cx} cy={cy} r={r} fill={OFF} stroke={OFF_LINE} strokeWidth={4} />;
          }),
        )}
      </g>
    </Stage>
  );
};

/** A small grid on a white card, with an optional label below and an optional red cross. */
export const Mini: React.FC<{ x: number; y: number; cells: string[]; p?: number; bands?: Band[]; label?: string; labelColor?: string; cross?: boolean; border?: string; labelSize?: number; ink?: boolean; w?: number }> = ({
  x, y, cells, p = 50, bands, label, labelColor = C.ink, cross = false, border, labelSize = 38, ink = false, w,
}) => {
  const rows = cells.length, cols = cells[0].length;
  const pad = 14;
  const W = cols * p + pad * 2, H = rows * p + pad * 2;
  return (
    <>
      <div style={{ position: 'absolute', left: x - pad, top: y - pad, width: W, height: H, background: C.card, borderRadius: 22, boxShadow: '0 4px 14px rgba(30,40,80,0.08)', border: border ? `5px solid ${border}` : ink ? `4px solid ${C.ink}` : undefined, boxSizing: 'border-box' }} />
      <Grid x={x} y={y} p={p} cells={cells} bands={bands} glow={false} />
      {cross && (
        <Stage>
          <circle cx={x - pad + W - 4} cy={y - pad + 4} r={26} fill={C.red} />
          <path d={`M ${x - pad + W - 14} ${y - pad - 6} l 20 20 M ${x - pad + W + 6} ${y - pad - 6} l -20 20`} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        </Stage>
      )}
      {label && (
        <Text x={x - pad + W / 2} y={y - pad + H + 6} w={w ?? Math.max(W + 60, 240)} size={labelSize} weight={900} color={labelColor} align="center">
          {label}
        </Text>
      )}
    </>
  );
};

const T: React.FC<{ x: number; y: number; tex: string; size?: number; color?: string; center?: boolean }> = ({ x, y, tex, size = 64, color = C.ink, center }) => (
  <div style={{ position: 'absolute', left: center ? 0 : x, width: center ? 1920 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', whiteSpace: 'nowrap' }}>
    <Tex tex={tex} size={size} color={color} />
  </div>
);

const Tag: React.FC<{ x: number; y: number; w?: number; size?: number; color?: string; align?: 'left' | 'center'; weight?: number; children: React.ReactNode }> = ({ x, y, w = 700, size = 44, color = C.ink, align = 'left', weight = 900, children }) => (
  <Text x={align === 'center' ? x + w / 2 : x} y={y} w={w} size={size} color={color} align={align} weight={weight}>
    {children}
  </Text>
);

const Bubble: React.FC<{ x: number; y: number; label: string }> = ({ x, y, label }) => (
  <div style={{ position: 'absolute', left: x - 42, top: y - 42, width: 84, height: 84, borderRadius: '50%', background: BAND, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{label}</div>
);

const Card: React.FC<{ x: number; y: number; w: number; h: number; border?: string }> = ({ x, y, w, h, border }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.08)', border: border ? `5px solid ${border}` : undefined, boxSizing: 'border-box' }} />
);

/** Red cross-out over a box. */
export const Strike: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <Stage>
    <g stroke={C.red} strokeWidth={8} strokeLinecap="round">
      <line x1={x} y1={y} x2={x + w} y2={y + h} />
      <line x1={x + w} y1={y} x2={x} y2={y + h} />
    </g>
  </Stage>
);

const Lock: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <Stage>
    <g transform={`translate(${x - 22} ${y - 30})`}>
      <path d="M8 22 V14 a14 14 0 0 1 28 0 V22" fill="none" stroke={BAND} strokeWidth={7} />
      <rect x={0} y={20} width={44} height={34} rx={8} fill={BAND} />
    </g>
  </Stage>
);

// ---------- the ledger (inclusion-exclusion) ----------

const LEDGER = ['+6\\times64=384', '-(48+144)=192', '+(36+36+1+1)=74', '-(18+6)=24', '+6', '-1'];
const Ledger: React.FC<{ starts: number[]; wide?: boolean }> = ({ starts, wide }) => (
  <>
    <Show from={starts[0]}>
      <Card x={wide ? 1160 : 1220} y={160} w={wide ? 720 : 660} h={620} />
      <Tag x={wide ? 1196 : 1250} y={172} w={400} size={36} color={C.muted}>running total</Tag>
    </Show>
    {LEDGER.map((t, i) => (
      <Show key={i} from={starts[i]}>
        <T x={wide ? 1200 : 1254} y={226 + i * 92} tex={t} size={48} />
      </Show>
    ))}
  </>
);

// ---------- Scene: intro ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const flickEnd = at(scene, 0, 0.72);
  const rnd = mulberry32(Math.floor(f / 5) * 31 + 7);
  const cells = f < flickEnd ? [0, 1, 2].map(() => [0, 1, 2].map(() => (rnd() < 0.5 ? '1' : '0')).join('')) : ['000', '000', '000'];
  const L1 = at(scene, 1, 0.12);
  const gx = 765, gy = 190, p = 130;
  const bands: Band[] = [0, 1, 2, 3, 4, 5].map((k) => ({ k: k < 3 ? 'r' : 'c', i: k % 3, op: ease(f, L1 + k * 12, 16) * fadeTo(f, at(scene, 2, 0.05), 0, 12) }));
  const tagOut = fadeTo(f, at(scene, 2, 0.05), 0, 12);
  return (
    <>
      <Grid x={gx} y={gy} p={p} cells={cells} bands={bands} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ opacity: ease(f, L1 + i * 12 + 8, 10) * tagOut }}>
          <Tag x={gx + 3 * p + 24} y={gy + i * p + 40} w={140} size={46} color={BAND}>64</Tag>
        </div>
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ opacity: ease(f, L1 + (i + 3) * 12 + 8, 10) * tagOut }}>
          <Tag x={gx + i * p + p / 2 - 70} y={gy + 3 * p + 8} w={140} size={46} color={BAND} align="center">64</Tag>
        </div>
      ))}
      <Show from={at(scene, 1, 0.6)} to={at(scene, 2, 0.05)}>
        <T x={0} y={650} center tex="6\times64=384" size={76} />
      </Show>
      <Show from={at(scene, 1, 0.82)} to={at(scene, 2, 0.05)}>
        <div style={{ position: 'absolute', left: 1280, top: 662, transform: 'rotate(-9deg)', border: `6px solid ${C.red}`, color: C.red, borderRadius: 16, padding: '4px 22px', fontSize: 56, fontWeight: 900, whiteSpace: 'nowrap' }}>too many!</div>
      </Show>
      <Show from={at(scene, 2, 0.35)}>
        <Tag x={360} y={680} w={1200} size={64} color={C.ink} align="center">count overlaps once</Tag>
      </Show>
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const r0 = at(scene, 1, 0.25), c0 = at(scene, 1, 0.62);
  const row = ease(f, r0, 14) * fadeTo(f, r0 + 34, 0, 10);
  const col = ease(f, c0, 14) * fadeTo(f, c0 + 34, 0, 10);
  const cells = row > 0.05 ? ['111', '000', '000'] : col > 0.05 ? ['100', '100', '100'] : ['000', '000', '000'];
  return (
    <>
      <Pill x={100} y={130} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>Question</Pill>
      <div style={{ position: 'absolute', left: 100, top: 210, width: 1160, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 46, fontWeight: 700, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        Each light in a <Mark on={at(scene, 0, 0.3)}>3 × 3 grid of 9 lights</Mark> is <Mark on={at(scene, 0, 0.75)}>on or off</Mark>. How many on-off patterns have <Mark on={r0}>at least one full row</Mark>, or <Mark on={c0}>at least one full column</Mark>, of lights on?
      </div>
      <Grid x={1380} y={210} p={120} cells={cells} bands={[{ k: 'r', i: 0, op: row }, { k: 'c', i: 0, op: col }]} />
      <Choices x={140} y={680} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 2, 0.1 + i * 0.12)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 0, 0), l2 = at(scene, 1, 0.02);
  const mx = [330, 750, 1170, 1590];
  const MY = 320;
  const MP = 70;
  const items: { cells: string[]; bands: Band[]; label: string; color: string; cross?: boolean }[] = [
    { cells: ['001', '111', '000'], bands: [{ k: 'r', i: 1 }], label: 'wins', color: C.primary },
    { cells: ['001', '001', '001'], bands: [{ k: 'c', i: 2 }], label: 'wins', color: C.primary },
    { cells: ['111', '100', '100'], bands: [{ k: 'r', i: 0 }, { k: 'c', i: 0 }], label: 'wins', color: C.primary },
    { cells: ['100', '010', '001'], bands: [], label: 'not a win', color: C.red, cross: true },
  ];
  return (
    <>
      <Show from={4} to={l2}>
        <Tag x={160} y={190} w={1600} size={64} align="center">Goal: count whole patterns of <span style={{ color: C.violet }}>all 9 lights</span>.</Tag>
      </Show>
      {items.map((it, i) => (
        <Show key={i} from={l1 + 8 + i * 14} to={l2}>
          <Mini x={mx[i] - (3 * MP) / 2} y={MY} p={MP} cells={it.cells} bands={it.bands} label={it.label} labelColor={it.color} cross={it.cross} border={it.cross ? C.red : undefined} />
        </Show>
      ))}
      <Show from={l2}>
        <Grid x={200} y={190} p={130} cells={['fff', 'fff', 'fff']} mult />
      </Show>
      <Show from={at(scene, 1, 0.4)}>
        <T x={720} y={290} tex="2\times2\times\cdots\times2" size={64} />
      </Show>
      <Show from={at(scene, 1, 0.6)}>
        <T x={720} y={400} tex="=2^9=512" size={72} />
      </Show>
      <Show from={at(scene, 1, 0.8)}>
        <Tag x={720} y={530} w={900} size={52} color={C.violet}>512 patterns in all</Tag>
      </Show>
    </>
  );
};

// ---------- pause scenes ----------

const makePause = (text: string, cells: string[], withChoices: boolean, seconds: number, gridP: number, gridY: number): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 100, top: 150, width: 1100, background: C.card, borderRadius: 28, padding: '22px 38px', fontSize: 42, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>{text}</div>
      {withChoices && <Choices x={130} y={440} items={CHOICES.map((c) => <Tex key={c} tex={c} size={52} />)} start={() => 8} />}
      <Show from={6}>
        <Grid x={150} y={gridY} p={gridP} cells={cells} />
      </Show>
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} />
    </>
  );
};

// ---------- Scene: rows (solution 1) ----------

const strings = ['000', '001', '010', '011', '100', '101', '110', '111'];
const GX = 150, GY = 190, GP = 130;
const ex = (x: number) => GX + 3 * GP + x;

const Rows: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const exampleOn = f >= l(4, 0.1);
  const cells = exampleOn ? ['100', '110', '101'] : ['000', '000', '000'];
  const dim = f >= l(1, 0.05) && f < l(3, 0.0) ? 0.35 : 1;
  const bands: Band[] = [
    ...(f >= l(1, 0.05) && f < l(3, 0.0) ? [{ k: 'r', i: 0, op: ease(f, l(1, 0.05), 14) } as Band] : []),
    ...(exampleOn ? [{ k: 'c', i: 0, op: ease(f, l(4, 0.25), 16) } as Band] : []),
  ];
  return (
    <>
      <Show from={4}>
        <Tag x={620} y={140} w={1250} size={46} color={C.ink}>Losers = no full row AND no full column</Tag>
      </Show>
      <Grid x={GX} y={GY} p={GP} cells={cells} bands={bands} dim={dim} />
      {/* grey end-caps */}
      <Show from={l(0, 0.3)} to={l(1, 0.05)}>
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Tag x={ex(14)} y={GY + i * GP + 34} w={80} size={54} color={C.muted}>✗</Tag>
            <Tag x={GX + i * GP + GP / 2 - 40} y={GY + 3 * GP + 4} w={80} size={54} color={C.muted} align="center">✗</Tag>
          </div>
        ))}
      </Show>
      {/* one row's eight strings */}
      <Show from={l(1, 0.12)} to={l(3, 0.0)}>
        <Card x={ex(100)} y={250} w={1020} h={270} />
        {strings.map((s, k) => {
          const cx = ex(140) + (k % 4) * 240, cy = 290 + Math.floor(k / 4) * 110;
          return (
            <Show key={k} from={l(1, 0.15 + k * 0.05)}>
              <Mini x={cx} y={cy} p={40} cells={[s]} ink={f >= l(2, 0.3) && s !== '111'} />
            </Show>
          );
        })}
      </Show>
      <Show from={l(1, 0.6)} to={l(3, 0.0)}>
        <T x={ex(100)} y={550} tex="2\times2\times2=8" size={62} />
      </Show>
      <Show from={l(2, 0.1)} to={l(3, 0.0)}>
        <Strike x={ex(140) + 3 * 240 - 6} y={290 + 110 - 6} w={132} h={52} />
      </Show>
      <Show from={l(2, 0.45)} to={l(3, 0.0)}>
        <Tag x={ex(680)} y={562} w={600} size={46} color={C.ink}>7 safe choices</Tag>
      </Show>
      {/* three rows of 7 */}
      {[0, 1, 2].map((i) => (
        <Show key={i} from={l(3, 0.12 + i * 0.1)}>
          <Tag x={ex(14)} y={GY + i * GP + 26} w={100} size={64} color={C.ink}>7</Tag>
        </Show>
      ))}
      <Show from={l(3, 0.45)}>
        <T x={ex(230)} y={300} tex="7\times7\times7=343" size={76} />
      </Show>
      <Show from={l(3, 0.7)}>
        <Tag x={ex(230)} y={430} w={800} size={46} color={C.muted}>no full row</Tag>
      </Show>
      <Show from={l(4, 0.55)}>
        <Tag x={ex(230)} y={540} w={700} size={110} color={BAND}>?</Tag>
      </Show>
    </>
  );
};

// ---------- Scene: cols ----------

const Cols: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i <= 3 ? i : i + 1, t);
  let cells = ['1ff', '1ff', '1ff'];
  let bands: Band[] = [{ k: 'c', i: 0 }];
  if (f >= l(3, 0.0) && f < l(4, 0.0)) { cells = ['110', '110', '110']; bands = [{ k: 'c', i: 0 }, { k: 'c', i: 1 }]; }
  if (f >= l(4, 0.0)) { cells = ['111', '111', '111']; bands = [{ k: 'c', i: 0 }, { k: 'c', i: 1 }, { k: 'c', i: 2 }]; }
  if (f >= l(1, 0.05) && f < l(3, 0.0)) bands = [...bands, { k: 'r', i: 0, color: C.ink }];
  const gridOut = fadeTo(f, l(4, 0.05), 0, 12);
  const MX = [ex(110), ex(390), ex(670)];
  return (
    <>
      <div style={{ opacity: gridOut }}>
        <Grid x={GX} y={GY} p={GP} cells={cells} bands={bands} />
        <Show from={l(0, 0.25)}>
          <Lock x={GX + GP / 2} y={GY - 24} />
        </Show>
      </div>
      {/* L1: the options for one row */}
      <Show from={l(1, 0.1)} to={l(2, 0.0)}>
        {['100', '110', '101', '111'].map((s, k) => (
          <Show key={k} from={l(1, 0.15 + k * 0.1)}>
            <Mini x={ex(110) + k * 220} y={300} p={50} cells={[s]} ink={s !== '111'} />
          </Show>
        ))}
        <Strike x={ex(110) + 3 * 220 - 6} y={300 - 6} w={162} h={62} />
        <Tag x={ex(110) + 3 * 220 - 70} y={380} w={300} size={40} color={C.red} align="center">row full!</Tag>
        <Tag x={ex(110)} y={500} w={900} size={52}>3 choices per row</Tag>
      </Show>
      {/* L2: 27 per column, 81 */}
      <Show from={l(2, 0.05)} to={l(3, 0.0)}>
        <T x={ex(110)} y={190} tex="3\times3\times3=27" size={66} />
      </Show>
      {[0, 1, 2].map((j) => (
        <Show key={j} from={l(2, 0.3 + j * 0.12)} to={l(3, 0.0)}>
          <Mini x={MX[j]} y={350} p={50} cells={[0, 1, 2].map(() => [0, 1, 2].map((ci) => (ci === j ? '1' : 'f')).join(''))} bands={[{ k: 'c', i: j }]} label="27" />
        </Show>
      ))}
      <Show from={l(2, 0.7)} to={l(3, 0.0)}>
        <T x={ex(110)} y={600} tex="27+27+27=81" size={66} />
      </Show>
      {/* L3: counted twice */}
      <Show from={l(3, 0.05)} to={l(4, 0.0)}>
        <Mini x={ex(110)} y={190} p={50} cells={['110', '110', '110']} bands={[{ k: 'c', i: 0 }]} label="in column 1's pile" labelSize={36} w={330} border={C.red} />
        <Mini x={ex(110) + 380} y={190} p={50} cells={['110', '110', '110']} bands={[{ k: 'c', i: 1 }]} label="in column 2's pile" labelSize={36} w={330} border={C.red} />
        <Tag x={ex(110) + 700} y={225} w={420} size={44} color={C.red}>counted twice!</Tag>
      </Show>
      <Show from={at(scene, 4, 0.3)} to={l(4, 0.0)}>
        {[['110', 'columns 1, 2'], ['101', 'columns 1, 3'], ['011', 'columns 2, 3']].map(([s, lab], k) => (
          <Mini key={k} x={ex(110) + k * 300} y={470} p={50} cells={[s, s, s]} bands={[]} label={lab} labelSize={36} w={290} />
        ))}
      </Show>
      <Show from={at(scene, 4, 0.78)} to={l(4, 0.0)}>
        <Tag x={ex(110) + 920} y={500} w={200} size={96} color={C.ink}>3</Tag>
      </Show>
      {/* L4 */}
      <Show from={l(4, 0.05)}>
        <Mini x={ex(110) - 400} y={210} p={50} cells={['111', '111', '111']} bands={[{ k: 'c', i: 0 }, { k: 'c', i: 1 }, { k: 'c', i: 2 }]} cross border={C.red} />
        <Tag x={ex(110) - 180} y={260} w={800} size={44} color={C.red}>3 full columns = full rows → not here</Tag>
      </Show>
      <Show from={l(4, 0.4)}>
        <T x={ex(110) - 400} y={430} tex="81-3=78" size={80} />
      </Show>
      <Show from={l(4, 0.7)}>
        <Tag x={ex(110) - 400} y={570} w={1100} size={46} color={BAND}>full column, no full row</Tag>
      </Show>
    </>
  );
};

// ---------- Scene: reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const bx = 200, bw = 1520, by = 450, bh = 110;
  const lw = (265 / 512) * bw;
  const barP = ease(f, l(2, 0.15), 20);
  const done = l(3, 0.84);
  const win = f >= l(3, 0.62);
  const WARN = '#e8590c';
  return (
    <>
      <Show from={l(0, 0.3)}>
        <T x={0} y={150} center tex="343-78=265" size={88} />
      </Show>
      <Show from={l(0, 0.45)} to={l(2, 0.0)}>
        <Tag x={660} y={262} w={600} size={48} color={C.muted} align="center">losers</Tag>
      </Show>
      <Show from={l(1, 0.05)} to={l(2, 0.0)}>
        <Tag x={160} y={330} w={1200} size={68} color={WARN} align="center">NOT the answer yet!</Tag>
        <Tag x={160} y={420} w={1200} size={46} color={C.muted} align="center">no full row, no full column</Tag>
        <Mini x={1500} y={310} p={50} cells={['110', '001', '100']} label="a loser" labelColor={C.muted} />
      </Show>
      <Show from={l(2, 0.0)}>
        <Tag x={bx} y={by - 70} w={bw} size={50} color={C.ink} align="center">512 all patterns</Tag>
        <div style={{ position: 'absolute', left: bx, top: by, width: bw * barP, height: bh, borderRadius: 24, background: C.line, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: lw, height: bh, background: '#a9afbd', color: '#fff', fontSize: 46, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>265 losers</div>
          <div style={{ position: 'absolute', left: lw, top: 0, width: bw - lw, height: bh, boxSizing: 'border-box', border: `6px solid ${C.amber}`, borderRadius: '0 24px 24px 0', background: win ? 'rgba(245,159,10,0.2)' : 'transparent', color: C.amber, fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
            {win ? '247 winners' : '? winners'}
          </div>
        </div>
      </Show>
      <Show from={l(3, 0.12)}>
        <T x={260} y={640} tex="512-265=" size={88} />
      </Show>
      <Show from={l(3, 0.62)}>
        <T x={860} y={640} tex="247" size={88} />
      </Show>
      <Pill x={1150} y={710} color={C.primary} style={{ opacity: ease(f, done, 10), fontSize: 46 }}>Choice B</Pill>
      <Answer x={1580} y={700} value="247" chime={CHIME} start={done} />
      <Confetti x={1580} y={700} start={done} seed={5} />
    </>
  );
};

// ---------- Scene: ie-pairs ----------

const Bubbles: React.FC<{ starts: number[] }> = ({ starts }) => (
  <>
    {['R1', 'R2', 'R3', 'C1', 'C2', 'C3'].map((lab, k) => {
      const x = k < 3 ? GX + 3 * GP + 56 : GX + (k - 3) * GP + GP / 2;
      const y = k < 3 ? GY + k * GP + GP / 2 : GY + 3 * GP + 56;
      return (
        <Show key={k} from={starts[k]}>
          <Bubble x={x} y={y} label={lab} />
        </Show>
      );
    })}
  </>
);

const IEPairs: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  let cells = ['000', '000', '000'];
  let bands: Band[] = [0, 1, 2, 3, 4, 5].map((k) => ({ k: k < 3 ? 'r' : 'c', i: k % 3, op: ease(f, l(0, 0.25 + k * 0.1), 14) * fadeTo(f, l(1, 0.0), 0, 10) }));
  let mult = false;
  if (f >= l(1, 0.0)) { cells = ['111', 'fff', 'fff']; bands = [{ k: 'r', i: 0 }]; mult = true; }
  if (f >= l(2, 0.35)) { cells = ['111', '100', '100']; bands = [{ k: 'r', i: 0 }, { k: 'c', i: 0 }]; mult = false; }
  if (f >= l(3, 0.0)) { cells = ['111', '111', 'fff']; bands = [{ k: 'r', i: 0 }, { k: 'r', i: 1 }]; mult = true; }
  if (f >= l(3, 0.46)) { cells = ['11f', '11f', '11f']; bands = [{ k: 'c', i: 0 }, { k: 'c', i: 1 }]; }
  if (f >= l(4, 0.0)) { cells = ['f1f', '111', 'f1f']; bands = [{ k: 'r', i: 1 }, { k: 'c', i: 1 }]; }
  if (f >= l(5, 0.0)) { mult = false; }
  return (
    <>
      <Grid x={GX} y={GY} p={GP} cells={cells} bands={bands} mult={mult} />
      <Bubbles starts={[0, 1, 2, 3, 4, 5].map((k) => l(0, 0.25 + k * 0.1))} />
      <Show from={l(1, 0.4)} to={l(2, 0.0)}>
        <T x={ex(150)} y={300} tex="2^6=64" size={80} />
      </Show>
      <Show from={l(2, 0.6)} to={l(3, 0.0)}>
        <Tag x={ex(130)} y={300} w={640} size={52} color={C.red}>counted twice!</Tag>
        <Tag x={ex(130)} y={380} w={500} size={40} color={C.muted}>in R1's group and C1's</Tag>
      </Show>
      <Show from={l(3, 0.15)} to={l(4, 0.0)}>
        <Tag x={ex(130)} y={240} w={240} size={44}>2 rows</Tag>
        <T x={ex(390)} y={226} tex="2^3=8" size={72} />
      </Show>
      <Show from={l(3, 0.62)} to={l(4, 0.0)}>
        <Tag x={ex(130)} y={400} w={240} size={44}>2 columns</Tag>
        <T x={ex(390)} y={386} tex="2^3=8" size={72} />
      </Show>
      <Show from={l(4, 0.3)} to={l(5, 0.0)}>
        <T x={ex(150)} y={280} tex="2^4=16" size={80} />
        <Tag x={ex(150)} y={400} w={640} size={44} color={BAND}>cross: 5 lights</Tag>
      </Show>
      <Show from={l(5, 0.1)}>
        <T x={ex(170)} y={230} tex="6\times8=48" size={56} />
        <Tag x={ex(170)} y={316} w={500} size={36} color={C.muted}>3 row pairs + 3 column pairs</Tag>
      </Show>
      <Show from={l(5, 0.55)}>
        <T x={ex(170)} y={420} tex="3\times3\times16=144" size={56} />
        <Tag x={ex(170)} y={506} w={500} size={36} color={C.muted}>3 rows × 3 columns</Tag>
      </Show>
      <Ledger starts={[l(2, 0.12), 9e6, 9e6, 9e6, 9e6, 9e6]} />
    </>
  );
};

// ---------- Scene: ie-more ----------

const IEMore: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => (i === 0 ? at(scene, 0, t) : at(scene, i + 1, t));
  let cells = ['000', '000', '000'];
  let bands: Band[] = [];
  let mult = false;
  if (f >= l(1, 0.0)) { cells = ['111', '111', '1ff']; bands = [{ k: 'r', i: 0 }, { k: 'r', i: 1 }, { k: 'c', i: 0 }]; mult = true; }
  if (f >= l(2, 0.0)) { cells = ['111', '11f', '11f']; bands = [{ k: 'r', i: 0 }, { k: 'c', i: 0 }, { k: 'c', i: 1 }]; }
  if (f >= l(3, 0.0)) { cells = ['111', '111', '11f']; bands = [{ k: 'r', i: 0 }, { k: 'r', i: 1 }, { k: 'c', i: 0 }, { k: 'c', i: 1 }]; }
  if (f >= l(4, 0.0)) { cells = ['111', '111', '111']; bands = [{ k: 'r', i: 0 }, { k: 'r', i: 1 }, { k: 'r', i: 2 }, { k: 'c', i: 0 }]; mult = false; }
  if (f >= l(5, 0.0)) { bands = []; }
  const all3 = ['111', '111', '111'];
  return (
    <>
      <Grid x={GX} y={GY} p={GP} cells={cells} bands={bands} mult={mult} />
      <Show from={l(0, 0.35)} to={l(1, 0.0)}>
        <Tag x={ex(130)} y={240} w={500} size={46} color={C.ink}>In 3 groups: added 3 times, taken away 3 times: 0</Tag>
      </Show>
      <Show from={at(scene, 1, 0.2)} to={l(1, 0.0)}>
        <Tag x={ex(130)} y={450} w={500} size={46} color={BAND}>So add the triples back</Tag>
      </Show>
      <Show from={l(1, 0.25)} to={l(2, 0.0)}>
        <T x={ex(150)} y={230} tex="2^2=4" size={72} />
      </Show>
      <Show from={l(1, 0.55)} to={l(2, 0.0)}>
        <T x={ex(150)} y={350} tex="9\times4=36" size={72} />
        <Tag x={ex(130)} y={440} w={500} size={36} color={C.muted}>3 row pairs × 3 columns = 9</Tag>
      </Show>
      <Show from={l(2, 0.1)} to={l(3, 0.0)}>
        <T x={ex(150)} y={200} tex="9\times4=36" size={72} />
      </Show>
      <Show from={l(2, 0.4)} to={l(3, 0.0)}>
        <Mini x={ex(130)} y={350} p={50} cells={all3} bands={[{ k: 'r', i: 0 }, { k: 'r', i: 1 }, { k: 'r', i: 2 }]} label="all rows: 1" labelSize={36} w={250} />
      </Show>
      <Show from={l(2, 0.6)} to={l(3, 0.0)}>
        <Mini x={ex(130) + 250} y={350} p={50} cells={all3} bands={[{ k: 'c', i: 0 }, { k: 'c', i: 1 }, { k: 'c', i: 2 }]} label="all columns: 1" labelSize={36} w={250} />
      </Show>
      <Show from={l(3, 0.3)} to={l(4, 0.0)}>
        <T x={ex(150)} y={240} tex="9\times2=18" size={72} />
        <Tag x={ex(130)} y={330} w={500} size={40} color={C.muted}>3 × 3 ways</Tag>
      </Show>
      <Show from={l(4, 0.1)} to={l(5, 0.0)}>
        <Mini x={ex(130)} y={230} p={50} cells={all3} bands={[{ k: 'r', i: 0 }, { k: 'r', i: 1 }, { k: 'r', i: 2 }, { k: 'c', i: 0 }]} label="3 rows + 1 column: ×3" labelSize={34} w={250} />
        <Mini x={ex(130) + 250} y={230} p={50} cells={all3} bands={[{ k: 'r', i: 0 }, { k: 'c', i: 0 }, { k: 'c', i: 1 }, { k: 'c', i: 2 }]} label="1 row + 3 columns: ×3" labelSize={34} w={250} />
      </Show>
      <Show from={l(4, 0.6)} to={l(5, 0.0)}>
        <T x={ex(150)} y={540} tex="3+3=6" size={72} />
      </Show>
      <Show from={l(5, 0.12)}>
        <Tag x={ex(130)} y={260} w={500} size={44} color={C.ink}>any 5 lines: all on, 6 ways</Tag>
      </Show>
      <Show from={l(5, 0.55)}>
        <Tag x={ex(130)} y={380} w={500} size={44} color={C.ink}>all 6 lines: 1 way</Tag>
      </Show>
      <Ledger wide starts={[0, l(0, 0.2), l(2, 0.8), l(4, 0.85), l(5, 0.15), l(5, 0.6)]} />
    </>
  );
};

// ---------- Scene: ie-sum ----------

const IESum: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const p = ease(f, l(0, 0.12), Math.max(30, Math.round(at(scene, 0, 0.8) - l(0, 0.12))));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ clipPath: `inset(-20px ${(1 - p) * 100}% -20px 0)` }}>
          <Tex tex="384-192+74-24+6-1={\color{#21c45d}247}" size={92} />
        </div>
      </div>
      <Check x={680} y={400} start={l(0, 0.9)}>same answer</Check>
      <Show from={l(1, 0.25)}>
        <Card x={130} y={540} w={830} h={210} border={C.primary} />
        <Tag x={170} y={570} w={750} size={44} color={C.primary}>Count losers</Tag>
        <Tag x={170} y={640} w={750} size={42} weight={700}>shorter here</Tag>
      </Show>
      <Show from={l(1, 0.6)}>
        <Card x={990} y={540} w={800} h={210} border={C.violet} />
        <Tag x={1030} y={570} w={720} size={44} color={C.violet}>Inclusion–exclusion</Tag>
        <Tag x={1030} y={640} w={720} size={42} weight={700}>works for ANY overlaps</Tag>
      </Show>
    </>
  );
};

// ---------- Scene: traps ----------

const TrapCard: React.FC<{ x: number; y: number; letter: string; value: string; tex: string; label: string; start: number; mini?: React.ReactNode; to?: number; children?: React.ReactNode }> = ({ x, y, letter, value, tex, label, start, mini, children, to }) => (
  <Show from={start} to={to}>
    <Card x={x} y={y} w={830} h={250} border={C.red} />
    <Pill x={x + 30} y={y + 18} color={C.red} style={{ fontSize: 38, padding: '6px 24px' }}>{letter} · {value}</Pill>
    <T x={x + 36} y={y + 96} tex={tex} size={56} />
    <Tag x={x + 36} y={y + 180} w={560} size={36} color={C.muted}>{label}</Tag>
    {mini}
    {children}
  </Show>
);

const Traps: SceneComponent = ({ scene }) => {
  const l = (i: number, t = 0) => at(scene, i, t);
  const X1 = 100, X2 = 990, Y1 = 220, Y2 = 500;
  return (
    <>
      <Show from={4} to={l(5, 0.0)}>
        <Tag x={160} y={140} w={1600} size={56} align="center">Each wrong answer is a trap</Tag>
      </Show>
      <TrapCard x={X1} y={Y1} letter="A" value="169" tex="512-343=169" label="rows only: columns forgotten" start={l(0, 0.1)} to={l(5, 0.0)}
        mini={<Mini x={X1 + 830 - 190} y={Y1 + 60} p={46} cells={['111', '000', '000']} bands={[{ k: 'r', i: 0 }, { k: 'c', i: 0, color: C.muted, solid: false }, { k: 'c', i: 1, color: C.muted, solid: false }, { k: 'c', i: 2, color: C.muted, solid: false }]} />} />
      <TrapCard x={X2} y={Y1} letter="C" value="265" tex="343-78=265" label="the losers: forgot 512 − 265" start={l(1, 0.1)} to={l(5, 0.0)} />
      <TrapCard x={X1} y={Y2} letter="D" value="338" tex="169+169=338" label="rows + columns" start={l(2, 0.1)} to={l(5, 0.0)}
        mini={
          <Show from={l(3, 0.1)}>
            <Mini x={X1 + 830 - 190} y={Y2 + 40} p={46} cells={['111', '100', '100']} bands={[{ k: 'r', i: 0 }, { k: 'c', i: 0 }]} />
            <Tag x={X1 + 830 - 330} y={Y2 + 188} w={300} size={34} color={C.red} align="center">counted twice</Tag>
          </Show>
        } />
      <TrapCard x={X2} y={Y2} letter="E" value="384" tex="6\times64=384" label="no overlaps taken away" start={l(4, 0.1)} to={l(5, 0.0)} />
      <Show from={l(5, 0.1)}>
        <Card x={260} y={280} w={1400} h={300} border={C.amber} />
        <Tag x={260} y={340} w={1400} size={64} color={C.ink} align="center">Overlaps?</Tag>
        <Tag x={260} y={430} w={1400} size={64} color={C.amber} align="center">Did I count anything twice?</Tag>
      </Show>
    </>
  );
};

// ---------- Scene: variant ----------

const VGX = 765, VGY = 230, VP = 130;

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const r0 = l(1, 0.5), c0 = l(1, 0.78);
  const row = ease(f, r0, 12) * fadeTo(f, r0 + 26, 0, 10);
  const col = ease(f, c0, 12) * fadeTo(f, c0 + 26, 0, 10);
  const cells = row > 0.05 ? ['111', '000'] : col > 0.05 ? ['001', '001'] : ['000', '000'];
  return (
    <>
      <Show from={l(0, 0.1)}>
        <Grid x={VGX} y={VGY} p={VP} cells={cells} bands={[{ k: 'r', i: 0, op: row }, { k: 'c', i: 2, op: col }]} />
        <Tag x={460} y={VGY + 2 * VP + 30} w={1000} size={52} color={C.violet} align="center">6 lights: 2 rows of 3</Tag>
      </Show>
      <Show from={l(1, 0.05)}>
        <Tag x={160} y={680} w={1600} size={56} align="center">At least one full row or full column?</Tag>
      </Show>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VLEDGER = ['7\\times7=49', '27-3=24', '49-24=25'];

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  let cells = ['000', '000'];
  let bands: Band[] = [];
  let mult = false;
  if (f >= l(1, 0.0)) { cells = ['1ff', '1ff']; bands = [{ k: 'c', i: 0 }]; }
  if (f >= l(2, 0.0)) { cells = ['11f', '11f']; bands = [{ k: 'c', i: 0 }, { k: 'c', i: 1 }]; }
  if (f >= l(3, 0.0)) { cells = ['000', '000']; bands = []; }
  const done = l(4, 0.88);
  const vx = (x: number) => GX + 3 * GP + x;
  const starts = [l(0, 0.5), l(2, 0.75), l(3, 0.35)];
  return (
    <>
      <Grid x={GX} y={GY} p={GP} cells={cells} bands={bands} mult={mult} />
      {[0, 1].map((i) => (
        <Show key={i} from={l(0, 0.12 + i * 0.12)} to={l(1, 0.0)}>
          <Tag x={vx(14)} y={GY + i * GP + 26} w={100} size={64}>7</Tag>
        </Show>
      ))}
      <Show from={l(0, 0.45)} to={l(1, 0.0)}>
        <Tag x={vx(130)} y={250} w={600} size={50} color={C.muted}>no full row</Tag>
      </Show>
      <Show from={l(1, 0.1)} to={l(2, 0.0)}>
        {['100', '110', '101', '111'].map((s, k) => (
          <Show key={k} from={l(1, 0.12 + k * 0.1)}>
            <Mini x={vx(130) + k * 180} y={230} p={40} cells={[s]} ink={s !== '111'} />
          </Show>
        ))}
        <Strike x={vx(130) + 3 * 180 - 6} y={230 - 6} w={132} h={52} />
        <Tag x={vx(130)} y={330} w={700} size={44}>3 choices per row</Tag>
      </Show>
      <Show from={l(1, 0.55)} to={l(2, 0.0)}>
        <T x={vx(130)} y={420} tex="3\times3=9" size={72} />
      </Show>
      <Show from={l(2, 0.1)} to={l(3, 0.0)}>
        <T x={vx(130)} y={230} tex="3\times9=27" size={72} />
      </Show>
      <Show from={l(2, 0.45)} to={l(3, 0.0)}>
        {[['110', 'col 1, 2'], ['101', 'col 1, 3'], ['011', 'col 2, 3']].map(([s, lab], k) => (
          <Mini key={k} x={vx(130) + k * 220} y={370} p={45} cells={[s, s]} label={lab} labelSize={34} w={200} />
        ))}
        <Tag x={vx(130)} y={540} w={800} size={44} color={C.red}>two full columns: 3 to take away</Tag>
      </Show>
      <Show from={l(3, 0.3)} to={l(4, 0.0)}>
        <T x={vx(130)} y={260} tex="49-24=25" size={80} />
        <Tag x={vx(130)} y={360} w={700} size={44} color={C.muted}>the losers</Tag>
      </Show>
      <Show from={l(4, 0.15)}>
        <T x={vx(130)} y={230} tex="2^6=64" size={80} />
      </Show>
      <Show from={l(4, 0.5)}>
        <T x={vx(130)} y={370} tex="64-25=" size={84} />
      </Show>
      <Show from={l(4, 0.78)}>
        <T x={vx(130) + 480} y={370} tex="39" size={84} />
      </Show>
      {/* ledger */}
      <Show from={starts[0]}>
        <Card x={1360} y={170} w={510} h={330} />
      </Show>
      {VLEDGER.map((t, i) => (
        <Show key={i} from={starts[i]}>
          <T x={1396} y={210 + i * 95} tex={t} size={52} />
        </Show>
      ))}
      <Answer x={1620} y={660} value="39" chime={CHIME} start={done} />
      <Confetti x={1620} y={660} start={done} seed={11} />
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const out1 = fadeTo(f, l(1, 0.02), 0, 12);
  const out2 = fadeTo(f, l(2, 0.02), 0, 12);
  const chips: [string, string][] = [['+', C.primary], ['−', C.red], ['+', C.primary], ['−', C.red], ['+', C.primary], ['−', C.red]];
  return (
    <>
      <div style={{ opacity: out1 }}>
        <Card x={100} y={170} w={1720} h={500} />
        <Tag x={160} y={200} w={800} size={44} color={C.primary}>The big idea</Tag>
        <Show from={l(0, 0.3)}>
          <T x={0} y={290} center tex="+\text{singles}\ -\ \text{pairs}\ +\ \text{triples}\ -\ \cdots" size={64} />
        </Show>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', gap: 36 }}>
          {chips.map(([s, col], i) => (
            <div key={i} style={{ ...fadeUp(f, l(0, 0.3 + i * 0.08)), width: 90, height: 90, borderRadius: '50%', background: col, color: '#fff', fontSize: 64, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s}</div>
          ))}
        </div>
      </div>
      <div style={{ opacity: out2 }}>
        <Show from={l(1, 0.1)}>
          <Card x={100} y={190} w={1720} h={200} border={C.primary} />
          <Tag x={100} y={240} w={1720} size={62} align="center">Every pattern counted exactly once</Tag>
        </Show>
        <Show from={l(1, 0.55)}>
          <Card x={360} y={450} w={1200} h={190} border={C.violet} />
          <Tag x={360} y={490} w={1200} size={56} color={C.violet} align="center">or: total − losers</Tag>
        </Show>
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="Keep exploring!" />
      <Confetti x={960} y={380} start={at(scene, 2, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(PROMPT, ['000', '000', '000'], true, 10, 90, 540),
  rows: Rows,
  cols: Cols,
  reveal: Reveal,
  'ie-pairs': IEPairs,
  'ie-more': IEMore,
  'ie-sum': IESum,
  traps: Traps,
  variant: Variant,
  try2: makePause(PROMPT2, ['000', '000'], false, 10, 110, 400),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`2026-11-07-lights-rows-columns-thumb`, render.sh → poster.jpg): the 3×3 grid of lights, some on, some off, no count.
export const Thumb: React.FC = () => {
  const cells = ['110', '101', '011'];
  const p = 200, x = 40, y = 20;
  return (
    <ThumbFrame chip="AMC 10 Practice" lines={['Think it\'s', <span style={{ color: C.red }}>384?</span>]}>
      <svg viewBox="0 0 680 640" style={{ width: '100%', height: '100%' }}>
        <rect x={x - 10} y={y - 10} width={3 * p + 20} height={3 * p + 20} rx={40} fill={C.card} stroke={C.line} strokeWidth={4} />
        {cells.flatMap((row, ri) =>
          row.split('').map((ch, ci) => {
            const cx = x + (ci + 0.5) * p, cy = y + (ri + 0.5) * p;
            return ch === '1' ? (
              <g key={`${ri}${ci}`}>
                <circle cx={cx} cy={cy} r={p * 0.5} fill={ON_GLOW} />
                <circle cx={cx} cy={cy} r={p * 0.36} fill={ON} stroke="#f0a800" strokeWidth={5} />
              </g>
            ) : (
              <circle key={`${ri}${ci}`} cx={cx} cy={cy} r={p * 0.36} fill={OFF} stroke={OFF_LINE} strokeWidth={6} />
            );
          }),
        )}
      </svg>
    </ThumbFrame>
  );
};

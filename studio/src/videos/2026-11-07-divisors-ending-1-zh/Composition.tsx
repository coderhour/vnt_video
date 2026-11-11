import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { Answer, Choices, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { ThumbFrame } from '../../lib/Thumb';
import { C } from '../../lib/theme';

export const SLUG = '2026-11-07-divisors-ending-1-zh';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GA = C.primary; // powers of 3 / a
const GB = C.violet; // powers of 7 / b
const GC = C.amber; // powers of 13 / c
const ONE = C.green; // boxes ending in 1
const tc = (col: string, tex: string) => `\\textcolor{${col}}{${tex}}`;

const N_TEX = '3^6\\cdot 7^4\\cdot 13^2';
const N_COL = `${tc(GA, '3^6')}\\cdot ${tc(GB, '7^4')}\\cdot ${tc(GC, '13^2')}`;
const V_TEX = '3^5\\cdot 7^4\\cdot 13^3';
const CHOICES = ['24', '25', '26', '27', '28'];
const PAUSE_LABEL = <span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>;

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

const Lbl: React.FC<{ x: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; anchor?: 'center' | 'right' | 'left'; opacity?: number }> = ({
  x, y, tex, start, size = 52, color = C.ink, anchor = 'center', opacity = 1,
}) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12) * opacity;
  if (p <= 0) return null;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0%';
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%)`, opacity: p, whiteSpace: 'nowrap' }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

/** Maths line: left-aligned at x, or centred on the page. */
const Eq: React.FC<{ x?: number; y: number; tex: string | Part[]; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({
  x = 0, y, tex, start, size = 56, color = C.ink, opacity = 1, center = false,
}) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', whiteSpace: 'nowrap', opacity: (s.opacity as number) * opacity, transform: s.transform }}>
      <Z p={tex} size={size} color={color} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color?: string; size?: number; opacity?: number; w?: number; center?: boolean; children: React.ReactNode }> = ({
  x, y, start, color = C.ink, size = 42, opacity = 1, w, center, children,
}) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: center ? x - (w ?? 800) / 2 : x, top: y, width: w, textAlign: center ? 'center' : 'left', fontSize: size, fontWeight: 900, color, whiteSpace: w ? 'normal' : 'nowrap', lineHeight: 1.25, opacity: (s.opacity as number) * opacity, transform: s.transform }}>
      {children}
    </div>
  );
};

const Box: React.FC<{ x: number; y: number; w: number; h: number; start: number; bg?: string; border?: string; opacity?: number; radius?: number; children?: React.ReactNode }> = ({
  x, y, w, h, start, bg = C.card, border = C.line, opacity = 1, radius = 18, children,
}) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start, 10);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, background: bg, border: `4px solid ${border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.06)', opacity: (s.opacity as number) * opacity, transform: s.transform }}>
      {children}
    </div>
  );
};

const Ring: React.FC<{ x: number; y: number; w: number; h: number; start: number; color: string; opacity?: number; radius?: number }> = ({ x, y, w, h, start, color, opacity = 1, radius = 20 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12) * opacity;
  if (p <= 0) return null;
  return <div style={{ position: 'absolute', left: x - 6, top: y - 6, width: w + 12, height: h + 12, borderRadius: radius, border: `7px solid ${color}`, boxSizing: 'border-box', opacity: p }} />;
};

/** A number whose last digit is bold and coloured. */
const Num: React.FC<{ v: string | number; color: string; size?: number; hi?: boolean }> = ({ v, color, size = 52, hi = true }) => {
  const s = String(v);
  return (
    <span style={{ fontSize: size, fontWeight: 700, color: C.muted }}>
      {s.slice(0, -1)}
      <span style={{ color: hi ? color : C.muted, fontWeight: 900, fontSize: size * 1.12 }}>{s.slice(-1)}</span>
    </span>
  );
};

const dig = (a: number, c: number) => (3 ** a * 13 ** c) % 10;

type Cell = { text?: string; fill?: string; color?: string; start: number; opacity?: number; ring?: string; ringStart?: number };

/** Grid of boxes: a across (green), c down (amber). */
const GridView: React.FC<{ x: number; y: number; cols: number; rows: number; cw: number; headStart: number; cell: (a: number, c: number) => Cell }> = ({ x, y, cols, rows, cw, headStart, cell }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Lbl x={x - 56} y={y - 56} tex={`${tc(GC, 'c')}\\!\\backslash\\!${tc(GA, 'a')}`} start={headStart} size={46} />
      {range(cols).map((a) => (
        <Lbl key={`h${a}`} x={x + a * cw + cw / 2} y={y - 56} tex={`${a}`} start={headStart} color={GA} size={54} />
      ))}
      {range(rows).map((c) => (
        <Lbl key={`r${c}`} x={x - 56} y={y + c * cw + cw / 2} tex={`${c}`} start={headStart} color={GC} size={54} />
      ))}
      {range(rows).flatMap((c) =>
        range(cols).map((a) => {
          const k = cell(a, c);
          const s = fadeUp(f, headStart + 4, 10);
          const p = ease(f, k.start, 10);
          return (
            <div key={`${a}-${c}`}>
              <div style={{ position: 'absolute', left: x + a * cw + 4, top: y + c * cw + 4, width: cw - 8, height: cw - 8, borderRadius: 16, background: C.card, border: `3px solid ${C.line}`, boxSizing: 'border-box', opacity: s.opacity }} />
              {(k.fill || k.text !== undefined) && (
                <div style={{ position: 'absolute', left: x + a * cw + 4, top: y + c * cw + 4, width: cw - 8, height: cw - 8, borderRadius: 16, background: k.fill ?? 'transparent', color: k.color ?? C.ink, fontSize: Math.round(cw * 0.56), fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p * (k.opacity ?? 1), transform: `scale(${0.85 + 0.15 * p})` }}>
                  {k.text}
                </div>
              )}
              {k.ring && <Ring x={x + a * cw + 4} y={y + c * cw + 4} w={cw - 8} h={cw - 8} start={k.ringStart ?? k.start} color={k.ring} radius={18} />}
            </div>
          );
        }),
      )}
    </>
  );
};

// ---------- Scene: intro ----------

const SAMPLES = [21, 63, 91, 169, 2401];

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const chipsOut = fadeTo(f, at(scene, 2, 0), 0, 12);
  const hi = f >= at(scene, 1, 0.55);
  return (
    <>
      <Eq center y={190} tex={N_COL} start={4} size={100} />
      <Tag x={960} y={345} start={at(scene, 0, 0.35)} color={C.muted} size={52} w={900} center>105 个因数</Tag>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, opacity: ease(f, at(scene, 0, 0.62), 12) }}>
        <div style={{ fontSize: 60, fontWeight: 800 }}>有多少个的个位是</div>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: ONE, color: '#fff', fontSize: 90, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
        <div style={{ fontSize: 60, fontWeight: 800 }}>？</div>
      </div>
      {SAMPLES.map((v, i) => (
        <Box key={v} x={412 + i * 224} y={650} w={200} h={104} start={at(scene, 1, 0.05 + i * 0.1)} opacity={chipsOut}>
          <Num v={v} color={ONE} size={54} hi={hi} />
        </Box>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.05)), opacity: ease(f, at(scene, 2, 0.05), 14) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet, lineHeight: 1.15 }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted }}>你的数学小导师</div>
      </div>
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Pill x={100} y={140} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>题目</Pill>
      <div style={{ position: 'absolute', left: 100, top: 230, width: 1720, background: C.card, borderRadius: 32, padding: '36px 52px', fontSize: 54, fontWeight: 700, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        <div style={{ margin: '0 0 14px' }}>
          <Mark on={at(scene, 0, 0.45)}><Tex tex={N_TEX} size={72} /></Mark>
        </div>
        <div>的正因数中，有多少个<Mark on={at(scene, 1, 0.3)}>个位数字是 1</Mark>？</div>
      </div>
      <Choices x={170} y={640} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={(i) => at(scene, 2, 0.1 + i * 0.12)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ranges = [
    [`0\\le a\\le 6`, GA],
    [`0\\le b\\le 4`, GB],
    [`0\\le c\\le 2`, GC],
  ];
  return (
    <>
      <Eq center y={150} start={at(scene, 0, 0.2)} size={84} tex={`${tc(GA, '3^a')}\\cdot ${tc(GB, '7^b')}\\cdot ${tc(GC, '13^c')}`} />
      {ranges.map(([tex, col], i) => (
        <Box key={i} x={250 + i * 470} y={290} w={430} h={96} start={at(scene, 1, 0.3 + i * 0.22)} border={col}>
          <Tex tex={tex} size={56} color={col} />
        </Box>
      ))}
      <Eq center y={440} start={at(scene, 2, 0.25)} size={64} tex={`${tc(GA, '7')}\\times${tc(GB, '5')}\\times${tc(GC, '3')}=105`} />
      <Tag x={960} y={535} start={at(scene, 2, 0.7)} color={C.red} size={46} w={900} center>太多了，列不完！</Tag>
      <Eq x={420} y={650} start={at(scene, 3, 0.5)} size={64} tex={`2\\mathbf{1}\\times 6\\mathbf{3}=132\\mathbf{3}`} />
      <Eq x={1130} y={650} start={at(scene, 3, 0.75)} size={60} color={GA} tex={`\\mathbf{1}\\times\\mathbf{3}=\\mathbf{3}`} />
    </>
  );
};

// ---------- Scene: pauses ----------

const makePause = (withChoices: boolean, seconds: number, tex: string, prompt: string): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={130} y={220} start={4} size={70} tex={tex} />
      <Text x={130} y={withChoices ? 400 : 420} w={1000} size={46} style={fadeUp(f, 6)}>{prompt}</Text>
      {withChoices && <Choices x={130} y={580} items={CHOICES.map((c) => <Tex key={c} tex={c} size={56} />)} start={() => 8} />}
      <Countdown scene={scene} seconds={seconds} x={1500} y={560} tick={TICK} label={PAUSE_LABEL} />
    </>
  );
};

// ---------- Scene: cycles ----------

const Strip: React.FC<{ x: number; y: number; w: number; h: number; gap: number; items: (string | number)[]; color: string; start: (i: number) => number; digits?: boolean; ring?: string; ringStart?: number; ringN?: number }> = ({
  x, y, w, h, gap, items, color, start, digits, ring, ringStart = 0, ringN = 0,
}) => (
  <>
    {items.map((v, i) => (
      <Box key={i} x={x + i * (w + gap)} y={y} w={w} h={h} start={start(i)}>
        {digits ? <span style={{ fontSize: 60, fontWeight: 900, color }}>{v}</span> : <Num v={v} color={color} size={50} />}
      </Box>
    ))}
    {ring && range(ringN).map((i) => <Ring key={i} x={x + i * (w + gap)} y={y} w={w} h={h} start={ringStart} color={ring} />)}
  </>
);

const Cycles: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const X0 = 360;
  const loop = ease(f, at(scene, 1, 0.8), 16);
  return (
    <>
      <Lbl x={110} y={225} tex={tc(GA, '3^k')} start={at(scene, 0, 0.45)} size={64} anchor="left" />
      <Strip x={X0} y={170} w={150} h={104} gap={12} items={[1, 3, 9, 27, 81]} color={GA} start={(i) => at(scene, 1, 0.12 + i * 0.1)} />
      <Strip x={X0} y={296} w={110} h={104} gap={12} items={[1, 3, 9, 7, 1, 3, 9]} color={GA} digits start={(i) => at(scene, 1, 0.55 + i * 0.05)} />
      <Tag x={X0 + 7 * 122 + 20} y={322} start={at(scene, 1, 0.55)} color={C.muted} size={40}>个位</Tag>
      <Stage>
        <g opacity={loop} fill="none" stroke={GA} strokeWidth={8} strokeLinecap="round">
          <path d={`M ${X0 + 4 * 122 - 40} 420 Q ${X0 + 2 * 122 - 10} 456 ${X0 + 30} 420`} />
          <path d={`M ${X0 + 52} 408 L ${X0 + 30} 420 L ${X0 + 56} 438`} />
        </g>
      </Stage>
      <Tag x={X0 + 2 * 122 + 60} y={448} start={at(scene, 1, 0.82)} color={GA} size={42}>循环</Tag>

      <Lbl x={110} y={580} tex={tc(GB, '7^b')} start={at(scene, 2, 0.05)} size={64} anchor="left" />
      <Strip x={X0} y={528} w={150} h={104} gap={12} items={[1, 7, 49, 343, 2401]} color={GB} start={(i) => at(scene, 2, 0.15 + i * 0.1)} />
      <Tag x={X0 + 5 * 162 + 30} y={552} start={at(scene, 2, 0.7)} color={GB} size={42}>1, 7, 9, 3, 1</Tag>

      <Lbl x={110} y={730} tex={tc(GC, '13^c')} start={at(scene, 3, 0.02)} size={64} anchor="left" />
      <Strip x={X0} y={678} w={150} h={104} gap={12} items={[1, 13, 169]} color={GC} start={(i) => at(scene, 3, 0.1 + i * 0.12)} ring={GC} ringStart={at(scene, 3, 0.62)} ringN={3} />
      <Tag x={X0 + 3 * 162 + 40} y={700} start={at(scene, 3, 0.6)} color={GC} size={46}>
        和 <span style={{ color: GA }}>3</span> 一样
      </Tag>
      <Ring x={X0} y={296} w={110 * 3 + 24} h={104} start={at(scene, 3, 0.62)} color={GC} />
    </>
  );
};

// ---------- Scene: grid ----------

const GridScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const order = (a: number, c: number) => c * 7 + a;
  const oneStart: Record<string, number> = {
    '0-0': at(scene, 2, 0.28), '4-0': at(scene, 2, 0.38), '3-1': at(scene, 2, 0.52), '2-2': at(scene, 2, 0.66), '6-2': at(scene, 2, 0.76),
  };
  const lit = f >= at(scene, 2, 0.26);
  return (
    <>
      <GridView x={330} y={300} cols={7} rows={3} cw={124} headStart={4} cell={(a, c) => {
        const isOne = dig(a, c) === 1;
        const t = at(scene, 1, 0.12 + (order(a, c) / 21) * 0.55);
        if (isOne) {
          const s = oneStart[`${a}-${c}`];
          return { text: '1', start: t, fill: f >= s ? ONE : undefined, color: f >= s ? '#fff' : C.ink };
        }
        return { text: String(dig(a, c)), start: t, opacity: lit ? 0.35 : 1 };
      }} />
      <Tag x={1290} y={420} start={at(scene, 1, 0.35)} color={C.ink} size={56}>21 个方块</Tag>
      <Tag x={1290} y={520} start={at(scene, 2, 0.88)} color={ONE} size={56}>5 个 1</Tag>
      <Eq x={330} y={720} start={at(scene, 1, 0.55)} size={52} tex={[`${tc(GA, '3^a')}\\cdot${tc(GC, '13^c')}`, z('的个位')]} />
    </>
  );
};

// ---------- Scene: match ----------

const PARTNER: Record<number, number> = { 1: 1, 3: 7, 9: 9, 7: 3 };
const SEVENS = [1, 7, 9, 3, 1];

const Match: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // which digit is being matched
  const t1 = at(scene, 1, 0.25), t2 = at(scene, 2, 0.2), t3 = at(scene, 3, 0.1), t4 = at(scene, 3, 0.55), t5 = at(scene, 4, 0.1);
  const active = f >= t5 ? 0 : f >= t4 ? 7 : f >= t3 ? 9 : f >= t2 ? 3 : f >= t1 ? 1 : 0;
  const act = f >= t5 ? -1 : active; // line 4 tints all non-ones
  const gx = 190, gy = 250, cw = 104;
  const bx = 1130, by = 330, bw = 120;
  const rowT = [at(scene, 1, 0.5), at(scene, 2, 0.45), at(scene, 3, 0.45), at(scene, 3, 0.9)];
  const rows = [
    [`\\mathbf{1}\\to\\mathbf{1}\\ \\ \\times 2`, z('种')],
    `\\mathbf{3}\\to\\mathbf{7}\\ \\ 3\\times7=21`,
    `\\mathbf{9}\\to\\mathbf{9}\\ \\ 9\\times9=81`,
    `\\mathbf{7}\\to\\mathbf{3}\\ \\ 7\\times3=21`,
  ];
  const partnerChips = (d: number) => SEVENS.map((v, i) => (v === PARTNER[d] ? i : -1)).filter((i) => i >= 0);
  return (
    <>
      <GridView x={gx} y={gy} cols={7} rows={3} cw={cw} headStart={0} cell={(a, c) => {
        const d = dig(a, c);
        const isOne = d === 1;
        const tint = f >= t5 && !isOne ? 'rgba(123,97,255,0.16)' : undefined;
        return { text: String(d), start: 0, fill: isOne ? ONE : tint, color: isOne ? '#fff' : C.ink, ring: act === d && act > 0 ? C.ink : undefined, ringStart: act === 1 ? t1 : act === 3 ? t2 : act === 9 ? t3 : t4 };
      }} />
      <Eq x={gx - 40} y={640} start={at(scene, 0, 0.3)} size={50} tex={[z('方块'), '\\times', z('搭档的个位是'), '1']} />
      <Tag x={gx - 40} y={745} start={at(scene, 4, 0.7)} color={GB} size={46}>其余方块：×1 种</Tag>

      <Lbl x={bx - 40} y={by - 80} tex={tc(GB, 'b')} start={at(scene, 0, 0.5)} size={56} anchor="right" />
      <Lbl x={bx - 40} y={by + 52} tex={tc(GB, '7^b')} start={at(scene, 0, 0.5)} size={56} anchor="right" />
      {SEVENS.map((v, i) => (
        <div key={i}>
          <Lbl x={bx + i * (bw + 10) + bw / 2} y={by - 80} tex={`${i}`} start={at(scene, 0, 0.55)} color={GB} size={54} />
          <Box x={bx + i * (bw + 10)} y={by} w={bw} h={104} start={at(scene, 0, 0.6 + i * 0.06)} border={GB}>
            <span style={{ fontSize: 60, fontWeight: 900, color: GB }}>{v}</span>
          </Box>
        </div>
      ))}
      {act > 0 && partnerChips(act).map((i) => (
        <Ring key={`${act}-${i}`} x={bx + i * (bw + 10)} y={by} w={bw} h={104} start={act === 1 ? t1 : act === 3 ? t2 : act === 9 ? t3 : t4} color={ONE} />
      ))}
      {f >= t5 && [1, 2, 3].map((i) => <Ring key={`s${i}`} x={bx + i * (bw + 10)} y={by} w={bw} h={104} start={t5} color={GB} />)}
      {rows.map((tex, i) => (
        <Eq key={i} x={1000} y={500 + i * 84} start={rowT[i]} size={52} tex={tex} />
      ))}
    </>
  );
};

// ---------- Scene: reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cw = 90, mx = 1090, my = 260;
  return (
    <>
      {range(3).flatMap((c) => range(7).map((a) => {
        const one = dig(a, c) === 1;
        const s = at(scene, 0, one ? 0.3 : 0.6);
        const p = ease(f, s, 10);
        return (
          <div key={`${a}${c}`} style={{ position: 'absolute', left: mx + a * cw + 3, top: my + c * cw + 3, width: cw - 6, height: cw - 6, borderRadius: 14, background: one ? ONE : 'rgba(123,97,255,0.16)', color: one ? '#fff' : GB, fontSize: 44, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p }}>
            {one ? '×2' : '×1'}
          </div>
        );
      }))}
      <Eq x={200} y={240} start={at(scene, 0, 0.3)} size={70} color={ONE} tex={`5\\times2=10`} />
      <Eq x={200} y={370} start={at(scene, 0, 0.62)} size={70} color={GB} tex={`16\\times1=16`} />
      <Eq x={200} y={500} start={at(scene, 0, 0.7)} size={52} color={C.muted} tex={`21-5=16`} />
      <Eq x={200} y={650} start={at(scene, 1, 0.1)} size={80} tex={`10+16=`} />
      <Eq x={660} y={650} start={at(scene, 1, 0.74)} size={80} color={ONE} tex={`26`} />
      <Answer x={1500} y={720} value="26" start={at(scene, 1, 0.88)} chime={CHIME} />
      <Tag x={1500} y={850} start={at(scene, 1, 0.9)} color={ONE} size={46} w={300} center>选 C</Tag>
      <Confetti x={1500} y={720} start={at(scene, 1, 0.88)} seed={7} />
    </>
  );
};

// ---------- Scene: power3 ----------

const Power3: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const early = fadeTo(f, at(scene, 3, 0), 0, 12);
  const X0 = 330, cw = 118;
  const exps = range(9);
  const digs = [1, 3, 9, 7, 1, 3, 9, 7, 1];
  const glow = ease(f, at(scene, 3, 0.7), 14);
  return (
    <>
      <Eq center y={165} start={at(scene, 0, 0.2)} size={66} opacity={early} tex={`3^3=2${tc(GB, '7')}`} />
      <Eq x={330} y={265} start={at(scene, 1, 0.1)} size={62} opacity={early} tex={`${tc(GB, '7')}\\equiv 3^3`} />
      <Eq x={1000} y={265} start={at(scene, 2, 0.1)} size={62} opacity={early} tex={`${tc(GC, '13')}\\equiv 3^1`} />
      <Tag x={960} y={345} start={at(scene, 1, 0.1)} color={C.muted} size={40} w={1000} center opacity={early}>≡ 表示：个位相同</Tag>
      <Eq center y={410} start={at(scene, 1, 0.5)} size={62} opacity={early} tex={`${tc(GB, '7^b')}\\equiv(3^3)^b=3^{${tc(GB, '3b')}}`} />
      <Eq center y={520} start={at(scene, 2, 0.5)} size={58} tex={`${tc(GA, '3^a')}\\cdot${tc(GB, '7^b')}\\cdot${tc(GC, '13^c')}\\equiv 3^{${tc(GA, 'a')}}\\cdot3^{${tc(GB, '3b')}}\\cdot3^{${tc(GC, 'c')}}=3^{${tc(GA, 'a')}+${tc(GB, '3b')}+${tc(GC, 'c')}}`} />
      {exps.map((k) => {
        const one = digs[k] === 1;
        return (
          <div key={k}>
            <Lbl x={X0 + k * cw + cw / 2} y={650} tex={`${k}`} start={at(scene, 3, 0.12 + k * 0.04)} size={52} color={C.muted} />
            <Box x={X0 + k * cw + 4} y={690} w={cw - 8} h={96} start={at(scene, 3, 0.15 + k * 0.04)} bg={one ? `rgba(33,196,93,${0.18 + 0.82 * glow})` : C.card} border={one ? ONE : C.line}>
              <span style={{ fontSize: 60, fontWeight: 900, color: one && glow > 0.5 ? '#fff' : C.ink }}>{digs[k]}</span>
            </Box>
          </div>
        );
      })}
      <Tag x={X0 - 20} y={650} start={at(scene, 3, 0.1)} color={C.muted} size={36}>
        <span style={{ position: 'absolute', right: 0, whiteSpace: 'nowrap', top: -4 }}>指数</span>
      </Tag>
      <Tag x={X0 - 20} y={718} start={at(scene, 3, 0.1)} color={C.muted} size={36}>
        <span style={{ position: 'absolute', right: 0, whiteSpace: 'nowrap', top: 0 }}>个位</span>
      </Tag>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 195, display: 'flex', justifyContent: 'center', opacity: ease(f, at(scene, 3, 0.55), 12) }}>
        <div style={{ border: `7px solid ${ONE}`, borderRadius: 24, padding: '10px 36px', background: C.card }}>
          <Z size={66} p={[`${tc(GA, 'a')}+${tc(GB, '3b')}+${tc(GC, 'c')}=4`, z('的倍数')]} />
        </div>
      </div>
    </>
  );
};

// ---------- Scene: count ----------

const TARGETS: number[][] = [[0, 4, 8], [1, 5], [2, 6], [3, 7], [0, 4, 8]];
const SUM_TEX = ['0,\\,4,\\,8', '4,\\,8', '8,\\,12', '12,\\,16', '12,\\,16,\\,20'];
const COUNT_TEX = ['1+3+1=5', '2+3=5', '3+3=6', '3+2=5', '1+3+1=5'];
const TARGET_TEX = ['0,\\,4,\\,8', '1,\\,5', '2,\\,6', '3,\\,7', '0,\\,4,\\,8'];

const Count: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // line of each b's first line; highlight starts when the a + c values are spoken
  const bLine = [1, 2, 4, 5, 6];
  const hl = [at(scene, 1, 0.04), at(scene, 3, 0.04), at(scene, 4, 0.04), at(scene, 5, 0.04), at(scene, 6, 0.04)];
  let stage = -1;
  for (let k = 0; k < 5; k++) if (f >= hl[k]) stage = k;
  const done = f >= at(scene, 7, 0);
  const morph = ease(f, at(scene, 0, 0.35), 16);
  const gx = 150, gy = 250, cw = 100;
  const tx = 890, ty = 250, rh = 84;
  const cur = done ? [] : TARGETS[Math.max(stage, 0)];
  // [b, 3b, a+c+3b, a+c, boxes] start frames per row
  const T = (b: number) => {
    const L = bLine[b];
    if (b === 0) return [at(scene, L, 0.04), at(scene, L, 0.1), at(scene, L, 0.3), at(scene, L, 0.45), at(scene, L, 0.72)];
    if (b === 1) return [at(scene, 2, 0.04), at(scene, 2, 0.15), at(scene, 2, 0.6), at(scene, 3, 0.15), at(scene, 3, 0.6)];
    if (b === 4) return [at(scene, L, 0.04), at(scene, L, 0.1), at(scene, L, 0.25), at(scene, L, 0.35), at(scene, L, 0.7)];
    return [at(scene, L, 0.04), at(scene, L, 0.2), at(scene, L, 0.3), at(scene, L, 0.45), at(scene, L, 0.75)];
  };
  return (
    <>
      <GridView x={gx} y={gy} cols={7} rows={3} cw={cw} headStart={0} cell={(a, c) => ({ text: undefined, start: 0, fill: cur.includes(a + c) ? ONE : undefined })} />
      {range(3).flatMap((c) => range(7).map((a) => (
        <div key={`t${a}${c}`} style={{ position: 'absolute', left: gx + a * cw + 4, top: gy + c * cw + 4, width: cw - 8, height: cw - 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900, color: cur.includes(a + c) ? '#fff' : C.ink }}>
          <span style={{ position: 'absolute', opacity: 1 - morph, color: dig(a, c) === 1 ? '#fff' : C.ink }}>{dig(a, c)}</span>
          <span style={{ position: 'absolute', opacity: morph }}>{a + c}</span>
        </div>
      )))}
      <Tag x={gx} y={gy + 3 * cw + 24} start={at(scene, 0, 0.5)} color={C.muted} size={40}>现在方块里是 a + c</Tag>
      {/* table */}
      <Lbl x={tx + 20} y={ty - 40} tex={tc(GB, 'b')} start={at(scene, 0, 0.6)} size={48} />
      <Lbl x={tx + 80} y={ty - 40} tex={tc(GB, '3b')} start={at(scene, 0, 0.6)} size={48} />
      <Lbl x={tx + 135} y={ty - 40} tex={`${tc(GA, 'a')}+${tc(GC, 'c')}+${tc(GB, '3b')}`} start={at(scene, 0, 0.6)} size={44} anchor="left" />
      <Lbl x={tx + 430} y={ty - 40} tex={`${tc(GA, 'a')}+${tc(GC, 'c')}`} start={at(scene, 0, 0.6)} size={44} anchor="left" />
      <Lbl x={tx + 665} y={ty - 40} tex={[z('方块数')]} start={at(scene, 0, 0.6)} size={44} anchor="left" />
      {range(5).map((b) => {
        const t = T(b);
        const y = ty + 40 + b * rh;
        return (
          <div key={b}>
            <Lbl x={tx + 20} y={y} tex={`${b}`} start={t[0]} size={48} color={GB} />
            <Lbl x={tx + 80} y={y} tex={`${3 * b}`} start={t[1]} size={48} color={GB} />
            <Lbl x={tx + 135} y={y} tex={`\\{${SUM_TEX[b]}\\}`} start={t[2]} size={44} anchor="left" />
            <Lbl x={tx + 430} y={y} tex={`\\{${TARGET_TEX[b]}\\}`} start={t[3]} size={44} anchor="left" />
            <Lbl x={tx + 665} y={y} tex={COUNT_TEX[b]} start={t[4]} size={44} anchor="left" />
          </div>
        );
      })}
      <Eq x={tx + 20} y={ty + 5 * rh + 50} start={at(scene, 7, 0.55)} size={60} tex={`5+5+6+5+5=${tc(ONE, '26')}`} />
      <div style={{ position: 'absolute', left: gx, top: gy + 3 * cw + 90, width: 700, fontSize: 42, fontWeight: 900, color: GA, lineHeight: 1.25, opacity: ease(f, at(scene, 8, 0.15), 14) }}>
        每个质因数都像同一个数的次方时，就用这个方法
      </div>
    </>
  );
};

// ---------- Scene: traps ----------

const TrapCard: React.FC<{ x: number; y: number; letter: string; val: string; start: number; children: React.ReactNode }> = ({ x, y, letter, val, start, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 860, height: 240, borderRadius: 28, background: C.card, border: `5px solid ${C.red}`, boxSizing: 'border-box', padding: '12px 28px', boxShadow: '0 6px 20px rgba(239,67,67,0.1)', opacity: s.opacity, transform: s.transform }}>
      <div style={{ display: 'inline-block', background: C.red, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 42, fontWeight: 900, marginRight: 28, verticalAlign: 'middle' }}>{letter} · {val}</div>
      {children}
    </div>
  );
};

const IfNote: React.FC<{ tex: string; start: number }> = ({ tex, start }) => {
  const f = useCurrentFrame();
  return (
    <span style={{ fontSize: 38, fontWeight: 800, color: C.muted, verticalAlign: 'middle', opacity: ease(f, start, 12) }}>
      以为 <Tex tex={tex} size={44} /> 个位总是 1
    </span>
  );
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: ONE, color: '#fff', borderRadius: 12, padding: '0 20px', fontSize: 44, fontWeight: 900 }}>{children}</span>
);

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const xs = [90, 970];
  const row1 = 175, row2 = 430;
  return (
    <>
      <Tag x={960} y={118} start={4} color={C.red} size={44} w={1400} center>每个错误答案都是一个陷阱</Tag>
      <TrapCard x={xs[0]} y={row1} letter="A" val="24" start={at(scene, 0, 0.1)}>
        <span style={{ verticalAlign: 'middle' }}><Tex tex="26-2=24" size={52} /></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 38, fontWeight: 800, marginTop: 6, opacity: ease(f, at(scene, 0, 0.5), 12) }}>
          漏了 <Chip>1</Chip> 和 <Chip>这个数本身</Chip>
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: ONE, marginTop: 4, opacity: ease(f, at(scene, 0, 0.75), 12) }}>个位都是 1！</div>
      </TrapCard>
      <TrapCard x={xs[1]} y={row1} letter="B" val="25" start={at(scene, 1, 0.1)}>
        <IfNote tex={`${tc(GB, '7^b')}`} start={at(scene, 1, 0.3)} />
        <div style={{ marginTop: 14, opacity: ease(f, at(scene, 1, 0.6), 12) }}><Tex tex="5\times5=25" size={56} /></div>
        <div style={{ fontSize: 38, fontWeight: 800, color: C.muted, opacity: ease(f, at(scene, 1, 0.7), 12) }}>5 个方块 × b 的 5 种取值</div>
      </TrapCard>
      <TrapCard x={xs[0]} y={row2} letter="D" val="27" start={at(scene, 2, 0.1)}>
        <IfNote tex={`${tc(GC, '13^c')}`} start={at(scene, 2, 0.3)} />
        <div style={{ marginTop: 10, opacity: ease(f, at(scene, 2, 0.65), 12) }}><Tex tex="9\times3=27" size={56} /></div>
        <div style={{ fontSize: 31, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap', opacity: ease(f, at(scene, 2, 0.6), 12) }}>9 对 (a − b 是 4 的倍数) × c 的 3 种取值</div>
      </TrapCard>
      <TrapCard x={xs[1]} y={row2} letter="E" val="28" start={at(scene, 3, 0.1)}>
        <div style={{ marginTop: 8, opacity: ease(f, at(scene, 3, 0.35), 12) }}><Tex tex="28>26" size={64} /></div>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.red, opacity: ease(f, at(scene, 3, 0.5), 12) }}>太多了！</div>
      </TrapCard>
      <div style={{ position: 'absolute', left: 90, top: 700, width: 1740, height: 84, borderRadius: 28, background: ONE, color: '#fff', fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, at(scene, 4, 0.4)) }}>
        检查每个质数的个位循环。
      </div>
    </>
  );
};

// ---------- Scene: variant ----------

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Tag x={960} y={190} start={at(scene, 0, 0.3)} color={C.violet} size={80} w={1400} center>轮到你了！</Tag>
      <Eq center y={380} start={at(scene, 1, 0.45)} size={100} tex={`${tc(GA, '3^5')}\\cdot ${tc(GB, '7^4')}\\cdot ${tc(GC, '13^3')}`} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontSize: 58, fontWeight: 800, ...fadeUp(f, at(scene, 2, 0.1)) }}>
        这个数的正因数中，有多少个的个位是 1？
      </div>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const on = f >= at(scene, 1, 0.3);
  const gx = 210, gy = 250, cw = 100;
  return (
    <>
      <GridView x={gx} y={gy} cols={6} rows={4} cw={cw} headStart={at(scene, 0, 0.1)} cell={(a, c) => {
        const s = a + c;
        const one = s % 4 === 0;
        return { text: String(s), start: at(scene, 0, 0.3 + ((c * 6 + a) / 24) * 0.4), fill: on && one ? ONE : undefined, color: on && one ? '#fff' : C.ink };
      }} />
      <Eq x={gx - 20} y={gy + 4 * cw + 30} start={at(scene, 1, 0.3)} size={50} tex={[`${tc(GA, 'a')}+${tc(GC, 'c')}=0,\\,4`, z('或'), '8']} />
      <Eq x={1000} y={240} start={at(scene, 0, 0.55)} size={64} tex={['6\\times4=24', z('个方块')]} />
      <Eq x={1000} y={335} start={at(scene, 1, 0.65)} size={64} color={ONE} tex={`1+4+1=6`} />
      <Eq x={1000} y={430} start={at(scene, 2, 0.35)} size={64} tex={`6\\times2=12`} />
      <Eq x={1000} y={525} start={at(scene, 3, 0.2)} size={64} tex={`24-6=18`} />
      <Eq x={1000} y={620} start={at(scene, 3, 0.6)} size={64} tex={`18\\times1=18`} />
      <Eq x={1000} y={730} start={at(scene, 4, 0.1)} size={72} tex={`12+18=`} />
      <Eq x={1410} y={730} start={at(scene, 4, 0.82)} size={72} color={ONE} tex={`30`} />
      <Answer x={1730} y={480} value="30" start={at(scene, 4, 0.88)} chime={CHIME} />
      <Confetti x={1730} y={480} start={at(scene, 4, 0.88)} seed={11} />
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 2, 0), 0, 10);
  const rows: [string, string, number[], string][] = [
    ['3^k', GA, [1, 3, 9, 7], 'a'],
    ['7^b', GB, [1, 7, 9, 3], 'b'],
    ['13^c', GC, [1, 3, 9], 'c'],
  ];
  return (
    <>
      <div style={{ opacity: out }}>
        {rows.map(([tex, col, ds], r) => (
          <div key={r}>
            <Lbl x={110} y={225 + r * 120} tex={tc(col, tex)} start={at(scene, 0, 0.3 + r * 0.15)} size={60} anchor="left" />
            {ds.map((d, i) => (
              <Box key={i} x={360 + i * 124} y={175 + r * 120} w={112} h={96} start={at(scene, 0, 0.35 + r * 0.15 + i * 0.04)} border={col}>
                <span style={{ fontSize: 58, fontWeight: 900, color: col }}>{d}</span>
              </Box>
            ))}
            <Tag x={360 + ds.length * 124 + 10} y={190 + r * 120} start={at(scene, 0, 0.6 + r * 0.1)} color={col} size={52}>↻ 循环</Tag>
          </div>
        ))}
        <Eq center y={560} start={at(scene, 1, 0.15)} size={64} tex={`${tc(GA, '3^a')}\\cdot${tc(GB, '7^b')}\\cdot${tc(GC, '13^c')}\\equiv 3^{${tc(GA, 'a')}+${tc(GB, '3b')}+${tc(GC, 'c')}}`} />
        <Tag x={960} y={650} start={at(scene, 1, 0.6)} color={ONE} size={52} w={1500} center>指数是 4 的倍数</Tag>
      </div>
      <SignOff start={at(scene, 2, 0.1)} text="继续探索！" tagline="你的家庭 AI 教练" />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(true, 10, N_TEX, '有多少个正因数的个位数字是 1？'),
  cycles: Cycles,
  grid: GridScene,
  match: Match,
  reveal: Reveal,
  power3: Power3,
  count: Count,
  traps: Traps,
  variant: Variant,
  try2: makePause(false, 10, V_TEX, '有多少个正因数的个位数字是 1？'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10 风格 · 第4级" font={ZH_FONT} /> : null;

// YouTube thumbnail (`2026-11-07-divisors-ending-1-thumb`, render.sh → poster.jpg): the trap + the number 3^6·7^4·13^2 big, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 练习" lines={[<span style={{ fontFamily: ZH_FONT }}>你觉得是</span>, <span style={{ color: C.red, fontFamily: ZH_FONT }}>25？</span>]}>
    <div style={{ width: '100%', height: '100%', background: C.card, borderRadius: 36, boxShadow: '0 8px 28px rgba(30,40,80,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, lineHeight: 1.15 }}>
      <Tex tex="3^6" size={112} color={C.violet} />
      <Tex tex={'\\times 7^4'} size={112} color={C.blue} />
      <Tex tex={'\\times 13^2'} size={112} color={C.primary} />
      <div style={{ fontSize: 44, fontWeight: 800, color: C.muted, marginTop: 16, fontFamily: ZH_FONT }}>个位是 1 的因数有几个？</div>
    </div>
  </ThumbFrame>
);

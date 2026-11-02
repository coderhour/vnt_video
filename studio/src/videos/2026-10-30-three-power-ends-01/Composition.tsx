import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp, pop, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { interpolate } from 'remotion';

export const SLUG = '2026-10-30-three-power-ends-01';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const GREY = '#b3b9c6';
const HLBG = '#c5f0df';
const HLFG = '#07915f';

/** Tex for a number: leading digits faded, last two digits in a green box. */
const dg = (lead: string, last: string, bg = HLBG, fg = HLFG) =>
  `${lead ? `\\textcolor{${GREY}}{${lead}}` : ''}\\textcolor{${fg}}{\\colorbox{${bg}}{${last}}}`;

const H = (d: string) => `\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{${d}}}`;

// ---------- small pieces ----------

const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; fade?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, fade = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * fade }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h?: number; start: number; border?: string; fade?: number; children: React.ReactNode }> = ({ x, y, w, h, start, border, fade = 1, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 28, padding: '22px 32px', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', border: border ? `5px solid ${border}` : undefined, ...s, opacity: (s.opacity as number) * fade }}>
      {children}
    </div>
  );
};

const Tile: React.FC<{ x: number; y: number; w?: number; h?: number; start: number; size?: number; color?: string; bg?: string; children: React.ReactNode }> = ({ x, y, w = 150, h = 120, start, size = 72, color = C.ink, bg = C.card, children }) => {
  const f = useCurrentFrame();
  const s = pop(f, start);
  return s <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 24, background: bg, boxShadow: '0 6px 20px rgba(30,40,80,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, color, transform: `scale(${s})`, whiteSpace: 'nowrap' }}>
      {children}
    </div>
  );
};

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; color?: string; width?: number }> = ({ x1, y1, x2, y2, p, color = C.muted, width = 7 }) => {
  if (p <= 0) return null;
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const bx = x2 - ux * 22;
  const by = y2 - uy * 22;
  return (
    <g opacity={Math.min(1, p * 3)}>
      <line x1={x1} y1={y1} x2={x1 + (bx - x1) * p} y2={y1 + (by - y1) * p} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {p > 0.9 && <path d={`M ${x2} ${y2} L ${bx - uy * 14} ${by + ux * 14} L ${bx + uy * 14} ${by - ux * 14} Z`} fill={color} />}
    </g>
  );
};

/** Loop wheel: nodes on a circle, arrow i goes from node i to node i+1 (wraps), starting at arrowAt[i]. */
const Wheel: React.FC<{ cx: number; cy: number; R: number; r: number; labels: string[]; nodeAt: number[]; arrowAt: number[]; font?: number; ring?: number; ringColor?: string; nodeBg?: (i: number) => string }> = ({
  cx, cy, R, r, labels, nodeAt, arrowAt, font = 64, ring = -1, ringColor = C.red, nodeBg,
}) => {
  const f = useCurrentFrame();
  const n = labels.length;
  const step = (2 * Math.PI) / n;
  const m = 2 * Math.asin(r / (2 * R)) + 0.12;
  const P = (a: number): [number, number] => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  return (
    <>
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {range(n).map((i) => {
          const p = ease(f, arrowAt[i], 14);
          if (p <= 0) return null;
          const a0 = -Math.PI / 2 + i * step + m;
          const a1 = -Math.PI / 2 + (i + 1) * step - m;
          const [sx, sy] = P(a0);
          const [ex, ey] = P(a1);
          const tx = -Math.sin(a1);
          const ty = Math.cos(a1);
          const nx = Math.cos(a1);
          const ny = Math.sin(a1);
          return (
            <g key={i} opacity={Math.min(1, p * 2)}>
              <path d={`M ${sx} ${sy} A ${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${ex} ${ey}`} stroke={C.violet} strokeWidth={9} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
              {p > 0.9 && <path d={`M ${ex + tx * 14} ${ey + ty * 14} L ${ex - tx * 18 + nx * 18} ${ey - ty * 18 + ny * 18} L ${ex - tx * 18 - nx * 18} ${ey - ty * 18 - ny * 18} Z`} fill={C.violet} />}
            </g>
          );
        })}
      </svg>
      {labels.map((lab, i) => {
        const a = -Math.PI / 2 + i * step;
        const [x, y] = P(a);
        const s = pop(f, nodeAt[i]);
        if (s <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: nodeBg ? nodeBg(i) : C.card, border: `${ring === i ? 8 : 5}px solid ${ring === i ? ringColor : C.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: font, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 6px 20px rgba(30,40,80,0.10)' }}>
            {lab}
          </div>
        );
      })}
    </>
  );
};

/** Question card text shared by several scenes. */
const Prompt: React.FC<{ tex: string; w?: number; marks?: number[]; markWord?: number }> = ({ tex }) => <Tex tex={tex} size={60} />;

export const CHOICES = ['4', '10', '20', '40', '100'];

const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; hi?: number; hiAt?: number; size?: number }> = ({ x, y, start, hi = -1, hiAt = 0, size = 48 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CHOICES.map((c, i) => {
        const h = i === hi ? ease(f, hiAt, 10) : 0;
        return (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: h > 0.5 ? C.green : C.card, color: h > 0.5 ? '#fff' : C.ink, borderRadius: 18, padding: '12px 28px', fontSize: size, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', transform: `scale(${1 + h * 0.12})` }}>
            <span style={{ color: h > 0.5 ? '#fff' : C.muted, fontSize: 36, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        );
      })}
    </div>
  );
};

const QCard: React.FC<{ x: number; y: number; w: number; start: number; mark?: number; size?: number; variant?: boolean }> = ({ x, y, w, start, mark, size = 50, variant }) => (
  <Card x={x} y={y} w={w} start={start}>
    <div style={{ fontSize: size, fontWeight: 600, lineHeight: 1.5 }}>
      What is the <Mark on={mark ?? 99999}>smallest</Mark> positive {variant ? '' : 'integer '}n for which <Tex tex={variant ? '9^{n}' : '3^{n}'} size={size + 8} /> ends in the digits <Tex tex="01" size={size + 4} />?
    </div>
  </Card>
);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vals = ['3', '9', '27', '81'];
  const exps = ['3^{1}', '3^{2}', '3^{3}', '3^{4}'];
  const tw = [150, 150, 190, 230];
  const sz = [72, 84, 96, 112];
  let x = 960 - (tw.reduce((a, b) => a + b, 0) + 3 * 70) / 2;
  const xs = tw.map((w) => { const r = x; x += w + 70; return r; });
  const tgt = pop(f, at(scene, 1, 0.2));
  return (
    <>
      {vals.map((v, i) => {
        const st = at(scene, 0, 0.05 + i * 0.2);
        return (
          <div key={v}>
            <Tile x={xs[i]} y={190} w={tw[i]} h={130 + i * 14} start={st} size={sz[i]} color={C.primary}>{v}</Tile>
            <Eq x={xs[i] + tw[i] / 2 - 40} y={350 + i * 14} tex={exps[i]} start={st + 6} size={52} color={C.muted} />
          </div>
        );
      })}
      {tgt > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', transform: `scale(${tgt})` }}>
          <Tex tex={'\\ldots\\ \\textcolor{#7b61ff}{01}\\ \\textcolor{#8a91a0}{?}'} size={140} />
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 96, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  return (
    <>
      <QCard x={100} y={190} w={1720} start={at(scene, 1, 0)} mark={at(scene, 1, 0.25)} size={64} />
      <ChoiceRow x={140} y={640} start={(i) => at(scene, 2, 0.3 + i * 0.12)} size={56} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const vals = ['3', '9', '27', '81', '\\ldots'];
  const ws = [130, 130, 170, 190, 190];
  const gap = 130;
  let x = 130;
  const xs = ws.map((w) => { const r = x; x += w + gap; return r; });
  const st = (i: number) => at(scene, 1, 0.02 + i * 0.1);
  const boxP = ease(f, at(scene, 1, 0.55), 14);
  return (
    <>
      <QCard x={100} y={160} w={1720} start={0} mark={at(scene, 2, 0.5)} size={50} />
      {vals.map((v, i) => (
        <Tile key={v} x={xs[i]} y={430} w={ws[i]} h={110} start={st(i)} size={64} color={C.primary}>
          {v === '\\ldots' ? '…' : v}
        </Tile>
      ))}
      <Stage>
        {range(4).map((i) => (
          <Arrow key={i} x1={xs[i] + ws[i] + 14} y1={485} x2={xs[i + 1] - 14} y2={485} p={ease(f, st(i) + 6, 12)} color={C.violet} />
        ))}
      </Stage>
      {range(4).map((i) => (
        <Eq key={i} x={xs[i] + ws[i] + 10} y={375} tex={'\\times 3'} start={st(i) + 6} size={52} color={C.violet} />
      ))}
      <div style={{ position: 'absolute', left: 560, top: 640, display: 'flex', gap: 20, alignItems: 'center', opacity: boxP }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.muted, marginRight: 14 }}>want the last two digits:</div>
        {['0', '1'].map((d) => (
          <div key={d} style={{ width: 96, height: 110, borderRadius: 20, border: `6px dashed ${C.violet}`, color: C.violet, fontSize: 72, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</div>
        ))}
      </div>
    </>
  );
};

const makePause = (secs: number, variant: boolean): SceneComponent => ({ scene }) => (
  <>
    <QCard x={100} y={200} w={1100} start={0} size={48} variant={variant} />
    {!variant && <ChoiceRow x={100} y={640} start={(i) => 6 + i * 4} size={44} />}
    <Countdown scene={scene} seconds={secs} x={1530} y={560} tick={TICK} />
  </>
);

const Sol1Digit: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const WX = 480;
  const WY = 520;
  const vals = ['3', '9', '27', '81'];
  const rowFade = fadeTo(f, at(scene, 1, 0), 0, 10);
  const cell = (i: number) => at(scene, 0, 0.3 + i * 0.15);
  const L5 = at(scene, 5, 0);
  const workFade = 1 - ease(f, L5, 10);
  return (
    <>
      {/* L0: powers with their last digit highlighted */}
      <div style={{ position: 'absolute', left: 120, top: 380, display: 'flex', gap: 40, opacity: rowFade }}>
        {vals.map((v, i) => (
          <div key={v} style={{ ...fadeUp(f, cell(i)), background: C.card, borderRadius: 22, padding: '14px 34px', boxShadow: '0 6px 20px rgba(30,40,80,0.10)' }}>
            <Tex tex={`${v.length > 1 ? `\\textcolor{${GREY}}{${v.slice(0, -1)}}` : ''}\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{${v.slice(-1)}}}`} size={80} />
          </div>
        ))}
      </div>
      <Wheel cx={WX} cy={WY} R={215} r={64} labels={['3', '9', '7', '1']} nodeAt={[at(scene, 2, 0.02), at(scene, 2, 0.12), at(scene, 2, 0.75), at(scene, 3, 0.18)]} arrowAt={[at(scene, 2, 0.25), at(scene, 2, 0.85), at(scene, 3, 0.4), at(scene, 3, 0.7)]} />
      {ease(f, at(scene, 4, 0.5), 12) > 0 && (
        <div style={{ position: 'absolute', left: WX - 150, top: WY - 50, width: 300, textAlign: 'center', fontSize: 46, fontWeight: 900, color: C.violet, opacity: ease(f, at(scene, 4, 0.5), 12) }}>loop of 4</div>
      )}
      {/* right panel */}
      <Card x={960} y={170} w={900} start={at(scene, 1, 0.1)} fade={workFade}>
        <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.35 }}>
          A product's <Mark on={at(scene, 1, 0.5)}>last digit</Mark> depends only on the last digits you multiply.
        </div>
      </Card>
      <Eq x={1000} y={400} tex={`2${H('7')} \\times ${H('3')} = 8${H('1')}`} start={at(scene, 1, 0.7)} fade={workFade} />
      <Eq x={1000} y={510} tex={`9 \\times 3 = 2\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{7}}`} start={at(scene, 2, 0.5)} fade={workFade} />
      <Eq x={1000} y={620} tex={`7 \\times 3 = 2\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{1}}`} start={at(scene, 3, 0.1)} fade={workFade} />
      <Eq x={1000} y={730} tex={`1 \\times 3 = \\textcolor{${HLFG}}{\\colorbox{${HLBG}}{3}}`} start={at(scene, 3, 0.55)} fade={workFade} />
      {/* L5: exponents grid */}
      <div style={{ position: 'absolute', left: 960, top: 170, width: 900, opacity: ease(f, L5, 10) }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.muted, marginBottom: 14 }}>The exponent n:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, width: 900 }}>
          {range(28).map((k) => {
            const n = k + 1;
            const on = n % 4 === 0 ? ease(f, at(scene, 5, 0.45 + (n / 4) * 0.07), 8) : 0;
            return (
              <div key={n} style={{ width: 118, height: 82, borderRadius: 16, background: on > 0.5 ? C.primary : C.card, color: on > 0.5 ? '#fff' : C.ink, fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(30,40,80,0.08)', transform: `scale(${1 + on * 0.1})` }}>
                {n}
              </div>
            );
          })}
        </div>
      </div>
      <Pill x={960} y={690} color={C.primary} style={{ ...fadeUp(f, at(scene, 5, 0.75)), fontSize: 38 }}>ends in 1 only for multiples of 4</Pill>
    </>
  );
};

const ROWS = [
  { n: '3^{4}', prod: '', res: '81', lead: '', last: '81' },
  { n: '3^{8}', prod: '81 \\times 81 =', res: '6561', lead: '65', last: '61' },
  { n: '3^{12}', prod: '61 \\times 81 =', res: '4941', lead: '49', last: '41' },
  { n: '3^{16}', prod: '41 \\times 81 =', res: '3321', lead: '33', last: '21' },
  { n: '3^{20}', prod: '21 \\times 81 =', res: '1701', lead: '17', last: '01' },
];

const Sol1Test: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const P = 135;
  const RY = (i: number) => 190 + i * P;
  // row start frames; row 4 splits the product and the reveal
  const rs = [at(scene, 2, 0.35), at(scene, 4, 0.3), at(scene, 5, 0.3), at(scene, 6, 0.3), at(scene, 8, 0.05)];
  const reveal = at(scene, 8, 0.64);
  const ruleFade = 1 - ease(f, at(scene, 2, 0), 10);
  const tens = ease(f, at(scene, 7, 0.4), 14);
  return (
    <>
      {/* L1: only the last two digits matter */}
      <Card x={100} y={170} w={1500} start={at(scene, 1, 0.1)} fade={ruleFade}>
        <div style={{ fontSize: 44, fontWeight: 700 }}>Only the last two digits matter. The rest are hundreds.</div>
      </Card>
      <Eq x={160} y={340} tex={`181 \\times 3 = 5\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{43}}`} start={at(scene, 1, 0.45)} size={56} fade={ruleFade} />
      <Eq x={160} y={460} tex={`81 \\times 3 = 2\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{43}}`} start={at(scene, 1, 0.65)} size={56} fade={ruleFade} />
      <Pill x={900} y={400} color={C.violet} style={{ fontSize: 38, opacity: ruleFade * ease(f, at(scene, 1, 0.8), 14) }}>both end in 43</Pill>
      {/* table */}
      {ROWS.map((r, i) => {
        const isLast = i === 4;
        const showRes = isLast ? ease(f, reveal, 8) : ease(f, rs[i] + 4, 10);
        const resTex = i === 0 ? dg('', '81') : dg(r.lead, r.last, isLast ? '#bff0cf' : HLBG, isLast ? '#168a3f' : HLFG);
        return (
          <div key={i}>
            <Eq x={100} y={RY(i)} tex={r.n} start={rs[i]} size={60} />
            <div style={{ position: 'absolute', left: 330, top: RY(i), width: 400, textAlign: 'right', whiteSpace: 'nowrap', ...fadeUp(f, rs[i]) }}>
              <Tex tex={r.prod ? r.prod : '='} size={56} />
            </div>
            <div style={{ position: 'absolute', left: 750, top: RY(i), opacity: i === 0 ? ease(f, rs[0], 12) : showRes, whiteSpace: 'nowrap', transform: isLast ? `scale(${0.8 + 0.2 * pop(f, reveal)})` : undefined }}>
              <Tex tex={resTex} size={56} />
            </div>
            {/* last-two chip */}
            <div style={{ position: 'absolute', left: 1150, top: RY(i) - 6, display: 'flex', alignItems: 'center', gap: 18, opacity: showRes }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: C.muted, width: 110, lineHeight: 1.1 }}>last two</div>
              {r.last.split('').map((d, j) => (
                <div key={j} style={{ width: 72, height: 86, borderRadius: 16, background: isLast ? C.green : C.card, border: `4px solid ${isLast ? C.green : C.primary}`, color: isLast ? '#fff' : j === 0 && i > 0 ? (tens > 0.5 ? C.violet : C.ink) : C.ink, fontSize: 60, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: j === 0 && i > 0 && !isLast ? `0 0 0 ${tens * 8}px ${C.violetSoft}` : undefined }}>
                  {d}
                </div>
              ))}
            </div>
            {i > 0 && i < 4 && (
              <Eq x={1720} y={RY(i) - P / 2 + 2} tex={'-2'} start={at(scene, 7, 0.45 + i * 0.1)} size={56} color={C.violet} />
            )}
          </div>
        );
      })}
      {range(4).map((i) => (
        <Eq key={i} x={1500} y={RY(i + 1) - P / 2 + 2} tex={'\\times 81'} start={i === 0 ? at(scene, 3, 0.55) : rs[i + 1]} size={52} color={C.violet} />
      ))}
      <Text x={1500} y={RY(1) - P / 2 + 74} w={380} size={34} weight={800} color={C.violet} style={fadeUp(f, at(scene, 3, 0.6))}>jump 4 powers each</Text>
      <Text x={880} y={RY(0) + 8} w={260} size={48} weight={800} color={C.red} style={fadeUp(f, at(scene, 2, 0.7))}>not 01 yet</Text>
      <Text x={1700} y={RY(0) + 10} w={190} size={34} weight={800} color={C.violet} style={fadeUp(f, at(scene, 7, 0.3))}>tens digit:</Text>
    </>
  );
};

const Sol1Answer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end = at(scene, 0, 1) - 28;
  return (
    <>
      <QCard x={100} y={170} w={1720} start={0} size={50} />
      <ChoiceRow x={140} y={470} start={(i) => 4 + i * 3} hi={2} hiAt={end} size={52} />
      <Eq x={640} y={660} tex={'n = 20'} start={end} size={110} color={C.green} />
      <Answer x={1500} y={700} value="20" start={end} chime={CHIME} />
    </>
  );
};

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const B = at(scene, 4, 0);
  const phaseA = 1 - ease(f, B, 12);
  const pillTop = interpolate(f, [B, B + 18], [540, 170], clamp);
  const TX = (i: number) => 150 + i * 290;
  const vals = [['1', '', '01'], ['81', '', '81'], ['161', '1', '61'], ['241', '2', '41'], ['321', '3', '21'], ['401', '4', '01']];
  const tileAt = [at(scene, 4, 0.05), at(scene, 4, 0.5), at(scene, 4, 0.82), at(scene, 5, 0.25), at(scene, 5, 0.55), at(scene, 6, 0.8)];
  const sumAt = [0, 0.12, 0.45, 0.6, 0.75].map((t, i) => (i === 4 ? at(scene, 6, 0.82) : at(scene, 6, t)));
  const sums = ['80', '160', '240', '320', '400'];
  return (
    <>
      <Eq x={100} y={190} tex={'81 = 80 + 1'} start={at(scene, 0, 0.45)} fade={phaseA} />
      <Eq x={100} y={290} tex={'N \\times 81 = N \\times 80 + N'} start={at(scene, 1, 0.5)} fade={phaseA} />
      <Eq x={100} y={400} tex={`21 \\times 80 = 16\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{80}}`} start={at(scene, 2, 0.35)} fade={phaseA} />
      <Eq x={900} y={400} tex={`61 \\times 80 = 48\\textcolor{${HLFG}}{\\colorbox{${HLBG}}{80}}`} start={at(scene, 2, 0.6)} fade={phaseA} />
      <Text x={100} y={480} w={1000} size={38} weight={800} color={C.muted} style={{ ...fadeUp(f, at(scene, 2, 0.8)), opacity: phaseA * ease(f, at(scene, 2, 0.8), 14) }}>ends in 1, then times 80 ends in 80</Text>
      <div style={{ position: 'absolute', left: 100, top: pillTop, ...fadeUp(f, at(scene, 3, 0.3)), display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ background: C.green, color: '#fff', borderRadius: 999, padding: '10px 34px', fontSize: 46, fontWeight: 900, whiteSpace: 'nowrap' }}>×81 → add 80 to the last two digits</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.muted }}>(ends in 1)</div>
      </div>
      {/* jump track: last two digits only */}
      {vals.map((v, i) => (
        <Tile key={i} x={TX(i)} y={295} w={170} h={120} start={tileAt[i]} size={52} bg={i === 0 ? C.violetSoft : C.card}>
          <div style={{ textAlign: 'center' }}>
            {i === 0 && <div style={{ fontSize: 30, color: C.violet, fontWeight: 800 }}>start</div>}
            <Tex tex={i === 0 ? '3^{0}=1' : dg('\\ldots', v[2])} size={i === 0 ? 50 : 56} color={i === 5 ? C.green : C.ink} />
          </div>
        </Tile>
      ))}
      <Text x={TX(0)} y={425} w={1200} size={34} weight={800} color={C.muted} style={fadeUp(f, tileAt[1])}>only the last two digits are shown</Text>
      <Stage>
        {range(5).map((i) => (
          <Arrow key={i} x1={TX(i) + 182} y1={355} x2={TX(i + 1) - 12} y2={355} p={ease(f, tileAt[i + 1] - 6, 10)} color={C.violet} />
        ))}
      </Stage>
      {range(5).map((i) => (
        <div key={i} style={{ position: 'absolute', left: TX(i) + 170, top: 252, width: 130, textAlign: 'center', opacity: ease(f, tileAt[i + 1] - 6, 10) }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.violet }}>+80</div>
          <div style={{ position: 'absolute', top: 124, width: 130, fontSize: 30, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap' }}>4 powers</div>
        </div>
      ))}
      {/* running total of eighties */}
      {sums.map((s, i) => (
        <div key={s} style={{ position: 'absolute', left: TX(i) + 170, top: 540, width: 130, textAlign: 'center', ...fadeUp(f, sumAt[i]) }}>
          <Tex tex={i === 4 ? `\\boxed{${s}}` : s} size={54} color={i === 4 ? C.green : C.ink} />
        </div>
      ))}
      <Text x={100} y={488} w={600} size={34} weight={800} color={C.muted} style={fadeUp(f, at(scene, 5, 0.3))}>eighties so far:</Text>
      <Pill x={100} y={650} color={C.amber} style={{ ...fadeUp(f, at(scene, 5, 0.5)), fontSize: 38, opacity: ease(f, at(scene, 5, 0.5), 14) * (1 - ease(f, at(scene, 7, 0), 10)) }}>need a total that ends in 00</Pill>
      <Eq x={100} y={670} tex={'400 = 5 \\times 80'} start={at(scene, 7, 0.1)} size={56} />
      <Eq x={720} y={670} tex={'5 \\times 4 = 20'} start={at(scene, 7, 0.4)} size={56} />
      <Eq x={1260} y={670} tex={'3^{20}'} start={at(scene, 7, 0.75)} size={64} color={C.green} />
      <Pill x={100} y={770} color={C.primary} style={{ ...fadeUp(f, at(scene, 8, 0.4)), fontSize: 38 }}>power ends in 1 → multiply becomes add</Pill>
    </>
  );
};

const TrapCard: React.FC<{ x: number; y: number; w: number; h: number; start: number; letter: string; val: string; color: string; children?: React.ReactNode }> = ({ x, y, w, h, start, letter, val, color, children }) => (
  <Card x={x} y={y} w={w} h={h} start={start} border={color}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ background: color, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 44, fontWeight: 900 }}>{letter}  {val}</div>
    </div>
    {children}
  </Card>
);

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t41 = `3^{4} = 8\\textcolor{${C.red}}{\\colorbox{#fde0e0}{1}}`;
  return (
    <>
      {/* A */}
      <TrapCard x={60} y={160} w={540} h={290} start={at(scene, 1, 0.1)} letter="A" val="4" color={C.red}>
        <Eq x={32} y={100} tex={'3^{4} = 81'} start={at(scene, 1, 0.35)} size={56} />
        <div style={{ marginTop: 118, fontSize: 38, fontWeight: 800, color: C.red, ...fadeUp(f, at(scene, 1, 0.65)) }}>ends in 1, not 01</div>
      </TrapCard>
      {/* B */}
      <TrapCard x={640} y={160} w={1220} h={290} start={at(scene, 2, 0.1)} letter="B" val="10" color={C.red}>
        <div />
      </TrapCard>
      <Wheel cx={830} cy={350} R={66} r={34} labels={['3', '9', '7', '1']} font={44} nodeAt={[0, 1, 2, 3].map((i) => at(scene, 2, 0.2 + i * 0.08))} arrowAt={[0, 1, 2, 3].map((i) => at(scene, 2, 0.4 + i * 0.08))} ring={ease(f, at(scene, 2, 0.75), 10) > 0.5 ? 1 : -1} />
      <Text x={1010} y={250} w={820} size={42} weight={800} color={C.red} style={fadeUp(f, at(scene, 2, 0.6))}>10 is not a multiple of 4</Text>
      <Text x={1010} y={310} w={820} size={38} weight={700} color={C.muted} style={fadeUp(f, at(scene, 2, 0.8))}>it lands on 9, not 1</Text>
      <Eq x={1010} y={365} tex={`3^{10} = 590\\textcolor{${C.red}}{49}`} start={at(scene, 3, 0.35)} size={56} />
      {/* D, E */}
      <TrapCard x={60} y={465} w={880} h={250} start={at(scene, 4, 0.1)} letter="D" val="40" color={C.amber}>
        <div />
      </TrapCard>
      <TrapCard x={970} y={465} w={890} h={250} start={at(scene, 4, 0.25)} letter="E" val="100" color={C.amber}>
        <div />
      </TrapCard>
      <Text x={330} y={480} w={600} size={36} weight={800} color={C.amber} style={fadeUp(f, at(scene, 4, 0.5))}>they DO end in 01</Text>
      <Eq x={90} y={565} tex={'3^{40} = 3^{20} \\times 3^{20}'} start={at(scene, 5, 0.1)} size={50} />
      <Eq x={90} y={640} tex={'\\ldots01 \\times \\ldots01 = \\ldots01'} start={at(scene, 5, 0.65)} size={50} color={C.amber} />
      <Eq x={1000} y={565} tex={'3^{100} = \\left(3^{20}\\right)^{5}'} start={at(scene, 6, 0.1)} size={50} />
      <Eq x={1000} y={640} tex={'(\\ldots01)^{5} = \\ldots01'} start={at(scene, 6, 0.65)} size={50} color={C.amber} />
      {/* list */}
      <Eq x={80} y={735} tex={'20,\\ 40,\\ 60,\\ 80,\\ 100'} start={at(scene, 7, 0.1)} size={56} />
      {(() => {
        const p = ease(f, at(scene, 7, 0.5), 12);
        return p > 0 ? (
          <>
            <div style={{ position: 'absolute', left: 62, top: 729, width: 100, height: 80, borderRadius: 40, border: `6px solid ${C.green}`, opacity: p }} />
            <Text x={670} y={750} w={200} size={36} weight={800} color={C.green} style={{ opacity: p }}>smallest</Text>
          </>
        ) : null;
      })()}
      <Pill x={900} y={742} color={C.primary} style={{ ...fadeUp(f, at(scene, 8, 0.4)), fontSize: 36 }}>Test in order. Stop at the first win.</Pill>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={960} y={160} w={1500} size={64} weight={900} align="center" style={fadeUp(f, at(scene, 0, 0.1))}>Powers of nine!</Text>
      <QCard x={160} y={300} w={1600} start={at(scene, 1, 0)} mark={at(scene, 1, 0.3)} size={56} variant />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end = at(scene, 4, 1) - 28;
  const TX = (i: number) => 110 + i * 300;
  const track = [
    ['start', '1', '01'],
    ['9^{2}', '81', '81'],
    ['9^{4}', '61', '61'],
    ['9^{6}', '41', '41'],
    ['9^{8}', '21', '21'],
    ['9^{10}', '01', '01'],
  ];
  const ta = [at(scene, 3, 0.0), at(scene, 3, 0.04), at(scene, 3, 0.17), at(scene, 3, 0.33), at(scene, 3, 0.5), at(scene, 3, 0.675)];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - ease(f, at(scene, 4, 0), 10) }}>
      <Wheel cx={330} cy={360} R={130} r={58} labels={['9', '1']} nodeAt={[at(scene, 0, 0.2), at(scene, 0, 0.75)]} arrowAt={[at(scene, 0, 0.85), at(scene, 1, 0.45)]} />
      {ease(f, at(scene, 1, 0.5), 12) > 0 && (
        <div style={{ position: 'absolute', left: 330 - 90, top: 340, width: 180, textAlign: 'center', fontSize: 38, fontWeight: 900, color: C.violet, opacity: ease(f, at(scene, 1, 0.5), 12) }}>loop of 2</div>
      )}
      </div>
      <Eq x={700} y={180} tex={'9 \\times 9 = 81'} start={at(scene, 0, 0.6)} fade={1 - ease(f, at(scene, 4, 0), 10)} />
      <Pill x={700} y={290} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.6)), fontSize: 38, opacity: ease(f, at(scene, 1, 0.6), 14) * (1 - ease(f, at(scene, 4, 0), 10)) }}>loop of 2 → n is even</Pill>
      <Eq x={700} y={390} tex={'9^{2} = 81'} start={at(scene, 2, 0.1)} fade={1 - ease(f, at(scene, 4, 0), 10)} />
      <Text x={700} y={470} w={900} size={38} weight={800} color={C.violet} style={{ ...fadeUp(f, at(scene, 2, 0.5)), opacity: ease(f, at(scene, 2, 0.5), 14) * (1 - ease(f, at(scene, 4, 0), 10)) }}>+80 per jump of 2 powers</Text>
      {/* track */}
      {track.map((t, i) => (
        <div key={i}>
          <Tile x={TX(i)} y={620} w={170} h={150} start={ta[i]} size={52} bg={i === 0 ? C.violetSoft : C.card}>
            <div style={{ textAlign: 'center' }}>
              {i === 0 ? <div style={{ fontSize: 34, color: C.violet, fontWeight: 800 }}>start</div> : <Tex tex={t[0]} size={48} color={C.muted} />}
              <div><Tex tex={i === 0 ? '1' : t[1]} size={58} color={i === 5 ? C.green : C.ink} /></div>
            </div>
          </Tile>
        </div>
      ))}
      <Stage>
        {range(5).map((i) => (
          <Arrow key={i} x1={TX(i) + 182} y1={695} x2={TX(i + 1) - 12} y2={695} p={ease(f, ta[i + 1] - 6, 10)} color={C.violet} />
        ))}
      </Stage>
      {range(5).map((i) => (
        <div key={i} style={{ position: 'absolute', left: TX(i) + 170, top: 625, width: 130, textAlign: 'center', fontSize: 52, fontWeight: 900, color: C.violet, opacity: ease(f, ta[i + 1] - 6, 10) }}>+80</div>
      ))}
      <Eq x={110} y={190} tex={'5 \\times 2 = 10'} start={at(scene, 4, 0.54)} size={64} />
      <Eq x={110} y={300} tex={'9^{10} = (3 \\times 3)^{10} = 3^{20}'} start={at(scene, 5, 0.3)} size={56} />
      <Pill x={110} y={400} color={C.green} style={{ ...fadeUp(f, at(scene, 5, 0.7)), fontSize: 38 }}>✓ matches!</Pill>
      <Answer x={1560} y={330} value="10" start={end} chime={CHIME} />
      <Confetti x={1000} y={380} start={at(scene, 6, 0.1)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const seq = ['81', '61', '41', '21', '01'];
  return (
    <>
      <Text x={960} y={170} w={1500} size={64} weight={900} align="center" style={fadeUp(f, at(scene, 0, 0.2))}>The big idea</Text>
      <Wheel cx={420} cy={520} R={150} r={60} labels={['3', '9', '7', '1']} nodeAt={[0, 1, 2, 3].map((i) => at(scene, 1, 0.1 + i * 0.1))} arrowAt={[0, 1, 2, 3].map((i) => at(scene, 1, 0.3 + i * 0.1))} />
      <Text x={720} y={420} w={1000} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 1, 0.5))}>1. Loop of the last digit</Text>
      <Eq x={720} y={500} tex={'n = 4, 8, 12, \\ldots'} start={at(scene, 1, 0.7)} size={64} />
      <Text x={720} y={620} w={1000} size={44} weight={800} color={C.violet} style={fadeUp(f, at(scene, 2, 0.1))}>2. Test in order, last two digits</Text>
      <div style={{ position: 'absolute', left: 720, top: 700, display: 'flex', gap: 16, alignItems: 'center' }}>
        {seq.map((s, i) => (
          <div key={s} style={{ ...fadeUp(f, at(scene, 2, 0.3 + i * 0.12)), display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: i === 4 ? C.green : C.card, color: i === 4 ? '#fff' : C.ink, borderRadius: 16, padding: '4px 20px', fontSize: 56, fontWeight: 900, boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>{s}</div>
            {i < 4 && <span style={{ fontSize: 44, color: C.muted }}>→</span>}
          </div>
        ))}
      </div>
      <SignOff start={at(scene, 3, 0.1)} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, false),
  'sol1-digit': Sol1Digit,
  'sol1-test': Sol1Test,
  'sol1-answer': Sol1Answer,
  sol2: Sol2,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, true),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

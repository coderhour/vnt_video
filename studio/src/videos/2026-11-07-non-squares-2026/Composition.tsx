import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Tex } from '../../lib/Tex';
import { Confetti, Mark, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { ThumbFrame } from '../../lib/Thumb';

export const SLUG = '2026-11-07-non-squares-2026';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const SPOT = C.violet; // spot labels (position in the list)
const NUM = C.ink; // number labels (the value)
const SQC = C.red; // perfect squares
const OKC = C.primary; // surviving non-squares, gap brackets
const NEVER = 1e7;
const sp = (t: string) => `{\\color{#7b61ff}${t}}`; // spot-coloured maths

// ---------- helpers ----------

const Parts: React.FC<{ x: number; y: number; parts: [number, string, string?][]; size?: number; opacity?: number; center?: boolean; gap?: number }> = ({
  x, y, parts, size = 52, opacity = 1, center = false, gap = 16,
}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, top: y, display: 'flex', justifyContent: center ? 'center' : 'flex-start', alignItems: 'center', gap, whiteSpace: 'nowrap', opacity }}>
      {parts.map(([start, tex, color], i) => (
        <div key={i} style={fadeUp(f, start)}>
          <Tex tex={tex} size={size} color={color ?? C.ink} />
        </div>
      ))}
    </div>
  );
};

const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: boolean }> = ({ start, tex, color, ...rest }) => (
  <Parts {...rest} parts={[[start, tex, color]]} />
);

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number; opacity?: number; center?: boolean }> = ({ x, y, start, color, children, size = 44, opacity = 1, center = false }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: center ? 0 : x, right: center ? 0 : undefined, textAlign: 'center', top: y, fontSize: size, fontWeight: 900, color, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      {children}
    </div>
  );
};

/** Centred maths label. */
const Lbl: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number }> = ({ x, y, tex, start, size = 52, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 12) * opacity;
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: p, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

/** A panel that is visible from frame a until frame b (fades). */
const Panel: React.FC<{ a?: number; b?: number; children: React.ReactNode }> = ({ a = 0, b = NEVER, children }) => {
  const f = useCurrentFrame();
  const o = ease(f, a, 10) * (1 - ease(f, b, 10));
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div>;
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {children}
  </svg>
);

/** Horizontal bracket under (dir 1) or over (dir -1) x1..x2 at y; grows from x1 to x2 over [start, start+dur]. */
const Bracket: React.FC<{ x1: number; x2: number; y: number; start: number; dur?: number; color?: string; dir?: 1 | -1 }> = ({ x1, x2, y, start, dur = 16, color = OKC, dir = 1 }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, dur);
  if (p <= 0) return null;
  const xe = x1 + (x2 - x1) * p;
  const h = 16 * dir;
  return (
    <Svg>
      <path d={`M ${x1} ${y - h} L ${x1} ${y} L ${xe} ${y} L ${xe} ${y - h}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

/** Curved arrow from (x1,y) to (x2,y), arching up by `lift`. */
const Hop: React.FC<{ x1: number; x2: number; y: number; lift?: number; start: number; color?: string }> = ({ x1, x2, y, lift = 80, start, color = OKC }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 16);
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2;
  return (
    <Svg>
      <g opacity={p} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${x1} ${y} Q ${mx} ${y - lift * 2} ${x2} ${y}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d={`M ${x2 - 22} ${y - 26} L ${x2} ${y} L ${x2 - 30} ${y - 6}`} opacity={p > 0.9 ? 1 : 0} />
      </g>
    </Svg>
  );
};

const Arrow: React.FC<{ x1: number; x2: number; y: number; start: number; color?: string }> = ({ x1, x2, y, start, color = C.muted }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 14);
  if (p <= 0) return null;
  const xe = x1 + (x2 - x1) * p;
  const d = x2 > x1 ? 1 : -1;
  return (
    <Svg>
      <g stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${x1} ${y} L ${xe} ${y}`} />
        {p > 0.85 && <path d={`M ${xe - 22 * d} ${y - 16} L ${xe} ${y} L ${xe - 22 * d} ${y + 16}`} />}
      </g>
    </Svg>
  );
};

/** Number tile (a value on the line) with red / struck / green states. */
export const Tile: React.FC<{
  x: number; y: number; w?: number; h?: number; label: React.ReactNode; appear?: number; red?: number; strike?: number; green?: number;
  hide?: number; drop?: number; dashed?: boolean; vis?: number; dy?: number; border?: string; fs?: number;
}> = ({ x, y, w = 84, h = 84, label, appear = 0, red = NEVER, strike = NEVER, green = NEVER, hide = NEVER, drop = NEVER, dashed = false, vis = 1, dy = 0, border, fs = 52 }) => {
  const f = useCurrentFrame();
  const d = ease(f, drop, 14);
  const p = ease(f, appear, 10) * (1 - ease(f, hide, 10)) * (1 - d) * vis;
  if (p <= 0.001) return null;
  const r = ease(f, red, 8);
  const g = ease(f, green, 10);
  const s = ease(f, strike, 12);
  const white = r > 0.5 || g > 0.5;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `translateY(${d * 70 + dy}px)`, opacity: p * (1 - 0.55 * s) }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: C.card, border: `5px ${dashed ? 'dashed' : 'solid'} ${border ?? C.line}`, boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: OKC, opacity: g }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: SQC, opacity: r }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 900, color: white ? '#fff' : C.ink, whiteSpace: 'nowrap' }}>{label}</div>
      {s > 0 && (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0 }} opacity={s}>
          <g stroke="#7f1d1d" strokeWidth={8} strokeLinecap="round">
            <line x1={14} y1={14} x2={w - 14} y2={h - 14} />
            <line x1={w - 14} y1={14} x2={14} y2={h - 14} />
          </g>
        </svg>
      )}
    </div>
  );
};

/** Spot tag: a purple numeral in a circle (the position in the list). */
export const SpotTag: React.FC<{ x: number; y: number; n: number; start: number; opacity?: number; d?: number }> = ({ x, y, n, start, opacity = 1, d = 70 }) => {
  const f = useCurrentFrame();
  const p = pop(f, start) * opacity;
  if (p <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', background: SPOT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: (d * 48) / 70, fontWeight: 900, transform: `scale(${Math.min(p, 1.05)})`, opacity: Math.min(1, p) }}>
      {n}
    </div>
  );
};

const Dot: React.FC<{ x: number; y: number; start: number; opacity?: number }> = ({ x, y, start, opacity = 1 }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: '50%', background: SPOT, opacity: 0.55 * ease(f, start, 10) * opacity }} />;
};

// ---------- the small line 1 … 17 ----------

const SQS = [1, 4, 9, 16];
const isSq = (v: number) => SQS.includes(v);
const spotOf = (v: number) => v - Math.floor(Math.sqrt(v));
const lx = (v: number) => 160 + (v - 1) * 100;
const VALS = Array.from({ length: 17 }, (_, i) => i + 1);

type LineProps = {
  y: number; appear?: (v: number) => number; red?: number; strike?: number; green?: number; drop?: number;
  tags?: [number, number, number]; dots?: number; legend?: number; numLegend?: number; opacity?: number;
  xOf?: (v: number) => number; vis?: (v: number) => number; dy?: (v: number) => number; mainOnly?: boolean;
};

const SmallLine: React.FC<LineProps> = ({ y, appear, red = NEVER, strike = NEVER, green = NEVER, drop = NEVER, tags, dots = NEVER, legend = NEVER, numLegend = NEVER, opacity = 1, xOf = lx, vis, dy }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      {VALS.map((v) => {
        const sq = isSq(v);
        const x = xOf(v);
        return (
          <Tile key={v} x={x} y={y} label={v} appear={appear ? appear(v) : 0} red={sq ? red : NEVER} strike={sq ? strike : NEVER} green={sq ? NEVER : green} drop={sq ? drop : NEVER} vis={vis ? vis(v) : 1} dy={dy ? dy(v) : 0} />
        );
      })}
      {tags && [2, 3, 5].map((v, i) => <SpotTag key={v} x={xOf(v)} y={y + 91} n={i + 1} start={tags[i]} opacity={vis ? vis(v) : 1} />)}
      {VALS.filter((v) => !isSq(v) && ![2, 3, 5].includes(v)).map((v) => (
        <Dot key={v} x={xOf(v)} y={y + 82} start={dots} opacity={(vis ? vis(v) : 1) * fadeTo(f, drop, 0, 10)} />
      ))}
      <Tag x={118} y={y + 138} start={legend} color={SPOT} size={40}>spot</Tag>
      <Tag x={118} y={y - 112} start={numLegend} color={NUM} size={40}>number</Tag>
    </div>
  );
};

// ---------- the big (not to scale) line ----------

const BX = { dots0: 150, n2024: 330, n2025: 520, n2026: 710, n2027: 900, dots1: 1040, q: 1180, dots2: 1320, n2115: 1470, sq46: 1680 };
const BY = 430;

// ---------- Choices ----------

export const CH = ['2069', '2070', '2071', '2072', '2116'];
const ChoiceRow: React.FC<{ x: number; y: number; from: number; to: number; start: (i: number) => number }> = ({ x, y, from, to, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CH.slice(from, to).map((c, j) => {
        const i = from + j;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '12px 26px', fontSize: 52, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 36, marginRight: 12 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        );
      })}
    </div>
  );
};

/** Green answer badge, e.g. "C · 2071", with the chime. */
const Badge: React.FC<{ x: number; y: number; text: string; start: number; size?: number }> = ({ x, y, text, start, size = 100 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, background: C.green, color: '#fff', borderRadius: 40, padding: '18px 56px', fontSize: size, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {text}
        </div>
      )}
    </>
  );
};

// ---------- Scene: intro ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 560;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center', fontSize: 74, fontWeight: 900, lineHeight: 1.2, ...fadeUp(f, 4) }}>
        the <span style={{ color: SPOT, fontSize: 150 }}>2026th</span>
        <br />
        number that is <span style={{ color: SQC }}>NOT</span> a perfect square
      </div>
      <SmallLine
        y={y}
        appear={(v) => at(scene, 1, 0.02 + (v - 1) * 0.026)}
        red={at(scene, 1, 0.62)}
        drop={at(scene, 1, 0.82)}
        green={at(scene, 1, 0.88)}
      />
      <Tag x={0} y={720} center start={at(scene, 2, 0.15)} color={C.ink} size={62}>
        knock out the squares, <span style={{ color: OKC }}>count what is left</span>
      </Tag>
    </>
  );
};

// ---------- Scene: question ----------

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const terms = ['2', '3', '5', '6', '7', '8', '10', '\\ldots'];
  return (
    <>
      <Pill x={100} y={140} color={C.violet} style={{ ...fadeUp(f, 0), fontSize: 38 }}>Question</Pill>
      <div style={{ position: 'absolute', left: 100, top: 230, width: 1720, background: C.card, borderRadius: 32, padding: '30px 52px', fontSize: 50, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 4) }}>
        <div>
          The positive integers that are <Mark on={at(scene, 1, 0.45)}>not perfect squares</Mark> are listed in increasing order:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0', whiteSpace: 'nowrap' }}>
          {terms.map((t, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <Mark on={at(scene, 2, 0.28 + i * 0.075)}>
                <Tex tex={t} size={56} />
              </Mark>
              <span style={{ fontSize: 56, marginRight: 8 }}>{i < terms.length - 1 ? ',' : '.'}</span>
            </span>
          ))}
        </div>
        <div>
          What is the <Mark on={at(scene, 3, 0.55)}><span style={{ color: SPOT }}>2026th</span></Mark> number in the list?
        </div>
      </div>
      <ChoiceRow x={150} y={650} from={0} to={5} start={(i) => at(scene, 4, 0.2 + i * 0.1)} />
    </>
  );
};

// ---------- Scene: asked ----------

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const y = 330;
  return (
    <>
      <SmallLine
        y={y}
        appear={(v) => at(scene, 0, 0.1 + (v - 1) * 0.04)}
        numLegend={at(scene, 0, 0.3)}
        red={at(scene, 0, 0.78)}
        strike={at(scene, 1, 0.32)}
        green={at(scene, 1, 0.45)}
        tags={[at(scene, 2, 0.3), at(scene, 2, 0.6), at(scene, 2, 0.9)]}
        dots={at(scene, 2, 0.95)}
        legend={at(scene, 1, 0.75)}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, ...fadeUp(f, at(scene, 3, 0.12)) }}>
        <div style={{ background: SPOT, color: '#fff', borderRadius: 999, padding: '10px 44px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap' }}>spot 2026</div>
        <svg width={110} height={40} viewBox="0 0 110 40">
          <path d="M 4 20 L 100 20 M 78 4 L 100 20 L 78 36" stroke={C.muted} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ background: C.card, border: `6px solid ${C.ink}`, color: C.ink, borderRadius: 999, padding: '4px 44px', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap' }}>number = ?</div>
      </div>
      <Tag x={0} y={730} center start={at(scene, 3, 0.7)} color={C.red} size={64}>
        <span style={{ color: SPOT }}>spot</span> ≠ <span style={{ color: NUM }}>number</span>
      </Tag>
    </>
  );
};

// ---------- Scene: pauses ----------

const makePause = (prompt: React.ReactNode, withChoices: boolean, seconds: number, extra?: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={130} y={190} w={1100} size={56} weight={800} style={fadeUp(f, 4)}>{prompt}</Text>
      {extra}
      {withChoices && (
        <>
          <ChoiceRow x={130} y={470} from={0} to={3} start={() => 8} />
          <ChoiceRow x={130} y={590} from={3} to={5} start={() => 8} />
        </>
      )}
      <Countdown scene={scene} seconds={seconds} x={1560} y={560} tick={TICK} />
    </>
  );
};

// ---------- Scene: gaps (Solution 1) ----------

const Gaps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lineY = 300;
  const L3 = at(scene, 3, 0);
  const L4 = at(scene, 4, 0);
  const L7 = at(scene, 9, 0);
  const gapsOut = L3; // small-line panel leaves
  const sumCols = [110, 530, 950, 1370]; // centres = col + 150 -> 260, 680, 1100, 1520
  const sums = ['2', '2+4=6', '6+6=12', '12+8=20'];
  const prods = ['1\\times2', '2\\times3', '3\\times4', '4\\times5'];
  const cols = [OKC, C.blue, C.amber, SPOT];
  const L8 = at(scene, 10, 0);
  const L9 = at(scene, 11, 0);
  const bxExt = 0.45 * ease(f, at(scene, 11, 0.3), 40);
  return (
    <>
      {/* L0-L2: small line with gap brackets */}
      <Panel b={gapsOut}>
        <SmallLine y={lineY} red={0} strike={0} green={0} />
        <Bracket x1={lx(2) - 40} x2={lx(3) + 40} y={385} start={at(scene, 1, 0.12)} />
        <Lbl x={(lx(2) + lx(3)) / 2} y={450} tex="2" start={at(scene, 1, 0.2)} size={60} color={OKC} />
        <Bracket x1={lx(5) - 40} x2={lx(8) + 40} y={385} start={at(scene, 1, 0.55)} />
        <Lbl x={(lx(5) + lx(8)) / 2} y={450} tex="4" start={at(scene, 1, 0.65)} size={60} color={OKC} />
        <Bracket x1={lx(10) - 40} x2={lx(15) + 40} y={385} start={at(scene, 2, 0.05)} />
        <Lbl x={(lx(10) + lx(15)) / 2} y={450} tex="6" start={at(scene, 2, 0.12)} size={60} color={OKC} />
        {[300, 520, 740, 960].map((x, i) => (
          <Lbl key={x} x={x} y={620} tex={String(2 * (i + 1))} start={at(scene, 2, 0.4 + i * 0.12)} size={64} color={OKC} />
        ))}
        {[300, 520, 740].map((x, i) => (
          <div key={x}>
            <Hop x1={x + 40} x2={x + 180} y={590} lift={34} start={at(scene, 2, 0.45 + i * 0.12)} color={C.muted} />
            <Lbl x={x + 110} y={520} tex="+2" start={at(scene, 2, 0.5 + i * 0.12)} size={52} color={C.muted} />
          </div>
        ))}
        <Lbl x={1120} y={620} tex="\ldots" start={at(scene, 2, 0.88)} size={64} />
      </Panel>

      {/* L3: generic picture */}
      <Panel a={L3} b={L4}>
        <Tile x={300} y={300} w={170} label={<Tex tex="k^2" size={56} color="#fff" />} red={0} appear={at(scene, 3, 0.05)} />
        <div style={{ position: 'absolute', left: 430, top: 262, width: 820, height: 76, borderRadius: 16, background: C.primarySoft, border: `5px solid ${OKC}`, opacity: ease(f, at(scene, 3, 0.2), 12) }} />
        <Tile x={1450} y={300} w={250} label={<Tex tex="(k+1)^2" size={56} color="#fff" />} red={0} appear={at(scene, 3, 0.6)} />
        <Bracket x1={430} x2={1250} y={370} start={at(scene, 3, 0.25)} />
        <Lbl x={840} y={440} tex="2k\text{ numbers}" start={at(scene, 3, 0.3)} size={60} color={OKC} />
        <Parts
          x={0} y={540} center size={64} gap={0}
          parts={[
            [at(scene, 3, 0.62), '(k+1)^2=k^2'],
            [at(scene, 3, 0.7), '{}+2k', OKC],
            [at(scene, 3, 0.85), '{}+1', SQC],
          ]}
        />
      </Panel>

      {/* L4-L6: running sums */}
      <Panel a={L4} b={L7}>
        {sums.map((s, i) => (
          <Lbl key={i} x={sumCols[i] + 150} y={230} tex={s} start={at(scene, 4, 0.08 + i * 0.22)} size={56} color={cols[i]} />
        ))}
        {prods.map((s, i) => (
          <Lbl key={i} x={sumCols[i] + 150} y={370} tex={s} start={at(scene, 5, 0.2 + i * 0.2)} size={56} color={cols[i]} />
        ))}
        <Eq x={0} y={470} center size={64} start={at(scene, 6, 0.55)} tex={`44\\times45=1980<${sp('2026')}`} />
        <Tag x={150} y={485} start={at(scene, 6, 0.3)} color={C.ink} size={44}>first 44 gaps</Tag>
        <Tag x={1470} y={485} start={at(scene, 6, 0.8)} color={OKC} size={48}>just under!</Tag>
        <Eq x={0} y={590} center size={56} start={at(scene, 7, 0.1)} tex="k\text{ gaps hold }k(k+1)\text{ numbers}" />
        <Eq x={0} y={690} center size={64} start={at(scene, 8, 0.25)} color={SQC} tex={`45\\times46=2070>${sp('2026')}`} />
        <Tag x={1470} y={705} start={at(scene, 8, 0.8)} color={SQC} size={48}>too many!</Tag>
      </Panel>

      {/* L7-L9: the big line */}
      <Panel a={L7}>
        {/* green block of survivors left of 2025 */}
        <div style={{ position: 'absolute', left: 60, top: BY - 70, width: 350, height: 140, borderRadius: 24, background: C.primarySoft, border: `5px solid ${OKC}`, opacity: ease(f, at(scene, 9, 0.1), 14) }} />
        <Tag x={64} y={BY - 150} start={at(scene, 9, 0.15)} color={SPOT} size={44}>spots 1 … 1980</Tag>
        <Tile x={BX.dots0} y={BY} w={110} label="…" appear={L7} />
        <Tile x={BX.n2024} y={BY} w={140} label="2024" appear={L7} green={0} />
        <Tile x={BX.n2025} y={BY} w={140} label="2025" appear={L7} red={at(scene, 9, 0.45)} />
        <Lbl x={BX.n2025} y={BY + 92} tex="45^2" start={at(scene, 9, 0.5)} size={56} color={SQC} />
        <Tile x={BX.n2026} y={BY} w={140} label="2026" appear={L7} green={L8 + 12} />
        <Tile x={BX.n2027} y={BY} w={140} label="2027" appear={L7} green={L8 + 12} />
        <Tile x={BX.dots1} y={BY} w={110} label="…" appear={L7} />
        <Tile x={BX.q} y={BY} w={140} label="?" appear={at(scene, 11, 0.1)} dashed border={C.muted} />
        <Tag x={BX.n2024 - 80} y={BY + 140} start={at(scene, 9, 0.75)} color={SPOT} size={46}>
          <span style={{ background: SPOT, color: '#fff', borderRadius: 999, padding: '2px 22px' }}>spot 1980</span>
        </Tag>
        <Tag x={BX.n2026 - 80} y={BY + 140} start={at(scene, 10, 0.5)} color={SPOT} size={46}>
          <span style={{ background: SPOT, color: '#fff', borderRadius: 999, padding: '2px 22px' }}>spot 1981</span>
        </Tag>
        <Panel a={0} b={L9}>
          <Hop x1={BX.n2024 + 20} x2={BX.n2026 - 20} y={BY - 60} lift={60} start={at(scene, 10, 0.05)} />
        </Panel>
        <Eq x={0} y={700} center size={64} start={at(scene, 9, 0.7)} tex={`2024\\to{\\color{#7b61ff}\\text{spot }1980}`} opacity={1 - ease(f, L9, 10)} />
        <Eq x={0} y={700} center size={64} start={at(scene, 11, 0.2)} tex={`${sp('2026')}-1980=46`} />
        <Bracket x1={BX.n2026 - 70} x2={BX.n2026 - 70 + (BX.q - 70 - BX.n2026 + 70) * bxExt} y={BY - 90} start={at(scene, 11, 0.3)} dir={-1} />
        <Tag x={BX.n2026 - 40} y={BY - 170} start={at(scene, 11, 0.35)} color={OKC} size={52}>46 numbers</Tag>
      </Panel>
    </>
  );
};

// ---------- Scene: reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L1 = at(scene, 1, 0);
  const L2 = at(scene, 2, 0);
  const start = BX.n2026 - 70;
  const mid = BX.q - 70;
  const ext = ease(f, at(scene, 0, 0.1), at(scene, 0, 0.85) - at(scene, 0, 0.1));
  const x2 = start + (mid - start) * (0.45 + 0.55 * ext);
  const done = at(scene, 1, 0.93);
  const R = at(scene, 1, 0.74);
  const wide = ease(f, L2, 18);
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: BY - 70, width: 350, height: 140, borderRadius: 24, background: C.primarySoft, border: `5px solid ${OKC}` }} />
      <Tag x={64} y={BY - 150} start={-100} color={SPOT} size={44}>spots 1 … 1980</Tag>
      <Tile x={BX.dots0} y={BY} w={110} label="…" />
      <Tile x={BX.n2024} y={BY} w={140} label="2024" green={0} />
      <Tile x={BX.n2025} y={BY} w={140} label="2025" red={0} />
      <Lbl x={BX.n2025} y={BY + 92} tex="45^2" start={-100} size={56} color={SQC} />
      <Tile x={BX.n2026} y={BY} w={140} label="2026" green={0} />
      <Tile x={BX.n2027} y={BY} w={140} label="2027" green={0} />
      <Tile x={BX.dots1} y={BY} w={80} label="…" />
      <Tile x={BX.q} y={BY} w={140} label="?" dashed border={C.muted} hide={R} />
      <Tile x={BX.q} y={BY} w={150} label="2071" green={R} appear={R} />
      <Tag x={BX.n2024 - 80} y={BY + 140} start={-100} color={SPOT} size={46}>
        <span style={{ background: SPOT, color: '#fff', borderRadius: 999, padding: '2px 22px' }}>spot 1980</span>
      </Tag>
      <Tag x={BX.n2026 - 80} y={BY + 140} start={-100} color={SPOT} size={46}>
        <span style={{ background: SPOT, color: '#fff', borderRadius: 999, padding: '2px 22px' }}>spot 1981</span>
      </Tag>
      <Tile x={BX.dots2} y={BY} w={80} label="…" appear={L2} />
      <Tile x={BX.n2115} y={BY} w={140} label="2115" appear={L2} />
      <Tile x={BX.sq46} y={BY} w={140} label={<Tex tex="46^2" size={52} color="#fff" />} appear={L2} red={L2} />

      <Panel b={L2}>
        <Bracket x1={start} x2={x2} y={BY - 90} start={-100} dir={-1} />
        <Tag x={BX.n2026 - 40} y={BY - 170} start={-100} color={OKC} size={52}>46 numbers</Tag>
      </Panel>
      <Panel a={L2}>
        <Bracket x1={start} x2={BX.n2115 + 70} y={BY - 90} start={L2} dur={20} dir={-1} />
        <Tag x={BX.n2026 + 120} y={BY - 170} start={L2 + 6} color={OKC} size={52}>
          90 numbers <span style={{ color: C.muted, fontSize: 46 }}>(2 × 45)</span>
        </Tag>
      </Panel>

      <Parts x={120} y={680} size={72} gap={14} parts={[[at(scene, 1, 0.2), '2025+46='], [R, '2071', C.green]]} />
      <Badge x={1400} y={720} text="C · 2071" start={done} />
      <Confetti x={1400} y={720} start={done} seed={5} />
    </>
  );
};

// ---------- Scene: skip (Solution 2) ----------

const Skip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lineY = 400;
  const L2 = at(scene, 2, 0);
  const L7 = at(scene, 7, 0);
  const L9 = at(scene, 9, 0);
  // packing animation (L1)
  const c = at(scene, 1, 0.05);
  const ins = [at(scene, 1, 0.26), at(scene, 1, 0.42), at(scene, 1, 0.58), at(scene, 1, 0.74)];
  const present = (s: number) => {
    const i = SQS.indexOf(s);
    return Math.max(0, Math.min(1, 1 - ease(f, c, 10) + ease(f, ins[i], 10)));
  };
  const xOf = (v: number) => {
    if (isSq(v)) return lx(v);
    const slot = spotOf(v) + SQS.filter((s) => s < v).reduce((a, s) => a + present(s), 0);
    return lx(slot);
  };
  const visF = (v: number) => (isSq(v) ? present(v) : 1);
  const dyF = (v: number) => {
    if (!isSq(v) || f < c) return 0;
    const i = SQS.indexOf(v);
    return -70 * (1 - ease(f, ins[i], 10));
  };
  return (
    <>
      <Panel b={L2}>
        <SmallLine y={lineY} red={0} strike={at(scene, 1, 0.9)} green={0} xOf={xOf} vis={visF} dy={dyF} tags={[0, 0, 0]} dots={0} legend={0} />
      </Panel>
      <Panel b={L7}>
        <Parts x={0} y={170} center size={56} parts={[[at(scene, 1, 0.3), `\\text{answer}=${sp('\\text{spot}')}+(\\text{how many squares are below it})`]]} />
      </Panel>

      {/* L2-L6 working */}
      <Panel a={L2} b={L7}>
        <Eq x={120} y={290} size={60} start={at(scene, 2, 0.25)} tex={`${sp('2026')}+(\\text{squares}\\le${sp('2026')})`} />
        <Eq x={120} y={390} size={60} start={at(scene, 3, 0.25)} tex={`45^2=2025\\le${sp('2026')}`} />
        <Eq x={120} y={490} size={60} start={at(scene, 3, 0.6)} color={SQC} tex="1^2,\;2^2,\;\ldots,\;45^2" />
        <Tag x={1180} y={497} start={at(scene, 3, 0.8)} color={SQC} size={52}>45 squares</Tag>
        <Eq x={120} y={600} size={64} start={at(scene, 4, 0.3)} tex={`${sp('2026')}+45=2071`} />
        <Tag x={1000} y={606} start={at(scene, 5, 0.45)} color={C.amber} size={60}>check?</Tag>
        <Eq x={120} y={710} size={60} start={at(scene, 6, 0.4)} tex="46^2=2116>2071" />
        <Tag x={1000} y={716} start={at(scene, 6, 0.8)} color={C.green} size={56}>
          <span style={{ background: C.green, color: '#fff', borderRadius: 999, padding: '0 24px' }}>✓ safe</span>
        </Tag>
      </Panel>

      {/* L7-L8: shortcut */}
      <Panel a={L7}>
        <Tag x={0} y={190} center start={at(scene, 7, 0.4)} color={C.ink} size={54}>
          <span style={{ color: SPOT }}>spot n</span> → add the <span style={{ color: SQC }}>root</span> of the square nearest to <span style={{ color: SPOT }}>n</span>
        </Tag>
      </Panel>
      <Panel a={at(scene, 8, 0)} b={L9}>
        <Tile x={300} y={420} w={150} label="2025" red={0} />
        <Lbl x={300} y={510} tex="45^2" start={at(scene, 8, 0.1)} size={52} color={SQC} />
        <Tile x={560} y={420} w={150} label="2026" border={SPOT} appear={at(scene, 8, 0.05)} />
        <Tag x={470} y={470} start={at(scene, 8, 0.05)} color={SPOT} size={44}>spot</Tag>
        <Tile x={1600} y={420} w={150} label="2116" red={0} />
        <Lbl x={1600} y={510} tex="46^2" start={at(scene, 8, 0.1)} size={52} color={SQC} />
        <Arrow x1={390} x2={475} y={420} start={at(scene, 8, 0.3)} color={OKC} />
        <Arrow x1={650} x2={1500} y={420} start={at(scene, 8, 0.35)} color={C.muted} />
        <Tag x={190} y={560} start={at(scene, 8, 0.45)} color={OKC} size={48}>nearest</Tag>
        <Eq x={0} y={680} center size={68} start={at(scene, 8, 0.6)} tex={`${sp('2026')}+45=2071`} />
        <Tag x={1480} y={690} start={at(scene, 8, 0.9)} color={C.green} size={64}>✓</Tag>
      </Panel>

      {/* L9-L10: why */}
      <Panel a={L9}>
        <div style={{ position: 'absolute', left: 960 - 75, top: 430 - 75, width: 150, height: 150, borderRadius: '50%', background: SPOT, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fadeUp(f, L9) }}>
          <Tex tex="k^2" size={64} color="#fff" />
        </div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((i) => i < 4 || i > 7).map((i) => (
          <Dot key={i} x={480 + i * 80} y={430} start={at(scene, 9, 0.2 + i * 0.02)} />
        ))}
        <Bracket x1={440} x2={1480} y={525} start={at(scene, 9, 0.3)} color={SPOT} />
        <Lbl x={960} y={585} tex="\text{spots close to }k^2" start={at(scene, 9, 0.35)} size={52} color={SPOT} />
        <Arrow x1={560} x2={860} y={430} start={at(scene, 9, 0.5)} color={C.muted} />
        <Arrow x1={1360} x2={1060} y={430} start={at(scene, 9, 0.55)} color={C.muted} />
        <Parts x={0} y={660} center size={56} parts={[[at(scene, 9, 0.75), 'k', OKC], [at(scene, 9, 0.75), '\\text{perfect squares came before it}'], [at(scene, 9, 0.9), '\\to\\text{add }k', OKC]]} />
      </Panel>
      <Tag x={0} y={750} center start={at(scene, 10, 0.55)} color={C.amber} size={56}>test day: fast, then check</Tag>
    </>
  );
};

// ---------- Scene: traps ----------

type CardProps = { x: number; y: number; start: number; letter: string; value: string; children: React.ReactNode; opacity?: number };
const TrapCard: React.FC<CardProps> = ({ x, y, start, letter, value, children, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 880, height: 305, background: C.card, borderRadius: 28, border: `5px solid ${SQC}`, boxShadow: '0 8px 24px rgba(239,67,67,0.12)', ...fadeUp(f, start), opacity: ease(f, start, 12) * opacity }}>
      <div style={{ position: 'absolute', left: 24, top: 18, background: SQC, color: '#fff', borderRadius: 999, padding: '4px 26px', fontSize: 44, fontWeight: 900 }}>
        {letter} · {value}
      </div>
      {children}
    </div>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L5 = at(scene, 7, 0);
  const dim = 1 - 0.97 * ease(f, L5, 12);
  return (
    <>
      <Eq x={0} y={134} center size={52} start={at(scene, 0, 0.45)} tex={`${sp('\\text{spot}')}=\\text{number}-(\\text{how many squares come before it})`} opacity={dim} />
      <TrapCard x={50} y={220} start={at(scene, 1, 0.1)} letter="A" value="2069" opacity={dim}>
        <Eq x={36} y={95} size={52} start={at(scene, 1, 0.3)} tex="45^2=2025<2069" />
        <Eq x={36} y={165} size={52} start={at(scene, 1, 0.55)} tex={`2069-45=${sp('2024')}`} />
        <Tag x={560} y={172} start={at(scene, 1, 0.85)} color={SQC} size={44}>too early</Tag>
      </TrapCard>
      <TrapCard x={990} y={220} start={at(scene, 2, 0.1)} letter="B" value="2070" opacity={dim}>
        <Eq x={44} y={88} size={50} start={at(scene, 2, 0.2)} tex="2026+44=2070" />
        <Eq x={44} y={148} size={50} start={at(scene, 2, 0.32)} tex="\cancel{1^2},2^2,\ldots,45^2" color={SQC} />
        <Tag x={470} y={160} start={at(scene, 2, 0.6)} color={SQC} size={40}>forgot 1 is a square</Tag>
        <Eq x={44} y={206} size={50} start={at(scene, 3, 0.3)} tex={`2070-45=${sp('2025')}`} />
        <Tag x={560} y={220} start={at(scene, 3, 0.85)} color={SQC} size={44}>too early</Tag>
      </TrapCard>
      <TrapCard x={50} y={535} start={at(scene, 4, 0.1)} letter="D" value="2072" opacity={dim}>
        <Eq x={36} y={88} size={50} start={at(scene, 4, 0.2)} tex="2026+46=2072" />
        <Tag x={36} y={152} start={at(scene, 4, 0.5)} color={SQC} size={42}>added 46, not 45</Tag>
        <Eq x={36} y={206} size={50} start={at(scene, 5, 0.3)} tex={`2072-45=${sp('2027')}`} />
        <Tag x={560} y={220} start={at(scene, 5, 0.85)} color={SQC} size={44}>too late</Tag>
      </TrapCard>
      <TrapCard x={990} y={535} start={at(scene, 6, 0.1)} letter="E" value="2116" opacity={dim}>
        <Eq x={44} y={95} size={52} start={at(scene, 6, 0.3)} tex="46^2=2116" />
        <Tag x={44} y={170} start={at(scene, 6, 0.55)} color={SQC} size={44}>a square! not in the list</Tag>
        <Tag x={720} y={80} start={at(scene, 6, 0.55)} color={SQC} size={110}>✗</Tag>
      </TrapCard>
      <div style={{ position: 'absolute', left: 160, right: 160, top: 360, background: C.card, border: `6px solid ${OKC}`, borderRadius: 36, padding: '44px 40px', textAlign: 'center', fontSize: 62, fontWeight: 900, boxShadow: '0 12px 40px rgba(12,194,129,0.18)', ...fadeUp(f, at(scene, 7, 0.25)) }}>
        Add the squares, then <span style={{ color: OKC }}>CHECK</span> for a new one.
      </div>
    </>
  );
};

// ---------- Scene: variant ----------

const Variant: SceneComponent = ({ scene }) => {
  return (
    <>
      <Tag x={0} y={190} center start={at(scene, 0, 0.3)} color={C.ink} size={64}>Your turn!</Tag>
      <Tag x={0} y={340} center start={at(scene, 1, 0.3)} color={C.ink} size={84}>
        <span style={{ color: SPOT }}>spot 1000</span>
        <span style={{ color: C.muted }}> → </span>
        <span>number = ?</span>
      </Tag>
      <Tag x={0} y={540} center start={at(scene, 2, 0.5)} color={C.amber} size={70}>check!</Tag>
    </>
  );
};

// ---------- Scene: variant-answer ----------

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L5 = at(scene, 5, 0);
  const done = at(scene, 3, 0.93);
  const y = 640;
  // L5 number line: 961 ... 1000 ... 1024 (1000 is 39/63 of the way)
  const x0 = 300, x1 = 1500, xm = x0 + (x1 - x0) * (39 / 63);
  return (
    <>
      <Panel b={L5}>
        <Eq x={120} y={150} size={64} start={at(scene, 0, 0.15)} tex="31^2=961<1000" />
        <Tag x={120} y={240} start={at(scene, 0, 0.6)} color={SQC} size={52}>31 perfect squares below 1000</Tag>
        <Eq x={120} y={340} size={68} start={at(scene, 1, 0.3)} tex={`${sp('1000')}+31=1031`} />
        {/* L2 sketch */}
        <Tile x={150} y={y} w={110} label="…" appear={at(scene, 2, 0.05)} />
        <Tile x={360} y={y} w={150} label="1000" appear={at(scene, 2, 0.05)} border={SPOT} />
        <Tile x={560} y={y} w={110} label="…" appear={at(scene, 2, 0.05)} />
        <Tile x={780} y={y} w={150} label="1024" appear={at(scene, 2, 0.05)} red={at(scene, 2, 0.45)} />
        <Lbl x={780} y={y + 90} tex="32^2" start={at(scene, 2, 0.5)} size={52} color={SQC} />
        <Tile x={980} y={y} w={110} label="…" appear={at(scene, 2, 0.05)} />
        <Tile x={1180} y={y} w={150} label="1031" appear={at(scene, 2, 0.05)} border={C.muted} />
        <Hop x1={400} x2={1150} y={y - 60} lift={70} start={at(scene, 2, 0.3)} />
        <Tag x={560} y={y - 200} start={at(scene, 2, 0.7)} color={SQC} size={52}>jumped over it!</Tag>
        <Tile x={1420} y={y} w={170} label="1032" appear={at(scene, 3, 0.72)} green={at(scene, 3, 0.72)} />
        <Parts x={1000} y={340} size={68} gap={14} parts={[[at(scene, 3, 0.2), '1031+1='], [at(scene, 3, 0.72), '1032', C.green]]} />
        <Eq x={1000} y={745} size={58} start={at(scene, 4, 0.3)} tex="33^2=1089>1032" />
        <Tag x={1620} y={747} start={at(scene, 4, 0.7)} color={C.green} size={52}>
          <span style={{ background: C.green, color: '#fff', borderRadius: 999, padding: '0 24px' }}>✓ safe</span>
        </Tag>
      </Panel>
      <Badge x={1550} y={215} text="1032" start={done} size={96} />
      <Confetti x={1550} y={215} start={done} seed={11} />
      <Panel a={L5}>
        <Tile x={x0} y={400} w={150} label="961" red={0} />
        <Lbl x={x0} y={490} tex="31^2" start={at(scene, 5, 0.1)} size={52} color={SQC} />
        <Tile x={xm} y={400} w={150} label="1000" border={SPOT} appear={at(scene, 5, 0.1)} />
        <Tag x={xm - 75} y={460} start={at(scene, 5, 0.1)} color={SPOT} size={44}>spot</Tag>
        <Tile x={x1} y={400} w={150} label="1024" red={0} />
        <Lbl x={x1} y={490} tex="32^2" start={at(scene, 5, 0.1)} size={52} color={SQC} />
        <Arrow x1={x0 + 90} x2={xm - 90} y={400} start={at(scene, 5, 0.3)} color={C.muted} />
        <Arrow x1={xm + 90} x2={x1 - 90} y={400} start={at(scene, 5, 0.4)} color={OKC} />
        <Tag x={x1 - 130} y={550} start={at(scene, 5, 0.55)} color={OKC} size={48}>nearest</Tag>
        <Eq x={0} y={680} center size={68} start={at(scene, 5, 0.7)} tex={`${sp('1000')}+32=1032`} />
        <Tag x={1400} y={690} start={at(scene, 5, 0.9)} color={C.green} size={64}>✓</Tag>
      </Panel>
    </>
  );
};

// ---------- Scene: recap ----------

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0.02);
  return (
    <>
      <div style={{ opacity: fadeTo(f, l1, 0, 12) }}>
        <Tag x={0} y={200} center start={at(scene, 0, 0.05)} color={OKC} size={52}>The big idea</Tag>
        <Eq x={0} y={320} center size={60} start={at(scene, 0, 0.25)} tex={`\\text{answer}=${sp('\\text{spot}')}+(\\text{how many squares below it})`} />
        <Tag x={0} y={470} center start={at(scene, 0, 0.7)} color={C.amber} size={60}>then check for one more!</Tag>
      </div>
      <div style={{ opacity: fadeTo(f, at(scene, 2, 0.02), 0, 12) }}>
        <Eq x={0} y={320} center size={60} start={l1 + 6} tex={`${sp('\\text{spot }n')}\\to n+\\sqrt{\\text{nearest square to }n}`} />
        <Tag x={0} y={470} center start={at(scene, 1, 0.5)} color={C.ink} size={52}>add the root of the nearest square</Tag>
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
  try1: makePause('What is the 2026th number in the list of non-squares?', true, 10),
  gaps: Gaps,
  reveal: Reveal,
  skip: Skip,
  traps: Traps,
  variant: Variant,
  try2: makePause('What is the 1000th number in the list?', false, 10),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 10-style · Level 4" /> : null;

// YouTube thumbnail (`<slug>-thumb`, render.sh → poster.jpg): the trap + the number grid with perfect squares crossed out, no answer.
export const Thumb: React.FC = () => (
  <ThumbFrame chip="AMC 10 Practice" lines={["Think it's", <span style={{ color: C.red }}>2070?</span>]}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 150px)', gap: 14 }}>
      {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => {
        const sq = Math.sqrt(n) % 1 === 0;
        return (
          <div key={n} style={{ height: 130, borderRadius: 24, background: sq ? 'transparent' : C.card, border: sq ? `4px dashed ${C.muted}` : `4px solid ${C.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 66, fontWeight: 900, color: sq ? C.muted : C.ink, textDecoration: sq ? 'line-through' : 'none', opacity: sq ? 0.55 : 1 }}>
            {n}
          </div>
        );
      })}
    </div>
  </ThumbFrame>
);

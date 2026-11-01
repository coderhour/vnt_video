import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, range } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Poly, Stage, XMark, type Pt } from '../../lib/grid';
import { PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Answer, Confetti, Mark, Pill, Text } from '../../lib/ui';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-perimeter-24-triangles';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

const COLS = [C.primary, C.violet, C.blue, C.amber]; // c = 11, 10, 9, 8
const COLX = (i: number) => 100 + i * 450;

// ---------- small helpers ----------

const Eq: React.FC<{ x: number; y: number; tex: string; start: number; size?: number; color?: string; opacity?: number; center?: number }> = ({ x, y, tex, start, size = 56, color = C.ink, opacity = 1, center }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const pos: React.CSSProperties = center ? { left: x - center / 2, width: center, textAlign: 'center' } : { left: x };
  return (
    <div style={{ position: 'absolute', top: y, whiteSpace: 'nowrap', ...pos, ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; start: number; border?: string; opacity?: number; children?: React.ReactNode }> = ({ x, y, w, h, start, border, opacity = 1, children }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', border: border ? `6px solid ${border}` : undefined, boxSizing: 'border-box', ...s, opacity: (s.opacity as number) * opacity }}>
      {children}
    </div>
  );
};

const CHOICES = ['10', '11', '12', '13', '19'];
const Chips: React.FC<{ x: number; y: number; start: (i: number) => number }> = ({ x, y, start }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {CHOICES.map((c, i) => (
        <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', fontSize: 60, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
          <span style={{ color: C.muted, fontSize: 44, marginRight: 12 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};

/** Triangle with sides a <= b <= c lying on a base of length c whose left end is at (x, y). Pixel coords. */
const triPts = (a: number, b: number, c: number, u: number, x: number, y: number): Pt[] => {
  const px = (b * b + c * c - a * a) / (2 * c);
  const h = Math.sqrt(Math.max(0, b * b - px * px));
  return [[x, y], [x + c * u, y], [x + px * u, y - h * u]];
};

/** A thick "stick" from p to q. */
const Stick: React.FC<{ p: Pt; q: Pt; color: string; w?: number; opacity?: number }> = ({ p, q, color, w = 16, opacity = 1 }) => (
  <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={opacity} />
);

const Lbl: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 52, opacity = 1 }) => (
  <text x={p[0]} y={p[1]} fontSize={size} fontWeight={900} fill={color} textAnchor="middle" dominantBaseline="middle" opacity={opacity} fontFamily="Nunito">
    {text}
  </text>
);

// ---------- list columns ----------

type Row = [number, number];
const Column: React.FC<{
  i: number; x?: number; c: number; sum: number; rows: Row[]; rowStarts: number[]; hdr: number; sumStart: number; badgeStart: number;
  y0?: number; pitch?: number; u?: number; hy?: number; color?: string; ghostStart?: number;
}> = ({ i, x = COLX(i), c, sum, rows, rowStarts, hdr, sumStart, badgeStart, y0 = 310, pitch = 78, u = 12, hy = 130, color = COLS[i], ghostStart }) => {
  const f = useCurrentFrame();
  const bs = ease(f, badgeStart, 10);
  return (
    <>
      <Eq x={x} y={hy} tex={`c = ${c}`} start={hdr} color={color} size={60} />
      <Eq x={x} y={hy + 76} tex={`a + b = ${sum}`} start={sumStart} size={50} color={C.ink} />
      {rows.map((r, k) => {
        const y = y0 + k * pitch;
        const s = ease(f, rowStarts[k], 12);
        return (
          <div key={k}>
            <Eq x={x} y={y} tex={`(${r[0]},\\,${r[1]})`} start={rowStarts[k]} size={50} />
            <Stage>
              <Poly pts={triPts(r[0], r[1], c, u, x + 190, y + 58)} progress={s} color={color} width={5} fill={color} fillOpacity={0.2} />
            </Stage>
          </div>
        );
      })}
      {ghostStart !== undefined && (
        <Eq x={x} y={y0 + rows.length * pitch} tex={'\\cancel{(7,\\,6)} = (6,\\,7)'} start={ghostStart} size={50} color={C.red} />
      )}
      <div style={{ position: 'absolute', left: x + 290, top: hy - 6, width: 84, height: 84, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 900, opacity: bs, transform: `scale(${0.6 + 0.4 * bs})` }}>
        {rows.length}
      </div>
    </>
  );
};

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const total = 1400;
  const x0 = 260;
  const parts = [7, 8, 9].map((v) => (v / 24) * total);
  const starts = [at(scene, 0, 0.25), at(scene, 0, 0.45), at(scene, 0, 0.65)];
  let acc = x0;
  const xs = parts.map((w) => {
    const x = acc;
    acc += w;
    return x;
  });
  return (
    <>
      <Text x={960} y={110} w={1500} size={76} weight={900} align="center" style={fadeUp(f, 0)}>
        Perimeter 24
      </Text>
      <Eq x={960} y={220} center={800} tex={'24'} start={at(scene, 0, 0.1)} size={64} color={C.violet} />
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <line x1={x0} y1={310} x2={x0 + total} y2={310} stroke={C.violet} strokeWidth={6} opacity={ease(f, at(scene, 0, 0.1), 14)} />
        {parts.map((w, k) => {
          const p = ease(f, starts[k], 14);
          return (
            <g key={k}>
              <rect x={xs[k]} y={350} width={Math.max(0, w * p - 8)} height={110} rx={26} fill={COLS[k]} opacity={0.9} />
              <text x={xs[k] + w / 2 - 4} y={407} fontSize={72} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="middle" opacity={p} fontFamily="Nunito">
                ?
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: 520, top: 480, fontSize: 250, fontWeight: 900, color: C.violet, lineHeight: 1, ...fadeUp(f, at(scene, 1, 0.0), 16) }}>?</div>
      <Text x={760} y={560} w={800} size={68} weight={900} style={fadeUp(f, at(scene, 1, 0.05), 16)}>
        different triangles
      </Text>
      <div style={{ position: 'absolute', left: 1180, top: 660, ...fadeUp(f, at(scene, 1, 0.45)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 84, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>your math tutor</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 150, top: 150, width: 1620, background: C.card, borderRadius: 32, padding: '36px 56px', fontSize: 56, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 0) }}>
        How many different triangles have <Mark on={at(scene, 1, 0.45)}>whole-number side lengths</Mark> and a <Mark on={at(scene, 1, 0.75)}>perimeter of 24</Mark>?
        <div style={{ marginTop: 18, opacity: ease(f, at(scene, 2, 0), 12) }}>
          Triangles with the same three side lengths <Mark on={at(scene, 2, 0.1)}>count once</Mark>.
        </div>
      </div>
      <Chips x={150} y={660} start={(i) => at(scene, 2, 0.55 + i * 0.09)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const u = 40, bx = 260, by = 520;
  const L: Pt = [bx, by], R: Pt = [bx + 20 * u, by];
  const apL: Pt = [bx + 2 * u * 0.5, by - 2 * u * 0.87];
  const apR: Pt = [R[0] - 2 * u * 0.5, by - 2 * u * 0.87];
  const p = ease(f, at(scene, 1, 0.2), 16);
  return (
    <>
      <Eq x={170} y={150} tex={'a + b + c = 24'} start={0} size={72} />
      <Text x={820} y={166} w={1000} size={48} style={fadeUp(f, at(scene, 0, 0.1))}>
        <Mark on={at(scene, 0, 0.45)}>whole numbers</Mark>, each one a side
      </Text>
      <Stage>
        <g opacity={ease(f, at(scene, 1, 0.0), 12)}>
          <Stick p={L} q={R} color={C.ink} w={14} />
          <Stick p={L} q={[L[0] + (apL[0] - L[0]) * p, L[1] + (apL[1] - L[1]) * p]} color={C.red} />
          <Stick p={R} q={[R[0] + (apR[0] - R[0]) * p, R[1] + (apR[1] - R[1]) * p]} color={C.red} />
          <line x1={apL[0] + 20} y1={apL[1]} x2={apR[0] - 20} y2={apR[1]} stroke={C.red} strokeWidth={5} strokeDasharray="10 12" opacity={p} />
          <Lbl p={[bx + 10 * u, by + 50]} text="20" color={C.ink} />
          <Lbl p={[L[0] - 40, by - 50]} text="2" color={C.red} />
          <Lbl p={[R[0] + 40, by - 50]} text="2" color={C.red} />
          <XMark at={[bx + 10 * u, by - 120]} size={80} opacity={ease(f, at(scene, 1, 0.55), 10)} />
        </g>
      </Stage>
      <Eq x={1230} y={440} tex={'2,\\,2,\\,20'} start={at(scene, 1, 0.1)} size={64} color={C.red} />
      <Eq x={170} y={640} tex={'7,\\,8,\\,9 \\;=\\; 9,\\,8,\\,7'} start={at(scene, 2, 0.15)} size={68} />
      <Pill x={900} y={650} color={C.primary} style={{ ...fadeUp(f, at(scene, 2, 0.7)), fontSize: 44 }}>same triangle</Pill>
    </>
  );
};

const makePause = (seconds: number, extra: React.ReactNode): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 150, width: 1000, background: C.card, borderRadius: 32, padding: '30px 44px', fontSize: 50, fontWeight: 600, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, 6) }}>
        How many different triangles have whole-number side lengths and a perimeter of {extra}?
        <div style={{ marginTop: 10, fontSize: 48, color: C.muted }}>Same three sides count once.</div>
      </div>
      {extra === '24' ? (
        <div style={{ position: 'absolute', left: 80, top: 560, ...fadeUp(f, 12) }}>
          <div style={{ display: 'flex', gap: 18 }}>
            {CHOICES.map((c, i) => (
              <div key={c} style={{ background: C.card, borderRadius: 18, padding: '8px 22px', fontSize: 56, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
                <span style={{ color: C.muted, fontSize: 40, marginRight: 8 }}>{'ABCDE'[i]}</span>
                {c}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Eq x={80} y={600} tex={'a + b + c = 20'} start={12} size={72} />
      )}
      <Countdown scene={scene} seconds={seconds} x={1500} y={480} tick={TICK} />
    </>
  );
};

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // triangle 5, 6, 8
  const u = 60, bx = 160, by = 640, c = 8, a = 5, b = 6;
  const px = (b * b + c * c - a * a) / (2 * c);
  const thL = Math.acos(px / b);
  const thR = Math.acos((c - px) / a);
  const sw = ease(f, at(scene, 1, 0.1), 40);
  const P: Pt = [bx, by], Q: Pt = [bx + c * u, by];
  const eL: Pt = [P[0] + Math.cos(thL * sw) * b * u, P[1] - Math.sin(thL * sw) * b * u];
  const eR: Pt = [Q[0] - Math.cos(thR * sw) * a * u, Q[1] - Math.sin(thR * sw) * a * u];
  const fig1 = fadeTo(f, at(scene, 2, 0.0), 0);
  // flat 6, 6, 12
  const fu = 40, fx = 160, fy = 600;
  const flat = ease(f, at(scene, 2, 0.15), 14);
  const figGone = fadeTo(f, at(scene, 3, 0.0), 0);
  const barX = 200, barW = 1500, bu = barW / 24, cc = 9;
  const b1 = ease(f, at(scene, 3, 0.1), 14);
  return (
    <>
      {/* L1 triangle */}
      <div style={{ opacity: fig1 * figGone }}>
        <Stage>
          <g opacity={ease(f, at(scene, 1, 0), 10)}>
            <Stick p={P} q={Q} color={C.ink} w={18} />
            <Stick p={P} q={eL} color={C.blue} />
            <Stick p={Q} q={eR} color={C.primary} />
            <Lbl p={[bx + c * u * 0.5, by + 50]} text="c" />
            <Lbl p={[(P[0] + eL[0]) / 2 - 36, (P[1] + eL[1]) / 2 - 10]} text="b" color={C.blue} opacity={ease(f, at(scene, 1, 0.5), 8)} />
            <Lbl p={[(Q[0] + eR[0]) / 2 + 36, (Q[1] + eR[1]) / 2 - 10]} text="a" color={C.primary} opacity={ease(f, at(scene, 1, 0.5), 8)} />
          </g>
        </Stage>
      </div>
      <Eq x={900 + 350 * ease(f, at(scene, 3, 0), 14)} y={150} tex={'a + b > c'} start={at(scene, 1, 0.3)} size={72} color={C.green} />
      <Text x={160} y={150} w={900} size={64} weight={900} style={{ opacity: ease(f, 0, 12) * fadeTo(f, at(scene, 1, 0), 0, 10) }}>The triangle rule</Text>
      {/* L2 tie */}
      <div style={{ opacity: flat * figGone }}>
        <Stage>
          <Stick p={[fx, fy + 40]} q={[fx + 12 * fu, fy + 40]} color={C.ink} w={18} />
          <Stick p={[fx, fy]} q={[fx + 6 * fu, fy]} color={C.blue} />
          <Stick p={[fx + 6 * fu, fy]} q={[fx + 12 * fu, fy]} color={C.primary} />
          <Lbl p={[fx + 3 * fu, fy - 40]} text="6" color={C.blue} />
          <Lbl p={[fx + 9 * fu, fy - 40]} text="6" color={C.primary} />
          <Lbl p={[fx + 6 * fu, fy + 90]} text="12" />
        </Stage>
      </div>
      <div style={{ opacity: figGone }}>
      <Eq x={900} y={290} tex={'6 + 6 = 12'} start={at(scene, 2, 0.15)} size={64} color={C.red} />
      <Text x={900} y={380} w={900} size={52} weight={900} color={C.red} style={fadeUp(f, at(scene, 2, 0.5))}>
        flat: not a triangle
      </Text>
      </div>
      {/* L3 bar */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g opacity={b1}>
          <line x1={barX} y1={262} x2={barX + barW} y2={262} stroke={C.violet} strokeWidth={6} />
          <rect x={barX} y={285} width={cc * bu - 6} height={96} rx={22} fill={C.violet} />
          <rect x={barX + cc * bu} y={285} width={(24 - cc) * bu} height={96} rx={22} fill={C.blue} opacity={0.85} />
        </g>
      </svg>
      <Eq x={barX + barW / 2} y={184} center={300} tex={'24'} start={at(scene, 3, 0.1)} size={56} color={C.violet} />
      <Eq x={barX + (cc * bu) / 2} y={304} center={cc * bu} tex={'\\text{longest } c'} start={at(scene, 3, 0.35)} size={50} color="#fff" />
      <Eq x={barX + cc * bu + ((24 - cc) * bu) / 2} y={304} center={(24 - cc) * bu} tex={'\\text{rest} = 24 - c'} start={at(scene, 3, 0.6)} size={50} color="#fff" />
      <Eq x={barX} y={395} tex={'a + b = 24 - c'} start={at(scene, 3, 0.75)} size={56} />
      {/* L4 */}
      <Eq x={barX} y={485} tex={'24 - c > c \\;\\Rightarrow\\; c < 12'} start={at(scene, 4, 0.1)} size={58} color={C.green} />
      <Eq x={1100} y={450} tex={'\\dfrac{24}{2} = 12'} start={at(scene, 4, 0.45)} size={58} />
      <Card x={barX} y={640} w={1500} h={90} start={at(scene, 4, 0.7)} border={C.green}>
        <div style={{ textAlign: 'center', fontSize: 52, fontWeight: 900, lineHeight: '78px' }}>longest side &lt; half the perimeter</div>
      </Card>
      {/* L5 */}
      <Eq x={barX} y={755} tex={'a \\le b \\le c'} start={at(scene, 5, 0.1)} size={54} />
    </>
  );
};

const Floor: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const bx = 200, bu = 62.5;
  const out = fadeTo(f, at(scene, 2, 0.0), 0, 10);
  return (
    <>
      <div style={{ opacity: out }}>
        <Eq x={bx} y={160} tex={'c = 7 \\;\\Rightarrow\\; a \\le b \\le c = 7'} start={0} size={62} />
        <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <rect x={bx} y={270} width={24 * bu} height={90} rx={22} fill="none" stroke={C.line} strokeWidth={6} strokeDasharray="14 12" opacity={ease(f, at(scene, 0, 0.3), 12)} />
          {range(3).map((k) => {
            const p = ease(f, at(scene, 0, 0.45 + k * 0.15), 12);
            return (
              <g key={k}>
                <rect x={bx + k * 7 * bu} y={270} width={Math.max(0, 7 * bu * p - 6)} height={90} rx={22} fill={COLS[k]} />
                <text x={bx + k * 7 * bu + 3.5 * bu} y={317} fontSize={56} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="middle" opacity={p} fontFamily="Nunito">7</text>
              </g>
            );
          })}
          <XMark at={[bx + 22.5 * bu, 315]} size={50} opacity={ease(f, at(scene, 1, 0.5), 10)} />
        </svg>
        <Eq x={bx} y={400} tex={'7 + 7 + 7 = 21 < 24'} start={at(scene, 1, 0.1)} size={66} color={C.red} />
        <Eq x={bx} y={520} tex={'c \\ge 8'} start={at(scene, 1, 0.65)} size={80} color={C.green} />
      </div>
      {[3, 2, 1, 0].map((i, k) => (
        <Eq key={i} x={COLX(i)} y={130} tex={`c = ${11 - i}`} start={at(scene, 2, 0.1 + k * 0.14)} size={60} color={COLS[i]} />
      ))}
    </>
  );
};

const LIST: { c: number; sum: number; rows: Row[] }[] = [
  { c: 11, sum: 13, rows: [[2, 11], [3, 10], [4, 9], [5, 8], [6, 7]] },
  { c: 10, sum: 14, rows: [[4, 10], [5, 9], [6, 8], [7, 7]] },
  { c: 9, sum: 15, rows: [[6, 9], [7, 8]] },
  { c: 8, sum: 16, rows: [[8, 8]] },
];

const List: SceneComponent = ({ scene }) => {
  const m = (line: number, t: number) => at(scene, line, t);
  const rs = [
    [m(1, 0.7), m(2, 0.12), m(2, 0.34), m(2, 0.56), m(2, 0.78)],
    [m(4, 0.75), m(5, 0.1), m(5, 0.35), m(5, 0.6)],
    [m(6, 0.4), m(6, 0.75)],
    [m(7, 0.6)],
  ];
  const sums = [m(0, 0.4), m(4, 0.2), m(6, 0.1), m(7, 0.1)];
  const badges = [m(2, 0.92), m(5, 0.92), m(6, 0.92), m(7, 0.92)];
  return (
    <>
      {LIST.map((L, i) => (
        <Column key={i} i={i} c={L.c} sum={L.sum} rows={L.rows} rowStarts={rs[i]} hdr={-100} sumStart={sums[i]} badgeStart={badges[i]} ghostStart={i === 0 ? m(3, 0.35) : undefined} />
      ))}
    </>
  );
};

const Total1: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 0, 0.88);
  const items = [[11, 5], [10, 4], [9, 2], [8, 1]];
  return (
    <>
      {items.map(([c, n], i) => (
        <Card key={c} x={COLX(i)} y={170} w={400} h={190} start={at(scene, 0, 0.0 + i * 0.12)}>
          <div style={{ textAlign: 'center', paddingTop: 12 }}>
            <Tex tex={`c = ${c}`} size={52} color={COLS[i]} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 88, fontWeight: 900, color: COLS[i], lineHeight: 1.0 }}>{n}</div>
        </Card>
      ))}
      <Eq x={COLX(0)} y={450} tex={'5 + 4 + 2 + 1 = 12'} start={at(scene, 0, 0.55)} size={96} color={C.green} />
      <Answer x={1560} y={600} value="C" chime={CHIME} start={done} />
      <Confetti x={1560} y={600} start={done} seed={5} />
      <div style={{ opacity: ease(f, done, 10) }} />
    </>
  );
};

const Gaps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const ax = 200, au = 125, ay = 540;
  const X = (v: number) => ax + v * au;
  const bars: { v: number; y: number; s: number }[] = [
    { v: 7, y: 270, s: at(scene, 0, 0.55) },
    { v: 8, y: 350, s: at(scene, 1, 0.3) },
    { v: 9, y: 430, s: at(scene, 1, 0.5) },
  ];
  const stage1 = fadeTo(f, at(scene, 5, 0.0), 0, 12);
  const g1 = ease(f, at(scene, 1, 0.1), 12);
  return (
    <>
      <div style={{ opacity: stage1 }}>
        <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <g opacity={ease(f, 4, 14)}>
            <line x1={X(0)} y1={ay} x2={X(12)} y2={ay} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
            {range(13).map((k) => (
              <line key={k} x1={X(k)} y1={ay - 10} x2={X(k)} y2={ay + 10} stroke={C.ink} strokeWidth={4} />
            ))}
            <line x1={X(12)} y1={230} x2={X(12)} y2={ay} stroke={C.red} strokeWidth={5} strokeDasharray="10 10" />
          </g>
          {bars.map(({ v, y, s }) => {
            const p = ease(f, s, 12);
            const gp = ease(f, s + 8, 14);
            return (
              <g key={v}>
                <rect x={X(0)} y={y} width={v * au * p} height={60} rx={14} fill={COLS[v - 7 === 0 ? 2 : v - 7 === 1 ? 1 : 0]} />
                <text x={X(v / 2)} y={y + 32} fontSize={48} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="middle" opacity={p} fontFamily="Nunito">{v}</text>
                <rect x={X(v)} y={y} width={(12 - v) * au * gp} height={60} rx={14} fill={C.amber} opacity={0.35} stroke={C.amber} strokeWidth={4} strokeDasharray="10 8" />
                <text x={X(v + (12 - v) / 2)} y={y + 32} fontSize={48} fontWeight={900} fill={C.amber} textAnchor="middle" dominantBaseline="middle" opacity={gp * (s === bars[0].s ? g1 : 1)} fontFamily="Nunito">{12 - v}</text>
              </g>
            );
          })}
          <text x={X(0)} y={ay + 52} fontSize={48} fontWeight={900} fill={C.ink} textAnchor="middle" fontFamily="Nunito" opacity={ease(f, 4, 14)}>0</text>
          <text x={X(12)} y={ay + 52} fontSize={48} fontWeight={900} fill={C.red} textAnchor="middle" fontFamily="Nunito" opacity={ease(f, 4, 14)}>12</text>
        </svg>
        <Text x={X(12) + 24} y={252} w={260} size={44} color={C.amber} weight={900} style={{ opacity: ease(f, at(scene, 0, 0.5), 10) }}>gap</Text>
        <Eq x={200} y={600} tex={'3 \\times 12 = 36'} start={at(scene, 2, 0.1)} size={56} />
        <Eq x={760} y={600} tex={'36 - 24 = 12'} start={at(scene, 2, 0.45)} size={56} />
        <Eq x={200} y={690} tex={'g_1 + g_2 + g_3 = 12'} start={at(scene, 2, 0.75)} size={60} color={C.amber} />
        <Eq x={1000} y={690} tex={'g \\ge 1'} start={at(scene, 3, 0.4)} size={60} color={C.green} />
        <Eq x={1350} y={690} tex={'\\text{gaps} \\to \\text{sides}'} start={at(scene, 4, 0.3)} size={56} color={C.violet} />
        <Eq x={1350} y={600} tex={'\\text{side} = 12 - g'} start={at(scene, 4, 0.55)} size={50} color={C.violet} />
      </div>
      {/* partitions */}
      <Eq x={COLX(0)} y={150} tex={'g_1 + g_2 + g_3 = 12, \\quad g \\ge 1'} start={at(scene, 5, 0.3)} size={58} color={C.amber} />
      <Part x={120} y={270} g={10} items={['(10,1,1)']} start={at(scene, 6, 0.05)} color={COLS[1]} />
      <Part x={120} y={395} g={9} items={['(9,2,1)']} start={at(scene, 6, 0.28)} color={COLS[1]} />
      <Part x={120} y={520} g={8} items={['(8,3,1)', '(8,2,2)']} start={at(scene, 6, 0.5)} color={COLS[1]} />
      <Part x={120} y={645} g={7} items={['(7,4,1)', '(7,3,2)']} start={at(scene, 6, 0.78)} color={COLS[1]} />
      <Part x={1000} y={270} g={6} items={['(6,5,1)', '(6,4,2)', '(6,3,3)']} start={at(scene, 7, 0.05)} color={COLS[2]} />
      <Part x={1000} y={395} g={5} items={['(5,5,2)', '(5,4,3)']} start={at(scene, 7, 0.35)} color={COLS[2]} />
      <Part x={1000} y={520} g={4} items={['(4,4,4)']} start={at(scene, 7, 0.65)} color={COLS[2]} extra={'\\to (8,8,8)'} />
      <Eq x={120} y={735} tex={'1+1+2+2+3+2+1 = 12'} start={at(scene, 8, 0.15)} size={62} color={C.green} />
    </>
  );
};

const Part: React.FC<{ x: number; y: number; g: number; items: string[]; start: number; color: string; extra?: string }> = ({ x, y, g, items, start, color, extra }) => {
  const f = useCurrentFrame();
  const n = items.length;
  const badge = ease(f, start + 8, 10);
  return (
    <>
      <Eq x={x} y={y} tex={`\\textbf{${g}:}\\;${items.join('\\;')}${extra ? '\\;' + extra : ''}`} start={start} size={50} />
      <div style={{ position: 'absolute', left: x + (extra ? 640 : 100 + items.length * 230 + (n === 1 ? 20 : 0)), top: y + 4, width: 62, height: 62, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900, opacity: badge }}>
        {n}
      </div>
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const strip = [[11, '5'], [10, '4'], [9, '2'], [8, '1']];
  const grey = [0, 0, ease(f, at(scene, 1, 0.45), 10), ease(f, at(scene, 2, 0.45), 10)];
  const out = fadeTo(f, at(scene, 5, 0.0), 0, 12);
  return (
    <>
      <div style={{ opacity: out }}>
        {strip.map(([c, n], i) => (
          <div key={i} style={{ position: 'absolute', left: COLX(i), top: 150, width: 400, height: 100, borderRadius: 24, background: C.card, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, 0, 14) * (1 - 0.7 * grey[i]) }}>
            <Tex tex={i === 3 ? 'c=8: (8,8,8)' : `c = ${c}: ${n}`} size={48} color={COLS[i]} />
            {grey[i] > 0 && <div style={{ position: 'absolute', left: 30, right: 30, top: 48, height: 7, background: C.red, borderRadius: 4, opacity: grey[i] }} />}
          </div>
        ))}
        <TrapCard x={COLX(0)} start={at(scene, 1, 0.1)} value="10" tex="12 - 2" note="c = 9 skipped" />
        <TrapCard x={COLX(1)} start={at(scene, 2, 0.1)} value="11" tex="12 - 1" note="(8,8,8) forgotten" />
        <TrapCard x={COLX(2)} start={at(scene, 3, 0.1)} value="13" tex="12 + 1" note="twice">
          <div style={{ position: 'absolute', left: 0, right: 0, top: 245, textAlign: 'center', whiteSpace: 'nowrap', opacity: ease(f, at(scene, 3, 0.45), 10) }}>
            <Tex tex={'(7,8,9)'} size={50} color={C.red} />
            <br />
            <Tex tex={'=\\;(9,8,7)'} size={50} color={C.red} />
          </div>
        </TrapCard>
        <TrapCard x={COLX(3)} start={at(scene, 4, 0.1)} value="19" tex="" note="too many" />
      </div>
      <Card x={200} y={260} w={1520} h={400} start={at(scene, 5, 0.1)} border={C.primary}>
        <div style={{ position: 'absolute', left: 70, top: 40, fontSize: 48, fontWeight: 900, color: C.primary }}>The habit</div>
        <div style={{ position: 'absolute', left: 70, top: 130, fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.35)) }}>1. Pick the longest side first</div>
        <div style={{ position: 'absolute', left: 70, top: 240, fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 5, 0.65)) }}>2. List the other two in order</div>
      </Card>
    </>
  );
};

const TrapCard: React.FC<{ x: number; start: number; value: string; tex: string; note: string; children?: React.ReactNode }> = ({ x, start, value, tex, note, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: 300, width: 400, height: 420, background: '#fff5f5', border: `6px solid ${C.red}`, borderRadius: 32, boxSizing: 'border-box', ...fadeUp(f, start) }}>
      <div style={{ textAlign: 'center', fontSize: 84, fontWeight: 900, color: C.red, lineHeight: 1.1, marginTop: 10 }}>{value}</div>
      <div style={{ textAlign: 'center', marginTop: 6, minHeight: 70 }}>{tex && <Tex tex={tex} size={56} color={C.ink} />}</div>
      <div style={{ textAlign: 'center', fontSize: 44, fontWeight: 800, color: C.red, marginTop: 6 }}>{note}</div>
      {children}
    </div>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={960} y={170} center={1400} tex={'a + b + c = 20'} start={at(scene, 0, 0.45)} size={96} color={C.violet} />
      <div style={{ position: 'absolute', left: 150, top: 380, width: 1620, background: C.card, borderRadius: 32, padding: '36px 56px', fontSize: 56, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', ...fadeUp(f, at(scene, 1, 0)) }}>
        How many different triangles have <Mark on={at(scene, 1, 0.45)}>whole-number side lengths</Mark> and a <Mark on={at(scene, 1, 0.75)}>perimeter of 20</Mark>?
      </div>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const m = (l: number, t: number) => at(scene, l, t);
  const done = m(7, 0.97);
  const X = (i: number) => 100 + i * 570;
  const cols = [
    { c: 9, sum: 11, rows: [[2, 9], [3, 8], [4, 7], [5, 6]] as Row[], rs: [m(3, 0.1), m(3, 0.3), m(3, 0.5), m(3, 0.7)], sumS: m(2, 0.5), bd: m(3, 0.92) },
    { c: 8, sum: 12, rows: [[4, 8], [5, 7], [6, 6]] as Row[], rs: [m(4, 0.45), m(4, 0.6), m(4, 0.75)], sumS: m(4, 0.1), bd: m(4, 0.92) },
    { c: 7, sum: 13, rows: [[6, 7]] as Row[], rs: [m(5, 0.65)], sumS: m(5, 0.2), bd: m(5, 0.92) },
  ];
  const f = useCurrentFrame();
  return (
    <>
      <Eq x={100} y={140} tex={'\\dfrac{20}{2} = 10 \\;\\Rightarrow\\; c < 10'} start={m(0, 0.4)} size={56} />
      <Eq x={100} y={270} tex={'6+6+6 = 18 < 20 \\;\\Rightarrow\\; c \\ge 7'} start={m(1, 0.45)} size={52} />
      {cols.map((k, i) => (
        <Column key={i} i={i} x={X(i)} c={k.c} sum={k.sum} rows={k.rows} rowStarts={k.rs} hdr={i === 0 ? m(2, 0.1) : k.sumS - 6} sumStart={k.sumS} badgeStart={k.bd} y0={525} hy={365} u={14} color={COLS[i + 1]} />
      ))}
      <Eq x={1230} y={660} tex={'20 \\div 3'} start={m(6, 0.15)} size={56} />
      <Text x={1230} y={750} w={640} size={44} weight={800} color={C.red} style={fadeUp(f, m(6, 0.5))}>not whole: no equilateral</Text>
      <Eq x={1040} y={150} tex={'4 + 3 + 1 = 8'} start={m(7, 0.1)} size={90} color={C.green} />
      <Answer x={1700} y={230} value="8" chime={CHIME} start={done} />
      <Confetti x={1700} y={230} start={done} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const cardOut = fadeTo(f, at(scene, 3, 0), 0, 12);
  const steps = [
    { n: '1', t: 'Pick the longest side first', s: at(scene, 2, 0.1) },
    { n: '2', t: 'Find its limits', s: at(scene, 2, 0.4), tex: '\\text{for 24: } 8 \\le c \\le 11' },
    { n: '3', t: 'List the other two in order', s: at(scene, 2, 0.7) },
  ];
  return (
    <>
      <div style={{ opacity: cardOut }}>
        <Card x={150} y={150} w={1620} h={170} start={4} border={C.green}>
          <div style={{ textAlign: 'center', fontSize: 60, fontWeight: 900, lineHeight: '150px' }}>longest side &lt; half the perimeter</div>
        </Card>
        <Eq x={960} y={340} center={900} tex={'\\text{because } a + b > c'} start={at(scene, 1, 0.55)} size={64} color={C.violet} />
        {steps.map((s, i) => (
          <div key={i} style={{ position: 'absolute', left: 200, top: 470 + i * 120, display: 'flex', alignItems: 'center', gap: 28, whiteSpace: 'nowrap', ...fadeUp(f, s.s) }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.primary, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
            <div style={{ fontSize: 56, fontWeight: 900 }}>{s.t}</div>
            {s.tex && <Tex tex={s.tex} size={52} color={C.muted} />}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', ...fadeUp(f, at(scene, 3, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 10 }}>Keep exploring!</div>
      </div>
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, '24'),
  rule: Rule,
  floor: Floor,
  list: List,
  total1: Total1,
  gaps: Gaps,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, '20'),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 5" /> : null;

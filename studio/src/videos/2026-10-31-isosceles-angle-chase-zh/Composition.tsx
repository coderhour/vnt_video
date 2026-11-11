import { staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeTo, fadeUp } from '../../lib/anim';
import { Explainer, at, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { PACIFICO, ZH_FONT } from '../../lib/fonts';
import { Countdown } from '../../lib/PauseCard';
import { Stage } from '../../lib/grid';
import { Tex } from '../../lib/Tex';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';
import { Answer, Check, Confetti, Pill, Text } from '../../lib/ui';

export const SLUG = '2026-10-31-isosceles-angle-chase-zh';
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

export const VA = C.violet; // top angle a, and angle DBC (they are equal)
export const VC = C.blue; // angle C, angle BDC, base angle ABC
export const VD = '#e08600'; // angle ABD (the given 24)
const PANEL = 900;

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
const ZH_LABEL = <span style={{ fontFamily: ZH_FONT }}>暂停，试一试<span style={{ color: C.primary }}>！</span></span>;

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const ca = (t: string) => col(VA, t);
const cc = (t: string) => col(VC, t);
const cd = (t: string) => col(VD, t);

// ---------------- geometry ----------------

type Pt = [number, number];
type Names = 'A' | 'B' | 'C' | 'D';
type Pts = Record<Names, Pt>;

/** Maths coordinates: B=(0,0), C=(2,0), A on the axis of symmetry, D on AC with BD=2; scaled so A is H px above B. */
const geo = (apex: number, bx: number, by: number, H: number) => {
  const h = Math.tan(((180 - apex) / 2) * (Math.PI / 180));
  const qa = 1 + h * h;
  const t = (h * h - 3) / qa; // t = 1 is the other root (D = C)
  const s = H / h;
  const m = (x: number, y: number): Pt => [bx + x * s, by - y * s];
  const P: Pts = { A: m(1, h), B: m(0, 0), C: m(2, 0), D: m(1 + t, h * (1 - t)) };
  return { P, s };
};

type Tick = { a: Names; b: Names; frac: number; n: number; op: number; flash?: number };
type Shade = { pts: Names[]; color: string; op: number };
type ArcS = { v: Names; p: Names; q: Names; rf: number; color: string; op: number; fill?: boolean; w?: number };
type Lab = { v: Names; p?: Names; q?: Names; ang?: number; rf: number; text: string; color: string; op: number; scale?: number; leader?: { ang: number; rf: number } };

const angOf = (V: Pt, Q: Pt) => (Math.atan2(-(Q[1] - V[1]), Q[0] - V[0]) * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;
const polar = (V: Pt, a: number, r: number): Pt => [V[0] + r * Math.cos(rad(a)), V[1] - r * Math.sin(rad(a))];
const span = (a1: number, a2: number) => ((((a2 - a1) % 360) + 540) % 360) - 180;

const LETTER_OFF: Record<Names, Pt> = { A: [-44, 4], B: [-42, 24], C: [42, 24], D: [40, -6] };

export const Fig: React.FC<{
  apex?: number; bx: number; by: number; H?: number;
  shades?: Shade[]; ticks?: Tick[]; arcs?: ArcS[]; labels?: Lab[]; op?: number; pulseD?: number;
}> = ({ apex = 44, bx, by, H = 650, shades = [], ticks = [], arcs = [], labels = [], op = 1, pulseD = 0 }) => {
  const { P, s } = geo(apex, bx, by, H);
  const line = (a: Names, b: Names, w: number) => <line x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke={C.ink} strokeWidth={w} strokeLinecap="round" />;
  return (
    <Stage>
      <g opacity={op}>
        {shades.map((sh, i) => sh.op > 0 && <polygon key={i} points={sh.pts.map((n) => P[n].join(',')).join(' ')} fill={sh.color} opacity={sh.op} />)}
        {line('A', 'B', 7)}
        {line('A', 'C', 7)}
        {line('B', 'C', 7)}
        {line('B', 'D', 6)}
        {arcs.map((a, i) => {
          if (a.op <= 0) return null;
          const V = P[a.v];
          const a1 = angOf(V, P[a.p]);
          const d = span(a1, angOf(V, P[a.q]));
          const r = a.rf * s;
          const pts = Array.from({ length: 25 }, (_, k) => polar(V, a1 + (d * k) / 24, r));
          const path = pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
          return (
            <g key={i} opacity={a.op}>
              {a.fill !== false && <path d={`M${V[0]} ${V[1]} ${path.replace('M', 'L')} Z`} fill={a.color} opacity={0.2} />}
              <path d={path} fill="none" stroke={a.color} strokeWidth={a.w ?? 9} strokeLinecap="round" />
            </g>
          );
        })}
        {ticks.map((t, i) => {
          if (t.op <= 0) return null;
          const A = P[t.a];
          const B = P[t.b];
          const cx = A[0] + (B[0] - A[0]) * t.frac;
          const cy = A[1] + (B[1] - A[1]) * t.frac;
          const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
          const ux = (B[0] - A[0]) / L;
          const uy = (B[1] - A[1]) / L;
          const nx = -uy;
          const ny = ux;
          const fl = t.flash ?? 0;
          const half = 17 * (1 + 0.7 * fl);
          return (
            <g key={i} opacity={t.op} stroke={fl > 0.05 ? C.primary : C.ink} strokeWidth={7 + 4 * fl} strokeLinecap="round">
              {Array.from({ length: t.n }, (_, k) => {
                const off = (k - (t.n - 1) / 2) * 17;
                const px = cx + ux * off;
                const py = cy + uy * off;
                return <line key={k} x1={px - nx * half} y1={py - ny * half} x2={px + nx * half} y2={py + ny * half} />;
              })}
            </g>
          );
        })}
        {pulseD > 0 && <circle cx={P.D[0]} cy={P.D[1]} r={14 + 26 * pulseD} fill="none" stroke={C.primary} strokeWidth={7} opacity={1 - pulseD * 0.5} />}
        {(['A', 'B', 'C', 'D'] as Names[]).map((n) => (
          <g key={n}>
            <circle cx={P[n][0]} cy={P[n][1]} r={8} fill={C.ink} />
            <text x={P[n][0] + LETTER_OFF[n][0]} y={P[n][1] + LETTER_OFF[n][1]} fontSize={54} fontWeight={900} textAnchor="middle" fill={C.ink} dominantBaseline="central">
              {n}
            </text>
          </g>
        ))}
        {labels.map((l, i) => {
          if (l.op <= 0 || !l.text) return null;
          const V = P[l.v];
          const a = l.ang ?? angOf(V, P[l.p!]) + span(angOf(V, P[l.p!]), angOf(V, P[l.q!])) / 2;
          const pos = polar(V, a, l.rf * s);
          const sc = l.scale ?? 1;
          const lead = l.leader ? [polar(V, l.leader.ang, l.leader.rf * s), pos] : null;
          return (
            <g key={i} opacity={l.op}>
              {lead && <line x1={lead[0][0]} y1={lead[0][1]} x2={lead[1][0]} y2={lead[1][1]} stroke={l.color} strokeWidth={4} />}
              <text
                x={pos[0]} y={pos[1]} fontSize={54} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={l.color}
                stroke={C.bg} strokeWidth={9} paintOrder="stroke" strokeLinejoin="round"
                transform={`translate(${pos[0]} ${pos[1]}) scale(${sc}) translate(${-pos[0]} ${-pos[1]})`}
              >
                {l.text}
              </text>
            </g>
          );
        })}
      </g>
    </Stage>
  );
};

// ---- standard pieces ----
export const arcA = (op: number): ArcS => ({ v: 'A', p: 'B', q: 'C', rf: 0.45, color: VA, op });
const arcDBC = (op: number): ArcS => ({ v: 'B', p: 'D', q: 'C', rf: 0.38, color: VA, op });
export const arcABD = (op: number): ArcS => ({ v: 'B', p: 'A', q: 'D', rf: 0.38, color: VD, op });
export const arcB = (op: number): ArcS => ({ v: 'B', p: 'A', q: 'C', rf: 0.56, color: VC, op, fill: false });
export const arcC = (op: number): ArcS => ({ v: 'C', p: 'B', q: 'A', rf: 0.4, color: VC, op });
export const arcBDC = (op: number): ArcS => ({ v: 'D', p: 'B', q: 'C', rf: 0.3, color: VC, op });

export const labA = (text: string, op: number, scale = 1): Lab => ({ v: 'A', p: 'B', q: 'C', rf: 1.0, text, color: VA, op, scale });
const labDBC = (text: string, op: number, scale = 1): Lab => ({ v: 'B', p: 'D', q: 'C', rf: 0.88, text, color: VA, op, scale });
export const labABD = (text: string, op: number, scale = 1): Lab => ({ v: 'B', p: 'A', q: 'D', rf: 1.4, text, color: VD, op, scale });
export const labB = (text: string, op: number): Lab => ({ v: 'B', ang: 100, rf: 0.85, text, color: VC, op, leader: { ang: 66, rf: 0.56 } });
export const labC = (text: string, op: number): Lab => ({ v: 'C', ang: 160, rf: 0.85, text, color: VC, op });
export const labD = (text: string, op: number): Lab => ({ v: 'D', p: 'B', q: 'C', rf: 0.62, text, color: VC, op });

export const pulse = (f: number, start: number, dur = 30) => Math.sin(Math.PI * Math.min(1, Math.max(0, (f - start) / dur)));

const FB: Pt = [150, 800];

// ---------------- panel helpers ----------------

const Eq: React.FC<{ x?: number; y: number; start: number; tex: string | Part[]; size?: number }> = ({ x = PANEL, y, start, tex, size = 56 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Z p={tex} size={size} />
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; start: number; color: string; children: React.ReactNode; size?: number }> = ({ x, y, start, color, children, size = 42 }) => {
  const f = useCurrentFrame();
  return (
    <Pill x={x} y={y} color={color} style={{ ...fadeUp(f, start), fontSize: size, whiteSpace: 'nowrap' }}>
      {children}
    </Pill>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; start: number; color?: string; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ x, y, w, start, color = C.violet, children, size = 42, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 22, borderLeft: `12px solid ${color}`, padding: '12px 28px', fontSize: size, fontWeight: 800, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', ...fadeUp(f, start), ...style }}>
      {children}
    </div>
  );
};

const QBox: React.FC<{ x: number; y: number; w: number; size?: number; children: React.ReactNode; op?: number }> = ({ x, y, w, size = 44, children, op = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, background: C.card, borderRadius: 30, padding: '26px 40px', minHeight: 330, fontSize: size, fontWeight: 600, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', opacity: op }}>
    {children}
  </div>
);

export const tickSet = (f: number, scene: { frames: number }, t1: number, t2: number): Tick[] => [
  { a: 'A', b: 'B', frac: 0.22, n: 1, op: ease(f, t1, 8), flash: pulse(f, t1) },
  { a: 'A', b: 'C', frac: 0.22, n: 1, op: ease(f, t1, 8), flash: pulse(f, t1) },
  { a: 'B', b: 'D', frac: 0.5, n: 2, op: ease(f, t2, 8), flash: pulse(f, t2) },
  { a: 'B', b: 'C', frac: 0.5, n: 2, op: ease(f, t2, 8), flash: pulse(f, t2) },
];
const ON = 0; // ticks already on: start frame 0, never flashing (flash is 0 after dur)
export const allTicks = (f: number): Tick[] => tickSet(f, { frames: 0 }, -100, -100);

// ---------------- scenes ----------------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = at(scene, 0, 0.12);
  const glow = 1 + 0.18 * pulse(f, g, 40);
  return (
    <>
      <Fig
        bx={FB[0]} by={FB[1]}
        ticks={tickSet(f, scene, at(scene, 1, 0.1), at(scene, 1, 0.55))}
        arcs={[arcABD(ease(f, g, 10))]}
        labels={[labABD('24°', ease(f, g, 10), glow), labA('?', ease(f, at(scene, 0, 0.6), 10))]}
        op={ease(f, 2, 14)}
      />
      <div style={{ position: 'absolute', left: PANEL, top: 190, ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <div style={{ fontSize: 120, fontWeight: 900 }}>
          <span style={{ color: VD }}>24°</span> <span style={{ color: C.muted }}>→</span> <span style={{ color: VA }}>?</span>
        </div>
        <div style={{ fontSize: 50, fontWeight: 800, color: C.muted, marginTop: 4 }}>求顶上的角</div>
      </div>
      <Pill x={PANEL} y={470} color={C.primary} style={{ ...fadeUp(f, at(scene, 1, 0.1)), fontSize: 46 }}>等腰：AB = AC</Pill>
      <Pill x={PANEL} y={570} color={C.violet} style={{ ...fadeUp(f, at(scene, 1, 0.55)), fontSize: 46 }}>等腰：BD = BC</Pill>
      <div style={{ position: 'absolute', left: PANEL, top: 680, ...fadeUp(f, at(scene, 2, 0.25)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 110, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.muted, marginTop: -6 }}>你的数学小导师</div>
      </div>
    </>
  );
};

export const CHOICES = ['22°', '24°', '34°', '36°', '44°'];

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  const t1 = at(scene, 1, 0.55);
  const t2 = at(scene, 2, 0.5);
  return (
    <>
      <QBox x={70} y={140} w={900} op={ease(f, at(scene, 0, 0.5), 10)}>
        <span style={s(1)}>在三角形 ABC 中，边 AB 等于边 AC。</span>
        <span style={s(2)}>点 D 在边 AC 上，并且 BD 等于 BC。</span>
        <span style={s(3)}>角 ABD 是 24°。</span>
        <span style={s(4)}>角 BAC（顶上的角）是多少度？</span>
      </QBox>
      <div style={{ position: 'absolute', left: 70, top: 660, display: 'flex', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, at(scene, 5, 0.1 + i * 0.13), 10), background: C.card, borderRadius: 18, padding: '12px 22px', fontSize: 46, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <span style={{ color: C.muted, fontSize: 32, marginRight: 10 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Fig
        bx={1130} by={FB[1]}
        ticks={tickSet(f, scene, t1, t2)}
        arcs={[arcABD(ease(f, at(scene, 3, 0.45), 10))]}
        labels={[labABD('24°', ease(f, at(scene, 3, 0.45), 10)), labA('?', ease(f, at(scene, 4, 0.6), 10))]}
        pulseD={pulse(f, at(scene, 2, 0.15), 40)}
      />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Fig
        bx={FB[0]} by={FB[1]}
        shades={[
          { pts: ['A', 'B', 'C'], color: C.primarySoft, op: ease(f, at(scene, 0, 0.4), 14) },
          { pts: ['B', 'D', 'C'], color: 'rgba(123, 97, 255, 0.28)', op: ease(f, at(scene, 1, 0.3), 14) },
        ]}
        ticks={allTicks(f)}
        arcs={[arcABD(1)]}
        labels={[labABD('24°', 1), labA('?', ease(f, at(scene, 2, 0.4), 10))]}
      />
      <Tag x={PANEL} y={200} start={at(scene, 0, 0.5)} color={C.primary} size={50}>等腰：AB = AC</Tag>
      <Text x={PANEL} y={300} w={900} size={44} weight={700} color={C.muted} style={fadeUp(f, at(scene, 0, 0.7))}>从 A 出发的两条边相等</Text>
      <Tag x={PANEL} y={400} start={at(scene, 1, 0.4)} color={C.violet} size={50}>等腰：BD = BC</Tag>
      <Text x={PANEL} y={500} w={900} size={44} weight={700} color={C.muted} style={fadeUp(f, at(scene, 1, 0.65))}>从 B 出发的两条边相等</Text>
      <Tag x={PANEL} y={620} start={at(scene, 2, 0.35)} color={C.green} size={54}>目标：A 处的角</Tag>
    </>
  );
};

const Pause: React.FC<{ scene: Parameters<SceneComponent>[0]['scene']; apex: number; q: React.ReactNode; seconds: number }> = ({ scene, apex, q, seconds }) => {
  const f = useCurrentFrame();
  const v = apex !== 44;
  return (
    <>
      <Fig
        apex={apex} bx={FB[0] - 40} by={FB[1]} H={v ? 650 : 650}
        ticks={allTicks(f)}
        arcs={[arcABD(1)]}
        labels={[labABD(v ? '30°' : '24°', 1), labA('?', 1)]}
      />
      <QBox x={690} y={190} w={700} size={42} op={ease(f, 6, 10)}>{q}</QBox>
      <Countdown scene={scene} seconds={seconds} x={1670} y={500} tick={TICK} label={ZH_LABEL} />
    </>
  );
};

const Pause1: SceneComponent = ({ scene }) => (
  <Pause scene={scene} apex={44} seconds={10} q={<>在三角形 ABC 中，AB = AC。点 D 在 AC 上，BD = BC。角 ABD 是 24°。角 BAC 是多少度？</>} />
);
const Pause2: SceneComponent = ({ scene }) => (
  <Pause scene={scene} apex={40} seconds={10} q={<>同样的图：AB = AC，BD = BC。角 ABD 是 30°。顶角是多少度？</>} />
);

const Big: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1, 0.1);
  return (
    <>
      <Fig
        bx={FB[0]} by={FB[1]}
        ticks={allTicks(f).map((t, i) => (i < 2 ? { ...t, flash: pulse(f, l1) } : t))}
        arcs={[arcABD(1), arcA(ease(f, at(scene, 0, 0.6), 10)), arcB(ease(f, at(scene, 1, 0.5), 12)), arcC(ease(f, at(scene, 1, 0.7), 12))]}
        labels={[labABD('24°', 1), labA(f < at(scene, 0, 0.6) ? '?' : 'a', 1), labB('C', ease(f, at(scene, 2, 0.05), 10)), labC('C', ease(f, at(scene, 2, 0.05), 10))]}
      />
      <Eq y={160} start={at(scene, 0, 0.6)} tex={[z('顶角'), `= ${ca('a')}`]} />
      <Eq y={260} start={at(scene, 1, 0.5)} tex={[z('底角相等：'), cc('C')]} />
      <Eq y={380} start={at(scene, 2, 0.05)} tex={`${ca('a')} + ${cc('C')} + ${cc('C')} = 180`} />
      <Eq y={480} start={at(scene, 2, 0.4)} tex={`2${cc('C')} = 180 - ${ca('a')}`} />
      <Eq y={590} start={at(scene, 2, 0.7)} tex={`${cc('C')} = 90 - \\dfrac{${ca('a')}}{2}`} />
    </>
  );
};

const Small: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const aha = at(scene, 3, 0.15);
  const sc = 1 + 0.35 * pulse(f, aha, 36);
  const eq = ease(f, at(scene, 2, 0.75), 10);
  return (
    <>
      <Fig
        bx={FB[0]} by={FB[1]}
        shades={[{ pts: ['B', 'D', 'C'], color: 'rgba(60, 131, 246, 0.14)', op: ease(f, at(scene, 0, 0.1), 12) }]}
        ticks={allTicks(f).map((t, i) => (i >= 2 ? { ...t, flash: pulse(f, at(scene, 0, 0.1)) } : t))}
        arcs={[arcABD(1), arcA(1), arcC(1), arcBDC(ease(f, at(scene, 0, 0.45), 10)), arcDBC(ease(f, at(scene, 1, 0.5), 10))]}
        labels={[labABD('24°', 1), labA('a', 1, sc), labC('C', 1), labD('C', ease(f, at(scene, 0, 0.5), 10)), labDBC('a', eq, sc)]}
      />
      <Eq y={135} start={2} tex={`${cc('C')} = 90 - \\dfrac{${ca('a')}}{2}`} />
      <Eq y={280} start={at(scene, 0, 0.45)} tex={`\\angle BDC = ${cc('C')}`} />
      <Eq y={385} start={at(scene, 1, 0.35)} tex={`\\angle DBC = 180 - ${cc('C')} - ${cc('C')}`} />
      <Eq y={490} start={at(scene, 2, 0.1)} tex={`${cc('C')} + ${cc('C')} = 180 - ${ca('a')}`} />
      <Eq y={595} start={at(scene, 2, 0.5)} tex={`\\angle DBC = 180 - (180 - ${ca('a')}) = ${ca('a')}`} />
      <Tag x={PANEL} y={725} start={at(scene, 3, 0.1)} color={VA} size={48}>同一个角！</Tag>
    </>
  );
};

const Solve: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l3 = at(scene, 3, 0.3);
  const l4 = at(scene, 4, 0.05);
  const done = at(scene, 3, 0.88);
  const sixtyEight = f >= l4;
  const fortyFour = f >= l3;
  return (
    <>
      <Fig
        bx={FB[0]} by={FB[1]}
        ticks={allTicks(f)}
        arcs={[arcABD(1), arcA(1), arcDBC(1), arcC(1), arcB(ease(f, at(scene, 0, 0.3), 12))]}
        labels={[
          labABD('24°', 1),
          labA(fortyFour ? '44°' : 'a', 1),
          labDBC(fortyFour ? '44°' : 'a', 1),
          labC(sixtyEight ? '68°' : 'C', 1),
          labB(sixtyEight ? '68°' : f < at(scene, 1, 0.1) ? '' : 'C', ease(f, at(scene, 1, 0.1), 10)),
        ]}
      />
      <Eq y={140} start={at(scene, 0, 0.35)} tex={`\\angle ABC = ${cd('24')} + ${ca('a')}`} />
      <Eq y={245} start={at(scene, 1, 0.5)} tex={`${cd('24')} + ${ca('a')} = 90 - \\dfrac{${ca('a')}}{2}`} />
      <Eq y={355} start={at(scene, 2, 0.05)} tex={`${ca('a')} + \\dfrac{${ca('a')}}{2} = 90 - ${cd('24')}`} />
      <Eq y={475} start={at(scene, 2, 0.72)} tex={`1\\dfrac{1}{2}\\,${ca('a')} = 66`} />
      <Eq y={615} start={l3} tex={`${ca('a')} = ${col(C.green, '44°')}`} size={66} />
      <Check x={PANEL} y={745} start={at(scene, 4, 0.55)}>
        <Tex tex={`${cc('C')} = 68^\\circ,\\ 68 - 44 = 24\\ \\checkmark`} size={52} />
      </Check>
      <Answer x={1730} y={330} value="44°" start={done} chime={CHIME} />
      <Confetti x={1730} y={330} start={done} seed={5} />
      <Pill x={1590} y={480} color={C.green} style={{ ...fadeUp(f, at(scene, 3, 0.6)), fontSize: 46 }}>选项 E</Pill>
    </>
  );
};

const Exterior: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hl = (i: number) => ease(f, at(scene, i, 0.3), 12);
  const e = pulse(f, at(scene, 1, 0.3), 70);
  const l3 = at(scene, 3, 0.1);
  return (
    <>
      <Fig
        bx={FB[0]} by={FB[1]}
        shades={[{ pts: ['A', 'B', 'D'], color: 'rgba(245, 159, 10, 0.18)', op: hl(0) }]}
        ticks={allTicks(f)}
        arcs={[arcABD(1), arcA(1), arcBDC(ease(f, at(scene, 0, 0.7), 10)), arcB(ease(f, l3 + 20, 12)), arcC(ease(f, l3 + 6, 12))]}
        labels={[
          labABD('24°', 1, 1 + 0.25 * e),
          labA('a', 1, 1 + 0.25 * e),
          labD('a+24', ease(f, at(scene, 2, 0.35), 10)),
          labC('a+24', ease(f, l3 + 6, 10)),
          labB('a+24', ease(f, l3 + 20, 10)),
        ]}
      />
      <Card x={PANEL} y={140} w={980} start={at(scene, 1, 0.15)} size={44} style={{ whiteSpace: 'nowrap' }}>
        外角 = 和它不相邻的两个内角之和
      </Card>
      <Eq y={300} start={at(scene, 2, 0.3)} tex={`\\angle BDC = ${ca('a')} + ${cd('24')}`} />
      <Eq y={400} start={at(scene, 4, 0.05)} tex={`(${cc('a+24')}) + (${cc('a+24')}) + ${ca('a')} = 180`} />
      <Eq y={500} start={at(scene, 4, 0.55)} tex={'3a + 48 = 180'} />
      <Eq y={600} start={at(scene, 5, 0.1)} tex={'3a = 132'} />
      <Eq y={700} start={at(scene, 5, 0.6)} tex={`a = ${col(C.green, '44')}`} size={62} />
      <Tag x={1300} y={605} start={at(scene, 6, 0.3)} color={C.primary} size={44}>不用分数！</Tag>
    </>
  );
};

type TRow = { letter: string; a: string; base: string; diff: string; ok: boolean };
const TROWS: TRow[] = [
  { letter: 'B', a: '24', base: '78', diff: '54', ok: false },
  { letter: 'D', a: '36', base: '72', diff: '36', ok: false },
  { letter: 'A', a: '22', base: '79', diff: '57', ok: false },
  { letter: 'C', a: '34', base: '73', diff: '39', ok: false },
  { letter: 'E', a: '44', base: '68', diff: '24', ok: true },
];
const TW = [280, 300, 480];
const TX = 70;
const TY = 250;
const TH = 84;

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const xs = TW.reduce<number[]>((a, w, i) => [...a, a[i] + w], [TX]);
  // [a cell, base cell, diff cell] start frames per row
  const T: number[][] = [
    [at(scene, 4, 0.1), at(scene, 5, 0.1), at(scene, 5, 0.6)],
    [at(scene, 6, 0.4), at(scene, 7, 0.25), at(scene, 7, 0.75)],
    [at(scene, 8, 0.05), at(scene, 8, 0.18), at(scene, 8, 0.32)],
    [at(scene, 8, 0.45), at(scene, 8, 0.58), at(scene, 8, 0.72)],
    [at(scene, 9, 0.1), at(scene, 9, 0.35), at(scene, 9, 0.75)],
  ];
  const cell = (r: number, c: number, text: React.ReactNode, color: string, start: number) => (
    <div key={`${r}-${c}`} style={{ position: 'absolute', left: xs[c], top: TY + TH * (r + 1), width: TW[c], height: TH, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 900, color, whiteSpace: 'nowrap', ...fadeUp(f, start, 10) }}>
      {text}
    </div>
  );
  const chipOp = ease(f, at(scene, 0, 0.55), 10);
  const goalOp = ease(f, at(scene, 1, 0.1), 10);
  return (
    <>
      <Card x={TX} y={120} w={920} start={at(scene, 0, 0.55)} color={VD} size={44} style={{ opacity: chipOp * fadeTo(f, at(scene, 1, 0.1), 0, 8) }}>
        <span style={{ color: C.muted, fontSize: 34, marginRight: 12 }}>B</span>24° 是题目给的角 ABD
      </Card>
      <Card x={TX} y={120} w={920} start={at(scene, 1, 0.1)} color={VA} size={44} style={{ opacity: goalOp }}>
        题目要求的是顶角 BAC
      </Card>
      <div style={{ position: 'absolute', left: TX, top: TY, width: xs[3] - TX, height: TH, display: 'flex', opacity: ease(f, at(scene, 2, 0.45), 12), borderBottom: `5px solid ${C.line}` }}>
        {['顶角 a', '底角 C', '∠ABD = C − a（要等于 24）'].map((h, i) => (
          <div key={h} style={{ width: TW[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap' }}>{h}</div>
        ))}
      </div>
      {TROWS.map((r, i) => {
        const color = r.ok ? C.green : C.red;
        const bg = ease(f, T[i][2], 10);
        return (
          <div key={r.letter}>
            <div style={{ position: 'absolute', left: TX - 12, top: TY + TH * (i + 1) + 6, width: xs[3] - TX + 24, height: TH - 12, borderRadius: 20, background: r.ok ? 'rgba(33,196,93,0.14)' : 'rgba(239,67,67,0.09)', opacity: bg }} />
            {cell(i, 0, <><span style={{ color: C.muted, fontSize: 34, marginRight: 14 }}>{r.letter}</span><span style={{ color: VA }}>{r.a}°</span></>, C.ink, T[i][0])}
            {cell(i, 1, <span style={{ color: VC }}>{r.base}°</span>, C.ink, T[i][1])}
            {cell(i, 2, `${r.diff}° ${r.ok ? '✓' : '✗'}`, color, T[i][2])}
          </div>
        );
      })}
      <Fig
        bx={1240} by={770} H={470}
        ticks={allTicks(f)}
        arcs={[arcABD(ease(f, at(scene, 0, 0.55), 10))]}
        labels={[labABD('24°', ease(f, at(scene, 0, 0.55), 10)), labA('?', ease(f, at(scene, 1, 0.1), 10))]}
        op={ease(f, at(scene, 0, 0.3), 12)}
      />
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const s = (i: number) => ({ opacity: ease(f, at(scene, i), 10) });
  return (
    <>
      <Fig
        apex={40} bx={FB[0]} by={FB[1]}
        ticks={tickSet(f, scene, at(scene, 0, 0.35), at(scene, 0, 0.65))}
        arcs={[arcABD(ease(f, at(scene, 1, 0.5), 10))]}
        labels={[labABD('30°', ease(f, at(scene, 1, 0.5), 10)), labA('?', ease(f, at(scene, 1, 0.8), 10))]}
      />
      <Pill x={PANEL} y={150} color={C.violet} style={{ ...fadeUp(f, 4), fontSize: 44 }}>轮到你</Pill>
      <QBox x={PANEL} y={260} w={900} size={46} op={ease(f, 6, 10)}>
        <span style={s(0)}>同样的图：AB = AC，BD = BC。</span>
        <span style={s(1)}>角 ABD 是 30°。顶角是多少度？</span>
      </QBox>
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const done = at(scene, 3, 0.9);
  const l4 = at(scene, 4, 0.05);
  const c = f >= l4;
  const big = f >= at(scene, 3, 0.45);
  return (
    <>
      <Fig
        apex={40} bx={FB[0]} by={FB[1]}
        ticks={allTicks(f)}
        arcs={[arcABD(1), arcA(1), arcBDC(ease(f, at(scene, 0, 0.5), 10)), arcC(ease(f, at(scene, 1, 0.3), 10)), arcB(ease(f, at(scene, 1, 0.5), 12))]}
        labels={[
          labABD('30°', 1),
          labA(big ? '40°' : 'a', 1),
          labD(c ? '70°' : 'a+30', ease(f, at(scene, 0, 0.55), 10)),
          labC(c ? '70°' : 'a+30', ease(f, at(scene, 1, 0.3), 10)),
          labB(c ? '70°' : 'a+30', ease(f, at(scene, 1, 0.5), 10)),
        ]}
      />
      <Eq y={140} start={at(scene, 0, 0.5)} tex={`\\angle BDC = ${ca('a')} + ${cd('30')}`} />
      <Eq y={240} start={at(scene, 1, 0.45)} tex={`\\angle C = \\angle ABC = ${cc('a+30')}`} />
      <Eq y={340} start={at(scene, 2, 0.05)} tex={`(${cc('a+30')}) + (${cc('a+30')}) + ${ca('a')} = 180`} size={52} />
      <Eq y={440} start={at(scene, 2, 0.45)} tex={'3a + 60 = 180'} />
      <Eq y={540} start={at(scene, 2, 0.75)} tex={'3a = 120'} />
      <Eq y={640} start={at(scene, 3, 0.45)} tex={`a = ${col(C.green, '40°')}`} size={64} />
      <Check x={PANEL} y={745} start={at(scene, 4, 0.5)}>
        <Tex tex={'70 - 40 = 30\\ \\checkmark'} size={52} />
      </Check>
      <Answer x={1740} y={640} value="40°" start={done} chime={CHIME} />
      <Confetti x={1740} y={640} start={done} seed={9} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const out = fadeTo(f, at(scene, 3), 0, 12);
  const sc = 1 + 0.35 * pulse(f, at(scene, 2, 0.5), 36);
  return (
    <>
      <div style={{ opacity: out }}>
        <Fig
          bx={FB[0]} by={FB[1]}
          shades={[
            { pts: ['A', 'B', 'C'], color: C.primarySoft, op: ease(f, at(scene, 1, 0.1), 14) },
            { pts: ['B', 'D', 'C'], color: 'rgba(123, 97, 255, 0.28)', op: ease(f, at(scene, 1, 0.1), 14) },
          ]}
          ticks={allTicks(f)}
          arcs={[arcB(ease(f, at(scene, 1, 0.5), 12)), arcC(ease(f, at(scene, 1, 0.6), 12)), arcA(ease(f, at(scene, 2, 0.4), 10)), arcDBC(ease(f, at(scene, 2, 0.4), 10))]}
          labels={[labA('a', ease(f, at(scene, 2, 0.4), 10), sc), labDBC('a', ease(f, at(scene, 2, 0.4), 10), sc)]}
        />
        <Text x={PANEL} y={150} w={900} size={56} weight={900} color={C.primary} style={fadeUp(f, at(scene, 0, 0.3))}>核心思路</Text>
        <Card x={PANEL} y={260} w={900} start={at(scene, 1, 0.2)} color={C.primary} size={46}>等边对等角</Card>
        <Card x={PANEL} y={420} w={900} start={at(scene, 2, 0.1)} color={C.violet} size={46}>给未知的角起名字，一路追下去</Card>
      </div>
      <SignOff start={at(scene, 3, 0.1)} text="多多练习！" tagline="你的家庭 AI 教练" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.2)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: Pause1,
  big: Big,
  small: Small,
  solve: Solve,
  exterior: Exterior,
  traps: Traps,
  variant: Variant,
  try2: Pause2,
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8 风格 · 第4级" font={ZH_FONT} /> : null;

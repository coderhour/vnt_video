import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../lib/anim';
import { Explainer, at, type Scene, type SceneComponent, type Timeline } from '../../lib/Explainer';
import { Countdown } from '../../lib/PauseCard';
import { Stage, type Pt } from '../../lib/grid';
import { NUNITO, PACIFICO } from '../../lib/fonts';
import { Tex } from '../../lib/Tex';
import { Check, Confetti, Pill, Text } from '../../lib/ui';
import { SignOff } from '../../lib/Brand';
import { C } from '../../lib/theme';

export const SLUG = '2026-10-30-equilateral-angle-chase';
export const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`); // Freesound CC0, see sfx/FREESOUND-CREDITS.md
export const TICK = staticFile(`${SLUG}/sfx/fs-668355.mp3`);

// ---------- geometry: bank SVG coordinates (viewBox 291x260, y down) scaled to pixels ----------
type G = { A: Pt; B: Pt; C: Pt; D: Pt; E: Pt };
const S = 2.9;
const OX = 120;
const OY = 180;
const P = (X: number, Y: number): Pt => [OX + (X - 30) * S, OY + (Y - 30) * S];
const mkG = (dx: number, ex: number, ey: number): G => ({ A: P(145.5, 30), B: P(30, 230), C: P(260.9, 230), D: P(dx, 230), E: P(ex, ey) });
export const G1 = mkG(110.2, 247, 205.9); // BAD = 20
const G2 = mkG(166.5, 246, 204.2); // BAD = 36

export const GIVEN = C.primary;
export const DERIVED = C.violet;
export const ANSWER = C.green;
export const TRAP = C.red;

const add = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy];
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export const Label: React.FC<{ p: Pt; text: string; color?: string; size?: number; opacity?: number }> = ({ p, text, color = C.ink, size = 48, opacity = 1 }) =>
  opacity <= 0 ? null : (
    <text x={p[0]} y={p[1]} fill={color} opacity={opacity} fontFamily={NUNITO} fontWeight={900} fontSize={size} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={9}>
      {text}
    </text>
  );

type Ang = { v: Pt; p: Pt; q: Pt; r: number; color: string; op: number; label?: string; lr?: number; at?: Pt; leader?: boolean; width?: number; size?: number };

/** Angle arc at v between the rays to p and q, with an optional label on the bisector (or at v + `at`). */
const AngleMark: React.FC<{ a: Ang }> = ({ a }) => {
  if (a.op <= 0) return null;
  const a1 = Math.atan2(a.p[1] - a.v[1], a.p[0] - a.v[0]);
  const a2 = Math.atan2(a.q[1] - a.v[1], a.q[0] - a.v[0]);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const m = a1 + d / 2;
  const pt = (ang: number, r: number): Pt => [a.v[0] + r * Math.cos(ang), a.v[1] + r * Math.sin(ang)];
  const s = pt(a1, a.r);
  const e = pt(a2, a.r);
  const lp: Pt = a.at ? add(a.v, a.at[0], a.at[1]) : pt(m, a.lr ?? a.r + 80);
  const am = pt(m, a.r);
  return (
    <g opacity={a.op}>
      <path d={`M ${s[0]} ${s[1]} A ${a.r} ${a.r} 0 0 ${d > 0 ? 1 : 0} ${e[0]} ${e[1]}`} fill="none" stroke={a.color} strokeWidth={a.width ?? 8} strokeLinecap="round" />
      {a.leader && <line x1={am[0]} y1={am[1]} x2={lp[0]} y2={lp[1] - 24} stroke={a.color} strokeWidth={4} strokeLinecap="round" />}
      {a.label && <Label p={lp} text={a.label} color={a.color} size={a.size ?? 48} />}
    </g>
  );
};

type Shade = { pts: Pt[]; color: string; op: number };
type Hl = { a: Pt; b: Pt; color: string; op: number; w?: number; dashed?: boolean };

const Tick2: React.FC<{ a: Pt; b: Pt; op: number }> = ({ a, b, op }) => {
  if (op <= 0) return null;
  const m = mid(a, b);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u: Pt = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  const n: Pt = [-u[1], u[0]];
  return (
    <g opacity={op} stroke={C.ink} strokeWidth={6} strokeLinecap="round">
      {[-9, 9].map((k) => (
        <line key={k} x1={m[0] + u[0] * k - n[0] * 15} y1={m[1] + u[1] * k - n[1] * 15} x2={m[0] + u[0] * k + n[0] * 15} y2={m[1] + u[1] * k + n[1] * 15} />
      ))}
    </g>
  );
};

const line = (a: Pt, b: Pt, progress: number, width: number, color = C.ink) => (
  <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
);

/** The figure: triangle ABC, AD, DE, optional ticks, shades, angle marks and highlights. */
export const Fig: React.FC<{ g: G; draw?: number; dots?: number; ticks?: number; shades?: Shade[]; angs?: Ang[]; hls?: Hl[]; letters?: number }> = ({
  g, draw = 1, dots = 1, ticks = 0, shades = [], angs = [], hls = [], letters = 1,
}) => {
  const { A, B, C: Cc, D, E } = g;
  return (
    <>
      {shades.map((s, i) => (s.op > 0 ? <path key={i} d={`M ${s.pts.map((p) => p.join(' ')).join(' L ')} Z`} fill={s.color} opacity={0.2 * s.op} /> : null))}
      {line(A, B, draw, 6)}
      {line(B, Cc, draw, 6)}
      {line(Cc, A, draw, 6)}
      <g opacity={dots}>
        <circle cx={D[0]} cy={D[1]} r={9} fill={C.ink} />
        <circle cx={E[0]} cy={E[1]} r={9} fill={C.ink} />
      </g>
      {line(A, D, dots, 6)}
      {line(D, E, dots, 6)}
      {hls.map((h, i) => (h.op > 0 ? <line key={i} x1={h.a[0]} y1={h.a[1]} x2={h.b[0]} y2={h.b[1]} stroke={h.color} strokeWidth={h.w ?? 14} strokeLinecap="round" opacity={h.op} strokeDasharray={h.dashed ? '4 26' : undefined} /> : null))}
      <Tick2 a={A} b={D} op={ticks} />
      <Tick2 a={A} b={E} op={ticks} />
      {angs.map((a, i) => (
        <AngleMark key={i} a={a} />
      ))}
      <Label p={add(A, 0, -46)} text="A" size={52} opacity={letters} />
      <Label p={add(B, -40, 38)} text="B" size={52} opacity={letters} />
      <Label p={add(Cc, 40, 38)} text="C" size={52} opacity={letters} />
      <Label p={add(D, -6, 52)} text="D" size={52} opacity={dots * letters} />
      <Label p={add(E, 46, -12)} text="E" size={52} opacity={dots * letters} />
    </>
  );
};

// ---------- named angles (positions tuned for the bank figure; reused for the variant) ----------
const a = (g: G, v: keyof G, p: keyof G, q: keyof G, o: Partial<Ang> & { color: string; op: number }): Ang => ({ v: g[v], p: g[p], q: g[q], r: 120, ...o });
export const angBAD = (g: G, o: { color: string; op: number; label?: string; r?: number }): Ang => a(g, 'A', 'B', 'D', { r: 170, lr: 240, ...o });
export const angDAE = (g: G, o: { color: string; op: number; label?: string; r?: number }): Ang => a(g, 'A', 'D', 'E', { r: 190, lr: g === G2 ? 330 : 270, ...o });
export const angA60 = (g: G, o: { color: string; op: number; label?: string }): Ang => a(g, 'A', 'B', 'C', { r: 110, at: [25, 150], ...o });
export const angB60 = (g: G, o: { color: string; op: number; label?: string }): Ang => a(g, 'B', 'A', 'C', { r: 100, lr: 150, ...o });
const angC60 = (g: G, o: { color: string; op: number; label?: string; side?: boolean }): Ang => a(g, 'C', 'A', 'B', { r: 60, at: [120, -5], ...o });
export const angADE = (g: G, o: { color: string; op: number; label?: string; r?: number }): Ang => a(g, 'D', 'A', 'E', { r: g === G2 ? 100 : 130, lr: g === G2 ? 130 : 175, ...o });
const angAED = (g: G, o: { color: string; op: number; label?: string }): Ang => a(g, 'E', 'A', 'D', g === G2 ? { r: 75, at: [75, -95], leader: true, ...o } : { r: 70, lr: 125, ...o });
export const angADC = (g: G, o: { color: string; op: number; label?: string; r?: number }): Ang => a(g, 'D', 'A', 'C', g === G2 ? { r: 160, at: [225, -215], leader: true, ...o } : { r: 245, at: [163, -233], ...o });
const angADB = (g: G, o: { color: string; op: number; label?: string }): Ang => a(g, 'D', 'A', 'B', { r: 100, at: [-78, -100], ...o });
const angDEC = (g: G, o: { color: string; op: number; label?: string }): Ang => a(g, 'E', 'D', 'C', { r: 35, at: [-60, 100], leader: true, ...o });
export const angX = (g: G, o: { color: string; op: number; label?: string }): Ang => a(g, 'D', 'E', 'C', { r: 160, at: [215, 60], leader: true, ...o });

export const tri = (...p: Pt[]) => p;

// ---------- layout helpers ----------
const PANEL = 980;

const Eq: React.FC<{ y: number; tex: string; start: number; x?: number; size?: number; color?: string; opacity?: number }> = ({ y, tex, start, x = PANEL, size = 54, color = C.ink, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: x, top: y, whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * opacity }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Boxed: React.FC<{ x: number; y: number; w: number; h: number; start: number }> = ({ x, y, w, h, start }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `6px solid ${C.green}`, borderRadius: 20, opacity: ease(f, start, 12) }} />;
};

const Chip: React.FC<{ x: number; y: number; start: number; color?: string; children: React.ReactNode }> = ({ x, y, start, color = C.card, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, background: color, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; h: number; start: number; color: string; children: React.ReactNode }> = ({ x, y, w, h, start, color, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.card, border: `5px solid ${color}`, borderRadius: 22, padding: '8px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, boxShadow: '0 4px 14px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      {children}
    </div>
  );
};

const ChoiceRow: React.FC<{ x: number; y: number; start: (i: number) => number; hi?: number; hiStart?: number }> = ({ x, y, start, hi, hiStart = 0 }) => {
  const f = useCurrentFrame();
  const vals = ['10', '15', '20', '30', '40'];
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 18 }}>
      {vals.map((v, i) => {
        const h = hi === i ? ease(f, hiStart, 10) : 0;
        return (
          <div key={i} style={{ ...fadeUp(f, start(i), 10), background: h > 0 ? C.green : C.card, color: h > 0 ? '#fff' : C.ink, borderRadius: 18, padding: '10px 22px', fontSize: 46, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', whiteSpace: 'nowrap' }}>
            <span style={{ color: h > 0 ? '#fff' : C.muted, fontSize: 40, marginRight: 10 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${v}^\\circ`} size={46} color="inherit" />
          </div>
        );
      })}
    </div>
  );
};

/** Answer badge whose chime is placed separately (end of the line, never over the spoken number). */
const Badge: React.FC<{ x: number; y: number; value: string; start: number; chimeAt: number; size?: number }> = ({ x, y, value, start, chimeAt, size = 110 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={chimeAt} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      {s > 0 && (
        <div style={{ position: 'absolute', left: x - 120, top: y - 120, width: 240, height: 240, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
          {value}
        </div>
      )}
    </>
  );
};

const E_ = (f: number, scene: Scene, i: number, t = 0, d = 12) => ease(f, at(scene, i, t), d);

// ---------- scenes ----------

const Intro: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const pulse = 0.55 + 0.45 * Math.sin(f / 5);
  const xOn = E_(f, scene, 0, 0.45, 10);
  const xFade = fadeTo(f, at(scene, 1, 0.1), 0.45, 10);
  const clue = E_(f, scene, 1, 0.15, 10);
  const path = E_(f, scene, 1, 0.45, 16);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          draw={ease(f, 4, 24)}
          dots={ease(f, 20, 14)}
          angs={[
            angX(g, { color: ANSWER, op: xOn * xFade * (at(scene, 1, 0.1) > f ? 0.6 + 0.4 * pulse : 1), label: 'x°' }),
            angBAD(g, { color: GIVEN, op: clue, label: '20°' }),
          ]}
          hls={[{ a: g.A, b: g.D, color: GIVEN, op: path * 0.9, w: 10, dashed: true }]}
        />
      </Stage>
      <Text x={PANEL} y={250} w={880} size={78} weight={900} style={fadeUp(f, 6)}>
        A tiny angle<span style={{ color: C.primary }}>…</span>
      </Text>
      <Chip x={PANEL} y={400} start={at(scene, 1, 0.1)}>
        <Text x={0} y={0} w={760} size={52} style={{ position: 'static' }}>
          One clue: <span style={{ color: GIVEN }}>20°</span>
        </Text>
      </Chip>
      <div style={{ position: 'absolute', left: PANEL, width: 880, top: 560, textAlign: 'center', ...fadeUp(f, at(scene, 2, 0.1)) }}>
        <div style={{ fontFamily: PACIFICO, fontSize: 130, color: C.violet }}>Vantee</div>
        <div style={{ fontSize: 54, fontWeight: 900, marginTop: 6 }}>Let's go angle chasing!</div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const l0 = E_(f, scene, 0, 0.3, 14);
  const l1 = E_(f, scene, 1, 0.25, 12);
  const l2 = E_(f, scene, 2, 0.4, 12);
  const l3 = E_(f, scene, 3, 0.3, 12);
  const l4 = E_(f, scene, 4, 0.5, 12);
  const flash = (i: number) => 0.5 + 0.5 * Math.sin((f - at(scene, i, 0.4)) / 3);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          draw={ease(f, 4, 28)}
          dots={l1}
          ticks={l2}
          shades={[{ pts: tri(g.A, g.B, g.C), color: GIVEN, op: l0 * fadeTo(f, at(scene, 1, 0), 0, 12) }]}
          angs={[
            angBAD(g, { color: GIVEN, op: l3, label: '20°' }),
            angX(g, { color: ANSWER, op: l4, label: 'x°' }),
          ]}
          hls={[
            { a: g.A, b: g.D, color: C.amber, op: f > at(scene, 2, 0.3) && f < at(scene, 2, 0.9) ? flash(2) * 0.8 : 0, w: 9 },
            { a: g.A, b: g.E, color: C.amber, op: f > at(scene, 2, 0.3) && f < at(scene, 2, 0.9) ? flash(2) * 0.8 : 0, w: 9 },
          ]}
        />
      </Stage>
      <Eq y={190} start={at(scene, 0, 0.1)} size={50} tex={'\\text{Triangle } ABC \\text{ is equilateral}'} />
      <Eq y={290} start={at(scene, 1, 0.1)} size={50} tex={'D \\text{ is on } BC,\\ E \\text{ is on } AC'} />
      <Eq y={390} start={at(scene, 2, 0.15)} size={50} tex={'AD = AE'} />
      <Eq y={480} start={at(scene, 3, 0.15)} size={50} tex={'\\angle BAD = 20^\\circ'} />
      <Eq y={570} start={at(scene, 4, 0.2)} size={50} color={C.green} tex={'x = \\angle EDC = \\ ?'} />
      <ChoiceRow x={PANEL} y={720} start={(i) => at(scene, 5, 0.1 + i * 0.12)} />
    </>
  );
};

const Asked: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const sixty = E_(f, scene, 0, 0.45, 12);
  const ade = E_(f, scene, 1, 0.3, 14);
  const goal = E_(f, scene, 2, 0.4, 12);
  const pulse = 0.7 + 0.3 * Math.sin(f / 4);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          shades={[{ pts: tri(g.A, g.D, g.E), color: DERIVED, op: ade }]}
          angs={[
            angA60(g, { color: GIVEN, op: sixty, label: '60°' }),
            angB60(g, { color: GIVEN, op: sixty, label: '60°' }),
            angC60(g, { color: GIVEN, op: sixty, label: '60°' }),
            angX(g, { color: ANSWER, op: goal * (0.5 + 0.5 * pulse), label: 'x°', width: 12 }),
          ]}
        />
      </Stage>
      <Chip x={PANEL} y={230} start={at(scene, 0, 0.3)}>
        <Tex tex={'\\text{equilateral} \\Rightarrow 60^\\circ,\\ 60^\\circ,\\ 60^\\circ'} size={50} color={GIVEN} />
      </Chip>
      <Chip x={PANEL} y={400} start={at(scene, 1, 0.25)}>
        <Tex tex={'AD = AE \\Rightarrow \\text{triangle } ADE'} size={50} color={DERIVED} />
      </Chip>
      <Chip x={PANEL} y={570} start={at(scene, 2, 0.3)}>
        <Tex tex={'\\text{goal: } x = \\angle EDC = \\ ?'} size={50} color={C.green} />
      </Chip>
    </>
  );
};

const makePause = (seconds: number, g: G, prompt: string, extra: (f: number) => Ang[]): SceneComponent => ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage>
        <Fig g={g} ticks={1} angs={extra(f)} />
      </Stage>
      <Text x={PANEL} y={190} w={880} size={54} style={fadeUp(f, 6)}>
        {prompt}
      </Text>
      <Countdown scene={scene} seconds={seconds} x={1430} y={560} tick={TICK} />
    </>
  );
};

const Top: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const ring = E_(f, scene, 0, 0.4, 10);
  const whole = E_(f, scene, 1, 0.15, 12) * fadeTo(f, at(scene, 1, 0.58), 0, 10);
  const bad = E_(f, scene, 1, 0.58, 12);
  const rest = E_(f, scene, 2, 0.1, 12);
  const dae = E_(f, scene, 2, 0.45, 10);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          shades={[{ pts: tri(g.A, g.D, g.E), color: DERIVED, op: rest * 0.6 }]}
          angs={[
            angA60(g, { color: GIVEN, op: whole, label: '60°' }),
            angBAD(g, { color: GIVEN, op: f < at(scene, 1, 0.15) ? 0.5 : bad, label: '20°' }),
            angDAE(g, { color: DERIVED, op: rest, label: dae > 0.5 ? '40°' : '?' }),
          ]}
        />
        {ring > 0 && ring < 1 && <circle cx={g.A[0]} cy={g.A[1]} r={20 + 70 * ring} fill="none" stroke={GIVEN} strokeWidth={8} opacity={1 - ring} />}
      </Stage>
      <Eq y={260} start={at(scene, 1, 0.3)} tex={'\\text{whole angle at } A = 60^\\circ'} size={50} />
      <Eq y={420} start={at(scene, 2, 0.35)} tex={'60^\\circ - 20^\\circ = 40^\\circ'} size={64} color={DERIVED} />
      <Boxed x={PANEL - 20} y={400} w={560} h={110} start={at(scene, 2, 0.8)} />
    </>
  );
};

const Isos: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const base = E_(f, scene, 1, 0.45, 12);
  const seventy = E_(f, scene, 3, 0.45, 10);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          shades={[{ pts: tri(g.A, g.D, g.E), color: DERIVED, op: E_(f, scene, 0, 0, 12) }]}
          angs={[
            angBAD(g, { color: GIVEN, op: 0.5, label: '20°' }),
            angDAE(g, { color: DERIVED, op: 1, label: '40°' }),
            angADE(g, { color: DERIVED, op: base, label: seventy > 0.5 ? '70°' : '?' }),
            angAED(g, { color: DERIVED, op: base, label: seventy > 0.5 ? '70°' : '?' }),
          ]}
        />
      </Stage>
      <Eq y={190} start={at(scene, 0, 0.5)} tex={'\\text{isosceles: } AD = AE'} size={50} />
      <Eq y={290} start={at(scene, 1, 0.5)} tex={'\\text{base angles: } \\angle ADE = \\angle AED'} size={50} color={DERIVED} />
      <Eq y={420} start={at(scene, 2, 0.5)} tex={'180^\\circ - 40^\\circ = 140^\\circ'} size={60} />
      <Eq y={550} start={at(scene, 3, 0.1)} tex={'140^\\circ \\div 2 = 70^\\circ'} size={64} color={DERIVED} />
      <Boxed x={PANEL - 20} y={530} w={540} h={110} start={at(scene, 3, 0.6)} />
    </>
  );
};

const Outside: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const abd = E_(f, scene, 0, 0.3, 14);
  const adc = E_(f, scene, 1, 0.4, 12);
  const far = E_(f, scene, 2, 0.5, 12);
  const why = E_(f, scene, 3, 0.2, 12);
  const sum = E_(f, scene, 5, 0.55, 10);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={0}
          shades={[{ pts: tri(g.A, g.B, g.D), color: GIVEN, op: abd }]}
          angs={[
            angBAD(g, { color: GIVEN, op: abd * 0.5 + far * 0.5, label: '20°', width: 8 + 5 * far }),
            angB60(g, { color: GIVEN, op: far * (1 - why), label: '60°' }),
            angADC(g, { color: ANSWER, op: adc, label: sum > 0.5 ? '80°' : '?' }),
            angADB(g, { color: DERIVED, op: why * fadeTo(f, at(scene, 5, 0.1), 0, 10), label: '?' }),
          ]}
        />
      </Stage>
      <Chip x={PANEL} y={190} start={at(scene, 2, 0.3)}>
        <div>
          <Tex tex={'\\text{outside angle} ='} size={44} color={DERIVED} />
          <br />
          <Tex tex={'\\text{sum of the two far inside angles}'} size={44} color={DERIVED} />
        </div>
      </Chip>
      <Eq y={350} start={at(scene, 3, 0.4)} tex={'60^\\circ + 20^\\circ + \\angle ADB = 180^\\circ'} size={48} color={DERIVED} />
      <Eq y={440} start={at(scene, 4, 0.3)} tex={'\\angle ADB + \\angle ADC = 180^\\circ'} size={48} color={ANSWER} />
      <Eq y={560} start={at(scene, 5, 0.35)} tex={'\\angle B + \\angle BAD = 60^\\circ + 20^\\circ'} size={52} />
      <Eq y={650} start={at(scene, 5, 0.6)} tex={'\\angle ADC = 80^\\circ'} size={64} color={ANSWER} />
    </>
  );
};

const Subtract: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const split = E_(f, scene, 0, 0.35, 14);
  const whole = 1 - split;
  const done = at(scene, 2, 0.25) <= f;
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          shades={[{ pts: tri(g.A, g.D, g.E), color: DERIVED, op: 0.6 }]}
          angs={[
            angADC(g, { color: ANSWER, op: whole, label: '80°' }),
            angADE(g, { color: DERIVED, op: split, label: '70°' }),
            angX(g, { color: ANSWER, op: split, label: done ? '10°' : 'x°', width: 12 }),
          ]}
        />
      </Stage>
      <Eq y={230} start={at(scene, 0, 0.5)} tex={'\\angle ADC = \\angle ADE + x'} size={54} />
      <Eq y={350} start={at(scene, 1, 0.3)} tex={'x = 80^\\circ - 70^\\circ'} size={64} />
      <Eq y={470} start={at(scene, 2, 0.2)} tex={'x = 10^\\circ'} size={72} color={ANSWER} />
      <Badge x={1600} y={560} value="A" start={at(scene, 2, 0.5)} chimeAt={at(scene, 2, 0.93)} size={130} />
      <ChoiceRow x={PANEL} y={740} start={() => at(scene, 2, 0.3)} hi={0} hiStart={at(scene, 2, 0.5)} />
    </>
  );
};

const Sol2: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const l0 = E_(f, scene, 0, 0.3, 12);
  const l1 = E_(f, scene, 1, 0.5, 12);
  const l2 = E_(f, scene, 2, 0.3, 12);
  const l3 = E_(f, scene, 3, 0.6, 12);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          shades={[{ pts: tri(g.D, g.E, g.C), color: ANSWER, op: l2 }]}
          hls={[{ a: g.A, b: g.C, color: C.amber, op: l0 * fadeTo(f, at(scene, 2, 0), 0.35, 10), w: 12 }]}
          angs={[
            angAED(g, { color: DERIVED, op: l0, label: '70°' }),
            angDEC(g, { color: DERIVED, op: l1, label: '110°' }),
            angC60(g, { color: GIVEN, op: l2, label: '60°' }),
            angX(g, { color: ANSWER, op: l3, label: '10°', width: 12 }),
          ]}
        />
      </Stage>
      <Eq y={200} start={at(scene, 0, 0.55)} tex={'\\angle AED = 70^\\circ,\\ AEC \\text{ is a straight line}'} size={42} />
      <Eq y={320} start={at(scene, 1, 0.3)} tex={'\\angle DEC = 180^\\circ - 70^\\circ = 110^\\circ'} size={50} color={DERIVED} />
      <Eq y={440} start={at(scene, 2, 0.5)} tex={'\\text{triangle } DEC:\\ \\angle C = 60^\\circ'} size={50} />
      <Eq y={560} start={at(scene, 3, 0.4)} tex={'x = 180^\\circ - 110^\\circ - 60^\\circ = 10^\\circ'} size={52} color={ANSWER} />
      <Pill x={PANEL} y={670} color={C.violet} style={{ ...fadeUp(f, at(scene, 4, 0.35)), fontSize: 38 }}>
        Double-check: straight line + triangle sum
      </Pill>
    </>
  );
};

const Pattern: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const chips = E_(f, scene, 0, 0.1, 12) * fadeTo(f, at(scene, 1, 0.1), 0, 12);
  const swapA = E_(f, scene, 1, 0.55, 10);
  const cancel = E_(f, scene, 3, 0.6, 8) > 0.5;
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          angs={[
            angBAD(g, { color: GIVEN, op: 1, label: swapA > 0.5 ? 'a' : '20°' }),
            angX(g, { color: ANSWER, op: 1, label: f >= at(scene, 1, 0.55) ? 'x°' : '10°' }),
          ]}
        />
      </Stage>
      <div style={{ position: 'absolute', left: PANEL, top: 200, display: 'flex', alignItems: 'center', gap: 30, opacity: chips }}>
        <Tex tex={'20^\\circ \\to 10^\\circ'} size={72} />
        <div style={{ background: C.green, color: '#fff', borderRadius: 999, padding: '8px 34px', fontSize: 56, fontWeight: 900 }}>half!</div>
      </div>
      <Eq y={150} start={at(scene, 2, 0.05)} tex={'\\angle DAE = 60^\\circ - a'} size={50} />
      <Eq y={225} start={at(scene, 2, 0.45)} tex={'\\text{base angle} = \\dfrac{180^\\circ - (60^\\circ - a)}{2}'} size={46} />
      <Eq y={345} start={at(scene, 2, 0.75)} tex={'= \\dfrac{120^\\circ + a}{2} = 60^\\circ + \\dfrac{a}{2}'} size={50} color={DERIVED} />
      <Eq y={470} start={at(scene, 3, 0.1)} tex={'\\angle ADC = 60^\\circ + a'} size={50} />
      <div style={{ position: 'absolute', left: PANEL, top: 548, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 3, 0.3)) }}>
        <Tex tex={cancel ? 'x = (\\cancel{60^\\circ} + a) - (\\cancel{60^\\circ} + \\dfrac{a}{2})' : 'x = (60^\\circ + a) - (60^\\circ + \\dfrac{a}{2})'} size={48} />
      </div>
      <Eq y={700} start={at(scene, 4, 0.35)} tex={'x = \\dfrac{a}{2}'} size={64} color={ANSWER} />
      <Boxed x={PANEL - 20} y={685} w={330} h={165} start={at(scene, 4, 0.6)} />
    </>
  );
};

const Traps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const t20 = E_(f, scene, 1, 0.1, 10);
  const t40 = E_(f, scene, 2, 0.1, 10);
  const t30 = E_(f, scene, 3, 0.1, 10);
  const side = E_(f, scene, 4, 0.55, 12);
  const t15 = E_(f, scene, 5, 0.1, 10);
  const all = E_(f, scene, 6, 0.3, 14);
  // highlight only the trap's arc, then everything on the last line
  const only = (k: number) => (all > 0 ? 0 : k);
  const legit = all;
  const adbOp = Math.max(only(t30 * (1 - 0)), legit);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          angs={[
            angBAD(g, { color: TRAP, op: Math.max(only(t20 * fadeTo(f, at(scene, 2, 0), 0, 8)), legit), label: '20°' }),
            angDAE(g, { color: TRAP, op: Math.max(only(t40 * fadeTo(f, at(scene, 3, 0), 0, 8)), legit), label: '40°' }),
            angADB(g, { color: TRAP, op: adbOp, label: '100°' }),
            angADE(g, { color: DERIVED, op: Math.max(only(t30 * fadeTo(f, at(scene, 5, 0), 0, 8)), legit), label: '70°' }),
            angADC(g, { color: ANSWER, op: Math.max(only(side * fadeTo(f, at(scene, 5, 0), 0, 8)), legit), label: '80°' }),
            angX(g, { color: ANSWER, op: Math.max(only(side * fadeTo(f, at(scene, 5, 0), 0, 8)), legit), label: '10°', width: 12 }),
            angAED(g, { color: DERIVED, op: legit, label: '70°' }),
            angDEC(g, { color: DERIVED, op: legit, label: '110°' }),
            angA60(g, { color: GIVEN, op: 0 }),
            
          ]}
        />
      </Stage>
      <Text x={PANEL} y={150} w={880} size={46} style={{ ...fadeUp(f, at(scene, 0, 0.3)), opacity: ease(f, at(scene, 0, 0.3), 12) * (1 - all) }}>
        Each wrong answer is a trap
      </Text>
      <Text x={PANEL} y={150} w={880} size={46} color={C.green} style={{ opacity: all }}>
        Habit: mark every angle you find
      </Text>
      <Card x={PANEL} y={225} w={880} h={105} start={at(scene, 1, 0.15)} color={TRAP}>
        <Tex tex={'20^\\circ = \\angle BAD \\ (\\text{given, not } x)'} size={46} />
      </Card>
      <Card x={PANEL} y={350} w={880} h={105} start={at(scene, 2, 0.15)} color={TRAP}>
        <Tex tex={'40^\\circ = \\angle DAE \\ (\\text{top, not at } D)'} size={46} />
      </Card>
      <Card x={PANEL} y={475} w={880} h={185} start={at(scene, 3, 0.15)} color={TRAP}>
        <Tex tex={'100^\\circ - 70^\\circ = 30^\\circ'} size={50} />
        <div style={{ fontSize: 40, fontWeight: 800, color: TRAP, opacity: side }}>but x sits on the C side</div>
      </Card>
      <Card x={PANEL} y={670} w={880} h={150} start={at(scene, 5, 0.15)} color={TRAP}>
        <div style={{ fontSize: 42, fontWeight: 900, color: TRAP }}>only IF BAD were 30°:</div>
        <Tex tex={'\\text{if } \\angle BAD = 30^\\circ:\\ 30^\\circ \\div 2 = 15^\\circ'} size={42} />
      </Card>
    </>
  );
};

const Variant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G2;
  const bad = E_(f, scene, 2, 0.3, 12);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          draw={ease(f, 2, 24)}
          dots={ease(f, 14, 14)}
          ticks={E_(f, scene, 1, 0.5, 12)}
          angs={[
            angBAD(g, { color: GIVEN, op: bad, label: '36°' }),
            angX(g, { color: ANSWER, op: E_(f, scene, 2, 0.7, 12), label: 'x°' }),
          ]}
        />
      </Stage>
      <Text x={PANEL} y={230} w={880} size={60} weight={900} style={fadeUp(f, 6)}>
        Same picture, new number
      </Text>
      <Eq y={400} start={at(scene, 1, 0.3)} tex={'ABC \\text{ equilateral},\\ AD = AE'} size={50} />
      <Eq y={510} start={at(scene, 2, 0.25)} tex={'\\angle BAD = 36^\\circ'} size={60} color={GIVEN} />
      <Eq y={620} start={at(scene, 2, 0.6)} tex={'x = \\ ?'} size={64} color={ANSWER} />
    </>
  );
};

const VariantAnswer: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G2;
  const dae = E_(f, scene, 0, 0.4, 12);
  const ade = E_(f, scene, 1, 0.4, 12);
  const adc = E_(f, scene, 2, 0.4, 12);
  const adcOut = fadeTo(f, at(scene, 3, 0.1), 0, 10);
  const x = E_(f, scene, 3, 0.1, 12);
  const done = f >= at(scene, 3, 0.72);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          shades={[{ pts: tri(g.A, g.D, g.E), color: DERIVED, op: ade * 0.6 }]}
          angs={[
            angBAD(g, { color: GIVEN, op: 0.6, label: '36°' }),
            angDAE(g, { color: DERIVED, op: dae, label: '24°' }),
            angADE(g, { color: DERIVED, op: ade, label: '78°' }),
            angAED(g, { color: DERIVED, op: ade, label: '78°' }),
            angADC(g, { color: ANSWER, op: adc * adcOut, label: '96°' }),
            angX(g, { color: ANSWER, op: x, label: done ? '18°' : 'x°', width: 12 }),
          ]}
        />
      </Stage>
      <Eq y={190} start={at(scene, 0, 0.5)} tex={'60^\\circ - 36^\\circ = 24^\\circ'} size={52} />
      <Eq y={290} start={at(scene, 1, 0.1)} tex={'180^\\circ - 24^\\circ = 156^\\circ'} size={52} />
      <Eq y={390} start={at(scene, 1, 0.6)} tex={'156^\\circ \\div 2 = 78^\\circ'} size={52} color={DERIVED} />
      <Eq y={490} start={at(scene, 2, 0.45)} tex={'\\angle ADC = 60^\\circ + 36^\\circ = 96^\\circ'} size={52} />
      <Eq y={590} start={at(scene, 3, 0.2)} tex={done ? 'x = 96^\\circ - 78^\\circ = 18^\\circ' : 'x = 96^\\circ - 78^\\circ'} size={56} color={ANSWER} />
      <Check x={PANEL} y={710} start={at(scene, 4, 0.5)}>
        <Tex tex={'36^\\circ \\div 2 = 18^\\circ'} size={52} />
      </Check>
      <Badge x={1700} y={330} value="18°" start={at(scene, 3, 0.72)} chimeAt={at(scene, 3, 0.95)} size={86} />
      <Confetti x={1400} y={500} start={at(scene, 5, 0.3)} seed={7} />
    </>
  );
};

const Recap: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = G1;
  const one = E_(f, scene, 1, 0.1, 12);
  const two = E_(f, scene, 2, 0.1, 12);
  return (
    <>
      <Stage>
        <Fig
          g={g}
          ticks={1}
          angs={[
            angADC(g, { color: ANSWER, op: one * fadeTo(f, at(scene, 2, 0), 0.4, 10), label: '80°' }),
            angADE(g, { color: DERIVED, op: two, label: '70°' }),
            angX(g, { color: ANSWER, op: two, label: 'x°', width: 12 }),
          ]}
        />
      </Stage>
      <Text x={PANEL} y={150} w={880} size={60} weight={900} style={fadeUp(f, at(scene, 0, 0.3))}>
        The big idea
      </Text>
      <Card x={PANEL} y={250} w={880} h={150} start={at(scene, 1, 0.1)} color={ANSWER}>
        <div style={{ fontSize: 42, fontWeight: 900 }}>1. Angle at D</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted }}>outside = sum of far angles</div>
      </Card>
      <Card x={PANEL} y={430} w={880} h={150} start={at(scene, 2, 0.1)} color={DERIVED}>
        <div style={{ fontSize: 42, fontWeight: 900 }}>2. Subtract the base angle</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.muted }}>of the isosceles triangle</div>
      </Card>
      <Chip x={PANEL} y={600} start={at(scene, 2, 0.6)}>
        <span style={{ fontSize: 42, fontWeight: 800, color: C.muted, marginRight: 14 }}>Bonus:</span>
        <Tex tex={'x = \\dfrac{\\angle BAD}{2}'} size={46} />
      </Chip>
      <SignOff start={at(scene, 3, 0.1)} text="Keep chasing those angles!" />
      <Confetti x={960} y={380} start={at(scene, 3, 0.5)} seed={3} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = {
  intro: Intro,
  question: Question,
  asked: Asked,
  try1: makePause(10, G1, 'Find x, the angle EDC.', () => [angBAD(G1, { color: GIVEN, op: 1, label: '20°' }), angX(G1, { color: ANSWER, op: 1, label: 'x°' })]),
  top: Top,
  isos: Isos,
  outside: Outside,
  subtract: Subtract,
  sol2: Sol2,
  pattern: Pattern,
  traps: Traps,
  variant: Variant,
  try2: makePause(12, G2, 'Now angle BAD is 36°. Find x.', () => [angBAD(G2, { color: GIVEN, op: 1, label: '36°' }), angX(G2, { color: ANSWER, op: 1, label: 'x°' })]),
  'variant-answer': VariantAnswer,
  recap: Recap,
};

export const Video: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <Explainer timeline={timeline} scenes={SCENES} badge="AMC 8-style · Level 4" /> : null;

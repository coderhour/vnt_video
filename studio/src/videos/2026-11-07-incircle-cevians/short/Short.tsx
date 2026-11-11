import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { SLUG } from '../Composition';

export { SLUG };

// Trap-first AMC 10 hook (2 : 1 = tangent lengths used as weights), question, comment bait, then the mass-points aha:
// equal tangents give 6, 8, 8, 7, the corners weigh 28, 21, 24, B and C merge into 49 at D (zoom), and the reveal
// AP : PD = 49 : 24 over the same big figure the hook opens on (clean loop).
// Timings below are frame offsets read off the voice WAVs (energy envelope), not guesses.

const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const GREEN = C.primary; // AP, tangent x
const PURP = C.violet; // PD, tangent y
const AMB = '#f59e0b'; // tangent z
const RED = C.red;
const GRAY = '#6b7280';
const CHOICES = ['24:49', '7:4', '2:1', '49:24', '15:7'];

type V = [number, number];
type G = { A: V; B: V; C: V; I: V; D: V; E: V; F: V; P: V; r: number; U: number };
/** B = (0,0), C = (14,0), A = (5,12), incircle centre (6,4) r 4 (verified in ../verify.py), mapped to screen px. */
const geo = (U: number, ox: number, oy: number): G => {
  const m = (x: number, y: number): V => [ox + x * U, oy - y * U];
  return { A: m(5, 12), B: m(0, 0), C: m(14, 0), I: m(6, 4), D: m(6, 0), E: m(9.2, 6.4), F: m(30 / 13, 72 / 13), P: m(414 / 73, 288 / 73), r: 4 * U, U };
};
/** The big figure: hook, aha and reveal all use it at exactly this place. */
const BIG = geo(50, 150, 1240);
/** The smaller figure under the question card. */
const SMALL = geo(32, 316, 1000);

const lerp = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const unit = (a: V, b: V): V => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};
const out = (g: G, p: V, d: number): V => {
  const u = unit(g.I, p);
  return [p[0] + u[0] * d, p[1] + u[1] * d];
};

const Lbl: React.FC<{ p: V; tex: string; op?: number; size?: number; color?: string; s?: number }> = ({ p, tex, op = 1, size = 52, color = C.ink, s = 1 }) => {
  if (op <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: `translate(-50%, -50%) scale(${s})`, opacity: op, whiteSpace: 'nowrap' }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Seg: React.FC<{ a: V; b: V; p?: number; color?: string; w?: number; op?: number }> = ({ a, b, p = 1, color = GRAY, w = 6, op = 1 }) => {
  if (p <= 0 || op <= 0) return null;
  const e = lerp(a, b, Math.min(1, p));
  return <line x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={op} />;
};

const Disc: React.FC<{ p: V; text: string; color: string; op?: number; r?: number; s?: number }> = ({ p, text, color, op = 1, r = 50, s = 1 }) => {
  if (op <= 0 || s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: p[0] - r, top: p[1] - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: C.card, border: `7px solid ${color}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, fontWeight: 900, color: C.ink, opacity: op, transform: `scale(${s})`, boxShadow: '0 6px 18px rgba(30,40,80,0.12)' }}>
      {text}
    </div>
  );
};

/** Tangent pieces: x from A (green, 1 tick), y from B (purple, 2), z from C (amber, 3). */
const PIECES: { a: 'A' | 'B' | 'C'; t: 'D' | 'E' | 'F'; col: string; n: number; len?: string }[] = [
  { a: 'A', t: 'F', col: GREEN, n: 1 },
  { a: 'A', t: 'E', col: GREEN, n: 1, len: '7' },
  { a: 'B', t: 'F', col: PURP, n: 2 },
  { a: 'B', t: 'D', col: PURP, n: 2, len: '6' },
  { a: 'C', t: 'D', col: AMB, n: 3, len: '8' },
  { a: 'C', t: 'E', col: AMB, n: 3, len: '8' },
];
const Pieces: React.FC<{ g: G; draw: (i: number) => number }> = ({ g, draw }) => (
  <>
    {PIECES.map((p, k) => {
      const a = g[p.a], t = g[p.t];
      const d = draw(k);
      if (d <= 0) return null;
      const m = lerp(a, t, 0.5);
      const u = unit(a, t);
      const nrm: V = [-u[1], u[0]];
      return (
        <g key={k}>
          <Seg a={a} b={t} p={d} color={p.col} w={13} />
          {d >= 1 && Array.from({ length: p.n }, (_, i) => {
            const c: V = [m[0] + u[0] * (i - (p.n - 1) / 2) * 13, m[1] + u[1] * (i - (p.n - 1) / 2) * 13];
            return <line key={i} x1={c[0] - nrm[0] * 17} y1={c[1] - nrm[1] * 17} x2={c[0] + nrm[0] * 17} y2={c[1] + nrm[1] * 17} stroke={p.col} strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
      );
    })}
  </>
);

/** Triangle, incircle, A D and B E (gray, or split into green A P / purple P D), touch points, P, letters. */
const Fig: React.FC<{ g: G; ad?: number; be?: number; split?: number; lab?: number; svg?: React.ReactNode; html?: React.ReactNode; letterSize?: number; hideD?: boolean }> = ({
  g, ad = 1, be = 1, split = 0, lab = 84, svg, html, letterSize = 52, hideD,
}) => (
  <>
    <Stage>
      <path d={`M ${g.A.join(' ')} L ${g.B.join(' ')} L ${g.C.join(' ')} Z`} fill={C.card} />
      <circle cx={g.I[0]} cy={g.I[1]} r={g.r} fill="none" stroke={C.blue} strokeWidth={6} />
      <path d={`M ${g.A.join(' ')} L ${g.B.join(' ')} L ${g.C.join(' ')} Z`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {svg}
      <Seg a={g.A} b={g.D} p={ad} op={1 - split} />
      <Seg a={g.A} b={g.P} color={GREEN} w={11} op={split} />
      <Seg a={g.P} b={g.D} color={PURP} w={11} op={split} />
      <Seg a={g.B} b={g.E} p={be} />
      <circle cx={g.D[0]} cy={g.D[1]} r={9} fill={C.ink} />
      <circle cx={g.E[0]} cy={g.E[1]} r={9} fill={C.ink} />
      {ad >= 1 && be >= 1 && <circle cx={g.P[0]} cy={g.P[1]} r={12} fill={RED} stroke="#fff" strokeWidth={3} />}
    </Stage>
    <Lbl p={[g.A[0] - lab, g.A[1] + 4]} tex="A" size={letterSize} />
    <Lbl p={[g.B[0] - lab, g.B[1] + 20]} tex="B" size={letterSize} />
    <Lbl p={[g.C[0] + lab * 0.7, g.C[1] + lab * 0.7]} tex="C" size={letterSize} />
    {!hideD && <Lbl p={out(g, g.D, lab * 0.65)} tex="D" size={letterSize} />}
    <Lbl p={out(g, g.E, lab * 0.65)} tex="E" size={letterSize} />
    {ad >= 1 && be >= 1 && <Lbl p={[g.P[0] + lab * 0.55, g.P[1] + lab * 0.45]} tex="P" size={letterSize} />}
    {html}
  </>
);

const before = () => -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0) + 77; // "Nope!" in the WAV
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #23</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>2 : 1</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`${BIG.P[0]}px ${BIG.P[1]}px`}>
        <Fig g={BIG} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 820, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const SIDE_LABELS: [V, V, string][] = [
  [[0, 0], [5, 12], '13'],
  [[0, 0], [20, 0], '14'],
  [[14, 0], [9.5, 6], '15'],
];
const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; ad?: number; be?: number }> = ({ start, pulse = () => 1, ad = 1, be = 1 }) => {
  const f = useCurrentFrame();
  const g = SMALL;
  const m = (p: V): V => [g.B[0] + p[0] * g.U, g.B[1] - p[1] * g.U];
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.32, textWrap: 'balance', boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Sides <b style={{ color: C.blue }}>13, 14, 15</b>. The circle inside touches BC at D and CA at E. Find <b style={{ color: GREEN }}>AP</b> : <b style={{ color: PURP }}>PD</b>.
      </div>
      <Fig g={g} ad={ad} be={be} lab={44} letterSize={44}
        html={SIDE_LABELS.map(([a, b, t]) => <Lbl key={t} p={out(g, lerp(m(a), m(b), 0.5), 40)} tex={t} size={46} color={C.blue} />)} />
      <div style={{ position: 'absolute', left: 60, top: 1075, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace(':', '{:}')} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  return (
    <>
      <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} ad={ease(f, l1 + 4, 16)} be={ease(f, l1 + 16, 16)} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={l1 + 4} src={SFX.click} volume={0.25} />
      <Sfx at={l1 + 16} src={SFX.click} volume={0.25} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** Equal tangents → 6, 8, 8, 7; weights 28, 21, 24 balance each side; B and C merge into 49 at D. */
const Weights: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  // L0: pieces from A, B, C draw in turn; the four lengths pop on their spoken words
  const draw = (k: number) => ease(f, 8 + Math.floor(k / 2) * 16, 14);
  const lenAt = [0, 129, 0, 105, 117, 123]; // EA "seven", BD "six", DC "eight", CE "eight"
  // L1: discs, BC then CA glow as seesaws, weights fill on "twenty-eight", "twenty-one", "twenty-four"
  const fillB = l1 + 79, fillC = l1 + 101, fillA = l1 + 130;
  const glowBC = ease(f, l1 + 34, 8) * (1 - ease(f, l1 + 56, 8));
  const glowCA = ease(f, l1 + 56, 8) * (1 - ease(f, l1 + 80, 8));
  // L2: B and C slide into D, "forty-nine" pops, zoom onto D and back out
  const slide = ease(f, l2 + 8, 30);
  const hit49 = l2 + 46;
  const zoom = 1 + 0.15 * ease(f, l2 + 30, 14) - 0.15 * ease(f, l2 + 66, 14);
  const bPos = lerp(g.B, g.D, slide), cPos = lerp(g.C, g.D, slide);
  const merged = f >= hit49;
  const pieceLabelPos = (k: number) => out(g, lerp(g[PIECES[k].a], g[PIECES[k].t], 0.5), 50);
  const head = (a: number, b: number) => ({ ...fadeUp(f, a), opacity: ease(f, a, 12) * fadeTo(f, b, 0, 8) });
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[8, 24, 40].map((t) => <Sfx key={t} at={t} src={SFX.click} volume={0.22} />)}
      {[105, 123].map((t) => <Sfx key={t} at={t} src={SFX.click} volume={0.28} />)}
      {[fillB, fillC, fillA].map((t) => <Sfx key={t} at={t} src={SFX.click} volume={0.3} />)}
      <Sfx at={l2 + 30} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2 + 66} src={SFX.whoosh} volume={0.2} />

      {/* top readouts (outside the zoom) */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 70, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, ...head(4, l1) }}>
          Each corner: <span style={{ color: GREEN }}>equal pieces</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, ...head(l1 + 6, l2 - 4) }}>
          Each side <span style={{ color: AMB }}>balances</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, ...head(l2 + 10, hit49 - 4) }}>
          Merge at <span style={{ color: GREEN }}>D</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 430, display: 'flex', justifyContent: 'center', ...head(l1 + 20, l2 + 8) }}>
        <Tex tex={`B\\times 6=C\\times 8=A\\times 7`} size={66} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', ...head(hit49, 99999) }}>
        <Tex tex={`\\color{${PURP}}28\\color{${C.ink}}+\\color{#d97706}21\\color{${C.ink}}=49`} size={74} />
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${g.D[0] - 10}px ${g.D[1]}px` }}>
        <Fig g={g} hideD={f >= l2 + 20}
          svg={
            <>
              <Pieces g={g} draw={draw} />
              <Seg a={g.B} b={g.C} color="#fbbf24" w={26} op={glowBC * 0.55} />
              <Seg a={g.C} b={g.A} color="#fbbf24" w={26} op={glowCA * 0.55} />
              {glowBC > 0 && <polygon points={`${g.D[0] - 26},${g.D[1] + 40} ${g.D[0] + 26},${g.D[1] + 40} ${g.D[0]},${g.D[1] + 4}`} fill={C.amber} opacity={glowBC} />}
              {glowCA > 0 && <circle cx={g.E[0]} cy={g.E[1]} r={16} fill={C.amber} opacity={glowCA} />}
            </>
          }
          html={
            <>
              {PIECES.map((p, k) => p.len && f < l2 + 8 && (
                <Lbl key={k} p={pieceLabelPos(k)} tex={p.len} color={p.col} size={58} op={ease(f, lenAt[k], 4) * fadeTo(f, l2, 0, 8)} s={pop(f, lenAt[k])} />
              ))}
              <Disc p={g.A} text={f >= fillA ? '24' : '?'} color={GREEN} op={ease(f, l1 + 8, 8)} s={f >= fillA ? pop(f, fillA) : 1} />
              {!merged && <Disc p={bPos} text={f >= fillB ? '28' : '?'} color={PURP} op={ease(f, l1 + 4, 8)} s={f >= fillB && f < l2 ? pop(f, fillB) : 1} />}
              {!merged && <Disc p={cPos} text={f >= fillC ? '21' : '?'} color={AMB} op={ease(f, l1 + 12, 8)} s={f >= fillC && f < l2 ? pop(f, fillC) : 1} />}
              {merged && <Disc p={g.D} text="49" color={GREEN} r={58} s={pop(f, hit49)} />}
            </>
          }
        />
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same big figure the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = BIG;
  const hit = at(scene, 0) + 49; // "forty-nine to twenty-four" starts here in the WAV
  const chime = at(scene, 0) + 90;
  const trap = at(scene, 1);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', opacity: fadeTo(f, hit - 4, 0, 4) }}>
        <Tex tex={`\\color{${GREEN}}AP\\color{${C.ink}}:\\color{${PURP}}PD\\color{${C.ink}}=\\,?`} size={92} />
      </div>
      {f >= hit && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '2px 46px', display: 'flex', alignItems: 'center', gap: 28, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
            <span style={{ fontSize: 76, fontWeight: 900 }}>D</span>
            <Tex tex="49:24" size={104} color="#fff" />
          </div>
        </div>
      )}

      <Fig g={g} split={ease(f, 4, 12)} hideD
        html={
          <>
            <Disc p={g.A} text="24" color={GREEN} />
            <Disc p={g.D} text="49" color={GREEN} r={58} />
          </>
        }
      />
      <div style={{ position: 'absolute', left: 560, top: 630, whiteSpace: 'nowrap', lineHeight: 1.25, ...fadeUp(f, hit + 8) }}>
        <div><Tex tex={`24\\times\\color{${GREEN}}AP`} size={54} /></div>
        <div><Tex tex={`=49\\times\\color{${PURP}}PD`} size={54} /></div>
      </div>
      <div style={{ position: 'absolute', left: 720, top: 790, ...fadeUp(f, trap + 2) }}>
        <div style={{ position: 'relative', background: C.card, border: `6px solid ${RED}`, borderRadius: 24, padding: '4px 30px' }}>
          <Tex tex="2:1" size={76} color={RED} />
          <div style={{ position: 'absolute', left: -10, right: -10, top: '50%', height: 9, background: RED, borderRadius: 5, transform: `rotate(-14deg) scaleX(${ease(f, trap + 10, 8)})` }} />
        </div>
      </div>
      <CtaPill start={at(scene, 2)} y={436} />
      <Confetti x={540} y={360} start={chime} seed={23} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, weights: Weights, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

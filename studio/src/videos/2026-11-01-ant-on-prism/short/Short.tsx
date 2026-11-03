import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage, type Pt } from '../../../lib/grid';
import { NUNITO } from '../../../lib/fonts';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arrow, CHIME, GRN, RED, SLUG, VALUES, VC, v } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (1/3), question, comment bait, the half-turn spin as the aha (zoom on the front
// face, a degree counter while it spins, swap arrows, f = 1 - c), then the answer 4/11 over the same prism as frame 0.

// ---------- a bigger copy of the long video's prism (oblique projection, screen y down) ----------
const OFF: Record<string, Pt> = { A: [0, 0], B: [420, 0], C: [314, -95], D: [0, -420], E: [420, -420], F: [314, -515] };
const KEYS = 'ABCDEF'.split('');
const EDGES = ['AB', 'BC', 'AC', 'DE', 'EF', 'DF', 'AD', 'BE', 'CF'];
const HIDDEN = new Set(['AC', 'BC', 'CF']);
const SIG: Record<string, string> = { A: 'E', E: 'A', B: 'D', D: 'B', C: 'F', F: 'C' };
const LAB: Record<string, Pt> = { A: [-42, 38], B: [42, 38], C: [44, 32], D: [-42, -30], E: [42, -30], F: [40, -36] };
const CHIP: Record<string, Pt> = { A: [-42, 100], B: [42, 100], C: [-115, -30], D: [-42, -92], E: [42, -92], F: [-105, -14] };
const FRONT_C: Pt = [210, -210];
const BACK_C: Pt = [314, -305];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Vertex k after turning by theta (0…2π) about the axis through the front-face centre (the half-turn symmetry). */
const rel = (k: string, theta: number): Pt => {
  if (theta <= 0) return OFF[k];
  const c = k === 'C' || k === 'F' ? BACK_C : FRONT_C;
  const dx = OFF[k][0] - c[0];
  const dy = OFF[k][1] - c[1];
  return [c[0] + dx * Math.cos(theta) - dy * Math.sin(theta), c[1] + dx * Math.sin(theta) + dy * Math.cos(theta)];
};

type VS = { fill?: string; ring?: string; ringO?: number; chip?: string; chipC?: string; chipO?: number };

const Prism: React.FC<{ O: Pt; s: number; theta?: number; tint?: number; vs?: Record<string, VS>; ant?: number; children?: React.ReactNode }> = ({ O, s, theta = 0, tint = 0, vs = {}, ant = 0, children }) => {
  const half = theta / Math.PI;
  const u = half <= 1 ? half : 2 - half; // 0 at rest, 1 after a half turn
  const spinning = Math.abs(half - Math.round(half)) > 0.002;
  const odd = Math.round(half) % 2 === 1;
  const tok = (k: string): Pt => {
    const r = rel(k, theta);
    return [O[0] + r[0] * s, O[1] + r[1] * s];
  };
  // edges behind the prism are dashed; after a half turn the hidden ones are the images of the original hidden ones
  const hidden = (e: string) => !spinning && (odd ? HIDDEN.has([SIG[e[0]], SIG[e[1]]].sort().join('')) : HIDDEN.has(e));
  return (
    <>
      <Stage>
        {tint > 0 && <polygon points={['A', 'B', 'E', 'D'].map((k) => tok(k).join(',')).join(' ')} fill={C.primary} opacity={tint * 0.2} />}
        {EDGES.map((e) => {
          const [a, b] = [tok(e[0]), tok(e[1])];
          const h = hidden(e);
          return <line key={e} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ink} strokeWidth={8} strokeLinecap="round" opacity={0.85} strokeDasharray={h ? '18 16' : undefined} />;
        })}
        {children}
        {KEYS.map((k) => {
          const p = tok(k);
          const st = vs[k];
          return (
            <g key={k}>
              <circle cx={p[0]} cy={p[1]} r={21} fill={st?.fill ?? '#fff'} stroke={C.ink} strokeWidth={5} />
              {st?.ring && (st.ringO ?? 1) > 0 && <circle cx={p[0]} cy={p[1]} r={46} fill="none" stroke={st.ring} strokeWidth={8} opacity={st.ringO ?? 1} />}
            </g>
          );
        })}
        {KEYS.map((k) => {
          const p = tok(k);
          const o = lerp(LAB[k], LAB[SIG[k]], u);
          return (
            <text key={k} x={p[0] + o[0] * s * 1.15} y={p[1] + o[1] * s * 1.15} fill={C.ink} fontFamily={NUNITO} fontWeight={900} fontSize={66} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={10}>
              {k}
            </text>
          );
        })}
        {ant > 0 && <Ant p={tok('C')} opacity={ant} />}
      </Stage>
      {KEYS.map((k) => {
        const st = vs[k];
        if (!st?.chip || (st.chipO ?? 1) <= 0) return null;
        const p = tok(k);
        const o = CHIP[k];
        return (
          <div key={k} style={{ position: 'absolute', left: p[0] + o[0] * s, top: p[1] + o[1] * s, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * (st.chipO ?? 1)})`, background: st.chipC ?? C.violet, borderRadius: 20, padding: '4px 20px', whiteSpace: 'nowrap', opacity: st.chipO ?? 1, boxShadow: '0 4px 14px rgba(30,40,80,0.18)' }}>
            <Tex tex={st.chip} size={58} color="#fff" />
          </div>
        );
      })}
    </>
  );
};

const Ant: React.FC<{ p: Pt; opacity?: number }> = ({ p, opacity = 1 }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(1.6)`} opacity={opacity}>
    <path d="M -6 -8 L -12 -22 M 6 -8 L 12 -22" stroke="#3b2a1d" strokeWidth={3.5} strokeLinecap="round" fill="none" />
    <circle r={17} fill="#3b2a1d" stroke="#fff" strokeWidth={4} />
    <circle cx={-6} cy={-3} r={3.5} fill="#fff" />
    <circle cx={6} cy={-3} r={3.5} fill="#fff" />
  </g>
);

// the main prism: same place in the hook, the spin and the reveal (so the last frame loops into frame 0)
const MO: Pt = [260, 1270];
const MS = 1.25;
const P = (k: string, theta = 0): Pt => {
  const r = rel(k, theta);
  return [MO[0] + r[0] * MS, MO[1] + r[1] * MS];
};
const EA: Record<string, VS> = { E: { fill: GRN }, A: { fill: RED } };
const before = () => -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #12</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1/3</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 920px">
        <Prism O={MO} s={MS} vs={EA} ant={1} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 760, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QO: Pt = [350, 1300];
const QS = 0.9;

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        An ant starts at <b style={{ color: C.violet }}>C</b>. Each second it crawls a random edge. Chance it reaches <b style={{ color: GRN }}>E</b> before <b style={{ color: RED }}>A</b>?
      </div>
      <div style={{ position: 'absolute', left: 30, top: 590, width: 1020, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {VALUES.map((t, i) => (
          <div key={t} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', scale: String(pulse(i)) }}>
            <Tex tex={t} size={68} />
          </div>
        ))}
      </div>
      <Prism O={QO} s={QS} vs={EA} ant={1} />
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.45 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait: the values have no letters (A–F are corner names), so the bubble asks for the answer. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={900} text="Comment your answer!" />
    </>
  );
};

/** Header readout slot, centred at y. */
const Head: React.FC<{ y: number; o: number; children: React.ReactNode; sc?: number }> = ({ y, o, children, sc = 1 }) =>
  o > 0 ? (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: o, transform: `scale(${sc})` }}>{children}</div>
  ) : null;

const card: React.CSSProperties = { background: C.card, borderRadius: 26, padding: '6px 36px', boxShadow: '0 8px 28px rgba(30,40,80,0.09)', whiteSpace: 'nowrap' };

const Spin: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  // line 0: zoom onto the front face, A and E ringed, the diagonal between them
  const zIn = ease(f, 6, 16);
  const zOut = ease(f, t(1), 14);
  const zoom = 1 + 0.3 * zIn - 0.3 * zOut;
  const ringO = ease(f, t(0, 0.55), 10) * fadeTo(f, t(2), 0, 10);
  const diag = ease(f, t(0, 0.62), 16) * fadeTo(f, t(1, 0.1), 0, 8);
  const tint = ease(f, 10, 12) * fadeTo(f, t(2, 0.6), 0, 12);
  // line 1: skewer, a half turn with a degree counter, then the swap arrows
  const spin0 = t(1, 0.12);
  const SPIN = 48;
  const back0 = t(3, 0.02);
  const theta = Math.PI * ease(f, spin0, SPIN) + Math.PI * ease(f, back0, 30);
  const deg = Math.round(180 * ease(f, spin0, SPIN));
  const counterO = ease(f, t(1, 0.05), 8) * fadeTo(f, t(2), 0, 8);
  const sk = ease(f, t(1, 0.02), 12) * fadeTo(f, t(2, 0.2), 0, 10);
  const SKC = '#6b7280';
  const c1: Pt = [MO[0] + FRONT_C[0] * MS, MO[1] + FRONT_C[1] * MS];
  const c2: Pt = [MO[0] + BACK_C[0] * MS, MO[1] + BACK_C[1] * MS];
  const ext = (a: Pt, b: Pt, d: number): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [b[0] + ((b[0] - a[0]) / l) * d, b[1] + ((b[1] - a[1]) / l) * d];
  };
  const s1 = ext(c2, c1, 110);
  const s2 = ext(c1, c2, 110);
  const arAE = ease(f, t(1, 0.55), 10) * fadeTo(f, t(3), 0, 8);
  const arCF = ease(f, t(1, 0.85), 10) * fadeTo(f, t(3), 0, 8);
  // line 2: same prism, F racing to E = C racing to A
  const sameO = ease(f, t(2, 0.02), 8) * fadeTo(f, t(3), 0, 8);
  const eqO = ease(f, t(2, 0.3), 10) * fadeTo(f, t(3), 0, 8);
  // line 3: turn back, c and f chips, f = 1 - c
  const chipO = ease(f, t(3, 0.38), 10);
  const fcO = ease(f, t(3, 0.42), 10);
  const vs: Record<string, VS> = {
    E: { fill: GRN, ring: C.violet, ringO },
    A: { fill: RED, ring: C.violet, ringO },
    C: { chip: v('c', '\\textcolor{#fff}{c}'), chipC: VC.c, chipO },
    F: { chip: v('f', '\\textcolor{#fff}{f}'), chipC: VC.f, chipO },
  };
  const A = P('A');
  const E = P('E');
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={6} src={SFX.whoosh} volume={0.25} />
      <Sfx at={t(0, 0.55)} src={SFX.click} volume={0.28} />
      <Sfx at={t(1)} src={SFX.whoosh} volume={0.25} />
      {[1, 2, 3].map((i) => <Sfx key={i} at={spin0 + (SPIN * i) / 3} src={SFX.click} volume={0.25} />)}
      <Sfx at={t(1, 0.55)} src={SFX.click} volume={0.28} />
      <Sfx at={t(1, 0.85)} src={SFX.click} volume={0.28} />
      <Sfx at={t(2, 0.02)} src={SFX.click} volume={0.28} />
      <Sfx at={t(2, 0.3)} src={SFX.click} volume={0.25} />
      <Sfx at={back0} src={SFX.whoosh} volume={0.28} />
      <Sfx at={t(3, 0.42)} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '522px 1150px' }}>
        <Prism O={MO} s={MS} theta={theta} tint={tint} vs={vs}>
          {diag > 0 && <line x1={A[0]} y1={A[1]} x2={A[0] + (E[0] - A[0]) * diag} y2={A[1] + (E[1] - A[1]) * diag} stroke={C.violet} strokeWidth={8} strokeDasharray="18 14" strokeLinecap="round" />}
          {sk > 0 && (
            <g opacity={sk}>
              <line x1={s1[0]} y1={s1[1]} x2={s2[0]} y2={s2[1]} stroke={SKC} strokeWidth={11} strokeLinecap="round" />
              <circle cx={c1[0]} cy={c1[1]} r={17} fill={SKC} stroke="#fff" strokeWidth={5} />
            </g>
          )}
          <Arrow a={P('A')} b={P('E')} color={C.violet} o={arAE} both bend={60} w={9} />
          <Arrow a={P('C')} b={P('F')} color={C.amber} o={arCF} both bend={90} w={9} />
        </Prism>
      </div>
      <Head y={280} o={counterO}>
        <div style={{ ...card, fontSize: 72, fontWeight: 900 }}>
          half turn: <span style={{ color: C.violet, display: 'inline-block', minWidth: 170, textAlign: 'right' }}>{deg}°</span>
        </div>
      </Head>
      <Head y={270} o={sameO} sc={pop(f, t(2, 0.02))}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '8px 44px', fontSize: 66, fontWeight: 900 }}>same prism!</div>
      </Head>
      <Head y={375} o={eqO}>
        <div style={{ ...card, fontSize: 68, fontWeight: 900 }}>
          <span style={{ color: VC.f }}>F</span> → <span style={{ color: GRN }}>E</span>
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, color: C.violet }}>=</div>
        <div style={{ ...card, fontSize: 68, fontWeight: 900 }}>
          <span style={{ color: VC.c }}>C</span> → <span style={{ color: RED }}>A</span>
        </div>
      </Head>
      <Head y={285} o={fcO} sc={0.9 + 0.1 * fcO}>
        <div style={{ ...card, border: `6px solid ${C.primary}` }}>
          <Tex tex={`${v('f')} = 1 - ${v('c')}`} size={84} />
        </div>
      </Head>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same prism as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const hit = t(0, 0.76);
  const chime = t(0, 0.97);
  const rule = ease(f, t(0, 0.03), 8) * fadeTo(f, t(0, 0.42), 0, 8);
  const eleven = ease(f, t(0, 0.44), 8) * fadeTo(f, hit - 2, 0, 4);
  const fc = fadeTo(f, t(1), 0, 8);
  const vs: Record<string, VS> = { ...EA, C: f >= hit ? { chip: '\\dfrac{4}{11}', chipC: GRN, chipO: ease(f, hit, 8) } : {} };
  return (
    <>
      <Prism O={MO} s={MS} vs={vs} ant={ease(f, 2, 8)} />
      <Head y={285} o={rule}>
        <div style={card}>
          <Tex tex={`8${v('c')} = 1 + 3${v('f')}`} size={84} />
        </div>
      </Head>
      <Head y={285} o={eleven}>
        <div style={{ ...card, border: `6px solid ${C.primary}` }}>
          <Tex tex={`11${v('c')} = 4`} size={84} />
        </div>
      </Head>
      {f >= hit && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: GRN, color: '#fff', borderRadius: 32, padding: '4px 56px', fontSize: 100, fontWeight: 900, lineHeight: 1.1, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
            4/11
          </div>
        </div>
      )}
      <Head y={450} o={fc}>
        <div style={card}>
          <Tex tex={`${v('f')} = 1 - ${v('c')}`} size={60} />
        </div>
      </Head>
      <Head y={450} o={ease(f, t(1, 0.05), 8) * fadeTo(f, t(2), 0, 8)}>
        <div style={{ fontSize: 62, fontWeight: 900, color: C.red, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Tex tex={'\\dfrac{1}{3}'} size={64} color={C.red} /> was just a guess ✗
        </div>
      </Head>
      <CtaPill start={t(2)} y={415} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={t(1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, spin: Spin, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

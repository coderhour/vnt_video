import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COLORS, Label, SLUG, centroid, mk, tris } from '../Composition';

export { SLUG };

// Trap-first AMC 8 short: "Think it's 54?", then the top triangle spins and grows onto the bottom one (×5/3),
// a zoom while its area grows by 5/3 twice (9 → 25), the side triangles at 15, and the sum. Frame 0 and the
// last frame show the same trapezoid at the same place.

type Key = keyof typeof COLORS;
const KEYS: Key[] = ['top', 'bottom', 'left', 'right'];
const pts = (p: Pt[]) => p.map((q) => q.join(',')).join(' ');
const labColor = (k: Key) => (COLORS[k] === C.amber ? '#b87800' : COLORS[k]);
const before = () => -100;

type Geo = ReturnType<typeof mk>;
/** Big figure: nearly full width, bottom corners inside x 60…920. */
const G = mk(6, 10, 6, 1.5, 90, 1110, 82);
/** Smaller figure for the question card scenes. */
const QG = mk(6, 10, 6, 1.5, 200, 1030, 64);

/** Trapezoid + diagonals; `fill[k]` (0..1) shades triangle k; `lab[k]` = [text, opacity, scale]. */
const Trap: React.FC<{ g: Geo; fill: Partial<Record<Key, number>>; lab?: Partial<Record<Key, [string, number, number?]>>; sides?: number; size?: number; ring?: Key; children?: React.ReactNode }> = ({ g, fill, lab = {}, sides = 1, size = 72, ring, children }) => {
  const T = tris(g);
  return (
    <Stage>
      {KEYS.map((k) => (
        <polygon key={k} points={pts(T[k])} fill={COLORS[k]} opacity={0.38 * (fill[k] ?? 0)} />
      ))}
      {ring && <polygon points={pts(T[ring])} fill="none" stroke={C.red} strokeWidth={12} strokeLinejoin="round" />}
      {children}
      <polygon points={pts([g.A, g.B, g.C, g.D])} fill="none" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
      <line x1={g.A[0]} y1={g.A[1]} x2={g.C[0]} y2={g.C[1]} stroke={C.ink} strokeWidth={6} />
      <line x1={g.B[0]} y1={g.B[1]} x2={g.D[0]} y2={g.D[1]} stroke={C.ink} strokeWidth={6} />
      <Label p={[(g.A[0] + g.B[0]) / 2, g.A[1] - 44]} text="6" opacity={sides} size={64} />
      <Label p={[(g.C[0] + g.D[0]) / 2, g.D[1] + 50]} text="10" opacity={sides} size={64} />
      {KEYS.map((k) => {
        const l = lab[k];
        if (!l) return null;
        const c = centroid(T[k]);
        const s = l[2] ?? 1;
        return (
          <g key={k} transform={`translate(${c[0]} ${c[1]}) scale(${s}) translate(${-c[0]} ${-c[1]})`}>
            <Label p={c} text={l[0]} color={labColor(k)} size={k === 'bottom' ? size * 1.2 : size} opacity={l[1]} />
          </g>
        );
      })}
    </Stage>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #45</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>54</span>?
      </Text>
      <PushIn frames={scene.frames} origin="500px 860px">
        <Trap g={G} fill={{ top: 1 }} lab={{ top: ['9', 1], bottom: ['?', 1], left: ['?', 1], right: ['?', 1] }} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 720, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Trapezoid: <b>top 6</b>, <b>bottom 10</b>. The shaded triangle has <b style={{ color: '#b87800' }}>area 9</b>. <b style={{ color: C.violet }}>Whole area?</b>
      </div>
      <Trap g={QG} fill={{ top: 1 }} lab={{ top: ['9', 1] }} size={60} />
      <div style={{ position: 'absolute', left: 60, top: 1110, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 0, 0.55 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={700} />
    </>
  );
};

/** The top triangle turned half a turn about E and grown by `s` (s = 5/3 lands exactly on the bottom triangle). */
const spun = (p: Pt, th: number, s: number): Pt => {
  const [ex, ey] = G.E;
  const dx = p[0] - ex;
  const dy = p[1] - ey;
  return [ex + s * (dx * Math.cos(th) - dy * Math.sin(th)), ey + s * (dx * Math.sin(th) + dy * Math.cos(th))];
};

const Chip: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => (
  <div style={{ position: 'absolute', left: 60, width: 860, top: 1212, display: 'flex', justifyContent: 'center', opacity: o }}>
    <div style={{ background: C.card, borderRadius: 26, padding: '10px 40px', boxShadow: '0 8px 26px rgba(30,40,80,0.12)', whiteSpace: 'nowrap' }}>{children}</div>
  </div>
);

/** The aha: the bottom triangle is the top one spun and grown by 5/3; base and height both grow, so 9 → 25; sides 15. */
const Similar: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const spin0 = at(scene, 0, 0.08);
  const spin = ease(f, spin0, 34);
  const landed = spin0 + 34;
  const th = Math.PI * spin;
  const s = 1 + (2 / 3) * spin;
  const ghost = ease(f, spin0, 4) * fadeTo(f, landed + 6, 0, 10);
  const base = at(scene, 1, 0.22);
  const height = at(scene, 1, 0.5);
  const b25 = at(scene, 1, 0.88);
  const zIn = l1 + 2;
  const zOut = l2 - 12;
  const zoom = 1 + 0.3 * ease(f, zIn, 12) - 0.3 * ease(f, zOut, 10);
  const side = at(scene, 2, 0.12);
  const side15 = at(scene, 2, 0.84);
  const T = tris(G);
  const foot: Pt = [G.E[0], G.D[1]];
  const hP = ease(f, height, 12);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={spin0} src={SFX.whoosh} volume={0.28} />
      <Sfx at={landed} src={SFX.click} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={base} src={SFX.click} volume={0.28} />
      <Sfx at={height} src={SFX.click} volume={0.28} />
      <Sfx at={b25} src={SFX.click} volume={0.3} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={side} src={SFX.click} volume={0.25} />
      <Sfx at={side15} src={SFX.click} volume={0.3} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 84, fontWeight: 900, opacity: fadeTo(f, zIn, 0, 8) + ease(f, zOut, 8) }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l2 - 4, 0, 8) }}>
          <span style={{ color: '#b87800' }}>top</span> & <span style={{ color: C.blue }}>bottom</span>: copies
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 8) }}>
          <span style={{ color: C.primary }}>sides</span> share a height
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 420, textAlign: 'center', fontSize: 64, fontWeight: 900, opacity: ease(f, at(scene, 0, 0.62), 8) * fadeTo(f, zIn, 0, 8) + ease(f, zOut + 4, 8) * fadeTo(f, l2, 0, 8) }}>
        6 : 10 = <span style={{ color: C.violet }}>3 : 5</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '491px 1110px' }}>
        <Trap
          g={G}
          fill={{ top: 1, bottom: ease(f, landed, 8), left: ease(f, side, 10), right: ease(f, side, 10) }}
          lab={{ top: ['9', 1], bottom: ['25', ease(f, b25, 6), pop(f, b25)], left: ['15', ease(f, side15, 6), pop(f, side15)], right: ['15', ease(f, side15, 6), pop(f, side15)] }}
        >
          {ghost > 0 && <polygon points={pts(T.top.map((p) => spun(p, th, s)))} fill={C.amber} fillOpacity={0.35} stroke="#b87800" strokeWidth={8} strokeLinejoin="round" opacity={ghost} />}
          <line x1={G.D[0]} y1={G.D[1]} x2={G.C[0]} y2={G.C[1]} stroke={C.blue} strokeWidth={18} strokeLinecap="round" opacity={ease(f, base, 8) * fadeTo(f, l2, 0, 8)} />
          {hP > 0 && (
            <line x1={G.E[0]} y1={G.E[1]} x2={G.E[0]} y2={G.E[1] + (foot[1] - G.E[1]) * hP} stroke={C.blue} strokeWidth={10} strokeDasharray="22 14" strokeLinecap="round" opacity={fadeTo(f, l2, 0, 8)} />
          )}
        </Trap>
      </div>
      <Chip o={ease(f, base - 4, 8) * fadeTo(f, l2 - 2, 0, 6)}>
        <Tex tex={`9${f >= base ? '\\times 5/3' : ''}${f >= height ? '\\times 5/3' : ''}${f >= b25 ? '=25' : ''}`} size={64} />
      </Chip>
      <Chip o={ease(f, at(scene, 2, 0.5), 8)}>
        <Tex tex={`9\\times 5/3${f >= side15 ? '=15' : ''}`} size={64} />
      </Chip>
    </>
  );
};

/** The sum, the trap, then the CTA pill over the same trapezoid the hook showed. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.86);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  const terms = ['9', '+25', '+15', '+15'];
  const termAt = (i: number) => at(scene, 0, 0.02 + i * 0.2);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 70, fontWeight: 900 }}>Area</span>
          <Tex tex="= 64" size={100} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 428, display: 'flex', justifyContent: 'center' }}>
        {terms.map((t, i) => (
          <span key={i} style={{ opacity: ease(f, termAt(i), 6) }}>
            <Tex tex={t} size={64} />
          </span>
        ))}
        <span style={{ opacity: ease(f, hit, 6) }}>
          <Tex tex="=64" size={64} color={C.green} />
        </span>
      </div>
      <Trap g={G} fill={{ top: 1, bottom: 1, left: 1, right: 1 }} lab={{ top: ['9', 1], bottom: ['25', 1], left: ['15', 1], right: ['15', 1] }} ring={f >= trap && f < at(scene, 2) ? 'bottom' : undefined} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1222, display: 'flex', justifyContent: 'center', ...fadeUp(f, trap + 3), opacity: ease(f, trap + 3, 8) * fadeTo(f, at(scene, 2) - 6, 0, 6) }}>
        <Tex tex={'9+\\textcolor{#ef4343}{15}+15+15=\\textcolor{#ef4343}{54}'} size={62} />
      </div>
      <CtaPill start={at(scene, 2)} y={1212} />
      {terms.map((_, i) => <Sfx key={i} at={termAt(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={330} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, similar: Similar, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

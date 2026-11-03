import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COLS, LIST, SLUG, triPts } from '../Composition';

export { SLUG };

// New recipe (~38 s): trap-first hook (11 forgets 8, 8, 8), question, comment bait, the list by longest side
// (strip 7…12 cut down to 8…11, then 12 triangles pop in row by row with a zoom on 8, 8, 8), reveal + CTA pill.
// The first and last frames show the same two triangles (7, 8, 9 and 8, 8, 8) at the same place for the loop.

const before = () => -100;

/** A triangle with sides a <= b <= c on a base of length c, left end at (x, y); side labels sit inside it. */
const Tri: React.FC<{ s: [number, number, number]; u: number; x: number; y: number; color: string; labels?: number; glow?: number; size?: number; width?: number }> = ({ s, u, x, y, color, labels = 1, glow = 0, size = 52, width = 8 }) => {
  const [a, b, c] = s;
  const p = triPts(a, b, c, u, x, y);
  const g: Pt = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
  const lab = (q: Pt, r: Pt, t: number) => {
    const m: Pt = [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2];
    const d = Math.hypot(g[0] - m[0], g[1] - m[1]) || 1;
    const k = Math.min(size * 0.75, d * 0.6) / d;
    return (
      <text x={m[0] + (g[0] - m[0]) * k} y={m[1] + (g[1] - m[1]) * k} fontSize={size} fontWeight={900} fill={color} textAnchor="middle" dominantBaseline="central" fontFamily="Nunito" opacity={labels}>
        {t}
      </text>
    );
  };
  return (
    <>
      {glow > 0 && <Poly pts={p} color={C.red} width={26} opacity={glow * 0.55} fill="none" fillOpacity={0} />}
      <Poly pts={p} color={color} width={width} fill={color} fillOpacity={0.2} />
      {labels > 0 && (
        <>
          {lab(p[0], p[1], c)}
          {lab(p[0], p[2], b)}
          {lab(p[1], p[2], a)}
        </>
      )}
    </>
  );
};

/** The hook / reveal figure: 7, 8, 9 and the equilateral 8, 8, 8, big. */
const PAIR_U = 42;
const PAIR_Y = 900;
const Pair: React.FC<{ glow?: number; u?: number; y?: number }> = ({ glow = 0, u = PAIR_U, y = PAIR_Y }) => {
  const gap = 2 * u;
  const w = 9 * u + gap + 8 * u;
  const x1 = 540 - w / 2;
  return (
    <Stage>
      <Tri s={[7, 8, 9]} u={u} x={x1} y={y} color={COLS[2]} size={u * 1.25} />
      <Tri s={[8, 8, 8]} u={u} x={x1 + 9 * u + gap} y={y} color={COLS[3]} glow={glow} size={u * 1.25} />
    </Stage>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #14</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>11</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 780px">
        <Pair />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 660, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; note: number; pulse?: (i: number) => number }> = ({ start, note, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many triangles have <b style={{ color: C.violet, whiteSpace: 'nowrap' }}>whole-number sides</b> and a <b style={{ color: C.amber, whiteSpace: 'nowrap' }}>perimeter of 24</b>?
        <div style={{ ...fadeUp(f, note), color: C.muted, fontSize: 48, marginTop: 6 }}>Same 3 sides count once.</div>
      </div>
      <Pair u={30} y={920} />
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.55 + i * 0.08)} note={at(scene, 1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} note={-100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

// ---------- the list by longest side ----------

const STRIP = [7, 8, 9, 10, 11, 12];
const ROW_Y = [640, 790, 950, 1130]; // baselines for c = 11, 10, 9, 8
const ROW_U = 15.5;
const ROW_X = (j: number) => 165 + j * 178;

const ListScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const x12 = ease(f, at(scene, 0, 0.35), 10);
  const x7 = ease(f, at(scene, 1, 0.55), 10);
  const colorIn = ease(f, at(scene, 1, 0.85), 10);
  const rowsOn = at(scene, 2);
  const stripFade = fadeTo(f, rowsOn - 4, 0.55, 10);
  // pop frames per triangle, row by row, on the words
  const pops: number[][] = [
    [0.02, 0.07, 0.12, 0.17, 0.22].map((t) => at(scene, 2, t)),
    [0.42, 0.47, 0.52, 0.57].map((t) => at(scene, 2, t)),
    [0.76, 0.82].map((t) => at(scene, 2, t)),
    [at(scene, 3, 0.35)],
  ];
  const zIn = at(scene, 3, 0.42);
  const zOut = scene.frames - 16;
  const zoom = 1 + 0.4 * ease(f, zIn, 12) - 0.4 * ease(f, zOut, 10);
  // readout: which longest side we are on, and how many it gives
  const step = f >= pops[3][0] ? 3 : f >= pops[2][0] ? 2 : f >= pops[1][0] ? 1 : 0;
  const shown = pops[step].filter((t) => f >= t + 4).length;
  const read = ease(f, pops[0][0], 8);
  const flat = pops.flat();
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.35)} src={SFX.buzz} volume={0.18} />
      <Sfx at={at(scene, 1, 0.55)} src={SFX.buzz} volume={0.18} />
      {flat.map((t, i) => (i % 2 === 0 ? <Sfx key={i} at={t} src={SFX.click} volume={0.26} /> : null))}
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.22} />
      {/* strip of possible longest sides */}
      <div style={{ position: 'absolute', left: 70, width: 940, top: 280, display: 'flex', gap: 20, opacity: stripFade }}>
        {STRIP.map((n) => {
          const out = n === 12 ? x12 : n === 7 ? x7 : 0;
          const col = n >= 8 && n <= 11 ? COLS[11 - n] : C.muted;
          const fill = out > 0.5 ? 'transparent' : colorIn > 0 && n >= 8 && n <= 11 ? col : C.card;
          return (
            <div key={n} style={{ position: 'relative', width: 140, height: 130, borderRadius: 24, background: fill, border: `6px solid ${out > 0.5 ? C.red : n >= 8 && n <= 11 ? col : C.line}`, color: out > 0.5 ? C.red : fill === C.card ? C.ink : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 900, boxSizing: 'border-box' }}>
              {n}
              {out > 0 && <div style={{ position: 'absolute', left: 10, top: 56, width: 108 * out, height: 10, background: C.red, borderRadius: 5, transform: 'rotate(-20deg)' }} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 450, textAlign: 'center', fontSize: 70, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, at(scene, 0, 0.3), 8) * fadeTo(f, at(scene, 1), 0, 8) }}>
          longest &lt; <span style={{ color: C.red }}>12</span> = 24 ÷ 2
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, at(scene, 1, 0.1), 8) * fadeTo(f, rowsOn - 6, 0, 8) }}>
          <span style={{ color: C.red }}>7 + 7 + 7 = 21</span> &lt; 24
        </div>
      </div>
      {/* the 12 triangles, row by row */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${ROW_X(0) + 60}px ${ROW_Y[3] - 50}px` }}>
        {LIST.map((L, i) => (
          <div key={L.c}>
            <div style={{ position: 'absolute', left: 30, top: ROW_Y[i] - 100, width: 124, height: 100, borderRadius: 22, background: COLS[i], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 66, fontWeight: 900, ...fadeUp(f, pops[i][0] - 6, 8) }}>
              {L.c}
            </div>
            <Stage>
              {L.rows.map((r, j) => {
                const s = pop(f, pops[i][j]);
                if (f < pops[i][j]) return null;
                const x = ROW_X(j);
                const cx = x + (L.c * ROW_U) / 2;
                return (
                  <g key={j} transform={`translate(${cx} ${ROW_Y[i]}) scale(${s}) translate(${-cx} ${-ROW_Y[i]})`}>
                    <Tri s={[r[0], r[1], L.c]} u={ROW_U} x={x} y={ROW_Y[i]} color={COLS[i]} labels={0} width={6} />
                  </g>
                );
              })}
              {i === 3 && (
                <text x={ROW_X(0) + 8 * ROW_U + 26} y={ROW_Y[3] - 36} fontSize={48} fontWeight={900} fill={COLS[3]} fontFamily="Nunito" opacity={ease(f, zIn + 6, 8)}>
                  8, 8, 8
                </text>
              )}
            </Stage>
          </div>
        ))}
      </div>
      {/* readout chip */}
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1200, display: 'flex', justifyContent: 'center', opacity: read }}>
        <div style={{ background: COLS[step], color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap' }}>
          longest {LIST[step].c} → {shown}
        </div>
      </div>
    </>
  );
};

// ---------- reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.66);
  const chime = at(scene, 0, 0.97);
  const terms = [0.02, 0.15, 0.3, 0.44].map((t) => at(scene, 0, t));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 116, fontWeight: 900, lineHeight: 1.1 }}>12</span>
          <span style={{ fontSize: 70, fontWeight: 900 }}>triangles</span>
        </div>
      </div>
      <Pair glow={ease(f, at(scene, 1, 0.5), 8)} />
      <div style={{ position: 'absolute', left: 60, width: 860, top: 945, display: 'flex', justifyContent: 'center', gap: 18, fontSize: 70, fontWeight: 900, whiteSpace: 'nowrap' }}>
        {[5, 4, 2, 1].map((n, i) => (
          <span key={i} style={{ display: 'flex', gap: 18, opacity: ease(f, terms[i], 6) }}>
            {i > 0 && <span style={{ color: C.muted }}>+</span>}
            <span style={{ color: COLS[i] }}>{n}</span>
          </span>
        ))}
        <span style={{ color: C.green, opacity: ease(f, hit, 6) }}>= 12</span>
      </div>
      <Text x={490} y={1050} w={860} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        11 leaves out 8, 8, 8
      </Text>
      <CtaPill start={at(scene, 2)} y={1160} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, list: ListScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

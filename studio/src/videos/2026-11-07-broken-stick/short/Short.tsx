import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage, type Pt } from '../../../lib/grid';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { NUNITO } from '../../../lib/fonts';
import { C } from '../../../lib/theme';
import { CHIME, HEX, Ln, P, Pg, SLUG, Stick, T, V1, V2, V3, Verdict, WIN, centroid, flipPt, pathOf, win } from '../Composition';

export { SLUG };

// ~40 s, AMC 10 #21. Trap: E 1/4 (the triangle chance). Aha: two cuts = one dot in a square; the winning dots
// in the top half make a hexagon of six 30-triangles = 180 of 1800. Hook and reveal share the same small figure
// (stick + square + dot at (17, 36)) so the loop cuts cleanly.

const CHOICES = ['\\dfrac1{20}', '\\dfrac1{12}', '\\dfrac1{10}', '\\dfrac16', '\\dfrac14'];

type M = (x: number, y: number) => Pt;
/** Square map, maths coords (y up), 60 × 60, top-left corner at (x0, top), s px per unit. */
const mk = (x0: number, top: number, s: number): M => (x, y) => [x0 + s * x, top + (60 - y) * s];
const SQ: Pt[] = [V1, [60, 0], V3, V2];
const TOP: Pt[] = [V1, V2, V3];
const BOT: Pt[] = [V1, [60, 0], V3];
const tpm = (ps: Pt[], m: M): Pt[] => ps.map((p) => m(p[0], p[1]));

// shared small figure (hook + reveal)
const FIG = { x0: 300, top: 620, s: 8 };
const figM = mk(FIG.x0, FIG.top, FIG.s);
const FIG_STICK = { x0: FIG.x0, y: 530, w: 60 * FIG.s, h: 44 };
const DOT: Pt = [17, 36]; // pieces 17 | 19 | 24, a winner (inside the hexagon)

/** Stick + square + dot. `top` / `hex` fade in the top-half shading and the winning hexagon. */
const Figure: React.FC<{ top?: number; hex?: number; pulse?: number }> = ({ top = 0, hex = 0, pulse = 0 }) => {
  const d = figM(DOT[0], DOT[1]);
  return (
    <>
      <Stick {...FIG_STICK} a={DOT[0]} b={DOT[1]} />
      <Stage>
        <Pg pts={tpm(SQ, figM)} fill={C.card} />
        <Pg pts={tpm(TOP, figM)} fill={C.blue} fo={0.2 * top} />
        <Ln a={figM(0, 0)} b={figM(60, 60)} color={C.ink} sw={5} op={top} />
        <Pg pts={tpm(HEX, figM)} fill={C.green} fo={0.55} stroke="#0a7a3c" sw={5 + 3 * pulse} op={hex} />
        <Pg pts={tpm(SQ, figM)} stroke={C.ink} sw={5} />
        <circle cx={d[0]} cy={d[1]} r={13} fill={C.ink} stroke="#fff" strokeWidth={4} />
      </Stage>
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.85);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #21</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1/4</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 820px">
        <Figure />
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

/** Question card + the stick + the five choices. `snap` = frame the stick snaps (grey → coloured), `hl` = frame the shortest/longest tags show. */
const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; snap: number; hl: number }> = ({ start, pulse = () => 1, snap, hl }) => {
  const f = useCurrentFrame();
  const on = f >= hl;
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Snap a stick at <b style={{ color: C.violet }}>2 random spots</b>. Chance the <b style={{ color: C.amber }}>longest</b> piece is less than <b style={{ color: C.primary }}>twice the shortest</b>?
      </div>
      <Stick
        x0={120} y={650} w={840} h={56} a={15} b={40} gap={ease(f, snap, 12) * 14} neutral={1 - ease(f, snap, 8)}
        hl={on ? [0, 1] : []} labels={on ? ['shortest', 'longest', null] : []} lsize={44}
      />
      <div style={{ position: 'absolute', left: 60, top: 780, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={60} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.45 + i * 0.08)} snap={at(scene, 0, 0.35)} hl={at(scene, 1, 0.35)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    <Sfx at={at(scene, 0, 0.35)} src={SFX.click} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} snap={-100} hl={-100} />
      <CommentBubble y={1160} />
    </>
  );
};

// ---------- aha: the map ----------
const BIG = { x0: 150, top: 470, s: 12 };
const bigM = mk(BIG.x0, BIG.top, BIG.s);
const HEX_C = bigM(21, 39); // centre of the hexagon's box (x 12…30, y 30…48)
const ZOOM = 2;
const ZOOM_TO: Pt = [540, 800];
/** Offset grid of dots in the top half (never exactly on a border), with their win / lose state. */
const GRID: { p: Pt; ok: boolean }[] = [];
for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) {
  const x = 1.5 + 3 * i, y = 1.5 + 3 * j;
  if (y > x) GRID.push({ p: [x, y], ok: win(x, y) });
}

const MapScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1), l2 = at(scene, 2), l3 = at(scene, 3);
  // L0: dot steps through three cut pairs
  const ex: Pt[] = [[14, 41], [45, 20], [30, 52]];
  const stepAt = [at(scene, 0, 0.55), at(scene, 0, 0.72), at(scene, 0, 0.88)];
  // L2: a probe walks along y = 40 with the scan line
  const scan0 = l2 + 2, scan1 = l2 + 62;
  const scanX = 3 + 30 * ease(f, scan0, scan1 - scan0);
  let dot: Pt = ex[0];
  stepAt.forEach((s, i) => { if (f >= s) dot = ex[i]; });
  if (f >= scan0) dot = [scanX, 41];
  const probeOn = f < l3 + 4;
  const ok = win(dot[0], dot[1]);
  // zoom onto the hexagon for the six triangles, then back out
  const z = ease(f, l2 + 50, 22) - ease(f, at(scene, 3, 0.9), 14);
  const s = 1 + (ZOOM - 1) * z;
  const tgt: Pt = [HEX_C[0] + z * (ZOOM_TO[0] - HEX_C[0]), HEX_C[1] + z * (ZOOM_TO[1] - HEX_C[1])];
  const tx = tgt[0] - s * HEX_C[0], ty = tgt[1] - s * HEX_C[1];
  // L1: diagonal, the bottom folds onto the top, top half shaded
  const diag = ease(f, l1, 20);
  const flip = ease(f, at(scene, 1, 0.15), 34);
  const fold = ease(f, at(scene, 1, 0.12), 6) * fadeTo(f, at(scene, 1, 0.5), 0, 14);
  const bottomDim = ease(f, at(scene, 1, 0.45), 14);
  const topOn = ease(f, at(scene, 1, 0.45), 14);
  // L3: hexagon outline, six triangles one by one
  const triAt = (i: number) => at(scene, 3, 0.36 + 0.075 * i);
  const count = WIN.filter((_, i) => f >= triAt(i)).length;
  const hexLine = ease(f, at(scene, 3, 0.05), 12);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {stepAt.map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.25} />)}
      <Sfx at={l1} src={SFX.whoosh} volume={0.22} />
      {[0, 1, 2, 3].map((i) => <Sfx key={`s${i}`} at={scan0 + 8 + i * 14} src={SFX.click} volume={0.22} />)}
      <Sfx at={l2 + 50} src={SFX.whoosh} volume={0.25} />
      {WIN.map((_, i) => <Sfx key={`t${i}`} at={triAt(i)} src={SFX.click} volume={0.3} />)}
      <Sfx at={at(scene, 3, 0.9)} src={SFX.whoosh} volume={0.22} />
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(400px 0 600px 0)' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Stage>
          <Pg pts={tpm(SQ, bigM)} fill={C.card} op={ease(f, at(scene, 0, 0.4), 12)} />
          <Pg pts={tpm(BOT, bigM)} fill={GREY_FILL} fo={bottomDim} />
          <Pg pts={tpm(TOP, bigM)} fill={C.blue} fo={0.18 * topOn} />
          {fold > 0 && <Pg pts={tpm(BOT.map((p) => flipPt(p, flip)), bigM)} fill={C.violet} fo={0.35} stroke={C.violet} sw={5} op={fold} />}
          <Ln a={bigM(0, 0)} b={bigM(60, 60)} color={C.ink} sw={6} prog={diag} />
          {/* L2: every dot lights up as the scan passes it; winners green */}
          {GRID.map(({ p, ok: w }, i) => {
            const q = bigM(p[0], p[1]);
            const lit = f >= scan0 && scanX >= p[0];
            return <circle key={i} cx={q[0]} cy={q[1]} r={w && lit ? 6 : 4.5} fill={w && lit ? C.green : C.muted} opacity={ease(f, l2 - 6, 8) * (lit ? (w ? 1 : 0.35) : 0.6)} />;
          })}
          <clipPath id="bs-scan">
            <rect x={0} y={0} width={bigM(scanX, 0)[0]} height={1920} />
          </clipPath>
          <path d={pathOf(tpm(HEX, bigM))} fill={C.green} fillOpacity={0.35} clipPath="url(#bs-scan)" opacity={f >= scan0 ? 1 : 0} />
          <Pg pts={tpm(HEX, bigM)} stroke="#0a7a3c" sw={4} op={hexLine} />
          {WIN.map((w, i) => {
            const o = ease(f, triAt(i), 6);
            const ce = bigM(...centroid(w));
            return (
              <g key={i} opacity={o}>
                <Pg pts={tpm(w, bigM)} fill={C.green} fo={0.35} stroke="#0a7a3c" sw={2.5} />
                <text x={ce[0]} y={ce[1]} fontFamily={NUNITO} fontSize={27} fontWeight={900} fill="#0a5a2c" textAnchor="middle" dominantBaseline="middle" style={{ transform: `scale(${pop(f, triAt(i))})`, transformOrigin: `${ce[0]}px ${ce[1]}px`, transformBox: 'view-box' }}>30</text>
              </g>
            );
          })}
          <Pg pts={tpm(SQ, bigM)} stroke={C.ink} sw={5} op={ease(f, at(scene, 0, 0.4), 12)} />
          <T x={bigM(14, 52)[0]} y={bigM(14, 52)[1]} size={64} fill={C.blue} op={ease(f, at(scene, 1, 0.78), 10) * fadeTo(f, l2, 0, 8)}>1800</T>
          {probeOn && (
            <circle cx={bigM(dot[0], dot[1])[0]} cy={bigM(dot[0], dot[1])[1]} r={15} fill={f >= scan0 ? (ok ? C.green : C.red) : C.ink} stroke="#fff" strokeWidth={4} opacity={ease(f, at(scene, 0, 0.5), 6) * fadeTo(f, l3, 0, 6)} />
          )}
          {f >= scan0 && <Ln a={bigM(scanX, 0)} b={bigM(scanX, 60)} color={C.green} sw={4} dash="10 10" op={fadeTo(f, scan1, 0, 8)} />}
        </Stage>
        <Stage>
          <g opacity={ease(f, at(scene, 0, 0.45), 12) * (1 - z)}>
            <T x={bigM(30, 0)[0]} y={bigM(0, 0)[1] + 40} size={40} fill={C.muted} weight={800} halo={false}>first cut</T>
            <text transform={`translate(${BIG.x0 - 34} ${bigM(0, 30)[1]}) rotate(-90)`} fontFamily={NUNITO} fontSize={40} fontWeight={800} fill={C.muted} textAnchor="middle">second cut</text>
          </g>
        </Stage>
      </div>
      </div>
      {/* top band: the stick (L0–L2) and then the 30-counter (L3) */}
      <div style={{ opacity: fadeTo(f, l3, 0, 8) }}>
        <Stick x0={BIG.x0} y={300} w={720} h={56} a={Math.min(dot[0], dot[1])} b={Math.max(dot[0], dot[1])} ruler={[0, 60]} rulerOp={ease(f, at(scene, 0, 0.2), 10)} />
        <Stage>
          <Verdict x={950} y={328} ok={ok} op={f >= scan0 && probeOn ? 1 : 0} />
        </Stage>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: ease(f, triAt(0), 8) }}>
        <div style={{ background: C.green, color: '#fff', borderRadius: 24, padding: '8px 44px', fontSize: 72, fontWeight: 900, boxShadow: '0 10px 30px rgba(33,196,93,0.3)' }}>
          {count >= 6 && f >= at(scene, 3, 0.82) ? '6 × 30 = 180' : `${Math.max(1, count)} × 30 = ${30 * Math.max(1, count)}`}
        </div>
      </div>
    </>
  );
};
const GREY_FILL = '#c9ced8';

/** The answer, the trap, then the CTA pill over the same small figure as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.73);
  const chime = at(scene, 0, 0.97);
  const pulse = Math.max(0, Math.sin(((f - 6) / 24) * Math.PI)) * (f < 30 ? 1 : 0);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: ease(f, 2, 8) * fadeTo(f, hit, 0, 4) }}>
        <Tex tex="\dfrac{180}{1800}" size={70} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '4px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 80, fontWeight: 900 }}>C</span>
          <span style={{ fontSize: 60, fontWeight: 900, opacity: 0.8 }}>·</span>
          <Tex tex="\dfrac1{10}" size={70} color="#fff" />
        </div>
      </div>
      <Figure top={1} hex={1} pulse={pulse} />
      <Text x={540} y={1110} w={960} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        1/4 = the triangle chance
      </Text>
      <CtaPill start={at(scene, 2)} y={1195} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={21} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, map: MapScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

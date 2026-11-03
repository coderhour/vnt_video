import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, Fig, Lbl, Q, Radius, SLUG, view } from '../Composition';

export { SLUG };

// New recipe: trap-first AMC 10 hook (81 = half the perimeter), question, comment bait, the aha (equal tangent pieces
// -> z formula -> y >= 3 -> the triangle snaps to y = 3, z = 72 while the camera pulls back), reveal 9 + 75 + 78 = 162,
// then the camera pushes back into corner A so the last frame matches frame 0.

type Geo = ReturnType<typeof Q>;
type M = (p: Pt) => Pt;
const before = () => -100;

// Camera: FM shows the whole 9-75-78 triangle; zoom s about (ZX, ZY) maps it, at s = S_IN, onto HM (corner A close up).
const FM = view(80, 860, 12);
const S_IN = 3.75; // 45 / 12
const ZX = (80 * S_IN - 150) / (S_IN - 1);
const ZY = (860 * S_IN - 1150) / (S_IN - 1);
const cam = (s: number): M => (p) => {
  const q = FM(p);
  return [ZX + (q[0] - ZX) * s, ZY + (q[1] - ZY) * s];
};
const HM = cam(S_IN); // = view(150, 1150, 45)
const BIG = Q(3, 72);
const SMALL = Q(7, 8);

const Seg: React.FC<{ a: Pt; b: Pt; color: string; w?: number; o?: number }> = ({ a, b, color, w = 13, o = 1 }) =>
  o <= 0 ? null : <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={o} />;

/** Point `d` px from the middle of pq, on the side away from `from`. */
const away = (p: Pt, q: Pt, from: Pt, d: number): Pt => {
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  let nx = -(q[1] - p[1]) / len;
  let ny = (q[0] - p[0]) / len;
  if ((mx - from[0]) * nx + (my - from[1]) * ny < 0) [nx, ny] = [-nx, -ny];
  return [mx + nx * d, my + ny * d];
};

/** Tangent pieces 6 / y / z (green / violet / amber); `o` per corner, `lab` = label opacity. */
const Pieces: React.FC<{ g: Geo; m: M; o: [number, number, number]; lab?: number; labels?: [string, string, string]; w?: number }> = ({ g, m, o, lab = 1, labels = ['6', 'y', 'z'], w = 13 }) => {
  const [A, B, Cc, I, TAC, TAB, TBC] = [g.A, g.B, g.C, g.I, g.TAC, g.TAB, g.TBC].map(m) as Pt[];
  const col = [C.primary, C.violet, C.amber];
  const segs: [Pt, Pt, number][] = [[A, TAC, 0], [A, TAB, 0], [B, TAB, 1], [B, TBC, 1], [Cc, TAC, 2], [Cc, TBC, 2]];
  return (
    <>
      {segs.map(([p, q, c], i) => (
        <g key={i}>
          <Seg a={p} b={q} color={col[c]} w={w} o={o[c]} />
          <Lbl p={away(p, q, I, 56)} text={labels[c]} color={col[c]} size={58} o={o[c] * lab} />
        </g>
      ))}
    </>
  );
};

const Chip: React.FC<{ y?: number; color?: string; opacity?: number; scale?: number; children: React.ReactNode }> = ({ y = 280, color = C.violet, opacity = 1, scale = 1, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, background: color, color: '#fff', borderRadius: 26, padding: '12px 44px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 18 }}>{children}</div>
    </div>
  );

/** Corner A of the biggest triangle, close up: the sides run off the screen (no lengths, so no answer). */
const Corner: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <>
    <Radius g={BIG} m={HM} o={o} />
    <Pieces g={BIG} m={HM} o={[o, 0, 0]} />
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #7</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>81</span>?
      </Text>
      <PushIn frames={scene.frames} origin="300px 1000px">
        <Stage>
          <Fig g={BIG} m={HM}>
            <Corner />
          </Fig>
        </Stage>
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

const QM = view(300, 1010, 34);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '20px 36px', fontSize: 54, fontWeight: 800, lineHeight: 1.32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>Whole-number</b> sides. A circle of radius <b>4</b> touches AB and AC <b style={{ color: C.primary }}>6</b> from A. <b>Biggest perimeter?</b>
      </div>
      <Stage>
        <Fig g={SMALL} m={QM}>
          <Radius g={SMALL} m={QM} o={1} />
          <Pieces g={SMALL} m={QM} o={[1, 0, 0]} w={11} />
        </Fig>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1080, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: equal pieces 6, y, z -> the z formula -> y >= 3 -> snap to y = 3, z = 72 and pull the camera back. */
const PiecesScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const snap = t(3, 0.08);
  const big = f >= snap;
  const g = big ? BIG : SMALL;
  const s = S_IN - (S_IN - 1) * ease(f, snap, 34);
  const m = cam(s);
  const p3: [number, number, number] = [ease(f, t(0, 0.35), 8), ease(f, t(0, 0.6), 8), ease(f, t(0, 0.8), 8)];
  const bottom = ease(f, t(2, 0.05), 8);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0.35, 0.6, 0.8].map((p) => <Sfx key={p} at={t(0, p)} src={SFX.click} volume={0.26} />)}
      <Sfx at={t(1, 0.3)} src={SFX.click} volume={0.25} />
      <Sfx at={t(2, 0.5)} src={SFX.click} volume={0.25} />
      <Sfx at={snap} src={SFX.whoosh} volume={0.3} />
      <Sfx at={t(3, 0.7)} src={SFX.click} volume={0.3} />
      <Stage>
        <Fig g={g} m={m} letters={big ? fadeTo(f, snap, 0, 6) : 1}>
          <Radius g={g} m={m} o={fadeTo(f, snap, 0, 6)} />
          <Pieces g={g} m={m} o={p3} lab={big ? 0 : 1} w={big ? lerpW(s) : 13} />
        </Fig>
        {big && <Lbl p={[(m(BIG.TAC)[0] + m(BIG.C)[0]) / 2, m(BIG.C)[1] + 52]} text="72" size={62} color={C.amber} o={ease(f, t(3, 0.7), 8)} />}
        {big && <Lbl p={[m(BIG.TAC)[0] - 6, m(BIG.C)[1] + 52]} text="6" size={52} color={C.primary} o={ease(f, t(3, 0.7), 8)} />}
      </Stage>
      <Chip opacity={fadeTo(f, t(1, 0.05), 0, 6)} scale={pop(f, 3)}>
        equal tangent pieces
      </Chip>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 270, display: 'flex', justifyContent: 'center', ...fadeUp(f, t(1, 0.3)), opacity: ease(f, t(1, 0.3), 10) * fadeTo(f, snap, 0, 8) }}>
        <div style={{ background: C.card, borderRadius: 28, padding: '10px 40px', boxShadow: '0 8px 30px rgba(30,40,80,0.08)' }}>
          <Tex tex={`z = \\dfrac{8y + 48}{${bottom > 0.5 ? '\\color{#ef4343}{3y - 8}' : '3y - 8'}}`} size={66} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 400, top: 470, whiteSpace: 'nowrap', ...fadeUp(f, t(2, 0.5)), opacity: ease(f, t(2, 0.5), 10) * fadeTo(f, snap, 0, 8) }}>
        <Tex tex="3y - 8 > 0 \;\Rightarrow\; y \ge 3" size={56} />
      </div>
      <Chip color={C.primary} opacity={ease(f, t(3, 0.45), 6)} scale={pop(f, t(3, 0.45))}>
        <Tex tex="y = 3 \;\to\; z = 72" size={66} color="#fff" />
      </Chip>
    </>
  );
};
/** Piece stroke: thinner as the camera pulls back. */
const lerpW = (s: number) => 7 + (13 - 7) * ((s - 1) / (S_IN - 1));

/** 9 + 75 + 78 = 162, the trap, then the camera pushes back into corner A (the hook's frame) under the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const hit = t(0, 0.62);
  const chime = t(0, 0.97);
  const trap = t(1, 0.05);
  const push = ease(f, t(1, 0.3), 40);
  const s = 1 + (S_IN - 1) * push;
  const m = cam(s);
  const labs = fadeTo(f, t(1, 0.3), 0, 10);
  const [A, B, Cc, I] = [BIG.A, BIG.B, BIG.C, BIG.I].map(FM);
  const side = (p: Pt, text: string, st: number, color: string) => <Lbl p={p} text={text} size={62} color={color} o={ease(f, st, 8) * labs} />;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 66, fontWeight: 900 }}>E</span>
          <Tex tex="162" size={110} color="#fff" />
        </div>
      </div>
      <Stage>
        <Fig g={BIG} m={m} letters={Math.max(labs, ease(f, t(1, 0.3) + 30, 10))}>
          <Pieces g={BIG} m={m} o={[1, labs, labs]} lab={0} w={lerpW(s)} />
          <Corner o={ease(f, t(1, 0.3) + 30, 10)} />
        </Fig>
        {side(away(A, B, I, 50), '9', t(0, 0.05), C.ink)}
        {side(away(B, Cc, I, 46), '75', t(0, 0.17), C.ink)}
        {side(away(A, Cc, I, 52), '78', t(0, 0.33), C.ink)}
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 560, display: 'flex', justifyContent: 'center', opacity: ease(f, t(0, 0.45), 10) * labs }}>
        <Tex tex="9 + 75 + 78 = 162" size={70} />
      </div>
      <Text x={540} y={470} w={960} size={62} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        81 is only half ✗
      </Text>
      <CtaPill start={t(2)} y={1232} />
      <Sfx at={0} src={SFX.whoosh} volume={0.25} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sfx at={t(1, 0.3)} src={SFX.whoosh} volume={0.25} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={11} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pieces: PiecesScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

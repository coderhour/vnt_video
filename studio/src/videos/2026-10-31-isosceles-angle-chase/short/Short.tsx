import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHOICES, Fig, SLUG, VA, VC, VD, allTicks, arcA, arcABD, arcB, arcBDC, arcC, labA, labABD, labB, labC, labD, pulse } from '../Composition';

export { SLUG };
const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const before = -100;

// ---- geometry copy (same maths as Composition's geo) so flying labels can start/land on the figure's label spots ----
type Pt = [number, number];
type Names = 'A' | 'B' | 'C' | 'D';
const geo = (bx: number, by: number, H: number, apex = 44) => {
  const h = Math.tan(((180 - apex) / 2) * (Math.PI / 180));
  const t = (h * h - 3) / (1 + h * h);
  const s = H / h;
  const m = (x: number, y: number): Pt => [bx + x * s, by - y * s];
  return { P: { A: m(1, h), B: m(0, 0), C: m(2, 0), D: m(1 + t, h * (1 - t)) } as Record<Names, Pt>, s };
};
const angOf = (V: Pt, Q: Pt) => (Math.atan2(-(Q[1] - V[1]), Q[0] - V[0]) * 180) / Math.PI;
const span = (a1: number, a2: number) => ((((a2 - a1) % 360) + 540) % 360) - 180;
const polar = (V: Pt, a: number, r: number): Pt => [V[0] + r * Math.cos((a * Math.PI) / 180), V[1] - r * Math.sin((a * Math.PI) / 180)];
/** Where Composition's label helpers put their text (labA, labABD, labD, labC, labB). */
const labPos = (bx: number, by: number, H: number) => {
  const { P, s } = geo(bx, by, H);
  const bis = (v: Names, p: Names, q: Names, rf: number) => {
    const a1 = angOf(P[v], P[p]);
    return polar(P[v], a1 + span(a1, angOf(P[v], P[q])) / 2, rf * s);
  };
  return { A: bis('A', 'B', 'C', 1.0), ABD: bis('B', 'A', 'D', 1.4), D: bis('D', 'B', 'C', 0.62), C: polar(P.C, 160, 0.85 * s), B: polar(P.B, 100, 0.85 * s), P };
};

type TickT = { a: Names; b: Names; frac: number; n: number; op: number; flash?: number };
/** Equal-side ticks, always on; `t1` flashes AB = AC, `t2` flashes BD = BC. */
const ticks = (f: number, t1 = before, t2 = before): TickT[] => [
  { a: 'A', b: 'B', frac: 0.22, n: 1, op: 1, flash: pulse(f, t1) },
  { a: 'A', b: 'C', frac: 0.22, n: 1, op: 1, flash: pulse(f, t1) },
  { a: 'B', b: 'D', frac: 0.5, n: 2, op: 1, flash: pulse(f, t2) },
  { a: 'B', b: 'C', frac: 0.5, n: 2, op: 1, flash: pulse(f, t2) },
];

/** Label text flying from one spot to another (same font as the figure's labels). */
const Fly: React.FC<{ from: Pt; to: Pt; start: number; text: string; color: string; dur?: number; fadeAt: number }> = ({ from, to, start, text, color, dur = 14, fadeAt }) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const p = ease(f, start, dur);
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p - 60 * Math.sin(p * Math.PI);
  const o = fadeTo(f, fadeAt, 0, 4);
  if (o <= 0) return null;
  return (
    <Stage>
      <text x={x} y={y} fontSize={60} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={color} stroke={C.bg} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round" opacity={o}>
        {text}
      </text>
    </Stage>
  );
};

const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, ...style }}>{children}</div>
);

// Figure as placed in the hook and at the end of the reveal (same spot, so the loop cuts cleanly).
const HB = { bx: 322, by: 1060, H: 540 };

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <Center y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #33</div>
      </Center>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>24°</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 800px">
        <Fig {...HB} ticks={ticks(f)} arcs={[arcABD(1)]} labels={[labABD('24°', 1), labA('?', 1)]} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Center y={680} style={{ opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Center>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number; t1?: number; t2?: number; g?: number }> = ({ start, pulse: pl = () => 1, t1, t2, g = before }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>AB = AC</b>, D on AC with <b style={{ color: C.violet }}>BD = BC</b>. Angle ABD is <b style={{ color: VD }}>24°</b>. Find the top <b style={{ color: VA }}>angle A</b>.
      </div>
      <Fig bx={370} by={1005} H={420} ticks={ticks(f, t1, t2)} arcs={[arcABD(ease(f, g, 8))]} labels={[labABD('24°', ease(f, g, 8), 1 + 0.25 * pulse(f, g)), labA('?', 1)]} />
      <div style={{ position: 'absolute', left: 60, top: 1065, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pl(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c.replace('°', '^\\circ')} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.15 + i * 0.1)} t1={at(scene, 0, 0.05)} t2={at(scene, 0, 0.35)} g={at(scene, 0, 0.62)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

// ---------- the aha: chase a + 24 around the figure ----------
const CB = { bx: 298, by: 1180, H: 600 };
const BASE = 1.12; // figure scale (labels ≈ 60 px)
const toScreen = ([x, y]: Pt): Pt => [540 + (x - 540) * BASE, 900 + (y - 900) * BASE];

const Readout: React.FC<{ op: number; tex: string; size?: number }> = ({ op, tex, size = 76 }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op, whiteSpace: 'nowrap' }}>
      <div style={{ background: C.card, borderRadius: 26, padding: '10px 36px', boxShadow: '0 8px 26px rgba(30,40,80,0.08)' }}>
        <Tex tex={tex} size={size} />
      </div>
    </div>
  );

const Chase: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const L = labPos(CB.bx, CB.by, CB.H);
  const aName = at(scene, 0, 0.12);
  const zoomIn = at(scene, 0, 0.36);
  const bdc = at(scene, 0, 0.45);
  const flyA = at(scene, 0, 0.62);
  const fly24 = at(scene, 0, 0.74);
  const dLab = at(scene, 0, 0.9);
  const zoomOut = at(scene, 1, 0.02);
  const t2 = at(scene, 1, 0.08);
  const flyC = at(scene, 1, 0.5);
  const cLab = at(scene, 1, 0.72);
  const t1 = at(scene, 2, 0.05);
  const flyB = at(scene, 2, 0.4);
  const bLab = at(scene, 2, 0.62);
  const l3 = at(scene, 3);
  const pC = at(scene, 3, 0.3);
  const pB = at(scene, 3, 0.42);
  const pA = at(scene, 3, 0.54);
  const sum2 = at(scene, 3, 0.72);
  const zoom = 1 + 0.3 * ease(f, zoomIn, 12) - 0.3 * ease(f, zoomOut, 12);
  const zo = toScreen([(L.ABD[0] + L.D[0]) / 2 + 20, (L.A[1] + L.D[1]) / 2 + 30]);
  const ap = 1 + 0.3 * pulse(f, aName, 24) + 0.3 * pulse(f, pA, 18);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={aName} src={SFX.click} volume={0.25} />
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={flyA} src={SFX.click} volume={0.28} />
      <Sfx at={fly24} src={SFX.click} volume={0.28} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={flyC} src={SFX.click} volume={0.28} />
      <Sfx at={flyB} src={SFX.click} volume={0.28} />
      {[pC, pB, pA].map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.25} />)}

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${zo[0]}px ${zo[1]}px` }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${BASE})`, transformOrigin: '540px 900px' }}>
          <Fig
            {...CB}
            shades={[{ pts: ['A', 'B', 'D'], color: 'rgba(245, 159, 10, 0.16)', op: ease(f, bdc - 6, 10) * fadeTo(f, zoomOut + 10, 0, 10) }]}
            ticks={ticks(f, t1, t2)}
            arcs={[arcABD(1), arcA(1), arcBDC(ease(f, bdc, 10)), arcC(ease(f, cLab, 10)), arcB(ease(f, bLab, 10))]}
            labels={[
              labABD('24°', 1, 1 + 0.3 * pulse(f, fly24 - 4, 20)),
              labA(f < aName ? '?' : 'a', 1, ap),
              labD('a+24', ease(f, dLab, 6)),
              { ...labC('a+24', ease(f, cLab, 6)), scale: 1 + 0.3 * pulse(f, pC, 18) },
              { ...labB('a+24', ease(f, bLab, 6)), scale: 1 + 0.3 * pulse(f, pB, 18) },
            ]}
          />
          <Fly from={L.A} to={L.D} start={flyA} text="a" color={VA} fadeAt={dLab} />
          <Fly from={L.ABD} to={L.D} start={fly24} text="24" color={VD} fadeAt={dLab} />
          <Fly from={L.D} to={L.C} start={flyC} text="a+24" color={VC} fadeAt={cLab} dur={16} />
          <Fly from={L.C} to={L.B} start={flyB} text="a+24" color={VC} fadeAt={bLab} dur={16} />
        </div>
      </div>
      <Readout op={ease(f, 4, 8) * fadeTo(f, at(scene, 1, 0.45), 0, 6)} tex={`\\text{outside } \\angle D = ${col(VA, 'a')} + ${col(VD, '24')}`} size={70} />
      <Readout op={ease(f, at(scene, 1, 0.5), 6) * fadeTo(f, at(scene, 2), 0, 6)} tex={`\\angle C = ${col(VC, 'a+24')}`} />
      <Readout op={ease(f, at(scene, 2) + 4, 6) * fadeTo(f, l3, 0, 6)} tex={`\\angle ABC = ${col(VC, 'a+24')}`} />
      <Readout op={ease(f, l3 + 4, 6) * fadeTo(f, sum2, 0, 6)} tex={`${col(VC, '(a+24)')} + ${col(VC, '(a+24)')} + ${col(VA, 'a')} = 180`} size={60} />
      <Readout op={ease(f, sum2 + 4, 6)} tex={`3a + 48 = 180`} size={80} />
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same figure as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1, 0.05);
  return (
    <>
      <Center y={290} style={{ opacity: ease(f, at(scene, 0, 0.05), 8) * fadeTo(f, hit - 4, 0, 4) }}>
        <Tex tex="3a = 132" size={90} />
      </Center>
      <Center y={290}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="a = 44^\circ" size={110} color="#fff" />
        </div>
      </Center>
      <Fig {...HB} ticks={ticks(f)} arcs={[arcABD(1)]} labels={[labABD('24°', 1, 1 + 0.3 * pulse(f, trap, 24)), labA(f < hit ? '?' : '44°', 1, 1 + 0.3 * pulse(f, hit, 20))]} />
      <Text x={490} y={1110} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        24° is angle ABD, not the top
      </Text>
      <CtaPill start={at(scene, 2)} y={1200} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, chase: Chase, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { NUNITO } from '../../../lib/fonts';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BOY, CH, CHIME, GIRL, SLUG } from '../Composition';

export { SLUG };

// New recipe (see the geometric-triangle reference): trap-first hook (5/28 = Choice B, one end gap forgotten),
// question, comment bait, the gap idea big (6 gaps, a zoom onto two touching girls, a counter that runs through
// all 20 gap choices), then the answer, the trap and the CTA pill. Hook and reveal show the same boys-and-gaps row.

/** A kid token. */
const Kid: React.FC<{ x: number; y: number; k: 'G' | 'B'; r?: number; s?: number; o?: number; ring?: string }> = ({ x, y, k, r = 44, s = 1, o = 1, ring }) =>
  s <= 0 || o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {ring && <circle r={r + 10} fill="none" stroke={ring} strokeWidth={7} />}
      <circle r={r} fill={k === 'G' ? GIRL : BOY} />
      <text y={2} fill="#fff" fontFamily={NUNITO} fontWeight={900} fontSize={r * 1.05} textAnchor="middle" dominantBaseline="central">
        {k}
      </text>
    </g>
  );

const KidRow: React.FC<{ order: string; y: number; r?: number; sp?: number }> = ({ order, y, r = 42, sp = 112 }) => (
  <>
    {order.split('').map((c, i) => (
      <Kid key={i} x={540 + (i - (order.length - 1) / 2) * sp} y={y} k={c as 'G' | 'B'} r={r} />
    ))}
  </>
);

// The boys-and-gaps row, full width: 11 slots alternating gap / boy, 94 px apart.
const Y = 780;
const PX = (k: number) => 70 + k * 94;
const BX = (i: number) => PX(2 * i + 1); // boy i (0…4)
const GX = (j: number) => PX(2 * j); // gap j (0 = left end, 5 = right end)
const CHOSEN = [0, 2, 5];

/** Boys + gap slots. `slot(j)` = slot opacity, `girls` = gaps holding a girl, `hi(j)` = slot ring colour. */
const GapRow: React.FC<{ boys?: (i: number) => number; slot?: (j: number) => number; girls?: number[]; girlS?: (j: number) => number; hi?: (j: number) => string | undefined; nums?: number }> = ({
  boys = () => 1, slot = () => 1, girls = [], girlS = () => 1, hi = () => undefined, nums = 1,
}) => (
  <>
    {[0, 1, 2, 3, 4, 5].map((j) => {
      const o = slot(j);
      const has = girls.includes(j);
      const ring = hi(j);
      return (
        <g key={j}>
          {o > 0 && !has && <circle cx={GX(j)} cy={Y} r={38} fill="#fff" fillOpacity={0.8} stroke={ring ?? C.primary} strokeWidth={ring ? 8 : 5} strokeDasharray={ring ? undefined : '10 8'} opacity={o} />}
          {o > 0 && (
            <text x={GX(j)} y={Y + 100} fill={C.primary} opacity={o * nums} fontFamily={NUNITO} fontWeight={900} fontSize={60} textAnchor="middle">
              {j + 1}
            </text>
          )}
          {has && <Kid x={GX(j)} y={Y} k="G" r={42} s={girlS(j)} ring={ring} />}
        </g>
      );
    })}
    {[0, 1, 2, 3, 4].map((i) => (
      <Kid key={i} x={BX(i)} y={Y} k="B" r={46} s={boys(i)} />
    ))}
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.88);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #52</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>5/28</span>?
      </Text>
      <PushIn frames={scene.frames} origin={`540px ${Y}px`}>
        <Stage>
          <GapRow />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 640, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
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
        <b style={{ color: BOY }}>5 boys</b> and <b style={{ color: GIRL }}>3 girls</b> in a random order. Chance that <b>no two girls</b> stand next to each other?
      </div>
      <Stage>
        <KidRow order="BGBBGBGB" y={655} r={50} sp={122} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 755, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={i} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1175} />
    </>
  );
};

// All 20 ways to pick 3 of the 6 gaps (verify.py: C(6,3) = 20), ending on the reveal's pick.
const COMBOS: number[][] = [];
for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let c = b + 1; c < 6; c++) if (!(a === 0 && b === 2 && c === 5)) COMBOS.push([a, b, c]);
COMBOS.push(CHOSEN);

const Readout: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ background: C.card, border: `6px solid ${C.primary}`, borderRadius: 28, padding: '10px 40px', fontSize: 76, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 8px 30px rgba(30,40,80,0.08)' }}>{children}</div>
    </div>
  );

const Gaps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const boyAt = (i: number) => at(scene, 0, 0.04 + i * 0.06);
  const slotAt = (j: number) => at(scene, 0, 0.45 + j * 0.065); // "That makes six gaps"
  const ends = at(scene, 0, 0.82); // "counting both ends"
  const nGaps = [0, 1, 2, 3, 4, 5].filter((j) => f >= slotAt(j)).length;
  // line 1: zoom onto two girls squeezed into one gap
  const zoomIn = l1 + 4;
  const zoomOut = at(scene, 1, 0.72);
  const zoom = 1 + 0.45 * ease(f, zoomIn, 12) - 0.45 * ease(f, zoomOut, 12);
  const touch = ease(f, l1 + 2, 8) * fadeTo(f, at(scene, 1, 0.68), 0, 8);
  // line 2: run through every pick of 3 gaps, the counter landing on 20 at "twenty"
  const run0 = at(scene, 2, 0.04);
  const step = (at(scene, 2, 0.36) - run0) / (COMBOS.length - 1);
  const ci = f < run0 ? -1 : Math.min(COMBOS.length - 1, Math.floor((f - run0) / step));
  const frac = at(scene, 2, 0.62); // "out of fifty-six"
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 2, 4].map((i) => <Sfx key={`b${i}`} at={boyAt(i)} src={SFX.click} volume={0.22} />)}
      {[0, 1, 2, 3, 4, 5].map((j) => <Sfx key={`s${j}`} at={slotAt(j)} src={SFX.click} volume={0.25} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      {Array.from({ length: 10 }, (_, i) => <Sfx key={`c${i}`} at={run0 + 2 * i * step} src={SFX.click} volume={0.24} />)}

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${GX(3)}px ${Y + 40}px` }}>
        <Stage>
          <GapRow
            boys={(i) => pop(f, boyAt(i))}
            slot={(j) => ease(f, slotAt(j), 8) * (f >= l1 && f < zoomOut + 6 && j === 3 ? 0.35 : 1)}
            girls={ci >= 0 ? COMBOS[ci] : []}
            hi={(j) => (f >= ends && f < l1 && (j === 0 || j === 5) ? C.amber : undefined)}
          />
          {/* line 1: two girls in the same gap touch */}
          <g opacity={touch}>
            <Kid x={GX(3) - 40} y={Y - 130} k="G" r={38} ring={C.red} />
            <Kid x={GX(3) + 40} y={Y - 130} k="G" r={38} ring={C.red} />
            <line x1={GX(3)} y1={Y - 80} x2={GX(3)} y2={Y - 45} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
            <text x={GX(3) + 110} y={Y - 128} fill={C.red} fontFamily={NUNITO} fontWeight={900} fontSize={60} textAnchor="start" dominantBaseline="central" paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
              touch! ✗
            </text>
          </g>
        </Stage>
      </div>
      <Readout op={ease(f, slotAt(0), 6) * fadeTo(f, l1, 0, 6)}>
        <span style={{ color: BOY }}>5 boys</span> → <span style={{ color: C.primary }}>{nGaps} gap{nGaps === 1 ? '' : 's'}</span>
      </Readout>
      <Readout op={ease(f, l1, 6) * fadeTo(f, l2, 0, 6)}>
        at most <span style={{ color: GIRL }}>1 girl</span> per gap
      </Readout>
      <Readout op={ease(f, l2, 6)}>
        ways: <span style={{ color: C.green }}>{Math.max(0, ci + 1)}</span>
      </Readout>

      {/* end-gap labels on "counting both ends" */}
      <Text x={GX(0) + 40} y={Y - 140} w={260} size={56} weight={900} color={C.amber} align="center" style={{ opacity: ease(f, ends, 8) * fadeTo(f, l1, 0, 6) }}>
        end
      </Text>
      <Text x={GX(5) - 40} y={Y - 140} w={260} size={56} weight={900} color={C.amber} align="center" style={{ opacity: ease(f, ends, 8) * fadeTo(f, l1, 0, 6) }}>
        end
      </Text>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 960, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, whiteSpace: 'nowrap', ...fadeUp(f, frac) }}>
        <Tex tex={'\\dfrac{\\color{#21c45d}{20}\\text{ good}}{56\\text{ in all}}'} size={68} />
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same boys-and-gaps row as frame 0 (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.56); // "five over fourteen"
  const chime = at(scene, 0, 0.97);
  const trap = at(scene, 1);
  const endPulse = f >= trap && f < trap + 30 ? C.red : C.green;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 270, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
        <div style={{ opacity: ease(f, 2, 8) }}>
          <Tex tex={'\\dfrac{20}{56} ='} size={80} />
        </div>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, borderRadius: 28, padding: '6px 34px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{5}{14}'} size={92} color="#fff" />
        </div>
      </div>
      <Stage>
        <GapRow girls={CHOSEN} hi={(j) => (j === 0 || j === 5 ? endPulse : undefined)} />
      </Stage>
      <Text x={490} y={950} w={860} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap + 2)}>
        5/28 forgets an end gap
      </Text>
      <CtaPill start={at(scene, 2)} y={1070} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={340} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, gaps: Gaps, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

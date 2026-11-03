import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, HIT, Half, MISS, NEXT6, Ngon, Outside, Ring, SLUG, Shape, gapsOf, rot } from '../Composition';

export { SLUG };

// New recipe (~38 s): trap-first AMC 10 hook (260 = the misses), question, comment bait, the misses scene big
// (hit → miss, the half, zoom on "first + next six" while the 20 ways cycle, the first corner goes round all 13,
// 13 × 20 = 260), reveal 715 − 260 = 455 + CTA pill. First and last frames show the same green hit shape.

type G = Parameters<typeof Ngon>[0]['g'];
const MAIN: G = { cx: 540, cy: 880, R: 300, n: 13 };
const before = () => -100;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #5</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>260</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 880px">
        <Stage>
          <Ngon g={MAIN} centre={C.green} />
          <Shape g={MAIN} set={HIT} color={C.green} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QG: G = { cx: 540, cy: 810, R: 200, n: 13 };

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Join <b style={{ color: C.primary }}>4 corners</b> of a regular <b style={{ color: C.primary, whiteSpace: 'nowrap' }}>13-sided</b> shape. How many choices <b style={{ color: C.violet }}>hold the center</b>?
      </div>
      <Stage>
        <Ngon g={QG} centre={C.green} />
        <Shape g={QG} set={HIT} color={C.primary} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.2 + i * 0.1)} />
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

// ---------- count the misses ----------

const Misses: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const toMiss = at(scene, 0, 0.55);
  const half = at(scene, 1, 0.45);
  const six = at(scene, 2, 0.3);
  const l3 = at(scene, 3);
  const end = l3 + scene.lines[3].frames;
  // line 2: the 20 ways to pick three of the next six, 3 frames each
  const c0 = at(scene, 2, 0.5);
  const ci = Math.max(0, Math.min(19, Math.floor((f - c0) / 3)));
  const cycling = f >= c0 && f < l3;
  // line 3: slide the first corner round all 13 places
  const r0 = l3 + 4;
  const rStep = Math.max(2, Math.floor((end - 30 - r0) / 12));
  const r = f < r0 ? 0 : Math.min(12, Math.floor((f - r0) / rStep));
  const pick = f < c0 ? [2, 3, 5] : NEXT6[ci];
  const set = f < toMiss ? HIT : f < l3 ? MISS : rot([0, ...pick], r, 13);
  const first = f < l3 ? 0 : r;
  const missOn = f >= toMiss;
  const g = gapsOf(set, 13);
  const bigIdx = g.findIndex((x) => x > 6);
  const bigFrom = [...set].sort((a, b) => a - b)[bigIdx];
  const sixOn = ease(f, six, 8) * fadeTo(f, l3 + 2, 0, 8);
  const zIn = at(scene, 2, 0.25);
  const zOut = l3 - 6;
  const zoom = 1 + 0.22 * ease(f, zIn, 12) - 0.22 * ease(f, zOut, 10);
  const total = end - 26;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={toMiss} src={SFX.buzz} volume={0.18} />
      <Sfx at={half} src={SFX.click} volume={0.25} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.22} />
      {range(7).map((i) => <Sfx key={i} at={c0 + i * 9} src={SFX.click} volume={0.24} />)}
      {range(7).map((i) => <Sfx key={`r${i}`} at={r0 + 2 * i * rStep} src={SFX.click} volume={0.26} />)}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${MAIN.cx + MAIN.R}px ${MAIN.cy - 40}px` }}>
        <Stage>
          <Half g={MAIN} a={first} opacity={ease(f, half, 14)} />
          <Ngon g={MAIN} centre={missOn ? C.red : C.green} />
          {missOn && bigIdx >= 0 && <Arc g={MAIN} a={bigFrom} steps={g[bigIdx]} color={C.red} opacity={ease(f, toMiss + 6, 10)} />}
          {range(6).map((i) => (
            <Ring key={i} g={MAIN} k={first + i + 1} color={C.violet} opacity={f < l3 ? ease(f, six + i * 4, 8) : 1} />
          ))}
          <Shape g={MAIN} set={set} color={missOn ? C.red : C.green} />
          <Outside g={MAIN} k={first} text="first" color={C.violet} opacity={ease(f, six - 6, 8)} d={60} size={52} />
          {range(6).map((i) => (
            <Outside key={`n${i}`} g={MAIN} k={first + i + 1} text={`${i + 1}`} color={C.violet} opacity={sixOn} d={58} size={48} />
          ))}
        </Stage>
      </div>
      {/* main readout */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center', fontSize: 80, fontWeight: 900, whiteSpace: 'nowrap' }}>
        {f < toMiss ? (
          <span style={fadeUp(f, 4, 8)}>
            <span style={{ color: C.primary }}>715</span> choices
          </span>
        ) : f < at(scene, 1) ? (
          <>
            count the <span style={{ color: C.red }}>misses</span>
          </>
        ) : f < at(scene, 2) ? (
          <span style={{ color: C.red, fontSize: 72 }}>miss = all 4 in one half</span>
        ) : f < c0 ? (
          <span style={{ color: C.violet, fontSize: 72 }}>first + 3 of the next 6</span>
        ) : f < total ? (
          <span style={{ background: C.violet, color: '#fff', borderRadius: 24, padding: '4px 40px' }}>
            {f < l3 ? `way ${cycling ? ci + 1 : 1} of 20` : `first corner ${r + 1} of 13`}
          </span>
        ) : (
          <span style={{ color: C.red, ...fadeUp(f, total, 8) }}>13 × 20 = 260 misses</span>
        )}
      </div>
    </>
  );
};

// ---------- reveal ----------

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.66);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 90, fontWeight: 900, ...fadeUp(f, 0, 8) }}>
          <span style={{ color: C.primary }}>715</span> − <span style={{ color: C.red }}>260</span> =
        </span>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '6px 40px', fontSize: 110, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>455</div>
      </div>
      <Text x={540} y={445} w={1000} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        260 is just the misses
      </Text>
      <Stage>
        <Ngon g={MAIN} centre={C.green} />
        <Shape g={MAIN} set={HIT} color={C.green} />
      </Stage>
      <CtaPill start={at(scene, 2)} y={1215} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, misses: Misses, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

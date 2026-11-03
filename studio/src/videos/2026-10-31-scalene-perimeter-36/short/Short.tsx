import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG, SideLabels, geom, place } from '../Composition';

export { SLUG };

// New recipe: trap-first hook (27), question, comment bait, the "fix the longest side" aha (a 6-row list by longest
// side, a magnified callout of row 17 with its 7 pairs, then the other rows), then answer, trap and CTA pill over the
// same list (frame 0 shows the same rows, still unknown, so the loop cuts cleanly).

const col = (c: string, t: string) => `{\\color{${c}}${t}}`;
const before = () => -100;

// rows of the list: longest side -> number of triangles with three different sides (verify.py)
const ROWS: { c: number; n: number }[] = [
  { c: 17, n: 7 }, { c: 16, n: 5 }, { c: 15, n: 4 }, { c: 14, n: 2 }, { c: 13, n: 1 }, { c: 12, n: 0 },
];
const PAIRS17: [number, number][] = [[3, 16], [4, 15], [5, 14], [6, 13], [7, 12], [8, 11], [9, 10]];
const RY = 520;
const PITCH = 92;
const RH = 80;
const DOT = 46;

/** The list, one row per longest side. `show(i)` = row appears, `dots(i, k)` = dot k pops, `count(i)` = the count
 * bubble pops (before that it shows "?"), `pulse(i)` = frame the bubble bumps. */
const Rows: React.FC<{ show: (i: number) => number; dots: (i: number, k: number) => number; count: (i: number) => number; pulse?: (i: number) => number }> = ({ show, dots, count, pulse }) => {
  const f = useCurrentFrame();
  return (
    <>
      {ROWS.map((r, i) => {
        const y = RY + i * PITCH;
        const op = ease(f, show(i), 8);
        if (op <= 0) return null;
        const known = f >= count(i);
        const bump = pulse && f >= pulse(i) && f < pulse(i) + 16 ? 0.25 * Math.sin(((f - pulse(i)) / 16) * Math.PI) : 0;
        return (
          <div key={r.c} style={{ opacity: op }}>
            <div style={{ position: 'absolute', left: 60, top: y, width: 860, height: RH, background: C.card, borderRadius: 22, boxShadow: '0 3px 12px rgba(30,40,80,0.06)' }} />
            <div style={{ position: 'absolute', left: 88, top: y, height: RH, display: 'flex', alignItems: 'center', fontSize: 58, fontWeight: 900, whiteSpace: 'nowrap' }}>
              <span style={{ color: C.muted, fontSize: 36, marginRight: 12, fontWeight: 800 }}>longest</span>
              {r.c}
            </div>
            {Array.from({ length: r.n }, (_, k) => {
              const p = f >= dots(i, k) ? pop(f, dots(i, k)) : 0;
              return p > 0 ? <div key={k} style={{ position: 'absolute', left: 340 + k * 58, top: y + (RH - DOT) / 2, width: DOT, height: DOT, borderRadius: '50%', background: C.violet, transform: `scale(${p})` }} /> : null;
            })}
            <div style={{ position: 'absolute', left: 824, top: y + 2, width: 76, height: 76, borderRadius: '50%', background: !known ? C.line : r.n === 0 ? C.muted : C.primary, color: known ? '#fff' : C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, transform: `scale(${(known ? pop(f, count(i)) : 1) + bump})` }}>
              {known ? r.n : '?'}
            </div>
          </div>
        );
      })}
    </>
  );
};

const never = () => 1e6;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #36</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>27</span>?
      </Text>
      <PushIn frames={scene.frames} origin="490px 780px">
        <Rows show={before} dots={never} count={never} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 680, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const TRI = place(geom(10, 12, 14), 540, 810, 36);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>Whole-number</b> sides, <b style={{ color: C.amber }}>all three different</b>, <b style={{ color: C.violet }}>perimeter 36</b>. How many triangles?
      </div>
      <Stage>
        <Poly pts={TRI} progress={1} color={C.violet} width={10} fill={C.violet} fillOpacity={0.12} />
      </Stage>
      <SideLabels pts={TRI} labels={['c', 'a', 'b']} size={60} color={C.violet} />
      <div style={{ position: 'absolute', left: 60, top: 1040, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />
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

/** The aha: rows 12…17 appear, row 17 is magnified into its seven pairs, then the other rows fill. */
const List: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l2 = at(scene, 2);
  // rows appear bottom-up while "twelve to seventeen" is said
  const show = (i: number) => at(scene, 0, 0.52) + (5 - i) * 6;
  const pairAt = (k: number) => at(scene, 1, 0.22) + k * ((at(scene, 1, 0.62) - at(scene, 1, 0.22)) / 6);
  const rowAt = [0, at(scene, 2, 0.02), at(scene, 2, 0.22), at(scene, 2, 0.42), at(scene, 2, 0.62), at(scene, 2, 0.84)];
  const dots = (i: number, k: number) => (i === 0 ? pairAt(k) : rowAt[i] + 6 + k * 4);
  const count = (i: number) => (i === 0 ? at(scene, 1, 0.84) : rowAt[i] + 8 + ROWS[i].n * 4);
  const k = PAIRS17.filter((_, j) => f >= pairAt(j)).length;
  // the magnified callout: grows out of row 17, then shrinks back into it
  const zin = at(scene, 1, 0.02);
  const zs = 0.25 + 0.75 * ease(f, zin, 12) - 0.75 * ease(f, l2 - 4, 10);
  const zop = ease(f, zin, 6) * fadeTo(f, l2, 0, 10);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 2, 4].map((i) => <Sfx key={`r${i}`} at={show(i)} src={SFX.click} volume={0.22} />)}
      <Sfx at={zin} src={SFX.whoosh} volume={0.25} />
      {[0, 2, 4, 6].map((j) => <Sfx key={`p${j}`} at={pairAt(j)} src={SFX.click} volume={0.26} />)}
      <Sfx at={l2 - 4} src={SFX.whoosh} volume={0.25} />
      {[1, 2, 3, 4, 5].map((i) => <Sfx key={`c${i}`} at={count(i)} src={SFX.click} volume={0.28} />)}
      <Text x={540} y={300} w={1000} size={88} weight={900} align="center" style={fadeUp(f, 0, 10)}>
        Fix the <span style={{ color: C.violet }}>longest</span> side
      </Text>
      <Rows show={show} dots={dots} count={count} pulse={(i) => (i === 0 ? at(scene, 1, 0.84) : 1e6)} />
      {zop > 0 && (
        <div style={{ position: 'absolute', left: 60, top: 640, width: 860, height: 420, boxSizing: 'border-box', background: '#fff', border: `6px solid ${C.violet}`, borderRadius: 32, boxShadow: '0 18px 50px rgba(123,97,255,0.25)', opacity: zop, transform: `scale(${zs})`, transformOrigin: '430px -80px', padding: '22px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 64, fontWeight: 900 }}>
            <span>
              longest <span style={{ color: C.violet }}>17</span>
            </span>
            <span style={{ background: C.primary, color: '#fff', borderRadius: 999, padding: '0 30px', fontSize: 60, opacity: k > 0 ? 1 : 0 }}>×{k}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 24, justifyContent: 'center' }}>
            {PAIRS17.map(([a, b], j) => {
              const p = f >= pairAt(j) ? pop(f, pairAt(j)) : 0;
              return (
                <div key={j} style={{ width: 178, height: 116, borderRadius: 20, background: C.violetSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, opacity: Math.min(1, p) }}>
                  <Tex tex={`${a}, ${b}`} size={62} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same list (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.86);
  const chime = at(scene, 0, 0.98);
  const said = [0.02, 0.17, 0.32, 0.46, 0.6].map((t) => at(scene, 0, t));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, whiteSpace: 'nowrap' }}>
        <Tex tex={`${col(C.primary, '7+5+4+2+1')} =`} size={70} />
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 26, padding: '6px 34px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="19" size={88} color="#fff" />
        </div>
      </div>
      <Rows show={before} dots={() => -100} count={() => -100} pulse={(i) => said[i] ?? 1e6} />
      <Text x={540} y={1074} w={860} size={56} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        27 counts the repeats too
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, list: List, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Dots, Stage, makeGrid, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Lab, SLUG, Seg } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (16), question, comment bait, the 3-4-5 slant aha (zoom onto the triangle,
// step it to its second spot, count the four slants), then the reveal over the same grid the hook opens on.

const G = makeGrid(230, 540, 155);
const DOT_R = 16;

const KINDS = [
  { a: 3, b: 4, right: true, color: C.violet },
  { a: 3, b: 4, right: false, color: C.amber },
  { a: 4, b: 3, right: true, color: C.blue },
  { a: 4, b: 3, right: false, color: C.primary },
];
type Pair = (typeof KINDS)[number] & { x: number; y: number };
/** All 8 pairs: each slant in the 2 places its box fits (3-wide boxes side by side, 4-wide boxes top to bottom). */
const PAIRS: Pair[] = KINDS.flatMap((k) => (k.a === 3 ? [[0, 0], [1, 0]] : [[0, 0], [0, 1]]).map(([x, y]) => ({ ...k, x, y })));
const ends = (p: Pair): [Pt, Pt] => (p.right ? [G([p.x, p.y]), G([p.x + p.a, p.y + p.b])] : [G([p.x + p.a, p.y]), G([p.x, p.y + p.b])]);

const Grid: React.FC = () => <Dots cols={5} rows={5} at={G} r={DOT_R} />;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #16</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>16</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 850px">
        <Stage>
          <Grid />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 740, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QG = makeGrid(350, 650, 95);

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number; pulse?: (i: number) => number }> = ({ start, mark, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>25 dots</b>, <b style={{ color: C.primary }}>1 unit</b> apart in rows and columns. How many <b style={{ color: C.violet }}>pairs</b> are exactly <b style={{ color: C.blue }}>5 units</b> apart?
      </div>
      <Stage>
        <Dots cols={5} rows={5} at={QG} r={12} />
        <Seg a={QG([0, 0])} b={QG([1, 0])} color={C.primary} width={9} opacity={mark} />
        <Lab at={[QG([0.5, 0])[0], QG([0, 0])[1] - 40]} color={C.primary} size={56} opacity={mark}>1</Lab>
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1065, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={68} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} mark={ease(f, at(scene, 0, 0.4), 10)} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
    </>
  );
};

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => -100} mark={1} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** Dashed legs (across, then down) of a slant's right triangle. */
const Legs: React.FC<{ p: Pair; opacity: number }> = ({ p, opacity }) => {
  const [s, e] = ends(p);
  return <path d={`M ${s.join(' ')} L ${e[0]} ${s[1]} L ${e.join(' ')}`} fill="none" stroke={C.blue} strokeWidth={7} strokeDasharray="16 14" opacity={opacity} />;
};

/** The aha: no straight 5 fits, so it's a 3-4-5 slant; it fits in 2 spots, and there are 4 slants. */
const Slant: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l = (i: number, t = 0) => at(scene, i, t);
  const row = l(0, 0.15);
  const col = l(0, 0.4);
  const zoomIn = l(1, 0.02);
  const zoomOut = l(2);
  const zoom = 1 + 0.22 * ease(f, zoomIn, 12) - 0.22 * ease(f, zoomOut, 10);
  const [o] = [G([1.5, 2])];
  const first = PAIRS[0];
  const [S, E] = ends(first);
  const lab3 = l(1, 0.05);
  const lab4 = l(1, 0.3);
  const hyp = l(1, 0.55);
  const step2 = l(2, 0.4);
  const kindAt = [l(1, 0.55), l(3, 0.18), l(3, 0.45), l(3, 0.62)];
  const nKinds = kindAt.filter((t) => f >= t).length;
  const read = (start: number, end: number) => ease(f, start, 8) * fadeTo(f, end, 0, 6);
  const tri = ease(f, l(1), 10) * fadeTo(f, l(3), 0.25, 10);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={row} src={SFX.click} volume={0.26} />
      <Sfx at={col} src={SFX.click} volume={0.26} />
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      {[lab3, lab4, hyp].map((t, i) => <Sfx key={i} at={t} src={SFX.click} volume={0.26} />)}
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={step2} src={SFX.click} volume={0.3} />
      {kindAt.slice(1).map((t, i) => <Sfx key={`k${i}`} at={t} src={SFX.click} volume={0.3} />)}

      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 80, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: read(0, l(1)) }}>
          Straight? Only <span style={{ color: C.red }}>4</span> long!
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(1), l(2)) }}>
          a <span style={{ color: C.violet }}>3-4-5</span> triangle
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: read(l(2), l(3)) }}>
          spots: <span style={{ color: C.violet }}>{f >= step2 ? 2 : 1}</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l(3), 8) }}>
          slants: <span style={{ color: KINDS[Math.max(0, nKinds - 1)].color }}>{nKinds}</span>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(405px 0 670px 0)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${o[0]}px ${o[1]}px` }}>
          <Stage>
            {/* line 0: a row, and a column, are only 4 units long */}
            <g opacity={ease(f, row, 8) * fadeTo(f, l(1))}>
              <Seg a={G([0, 0])} b={G([4, 0])} color={C.red} width={11} head="both" />
              <Lab at={[G([2, 0])[0], G([0, 0])[1] - 50]} color={C.red} size={60}>4 units</Lab>
            </g>
            <g opacity={ease(f, col, 8) * fadeTo(f, l(1))}>
              <Seg a={G([4, 0])} b={G([4, 4])} color={C.red} width={11} head="both" />
            </g>
            {/* line 1: the 3-4-5 triangle (stays as the first slant) */}
            <g opacity={tri}>
              <Legs p={first} opacity={1} />
              <Lab at={G([1.5, 0.45])} color={C.blue} size={68} opacity={ease(f, lab3, 6)}>3</Lab>
              <Lab at={[E[0] + 50, (S[1] + E[1]) / 2]} color={C.blue} size={68} opacity={ease(f, lab4, 6)}>4</Lab>
            </g>
            <Seg a={S} b={E} color={first.color} width={12} progress={ease(f, hyp, 14)} />
            <Lab at={[(S[0] + E[0]) / 2 - 56, (S[1] + E[1]) / 2 + 30]} color={C.violet} size={76} opacity={ease(f, hyp + 8, 6) * fadeTo(f, l(3), 0, 8)}>5</Lab>
            {/* line 2: the same box, stepped one dot right (a ghost stays behind) */}
            {f >= step2 && (
              <g opacity={fadeTo(f, l(3), 0.35, 10)}>
                <Legs p={PAIRS[1]} opacity={0.8} />
                <Seg a={ends(PAIRS[1])[0]} b={ends(PAIRS[1])[1]} color={first.color} width={12} />
              </g>
            )}
            {/* line 3: the other three slants, each in its first spot */}
            {KINDS.slice(1).map((k, j) => {
              const [a, b] = ends({ ...k, x: 0, y: 0 });
              return <Seg key={j} a={a} b={b} color={k.color} width={12} progress={ease(f, kindAt[j + 1], 12)} />;
            })}
            <Grid />
          </Stage>
        </div>
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same grid the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.72);
  const chime = at(scene, 0, 0.98);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '6px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="8" size={110} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>pairs</span>
        </div>
      </div>
      <Text x={540} y={440} w={1000} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        16 counts each pair twice
      </Text>
      <Stage>
        {PAIRS.map((p, i) => {
          const [a, b] = ends(p);
          return <Seg key={i} a={a} b={b} color={p.color} width={11} progress={ease(f, at(scene, 0, 0.05) + i * 7, 12)} opacity={0.9} />;
        })}
        <Grid />
      </Stage>
      <CtaPill start={at(scene, 2)} y={1195} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {PAIRS.map((_, i) => (i % 2 === 0 ? <Sfx key={i} at={at(scene, 0, 0.05) + i * 7} src={SFX.click} volume={0.22} /> : null))}
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={at(scene, 1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, slant: Slant, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Dots, Poly, Stage, boxSpots, boxSquare, makeGrid } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, COLS, ROWS, SLUG, TILT, sq } from '../Composition';

export { SLUG };

// ~38 s: trap-first hook (20 = upright only), the question, comment bait, the tilted squares found box by box
// (zoom onto the first 2×2 box, then slide it through all 6 spots, then the 3×3 boxes), the answer + CTA pill.
// The hook and the reveal show the same big grid at the same place, so the loop cuts cleanly.

const G = makeGrid(160, 545, 185); // big grid: x 160…900, y 545…1100
const SPOTS2 = boxSpots(COLS, ROWS, 2);
const SPOTS3 = boxSpots(COLS, ROWS, 3);
const before = -100;

/** The 12 one-by-one tiles (green) on the big grid: the figure the hook and the reveal share. */
const Tiles: React.FC<{ start?: (i: number) => number; opacity?: number }> = ({ start = () => before, opacity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {range(12).map((i) => (
        <Poly key={i} pts={sq((i % 4) + 0.07, Math.floor(i / 4) + 0.07, 0.86).map(G)} color={C.primary} width={5} fill={C.primary} fillOpacity={0.22} progress={ease(f, start(i), 10)} />
      ))}
    </g>
  );
};

const Center: React.FC<{ y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ y, style, children }) => (
  <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', ...style }}>{children}</div>
);

const Chip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ background: color, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 68, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #1</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>20</span>?
      </Text>
      <PushIn frames={scene.frames} origin="530px 820px">
        <Stage>
          <Tiles />
          <Dots cols={COLS} rows={ROWS} at={G} r={15} />
        </Stage>
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

const QG = makeGrid(310, 650, 115);

const QuestionBody: React.FC<{ start: (i: number) => number; tilt: number; pulse?: (i: number) => number }> = ({ start, tilt, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>20 dots</b>, 4 rows of 5. How many <b style={{ color: C.violet }}>squares</b> have all 4 corners on dots? <b>Tilted ones too!</b>
      </div>
      <Stage>
        <Poly pts={boxSquare(1, 0, 2, 1).map(QG)} color={C.violet} fill={C.violet} width={8} progress={ease(f, tilt, 16)} />
        <Dots cols={COLS} rows={ROWS} at={QG} r={11} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1035, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '12px 34px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.1)} tilt={at(scene, 1, 0.3)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} tilt={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

/** The aha: 20 upright, then one tilted square per 2×2 box (zoom in on the first, slide through all 6), then two per 3×3 box. */
const Tilt: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  // 2×2 phase: zoom onto the first box while its tilted square draws, back out, then step through the 6 spots
  const zoom = 1 + 0.4 * ease(f, l1, 14) - 0.4 * ease(f, l1 + 62, 12);
  const s0 = l1 + 75;
  const step = 11;
  const n = f < l1 ? 0 : Math.min(6, 1 + Math.max(0, Math.floor((f - s0) / step) + (f >= s0 ? 1 : 0)));
  const cur = SPOTS2[Math.max(0, n - 1)];
  // 3×3 phase: the box at each spot, then its two tilted squares
  const big = [l2 + 12, l2 + 28, l2 + 72, l2 + 88];
  const m = big.filter((b) => f >= b).length;
  const box3 = f >= l2 + 60 ? 1 : 0;
  const title = (from: number, to: number, node: React.ReactNode) => (
    <div style={{ position: 'absolute', width: 1080, opacity: ease(f, from, 8) * fadeTo(f, to, 0, 8) }}>{node}</div>
  );
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {[0, 3, 6, 9].map((i) => <Sfx key={i} at={4 + i * 3} src={SFX.click} volume={0.22} />)}
      <Sfx at={l1} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l1 + 62} src={SFX.whoosh} volume={0.25} />
      {range(5).map((k) => <Sfx key={`s${k}`} at={s0 + k * step} src={SFX.click} volume={0.28} />)}
      <Sfx at={l2} src={SFX.whoosh} volume={0.25} />
      {big.map((b, k) => <Sfx key={`b${k}`} at={b} src={SFX.click} volume={0.3} />)}
      <div style={{ position: 'absolute', left: 0, top: 300, width: 1080, height: 130, textAlign: 'center', fontSize: 84, fontWeight: 900 }}>
        {title(0, l1, <><span style={{ color: C.primary }}>20</span> upright squares</>)}
        {title(l1, l2, <>Tilted in a <span style={{ color: C.violet }}>2×2</span> box</>)}
        {title(l2, 99999, <>Tilted in a <span style={{ color: C.blue }}>3×3</span> box</>)}
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '345px 730px' }}>
        <Stage>
          <Tiles start={(i) => 4 + i * 3} opacity={1 - 0.7 * ease(f, at(scene, 0, 0.55), 12)} />
          {f >= l1 && (
            <g opacity={fadeTo(f, l2, 0.3)}>
              {SPOTS2.slice(0, n - 1).map((s, j) => (
                <Poly key={j} pts={boxSquare(s[0], s[1], 2, 1).map(G)} color={C.violet} width={5} fill={C.violet} fillOpacity={0.1} opacity={0.45} />
              ))}
              <g opacity={fadeTo(f, l2)}>
                <Poly pts={sq(cur[0], cur[1], 2).map(G)} color={C.ink} width={4} dashed progress={ease(f, l1 + 4, 10)} />
              </g>
              <Poly pts={boxSquare(cur[0], cur[1], 2, 1).map(G)} color={C.violet} fill={C.violet} width={9} progress={ease(f, l1 + 14, 18)} />
            </g>
          )}
          {f >= l2 && (
            <>
              <Poly pts={sq(SPOTS3[box3][0], SPOTS3[box3][1], 3).map(G)} color={C.ink} width={4} dashed progress={ease(f, box3 ? l2 + 60 : l2 + 2, 10)} />
              {SPOTS3.flatMap((s, j) => [1, 2].map((a) => (
                <Poly key={`${j}${a}`} pts={boxSquare(s[0], s[1], 3, a).map(G)} color={TILT[a - 1]} fill={TILT[a - 1]} width={8} opacity={j < box3 ? 0.3 : 1} progress={ease(f, big[j * 2 + a - 1], 16)} />
              )))}
            </>
          )}
          <Dots cols={COLS} rows={ROWS} at={G} r={15} />
        </Stage>
      </div>
      <Center y={1150} style={fadeUp(f, at(scene, 0, 0.25))}>
        <Chip color={C.ink}>
          {f < l1 ? (
            <><span style={{ color: '#5dff9b' }}>20</span> upright</>
          ) : (
            <>
              20 + <span style={{ color: '#b9a8ff' }}>{n}</span>
              {m > 0 && <> + <span style={{ color: '#8fc4ff' }}>{m}</span></>}
            </>
          )}
        </Chip>
      </Center>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same grid as the hook. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.7); // "thirty" starts about 2.9 s into the line
  const chime = at(scene, 0, 0.97);
  const six = at(scene, 0, 0.22);
  const four = at(scene, 0, 0.45);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="30" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>squares</span>
        </div>
      </div>
      <Stage>
        <Tiles opacity={1 - 0.6 * ease(f, six, 8) * fadeTo(f, at(scene, 1), 0, 10)} />
        {/* the 10 tilted squares flash in on "six" / "four", then fade out on the trap line: upright only = the trap,
            and the last frame is the hook's figure again (clean loop) */}
        <g opacity={fadeTo(f, at(scene, 1), 0, 10)}>
          {SPOTS2.map((s, j) => (
            <Poly key={j} pts={boxSquare(s[0], s[1], 2, 1).map(G)} color={C.violet} width={4} opacity={0.6} progress={ease(f, six + j * 3, 10)} />
          ))}
          {SPOTS3.flatMap((s, j) => [1, 2].map((a) => (
            <Poly key={`${j}${a}`} pts={boxSquare(s[0], s[1], 3, a).map(G)} color={TILT[a - 1]} width={4} opacity={0.6} progress={ease(f, four + (j * 2 + a) * 3, 10)} />
          )))}
        </g>
        <Dots cols={COLS} rows={ROWS} at={G} r={15} />
      </Stage>
      <Center y={1150} style={{ opacity: ease(f, 4, 8) * fadeTo(f, at(scene, 1), 0, 6) }}>
        <Chip color={C.card}>
          <span style={{ color: C.primary }}>20</span>
          <span style={{ color: C.ink, opacity: ease(f, six, 6) }}> + <span style={{ color: C.violet }}>6</span></span>
          <span style={{ color: C.ink, opacity: ease(f, four, 6) }}> + <span style={{ color: C.blue }}>4</span></span>
          <span style={{ color: C.green, opacity: ease(f, hit, 6) }}> = 30</span>
        </Chip>
      </Center>
      <Text x={540} y={1165} w={900} size={64} weight={900} color={C.red} align="center" style={{ opacity: ease(f, at(scene, 1, 0.05), 8) * fadeTo(f, at(scene, 2), 0, 6) }}>
        20 = upright only
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, tilt: Tilt, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

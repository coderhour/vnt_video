import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { NUNITO, ZH_FONT } from '../../../lib/fonts';
import { CHIME, CHOICES, Circ, Dots, FOUR, Rings, SHAPE_COLOR, SLUG, SMALL, grid } from '../Composition';

export { SLUG };

/** Frame (scene-relative) where `phrase` starts (or ends) in line i's spoken text, by character position. */
const cue = (s: Scene, i: number, phrase: string, after = false) => {
  const l = s.lines[i];
  const t = l.text.toLowerCase();
  const k = t.indexOf(phrase.toLowerCase());
  if (k < 0) throw new Error(`cue: "${phrase}" not in ${s.id} line ${i}`);
  return l.from + Math.round(l.frames * Math.min(0.97, (k + (after ? phrase.length : 0)) / t.length));
};

// New recipe: trap-first hook (76 = every group of three as its own circle), question, comment bait, the
// "same circle, counted four times" aha with a zoom, the 14 four-point circles, then the answer over the same
// grid the hook opens on (clean loop).

/** The big grid: hook, aha and reveal use it at the same place. */
const G = grid(490, 815, 250);
const FLOWER = [0, 1, 2, 3, 5]; // the four small squares' circles + the tilted square's circle
const before = () => -100;

const Flower: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <>
    {FLOWER.map((k) => (
      <Circ key={k} g={G} pts={FOUR[k]} color={k === 5 ? C.blue : C.primary} width={8} opacity={opacity} />
    ))}
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, '错');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · 挑战 #2</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        你觉得是 <span style={{ color: C.red }}>76</span>？
      </Text>
      <PushIn frames={scene.frames} origin="490px 815px">
        <Stage>
          <Flower />
          <Dots g={G} r={18} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 740, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          错！
        </div>
      </div>
    </>
  );
};

const QG = grid(490, 870, 160);

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>9 个点</b>。有多少个<b style={{ color: C.violet }}>不同的圆</b>
        <br />
        至少经过其中 <b>3</b> 个点？
        <br />
        经过 4 个点的圆只算一次。
      </div>
      <Stage>
        <Circ g={QG} pts={FOUR[5]} color={C.violet} width={7} />
        <Dots g={QG} r={15} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1090, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '10px 14px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 8, scale: String(pulse(i)) }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.75 + i * 0.05)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={700} text="评论你的选项！" />
    </>
  );
};

const Chip: React.FC<{ color: string; opacity: number; scale?: number; y?: number; children: React.ReactNode }> = ({ color, opacity, scale = 1, y = 1160, children }) =>
  opacity <= 0 ? null : (
    <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, background: color, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
    </div>
  );

/** A few groups of three (none on one line) flashed while the count runs up to 76. */
const FLASH: Pt[][] = [
  [[0, 0], [1, 2], [2, 1]],
  [[0, 2], [1, 0], [2, 2]],
  [[0, 1], [2, 0], [1, 2]],
  [[0, 0], [2, 1], [0, 2]],
  [[1, 1], [2, 0], [2, 2]],
  [[0, 0], [1, 1], [2, 0]],
];

/** Mini grids for the 14 four-point circles (FOUR order: 4 small, big, tilted, 4 rectangles, 4 trapezoids),
 * placed so the wide trapezoid circles never sit side by side. [column, row] */
const SLOT: [number, number][] = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [2, 2], [1, 2], [3, 2], [0, 3], [3, 3]];
const TILE = (i: number) => grid(167.5 + 215 * SLOT[i][0], 530 + 212 * SLOT[i][1], 60);

const SQ = SMALL[3]; // corners (1,1) (2,1) (2,2) (1,2): the top-right small square

const Repeat: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const c0 = 8;
  const c1 = cue(scene, 0, '但是');
  const said76 = cue(scene, 0, '76');
  const flashI = Math.min(FLASH.length - 1, Math.floor((f - c0) / ((c1 - c0) / FLASH.length)));
  const flashing = f >= c0 && f < c1 + 6;
  const sq = cue(scene, 0, '正方形');
  // leave out each corner in turn
  const cyc0 = at(scene, 1, 0.12);
  const cyc1 = at(scene, 1, 0.92);
  const per = (cyc1 - cyc0) / 4;
  const k = Math.min(3, Math.max(0, Math.floor((f - cyc0) / per)));
  const cycling = f >= cyc0 && f < at(scene, 2, 0.1);
  const count = f < cyc0 ? 0 : Math.min(4, k + 1);
  const trip = SQ.filter((_, j) => j !== k);
  const zIn = at(scene, 1, 0.0);
  const zOut = at(scene, 2, 0.05);
  const zoom = 1 + 0.38 * (ease(f, zIn, 12) - ease(f, zOut, 12));
  const sqC = G.at([1.5, 1.5]);
  // the 14 four-point circles
  const t0 = cue(scene, 2, '像这样');
  const tileAt = (i: number) => t0 + i * 4;
  const big = fadeTo(f, t0 - 6, 0, 10);
  const nTiles = Array.from({ length: 14 }, (_, i) => i).filter((i) => f >= tileAt(i)).length;
  const m0 = at(scene, 3, 0.15);
  const minusAt = (i: number) => m0 + i * 3;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {FLASH.map((_, i) => (i % 2 === 0 ? <Sfx key={i} at={c0 + (i * (c1 - c0)) / FLASH.length} src={SFX.click} volume={0.22} /> : null))}
      <Sfx at={sq} src={SFX.click} volume={0.28} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      {[0, 1, 2, 3].map((i) => <Sfx key={`c${i}`} at={cyc0 + i * per} src={SFX.click} volume={0.3} />)}
      <Sfx at={zOut} src={SFX.whoosh} volume={0.22} />
      {Array.from({ length: 14 }, (_, i) => (i % 2 === 0 ? <Sfx key={`t${i}`} at={tileAt(i)} src={SFX.click} volume={0.22} /> : null))}
      {Array.from({ length: 14 }, (_, i) => (i % 3 === 0 ? <Sfx key={`m${i}`} at={minusAt(i)} src={SFX.click} volume={0.25} /> : null))}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${sqC[0]}px ${sqC[1]}px`, opacity: big }}>
        <Stage>
          {flashing && <Poly pts={FLASH[Math.max(0, flashI)].map(G.at)} color={C.amber} width={7} fill={C.amber} fillOpacity={0.12} />}
          <Poly pts={SQ.map(G.at)} color={C.primary} width={7} fill={C.primary} fillOpacity={0.1} progress={ease(f, sq, 12)} />
          <Circ g={G} pts={SQ} color={C.violet} width={9} progress={ease(f, sq + 6, 22)} />
          {cycling && <Poly pts={trip.map(G.at)} color={C.amber} width={7} dashed />}
          {cycling && <Rings g={G} pts={trip} color={C.amber} opacity={1} r={30} />}
          {cycling && (() => {
            const [x, y] = G.at(SQ[k]);
            return <circle cx={x} cy={y} r={30} fill="none" stroke={C.muted} strokeWidth={6} strokeDasharray="8 8" />;
          })()}
          <Dots g={G} r={18} />
        </Stage>
      </div>
      <Stage>
        {Array.from({ length: 14 }, (_, i) => {
          const p = ease(f, tileAt(i), 6);
          if (p <= 0) return null;
          const tg = TILE(i);
          const [cx, cy] = tg.at([1, 1]);
          return (
            <g key={i} opacity={p} transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * pop(f, tileAt(i))}) translate(${-cx} ${-cy})`}>
              <g opacity={1 - 0.6 * ease(f, minusAt(i), 5)}>
                <Circ g={tg} pts={FOUR[i]} color={SHAPE_COLOR(i)} width={6} />
                <Dots g={tg} r={8} />
              </g>
              {f >= minusAt(i) && (
                <text x={cx} y={cy + 4} fill={C.red} fontFamily={NUNITO} fontWeight={900} fontSize={64 * pop(f, minusAt(i))} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke={C.bg} strokeWidth={10}>
                  −3
                </text>
              )}
            </g>
          );
        })}
      </Stage>
      <div style={{ position: 'absolute', left: 0, top: 280, width: 1080, height: 140, background: C.bg, opacity: Math.min(1, (zoom - 1) / 0.1) }} />
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: fadeTo(f, at(scene, 1) - 4, 0, 6) }}>
        <span style={{ color: C.amber }}>3</span> 点一组
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: ease(f, at(scene, 1), 8) * fadeTo(f, t0 - 6, 0, 6) }}>
        <span style={{ color: C.violet }}>同一个</span>圆！
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: ease(f, t0 - 4, 6) * fadeTo(f, at(scene, 3) - 4, 0, 6) }}>
        四点圆：<span style={{ color: C.violet }}>{Math.max(1, nTiles)}</span>
      </Text>
      <Text x={540} y={300} w={1000} size={84} weight={900} align="center" style={{ opacity: ease(f, at(scene, 3), 8) }}>
        14 × 3 = 多出 <span style={{ color: C.red }}>42</span>
      </Text>
      <Chip color={C.amber} opacity={ease(f, said76, 6) * fadeTo(f, at(scene, 1) - 4, 0, 6)} scale={pop(f, said76)}>
        76 组
      </Chip>
      <Chip color={count === 4 ? C.red : C.violet} opacity={ease(f, cyc0, 6) * fadeTo(f, at(scene, 2, 0.3), 0, 6)} scale={pop(f, cyc0 + k * per)}>
        同一个圆 ×{Math.max(1, count)}
      </Chip>
    </>
  );
};

/** The answer, the trap, then the CTA pill, over the same grid the hook opens on. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = cue(scene, 0, '34');
  const chime = at(scene, 0, 1);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'76 - 42 = 34'} size={96} color="#fff" />
        </div>
      </div>
      <Stage>
        <Flower />
        <Dots g={G} r={18} />
      </Stage>
      <Text x={540} y={1128} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        76 把重复的也数了 ✗
      </Text>
      <CtaPill start={at(scene, 2)} y={1220} text="练习更多题，就在 vantee.ai" />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, repeat: Repeat, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10 风格" font={ZH_FONT} captions="box" music={MUSIC} /> : null;

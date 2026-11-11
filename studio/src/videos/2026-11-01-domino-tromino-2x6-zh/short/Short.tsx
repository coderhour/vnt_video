import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop, range } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Stage } from '../../../lib/grid';
import { ZH_FONT } from '../../../lib/fonts';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Cells, CHIME, DOM_H, DOM_V, HiCell, LBOX, O, SLUG, Tile, Tiles, W6, board, zig, type Kind, type RC } from '../Composition';

export { SLUG };

/** Frame (scene-relative) where `phrase` starts (or ends) in line i's spoken text, by character position. */
const cue = (s: Scene, i: number, phrase: string, after = false) => {
  const l = s.lines[i];
  const t = l.text.toLowerCase();
  const k = t.indexOf(phrase.toLowerCase());
  if (k < 0) throw new Error(`cue: "${phrase}" not in ${s.id} line ${i}`);
  return l.from + Math.round(l.frames * Math.min(0.97, (k + (after ? phrase.length : 0)) / t.length));
};

// New short recipe: trap-first hook (13), question, comment bait, the aha (the top-left square: a domino or an L that
// starts a zigzag, the 4 zigzag lengths with their mirror twins, then the table 1, 1, 2, 5, 11, 24), then 53 (Choice C)
// over the same board as frame 0.

const CHOICES = ['13', '50', '53', '59', '117'];
const before = () => -100;

// the main board: same place in the hook, the aha and the reveal (so the loop cuts cleanly)
const BO = O(90, 560, 150);

/** The table of covers for lengths 0…6, under the board. `shown(i)` = frame where entry i appears. */
const TX = 60;
const TW = 122;
const Table: React.FC<{ shown: (i: number) => number; last?: number; y?: number }> = ({ shown, last, y = 935 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: TX, top: y, display: 'flex' }}>
      {W6.map((v, i) => {
        const done = i === 6 && last !== undefined && f >= last;
        const o = i === 6 ? 1 : ease(f, shown(i), 6);
        const sc = i === 6 && last !== undefined ? pop(f, last) : 1;
        return (
          <div key={i} style={{ width: TW, textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: C.muted }}>{i}</div>
            <div style={{ margin: '0 6px', height: 96, borderRadius: 20, background: done ? C.green : C.card, color: done ? '#fff' : C.ink, boxShadow: '0 4px 14px rgba(30,40,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900 }}>
              <span style={{ opacity: o, transform: `scale(${done ? sc : 0.8 + 0.2 * o})` }}>{i === 6 ? (done ? v : '?') : v}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, '错');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · 挑战 #4</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        你觉得是 <span style={{ color: C.red }}>13</span>？
      </Text>
      <PushIn frames={scene.frames} origin="540px 710px">
        <Stage>
          <Cells cells={board(6)} o={BO} />
        </Stage>
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 600, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          错！
        </div>
      </div>
    </>
  );
};

const QB = O(150, 560, 130);
const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        用<b style={{ color: C.primary }}>多米诺骨牌</b>和<b style={{ color: C.violet }}>L 形块</b>（可以旋转）铺满 <b>2×6</b> 的板。一共几种铺法？
      </div>
      <Stage>
        <Cells cells={board(6)} o={QB} />
        <Tile cells={DOM_H(0, 0)} o={O(250, 870, 75)} kind="D" t0={-100} />
        <Tile cells={LBOX(0, 0, 'br')} o={O(600, 860, 75)} kind="L" t0={-100} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1040, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 68, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={620} text="评论你的选项！" />
    </>
  );
};

const Head: React.FC<{ y: number; o: number; children: React.ReactNode; sc?: number }> = ({ y, o, children, sc = 1 }) =>
  o > 0 ? (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: o, transform: `scale(${sc})`, fontSize: 76, fontWeight: 900, whiteSpace: 'nowrap' }}>{children}</div>
  ) : null;

const ZU = 64;
const ZX = 80;
const ZTWIN = ZX + 6 * ZU + 50;
const zRow = (k: number) => 470 + k * 165;

const Zigzag: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  // line 0: zoom on the top-left square; a domino could cover it, or an L that starts a zigzag
  const zoom = 1 + 0.35 * ease(f, 6, 14) * (1 - ease(f, t(0, 0.86), 12));
  const domT = cue(scene, 0, '骨牌');
  const lT = cue(scene, 0, 'L');
  const boardO = fadeTo(f, t(1), 0, 10) + ease(f, t(2), 10);
  // line 1: the zigzags, 3 to 6 long, then their mirror twins
  const rowT = (k: number) => t(1, 0.04 + k * 0.15);
  const twinT = (k: number) => cue(scene, 1, '镜像') - 8 + k * 6;
  const zigO = ease(f, t(1), 8) * fadeTo(f, t(2), 0, 10);
  const count = range(4).filter((k) => f >= rowT(k)).length + range(4).filter((k) => f >= twinT(k)).length;
  // line 2: back to the board, the table fills
  const VAL = ['两个', '1，', '2、', '5、', '11', '24'];
  const valT = (i: number) => cue(scene, 2, VAL[i]);
  const filled = range(6).filter((i) => f >= valT(i)).length; // entries shown = board length covered so far
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={6} src={SFX.whoosh} volume={0.22} />
      <Sfx at={domT} src={SFX.click} volume={0.28} />
      <Sfx at={lT} src={SFX.click} volume={0.28} />
      <Sfx at={lT + 12} src={SFX.click} volume={0.22} />
      <Sfx at={t(0, 0.86)} src={SFX.whoosh} volume={0.25} />
      {range(4).map((k) => <Sfx key={`r${k}`} at={rowT(k)} src={SFX.click} volume={0.25} />)}
      {range(4).map((k) => <Sfx key={`t${k}`} at={twinT(k)} src={SFX.click} volume={0.28} />)}
      <Sfx at={t(2)} src={SFX.whoosh} volume={0.25} />
      {range(6).map((i) => <Sfx key={`v${i}`} at={valT(i)} src={SFX.click} volume={i % 2 ? 0.22 : 0.28} />)}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '160px 640px' }}>
        <Stage>
          <Cells cells={board(6)} o={BO} opacity={boardO} />
          {f < t(1, 0.2) && (
            <g opacity={fadeTo(f, t(1), 0, 10)}>
              <HiCell cell={[0, 0]} o={BO} t0={4} t1={lT} />
              <Tile cells={DOM_V(0)} o={BO} kind="D" t0={domT} t1={lT - 2} ghost />
              <Tiles o={BO} list={zig(1, false, lT, 6)} />
            </g>
          )}
          {f >= t(2) && (
            <g opacity={ease(f, t(2), 10)}>
              {range(filled).map((c) => (
                <rect key={c} x={BO.ox + c * BO.u + 4} y={BO.oy + 4} width={BO.u - 8} height={2 * BO.u - 8} rx={10} fill={C.amber} opacity={0.22} />
              ))}
            </g>
          )}
        </Stage>
      </div>
      {zigO > 0 && (
        <Stage>
          <g opacity={zigO}>
            {range(4).map((k) => (
              <g key={k}>
                <Cells cells={board(k + 3)} o={O(ZX, zRow(k), ZU)} opacity={ease(f, rowT(k), 8)} />
                <Tiles o={O(ZX, zRow(k), ZU)} list={zig(k, false, rowT(k), 3)} />
                <Cells cells={board(k + 3)} o={O(ZTWIN, zRow(k), ZU)} opacity={ease(f, twinT(k), 8)} />
                <Tiles o={O(ZTWIN, zRow(k), ZU)} list={zig(k, true, twinT(k), 2)} />
              </g>
            ))}
          </g>
        </Stage>
      )}
      <Head y={290} o={fadeTo(f, t(1), 0, 8)}>
        左上角这一格？
      </Head>
      <Head y={400} o={ease(f, domT, 8) * fadeTo(f, lT, 0, 6)}>
        <span style={{ fontSize: 66, color: C.primary }}>一块骨牌</span>
      </Head>
      <Head y={400} o={ease(f, lT, 8) * fadeTo(f, t(1), 0, 6)}>
        <span style={{ fontSize: 66, color: C.violet }}>一个 L → 之字链</span>
      </Head>
      <Head y={290} o={ease(f, t(1, 0.02), 8) * fadeTo(f, t(2), 0, 8)} sc={1 + 0.06 * Math.max(0, 1 - Math.abs(f - twinT(Math.max(0, count - 5))) / 5) * (count > 4 ? 1 : 0)}>
        <span>之字链：<span style={{ color: C.violet, display: 'inline-block', minWidth: 60 }}>{count}</span></span>
        {count > 4 && <span style={{ fontSize: 60, color: C.amber }}>镜像 ×2</span>}
      </Head>
      <Head y={290} o={ease(f, t(2, 0.04), 8)}>
        <span style={{ fontSize: 70 }}><span style={{ color: C.amber }}>2 × n</span> 板的铺法</span>
      </Head>
      {f >= t(2) && (
        <div style={{ opacity: ease(f, t(2, 0.1), 10) }}>
          <Table shown={valT} />
        </div>
      )}
    </>
  );
};

/** 53 (Choice C) over the same board as frame 0, now with one full cover; then the trap and the CTA pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const hit = cue(scene, 0, '53');
  const chime = t(0, 0.97);
  const cover: { cells: RC[]; kind: Kind }[] = [
    ...zig(0).map((z) => ({ cells: z.cells, kind: z.kind })),
    { cells: DOM_V(3), kind: 'D' },
    { cells: DOM_H(0, 4), kind: 'D' },
    { cells: DOM_H(1, 4), kind: 'D' },
  ];
  return (
    <>
      <Stage>
        <Cells cells={board(6)} o={BO} />
        <Tiles o={BO} list={cover.map((c, i) => ({ ...c, t0: 4 + i * 4 }))} />
      </Stage>
      <Table shown={before} last={hit} />
      {f >= hit && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 30, padding: '10px 50px', fontSize: 100, fontWeight: 900, lineHeight: 1.1, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
            53 种
          </div>
        </div>
      )}
      <Head y={1175} o={ease(f, t(1, 0.05), 8) * fadeTo(f, t(2), 0, 8)}>
        <span style={{ fontSize: 58, color: C.red }}>13 只算了骨牌 ✗</span>
      </Head>
      <CtaPill start={t(2)} y={1170} text="练习更多题，就在 vantee.ai" />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={t(1)} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={chime} seed={7} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, zigzag: Zigzag, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10 风格" font={ZH_FONT} captions="box" music={MUSIC} /> : null;

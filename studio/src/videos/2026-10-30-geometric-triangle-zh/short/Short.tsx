import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { ZH_FONT } from '../../../lib/fonts';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

/** Frame (scene-relative) where `phrase` starts (or ends) in line i's spoken text, by character position. */
const cue = (s: Scene, i: number, phrase: string, after = false) => {
  const l = s.lines[i];
  const t = l.text.toLowerCase();
  const k = t.indexOf(phrase.toLowerCase());
  if (k < 0) throw new Error(`cue: "${phrase}" not in ${s.id} line ${i}`);
  return l.from + Math.round(l.frames * Math.min(0.97, (k + (after ? phrase.length : 0)) / t.length));
};

// Tuned prototype: ~39 s, trap-first AMC 10 hook with a push-in, no countdown (comment bait instead), big board,
// word captions with digits, SFX on every beat, a zoom + counter in the long rule scene, a riser into the answer,
// a quiet music bed, a comment question + CTA pill at the end, and the last frame matches the first (the board) for the loop.

/** Three bars: the sides, each the last one times the same multiplier. */
const Bars: React.FC<{ y: number; scale?: number; start?: number; labels?: [string, string, string] }> = ({ y, scale = 1, start = 0, labels = ['?', '?', '2025'] }) => {
  const f = useCurrentFrame();
  const W = [300, 480, 780].map((w) => w * scale);
  const H = 96 * scale;
  const cols = [C.primary, C.violet, C.blue];
  return (
    <div style={{ position: 'absolute', left: 150, top: y, width: 800 }}>
      {W.map((w, i) => (
        <div key={i} style={{ height: H + 26, ...fadeUp(f, start + i * 5) }}>
          <div style={{ width: w, height: H, background: cols[i], borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 64 * Math.max(scale, 0.85), fontWeight: 900 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
};

const CELL = 84;
const STEP = 92;
const BOARD_Y = 540;
/** k = 1…44 as an 11 × 4 board, nearly full width. `appear(k)`, `red(k)` and `green(k)` are the frames where a cell shows, fails and closes. */
const Board: React.FC<{ appear: (k: number) => number; red: (k: number) => number; green: (k: number) => number; ring?: number; ringColor?: string }> = ({ appear, red, green, ring, ringColor = C.amber }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 44 }, (_, i) => {
        const k = i + 1;
        const o = ease(f, appear(k), 6);
        if (o <= 0) return null;
        const g = f >= green(k);
        const r = !g && f >= red(k);
        return (
          <div
            key={k}
            style={{
              position: 'absolute', left: 38 + (i % 11) * STEP, top: BOARD_Y + Math.floor(i / 11) * STEP, width: CELL, height: CELL, borderRadius: 18, opacity: o,
              background: g ? C.green : r ? C.red : C.card, color: g || r ? '#fff' : C.ink, boxShadow: ring === k ? `0 0 0 7px ${ringColor}` : '0 3px 10px rgba(30,40,80,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900,
            }}
          >
            {k}
          </div>
        );
      })}
    </>
  );
};

const never = () => 99999;
const before = () => -100;

/** Opens on the board (the same board the video ends on, so the loop cuts cleanly), then stamps the trap answer. */
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, '错');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · 挑战 #1</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        你觉得是 <span style={{ color: C.red }}>44</span>？
      </Text>
      <PushIn frames={scene.frames} origin="540px 720px">
        <Board appear={before} red={(k) => (k === 44 ? nope : 99999)} green={never} ring={44} ringColor={C.red} />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 640, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          错！
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
        <b style={{ color: C.violet }}>3 条互不相同的整数边</b>，每条都是前一条 × 同一个<b style={{ color: C.primary }}>倍数</b>。最长边 <b style={{ color: C.blue }}>2025</b>。一共几个三角形？
      </div>
      <Bars y={640} scale={0.8} start={-100} />
      <div style={{ position: 'absolute', left: 60, top: 990, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 1, 0.45 + i * 0.08)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

/** Comment bait instead of a countdown: the question stays, a bubble pops, the choices pulse one by one. */
const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble text="评论你的选项！" />
    </>
  );
};

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const board = at(scene, 0, 0.62);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const appear = (k: number) => board + k * 0.7;
  const red = (k: number) => at(scene, 1, 0.05) + k * 2.2;
  const green = (k: number) => (k >= 28 ? l2 + 12 + (k - 28) * 2 : 99999);
  // zoom onto the 27 | 28 boundary while it is decided, then back out for the green sweep
  const zoom = 1 + 0.42 * ease(f, cue(scene, 1, 'k等于27'), 12) - 0.42 * ease(f, l2 + 4, 10);
  const swept = Math.max(1, Math.min(27, Math.floor((f - red(0)) / 2.2)));
  const counter = ease(f, red(1), 6) * fadeTo(f, cue(scene, 1, '差一点'), 0, 6);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {Array.from({ length: 9 }, (_, i) => <Sfx key={i} at={red(3 * i + 1)} src={SFX.click} volume={0.22} />)}
      {Array.from({ length: 6 }, (_, i) => <Sfx key={`g${i}`} at={green(28 + 3 * i)} src={SFX.click} volume={0.3} />)}
      <Sfx at={cue(scene, 1, 'k等于27')} src={SFX.whoosh} volume={0.25} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 80, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, board) }}>
          三边 <span style={{ color: C.primary }}>k²</span>, <span style={{ color: C.violet }}>45k</span>, <span style={{ color: C.blue }}>2025</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, board, 8) * fadeTo(f, l1) }}>
          k = 1, 2, … , 44
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 8) }}>
          需要 <span style={{ color: C.primary }}>k²</span> + <span style={{ color: C.violet }}>45k</span> &gt; <span style={{ color: C.blue }}>2025</span>
        </div>
      </div>
      <div style={{ opacity: fadeTo(f, board) }}>
        <Bars y={560} start={0} labels={['k²', '45k', '2025']} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '520px 766px' }}>
        <Board appear={appear} red={(k) => (k <= 27 ? red(k) : 99999)} green={green} ring={f >= l2 + 4 ? 28 : f >= cue(scene, 1, '差一点') ? 27 : undefined} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1020, display: 'flex', justifyContent: 'center', opacity: counter }}>
        <div style={{ background: C.red, color: '#fff', borderRadius: 24, padding: '8px 40px', fontSize: 64, fontWeight: 900 }}>k = {swept} ✗</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1020, display: 'flex', justifyContent: 'center', ...fadeUp(f, cue(scene, 1, '差一点')), opacity: ease(f, cue(scene, 1, '差一点'), 8) * fadeTo(f, l2 + 2, 0, 6) }}>
        <Tex tex={'729+1215=\\color{#ef4343}{1944<2025}'} size={66} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1020, display: 'flex', justifyContent: 'center', opacity: ease(f, l2 + 8, 8) }}>
        <Tex tex={'784+1260=\\color{#21c45d}{2044>2025}'} size={66} />
      </div>
    </>
  );
};

/** The answer, the trap, then the CTA pill over the same board (no separate end card). */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = cue(scene, 0, '17');
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="17" size={116} color="#fff" />
          <span style={{ fontSize: 70, fontWeight: 900 }}>个三角形</span>
        </div>
      </div>
      <Board appear={before} red={(k) => (k <= 27 ? 0 : 99999)} green={(k) => (k >= 28 ? 0 : 99999)} ring={f >= at(scene, 1) ? 44 : undefined} ringColor={C.red} />
      <Text x={540} y={950} w={960} size={62} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>
        k = 28 … 44 能围成
      </Text>
      <Text x={540} y={1035} w={960} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>
        44 把不能围成的也数了
      </Text>
      <CtaPill start={at(scene, 2)} y={1150} text="练习更多题，就在 vantee.ai" />
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

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, rule: Rule, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10 风格" font={ZH_FONT} captions="box" music={MUSIC} /> : null;

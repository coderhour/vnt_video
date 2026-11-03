import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Stage } from '../../../lib/grid';
import { NUNITO } from '../../../lib/fonts';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, CHIME, CHOICES, HC, SLUG, TC, Token, cx, rad, ty, type Geo } from '../Composition';

export { SLUG };

// New-recipe short (~38 s): trap-first hook (1/2), question, comment bait, the ladder of chances (zoom on the
// two ways into a step, then each step's chance pops in with a readout), reveal 21/32 on the same staircase.

const GOLD = C.amber;
const GOLD_D = '#b36b00';

/** Frame (scene-relative) where caption word `idx` of line `i` starts, by the same char weights WordCaptions uses. */
const wordAt = (scene: Scene, i: number, idx: number) => {
  const w = scene.lines[i].caption.split(/\s+/).map((s) => s.length + 2);
  const total = w.reduce((a, b) => a + b, 0);
  return at(scene, i, w.slice(0, idx).reduce((a, b) => a + b, 0) / total);
};
/** First caption word of line `i` that starts with `word`. */
const cue = (scene: Scene, i: number, word: string) => {
  const idx = scene.lines[i].caption.split(/\s+/).findIndex((s) => s.startsWith(word));
  return wordAt(scene, i, Math.max(0, idx));
};

// The big staircase (hook, ladder, reveal: same place, so the loop cuts cleanly): ground + steps 1–5 across x 60…900.
const G: Geo = { ox: 60, y0: 980, w: 140, h: 88 };
// The smaller one under the question card.
const QG: Geo = { ox: 180, y0: 900, w: 120, h: 46 };

const Stairs: React.FC<{ g: Geo; gold?: number; num?: number }> = ({ g, gold = 1, num = 50 }) => (
  <Stage>
    {[0, 1, 2, 3, 4, 5].map((n) => {
      const x = g.ox + n * g.w;
      const y = ty(g, n);
      const isG = n === 5 && gold > 0;
      return (
        <g key={n}>
          <rect x={x} y={y} width={g.w} height={g.y0 + 16 - y} fill={n === 0 ? '#d9efe3' : '#e8ebf4'} stroke="#c3cadb" strokeWidth={3} />
          {isG && <rect x={x} y={y} width={g.w} height={g.y0 + 16 - y} fill={GOLD} fillOpacity={0.5 * gold} stroke={GOLD} strokeWidth={6 * gold} />}
          <rect x={x} y={y} width={g.w} height={10} fill={n === 0 ? '#8fd3ae' : isG ? GOLD : '#b4bcd3'} />
          <text x={x + g.w / 2} y={g.y0 + 16 + num * 0.92} fontFamily={NUNITO} fontWeight={900} fontSize={num} textAnchor="middle" fill={isG ? GOLD_D : C.ink}>
            {n}
          </text>
        </g>
      );
    })}
  </Stage>
);

const Pia: React.FC<{ g: Geo }> = ({ g }) => <Token x={cx(g, 0)} y={ty(g, 0) - rad(g)} r={rad(g)} />;

const LAB = ['1', '\\dfrac{1}{2}', '\\dfrac{3}{4}', '\\dfrac{5}{8}', '\\dfrac{11}{16}', '\\dfrac{21}{32}'];

/** Chance labels on top of the steps of G. `start[n]` = frame label n pops (undefined = hidden); `ring(n)` = amber ring; `q` = "?" on step 5. */
const Labels: React.FC<{ start: (n: number) => number | undefined; ring?: (n: number) => boolean; q?: boolean }> = ({ start, ring = () => false, q = false }) => {
  const f = useCurrentFrame();
  return (
    <>
      {LAB.map((tex, n) => {
        const s = start(n);
        if (n === 5 && q && (s === undefined || f < s))
          return <div key={n} style={{ position: 'absolute', left: cx(G, 5) - 70, width: 140, top: ty(G, 5) + 90, textAlign: 'center', fontSize: 130, fontWeight: 900, color: '#fff' }}>?</div>;
        if (s === undefined || f < s) return null;
        const sc = pop(f, s);
        const col = n === 5 ? C.green : C.ink;
        return (
          <div key={n} style={{ position: 'absolute', left: cx(G, n) - 80, width: 160, top: ty(G, n) - 136 - (n === 0 ? 84 : 0), height: 124, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transform: `scale(${sc})`, transformOrigin: '50% 100%' }}>
            <div style={{ borderRadius: 18, padding: '2px 10px', background: ring(n) ? '#fff3d6' : 'transparent', boxShadow: ring(n) ? `0 0 0 6px ${GOLD}` : undefined }}>
              <Tex tex={tex} size={n === 0 ? 70 : 60} color={col} />
            </div>
          </div>
        );
      })}
    </>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = cue(scene, 0, 'Nope');
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #54</div>
      </div>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>1/2</span>?
      </Text>
      <PushIn frames={scene.frames} origin="480px 800px">
        <Stairs g={G} />
        <Labels start={() => undefined} q />
        <Pia g={G} />
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
      <div style={{ position: 'absolute', left: 50, top: 280, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.32, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Before each move, Pia flips a fair coin: <b style={{ color: HC }}>heads, up 1</b>, <b style={{ color: TC }}>tails, up 2</b>. Chance she stands on <b style={{ color: GOLD_D }}>step 5</b>?
      </div>
      <Stairs g={QG} num={44} />
      <Pia g={QG} />
      <div style={{ position: 'absolute', left: 110, top: 985, width: 760, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '8px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 14, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={60} />
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
      <QuestionBody start={() => -100} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble />
    </>
  );
};

const Readout: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0 ? null : (
    <div style={{ position: 'absolute', left: 60, width: 860, top: 1095, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ background: C.card, borderRadius: 26, padding: '10px 36px', boxShadow: '0 6px 22px rgba(30,40,80,0.1)', display: 'flex', alignItems: 'center', gap: 18, fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap', minHeight: 110 }}>
        {children}
      </div>
    </div>
  );

const READ = [
  <><span>ground</span><Tex tex="=1" size={64} /></>,
  <><span style={{ color: HC }}>heads first</span><Tex tex="=\dfrac{1}{2}" size={60} /></>,
  <Tex tex={'\\left(\\dfrac{1}{2}+1\\right)\\div 2=\\dfrac{3}{4}'} size={60} />,
  <Tex tex={'\\left(\\dfrac{3}{4}+\\dfrac{1}{2}\\right)\\div 2=\\dfrac{5}{8}'} size={60} />,
  <Tex tex={'\\left(\\dfrac{5}{8}+\\dfrac{3}{4}\\right)\\div 2=\\dfrac{11}{16}'} size={60} />,
];

/** The aha: two ways into a step (zoomed), so its chance is the average of the two below; then the ladder fills up. */
const LadderScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const h = cue(scene, 0, 'heads');
  const t = cue(scene, 0, 'tails');
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const zIn = at(scene, 0, 0.1);
  const zOut = l2 - 6;
  const zoom = 1 + 0.32 * ease(f, zIn, 14) - 0.32 * ease(f, zOut, 12);
  const arcOp = fadeTo(f, zOut, 0, 10);
  const pops = [cue(scene, 2, '1.'), cue(scene, 2, '1/2'), cue(scene, 2, '3/4'), cue(scene, 2, '5/8'), cue(scene, 2, '11/16')];
  const cur = pops.reduce((k, p, i) => (f >= p ? i : k), -1);
  const ring = (n: number) => cur >= 2 && f < pops[cur] + 22 && (n === cur - 1 || n === cur - 2);
  const avg = cue(scene, 1, 'average');
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={zIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={zOut} src={SFX.whoosh} volume={0.25} />
      <Sfx at={h} src={SFX.click} volume={0.28} />
      <Sfx at={t} src={SFX.click} volume={0.28} />
      {pops.map((p, i) => <Sfx key={i} at={p} src={SFX.click} volume={0.26} />)}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center', fontSize: 64, fontWeight: 900, ...fadeUp(f, l2 - 2) }}>
        step = <span style={{ color: C.violet }}>average</span> of the 2 below
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '200px 1000px' }}>
        <Stairs g={G} />
        <Labels start={(n) => (n <= 4 ? pops[n] : undefined)} ring={ring} q />
        <Pia g={G} />
        <Arc g={G} a={3} b={4} color={HC} p={ease(f, h, 14)} label="H" op={arcOp} lift={100} />
        <Arc g={G} a={2} b={4} color={TC} p={ease(f, t, 14)} label="T" op={arcOp} lift={150} />
        {[
          ['A', 3, HC, h],
          ['B', 2, TC, t],
        ].map(([s, n, c, st]) => (
          <div key={s as string} style={{ position: 'absolute', left: cx(G, n as number) - 40, width: 80, top: ty(G, n as number) + 24, textAlign: 'center', fontSize: 64, fontWeight: 900, color: c as string, opacity: ease(f, (st as number) + 8, 8) * arcOp }}>
            {s}
          </div>
        ))}
      </div>
      <Readout op={ease(f, h, 8) * fadeTo(f, l1, 0, 6)}>
        <span style={{ color: HC }}>H: 1 below</span>
        <span style={{ color: C.muted }}>·</span>
        <span style={{ color: TC }}>T: 2 below</span>
      </Readout>
      <Readout op={ease(f, l1, 8) * fadeTo(f, zOut, 0, 6)}>
        <Tex tex={'\\dfrac{1}{2}A+\\dfrac{1}{2}B'} size={60} />
        {f >= avg && <Tex tex={'=\\dfrac{A+B}{2}'} size={60} />}
      </Readout>
      <Readout op={cur >= 0 ? 1 : 0}>{READ[Math.max(0, cur)]}</Readout>
    </>
  );
};

/** The answer on the same staircase, the trap, then the comment question + pill. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = cue(scene, 0, '11/16');
  const b = cue(scene, 0, '5/8');
  const hit = cue(scene, 0, '21/32');
  const chime = at(scene, 0, 1);
  const trap = at(scene, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 70, top: 290, display: 'flex', whiteSpace: 'nowrap', opacity: ease(f, a - 4, 8) * fadeTo(f, hit - 6, 0, 6) }}>
        <Tex tex={'\\left(\\dfrac{11}{16}+\\dfrac{5}{8}\\right)\\div 2'} size={64} />
      </div>
      <div style={{ position: 'absolute', left: 70, top: 280, display: 'flex' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, transformOrigin: '30% 50%', background: C.green, color: '#fff', borderRadius: 28, padding: '8px 40px', display: 'flex', alignItems: 'center', gap: 20, fontSize: 64, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span>step 5</span>
          <Tex tex="=\dfrac{21}{32}" size={84} color="#fff" />
        </div>
      </div>
      <Stairs g={G} />
      <Labels start={(n) => (n <= 4 ? -100 : hit)} ring={(n) => (n === 4 && f >= a && f < hit + 6) || (n === 3 && f >= b && f < hit + 6)} />
      <Pia g={G} />
      <Text x={540} y={1070} w={860} size={58} weight={900} color={C.red} align="center" style={fadeUp(f, trap)}>
        The trap: 1/2
      </Text>
      <CtaPill start={at(scene, 2)} y={1170} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={a} src={SFX.click} volume={0.25} />
      <Sfx at={b} src={SFX.click} volume={0.25} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={300} y={390} start={chime} seed={29} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, ladder: LadderScene, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG } from '../Composition';

export { SLUG };

// New short recipe: trap-first hook (253), question, comment bait, the neighbor boxes (n(n+1) needs 16, 11, 23;
// neighbors share no factors so each tile drops whole into one box; walk 176, 352 with a zoom), then 528 / 529 = 23².
// The two boxes sit at the same place in the hook (tiles above, unsorted) and at the end of the reveal (tiles inside).

const COL: Record<string, string> = { '16': C.primary, '11': C.violet, '23': C.amber };
const TV = ['16', '11', '23'];
const before = () => -100;

// ---- the main figure: two neighbor boxes ----
const BOX_Y = 540;
const BOX_H = 340;
const BOX_X = [40, 560];
const BOX_W = 480;
const TW = 150;
const TH = 110;
const ROW: [number, number][] = [[225, 930], [465, 930], [705, 930]]; // tiles waiting below the boxes
const DEST: [number, number][] = [[100, 640], [310, 640], [725, 640]]; // 16, 11 in n; 23 in n+1

const Boxes: React.FC<{ vals?: [React.ReactNode, React.ReactNode] }> = ({ vals }) => (
  <>
    {BOX_X.map((x, i) => (
      <div key={i} style={{ position: 'absolute', left: x, top: BOX_Y, width: BOX_W, height: BOX_H, borderRadius: 32, border: `7px solid ${C.ink}`, background: C.card, boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', left: 0, width: '100%', top: 6, textAlign: 'center' }}>
          <Tex tex={i === 0 ? 'n' : 'n+1'} size={60} />
        </div>
        <div style={{ position: 'absolute', left: 0, width: '100%', top: 258, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>{vals?.[i]}</div>
      </div>
    ))}
  </>
);

const Tile: React.FC<{ v: string; x: number; y: number; o?: number; s?: number }> = ({ v, x, y, o = 1, s = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: TW, height: TH, borderRadius: 24, background: COL[v], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 900, opacity: o, transform: `scale(${s})`, boxShadow: '0 6px 18px rgba(30,40,80,0.18)' }}>
    {v}
  </div>
);

const Chip: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>{children}</div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.86);
  return (
    <>
      <Chip y={280}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 10 · Challenge #9</div>
      </Chip>
      <Text x={540} y={385} w={1000} size={96} weight={900} align="center">
        Think it's <span style={{ color: C.red }}>253</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 760px">
        <Boxes />
        {TV.map((v, i) => <Tile key={v} v={v} x={ROW[i][0]} y={ROW[i][1]} />)}
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <Chip y={600}>
        <div style={{ opacity: ease(f, nope, 4), transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </Chip>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; pulse?: (i: number) => number }> = ({ start, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 50, top: 290, width: 980, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 54, fontWeight: 800, lineHeight: 1.45, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>Smallest n</b> so that <Tex tex="1+2+\cdots+n" size={60} /> is a <b>multiple of 2024</b>?
      </div>
      <div style={{ position: 'absolute', left: 60, top: 640, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
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
    <QuestionBody start={(i) => at(scene, 0, 0.55 + i * 0.07)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1000} />
    </>
  );
};

/** Shows the last step whose start has passed, popping on each change. */
const Readout: React.FC<{ y: number; steps: [number, string, string][]; size?: number }> = ({ y, steps, size = 60 }) => {
  const f = useCurrentFrame();
  let k = -1;
  steps.forEach(([s], i) => { if (f >= s) k = i; });
  if (k < 0) return null;
  const [s, tex, col] = steps[k];
  return (
    <Chip y={y}>
      <div style={{ transform: `scale(${pop(f, s)})`, whiteSpace: 'nowrap' }}>
        <Tex tex={tex} size={size} color={col} />
      </div>
    </Chip>
  );
};

const X = '\\textcolor{#ef4343}{\\times}';

const Share: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const tileIn = [t(0, 0.62), t(0, 0.76), t(0, 0.9)];
  const land = [t(1, 0.45), t(1, 0.58), t(1, 0.71)];
  const zoomIn = t(2, 0.02);
  const zoomOut = t(2, 0.86);
  const zoom = 1 + 0.2 * ease(f, zoomIn, 14) - 0.2 * ease(f, zoomOut, 14);
  const m176 = t(2, 0.18);
  const m352 = t(2, 0.38);
  const fail = t(2, 0.6);
  const nVal = f >= m352 ? '352' : f >= m176 ? '176' : null;
  const sideVal = f >= m352 ? `353\\ ${f >= fail ? X : ''}` : f >= m176 ? `177\\ ${X}` : null;
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {tileIn.map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.28} />)}
      <Sfx at={land[0] - 4} src={SFX.whoosh} volume={0.25} />
      {land.map((s, i) => <Sfx key={`l${i}`} at={s + 18} src={SFX.click} volume={0.22} />)}
      <Sfx at={zoomIn} src={SFX.whoosh} volume={0.25} />
      <Sfx at={m176} src={SFX.click} volume={0.3} />
      <Sfx at={m352} src={SFX.click} volume={0.3} />
      <Sfx at={fail} src={SFX.buzz} volume={0.15} />
      <Sfx at={zoomOut} src={SFX.whoosh} volume={0.25} />
      <Readout
        y={278}
        steps={[
          [t(0, 0.02), '1+2+\\cdots+n=\\dfrac{n(n+1)}{2}', C.ink],
          [t(1, 0.02), '\\text{neighbors share no factor}', C.violet],
          [t(2, 0.05), '16\\times11=176', C.ink],
        ]}
      />
      <Readout
        y={448}
        size={56}
        steps={[
          [t(0, 0.32), 'n(n+1)\\div 4048', C.ink],
          [t(0, 0.55), '4048=16\\times11\\times23', C.ink],
          [t(2, 0.05), '\\text{a }23\\text{ next door?}', C.amber],
        ]}
      />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 760px' }}>
        <Boxes
          vals={[
            nVal && <div key="n" style={{ transform: `scale(${pop(f, nVal === '352' ? m352 : m176)})` }}><Tex tex={nVal} size={64} color={C.ink} /></div>,
            sideVal && <div key="s" style={{ transform: `scale(${pop(f, nVal === '352' ? m352 : m176)})` }}><Tex tex={sideVal} size={56} color={C.muted} /></div>,
          ]}
        />
        {TV.map((v, i) => {
          const mv = ease(f, land[i], 20);
          const x = interpolate(mv, [0, 1], [ROW[i][0], DEST[i][0]], clamp);
          const y = interpolate(mv, [0, 1], [ROW[i][1], DEST[i][1]], clamp) - Math.sin(mv * Math.PI) * 60;
          return <Tile key={v} v={v} x={x} y={y} o={ease(f, tileIn[i], 6)} s={0.6 + 0.4 * pop(f, tileIn[i])} />;
        })}
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 0.98);
  const trap = at(scene, 1);
  return (
    <>
      <Chip y={290}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>C</span>
          <Tex tex="528" size={104} color="#fff" />
        </div>
      </Chip>
      <Boxes
        vals={[
          <div key="n" style={{ opacity: ease(f, hit, 6), transform: `scale(${pop(f, hit)})` }}><Tex tex="528" size={64} color={C.green} /></div>,
          <div key="s" style={fadeUp(f, at(scene, 0, 0.05))}><Tex tex="529=23\times23" size={56} color={C.green} /></div>,
        ]}
      />
      {TV.map((v, i) => <Tile key={v} v={v} x={DEST[i][0]} y={DEST[i][1]} />)}
      <Chip y={935}>
        <div style={fadeUp(f, trap)}>
          <Tex tex={'2024=\\textcolor{#ef4343}{\\boxed{8}}\\times11\\times23'} size={60} />
        </div>
      </Chip>
      <Chip y={1040}>
        <div style={fadeUp(f, at(scene, 1, 0.4))}>
          <Tex tex={'253=11\\times23\\ \\ \\textcolor{#ef4343}{\\text{no }8}'} size={56} color={C.red} />
        </div>
      </Chip>
      <CtaPill start={at(scene, 2)} y={1170} />
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={trap} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={370} start={chime} seed={5} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, share: Share, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" captions="words" music={MUSIC} /> : null;

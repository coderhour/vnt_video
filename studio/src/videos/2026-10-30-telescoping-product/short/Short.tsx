import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { CommentBubble, CtaPill, MUSIC, PushIn, SFX, Sfx, ShortFrame, choicePulse } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Confetti, Text } from '../../../lib/ui';
import { CHIME, CHOICES, SLUG, br } from '../Composition';

export { SLUG };

// Trap-first short: hook (just under 1?) → question → think (comment bait) → the helper cascade (each row knocks over
// the next, zooms on the first collapse and the last row, a "brackets left" counter) → reveal (double it: C, the trap,
// CTA pill). The last frame shows the same product, at the same place, as frame 0.

const G = C.green;
const V = C.violet;
const before = -100;

const Center: React.FC<{ top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, style, children }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...style }}>{children}</div>
);

const P1 = `${br('+', '2')}${br('+', '4')}`;
const P2 = `${br('+', '16')}${br('+', '256')}`;
/** The four brackets in two rows. */
const Product: React.FC<{ size: number; gap?: number }> = ({ size, gap = 10 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap, whiteSpace: 'nowrap' }}>
    <Tex tex={P1} size={size} />
    <Tex tex={`\\times${P2}`} size={size} />
  </div>
);

const FIG_Y = 660;
const Fig: React.FC = () => (
  <Center top={FIG_Y}>
    <Product size={70} />
  </Center>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nope = at(scene, 0, 0.84);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 52, fontWeight: 900 }}>AMC 8 · Challenge #57</div>
      </div>
      <Text x={540} y={380} w={1000} size={92} weight={900} align="center" style={{ lineHeight: 1.15 }}>
        Think it's
        <br />
        <span style={{ color: C.red }}>just under 1</span>?
      </Text>
      <PushIn frames={scene.frames} origin="540px 800px">
        <Fig />
      </PushIn>
      <Sfx at={nope} src={SFX.buzz} volume={0.35} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(f, nope, 4) }}>
        <div style={{ transform: `rotate(-8deg) scale(${pop(f, nope)})`, border: `14px solid ${C.red}`, color: C.red, background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: '6px 54px', fontSize: 150, fontWeight: 900, letterSpacing: 6 }}>
          NOPE
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; sq?: number; pulse?: (i: number) => number }> = ({ start, sq = before, pulse = () => 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 40, top: 290, width: 1000, boxSizing: 'border-box', background: C.card, borderRadius: 32, padding: '22px 20px', boxShadow: '0 8px 30px rgba(30,40,80,0.07)', textAlign: 'center', fontSize: 54, fontWeight: 800 }}>
        <div style={{ marginBottom: 4 }}>
          <b style={{ color: C.violet }}>Multiply</b> the 4 brackets:
        </div>
        <Product size={50} gap={0} />
        <div style={{ marginTop: 6, color: C.muted, ...fadeUp(f, sq, 10) }}>
          2 → 4 → 16 → 256: <b style={{ color: C.violet }}>each squared</b>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, top: 812, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 8), background: C.card, borderRadius: 22, padding: '6px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 12, scale: String(pulse(i)) }}>
            <span style={{ color: C.muted, fontSize: 44, fontWeight: 900 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={56} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => (
  <>
    <QuestionBody start={(i) => at(scene, 0, 0.55 + i * 0.08)} sq={at(scene, 1, 0.1)} />
    <Sfx at={0} src={SFX.whoosh} volume={0.3} />
  </>
);

const Think: SceneComponent = () => {
  const f = useCurrentFrame();
  return (
    <>
      <QuestionBody start={() => before} pulse={(i) => choicePulse(f, i)} />
      <CommentBubble y={1140} />
    </>
  );
};

const ROWS = [
  `${br('-', '2', G)}${br('+', '2', V)}\\cdots`,
  `=${br('-', '4', G)}${br('+', '4', V)}\\cdots`,
  `=${br('-', '16', G)}${br('+', '16', V)}\\cdots`,
  `=${br('-', '256', G)}${br('+', '256', V)}`,
  `={\\color{${G}}1-\\dfrac{1}{256^2}}`,
];
const ROW_Y = [290, 460, 630, 800, 970];

/** The helper cascade: each row knocks over the next; a counter shows how many brackets are still waiting. */
const Helper: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [at(scene, 0, 0.45), at(scene, 1, 0.6), at(scene, 2, 0.1), at(scene, 2, 0.55), at(scene, 3, 0.12)];
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const collapse = at(scene, 3, 0.62);
  const left = 4 - starts.slice(1).filter((s) => f >= s).length;
  const zoomA = ease(f, l1 + 4, 12) * fadeTo(f, l2, 0, 10);
  const zoomB = ease(f, collapse, 10);
  const scale = 1 + 0.32 * zoomA + 0.22 * zoomB;
  const origin = zoomB > 0 ? '540px 1060px' : '540px 300px';
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      {starts.map((s, i) => <Sfx key={i} at={s} src={SFX.click} volume={0.28} />)}
      <Sfx at={l1 + 4} src={SFX.whoosh} volume={0.25} />
      <Sfx at={l2} src={SFX.whoosh} volume={0.22} />
      <Sfx at={collapse} src={SFX.whoosh} volume={0.25} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})`, transformOrigin: origin }}>
        {ROWS.map((r, i) => {
          const dim = i < 4 && f >= (starts[i + 1] ?? 1e9) ? 0.35 + 0.65 * (1 - ease(f, starts[i + 1], 10)) : 1;
          return (
            <Center key={i} top={ROW_Y[i]} style={{ ...fadeUp(f, starts[i]), opacity: (fadeUp(f, starts[i]).opacity as number) * dim * (i < 4 ? 1 - zoomB : 1) }}>
              <Tex tex={r} size={i === 4 ? 70 : 56} />
            </Center>
          );
        })}
      </div>
      <Text x={540} y={ROW_Y[0] + 10} w={1000} size={60} weight={900} align="center" color={G} style={{ opacity: ease(f, 4, 8) * fadeTo(f, starts[0] - 4, 0, 6) }}>
        Bring in a helper!
      </Text>
      <div style={{ position: 'absolute', left: 60, width: 860, top: 1180, display: 'flex', justifyContent: 'center' }}>
        <div key={left} style={{ transform: `scale(${pop(f, left === 4 ? starts[0] : starts[4 - left])})`, background: left === 0 ? G : C.card, color: left === 0 ? '#fff' : V, borderRadius: 26, padding: '10px 40px', fontSize: 64, fontWeight: 900, boxShadow: '0 8px 24px rgba(30,40,80,0.12)', whiteSpace: 'nowrap', opacity: ease(f, starts[0], 8) }}>
          {left === 0 ? 'collapsed!' : `${left} bracket${left === 1 ? '' : 's'} left`}
        </div>
      </div>
    </>
  );
};

/** Double it (undo the helper) → C, the trap, then the CTA pill over the same product as frame 0. */
const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.88); // "C"
  const chime = at(scene, 0, 0.99);
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} volume={0.3} />
      <Sfx at={at(scene, 0, 0.35)} src={SFX.click} volume={0.28} />
      <Sfx at={hit - 31} src={SFX.riser} volume={0.3} />
      <Sfx at={l1} src={SFX.buzz} volume={0.2} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Center top={290} style={fadeUp(f, at(scene, 0, 0.3), 10)}>
        <Tex tex={`2\\left(1-\\dfrac{1}{256^2}\\right)=2-\\dfrac{2}{256^2}`} size={60} />
      </Center>
      <Fig />
      <Center top={478} style={{ transform: `scale(${pop(f, hit)})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: G, color: '#fff', borderRadius: 28, padding: '8px 40px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 76, fontWeight: 900 }}>C</span>
          <Tex tex="=\dfrac{65535}{32768}" size={56} color="#fff" />
        </div>
      </Center>
      <Text x={540} y={1080} w={900} size={56} weight={900} align="center" color={C.red} style={fadeUp(f, l1 + 3)}>
        Just under 1? Forgot to double!
      </Text>
      <CtaPill start={l2} y={1180} />
      <Confetti x={540} y={540} start={chime} seed={11} />
    </>
  );
};

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, helper: Helper, reveal: Reveal };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" captions="words" music={MUSIC} /> : null;

import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { BASE, Beaker, CHIME, CH, JD, SLUG, TICK, WD } from '../Composition';

export { SLUG };

// Beakers are drawn in the long video's absolute-pixel layout; shift them down into the vertical stage.
const DY = 366; // BASE (824) → 1190
const SC = 22; // px per liter (25 L = 550 px)
const X1 = 100;
const X2 = 520;
const W = 200;

const Shift: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', left: 0, top: DY, width: 1080, height: 1200 }}>{children}</div>
);

const Br: React.FC<{ x: number; L1: number; L2: number; label: React.ReactNode; color: string; op: number; scale?: number }> = ({ x, L1, L2, label, color, op, scale = 1 }) => {
  if (op <= 0) return null;
  const top = BASE - L2 * SC;
  const h = (L2 - L1) * SC;
  return (
    <div style={{ opacity: op, transform: `scale(${scale})`, transformOrigin: `${x}px ${top + h / 2}px` }}>
      <div style={{ position: 'absolute', left: x, top, width: 22, height: h, borderStyle: 'solid', borderWidth: '6px 6px 6px 0', borderColor: color, borderRadius: '0 8px 8px 0' }} />
      <div style={{ position: 'absolute', left: x + 38, top: top + h / 2, transform: 'translateY(-50%)', fontSize: 56, fontWeight: 900, color, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const arrow = ease(f, at(scene, 0, 0.3), 12);
  const after = ease(f, at(scene, 0, 0.5), 14);
  const strong = ease(f, at(scene, 1, 0.1), 14);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center">
        Add water, and it gets <span style={{ color: JD }}>stronger</span>?
      </Text>
      <Shift>
        <Beaker x={X1} w={W} sc={SC} total={20} jp={1} wp={1} j={6} wt={14} tint={1} tintJ={0.3} head={['20 L', '30% juice']} />
        <Beaker x={X2} w={W} sc={SC} total={25} jp={1} wp={1} j={10} wt={15} tint={1} tintJ={0.4} op={after} head={['25 L', '40% juice']} />
        <div style={{ position: 'absolute', left: X1 + W + 20, width: X2 - X1 - W - 40, top: 235, textAlign: 'center', fontSize: 42, fontWeight: 900, lineHeight: 1.25, opacity: arrow }}>
          <div style={{ color: JD }}>+ juice</div>
          <div style={{ color: WD }}>+ water</div>
          <div style={{ fontSize: 80, color: C.ink, lineHeight: 1 }}>→</div>
        </div>
      </Shift>
      <Text x={540} y={1215} w={900} size={60} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        <span style={{ opacity: strong }}>30% → 40% juice!</span>
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '24px 40px', fontSize: 46, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>20 L</b>, <b style={{ color: JD }}>30% juice</b>. Add juice and water: <b style={{ color: C.primary }}>25 L</b>, <b style={{ color: JD }}>40% juice</b>. <b>How many liters of water?</b>
      </div>
      <Shift>
        <Beaker x={X1} w={W} sc={SC} total={20} jp={1} wp={1} j={6} wt={14} tint={1} tintJ={0.3} head={['20 L', '30% juice']} />
        <Beaker x={X2} w={W} sc={SC} total={25} jp={1} wp={1} j={10} wt={15} tint={1} tintJ={0.4} head={['25 L', '40% juice']} />
      </Shift>
      <div style={{ position: 'absolute', left: 60, top: 1212, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 50, fontWeight: 900 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.07)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Split: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = ease(f, at(scene, 2, 0.05), 14);
  const lab1 = ease(f, at(scene, 1, 0.3), 10);
  const lab2 = ease(f, at(scene, 1, 0.75), 10);
  const growJ = ease(f, at(scene, 0, 0.5), 18);
  const growW = ease(f, at(scene, 0, 0.8), 18);
  return (
    <>
      <Text x={540} y={300} w={980} size={72} weight={900} align="center" style={fadeUp(f, 0)}>
        Split into <span style={{ color: JD }}>juice</span> and <span style={{ color: WD }}>water</span>
      </Text>
      <Shift>
        <Beaker x={X1} w={W} sc={SC} total={20} j={6} wt={14} jp={growJ} wp={growW} jl={lab1} wl={lab1} grey={g * 0} head={['20 L', '30% juice']} />
        <Beaker x={X2} w={W} sc={SC} total={25} j={10} wt={15} jp={growJ} wp={growW} jl={lab2} wl={lab2} head={['25 L', '40% juice']} />
      </Shift>
      <Shift>
        <div style={{ position: 'absolute', left: X1 + W + 10, width: X2 - X1 - W - 20, top: 150, textAlign: 'center', fontSize: 120, fontWeight: 900, color: C.muted, opacity: g, lineHeight: 1 }}>→</div>
        <div style={{ position: 'absolute', left: X2 + W + 24, top: BASE - 25 * SC - 8, opacity: g, fontSize: 52, fontWeight: 900, color: WD, whiteSpace: 'nowrap', lineHeight: 1.1 }}>
          water<br />14 → 15
        </div>
      </Shift>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.25);
  const chime = at(scene, 0, 1);
  const juice = ease(f, at(scene, 1, 0.2), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 90, fontWeight: 900 }}>1 L</span>
          <span style={{ fontSize: 54, fontWeight: 900 }}>of water</span>
        </div>
      </div>
      <Shift>
        <Beaker x={X1} w={W} sc={SC} total={20} j={6} wt={14} jp={1} wp={1} jl={1} wl={1} grey={0.8 * juice} head={['20 L', '30% juice']} />
        <Beaker x={X2} w={W} sc={SC} total={25} j={10} wt={15} jp={1} wp={1} jl={1} wl={1} grey={0.8 * juice} head={['25 L', '40% juice']} />
        <Br x={X2 + W + 24} L1={24} L2={25} label="+1 L" color={WD} op={ease(f, hit, 8)} scale={pop(f, hit)} />
        <Br x={X2 + W + 24} L1={6} L2={10} label={<div style={{ lineHeight: 1 }}>+4<div style={{ fontSize: 40 }}>juice</div></div>} color={JD} op={juice} />
      </Shift>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:15" bullets={['Two ways to solve it', 'Every trap explained', 'A sneakier mix to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, split: Split, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

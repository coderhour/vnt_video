import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, HC, SLUG, TC, TICK } from '../Composition';

export { SLUG };

// ---------- the staircase (hook and question) ----------

/** Columns 0..6: the ground and six steps. `pia` = (fractional) column of the marker. */
const Stairs: React.FC<{ base: number; pitch: number; w: number; ht: number; hi?: number; pia?: number; hop?: number; left?: number }> = ({ base, pitch, w, ht, hi = 0, pia, hop = 0, left = 70 }) => (
  <>
    {[1, 2, 3, 4, 5, 6].map((k) => {
      const five = k === 5;
      return (
        <div key={k} style={{ position: 'absolute', left: left + k * pitch, top: base - k * ht, width: w, height: k * ht, borderRadius: '14px 14px 0 0', background: five && hi > 0 ? C.amber : C.card, border: `5px solid ${five && hi > 0 ? C.amber : C.line}`, boxSizing: 'border-box', boxShadow: '0 6px 16px rgba(30,40,80,0.07)', display: 'flex', justifyContent: 'center', paddingTop: 8, fontSize: 48, fontWeight: 900, color: five && hi > 0 ? '#fff' : C.muted }}>
          {k}
        </div>
      );
    })}
    <div style={{ position: 'absolute', left: left - 10, top: base, width: 6 * pitch + w + 20, height: 8, borderRadius: 4, background: C.line }} />
    {pia !== undefined && (
      <div style={{ position: 'absolute', left: left + pia * pitch + w / 2 - 36, top: base - (pia >= 1 ? pia * ht : 0) - 84 - hop, width: 72, height: 72, borderRadius: '50%', background: C.violet, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(123,97,255,0.4)' }}>Pia</div>
    )}
  </>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const path = [0, 1, 3, 4, 6];
  const hops = [0.2, 0.4, 0.6, 0.8].map((t) => at(scene, 0, t));
  const dur = 14;
  let pia = 0;
  let hop = 0;
  hops.forEach((s, i) => {
    const p = ease(f, s, dur);
    pia += (path[i + 1] - path[i]) * p;
    if (p > 0 && p < 1) hop = 70 * Math.sin(Math.PI * p);
  });
  const hi = f >= at(scene, 1, 0.05) ? 1 : 0;
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        Will she land on <span style={{ color: C.amber }}>step 5</span>?
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 420, display: 'flex', justifyContent: 'center', gap: 20, ...fadeUp(f, at(scene, 0, 0.1)) }}>
        <div style={{ background: HC, color: '#fff', borderRadius: 999, padding: '6px 28px', fontSize: 46, fontWeight: 900 }}>Heads +1</div>
        <div style={{ background: TC, color: '#fff', borderRadius: 999, padding: '6px 28px', fontSize: 46, fontWeight: 900 }}>Tails +2</div>
      </div>
      <Stairs base={1180} pitch={135} w={120} ht={78} hi={hi} pia={pia} hop={hop} />
      <Text x={540} y={1215} w={900} size={60} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.2))}>
        or jump right over it?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        Pia flips a fair coin before each move: <b style={{ color: HC }}>heads, up 1</b>, <b style={{ color: TC }}>tails, up 2</b>. <b>Chance she stands on step 5?</b>
      </div>
      <Stairs base={1060} pitch={116} w={100} ht={52} hi={1} pia={0} left={90} />
      <div style={{ position: 'absolute', left: 60, top: 1120, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={48} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

// ---------- the ladder of chances ----------

const TEX = ['1', '\\dfrac{1}{2}', '\\dfrac{3}{4}', '\\dfrac{5}{8}', '\\dfrac{11}{16}', '\\dfrac{21}{32}'];
const P = [1, 1 / 2, 3 / 4, 5 / 8, 11 / 16, 21 / 32];
const BX = 260;
const BW = 520; // bar width for chance 1
const rowY = (k: number) => 1180 - k * 124;

/** One row per step. `t(k)` = frame the bar of step k grows; `hi(k)` = 0..1 amber outline. */
const Ladder: React.FC<{ t: (k: number) => number; hi?: (k: number) => number; label5?: boolean; green5?: number }> = ({ t, hi = () => 0, green5 = 0 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {P.map((p, k) => {
        const g = ease(f, t(k), 16);
        const h = hi(k);
        const col = k === 5 ? (green5 > 0 ? C.green : C.amber) : C.primary;
        return (
          <div key={k}>
            <div style={{ position: 'absolute', left: 30, top: rowY(k), width: 210, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 46, fontWeight: 900, color: k === 5 ? C.amber : C.muted }}>{k === 0 ? 'ground' : `step ${k}`}</div>
            <div style={{ position: 'absolute', left: BX, top: rowY(k), width: BW * p * g, height: 90, borderRadius: 16, background: col, outline: h > 0 ? `8px solid ${C.amber}` : undefined, opacity: Math.min(1, g * 3) }} />
            <div style={{ position: 'absolute', left: BX + BW * p + 24, top: rowY(k), height: 90, display: 'flex', alignItems: 'center', opacity: ease(f, t(k) + 10, 8), color: k === 5 ? C.green : C.ink }}>
              <Tex tex={TEX[k]} size={k === 0 ? 52 : 40} color={k === 5 ? C.green : C.ink} />
            </div>
          </div>
        );
      })}
    </>
  );
};

const LadderScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const tk = [0.1, 0.26, 0.38, 0.55, 0.72].map((x) => at(scene, 2, x));
  const t = (k: number) => (k <= 4 ? tk[k] : 1e9);
  const hi = (j: number) => {
    // while step k grows, the two steps below it glow
    for (let k = 2; k <= 4; k++) if (f >= tk[k] && f < tk[k] + 26 && (j === k - 1 || j === k - 2)) return 1;
    if (f >= tk[1] && f < tk[1] + 26 && j === 0) return 1;
    return 0;
  };
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', gap: 18 }}>
        <div style={{ ...fadeUp(f, at(scene, 0, 0.35)), background: HC, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: 44, fontWeight: 900, whiteSpace: 'nowrap' }}>H: from 1 below</div>
        <div style={{ ...fadeUp(f, at(scene, 0, 0.7)), background: TC, color: '#fff', borderRadius: 999, padding: '6px 26px', fontSize: 44, fontWeight: 900, whiteSpace: 'nowrap' }}>T: from 2 below</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0.3)) }}>
        <Tex tex={'\\text{chance} = \\text{average of the two below}'} size={56} />
      </div>
      <Ladder t={t} hi={hi} />
      <div style={{ position: 'absolute', left: 60, top: rowY(5) - 6, width: 860, height: 102, border: `6px dashed ${C.amber}`, borderRadius: 24, boxSizing: 'border-box', opacity: ease(f, at(scene, 1, 0.5), 10) * 0.8 }} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const grow = t(0.6);
  const hit = t(0.76);
  const end = at(scene, 0, 1);
  const half = ease(f, at(scene, 1, 0.1), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, 4), opacity: ease(f, 4, 14) * fadeTo(f, hit - 6, 0, 6) }}>
        <Tex tex={'\\left(\\dfrac{11}{16}+\\dfrac{5}{8}\\right)\\div 2'} size={56} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, borderRadius: 28, padding: '10px 52px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="\dfrac{21}{32}" size={84} color="#fff" />
        </div>
      </div>
      <Ladder t={(k) => (k <= 4 ? -100 : grow)} hi={(k) => (k === 3 || k === 4) && f >= t(0.05) && f < grow + 10 ? 1 : 0} green5={f >= hit ? 1 : 0} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: half }}>
        <line x1={BX + BW / 2} y1={rowY(5) - 8} x2={BX + BW / 2} y2={rowY(0) + 96} stroke={C.red} strokeWidth={6} strokeDasharray="14 12" />
      </svg>
      <Text x={BX + BW / 2 - 100} y={rowY(5) - 64} w={200} size={48} weight={900} color={C.red} align="center" style={{ opacity: half }}>
        half
      </Text>
      <Sequence from={end} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={end} seed={29} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:00" bullets={['A list of every way to land', 'The ladder, step by step', 'Every trap, plus step 6']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, ladder: LadderScene, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

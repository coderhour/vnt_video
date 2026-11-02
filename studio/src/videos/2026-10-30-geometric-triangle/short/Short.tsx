import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG, TICK } from '../Composition';

export { SLUG };

/** Three bars: the sides, each the last one times the same multiplier. */
const Bars: React.FC<{ y: number; scale?: number; start?: number; labels?: [string, string, string] }> = ({ y, scale = 1, start = 0, labels = ['?', '?', '2025'] }) => {
  const f = useCurrentFrame();
  const W = [280, 450, 720].map((w) => w * scale);
  const H = 80 * scale;
  const gap = 36 * scale + 14;
  const cols = [C.primary, C.violet, C.blue];
  return (
    <div style={{ position: 'absolute', left: 130, top: y, width: 800 }}>
      {W.map((w, i) => (
        <div key={i} style={{ position: 'relative', height: H + gap, ...fadeUp(f, start + i * 6) }}>
          <div style={{ width: w, height: H, background: cols[i], borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 56 * Math.max(scale, 0.8), fontWeight: 900 }}>{labels[i]}</div>
          {i < 2 && (
            <div style={{ position: 'absolute', left: w + 30, top: H - 4, fontSize: 46 * Math.max(scale, 0.8), fontWeight: 900, color: C.muted, whiteSpace: 'nowrap' }}>↓ × same multiplier</div>
          )}
        </div>
      ))}
    </div>
  );
};

const Hook: SceneComponent = () => (
  <>
    <Text x={540} y={300} w={980} size={74} weight={900} align="center">
      How many <span style={{ color: C.violet }}>triangles</span>?
    </Text>
    <Bars y={520} />
    <Text x={540} y={1010} w={900} size={56} weight={900} color={C.muted} align="center">
      the longest side is 2025
    </Text>
  </>
);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>3 different whole sides</b>, each the last × a fixed <b style={{ color: C.primary }}>multiplier</b>. Longest side <b style={{ color: C.blue }}>2025</b>. How many triangles?
      </div>
      <Bars y={630} scale={0.62} start={-100} />
      <div style={{ position: 'absolute', left: 60, top: 1010, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const CELL = 76;
const STEP = 82;
/** k = 1…44 as an 11 × 4 board. `appear(k)`, `red(k)` and `green(k)` are the frames where a cell shows, fails and closes. */
const Board: React.FC<{ y: number; appear: (k: number) => number; red: (k: number) => number; green: (k: number) => number; ring?: number }> = ({ y, appear, red, green, ring }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 44 }, (_, i) => {
        const k = i + 1;
        const col = i % 11;
        const row = Math.floor(i / 11);
        const o = ease(f, appear(k), 8);
        if (o <= 0) return null;
        const g = f >= green(k);
        const r = !g && f >= red(k);
        return (
          <div
            key={k}
            style={{
              position: 'absolute', left: 69 + col * STEP, top: y + row * STEP, width: CELL, height: CELL, borderRadius: 16, opacity: o,
              background: g ? C.green : r ? C.red : C.card, color: g || r ? '#fff' : C.ink, boxShadow: ring === k ? `0 0 0 6px ${C.amber}` : '0 3px 10px rgba(30,40,80,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900,
            }}
          >
            {k}
          </div>
        );
      })}
    </>
  );
};

const Rule: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const appear = (k: number) => at(scene, 1, 0.3) + k * 1.2;
  const red = (k: number) => at(scene, 2, 0.05) + k * 2.5;
  const green = (k: number) => (k >= 28 ? l3 + 14 + (k - 28) * 2 : 99999);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 66, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1) }}>
          sides <span style={{ color: C.primary }}>k²</span>, <span style={{ color: C.violet }}>45k</span>, <span style={{ color: C.blue }}>2025</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 10) * fadeTo(f, l2) }}>
          k = 1, 2, … , 44
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 10) }}>
          need <span style={{ color: C.primary }}>k²</span> + <span style={{ color: C.violet }}>45k</span> &gt; <span style={{ color: C.blue }}>2025</span>
        </div>
      </div>
      <div style={{ opacity: fadeTo(f, l1 + 4) }}>
        <Bars y={520} scale={0.8} start={0} labels={['k²', '45k', '2025']} />
      </div>
      <Board y={500} appear={appear} red={(k) => (k <= 27 ? red(k) : 99999)} green={green} ring={f >= l3 + 6 ? 28 : f >= at(scene, 2, 0.5) ? 27 : undefined} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 900, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.55)), opacity: ease(f, at(scene, 2, 0.55), 10) * fadeTo(f, l3 + 2, 0, 6) }}>
        <Tex tex={'729+1215=\\color{#ef4343}{1944<2025}'} size={56} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 900, display: 'flex', justifyContent: 'center', opacity: ease(f, l3 + 8, 10) }}>
        <Tex tex={'784+1260=\\color{#21c45d}{2044>2025}'} size={56} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.62);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="17" size={100} color="#fff" />
          <span style={{ fontSize: 58, fontWeight: 900 }}>triangles</span>
        </div>
      </div>
      <Board y={500} appear={() => -100} red={(k) => (k <= 27 ? 0 : 99999)} green={(k) => (k >= 28 ? 0 : 99999)} />
      <Text x={540} y={880} w={900} size={52} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 0, 0.3))}>
        k = 28 … 44 close
      </Text>
      <Text x={540} y={970} w={900} size={52} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        44 counts the ones that fail too
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:53" bullets={['Where k² and 45k come from', 'A faster middle-side trick', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, rule: Rule, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

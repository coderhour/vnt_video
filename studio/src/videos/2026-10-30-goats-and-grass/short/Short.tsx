import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, GROW, HELP, SLUG, START, TICK } from '../Composition';

export { SLUG };

const Fact: React.FC<{ y: number; goats: string; days: string; start: number; hot?: boolean; size?: number }> = ({ y, goats, days, start, hot, size = 60 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 90, top: y, width: 740, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontSize: size, fontWeight: 900, background: hot ? C.violetSoft : C.card, borderRadius: 26, padding: '14px 10px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)', ...fadeUp(f, start) }}>
      <span style={{ color: START }}>{goats} goats</span>
      <span style={{ color: C.muted }}>→</span>
      <span style={{ color: hot ? HELP : C.ink }}>{days}</span>
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={74} weight={900} align="center">
        Goats vs <span style={{ color: START }}>growing grass</span>
      </Text>
      <Fact y={520} goats="10" days="20 days" start={0} />
      <Fact y={680} goats="15" days="10 days" start={at(scene, 0, 0.55)} />
      <Fact y={840} goats="25" days="? days" start={at(scene, 1, 0.3)} hot />
      <Text x={540} y={1030} w={900} size={54} weight={900} color={GROW} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        and the grass keeps growing!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        New grass <b style={{ color: GROW }}>grows steadily</b>. All goats eat at the same rate. How many days for <b style={{ color: HELP }}>25 goats</b>?
      </div>
      <Fact y={610} goats="10" days="20 days" start={-100} size={52} />
      <Fact y={740} goats="15" days="10 days" start={-100} size={52} />
      <div style={{ position: 'absolute', left: 60, top: 920, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
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

const U = 3.6; // px per goat-day
const X0 = 100;

const Bar: React.FC<{ y: number; from: number; to: number; color: string; start: number; label?: string }> = ({ y, from, to, color, start, label }) => {
  const f = useCurrentFrame();
  const p = ease(f, start, 16);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: X0 + from * U, top: y, width: (to - from) * U * p, height: 90, background: color, borderRadius: 14, overflow: 'hidden', whiteSpace: 'nowrap', color: '#fff', fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {p > 0.9 ? label : ''}
    </div>
  );
};

const Growth: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l1 = at(scene, 1);
  const l2 = at(scene, 2);
  const l3 = at(scene, 3);
  const split = ease(f, l2 + 8, 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, textAlign: 'center', fontSize: 66, fontWeight: 900 }}>
        <div style={{ position: 'absolute', width: 1080, opacity: fadeTo(f, l1) }}>
          Count in <span style={{ color: START }}>goat-days</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l1, 10) * fadeTo(f, l2) }}>
          Growth: <span style={{ color: GROW }}>5 a day</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l2, 10) * fadeTo(f, l3) }}>
          Starting pile: <span style={{ color: START }}>100</span>
        </div>
        <div style={{ position: 'absolute', width: 1080, opacity: ease(f, l3, 10) }}>
          <span style={{ color: HELP }}>5 helpers</span> + 20 on the pile
        </div>
      </div>
      <div style={{ opacity: fadeTo(f, l3 - 2, 0, 8) }}>
        <Text x={X0} y={440} w={760} size={46} weight={800} color={C.muted} style={fadeUp(f, 6)}>
          10 goats × 20 days
        </Text>
        <div style={{ opacity: 1 - split }}>
          <Bar y={490} from={0} to={200} color={START} start={at(scene, 0, 0.2)} label="200" />
        </div>
        <div style={{ opacity: split }}>
          <Bar y={490} from={0} to={100} color={START} start={-100} label="start 100" />
          <Bar y={490} from={100} to={200} color={GROW} start={-100} label="20×5" />
        </div>
        <Text x={X0} y={600} w={760} size={46} weight={800} color={C.muted} style={fadeUp(f, at(scene, 0, 0.55))}>
          15 goats × 10 days
        </Text>
        <Bar y={650} from={0} to={150} color={START} start={at(scene, 0, 0.7)} label="150" />
        {/* the 50 that the first field grew extra */}
        <div style={{ opacity: ease(f, l1 + 6, 10) * fadeTo(f, l2 + 4, 0, 8) }}>
          <div style={{ position: 'absolute', left: X0 + 150 * U, top: 650, width: 50 * U, height: 90, border: `6px dashed ${GROW}`, borderRadius: 14, color: GROW, fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>50</div>
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center' }}>
            <Tex tex={'50 \\div 10 = \\color{#3c83f6}{5}'} size={76} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center', opacity: ease(f, l2 + 12, 10) }}>
          <Tex tex={'200 - 100 = \\color{#0cc281}{100}'} size={76} />
        </div>
      </div>
      <GoatTokens y={500} helpers={ease(f, at(scene, 3, 0.3), 10)} start={l3} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 950, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 3, 0.55)) }}>
        <Tex tex={'\\dfrac{100}{20}'} size={110} />
      </div>
    </>
  );
};

/** 25 goats as 5 helpers (violet) + 20 pile-eaters (green), in 2 rows. */
const GoatTokens: React.FC<{ y: number; helpers: number; start: number }> = ({ y, helpers, start }) => {
  const f = useCurrentFrame();
  const o = ease(f, start + 6, 10);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: 1080, opacity: o }}>
      <svg width={1080} height={430} viewBox="0 0 1080 430">
        {Array.from({ length: 25 }, (_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const isHelper = i < 5;
          const x = 130 + col * 76;
          const yy = 50 + row * 76;
          return <circle key={i} cx={x} cy={yy} r={28} fill={isHelper && helpers > 0 ? HELP : START} opacity={0.95} />;
        })}
        <text x={540} y={110} fill={HELP} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={52} opacity={helpers}>5 keep up</text>
        <text x={540} y={160} fill={HELP} fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={44} opacity={helpers}>with growth</text>
        <text x={540} y={260} fill={START} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={50}>20 eat the pile</text>
      </svg>
    </div>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.74);
  const chime = at(scene, 0, 0.97);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 50px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex="5" size={104} color="#fff" />
          <span style={{ fontSize: 62, fontWeight: 900 }}>days</span>
        </div>
      </div>
      <GoatTokens y={470} helpers={1} start={-100} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 880, display: 'flex', justifyContent: 'center' }}>
        <Tex tex={'\\dfrac{100}{20}=5'} size={90} color={C.green} />
      </div>
      <Text x={540} y={1140} w={900} size={52} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        100 ÷ 25 = 4 ✗ ignores the growth
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:42" bullets={['Counting in goat-days', 'A second way: helper goats', 'Every trap explained']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, growth: Growth, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

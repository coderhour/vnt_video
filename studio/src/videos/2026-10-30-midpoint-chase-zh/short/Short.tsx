import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { ZH_FONT } from '../../../lib/fonts';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Dot, GREY, Jump, NLine, PTS, SLUG, T, TICK, mapper } from '../Composition';

export { SLUG };

const m = mapper(0, 64, 110, 900);
const Y = 800;

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const dot = (f: number, n: number, at0: number, color = C.primary) => <Dot key={n} x={m(PTS[n - 1])} y={Y} n={n} color={color} label={0} op={ease(f, at0, 8)} r={17} />;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t3 = at(scene, 0, 0.7);
  const t4 = at(scene, 1, 0.1);
  return (
    <>
      <Title>
        <span style={{ color: C.violet }}>中点</span>追逐
      </Title>
      <Stage>
        <NLine m={m} x0={110} x1={900} y={Y} lo={0} hi={64} step={8} major={16} labels={[0, 32, 64]} />
        {[1, 2].map((n) => (
          <Dot key={n} x={m(PTS[n - 1])} y={Y} n={n} color={GREY} label={1} r={17} />
        ))}
        <Dot x={m(32)} y={Y} n={3} color={GREY} label={1} op={ease(f, t3, 10)} r={17} />
        <Dot x={m(48)} y={Y} n={4} color={C.primary} label={1} op={ease(f, t4, 10)} r={17} />
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, fontSize: 70, fontWeight: 900, color: C.amber, opacity: ease(f, at(scene, 1, 0.45), 10) }}>
        <Tex tex="P_{10}" size={84} color={C.amber} /> = ?
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 52, fontWeight: 700, lineHeight: 1.5, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        数轴上 <Tex tex="P_1 = 0" size={54} />，<Tex tex="P_2 = 64" size={54} />。每个新点都是前两点的<b style={{ color: C.violet }}>中点</b>。<Tex tex="P_{10}" size={54} /> 在哪里？
      </div>
      <Stage>
        <NLine m={m} x0={110} x1={900} y={800} lo={0} hi={64} step={8} major={16} labels={[0, 32, 64]} />
        <Dot x={m(0)} y={800} n={1} color={GREY} label={1} r={17} />
        <Dot x={m(64)} y={800} n={2} color={GREY} label={1} r={17} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1040, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 36, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={58} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 2, 0.3 + i * 0.12)} />;

// Chinese copy of lib/PauseCard's Countdown (its "Pause & try it!" header is hard-coded English).
const ZhCountdown: React.FC<{ scene: Scene; seconds: number; x: number; y: number }> = ({ scene, seconds, x, y }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = scene.frames - seconds * fps;
  const left = Math.max(0, Math.min(seconds, Math.ceil((scene.frames - f) / fps)));
  const p = Math.max(0, Math.min(1, (f - start) / (seconds * fps)));
  const R = 170;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'absolute', left: x - 230, top: y - 260, width: 460, textAlign: 'center', ...fadeUp(f, 0) }}>
      <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 20 }}>
        暂停，试一试<span style={{ color: C.primary }}>！</span>
      </div>
      <svg width={460} height={420} viewBox="-230 -210 460 420">
        <circle r={R} fill={C.card} stroke={C.line} strokeWidth={22} />
        <circle r={R} fill="none" stroke={C.primary} strokeWidth={22} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * p} transform="rotate(-90)" opacity={ease(f, start - 10, 10)} />
        <text y={10} fontSize={150} fontWeight={900} textAnchor="middle" dominantBaseline="middle" fill={C.ink}>
          {left}
        </text>
      </svg>
      {range(seconds).map((i) => (
        <Sequence key={i} from={start + i * fps} durationInFrames={10} layout="none">
          <Audio src={TICK} volume={0.2} />
        </Sequence>
      ))}
    </div>
  );
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <ZhCountdown scene={scene} seconds={3} x={540} y={900} />
  </>
);

const Jumps: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const starts = [at(scene, 0, 0.25), at(scene, 0, 0.55), at(scene, 0, 0.85), at(scene, 1, 0.55), ...[0, 1, 2, 3, 4].map((i) => at(scene, 2, 0.05 + i * 0.18))];
  const labs = ['64', '32', '16', '8'];
  const pat = ease(f, at(scene, 1, 0.1), 12);
  const q = ease(f, at(scene, 2, 0.7), 12);
  return (
    <>
      <Title>
        每一跳 = 上一跳的 <span style={{ color: C.amber }}>½</span>
      </Title>
      <Stage>
        <NLine m={m} x0={110} x1={900} y={Y} lo={0} hi={64} step={8} major={16} />
        {starts.map((s, k) => (
          <Jump key={k} a={m(PTS[k])} b={m(PTS[k + 1])} y={Y} p={ease(f, s, 18)} hMax={150} lab={labs[k]} labSize={56} />
        ))}
        {PTS.slice(0, 10).map((_, i) => (i === 0 ? dot(f, 1, 0, GREY) : dot(f, i + 1, i <= 3 ? starts[i - 1] + 12 : starts[i - 1] + 12, i < 2 ? GREY : C.primary)))}
      </Stage>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1090, display: 'flex', justifyContent: 'center', gap: 30, fontSize: 64, fontWeight: 900, opacity: pat }}>
        <span style={{ color: C.primary }}>向右 →</span>
        <span style={{ color: C.violet }}>← 向左</span>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 520, textAlign: 'center', fontSize: 110, fontWeight: 900, color: C.amber, opacity: q, fontFamily: ZH_FONT }}>?</div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.55);
  const chime = at(scene, 0, 1);
  const z = mapper(41, 45, 110, 900);
  const grey = [5, 6, 7, 8];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'P_{10} = 42\\tfrac34'} size={78} color="#fff" />
          <span style={{ fontSize: 54, fontWeight: 900 }}>· C</span>
        </div>
      </div>
      <Stage>
        <NLine m={z} x0={110} x1={900} y={800} lo={41} hi={45} step={0.25} major={1} labels={[41, 42, 43, 44, 45]} />
        {grey.map((n, i) => (
          <circle key={n} cx={z(PTS[n])} cy={800} r={14} fill={GREY} stroke="#fff" strokeWidth={4} opacity={ease(f, at(scene, 0, 0.1 + i * 0.12), 8)} />
        ))}
        <Dot x={z(42.75)} y={800} n={10} color={C.green} label={ease(f, hit, 8)} r={20} op={ease(f, hit, 8)} />
      </Stage>
      <Text x={540} y={1100} w={900} size={54} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        每个选项都是真实出现过的点
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard
    scene={scene}
    poster={staticFile(`${SLUG}/short/full.jpg`)}
    length="6:25"
    title={
      <>
        想看<span style={{ color: C.primary }}>完整课程</span>？
      </>
    }
    bullets={['逐跳列出每个点', '两两配对的巧妙方法', '每个错误选项的陷阱']}
  />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, jumps: Jumps, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8 风格" font={ZH_FONT} /> : null;

import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Arc, BH, BODY_TOP, CH, CHIME, COL_A, COL_B, JX, JugGlow, Jugs, MAIN, ORT, SLUG, Swirl, TICK, T_END, T_START, type Phases } from '../Composition';

export { SLUG };

const OX = 70;
const S = 0.9;
const CAx = OX + 220 * S;
const CBx = OX + (JX.B + 220) * S;
const jugBottom = (oy: number, s = S) => oy + (BODY_TOP + BH) * s;

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const oy = 560;
  return (
    <>
      <Title>
        Pour. Stir. <span style={{ color: C.violet }}>Pour back.</span>
      </Title>
      <Jugs ox={OX} oy={oy} s={S} blocks={MAIN} T={T_START}>
        <Arc from={JX.B + 220} to={JX.A + 220} y0={-6} peak={-170} start={at(scene, 0, 0.15)} />
        <Arc from={JX.A + 220} to={JX.B + 220} y0={BODY_TOP + BH + 30} peak={BODY_TOP + BH + 170} start={at(scene, 0, 0.6)} />
      </Jugs>
      <Text x={540} y={1080} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Most kids get it wrong!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 44, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: COL_A }}>Jug A:</b> 10 L water. <b style={{ color: COL_B }}>Jug B:</b> 10 L, 60% juice. Pour 5 L B → A, stir, pour 5 L back. <b>What % of B is juice?</b>
      </div>
      <Jugs ox={OX} oy={610} s={S} blocks={MAIN} T={T_START} />
      <div style={{ position: 'absolute', left: 60, top: 1070, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={`${c}\\%`} size={48} />
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

const Val: React.FC<{ x: number; y: number; vals: [number, string][]; color: string; label: string }> = ({ x, y, vals, color, label }) => {
  const f = useCurrentFrame();
  let cur = vals[0][1];
  let t0 = vals[0][0];
  for (const [t, v] of vals) if (f >= t) { cur = v; t0 = t; }
  const k = pop(f, t0);
  return (
    <div style={{ position: 'absolute', left: x - 200, top: y, width: 400, textAlign: 'center', fontSize: 54, fontWeight: 900, color, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 40, color: C.muted, fontWeight: 800 }}>{label} </span>
      <span style={{ display: 'inline-block', transform: `scale(${0.8 + 0.2 * Math.min(1, k)})` }}>{cur}</span>
    </div>
  );
};

const Pour: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const oy = 450;
  const a1 = at(scene, 1, 0.5);
  const a2 = at(scene, 2, 0.35);
  const T: Phases = { p1: [a1, a1 + 36], s1: [a1 + 44, a1 + 68], p2: [a2, a2 + 36], s2: [a2 + 44, a2 + 68] };
  const by = jugBottom(oy) + 24;
  const eq = (tex: string, start: number, end: number, color: string) => (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 1060, display: 'flex', justifyContent: 'center', ...fadeUp(f, start), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 10) }}>
      <Tex tex={tex} size={68} color={color} />
    </div>
  );
  return (
    <>
      <Title>
        Count <span style={{ color: ORT }}>juice</span>, not percents
      </Title>
      <Jugs ox={OX} oy={oy} s={S} blocks={MAIN} T={T}>
        <Swirl j="A" start={T.s1[0]} end={T.s1[1] + 6} />
        <Swirl j="B" start={T.s2[0]} end={T.s2[1] + 6} />
        <JugGlow j="B" start={at(scene, 1, 0.1)} end={a1} color={COL_B} />
      </Jugs>
      <Val x={CAx} y={by} color={COL_A} label="juice" vals={[[0, '0 L'], [a1 + 20, '3 L'], [a2 + 20, '2 L']]} />
      <Val x={CBx} y={by} color={COL_B} label="juice" vals={[[at(scene, 1, 0.05), '6 L'], [a1 + 20, '3 L'], [a2 + 20, '4 L']]} />
      {eq('\\dfrac{1}{2}\\text{ of }6 = 3\\text{ L}', a1 - 10, a2 - 20, C.ink)}
      {eq('\\dfrac{1}{3}\\text{ of }3 = 1\\text{ L}', a2 - 5, 1e6, C.ink)}
      <div style={{ position: 'absolute', left: 120, top: 1220, display: 'flex', gap: 14, fontSize: 40, fontWeight: 800, alignItems: 'center', color: C.muted, ...fadeUp(f, 6) }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#ff8a1f', border: '4px solid #e06d00', boxSizing: 'border-box' }} /> juice
        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#9fd4ff', border: '4px solid #5fb0ee', boxSizing: 'border-box', marginLeft: 20 }} /> water
        <span style={{ marginLeft: 20 }}>1 block = 1 L</span>
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const oy = 630;
  const hit = at(scene, 1, 0.05);
  const chime = at(scene, 1, 1);
  return (
    <>
      <Text x={540} y={310} w={980} size={64} weight={900} color={COL_B} align="center" style={{ ...fadeUp(f, at(scene, 0, 0.4)), opacity: ease(f, at(scene, 0, 0.4), 10) * fadeTo(f, hit, 0, 8) }}>
        3 L + 1 L = 4 L of juice
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 44px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <Tex tex={'\\dfrac{4}{10} = 40\\%'} size={92} color="#fff" />
        </div>
      </div>
      <Jugs ox={OX} oy={oy} s={S} blocks={MAIN} T={T_END}>
        <JugGlow j="B" start={at(scene, 0, 0.5)} color={C.green} />
      </Jugs>
      <Text x={CBx} y={jugBottom(oy) + 24} w={420} size={48} weight={900} color={COL_B} align="center" style={fadeUp(f, at(scene, 0, 0.5))}>
        4 L juice of 10 L
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="5:30" bullets={['Two ways to solve it', 'Every wrong answer explained', 'A new mix to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, pour: Pour, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

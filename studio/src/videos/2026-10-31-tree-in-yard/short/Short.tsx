import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, CHIME, E0, Lab, SLUG, TICK, VALS, Yard, eaLab, ebLab, ecLab } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

// 16 x 8 yard, 46 px per metre: 736 x 368, bottom-left at (110, oy)
const Y = { L: 16, W: 8, u: 46, ox: 110 };
const HOPS = [3, 6, 13, 5, 12, 8, 14, 7];

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const end = scene.frames - 24;
  const hf = Math.floor((end - 14) / HOPS.length);
  const k = Math.max(0, Math.min(HOPS.length - 1, Math.floor((f - 14) / hf)));
  const t = f < 14 ? 0 : ((f - 14) % hf) / hf;
  const lift = f < 14 || f >= end ? 0 : Math.sin(Math.min(1, t * 2.4) * Math.PI) * 36;
  const strings = ease(f, 14, 10);
  return (
    <>
      <Title>
        Where is the <span style={{ color: C.primary }}>tree</span>?
      </Title>
      <Yard {...Y} oy={880} ex={HOPS[k]} draw={ease(f, 0, 24)} dot={0} eLab={0} tree={ease(f, 8, 10)} lift={lift} ea={strings} ec={strings} ecDash={false} />
      <Text x={540} y={1120} w={900} size={60} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 0, 0.7))}>
        same distance from A and C
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 280, width: 860, background: C.card, borderRadius: 32, padding: '22px 36px', fontSize: 44, fontWeight: 700, lineHeight: 1.38, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Yard: <b style={{ color: C.primary }}>AB = 16</b> m, <b style={{ color: C.blue }}>BC = 8</b> m. Tree E on AB with <b style={{ color: C.violet }}>EA = EC</b>. <b>How far is E from A?</b>
      </div>
      <Yard {...Y} oy={970} ex={E0} dot={1} tree={0} ea={1} ec={1} tick={1}>
        {(g) => <Lab x={g.X(g.ex / 4)} y={g.oy - 20} t="? m" color={AMBER} op={1} />}
      </Yard>
      <div style={{ position: 'absolute', left: 60, top: 1175, width: 860, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {VALS.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 30, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={50} />
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

const Eq: React.FC<{ y: number; start: number; tex: string; size?: number; end?: number }> = ({ y, start, tex, size = 60, end = 1e6 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 8) }}>
      <Tex tex={tex} size={size} />
    </div>
  );
};

const Name: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const swap = at(scene, 2, 0.1);
  const p = ease(f, swap, 10);
  return (
    <>
      <Title>
        Name it <span style={{ color: AMBER }}>x</span>
      </Title>
      <Yard {...Y} oy={840} ex={10} ea={1} ec={1} tick={1} tri={1} rt={1}>
        {(g) => (
          <>
            {eaLab(g, 'x', ease(f, at(scene, 0, 0.3), 10), AMBER)}
            {ecLab(g, 'x', ease(f, at(scene, 0, 0.55), 10), AMBER)}
            {ebLab(g, '16 − x', ease(f, at(scene, 0, 0.85), 10))}
          </>
        )}
      </Yard>
      <Eq y={1090} start={at(scene, 1, 0.5)} tex={'(16 - x)^2 + 8^2 = x^2'} size={64} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1180, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: ease(f, swap, 10) * 0 + ease(f, at(scene, 2, 0.02), 10) }}>
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 1 - p }}>
            <Tex tex={'256 - 32x + \\textcolor{#7b61ff}{x^2} + 64 = \\textcolor{#7b61ff}{x^2}'} size={56} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: p }}>
            <Tex tex={'256 - 32x + \\textcolor{#b4bbc9}{x^2} + 64 = \\textcolor{#b4bbc9}{x^2}'} size={56} />
          </div>
        </div>
      </div>
      <Eq y={1255} start={at(scene, 2, 0.6)} tex={'320 = 32x'} size={64} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.5);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 48px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>
          x = 10 m
        </div>
      </div>
      <Yard {...Y} oy={880} ex={10} tree={1} dot={0} ea={1} ec={1} tick={1} tri={1} rt={1}>
        {(g) => (
          <>
            {eaLab(g, '10', 1, C.green)}
            {ecLab(g, '10', 1, C.green)}
            {ebLab(g, '6', ease(f, at(scene, 1, 0.1), 10))}
          </>
        )}
      </Yard>
      <Eq y={1120} start={at(scene, 1, 0.4)} tex={'6^2 + 8^2 = 10^2'} size={72} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:09" bullets={['Two ways to solve it', 'Every wrong answer explained', 'A bigger yard to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, name: Name, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

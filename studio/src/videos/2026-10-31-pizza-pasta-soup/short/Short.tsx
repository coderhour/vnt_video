import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, FoodBadges, GREEN, Kids, Legend, PAS, PIZ, SLUG, SOUP, TICK, groupsFor } from '../Composition';

export { SLUG };

const CHIME = staticFile(`${SLUG}/sfx/fs-541985.mp3`);
const col = (c: string, t: string) => `{\\color{${c}}${t}}`;

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

// Kid grid, 6 columns x 4 rows, centred on x = 540.
const BIGK = { cell: 130, r: 56, cx: 540 - 2.5 * 130 - 0, cy: 500, fs: 54 } as const;
const SMALLK = { cell: 112, r: 47, cx: 540 - 2.5 * 112, cy: 700, fs: 46 } as const;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const venn = at(scene, 1, 0.25);
  return (
    <>
      <Title>
        Who likes <span style={{ color: C.violet }}>all three</span>?
      </Title>
      <Kids {...BIGK} />
      <div style={{ position: 'absolute', left: 215, top: 1090 }}>
        <FoodBadges x={0} y={0} start={() => 0} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1210, textAlign: 'center', fontSize: 60, fontWeight: 900, whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 1, 0)) }}>
        <span style={{ position: 'relative', display: 'inline-block', color: C.muted }}>
          Venn diagram
          <span style={{ position: 'absolute', left: -8, right: -8, top: '52%', height: 8, borderRadius: 4, background: C.red, transformOrigin: '0 50%', transform: `scaleX(${ease(f, venn, 10)})` }} />
        </span>
        <span style={{ color: C.red, marginLeft: 24, opacity: ease(f, at(scene, 1, 0.55), 10) }}>Count the no's!</span>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        24 kids. <b style={{ color: PIZ }}>20</b> like pizza, <b style={{ color: PAS }}>18</b> like pasta, <b style={{ color: SOUP }}>16</b> like soup. <b>Smallest number who like all three?</b>
      </div>
      <Kids {...SMALLK} />
      <div style={{ position: 'absolute', left: 60, top: 1260, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.55 + i * 0.08)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Noes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  // three groups tagged as line 0 names them (pizza, pasta, soup), then the rest glow green
  const gs = [at(scene, 0, 0.12), at(scene, 0, 0.45), at(scene, 0, 0.75)];
  const tagStart = (k: number) => (k <= 4 ? gs[0] + (k - 1) * 5 : k <= 10 ? gs[1] + (k - 5) * 4 : gs[2] + (k - 11) * 3);
  const glowStart = (k: number) => at(scene, 2, 0.35) + (k - 19) * 4;
  const eq = (tex: string, start: number, end: number) => (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 1115, display: 'flex', justifyContent: 'center', ...fadeUp(f, start), opacity: ease(f, start, 10) * fadeTo(f, end, 0, 10) }}>
      <Tex tex={tex} size={76} />
    </div>
  );
  return (
    <>
      <Title>
        Count the <span style={{ color: C.red }}>no's</span>
      </Title>
      <Kids {...BIGK} groups={groupsFor(tagStart)} glow={{ from: 19, to: 24, start: glowStart }} />
      <Legend
        x={70}
        y={1020}
        wrap={900}
        size={42}
        items={[
          { label: 'no pizza: 4', color: PIZ, start: gs[0] },
          { label: 'no pasta: 6', color: PAS, start: gs[1] },
          { label: 'no soup: 8', color: SOUP, start: gs[2] },
        ]}
      />
      {eq(`${col(PIZ, '4')} + ${col(PAS, '6')} + ${col(SOUP, '8')} = 18`, at(scene, 1, 0.35), at(scene, 2, 0.1))}
      {eq(`24 - 18 = ${col(GREEN, '6')}`, at(scene, 2, 0.25), 1e6)}
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.6);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          Answer: 6 kids
        </div>
      </div>
      <Kids {...BIGK} cy={520} groups={groupsFor(() => -100)} glow={{ from: 19, to: 24, start: () => -100 }} />
      <div style={{ position: 'absolute', left: 60, top: 1050, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ background: i === 2 ? C.green : C.card, color: i === 2 ? '#fff' : C.ink, opacity: i === 2 ? 1 : 0.5, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 52, fontWeight: 800 }}>
            <span style={{ fontSize: 32, opacity: 0.8 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
      <Text x={540} y={1170} w={900} size={52} weight={900} color={C.ink} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Only <span style={{ color: C.red }}>18 no's</span> to hand out
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="5:18" bullets={['Two ways to solve it', 'Every wrong answer explained', 'A four-favorites challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, noes: Noes, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

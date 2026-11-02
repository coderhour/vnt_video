import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, fadeTo, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, BLUE, BLUE_D, CH, CHIME, EC, ER, Floor, SLUG, Silhouette, TICK } from '../Composition';

export { SLUG };

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={80} weight={900} align="center">
        Longer than wide?
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 430, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: BLUE, color: '#fff', borderRadius: 999, padding: '8px 36px', fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 0, 0.1)) }}>40 blue edge tiles</div>
      </div>
      <Silhouette x={140} y={540} w={800} h={520} />
      <Text x={540} y={740} w={760} size={84} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 0, 0.6))}>
        80 white inside
      </Text>
      <Text x={540} y={1110} w={900} size={84} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.2))}>
        Shape = ?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        A rectangular floor of 1-foot tiles: <b style={{ color: BLUE }}>40 blue</b> on the edge, <b>80 white</b> inside. <b>How many feet longer than wide?</b>
      </div>
      <Silhouette x={240} y={720} w={600} h={380} />
      <div style={{ position: 'absolute', left: 60, top: 1150, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 52, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 34 }}>{'ABCDE'[i]}</span>
            {c}
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

const EqRow: React.FC<{ y: number; start: number; tex: string; size?: number; color?: string }> = ({ y, start, tex, size = 64, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Edge: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rowsOn = f >= at(scene, 0, 0.3);
  const colsOn = f >= at(scene, 0, 0.55);
  const cornersOn = f >= at(scene, 0, 0.82);
  const paint = (c: number, r: number) => {
    const corner = (c === 0 || c === EC - 1) && (r === 0 || r === ER - 1);
    if (corner && cornersOn) return C.red;
    if ((r === 0 || r === ER - 1) && rowsOn) return BLUE_D;
    if ((c === 0 || c === EC - 1) && colsOn) return AMBER;
    return undefined;
  };
  const t = (i: number, x: number) => at(scene, i, x);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, whiteSpace: 'nowrap' }}>
        <div style={fadeUp(f, t(0, 0.3))}><Tex tex={'{\\color{#1e40af}2L}'} size={72} /></div>
        <div style={fadeUp(f, t(0, 0.55))}><Tex tex={'+\\,{\\color{#f59f0a}2W}'} size={72} /></div>
        <div style={fadeUp(f, t(0, 0.82))}><Tex tex={'-\\,{\\color{#ef4343}4}'} size={72} /></div>
        <div style={fadeUp(f, t(1, 0))}><Tex tex={'=\\,40'} size={72} /></div>
      </div>
      <EqRow y={410} start={t(1, 0.25)} tex="2L + 2W = 44" />
      <EqRow y={510} start={t(1, 0.7)} tex="L + W = 22" size={84} color={C.green} />
      <EqRow y={620} start={t(2, 0.45)} tex="L \times W = 120" size={84} color={C.violet} />
      <Floor cols={EC} rows={ER} x={316} y={770} cell={64} appear={ease(f, 2, 24)} paint={paint} />
      <Text x={540} y={1110} w={900} size={48} weight={800} color={C.red} align="center" style={{ opacity: ease(f, at(scene, 0, 0.84), 8) * (1 - ease(f, t(1, 0), 8)) }}>
        corners counted twice
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const hit = t(0.82);
  const end = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', opacity: fadeTo(f, hit - 4) }}>
        <Tex tex="L + W = 22,\ \ L \times W = 120" size={60} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 280, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 74, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>12 − 10 = 2 feet</div>
      </div>
      <Floor cols={12} rows={10} x={276} y={560} cell={44} appear={ease(f, t(0.3), 24)} />
      <Text x={540} y={486} w={300} size={56} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, t(0.5), 8) }}>12</Text>
      <Text x={146} y={740} w={100} size={60} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, t(0.58), 8) }}>10</Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1040, display: 'flex', justifyContent: 'center', gap: 24 }}>
        <div style={{ ...fadeUp(f, at(scene, 1, 0.2)), background: BLUE, color: '#fff', borderRadius: 999, padding: '8px 32px', fontSize: 50, fontWeight: 900 }}>40 blue</div>
        <div style={{ ...fadeUp(f, at(scene, 1, 0.55)), background: C.card, color: C.ink, border: `4px solid ${C.line}`, borderRadius: 999, padding: '4px 32px', fontSize: 50, fontWeight: 900 }}>80 white</div>
      </div>
      <Sequence from={end} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={360} start={end} seed={17} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="5:32" bullets={['A list of floors, edge by edge', 'The sum and product trick', 'Every wrong answer tested']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, edge: Edge, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

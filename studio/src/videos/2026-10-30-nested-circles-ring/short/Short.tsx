import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, BLUE, CHIME, DIA, Dot, Fig, GREEN, RS, TICK, TL, VIOLET, foldPt, mkP, SLUG, type Frame } from '../Composition';

export { SLUG };

const CHOICES = ['4\\pi', '8\\pi', '12\\pi', '16\\pi', '24\\pi'];

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fr: Frame = { cx: 490, cy: 790, s: 2.6 };
  return (
    <>
      <Title>
        Area of the <span style={{ color: VIOLET }}>ring</span>?
      </Title>
      <Stage>
        <Fig fr={fr} ring={ease(f, 12, 20)} />
      </Stage>
      <TL p={[490, 1160]} tex="8" size={56} />
      <Text x={540} y={1215} w={900} size={58} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 1, 0.45))}>
        No square roots needed!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number; mark: number }> = ({ start, mark }) => {
  const f = useCurrentFrame();
  const fr: Frame = { cx: 490, cy: 800, s: 1.5 };
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Circle in a <b style={{ color: BLUE }}>square of side 8</b>. Smaller square with <b style={{ color: BLUE }}>corners on the circle</b>, and a circle inside it. <b style={{ color: VIOLET }}>Area of the shaded ring?</b>
      </div>
      <Stage>
        <Fig fr={fr} ring={1} />
      </Stage>
      <TL p={[490, 995]} tex="8" size={50} opacity={mark} />
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={52} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.1)} mark={ease(f, at(scene, 0, 0.3), 10)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} mark={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Fold: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const fr: Frame = { cx: 490, cy: 800, s: 2.6 };
  const P = mkP(fr);
  const dots = (i: number) => ease(f, at(scene, 0, 0.45 + i * 0.1), 10);
  const tris: { c: Pt; a: Pt; b: Pt; col: string }[] = [
    { c: [30, 30], a: [150, 30], b: [30, 150], col: AMBER },
    { c: [270, 30], a: [150, 30], b: [270, 150], col: BLUE },
    { c: [270, 270], a: [270, 150], b: [150, 270], col: VIOLET },
    { c: [30, 270], a: [150, 270], b: [30, 150], col: GREEN },
  ];
  const appear = ease(f, at(scene, 1, 0.0), 10);
  const circ = ease(f, at(scene, 2, 0.5), 20);
  const label = f < at(scene, 1, 0.0) ? 'Corners = side midpoints' : f < at(scene, 2, 0.0) ? 'Fold the corners in' : 'Half the square, half the circle';
  return (
    <>
      <Title>
        <span style={{ color: C.violet }}>Fold</span> it!
      </Title>
      <Stage>
        <Fig
          fr={fr}
          c1={1}
          c2={circ}
          ring={0}
          over={
            <>
              {tris.map((t, i) => {
                const q = ease(f, at(scene, 1, 0.1 + i * 0.17), 24);
                const c = foldPt(t.c, t.a, t.b, q);
                return <Poly key={i} pts={[P(t.a[0], t.a[1]), P(t.b[0], t.b[1]), P(c[0], c[1])]} color={t.col} width={5} fill={t.col} fillOpacity={0.5} opacity={appear} />;
              })}
              {DIA.map((p, i) => (
                <Dot key={i} p={P(p[0], p[1])} r={16} s={dots(i)} />
              ))}
            </>
          }
        />
      </Stage>
      <Text x={540} y={1215} w={920} size={54} weight={900} color={f < at(scene, 2, 0) ? C.amber : C.green} align="center" style={fadeUp(f, 4)}>
        {label}
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.6);
  const chime = at(scene, 1, 0.95);
  const fr: Frame = { cx: 490, cy: 760, s: 1.8 };
  const Row: React.FC<{ y: number; start: number; color: string; label: string; tex: string }> = ({ y, start, color, label, tex }) => (
    <div style={{ position: 'absolute', left: 90, top: y, width: 800, display: 'flex', alignItems: 'center', gap: 30, ...fadeUp(f, start) }}>
      <div style={{ width: 420, fontSize: 50, fontWeight: 900, color }}>{label}</div>
      <Tex tex={tex} size={64} color={color} />
    </div>
  );
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>Ring =</span>
          <Tex tex={'8\\pi'} size={84} color="#fff" />
          <span style={{ fontSize: 54, fontWeight: 900 }}>· B</span>
        </div>
      </div>
      <Stage>
        <Fig fr={fr} ring={1} under={<circle cx={fr.cx} cy={fr.cy} r={RS * fr.s} fill={GREEN} opacity={0.25 * ease(f, at(scene, 0, 0.6), 12)} />} />
      </Stage>
      <Row y={1000} start={at(scene, 0, 0.25)} color={C.ink} label="Big circle" tex={'16\\pi'} />
      <Row y={1085} start={at(scene, 0, 0.7)} color={GREEN} label="Small: half" tex={'8\\pi'} />
      <Row y={1170} start={at(scene, 1, 0.1)} color={VIOLET} label="Ring: the rest" tex={'8\\pi'} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:33" bullets={['Two ways: radii, or fold and turn', 'Every trap explained', 'A deeper nested puzzle']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, fold: Fold, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

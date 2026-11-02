import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Poly, Stage, XMark, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Dot, Lab, Ln, Meds, Outline, SLUG, TICK, add, lerp, mkTri, outAB, outAC } from '../Composition';

export { SLUG };

const T = mkTri([480, 470], [160, 1140], [900, 1140]);
const Q = mkTri([480, 640], [220, 1090], [860, 1090]);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const gOn = ease(f, at(scene, 0, 0.7), 10);
  const ef = ease(f, at(scene, 1, 0.45), 16);
  return (
    <>
      <Title>
        Three <span style={{ color: C.violet }}>medians</span>, one point
      </Title>
      <Stage>
        <Outline g={g} />
        <Meds g={g} am={ease(f, 20, 20)} bl={ease(f, 40, 20)} cp={ease(f, 60, 20)} />
        <Dot p={g.G} opacity={gOn} r={14} />
        <Lab p={add(g.G, 40, 8)} text="G" color={C.amber} opacity={gOn} />
        <Ln a={g.E} b={g.F} color={C.violet} width={10} p={ef} />
        <Lab p={add(g.A, 90, 330)} text="?" size={90} color={C.violet} opacity={ef} />
      </Stage>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  const g = Q;
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '26px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.primary }}>B C = 24</b>. The medians meet at G. <b style={{ color: C.violet }}>E F</b> runs through G, parallel to B C. <b>How long is E F?</b>
      </div>
      <Stage>
        <Outline g={g} />
        <Meds g={g} />
        <Dot p={g.G} r={13} />
        <Lab p={add(g.G, 38, 10)} text="G" color={C.amber} size={46} />
        <Ln a={g.E} b={g.F} color={C.violet} width={9} p={ease(f, 20, 16)} />
        <Lab p={outAB(g, 2 / 3, 50)} text="E" color={C.violet} size={46} opacity={ease(f, 30, 8)} />
        <Lab p={outAC(g, 2 / 3, 50)} text="F" color={C.violet} size={46} opacity={ease(f, 30, 8)} />
        <Lab p={[g.B[0] + (g.C[0] - g.B[0]) / 2, g.B[1] + 52]} text="24" size={50} color={C.primary} opacity={ease(f, 10, 10)} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1215, width: 860, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 50, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.05 + i * 0.15)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const Shrink: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = T;
  const s = interpolate(f, [at(scene, 1, 0.3), at(scene, 1, 0.95)], [1, 2 / 3], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const sc = (p: Pt): Pt => lerp(g.A, p, s);
  const copy = ease(f, at(scene, 1, 0.05), 10);
  const done = ease(f, at(scene, 2, 0.1), 12);
  const frac = ease(f, at(scene, 0, 0.45), 12);
  return (
    <>
      <Title>{f < at(scene, 1) ? <>G is <span style={{ color: C.violet }}>2/3</span> down</> : <>Shrink to <span style={{ color: C.violet }}>2/3</span> size</>}</Title>
      <Stage>
        <Outline g={g} />
        <Meds g={g} />
        <Dot p={g.M} opacity={ease(f, at(scene, 0, 0.2), 10)} r={10} />
        <Lab p={add(g.M, 0, 44)} text="M" size={44} opacity={ease(f, at(scene, 0, 0.2), 10)} />
        {/* the median split: A to G is 2/3, G to M is 1/3 */}
        <Ln a={g.A} b={g.G} color={C.violet} width={12} p={frac} />
        <Ln a={g.G} b={g.M} color={C.amber} width={12} p={ease(f, at(scene, 0, 0.7), 12)} />
        <Lab p={add(lerp(g.A, g.G, 0.5), -64, 0)} text="2/3" color={C.violet} size={50} opacity={frac * (1 - copy)} />
        <Lab p={add(lerp(g.G, g.M, 0.5), 70, 0)} text="1/3" color={C.amber} size={50} opacity={ease(f, at(scene, 0, 0.75), 10) * (1 - copy)} />
        <Dot p={g.G} opacity={1} r={14} />
        <Lab p={add(g.G, 40, -34)} text="G" color={C.amber} size={46} />
        {/* the shrinking copy */}
        {copy > 0 && (
          <g opacity={copy}>
            <Poly pts={[g.A, sc(g.B), sc(g.C)]} color={C.violet} width={9} fill={C.violet} fillOpacity={0.14} />
            <Dot p={sc(g.M)} r={13} color={C.green} />
          </g>
        )}
        <Lab p={outAB(g, 2 / 3, 50)} text="E" color={C.violet} size={46} opacity={done} />
        <Lab p={outAC(g, 2 / 3, 50)} text="F" color={C.violet} size={46} opacity={done} />
      </Stage>
      <Text x={540} y={1190} w={900} size={60} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 2, 0.35))}>
        Every length × 2/3
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const g = Q;
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  const nope = at(scene, 1, 0.1);
  const mid: [Pt, Pt] = [lerp(g.A, g.B, 0.5), lerp(g.A, g.C, 0.5)];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 40px', fontSize: 70, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          E F = 2/3 × 24 = 16
        </div>
      </div>
      <Stage>
        <Outline g={g} />
        <Ln a={g.E} b={g.F} color={C.violet} width={11} />
        <Lab p={add(lerp(g.E, g.F, 0.5), 0, -36)} text="16" color={C.violet} size={56} opacity={ease(f, at(scene, 0, 0.55), 8)} />
        <Lab p={[g.B[0] + (g.C[0] - g.B[0]) / 2, g.B[1] + 52]} text="24" size={50} color={C.primary} />
        <Ln a={mid[0]} b={mid[1]} dashed color={C.red} width={7} p={ease(f, nope, 14)} />
        <Lab p={add(lerp(mid[0], mid[1], 0.5), 0, -40)} text="12?" color={C.red} size={52} opacity={ease(f, nope + 8, 8)} />
        <XMark at={add(lerp(mid[0], mid[1], 0.5), 120, -40)} size={50} opacity={ease(f, nope + 14, 8)} />
        <Dot p={g.G} r={13} />
      </Stage>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={400} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:41" bullets={['Why G is 2/3 down, proved', 'A second way with areas', 'Every trap and a new triangle']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, shrink: Shrink, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

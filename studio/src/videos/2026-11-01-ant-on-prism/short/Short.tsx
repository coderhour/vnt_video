import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type Scene, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { XMark, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { Ant, Arrow, BACK_C, CHIME, FRONT_C, GRN, P, Prism, RED, SLUG, TICK, Vals, antAt, v, type Mv, type VS } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

/** A centred line of maths, fading up at frame `start`. */
const Mid: React.FC<{ y: number; tex: string; start: number; size?: number; box?: string }> = ({ y, tex, start, size = 64, box }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <div style={{ padding: '4px 30px', borderRadius: 20, border: `5px solid ${box ?? 'transparent'}`, whiteSpace: 'nowrap' }}>
        <Tex tex={tex} size={size} />
      </div>
    </div>
  );
};

/** "E is the finish, A is the trap" vertex states, with tags placed clear of the corner letters. */
const EAs = (o: number, tags = true): Record<string, VS> => ({
  E: { fill: o > 0 ? GRN : undefined, tag: tags ? 'finish' : undefined, tagC: GRN, tagO: o, tagOff: [95, 70] },
  A: { fill: o > 0 ? RED : undefined, tag: tags ? 'trap' : undefined, tagC: RED, tagO: o, tagOff: [30, 90] },
});

const HO: Pt = [230, 1090];
const HS = 1.15;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0, 0.12);
  const moves: Mv[] = [{ t: t0, to: 'F', d: 20 }, { t: t0 + 28, to: 'D', d: 20 }, { t: t0 + 56, to: 'A', d: 20 }];
  const ant = antAt(f, HO, 'C', moves, HS);
  const stop = t0 + 76;
  const route = (a: string, b: string, st: number) => {
    const p = ease(f, st, 20);
    if (p <= 0) return null;
    const pa = P(HO, a, HS);
    const pb = P(HO, b, HS);
    return <line key={a + b} x1={pa[0]} y1={pa[1]} x2={pa[0] + (pb[0] - pa[0]) * p} y2={pa[1] + (pb[1] - pa[1]) * p} stroke={C.amber} strokeWidth={14} strokeLinecap="round" />;
  };
  const gone = at(scene, 1, 0);
  return (
    <>
      <Title>
        An ant on a <span style={{ color: C.violet }}>prism</span>
      </Title>
      <Prism O={HO} s={HS} vs={EAs(1)}>
        <g opacity={fadeTo(f, gone, 0, 10)}>
          {route('C', 'F', t0)}
          {route('F', 'D', t0 + 28)}
          {route('D', 'A', t0 + 56)}
          <XMark at={P(HO, 'A', HS)} size={54} opacity={ease(f, stop, 8)} />
        </g>
        <Ant p={f < gone ? ant : P(HO, 'C', HS)} />
      </Prism>
    </>
  );
};

const QO: Pt = [180, 1190];
const QS = 0.85;

const QuestionBody: React.FC<{ start: (i: number) => number; ant: number }> = ({ start, ant }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '22px 36px', fontSize: 46, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        The ant starts at <b>C</b> and crawls along a random edge each second.
        <div style={{ marginTop: 6 }}>
          <Tex tex={'P(\\text{E before A})=\\,?'} size={56} color={C.violet} />
        </div>
      </div>
      <Vals x={150} y={600} start={start} size={46} />
      <Prism O={QO} s={QS} vs={EAs(ease(f, 6, 10))} chipSize={40}>
        <Ant p={P(QO, 'C', QS)} opacity={ant} />
      </Prism>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return <QuestionBody start={(i) => at(scene, 1, 0.25 + i * 0.12)} ant={ease(f, at(scene, 0, 0.1), 10)} />;
};

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} ant={1} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={1060} tick={TICK} />
  </>
);

const SO: Pt = [250, 1235];
const SS = 1.15;

const Spin: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const spinT = t(1, 0.2);
  const theta = Math.PI * ease(f, spinT, 40);
  const tintO = ease(f, t(0, 0.2), 14) * 0.2;
  const ro = ease(f, t(0, 0.55), 12);
  const ring = { ring: C.violet, ringO: ro, ringR: 40 };
  const vs: Record<string, VS> = { E: { fill: GRN, ...ring }, A: { fill: RED, ...ring } };
  const diag = ease(f, t(0, 0.6), 18);
  const diagO = fadeTo(f, t(1, 0), 0, 10);
  const SKC = '#6b7280';
  const A = P(SO, 'A', SS);
  const E = P(SO, 'E', SS);
  const sk = ease(f, t(1, 0.0), 12);
  const skO = fadeTo(f, t(2, 0.0), 0, 12);
  const c1: Pt = [SO[0] + FRONT_C[0] * SS, SO[1] + FRONT_C[1] * SS];
  const c2: Pt = [SO[0] + BACK_C[0] * SS, SO[1] + BACK_C[1] * SS];
  const ext = (a: Pt, b: Pt, d: number): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [b[0] + ((b[0] - a[0]) / l) * d, b[1] + ((b[1] - a[1]) / l) * d];
  };
  const s1 = ext(c2, c1, 90);
  const s2 = ext(c1, c2, 90);
  const pairs: [string, string, string, number][] = [['A', 'E', C.violet, 40], ['B', 'D', C.blue, -40], ['C', 'F', C.amber, 70]];
  const a4 = (i: number) => ease(f, t(2, 0.12 + i * 0.16), 12);
  return (
    <>
      <Title>A half-turn trick</Title>
      <Prism O={SO} s={SS} theta={theta} vs={vs} labels={1} tint={{ verts: ['A', 'B', 'E', 'D'], c: C.primary, o: tintO }}>
        {diag > 0 && diagO > 0 && (
          <line x1={A[0]} y1={A[1]} x2={A[0] + (E[0] - A[0]) * diag} y2={A[1] + (E[1] - A[1]) * diag} stroke={C.violet} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" opacity={diagO} />
        )}
        {sk > 0 && skO > 0 && (
          <g opacity={skO}>
            <line x1={s1[0]} y1={s1[1]} x2={s1[0] + (s2[0] - s1[0]) * sk} y2={s1[1] + (s2[1] - s1[1]) * sk} stroke={SKC} strokeWidth={9} strokeLinecap="round" />
            <circle cx={c1[0]} cy={c1[1]} r={14} fill={SKC} stroke="#fff" strokeWidth={4} />
          </g>
        )}
        {pairs.map(([a, b, col, bend], i) => (
          <Arrow key={a + b} a={P(SO, a, SS)} b={P(SO, b, SS)} color={col} o={a4(i)} both bend={bend} w={7} />
        ))}
      </Prism>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', ...fadeUp(f, t(2, 0.72)) }}>
        <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '6px 34px', fontSize: 50, fontWeight: 900 }}>same prism!</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center', opacity: ease(f, t(3, 0.0), 12) }}>
        <div style={{ background: C.card, border: `5px solid ${C.primary}`, borderRadius: 28, padding: '6px 40px', boxShadow: '0 8px 28px rgba(30,40,80,0.09)' }}>
          <Tex tex={`${v('f')} = 1 - ${v('c')}`} size={76} />
        </div>
      </div>
    </>
  );
};

const RO: Pt = [200, 1265];
const RS = 0.8;

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const hit = t(1, 0.58);
  const chime = t(1, 1) - 4;
  const chipO = ease(f, hit, 8);
  const vs: Record<string, VS> = {
    ...EAs(1, false),
    ...(chipO > 0 ? { C: { chip: '\\dfrac{4}{11}', chipC: GRN, chipO } } : {}),
  };
  return (
    <>
      <Mid y={280} tex={`8${v('c')} = 1 + 3${v('f')}`} start={t(0, 0.05)} size={62} />
      <Mid y={370} tex={`${v('f')} = 1 - ${v('c')}`} start={t(0, 0.35)} size={62} />
      <Mid y={460} tex={`11${v('c')} = 4`} start={t(0, 0.7)} size={70} box={C.primary} />
      {pop(f, hit) > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 575, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: GRN, color: '#fff', borderRadius: 40, padding: '10px 50px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
            <Tex tex={`c = \\dfrac{4}{11}`} size={64} color="#fff" />
          </div>
        </div>
      )}
      <Prism O={RO} s={RS} vs={vs} chipSize={40} />
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={700} start={chime} seed={3} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }: { scene: Scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:58" bullets={['Two ways to solve it', 'Every wrong choice explained', 'A new finish line to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, spin: Spin, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;


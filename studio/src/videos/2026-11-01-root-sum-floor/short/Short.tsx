import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, SLUG, TICK } from '../Composition';

export { SLUG };

const FLOOR = C.primary;
const CEIL = C.violet;
const CHOICES = ['10', '17', '18', '19', '20'];
const SUM = '\\dfrac1{\\sqrt1}+\\dfrac1{\\sqrt2}+\\dfrac1{\\sqrt3}+\\cdots+\\dfrac1{\\sqrt{100}}';

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const TexAt: React.FC<{ y: number; tex: string; size?: number; start: number; color?: string }> = ({ y, tex, size = 64, start, color = C.ink }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', ...s }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const q = ease(f, t(0, 0.5), 12);
  const slash = ease(f, t(1, 0.35), 10);
  return (
    <>
      <Title>
        Add <span style={{ color: FLOOR }}>100</span> square roots!
      </Title>
      <TexAt y={470} tex={SUM} size={56} start={0} />
      <Text x={540} y={640} w={900} size={150} weight={900} color={CEIL} align="center" style={{ opacity: q, transform: `scale(${0.7 + 0.3 * q})` }}>
        = ?
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 900, display: 'flex', justifyContent: 'center', opacity: slash }}>
        <div style={{ background: C.card, borderRadius: 30, padding: '20px 44px', display: 'flex', alignItems: 'center', gap: 24, fontSize: 60, fontWeight: 900, boxShadow: '0 10px 30px rgba(30,40,80,0.1)' }}>
          <svg width={84} height={84} viewBox="0 0 84 84">
            <circle cx={42} cy={42} r={36} fill="none" stroke={C.red} strokeWidth={9} />
            <line x1={17} y1={67} x2={67} y2={17} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
          </svg>
          no calculator
        </div>
      </div>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Add these 100 fractions. What is the <b style={{ color: C.violet }}>greatest whole number</b> at most the sum?
      </div>
      <TexAt y={600} tex={SUM} size={50} start={-100} />
      <div style={{ position: 'absolute', left: 60, top: 860, width: 860, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 58, fontWeight: 800 }}>{c}</span>
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
    <Countdown scene={scene} seconds={3} x={540} y={1050} tick={TICK} />
  </>
);

// ---- nested squares (not to scale for the last one) ----
const NU = 140;
const OX = 130;
const OY = 1250;
const SIDES = [1, 2, 3, 4, 5, 6].map((k) => NU * Math.sqrt(k));
const BIG = 600;
const P = (x: number, y: number): [number, number] => [OX + x, OY - y];
const poly = (pts: [number, number][]) => `M ${pts.map((p) => p.join(' ')).join(' L ')} Z`;
const band = (s0: number, s1: number) => [P(s0, 0), P(s1, 0), P(s1, s1), P(0, s1), P(0, s0), P(s0, s0)];

const NumLine: React.FC<{ y: number; floor: number; ceil: number; dot?: number; dotOp?: number }> = ({ y, floor, ceil, dot = 0, dotOp = 0 }) => {
  const X = (v: number) => 120 + (v - 17) * 266;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      <line x1={X(17)} y1={y} x2={X(20)} y2={y} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      {[17, 18, 19, 20].map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={y - 16} x2={X(v)} y2={y + 16} stroke={C.ink} strokeWidth={7} />
          <text x={X(v)} y={y + 70} textAnchor="middle" fontSize={54} fontWeight={900} fill={C.ink} fontFamily="Nunito, sans-serif">{v}</text>
        </g>
      ))}
      <rect x={X(18)} y={y - 30} width={(X(19) - X(18)) * Math.min(floor, ceil)} height={60} rx={14} fill={C.green} opacity={0.3} />
      <g opacity={floor}>
        <path d={`M ${X(18)} ${y - 40} v -90`} stroke={FLOOR} strokeWidth={9} strokeLinecap="round" />
        <text x={X(18)} y={y - 150} textAnchor="middle" fontSize={50} fontWeight={900} fill={FLOOR} fontFamily="Nunito, sans-serif">floor</text>
      </g>
      <g opacity={ceil}>
        <path d={`M ${X(19)} ${y - 40} v -90`} stroke={CEIL} strokeWidth={9} strokeLinecap="round" />
        <text x={X(19)} y={y - 150} textAnchor="middle" fontSize={50} fontWeight={900} fill={CEIL} fontFamily="Nunito, sans-serif">ceiling</text>
      </g>
      <g opacity={dotOp} transform={`translate(${X(dot)} ${y}) scale(${0.6 + 0.4 * dotOp})`}>
        <circle r={24} fill="#fff" />
        <circle r={16} fill={C.amber} />
      </g>
    </svg>
  );
};

const Squeeze: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const starts = SIDES.map((_, i) => t(0, 0.1 + i * 0.12));
  const bigStart = t(2, 0.3);
  const dots = ease(f, t(2, 0.2), 12);
  const gapHi = ease(f, t(1, 0.1), 12);
  const figOut = 1 - ease(f, t(3, 0), 14);
  const bracket = ease(f, t(2, 0.35), 18);
  const nl = ease(f, t(3, 0.05), 14);
  const sumDone = ease(f, t(2, 0.75), 12);
  const [gx0, gx1] = [SIDES[2], SIDES[3]];
  return (
    <>
      <Title>{f < t(1, 0) ? <>Grow a square</> : f < t(3, 0) ? <>Each term beats <span style={{ color: C.amber }}>2 gaps</span></> : <>Floor and ceiling</>}</Title>
      <div style={{ opacity: figOut }}>
        <Stage>
          {SIDES.map((s, i) => {
            const p = ease(f, starts[i], 14);
            if (p <= 0) return null;
            const hi = i === 3 ? gapHi : 0;
            if (i === 0) return <path key={i} d={poly([P(0, 0), P(s, 0), P(s, s), P(0, s)])} fill={C.blue} fillOpacity={0.14} stroke={C.ink} strokeWidth={5} opacity={p} />;
            return <path key={i} d={poly(band(SIDES[i - 1], s))} fill={hi > 0 ? C.amber : FLOOR} fillOpacity={hi > 0 ? 0.75 : (i % 2 ? 0.55 : 0.22) * p} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" opacity={p} />;
          })}
          {ease(f, bigStart, 18) > 0 && (
            <path d={poly(band(SIDES[5], BIG))} fill={FLOOR} fillOpacity={0.22} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" opacity={ease(f, bigStart, 18)} />
          )}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={P(SIDES[5] + 40 + i * 36, 0)[0]} cy={P(0, SIDES[5] + 40 + i * 36)[1]} r={8} fill={C.ink} opacity={dots} />
          ))}
          <g opacity={gapHi * (1 - dots)} stroke={C.amber} strokeWidth={8} strokeLinecap="round" fill="none">
            <path d={`M ${P(gx0, 0)[0]} ${OY + 26} L ${P(gx1, 0)[0]} ${OY + 26}`} />
          </g>
          <g opacity={bracket} stroke={FLOOR} strokeWidth={8} strokeLinecap="round" fill="none">
            <path d={`M ${OX - 20} ${OY - SIDES[0]} L ${OX - 42} ${OY - SIDES[0]} L ${OX - 42} ${OY - BIG} L ${OX - 20} ${OY - BIG}`} />
          </g>
        </Stage>
        <div style={{ position: 'absolute', left: (P(gx0, 0)[0] + P(gx1, 0)[0]) / 2 - 20, top: OY + 40, opacity: gapHi * (1 - dots) }}>
          <Tex tex="g" size={58} color={C.amber} />
        </div>
        <div style={{ position: 'absolute', left: OX + SIDES[0] / 2 - 18, top: OY - SIDES[0] / 2 - 28, opacity: ease(f, starts[0] + 4, 8) }}>
          <Tex tex="\sqrt1" size={44} />
        </div>
        <div style={{ position: 'absolute', left: OX + BIG + 14, top: OY - BIG - 34, opacity: bracket }}>
          <Tex tex="\sqrt{101}" size={52} color={FLOOR} />
        </div>
      </div>
      {/* equations */}
      <div style={{ opacity: figOut }}>
        {f < t(1, 0.4) ? <TexAt y={440} tex="\text{area }k\to k+1" size={60} start={t(0, 0.3)} /> : f < t(2, 0.3) ? <TexAt y={450} tex="\dfrac1{\sqrt k}>2g" size={64} start={t(1, 0.45)} /> : <TexAt y={420} tex="\text{all gaps}=\sqrt{101}-1" size={56} start={t(2, 0.35)} color={FLOOR} />}
        <div style={{ opacity: sumDone }}>
          <TexAt y={520} tex="\text{sum}>2(10-1)=18" size={56} start={t(2, 0.75)} />
        </div>
      </div>
      <div style={{ opacity: nl }}>
        <TexAt y={450} tex="18<\text{sum}<19" size={72} start={t(3, 0.5)} color={C.green} />
      </div>
      <div style={{ opacity: nl }}>
        <NumLine y={900} floor={ease(f, t(3, 0.0), 10) > 0 ? 1 : 0} ceil={ease(f, t(3, 0.2), 12)} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.64);
  const chime = at(scene, 0, 0.85);
  const dotOp = ease(f, at(scene, 1, 0.1), 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${1.2 * pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>C</span>
          <span style={{ fontSize: 100, fontWeight: 900 }}>18</span>
        </div>
      </div>
      <NumLine y={900} floor={1} ceil={1} dot={18.59} dotOp={dotOp} />
      <TexAt y={480} tex="18<\text{sum}<19" size={68} start={at(scene, 1, 0.05)} color={C.green} />
      <Text x={540} y={1050} w={900} size={52} weight={900} color={C.muted} align="center" style={fadeUp(f, at(scene, 1, 0.15))}>
        the sum is about 18.6
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:02" bullets={['Squares, then algebra', 'Why 19 and 20 are traps', 'A 10,000-term challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, squeeze: Squeeze, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { NUNITO } from '../../../lib/fonts';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { AMBER, CHIME, CHOICES, GREEN, SLUG, TICK, VIOLET, along } from '../Composition';

export { SLUG };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

/** Centred maths line; fades up at `start`, out at `end`. */
const Mid: React.FC<{ y: number; start: number; end?: number; tex: string; size?: number; color?: string }> = ({ y, start, end = Infinity, tex, size = 60, color = C.ink }) => {
  const f = useCurrentFrame();
  const s = fadeUp(f, start);
  const out = end === Infinity ? 1 : 1 - ease(f, end, 10);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', whiteSpace: 'nowrap', ...s, opacity: (s.opacity as number) * out }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const ROWS = [
  ['5^2 + 17 = 42', 5],
  ['7^2 + 17 = 66', 7],
  ['11^2 + 17 = 138', 11],
  ['13^2 + 17 = 186', 13],
] as const;

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        <span style={{ color: C.violet }}>Prime</span>² + 17, then ÷ 12
      </Title>
      {ROWS.map(([tex], i) => (
        <div key={tex} style={{ position: 'absolute', left: 90, top: 450 + i * 130, width: 780, height: 106, boxSizing: 'border-box', background: C.card, borderRadius: 26, boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', ...(i === 0 ? {} : fadeUp(f, at(scene, 0, 0.1 + i * 0.2))) }}>
          <Tex tex={tex} size={58} />
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: AMBER, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, at(scene, 1, 0.1 + i * 0.12))})` }}>?</div>
        </div>
      ))}
      <Text x={540} y={1010} w={900} size={60} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 1, 0.3))}>
        The remainder is ALWAYS the same!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>p</b> is a prime bigger than 3. What's the <b style={{ color: C.primary }}>remainder</b> when p² + 17 is divided by 12?
      </div>
      <Mid y={650} start={0} tex="\dfrac{p^2 + 17}{12} \to \text{remainder?}" size={64} />
      <div style={{ position: 'absolute', left: 60, top: 880, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 28px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={56} />
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

// 7x7 dots -> remove the corner, slide the bottom row to the right side -> 6 rows by 8 columns
const DX0 = 250;
const DY0 = 520;
const SP = 70;
const DR = 24;
const dpos = (c: number, r: number): [number, number] => [DX0 + c * SP, DY0 + r * SP];

const Dots: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const gut = 7.1;
  const dotStart = at(scene, 0, 0.1);
  const cornerRed = at(scene, 1, 0.05);
  const cornerGone = at(scene, 1, 0.2);
  const move0 = at(scene, 1, 0.35);
  const land = move0 + 5 * 5 + 44;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const s = pop(f, dotStart + (r * 7 + c) * 1.2);
      if (s <= 0.01) continue;
      let [x, y] = dpos(c, r);
      let fill: string = C.ink;
      let scale = s;
      if (r === 6 && c === 6) {
        if (f >= cornerRed) fill = C.red;
        scale = s * (1 - ease(f, cornerGone, 10));
      } else if (r === 6) {
        const j = 5 - c;
        const u = ease(f, move0 + j * 5, 44);
        if (f >= at(scene, 1, 0.3)) fill = AMBER;
        if (u > 0) [x, y] = along([dpos(c, 6), dpos(c, gut), dpos(7, gut), dpos(7, j)], u);
      }
      if (scale <= 0.01) continue;
      dots.push(<circle key={`${c}-${r}`} cx={x} cy={y} r={DR * scale} fill={fill} />);
    }
  }
  const lab = (text: string, x: number, y: number, op: number, size: number, color: string) =>
    op > 0 ? (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily={NUNITO} fontWeight={900} fontSize={size} fill={color} opacity={op}>
        {text}
      </text>
    ) : null;
  const eightOn = ease(f, Math.max(land - 4, at(scene, 2, 0.1)), 12);
  const seven = ease(f, at(scene, 0, 0.45), 12) * (1 - eightOn);
  const [tx0] = dpos(0, 0);
  const [tx6] = dpos(6, 0);
  const [tx7] = dpos(7, 0);
  const top = DY0 - 52;
  const brace = (x1: number, x2: number, op: number, color: string) => (
    <path d={`M ${x1} ${top + 10} L ${x1} ${top} L ${x2} ${top} L ${x2} ${top + 10}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
  const lx = DX0 - 52;
  const lbrace = (r2: number, op: number, color: string) => (
    <path d={`M ${lx + 10} ${DY0 - 20} L ${lx} ${DY0 - 20} L ${lx} ${DY0 + r2 * SP + 20} L ${lx + 10} ${DY0 + r2 * SP + 20}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />
  );
  const l3 = at(scene, 3);
  return (
    <>
      <Stage>
        <rect x={DX0 - 34} y={DY0 - 34} width={6 * SP + 68} height={6 * SP + 68} rx={26} fill="none" stroke={VIOLET} strokeWidth={6} opacity={ease(f, at(scene, 0, 0.5), 14) * (1 - ease(f, at(scene, 1, 0.3), 10))} />
        <rect x={DX0 - 34} y={DY0 - 34} width={7 * SP + 68} height={5 * SP + 68} rx={26} fill="rgba(33,196,93,0.08)" stroke={GREEN} strokeWidth={7} opacity={eightOn} />
        {dots}
        {brace(tx0 - 20, tx6 + 20, seven, VIOLET)}
        {lab('7', (tx0 + tx6) / 2, top - 38, seven, 56, VIOLET)}
        {lbrace(6, seven, VIOLET)}
        {lab('7', lx - 40, DY0 + 3 * SP, seven, 56, VIOLET)}
        {brace(tx0 - 20, tx7 + 20, eightOn, GREEN)}
        {lab('8', (tx0 + tx7) / 2, top - 38, eightOn, 56, GREEN)}
        {lbrace(5, eightOn, GREEN)}
        {lab('6', lx - 40, DY0 + 2.5 * SP, eightOn, 56, GREEN)}
      </Stage>
      <Mid y={310} start={at(scene, 0, 0.45)} end={at(scene, 2, 0.1)} tex="7 \times 7 = 49" size={64} />
      <Mid y={310} start={at(scene, 2, 0.2)} end={l3} tex="6 \times 8 = 48" size={64} color={GREEN} />
      <Mid y={1090} start={at(scene, 2, 0.45)} end={l3} tex="6 = 7 - 1 \qquad 8 = 7 + 1" size={56} />
      <Mid y={310} start={at(scene, 3, 0.05)} tex="p^2 - 1 = (p-1)(p+1)" size={60} />
      <Mid y={1030} start={at(scene, 3, 0.3)} tex="(\text{mult. of } 6) \times (\text{even})" size={52} color={VIOLET} />
      <Mid y={1100} start={at(scene, 3, 0.7)} tex="= \text{mult. of } 12" size={56} color={GREEN} />
      <Mid y={1195} start={at(scene, 4, 0.3)} tex="p^2 = 12k + 1" size={60} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.9);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 60, fontWeight: 900 }}>Remainder</span>
          <Tex tex="= 6" size={96} color="#fff" />
        </div>
      </div>
      <Text x={540} y={540} w={900} size={64} weight={900} color={C.green} align="center" style={fadeUp(f, hit)}>
        Choice D
      </Text>
      <Mid y={660} start={at(scene, 0, 0.9)} tex="1 + 17 = 18 = 12 + 6" size={64} />
      <div style={{ position: 'absolute', left: 90, top: 840, width: 780, display: 'flex', justifyContent: 'space-between' }}>
        {ROWS.map(([, p], i) => (
          <div key={p} style={{ ...fadeUp(f, at(scene, 1, 0.1 + i * 0.12)), width: 170, background: C.card, borderRadius: 24, textAlign: 'center', padding: '14px 0', boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>p = {p}</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: C.green }}>6</div>
          </div>
        ))}
      </div>
      <Text x={540} y={1060} w={900} size={50} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.35))}>
        Always 6, for every prime above 3
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:30" bullets={['Test primes, then prove it', 'Every trap explained', 'A new remainder to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, dots: Dots, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

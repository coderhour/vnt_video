import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CHIME, POS, SLUG, TICK } from '../Composition';

export { SLUG };

const AM = '\\color{#f59f0a}';

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

/** A centred line of maths that fades up at frame `start` (start <= 0: on screen from the first frame). */
const Eq: React.FC<{ y: number; tex: string; start: number; size?: number; color?: string; x?: number }> = ({ y, tex, start, size = 64, color = C.ink, x = 540 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x - 500, width: 1000, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...(start > 0 ? fadeUp(f, start) : {}) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const nl = (v: number) => 540 + v * 70;
  const dots = at(scene, 0, 0.7);
  return (
    <>
      <Title>
        Both roots <span style={{ color: C.primary }}>whole numbers</span>?
      </Title>
      <Eq y={430} tex="x^2+bx+12b=0" start={0} size={104} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 590, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 0, 0.12)) }}>
        <div style={{ background: C.amber, color: '#fff', borderRadius: 999, padding: '6px 34px', fontSize: 54, fontWeight: 900 }}>b = −1</div>
      </div>
      <Eq y={690} tex="x^2-x-12=(x-4)(x+3)" start={at(scene, 0, 0.35)} size={64} />
      <Stage>
        <line x1={nl(-5.6)} y1={930} x2={nl(5.6)} y2={930} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {range(11).map((i) => (
          <line key={i} x1={nl(i - 5)} y1={918} x2={nl(i - 5)} y2={942} stroke={C.ink} strokeWidth={4} opacity={0.5} />
        ))}
        {[-3, 4].map((v, i) => (
          <circle key={v} cx={nl(v)} cy={930} r={22 * ease(f, dots + i * 12, 12)} fill={v === 4 ? C.primary : C.violet} />
        ))}
      </Stage>
      {[-3, 4].map((v) => (
        <Text key={v} x={nl(v) - 60} y={962} w={120} size={52} weight={900} align="center" color={v === 4 ? C.primary : C.violet} style={fadeUp(f, dots)}>
          {v < 0 ? `−${-v}` : v}
        </Text>
      ))}
      <Text x={540} y={1090} w={980} size={68} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        How many values of b?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 330, width: 860, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: 52, fontWeight: 700, lineHeight: 1.6, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        For how many <b style={{ color: C.amber }}>integers b</b> are both roots of <Tex tex="x^2+bx+12b=0" size={56} /> <b style={{ color: C.primary }}>integers</b>?
      </div>
      <div style={{ position: 'absolute', left: 60, top: 780, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 56, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 38 }}>{'ABCDE'[i]}</span>
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

const Trick: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = (i: number, t = 0) => at(scene, i, t);
  const GX = 280;
  const GY = 570;
  const S = 190;
  const l1 = a(1);
  const l2 = a(2);
  const cells = [
    { c: 0, r: 0, t: 'rs', col: C.violet },
    { c: 1, r: 0, t: '12s', col: C.primary },
    { c: 0, r: 1, t: '12r', col: C.primary },
    { c: 1, r: 1, t: '144', col: C.amber },
  ];
  return (
    <>
      <Title>{f < l1 ? <>Sum and product</> : <>Add <span style={{ color: C.amber }}>144</span></>}</Title>
      <Eq y={400} tex="rs+12r+12s=0" start={a(0, 0.55)} size={76} />
      <Text x={GX + S / 2} y={GY - 62} w={200} size={46} weight={900} align="center" color={C.primary} style={fadeUp(f, l1 + 6)}>r</Text>
      <Text x={GX + S * 1.5} y={GY - 62} w={200} size={46} weight={900} align="center" style={fadeUp(f, l1 + 8)}>12</Text>
      <Text x={GX - 40} y={GY + S / 2 - 30} w={70} size={46} weight={900} align="center" color={C.violet} style={fadeUp(f, l1 + 10)}>s</Text>
      <Text x={GX - 40} y={GY + S * 1.5 - 30} w={70} size={46} weight={900} align="center" style={fadeUp(f, l1 + 12)}>12</Text>
      <Stage>
        {cells.map((c, i) => (
          <rect key={i} x={GX + c.c * S} y={GY + c.r * S} width={S} height={S} fill={c.col} fillOpacity={0.12 + (i === 3 ? 0.3 * ease(f, l1 + 30, 10) : 0)} stroke={C.ink} strokeWidth={5} opacity={ease(f, l1 + 4 + i * 4, 12)} />
        ))}
        <rect x={GX - 6} y={GY - 6} width={2 * S + 12} height={2 * S + 12} fill="none" stroke={C.green} strokeWidth={10} rx={8} opacity={ease(f, l2 + 40, 12)} />
      </Stage>
      {cells.map((c, i) => (
        <Text key={i} x={GX + c.c * S + S / 2} y={GY + c.r * S + S / 2 - 34} w={S} size={52} weight={900} align="center" color={c.col === C.amber ? '#b87400' : c.col} style={{ opacity: ease(f, l1 + 8 + i * 6, 10) }}>
          {c.t}
        </Text>
      ))}
      <div style={{ position: 'absolute', left: GX + 2 * S + 24, top: GY + S - 34, ...fadeUp(f, l1 + 16) }}>
        <Tex tex="s+12" size={48} />
      </div>
      <div style={{ position: 'absolute', left: GX, top: GY + 2 * S + 8, width: 2 * S, textAlign: 'center', ...fadeUp(f, l1 + 14) }}>
        <Tex tex="r+12" size={48} />
      </div>
      <Eq y={1030} tex={`rs+12r+12s+${AM}144${'\\color{#333333}'}=0+${AM}144`} start={a(1, 0.5)} size={52} />
      <Eq y={1130} tex="(r+12)(s+12)=144" start={a(2, 0.35)} size={76} color={C.green} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 1, 0.4);
  const chime = at(scene, 1, 1);
  const rowT = (i: number) => at(scene, 0, 0.1 + i * 0.05);
  const negT = (i: number) => at(scene, 0, 0.55 + i * 0.05);
  return (
    <>
      <Text x={280} y={300} w={440} size={46} weight={900} color={C.primary} align="center" style={fadeUp(f, rowT(0))}>
        8 positive
      </Text>
      <Text x={720} y={300} w={440} size={46} weight={900} color={C.red} align="center" style={fadeUp(f, negT(0))}>
        8 negative
      </Text>
      {POS.map(([u, v], i) => (
        <div key={i}>
          <div style={{ position: 'absolute', left: 60, width: 440, top: 380 + i * 66, display: 'flex', justifyContent: 'center', ...fadeUp(f, rowT(i), 10) }}>
            <Tex tex={`${u}\\times${v}`} size={50} />
          </div>
          <div style={{ position: 'absolute', left: 500, width: 440, top: 380 + i * 66, display: 'flex', justifyContent: 'center', ...fadeUp(f, negT(i), 10) }}>
            <Tex tex={`(-${u})(-${v})`} size={50} color={C.red} />
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 960, display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 48px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          16 values of b
        </div>
      </div>
      <Text x={540} y={1100} w={900} size={64} weight={900} color={C.violet} align="center" style={fadeUp(f, at(scene, 1, 0.7))}>
        Choice C!
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={1010} start={chime} seed={7} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:15" bullets={['Two ways to solve it', 'Every trap explained', 'A new equation to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, trick: Trick, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

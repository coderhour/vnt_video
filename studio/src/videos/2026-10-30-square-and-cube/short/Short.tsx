import { staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Text } from '../../../lib/ui';
import { CHIME, CHOICES, SLUG, TICK } from '../Composition';
import { AnswerBadge, ChoiceRow, QCard, Title, makeThink } from './kit';

export { SLUG };

const B = (s: string) => `\\textcolor{${C.blue}}{${s}}`;
const A = (s: string) => `\\textcolor{${C.amber}}{${s}}`;

const CubeIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const h = s / 2;
  const w = s * 0.866;
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={`0,${-s} ${w},${-h} 0,0 ${-w},${-h}`} fill={C.violet} opacity={0.55} stroke={C.violet} strokeWidth={4} strokeLinejoin="round" />
      <polygon points={`${-w},${-h} 0,0 0,${s} ${-w},${h}`} fill={C.violet} opacity={0.85} stroke={C.violet} strokeWidth={4} strokeLinejoin="round" />
      <polygon points={`${w},${-h} 0,0 0,${s} ${w},${h}`} fill={C.violet} opacity={0.7} stroke={C.violet} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

const SquareIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g>
    <rect x={x} y={y} width={s} height={s} rx={6} fill={C.primary} opacity={0.22} stroke={C.primary} strokeWidth={5} />
    {[1, 2].map((i) => (
      <g key={i}>
        <line x1={x + (s * i) / 3} y1={y} x2={x + (s * i) / 3} y2={y + s} stroke={C.primary} strokeWidth={3} />
        <line x1={x} y1={y + (s * i) / 3} x2={x + s} y2={y + (s * i) / 3} stroke={C.primary} strokeWidth={3} />
      </g>
    ))}
  </g>
);

const Card: React.FC<{ top: number; start: number; color: string; tex: string; word: string; icon: React.ReactNode }> = ({ top, start, color, tex, word, icon }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top, width: 860, height: 250, background: C.card, borderRadius: 32, boxShadow: '0 8px 30px rgba(30,40,80,0.08)', display: 'flex', alignItems: 'center', gap: 36, padding: '0 50px', ...fadeUp(f, start) }}>
      <div style={{ whiteSpace: 'nowrap' }}><Tex tex={tex} size={88} /></div>
      <div style={{ fontSize: 46, fontWeight: 900, color, flex: 1 }}>is a perfect {word}</div>
      <svg width={170} height={190} viewBox="0 0 170 190">{icon}</svg>
    </div>
  );
};

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Title>
        One number, <span style={{ color: C.violet }}>two jobs</span>
      </Title>
      <Card top={430} start={0} color={C.primary} tex="20\times n" word="SQUARE" icon={<SquareIcon x={10} y={25} s={150} />} />
      <Card top={720} start={0} color={C.violet} tex="50\times n" word="CUBE" icon={<CubeIcon x={85} y={65} s={90} />} />
      <Text x={540} y={1030} w={900} size={92} weight={900} align="center" color={C.red} style={{ transform: `scale(${pop(f, at(scene, 1, 0.1))})` }}>
        n = ?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => (
  <>
    <QCard top={300}>
      Smallest positive <b style={{ color: C.violet }}>n</b> so that <b style={{ color: C.primary }}>20n is a perfect square</b> and <b style={{ color: C.violet }}>50n is a perfect cube</b>?
    </QCard>
    <ChoiceRow items={CHOICES} top={620} start={start} size={56} />
  </>
);

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.1 + i * 0.12)} />;
const Think = makeThink(() => <QCard top={300}>Smallest positive <b style={{ color: C.violet }}>n</b> so that <b style={{ color: C.primary }}>20n is a perfect square</b> and <b style={{ color: C.violet }}>50n is a perfect cube</b>?</QCard>, TICK);

const Chips: React.FC<{ label: string; color: string; vals: number[]; ring: number; start: number; ringAt: number }> = ({ label, color, vals, ring, start, ringAt }) => {
  const f = useCurrentFrame();
  const r = ease(f, ringAt, 10);
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 70, ...fadeUp(f, start) }}>
      <div style={{ width: 170, fontSize: 40, fontWeight: 800, color }}>{label}</div>
      {vals.map((v) => (
        <div key={v} style={{ width: 84, height: 62, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, color: v === ring && r > 0.5 ? '#fff' : C.ink, background: v === ring ? `rgba(33,196,93,${r})` : 'transparent' }}>
          {v}
        </div>
      ))}
      <div style={{ fontSize: 48, fontWeight: 900, color: C.muted }}>…</div>
    </div>
  );
};

const Panel: React.FC<{ top: number; start: number; name: string; color: string; sq: number[]; cu: number[]; ring: number }> = ({ top, start, name, color, sq, cu, ring }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top, width: 860, height: 175, background: C.card, borderRadius: 28, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', padding: '16px 30px', display: 'flex', alignItems: 'center', gap: 20, ...fadeUp(f, start) }}>
      <div style={{ width: 120, height: 120, borderRadius: 60, background: color, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{name}</div>
      <div>
        <Chips label="Square" color={C.primary} vals={sq} ring={ring} start={start + 4} ringAt={start + 24} />
        <Chips label="Cube" color={C.violet} vals={cu} ring={ring} start={start + 8} ringAt={start + 24} />
      </div>
    </div>
  );
};

const Pill2: React.FC<{ top: number; start: number; color: string; children: React.ReactNode }> = ({ top, start, color, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <div style={{ background: color, color: '#fff', borderRadius: 999, padding: '8px 36px', fontSize: 42, fontWeight: 900 }}>{children}</div>
    </div>
  );
};

const Primes: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l2 = at(scene, 2);
  return (
    <>
      <Title size={70}>Count the primes</Title>
      <div style={{ position: 'absolute', left: 90, top: 395, ...fadeUp(f, 4) }}>
        <Tex tex={`20=${B('2')}\\times${B('2')}\\times${A('5')}`} size={62} />
      </div>
      <div style={{ position: 'absolute', left: 90, top: 478, ...fadeUp(f, at(scene, 0, 0.5)) }}>
        <Tex tex={`50=${B('2')}\\times${A('5')}\\times${A('5')}`} size={62} />
      </div>
      <Pill2 top={600} start={at(scene, 1, 0.05)} color={C.primary}>Square: even counts</Pill2>
      <Pill2 top={675} start={at(scene, 1, 0.5)} color={C.violet}>Cube: multiples of 3</Pill2>
      <Panel top={765} start={l2 + 2} name="2s" color={C.blue} sq={[0, 2, 4, 6]} cu={[2, 5, 8, 11]} ring={2} />
      <Panel top={955} start={at(scene, 2, 0.3)} name="5s" color={C.amber} sq={[1, 3, 5]} cu={[1, 4, 7]} ring={1} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1165, display: 'flex', justifyContent: 'center', ...fadeUp(f, at(scene, 2, 0.68)) }}>
        <Tex tex={`n=${B('2')}\\times${B('2')}\\times${A('5')}`} size={86} />
      </div>
    </>
  );
};

const Result: React.FC<{ top: number; start: number; tex: string; word: string; color: string }> = ({ top, start, tex, word, color }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top, width: 860, background: C.card, borderRadius: 28, boxShadow: '0 6px 22px rgba(30,40,80,0.08)', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...fadeUp(f, start) }}>
      <div style={{ whiteSpace: 'nowrap' }}><Tex tex={tex} size={56} /></div>
      <div style={{ fontSize: 40, fontWeight: 900, color, whiteSpace: 'nowrap' }}>✓ {word}</div>
    </div>
  );
};

const Reveal: SceneComponent = ({ scene }) => (
  <>
    <AnswerBadge label="n =" tex="20" hit={at(scene, 0, 0.7)} chime={at(scene, 0, 1)} sfx={CHIME} />
    <Result top={480} start={at(scene, 1, 0.05)} tex="20\times20=400=20^2" word="square" color={C.primary} />
    <Result top={680} start={at(scene, 1, 0.5)} tex="50\times20=1000=10^3" word="cube" color={C.violet} />
    <Text x={540} y={920} w={900} size={64} weight={900} align="center" color={C.violet} style={fadeUp(useCurrentFrame(), at(scene, 1, 0.85))}>
      One number, two jobs!
    </Text>
  </>
);

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:51" bullets={['Two ways to solve it', 'Every trap explained', 'A variant to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, primes: Primes, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

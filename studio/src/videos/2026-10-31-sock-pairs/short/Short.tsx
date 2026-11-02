import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, Drawer, SLUG, Sock, TICK, type Over } from '../Composition';

export { SLUG };

const VSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
    {children}
  </svg>
);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const DX = 141; // drawer: 5 colors, cell 150 -> 798 wide

const Eq: React.FC<{ y: number; start: number; tex: string; size?: number; color?: string }> = ({ y, start, tex, size = 64, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

// hook: the drawer, then four socks (two of them a matching pair) come out
const HOOK_PICKS: [number, number][] = [[0, 0], [0, 1], [2, 1], [4, 0]];
const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const lift = (j: number) => ease(f, at(scene, 0, 0.55 + j * 0.08), 16);
  const over = (c: number, v: number): Over | undefined => {
    const j = HOOK_PICKS.findIndex(([a, b]) => a === c && b === v);
    return j < 0 ? undefined : { to: [250 + j * 190, 930, 0.8], p: lift(j) };
  };
  const ring = ease(f, at(scene, 1, 0.1), 10);
  return (
    <>
      <Title>
        Which sets have a <span style={{ color: C.primary }}>pair</span>?
      </Title>
      <VSvg>
        <Drawer x={DX} y={420} n={5} cell={150} over={over} />
        <g opacity={ring}>
          <ellipse cx={250 + 95} cy={930} rx={150} ry={90} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="14 12" />
        </g>
      </VSvg>
      <Text x={540} y={1060} w={900} size={60} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.2))}>
        Count the misses!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 290, width: 860, background: C.card, borderRadius: 32, padding: '26px 38px', fontSize: 48, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>5 pairs</b> of socks, each a different color. Pull out <b>4 socks</b>: how many sets have <b style={{ color: C.primary }}>at least one matching pair</b>?
      </div>
      <VSvg>
        <Drawer x={DX} y={650} n={5} cell={150} />
      </VSvg>
      <div style={{ position: 'absolute', left: 60, top: 1060, width: 860, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 18px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 30, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <Tex tex={c} size={50} />
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.5 + i * 0.08)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const PX = (i: number) => 210 + i * 220;

const NoPair: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const l0a = at(scene, 0, 0.45);
  const l0b = at(scene, 0, 0.98);
  const leave = f < l0a ? -1 : f >= l0b ? 4 : Math.min(4, Math.floor(((f - l0a) / (l0b - l0a)) * 5));
  const over = (c: number): Over | undefined => (c === leave ? { op: 0.2 } : undefined);
  const row = ease(f, at(scene, 1, 0.02), 12);
  const o0 = at(scene, 1, 0.45);
  const o1 = at(scene, 1, 0.97);
  const cnt = Math.min(15, Math.max(0, Math.floor(((f - o0) / Math.max(1, o1 - o0)) * 16)));
  const chosen = [0, 1, 2, 3];
  return (
    <>
      <Title>
        Count the <span style={{ color: C.red }}>misses</span>
      </Title>
      <VSvg>
        <Drawer x={DX} y={410} n={5} cell={150} over={(c) => over(c)} />
        <g opacity={row}>
          {chosen.map((c, i) => {
            const v = Math.floor(cnt / 2 ** (3 - i)) % 2;
            return (
              <g key={c}>
                <rect x={PX(i) - 40 - 40 + v * 80} y={880} width={80} height={110} rx={16} fill="none" stroke={C.ink} strokeWidth={6} />
                <Sock x={PX(i) - 40} y={935} k={0.7} c={c} v={0} />
                <Sock x={PX(i) + 40} y={935} k={0.7} c={c} v={1} />
              </g>
            );
          })}
        </g>
      </VSvg>
      <Text x={540} y={765} w={900} size={54} weight={900} color={C.violet} align="center" style={{ opacity: ease(f, l0a, 10), whiteSpace: 'nowrap' }}>
        {f >= l0b ? 'leave 1 color out: 5 ways' : 'no pair = 4 different colors'}
      </Text>
      <Eq y={1020} start={at(scene, 1, 0.55)} tex={'2\\times 2\\times 2\\times 2 = 16'} size={72} />
      <Eq y={1140} start={at(scene, 2, 0.45)} tex={'5\\times 16 = 80'} size={84} color={C.red} />
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const full = ease(f, at(scene, 0, 0.1), 14);
  const cut = ease(f, at(scene, 0, 0.5), 12);
  const hit = at(scene, 0, 0.85);
  const chime = at(scene, 0, 1);
  const W = 860;
  const w80 = (W * 80) / 210;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '14px 40px', boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>
          <Tex tex={'210 - 80 = 130'} size={84} color="#fff" />
        </div>
      </div>
      <Text x={540} y={500} w={900} size={52} weight={900} color={C.muted} align="center" style={{ opacity: full }}>
        all 210 sets
      </Text>
      <div style={{ position: 'absolute', left: 110, top: 590, width: W, height: 120, borderRadius: 24, overflow: 'hidden', background: C.blue, opacity: full, display: 'flex' }}>
        <div style={{ width: w80, background: lerpColor(cut), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900, color: '#fff' }}>80</div>
        <div style={{ flex: 1, background: lerpGreen(cut), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: '#fff' }}>{cut > 0.5 ? '130' : ''}</div>
      </div>
      <Text x={110 + w80 / 2} y={730} w={w80} size={44} weight={800} color={C.red} align="center" style={{ opacity: cut }}>no pair</Text>
      <Text x={110 + w80 + (W - w80) / 2} y={730} w={W - w80} size={44} weight={800} color={C.green} align="center" style={{ opacity: cut }}>has a pair</Text>
      <Text x={540} y={880} w={900} size={52} weight={900} color={C.ink} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Count the opposite, then subtract
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={hit} seed={11} />
    </>
  );
};

const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`;
const lerpColor = (t: number) => mix([60, 131, 246], [239, 67, 67], t);
const lerpGreen = (t: number) => mix([60, 131, 246], [33, 196, 93], t);

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:10" bullets={['Two ways to count them', 'Every wrong answer explained', 'A six-pair drawer to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, nopair: NoPair, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;


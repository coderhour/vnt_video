import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { ANN, BOB, CHIME, FC, GOLD, PILE, SLUG, TICK, comb, type Face } from '../Composition';

export { SLUG };

const CHOICES = ['\\dfrac{793}{2048}', '\\dfrac12', '\\dfrac{575}{1024}', '\\dfrac{1255}{2048}', '\\dfrac{1651}{2048}'];
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const Title: React.FC<{ children: React.ReactNode; start?: number }> = ({ children, start = 0 }) => {
  const f = useCurrentFrame();
  return (
    <Text x={540} y={300} w={980} size={76} weight={900} align="center" style={start > 0 ? fadeUp(f, start) : undefined}>
      {children}
    </Text>
  );
};

const FA: Face[] = ['H', 'T', 'H', 'T', 'T'];
const FB: Face[] = ['H', 'H', 'T', 'H', 'T', 'H', 'T'];
const SA: Face[] = ['H', 'H', 'H', 'T', 'T']; // Ann in the aha: 3 heads, 2 tails
const SB: Face[] = ['H', 'T', 'H', 'H', 'T', 'H', 'T'];
const opp = (a: Face): Face => (a === 'H' ? 'T' : 'H');

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  return (
    <>
      <Title>
        Who gets more <span style={{ color: C.primary }}>heads</span>?
      </Title>
      <Stage>
        {FA.map((fc, i) => <FC key={`a${i}`} f={f} x={540 - 200 + i * 100} y={620} r={44} rim={ANN} from="N" to={fc} start={t(0, 0.1 + i * 0.06)} dur={28} spin={2} />)}
        {FB.map((fc, i) => <FC key={`b${i}`} f={f} x={540 - 300 + i * 100} y={840} r={44} rim={BOB} from="N" to={fc} start={t(0, 0.25 + i * 0.06)} dur={28} spin={2} />)}
      </Stage>
      <Text x={90} y={510} w={500} size={54} weight={900} color={ANN} style={fadeUp(f, 2)}>Ann: 5 coins</Text>
      <Text x={90} y={730} w={500} size={54} weight={900} color={BOB} style={fadeUp(f, 2)}>Bob: 7 coins</Text>
      <Text x={540} y={1010} w={900} size={68} weight={900} color={C.violet} align="center" style={fadeUp(f, t(1, 0.1))}>
        How often does Bob win?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: ANN }}>Ann</b> flips <b>5</b> fair coins, <b style={{ color: BOB }}>Bob</b> flips <b>7</b>. Chance that Bob gets <b style={{ color: C.violet }}>MORE heads</b>?
      </div>
      <Stage>
        {range(5).map((i) => <FC key={`a${i}`} f={f} x={330 + i * 80} y={690} r={32} rim={ANN} from="N" />)}
        {range(7).map((i) => <FC key={`b${i}`} f={f} x={330 + i * 80} y={790} r={32} rim={BOB} from="N" />)}
      </Stage>
      <Text x={70} y={660} w={240} size={42} weight={900} color={ANN}>Ann</Text>
      <Text x={70} y={760} w={240} size={42} weight={900} color={BOB}>Bob</Text>
      <div style={{ position: 'absolute', left: 60, top: 900, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 22px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
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

const BARS = range(13);
const Flip: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const flipAt = t(0, 0.55);
  const merge = ease(f, t(2, 0.05), 20);
  const showBars = ease(f, t(2, 0.55), 14);
  // positions: Ann (5) top row, Bob (7) below; merged into one row of 12 at y=600
  const R = lerp(40, 29, merge);
  const annX = (i: number) => lerp(540 - 200 + i * 100, 540 - 11 * 33 + (7 + i) * 66, merge);
  const bobX = (i: number) => lerp(540 - 300 + i * 100, 540 - 11 * 33 + i * 66, merge);
  const annY = lerp(500, 600, merge);
  const bobY = lerp(640, 600, merge);
  const mid = ease(f, t(3, 0.1), 10);
  const sides = ease(f, t(3, 0.4), 12);
  const win = ease(f, t(3, 0.72), 12);
  const BASE = 1250;
  const pitch = 62;
  const x0 = 540 - (13 * pitch) / 2 + 6;
  const col = (k: number) => (k === 6 ? GOLD : k > 6 ? (win > 0.5 ? C.green : PILE) : PILE);
  return (
    <>
      <Title>{f < t(2, 0.3) ? <>Flip <span style={{ color: ANN }}>Ann's</span> coins!</> : <>12 fair coins</>}</Title>
      <Stage>
        {true &&
          SA.map((fc, i) => (
            <FC key={`a${i}`} f={f} x={annX(i)} y={annY} r={R} rim={ANN} from={fc} to={opp(fc)} start={flipAt + i * 3} dur={22} glow={0} />
          ))}
        {SB.map((fc, i) => <FC key={`b${i}`} f={f} x={bobX(i)} y={bobY} r={R} rim={BOB} from={fc} />)}
        <g opacity={showBars}>
          {BARS.map((k) => {
            const h = (comb(12, k) / 924) * 300 * Math.min(1, showBars * 1.2);
            return <rect key={k} x={x0 + k * pitch} y={BASE - h} width={pitch - 10} height={h} rx={6} fill={col(k)} opacity={k < 6 ? 1 - 0.45 * win : 1} />;
          })}
          {BARS.map((k) => (
            <text key={k} x={x0 + k * pitch + (pitch - 10) / 2} y={BASE + 38} textAnchor="middle" fontSize={32} fontWeight={800} fill={C.muted} fontFamily="Nunito, sans-serif">{k}</text>
          ))}
        </g>
      </Stage>
      <Text x={70} y={440} w={300} size={46} weight={900} color={ANN} style={{ ...fadeUp(f, 2), opacity: (1 - merge) * ease(f, 2, 14) }}>Ann</Text>
      <Text x={70} y={585} w={300} size={46} weight={900} color={BOB} style={{ ...fadeUp(f, 2), opacity: (1 - merge) * ease(f, 2, 14) }}>Bob</Text>
      <Text x={540} y={780} w={900} size={50} weight={900} color={C.violet} align="center" style={fadeUp(f, t(0, 0.6))}>
        {f < t(2, 0.2) ? <>tails become <span style={{ color: C.primary }}>heads</span></> : <>Bob wins: <span style={{ color: C.green }}>6 or more heads</span></>}
      </Text>
      <Text x={540} y={655} w={900} size={44} weight={900} color={C.muted} align="center" style={{ opacity: showBars }}>
        number of heads in 12 coins
      </Text>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 860, display: 'flex', justifyContent: 'center', opacity: sides }}>
        <div style={{ background: C.card, borderRadius: 22, padding: '8px 28px', fontSize: 44, fontWeight: 900, color: C.muted, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
          two sides are <span style={{ color: C.ink }}>equal</span> mirror images
        </div>
      </div>
      <Text x={x0 + 6 * pitch - 30} y={BASE + 70} w={150} size={40} weight={900} color={GOLD} align="center" style={{ opacity: mid }}>
        middle
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.64);
  const chime = at(scene, 0, 0.9);
  const bar = ease(f, at(scene, 1, 0.1), 28);
  const pct = 61.3;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${1.3 * pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>D</span>
          <Tex tex="\dfrac{1255}{2048}" size={78} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 90, top: 760, width: 780, fontSize: 56, fontWeight: 900, ...fadeUp(f, at(scene, 1, 0.05)) }}>
        <div style={{ marginBottom: 20 }}>
          Bob wins <span style={{ color: C.green }}>{Math.round(pct * bar)}%</span> of the time
        </div>
        <div style={{ height: 90, borderRadius: 24, background: '#e6e9f0', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${pct * bar}%`, background: C.green, display: 'flex', alignItems: 'center', paddingLeft: 24, color: '#fff', fontSize: 44, whiteSpace: 'nowrap' }}>Bob</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 40, color: C.muted, fontWeight: 800 }}>ties and Ann's wins: the rest</div>
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="7:03" bullets={['Two ways to solve it', 'Every trap explained', 'A 3-vs-5 challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, flip: Flip, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

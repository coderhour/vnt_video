import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, SLUG, TICK } from '../Composition';

export { SLUG };

const COL: Record<string, string> = { '16': C.primary, '11': C.violet, '23': C.amber, '3': '#9aa3b5' };

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

/** A centred line of maths. start <= 0: on screen from the first frame. */
const Mid: React.FC<{ y: number; tex: string; start: number; size?: number; color?: string }> = ({ y, tex, start, size = 56, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...(start > 0 ? fadeUp(f, start) : {}) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const Tile: React.FC<{ v: string; x: number; y: number; o?: number }> = ({ v, x, y, o = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 130, height: 90, borderRadius: 22, background: COL[v], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58, fontWeight: 900, opacity: o, boxShadow: '0 6px 18px rgba(30,40,80,0.18)' }}>
    {v}
  </div>
);

const Box: React.FC<{ x: number; y: number; w: number; h: number; o: number; label: string; size?: number }> = ({ x, y, w, h, o, label, size = 54 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 32, border: `6px solid ${C.ink}`, background: C.card, opacity: o, boxSizing: 'border-box' }}>
    <div style={{ position: 'absolute', left: 0, width: '100%', top: 14, textAlign: 'center', fontSize: size, fontWeight: 900 }}>{label}</div>
  </div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const rows = ['1', '1+2', '1+2+3', '1+2+3+4', '1+2+3+4+5'];
  const sums = [1, 3, 6, 10, 15];
  return (
    <>
      <Title>
        Smallest <span style={{ color: C.violet }}>n</span>?
      </Title>
      <Mid y={400} tex="1+2+3+\cdots+n" start={0} size={92} />
      {rows.map((r, i) => (
        <Mid key={i} y={540 + i * 86} tex={`${r}=${sums[i]}\\ \\ \\textcolor{#ef4343}{\\times}`} start={at(scene, 0, 0.1 + i * 0.16)} size={54} />
      ))}
      <Mid y={1010} tex="\text{a multiple of } 2024\ ?" start={at(scene, 1, 0.25)} size={68} color={C.violet} />
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 360, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 54, fontWeight: 700, lineHeight: 1.55, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        <b style={{ color: C.violet }}>Smallest n</b> so that <Tex tex="1+2+\cdots+n" size={58} /> is a <b>multiple of 2024</b>?
      </div>
      <div style={{ position: 'absolute', left: 60, top: 760, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 30px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 60, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 40 }}>{'ABCDE'[i]}</span>
            {c}
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 0, 0.62 + i * 0.07)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const ROW_Y = 620;
const TX = [260, 460, 660];
const TV = ['16', '11', '23'];
// where each tile ends up: 16 and 11 share the n box, 23 sits in the n+1 box
const DEST: [number, number][] = [[105, 905], [255, 905], [635, 905]];

const Share: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const boxO = ease(f, t(2, 0.1), 12);
  const land = [t(2, 0.5), t(2, 0.65), t(2, 0.8)];
  return (
    <>
      <Title>Share the factors</Title>
      <Mid y={400} tex={'1+2+\\cdots+n=\\dfrac{n(n+1)}{2}'} start={t(0, 0.1)} size={60} />
      <Mid y={540} tex={'n(n+1)\\ \\text{needs}'} start={t(1, 0.1)} size={52} />
      <Box x={90} y={790} w={360} h={250} o={boxO} label="n" size={60} />
      <Box x={500} y={790} w={360} h={250} o={boxO} label="n+1" size={60} />
      {TV.map((v, i) => {
        const st = t(1, 0.45 + i * 0.18);
        const mv = f < land[i] ? 0 : ease(f, land[i], 22);
        const x = interpolate(mv, [0, 1], [TX[i], DEST[i][0]], clamp);
        const y = interpolate(mv, [0, 1], [ROW_Y, DEST[i][1]], clamp);
        return <Tile key={v} v={v} x={x} y={y} o={ease(f, st, 10)} />;
      })}
      <div style={{ position: 'absolute', left: 90, width: 360, top: 1062, display: 'flex', justifyContent: 'center', ...fadeUp(f, t(3, 0.15)) }}>
        <Tex tex={'\\text{multiples of }176'} size={44} />
      </div>
      <div style={{ position: 'absolute', left: 500, width: 360, top: 1062, display: 'flex', justifyContent: 'center', ...fadeUp(f, t(3, 0.15)) }}>
        <Tex tex={'\\text{multiples of }23'} size={44} />
      </div>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, x = 0) => at(scene, i, x);
  const hit = t(1, 0.3);
  const chime = t(1, 1) - 4;
  const chip = (v: string, x: number, y: number, st: number) => (
    <div key={`${v}-${x}`} style={{ position: 'absolute', left: x, top: y, width: 100, height: 76, borderRadius: 20, background: COL[v], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900, ...fadeUp(f, st, 10) }}>
      {v}
    </div>
  );
  return (
    <>
      <Title>Neighbors that fit</Title>
      <Box x={90} y={430} w={360} h={260} o={ease(f, t(0, 0.05), 10)} label="" />
      <Box x={500} y={430} w={360} h={260} o={ease(f, t(0, 0.05), 10)} label="" />
      <Text x={270} y={450} w={360} size={84} weight={900} align="center" style={fadeUp(f, t(0, 0.1))}>528</Text>
      <Text x={680} y={450} w={360} size={84} weight={900} align="center" style={fadeUp(f, t(0, 0.5))}>529</Text>
      {chip('16', 110, 580, t(0, 0.6))}
      {chip('11', 225, 580, t(0, 0.7))}
      {chip('3', 340, 580, t(0, 0.8))}
      {chip('23', 520, 580, t(0, 0.8))}
      {chip('23', 640, 580, t(0, 0.9))}
      {pop(f, hit) > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 780, display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '10px 56px', fontSize: 96, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>n = 528</div>
        </div>
      )}
      <Text x={540} y={960} w={900} size={64} weight={900} color={C.violet} align="center" style={fadeUp(f, t(1, 0.78))}>
        Choice C
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={850} start={chime} seed={9} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:58" bullets={['Two ways to solve it', 'Why 736 is a trap', 'A 2025 puzzle to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, share: Share, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

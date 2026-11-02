import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeTo, fadeUp, pop } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CH, CH_URL, GD, SLUG, TICK_URL, VD } from '../Composition';

export { SLUG };

const VALS = [90, 45, 44, 22, 11, 10, 5, 4, 3];
const OPS = ['h', 'm', 'h', 'h', 'm', 'h', 'm', 'm']; // h = halve, m = minus one
const R = 52;
const X = [100, 290, 480, 670, 860];
const Y1 = 640;
const Y2 = 950;
// node i position: row 1 left to right, then row 2 right to left
const pos = (i: number): [number, number] => (i <= 4 ? [X[i], Y1] : [X[9 - i], Y2]);
const col = (op: string) => (op === 'h' ? VD : GD);
const lab = (op: string) => (op === 'h' ? '÷2' : '−1');

const Calc: React.FC<{ y: number; scale?: number; op?: number }> = ({ y, scale = 1, op = 1 }) => (
  <div style={{ position: 'absolute', left: 140, top: y, width: 800, height: 560, transform: `scale(${scale})`, transformOrigin: 'top center', opacity: op, background: C.card, borderRadius: 48, boxShadow: '0 14px 40px rgba(30,40,80,0.14)' }}>
    <div style={{ position: 'absolute', left: 50, top: 50, width: 700, height: 170, borderRadius: 24, background: C.ink, color: '#fff', fontSize: 130, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px', boxSizing: 'border-box' }}>3</div>
    <div style={{ position: 'absolute', left: 50, top: 270, width: 330, height: 220, borderRadius: 32, background: GD, color: '#fff', fontSize: 110, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+1</div>
    <div style={{ position: 'absolute', left: 420, top: 270, width: 330, height: 220, borderRadius: 32, background: VD, color: '#fff', fontSize: 110, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×2</div>
  </div>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Text x={540} y={300} w={980} size={76} weight={900} align="center">
        Fewest presses?
      </Text>
      <Calc y={430} />
      <Text x={540} y={1040} w={900} size={84} weight={900} color={C.amber} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        Make 90!
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)', boxSizing: 'border-box' }}>
        Screen shows <b>3</b>. One key <b style={{ color: GD }}>adds 1</b>, the other <b style={{ color: VD }}>doubles</b>. <b>Fewest presses to show 90?</b>
      </div>
      <Calc y={640} scale={0.62} />
      <div style={{ position: 'absolute', left: 60, top: 1050, width: 860, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {CH.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '8px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 50, fontWeight: 800 }}>
            <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
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
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK_URL} />
  </>
);

/** The backwards chain 90 → … → 3. node(i) = when node i pops, edge(i) = when arrow i starts; `n` = how many arrows are shown. */
const Chain: React.FC<{ node: (i: number) => number; hi?: (i: number) => number; badge?: (i: number) => number }> = ({ node, hi = () => 0, badge }) => {
  const f = useCurrentFrame();
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {OPS.map((op, i) => {
          const [x1, y1] = pos(i);
          const [x2, y2] = pos(i + 1);
          const p = ease(f, node(i + 1) - 8, 10);
          if (p <= 0) return null;
          const dx = Math.sign(x2 - x1);
          const dy = Math.sign(y2 - y1);
          const a: [number, number] = [x1 + dx * (R + 6), y1 + dy * (R + 6)];
          const b: [number, number] = [x2 - dx * (R + 8), y2 - dy * (R + 8)];
          const tip: [number, number] = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
          const color = hi(i) > 0.5 ? C.amber : col(op);
          const w = hi(i) > 0.5 ? 14 : 9;
          const head = `M ${tip[0] - dx * 26 - dy * 22} ${tip[1] - dy * 26 + dx * 22} L ${tip[0]} ${tip[1]} L ${tip[0] - dx * 26 + dy * 22} ${tip[1] - dy * 26 - dx * 22}`;
          return (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
              {p > 0.8 && <path d={head} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          );
        })}
      </svg>
      {OPS.map((op, i) => {
        const [x1, y1] = pos(i);
        const [x2, y2] = pos(i + 1);
        const o = ease(f, node(i + 1), 8);
        const vertical = x1 === x2;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: vertical ? mx - 140 : mx - 45, top: vertical ? my - 28 : my - 78, width: vertical ? 100 : 90, textAlign: vertical ? 'right' : 'center', fontSize: 44, fontWeight: 900, color: col(op), opacity: o }}>{lab(op)}</div>
            {badge && (
              <div style={{ position: 'absolute', left: (vertical ? mx - 88 : mx) - 28, top: (vertical ? my + 20 : my + 20) - (vertical ? 0 : 0), width: 56, height: 56, borderRadius: '50%', background: C.amber, color: '#fff', fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, badge(i))})`, opacity: Math.min(1, pop(f, badge(i)) * 2) }}>{i + 1}</div>
            )}
          </div>
        );
      })}
      {VALS.map((v, i) => {
        const [x, y] = pos(i);
        const s = pop(f, node(i));
        return (
          <div key={i} style={{ position: 'absolute', left: x - R, top: y - R, width: 2 * R, height: 2 * R, borderRadius: '50%', background: i === 0 ? C.amber : i === 8 ? C.green : C.card, border: `6px solid ${i === 0 ? C.amber : i === 8 ? C.green : C.line}`, boxSizing: 'border-box', color: i === 0 || i === 8 ? '#fff' : C.ink, fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, opacity: Math.min(1, s * 2) }}>
            {v}
          </div>
        );
      })}
    </>
  );
};

const Back: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = [0.05, 0.2, 0.38, 0.55, 0.74, 0.8, 0.87, 0.93];
  const node = (i: number) => (i === 0 ? at(scene, 0, 0.92) : at(scene, 2, t[i - 1]));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 300, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', ...fadeUp(f, at(scene, 0, 0.35)) }}>
        <Tex tex={'{\\color{#5b43e0}\\times 2 \\to \\div 2}\\qquad {\\color{#139a4a}+1 \\to -1}'} size={60} />
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 410, display: 'flex', justifyContent: 'center', gap: 22 }}>
        <div style={{ ...fadeUp(f, at(scene, 1, 0.1)), background: VD, color: '#fff', borderRadius: 999, padding: '6px 30px', fontSize: 46, fontWeight: 900, whiteSpace: 'nowrap' }}>even: halve</div>
        <div style={{ ...fadeUp(f, at(scene, 1, 0.5)), background: GD, color: '#fff', borderRadius: 999, padding: '6px 30px', fontSize: 46, fontWeight: 900, whiteSpace: 'nowrap' }}>odd: −1 first</div>
      </div>
      <Chain node={node} />
      <Text x={540} y={1090} w={900} size={60} weight={900} color={C.green} align="center" style={fadeUp(f, at(scene, 2, 0.97))}>
        Back at 3!
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (x: number) => at(scene, 0, x);
  const badge = (i: number) => t(0.02 + i * 0.075);
  const hit = t(0.78);
  const end = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '16px 48px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)', whiteSpace: 'nowrap' }}>8 presses</div>
      </div>
      <Text x={540} y={420} w={900} size={52} weight={900} color={C.muted} align="center" style={{ opacity: ease(f, badge(0), 8) * (1 - ease(f, hit, 8)) }}>
        count the arrows
      </Text>
      <Chain node={() => -100} hi={(i) => (f >= badge(i) && f < badge(i) + 10 ? 1 : 0)} badge={badge} />
      <Text x={540} y={1090} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.25))}>
        9 numbers ✗ · 8 arrows ✓
      </Text>
      <Sequence from={end} durationInFrames={60} layout="none">
        <Audio src={CH_URL} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={350} start={end} seed={19} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:26" bullets={['Work backwards, step by step', 'Proof that nothing is shorter', 'Every trap, plus aim for 100']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, back: Back, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

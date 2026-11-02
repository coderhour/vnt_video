import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Stage, type Pt } from '../../../lib/grid';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { BASE, CHIME, D_IN, D_SLANT, Grid, Label, SLUG, TICK, classify, plane, type DotSpec } from '../Composition';

export { SLUG };

const CHOICES = ['5', '6', '10', '11', '12'];
const AMBER = C.amber;

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={76} weight={900} align="center">
    {children}
  </Text>
);

const TexAt: React.FC<{ x?: number; y: number; tex: string; size?: number; start: number; color?: string }> = ({ x = 0, y, tex, size = 60, start, color = C.ink }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, width: 1080 - 2 * x, top: y, display: 'flex', justifyContent: 'center', ...fadeUp(f, start) }}>
      <Tex tex={tex} size={size} color={color} />
    </div>
  );
};

const line = (m: (p: Pt) => Pt, pts: Pt[], color: string, w = 8, op = 1, dash?: string) => (
  <path d={`M ${pts.map((p) => m(p).join(' ')).join(' L ')} Z`} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeDasharray={dash} opacity={op} />
);

// ---- hook: the 5-6 triangle, ten dots counted ----
const HP = 5;
const HQ = 6;
const hm = plane(120, 1240, 95);
const hookDots = (() => {
  const a: [number, number][] = [];
  for (let y = HQ; y >= 1; y--) for (let x = 1; x < HP; x++) if (classify(HP, HQ, x, y) === 'in') a.push([x, y]);
  return a;
})();

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const countStart = t(0, 0.35);
  const cnt = (i: number) => countStart + i * 6;
  const shown = hookDots.filter((_, i) => f >= cnt(i)).length;
  return (
    <>
      <Title>
        Exactly <span style={{ color: C.primary }}>10 dots</span> inside!
      </Title>
      <Stage>
        {line(hm, [[0, 0], [HP, 0], [0, HQ]], C.ink, 9)}
        <Grid
          cols={HP}
          rows={HQ}
          m={hm}
          spec={(x, y): DotSpec => {
            const k = classify(HP, HQ, x, y) === 'in' ? hookDots.findIndex((d) => d[0] === x && d[1] === y) : -1;
            return k >= 0 && f >= cnt(k) ? { ...D_IN, r: 20 } : { ...BASE_DOT };
          }}
        />
      </Stage>
      <div style={{ position: 'absolute', left: 700, top: 560, fontSize: 170, fontWeight: 900, color: C.primary, opacity: shown > 0 ? 1 : 0 }}>{shown}</div>
      <Text x={640} y={800} w={290} size={52} weight={900} color={C.violet} style={fadeUp(f, t(1, 0.1))}>
        How many triangles can do this?
      </Text>
    </>
  );
};
const BASE_DOT: DotSpec = { fill: BASE, r: 9 };

const QP = 5;
const QQ = 6;
const qm = plane(330, 1130, 58);

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 48, fontWeight: 700, lineHeight: 1.35, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        Corners <b>(0, 0)</b>, <b style={{ color: C.primary }}>(p, 0)</b>, <b style={{ color: C.violet }}>(0, q)</b>. Exactly <b>10</b> whole-number points <b>strictly inside</b>. How many ordered pairs <b>(p, q)</b>?
      </div>
      <Stage>
        {line(qm, [[0, 0], [QP, 0], [0, QQ]], C.ink, 7)}
        <Grid cols={QP} rows={QQ} m={qm} spec={(x, y) => (classify(QP, QQ, x, y) === 'in' ? { ...D_IN, r: 12 } : { fill: BASE, r: 7 })} />
        <Label p={[qm([QP, 0])[0], qm([0, 0])[1] + 50]} text="p" color={C.primary} size={54} />
        <Label p={[qm([0, 0])[0] - 46, qm([0, QQ / 2])[1]]} text="q" color={C.violet} size={54} />
      </Stage>
      <div style={{ position: 'absolute', left: 60, top: 1200, width: 860, display: 'flex', justifyContent: 'center', gap: 20 }}>
        {CHOICES.map((c, i) => (
          <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: C.muted, fontSize: 32, fontWeight: 800 }}>{'ABCDE'[i]}</span>
            <span style={{ fontSize: 54, fontWeight: 800 }}>{c}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 1, 0.3 + i * 0.1)} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={820} tick={TICK} />
  </>
);

// ---- aha: twin triangle makes a rectangle (6 x 4) ----
const RP = 6;
const RQ = 4;
const rm = plane(150, 1170, 120);
const slant = (x: number, y: number) => classify(RP, RQ, x, y) === 'slant';
const twin = (x: number, y: number) => x > 0 && y > 0 && x < RP && y < RQ && RQ * x + RP * y > RP * RQ;

const Rect: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t = (i: number, p = 0) => at(scene, i, p);
  const twinOp = ease(f, t(0, 0.35), 18);
  const rectP = ease(f, t(0, 0.5), 14);
  const inRect = ease(f, t(1, 0.2), 12);
  const slantP = ease(f, t(1, 0.6), 12);
  const split = ease(f, t(2, 0.15), 14);
  const rule = ease(f, t(3, 0.15), 14);
  const count = f < t(2, 0) ? (f >= t(1, 0.25) ? 15 : 0) : 14;
  return (
    <>
      <Title>{f < t(1, 0) ? <>Make a <span style={{ color: AMBER }}>rectangle</span></> : <>Count the dots</>}</Title>
      <Stage>
        <path d={`M ${[rm([0, 0]), rm([RP, 0]), rm([RP, RQ]), rm([0, RQ])].map((p) => p.join(' ')).join(' L ')} Z`} fill={AMBER} fillOpacity={0.12 * twinOp} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" opacity={rectP} />
        {line(rm, [[0, 0], [RP, 0], [0, RQ]], C.primary, 9)}
        <line x1={rm([RP, 0])[0]} y1={rm([RP, 0])[1]} x2={rm([0, RQ])[0]} y2={rm([0, RQ])[1]} stroke={C.violet} strokeWidth={8} strokeDasharray="14 12" opacity={twinOp} />
        <Grid
          cols={RP}
          rows={RQ}
          m={rm}
          spec={(x, y): DotSpec => {
            const interior = x > 0 && y > 0 && x < RP && y < RQ;
            if (!interior) return { fill: BASE, r: 9 };
            if (slant(x, y)) return f >= t(1, 0.6) ? { ...D_SLANT, r: 20, ring: C.violetSoft } : { ...D_IN, r: 15, fill: C.green };
            if (f >= t(2, 0.2)) return twin(x, y) ? { fill: AMBER, r: 16 } : { ...D_IN, r: 16 };
            return { fill: C.green, r: 15, opacity: inRect > 0.5 ? 1 : 0.35 };
          }}
        />
      </Stage>
      <Text x={540} y={470} w={900} size={96} weight={900} color={C.green} align="center" style={{ opacity: count > 0 ? 1 : 0 }}>
        {count} dots
      </Text>
      <Text x={540} y={590} w={900} size={48} weight={900} color={C.violet} align="center" style={{ opacity: slantP * (1 - split) }}>
        one is ON the slanted line
      </Text>
      <Text x={540} y={590} w={900} size={52} weight={900} align="center" style={{ opacity: split }}>
        <span style={{ color: C.primary }}>7</span> + <span style={{ color: AMBER }}>7</span> split evenly
      </Text>
      <div style={{ opacity: rule }}>
        <TexAt y={1230} tex="\text{rectangle}=2\cdot10+\text{slant dots}" size={52} start={t(3, 0.15)} />
      </div>
    </>
  );
};

// ---- reveal: the 11 ordered pairs ----
const PAIRS: [number, number][] = [[2, 21], [2, 22], [3, 11], [3, 12], [5, 6], [6, 6]];

const PairChip: React.FC<{ x: number; y: number; a: number; b: number; start: number; color: string; dim?: boolean }> = ({ x, y, a, b, start, color, dim }) => {
  const f = useCurrentFrame();
  const s = pop(f, start, 30);
  if (s <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 300, display: 'flex', justifyContent: 'center', opacity: Math.min(1, s) * (dim ? 0.9 : 1), transform: `scale(${0.6 + 0.4 * s})` }}>
      <div style={{ background: C.card, border: `5px solid ${color}`, borderRadius: 18, padding: '4px 26px', boxShadow: '0 4px 14px rgba(30,40,80,0.08)' }}>
        <Tex tex={`(${a},\\,${b})`} size={52} color={color} />
      </div>
    </div>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.63);
  const chime = at(scene, 0, 0.9);
  const rowY = (i: number) => 520 + i * 92;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${1.1 * pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 48px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 56, fontWeight: 900 }}>D</span>
          <span style={{ fontSize: 100, fontWeight: 900 }}>11</span>
        </div>
      </div>
      <Text x={90} y={455} w={300} size={40} weight={900} color={C.primary} align="center" style={fadeUp(f, at(scene, 0, 0.05))}>p ≤ q</Text>
      <Text x={540} y={455} w={400} size={40} weight={900} color={AMBER} align="center" style={fadeUp(f, at(scene, 1, 0.05))}>flipped</Text>
      {PAIRS.map(([a, b], i) => (
        <PairChip key={i} x={90} y={rowY(i)} a={a} b={b} start={at(scene, 0, 0.05) + i * 6} color={C.primary} />
      ))}
      {PAIRS.slice(0, 5).map(([a, b], i) => (
        <PairChip key={`f${i}`} x={440} y={rowY(i)} a={b} b={a} start={at(scene, 1, 0.1) + i * 5} color={AMBER} />
      ))}
      <Text x={450} y={rowY(5) + 6} w={440} size={44} weight={900} color={C.red} style={fadeUp(f, at(scene, 1, 0.45))}>
        flips to itself!
      </Text>
      <Text x={540} y={1100} w={900} size={64} weight={900} align="center" style={fadeUp(f, at(scene, 1, 0.7))}>
        5 + 5 + 1 = <span style={{ color: C.green }}>11</span>
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={380} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:59" bullets={['Every case checked', 'Pick\'s theorem shortcut', 'A six-dot challenge']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, rect: Rect, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 10-style" /> : null;

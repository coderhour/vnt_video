import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop, range } from '../../../lib/anim';
import { at, type SceneComponent, type Timeline } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard, ShortFrame } from '../../../lib/Short';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';
import { CHIME, CHOICES, FAILS, NEW, RUN, SLUG, TICK } from '../Composition';

export { SLUG };

const BX = 70;
const BY = 450;
const P = 85;
const CELL = 76;
const LENS = [2, 3, 4, 5, 7, 8];

/** Run length that first lights each number (undefined for the six that never light). */
const lenOf = (n: number) => LENS.find((l) => NEW[l].includes(n));

const Board: React.FC<{ litAt: (n: number) => number; fail?: number; mark?: Record<number, string> }> = ({ litAt, fail = 0, mark = {} }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    {range(50).map((i) => {
      const n = i + 1;
      const col = i % 10;
      const row = Math.floor(i / 10);
      const L = lenOf(n);
      const lit = L ? litAt(n) : 0;
      const isFail = FAILS.includes(n);
      const bad = isFail ? fail : 0;
      const color = L ? RUN[L] : C.red;
      const m = mark[n];
      return (
        <div
          key={n}
          style={{
            position: 'absolute', left: BX + col * P, top: BY + row * P, width: CELL, height: CELL, borderRadius: 14,
            background: lit > 0 ? color : bad > 0 ? 'rgba(239,67,67,0.18)' : m ?? C.card,
            border: `4px solid ${lit > 0 ? color : bad > 0 ? C.red : C.line}`,
            color: lit > 0 ? '#fff' : bad > 0 ? C.red : C.muted,
            fontSize: 38, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${1 + 0.18 * Math.max(Math.min(lit, 1 - lit) * 2, 0) + 0.12 * bad})`,
          }}
        >
          {n}
        </div>
      );
    })}
  </div>
);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text x={540} y={300} w={980} size={72} weight={900} align="center">
    {children}
  </Text>
);

const Hook: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const a = at(scene, 0, 0.2);
  const b = at(scene, 0, 0.62);
  return (
    <>
      <Title>
        Sums of <span style={{ color: C.violet }}>neighbours</span>
      </Title>
      <Board litAt={() => 0} mark={{ 9: C.primarySoft, 10: C.violetSoft }} />
      <Text x={540} y={930} w={900} size={96} weight={900} color={C.primary} align="center" style={fadeUp(f, a)}>
        9 = 4 + 5
      </Text>
      <Text x={540} y={1060} w={900} size={80} weight={900} color={C.violet} align="center" style={fadeUp(f, b)}>
        10 = 1 + 2 + 3 + 4
      </Text>
      <Text x={540} y={1190} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.5))}>
        Which can never be built?
      </Text>
    </>
  );
};

const QuestionBody: React.FC<{ start: (i: number) => number }> = ({ start }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 60, top: 300, width: 860, background: C.card, borderRadius: 32, padding: '28px 40px', fontSize: 50, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>
        How many numbers from <b style={{ color: C.primary }}>1 to 50</b> are a <b style={{ color: C.violet }}>sum of 2 or more consecutive numbers</b>?
      </div>
      <div style={{ position: 'absolute', left: 60, top: 640, width: 860, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ ...fadeUp(f, 20), fontSize: 64, fontWeight: 900, color: C.primary }}>9 = 4 + 5</div>
        <div style={{ ...fadeUp(f, 34), fontSize: 64, fontWeight: 900, color: C.violet }}>10 = 1 + 2 + 3 + 4</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 30 }}>
          {CHOICES.map((c, i) => (
            <div key={c} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '6px 20px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 50, fontWeight: 800 }}>
              <span style={{ color: C.muted, fontSize: 32 }}>{'ABCDE'[i]}</span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const Question: SceneComponent = ({ scene }) => <QuestionBody start={(i) => at(scene, 0, 0.6) + i * 8} />;

const Think: SceneComponent = ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <QuestionBody start={() => -100} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={TICK} />
  </>
);

const BoardScene: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const t0 = at(scene, 0, 0.5);
  const t1 = at(scene, 2, 0);
  const per = (t1 - t0) / LENS.length;
  const stage = f < t0 ? -1 : Math.min(LENS.length - 1, Math.floor((f - t0) / per));
  const litAt = (n: number) => {
    const L = lenOf(n)!;
    const j = LENS.indexOf(L);
    return ease(f, t0 + j * per + (NEW[L].indexOf(n) % 8) * 2, 8);
  };
  const failOn = ease(f, at(scene, 2, 0.4), 10);
  const chips = ease(f, at(scene, 3, 0.1), 12);
  return (
    <>
      <Title>{f < at(scene, 2) ? <>Light up every <span style={{ color: C.primary }}>sum</span></> : <>Six cells stay <span style={{ color: C.red }}>dark</span></>}</Title>
      <Board litAt={litAt} fail={failOn} />
      {stage >= 0 && f < at(scene, 2) && (
        <div key={stage} style={{ position: 'absolute', left: 0, width: 1080, top: 940, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: RUN[LENS[stage]], color: '#fff', borderRadius: 999, padding: '10px 40px', fontSize: 56, fontWeight: 900, ...fadeUp(f, t0 + stage * per, 8) }}>runs of {LENS[stage]}</div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 90, top: 940, display: 'flex', gap: 16, opacity: chips }}>
        {FAILS.map((n) => (
          <div key={n} style={{ width: 118, textAlign: 'center', background: 'rgba(239,67,67,0.16)', border: `4px solid ${C.red}`, borderRadius: 16, padding: '8px 0', fontSize: 52, fontWeight: 900, color: C.red }}>
            {n}
          </div>
        ))}
      </div>
      <Text x={540} y={1090} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 3, 0.2))}>
        powers of 2!
      </Text>
    </>
  );
};

const Reveal: SceneComponent = ({ scene }) => {
  const f = useCurrentFrame();
  const hit = at(scene, 0, 0.8);
  const chime = at(scene, 0, 1);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 285, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '12px 44px', fontSize: 80, fontWeight: 900, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          50 − 6 = 44
        </div>
      </div>
      <Board litAt={() => 1} fail={1} />
      <Text x={540} y={940} w={900} size={64} weight={900} color={C.red} align="center" style={fadeUp(f, at(scene, 1, 0.1))}>
        1 2 4 8 16 32: powers of 2
      </Text>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={CHIME} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={400} start={chime} seed={5} />
    </>
  );
};

const Cta: SceneComponent = ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${SLUG}/short/full.jpg`)} length="6:54" bullets={['Why only powers of two fail', 'Every trap explained', 'A 1 to 100 board to try']} />
);

const SCENES: Record<string, SceneComponent> = { hook: Hook, question: Question, think: Think, board: BoardScene, reveal: Reveal, cta: Cta };

export const Short: React.FC<{ timeline: Timeline | null }> = ({ timeline }) =>
  timeline ? <ShortFrame timeline={timeline} scenes={SCENES} badge="AMC 8-style" /> : null;

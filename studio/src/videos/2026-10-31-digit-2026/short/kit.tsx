import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp, pop } from '../../../lib/anim';
import type { SceneComponent } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { FullLessonCard } from '../../../lib/Short';
import { Tex } from '../../../lib/Tex';
import { Confetti, Text } from '../../../lib/ui';
import { C } from '../../../lib/theme';

// Shared bits for the vertical shorts of the 2026-10-31 batch (not a Short.tsx, so Root ignores it).

export const Title: React.FC<{ children: React.ReactNode; start?: number; size?: number }> = ({ children, start = 0, size = 76 }) => {
  const f = useCurrentFrame();
  return (
    <Text x={540} y={290} w={980} size={size} weight={900} align="center" style={start > 0 ? fadeUp(f, start) : undefined}>
      {children}
    </Text>
  );
};

export const QCard: React.FC<{ children: React.ReactNode; top?: number; size?: number }> = ({ children, top = 300, size = 50 }) => (
  <div style={{ position: 'absolute', left: 60, top, width: 860, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: size, fontWeight: 700, lineHeight: 1.38, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>{children}</div>
);

/** Answer choices as chips (tex strings), wrapping to rows. */
export const ChoiceRow: React.FC<{ choices: string[]; start: (i: number) => number; top: number; size?: number; plain?: boolean }> = ({ choices, start, top, size = 48, plain }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
      {choices.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
          {plain ? <span style={{ fontSize: size, fontWeight: 800 }}>{c}</span> : <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={size} />}
        </div>
      ))}
    </div>
  );
};

/** "Pause and try it" scene over a dimmed copy of the question body. */
export const makeThink = (Body: React.FC, tick: string): SceneComponent => ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <Body />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={900} tick={tick} />
  </>
);

/** Green answer badge that pops at `hit`, chime at `chime`, confetti. */
export const AnswerBadge: React.FC<{ hit: number; chime: number; sfx: string; label: string; tex?: string; text?: string; y?: number }> = ({ hit, chime, sfx, label, tex, text, y = 290 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>{label}</span>
          {tex ? <Tex tex={tex} size={84} color="#fff" /> : <span style={{ fontSize: 84, fontWeight: 900 }}>{text}</span>}
        </div>
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={sfx} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={y + 90} start={chime} seed={5} />
    </>
  );
};

export const makeCta = (slug: string, length: string, bullets: string[]): SceneComponent => ({ scene }) => (
  <FullLessonCard scene={scene} poster={staticFile(`${slug}/short/full.jpg`)} length={length} bullets={bullets} />
);

export { ease };

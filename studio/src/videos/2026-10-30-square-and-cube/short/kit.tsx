import { Audio, Sequence, useCurrentFrame } from 'remotion';
import { fadeUp, pop } from '../../../lib/anim';
import type { Scene, SceneComponent } from '../../../lib/Explainer';
import { Countdown } from '../../../lib/PauseCard';
import { Tex } from '../../../lib/Tex';
import { C } from '../../../lib/theme';
import { Confetti, Text } from '../../../lib/ui';

// Small shared pieces for the 2026-10-30 batch of shorts (1080×1920).

export const Title: React.FC<{ children: React.ReactNode; start?: number; y?: number; size?: number }> = ({ children, start = 0, y = 300, size = 72 }) => {
  const f = useCurrentFrame();
  return (
    <Text x={540} y={y} w={980} size={size} weight={900} align="center" style={start > 0 ? fadeUp(f, start) : undefined}>
      {children}
    </Text>
  );
};

/** The question in a white card. */
export const QCard: React.FC<{ top?: number; size?: number; children: React.ReactNode }> = ({ top = 300, size = 48, children }) => (
  <div style={{ position: 'absolute', left: 60, top, width: 860, background: C.card, borderRadius: 32, padding: '30px 40px', fontSize: size, fontWeight: 700, lineHeight: 1.4, boxShadow: '0 8px 30px rgba(30,40,80,0.07)' }}>{children}</div>
);

/** Answer choices, wrapped. `tex` = true renders each in KaTeX. */
export const ChoiceRow: React.FC<{ items: string[]; top: number; start: (i: number) => number; size?: number }> = ({ items, top, start, size = 46 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 60, top, width: 860, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
      {items.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '10px 24px', boxShadow: '0 4px 14px rgba(30,40,80,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 34, fontWeight: 800 }}>{'ABCDE'[i]}</span>
          <Tex tex={c.replace(/\\frac/g, '\\dfrac')} size={size} />
        </div>
      ))}
    </div>
  );
};

/** Pause scene: the question dimmed behind a countdown. */
export const makeThink = (Body: React.FC, tick: string): SceneComponent => ({ scene }) => (
  <>
    <div style={{ opacity: 0.35 }}>
      <Body />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: 'rgba(246,247,251,0.6)' }} />
    <Countdown scene={scene} seconds={3} x={540} y={1000} tick={tick} />
  </>
);

/** Green answer badge at the top of the reveal; chime at `chime` (end of the answer line) + confetti. */
export const AnswerBadge: React.FC<{ label?: string; tex: string; hit: number; chime: number; sfx: string; y?: number }> = ({ label = 'Answer =', tex, hit, chime, sfx, y = 290 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${pop(f, hit)})`, background: C.green, color: '#fff', borderRadius: 28, padding: '18px 44px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 16px 40px rgba(33,196,93,0.35)' }}>
          <span style={{ fontSize: 54, fontWeight: 900 }}>{label}</span>
          <Tex tex={tex} size={84} color="#fff" />
        </div>
      </div>
      <Sequence from={chime} durationInFrames={60} layout="none">
        <Audio src={sfx} volume={0.3} />
      </Sequence>
      <Confetti x={540} y={y + 90} start={chime} seed={5} />
    </>
  );
};

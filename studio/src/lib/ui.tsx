import { Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, mulberry32, pop, range } from './anim';
import { Stage } from './grid';
import { Tex } from './Tex';
import { C } from './theme';

// Shared building blocks for explainer scenes.

export const Text: React.FC<{ x: number; y: number; w?: number; size?: number; weight?: number; color?: string; align?: 'left' | 'center'; style?: React.CSSProperties; children: React.ReactNode }> = ({
  x, y, w = 800, size = 44, weight = 700, color = C.ink, align = 'left', style, children,
}) => (
  <div style={{ position: 'absolute', left: align === 'center' ? x - w / 2 : x, top: y, width: w, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight: 1.3, ...style }}>
    {children}
  </div>
);

export const Pill: React.FC<{ x: number; y: number; color: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ x, y, color, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, background: color, color: '#fff', borderRadius: 999, padding: '10px 30px', fontSize: 40, fontWeight: 900, ...style }}>
    {children}
  </div>
);

/** A tally row: label on the left, maths on the right. */
export const Row: React.FC<{ x: number; y: number; label: string; tex: string; color?: string; style: React.CSSProperties; strong?: boolean }> = ({ x, y, label, tex, color = C.ink, style, strong }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 28, whiteSpace: 'nowrap', ...style }}>
    <div style={{ width: 260, fontSize: 40, fontWeight: 800, color }}>{label}</div>
    <Tex tex={tex} size={strong ? 62 : 56} color={strong ? C.green : C.ink} />
  </div>
);

/** Big round answer badge. */
export const Answer: React.FC<{ x: number; y: number; value: string; start: number; chime: string }> = ({ x, y, value, start, chime }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(f, start, fps);
  return (
    <>
      <Sequence from={start} durationInFrames={60} layout="none">
        <Audio src={chime} volume={0.3} />
      </Sequence>
      {s > 0 && <div style={{ position: 'absolute', left: x - 120, top: y - 120, width: 240, height: 240, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, fontWeight: 900, transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(33, 196, 93, 0.35)' }}>
      {value}
    </div>}
    </>
  );
};

/** One-time burst of confetti from (x, y). Seeded, so every render is identical. */
export const Confetti: React.FC<{ x: number; y: number; start: number; seed: number }> = ({ x, y, start, seed }) => {
  const f = useCurrentFrame();
  const t = f - start;
  if (t < 0 || t > 75) return null;
  const rand = mulberry32(seed);
  const colors = [C.primary, C.violet, C.blue, C.amber, C.red];
  return (
    <Stage>
      {range(46).map((i) => {
        const ang = rand() * Math.PI * 2;
        const v = 9 + rand() * 12;
        const px = x + Math.cos(ang) * v * t;
        const py = y + Math.sin(ang) * v * t + 0.35 * t * t;
        return <rect key={i} x={px} y={py} width={16} height={9} rx={3} fill={colors[i % colors.length]} opacity={1 - t / 75} transform={`rotate(${t * 9 + i * 40} ${px} ${py})`} />;
      })}
    </Stage>
  );
};


export const Mark: React.FC<{ on: number; children: React.ReactNode }> = ({ on, children }) => {
  const f = useCurrentFrame();
  const p = ease(f, on, 18);
  return (
    <span style={{ backgroundImage: `linear-gradient(${C.primarySoft}, ${C.primarySoft})`, backgroundSize: `${p * 100}% 100%`, backgroundRepeat: 'no-repeat', borderRadius: 8, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '0 4px', fontWeight: p > 0 ? 800 : 600 }}>
      {children}
    </span>
  );
};


export const Choices: React.FC<{ x: number; y: number; start: (i: number) => number; items: React.ReactNode[] }> = ({ x, y, start, items }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 22 }}>
      {items.map((c, i) => (
        <div key={i} style={{ ...fadeUp(f, start(i), 10), background: C.card, borderRadius: 18, padding: '12px 26px', fontSize: 44, fontWeight: 800, boxShadow: '0 4px 14px rgba(30,40,80,0.07)' }}>
          <span style={{ color: C.muted, fontSize: 32, marginRight: 12 }}>{'ABCDE'[i]}</span>
          {c}
        </div>
      ))}
    </div>
  );
};


export const Check: React.FC<{ x: number; y: number; start: number; children: React.ReactNode }> = ({ x, y, start, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 22, fontSize: 44, fontWeight: 800, ...fadeUp(f, start) }}>
      <svg width={54} height={54} viewBox="0 0 54 54">
        <circle cx={27} cy={27} r={27} fill={C.primary} />
        <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  );
};


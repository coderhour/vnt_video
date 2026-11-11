import { Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, fadeUp, range } from './anim';
import type { Scene } from './Explainer';
import { C } from './theme';

/** "Pause and try it" countdown ring (`label` replaces the heading, e.g. "暂停，试一试！" in Chinese videos). The countdown runs over the scene's last `seconds`. */
export const Countdown: React.FC<{ scene: Scene; seconds: number; x: number; y: number; tick?: string; label?: React.ReactNode }> = ({ scene, seconds, x, y, tick, label }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = scene.frames - seconds * fps;
  const left = Math.max(0, Math.min(seconds, Math.ceil((scene.frames - f) / fps)));
  const p = Math.max(0, Math.min(1, (f - start) / (seconds * fps)));
  const R = 170;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'absolute', left: x - 230, top: y - 260, width: 460, textAlign: 'center', ...fadeUp(f, 0) }}>
      <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 20 }}>
        {label ?? <>Pause &amp; try it<span style={{ color: C.primary }}>!</span></>}
      </div>
      <svg width={460} height={420} viewBox="-230 -210 460 420">
        <circle r={R} fill={C.card} stroke={C.line} strokeWidth={22} />
        <circle
          r={R}
          fill="none"
          stroke={C.primary}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * p}
          transform="rotate(-90)"
          opacity={ease(f, start - 10, 10)}
        />
        <text y={10} fontSize={150} fontWeight={900} textAnchor="middle" dominantBaseline="middle" fill={C.ink}>
          {left}
        </text>
      </svg>
      {tick &&
        range(seconds).map((i) => (
          <Sequence key={i} from={start + i * fps} durationInFrames={10} layout="none">
            <Audio src={tick} volume={0.2} />
          </Sequence>
        ))}
    </div>
  );
};

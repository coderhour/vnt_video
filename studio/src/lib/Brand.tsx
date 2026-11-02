import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ease, fadeUp } from './anim';
import { C } from './theme';

export const GRAD = 'linear-gradient(90deg, #8a4dff 0%, #6a6cff 50%, #3c9cf6 100%)';

/** The logo lockup on one row: leaf + gradient "Vantee" + green ".ai", with the smile under "nt". Scales with `size` (font px). */
export const BrandMark: React.FC<{ size: number }> = ({ size: s }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: s / 6 }}>
    <Img src={staticFile('brand/logo.svg')} style={{ height: s * 1.55, margin: `${-s * 0.18}px ${-s * 0.24}px ${-s * 0.18}px 0` }} />
    <div style={{ position: 'relative', fontSize: s, fontWeight: 900, lineHeight: 1, letterSpacing: -s / 84 }}>
      <span style={{ background: GRAD, WebkitBackgroundClip: 'text', color: 'transparent' }}>Vantee</span>
      <span style={{ color: C.primary }}>.ai</span>
      <svg width={s * 0.75} height={s * 0.24} viewBox="0 0 150 46" style={{ position: 'absolute', left: s * 1.226, top: s * 1.024 }}>
        <path d="M10 10 Q75 46 140 10" stroke="#6a6cff" strokeWidth={14} fill="none" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

// Music-box sparkle as the card appears (Freesound CC0, see brand/sfx/FREESOUND-CREDITS.md).
const SIGNOFF_SFX = staticFile('brand/sfx/fs-817466.mp3');

/** End-of-video sign-off: a full-screen card (lockup, tagline, the video's closing words) that fades in over the scene
 * from frame `start`. Captions, chapter pill and watermark stay on top (Explainer draws them later). */
export const SignOff: React.FC<{ start: number; text?: string; tagline?: string; size?: number }> = ({ start, text = 'Keep exploring!', tagline = 'Your family AI Coach', size = 130 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: ease(f, start, 14), alignItems: 'center', paddingTop: 250, textAlign: 'center' }}>
      <div style={fadeUp(f, start + 4)}>
        <BrandMark size={size} />
        <div style={{ fontSize: 54, fontWeight: 800, color: C.muted, marginTop: 50 }}>{tagline}</div>
        <div style={{ fontSize: 54, fontWeight: 900, color: C.ink, marginTop: 20 }}>{text}</div>
      </div>
      <Sequence from={start} layout="none">
        <Audio src={SIGNOFF_SFX} volume={0.25} />
      </Sequence>
    </AbsoluteFill>
  );
};

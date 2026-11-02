import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from './anim';
import type { Scene, SceneComponent, Timeline } from './Explainer';
import { NUNITO } from './fonts';
import { BrandMark } from './Brand';
import { StageSize } from './grid';
import { C } from './theme';

// Vertical 1080×1920 frame for YouTube Shorts / Reels / TikTok.
// Safe zone: the platform UI covers the top ~200 px, the right ~160 px below y≈900 (like/comment buttons)
// and the bottom ~360 px (title, channel, related-video link). Keep the stage in y 200…1360, captions in 1330…1580 (2–3 lines).
export const SAFE = { top: 200, stageBottom: 1360, right: 920 };

const CAPTION_TAIL = 8;

const Captions: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const f = useCurrentFrame();
  for (const s of timeline.scenes) {
    for (const l of s.lines) {
      const start = s.from + l.from;
      if (f >= start && f < start + l.frames + CAPTION_TAIL) {
        const o = interpolate(f, [start, start + 4, start + l.frames + CAPTION_TAIL - 4, start + l.frames + CAPTION_TAIL], [0, 1, 1, 0], clamp);
        return (
          <div style={{ position: 'absolute', left: 50, width: SAFE.right - 50, top: 1330, display: 'flex', justifyContent: 'center' }}>
            <div style={{ opacity: o, background: C.ink, color: '#fff', borderRadius: 26, padding: '16px 30px', fontSize: 54, fontWeight: 800, lineHeight: 1.28, textAlign: 'center', textWrap: 'balance' }}>
              {l.caption}
            </div>
          </div>
        );
      }
    }
  }
  return null;
};

/** Shared vertical frame: scenes + voice + captions + a small brand tag. `Stage` inside it is 1080×1920.
 * `font` overrides the base font stack, e.g. ZH_FONT for a Chinese short (as in Explainer). */
export const ShortFrame: React.FC<{ timeline: Timeline; scenes: Record<string, SceneComponent>; badge: string; font?: string }> = ({ timeline, scenes, badge, font = NUNITO }) => (
  <StageSize.Provider value={[1080, 1920]}>
    <AbsoluteFill style={{ background: C.bg, fontFamily: font, color: C.ink }}>
      {timeline.scenes.map((s) => {
        const Comp = scenes[s.id];
        if (!Comp) throw new Error(`No component for scene "${s.id}"`);
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
            <Comp scene={s} />
            {s.lines.map((l, i) => (
              <Sequence key={i} from={l.from} durationInFrames={l.frames} name={`voice ${i}`}>
                <Audio src={staticFile(l.file)} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <div style={{ position: 'absolute', left: 50, top: 200, display: 'flex', alignItems: 'center', gap: 24 }}>
        <BrandMark size={50} />
        <span style={{ fontSize: 30, fontWeight: 800, color: C.muted }}>{badge}</span>
      </div>
      <Captions timeline={timeline} />
    </AbsoluteFill>
  </StageSize.Provider>
);

/** End card that sends the viewer to the full lesson: its poster as a "video" with a play button,
 * what the full lesson adds, and an arrow down to the related-video link (set it when publishing). */
export const FullLessonCard: React.FC<{ scene: Scene; poster: string; length: string; bullets: string[]; title?: React.ReactNode }> = ({ scene, poster, length, bullets, title }) => {
  const f = useCurrentFrame();
  const card = pop(f, 0);
  const pulse = 1 + 0.06 * Math.sin((f / 30) * Math.PI * 2) * ease(f, 20, 10);
  const arrow = ease(f, scene.lines[1]?.from ?? 30, 12);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 290, textAlign: 'center', fontSize: 72, fontWeight: 900, ...fadeUp(f, 0) }}>
        {title ?? <>Want the <span style={{ color: C.primary }}>full lesson</span>?</>}
      </div>
      <div style={{ position: 'absolute', left: 90, top: 420, width: 900, borderRadius: 32, overflow: 'hidden', background: C.card, boxShadow: '0 20px 50px rgba(30,40,80,0.18)', transform: `scale(${card})` }}>
        <Img src={poster} style={{ width: 900, height: 506, display: 'block', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', left: 450 - 70, top: 253 - 70, width: 140, height: 140, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pulse})`, boxShadow: '0 10px 30px rgba(239,67,67,0.4)' }}>
          <svg width={60} height={60} viewBox="0 0 60 60"><path d="M18 10 L50 30 L18 50 Z" fill="#fff" /></svg>
        </div>
        <div style={{ position: 'absolute', right: 20, top: 446, background: 'rgba(0,0,0,0.75)', color: '#fff', borderRadius: 12, padding: '4px 16px', fontSize: 36, fontWeight: 800 }}>{length}</div>
      </div>
      {bullets.map((b, i) => (
        <div key={b} style={{ position: 'absolute', left: 110, top: 960 + i * 80, display: 'flex', alignItems: 'center', gap: 22, fontSize: 48, fontWeight: 800, ...fadeUp(f, 14 + i * 10) }}>
          <svg width={52} height={52} viewBox="0 0 54 54">
            <circle cx={27} cy={27} r={27} fill={C.primary} />
            <path d="M15 28 L24 37 L40 19" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {b}
        </div>
      ))}
      <svg width={72} height={84} viewBox="0 0 120 140" style={{ position: 'absolute', left: 84, top: 1238 + Math.sin(f / 5) * 4 * arrow, opacity: arrow }}>{/* ends above the caption (y 1330) */}
        <path d="M60 10 L60 110 M25 78 L60 115 L95 78" stroke={C.primary} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
};

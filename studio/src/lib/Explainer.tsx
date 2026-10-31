import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease } from './anim';
import { NUNITO } from './fonts';
import { C } from './theme';

export type Line = { text: string; caption: string; file: string; from: number; frames: number };
export type Scene = { id: string; kind: string; chapter: string | null; from: number; frames: number; lines: Line[] };
export type Timeline = { fps: number; durationInFrames: number; scenes: Scene[] };
export type SceneComponent = React.FC<{ scene: Scene }>;

/** Frame (relative to the scene) where line i starts, or a fraction t of the way through it. */
export const at = (scene: Scene, i: number, t = 0) => {
  const l = scene.lines[i];
  return l ? l.from + Math.round(l.frames * t) : scene.frames;
};

const CAPTION_TAIL = 10;

const Captions: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const f = useCurrentFrame();
  for (const s of timeline.scenes) {
    for (const l of s.lines) {
      const start = s.from + l.from;
      if (f >= start && f < start + l.frames + CAPTION_TAIL) {
        const o = interpolate(f, [start, start + 6, start + l.frames + CAPTION_TAIL - 6, start + l.frames + CAPTION_TAIL], [0, 1, 1, 0], clamp);
        return (
          <div style={{ position: 'absolute', left: 270, right: 120, bottom: 44, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                opacity: o,
                background: C.card,
                borderRadius: 24,
                padding: '18px 36px',
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.3,
                textAlign: 'center',
                textWrap: 'balance', // no 1-2 word (or hanzi) orphan last line
                boxShadow: '0 6px 24px rgba(30, 40, 80, 0.08)',
              }}
            >
              {l.caption}
            </div>
          </div>
        );
      }
    }
  }
  return null;
};

/** Static Vantee logo, bottom-left: a watermark only, no motion. */
const Watermark: React.FC = () => (
  <Img src={staticFile('brand/logo.svg')} style={{ position: 'absolute', left: 40, bottom: 20, height: 220 }} />
);

const ChapterPill: React.FC<{ timeline: Timeline; badge: string }> = ({ timeline, badge }) => {
  const f = useCurrentFrame();
  const current = [...timeline.scenes].reverse().find((s) => s.chapter && s.from <= f);
  const p = current ? ease(f, current.from, 14) : 0;
  return (
    <>
      {current && (
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 44,
            opacity: p,
            transform: `translateX(${(1 - p) * -30}px)`,
            background: C.card,
            borderRadius: 999,
            padding: '12px 30px',
            fontSize: 34,
            fontWeight: 800,
            color: C.ink,
            boxShadow: '0 4px 16px rgba(30, 40, 80, 0.06)',
          }}
        >
          <span style={{ color: C.primary }}>● </span>
          {current.chapter}
        </div>
      )}
      <div style={{ position: 'absolute', right: 60, top: 50, fontSize: 34, fontWeight: 700, color: C.muted }}>{badge}</div>
    </>
  );
};

/** Shared frame for every explainer: scenes + narration audio + chapter pill + captions + Vantee logo. */
// `font` overrides the base font stack, e.g. `${NUNITO}, "Noto Sans CJK SC"` for a Chinese video (system font, see fonts.ts).
export const Explainer: React.FC<{ timeline: Timeline; scenes: Record<string, SceneComponent>; badge: string; font?: string }> = ({
  timeline,
  scenes,
  badge,
  font = NUNITO,
}) => (
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
    <ChapterPill timeline={timeline} badge={badge} />
    <Captions timeline={timeline} />
    <Watermark />
  </AbsoluteFill>
);

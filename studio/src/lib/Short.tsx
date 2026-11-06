import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp, ease, fadeUp, pop } from './anim';
import type { Scene, SceneComponent, Timeline } from './Explainer';
import { NUNITO } from './fonts';
import { BrandMark, CN } from './Brand';
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

/** Punchy captions: 1–3 words at a time, big, no box, the word being said in green.
 * ponytail: word timing is estimated from character counts across the line; use STT word timestamps if it drifts. */
const WordCaptions: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const f = useCurrentFrame();
  for (const s of timeline.scenes) {
    for (const l of s.lines) {
      const start = s.from + l.from;
      if (f < start || f >= start + l.frames + CAPTION_TAIL) continue;
      const words = l.caption.split(/\s+/);
      const chunks: number[][] = [[]]; // word indexes; break after punctuation or 3 words
      words.forEach((w, i) => {
        chunks[chunks.length - 1].push(i);
        if (/[.,!?;:]$/.test(w) || chunks[chunks.length - 1].length === 3) chunks.push([]);
      });
      const weight = words.map((w) => w.length + 2);
      const total = weight.reduce((a, b) => a + b, 0);
      const pos = Math.min(1, (f - start) / l.frames) * total;
      let cur = 0;
      for (let acc = 0; cur < words.length - 1 && acc + weight[cur] <= pos; cur++) acc += weight[cur];
      const chunk = chunks.find((c) => c.includes(cur)) ?? [];
      return (
        <div style={{ position: 'absolute', left: 40, width: SAFE.right - 40, top: 1350, textAlign: 'center', fontSize: 84, fontWeight: 900, lineHeight: 1.15, color: '#fff', WebkitTextStroke: '14px #222', paintOrder: 'stroke fill', textWrap: 'balance' }}>
          {chunk.map((i) => (
            <span key={i} style={{ color: i === cur ? '#5dff9b' : '#fff' }}>{words[i]} </span>
          ))}
        </div>
      );
    }
  }
  return null;
};

// Shared short SFX (Freesound CC0, credits in public/brand/sfx/FREESOUND-CREDITS.md). Volumes as used in the reference short.
export const SFX = {
  buzz: staticFile('brand/sfx/fs-650842.mp3'), // wrong-answer buzzer: the hook's NOPE (0.35), the trap line (0.2)
  click: staticFile('brand/sfx/fs-528561.mp3'), // soft tick: sweeps, counters, pulsing choices (0.22–0.3)
  whoosh: staticFile('brand/sfx/fs-789840.mp3'), // every scene change after the hook, and zoom moves (0.25–0.3)
  riser: staticFile('brand/sfx/fs-863826.mp3'), // 1.04 s, ends ON the answer pop: start it at hit - 31 (0.3)
};
export const MUSIC = staticFile('brand/music/tonight-hiphop.mp3'); // Mixkit free license, see public/brand/music/CREDITS.md

/** One sound effect at frame `at` of the current scene. */
export const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at: from, src, volume = 0.3 }) => (
  <Sequence from={Math.max(0, Math.round(from))} durationInFrames={45} layout="none">
    <Audio src={src} volume={volume} />
  </Sequence>
);

/** Scale for choice `i` while the choices pulse one by one (starts 8 frames in, 9 frames apart). */
export const choicePulse = (f: number, i: number) => 1 + (f >= 8 + i * 9 && f < 26 + i * 9 ? 0.12 * Math.sin(((f - 8 - i * 9) / 18) * Math.PI) : 0);

/** The `think` scene's comment bait (replaces the countdown): a bubble that pops at the scene start, plus a whoosh
 * and a tick for each of `choices` pulsing choices (pulse them with `choicePulse`). */
export const CommentBubble: React.FC<{ y?: number; text?: string; choices?: number }> = ({ y = 650, text = 'Comment your letter!', choices = 5 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Sfx at={0} src={SFX.whoosh} />
      {Array.from({ length: choices }, (_, i) => <Sfx key={i} at={8 + i * 9} src={SFX.click} volume={0.25} />)}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', transform: `rotate(-3deg) scale(${pop(f, 0)})`, background: C.violet, color: '#fff', borderRadius: 40, padding: '26px 56px', fontSize: 76, fontWeight: 900, boxShadow: '0 16px 40px rgba(123,97,255,0.35)' }}>
          {text}
          <div style={{ position: 'absolute', left: 120, bottom: -34, width: 0, height: 0, borderLeft: '26px solid transparent', borderRight: '26px solid transparent', borderTop: `40px solid ${C.violet}` }} />
        </div>
      </div>
    </>
  );
};

/** Slow push-in for the hook (scale 1 → 1.05 over the scene) so frame 0 is already moving. Wrap the figure, not the title. */
export const PushIn: React.FC<{ frames: number; origin?: string; children: React.ReactNode }> = ({ frames, origin = '540px 760px', children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.05 * Math.min(1, f / frames)})`, transformOrigin: origin }}>{children}</div>;
};

/** Green "Practice more at vantee.ai" pill (CN: just the logo chip, no call to action) that pops in at `start` (opt-in CTA over the last scene, instead of an end card). */
export const CtaPill: React.FC<{ start: number; y?: number; text?: string }> = ({ start, y = 1150, text = 'Practice more at vantee.ai' }) => {
  const f = useCurrentFrame();
  const o = ease(f, start, 10);
  return (
    <div style={{ position: 'absolute', left: 60, width: 860, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `scale(${pop(f, start) * (1 + 0.04 * Math.sin((f / 30) * Math.PI * 2) * o)})` }}>
      <div style={{ background: C.primary, color: '#fff', borderRadius: 999, padding: CN ? '20px 26px' : '20px 26px 20px 44px', fontSize: 52, fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 16px 40px rgba(12,194,129,0.35)', display: 'flex', alignItems: 'center', gap: 16 }}>
        {!CN && text.replace(/\s*vantee\.ai\s*$/, '')}
        {(CN || /vantee\.ai\s*$/.test(text)) && <span style={{ background: '#fff', borderRadius: 999, padding: '10px 30px 16px 22px', display: 'flex' }}><BrandMark size={46} /></span>}
      </div>
    </div>
  );
};

/** Shared vertical frame: scenes + voice + captions + a small brand tag. `Stage` inside it is 1080×1920.
 * `font` overrides the base font stack, e.g. ZH_FONT for a Chinese short (as in Explainer).
 * Opt-in: `captions="words"` for punchy word captions (always on: muted viewers need every line),
 * `music` = a looped bed under the voice (staticFile path). */
export const ShortFrame: React.FC<{ timeline: Timeline; scenes: Record<string, SceneComponent>; badge: string; font?: string; captions?: 'box' | 'words'; music?: string }> = ({ timeline, scenes, badge, font = NUNITO, captions = 'box', music }) => (
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
      {captions === 'words' ? <WordCaptions timeline={timeline} /> : <Captions timeline={timeline} />}
      {music && <Audio src={music} loop volume={(f) => 0.035 * Math.min(1, (timeline.durationInFrames - f) / 20)} />}
    </AbsoluteFill>
  </StageSize.Provider>
);


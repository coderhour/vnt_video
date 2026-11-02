import { Composition, staticFile } from 'remotion';
import { Banner } from './Banner';
import { FontCheck } from './FontCheck';
import type { Timeline } from './lib/Explainer';

/** Duration comes from the video's timeline.json, written by tts.py. */
const fromTimeline = (slug: string) => async () => {
  const timeline: Timeline = await fetch(staticFile(`${slug}/timeline.json`)).then((r) => r.json());
  return { durationInFrames: timeline.durationInFrames, props: { timeline } };
};

// Every videos/<slug>/Composition.tsx is registered automatically. Each must export
// `SLUG` and `Video: React.FC<{ timeline: Timeline | null }>`, so no one edits this file per video.
declare const require: { context: (dir: string, deep: boolean, re: RegExp) => { keys(): string[]; (k: string): any } };
type VideoModule = { SLUG: string; Video: React.FC<{ timeline: Timeline | null }> };
// Vertical shorts: videos/<slug>/short/Short.tsx exports SLUG + Short, registered as `<slug>-short` (1080×1920).
type ShortModule = { SLUG: string; Short: React.FC<{ timeline: Timeline | null }> };
const ctx = require.context(
  './videos',
  true,
  /Composition\.tsx$/,
);
const VIDEOS: VideoModule[] = ctx.keys().map(ctx);
const sctx = require.context('./videos', true, /Short\.tsx$/);
const SHORTS: ShortModule[] = sctx.keys().map(sctx);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Banner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
    <Composition id="FontCheck" component={FontCheck} durationInFrames={1} fps={30} width={1920} height={1080} />
    {VIDEOS.map(({ SLUG, Video }) => (
      <Composition
        key={SLUG}
        id={SLUG}
        component={Video}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ timeline: null }}
        calculateMetadata={fromTimeline(SLUG)}
      />
    ))}
    {SHORTS.map(({ SLUG, Short }) => (
      <Composition
        key={`${SLUG}-short`}
        id={`${SLUG}-short`}
        component={Short}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ timeline: null }}
        calculateMetadata={fromTimeline(`${SLUG}/short`)}
      />
    ))}
  </>
);

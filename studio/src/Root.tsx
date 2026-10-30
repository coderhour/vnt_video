import { Composition, staticFile } from 'remotion';
import { FontCheck } from './FontCheck';
import type { Timeline } from './lib/Explainer';

/** Duration comes from the video's timeline.json, written by tts.py. */
const fromTimeline = (slug: string) => async () => {
  const timeline: Timeline = await fetch(staticFile(`${slug}/timeline.json`)).then((r) => r.json());
  return { durationInFrames: timeline.durationInFrames, props: { timeline } };
};

// Every videos/<slug>/Composition.tsx is registered automatically. Each must export
// `SLUG` and `Video: React.FC<{ timeline: Timeline | null }>`, so no one edits this file per video.
declare const require: { context: (dir: string, deep: boolean, re: RegExp) => { keys(): string[]; (k: string): VideoModule } };
type VideoModule = { SLUG: string; Video: React.FC<{ timeline: Timeline | null }> };
const ctx = require.context(
  './videos',
  true,
  /Composition\.tsx$/,
);
const VIDEOS = ctx.keys().map(ctx);

export const RemotionRoot: React.FC = () => (
  <>
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
  </>
);

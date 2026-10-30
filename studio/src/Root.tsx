import { Composition, staticFile } from 'remotion';
import { FontCheck } from './FontCheck';
import type { Timeline } from './lib/Explainer';
import { DotGridSquares, SLUG as DOT_GRID } from './videos/2026-10-29-dot-grid-squares/Composition';

/** Duration comes from the video's timeline.json, written by tts.py. */
const fromTimeline = (slug: string) => async () => {
  const timeline: Timeline = await fetch(staticFile(`${slug}/timeline.json`)).then((r) => r.json());
  return { durationInFrames: timeline.durationInFrames, props: { timeline } };
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FontCheck" component={FontCheck} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition
      id={DOT_GRID}
      component={DotGridSquares}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ timeline: null }}
      calculateMetadata={fromTimeline(DOT_GRID)}
    />
  </>
);

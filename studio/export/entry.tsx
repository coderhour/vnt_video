// Bundle entry: window.VntVideoExplainer.mount(el, { assetBase }). `vnt-video:composition` and
// `vnt-video:timeline` are resolved per video by build.mjs.
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Player, type PlayerRef } from '@remotion/player';
import { Video } from 'vnt-video:composition';
import timeline from 'vnt-video:timeline';
import { setAssetBase } from './remotion-shim';

type Listener = () => void;

const mount = (el: HTMLElement, opts: { assetBase: string }) => {
  setAssetBase(opts.assetBase);
  let player: PlayerRef | null = null;
  const root = createRoot(el);
  flushSync(() =>
    root.render(
      <Player
        ref={(r) => {
          player = r;
        }}
        component={Video}
        inputProps={{ timeline }}
        durationInFrames={timeline.durationInFrames}
        fps={timeline.fps}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
        autoPlay={false}
        loop={false}
        acknowledgeRemotionLicense
        style={{ width: '100%', aspectRatio: '16 / 9' }}
      />,
    ),
  );
  const on = (ev: 'pause' | 'ended', fn: Listener) => player?.addEventListener(ev, fn);
  return {
    play: () => player?.play(),
    pause: () => player?.pause(),
    frame: () => player?.getCurrentFrame() ?? 0,
    seek: (f: number) => player?.seekTo(f),
    duration: () => timeline.durationInFrames,
    onPause: (fn: Listener) => on('pause', fn),
    onEnded: (fn: Listener) => on('ended', fn),
    cleanup: () => {
      player?.pause();
      root.unmount();
    },
  };
};

(window as unknown as { VntVideoExplainer: unknown }).VntVideoExplainer = { mount };

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// 'angle' (GPU) sometimes drew a stale copy of a scene into ~70 frames (midpoint-chase-zh 0:54); CPU swiftshader is clean.
Config.setChromiumOpenGlRenderer('swiftshader');
Config.setConcurrency(4);

// Replaces `remotion` for every import except this file's own (see build.mjs). Re-exports the real
// remotion and overrides staticFile so assets resolve under the host-provided assetBase (no network at runtime).
import logo from '../public/brand/logo.svg'; // inlined as a data URI by esbuild's dataurl loader

export * from 'remotion';

let base = '';
export const setAssetBase = (b: string) => {
  base = b.endsWith('/') ? b : `${b}/`;
};

export const staticFile = (p: string): string => {
  if (p === 'brand/logo.svg') return logo;
  return base + p.replace(/^\/+/, '').replace(/\.wav$/, '.mp3');
};

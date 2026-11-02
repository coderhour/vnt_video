// node export/build.mjs <slug> <outfile>: one self-contained, minified IIFE player bundle for a video.
// Called by tools/export_vnt.py. Offline by design: fonts, KaTeX and the logo are data URIs.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const [slug, outfile] = process.argv.slice(2);
if (!slug || !outfile) throw new Error('usage: build.mjs <slug> <outfile>');
const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.join(here, '..');
const require = createRequire(path.join(studio, 'package.json'));
const shim = path.join(here, 'remotion-shim.ts');
const fontFile = (pkg, f) => path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'files', f);

const face = (family, weight, pkg, file) =>
  `{ f: ${JSON.stringify(family)}, w: ${weight}, u: require(${JSON.stringify(fontFile(pkg, file))}) }`;
const fontModule = (family, pkg, slugName, weights) => `
  const faces = [${weights.map((w) => face(family, w, pkg, `${slugName}-latin-${w}-normal.woff2`)).join(',')}];
  export const loadFont = () => {
    const s = document.createElement('style');
    s.textContent = faces.map((x) => '@font-face{font-family:"' + x.f + '";font-style:normal;font-display:block;font-weight:' + x.w + ';src:url(' + x.u + ') format("woff2")}').join('');
    document.head.appendChild(s);
    return { fontFamily: ${JSON.stringify(family)} };
  };`;

const plugin = {
  name: 'vnt-export',
  setup(b) {
    // remotion -> shim (the shim's own import of remotion gets the real one)
    b.onResolve({ filter: /^remotion$/ }, (a) => (a.importer === shim ? undefined : { path: shim }));
    b.onResolve({ filter: /^vnt-video:/ }, (a) => ({ path: a.path, namespace: 'vnt' }));
    b.onLoad({ filter: /.*/, namespace: 'vnt' }, (a) => {
      if (a.path === 'vnt-video:composition')
        return { contents: `export * from ${JSON.stringify(path.join(studio, 'src/videos', slug, 'Composition.tsx'))}`, loader: 'ts', resolveDir: studio };
      if (a.path === 'vnt-video:timeline')
        return { contents: `export { default } from ${JSON.stringify(path.join(studio, 'public', slug, 'timeline.json'))}`, loader: 'js', resolveDir: studio };
      if (a.path === 'vnt-video:nunito')
        return { contents: fontModule('Nunito', '@fontsource/nunito', 'nunito', [400, 600, 700, 800, 900]), loader: 'js', resolveDir: studio };
      if (a.path === 'vnt-video:pacifico')
        return { contents: fontModule('Pacifico', '@fontsource/pacifico', 'pacifico', [400]), loader: 'js', resolveDir: studio };
    });
    // @remotion/google-fonts (network) -> inlined @font-face rules
    b.onResolve({ filter: /^@remotion\/google-fonts\/Nunito$/ }, () => ({ path: 'vnt-video:nunito', namespace: 'vnt' }));
    b.onResolve({ filter: /^@remotion\/google-fonts\/Pacifico$/ }, () => ({ path: 'vnt-video:pacifico', namespace: 'vnt' }));
    // KaTeX CSS -> <style> with woff2 as data URIs; woff/ttf fallbacks dropped
    b.onLoad({ filter: /katex\.min\.css$/ }, (a) => {
      const dir = path.dirname(a.path);
      const css = fs
        .readFileSync(a.path, 'utf8')
        .replace(/,url\([^)]*?\.(?:woff|ttf)\)\s*format\("[^"]*"\)/g, '')
        .replace(/url\((fonts\/[^)]*?\.woff2)\)/g, (_, f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')})`);
      return {
        contents: `const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);`,
        loader: 'js',
      };
    });
  },
};

const r = await build({
  entryPoints: [path.join(here, 'entry.tsx')],
  outfile,
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  jsx: 'automatic',
  legalComments: 'none',
  absWorkingDir: studio,
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.svg': 'dataurl', '.woff2': 'dataurl', '.json': 'json' },
  plugins: [plugin],
  logLevel: 'warning',
});
if (r.errors.length) process.exit(1);

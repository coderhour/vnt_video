import { AbsoluteFill, Img, staticFile } from 'remotion';
import { BrandMark } from './lib/Brand';
import { ZH_FONT } from './lib/fonts';
import { C } from './lib/theme';

// WeChat Channels covers for the Chinese videos: 3:4 (1080×1440) and 4:3 (1440×1080), rendered as stills with
// --props='{"cn":true}' (logo without ".ai"). `figure` = a crop of the video's own figure (public/<slug>/cover-figure.png),
// never one that shows the answer; the 3:4 cover uses a tighter crop, cover-figure-tall.png, so it stays big.
export type CoverSpec = { slug: string; chip: string; lines: React.ReactNode[] };

export const COVERS: CoverSpec[] = [
  { slug: '2026-10-30-circles-through-grid-points-zh', chip: 'AMC 10 风格 · 第5级', lines: ['9 个点', <>能画出<span style={{ color: C.primary }}>几个</span>圆？</>] },
  { slug: '2026-10-30-geometric-triangle-zh', chip: 'AMC 10 风格 · 第5级', lines: ['三边成等比数列', '最长边 2025', <>能围成<span style={{ color: C.primary }}>几个</span>三角形？</>] },
  { slug: '2026-10-30-polygon-center-zh', chip: 'AMC 10 风格 · 第4级', lines: ['正13边形', '选4个顶点', <>几种能<span style={{ color: C.primary }}>包住中心</span>？</>] },
  { slug: '2026-10-30-midpoint-chase-zh', chip: 'AMC 8 风格 · 第5级', lines: ['中点追逐', <>P<sub style={{ fontSize: '0.6em' }}>10</sub> 停在<span style={{ color: C.primary }}>哪里</span>？</>] },
  { slug: '2026-11-05-amc8-guide-zh', chip: 'AMC 8 备考指南', lines: ['AMC 8 全攻略', <>答错<span style={{ color: C.primary }}>不扣分</span>？</>, '题型 · 计分 · 策略'] },
  { slug: '2026-11-05-amc10-guide-zh', chip: 'AMC 10 备考指南', lines: ['答对14题', <>为什么能<span style={{ color: C.primary }}>赢过16题</span>？</>] },
  { slug: '2026-11-01-domino-tromino-2x6-zh', chip: 'AMC 10 风格 · 第4级', lines: ['骨牌 + L 形块', '铺满 2×6 的板', <>一共<span style={{ color: C.primary }}>几种</span>铺法？</>] },
  { slug: '2026-11-01-lattice-triangle-10-zh', chip: 'AMC 10 风格 · 第4级', lines: ['直角三角形', <>内部正好 <span style={{ color: C.primary }}>10 个点</span></>, '有几种可能？'] },
];

// Props are JSON (Remotion serializes them), so the composition gets an index, not the spec with its JSX lines.
export const Cover: React.FC<{ i: number; wide: boolean }> = ({ i, wide }) => {
  const { slug, chip, lines } = COVERS[i];
  const src = staticFile(`${slug}/cover-figure${wide ? '' : '-tall'}.png`);
  return (
  // Flat #f5f6fa = the figure crop's background after video encoding (C.bg is one shade lighter), so its edges don't show.
  <AbsoluteFill style={{ background: '#f5f6fa', fontFamily: ZH_FONT, color: C.ink }}>
    <AbsoluteFill style={{ alignItems: 'center', padding: wide ? '60px 70px 50px' : '110px 30px 90px', gap: wide ? 28 : 44 }}>
      <div style={{ background: C.violet, color: '#fff', borderRadius: 999, padding: '12px 36px', fontSize: wide ? 44 : 50, fontWeight: 800 }}>{chip}</div>
      <div style={{ textAlign: 'center', fontSize: wide ? 100 : 104, fontWeight: 900, lineHeight: 1.22 }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <BrandMark size={wide ? 64 : 76} />
    </AbsoluteFill>
  </AbsoluteFill>
  );
};

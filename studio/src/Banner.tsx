import { AbsoluteFill } from 'remotion';
import { BrandMark } from './lib/Brand';
import { NUNITO } from './lib/fonts';
import { C } from './lib/theme';

// YouTube channel banner, 2560×1440. Everything that must be read sits in the centre 1546×423 (shown on every device);
// the rest is decoration that TVs / desktops crop in or out.
const GLYPHS: [string, number, number, number, number][] = [
  ['π', 260, 330, 150, -12], ['√2', 2160, 300, 130, 10], ['△', 420, 1050, 140, 8], ['½', 2280, 1080, 140, -8],
  ['x²', 700, 230, 110, 6], ['∠', 1900, 1180, 120, -6], ['7', 140, 760, 120, 0], ['+', 2430, 700, 120, 0],
];

export const Banner: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #ffffff 0%, ${C.bg} 55%, #ece9ff 100%)`, fontFamily: NUNITO }}>
    <AbsoluteFill style={{ backgroundImage: 'radial-gradient(#d9dcf0 3px, transparent 3.5px)', backgroundSize: '56px 56px', opacity: 0.6 }} />
    {GLYPHS.map(([g, x, y, s, r]) => (
      <div key={g} style={{ position: 'absolute', left: x, top: y, fontSize: s, fontWeight: 900, color: r % 4 ? '#c9bfff' : '#a7e9cf', transform: `rotate(${r}deg)` }}>{g}</div>
    ))}
    <div style={{ position: 'absolute', left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <BrandMark size={168} />
      <div style={{ fontSize: 62, fontWeight: 800, color: C.ink, marginTop: 44 }}>Your family AI Coach</div>
    </div>
  </AbsoluteFill>
);

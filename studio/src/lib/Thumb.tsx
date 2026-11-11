import { AbsoluteFill } from 'remotion';
import { BrandMark } from './Brand';
import { NUNITO } from './fonts';
import { C } from './theme';

// YouTube thumbnail frame, 1280×720 (registered as `<slug>-thumb` when a video's Composition.tsx exports `Thumb`).
// Left: contest chip + a 2–5 word hook (the trap or the question in a few words). Right: the video's own figure, big.
// Read at phone size (~160 px wide): no captions, no paragraph text, no choice row, never the answer.
export const ThumbFrame: React.FC<{ chip: string; lines: React.ReactNode[]; children: React.ReactNode }> = ({ chip, lines, children }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: NUNITO, color: C.ink, flexDirection: 'row' }}>
    <div style={{ width: 560, padding: '56px 0 48px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ alignSelf: 'flex-start', background: C.violet, color: '#fff', borderRadius: 999, padding: '10px 30px', fontSize: 40, fontWeight: 800 }}>{chip}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 96, fontWeight: 900, lineHeight: 1.08 }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <BrandMark size={52} />
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>{children}</div>
  </AbsoluteFill>
);

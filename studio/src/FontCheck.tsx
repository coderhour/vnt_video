import { AbsoluteFill } from 'remotion';
import { Tex } from './lib/Tex';
import { NUNITO } from './lib/fonts';

export const FontCheck: React.FC = () => (
  <AbsoluteFill style={{ background: '#fff', fontFamily: NUNITO, alignItems: 'center', justifyContent: 'center', gap: 40, color: '#333' }}>
    <div style={{ fontSize: 72, fontWeight: 800 }}>Nunito: How many squares?</div>
    <Tex tex="\dfrac{2^{10}+2^{9}}{2^{9}-2^{8}} = 6 \quad \sqrt{x^2+y^2}" size={96} />
  </AbsoluteFill>
);

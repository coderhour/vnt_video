import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { loadFont as loadPacifico } from '@remotion/google-fonts/Pacifico';

export const { fontFamily: NUNITO } = loadNunito('normal', { weights: ['400', '600', '700', '800', '900'], subsets: ['latin'] });
// Pacifico is for the "Vantee" wordmark only (DESIGN.md), never body text.
export const { fontFamily: PACIFICO } = loadPacifico('normal', { weights: ['400'], subsets: ['latin'] });
// Chinese: Nunito for Latin and digits, the system's Noto Sans CJK SC for hanzi (installed here; the Google Fonts
// NotoSansSC package loads ~100 files per render). ponytail: renders need this machine's font, bundle it if renders move.
export const ZH_FONT = `${NUNITO}, "Noto Sans CJK SC", sans-serif`;

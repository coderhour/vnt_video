import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { loadFont as loadPacifico } from '@remotion/google-fonts/Pacifico';

export const { fontFamily: NUNITO } = loadNunito('normal', { weights: ['400', '600', '700', '800', '900'], subsets: ['latin'] });
// Pacifico is for the "Vantee" wordmark only (DESIGN.md), never body text.
export const { fontFamily: PACIFICO } = loadPacifico('normal', { weights: ['400'], subsets: ['latin'] });

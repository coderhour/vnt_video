import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useMemo } from 'react';

/** Inline/display LaTeX via KaTeX. `size` is the font size in px. */
export const Tex: React.FC<{ tex: string; size?: number; color?: string; display?: boolean }> = ({
  tex,
  size = 56,
  color = 'inherit',
  display = false,
}) => {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: display, throwOnError: true }), [tex, display]);
  return <span style={{ fontSize: size, color }} dangerouslySetInnerHTML={{ __html: html }} />;
};

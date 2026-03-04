import { Marked } from 'marked';
import katex from 'katex';

const marked = new Marked();

const DISPLAY_MATH = /\$\$([^$]+?)\$\$/g;
const INLINE_MATH = /\$([^$\n]+?)\$/g;

function renderLatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false });
  } catch {
    return `<code>${tex}</code>`;
  }
}

export function renderMarkdown(md: string): string {
  // Protect code blocks from LaTeX processing
  const codeBlocks: string[] = [];
  let processed = md.replace(/```[\s\S]*?```|`[^`]+`/g, (match) => {
    codeBlocks.push(match);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  // Render display math first, then inline
  processed = processed.replace(DISPLAY_MATH, (_, tex) => renderLatex(tex.trim(), true));
  processed = processed.replace(INLINE_MATH, (_, tex) => renderLatex(tex.trim(), false));

  // Restore code blocks
  processed = processed.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[Number(i)]);

  return marked.parse(processed) as string;
}

export type TokenKind = 'plain' | 'string' | 'keyword' | 'number' | 'type' | 'call';

export interface CodeToken {
  text: string;
  kind: TokenKind;
}

const KEYWORDS = 'export|class|constructor|private|readonly|async|try|catch|const|return|await|throw|new|this|string';
const KEYWORD = new RegExp(`^(?:${KEYWORDS})$`);
const SPLIT = new RegExp("(`[^`]*`|'[^']*'|\\b(?:" + KEYWORDS + ')\\b|\\b\\d+\\b|\\b[a-z]\\w*(?=\\()|\\b[A-Z][a-z]\\w*\\b)');

// split() puts what the pattern caught at the odd places
const toKind = (text: string, at: number): TokenKind => {
  if (at % 2 === 0) return 'plain';
  if (/^[`']/.test(text)) return 'string';
  if (KEYWORD.test(text)) return 'keyword';
  if (/^\d/.test(text)) return 'number';
  return /^[A-Z]/.test(text) ? 'type' : 'call';
};

/** One line of TypeScript cut into the pieces the showcase colors. */
export const toCodeTokens = (line: string): CodeToken[] =>
  line
    .split(SPLIT)
    .map((text, at) => ({ text, kind: toKind(text, at) }))
    .filter((it) => it.text !== '');

export type CodeLanguage = 'yaml' | 'http' | 'shell' | 'sql';

const KEYWORDS: Record<CodeLanguage, RegExp> = {
  yaml: /^$/,
  http: /\b(GET|POST|PUT|PATCH|DELETE|import|from|function|return|const)\b/,
  shell: /^(opsbuf|pnpm|cargo)\b/,
  sql: /\b(select|from|where|group by|order by|join|on|and|count|sum|as|limit|desc)\b/i,
};

export function highlightCode(code: string, language: CodeLanguage): string {
  return code
    .split('\n')
    .map((line) => highlightLine(line, language))
    .join('\n');
}

function highlightLine(line: string, language: CodeLanguage): string {
  const commentStart = findCommentStart(line, language);
  const body = commentStart < 0 ? line : line.slice(0, commentStart);
  const comment = commentStart < 0 ? '' : line.slice(commentStart);
  const highlighted = language === 'yaml' ? highlightYaml(body) : highlightTokens(body, language);
  return comment ? `${highlighted}<span class="tok-comment">${escapeHtml(comment)}</span>` : highlighted;
}

function findCommentStart(line: string, language: CodeLanguage): number {
  const marker = language === 'sql' ? /(^|\s)--/ : language === 'http' ? /(^|\s)(#|\/\/)/ : /(^|\s)#/;
  const match = marker.exec(line);
  return match ? match.index + match[1].length : -1;
}

function highlightYaml(line: string): string {
  const match = /^(\s*-?\s*)([\w.-]+)(:)(.*)$/.exec(line);
  if (!match) return highlightValue(line);
  const [, indent, key, colon, rest] = match;
  return `${escapeHtml(indent)}<span class="tok-key">${escapeHtml(key)}</span>${colon}${highlightValue(rest)}`;
}

function highlightValue(text: string): string {
  return escapeHtml(text)
    .replace(/(\$\{[^}]+\}|\{\{[^}]+\}\})/g, '<span class="tok-var">$1</span>')
    .replace(/(&quot;[^&]*&quot;|'[^']*')/g, '<span class="tok-string">$1</span>')
    .replace(/(^|\s)(true|false|\d+[a-z]*)(?=\s|$|,|\])/g, '$1<span class="tok-number">$2</span>');
}

function highlightTokens(text: string, language: CodeLanguage): string {
  const keywords = new RegExp(KEYWORDS[language].source, KEYWORDS[language].flags + 'g');
  return highlightValue(text).replace(keywords, '<span class="tok-keyword">$&</span>');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

import { toCodeTokens } from './code-tokens';

describe('toCodeTokens', () => {
  it('colors keywords, calls, types and strings', () => {
    expect(toCodeTokens("throw new TimeoutError('late');")).toEqual([
      { text: 'throw', kind: 'keyword' },
      { text: ' ', kind: 'plain' },
      { text: 'new', kind: 'keyword' },
      { text: ' ', kind: 'plain' },
      { text: 'TimeoutError', kind: 'type' },
      { text: '(', kind: 'plain' },
      { text: "'late'", kind: 'string' },
      { text: ');', kind: 'plain' },
    ]);
  });

  it('colors a call and a number, and leaves a constant plain', () => {
    expect(toCodeTokens('wait(TIMEOUT_MS, 5000)')).toEqual([
      { text: 'wait', kind: 'call' },
      { text: '(TIMEOUT_MS, ', kind: 'plain' },
      { text: '5000', kind: 'number' },
      { text: ')', kind: 'plain' },
    ]);
  });

  it('keeps a template string in one piece', () => {
    expect(toCodeTokens('`timeout (${TIMEOUT_MS} ms)`')).toEqual([{ text: '`timeout (${TIMEOUT_MS} ms)`', kind: 'string' }]);
  });

  it('keeps the indent of a line', () => {
    expect(toCodeTokens('  try {')).toEqual([
      { text: '  ', kind: 'plain' },
      { text: 'try', kind: 'keyword' },
      { text: ' {', kind: 'plain' },
    ]);
  });
});

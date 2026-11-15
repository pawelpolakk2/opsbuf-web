import { highlightCode } from './highlight';

describe('highlightCode', () => {
  it('should escape html before adding token spans', () => {
    const html = highlightCode('name: <script>', 'yaml');

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('should mark yaml keys, keychain variables and comments', () => {
    const html = highlightCode('password: ${keychain:orders}   # never in git', 'yaml');

    expect(html).toContain('<span class="tok-key">password</span>');
    expect(html).toContain('<span class="tok-var">${keychain:orders}</span>');
    expect(html).toContain('<span class="tok-comment"># never in git</span>');
  });

  it('should keep a hash inside a quoted color out of the comment', () => {
    const html = highlightCode("color: '#7fd4a3'", 'yaml');

    expect(html).not.toContain('tok-comment');
  });
});

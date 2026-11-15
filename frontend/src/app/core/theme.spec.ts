import { TestBed } from '@angular/core/testing';
import { Theme } from './theme';

describe('Theme', () => {
  const stored = new Map<string, string>();

  beforeEach(() => {
    stored.clear();
    delete document.documentElement.dataset['theme'];
    // the test runner has no localStorage, so the window gets one that keeps values in memory
    Object.defineProperty(document.defaultView, 'localStorage', {
      configurable: true,
      value: { setItem: (key: string, value: string) => stored.set(key, value) },
    });
  });

  it('starts light when the page has no theme', () => {
    expect(TestBed.inject(Theme).name()).toBe('light');
  });

  it('starts with the theme index.html applied', () => {
    document.documentElement.dataset['theme'] = 'dark';

    expect(TestBed.inject(Theme).name()).toBe('dark');
  });

  it('switches the page to dark and remembers it', () => {
    const theme = TestBed.inject(Theme);

    theme.toggle();

    expect(theme.name()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(stored.get('opsbuf.theme')).toBe('dark');
  });
});

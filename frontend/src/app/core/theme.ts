import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'opsbuf.theme';
const PAGE_COLORS: Record<ThemeName, string> = { light: '#f5f3ee', dark: '#1c1b1a' };

/** The light or dark theme of the site. index.html applies the stored one before the first paint. */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly document = inject(DOCUMENT);
  readonly name = signal<ThemeName>(this.document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light');

  toggle(): void {
    const next: ThemeName = this.name() === 'light' ? 'dark' : 'light';
    this.name.set(next);
    this.document.documentElement.dataset['theme'] = next;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', PAGE_COLORS[next]);
    this.document.defaultView?.localStorage.setItem(STORAGE_KEY, next);
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The opsbuf mark: the app's terracotta tile with "ob" in the app icon's white strokes. */
@Component({
  selector: 'opsbuf-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="100 100 824 824" [attr.width]="size()" [attr.height]="size()">
      <defs>
        <linearGradient id="opsbuf-logo-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e08566" />
          <stop offset="1" stop-color="#c8623f" />
        </linearGradient>
      </defs>
      <rect x="100" y="100" width="824" height="824" rx="185" fill="url(#opsbuf-logo-tile)" />
      <g fill="none" stroke="#ffffff" stroke-width="64">
        <circle cx="360" cy="560" r="110" />
        <path d="M554 354V670" />
        <circle cx="664" cy="560" r="110" />
      </g>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
})
export class Logo {
  readonly size = input(24);
}

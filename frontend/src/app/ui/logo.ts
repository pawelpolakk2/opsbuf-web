import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The opsbuf mark, as on the app icon: a white "o" and a lavender block cursor on the indigo tile. */
@Component({
  selector: 'opsbuf-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="100 100 824 824" [attr.width]="size()" [attr.height]="size()">
      <defs>
        <linearGradient id="opsbuf-logo-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#676be0" />
          <stop offset="1" stop-color="#403cb4" />
        </linearGradient>
      </defs>
      <rect x="100" y="100" width="824" height="824" rx="185" fill="url(#opsbuf-logo-tile)" />
      <circle cx="388" cy="530" r="123" fill="none" stroke="#ffffff" stroke-width="72" />
      <rect x="627" y="335" width="168" height="354" rx="16" fill="#c3c6ff" />
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

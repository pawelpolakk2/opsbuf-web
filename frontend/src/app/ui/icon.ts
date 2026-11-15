import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FILLED_ICONS, ICON_PATHS, IconName } from './icons';

@Component({
  selector: 'opsbuf-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="isFilled() ? 'currentColor' : 'none'"
      [attr.stroke]="isFilled() ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  readonly strokeWidth = input(1.7);

  protected readonly path = computed(() => ICON_PATHS[this.name()]);
  protected readonly isFilled = computed(() => FILLED_ICONS.has(this.name()));
}

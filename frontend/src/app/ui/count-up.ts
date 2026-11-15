import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { formatAmount } from './format';

const DURATION_MS = 900;

/** Counts the element's text up to the target once it is rendered; shows the target at once when motion is reduced. */
@Directive({ selector: '[opsbufCountUp]' })
export class CountUp {
  readonly target = input.required<number>({ alias: 'opsbufCountUp' });
  readonly decimals = input(0);
  readonly delayMs = input(0);
  readonly separator = input(' ');

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const showValue = (value: number) => (element.textContent = formatAmount(value, this.decimals(), this.separator()));
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showValue(this.target());
        return;
      }
      showValue(0);
      let frame = 0;
      const startedAt = performance.now() + this.delayMs();
      const showNextFrame = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - startedAt) / DURATION_MS));
        showValue(this.target() * easeOut(progress));
        if (progress < 1) frame = requestAnimationFrame(showNextFrame);
      };
      frame = requestAnimationFrame(showNextFrame);
      destroyRef.onDestroy(() => cancelAnimationFrame(frame));
    });
  }
}

function easeOut(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

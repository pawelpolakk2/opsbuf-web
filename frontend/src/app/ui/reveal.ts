import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ptxReveal]',
  host: { class: 'reveal' },
})
export class Reveal {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => entries.filter((it) => it.isIntersecting).forEach((it) => showElement(it.target, observer)),
        { threshold: 0.12 },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

function showElement(element: Element, observer: IntersectionObserver): void {
  element.classList.add('visible');
  observer.unobserve(element);
}

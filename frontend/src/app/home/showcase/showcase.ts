import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { Icon } from '../../ui/icon';
import { Logo } from '../../ui/logo';
import { ClusterScene } from './cluster-scene';
import { KeysScene } from './keys-scene';
import { LogsScene } from './logs-scene';
import { ScriptScene } from './script-scene';
import { ENVIRONMENTS, EnvironmentKey, RAIL_MODULES, RailModule, SCENES, SOURCE_FILE, SourceFile } from './showcase-content';

/** The hero animation: the opsbuf window playing one incident through Logs, Kubernetes, Redis and Scripts. */
@Component({
  selector: 'opsbuf-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Logo, LogsScene, ClusterScene, KeysScene, ScriptScene],
  templateUrl: './showcase.html',
  styleUrl: './showcase.scss',
  host: {
    '[class.paused]': 'isPaused()',
    '(pointerenter)': 'pauseOnMouse($event)',
    '(pointerleave)': 'isHovered.set(false)',
  },
})
export class Showcase {
  protected readonly scenes = SCENES;
  protected readonly environments = ENVIRONMENTS;
  protected readonly railModules = RAIL_MODULES;

  private readonly sceneIndex = signal(0);
  private readonly environmentKey = signal<EnvironmentKey>('dev');
  protected readonly isHovered = signal(false);
  private readonly isOnScreen = signal(true);

  protected readonly scene = computed(() => SCENES[this.sceneIndex()]);
  protected readonly environment = computed(
    () => ENVIRONMENTS.find((it) => it.key === this.environmentKey()) ?? ENVIRONMENTS[0],
  );
  protected readonly activeModule = computed(() => this.requireModule(this.scene().moduleId));
  protected readonly isPaused = computed(() => this.isHovered() || !this.isOnScreen());
  /** The file Claude opened in the current scene; a new scene starts without it. */
  protected readonly openedFile = linkedSignal<number, SourceFile | null>({
    source: this.sceneIndex,
    computation: () => null,
  });

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) => this.isOnScreen.set(entry.isIntersecting));
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected selectScene(index: number): void {
    this.sceneIndex.set(index);
  }

  protected showNextScene(): void {
    this.sceneIndex.update((it) => (it + 1) % SCENES.length);
  }

  protected selectModule(moduleId: string): void {
    const index = SCENES.findIndex((it) => it.moduleId === moduleId);
    if (index >= 0) this.sceneIndex.set(index);
  }

  protected showSourceFile(): void {
    this.openedFile.set(SOURCE_FILE);
  }

  protected selectEnvironment(key: EnvironmentKey): void {
    this.environmentKey.set(key);
  }

  protected hasScene(moduleId: string): boolean {
    return SCENES.some((it) => it.moduleId === moduleId);
  }

  protected requireModule(moduleId: string): RailModule {
    const module = RAIL_MODULES.find((it) => it.id === moduleId);
    if (!module) throw new Error(`The showcase has no module "${moduleId}".`);
    return module;
  }

  // a touch never leaves, so only a mouse pauses the tour
  protected pauseOnMouse(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this.isHovered.set(true);
  }
}

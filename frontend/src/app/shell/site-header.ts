import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Session } from '../core/session';
import { Theme } from '../core/theme';
import { Icon } from '../ui/icon';
import { Logo } from '../ui/logo';

@Component({
  selector: 'opsbuf-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Logo],
  host: { '(window:scroll)': 'updateScrolled()' },
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="page bar">
        <a class="brand" routerLink="/" (click)="closeMenu()">
          <opsbuf-logo [size]="28" />
          <span>opsbuf</span>
        </a>
        <nav [class.open]="isMenuOpen()">
          <a routerLink="/" fragment="features" (click)="closeMenu()">Features</a>
          <a routerLink="/" fragment="modules" (click)="closeMenu()">Modules</a>
          <a routerLink="/" fragment="workflow" (click)="closeMenu()">Workflow</a>
          <a routerLink="/" fragment="security" (click)="closeMenu()">Security</a>
          <a routerLink="/" fragment="pricing" (click)="closeMenu()">Pricing</a>
          <a routerLink="/" fragment="faq" (click)="closeMenu()">FAQ</a>
          <span class="actions">
            <button
              class="theme"
              type="button"
              [attr.aria-label]="theme.name() === 'light' ? 'Switch to the dark theme' : 'Switch to the light theme'"
              [title]="theme.name() === 'light' ? 'Dark theme' : 'Light theme'"
              (click)="theme.toggle()"
            >
              <opsbuf-icon [name]="theme.name() === 'light' ? 'moon' : 'sun'" [size]="17" />
            </button>
            @if (session.isSignedIn()) {
              <a class="button small ghost" routerLink="/account" (click)="closeMenu()">
                <opsbuf-icon name="lock" [size]="15" /> Licenses
              </a>
              <button class="button small ghost" type="button" (click)="logout()">Sign out</button>
            } @else {
              <a class="button small ghost" routerLink="/login" (click)="closeMenu()">Sign in</a>
            }
            <a class="button small primary" routerLink="/" fragment="pricing" (click)="closeMenu()">
              Get opsbuf
            </a>
          </span>
        </nav>
        <button class="menu" type="button" aria-label="Menu" (click)="toggleMenu()">
          <opsbuf-icon [name]="isMenuOpen() ? 'close' : 'logs'" />
        </button>
      </div>
    </header>
  `,
  styles: `
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid transparent;
      transition:
        background 0.2s,
        border-color 0.2s;
    }

    header.scrolled {
      background: color-mix(in srgb, var(--bg) 86%, transparent);
      backdrop-filter: blur(14px) saturate(1.4);
      border-bottom-color: var(--border-soft);
    }

    .bar {
      height: 68px;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--fg);
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.03em;
    }

    nav {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 26px;
      margin-left: 22px;
    }

    nav > a {
      color: var(--fg-muted);
      font-size: 15px;
    }

    nav > a:hover {
      color: var(--fg);
    }

    .actions {
      margin-left: auto;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .theme {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: var(--fg-muted);
      cursor: pointer;
    }

    .theme:hover {
      border-color: var(--border);
      background: var(--hover);
      color: var(--fg);
    }

    .menu {
      display: none;
      margin-left: auto;
      background: none;
      border: 0;
      color: var(--fg);
      padding: 8px;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .menu {
        display: inline-flex;
      }

      nav {
        display: none;
        position: absolute;
        top: 68px;
        left: 0;
        right: 0;
        margin: 0;
        padding: 20px 16px 24px;
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        background: var(--bg);
        border-bottom: 1px solid var(--border-soft);
      }

      nav.open {
        display: flex;
      }

      .actions {
        margin: 8px 0 0;
        flex-wrap: wrap;
      }
    }
  `,
})
export class SiteHeader {
  protected readonly session = inject(Session);
  protected readonly theme = inject(Theme);
  private readonly router = inject(Router);
  protected readonly isScrolled = signal(false);
  protected readonly isMenuOpen = signal(false);

  protected updateScrolled(): void {
    this.isScrolled.set(window.scrollY > 8);
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((it) => !it);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected async logout(): Promise<void> {
    this.closeMenu();
    await this.session.logout();
    await this.router.navigateByUrl('/');
  }
}

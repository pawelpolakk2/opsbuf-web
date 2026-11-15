import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Session } from '../core/session';
import { Icon } from '../ui/icon';

@Component({
  selector: 'ptx-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  host: { '(window:scroll)': 'updateScrolled()' },
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="page bar">
        <a class="brand" routerLink="/" (click)="closeMenu()">
          <span class="logo"><ptx-icon name="toolbox" [size]="18" [strokeWidth]="2" /></span>
          <span>PTX</span>
          <span class="version">rust</span>
        </a>
        <nav [class.open]="isMenuOpen()">
          <a routerLink="/" fragment="modules" (click)="closeMenu()">Modules</a>
          <a routerLink="/" fragment="workflow" (click)="closeMenu()">Workflow</a>
          <a routerLink="/" fragment="security" (click)="closeMenu()">Security</a>
          <a routerLink="/" fragment="pricing" (click)="closeMenu()">Pricing</a>
          <a routerLink="/" fragment="faq" (click)="closeMenu()">FAQ</a>
          <span class="actions">
            @if (session.isSignedIn()) {
              <a class="button small ghost" routerLink="/account" (click)="closeMenu()">
                <ptx-icon name="lock" [size]="15" /> Licenses
              </a>
              <button class="button small ghost" type="button" (click)="logout()">Sign out</button>
            } @else {
              <a class="button small ghost" routerLink="/login" (click)="closeMenu()">Sign in</a>
            }
            <a class="button small primary" routerLink="/" fragment="pricing" (click)="closeMenu()">
              Buy PTX
            </a>
          </span>
        </nav>
        <button class="menu" type="button" aria-label="Menu" (click)="toggleMenu()">
          <ptx-icon [name]="isMenuOpen() ? 'close' : 'logs'" />
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
      background: rgba(28, 27, 26, 0.82);
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
      letter-spacing: 0.02em;
    }

    .logo {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: var(--accent);
      color: #1a1312;
    }

    .version {
      font: 500 11px var(--mono);
      color: var(--fg-dim);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 1px 6px;
    }

    nav {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 26px;
      margin-left: 18px;
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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../ui/icon';

@Component({
  selector: 'opsbuf-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <footer>
      <div class="page grid">
        <div class="about">
          <a class="brand" routerLink="/">
            <span class="logo"><opsbuf-icon name="toolbox" [size]="16" [strokeWidth]="2" /></span> opsbuf
          </a>
          <p>The programmer's toolbox. One native workbench for every system you touch, defined in git.</p>
        </div>
        <div>
          <h4>Product</h4>
          <a routerLink="/" fragment="modules">Modules</a>
          <a routerLink="/" fragment="workflow">Workflow</a>
          <a routerLink="/" fragment="pricing">Pricing</a>
        </div>
        <div>
          <h4>Account</h4>
          <a routerLink="/login">Sign in</a>
          <a routerLink="/account">Licenses</a>
          <a routerLink="/" fragment="faq">FAQ</a>
        </div>
      </div>
      <div class="page legal">
        <span>© {{ year }} opsbuf</span>
        <span>Rust core · Tauri 2 · Angular</span>
      </div>
    </footer>
  `,
  styles: `
    footer {
      border-top: 1px solid var(--border-soft);
      background: var(--rail);
      padding: 56px 0 28px;
      margin-top: 40px;
    }

    .grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 32px;
    }

    .grid > div {
      display: grid;
      gap: 10px;
      align-content: start;
    }

    h4 {
      font-size: 13px;
      color: var(--fg);
      margin-bottom: 4px;
    }

    a {
      color: var(--fg-dim);
      font-size: 14px;
    }

    .about p {
      color: var(--fg-dim);
      font-size: 14px;
      max-width: 340px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--fg);
      font-weight: 700;
      font-size: 17px;
    }

    .logo {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      border-radius: 7px;
      background: var(--accent);
      color: #1a1312;
    }

    .legal {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 44px;
      padding-top: 20px;
      border-top: 1px solid var(--border-soft);
      color: var(--fg-faint);
      font-size: 13px;
    }

    @media (max-width: 720px) {
      .grid {
        grid-template-columns: 1fr 1fr;
      }

      .about {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}

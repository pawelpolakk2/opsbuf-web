import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../ui/logo';

@Component({
  selector: 'opsbuf-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo],
  template: `
    <footer>
      <div class="page grid">
        <div class="about">
          <a class="brand" routerLink="/"><opsbuf-logo [size]="24" /> opsbuf</a>
          <p>One native workbench for the systems behind your code, defined as plain files in git.</p>
        </div>
        <div>
          <h4>Product</h4>
          <a routerLink="/" fragment="features">Features</a>
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
      letter-spacing: 0.03em;
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

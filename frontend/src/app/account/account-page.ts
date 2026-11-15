import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { License, Order } from '../core/models';
import { OpsbufApi } from '../core/opsbuf-api';
import { Session } from '../core/session';
import { formatDate, formatPrice } from '../ui/format';
import { Icon } from '../ui/icon';
import { LicenseCard } from './license-card';

const DOWNLOAD_URL = 'https://github.com/pawelpolakk2/opsbuf-app/releases/latest';

@Component({
  selector: 'opsbuf-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, LicenseCard],
  template: `
    <div class="page wrap">
      <header>
        <div>
          <span class="eyebrow">Account</span>
          <h1>Your licenses</h1>
          <p class="lead">Signed in as {{ session.user()?.email }}</p>
        </div>
        <a class="button" [href]="downloadUrl" target="_blank" rel="noopener">
          <opsbuf-icon name="import" [size]="16" /> Download for macOS
        </a>
      </header>

      @if (boughtId) {
        <p class="notice ok">
          Thank you. Your license is ready: copy the key below and paste it into opsbuf.
        </p>
      }

      @if (licenses.error()) {
        <p class="notice error">The licenses cannot be loaded right now.</p>
      }

      <div class="licenses">
        @for (license of licenses.value() ?? []; track license.id) {
          <opsbuf-license-card [license]="license" [isHighlighted]="license.id === boughtId" (changed)="replaceLicense($event)" />
        } @empty {
          @if (!licenses.isLoading()) {
            <div class="card empty">
              <span class="empty-icon"><opsbuf-icon name="toolbox" [size]="26" /></span>
              <h2>No license yet</h2>
              <p>Pick a plan and your key shows up here right after the payment.</p>
              <a class="button primary" routerLink="/" fragment="pricing">See the plans</a>
            </div>
          }
        }
      </div>

      @if ((orders.value() ?? []).length > 0) {
        <section class="orders card">
          <h2>Payments</h2>
          <div class="table">
            <table>
              <thead>
                <tr><th>Date</th><th>Plan</th><th>Seats</th><th>Billing</th><th class="amount">Amount</th><th>Reference</th></tr>
              </thead>
              <tbody>
                @for (order of orders.value(); track order.id) {
                  <tr>
                    <td>{{ formatDate(order.paidAt) }}</td>
                    <td>{{ describePlan(order) }}</td>
                    <td>{{ order.seats }}</td>
                    <td>{{ order.billing === 'YEARLY' ? 'Yearly' : 'Monthly' }}</td>
                    <td class="amount">{{ formatAmount(order) }}</td>
                    <td><code>{{ order.paymentReference }}</code></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styleUrl: './account-page.scss',
})
export class AccountPage {
  private readonly api = inject(OpsbufApi);
  private readonly route = inject(ActivatedRoute);
  protected readonly session = inject(Session);
  protected readonly downloadUrl = DOWNLOAD_URL;

  protected readonly licenses = resource({ loader: () => this.api.listLicenses() });
  protected readonly orders = resource({ loader: () => this.api.listOrders() });
  protected readonly boughtId = this.route.snapshot.queryParamMap.get('bought');

  protected replaceLicense(changed: License): void {
    this.licenses.update((current) => current?.map((it) => (it.id === changed.id ? changed : it)));
  }

  protected formatDate(epochMillis: number): string {
    return formatDate(epochMillis);
  }

  protected formatAmount(order: Order): string {
    return formatPrice(order.amountCents, order.currency);
  }

  protected describePlan(order: Order): string {
    return order.planId === 'team' ? 'Team' : 'Personal';
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CountUp } from '../../ui/count-up';
import { Icon } from '../../ui/icon';
import { EnvironmentKey } from './showcase-content';

interface TenantRefund {
  tenant: string;
  amount: number;
}

interface ReportCheck {
  label: string;
  detail: string;
  state: 'pass' | 'warn';
}

const REPORT_AT_MS = 2700;

const PRESETS = ['Defaults', 'last-day-eur', 'last-month'];
const RANGES = ['1h', '24h', '7d', '30d', 'today'];

const REFUNDS: TenantRefund[] = [
  { tenant: 'Krakow Coffee Roasters', amount: 2218.8 },
  { tenant: 'Vistula Bikes', amount: 2218.8 },
  { tenant: 'Amber Jewelry', amount: 2180.6 },
  { tenant: 'Polar Outfitters', amount: 2130.5 },
  { tenant: 'Lumen Pharma', amount: 958.1 },
  { tenant: 'Nordic Foods', amount: 625.7 },
  { tenant: 'Acme Retail', amount: 542.1 },
];
const TOP_REFUND = Math.max(...REFUNDS.map((it) => it.amount));

const CHECKS: ReportCheck[] = [
  { label: 'Every payment has a tenant', detail: '13 of 13', state: 'pass' },
  { label: 'Fee kept below 5 %', detail: '2.5 %', state: 'pass' },
  { label: 'FX rates are from today', detail: 'rates of 31 Oct', state: 'warn' },
];

@Component({
  selector: 'opsbuf-script-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, CountUp],
  template: `
    <div class="form">
      <div class="form-head">
        <span class="title">Refund estimate</span>
        <span class="spacer"></span>
        <span class="runs-on"><i></i> runs on {{ environmentKey() }}</span>
      </div>
      <p class="description">
        Sums failed payments per tenant and what to refund after the fee.
        <span class="mono">uses orders_db</span>
      </p>
      <div class="field">
        <span class="label">Presets</span>
        @for (preset of presets; track preset) {
          <span class="preset" [class.active]="$first">{{ preset }}</span>
        }
      </div>
      <div class="field since">
        <span class="label">Failed since</span>
        <span class="input mono">now-7d</span>
        <span class="range-group mono">
          @for (range of ranges; track range) {
            <span [class.active]="range === '7d'">{{ range }}</span>
          }
        </span>
      </div>
    </div>
    <div class="run-bar">
      <span class="run"><opsbuf-icon name="play" [size]="11" /> Run <kbd>⌘↵</kbd></span>
      <span class="command mono">opsbuf script run scripts/refund-estimate.ts --env {{ environmentKey() }}</span>
      <span class="spacer"></span>
      <span class="state">
        <span class="running">Reading failed payments… <i class="track"><i></i></i></span>
        <span class="done">✓ Done · run #3 · 0.2 s</span>
      </span>
    </div>
    <div class="report">
      <div class="card metric" style="--i: 0">
        <span class="metric-label">To refund</span>
        <span class="metric-value">
          <span [opsbufCountUp]="10874.59" [decimals]="2" [delayMs]="reportAtMs"></span>
          <small>PLN</small>
        </span>
      </div>
      <div class="card metric" style="--i: 1">
        <span class="metric-label">Failed payments</span>
        <span class="metric-value"><span [opsbufCountUp]="13" [delayMs]="reportAtMs"></span></span>
      </div>
      <div class="card metric" style="--i: 2">
        <span class="metric-label">Tenants hit</span>
        <span class="metric-value">
          <span [opsbufCountUp]="7" [delayMs]="reportAtMs"></span>
          <small>of 10</small>
        </span>
      </div>
      <div class="card chart" style="--i: 3">
        <span class="card-title">Refund by tenant</span>
        @for (refund of refunds; track refund.tenant) {
          <div class="bar-row" [style.--i]="$index">
            <span class="bar-label">{{ refund.tenant }}</span>
            <span class="bar-track"><i [style.width.%]="shareOfTop(refund)"></i></span>
            <span class="bar-value">{{ refund.amount.toFixed(1) }}</span>
          </div>
        }
      </div>
      <div class="card checks" style="--i: 4">
        <span class="card-title">Checks</span>
        @for (check of checks; track check.label) {
          <div class="check" [class]="check.state">
            <span class="check-icon">{{ check.state === 'pass' ? '✓' : '!' }}</span>
            <span class="check-text">
              <span>{{ check.label }}</span>
              <span class="check-detail">{{ check.detail }}</span>
            </span>
            <span class="check-state">{{ check.state === 'pass' ? 'PASS' : 'WARN' }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './script-scene.scss',
})
export class ScriptScene {
  readonly environmentKey = input.required<EnvironmentKey>();

  protected readonly presets = PRESETS;
  protected readonly ranges = RANGES;
  protected readonly refunds = REFUNDS;
  protected readonly checks = CHECKS;
  protected readonly reportAtMs = REPORT_AT_MS;

  protected shareOfTop(refund: TenantRefund): number {
    return (refund.amount / TOP_REFUND) * 100;
  }
}

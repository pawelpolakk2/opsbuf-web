import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Billing, Plan } from '../core/models';
import { ApiFailure, PtxApi } from '../core/ptx-api';
import { Session } from '../core/session';
import { formatPrice } from '../ui/format';
import { Icon } from '../ui/icon';

@Component({
  selector: 'ptx-checkout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="page wrap">
      <a class="back" routerLink="/" fragment="pricing"><ptx-icon name="undo" [size]="15" /> Back to pricing</a>
      @if (plan(); as plan) {
        <div class="layout">
          <section class="card form">
            <h1>Buy PTX {{ plan.name }}</h1>
            <p class="lead">{{ plan.tagline }}</p>

            <h2>Billing</h2>
            <div class="options">
              <button type="button" class="option" [class.active]="billing() === 'YEARLY'" (click)="billing.set('YEARLY')">
                <strong>Yearly</strong>
                <span>{{ format(plan.yearlyCents, plan) }} per seat · 2 months free</span>
              </button>
              <button type="button" class="option" [class.active]="billing() === 'MONTHLY'" (click)="billing.set('MONTHLY')">
                <strong>Monthly</strong>
                <span>{{ format(plan.monthlyCents, plan) }} per seat</span>
              </button>
            </div>

            @if (plan.maxSeats > 1) {
              <h2>Seats</h2>
              <div class="seats">
                <div class="stepper">
                  <button type="button" aria-label="Fewer seats" (click)="changeSeats(plan, -1)">−</button>
                  <output>{{ seats() }}</output>
                  <button type="button" aria-label="More seats" (click)="changeSeats(plan, 1)">+</button>
                </div>
                <span>{{ seats() * plan.devicesPerSeat }} machines · seats assigned by email</span>
              </div>
            }

            <h2>Account</h2>
            <p class="account"><ptx-icon name="check" [size]="15" /> {{ session.user()?.email }}</p>
          </section>

          <aside class="card summary">
            <h2>Summary</h2>
            <dl>
              <div><dt>Plan</dt><dd>{{ plan.name }}</dd></div>
              <div><dt>Seats</dt><dd>{{ seats() }}</dd></div>
              <div><dt>Machines</dt><dd>{{ seats() * plan.devicesPerSeat }}</dd></div>
              <div><dt>Renews</dt><dd>{{ billing() === 'YEARLY' ? 'every year' : 'every month' }}</dd></div>
            </dl>
            <div class="total">
              <span>Total today</span>
              <strong>{{ total() }}</strong>
            </div>
            @if (error()) {
              <p class="notice error">{{ error() }}</p>
            }
            <button class="button primary" type="button" [disabled]="isBusy()" (click)="pay(plan)">
              <ptx-icon name="lock" [size]="15" /> {{ isBusy() ? 'Paying…' : 'Pay ' + total() }}
            </button>
            <p class="demo">Demo checkout: no card is charged. The payment gateway plugs into the backend.</p>
          </aside>
        </div>
      } @else if (plans.isLoading()) {
        <p class="loading">Loading the plan…</p>
      } @else {
        <p class="notice error">There is no such plan.</p>
      }
    </div>
  `,
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  private readonly api = inject(PtxApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly session = inject(Session);

  private readonly planId = this.route.snapshot.paramMap.get('planId');
  protected readonly plans = resource({ loader: () => this.api.listPlans() });
  protected readonly plan = computed(() => this.plans.value()?.find((it) => it.id === this.planId));
  protected readonly billing = signal<Billing>(readBilling(this.route.snapshot.queryParamMap.get('billing')));
  private readonly requestedSeats = signal(Number(this.route.snapshot.queryParamMap.get('seats') ?? 1));
  protected readonly seats = computed(() => clampSeats(this.plan(), this.requestedSeats()));
  protected readonly total = computed(() => {
    const plan = this.plan();
    if (!plan) return '';
    const cents = this.billing() === 'YEARLY' ? plan.yearlyCents : plan.monthlyCents;
    return formatPrice(cents * this.seats(), plan.currency);
  });
  protected readonly isBusy = signal(false);
  protected readonly error = signal<string | undefined>(undefined);

  protected format(cents: number, plan: Plan): string {
    return formatPrice(cents, plan.currency);
  }

  protected changeSeats(plan: Plan, delta: number): void {
    this.requestedSeats.set(clampSeats(plan, this.seats() + delta));
  }

  protected async pay(plan: Plan): Promise<void> {
    this.isBusy.set(true);
    this.error.set(undefined);
    try {
      const license = await this.api.purchase(plan.id, this.seats(), this.billing());
      await this.router.navigate(['/account'], { queryParams: { bought: license.id } });
    } catch (error) {
      this.error.set(error instanceof ApiFailure ? error.message : 'The payment failed. Try again.');
    } finally {
      this.isBusy.set(false);
    }
  }
}

function readBilling(value: string | null): Billing {
  return value === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';
}

function clampSeats(plan: Plan | undefined, seats: number): number {
  if (!plan) return 1;
  const whole = Number.isFinite(seats) ? Math.round(seats) : plan.minSeats;
  return Math.min(plan.maxSeats, Math.max(plan.minSeats, whole));
}

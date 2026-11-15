import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Billing, Plan } from '../core/models';
import { OpsbufApi } from '../core/opsbuf-api';
import { formatPrice } from '../ui/format';
import { Icon } from '../ui/icon';
import { Reveal } from '../ui/reveal';

@Component({
  selector: 'opsbuf-pricing-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Reveal],
  template: `
    <section class="section">
      <div class="page">
        <div class="head" opsbufReveal>
          <span class="eyebrow">Pricing</span>
          <h2 class="section-title">One license, every module</h2>
          <p class="section-lead">No module is extra. Pay per seat, cancel any time.</p>
          <div class="billing" role="group" aria-label="Billing period">
            <button type="button" [class.active]="billing() === 'MONTHLY'" (click)="billing.set('MONTHLY')">
              Monthly
            </button>
            <button type="button" [class.active]="billing() === 'YEARLY'" (click)="billing.set('YEARLY')">
              Yearly <span class="save">2 months free</span>
            </button>
          </div>
        </div>
        @if (plans.error()) {
          <p class="notice error">The plans cannot be loaded right now. Is the backend running?</p>
        }
        <div class="plans">
          @for (plan of plans.value() ?? []; track plan.id) {
            <article class="plan card" [class.featured]="plan.id === 'team'" opsbufReveal>
              @if (plan.id === 'team') {
                <span class="badge">Most popular</span>
              }
              <h3>{{ plan.name }}</h3>
              <p class="tagline">{{ plan.tagline }}</p>
              <div class="price">
                <strong>{{ formatMonthlyPrice(plan) }}</strong>
                <span>{{ plan.maxSeats > 1 ? '/ seat / month' : '/ month' }}</span>
              </div>
              <p class="billed">{{ describeBilling(plan) }}</p>
              @if (plan.maxSeats > 1) {
                <div class="seats">
                  <span>Seats</span>
                  <div class="stepper">
                    <button type="button" aria-label="Fewer seats" (click)="changeSeats(plan, -1)">−</button>
                    <output>{{ teamSeats() }}</output>
                    <button type="button" aria-label="More seats" (click)="changeSeats(plan, 1)">+</button>
                  </div>
                </div>
              }
              <a
                class="button"
                [class.primary]="plan.id === 'team'"
                [routerLink]="['/buy', plan.id]"
                [queryParams]="{ billing: billing(), seats: seatsFor(plan) }"
              >
                Buy {{ plan.name }}
              </a>
              <ul>
                @for (feature of plan.features; track feature) {
                  <li><opsbuf-icon name="check" [size]="15" [strokeWidth]="2.2" />{{ feature }}</li>
                }
              </ul>
            </article>
          }
          <article class="plan card" opsbufReveal>
            <h3>Enterprise</h3>
            <p class="tagline">For companies with their own rules.</p>
            <div class="price"><strong>Custom</strong></div>
            <p class="billed">From 50 seats, billed yearly</p>
            <a class="button" href="mailto:sales@example.com">Talk to us</a>
            <ul>
              <li><opsbuf-icon name="check" [size]="15" [strokeWidth]="2.2" />Everything in Team</li>
              <li><opsbuf-icon name="check" [size]="15" [strokeWidth]="2.2" />Invoice and bank transfer</li>
              <li><opsbuf-icon name="check" [size]="15" [strokeWidth]="2.2" />Offline license files</li>
              <li><opsbuf-icon name="check" [size]="15" [strokeWidth]="2.2" />Help with your first projects</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  `,
  styleUrl: './pricing-section.scss',
})
export class PricingSection {
  private readonly api = inject(OpsbufApi);
  protected readonly billing = signal<Billing>('YEARLY');
  protected readonly teamSeats = signal(5);
  protected readonly plans = resource({ loader: () => this.api.listPlans() });

  protected formatMonthlyPrice(plan: Plan): string {
    const cents = this.billing() === 'YEARLY' ? plan.yearlyCents / 12 : plan.monthlyCents;
    return formatPrice(Math.round(cents), plan.currency);
  }

  protected describeBilling(plan: Plan): string {
    const seats = this.seatsFor(plan);
    if (this.billing() === 'MONTHLY') return `${formatPrice(plan.monthlyCents * seats, plan.currency)} billed monthly`;
    return `${formatPrice(plan.yearlyCents * seats, plan.currency)} billed yearly`;
  }

  protected seatsFor(plan: Plan): number {
    return plan.maxSeats > 1 ? this.teamSeats() : plan.minSeats;
  }

  protected changeSeats(plan: Plan, delta: number): void {
    this.teamSeats.update((it) => Math.min(plan.maxSeats, Math.max(plan.minSeats, it + delta)));
  }
}

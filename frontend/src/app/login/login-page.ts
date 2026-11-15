import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiFailure, OpsbufApi } from '../core/opsbuf-api';
import { Session } from '../core/session';
import { Icon } from '../ui/icon';

type LoginStep = 'email' | 'code';

@Component({
  selector: 'opsbuf-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon],
  template: `
    <div class="page wrap">
      <div class="card box">
        <span class="logo"><opsbuf-icon name="lock" [size]="22" /></span>
        @if (step() === 'email') {
          <h1>Sign in to opsbuf</h1>
          <p class="lead">We send a 6-digit code to your email. No password to remember.</p>
          <form (ngSubmit)="sendCode()">
            <div class="field">
              <label for="email">Email</label>
              <input
                id="email"
                class="input"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="you@company.com"
                required
                [ngModel]="email()"
                (ngModelChange)="email.set($event)"
              />
            </div>
            @if (error()) {
              <p class="notice error">{{ error() }}</p>
            }
            <button class="button primary" type="submit" [disabled]="isBusy()">
              {{ isBusy() ? 'Sending…' : 'Send me a code' }}
            </button>
          </form>
        } @else {
          <h1>Check your email</h1>
          <p class="lead">
            We sent a code to <strong>{{ email() }}</strong>. It is valid for 10 minutes.
          </p>
          @if (devCode()) {
            <p class="notice ok">Dev mode: your code is <code>{{ devCode() }}</code></p>
          }
          <form (ngSubmit)="verifyCode()">
            <div class="field">
              <label for="code">Code</label>
              <input
                #codeInput
                id="code"
                class="input code-input"
                name="code"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="••••••"
                required
                [ngModel]="code()"
                (ngModelChange)="code.set($event)"
              />
            </div>
            @if (error()) {
              <p class="notice error">{{ error() }}</p>
            }
            <button class="button primary" type="submit" [disabled]="isBusy()">
              {{ isBusy() ? 'Checking…' : 'Sign in' }}
            </button>
          </form>
          <div class="links">
            <button type="button" (click)="changeEmail()">Use another email</button>
            <button type="button" [disabled]="isBusy()" (click)="sendCode()">Send a new code</button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly api = inject(OpsbufApi);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly codeInput = viewChild<ElementRef<HTMLInputElement>>('codeInput');

  protected readonly email = signal('');
  protected readonly code = signal('');
  protected readonly step = signal<LoginStep>('email');
  protected readonly isBusy = signal(false);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly devCode = signal<string | undefined>(undefined);

  protected async sendCode(): Promise<void> {
    if (!this.email().trim()) return;
    await this.runBusy(async () => {
      const sent = await this.api.requestCode(this.email());
      this.devCode.set(sent.devCode);
      this.code.set('');
      this.step.set('code');
      setTimeout(() => this.codeInput()?.nativeElement.focus());
    });
  }

  protected async verifyCode(): Promise<void> {
    if (!this.code().trim()) return;
    await this.runBusy(async () => {
      const started = await this.api.verifyCode(this.email(), this.code());
      this.session.start(started.token, started.user);
      await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('next') ?? '/account');
    });
  }

  protected changeEmail(): void {
    this.step.set('email');
    this.error.set(undefined);
    this.devCode.set(undefined);
  }

  private async runBusy(action: () => Promise<void>): Promise<void> {
    this.isBusy.set(true);
    this.error.set(undefined);
    try {
      await action();
    } catch (error) {
      this.error.set(describeLoginError(error));
    } finally {
      this.isBusy.set(false);
    }
  }
}

function describeLoginError(error: unknown): string {
  if (!(error instanceof ApiFailure)) return 'Something went wrong. Try again.';
  const attemptsLeft = error.details.attemptsLeft;
  if (attemptsLeft !== undefined) return `${error.message} ${attemptsLeft} attempts left.`;
  return error.message;
}

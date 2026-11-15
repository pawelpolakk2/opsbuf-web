import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { License } from '../core/models';
import { ApiFailure, OpsbufApi } from '../core/opsbuf-api';
import { formatDate } from '../ui/format';
import { Icon } from '../ui/icon';

@Component({
  selector: 'opsbuf-license-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Icon],
  template: `
    <article class="card" [class.highlighted]="isHighlighted()">
      <header>
        <div>
          <div class="title">
            <h2>opsbuf {{ license().planName }}</h2>
            <span class="chip" [class.ok]="license().status === 'ACTIVE'" [class.warn]="license().status === 'CANCELLED'">
              {{ license().status === 'ACTIVE' ? 'Active' : 'Ends ' + format(license().renewsAt) }}
            </span>
            @if (!license().isOwner) {
              <span class="chip">Seat from the owner</span>
            }
          </div>
          <p class="meta">
            {{ license().seats }} {{ license().seats === 1 ? 'seat' : 'seats' }} ·
            {{ license().billing === 'YEARLY' ? 'yearly' : 'monthly' }} ·
            {{ license().status === 'ACTIVE' ? 'renews' : 'valid until' }} {{ format(license().renewsAt) }}
          </p>
        </div>
        @if (license().isOwner) {
          @if (license().status === 'ACTIVE') {
            <button class="button small ghost" type="button" [disabled]="isBusy()" (click)="cancelRenewal()">
              Cancel renewal
            </button>
          } @else {
            <button class="button small" type="button" [disabled]="isBusy()" (click)="resumeRenewal()">
              Resume renewal
            </button>
          }
        }
      </header>

      <div class="key">
        <span class="label">License key</span>
        <code>{{ isKeyVisible() ? license().key : maskedKey() }}</code>
        <button class="icon-button" type="button" [attr.aria-label]="isKeyVisible() ? 'Hide key' : 'Show key'" (click)="toggleKey()">
          <opsbuf-icon [name]="isKeyVisible() ? 'close' : 'eye'" [size]="16" />
        </button>
        <button class="button small" type="button" (click)="copyKey()">
          <opsbuf-icon [name]="isCopied() ? 'check' : 'share'" [size]="15" /> {{ isCopied() ? 'Copied' : 'Copy' }}
        </button>
      </div>

      @if (error()) {
        <p class="notice error">{{ error() }}</p>
      }

      <div class="columns">
        <section>
          <h3>Seats <span>{{ license().members.length }} / {{ license().seats }}</span></h3>
          <ul>
            @for (member of license().members; track member) {
              <li>
                <span class="avatar">{{ member[0].toUpperCase() }}</span>
                <span class="grow">{{ member }}</span>
                @if (license().isOwner && license().seats > 1) {
                  <button class="link danger" type="button" [disabled]="isBusy()" (click)="removeMember(member)">Remove</button>
                }
              </li>
            } @empty {
              <li class="empty">No seat is assigned yet.</li>
            }
          </ul>
          @if (license().isOwner && license().members.length < license().seats) {
            <form (ngSubmit)="addMember()">
              <input class="input" type="email" name="member" placeholder="teammate@company.com" [ngModel]="newMember()" (ngModelChange)="newMember.set($event)" />
              <button class="button small" type="submit" [disabled]="isBusy()">Assign</button>
            </form>
          }
        </section>
        <section>
          <h3>Machines <span>{{ license().activations.length }} / {{ license().deviceLimit }}</span></h3>
          <ul>
            @for (activation of license().activations; track activation.machineId) {
              <li>
                <opsbuf-icon name="terminal" [size]="16" />
                <span class="grow">
                  {{ activation.machineName }}
                  <small>last seen {{ format(activation.lastSeenAt) }}</small>
                </span>
                @if (license().isOwner) {
                  <button class="link danger" type="button" [disabled]="isBusy()" (click)="deactivate(activation.machineId)">
                    Deactivate
                  </button>
                }
              </li>
            } @empty {
              <li class="empty">Paste the key into opsbuf to activate a machine.</li>
            }
          </ul>
        </section>
      </div>
    </article>
  `,
  styleUrl: './license-card.scss',
})
export class LicenseCard {
  private readonly api = inject(OpsbufApi);
  readonly license = input.required<License>();
  readonly isHighlighted = input(false);
  readonly changed = output<License>();

  protected readonly newMember = signal('');
  protected readonly isBusy = signal(false);
  protected readonly isKeyVisible = signal(false);
  protected readonly isCopied = signal(false);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly maskedKey = computed(() => maskKey(this.license().key));

  protected format(epochMillis: number): string {
    return formatDate(epochMillis);
  }

  protected toggleKey(): void {
    this.isKeyVisible.update((it) => !it);
  }

  protected async copyKey(): Promise<void> {
    await navigator.clipboard.writeText(this.license().key);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 1600);
  }

  protected async addMember(): Promise<void> {
    if (!this.newMember().trim()) return;
    await this.change(() => this.api.addMember(this.license().id, this.newMember()));
    if (!this.error()) this.newMember.set('');
  }

  protected async removeMember(email: string): Promise<void> {
    await this.change(() => this.api.removeMember(this.license().id, email));
  }

  protected async deactivate(machineId: string): Promise<void> {
    await this.change(() => this.api.deactivateMachine(this.license().id, machineId));
  }

  protected async cancelRenewal(): Promise<void> {
    await this.change(() => this.api.cancelRenewal(this.license().id));
  }

  protected async resumeRenewal(): Promise<void> {
    await this.change(() => this.api.resumeRenewal(this.license().id));
  }

  private async change(request: () => Promise<License>): Promise<void> {
    this.isBusy.set(true);
    this.error.set(undefined);
    try {
      this.changed.emit(await request());
    } catch (error) {
      this.error.set(error instanceof ApiFailure ? error.message : 'The change failed. Try again.');
    } finally {
      this.isBusy.set(false);
    }
  }
}

function maskKey(key: string): string {
  const groups = key.split('-');
  return groups.map((group, index) => (index === 0 || index === groups.length - 1 ? group : '•••••')).join('-');
}

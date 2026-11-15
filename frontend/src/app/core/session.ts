import { HttpInterceptorFn } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from './models';
import { OpsbufApi } from './opsbuf-api';

const TOKEN_KEY = 'opsbuf.session';

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly api = inject(OpsbufApi);
  private readonly tokenSignal = signal<string | undefined>(readStoredToken());
  private readonly userSignal = signal<User | undefined>(undefined);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isSignedIn = computed(() => this.tokenSignal() !== undefined);

  async restoreUser(): Promise<void> {
    if (!this.tokenSignal()) return;
    try {
      this.userSignal.set(await this.api.getMe());
    } catch {
      this.clear();
    }
  }

  start(token: string, user: User): void {
    storeToken(token);
    this.tokenSignal.set(token);
    this.userSignal.set(user);
  }

  async logout(): Promise<void> {
    try {
      await this.api.logout();
    } finally {
      this.clear();
    }
  }

  clear(): void {
    storeToken(undefined);
    this.tokenSignal.set(undefined);
    this.userSignal.set(undefined);
  }
}

export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(Session);
  const token = session.token();
  if (!token || !request.url.startsWith('/api/')) return next(request);
  const authorized = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(authorized).pipe(
    tap({ error: (error) => (error?.status === 401 ? session.clear() : undefined) }),
  );
};

export const signedInGuard: CanActivateFn = (_route, state) => {
  if (inject(Session).isSignedIn()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { next: state.url } });
};

function readStoredToken(): string | undefined {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function storeToken(token: string | undefined): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiError, Billing, CodeSent, License, Order, Plan, SessionStart, User } from './models';

@Injectable({ providedIn: 'root' })
export class OpsbufApi {
  private readonly http = inject(HttpClient);

  listPlans(): Promise<Plan[]> {
    return send(this.http.get<Plan[]>('/api/plans'));
  }

  requestCode(email: string): Promise<CodeSent> {
    return send(this.http.post<CodeSent>('/api/auth/code', { email }));
  }

  verifyCode(email: string, code: string): Promise<SessionStart> {
    return send(this.http.post<SessionStart>('/api/auth/verify', { email, code }));
  }

  getMe(): Promise<User> {
    return send(this.http.get<User>('/api/auth/me'));
  }

  logout(): Promise<void> {
    return send(this.http.post<void>('/api/auth/logout', {}));
  }

  listLicenses(): Promise<License[]> {
    return send(this.http.get<License[]>('/api/licenses'));
  }

  listOrders(): Promise<Order[]> {
    return send(this.http.get<Order[]>('/api/orders'));
  }

  purchase(planId: string, seats: number, billing: Billing): Promise<License> {
    return send(this.http.post<License>('/api/licenses', { planId, seats, billing }));
  }

  addMember(licenseId: string, email: string): Promise<License> {
    return send(this.http.post<License>(`/api/licenses/${licenseId}/members`, { email }));
  }

  removeMember(licenseId: string, email: string): Promise<License> {
    return send(this.http.delete<License>(`/api/licenses/${licenseId}/members/${encodeURIComponent(email)}`));
  }

  deactivateMachine(licenseId: string, machineId: string): Promise<License> {
    return send(
      this.http.delete<License>(`/api/licenses/${licenseId}/activations/${encodeURIComponent(machineId)}`),
    );
  }

  cancelRenewal(licenseId: string): Promise<License> {
    return send(this.http.post<License>(`/api/licenses/${licenseId}/cancel`, {}));
  }

  resumeRenewal(licenseId: string): Promise<License> {
    return send(this.http.post<License>(`/api/licenses/${licenseId}/resume`, {}));
  }
}

export class ApiFailure extends Error {
  constructor(
    readonly status: number,
    readonly details: ApiError,
  ) {
    super(details.error);
  }
}

async function send<T>(request: Observable<T>): Promise<T> {
  try {
    return await firstValueFrom(request);
  } catch (error) {
    throw toApiFailure(error);
  }
}

function toApiFailure(error: unknown): ApiFailure {
  if (!(error instanceof HttpErrorResponse)) return new ApiFailure(0, { error: String(error) });
  const details = error.error as Partial<ApiError> | null;
  const message = details?.error ?? (error.status === 0 ? 'The server cannot be reached.' : error.message);
  return new ApiFailure(error.status, { ...details, error: message });
}

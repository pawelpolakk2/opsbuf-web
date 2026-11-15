export type Billing = 'MONTHLY' | 'YEARLY';
export type LicenseStatus = 'ACTIVE' | 'CANCELLED';

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyCents: number;
  yearlyCents: number;
  currency: string;
  minSeats: number;
  maxSeats: number;
  devicesPerSeat: number;
  features: string[];
}

export interface User {
  id: string;
  email: string;
}

export interface Activation {
  machineId: string;
  machineName: string;
  activatedAt: number;
  lastSeenAt: number;
}

export interface License {
  id: string;
  key: string;
  planId: string;
  planName: string;
  seats: number;
  billing: Billing;
  members: string[];
  activations: Activation[];
  deviceLimit: number;
  status: LicenseStatus;
  isOwner: boolean;
  createdAt: number;
  renewsAt: number;
}

export interface Order {
  id: string;
  licenseId: string;
  planId: string;
  seats: number;
  billing: Billing;
  amountCents: number;
  currency: string;
  paymentReference: string;
  paidAt: number;
}

export interface CodeSent {
  devCode?: string;
}

export interface SessionStart {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  retryInSeconds?: number;
  attemptsLeft?: number;
}

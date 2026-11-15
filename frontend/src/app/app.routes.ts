import { Routes } from '@angular/router';
import { signedInGuard } from './core/session';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home-page').then((it) => it.HomePage) },
  {
    path: 'login',
    title: 'Sign in · PTX',
    loadComponent: () => import('./login/login-page').then((it) => it.LoginPage),
  },
  {
    path: 'buy/:planId',
    title: 'Buy a license · PTX',
    canActivate: [signedInGuard],
    loadComponent: () => import('./checkout/checkout-page').then((it) => it.CheckoutPage),
  },
  {
    path: 'account',
    title: 'Licenses · PTX',
    canActivate: [signedInGuard],
    loadComponent: () => import('./account/account-page').then((it) => it.AccountPage),
  },
  { path: '**', redirectTo: '' },
];

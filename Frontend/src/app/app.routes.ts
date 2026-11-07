import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(c => c.RegisterComponent)
  },

  // Protected routes
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent)
  },
  {
    path: 'farmers',
    canActivate: [authGuard],
    loadComponent: () => import('./components/farmers/farmer-list.component').then(c => c.FarmerListComponent)
  },
  {
    path: 'farmers/add',
    canActivate: [authGuard],
    loadComponent: () => import('./components/farmers/farmer-form.component').then(c => c.FarmerFormComponent)
  },
  {
    path: 'farmers/edit/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/farmers/farmer-form.component').then(c => c.FarmerFormComponent)
  },
  {
    path: 'milk-collection',
    canActivate: [authGuard],
    loadComponent: () => import('./components/milk-collection/milk-collection-list.component').then(c => c.MilkCollectionListComponent)
  },
  {
    path: 'milk-collection/add',
    canActivate: [authGuard],
    loadComponent: () => import('./components/milk-collection/milk-collection-form.component').then(c => c.MilkCollectionFormComponent)
  },
  {
    path: 'shift-entry',
    canActivate: [authGuard],
    loadComponent: () => import('./components/milk-collection/shift-collection.component').then(c => c.ShiftCollectionComponent)
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadComponent: () => import('./components/payments/payment-list.component').then(c => c.PaymentListComponent)
  },
  {
    path: 'ledger',
    canActivate: [authGuard],
    loadComponent: () => import('./components/ledger/ledger.component').then(c => c.LedgerComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./components/reports/reports.component').then(c => c.ReportsComponent)
  },
  {
    path: 'rate-chart',
    canActivate: [authGuard],
    loadComponent: () => import('./components/rate-chart/rate-chart.component').then(c => c.RateChartComponent)
  },
  { path: '**', redirectTo: '/login' }
];

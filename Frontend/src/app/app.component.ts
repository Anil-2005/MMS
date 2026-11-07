import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-container *ngIf="auth.isLoggedIn; else authPages">

      <div class="app-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <span class="icon">🥛</span>
            <span>MilkAdmin</span>
          </div>

          <div class="sidebar-section">Main</div>
          <a routerLink="/dashboard" routerLinkActive="active">
            <span class="nav-icon">📊</span><span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/shift-entry" routerLinkActive="active">
            <span class="nav-icon">⏱️</span><span class="nav-label">Shift Entry</span>
          </a>
          <a routerLink="/milk-collection" routerLinkActive="active">
            <span class="nav-icon">🪣</span><span class="nav-label">Collections</span>
          </a>

          <div class="sidebar-section">Management</div>
          <a routerLink="/farmers" routerLinkActive="active">
            <span class="nav-icon">👨‍🌾</span><span class="nav-label">Farmers</span>
          </a>
          <a routerLink="/payments" routerLinkActive="active">
            <span class="nav-icon">💰</span><span class="nav-label">Payments</span>
          </a>
          <a routerLink="/ledger" routerLinkActive="active">
            <span class="nav-icon">📒</span><span class="nav-label">Ledger</span>
          </a>

          <div class="sidebar-section">Analytics</div>
          <a routerLink="/reports" routerLinkActive="active">
            <span class="nav-icon">📈</span><span class="nav-label">Reports</span>
          </a>
          <a routerLink="/rate-chart" routerLinkActive="active">
            <span class="nav-icon">📋</span><span class="nav-label">Rate Chart</span>
          </a>

          <div class="sidebar-bottom">
            <a (click)="logout()" style="cursor:pointer;">
              <span class="nav-icon">🚪</span><span class="nav-label">Logout</span>
            </a>
          </div>
        </aside>

        <!-- Main area -->
        <div class="main-area">
          <!-- Top Bar -->
          <header class="topbar" style="position:relative;">
            <span class="topbar-title">Milk Collection Management System</span>
            <div class="topbar-right">
              <span class="text-muted" style="font-size:12px;">{{today}}</span>
              <button (click)="theme.toggle()" class="btn-icon" style="background:none;border:1px solid #e2e8f0;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:16px;" [title]="theme.isDark?'Light Mode':'Dark Mode'">
                {{theme.isDark ? '☀️' : '🌙'}}
              </button>
              <div class="profile-pill" (click)="toggleDropdown()">
                <div class="profile-avatar">{{initials}}</div>
                <span class="profile-name">{{auth.currentUser?.username}}</span>
                <span style="font-size:11px;color:#a0aec0;">▼</span>
              </div>
            </div>

            <!-- Profile Dropdown -->
            <div class="dropdown-menu-custom" *ngIf="showDropdown">
              <div style="padding:10px 14px 8px;border-bottom:1px solid #e2e8f0;">
                <div style="font-size:13px;font-weight:700;color:#2d3748;">{{auth.currentUser?.username}}</div>
                <div style="font-size:11px;color:#718096;text-transform:uppercase;">{{auth.currentUser?.role}}</div>
              </div>
              <a href="#" (click)="$event.preventDefault()">
                <span>👤</span> My Profile
              </a>
              <a href="#" (click)="$event.preventDefault()">
                <span>🔑</span> Change Password
              </a>
              <div class="divider"></div>
              <button (click)="logout()">
                <span>🚪</span> Logout
              </button>
            </div>
          </header>

          <!-- Page Content -->
          <main class="page-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>

    </ng-container>

    <!-- Auth pages (login/register) render without sidebar -->
    <ng-template #authPages>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent implements OnInit {
  showDropdown = false;
  today = new Date().toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });

  get initials() {
    const u = this.auth.currentUser?.username || 'A';
    return u.slice(0, 2).toUpperCase();
  }

  constructor(public auth: AuthService, private router: Router, public theme: ThemeService) {}

  ngOnInit() { this.theme.init(); }

  toggleDropdown() { this.showDropdown = !this.showDropdown; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const t = e.target as HTMLElement;
    if (!t.closest('.profile-pill') && !t.closest('.dropdown-menu-custom')) {
      this.showDropdown = false;
    }
  }

  logout() {
    this.showDropdown = false;
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => { sessionStorage.clear(); this.router.navigate(['/login']); }
    });
  }
}

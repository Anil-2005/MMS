import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface LiveStats {
  todayLiters: number;
  todayLitersChange: number;
  totalFarmers: number;
  farmersChange: number;
  totalRevenue: number;
  revenueChange: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-split" [class.dark]="dark">

      <!-- LEFT PANEL -->
      <div class="auth-left">
        <img src="assets/image.png" class="auth-bg-img" alt="Dairy Farm">
        <div class="auth-left-overlay"></div>

        <div class="auth-left-content">
          <!-- Brand -->
          <div class="brand">
            <span class="brand-icon">🥛</span>
            <div>
              <div class="brand-name">MilkAdmin</div>
              <div class="brand-sub">Pure Management. Better Tomorrow.</div>
            </div>
          </div>

          <!-- Headline -->
          <div class="auth-headline">
            <h1>Milk Management<br>System</h1>
            <p>Digitizing dairy operations for a healthier and brighter future.</p>
          </div>

          <!-- Features -->
          <div class="auth-features">
            <div class="feat-chip"><span>👨‍🌾</span>Manage Farmers</div>
            <div class="feat-chip"><span>🪣</span>Track Collections</div>
            <div class="feat-chip"><span>💰</span>Handle Payments</div>
            <div class="feat-chip"><span>📈</span>Get Insights</div>
          </div>

          <!-- Tagline -->
          <div class="auth-tagline">Good Milk,<br><em>Brighter Lives</em></div>

          <!-- Live Stats -->
          <div class="auth-stats">
            <div class="stat-tile">
              <div class="st-icon">🥛</div>
              <div class="st-lbl">Today's Collection</div>
              <div class="st-val">{{stats.todayLiters | number:'1.0-0'}} L</div>
              <div class="st-chg" [class.up]="stats.todayLitersChange>=0">
                {{stats.todayLitersChange>=0?'↑':'↓'}} {{stats.todayLitersChange | number:'1.0-0'}}%
              </div>
            </div>
            <div class="stat-tile">
              <div class="st-icon">👨‍🌾</div>
              <div class="st-lbl">Total Farmers</div>
              <div class="st-val">{{stats.totalFarmers}}</div>
              <div class="st-chg up">↑ Active</div>
            </div>
            <div class="stat-tile">
              <div class="st-icon">💵</div>
              <div class="st-lbl">Month Revenue</div>
              <div class="st-val">₹{{stats.totalRevenue | number:'1.0-0'}}</div>
              <div class="st-chg" [class.up]="stats.revenueChange>=0">
                {{stats.revenueChange>=0?'↑':'↓'}} {{stats.revenueChange | number:'1.0-0'}}%
              </div>
            </div>
          </div>

          <!-- Footer strip -->
          <div class="auth-strip">FRESH MILK &nbsp;|&nbsp; HAPPY FARMERS &nbsp;|&nbsp; STRONGER COMMUNITIES</div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="auth-right">
        <!-- Dark mode toggle -->
        <div class="auth-top-bar">
          <span class="auth-top-tag">🌱 A smarter tomorrow for dairy farmers</span>
          <button class="mode-toggle" (click)="dark=!dark" [title]="dark?'Light Mode':'Dark Mode'">
            {{dark ? '☀️' : '🌙'}}
          </button>
        </div>

        <div class="auth-form-wrap">
          <h2 class="auth-title">Welcome Back!</h2>
          <p class="auth-subtitle">Sign in to your Milk Management System</p>

          <form (ngSubmit)="submit()" #f="ngForm" autocomplete="on">
            <div class="rg">
              <label>Email or Username</label>
              <div class="input-icon-wrap">
                <span class="input-icon">✉️</span>
                <input type="text" name="username" [(ngModel)]="username" required
                  placeholder="Enter your email or username" autofocus>
              </div>
            </div>

            <div class="rg">
              <label>Password</label>
              <div class="input-icon-wrap">
                <span class="input-icon">🔒</span>
                <input [type]="showPwd?'text':'password'" name="password"
                  [(ngModel)]="password" required placeholder="Enter your password">
                <button type="button" class="pwd-eye" (click)="showPwd=!showPwd">
                  {{showPwd?'🙈':'👁️'}}
                </button>
              </div>
            </div>

            <div class="rg-row">
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="remember" name="remember"> Remember me
              </label>
              <a href="#" class="forgot-link" (click)="$event.preventDefault()">Forgot Password?</a>
            </div>

            <div class="auth-error-box" *ngIf="error">⚠️ {{error}}</div>

            <button type="submit" class="signin-btn" [disabled]="f.invalid||loading">
              <span *ngIf="loading" class="spin"></span>
              {{loading ? 'Signing in...' : 'Sign In →'}}
            </button>
          </form>

          <div class="auth-divider"><span>OR</span></div>

          <div class="auth-footer-link">
            Don't have an account? <a routerLink="/register">Create an account</a>
          </div>
        </div>

        <div class="auth-bottom-bar">Pure Data. Prosperous Farmers. Sustainable Future. 🌱</div>
      </div>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .auth-split {
      display: flex; height: 100vh; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --bg: #f5f7fa; --card: #fff; --text: #1a202c; --sub: #718096;
      --border: #e2e8f0; --inp-bg: #fff;
    }
    .auth-split.dark {
      --bg: #0f1923; --card: #1a2535; --text: #e2e8f0; --sub: #94a3b8;
      --border: #2d3748; --inp-bg: #1e2d3d;
    }

    /* LEFT */
    .auth-left {
      width: 56%; position: relative; overflow: hidden; flex-shrink: 0;
    }
    .auth-bg-img {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: center;
    }
    .auth-left-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(0,20,40,.7) 100%);
    }
    .auth-left-content {
      position: relative; z-index: 2; height: 100%;
      display: flex; flex-direction: column; padding: 28px 36px 20px;
      color: #fff;
    }

    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .brand-icon { font-size: 36px; }
    .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -.3px; }
    .brand-sub  { font-size: 11px; opacity: .75; }

    .auth-headline { margin-bottom: 20px; }
    .auth-headline h1 { font-size: 34px; font-weight: 800; line-height: 1.15; margin-bottom: 8px; }
    .auth-headline p  { font-size: 14px; opacity: .85; max-width: 340px; line-height: 1.5; }

    .auth-features { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .feat-chip {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
      border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600;
      backdrop-filter: blur(4px);
    }

    .auth-tagline {
      font-size: 26px; font-weight: 700; line-height: 1.2;
      color: #7ee8a2; margin-bottom: auto; font-style: italic;
    }
    .auth-tagline em { font-style: italic; color: #a8edbc; }

    .auth-stats {
      display: flex; gap: 10px; margin-bottom: 16px;
    }
    .stat-tile {
      flex: 1; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
      border-radius: 10px; padding: 12px; backdrop-filter: blur(6px); text-align: center;
    }
    .st-icon { font-size: 20px; margin-bottom: 4px; }
    .st-lbl  { font-size: 10px; opacity: .75; margin-bottom: 4px; }
    .st-val  { font-size: 18px; font-weight: 800; }
    .st-chg  { font-size: 11px; color: #ff7875; margin-top: 2px; }
    .st-chg.up { color: #7ee8a2; }

    .auth-strip {
      font-size: 10px; letter-spacing: .1em; opacity: .55; text-align: center;
      border-top: 1px solid rgba(255,255,255,.15); padding-top: 10px; text-transform: uppercase;
    }

    /* RIGHT */
    .auth-right {
      flex: 1; background: var(--bg); display: flex; flex-direction: column;
      overflow-y: auto;
    }
    .auth-top-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 40px; border-bottom: 1px solid var(--border);
    }
    .auth-top-tag { font-size: 12px; color: #27ae60; font-weight: 600; }
    .mode-toggle {
      background: var(--card); border: 1px solid var(--border); border-radius: 8px;
      padding: 6px 10px; font-size: 16px; cursor: pointer;
    }

    .auth-form-wrap {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      padding: 32px 56px;
    }
    .auth-title    { font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
    .auth-subtitle { font-size: 14px; color: var(--sub); margin-bottom: 28px; }

    .rg { margin-bottom: 16px; }
    .rg label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
    .input-icon-wrap {
      position: relative; display: flex; align-items: center;
      border: 1.5px solid var(--border); border-radius: 10px;
      background: var(--inp-bg); transition: border-color .15s;
    }
    .input-icon-wrap:focus-within { border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,.12); }
    .input-icon { padding: 0 10px 0 14px; font-size: 15px; flex-shrink: 0; }
    .input-icon-wrap input {
      flex: 1; border: none; background: transparent; padding: 12px 10px 12px 0;
      font-size: 14px; color: var(--text); outline: none;
    }
    .input-icon-wrap input::placeholder { color: var(--sub); }
    .pwd-eye {
      padding: 0 12px; background: none; border: none; cursor: pointer; font-size: 16px;
    }

    .rg-row {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .check-label {
      display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--sub); cursor: pointer;
    }
    .check-label input { accent-color: #3498db; width: 16px; height: 16px; }
    .forgot-link { font-size: 13px; color: #3498db; text-decoration: none; font-weight: 600; }

    .auth-error-box {
      background: #fff5f5; border: 1px solid #fed7d7; color: #c53030;
      padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px;
    }
    .dark .auth-error-box { background: #2d1515; border-color: #742424; color: #fc8181; }

    .signin-btn {
      width: 100%; padding: 13px; background: #2563eb; color: #fff;
      border: none; border-radius: 10px; font-size: 16px; font-weight: 700;
      cursor: pointer; transition: background .15s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .signin-btn:hover:not(:disabled) { background: #1d4ed8; }
    .signin-btn:disabled { opacity: .6; cursor: not-allowed; }

    .auth-divider {
      text-align: center; color: var(--sub); font-size: 12px; margin: 18px 0;
      position: relative;
    }
    .auth-divider::before, .auth-divider::after {
      content: ''; position: absolute; top: 50%; width: 42%; height: 1px;
      background: var(--border);
    }
    .auth-divider::before { left: 0; } .auth-divider::after { right: 0; }

    .auth-footer-link { text-align: center; font-size: 13px; color: var(--sub); }
    .auth-footer-link a { color: #2563eb; font-weight: 700; text-decoration: none; }

    .auth-bottom-bar {
      padding: 14px 40px; font-size: 12px; color: var(--sub); text-align: right;
      border-top: 1px solid var(--border);
    }

    .spin {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff; border-radius: 50%; animation: sp .6s linear infinite;
    }
    @keyframes sp { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .auth-split { flex-direction: column; }
      .auth-left { width: 100%; height: 280px; }
      .auth-form-wrap { padding: 24px 24px; }
    }
  `]
})
export class LoginComponent implements OnInit {
  username = ''; password = ''; remember = false;
  showPwd = false; loading = false; error = ''; dark = false;

  stats: LiveStats = { todayLiters: 0, todayLitersChange: 12, totalFarmers: 0, farmersChange: 8, totalRevenue: 0, revenueChange: 15 };

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Load live stats from API (public endpoints)
    this.http.get<any[]>('http://localhost:5000/api/farmers').subscribe({
      next: farmers => { this.stats.totalFarmers = farmers.length; },
      error: () => {}
    });

    const today = new Date().toISOString().split('T')[0];
    this.http.get<any[]>(`http://localhost:5000/api/milkcollections/date-range?startDate=${today}&endDate=${today}`).subscribe({
      next: cols => {
        this.stats.todayLiters = cols.reduce((s: number, c: any) => s + c.quantity, 0);
      },
      error: () => {}
    });

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
    this.http.get<any[]>(`http://localhost:5000/api/milkcollections/date-range?startDate=${monthStart}&endDate=${today}`).subscribe({
      next: cols => {
        this.stats.totalRevenue = cols.reduce((s: number, c: any) => s + c.totalAmount, 0);
      },
      error: () => {}
    });
  }

  submit() {
    this.error = ''; this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.loading = false; this.error = err.error?.message || 'Invalid username or password.'; }
    });
  }
}

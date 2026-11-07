import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-split" [class.dark]="dark">

      <!-- LEFT PANEL (same as login) -->
      <div class="auth-left">
        <img src="assets/image.png" class="auth-bg-img" alt="Dairy Farm">
        <div class="auth-left-overlay"></div>
        <div class="auth-left-content">
          <div class="brand">
            <span class="brand-icon">🥛</span>
            <div>
              <div class="brand-name">MilkAdmin</div>
              <div class="brand-sub">Pure Management. Better Tomorrow.</div>
            </div>
          </div>
          <div class="auth-headline">
            <h1>Join the<br>MilkAdmin Family</h1>
            <p>Create your account and start managing your dairy operations digitally.</p>
          </div>
          <div class="auth-features">
            <div class="feat-chip"><span>👨‍🌾</span>Manage Farmers</div>
            <div class="feat-chip"><span>🪣</span>Track Collections</div>
            <div class="feat-chip"><span>💰</span>Handle Payments</div>
            <div class="feat-chip"><span>📈</span>Get Insights</div>
          </div>
          <div class="auth-tagline">Good Milk,<br><em>Brighter Lives</em></div>
          <div class="auth-strip">FRESH MILK &nbsp;|&nbsp; HAPPY FARMERS &nbsp;|&nbsp; STRONGER COMMUNITIES</div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="auth-right">
        <div class="auth-top-bar">
          <span class="auth-top-tag">🌱 A smarter tomorrow for dairy farmers</span>
          <button class="mode-toggle" (click)="dark=!dark">{{dark?'☀️':'🌙'}}</button>
        </div>

        <div class="auth-form-wrap">
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Register for Milk Management System</p>

          <form (ngSubmit)="submit()" #f="ngForm">
            <div class="rg">
              <label>Username *</label>
              <div class="input-icon-wrap">
                <span class="input-icon">👤</span>
                <input type="text" name="username" [(ngModel)]="username" required minlength="3" placeholder="Choose a username">
              </div>
            </div>
            <div class="rg">
              <label>Email *</label>
              <div class="input-icon-wrap">
                <span class="input-icon">✉️</span>
                <input type="email" name="email" [(ngModel)]="email" required placeholder="your@email.com">
              </div>
            </div>
            <div class="rg">
              <label>Password *</label>
              <div class="input-icon-wrap">
                <span class="input-icon">🔒</span>
                <input [type]="showPwd?'text':'password'" name="password" [(ngModel)]="password" required minlength="6" placeholder="Min 6 characters">
                <button type="button" class="pwd-eye" (click)="showPwd=!showPwd">{{showPwd?'🙈':'👁️'}}</button>
              </div>
            </div>
            <div class="rg">
              <label>Confirm Password *</label>
              <div class="input-icon-wrap">
                <span class="input-icon">🔒</span>
                <input [type]="showPwd?'text':'password'" name="confirm" [(ngModel)]="confirm" required placeholder="Repeat password">
              </div>
              <div *ngIf="confirm && password!==confirm" style="color:#e53e3e;font-size:12px;margin-top:4px;">Passwords do not match</div>
            </div>

            <div class="rg-divider">
              <span>Are you a Farmer? (Optional)</span>
            </div>

            <div class="rg">
              <label>Farmer Code <span style="font-weight:400;color:#718096;">(if you are a farmer)</span></label>
              <div class="input-icon-wrap">
                <span class="input-icon">🏷️</span>
                <input type="text" name="farmerCode" [(ngModel)]="farmerCode"
                  placeholder="e.g. F001 — leave blank if you are Admin">
              </div>
              <div style="font-size:11px;color:#718096;margin-top:4px;">
                Enter your assigned farmer code to link your account to your farm records.
              </div>
            </div>

            <div class="auth-error-box" *ngIf="error">⚠️ {{error}}</div>

            <button type="submit" class="signin-btn" [disabled]="f.invalid||loading||password!==confirm">
              <span *ngIf="loading" class="spin"></span>
              {{loading?'Creating Account...':'Create Account →'}}
            </button>
          </form>

          <div class="auth-footer-link" style="margin-top:20px;">
            Already have an account? <a routerLink="/login">Sign in</a>
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
      --bg: #f5f7fa; --card: #fff; --text: #1a202c; --sub: #718096; --border: #e2e8f0; --inp-bg: #fff;
    }
    .auth-split.dark { --bg: #0f1923; --card: #1a2535; --text: #e2e8f0; --sub: #94a3b8; --border: #2d3748; --inp-bg: #1e2d3d; }

    .auth-left { width: 56%; position: relative; overflow: hidden; flex-shrink: 0; }
    .auth-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
    .auth-left-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(0,20,40,.72) 100%); }
    .auth-left-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; padding: 28px 36px 20px; color: #fff; }

    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .brand-icon { font-size: 36px; }
    .brand-name { font-size: 22px; font-weight: 800; }
    .brand-sub  { font-size: 11px; opacity: .75; }

    .auth-headline { margin-bottom: 20px; }
    .auth-headline h1 { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 8px; }
    .auth-headline p  { font-size: 14px; opacity: .85; max-width: 340px; line-height: 1.5; }

    .auth-features { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .feat-chip { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25); border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; }

    .auth-tagline { font-size: 26px; font-weight: 700; line-height: 1.2; color: #7ee8a2; margin-bottom: auto; font-style: italic; }
    .auth-tagline em { color: #a8edbc; }

    .auth-strip { font-size: 10px; letter-spacing: .1em; opacity: .55; text-align: center; border-top: 1px solid rgba(255,255,255,.15); padding-top: 10px; text-transform: uppercase; }

    .auth-right { flex: 1; background: var(--bg); display: flex; flex-direction: column; overflow-y: auto; }
    .auth-top-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; border-bottom: 1px solid var(--border); }
    .auth-top-tag { font-size: 12px; color: #27ae60; font-weight: 600; }
    .mode-toggle { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-size: 16px; cursor: pointer; }

    .auth-form-wrap { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 24px 56px; }
    .auth-title    { font-size: 26px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
    .auth-subtitle { font-size: 14px; color: var(--sub); margin-bottom: 22px; }

    .rg { margin-bottom: 14px; }
    .rg label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
    .input-icon-wrap { position: relative; display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: 10px; background: var(--inp-bg); transition: border-color .15s; }
    .input-icon-wrap:focus-within { border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,.12); }
    .input-icon { padding: 0 10px 0 14px; font-size: 15px; flex-shrink: 0; }
    .input-icon-wrap input { flex: 1; border: none; background: transparent; padding: 11px 10px 11px 0; font-size: 14px; color: var(--text); outline: none; }
    .input-icon-wrap input::placeholder { color: var(--sub); }
    .pwd-eye { padding: 0 12px; background: none; border: none; cursor: pointer; font-size: 16px; }

    .auth-error-box { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
    .dark .auth-error-box { background: #2d1515; border-color: #742424; color: #fc8181; }

    .signin-btn { width: 100%; padding: 13px; background: #27ae60; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background .15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .signin-btn:hover:not(:disabled) { background: #219150; }
    .signin-btn:disabled { opacity: .6; cursor: not-allowed; }

    .auth-footer-link { text-align: center; font-size: 13px; color: var(--sub); }
    .auth-footer-link a { color: #2563eb; font-weight: 700; text-decoration: none; }
    .auth-bottom-bar { padding: 14px 40px; font-size: 12px; color: var(--sub); text-align: right; border-top: 1px solid var(--border); }

    .spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: sp .6s linear infinite; }
    @keyframes sp { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .auth-split { flex-direction: column; }
      .auth-left { width: 100%; height: 240px; }
      .auth-form-wrap { padding: 20px 24px; }
    }
  `]
})
export class RegisterComponent {
  username=''; email=''; password=''; confirm=''; farmerCode='';
  showPwd=false; loading=false; error=''; dark=false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    this.error = ''; this.loading = true;
    this.auth.register(this.username, this.email, this.password, this.farmerCode || undefined).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.loading = false; this.error = err.error?.message || 'Registration failed.'; }
    });
  }
}

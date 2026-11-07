import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = localStorage.getItem('mms_theme') === 'dark';

  get isDark() { return this._dark; }

  toggle() {
    this._dark = !this._dark;
    localStorage.setItem('mms_theme', this._dark ? 'dark' : 'light');
    this.apply();
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this._dark ? 'dark' : 'light');
  }

  init() { this.apply(); }
}

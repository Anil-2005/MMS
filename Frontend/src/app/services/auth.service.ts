import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface AuthUser {
  userId: number;
  username: string;
  role: string;       // 'Admin' | 'Farmer'
  farmerId?: number;
  farmerName?: string;
  farmerCode?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private _user = new BehaviorSubject<AuthUser | null>(this.loadFromStorage());

  user$ = this._user.asObservable();
  get currentUser() { return this._user.value; }
  get isLoggedIn()  { return !!this._user.value; }
  get isAdmin()     { return this._user.value?.role === 'Admin'; }
  get isFarmer()    { return this._user.value?.role === 'Farmer'; }
  get farmerId()    { return this._user.value?.farmerId; }

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string, farmerCode?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password, farmerCode }, { withCredentials: true })
      .pipe(tap(res => this.setUser(res)));
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(tap(res => this.setUser(res)));
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearUser()));
  }

  checkSession(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(tap(user => this.setUser(user)));
  }

  private setUser(res: any) {
    const user: AuthUser = {
      userId: res.userId || 0,
      username: res.username,
      role: res.role,
      farmerId: res.farmerId ?? undefined,
      farmerName: res.farmerName ?? undefined,
      farmerCode: res.farmerCode ?? undefined
    };
    this._user.next(user);
    sessionStorage.setItem('mms_user', JSON.stringify(user));
  }

  private clearUser() {
    this._user.next(null);
    sessionStorage.removeItem('mms_user');
  }

  private loadFromStorage(): AuthUser | null {
    const s = sessionStorage.getItem('mms_user');
    return s ? JSON.parse(s) : null;
  }
}

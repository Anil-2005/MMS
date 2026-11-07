import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LedgerEntry {
  id: number;
  farmerId: number;
  transactionDate: Date;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  entryType: number; // 1=MilkCollection 2=Payment 3=Adjustment 4=Deduction
  referenceId?: number;
}

@Injectable({ providedIn: 'root' })
export class LedgerService {
  private apiUrl = 'http://localhost:5000/api/ledger';
  private options = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getByFarmer(farmerId: number): Observable<LedgerEntry[]> {
    return this.http.get<LedgerEntry[]>(`${this.apiUrl}/farmer/${farmerId}`, this.options);
  }

  getBalance(farmerId: number): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/balance/${farmerId}`, this.options);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  id: number;
  farmerId: number;
  paymentDate: Date;
  amount: number;
  paymentMethod: number; // 1=Cash 2=BankTransfer 3=Cheque 4=UPI
  referenceNumber?: string;
  remarks?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = 'http://localhost:5000/api/payments';
  private options = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, this.options);
  }

  getByFarmer(farmerId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/farmer/${farmerId}`, this.options);
  }

  getByDateRange(startDate: string, endDate: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`, this.options);
  }

  create(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment, this.options);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.options);
  }
}

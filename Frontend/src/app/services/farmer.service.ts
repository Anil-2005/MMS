import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Farmer } from '../models/farmer.model';

@Injectable({
  providedIn: 'root'
})
export class FarmerService {
  private apiUrl = 'http://localhost:5000/api/farmers';

  private options = { withCredentials: true };

  constructor(private http: HttpClient) { }

  getFarmers(): Observable<Farmer[]> {
    return this.http.get<Farmer[]>(this.apiUrl, this.options);
  }

  getFarmer(id: number): Observable<Farmer> {
    return this.http.get<Farmer>(`${this.apiUrl}/${id}`, this.options);
  }

  getFarmerByCode(code: string): Observable<Farmer> {
    return this.http.get<Farmer>(`${this.apiUrl}/by-code/${code}`, this.options);
  }

  createFarmer(farmer: Farmer): Observable<Farmer> {
    return this.http.post<Farmer>(this.apiUrl, farmer, this.options);
  }

  updateFarmer(farmer: Farmer): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${farmer.id}`, farmer, this.options);
  }

  deleteFarmer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.options);
  }
}
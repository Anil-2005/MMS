import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MilkCollection } from '../models/milk-collection.model';

@Injectable({
  providedIn: 'root'
})
export class MilkCollectionService {
  private apiUrl = 'http://localhost:5000/api/milkcollections';

  private options = { withCredentials: true };

  constructor(private http: HttpClient) { }

  getMilkCollections(): Observable<MilkCollection[]> {
    return this.http.get<MilkCollection[]>(this.apiUrl, this.options);
  }

  getMilkCollection(id: number): Observable<MilkCollection> {
    return this.http.get<MilkCollection>(`${this.apiUrl}/${id}`, this.options);
  }

  getMilkCollectionsByFarmer(farmerId: number): Observable<MilkCollection[]> {
    return this.http.get<MilkCollection[]>(`${this.apiUrl}/farmer/${farmerId}`, this.options);
  }

  getMilkCollectionsByDateRange(startDate: string, endDate: string): Observable<MilkCollection[]> {
    return this.http.get<MilkCollection[]>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`, this.options);
  }

  createMilkCollection(milkCollection: MilkCollection): Observable<MilkCollection> {
    return this.http.post<MilkCollection>(this.apiUrl, milkCollection, this.options);
  }

  updateMilkCollection(milkCollection: MilkCollection): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${milkCollection.id}`, milkCollection, this.options);
  }

  deleteMilkCollection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.options);
  }
}
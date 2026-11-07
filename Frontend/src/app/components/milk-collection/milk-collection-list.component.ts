import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MilkCollectionService } from '../../services/milk-collection.service';
import { FarmerService } from '../../services/farmer.service';
import { MilkCollection } from '../../models/milk-collection.model';
import { Farmer } from '../../models/farmer.model';

@Component({
  selector: 'app-milk-collection-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">🪣 Milk Collections</span>
      <a routerLink="/milk-collection/add" class="btn btn-success btn-sm">+ Record Collection</a>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:12px;">
      <div class="card-body" style="padding:10px 14px;">
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div>
            <label class="form-label" style="margin-bottom:3px;">From</label>
            <input type="date" class="form-control" [(ngModel)]="filterFrom" style="width:145px;">
          </div>
          <div>
            <label class="form-label" style="margin-bottom:3px;">To</label>
            <input type="date" class="form-control" [(ngModel)]="filterTo" style="width:145px;">
          </div>
          <div>
            <label class="form-label" style="margin-bottom:3px;">Farmer</label>
            <select class="form-select" [(ngModel)]="filterFarmer" style="width:180px;">
              <option value="0">All Farmers</option>
              <option *ngFor="let f of farmers" [value]="f.id">{{f.name}}</option>
            </select>
          </div>
          <button class="btn btn-primary btn-sm" (click)="applyFilter()">🔍 Filter</button>
          <button class="btn btn-outline btn-sm" (click)="resetFilter()">Reset</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-body" style="padding:0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Session</th>
                <th>Farmer</th>
                <th>Qty (L)</th>
                <th>Fat %</th>
                <th>SNF %</th>
                <th>Rate/L</th>
                <th>Total ₹</th>
                <th style="width:80px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered">
                <td>{{c.collectionDate | date:'dd/MM/yy'}}</td>
                <td>
                  <span class="badge" [class]="getSessionBadge(c.collectionTime)">
                    {{getSession(c.collectionTime)}}
                  </span>
                </td>
                <td class="fw-600">{{getFarmerName(c.farmerId)}}</td>
                <td>{{c.quantity | number:'1.1-1'}}</td>
                <td>{{c.fatPercentage | number:'1.2-2'}}</td>
                <td>{{c.snfPercentage | number:'1.2-2'}}</td>
                <td>₹{{c.ratePerLiter | number:'1.2-2'}}</td>
                <td class="fw-600 text-success">₹{{c.totalAmount | number:'1.2-2'}}</td>
                <td>
                  <button (click)="delete(c.id)" class="btn btn-danger btn-sm">✕</button>
                </td>
              </tr>
              <tr *ngIf="filtered.length === 0">
                <td colspan="9" style="text-align:center;padding:24px;color:#718096;">No records found</td>
              </tr>
            </tbody>
            <tfoot *ngIf="filtered.length > 0">
              <tr style="background:#f0f9f4;font-weight:700;color:#2d3748;">
                <td colspan="3">Total ({{filtered.length}} entries)</td>
                <td>{{totalLiters | number:'1.1-1'}} L</td>
                <td>{{avgFat | number:'1.2-2'}}</td>
                <td>{{avgSnf | number:'1.2-2'}}</td>
                <td>₹{{avgRate | number:'1.2-2'}}</td>
                <td class="text-success">₹{{totalAmount | number:'1.2-2'}}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MilkCollectionListComponent implements OnInit {
  all: MilkCollection[] = [];
  filtered: MilkCollection[] = [];
  farmers: Farmer[] = [];

  filterFrom = '';
  filterTo   = '';
  filterFarmer = 0;

  totalLiters = 0; totalAmount = 0;
  avgFat = 0; avgSnf = 0; avgRate = 0;

  constructor(
    private milkService: MilkCollectionService,
    private farmerService: FarmerService
  ) {}

  ngOnInit() {
    const now = new Date();
    this.filterFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    this.filterTo   = now.toISOString().split('T')[0];
    this.farmerService.getFarmers().subscribe(f => {
      this.farmers = f;
      this.load();
    });
  }

  load() {
    this.milkService.getMilkCollectionsByDateRange(this.filterFrom, this.filterTo).subscribe(data => {
      this.all = data;
      this.applyFilter();
    });
  }

  applyFilter() {
    let res = this.all;
    if (+this.filterFarmer > 0) res = res.filter(c => c.farmerId === +this.filterFarmer);
    this.filtered = res;
    this.calcTotals();
  }

  resetFilter() {
    const now = new Date();
    this.filterFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    this.filterTo   = now.toISOString().split('T')[0];
    this.filterFarmer = 0;
    this.load();
  }

  calcTotals() {
    const n = this.filtered.length;
    this.totalLiters  = this.filtered.reduce((s, c) => s + c.quantity, 0);
    this.totalAmount  = this.filtered.reduce((s, c) => s + c.totalAmount, 0);
    this.avgFat  = n ? this.filtered.reduce((s, c) => s + c.fatPercentage, 0) / n : 0;
    this.avgSnf  = n ? this.filtered.reduce((s, c) => s + c.snfPercentage, 0) / n : 0;
    this.avgRate = n ? this.filtered.reduce((s, c) => s + c.ratePerLiter, 0) / n : 0;
  }

  getFarmerName(id: number) {
    return this.farmers.find(f => f.id === id)?.name || 'Farmer #' + id;
  }

  getSession(t: string) {
    return t && parseInt(t) < 12 ? 'Morning' : 'Evening';
  }

  getSessionBadge(t: string) {
    return t && parseInt(t) < 12 ? 'badge badge-info' : 'badge badge-warning';
  }

  delete(id: number) {
    if (confirm('Delete this entry?')) {
      this.milkService.deleteMilkCollection(id).subscribe(() => this.load());
    }
  }
}

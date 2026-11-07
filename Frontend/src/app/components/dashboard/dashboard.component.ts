import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { MilkCollectionService } from '../../services/milk-collection.service';
import { MilkCollection } from '../../models/milk-collection.model';
import { Farmer } from '../../models/farmer.model';

interface FarmerSummary {
  farmer: Farmer;
  totalLiters: number;
  totalAmount: number;
  collections: number;
  avgFat: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Stat Row -->
    <div class="row" style="margin-bottom:12px;">
      <div class="col-3">
        <div class="stat-card bg-blue">
          <div class="stat-val">{{totalFarmers}}</div>
          <div class="stat-lbl">Active Farmers</div>
          <div class="stat-icon">👨‍🌾</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-card bg-green">
          <div class="stat-val">{{todayLiters | number:'1.1-1'}} L</div>
          <div class="stat-lbl">Today's Milk</div>
          <div class="stat-icon">🥛</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-card bg-orange">
          <div class="stat-val">₹{{todayAmount | number:'1.0-0'}}</div>
          <div class="stat-lbl">Today's Payable</div>
          <div class="stat-icon">💵</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-card bg-purple">
          <div class="stat-val">₹{{monthAmount | number:'1.0-0'}}</div>
          <div class="stat-lbl">This Month Payable</div>
          <div class="stat-icon">📅</div>
        </div>
      </div>
    </div>

    <!-- Two column layout -->
    <div class="row" style="align-items:flex-start;">

      <!-- Left: Today's Collections per Farmer -->
      <div class="col-8">
        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">
            <span>Today's Collection — Farmer Wise</span>
            <div style="display:flex;gap:8px;align-items:center;">
              <span style="font-size:12px;color:#718096;">{{todayStr}}</span>
              <a routerLink="/milk-collection/add" class="btn btn-primary btn-sm">+ Add</a>
            </div>
          </div>
          <div class="card-body" style="padding:0;">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Session</th>
                    <th>Qty (L)</th>
                    <th>Fat %</th>
                    <th>SNF %</th>
                    <th>Rate/L</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of todayCollections">
                    <td class="fw-600">{{c.farmer?.name || 'Farmer #'+c.farmerId}}</td>
                    <td>
                      <span class="badge" [class]="getSessionBadge(c.collectionTime)">
                        {{getSession(c.collectionTime)}}
                      </span>
                    </td>
                    <td>{{c.quantity | number:'1.1-1'}}</td>
                    <td>{{c.fatPercentage | number:'1.2-2'}}</td>
                    <td>{{c.snfPercentage | number:'1.2-2'}}</td>
                    <td>₹{{c.ratePerLiter | number:'1.2-2'}}</td>
                    <td class="fw-600 text-success">₹{{c.totalAmount | number:'1.2-2'}}</td>
                  </tr>
                  <tr *ngIf="todayCollections.length === 0">
                    <td colspan="7" style="text-align:center;color:#718096;padding:20px;">
                      No collections recorded today
                    </td>
                  </tr>
                  <tr *ngIf="todayCollections.length > 0" style="background:#f8fafc;font-weight:700;">
                    <td colspan="2">Total</td>
                    <td>{{todayLiters | number:'1.1-1'}} L</td>
                    <td colspan="2"></td>
                    <td></td>
                    <td class="text-success">₹{{todayAmount | number:'1.2-2'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Monthly Farmer Summary -->
        <div class="card">
          <div class="card-header">
            <span>Monthly Summary — Farmer Wise</span>
            <div class="month-filter">
              <select class="form-select" style="width:auto;padding:4px 8px;font-size:12px;" [(ngModel)]="selectedMonth" (change)="loadMonthData()">
                <option *ngFor="let m of months" [value]="m.value">{{m.label}}</option>
              </select>
            </div>
          </div>
          <div class="card-body" style="padding:0;">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Farmer</th>
                    <th>Days</th>
                    <th>Total Qty (L)</th>
                    <th>Avg Fat %</th>
                    <th>Month Amount</th>
                    <th>Account Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of farmerSummaries; let i = index">
                    <td class="text-muted">{{i+1}}</td>
                    <td>
                      <div class="fw-600">{{s.farmer.name}}</div>
                      <div style="font-size:11px;color:#718096;">{{s.farmer.farmerCode}}</div>
                    </td>
                    <td>{{s.collections}}</td>
                    <td class="fw-600">{{s.totalLiters | number:'1.1-1'}} L</td>
                    <td>{{s.avgFat | number:'1.2-2'}}</td>
                    <td class="fw-600 text-success">₹{{s.totalAmount | number:'1.2-2'}}</td>
                    <td class="fw-600" [class]="s.farmer.accountBalance > 0 ? 'text-danger' : 'text-success'">
                      ₹{{s.farmer.accountBalance | number:'1.2-2'}}
                    </td>
                  </tr>
                  <tr *ngIf="farmerSummaries.length === 0">
                    <td colspan="7" style="text-align:center;color:#718096;padding:20px;">No data for selected month</td>
                  </tr>
                  <tr *ngIf="farmerSummaries.length > 0" style="background:#f8fafc;font-weight:700;">
                    <td colspan="3">Total</td>
                    <td>{{monthLiters | number:'1.1-1'}} L</td>
                    <td></td>
                    <td class="text-success">₹{{monthAmount | number:'1.2-2'}}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Quick actions + Stats -->
      <div class="col-4">
        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">Quick Actions</div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:8px;">
            <a routerLink="/shift-entry" class="btn btn-success">⏱️ Shift Entry</a>
            <a routerLink="/milk-collection/add" class="btn btn-outline">🥛 Single Entry</a>
            <a routerLink="/farmers/add" class="btn btn-primary">👨‍🌾 Add Farmer</a>
            <a routerLink="/payments" class="btn btn-outline">💰 Process Payment</a>
            <a routerLink="/reports" class="btn btn-outline">📈 View Reports</a>
          </div>
        </div>

        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">Month at a Glance</div>
          <div class="card-body" style="padding:8px 16px;">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f4f8;">
              <span class="text-muted">Total Collections</span>
              <span class="fw-600">{{monthCollectionCount}}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f4f8;">
              <span class="text-muted">Total Milk</span>
              <span class="fw-600">{{monthLiters | number:'1.1-1'}} L</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f4f8;">
              <span class="text-muted">Avg Rate/L</span>
              <span class="fw-600">₹{{monthAvgRate | number:'1.2-2'}}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;">
              <span class="text-muted">Total Payable</span>
              <span class="fw-600 text-success">₹{{monthAmount | number:'1.2-2'}}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">Top Farmers (This Month)</div>
          <div class="card-body" style="padding:0;">
            <div *ngFor="let s of topFarmers; let i = index"
                 style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;border-bottom:1px solid #f0f4f8;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:22px;height:22px;border-radius:50%;background:#3498db;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">{{i+1}}</span>
                <div>
                  <div class="fw-600" style="font-size:13px;">{{s.farmer.name}}</div>
                  <div style="font-size:11px;color:#718096;">{{s.totalLiters | number:'1.1-1'}} L</div>
                </div>
              </div>
              <span class="fw-600 text-success" style="font-size:13px;">₹{{s.totalAmount | number:'1.0-0'}}</span>
            </div>
            <div *ngIf="topFarmers.length === 0" style="text-align:center;padding:16px;color:#718096;font-size:13px;">No data</div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  totalFarmers = 0;
  todayCollections: MilkCollection[] = [];
  todayLiters = 0;
  todayAmount = 0;
  todayStr = '';

  farmerSummaries: FarmerSummary[] = [];
  topFarmers: FarmerSummary[] = [];
  monthLiters = 0;
  monthAmount = 0;
  monthCollectionCount = 0;
  monthAvgRate = 0;

  selectedMonth = '';
  months: { value: string; label: string }[] = [];
  private allFarmers: Farmer[] = [];

  constructor(
    private farmerService: FarmerService,
    private milkService: MilkCollectionService
  ) {}

  ngOnInit() {
    this.buildMonthOptions();
    const now = new Date();
    this.todayStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

    this.farmerService.getFarmers().subscribe(farmers => {
      this.allFarmers = farmers;
      this.totalFarmers = farmers.filter(f => f.isActive).length;
      this.loadTodayData();
      this.loadMonthData();
    });
  }

  buildMonthOptions() {
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const lbl = d.toLocaleDateString('en-IN', { month:'long', year:'numeric' });
      this.months.push({ value: val, label: lbl });
    }
    this.selectedMonth = this.months[0].value;
  }

  loadTodayData() {
    const today = new Date().toISOString().split('T')[0];
    this.milkService.getMilkCollectionsByDateRange(today, today).subscribe(cols => {
      this.todayCollections = cols.map(c => ({
        ...c,
        farmer: this.allFarmers.find(f => f.id === c.farmerId)
      }));
      this.todayLiters = cols.reduce((s, c) => s + c.quantity, 0);
      this.todayAmount = cols.reduce((s, c) => s + c.totalAmount, 0);
    });
  }

  loadMonthData() {
    const [yr, mo] = this.selectedMonth.split('-').map(Number);
    const start = `${yr}-${String(mo).padStart(2,'0')}-01`;
    const end   = new Date(yr, mo, 0).toISOString().split('T')[0];

    this.milkService.getMilkCollectionsByDateRange(start, end).subscribe(cols => {
      this.monthCollectionCount = cols.length;
      this.monthLiters  = cols.reduce((s, c) => s + c.quantity, 0);
      this.monthAmount  = cols.reduce((s, c) => s + c.totalAmount, 0);
      this.monthAvgRate = cols.length ? cols.reduce((s, c) => s + c.ratePerLiter, 0) / cols.length : 0;

      // Build per-farmer summaries
      const map = new Map<number, MilkCollection[]>();
      cols.forEach(c => {
        if (!map.has(c.farmerId)) map.set(c.farmerId, []);
        map.get(c.farmerId)!.push(c);
      });

      this.farmerSummaries = Array.from(map.entries()).map(([fid, fCols]) => {
        const farmer = this.allFarmers.find(f => f.id === fid) || { id: fid, name: 'Unknown', farmerCode: '-', accountBalance: 0 } as Farmer;
        return {
          farmer,
          totalLiters: fCols.reduce((s, c) => s + c.quantity, 0),
          totalAmount: fCols.reduce((s, c) => s + c.totalAmount, 0),
          collections: fCols.length,
          avgFat: fCols.reduce((s, c) => s + c.fatPercentage, 0) / fCols.length
        };
      }).sort((a, b) => b.totalAmount - a.totalAmount);

      this.topFarmers = this.farmerSummaries.slice(0, 5);
    });
  }

  getSession(time: string): string {
    if (!time) return '–';
    const h = parseInt(time.split(':')[0]);
    return h < 12 ? 'Morning' : 'Evening';
  }

  getSessionBadge(time: string): string {
    const h = time ? parseInt(time.split(':')[0]) : 12;
    return h < 12 ? 'badge badge-info' : 'badge badge-warning';
  }
}

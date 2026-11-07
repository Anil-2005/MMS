import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { MilkCollectionService } from '../../services/milk-collection.service';
import { Farmer } from '../../models/farmer.model';
import { MilkCollection } from '../../models/milk-collection.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">📈 Reports</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <select class="form-select" style="width:auto;font-size:13px;padding:5px 10px;" [(ngModel)]="selectedMonth" (change)="loadReport()">
          <option *ngFor="let m of months" [value]="m.value">{{m.label}}</option>
        </select>
        <select class="form-select" style="width:160px;font-size:13px;padding:5px 10px;" [(ngModel)]="filterFarmer" (change)="applyFarmerFilter()">
          <option value="0">All Farmers</option>
          <option *ngFor="let f of farmers" [value]="f.id">{{f.name}}</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <button class="tab-btn" [class.active]="tab==='monthly'" (click)="tab='monthly'">Monthly Summary</button>
      <button class="tab-btn" [class.active]="tab==='daily'" (click)="tab='daily'">Daily Breakdown</button>
      <button class="tab-btn" [class.active]="tab==='farmer'" (click)="tab='farmer'">Farmer Report</button>
    </div>

    <!-- Monthly Summary Tab -->
    <ng-container *ngIf="tab==='monthly'">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-3"><div class="stat-card bg-blue"><div class="stat-val">{{totalCols}}</div><div class="stat-lbl">Total Collections</div></div></div>
        <div class="col-3"><div class="stat-card bg-green"><div class="stat-val">{{totalLiters | number:'1.0-0'}} L</div><div class="stat-lbl">Total Milk</div></div></div>
        <div class="col-3"><div class="stat-card bg-orange"><div class="stat-val">₹{{avgRate | number:'1.2-2'}}</div><div class="stat-lbl">Avg Rate/L</div></div></div>
        <div class="col-3"><div class="stat-card bg-purple"><div class="stat-val">₹{{totalAmount | number:'1.0-0'}}</div><div class="stat-lbl">Total Payable</div></div></div>
      </div>

      <div class="card">
        <div class="card-header">Farmer-wise Monthly Report — {{selectedMonthLabel}}</div>
        <div class="card-body" style="padding:0;">
          <table class="table">
            <thead>
              <tr><th>Farmer</th><th>Collections</th><th>Morning (L)</th><th>Evening (L)</th><th>Total (L)</th><th>Avg Fat%</th><th>Avg SNF%</th><th>Avg Rate</th><th>Total ₹</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of farmerReport">
                <td><div class="fw-600">{{r.name}}</div><div style="font-size:11px;color:#718096;">{{r.code}}</div></td>
                <td>{{r.count}}</td>
                <td>{{r.morningLiters | number:'1.1-1'}}</td>
                <td>{{r.eveningLiters | number:'1.1-1'}}</td>
                <td class="fw-600">{{r.totalLiters | number:'1.1-1'}}</td>
                <td>{{r.avgFat | number:'1.2-2'}}</td>
                <td>{{r.avgSnf | number:'1.2-2'}}</td>
                <td>₹{{r.avgRate | number:'1.2-2'}}</td>
                <td class="fw-600 text-success">₹{{r.totalAmount | number:'1.2-2'}}</td>
              </tr>
              <tr *ngIf="farmerReport.length===0"><td colspan="9" style="text-align:center;padding:20px;color:#718096;">No data</td></tr>
            </tbody>
            <tfoot *ngIf="farmerReport.length>0">
              <tr style="background:#f8fafc;font-weight:700;">
                <td>Grand Total</td><td>{{totalCols}}</td>
                <td>{{totalMorning|number:'1.1-1'}}</td>
                <td>{{totalEvening|number:'1.1-1'}}</td>
                <td>{{totalLiters|number:'1.1-1'}}</td>
                <td>{{avgFat|number:'1.2-2'}}</td>
                <td>{{avgSnf|number:'1.2-2'}}</td>
                <td>₹{{avgRate|number:'1.2-2'}}</td>
                <td class="text-success">₹{{totalAmount|number:'1.2-2'}}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- Daily Breakdown Tab -->
    <ng-container *ngIf="tab==='daily'">
      <div class="card">
        <div class="card-header">Daily Collection — {{selectedMonthLabel}}</div>
        <div class="card-body" style="padding:0;">
          <table class="table">
            <thead>
              <tr><th>Date</th><th>Collections</th><th>Morning (L)</th><th>Evening (L)</th><th>Total (L)</th><th>Avg Fat%</th><th>Total ₹</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of dailyReport">
                <td class="fw-600">{{d.date | date:'EEE, dd MMM'}}</td>
                <td>{{d.count}}</td>
                <td>{{d.morning | number:'1.1-1'}}</td>
                <td>{{d.evening | number:'1.1-1'}}</td>
                <td class="fw-600">{{d.total | number:'1.1-1'}}</td>
                <td>{{d.avgFat | number:'1.2-2'}}</td>
                <td class="fw-600 text-success">₹{{d.amount | number:'1.2-2'}}</td>
              </tr>
              <tr *ngIf="dailyReport.length===0"><td colspan="7" style="text-align:center;padding:20px;color:#718096;">No data</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- Farmer Detail Tab -->
    <ng-container *ngIf="tab==='farmer'">
      <div class="card">
        <div class="card-header">Collection Records — {{selectedMonthLabel}}</div>
        <div class="card-body" style="padding:0;">
          <table class="table">
            <thead>
              <tr><th>Date</th><th>Session</th><th>Farmer</th><th>Qty (L)</th><th>Fat%</th><th>SNF%</th><th>Rate/L</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredCols">
                <td>{{c.collectionDate | date:'dd/MM/yy'}}</td>
                <td><span class="badge" [class]="getSessionBadge(c.collectionTime)">{{getSession(c.collectionTime)}}</span></td>
                <td class="fw-600">{{getFarmerName(c.farmerId)}}</td>
                <td>{{c.quantity | number:'1.1-1'}}</td>
                <td>{{c.fatPercentage | number:'1.2-2'}}</td>
                <td>{{c.snfPercentage | number:'1.2-2'}}</td>
                <td>₹{{c.ratePerLiter | number:'1.2-2'}}</td>
                <td class="fw-600 text-success">₹{{c.totalAmount | number:'1.2-2'}}</td>
              </tr>
              <tr *ngIf="filteredCols.length===0"><td colspan="8" style="text-align:center;padding:20px;color:#718096;">No data</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>
  `
})
export class ReportsComponent implements OnInit {
  tab = 'monthly';
  months: {value:string; label:string}[] = [];
  selectedMonth = '';
  selectedMonthLabel = '';
  farmers: Farmer[] = [];
  filterFarmer = 0;

  allCols: MilkCollection[] = [];
  filteredCols: MilkCollection[] = [];

  totalCols = 0; totalLiters = 0; totalAmount = 0;
  avgFat = 0; avgSnf = 0; avgRate = 0;
  totalMorning = 0; totalEvening = 0;

  farmerReport: any[] = [];
  dailyReport: any[] = [];

  constructor(private farmerService: FarmerService, private milkService: MilkCollectionService) {}

  ngOnInit() {
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      this.months.push({ value: val, label: d.toLocaleDateString('en-IN', { month:'long', year:'numeric' }) });
    }
    this.selectedMonth = this.months[0].value;
    this.farmerService.getFarmers().subscribe(f => {
      this.farmers = f;
      this.loadReport();
    });
  }

  loadReport() {
    const m = this.months.find(x => x.value === this.selectedMonth);
    this.selectedMonthLabel = m?.label || '';
    const [yr, mo] = this.selectedMonth.split('-').map(Number);
    const start = `${yr}-${String(mo).padStart(2,'0')}-01`;
    const end   = new Date(yr, mo, 0).toISOString().split('T')[0];

    this.milkService.getMilkCollectionsByDateRange(start, end).subscribe(cols => {
      this.allCols = cols;
      this.applyFarmerFilter();
    });
  }

  applyFarmerFilter() {
    this.filteredCols = +this.filterFarmer > 0
      ? this.allCols.filter(c => c.farmerId === +this.filterFarmer)
      : this.allCols;
    this.buildReports();
  }

  buildReports() {
    const cols = this.filteredCols;
    const n = cols.length;
    this.totalCols   = n;
    this.totalLiters = cols.reduce((s,c) => s+c.quantity, 0);
    this.totalAmount = cols.reduce((s,c) => s+c.totalAmount, 0);
    this.avgFat  = n ? cols.reduce((s,c) => s+c.fatPercentage, 0)/n : 0;
    this.avgSnf  = n ? cols.reduce((s,c) => s+c.snfPercentage, 0)/n : 0;
    this.avgRate = n ? cols.reduce((s,c) => s+c.ratePerLiter, 0)/n : 0;

    // Farmer report
    const fm = new Map<number, MilkCollection[]>();
    cols.forEach(c => { if (!fm.has(c.farmerId)) fm.set(c.farmerId,[]); fm.get(c.farmerId)!.push(c); });
    this.farmerReport = Array.from(fm.entries()).map(([fid, fc]) => {
      const f = this.farmers.find(x => x.id === fid);
      const morning = fc.filter(c => parseInt(c.collectionTime||'0') < 12);
      const evening = fc.filter(c => parseInt(c.collectionTime||'12') >= 12);
      return {
        name: f?.name || 'Unknown', code: f?.farmerCode || '',
        count: fc.length,
        morningLiters: morning.reduce((s,c) => s+c.quantity, 0),
        eveningLiters: evening.reduce((s,c) => s+c.quantity, 0),
        totalLiters: fc.reduce((s,c) => s+c.quantity, 0),
        totalAmount: fc.reduce((s,c) => s+c.totalAmount, 0),
        avgFat: fc.reduce((s,c) => s+c.fatPercentage, 0)/fc.length,
        avgSnf: fc.reduce((s,c) => s+c.snfPercentage, 0)/fc.length,
        avgRate: fc.reduce((s,c) => s+c.ratePerLiter, 0)/fc.length,
      };
    }).sort((a,b) => b.totalAmount - a.totalAmount);

    this.totalMorning = this.farmerReport.reduce((s,r) => s+r.morningLiters, 0);
    this.totalEvening = this.farmerReport.reduce((s,r) => s+r.eveningLiters, 0);

    // Daily report
    const dm = new Map<string, MilkCollection[]>();
    cols.forEach(c => {
      const k = new Date(c.collectionDate).toISOString().split('T')[0];
      if (!dm.has(k)) dm.set(k,[]);
      dm.get(k)!.push(c);
    });
    this.dailyReport = Array.from(dm.entries()).map(([date, dc]) => ({
      date: new Date(date),
      count: dc.length,
      morning: dc.filter(c => parseInt(c.collectionTime||'0') < 12).reduce((s,c) => s+c.quantity, 0),
      evening: dc.filter(c => parseInt(c.collectionTime||'12') >= 12).reduce((s,c) => s+c.quantity, 0),
      total: dc.reduce((s,c) => s+c.quantity, 0),
      avgFat: dc.reduce((s,c) => s+c.fatPercentage, 0)/dc.length,
      amount: dc.reduce((s,c) => s+c.totalAmount, 0)
    })).sort((a,b) => a.date.getTime() - b.date.getTime());
  }

  getFarmerName(id: number) { return this.farmers.find(f => f.id === id)?.name || 'Farmer #'+id; }
  getSession(t: string) { return t && parseInt(t) < 12 ? 'Morning' : 'Evening'; }
  getSessionBadge(t: string) { return t && parseInt(t) < 12 ? 'badge badge-info' : 'badge badge-warning'; }
}

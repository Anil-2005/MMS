import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { MilkCollectionService } from '../../services/milk-collection.service';
import { Farmer } from '../../models/farmer.model';

interface ShiftRow {
  farmer: Farmer;
  quantity: number | null;
  fatPercentage: number | null;
  snfPercentage: number | null;
  ratePerLiter: number;
  totalAmount: number;
  saved: boolean;
  saving: boolean;
  error: string;
}

@Component({
  selector: 'app-shift-collection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">🥛 Shift Collection Entry</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="date" class="form-control" [(ngModel)]="dateStr" style="width:145px;font-size:13px;">
        <div style="display:flex;border:1px solid #cbd5e0;border-radius:6px;overflow:hidden;">
          <button class="shift-btn" [class.shift-active]="shift==='morning'" (click)="setShift('morning')">
            🌅 Morning
          </button>
          <button class="shift-btn" [class.shift-active]="shift==='evening'" (click)="setShift('evening')">
            🌆 Evening
          </button>
        </div>
      </div>
    </div>

    <!-- Summary bar -->
    <div class="shift-summary" style="margin-bottom:12px;">
      <div class="ss-item">
        <span class="ss-val">{{filledCount}}</span>
        <span class="ss-lbl">Farmers Entered</span>
      </div>
      <div class="ss-sep"></div>
      <div class="ss-item">
        <span class="ss-val">{{totalLiters | number:'1.1-1'}} L</span>
        <span class="ss-lbl">Total Quantity</span>
      </div>
      <div class="ss-sep"></div>
      <div class="ss-item">
        <span class="ss-val">₹{{totalAmount | number:'1.0-0'}}</span>
        <span class="ss-lbl">Total Payable</span>
      </div>
      <div class="ss-sep"></div>
      <div class="ss-item">
        <span class="ss-val">{{avgFat | number:'1.2-2'}}%</span>
        <span class="ss-lbl">Avg Fat</span>
      </div>
      <div style="margin-left:auto;">
        <button class="btn btn-success" (click)="saveAll()" [disabled]="filledCount===0 || isSavingAll">
          {{isSavingAll ? 'Saving...' : '💾 Save All (' + pendingSaveCount + ')'}}
        </button>
      </div>
    </div>

    <!-- Entry Table -->
    <div class="card">
      <div class="card-header">
        <span>
          <span class="badge" [class]="shift==='morning' ? 'badge badge-info' : 'badge badge-warning'" style="font-size:13px;padding:4px 10px;">
            {{shift==='morning' ? '🌅 Morning Shift — 06:00' : '🌆 Evening Shift — 17:00'}}
          </span>
          &nbsp;{{dateStr | date:'EEEE, dd MMM yyyy'}}
        </span>
        <span style="font-size:12px;color:#718096;">{{rows.length}} active farmers</span>
      </div>
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Farmer</th>
              <th style="width:110px;">Qty (L)</th>
              <th style="width:95px;">Fat %</th>
              <th style="width:95px;">SNF %</th>
              <th style="width:100px;">Rate/L</th>
              <th style="width:110px;">Amount</th>
              <th style="width:80px;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows; let i = index"
                [class]="row.saved ? 'row-saved' : (row.quantity ? 'row-active' : '')">
              <td class="text-muted" style="font-size:12px;">{{i+1}}</td>
              <td>
                <div class="fw-600" style="font-size:13px;">{{row.farmer.name}}</div>
                <div style="font-size:11px;color:#718096;">{{row.farmer.farmerCode}}</div>
              </td>
              <td>
                <input
                  type="number"
                  class="form-control shift-input"
                  [(ngModel)]="row.quantity"
                  (ngModelChange)="onRowChange(row)"
                  [disabled]="row.saved"
                  placeholder="0.0"
                  step="0.1" min="0"
                  [name]="'qty_'+i">
              </td>
              <td>
                <input
                  type="number"
                  class="form-control shift-input"
                  [(ngModel)]="row.fatPercentage"
                  (ngModelChange)="onRowChange(row)"
                  [disabled]="row.saved"
                  placeholder="4.0"
                  step="0.01" min="0" max="15"
                  [name]="'fat_'+i">
              </td>
              <td>
                <input
                  type="number"
                  class="form-control shift-input"
                  [(ngModel)]="row.snfPercentage"
                  (ngModelChange)="onRowChange(row)"
                  [disabled]="row.saved"
                  placeholder="8.5"
                  step="0.01" min="0" max="20"
                  [name]="'snf_'+i">
              </td>
              <td>
                <span *ngIf="row.ratePerLiter > 0" class="fw-600" style="font-size:13px;">
                  ₹{{row.ratePerLiter | number:'1.2-2'}}
                </span>
                <span *ngIf="row.ratePerLiter === 0" class="text-muted" style="font-size:12px;">—</span>
              </td>
              <td>
                <span *ngIf="row.totalAmount > 0" class="fw-600 text-success" style="font-size:13px;">
                  ₹{{row.totalAmount | number:'1.2-2'}}
                </span>
                <span *ngIf="row.totalAmount === 0" class="text-muted" style="font-size:12px;">—</span>
              </td>
              <td>
                <span *ngIf="row.saved" class="badge badge-success">✓ Saved</span>
                <span *ngIf="row.saving" class="badge badge-secondary">...</span>
                <span *ngIf="row.error" class="badge badge-danger" [title]="row.error">✗ Error</span>
                <span *ngIf="!row.saved && !row.saving && !row.error && row.quantity">
                  <button class="btn btn-primary btn-sm" (click)="saveRow(row)">Save</button>
                </span>
                <span *ngIf="!row.saved && !row.saving && !row.error && !row.quantity" class="text-muted" style="font-size:11px;">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom total -->
    <div *ngIf="filledCount > 0"
         style="margin-top:10px;background:#f0f9f4;border:1px solid #c3e6cb;border-radius:8px;padding:12px 16px;display:flex;gap:24px;align-items:center;">
      <div style="font-size:13px;color:#4a5568;">
        <span class="fw-600">{{filledCount}}</span> farmers &nbsp;|&nbsp;
        <span class="fw-600">{{totalLiters | number:'1.1-1'}} L</span> total milk &nbsp;|&nbsp;
        Avg Fat <span class="fw-600">{{avgFat | number:'1.2-2'}}%</span>
      </div>
      <div style="margin-left:auto;font-size:15px;font-weight:700;color:#27ae60;">
        Total Payable: ₹{{totalAmount | number:'1.2-2'}}
      </div>
    </div>
  `,
  styles: [`
    .shift-btn {
      padding: 6px 14px; font-size: 13px; font-weight: 500;
      border: none; background: #f7fafc; cursor: pointer; color: #4a5568;
      transition: all .15s;
    }
    .shift-btn:first-child { border-right: 1px solid #cbd5e0; }
    .shift-active { background: #3498db !important; color: #fff !important; }

    .shift-summary {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 10px 16px; display: flex; align-items: center; gap: 0;
    }
    .ss-item { text-align: center; padding: 0 18px; }
    .ss-val { display: block; font-size: 18px; font-weight: 700; color: #2d3748; }
    .ss-lbl { display: block; font-size: 11px; color: #718096; margin-top: 1px; }
    .ss-sep { width: 1px; height: 36px; background: #e2e8f0; }

    .shift-input {
      padding: 5px 7px !important; font-size: 13px !important;
      text-align: right;
    }
    .shift-input:disabled { background: #f8fafc; color: #718096; }

    .row-active td { background: #fffbf0 !important; }
    .row-saved td  { background: #f0f9f4 !important; }
  `]
})
export class ShiftCollectionComponent implements OnInit {
  rows: ShiftRow[] = [];
  dateStr = new Date().toISOString().split('T')[0];
  shift: 'morning' | 'evening' = 'morning';
  isSavingAll = false;

  get filledCount()    { return this.rows.filter(r => r.quantity && r.quantity > 0).length; }
  get pendingSaveCount(){ return this.rows.filter(r => r.quantity && r.quantity > 0 && !r.saved).length; }
  get totalLiters()    { return this.rows.filter(r => r.quantity).reduce((s,r) => s + (r.quantity||0), 0); }
  get totalAmount()    { return this.rows.reduce((s,r) => s + r.totalAmount, 0); }
  get avgFat() {
    const filled = this.rows.filter(r => r.fatPercentage && r.quantity);
    return filled.length ? filled.reduce((s,r) => s + (r.fatPercentage||0), 0) / filled.length : 0;
  }

  constructor(
    private farmerSvc: FarmerService,
    private milkSvc: MilkCollectionService
  ) {}

  ngOnInit() {
    // Auto-select shift based on current time
    const h = new Date().getHours();
    this.shift = h < 14 ? 'morning' : 'evening';

    this.farmerSvc.getFarmers().subscribe(farmers => {
      this.rows = farmers
        .filter(f => f.isActive)
        .sort((a, b) => a.farmerCode.localeCompare(b.farmerCode))
        .map(farmer => ({
          farmer,
          quantity: null,
          fatPercentage: null,
          snfPercentage: null,
          ratePerLiter: 0,
          totalAmount: 0,
          saved: false,
          saving: false,
          error: ''
        }));
    });
  }

  setShift(s: 'morning' | 'evening') {
    this.shift = s;
    // Reset unsaved rows when switching shift
    this.rows.forEach(r => {
      if (!r.saved) {
        r.quantity = null; r.fatPercentage = null; r.snfPercentage = null;
        r.ratePerLiter = 0; r.totalAmount = 0; r.error = '';
      }
    });
  }

  onRowChange(row: ShiftRow) {
    const fat = row.fatPercentage || 0;
    const snf = row.snfPercentage || 0;
    const qty = row.quantity || 0;

    if (fat > 0 && snf > 0) {
      const rate = Math.max(25 + (fat - 3.5) * 2.5 + (snf - 8.5) * 1.5, 18);
      row.ratePerLiter = Math.round(rate * 100) / 100;
      row.totalAmount  = Math.round(qty * row.ratePerLiter * 100) / 100;
    } else {
      row.ratePerLiter = 0;
      row.totalAmount  = 0;
    }
  }

  saveRow(row: ShiftRow) {
    if (!row.quantity || row.quantity <= 0) return;
    if (!row.fatPercentage || row.fatPercentage <= 0 || !row.snfPercentage || row.snfPercentage <= 0) {
      row.error = 'Fat % and SNF % are required';
      return;
    }
    row.saving = true;
    row.error  = '';
    const time = this.shift === 'morning' ? '06:00:00' : '17:00:00';

    this.milkSvc.createMilkCollection({
      id: 0,
      farmerId: row.farmer.id,
      collectionDate: new Date(this.dateStr),
      collectionTime: time,
      quantity: row.quantity,
      fatPercentage: row.fatPercentage || 0,
      snfPercentage: row.snfPercentage || 0,
      ratePerLiter: row.ratePerLiter,
      totalAmount: row.totalAmount,
      remarks: `${this.shift} shift`
    }).subscribe({
      next: () => { row.saved = true; row.saving = false; },
      error: () => { row.saving = false; row.error = 'Failed to save'; }
    });
  }

  saveAll() {
    this.isSavingAll = true;
    const pending = this.rows.filter(r => r.quantity && r.quantity > 0 && !r.saved && !r.saving);
    if (pending.length === 0) { this.isSavingAll = false; return; }

    let done = 0;
    pending.forEach(row => {
      row.saving = true;
      const time = this.shift === 'morning' ? '06:00:00' : '17:00:00';

      this.milkSvc.createMilkCollection({
        id: 0,
        farmerId: row.farmer.id,
        collectionDate: new Date(this.dateStr),
        collectionTime: time,
        quantity: row.quantity!,
        fatPercentage: row.fatPercentage || 0,
        snfPercentage: row.snfPercentage || 0,
        ratePerLiter: row.ratePerLiter,
        totalAmount: row.totalAmount,
        remarks: `${this.shift} shift`
      }).subscribe({
        next: () => {
          row.saved = true; row.saving = false;
          done++;
          if (done === pending.length) this.isSavingAll = false;
        },
        error: () => {
          row.saving = false; row.error = 'Failed';
          done++;
          if (done === pending.length) this.isSavingAll = false;
        }
      });
    });
  }
}

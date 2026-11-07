import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { LedgerService, LedgerEntry } from '../../services/ledger.service';
import { PaymentService, Payment } from '../../services/payment.service';
import { Farmer } from '../../models/farmer.model';

const ENTRY_TYPE: Record<number, string> = { 1: 'Milk Collection', 2: 'Payment', 3: 'Adjustment', 4: 'Deduction' };
const ENTRY_BADGE: Record<number, string> = { 1: 'badge badge-info', 2: 'badge badge-success', 3: 'badge badge-secondary', 4: 'badge badge-danger' };

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">📒 Ledger</span>
    </div>

    <!-- Filter -->
    <div class="card" style="margin-bottom:12px;">
      <div class="card-body" style="padding:10px 14px;">
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div>
            <label class="form-label">Farmer</label>
            <select class="form-select" [(ngModel)]="selectedFarmer" (change)="load()" style="width:220px;">
              <option value="0">— Select Farmer —</option>
              <option *ngFor="let f of farmers" [value]="f.id">{{f.farmerCode}} – {{f.name}}</option>
            </select>
          </div>
          <div>
            <label class="form-label">From</label>
            <input type="date" class="form-control" [(ngModel)]="from" style="width:140px;">
          </div>
          <div>
            <label class="form-label">To</label>
            <input type="date" class="form-control" [(ngModel)]="to" style="width:140px;">
          </div>
          <button class="btn btn-primary btn-sm" (click)="load()">Load</button>
          <div style="display:flex;align-items:center;gap:6px;font-size:13px;">
            <input type="checkbox" id="showAll" [(ngModel)]="showAll" (change)="applyFilter()">
            <label for="showAll">Show all transactions</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Balance summary -->
    <div class="row" style="margin-bottom:12px;" *ngIf="farmer">
      <div class="col-4">
        <div class="stat-card bg-green">
          <div class="stat-val">₹{{totalDebit|number:'1.0-0'}}</div>
          <div class="stat-lbl">Total Milk Earned</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stat-card bg-blue">
          <div class="stat-val">₹{{totalCredit|number:'1.0-0'}}</div>
          <div class="stat-lbl">Total Paid Out</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stat-card" [class]="netBalance>=0?'bg-orange':'bg-purple'">
          <div class="stat-val">₹{{netBalance|number:'1.0-0'}}</div>
          <div class="stat-lbl">Net Balance (Payable)</div>
        </div>
      </div>
    </div>

    <!-- Ledger table -->
    <div class="card">
      <div class="card-header">
        <span>Ledger{{farmer ? ' — ' + farmer.name : ''}}</span>
        <span style="font-size:12px;color:#718096;">{{filtered.length}} entries</span>
      </div>
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr><th>Date & Time</th><th>Type</th><th>Description</th><th>Debit (Earned)</th><th>Credit (Paid)</th><th>Balance</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filtered">
              <td style="white-space:nowrap;">{{e.transactionDate|date:'dd/MM/yy HH:mm'}}</td>
              <td><span class="badge" [class]="getTypeBadge(e.entryType)">{{getTypeLabel(e.entryType)}}</span></td>
              <td>{{e.description}}</td>
              <td class="fw-600" [class]="e.debitAmount>0?'text-success':''">
                {{e.debitAmount>0 ? '₹'+( e.debitAmount|number:'1.2-2') : '—'}}
              </td>
              <td class="fw-600" [class]="e.creditAmount>0?'text-primary':''">
                {{e.creditAmount>0 ? '₹'+(e.creditAmount|number:'1.2-2') : '—'}}
              </td>
              <td class="fw-600">₹{{e.balance|number:'1.2-2'}}</td>
            </tr>
            <tr *ngIf="filtered.length===0">
              <td colspan="6" style="text-align:center;padding:24px;color:#718096;">
                {{selectedFarmer==='0' ? 'Select a farmer to view ledger' : 'No entries found'}}
              </td>
            </tr>
          </tbody>
          <tfoot *ngIf="filtered.length>0">
            <tr style="background:#f8fafc;font-weight:700;">
              <td colspan="3">Total</td>
              <td class="text-success">₹{{totalDebit|number:'1.2-2'}}</td>
              <td class="text-primary">₹{{totalCredit|number:'1.2-2'}}</td>
              <td class="fw-600">₹{{netBalance|number:'1.2-2'}}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
})
export class LedgerComponent implements OnInit {
  farmers: Farmer[] = [];
  farmer: Farmer | null = null;
  allEntries: LedgerEntry[] = [];
  filtered: LedgerEntry[] = [];
  selectedFarmer = '0';
  from = '';
  to = '';
  showAll = false;
  totalDebit = 0; totalCredit = 0; netBalance = 0;

  constructor(
    private farmerSvc: FarmerService,
    private ledgerSvc: LedgerService,
    private paymentSvc: PaymentService
  ) {}

  ngOnInit() {
    const now = new Date();
    this.from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    this.to   = now.toISOString().split('T')[0];
    this.farmerSvc.getFarmers().subscribe(f => this.farmers = f);
  }

  load() {
    if (this.selectedFarmer === '0') return;
    this.farmer = this.farmers.find(f => f.id === +this.selectedFarmer) || null;
    this.ledgerSvc.getByFarmer(+this.selectedFarmer).subscribe(entries => {
      this.allEntries = entries;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (this.showAll) {
      this.filtered = this.allEntries;
    } else {
      this.filtered = this.allEntries.filter(e => {
        const d = new Date(e.transactionDate).toISOString().split('T')[0];
        return d >= this.from && d <= this.to;
      });
    }
    this.totalDebit  = this.filtered.reduce((s, e) => s + e.debitAmount, 0);
    this.totalCredit = this.filtered.reduce((s, e) => s + e.creditAmount, 0);
    this.netBalance  = this.totalDebit - this.totalCredit;
  }

  getTypeLabel(t: number) { return ENTRY_TYPE[t] || 'Unknown'; }
  getTypeBadge(t: number) { return ENTRY_BADGE[t] || 'badge badge-secondary'; }
}

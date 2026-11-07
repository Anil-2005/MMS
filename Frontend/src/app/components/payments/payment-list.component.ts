import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { MilkCollectionService } from '../../services/milk-collection.service';
import { PaymentService, Payment } from '../../services/payment.service';
import { Farmer } from '../../models/farmer.model';
import { MilkCollection } from '../../models/milk-collection.model';

interface PaymentRow {
  farmer: Farmer;
  monthLiters: number;
  monthAmount: number;
  paidPayments: Payment[];
  totalPaid: number;
  pending: number;
}

const METHOD_MAP: Record<string, number> = { Cash: 1, 'Bank Transfer': 2, Cheque: 3, UPI: 4 };
const METHOD_LABEL: Record<number, string> = { 1: 'Cash', 2: 'Bank Transfer', 3: 'Cheque', 4: 'UPI' };

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">💰 Payments</span>
      <select class="form-select" style="width:auto;font-size:13px;padding:5px 10px;" [(ngModel)]="selectedMonth" (change)="loadData()">
        <option *ngFor="let m of months" [value]="m.value">{{m.label}}</option>
      </select>
    </div>

    <!-- Stats -->
    <div class="row" style="margin-bottom:12px;">
      <div class="col-3"><div class="stat-card bg-blue"><div class="stat-val">₹{{totalEarned|number:'1.0-0'}}</div><div class="stat-lbl">Month Earned</div></div></div>
      <div class="col-3"><div class="stat-card bg-green"><div class="stat-val">₹{{totalPaid|number:'1.0-0'}}</div><div class="stat-lbl">Total Paid</div></div></div>
      <div class="col-3"><div class="stat-card bg-orange"><div class="stat-val">₹{{totalPending|number:'1.0-0'}}</div><div class="stat-lbl">Pending</div></div></div>
      <div class="col-3"><div class="stat-card bg-purple"><div class="stat-val">{{monthLiters|number:'1.0-0'}} L</div><div class="stat-lbl">Total Milk</div></div></div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-header">Farmer Payment Status — {{selectedMonthLabel}}</div>
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr><th>#</th><th>Farmer</th><th>Total Qty (L)</th><th>Month Earned</th><th>Total Paid</th><th>Pending</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of paymentRows; let i = index">
              <td class="text-muted">{{i+1}}</td>
              <td>
                <div class="fw-600">{{row.farmer.name}}</div>
                <div style="font-size:11px;color:#718096;">{{row.farmer.farmerCode}}</div>
              </td>
              <td>{{row.monthLiters|number:'1.1-1'}} L</td>
              <td class="fw-600">₹{{row.monthAmount|number:'1.2-2'}}</td>
              <td class="text-success fw-600">₹{{row.totalPaid|number:'1.2-2'}}</td>
              <td>
                <span class="fw-600" [class]="row.pending>0?'text-danger':'text-success'">
                  ₹{{row.pending|number:'1.2-2'}}
                </span>
              </td>
              <td><span class="badge" [class]="getStatusBadge(row)">{{getStatus(row)}}</span></td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="openModal(row)" [disabled]="row.pending<=0">Pay</button>
                <button class="btn btn-outline btn-sm" style="margin-left:4px;" (click)="openHistory(row)">History</button>
              </td>
            </tr>
            <tr *ngIf="paymentRows.length===0">
              <td colspan="8" style="text-align:center;padding:24px;color:#718096;">No data for this month</td>
            </tr>
          </tbody>
          <tfoot *ngIf="paymentRows.length>0">
            <tr style="background:#f8fafc;font-weight:700;">
              <td colspan="2">Total</td>
              <td>{{monthLiters|number:'1.1-1'}} L</td>
              <td>₹{{totalEarned|number:'1.2-2'}}</td>
              <td class="text-success">₹{{totalPaid|number:'1.2-2'}}</td>
              <td class="text-danger">₹{{totalPending|number:'1.2-2'}}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Pay Modal -->
    <div *ngIf="showPayModal" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:10px;width:420px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.3);">
        <div style="font-size:15px;font-weight:700;margin-bottom:16px;">💰 Process Payment — {{modalRow?.farmer?.name}}</div>
        <div style="background:#f8fafc;border-radius:6px;padding:12px;margin-bottom:14px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span class="text-muted">Month Earned</span><span class="fw-600">₹{{modalRow?.monthAmount|number:'1.2-2'}}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span class="text-muted">Already Paid</span><span class="fw-600">₹{{modalRow?.totalPaid|number:'1.2-2'}}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:6px;font-weight:700;">
            <span>Net Payable</span><span class="text-success">₹{{modalRow?.pending|number:'1.2-2'}}</span>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label class="form-label">Amount</label>
          <input type="number" class="form-control" [(ngModel)]="payAmount" step="0.01" min="1">
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label class="form-label">Payment Method</label>
          <select class="form-select" [(ngModel)]="payMethod">
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label class="form-label">Reference No.</label>
          <input type="text" class="form-control" [(ngModel)]="payRef" placeholder="Optional">
        </div>
        <div class="form-group" style="margin-bottom:14px;">
          <label class="form-label">Remarks</label>
          <input type="text" class="form-control" [(ngModel)]="payRemarks" placeholder="Optional">
        </div>
        <div *ngIf="payError" style="color:#c53030;font-size:13px;margin-bottom:10px;">{{payError}}</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-success" (click)="confirmPayment()" [disabled]="payAmount<=0||saving">
            {{saving?'Saving...':'✓ Confirm Payment'}}
          </button>
          <button class="btn btn-outline" (click)="showPayModal=false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div *ngIf="showHistoryModal" style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:10px;width:520px;max-height:80vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <span style="font-size:15px;font-weight:700;">Payment History — {{historyRow?.farmer?.name}}</span>
          <button class="btn btn-outline btn-sm" (click)="showHistoryModal=false">✕</button>
        </div>
        <table class="table">
          <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Ref#</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of historyRow?.paidPayments">
              <td>{{p.paymentDate|date:'dd/MM/yy HH:mm'}}</td>
              <td class="fw-600 text-success">₹{{p.amount|number:'1.2-2'}}</td>
              <td>{{getMethodLabel(p.paymentMethod)}}</td>
              <td class="text-muted">{{p.referenceNumber||'—'}}</td>
            </tr>
            <tr *ngIf="!historyRow?.paidPayments?.length">
              <td colspan="4" style="text-align:center;color:#718096;padding:16px;">No payments yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PaymentListComponent implements OnInit {
  paymentRows: PaymentRow[] = [];
  farmers: Farmer[] = [];
  months: { value: string; label: string }[] = [];
  selectedMonth = '';
  selectedMonthLabel = '';
  monthLiters = 0; totalEarned = 0; totalPaid = 0; totalPending = 0;

  showPayModal = false;
  showHistoryModal = false;
  modalRow: PaymentRow | null = null;
  historyRow: PaymentRow | null = null;
  payAmount = 0; payMethod = 'Cash'; payRef = ''; payRemarks = ''; payError = ''; saving = false;

  constructor(
    private farmerSvc: FarmerService,
    private milkSvc: MilkCollectionService,
    private paymentSvc: PaymentService
  ) {}

  ngOnInit() {
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      this.months.push({ value: val, label: d.toLocaleDateString('en-IN', { month:'long', year:'numeric' }) });
    }
    this.selectedMonth = this.months[0].value;
    this.farmerSvc.getFarmers().subscribe(f => { this.farmers = f; this.loadData(); });
  }

  loadData() {
    const [yr, mo] = this.selectedMonth.split('-').map(Number);
    const start = `${yr}-${String(mo).padStart(2,'0')}-01`;
    const end   = new Date(yr, mo, 0).toISOString().split('T')[0];
    const label = this.months.find(m => m.value === this.selectedMonth);
    this.selectedMonthLabel = label?.label || '';

    // Load both milk collections and payments for the selected month
    this.milkSvc.getMilkCollectionsByDateRange(start, end).subscribe(cols => {
      this.paymentSvc.getByDateRange(start, end).subscribe(monthPayments => {
        this.buildRows(cols, monthPayments);
      });
    });
  }

  buildRows(cols: MilkCollection[], monthPayments: Payment[]) {
    const milkMap = new Map<number, MilkCollection[]>();
    cols.forEach(c => { if (!milkMap.has(c.farmerId)) milkMap.set(c.farmerId, []); milkMap.get(c.farmerId)!.push(c); });

    this.paymentRows = this.farmers
      .filter(f => f.isActive)
      .map(farmer => {
        const fCols = milkMap.get(farmer.id) || [];
        const monthAmount = fCols.reduce((s, c) => s + c.totalAmount, 0);
        const paidPayments = monthPayments.filter(p => p.farmerId === farmer.id);
        const totalPaid = paidPayments.reduce((s, p) => s + p.amount, 0);
        return {
          farmer,
          monthLiters: fCols.reduce((s, c) => s + c.quantity, 0),
          monthAmount,
          paidPayments,
          totalPaid,
          pending: Math.max(monthAmount - totalPaid, 0)
        };
      })
      .filter(r => r.monthAmount > 0 || r.totalPaid > 0 || r.farmer.accountBalance > 0)
      .sort((a, b) => b.pending - a.pending);

    this.monthLiters  = this.paymentRows.reduce((s, r) => s + r.monthLiters, 0);
    this.totalEarned  = this.paymentRows.reduce((s, r) => s + r.monthAmount, 0);
    this.totalPaid    = this.paymentRows.reduce((s, r) => s + r.totalPaid, 0);
    this.totalPending = this.paymentRows.reduce((s, r) => s + r.pending, 0);
  }

  openModal(row: PaymentRow) {
    this.modalRow  = row;
    this.payAmount = Math.round(row.pending * 100) / 100;
    this.payMethod = 'Cash'; this.payRef = ''; this.payRemarks = ''; this.payError = '';
    this.showPayModal = true;
  }

  openHistory(row: PaymentRow) { this.historyRow = row; this.showHistoryModal = true; }

  confirmPayment() {
    if (!this.modalRow || this.payAmount <= 0) return;
    this.saving = true; this.payError = '';

    const payment: Payment = {
      id: 0,
      farmerId: this.modalRow.farmer.id,
      paymentDate: new Date(),
      amount: this.payAmount,
      paymentMethod: METHOD_MAP[this.payMethod] || 1,
      referenceNumber: this.payRef || undefined,
      remarks: this.payRemarks || undefined
    };

    this.paymentSvc.create(payment).subscribe({
      next: saved => {
        this.saving = false;
        this.showPayModal = false;
        // Update row locally
        this.modalRow!.paidPayments.push(saved);
        this.modalRow!.totalPaid += saved.amount;
        this.modalRow!.pending = Math.max(this.modalRow!.monthAmount - this.modalRow!.totalPaid, 0);
        this.totalPaid    += saved.amount;
        this.totalPending -= saved.amount;
      },
      error: err => {
        this.saving = false;
        this.payError = err.error?.message || 'Payment failed. Try again.';
      }
    });
  }

  getStatus(row: PaymentRow): string {
    if (row.monthAmount === 0) return 'No Data';
    if (row.pending <= 0) return 'Paid';
    if (row.totalPaid > 0) return 'Partial';
    return 'Pending';
  }

  getStatusBadge(row: PaymentRow): string {
    const s = this.getStatus(row);
    return s === 'Paid' ? 'badge badge-success' : s === 'Partial' ? 'badge badge-warning' : 'badge badge-danger';
  }

  getMethodLabel(m: number): string { return METHOD_LABEL[m] || 'Unknown'; }
}

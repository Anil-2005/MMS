import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MilkCollectionService } from '../../services/milk-collection.service';
import { FarmerService } from '../../services/farmer.service';
import { MilkCollection } from '../../models/milk-collection.model';
import { Farmer } from '../../models/farmer.model';

@Component({
  selector: 'app-milk-collection-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:700px;">
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">
        <button class="btn btn-outline btn-sm" (click)="goBack()">← Back</button>
        <span style="font-size:15px;font-weight:700;color:#2d3748;">Record Milk Collection</span>
      </div>

      <div class="card">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #f="ngForm">

            <!-- Farmer + Date + Time -->
            <div class="row" style="gap:10px;margin-bottom:10px;">
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Farmer *</label>
                  <select class="form-select" name="farmerId" [(ngModel)]="collection.farmerId" required>
                    <option value="0">— Select Farmer —</option>
                    <option *ngFor="let farmer of farmers" [value]="farmer.id">
                      {{farmer.farmerCode}} – {{farmer.name}}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-3">
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input type="date" class="form-control" name="date" [(ngModel)]="dateStr" required>
                </div>
              </div>
              <div class="col-3">
                <div class="form-group">
                  <label class="form-label">Session</label>
                  <select class="form-select" name="session" [(ngModel)]="session" (change)="applySession()">
                    <option value="morning">Morning (06:00)</option>
                    <option value="evening">Evening (17:00)</option>
                    <option value="custom">Custom Time</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row" style="gap:10px;margin-bottom:10px;" *ngIf="session === 'custom'">
              <div class="col-4">
                <div class="form-group">
                  <label class="form-label">Time</label>
                  <input type="time" class="form-control" name="time" [(ngModel)]="collection.collectionTime" required>
                </div>
              </div>
            </div>

            <!-- Quantity + Fat + SNF -->
            <div class="row" style="gap:10px;margin-bottom:10px;">
              <div class="col-4">
                <div class="form-group">
                  <label class="form-label">Quantity (Liters) *</label>
                  <input type="number" class="form-control" name="qty"
                    [(ngModel)]="collection.quantity"
                    (ngModelChange)="recalculate()"
                    step="0.1" min="0" required placeholder="0.0">
                </div>
              </div>
              <div class="col-4">
                <div class="form-group">
                  <label class="form-label">Fat % *</label>
                  <input type="number" class="form-control" name="fat"
                    [(ngModel)]="collection.fatPercentage"
                    (ngModelChange)="recalculate()"
                    step="0.01" min="0" max="15" required placeholder="e.g. 4.2">
                  <span class="form-hint">Normal: 3.0–7.0%</span>
                </div>
              </div>
              <div class="col-4">
                <div class="form-group">
                  <label class="form-label">SNF % *</label>
                  <input type="number" class="form-control" name="snf"
                    [(ngModel)]="collection.snfPercentage"
                    (ngModelChange)="recalculate()"
                    step="0.01" min="0" max="20" required placeholder="e.g. 8.5">
                  <span class="form-hint">Normal: 8.0–10.0%</span>
                </div>
              </div>
            </div>

            <!-- Live Rate Preview -->
            <div class="rate-preview" *ngIf="collection.quantity > 0">
              <div class="rp-row">
                <span class="rp-lbl">Rate per Liter</span>
                <span class="rp-val">₹{{collection.ratePerLiter | number:'1.2-2'}}</span>
              </div>
              <div class="rp-row">
                <span class="rp-lbl">Quantity</span>
                <span class="rp-val">{{collection.quantity | number:'1.2-2'}} L</span>
              </div>
              <div class="rp-row">
                <span class="rp-lbl">Fat Bonus ({{collection.fatPercentage}}%)</span>
                <span class="rp-val">₹{{fatBonus | number:'1.2-2'}}/L</span>
              </div>
              <div class="rp-row">
                <span class="rp-lbl rp-total">Total Payable</span>
                <span class="rp-val rp-total">₹{{collection.totalAmount | number:'1.2-2'}}</span>
              </div>
            </div>

            <div class="form-group" style="margin-top:10px;">
              <label class="form-label">Remarks</label>
              <input type="text" class="form-control" name="remarks" [(ngModel)]="collection.remarks" placeholder="Optional note">
            </div>

            <div style="display:flex;gap:8px;margin-top:14px;">
              <button type="submit" class="btn btn-success" [disabled]="f.invalid || collection.farmerId === 0 || saving">
                {{saving ? 'Saving...' : '💾 Save Collection'}}
              </button>
              <button type="button" class="btn btn-outline" (click)="goBack()">Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `
})
export class MilkCollectionFormComponent implements OnInit {
  collection: MilkCollection = {
    id: 0, farmerId: 0,
    collectionDate: new Date(), collectionTime: '06:00',
    quantity: 0, fatPercentage: 0, snfPercentage: 0,
    ratePerLiter: 0, totalAmount: 0, remarks: ''
  };

  farmers: Farmer[] = [];
  dateStr = new Date().toISOString().split('T')[0];
  session = 'morning';
  fatBonus = 0;
  saving = false;

  constructor(
    private milkService: MilkCollectionService,
    private farmerService: FarmerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.farmerService.getFarmers().subscribe(f => {
      this.farmers = f.filter(x => x.isActive);
    });
    this.applySession();
  }

  applySession() {
    if (this.session === 'morning') this.collection.collectionTime = '06:00';
    else if (this.session === 'evening') this.collection.collectionTime = '17:00';
  }

  recalculate() {
    const BASE_RATE = 25;
    const fat = this.collection.fatPercentage || 0;
    const snf = this.collection.snfPercentage || 0;
    this.fatBonus = (fat - 3.5) * 2.5;
    const snfBonus = (snf - 8.5) * 1.5;
    const rate = Math.max(BASE_RATE + this.fatBonus + snfBonus, 18);
    this.collection.ratePerLiter = Math.round(rate * 100) / 100;
    this.collection.totalAmount  = Math.round(this.collection.quantity * this.collection.ratePerLiter * 100) / 100;
  }

  onSubmit() {
    this.saving = true;
    this.collection.collectionDate = new Date(this.dateStr);
    this.milkService.createMilkCollection(this.collection).subscribe({
      next: () => this.router.navigate(['/milk-collection']),
      error: () => { this.saving = false; alert('Failed to save. Check console.'); }
    });
  }

  goBack() { this.router.navigate(['/milk-collection']); }
}

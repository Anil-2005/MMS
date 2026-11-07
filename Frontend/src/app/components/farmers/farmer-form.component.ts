import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { Farmer } from '../../models/farmer.model';

@Component({
  selector: 'app-farmer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width:600px;">
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:10px;">
        <button class="btn btn-outline btn-sm" (click)="back()">← Back</button>
        <span style="font-size:15px;font-weight:700;color:#2d3748;">{{isEdit ? 'Edit' : 'Add'}} Farmer</span>
      </div>

      <div class="card">
        <div class="card-body">
          <form (ngSubmit)="submit()" #frm="ngForm">
            <div class="row" style="gap:10px;margin-bottom:10px;">
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Farmer Code *</label>
                  <input type="text" class="form-control" name="code" [(ngModel)]="f.farmerCode" required placeholder="e.g. F001">
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" name="name" [(ngModel)]="f.name" required placeholder="Farmer name">
                </div>
              </div>
            </div>
            <div class="row" style="gap:10px;margin-bottom:10px;">
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" name="phone" [(ngModel)]="f.phoneNumber" placeholder="10-digit number">
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label class="form-label">Account Balance (₹)</label>
                  <input type="number" class="form-control" name="balance" [(ngModel)]="f.accountBalance" step="0.01" placeholder="0.00" [disabled]="isEdit">
                  <span *ngIf="isEdit" class="form-hint">Managed automatically via Ledger</span>
                </div>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:10px;">
              <label class="form-label">Address</label>
              <textarea class="form-control" name="address" [(ngModel)]="f.address" rows="2" placeholder="Village, Taluka, District"></textarea>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
              <input type="checkbox" id="active" name="active" [(ngModel)]="f.isActive">
              <label for="active" style="font-size:13px;cursor:pointer;">Active Farmer</label>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="submit" class="btn btn-primary" [disabled]="frm.invalid || saving">
                {{saving ? 'Saving...' : (isEdit ? '✓ Update' : '+ Add Farmer')}}
              </button>
              <button type="button" class="btn btn-outline" (click)="back()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class FarmerFormComponent implements OnInit {
  f: Farmer = { id:0, farmerCode:'', name:'', phoneNumber:'', address:'', registrationDate: new Date(), isActive:true, accountBalance:0 };
  isEdit = false;
  saving = false;

  constructor(private svc: FarmerService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEdit = true; this.svc.getFarmer(+id).subscribe(x => this.f = x); }
  }

  submit() {
    this.saving = true;
    if (this.isEdit) {
      this.svc.updateFarmer(this.f).subscribe({
        next: () => this.router.navigate(['/farmers']),
        error: () => { this.saving = false; alert('Save failed.'); }
      });
    } else {
      this.svc.createFarmer(this.f).subscribe({
        next: () => this.router.navigate(['/farmers']),
        error: () => { this.saving = false; alert('Save failed.'); }
      });
    }
  }

  back() { this.router.navigate(['/farmers']); }
}

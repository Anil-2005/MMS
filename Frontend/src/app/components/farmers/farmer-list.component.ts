import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { Farmer } from '../../models/farmer.model';

@Component({
  selector: 'app-farmer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">👨‍🌾 Farmers</span>
      <a routerLink="/farmers/add" class="btn btn-primary btn-sm">+ Add Farmer</a>
    </div>

    <!-- Search -->
    <div class="card" style="margin-bottom:12px;">
      <div class="card-body" style="padding:10px 14px;">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="text" class="form-control" [(ngModel)]="search" (ngModelChange)="filter()"
            placeholder="Search by name, code or phone..." style="max-width:320px;">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
            <input type="checkbox" [(ngModel)]="showInactive" (change)="filter()"> Show Inactive
          </label>
          <span class="text-muted" style="font-size:12px;margin-left:auto;">{{filtered.length}} records</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th><th>Name</th><th>Phone</th>
              <th>Registered</th><th>Balance</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of pagedData">
              <td><span class="badge badge-secondary">{{f.farmerCode}}</span></td>
              <td class="fw-600">{{f.name}}</td>
              <td class="text-muted">{{f.phoneNumber}}</td>
              <td class="text-muted">{{f.registrationDate | date:'dd/MM/yy'}}</td>
              <td class="fw-600" [class]="f.accountBalance >= 0 ? 'text-success' : 'text-danger'">
                ₹{{f.accountBalance | number:'1.2-2'}}
              </td>
              <td>
                <span class="badge" [class]="f.isActive ? 'badge-success' : 'badge-danger'">
                  {{f.isActive ? 'Active' : 'Inactive'}}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:4px;">
                  <a [routerLink]="['/farmers/edit', f.id]" class="btn btn-primary btn-sm">Edit</a>
                  <button (click)="delete(f.id)" class="btn btn-danger btn-sm">✕</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="pagedData.length===0">
              <td colspan="7" style="text-align:center;padding:24px;color:#718096;">No farmers found</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="pagination-bar">
          <div class="pagination-info">
            Showing {{(currentPage-1)*pageSize + 1}} - {{Math.min(currentPage*pageSize, filtered.length)}} of {{filtered.length}}
          </div>
          <div class="pagination-controls">
            <button class="page-btn" (click)="goToPage(1)" [disabled]="currentPage===1">««</button>
            <button class="page-btn" (click)="goToPage(currentPage-1)" [disabled]="currentPage===1">«</button>
            
            <ng-container *ngFor="let p of visiblePages">
              <button class="page-btn" 
                [class.page-active]="p===currentPage"
                (click)="goToPage(p)" 
                *ngIf="p!==-1">{{p}}</button>
              <span class="page-ellipsis" *ngIf="p===-1">...</span>
            </ng-container>
            
            <button class="page-btn" (click)="goToPage(currentPage+1)" [disabled]="currentPage===totalPages">»</button>
            <button class="page-btn" (click)="goToPage(totalPages)" [disabled]="currentPage===totalPages">»»</button>
          </div>
          <div class="pagination-size">
            <label>Per page:</label>
            <select class="form-select" [(ngModel)]="pageSize" (change)="filter()">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagination-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-top: 1px solid #e2e8f0;
      background: #fafbfc;
    }
    .pagination-info { font-size: 13px; color: #718096; }
    .pagination-controls { display: flex; gap: 4px; }
    .page-btn {
      min-width: 32px; height: 32px; border: 1px solid #e2e8f0;
      background: #fff; border-radius: 4px; cursor: pointer;
      font-size: 13px; color: #4a5568;
    }
    .page-btn:hover:not(:disabled) { background: #f7fafc; border-color: #cbd5e0; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-active { background: #3498db !important; color: #fff !important; border-color: #3498db !important; }
    .page-ellipsis { padding: 0 6px; color: #718096; }
    .pagination-size { display: flex; align-items: center; gap: 8px; }
    .pagination-size label { font-size: 13px; color: #718096; }
    .pagination-size select { width: 70px; padding: 4px 8px; font-size: 13px; }
  `]
})
export class FarmerListComponent implements OnInit {
  farmers: Farmer[] = [];
  filtered: Farmer[] = [];
  pagedData: Farmer[] = [];
  
  search = '';
  showInactive = false;
  
  pageSize = 25;
  currentPage = 1;
  totalPages = 1;
  Math = Math;

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.currentPage;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push(-1); // ellipsis
      
      const start = Math.max(2, cur - 1);
      const end = Math.min(total - 1, cur + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (cur < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }
    return pages;
  }

  constructor(private farmerService: FarmerService) {}

  ngOnInit() { 
    this.farmerService.getFarmers().subscribe(f => { 
      this.farmers = f; 
      this.filter(); 
    }); 
  }

  filter() {
    const q = this.search.toLowerCase();
    this.filtered = this.farmers.filter(f =>
      (this.showInactive || f.isActive) &&
      (!q || f.name.toLowerCase().includes(q) || f.farmerCode.toLowerCase().includes(q) || f.phoneNumber.includes(q))
    );
    this.currentPage = 1;
    this.updatePage();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  updatePage() {
    this.totalPages = Math.ceil(this.filtered.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.filtered.slice(start, end);
  }

  delete(id: number) {
    if (confirm('Delete this farmer?')) {
      this.farmerService.deleteFarmer(id).subscribe(() => {
        this.farmers = this.farmers.filter(f => f.id !== id);
        this.filter();
      });
    }
  }
}
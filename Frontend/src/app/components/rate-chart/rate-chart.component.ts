import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rate-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="margin-bottom:12px;">
      <span style="font-size:15px;font-weight:700;color:#2d3748;">📋 Rate Chart</span>
    </div>

    <div class="card">
      <div class="card-header">Current Rate Structure</div>
      <div class="card-body" style="padding:0;">
        <table class="table">
          <thead>
            <tr><th>Fat %</th><th>SNF %</th><th>Base Rate</th><th>Fat Bonus/1%</th><th>SNF Bonus/1%</th><th>Effective Rate*</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rates">
              <td>{{r.fat}}</td>
              <td>{{r.snf}}</td>
              <td>₹25.00</td>
              <td>₹2.50</td>
              <td>₹1.50</td>
              <td class="fw-600 text-success">₹{{r.rate | number:'1.2-2'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top:12px;padding:12px 14px;background:#fff3cd;border-radius:8px;font-size:13px;color:#856404;">
      * Rate = Base Rate (₹25) + (Fat% − 3.5) × ₹2.50 + (SNF% − 8.5) × ₹1.50. Minimum rate ₹18/L.
    </div>
  `
})
export class RateChartComponent {
  rates = [
    { fat: '3.5%', snf: '8.5%', rate: 25.00 },
    { fat: '4.0%', snf: '8.5%', rate: 26.25 },
    { fat: '4.5%', snf: '8.5%', rate: 27.50 },
    { fat: '5.0%', snf: '8.5%', rate: 28.75 },
    { fat: '5.5%', snf: '9.0%', rate: 31.25 },
    { fat: '6.0%', snf: '9.0%', rate: 32.50 },
    { fat: '4.0%', snf: '9.0%', rate: 27.00 },
    { fat: '4.5%', snf: '9.5%', rate: 30.25 },
  ];
}

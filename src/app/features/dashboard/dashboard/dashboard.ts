import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  DashboardData,
  DashboardService
} from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private dashboardService = inject(DashboardService);

  dashboardData: DashboardData | null = null;

  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage =
          'Unable to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }

  retry(): void {
    this.loadDashboard();
  }

  getPercentage(count: number): number {
    if (!this.dashboardData?.totalAccounts) {
      return 0;
    }

    return (count / this.dashboardData.totalAccounts) * 100;
  }
}
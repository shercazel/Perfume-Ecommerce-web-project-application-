import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  stats = [
    {
      label: 'Total Orders',
      value: '0',
      icon: 'fa-bag-shopping',
      trend: '0% vs last month',
    },
    {
      label: 'Total Sales',
      value: 'PHP 0.00',
      icon: 'fa-dollar-sign',
      trend: '0% vs last month',
    },
    {
      label: 'Total Users',
      value: '0',
      icon: 'fa-user',
      trend: '0% vs last month',
    },
    {
      label: 'Total Products',
      value: '0',
      icon: 'fa-cube',
      trend: '0% vs last month',
    },
  ];

  orderFilters = ['All', 'Pending', 'Shipped', 'Delivered'];

  orders: {
    id: string;
    customer: string;
    status: string;
    total: string;
    date: string;
  }[] = [];

  topProducts: { rank: number; name: string; sales: string }[] = [];

  salesPoints = [0, 0, 0, 0, 0, 0, 0, 0];
  trendBars = [0, 0, 0, 0, 0];
  trendLabels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 29'];

  statusLegend = [
    { label: 'Delivered (0%)', color: '#31d33b' },
    { label: 'Pending (0%)', color: '#ffd24d' },
    { label: 'Shipped (0%)', color: '#35a8f3' },
  ];

  getStatusClass(status: string) {
    return status.toLowerCase();
  }

  getTrendHeight(value: number) {
    return `${Math.max(value / 4, 2)}px`;
  }

  getChartPoint(index: number, value: number) {
    const x = 8 + index * 13;
    const y = 88 - value / 520;

    return `${x},${y}`;
  }

  getSalesPolyline() {
    return this.salesPoints
      .map((value, index) => this.getChartPoint(index, value))
      .join(' ');
  }

  getProductImage(index: number) {
    const images = [
      'assets/images/carouselImage/honeyPerf.svg',
      'assets/images/carouselImage/romanceImg.svg',
      'assets/images/carouselImage/perfBlue.png',
      'assets/images/carouselImage/honeyPerf.svg',
    ];

    return images[index];
  }
}

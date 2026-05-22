import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  navGroups = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'fa-house', route: '/admin' },
        { label: 'Products', icon: 'fa-cube', route: '/admin/products' },
        { label: 'Orders', icon: 'fa-bag-shopping', route: '/admin/orders' },
        { label: 'Users', icon: 'fa-users', route: '/admin/users' },
        { label: 'Categories', icon: 'fa-tags', route: '/admin/categories' },
        { label: 'Banners', icon: 'fa-table-columns', route: '/admin/banners' },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Sales', icon: 'fa-chart-simple', route: '/admin/sales' },
        { label: 'Top Products', icon: 'fa-trophy', route: '/admin/top-products' },
        { label: 'User Trends', icon: 'fa-chart-line', route: '/admin/user-trends' },
        { label: 'Reports', icon: 'fa-book', route: '/admin/reports' },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Profile', icon: 'fa-circle-user', route: '/admin/profile' },
        { label: 'Settings', icon: 'fa-gear', route: '/admin/settings' },
      ],
    },
  ];
}

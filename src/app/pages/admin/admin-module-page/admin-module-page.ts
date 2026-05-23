import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-module-page',
  imports: [RouterLink],
  templateUrl: './admin-module-page.html',
  styleUrl: './admin-module-page.css',
})
export class AdminModulePage {
  constructor(private route: ActivatedRoute) {}

  get title() {
    return this.route.snapshot.data['title'] || 'Module';
  }

  get description() {
    return (
      this.route.snapshot.data['description'] ||
      'This module is ready for your records and controls.'
    );
  }
}

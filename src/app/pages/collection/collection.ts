import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-collection',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './collection.html',
  styleUrl: './collection.css',
})
export class Collection {
  drawerOpen = false;

  categories = [
    { label: 'All Categories', path: '/collection' },
    { label: 'Brand', path: '/collection/brandCollection' },
    { label: 'Romance', path: '/collection/romance' },
    { label: 'Bold', path: '/collection/Bold' },
    { label: 'Sweet', path: '/collection/Sweet' },
    { label: 'Night Party', path: '/collection/NightParty' },
    { label: 'Office', path: '/collection/Office' },
    { label: 'Men', path: '/collection/Men' },
    { label: 'Women', path: '/collection/Women' },
  ];

  openDrawer() {
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }
}

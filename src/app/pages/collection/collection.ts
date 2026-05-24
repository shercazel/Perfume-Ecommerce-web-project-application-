import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface Category {
  label: string;
  path: string;
  icon?: string;
}

@Component({
  selector: 'app-collection',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './collection.html',
  styleUrl: './collection.css',
})
export class Collection {

heroBackgroundImage = 'assets/Background/homeHeroBg.png';

image = '/public/assets/images/carouselImage/honeyPerf.svg.png'


  isDrawerOpen = false;

  // Full categories — para sa desktop/tablet slide nav
  categories: Category[] = [
    { label: 'All Categories', path: '/collection' },
    { label: 'Brand',          path: '/collection/brandCollection' },
    { label: 'Romance',        path: '/collection/romance' },
    { label: 'Bold',           path: '/collection/Bold' },
    { label: 'Sweet',          path: '/collection/Sweet' },
    { label: 'Night Party',    path: '/collection/NightParty' },
    { label: 'Office',         path: '/collection/Office' },
    { label: 'Men',            path: '/collection/Men' },
    { label: 'Women',          path: '/collection/Women' },
  ];

  // Mobile bottom tab — first 5 categories lang (hindi kasama 'All')
  // Para hindi masikip ang bottom bar
  mobileCategories: Category[] = [
    { label: 'Brand',       path: '/collection/brandCollection', icon: 'fa-tag' },
    { label: 'Romance',     path: '/collection/romance',         icon: 'fa-heart' },
    { label: 'Bold',        path: '/collection/Bold',            icon: 'fa-fire' },
    { label: 'Sweet',       path: '/collection/Sweet',           icon: 'fa-candy-cane' },
    { label: 'More',        path: '/collection/NightParty',      icon: 'fa-ellipsis' },
  ];

  toggleDrawer(event: Event): void {
    event.stopPropagation();
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDrawer();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const nav = document.querySelector('.category-drawer-control');
    if (nav && !nav.contains(target)) {
      this.closeDrawer();
    }
  }
}
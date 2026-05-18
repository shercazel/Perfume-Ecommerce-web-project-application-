import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderApp } from '../../header-app/header-app';
import { FooterApp } from '../../footer-app/footer-app';
import { AddToCartContainer } from '../../../modal/add_cart_container/add-to-cart-container/add-to-cart-container';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderApp, FooterApp,AddToCartContainer],
  templateUrl: './user-layout.html'
})
export class UserLayout {

  currentUrl = '';

  constructor(private router: Router) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });

  }

  isAuthPage(): boolean {
    return this.currentUrl.startsWith('/auth');
  }
}
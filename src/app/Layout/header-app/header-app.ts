import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header-app',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header-app.html',
  styleUrl: './header-app.css',
})
export class HeaderApp {
  mobileMenuOpen = false;

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.mobileMenuOpen = false;
    this.router.navigate(['/login']);
  }
}

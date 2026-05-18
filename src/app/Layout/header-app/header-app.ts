import { Component } from '@angular/core';
import { RouterLink} from '@angular/router';

@Component({
  selector: 'app-header-app',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header-app.html',
  styleUrl: './header-app.css',
})
export class HeaderApp {
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

 
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../../services/auth-service';

@Component({
  selector: 'app-customer-account',
  imports: [FormsModule],
  templateUrl: './customer-account.html',
  styleUrl: './customer-account.css',
})
export class CustomerAccount {
  profile: CurrentUser = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
  };
  message = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.profile = this.authService.getCurrentUser() ?? this.profile;
  }

  saveProfile() {
    if (!this.profile.firstName.trim() || !this.profile.lastName.trim() || !this.profile.email.trim()) {
      this.message = 'Please complete your profile details.';
      return;
    }

    this.authService.updateCurrentUser({
      ...this.profile,
      firstName: this.profile.firstName.trim(),
      lastName: this.profile.lastName.trim(),
      email: this.profile.email.trim(),
      role: this.profile.role,
    });
    this.message = 'Account details updated.';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

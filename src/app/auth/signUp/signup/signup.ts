import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  createAccount() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and confirm password do not match.';
      return;
    }

    const created = this.authService.createAccount({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    });

    if (!created) {
      this.errorMessage = 'This email already has an account.';
      return;
    }

    this.router.navigate(['/login']);
  }

}

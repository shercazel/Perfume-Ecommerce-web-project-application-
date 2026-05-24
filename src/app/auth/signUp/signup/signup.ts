import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, TimeoutError } from 'rxjs';
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
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  createAccount() {
    if (this.isLoading) return;

    this.errorMessage = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.password
    ) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and confirm password do not match.';
      return;
    }

    this.isLoading = true;
    this.authService.createAccount({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    }).pipe(finalize(() => {
      this.isLoading = false;
    })).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse | TimeoutError) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to create account. Please try again.'
        );
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse | TimeoutError, fallbackMessage: string): string {
    if (error instanceof TimeoutError) {
      return 'Create account is taking too long. Please check if the server is running on localhost:3000.';
    }

    if (error.status === 0) {
      return 'Cannot connect to the server. Please start the API server on localhost:3000.';
    }

    return error.error?.message || fallbackMessage;
  }

}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ConfirmPass } from '../../../modal/confirmPassword/confirm-pass/confirm-pass';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-reset-password',
  imports: [ConfirmPass, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  email = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;
  showConfirmModal = false;

  constructor(private readonly authService: AuthService) {}

  resetPassword() {
    if (this.isLoading) return;

    this.errorMessage = '';

    if (!this.email.trim() || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.email, this.newPassword)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.newPassword = '';
          this.confirmPassword = '';
          this.showConfirmModal = true;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Unable to update password. Please try again.';
        },
      });
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }
}

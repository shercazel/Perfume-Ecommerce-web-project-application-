import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, TimeoutError } from 'rxjs';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  returnUrl = '/';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }
login() {

  if (this.isLoading) return;

  this.errorMessage = '';

  if (!this.email.trim() || !this.password.trim()) {
    this.errorMessage = 'Please enter username/email and password.';
    return;
  }

  this.isLoading = true;

  this.authService.login(this.email, this.password)
    .pipe(finalize(() => {
      this.isLoading = false;
    }))
    .subscribe({
<<<<<<< HEAD
      next: (response) => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        this.router.navigate(['/']);
=======
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
>>>>>>> 40b6d332aec0162550b627198b541a1301a7b004
      },

      error: (error: HttpErrorResponse | TimeoutError) => {
        this.errorMessage = this.getErrorMessage(error, 'Login failed. Please try again.');
      },
    });
}

private getErrorMessage(error: HttpErrorResponse | TimeoutError, fallbackMessage: string): string {
  if (error instanceof TimeoutError) {
    return 'Login is taking too long. Please check if the server is running on localhost:3000.';
  }

  if (error.status === 0) {
    return 'Cannot connect to the server. Please start the API server on localhost:3000.';
  }

  return error.error?.message || fallbackMessage;
}

}

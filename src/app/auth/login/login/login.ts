import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
login() {

  if (this.isLoading) return;

  this.errorMessage = '';

  if (!this.email.trim() || !this.password.trim()) {
    this.errorMessage = 'Please enter username/email and password.';
    return;
  }

  this.isLoading = true;

  this.authService.login(this.email, this.password)
    .subscribe({
      next: (response) => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        this.router.navigate(['/']);
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Login failed';

        this.isLoading = false;
      },

      complete: () => {
        this.isLoading = false;
      }
    });
}

}

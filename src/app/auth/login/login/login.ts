import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, RouterOutlet],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login() {
    const isLoggedIn = this.authService.login(this.email, this.password);

    if (!isLoggedIn) {
      this.errorMessage = 'Invalid email or password. Create an account first.';
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }

}

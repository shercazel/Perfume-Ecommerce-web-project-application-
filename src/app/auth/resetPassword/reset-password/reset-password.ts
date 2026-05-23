import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmPass } from '../../../modal/confirmPassword/confirm-pass/confirm-pass';

@Component({
  selector: 'app-reset-password',
  imports: [ConfirmPass, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  showConfirmModal = false;

  openConfirmModal() {
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }
}

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
    profileImage: '',
  };
  editableProfile: CurrentUser = { ...this.profile };
  isEditing = false;
  message = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.profile = this.authService.getCurrentUser() ?? this.profile;
    this.editableProfile = { ...this.profile };
  }

  get initials(): string {
    return `${this.profile.firstName.charAt(0) || 'V'}${this.profile.lastName.charAt(0) || 'S'}`;
  }

  startEdit() {
    this.editableProfile = { ...this.profile };
    this.isEditing = true;
    this.message = '';
  }

  cancelEdit() {
    this.editableProfile = { ...this.profile };
    this.isEditing = false;
    this.message = '';
  }

  uploadProfileImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.message = 'Please upload an image file.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editableProfile.profileImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage() {
    this.editableProfile.profileImage = '';
  }

  saveProfile() {
    if (
      !this.editableProfile.firstName.trim() ||
      !this.editableProfile.lastName.trim() ||
      !this.editableProfile.email.trim()
    ) {
      this.message = 'Please complete your profile details.';
      return;
    }

    this.profile = {
      ...this.editableProfile,
      firstName: this.editableProfile.firstName.trim(),
      lastName: this.editableProfile.lastName.trim(),
      email: this.editableProfile.email.trim(),
    };

    this.authService.updateCurrentUser(this.profile);
    this.editableProfile = { ...this.profile };
    this.isEditing = false;
    this.message = 'Account details updated.';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, CurrentUser, LocationOption } from '../../../services/auth-service';

interface EditableCustomerProfile extends CurrentUser {
  newPassword?: string;
  confirmPassword?: string;
}

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
    address: '',
    cityId: null,
    cityName: '',
    provinceId: null,
    provinceName: '',
    phoneNumber: '',
    profileImage: '',
  };
  editableProfile: EditableCustomerProfile = { ...this.profile };
  allCities: LocationOption[] = [];
  provinces: LocationOption[] = [];
  isEditing = false;
  isSaving = false;
  message = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.profile = this.authService.getCurrentUser() ?? this.profile;
    this.editableProfile = { ...this.profile };
    this.loadLocations();
  }

  get initials(): string {
    return `${this.profile.firstName.charAt(0) || 'V'}${this.profile.lastName.charAt(0) || 'S'}`;
  }

  get filteredCities(): LocationOption[] {
    const provinceId = this.editableProfile.provinceId ? Number(this.editableProfile.provinceId) : null;
    return provinceId ? this.allCities.filter((city) => city.provinceId === provinceId) : [];
  }

  startEdit() {
    this.editableProfile = { ...this.profile, newPassword: '', confirmPassword: '' };
    this.isEditing = true;
    this.message = '';
  }

  cancelEdit() {
    this.editableProfile = { ...this.profile, newPassword: '', confirmPassword: '' };
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

  onProvinceChange() {
    this.editableProfile.cityId = null;
    this.editableProfile.cityName = '';
  }

  saveProfile() {
    if (this.isSaving) return;

    if (
      !this.editableProfile.firstName.trim() ||
      !this.editableProfile.lastName.trim() ||
      !this.editableProfile.email.trim()
    ) {
      this.message = 'Please complete your name and email.';
      return;
    }

    const newPassword = this.editableProfile.newPassword?.trim() || '';
    const confirmPassword = this.editableProfile.confirmPassword?.trim() || '';

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        this.message = 'New password must be at least 6 characters.';
        return;
      }

      if (newPassword !== confirmPassword) {
        this.message = 'New passwords do not match.';
        return;
      }
    }

    const profileToSave: CurrentUser & { newPassword?: string } = {
      ...this.editableProfile,
      firstName: this.editableProfile.firstName.trim(),
      lastName: this.editableProfile.lastName.trim(),
      email: this.editableProfile.email.trim(),
      address: this.editableProfile.address?.trim() || '',
      phoneNumber: this.editableProfile.phoneNumber?.trim() || '',
      role: this.editableProfile.role,
      newPassword,
    };
    delete (profileToSave as EditableCustomerProfile).confirmPassword;

    this.isSaving = true;
    this.authService.updateProfile(profileToSave).subscribe({
      next: ({ user }) => {
        this.profile = {
          ...user,
          profileImage: profileToSave.profileImage,
        };
        this.editableProfile = { ...this.profile };
        this.isEditing = false;
        this.message = 'Account details updated.';
        this.isSaving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.message = error.error?.message || 'Unable to update account details.';
        this.isSaving = false;
      },
    });
  }

  private loadLocations() {
    this.authService.getLocations().subscribe({
      next: ({ cities, provinces }) => {
        this.allCities = cities;
        this.provinces = provinces;
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

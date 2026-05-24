import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';

export interface UserAccount {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  address?: string;
  cityId?: number | null;
  cityName?: string;
  provinceId?: number | null;
  provinceName?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface LocationOption {
  id: number;
  name: string;
  provinceId?: number;
}

interface AuthResponse {
  token: string;
  user: CurrentUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly tokenKey = 'token';
  private readonly currentUserKey = 'currentUser';
  private readonly currentUserSignal = signal<CurrentUser | null>(this.loadCurrentUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private http: HttpClient) {}

  createAccount(account: UserAccount): Observable<{ message: string; user: CurrentUser }> {
    return this.http.post<{ message: string; user: CurrentUser }>(`${this.apiUrl}/signup`, account);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        const savedUser = this.loadCurrentUser();
        const user = {
          ...response.user,
          profileImage:
            savedUser?.id === response.user.id ? savedUser.profileImage : response.user.profileImage,
        };

        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        this.currentUserSignal.set(user);
      })
    );
  }

  resetPassword(email: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      email,
      password,
    });
  }

  getLocations(): Observable<{ cities: LocationOption[]; provinces: LocationOption[] }> {
    return this.http.get<{ cities: LocationOption[]; provinces: LocationOption[] }>(
      'http://localhost:3000/api/locations'
    );
  }

  updateProfile(user: CurrentUser): Observable<{ message: string; user: CurrentUser }> {
    return this.http
      .put<{ message: string; user: CurrentUser }>(`${this.apiUrl}/profile`, user)
      .pipe(
        timeout(10000),
        tap((response) => {
          const updatedUser = {
            ...response.user,
            profileImage: user.profileImage,
          };

          localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
          this.currentUserSignal.set(updatedUser);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSignal.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser();
  }

  updateCurrentUser(user: CurrentUser) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadCurrentUser(): CurrentUser | null {
    const savedUser = localStorage.getItem(this.currentUserKey);
    return savedUser ? (JSON.parse(savedUser) as CurrentUser) : null;
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';

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
  profileImage?: string;
}

interface AuthResponse {
  token: string;
  user: CurrentUser;
}

interface StoredUser extends CurrentUser {
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersKey = 'testUsers';
  private readonly tokenKey = 'token';
  private readonly currentUserKey = 'currentUser';
  private readonly currentUserSignal = signal<CurrentUser | null>(this.loadCurrentUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  createAccount(account: UserAccount): Observable<{ message: string; user: CurrentUser }> {
    const users = this.loadUsers();
    const email = account.email.trim().toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === email)) {
      return this.authError('Email is already registered.');
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      firstName: account.firstName.trim(),
      lastName: account.lastName.trim(),
      email,
      password: account.password,
    };

    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    return of({
      message: 'Account created successfully.',
      user: this.toCurrentUser(user),
    }).pipe(delay(300));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const user = this.loadUsers().find(
      (savedUser) =>
        savedUser.email.toLowerCase() === email.trim().toLowerCase() &&
        savedUser.password === password
    );

    if (!user) {
      return this.authError('Invalid email or password.');
    }

    const currentUser = this.toCurrentUser(user);
    const response: AuthResponse = {
      token: `test-token-${user.id}`,
      user: currentUser,
    };

    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
    this.currentUserSignal.set(currentUser);

    return of(response).pipe(delay(300));
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
    const updatedUser = {
      ...user,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
      email: user.email.trim().toLowerCase(),
    };
    const users = this.loadUsers();
    const storedUser = users.find((savedUser) => savedUser.id === updatedUser.id);

    if (storedUser) {
      Object.assign(storedUser, updatedUser);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
    this.currentUserSignal.set(updatedUser);
  }

  private loadCurrentUser(): CurrentUser | null {
    const savedUser = localStorage.getItem(this.currentUserKey);
    return savedUser ? (JSON.parse(savedUser) as CurrentUser) : null;
  }

  private loadUsers(): StoredUser[] {
    const savedUsers = localStorage.getItem(this.usersKey);
    return savedUsers ? (JSON.parse(savedUsers) as StoredUser[]) : [];
  }

  private toCurrentUser(user: StoredUser): CurrentUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage,
    };
  }

  private authError(message: string): Observable<never> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 400,
          error: { message },
        })
    ).pipe(delay(300));
  }
}

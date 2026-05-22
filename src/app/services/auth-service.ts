import { Injectable } from '@angular/core';

export interface UserAccount {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersKey = 'votrescent_users';
  private readonly tokenKey = 'token';
  private readonly currentUserKey = 'currentUser';

  createAccount(account: UserAccount): boolean {
    const users = this.getUsers();
    const email = account.email.trim().toLowerCase();

    if (users.some((user) => user.email === email)) {
      return false;
    }

    users.push({
      ...account,
      email,
    });

    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.getUsers().find(
      (account) =>
        account.email === normalizedEmail && account.password === password
    );

    if (!user) {
      return false;
    }

    localStorage.setItem(this.tokenKey, `local-token-${Date.now()}`);
    localStorage.setItem(
      this.currentUserKey,
      JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    );

    return true;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUsers(): UserAccount[] {
    const savedUsers = localStorage.getItem(this.usersKey);

    if (!savedUsers) {
      return [];
    }

    try {
      return JSON.parse(savedUsers) as UserAccount[];
    } catch {
      return [];
    }
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Signal, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'ponyracer_user';
  currentUser = signal<UserModel | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) {}

  private getUserFromStorage(): UserModel | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  register(
    login: string,
    password: string,
    birthYear: number,
  ): Signal<UserModel | null | undefined> {
    const sig = signal<UserModel | null | undefined>(undefined);
    this.http
      .post<UserModel>(`${environment.baseUrl}/api/users`, { login, password, birthYear })
      .subscribe({
        next: (user) => {
          this.storeUser(user);
          sig.set(user);
        },
        error: () => {
          sig.set(null);
        },
      });
    return sig.asReadonly();
  }

  authenticate(login: string, password: string): Signal<UserModel | null | undefined> {
    const sig = signal<UserModel | null | undefined>(undefined);
    this.http
      .post<UserModel>(`${environment.baseUrl}/api/users/authentication`, { login, password })
      .subscribe({
        next: (user) => {
          this.storeUser(user);
          sig.set(user);
        },
        error: () => {
          sig.set(null);
        },
      });
    return sig.asReadonly();
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  private storeUser(user: UserModel): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  getAuthHeaders(): HttpHeaders {
    const user = this.currentUser();
    if (user?.token) {
      return new HttpHeaders({ Authorization: `Bearer ${user.token}` });
    }
    return new HttpHeaders();
  }
}

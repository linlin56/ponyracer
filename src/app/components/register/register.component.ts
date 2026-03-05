import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <h2>Register</h2>
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <div class="form-group mb-3">
            <label for="login">Login</label>
            <input
              type="text"
              id="login"
              class="form-control"
              [(ngModel)]="login"
              name="login"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="birthYear">Birth year</label>
            <input
              type="number"
              id="birthYear"
              class="form-control"
              [(ngModel)]="birthYear"
              name="birthYear"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="loading()">Register</button>
          <a routerLink="/login" class="btn btn-link ml-2">Already registered? Log in!</a>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  login = '';
  password = '';
  birthYear: number = new Date().getFullYear() - 20;
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.userService.register(this.login, this.password, this.birthYear).subscribe({
      next: () => this.router.navigate(['/races']),
      error: (err) => {
        this.error.set(
          err.status === 417 ? 'Ce login est déjà utilisé.' : 'Une erreur est survenue.',
        );
        this.loading.set(false);
      },
    });
  }
}

import { Component, effect, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <h2>Connexion</h2>
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <div class="form-group mb-3">
            <label for="login">Identifiant</label>
            <input
              type="email"
              id="login"
              class="form-control"
              [(ngModel)]="login"
              name="login"
              required
            />
          </div>
          <div class="form-group mb-3">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="loading()">Se connecter</button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private injector = inject(Injector);
  private userService = inject(UserService);
  private router = inject(Router);

  login = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    const sig = this.userService.authenticate(this.login, this.password);
    // effet pour gérer la réponse de l'authentification
    effect(
      () => {
        const user = sig();
        if (user === undefined) {
          return;
        }
        if (user) {
          this.loading.set(false);
          this.router.navigate(['/races']);
          return;
        }
        this.loading.set(false);
        this.error.set('Identifiant ou mot de passe incorrect.');
      },
      { injector: this.injector },
    );
  }
}

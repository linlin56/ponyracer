import { Component, effect, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

// configuration du composant d'inscription
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <h2>Inscription</h2>
        <!-- affichage du message d'erreur si présent -->
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <!-- formulaire d'inscription avec liaison bidirectionnelle ngModel -->
        <form (ngSubmit)="onSubmit()">
          <div class="form-group mb-3">
            <label for="login">Identifiant</label>
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
          <div class="form-group mb-3">
            <label for="birthYear">Annee de naissance</label>
            <input
              type="number"
              id="birthYear"
              class="form-control"
              [(ngModel)]="birthYear"
              name="birthYear"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="loading()">S'inscrire</button>
          <a routerLink="/login" class="btn btn-link ml-2">Deja inscrit ? Se connecter</a>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  // services injectés nécessaires à l'inscription et à la navigation
  private injector = inject(Injector);
  private userService = inject(UserService);
  private router = inject(Router);

  // champs du formulaire
  login = '';
  password = '';
  birthYear: number = new Date().getFullYear() - 20; // par défaut : 20 ans
  // signaux pour l'état local
  loading = signal(false);
  error = signal('');

  // appelé lors de la soumission du formulaire
  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    const sig = this.userService.register(this.login, this.password, this.birthYear);
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
        this.error.set('Une erreur est survenue.');
      },
      { injector: this.injector },
    );
  }
}

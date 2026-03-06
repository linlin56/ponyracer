import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="text-center mt-5">
      <h2>
        <strong>Ponyracer</strong>
        <small class="text-muted"> Le plaisir des paris hippiques, version poney</small>
      </h2>
      <p class="mt-3">
        <!-- Les routes vers les différentes pages de l'application -->
        <a routerLink="/login" class="btn btn-primary mr-2">Connexion</a>
        <a routerLink="/register" class="btn btn-primary">Inscription</a>
      </p>
    </div>
  `,
})
export class HomeComponent {}

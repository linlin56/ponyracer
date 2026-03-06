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
        <small class="text-muted"> Always a pleasure to bet on ponies</small>
      </h2>
      <p class="mt-3">
        <!-- Les routes vers les différentes pages de l'application -->
        <a routerLink="/login" class="btn btn-primary mr-2">Login</a>
        <a routerLink="/register" class="btn btn-primary">Register</a>
      </p>
    </div>
  `,
})
export class HomeComponent {}

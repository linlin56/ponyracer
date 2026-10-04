import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="text-center mt-5">
      <h2>
        <strong>Ponyracer</strong>
        <small class="text-muted"> {{ 'home.tagline' | translate }}</small>
      </h2>
      <p class="mt-3">
        <!-- Les routes vers les différentes pages de l'application -->
        <a routerLink="/login" class="btn btn-primary mr-2">{{ 'home.login' | translate }}</a>
        <a routerLink="/register" class="btn btn-primary">{{ 'home.register' | translate }}</a>
      </p>
    </div>
  `,
})
export class HomeComponent {}

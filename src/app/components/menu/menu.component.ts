import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lang } from '../../i18n/translations';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { UserService } from '../../services/user.service';

// barre de navigation de l'application, visible sur toutes les pages
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <nav class="navbar navbar-dark bg-dark mb-3">
      <button class="navbar-toggler" type="button" (click)="toggleMenu()">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand mr-auto ml-2" routerLink="/">PonyRacer</a>
      <!-- choix de la langue -->
      <div
        class="btn-group btn-group-sm"
        role="group"
        [attr.aria-label]="'menu.language' | translate"
      >
        @for (lang of languages; track lang) {
          <button
            type="button"
            class="btn"
            [class.btn-light]="currentLang() === lang"
            [class.btn-outline-light]="currentLang() !== lang"
            [attr.aria-pressed]="currentLang() === lang"
            [attr.lang]="lang"
            (click)="setLang(lang)"
          >
            {{ lang.toUpperCase() }}
          </button>
        }
      </div>
    </nav>

    @if (menuOpen) {
      <div
        class="sidebar bg-light p-3 border-right"
        style="position:fixed;top:0;left:0;height:100%;width:220px;z-index:1000;"
      >
        <button class="btn btn-sm btn-outline-secondary mb-3" (click)="toggleMenu()">
          <i class="fa fa-times"></i> {{ 'menu.close' | translate }}
        </button>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/races" (click)="toggleMenu()">
              <i class="fa fa-flag mr-1"></i> {{ 'menu.races' | translate }}
            </a>
          </li>
          @if (currentUser()) {
            <li class="nav-item">
              <span class="nav-link text-muted">
                {{ currentUser()!.login }}
                <i class="fa fa-star ml-1 text-warning"></i>
                {{ currentUser()!.money }}
              </span>
            </li>
            <li class="nav-item">
              <a
                class="nav-link text-danger"
                href="#"
                [title]="'menu.logout' | translate"
                (click)="logout($event)"
              >
                <i class="fa fa-power-off"></i>
              </a>
            </li>
          }
        </ul>
      </div>
    }
  `,
})

// Le menu contient les liens de navigation,
// affiche l'utilisateur connecté ainsi que son argent,
// permet de se déconnecter et de choisir la langue.
export class MenuComponent {
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  currentUser = this.userService.currentUser;
  currentLang = this.translationService.lang;
  languages = this.translationService.languages;
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  setLang(lang: Lang): void {
    this.translationService.setLang(lang);
  }

  logout(event: Event): void {
    event.preventDefault();
    this.userService.logout();
    this.menuOpen = false;
  }
}

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

// la navbar de l'application, présente sur toutes les pages
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar navbar-dark bg-dark mb-3">
      <button class="navbar-toggler" type="button" (click)="toggleMenu()">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" routerLink="/">PonyRacer</a>
    </nav>

    @if (menuOpen) {
      <div
        class="sidebar bg-light p-3 border-right"
        style="position:fixed;top:0;left:0;height:100%;width:220px;z-index:1000;"
      >
        <button class="btn btn-sm btn-outline-secondary mb-3" (click)="toggleMenu()">
          <i class="fa fa-times"></i> Fermer
        </button>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/races" (click)="toggleMenu()">
              <i class="fa fa-flag mr-1"></i> Races
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
              <a class="nav-link text-danger" href="#" (click)="logout($event)">
                <i class="fa fa-power-off"></i>
              </a>
            </li>
          }
        </ul>
      </div>
    }
  `,
})

// Le menu de l'application contient des liens vers les pages
// et affiche le nom de l'utilisateur connecté ainsi que son argent.
// Il permet aussi de se déconnecter.
export class MenuComponent {
  private userService = inject(UserService);
  currentUser = this.userService.currentUser;
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(event: Event): void {
    event.preventDefault();
    this.userService.logout();
    this.menuOpen = false;
  }
}

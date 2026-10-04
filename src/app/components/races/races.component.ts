// imports de base nécessaires au composant
import { Component, inject, OnInit, signal, Signal } from '@angular/core';
// liaison de route pour les liens
import { RouterLink } from '@angular/router';
// modèle de course
import { RaceModel } from '../../models/race.model';
// pipe personnalisé pour afficher le départ de façon relative
import { FromNowPipe } from '../../pipes/from-now.pipe';
// pipe de traduction
import { TranslatePipe } from '../../pipes/translate.pipe';
// service pour interagir avec l'API de courses
import { RaceService } from '../../services/race.service';
// composant enfant affichant un poney
import { PonyComponent } from '../pony/pony.component';

// configuration du composant : sélecteur, template et styles
@Component({
  selector: 'app-races',
  standalone: true,
  imports: [RouterLink, PonyComponent, FromNowPipe, TranslatePipe],
  template: `
    <h2 class="mt-3">{{ 'races.title' | translate }}</h2>
    <!-- indicateur de chargement -->
    @if (loading()) {
      <div class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
      </div>
    }
    <!-- message d'erreur si la récupération a échoué -->
    @if (error()) {
      <div class="alert alert-danger">{{ error() | translate }}</div>
    }
    <!-- boucle sur les courses récupérées -->
    @for (race of races(); track race.id) {
      <div class="race-card mb-4">
        <h3>{{ race.name }}</h3>
        <p class="text-muted">{{ race.startInstant | fromNow }}</p>
        <!-- miniatures des poneys participant à la course -->
        <div class="d-flex flex-wrap gap-3 mb-2">
          @for (pony of race.ponies; track pony.id) {
            <app-pony [pony]="pony" />
          }
        </div>
        <!-- lien vers la page de détail et de pari de la course -->
        <a [routerLink]="['/races', race.id]" class="btn btn-primary btn-sm">
          {{ 'races.bet' | translate: { name: race.name } }}
        </a>
      </div>
      <hr />
    }
    <!-- message si aucune course disponible après chargement -->
    @if (!loading() && races().length === 0 && !error()) {
      <p class="text-muted">{{ 'races.empty' | translate }}</p>
    }
  `,
  styles: [
    `
      .race-card {
        padding: 1rem 0;
      }
      .gap-3 {
        gap: 1rem;
      }
    `,
  ],
})
export class RacesComponent implements OnInit {
  // service pour récupérer la liste des courses
  private raceService = inject(RaceService);

  // le signal renvoyé par le service contient déjà le tableau de courses
  races!: Signal<RaceModel[]>;
  loading = signal(true);
  error = signal('');

  // le composant consomme directement le signal, sans observable
  ngOnInit(): void {
    this.races = this.raceService.list('PENDING');
    this.loading.set(false); // chargé dès que le signal est initialisé
  }
}

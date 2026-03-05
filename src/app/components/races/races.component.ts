import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RaceModel } from '../../models/race.model';
import { FromNowPipe } from '../../pipes/from-now.pipe';
import { RaceService } from '../../services/race.service';
import { PonyComponent } from '../pony/pony.component';

@Component({
  selector: 'app-races',
  standalone: true,
  imports: [RouterLink, PonyComponent, FromNowPipe],
  template: `
    <h2 class="mt-3">Races</h2>
    @if (loading()) {
      <div class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
      </div>
    }
    @if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    }
    @for (race of races(); track race.id) {
      <div class="race-card mb-4">
        <h3>{{ race.name }}</h3>
        <p class="text-muted">{{ race.startInstant | fromNow }}</p>
        <div class="d-flex flex-wrap gap-3 mb-2">
          @for (pony of race.ponies; track pony.id) {
            <app-pony [pony]="pony" />
          }
        </div>
        <a [routerLink]="['/races', race.id]" class="btn btn-primary btn-sm">
          Bet on {{ race.name }}
        </a>
      </div>
      <hr />
    }
    @if (!loading() && races().length === 0 && !error()) {
      <p class="text-muted">Aucune course disponible pour le moment.</p>
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
  private raceService = inject(RaceService);

  races = signal<RaceModel[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.raceService.list('PENDING').subscribe({
      next: (races) => {
        this.races.set(races);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de récupérer les courses.');
        this.loading.set(false);
      },
    });
  }
}

import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import moment from 'moment';
import { PonyModel } from '../../models/pony.model';
import { RaceModel } from '../../models/race.model';
import { RaceService } from '../../services/race.service';
import { PonyComponent } from '../pony/pony.component';

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [RouterLink, PonyComponent],
  template: `
    @if (loading()) {
      <div class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
      </div>
    }
    @if (race()) {
      <div class="mt-3">
        <h2>{{ race()!.name }}</h2>

        @if (race()!.status === 'PENDING') {
          <p class="text-muted">
            <i class="fa fa-clock-o mr-1"></i>
            Départ dans
            <span class="badge badge-info font-weight-bold" style="font-size:1rem">
              {{ countdown() }}
            </span>
          </p>
        }

        @if (race()!.status === 'RUNNING' || race()!.status === 'FINISHED') {
          <a [routerLink]="['/races', race()!.id, 'live']" class="btn btn-primary mb-3">
            Watch live!
          </a>
        }

        @if (betError()) {
          <div class="alert alert-danger">{{ betError() }}</div>
        }
        @if (betSuccess()) {
          <div class="alert alert-success">{{ betSuccess() }}</div>
        }

        <p class="text-muted">Click to bet on your favorite pony</p>
        <div class="d-flex flex-wrap gap-3">
          @for (pony of race()!.ponies; track pony.id) {
            <app-pony
              [pony]="pony"
              [isSelected]="race()!.betPonyId === pony.id"
              (ponyClicked)="onBet($event)"
            />
          }
        </div>

        @if (race()!.betPonyId) {
          <div class="mt-3">
            <p class="text-success">
              <i class="fa fa-check-circle"></i>
              Vous avez parié sur <strong>{{ getBetPonyName() }}</strong>
            </p>
            <button class="btn btn-danger btn-sm" (click)="cancelBet()">Annuler le pari</button>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .gap-3 {
        gap: 1rem;
      }
    `,
  ],
})
export class RaceComponent implements OnInit, OnDestroy {
  private raceService = inject(RaceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  race = signal<RaceModel | null>(null);
  loading = signal(true);
  betError = signal('');
  betSuccess = signal('');
  countdown = signal('');

  private countdownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('raceId'));
    this.raceService.get(id).subscribe({
      next: (race) => {
        this.race.set(race);
        this.loading.set(false);
        if (race.status === 'RUNNING') {
          this.router.navigate(['/races', race.id, 'live']);
        } else if (race.status === 'PENDING') {
          this.startCountdown(race);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  private startCountdown(race: RaceModel): void {
    const update = () => {
      const diff = moment(race.startInstant).diff(moment());
      if (diff <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/races', race.id, 'live']);
        return;
      }
      const duration = moment.duration(diff);
      const h = Math.floor(duration.asHours());
      const m = duration.minutes();
      const s = duration.seconds();
      if (h > 0) {
        this.countdown.set(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
      } else if (m > 0) {
        this.countdown.set(`${m}m ${String(s).padStart(2, '0')}s`);
      } else {
        this.countdown.set(`${s}s`);
      }
    };
    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  onBet(pony: PonyModel): void {
    const r = this.race();
    if (!r || r.status !== 'PENDING') return;
    this.betError.set('');
    this.betSuccess.set('');
    this.raceService.bet(r.id, pony.id).subscribe({
      next: (updatedRace) => {
        this.race.set(updatedRace);
        this.betSuccess.set(`Pari placé sur ${pony.name} !`);
      },
      error: () => this.betError.set('Impossible de placer le pari.'),
    });
  }

  cancelBet(): void {
    const r = this.race();
    if (!r) return;
    this.betError.set('');
    this.betSuccess.set('');
    this.raceService.cancelBet(r.id).subscribe({
      next: () => {
        this.race.update((race) => (race ? { ...race, betPonyId: undefined } : null));
        this.betSuccess.set('Pari annulé.');
      },
      error: () => this.betError.set("Impossible d'annuler le pari."),
    });
  }

  getBetPonyName(): string {
    const r = this.race();
    if (!r?.betPonyId) return '';
    return r.ponies.find((p) => p.id === r.betPonyId)?.name ?? '';
  }
}

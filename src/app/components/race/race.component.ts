import { Component, effect, inject, Injector, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import moment from 'moment';
import { PonyModel } from '../../models/pony.model';
import { RaceModel } from '../../models/race.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RaceService } from '../../services/race.service';
import { PonyComponent } from '../pony/pony.component';

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [RouterLink, PonyComponent, TranslatePipe],
  template: `
    <!-- affiche un spinner pendant le chargement de la course -->
    @if (loading()) {
      <div class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
      </div>
    }
    @if (betError() && !race()) {
      <div class="alert alert-danger mt-3">{{ betError() | translate }}</div>
    }
    <!-- une fois la course chargée, on expose les informations -->
    @if (race()) {
      <div class="mt-3">
        <h2>{{ race()!.name }}</h2>

        <!-- si la course n'a pas démarré, on montre un compte à rebours -->
        @if (race()!.status === 'PENDING') {
          <p class="text-muted">
            <i class="fa fa-clock-o mr-1"></i>
            {{ 'race.startsIn' | translate }}
            <span class="badge badge-info font-weight-bold" style="font-size:1rem">
              {{ countdown() }}
            </span>
          </p>
        }

        <!-- lien vers le direct tant que la course est en cours ou achevée -->
        @if (race()!.status === 'RUNNING' || race()!.status === 'FINISHED') {
          <a [routerLink]="['/races', race()!.id, 'live']" class="btn btn-primary mb-3">
            {{ 'race.watchLive' | translate }}
          </a>
        }

        <!-- messages d'erreur/succès lors du pari -->
        @if (betError()) {
          <div class="alert alert-danger">{{ betError() | translate }}</div>
        }
        @if (betSuccess()) {
          <div class="alert alert-success">
            {{ betSuccess() | translate: { pony: getBetPonyName() } }}
          </div>
        }

        <p class="text-muted">{{ 'race.clickToBet' | translate }}</p>
        <!-- liste des poneys disponibles pour parier -->
        <div class="d-flex flex-wrap gap-3">
          @for (pony of race()!.ponies; track pony.id) {
            <app-pony
              [pony]="pony"
              [isSelected]="race()!.betPonyId === pony.id"
              (ponyClicked)="onBet($event)"
            />
          }
        </div>

        <!-- si un pari est fait, afficher le nom du poney parié et possibilité d'annuler -->
        @if (race()!.betPonyId) {
          <div class="mt-3">
            <p class="text-success">
              <i class="fa fa-check-circle"></i>
              {{ 'race.betOn' | translate }} <strong>{{ getBetPonyName() }}</strong>
            </p>
            <button class="btn btn-danger btn-sm" (click)="cancelBet()">
              {{ 'race.cancelBet' | translate }}
            </button>
          </div>
        }
      </div>
    }
    @if (!loading() && !race() && !betError()) {
      <div class="alert alert-warning mt-3">{{ 'race.loadError' | translate }}</div>
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
  // dépendances injectées
  private injector = inject(Injector);
  private raceService = inject(RaceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // signaux utilisés pour piloter l'interface
  // signal local mutable utilisé pour les mises à jour
  race = signal<RaceModel | null>(null);
  loading = signal(true); // indicateur de chargement
  betError = signal(''); // clé de traduction du message d'erreur de pari
  betSuccess = signal(''); // clé de traduction du message de succès de pari
  countdown = signal(''); // texte du compte à rebours

  // référence de l'intervalle du compte à rebours pour pouvoir l'annuler
  private countdownInterval?: ReturnType<typeof setInterval>;

  // au démarrage du composant, on récupère l'id de la course
  // puis on appelle le service pour charger les données
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('raceId'));
    const serviceRace = this.raceService.get(id); // signal fourni par le service

    // synchroniser le signal local avec celui du service
    effect(
      () => {
        const r = serviceRace();
        if (r) {
          this.loading.set(false);
          this.race.set(r);
          if (r.status === 'RUNNING') {
            this.router.navigate(['/races', r.id, 'live']);
          } else if (r.status === 'PENDING') {
            this.startCountdown(r);
          }
        }
      },
      { injector: this.injector },
    );

    setTimeout(() => {
      if (!this.race()) {
        this.loading.set(false);
        this.betError.set('race.loadError');
      }
    }, 3000);
  }

  // intervalle qui met à jour le texte du compte à rebours
  // tant que le départ n'est pas passé ; redirection vers le direct à zéro
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
    // nettoyage
    clearInterval(this.countdownInterval);
  }

  // déclenché lorsque l'utilisateur clique sur un poney pour parier
  onBet(pony: PonyModel): void {
    const r = this.race();
    if (!r || r.status !== 'PENDING') return;
    this.betError.set('');
    this.betSuccess.set('');
    const sig = this.raceService.bet(r.id, pony.id);
    effect(
      () => {
        const updated = sig();
        if (updated) {
          this.race.set(updated);
          this.betSuccess.set('race.betPlaced');
        }
      },
      { injector: this.injector },
    );
  }

  // annule le pari en cours via le service
  cancelBet(): void {
    const r = this.race();
    if (!r) return;
    this.betError.set('');
    this.betSuccess.set('');
    const sig = this.raceService.cancelBet(r.id);
    effect(
      () => {
        const ok = sig();
        if (ok) {
          this.race.update((race: RaceModel | null) =>
            race ? { ...race, betPonyId: undefined } : null,
          );
          this.betSuccess.set('race.betCancelled');
        } else {
          this.betError.set('race.cancelError');
        }
      },
      { injector: this.injector },
    );
  }

  // renvoie le nom du poney sur lequel l'utilisateur a parié
  getBetPonyName(): string {
    const r = this.race();
    if (!r?.betPonyId) return '';
    return r.ponies.find((p: PonyModel) => p.id === r.betPonyId)?.name ?? '';
  }
}

import { NgStyle } from '@angular/common';
import { Component, effect, inject, Injector, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PonyModel } from '../../models/pony.model';
import { RaceModel } from '../../models/race.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RaceService } from '../../services/race.service';
import { UserService } from '../../services/user.service';
import { WsService } from '../../services/ws.service';
import { PonyComponent } from '../pony/pony.component';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [RouterLink, PonyComponent, NgStyle, TranslatePipe],
  template: `
    @if (loading()) {
      <div class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
      </div>
    }
    @if (error()) {
      <div class="alert alert-danger mt-3">
        {{ error() | translate }}
        <div class="mt-2">
          <a routerLink="/races" class="btn btn-primary btn-sm">{{
            'live.backToRaces' | translate
          }}</a>
        </div>
      </div>
    }
    @if (race()) {
      <div class="mt-3">
        <h2>{{ race()!.name }}</h2>

        @if (status() === 'FINISHED') {
          <div class="alert alert-info">
            <h4>{{ 'live.finished' | translate }}</h4>
            <!-- Affichage des gagnants -->
            @if (winners().length) {
              <p>
                {{ 'live.winners' | translate }}
                @for (w of winners(); track w.id) {
                  <i class="fa fa-trophy" style="color: gold"></i>
                  <strong> {{ w.name }} </strong>
                  <i class="fa fa-trophy" style="color: gold"></i>
                }
              </p>
            }
            <a routerLink="/races" class="btn btn-primary mt-2">{{
              'live.backToRaces' | translate
            }}</a>
          </div>
        }
        <div class="race-track">
          @for (pony of ponies(); track pony.id) {
            <div class="pony-lane ">
              <div
                class="pony-pos"
                [ngStyle]="{
                  'margin-left': pony.position + '%',
                  transition: 'margin-left 0.5s ease',
                }"
              >
                <app-pony
                  [pony]="pony"
                  [isSelected]="race()!.betPonyId === pony.id"
                  (ponyClicked)="onBoost($event)"
                />
              </div>
            </div>
          }
          <div class="finish-line"></div>
        </div>

        @if (status() === 'RUNNING') {
          <p class="text-muted">
            <i class="fa fa-info-circle"></i>
            {{ 'live.boostHint' | translate }}
          </p>
        }
      </div>
    }
    @if (!loading() && !race() && !error()) {
      <div class="alert alert-warning mt-3">
        {{ 'live.unavailable' | translate }}
      </div>
    }
  `,
  styles: [
    `
      .race-track {
        position: relative;
        border: 1px solid #8b5e3c;
        border-radius: 6px;
        padding: 1rem;
        background-image: url('/assets/terrain-course.png');
        background-repeat: repeat-x;
        background-size: auto 100%;
        background-color: #a0724a;
        image-rendering: pixelated;
      }
      .pony-lane {
        width: 100%;
        min-height: 90px;
      }
      .pony-pos {
        position: relative;
        z-index: 1;
      }
      .finish-line {
        position: absolute;
        top: 0;
        right: 0;
        width: 5px;
        height: 100%;
        z-index: 0;
        background: repeating-linear-gradient(
          180deg,
          #cc0000 0px,
          #cc0000 10px,
          #ffffff 10px,
          #ffffff 20px
        );
        border-radius: 0 2px 2px 0;
      }
    `,
  ],
})
export class LiveComponent implements OnInit, OnDestroy {
  private injector = inject(Injector);
  private raceService = inject(RaceService);
  private wsService = inject(WsService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  race = signal<RaceModel | null>(null);
  ponies = signal<PonyModel[]>([]);
  status = signal<'PENDING' | 'RUNNING' | 'FINISHED'>('PENDING');
  winners = signal<PonyModel[]>([]);
  loading = signal(true);
  error = signal('');

  // les mises à jour temps réel sont pilotées par des signaux de service

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('raceId'));
    const cachedRace = this.raceService.currentRace();
    if (cachedRace?.id === id) {
      this.applyRace(cachedRace);
    }

    const fetchedRace = this.raceService.get(id);

    let connected = false;
    // l'effet s'exécute dès que la course est disponible, depuis le cache du service ou l'API
    effect(
      () => {
        const fetched = fetchedRace();
        if (fetched) {
          this.race.set(fetched);
        }

        const r = this.race();
        if (!r || connected) return;
        this.applyRace(r);
        this.wsService.connect(r);
        connected = true;
      },
      { injector: this.injector },
    );

    // effet pour recevoir les mises à jour de la course en direct
    effect(
      () => {
        const data = this.wsService.raceUpdates();
        if (!data) return;
        this.ponies.set(data.ponies);
        this.status.set(data.status);
        if (data.status === 'FINISHED') {
          const maxPos = Math.max(...data.ponies.map((p: PonyModel) => p.position ?? 0));
          this.winners.set(data.ponies.filter((p: PonyModel) => p.position === maxPos));
          this.updateUserScore();
        }
      },
      { injector: this.injector },
    );

    // effet pour recevoir les mises à jour de score de l'utilisateur
    effect(
      () => {
        const updated = this.wsService.scoreUpdates();
        if (updated) {
          this.userService.currentUser.set(updated);
        }
      },
      { injector: this.injector },
    );

    setTimeout(() => {
      if (!this.race()) {
        this.loading.set(false);
        this.error.set('live.loadError');
      }
    }, 3000);
  }

  private applyRace(race: RaceModel): void {
    this.loading.set(false);
    this.race.set(race);
    this.ponies.set(race.ponies.map((p: PonyModel) => ({ ...p, position: p.position ?? 0 })));
    this.status.set(race.status);
  }

  private updateUserScore(): void {
    const user = this.userService.currentUser();
    if (!user) return;
    this.wsService.connectForScore(user);
  }

  onBoost(pony: PonyModel): void {
    const r = this.race();
    if (!r || r.betPonyId !== pony.id || this.status() !== 'RUNNING') return;
    this.raceService.boost(r.id, pony.id);
  }

  ngOnDestroy(): void {
    // aucun abonnement manuel à annuler avec les effets
  }
}

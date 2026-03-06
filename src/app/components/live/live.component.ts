import { NgStyle } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PonyModel } from '../../models/pony.model';
import { RaceModel, RacePositionModel } from '../../models/race.model';
import { RaceService } from '../../services/race.service';
import { UserService } from '../../services/user.service';
import { WsService } from '../../services/ws.service';
import { PonyComponent } from '../pony/pony.component';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [RouterLink, PonyComponent, NgStyle],
  template: `
    @if (loading()) {
      <div class="text-center mt-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
      </div>
    }
    @if (race()) {
      <div class="mt-3">
        <h2>{{ race()!.name }}</h2>

        @if (status() === 'FINISHED') {
          <div class="alert alert-info">
            <h4>Course terminée !</h4>
            @if (winners().length) {
              <p>
                Gagnant(s) :
                @for (w of winners(); track w.id) {
                  <strong>{{ w.name }}</strong>
                }
              </p>
            }
            <a routerLink="/races" class="btn btn-primary mt-2">Retour aux courses</a>
          </div>
        }

        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
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
            Cliquez sur votre poney parié pour lui donner un boost !
          </p>
        }
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

  private wsSub?: Subscription;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('raceId'));
    this.raceService.get(id).subscribe({
      next: (race) => {
        this.race.set(race);
        this.ponies.set(race.ponies.map((p) => ({ ...p, position: 0 })));
        this.status.set(race.status);
        this.loading.set(false);
        this.connectWs(race);
      },
      error: () => {
        this.error.set('Impossible de récupérer la course.');
        this.loading.set(false);
      },
    });
  }

  private connectWs(race: RaceModel): void {
    this.wsSub = this.wsService.connect(race).subscribe({
      next: (data: RacePositionModel) => {
        this.ponies.set(data.ponies);
        this.status.set(data.status);
        if (data.status === 'FINISHED') {
          const maxPos = Math.max(...data.ponies.map((p) => p.position ?? 0));
          this.winners.set(data.ponies.filter((p) => p.position === maxPos));
          this.updateUserScore();
        }
      },
      error: () => this.error.set('Connexion WebSocket perdue.'),
    });
  }

  private updateUserScore(): void {
    const user = this.userService.currentUser();
    if (!user) return;
    this.wsService.connectForScore(user).subscribe({
      next: (updatedUser) => {
        this.userService.currentUser.set(updatedUser);
      },
    });
  }

  onBoost(pony: PonyModel): void {
    const r = this.race();
    if (!r || r.betPonyId !== pony.id || this.status() !== 'RUNNING') return;
    this.raceService.boost(r.id, pony.id).subscribe();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }
}

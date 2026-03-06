import { Injectable, signal } from '@angular/core';
import * as Stomp from 'webstomp-client';
import { environment } from '../../environments/environment';
import { RacePositionModel } from '../models/race.model';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  raceUpdates = signal<RacePositionModel | null>(null);
  scoreUpdates = signal<UserModel | null>(null);

  connect(race: { id: number }): void {
    this.raceUpdates.set(null);
    const socket = new WebSocket(`${environment.wsBaseUrl}/ws`);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      () => {
        stompClient.subscribe(`/race/${race.id}`, (message) => {
          const data: RacePositionModel = JSON.parse(message.body);
          this.raceUpdates.set(data);
          if (data.status === 'FINISHED') {
            stompClient.disconnect();
          }
        });
      },
      () => {
        // erreur ignorée : le service n'expose pas de canal d'erreur dédié
      },
    );
  }

  connectForScore(user: UserModel): void {
    this.scoreUpdates.set(null);
    const socket = new WebSocket(`${environment.wsBaseUrl}/ws`);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      () => {
        stompClient.subscribe(`/player/${user.id}`, (message) => {
          const data: UserModel = JSON.parse(message.body);
          this.scoreUpdates.set(data);
        });
      },
      () => {
        // erreurs ignorées ici également
      },
    );
  }
}

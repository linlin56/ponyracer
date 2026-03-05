import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as Stomp from 'webstomp-client';
import { environment } from '../../environments/environment';
import { RacePositionModel } from '../models/race.model';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  connect(race: { id: number }): Observable<RacePositionModel> {
    return new Observable((observer) => {
      const socket = new WebSocket(`${environment.wsBaseUrl}/ws`);
      const stompClient = Stomp.over(socket);
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        () => {
          stompClient.subscribe(`/race/${race.id}`, (message) => {
            const data: RacePositionModel = JSON.parse(message.body);
            observer.next(data);
            if (data.status === 'FINISHED') {
              observer.complete();
              stompClient.disconnect();
            }
          });
        },
        (error: any) => {
          observer.error(error);
        },
      );

      return () => {
        if (stompClient.connected) {
          stompClient.disconnect();
        }
      };
    });
  }

  connectForScore(user: UserModel): Observable<UserModel> {
    return new Observable((observer) => {
      const socket = new WebSocket(`${environment.wsBaseUrl}/ws`);
      const stompClient = Stomp.over(socket);
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        () => {
          stompClient.subscribe(`/player/${user.id}`, (message) => {
            const data: UserModel = JSON.parse(message.body);
            observer.next(data);
          });
        },
        (error: any) => {
          observer.error(error);
        },
      );

      return () => {
        if (stompClient.connected) {
          stompClient.disconnect();
        }
      };
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { RaceModel } from '../models/race.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  currentRace = signal<RaceModel | null>(null);

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  /**
   * renvoie un `Signal` en lecture seule qui contiendra la liste de courses
   * correspondant au statut demandé. l'appel HTTP est déclenché immédiatement
   * et le résultat (ou un tableau vide en cas d'erreur) est publié dans le signal.
   */
  list(status: 'PENDING' | 'RUNNING' | 'FINISHED' = 'PENDING'): Signal<RaceModel[]> {
    const sig = signal<RaceModel[]>([]);
    this.http
      .get<RaceModel[]>(`${environment.baseUrl}/api/races`, { params: { status } })
      .subscribe({
        next: (data) => sig.set(data),
        error: () => sig.set([]),
      });
    return sig.asReadonly();
  }

  /**
   * renvoie un signal contenant la course demandée (null si erreur).
   */
  get(raceId: number): Signal<RaceModel | null> {
    const sig = signal<RaceModel | null>(null);
    this.http
      .get<RaceModel>(`${environment.baseUrl}/api/races/${raceId}`, {
        headers: this.userService.getAuthHeaders(),
      })
      .subscribe({
        next: (data) => {
          this.currentRace.set(data);
          sig.set(data);
        },
        error: () => {
          this.currentRace.set(null);
          sig.set(null);
        },
      });
    return sig.asReadonly();
  }

  bet(raceId: number, ponyId: number): Signal<RaceModel | null> {
    const sig = signal<RaceModel | null>(null);
    this.http
      .post<RaceModel>(
        `${environment.baseUrl}/api/races/${raceId}/bets`,
        { ponyId },
        { headers: this.userService.getAuthHeaders() },
      )
      .subscribe({
        next: (r) => {
          this.currentRace.set(r);
          sig.set(r);
        },
        error: () => sig.set(null),
      });
    return sig.asReadonly();
  }

  cancelBet(raceId: number): Signal<boolean> {
    const sig = signal<boolean>(false);
    this.http
      .delete<void>(`${environment.baseUrl}/api/races/${raceId}/bets`, {
        headers: this.userService.getAuthHeaders(),
      })
      .subscribe({
        next: () => {
          this.currentRace.update((race) => (race ? { ...race, betPonyId: undefined } : null));
          sig.set(true);
        },
        error: () => sig.set(false),
      });
    return sig.asReadonly();
  }

  boost(raceId: number, ponyId: number): Signal<boolean> {
    const sig = signal<boolean>(false);
    this.http
      .post<void>(
        `${environment.baseUrl}/api/races/${raceId}/boosts`,
        { ponyId },
        { headers: this.userService.getAuthHeaders() },
      )
      .subscribe({
        next: () => sig.set(true),
        error: () => sig.set(false),
      });
    return sig.asReadonly();
  }
}

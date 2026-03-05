import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RaceModel } from '../models/race.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  list(status: 'PENDING' | 'RUNNING' | 'FINISHED' = 'PENDING'): Observable<RaceModel[]> {
    return this.http.get<RaceModel[]>(`${environment.baseUrl}/api/races`, {
      params: { status },
    });
  }

  get(raceId: number): Observable<RaceModel> {
    return this.http.get<RaceModel>(`${environment.baseUrl}/api/races/${raceId}`, {
      headers: this.userService.getAuthHeaders(),
    });
  }

  bet(raceId: number, ponyId: number): Observable<RaceModel> {
    return this.http.post<RaceModel>(
      `${environment.baseUrl}/api/races/${raceId}/bets`,
      { ponyId },
      { headers: this.userService.getAuthHeaders() },
    );
  }

  cancelBet(raceId: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/api/races/${raceId}/bets`, {
      headers: this.userService.getAuthHeaders(),
    });
  }

  boost(raceId: number, ponyId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.baseUrl}/api/races/${raceId}/boosts`,
      { ponyId },
      { headers: this.userService.getAuthHeaders() },
    );
  }
}

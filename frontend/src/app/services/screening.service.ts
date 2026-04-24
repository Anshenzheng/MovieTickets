import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

export interface Screening {
  id: number;
  movieId: number;
  hallId: number;
  startTime: string;
  endTime: string;
  price: number;
  language: string;
  version: string;
  status: ScreeningStatus;
}

export enum ScreeningStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED'
}

@Injectable({
  providedIn: 'root'
})
export class ScreeningService {
  private readonly API_URL = `${environment.apiUrl}/api/screenings`;

  constructor(private http: HttpClient) { }

  getScreeningsByMovie(movieId: number): Observable<ApiResponse<Screening[]>> {
    return this.http.get<ApiResponse<Screening[]>>(`${this.API_URL}/movie/${movieId}`);
  }

  getAvailableDates(movieId: number): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/movie/${movieId}/dates`);
  }

  getScreeningsByMovieAndDate(movieId: number, date: string): Observable<ApiResponse<Screening[]>> {
    return this.http.get<ApiResponse<Screening[]>>(`${this.API_URL}/movie/${movieId}/date/${date}`);
  }

  getScreeningById(id: number): Observable<ApiResponse<Screening>> {
    return this.http.get<ApiResponse<Screening>>(`${this.API_URL}/${id}`);
  }
}

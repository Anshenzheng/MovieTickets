import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

export interface Seat {
  id: number;
  hallId: number;
  seatRow: number;
  seatCol: number;
  seatCode: string;
  active: boolean;
}

export interface SeatLock {
  id: number;
  screeningId: number;
  seatId: number;
  userId: number;
  lockTime: string;
  expireTime: string;
  status: SeatLockStatus;
}

export enum SeatLockStatus {
  LOCKED = 'LOCKED',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED'
}

export type SeatStatus = 'AVAILABLE' | 'SOLD' | 'LOCKED' | 'MY_LOCKED' | 'SELECTED';

export interface SeatStatusResponse {
  seats: Seat[];
  seatStatus: { [key: string]: SeatStatus };
  soldSeats: number;
  lockedSeats: number;
  availableSeats: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private readonly API_URL = `${environment.apiUrl}/api/seats`;

  constructor(private http: HttpClient) { }

  getSeatsByHall(hallId: number): Observable<ApiResponse<Seat[]>> {
    return this.http.get<ApiResponse<Seat[]>>(`${this.API_URL}/hall/${hallId}`);
  }

  getSeatStatus(screeningId: number): Observable<ApiResponse<SeatStatusResponse>> {
    return this.http.get<ApiResponse<SeatStatusResponse>>(`${this.API_URL}/screening/${screeningId}/status`);
  }

  lockSeats(screeningId: number, seatIds: number[]): Observable<ApiResponse<SeatLock[]>> {
    return this.http.post<ApiResponse<SeatLock[]>>(`${this.API_URL}/lock`, {
      screeningId,
      seatIds
    });
  }

  unlockSeats(screeningId: number, seatIds: number[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/unlock`, {
      screeningId,
      seatIds
    });
  }
}

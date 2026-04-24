import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  director?: string;
  actors?: string;
  genre?: string;
  duration: number;
  releaseDate?: string;
  description?: string;
  posterUrl?: string;
  rating?: number;
  status: MovieStatus;
}

export enum MovieStatus {
  COMING_SOON = 'COMING_SOON',
  SHOWING = 'SHOWING',
  OFFLINE = 'OFFLINE'
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly API_URL = `${environment.apiUrl}/api/movies`;

  constructor(private http: HttpClient) { }

  getAllMovies(): Observable<ApiResponse<Movie[]>> {
    return this.http.get<ApiResponse<Movie[]>>(this.API_URL);
  }

  getShowingMovies(): Observable<ApiResponse<Movie[]>> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.API_URL}/showing`);
  }

  getComingSoonMovies(): Observable<ApiResponse<Movie[]>> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.API_URL}/coming-soon`);
  }

  getMovieById(id: number): Observable<ApiResponse<Movie>> {
    return this.http.get<ApiResponse<Movie>>(`${this.API_URL}/${id}`);
  }

  searchMovies(keyword: string): Observable<ApiResponse<Movie[]>> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.API_URL}/search?keyword=${keyword}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  screeningId: number;
  totalAmount: number;
  seatCount: number;
  status: OrderStatus;
  paymentTime?: string;
  expireTime: string;
  createdAt: string;
  screening?: ScreeningInfo;
}

export interface ScreeningInfo {
  id: number;
  movieId: number;
  hallId: number;
  startTime: string;
  endTime: string;
  price: number;
  movie?: MovieInfo;
}

export interface MovieInfo {
  id: number;
  title: string;
  posterUrl?: string;
  duration?: number;
  genre?: string;
}

export interface OrderSeat {
  id: number;
  orderId: number;
  seatId: number;
  screeningId: number;
  seatPrice: number;
  createdAt: string;
  seat?: SeatInfo;
}

export interface SeatInfo {
  id: number;
  hallId: number;
  seatRow: number;
  seatCol: number;
  seatCode: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) { }

  createOrder(screeningId: number, seatIds: number[]): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.API_URL, {
      screeningId,
      seatIds
    });
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/my`);
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${id}`);
  }

  getOrderByOrderNo(orderNo: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/order-no/${orderNo}`);
  }

  getOrderSeats(orderId: number): Observable<ApiResponse<OrderSeat[]>> {
    return this.http.get<ApiResponse<OrderSeat[]>>(`${this.API_URL}/${orderId}/seats`);
  }

  payOrder(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.API_URL}/${orderId}/pay`, {});
  }

  cancelOrder(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.API_URL}/${orderId}/cancel`, {});
  }
}

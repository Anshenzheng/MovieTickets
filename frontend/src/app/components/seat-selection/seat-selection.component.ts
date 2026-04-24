import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatService, Seat, SeatStatus, SeatStatusResponse } from '../../services/seat.service';
import { ScreeningService, Screening } from '../../services/screening.service';
import { MovieService, Movie } from '../../services/movie.service';
import { OrderService, Order } from '../../services/order.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-seat-selection',
  template: `
    <div class="seat-selection-container film-enter" *ngIf="screening && movie">
      <div class="page-header">
        <h1 class="film-title">🎟️ 选择座位</h1>
        <p class="page-subtitle">请在下方座位图中选择您喜欢的座位</p>
      </div>

      <div class="selection-layout">
        <div class="movie-info-card vintage-card">
          <div class="movie-poster-small">
            <img [src]="movie.posterUrl || defaultPoster" alt="{{ movie.title }}" (error)="onImageError($event)">
          </div>
          <div class="movie-details">
            <h2 class="movie-title">{{ movie.title }}</h2>
            <div class="screening-info">
              <p><span>📅</span> {{ formatDate(screening.startTime) }}</p>
              <p><span>⏰</span> {{ formatTime(screening.startTime) }} - {{ formatTime(screening.endTime) }}</p>
              <p><span>🎬</span> {{ screening.language }} / {{ screening.version }}</p>
              <p><span>💰</span> 票价: ¥{{ screening.price }}/人</p>
            </div>
          </div>
        </div>

        <div class="seat-map-container vintage-card">
          <div class="screen">
            <span>🎬 银 幕 🎬</span>
          </div>

          <div class="seat-legend">
            <div class="legend-item">
              <div class="seat available"></div>
              <span>可选</span>
            </div>
            <div class="legend-item">
              <div class="seat selected"></div>
              <span>已选</span>
            </div>
            <div class="legend-item">
              <div class="seat sold"></div>
              <span>已售</span>
            </div>
            <div class="legend-item">
              <div class="seat locked"></div>
              <span>锁定中</span>
            </div>
          </div>

          <div class="seat-map" *ngIf="seatStatus">
            <div class="seat-row" *ngFor="let row of seatRows; let rowIndex = index">
              <div class="row-label">{{ rowIndex + 1 }} 排</div>
              <div 
                class="seat-wrapper" 
                *ngFor="let seat of getSeatsInRow(rowIndex)"
              >
                <div 
                  class="seat"
                  [ngClass]="getSeatClass(seat)"
                  (click)="toggleSeat(seat)"
                  [title]="seat.seatCode"
                >
                  {{ seat.seatCol }}
                </div>
              </div>
              <div class="row-label">{{ rowIndex + 1 }} 排</div>
            </div>
          </div>

          <div *ngIf="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载座位信息...</p>
          </div>
        </div>

        <div class="selection-summary vintage-card">
          <h3 class="section-title">📋 订单摘要</h3>
          <div class="vintage-divider"></div>
          
          <div class="summary-content" *ngIf="selectedSeats.length > 0">
            <div class="selected-seats">
              <h4>已选座位:</h4>
              <div class="seat-tags">
                <span class="seat-tag" *ngFor="let seat of selectedSeats">
                  {{ seat.seatCode }}
                  <button class="remove-seat" (click)="toggleSeat(seat)">×</button>
                </span>
              </div>
            </div>
            
            <div class="price-summary">
              <div class="price-row">
                <span>单价:</span>
                <span>¥{{ screening.price }}</span>
              </div>
              <div class="price-row">
                <span>数量:</span>
                <span>{{ selectedSeats.length }} 张</span>
              </div>
              <div class="price-row total">
                <span>合计:</span>
                <span class="total-price">¥{{ getTotalPrice() }}</span>
              </div>
            </div>

            <div *ngIf="lockTimeLeft > 0" class="lock-timer">
              <div class="timer-icon">⏱️</div>
              <div class="timer-text">
                <p>座位锁定中</p>
                <p class="timer-countdown">{{ formatTimeLeft(lockTimeLeft) }}</p>
              </div>
            </div>

            <button 
              class="vintage-btn" 
              style="width: 100%; margin-top: 20px;"
              (click)="createOrder()"
              [disabled]="creatingOrder || selectedSeats.length === 0"
            >
              <span *ngIf="!creatingOrder">🎟️ 确认选座并生成订单</span>
              <span *ngIf="creatingOrder">处理中...</span>
            </button>
          </div>

          <div *ngIf="selectedSeats.length === 0" class="empty-selection">
            <div class="empty-icon">💺</div>
            <p>请在座位图中选择您喜欢的座位</p>
            <p class="subtext">点击可选座位即可选中</p>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-alert">
        ⚠️ {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .seat-selection-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      color: var(--film-brown);
      font-size: 18px;
      margin-top: 10px;
    }

    .selection-layout {
      display: grid;
      grid-template-columns: 300px 1fr 300px;
      gap: 30px;
    }

    .movie-info-card {
      height: fit-content;
    }

    .movie-poster-small {
      width: 100%;
      height: 200px;
      margin-bottom: 15px;
      border-radius: 4px;
      overflow: hidden;
    }

    .movie-poster-small img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .movie-title {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 20px;
      font-weight: bold;
      color: var(--film-dark-brown);
      margin-bottom: 15px;
    }

    .screening-info p {
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .screening-info span:first-child {
      font-size: 16px;
    }

    .seat-map-container {
      text-align: center;
    }

    .screen {
      background: linear-gradient(180deg, var(--film-white) 0%, var(--film-light-brown) 100%);
      border: 4px solid var(--film-dark-brown);
      border-radius: 4px;
      text-align: center;
      padding: 15px;
      margin-bottom: 40px;
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: bold;
      color: var(--film-dark-brown);
      transform: perspective(500px) rotateX(-20deg);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .seat-legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
    }

    .seat-map {
      display: inline-block;
    }

    .seat-row {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      gap: 8px;
    }

    .row-label {
      width: 50px;
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
    }

    .seat-wrapper {
      display: flex;
      gap: 2px;
    }

    .selection-summary {
      height: fit-content;
    }

    .section-title {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 18px;
      margin-bottom: 10px;
    }

    .selected-seats h4 {
      font-family: 'Noto Serif SC', serif;
      color: var(--film-dark-brown);
      margin-bottom: 10px;
    }

    .seat-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .seat-tag {
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      color: var(--film-white);
      padding: 6px 12px;
      border-radius: 4px;
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .remove-seat {
      background: none;
      border: none;
      color: var(--film-white);
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .remove-seat:hover {
      color: var(--film-dark-red);
    }

    .price-summary {
      margin-top: 20px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
      margin: 10px 0;
    }

    .price-row.total {
      font-size: 18px;
      font-weight: bold;
      color: var(--film-dark-brown);
      padding-top: 10px;
      border-top: 2px dashed var(--film-brown);
    }

    .total-price {
      color: var(--film-dark-gold);
      font-family: 'Playfair Display', serif;
      font-size: 24px;
    }

    .lock-timer {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: linear-gradient(145deg, rgba(218, 165, 32, 0.1), rgba(184, 134, 11, 0.1));
      border: 2px solid var(--film-gold);
      border-radius: 4px;
      margin-top: 20px;
    }

    .timer-icon {
      font-size: 32px;
    }

    .timer-text p {
      font-family: 'Noto Serif SC', serif;
      color: var(--film-dark-brown);
      margin: 0;
    }

    .timer-countdown {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .empty-selection {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .empty-selection p {
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
      margin: 10px 0;
    }

    .empty-selection .subtext {
      font-size: 14px;
      color: var(--film-light-gray);
    }

    .loading-container {
      text-align: center;
      padding: 40px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--film-light-brown);
      border-top-color: var(--film-gold);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-alert {
      background: linear-gradient(145deg, rgba(139, 0, 0, 0.1), rgba(92, 0, 0, 0.1));
      border: 2px solid var(--film-red);
      border-radius: 4px;
      padding: 15px 20px;
      color: var(--film-dark-red);
      font-family: 'Noto Serif SC', serif;
      margin-top: 20px;
    }

    @media (max-width: 1200px) {
      .selection-layout {
        grid-template-columns: 1fr;
      }

      .movie-info-card {
        order: 1;
      }

      .seat-map-container {
        order: 2;
      }

      .selection-summary {
        order: 3;
      }
    }
  `]
})
export class SeatSelectionComponent implements OnInit, OnDestroy {
  screening: Screening | null = null;
  movie: Movie | null = null;
  seatStatus: SeatStatusResponse | null = null;
  selectedSeats: Seat[] = [];
  loading = true;
  creatingOrder = false;
  errorMessage = '';
  lockTimeLeft = 300;
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';
  
  private timerSubscription: Subscription | null = null;
  private screeningId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seatService: SeatService,
    private screeningService: ScreeningService,
    private movieService: MovieService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('screeningId');
    if (id) {
      this.screeningId = parseInt(id, 10);
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.selectedSeats.length > 0) {
      this.seatService.unlockSeats(
        this.screeningId,
        this.selectedSeats.map(s => s.id)
      ).subscribe();
    }
  }

  loadData(): void {
    this.loading = true;
    
    this.screeningService.getScreeningById(this.screeningId).subscribe({
      next: (response) => {
        if (response.success) {
          this.screening = response.data;
          this.loadMovie(this.screening.movieId);
        }
      },
      error: (error) => {
        console.error('加载场次失败:', error);
        this.loading = false;
      }
    });

    this.loadSeatStatus();
  }

  loadMovie(movieId: number): void {
    this.movieService.getMovieById(movieId).subscribe({
      next: (response) => {
        if (response.success) {
          this.movie = response.data;
        }
      },
      error: (error) => {
        console.error('加载电影失败:', error);
      }
    });
  }

  loadSeatStatus(): void {
    this.seatService.getSeatStatus(this.screeningId).subscribe({
      next: (response) => {
        if (response.success) {
          this.seatStatus = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载座位状态失败:', error);
        this.loading = false;
      }
    });
  }

  get seatRows(): number {
    if (!this.seatStatus || this.seatStatus.seats.length === 0) {
      return 0;
    }
    const maxRow = Math.max(...this.seatStatus.seats.map(s => s.seatRow));
    return maxRow;
  }

  getSeatsInRow(rowIndex: number): Seat[] {
    if (!this.seatStatus) {
      return [];
    }
    return this.seatStatus.seats
      .filter(s => s.seatRow === rowIndex + 1)
      .sort((a, b) => a.seatCol - b.seatCol);
  }

  getSeatClass(seat: Seat): string {
    const isSelected = this.selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      return 'selected';
    }

    if (!this.seatStatus) {
      return 'available';
    }

    const status = this.seatStatus.seatStatus[seat.id.toString()] || this.seatStatus.seatStatus[seat.id];
    switch (status) {
      case 'SOLD':
        return 'sold';
      case 'LOCKED':
        return 'locked';
      case 'MY_LOCKED':
        return 'my-locked';
      default:
        return 'available';
    }
  }

  toggleSeat(seat: Seat): void {
    const status = this.seatStatus?.seatStatus[seat.id.toString()] || this.seatStatus?.seatStatus[seat.id];
    
    if (status === 'SOLD' || status === 'LOCKED') {
      return;
    }

    const selectedIndex = this.selectedSeats.findIndex(s => s.id === seat.id);
    
    if (selectedIndex > -1) {
      const removedSeat = this.selectedSeats[selectedIndex];
      this.selectedSeats.splice(selectedIndex, 1);
      
      this.seatService.unlockSeats(this.screeningId, [removedSeat.id]).subscribe();
      
      if (this.selectedSeats.length === 0 && this.timerSubscription) {
        this.timerSubscription.unsubscribe();
        this.timerSubscription = null;
        this.lockTimeLeft = 300;
      }
    } else {
      this.seatService.lockSeats(this.screeningId, [seat.id]).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedSeats.push(seat);
            
            if (this.selectedSeats.length === 1) {
              this.startLockTimer();
            }
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || '锁定座位失败，请重试';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  startLockTimer(): void {
    this.lockTimeLeft = 300;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.lockTimeLeft--;
      if (this.lockTimeLeft <= 0) {
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
          this.timerSubscription = null;
        }
        this.selectedSeats = [];
        this.loadSeatStatus();
      }
    });
  }

  getTotalPrice(): number {
    if (!this.screening) {
      return 0;
    }
    return this.screening.price * this.selectedSeats.length;
  }

  formatTimeLeft(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  createOrder(): void {
    if (this.selectedSeats.length === 0) {
      this.errorMessage = '请先选择座位';
      return;
    }

    this.creatingOrder = true;
    this.errorMessage = '';

    const seatIds = this.selectedSeats.map(s => s.id);
    
    this.orderService.createOrder(this.screeningId, seatIds).subscribe({
      next: (response) => {
        if (response.success) {
          if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
          }
          this.router.navigate(['/orders', response.data.id]);
        } else {
          this.errorMessage = response.message || '创建订单失败';
          this.creatingOrder = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || '创建订单失败，请重试';
        this.creatingOrder = false;
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultPoster;
  }
}

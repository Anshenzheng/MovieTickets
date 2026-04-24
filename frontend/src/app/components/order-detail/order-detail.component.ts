import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order, OrderStatus, OrderSeat } from '../../services/order.service';

@Component({
  selector: 'app-order-detail',
  template: `
    <div class="order-detail-container film-enter" *ngIf="order">
      <div class="page-header">
        <button class="back-btn" (click)="goBack()">
          ← 返回订单列表
        </button>
        <h1 class="film-title">🎟️ 订单详情</h1>
      </div>

      <div class="order-detail-layout">
        <div class="main-content">
          <div class="vintage-card order-card">
            <div class="order-header">
              <div class="order-number-section">
                <span class="order-label">订单号</span>
                <span class="order-no">{{ order.orderNo }}</span>
              </div>
              <div class="order-status-section">
                <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </div>
            
            <div class="vintage-divider"></div>

            <div class="movie-section" *ngIf="order.screening?.movie">
              <div class="movie-poster-large">
                <img [src]="order.screening.movie.posterUrl || defaultPoster" alt="{{ order.screening.movie.title }}">
              </div>
              <div class="movie-info">
                <h2 class="movie-title">{{ order.screening.movie.title }}</h2>
                <div class="movie-meta">
                  <p *ngIf="order.screening.movie.genre">
                    <span class="meta-label">类型:</span>
                    <span>{{ order.screening.movie.genre }}</span>
                  </p>
                  <p *ngIf="order.screening.movie.duration">
                    <span class="meta-label">片长:</span>
                    <span>{{ order.screening.movie.duration }} 分钟</span>
                  </p>
                </div>
              </div>
            </div>

            <div class="vintage-divider"></div>

            <div class="screening-section">
              <h3 class="section-title">🎬 场次信息</h3>
              <div class="screening-info-grid">
                <div class="info-item">
                  <span class="info-label">放映日期</span>
                  <span class="info-value">{{ formatDate(order.screening?.startTime) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">放映时间</span>
                  <span class="info-value">{{ formatTime(order.screening?.startTime) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">语言版本</span>
                  <span class="info-value">{{ order.screening?.language }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">放映格式</span>
                  <span class="info-value">{{ order.screening?.version }}</span>
                </div>
              </div>
            </div>

            <div class="vintage-divider"></div>

            <div class="seats-section">
              <h3 class="section-title">💺 座位信息</h3>
              <div class="seat-list">
                <div class="seat-item" *ngFor="let seat of orderSeats">
                  <span class="seat-icon">🎟️</span>
                  <span class="seat-code">{{ seat.seat?.seatCode }}</span>
                  <span class="seat-price">¥{{ seat.seatPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="vintage-card price-card">
            <h3 class="section-title">💰 订单金额</h3>
            <div class="vintage-divider"></div>
            
            <div class="price-details">
              <div class="price-row">
                <span>票价 x{{ order.seatCount }}</span>
                <span>¥{{ order.totalAmount }}</span>
              </div>
              <div class="price-row">
                <span>服务费</span>
                <span>¥0.00</span>
              </div>
            </div>
            
            <div class="vintage-divider"></div>
            
            <div class="total-price-section">
              <span class="total-label">应付金额</span>
              <span class="total-value">¥{{ order.totalAmount }}</span>
            </div>

            <div class="action-buttons" *ngIf="order.status === OrderStatus.PENDING">
              <button 
                class="vintage-btn" 
                style="width: 100%; margin-bottom: 10px;"
                (click)="payOrder()"
              >
                立即支付
              </button>
              <button 
                class="vintage-btn vintage-btn-secondary" 
                style="width: 100%;"
                (click)="cancelOrder()"
              >
                取消订单
              </button>
            </div>

            <div class="order-time-info" *ngIf="order.status === OrderStatus.PENDING">
              <div class="warning-text">
                ⚠️ 请在 {{ formatTime(order.expireTime) }} 前完成支付，超时订单将自动取消
              </div>
            </div>
          </div>

          <div class="vintage-card info-card">
            <h3 class="section-title">📋 订单信息</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-row-label">下单时间</span>
                <span class="info-row-value">{{ formatDateTime(order.createdAt) }}</span>
              </div>
              <div class="info-row" *ngIf="order.paymentTime">
                <span class="info-row-label">支付时间</span>
                <span class="info-row-value">{{ formatDateTime(order.paymentTime) }}</span>
              </div>
              <div class="info-row">
                <span class="info-row-label">座位数量</span>
                <span class="info-row-value">{{ order.seatCount }} 张</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-detail-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
      position: relative;
    }

    .back-btn {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--film-dark-brown);
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      cursor: pointer;
      padding: 10px 15px;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .back-btn:hover {
      background: var(--film-light-brown);
    }

    .order-detail-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .order-label {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-gray);
      display: block;
      margin-bottom: 5px;
    }

    .order-no {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: bold;
      color: var(--film-dark-brown);
    }

    .movie-section {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
    }

    .movie-poster-large {
      width: 160px;
      height: 230px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .movie-poster-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .movie-info {
      flex: 1;
    }

    .movie-title {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 28px;
      font-weight: bold;
      color: var(--film-dark-brown);
      margin-bottom: 20px;
    }

    .movie-meta p {
      font-family: 'Noto Serif SC', serif;
      margin: 10px 0;
      display: flex;
      gap: 10px;
    }

    .meta-label {
      font-weight: bold;
      color: var(--film-dark-brown);
      min-width: 50px;
    }

    .section-title {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 18px;
      margin-bottom: 15px;
    }

    .screening-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .info-label {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-gray);
    }

    .info-value {
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      font-weight: bold;
      color: var(--film-dark-brown);
    }

    .seat-list {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .seat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: linear-gradient(145deg, var(--film-light-brown), var(--film-cream));
      border: 2px solid var(--film-brown);
      border-radius: 4px;
    }

    .seat-icon {
      font-size: 20px;
    }

    .seat-code {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 16px;
    }

    .seat-price {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .price-details {
      margin-bottom: 10px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
      margin: 10px 0;
    }

    .total-price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
    }

    .total-label {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 18px;
    }

    .total-value {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .action-buttons {
      margin-top: 20px;
    }

    .warning-text {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-dark-red);
      background: rgba(139, 0, 0, 0.1);
      border: 2px solid var(--film-red);
      border-radius: 4px;
      padding: 12px;
      margin-top: 15px;
    }

    .info-list {
      margin-top: 10px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-family: 'Noto Serif SC', serif;
      margin: 12px 0;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--film-light-brown);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row-label {
      color: var(--film-gray);
      font-size: 14px;
    }

    .info-row-value {
      color: var(--film-dark-brown);
      font-weight: bold;
      font-size: 14px;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(245, 240, 225, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-container {
      text-align: center;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 5px solid var(--film-light-brown);
      border-top-color: var(--film-gold);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .order-detail-layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        order: -1;
      }

      .movie-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .movie-meta p {
        justify-content: center;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  orderSeats: OrderSeat[] = [];
  loading = true;
  OrderStatus = OrderStatus;
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(parseInt(orderId, 10));
    }
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    
    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.order = response.data;
          this.loadOrderSeats(orderId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('加载订单失败:', error);
        this.loading = false;
      }
    });
  }

  loadOrderSeats(orderId: number): void {
    this.orderService.getOrderSeats(orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.orderSeats = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载订单座位失败:', error);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PAID:
        return 'status-paid';
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PAID:
        return '已支付';
      case OrderStatus.PENDING:
        return '待支付';
      case OrderStatus.CANCELLED:
        return '已取消';
      case OrderStatus.REFUNDED:
        return '已退款';
      default:
        return status;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  }

  formatTime(timeString?: string): string {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  payOrder(): void {
    if (!this.order) return;
    
    if (confirm(`确认支付订单 ${this.order.orderNo}，金额 ¥${this.order.totalAmount}？`)) {
      this.orderService.payOrder(this.order.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('支付成功！');
            this.loadOrder(this.order!.id);
          } else {
            alert(response.message || '支付失败');
          }
        },
        error: (error) => {
          alert(error.error?.message || '支付失败');
        }
      });
    }
  }

  cancelOrder(): void {
    if (!this.order) return;
    
    if (confirm('确定要取消这个订单吗？')) {
      this.orderService.cancelOrder(this.order.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('订单已取消');
            this.loadOrder(this.order!.id);
          } else {
            alert(response.message || '取消失败');
          }
        },
        error: (error) => {
          alert(error.error?.message || '取消失败');
        }
      });
    }
  }
}

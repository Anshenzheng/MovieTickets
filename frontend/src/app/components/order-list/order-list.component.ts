import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order, OrderStatus } from '../../services/order.service';

@Component({
  selector: 'app-order-list',
  template: `
    <div class="order-list-container film-enter">
      <div class="page-header">
        <h1 class="film-title">🎟️ 我的订单</h1>
        <p class="page-subtitle">查看和管理您的电影票订单</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载订单中...</p>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="empty-state">
        <div class="empty-icon">🎬</div>
        <h3>暂无订单</h3>
        <p>您还没有购买过电影票</p>
        <button class="vintage-btn" (click)="goToMovies()">
          🎬 去选片
        </button>
      </div>

      <div class="orders-grid" *ngIf="!loading && orders.length > 0">
        <div class="order-card vintage-card" *ngFor="let order of orders" (click)="goToOrderDetail(order.id)">
          <div class="order-header">
            <div class="order-number">
              <span class="order-label">订单号</span>
              <span class="order-no">{{ order.orderNo }}</span>
            </div>
            <div class="order-status">
              <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>
          
          <div class="vintage-divider" style="margin: 15px 0;"></div>
          
          <div class="order-movie-info" *ngIf="order.screening?.movie">
            <div class="movie-poster-small">
              <img [src]="order.screening.movie.posterUrl || defaultPoster" alt="{{ order.screening.movie.title }}">
            </div>
            <div class="movie-details">
              <h3 class="movie-title">{{ order.screening.movie.title }}</h3>
              <div class="screening-info">
                <p><span>📅</span> {{ formatDateTime(order.screening.startTime) }}</p>
                <p><span>💺</span> {{ order.seatCount }} 张票</p>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-price">
              <span class="price-label">订单金额</span>
              <span class="price-value">¥{{ order.totalAmount }}</span>
            </div>
            <div class="order-time">
              <span>下单时间: {{ formatDateTime(order.createdAt) }}</span>
            </div>
          </div>
          
          <div class="order-actions" *ngIf="order.status === OrderStatus.PENDING">
            <button 
              class="vintage-btn" 
              style="width: 48%;"
              (click)="$event.stopPropagation(); payOrder(order)"
            >
              立即支付
            </button>
            <button 
              class="vintage-btn vintage-btn-danger" 
              style="width: 48%;"
              (click)="$event.stopPropagation(); cancelOrder(order)"
            >
              取消订单
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-list-container {
      max-width: 1200px;
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

    .loading-container {
      text-align: center;
      padding: 80px;
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

    .empty-state {
      text-align: center;
      padding: 80px;
      background: linear-gradient(145deg, var(--film-white), var(--film-light-brown));
      border: var(--vintage-border);
      border-radius: 8px;
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 24px;
      color: var(--film-dark-brown);
      margin-bottom: 15px;
    }

    .empty-state p {
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      color: var(--film-gray);
      margin-bottom: 25px;
    }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 30px;
    }

    .order-card {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .order-card:hover {
      transform: translateY(-5px);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .order-label {
      font-family: 'Noto Serif SC', serif;
      font-size: 12px;
      color: var(--film-gray);
      display: block;
      margin-bottom: 5px;
    }

    .order-no {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: bold;
      color: var(--film-dark-brown);
    }

    .order-movie-info {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }

    .movie-poster-small {
      width: 80px;
      height: 110px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .movie-poster-small img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .movie-details {
      flex: 1;
    }

    .movie-title {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 18px;
      font-weight: bold;
      color: var(--film-dark-brown);
      margin-bottom: 10px;
    }

    .screening-info p {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-gray);
      margin: 5px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 15px;
      border-top: 2px dashed var(--film-brown);
    }

    .price-label {
      font-family: 'Noto Serif SC', serif;
      font-size: 12px;
      color: var(--film-gray);
      display: block;
    }

    .price-value {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .order-time {
      font-family: 'Noto Serif SC', serif;
      font-size: 12px;
      color: var(--film-light-gray);
    }

    .order-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid var(--film-light-brown);
    }

    @media (max-width: 768px) {
      .orders-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  OrderStatus = OrderStatus;
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载订单失败:', error);
        this.loading = false;
      }
    });
  }

  goToOrderDetail(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  goToMovies(): void {
    this.router.navigate(['/movies']);
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  payOrder(order: Order): void {
    if (confirm(`确认支付订单 ${order.orderNo}，金额 ¥${order.totalAmount}？`)) {
      this.orderService.payOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('支付成功！');
            this.loadOrders();
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

  cancelOrder(order: Order): void {
    if (confirm('确定要取消这个订单吗？')) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('订单已取消');
            this.loadOrders();
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

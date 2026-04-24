import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie } from '../../services/movie.service';
import { ScreeningService, Screening } from '../../services/screening.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movie-detail',
  template: `
    <div class="movie-detail-container film-enter" *ngIf="movie">
      <div class="movie-header">
        <div class="movie-poster-wrapper">
          <div class="film-poster movie-poster">
            <img [src]="movie.posterUrl || defaultPoster" alt="{{ movie.title }}" [error]="onImageError($event)">
          </div>
        </div>
        
        <div class="movie-info-wrapper">
          <h1 class="film-title movie-title">{{ movie.title }}</h1>
          <div class="movie-original-title" *ngIf="movie.originalTitle">
            {{ movie.originalTitle }}
          </div>
          
          <div class="vintage-divider"></div>
          
          <div class="movie-meta-grid">
            <div class="meta-item" *ngIf="movie.director">
              <span class="meta-label">🎬 导演</span>
              <span class="meta-value">{{ movie.director }}</span>
            </div>
            <div class="meta-item" *ngIf="movie.actors">
              <span class="meta-label">🎭 主演</span>
              <span class="meta-value">{{ movie.actors }}</span>
            </div>
            <div class="meta-item" *ngIf="movie.genre">
              <span class="meta-label">📽️ 类型</span>
              <span class="meta-value">{{ movie.genre }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">⏱️ 片长</span>
              <span class="meta-value">{{ movie.duration }} 分钟</span>
            </div>
            <div class="meta-item" *ngIf="movie.releaseDate">
              <span class="meta-label">📅 上映日期</span>
              <span class="meta-value">{{ formatDate(movie.releaseDate) }}</span>
            </div>
            <div class="meta-item" *ngIf="movie.rating">
              <span class="meta-label">⭐ 评分</span>
              <span class="meta-value rating-value">{{ movie.rating }}</span>
            </div>
          </div>
          
          <div class="movie-description" *ngIf="movie.description">
            <h3 class="section-subtitle">📖 剧情简介</h3>
            <p>{{ movie.description }}</p>
          </div>
        </div>
      </div>

      <div class="screenings-section" *ngIf="screenings.length > 0">
        <h2 class="film-title section-title">🎟️ 场次选择</h2>
        
        <div class="screenings-grid">
          <div class="screening-card" *ngFor="let screening of screenings" (click)="goToSeatSelection(screening.id)">
            <div class="screening-time">
              <span class="time-display">{{ formatTime(screening.startTime) }}</span>
              <span class="time-label">{{ getDayOfWeek(screening.startTime) }}</span>
            </div>
            <div class="screening-info">
              <div class="screening-version">
                <span class="version-badge">{{ screening.version }}</span>
                <span class="language-badge">{{ screening.language }}</span>
              </div>
              <div class="screening-hall">
                🎬 {{ screening.startTime | date:'MM月dd日' }} | 影厅信息
              </div>
            </div>
            <div class="screening-price">
              <span class="price-currency">¥</span>
              <span class="price-value">{{ screening.price }}</span>
              <span class="price-label">/人</span>
            </div>
            <button class="vintage-btn" style="width: 100%; margin-top: 10px;">
              立即选座
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && screenings.length === 0" class="no-screenings">
        <div class="empty-icon">🎬</div>
        <p>暂无排片场次</p>
        <p class="subtext">该电影暂未安排排片，请稍后再查看</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </div>
  `,
  styles: [`
    .movie-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .movie-header {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 40px;
      margin-bottom: 50px;
    }

    .movie-poster-wrapper {
      display: flex;
      justify-content: center;
    }

    .movie-poster {
      width: 100%;
      max-width: 350px;
      height: 500px;
    }

    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .movie-title {
      font-size: 36px;
      margin-bottom: 10px;
    }

    .movie-original-title {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 20px;
      color: var(--film-gray);
      margin-bottom: 15px;
    }

    .movie-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .meta-label {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 14px;
    }

    .meta-value {
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
      font-size: 16px;
    }

    .meta-value.rating-value {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .movie-description {
      margin-top: 30px;
    }

    .section-subtitle {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 18px;
      margin-bottom: 15px;
    }

    .movie-description p {
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      color: var(--film-gray);
      line-height: 1.8;
    }

    .screenings-section {
      margin-top: 50px;
    }

    .section-title {
      margin-bottom: 30px;
      font-size: 28px;
    }

    .screenings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }

    .screening-card {
      background: linear-gradient(145deg, var(--film-white), var(--film-light-brown));
      border: var(--vintage-border);
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .screening-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .screening-time {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px dashed var(--film-brown);
    }

    .time-display {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: bold;
      color: var(--film-dark-brown);
    }

    .time-label {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-gray);
    }

    .screening-info {
      margin-bottom: 15px;
    }

    .screening-version {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .version-badge,
    .language-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .version-badge {
      background: linear-gradient(145deg, var(--film-brown), var(--film-dark-brown));
      color: var(--film-white);
    }

    .language-badge {
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      color: var(--film-white);
    }

    .screening-hall {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-gray);
    }

    .screening-price {
      text-align: center;
      padding: 10px;
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      border-radius: 4px;
      color: var(--film-white);
    }

    .price-currency {
      font-size: 16px;
    }

    .price-value {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: bold;
    }

    .price-label {
      font-size: 14px;
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

    .no-screenings {
      text-align: center;
      padding: 60px;
      background: linear-gradient(145deg, var(--film-white), var(--film-light-brown));
      border: var(--vintage-border);
      border-radius: 8px;
    }

    .no-screenings .empty-icon {
      font-size: 60px;
      margin-bottom: 20px;
    }

    .no-screenings p {
      font-family: 'Noto Serif SC', serif;
      font-size: 18px;
      color: var(--film-gray);
      margin-bottom: 10px;
    }

    .no-screenings .subtext {
      font-size: 14px;
      color: var(--film-light-gray);
    }

    @media (max-width: 768px) {
      .movie-header {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .movie-poster {
        max-width: 280px;
        height: 400px;
      }

      .movie-meta-grid {
        grid-template-columns: 1fr;
      }

      .screenings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  screenings: Screening[] = [];
  loading = true;
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private screeningService: ScreeningService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovie(parseInt(movieId, 10));
    }
  }

  loadMovie(movieId: number): void {
    this.loading = true;
    
    this.movieService.getMovieById(movieId).subscribe({
      next: (response) => {
        if (response.success) {
          this.movie = response.data;
          this.loadScreenings(movieId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('加载电影详情失败:', error);
        this.loading = false;
      }
    });
  }

  loadScreenings(movieId: number): void {
    this.screeningService.getScreeningsByMovie(movieId).subscribe({
      next: (response) => {
        if (response.success) {
          this.screenings = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载场次失败:', error);
        this.loading = false;
      }
    });
  }

  goToSeatSelection(screeningId: number): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/screenings/${screeningId}/seats` } });
      return;
    }
    this.router.navigate(['/screenings', screeningId, 'seats']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  getDayOfWeek(timeString: string): string {
    const date = new Date(timeString);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultPoster;
  }
}

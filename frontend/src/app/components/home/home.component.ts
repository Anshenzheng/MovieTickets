import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService, Movie, MovieStatus } from '../../services/movie.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container film-enter">
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="film-title hero-title">🎞️ 复古胶片影院</h1>
          <p class="hero-subtitle">每一张电影票，都是一段时光的记忆</p>
          <div class="vintage-divider"></div>
          <p class="hero-description">
            欢迎来到复古胶片影院，在这里，您可以体验到经典电影的独特魅力。
            我们精选了影史经典，让您重温胶片电影的黄金时代。
          </p>
          <button class="vintage-btn" (click)="scrollToMovies()">
            🎬 立即选片
          </button>
        </div>
      </section>

      <section class="showing-section" id="movies-section">
        <div class="section-header">
          <h2 class="film-title">🎬 正在热映</h2>
          <p class="section-subtitle">经典影片，不容错过</p>
        </div>
        
        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div *ngIf="!loading && showingMovies.length === 0" class="empty-state">
          <p>暂无正在热映的电影</p>
        </div>
        
        <div class="movies-grid" *ngIf="!loading && showingMovies.length > 0">
          <div class="movie-card-wrapper" *ngFor="let movie of showingMovies">
            <div class="movie-card" (click)="goToMovieDetail(movie.id)">
              <div class="film-poster movie-poster">
                <img [src]="movie.posterUrl || defaultPoster" alt="{{ movie.title }}" [error]="onImageError($event)">
              </div>
              <div class="movie-info">
                <h3 class="movie-title">{{ movie.title }}</h3>
                <div class="movie-meta">
                  <span class="movie-genre">{{ movie.genre || '经典' }}</span>
                  <span class="movie-duration">⏱️ {{ movie.duration }}分钟</span>
                </div>
                <div class="movie-rating" *ngIf="movie.rating">
                  <span class="rating-star">⭐</span>
                  <span class="rating-value">{{ movie.rating }}</span>
                </div>
                <button class="vintage-btn vintage-btn-secondary" style="width: 100%; margin-top: 10px; padding: 8px 16px; font-size: 14px;">
                  🎟️ 立即购票
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="coming-soon-section">
        <div class="section-header">
          <h2 class="film-title">📽️ 即将上映</h2>
          <p class="section-subtitle">精彩影片，敬请期待</p>
        </div>
        
        <div class="movies-grid" *ngIf="comingSoonMovies.length > 0">
          <div class="movie-card-wrapper" *ngFor="let movie of comingSoonMovies">
            <div class="movie-card coming-soon-card">
              <div class="film-poster movie-poster">
                <div class="coming-soon-badge">即将上映</div>
                <img [src]="movie.posterUrl || defaultPoster" alt="{{ movie.title }}" [error]="onImageError($event)">
              </div>
              <div class="movie-info">
                <h3 class="movie-title">{{ movie.title }}</h3>
                <div class="movie-meta">
                  <span class="movie-genre">{{ movie.genre || '经典' }}</span>
                  <span class="movie-duration">⏱️ {{ movie.duration }}分钟</span>
                </div>
                <div class="release-date" *ngIf="movie.releaseDate">
                  📅 上映日期: {{ formatDate(movie.releaseDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-section {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(180deg, var(--film-light-brown) 0%, var(--film-cream) 100%);
      border-radius: 8px;
      margin: 20px;
      position: relative;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 3px dashed var(--film-brown);
      border-radius: 4px;
      pointer-events: none;
      opacity: 0.3;
    }

    .hero-title {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .hero-subtitle {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-style: italic;
      color: var(--film-brown);
      margin-bottom: 20px;
    }

    .hero-description {
      font-family: 'Noto Serif SC', serif;
      font-size: 18px;
      color: var(--film-gray);
      max-width: 600px;
      margin: 0 auto 30px;
      line-height: 1.8;
    }

    .section-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .section-subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      color: var(--film-brown);
      font-size: 18px;
      margin-top: 10px;
    }

    .showing-section,
    .coming-soon-section {
      padding: 40px 20px;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 30px;
    }

    .movie-card-wrapper {
      display: flex;
      justify-content: center;
    }

    .movie-card {
      width: 100%;
      max-width: 300px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .movie-card:hover {
      transform: translateY(-5px);
    }

    .movie-poster {
      width: 100%;
      height: 420px;
      margin-bottom: 15px;
    }

    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .movie-info {
      padding: 0 5px;
    }

    .movie-title {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 20px;
      font-weight: bold;
      color: var(--film-dark-brown);
      margin-bottom: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .movie-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .movie-genre {
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      color: var(--film-white);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .movie-duration {
      color: var(--film-gray);
      font-size: 14px;
    }

    .movie-rating {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .rating-star {
      font-size: 16px;
    }

    .rating-value {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .coming-soon-card {
      opacity: 0.8;
      position: relative;
    }

    .coming-soon-badge {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(145deg, var(--film-red), var(--film-dark-red));
      color: var(--film-white);
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      z-index: 10;
      border: 2px solid var(--film-white);
    }

    .release-date {
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
      font-size: 14px;
      margin-top: 10px;
    }

    .loading-container {
      text-align: center;
      padding: 60px;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--film-light-brown);
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
      padding: 60px;
      color: var(--film-gray);
      font-family: 'Noto Serif SC', serif;
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 32px;
      }

      .hero-subtitle {
        font-size: 18px;
      }

      .movies-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      .movie-poster {
        height: 350px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  showingMovies: Movie[] = [];
  comingSoonMovies: Movie[] = [];
  loading = true;
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';

  constructor(
    private movieService: MovieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getShowingMovies().subscribe({
      next: (response) => {
        if (response.success) {
          this.showingMovies = response.data;
        }
      },
      error: (error) => {
        console.error('加载热映电影失败:', error);
      }
    });

    this.movieService.getComingSoonMovies().subscribe({
      next: (response) => {
        if (response.success) {
          this.comingSoonMovies = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载即将上映电影失败:', error);
        this.loading = false;
      }
    });
  }

  goToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  scrollToMovies(): void {
    const element = document.getElementById('movies-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultPoster;
  }
}

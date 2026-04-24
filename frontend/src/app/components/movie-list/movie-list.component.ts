import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService, Movie, MovieStatus } from '../../services/movie.service';

@Component({
  selector: 'app-movie-list',
  template: `
    <div class="movie-list-container film-enter">
      <div class="page-header">
        <h1 class="film-title">🎬 电影列表</h1>
        <p class="page-subtitle">探索经典影片，开启光影之旅</p>
      </div>

      <div class="filter-section">
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchKeyword" 
            class="vintage-input"
            placeholder="搜索电影名称..."
            (keyup.enter)="searchMovies()"
          >
          <button class="vintage-btn" (click)="searchMovies()" style="padding: 10px 20px;">
            🔍 搜索
          </button>
        </div>
        
        <div class="category-tabs">
          <button 
            class="tab-btn" 
            [ngClass]="{'active': activeTab === 'all'}"
            (click)="filterByTab('all')"
          >
            全部电影
          </button>
          <button 
            class="tab-btn" 
            [ngClass]="{'active': activeTab === 'showing'}"
            (click)="filterByTab('showing')"
          >
            🎬 正在热映
          </button>
          <button 
            class="tab-btn" 
            [ngClass]="{'active': activeTab === 'coming'}"
            (click)="filterByTab('coming')"
          >
            📽️ 即将上映
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div *ngIf="!loading && movies.length === 0" class="empty-state">
        <div class="empty-icon">🎞️</div>
        <p>暂无电影</p>
        <button class="vintage-btn" (click)="loadAllMovies()">
          刷新列表
        </button>
      </div>

      <div class="movies-grid" *ngIf="!loading && movies.length > 0">
        <div class="movie-card-wrapper" *ngFor="let movie of movies">
          <div class="movie-card" (click)="goToMovieDetail(movie.id)">
            <div class="film-poster movie-poster">
              <div class="status-badge" [ngClass]="getStatusClass(movie.status)">
                {{ getStatusText(movie.status) }}
              </div>
              <img [src]="movie.posterUrl || defaultPoster" alt="{{ movie.title }}" [error]="onImageError($event)">
            </div>
            <div class="movie-info">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-meta-row">
                <span class="movie-genre">{{ movie.genre || '经典' }}</span>
                <span class="movie-duration">⏱️ {{ movie.duration }}分钟</span>
              </div>
              <div class="movie-rating" *ngIf="movie.rating">
                <span class="rating-stars">
                  <span *ngFor="let star of getStars(movie.rating)">
                    {{ star ? '⭐' : '☆' }}
                  </span>
                </span>
                <span class="rating-value">{{ movie.rating }}</span>
              </div>
              <p class="movie-description" *ngIf="movie.description">
                {{ truncateText(movie.description, 80) }}
              </p>
              <button class="vintage-btn" style="width: 100%; margin-top: 15px;">
                🎟️ 查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movie-list-container {
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

    .filter-section {
      margin-bottom: 40px;
    }

    .search-box {
      display: flex;
      gap: 15px;
      max-width: 600px;
      margin: 0 auto 30px;
    }

    .search-box .vintage-input {
      flex: 1;
    }

    .category-tabs {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: var(--film-light-brown);
      border: 2px solid var(--film-brown);
      color: var(--film-dark-brown);
      padding: 10px 24px;
      font-family: 'Noto Serif SC', serif;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .tab-btn:hover {
      background: var(--film-brown);
      color: var(--film-white);
    }

    .tab-btn.active {
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      color: var(--film-white);
      border-color: var(--film-dark-gold);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
    }

    .movie-card-wrapper {
      display: flex;
      justify-content: center;
    }

    .movie-card {
      width: 100%;
      max-width: 320px;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .movie-card:hover {
      transform: translateY(-8px);
    }

    .movie-poster {
      width: 100%;
      height: 450px;
      margin-bottom: 15px;
      position: relative;
    }

    .movie-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 10;
      padding: 6px 14px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 2px solid var(--film-white);
    }

    .status-showing {
      background: linear-gradient(145deg, #32CD32, #228B22);
      color: var(--film-white);
    }

    .status-coming {
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      color: var(--film-white);
    }

    .status-offline {
      background: linear-gradient(145deg, var(--film-gray), #333);
      color: var(--film-white);
    }

    .movie-info {
      padding: 0 5px;
    }

    .movie-title {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 22px;
      font-weight: bold;
      color: var(--film-dark-brown);
      margin-bottom: 12px;
    }

    .movie-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .movie-genre {
      background: linear-gradient(145deg, var(--film-gold), var(--film-dark-gold));
      color: var(--film-white);
      padding: 4px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: bold;
    }

    .movie-duration {
      color: var(--film-gray);
      font-size: 14px;
    }

    .movie-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .rating-stars {
      font-size: 14px;
    }

    .rating-value {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: bold;
      color: var(--film-dark-gold);
    }

    .movie-description {
      font-family: 'Noto Serif SC', serif;
      font-size: 14px;
      color: var(--film-gray);
      line-height: 1.6;
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
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .empty-state p {
      font-family: 'Noto Serif SC', serif;
      font-size: 18px;
      color: var(--film-gray);
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .search-box {
        flex-direction: column;
      }

      .category-tabs {
        flex-direction: column;
        align-items: center;
      }

      .tab-btn {
        width: 100%;
        max-width: 300px;
      }

      .movies-grid {
        grid-template-columns: 1fr;
      }

      .movie-poster {
        height: 400px;
      }
    }
  `]
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  allMovies: Movie[] = [];
  loading = true;
  searchKeyword = '';
  activeTab = 'all';
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';

  constructor(
    private movieService: MovieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllMovies();
  }

  loadAllMovies(): void {
    this.loading = true;
    this.movieService.getAllMovies().subscribe({
      next: (response) => {
        if (response.success) {
          this.allMovies = response.data;
          this.movies = [...this.allMovies];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('加载电影列表失败:', error);
        this.loading = false;
      }
    });
  }

  filterByTab(tab: string): void {
    this.activeTab = tab;
    this.searchKeyword = '';
    
    switch (tab) {
      case 'showing':
        this.movies = this.allMovies.filter(m => m.status === MovieStatus.SHOWING);
        break;
      case 'coming':
        this.movies = this.allMovies.filter(m => m.status === MovieStatus.COMING_SOON);
        break;
      default:
        this.movies = [...this.allMovies];
    }
  }

  searchMovies(): void {
    if (!this.searchKeyword.trim()) {
      this.filterByTab(this.activeTab);
      return;
    }

    const keyword = this.searchKeyword.toLowerCase();
    let filtered = this.allMovies.filter(m => 
      m.title.toLowerCase().includes(keyword) ||
      (m.director && m.director.toLowerCase().includes(keyword)) ||
      (m.actors && m.actors.toLowerCase().includes(keyword)) ||
      (m.genre && m.genre.toLowerCase().includes(keyword))
    );

    if (this.activeTab === 'showing') {
      filtered = filtered.filter(m => m.status === MovieStatus.SHOWING);
    } else if (this.activeTab === 'coming') {
      filtered = filtered.filter(m => m.status === MovieStatus.COMING_SOON);
    }

    this.movies = filtered;
  }

  goToMovieDetail(movieId: number): void {
    this.router.navigate(['/movies', movieId]);
  }

  getStatusClass(status: MovieStatus): string {
    switch (status) {
      case MovieStatus.SHOWING:
        return 'status-showing';
      case MovieStatus.COMING_SOON:
        return 'status-coming';
      default:
        return 'status-offline';
    }
  }

  getStatusText(status: MovieStatus): string {
    switch (status) {
      case MovieStatus.SHOWING:
        return '热映中';
      case MovieStatus.COMING_SOON:
        return '即将上映';
      default:
        return '已下映';
    }
  }

  getStars(rating: number): boolean[] {
    const stars: boolean[] = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(true);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(true);
      } else {
        stars.push(false);
      }
    }
    return stars;
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultPoster;
  }
}

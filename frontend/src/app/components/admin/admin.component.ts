import { Component, OnInit } from '@angular/core';
import { MovieService, Movie, MovieStatus } from '../../services/movie.service';
import { ScreeningService, Screening } from '../../services/screening.service';

@Component({
  selector: 'app-admin',
  template: `
    <div class="admin-container film-enter">
      <div class="page-header">
        <h1 class="film-title">🎬 管理后台</h1>
        <p class="page-subtitle">电影和场次管理</p>
      </div>

      <div class="admin-tabs">
        <button 
          class="tab-btn" 
          [ngClass]="{'active': activeTab === 'movies'}"
          (click)="activeTab = 'movies'"
        >
          🎥 电影管理
        </button>
        <button 
          class="tab-btn" 
          [ngClass]="{'active': activeTab === 'screenings'}"
          (click)="activeTab = 'screenings'"
        >
          📅 场次管理
        </button>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'movies'">
        <div class="section-header">
          <h2 class="section-title">电影列表</h2>
          <button class="vintage-btn" (click)="showAddMovieModal = true">
            ➕ 添加电影
          </button>
        </div>

        <div *ngIf="loadingMovies" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div class="movies-table-container" *ngIf="!loadingMovies">
          <table class="vintage-table">
            <thead>
              <tr>
                <th>海报</th>
                <th>电影名称</th>
                <th>导演</th>
                <th>类型</th>
                <th>片长</th>
                <th>状态</th>
                <th>评分</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let movie of movies">
                <td>
                  <img [src]="movie.posterUrl || defaultPoster" class="movie-thumbnail">
                </td>
                <td>
                  <strong>{{ movie.title }}</strong>
                  <div class="original-title" *ngIf="movie.originalTitle">{{ movie.originalTitle }}</div>
                </td>
                <td>{{ movie.director || '-' }}</td>
                <td>{{ movie.genre || '-' }}</td>
                <td>{{ movie.duration }}分钟</td>
                <td>
                  <span class="status-badge" [ngClass]="getMovieStatusClass(movie.status)">
                    {{ getMovieStatusText(movie.status) }}
                  </span>
                </td>
                <td>{{ movie.rating || '-' }}</td>
                <td class="action-column">
                  <button class="action-btn edit" (click)="editMovie(movie)">✏️</button>
                  <button class="action-btn delete" (click)="confirmDeleteMovie(movie)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'screenings'">
        <div class="section-header">
          <h2 class="section-title">场次列表</h2>
          <button class="vintage-btn" (click)="showAddScreeningModal = true">
            ➕ 添加场次
          </button>
        </div>

        <div class="movie-selector">
          <label class="selector-label">选择电影:</label>
          <select [(ngModel)]="selectedMovieId" (change)="loadScreenings()" class="vintage-input" style="width: 300px;">
            <option value="">-- 全部电影 --</option>
            <option *ngFor="let movie of movies" [value]="movie.id">{{ movie.title }}</option>
          </select>
        </div>

        <div *ngIf="loadingScreenings" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div class="screenings-table-container" *ngIf="!loadingScreenings">
          <table class="vintage-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>放映时间</th>
                <th>结束时间</th>
                <th>票价</th>
                <th>语言</th>
                <th>版本</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let screening of screenings">
                <td>{{ screening.id }}</td>
                <td>{{ formatDateTime(screening.startTime) }}</td>
                <td>{{ formatDateTime(screening.endTime) }}</td>
                <td>¥{{ screening.price }}</td>
                <td>{{ screening.language }}</td>
                <td>{{ screening.version }}</td>
                <td>
                  <span class="status-badge" [ngClass]="screening.status === 'ACTIVE' ? 'status-paid' : 'status-cancelled'">
                    {{ screening.status === 'ACTIVE' ? '正常' : '已取消' }}
                  </span>
                </td>
                <td class="action-column">
                  <button class="action-btn cancel" *ngIf="screening.status === 'ACTIVE'" (click)="cancelScreening(screening)">
                    ⛔ 取消
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showAddMovieModal">
        <div class="modal-content vintage-card">
          <div class="modal-header">
            <h2 class="film-title">{{ editingMovie ? '编辑电影' : '添加电影' }}</h2>
            <button class="close-btn" (click)="closeMovieModal()">✕</button>
          </div>
          
          <form [formGroup]="movieForm" (ngSubmit)="saveMovie()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>电影名称 *</label>
                <input type="text" formControlName="title" class="vintage-input">
              </div>
              <div class="form-group">
                <label>原名</label>
                <input type="text" formControlName="originalTitle" class="vintage-input">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>导演</label>
                <input type="text" formControlName="director" class="vintage-input">
              </div>
              <div class="form-group">
                <label>类型</label>
                <input type="text" formControlName="genre" class="vintage-input">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>片长(分钟) *</label>
                <input type="number" formControlName="duration" class="vintage-input">
              </div>
              <div class="form-group">
                <label>上映日期</label>
                <input type="date" formControlName="releaseDate" class="vintage-input">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>状态</label>
                <select formControlName="status" class="vintage-input">
                  <option value="COMING_SOON">即将上映</option>
                  <option value="SHOWING">正在热映</option>
                  <option value="OFFLINE">已下映</option>
                </select>
              </div>
              <div class="form-group">
                <label>评分</label>
                <input type="number" step="0.1" formControlName="rating" class="vintage-input">
              </div>
            </div>
            
            <div class="form-group">
              <label>海报URL</label>
              <input type="text" formControlName="posterUrl" class="vintage-input">
            </div>
            
            <div class="form-group">
              <label>剧情简介</label>
              <textarea formControlName="description" class="vintage-input" rows="4"></textarea>
            </div>
            
            <div class="form-group">
              <label>主演</label>
              <input type="text" formControlName="actors" class="vintage-input">
            </div>
            
            <div class="modal-actions">
              <button type="button" class="vintage-btn vintage-btn-secondary" (click)="closeMovieModal()">
                取消
              </button>
              <button type="submit" class="vintage-btn" [disabled]="movieForm.invalid || saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
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

    .admin-tabs {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .tab-btn {
      background: var(--film-light-brown);
      border: 2px solid var(--film-brown);
      color: var(--film-dark-brown);
      padding: 15px 30px;
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
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
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-title {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 24px;
      color: var(--film-dark-brown);
    }

    .movie-selector {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .selector-label {
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
    }

    .vintage-table {
      width: 100%;
      border-collapse: collapse;
      background: linear-gradient(145deg, var(--film-white), var(--film-light-brown));
      border: var(--vintage-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .vintage-table thead {
      background: linear-gradient(145deg, var(--film-dark-brown), var(--film-black));
    }

    .vintage-table th {
      padding: 15px;
      text-align: left;
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-light-brown);
      font-size: 14px;
    }

    .vintage-table td {
      padding: 15px;
      border-bottom: 1px solid var(--film-brown);
      font-family: 'Noto Serif SC', serif;
      color: var(--film-dark-brown);
      font-size: 14px;
    }

    .vintage-table tr:hover td {
      background: rgba(218, 165, 32, 0.1);
    }

    .movie-thumbnail {
      width: 60px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      border: 2px solid var(--film-brown);
    }

    .original-title {
      font-size: 12px;
      color: var(--film-gray);
      font-style: italic;
    }

    .action-column {
      text-align: center;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      margin: 0 5px;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .action-btn:hover {
      background: var(--film-light-brown);
    }

    .action-btn.cancel {
      color: var(--film-red);
      font-size: 14px;
      font-weight: bold;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--film-dark-brown);
      cursor: pointer;
      padding: 5px;
    }

    .close-btn:hover {
      color: var(--film-red);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 15px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px dashed var(--film-brown);
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
      margin: 0 auto 15px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  activeTab = 'movies';
  movies: Movie[] = [];
  screenings: Screening[] = [];
  loadingMovies = true;
  loadingScreenings = true;
  defaultPoster = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20film%20poster%20placeholder%20classic%20cinema&image_size=portrait_4_3';
  
  showAddMovieModal = false;
  showAddScreeningModal = false;
  editingMovie: Movie | null = null;
  selectedMovieId: number | null = null;
  saving = false;
  
  movieForm: any;

  constructor(
    private movieService: MovieService,
    private screeningService: ScreeningService
  ) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loadingMovies = true;
    this.movieService.getAllMovies().subscribe({
      next: (response) => {
        if (response.success) {
          this.movies = response.data;
        }
        this.loadingMovies = false;
      },
      error: (error) => {
        console.error('加载电影失败:', error);
        this.loadingMovies = false;
      }
    });
  }

  loadScreenings(): void {
    this.loadingScreenings = true;
    
    const loadFn = this.selectedMovieId 
      ? this.screeningService.getScreeningsByMovie(this.selectedMovieId)
      : this.screeningService.getScreeningsByMovie(1);
    
    loadFn.subscribe({
      next: (response) => {
        if (response.success) {
          this.screenings = response.data;
        }
        this.loadingScreenings = false;
      },
      error: (error) => {
        console.error('加载场次失败:', error);
        this.loadingScreenings = false;
      }
    });
  }

  getMovieStatusClass(status: MovieStatus): string {
    switch (status) {
      case MovieStatus.SHOWING:
        return 'status-paid';
      case MovieStatus.COMING_SOON:
        return 'status-pending';
      default:
        return 'status-cancelled';
    }
  }

  getMovieStatusText(status: MovieStatus): string {
    switch (status) {
      case MovieStatus.SHOWING:
        return '热映中';
      case MovieStatus.COMING_SOON:
        return '即将上映';
      default:
        return '已下映';
    }
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editMovie(movie: Movie): void {
    this.editingMovie = movie;
    this.showAddMovieModal = true;
  }

  closeMovieModal(): void {
    this.showAddMovieModal = false;
    this.editingMovie = null;
  }

  confirmDeleteMovie(movie: Movie): void {
    if (confirm(`确定要删除电影 "${movie.title}" 吗？`)) {
      // 调用删除API
      alert('删除功能待实现');
    }
  }

  cancelScreening(screening: Screening): void {
    if (confirm('确定要取消这个场次吗？')) {
      // 调用取消场次API
      alert('取消功能待实现');
    }
  }

  saveMovie(): void {
    alert('保存功能待实现');
    this.closeMovieModal();
  }
}

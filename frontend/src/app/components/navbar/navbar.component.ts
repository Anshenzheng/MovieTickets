import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="film-navbar">
      <div class="nav-container">
        <div class="nav-brand" routerLink="/home">
          <span class="brand-icon">🎞️</span>
          <span class="brand-text">复古胶片影院</span>
        </div>
        
        <div class="nav-links" *ngIf="currentUser$ | async as user">
          <a routerLink="/home" routerLinkActive="active">首页</a>
          <a routerLink="/movies" routerLinkActive="active">电影</a>
          <a routerLink="/orders" routerLinkActive="active" *ngIf="user">我的订单</a>
          <a routerLink="/admin" routerLinkActive="active" *ngIf="user?.role === 'ADMIN'">管理后台</a>
        </div>
        
        <div class="nav-auth">
          <ng-container *ngIf="currentUser$ | async as user; else notLoggedIn">
            <span class="user-info">
              <span class="user-icon">👤</span>
              <span class="username">{{ user.username }}</span>
              <span class="role-badge" [ngClass]="user.role === 'ADMIN' ? 'admin' : 'user'">
                {{ user.role === 'ADMIN' ? '管理员' : '用户' }}
              </span>
            </span>
            <button class="vintage-btn vintage-btn-secondary" (click)="logout()" style="padding: 8px 16px; font-size: 14px;">
              退出登录
            </button>
          </ng-container>
          <ng-template #notLoggedIn>
            <a routerLink="/login" class="nav-link">登录</a>
            <a routerLink="/register" class="vintage-btn" style="padding: 8px 16px; font-size: 14px;">注册</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
    }
    
    .brand-icon {
      font-size: 32px;
    }
    
    .brand-text {
      font-family: 'Playfair Display', 'Noto Serif SC', serif;
      font-size: 24px;
      font-weight: bold;
      color: var(--film-gold);
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .nav-links {
      display: flex;
      gap: 30px;
    }
    
    .nav-links a {
      color: var(--film-light-brown);
      text-decoration: none;
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      font-weight: bold;
      padding: 10px 0;
      position: relative;
      transition: color 0.3s ease;
    }
    
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--film-gold);
      transition: width 0.3s ease;
    }
    
    .nav-links a:hover,
    .nav-links a.active {
      color: var(--film-gold);
    }
    
    .nav-links a:hover::after,
    .nav-links a.active::after {
      width: 100%;
    }
    
    .nav-auth {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .nav-link {
      color: var(--film-light-brown);
      text-decoration: none;
      font-family: 'Noto Serif SC', serif;
      font-size: 16px;
      font-weight: bold;
      transition: color 0.3s ease;
    }
    
    .nav-link:hover {
      color: var(--film-gold);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--film-light-brown);
      font-family: 'Noto Serif SC', serif;
    }
    
    .user-icon {
      font-size: 20px;
    }
    
    .username {
      font-weight: bold;
    }
    
    .role-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .role-badge.admin {
      background: var(--film-gold);
      color: var(--film-dark-brown);
    }
    
    .role-badge.user {
      background: var(--film-brown);
      color: var(--film-white);
    }
    
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .brand-text {
        font-size: 18px;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container film-enter">
      <div class="vintage-card login-card">
        <h2 class="film-title">登录复古胶片影院</h2>
        <div class="vintage-divider"></div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">👤</span>
              用户名
            </label>
            <input 
              type="text" 
              formControlName="username" 
              class="vintage-input"
              placeholder="请输入用户名"
              [ngClass]="{'input-error': submitted && f['username'].errors}"
            >
            <div *ngIf="submitted && f['username'].errors" class="error-message">
              <span *ngIf="f['username'].errors['required']">请输入用户名</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔒</span>
              密码
            </label>
            <input 
              type="password" 
              formControlName="password" 
              class="vintage-input"
              placeholder="请输入密码"
              [ngClass]="{'input-error': submitted && f['password'].errors}"
            >
            <div *ngIf="submitted && f['password'].errors" class="error-message">
              <span *ngIf="f['password'].errors['required']">请输入密码</span>
            </div>
          </div>
          
          <div *ngIf="errorMessage" class="error-alert">
            ⚠️ {{ errorMessage }}
          </div>
          
          <div class="form-actions">
            <button type="submit" class="vintage-btn" [disabled]="loading">
              <span *ngIf="!loading">🎟️ 登录</span>
              <span *ngIf="loading">登录中...</span>
            </button>
          </div>
          
          <div class="form-footer">
            <p>还没有账号？<a routerLink="/register">立即注册</a></p>
          </div>
        </form>
      </div>
      
      <div class="login-decor">
        <div class="film-strip">
          <div class="film-perforations" *ngFor="let i of [1,2,3,4,5]">
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 500px;
      margin: 40px auto;
      position: relative;
    }
    
    .login-card {
      position: relative;
      z-index: 2;
    }
    
    .film-title {
      text-align: center;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .login-form {
      margin-top: 20px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 8px;
      font-family: 'Noto Serif SC', serif;
      font-weight: bold;
      color: var(--film-dark-brown);
      font-size: 16px;
    }
    
    .label-icon {
      margin-right: 8px;
    }
    
    .input-error {
      border-color: var(--film-red) !important;
    }
    
    .error-message {
      color: var(--film-red);
      font-size: 14px;
      margin-top: 5px;
      font-family: 'Noto Serif SC', serif;
    }
    
    .error-alert {
      background: linear-gradient(145deg, rgba(139, 0, 0, 0.1), rgba(92, 0, 0, 0.1));
      border: 2px solid var(--film-red);
      border-radius: 4px;
      padding: 12px 16px;
      color: var(--film-dark-red);
      font-family: 'Noto Serif SC', serif;
      margin-bottom: 20px;
    }
    
    .form-actions {
      text-align: center;
      margin-top: 30px;
    }
    
    .form-footer {
      text-align: center;
      margin-top: 25px;
      font-family: 'Noto Serif SC', serif;
      color: var(--film-gray);
    }
    
    .form-footer a {
      color: var(--film-dark-gold);
      text-decoration: none;
      font-weight: bold;
      margin-left: 5px;
    }
    
    .form-footer a:hover {
      color: var(--film-gold);
      text-decoration: underline;
    }
    
    .login-decor {
      position: absolute;
      right: -60px;
      top: 50%;
      transform: translateY(-50%) rotate(90deg);
      z-index: 1;
      opacity: 0.3;
    }
    
    .film-strip {
      background: var(--film-dark-brown);
      padding: 10px 5px;
    }
    
    @media (max-width: 768px) {
      .login-container {
        margin: 20px;
      }
      
      .login-decor {
        display: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f['username'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate([this.returnUrl]);
          } else {
            this.errorMessage = response.message || '登录失败';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || '用户名或密码错误';
          this.loading = false;
        }
      });
  }
}

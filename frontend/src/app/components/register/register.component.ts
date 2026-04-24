import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container film-enter">
      <div class="vintage-card register-card">
        <h2 class="film-title">加入复古胶片影院</h2>
        <div class="vintage-divider"></div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">👤</span>
                用户名 <span class="required">*</span>
              </label>
              <input 
                type="text" 
                formControlName="username" 
                class="vintage-input"
                placeholder="请输入用户名（3-50字符）"
                [ngClass]="{'input-error': submitted && f['username'].errors}"
              >
              <div *ngIf="submitted && f['username'].errors" class="error-message">
                <span *ngIf="f['username'].errors['required']">请输入用户名</span>
                <span *ngIf="f['username'].errors['minlength']">用户名至少3个字符</span>
                <span *ngIf="f['username'].errors['maxlength']">用户名最多50个字符</span>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📧</span>
                邮箱 <span class="required">*</span>
              </label>
              <input 
                type="email" 
                formControlName="email" 
                class="vintage-input"
                placeholder="请输入邮箱地址"
                [ngClass]="{'input-error': submitted && f['email'].errors}"
              >
              <div *ngIf="submitted && f['email'].errors" class="error-message">
                <span *ngIf="f['email'].errors['required']">请输入邮箱</span>
                <span *ngIf="f['email'].errors['email']">请输入有效的邮箱地址</span>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔒</span>
                密码 <span class="required">*</span>
              </label>
              <input 
                type="password" 
                formControlName="password" 
                class="vintage-input"
                placeholder="请输入密码（6-100字符）"
                [ngClass]="{'input-error': submitted && f['password'].errors}"
              >
              <div *ngIf="submitted && f['password'].errors" class="error-message">
                <span *ngIf="f['password'].errors['required']">请输入密码</span>
                <span *ngIf="f['password'].errors['minlength']">密码至少6个字符</span>
                <span *ngIf="f['password'].errors['maxlength']">密码最多100个字符</span>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔐</span>
                确认密码 <span class="required">*</span>
              </label>
              <input 
                type="password" 
                formControlName="confirmPassword" 
                class="vintage-input"
                placeholder="请再次输入密码"
                [ngClass]="{'input-error': submitted && (f['confirmPassword'].errors || registerForm.errors?.['passwordMismatch'])}"
              >
              <div *ngIf="submitted && (f['confirmPassword'].errors || registerForm.errors?.['passwordMismatch'])" class="error-message">
                <span *ngIf="f['confirmPassword'].errors?.['required']">请确认密码</span>
                <span *ngIf="registerForm.errors?.['passwordMismatch']">两次密码输入不一致</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📱</span>
              手机号
            </label>
            <input 
              type="tel" 
              formControlName="phone" 
              class="vintage-input"
              placeholder="请输入手机号（选填）"
              [ngClass]="{'input-error': submitted && f['phone'].errors}"
            >
            <div *ngIf="submitted && f['phone'].errors" class="error-message">
              <span *ngIf="f['phone'].errors?.['pattern']">请输入有效的手机号</span>
            </div>
          </div>
          
          <div *ngIf="errorMessage" class="error-alert">
            ⚠️ {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-alert">
            ✅ {{ successMessage }}
          </div>
          
          <div class="form-actions">
            <button type="submit" class="vintage-btn" [disabled]="loading">
              <span *ngIf="!loading">🎟️ 注册</span>
              <span *ngIf="loading">注册中...</span>
            </button>
          </div>
          
          <div class="form-footer">
            <p>已有账号？<a routerLink="/login">立即登录</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 700px;
      margin: 40px auto;
    }
    
    .film-title {
      text-align: center;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .register-form {
      margin-top: 20px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
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
    
    .required {
      color: var(--film-red);
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
    
    .success-alert {
      background: linear-gradient(145deg, rgba(50, 205, 50, 0.1), rgba(34, 139, 34, 0.1));
      border: 2px solid #228B22;
      border-radius: 4px;
      padding: 12px 16px;
      color: #228B22;
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
    
    @media (max-width: 768px) {
      .register-container {
        margin: 20px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.pattern(/^1[3-9]\d{9}$/)]]
    }, {
      validators: matchValidator('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    
    const registerData = {
      username: this.f['username'].value,
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value,
      email: this.f['email'].value,
      phone: this.f['phone'].value || undefined
    };

    this.authService.register(registerData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = '注册成功！即将跳转到登录页面...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || '注册失败';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || '注册失败，请稍后重试';
          this.loading = false;
        }
      });
  }
}

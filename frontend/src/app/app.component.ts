import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="film-footer">
      <div class="footer-content">
        <div class="film-perforations">
          <span *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]"></span>
        </div>
        <p>© 2026 复古胶片影院 | 梦回胶片黄金时代</p>
        <p class="footer-subtitle">每一张电影票，都是一段时光的记忆</p>
      </div>
    </footer>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 200px);
      padding: 20px;
    }
    
    .film-footer {
      background: linear-gradient(180deg, var(--film-dark-brown), var(--film-black));
      color: var(--film-light-brown);
      padding: 30px 20px;
      text-align: center;
      border-top: 4px solid var(--film-gold);
      position: relative;
    }
    
    .film-footer::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 0;
      right: 0;
      height: 4px;
      background: repeating-linear-gradient(
        90deg,
        var(--film-gold) 0px,
        var(--film-gold) 10px,
        var(--film-dark-brown) 10px,
        var(--film-dark-brown) 20px
      );
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .footer-content p {
      margin: 10px 0;
      font-family: 'Noto Serif SC', serif;
    }
    
    .footer-subtitle {
      font-size: 14px;
      color: var(--film-light-gray);
      font-style: italic;
    }
    
    .film-perforations span {
      margin: 0 2px;
    }
  `]
})
export class AppComponent {
  title = 'movie-tickets-frontend';
}

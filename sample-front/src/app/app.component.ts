import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/heroes" class="nav-brand">🦸 Heroes & Powers</a>
      <div class="nav-links">
        <a routerLink="/heroes" class="nav-link">Heroes</a>
        <a routerLink="/powers/new" class="nav-link">+ Power</a>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}

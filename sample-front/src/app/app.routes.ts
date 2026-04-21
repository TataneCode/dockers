import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/heroes', pathMatch: 'full' },
  {
    path: 'heroes',
    loadComponent: () => import('./features/heroes/heroes.component').then(m => m.HeroesComponent),
  },
  {
    path: 'heroes/new',
    loadComponent: () => import('./features/hero-form/hero-form.component').then(m => m.HeroFormComponent),
  },
  {
    path: 'heroes/:id/edit',
    loadComponent: () => import('./features/hero-form/hero-form.component').then(m => m.HeroFormComponent),
  },
  {
    path: 'heroes/:id',
    loadComponent: () => import('./features/hero-detail/hero-detail.component').then(m => m.HeroDetailComponent),
  },
  {
    path: 'powers/new',
    loadComponent: () => import('./features/power-form/power-form.component').then(m => m.PowerFormComponent),
  },
  {
    path: 'powers/:id/edit',
    loadComponent: () => import('./features/power-form/power-form.component').then(m => m.PowerFormComponent),
  },
];

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
    path: 'seed',
    loadComponent: () => import('./features/seed/seed.component').then(m => m.SeedComponent),
  },
  {
    path: 'benchmark',
    loadComponent: () =>
      import('./features/benchmark/benchmark.component').then(m => m.BenchmarkComponent),
  },
  {
    path: 'benchmark/seed',
    loadComponent: () =>
      import('./features/seed-benchmark/seed-benchmark.component').then(
        m => m.SeedBenchmarkComponent,
      ),
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

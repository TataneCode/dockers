import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { switchMap, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Hero, HeroRequest } from '../core/models/hero.model';
import { HeroApiService } from '../core/api/hero-api.service';

interface HeroState {
  heroes: Hero[];
  selectedHero: Hero | null;
  loading: boolean;
}

const initialState: HeroState = {
  heroes: [],
  selectedHero: null,
  loading: false,
};

export const HeroStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(HeroApiService)) => ({
    loadAll: rxMethod<void>(
      switchMap(() => {
        patchState(store, { loading: true });
        return api.getAll().pipe(
          tap(heroes => patchState(store, { heroes, loading: false }))
        );
      })
    ),

    loadOne: rxMethod<string>(
      switchMap(id => {
        patchState(store, { loading: true });
        return api.getById(id).pipe(
          tap(selectedHero => patchState(store, { selectedHero, loading: false }))
        );
      })
    ),

    clearSelected() {
      patchState(store, { selectedHero: null });
    },

    async create(request: HeroRequest): Promise<Hero> {
      const hero = await firstValueFrom(api.create(request));
      patchState(store, { heroes: [...store.heroes(), hero] });
      return hero;
    },

    async update(id: string, request: HeroRequest): Promise<void> {
      const updated = await firstValueFrom(api.update(id, request));
      patchState(store, {
        heroes: store.heroes().map(h => h.id === id ? updated : h),
        selectedHero: store.selectedHero()?.id === id ? updated : store.selectedHero(),
      });
    },

    async remove(id: string): Promise<void> {
      await firstValueFrom(api.delete(id));
      patchState(store, {
        heroes: store.heroes().filter(h => h.id !== id),
        selectedHero: store.selectedHero()?.id === id ? null : store.selectedHero(),
      });
    },
  }))
);

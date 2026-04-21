import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { switchMap, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Power, PowerRequest } from '../core/models/power.model';
import { PowerApiService } from '../core/api/power-api.service';

interface PowerState {
  powers: Power[];
  selectedPower: Power | null;
  loading: boolean;
}

const initialState: PowerState = {
  powers: [],
  selectedPower: null,
  loading: false,
};

export const PowerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(PowerApiService)) => ({
    loadAll: rxMethod<void>(
      switchMap(() => {
        patchState(store, { loading: true });
        return api.getAll().pipe(
          tap(powers => patchState(store, { powers, loading: false }))
        );
      })
    ),

    loadOne: rxMethod<string>(
      switchMap(id => {
        patchState(store, { loading: true });
        return api.getById(id).pipe(
          tap(selectedPower => patchState(store, { selectedPower, loading: false }))
        );
      })
    ),

    clearSelected() {
      patchState(store, { selectedPower: null });
    },

    async create(request: PowerRequest): Promise<Power> {
      const power = await firstValueFrom(api.create(request));
      patchState(store, { powers: [...store.powers(), power] });
      return power;
    },

    async update(id: string, request: PowerRequest): Promise<void> {
      const updated = await firstValueFrom(api.update(id, request));
      patchState(store, {
        powers: store.powers().map(p => p.id === id ? updated : p),
        selectedPower: store.selectedPower()?.id === id ? updated : store.selectedPower(),
      });
    },

    async remove(id: string): Promise<void> {
      await firstValueFrom(api.delete(id));
      patchState(store, {
        powers: store.powers().filter(p => p.id !== id),
        selectedPower: store.selectedPower()?.id === id ? null : store.selectedPower(),
      });
    },
  }))
);

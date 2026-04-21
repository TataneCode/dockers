import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeroStore } from '../../stores/hero.store';
import { PowerStore } from '../../stores/power.store';

@Component({
  selector: 'app-hero-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <h1>{{ isEdit ? 'Edit Hero' : 'New Hero' }}</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <div class="form-group">
          <label for="name">Real Name</label>
          <input id="name" formControlName="name" class="form-control" />
        </div>

        <div class="form-group">
          <label for="alias">Hero Alias</label>
          <input id="alias" formControlName="alias" class="form-control" />
        </div>

        <div class="form-group">
          <label for="origin">Origin</label>
          <input id="origin" formControlName="origin" class="form-control" />
        </div>

        <div class="form-group">
          <label>Powers</label>
          @for (power of powerStore.powers(); track power.id) {
            <label class="checkbox-label">
              <input type="checkbox" [value]="power.id"
                [checked]="isPowerSelected(power.id)"
                (change)="togglePower(power.id, $event)" />
              {{ power.name }} ({{ power.type }})
            </label>
          }
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
            {{ isEdit ? 'Save Changes' : 'Create Hero' }}
          </button>
          <a routerLink="/heroes" class="btn">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class HeroFormComponent implements OnInit, OnDestroy {
  readonly store = inject(HeroStore);
  readonly powerStore = inject(PowerStore);
  private readonly router = inject(Router);
  private readonly heroId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  readonly isEdit = !!this.heroId;

  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    alias: ['', Validators.required],
    origin: ['', Validators.required],
    powerIds: [[] as string[]],
  });

  constructor() {
    effect(() => {
      const hero = this.store.selectedHero();
      if (hero) {
        this.form.patchValue({
          name: hero.name,
          alias: hero.alias,
          origin: hero.origin,
          powerIds: [...hero.powerIds],
        });
      }
    });
  }

  ngOnInit() {
    this.powerStore.loadAll();
    if (this.heroId) {
      this.store.loadOne(this.heroId);
    }
  }

  ngOnDestroy() {
    this.store.clearSelected();
  }

  isPowerSelected(id: string): boolean {
    return this.form.getRawValue().powerIds.includes(id);
  }

  togglePower(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.getRawValue().powerIds;
    this.form.patchValue({
      powerIds: checked ? [...current, id] : current.filter(p => p !== id),
    });
  }

  async submit() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    if (this.heroId) {
      await this.store.update(this.heroId, value);
      this.router.navigate(['/heroes', this.heroId]);
    } else {
      const hero = await this.store.create(value);
      this.router.navigate(['/heroes', hero.id]);
    }
  }
}

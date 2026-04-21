import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PowerStore } from '../../stores/power.store';

@Component({
  selector: 'app-power-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <h1>{{ isEdit ? 'Edit Power' : 'New Power' }}</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" formControlName="name" class="form-control" />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" class="form-control" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label for="type">Type</label>
          <select id="type" formControlName="type" class="form-control">
            <option value="Physical">Physical</option>
            <option value="Mental">Mental</option>
            <option value="Elemental">Elemental</option>
            <option value="Tech">Tech</option>
          </select>
        </div>

        <div class="form-group">
          <label for="level">Level (1–10)</label>
          <input id="level" type="number" formControlName="level" class="form-control" min="1" max="10" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
            {{ isEdit ? 'Save Changes' : 'Create Power' }}
          </button>
          <a routerLink="/heroes" class="btn">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class PowerFormComponent implements OnInit, OnDestroy {
  readonly store = inject(PowerStore);
  private readonly router = inject(Router);
  private readonly powerId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  readonly isEdit = !!this.powerId;

  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    type: ['Physical' as 'Physical' | 'Mental' | 'Elemental' | 'Tech', Validators.required],
    level: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  constructor() {
    effect(() => {
      const power = this.store.selectedPower();
      if (power) {
        this.form.patchValue({
          name: power.name,
          description: power.description,
          type: power.type,
          level: power.level,
        });
      }
    });
  }

  ngOnInit() {
    if (this.powerId) {
      this.store.loadOne(this.powerId);
    }
  }

  ngOnDestroy() {
    this.store.clearSelected();
  }

  async submit() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    if (this.powerId) {
      await this.store.update(this.powerId, value);
    } else {
      await this.store.create(value);
    }
    this.router.navigate(['/heroes']);
  }
}

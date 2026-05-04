import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PowerStore } from '../../stores/power.store';

@Component({
  selector: 'app-power-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './power-form.component.html',
  styleUrl: './power-form.component.scss',
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

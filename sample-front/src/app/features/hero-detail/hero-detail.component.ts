import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeroStore } from '../../stores/hero.store';
import { PowerStore } from '../../stores/power.store';

@Component({
  selector: 'app-hero-detail',
  imports: [RouterLink],
  templateUrl: './hero-detail.component.html',
  styleUrl: './hero-detail.component.scss',
})
export class HeroDetailComponent implements OnInit, OnDestroy {
  readonly store = inject(HeroStore);
  readonly powerStore = inject(PowerStore);
  private readonly heroId = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  ngOnInit() {
    this.store.loadOne(this.heroId);
    this.powerStore.loadAll();
  }

  ngOnDestroy() {
    this.store.clearSelected();
  }

  getPower(id: string) {
    return this.powerStore.powers().find(p => p.id === id);
  }
}

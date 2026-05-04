import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroStore } from '../../stores/hero.store';

@Component({
  selector: 'app-heroes',
  imports: [RouterLink],
  templateUrl: './heroes.component.html',
  styleUrl: './heroes.component.scss',
})
export class HeroesComponent implements OnInit {
  readonly store = inject(HeroStore);

  ngOnInit() {
    this.store.loadAll();
  }

  async delete(id: string) {
    if (confirm('Delete this hero?')) {
      await this.store.remove(id);
    }
  }
}

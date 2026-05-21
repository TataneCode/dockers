import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Hero } from '../../core/models/hero.model';
import { HeroStore } from '../../stores/hero.store';
import { HeroesComponent } from './heroes.component';

describe('HeroesComponent', () => {
  const heroes = signal<Hero[]>([]);
  const loading = signal(false);
  const store = {
    heroes,
    loading,
    loadAll: vi.fn(),
    remove: vi.fn<() => Promise<void>>(),
  };

  beforeEach(async () => {
    heroes.set([]);
    loading.set(false);
    store.loadAll.mockReset();
    store.remove.mockReset().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [HeroesComponent],
      providers: [
        provideRouter([]),
        { provide: HeroStore, useValue: store },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads heroes on init', () => {
    const fixture = TestBed.createComponent(HeroesComponent);
    fixture.detectChanges();

    expect(store.loadAll).toHaveBeenCalledOnce();
  });

  it('renders the empty state when there are no heroes', () => {
    const fixture = TestBed.createComponent(HeroesComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No heroes yet.');
  });

  it('renders the hero list', () => {
    heroes.set([
      { id: 'hero-1', name: 'Clark Kent', alias: 'Superman', origin: 'Krypton', powerIds: [] },
      { id: 'hero-2', name: 'Diana Prince', alias: 'Wonder Woman', origin: 'Themyscira', powerIds: [] },
    ]);

    const fixture = TestBed.createComponent(HeroesComponent);
    fixture.detectChanges();

    const aliases = Array.from(
      fixture.nativeElement.querySelectorAll('.card strong')
    ).map((element: Element) => element.textContent?.trim());

    expect(aliases).toEqual(['Superman', 'Wonder Woman']);
  });

  it('deletes a hero after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(HeroesComponent);
    const component = fixture.componentInstance;

    await component.delete('hero-1');

    expect(confirmSpy).toHaveBeenCalledWith('Delete this hero?');
    expect(store.remove).toHaveBeenCalledWith('hero-1');
  });

  it('does not delete a hero when confirmation is cancelled', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(HeroesComponent);
    const component = fixture.componentInstance;

    await component.delete('hero-1');

    expect(confirmSpy).toHaveBeenCalledWith('Delete this hero?');
    expect(store.remove).not.toHaveBeenCalled();
  });
});

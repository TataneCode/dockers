import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Hero } from '../../core/models/hero.model';
import { Power } from '../../core/models/power.model';
import { HeroStore } from '../../stores/hero.store';
import { PowerStore } from '../../stores/power.store';
import { HeroDetailComponent } from './hero-detail.component';

describe('HeroDetailComponent', () => {
  async function setup(options?: {
    hero?: Hero | null;
    powers?: Power[];
    loading?: boolean;
  }) {
    const selectedHero = signal<Hero | null>(options?.hero ?? null);
    const loading = signal(options?.loading ?? false);
    const powers = signal<Power[]>(options?.powers ?? []);
    const heroStore = {
      selectedHero,
      loading,
      loadOne: vi.fn(),
      clearSelected: vi.fn(),
    };
    const powerStore = {
      powers,
      loadAll: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeroDetailComponent],
      providers: [
        provideRouter([]),
        { provide: HeroStore, useValue: heroStore },
        { provide: PowerStore, useValue: powerStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'hero-1' }),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeroDetailComponent);
    fixture.detectChanges();

    return { fixture, component: fixture.componentInstance, heroStore, powerStore };
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('loads the hero and powers on init', async () => {
    const { heroStore, powerStore } = await setup();

    expect(heroStore.loadOne).toHaveBeenCalledWith('hero-1');
    expect(powerStore.loadAll).toHaveBeenCalledOnce();
  });

  it('renders the hero details with matching powers', async () => {
    const { fixture } = await setup({
      hero: {
        id: 'hero-1',
        name: 'Clark Kent',
        alias: 'Superman',
        origin: 'Krypton',
        powerIds: ['power-1'],
      },
      powers: [
        { id: 'power-1', name: 'Flight', description: 'Fly', type: 'Physical', level: 8 },
      ],
    });

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Superman');
    expect(text).toContain('Clark Kent');
    expect(text).toContain('Flight');
    expect(text).toContain('Level 8');
  });

  it('clears the selected hero on destroy', async () => {
    const { fixture, heroStore } = await setup();

    fixture.destroy();

    expect(heroStore.clearSelected).toHaveBeenCalledOnce();
  });
});

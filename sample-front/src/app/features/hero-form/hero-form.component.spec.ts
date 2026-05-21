import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Hero, HeroRequest } from '../../core/models/hero.model';
import { Power } from '../../core/models/power.model';
import { HeroStore } from '../../stores/hero.store';
import { PowerStore } from '../../stores/power.store';
import { HeroFormComponent } from './hero-form.component';

describe('HeroFormComponent', () => {
  const allPowers: Power[] = [
    { id: 'power-1', name: 'Flight', description: 'Fly', type: 'Physical', level: 8 },
    { id: 'power-2', name: 'Shield', description: 'Blocks attacks', type: 'Tech', level: 6 },
  ];

  async function setup(options?: {
    heroId?: string;
    selectedHero?: Hero | null;
  }) {
    const selectedHero = signal<Hero | null>(options?.selectedHero ?? null);
    const powers = signal<Power[]>(allPowers);
    const heroStore = {
      selectedHero,
      loadOne: vi.fn(),
      clearSelected: vi.fn(),
      create: vi.fn<(request: HeroRequest) => Promise<Hero>>(),
      update: vi.fn<(id: string, request: HeroRequest) => Promise<void>>(),
    };
    const powerStore = {
      powers,
      loadAll: vi.fn(),
    };

    heroStore.create.mockResolvedValue({
      id: 'hero-99',
      name: 'Bruce Wayne',
      alias: 'Batman',
      origin: 'Gotham',
      powerIds: ['power-2'],
    });
    heroStore.update.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        provideRouter([]),
        { provide: HeroStore, useValue: heroStore },
        { provide: PowerStore, useValue: powerStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(options?.heroId ? { id: options.heroId } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(HeroFormComponent);
    fixture.detectChanges();

    return { fixture, component: fixture.componentInstance, heroStore, powerStore, navigateSpy };
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('loads powers on init and fetches the hero in edit mode', async () => {
    const { heroStore, powerStore } = await setup({ heroId: 'hero-1' });

    expect(powerStore.loadAll).toHaveBeenCalledOnce();
    expect(heroStore.loadOne).toHaveBeenCalledWith('hero-1');
  });

  it('prefills the form from the selected hero', async () => {
    const { component } = await setup({
      heroId: 'hero-1',
      selectedHero: {
        id: 'hero-1',
        name: 'Clark Kent',
        alias: 'Superman',
        origin: 'Krypton',
        powerIds: ['power-1'],
      },
    });

    expect(component.form.getRawValue()).toEqual({
      name: 'Clark Kent',
      alias: 'Superman',
      origin: 'Krypton',
      powerIds: ['power-1'],
    });
  });

  it('toggles powers in the form state', async () => {
    const { component } = await setup();

    component.togglePower('power-1', { target: { checked: true } } as unknown as Event);
    component.togglePower('power-2', { target: { checked: true } } as unknown as Event);
    component.togglePower('power-1', { target: { checked: false } } as unknown as Event);

    expect(component.form.getRawValue().powerIds).toEqual(['power-2']);
  });

  it('creates a hero and navigates to its detail page', async () => {
    const { component, heroStore, navigateSpy } = await setup();

    component.form.setValue({
      name: 'Bruce Wayne',
      alias: 'Batman',
      origin: 'Gotham',
      powerIds: ['power-2'],
    });

    await component.submit();

    expect(heroStore.create).toHaveBeenCalledWith({
      name: 'Bruce Wayne',
      alias: 'Batman',
      origin: 'Gotham',
      powerIds: ['power-2'],
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/heroes', 'hero-99']);
  });

  it('updates a hero and navigates back to its detail page', async () => {
    const { component, heroStore, navigateSpy } = await setup({ heroId: 'hero-7' });

    component.form.setValue({
      name: 'Diana Prince',
      alias: 'Wonder Woman',
      origin: 'Themyscira',
      powerIds: ['power-1', 'power-2'],
    });

    await component.submit();

    expect(heroStore.update).toHaveBeenCalledWith('hero-7', {
      name: 'Diana Prince',
      alias: 'Wonder Woman',
      origin: 'Themyscira',
      powerIds: ['power-1', 'power-2'],
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/heroes', 'hero-7']);
  });
});

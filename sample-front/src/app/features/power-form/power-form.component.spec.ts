import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Power, PowerRequest } from '../../core/models/power.model';
import { PowerStore } from '../../stores/power.store';
import { PowerFormComponent } from './power-form.component';

describe('PowerFormComponent', () => {
  async function setup(options?: {
    powerId?: string;
    selectedPower?: Power | null;
  }) {
    const selectedPower = signal<Power | null>(options?.selectedPower ?? null);
    const store = {
      selectedPower,
      loadOne: vi.fn(),
      clearSelected: vi.fn(),
      create: vi.fn<(request: PowerRequest) => Promise<Power>>(),
      update: vi.fn<(id: string, request: PowerRequest) => Promise<void>>(),
    };

    store.create.mockResolvedValue({
      id: 'power-99',
      name: 'Invisibility',
      description: 'Disappear from sight',
      type: 'Mental',
      level: 7,
    });
    store.update.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [PowerFormComponent],
      providers: [
        provideRouter([]),
        { provide: PowerStore, useValue: store },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(options?.powerId ? { id: options.powerId } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(PowerFormComponent);
    fixture.detectChanges();

    return { fixture, component: fixture.componentInstance, store, navigateSpy };
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('loads the selected power in edit mode', async () => {
    const { component, store } = await setup({
      powerId: 'power-1',
      selectedPower: {
        id: 'power-1',
        name: 'Flight',
        description: 'Fly',
        type: 'Physical',
        level: 8,
      },
    });

    expect(store.loadOne).toHaveBeenCalledWith('power-1');
    expect(component.form.getRawValue()).toEqual({
      name: 'Flight',
      description: 'Fly',
      type: 'Physical',
      level: 8,
    });
  });

  it('creates a power and navigates back to the heroes page', async () => {
    const { component, store, navigateSpy } = await setup();

    component.form.setValue({
      name: 'Invisibility',
      description: 'Disappear from sight',
      type: 'Mental',
      level: 7,
    });

    await component.submit();

    expect(store.create).toHaveBeenCalledWith({
      name: 'Invisibility',
      description: 'Disappear from sight',
      type: 'Mental',
      level: 7,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
  });

  it('updates a power and navigates back to the heroes page', async () => {
    const { component, store, navigateSpy } = await setup({ powerId: 'power-7' });

    component.form.setValue({
      name: 'Shield',
      description: 'Blocks attacks',
      type: 'Tech',
      level: 6,
    });

    await component.submit();

    expect(store.update).toHaveBeenCalledWith('power-7', {
      name: 'Shield',
      description: 'Blocks attacks',
      type: 'Tech',
      level: 6,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
  });
});

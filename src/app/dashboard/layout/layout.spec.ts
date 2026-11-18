import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Layout } from './layout';

describe('Layout', () => {
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: Layout }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
  });

  it('muestra el riel con los enlaces de navegación', () => {
    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(element.querySelectorAll('.app-rail__nav a')).map(
      (a) => a.textContent?.trim(),
    );

    expect(links).toEqual(['Inicio', 'Usuarios', 'Roles y permisos']);
  });

  it('marca el riel con el nombre de la app', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.app-rail__brand')?.textContent).toContain(
      'Artifex',
    );
  });

  it('agrupa Usuarios y Roles y permisos en un acordeón, cerrado por defecto', () => {
    const element = fixture.nativeElement as HTMLElement;
    const header = element.querySelector('.app-rail__group mat-panel-title');

    expect(header?.textContent?.trim()).toBe('Usuarios del sistema');
    expect(
      element
        .querySelector('.app-rail__group')
        ?.classList.contains('mat-expanded'),
    ).toBe(false);
  });

  it('abre el grupo del menú cuando la ruta activa es uno de sus enlaces', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/dashboard/usuarios');
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(
      element
        .querySelector('.app-rail__group')
        ?.classList.contains('mat-expanded'),
    ).toBe(true);
  });
});

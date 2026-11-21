import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Categoria } from '@inventario/interfaces';
import { apiUrl } from '@shared';
import { Categorias } from './categorias';
import { describeTableScreen } from '@shared/testing/table-screen.testing.spec';

describe('Categorias', () => {
  let fixture: ComponentFixture<Categorias>;
  let http: HttpTestingController;

  const categorias: Categoria[] = [
    { id: 1, name: 'Productos Varios', is_active: true },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Categorias],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Categorias);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de categorías y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/lista-categorias')).flush(categorias);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Productos Varios');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/lista-categorias'))
      .flush(
        { message: 'Su IP no está autorizada.' },
        { status: 403, statusText: '' },
      );
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Su IP no está autorizada.');
  });
});

describeTableScreen('Categorias', Categorias, 'Nueva categoría');

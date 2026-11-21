import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Unidad } from '@inventario/interfaces';
import { apiUrl } from '@shared';
import { Unidades } from './unidades';
import { describeTableScreen } from '@shared/testing/table-screen.testing.spec';

describe('Unidades', () => {
  let fixture: ComponentFixture<Unidades>;
  let http: HttpTestingController;

  const unidades: Unidad[] = [
    { id: 1, name: 'Año Luz', code: '5520', is_active: true },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Unidades],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Unidades);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de unidades y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/lista-unidades')).flush(unidades);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Año Luz');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/lista-unidades'))
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

describeTableScreen('Unidades', Unidades, 'Nueva unidad');

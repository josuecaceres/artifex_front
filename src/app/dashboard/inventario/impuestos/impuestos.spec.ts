import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Impuesto } from '@inventario/interfaces';
import { apiUrl } from '@shared';
import { Impuestos } from './impuestos';
import { describeTableScreen } from '@shared/testing/table-screen.testing.spec';

describe('Impuestos', () => {
  let fixture: ComponentFixture<Impuestos>;
  let http: HttpTestingController;

  const impuestos: Impuesto[] = [
    {
      id: 1,
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: '13.0000',
      is_percentage: true,
      is_active: true,
    },
    {
      id: 2,
      name: 'Contribución por galón',
      code: 'D1',
      rate: '0.2000',
      is_percentage: false,
      is_active: true,
    },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Impuestos],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Impuestos);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de impuestos y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/lista-impuestos')).flush(impuestos);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Impuesto sobre ventas');
    // La tasa llega como texto con cuatro decimales y se muestra como número.
    expect(element.textContent).toContain('13%');
    expect(element.textContent).not.toContain('13.0000');
    expect(element.textContent).toContain('0.2');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/lista-impuestos'))
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

describeTableScreen('Impuestos', Impuestos, 'Nuevo impuesto');

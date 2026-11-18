import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Proveedor } from '@interfaces';
import { apiUrl } from '@services';
import { Proveedores } from './proveedores';

describe('Proveedores', () => {
  let fixture: ComponentFixture<Proveedores>;
  let http: HttpTestingController;

  const proveedores: Proveedor[] = [
    {
      id: 1,
      name: 'Proveedor de Insumos S.A.',
      nit: '08011999123456',
      nrc: '123456-7',
      has_withholding: true,
      withholding_percent: 10,
      payment_name: 'Transferencia Bancaria',
      departmento_id: 1,
      municipio_id: 5,
      address_complement: 'Col. Centro, 2da avenida, bloque A',
      phone: '98765432',
      email: 'contacto@proveedor.com',
      contact_person: 'Juan Pérez',
      is_active: true,
    },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Proveedores],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Proveedores);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de proveedores y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/lista-proveedores')).flush(proveedores);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Proveedor de Insumos S.A.');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/lista-proveedores'))
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

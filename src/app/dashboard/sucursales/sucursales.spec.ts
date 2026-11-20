import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sucursal } from '@interfaces';
import { apiUrl } from '@services';
import { Sucursales } from './sucursales';

describe('Sucursales', () => {
  let fixture: ComponentFixture<Sucursales>;
  let http: HttpTestingController;

  const sucursales: Sucursal[] = [
    {
      id: 1,
      name: 'Sucursal Central',
      email: 'central@ejemplo.com',
      phone: '98765432',
      manager: null,
      manager_id: null,
      branch_code: 'SPS001',
      tipo_establecimiento: 1,
      tipo_establecimiento_name: 'Sucursal',
      departamento_id: 8,
      departamento_name: 'Cuscatlán',
      municipio_id: 20,
      municipio_name: 'Cuscatlán Norte',
      complemento_direccion: 'Barrio El Centro',
      cod_estable_mh: '0001',
      cod_estable: '001',
      cod_pventa_mh: '0001',
      cod_pventa: '001',
      is_active: true,
    },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Sucursales],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Sucursales);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de sucursales y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/branches')).flush(sucursales);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Sucursal Central');
    expect(element.textContent).toContain('Cuscatlán Norte');
    expect(element.textContent).toContain('Sucursal');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/branches'))
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

import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Empresa } from '@interfaces';
import { apiUrl } from '@services';
import { Empresas } from './empresas';

describe('Empresas', () => {
  let fixture: ComponentFixture<Empresas>;
  let http: HttpTestingController;

  const empresas: Empresa[] = [
    {
      id: 1,
      name: 'Company 01',
      nit: '12365478912364',
      nrc: '1236589',
      activity_code: '75000',
      activity_description: 'Actividades de compra y venta',
      comercial_name: 'Tu empresa',
      email: 'contacto@empresa.com',
      phone: '1234567890',
      api_key: null,
      private_password: null,
    },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Empresas],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Empresas);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de empresas y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/info-empresa')).flush(empresas);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Tu empresa');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/info-empresa'))
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

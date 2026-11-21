import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Marca } from '@interfaces';
import { apiUrl } from '@services';
import { Marcas } from './marcas';
import { describeTableScreen } from '../table-screen.testing.spec';

describe('Marcas', () => {
  let fixture: ComponentFixture<Marcas>;
  let http: HttpTestingController;

  const marcas: Marca[] = [{ id: 1, name: 'La Guangara', is_active: true }];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Marcas],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Marcas);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de marcas y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/lista-marcas')).flush(marcas);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('La Guangara');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/lista-marcas'))
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

describeTableScreen('Marcas', Marcas, 'Nueva marca');

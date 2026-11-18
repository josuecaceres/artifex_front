import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { faLock } from './icons';
import { StatusPage } from './status-page';

describe('StatusPage', () => {
  let fixture: ComponentFixture<StatusPage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPage],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPage);
    fixture.componentRef.setInput('icon', faLock);
    fixture.componentRef.setInput('code', '403');
    fixture.componentRef.setInput('title', 'Sin acceso');
    fixture.componentRef.setInput(
      'message',
      'No tienes permiso para ver esta página.',
    );
    fixture.componentRef.setInput('actionLabel', 'Volver al inicio');
    fixture.componentRef.setInput('actionLink', '/');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('muestra el código, el título y el mensaje', () => {
    expect(element.querySelector('.status__code')?.textContent).toContain(
      '403',
    );
    expect(element.querySelector('h1')?.textContent).toContain('Sin acceso');
    expect(element.textContent).toContain('No tienes permiso');
  });

  it('muestra un enlace de regreso a la dirección indicada', () => {
    const link = element.querySelector('a');

    expect(link?.textContent).toContain('Volver al inicio');
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('dibuja el icono', () => {
    expect(element.querySelector('fa-icon svg')).not.toBeNull();
  });
});

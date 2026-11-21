import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotAuthorized } from './not-authorized';

describe('NotAuthorized', () => {
  let fixture: ComponentFixture<NotAuthorized>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotAuthorized],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotAuthorized);
    await fixture.whenStable();
  });

  it('muestra el error 403 y un enlace al inicio', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.status__code')?.textContent).toContain(
      '403',
    );
    expect(element.querySelector('h1')?.textContent).toContain(
      'No tienes acceso',
    );
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});

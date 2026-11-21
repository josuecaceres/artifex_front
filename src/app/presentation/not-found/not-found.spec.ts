import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFound } from './not-found';

describe('NotFound', () => {
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
  });

  it('muestra el error 404 y un enlace al inicio', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.status__code')?.textContent).toContain(
      '404',
    );
    expect(element.querySelector('h1')?.textContent).toContain(
      'No encontramos',
    );
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});

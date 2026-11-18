import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MaterialModule } from './material.module';

@Component({
  selector: 'app-material-module-probe',
  imports: [MaterialModule],
  template: `
    <button mat-flat-button>Probe</button>
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>Probe</mat-panel-title>
      </mat-expansion-panel-header>
    </mat-expansion-panel>
  `,
})
class MaterialModuleProbe {}

describe('MaterialModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('se puede importar en un componente standalone y renderiza sus directivas', async () => {
    const fixture = TestBed.createComponent(MaterialModuleProbe);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('button[mat-flat-button]')).toBeTruthy();
    expect(element.querySelector('mat-expansion-panel')).toBeTruthy();
  });
});

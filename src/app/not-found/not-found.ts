import { Component } from '@angular/core';
import { StatusPage, faMagnifyingGlass } from '@shared';

@Component({
  selector: 'app-not-found',
  imports: [StatusPage],
  template: `
    <app-status-page
      [icon]="icon"
      code="404"
      title="No encontramos esta página"
      message="La dirección no existe o fue movida. Revisa que esté bien escrita o vuelve al inicio."
      actionLabel="Ir al inicio"
      actionLink="/"
    />
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class NotFound {
  protected readonly icon = faMagnifyingGlass;
}

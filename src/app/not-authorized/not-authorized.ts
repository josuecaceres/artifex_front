import { Component } from '@angular/core';
import { StatusPage, faLock } from '@shared';

@Component({
  selector: 'app-not-authorized',
  imports: [StatusPage],
  template: `
    <app-status-page
      [icon]="icon"
      code="403"
      title="No tienes acceso"
      message="Tu cuenta no tiene permiso para ver esta página. Si crees que es un error, pide acceso a tu administrador."
      actionLabel="Volver al inicio"
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
export class NotAuthorized {
  protected readonly icon = faLock;
}

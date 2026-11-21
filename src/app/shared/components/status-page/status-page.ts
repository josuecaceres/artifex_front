import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIcon, FaIconComponent } from '@shared/consts/icons';
import { MaterialModule } from '@shared/material.module';

/**
 * Página de estado a pantalla completa (no encontrada, sin acceso, etc.):
 * icono, código, título, mensaje y un botón para volver.
 */
@Component({
  selector: 'app-status-page',
  imports: [FaIconComponent, MaterialModule, RouterLink],
  templateUrl: './status-page.html',
  styleUrl: './status-page.scss',
})
export class StatusPage {
  readonly icon = input.required<AppIcon>();
  readonly code = input.required<string>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input.required<string>();
  readonly actionLink = input.required<string>();
}

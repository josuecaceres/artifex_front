import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIXED_SUBSCRIPT_PROVIDER, MaterialModule } from '@shared';

/**
 * Diálogo de formulario de ejemplo: así se arma uno (ver
 * `styles/components/_dialogs.scss`). Se abre con `FORM_DIALOG_CONFIG`; el
 * contenido es una cuadrícula `app-form` de 2 columnas (de 6 a 10 controles),
 * cada campo reserva su línea de error o aviso (`FIXED_SUBSCRIPT_PROVIDER`) y
 * los interruptores van juntos al final.
 */
@Component({
  selector: 'app-kit-form-dialog',
  imports: [MaterialModule, ReactiveFormsModule],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  template: `
    <h2 mat-dialog-title>Nuevo registro</h2>
    <form>
      <mat-dialog-content class="app-form app-form--2">
        <mat-form-field>
          <mat-label>Nombre</mat-label>
          <input matInput />
          <mat-hint>Cada campo reserva esta línea.</mat-hint>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Código</mat-label>
          <input matInput />
        </mat-form-field>
        <mat-form-field class="app-form__full">
          <mat-label>Descripción</mat-label>
          <input matInput />
        </mat-form-field>
        <div class="app-field-group-label">Ubicación</div>
        <mat-form-field>
          <mat-label>Departamento</mat-label>
          <mat-select>
            <mat-option value="1">Francisco Morazán</mat-option>
          </mat-select>
          <mat-hint>Cargando…</mat-hint>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Municipio</mat-label>
          <mat-select>
            <mat-option value="1">Distrito Central</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="app-form__switches">
          <mat-slide-toggle [checked]="true">Aplica retención</mat-slide-toggle>
          <mat-slide-toggle [checked]="true">Activo</mat-slide-toggle>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" mat-dialog-close>
          Cancelar
        </button>
        <button mat-flat-button type="button" mat-dialog-close>Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class KitFormDialog {}

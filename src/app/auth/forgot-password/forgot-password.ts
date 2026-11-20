import { Component, ElementRef, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { apiErrorMessage, UserService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faCircleCheck,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/**
 * Crear o recuperar la contraseña (`/auth/forgot-password`), contra `POST
 * /api/change-password` (pública). Comprobado contra la API real: es también
 * el paso con el que un usuario recién creado fija su primera contraseña; el
 * backend pide nombre, siglas y correo además de la contraseña (mínimo 8
 * caracteres), responde 200 aunque los datos no coincidan (no revela si el
 * usuario existe) y deja al usuario pendiente de autorización por un
 * administrador.
 */
@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    RouterLink,
    FaIconComponent,
    SubmitLock,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly userService = inject(UserService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly icons = {
    warning: faTriangleExclamation,
    success: faCircleCheck,
  };
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    acronym: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly done = signal(false);

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid')
        ?.focus();
      return;
    }

    const { name, acronym, email, password, confirmPassword } =
      this.form.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    return this.userService
      .changePassword({ name, acronym, email, password })
      .pipe(
        tap(() => this.done.set(true)),
        catchError((error: unknown) => {
          this.errorMessage.set(apiErrorMessage(error));
          return EMPTY;
        }),
      );
  };
}

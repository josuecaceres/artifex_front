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
 * Recuperar contraseña (`/auth/forgot-password`), contra `POST
 * /api/change-password` (pública). El cuerpo es el que trae la colección de
 * Postman del backend: pide nombre, siglas y correo además de la contraseña
 * nueva, una forma atípica para un flujo sin sesión (no pide la contraseña
 * actual ni un código de verificación). Sin confirmar todavía contra la API
 * real ni contra el equipo de backend; ver la nota en `ChangePasswordRequest`
 * (`@interfaces`).
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
    password: ['', Validators.required],
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

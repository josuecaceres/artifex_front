import { Component, ElementRef, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FaIconComponent,
  MaterialModule,
  faEye,
  faEyeSlash,
  faTriangleExclamation,
  SubmitLock,
  SubmitResult,
} from '@shared';
import { AuthService, apiErrorMessage } from '@services';
import { EMPTY, catchError, tap } from 'rxjs';

/** Pantalla de acceso (`/auth/login`). */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    RouterLink,
    FaIconComponent,
    SubmitLock,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly icons = {
    eye: faEye,
    eyeSlash: faEyeSlash,
    warning: faTriangleExclamation,
  };
  protected readonly form = inject(NonNullableFormBuilder).group({
    user_name: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly passwordVisible = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  /** Acción del formulario, protegida contra el doble envío por `appSubmitLock`. */
  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid')
        ?.focus();
      return;
    }

    const { user_name, password } = this.form.getRawValue();
    return this.auth.login({ user_name: user_name.trim(), password }).pipe(
      tap(() => void this.router.navigateByUrl(this.returnUrl())),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };

  protected togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  /** A dónde volver tras entrar: solo direcciones internas, para no abrir una redirección a otro sitio. */
  private returnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');
    return value && /^\/(?![/\\])/.test(value) ? value : '/dashboard';
  }
}

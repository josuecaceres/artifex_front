import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Departamento, Municipio } from '@shared/interfaces/ubicacion';
import { CatalogoService } from '@shared/services/catalogo.service';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { MaterialModule } from '@shared/material.module';

/**
 * Par de selectores encadenados Departamento → Municipio, alimentados por
 * `GET /api/departamentos` y `GET /api/departamentos/{id}/municipios`. Recibe
 * los dos controles del formulario padre (que pone sus validaciones): al
 * cambiar el departamento se vacía el municipio y se piden los del nuevo. El
 * backend no valida que el municipio pertenezca al departamento, así que esta
 * es la única garantía.
 */
@Component({
  selector: 'app-ubicacion-fields',
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './ubicacion-fields.html',
  styleUrl: './ubicacion-fields.scss',
})
export class UbicacionFields implements OnInit {
  private readonly catalogo = inject(CatalogoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly municipioRequests = new Subject<number | null>();

  readonly departamento = input.required<FormControl<number | null>>();
  readonly municipio = input.required<FormControl<number | null>>();

  protected readonly departamentos = signal<Departamento[]>([]);
  protected readonly municipios = signal<Municipio[]>([]);
  protected readonly loadingDepartamentos = signal(true);
  protected readonly loadingMunicipios = signal(false);
  protected readonly loadError = signal(false);

  ngOnInit(): void {
    this.catalogo.departamentos().subscribe({
      next: (departamentos) => {
        this.departamentos.set(departamentos);
        this.loadingDepartamentos.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loadingDepartamentos.set(false);
      },
    });

    this.municipioRequests
      .pipe(
        switchMap((id) => {
          if (id === null) {
            this.loadingMunicipios.set(false);
            return of<Municipio[]>([]);
          }
          this.loadingMunicipios.set(true);
          return this.catalogo.municipios(id).pipe(
            catchError(() => {
              this.loadError.set(true);
              return of<Municipio[]>([]);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((municipios) => {
        this.municipios.set(municipios);
        this.loadingMunicipios.set(false);
      });

    const departamento = this.departamento();
    this.municipioRequests.next(departamento.value);
    departamento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.municipio().setValue(null);
        this.municipioRequests.next(id);
      });
  }
}

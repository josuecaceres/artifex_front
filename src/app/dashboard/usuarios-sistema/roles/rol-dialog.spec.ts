import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Permission, Role } from '@usuarios-sistema/interfaces';
import { apiUrl } from '@shared';
import { RolDialog } from './rol-dialog';

describe('RolDialog', () => {
  let fixture: ComponentFixture<RolDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<RolDialog>>;

  const catalog: Permission[] = [
    { id: 1, name: 'ver usuarios' },
    { id: 2, name: 'editar usuarios' },
  ];

  function setValue(field: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(
      `[formcontrolname="${field}"]`,
    )!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
  }

  async function createComponent(data: { role?: Role } = {}): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [RolDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RolDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;

    http.expectOne(apiUrl('api/lista-permisos')).flush(catalog);
    if (data.role) {
      http.expectOne(apiUrl(`api/permisos-del-rol/${data.role.id}`)).flush([
        {
          id: data.role.id,
          name: data.role.name,
          permissions: [
            { id: 1, name: 'ver usuarios', granted: true },
            { id: 2, name: 'editar usuarios', granted: false },
          ],
        },
      ]);
    }
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  const cards = () =>
    Array.from(element.querySelectorAll<HTMLElement>('.rol-perm'));
  const names = () =>
    cards().map((card) => card.querySelector('.rol-perm__name')?.textContent);
  const switches = () =>
    Array.from(
      element.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
        'mat-slide-toggle button',
      ),
    ).map((toggle) => toggle.getAttribute('aria-checked') === 'true');
  const totals = () =>
    element.querySelector('.rol-totals')?.textContent?.replace(/\s+/g, ' ');

  async function search(text: string): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('.rol-search input')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  it('carga el catálogo de permisos al abrir, con cada palabra en mayúscula', async () => {
    await createComponent();

    expect(names()).toEqual(['Ver Usuarios', 'Editar Usuarios']);
  });

  it('cada interruptor tiene el nombre del permiso como nombre accesible', async () => {
    await createComponent();

    const labels = Array.from(
      element.querySelectorAll('mat-slide-toggle button'),
    ).map((toggle) => toggle.getAttribute('aria-label'));
    expect(labels).toEqual(['Ver Usuarios', 'Editar Usuarios']);
  });

  it('usa el estilo de formulario: nombre centrado, 3 columnas y lista con scroll propio', async () => {
    await createComponent();

    const content = element.querySelector('mat-dialog-content')!;
    expect(content.classList).toContain('app-form');
    expect(element.querySelector('.rol-name')).not.toBeNull();
    expect(element.querySelector('.rol-list')).not.toBeNull();
    expect(
      element.querySelector('.rol-permisos__title')?.textContent,
    ).toContain('Permisos Asignados');
    // El título y el buscador comparten la fila.
    const head = element.querySelector('.rol-permisos__head')!;
    expect(head.querySelector('.rol-permisos__title')).not.toBeNull();
    expect(head.querySelector('.rol-search')).not.toBeNull();
  });

  it('precarga los permisos ya asignados en modo edición', async () => {
    await createComponent({
      role: { id: 1, name: 'Administrador', guard_name: 'api' },
    });

    // Solo el permiso concedido queda activo: el id del rol (1) no debe
    // confundirse con el de un permiso.
    expect(switches()).toEqual([true, false]);
  });

  it('un clic en cualquier parte de la tarjeta activa y desactiva el permiso', async () => {
    await createComponent();
    expect(switches()).toEqual([false, false]);

    cards()[0].querySelector<HTMLElement>('.rol-perm__name')!.click();
    await fixture.whenStable();
    expect(switches()).toEqual([true, false]);

    cards()[0].click();
    await fixture.whenStable();
    expect(switches()).toEqual([false, false]);
  });

  it('el interruptor también alterna el permiso, una sola vez por clic', async () => {
    await createComponent();

    element.querySelector<HTMLElement>('mat-slide-toggle button')!.click();
    await fixture.whenStable();

    expect(switches()).toEqual([true, false]);
    expect(totals()).toContain('Total seleccionados: 1');
  });

  it('muestra el total y el total seleccionado del catálogo completo', async () => {
    await createComponent({
      role: { id: 1, name: 'Administrador', guard_name: 'api' },
    });

    expect(totals()).toContain('Total permisos: 2');
    expect(totals()).toContain('Total seleccionados: 1');

    await search('editar');
    // Los totales no dependen de la búsqueda.
    expect(totals()).toContain('Total permisos: 2');
    expect(totals()).toContain('Total seleccionados: 1');
  });

  it('el buscador filtra por nombre sin distinguir tildes ni mayúsculas', async () => {
    await createComponent();

    await search('EDITAR');
    expect(names()).toEqual(['Editar Usuarios']);

    await search('');
    expect(names()).toEqual(['Ver Usuarios', 'Editar Usuarios']);
  });

  it('sin coincidencias avisa y conserva lo seleccionado', async () => {
    await createComponent();
    cards()[0].click();
    await fixture.whenStable();

    await search('zzz');

    expect(element.querySelector('.rol-list')?.textContent).toContain(
      'Sin permisos para «zzz».',
    );
    expect(cards().length).toBe(0);

    await search('');
    expect(switches()).toEqual([true, false]);
  });

  it('crea el rol con los permisos marcados', async () => {
    await createComponent();
    setValue('name', 'Cajero');
    element.querySelector<HTMLElement>('mat-slide-toggle button')!.click();
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-roles'));
    expect(request.request.body).toEqual({
      name: 'Cajero',
      permissions: [{ permission_id: 1 }],
    });
    const result = {
      message: 'Rol creado con permisos asignados',
      role: { id: 3, name: 'Cajero', permissions: ['ver usuarios'] },
    };
    request.flush(result);

    expect(dialogRef.close).toHaveBeenCalledWith(result);
  });

  it('permite guardar sin ningún permiso marcado', async () => {
    await createComponent();
    setValue('name', 'Solo lectura');

    submit();

    const request = http.expectOne(apiUrl('api/crear-roles'));
    expect(request.request.body).toEqual({
      name: 'Solo lectura',
      permissions: [],
    });
    request.flush({
      message: 'Rol creado con permisos asignados',
      role: { id: 4, name: 'Solo lectura', permissions: [] },
    });
  });
});

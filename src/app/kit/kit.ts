import {
  AfterViewInit,
  Component,
  DOCUMENT,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  FaIconComponent,
  LempiraPipe,
  MaterialModule,
  faArrowRightFromBracket,
  faBell,
  faBoxArchive,
  faCalendarDays,
  faCircleCheck,
  faCopy,
  faDownload,
  faEye,
  faEyeSlash,
  faFilter,
  faGear,
  faHouse,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTable,
  faTriangleExclamation,
  faUsers,
} from '@shared';
import { ThemeMode, ThemeService } from '@services';
import { KitDialog } from './kit-dialog';

type RowStatus = 'active' | 'ok' | 'warn' | 'crit';

interface KitRow {
  code: string;
  description: string;
  owner: string;
  status: RowStatus;
  amount: number;
}

interface KitSection {
  id: string;
  label: string;
}

const STATUS_LABEL: Record<RowStatus, string> = {
  active: 'En curso',
  ok: 'Completado',
  warn: 'En revisión',
  crit: 'Vencido',
};

// Datos sintéticos: solo sirven para ver los componentes.
const ROWS: KitRow[] = [
  {
    code: 'OP-2841',
    description: 'Mantenimiento preventivo, línea 3',
    owner: 'M. Rojas',
    status: 'active',
    amount: 1240.5,
  },
  {
    code: 'OP-2840',
    description: 'Recepción de insumos, almacén norte',
    owner: 'L. Fuentes',
    status: 'crit',
    amount: 8760,
  },
  {
    code: 'OP-2838',
    description: 'Auditoría de registros de turno',
    owner: 'C. Mena',
    status: 'warn',
    amount: 315.75,
  },
  {
    code: 'OP-2837',
    description: 'Cierre de inventario mensual',
    owner: 'A. Paredes',
    status: 'ok',
    amount: 22450,
  },
  {
    code: 'OP-2835',
    description: 'Calibración de equipos, sala 2',
    owner: 'J. Vidal',
    status: 'active',
    amount: 980,
  },
  {
    code: 'OP-2833',
    description: 'Revisión de proveedores',
    owner: 'R. Salazar',
    status: 'ok',
    amount: 4120,
  },
  {
    code: 'OP-2831',
    description: 'Reposición de repuestos',
    owner: 'P. Ibarra',
    status: 'warn',
    amount: 1875.2,
  },
  {
    code: 'OP-2829',
    description: 'Inspección de seguridad, planta alta',
    owner: 'T. Quispe',
    status: 'active',
    amount: 640,
  },
  {
    code: 'OP-2826',
    description: 'Traslado de activos entre sedes',
    owner: 'D. Camacho',
    status: 'ok',
    amount: 5300,
  },
  {
    code: 'OP-2824',
    description: 'Conciliación de entregas',
    owner: 'S. Arce',
    status: 'crit',
    amount: 2990.9,
  },
  {
    code: 'OP-2822',
    description: 'Actualización de procedimientos',
    owner: 'E. Montaño',
    status: 'ok',
    amount: 150,
  },
  {
    code: 'OP-2820',
    description: 'Limpieza profunda de bodega',
    owner: 'F. Rivas',
    status: 'active',
    amount: 420,
  },
];

/**
 * Galería de componentes para desarrollo (`/kit`). Muestra cada componente de
 * Angular Material con el estilo de la aplicación, en tema claro y oscuro.
 */
@Component({
  selector: 'app-kit',
  imports: [FaIconComponent, LempiraPipe, ReactiveFormsModule, MaterialModule],
  templateUrl: './kit.html',
  styleUrl: './kit.scss',
})
export class Kit implements AfterViewInit {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly theme = inject(ThemeService);

  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly sections: KitSection[] = [
    { id: 'estados', label: 'Estados' },
    { id: 'botones', label: 'Botones' },
    { id: 'iconos', label: 'Iconos' },
    { id: 'formularios', label: 'Formularios' },
    { id: 'tarjetas', label: 'Tarjetas' },
    { id: 'tabla', label: 'Tabla' },
    { id: 'pestanas', label: 'Pestañas' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'superpuestos', label: 'Menú y diálogos' },
  ];
  protected readonly activeSection = signal('estados');
  protected readonly passwordVisible = signal(false);

  // Íconos de Font Awesome (se importa cada ícono; no se usa la biblioteca global).
  protected readonly icons = {
    plus: faPlus,
    download: faDownload,
    filter: faFilter,
    search: faMagnifyingGlass,
    eye: faEye,
    eyeSlash: faEyeSlash,
    edit: faPen,
    copy: faCopy,
    archive: faBoxArchive,
  };
  protected readonly iconCatalog = [
    { name: 'Inicio', icon: faHouse },
    { name: 'Registros', icon: faTable },
    { name: 'Calendario', icon: faCalendarDays },
    { name: 'Usuarios', icon: faUsers },
    { name: 'Configuración', icon: faGear },
    { name: 'Avisos', icon: faBell },
    { name: 'Buscar', icon: faMagnifyingGlass },
    { name: 'Filtrar', icon: faFilter },
    { name: 'Descargar', icon: faDownload },
    { name: 'Alerta', icon: faTriangleExclamation },
    { name: 'Confirmado', icon: faCircleCheck },
    { name: 'Salir', icon: faArrowRightFromBracket },
  ];

  protected readonly statusLabel: Record<string, string> = STATUS_LABEL;
  protected readonly columns = [
    'code',
    'description',
    'owner',
    'status',
    'amount',
  ];
  protected readonly dataSource = new MatTableDataSource<KitRow>(ROWS);

  protected readonly areas = [
    'Almacén norte',
    'Línea 3',
    'Sala 2',
    'Planta alta',
  ];
  protected readonly themeModes: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'Sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
  ];

  // El correo inicia incompleto y el formulario marcado como tocado para mostrar el estado de error.
  protected readonly form = this.fb.group({
    email: ['m.rojas@', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    area: ['Línea 3'],
    due: [null as Date | null],
    notes: [''],
    notify: [true],
    priority: ['normal'],
    shared: [false],
  });

  constructor() {
    this.form.markAllAsTouched();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort();
    this.dataSource.paginator = this.paginator();
  }

  protected togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected scrollTo(id: string): void {
    this.activeSection.set(id);
    this.document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected openDialog(): void {
    this.dialog.open(KitDialog, { data: { code: 'OP-2841' }, width: '440px' });
  }

  protected notify(): void {
    this.snackBar.open('Orden OP-2841 cerrada.', 'Deshacer', {
      duration: 6000,
    });
  }
}

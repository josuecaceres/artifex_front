import { faPlus } from '@fortawesome/free-solid-svg-icons';

/**
 * Registro central de iconos de la aplicación (Font Awesome, set gratuito *solid*).
 *
 * Es el ÚNICO archivo que importa de `@fortawesome/*`. Los componentes toman de
 * `@shared` tanto el componente `FaIconComponent` como los iconos que necesiten:
 *
 *   import { FaIconComponent, faPlus } from '@shared';
 *
 * Para usar un icono nuevo, agregarlo a la lista de abajo (en orden alfabético).
 * Solo se incluyen en el bundle los iconos que algún componente use.
 */
export { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Tipo de cualquier icono del set, para recibir un icono como parámetro. */
export type AppIcon = typeof faPlus;

export {
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
  faLock,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTable,
  faTriangleExclamation,
  faUserShield,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

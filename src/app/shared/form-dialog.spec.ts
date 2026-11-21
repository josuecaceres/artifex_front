import {
  FIXED_SUBSCRIPT_PROVIDER,
  FORM_DIALOG_CONFIG,
  formColumns,
  formDialogWidth,
} from './form-dialog';

describe('form-dialog', () => {
  it('formColumns: hasta 5 controles, una columna; de 6 a 10, dos; más de 10, tres', () => {
    expect([1, 3, 5].map(formColumns)).toEqual([1, 1, 1]);
    expect([6, 7, 10].map(formColumns)).toEqual([2, 2, 2]);
    expect([11, 13, 15].map(formColumns)).toEqual([3, 3, 3]);
  });

  it('formDialogWidth: una columna conserva su ancho; dos, 720 px; tres, 960 px', () => {
    expect(formDialogWidth(1)).toBe('420px');
    expect(formDialogWidth(1, '480px')).toBe('480px');
    expect(formDialogWidth(2)).toBe('720px');
    expect(formDialogWidth(3)).toBe('960px');
  });

  it('la configuración pone la clase del panel y deja el ancho a 92 % de la ventana', () => {
    expect(FORM_DIALOG_CONFIG.panelClass).toBe('app-form-dialog');
    expect(FORM_DIALOG_CONFIG.maxWidth).toBe('92vw');
    expect(FORM_DIALOG_CONFIG.maxHeight).toContain('100vh');
  });

  it('el proveedor reserva siempre el espacio de errores y avisos', () => {
    expect(FIXED_SUBSCRIPT_PROVIDER).toEqual(
      jasmine.objectContaining({
        useValue: jasmine.objectContaining({ subscriptSizing: 'fixed' }),
      }),
    );
  });
});

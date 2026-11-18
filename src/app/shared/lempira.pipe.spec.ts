import { LempiraPipe } from './lempira.pipe';

describe('LempiraPipe', () => {
  const pipe = new LempiraPipe();
  const L = 'L ';

  it('da formato de lempiras con miles y dos decimales', () => {
    expect(pipe.transform(1240.5)).toBe(`${L}1,240.50`);
    expect(pipe.transform(22450)).toBe(`${L}22,450.00`);
  });

  it('acepta números en texto', () => {
    expect(pipe.transform('315.75')).toBe(`${L}315.75`);
  });

  it('permite cambiar los decimales', () => {
    expect(pipe.transform(1500, '1.0-0')).toBe(`${L}1,500`);
  });

  it('devuelve null si no hay un número', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
    expect(pipe.transform('')).toBeNull();
    expect(pipe.transform('abc')).toBeNull();
  });
});

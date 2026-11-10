// Karma para el CI (GitHub Actions): Chrome sin interfaz y sin sandbox (el
// runner no permite el sandbox de Chrome) y salida compacta. En local se usa
// la configuración por defecto de Angular: `npm test`.
//   npm run test:ci
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [require('karma-jasmine'), require('karma-chrome-launcher')],
    client: { jasmine: {}, clearContext: false },
    reporters: ['dots'],
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },
    restartOnFileChange: false,
  });
};

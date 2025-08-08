const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000';

  app.use(
    ['/api', '/auth'].map((context) =>
      createProxyMiddleware(context, {
        target,
        changeOrigin: true,
        secure: false,
        logLevel: 'silent',
      })
    )
  );
};

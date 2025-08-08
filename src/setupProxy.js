const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target =
    process.env.API_PROXY_TARGET ||
    process.env.REACT_APP_API_BASE_URL ||
    'http://localhost:9000';

  const contexts = ['/api', '/auth'];
  contexts.forEach((context) => {
    app.use(
      context,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: false,
        logLevel: 'silent',
      })
    );
  });
};

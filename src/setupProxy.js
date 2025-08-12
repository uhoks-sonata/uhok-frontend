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
        logLevel: 'debug', // 디버깅을 위해 로그 레벨 변경
        onProxyReq: (proxyReq, req, res) => {
          console.log(`프록시 요청: ${req.method} ${req.url} -> ${target}${req.url}`);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log(`프록시 응답: ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
          console.error(`프록시 에러: ${req.method} ${req.url}`, err.message);
        }
      })
    );
  });
};

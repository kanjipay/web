const { createProxyMiddleware } = require("http-proxy-middleware");
const baseUrl = process.env.REACT_APP_BASE_SERVER_URL;
console.log(baseUrl);

module.exports = function (app) {
  app.use(
    "/api/v1/log",
    createProxyMiddleware({
      target: baseUrl,
      changeOrigin: true,
    })
  );
};

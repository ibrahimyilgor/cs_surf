const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/surf-api",
    createProxyMiddleware({
      target: "https://surf.xplay.gg",
      changeOrigin: true,
      pathRewrite: { "^/surf-api": "/api" },
    }),
  );
};

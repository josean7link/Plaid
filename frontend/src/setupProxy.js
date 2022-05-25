const proxy = require("http-proxy-middleware");

module.exports = app => {
  app.use(
    "/api/v1/plaid",
    proxy({
      target: process.env.REACT_APP_API_HOST || "http://localhost:8000",
      changeOrigin: true
    })
  );
};

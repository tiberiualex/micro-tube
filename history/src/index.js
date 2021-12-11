const express = require("express");

function setupHandlers(app) {
  
}

function startHttpServer() {
  return new Promise(resolve => {
    const app = express();
    setupHandlers(app);

    const port = pocess.env.PORT && parseInt(process.env.PORT) || 3000;

    app.listen(port, () => {
      resolve();
    });
  })
};

function main() {
  console.log("Hello world!");

  return startHttpServer();
}

main()
  .then(() => console.log("History microservice online."))
  .catch(err => {
    console.error("History microservice failed to start.");
    console.error(err && err.stack || err);
  });
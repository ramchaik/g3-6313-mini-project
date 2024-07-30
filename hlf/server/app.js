"use strict";
const fastify = require("fastify");
const registerRoutes = require("./routes");
const { host, port } = require("./config.json");

const { initializeHyperledgerNetwork } = require("./lib/hyperledger.js");

const app = fastify({ logger: true });

app.register(registerRoutes);

app.listen(port, host, async (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  await initializeHyperledgerNetwork(app);
  app.log.info(`Server is running on http://${host}:${port}`);
});

const model = require("./model");

function registerRoutes(app, opts, done) {
  app.get("/project/:id", async (request, reply) => {
    const id = request.params.id;
    try {
      const result = await model.readProject(id);
      reply
        .type('application/json')
        .send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  app.get("/project", async (request, reply) => {
    try {
      const result = await model.getAllProjects();
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });


  app.post("/project", async (request, reply) => {
    const { id, value } = request.body;
    try {
      const result = await model.createProject(id, value);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  app.put("/project/:id", async (request, reply) => {
    const id = request.params.id;
    const { value } = request.body;
    try {
      const result = await model.updateProject(id, value);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  app.delete("/project/:id", async (request, reply) => {
    const id = request.params.id;
    try {
      const result = await model.deleteProject(id);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  done();
}

module.exports = registerRoutes;

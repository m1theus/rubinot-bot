import Fastify from "fastify";
import { createAccountAsync, getTask } from "./service.js";

const server = Fastify({
  logger: {
    level: "error",
  },
});

server.get("/create_account", async (request, reply) => {
  const { account, email, password, character_pattern } = request.query;

  const error = {
    message: "missing data information",
    fields: [],
  };

  if (!account) {
    error.fields.push("account");
  }

  if (!email) {
    error.fields.push("email");
  }

  if (!password) {
    error.fields.push("password");
  }

  if (!character_pattern) {
    error.fields.push("character_pattern");
  }

  if (error?.fields?.length) {
    reply.status(400);
    return error;
  }

  return createAccountAsync({
    account,
    email,
    password,
    character_pattern,
  });
});

server.get("/get_account/:id", async (request, response) => {
  const { id } = request.params;
  return getTask(id);
});

const start = async () => {
  try {
    await server.listen({ port: 5000 });

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
    console.log(`server started at: http://${address?.address}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

process.on("SIGTERM", () => {
  console.log("[server] shutdown...", new Date().toISOString());
  server.close(() => process.exit(0));
});

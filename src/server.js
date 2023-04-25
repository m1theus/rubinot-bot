import Fastify from "fastify";
import { CreateAccountService } from "./service.js";

const server = Fastify({});

server.get("/create_account", async (request, reply) => {
  const {
    account_pattern,
    email: email_pattern,
    password,
    character_pattern,
    quantity,
  } = request.query;

  const error = {
    message: "missing data information",
    fields: [],
  };

  if (!account_pattern) {
    error.fields.push("account_pattern");
  }

  if (!email_pattern) {
    error.fields.push("email");
  }

  if (!password) {
    error.fields.push("password");
  }

  if (!character_pattern) {
    error.fields.push("character_pattern");
  }

  if (!quantity) {
    error.fields.push("quantity");
  }

  if (quantity > 10) {
    error.fields.push("quantity length too large, pattern: [1-10]");
  }

  if (error?.fields?.length) {
    reply.status(400);
    return error;
  }

  return CreateAccountService.createAccountAsync({
    account_pattern,
    email_pattern,
    password,
    character_pattern,
    quantity,
  });
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
    console.log(`server started at: http://${address?.address}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

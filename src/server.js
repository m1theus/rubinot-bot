import express from "express";
import { createAccountAsync, getTask } from "./service.js";

const server = express();

server.get("/", function (req, res) {
  res.send("hello world!");
});

server.get("/create_account", async (request, response) => {
  const { account, email, password, character_pattern } = request.query;

  console.log("handling request...");

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
    return response.status(400).json(error);
  }

  const res = await createAccountAsync({
    account,
    email,
    password,
    character_pattern,
  });

  console.log({ res });
  return response.status(200).json(res);
});

server.get("/get_account/:id", async (request, response) => {
  const { id } = request.params;
  return getTask(id);
});

const start = async () => {
  try {
    server.listen(5000, () => {
      console.log("Web application is listening on port 5000");
    });
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

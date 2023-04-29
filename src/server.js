import { randomUUID } from "node:crypto";

import express from "express";
import { createAccountAsync, getTask } from "./service.js";
import { verifyAccount } from "./http/verify_account.js";
import { worker } from "./util/tesseract.js";

const server = express();

server.get("/", function (req, res) {
  return res.status(200).json({
    endpoints: [
      {
        url: "/create_account",
        full_url:
          "/create_account?account=example&email=example@mail.com&password=example&character_pattern=example",
        params: ["account", "email", "password", "character_pattern"],
      },
      {
        url: "/get_account/:taskId",
        full_url: "/get_account/e6beb294-67e3-4420-9500-9139b0ea02a2",
        params: ["taskId"],
      },
    ],
  });
});

server.get("/create_account", async (request, response) => {
  const { account, email, password, character_pattern } = request.query;
  const taskId = randomUUID();
  console.log(`[${taskId}] controller:handling_request`);

  const error = {
    message: "wrong information data",
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

  const verifyAccountResponse = await verifyAccount(account);
  if (verifyAccountResponse.error) {
    error.fields.push({
      field: "account",
      error: verifyAccountResponse.msg,
    });
  }

  if (error?.fields?.length) {
    console.log(`[${taskId}] controller:bad_request`, error);
    return response.status(400).json({
      taskId,
      error,
    });
  }

  const res = await createAccountAsync(taskId, {
    account,
    email,
    password,
    character_pattern,
  });

  console.log(`[${taskId}] controller:response`, res);
  return response.status(200).json(res);
});

server.get("/get_account/:id", async (request, response) => {
  const { id } = request.params;
  const res = await getTask(id);
  return response.status(200).json(res);
});

const start = async () => {
  try {
    const port = process.env.SERVER_PORT || 3000;
    server.listen(port, () => {
      console.log(`Web application is listening on port::${port}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();

process.on("SIGTERM", async () => {
  console.log("[server] shutdown...", new Date().toISOString());
  server.close(() => process.exit(0));
  await worker.terminate();
});

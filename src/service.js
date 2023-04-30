import { Worker } from "node:worker_threads";

const IN_MEMORY_DB = new Map();

async function createAccountAsync(
  taskId,
  { account, email, password, character_pattern }
) {
  const [em1, em2] = email.split("@");
  const accountEmail = `${em1}+${account}@${em2}`.trim();

  const data = {
    taskId,
    account,
    password,
    name: character_pattern,
    email: accountEmail,
  };

  async function runCreateAccountWorker(data) {
    try {
      const createdAccount = await runWorker(data);
      IN_MEMORY_DB.set(createdAccount.taskId, {
        taskId: createdAccount.taskId,
        data: createdAccount,
        status: "COMPLETED",
      });
    } catch (error) {
      IN_MEMORY_DB.set(data.taskId, {
        taskId: data.taskId,
        data: data,
        status: "FAILED",
      });
    }
  }

  runCreateAccountWorker(data);

  const tasksData = {
    taskId,
    data: [],
    status: "ACTIVE",
  };

  IN_MEMORY_DB.set(taskId, tasksData);

  return tasksData;
}

async function getTask(taskId) {
  const task = IN_MEMORY_DB.get(taskId);
  return task || { data: [] };
}

async function runWorker(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./src/worker.js", { workerData });

    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

export { createAccountAsync, getTask };

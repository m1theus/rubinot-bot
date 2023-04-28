import IORedis from "ioredis";
import { randomUUID } from "node:crypto";
import { Queue, Worker } from "bullmq";

import { performCreateAccountTask } from "./worker.js";
import { CREATE_ACCOUNT_QUEUE } from "./util.js";

const IN_MEMORY_DB = new Map();
const connection = new IORedis("redis://cache:6379");

const createAccountQueue = new Queue(CREATE_ACCOUNT_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 30,
    backoff: {
      type: "fixed",
      delay: 300,
    },
    delay: 300,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 1800,
    },
  },
});

const createAccountWorker = new Worker(
  CREATE_ACCOUNT_QUEUE,
  async (job) => performCreateAccountTask(job),
  {
    connection,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 1800, // keep up to 24 hours
    },
    concurrency: 50,
    runRetryDelay: 200,
  }
);

createAccountWorker.on("completed", (job, successData) => {
  try {
    console.log("creating account completed...jobId:", job.name);
    const task = IN_MEMORY_DB.get(job.name);

    task.data?.push(successData);
    task.status = "COMPLETED";

    IN_MEMORY_DB.delete(job.id);
    IN_MEMORY_DB.set(job.id, task);
  } catch (e) {
    console.log("job completed but failed to update");
  }
});

async function createAccountAsync({
  account,
  email,
  password,
  character_pattern,
}) {
  const taskId = randomUUID();

  const [em1, em2] = email.split("@");
  const accountEmail = `${em1}+${account}@${em2}`.trim();

  const data = {
    taskId,
    account,
    password,
    character_pattern,
    name: taskId,
    email: accountEmail,
  };

  const { id: jobId } = await createAccountQueue.add(taskId, data, {
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 1800,
    },
    attempts: 30,
    backoff: {
      type: "fixed",
      delay: 300,
    },
  });

  const tasksData = {
    taskId,
    jobId,
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

export { createAccountAsync, getTask };

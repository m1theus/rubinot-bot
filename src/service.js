import { randomUUID } from "node:crypto";
import { Queue, Worker } from "bullmq";
import numberToWords from "number-to-words";

import { performCreateAccountTask } from "./worker.js";
import { CREATE_ACCOUNT_QUEUE } from "./util.js";

const IN_MEMORY_DB = new Map();

const createAccountQueue = new Queue(CREATE_ACCOUNT_QUEUE, {
  connection: {
    host: "127.0.0.1",
    port: "6379",
    password: "eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81",
  },
  defaultJobOptions: {
    attempts: 30,
    backoff: {
      type: "fixed",
      delay: 3 * 1000,
    },
    delay: 3 * 1000,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 10 * 1000, // keep up to 24 hours
    },
  },
});

const createAccountWorker = new Worker(
  CREATE_ACCOUNT_QUEUE,
  async (job) => performCreateAccountTask(job),
  {
    connection: {
      host: "127.0.0.1",
      port: "6379",
      password: "eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81",
    },
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 10 * 1000, // keep up to 24 hours
    },
    concurrency: 50,
    runRetryDelay: 200,
    maxStalledCount: 5,
  }
);

createAccountWorker.on("completed", (job, successData) => {
  console.log("creating account completed...jobId:", job.name);
  const task = IN_MEMORY_DB.get(job.name);

  const index = task?.jobs?.indexOf(successData.id);
  if (index > -1) {
    task?.jobs?.splice(index, 1);
  }

  task.data?.push(successData);

  if (task.jobs.length === 0) {
    task.status = "COMPLETED";
  }

  IN_MEMORY_DB.delete(job.id);
  IN_MEMORY_DB.set(job.id, task);
});

async function createAccountAsync({
  account_pattern,
  email_pattern,
  password,
  character_pattern,
  quantity,
}) {
  const taskId = randomUUID();

  const data = new Array(parseInt(quantity) || 1)
    .fill(account_pattern)
    .map((accountName, index) => {
      const account = `${accountName}${index + 1}`;
      const character = `${character_pattern}${numberToWords.toWords(
        index + 1
      )}`
        .split("-")
        .join(" ")
        .replace(" ", "")
        .trim();

      const [em1, em2] = email_pattern.split("@");
      const email = `${em1}+${account}@${em2}`.trim();

      return {
        name: taskId,
        data: {
          account,
          email,
          password,
          character,
          password,
        },
      };
    });

  const jobs = await createAccountQueue.addBulk(data, {
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
    concurrency: 50,
    attempts: 5,
    backoff: {
      type: "fixed",
      delay: 200,
    },
  });

  const tasksData = {
    taskId,
    jobs: jobs?.map((x) => x.id),
    data: [],
    status: "ACTIVE",
  };

  IN_MEMORY_DB.set(taskId, tasksData);

  return tasksData;
}

function getTask(taskId) {
  const data = IN_MEMORY_DB.get(taskId);
  return data || { data: [] };
}

export { createAccountAsync, getTask };

import axios from "axios";

async function doRequest(taskId) {
  const url = `http://74.235.212.101/get_account/${taskId}`;
  const { data } = await axios.get(url);
  console.log(`"${data.taskId}",`);
  return data;
}

const data = [
  "cc641afc-e1fc-4c9e-b7a1-bf9ee5c9d8ce",
  "90babce9-ff4a-4677-812b-4de147443504",
  "4b76f48e-e10f-432b-aadf-2bd9ae07e1fe",
  "56b58114-4f86-43e3-9506-fe281449c686",
  "fd6a7385-765f-4c37-96a7-4c7b84086059",
  "edbf53f2-246f-4fb8-812d-d871998fa76f",
  "913a773c-5e3e-4737-aedd-7fbcfcfef18d",
  "cbf7ebcf-9a3b-4733-a968-cde5011f8cd1",
  "408c2a3d-eb6a-41e2-a9d8-c7f622dd6cb8",
  "375df1f6-bf1c-43c0-9cc2-0d9fa2ae9b90",
];

(async () => {
  const promiseData = data.map((x) => {
    return doRequest(x);
  });

  const allPromise = await Promise.all(promiseData);
  allPromise.forEach((e) => console.log({ e }));
})();

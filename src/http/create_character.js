import axios from "./client.js";

const createCharacter = async ({ name }) =>
  axios.post(
    "https://rubinot.com/?account/character/create",
    new URLSearchParams({
      name,
      save: "1",
      sex: "1",
      world: "0",
    })
  );

export { createCharacter };

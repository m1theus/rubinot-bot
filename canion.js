import axios from "axios";

async function doRequest(account, char) {
  const url = `http://74.235.212.101/create_account?account=${account}&email=mmezilxd@gmail.com&password=@Senha123&character_pattern=${char}`;
  const { data } = await axios.get(url);
  console.log(`"${data.taskId}",`);
  return data;
}

(async () => {
  const numerosPorExtenso = new Map([
    [2, "dois"],
    [3, "tres"],
    [4, "quatro"],
    [5, "cinco"],
    [6, "seis"],
    [7, "sete"],
    [8, "oito"],
    [9, "nove"],
    [10, "dez"],
  ]);

  for (let i = 0; i < 10; i++) {
    const account = `accnumlol${i + 1}`;
    const char = `Characcnumlol${numerosPorExtenso.get(i + 1)}`;
    await doRequest(account, char);
  }
})();

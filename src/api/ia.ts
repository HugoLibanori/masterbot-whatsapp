import axios from "axios";

export const obterRespostaSimi = async (
  texto: string,
): Promise<{ resultado?: string; erro?: string }> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        let resposta: { resultado?: string; erro?: string } = {};
        const url = "https://wsapi.simsimi.com/190410/talk";
        const apiKey = "9uu6Vwr4MnL~iox6SBCuv9waJY5-yKgn3YuYgP-.";

        const data = {
          utext: texto,
          lang: "pt",
          atext_bad_prob_max: 0.7,
          qtext_bad_prob_max: 0.7,
        };

        try {
          const response = await axios.post(url, data, {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
          });

          resposta.resultado = response.data.atext;
          resolve(resposta);
        } catch (error) {
          console.error("Erro ao falar com SimSimi:", error);
        }
      } catch (err: any) {
        console.log(`API obterRespostaSimi - ${err.message}`);
        reject({ erro: "Houve um erro no servidor do SimSimi." });
      }
    })();
  });
};

import fs from "fs";
import tts from "node-gtts";

import { getPathTemp } from "../lib/utils.js";

export const textoParaVoz = async (
  idioma: string,
  texto: string,
): Promise<{ resultado?: Buffer; erro?: string }> => {
  return new Promise((resolve, reject) => {
    try {
      let caminhoAudio = getPathTemp("mp3");
      let resposta: { resultado?: Buffer; erro?: string } = {};
      tts(idioma).save(caminhoAudio, texto, () => {
        let bufferAudio = fs.readFileSync(caminhoAudio);
        fs.unlinkSync(caminhoAudio);
        resposta.resultado = bufferAudio;
        resolve(resposta);
      });
    } catch (err: any) {
      console.log(`API textoParaVoz - ${err.message}`);
      reject({ erro: "Erro na conversão de texto para voz." });
    }
  });
};

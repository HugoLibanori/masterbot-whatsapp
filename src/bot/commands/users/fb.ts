import { proto } from "baileys";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import duration from "format-duration-time";

import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";
import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";
import * as api from "../../../api/downloads.js";

const command: Command = {
  name: "fb",
  description: "Faz downloads de videos e imagens do Facebook.",
  category: "users",
  aliases: ["fb"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: false,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat, textReceived, command } = messageContent;

    const botInfo = dataBot;

    try {
      if (!args.length)
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      let usuarioURL = textReceived;
      if (
        !usuarioURL.match(
          new RegExp(
            /(?:^|)(https?:\/\/(?:www\.)?(mbasic\.facebook|m\.facebook|facebook|facebook\.com|fb|fb\.watch)\/(?:stories\/\d+\/[^\s]+|[^\s]+))/gi,
          ),
        )
      ) {
        return await sock.replyText(id_chat, textMessage.downloads.fb.msgs.erro_link, message);
      }
      const { resultado: resultadoFB } = await getMediaFacebook(usuarioURL);
      if (!resultadoFB) return;
      if (resultadoFB.duration_ms > 300000)
        return await sock.replyText(id_chat, textMessage.downloads.fb.msgs.limite, message);
      const mensagemEspera = criarTexto(
        textMessage.downloads.fb.msgs.espera,
        resultadoFB.title,
        duration.default(resultadoFB.duration_ms).format("m:ss"),
      );
      await sock.replyText(id_chat, mensagemEspera, message);
      await sock.replyFileUrl(
        typeMessages.VIDEO,
        id_chat,
        resultadoFB.sd,
        "",
        message,
        "video/mp4",
      );
    } catch (err: any) {
      if (!err.erro) throw err;
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.outros.erro_api, command, err.erro),
        message,
      );
    }
  },
};

export default command;

interface FacebookResponse {
  url: string;
  duration_ms: number;
  sd: string;
  hd: string;
  title: string;
  thumbnail: string;
}

const getMediaFacebook = async (
  url: string,
): Promise<{ resultado?: FacebookResponse | (undefined & { erro?: string | undefined }) }> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        let resposta: { resultado?: FacebookResponse; erro?: string } = {};
        await getFbVideoInfo(url)
          .then((res) => {
            resposta.resultado = res;
            resolve(resposta);
          })
          .catch(() => {
            resposta.erro = "Erro ao obter o video, verifique o link ou tente mais tarde.";
            reject(resposta);
          });
      } catch (err: any) {
        console.log(`API obterMidiaFacebook - ${err.message}`);
        reject({ erro: "Houve um erro no servidor de download do Facebook." });
      }
    })();
  });
};

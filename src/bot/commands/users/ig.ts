import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";
import { instagramGetUrl } from "instagram-url-direct";
import axios from "axios";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";

const command: Command = {
  name: "ig",
  description: "Download de video/imagem do instagram.",
  category: "users",
  aliases: ["ig"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      let linkMidia = textReceived;
      if (
        !linkMidia.match(
          new RegExp(/(?:^|)(https?:\/\/www\.instagram\.com\/\w+\/[^\s]+)(?=\s|$)/gi),
        )
      ) {
        return await sock.replyText(id_chat, textMessage.downloads.ig.msgs.erro_link, message);
      }
      await sock.replyText(id_chat, textMessage.downloads.ig.msgs.espera, message);
      const resultadoIG = await getMidiaInstagram(linkMidia);

      for (let item of resultadoIG) {
        if (item.tipo == "image")
          await sock.replyFileBuffer(typeMessages.IMAGE, id_chat, item.resultado, "", message);
        if (item.tipo == "video")
          await sock.replyFileBuffer(
            typeMessages.VIDEO,
            id_chat,
            item.resultado,
            "",
            message,
            "video/mp4",
          );
      }
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

const getMidiaInstagram = async (
  urlTexto: string,
): Promise<{ resultado: Buffer; tipo: string }[]> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const res = (await instagramGetUrl(urlTexto)).media_details;

        let arrayResposta = [];

        for (let item of res) {
          const { type, url } = item;
          const { data } = await axios.get(url, { responseType: "arraybuffer" });
          const buffer = Buffer.from(data);

          const resposta = {
            resultado: buffer,
            tipo: type,
          };

          arrayResposta.push(resposta);
        }
        resolve(arrayResposta);
      } catch (err: any) {
        console.log(`API obterMidiaInstagram - ${err}`);
        reject({ erro: "Houve um erro no servidor de download do Instagram" });
      }
    })();
  });
};

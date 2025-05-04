import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import * as api from "../../../api/downloads.js";
import { typeMessages } from "../../messages/contentMessage.js";

const command: Command = {
  name: "yt",
  description: "Faz downloads de videos do Youtube.",
  category: "users",
  aliases: ["yt"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      let usuarioTexto = textReceived;
      const { resultado: resultadoInfoVideo } = await api.getInfoVideoYT(usuarioTexto);
      if (!resultadoInfoVideo) return;
      if (resultadoInfoVideo?.isLiveContent)
        return await sock.replyText(id_chat, textMessage.downloads.yt.msgs.erro_live, message);
      else if (Number(resultadoInfoVideo?.lengthSeconds) > 900)
        return await sock.replyText(id_chat, textMessage.downloads.yt.msgs.limite, message);
      const mensagemEspera = criarTexto(
        textMessage.downloads.yt.msgs.espera,
        resultadoInfoVideo?.title,
        resultadoInfoVideo.durationFormatted,
      );
      await sock.replyText(id_chat, mensagemEspera, message);
      const { resultado: resultadoYTMP4 } = await api.obterYTMP4(resultadoInfoVideo?.videoId);
      if (!resultadoYTMP4) return console.log("Erro ao obter o vídeo do Youtube");
      await sock.replyFileBuffer(
        typeMessages.VIDEO,
        id_chat,
        resultadoYTMP4,
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

import { proto } from "baileys";
import { MessageContent, Command, Bot, Resposta } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, convertSecondsToMinutes, criarTexto } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";
import * as api from "../../../api/downloads.js";

const command: Command = {
  name: "play",
  description: "Download de musica.",
  category: "users",
  aliases: ["play"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command, textReceived } = messageContent;

    const botInfo = dataBot;

    try {
      if (!args.length)
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      let textUser = textReceived?.trim();
      await sock.sendReact(message, "🕒", id_chat);
      const { resultado: resultadoInfoVideo } = await api.getInfoVideoYT(textUser);
      if (resultadoInfoVideo?.isLiveContent)
        return await sock.replyText(id_chat, textMessage.downloads.play.msgs.erro_live, message);
      else if (Number(resultadoInfoVideo?.lengthSeconds) > 900)
        return await sock.replyText(id_chat, textMessage.downloads.play.msgs.limite, message);
      if (!resultadoInfoVideo) return;
      const mensagemEspera = criarTexto(
        textMessage.downloads.play.msgs.espera,
        resultadoInfoVideo?.title,
        resultadoInfoVideo.durationFormatted,
      );
      await sock.replyText(id_chat, mensagemEspera, message);
      const { resultado: resultadoYTMP3 } = await api.obterYTMP3(resultadoInfoVideo.videoId);
      if (!resultadoYTMP3) return;
      await sock.sendReact(message, "✅", id_chat);
      await sock.replyFileBuffer(
        typeMessages.AUDIO,
        id_chat,
        resultadoYTMP3,
        "",
        message,
        "audio/mpeg",
      );
    } catch (err: any) {
      await sock.sendReact(message, "❌", id_chat);
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

import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import * as api from "../../../api/ia.js";

const command: Command = {
  name: "simi",
  description: "Ativa o modo simi.",
  category: "users",
  aliases: ["simi"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      if (dataBot?.apis?.simi.api_key === "")
        return await sock.replyText(id_chat, textMessage.diversao.simi.msgs.sem_api, message);

      await sock.sendReact(message.key, "🕒", id_chat);

      let perguntaSimi = textReceived;
      let { resultado: resultadoTexto } = await api.obterRespostaSimi(perguntaSimi, dataBot);
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.diversao.simi.msgs.resposta, resultadoTexto!),
        message,
      );
      await sock.sendReact(message.key, "✅", id_chat);
    } catch (err: any) {
      await sock.sendReact(message.key, "❌", id_chat);
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

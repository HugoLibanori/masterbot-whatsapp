import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces";

import { Socket } from "../../socket/Socket.js";
import { BotController } from "../../../controllers/BotController.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "prefixo",
  description: "Muda o prefixo do bot.",
  category: "owner",
  aliases: ["prefixo", "prefix"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  owner: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command } = messageContent;
    const { prefix } = dataBot;

    if (!args.length) {
      await sock.sendText(
        id_chat,
        criarTexto(textMessage?.outros.cmd_erro || "", command, command),
      );
      return;
    }

    const botController = new BotController();
    await botController.updateBotData({ prefix: args[0] });
    if (message.key.remoteJid)
      await sock.sendText(
        message.key.remoteJid,
        criarTexto(textMessage?.admin?.prefixo?.msgs?.sucesso || "", args[0]),
      );
    return;
  },
};

export default command;

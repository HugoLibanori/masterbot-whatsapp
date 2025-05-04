import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { BotController } from "../../../controllers/BotController.js";

const botController = new BotController();

const command: Command = {
  name: "pvliberado",
  description: "Ativa e desativa o comando de pv liberado.",
  category: "owner",
  aliases: ["pvliberado"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: true,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat } = messageContent;

    const state = !dataBot.commands_pv;

    const response = state
      ? textMessage.admin.pvliberado.msgs.ativado
      : textMessage.admin.pvliberado.msgs.desativado;

    await botController.updateBotData({ commands_pv: state });

    await sock.replyText(id_chat, response, message);
  },
};

export default command;

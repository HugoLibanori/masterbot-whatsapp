import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";

const command: Command = {
  name: "restrito",
  description: "Coloca o grupo em modo restrito de mensagens.",
  category: "admins",
  aliases: ["restrito"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  owner: false,
  isBotAdmin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const {
      id_chat,
      grupo: {
        dataBd: { restrito_msg },
      },
    } = messageContent;

    const state = !restrito_msg;
    await sock.changeGroupRestriction(id_chat, state);
  },
};

export default command;

import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../interfaces/interfaces.js";

import { Socket } from "../socket/Socket.js";
import { CommandReturn } from "../../interfaces/interfaces.js";

const command: Command = {
  name: "",
  description: "",
  category: "",
  aliases: [], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    // Implementação do comando
  },
};

export default command;

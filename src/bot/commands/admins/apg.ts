import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const command: Command = {
  name: "apg",
  description: "Apaga uma mensagem do grupo.",
  category: "admins",
  aliases: ["apg"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
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
    const { quotedMsg, id_chat, command } = messageContent;

    if (!quotedMsg)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    await sock.deleteMessage(message, quotedMsg);
  },
};

export default command;

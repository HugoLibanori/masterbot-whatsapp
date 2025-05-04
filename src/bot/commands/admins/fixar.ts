import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";

const command: Command = {
  name: "fixar",
  description: "Fixa uma mensagem no grupo.",
  category: "admins",
  aliases: ["fixar"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      contentQuotedMsg: { message: msg },
    } = messageContent;
    await sock.pinOrUnpinText(id_chat, message);
    await sock.replyText(id_chat, textMessage.grupo.fixar.msgs.sucesso, message);
  },
};

export default command;

import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";

const command: Command = {
  name: "desfixar",
  description: "Desfixa uma mensagem do grupo.",
  category: "admins",
  aliases: ["desfixar"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat } = messageContent;
    await sock.pinOrUnpinText(id_chat, message, true);
    await sock.replyText(id_chat, textMessage.grupo.desfixar.msgs.sucesso, message);
  },
};

export default command;

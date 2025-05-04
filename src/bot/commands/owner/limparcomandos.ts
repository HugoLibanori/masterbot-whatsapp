import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";

const usuarios = new UserController();

const command: Command = {
  name: "limparcomandos",
  description: "REseta o comandos dos usuarios.",
  category: "owner",
  aliases: ["limparcomandos"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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

    await usuarios.limparComandos(0);
    await sock.replyText(id_chat, textMessage.admin.limparcomandos.msgs.sucesso, message);
  },
};

export default command;

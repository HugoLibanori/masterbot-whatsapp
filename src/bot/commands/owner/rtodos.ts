import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "rtodos",
  description: "Reseta os comandos diarios de todos usuarios.",
  category: "owner",
  aliases: ["rtodos"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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

    if (!dataBot.limite_diario?.status)
      return await sock.replyText(
        id_chat,
        textMessage.admin.rtodos.msgs.erro_limite_diario,
        message,
      );
    await userController.resetCommandsDay();
    await sock.replyText(id_chat, textMessage.admin.rtodos.msgs.sucesso, message);
  },
};

export default command;

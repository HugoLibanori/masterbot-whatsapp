import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";
import { BotController } from "../../../controllers/BotController.js";

const userController = new UserController();
const botController = new BotController();

const command: Command = {
  name: "deltipo",
  description: "Delet um tipo de usuario.",
  category: "owner",
  aliases: ["deltipo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command, textReceived } = messageContent;

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    let userType = textReceived?.trim();
    await userController.cleanType(userType, dataBot);
    const success = await botController.removeUserType(dataBot, userType);
    if (success)
      await sock.replyText(
        id_chat,
        criarTexto(
          textMessage.admin.deltipo.msgs.sucesso_remocao,
          userType.toLowerCase().replaceAll(" ", ""),
        ),
        message,
      );
    else await sock.replyText(id_chat, textMessage.admin.deltipo.msgs.erro_remocao, message);
  },
};

export default command;

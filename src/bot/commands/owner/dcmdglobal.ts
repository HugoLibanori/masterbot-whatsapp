import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { BotController } from "../../../controllers/BotController.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const botController = new BotController();

const command: Command = {
  name: "dcmdglobal",
  description: "Desbloqueia um comando global.",
  category: "owner",
  aliases: ["dcmdglobal"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, command } = messageContent;

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    const userCommands = args,
      respUnblock = await botController.unblockCommandsGlobal(userCommands, dataBot);
    await sock.replyText(id_chat, respUnblock, message);
  },
};

export default command;

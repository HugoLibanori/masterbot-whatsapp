import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";
import { UserController } from "../../../controllers/UserController.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const grupoController = new GrupoController();
const userController = new UserController();

const command: Command = {
  name: "sair",
  description: "Faz o bot sair do grupo.",
  category: "owner",
  aliases: ["sair"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, textReceived, isGroup, command } = messageContent;
    const numberOwner = await userController.getOwner();

    if (args.length) {
      const Currentgroups = await grupoController.getAllGroups();
      let indexGroup = Number(textReceived);
      if (isNaN(indexGroup))
        return await sock.replyText(id_chat, textMessage.admin.sair.msgs.nao_encontrado, message);
      indexGroup = indexGroup - 1;
      if (!Currentgroups[indexGroup])
        return await sock.replyText(id_chat, textMessage.admin.sair.msgs.nao_encontrado, message);
      await sock.groupLeave(Currentgroups[indexGroup].id_grupo);
      await sock.sendText(numberOwner, textMessage.admin.sair.msgs.resposta_admin);
    } else if (!args.length && isGroup) {
      await sock.groupLeave(id_chat);
      await sock.sendText(numberOwner, textMessage.admin.sair.msgs.resposta_admin);
    } else {
      await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    }
  },
};

export default command;

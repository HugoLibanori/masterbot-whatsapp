import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupoController = new GrupoController();

const command: Command = {
  name: "removerGrupo",
  description: "Remove um grupo verificados.",
  category: "owner",
  aliases: ["removergrupo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const botInfo = dataBot;

    try {
      if (!args.length)
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      let nomeGrupo = textReceived;

      const removido = await grupoController.removeGroupVerified(nomeGrupo);

      if (removido === 0) {
        return await sock.replyText(
          id_chat,
          textMessage.admin.removergrupo.msgs.sem_grupo,
          message,
        );
      }
      await sock.replyText(id_chat, textMessage.admin.removergrupo.msgs.sucesso, message);
    } catch (error) {
      console.log(error);
      await sock.replyText(id_chat, textMessage.admin.removergrupo.msgs.erro, message);
      return;
    }
  },
};

export default command;

import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { GrupoController } from "../../../controllers/GrupoController.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const grupos = new GrupoController();

const command: Command = {
  name: "bcmd",
  description: "Bloqueia um ou varios comandos no grupo.",
  category: "admins",
  aliases: ["bcmd"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { id_chat, grupo, command, textReceived } = messageContent;
    const { id_group: id_grupo, dataBd } = { ...grupo };

    if (!args.length)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    const userCommands = textReceived.split(" ").map((x) => x.trim());
    const respostaBloqueio = await grupos.blockCommands(id_grupo, userCommands, dataBot);

    if (respostaBloqueio) await sock.replyText(id_chat, respostaBloqueio, message);
  },
};

export default command;

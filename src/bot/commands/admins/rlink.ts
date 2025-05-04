import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";

const command: Command = {
  name: "rlink",
  description: "Revoga o link do grupo.",
  category: "admins",
  aliases: ["rlink"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  isBotAdmin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const { grupo } = messageContent;
    const { id_group: id_grupo } = { ...grupo };

    await sock
      .revokeLinkGroup(id_grupo)
      .then(async () => {
        await sock.replyText(id_grupo, textMessage.grupo.rlink.msgs.sucesso, message);
      })
      .catch(async () => {
        await sock.replyText(id_grupo, textMessage.grupo.rlink.msgs.erro, message);
      });
  },
};

export default command;

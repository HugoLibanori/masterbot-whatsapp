import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "link",
  description: "Envia o link do grupo.",
  category: "admins",
  aliases: ["link"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const { id_chat, grupo } = messageContent;
    const linkGroup = await sock.getLinkGroup(id_chat);
    const nameGroup = grupo.name;
    if (linkGroup)
      await sock.sendLinkWithPrevia(
        id_chat,
        criarTexto(textMessage.grupo.link.msgs.resposta, nameGroup, linkGroup),
        linkGroup,
      );
  },
};

export default command;

import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces";

import { Socket } from "../../socket/Socket.js";
import * as menu from "../../../lib/menu.js";

const command: Command = {
  name: "admin",
  description: "Mostra o menu de admin do bot.",
  category: "owner",
  aliases: ["admin", "administrador"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  owner: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat } = messageContent;
    await sock.sendText(id_chat!, menu.menuAdmin(dataBot));
    return;
  },
};

export default command;

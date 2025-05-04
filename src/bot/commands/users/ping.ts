import { proto } from "baileys";
import { MessageContent, Command } from "../../../interfaces/interfaces";

import { Socket } from "../../socket/Socket.js";

const command: Command = {
  name: "s",
  description: "Ping pong",
  category: "owner",
  aliases: ["ping"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    textMessage,
  ) => {
    if (message.key.remoteJid) await sock.sendText(message.key.remoteJid, "🏓 pong!");
  },
};

export default command;

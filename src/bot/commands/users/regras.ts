import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { typeMessages } from "../../messages/contentMessage.js";

const command: Command = {
  name: "regras",
  description: "Exibe as regras do grupo caso exista.",
  category: "users",
  aliases: ["regras", "rules"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, grupo } = messageContent;
    const { id_group } = { ...grupo };
    const desc = grupo?.description || textMessage.grupo.regras.msgs.sem_descrição;

    await sock.sendReact(message.key, "🕒", id_chat);

    await sock
      .getImagePerfil(id_group)
      .then(async (imageUrl) => {
        if (!imageUrl) {
          await sock.replyText(id_chat, desc, message);
          return;
        }
        await sock.replyFileUrl(typeMessages.IMAGE, id_chat, imageUrl, desc, message);
      })
      .catch(async () => {
        await sock.replyText(id_chat, desc, message);
      });

    await sock.sendReact(message.key, "✅", id_chat);
  },
};

export default command;

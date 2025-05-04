import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const command: Command = {
  name: "entrargrupo",
  description: "Bot entra em um grupo.",
  category: "owner",
  aliases: ["entrargrupo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const linkGroup = textReceived;
    const linkValid = linkGroup.match(/(https:\/\/chat.whatsapp.com)/gi);
    if (!linkValid)
      return await sock.replyText(
        id_chat,
        textMessage.admin.entrargrupo.msgs.link_invalido,
        message,
      );
    const idLink = linkGroup.replace(/(https:\/\/chat.whatsapp.com\/)/gi, "");
    await sock
      .joinLinkGroup(idLink)
      .then(async (res) => {
        if (res == undefined)
          await sock.replyText(id_chat, textMessage.admin.entrargrupo.msgs.pendente, message);
        else
          await sock.replyText(id_chat, textMessage.admin.entrargrupo.msgs.entrar_sucesso, message);
      })
      .catch(async () => {
        await sock.replyText(id_chat, textMessage.admin.entrargrupo.msgs.entrar_erro, message);
      });
  },
};

export default command;

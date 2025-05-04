import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { BotController } from "../../../controllers/BotController.js";

const bot = new BotController();

const command: Command = {
  name: "oficialgrupo",
  description: "adiciona um grupo oficial.",
  category: "owner",
  aliases: ["oficialgrupo"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const botInfo = dataBot;

    try {
      if (isGroup) {
        await bot.changeGrupoOficial(id_chat);
        await sock.replyText(id_chat, textMessage.admin.oficialgrupo.msgs.sucesso, message);
      } else {
        if (!args.length)
          return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
        let linkGrupo = textReceived;
        let linkValido = linkGrupo.match(/(https:\/\/chat.whatsapp.com)/gi);
        if (!linkValido)
          return await sock.replyText(
            id_chat,
            textMessage.admin.entrargrupo.msgs.link_invalido,
            message,
          );
        let idLink = linkGrupo.replace(/(https:\/\/chat.whatsapp.com\/)/gi, "");
        await sock
          .groupGetInviteInfo(idLink)
          .then(async (resp) => {
            await bot.changeGrupoOficial(resp.id);
            return await sock.replyText(
              id_chat,
              textMessage.admin.oficialgrupo.msgs.sucesso,
              message,
            );
          })
          .catch(async () => {
            return await sock.replyText(id_chat, textMessage.admin.oficialgrupo.msgs.erro, message);
          });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;

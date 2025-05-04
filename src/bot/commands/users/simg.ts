import { downloadMediaMessage, proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";
import { stickerFroImage } from "../../../api/sticker.js";

const command: Command = {
  name: "simg",
  description: "Converte uma figurinhas em imagem.",
  category: "users",
  aliases: ["simg"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
  owner: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, quotedMsg, contentQuotedMsg } = messageContent;
    try {
      if (!quotedMsg || contentQuotedMsg?.type !== typeMessages.STICKER) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }

      const bufferSticker = await downloadMediaMessage(
        contentQuotedMsg?.message as proto.IWebMessageInfo,
        "buffer",
        {},
      );
      const bufferRename = await stickerFroImage(bufferSticker);

      await sock.SendImage(id_chat, bufferRename.resultado!, "Aqui sua imagem.");
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;

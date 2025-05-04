import { proto, downloadMediaMessage } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { typeMessages } from "../../messages/contentMessage.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { renomearSticker } from "../../../api/sticker.js";

const command: Command = {
  name: "snome",
  description: "Renomeia uma figurinha para o pack e autor enviado.",
  category: "users",
  aliases: ["snome"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, textReceived, quotedMsg, contentQuotedMsg } = messageContent;
    try {
      if (!quotedMsg || contentQuotedMsg?.type !== typeMessages.STICKER) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }
      const [pack, author] = textReceived.split(",");

      if (!pack || !author) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }

      const bufferSticker = await downloadMediaMessage(
        contentQuotedMsg?.message as proto.IWebMessageInfo,
        "buffer",
        {},
      );
      const bufferRename = await renomearSticker(bufferSticker, pack.trim(), author.trim());

      await sock.sendSticker(id_chat, bufferRename.resultado!);
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;

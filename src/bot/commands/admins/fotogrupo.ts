import { downloadMediaMessage, proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";

const command: Command = {
  name: "fotogrupo",
  description: "Altera a foto do grupo.",
  category: "admins",
  aliases: ["fotogrupo", "photogroup", "fg"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
  ) => {
    const { id_chat, quotedMsg, type, contentQuotedMsg, media, messageMedia, command, grupo } =
      messageContent;
    const { seconds } = { ...media };

    if (messageMedia || quotedMsg) {
      const dataMsg = {
        type: quotedMsg ? contentQuotedMsg?.type : type,
        message: quotedMsg ? (contentQuotedMsg?.message ?? message) : message,
        seconds: quotedMsg ? contentQuotedMsg?.seconds : seconds,
      };
      if (dataMsg.type === typeMessages.IMAGE) {
        const bufferPhoto = await downloadMediaMessage(
          dataMsg.message as proto.IWebMessageInfo,
          "buffer",
          {},
        );
        await sock.changeProfilePhoto(id_chat, bufferPhoto);
        await sock.sendText(id_chat, textMessage.grupo.fotogrupo.msgs.sucesso);
      } else {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
      }
    } else {
      await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
    }
  },
};

export default command;

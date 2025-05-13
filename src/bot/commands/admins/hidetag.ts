import { downloadMediaMessage, proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { typeMessages } from "../../messages/contentMessage.js";
import { commandErrorMsg } from "../../../lib/utils.js";

const command: Command = {
  name: "hidetag",
  description: "Menciona todos o usuários do grupo.",
  category: "admins",
  aliases: ["hidetag"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  owner: false,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const {
      id_chat,
      quotedMsg,
      contentQuotedMsg,
      type,
      media,
      command,
      grupo: { participants },
    } = messageContent;
    const { seconds } = { ...media };

    const dataMsg = {
      type: quotedMsg ? contentQuotedMsg?.type : type,
      message: quotedMsg ? contentQuotedMsg?.message : message,
      seconds: quotedMsg ? contentQuotedMsg?.seconds : seconds,
    };

    if (
      dataMsg.type !== typeMessages.IMAGE &&
      dataMsg.type !== typeMessages.VIDEO &&
      dataMsg.type !== typeMessages.STICKER
    ) {
      return await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
    }

    const bufferMidia = await downloadMediaMessage(dataMsg.message!, "buffer", {});

    await sock.sendFileBufferWithMentions(dataMsg.type, id_chat, bufferMidia, participants);
  },
};

export default command;

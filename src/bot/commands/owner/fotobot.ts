import { downloadMediaMessage, proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";

const command: Command = {
  name: "fotobot",
  description: "ALtera a foto do bot.",
  category: "owner",
  aliases: ["fotobot"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
    const {
      id_chat,
      quotedMsg,
      contentQuotedMsg,
      messageMedia,
      command,
      mimetype,
      type,
      numberBot,
    } = messageContent;

    if (!messageMedia && !quotedMsg)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    const dadosMensagem = {
      tipo: messageMedia ? type : contentQuotedMsg.type,
      mimetype: messageMedia ? mimetype : contentQuotedMsg.mimetype,
      mensagem: messageMedia ? message : contentQuotedMsg.message,
    };
    if (dadosMensagem.tipo !== typeMessages.IMAGE || !dadosMensagem.mensagem)
      return await sock.replyText(id_chat, commandErrorMsg(command, dataBot), message);
    const fotoBuffer = await downloadMediaMessage(dadosMensagem.mensagem, "buffer", {});
    await sock.changeProfilePhoto(numberBot, fotoBuffer);
    await sock.replyText(id_chat, textMessage.admin.fotobot.msgs.sucesso, message);
  },
};

export default command;

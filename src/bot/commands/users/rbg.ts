import { downloadMediaMessage, proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";
import { typeMessages } from "../../messages/contentMessage.js";
import * as api from "../../../api/sticker.js";
import { criarTexto } from "../../../lib/utils.js";

const userController = new UserController();

const command: Command = {
  name: "rbg",
  description: "Remove funo de imagem",
  category: "users",
  aliases: ["rbg"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
  admin: false,
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
    const { id_chat, quotedMsg, type, contentQuotedMsg, media, command } = messageContent;
    try {
      const { seconds } = { ...media };

      const dataMsg = {
        type: quotedMsg ? contentQuotedMsg?.type : type,
        message: quotedMsg ? (contentQuotedMsg?.message ?? message) : message,
        seconds: quotedMsg ? contentQuotedMsg?.seconds : seconds,
      };
      if (dataMsg.type !== typeMessages.IMAGE) {
        await sock.sendText(id_chat, textMessage.figurinhas.ssf.msgs.erro_imagem);
        return;
      }

      await sock.sendReact(message.key, "🕒", id_chat);
      await sock.sendText(id_chat, textMessage.utilidades.rbg.msgs.espera);

      const bufferMidia = await downloadMediaMessage(dataMsg.message, "buffer", {});
      const bufferBg = await api.removeBackground(bufferMidia);
      await sock.replyFileBuffer(
        typeMessages.IMAGE,
        id_chat,
        bufferBg,
        "Sua imagem sem fundo!",
        message,
      );
      await sock.sendReact(message.key, "✅", id_chat);
    } catch (err: any) {
      if (!err.erro) throw err;
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.outros.erro_api, command, err.erro),
        message,
      );
    }
  },
};

export default command;

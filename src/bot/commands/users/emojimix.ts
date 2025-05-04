import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { mixEmojis, criarSticker } from "../../../api/sticker.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "",
  description: "",
  category: "",
  aliases: ["emojimix"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, textReceived, command, sender } = messageContent;
    const { author_sticker, pack_sticker } = dataBot;

    const pack: string | null = await userController.getPack(sender!);
    const author: string | null = await userController.getauthor(sender!);

    try {
      if (!args.length) {
        await sock.sendText(id_chat!, commandErrorMsg(command!, dataBot));
        return;
      }

      const [emoji1, emoji2] = textReceived.split("+");

      if (!emoji1 || !emoji2) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }
      await sock.sendReact(message.key, "🕒", id_chat);
      await sock.sendText(id_chat, textMessage.figurinhas.emojimix.msgs.espera);

      const bufferMixEmiji = await mixEmojis(emoji1, emoji2);
      const bufferSticker = await criarSticker(bufferMixEmiji.resultado!, {
        pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
        autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
      });

      await sock.sendSticker(id_chat, bufferSticker.resultado!);
      await sock.sendReact(message.key, "✅", id_chat!);
    } catch (err: any) {
      if (!err.erro) throw err;
      await sock.sendText(
        id_chat,
        criarTexto(textMessage?.outros.erro_api || "", command, err.erro),
      );
    }
  },
};

export default command;

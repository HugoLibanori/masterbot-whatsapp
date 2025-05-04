import { proto, downloadMediaMessage } from "baileys";
import fs from "fs";

import { MessageContent, Command, Bot } from "../../../interfaces/interfaces";
import { Socket } from "../../socket/Socket.js";
import { typeMessages } from "../../messages/contentMessage.js";
import { getPathTemp, circleMask, commandErrorMsg } from "../../../lib/utils.js";
import { criarSticker } from "../../../api/sticker.js";
import { UserController } from "../../../controllers/UserController.js";

const userController = new UserController();

const command: Command = {
  name: "s",
  description: "Cria uma figurinha com a imagem ou video enviada.",
  category: "users",
  aliases: ["s", "sticker", "fig", "stk"],
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const inputPathCircleVideo = getPathTemp("mp4");
    const outputPathCircleVideo = getPathTemp("webp");

    try {
      const { id_chat, quotedMsg, type, contentQuotedMsg, media, command, textReceived, sender } =
        messageContent;

      const pack: string | null = await userController.getPack(sender!);
      const author: string | null = await userController.getauthor(sender!);

      const { seconds } = { ...media };

      const { prefix, author_sticker, pack_sticker } = dataBot;

      const dataMsg = {
        type: quotedMsg ? contentQuotedMsg?.type : type,
        message: quotedMsg ? (contentQuotedMsg?.message ?? message) : message,
        seconds: quotedMsg ? contentQuotedMsg?.seconds : seconds,
      };

      if (dataMsg.type !== typeMessages.IMAGE && dataMsg.type !== typeMessages.VIDEO) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }

      if (dataMsg.type === typeMessages.VIDEO && dataMsg.seconds! > 10) {
        await sock.sendText(id_chat, textMessage.figurinhas.s.msgs.erro_video);
        return;
      }

      await sock.sendReact(message.key, "🕒", id_chat!);
      await sock.sendText(id_chat, textMessage.figurinhas.s.msgs.espera);

      let typeSticker = "padrao";
      if (textReceived === "1") typeSticker = "quadrado";
      if (textReceived === "2")
        typeSticker = dataMsg.type === typeMessages.IMAGE ? "circulo" : "circulogif";

      let bufferMidia = await downloadMediaMessage(dataMsg.message, "buffer", {});

      if (typeSticker === "circulogif") {
        fs.writeFileSync(inputPathCircleVideo, bufferMidia);
        await circleMask(inputPathCircleVideo, outputPathCircleVideo).then((buffer: Buffer) => {
          bufferMidia = buffer;
        });
        fs.unlinkSync(inputPathCircleVideo);
        fs.unlinkSync(outputPathCircleVideo);
      }

      const { resultado: resultadoSticker } = await criarSticker(bufferMidia, {
        pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
        autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
        fps: 9,
        tipo: typeSticker,
      });

      await sock.sendSticker(id_chat, resultadoSticker);
      await sock.sendReact(message.key, "✅", id_chat);
    } catch (error) {
      fs.unlinkSync(inputPathCircleVideo);
      fs.unlinkSync(outputPathCircleVideo);
      console.log(error);
    }
  },
};

export default command;

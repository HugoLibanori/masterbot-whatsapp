import { proto } from "baileys";
import twemoji from "twemoji";
import sharp from "sharp";
import axios from "axios";

import { MessageContent, Command, Bot, Resposta } from "../../../interfaces/interfaces.js";
import { Socket } from "../../socket/Socket.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarSticker } from "../../../api/sticker.js";

const userController = new UserController();

const command: Command = {
  name: "emojimg",
  description: "Transfoma um emoji em uma figurinha.",
  category: "users",
  aliases: ["emojimg", "emojiimg", "imgemoji"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, textReceived, sender } = messageContent;
    const { author_sticker, pack_sticker } = dataBot;

    const pack: string | null = await userController.getPack(sender!);
    const author: string | null = await userController.getauthor(sender!);

    try {
      if (!args.length) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }
      await sock.sendReact(message.key, "🕒", id_chat);
      await sock.sendText(id_chat, textMessage.figurinhas.emojimg.msgs.espera);

      const emoji = args[0];
      const resposta = await loadEmojiSvg(emoji);
      const bufferSticker = await criarSticker(resposta.resultado!, {
        pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
        autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
      });

      await sock.sendSticker(id_chat, bufferSticker.resultado);
      await sock.sendReact(message.key, "✅", id_chat);
    } catch (error: any) {
      if (error.erro) throw error;
      await sock.sendText(
        id_chat,
        criarTexto(textMessage?.outros.erro_api || "", command, error.erro),
      );
    }
  },
};

export default command;

const loadEmojiSvg = async (emoji: string): Promise<Resposta> => {
  return new Promise((resolve, reject) => {
    (async () => {
      const codePoint = twemoji.convert.toCodePoint(emoji);
      const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
      const resposta: Resposta = {};
      try {
        const response = await axios.get(url, { responseType: "arraybuffer" }).catch((err: any) => {
          console.log(err);
          resposta.erro = `Emoji ${emoji} não compatível.`;
          reject(resposta);
        });

        if (response) {
          if (response.status === 200) {
            const pngBuffer = await sharp(response.data)
              .png()
              .resize({ width: 512, height: 512 })
              .toBuffer();
            resposta.resultado = pngBuffer;
            resolve(resposta);
          }
        }
      } catch (error: any) {
        console.log(`Erro ao carregar o emoji: ${error.message}`);
        resposta.erro = `Emoji ${emoji} não compatível.`;
        reject(resposta);
      }
    })();
  });
};

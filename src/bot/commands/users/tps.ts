import { proto } from "baileys";
import { createCanvas, loadImage, registerFont } from "canvas";
import twemoji from "twemoji";
import emojiRegex from "emoji-regex";
import path from "path";
import { fileURLToPath } from "url";

import { Socket } from "../../socket/Socket.js";
import { removeBoldCommand, commandErrorMsg } from "../../../lib/utils.js";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarSticker } from "../../../api/sticker.js";

const userController = new UserController();

const regexEmoji = emojiRegex();

const command: Command = {
  name: "tps",
  description: "Cria uma figurinha de texto em imagem.",
  category: "users",
  aliases: ["tps", "ttp"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, textReceived, sender } = messageContent;
    const pack: string | null = await userController.getPack(sender!);
    const author: string | null = await userController.getauthor(sender!);

    const { prefix, author_sticker, pack_sticker } = dataBot;

    if (!args.length) {
      await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
      return;
    }
    const textClean = removeBoldCommand(textReceived);
    await sock.sendReact(message.key, "🕒", id_chat);
    await sock.sendText(id_chat!, textMessage.figurinhas.tps.msgs.espera);
    const imageBuffer = await textoParaFoto(textClean);

    const { resultado: resultadoTps } = await criarSticker(imageBuffer, {
      pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
      autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
      fps: 9,
    });

    await sock.sendSticker(id_chat, resultadoTps);
    await sock.sendReact(message.key, "✅", id_chat);
    return;
  },
};

const loadEmoji = async (char: string) => {
  const codePoint = twemoji.convert.toCodePoint(char);
  if (codePoint.length > 4) {
    try {
      const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoint}.png`;
      const image = await loadImage(url);
      return image;
    } catch (error: string | any) {
      console.log(`Erro ao carregar o emoji: ${char}, URL: ${error.message}`);
      return null;
    }
  } else {
    return null;
  }
};

registerFont(path.resolve(process.cwd(), "src/fonts/impact.ttf"), { family: "impact" });

const textoParaFoto = async (texto: string): Promise<Buffer<ArrayBufferLike>> => {
  try {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");
    const fontColor = "white";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;

    const maxFontSize = 200;
    const minFontSize = 20;
    const margin = 40;
    const letterSpacing = 2;

    let fontSize = maxFontSize;
    const words = texto.split(" ");
    let textFits = false;
    let lines = [];

    const adjustWordSize = async (word: string) => {
      let wordFontSize = fontSize;
      ctx.font = `${wordFontSize}px 'impact'`;

      let wordWidth = ctx.measureText(word).width + (word.length - 1) * letterSpacing;

      while (wordWidth >= canvas.width - margin * 2 && wordFontSize >= minFontSize) {
        wordFontSize--;
        ctx.font = `${wordFontSize}px 'impact'`;
        wordWidth = ctx.measureText(word).width + (word.length - 1) * letterSpacing;
      }

      return wordFontSize;
    };

    while (!textFits && fontSize >= minFontSize) {
      ctx.font = `${fontSize}px 'impact'`;

      lines = [];
      let currentLine = "";

      for (const word of words) {
        fontSize = await adjustWordSize(word);
        ctx.font = `${fontSize}px 'impact'`;

        const testLine = currentLine + word + " ";
        const testLineWidth = ctx.measureText(testLine).width;

        if (testLineWidth > canvas.width - margin * 2) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      }

      lines.push(currentLine.trim());

      const totalTextHeight = lines.length * (fontSize * 1.2);

      if (totalTextHeight <= canvas.height - margin * 2) {
        textFits = true;
      } else {
        fontSize--;
      }
    }

    const lineHeight = fontSize * 1.2;
    const startY = (canvas.height - lines.length * lineHeight) / 2;

    ctx.font = `${fontSize}px 'impact'`;
    ctx.fillStyle = fontColor;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineY = startY + i * lineHeight;
      let x = margin;

      for (const char of [...line]) {
        if (regexEmoji.test(char)) {
          const emojiImage = await loadEmoji(char);
          if (emojiImage) {
            const size = fontSize;
            ctx.drawImage(emojiImage, x, lineY, size, size);
            x += size;
            continue;
          }
        }

        const charWidth = ctx.measureText(char).width;
        ctx.strokeText(char, x, lineY);
        ctx.fillText(char, x, lineY);
        x += charWidth + letterSpacing;
      }
    }

    const imageBuffer = canvas.toBuffer("image/png");
    return imageBuffer;
  } catch (err: any) {
    console.log(err.message, "STICKER textoParaFoto");
    throw new Error("Erro na conversão de texto para imagem.");
  }
};

export default command;

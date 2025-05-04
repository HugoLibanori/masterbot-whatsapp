import { proto } from "baileys";
import { createCanvas, CanvasRenderingContext2D, registerFont } from "canvas";
import emojiRegex from "emoji-regex";
import path from "path";
import GIFEncoder from "gifencoder";
import fs from "fs";

import { Socket } from "../../socket/Socket.js";
import { removeBoldCommand, commandErrorMsg } from "../../../lib/utils.js";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarSticker } from "../../../api/sticker.js";

const userController = new UserController();

const regexEmoji = emojiRegex();

const command: Command = {
  name: "atps",
  description: "Cria uma figurinha de texto em video animado.",
  category: "users",
  aliases: ["atps", "attp"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, textReceived, sender } = messageContent;
    try {
      const pack: string | null = await userController.getPack(sender!);
      const author: string | null = await userController.getauthor(sender!);

      const { prefix, author_sticker, pack_sticker } = dataBot;

      if (!args.length) {
        await sock.sendText(id_chat, commandErrorMsg(command!, dataBot));
        return;
      }
      const textClean = removeBoldCommand(textReceived);
      await sock.sendReact(message.key, "🕒", id_chat);
      await sock.sendText(id_chat, textMessage.figurinhas.atps.msgs.espera);
      const imageBuffer = await textoParaWebp(textClean);

      const { resultado: resultadoTps } = await criarSticker(imageBuffer, {
        pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
        autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
        fps: 9,
      });

      await sock.sendSticker(id_chat, resultadoTps);
      await sock.sendReact(message.key, "✅", id_chat);
      return;
    } catch (error) {
      console.log(error);
      await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
    }
  },
};

registerFont(path.resolve(process.cwd(), "src/fonts/impact.ttf"), { family: "impact" });

const textoParaWebp = async (texto: string): Promise<Buffer> => {
  try {
    const output = path.resolve("animated.webp");
    const encoder = new GIFEncoder(512, 512);
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Configurar o encoder para gerar um GIF
    const stream = encoder.createReadStream();
    const writeStream = fs.createWriteStream(output);
    stream.pipe(writeStream);

    encoder.start();
    encoder.setRepeat(0); // Loop infinito
    encoder.setDelay(200); // Tempo de delay entre frames (em milissegundos)
    encoder.setQuality(10); // Qualidade do GIF
    encoder.setTransparent("#0x00000000");

    const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

    const words = texto.split(" ");
    let fontSize = 200;
    const minFontSize = 20;
    const margin = 30;

    let textFits = false;
    let lines = [];

    // Ajustar o tamanho da fonte até que o texto caiba
    while (!textFits && fontSize >= minFontSize) {
      ctx.font = `${fontSize}px 'impact'`;

      lines = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + " " + word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > canvas.width - margin * 2) {
          lines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      lines.push(currentLine.trim());

      const totalTextHeight = lines.length * (fontSize * 1.2); // altura total do texto
      if (totalTextHeight <= canvas.height - margin * 2) {
        textFits = true;
      } else {
        fontSize--;
      }
    }

    const lineHeight = fontSize * 1.2;

    // Ajustar a posição Y para centralizar o texto
    const startY = (canvas.height - lines.length * lineHeight) / 2;

    // Desenhar as linhas de texto
    for (const color of colors) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px impact`;

      // Desenhar cada linha
      lines.forEach((line, index) => {
        const lineY = startY + index * lineHeight; // Calcula a posição Y de cada linha
        ctx.strokeText(line, canvas.width / 2, lineY + ctx.lineWidth / 2);
        ctx.fillText(line, canvas.width / 2, lineY + ctx.lineWidth / 2);
      });

      encoder.addFrame(ctx);
    }

    encoder.finish();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        const buffer = fs.readFileSync(output);
        fs.unlinkSync(output);
        resolve(buffer);
      });
      writeStream.on("error", (err) => {
        reject(new Error("Erro na gravação do arquivo WebP."));
      });
    });
  } catch (err) {
    console.log(err, "Erro na conversão de texto para WebP.");
    throw new Error("Erro na conversão de texto para WebP.");
  }
};

export default command;

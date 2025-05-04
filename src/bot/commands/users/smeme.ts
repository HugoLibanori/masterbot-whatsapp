import { proto, downloadMediaMessage } from "baileys";
import { createCanvas, loadImage, registerFont } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { join } from "path";
import path from "path";
import fs from "fs";

import { MessageContent, Command, Bot, Resposta } from "../../../interfaces/interfaces.js";
import { Socket } from "../../socket/Socket.js";
import { typeMessages } from "../../messages/contentMessage.js";
import { commandErrorMsg, getPathTemp } from "../../../lib/utils.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarSticker } from "../../../api/sticker.js";

const userController = new UserController();

const command: Command = {
  name: "smeme",
  description: "Adiciona textos em imagens e videos.",
  category: "users",
  aliases: ["smeme"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { id_chat, command, textReceived, quotedMsg, contentQuotedMsg, type, media, sender } =
      messageContent;
    const { seconds, mimetype } = { ...media };

    const { author_sticker, pack_sticker } = dataBot;

    const pack: string | null = await userController.getPack(sender!);
    const author: string | null = await userController.getauthor(sender!);

    const dataMsg = {
      type: quotedMsg ? contentQuotedMsg?.type : type,
      message: quotedMsg ? (contentQuotedMsg?.message ?? message) : message,
      seconds: quotedMsg ? contentQuotedMsg?.seconds : seconds,
      mimetype: quotedMsg ? contentQuotedMsg?.mimetype : mimetype,
    };
    try {
      if (!args.length) {
        await sock.sendText(id_chat, commandErrorMsg(command, dataBot));
        return;
      }

      const [textTop, textBottom] = textReceived!.split(", ");

      if (!textTop && !textBottom) {
        await sock.sendText(id_chat!, commandErrorMsg(command, dataBot));
        return;
      }

      if (dataMsg.type !== typeMessages.IMAGE && dataMsg.type !== typeMessages.VIDEO) {
        await sock.sendText(id_chat!, textMessage.figurinhas.smeme.msgs.erro);
        return;
      }

      await sock.sendReact(message.key, "🕒", id_chat);
      await sock.sendText(id_chat, textMessage.figurinhas.smeme.msgs.espera);

      const isImage = dataMsg.mimetype === "image/jpeg" || dataMsg.mimetype === "image/png";
      const bufferSticker = await downloadMediaMessage(dataMsg.message, "buffer", {});

      const outputPath = getPathTemp("mp4");

      const bufferMeme = isImage
        ? await addTextToImage(bufferSticker, textTop?.trim(), textBottom?.trim())
        : await addTextToVideo(bufferSticker, textTop?.trim(), textBottom?.trim(), outputPath);

      const { resultado: resultadoSticker } = await criarSticker(bufferMeme.resultado!, {
        pack: pack ? (pack ? pack?.trim() : pack_sticker?.trim()) : pack_sticker?.trim(),
        autor: author ? (author ? author?.trim() : author_sticker?.trim()) : author_sticker?.trim(),
      });

      await sock.sendSticker(id_chat, resultadoSticker);
      await sock.sendReact(message.key, "✅", id_chat);
    } catch (error) {
      console.log(error);
    }
  },
};

export default command;

registerFont(path.resolve(process.cwd(), "src/fonts/impact.ttf"), { family: "impact" });

// Função principal para adicionar o texto à imagem
async function addTextToImage(
  imageBuffer: Buffer,
  topText: string,
  bottomText: string,
): Promise<Resposta> {
  const image = await loadImage(imageBuffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  const resposta: Resposta = {};

  ctx.drawImage(image, 0, 0);

  ctx.fillStyle = "white";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.textAlign = "center";

  // Ajustar texto superior
  if (topText) {
    let fontSize = 100; // Tamanho inicial da fonte
    ctx.font = `${fontSize}px Impact`;
    let textWidth = ctx.measureText(topText).width;

    // Reduzir o tamanho da fonte até o texto caber em uma linha
    while (textWidth > image.width - 20 && fontSize > 10) {
      fontSize -= 2;
      ctx.font = `${fontSize}px Impact`;
      textWidth = ctx.measureText(topText).width;
    }

    ctx.strokeText(topText, image.width / 2, fontSize + 10);
    ctx.fillText(topText, image.width / 2, fontSize + 10);
  }

  // Ajustar texto inferior
  if (bottomText) {
    let fontSize = 100; // Tamanho inicial da fonte
    ctx.font = `${fontSize}px Impact`;
    let textWidth = ctx.measureText(bottomText).width;

    // Reduzir o tamanho da fonte até o texto caber em uma linha
    while (textWidth > image.width - 20 && fontSize > 10) {
      fontSize -= 2;
      ctx.font = `${fontSize}px Impact`;
      textWidth = ctx.measureText(bottomText).width;
    }

    ctx.strokeText(bottomText, image.width / 2, image.height - fontSize / 2 - 10);
    ctx.fillText(bottomText, image.width / 2, image.height - fontSize / 2 - 10);
  }

  resposta.resultado = canvas.toBuffer("image/png");

  return resposta;
}

// Função para calcular a largura do texto baseado no tamanho da fonte e ajustar dinamicamente
function calculateFontSize(videoWidth: number, text: string) {
  let fontSize = 100; // Tamanho inicial da fonte
  const maxFontSize = 50;
  const minFontSize = 10;
  const textLength = text.length;

  // Diminuir a fonte conforme o comprimento do texto aumenta
  while (fontSize > minFontSize) {
    if (textLength * fontSize <= videoWidth * 2) {
      // Limite para 90% da largura do vídeo
      break;
    }
    fontSize -= 2;
  }
  return Math.min(maxFontSize, fontSize); // Garantir que não passe do tamanho máximo
}

// Função para adicionar o texto ao vídeo
function addTextToVideo(
  videoBuffer: Buffer,
  topText: string,
  bottomText: string,
  outputPath: string,
): Promise<Resposta> {
  return new Promise((resolve, reject) => {
    const tmpVideoPath = join(tmpdir(), `${Date.now()}_input.mp4`);
    fs.writeFileSync(tmpVideoPath, videoBuffer);

    const resposta: Resposta = {};

    const fontPath = path.resolve(process.cwd(), "src/fonts/impact.ttf");

    // Obter dimensões do vídeo para calcular ajuste da fonte
    ffmpeg.ffprobe(tmpVideoPath, (err, metadata) => {
      if (err) {
        reject(`Error processing video: ${err.message}`);
      }

      const videoWidth = metadata.streams[0].width;

      const videoFilters = [];

      // Adicionar texto no topo se estiver presente
      if (topText) {
        const topFontSize = calculateFontSize(videoWidth!, topText);
        videoFilters.push(
          `drawtext=text='${topText}':fontsize=${topFontSize}:fontfile=${fontPath
            .replace("C:", "")
            .replaceAll(
              "\\",
              "/",
            )}:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=10`,
        );
      }

      // Adicionar texto na parte de baixo se estiver presente
      if (bottomText) {
        const bottomFontSize = calculateFontSize(videoWidth!, bottomText);
        videoFilters.push(
          `drawtext=text='${bottomText}':fontsize=${bottomFontSize}:fontfile=${fontPath
            .replace("C:", "")
            .replaceAll(
              "\\",
              "/",
            )}:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-th-10`,
        );
      }
      ffmpeg(tmpVideoPath)
        .inputOptions("-t 10")
        .videoFilter(videoFilters)
        .output(outputPath)
        .on("start", function () {
          console.log("Video convertido");
        })
        .on("error", function (err) {
          fs.unlinkSync(tmpVideoPath);
          reject(`Error processing video: ${err.message}`);
        })
        .on("end", function () {
          resposta.resultado = fs.readFileSync(outputPath);
          fs.unlinkSync(tmpVideoPath);
          resolve(resposta);
        })
        .run();
    });
  });
}

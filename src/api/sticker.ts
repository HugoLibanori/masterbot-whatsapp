import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import sharp from "sharp";
import crypto from "node:crypto";
import webp from "node-webpmux";
import { fileTypeFromBuffer } from "file-type";
import jimp from "jimp";
import getEmojiMixUrl, { checkSupported } from "emoji-mixer";
import axios, { AxiosRequestConfig } from "axios";
import FormData from "form-data";

import { getPathTemp, getRandomFilename } from "../lib/utils.js";
import { Resposta } from "../interfaces/interfaces.js";

export const StickerTipos = {
  CIRCULO: "circulo",
  PADRAO: "padrao",
};

export const criarSticker = async (
  bufferMidia: Buffer,
  { pack = "M@ste® Bot", autor = "M@ste® Bot Stickers", fps = 9, tipo = "padrao" },
): Promise<{ resultado: Buffer; erro?: string }> => {
  try {
    const bufferSticker = await criateSticker(bufferMidia, { pack, autor, fps, tipo });

    return { resultado: bufferSticker };
  } catch (err: any) {
    console.log(`API criarSticker - ${err.message}`);
    throw { erro: "Houve um erro na criação de sticker." };
  }
};

export const convertionWebP = (
  buffer: Buffer,
  midiaAnimada: boolean,
  fps: number,
  tipo: string,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        let caminhoEntrada: string;
        let opcoesFfmpeg;
        const caminhoSaida = getPathTemp("webp");

        if (midiaAnimada && tipo === "quadrado") {
          const pathVideoCortado = getPathTemp("mp4");
          fs.writeFileSync(pathVideoCortado, buffer);
          caminhoEntrada = await cropVideo(pathVideoCortado);
          opcoesFfmpeg = [
            "-vcodec",
            "libwebp",
            "-vf",
            // eslint-disable-next-line no-useless-escape
            `scale=\'iw*min(200/iw\,200/ih)\':\'ih*min(200/iw\,200/ih)\',format=rgba,pad=200:200:\'(200-iw)/2\':\'(200-ih)/2\':\'#00000000\',setsar=1,fps=${fps}`,
            "-loop",
            "0",
            "-ss",
            "00:00:00.0",
            "-t",
            "00:00:10.0",
            "-preset",
            "default",
            "-an",
            "-vsync",
            "0",
            "-s",
            "512:512",
            "-quality",
            "50", // Reduzindo ainda mais a qualidade
            "-b:v",
            "400K", // Reduzindo a taxa de bits
            "-compression_level",
            "6", // Máximo nível de compressão
            "-fs",
            "1000000",
          ];
        } else if (midiaAnimada) {
          caminhoEntrada = getPathTemp("mp4");
          opcoesFfmpeg = [
            "-vcodec",
            "libwebp",
            "-vf",
            // eslint-disable-next-line no-useless-escape
            `scale=\'iw*min(200/iw\,200/ih)\':\'ih*min(200/iw\,200/ih)\',format=rgba,pad=200:200:\'(200-iw)/2\':\'(200-ih)/2\':\'#00000000\',setsar=1,fps=${fps}`,
            "-loop",
            "0",
            "-ss",
            "00:00:00.0",
            "-t",
            "00:00:10.0",
            "-preset",
            "default",
            "-an",
            "-vsync",
            "0",
            "-s",
            "512:512",
            "-quality",
            "50", // Reduzindo ainda mais a qualidade
            "-b:v",
            "400K", // Reduzindo a taxa de bits
            "-compression_level",
            "6", // Máximo nível de compressão
            "-fs",
            "1000000",
          ];
          fs.writeFileSync(caminhoEntrada, buffer);
        } else {
          caminhoEntrada = getPathTemp("png");
          buffer = await convertWebpToPng(buffer);
          buffer = await edicaoImagem(buffer, tipo);
          opcoesFfmpeg = ["-vcodec libwebp", "-loop 0", "-lossless 1", "-q:v 100"];
          fs.writeFileSync(caminhoEntrada, buffer);
        }

        ffmpeg(caminhoEntrada)
          .outputOptions(opcoesFfmpeg)
          .save(caminhoSaida)
          .on("end", async () => {
            const buffer = fs.readFileSync(caminhoSaida);
            fs.unlinkSync(caminhoSaida);
            fs.unlinkSync(caminhoEntrada);
            resolve(buffer);
          })
          .on("error", async (err) => {
            fs.unlinkSync(caminhoEntrada);
            console.log(err);
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    })();
  });
};

export const criateSticker = async (
  buffer: Buffer,
  { autor = "M@ste® Bot", pack = "M@ste® Bot Stickers", fps = 9, tipo = "padrao" },
) => {
  const file = await fileTypeFromBuffer(buffer);

  if (file) {
    const { mime } = file;
    if (mime !== "image/webp") {
      const midiaVideo = mime.startsWith("video");
      const midiaAnimada = midiaVideo || mime.includes("gif");
      const bufferWebp = await convertionWebP(buffer, midiaAnimada, fps, tipo);
      return await addExif(bufferWebp, pack, autor);
    }
    return await addExif(buffer, pack, autor);
  }
};

export const convertWebpToPng = async (buffer: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .png()
      .toBuffer()
      .then((pnggBuffer) => {
        resolve(pnggBuffer);
      })
      .catch((err) => {
        reject(err);
        console.error("Erro ao converter para PNG:", err);
      });
  });
};

export async function addExif(buffer: Buffer, pack: string, autor: string) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString("hex");
  const json = {
    "sticker-pack-id": stickerPackId,
    "sticker-pack-name": pack,
    "sticker-pack-publisher": autor,
  };
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.load(buffer);
  img.exif = exif;
  return await img.save(null);
}

export const cropVideo = (caminho: string): Promise<string> => {
  const output = getPathTemp("mp4");
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(caminho, (err, metadata) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const stream = metadata.streams[0];
        try {
          if (stream && stream.width && stream.height) {
            const menorLado = Math.min(stream.width, stream.height);
            const x = (stream.width - menorLado) / 2;
            const y = (stream.height - menorLado) / 2;
            ffmpeg(caminho)
              .outputOptions([`-vf crop=${menorLado}:${menorLado}:${x}:${y}`])
              .videoCodec("libx264")
              .audioCodec("libmp3lame")
              .format("mp4")
              .save(output)
              .on("end", () => {
                resolve(output);
              })
              .on("error", (erro) => {
                console.log("ERRO DENTRO DO FFMPEG:", erro);
                reject();
              });
          } else {
            reject(new Error("Não foi possível obter a largura e a altura do vídeo."));
          }
        } catch (erro) {
          console.log(erro);
        }
      }
    });
  });
};

async function edicaoImagem(buffer: Buffer, tipo: string) {
  const image = await jimp.read(buffer);
  switch (tipo) {
    case "circulo":
      image.resize(512, 512);
      image.circle();
      break;
    case "auto":
      image.contain(512, 512, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE);
      break;
    case "padrao":
      image.contain(512, 512, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE);
      break;
    default:
      image.contain(512, 512, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE);
      break;
  }
  return await image.getBufferAsync("image/png");
}

export const renomearSticker = (
  bufferSticker: Buffer,
  pack: string,
  autor: string,
): Promise<Resposta> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const resposta: Resposta = {};
        await addExif(bufferSticker, pack, autor)
          .then((bufferSticker) => {
            resposta.resultado = bufferSticker;
            resolve(resposta);
          })
          .catch(() => {
            resposta.erro = "Houve um erro ao renomear o sticker.";
            reject(resposta);
          });
      } catch (err: any) {
        console.log(`API renomearSticker - ${err.message}`);
        reject({ erro: "Houve um erro ao renomear o sticker." });
      }
    })();
  });
};

export const stickerFroImage = (bufferSticker: Buffer): Promise<Resposta> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const resposta: Resposta = {};
        const entradaWebp = getPathTemp("webp");
        const saidaPng = getPathTemp("png");
        fs.writeFileSync(entradaWebp, bufferSticker);
        ffmpeg(entradaWebp)
          .save(saidaPng)
          .on("end", () => {
            const bufferImagem = fs.readFileSync(saidaPng);
            fs.unlinkSync(entradaWebp);
            fs.unlinkSync(saidaPng);
            resposta.resultado = bufferImagem;
            resolve(resposta);
          })
          .on("error", () => {
            resposta.erro = "Houve um erro ao converter o sticker para imagem";
            reject(resposta);
          });
      } catch (err: any) {
        console.log(`API stickerParaImagem - ${err.message}`);
        reject({ erro: "Houve um erro ao converter o sticker para imagem" });
      }
    })();
  });
};

export const mixEmojis = async (emoji1: string, emoji2: string): Promise<Resposta> => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const resposta: Resposta = {};
        const suporteEmoji1 = checkSupported(emoji1, true),
          suporteEmoji2 = checkSupported(emoji2, true);
        if (!suporteEmoji1 || !suporteEmoji2) {
          if (!suporteEmoji1) resposta.erro = `${emoji1} não é válido para a união.`;
          if (!suporteEmoji2 && suporteEmoji1)
            resposta.erro = `${emoji2} não é válido para a união`;
          if (!suporteEmoji2 && !suporteEmoji1)
            resposta.erro = `${emoji1} e ${emoji2} não são válidos para a união.`;
          reject(resposta);
        }
        const emojiUrl = getEmojiMixUrl(emoji1, emoji2, false, true);
        if (emojiUrl != undefined) {
          await axios
            .get(emojiUrl, { responseType: "arraybuffer" })
            .then(({ data }) => {
              resposta.resultado = data;
              resolve(resposta);
            })
            .catch(() => {
              resposta.erro = "Houve um erro no download do emoji";
              reject(resposta);
            });
        } else {
          resposta.erro = "Emojis não compatíveis para união";
          reject(resposta);
        }
      } catch (err: any) {
        console.log(`API misturarEmojis- ${err.message}`);
        reject({ erro: "Emojis não compatíveis" });
      }
    })();
  });
};

export const removeBackground = async (imageBuffer: Buffer) => {
  try {
    const URL_BASE_UPLOAD_IMAGE = "https://download1.imageonline.co/ajax_upload_file.php";
    const URL_BASE_REMOVE_BG = "https://download1.imageonline.co/pngmaker.php";
    const uploadFileName = getRandomFilename("png");
    const formDataUpload = new FormData();
    formDataUpload.append("files", imageBuffer, { filename: uploadFileName });
    const configUpload: AxiosRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: URL_BASE_UPLOAD_IMAGE,
      headers: {
        "User-Agent":
          " Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        Accept: " */*",
        Origin: " https://imageonline.co",
        Connection: " keep-alive",
        Referer: " https://imageonline.co/",
        "Sec-Fetch-Dest": " empty",
        "Sec-Fetch-Mode": " cors",
        "Sec-Fetch-Site": " same-site",
        ...formDataUpload.getHeaders(),
      },
      data: formDataUpload,
      responseType: "json",
    };

    const { data: uploadResponse } = await axios.request(configUpload);

    if (!uploadResponse.isSuccess) {
      throw new Error("Upload failed");
    }

    const formDataRemoveBg = new FormData();
    formDataRemoveBg.append("name", uploadResponse.files[0].name);
    formDataRemoveBg.append("originalname", uploadResponse.files[0].old_name);
    formDataRemoveBg.append("option3", uploadResponse.files[0].extension);
    formDataRemoveBg.append("option4", "1");
    const configRemoveBg = {
      method: "post",
      maxBodyLength: Infinity,
      url: URL_BASE_REMOVE_BG,
      headers: {
        "User-Agent":
          " Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
        Accept: " */*",
        Origin: " https://imageonline.co",
        Connection: " keep-alive",
        Referer: " https://imageonline.co/",
        "Sec-Fetch-Dest": " empty",
        "Sec-Fetch-Mode": " cors",
        "Sec-Fetch-Site": " same-site",
      },
      data: formDataRemoveBg,
    };

    const { data: removeBgResponse } = await axios.request(configRemoveBg);
    const pictureUrl = removeBgResponse.match(
      /https:\/\/download1\.imageonline\.co\/download\.php\?filename=[A-Za-z0-9]+-imageonline\.co-[0-9]+\.png/m,
    )[0];
    const { data: imageBufferRemovedBg } = await axios.get(pictureUrl, {
      responseType: "arraybuffer",
    });

    return imageBufferRemovedBg as Buffer;
  } catch (err: any) {
    console.log(err, "removeBackground");
    throw new Error(err);
  }
};
